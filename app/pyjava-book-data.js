// =============================================================
// Python vs Java 语言对比教程 —— 章节数据聚合入口
// -------------------------------------------------------------
// 纯阅读型教程（无代码编辑器），所有 Python / Java 代码示例在
// content 的 Markdown 代码块中展示对比。
//
// 共 25 章，按 5 个分组拆分到 5 个独立文件，每文件 5 章：
//
//   pyjava-chapters-batch1.js : 语言概览与基础（5 章）
//   pyjava-chapters-batch2.js : 类型系统与面向对象（5 章）
//   pyjava-chapters-batch3.js : 函数与并发（5 章）
//   pyjava-chapters-batch4.js : 标准库与生态（5 章）
//   pyjava-chapters-batch5.js : 应用场景与选型（5 章）
//
// 每个章节对象结构（纯阅读型，无 code 字段）：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名
//   content : Markdown 格式的详细讲解（含 Python/Java 代码对比）
// =============================================================

import { chapters as batch1 } from "./pyjava-chapters-batch1";
import { chapters as batch2 } from "./pyjava-chapters-batch2";
import { chapters as batch3 } from "./pyjava-chapters-batch3";
import { chapters as batch4 } from "./pyjava-chapters-batch4";
import { chapters as batch5 } from "./pyjava-chapters-batch5";

// 按分组顺序拼接所有章节（25 章）
export const pyjavaChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

// 侧边栏分组顺序（5 组 25 章）
export const pyjavaChapterGroups = [
  "语言概览与基础",
  "类型系统与面向对象",
  "函数与并发",
  "标准库与生态",
  "应用场景与选型",
];
