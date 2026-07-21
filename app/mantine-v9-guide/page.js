// =============================================================
// Mantine v9 现代开发指南 - 页面入口（Server Component）
// -------------------------------------------------------------
// 在服务端读取 docs/mantine-v9-guide/ 目录下的 markdown 文件，
// 按配置顺序组装章节数据，传递给客户端阅读器组件渲染。
// =============================================================

import fs from "fs";
import path from "path";
import BookReader from "./BookReader";

// ============ 页面元数据 ============
export const metadata = {
  title: "Mantine v9 现代开发指南",
  description:
    "一本专注于 Mantine v9 设计哲学、Theme 系统与 Form 验证的完整在线书籍，包含大量可交互示例与最佳实践。",
};

// ============ 章节配置 ============
// slug 对应 docs/mantine-v9-guide/ 目录下的文件名（不含 .md 后缀）
const CHAPTERS = [
  {
    slug: "chapter1-philosophy",
    title: "第一章 · Mantine 的设计哲学",
    shortTitle: "设计哲学",
    description:
      "从项目定位、核心原则、可访问性承诺到 v9 升级动机，理解 Mantine 为什么这样设计",
  },
  {
    slug: "chapter2-ecosystem",
    title: "第二章 · Mantine v9 生态概览",
    shortTitle: "生态概览",
    description:
      "核心包、扩展包、peer dependencies 变化以及 React 19 带来的新机会",
  },
  {
    slug: "chapter3-theme",
    title: "第三章 · Theme 系统深度解析",
    shortTitle: "Theme 系统",
    description:
      "theme 对象、createTheme、CSS 变量、颜色系统、Styles API、组件级变量覆盖",
  },
  {
    slug: "chapter4-form",
    title: "第四章 · Form 表单验证实战",
    shortTitle: "Form 验证",
    description:
      "useForm 模式、同步/异步验证、schemaResolver、嵌套表单、列表字段与错误处理",
  },
  {
    slug: "chapter5-practice",
    title: "第五章 · 综合实战：企业级表单页面",
    shortTitle: "综合实战",
    description:
      "结合 Theme 与 Form 构建一个可主题切换、可验证、可访问的企业级用户注册页面",
  },
];

// ============ 读取章节内容 ============
function getChapters() {
  const bookDir = path.join(process.cwd(), "docs", "mantine-v9-guide");

  return CHAPTERS.map((chapter) => {
    const filePath = path.join(bookDir, `${chapter.slug}.md`);
    const content = fs.readFileSync(filePath, "utf-8");
    return {
      ...chapter,
      content,
    };
  });
}

// ============ 页面组件 ============
export default function MantineV9GuidePage() {
  const chapters = getChapters();
  return <BookReader chapters={chapters} />;
}
