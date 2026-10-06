import { Link } from 'react-router-dom';
import { useCartStore, selectCartCount } from '../../store/useCartStore';
import { toastService, errMsg } from '../../services/toastService';
import { productImage } from '../../utils/productImage';

const fmt = (n) =>
  n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) : '—';

const unitPrice = (p) => p?.discount_price ?? p?.price ?? 0;

// Mini giỏ hàng thả xuống dưới icon giỏ ở header (CustomerLayout điều khiển open/close)
const CartPopup = ({ onClose }) => {
  const items      = useCartStore(s => s.items);
  const count      = useCartStore(selectCartCount);
  const removeItem = useCartStore(s => s.removeItem);

  const total = items.reduce((sum, i) => sum + unitPrice(i.product) * i.quantity, 0);

  const handleRemove = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await removeItem(productId);
    } catch (err) {
      toastService.error(errMsg(err));
    }
  };

  return (
    <div className="absolute right-0 top-12 w-80 bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] shadow-xl z-50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#101b0d] dark:text-white">Giỏ hàng ({count})</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-[#101b0d] dark:hover:text-white transition-colors">
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <div className="px-4 py-8 flex flex-col items-center gap-2 text-gray-400">
          <span className="material-symbols-outlined text-[36px]">production_quantity_limits</span>
          <p className="text-sm">Giỏ hàng của bạn đang trống</p>
        </div>
      ) : (
        <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-white/10">
          {items.map(item => {
            const img = productImage(item.product);
            return (
            <Link
              key={item.product_id}
              to={item.product?.slug ? `/san-pham/${item.product.slug}` : '/gio-hang'}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[#f6faf5] dark:hover:bg-white/5 transition-colors"
            >
              {/* Ảnh chính */}
              <div className="size-12 rounded-lg bg-[#e9f3e7] dark:bg-white/10 bg-cover bg-center shrink-0 flex items-center justify-center"
                style={img ? { backgroundImage: `url("${img}")` } : {}}>
                {!img && <span className="material-symbols-outlined text-[#d3e7cf]">eco</span>}
              </div>
              {/* Tên + số lượng × giá */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#101b0d] dark:text-white truncate">{item.product?.name ?? `Sản phẩm #${item.product_id}`}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.quantity} × <span className="font-semibold text-[#2E7D32] dark:text-primary">{fmt(unitPrice(item.product))}</span>
                </p>
              </div>
              {/* Xoá */}
              <button
                onClick={(e) => handleRemove(e, item.product_id)}
                title="Xóa khỏi giỏ"
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </Link>
            );
          })}
        </div>
      )}

      {/* Footer */}
      {items.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Tạm tính</span>
            <span className="text-base font-black text-[#101b0d] dark:text-white">{fmt(total)}</span>
          </div>
          <Link
            to="/gio-hang"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary hover:bg-[#3ed622] text-[#101b0d] text-sm font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
            Xem giỏ hàng
          </Link>
        </div>
      )}
    </div>
  );
};

export default CartPopup;
