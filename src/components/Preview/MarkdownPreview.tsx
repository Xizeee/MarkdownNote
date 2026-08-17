import { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';

interface MarkdownPreviewProps {
  /** Markdown 内容（已由编辑器防抖写入全局状态） */
  content: string;
}

// 自定义渲染器：代码块使用 CodeBlock 进行语法高亮
const components: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    const text = String(children);
    // 块级代码：有 language-xxx 标识，或文本含换行
    const isBlock = !!match || text.includes('\n');
    if (isBlock) {
      return <CodeBlock language={match?.[1]} value={text} />;
    }
    // 行内代码
    return (
      <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.85em] text-gray-800 dark:bg-gray-800 dark:text-gray-200" {...props}>
        {children}
      </code>
    );
  }
};

function MarkdownPreviewImpl({ content }: MarkdownPreviewProps) {
  return (
    <div className="markdown-body print-area h-full overflow-y-auto bg-white p-6 dark:bg-gray-900">
      {content ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {content}
        </ReactMarkdown>
      ) : (
        <p className="text-sm text-gray-400 dark:text-gray-500">
          预览区域为空，在左侧编辑器输入内容即可实时预览。
        </p>
      )}
    </div>
  );
}

// 使用 memo 避免非必要的重渲染（content 不变时跳过）
export const MarkdownPreview = memo(MarkdownPreviewImpl);
