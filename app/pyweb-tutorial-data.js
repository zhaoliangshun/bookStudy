// =============================================================
// Python Web 后端开发教程 - 章节数据（聚合入口）
// -------------------------------------------------------------
// 共 20 章，覆盖 4 大主题方向，基于现代 Python Web 技术栈：
//   Python 3.11+ / FastAPI 0.110+ / Pydantic v2 / SQLAlchemy 2.0+
//
// 教程围绕一个"博客系统 API"实际项目展开，涵盖从基础到部署全流程：
//   - 基础入门：FastAPI 路由、Pydantic 验证、依赖注入
//   - 数据库：SQLAlchemy 2.0、异步数据库、Alembic 迁移、分层架构
//   - 认证与安全：密码哈希、JWT、RBAC 权限、中间件、错误处理
//   - 实战与部署：完整博客项目、pytest 测试、Docker 部署、进阶话题
//
// 4 个 batch 文件，每组 5 章：
//   pyweb-chapters-batch1.js : 基础入门 1-5
//   pyweb-chapters-batch2.js : 数据库 6-10
//   pyweb-chapters-batch3.js : 认证与安全 11-15
//   pyweb-chapters-batch4.js : 实战与部署 16-20
// =============================================================

import { chapters as batch1 } from "./pyweb-chapters-batch1";
import { chapters as batch2 } from "./pyweb-chapters-batch2";
import { chapters as batch3 } from "./pyweb-chapters-batch3";
import { chapters as batch4 } from "./pyweb-chapters-batch4";

export const pywebChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
];

export const pywebChapterGroups = [
  "基础入门",
  "数据库",
  "认证与安全",
  "实战与部署",
];
