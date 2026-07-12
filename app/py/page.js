"use client";

import TutorialPage from "../components/TutorialPage";
import { pyChapters, pyChapterGroups } from "../courses-data/py-tutorial-data";

export default function PythonTutorial() {
  return (
    <TutorialPage
      chapters={pyChapters}
      chapterGroups={pyChapterGroups}
      bookPath="/py"
      bookTitle="Python 入门"
      defaultLang="py"
      tip="点击章节开始学习 Python"
      footerText="Python 交互式教程 · 代码由系统 python3 子进程执行 · 支持 def/class/装饰器/生成器/asyncio，含超时保护"
    />
  );
}
