import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/customer/CustomerLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import CommentsSection from '../../components/customer/CommentsSection';
import { CAT_BADGE } from '../../data/forumData';
import { getPostById, getPosts, deletePost } from '../../services/postService';
import { getCurrentUser, isStaff } from '../../services/authService';
import { toastService, errMsg } from '../../services/toastService';

const initials = (name = '') => name.trim().split(/\s+/).slice(-2).map(w => w[0]).join('').toUpperCase() || '?';
const AVATAR_COLORS = ['bg-indigo-100 text-indigo-700', 'bg-pink-100 text-pink-700', 'bg-sky-100 text-sky-700', 'bg-amber-100 text-amber-700', 'bg-emerald-100 text-emerald-700'];
const avatarColor = (id = 0) => AVATAR_COLORS[id % AVATAR_COLORS.length];
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('vi-VN') : '');

const ForumPostPage = () => {
  const { slug }  = useParams();
  const navigate  = useNavigate();

  const [post, setPost]         = useState(null);
  const [related, setRelated]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [commentCount, setCommentCount] = useState(0);
  const [liked, setLiked]       = useState(false);
  const [saved, setSaved]       = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting, setDeleting]     = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    getPostById(slug)
      .then(res => {
        const p = res.data.data;
        setPost(p);
        setCommentCount(p.comment_count ?? 0);
        getPosts({ limit: 100 })
          .then(r => {
            const all = r.data.data.data;
            setRelated(all.filter(x => x.category?.slug === p.category?.slug && x.slug !== p.slug && !x.is_pinned).slice(0, 3));
          })
          .catch(() => {});
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <CustomerLayout>
        <LoadingOverlay visible={true} />
        <div className="min-h-[60vh]" />
      </CustomerLayout>
    );
  }

  if (notFound || !post) {
    return (
      <CustomerLayout>
        <div className="w-full px-4 md:px-10 lg:px-20 xl:px-40 py-20 flex flex-col items-center gap-4 text-center">
          <span className="material-symbols-outlined text-[64px] text-gray-300">forum</span>
          <h2 className="text-2xl font-bold text-[#101b0d] dark:text-white">Không tìm thấy bài viết</h2>
          <p className="text-gray-500">Bài viết này có thể đã bị xoá, chưa được duyệt, hoặc đường dẫn không hợp lệ.</p>
          <Link to="/dien-dan" className="mt-2 group/back flex items-center gap-1 text-primary font-bold">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span className="group-hover/back:underline">Quay lại diễn đàn</span>
          </Link>
        </div>
      </CustomerLayout>
    );
  }

  const badge = CAT_BADGE[post.category?.slug];
  const isOwner = getCurrentUser()?.id && post.user?.id === getCurrentUser()?.id;
  const canDelete = isOwner || isStaff();
  const statusLabel = post.status === 'pending' ? 'Chờ duyệt' : post.status === 'hidden' ? 'Đã ẩn' : null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePost(post.id);
      toastService.success('Đã xóa bài viết');
      navigate('/dien-dan');
    } catch (err) {
      toastService.error(errMsg(err));
      setDeleting(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="w-full px-4 md:px-10 lg:px-20 xl:px-40 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap">
          <Link to="/trang-chu" className="text-[#599a4c] hover:text-primary font-medium transition-colors">Trang chủ</Link>
          <span className="text-[#599a4c]">/</span>
          <Link to="/dien-dan" className="text-[#599a4c] hover:text-primary font-medium transition-colors">Diễn đàn</Link>
          <span className="text-[#599a4c]">/</span>
          <span className="text-[#101b0d] dark:text-white font-medium line-clamp-1 max-w-[260px]">{post.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Main ─────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">

            {/* Post card */}
            <article className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] shadow-sm p-6 flex flex-col gap-5">

              {/* Top meta */}
              <div className="flex items-center gap-3 flex-wrap">
                {badge && (
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${badge.cls}`}>
                    {badge.label}
                  </span>
                )}
                {post.is_pinned && (
                  <span className="inline-flex items-center gap-1 text-primary text-xs font-semibold">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>push_pin</span>
                    Ghim
                  </span>
                )}
                <span className="flex items-center gap-1 text-gray-400 text-xs">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  {fmtDate(post.created_at)}
                </span>
                <span className="flex items-center gap-1 text-gray-400 text-xs">
                  <span className="material-symbols-outlined text-[14px]">visibility</span>
                  {post.view_count ?? 0}
                </span>
                {/* Trạng thái + nút sửa — chỉ tác giả bài viết */}
                {isOwner && statusLabel && (
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset bg-amber-100 text-amber-700 ring-amber-600/20">
                    {statusLabel}
                  </span>
                )}
                {(isOwner || canDelete) && (
                  <div className="ml-auto flex items-center gap-3">
                    {isOwner && (
                      <Link
                        to={`/dien-dan/sua/${post.slug}`}
                        className="group/edit inline-flex items-center gap-1 text-xs font-semibold text-[#2E7D32] dark:text-primary"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        <span className="group-hover/edit:underline">Sửa bài</span>
                      </Link>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => setConfirmDel(true)}
                        className="group/del inline-flex items-center gap-1 text-xs font-semibold text-red-500"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        <span className="group-hover/del:underline">Xóa bài</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-black text-[#101b0d] dark:text-white leading-snug">
                {post.title}
              </h1>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`size-9 rounded-full flex items-center justify-center text-sm font-bold ${avatarColor(post.user?.id ?? post.id)}`}>
                  {initials(post.user?.name)}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#101b0d] dark:text-white">{post.user?.name ?? 'Ẩn danh'}</p>
                  <p className="text-xs text-gray-400">Thành viên</p>
                </div>
              </div>

              {/* Content (HTML rich-text, có ảnh inline) */}
              <div className="rich-prose text-[#101b0d] dark:text-gray-200 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content || '' }} />

              {/* Action bar */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setLiked(v => !v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    liked
                      ? 'bg-primary/10 text-[#2E7D32] dark:text-primary'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-primary/10 hover:text-[#2E7D32]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]" style={liked ? { fontVariationSettings: "'FILL' 1" } : {}}>thumb_up</span>
                  Hữu ích
                </button>
                <button
                  onClick={() => setSaved(v => !v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    saved
                      ? 'bg-primary/10 text-[#2E7D32] dark:text-primary'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-primary/10 hover:text-[#2E7D32]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]" style={saved ? { fontVariationSettings: "'FILL' 1" } : {}}>bookmark</span>
                  Lưu
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-primary/10 hover:text-[#2E7D32] transition-colors ml-auto">
                  <span className="material-symbols-outlined text-[18px]">share</span>
                  Chia sẻ
                </button>
              </div>
            </article>

            {/* Comments — tạo/sửa/xoá, editor rich-text giống nội dung bài viết */}
            <CommentsSection postId={post.id} onCountChange={setCommentCount} />
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">

            {/* Author card */}
            <div className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] p-5 flex flex-col items-center gap-3 text-center">
              <div className={`size-14 rounded-full flex items-center justify-center text-xl font-bold ${avatarColor(post.user?.id ?? post.id)}`}>
                {initials(post.user?.name)}
              </div>
              <div>
                <p className="font-bold text-[#101b0d] dark:text-white">{post.user?.name ?? 'Ẩn danh'}</p>
                <p className="text-xs text-gray-400 mt-0.5">Thành viên diễn đàn</p>
              </div>
              <div className="w-full grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex flex-col items-center">
                  <span className="text-lg font-black text-[#101b0d] dark:text-white">{post.view_count ?? 0}</span>
                  <span className="text-xs text-gray-400">Lượt xem</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-lg font-black text-[#101b0d] dark:text-white">{commentCount}</span>
                  <span className="text-xs text-gray-400">Bình luận</span>
                </div>
              </div>
            </div>

            {/* Related posts */}
            {related.length > 0 && (
              <div className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] p-5 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-[#101b0d] dark:text-white">Bài viết liên quan</h3>
                <div className="flex flex-col gap-3">
                  {related.map(t => {
                    const rb = CAT_BADGE[t.category?.slug];
                    return (
                      <Link key={t.id} to={`/dien-dan/${t.slug}`} className="flex flex-col gap-1.5 group">
                        {rb && (
                          <span className={`text-xs font-semibold ${rb.cls.split(' ').find(c => c.startsWith('text-'))}`}>
                            {rb.label}
                          </span>
                        )}
                        <p className="text-sm font-medium text-[#101b0d] dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {t.title}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">chat_bubble</span>
                          {t.comment_count ?? 0} bình luận · {fmtDate(t.created_at)}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Back button */}
            <button
              onClick={() => navigate('/dien-dan')}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-[#d3e7cf] dark:border-[#3a5c35] text-sm font-medium text-[#599a4c] hover:border-primary hover:text-primary dark:text-gray-300 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Quay lại diễn đàn
            </button>
          </aside>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !deleting && setConfirmDel(false)} />
          <div className="relative bg-white dark:bg-[#132210] rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">delete_forever</span>
              </div>
              <div>
                <h3 className="font-bold text-[#101b0d] dark:text-white text-base">Xóa bài viết?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Bài viết, ảnh và toàn bộ bình luận sẽ bị xóa vĩnh viễn, không thể khôi phục.</p>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setConfirmDel(false)}
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
                  : <span className="material-symbols-outlined text-base">delete</span>}
                {deleting ? 'Đang xóa...' : 'Xóa bài viết'}
              </button>
            </div>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
};

export default ForumPostPage;
