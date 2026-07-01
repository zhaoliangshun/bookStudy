// =============================================================
// Python Web 应用开发实战教程 —— 章节数据聚合入口
// -------------------------------------------------------------
// 64 章 16 分组,从零开始系统讲解 Python Web 应用开发全景。
// 覆盖:HTTP 基础 → WSGI/ASGI → Flask → Django → Jinja2 模板
//       → SQLAlchemy ORM → 表单文件 → Session 认证
//       → REST API 设计 → WebSocket → 测试调试 → 部署实战
//
// 教程定位:纯阅读型(代码示例在 content 的 markdown 代码块中展示)
// 因为 Web 应用代码需要服务器环境启动,playground 无法直接运行。
// 重点讲清「为什么」和「怎么想」,框架会变,Web 原理长存。
// =============================================================

import { chapters as batch1 } from "./pyweb-chapters-batch1";
import { chapters as batch2 } from "./pyweb-chapters-batch2";
import { chapters as batch3 } from "./pyweb-chapters-batch3";
import { chapters as batch4 } from "./pyweb-chapters-batch4";
import { chapters as batch5 } from "./pyweb-chapters-batch5";
import { chapters as batch6 } from "./pyweb-chapters-batch6";
import { chapters as batch7 } from "./pyweb-chapters-batch7";
import { chapters as batch8 } from "./pyweb-chapters-batch8";
import { chapters as batch9 } from "./pyweb-chapters-batch9";
import { chapters as batch10 } from "./pyweb-chapters-batch10";
import { chapters as batch11 } from "./pyweb-chapters-batch11";
import { chapters as batch12 } from "./pyweb-chapters-batch12";
import { chapters as batch13 } from "./pyweb-chapters-batch13";
import { chapters as batch14 } from "./pyweb-chapters-batch14";
import { chapters as batch15 } from "./pyweb-chapters-batch15";
import { chapters as batch16 } from "./pyweb-chapters-batch16";

export const pywebChapters = [
  ...batch1, ...batch2, ...batch3, ...batch4,
  ...batch5, ...batch6, ...batch7, ...batch8,
  ...batch9, ...batch10, ...batch11, ...batch12,
  ...batch13, ...batch14, ...batch15, ...batch16,
];

export const pywebChapterGroups = [
  "Web 基础与 HTTP",
  "WSGI 与 ASGI",
  "Flask 入门",
  "Flask 进阶",
  "Django 入门",
  "Django 模型",
  "Django 视图与模板",
  "Django 认证",
  "Jinja2 模板引擎",
  "SQLAlchemy ORM",
  "表单与文件上传",
  "Session 与认证",
  "REST API 设计",
  "WebSocket 与实时",
  "测试与调试",
  "部署与实战",
];
