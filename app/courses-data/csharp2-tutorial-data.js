// =============================================================
// C# 大全 - 章节数据聚合入口
// -------------------------------------------------------------
// 完整教程：54 章（前言 + 53 章正文），覆盖 C# 100% 日常开发知识点
// 适用版本：.NET 8 LTS / C# 12
//
// 9 个 batch 文件（2026-09 重构：删除旧版 batch2「面向对象编程」，
// 它与新版 batch3/4「面向对象基础/进阶」章节 id 重复导致路由串章；
// 原 batch1 第十章「调试技巧」移至第九部分作为 ch53）：
//   csharp2-chapters-batch1.js : 前言 + 第一部分 基础入门（ch01-09）
//   csharp2-chapters-batch3.js : 第二部分 面向对象基础（ch10-14）
//   csharp2-chapters-batch4.js : 第三部分 面向对象进阶（ch15-19）
//   csharp2-chapters-batch5.js : 第四部分 泛型与集合（ch20-26）
//   csharp2-chapters-batch6.js : 第五部分 委托事件与 LINQ（ch27-32）
//   csharp2-chapters-batch7.js : 第六部分 高级特性（ch33-38）
//   csharp2-chapters-batch8.js : 第七部分 异步与并发（ch39-42）
//   csharp2-chapters-batch9.js : 第八部分 IO 与序列化（ch43-46）
//   csharp2-chapters-batch10.js: 第九部分 工程化与实战（ch47-53）
// =============================================================

import { chapters as batch1 } from "./csharp2-chapters-batch1";
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
  "第二部分 面向对象基础",
  "第三部分 面向对象进阶",
  "第四部分 泛型与集合",
  "第五部分 委托事件与 LINQ",
  "第六部分 高级特性",
  "第七部分 异步与并发",
  "第八部分 IO 与序列化",
  "第九部分 工程化与实战",
];
