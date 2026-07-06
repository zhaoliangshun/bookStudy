// =============================================================
// 《MongoDB 实战教程》- 章节聚合入口
// -------------------------------------------------------------
// 共 30 章，分为 6 部分：
//   入门与基础 / 查询进阶与删除 / 聚合进阶与索引
//   数据建模 / 高可用架构 / 性能优化与运维实战
// 纯阅读型书籍，无代码执行功能。
// =============================================================

import { chapters as batch1 } from "./mongo-chapters-batch1";
import { chapters as batch2 } from "./mongo-chapters-batch2";
import { chapters as batch3 } from "./mongo-chapters-batch3";
import { chapters as batch4 } from "./mongo-chapters-batch4";
import { chapters as batch5 } from "./mongo-chapters-batch5";
import { chapters as batch6 } from "./mongo-chapters-batch6";

export const mongoChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
];

export const mongoChapterGroups = [
  "第一部分 入门与基础",
  "第二部分 查询进阶与删除",
  "第三部分 聚合进阶与索引",
  "第四部分 数据建模",
  "第五部分 高可用架构",
  "第六部分 性能优化与运维实战",
];
