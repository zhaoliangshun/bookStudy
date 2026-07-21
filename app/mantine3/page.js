"use client";

import TutorialPage from "../components/TutorialPage";
import { mantine3Chapters, mantine3ChapterGroups } from "../courses-data/mantine3-tutorial-data";

// =============================================================
// Mantine 之道 · 理念与设计目的 —— 教程页面入口
// -------------------------------------------------------------
// 本教程是 Mantine v9（最新稳定版）的「内功心法」书，专注四大主题：
//   1. Mantine 的设计理念 —— 团队为什么做这个库、解决了哪些痛点
//   2. 核心架构与设计目的 —— CSS 变量、emotion、style props 的来龙去脉
//   3. Theme 主题系统 —— createTheme、颜色、暗色模式、CSS 变量层
//   4. Form 验证 —— useForm 完整方案、校验器、Zod 联动
//
// 风格：
//   - 详尽注释（每行代码都解释为什么）
//   - demo 驱动（每个知识点配套可运行示例）
//   - 覆盖日常开发 100% 知识点
// 版本：Mantine v9 / React 19 / Next.js 16
// =============================================================
export default function Mantine3Tutorial() {
  return (
    <TutorialPage
      chapters={mantine3Chapters}
      chapterGroups={mantine3ChapterGroups}
      bookPath="/mantine3"
      bookTitle="Mantine 之道 · 理念与设计目的"
      defaultLang="jsx"
      tip="点击章节开始学习，所有代码均可在线运行"
      footerText="Mantine v9 · React 19 · 理念与设计目的精解 · 覆盖：设计理念 / 架构原理 / Theme 主题系统 / Form 验证体系"
    />
  );
}
