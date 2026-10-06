import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RichTextEditor from '../common/RichTextEditor';
import { getComments, createComment, updateComment, deleteComment } from '../../services/commentService';
import { getCurrentUser, isStaff } from '../../services/authService';
import { toastService, errMsg } from '../../services/toastService';
import { stripHtml, extractContentImages, totalSize, MAX_UPLOAD_BYTES } from '../../utils/richContent';

const initials = (name = '') => name.trim().split(/\s+/).slice(-2).map(w => w[0]).join('').toUpperCase() || '?';
const AVATAR_COLORS = ['bg-indigo-100 text-indigo-700', 'bg-pink-100 text-pink-700', 'bg-sky-100 text-sky-700', 'bg-amber-100 text-amber-700', 'bg-emerald-100 text-emerald-700'];
const avatarColor = (id = 0) => AVATAR_COLORS[id % AVATAR_COLORS.length];
const fmtDateTime = (iso) => (iso ? new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '');

// Tách ảnh + kiểm tra rỗng/dung lượng. Trả { content, files } hoặc null nếu không hợp lệ.
const prepareContent = async (html) => {
  const { content, files } = await extractContentImages(html);
  const hasSomething = stripHtml(content) || files.length > 0 || /https?:\/\//.test(content || '');
  if (!hasSomething) { toastService.error('Nội dung bình luận không được để trống'); return null; }
  if (totalSize(files) > MAX_UPLOAD_BYTES) { toastService.error('Tổng dung lượng ảnh vượt quá 10MB, vui lòng giảm bớt hoặc nén ảnh'); return null; }
  return { content, files };
};

