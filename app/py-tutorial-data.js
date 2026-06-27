// =============================================================
// Python 教程章节数据（聚合入口）
// -------------------------------------------------------------
// 教程内容按章节分组拆分到 4 个独立文件：
//   py-chapters-batch1.js : 基础（intro, variables, strings, operators）
//   py-chapters-batch2.js : 核心（controlflow, functions, collections,
//                                  comprehensions）
//   py-chapters-batch3.js : 进阶（fileio, exceptions, modules, oop）
//   py-chapters-batch4.js : 工程化（decorators, iterators, stdlib,
//                                  tooling）
//
// 与 Node.js / TypeScript 教程不同，Python 教程的 code 字段是
// Python 源代码，前端通过 /api/run-py 接口调用系统 python3 子进程
// 执行，捕获 stdout / stderr 返回。
// =============================================================

import { chapters as batch1 } from "./py-chapters-batch1";
import { chapters as batch2 } from "./py-chapters-batch2";
import { chapters as batch3 } from "./py-chapters-batch3";
import { chapters as batch4 } from "./py-chapters-batch4";

// 按分组顺序拼接所有章节
export const pyChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
];

// 侧边栏分组顺序
export const pyChapterGroups = [
  "基础",
  "核心",
  "进阶",
  "工程化",
];
