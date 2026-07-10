// =============================================================
// Java Web 应用开发实战教程 —— 第十批章节（模板引擎 Thymeleaf 组，共 4 章）
// 章节 37-40:Thymeleaf 基础语法 / 变量与迭代 /
//          条件与片段 / 表单绑定与国际化
// =============================================================

export const chapters = [
  // =============================================================
  // 第三十七章:Thymeleaf 基础语法
  // =============================================================
  {
    id: "jw-37",
    group: "模板引擎 Thymeleaf",
    icon: "🌿",
    title: "Thymeleaf 基础语法",
    content: `# Thymeleaf 基础语法

## 概念解释

Thymeleaf 是现代化的 Java 服务端模板引擎，定位是「让模板可以**自然地**被浏览器打开预览」。这与 JSP、FreeMarker 的最大区别：JSP 必须经过 Servlet 容器渲染才能看，Thymeleaf 写的 HTML 直接用浏览器打开就能看静态预览，设计师能直接调样式，后端把 \`th:\` 属性填值时再替换为动态内容。

设计理念是**自然模板**：Thymeleaf 把所有动态指令都放在 HTML 的**属性**里（\`th:text\`、\`th:if\`、\`th:each\`），而不像 JSP 那样用 \`<% %>\` 或 \`<c:forEach>\` 这种专属标签。这样模板本身就是合法的 HTML，浏览器忽略不认识的 \`th:\` 属性，照常显示静态内容。

使用 Thymeleaf 必须在根元素声明命名空间 \`xmlns:th="http://www.thymeleaf.org"\`，这只是声明，浏览器看到陌生的 \`th:\` 也不会报错，宽容地忽略未知属性。

核心表达式有四种：\`\${...}\` 变量表达式（最常用，在上下文变量上求值）、\`*{...}\` 选择表达式（配合 \`th:object\` 在当前选中对象上求值）、\`@{...}\` URL 表达式（生成 URL，自动处理上下文路径）、\`#{...}\` 消息表达式（国际化文本）。

## 设计原理

\`th:text\` 设置元素文本内容，**自动 HTML 转义**，防 XSS（默认行为），是最常用的属性。对应的 \`th:utext\` 不转义（unescaped），仅在内容是可信 HTML 时使用，否则有 XSS 风险。这种默认安全的设计让开发者不易犯 XSS 错误。

运算符设计避免与 HTML 标签冲突：比较运算符用文字形式 \`gt\`（\`>\`）、\`lt\`（\`<\`）、\`ge\`（\`>=\`）、\`le\`（\`<=\`）、\`eq\`（\`==\`）、\`neq\`（\`!=\`），逻辑运算用 \`and\`、\`or\`、\`!\`。还有 Elvis 运算符 \`?:\` 提供默认值：\`\${user.nickname} ?: '匿名'\` 表示 nickname 为 null 时取「匿名」。

\`@{...}\` URL 表达式自动处理上下文路径（\`server.servlet.context-path\`）：不带参数 \`@{/login}\`、路径变量 \`@{/users/{id}(id=\${user.id})}\`、查询参数 \`@{/search(q=\${keyword}, page=\${page})}\`。这让部署路径变化时模板不用改。

## 使用场景

- 服务端渲染页面（SSR）：管理后台、内容站、博客
- 邮件模板：Thymeleaf 渲染 HTML 邮件，复用片段
- 静态文档生成：把数据填进模板生成 HTML 报告
- 适合需要 SEO 的页面（内容直出利于爬虫）
- 不适用：前后端分离项目（用 Vue/React）、纯 API 后端

## 代码示例

下面是覆盖各种基础语法的完整示例模板：

\`\`\`html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">     <!-- 命名空间声明 -->
<head>
    <meta charset="UTF-8">
    <title th:text="#{page.title}">默认标题</title>  <!-- 国际化消息 -->
</head>
<body>
    <!-- 变量表达式 + 文本拼接 -->
    <h1 th:text="'用户列表：' + \${total}">用户列表</h1>

    <!-- 条件渲染 th:if / th:unless -->
    <p th:if="\${total == 0}">暂无用户</p>
    <p th:unless="\${total == 0}">共 <span th:text="\${total}">0</span> 人</p>

    <!-- URL 表达式 @{} -->
    <a th:href="@{/users/{id}(id=\${user.id})}">详情</a>
    <a th:href="@{/search(q=\${keyword})}">搜索</a>

    <!-- Elvis 运算符提供默认值 -->
    <p th:text="\${user.nickname} ?: '匿名用户'">匿名</p>

    <!-- switch 分支 -->
    <div th:switch="\${user.level}">
        <p th:case="'A'">高级会员</p>
        <p th:case="'B'">中级会员</p>
        <p th:case="*">普通会员</p>      <!-- 默认分支 -->
    </div>

    <!-- 比较运算符用文字形式避免 HTML 冲突 -->
    <span th:text="\${user.age ge 18} ? '成年' : '未成年'"></span>
</body>
</html>
\`\`\`

Controller 配套示例：

\`\`\`java
@Controller
public class UserController {

    @GetMapping("/users")
    public String list(Model model) {
        List<User> users = userService.findAll();
        model.addAttribute("users", users);
        model.addAttribute("total", users.size());
        model.addAttribute("user", users.get(0));
        model.addAttribute("keyword", "thymeleaf");
        return "user/list";    // 模板路径 templates/user/list.html
    }
}
\`\`\`

注意 \`return\` 的字符串是视图名，Thymeleaf 默认从 \`src/main/resources/templates/\` 下找 \`{name}.html\`。Controller 用 \`@Controller\` 而非 \`@RestController\`，因为要返回视图名而非响应体。

逐行解析：\`xmlns:th="http://www.thymeleaf.org"\` 声明命名空间，浏览器忽略 \`th:\` 属性；\`th:text="#{page.title}"\` 取国际化消息；\`th:text="'用户列表：' + \${total}"\` 文本字面值加变量拼接；\`th:href="@{/users/{id}(id=\${user.id})}"\` URL 表达式路径变量插值；\`th:case="*"\` switch 的默认分支。

## 对比分析

| 维度 | Thymeleaf | JSP | FreeMarker |
| --- | --- | --- | --- |
| 静态预览 | 可以（自然模板） | 不行 | 不行 |
| 语法 | HTML 属性 | 标签库 | 自定义语法 |
| 学习成本 | 中 | 低 | 中 |
| Spring Boot 集成 | 官方推荐 | 已弱化 | 需手动配 |
| 性能 | 中（编译缓存后可） | 高 | 高 |

| 维度 | th:text | th:utext |
| --- | --- | --- |
| HTML 转义 | 是（默认安全） | 否 |
| XSS 防护 | 有 | 无 |
| 适用 | 普通文本 | 可信 HTML 富文本 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 忘记声明 xmlns:th | IDE 报错或部分功能失效 | html 根元素加命名空间 |
| th:utext 输出用户输入 | XSS 风险 | 默认用 th:text，确信可信才 utext |
| 比较运算符用 > < | HTML 解析冲突 | 用 gt/lt/ge/le 文字形式 |
| URL 写死上下文路径 | 改部署路径全失效 | 用 @{} 表达式 |
| th:if 写在自闭合标签 | 不生效 | th:if 必须在带闭合的元素上 |
| 用 @Controller 忘了返回视图名 | 当成 JSON 返回 | SSR 用 @Controller，API 用 @RestController |
| 静态文字与动态值差距大 | 设计师看到的预览失真 | 占位文字尽量贴近真实数据 |
`,
  },

  // =============================================================
  // 第三十八章:变量与迭代
  // =============================================================
  {
    id: "jw-38",
    group: "模板引擎 Thymeleaf",
    icon: "🔄",
    title: "变量与迭代",
    content: `# 变量与迭代

## 概念解释

Thymeleaf 的变量表达式 \`\${...}\` 是最常用的表达式，在**上下文变量**（Controller 通过 \`model.addAttribute\` 传入的数据）上求值，底层使用 OGNL 或 SpringEL。选择表达式 \`*{...}\` 配合 \`th:object\` 在当前选中对象上求值，简化嵌套访问。

\`th:each\` 是迭代属性，用于遍历集合（List、Set、Map、数组、Iterable）。它的语法是 \`th:each="变量名 : \${集合}"\`，每次迭代把当前元素绑定到变量名。还能定义状态变量：\`th:each="user, stat : \${users}"\`，\`stat\` 提供 \`index\`（0-based 索引）、\`count\`（1-based 计数）、\`size\`（总数）、\`odd\`/\`even\`（奇偶行）、\`first\`/\`last\`（首尾元素）。

\`th:object\` 把表单或卡片绑定到一个命令对象，在该 DOM 子树里用 \`*{属性名}\` 直接访问，等价于 \`\${对象.属性名}\`，但写法更简洁。这在表单绑定和卡片展示中大量使用。

## 设计原理

变量表达式 \`\${...}\` 的设计参考了 JSP EL 和 OGNL，让 Java 开发者感到熟悉。求值过程：先在当前作用域查找变量，找到就返回；找不到往上层作用域找，最终找不到返回 null（不抛异常，配合 Elvis 提供默认值）。

\`th:object\` 与 \`*{}\` 选择表达式的设计体现了「作用域收敛」思想：在 \`<div th:object="\${user}">\` 子树内，\`*{name}\` 自动解析为 \`\${user.name}\`，避免重复写对象名。这比 JSP 的 \`<c:set>\` 更优雅。

\`th:each\` 的状态变量设计解决了「模板里需要行号、奇偶行高亮」这类常见需求，不用在 Controller 里预先计算。\`stat.odd\` 常用于斑马纹表格：\`th:classappend="\${stat.odd} ? 'odd-row' : ''\`。

迭代 Map 时，每次取出的元素是 \`Map.Entry\`，用 \`entry.key\` 和 \`entry.value\` 访问：\`th:each="entry : \${configMap}"\`，\`th:text="\${entry.value}"\`。

## 使用场景

- 列表展示：用户列表、商品列表、文章列表
- 表格渲染：配合状态变量做斑马纹、首尾特殊样式
- 下拉选项：遍历选项生成 \`<option>\`
- 卡片展示：配合 th:object 简化嵌套属性访问
- Map 数据展示：配置项、统计项
- 不适用：极大数据集（应分页，不要一次渲染全部）

## 代码示例

下面是覆盖变量表达式、选择表达式、迭代的完整示例：

\`\`\`html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<body>
    <h1 th:text="'共 ' + \${total} + ' 条'">用户列表</h1>

    <!-- th:each 迭代 + 状态变量 -->
    <table>
        <thead>
            <tr><th>ID</th><th>用户名</th><th>邮箱</th><th>状态</th></tr>
        </thead>
        <tbody>
            <tr th:each="user, stat : \${users}"
                th:classappend="\${stat.odd} ? 'odd' : ''">    <!-- 斑马纹 -->
                <td th:text="\${stat.count}">1</td>             <!-- 1-based 计数 -->
                <td th:text="\${user.username}">用户</td>
                <td th:text="\${user.email}">a@b.com</td>
                <td>
                    <span th:if="\${user.active}">激活</span>
                    <span th:unless="\${user.active}">未激活</span>
                </td>
                <td th:text="\${stat.first} ? '首' : ''"></td>   <!-- 首行标记 -->
            </tr>
        </tbody>
    </table>

    <!-- th:object + 选择表达式 *{} -->
    <div th:object="\${currentUser}">
        <h2 th:text="*{username}">用户名</h2>
        <p>邮箱：<span th:text="*{email}">邮箱</span></p>
        <p>城市：<span th:text="*{address.city}">城市</span></p>  <!-- 嵌套属性 -->
        <p>注册时间：<span th:text="*{{createdAt}}">2026-01-01</span></p>  <!-- 双括号格式化 -->
    </div>

    <!-- 迭代 Map -->
    <ul>
        <li th:each="entry : \${configMap}">
            <span th:text="\${entry.key}">键</span>:
            <span th:text="\${entry.value}">值</span>
        </li>
    </ul>

    <!-- 空集合处理 -->
    <p th:if="\${#lists.isEmpty(users)}">没有数据</p>

    <!-- Elvis 默认值 -->
    <p th:text="\${user.nickname} ?: '匿名'">匿名</p>
</body>
</html>
\`\`\`

逐行解析：\`th:each="user, stat : \${users}"\` 遍历 \`users\`，每项绑定到 \`user\`，状态变量 \`stat\` 提供 index/count/size/odd/even/first/last；\`th:classappend\` 追加 class（不覆盖原 class）；\`th:object="\${currentUser}"\` 在该 DOM 子树绑定 currentUser；\`th:text="*{username}"\` 选择表达式，等价于 \`\${currentUser.username}\`；\`*{address.city}\` 嵌套属性导航；\`*{{createdAt}}\` 双括号调用格式化器（按 Locale 格式化日期）；\`#lists.isEmpty()\` 是内置工具对象判断空集合；\`?:\` Elvis 运算符提供默认值。

## 对比分析

| 维度 | \${} 变量表达式 | *{} 选择表达式 |
| --- | --- | --- |
| 作用域 | 全局上下文 | th:object 作用域 |
| 简洁度 | 需写完整路径 | 简化嵌套访问 |
| 必须配合 | 无 | th:object |
| 适用 | 顶层变量 | 表单/卡片绑定对象 |

| 状态变量 | 含义 | 类型 |
| --- | --- | --- |
| index | 当前索引 | int（0-based） |
| count | 当前计数 | int（1-based） |
| size | 集合总大小 | int |
| odd/even | 是否奇偶行 | boolean |
| first/last | 是否首尾元素 | boolean |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| th:each 变量名拼错 | 渲染为空不报错 | 复制属性名，开启模板缓存便于调试 |
| *{} 不在 th:object 内 | 找不到对象返回 null | 确保在 th:object 子树内使用 |
| 迭代 Map 用 item.value | Map 迭代取的是 Entry | 用 entry.key / entry.value |
| 大集合一次渲染 | 页面卡顿、内存高 | 分页，Controller 传分页后的数据 |
| stat 变量名与迭代变量重名 | 覆盖导致异常 | stat 用不同名字 |
| 空集合没处理 | 表格只有表头 | 用 #lists.isEmpty 判断显示占位 |
| 嵌套属性访问 null 对象 | NPE 异常 | 用 Elvis 提供默认值或 Safe Navigation |
`,
  },

  // =============================================================
  // 第三十九章:条件与片段
  // =============================================================
  {
    id: "jw-39",
    group: "模板引擎 Thymeleaf",
    icon: "🧩",
    title: "条件与片段",
    content: `# 条件与片段

## 概念解释

条件渲染让模板根据数据决定显示什么。Thymeleaf 提供 \`th:if\`（条件为 true 渲染）、\`th:unless\`（与 if 相反）、\`th:switch\`/\`th:case\`（switch 分支）。条件判断里非空字符串、非零数字、非 null 对象都为 true。

真实网站的页面 90% 是重复的：导航栏、页脚、侧边栏、HTML 头部。把公共部分抽成「片段」复用，是工程化的基础。Thymeleaf 提供 \`th:fragment\` 定义片段、\`th:insert\`/\`th:replace\` 引入片段、片段参数传递等完整能力。

\`th:fragment\` 标记一个可复用的片段，可定义在任意模板文件里，常见做法集中在 \`templates/fragments/\` 目录。引入片段用片段表达式 \`~{模板路径 :: 片段名}\`，简写可省略 \`~{}\`。

## 设计原理

三种引入方式的区别在「包裹结构」：\`th:insert\` 把片段**作为子节点**插入到目标标签内，目标标签保留；\`th:replace\` 用片段**替换**目标标签（连同片段的标签一起）；\`th:include\` 把片段的**内容**插入（不要片段的根标签），**已废弃**，新版用 \`th:insert\` 替代。

片段可以带参数，类似函数调用：\`th:fragment="userCard(user, showEmail)"\`。调用时传参：\`th:replace="~{fragments/userCard :: userCard(\${user}, true)}"\`。参数可以是任意表达式，也支持命名参数（顺序无关）。

要做「整个页面继承一个布局」（像 Django 模板继承），需要 \`thymeleaf-layout-dialect\` 扩展，提供 \`layout:decorate\` 和 \`layout:fragment\` 实现布局继承。这个功能不在 Thymeleaf 核心包里，要单独引入依赖。

\`th:if\` 与 \`th:unless\` 成对出现让条件渲染更直观：要显示用 \`th:if\`，要隐藏用 \`th:unless\`，不用写否定条件。注意 \`th:if\` 必须在带闭合的元素上，写在自闭合标签（如 \`<input>\`）上不生效。

## 使用场景

- 多页面共享导航/页脚：所有网站
- 邮件模板复用头部签名：通知邮件
- 表单字段组件：表单多的项目，字段片段复用
- 卡片组件：列表项复用
- 分页条组件：传入 Page 对象复用
- 条件渲染菜单：根据用户角色显示不同菜单项
- 不适用：单页应用（前端组件已处理）

## 代码示例

下面是完整的可复用组件设计示例：

**templates/fragments/header.html**（导航栏片段）：

\`\`\`html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<body>

<!-- 导航栏片段，带参数：当前用户、当前激活菜单 -->
<nav th:fragment="header(currentUser, active)" class="navbar">
    <div class="logo">我的网站</div>
    <ul class="menu">
        <li>
            <a th:href="@{/}"
               th:classappend="\${active == 'home'} ? 'active' : ''">首页</a>
        </li>
        <li>
            <a th:href="@{/users}"
               th:classappend="\${active == 'users'} ? 'active' : ''">用户</a>
        </li>
        <!-- 条件渲染：已登录显示个人中心 -->
        <li th:if="\${currentUser != null}">
            <a th:href="@{/profile}">
               <span th:text="\${currentUser.username}">用户</span>
            </a>
        </li>
        <li th:unless="\${currentUser != null}">
            <a th:href="@{/login}">登录</a>
        </li>
    </ul>
</nav>

</body>
</html>
\`\`\`

**templates/fragments/pagination.html**（分页片段）：

\`\`\`html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<body>

<!-- 分页片段，参数：page（Page 对象）、url -->
<div th:fragment="pagination(page, url)" class="pagination"
     th:if="\${page.totalPages > 1}">    <!-- 只有 1 页不显示 -->

    <a th:href="@{\${url}(page=0)}"
       th:classappend="\${page.first} ? 'disabled'">首页</a>

    <a th:href="@{\${url}(page=\${page.number - 1})}"
       th:if="\${!page.first}">上一页</a>

    <!-- 遍历页码，只显示当前页前后 2 页 -->
    <span th:each="i : \${#numbers.sequence(0, page.totalPages - 1)}"
          th:if="\${i >= page.number - 2 and i <= page.number + 2}">
        <a th:href="@{\${url}(page=\${i})}"
           th:text="\${i + 1}"
           th:classappend="\${i == page.number} ? 'current'">1</a>
    </span>

    <a th:href="@{\${url}(page=\${page.number + 1})}"
       th:if="\${!page.last}">下一页</a>

    <span class="total">
        共 <span th:text="\${page.totalElements}">0</span> 条
    </span>
</div>

</body>
</html>
\`\`\`

**templates/user/list.html**（使用片段的页面）：

\`\`\`html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<body>
    <!-- 引入头部，传入当前用户和激活菜单 -->
    <header th:replace="~{fragments/header :: header(\${currentUser}, 'users')}"></header>

    <main>
        <h1>用户列表</h1>
        <table>
            <tr th:each="u : \${users}">
                <td th:text="\${u.id}">1</td>
                <td th:text="\${u.username}">用户</td>
            </tr>
        </table>

        <!-- 引入分页组件 -->
        <div th:replace="~{fragments/pagination :: pagination(\${page}, '/users')}"></div>
    </main>
</body>
</html>
\`\`\`

逐行解析：\`th:fragment="header(currentUser, active)"\` 片段带两个参数，调用方必须传；\`th:classappend\` 追加 class 做菜单高亮；\`th:if="\${currentUser != null}"\` 已登录才显示；\`th:if="\${page.totalPages > 1}"\` 只有 1 页不显示分页；\`#numbers.sequence(0, page.totalPages - 1)\` 内置工具生成数字序列遍历页码；\`th:replace="~{fragments/header :: header(\${currentUser}, 'users')}"\` 引入片段并传参。

## 对比分析

| 维度 | th:insert | th:replace | th:include（废弃） |
| --- | --- | --- | --- |
| 行为 | 片段插入目标内 | 替换目标 | 插入片段内容 |
| 标签保留 | 目标标签 | 都不保留 | 目标标签 |
| 当前推荐 | 是 | 是 | 否 |

| 维度 | th:if | th:unless |
| --- | --- | --- |
| 条件 | true 才渲染 | false 才渲染 |
| 等价 | 正向判断 | 否定判断 |
| 适用 | 显示满足条件的 | 隐藏满足条件的 |

| 维度 | 片段参数 | 视图模型 Model |
| --- | --- | --- |
| 传递 | 模板调用时传 | Controller 设到 Model |
| 复用 | 同一页不同地方不同参数 | 全局共享 |
| 灵活 | 高 | 中 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| th:include 还在用 | 已废弃 | 改 th:insert 或 th:replace |
| 片段路径写错 | 渲染抛错 | 路径相对 templates/，不带扩展名 |
| 参数名拼错 | 渲染为 null | 复制片段定义的参数名 |
| th:if 写在自闭合标签 | 不生效 | 必须在带闭合的元素上 |
| 片段里访问 Model 变量 | 不一定有 | 片段要的数据通过参数传入 |
| th:replace 把目标标签丢了 | 误以为保留 | 记住 replace 是替换整段 |
| 命名参数顺序错 | 位置参数必须对应 | 用命名参数更安全 |
`,
  },

  // =============================================================
  // 第四十章:表单绑定与国际化
  // =============================================================
  {
    id: "jw-40",
    group: "模板引擎 Thymeleaf",
    icon: "🌐",
    title: "表单绑定与国际化",
    content: `# 表单绑定与国际化

## 概念解释

表单是 Web 应用最常见的交互。Thymeleaf 配合 Spring MVC 提供了完整的表单对象绑定、错误显示能力，配合 JSR303 校验做到「服务端校验 + 模板回显错误」一气呵成。

\`th:object\` 把表单绑定到一个命令对象（Command Object），\`th:field\` 把 input 绑定到该对象的属性。\`th:field="*{username}"\` 会做三件事：渲染 \`name="username"\`、渲染 \`id="username"\`、渲染 \`value="\${对象.username}"\`（回显已填写的值）。\`th:field\` 用 \`*{}\` 选择表达式，配合 \`th:object\` 使用。

国际化（i18n，internationalization 缩写，i 和 n 之间 18 个字母）让应用根据用户语言显示不同文本。Spring Boot 默认配置 \`MessageSourceAutoConfiguration\`，从 \`src/main/resources/\` 下读取 \`messages.properties\` 系列文件。模板里用 \`#{key}\` 取消息。

JSR303（Bean Validation）校验注解：\`@NotBlank\`（至少一个非空白字符）、\`@NotEmpty\`（非空字符串/集合）、\`@NotNull\`（非 null）、\`@Size\`、\`@Min\`/\`@Max\`、\`@Pattern\`、\`@Email\`。Controller 加 \`@Valid\` 触发校验，错误放进紧跟其后的 \`BindingResult\`。

## 设计原理

表单绑定的设计让 Controller 与模板自动对齐：Controller 用 \`@ModelAttribute("userForm")\` 绑定表单数据到 \`userForm\` 对象，模板用 \`th:object="\${userForm}"\` 绑定同一对象，名字必须一致。\`th:field\` 自动处理回显（已填值）、选中（radio/checkbox/select）、错误样式，省去大量手写 name/value 的工作。

\`th:errors="*{username}"\` 显示某字段的全部错误，\`#fields.hasErrors('字段名')\` 判断是否有错，\`th:errorclass\` 给输入框加错误样式。校验失败时返回原表单页，Thymeleaf 自动显示错误，无需手动传错误信息。

国际化文件命名遵循 \`basename_language_country.properties\`：\`messages.properties\`（默认兜底）、\`messages_zh.properties\`（中文）、\`messages_en.properties\`（英文）。匹配规则：用户 locale 是 \`zh_CN\`，先找 \`messages_zh_CN.properties\`，找不到降级到 \`messages_zh.properties\`，再找不到用 \`messages.properties\`。

\`LocaleResolver\` 决定当前用户用什么 locale：\`AcceptHeaderLocaleResolver\`（Spring Boot 默认，根据 HTTP \`Accept-Language\` 头）、\`SessionLocaleResolver\`（存 session）、\`CookieLocaleResolver\`（存 cookie）。配合 \`LocaleChangeInterceptor\` 实现 URL 加参数切换语言：\`?lang=en\`。

## 使用场景

- 用户注册/登录表单：校验 + 错误回显
- 内容发布表单（文章、商品）：表单绑定 + 下拉选项
- 后台管理表单：增删改查
- 多语言网站：中英日韩
- 校验消息国际化：错误提示按语言显示
- 不适用：纯 API（用 @RequestBody + DTO 校验，无模板）

## 代码示例

下面是完整的注册表单 + 国际化示例：

**Command 类**（校验注解 + 国际化消息引用）：

\`\`\`java
public class RegisterForm {

    @NotBlank(message = "{username.notblank}")       // 引用 messages.properties
    @Size(min = 3, max = 20, message = "{username.size}")
    private String username;

    @NotBlank
    @Email(message = "邮箱格式不正确")
    private String email;

    @NotBlank
    @Size(min = 6, max = 50)
    private String password;

    @NotNull
    @Min(18)
    @Max(120)
    private Integer age;

    private List<String> hobbies = new ArrayList<>();   // 多选

    @NotNull
    private Long countryId;                              // 下拉选
}
\`\`\`

**Controller**：

\`\`\`java
@Controller
@RequestMapping("/register")
public class RegisterController {

    @GetMapping
    public String showForm(Model model) {
        model.addAttribute("registerForm", new RegisterForm());
        model.addAttribute("countries", countryService.findAll());   // 下拉选项
        return "register/form";
    }

    @PostMapping
    public String submit(@Valid @ModelAttribute("registerForm") RegisterForm form,
                         BindingResult result,
                         Model model) {
        // BindingResult 必须紧跟 @Valid 参数后

        // 自定义校验：用户名是否已存在
        if (!result.hasFieldErrors("username")
                && userService.existsByUsername(form.getUsername())) {
            result.rejectValue("username", "duplicate.username");
        }

        if (result.hasErrors()) {
            // 错误时下拉选项要重新放，否则页面选项丢失
            model.addAttribute("countries", countryService.findAll());
            return "register/form";        // 有错回到表单页，错误自动回显
        }

        userService.register(form);
        return "redirect:/register/success";   // PRG 模式避免重复提交
    }
}
\`\`\`

**templates/register/form.html**：

\`\`\`html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<body>
<form th:action="@{/register}" th:object="\${registerForm}" method="post">

    <!-- 用户名 + 错误显示 -->
    <div>
        <label th:text="#{login.username}">用户名</label>
        <input type="text" th:field="*{username}" th:errorclass="field-error" />
        <span th:if="\${#fields.hasErrors('username')}"
              th:errors="*{username}" class="error">用户名错误</span>
    </div>

    <!-- 邮箱 -->
    <div>
        <label>邮箱</label>
        <input type="email" th:field="*{email}" th:errorclass="field-error" />
        <span th:errors="*{email}" class="error">邮箱错误</span>
    </div>

    <!-- 多选 checkbox -->
    <div>
        <label>爱好</label>
        <label><input type="checkbox" th:field="*{hobbies}" value="阅读" /> 阅读</label>
        <label><input type="checkbox" th:field="*{hobbies}" value="运动" /> 运动</label>
    </div>

    <!-- 下拉 select -->
    <div>
        <label>国家</label>
        <select th:field="*{countryId}">
            <option value="">请选择</option>
            <option th:each="c : \${countries}"
                    th:value="\${c.id}"
                    th:text="\${c.name}">国家名</option>
        </select>
    </div>

    <button type="submit">注册</button>
</form>
</body>
</html>
\`\`\`

**国际化配置 + 消息文件**：

\`\`\`properties
# application.properties
spring.messages.basename=messages,errors
spring.messages.encoding=UTF-8
spring.messages.fallback-to-system-locale=false
spring.messages.use-code-as-default-message=true
\`\`\`

\`\`\`properties
# messages_zh.properties
username.notblank=用户名不能为空
username.size=用户名长度必须在 {min}-{max} 之间
login.username=用户名
welcome.user=欢迎你，{0}
\`\`\`

\`\`\`properties
# messages_en.properties
username.notblank=Username cannot be empty
username.size=Username must be between {min} and {max}
login.username=Username
welcome.user=Welcome, {0}
\`\`\`

\`\`\`html
<!-- 模板里使用国际化 -->
<h1 th:text="#{welcome.user(\${user.username})}">欢迎</h1>
<label th:text="#{login.username}">用户名</label>
\`\`\`

逐行解析：\`@Valid @ModelAttribute("registerForm")\` 触发校验并绑定到 \`registerForm\`（名字与 \`th:object\` 一致）；\`BindingResult\` 必须紧跟 \`@Valid\` 参数后，否则 Spring 不会注入而是抛异常；\`th:field="*{username}"\` 自动渲染 name/id/value；\`th:errorclass="field-error"\` 字段有错时给 input 加 class；\`th:errors="*{username}"\` 输出该字段所有错误；\`th:each="c : \${countries}"\` 下拉选项遍历；\`th:field="*{countryId}"\` Spring 根据表单提交的 countryId 自动选中对应 option；\`#{welcome.user(\${user.username})}\` 带参数的消息，\`{0}\` 被替换成用户名。

## 对比分析

| 维度 | @ModelAttribute | @RequestBody |
| --- | --- | --- |
| 提交格式 | 表单（form-urlencoded） | JSON |
| 模板配合 | Thymeleaf 表单 | 不配合，纯 API |
| 适用 | SSR 服务端渲染 | 前后端分离 |
| 文件上传 | 支持（multipart） | 不支持（要 multipart） |

| 维度 | @NotBlank | @NotEmpty | @NotNull |
| --- | --- | --- | --- |
| 检查对象 | 字符串 | 字符串/集合 | 任意 |
| 接受空字符串 | 否 | 否 | 是 |
| 接受空白字符串 | 否 | 是 | 是 |

| 维度 | AcceptHeader | Session | Cookie |
| --- | --- | --- | --- |
| 来源 | 浏览器 Accept-Language | session | cookie |
| 用户切换 | 改浏览器设置 | URL 加 ?lang | URL 加 ?lang |
| 跨 session | 是 | 否 | 是 |
| 推荐 | 默认场景 | 已登录用户 | 持久偏好 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| BindingResult 位置错 | 必须 @Valid 后 | 紧跟 @Valid 参数后 |
| th:object 与 @ModelAttribute 名字不符 | 绑定失败 | 名字一致 |
| 直接拿实体接收表单 | 字段被恶意绑定（id、role） | 用独立 Command 类 |
| 错误消息硬编码 | 无法国际化 | 写到 messages.properties |
| 下拉错误时选项消失 | 错误回原页没重设 countries | 错误分支重新 model.addAttribute |
| @NotBlank 用在 Integer | 类型不匹配 | Integer 用 @NotNull |
| th:field 与手动 value 冲突 | th:field 会覆盖 | 只用 th:field |
| 多选 checkboxes 绑 List<String> | 集合类型错 | 确保是 List/数组 |
| 中文 properties 乱码 | 默认 ISO-8859-1 编码 | 配 spring.messages.encoding=UTF-8 |
| 切语言没反应 | 没配 LocaleChangeInterceptor | 加拦截器 + 设 paramName |
`,
  },
];
