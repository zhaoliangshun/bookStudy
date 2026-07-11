// =============================================================
// Python asyncio 教程 V3（pyasync3）章节数据聚合入口
// -------------------------------------------------------------
// demo 驱动学 asyncio：每一章都从一个可运行的完整 demo 开始，
// 通过详细注释 + 知识点拆解，让你「看代码就懂原理」。
// 章节数据拆分到 pyasync3-chapters-batch1 ~ batch5 中（共 20 章）。
//
// 章节分组说明：
//   batch1（1-4章）：   基础入门 —— 从第一个 demo 开始
//   batch2（5-8章）：   核心 API —— Task / gather / wait
//   batch3（9-12章）：  异步工具 —— sleep / async with / async for / Queue
//   batch4（13-16章）： 并发控制 —— Lock / Semaphore / Event / 超时取消
//   batch5（17-20章）： 实战项目 —— to_thread / 爬虫 / 生产消费 / 最佳实践
// =============================================================

import { chapters as batch1 } from "./pyasync3-chapters-batch1";
import { chapters as batch2 } from "./pyasync3-chapters-batch2";
import { chapters as batch3 } from "./pyasync3-chapters-batch3";
import { chapters as batch4 } from "./pyasync3-chapters-batch4";
import { chapters as batch5 } from "./pyasync3-chapters-batch5";

export const pyasync3Chapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

// 导出分组（用于侧边栏分组展示）
export const pyasync3ChapterGroups = [
  "基础入门",
  "核心 API",
  "异步工具",
  "并发控制",
  "实战项目",
];
