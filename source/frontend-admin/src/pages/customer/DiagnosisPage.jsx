import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CustomerLayout from '../../components/customer/CustomerLayout';
import { SEVERITY_BADGE } from '../../data/encyclopediaData';
import { diagnose } from '../../services/diagnosisService';
import { toastService, errMsg } from '../../services/toastService';
import { useCartStore } from '../../store/useCartStore';
import CameraCapture from '../../components/customer/CameraCapture';

const fmt = (n) =>
  n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) : '—';
const pct = (c) => (c != null ? Math.round(c * 100) : 0);

const confColor = (c) => (pct(c) >= 80 ? 'text-emerald-600 dark:text-emerald-400'
  : pct(c) >= 60 ? 'text-yellow-600 dark:text-yellow-400'
  : 'text-orange-600 dark:text-orange-400');
const confBar = (c) => (pct(c) >= 80 ? 'bg-emerald-500' : pct(c) >= 60 ? 'bg-yellow-500' : 'bg-orange-500');

const MAX_SIZE = 5 * 1024 * 1024; // 5MB — khớp giới hạn backend

const STEPS = [
  { icon: 'photo_camera', title: 'Chụp / chọn ảnh', desc: 'Ảnh lá cây rõ nét, lấy gần vùng có triệu chứng.' },
  { icon: 'neurology',    title: 'AI phân tích',    desc: 'Mô hình CNN nhận diện loại bệnh trên lá.' },
  { icon: 'medication',   title: 'Gợi ý xử lý',     desc: 'Xem thông tin bệnh + thuốc điều trị đang bán.' },
];

