// =============================================================
// Python 从入门到精通大全（终极版）—— 章节数据聚合入口
// -------------------------------------------------------------
// 定位：大而全的 Python 参考书，80+ 章覆盖日常开发 100% 高频知识点
// 版本：Python 3.12+
// 沙箱：/api/run-py（python3 子进程，10 秒超时，1MB 输出）
//
// 16 个 batch 文件（每个文件是一个 const chapters 数组）：
//   py10-chapters-batch1.js  : 开篇 + 入门基础（ch01-ch05）
//   py10-chapters-batch2.js  : 数据类型与字符串（ch06-ch10）
//   py10-chapters-batch3.js  : 流程控制（ch11-ch15）
//   py10-chapters-batch4.js  : 数据结构（ch16-ch20）
//   py10-chapters-batch5.js  : 函数基础（ch21-ch25）
//   py10-chapters-batch6.js  : 函数进阶（ch26-ch30）
//   py10-chapters-batch7.js  : 面向对象基础（ch31-ch35）
//   py10-chapters-batch8.js  : 面向对象进阶（ch36-ch40）
//   py10-chapters-batch9.js  : 异常处理（ch41-ch45）
//   py10-chapters-batch10.js : 文件 IO 与模块（ch46-ch50）
//   py10-chapters-batch11.js : 装饰器与迭代器（ch51-ch55）
//   py10-chapters-batch12.js : 并发编程（ch56-ch60）
//   py10-chapters-batch13.js : 异步编程 asyncio（ch61-ch65）
//   py10-chapters-batch14.js : 网络与数据库（ch66-ch70）
//   py10-chapters-batch15.js : 测试与工程化（ch71-ch75）
//   py10-chapters-batch16.js : 标准库与综合实战（ch76-ch82）+ 结尾
// =============================================================

import { chapters as batch1 } from "./py10-chapters-batch1";
import { chapters as batch2 } from "./py10-chapters-batch2";
import { chapters as batch3 } from "./py10-chapters-batch3";
import { chapters as batch4 } from "./py10-chapters-batch4";
import { chapters as batch5 } from "./py10-chapters-batch5";
import { chapters as batch6 } from "./py10-chapters-batch6";
import { chapters as batch7 } from "./py10-chapters-batch7";
import { chapters as batch8 } from "./py10-chapters-batch8";
import { chapters as batch9 } from "./py10-chapters-batch9";
import { chapters as batch10 } from "./py10-chapters-batch10";
import { chapters as batch11 } from "./py10-chapters-batch11";
import { chapters as batch12 } from "./py10-chapters-batch12";
import { chapters as batch13 } from "./py10-chapters-batch13";
import { chapters as batch14 } from "./py10-chapters-batch14";
import { chapters as batch15 } from "./py10-chapters-batch15";
import { chapters as batch16 } from "./py10-chapters-batch16";

export const py10Chapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
  ...batch7,
  ...batch8,
  ...batch9,
  ...batch10,
  ...batch11,
  ...batch12,
  ...batch13,
  ...batch14,
  ...batch15,
  ...batch16,
];

export const py10ChapterGroups = [
  "开篇",
  "第一部分 Python 入门基础",
  "第二部分 数据类型与字符串",
  "第三部分 流程控制",
  "第四部分 数据结构",
  "第五部分 函数基础",
  "第六部分 函数进阶",
  "第七部分 面向对象基础",
  "第八部分 面向对象进阶",
  "第九部分 异常处理",
  "第十部分 文件 IO 与模块",
  "第十一部分 装饰器与迭代器",
  "第十二部分 并发编程",
  "第十三部分 异步编程 asyncio",
  "第十四部分 网络与数据库",
  "第十五部分 测试与工程化",
  "第十六部分 标准库与综合实战",
  "结尾",
];