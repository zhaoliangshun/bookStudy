// =============================================================
// FastAPI 现代开发全书 —— 章节数据聚合入口
// -------------------------------------------------------------
// 40 章 12 分组，全新编写，超详细讲解。
// 覆盖：开篇导读 → 路由请求 → Pydantic 校验 → 响应处理
//       → 依赖注入 → 中间件异常 → 数据库 → 认证安全
//       → 异步编程 → WebSocket → 测试文档 → 工程化部署
//
// 路由：/fastapi-pro
// 定位：完整的现代 FastAPI 开发书籍，多 demo、多注释、多文字描述
// =============================================================

import { chapters as batch1 } from "./fastapi-pro-chapters-batch1";
import { chapters as batch2 } from "./fastapi-pro-chapters-batch2";
import { chapters as batch3 } from "./fastapi-pro-chapters-batch3";
import { chapters as batch4 } from "./fastapi-pro-chapters-batch4";
import { chapters as batch5 } from "./fastapi-pro-chapters-batch5";
import { chapters as batch6 } from "./fastapi-pro-chapters-batch6";
import { chapters as batch7 } from "./fastapi-pro-chapters-batch7";
import { chapters as batch8 } from "./fastapi-pro-chapters-batch8";
import { chapters as batch9 } from "./fastapi-pro-chapters-batch9";
import { chapters as batch10 } from "./fastapi-pro-chapters-batch10";

export const fastapiProChapters = [
  ...batch1, ...batch2, ...batch3, ...batch4,
  ...batch5, ...batch6, ...batch7, ...batch8,
  ...batch9, ...batch10,
];

export const fastapiProChapterGroups = [
  "开篇导读",
  "路由与请求",
  "Pydantic 数据校验",
  "响应处理",
  "依赖注入",
  "中间件与异常",
  "数据库集成",
  "认证与安全",
  "异步编程",
  "WebSocket 实时通信",
  "测试与文档",
  "项目工程化",
];
