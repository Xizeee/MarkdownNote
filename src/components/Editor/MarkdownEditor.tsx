import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
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

  // Tab 键插入两空格缩进（PRD 2.2 可选快捷键）
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const target = e.currentTarget;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const indent = '  ';
        const next = local.slice(0, start) + indent + local.slice(end);
        setLocal(next);
        // 下一帧恢复光标位置
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            const pos = start + indent.length;
            textareaRef.current.selectionStart = pos;
            textareaRef.current.selectionEnd = pos;
          }
        });
      }
    },
    [local]
  );

  return (
    <div className="flex h-full flex-col bg-white">
      <Toolbar />
      <textarea
        ref={textareaRef}
        value={local}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        placeholder="在此输入 Markdown 内容...&#10;支持标题、列表、引用、代码块、表格等 GFM 语法"
        className="flex-1 resize-none bg-white p-4 font-mono text-sm leading-6 text-gray-800 outline-none placeholder:text-gray-300"
        aria-label="Markdown 编辑器"
      />
    </div>
  );
}

export const MarkdownEditor = memo(MarkdownEditorImpl);
