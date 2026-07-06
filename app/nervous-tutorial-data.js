// =============================================================
// 《与紧张和解》- 章节数据聚合入口
// -------------------------------------------------------------
// 《与紧张和解——理解并化解遇事忐忑的心理指南》
// 共 20 章，覆盖 4 大主题：
//   1. 紧张的本质（batch1, 1-5 章）
//   2. 紧张的根源（batch2, 6-10 章）
//   3. 紧张的高发场景（batch3, 11-15 章）
//   4. 化解方法 + 与紧张共处（batch4, 16-20 章）
//
// 纯内容阅读型书籍，无代码执行功能。
// content 字段为 Markdown 格式的深度讲解文章。
// =============================================================

import { chapters as batch1 } from "./nervous-chapters-batch1";
import { chapters as batch2 } from "./nervous-chapters-batch2";
import { chapters as batch3 } from "./nervous-chapters-batch3";
import { chapters as batch4 } from "./nervous-chapters-batch4";

export const nervousChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
];

export const nervousChapterGroups = [
  "紧张的本质",
  "紧张的根源",
  "紧张的高发场景",
  "化解紧张的方法",
  "与紧张共处",
];
