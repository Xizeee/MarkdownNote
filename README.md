# Markdown Notes

基于浏览器的轻量级 Markdown 笔记应用，支持实时预览、代码高亮与本地存储。所有数据保存在浏览器 LocalStorage 中，无需登录，打开即用，完全离线可用。

## 功能特性

### 笔记管理（P0）
- 新建 / 删除 / 切换笔记
- 编辑器输入实时预览
- 笔记列表展示（标题 + 更新时间）
- 数据自动保存至 LocalStorage
- 代码块语法高亮（多语言）
- 首次使用自动创建一篇默认笔记

### 列表与搜索（P1）
- 笔记列表收起 / 展开
- 关键词搜索（匹配标题与内容）

### 编辑体验
- Tab 键插入缩进
- 切换 / 新建笔记自动聚焦编辑器
- 防抖保存与预览（200ms），输入流畅
- 三栏布局可拖拽调整宽度
- 移动端响应式（编辑器与预览上下堆叠，列表以抽屉形式展开）

## 技术栈

| 层级 | 技术 |
| :--- | :--- |
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite |
| 样式方案 | Tailwind CSS |
| Markdown 渲染 | react-markdown + remark-gfm |
| 代码高亮 | react-syntax-highlighter（Prism + vscDarkPlus） |
| 状态管理 | React Context + useReducer |
| 本地存储 | LocalStorage（useLocalStorage Hook 封装） |
| ID 生成 | nanoid |

## 目录结构

```
markdown-notes/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── README.md
└── src/
    ├── components/
    │   ├── Layout/
    │   │   ├── AppLayout.tsx          # 三栏布局
    │   │   └── ResizeHandle.tsx       # 可拖拽分隔条
    │   ├── NoteList/
    │   │   ├── NoteList.tsx            # 笔记列表容器
    │   │   ├── NoteListItem.tsx        # 单个笔记项
    │   │   └── NoteSearch.tsx          # 搜索框
    │   ├── Editor/
    │   │   ├── MarkdownEditor.tsx      # 编辑器 textarea
    │   │   └── Toolbar.tsx             # 编辑器顶部信息条
    │   └── Preview/
    │       ├── MarkdownPreview.tsx     # 预览容器
    │       └── CodeBlock.tsx           # 代码块高亮
    ├── hooks/
    │   ├── useNotes.ts                 # 笔记数据管理（Context + useReducer）
    │   ├── useDebounce.ts              # 输入防抖
    │   └── useLocalStorage.ts          # LocalStorage 通用封装
    ├── types/
    │   └── index.ts                    # 类型定义
    ├── utils/
    │   ├── markdown.ts                 # Markdown 工具函数
    │   └── storage.ts                  # 存储常量与默认内容
    ├── App.tsx
    ├── main.tsx
    └── index.css                       # Tailwind 入口 + Markdown 排版
```

## 安装与运行

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 3. 构建生产版本
npm run build

# 4. 预览生产构建
npm run preview
```

## 数据说明

- 存储键名：`markdown-notes-data`
- 存储格式：`Note[]` 的 JSON 字符串
- 数据仅保存在本地浏览器，不经过任何网络传输
- 清除浏览器 LocalStorage 即可重置所有数据

## 安全说明

- `react-markdown` 默认不渲染原始 HTML，有效防止 XSS
- 所有数据本地存储，无网络请求
- 删除笔记前需二次确认
