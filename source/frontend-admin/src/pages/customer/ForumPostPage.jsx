import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/customer/CustomerLayout';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { FAKE_THREADS, FAKE_COMMENTS, CAT_BADGE } from '../../data/forumData';

const ForumPostPage = () => {
  const { slug } = useParams();
  const navigate  = useNavigate();
  const loading   = false;

  const id     = parseInt(slug?.split('-')[0], 10);
  const thread = FAKE_THREADS.find(t => t.id === id);
  const badge  = thread ? CAT_BADGE[thread.catId] : null;
  const comments = (thread && FAKE_COMMENTS[thread.id]) ?? [];
  const related  = FAKE_THREADS.filter(t => !t.pinned && t.id !== id && t.catId === thread?.catId).slice(0, 3);

  const [reply, setReply]       = useState('');
  const [replyErr, setReplyErr] = useState('');
  const [liked, setLiked]       = useState(false);
  const [saved, setSaved]       = useState(false);

  const handleReplyChange = (e) => {
    const val = e.target.value;
    setReply(val);
    if (!val.trim())           setReplyErr('Nội dung không được để trống');
    else if (val.trim().length < 10) setReplyErr('Tối thiểu 10 ký tự');
    else                       setReplyErr('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reply.trim() || reply.trim().length < 10) {
      setReplyErr('Vui lòng nhập tối thiểu 10 ký tự');
      return;
    }
    alert('Bình luận đã được gửi (demo)');
    setReply('');
    setReplyErr('');
  };

  if (!thread) {
    return (
      <CustomerLayout>
        <div className="w-full px-4 md:px-10 lg:px-20 xl:px-40 py-20 flex flex-col items-center gap-4 text-center">
          <span className="material-symbols-outlined text-[64px] text-gray-300">forum</span>
          <h2 className="text-2xl font-bold text-[#101b0d] dark:text-white">Không tìm thấy bài viết</h2>
          <p className="text-gray-500">Bài viết này có thể đã bị xoá hoặc đường dẫn không hợp lệ.</p>
          <Link to="/dien-dan" className="mt-2 flex items-center gap-1 text-primary font-bold hover:underline">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Quay lại diễn đàn
          </Link>
        </div>
      </CustomerLayout>
    );
  }

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
          {badge && (
            <>
              <span className="text-[#599a4c] font-medium">{badge.label}</span>
              <span className="text-[#599a4c]">/</span>
            </>
          )}
          <span className="text-[#101b0d] dark:text-white font-medium line-clamp-1 max-w-[260px]">{thread.title}</span>
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
                {thread.pinned && (
                  <span className="inline-flex items-center gap-1 text-primary text-xs font-semibold">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>push_pin</span>
                    Ghim
                  </span>
                )}
                {thread.hot && (
                  <span className="inline-flex items-center gap-1 text-orange-500 text-xs font-semibold">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                    Hot
                  </span>
                )}
                <span className="flex items-center gap-1 text-gray-400 text-xs">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  {thread.time}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-black text-[#101b0d] dark:text-white leading-snug">
                {thread.title}
              </h1>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`size-9 rounded-full flex items-center justify-center text-sm font-bold ${thread.avatarColor}`}>
                  {thread.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#101b0d] dark:text-white">{thread.author}</p>
                  <p className="text-xs text-gray-400">Thành viên</p>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-4 text-[#101b0d] dark:text-gray-200 leading-relaxed">
                {thread.content.map((para, i) => (
                  <p key={i} className="text-base">{para}</p>
                ))}
              </div>

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
                  <span className="material-symbols-outlined text-[18px]"
                    style={liked ? { fontVariationSettings: "'FILL' 1" } : {}}>thumb_up</span>
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
                  <span className="material-symbols-outlined text-[18px]"
                    style={saved ? { fontVariationSettings: "'FILL' 1" } : {}}>bookmark</span>
                  Lưu
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-primary/10 hover:text-[#2E7D32] transition-colors ml-auto">
                  <span className="material-symbols-outlined text-[18px]">share</span>
                  Chia sẻ
                </button>
              </div>
            </article>

            {/* Comments */}
            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-[#101b0d] dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#599a4c] text-[20px]">chat_bubble</span>
                {comments.length} bình luận
              </h2>

              {comments.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {comments.map(c => (
                    <div key={c.id} className="bg-white dark:bg-[#132210] rounded-xl border border-gray-100 dark:border-[#2a4524] p-5 flex gap-4">
                      <div className={`size-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${c.avatarColor}`}>
                        {c.initials}
                      </div>
                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-[#101b0d] dark:text-white">{c.author}</span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                            {c.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-[#132210] rounded-xl border border-gray-100 dark:border-[#2a4524] p-8 flex flex-col items-center gap-2 text-gray-400">
                  <span className="material-symbols-outlined text-[40px]">chat</span>
                  <span className="text-sm">Chưa có bình luận nào. Hãy là người đầu tiên!</span>
                </div>
              )}
            </section>

            {/* Reply form */}
            {!thread.locked && (
              <section className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] p-6 flex flex-col gap-4">
                <h3 className="text-base font-bold text-[#101b0d] dark:text-white">Viết bình luận</h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <div>
                    <textarea
                      rows={4}
                      placeholder="Chia sẻ kinh nghiệm hoặc câu hỏi của bạn..."
                      value={reply}
                      onChange={handleReplyChange}
                      className={`w-full rounded-lg border px-4 py-3 text-sm text-[#101b0d] dark:text-white bg-[#f9fcf8] dark:bg-[#1c3019] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-colors ${
                        replyErr ? 'border-red-400' : 'border-[#d3e7cf] dark:border-[#3a5c35]'
                      }`}
                    />
                    {replyErr && <p className="text-sm text-red-500 mt-1">{replyErr}</p>}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!!replyErr || !reply.trim()}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-[#3ed622] text-[#101b0d] text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      Gửi bình luận
                    </button>
                  </div>
                </form>
              </section>
            )}

            {thread.locked && (
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 rounded-lg px-4 py-3 text-sm text-gray-500 border border-gray-200 dark:border-white/10">
                <span className="material-symbols-outlined text-[18px]">lock</span>
                Bài viết này đã bị khoá, không thể bình luận thêm.
              </div>
            )}
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">

            {/* Author card */}
            <div className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] p-5 flex flex-col items-center gap-3 text-center">
              <div className={`size-14 rounded-full flex items-center justify-center text-xl font-bold ${thread.avatarColor}`}>
                {thread.initials}
              </div>
              <div>
                <p className="font-bold text-[#101b0d] dark:text-white">{thread.author}</p>
                <p className="text-xs text-gray-400 mt-0.5">Thành viên diễn đàn</p>
              </div>
              <div className="w-full grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex flex-col items-center">
                  <span className="text-lg font-black text-[#101b0d] dark:text-white">
                    {FAKE_THREADS.filter(t => t.author === thread.author).length}
                  </span>
                  <span className="text-xs text-gray-400">Bài viết</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-lg font-black text-[#101b0d] dark:text-white">{thread.comments}</span>
                  <span className="text-xs text-gray-400">Trả lời</span>
                </div>
              </div>
            </div>

            {/* Related posts */}
            {related.length > 0 && (
              <div className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] p-5 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-[#101b0d] dark:text-white">Bài viết liên quan</h3>
                <div className="flex flex-col gap-3">
                  {related.map(t => {
                    const rb = CAT_BADGE[t.catId];
                    return (
                      <Link
                        key={t.id}
                        to={`/dien-dan/${t.slug}`}
                        className="flex flex-col gap-1.5 group"
                      >
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
                          {t.comments} bình luận · {t.time}
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
    </CustomerLayout>
  );
};

export default ForumPostPage;
