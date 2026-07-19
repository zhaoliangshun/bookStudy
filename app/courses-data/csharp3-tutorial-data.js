// =============================================================
// C# 从入门到精通大全（终极版）—— 章节数据聚合入口
// -------------------------------------------------------------
// 定位：终极版大而全的 C# 参考书，86 章覆盖日常开发 100% 高频知识点
// 版本：.NET 8 LTS / C# 12，所有示例用顶级语句（可在线运行）
//
// 15 个 batch 文件：
//   csharp3-chapters-batch1.js  : 开篇 + 第一部分 入门基础（1-5 章）
//   csharp3-chapters-batch2.js  : 第二部分 控制流（6-9 章）
//   csharp3-chapters-batch3.js  : 第三部分 方法与函数（10-14 章）
//   csharp3-chapters-batch4.js  : 第四部分 数组与集合（15-18 章）
//   csharp3-chapters-batch5.js  : 第五部分 面向对象基础（19-24 章）
//   csharp3-chapters-batch6.js  : 第六部分 委托事件与 LINQ（25-30 章）
//   csharp3-chapters-batch7.js  : 第七部分 值类型与引用类型（31-37 章）
//   csharp3-chapters-batch8.js  : 第八部分 泛型（38-43 章）
//   csharp3-chapters-batch9.js  : 第九部分 集合框架（44-49 章）
//   csharp3-chapters-batch10.js : 第十部分 委托、事件与 Lambda（50-54 章）
//   csharp3-chapters-batch11.js : 第十一部分 异常与日志（55-60 章）
//   csharp3-chapters-batch12.js : 第十二部分 日期时间与网络（61-66 章）
//   csharp3-chapters-batch13.js : 第十三部分 异步编程（67-72 章）
//   csharp3-chapters-batch14.js : 第十四部分 文件IO与序列化（73-78 章）
//   csharp3-chapters-batch15.js : 第十五部分 工程化实战（79-85 章）+ 结尾（86 章）
// =============================================================

import { chapters as batch1 } from "./csharp3-chapters-batch1";
import { chapters as batch2 } from "./csharp3-chapters-batch2";
import { chapters as batch3 } from "./csharp3-chapters-batch3";
import { chapters as batch4 } from "./csharp3-chapters-batch4";
import { chapters as batch5 } from "./csharp3-chapters-batch5";
import { chapters as batch6 } from "./csharp3-chapters-batch6";
import { chapters as batch7 } from "./csharp3-chapters-batch7";
import { chapters as batch8 } from "./csharp3-chapters-batch8";
import { chapters as batch9 } from "./csharp3-chapters-batch9";
import { chapters as batch10 } from "./csharp3-chapters-batch10";
import { chapters as batch11 } from "./csharp3-chapters-batch11";
import { chapters as batch12 } from "./csharp3-chapters-batch12";
import { chapters as batch13 } from "./csharp3-chapters-batch13";
import { chapters as batch14 } from "./csharp3-chapters-batch14";
import { chapters as batch15 } from "./csharp3-chapters-batch15";

export const csharp3Chapters = [
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

export const csharp3ChapterGroups = [
  "开篇",
  "第一部分 入门基础",
  "第二部分 控制流",
  "第三部分 方法与函数",
  "第四部分 数组与集合",
  "第五部分 面向对象基础",
  "第六部分 委托事件与 LINQ",
  "第七部分 值类型与引用类型",
  "第八部分 泛型",
  "第九部分 集合框架",
  "第十部分 委托、事件与 Lambda",
  "第十一部分 异常与日志",
  "第十二部分 日期时间与网络",
  "第十三部分 异步编程",
  "第十四部分 文件IO与序列化",
  "第十五部分 工程化实战",
  "结尾",
];