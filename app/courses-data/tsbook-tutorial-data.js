// =============================================================
// TypeScript 全解 · 聚合入口
// -------------------------------------------------------------
// 共 60 章，拆成 12 个 batch，覆盖从环境搭建到类型体操的完整知识体系。
// 分组顺序：入门 → 核心 → 进阶 → 高级 → 工程化 → 实战
// =============================================================

import { chapters as batch1 } from "./tsbook-chapters-batch1";
import { chapters as batch2 } from "./tsbook-chapters-batch2";
import { chapters as batch3 } from "./tsbook-chapters-batch3";
import { chapters as batch4 } from "./tsbook-chapters-batch4";
import { chapters as batch5 } from "./tsbook-chapters-batch5";
import { chapters as batch6 } from "./tsbook-chapters-batch6";
import { chapters as batch7 } from "./tsbook-chapters-batch7";
import { chapters as batch8 } from "./tsbook-chapters-batch8";
import { chapters as batch9 } from "./tsbook-chapters-batch9";
import { chapters as batch10 } from "./tsbook-chapters-batch10";
import { chapters as batch11 } from "./tsbook-chapters-batch11";
import { chapters as batch12 } from "./tsbook-chapters-batch12";

export const tsBookChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
  ...batch7,
  ...batch8,
  ...batch9,
  ...batch10,
  ...batch11,
  ...batch12,
];

export const tsBookChapterGroups = [
  "入门基础",
  "类型系统",
  "函数与接口",
  "泛型体系",
  "高级类型",
  "类型守卫与窄化",
  "面向对象",
  "模块工程化",
  "类型体操",
  "React 实战",
  "Node.js 实战",
  "设计模式与最佳实践",
];
