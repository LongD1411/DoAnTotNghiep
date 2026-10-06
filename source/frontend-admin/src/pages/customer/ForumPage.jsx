import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/customer/CustomerLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import Select from '../../components/common/Select';
import { CAT_BADGE } from '../../data/forumData';
import { getPosts, deletePost } from '../../services/postService';
import { isStaff, getCurrentUser } from '../../services/authService';
import { toastService, errMsg } from '../../services/toastService';

// ── Category config (slug khớp ForumCategory đã seed: pest/tips/general) ─────────
const CATEGORIES = [
  { id: 'all',     label: 'Tất cả chủ đề',   icon: 'list'          },
  { id: 'pest',    label: 'Sâu & Bệnh',       icon: 'pest_control'  },
  { id: 'tips',    label: 'Mẹo Nông Nghiệp',  icon: 'local_florist' },
  { id: 'general', label: 'Chung',             icon: 'chat_bubble'   },
];

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Mới nhất'        },
  { value: 'active',     label: 'Hoạt động nhiều' },
  { value: 'unanswered', label: 'Chưa có trả lời' },
];

const ITEMS_PER_PAGE = 5;

// ── Helpers ─────────────────────────────────────────────────────────────────────
const stripHtml = (html) => { const d = document.createElement('div'); d.innerHTML = html || ''; return (d.textContent || '').trim(); };
const initials  = (name = '') => name.trim().split(/\s+/).slice(-2).map(w => w[0]).join('').toUpperCase() || '?';
const AVATAR_COLORS = ['bg-indigo-100 text-indigo-700', 'bg-pink-100 text-pink-700', 'bg-sky-100 text-sky-700', 'bg-amber-100 text-amber-700', 'bg-emerald-100 text-emerald-700'];
const avatarColor = (id = 0) => AVATAR_COLORS[id % AVATAR_COLORS.length];
const fmtDate  = (iso) => (iso ? new Date(iso).toLocaleDateString('vi-VN') : '');
const isNewPost = (iso) => iso && (Date.now() - new Date(iso).getTime() < 3 * 86400000);

// Nhãn trạng thái cho bài chưa công khai (chỉ hiện với bài của chính mình)
const STATUS_BADGE = {
  pending: { label: 'Chờ duyệt', cls: 'bg-amber-100 text-amber-700 ring-amber-600/20' },
  hidden:  { label: 'Đã ẩn',     cls: 'bg-gray-200 text-gray-600 ring-gray-500/20' },
};

