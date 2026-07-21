// ============ Server Component：读取 markdown 文件 ============
// 在服务端读取 docs/mantine-book/ 目录下的 markdown 文件，
// 将内容传给客户端阅读器组件渲染。

import fs from "fs";
import path from "path";
import BookReader from "./BookReader";

// ============ 章节配置 ============
// 定义书籍的章节顺序和元数据
// slug 对应 docs/mantine-book/ 目录下的文件名（不含 .md 后缀）
const CHAPTERS = [
  {
    slug: "chapter1-philosophy",
    title: "第一章 · Mantine 的设计理念",
    shortTitle: "设计理念",
    description: "Mantine 的核心哲学、模块化设计、可访问性承诺与 v9 新特性",
  },
  {
    slug: "chapter2-theme",
    title: "第二章 · Mantine Theme 系统",
    shortTitle: "Theme 系统",
    description: "MantineProvider、主题对象、自定义颜色、CSS 变量、Styles API",
  },
  {
    slug: "chapter3-form-validation",
    title: "第三章 · Mantine Form 验证",
    shortTitle: "Form 验证",
    description: "useForm hook、验证策略、schemaResolver + Zod、嵌套表单",
  },
];

// ============ 读取章节内容 ============
// 同步读取所有 markdown 文件内容
function getChapters() {
  // 获取书籍目录的绝对路径
  const bookDir = path.join(process.cwd(), "docs", "mantine-book");

  // 遍历章节配置，读取对应的 markdown 文件
  const chapters = CHAPTERS.map((chapter) => {
    const filePath = path.join(bookDir, `${chapter.slug}.md`);
    const content = fs.readFileSync(filePath, "utf-8");
    return {
      ...chapter,
      content, // markdown 原文，传给客户端渲染
    };
  });

  return chapters;
}

// ============ 页面组件 ============
export default function BookPage() {
  // 在服务端读取所有章节内容
  const chapters = getChapters();

  // 传给客户端阅读器组件
  return <BookReader chapters={chapters} />;
}
