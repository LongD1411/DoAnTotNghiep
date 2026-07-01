import { useState, useRef, useEffect } from 'react';

const MAX_SIZE_MB  = 5;
const ACCEPT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ACCEPT_ATTR  = ACCEPT_TYPES.join(',');

// ── ImageUploader ─────────────────────────────────────────────────────────────
// Props:
//   images   : Array<string | File>  — URLs đã lưu hoặc File objects chưa upload
//   onChange : (items: Array<string | File>) => void
//   max      : number
//   className: string
//
// File objects được hiện preview local ngay lập tức.
// Upload lên cloud xảy ra khi parent form submit (dùng resolveImages từ uploadService).

const ImageUploader = ({ images = [], onChange, max = 5, className = '' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null); // lightbox
  const inputRef    = useRef(null);
  const dragCounter = useRef(0);
  // Stable blob URL cache: File → blobUrl (tránh tạo blob mới mỗi render)
  const blobCache   = useRef(new Map());

  const canAdd    = images.length < max;
  const available = max - images.length;

  // Revoke tất cả blob khi unmount
  useEffect(() => {
    const cache = blobCache.current;
    return () => { cache.forEach(url => URL.revokeObjectURL(url)); };
  }, []);

  // Đóng lightbox bằng ESC
  useEffect(() => {
    if (!previewUrl) return;
    const onKey = (e) => { if (e.key === 'Escape') setPreviewUrl(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [previewUrl]);

  // Lấy URL hiển thị: string → dùng luôn, File → tạo blob nếu chưa có
  const getDisplayUrl = (item) => {
    if (typeof item === 'string') return item;
    if (!blobCache.current.has(item)) {
      blobCache.current.set(item, URL.createObjectURL(item));
    }
    return blobCache.current.get(item);
  };

  const addFiles = (files) => {
    const valid = Array.from(files)
      .filter(f => ACCEPT_TYPES.includes(f.type) && f.size <= MAX_SIZE_MB * 1024 * 1024)
      .slice(0, available);
    if (!valid.length) return;
    onChange([...images, ...valid]);
  };

  const removeAt = (idx) => {
    const item = images[idx];
    // Revoke blob nếu là file local
    if (item instanceof File) {
      const blob = blobCache.current.get(item);
      if (blob) { URL.revokeObjectURL(blob); blobCache.current.delete(item); }
    }
    onChange(images.filter((_, i) => i !== idx));
  };

  // ── Drag events ────────────────────────────────────────────────────────────
  const onDragEnter = (e) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };
  const onDragOver = (e) => e.preventDefault();
  const onDrop     = (e) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    if (canAdd) addFiles(e.dataTransfer.files);
  };

  const openPicker  = () => inputRef.current?.click();
  const totalFilled = images.length;

  return (
    <>
      {/* Lightbox */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] w-full flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={previewUrl}
              alt="preview"
              className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="absolute top-2 right-2 size-8 bg-black/60 hover:bg-black/80 rounded-full text-white flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>
      )}

      <div
        className={`relative ${className}`}
        onDragEnter={canAdd ? onDragEnter : undefined}
        onDragLeave={canAdd ? onDragLeave : undefined}
        onDragOver={canAdd  ? onDragOver  : undefined}
        onDrop={canAdd      ? onDrop      : undefined}
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          multiple={max > 1}
          className="hidden"
          onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
        />

        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-20 rounded-xl border-2 border-primary bg-primary/10 flex flex-col items-center justify-center gap-2 pointer-events-none">
            <span className="material-symbols-outlined text-4xl text-primary">add_photo_alternate</span>
            <p className="text-sm font-bold text-[#1B5E20] dark:text-primary">Thả ảnh vào đây</p>
          </div>
        )}

        {/* Empty state — big drop zone */}
        {totalFilled === 0 && (
          <button
            type="button"
            onClick={openPicker}
            className="w-full border-2 border-dashed border-slate-200 dark:border-slate-600 hover:border-primary/60 rounded-xl p-8 flex flex-col items-center gap-3 text-center transition-colors group"
          >
            <div className="size-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined text-2xl text-primary">add_photo_alternate</span>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Kéo & thả ảnh vào đây
              </p>
              <p className="text-xs text-slate-400">
                hoặc <span className="text-primary font-semibold">nhấn để chọn file</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                JPG · PNG · WebP · tối đa {MAX_SIZE_MB}MB/ảnh · {max} ảnh
              </p>
            </div>
          </button>
        )}

        {/* Image grid */}
        {totalFilled > 0 && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-2">

              {images.map((item, idx) => {
                const url     = getDisplayUrl(item);
                const isLocal = item instanceof File;
                return (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 group cursor-zoom-in"
                    onClick={() => setPreviewUrl(url)}
                  >
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      onError={e => { e.target.style.opacity = '0.3'; }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                    {/* "Chính" badge */}
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-primary text-[#1B5E20] text-xs font-bold px-1.5 py-0.5 rounded shadow-sm leading-tight">
                        Chính
                      </span>
                    )}

                    {/* "Chưa lưu" badge cho File local */}
                    {isLocal && (
                      <span className="absolute bottom-1 left-1 bg-amber-500 text-white leading-tight rounded px-1.5 py-0.5 flex items-center gap-0.5" style={{ fontSize: '10px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>cloud_upload</span>
                        Chưa lưu
                      </span>
                    )}

                    {/* X button */}
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); removeAt(idx); }}
                      className="absolute top-1 right-1 size-5 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      title="Xóa ảnh"
                    >
                      <span className="material-symbols-outlined leading-none" style={{ fontSize: '12px' }}>close</span>
                    </button>
                  </div>
                );
              })}

              {/* Add more slot */}
              {canAdd && (
                <button
                  type="button"
                  onClick={openPicker}
                  className="aspect-square rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-600 hover:border-primary/60 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">add</span>
                  <span className="text-xs font-medium tabular-nums">{totalFilled}/{max}</span>
                </button>
              )}
            </div>

            {/* Hint */}
            {canAdd && (
              <p className="text-xs text-slate-400 text-center">
                Kéo thả hoặc nhấn <span className="font-semibold">+</span> để thêm ảnh · còn {available} slot
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ImageUploader;
