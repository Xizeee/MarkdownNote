# AGENTS.md

## 项目简介

**Markdown Notes** 是一个基于浏览器的本地 Markdown 笔记应用，支持实时预览、代码高亮、笔记管理等功能。所有数据存储在浏览器 LocalStorage 中，无需后端服务。

------

## 技术栈与核心依赖

- 前端框架：React 18 + TypeScript
- **构建工具**: 快一点
- **样式方案**: Tailwind CSS
- Markdown 渲染： `react-markdown` + `remark-gfm`
- **代码高亮**: `react-syntax-highlighter`（Prism 版本）
- 状态管理：React Context + useReducer（或 Zustand）
- **本地存储**: LocalStorage
- **ID 生成**: `nanoid`

------

## 开发环境与命令

bash

```
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 运行代码检查（如配置了 ESLint）
npm run lint
```



> Agent 在执行任何代码修改前，应先运行 `npm install` 确保依赖完整。

------

## 目录结构约定

文本

```
src/
├── components/
│   ├── NoteList/          # 笔记列表相关组件
│   ├── Editor/            # 编辑器组件
│   ├── Preview/           # 预览组件
│   └── Layout/            # 布局组件
├── hooks/                 # 自定义 Hooks
├── types/                 # TypeScript 类型定义
├── utils/                 # 工具函数
├── App.tsx
├── main.tsx
└── index.css
```



**规则**：

- 新增组件放入 `components/` 下对应功能子目录。
- 全局类型定义放在 `types/index.ts`。
- 通用工具函数被放在了 `utils/` 位置。
- 自定义 Hook 放在 `hooks/`。

------

## 代码规范

### TypeScript

- 严格模式开启，禁止使用 `any`（除非有明确理由并注释）。
- 所有组件 Props 必须定义 interface。
- 使用函数组件和 Hooks，避免类组件。

### 命名规范

- 组件文件与组件名使用 PascalCase（如 `NoteList.tsx`）。
- 非组件文件使用 camelCase（如 `useNotes.ts`）。
- 常量使用的格式为 UPPER_SNAKE_case。
- 变量和函数使用 camelCase。

### 样式（Tailwind CSS）

- 优先使用 Tailwind 原子类，避免自定义 CSS 文件。
- 复杂样式可提取为组件内联 `className`，或使用 `@apply` 在 `index.css` 中定义。
- 颜色、间距等遵循 Tailwind 默认主题，如需自定义请在 `tailwind.config.js` 中扩展。

### React 组件

- 组件应保持单一职责。
- 状态提升：跨组件共享状态应放在最近的公共父级或 Context 中。
- 避免在渲染函数中创建新对象或函数导致不必要的子组件重渲染，可使用 `useCallback`、`useMemo`。

------

## 数据层与状态管理

### LocalStorage 操作

- 使用 `useLocalStorage` Hook 封装对 LocalStorage 的读写。
- 存储键名统一为 `markdown-notes-data`，值为 `Note[]` 的 JSON 字符串。
- 所有笔记增删改操作必须通过 `useNotes` Hook 统一管理，确保状态与存储同步。

### 核心类型

typescript

```
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}
```



### 状态管理约定

- 使用 Context + useReducer 管理全局笔记状态，或使用 Zustand（如已引入）。
- `useNotes` 应提供：`notes`、`activeNoteId`、`addNote`、`updateNote`、`deleteNote`、`setActiveNote`。
- 搜索过滤逻辑放在 `NoteList` 组件内部，使用 `useMemo` 缓存结果。
- 列表收起状态可独立管理，也可纳入全局状态。

------

## 关键功能实现要点

### Markdown 渲染与预览

- 使用 `react-markdown` 渲染，配置 `remark-gfm`。
- 自定义 `code` 渲染器，使用 `react-syntax-highlighter` 高亮代码块。
- 预览区域应实时反映编辑器内容（可加防抖优化）。
- 代码高亮主题统一使用 `vscDarkPlus`（或 `oneDark` ）。

### 三栏布局

- 使用 Tailwind Flex/Grid 实现，左侧列表、中间编辑器、右侧预览。
- 列表支持收起，通过状态控制宽度，并添加过渡动画。
- 移动端响应式：使用 Tailwind 断点调整布局（如堆叠显示）。

### 编辑器

- 使用 `<textarea>` 作为基础编辑器，绑定 `value` 和 `onChange`。
- 支持 Tab 键插入缩进（可选）。
- 预留工具栏组件位置。

### 笔记列表

- 显示笔记标题和更新时间。
- 支持点击切换当前笔记。
- 删除操作需二次确认（可用 `confirm` 或自定义弹窗）。
- 搜索框根据标题和内容过滤（内容过滤可优化）。

------

## 开发流程与规范

### 分支策略

- 主分支：`main`（保护分支）
- 功能开发：从 `main` 创建 `feature/功能名` 分支
- 修复：`fix/问题描述`

### 提交信息规范

使用常规提交方式：

- `feat: 添加笔记搜索功能`
- `fix: 修复删除笔记后列表未更新问题`
- `style: 调整编辑器与预览间距`
- `refactor: 重构 useNotes Hook`
- `docs: 更新 README`

### 代码审查要点

- 是否遵循目录结构和命名规范
- 是否存在 `any` 类型
- 是否对 LocalStorage 操作进行了封装？
- 组件是否保持单一职责
- 性能敏感区域（预览、列表）是否使用 memo/useMemo

------

## 测试要求（如有）

- 目前项目未强制要求测试，但推荐为关键工具函数（如 storage 封装、搜索过滤）编写单元测试。
- 测试框架推荐使用 Vitest 和 React Testing Library。

------

## 常见任务操作指南

### 新增一个功能组件

1. 在 `src/components/` 下创建对应子目录。
2. 使用 PascalCase 命名组件文件和组件。
3. 在父组件中导入并使用。
4. 如有需要，在 `types/index.ts` 添加相关类型。
5. 更新 AGENTS.md 中的目录结构说明（如必要）。

### 修改样式

1. 优先使用 Tailwind 原子类。
2. 如需全局样式，在 `index.css` 中使用 `@apply` 或自定义 CSS。
3. 若需修改 Tailwind 配置，修改 `tailwind.config.js` 后重启开发服务器。

### 添加新依赖

1. 使用 `npm install 包名`。
2. 检查包体积和兼容性。
3. 更新 AGENTS.md 中的技术栈列表（如果是核心依赖）。
4. 在代码中按需引入，避免全量引入。

### 调整 LocalStorage 数据结构

1. 修改 `types/index.ts` 中的类型定义。
2. 更新 `useNotes` 或相关 Hook 中的读写逻辑。
3. 考虑到已有用户数据，需要处理数据迁移（如版本号、兼容旧数据）。

------

## 重要约束

- **禁止引入后端服务**：应用必须完全离线可用，数据仅存于 LocalStorage。
- **代码高亮必须使用 `react-syntax-highlighter`**：不要更换其他高亮库。
- **Markdown 渲染必须使用 `react-markdown`**：确保 XSS 安全。
- **UI 框架必须使用 Tailwind CSS**：不要引入其他 UI 组件库（如 Material-UI、Ant Design）。
- **状态管理保持轻量**：除非必要，不引入 Redux 等重型库。

------

## 备注

本文件是 Agent 操作项目的指导规范，开发过程中如有疑问，应优先参考此文件和已有的代码实现。如遇到规范冲突，以更具体的实现为准，并更新此文档。