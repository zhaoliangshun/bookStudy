"use client";

import TutorialPage from "../components/TutorialPage";
import { chapters, chapterGroups } from "../courses-data/tutorial-data";

export default function NodejsTutorial() {
  return (
    <TutorialPage
      chapters={chapters}
      chapterGroups={chapterGroups}
      bookPath="/nodejs"
      bookTitle="Node.js 入门"
      defaultLang="js"
      tip="点击章节开始学习"
      footerText="Node.js 交互式教程 · 代码在服务端沙箱中执行 · 支持 fs/path/crypto 等内置模块"
    />
  );
}
