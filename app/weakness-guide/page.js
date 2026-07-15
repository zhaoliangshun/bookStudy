"use client";

import TutorialPage from "../components/TutorialPage";
import { weaknessGuideChapters, weaknessGuideChapterGroups } from "../courses-data/weakness-guide-book-data";

// 人性弱点简明手册 —— 64个人性陷阱的简明指南
// 纯阅读型书籍，文字简练，每个弱点短小精悍。
// 路由：/weakness-guide
export default function WeaknessGuideBook() {
  return (
    <TutorialPage
      chapters={weaknessGuideChapters}
      chapterGroups={weaknessGuideChapterGroups}
      bookPath="/weakness-guide"
      bookTitle="人性弱点简明手册"
      defaultLang="md"
      tip="点击章节开始阅读"
      footerText="人性弱点简明手册 · 64个人性陷阱的简明指南 · 看清它，不被它牵着走"
    />
  );
}
