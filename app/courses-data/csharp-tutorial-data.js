// =============================================================
// C# 教程 - 章节数据聚合入口
// -------------------------------------------------------------
// 实战版教程：demo 驱动，跳过历史理论，每章直接上手写代码。
// 共 22 章(前言 + 20 章正文 + 结语),覆盖 5 大部分。
// 适用版本：.NET 8 LTS / C# 12，所有示例用顶级语句。
//
// 5 个 batch 文件:
//   csharp-chapters-batch1.js : 前言 + 第一部分快速上手(第1-4章)
//   csharp-chapters-batch2.js : 第二部分核心语法(第5-8章)
//   csharp-chapters-batch3.js : 第三部分面向对象(第9-12章)
//   csharp-chapters-batch4.js : 第四部分高级特性(第13-16章)
//   csharp-chapters-batch5.js : 第五部分实战应用(第17-20章)+ 结语
// =============================================================

import { chapters as batch1 } from "./csharp-chapters-batch1";
import { chapters as batch2 } from "./csharp-chapters-batch2";
import { chapters as batch3 } from "./csharp-chapters-batch3";
import { chapters as batch4 } from "./csharp-chapters-batch4";
import { chapters as batch5 } from "./csharp-chapters-batch5";

export const csharpChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

export const csharpChapterGroups = [
  "开篇",
  "第一部分 快速上手",
  "第二部分 核心语法",
  "第三部分 面向对象",
  "第四部分 高级特性",
  "第五部分 实战应用",
  "结尾",
];
