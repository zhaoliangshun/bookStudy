// =============================================================
// TypeScript + React 从入门到精通大全 —— 章节数据聚合入口
// -------------------------------------------------------------
// 定位：大而全的 TS+React 参考书，80+ 章覆盖日常开发 100% 高频知识点
// 版本：TypeScript 5.x + React 18
// 沙箱：/api/run-ts（TS 转译 ES2020 + CommonJS + ReactJSX）
//
// 16 个 batch 文件（每个文件是一个 const chapters 数组）：
//   tsx2-chapters-batch1.js  : 开篇 + 类型基础（ch01-ch05）
//   tsx2-chapters-batch2.js  : 类型进阶（ch06-ch10）
//   tsx2-chapters-batch3.js  : 组件基础（ch11-ch15）
//   tsx2-chapters-batch4.js  : Props 与组件组合（ch16-ch20）
//   tsx2-chapters-batch5.js  : 事件与受控组件（ch21-ch25）
//   tsx2-chapters-batch6.js  : useState 深入（ch26-ch30）
//   tsx2-chapters-batch7.js  : useEffect 深入（ch31-ch35）
//   tsx2-chapters-batch8.js  : useRef useMemo useCallback（ch36-ch40）
//   tsx2-chapters-batch9.js  : useReducer useContext 自定义Hook（ch41-ch45）
//   tsx2-chapters-batch10.js : 高级 Hooks（ch46-ch50）
//   tsx2-chapters-batch11.js : 性能优化（ch51-ch55）
//   tsx2-chapters-batch12.js : 数据请求（ch56-ch60）
//   tsx2-chapters-batch13.js : 表单与校验（ch61-ch65）
//   tsx2-chapters-batch14.js : 路由与状态管理（ch66-ch70）
//   tsx2-chapters-batch15.js : 样式与 UI 库（ch71-ch75）
//   tsx2-chapters-batch16.js : 测试与工程化（ch76-ch82） + 结尾
// =============================================================

import { chapters as batch1 } from "./tsx2-chapters-batch1";
import { chapters as batch2 } from "./tsx2-chapters-batch2";
import { chapters as batch3 } from "./tsx2-chapters-batch3";
import { chapters as batch4 } from "./tsx2-chapters-batch4";
import { chapters as batch5 } from "./tsx2-chapters-batch5";
import { chapters as batch6 } from "./tsx2-chapters-batch6";
import { chapters as batch7 } from "./tsx2-chapters-batch7";
import { chapters as batch8 } from "./tsx2-chapters-batch8";
import { chapters as batch9 } from "./tsx2-chapters-batch9";
import { chapters as batch10 } from "./tsx2-chapters-batch10";
import { chapters as batch11 } from "./tsx2-chapters-batch11";
import { chapters as batch12 } from "./tsx2-chapters-batch12";
import { chapters as batch13 } from "./tsx2-chapters-batch13";
import { chapters as batch14 } from "./tsx2-chapters-batch14";
import { chapters as batch15 } from "./tsx2-chapters-batch15";
import { chapters as batch16 } from "./tsx2-chapters-batch16";

export const tsx2Chapters = [
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

export const tsx2ChapterGroups = [
  "开篇",
  "第一部分 TypeScript 类型基础",
  "第二部分 TypeScript 类型进阶",
  "第三部分 React 组件基础",
  "第四部分 Props 与组件组合",
  "第五部分 事件与受控组件",
  "第六部分 useState 深入",
  "第七部分 useEffect 深入",
  "第八部分 useRef / useMemo / useCallback",
  "第九部分 useReducer / useContext / 自定义 Hook",
  "第十部分 高级 Hooks",
  "第十一部分 性能优化",
  "第十二部分 数据请求",
  "第十三部分 表单与校验",
  "第十四部分 路由与状态管理",
  "第十五部分 样式与 UI 库",
  "第十六部分 测试与工程化",
  "结尾",
];