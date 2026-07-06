"use client";

// =============================================================
// pnpm 交互式教程页面
// -------------------------------------------------------------
// 结构与 Go / Java 教程页面一致，区别：
//   1. 数据源：pnpmChapters / pnpmChapterGroups（来自 pnpm-tutorial-data）
//   2. 运行接口：/api/run-shell（在 bash 沙箱里执行 shell 脚本）
//   4. 文案：pnpm 教程、playground.sh 文件名
//
// 特殊说明：沙箱环境没有真实安装 pnpm，章节的 code 字段是用
//   echo 模拟 pnpm 命令输出的 bash 脚本，能在沙箱里运行并展示
//   命令的典型输出格式，帮助理解 pnpm 行为。
// =============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { pnpmChapters, pnpmChapterGroups } from "../pnpm-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";
import CodeBlock from "../CodeBlock";

export default function PnpmTutorial() {
  // ---------- 状态管理 ----------
  const [activeId, setActiveId] = useState(pnpmChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const contentRef = useRef(null);

  // 当前章节对象
  const activeChapter =
    pnpmChapters.find((c) => c.id === activeId) || pnpmChapters[0];

  // ---------- 切换章节 ----------
  // CodeBlock 内部通过 useEffect 监听 initialCode 变化自动同步，
  // 这里只需切换 activeId，无需手动 setCode。
  const selectChapter = useCallback((chapterId) => {
    const chapter = pnpmChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  // 按分组组织章节
  const groupedChapters = pnpmChapterGroups.map((group) => ({
    group,
    items: pnpmChapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏：章节导航 ===== */}
        <Sidebar
          title="学习目录"
          tip="点击章节开始学习 pnpm"
          footer={<p>💡 提示：按 <kbd>Ctrl</kbd> + <kbd>Enter</kbd> 运行脚本</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/pnpm"
          meta={`共 ${pnpmChapters.length} 章 · 在线运行 Shell 示例`}
        />

        {/* ===== 主内容区 ===== */}
        <main className="content" ref={contentRef}>
          {/* 章节标题区 */}
          <div className="chapter-header">
            <div className="chapter-breadcrumb">
              <span>{activeChapter.group}</span>
              <span className="breadcrumb-sep">/</span>
              <span>{activeChapter.title}</span>
            </div>
            <h1 className="chapter-main-title">
              <span className="chapter-main-icon">{activeChapter.icon}</span>
              {activeChapter.title}
            </h1>
          </div>

          {/* Markdown 讲解区 */}
          <section className="lesson-section">
            <MarkdownRenderer content={activeChapter.content} />
            <CodeBlock code={activeChapter.code} lang="sh" />
          </section>

          {/* 章节底部导航：上一章/下一章 */}
          <ChapterNav activeId={activeId} onSelect={selectChapter} />

          <footer className="content-footer">
            <p>
              pnpm 9.x 交互式教程 · Shell 脚本在 bash 沙箱中运行 · 涵盖安装配置/依赖管理/Workspace monorepo/overrides 补丁/缓存 store/发布部署
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

// ===== 上一章 / 下一章 导航组件 =====
function ChapterNav({ activeId, onSelect }) {
  const idx = pnpmChapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? pnpmChapters[idx - 1] : null;
  const next = idx < pnpmChapters.length - 1 ? pnpmChapters[idx + 1] : null;

  return (
    <nav className="chapter-nav-bottom">
      {prev ? (
        <button className="nav-btn nav-prev" onClick={() => onSelect(prev.id)}>
          <span className="nav-dir">← 上一章</span>
          <span className="nav-title">{prev.icon} {prev.title}</span>
        </button>
      ) : (
        <span />
      )}
      {next ? (
        <button className="nav-btn nav-next" onClick={() => onSelect(next.id)}>
          <span className="nav-dir">下一章 →</span>
          <span className="nav-title">{next.icon} {next.title}</span>
        </button>
      ) : (
        <span />
      )}
    </nav>
  );
}
