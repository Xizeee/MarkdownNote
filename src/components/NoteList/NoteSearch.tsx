import { memo } from 'react';

interface NoteSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// 笔记搜索框：输入即过滤
function NoteSearchImpl({ value, onChange, placeholder = '搜索笔记...' }: NoteSearchProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
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
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-2 text-sm text-gray-700 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-1 focus:ring-brand-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:bg-gray-900"
        aria-label="搜索笔记"
      />
    </div>
  );
}

export const NoteSearch = memo(NoteSearchImpl);
