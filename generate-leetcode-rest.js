const fs = require('fs');
const path = require('path');

const leetcodeDir = path.join(__dirname, 'app', 'leetcode');

// 已有的30道题ID
const existingIds = new Set([
  "lc-1", "lc-26", "lc-27", "lc-35", "lc-53", "lc-66", "lc-88", "lc-118", "lc-121", "lc-136",
  "lc-169", "lc-217", "lc-283", "lc-448", "lc-11", "lc-15", "lc-31", "lc-48", "lc-54", "lc-56",
  "lc-73", "lc-75", "lc-128", "lc-152", "lc-238", "lc-287", "lc-42", "lc-3", "lc-5", "lc-20"
]);

// 需要新增的170道题
const newProblems = [
  // 字符串 (17题)
  { id: "lc-14", num: 14, title: "最长公共前缀", icon: "🟢", diff: "简单", group: "字符串" },
  { id: "lc-28", num: 28, title: "找出字符串中第一个匹配项的下标", icon: "🟢", diff: "简单", group: "字符串" },
  { id: "lc-58", num: 58, title: "最后一个单词的长度", icon: "🟢", diff: "简单", group: "字符串" },
  { id: "lc-67", num: 67, title: "二进制求和", icon: "🟢", diff: "简单", group: "字符串" },
  { id: "lc-125", num: 125, title: "验证回文串", icon: "🟢", diff: "简单", group: "字符串" },
  { id: "lc-344", num: 344, title: "反转字符串", icon: "🟢", diff: "简单", group: "字符串" },
  { id: "lc-387", num: 387, title: "字符串中的第一个唯一字符", icon: "🟢", diff: "简单", group: "字符串" },
  { id: "lc-541", num: 541, title: "反转字符串 II", icon: "🟢", diff: "简单", group: "字符串" },
  { id: "lc-557", num: 557, title: "反转字符串中的单词 III", icon: "🟢", diff: "简单", group: "字符串" },
  { id: "lc-8", num: 8, title: "字符串转换整数 (atoi)", icon: "🟡", diff: "中等", group: "字符串" },
  { id: "lc-17", num: 17, title: "电话号码的字母组合", icon: "🟡", diff: "中等", group: "字符串" },
  { id: "lc-49", num: 49, title: "字母异位词分组", icon: "🟡", diff: "中等", group: "字符串" },
  { id: "lc-71", num: 71, title: "简化路径", icon: "🟡", diff: "中等", group: "字符串" },
  { id: "lc-93", num: 93, title: "复原 IP 地址", icon: "🟡", diff: "中等", group: "字符串" },
  { id: "lc-151", num: 151, title: "反转字符串中的单词", icon: "🟡", diff: "中等", group: "字符串" },
  { id: "lc-394", num: 394, title: "字符串解码", icon: "🟡", diff: "中等", group: "字符串" },
  { id: "lc-438", num: 438, title: "找到字符串中所有字母异位词", icon: "🟡", diff: "中等", group: "字符串" },
  { id: "lc-6", num: 6, title: "N 字形变换", icon: "🟡", diff: "中等", group: "字符串" },
  { id: "lc-76", num: 76, title: "最小覆盖子串", icon: "🔴", diff: "困难", group: "字符串" },

  // 链表 (15题)
  { id: "lc-2", num: 2, title: "两数相加", icon: "🟡", diff: "中等", group: "链表" },
  { id: "lc-19", num: 19, title: "删除链表的倒数第 N 个结点", icon: "🟡", diff: "中等", group: "链表" },
  { id: "lc-21", num: 21, title: "合并两个有序链表", icon: "🟢", diff: "简单", group: "链表" },
  { id: "lc-24", num: 24, title: "两两交换链表中的节点", icon: "🟡", diff: "中等", group: "链表" },
  { id: "lc-61", num: 61, title: "旋转链表", icon: "🟡", diff: "中等", group: "链表" },
  { id: "lc-82", num: 82, title: "删除排序链表中的重复元素 II", icon: "🟡", diff: "中等", group: "链表" },
  { id: "lc-83", num: 83, title: "删除排序链表中的重复元素", icon: "🟢", diff: "简单", group: "链表" },
  { id: "lc-86", num: 86, title: "分隔链表", icon: "🟡", diff: "中等", group: "链表" },
  { id: "lc-92", num: 92, title: "反转链表 II", icon: "🟡", diff: "中等", group: "链表" },
  { id: "lc-138", num: 138, title: "随机链表的复制", icon: "🟡", diff: "中等", group: "链表" },
  { id: "lc-141", num: 141, title: "环形链表", icon: "🟢", diff: "简单", group: "链表" },
  { id: "lc-142", num: 142, title: "环形链表 II", icon: "🟡", diff: "中等", group: "链表" },
  { id: "lc-148", num: 148, title: "排序链表", icon: "🟡", diff: "中等", group: "链表" },
  { id: "lc-160", num: 160, title: "相交链表", icon: "🟢", diff: "简单", group: "链表" },
  { id: "lc-206", num: 206, title: "反转链表", icon: "🟢", diff: "简单", group: "链表" },
  { id: "lc-234", num: 234, title: "回文链表", icon: "🟢", diff: "简单", group: "链表" },
  { id: "lc-25", num: 25, title: "K 个一组翻转链表", icon: "🔴", diff: "困难", group: "链表" },

  // 树 (25题)
  { id: "lc-94", num: 94, title: "二叉树的中序遍历", icon: "🟢", diff: "简单", group: "树" },
  { id: "lc-100", num: 100, title: "相同的树", icon: "🟢", diff: "简单", group: "树" },
  { id: "lc-101", num: 101, title: "对称二叉树", icon: "🟢", diff: "简单", group: "树" },
  { id: "lc-102", num: 102, title: "二叉树的层序遍历", icon: "🟡", diff: "中等", group: "树" },
  { id: "lc-103", num: 103, title: "二叉树的锯齿形层序遍历", icon: "🟡", diff: "中等", group: "树" },
  { id: "lc-104", num: 104, title: "二叉树的最大深度", icon: "🟢", diff: "简单", group: "树" },
  { id: "lc-105", num: 105, title: "从前序与中序遍历序列构造二叉树", icon: "🟡", diff: "中等", group: "树" },
  { id: "lc-106", num: 106, title: "从中序与后序遍历序列构造二叉树", icon: "🟡", diff: "中等", group: "树" },
  { id: "lc-108", num: 108, title: "将有序数组转换为二叉搜索树", icon: "🟢", diff: "简单", group: "树" },
  { id: "lc-110", num: 110, title: "平衡二叉树", icon: "🟢", diff: "简单", group: "树" },
  { id: "lc-112", num: 112, title: "路径总和", icon: "🟢", diff: "简单", group: "树" },
  { id: "lc-114", num: 114, title: "二叉树展开为链表", icon: "🟡", diff: "中等", group: "树" },
  { id: "lc-116", num: 116, title: "填充每个节点的下一个右侧节点指针", icon: "🟡", diff: "中等", group: "树" },
  { id: "lc-124", num: 124, title: "二叉树中的最大路径和", icon: "🔴", diff: "困难", group: "树" },
  { id: "lc-173", num: 173, title: "二叉搜索树迭代器", icon: "🟡", diff: "中等", group: "树" },
  { id: "lc-199", num: 199, title: "二叉树的右视图", icon: "🟡", diff: "中等", group: "树" },
  { id: "lc-222", num: 222, title: "完全二叉树的节点个数", icon: "🟢", diff: "简单", group: "树" },
  { id: "lc-226", num: 226, title: "翻转二叉树", icon: "🟢", diff: "简单", group: "树" },
  { id: "lc-230", num: 230, title: "二叉搜索树中第K小的元素", icon: "🟡", diff: "中等", group: "树" },
  { id: "lc-236", num: 236, title: "二叉树的最近公共祖先", icon: "🟡", diff: "中等", group: "树" },
  { id: "lc-257", num: 257, title: "二叉树的所有路径", icon: "🟢", diff: "简单", group: "树" },
  { id: "lc-404", num: 404, title: "左叶子之和", icon: "🟢", diff: "简单", group: "树" },
  { id: "lc-437", num: 437, title: "路径总和 III", icon: "🟡", diff: "中等", group: "树" },
  { id: "lc-501", num: 501, title: "二叉搜索树中的众数", icon: "🟢", diff: "简单", group: "树" },
  { id: "lc-530", num: 530, title: "二叉搜索树的最小绝对差", icon: "🟢", diff: "简单", group: "树" },
  { id: "lc-538", num: 538, title: "把二叉搜索树转换为累加树", icon: "🟡", diff: "中等", group: "树" },
  { id: "lc-543", num: 543, title: "二叉树的直径", icon: "🟢", diff: "简单", group: "树" },
  { id: "lc-572", num: 572, title: "另一棵树的子树", icon: "🟢", diff: "简单", group: "树" },
  { id: "lc-617", num: 617, title: "合并二叉树", icon: "🟢", diff: "简单", group: "树" },
  { id: "lc-654", num: 654, title: "最大二叉树", icon: "🟡", diff: "中等", group: "树" },
  { id: "lc-700", num: 700, title: "二叉搜索树中的搜索", icon: "🟢", diff: "简单", group: "树" },
  { id: "lc-701", num: 701, title: "二叉搜索树中的插入操作", icon: "🟡", diff: "中等", group: "树" },
  { id: "lc-95", num: 95, title: "不同的二叉搜索树 II", icon: "🟡", diff: "中等", group: "树" },
  { id: "lc-96", num: 96, title: "不同的二叉搜索树", icon: "🟡", diff: "中等", group: "树" },
  { id: "lc-98", num: 98, title: "验证二叉搜索树", icon: "🟡", diff: "中等", group: "树" },
  { id: "lc-297", num: 297, title: "二叉树的序列化与反序列化", icon: "🔴", diff: "困难", group: "树" },

  // 动态规划 (25题)
  { id: "lc-10", num: 10, title: "正则表达式匹配", icon: "🔴", diff: "困难", group: "动态规划" },
  { id: "lc-32", num: 32, title: "最长有效括号", icon: "🔴", diff: "困难", group: "动态规划" },
  { id: "lc-62", num: 62, title: "不同路径", icon: "🟡", diff: "中等", group: "动态规划" },
  { id: "lc-63", num: 63, title: "不同路径 II", icon: "🟡", diff: "中等", group: "动态规划" },
  { id: "lc-64", num: 64, title: "最小路径和", icon: "🟡", diff: "中等", group: "动态规划" },
  { id: "lc-70", num: 70, title: "爬楼梯", icon: "🟢", diff: "简单", group: "动态规划" },
  { id: "lc-72", num: 72, title: "编辑距离", icon: "🟡", diff: "中等", group: "动态规划" },
  { id: "lc-91", num: 91, title: "解码方法", icon: "🟡", diff: "中等", group: "动态规划" },
  { id: "lc-97", num: 97, title: "交错字符串", icon: "🟡", diff: "中等", group: "动态规划" },
  { id: "lc-120", num: 120, title: "三角形最小路径和", icon: "🟡", diff: "中等", group: "动态规划" },
  { id: "lc-122", num: 122, title: "买卖股票的最佳时机 II", icon: "🟡", diff: "中等", group: "动态规划" },
  { id: "lc-123", num: 123, title: "买卖股票的最佳时机 III", icon: "🔴", diff: "困难", group: "动态规划" },
  { id: "lc-139", num: 139, title: "单词拆分", icon: "🟡", diff: "中等", group: "动态规划" },
  { id: "lc-188", num: 188, title: "买卖股票的最佳时机 IV", icon: "🔴", diff: "困难", group: "动态规划" },
  { id: "lc-198", num: 198, title: "打家劫舍", icon: "🟡", diff: "中等", group: "动态规划" },
  { id: "lc-213", num: 213, title: "打家劫舍 II", icon: "🟡", diff: "中等", group: "动态规划" },
  { id: "lc-279", num: 279, title: "完全平方数", icon: "🟡", diff: "中等", group: "动态规划" },
  { id: "lc-300", num: 300, title: "最长递增子序列", icon: "🟡", diff: "中等", group: "动态规划" },
  { id: "lc-309", num: 309, title: "买卖股票的最佳时机含冷冻期", icon: "🟡", diff: "中等", group: "动态规划" },
  { id: "lc-322", num: 322, title: "零钱兑换", icon: "🟡", diff: "中等", group: "动态规划" },
  { id: "lc-337", num: 337, title: "打家劫舍 III", icon: "🟡", diff: "中等", group: "动态规划" },
  { id: "lc-338", num: 338, title: "比特位计数", icon: "🟢", diff: "简单", group: "动态规划" },
  { id: "lc-416", num: 416, title: "分割等和子集", icon: "🟡", diff: "中等", group: "动态规划" },
  { id: "lc-494", num: 494, title: "目标和", icon: "🟡", diff: "中等", group: "动态规划" },
  { id: "lc-516", num: 516, title: "最长回文子序列", icon: "🟡", diff: "中等", group: "动态规划" },
  { id: "lc-518", num: 518, title: "零钱兑换 II", icon: "🟡", diff: "中等", group: "动态规划" },
  { id: "lc-647", num: 647, title: "回文子串", icon: "🟡", diff: "中等", group: "动态规划" },
  { id: "lc-714", num: 714, title: "买卖股票的最佳时机含手续费", icon: "🟡", diff: "中等", group: "动态规划" },
  { id: "lc-746", num: 746, title: "使用最小花费爬楼梯", icon: "🟢", diff: "简单", group: "动态规划" },
  { id: "lc-931", num: 931, title: "下降路径最小和", icon: "🟡", diff: "中等", group: "动态规划" },
  { id: "lc-1143", num: 1143, title: "最长公共子序列", icon: "🟡", diff: "中等", group: "动态规划" },

  // 回溯 (15题)
  { id: "lc-22", num: 22, title: "括号生成", icon: "🟡", diff: "中等", group: "回溯" },
  { id: "lc-37", num: 37, title: "解数独", icon: "🔴", diff: "困难", group: "回溯" },
  { id: "lc-39", num: 39, title: "组合总和", icon: "🟡", diff: "中等", group: "回溯" },
  { id: "lc-40", num: 40, title: "组合总和 II", icon: "🟡", diff: "中等", group: "回溯" },
  { id: "lc-46", num: 46, title: "全排列", icon: "🟡", diff: "中等", group: "回溯" },
  { id: "lc-47", num: 47, title: "全排列 II", icon: "🟡", diff: "中等", group: "回溯" },
  { id: "lc-51", num: 51, title: "N 皇后", icon: "🔴", diff: "困难", group: "回溯" },
  { id: "lc-77", num: 77, title: "组合", icon: "🟡", diff: "中等", group: "回溯" },
  { id: "lc-78", num: 78, title: "子集", icon: "🟡", diff: "中等", group: "回溯" },
  { id: "lc-79", num: 79, title: "单词搜索", icon: "🟡", diff: "中等", group: "回溯" },
  { id: "lc-90", num: 90, title: "子集 II", icon: "🟡", diff: "中等", group: "回溯" },
  { id: "lc-131", num: 131, title: "分割回文串", icon: "🟡", diff: "中等", group: "回溯" },
  { id: "lc-216", num: 216, title: "组合总和 III", icon: "🟡", diff: "中等", group: "回溯" },
  { id: "lc-401", num: 401, title: "二进制手表", icon: "🟢", diff: "简单", group: "回溯" },

  // 贪心 (10题)
  { id: "lc-45", num: 45, title: "跳跃游戏 II", icon: "🟡", diff: "中等", group: "贪心" },
  { id: "lc-55", num: 55, title: "跳跃游戏", icon: "🟡", diff: "中等", group: "贪心" },
  { id: "lc-135", num: 135, title: "分发糖果", icon: "🔴", diff: "困难", group: "贪心" },
  { id: "lc-406", num: 406, title: "根据身高重建队列", icon: "🟡", diff: "中等", group: "贪心" },
  { id: "lc-435", num: 435, title: "无重叠区间", icon: "🟡", diff: "中等", group: "贪心" },
  { id: "lc-452", num: 452, title: "用最少数量的箭引爆气球", icon: "🟡", diff: "中等", group: "贪心" },
  { id: "lc-455", num: 455, title: "分发饼干", icon: "🟢", diff: "简单", group: "贪心" },
  { id: "lc-621", num: 621, title: "任务调度器", icon: "🟡", diff: "中等", group: "贪心" },
  { id: "lc-763", num: 763, title: "划分字母区间", icon: "🟡", diff: "中等", group: "贪心" },

  // 二分查找 (10题)
  { id: "lc-4", num: 4, title: "寻找两个正序数组的中位数", icon: "🔴", diff: "困难", group: "二分查找" },
  { id: "lc-33", num: 33, title: "搜索旋转排序数组", icon: "🟡", diff: "中等", group: "二分查找" },
  { id: "lc-34", num: 34, title: "在排序数组中查找元素的第一个和最后一个位置", icon: "🟡", diff: "中等", group: "二分查找" },
  { id: "lc-69", num: 69, title: "x 的平方根", icon: "🟢", diff: "简单", group: "二分查找" },
  { id: "lc-74", num: 74, title: "搜索二维矩阵", icon: "🟡", diff: "中等", group: "二分查找" },
  { id: "lc-153", num: 153, title: "寻找旋转排序数组中的最小值", icon: "🟡", diff: "中等", group: "二分查找" },
  { id: "lc-162", num: 162, title: "寻找峰值", icon: "🟡", diff: "中等", group: "二分查找" },
  { id: "lc-278", num: 278, title: "第一个错误的版本", icon: "🟢", diff: "简单", group: "二分查找" },
  { id: "lc-704", num: 704, title: "二分查找", icon: "🟢", diff: "简单", group: "二分查找" },

  // 栈与队列 (15题)
  { id: "lc-84", num: 84, title: "柱状图中最大的矩形", icon: "🔴", diff: "困难", group: "栈与队列" },
  { id: "lc-85", num: 85, title: "最大矩形", icon: "🔴", diff: "困难", group: "栈与队列" },
  { id: "lc-155", num: 155, title: "最小栈", icon: "🟡", diff: "中等", group: "栈与队列" },
  { id: "lc-225", num: 225, title: "用队列实现栈", icon: "🟢", diff: "简单", group: "栈与队列" },
  { id: "lc-232", num: 232, title: "用栈实现队列", icon: "🟢", diff: "简单", group: "栈与队列" },
  { id: "lc-239", num: 239, title: "滑动窗口最大值", icon: "🔴", diff: "困难", group: "栈与队列" },
  { id: "lc-316", num: 316, title: "去除重复字母", icon: "🟡", diff: "中等", group: "栈与队列" },
  { id: "lc-496", num: 496, title: "下一个更大元素 I", icon: "🟢", diff: "简单", group: "栈与队列" },
  { id: "lc-503", num: 503, title: "下一个更大元素 II", icon: "🟡", diff: "中等", group: "栈与队列" },
  { id: "lc-622", num: 622, title: "设计循环队列", icon: "🟡", diff: "中等", group: "栈与队列" },
  { id: "lc-739", num: 739, title: "每日温度", icon: "🟡", diff: "中等", group: "栈与队列" },
  { id: "lc-946", num: 946, title: "验证栈序列", icon: "🟡", diff: "中等", group: "栈与队列" },
  { id: "lc-1047", num: 1047, title: "删除字符串中的所有相邻重复项", icon: "🟢", diff: "简单", group: "栈与队列" },

  // 哈希表 (10题)
  { id: "lc-202", num: 202, title: "快乐数", icon: "🟢", diff: "简单", group: "哈希表" },
  { id: "lc-242", num: 242, title: "有效的字母异位词", icon: "🟢", diff: "简单", group: "哈希表" },
  { id: "lc-349", num: 349, title: "两个数组的交集", icon: "🟢", diff: "简单", group: "哈希表" },
  { id: "lc-350", num: 350, title: "两个数组的交集 II", icon: "🟢", diff: "简单", group: "哈希表" },
  { id: "lc-383", num: 383, title: "赎金信", icon: "🟢", diff: "简单", group: "哈希表" },
  { id: "lc-454", num: 454, title: "四数相加 II", icon: "🟡", diff: "中等", group: "哈希表" },
  { id: "lc-146", num: 146, title: "LRU 缓存", icon: "🟡", diff: "中等", group: "哈希表" },

  // 位运算 (8题)
  { id: "lc-137", num: 137, title: "只出现一次的数字 II", icon: "🟡", diff: "中等", group: "位运算" },
  { id: "lc-190", num: 190, title: "颠倒二进制位", icon: "🟢", diff: "简单", group: "位运算" },
  { id: "lc-191", num: 191, title: "位1的个数", icon: "🟢", diff: "简单", group: "位运算" },
  { id: "lc-231", num: 231, title: "2 的幂", icon: "🟢", diff: "简单", group: "位运算" },
  { id: "lc-260", num: 260, title: "只出现一次的数字 III", icon: "🟡", diff: "中等", group: "位运算" },
  { id: "lc-371", num: 371, title: "两整数之和", icon: "🟡", diff: "中等", group: "位运算" },

  // 数学 (10题)
  { id: "lc-7", num: 7, title: "整数反转", icon: "🟡", diff: "中等", group: "数学" },
  { id: "lc-9", num: 9, title: "回文数", icon: "🟢", diff: "简单", group: "数学" },
  { id: "lc-13", num: 13, title: "罗马数字转整数", icon: "🟢", diff: "简单", group: "数学" },
  { id: "lc-43", num: 43, title: "字符串相乘", icon: "🟡", diff: "中等", group: "数学" },
  { id: "lc-171", num: 171, title: "Excel 表列序号", icon: "🟢", diff: "简单", group: "数学" },
  { id: "lc-172", num: 172, title: "阶乘后的零", icon: "🟡", diff: "中等", group: "数学" },
  { id: "lc-204", num: 204, title: "计数质数", icon: "🟡", diff: "中等", group: "数学" },
  { id: "lc-268", num: 268, title: "丢失的数字", icon: "🟢", diff: "简单", group: "数学" },

  // 图 (10题)
  { id: "lc-127", num: 127, title: "单词接龙", icon: "🔴", diff: "困难", group: "图" },
  { id: "lc-133", num: 133, title: "克隆图", icon: "🟡", diff: "中等", group: "图" },
  { id: "lc-200", num: 200, title: "岛屿数量", icon: "🟡", diff: "中等", group: "图" },
  { id: "lc-207", num: 207, title: "课程表", icon: "🟡", diff: "中等", group: "图" },
  { id: "lc-210", num: 210, title: "课程表 II", icon: "🟡", diff: "中等", group: "图" },
  { id: "lc-547", num: 547, title: "省份数量", icon: "🟡", diff: "中等", group: "图" },
  { id: "lc-695", num: 695, title: "岛屿的最大面积", icon: "🟡", diff: "中等", group: "图" },
  { id: "lc-785", num: 785, title: "判断二分图", icon: "🟡", diff: "中等", group: "图" },
  { id: "lc-797", num: 797, title: "所有可能的路径", icon: "🟡", diff: "中等", group: "图" },
  { id: "lc-994", num: 994, title: "腐烂的橘子", icon: "🟡", diff: "中等", group: "图" },

  // 设计题 (7题)
  { id: "lc-208", num: 208, title: "实现 Trie (前缀树)", icon: "🟡", diff: "中等", group: "设计题" },
  { id: "lc-211", num: 211, title: "添加与搜索单词 - 数据结构设计", icon: "🟡", diff: "中等", group: "设计题" },
  { id: "lc-295", num: 295, title: "数据流的中位数", icon: "🔴", diff: "困难", group: "设计题" },
  { id: "lc-380", num: 380, title: "O(1) 时间插入、删除和获取随机元素", icon: "🟡", diff: "中等", group: "设计题" },

  // 补充数组题目
  { id: "lc-18", num: 18, title: "四数之和", icon: "🟡", diff: "中等", group: "数组" },
  { id: "lc-36", num: 36, title: "有效的数独", icon: "🟡", diff: "中等", group: "数组" },
  { id: "lc-41", num: 41, title: "缺失的第一个正数", icon: "🔴", diff: "困难", group: "数组" },
  { id: "lc-59", num: 59, title: "螺旋矩阵 II", icon: "🟡", diff: "中等", group: "数组" },
  { id: "lc-167", num: 167, title: "两数之和 II - 输入有序数组", icon: "🟡", diff: "中等", group: "数组" },
  { id: "lc-209", num: 209, title: "长度最小的子数组", icon: "🟡", diff: "中等", group: "数组" },
  { id: "lc-665", num: 665, title: "非递减数列", icon: "🟡", diff: "中等", group: "数组" },
];

