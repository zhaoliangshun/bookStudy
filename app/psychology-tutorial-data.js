// =============================================================
// 心理学书籍 - 章节数据（聚合入口）
// -------------------------------------------------------------
// 《心向阳光——心理健康与自我疗愈指南》
// 共 20 章，覆盖 4 大主题：
//   1. 心理学入门与心理健康基础（batch1, 1-5 章）
//   2. 心理疗愈理论与方法（batch2, 6-10 章）
//   3. 拧巴性格的识别与疗愈（batch3, 11-15 章）
//   4. 实践方法与自我疗愈指南（batch4, 16-20 章）
//
// 纯内容阅读型书籍，无代码执行功能。
// content 字段为 Markdown 格式的深度讲解文章。
// =============================================================

import { chapters as batch1 } from "./psychology-chapters-batch1";
import { chapters as batch2 } from "./psychology-chapters-batch2";
import { chapters as batch3 } from "./psychology-chapters-batch3";
import { chapters as batch4 } from "./psychology-chapters-batch4";

export const psychologyChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
];

export const psychologyChapterGroups = [
  "心理学入门",
  "心理疗愈理论",
  "拧巴性格疗愈",
  "自我疗愈实践",
];
