"use client";

import TutorialPage from "../components/TutorialPage";
import { tsrxChapters, tsrxChapterGroups } from "../courses-data/tsrx-tutorial-data";

export default function TsReactExpertTutorial() {
  return (
    <TutorialPage
      chapters={tsrxChapters}
      chapterGroups={tsrxChapterGroups}
      bookPath="/tsrx"
      bookTitle="TypeScript + React 从入门到精通"
      defaultLang="tsx"
      tip="点击章节开始系统学习 TypeScript + React，从环境搭建到项目实战全覆盖"
      footerText="TypeScript + React 全能教程 · 涵盖 JSX/组件/Props/所有 Hooks/泛型/状态管理(Zustand/RTK)/React Router/表单(RHF+Zod)/React Query/性能优化/动画/测试/Vitest/完整项目实战 · 每个知识点都有详细注释的可运行 Demo · 循序渐进从入门到精通 · 覆盖日常开发 100% 知识点"
    />
  );
}
