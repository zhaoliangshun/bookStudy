"use client";

import TutorialPage from "../components/TutorialPage";
import { weaknessEmotionChapters, weaknessEmotionChapterGroups } from "../courses-data/weakness-emotion-book-data";

// 《人性的弱点·情绪篇》—— 总结版
// 30章，15大情绪方面，约300个弱点条目
// 特点：专注情绪领域、文字简洁、点多面广、概括性强、不拖泥带水
// 路由：/weakness-emotion
export default function WeaknessEmotionBook() {
  return (
    <TutorialPage
      chapters={weaknessEmotionChapters}
      chapterGroups={weaknessEmotionChapterGroups}
      bookPath="/weakness-emotion"
      bookTitle="人性的弱点·情绪篇"
      defaultLang="md"
      tip="点击章节开始阅读 · 约300条情绪弱点简明总结"
      footerText="人性的弱点·情绪篇 · 看清情绪 · 简明总结"
    />
  );
}
