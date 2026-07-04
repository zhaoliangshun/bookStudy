// =============================================================
// Python 部署与运维实战教程 —— 章节数据聚合入口
// -------------------------------------------------------------
// 从 Git 版本控制到生产环境部署的完整运维链路。
// 覆盖：Git 基础与进阶 → GitHub/GitLab 协作 → Linux 常用命令
//       → Docker 容器化 → Docker Compose 编排 → Nginx 反向代理
//       → Gunicorn/Uvicorn 应用服务器 → CI/CD 持续集成
//
// 教程定位：纯阅读型（命令示例在 content 的 markdown 代码块中展示）
// 重点讲清「为什么」和「怎么想」，工具会变，运维思维长存。
// =============================================================

import { chapters as batch1 } from "./deploy-chapters-batch1";
import { chapters as batch2 } from "./deploy-chapters-batch2";
import { chapters as batch3 } from "./deploy-chapters-batch3";
import { chapters as batch4 } from "./deploy-chapters-batch4";
import { chapters as batch5 } from "./deploy-chapters-batch5";
import { chapters as batch6 } from "./deploy-chapters-batch6";
import { chapters as batch7 } from "./deploy-chapters-batch7";
import { chapters as batch8 } from "./deploy-chapters-batch8";

export const deployChapters = [
  ...batch1, ...batch2, ...batch3, ...batch4,
  ...batch5, ...batch6, ...batch7, ...batch8,
];

export const deployChapterGroups = [
  "Git 版本控制",
  "GitHub 与 GitLab",
  "Linux 常用命令",
  "Docker 容器化",
  "Docker Compose 编排",
  "Nginx 反向代理",
  "Gunicorn 与 Uvicorn",
  "CI/CD 持续集成",
];
