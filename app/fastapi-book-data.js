// =============================================================
// FastAPI 应用开发实战教程 —— 章节数据聚合入口
// -------------------------------------------------------------
// 64 章 16 分组,从零开始系统讲解 FastAPI 应用开发。
// 覆盖:入门 → 路由参数 → 请求体 → Pydantic 校验 → 响应处理
//       → 依赖注入 → 中间件 → 异常 → 数据库 → 认证安全
//       → 异步 → WebSocket → 测试 → 项目结构 → 部署 → 实战项目
//
// 教程定位:纯阅读型(代码示例在 content 的 markdown 代码块中展示)
// 因为 FastAPI 代码需要服务器环境启动,playground 无法直接运行。
// 重点讲清「为什么」和「怎么想」,API 会变,设计能力长存。
// =============================================================

import { chapters as batch1 } from "./fastapi-chapters-batch1";
import { chapters as batch2 } from "./fastapi-chapters-batch2";
import { chapters as batch3 } from "./fastapi-chapters-batch3";
import { chapters as batch4 } from "./fastapi-chapters-batch4";
import { chapters as batch5 } from "./fastapi-chapters-batch5";
import { chapters as batch6 } from "./fastapi-chapters-batch6";
import { chapters as batch7 } from "./fastapi-chapters-batch7";
import { chapters as batch8 } from "./fastapi-chapters-batch8";
import { chapters as batch9 } from "./fastapi-chapters-batch9";
import { chapters as batch10 } from "./fastapi-chapters-batch10";
import { chapters as batch11 } from "./fastapi-chapters-batch11";
import { chapters as batch12 } from "./fastapi-chapters-batch12";
import { chapters as batch13 } from "./fastapi-chapters-batch13";
import { chapters as batch14 } from "./fastapi-chapters-batch14";
import { chapters as batch15 } from "./fastapi-chapters-batch15";
import { chapters as batch16 } from "./fastapi-chapters-batch16";

export const fastapiChapters = [
  ...batch1, ...batch2, ...batch3, ...batch4,
  ...batch5, ...batch6, ...batch7, ...batch8,
  ...batch9, ...batch10, ...batch11, ...batch12,
  ...batch13, ...batch14, ...batch15, ...batch16,
];

export const fastapiChapterGroups = [
  "FastAPI 入门",
  "路径与查询参数",
  "请求体与表单",
  "Pydantic 数据校验",
  "响应处理",
  "依赖注入",
  "中间件",
  "异常处理",
  "数据库集成",
  "认证与安全",
  "异步编程",
  "WebSocket 实时通信",
  "测试",
  "项目结构与配置",
  "部署与运维",
  "实战项目",
];
