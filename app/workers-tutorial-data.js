// =============================================================
// JavaScript Workers 教程章节数据（聚合入口）
// -------------------------------------------------------------
// 本书基于《JavaScript 高级程序设计》（红皮书）Worker 相关章节，
// 系统讲解 Web Workers、SharedWorker、ServiceWorker 的原理与实战。
//
// 教程内容按章节分组拆分到 5 个独立文件，共 24 章：
//
//   workers-chapters-batch1.js : Worker 基础（5 章）
//     worker-intro        — Worker 概述与历史
//     worker-principle    — Worker 的作用与原理
//     worker-first        — 创建第一个 Worker
//     worker-lifecycle    — Worker 的生命周期
//     worker-limits       — Worker 的限制与能力边界
//
//   workers-chapters-batch2.js : Worker 通信（5 章）
//     worker-postmessage    — postMessage 基础通信
//     worker-clone          — 结构化克隆算法
//     worker-transferable   — Transferable 对象转移
//     worker-messagechannel — MessageChannel 消息通道
//     worker-broadcast      — BroadcastChannel 广播通信
//
//   workers-chapters-batch3.js : 专用 Worker 进阶（5 章）
//     worker-importscripts — importScripts 加载脚本
//     worker-modules       — Worker 中的模块系统
//     worker-errors        — 错误处理与调试
//     worker-fetch         — Worker 中使用 fetch 与定时器
//     worker-perf          — Worker 性能优化
//
//   workers-chapters-batch4.js : 共享 Worker 与服务 Worker（5 章）
//     worker-shared         — SharedWorker 共享 Worker
//     worker-service-basic  — ServiceWorker 服务 Worker 基础
//     worker-service-cache  — ServiceWorker 缓存管理
//     worker-service-offline— ServiceWorker 离线应用
//     worker-service-sync   — ServiceWorker 后台同步
//
//   workers-chapters-batch5.js : 实战项目（4 章）
//     worker-practice-image — 实战：图片处理 Worker
//     worker-practice-sort  — 实战：大数据排序
//     worker-practice-chat  — 实战：实时通信系统
//     worker-best-practices — Worker 最佳实践与陷阱
//
// 注意：代码在 Node.js vm 沙箱中运行（/api/run），
// 浏览器 Worker API 通过 EventEmitter 模拟，注释中标注了真实浏览器写法。
// =============================================================

import { chapters as batch1 } from "./workers-chapters-batch1";
import { chapters as batch2 } from "./workers-chapters-batch2";
import { chapters as batch3 } from "./workers-chapters-batch3";
import { chapters as batch4 } from "./workers-chapters-batch4";
import { chapters as batch5 } from "./workers-chapters-batch5";

// 按分组顺序拼接所有章节
export const workersChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

// 侧边栏分组顺序（5 组 24 章）
export const workersChapterGroups = [
  "Worker 基础",
  "Worker 通信",
  "专用 Worker 进阶",
  "共享 Worker 与服务 Worker",
  "实战项目",
];
