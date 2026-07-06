// =============================================================
// Python 原理图解教程（pyint）章节数据聚合入口
// -------------------------------------------------------------
// 系统讲解 Python 的工作原理，帮助开发者理解日常开发背后的机制。
// 教程按章节分组拆分到独立 batch 文件：
//
//   pyint-chapters-batch1.js : 执行流程（overview, interpreted,
//                              flow）+ 字节码与虚拟机（bytecode,
//                              dis, pvm）—— 共 6 章
//   pyint-chapters-batch2.js : 对象模型与内存（object, pyobject,
//                              refcount, cache, namespace）—— 共 5 章
//   pyint-chapters-batch3.js : 函数与作用域（frame, closure,
//                              legb）+ 迭代器与生成器（iterator,
//                              generator）—— 共 5 章
//   pyint-chapters-batch4.js : GIL 与并发（gil, concurrency）+
//                              性能与导入（import, performance）—— 共 4 章
//
// 共 20 章，7 个分组。
// =============================================================

import { chapters as batch1 } from "./pyint-chapters-batch1";
import { chapters as batch2 } from "./pyint-chapters-batch2";
import { chapters as batch3 } from "./pyint-chapters-batch3";
import { chapters as batch4 } from "./pyint-chapters-batch4";

// 按分组顺序拼接所有章节
export const pyintChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
];

// 侧边栏分组顺序（7 组 20 章）
export const pyintChapterGroups = [
  "执行流程",
  "字节码与虚拟机",
  "对象模型与内存",
  "函数与作用域",
  "迭代器与生成器",
  "GIL 与并发",
  "性能与导入",
];
