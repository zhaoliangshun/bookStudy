// =============================================================
// 《Python工作实战手册》—— 章节数据聚合入口
// -------------------------------------------------------------
// 共 56 章，覆盖 7 大篇章，聚焦工作中高频使用的Python知识
// 纯内容阅读型 + 代码可运行（通过 /api/run-py 执行）。
// 本书特点：多demo、多注释、贴近真实工作场景、代码可直接运行。
// 风格：概念讲解 + 代码示例 + 工作场景 + 坑点提醒。
//
// 7 个 batch 文件：
//   python-work-batch1.js : 第一篇 基础语法入门 · 打好地基（8章）
//   python-work-batch2.js : 第二篇 数据结构 · 处理数据的利器（8章）
//   python-work-batch3.js : 第三篇 控制流与函数 · 逻辑的骨架（8章）
//   python-work-batch4.js : 第四篇 文件操作与异常处理 · 与外界打交道（8章）
//   python-work-batch5.js : 第五篇 常用标准库 · 开箱即用的利器（8章）
//   python-work-batch6.js : 第六篇 面向对象与高级特性 · 代码组织的艺术（8章）
//   python-work-batch7.js : 第七篇 第三方库与工作实战 · 解决真实问题（8章）
// =============================================================

import { chapters as pwBatch1 } from "./python-work-batch1";
import { chapters as pwBatch2 } from "./python-work-batch2";
import { chapters as pwBatch3 } from "./python-work-batch3";
import { chapters as pwBatch4 } from "./python-work-batch4";
import { chapters as pwBatch5 } from "./python-work-batch5";
import { chapters as pwBatch6 } from "./python-work-batch6";
import { chapters as pwBatch7 } from "./python-work-batch7";

export const pythonWorkChapters = [
  ...pwBatch1,
  ...pwBatch2,
  ...pwBatch3,
  ...pwBatch4,
  ...pwBatch5,
  ...pwBatch6,
  ...pwBatch7,
];

export const pythonWorkChapterGroups = [
  "基础语法入门 · 打好地基",
  "数据结构 · 处理数据的利器",
  "控制流与函数 · 逻辑的骨架",
  "文件操作与异常处理 · 与外界打交道",
  "常用标准库 · 开箱即用的利器",
  "面向对象与高级特性 · 代码组织的艺术",
  "第三方库与工作实战 · 解决真实问题",
];
