// Ảnh chính của sản phẩm — dùng chung cho mọi nơi hiển thị thumbnail sản phẩm (giỏ hàng,
// popup giỏ, thanh toán...). Ưu tiên image_url (ảnh đại diện = ảnh đầu khi upload), fallback
// ảnh đầu tiên trong gallery `images` (đã sort theo order ở backend). Trả null nếu không có ảnh.
export const productImage = (p) => p?.image_url ?? p?.images?.[0]?.url ?? null;
