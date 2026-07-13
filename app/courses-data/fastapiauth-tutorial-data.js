// =============================================================
// FastAPI 企业级认证与授权教程（fastapiauth）章节数据聚合入口
// -------------------------------------------------------------
// 主题：从 HTTP 无状态到企业级认证系统，全面讲解 FastAPI 认证授权
// 面向：想掌握企业级认证授权系统的 FastAPI 开发者
// 共 20 章，6 个分组：
//   fastapiauth-chapters-batch1.js : 认证基础 + JWT 核心（5 章）
//   fastapiauth-chapters-batch2.js : 密码安全 + FastAPI 认证机制（5 章）
//   fastapiauth-chapters-batch3.js : 权限控制 + 企业级方案（5 章）
//   fastapiauth-chapters-batch4.js : 多设备登录 + 完整实战（5 章）
//
// 每章包含 content（Markdown 讲解）和 code（可运行 Python demo）。
// =============================================================

import { chapters as batch1 } from "./fastapiauth-chapters-batch1";
import { chapters as batch2 } from "./fastapiauth-chapters-batch2";
import { chapters as batch3 } from "./fastapiauth-chapters-batch3";
import { chapters as batch4 } from "./fastapiauth-chapters-batch4";

// 按分组顺序拼接所有章节
export const fastapiauthChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
];

// 侧边栏分组顺序（6 组 20 章）
export const fastapiauthChapterGroups = [
  "第一部分 认证基础原理",
  "第二部分 JWT 核心原理",
  "第三部分 FastAPI 认证机制",
  "第四部分 权限控制",
  "第五部分 企业级方案",
  "第六部分 完整实战",
];
