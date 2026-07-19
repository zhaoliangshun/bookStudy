// =============================================================
// Vite 大全集（终极版）—— 章节数据聚合入口
// -------------------------------------------------------------
// 定位：终极版大而全的 Vite 参考书，65 章覆盖日常开发 100% 高频知识点
// 版本：Vite 5/6 LTS，所有示例用 ESM + 可在线运行
//
// 10 个 batch 文件：
//   vite2-chapters-batch1.js  : 开篇 + 第一部分 入门基础（1-7 章）
//   vite2-chapters-batch2.js  : 第二部分 核心概念 + 配置详解（8-13 章）
//   vite2-chapters-batch3.js  : 第三部分 配置详解 + 静态资源（14-19 章）
//   vite2-chapters-batch4.js  : 第四部分 静态资源 + 环境与变量（20-26 章）
//   vite2-chapters-batch5.js  : 第五部分 服务器配置 + 构建优化（27-33 章）
//   vite2-chapters-batch6.js  : 第六部分 构建优化 + 插件系统（34-40 章）
//   vite2-chapters-batch7.js  : 第七部分 插件系统 + 框架集成（41-47 章）
//   vite2-chapters-batch8.js  : 第八部分 工程化 + SSR/SSG（48-54 章）
//   vite2-chapters-batch9.js  : 第九部分 高级特性 + 部署（55-61 章）
//   vite2-chapters-batch10.js : 第十部分 实战项目 + 结尾（62-65 章）
// =============================================================

import { chapters as batch1 } from "./vite2-chapters-batch1";
import { chapters as batch2 } from "./vite2-chapters-batch2";
import { chapters as batch3 } from "./vite2-chapters-batch3";
import { chapters as batch4 } from "./vite2-chapters-batch4";
import { chapters as batch5 } from "./vite2-chapters-batch5";
import { chapters as batch6 } from "./vite2-chapters-batch6";
import { chapters as batch7 } from "./vite2-chapters-batch7";
import { chapters as batch8 } from "./vite2-chapters-batch8";
import { chapters as batch9 } from "./vite2-chapters-batch9";
import { chapters as batch10 } from "./vite2-chapters-batch10";

export const vite2Chapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
  ...batch7,
  ...batch8,
  ...batch9,
  ...batch10,
];

export const vite2ChapterGroups = [
  "开篇",
  "第一部分 入门基础",
  "第二部分 核心概念",
  "第三部分 配置详解",
  "第四部分 静态资源",
  "第五部分 环境与变量",
  "第六部分 服务器配置",
  "第七部分 构建优化",
  "第八部分 插件系统",
  "第九部分 框架集成",
  "第十部分 工程化",
  "第十一部分 SSR/SSG",
  "第十二部分 高级特性",
  "第十三部分 部署",
  "第十四部分 实战项目",
  "结尾",
];
