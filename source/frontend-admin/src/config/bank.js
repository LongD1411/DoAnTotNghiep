// Tài khoản nhận chuyển khoản (hiển thị ở màn hướng dẫn thanh toán).
// Đặt giá trị THẬT qua biến môi trường VITE_BANK_* trong frontend-admin/.env — giá trị dưới chỉ là
// placeholder cho dev. Tên chủ TK nên IN HOA, không dấu để khớp hiển thị ngân hàng.
export const BANK = {
  bin:     import.meta.env.VITE_BANK_BIN     || '970436',       // 970436 = Vietcombank (mã Napas)
  name:    import.meta.env.VITE_BANK_NAME    || 'Vietcombank',
  account: import.meta.env.VITE_BANK_ACCOUNT || '0000000000',   // ⚠️ đặt số thật ở .env.local (VITE_BANK_ACCOUNT)
  holder:  import.meta.env.VITE_BANK_HOLDER  || 'CHU TAI KHOAN',  // ⚠️ đặt tên thật ở .env.local (VITE_BANK_HOLDER)
  branch:  import.meta.env.VITE_BANK_BRANCH  || '',
};

// Ảnh VietQR (chuẩn Napas 247) — quét bằng app ngân hàng bất kỳ, tự điền sẵn số tiền + nội dung.
// Không cần API key: chỉ là URL ảnh động của img.vietqr.io.
export const vietQrUrl = ({ amount, addInfo }) => {
  const params = new URLSearchParams();
  if (amount)  params.set('amount', String(Math.round(amount)));
  if (addInfo) params.set('addInfo', addInfo);
  if (BANK.holder) params.set('accountName', BANK.holder);
  return `https://img.vietqr.io/image/${BANK.bin}-${BANK.account}-compact2.png?${params.toString()}`;
};
