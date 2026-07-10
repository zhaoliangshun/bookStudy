// =============================================================
// Python 多线程入门（pythread2）章节数据聚合入口
// -------------------------------------------------------------
// 专题教程，专注讲解 Python 多线程的工作原理与日常开发应用。
// 风格定位：简单易懂、原理 + 大量 demo、详细源码注释。
// 章节数据拆分到 pythread2-chapters-batch1 ~ batch5 中（共 24 章）。
// 运行方式：通过 /api/run-py 调用系统 python3 子进程执行。
//
// 章节分组说明：
//   batch1（1-5章）：基础概念 + threading 入门
//   batch2（6-10章）：线程生命周期/参数/守护线程 + 线程同步入门
//   batch3（11-15章）：RLock / Semaphore / Event / Condition / Timer
//   batch4（16-20章）：Barrier / Queue / threadlocal / 线程池 / 并发下载实战
//   batch5（21-24章）：批量文件处理/定时调度/常见陷阱/最佳实践（收尾）
// =============================================================

import { chapters as batch1 } from "./pythread2-chapters-batch1";
import { chapters as batch2 } from "./pythread2-chapters-batch2";
import { chapters as batch3 } from "./pythread2-chapters-batch3";
import { chapters as batch4 } from "./pythread2-chapters-batch4";
import { chapters as batch5 } from "./pythread2-chapters-batch5";

export const pythread2Chapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

export const pythread2ChapterGroups = [
  "基础概念",
  "threading 基础",
  "线程同步",
  "线程通信",
  "线程池",
  "实战案例",
  "陷阱与最佳实践",
];
