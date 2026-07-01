// State toast lưu ở module level — tồn tại qua mọi navigation/unmount.
let _listeners = [];
let _id = 0;
let _toasts = [];

const _notify = () => {
  const snapshot = [..._toasts];
  _listeners.forEach(fn => fn(snapshot));
};

export const toastService = {
  /** Toast component dùng để subscribe — trả về unsubscribe fn */
  _subscribe(fn) {
    _listeners.push(fn);
    return () => { _listeners = _listeners.filter(l => l !== fn); };
  },

  /** Khởi tạo state khi Toast mới mount */
  _snapshot() {
    return [..._toasts];
  },

  /** Xóa một toast theo id (gọi sau animation leave) */
  dismiss(id) {
    _toasts = _toasts.filter(t => t.id !== id);
    _notify();
  },

  show(type, message, duration = 4000) {
    const toast = { id: ++_id, type, message, duration };
    _toasts = [..._toasts, toast];
    _notify();
  },

  success: (msg, dur) => toastService.show('success', msg, dur),
  error:   (msg, dur) => toastService.show('error',   msg, dur),
  warning: (msg, dur) => toastService.show('warning', msg, dur),
  info:    (msg, dur) => toastService.show('info',    msg, dur),
};

/** Helper trích message từ Axios error */
export const errMsg = (err, fallback = 'Đã xảy ra lỗi, vui lòng thử lại') =>
  err?.response?.data?.message || fallback;