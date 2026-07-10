// =============================================================
// 后端开发必备知识 - 章节数据（聚合入口）
// -------------------------------------------------------------
// 共 104 章，覆盖后端开发全栈知识体系。
// 纯内容阅读型教程，无代码执行功能。
//
// 13 个 batch 文件，每组 8 章：
//   backend-essential-chapters-batch1.js  : 网络协议深度解析
//   backend-essential-chapters-batch2.js  : 操作系统原理
//   backend-essential-chapters-batch3.js  : Linux常用命令与运维
//   backend-essential-chapters-batch4.js  : MySQL数据库原理与优化
//   backend-essential-chapters-batch5.js  : Redis缓存深度
//   backend-essential-chapters-batch6.js  : 消息队列
//   backend-essential-chapters-batch7.js  : 分布式系统理论
//   backend-essential-chapters-batch8.js  : 微服务架构
//   backend-essential-chapters-batch9.js  : 容器化与编排
//   backend-essential-chapters-batch10.js : API设计与安全认证
//   backend-essential-chapters-batch11.js : 性能优化与监控
//   backend-essential-chapters-batch12.js : 后端面试题精选
//   backend-essential-chapters-batch13.js : 高可用与云原生
// =============================================================

import { chapters as backendBatch1 } from "./backend-essential-chapters-batch1";
import { chapters as backendBatch2 } from "./backend-essential-chapters-batch2";
import { chapters as backendBatch3 } from "./backend-essential-chapters-batch3";
import { chapters as backendBatch4 } from "./backend-essential-chapters-batch4";
import { chapters as backendBatch5 } from "./backend-essential-chapters-batch5";
import { chapters as backendBatch6 } from "./backend-essential-chapters-batch6";
import { chapters as backendBatch7 } from "./backend-essential-chapters-batch7";
import { chapters as backendBatch8 } from "./backend-essential-chapters-batch8";
import { chapters as backendBatch9 } from "./backend-essential-chapters-batch9";
import { chapters as backendBatch10 } from "./backend-essential-chapters-batch10";
import { chapters as backendBatch11 } from "./backend-essential-chapters-batch11";
import { chapters as backendBatch12 } from "./backend-essential-chapters-batch12";
import { chapters as backendBatch13 } from "./backend-essential-chapters-batch13";

export const backendEssentialChapters = [
  ...backendBatch1,
  ...backendBatch2,
  ...backendBatch3,
  ...backendBatch4,
  ...backendBatch5,
  ...backendBatch6,
  ...backendBatch7,
  ...backendBatch8,
  ...backendBatch9,
  ...backendBatch10,
  ...backendBatch11,
  ...backendBatch12,
  ...backendBatch13,
];

export const backendEssentialChapterGroups = [
  "网络协议深度解析",
  "操作系统原理",
  "Linux常用命令与运维",
  "MySQL数据库原理与优化",
  "Redis缓存深度",
  "消息队列",
  "分布式系统理论",
  "微服务架构",
  "容器化与编排",
  "API设计与安全认证",
  "性能优化与监控",
  "后端面试题精选",
  "高可用与云原生"
];
