// =============================================================
// LeetCode 面试算法 200 题 —— 章节数据聚合入口
// -------------------------------------------------------------
// 200 题 20 分组,精选 LeetCode 中等及以下难度的高频面试题。
// 每题包含:题目描述 / 思路讲解 / Python 实现 / JS 实现 / 复杂度分析 / 拓展。
// 覆盖:数组 → 字符串 → 哈希表 → 双指针 → 滑动窗口 → 二分查找
//       → 链表 → 栈队列 → 二叉树 → BST → 图 → 堆 → 回溯 → 贪心
//       → 动态规划 → 排序区间 → 位运算数学 → 数据结构设计
// =============================================================

import { chapters as batch1 } from "./leetcode-chapters-batch1";
import { chapters as batch2 } from "./leetcode-chapters-batch2";
import { chapters as batch3 } from "./leetcode-chapters-batch3";
import { chapters as batch4 } from "./leetcode-chapters-batch4";
import { chapters as batch5 } from "./leetcode-chapters-batch5";
import { chapters as batch6 } from "./leetcode-chapters-batch6";
import { chapters as batch7 } from "./leetcode-chapters-batch7";
import { chapters as batch8 } from "./leetcode-chapters-batch8";
import { chapters as batch9 } from "./leetcode-chapters-batch9";
import { chapters as batch10 } from "./leetcode-chapters-batch10";
import { chapters as batch11 } from "./leetcode-chapters-batch11";
import { chapters as batch12 } from "./leetcode-chapters-batch12";
import { chapters as batch13 } from "./leetcode-chapters-batch13";
import { chapters as batch14 } from "./leetcode-chapters-batch14";
import { chapters as batch15 } from "./leetcode-chapters-batch15";
import { chapters as batch16 } from "./leetcode-chapters-batch16";
import { chapters as batch17 } from "./leetcode-chapters-batch17";
import { chapters as batch18 } from "./leetcode-chapters-batch18";
import { chapters as batch19 } from "./leetcode-chapters-batch19";
import { chapters as batch20 } from "./leetcode-chapters-batch20";

export const leetcodeChapters = [
  ...batch1, ...batch2, ...batch3, ...batch4, ...batch5,
  ...batch6, ...batch7, ...batch8, ...batch9, ...batch10,
  ...batch11, ...batch12, ...batch13, ...batch14, ...batch15,
  ...batch16, ...batch17, ...batch18, ...batch19, ...batch20,
];

export const leetcodeChapterGroups = [
  "数组基础",
  "字符串处理",
  "哈希表",
  "双指针技巧",
  "滑动窗口",
  "二分查找",
  "链表",
  "栈与队列",
  "二叉树遍历",
  "二叉树性质与构造",
  "二叉搜索树",
  "图与搜索",
  "堆与优先队列",
  "回溯算法",
  "贪心算法",
  "动态规划基础",
  "动态规划进阶",
  "排序与区间",
  "位运算与数学",
  "数据结构设计",
];
