// Tiện ích xử lý nội dung rich-text (dùng chung cho bài viết & bình luận)

// Lấy text thuần từ HTML (bỏ thẻ) — dùng để kiểm tra rỗng / đếm ký tự.
export const stripHtml = (html) => {
  const d = document.createElement('div');
  d.innerHTML = html || '';
  return (d.textContent || '').trim();
};

// Tách ảnh blob (mới kéo/thả/dán) trong nội dung → thay src bằng placeholder __IMG_i__,
// trả kèm files (theo thứ tự). KHÔNG upload ở đây — backend upload khi lưu (multipart)
// để tránh ảnh mồ côi nếu lưu lỗi. Ảnh cũ (URL http) được giữ nguyên.
// LƯU Ý: KHÔNG revoke blob URL ở đây — hàm chạy trên bản clone tách rời, nhưng revoke
// tác động toàn cục sẽ làm hỏng ảnh đang hiển thị trong editor thật nếu submit thất bại
// (vd: vượt 10MB rồi return). Blob URL sẽ được GC khi rời trang / editor remount.
export const extractContentImages = async (html) => {
  const div = document.createElement('div');
  div.innerHTML = html || '';
  const imgs = [...div.querySelectorAll('img')].filter(img => (img.getAttribute('src') || '').startsWith('blob:'));
  const files = [];
  for (let i = 0; i < imgs.length; i++) {
    const src  = imgs[i].getAttribute('src');
    const blob = await fetch(src).then(r => r.blob());
    const ext  = blob.type.split('/')[1] || 'png';
    files.push(new File([blob], `img-${i}.${ext}`, { type: blob.type }));
    imgs[i].setAttribute('src', `__IMG_${i}__`);
  }
  return { content: div.innerHTML, files };
};

// Tổng dung lượng ảnh (bytes)
export const totalSize = (files = []) => files.reduce((sum, f) => sum + f.size, 0);

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB tổng ảnh mỗi nội dung
