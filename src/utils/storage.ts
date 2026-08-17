// LocalStorage 相关常量与默认内容
// 读写封装统一由 hooks/useLocalStorage.ts 提供

// 存储键名（与 TECH_DESIGN.md 3.2 节一致）
export const STORAGE_KEY = 'markdown-notes-data';

// 首次使用时的默认笔记内容
export const DEFAULT_NOTE_CONTENT = `# 欢迎使用 Markdown Notes

这是一款**轻量、本地、离线可用**的 Markdown 笔记应用。

## 功能亮点

- 实时预览：左侧编辑，右侧即时渲染
- GFM 语法：支持表格、任务列表、删除线等
- 代码高亮：多语言语法高亮

\`\`\`ts
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet('Markdown Notes'));
\`\`\`

## 任务清单

- [x] 新建 / 删除 / 切换笔记
- [x] 实时预览
- [ ] 开始你的第一篇笔记
`;
