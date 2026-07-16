// =============================================================
// @forgerock/javascript-sdk 教程 —— 章节聚合入口
// -------------------------------------------------------------
// 模式与 rhf-tutorial-data.js / emotion-book-data.js 一致：
//   import { chapters as batchN } from "./forgerock-chapters-batchN";
//   export const forgerockChapters = [...batch1, ...batch2, ...];
//   export const forgerockChapterGroups = ["基础入门", "核心进阶", ...];
// =============================================================

import { chapters as batch1 } from "./forgerock-chapters-batch1";
import { chapters as batch2 } from "./forgerock-chapters-batch2";
import { chapters as batch3 } from "./forgerock-chapters-batch3";
import { chapters as batch4 } from "./forgerock-chapters-batch4";

// 合并所有批次，按顺序排布
export const forgerockChapters = [...batch1, ...batch2, ...batch3, ...batch4];

// 章节分组顺序（侧边栏展示用）
export const forgerockChapterGroups = [
  "基础入门",
  "核心进阶",
  "实战应用",
  "高级主题",
];