const ForumPage = () => {
  const [posts, setPosts]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedCat, setSelectedCat] = useState('all');
  const [sortBy, setSortBy]           = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDel, setConfirmDel]   = useState(null); // bài chờ xác nhận xoá
  const [deleting, setDeleting]       = useState(false);
  const gridRef = useRef(null);
  const navigate = useNavigate();
  const staff = isStaff();
  const myId  = getCurrentUser()?.id;

  useEffect(() => {
    setLoading(true);
    getPosts({ limit: 100 })
      .then(res => setPosts(res.data.data.data))
      .catch(err => toastService.error(errMsg(err)))
      .finally(() => setLoading(false));
  }, []);

  const pinned = useMemo(() => posts.filter(p => p.is_pinned), [posts]);

  const regular = useMemo(() => {
    let r = posts.filter(p => !p.is_pinned);
    if (selectedCat !== 'all') r = r.filter(p => p.category?.slug === selectedCat);
    if (sortBy === 'active')       r = [...r].sort((a, b) => (b.comment_count ?? 0) - (a.comment_count ?? 0));
    else if (sortBy === 'unanswered') r = r.filter(p => (p.comment_count ?? 0) === 0);
    return r;
  }, [posts, selectedCat, sortBy]);

  const totalPages = Math.max(1, Math.ceil(regular.length / ITEMS_PER_PAGE));
  const paginated  = regular.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
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

  const handleDelete = async () => {
    if (!confirmDel) return;
    setDeleting(true);
    try {
      await deletePost(confirmDel.id);
      setPosts(prev => prev.filter(p => p.id !== confirmDel.id));
      toastService.success('Đã xóa bài viết');
      setConfirmDel(null);
    } catch (err) {
      toastService.error(errMsg(err));
    } finally {
      setDeleting(false);
    }
  };

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

            {/* Duyệt bài viết — chỉ mod/admin */}
            {staff && (
              <Link
                to="/dien-dan/kiem-duyet"
                className="w-full -mt-4 flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/30 py-2.5 px-4 text-amber-700 dark:text-amber-400 font-semibold text-sm hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">gavel</span>
                Duyệt bài viết
              </Link>
            )}

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
              {displayed.length > 0 ? displayed.map(post => {
                const badge = CAT_BADGE[post.category?.slug];
                const isOwner = myId && post.user?.id === myId;
                const statusBadge = post.status && post.status !== 'published' ? STATUS_BADGE[post.status] : null;
                return (
                  <div
                    key={post.id}
                    onClick={() => navigate(`/dien-dan/${post.slug}`)}
                    className={`group relative flex flex-col gap-4 rounded-xl border bg-white dark:bg-[#132210] p-5 shadow-sm transition-all hover:shadow-md cursor-pointer ${
                      post.is_pinned
                        ? 'border-primary/30 dark:border-[#2a4524]'
                        : 'border-gray-200 dark:border-[#2a4524]'
                    }`}
                  >
                    {/* Pin icon */}
                    {post.is_pinned && (
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
                        {statusBadge && (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-semibold ring-1 ring-inset ${statusBadge.cls}`}>
                            {statusBadge.label}
                          </span>
                        )}
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {fmtDate(post.created_at)}
                        </span>
                      </div>
                      {isNewPost(post.created_at) && (
                        <span className="flex size-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>

                    {/* Title + excerpt */}
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-[#101b0d] dark:text-white group-hover:text-[#2E7D32] dark:group-hover:text-primary transition-colors leading-snug">
                        <Link to={`/dien-dan/${post.slug}`} onClick={(e) => e.stopPropagation()}>{post.title}</Link>
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{stripHtml(post.content)}</p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                      <div className="flex items-center gap-2">
                        <div className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold ${avatarColor(post.user?.id ?? post.id)}`}>
                          {initials(post.user?.name)}
                        </div>
                        <span className="text-sm font-medium text-[#101b0d] dark:text-gray-200">{post.user?.name ?? 'Ẩn danh'}</span>
                      </div>
                      <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5 group-hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                          <span className="text-xs font-medium">{post.comment_count ?? 0} bình luận</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                          <span className="text-xs font-medium">{post.view_count ?? 0}</span>
                        </div>
                        {/* Sửa bài — chỉ tác giả bài viết */}
                        {isOwner && (
                          <Link
                            to={`/dien-dan/sua/${post.slug}`}
                            onClick={(e) => e.stopPropagation()}
                            title="Chỉnh sửa bài viết"
                            className="flex items-center justify-center size-7 rounded-lg text-[#2E7D32] dark:text-primary hover:bg-primary/10 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </Link>
                        )}
                        {/* Xóa bài — tác giả hoặc mod/admin */}
                        {(staff || isOwner) && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmDel(post); }}
                            title="Xóa bài viết"
                            className="flex items-center justify-center size-7 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                !loading && (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                    <span className="material-symbols-outlined text-[48px] text-gray-300">forum</span>
                    <p className="text-gray-500 text-base">
                      {selectedCat === 'all' ? 'Chưa có bài viết nào.' : 'Chưa có bài viết nào trong chủ đề này.'}
                    </p>
                    {selectedCat !== 'all' && (
                      <button onClick={() => handleCat('all')} className="text-primary font-medium text-sm hover:underline">
                        Xem tất cả bài viết
                      </button>
                    )}
                  </div>
                )
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

      {/* ── Confirm Delete Modal (staff) ──────────────────────────────── */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !deleting && setConfirmDel(null)} />
          <div className="relative bg-white dark:bg-[#132210] rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">delete_forever</span>
              </div>
              <div>
                <h3 className="font-bold text-[#101b0d] dark:text-white text-base">Xóa bài viết?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Bài viết và ảnh đính kèm sẽ bị xóa vĩnh viễn, không thể khôi phục.</p>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-white/5 rounded-xl px-4 py-3">
              <p className="font-semibold text-[#101b0d] dark:text-white text-sm line-clamp-2">{confirmDel.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">Tác giả: {confirmDel.user?.name ?? 'Ẩn danh'}</p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setConfirmDel(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 text-sm font-semibold border border-gray-200 dark:border-[#3a5c35] text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-40"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {deleting
                  ? <span className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <span className="material-symbols-outlined text-base">delete</span>
                }
                {deleting ? 'Đang xóa...' : 'Xóa bài viết'}
              </button>
            </div>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
};

export default ForumPage;
