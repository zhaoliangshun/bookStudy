// =============================================================
// TypeScript 进阶教程（ts2）章节数据聚合入口
// -------------------------------------------------------------
// 教程内容按章节分组拆分到 5 个独立文件：
//   ts2-chapters-batch1.js : 基础入门（ts2-intro, ts2-setup,
//                            ts2-primitive, ts2-array-tuple,
//                            ts2-object-types）
//   ts2-chapters-batch2.js : 类型系统核心（ts2-interface-advanced,
//                            ts2-type-alias-advanced, ts2-union-intersection,
//                            ts2-enum-const, ts2-literal-template,
//                            ts2-type-narrowing）
//   ts2-chapters-batch3.js : 函数与类（ts2-functions-advanced,
//                            ts2-generics-basics, ts2-generics-advanced,
//                            ts2-classes-oop, ts2-decorators）
//   ts2-chapters-batch4.js : 模块与工程化（ts2-modules,
//                            ts2-utility-types, ts2-conditional-mapped,
//                            ts2-declaration-files, ts2-tsconfig）
//   ts2-chapters-batch5.js : 实战与进阶（ts2-async,
//                            ts2-error-handling, ts2-patterns,
//                            ts2-performance, ts2-best-practices）
//
// 用户代码会先被 TypeScript 编译器转译成 JS（/api/run-ts），
// 再在 vm 沙箱中执行，因此所有 demo 都支持 TS 语法。
// =============================================================

import { chapters as batch1 } from "./ts2-chapters-batch1";
import { chapters as batch2 } from "./ts2-chapters-batch2";
import { chapters as batch3 } from "./ts2-chapters-batch3";
import { chapters as batch4 } from "./ts2-chapters-batch4";
import { chapters as batch5 } from "./ts2-chapters-batch5";

// 按分组顺序拼接所有章节
export const ts2Chapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

// 侧边栏分组顺序
export const ts2ChapterGroups = [
  "基础入门",
  "类型系统核心",
  "函数与类",
  "模块与工程化",
  "实战与进阶",
];