// 计算机原理实战教程 —— 数据聚合入口
// -------------------------------------------------------------
// 定位：面向开发者的「计算机原理」教程
//   · 用生活化比喻讲解计算机运转的本质
//   · 每章配可运行的 C / Shell / Python demo
//   · 既适合入门，也对资深程序员有参考价值
//
// 16 章 / 4 分组 / demo 在本地沙箱实测可运行
//   1. 硬件基础：从开关到 CPU
//   2. 数据表示：二进制与编码
//   3. 内存与存储：层级结构
//   4. 程序的执行：从代码到运行

import { chapters as batch1 } from "./comp-chapters-batch1.js";
import { chapters as batch2 } from "./comp-chapters-batch2.js";
import { chapters as batch3 } from "./comp-chapters-batch3.js";
import { chapters as batch4 } from "./comp-chapters-batch4.js";

export const compChapters = [
  ...batch1, ...batch2, ...batch3, ...batch4,
];

export const compChapterGroups = [
  "硬件基础",
  "数据表示",
  "内存与存储",
  "程序执行",
];
