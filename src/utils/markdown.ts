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

// 触发 .md 文件下载（用于未来扩展；当前 P0/P1 未启用，但保留工具函数以备 P2）
export function downloadMarkdownFile(title: string, content: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title || 'note'}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
