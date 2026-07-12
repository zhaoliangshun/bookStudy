"use client";

import TutorialPage from "../components/TutorialPage";
import { lifeManualChapters, lifeManualChapterGroups } from "../courses-data/life-manual-book-data";

export default function LifeManualBook() {
  return (
    <TutorialPage
      chapters={lifeManualChapters}
      chapterGroups={lifeManualChapterGroups}
      bookPath="/life-manual"
      bookTitle="人生清醒手册"
      defaultLang="md"
      tip="点击章节开始阅读"
      footerText="人生清醒手册 · 49 章从觉醒到自在的完整人生指南 · 清醒地活，自在地过"
    />
  );
}
