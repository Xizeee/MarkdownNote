import { useMemo } from 'react';
import { useNotes } from '../../hooks/useNotes';
import { NoteListItem } from './NoteListItem';
import { NoteSearch } from './NoteSearch';

// 笔记列表容器：标题栏 + 搜索 + 新建 + 列表
// 搜索过滤逻辑放在此组件内部，使用 useMemo 缓存
export function NoteList() {
  const {
    notes,
    activeNoteId,
    searchQuery,
    isListCollapsed,
    addNote,
    deleteNote,
    setActiveNote,
    setSearchQuery,
    toggleListCollapsed
  } = useNotes();

  // 标题与内容联合过滤，结果用 useMemo 缓存
  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      n =>
        n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }, [notes, searchQuery]);

  return (
    <div className="flex h-full flex-col">
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2.5">
        <h2 className="text-sm font-semibold text-gray-700">笔记</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={addNote}
            className="flex items-center gap-0.5 rounded-md bg-brand-500 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-brand-600"
            aria-label="新建笔记"
            title="新建笔记"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            新建
          </button>
          <button
            type="button"
            onClick={toggleListCollapsed}
            className="hidden rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 md:block"
            aria-label={isListCollapsed ? '展开列表' : '收起列表'}
            title={isListCollapsed ? '展开列表' : '收起列表'}
          >
            {isListCollapsed ? '▸' : '◂'}
          </button>
        </div>
      </div>

      {/* 移动端关闭按钮（列表展开时显示） */}
      <button
        type="button"
        onClick={toggleListCollapsed}
        className="absolute right-2 top-2 z-40 rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 md:hidden"
        aria-label="关闭列表"
      >
        ✕
      </button>

      {/* 搜索框 */}
      <div className="px-3 py-2">
        <NoteSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* 笔记列表 */}
      <ul className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
        {filteredNotes.length === 0 ? (
          <li className="px-2 py-8 text-center text-sm text-gray-400">
            {searchQuery ? '没有匹配的笔记' : '暂无笔记，点击「新建」开始'}
          </li>
        ) : (
          filteredNotes.map(note => (
            <NoteListItem
              key={note.id}
              note={note}
              isActive={note.id === activeNoteId}
              onSelect={setActiveNote}
              onDelete={deleteNote}
            />
          ))
        )}
      </ul>
    </div>
  );
}
