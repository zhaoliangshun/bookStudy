// =============================================================
// C# 大全 - 章节数据聚合入口
// -------------------------------------------------------------
// 完整教程：61 章（前言 + 60 章正文），覆盖 C# 100% 日常开发知识点
// 适用版本：.NET 8 LTS / C# 12
//
// 6 个 batch 文件:
//   csharp2-chapters-batch1.js : 第一部分 基础入门（第 1-10 章）
//   csharp2-chapters-batch2.js : 第二部分 面向对象（第 11-20 章）
//   csharp2-chapters-batch3.js : 第三部分 集合与泛型（第 21-30 章）
//   csharp2-chapters-batch4.js : 第四部分 高级特性（第 31-40 章）
//   csharp2-chapters-batch5.js : 第五部分 异步与并发（第 41-50 章）
//   csharp2-chapters-batch6.js : 第六部分 实战应用（第 51-60 章）+ 结语
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
  "第一部分 基础入门",
  "第二部分 面向对象编程",
  "第三部分 面向对象基础",
  "第四部分 面向对象进阶",
  "第五部分 泛型与集合",
  "第六部分 委托事件与 LINQ",
  "第七部分 高级特性",
  "第八部分 异步与并发",
  "第九部分 IO 与序列化",
  "第十部分 工程化与实战",
];
