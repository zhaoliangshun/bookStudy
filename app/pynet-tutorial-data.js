// =============================================================
// Python 网络编程教程（pynet）章节数据聚合入口
// -------------------------------------------------------------
// 系统讲解 Python 网络编程，涵盖 socket、TCP、UDP、HTTP、HTTPS、WebSocket。
// 教程按章节分组拆分到独立 batch 文件：
//
//   pynet-chapters-batch1.js : 网络基础（intro, socket, address）
//                              + TCP 编程（server, client, echo,
//                                concurrent）—— 共 7 章
//   pynet-chapters-batch2.js : UDP 编程（basics, echo, broadcast）
//                              + HTTP（basics, server, client,
//                                practice）—— 共 7 章
//   pynet-chapters-batch3.js : HTTPS（tls, ssl）
//                              + WebSocket（basics, client, server）
//                              —— 共 5 章
//
// 共 19 章，6 个分组。
//
// 与 Node.js / TypeScript 教程不同，Python 教程的 code 字段是
// Python 源代码，前端通过 /api/run-py 接口调用系统 python3 子进程
// 执行，捕获 stdout / stderr 返回。
// =============================================================

import { chapters as batch1 } from "./pynet-chapters-batch1";
import { chapters as batch2 } from "./pynet-chapters-batch2";
import { chapters as batch3 } from "./pynet-chapters-batch3";

// 按分组顺序拼接所有章节
export const pynetChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
];

// 侧边栏分组顺序（6 组 19 章）
export const pynetChapterGroups = [
  "网络基础",
  "TCP 编程",
  "UDP 编程",
  "HTTP",
  "HTTPS",
  "WebSocket",
];