const CommentsSection = ({ postId, onCountChange }) => {
  const me    = getCurrentUser();
  const staff = isStaff();

  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);

  // Form tạo mới
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formKey, setFormKey]       = useState(0); // remount editor để clear sau khi gửi

  // Sửa inline
  const [editingId, setEditingId]   = useState(null);
  const [editContent, setEditContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Xoá
  const [confirmDel, setConfirmDel] = useState(null);
  const [deleting, setDeleting]     = useState(false);

  useEffect(() => {
    setLoading(true);
    getComments(postId, { limit: 100 })
      .then(res => setComments(res.data.data.data))
      .catch(err => toastService.error(errMsg(err)))
      .finally(() => setLoading(false));
  }, [postId]);

  const syncCount = (list) => { onCountChange?.(list.length); return list; };

  // ── Tạo mới ────────────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    const prepared = await prepareContent(newContent);
    if (!prepared) return;

    setSubmitting(true);
    try {
      const res = await createComment({ post_id: postId, content: prepared.content }, prepared.files);
      setComments(prev => syncCount([...prev, res.data.data]));
      setNewContent('');
      setFormKey(k => k + 1);
      toastService.success('Đã đăng bình luận');
    } catch (err) {
      toastService.error(errMsg(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Sửa ────────────────────────────────────────────────────────────────────
  const startEdit = (c) => { setEditingId(c.id); setEditContent(c.content || ''); };
  const cancelEdit = () => { setEditingId(null); setEditContent(''); };

  const handleUpdate = async (id) => {
    const prepared = await prepareContent(editContent);
    if (!prepared) return;

    setSavingEdit(true);
    try {
      const res = await updateComment(id, { content: prepared.content }, prepared.files);
      setComments(prev => prev.map(c => (c.id === id ? res.data.data : c)));
      cancelEdit();
      toastService.success('Đã cập nhật bình luận');
    } catch (err) {
      toastService.error(errMsg(err));
    } finally {
      setSavingEdit(false);
    }
  };

  // ── Xoá ────────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirmDel) return;
    setDeleting(true);
    try {
      await deleteComment(confirmDel.id);
      setComments(prev => syncCount(prev.filter(c => c.id !== confirmDel.id)));
      setConfirmDel(null);
      toastService.success('Đã xóa bình luận');
    } catch (err) {
      toastService.error(errMsg(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-[#101b0d] dark:text-white flex items-center gap-2">
        <span className="material-symbols-outlined text-[#599a4c] text-[20px]">chat_bubble</span>
        {comments.length} bình luận
      </h2>

      {/* Form viết bình luận */}
      {me ? (
        <form onSubmit={handleCreate} className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] p-6 flex flex-col gap-3">
          <h3 className="text-base font-bold text-[#101b0d] dark:text-white">Viết bình luận</h3>
          <RichTextEditor
            key={formKey}
            value={newContent}
            onChange={setNewContent}
            enableImages
            placeholder="Chia sẻ kinh nghiệm hoặc câu hỏi của bạn... Kéo/thả hoặc dán ảnh để chèn."
            minHeight={120}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-[#3ed622] text-[#101b0d] text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting
                ? <span className="size-4 border-2 border-[#101b0d]/30 border-t-[#101b0d] rounded-full animate-spin" />
                : <span className="material-symbols-outlined text-[18px]">send</span>}
              Gửi bình luận
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] p-6 text-center text-sm text-gray-500">
          <Link to="/dang-nhap" className="text-primary font-semibold hover:underline">Đăng nhập</Link> để tham gia bình luận.
        </div>
      )}

      {/* Danh sách bình luận */}
      {loading ? (
        <div className="flex justify-center py-8">
          <span className="size-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="bg-white dark:bg-[#132210] rounded-xl border border-gray-100 dark:border-[#2a4524] p-8 flex flex-col items-center gap-2 text-gray-400">
          <span className="material-symbols-outlined text-[40px]">chat</span>
          <span className="text-sm">Chưa có bình luận nào. Hãy là người đầu tiên!</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map(c => {
            const isOwner = me?.id && c.user?.id === me.id;
            const canEdit = isOwner;
            const canDelete = isOwner || staff;
            const editing = editingId === c.id;

            return (
              <div key={c.id} className="bg-white dark:bg-[#132210] rounded-xl border border-gray-200 dark:border-[#2a4524] p-4 flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(c.user?.id ?? c.id)}`}>
                      {initials(c.user?.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#101b0d] dark:text-white truncate">{c.user?.name ?? 'Ẩn danh'}</p>
                      <p className="text-xs text-gray-400">
                        {fmtDateTime(c.created_at)}{c.is_edited && <span className="italic"> · đã sửa</span>}
                      </p>
                    </div>
                  </div>

                  {!editing && (canEdit || canDelete) && (
                    <div className="flex items-center gap-1 shrink-0">
                      {canEdit && (
                        <button
                          onClick={() => startEdit(c)}
                          title="Sửa bình luận"
                          className="flex items-center justify-center size-7 rounded-lg text-[#2E7D32] dark:text-primary hover:bg-primary/10 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setConfirmDel(c)}
                          title="Xóa bình luận"
                          className="flex items-center justify-center size-7 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Nội dung / Sửa inline */}
                {editing ? (
                  <div className="flex flex-col gap-2">
                    <RichTextEditor
                      value={editContent}
                      onChange={setEditContent}
                      enableImages
                      placeholder="Chỉnh sửa bình luận..."
                      minHeight={100}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={cancelEdit}
                        disabled={savingEdit}
                        className="px-4 py-2 text-sm font-semibold border border-gray-200 dark:border-[#3a5c35] text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-40"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => handleUpdate(c.id)}
                        disabled={savingEdit}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-primary hover:bg-[#3ed622] text-[#101b0d] rounded-lg transition-colors disabled:opacity-60"
                      >
                        {savingEdit
                          ? <span className="size-4 border-2 border-[#101b0d]/30 border-t-[#101b0d] rounded-full animate-spin" />
                          : <span className="material-symbols-outlined text-[16px]">save</span>}
                        Lưu
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rich-prose text-sm text-[#101b0d] dark:text-gray-200 leading-relaxed" dangerouslySetInnerHTML={{ __html: c.content || '' }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !deleting && setConfirmDel(null)} />
          <div className="relative bg-white dark:bg-[#132210] rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">delete_forever</span>
              </div>
              <div>
                <h3 className="font-bold text-[#101b0d] dark:text-white text-base">Xóa bình luận?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Bình luận sẽ bị xóa vĩnh viễn, không thể khôi phục.</p>
              </div>
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
                  : <span className="material-symbols-outlined text-base">delete</span>}
                {deleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CommentsSection;
