# 技术文档

## 1. 技术栈选择

| 领域          | 技术方案                                | 说明                                                         |
| :------------ | :-------------------------------------- | :----------------------------------------------------------- |
| 前端框架      | React 18 + TypeScript                   | 组件化开发，类型安全，生态丰富                               |
| 构建工具      | 快一点                                  | 极速冷启动，HMR 体验好，配置简单                             |
| 样式方案      | 尾随 CSS                                | 原子化 CSS，快速构建响应式界面，易于定制主题                 |
| Markdown 解析 | `react-markdown` + `remark-gfm`         | 支持 GFM 语法（表格、任务列表等），基于 React 渲染，安全无 XSS |
| 代码高亮      | `react-syntax-highlighter`              | 支持 Prism / Highlight.js 主题，多语言语法高亮               |
| 状态管理      | React 上下文 + useReducer（或 Zustand） | 轻量，无需引入重型库，满足笔记列表与编辑状态同步             |
| 本地存储      | 本地存储                                | 数据持久化在浏览器端，离线可用，无需后端                     |
| 工具库        | `nanoid`（可选）                        | 生成唯一笔记 ID                                              |

> 说明：状态管理优先使用 React 内置 Context + useReducer，避免过度设计；如后续状态复杂度增加，可平滑迁移至 Zustand。

------

## 2. 项目结构

文本

```
markdown-notes/
├── public/
├── src/
│   ├── components/
│   │   ├── NoteList/
│   │   │   ├── NoteList.tsx           # 笔记列表容器
│   │   │   ├── NoteListItem.tsx       # 单个笔记项
│   │   │   └── NoteSearch.tsx         # 搜索框
│   │   ├── Editor/
│   │   │   ├── MarkdownEditor.tsx     # 编辑器 textarea
│   │   │   └── Toolbar.tsx            # 可选工具栏（预留）
│   │   ├── Preview/
│   │   │   ├── MarkdownPreview.tsx    # 预览容器
│   │   │   └── CodeBlock.tsx          # 自定义代码块渲染（高亮）
│   │   └── Layout/
│   │       ├── AppLayout.tsx          # 三栏布局
│   │       └── ResizeHandle.tsx       # 可拖拽分隔条（可选）
│   ├── hooks/
│   │   ├── useNotes.ts                # 笔记数据管理（CRUD + LocalStorage）
│   │   ├── useDebounce.ts             # 输入防抖
│   │   └── useLocalStorage.ts         # LocalStorage 封装
│   ├── types/
│   │   └── index.ts                   # TypeScript 类型定义
│   ├── utils/
│   │   ├── markdown.ts                # markdown 渲染配置
│   │   └── storage.ts                 # LocalStorage 读写工具
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                      # Tailwind 入口
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```



------

## 3. 数据模型

### 3.1 TypeScript 类型定义

typescript

```
// src/types/index.ts

export interface Note {
  id: string;          // 唯一标识，使用 nanoid 或 Date.now().toString()
  title: string;       // 笔记标题（取第一行或单独字段）
  content: string;     // Markdown 内容
  createdAt: number;   // 创建时间戳
  updatedAt: number;   // 最后更新时间戳
}

export type NoteList = Note[];

export interface NotesState {
  notes: Note[];
  activeNoteId: string | null;
  searchQuery: string;
  isListCollapsed: boolean;
}
```



### 3.2 LocalStorage 存储结构

- 关键词： `markdown-notes-data`
- **Value**: JSON 序列化后的 `Note[]`

json

```
[
  {
    "id": "a1b2c3",
    "title": "我的第一篇笔记",
    "content": "# 标题\n\n- 列表项\n```js\nconsole.log('hello')\n```",
    "createdAt": 1700000000000,
    "updatedAt": 1700000000000
  }
]
```



> 存储策略：每次笔记增删改后，将整个数组写入 LocalStorage。数据量较小时性能足够，简单可靠。

------

## 4. 关键技术点

### 4.1 Markdown 解析与实时预览

- 使用 `react-markdown` 渲染 Markdown 内容。
- 配置 `remark-gfm` 插件以支持表格、删除线、任务列表等 GFM 语法。
- 将编辑器输入的 `content` 通过 props 传入 `<MarkdownPreview content={content} />`，React 自动更新预览。
- 自定义 `code` 渲染组件，使用 `react-syntax-highlighter` 进行代码高亮。

tsx

```
// 示例：自定义代码块渲染
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  }}
>
  {content}
</ReactMarkdown>
```



### 4.2 代码高亮

- 使用 `react-syntax-highlighter` 的 Prism 版本（体积更小）。
- 默认引入 `vscDarkPlus` 或 `oneDark` 主题，以符合开发者审美。
- 在预览区域展示带语法高亮的代码块，语言根据 Markdown 代码块的语言标识自动识别。

### 4.3 数据持久化（LocalStorage）

- 封装 `useLocalStorage` Hook，负责读取和写入。
- 在 `useNotes` Hook 中统一管理笔记状态，所有修改操作（新建、删除、更新）后自动同步到 LocalStorage。
- 监听 `storage` 事件（可选），实现多标签页数据同步。

typescript

```
// 伪代码
const [notes, setNotes] = useLocalStorage<Note[]>('markdown-notes-data', []);

const addNote = (note: Note) => {
  setNotes([...notes, note]);
};

const updateNote = (id: string, content: string) => {
  setNotes(notes.map(n => n.id === id ? { ...n, content, updatedAt: Date.now() } : n));
};

const deleteNote = (id: string) => {
  setNotes(notes.filter(n => n.id !== id));
};
```



### 4.4 三栏布局与列表收起

- 使用 Tailwind 的 Flex/Grid 实现三栏布局：左侧列表（宽度可调或固定）、中间编辑器、右侧预览。
- 列表收起时，通过状态控制左侧栏宽度变为 0 或极窄宽度，并显示一个展开按钮。
- 使用 CSS transition 实现平滑动画。
- 编辑器与预览区域在移动端可上下分栏（使用响应式断点）。

### 4.5 搜索过滤

- 在 `NoteList` 组件中根据 `searchQuery` 过滤笔记。
- 匹配标题和内容（内容匹配可优化为仅标题，避免性能开销）。
- 使用 `useMemo` 缓存过滤结果，避免每次渲染都执行过滤。

### 4.6 性能优化

- **输入防抖**：编辑器输入更新状态时使用 `useDebounce`，延迟 200ms 更新预览内容，避免高频渲染。
- **React.memo**：对预览组件和列表项使用 `React.memo` 减少不必要的重渲染。
- **代码高亮懒加载**：如果高亮库体积较大，可考虑动态导入（`React.lazy`）或仅对可见代码块进行高亮（暂不强制）。

### 4.7 安全

- `react-markdown` 默认不渲染原始 HTML，有效防止 XSS。
- 如需支持 HTML 标签，可显式配置 `rehype-raw`，但需谨慎，并确保内容可信。
- LocalStorage 数据仅存储在本地，不涉及网络传输。

------

## 5. 后续可扩展方向

- 导出笔记为 `.md` 文件
- 多主题切换（暗色模式）
- 云同步（引入后端或第三方存储）
- 笔记标签、分类
- 快捷键支持
- 图片粘贴上传（转 Base64 或对象存储）