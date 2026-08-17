import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode
} from 'react';
import { nanoid } from 'nanoid';
import type { Note, NotesContextValue } from '../types';
import { DEFAULT_NOTE_CONTENT, STORAGE_KEY } from '../utils/storage';
import { extractTitle } from '../utils/markdown';
import { useLocalStorage } from './useLocalStorage';

// UI 状态：与笔记数据本身无关的交互状态，由 useReducer 管理
interface UIState {
  activeNoteId: string | null;
  searchQuery: string;
  isListCollapsed: boolean;
}

type UIAction =
  | { type: 'setActive'; id: string | null }
  | { type: 'setSearch'; query: string }
  | { type: 'toggleCollapse' };

const INITIAL_UI: UIState = {
  activeNoteId: null,
  searchQuery: '',
  isListCollapsed: false
};

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'setActive':
      return { ...state, activeNoteId: action.id };
    case 'setSearch':
      return { ...state, searchQuery: action.query };
    case 'toggleCollapse':
      return { ...state, isListCollapsed: !state.isListCollapsed };
    default:
      return state;
  }
}

const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: { children: ReactNode }) {
  // 笔记数据持久化由 useLocalStorage Hook 统一封装
  const [notes, setNotes] = useLocalStorage<Note[]>(STORAGE_KEY, []);
  // 交互状态由 useReducer 管理（Context + useReducer 约定）
  const [ui, dispatch] = useReducer(uiReducer, INITIAL_UI);

  // 初始化：首次加载若无笔记则创建默认笔记，并选中第一篇
  useEffect(() => {
    if (notes.length === 0) {
      const now = Date.now();
      const defaultNote: Note = {
        id: nanoid(),
        title: '欢迎使用 Markdown Notes',
        content: DEFAULT_NOTE_CONTENT,
        createdAt: now,
        updatedAt: now
      };
      setNotes([defaultNote]);
      dispatch({ type: 'setActive', id: defaultNote.id });
    } else if (ui.activeNoteId === null) {
      dispatch({ type: 'setActive', id: notes[0].id });
    }
    // 仅在挂载时执行一次（首次初始化默认笔记与激活项）
  }, []);

  const addNote = useCallback(() => {
    const now = Date.now();
    const newNote: Note = {
      id: nanoid(),
      title: '新建笔记',
      content: '',
      createdAt: now,
      updatedAt: now
    };
    setNotes(prev => [newNote, ...prev]);
    dispatch({ type: 'setActive', id: newNote.id });
  }, [setNotes]);

  const updateNote = useCallback(
    (id: string, patch: Partial<Pick<Note, 'title' | 'content'>>) => {
      setNotes(prev =>
        prev.map(n => {
          if (n.id !== id) return n;
          const merged: Note = { ...n, ...patch, updatedAt: Date.now() };
          // 内容变化时自动重算标题（取首行或首个标题）
          if (patch.content !== undefined) {
            merged.title = extractTitle(patch.content, n.title);
          }
          return merged;
        })
      );
    },
    [setNotes]
  );

  const deleteNote = useCallback(
    (id: string) => {
      setNotes(prev => {
        const next = prev.filter(n => n.id !== id);
        // 若删除的是当前激活笔记，则切到第一篇
        if (ui.activeNoteId === id) {
          dispatch({ type: 'setActive', id: next[0]?.id ?? null });
        }
        return next;
      });
    },
    [setNotes, ui.activeNoteId]
  );

  const setActiveNote = useCallback((id: string) => {
    dispatch({ type: 'setActive', id });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'setSearch', query });
  }, []);

  const toggleListCollapsed = useCallback(() => {
    dispatch({ type: 'toggleCollapse' });
  }, []);

  const activeNote = useMemo(
    () => notes.find(n => n.id === ui.activeNoteId) ?? null,
    [notes, ui.activeNoteId]
  );

  const value = useMemo<NotesContextValue>(
    () => ({
      notes,
      activeNoteId: ui.activeNoteId,
      activeNote,
      searchQuery: ui.searchQuery,
      isListCollapsed: ui.isListCollapsed,
      addNote,
      updateNote,
      deleteNote,
      setActiveNote,
      setSearchQuery,
      toggleListCollapsed
    }),
    [
      notes,
      ui.activeNoteId,
      ui.searchQuery,
      ui.isListCollapsed,
      activeNote,
      addNote,
      updateNote,
      deleteNote,
      setActiveNote,
      setSearchQuery,
      toggleListCollapsed
    ]
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes(): NotesContextValue {
  const ctx = useContext(NotesContext);
  if (!ctx) {
    throw new Error('useNotes 必须在 NotesProvider 内部使用');
  }
  return ctx;
}
