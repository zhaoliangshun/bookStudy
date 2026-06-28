// =============================================================
// Go 教程 - 章节数据聚合入口
// -------------------------------------------------------------
// 合并 5 个 batch 文件，导出统一数据供页面使用。
// 章节分组：
//   开篇、第一部分 基础入门、第二部分 语法进阶、第三部分 类型系统、
//   第四部分 高级特性、第五部分 实战与生态、结尾
// =============================================================

import { chapters as batch1 } from "./go-chapters-batch1";
import { chapters as batch2 } from "./go-chapters-batch2";
import { chapters as batch3 } from "./go-chapters-batch3";
import { chapters as batch4 } from "./go-chapters-batch4";
import { chapters as batch5 } from "./go-chapters-batch5";

export const goChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

export const goChapterGroups = [
  "开篇",
  "第一部分 基础入门",
  "第二部分 语法进阶",
  "第三部分 类型系统",
  "第四部分 高级特性",
  "第五部分 实战与生态",
  "结尾",
];
