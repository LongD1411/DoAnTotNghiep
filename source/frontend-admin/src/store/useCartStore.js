import { create } from 'zustand';
import { getCurrentUser } from '../services/authService';
import { getCart, addCartItem, updateCartItem, removeCartItem, syncCart } from '../services/cartService';
import { productImage } from '../utils/productImage';

// ── Giỏ guest (chưa đăng nhập) — lưu localStorage ────────────────────────────────
const GUEST_KEY = 'guest_cart';
const readGuest  = () => { try { return JSON.parse(localStorage.getItem(GUEST_KEY)) ?? []; } catch { return []; } };
const writeGuest = (items) => localStorage.setItem(GUEST_KEY, JSON.stringify(items));

// Snapshot sản phẩm đủ để render giỏ mà không cần fetch lại (khớp shape CartOutput của backend)
const toSnapshot = (p) => ({
  id:             p.id,
  name:           p.name,
  slug:           p.slug,
  price:          p.price,
  discount_price: p.discount_price ?? null,
  unit:           p.unit,
  stock:          p.stock,
  image_url:      productImage(p),
});

const isAuthed = () => !!getCurrentUser();

// items: [{ product_id, quantity, product: {...} }] — cùng shape cho cả guest & server
export const useCartStore = create((set, get) => ({
  items:  [],
  loaded: false,

  // Nạp giỏ: đăng nhập → server; guest → localStorage. Gọi ở CustomerLayout (idempotent).
  init: async () => {
    if (get().loaded) return;
    if (isAuthed()) {
      try {
        const res = await getCart();
        set({ items: res.data.data.items, loaded: true });
      } catch {
        set({ loaded: true }); // lỗi mạng/token — không chặn UI
      }
    } else {
      set({ items: readGuest(), loaded: true });
    }
  },

  // Thêm sản phẩm (cộng dồn nếu đã có, chặn trần theo stock). Throw để page toast lỗi.
  addItem: async (product, quantity = 1) => {
    if (isAuthed()) {
      const res = await addCartItem(product.id, quantity);
      set({ items: res.data.data.items, loaded: true });
      return;
    }
    const items = [...get().items];
    const stock = product.stock ?? Infinity;
    const idx = items.findIndex(i => i.product_id === product.id);
    if (idx >= 0) items[idx] = { ...items[idx], quantity: Math.min(items[idx].quantity + quantity, stock) };
    else items.push({ product_id: product.id, quantity: Math.min(quantity, stock), product: toSnapshot(product) });
    writeGuest(items);
    set({ items });
  },

  // Đặt lại số lượng 1 item
  updateQty: async (productId, quantity) => {
    if (isAuthed()) {
      const res = await updateCartItem(productId, quantity);
      set({ items: res.data.data.items });
      return;
    }
    const items = get().items.map(i =>
      i.product_id === productId
        ? { ...i, quantity: Math.min(Math.max(1, quantity), i.product?.stock ?? Infinity) }
        : i,
    );
    writeGuest(items);
    set({ items });
  },

  // Bỏ 1 sản phẩm khỏi giỏ
  removeItem: async (productId) => {
    if (isAuthed()) {
      const res = await removeCartItem(productId);
      set({ items: res.data.data.items });
      return;
    }
    const items = get().items.filter(i => i.product_id !== productId);
    writeGuest(items);
    set({ items });
  },

  // Gọi NGAY SAU khi đăng nhập thành công: merge giỏ guest vào giỏ user rồi xoá bản local.
  // Nuốt lỗi — không được làm fail flow đăng nhập.
  syncAfterLogin: async () => {
    try {
      const guest = readGuest();
      const res = guest.length
        ? await syncCart(guest.map(i => ({ product_id: i.product_id, quantity: i.quantity })))
        : await getCart();
      localStorage.removeItem(GUEST_KEY);
      set({ items: res.data.data.items, loaded: true });
    } catch { /* bỏ qua — giỏ sẽ nạp lại ở lần init sau */ }
  },

  // Gọi khi đăng xuất: quay về giỏ guest (localStorage)
  reset: () => set({ items: readGuest(), loaded: false }),
}));

// Selector: tổng số lượng hiển thị trên badge
export const selectCartCount = (state) => state.items.reduce((sum, i) => sum + i.quantity, 0);
