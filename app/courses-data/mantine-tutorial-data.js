// =============================================================
// Mantine 教程 —— 章节聚合入口
// -------------------------------------------------------------
// 模式与 forgerock-tutorial-data.js / rhf-tutorial-data.js 一致：
//   import { chapters as batchN } from "./mantine-chapters-batchN";
//   export const mantineChapters = [...batch1, ...batch2, ...];
//   export const mantineChapterGroups = ["基础入门", ...];
// =============================================================

import { chapters as batch1 } from "./mantine-chapters-batch1";
import { chapters as batch2 } from "./mantine-chapters-batch2";
import { chapters as batch3 } from "./mantine-chapters-batch3";
import { chapters as batch4 } from "./mantine-chapters-batch4";

// 合并所有批次，按顺序排布
export const mantineChapters = [...batch1, ...batch2, ...batch3, ...batch4];

// 章节分组顺序（侧边栏展示用）
export const mantineChapterGroups = [
  "基础入门",
  "Form 核心",
  "Form + Zod",
  "CSS 自定义",
];
