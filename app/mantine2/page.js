"use client";

import TutorialPage from "../components/TutorialPage";
import { mantine2Chapters, mantine2ChapterGroups } from "../courses-data/mantine2-tutorial-data";

// =============================================================
// Mantine 从入门到精通大全 —— 教程页面入口
// -------------------------------------------------------------
// 本教程定位为「大而全」的 Mantine v9 参考书：
//   - 共 48 章，覆盖从安装配置到主题定制的全套知识体系
//   - 每章 demo 驱动，代码均可在线编辑（基于 React 19 + JSX）
//   - 注释详尽，循序渐进，覆盖日常开发 100% 高频知识点
// 版本：Mantine v9 / React 19 / Next.js 16
// =============================================================
export default function Mantine2Tutorial() {
  return (
    <TutorialPage
      chapters={mantine2Chapters}
      chapterGroups={mantine2ChapterGroups}
      bookPath="/mantine2"
      bookTitle="Mantine 从入门到精通大全"
      defaultLang="jsx"
      tip="点击章节开始学习，所有代码均可在线运行"
      footerText="Mantine v9 · React 19 · 大全集教程 · 48 章覆盖：安装配置 / 文本排版 / 布局 / 按钮标识 / 表单输入 / useForm / 反馈覆盖层 / 导航数据展示 / 主题样式 / Hooks 实战"
    />
  );
}
