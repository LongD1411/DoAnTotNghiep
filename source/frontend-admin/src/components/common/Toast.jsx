import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { toastService } from '../../services/toastService';

// ─── Icon per type ────────────────────────────────────────────────────────────
const ICON = {
  success: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
    </svg>
  ),
};

const COLORS = {
  success: 'bg-green-600 text-white',
  error:   'bg-red-600   text-white',
  warning: 'bg-amber-500 text-white',
  info:    'bg-blue-600  text-white',
};

// ─── Single toast item ────────────────────────────────────────────────────────
const ToastItem = ({ toast }) => {
  const [leaving, setLeaving] = useState(false);

  const dismiss = useCallback(() => {
    setLeaving(true);
    setTimeout(() => toastService.dismiss(toast.id), 300);
  }, [toast.id]);

  useEffect(() => {
    const t = setTimeout(dismiss, toast.duration);
    return () => clearTimeout(t);
  }, [dismiss, toast.duration]);

  return (
    <div
      className={`
        relative flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg
        min-w-[280px] max-w-[400px] overflow-hidden
        ${COLORS[toast.type]}
        transition-all duration-300
        ${leaving ? 'opacity-0 translate-x-12 pointer-events-none' : 'opacity-100 translate-x-0'}
      `}
    >
      <span className="mt-0.5">{ICON[toast.type]}</span>

      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>

      <button
        onClick={dismiss}
        className="mt-0.5 opacity-70 hover:opacity-100 transition-opacity"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <span
        className="absolute bottom-0 left-0 h-1 bg-white/40 rounded-b-xl"
        style={{ animation: `toast-progress ${toast.duration}ms linear forwards` }}
      />
    </div>
  );
};

// ─── Toast container — subscribe vào module-level state ───────────────────────
const Toast = () => {
  // Khởi tạo từ _snapshot() để pick up toast được dispatch trong lúc navigate
  const [toasts, setToasts] = useState(() => toastService._snapshot());

  useEffect(() => {
    const unsub = toastService._subscribe(setToasts);
    return unsub;
  }, []);

  if (!toasts.length) return null;

  return createPortal(
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>,
    document.body
  );
};

export default Toast;
