// =============================================================
// React 中使用 TypeScript 从入门到精通大全 —— 章节数据聚合入口
// -------------------------------------------------------------
// 定位：完全重新编写的 TS+React 教程，80+ 章覆盖日常开发 100% 高频知识点
// 版本：TypeScript 5.x + React 18
// 沙箱：/api/run-ts（TS 转译 ES2020 + CommonJS + ReactJSX）
//
// 16 个 batch 文件（每个文件是一个 const chapters 数组）：
//   tsx3-chapters-batch1.js  : 开篇 + 第一部分 ch01-ch05（TS 类型基础 上）
//   tsx3-chapters-batch2.js  : 第一部分 ch06-ch10（TS 类型基础 下）
//   tsx3-chapters-batch3.js  : 第二部分 ch11-ch14（TS 进阶 上）
//   tsx3-chapters-batch4.js  : 第二部分 ch15-ch18（TS 进阶 下）
//   tsx3-chapters-batch5.js  : 第三部分 ch19-ch23（React+TS 工程基础 上）
//   tsx3-chapters-batch6.js  : 第三部分 ch24-ch26 + 第四部分 ch27-ch29（组件+事件+表单）
//   tsx3-chapters-batch7.js  : 第四部分 ch30-ch32 + 第五部分 ch33-ch35（表单+Hooks 上）
//   tsx3-chapters-batch8.js  : 第五部分 ch36-ch39（Hooks 中）
//   tsx3-chapters-batch9.js  : 第五部分 ch40-ch44（Hooks 下）
//   tsx3-chapters-batch10.js : 第六部分 ch45-ch50（性能优化）
//   tsx3-chapters-batch11.js : 第七部分 ch51-ch56（数据请求）
//   tsx3-chapters-batch12.js : 第八部分 ch57-ch61（状态管理）
//   tsx3-chapters-batch13.js : 第九部分 ch62-ch65（路由）
//   tsx3-chapters-batch14.js : 第十部分 ch66-ch69（样式方案）
//   tsx3-chapters-batch15.js : 第十一部分 ch70-ch73（测试）
//   tsx3-chapters-batch16.js : 第十二部分 ch74-ch78 + 第十三部分 ch79-ch82 + 结尾
// =============================================================

import { chapters as batch1 } from "./tsx3-chapters-batch1";
import { chapters as batch2 } from "./tsx3-chapters-batch2";
import { chapters as batch3 } from "./tsx3-chapters-batch3";
import { chapters as batch4 } from "./tsx3-chapters-batch4";
import { chapters as batch5 } from "./tsx3-chapters-batch5";
import { chapters as batch6 } from "./tsx3-chapters-batch6";
import { chapters as batch7 } from "./tsx3-chapters-batch7";
import { chapters as batch8 } from "./tsx3-chapters-batch8";
import { chapters as batch9 } from "./tsx3-chapters-batch9";
import { chapters as batch10 } from "./tsx3-chapters-batch10";
import { chapters as batch11 } from "./tsx3-chapters-batch11";
import { chapters as batch12 } from "./tsx3-chapters-batch12";
import { chapters as batch13 } from "./tsx3-chapters-batch13";
import { chapters as batch14 } from "./tsx3-chapters-batch14";
import { chapters as batch15 } from "./tsx3-chapters-batch15";
import { chapters as batch16 } from "./tsx3-chapters-batch16";

export const tsx3Chapters = [
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

export const tsx3ChapterGroups = [
  "开篇",
  "第一部分 TypeScript 类型基础",
  "第二部分 TypeScript 类型进阶",
  "第三部分 React + TS 工程基础",
  "第四部分 事件与表单",
  "第五部分 Hooks 全解",
  "第六部分 性能优化",
  "第七部分 数据请求",
  "第八部分 状态管理",
  "第九部分 路由",
  "第十部分 样式方案",
  "第十一部分 测试",
  "第十二部分 工程化",
  "第十三部分 进阶主题",
  "结尾",
];
