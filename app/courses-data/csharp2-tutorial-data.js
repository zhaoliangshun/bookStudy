// =============================================================
// C# 从入门到精通大全 —— 章节数据聚合入口
// -------------------------------------------------------------
// 定位：大而全的 C# 参考书，52 章覆盖日常开发 100% 高频知识点
// 版本：.NET 8 LTS / C# 12，所有示例用顶级语句（可在线运行）
//
// 10 个 batch 文件：
//   csharp2-chapters-batch1.js  : 前言 + 入门基础（1-5 章）
//   csharp2-chapters-batch2.js  : 控制流与方法（6-9 章）
//   csharp2-chapters-batch3.js  : 面向对象基础（10-14 章）
//   csharp2-chapters-batch4.js  : 面向对象进阶（15-19 章）
//   csharp2-chapters-batch5.js  : 泛型与集合（20-26 章）
//   csharp2-chapters-batch6.js  : 委托事件与 LINQ（27-32 章）
//   csharp2-chapters-batch7.js  : 高级特性（33-38 章）
//   csharp2-chapters-batch8.js  : 异步与并发（39-42 章）
//   csharp2-chapters-batch9.js  : IO 与序列化（43-46 章）
//   csharp2-chapters-batch10.js : 工程化与实战 + 结语（47-52 章）
// =============================================================

import { chapters as batch1 } from "./csharp2-chapters-batch1";
import { chapters as batch2 } from "./csharp2-chapters-batch2";
import { chapters as batch3 } from "./csharp2-chapters-batch3";
import { chapters as batch4 } from "./csharp2-chapters-batch4";
import { chapters as batch5 } from "./csharp2-chapters-batch5";
import { chapters as batch6 } from "./csharp2-chapters-batch6";
import { chapters as batch7 } from "./csharp2-chapters-batch7";
import { chapters as batch8 } from "./csharp2-chapters-batch8";
import { chapters as batch9 } from "./csharp2-chapters-batch9";
import { chapters as batch10 } from "./csharp2-chapters-batch10";

export const csharp2Chapters = [
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

export const csharp2ChapterGroups = [
  "开篇",
  "第一部分 入门基础",
  "第二部分 控制流与方法",
  "第三部分 面向对象基础",
  "第四部分 面向对象进阶",
  "第五部分 泛型与集合",
  "第六部分 委托事件与 LINQ",
  "第七部分 高级特性",
  "第八部分 异步与并发",
  "第九部分 IO 与序列化",
  "第十部分 工程化与实战",
  "结尾",
];
