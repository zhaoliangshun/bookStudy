// =============================================================
// Blog 系统教程章节数据（聚合入口）
// -------------------------------------------------------------
// 主题：用 FastAPI + JWT + SQLAlchemy 从零搭建一个博客系统后端
//
// 教程特色：
//   1. code 字段是「真正可运行的 Python」，通过 /api/run-py 在
//      python3 沙箱中执行，使用 FastAPI 的 TestClient 在进程内
//      发起请求，因此无需启动 uvicorn 服务器就能看到真实的
//      HTTP 状态码、响应体、JSON 数据。
//   2. JWT 章节同时讲解「手动实现（hmac+base64）」和「PyJWT 库
//      用法」，前者讲透原理，后者贴近实战。
//   3. 密码哈希使用 passlib + bcrypt，数据库使用 SQLAlchemy +
//      SQLite 内存库，全部可在沙箱中真实运行。
//
// 章节文件拆分：
//   blog-chapters-batch1.js : FastAPI 基础（intro, routing, pydantic,
//                                     database, dependency）
//   blog-chapters-batch2.js : JWT 认证与博客业务（password,
//                                     jwt-principle, jwt-fastapi,
//                                     crud, deploy）
// =============================================================

import { chapters as batch1 } from "./blog-chapters-batch1";
import { chapters as batch2 } from "./blog-chapters-batch2";

// 按分组顺序拼接所有章节
export const blogChapters = [
  ...batch1,
  ...batch2,
];

// 侧边栏分组顺序
export const blogChapterGroups = [
  "FastAPI 基础",
  "JWT 认证与博客业务",
];
