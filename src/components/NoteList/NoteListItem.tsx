import { memo, useState } from 'react';
import type { Note } from '../../types';
import { formatTime } from '../../utils/markdown';
import { ConfirmDialog } from '../Modal/ConfirmDialog';

interface NoteListItemProps {
  note: Note;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function NoteListItemImpl({ note, isActive, onSelect, onDelete }: NoteListItemProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    onDelete(note.id);
  };

  const handleCancel = () => setConfirmOpen(false);

  return (
    <>
      <li
        role="button"
        tabIndex={0}
        onClick={() => onSelect(note.id)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(note.id);
          }
        }}
        className={`
          group relative cursor-pointer rounded-md px-2.5 py-2 text-sm transition
          ${isActive
            ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200 dark:bg-brand-900/30 dark:text-brand-300 dark:ring-brand-700'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'}
        `}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 flex-1 truncate font-medium">
            {note.title || '无标题'}
          </h3>
          <button
            type="button"
            onClick={handleDeleteClick}
            className="shrink-0 rounded p-0.5 text-gray-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:text-gray-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
            aria-label={`删除笔记 ${note.title}`}
            title="删除笔记"
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
            >
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
          {formatTime(note.updatedAt)}
        </p>
      </li>

      {confirmOpen && (
        <ConfirmDialog
          title="删除笔记"
          message={`确定删除「${note.title || '无标题'}」吗？此操作不可恢复。`}
          confirmText="删除"
          cancelText="取消"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}

export const NoteListItem = memo(NoteListItemImpl);