const DiagnosisPage = () => {
  const [file,    setFile]    = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const inputRef = useRef(null);
  const addItem  = useCartStore((s) => s.addItem);

  // Giải phóng object URL của ảnh preview khi đổi/ rời trang
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const pickFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) { toastService.error('Vui lòng chọn file ảnh'); return; }
    if (f.size > MAX_SIZE)            { toastService.error('Ảnh vượt quá 5MB');       return; }
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const onDrop = (e) => { e.preventDefault(); setDragOver(false); pickFile(e.dataTransfer.files?.[0]); };

  const handleDiagnose = async () => {
    if (!file) { toastService.error('Hãy chọn ảnh lá cây trước'); return; }
    setLoading(true); setResult(null);
    try {
      const res = await diagnose(file);
      setResult(res.data.data);
    } catch (err) {
      toastService.error(errMsg(err, 'Chẩn đoán thất bại, vui lòng thử lại'));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null); setPreview(null); setResult(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleAddToCart = async (p) => {
    try { await addItem(p, 1); toastService.success(`Đã thêm "${p.name}" vào giỏ`); }
    catch (err) { toastService.error(errMsg(err, 'Không thêm được vào giỏ')); }
  };

  const pest  = result?.pest;
  const badge = pest ? (SEVERITY_BADGE[pest.severity] ?? { label: pest.severity, cls: 'bg-slate-100 text-slate-700' }) : null;

  return (
    <CustomerLayout>
      <div className="w-full px-4 md:px-10 lg:px-20 xl:px-40 py-8 flex flex-col gap-8 overflow-x-hidden">

        {/* ── Header ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <span className="inline-flex items-center gap-1.5 self-start text-xs font-bold uppercase tracking-wider text-[#599a4c]">
            <span className="material-symbols-outlined text-[16px]">neurology</span> Trợ lý AI
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#101b0d] dark:text-white">
            Chẩn đoán bệnh cây bằng AI
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
            Tải lên ảnh lá cây có dấu hiệu bệnh, AI sẽ nhận diện và gợi ý thông tin bệnh cùng thuốc điều trị phù hợp.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── Uploader ───────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => !preview && inputRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed aspect-[4/3] flex items-center justify-center overflow-hidden transition-colors ${
                dragOver ? 'border-primary bg-primary/5' : 'border-[#d3e7cf] dark:border-[#2a4524]'
              } ${!preview ? 'cursor-pointer hover:border-primary' : 'bg-gray-100 dark:bg-[#1c3019]'}`}
            >
              {preview ? (
                <>
                  <img src={preview} alt="Ảnh lá cây" className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => { e.stopPropagation(); reset(); }}
                    className="absolute top-3 right-3 size-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                    aria-label="Xóa ảnh"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center px-6">
                  <span className="material-symbols-outlined text-[56px] text-[#599a4c]">add_photo_alternate</span>
                  <p className="font-bold text-[#101b0d] dark:text-white">Kéo thả hoặc bấm để chọn ảnh</p>
                  <p className="text-sm text-gray-400">JPG, PNG — tối đa 5MB</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowCamera(true); }}
                    className="mt-2 inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#e9f3e7] dark:bg-[#2a3c25] text-[#2E7D32] dark:text-primary text-sm font-bold hover:bg-[#d8ead5] dark:hover:bg-[#384f32] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">photo_camera</span> Chụp từ camera
                  </button>
                </div>
              )}
            </div>

            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])} />

            <div className="flex gap-3">
              <button
                onClick={handleDiagnose}
                disabled={!file || loading}
                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-black font-bold hover:bg-[#3dd122] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> Đang phân tích…</>
                ) : (
                  <><span className="material-symbols-outlined text-[20px]">neurology</span> Chẩn đoán</>
                )}
              </button>
              {preview && (
                <>
                  <button onClick={() => setShowCamera(true)} aria-label="Chụp lại"
                    className="h-12 px-4 rounded-xl border border-[#d3e7cf] dark:border-[#2a4524] text-[#101b0d] dark:text-white hover:border-primary transition-colors flex items-center">
                    <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                  </button>
                  <button onClick={() => inputRef.current?.click()}
                    className="h-12 px-4 rounded-xl border border-[#d3e7cf] dark:border-[#2a4524] font-bold text-[#101b0d] dark:text-white hover:border-primary transition-colors">
                    Đổi ảnh
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── Hướng dẫn / kết quả ───────────────────────────── */}
          <div className="flex flex-col gap-4">
            {!result && !loading && (
              <div className="flex flex-col gap-4 rounded-2xl bg-white dark:bg-[#132210] border border-[#d3e7cf] dark:border-[#2a4524] p-6">
                <h2 className="text-lg font-bold text-[#101b0d] dark:text-white">Cách hoạt động</h2>
                {STEPS.map((s, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="shrink-0 size-11 rounded-xl bg-[#e9f3e7] dark:bg-[#2a3c25] text-[#2E7D32] dark:text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined">{s.icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#101b0d] dark:text-white">{i + 1}. {s.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{s.desc}</p>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-400 border-t border-[#e9f3e7] dark:border-white/10 pt-3">
                  * Kết quả AI chỉ mang tính tham khảo, nên kết hợp quan sát thực tế hoặc hỏi ý kiến chuyên gia.
                </p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white dark:bg-[#132210] border border-[#d3e7cf] dark:border-[#2a4524] p-10 h-full">
                <span className="material-symbols-outlined animate-spin text-[40px] text-primary">progress_activity</span>
                <p className="text-gray-500 dark:text-gray-400">AI đang phân tích ảnh…</p>
              </div>
            )}

            {result && (
              <div className="flex flex-col gap-4 rounded-2xl bg-white dark:bg-[#132210] border border-[#d3e7cf] dark:border-[#2a4524] p-6">
                {/* Confidence */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-500 dark:text-gray-400">Độ tin cậy</span>
                    <span className={`font-black ${confColor(result.confidence)}`}>{pct(result.confidence)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#e9f3e7] dark:bg-white/10 overflow-hidden">
                    <div className={`h-full rounded-full ${confBar(result.confidence)}`} style={{ width: `${pct(result.confidence)}%` }} />
                  </div>
                </div>

                {/* ── MATCHED: bệnh trong kho tri thức ── */}
                {result.status === 'matched' && pest && (
                  <>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#599a4c]">{pest.category}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-[#101b0d] dark:text-white">{pest.name}</h2>
                      {pest.latin_name && <p className="text-gray-500 italic">{pest.latin_name}</p>}
                    </div>

                    {pest.symptoms?.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <p className="font-bold text-[#101b0d] dark:text-white">Triệu chứng</p>
                        <ul className="flex flex-col gap-1.5">
                          {pest.symptoms.slice(0, 4).map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
                              <span className="material-symbols-outlined text-[16px] text-[#2E7D32] dark:text-primary mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>circle</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {pest.treatment?.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <p className="font-bold text-[#101b0d] dark:text-white">Biện pháp xử lý</p>
                        <ol className="flex flex-col gap-2">
                          {pest.treatment.slice(0, 4).map((t, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-200">
                              <span className="shrink-0 size-5 rounded-full bg-primary/20 text-[#2E7D32] dark:text-primary text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                              {t}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    <Link to={`/tra-cuu/${pest.slug}`}
                      className="self-start flex items-center gap-1 text-primary font-bold hover:underline text-sm">
                      Xem chi tiết trong cẩm nang <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </>
                )}

                {/* ── HEALTHY: cây khỏe mạnh ── */}
                {result.status === 'healthy' && (
                  <div className="flex flex-col items-center text-center gap-3 py-4">
                    <span className="material-symbols-outlined text-[56px] text-emerald-500">verified</span>
                    <h2 className="text-xl font-bold text-[#101b0d] dark:text-white">Cây trông khỏe mạnh!</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      AI không phát hiện dấu hiệu bệnh rõ rệt ({result.display_name}). Hãy tiếp tục chăm sóc và theo dõi định kỳ.
                    </p>
                  </div>
                )}

                {/* ── UNMATCHED: fallback ── */}
                {result.status === 'unmatched' && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/40 p-4">
                      <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">info</span>
                      <div>
                        <p className="font-bold text-[#101b0d] dark:text-white">Chưa có trong cơ sở dữ liệu</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          AI chưa đủ chắc chắn hoặc bệnh này chưa có trong cẩm nang. Dưới đây là các khả năng gần nhất.
                        </p>
                      </div>
                    </div>

                    {result.predictions?.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <p className="font-bold text-[#101b0d] dark:text-white text-sm">Khả năng gần nhất</p>
                        {result.predictions.slice(0, 3).map((p, i) => (
                          <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-[#e9f3e7] dark:border-white/10 px-3 py-2">
                            <span className="text-sm text-gray-700 dark:text-gray-200">{p.display}</span>
                            <span className={`text-sm font-bold ${confColor(p.confidence)}`}>{pct(p.confidence)}%</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <Link to="/dien-dan/tao-bai"
                        className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-primary text-black font-bold hover:bg-[#3dd122] transition-colors text-sm">
                        <span className="material-symbols-outlined text-[18px]">forum</span> Hỏi cộng đồng
                      </Link>
                      <Link to="/tra-cuu"
                        className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-[#d3e7cf] dark:border-[#2a4524] font-bold text-[#101b0d] dark:text-white hover:border-primary transition-colors text-sm">
                        <span className="material-symbols-outlined text-[18px]">menu_book</span> Tra cứu cẩm nang
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Thuốc điều trị khuyến nghị (chỉ khi matched) ───────── */}
        {result?.status === 'matched' && result.recommended_products?.length > 0 && (
          <section className="flex flex-col gap-5">
            <h2 className="text-xl font-bold text-[#101b0d] dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2E7D32] dark:text-primary text-[22px]">science</span>
              Thuốc điều trị khuyến nghị
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.recommended_products.map((p) => {
                const dp  = p.discount_price ? Math.round((1 - p.discount_price / p.price) * 100) : null;
                const img = p.images?.[0]?.url ?? p.image_url;
                return (
                  <div key={p.id}
                    className="group flex flex-col bg-white dark:bg-[#132210] rounded-xl border border-[#d3e7cf] dark:border-[#2a4524] overflow-hidden hover:shadow-md hover:border-primary transition-all">
                    <Link to={`/san-pham/${p.slug}`} className="relative w-full pt-[60%] bg-[#f6f8f6] dark:bg-[#2a3e25] overflow-hidden">
                      {img ? (
                        <div className="absolute inset-0 bg-center bg-cover group-hover:scale-105 transition-transform duration-300" style={{ backgroundImage: `url(${img})` }} />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[36px] text-gray-300">image</span>
                        </div>
                      )}
                      {dp && <span className="absolute top-2 left-2 text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded">-{dp}%</span>}
                    </Link>
                    <div className="p-4 flex flex-col gap-1 flex-1">
                      {p.category?.name && <p className="text-xs font-semibold text-[#599a4c] uppercase tracking-wider">{p.category.name}</p>}
                      <Link to={`/san-pham/${p.slug}`} className="text-sm font-bold text-[#101b0d] dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                        {p.name}
                      </Link>
                      <span className="text-base font-black text-[#2E7D32] dark:text-primary mt-1">{fmt(p.discount_price ?? p.price)}</span>
                      <button
                        onClick={() => handleAddToCart(p)}
                        disabled={p.stock <= 0}
                        className="mt-2 flex items-center justify-center gap-1.5 h-10 rounded-lg bg-primary text-black font-bold text-sm hover:bg-[#3dd122] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                        {p.stock <= 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {showCamera && (
        <CameraCapture
          onCapture={(f) => { pickFile(f); setShowCamera(false); }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </CustomerLayout>
  );
};

export default DiagnosisPage;
