// =============================================================
// Python vs Java 深度对比 —— 章节数据聚合入口
// -------------------------------------------------------------
// 38 章深度对比，覆盖 6 大维度：
// 概览与历史 / 语法与类型 / 运行时与底层 /
// 并发与异步 / 生态与工程 / 选型指南
//
// 教程定位：纯阅读型（代码示例在 content 的 markdown 代码块中展示）
// 重点对比：设计哲学、语法、运行时、并发模型、生态、选型决策
// =============================================================

import { chapters as batch1 } from "./pyvsjava-chapters-batch1";
import { chapters as batch2 } from "./pyvsjava-chapters-batch2";
import { chapters as batch3 } from "./pyvsjava-chapters-batch3";
import { chapters as batch4 } from "./pyvsjava-chapters-batch4";
import { chapters as batch5 } from "./pyvsjava-chapters-batch5";
import { chapters as batch6 } from "./pyvsjava-chapters-batch6";
import { chapters as batch7 } from "./pyvsjava-chapters-batch7";

export const pyvsjavaChapters = [
  ...batch1, ...batch2, ...batch3, ...batch4,
  ...batch5, ...batch6, ...batch7,
];

export const pyvsjavaChapterGroups = [
  "概览与历史",
  "语法与类型",
  "运行时与底层",
  "并发与异步",
  "生态与工程",
  "选型指南",
];
