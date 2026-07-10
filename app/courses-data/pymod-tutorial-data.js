// =============================================================
// Python 模块与包教程（pymod）章节数据聚合入口
// -------------------------------------------------------------
// 系统讲解 Python 的模块与包机制，是组织大型代码的基础。
// 教程按章节分组拆分到独立 batch 文件：
//
//   pymod-chapters-batch1.js : 模块基础（intro, import, search,
//                              attributes）+ 包与导入（intro,
//                              relative, namespace）—— 共 7 章
//   pymod-chapters-batch2.js : 高级机制（dynamic, circular,
//                              reload）+ 工程实践（layout,
//                              practice）—— 共 5 章
//
// 共 12 章，4 个分组。
//
// 与 Node.js / TypeScript 教程不同，Python 教程的 code 字段是
// Python 源代码，前端通过 /api/run-py 接口调用系统 python3 子进程
// 执行，捕获 stdout / stderr 返回。
// =============================================================

import { chapters as batch1 } from "./pymod-chapters-batch1";
import { chapters as batch2 } from "./pymod-chapters-batch2";

// 按分组顺序拼接所有章节
export const pymodChapters = [
  ...batch1,
  ...batch2,
];

// 侧边栏分组顺序（4 组 12 章）
export const pymodChapterGroups = [
  "模块基础",
  "包与导入",
  "高级机制",
  "工程实践",
];
