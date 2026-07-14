// =============================================================
// 人性的弱点图谱 —— 章节数据聚合入口
// -------------------------------------------------------------
// 《人性的弱点图谱——看清自己，理解他人，走向成熟》
// 共 20 章，覆盖 5 大主题：
//   1. 认知偏差与思维陷阱（batch1, 1-4 章）
//   2. 情绪与应激反应（batch2, 5-8 章）
//   3. 社交与面子心理（batch3, 9-12 章）
//   4. 自我与意志陷阱（batch4, 13-16 章）
//   5. 改进与成长路径（batch5, 17-20 章）
//
// 纯内容阅读型书籍，无代码执行功能。
// content 字段为 Markdown 格式的深度讲解文章。
// =============================================================

import { chapters as batch1 } from "./human-weakness-chapters-batch1";
import { chapters as batch2 } from "./human-weakness-chapters-batch2";
import { chapters as batch3 } from "./human-weakness-chapters-batch3";
import { chapters as batch4 } from "./human-weakness-chapters-batch4";
import { chapters as batch5 } from "./human-weakness-chapters-batch5";

export const humanWeaknessChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

export const humanWeaknessChapterGroups = [
  "认知偏差与思维陷阱",
  "情绪与应激反应",
  "社交与面子心理",
  "自我与意志陷阱",
  "改进与成长路径",
];