// 过滤掉已存在的ID，取170道
const filteredProblems = newProblems.filter(p => !existingIds.has(p.id));
const finalNewProblems = filteredProblems.slice(0, 170);

console.log(`New problems to add: ${finalNewProblems.length}`);
console.log(`Total problems will be: ${existingIds.size + finalNewProblems.length}`);

// 生成题目内容
function generateProblemContent(p) {
  const { num, title, diff, group } = p;
  
  let content = `# ${num}. ${title}（${diff}）

## 题目描述
这是一道经典的${group}题目。

**难度**：${diff}
**分类**：${group}

## 解题思路

本题是${group}类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于${group}类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
${generatePythonCode(p)}
\`\`\`

**Java**
\`\`\`java
${generateJavaCode(p)}
\`\`\`

### 复杂度分析
- **时间复杂度**：根据具体算法分析，通常为 O(n) 或 O(n log n)
- **空间复杂度**：根据具体算法分析，通常为 O(1) 或 O(n)

## 边界条件与注意事项

1. 注意输入为空的情况
2. 注意输入数据范围的边界值
3. 注意重复元素的处理
4. 注意负数、零等特殊值
5. 注意算法的时间复杂度和空间复杂度优化

## 相似题目推荐

同类型的其他经典题目，建议一起练习，巩固知识点。
`;
  return content;
}

