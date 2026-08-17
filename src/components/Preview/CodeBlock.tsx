import { memo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  /** 代码语言标识，无标识时传 undefined */
  language: string | undefined;
  /** 代码内容 */
  value: string;
}

// 自定义代码块渲染：使用 react-syntax-highlighter 的 Prism 版本 + vscDarkPlus 主题
function CodeBlockImpl({ language, value }: CodeBlockProps) {
  return (
    <SyntaxHighlighter
      language={language || 'text'}
      style={vscDarkPlus}
      PreTag="div"
      showLineNumbers={false}
      customStyle={{
        margin: 0,
        borderRadius: '0.375rem',
        fontSize: '0.85rem',
        lineHeight: 1.6
      }}
    >
      {value.replace(/\n$/, '')}
    </SyntaxHighlighter>
  );
}

export const CodeBlock = memo(CodeBlockImpl);
