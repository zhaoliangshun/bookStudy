// =============================================================
// Node.js 教程章节数据（聚合入口）
// -------------------------------------------------------------
// 为了便于维护与编写，教程内容按章节分组拆分到 9 个独立文件：
//   chapters-batch1.js : 基础入门（intro, modules, globals, path, fs, os）
//   chapters-batch2.js : 核心模块（url, events, stream, buffer, http, crypto）
//   chapters-batch3.js : 异步编程（process, eventloop, async, util, errors）
//   chapters-batch4.js : 进阶实战 + 工程化（worker, cluster, npm, debugging）
//   chapters-batch5.js : 基础补充（memory, v8-engine, repl, cli, logging, error-adv）
//   chapters-batch6.js : 核心模块补充（timers-deep, child-process, net, dns, tls, http2）
//   chapters-batch7.js : 异步编程补充（eventemitter-deep, stream-deep, promise-deep,
//                                  async-await-deep, concurrency, async-patterns）
//   chapters-batch8.js : 进阶实战补充（profiling, memory-leak, security, caching,
//                                  database, message-queue）
//   chapters-batch9.js : 实战补充（rest-api, websocket, file-upload, auth, middleware,
//                                  microservices）
//
// 本文件把 9 个分组的章节按顺序合并成一个 chapters 数组导出，
// 同时导出侧边栏分组顺序 chapterGroups。
//
// 每个章节对象的结构：
//   id      : 唯一标识，用于路由/选中状态
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名，用于侧边栏分类
//   content : Markdown 格式的详细讲解
//   code    : 可运行、带详细注释的示例代码
// =============================================================

import { chapters as batch1 } from "./chapters-batch1";
import { chapters as batch2 } from "./chapters-batch2";
import { chapters as batch3 } from "./chapters-batch3";
import { chapters as batch4 } from "./chapters-batch4";
import { chapters as batch5 } from "./chapters-batch5";
import { chapters as batch6 } from "./chapters-batch6";
import { chapters as batch7 } from "./chapters-batch7";
import { chapters as batch8 } from "./chapters-batch8";
import { chapters as batch9 } from "./chapters-batch9";

// 按分组顺序拼接所有章节
export const chapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
  ...batch7,
  ...batch8,
  ...batch9,
];

// 侧边栏分组顺序（与上面拼接顺序一致）
export const chapterGroups = [
  "基础入门",
  "基础补充",
  "核心模块",
  "核心模块补充",
  "异步编程",
  "异步编程补充",
  "进阶实战",
  "进阶实战补充",
  "工程化",
  "实战补充",
];