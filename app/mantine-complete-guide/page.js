// ============ Server Component：读取 markdown 文件 ============
import fs from "fs";
import path from "path";
import BookReader from "./BookReader";

// ============ 章节配置 ============
const CHAPTERS = [
  {
    slug: "chapter1-philosophy",
    title: "第一章 · Mantine 的设计理念",
    shortTitle: "设计理念",
    description: "Mantine 的核心哲学、模块化设计、可访问性承诺与现代特性",
  },
  {
    slug: "chapter2-design-purpose",
    title: "第二章 · Mantine 的设计目的",
    shortTitle: "设计目的",
    description: "为什么选择 Mantine？解决什么问题？核心优势与应用场景",
  },
  {
    slug: "chapter3-theme-system",
    title: "第三章 · Mantine Theme 系统",
    shortTitle: "Theme 系统",
    description: "MantineProvider、主题对象、自定义颜色、CSS 变量、样式定制",
  },
  {
    slug: "chapter4-form-validation",
    title: "第四章 · Mantine Form 验证",
    shortTitle: "Form 验证",
    description: "useForm hook、验证策略、schema 验证、异步验证、嵌套表单",
  },
];

// ============ 读取章节内容 ============
function getChapters() {
  const bookDir = path.join(process.cwd(), "docs", "mantine-complete-guide");

  const chapters = CHAPTERS.map((chapter) => {
    const filePath = path.join(bookDir, `${chapter.slug}.md`);
    const content = fs.readFileSync(filePath, "utf-8");
    return {
      ...chapter,
      content,
    };
  });

  return chapters;
}

// ============ 页面组件 ============
export default function BookPage() {
  const chapters = getChapters();
  return <BookReader chapters={chapters} />;
}
