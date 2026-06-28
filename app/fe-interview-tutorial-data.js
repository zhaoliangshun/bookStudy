// =============================================================
// 前端面试技巧指南 - 章节数据（聚合入口）
// -------------------------------------------------------------
// 共 20 章，覆盖 4 大面试主题方向。
// 纯内容阅读型教程，无代码执行功能。
//
// 4 个 batch 文件，每组 5 章：
//   fe-interview-chapters-batch1.js : 基础能力 1-5
//   fe-interview-chapters-batch2.js : 框架与工程化 6-10
//   fe-interview-chapters-batch3.js : 项目与算法 11-15
//   fe-interview-chapters-batch4.js : 实战准备 16-20
// =============================================================

import { chapters as batch1 } from "./fe-interview-chapters-batch1";
import { chapters as batch2 } from "./fe-interview-chapters-batch2";
import { chapters as batch3 } from "./fe-interview-chapters-batch3";
import { chapters as batch4 } from "./fe-interview-chapters-batch4";

export const feInterviewChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
];

export const feInterviewChapterGroups = [
  "基础能力",
  "框架与工程化",
  "项目与算法",
  "实战准备",
];