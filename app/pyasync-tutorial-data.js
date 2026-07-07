// =============================================================
// Python asyncio 教程（pyasync）章节数据聚合入口
// -------------------------------------------------------------
// 专题教程，专注讲解 Python asyncio 异步编程的核心概念与日常开发应用。
// 风格定位：简单易懂、原理 + 大量 demo、详细源码注释。
// 章节数据拆分到 pyasync-chapters-batch1 ~ batch5 中（共 24 章）。
//
// 章节分组说明：
//   batch1（1-4章）：   基础概念
//   batch2（5-9章）：   asyncio 入门
//   batch3（10-14章）： 异步 I/O
//   batch4（15-19章）： 高级特性
//   batch5（20-24章）： 实战项目
// =============================================================

import { chapters as batch1 } from "./pyasync-chapters-batch1";
import { chapters as batch2 } from "./pyasync-chapters-batch2";
import { chapters as batch3 } from "./pyasync-chapters-batch3";
import { chapters as batch4 } from "./pyasync-chapters-batch4";
import { chapters as batch5 } from "./pyasync-chapters-batch5";

export const pyasyncChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

// 导出分组（用于侧边栏分组展示）
export const pyasyncChapterGroups = [
  "基础概念",
  "asyncio 入门",
  "异步 I/O",
  "高级特性",
  "实战项目",
];
