// =============================================================
// Python 文件操作实战教程 —— 章节数据聚合入口
// -------------------------------------------------------------
// 从基础读写到路径操作,从文件管理到结构化数据,
// 系统讲解 Python 文件操作的核心 API 与最佳实践。
//
// 覆盖:基础读写(open/with/read/write)
//       → 路径与目录(os.path/pathlib/walk)
//       → 文件管理(shutil/tempfile/stat/权限)
//       → 结构化数据(csv/json/ini/toml/pickle/xml)
//       → 进阶实战(文件指针/压缩归档/编码/文件锁/实战案例)
//
// 教程定位:纯阅读型(代码示例在 content 的 markdown 代码块中展示)
// 重点讲清「为什么」和「怎么用」,大量 demo,逐行注释,实战为准。
// =============================================================

import { chapters as batch1 } from "./pyfile-chapters-batch1";
import { chapters as batch2 } from "./pyfile-chapters-batch2";
import { chapters as batch3 } from "./pyfile-chapters-batch3";
import { chapters as batch4 } from "./pyfile-chapters-batch4";
import { chapters as batch5 } from "./pyfile-chapters-batch5";

export const pyfileChapters = [
  ...batch1, ...batch2, ...batch3, ...batch4, ...batch5,
];

export const pyfileChapterGroups = [
  "基础读写",
  "路径与目录",
  "文件管理",
  "结构化数据读写",
  "进阶实战",
];
