// =============================================================
// 怼人语录 - 章节数据聚合入口
// -------------------------------------------------------------
// 共 96 章,覆盖 24 大部分。
// 纯内容阅读型语录集,无代码执行功能。
// 本书特点:语句简短,每条语录1-3句话,共约14400条金句。
//
// 24 个 batch 文件(batch1-24),每批 4 章 × 150 条 = 600 条。
// =============================================================

import { chapters as batch1 } from "./quotes-chapters-batch1";
import { chapters as batch2 } from "./quotes-chapters-batch2";
import { chapters as batch3 } from "./quotes-chapters-batch3";
import { chapters as batch4 } from "./quotes-chapters-batch4";
import { chapters as batch5 } from "./quotes-chapters-batch5";
import { chapters as batch6 } from "./quotes-chapters-batch6";
import { chapters as batch7 } from "./quotes-chapters-batch7";
import { chapters as batch8 } from "./quotes-chapters-batch8";
import { chapters as batch9 } from "./quotes-chapters-batch9";
import { chapters as batch10 } from "./quotes-chapters-batch10";
import { chapters as batch11 } from "./quotes-chapters-batch11";
import { chapters as batch12 } from "./quotes-chapters-batch12";
import { chapters as batch13 } from "./quotes-chapters-batch13";
import { chapters as batch14 } from "./quotes-chapters-batch14";
import { chapters as batch15 } from "./quotes-chapters-batch15";
import { chapters as batch16 } from "./quotes-chapters-batch16";
import { chapters as batch17 } from "./quotes-chapters-batch17";
import { chapters as batch18 } from "./quotes-chapters-batch18";
import { chapters as batch19 } from "./quotes-chapters-batch19";
import { chapters as batch20 } from "./quotes-chapters-batch20";
import { chapters as batch21 } from "./quotes-chapters-batch21";
import { chapters as batch22 } from "./quotes-chapters-batch22";
import { chapters as batch23 } from "./quotes-chapters-batch23";
import { chapters as batch24 } from "./quotes-chapters-batch24";

export const quotesChapters = [
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
  ...batch17,
  ...batch18,
  ...batch19,
  ...batch20,
  ...batch21,
  ...batch22,
  ...batch23,
  ...batch24,
];

export const quotesChapterGroups = [
  "第一部分 职场篇",
  "第二部分 亲戚家庭篇",
  "第三部分 社交生活篇",
  "第四部分 应对套路篇",
  "第五部分 金句集",
  "第六部分 职场进阶篇",
  "第七部分 校园篇",
  "第八部分 情感篇",
  "第九部分 消费篇",
  "第十部分 交通出行篇",
  "第十一部分 邻里篇",
  "第十二部分 网络进阶篇",
  "第十三部分 应对评价篇",
  "第十四部分 应对炫耀篇",
  "第十五部分 应对说教篇",
  "第十六部分 应对情绪篇",
  "第十七部分 应对越界篇",
  "第十八部分 应对双标篇",
  "第十九部分 应对杠精进阶篇",
  "第二十部分 终极金句篇",
  "第二十一部分 应对职场进阶篇",
  "第二十二部分 应对生活琐事篇",
  "第二十三部分 应对奇葩篇",
  "第二十四部分 收官金句篇",
];
