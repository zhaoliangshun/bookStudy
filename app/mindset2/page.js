"use client";

import TutorialPage from "../components/TutorialPage";
import { mindset2Chapters, mindset2ChapterGroups } from "../courses-data/mindset2-book-data";

export default function Mindset2Book() {
  return (
    <TutorialPage
      chapters={mindset2Chapters}
      chapterGroups={mindset2ChapterGroups}
      bookPath="/mindset2"
      bookTitle="情绪控制全书"
      defaultLang="md"
      tip="点击章节开始阅读"
      footerText="情绪控制全书 · 32 章从认知到自在的完整修炼之路 · 看淡一切 · 心态稳定"
    />
  );
}