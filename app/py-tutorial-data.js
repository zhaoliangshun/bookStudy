// =============================================================
// Python 教程章节数据（聚合入口）
// -------------------------------------------------------------
// 教程内容按章节分组拆分到 8 个独立文件，共 40 章：
//
//   原始 4 批（16 章）：
//     py-chapters-batch1.js : 基础（intro, variables, strings, operators）
//     py-chapters-batch2.js : 核心（controlflow, functions, collections,
//                                    comprehensions）
//     py-chapters-batch3.js : 进阶（fileio, exceptions, modules, oop）
//     py-chapters-batch4.js : 工程化（decorators, iterators, stdlib,
//                                    tooling）
//
//   扩充 4 批（24 章）：
//     py-chapters-batch5.js : 基础深化（numbers, strings-advanced,
//                                    bytes-encoding, datetime,
//                                    collections-advanced, itertools）
//     py-chapters-batch6.js : 函数式与并发（functional, threading,
//                                    multiprocessing, asyncio,
//                                    concurrency-patterns,
//                                    subprocess-system）
//     py-chapters-batch7.js : 数据处理与持久化（regex, json-xml-csv,
//                                    sqlite, pathlib-filesystem,
//                                    serialization, config-args）
//     py-chapters-batch8.js : 高级特性与工程（metaclass, descriptor,
//                                    context-manager, typing-mypy,
//                                    testing, packaging-distribution）
//
// 与 Node.js / TypeScript 教程不同，Python 教程的 code 字段是
// Python 源代码，前端通过 /api/run-py 接口调用系统 python3 子进程
// 执行，捕获 stdout / stderr 返回。
// =============================================================

import { chapters as batch1 } from "./py-chapters-batch1";
import { chapters as batch2 } from "./py-chapters-batch2";
import { chapters as batch3 } from "./py-chapters-batch3";
import { chapters as batch4 } from "./py-chapters-batch4";
import { chapters as batch5 } from "./py-chapters-batch5";
import { chapters as batch6 } from "./py-chapters-batch6";
import { chapters as batch7 } from "./py-chapters-batch7";
import { chapters as batch8 } from "./py-chapters-batch8";

// 按分组顺序拼接所有章节
export const pyChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
  ...batch7,
  ...batch8,
];

// 侧边栏分组顺序（8 组 40 章）
export const pyChapterGroups = [
  "基础",
  "核心",
  "进阶",
  "工程化",
  "基础深化",
  "函数式与并发",
  "数据处理与持久化",
  "高级特性与工程",
];
