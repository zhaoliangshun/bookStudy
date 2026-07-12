// =============================================================
// FastAPI 实战教程（精简版）—— 章节数据聚合入口
// -------------------------------------------------------------
// 12 章 3 分组，从零开始系统讲解 FastAPI 应用开发。
// 覆盖：入门 → 路径参数 → 查询参数 → 请求体 → Pydantic → 依赖注入
//       → 数据库 → 认证安全 → 响应处理 → 中间件异常 → 异步后台任务 → 测试部署
//
// 教程定位：demo 驱动，代码注释详细，重点在代码里讲解知识点
// =============================================================

import { chapters as batch1 } from "./fastapi-simple-batch1";
import { chapters as batch2 } from "./fastapi-simple-batch2";
import { chapters as batch3 } from "./fastapi-simple-batch3";

export const fastapiSimpleChapters = [
  ...batch1, ...batch2, ...batch3,
];

export const fastapiSimpleChapterGroups = [
  "FastAPI 基础",
  "核心功能",
  "进阶实战",
];
