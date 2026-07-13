// =============================================================
// HTTPS 详解全书 —— 章节数据聚合入口
// -------------------------------------------------------------
// 30 章 6 分组，超详细讲解 HTTPS 的原理与实践。
//
// 章节分组：
//   密码学基础 → 数字证书与 PKI → TLS 协议详解
//   → HTTPS 部署实战 → HTTPS 性能与优化 → HTTPS 安全与运维
//
// 定位：
//   1. 从密码学地基讲起，建立完整知识体系
//   2. 大量 demo：openssl 命令、Python cryptography、Nginx 配置、curl 抓包
//   3. 生活类比 + 详细中文注释 + 本章小结表
// =============================================================

import { chapters as batch1 } from "./https-chapters-batch1";
import { chapters as batch2 } from "./https-chapters-batch2";
import { chapters as batch3 } from "./https-chapters-batch3";
import { chapters as batch4 } from "./https-chapters-batch4";
import { chapters as batch5 } from "./https-chapters-batch5";
import { chapters as batch6 } from "./https-chapters-batch6";

export const httpsChapters = [
  ...batch1, ...batch2, ...batch3,
  ...batch4, ...batch5, ...batch6,
];

export const httpsChapterGroups = [
  "密码学基础",
  "数字证书与 PKI",
  "TLS 协议详解",
  "HTTPS 部署实战",
  "HTTPS 性能与优化",
  "HTTPS 安全与运维",
];
