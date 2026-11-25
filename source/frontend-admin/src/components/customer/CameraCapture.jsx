import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Overlay camera trực tiếp (getUserMedia). Chụp 1 khung hình -> trả về File ảnh.
 * Props:
 *   onCapture(file) — gọi khi chụp xong (File jpeg)
 *   onClose()       — đóng overlay
 * Lưu ý: getUserMedia cần HTTPS hoặc localhost.
 */
const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const [facing, setFacing]   = useState('environment'); // 'environment' = camera sau
  const [error,  setError]    = useState('');
  const [ready,  setReady]    = useState(false);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  // Mở camera mỗi khi đổi facing
  useEffect(() => {
    let cancelled = false;
    setError(''); setReady(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Trình duyệt không hỗ trợ camera, hoặc trang không chạy trên HTTPS/localhost.');
      return;
    }

    stop();
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: facing }, audio: false })
      .then(stream => {
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setReady(true);
      })
      .catch(err => {
        if (cancelled) return;
        if (err.name === 'NotAllowedError')      setError('Bạn đã từ chối quyền camera. Hãy cấp quyền rồi thử lại.');
        else if (err.name === 'NotFoundError')   setError('Không tìm thấy camera trên thiết bị.');
        else                                     setError('Không mở được camera: ' + (err.message || err.name));
      });

    return () => { cancelled = true; };
  }, [facing, stop]);

  // Dừng camera khi rời component
  useEffect(() => stop, [stop]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) { setError('Chụp ảnh thất bại, thử lại.'); return; }
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
        stop();
        onCapture(file);
      },
      'image/jpeg',
      0.9,
    );
  };

  const handleClose = () => { stop(); onClose(); };

  return (
    <div className="fixed inset-0 z-[120] bg-black flex flex-col">
      {/* Thanh trên */}
      <div className="flex items-center justify-between p-4 text-white">
        <button
          onClick={handleClose}
          className="size-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          aria-label="Đóng"
        >
          <span className="material-symbols-outlined text-[26px]">close</span>
        </button>
        <span className="text-sm font-semibold">Chụp ảnh lá cây</span>
        <button
          onClick={() => setFacing(f => (f === 'environment' ? 'user' : 'environment'))}
          className="size-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          aria-label="Đổi camera trước/sau"
        >
          <span className="material-symbols-outlined text-[24px]">cameraswitch</span>
        </button>
      </div>

      {/* Khung camera */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center gap-3 text-center px-8 text-white/90">
            <span className="material-symbols-outlined text-[56px] text-white/50">no_photography</span>
            <p className="max-w-sm">{error}</p>
            <button
              onClick={handleClose}
              className="mt-2 h-11 px-5 rounded-xl bg-primary text-black font-bold hover:bg-[#3dd122] transition-colors"
            >
              Dùng tải ảnh thay thế
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
            />
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center text-white/80">
                <span className="material-symbols-outlined animate-spin text-[40px]">progress_activity</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Nút chụp */}
      {!error && (
        <div className="p-6 flex items-center justify-center">
          <button
            onClick={handleCapture}
            disabled={!ready}
            className="size-18 rounded-full bg-white ring-4 ring-white/40 flex items-center justify-center disabled:opacity-40 transition-transform active:scale-95"
            aria-label="Chụp"
            style={{ width: 72, height: 72 }}
          >
            <span className="material-symbols-outlined text-[36px] text-[#101b0d]">photo_camera</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
