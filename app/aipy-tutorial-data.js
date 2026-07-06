// =============================================================
// Python 人工智能开发教程章节数据（聚合入口）
// -------------------------------------------------------------
// 教程内容按章节分组拆分到 9 个独立文件，共 45 章：
//
//   aipy-chapters-batch1.js : AI开发入门（5 章）
//   aipy-chapters-batch2.js : NumPy科学计算（5 章）
//   aipy-chapters-batch3.js : Pandas数据处理（5 章）
//   aipy-chapters-batch4.js : 数据可视化（5 章）
//   aipy-chapters-batch5.js : 机器学习基础（5 章）
//   aipy-chapters-batch6.js : 深度学习入门（5 章）
//   aipy-chapters-batch7.js : 自然语言处理（5 章）
//   aipy-chapters-batch8.js : 计算机视觉（5 章）
//   aipy-chapters-batch9.js : AI项目实战（5 章）
//
// 每个章节对象的结构：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名
//   content : Markdown 格式的详细讲解
//   code    : 可运行、带详细注释的示例代码
// =============================================================

import { chapters as batch1 } from "./aipy-chapters-batch1";
import { chapters as batch2 } from "./aipy-chapters-batch2";
import { chapters as batch3 } from "./aipy-chapters-batch3";
import { chapters as batch4 } from "./aipy-chapters-batch4";
import { chapters as batch5 } from "./aipy-chapters-batch5";
import { chapters as batch6 } from "./aipy-chapters-batch6";
import { chapters as batch7 } from "./aipy-chapters-batch7";
import { chapters as batch8 } from "./aipy-chapters-batch8";
import { chapters as batch9 } from "./aipy-chapters-batch9";

// 按分组顺序拼接所有章节（45 章）
export const aipyChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
  ...batch7,
  ...batch8,
  ...batch9,
];

// 侧边栏分组顺序（9 组 45 章）
export const aipyChapterGroups = [
  "AI开发入门",
  "NumPy科学计算",
  "Pandas数据处理",
  "数据可视化",
  "机器学习基础",
  "深度学习入门",
  "自然语言处理",
  "计算机视觉",
  "AI项目实战",
];
