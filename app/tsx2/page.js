"use client";

import TutorialPage from "../components/TutorialPage";
import { tsx2Chapters, tsx2ChapterGroups } from "../courses-data/tsx2-tutorial-data";

// =============================================================
// TypeScript + React 从入门到精通大全（终极版）—— 教程页面入口
// -------------------------------------------------------------
// 定位：大而全的 TS+React 参考书，覆盖日常开发 100% 高频知识点
// 版本：TypeScript 5.x + React 18 + 实战可运行
// 内容：类型基础 / 组件基础 / Hooks 全解 / 状态管理 / 渲染优化 /
//      表单与校验 / 数据请求 / 路由 / 样式方案 / 测试 / 性能 / 工程化
// 代码沙箱：/api/run-ts（TS 转译 + Node 沙箱）
// =============================================================
export default function Tsx2Tutorial() {
  return (
    <TutorialPage
      chapters={tsx2Chapters}
      chapterGroups={tsx2ChapterGroups}
      bookPath="/tsx2"
      bookTitle="TypeScript + React 从入门到精通大全"
      defaultLang="tsx"
      tip="点击章节开始学习 TS+React，所有 demo 均可在线运行"
      footerText="TypeScript 5 + React 18 实战教程 · demo 驱动 · 类型基础 / 组件 / Hooks / 状态管理 / 性能 / 路由 / 表单 / 数据请求 / 样式 / 测试 / 工程化"
    />
  );
}