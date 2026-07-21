// =============================================================
// Mantine v9 深度实战 —— 章节数据聚合入口
// -------------------------------------------------------------
// 本书聚焦：
//   1. Mantine 的设计理念与设计目的
//   2. Theme 主题系统（颜色、字体、间距、Styles API）
//   3. Form 表单验证（useForm + schemaResolver + Zod）
//
// 教程定位:纯阅读型技术书籍(代码示例在 content 的 markdown 代码块中展示)
// 重点讲清「为什么这样设计」和「怎么用」,而非罗列 API。
// =============================================================

import { chapters as batch1 } from "./mantinepro-chapters-batch1";
import { chapters as batch2 } from "./mantinepro-chapters-batch2";
import { chapters as batch3 } from "./mantinepro-chapters-batch3";
import { chapters as batch4 } from "./mantinepro-chapters-batch4";
import { chapters as batch5 } from "./mantinepro-chapters-batch5";

// 合并所有批次的章节
export const mantineproChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

// 章节分组（对应侧边栏的分组标题）
export const mantineproChapterGroups = [
  "一、Mantine 的理念",
  "二、Mantine Theme 系统",
  "三、Mantine Form 验证",
  "四、总结与实战",
];
