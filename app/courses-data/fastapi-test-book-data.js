// =============================================================
// FastAPI 测试与部署全书 —— 章节数据聚合入口
// -------------------------------------------------------------
// 34 章 7 分组，超详细讲解 FastAPI 的测试与部署。
//
// 测试篇（重点，24 章）：
//   测试基础 → 测试核心 → 测试数据库与认证 → 测试进阶 → 性能与集成测试
//
// 部署篇（10 章）：
//   部署基础 → 生产部署
//
// 核心定位：
//   1. FastAPI 基于 Starlette，测试用 httpx 或自带 TestClient
//   2. TestClient 本质是 httpx + Starlette TestTransport 的封装
//   3. demo 驱动，代码注释详细，原理 + 实战并重
// =============================================================

import { chapters as batch1 } from "./fastapi-test-chapters-batch1";
import { chapters as batch2 } from "./fastapi-test-chapters-batch2";
import { chapters as batch3 } from "./fastapi-test-chapters-batch3";
import { chapters as batch4 } from "./fastapi-test-chapters-batch4";
import { chapters as batch5 } from "./fastapi-test-chapters-batch5";
import { chapters as batch6 } from "./fastapi-test-chapters-batch6";

export const fastapiTestChapters = [
  ...batch1, ...batch2, ...batch3, ...batch4,
  ...batch5, ...batch6,
];

export const fastapiTestChapterGroups = [
  "测试基础",
  "测试核心",
  "测试数据库与认证",
  "测试进阶",
  "性能与集成测试",
  "部署基础",
  "生产部署",
];
