// =============================================================
// Python 多进程教程（pyprocess）章节数据聚合入口
// -------------------------------------------------------------
// 专题教程，专注讲解 Python multiprocessing 多进程的工作原理
// 与日常开发应用。
// 风格定位：简单易懂、原理 + 大量 demo、详细源码注释。
// 章节数据拆分到 pyprocess-chapters-batch1 ~ batch5 中（共 24 章）。
//
// 章节分组说明：
//   batch1（1-4章）：  基础概念
//   batch2（5-8章）：  multiprocessing 入门
//   batch3（9-13章）： 进程间通信
//   batch4（14-18章）：进程池与高级特性
//   batch5（19-24章）：实战与陷阱
// =============================================================

import { chapters as batch1 } from "./pyprocess-chapters-batch1";
import { chapters as batch2 } from "./pyprocess-chapters-batch2";
import { chapters as batch3 } from "./pyprocess-chapters-batch3";
import { chapters as batch4 } from "./pyprocess-chapters-batch4";
import { chapters as batch5 } from "./pyprocess-chapters-batch5";

export const pyprocessChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

// 导出分组（用于侧边栏分组展示）
export const pyprocessChapterGroups = [
  "基础概念",
  "multiprocessing 入门",
  "进程间通信",
  "进程池与高级特性",
  "实战与陷阱",
];
