// =============================================================
// Python 3.12+ 实战教程 —— 章节数据（聚合入口）
// -------------------------------------------------------------
// 32 章 8 个分组，对应文件 py3-chapters-batch1.js ~ batch8.js。
// 风格：文字精简、demo 优先、覆盖 Python 日常开发的全部核心功能。
// 基于 Python 3.12+ 现代语法（match-case、type 形参、except* 等）。
//
// 分组：
//   1. 基础           4 章  intro / variables / strings / operators
//   2. 核心           4 章  controlflow / functions / collections / comprehensions
//   3. 进阶           4 章  fileio / exceptions / modules / oop
//   4. 工程化         4 章  decorators / iterators / stdlib / tooling
//   5. 函数式与并发   4 章  functional / threading / asyncio / concurrency-patterns
//   6. 数据与持久化   4 章  regex / json-csv / pathlib / serialization-config
//   7. 高级特性       4 章  typing / context-manager / metaclass-descriptor / testing
//   8. 现代特性       4 章  structural-pattern / pep-695 / exception-groups / py313
// =============================================================

import { chapters as batch1 } from "./py3-chapters-batch1";
import { chapters as batch2 } from "./py3-chapters-batch2";
import { chapters as batch3 } from "./py3-chapters-batch3";
import { chapters as batch4 } from "./py3-chapters-batch4";
import { chapters as batch5 } from "./py3-chapters-batch5";
import { chapters as batch6 } from "./py3-chapters-batch6";
import { chapters as batch7 } from "./py3-chapters-batch7";
import { chapters as batch8 } from "./py3-chapters-batch8";

export const py3Chapters = [
  ...batch1, ...batch2, ...batch3, ...batch4,
  ...batch5, ...batch6, ...batch7, ...batch8,
];

export const py3ChapterGroups = [
  "基础",
  "核心",
  "进阶",
  "工程化",
  "函数式与并发",
  "数据与持久化",
  "高级特性",
  "现代特性",
];
