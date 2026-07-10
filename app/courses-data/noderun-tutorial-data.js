// =============================================================
// Node.js 运行原理教程（noderun）章节数据聚合入口
// -------------------------------------------------------------
// 主题：层层揭示 Node.js 底层运行机制——从事件循环到多进程
// 面向：已经会写 Node.js 代码、想理解底层原理以提升开发能力的开发者
// 共 20 章，5 个分组：
//   noderun-chapters-batch1.js : 开篇 + 事件循环（4 章）
//   noderun-chapters-batch2.js : 事件循环深入 + 异步编程（4 章）
//   noderun-chapters-batch3.js : 异步编程深入 + 模块系统（4 章）
//   noderun-chapters-batch4.js : 模块系统 + 核心模块（4 章）
//   noderun-chapters-batch5.js : 核心模块 + 多进程与性能（4 章）
//
// 每章包含 content（Markdown 讲解）和 code（可运行 demo）。
// =============================================================

import { chapters as batch1 } from "./noderun-chapters-batch1";
import { chapters as batch2 } from "./noderun-chapters-batch2";
import { chapters as batch3 } from "./noderun-chapters-batch3";
import { chapters as batch4 } from "./noderun-chapters-batch4";
import { chapters as batch5 } from "./noderun-chapters-batch5";

// 按分组顺序拼接所有章节
export const noderunChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

// 侧边栏分组顺序（5 组 20 章）
export const noderunChapterGroups = [
  "开篇：Node.js 的核心本质",
  "第一部分 事件循环——Node.js 的心脏",
  "第二部分 异步编程原理",
  "第三部分 模块系统原理",
  "第四部分 核心模块与底层机制",
  "第五部分 多进程与性能",
];
