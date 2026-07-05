// =============================================================
// Python 实战项目教程 —— 章节数据聚合入口
// -------------------------------------------------------------
// 10 个实战项目,从命令行工具到企业级 FastAPI 后端,
// 每个项目都包含架构设计、完整代码、demo 展示与逐行注释。
//
// 覆盖:CLI 工具 / 文件管理器(命令行与工具)
//       → 爬虫 / RESTful API(网络与数据采集)
//       → 博客系统 / 用户权限管理(Web 应用开发)
//       → WebSocket 聊天室 / 秒杀系统(实时与高并发)
//       → 电商后台 / 企业级 FastAPI(综合系统)
//
// 教程定位:纯阅读型(代码示例在 content 的 markdown 代码块中展示)
// 重点讲清「为什么这样设计」「怎么实现」,大量 demo,逐行注释,实战为准。
// =============================================================

import { chapters as batch1 } from "./pyproject-chapters-batch1";
import { chapters as batch2 } from "./pyproject-chapters-batch2";
import { chapters as batch3 } from "./pyproject-chapters-batch3";
import { chapters as batch4 } from "./pyproject-chapters-batch4";
import { chapters as batch5 } from "./pyproject-chapters-batch5";

export const pyprojectChapters = [
  ...batch1, ...batch2, ...batch3, ...batch4, ...batch5,
];

export const pyprojectChapterGroups = [
  "命令行与工具",
  "网络与数据采集",
  "Web 应用开发",
  "实时与高并发",
  "综合系统",
];
