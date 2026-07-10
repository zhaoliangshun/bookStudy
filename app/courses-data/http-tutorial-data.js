// =============================================================
// HTTP 通信教程 章节数据聚合入口
// -------------------------------------------------------------
// 全面讲解 HTTP/HTTPS/HTTP2/HTTP3 通信协议。
// 风格定位：简单易懂、原理 + 大量 demo、详细源码注释。
// 章节数据拆分到 http-chapters-batch1 ~ batch5 中（共 24 章）。
//
// 章节分组说明：
//   batch1（1-4章）：   HTTP 基础
//   batch2（5-9章）：   HTTP 进阶
//   batch3（10-14章）： HTTPS 与安全
//   batch4（15-19章）： HTTP/2 与 HTTP/3
//   batch5（20-24章）： 实战与工具
// =============================================================

import { chapters as batch1 } from "./http-chapters-batch1";
import { chapters as batch2 } from "./http-chapters-batch2";
import { chapters as batch3 } from "./http-chapters-batch3";
import { chapters as batch4 } from "./http-chapters-batch4";
import { chapters as batch5 } from "./http-chapters-batch5";

export const httpChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

// 导出分组（用于侧边栏分组展示）
export const httpChapterGroups = [
  "HTTP 基础",
  "HTTP 进阶",
  "HTTPS 与安全",
  "HTTP/2 与 HTTP/3",
  "实战与工具",
];
