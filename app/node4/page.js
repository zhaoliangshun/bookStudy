"use client";

import TutorialPage from "../components/TutorialPage";
import { node4Chapters, node4ChapterGroups } from "../courses-data/node4-tutorial-data";

export default function Node4Tutorial() {
  return (
    <TutorialPage
      chapters={node4Chapters}
      chapterGroups={node4ChapterGroups}
      bookPath="/node4"
      bookTitle="Node.js 从入门到精通大全"
      defaultLang="js"
      tip="点击章节开始系统学习 Node.js"
      footerText="Node.js 从入门到精通大全 · 涵盖日常开发 100% 知识点 · 代码在服务端沙箱中执行 · 支持 fs/path/http/crypto/stream 等全部内置模块"
    />
  );
}
