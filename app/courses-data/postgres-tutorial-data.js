// =============================================================
// 《PostgreSQL 实战教程》- 章节聚合入口
// -------------------------------------------------------------
// 共 36 章，分为 6 部分：
//   入门与基础 / 查询进阶 / 高级特性
//   PG 特色功能 / 架构与高可用 / 性能优化与运维实战
// 纯阅读型书籍，无代码执行功能。
// =============================================================

import { chapters as batch1 } from "./postgres-chapters-batch1";
import { chapters as batch2 } from "./postgres-chapters-batch2";
import { chapters as batch3 } from "./postgres-chapters-batch3";
import { chapters as batch4 } from "./postgres-chapters-batch4";
import { chapters as batch5 } from "./postgres-chapters-batch5";
import { chapters as batch6 } from "./postgres-chapters-batch6";

export const postgresChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
];

export const postgresChapterGroups = [
  "第一部分 入门与基础",
  "第二部分 查询进阶",
  "第三部分 高级特性",
  "第四部分 PG 特色功能",
  "第五部分 架构与高可用",
  "第六部分 性能优化与运维实战",
];
