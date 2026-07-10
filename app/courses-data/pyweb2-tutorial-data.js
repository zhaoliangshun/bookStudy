// =============================================================
// Python Web 后端开发实战教程（全新版）—— 章节数据聚合入口
// -------------------------------------------------------------
// 以 FastAPI 为核心，系统串联 Python Web 后端开发全栈知识。
// 覆盖：HTTP 基础 → RESTful API → WSGI/ASGI → ORM/SQLAlchemy
//       → FastAPI 核心 → FastAPI 进阶（认证/WebSocket/上传/CORS）
//       → Django → Flask
//
// 教程定位：纯阅读型（代码示例在 content 的 markdown 代码块中展示）
// 因为 Web 应用代码需要服务器环境启动，playground 无法直接运行。
// 重点讲清「为什么」和「怎么想」，框架会变，Web 原理长存。
// =============================================================

import { chapters as batch1 } from "./pyweb2-chapters-batch1";
import { chapters as batch2 } from "./pyweb2-chapters-batch2";
import { chapters as batch3 } from "./pyweb2-chapters-batch3";
import { chapters as batch4 } from "./pyweb2-chapters-batch4";
import { chapters as batch5 } from "./pyweb2-chapters-batch5";
import { chapters as batch6 } from "./pyweb2-chapters-batch6";
import { chapters as batch7 } from "./pyweb2-chapters-batch7";
import { chapters as batch8 } from "./pyweb2-chapters-batch8";

export const pyweb2Chapters = [
  ...batch1, ...batch2, ...batch3, ...batch4,
  ...batch5, ...batch6, ...batch7, ...batch8,
];

export const pyweb2ChapterGroups = [
  "HTTP 基础",
  "RESTful API 设计",
  "WSGI 与 ASGI",
  "ORM 与 SQLAlchemy",
  "FastAPI 核心",
  "FastAPI 进阶",
  "Django 框架",
  "Flask 框架",
];
