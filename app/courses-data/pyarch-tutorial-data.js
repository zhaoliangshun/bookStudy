// =============================================================
// Python 设计思想与架构实战教程 —— 章节数据聚合入口
// -------------------------------------------------------------
// 从 SOLID 原则到设计模式,从架构模式到 RESTful API,
// 从微服务到消息队列,系统讲解 Python 工程化设计思想。
//
// 覆盖：SOLID 原则 → 设计模式（创建型/结构型/行为型）
//       → 架构模式（MVC/分层/整洁/六边形）→ RESTful API 设计
//       → 微服务架构 → 消息队列（RabbitMQ/Kafka）
//
// 教程定位：纯阅读型（代码示例在 content 的 markdown 代码块中展示）
// 重点讲清「为什么」和「怎么想」,框架会变,设计思想长存。
// =============================================================

import { chapters as batch1 } from "./pyarch-chapters-batch1";
import { chapters as batch2 } from "./pyarch-chapters-batch2";
import { chapters as batch3 } from "./pyarch-chapters-batch3";
import { chapters as batch4 } from "./pyarch-chapters-batch4";
import { chapters as batch5 } from "./pyarch-chapters-batch5";
import { chapters as batch6 } from "./pyarch-chapters-batch6";
import { chapters as batch7 } from "./pyarch-chapters-batch7";
import { chapters as batch8 } from "./pyarch-chapters-batch8";

export const pyarchChapters = [
  ...batch1, ...batch2, ...batch3, ...batch4,
  ...batch5, ...batch6, ...batch7, ...batch8,
];

export const pyarchChapterGroups = [
  "SOLID 原则",
  "设计模式 · 创建型",
  "设计模式 · 结构型",
  "设计模式 · 行为型",
  "架构模式",
  "RESTful API 设计",
  "微服务架构",
  "消息队列",
];
