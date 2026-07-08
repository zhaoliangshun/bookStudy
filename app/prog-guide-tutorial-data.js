// =============================================================
// 编程指南 - 章节数据（聚合入口）
// -------------------------------------------------------------
// 共 80 章，覆盖 10 大主题方向。
// 纯内容阅读型教程，无代码执行功能。
//
// 10 个 batch 文件，每组 8 章：
//   prog-guide-chapters-batch1.js : 计算机与编程入门 1-8
//   prog-guide-chapters-batch2.js : 编程思维与基础概念 9-16
//   prog-guide-chapters-batch3.js : 变量与数据类型 17-24
//   prog-guide-chapters-batch4.js : 控制流与逻辑 25-32
//   prog-guide-chapters-batch5.js : 函数与模块化 33-40
//   prog-guide-chapters-batch6.js : 面向对象编程 41-48
//   prog-guide-chapters-batch7.js : 函数式编程与高级概念 49-56
//   prog-guide-chapters-batch8.js : 调试、测试与代码质量 57-64
//   prog-guide-chapters-batch9.js : 工程实践与工具 65-72
//   prog-guide-chapters-batch10.js : 程序员成长与职业发展 73-80
// =============================================================

import { chapters as batch1 } from "./prog-guide-chapters-batch1";
import { chapters as batch2 } from "./prog-guide-chapters-batch2";
import { chapters as batch3 } from "./prog-guide-chapters-batch3";
import { chapters as batch4 } from "./prog-guide-chapters-batch4";
import { chapters as batch5 } from "./prog-guide-chapters-batch5";
import { chapters as batch6 } from "./prog-guide-chapters-batch6";
import { chapters as batch7 } from "./prog-guide-chapters-batch7";
import { chapters as batch8 } from "./prog-guide-chapters-batch8";
import { chapters as batch9 } from "./prog-guide-chapters-batch9";
import { chapters as batch10 } from "./prog-guide-chapters-batch10";

export const progGuideChapters = [
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
];

export const progGuideChapterGroups = [
  "计算机与编程入门",
  "编程思维与基础概念",
  "变量与数据类型",
  "控制流与逻辑",
  "函数与模块化",
  "面向对象编程",
  "函数式编程与高级概念",
  "调试、测试与代码质量",
  "工程实践与工具",
  "程序员成长与职业发展",
];
