// =============================================================
// 内心平和：情绪控制的终极智慧 —— 章节数据聚合入口
// -------------------------------------------------------------
// 24 章 6 分组，场景驱动，用生活案例帮读者理解情绪控制。
// 覆盖：认识无常 → 放下过去 → 不焦虑未来 → 不在意他人 → 内在力量 → 从容生活
//
// 路由：/inner-peace
// =============================================================

import { chapters as batch1 } from "./inner-peace-batch1";
import { chapters as batch2 } from "./inner-peace-batch2";
import { chapters as batch3 } from "./inner-peace-batch3";
import { chapters as batch4 } from "./inner-peace-batch4";
import { chapters as batch5 } from "./inner-peace-batch5";
import { chapters as batch6 } from "./inner-peace-batch6";

export const innerPeaceChapters = [
  ...batch1, ...batch2, ...batch3, ...batch4, ...batch5, ...batch6,
];

export const innerPeaceChapterGroups = [
  "认识无常",
  "放下过去",
  "不焦虑未来",
  "不在意他人",
  "内在力量",
  "从容生活",
];