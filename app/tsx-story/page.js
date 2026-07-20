"use client";

import TutorialPage from "../components/TutorialPage";
import { tsxStoryChapters, tsxStoryChapterGroups } from "../courses-data/tsx-story-tutorial-data";

export default function TsxStoryTutorial() {
  return (
    <TutorialPage
      chapters={tsxStoryChapters}
      chapterGroups={tsxStoryChapterGroups}
      bookPath="/tsx-story"
      bookTitle="TSX 童话镇"
      defaultLang="tsx"
      tip="✨ 欢迎来到 TSX 童话镇！每个 hooks 都是一位小镇居民，每种类型都是一份魔法契约"
      footerText="TSX 童话镇 · 用故事讲类型 · 把每个 hooks 比作小镇角色 · Props/Children/事件/useState/useRef/useReducer/useContext/forwardRef/自定义 Hook/工具类型/综合实战"
    />
  );
}
