"use client";

import TutorialPage from "../components/TutorialPage";
import { weakness2Chapters, weakness2ChapterGroups } from "../courses-data/weakness2-book-data";

// 《人性的弱点·大全集》—— 简明总结版
// 90章，10大方面，约900个弱点条目
// 特点：文字简洁、点多面广、概括性强、不拖泥带水
// 路由：/weakness2
export default function Weakness2Book() {
  return (
    <TutorialPage
      chapters={weakness2Chapters}
      chapterGroups={weakness2ChapterGroups}
      bookPath="/weakness2"
      bookTitle="人性的弱点·大全集"
      defaultLang="md"
      tip="点击章节开始阅读 · 约900条弱点简明总结"
      footerText="人性的弱点·大全集 · 看清自己 · 简明总结"
    />
  );
}
