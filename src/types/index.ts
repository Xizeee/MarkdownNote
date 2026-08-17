// 核心数据类型定义（与 TECH_DESIGN.md 3.1 节一致）

export interface Note {
  /** 唯一标识，由 nanoid 生成 */
  id: string;
  /** 笔记标题 */
  title: string;
  /** Markdown 正文内容 */
  content: string;
  /** 创建时间戳（ms） */
  createdAt: number;
  /** 最后更新时间戳（ms） */
  updatedAt: number;
}

export type NoteList = Note[];

export interface NotesState {
  notes: Note[];
  activeNoteId: string | null;
  searchQuery: string;
  isListCollapsed: boolean;
}

// useNotes Hook 暴露的对外 API
export interface NotesContextValue {
  notes: Note[];
  activeNoteId: string | null;
  activeNote: Note | null;
  searchQuery: string;
  isListCollapsed: boolean;
  addNote: () => void;
  updateNote: (id: string, patch: Partial<Pick<Note, 'title' | 'content'>>) => void;
  deleteNote: (id: string) => void;
  setActiveNote: (id: string) => void;
  setSearchQuery: (query: string) => void;
  toggleListCollapsed: () => void;
}
