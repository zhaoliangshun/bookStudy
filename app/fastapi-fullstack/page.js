"use client";

import TutorialPage from "../components/TutorialPage";
import { fastapiFullstackChapters, fastapiFullstackChapterGroups } from "../courses-data/fastapi-fullstack-book-data";

// =============================================================
// FastAPI 全栈实战 · 任务看板系统 TaskBoard
// -------------------------------------------------------------
// 一个完整的全栈教学项目：FastAPI（后端）+ Next.js（前端）+ SQLite（数据库）
// 从零开始一步步搭建一个类 Trello 的看板应用，覆盖 FastAPI 现代开发全部核心：
//   - 路由 / Pydantic 校验 / 依赖注入
//   - SQLAlchemy 2.0 ORM / 数据库会话 / 关系建模
//   - JWT 认证 / 密码哈希 / 权限控制
//   - CRUD / 分页 / 过滤 / 异常处理
//   - BackgroundTasks / WebSocket / 文件上传 / 中间件
//   - Next.js 前端集成 / 拖拽 / 实时同步
//   - pytest 测试 / Docker 部署
// =============================================================

export default function FastAPIFullstackBook() {
  return (
    <TutorialPage
      chapters={fastapiFullstackChapters}
      chapterGroups={fastapiFullstackChapterGroups}
      bookPath="/fastapi-fullstack"
      bookTitle="FastAPI 全栈实战"
      defaultLang="py"
      tip="点击章节开始学习 · 每个 demo 都可在线运行"
      footerText="FastAPI 全栈实战 · 任务看板系统 TaskBoard · 从零搭建到部署上线 · 覆盖 FastAPI 现代开发全部核心知识"
    />
  );
}