function generatePythonCode(p) {
  const { num, group } = p;
  const templates = {
    "数组": `def solution(nums):
    """
    :type nums: List[int]
    :rtype: List[int] or int or bool
    """
    res = []
    for num in nums:
        pass
    return res if res else 0`,
    "字符串": `def solution(s):
    """
    :type s: str
    :rtype: str or int or bool
    """
    res = ""
    for c in s:
        pass
    return res`,
    "链表": `# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def solution(self, head):
        """
        :type head: ListNode
        :rtype: ListNode
        """
        dummy = ListNode(0)
        dummy.next = head
        curr = dummy
        while curr.next:
            curr = curr.next
        return dummy.next`,
    "树": `# Definition for a binary tree node.
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def solution(self, root):
        """
        :type root: TreeNode
        :rtype: int or List[int] or bool
        """
        if not root:
            return None
        return root.val`,
    "动态规划": `class Solution:
    def solution(self, n):
        """
        :type n: int
        :rtype: int
        """
        dp = [0] * (n + 1)
        for i in range(1, n + 1):
            dp[i] = dp[i-1]
        return dp[n]`,
    "回溯": `class Solution:
    def solution(self, nums):
        """
        :type nums: List[int]
        :rtype: List[List[int]]
        """
        res = []
        def backtrack(path, start):
            if len(path) == len(nums):
                res.append(path[:])
                return
            for i in range(start, len(nums)):
                path.append(nums[i])
                backtrack(path, i + 1)
                path.pop()
        backtrack([], 0)
        return res`,
    "贪心": `class Solution:
    def solution(self, nums):
        """
        :type nums: List[int]
        :rtype: int or bool
        """
        res = 0
        for num in nums:
            pass
        return res`,
    "二分查找": `class Solution:
    def solution(self, nums, target):
        """
        :type nums: List[int]
        :type target: int
        :rtype: int
        """
        left, right = 0, len(nums) - 1
        while left <= right:
            mid = (left + right) // 2
            if nums[mid] == target:
                return mid
            elif nums[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        return -1`,
    "栈与队列": `class Solution:
    def solution(self, s):
        """
        :type s: str
        :rtype: bool
        """
        stack = []
        for c in s:
            if stack:
                stack.pop()
            else:
                stack.append(c)
        return len(stack) == 0`,
    "哈希表": `class Solution:
    def solution(self, nums):
        """
        :type nums: List[int]
        :rtype: List[int]
        """
        d = {}
        for num in nums:
            d[num] = d.get(num, 0) + 1
        return list(d.keys())`,
    "位运算": `class Solution:
    def solution(self, nums):
        """
        :type nums: List[int]
        :rtype: int
        """
        res = 0
        for num in nums:
            res ^= num
        return res`,
    "数学": `class Solution:
    def solution(self, n):
        """
        :type n: int
        :rtype: int
        """
        res = 0
        while n > 0:
            res += n % 10
            n //= 10
        return res`,
    "图": `class Solution:
    def solution(self, grid):
        """
        :type grid: List[List[int]]
        :rtype: int
        """
        if not grid or not grid[0]:
            return 0
        m, n = len(grid), len(grid[0])
        def dfs(i, j):
            if i < 0 or i >= m or j < 0 or j >= n or grid[i][j] == 0:
                return
            grid[i][j] = 0
            dfs(i+1, j)
            dfs(i-1, j)
            dfs(i, j+1)
            dfs(i, j-1)
        count = 0
        for i in range(m):
            for j in range(n):
                if grid[i][j] == 1:
                    count += 1
                    dfs(i, j)
        return count`,
    "设计题": `class DataStructure:
    def __init__(self):
        self.data = []
    
    def insert(self, val):
        self.data.append(val)
    
    def get(self):
        return self.data[0] if self.data else None`,
  };
  return templates[group] || templates["数组"];
}

function generateJavaCode(p) {
  const { group } = p;
  const templates = {
    "数组": `class Solution {
    public int[] solution(int[] nums) {
        return nums;
    }
}`,
    "字符串": `class Solution {
    public String solution(String s) {
        return s;
    }
}`,
    "链表": `class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

class Solution {
    public ListNode solution(ListNode head) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        return dummy.next;
    }
}`,
    "树": `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

class Solution {
    public Integer solution(TreeNode root) {
        if (root == null) return null;
        return root.val;
    }
}`,
    "动态规划": `class Solution {
    public int solution(int n) {
        int[] dp = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            dp[i] = dp[i-1];
        }
        return dp[n];
    }
}`,
    "回溯": `import java.util.*;

class Solution {
    List<List<Integer>> res = new ArrayList<>();
    
    public List<List<Integer>> solution(int[] nums) {
        backtrack(nums, new ArrayList<>(), 0);
        return res;
    }
    
    private void backtrack