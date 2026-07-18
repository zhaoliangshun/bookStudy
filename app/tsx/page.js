"use client";

import TutorialPage from "../components/TutorialPage";
import { tsxChapters, tsxChapterGroups } from "../courses-data/tsx-tutorial-data";

export default function TsReactTutorial() {
  return (
    <TutorialPage
      chapters={tsxChapters}
      chapterGroups={tsxChapterGroups}
      bookPath="/tsx"
      bookTitle="TypeScript + React"
      defaultLang="tsx"
      tip="点击章节开始学习 TypeScript + React"
      footerText="TypeScript + React 实战教程 · 代码示例可直接复制到 React 项目中使用 · 涵盖 Props / Children / 事件 / useState / useRef / useReducer / useContext / 自定义 Hook / forwardRef / 泛型组件 / API 请求 / 表单校验 / 路由参数 / 模块声明 / 工具类型"
    />
  );
}
