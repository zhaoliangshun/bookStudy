// =============================================================
// 程序员职业出路教程 - 章节数据（聚合入口）
// -------------------------------------------------------------
// 共 20 章，覆盖 4 大主题方向。
// 纯内容阅读型教程，无代码执行功能。
//
// 4 个 batch 文件，每组 5 章：
//   career-chapters-batch1.js : 技术深耕路线 1-5
//   career-chapters-batch2.js : 职业晋升通道 6-10
//   career-chapters-batch3.js : 跨界转型方向 11-15
//   career-chapters-batch4.js : 行业趋势与规划 16-20
// =============================================================

import { chapters as batch1 } from "./career-chapters-batch1";
import { chapters as batch2 } from "./career-chapters-batch2";
import { chapters as batch3 } from "./career-chapters-batch3";
import { chapters as batch4 } from "./career-chapters-batch4";

export const careerChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
];

export const careerChapterGroups = [
  "技术深耕路线",
  "职业晋升通道",
  "跨界转型方向",
  "行业趋势与规划",
];