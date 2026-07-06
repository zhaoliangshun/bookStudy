// =============================================================
// 程序员出路指南教程（future）章节数据聚合入口
// -------------------------------------------------------------
// 主题：大龄程序员失业后的出路指南
// 面向：30-45 岁面临职业转型的程序员群体
// 共 20 章，4 个分组：
//   future-chapters-batch1.js : 认清现状（5 章）
//   future-chapters-batch2.js : 留在技术圈（5 章）
//   future-chapters-batch3.js : 跨界转型（5 章）
//   future-chapters-batch4.js : 彻底转行（5 章）
//
// 本教程为纯内容阅读型教程，无代码执行功能。
// =============================================================

import { chapters as batch1 } from "./future-chapters-batch1";
import { chapters as batch2 } from "./future-chapters-batch2";
import { chapters as batch3 } from "./future-chapters-batch3";
import { chapters as batch4 } from "./future-chapters-batch4";

// 按分组顺序拼接所有章节
export const futureChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
];

// 侧边栏分组顺序（4 组 20 章）
export const futureChapterGroups = [
  "认清现状",
  "留在技术圈",
  "跨界转型",
  "彻底转行",
];
