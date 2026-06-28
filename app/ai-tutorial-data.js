// =============================================================
// AI 编程方法教程章节数据（聚合入口）
// -------------------------------------------------------------
// 教程内容按章节分组拆分到 8 个独立文件，共 40 章：
//
//   ai-chapters-batch1.js : AI编程认知（5 章）
//   ai-chapters-batch2.js : 提示词工程（5 章）
//   ai-chapters-batch3.js : AI辅助编码（5 章）
//   ai-chapters-batch4.js : AI辅助学习（5 章）
//   ai-chapters-batch5.js : AI工作流（5 章）
//   ai-chapters-batch6.js : 进阶实战（5 章）
//   ai-chapters-batch7.js : 陷阱与伦理（5 章）
//   ai-chapters-batch8.js : 未来趋势（5 章）
//
// 每个章节对象的结构：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名
//   content : Markdown 格式的详细讲解
//   code    : 可运行、带详细注释的示例代码
// =============================================================

import { chapters as batch1 } from "./ai-chapters-batch1";
import { chapters as batch2 } from "./ai-chapters-batch2";
import { chapters as batch3 } from "./ai-chapters-batch3";
import { chapters as batch4 } from "./ai-chapters-batch4";
import { chapters as batch5 } from "./ai-chapters-batch5";
import { chapters as batch6 } from "./ai-chapters-batch6";
import { chapters as batch7 } from "./ai-chapters-batch7";
import { chapters as batch8 } from "./ai-chapters-batch8";

// 按分组顺序拼接所有章节（40 章）
export const aiChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
  ...batch7,
  ...batch8,
];

// 侧边栏分组顺序（8 组 40 章）
export const aiChapterGroups = [
  "AI编程认知",
  "提示词工程",
  "AI辅助编码",
  "AI辅助学习",
  "AI工作流",
  "进阶实战",
  "陷阱与伦理",
  "未来趋势",
];