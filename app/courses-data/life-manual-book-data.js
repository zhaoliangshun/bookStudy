// =============================================================
// 人生清醒手册 —— 章节数据聚合入口
// -------------------------------------------------------------
// 49 章 6 分组，从觉醒到自在的完整人生指南。
// 覆盖：觉醒篇 → 认知篇 → 处世篇 → 修心篇 → 成长篇 → 自在篇
//
// 路由：/life-manual
// =============================================================

import { chapters as batch1 } from "./life-manual-batch1";
import { chapters as batch2 } from "./life-manual-batch2";
import { chapters as batch3 } from "./life-manual-batch3";
import { chapters as batch4 } from "./life-manual-batch4";
import { chapters as batch5 } from "./life-manual-batch5";
import { chapters as batch6 } from "./life-manual-batch6";

export const lifeManualChapters = [
  ...batch1, ...batch2, ...batch3, ...batch4, ...batch5, ...batch6,
];

export const lifeManualChapterGroups = [
  "觉醒篇",
  "认知篇",
  "处世篇",
  "修心篇",
  "成长篇",
  "自在篇",
];
