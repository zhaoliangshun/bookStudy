"use client";

import TutorialPage from "../components/TutorialPage";
import { weaknessChapters, weaknessChapterGroups } from "../courses-data/weakness-book-data";

// 《人性的弱点》—— 看清自己，超越自己
// 从认知、情绪、社交、行动、欲望、自我六个角度剖析人性弱点，
// 并给出超越之路。路由：/weakness
export default function WeaknessBook() {
  return (
    <TutorialPage
      chapters={weaknessChapters}
      chapterGroups={weaknessChapterGroups}
      bookPath="/weakness"
      bookTitle="人性的弱点"
      defaultLang="md"
      tip="点击章节开始阅读"
      footerText="人性的弱点 · 看清自己 · 超越自己"
    />
  );
}
