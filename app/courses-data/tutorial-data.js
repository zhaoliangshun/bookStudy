// =============================================================
// Node.js 教程章节数据（聚合入口）
// -------------------------------------------------------------
// 教程内容按章节分组拆分到 15 个独立文件，共 100 章：
//
//   chapters-batch1.js  : 快速入门（5 章）
//   chapters-batch2.js  : 核心基础（8 章）
//   chapters-batch3.js  : 异步编程（6 章）
//   chapters-batch4.js  : 核心模块（8 章）
//   chapters-batch5.js  : 构建 API（8 章）
//   chapters-batch6.js  : 认证与安全（6 章）
//   chapters-batch7.js  : 数据存储（6 章）
//   chapters-batch8.js  : 测试与调试（6 章）
//   chapters-batch9.js  : 工程化（6 章）
//   chapters-batch10.js : 性能与优化（6 章）
//   chapters-batch11.js : 实战模式（6 章）
//   chapters-batch12.js : 实用场景（8 章）
//   chapters-batch13.js : 进阶干货·底层机制与诊断篇（7 章）
//   chapters-batch14.js : 进阶干货·生产工程篇（7 章）
//   chapters-batch15.js : 进阶干货·高级实战与可观测篇（7 章）
//
// 每个章节对象的结构：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名
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
import { chapters as batch10 } from "./chapters-batch10";
import { chapters as batch11 } from "./chapters-batch11";
import { chapters as batch12 } from "./chapters-batch12";
import { chapters as batch13 } from "./chapters-batch13";
import { chapters as batch14 } from "./chapters-batch14";
import { chapters as batch15 } from "./chapters-batch15";

// 按分组顺序拼接所有章节（100 章）
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
  ...batch10,
  ...batch11,
  ...batch12,
  ...batch13,
  ...batch14,
  ...batch15,
];

// 侧边栏分组顺序（13 组 100 章）
export const chapterGroups = [
  "快速入门",
  "核心基础",
  "异步编程",
  "核心模块",
  "构建 API",
  "认证与安全",
  "数据存储",
  "测试与调试",
  "工程化",
  "性能与优化",
  "实战模式",
  "实用场景",
  "进阶干货",
];