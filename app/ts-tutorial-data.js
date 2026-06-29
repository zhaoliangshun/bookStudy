// =============================================================
// TypeScript 教程章节数据（聚合入口）
// -------------------------------------------------------------
// 教程内容按章节分组拆分到 11 个独立文件：
//   ts-chapters-batch1.js : 基础（intro, basic-types, annotations,
//                                  interface, type-alias）
//   ts-chapters-batch2.js : 核心（functions, classes, generics,
//                                  union-intersection）
//   ts-chapters-batch3.js : 进阶类型（narrowing, advanced-types,
//                                  utility-types, inference）
//   ts-chapters-batch4.js : 工程化（modules, decorators, tsconfig,
//                                  declaration）
//   ts-chapters-batch5.js : 基础补充（toolchain, compile-flow,
//                                  literal-deep, enum-deep,
//                                  tuple-deep, readonly-deep）
//   ts-chapters-batch6.js : 核心补充（async, iterators, this-deep,
//                                  functions-adv, classes-adv,
//                                  error-handling）
//   ts-chapters-batch7.js : 进阶类型深入（conditional-deep,
//                                  mapped-deep, template-literal,
//                                  infer-deep, type-gymnastics,
//                                  brand-types）
//   ts-chapters-batch8.js : 工程化进阶（linting, testing,
//                                  debugging, migration, react,
//                                  node-advanced）
//   ts-chapters-batch9.js : 实战（design-patterns, state-machine,
//                                  real-world, performance,
//                                  best-practices）
//   ts-chapters-batch10.js: 补充专题 1（satisfies, ts5-features,
//                                  variance, unknown-any-deep,
//                                  assertion-vs-guard）
//   ts-chapters-batch11.js: 补充专题 2（assert-functions,
//                                  unique-symbol, index-signature-deep,
//                                  overloading-deep, runtime-validation）
//   ts-chapters-batch12.js: 泛型深度专题（generics-essentials,
//                                  constraints-deep, inference-deep,
//                                  conditional-infer, mapped-templates,
//                                  variance, patterns-pitfalls）
//
// 用户代码会先被 TypeScript 编译器转译成 JS（/api/run-ts），
// 再在 vm 沙箱中执行，因此所有 demo 都支持 TS 语法。
// =============================================================

import { chapters as batch1 } from "./ts-chapters-batch1";
import { chapters as batch2 } from "./ts-chapters-batch2";
import { chapters as batch3 } from "./ts-chapters-batch3";
import { chapters as batch4 } from "./ts-chapters-batch4";
import { chapters as batch5 } from "./ts-chapters-batch5";
import { chapters as batch6 } from "./ts-chapters-batch6";
import { chapters as batch7 } from "./ts-chapters-batch7";
import { chapters as batch8 } from "./ts-chapters-batch8";
import { chapters as batch9 } from "./ts-chapters-batch9";
import { chapters as batch10 } from "./ts-chapters-batch10";
import { chapters as batch11 } from "./ts-chapters-batch11";
import { chapters as batch12 } from "./ts-chapters-batch12";

// 按分组顺序拼接所有章节
export const tsChapters = [
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
];

// 侧边栏分组顺序
export const tsChapterGroups = [
  "基础",
  "基础补充",
  "核心",
  "核心补充",
  "进阶类型",
  "进阶类型深入",
  "工程化",
  "工程化进阶",
  "实战",
  "泛型专题",
];
