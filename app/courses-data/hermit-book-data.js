// =============================================================
// 红尘之外：隐居生活之道 —— 章节数据聚合入口
// -------------------------------------------------------------
// 33 章 7 分组，文学哲思类散文。
// 覆盖：观红尘 → 看破执 → 断俗缘 → 寻归处 → 隐居道 → 心自在 → 得大自在
//
// 路由：/hermit
// =============================================================

import { chapters as batch1 } from "./hermit-chapters-batch1";
import { chapters as batch2 } from "./hermit-chapters-batch2";
import { chapters as batch3 } from "./hermit-chapters-batch3";
import { chapters as batch4 } from "./hermit-chapters-batch4";
import { chapters as batch5 } from "./hermit-chapters-batch5";
import { chapters as batch6 } from "./hermit-chapters-batch6";
import { chapters as batch7 } from "./hermit-chapters-batch7";

export const hermitChapters = [
  ...batch1, ...batch2, ...batch3, ...batch4, ...batch5, ...batch6, ...batch7,
];

export const hermitChapterGroups = [
  "观红尘",
  "看破执",
  "断俗缘",
  "寻归处",
  "隐居道",
  "心自在",
  "得大自在",
];
