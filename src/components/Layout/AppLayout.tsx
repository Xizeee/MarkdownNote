import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useNotes } from '../../hooks/useNotes';
import { ResizeHandle } from './ResizeHandle';

interface AppLayoutProps {
  list: ReactNode;
  editor: ReactNode;
  preview: ReactNode;
}

// 默认列表宽度
const DEFAULT_LIST_WIDTH = 280;
const MIN_LIST_WIDTH = 200;
const MAX_LIST_WIDTH = 480;
// 编辑器最小宽度，用于约束预览宽度
const MIN_PANE_WIDTH = 220;

// 三栏布局：左侧笔记列表（可收起）+ 中间编辑器 + 右侧预览
// 桌面端三栏水平排列，移动端编辑器与预览上下堆叠、列表以覆盖抽屉形式展开
export function AppLayout({ list, editor, preview }: AppLayoutProps) {
  const { isListCollapsed, toggleListCollapsed } = useNotes();

  const [listWidth, setListWidth] = useState(DEFAULT_LIST_WIDTH);
  const [previewWidth, setPreviewWidth] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 列表与编辑器之间的拖拽
  const onListEditorDrag = useCallback((delta: number) => {
    setListWidth(prev => Math.min(Math.max(prev + delta, MIN_LIST_WIDTH), MAX_LIST_WIDTH));
  }, []);

  // 编辑器与预览之间的拖拽
  const onEditorPreviewDrag = useCallback((delta: number) => {
    const container = containerRef.current;
    if (!container) return;
    const totalWidth = container.clientWidth;
    setPreviewWidth(prev => {
      const current = prev ?? totalWidth * 0.5;
      return Math.min(Math.max(current - delta, MIN_PANE_WIDTH), totalWidth - MIN_PANE_WIDTH);
    });
  }, []);

  // 窗口尺寸变化时校正预览宽度
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      if (!container) return;
      const totalWidth = container.clientWidth;
      setPreviewWidth(prev => {
        if (prev === null) return null;
        if (prev > totalWidth - MIN_PANE_WIDTH) {
          return Math.max(totalWidth - MIN_PANE_WIDTH, MIN_PANE_WIDTH);
        }
        return prev;
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-gray-50 text-gray-800">
      {/* 左侧：笔记列表 */}
      <aside
        className={`
          shrink-0 overflow-hidden border-r border-gray-200 bg-white transition-all duration-200 ease-in-out
          ${isListCollapsed
            ? 'w-0 md:w-12'
            : 'absolute inset-y-0 left-0 z-30 w-full shadow-lg md:static md:z-auto md:shadow-none'}
        `}
        style={isListCollapsed ? undefined : { width: undefined, flex: `0 0 ${listWidth}px` }}
        data-collapsed={isListCollapsed}
      >
        {/* 移动端展开列表时覆盖整屏，列表内部自带关闭按钮 */}
        {list}
      </aside>

      {/* 列表收起态：展开按钮 */}
      {isListCollapsed && (
        <button
          type="button"
          onClick={toggleListCollapsed}
          className="absolute left-12 top-1/2 z-20 hidden -translate-y-1/2 rounded-r border border-l-0 border-gray-200 bg-white px-1 py-5 text-gray-500 shadow hover:bg-gray-50 hover:text-gray-700 md:block"
          aria-label="展开笔记列表"
          title="展开列表"
        >
          ▸
        </button>
      )}

      {/* 列表与编辑器之间的分隔条（仅桌面端、列表展开时） */}
      {!isListCollapsed && <ResizeHandle onDrag={onListEditorDrag} orientation="vertical" />}

      {/* 右侧：编辑器 + 预览（桌面水平、移动上下堆叠） */}
      <div
        ref={containerRef}
        className="flex flex-1 flex-col overflow-hidden md:flex-row"
      >
        <section className="flex-1 overflow-hidden border-b border-gray-200 bg-white md:border-b-0 md:border-r">
          {editor}
        </section>

        {/* 编辑器与预览之间的分隔条（仅桌面端） */}
        <ResizeHandle onDrag={onEditorPreviewDrag} orientation="vertical" />

        <section
          className="flex-1 overflow-hidden bg-white md:flex-none"
          style={
            previewWidth !== null
              ? { width: `${previewWidth}px`, flex: 'none' }
              : undefined
          }
        >
          {preview}
        </section>
      </div>
    </div>
  );
}
