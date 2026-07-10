// =============================================================
// Python vs JavaScript/TypeScript/Node.js 深度对比 —— 章节数据聚合入口
// -------------------------------------------------------------
// 从设计哲学到底层实现，从语法差异到选型指南，
// 系统对比 Python 与 JS/TS/Node.js 的方方面面。
//
// 覆盖：概览与历史 → 语法与类型 → 运行时与底层
//       → 并发与异步 → 生态与工程 → 选型指南
// =============================================================

import { chapters as batch1 } from "./pyvsjs-chapters-batch1";
import { chapters as batch2 } from "./pyvsjs-chapters-batch2";
import { chapters as batch3 } from "./pyvsjs-chapters-batch3";
import { chapters as batch4 } from "./pyvsjs-chapters-batch4";
import { chapters as batch5 } from "./pyvsjs-chapters-batch5";
import { chapters as batch6 } from "./pyvsjs-chapters-batch6";
import { chapters as batch7 } from "./pyvsjs-chapters-batch7";

export const pyvsjsChapters = [
  ...batch1, ...batch2, ...batch3, ...batch4, ...batch5, ...batch6, ...batch7,
];

export const pyvsjsChapterGroups = [
  "概览与历史",
  "语法与类型",
  "运行时与底层",
  "并发与异步",
  "生态与工程",
  "选型指南",
];
