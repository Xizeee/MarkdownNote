import { memo, useCallback } from 'react';
import { useNotes } from '../../hooks/useNotes';
import { downloadMarkdownFile, formatTime, printToPdf, type FormatType } from '../../utils/markdown';
import { ThemeToggle } from '../ThemeToggle';

interface ToolbarProps {
  onFormat: (type: FormatType) => void;
  onInsertImage: () => void;
}

interface FormatButton {
  type: FormatType;
  label: string;
  title: string;
  className?: string;
}

// 格式按钮配置（label + title 含快捷键提示）
const FORMAT_BUTTONS: FormatButton[] = [
  { type: 'bold', label: 'B', title: '加粗 (Ctrl+B)', className: 'font-bold' },
  { type: 'italic', label: 'I', title: '斜体 (Ctrl+I)', className: 'italic' },
  { type: 'code', label: 'Code', title: '行内代码 (Ctrl+K)' },
  { type: 'h1', label: 'H1', title: '一级标题 (Ctrl+1)' },
  { type: 'h2', label: 'H2', title: '二级标题 (Ctrl+2)' },
  { type: 'h3', label: 'H3', title: '三级标题 (Ctrl+3)' },
  { type: 'quote', label: '\u201C', title: '引用 (Ctrl+Shift+Q)' },
  { type: 'ul', label: '\u2022', title: '无序列表 (Ctrl+Shift+U)' },
  { type: 'ol', label: '1.', title: '有序列表 (Ctrl+Shift+O)' },
  { type: 'link', label: '链接', title: '链接 (Ctrl+L)' },
  { type: 'codeblock', label: '```', title: '代码块 (Ctrl+Shift+K)', className: 'font-mono' }
];

// 编辑器工具栏：格式按钮 + 图片 + 主题切换 + 当前笔记信息 + 导出（MD / PDF）
function ToolbarImpl({ onFormat, onInsertImage }: ToolbarProps) {
  const { activeNote } = useNotes();

  const handleExport = useCallback(() => {
    if (activeNote) {
      downloadMarkdownFile(activeNote.title, activeNote.content);
    }
  }, [activeNote]);

  const handlePrint = useCallback(() => {
    if (activeNote) {
      printToPdf(activeNote.title);
    }
  }, [activeNote]);

  if (!activeNote) {
    return (
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500">
        <span>未选择笔记</span>
        <ThemeToggle />
      </div>
    );
  }

  const charCount = activeNote.content.length;

  return (
    <div className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
      {/* 第一行：格式按钮 + 主题切换 + 导出 */}
      <div className="flex items-center gap-0.5 px-2 py-1">
        {FORMAT_BUTTONS.map(btn => (
          <button
            key={btn.type}
            type="button"
            onClick={() => onFormat(btn.type)}
            title={btn.title}
            className={`min-w-[1.5rem] rounded px-1.5 py-1 text-xs text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 ${btn.className ?? ''}`}
          >
            {btn.label}
          </button>
        ))}
        <button
          type="button"
          onClick={onInsertImage}
          title="插入图片"
          className="flex items-center rounded px-1.5 py-1 text-xs text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>
        <div className="flex-1" />
        <ThemeToggle />
        <button
          type="button"
          onClick={handlePrint}
          title="导出为 PDF（在打印对话框选「另存为 PDF」）"
          className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M9 13h6M9 17h4" />
          </svg>
          PDF
        </button>
        <button
          type="button"
          onClick={handleExport}
          title="导出为 .md 文件"
          className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          MD
        </button>
      </div>
      {/* 第二行：笔记信息 */}
      <div className="flex items-center justify-between gap-3 px-3 pb-1 text-xs text-gray-500 dark:text-gray-400">
        <span className="truncate font-medium text-gray-600 dark:text-gray-300">
          {activeNote.title || '无标题'}
        </span>
        <span className="flex shrink-0 items-center gap-3">
          <span>{charCount} 字</span>
          <span className="hidden sm:inline">已保存 · {formatTime(activeNote.updatedAt)}</span>
        </span>
      </div>
    </div>
  );
}

export const Toolbar = memo(ToolbarImpl);
