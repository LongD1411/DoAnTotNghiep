import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect, useRef } from 'react';

// ── Sub-components ────────────────────────────────────────────────────────────

const ToolbarBtn = ({ onClick, active, title, children }) => (
  <button
    type="button"
    title={title}
    onMouseDown={e => { e.preventDefault(); onClick(); }}
    className={`size-7 rounded flex items-center justify-center text-sm transition-colors ${
      active
        ? 'bg-primary/20 text-[#2E7D32] dark:text-primary'
        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-600 dark:text-slate-400'
    }`}
  >
    {children}
  </button>
);

const Sep = () => <div className="w-px h-4 bg-slate-200 dark:bg-slate-600 mx-0.5 shrink-0" />;

// ── Main component ────────────────────────────────────────────────────────────

const RichTextEditor = ({
  value    = '',
  onChange,
  placeholder = 'Nhập nội dung...',
  minHeight   = 140,
  maxChars,           // optional — shows counter + hard limit when set
}) => {
  const isProgrammaticUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      CharacterCount.configure(maxChars ? { limit: maxChars } : {}),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'rich-prose focus:outline-none',
        style: `min-height:${minHeight}px; padding:10px 12px; font-size:0.875rem;`,
      },
    },
    onUpdate: ({ editor }) => {
      if (!isProgrammaticUpdate.current) onChange(editor.getHTML());
    },
  });

  // Sync khi value thay đổi bên ngoài, không emit lại
  useEffect(() => {
    if (!editor || editor.isDestroyed || editor.isFocused) return;
    if (value !== editor.getHTML()) {
      isProgrammaticUpdate.current = true;
      editor.commands.setContent(value || '', false);
      isProgrammaticUpdate.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const chars       = editor.storage.characterCount?.characters() ?? 0;
  const pct         = maxChars ? chars / maxChars : 0;
  const counterCls  = pct >= 1 ? 'text-red-500' : pct >= 0.85 ? 'text-amber-500' : 'text-slate-400';

  return (
    <div className="border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-700 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/60 transition-shadow">

      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-600 flex-wrap">

        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')} title="Đậm (Ctrl+B)">
          <strong className="text-base leading-none">B</strong>
        </ToolbarBtn>

        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')} title="Nghiêng (Ctrl+I)">
          <em className="font-serif italic text-base leading-none">I</em>
        </ToolbarBtn>

        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')} title="Gạch ngang">
          <s className="text-base leading-none font-medium">S</s>
        </ToolbarBtn>

        <Sep />

        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })} title="Tiêu đề lớn">
          <span className="text-xs font-black leading-none">H2</span>
        </ToolbarBtn>

        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })} title="Tiêu đề nhỏ">
          <span className="text-xs font-black leading-none">H3</span>
        </ToolbarBtn>

        <Sep />

        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')} title="Danh sách gạch đầu dòng">
          <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
        </ToolbarBtn>

        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')} title="Danh sách đánh số">
          <span className="material-symbols-outlined text-[18px]">format_list_numbered</span>
        </ToolbarBtn>

        <Sep />

        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')} title="Trích dẫn">
          <span className="material-symbols-outlined text-[18px]">format_quote</span>
        </ToolbarBtn>

        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Đường kẻ ngang">
          <span className="material-symbols-outlined text-[18px]">horizontal_rule</span>
        </ToolbarBtn>

        <Sep />

        <ToolbarBtn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title="Xóa định dạng">
          <span className="material-symbols-outlined text-[18px]">format_clear</span>
        </ToolbarBtn>
      </div>

      {/* ── Editor content ───────────────────────────────────────────── */}
      <EditorContent editor={editor} />

      {/* ── Character counter ────────────────────────────────────────── */}
      {maxChars && (
        <div className={`px-3 py-1 text-xs border-t border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 flex justify-end ${counterCls}`}>
          {chars.toLocaleString('vi-VN')} / {maxChars.toLocaleString('vi-VN')} ký tự
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
