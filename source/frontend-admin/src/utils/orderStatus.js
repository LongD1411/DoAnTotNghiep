// Nhãn + màu trạng thái đơn hàng — dùng chung cho danh sách đơn (ProfilePage) và chi tiết đơn
// (OrderSuccessPage). Khớp enum backend (order.input.js).

export const ORDER_STATUS_LABEL = {
  pending:    { label: 'Chờ xử lý',   dot: 'bg-amber-500',  cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  approved:   { label: 'Đã xác nhận', dot: 'bg-blue-500',   cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  delivering: { label: 'Đang giao',   dot: 'bg-indigo-500', cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  delivered:  { label: 'Đã giao',     dot: 'bg-green-500',  cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  completed:  { label: 'Hoàn tất',    dot: 'bg-green-500',  cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  cancelled:  { label: 'Đã huỷ',      dot: 'bg-red-500',    cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export const PAYMENT_STATUS_LABEL = {
  unpaid:   { label: 'Chưa thanh toán', cls: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300' },
  paid:     { label: 'Đã thanh toán',   cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  refunded: { label: 'Đã hoàn tiền',    cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

export const PAYMENT_METHOD_LABEL = {
  cod:           'Thanh toán khi nhận hàng (COD)',
  bank_transfer: 'Chuyển khoản ngân hàng',
};
