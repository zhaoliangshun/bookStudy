// =============================================================
// C# 从入门到精通大全（全新版）—— 章节数据聚合入口
// -------------------------------------------------------------
// 完全重新编写的「大而全」C# 参考书：
//   - 共 94 篇（前言 + 92 讲 + 结语），覆盖从环境搭建到生产运维
//   - 15 个 batch 文件，每章 demo 驱动，注释详尽
//   - 生产基线：.NET 10 LTS / C# 14；交互 demo 兼容 net8.0 / C# 12
//
// 章节分组（14 部分）：
//   batch1  : 开篇 + 入门基础（前言 + 5 章）
//   batch2  : 核心语法 上（变量到字符串 + 数组，7 章）
//   batch3  : 核心语法 下（6 章）
//   batch4  : 面向对象 上（5 章）
//   batch5  : 面向对象 下（5 章）
//   batch6  : 泛型与集合（7 章）
//   batch7  : 委托、事件与 Lambda（5 章）
//   batch8  : LINQ（5 章）
//   batch9  : 异步与并发（6 章）
//   batch10 : 文件 IO 与序列化（5 章）
//   batch11 : 反射与特性（4 章）
//   batch12 : 异常处理与调试（4 章）
//   batch13 : 内存管理与性能（5 章）
//   batch14 : 网络编程 + 工程化实战 + 结语（10 章）
//   batch15 : 现代 C# 与生产工程（13 章）
// =============================================================

import { chapters as batch1 } from "./csharp4-chapters-batch1";
import { chapters as batch2 } from "./csharp4-chapters-batch2";
import { chapters as batch3 } from "./csharp4-chapters-batch3";
import { chapters as batch4 } from "./csharp4-chapters-batch4";
import { chapters as batch5 } from "./csharp4-chapters-batch5";
import { chapters as batch6 } from "./csharp4-chapters-batch6";
import { chapters as batch7 } from "./csharp4-chapters-batch7";
import { chapters as batch8 } from "./csharp4-chapters-batch8";
import { chapters as batch9 } from "./csharp4-chapters-batch9";
import { chapters as batch10 } from "./csharp4-chapters-batch10";
import { chapters as batch11 } from "./csharp4-chapters-batch11";
import { chapters as batch12 } from "./csharp4-chapters-batch12";
import { chapters as batch13 } from "./csharp4-chapters-batch13";
import { chapters as batch14 } from "./csharp4-chapters-batch14";
import { chapters as batch15 } from "./csharp4-chapters-batch15";

// 历史数据中结语位于 batch14；生产工程章节应排在结语之前。
const batch14Core = batch14.slice(0, -1);
const conclusion = batch14.at(-1);

export const csharp4Chapters = [
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
  ...batch14Core,
  ...batch15,
  conclusion,
];

export const csharp4ChapterGroups = [
  "开篇",
  "第一部分 入门基础",
  "第二部分 核心语法",
  "第三部分 面向对象",
  "第四部分 泛型与集合",
  "第五部分 委托、事件与 Lambda",
  "第六部分 LINQ",
  "第七部分 异步与并发",
  "第八部分 文件 IO 与序列化",
  "第九部分 反射与特性",
  "第十部分 异常处理与调试",
  "第十一部分 内存管理与性能",
  "第十二部分 网络编程",
  "第十三部分 工程化实战",
  "第十四部分 现代 C# 与生产工程",
  "结尾",
];
