// =============================================================
// Python asyncio 教程 V2（pyasync2）章节数据聚合入口
// -------------------------------------------------------------
// 全新专题教程，从另一套视角讲解 Python asyncio 异步编程。
// 风格定位：简单易懂、原理 + 大量 demo、详细源码注释。
// 章节数据拆分到 pyasync2-chapters-batch1 ~ batch5 中（共 24 章）。
//
// 章节分组说明：
//   batch1（1-4章）：   基础概念
//   batch2（5-9章）：   asyncio 核心 API
//   batch3（10-14章）： 异步 I/O 和工具
//   batch4（15-19章）： 并发控制与高级特性
//   batch5（20-24章）： 实战项目
// =============================================================

import { chapters as batch1 } from "./pyasync2-chapters-batch1";
import { chapters as batch2 } from "./pyasync2-chapters-batch2";
import { chapters as batch3 } from "./pyasync2-chapters-batch3";
import { chapters as batch4 } from "./pyasync2-chapters-batch4";
import { chapters as batch5 } from "./pyasync2-chapters-batch5";

export const pyasync2Chapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

// 导出分组（用于侧边栏分组展示）
export const pyasync2ChapterGroups = [
  "基础概念",
  "asyncio 核心 API",
  "异步 I/O 和工具",
  "并发控制与高级特性",
  "实战项目",
];
