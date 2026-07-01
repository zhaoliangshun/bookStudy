// =============================================================
// 计算机网络教程章节数据（聚合入口）
// -------------------------------------------------------------
// 主题：工作中常用到的计算机网络知识
//
// 教程特色：
//   1. 聚焦实战：只讲工作中会遇到的网络知识（HTTP、DNS、TLS、
//      CORS、代理、缓存等），跳过偏理论的物理层细节。
//   2. 可运行 demo：每章 code 字段都是「真正可运行的 Python」，
//      通过 /api/run-py 在 python3 沙箱中执行，用 socket、
//      http.client、ssl、urllib、json 等标准库演示网络协议。
//   3. 原理图解 + 抓包报文 + 真实代码三者结合：
//      - ASCII 图解描述协议状态机
//      - 真实抓包报文展示协议交互
//      - Python 代码演示协议实现
//
// 章节文件拆分：
//   net-chapters-batch1.js : 网络基础篇（overview, tcp-udp, http, https）
//   net-chapters-batch2.js : 应用层协议（dns, websocket, cors-csrf, cookie-session）
//   net-chapters-batch3.js : 工程实践篇（proxy, cdn, debug, performance）
// =============================================================

import { chapters as batch1 } from "./net-chapters-batch1";
import { chapters as batch2 } from "./net-chapters-batch2";
import { chapters as batch3 } from "./net-chapters-batch3";

// 按分组顺序拼接所有章节
export const netChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
];

// 侧边栏分组顺序
export const netChapterGroups = [
  "网络基础篇",
  "应用层协议",
  "工程实践篇",
];
