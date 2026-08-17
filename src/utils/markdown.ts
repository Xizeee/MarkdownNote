// Markdown 相关工具函数

// 从 markdown 内容提取标题（首个非空 # 一级/二级标题或首行非空文本）
export function extractTitle(content: string, fallback = '无标题'): string {
  if (!content) return fallback;
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const headingMatch = /^#{1,6}\s+(.+)$/.exec(trimmed);
    if (headingMatch) return headingMatch[1].trim();
    return trimmed;
  }
  return fallback;
}

// 格式化时间戳为友好显示
export function formatTime(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
  if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`;

  const date = new Date(ts);
  const year = date.getFullYear();
  const sameYear = year === new Date(now).getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day2 = String(date.getDate()).padStart(2, '0');
  return sameYear ? `${month}-${day2}` : `${year}-${month}-${day2}`;
}

// 清洗文件名：移除非法字符，避免跨平台问题
export function sanitizeFilename(name: string): string {
  const cleaned = name.replace(/[\\/:*?"<>|]/g, '').trim();
  return cleaned || 'note';
}

// 触发 .md 文件下载（P2 导出笔记功能）
export function downloadMarkdownFile(title: string, content: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(title)}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ===== Markdown 格式化（快捷键 / 工具栏共用，纯函数便于测试）=====

export type FormatType =
  | 'bold'
  | 'italic'
  | 'code'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'quote'
  | 'ul'
  | 'ol'
  | 'link'
  | 'codeblock';

export interface FormatResult {
  text: string;
  selectionStart: number;
  selectionEnd: number;
}

// 用 prefix/suffix 包裹选中文本；无选中时插入占位文本
function wrapSelection(
  text: string,
  start: number,
  end: number,
  prefix: string,
  suffix: string,
  placeholder = '文本'
): FormatResult {
  const selected = text.slice(start, end);
  if (selected) {
    const next = text.slice(0, start) + prefix + selected + suffix + text.slice(end);
    return {
      text: next,
      selectionStart: start + prefix.length,
      selectionEnd: start + prefix.length + selected.length
    };
  }
  const next = text.slice(0, start) + prefix + placeholder + suffix + text.slice(end);
  return {
    text: next,
    selectionStart: start + prefix.length,
    selectionEnd: start + prefix.length + placeholder.length
  };
}

// 在选区涉及的每行前切换前缀（已存在则去除，否则添加）
function toggleLinePrefix(
  text: string,
  start: number,
  end: number,
  prefix: string
): FormatResult {
  const lineStart = text.lastIndexOf('\n', start - 1) + 1;
  const lineEndIdx = text.indexOf('\n', end);
  const lineEnd = lineEndIdx === -1 ? text.length : lineEndIdx;
  const block = text.slice(lineStart, lineEnd);
  const lines = block.split('\n');
  const allHave = lines.every(l => l.startsWith(prefix));
  const newLines = lines.map(l => (allHave ? l.slice(prefix.length) : prefix + l));
  const newBlock = newLines.join('\n');
  const next = text.slice(0, lineStart) + newBlock + text.slice(lineEnd);
  return {
    text: next,
    selectionStart: lineStart,
    selectionEnd: lineStart + newBlock.length
  };
}

// 插入链接：[文本](url)
function insertLink(text: string, start: number, end: number): FormatResult {
  const selected = text.slice(start, end);
  const linkText = selected || '链接文本';
  const url = 'https://';
  const inserted = `[${linkText}](${url})`;
  const next = text.slice(0, start) + inserted + text.slice(end);
  // 选中 url 部分便于用户直接输入真实地址
  const urlStart = start + 1 + linkText.length + 2; // [text](
  return {
    text: next,
    selectionStart: urlStart,
    selectionEnd: urlStart + url.length
  };
}

// 插入代码块：包裹 ``` 围栏
function insertCodeBlock(text: string, start: number, end: number): FormatResult {
  const selected = text.slice(start, end);
  if (selected) {
    const next = text.slice(0, start) + '```\n' + selected + '\n```' + text.slice(end);
    return {
      text: next,
      selectionStart: start,
      selectionEnd: start + 4 + selected.length + 4
    };
  }
  const placeholder = '\n代码\n';
  const next = text.slice(0, start) + '```\n' + placeholder + '```' + text.slice(end);
  return {
    text: next,
    selectionStart: start + 4,
    selectionEnd: start + 4
  };
}

// 根据类型应用格式化（快捷键与工具栏按钮共用入口）
export function applyFormat(
  type: FormatType,
  text: string,
  start: number,
  end: number
): FormatResult {
  switch (type) {
    case 'bold':
      return wrapSelection(text, start, end, '**', '**', '加粗');
    case 'italic':
      return wrapSelection(text, start, end, '*', '*', '斜体');
    case 'code':
      return wrapSelection(text, start, end, '`', '`', 'code');
    case 'h1':
      return toggleLinePrefix(text, start, end, '# ');
    case 'h2':
      return toggleLinePrefix(text, start, end, '## ');
    case 'h3':
      return toggleLinePrefix(text, start, end, '### ');
    case 'quote':
      return toggleLinePrefix(text, start, end, '> ');
    case 'ul':
      return toggleLinePrefix(text, start, end, '- ');
    case 'ol':
      return toggleLinePrefix(text, start, end, '1. ');
    case 'link':
      return insertLink(text, start, end);
    case 'codeblock':
      return insertCodeBlock(text, start, end);
    default:
      return { text, selectionStart: start, selectionEnd: end };
  }
}
