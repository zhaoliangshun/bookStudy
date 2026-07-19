"use client";

import TutorialPage from "../components/TutorialPage";
import { py10Chapters, py10ChapterGroups } from "../courses-data/py10-tutorial-data";

// =============================================================
// Python 从入门到精通大全（终极版）—— 教程页面入口
// -------------------------------------------------------------
// 定位：大而全的 Python 参考书，80+ 章覆盖日常开发 100% 高频知识点
// 版本：Python 3.12+（兼容 3.10+）
// 沙箱：/api/run-py（调用系统 python3 子进程执行，10 秒超时，1MB 输出）
// 内容：语法基础 / 数据结构 / 函数 / OOP / 异常 / 文件IO /
//      模块包 / 装饰器迭代器 / 并发异步 / 网络编程 / 数据库 /
//      测试 / 工程化 / 标准库精讲 / 综合实战
// =============================================================
export default function Py10Tutorial() {
  return (
    <TutorialPage
      chapters={py10Chapters}
      chapterGroups={py10ChapterGroups}
      bookPath="/py10"
      bookTitle="Python 从入门到精通大全（终极版）"
      defaultLang="py"
      tip="点击章节开始学习 Python，所有代码均可在线运行"
      footerText="Python 3.12 实战教程 · demo 驱动 · 语法基础 / 数据结构 / 函数 / OOP / 装饰器 / 迭代器 / 并发异步 / 网络编程 / 数据库 / 测试 / 工程化 / 综合实战"
    />
  );
}