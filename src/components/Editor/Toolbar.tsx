import { memo } from 'react';
import { useNotes } from '../../hooks/useNotes';
import { formatTime } from '../../utils/markdown';

// 编辑器顶部信息条：展示当前笔记标题、字数与更新时间（只读）
// 作为 PRD 4.3「预留工具栏组件位置」的实现，不引入未提及的编辑操作
function ToolbarImpl() {
  const { activeNote } = useNotes();

  if (!activeNote) {
    return (
      <div className="flex items-center border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-400">
        未选择笔记
      </div>
    );
  }

  const charCount = activeNote.content.length;
  const lineCount = activeNote.content ? activeNote.content.split('\n').length : 0;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500">
      <span className="truncate font-medium text-gray-600">
        {activeNote.title || '无标题'}
      </span>
      <span className="flex shrink-0 items-center gap-3">
        <span>{charCount} 字符</span>
        <span className="hidden sm:inline">{lineCount} 行</span>
        <span className="hidden sm:inline">已保存 · {formatTime(activeNote.updatedAt)}</span>
      </span>
    </div>
  );
}

export const Toolbar = memo(ToolbarImpl);
