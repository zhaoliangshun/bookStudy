// =============================================================
// 计算机工作原理教程（howitworks）章节数据聚合入口
// -------------------------------------------------------------
// 主题：面向开发者的计算机原理——代码是怎么跑起来的
// 面向：已经会写代码、想理解底层原理以提升开发能力的开发者
// 共 20 章，4 个分组：
//   howitworks-chapters-batch1.js : 代码执行原理（5 章）
//   howitworks-chapters-batch2.js : 内存与数据（5 章）
//   howitworks-chapters-batch3.js : 并发与IO（5 章）
//   howitworks-chapters-batch4.js : 现代运行时（5 章）
//
// 本教程为纯内容阅读型教程，无代码执行功能。
// =============================================================

import { chapters as batch1 } from "./howitworks-chapters-batch1";
import { chapters as batch2 } from "./howitworks-chapters-batch2";
import { chapters as batch3 } from "./howitworks-chapters-batch3";
import { chapters as batch4 } from "./howitworks-chapters-batch4";

// 按分组顺序拼接所有章节
export const howitworksChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
];

// 侧边栏分组顺序（4 组 20 章）
export const howitworksChapterGroups = [
  "代码执行原理",
  "内存与数据",
  "并发与IO",
  "现代运行时",
];
