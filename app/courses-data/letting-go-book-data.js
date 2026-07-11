// =============================================================
// 《释怀——坦然面对失去的心理学》—— 章节数据聚合入口
// -------------------------------------------------------------
// 共 20 章 5 分组，系统讲解如何坦然面对人生中的失去。
// 覆盖：失去的本质 → 哀伤的心理学 → 执念与放不下
//       → 疗愈的路径 → 重建与新生
//
// 纯内容阅读型书籍，无代码执行功能。
// content 字段为 Markdown 格式的深度讲解文章，含丰富案例。
// =============================================================

import { chapters as batch1 } from "./letting-go-chapters-batch1";
import { chapters as batch2 } from "./letting-go-chapters-batch2";
import { chapters as batch3 } from "./letting-go-chapters-batch3";
import { chapters as batch4 } from "./letting-go-chapters-batch4";
import { chapters as batch5 } from "./letting-go-chapters-batch5";

export const lettingGoChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

export const lettingGoChapterGroups = [
  "失去的本质",
  "哀伤的心理学",
  "执念与放不下",
  "疗愈的路径",
  "重建与新生",
];
