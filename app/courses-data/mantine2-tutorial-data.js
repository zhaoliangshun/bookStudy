// =============================================================
// Mantine 从入门到精通大全 —— 章节数据聚合入口
// -------------------------------------------------------------
// 定位：大而全的 Mantine v9 参考书，48 章覆盖日常开发 100% 高频知识点
// 版本：Mantine v9 / React 19 / Next.js 16
//
// 10 个 batch 文件：
//   mantine2-chapters-batch1.js  : 前言 + 第一部分入门基础（前言+1-4章）
//   mantine2-chapters-batch2.js  : 第二部分 文本与排版（5-9章）
//   mantine2-chapters-batch3.js  : 第三部分 布局组件（10-13章）
//   mantine2-chapters-batch4.js  : 第四部分 按钮与标识（14-17章）
//   mantine2-chapters-batch5.js  : 第五部分 表单输入（18-24章）
//   mantine2-chapters-batch6.js  : 第六部分 表单进阶（25-27章）
//   mantine2-chapters-batch7.js  : 第七部分 反馈与覆盖层（28-32章）
//   mantine2-chapters-batch8.js  : 第八部分 导航与数据展示（33-38章）
//   mantine2-chapters-batch9.js  : 第九部分 主题与样式定制（39-42章）
//   mantine2-chapters-batch10.js : 第十部分 Hooks与实战 + 结语（43-48章+结语）
// =============================================================

import { chapters as batch1 } from "./mantine2-chapters-batch1";
import { chapters as batch2 } from "./mantine2-chapters-batch2";
import { chapters as batch3 } from "./mantine2-chapters-batch3";
import { chapters as batch4 } from "./mantine2-chapters-batch4";
import { chapters as batch5 } from "./mantine2-chapters-batch5";
import { chapters as batch6 } from "./mantine2-chapters-batch6";
import { chapters as batch7 } from "./mantine2-chapters-batch7";
import { chapters as batch8 } from "./mantine2-chapters-batch8";
import { chapters as batch9 } from "./mantine2-chapters-batch9";
import { chapters as batch10 } from "./mantine2-chapters-batch10";

export const mantine2Chapters = [
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
];

export const mantine2ChapterGroups = [
  "开篇",
  "第一部分 入门基础",
  "第二部分 文本与排版",
  "第三部分 布局组件",
  "第四部分 按钮与标识",
  "第五部分 表单输入",
  "第六部分 表单进阶",
  "第七部分 反馈与覆盖层",
  "第八部分 导航与数据展示",
  "第九部分 主题与样式定制",
  "第十部分 Hooks 与实战",
  "结尾",
];
