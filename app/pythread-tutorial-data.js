// =============================================================
// Python 线程与进程教程（pythread）章节数据聚合入口
// -------------------------------------------------------------
// 专题教程，专注讲解 threading / multiprocessing / concurrent.futures / subprocess。
// 章节数据拆分到 pythread-chapters-batch1 ~ batch4 中（共 38 章）。
// 运行方式：通过 /api/run-py 调用系统 python3 子进程执行。
// =============================================================

import { chapters as batch1 } from "./pythread-chapters-batch1";
import { chapters as batch2 } from "./pythread-chapters-batch2";
import { chapters as batch3 } from "./pythread-chapters-batch3";
import { chapters as batch4 } from "./pythread-chapters-batch4";

export const pythreadChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
];

export const pythreadChapterGroups = [
  "并发基础概念",
  "threading 多线程",
  "multiprocessing 多进程",
  "性能与选型",
  "subprocess 子进程",
  "综合实战",
];
