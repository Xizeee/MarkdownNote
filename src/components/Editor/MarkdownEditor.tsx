import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { applyFormat, type FormatType } from '../../utils/markdown';
import { Toolbar } from './Toolbar';

interface MarkdownEditorProps {
  /** 当前笔记的 Markdown 内容 */
  content: string;
  /** 内容变化回调（已防抖 200ms） */
  onChange: (content: string) => void;
  /** 触发自动聚焦的 key（如 activeNoteId），变化时聚焦 textarea */
  autoFocusKey?: string | null;
}

// 编辑器：基于 textarea，实时更新本地 state，防抖写入全局状态
function MarkdownEditorImpl({ content, onChange, autoFocusKey }: MarkdownEditorProps) {
  const [local, setLocal] = useState(content);
  const debounced = useDebounce(local, 200);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // content 变化时同步本地：仅当 content 与 debounced 不同（外部切换笔记）时同步；
  // onChange 回流时 content === debounced，不覆盖用户最新输入
  // 依赖仅 [content]，避免 debounced 变化（用户输入 200ms 后）误触发并覆盖 local
  useEffect(() => {
    if (content !== debounced) {
      setLocal(content);
    }
  }, [content]);

  // 防抖后写入全局状态（触发 LocalStorage 持久化）
  useEffect(() => {
    if (debounced !== content) {
      onChange(debounced);
    }
  }, [debounced, content, onChange]);

  // 切换笔记 / 新建笔记时自动聚焦编辑器
  useEffect(() => {
    textareaRef.current?.focus();
  }, [autoFocusKey]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocal(e.target.value);
  }, []);

  // 在下一帧恢复光标选区并聚焦（setLocal 后 DOM 更新完成）
  const restoreSelection = useCallback((start: number, end: number) => {
    requestAnimationFrame(() => {
      const t = textareaRef.current;
      if (t) {
        t.selectionStart = start;
        t.selectionEnd = end;
        t.focus();
      }
    });
  }, []);

  // 应用 Markdown 格式化（快捷键与工具栏按钮共用入口）
  // 通过 textareaRef 读取 DOM 当前值，避免依赖 local state，保持引用稳定
  const formatText = useCallback((type: FormatType) => {
    const t = textareaRef.current;
    if (!t) return;
    const result = applyFormat(type, t.value, t.selectionStart, t.selectionEnd);
    setLocal(result.text);
    restoreSelection(result.selectionStart, result.selectionEnd);
  }, [restoreSelection]);

  // 快捷键：Ctrl/Cmd 组合键触发格式化；Tab 缩进、Shift+Tab 反缩进
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const mod = e.ctrlKey || e.metaKey;

      // Tab / Shift+Tab 缩进
      if (e.key === 'Tab') {
        e.preventDefault();
        const t = e.currentTarget;
        const value = t.value;
        const start = t.selectionStart;
        if (e.shiftKey) {
          // 反缩进：去除光标所在行行首最多 2 个空格
          const lineStart = value.lastIndexOf('\n', start - 1) + 1;
          const head = value.slice(lineStart, lineStart + 2);
          const removeLen = head.startsWith('  ') ? 2 : head.startsWith(' ') ? 1 : 0;
          if (removeLen > 0) {
            const next = value.slice(0, lineStart) + value.slice(lineStart + removeLen);
            setLocal(next);
            restoreSelection(Math.max(lineStart, start - removeLen), Math.max(lineStart, start - removeLen));
          }
        } else {
          // 缩进：光标处插入两个空格
          const indent = '  ';
          const end = t.selectionEnd;
          const next = value.slice(0, start) + indent + value.slice(end);
          setLocal(next);
          restoreSelection(start + indent.length, start + indent.length);
        }
        return;
      }

      if (!mod) return;

      const key = e.key.toLowerCase();
      let type: FormatType | null = null;
      if (key === 'b') type = 'bold';
      else if (key === 'i') type = 'italic';
      else if (key === 'k' && !e.shiftKey) type = 'code';
      else if (key === 'k' && e.shiftKey) type = 'codeblock';
      else if (key === '1') type = 'h1';
      else if (key === '2') type = 'h2';
      else if (key === '3') type = 'h3';
      else if (key === 'l') type = 'link';
      else if (key === 'q' && e.shiftKey) type = 'quote';
      else if (key === 'u' && e.shiftKey) type = 'ul';
      else if (key === 'o' && e.shiftKey) type = 'ol';

      if (type) {
        e.preventDefault();
        formatText(type);
      }
    },
    [formatText, restoreSelection]
  );

  return (
    <div className="flex h-full flex-col bg-white">
      <Toolbar onFormat={formatText} />
      <textarea
        ref={textareaRef}
        value={local}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        placeholder={'在此输入 Markdown 内容...\n支持标题、列表、引用、代码块、表格等 GFM 语法'}
        className="flex-1 resize-none bg-white p-4 font-mono text-sm leading-6 text-gray-800 outline-none placeholder:text-gray-300"
        aria-label="Markdown 编辑器"
      />
    </div>
  );
}

export const MarkdownEditor = memo(MarkdownEditorImpl);
