// =============================================================
// React 18 新特性教程章节数据（聚合入口）
// -------------------------------------------------------------
// 教程内容按章节分组拆分到 3 个独立文件，共 18 章：
//
//   react18-chapters-batch1.js : 并发渲染基础（6 章）
//     createRoot、自动批处理、并发渲染原理、startTransition、
//     useTransition、useDeferredValue
//
//   react18-chapters-batch2.js : Suspense 与 SSR（6 章）
//     Suspense 数据获取、SuspenseList、流式 SSR、选择性注水、
//     hydrateRoot、renderToPipeableStream
//
//   react18-chapters-batch3.js : 新 Hooks 与 API（6 章）
//     useId、useSyncExternalStore、useInsertionEffect、
//     Strict Mode 变化、并发模式陷阱、迁移指南
//
// 每个章节对象的结构：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名
//   content : Markdown 格式的详细讲解（含「底层原理」「常见陷阱」「性能提示」）
//   code    : 可在 Node 沙箱（/api/run）运行的纯 JS 演示代码
//             （React 18 特性无法直接在沙箱运行，故用纯 JS 模拟演示原理）
// =============================================================

import { chapters as batch1 } from "./react18-chapters-batch1";
import { chapters as batch2 } from "./react18-chapters-batch2";
import { chapters as batch3 } from "./react18-chapters-batch3";

// 按分组顺序拼接所有章节（18 章）
export const react18Chapters = [
  ...batch1,
  ...batch2,
  ...batch3,
];

// 侧边栏分组顺序（3 组 18 章）
export const react18ChapterGroups = [
  "并发渲染基础",
  "Suspense 与 SSR",
  "新 Hooks 与 API",
];
