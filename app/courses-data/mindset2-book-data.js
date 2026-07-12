// =============================================================
// 情绪控制全书 —— 章节数据聚合入口
// -------------------------------------------------------------
// 32 章 4 分组，从认知到自在的完整修炼之路。
// 覆盖：认知篇 → 修行篇 → 破局篇 → 自在篇
//
// 路由：/mindset2
// =============================================================

import { chapters as batch1 } from "./mindset2-batch1";
import { chapters as batch2 } from "./mindset2-batch2";
import { chapters as batch3 } from "./mindset2-batch3";
import { chapters as batch4 } from "./mindset2-batch4";

export const mindset2Chapters = [
  ...batch1, ...batch2, ...batch3, ...batch4,
];

export const mindset2ChapterGroups = [
  "认知篇",
  "修行篇",
  "破局篇",
  "自在篇",
];