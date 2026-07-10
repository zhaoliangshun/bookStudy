// =============================================================
// Python 线程与进程教程（pythread）章节数据聚合入口
// -------------------------------------------------------------
// 专题教程，专注讲解 threading / multiprocessing / concurrent.futures
//   / subprocess / asyncio。
// 章节数据拆分到 pythread-chapters-batch1 ~ batch5 中（共 48 章）。
// 运行方式：通过 /api/run-py 调用系统 python3 子进程执行。
//
// 章节顺序说明：
//   batch1 ~ batch3 顺序无调整（基础→threading→multiprocessing）。
//   batch4 原顺序为 [性能选型 29-32, subprocess 33-34, 综合实战 35-38]，
//   这里把"综合实战"挪到 batch5（asyncio）之后——让 asyncio 在总结之前讲完，
//   第 38 章（并发陷阱与最佳实践总结）作为真正的收尾章节。
// =============================================================

import { chapters as batch1 } from "./pythread-chapters-batch1";
import { chapters as batch2 } from "./pythread-chapters-batch2";
import { chapters as batch3 } from "./pythread-chapters-batch3";
import { chapters as batch4 } from "./pythread-chapters-batch4";
import { chapters as batch5 } from "./pythread-chapters-batch5";

// 把 batch4 的"综合实战"分组拆出来，挪到 asyncio 之后
const batch4_summary = batch4.filter((c) => c.group === "综合实战");
const batch4_others = batch4.filter((c) => c.group !== "综合实战");

export const pythreadChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4_others,   // 29-34：性能与选型 + subprocess 子进程
  ...batch5,          // 39-48：asyncio 异步编程
  ...batch4_summary,  // 35-38：综合实战（收尾）
];

export const pythreadChapterGroups = [
  "并发基础概念",
  "threading 多线程",
  "multiprocessing 多进程",
  "性能与选型",
  "subprocess 子进程",
  "asyncio 异步编程",
  "综合实战",
];
