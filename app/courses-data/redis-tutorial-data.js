// =============================================================
// 《Redis 实战教程》- 章节聚合入口
// -------------------------------------------------------------
// 共 28 章，分为 6 部分：
//   入门与基础 / 数据结构进阶 / 持久化与过期策略
//   高可用架构 / 应用场景实战 / 性能优化与运维实战
// 纯阅读型书籍，无代码执行功能。
// =============================================================

import { chapters as batch1 } from "./redis-chapters-batch1";
import { chapters as batch2 } from "./redis-chapters-batch2";
import { chapters as batch3 } from "./redis-chapters-batch3";
import { chapters as batch4 } from "./redis-chapters-batch4";
import { chapters as batch5 } from "./redis-chapters-batch5";
import { chapters as batch6 } from "./redis-chapters-batch6";

export const redisChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
];

export const redisChapterGroups = [
  "第一部分 入门与基础",
  "第二部分 数据结构进阶",
  "第三部分 持久化与过期策略",
  "第四部分 高可用架构",
  "第五部分 应用场景实战",
  "第六部分 性能优化与运维实战",
];
