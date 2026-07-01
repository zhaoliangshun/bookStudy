// =============================================================
// Python 逐层深入教程（py9）章节数据聚合入口
// -------------------------------------------------------------
// 全新制作，共 40 章，4 个 batch 文件。
// 风格：抽丝剥茧、深入浅出，每章配可运行 demo + 详细注释。
// 运行方式：通过 /api/run-py 调用系统 python3 子进程执行。
// =============================================================

import { chapters as batch1 } from "./py9-chapters-batch1";
import { chapters as batch2 } from "./py9-chapters-batch2";
import { chapters as batch3 } from "./py9-chapters-batch3";
import { chapters as batch4 } from "./py9-chapters-batch4";

export const py9Chapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
];

export const py9ChapterGroups = [
  "起步：认识 Python",
  "数据：Python 里的东西",
  "流程：判断与重复",
  "函数：代码的复用",
  "面向对象：描述世界",
  "异常文件与实战",
];
