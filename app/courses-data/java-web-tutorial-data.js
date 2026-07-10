// =============================================================
// Java Web 应用开发实战教程 —— 章节数据聚合入口
// -------------------------------------------------------------
// 64 章 16 分组,从零开始系统讲解 Java Web 应用开发全景。
// 覆盖:HTTP/Servlet/JSP 基础 → JDBC → Maven → Spring Framework
//       → Spring Boot → Spring MVC → Spring Data JPA
//       → Thymeleaf → RESTful API → Spring Security
//       → WebSocket → 测试 → 部署 → 实战项目
//
// 教程定位:纯阅读型(代码示例在 content 的 markdown 代码块中展示)
// 因为 Java Web 代码需要服务器环境启动,playground 无法直接运行。
// 重点讲清「为什么」和「怎么想」,框架会变,Web 原理长存。
// =============================================================

import { chapters as batch1 } from "./java-web-chapters-batch1";
import { chapters as batch2 } from "./java-web-chapters-batch2";
import { chapters as batch3 } from "./java-web-chapters-batch3";
import { chapters as batch4 } from "./java-web-chapters-batch4";
import { chapters as batch5 } from "./java-web-chapters-batch5";
import { chapters as batch6 } from "./java-web-chapters-batch6";
import { chapters as batch7 } from "./java-web-chapters-batch7";
import { chapters as batch8 } from "./java-web-chapters-batch8";
import { chapters as batch9 } from "./java-web-chapters-batch9";
import { chapters as batch10 } from "./java-web-chapters-batch10";
import { chapters as batch11 } from "./java-web-chapters-batch11";
import { chapters as batch12 } from "./java-web-chapters-batch12";
import { chapters as batch13 } from "./java-web-chapters-batch13";
import { chapters as batch14 } from "./java-web-chapters-batch14";
import { chapters as batch15 } from "./java-web-chapters-batch15";
import { chapters as batch16 } from "./java-web-chapters-batch16";

export const javaWebChapters = [
  ...batch1, ...batch2, ...batch3, ...batch4,
  ...batch5, ...batch6, ...batch7, ...batch8,
  ...batch9, ...batch10, ...batch11, ...batch12,
  ...batch13, ...batch14, ...batch15, ...batch16,
];

export const javaWebChapterGroups = [
  "Java Web 基础与 HTTP",
  "Servlet 入门",
  "JSP 与表达式语言",
  "JDBC 数据库访问",
  "Maven 与构建工具",
  "Spring Framework 核心",
  "Spring Boot 入门",
  "Spring MVC Web",
  "Spring Data JPA",
  "模板引擎 Thymeleaf",
  "RESTful API 设计",
  "Spring Security 认证",
  "WebSocket 实时通信",
  "测试与调试",
  "部署与运维",
  "实战项目",
];
