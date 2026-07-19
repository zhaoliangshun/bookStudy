"use client";

import TutorialPage from "../components/TutorialPage";
import { tsx3Chapters, tsx3ChapterGroups } from "../courses-data/tsx3-tutorial-data";

// =============================================================
// React 中使用 TypeScript 从入门到精通大全（全新重写版）
// -------------------------------------------------------------
// 定位：完全重新编写的 TS+React 大而全教程，覆盖日常开发 100% 高频知识点
// 版本：TypeScript 5.x + React 18 + Vite 实战可运行
// 内容：
//   ① TS 类型基础与进阶（原始类型 / 泛型 / 条件类型 / 工具类型）
//   ② React + TS 工程基础（JSX / 函数组件 / Props / forwardRef / Context）
//   ③ 事件与表单（事件类型 / 受控组件 / Hook Form / Zod）
//   ④ Hooks 全解（useState / useEffect / useReducer / 自定义 Hook / 并发 Hook）
//   ⑤ 性能优化（memo / 虚拟列表 / Suspense / 性能分析）
//   ⑥ 数据请求（fetch / axios / SWR / TanStack Query）
//   ⑦ 状态管理（Context / Zustand / Redux Toolkit / Jotai）
//   ⑧ 路由（React Router v6 / Next.js App Router）
//   ⑨ 样式方案（CSS Modules / Tailwind / styled-components / UI 库）
//   ⑩ 测试（Jest / RTL / Playwright）
//   ⑪ 工程化（Vite / ESLint / CI/CD / Monorepo）
//   ⑫ 进阶主题（RSC / i18n / a11y）
// 代码沙箱：/api/run-ts（TS 转译 + Node 沙箱）
// =============================================================
export default function Tsx3Tutorial() {
  return (
    <TutorialPage
      chapters={tsx3Chapters}
      chapterGroups={tsx3ChapterGroups}
      bookPath="/tsx3"
      bookTitle="React 中使用 TypeScript 从入门到精通大全"
      defaultLang="tsx"
      tip="点击章节开始学习 TS+React，所有 demo 均可在线运行"
      footerText="TypeScript 5 + React 18 全新重写版 · demo 驱动 · 类型基础 / 组件 / Hooks / 性能 / 路由 / 表单 / 数据请求 / 样式 / 测试 / 工程化"
    />
  );
}
