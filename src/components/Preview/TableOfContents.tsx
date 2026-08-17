import { memo, useEffect, useMemo, useState } from 'react';
import { parseHeadings } from '../../utils/markdown';

interface TableOfContentsProps {
  content: string;
}

// 目录导航：解析标题生成 TOC，点击跳转，滚动时高亮当前标题
function TableOfContentsImpl({ content }: TableOfContentsProps) {
  const headings = useMemo(() => parseHeadings(content), [content]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  // 滚动监听：高亮当前可见标题（IntersectionObserver 观察预览区内的标题元素）
  useEffect(() => {
    if (headings.length === 0) return;
    const preview = document.querySelector<HTMLElement>('.markdown-body');
    if (!preview) return;
    const headingEls = Array.from(
      preview.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6')
    );
    if (headingEls.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        // 取最靠近视口顶部的可见标题
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const idx = headingEls.indexOf(visible[0].target as HTMLElement);
          if (idx >= 0) setActiveIndex(idx);
        }
      },
      { root: preview, rootMargin: '0px 0px -75% 0px', threshold: 0 }
    );
    headingEls.forEach(h => observer.observe(h));
    return () => observer.disconnect();
  }, [headings, content]);

  // 点击跳转：滚动到对应标题
  const handleClick = (idx: number) => {
    const preview = document.querySelector<HTMLElement>('.markdown-body');
    if (!preview) return;
    const headingEls = preview.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6');
    const el = headingEls[idx];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveIndex(idx);
    }
  };

  if (headings.length === 0) return null;

  return (
    <div className="no-print border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/60">
      <button
        type="button"
        onClick={() => setCollapsed(c => !c)}
        className="flex w-full items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        aria-expanded={!collapsed}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
        目录
        <span className="text-gray-400 dark:text-gray-500">({headings.length})</span>
        <span className="ml-auto text-gray-400 dark:text-gray-500">
          {collapsed ? '▸' : '▾'}
        </span>
      </button>
      {!collapsed && (
        <ul className="max-h-48 overflow-y-auto px-2 pb-2">
          {headings.map((h, i) => (
            <li key={`${h.index}-${i}`}>
              <button
                type="button"
                onClick={() => handleClick(i)}
                title={h.text}
                style={{ paddingLeft: `${0.5 + (h.level - 1) * 0.75}rem` }}
                className={`block w-full truncate py-0.5 pr-2 text-left text-xs transition ${
                  i === activeIndex
                    ? 'font-medium text-brand-600 dark:text-brand-400'
                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {h.text || '（空标题）'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const TableOfContents = memo(TableOfContentsImpl);
