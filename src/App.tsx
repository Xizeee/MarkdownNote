import { useCallback } from 'react';
import { AppLayout } from './components/Layout/AppLayout';
import { NoteList } from './components/NoteList/NoteList';
import { MarkdownEditor } from './components/Editor/MarkdownEditor';
import { MarkdownPreview } from './components/Preview/MarkdownPreview';
import { useNotes } from './hooks/useNotes';

interface EmptyStateProps {
  message: string;
}

function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex h-full items-center justify-center bg-white p-6 text-center text-sm text-gray-400 dark:bg-gray-900 dark:text-gray-500">
      {message}
    </div>
  );
}

export default function App() {
  const { activeNote, updateNote } = useNotes();

  // 用 useCallback 稳定 onChange 引用，避免 MarkdownEditor 因 props 变化而重渲染
  const handleContentChange = useCallback(
    (content: string) => {
      if (activeNote) {
        updateNote(activeNote.id, { content });
      }
    },
    [activeNote?.id, updateNote]
  );

  return (
    <AppLayout
      list={<NoteList />}
      editor={
        activeNote ? (
          <MarkdownEditor
            key={activeNote.id}
            content={activeNote.content}
            onChange={handleContentChange}
            autoFocusKey={activeNote.id}
          />
        ) : (
          <EmptyState message="请选择一篇笔记或点击「新建」开始" />
        )
      }
      preview={
        activeNote ? (
          <MarkdownPreview content={activeNote.content} />
        ) : (
          <EmptyState message="暂无内容可预览" />
        )
      }
    />
  );
}
