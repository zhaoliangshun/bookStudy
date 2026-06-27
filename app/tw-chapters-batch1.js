// =============================================================
// Tailwind CSS 交互式教程 —— 第一批章节（共 4 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. tw-intro          — Tailwind CSS 简介
//   2. tw-core-concepts  — 核心概念
//   3. tw-colors         — 颜色系统
//   4. tw-spacing        — 间距与尺寸
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名
//   content : Markdown 格式的详细讲解（文字量是普通教程的 5 倍）
//   code    : 可预览的 HTML 片段（带 Tailwind class + 详细中文注释）
//
// 预览机制说明：
//   - 用户在编辑器里写的是 HTML 片段（不是可执行 JS）
//   - 前端用 <iframe> 加载 Tailwind Play CDN（https://cdn.tailwindcss.com）
//   - 把用户的 HTML 片段塞进 iframe 的 body 里实时渲染
//   - 因此 code 字段是 HTML 片段，不需要 <html><head> 外层结构
//   - 所有代码都带详细 HTML 注释 <!-- --> 说明每个 class 的作用
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：Tailwind CSS 简介
  // =========================================================
  {
    id: "tw-intro",
    title: "Tailwind CSS 简介",
    icon: "🎨",
    group: "基础",
    content: `## 什么是 Tailwind CSS？

**Tailwind CSS** 是一个**实用优先（utility-first）的 CSS 框架**。与 Bootstrap、Bulma 这类"组件优先"的传统框架不同，Tailwind 不提供现成的按钮、卡片、导航栏组件，而是提供一套**细粒度的原子化工具类（utility classes）**，让你通过在 HTML 上组合这些类来构建任意界面。一句话概括：**Tailwind 不替你做设计决策，而是给你一套强大的低级样式原语，让你用最快的速度拼出独一无二的界面**。

### 起源故事

Tailwind CSS 由加拿大开发者 **Adam Wathan**（也是 Laravel 生态知名贡献者、Refactoring UI 作者之一）于 **2017 年**创建。它的诞生源于 Adam 在重构一个项目时的真实痛点。

Adam 最初是一个"语义化 CSS"的坚定拥护者，坚持每个组件都写 \`class="card"\`、\`class="btn-primary"\`，并在 CSS 文件里定义这些类的样式。但随着项目变大，他发现：

1. **CSS 文件只增不减**：每加一个新组件就要写新 CSS，旧 CSS 永远不敢删（不知道哪里还在用）。
2. **命名是噩梦**：\`card\`、\`card-wrapper\`、\`card-inner\`、\`card-content\`……起名字浪费大量时间，团队命名风格也不统一。
3. **样式难以复用**：想在另一个页面用类似的卡片，但要改一点点内边距和颜色，只能复制粘贴 CSS 再改，导致重复代码爆炸。
4. **HTML 和 CSS 来回切换**：调一个间距要切到 CSS 文件改数值，再切回 HTML 看效果，心流不断被打断。

为了解决这些问题，他尝试了一种激进的方法：**不再写自定义 CSS，而是直接在 HTML 上用一堆描述具体样式的类**，比如 \`p-4 bg-white rounded-lg\`。结果他惊讶地发现，这种方式虽然一开始看起来"违反直觉"，但实际开发速度提升了数倍，而且 CSS 体积反而更小、维护性更好。于是他把这套工具类系统化、规范化，开源成了 Tailwind CSS。

### utility-first（原子化）vs 传统 CSS（语义化）

要理解 Tailwind，必须先理解两种 CSS 组织哲学的根本对立。

#### 传统语义化 CSS 的写法

你给元素起一个**有语义的名字**（描述"它是什么"），然后在 CSS 文件里定义"它长什么样"：

\`\`\`html
<button class="btn-primary">提交</button>
\`\`\`
\`\`\`css
.btn-primary {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: #ffffff;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: background-color 0.15s;
}
.btn-primary:hover { background-color: #2563eb; }
\`\`\`

#### Tailwind utility-first 的写法

你直接在 HTML 上用**描述具体样式**的类，不再写任何自定义 CSS：

\`\`\`html
<button class="inline-block px-4 py-2 bg-blue-500 text-white rounded-md font-medium transition-colors hover:bg-blue-600">提交</button>
\`\`\`

#### 两种方式的对比

| 维度 | 传统语义化 CSS | Tailwind utility-first |
| --- | --- | --- |
| **样式定义位置** | 集中在 .css 文件 | 直接写在 HTML 的 class 里 |
| **类名含义** | 描述"是什么"（btn-primary） | 描述"长什么样"（bg-blue-500） |
| **命名负担** | 重，每个组件都要起名 | 轻，无需起名 |
| **修改样式** | 切到 CSS 改规则，担心影响别处 | 直接改 HTML 上的类，互不影响 |
| **复用** | 复制 CSS 规则或抽象类 | 复制 HTML 片段（或抽组件） |
| **CSS 体积** | 持续增长，难以清理 | 按需生成，最终很小 |
| **学习曲线** | 低（写熟悉的 CSS） | 中（要记工具类名） |
| **设计一致性** | 取决于团队自律 | 内置刻度系统强制一致 |
| **可读性** | HTML 干净，CSS 集中 | HTML 较长，但一眼能看出样式 |

> 💡 **关键洞察**：Tailwind 并不是"反对 CSS"，而是"反对在 HTML 和 CSS 之间反复跳来跳去"。它把样式的描述权交还给 HTML，让"结构 + 样式"成为一个内聚的整体。

### 为什么选择 Tailwind？

#### 1. 开发速度极快

不用切换文件、不用起名、不用思考"这个变体该叫 \`.btn-primary-lg\` 还是 \`.btn-primary--large\`"。所有样式信息都在眼前，调间距、改颜色随手就来。Adam 自己的测算和大量用户反馈都表明，使用 Tailwind 后界面开发速度可提升 30%~50%。

#### 2. 最终 bundle 体积小

Tailwind 在构建时会**扫描你的源码**，只生成你实际用到的工具类的 CSS。一个典型项目的最终 CSS 通常只有 **10~20KB（gzip 后 5~8KB）**，远小于引入整套 Bootstrap（~150KB）。而且随着项目变大，CSS 体积增长非常缓慢（新组件往往复用已有工具类），不会出现传统项目那种"CSS 越来越肥"的问题。

#### 3. 设计一致性内置

传统 CSS 里，你今天写 \`padding: 12px\`，明天写 \`padding: 13px\`，后天写 \`padding: 0.75rem\`——全凭手感，界面会逐渐失去一致性。Tailwind 强制你从一套**预设刻度**里选值（\`p-3\` = 0.75rem，\`p-4\` = 1rem……），物理上杜绝了"差 1px"的随意性，整套界面天然协调。

#### 4. 响应式和状态内置

写响应式只需加前缀：\`md:text-lg\`（中等屏幕及以上字号变大），\`hover:bg-blue-600\`（悬停变深色），\`dark:bg-gray-900\`（暗色模式背景）。不需要写任何 \`@media\` 查询，不需要在 CSS 里管理状态选择器。

#### 5. 无需起名，心智负担低

\`class="flex items-center gap-4"\` 比 \`class="header-nav"\` 直观得多，而且你永远不用纠结"这个容器该叫 wrapper 还是 container 还是 inner"。

#### 6. 工具链友好

官方提供 VSCode 插件（自动补全、悬停查看生成的 CSS、lint）、Prettier 插件（自动排序 class）、官方 UI 组件库（Tailwind UI），生态完善。

### 何时不用 Tailwind？

Tailwind 不是银弹，以下场景要慎重考虑：

1. **学习曲线**：要记住几百个工具类名和缩写体系（\`p\`/\`px\`/\`py\`/\`pt\`/\`pr\`/\`pb\`/\`pl\`、\`text\`/\`bg\`/\`border\`、\`sm\`/\`md\`/\`lg\`……）。前 1~2 周会频繁查文档，需要坚持度过适应期。
2. **团队不熟悉**：如果团队成员都没用过，迁移成本和学习成本要评估。混合使用（部分 Tailwind 部分传统 CSS）容易混乱。
3. **极小项目**：一个单页静态站点，引入构建工具链可能"杀鸡用牛刀"，直接用 CDN 写几行 CSS 更快（不过 Tailwind 也有 CDN 版本可用）。
4. **强依赖第三方主题**：如果你的项目必须严格使用某个设计系统（如公司内部 Ant Design 风格），Tailwind 的预设刻度可能需要大量覆盖配置，得不偿失。
5. **不喜欢"长 class 字符串"**：有人觉得 HTML 里一长串 class 影响可读性，这是审美偏好，无法强求。

### Tailwind 的核心思想：组合原子类

Tailwind 的精髓在于**"组合优于继承/抽象"**。它相信：与其在 CSS 层面抽象出 \`.btn\` \`.card\` 这样的语义类（然后陷入"如何扩展变体"的泥潭），不如在 **HTML/组件层**面抽象——把常用的工具类组合封装成一个 React/Vue 组件或 HTML 片段，需要时直接复用。

举例：你想要一个"主按钮"，传统做法是写 \`.btn-primary\`；Tailwind 的做法是把这个 class 组合封进一个 \`<Button variant="primary">\` 组件。**抽象的层级从 CSS 移到了组件**，这正好契合现代前端组件化的趋势。

### 安装方式

Tailwind 提供多种集成方式，按推荐程度排序：

#### 1. 构建工具插件（推荐生产环境）

在 **Vite / Next.js / Nuxt / SvelteKit / Remix** 等现代框架里，通过官方 PostCSS 插件或专用插件集成。以 Next.js 为例：

\`\`\`bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
\`\`\`

配置 \`tailwind.config.js\` 的 \`content\` 字段指向你的源码文件（让 Tailwind 知道扫描哪里）：

\`\`\`js
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
\`\`\`

在全局 CSS 里引入三层：

\`\`\`css
@tailwind base;
@tailwind components;
@tailwind utilities;
\`\`\`

#### 2. Tailwind CLI

适合纯静态项目或不想配构建工具的场景：

\`\`\`bash
npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch
\`\`\`

#### 3. PostCSS 插件

在已有 PostCSS 流程的项目里，把 \`tailwindcss\` 加进 \`postcss.config.js\` 的插件列表即可。

#### 4. Play CDN（仅开发/原型，不要用于生产）

\`\`\`html
<script src="https://cdn.tailwindcss.com"></script>
\`\`\`

本教程的预览 iframe 用的就是 Play CDN——它会在浏览器里即时编译你用到的类。**注意：CDN 版本性能差、无法做最终体积优化，生产环境绝对不要用**。

### Tailwind v3 vs v4 简介

- **v3（2021 年底发布）**：成熟稳定，生态最广。配置基于 \`tailwind.config.js\`，通过 \`content\` 扫描源码、JIT（即时编译）按需生成 CSS。本教程的内容以 v3 为主。
- **v4（2025 年正式发布）**：重大重构。配置改为 **CSS 优先**（用 \`@theme\` 指令在 CSS 里定义设计令牌，告别 JS 配置文件）；引擎用 Rust 重写，构建速度提升数倍；默认包含更多功能（如 \`@starting-style\` 支持、3D 变换、容器查询一等公民）。v4 的工具类语法与 v3 高度兼容，老项目迁移成本较低。

> 本教程的预览 CDN 同时兼容 v3/v4 的绝大多数工具类，你可以放心练习。

### 第一个示例

让我们用 Tailwind 写一个最简单的"Hello"卡片，直观感受一下：

\`\`\`html
<div class="p-6 bg-blue-500 text-white rounded-lg shadow-lg">
  <h1 class="text-2xl font-bold">Hello Tailwind</h1>
  <p class="mt-2 text-blue-100">这是我用工具类拼出来的第一张卡片。</p>
</div>
\`\`\`

逐个解读这些类：\`p-6\` = 内边距 1.5rem；\`bg-blue-500\` = 蓝色背景；\`text-white\` = 白色文字；\`rounded-lg\` = 大圆角；\`shadow-lg\` = 大阴影；\`text-2xl\` = 字号 1.5rem；\`font-bold\` = 加粗；\`mt-2\` = 上外边距 0.5rem；\`text-blue-100\` = 浅蓝文字。

是不是一眼就能看出每个类的作用？这就是 utility-first 的魅力。

### 动手试试

下面的代码演示了一个**完整的产品卡片组件**——包含渐变头部、标题、描述文字、标签徽章和两个按钮。每个 class 都有详细注释。你可以修改任意 class（比如把 \`from-blue-500\` 改成 \`from-emerald-500\`、把 \`rounded-xl\` 改成 \`rounded-full\` 试试），然后点"运行"查看实时预览。`,
    code: `<!-- ============================================================ -->
<!-- 第一章演示：一个完整的"产品卡片"组件                              -->
<!-- 全部用 Tailwind 工具类实现，没有任何自定义 CSS                     -->
<!-- 修改任意 class 后点"运行"即可看到实时效果                          -->
<!-- ============================================================ -->

<!-- 最外层容器：max-w-sm 限制最大宽度为 24rem，
     mx-auto 让卡片在父容器里水平居中，
     mt-8 给顶部加 2rem 的外边距让卡片不至于贴着预览区顶部 -->
<div class="max-w-sm mx-auto mt-8">

  <!-- 卡片主体容器：
       bg-white 白色背景
       rounded-xl 超大圆角(0.75rem)，让卡片看起来更柔和现代
       shadow-lg 大阴影，营造悬浮立体感
       overflow-hidden 关键！让顶部渐变区的圆角不被裁切问题影响，
                       同时让头部图片能贴着卡片边缘铺满 -->
  <div class="bg-white rounded-xl shadow-lg overflow-hidden">

    <!-- 顶部渐变头部区：
         bg-gradient-to-r 从左到右的线性渐变
         from-blue-500    渐变起点颜色（蓝色 500）
         to-indigo-600    渐变终点颜色（靛蓝 600）
         p-6               内边距 1.5rem，让标题不贴边 -->
    <div class="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
      <!-- 标题：text-white 白字、text-xl 字号 1.25rem、font-bold 加粗 -->
      <h2 class="text-white text-xl font-bold">Tailwind CSS</h2>
      <!-- 副标题：text-blue-100 浅蓝色文字、text-sm 小字号 0.875rem、mt-1 上外边距 0.25rem -->
      <p class="text-blue-100 text-sm mt-1">实用优先的 CSS 框架</p>
    </div>

    <!-- 主体内容区：p-6 内边距 1.5rem -->
    <div class="p-6">
      <!-- 描述文字：
           text-gray-600 中灰色文字（不刺眼）
           text-sm 小字号
           leading-relaxed 行高 1.625，让多行文字更易读 -->
      <p class="text-gray-600 text-sm leading-relaxed">
        Tailwind 让你通过组合原子化的工具类来构建界面，无需在 HTML 和 CSS 之间反复切换，开发速度大幅提升。
      </p>

      <!-- 标签徽章行：mt-4 上外边距 1rem，flex 启用弹性布局，space-x-2 子元素之间水平间距 0.5rem -->
      <div class="mt-4 flex space-x-2">
        <!-- 徽章 1：bg-blue-100 浅蓝底、text-blue-700 深蓝字、text-xs 超小字号、
                    px-2 水平内边距 0.5rem、py-1 垂直内边距 0.25rem、rounded-md 中圆角、font-medium 中等字重 -->
        <span class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-md font-medium">v3.4</span>
        <!-- 徽章 2：换成绿色系，其余结构相同 -->
        <span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md font-medium">JIT</span>
        <!-- 徽章 3：换成紫色系 -->
        <span class="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-md font-medium">响应式</span>
      </div>

      <!-- 按钮组：mt-6 上外边距 1.5rem，flex 弹性布局，space-x-3 子元素水平间距 0.75rem -->
      <div class="mt-6 flex space-x-3">
        <!-- 主按钮：
             bg-blue-500 蓝色背景
             hover:bg-blue-600 鼠标悬停时变成更深的蓝色（状态前缀 hover:）
             text-white 白色文字
             text-sm 小字号
             font-medium 中等字重
             px-4 水平内边距 1rem
             py-2 垂直内边距 0.5rem
             rounded-lg 大圆角
             transition-colors 颜色变化加过渡动画（200ms），
                              让 hover 不会突兀闪烁 -->
        <button class="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          了解更多
        </button>
        <!-- 次按钮：换成浅灰底 + 深灰字，hover 变深一档 -->
        <button class="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          查看文档
        </button>
      </div>
    </div>
  </div>
</div>`,
  },

  // =========================================================
  // 第二章：核心概念
  // =========================================================
  {
    id: "tw-core-concepts",
    title: "核心概念",
    icon: "🧱",
    group: "基础",
    content: `## 工具类（utility classes）是什么

**工具类**是 Tailwind 的基本组成单元。每一个工具类都只做**一件极小的事**——设置一个 CSS 属性的一个值。比如：

- \`p-4\` 只负责把 \`padding\` 设为 \`1rem\`
- \`text-red-500\` 只负责把 \`color\` 设为 \`#ef4444\`
- \`flex\` 只负责把 \`display\` 设为 \`flex\`
- \`rounded-lg\` 只负责把 \`border-radius\` 设为 \`0.5rem\`

这些类彼此**正交、可组合**。你想要一个"红色背景、白色文字、大圆角、内边距 1rem"的盒子，就把对应的四个类拼起来：\`class="bg-red-500 text-white rounded-lg p-4"\`。这种"小而专一、自由组合"的设计，就是 utility-first 的本质。

> 类比：传统 CSS 像**预制家具**（买来就是一个整体衣柜，改不了结构）；Tailwind 像**乐高积木**（每块只负责一种形状/颜色，你拼出任何东西）。

### 命名约定：属性-值 缩写体系

Tailwind 的类名遵循一套**高度规则化的缩写体系**，记住规则后就能"猜"出大部分类名，不用死记硬背。基本格式是 \`属性缩写-值\`：

| CSS 属性 | Tailwind 前缀 | 示例 | 等价 CSS |
| --- | --- | --- | --- |
| padding | \`p\` | \`p-4\` | \`padding: 1rem\` |
| padding-x（左右） | \`px\` | \`px-4\` | \`padding-left:1rem; padding-right:1rem\` |
| padding-y（上下） | \`py\` | \`py-2\` | \`padding-top:0.5rem; padding-bottom:0.5rem\` |
| padding-top/right/bottom/left | \`pt/pr/pb/pl\` | \`pt-3\` | \`padding-top: 0.75rem\` |
| margin | \`m\` | \`m-8\` | \`margin: 2rem\` |
| margin 方向 | \`mx/my/mt/mr/mb/ml\` | \`mx-auto\` | \`margin-left:auto; margin-right:auto\` |
| 字号 font-size | \`text\` | \`text-xl\` | \`font-size: 1.25rem\` |
| 文字颜色 color | \`text\` | \`text-blue-500\` | \`color: #3b82f6\` |
| 背景色 background-color | \`bg\` | \`bg-gray-100\` | \`background-color: #f3f4f6\` |
| 边框宽度 border-width | \`border\` | \`border-2\` | \`border-width: 2px\` |
| 边框颜色 border-color | \`border\` | \`border-gray-300\` | \`border-color: #d1d5db\` |
| 圆角 border-radius | \`rounded\` | \`rounded-lg\` | \`border-radius: 0.5rem\` |
| 宽度 width | \`w\` | \`w-1/2\` | \`width: 50%\` |
| 高度 height | \`h\` | \`h-screen\` | \`height: 100vh\` |
| 字重 font-weight | \`font\` | \`font-bold\` | \`font-weight: 700\` |
| 阴影 box-shadow | \`shadow\` | \`shadow-md\` | 一组 box-shadow 值 |
| 显示 display | 直接写值 | \`flex\`/\`block\`/\`hidden\` | \`display: flex/block/none\` |

注意 \`text\` 既管字号又管颜色——Tailwind 通过**值的形态**来区分：\`text-xl\`/\`text-sm\` 是字号刻度（关键字），\`text-red-500\` 是颜色（颜色名-数字），\`text-center\` 是对齐（关键字）。看到 \`text-\` 后面是"颜色-数字"就是颜色，是"尺寸关键字"就是字号，是对齐关键字就是对齐。

### 值的刻度系统（spacing scale）

Tailwind 最有特色的设计是它的**刻度系统**：间距、内边距、外边距、宽高、行高等许多属性，都共享一套**统一的数字刻度**。每个数字对应一个固定的 rem 值：

| 刻度 | rem | px（默认 16px 根字号） | 常见用途 |
| --- | --- | --- | --- |
| 0 | 0 | 0 | 无间距 |
| 0.5 | 0.125rem | 2px | 极小间距、细边框分隔 |
| 1 | 0.25rem | 4px | 小图标和文字间距 |
| 1.5 | 0.375rem | 6px | 紧凑内边距 |
| 2 | 0.5rem | 8px | 小内边距、徽章 |
| 2.5 | 0.625rem | 10px | — |
| 3 | 0.75rem | 12px | 中等内边距 |
| 4 | 1rem | 16px | 标准内边距（最常用） |
| 5 | 1.25rem | 20px | — |
| 6 | 1.5rem | 24px | 卡片内边距 |
| 8 | 2rem | 32px | 区块间距 |
| 10 | 2.5rem | 40px | — |
| 12 | 3rem | 48px | 大区块间距 |
| 16 | 4rem | 64px | 分区间距 |
| 20 | 5rem | 80px | — |
| 24 | 6rem | 96px | 巨大间距 |
| 32 | 8rem | 128px | — |
| 40 | 10rem | 160px | — |
| 48 | 12rem | 192px | — |
| 56 | 14rem | 224px | — |
| 64 | 16rem | 256px | — |
| 80 | 20rem | 320px | — |
| 96 | 24rem | 384px | 最大间距 |

**核心单位换算：1 个刻度单位 = 0.25rem = 4px**（在默认 16px 根字号下）。所以 \`p-4\` = 4 × 0.25rem = 1rem = 16px。记住"1 = 4px"这个公式，看到任何 \`p-8\`/\`m-12\`/\`gap-6\` 都能瞬间换算。

#### 为什么用刻度而不是任意值？

1. **一致性**：全站间距只能从这套刻度里选，物理上杜绝了"差 1px"的随意性，界面天然协调。
2. **决策疲劳降低**：不用纠结 12px 还是 13px，刻度里只有 12px(\`p-3\`) 和 16px(\`p-4\`)，二选一。
3. **可预测**：设计师和开发者共用同一套刻度语言（设计稿里间距也是 4 的倍数），沟通零成本。
4. **可扩展**：需要时可在 \`tailwind.config.js\` 的 \`theme.extend.spacing\` 里加自定义刻度，或用任意值 \`p-[13px]\` 应急。

### 颜色系统

Tailwind 内置 **22 种颜色**，每种颜色有 **11 个档位（50/100/200/.../900/950）**。颜色名+数字即类名：

- 50：极浅，几乎白色——常用于浅色背景、徽章底色
- 100~200：浅色——hover 态背景、边框
- 300~400：中等浅色——禁用态、占位文字
- 500：标准色——主色、按钮背景（最常用）
- 600~700：深色——hover 态、激活态
- 800~900：更深——深色背景、标题文字
- 950：极深，几乎黑色——最深的强调色

比如蓝色系：\`bg-blue-50\`（极浅蓝，徽章底）→ \`bg-blue-500\`（标准蓝，主按钮）→ \`bg-blue-900\`（深蓝，深色背景）。颜色名同样适用于 \`text-\`、\`border-\`、\`ring-\`、\`from-\`/\`via-\`/\`to-\`（渐变）等。下一章会专门深入讲颜色。

### 字号系统

字号用 \`text-\` + 关键字表示，同样是预设刻度：

| 类名 | rem | px | 用途 |
| --- | --- | --- | --- |
| \`text-xs\` | 0.75rem | 12px | 徽章、辅助说明、版权 |
| \`text-sm\` | 0.875rem | 14px | 次要正文、表单提示 |
| \`text-base\` | 1rem | 16px | 默认正文（浏览器默认） |
| \`text-lg\` | 1.125rem | 18px | 卡片标题、强调正文 |
| \`text-xl\` | 1.25rem | 20px | 区块小标题 |
| \`text-2xl\` | 1.5rem | 24px | 页面二级标题 |
| \`text-3xl\` | 1.875rem | 30px | 页面主标题 |
| \`text-4xl\` | 2.25rem | 36px | 大标题 |
| \`text-5xl\` | 3rem | 48px | 首屏巨型标题 |
| \`text-6xl\` ~ \`text-9xl\` | 3.75rem ~ 8rem | 60~128px | 营销页超大数字 |

字号刻度经过视觉调校，相邻档位差距适宜，组合在一起天然协调。配套的还有字重 \`font-thin\`(100) / \`font-light\`(300) / \`font-normal\`(400) / \`font-medium\`(500) / \`font-semibold\`(600) / \`font-bold\`(700) / \`font-extrabold\`(800) / \`font-black\`(900)。

### 间距单位总结

记住这条**黄金公式**：

> **1 个 Tailwind 间距单位 = 0.25rem = 4px**（默认根字号 16px 时）

凡是和"尺寸"相关的工具类——\`p-\` \`m-\` \`w-\` \`h-\` \`gap-\` \`space-x/y-\` \`top-\` \`left-\` \`translate-\` \`text-\`(部分) \`leading-\`(行高)——大多共享这套数字刻度。掌握了它，你就能举一反三。

### 响应式前缀（responsive prefixes）

Tailwind 采用**移动优先**的响应式策略，通过**断点前缀**来针对不同屏幕宽度叠加样式。断点前缀表示"在该宽度及以上生效"：

| 前缀 | 断点 | 含义 |
| --- | --- | --- |
| （无前缀） | — | 默认，所有屏幕（移动端基准） |
| \`sm:\` | ≥640px | 小屏（大手机横屏 / 小平板） |
| \`md:\` | ≥768px | 中屏（平板竖屏） |
| \`lg:\` | ≥1024px | 大屏（平板横屏 / 小笔记本） |
| \`xl:\` | ≥1280px | 超大屏（桌面） |
| \`2xl:\` | ≥1536px | 超超大屏（大桌面） |

用法：\`class="text-sm md:text-base lg:text-lg"\` 表示——手机上小字号，平板及以上基准字号，大屏及以上再放大。**写法是从小到大叠加**，后面的覆盖前面的，符合移动优先。

> ⚠️ **常见误区**：\`sm:\` 不是"只在手机生效"，而是"≥640px 生效"。要让某个样式"只在手机生效"，写法是默认写手机样式，然后用 \`sm:\` 覆盖掉——Tailwind 没有"小于某断点"的前缀。

### 状态前缀（variant prefixes）

除了屏幕宽度，Tailwind 还能针对元素的**交互状态**叠加样式，用状态前缀：

| 前缀 | 触发条件 | 示例 |
| --- | --- | --- |
| \`hover:\` | 鼠标悬停 | \`hover:bg-blue-600\` |
| \`focus:\` | 获得焦点（键盘 Tab 或点击） | \`focus:outline-none focus:ring-2\` |
| \`active:\` | 鼠标按下时 | \`active:scale-95\` |
| \`focus-within:\` | 元素或其子元素获得焦点 | \`focus-within:border-blue-500\` |
| \`focus-visible:\` | 键盘聚焦（区分鼠标点击） | \`focus-visible:ring-2\` |
| \`group-hover:\` | 父级 \`.group\` 被悬停时 | 父 \`group\` + 子 \`group-hover:text-blue-500\` |
| \`group-focus:\` | 父级 \`.group\` 获焦时 | 同上 |
| \`peer-focus:\` | 前一个兄弟 \`.peer\` 获焦时 | 用于表单联动 |
| \`disabled:\` | 元素被禁用 | \`disabled:opacity-50\` |
| \`checked:\` | 复选框被选中 | \`checked:bg-blue-500\` |
| \`first:\`/\`last:\` | 第一个/最后一个子元素 | \`first:ml-0\` |
| \`odd:\`/\`even:\` | 奇偶行（表格条纹） | \`odd:bg-gray-50\` |

**group 用法**：父元素加 \`class="group"\`，子元素用 \`group-hover:\` 就能在悬停父元素时改变子元素样式——这是做卡片悬停效果的核心技巧。

### dark: 暗色模式前缀

\`dark:\` 前缀用于暗色模式适配。Tailwind 默认跟随系统偏好（\`prefers-color-scheme: dark\`），也可配置成跟随 \`class="dark"\`：

\`\`\`html
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  这段在亮色模式白底黑字，暗色模式深底浅字。
</div>
\`\`\`

写法是"先写亮色样式，再用 \`dark:\` 覆盖暗色样式"，和响应式前缀的思路一致。

### !important 修饰符（! 前缀）

当你需要强制覆盖某个样式（比如覆盖第三方库的样式），在类名前加 \`!\`：

\`\`\`html
<!-- !p-4 会生成 padding: 1rem !important -->
<div class="!p-4">
\`\`\`

> ⚠️ **慎用**：\`!\` 会生成 \`!important\`，破坏了样式的可维护性。只在确实无法用选择器优先级解决时才用。

### 动手试试

下面的演示把本章的核心概念**可视化**出来：间距刻度对照、颜色档位展示、字号阶梯、以及响应式前缀的效果（试着缩窄浏览器窗口看 \`sm:\`/\`md:\` 的变化）。每个区块都有注释说明，修改任意数值后点"运行"查看效果。`,
    code: `<!-- ============================================================ -->
<!-- 第二章演示：核心概念可视化                                       -->
<!-- 包含：间距刻度对照 / 颜色档位 / 字号阶梯 / 响应式前缀             -->
<!-- ============================================================ -->

<!-- 最外层容器：max-w-3xl 最大宽度 48rem，mx-auto 居中，p-6 内边距，
     space-y-8 让所有直接子元素之间垂直间距 2rem -->
<div class="max-w-3xl mx-auto p-6 space-y-8">

  <!-- ============ 区块 1：间距刻度对照 ============ -->
  <section>
    <!-- 区块标题：text-2xl 字号 1.5rem，font-bold 加粗，text-gray-800 深灰，mb-4 下外边距 1rem -->
    <h2 class="text-2xl font-bold text-gray-800 mb-4">① 间距刻度对照（p-0 ~ p-12）</h2>
    <!-- 说明文字 -->
    <p class="text-sm text-gray-500 mb-4">规则：1 单位 = 0.25rem = 4px。p-4 即内边距 1rem = 16px。</p>

    <!-- 刻度展示容器：space-y-2 子元素垂直间距 0.5rem -->
    <div class="space-y-2">
      <!-- 每一行：外层 div 有 bg-gray-100 浅灰底（显示 padding 占据的空间），
           里面放一个 bg-blue-500 蓝色小块；
           通过改变外层的 p-* 来直观看到间距从小到大 -->
      <div class="bg-gray-100 p-0"><div class="bg-blue-500 text-white text-xs inline-block p-1">p-0 (0)</div></div>
      <div class="bg-gray-100 p-1"><div class="bg-blue-500 text-white text-xs inline-block p-1">p-1 (4px)</div></div>
      <div class="bg-gray-100 p-2"><div class="bg-blue-500 text-white text-xs inline-block p-1">p-2 (8px)</div></div>
      <div class="bg-gray-100 p-3"><div class="bg-blue-500 text-white text-xs inline-block p-1">p-3 (12px)</div></div>
      <div class="bg-gray-100 p-4"><div class="bg-blue-500 text-white text-xs inline-block p-1">p-4 (16px)</div></div>
      <div class="bg-gray-100 p-6"><div class="bg-blue-500 text-white text-xs inline-block p-1">p-6 (24px)</div></div>
      <div class="bg-gray-100 p-8"><div class="bg-blue-500 text-white text-xs inline-block p-1">p-8 (32px)</div></div>
      <div class="bg-gray-100 p-12"><div class="bg-blue-500 text-white text-xs inline-block p-1">p-12 (48px)</div></div>
    </div>
  </section>

  <!-- ============ 区块 2：颜色档位 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-4">② 颜色档位（blue 50~950）</h2>
    <p class="text-sm text-gray-500 mb-4">同一种颜色（蓝）的 11 个档位，从极浅到极深。500 是标准色。</p>

    <!-- 颜色色块网格：grid 网格布局，grid-cols-6 共 6 列，
         gap-2 格子间距 0.5rem -->
    <div class="grid grid-cols-6 gap-2">
      <!-- 每个色块：h-12 高度 3rem，rounded 圆角，flex+items-center+justify-center 让数字居中，
           text-xs 超小字号，text-white 白字（深色块用白字看得清） -->
      <div class="bg-blue-50 h-12 rounded flex items-center justify-center text-xs text-blue-900">50</div>
      <div class="bg-blue-100 h-12 rounded flex items-center justify-center text-xs text-blue-900">100</div>
      <div class="bg-blue-200 h-12 rounded flex items-center justify-center text-xs text-blue-900">200</div>
      <div class="bg-blue-300 h-12 rounded flex items-center justify-center text-xs text-blue-900">300</div>
      <div class="bg-blue-400 h-12 rounded flex items-center justify-center text-xs text-white">400</div>
      <div class="bg-blue-500 h-12 rounded flex items-center justify-center text-xs text-white font-bold">500</div>
      <div class="bg-blue-600 h-12 rounded flex items-center justify-center text-xs text-white">600</div>
      <div class="bg-blue-700 h-12 rounded flex items-center justify-center text-xs text-white">700</div>
      <div class="bg-blue-800 h-12 rounded flex items-center justify-center text-xs text-white">800</div>
      <div class="bg-blue-900 h-12 rounded flex items-center justify-center text-xs text-white">900</div>
      <div class="bg-blue-950 h-12 rounded flex items-center justify-center text-xs text-white">950</div>
    </div>
  </section>

  <!-- ============ 区块 3：字号阶梯 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-4">③ 字号阶梯（text-xs ~ text-5xl）</h2>
    <p class="text-sm text-gray-500 mb-4">字号同样是预设刻度，相邻档位视觉差距适宜。</p>

    <!-- 每一行展示一个字号，用 text-gray-700 统一文字颜色，space-y-1 行间距 0.25rem -->
    <div class="space-y-1 text-gray-700">
      <p class="text-xs">text-xs — 12px 辅助说明</p>
      <p class="text-sm">text-sm — 14px 次要正文</p>
      <p class="text-base">text-base — 16px 默认正文</p>
      <p class="text-lg">text-lg — 18px 强调正文</p>
      <p class="text-xl">text-xl — 20px 小标题</p>
      <p class="text-2xl">text-2xl — 24px 二级标题</p>
      <p class="text-3xl">text-3xl — 30px 主标题</p>
      <p class="text-4xl">text-4xl — 36px 大标题</p>
      <p class="text-5xl">text-5xl — 48px 巨型标题</p>
    </div>
  </section>

  <!-- ============ 区块 4：响应式前缀 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-4">④ 响应式前缀（缩窄窗口看变化）</h2>
    <p class="text-sm text-gray-500 mb-4">下面的盒子在手机上 1 列、平板 2 列、桌面 4 列。背景色也会随断点变化。</p>

    <!-- 响应式网格：
         grid-cols-1   手机：1 列
         sm:grid-cols-2 ≥640px：2 列
         lg:grid-cols-4 ≥1024px：4 列
         gap-4 格子间距 1rem -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 每个格子：高度固定 h-20（5rem），flex 居中，
           背景色用响应式前缀切换：手机蓝、平板绿、桌面紫 -->
      <div class="h-20 rounded-lg flex items-center justify-center text-white font-medium bg-blue-500 sm:bg-green-500 lg:bg-purple-500">盒子 1</div>
      <div class="h-20 rounded-lg flex items-center justify-center text-white font-medium bg-blue-500 sm:bg-green-500 lg:bg-purple-500">盒子 2</div>
      <div class="h-20 rounded-lg flex items-center justify-center text-white font-medium bg-blue-500 sm:bg-green-500 lg:bg-purple-500">盒子 3</div>
      <div class="h-20 rounded-lg flex items-center justify-center text-white font-medium bg-blue-500 sm:bg-green-500 lg:bg-purple-500">盒子 4</div>
    </div>

    <!-- 响应式字号示例：手机小字、大屏放大 -->
    <p class="mt-4 text-center text-sm md:text-lg lg:text-2xl font-bold text-gray-700">
      这行字手机是 sm，平板是 lg，桌面是 2xl
    </p>
  </section>
</div>`,
  },

  // =========================================================
  // 第三章：颜色系统
  // =========================================================
  {
    id: "tw-colors",
    title: "颜色系统",
    icon: "🌈",
    group: "基础",
    content: `## 默认调色板概览

Tailwind 内置了一套**精心调校的调色板**，共 **22 种颜色**，每种颜色提供 **11 个档位**（50 / 100 / 200 / 300 / 400 / 500 / 600 / 700 / 800 / 900 / 950）。这套调色板的设计参考了 Google Material Design 和 Refactoring UI 的色彩理论，每一种颜色的相邻档位之间过渡平滑，单独使用也协调。

22 种颜色分别是：

| 类别 | 颜色名 |
| --- | --- |
| 中性灰 | \`slate\` \`gray\` \`zinc\` \`neutral\` \`stone\` |
| 暖色 | \`red\` \`orange\` \`amber\` \`yellow\` \`lime\` |
| 绿色系 | \`green\` \`emerald\` \`teal\` |
| 青蓝系 | \`cyan\` \`sky\` \`blue\` |
| 紫色系 | \`indigo\` \`violet\` \`purple\` \`fuchsia\` \`pink\` |
| 玫瑰 | \`rose\` |

> 💡 **灰色的选择**：\`gray\` 偏冷蓝、\`zinc\` 中性、\`neutral\` 略暖、\`stone\` 明显偏暖偏褐、\`slate\` 最冷最蓝。现代 UI 多用 \`zinc\` 或 \`slate\`，比传统 \`gray\` 更显高级。

### 颜色命名规则：color-shade

所有颜色类名都是 \`颜色名-档位\` 的形式，比如 \`blue-500\`、\`gray-100\`、\`emerald-700\`。档位数字越小越浅，越大越深。500 通常是对应色相的"标准纯色"，也是按钮主色最常用的档位。

档位的语义化使用建议：

| 档位 | 典型用途 |
| --- | --- |
| 50 | 极浅背景（徽章底色、表格条纹、hover 提示底） |
| 100~200 | 浅色背景、浅色边框、禁用态背景 |
| 300~400 | 中等浅色（边框、分割线、占位符文字） |
| 500 | 主色（主按钮背景、链接、图标） |
| 600~700 | 主色的 hover / active 态（比 500 深一档） |
| 800~900 | 深色背景、深色文字、深色主题底色 |
| 950 | 极深背景（最深的强调区域） |

### 背景色：bg-{color}-{shade}

给元素设置背景色用 \`bg-\` 前缀：

\`\`\`html
<div class="bg-blue-500">标准蓝背景</div>
<div class="bg-gray-100">极浅灰背景</div>
<div class="bg-emerald-600">深绿背景</div>
\`\`\`

> ⚠️ **陷阱**：\`bg-blue\` 不合法——必须带档位。但 \`bg-black\`/\`bg-white\` 是例外（黑白无档位）。

### 文字颜色：text-{color}-{shade}

给文字设置颜色用 \`text-\` 前缀（和字号共用 \`text\` 前缀，靠值的形态区分）：

\`\`\`html
<p class="text-gray-700">正文常用深灰</p>
<p class="text-blue-600">链接蓝</p>
<p class="text-red-500">错误提示红</p>
<p class="text-emerald-500">成功提示绿</p>
\`\`\`

**可读性搭配经验**：浅底（50~100）配深字（600~900），深底（500~900）配浅字（white 或 50~200）。比如 \`bg-blue-50 text-blue-900\`（浅蓝底深蓝字）、\`bg-blue-600 text-white\`（深蓝底白字）。两者都保证足够对比度。

### 边框颜色：border-{color}-{shade}

\`\`\`html
<div class="border border-gray-300">先要有 border 宽度，再设颜色</div>
<div class="border-2 border-blue-500">2px 蓝色边框</div>
\`\`\`

> ⚠️ **必踩坑**：\`border-blue-500\` 只设颜色不设宽度，默认不会显示边框！必须同时写 \`border\`（=1px）或 \`border-2\` 等宽度类。Tailwind v3 把默认边框颜色从 gray-200 改成了 currentColor，所以不写颜色时边框是当前文字色。

### 透明度修饰符：bg-{color}-{shade}/{opacity}

Tailwind 支持在颜色后加 \`/透明度\` 来设置透明度，值可以是 0~100 的刻度或任意小数：

\`\`\`html
<div class="bg-blue-500/50">半透明蓝（50% 不透明度）</div>
<div class="bg-blue-500/25">更淡的蓝（25%）</div>
<div class="bg-blue-500/75">较浓的半透明蓝（75%）</div>
<div class="text-black/50">半透明黑文字</div>
<div class="border-red-500/50">半透明红边框</div>
\`\`\`

底层生成的是 \`rgb(59 130 246 / 0.5)\` 这种现代颜色语法，比 \`rgba()\` 更简洁。透明度修饰符对 \`bg-\`/\`text-\`/\`border-\`/\`ring-\`/\`from-\` 等所有颜色类都生效。

**实用技巧**：用透明度做"叠在图片上的遮罩"——\`bg-black/50\` 半透明黑覆盖在图片上，既能压暗背景又让文字清晰可读。

### 渐变：bg-gradient-to-{dir} from- / via- / to-

Tailwind 用三个部分组成一个渐变：

1. **方向**：\`bg-gradient-to-r\`（向右）/ \`to-l\`（向左）/ \`to-t\`（向上）/ \`to-b\`（向下）/ \`to-tr\`（向右上）/ \`to-br\`（向右下）等 8 个方向；v4 改名为 \`bg-linear-to-r\`。
2. **起点色**：\`from-{color}-{shade}\`
3. **中间色（可选）**：\`via-{color}-{shade}\`
4. **终点色**：\`to-{color}-{shade}\`

\`\`\`html
<!-- 两色渐变：从蓝到靛蓝，向右 -->
<div class="bg-gradient-to-r from-blue-500 to-indigo-600">...</div>

<!-- 三色渐变：从粉，经紫，到靛蓝 -->
<div class="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">...</div>

<!-- 向右下的对角渐变 -->
<div class="bg-gradient-to-br from-emerald-400 to-cyan-500">...</div>
\`\`\`

**径向渐变**：v4 新增 \`bg-radial\` / \`bg-radial-[at_50%_50%]\`；v3 需用任意值或自定义。

### ring 色：ring-{color}-{shade}

\`ring\` 是 Tailwind 特有的"外圈轮廓"概念，比 \`outline\` 更易用、会自动考虑 border-radius。常用于聚焦态：

\`\`\`html
<input class="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
\`\`\`

\`ring-2\` 设置环宽 2px，\`ring-blue-500\` 设置环颜色，\`ring-offset-2\` 在环和元素之间留 2px 间隙（用背景色填充，做出"分离环"效果）。

### 自定义颜色：tailwind.config.js

项目里常常要用品牌色，在配置文件的 \`theme.extend.colors\` 里扩展（用 \`extend\` 而非直接覆盖 \`theme.colors\`，避免丢失默认调色板）：

\`\`\`js
module.exports = {
  theme: {
    extend: {
      colors: {
        // 单值：brand 即一个固定色
        brand: '#5b21b6',
        // 对象：brand-50 ~ brand-900 完整档位
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          // ...
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          // ...
          900: '#4c1d95',
        },
      },
    },
  },
};
\`\`\`

配置后即可用 \`bg-brand-500\`/\`text-brand-700\` 等，和内置颜色用法完全一致。**强烈建议品牌色配完整档位**（至少 50/100/500/600/700/900），方便做 hover 态、浅底深字等搭配。

> ⚠️ **CDN 版本配置**：本教程预览用的是 Play CDN，配置方式不同——需要在引入 CDN 脚本后用 \`tailwind.config = { ... }\` 设置。但本教程练习用内置颜色即可，不必配置自定义色。

### 任意值：bg-[#ff0000]

当预设颜色不够用，又不想改配置时，可用**方括号任意值语法**：

\`\`\`html
<div class="bg-[#ff0000]">十六进制红</div>
<div class="bg-[rgb(255,0,0)]">RGB 红</div>
<div class="text-[#1a73e8]">谷歌蓝</div>
<div class="border-[#e5e7eb] border">自定义边框色</div>
<div class="bg-[hsl(200,80%,50%)]">HSL 色</div>
\`\`\`

任意值是 Tailwind 的"逃生舱"——原则上应优先用预设刻度保持一致性，但在做品牌精确色、设计师给的特定色值时很方便。任意值同样支持透明度修饰符：\`bg-[#ff0000]/50\`。

### 颜色系统的设计哲学

Tailwind 颜色系统体现了几个设计智慧：

1. **有限的自由**：给你 22×11=242 个色块，看似多实则有限——你**只能**从这套里选，强制了全站色彩一致。设计师和开发者用同一套色卡沟通，零歧义。
2. **档位的语义化**：500 是基准，600+ 是深一档（hover），100~ 是浅一档（背景）。这种"档位=语义"的约定让配色决策变成机械操作。
3. **同色相多档位**：同一种蓝，从 50 到 950 覆盖了"浅底深字""深底浅字""渐变""半透明"等所有需求，不用为"找一个浅一点的同色"发愁。

### 动手试试

下面的演示展示了**完整调色板**（多种颜色各档位）、**渐变示例**、**透明度示例**和**ring 聚焦示例**。试着把 \`from-blue-500\` 改成 \`from-fuchsia-500\`、把 \`/50\` 改成 \`/20\`，点"运行"看效果。`,
    code: `<!-- ============================================================ -->
<!-- 第三章演示：颜色系统全览                                       -->
<!-- 包含：完整调色板 / 渐变 / 透明度 / ring 聚焦                   -->
<!-- ============================================================ -->

<!-- 外层容器：max-w-4xl 最大宽度 56rem，mx-auto 居中，p-6 内边距，space-y-8 子元素垂直间距 -->
<div class="max-w-4xl mx-auto p-6 space-y-8">

  <!-- ============ 区块 1：完整调色板（多种颜色 × 多档位） ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-4">① 完整调色板（部分颜色 × 7 档位）</h2>
    <p class="text-sm text-gray-500 mb-4">每行一种颜色，展示 300/400/500/600/700/800/900 七个档位。500 为标准色。</p>

    <!-- 调色板网格：每行一种颜色，grid 配 grid-cols-7 七列，gap-1 间距 0.25rem -->
    <div class="space-y-1">

      <!-- 红色系 red：每块 h-10 高度 2.5rem，rounded 圆角，flex 居中显示档位数字 -->
      <div class="grid grid-cols-7 gap-1">
        <div class="bg-red-300 h-10 rounded flex items-center justify-center text-xs text-red-900">300</div>
        <div class="bg-red-400 h-10 rounded flex items-center justify-center text-xs text-white">400</div>
        <div class="bg-red-500 h-10 rounded flex items-center justify-center text-xs text-white font-bold">500</div>
        <div class="bg-red-600 h-10 rounded flex items-center justify-center text-xs text-white">600</div>
        <div class="bg-red-700 h-10 rounded flex items-center justify-center text-xs text-white">700</div>
        <div class="bg-red-800 h-10 rounded flex items-center justify-center text-xs text-white">800</div>
        <div class="bg-red-900 h-10 rounded flex items-center justify-center text-xs text-white">900</div>
      </div>

      <!-- 橙色系 orange -->
      <div class="grid grid-cols-7 gap-1">
        <div class="bg-orange-300 h-10 rounded flex items-center justify-center text-xs text-orange-900">300</div>
        <div class="bg-orange-400 h-10 rounded flex items-center justify-center text-xs text-white">400</div>
        <div class="bg-orange-500 h-10 rounded flex items-center justify-center text-xs text-white font-bold">500</div>
        <div class="bg-orange-600 h-10 rounded flex items-center justify-center text-xs text-white">600</div>
        <div class="bg-orange-700 h-10 rounded flex items-center justify-center text-xs text-white">700</div>
        <div class="bg-orange-800 h-10 rounded flex items-center justify-center text-xs text-white">800</div>
        <div class="bg-orange-900 h-10 rounded flex items-center justify-center text-xs text-white">900</div>
      </div>

      <!-- 琥珀色 amber -->
      <div class="grid grid-cols-7 gap-1">
        <div class="bg-amber-300 h-10 rounded flex items-center justify-center text-xs text-amber-900">300</div>
        <div class="bg-amber-400 h-10 rounded flex items-center justify-center text-xs text-amber-900">400</div>
        <div class="bg-amber-500 h-10 rounded flex items-center justify-center text-xs text-white font-bold">500</div>
        <div class="bg-amber-600 h-10 rounded flex items-center justify-center text-xs text-white">600</div>
        <div class="bg-amber-700 h-10 rounded flex items-center justify-center text-xs text-white">700</div>
        <div class="bg-amber-800 h-10 rounded flex items-center justify-center text-xs text-white">800</div>
        <div class="bg-amber-900 h-10 rounded flex items-center justify-center text-xs text-white">900</div>
      </div>

      <!-- 翠绿 emerald -->
      <div class="grid grid-cols-7 gap-1">
        <div class="bg-emerald-300 h-10 rounded flex items-center justify-center text-xs text-emerald-900">300</div>
        <div class="bg-emerald-400 h-10 rounded flex items-center justify-center text-xs text-white">400</div>
        <div class="bg-emerald-500 h-10 rounded flex items-center justify-center text-xs text-white font-bold">500</div>
        <div class="bg-emerald-600 h-10 rounded flex items-center justify-center text-xs text-white">600</div>
        <div class="bg-emerald-700 h-10 rounded flex items-center justify-center text-xs text-white">700</div>
        <div class="bg-emerald-800 h-10 rounded flex items-center justify-center text-xs text-white">800</div>
        <div class="bg-emerald-900 h-10 rounded flex items-center justify-center text-xs text-white">900</div>
      </div>

      <!-- 青色 cyan -->
      <div class="grid grid-cols-7 gap-1">
        <div class="bg-cyan-300 h-10 rounded flex items-center justify-center text-xs text-cyan-900">300</div>
        <div class="bg-cyan-400 h-10 rounded flex items-center justify-center text-xs text-cyan-900">400</div>
        <div class="bg-cyan-500 h-10 rounded flex items-center justify-center text-xs text-white font-bold">500</div>
        <div class="bg-cyan-600 h-10 rounded flex items-center justify-center text-xs text-white">600</div>
        <div class="bg-cyan-700 h-10 rounded flex items-center justify-center text-xs text-white">700</div>
        <div class="bg-cyan-800 h-10 rounded flex items-center justify-center text-xs text-white">800</div>
        <div class="bg-cyan-900 h-10 rounded flex items-center justify-center text-xs text-white">900</div>
      </div>

      <!-- 蓝色 blue -->
      <div class="grid grid-cols-7 gap-1">
        <div class="bg-blue-300 h-10 rounded flex items-center justify-center text-xs text-blue-900">300</div>
        <div class="bg-blue-400 h-10 rounded flex items-center justify-center text-xs text-white">400</div>
        <div class="bg-blue-500 h-10 rounded flex items-center justify-center text-xs text-white font-bold">500</div>
        <div class="bg-blue-600 h-10 rounded flex items-center justify-center text-xs text-white">600</div>
        <div class="bg-blue-700 h-10 rounded flex items-center justify-center text-xs text-white">700</div>
        <div class="bg-blue-800 h-10 rounded flex items-center justify-center text-xs text-white">800</div>
        <div class="bg-blue-900 h-10 rounded flex items-center justify-center text-xs text-white">900</div>
      </div>

      <!-- 紫色 purple -->
      <div class="grid grid-cols-7 gap-1">
        <div class="bg-purple-300 h-10 rounded flex items-center justify-center text-xs text-purple-900">300</div>
        <div class="bg-purple-400 h-10 rounded flex items-center justify-center text-xs text-white">400</div>
        <div class="bg-purple-500 h-10 rounded flex items-center justify-center text-xs text-white font-bold">500</div>
        <div class="bg-purple-600 h-10 rounded flex items-center justify-center text-xs text-white">600</div>
        <div class="bg-purple-700 h-10 rounded flex items-center justify-center text-xs text-white">700</div>
        <div class="bg-purple-800 h-10 rounded flex items-center justify-center text-xs text-white">800</div>
        <div class="bg-purple-900 h-10 rounded flex items-center justify-center text-xs text-white">900</div>
      </div>

      <!-- 灰色 gray（中性色，最常用作背景/文字/边框） -->
      <div class="grid grid-cols-7 gap-1">
        <div class="bg-gray-300 h-10 rounded flex items-center justify-center text-xs text-gray-900">300</div>
        <div class="bg-gray-400 h-10 rounded flex items-center justify-center text-xs text-white">400</div>
        <div class="bg-gray-500 h-10 rounded flex items-center justify-center text-xs text-white font-bold">500</div>
        <div class="bg-gray-600 h-10 rounded flex items-center justify-center text-xs text-white">600</div>
        <div class="bg-gray-700 h-10 rounded flex items-center justify-center text-xs text-white">700</div>
        <div class="bg-gray-800 h-10 rounded flex items-center justify-center text-xs text-white">800</div>
        <div class="bg-gray-900 h-10 rounded flex items-center justify-center text-xs text-white">900</div>
      </div>
    </div>
  </section>

  <!-- ============ 区块 2：渐变示例 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-4">② 渐变示例</h2>
    <p class="text-sm text-gray-500 mb-4">bg-gradient-to-{方向} + from-/via-/to- 三段颜色。</p>

    <!-- 渐变展示网格：grid-cols-2 两列，gap-4 间距 1rem -->
    <div class="grid grid-cols-2 gap-4">
      <!-- 两色渐变，向右：蓝→靛蓝 -->
      <div class="h-20 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
        to-r: blue → indigo
      </div>
      <!-- 三色渐变，向右：粉→紫→靛蓝 -->
      <div class="h-20 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white font-medium">
        to-r: pink → purple → indigo
      </div>
      <!-- 向右下对角：翠绿→青 -->
      <div class="h-20 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-medium">
        to-br: emerald → cyan
      </div>
      <!-- 向下：橙→黄（暖色系） -->
      <div class="h-20 rounded-lg bg-gradient-to-b from-orange-500 to-amber-400 flex items-center justify-center text-white font-medium">
        to-b: orange → amber
      </div>
    </div>
  </section>

  <!-- ============ 区块 3：透明度修饰符 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-4">③ 透明度修饰符（/ 后跟 0~100）</h2>
    <p class="text-sm text-gray-500 mb-4">同一颜色不同透明度，背景用蓝 500，从 100% 到 10%。</p>

    <!-- 透明度展示：用一个深色底容器衬托半透明效果 -->
    <!-- 父容器：bg-gray-800 深灰底，让半透明蓝看起来明显；p-4 内边距，rounded-lg 圆角 -->
    <div class="bg-gray-800 p-4 rounded-lg">
      <!-- 子元素 flex 排列，space-x-2 间距 0.5rem -->
      <div class="flex space-x-2">
        <!-- 每块 h-16 高 4rem，flex-1 等宽，rounded 圆角，
             bg-blue-500/100 到 /10 透明度递减，白字显示透明度数值 -->
        <div class="h-16 flex-1 rounded bg-blue-500/100 flex items-center justify-center text-xs text-white">100</div>
        <div class="h-16 flex-1 rounded bg-blue-500/75 flex items-center justify-center text-xs text-white">75</div>
        <div class="h-16 flex-1 rounded bg-blue-500/50 flex items-center justify-center text-xs text-white">50</div>
        <div class="h-16 flex-1 rounded bg-blue-500/25 flex items-center justify-center text-xs text-white">25</div>
        <div class="h-16 flex-1 rounded bg-blue-500/10 flex items-center justify-center text-xs text-white">10</div>
      </div>
    </div>

    <!-- 半透明文字示例 -->
    <p class="mt-4 text-2xl font-bold text-gray-900">
      黑字 <span class="text-black/50">半透明黑</span> <span class="text-black/30">更淡</span>
    </p>
  </section>

  <!-- ============ 区块 4：ring 聚焦色 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-4">④ ring 聚焦色（点击输入框看效果）</h2>
    <p class="text-sm text-gray-500 mb-4">点击下面的输入框，会显示对应颜色的聚焦环。ring-{color} 设置环色。</p>

    <!-- 输入框组：space-y-3 垂直间距 0.75rem -->
    <div class="space-y-3 max-w-sm">
      <!-- 蓝色聚焦环：focus:ring-2 环宽 2px，focus:ring-blue-500 蓝色，focus:border-blue-500 边框也变蓝 -->
      <input type="text" placeholder="蓝色聚焦环" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
      <!-- 绿色聚焦环 -->
      <input type="text" placeholder="绿色聚焦环" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
      <!-- 紫色聚焦环 + ring-offset 分离环效果：focus:ring-offset-2 环与输入框之间留 2px 白色间隙 -->
      <input type="text" placeholder="紫色聚焦环（带 offset）" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:border-purple-500">
    </div>
  </section>
</div>`,
  },

  // =========================================================
  // 第四章：间距与尺寸
  // =========================================================
  {
    id: "tw-spacing",
    title: "间距与尺寸",
    icon: "📏",
    group: "基础",
    content: `## 盒模型回顾

在讲 Tailwind 的间距类之前，必须先回顾 CSS 盒模型，因为 padding/margin/width/height 都建立在盒模型之上。

每个 HTML 元素都是一个矩形盒子，从内到外分四层：

\`\`\`
┌─────────────────────────────────────────┐  ← margin（外边距，透明，决定盒子和别人的距离）
│  ┌───────────────────────────────────┐  │  ← border（边框）
│  │  ┌─────────────────────────────┐  │  │  ← padding（内边距，透明，决定内容和边框的距离）
│  │  │                             │  │  │
│  │  │       content（内容区）       │  │  │  ← width / height 默认指的是这里
│  │  │                             │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
\`\`\`

### content-box vs border-box

CSS 有两种盒模型计算方式：

- **content-box（标准盒模型）**：\`width\` 只包含内容区。设 \`width: 200px\` + \`padding: 20px\` + \`border: 2px\`，实际盒子总宽 = 200 + 20×2 + 2×2 = 244px。加 padding 会让盒子"变大"，破坏布局。
- **border-box（替代盒模型）**：\`width\` 包含内容 + padding + border。设 \`width: 200px\` + \`padding: 20px\` + \`border: 2px\`，总宽仍是 200px，padding 和 border 向内挤压内容区。**这是现代 CSS 推荐的方式**。

**Tailwind 默认使用 border-box**——它在 Preflight（基础重置样式）里对所有元素设了 \`box-sizing: border-box\`。所以你在 Tailwind 里设 \`w-64\`，无论加多少 padding/border，盒子总宽都是 16rem，不会撑破布局。这一点和很多老教程不同，要记住。

### padding：内边距

padding 是内容和边框之间的空间。Tailwind 提供 4 个方向变体 + 整体：

| 类名 | 作用 | 等价 CSS |
| --- | --- | --- |
| \`p-{n}\` | 四个方向 | \`padding: {n}×0.25rem\` |
| \`px-{n}\` | 左右（水平） | \`padding-left/right\` |
| \`py-{n}\` | 上下（垂直） | \`padding-top/bottom\` |
| \`pt-{n}\` | 上 | \`padding-top\` |
| \`pr-{n}\` | 右 | \`padding-right\` |
| \`pb-{n}\` | 下 | \`padding-bottom\` |
| \`pl-{n}\` | 左 | \`padding-left\` |

\`n\` 取自间距刻度（0/0.5/1/1.5/2/3/4/5/6/8/10/12/16/...）。比如 \`p-4\` = 四向 1rem，\`px-6 py-3\` = 左右 1.5rem、上下 0.75rem（按钮常用）。

**记忆口诀**：\`p\` = padding，\`x\` = 横轴（左右），\`y\` = 纵轴（上下），\`t/r/b/l\` = top/right/bottom/left。

### margin：外边距

margin 是盒子**外部**的空白，决定盒子和相邻元素的距离。命名规则和 padding 完全对应，只是前缀换成 \`m\`：

| 类名 | 作用 |
| --- | --- |
| \`m-{n}\` | 四向外边距 |
| \`mx-{n}\` / \`my-{n}\` | 水平 / 垂直 |
| \`mt-/mr-/mb-/ml-{n}\` | 上 / 右 / 下 / 左 |

**特殊值 \`auto\`**：\`mx-auto\` 让固定宽度的块级元素在父容器里**水平居中**（利用了 margin auto 的特性）。这是做"容器居中"的标准手法：

\`\`\`html
<div class="max-w-4xl mx-auto">  <!-- 最大宽 56rem，水平居中 -->
  内容...
</div>
\`\`\`

> ⚠️ **陷阱**：\`mx-auto\` 居中的前提是元素有**明确宽度**（\`w-\` 或 \`max-w-\`）且是块级元素。一个 \`w-full\` 的元素加 \`mx-auto\` 没意义（它已经占满父容器）。垂直居中不能用 \`my-auto\`（margin auto 在垂直方向不生效），要用 flex \`items-center\` 或 grid。

**负边距**：\`-m-4\`（前加减号）= \`margin: -1rem\`，可用于让元素"溢出"父容器或重叠相邻元素。

### space-between：space-x / space-y

\`space-x-{n}\` 和 \`space-y-{n}\` 用于给**一组兄弟元素之间**添加间距，比给每个子元素单独写 margin 更优雅：

\`\`\`html
<!-- 三个按钮之间各有 0.5rem 水平间距 -->
<div class="flex space-x-2">
  <button>按钮1</button>
  <button>按钮2</button>
  <button>按钮3</button>
</div>
\`\`\`

它的原理是给除第一个以外的子元素加 \`margin-left\`（\`space-x\`）或 \`margin-top\`（\`space-y\`）。所以**只对相邻兄弟有效，不能跨层级**。

#### space-x/y vs gap 的区别（高频混淆点）

| 维度 | \`space-x/y-\` | \`gap-\` |
| --- | --- | --- |
| 作用对象 | 子元素之间的 margin | flex/grid 容器的 gap 属性 |
| 实现方式 | 给子元素加 margin | 容器属性，子元素无感 |
| 对 \`flex-wrap\` 换行 | **有问题**：换行后每行第一个元素仍带 margin，导致左对齐错位 | 正确：换行后行首无多余间距 |
| 子元素被隐藏/删除 | 可能残留间距 | 自动重排，无残留 |
| 现代推荐 | 旧项目兼容 | **新项目首选** |

**结论**：能用 \`gap-\` 就用 \`gap-\`（\`flex gap-4\` / \`grid gap-4\`），只在需要兼容旧浏览器或特殊场景才用 \`space-x/y-\`。

### width：宽度

宽度类用 \`w-\` 前缀，值可以是刻度、百分比、关键字、任意值：

| 类名 | 含义 |
| --- | --- |
| \`w-0\` ~ \`w-96\` | 固定宽度（刻度，0~24rem） |
| \`w-full\` | 100%（占满父容器宽度） |
| \`w-screen\` | 100vw（占满视口宽度） |
| \`w-auto\` | 自动（默认，由内容决定） |
| \`w-1/2\` | 50% |
| \`w-1/3\` / \`w-2/3\` | 33.33% / 66.67% |
| \`w-1/4\` / \`w-2/4\` / \`w-3/4\` | 25% / 50% / 75% |
| \`w-1/5\` ~ \`w-4/5\` | 五分之几 |
| \`w-1/6\` ~ \`w-5/6\` | 六分之几 |
| \`w-3/5\` | 60% |
| \`w-min\` | \`min-content\`（不换行的最小宽） |
| \`w-max\` | \`max-content\`（内容撑满不换行） |
| \`w-fit\` | \`fit-content\` |

> ⚠️ **陷阱**：\`w-full\` 让元素占满**父容器**宽度，所以父容器没设宽度时 \`w-full\` 可能撑破屏幕。常见做法是父容器用 \`max-w-\` 限制，子元素 \`w-full\` 填充。另外 \`w-full\` 配合 \`box-sizing: content-box\` 再加 padding/border 会溢出——好在 Tailwind 默认 border-box，不用担心。

### height：高度

高度类用 \`h-\` 前缀，和宽度类似：

| 类名 | 含义 |
| --- | --- |
| \`h-0\` ~ \`h-96\` | 固定高度（刻度） |
| \`h-full\` | 100%（父容器高度） |
| \`h-screen\` | 100vh（占满视口高度） |
| \`h-auto\` | 自动（默认） |
| \`h-min\` / \`h-max\` / \`h-fit\` | min/max/fit-content |

> ⚠️ **陷阱**：\`h-full\` 让元素占满**父容器**高度，但前提是父容器**有明确高度**。如果父容器高度是 auto（由内容决定），\`h-full\` 不会生效（变成 0 或 auto）。要让一个区块占满整个视口高度，用 \`h-screen\`（100vh）或 \`min-h-screen\`。

### min/max 尺寸

| 类名 | 含义 |
| --- | --- |
| \`min-w-0\` | \`min-width: 0\`（**flex 子元素防溢出神器**，见下文） |
| \`min-w-full\` | 最小宽 100% |
| \`max-w-{n}\` | 最大宽（刻度） |
| \`max-w-full\` | 最大宽 100% |
| \`max-w-prose\` | 约 65ch（字符宽度），阅读舒适的最大宽度 |
| \`max-w-screen-sm/md/lg/xl/2xl\` | 对应断点宽度的最大宽 |
| \`max-w-xs/sm/md/lg/xl/2xl/3xl/4xl/.../7xl\` | 预设的容器宽度档位 |
| \`min-h-0\` / \`min-h-full\` / \`min-h-screen\` | 最小高 |

#### max-w-prose 的妙用

\`max-w-prose\` = \`max-width: 65ch\`，约等于一行 65 个英文字符的宽度（中文约 32 字）。这是**排版学公认的最佳阅读行宽**——太长换行难找下一行，太短频繁换行打断节奏。写博客、文章详情、长文本时用 \`max-w-prose mx-auto\` 让正文居中且行宽舒适。

#### min-w-0 的"flex 防溢出"魔法

这是 Tailwind 里**最隐蔽也最重要**的坑之一。在 flex 容器里，子元素默认 \`min-width: auto\`，意味着它不会缩小到比内容最小宽度更小。如果子元素里有长文本或宽表格，会**撑破 flex 容器导致横向溢出**。解决：给该子元素加 \`min-w-0\`，允许它缩小到 0，从而让 \`flex-1\`/\`truncate\` 等正常工作。

\`\`\`html
<div class="flex">
  <div class="min-w-0 flex-1">
    <p class="truncate">这一长串文字在 flex 里不加 min-w-0 会撑破容器...</p>
  </div>
</div>
\`\`\`

### size（v3.4+）

Tailwind v3.4 起新增 \`size-\`，**同时设置 width 和 height**，等价于 \`w-{n} h-{n}\`：

\`\`\`html
<div class="size-16">  <!-- 等价于 w-16 h-16，都是 4rem -->
<div class="size-full">  <!-- 等价于 w-full h-full -->
\`\`\`

做正方形头像、图标容器时特别方便：\`size-10 rounded-full\` 就是 2.5rem 的圆形头像。

### 任意值

刻度不够用时用方括号：

\`\`\`html
<div class="w-[200px]">  <!-- 任意像素 -->
<div class="w-[50vw]">  <!-- 视口宽度的 50% -->
<div class="p-[13px]">  <!-- 非 4 的倍数 -->
<div class="max-w-[1200px]">  <!-- 设计师给的容器宽 -->
\`\`\`

原则上优先用预设刻度保持一致性，任意值用于精确还原设计稿的"非标"尺寸。

### 动手试试

下面的演示覆盖了 padding/margin 各方向、space-x/y、宽度比例、max-w-prose、min-w-0、任意值等。修改数值后点"运行"查看效果。`,
    code: `<!-- ============================================================ -->
<!-- 第四章演示：间距与尺寸                                          -->
<!-- 包含：padding/margin 方向 / space-x-y / 宽度比例 /             -->
<!--       max-w-prose / min-w-0 / 任意值                           -->
<!-- ============================================================ -->

<!-- 外层容器：max-w-4xl 最大宽 56rem，mx-auto 居中，p-6 内边距，space-y-8 子元素间距 -->
<div class="max-w-4xl mx-auto p-6 space-y-8">

  <!-- ============ 区块 1：padding 各方向 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-4">① padding 各方向</h2>
    <p class="text-sm text-gray-500 mb-4">外层 bg-gray-100 显示 padding 占据空间，内层 bg-blue-500 是内容。</p>

    <!-- 每行展示一种 padding 方向；用 inline-block 让外层紧贴内容，更直观看出 padding 范围 -->
    <div class="space-y-3">
      <!-- p-4：四向都 1rem -->
      <div class="bg-gray-100 inline-block p-4"><span class="bg-blue-500 text-white text-xs px-2 py-1 rounded">p-4（四向 1rem）</span></div>
      <br>
      <!-- px-8 py-2：左右 2rem、上下 0.5rem（按钮常用比例） -->
      <div class="bg-gray-100 inline-block px-8 py-2"><span class="bg-blue-500 text-white text-xs px-2 py-1 rounded">px-8 py-2（横宽纵窄）</span></div>
      <br>
      <!-- pt-1 pb-8：上小下大 -->
      <div class="bg-gray-100 inline-block pt-1 pb-8 px-4"><span class="bg-blue-500 text-white text-xs px-2 py-1 rounded">pt-1 pb-8（上紧下松）</span></div>
      <br>
      <!-- pl-10 pr-2：左大右小 -->
      <div class="bg-gray-100 inline-block pl-10 pr-2 py-3"><span class="bg-blue-500 text-white text-xs px-2 py-1 rounded">pl-10 pr-2（左宽右窄）</span></div>
    </div>
  </section>

  <!-- ============ 区块 2：margin 与 mx-auto 居中 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-4">② margin 与 mx-auto 居中</h2>
    <p class="text-sm text-gray-500 mb-4">外层边框显示盒子边界，mt/mb 控制上下外边距，mx-auto 水平居中。</p>

    <!-- 外层带边框，便于看清 margin 的"外部空白" -->
    <div class="border-2 border-dashed border-gray-300 p-4">
      <!-- mt-0：无上边距；用 bg-green-100 直观显示盒子 -->
      <div class="bg-green-100 mt-0 p-2 text-sm text-green-800 rounded">mt-0（无上边距）</div>
      <!-- mt-4：上外边距 1rem，和上面的盒子拉开距离 -->
      <div class="bg-green-100 mt-4 p-2 text-sm text-green-800 rounded">mt-4（上边距 1rem，和上面拉开）</div>
      <!-- mx-auto + w-1/2：固定宽度 50% + 水平居中 -->
      <div class="bg-green-100 mt-4 mx-auto w-1/2 p-2 text-sm text-green-800 rounded text-center">mx-auto w-1/2（固定宽 + 居中）</div>
    </div>
  </section>

  <!-- ============ 区块 3：space-x / space-y 子元素间距 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-4">③ space-x / space-y（子元素间距）</h2>
    <p class="text-sm text-gray-500 mb-4">给容器加 space-x/space-y，自动给相邻子元素加间距，无需逐个写 margin。</p>

    <!-- space-x-4：水平排列（flex），子元素间距 1rem -->
    <p class="text-xs text-gray-500 mb-1">space-x-4（水平 1rem）：</p>
    <div class="flex space-x-4 mb-4">
      <div class="bg-purple-500 text-white px-3 py-2 rounded text-sm">项 1</div>
      <div class="bg-purple-500 text-white px-3 py-2 rounded text-sm">项 2</div>
      <div class="bg-purple-500 text-white px-3 py-2 rounded text-sm">项 3</div>
    </div>

    <!-- space-y-3：垂直排列，子元素间距 0.75rem -->
    <p class="text-xs text-gray-500 mb-1">space-y-3（垂直 0.75rem）：</p>
    <div class="space-y-3">
      <div class="bg-purple-500 text-white px-3 py-2 rounded text-sm inline-block">项 1</div>
      <div class="bg-purple-500 text-white px-3 py-2 rounded text-sm inline-block">项 2</div>
      <div class="bg-purple-500 text-white px-3 py-2 rounded text-sm inline-block">项 3</div>
    </div>

    <!-- 对比 gap：推荐用 gap 代替 space-x/y -->
    <p class="text-xs text-gray-500 mt-4 mb-1">gap-4（更现代的写法，推荐）：</p>
    <div class="flex gap-4">
      <div class="bg-emerald-500 text-white px-3 py-2 rounded text-sm">项 1</div>
      <div class="bg-emerald-500 text-white px-3 py-2 rounded text-sm">项 2</div>
      <div class="bg-emerald-500 text-white px-3 py-2 rounded text-sm">项 3</div>
    </div>
  </section>

  <!-- ============ 区块 4：宽度比例 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-4">④ 宽度比例（w-1/2、1/3、2/3、1/4、3/4）</h2>
    <p class="text-sm text-gray-500 mb-4">用百分比类做等分/不等分布局。每行总和为 100%。</p>

    <!-- 1/2 + 1/2 = 各 50% -->
    <div class="flex mb-2">
      <div class="w-1/2 bg-blue-500 text-white text-center py-2 text-sm rounded-l">w-1/2</div>
      <div class="w-1/2 bg-blue-700 text-white text-center py-2 text-sm rounded-r">w-1/2</div>
    </div>
    <!-- 1/3 + 2/3 -->
    <div class="flex mb-2">
      <div class="w-1/3 bg-cyan-500 text-white text-center py-2 text-sm rounded-l">w-1/3</div>
      <div class="w-2/3 bg-cyan-700 text-white text-center py-2 text-sm rounded-r">w-2/3</div>
    </div>
    <!-- 1/4 + 1/4 + 1/4 + 1/4 -->
    <div class="flex mb-2">
      <div class="w-1/4 bg-teal-500 text-white text-center py-2 text-sm">w-1/4</div>
      <div class="w-1/4 bg-teal-600 text-white text-center py-2 text-sm">w-1/4</div>
      <div class="w-1/4 bg-teal-700 text-white text-center py-2 text-sm">w-1/4</div>
      <div class="w-1/4 bg-teal-800 text-white text-center py-2 text-sm">w-1/4</div>
    </div>
    <!-- 3/4 + 1/4 -->
    <div class="flex mb-2">
      <div class="w-3/4 bg-indigo-500 text-white text-center py-2 text-sm rounded-l">w-3/4</div>
      <div class="w-1/4 bg-indigo-700 text-white text-center py-2 text-sm rounded-r">w-1/4</div>
    </div>
  </section>

  <!-- ============ 区块 5：max-w-prose 阅读宽度 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-4">⑤ max-w-prose（最佳阅读宽度 ~65ch）</h2>
    <p class="text-sm text-gray-500 mb-4">约 65 个英文字符宽，长文本最舒适的行宽。配合 mx-auto 居中。</p>

    <!-- max-w-prose mx-auto：限制最大宽并居中，文字不会过宽 -->
    <div class="max-w-prose mx-auto bg-gray-50 border border-gray-200 p-4 rounded">
      <p class="text-sm text-gray-700 leading-relaxed">
        这段文字被 max-w-prose 限制在约 65 个字符宽。研究表明，过长的行会让读者换行时难以找到下一行的开头，过短则打断阅读节奏。65ch 是排版学公认的最佳行宽区间。配合 mx-auto 让文本块在更宽的容器里水平居中，是博客、文章详情页的标配写法。
      </p>
    </div>
  </section>

  <!-- ============ 区块 6：任意值与 size ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-4">⑥ 任意值与 size</h2>
    <p class="text-sm text-gray-500 mb-4">方括号写任意尺寸；size- 同时设宽高。下面是三个 size 不同方块。</p>

    <!-- flex 排列，items-end 底对齐让不同高度方块底部齐平，gap-4 间距 -->
    <div class="flex items-end gap-4">
      <!-- size-12：宽高都是 3rem（12×0.25rem），等价 w-12 h-12 -->
      <div class="size-12 bg-rose-500 rounded flex items-center justify-center text-white text-xs">size-12</div>
      <!-- size-20：宽高都是 5rem -->
      <div class="size-20 bg-rose-600 rounded flex items-center justify-center text-white text-xs">size-20</div>
      <!-- size-28：宽高都是 7rem -->
      <div class="size-28 bg-rose-700 rounded flex items-center justify-center text-white text-xs">size-28</div>
      <!-- 任意值：w-[120px] h-[80px]，非刻度尺寸 -->
      <div class="w-[120px] h-[80px] bg-rose-800 rounded flex items-center justify-center text-white text-xs text-center">w-[120px]<br>h-[80px]</div>
    </div>
  </section>
</div>`,
  },
];
