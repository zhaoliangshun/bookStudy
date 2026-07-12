"use client";

import TutorialPage from "../components/TutorialPage";
import { innerPeaceChapters, innerPeaceChapterGroups } from "../courses-data/inner-peace-book-data";

export default function InnerPeaceBook() {
  return (
    <TutorialPage
      chapters={innerPeaceChapters}
      chapterGroups={innerPeaceChapterGroups}
      bookPath="/inner-peace"
      bookTitle="内心平和：情绪控制的终极智慧"
      defaultLang="txt"
      tip="点击章节开始阅读"
      footerText="内心平和 · 24 章场景驱动 · 对任何事都能做到无所谓 · 心态稳定"
    />
  );
}