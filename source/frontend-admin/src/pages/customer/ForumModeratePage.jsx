import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import CustomerLayout from '../../components/customer/CustomerLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { CAT_BADGE } from '../../data/forumData';
import { getPendingPosts, moderatePost, deletePost } from '../../services/postService';
import { isStaff } from '../../services/authService';
import { toastService, errMsg } from '../../services/toastService';

const stripHtml = (html) => { const d = document.createElement('div'); d.innerHTML = html || ''; return (d.textContent || '').trim(); };
const initials  = (name = '') => name.trim().split(/\s+/).slice(-2).map(w => w[0]).join('').toUpperCase() || '?';
const AVATAR_COLORS = ['bg-indigo-100 text-indigo-700', 'bg-pink-100 text-pink-700', 'bg-sky-100 text-sky-700', 'bg-amber-100 text-amber-700', 'bg-emerald-100 text-emerald-700'];
const avatarColor = (id = 0) => AVATAR_COLORS[id % AVATAR_COLORS.length];
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('vi-VN') : '');

const ForumModeratePage = () => {
  const staff = isStaff();

  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [busyId, setBusyId]       = useState(null);  // bài đang xử lý (khoá nút)
  const [confirmDel, setConfirmDel] = useState(null); // bài chờ xác nhận xoá
  const [deleting, setDeleting]   = useState(false);

  useEffect(() => {
    if (!staff) return;
    setLoading(true);
    getPendingPosts({ limit: 100 })
      .then(res => setPosts(res.data.data.data))
      .catch(err => toastService.error(errMsg(err)))
      .finally(() => setLoading(false));
  }, [staff]);

  // Khách/customer cố vào → đá về diễn đàn (backend cũng chặn 403)
  if (!staff) return <Navigate to="/dien-dan" replace />;

  const handleApprove = async (post) => {
    setBusyId(post.id);
    try {
      await moderatePost(post.id, 'published');
      setPosts(prev => prev.filter(p => p.id !== post.id));
      toastService.success('Đã duyệt bài viết');
    } catch (err) {
      toastService.error(errMsg(err));
    } finally {
      setBusyId(null);
    }
  };

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

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap">
          <Link to="/trang-chu" className="text-[#599a4c] hover:text-primary font-medium transition-colors">Trang chủ</Link>
          <span className="text-[#599a4c]">/</span>
          <Link to="/dien-dan" className="text-[#599a4c] hover:text-primary font-medium transition-colors">Diễn đàn</Link>
          <span className="text-[#599a4c]">/</span>
          <span className="text-[#101b0d] dark:text-white font-medium">Kiểm duyệt</span>
        </nav>

        {/* Header */}
        <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#101b0d] dark:text-white mb-1 flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-500 text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
              Kiểm duyệt bài viết
            </h1>
            <p className="text-lg font-medium text-[#599a4c] dark:text-primary/80">
              Bài viết đang chờ duyệt trước khi hiển thị công khai.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 dark:bg-amber-500/10 px-4 py-1.5 text-sm font-bold text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-200 dark:ring-amber-500/30">
            {posts.length} bài chờ duyệt
          </span>
        </div>

        {/* List */}
        <div className="flex flex-col gap-4">
          {posts.length > 0 ? posts.map(post => {
            const badge = CAT_BADGE[post.category?.slug];
            const busy  = busyId === post.id;
            return (
              <div
                key={post.id}
                className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-[#2a4524] bg-white dark:bg-[#132210] p-5 shadow-sm"
              >
                {/* Top: badge + date */}
                <div className="flex items-center gap-3 text-xs">
                  {badge && (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-semibold ring-1 ring-inset ${badge.cls}`}>
                      {badge.label}
                    </span>
                  )}
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 font-semibold ring-1 ring-inset bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30">
                    Chờ duyệt
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    {fmtDate(post.created_at)}
                  </span>
                </div>

                {/* Title + excerpt */}
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[#101b0d] dark:text-white leading-snug hover:text-[#2E7D32] dark:hover:text-primary transition-colors">
                    <Link to={`/dien-dan/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{stripHtml(post.content)}</p>
                </div>

                {/* Footer: author + actions */}
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4 gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold ${avatarColor(post.user?.id ?? post.id)}`}>
                      {initials(post.user?.name)}
                    </div>
                    <span className="text-sm font-medium text-[#101b0d] dark:text-gray-200">{post.user?.name ?? 'Ẩn danh'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/dien-dan/${post.slug}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                      Xem
                    </Link>
                    <button
                      onClick={() => setConfirmDel(post)}
                      disabled={busy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      Xóa
                    </button>
                    <button
                      onClick={() => handleApprove(post)}
                      disabled={busy}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold bg-primary text-[#101b0d] hover:bg-[#3ed622] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      {busy ? 'Đang duyệt...' : 'Duyệt'}
                    </button>
                  </div>
                </div>
              </div>
            );
          }) : (
            !loading && (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <span className="material-symbols-outlined text-[48px] text-gray-300">task_alt</span>
                <p className="text-gray-500 text-base">Không có bài viết nào đang chờ duyệt.</p>
                <Link to="/dien-dan" className="text-primary font-medium text-sm hover:underline">Quay lại diễn đàn</Link>
              </div>
            )
          )}
        </div>
      </div>

      {/* ── Confirm Delete Modal ──────────────────────────────────────── */}
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

export default ForumModeratePage;
