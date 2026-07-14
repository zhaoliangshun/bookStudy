// =============================================================
// FastAPI 全栈实战全书 —— 章节数据聚合入口
// -------------------------------------------------------------
// 44 章 8 分组，从零搭建一个完整的「任务看板系统 TaskBoard」。
//
// 项目定位：
//   后端 FastAPI + 前端 Next.js + 数据库 SQLite
//   一个类 Trello 的看板应用，覆盖 FastAPI 现代开发全部核心知识。
//
// 章节分组（8 组 44 章）：
//   1. 项目启动与 FastAPI 入门（5 章）—— 概览、环境、第一个应用、参数、Pydantic
//   2. 数据持久化与 SQLAlchemy（5 章）—— SQLite、ORM、模型、会话、依赖注入
//   3. 用户认证系统（5 章）—— 密码哈希、JWT、注册、登录、当前用户
//   4. 看板核心 CRUD（6 章）—— Board/Column/Card 模型与增删改查
//   5. 高级特性（6 章）—— 后台任务、文件上传、WebSocket、中间件、异常、分页
//   6. Next.js 前端集成（5 章）—— 项目结构、API 客户端、认证页、看板 UI、实时同步
//   7. 测试与部署（5 章）—— pytest、单元测试、集成测试、Docker、生产部署
//   8. 进阶与生产实践（7 章）—— Alembic、异步 SQLAlchemy、RBAC、限流、Redis、OpenAPI、性能压测
//
// 设计原则：
//   - 每个 demo 都可在线运行（通过 /api/run-py 端点）
//   - 每段代码都有详细中文注释，解释「为什么这么做」
//   - 从零开始，一步步搭出完整应用
// =============================================================

import { chapters as batch1 } from "./fastapi-fullstack-chapters-batch1";
import { chapters as batch2 } from "./fastapi-fullstack-chapters-batch2";
import { chapters as batch3 } from "./fastapi-fullstack-chapters-batch3";
import { chapters as batch4 } from "./fastapi-fullstack-chapters-batch4";
import { chapters as batch5 } from "./fastapi-fullstack-chapters-batch5";
import { chapters as batch6 } from "./fastapi-fullstack-chapters-batch6";
import { chapters as batch7 } from "./fastapi-fullstack-chapters-batch7";
import { chapters as batch8 } from "./fastapi-fullstack-chapters-batch8";

export const fastapiFullstackChapters = [
  ...batch1, ...batch2, ...batch3, ...batch4,
  ...batch5, ...batch6, ...batch7, ...batch8,
];

export const fastapiFullstackChapterGroups = [
  "项目启动与 FastAPI 入门",
  "数据持久化与 SQLAlchemy",
  "用户认证系统",
  "看板核心 CRUD",
  "高级特性",
  "Next.js 前端集成",
  "测试与部署",
  "进阶与生产实践",
];
