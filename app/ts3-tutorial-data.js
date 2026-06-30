// =============================================================
// TypeScript 高阶实战教程（ts3）章节数据聚合入口
// -------------------------------------------------------------
// 教程内容按章节分组拆分到 5 个独立文件：
//   ts3-chapters-batch1.js : 类型体操深入
//   ts3-chapters-batch2.js : React 与 TypeScript
//   ts3-chapters-batch3.js : Node.js 后端 TypeScript
//   ts3-chapters-batch4.js : 工具链与工程化
//   ts3-chapters-batch5.js : 架构与实战
//
// 用户代码会先被 TypeScript 编译器转译成 JS（/api/run-ts），
// 再在 vm 沙箱中执行，因此所有 demo 都支持 TS 语法。
// =============================================================

import { chapters as batch1 } from "./ts3-chapters-batch1";
import { chapters as batch2 } from "./ts3-chapters-batch2";
import { chapters as batch3 } from "./ts3-chapters-batch3";
import { chapters as batch4 } from "./ts3-chapters-batch4";
import { chapters as batch5 } from "./ts3-chapters-batch5";

// 按分组顺序拼接所有章节
export const ts3Chapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

// 侧边栏分组顺序
export const ts3ChapterGroups = [
  "类型体操深入",
  "React 与 TypeScript",
  "Node.js 后端开发",
  "工具链与工程化",
  "架构与实战",
];