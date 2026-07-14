"use client";

import TutorialPage from "../components/TutorialPage";
import { emotion2Chapters, emotion2ChapterGroups } from "../courses-data/emotion2-book-data";

// 《情绪的弱点》—— 简明总结版
// 100章，10大情绪方面，约1000个弱点条目
// 特点：文字简洁、点多面广、概括性强、不拖泥带水
// 专注情绪领域，系统剖析各类情绪弱点
// 路由：/emotion2
export default function Emotion2Book() {
  return (
    <TutorialPage
      chapters={emotion2Chapters}
      chapterGroups={emotion2ChapterGroups}
      bookPath="/emotion2"
      bookTitle="情绪的弱点"
      defaultLang="md"
      tip="点击章节开始阅读 · 约1000条情绪弱点简明总结"
      footerText="情绪的弱点 · 认识情绪 · 超越情绪"
    />
  );
}
