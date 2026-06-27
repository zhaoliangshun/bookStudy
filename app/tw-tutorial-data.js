// =============================================================
// Tailwind CSS 教程章节数据（聚合入口）
// -------------------------------------------------------------
// 教程内容按章节分组拆分到 4 个独立文件：
//   tw-chapters-batch1.js : 基础（intro, core-concepts, colors, spacing）
//   tw-chapters-batch2.js : 排版与布局（typography, flexbox, grid,
//                                  positioning）
//   tw-chapters-batch3.js : 组件样式（borders, shadows, backgrounds,
//                                  forms）
//   tw-chapters-batch4.js : 进阶（responsive, darkmode, customization,
//                                  patterns）
//
// 与 Node.js / TypeScript 教程不同，Tailwind 教程的 code 字段是
// HTML 片段（带 Tailwind class），前端用 iframe + Tailwind Play CDN
// 实时渲染预览，而不是在 vm 沙箱里执行。
// =============================================================

import { chapters as batch1 } from "./tw-chapters-batch1";
import { chapters as batch2 } from "./tw-chapters-batch2";
import { chapters as batch3 } from "./tw-chapters-batch3";
import { chapters as batch4 } from "./tw-chapters-batch4";

// 按分组顺序拼接所有章节
export const twChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
];

// 侧边栏分组顺序
export const twChapterGroups = [
  "基础",
  "排版与布局",
  "组件样式",
  "进阶",
];
