import { useCallback, useEffect, useRef } from 'react';

interface ResizeHandleProps {
  /** 拖拽时回调，参数为本次拖拽产生的位移（px），向右为正 */
  onDrag: (delta: number) => void;
  /** 分隔条方向：vertical 表示竖向分隔条（左右拖拽） */
  orientation: 'vertical';
}

// 可拖拽分隔条，用于调整编辑器/预览/列表的宽度
export function ResizeHandle({ onDrag, orientation }: ResizeHandleProps) {
  const lastXRef = useRef<number | null>(null);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (lastXRef.current === null) return;
      const delta = e.clientX - lastXRef.current;
      lastXRef.current = e.clientX;
      onDrag(delta);
    },
    [onDrag]
  );

  const handleMouseUp = useCallback(() => {
    lastXRef.current = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      lastXRef.current = e.clientX;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [handleMouseMove, handleMouseUp]
  );

  // 卸载时清理监听
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      onMouseDown={handleMouseDown}
      className="hidden w-1 shrink-0 cursor-col-resize bg-gray-200 transition-colors hover:bg-brand-400 md:block"
    />
  );
}
