// =============================================================
// Python 开发常用知识点（pykit）章节数据聚合入口
// -------------------------------------------------------------
// 聚焦日常开发最高频使用的 Python 知识点，总结性 + 实用 demo。
// 每行代码都有中文注释，demo 可直接运行。
//
// 章节分组说明：
//   batch1（1-5章）：  字符串与文本处理
//   batch2（6-10章）： 数据结构与集合
//   batch3（11-15章）：函数与装饰器
//   batch4（16-20章）：文件与路径操作
//   batch5（21-24章）：错误处理与调试技巧
// =============================================================

import { chapters as batch1 } from "./pykit-chapters-batch1";
import { chapters as batch2 } from "./pykit-chapters-batch2";
import { chapters as batch3 } from "./pykit-chapters-batch3";
import { chapters as batch4 } from "./pykit-chapters-batch4";
import { chapters as batch5 } from "./pykit-chapters-batch5";

export const pykitChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

// 导出分组（用于侧边栏分组展示）
export const pykitChapterGroups = [
  "字符串与文本处理",
  "数据结构与集合",
  "函数与装饰器",
  "文件与路径操作",
  "错误处理与调试技巧",
];
