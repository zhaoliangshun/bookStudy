"use client";

import TutorialPage from "../components/TutorialPage";
import { emotion3Chapters, emotion3ChapterGroups } from "../courses-data/emotion3-book-data";

// 《情绪弱点大百科》—— 简明总结版
// 100章，10大情绪方面，约1000个弱点条目
// 特点：文字简洁、点多面广、概括性强、不拖泥带水
// 从日常到身心全方位覆盖情绪弱点
// 路由：/emotion3
export default function Emotion3Book() {
  return (
    <TutorialPage
      chapters={emotion3Chapters}
      chapterGroups={emotion3ChapterGroups}
      bookPath="/emotion3"
      bookTitle="情绪弱点大百科"
      defaultLang="md"
      tip="点击章节开始阅读 · 约1000条情绪弱点简明总结"
      footerText="情绪弱点大百科 · 认识情绪 · 疗愈自己"
    />
  );
}
