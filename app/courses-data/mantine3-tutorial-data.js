// =============================================================
// Mantine 之道 · 理念与设计目的 —— 章节数据聚合入口
// -------------------------------------------------------------
// 定位：专注 Mantine v9 四大核心主题的「内功心法」书
//   1. 核心理念 —— 团队设计哲学、组件价值观
//   2. 架构目的 —— CSS 变量、emotion、style props、Provider 机制
//   3. Theme 系统 —— createTheme、颜色、暗色模式、CSS 变量层
//   4. Form 验证 —— useForm + Zod 全链路
// 版本：Mantine v9 / React 19 / Next.js 16
//
// 6 个 batch 文件（合计 41 章）：
//   mantine3-chapters-batch1.js : 开篇 + 第一部分 核心理念（共 7 章）
//   mantine3-chapters-batch2.js : 第二部分 架构与设计目的（共 7 章）
//   mantine3-chapters-batch3.js : 第三部分 Theme 主题系统前半（共 6 章）
//   mantine3-chapters-batch4.js : 第三部分 Theme 主题系统后半（共 6 章）
//   mantine3-chapters-batch5.js : 第四部分 Form 验证体系（共 8 章）
//   mantine3-chapters-batch6.js : 第五部分 综合实战 + 总结（共 7 章）
// =============================================================

import { chapters as batch1 } from "./mantine3-chapters-batch1";
import { chapters as batch2 } from "./mantine3-chapters-batch2";
import { chapters as batch3 } from "./mantine3-chapters-batch3";
import { chapters as batch4 } from "./mantine3-chapters-batch4";
import { chapters as batch5 } from "./mantine3-chapters-batch5";
import { chapters as batch6 } from "./mantine3-chapters-batch6";

export const mantine3Chapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
];

export const mantine3ChapterGroups = [
  "开篇",
  "第一部分 核心理念",
  "第二部分 架构与设计目的",
  "第三部分 Theme 主题系统",
  "第四部分 Form 验证体系",
  "第五部分 综合实战",
  "结尾",
];
