import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import CustomerLayout from '../../components/customer/CustomerLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import Select from '../../components/common/Select';
import { FAKE_THREADS, CAT_BADGE } from '../../data/forumData';

// ── Category config ───────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',      label: 'Tất cả chủ đề',   icon: 'list'          },
  { id: 'pest',     label: 'Sâu & Bệnh',       icon: 'pest_control'  },
  { id: 'tips',     label: 'Mẹo Nông Nghiệp',  icon: 'local_florist' },
  { id: 'general',  label: 'Chung',             icon: 'chat_bubble'   },
];

const POPULAR_TAGS = ['#ngô', '#phân bón', '#hạn hán', '#thị trường', '#máy móc', '#lúa', '#cà chua'];

const SORT_OPTIONS = [
  { value: 'newest',      label: 'Mới nhất'        },
  { value: 'active',      label: 'Hoạt động nhiều' },
  { value: 'unanswered',  label: 'Chưa có trả lời' },
];

const ITEMS_PER_PAGE = 5;

const ForumPage = () => {
  const [selectedCat, setSelectedCat] = useState('all');
  const [sortBy, setSortBy]           = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const gridRef = useRef(null);
  const loading = false;

  const filtered = useMemo(() => {
    const pinned  = FAKE_THREADS.filter(t => t.pinned);
    let regular   = FAKE_THREADS.filter(t => !t.pinned);

    if (selectedCat !== 'all')
      regular = regular.filter(t => t.catId === selectedCat);

    if (sortBy === 'active')
      regular = [...regular].sort((a, b) => b.comments - a.comments);
    else if (sortBy === 'unanswered')
      regular = regular.filter(t => t.comments === 0);

    return [...pinned, ...regular];
  }, [selectedCat, sortBy]);

  const nonPinned  = filtered.filter(t => !t.pinned);
  const totalPages = Math.max(1, Math.ceil(nonPinned.length / ITEMS_PER_PAGE));
  const pinned     = filtered.filter(t => t.pinned);
  const paginated  = nonPinned.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const displayed  = [...pinned, ...paginated];

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) {
      setCurrentPage(p);
      if (gridRef.current) {
        const y = gridRef.current.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  const handleCat = (id) => { setSelectedCat(id); setCurrentPage(1); };

  return (
    <CustomerLayout>
      <LoadingOverlay visible={loading} />

      <div className="w-full px-4 md:px-10 lg:px-20 xl:px-40 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left Sidebar ─────────────────────────────────────────── */}
          <aside className="w-full lg:w-60 shrink-0 flex flex-col gap-8">

            {/* Tạo bài viết */}
            <Link
              to="/dien-dan/tao-bai"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 px-4 text-[#101b0d] font-bold shadow-sm hover:bg-[#3ed622] transition-all active:scale-95"
            >
              <span className="material-symbols-outlined">add</span>
              Tạo bài viết
            </Link>

            {/* Categories */}
            <div className="flex flex-col gap-1">
              <h3 className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Chủ đề
              </h3>
              {CATEGORIES.map(cat => {
                const isActive = selectedCat === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCat(cat.id)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors w-full text-left ${
                      isActive
                        ? 'bg-[#e9f3e7] dark:bg-[#2a4524] text-[#101b0d] dark:text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a2e16]'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-[#2E7D32] dark:text-primary' : 'text-[#599a4c]'}`}
                      style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                      {cat.icon}
                    </span>
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Popular Tags */}
            <div className="flex flex-col gap-3">
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Tags phổ biến
              </h3>
              <div className="flex flex-wrap gap-2 px-1">
                {POPULAR_TAGS.map(tag => (
                  <button
                    key={tag}
                    className="flex items-center gap-1 rounded-md bg-[#e9f3e7] dark:bg-[#1a2e16] px-2.5 py-1.5 text-xs font-medium text-[#101b0d] dark:text-gray-200 hover:bg-[#dcecd8] dark:hover:bg-[#2a4524] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px] text-[#599a4c]">label</span>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Main Feed ────────────────────────────────────────────── */}
          <main className="flex-1 flex flex-col min-w-0">

            {/* Page header */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#101b0d] dark:text-white mb-1">
                Diễn đàn cộng đồng
              </h1>
              <p className="text-lg md:text-xl font-medium text-[#599a4c] dark:text-primary/80">
                Kết nối, chia sẻ và cùng nhau phát triển.
              </p>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#599a4c] text-[18px] hidden sm:block">sort</span>
                <Select
                  value={sortBy}
                  options={SORT_OPTIONS}
                  onChange={(val) => { setSortBy(val); setCurrentPage(1); }}
                />
              </div>
            </div>

            {/* Thread list */}
            <div ref={gridRef} className="flex flex-col gap-4">
              {displayed.length > 0 ? displayed.map(thread => {
                const badge = CAT_BADGE[thread.catId];
                return (
                  <div
                    key={thread.id}
                    className={`group relative flex flex-col gap-4 rounded-xl border bg-white dark:bg-[#132210] p-5 shadow-sm transition-all hover:shadow-md ${
                      thread.pinned
                        ? 'border-primary/30 dark:border-[#2a4524]'
                        : 'border-gray-200 dark:border-[#2a4524]'
                    }`}
                  >
                    {/* Pin icon */}
                    {thread.pinned && (
                      <div className="absolute right-4 top-4 text-primary">
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>push_pin</span>
                      </div>
                    )}

                    {/* Top row: badge + time + new dot */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs">
                        {badge && (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-semibold ring-1 ring-inset ${badge.cls}`}>
                            {badge.label}
                          </span>
                        )}
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {thread.time}
                        </span>
                      </div>
                      {thread.isNew && (
                        <span className="flex size-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>

                    {/* Title + excerpt */}
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-[#101b0d] dark:text-white group-hover:text-[#2E7D32] dark:group-hover:text-primary transition-colors leading-snug">
                        <Link to={`/dien-dan/${thread.slug}`}>{thread.title}</Link>
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{thread.excerpt}</p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                      <div className="flex items-center gap-2">
                        <div className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold ${thread.avatarColor}`}>
                          {thread.initials}
                        </div>
                        <span className="text-sm font-medium text-[#101b0d] dark:text-gray-200">{thread.author}</span>
                      </div>
                      <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                        {thread.locked ? (
                          <div className="flex items-center gap-1.5 text-xs font-medium">
                            <span className="material-symbols-outlined text-[18px]">lock</span>
                            Đã khoá
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 group-hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                            <span className="text-xs font-medium">{thread.comments} bình luận</span>
                          </div>
                        )}
                        {thread.hot && (
                          <div className="flex items-center gap-1 text-orange-500">
                            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                            <span className="text-xs font-medium">Hot</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                  <span className="material-symbols-outlined text-[48px] text-gray-300">forum</span>
                  <p className="text-gray-500 text-base">Chưa có bài viết nào trong chủ đề này.</p>
                  <button
                    onClick={() => handleCat('all')}
                    className="text-primary font-medium text-sm hover:underline"
                  >
                    Xem tất cả bài viết
                  </button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center size-9 rounded-lg border border-gray-200 dark:border-[#2a4524] bg-white dark:bg-[#1a2e16] text-gray-500 hover:border-primary hover:text-primary dark:text-gray-400 dark:hover:text-primary disabled:opacity-40 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`flex items-center justify-center size-9 rounded-lg text-sm font-bold transition-colors ${
                        p === currentPage
                          ? 'bg-primary text-[#101b0d] shadow-sm'
                          : 'border border-gray-200 dark:border-[#2a4524] bg-white dark:bg-[#1a2e16] text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary dark:hover:text-primary'
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center size-9 rounded-lg border border-gray-200 dark:border-[#2a4524] bg-white dark:bg-[#1a2e16] text-gray-500 hover:border-primary hover:text-primary dark:text-gray-400 dark:hover:text-primary disabled:opacity-40 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </nav>
              </div>
            )}
          </main>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default ForumPage;
