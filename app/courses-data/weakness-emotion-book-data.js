// =============================================================
// 《人性的弱点·情绪篇》—— 总结版 · 章节数据聚合入口
// -------------------------------------------------------------
// 共 30 章，覆盖 15 大情绪方面，约 300 个弱点条目。
// 纯内容阅读型，无代码执行功能。
// 本书特点：专注情绪领域，文字简洁，点多面广，不拖泥带水，概括性强。
// 风格：一句话点透本质，每条简短有力，方便快速阅读和自我对照。
//
// 5 个 batch 文件：
//   weakness-emotion-batch1.js : 第一篇 愤怒之火·烧人烧己 / 恐惧之笼·作茧自缚 / 焦虑之网·越缠越紧（6章）
//   weakness-emotion-batch2.js : 第二篇 悲伤之渊·沉溺难出 / 嫉妒之毒·蚀心蚀骨 / 虚荣之镜·照不出真我（6章）
//   weakness-emotion-batch3.js : 第三篇 自卑之锁·锁住自己 / 贪婪之壑·永远填不满 / 冷漠之墙·隔绝温暖（6章）
//   weakness-emotion-batch4.js : 第四篇 孤独之岛·人群中的孤岛 / 依赖之藤·缠住不放手 / 矛盾之结·进退两难（6章）
//   weakness-emotion-batch5.js : 第五篇 冲动之魔·一念之差 / 敏感之刺·一碰就痛 / 执念之牢·画地为牢（6章）
// =============================================================

import { chapters as weBatch1 } from "./weakness-emotion-batch1";
import { chapters as weBatch2 } from "./weakness-emotion-batch2";
import { chapters as weBatch3 } from "./weakness-emotion-batch3";
import { chapters as weBatch4 } from "./weakness-emotion-batch4";
import { chapters as weBatch5 } from "./weakness-emotion-batch5";

export const weaknessEmotionChapters = [
  ...weBatch1,
  ...weBatch2,
  ...weBatch3,
  ...weBatch4,
  ...weBatch5,
];

export const weaknessEmotionChapterGroups = [
  "愤怒之火 · 烧人烧己",
  "恐惧之笼 · 作茧自缚",
  "焦虑之网 · 越缠越紧",
  "悲伤之渊 · 沉溺难出",
  "嫉妒之毒 · 蚀心蚀骨",
  "虚荣之镜 · 照不出真我",
  "自卑之锁 · 锁住自己",
  "贪婪之壑 · 永远填不满",
  "冷漠之墙 · 隔绝温暖",
  "孤独之岛 · 人群中的孤岛",
  "依赖之藤 · 缠住不放手",
  "矛盾之结 · 进退两难",
  "冲动之魔 · 一念之差",
  "敏感之刺 · 一碰就痛",
  "执念之牢 · 画地为牢",
];
