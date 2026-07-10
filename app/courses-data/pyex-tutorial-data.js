// =============================================================
// Python 异常处理教程（pyex）章节数据聚合入口
// -------------------------------------------------------------
// 系统讲解 Python 异常处理机制，覆盖基础概念、捕获处理、抛出与
// 自定义、上下文管理器、断言与最佳实践，帮助开发者写出健壮代码。
//
// 教程按章节分组拆分到独立 batch 文件：
//
//   pyex-chapters-batch1.js : 异常基础（what-is-exception,
//                             built-in-exceptions, hierarchy）
//                             + 捕获与处理（try-except,
//                             else-finally, except-details）—— 共 6 章
//   pyex-chapters-batch2.js : 抛出与自定义（raise,
//                             custom-exception, exception-chaining）
//                             + 高级与实战（context-manager,
//                             assert, best-practices）—— 共 6 章
//
// 共 12 章，4 个分组。
// =============================================================

import { chapters as batch1 } from "./pyex-chapters-batch1";
import { chapters as batch2 } from "./pyex-chapters-batch2";

// 按分组顺序拼接所有章节
export const pyexChapters = [
  ...batch1,
  ...batch2,
];

// 侧边栏分组顺序（4 组 12 章）
export const pyexChapterGroups = [
  "异常基础",
  "捕获与处理",
  "抛出与自定义",
  "高级与实战",
];
