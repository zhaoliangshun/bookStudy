// =============================================================
// Python权威指南 - 章节数据（聚合入口）
// -------------------------------------------------------------
// 共 120 章，覆盖 15 大主题方向。
// 纯内容阅读型教程，无代码执行功能。
//
// 15 个 batch 文件，每组 8 章：
//   py-definitive-chapters-batch1.js  : Python入门与环境 1-8
//   py-definitive-chapters-batch2.js  : 数据类型基础 9-16
//   py-definitive-chapters-batch3.js  : 字符串与文本处理 17-24
//   py-definitive-chapters-batch4.js  : 列表与元组 25-32
//   py-definitive-chapters-batch5.js  : 字典与集合 33-40
//   py-definitive-chapters-batch6.js  : 控制流 41-48
//   py-definitive-chapters-batch7.js  : 函数基础 49-56
//   py-definitive-chapters-batch8.js  : 函数进阶 57-64
//   py-definitive-chapters-batch9.js  : 面向对象基础 65-72
//   py-definitive-chapters-batch10.js : 面向对象进阶 73-80
//   py-definitive-chapters-batch11.js : 模块、包与异常 81-88
//   py-definitive-chapters-batch12.js : 文件IO与标准库 89-96
//   py-definitive-chapters-batch13.js : 并发编程 97-104
//   py-definitive-chapters-batch14.js : 高级特性与元编程 105-112
//   py-definitive-chapters-batch15.js : 最佳实践与新特性 113-120
// =============================================================

import { chapters as batch1 } from "./py-definitive-chapters-batch1";
import { chapters as batch2 } from "./py-definitive-chapters-batch2";
import { chapters as batch3 } from "./py-definitive-chapters-batch3";
import { chapters as batch4 } from "./py-definitive-chapters-batch4";
import { chapters as batch5 } from "./py-definitive-chapters-batch5";
import { chapters as batch6 } from "./py-definitive-chapters-batch6";
import { chapters as batch7 } from "./py-definitive-chapters-batch7";
import { chapters as batch8 } from "./py-definitive-chapters-batch8";
import { chapters as batch9 } from "./py-definitive-chapters-batch9";
import { chapters as batch10 } from "./py-definitive-chapters-batch10";
import { chapters as batch11 } from "./py-definitive-chapters-batch11";
import { chapters as batch12 } from "./py-definitive-chapters-batch12";
import { chapters as batch13 } from "./py-definitive-chapters-batch13";
import { chapters as batch14 } from "./py-definitive-chapters-batch14";
import { chapters as batch15 } from "./py-definitive-chapters-batch15";

export const pyDefinitiveChapters = [
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
  ...batch13,
  ...batch14,
  ...batch15,
];

export const pyDefinitiveChapterGroups = [
  "Python入门与环境",
  "数据类型基础",
  "字符串与文本处理",
  "列表与元组",
  "字典与集合",
  "控制流",
  "函数基础",
  "函数进阶",
  "面向对象基础",
  "面向对象进阶",
  "模块、包与异常",
  "文件IO与标准库",
  "并发编程",
  "高级特性与元编程",
  "最佳实践与新特性",
];
