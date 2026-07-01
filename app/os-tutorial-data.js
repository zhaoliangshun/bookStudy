// 操作系统实战教程（服务器向）—— 数据聚合入口
// 40 章 / 10 分组 / demo 在本地 bash 沙箱实测可运行
// （systemctl/docker/iptables 等特权命令为说明性脚本或模拟输出）

import { chapters as batch1 } from "./os-chapters-batch1.js";
import { chapters as batch2 } from "./os-chapters-batch2.js";
import { chapters as batch3 } from "./os-chapters-batch3.js";
import { chapters as batch4 } from "./os-chapters-batch4.js";
import { chapters as batch5 } from "./os-chapters-batch5.js";
import { chapters as batch6 } from "./os-chapters-batch6.js";
import { chapters as batch7 } from "./os-chapters-batch7.js";
import { chapters as batch8 } from "./os-chapters-batch8.js";
import { chapters as batch9 } from "./os-chapters-batch9.js";
import { chapters as batch10 } from "./os-chapters-batch10.js";

export const osChapters = [
  ...batch1, ...batch2, ...batch3, ...batch4, ...batch5,
  ...batch6, ...batch7, ...batch8, ...batch9, ...batch10,
];

export const osChapterGroups = [
  "Linux 入门",
  "文件与目录",
  "文本处理",
  "进程与服务",
  "用户与权限",
  "网络",
  "资源监控",
  "Shell 脚本",
  "部署实战",
  "安全与运维",
];
