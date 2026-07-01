// =============================================================
// Java Web 应用开发实战教程 —— 第十批章节（模板引擎 Thymeleaf 组，共 4 章）
// 章节 37-40:Thymeleaf 基础语法 / 布局与片段 /
//          表单绑定与验证 / 国际化与静态资源
// =============================================================

export const chapters = [
  // =============================================================
  // 第三十七章:Thymeleaf 基础语法
  // =============================================================
  {
    id: "jw-37",
    group: "模板引擎 Thymeleaf",
    icon: "🎨",
    title: "Thymeleaf 基础语法",
    content: `# Thymeleaf 基础语法

## 概念讲解

Thymeleaf 是现代化的 Java 服务端模板引擎，定位是「让模板可以**自然地**被浏览器打开预览」。这与 JSP、FreeMarker 的最大区别：JSP 必须经过 Servlet 容器渲染才能看，Thymeleaf 写的 HTML 直接用浏览器打开就能看（虽然只是静态预览，但设计师能直接调样式）。

### 设计理念：自然模板

Thymeleaf 把所有动态指令都放在 HTML 的**属性**里（\`th:text\`、\`th:if\`、\`th:each\`），而**不**像 JSP 那样用 \`<% %>\` 或 \`<c:forEach>\` 这种专属标签。这样模板本身就是合法的 HTML，浏览器忽略不认识的 \`th:\` 属性，照常显示静态内容。

例如：

\`\`\`html
<p th:text="\${user.name}">张三（占位文字）</p>
\`\`\`

浏览器直接打开看到的是「张三（占位文字）」，Spring 渲染后是真实用户名。**设计师拿静态原型调样式，后端把 th: 属性填值**，两边不冲突。

### 命名空间

使用 Thymeleaf 必须在根元素声明命名空间：

\`\`\`html
<html xmlns:th="http://www.thymeleaf.org">
\`\`\`

这只是声明，浏览器看到陌生的 \`th:\` 也不会报错，浏览器宽容地忽略未知属性。

### th:text 与 th:utext

- \`th:text\` —— 设置元素文本内容，**自动 HTML 转义**，防 XSS（默认行为）。最常用。
- \`th:utext\` —— unescaped，不转义。仅在内容是可信 HTML 时使用，否则有 XSS 风险。

\`\`\`html
<p th:text="\${user.bio}">默认简介</p>
<div th:utext="\${article.htmlContent}"></div>
\`\`\`

### 条件渲染

- \`th:if\` —— 条件为 true 时渲染元素
- \`th:unless\` —— 条件为 false 时渲染（与 if 相反）
- \`th:switch\` / \`th:case\` —— switch 语句

\`\`\`html
<span th:if="\${user.admin}">管理员</span>
<span th:unless="\${user.admin}">普通用户</span>

<div th:switch="\${user.level}">
  <p th:case="'A'">高级</p>
  <p th:case="'B'">中级</p>
  <p th:case="*">其他</p>      <!-- 默认 -->
</div>
\`\`\`

注意条件判断里非空字符串、非零数字、非 null 对象都为 true。

### 字面值与运算符

**字面值**：

- 文本：\`'文字'\`（单引号）
- 数字：\`123\`、\`3.14\`
- 布尔：\`true\`、\`false\`
- null：\`null\`

**运算符**：

- 算术：\`+\`、\`-\`、\`*\`、\`/\`、\`%\`
- 比较：\`gt\` (\`>\`)、\`lt\` (\`<\`)、\`ge\` (\`>=\`)、\`le\` (\`<=\`) —— 用文字形式避免与 HTML 标签冲突
- 相等：\`eq\` (\`==\`)、\`neq\` (\`!=\`)
- 逻辑：\`and\`、\`or\`、\`!\` 或 \`not\`
- 三元：\`cond ? then : else\`，还有 Elvis 运算符 \`?:\`（提供默认值）

\`\`\`html
<span th:text="\${user.age >= 18} ? '成年' : '未成年'"></span>
<span th:text="\${user.nickname} ?: '匿名'"></span>
\`\`\`

\`?:\` 是 Elvis：左边为 null 时取右边，简化默认值写法。

### URL 表达式 @{}

\`@{...}\` 用于生成 URL，自动处理上下文路径：

\`\`\`html
<a th:href="@{/users/{id}(id=\${user.id})}">详情</a>
<!-- 渲染为 /myapp/users/123 -->
\`\`\`

- 不带参数：\`@{/login}\`
- 路径变量：\`@{/users/{id}(id=\${user.id})}\`
- 查询参数：\`@{/search(q=\${keyword}, page=\${page})}\`
- 自动加上应用上下文路径（\`server.servlet.context-path\`）

### 消息表达式 #{} (国际化)

\`#{key}\` 从消息源（\`messages.properties\`）取国际化文本：

\`\`\`html
<h1 th:text="#{welcome.title}">Welcome</h1>
\`\`\`

支持参数：\`#{user.welcome(\${user.name})}\`，对应 \`user.welcome=欢迎你，{0}\`。下一章详讲。

### 变量表达式 ${} 与选择表达式 *{}

\`\${...}\` 是最常用的表达式，在**上下文变量**上求值（OGNL 或 SpringEL）。

\`*{...}\` 是**选择表达式**，配合 \`th:object\` 在当前选中对象上求值，简化嵌套访问：

\`\`\`html
<div th:object="\${user}">
  <p th:text="*{name}"></p>      <!-- 等价于 \${user.name} -->
  <p th:text="*{email}"></p>
  <p th:text="*{address.city}"></p>
</div>
\`\`\`

\`*{}\` 写法更简洁，但只在 \`th:object\` 作用范围内有效。

## 设计原则

1. **优先用 th:text 而非 th:utext**：默认安全转义防 XSS，除非确定内容可信。
2. **保留静态占位文字**：每个 \`th:text\` 元素里写默认文字，方便原型预览。
3. **复杂数据用选择表达式 \*{}**：在 \`th:object\` 作用域里少打字、更清晰。
4. **链接用 @{}**：不要手写 \`/myapp/users\`，框架会自动加上下文路径。
5. **避免在模板里写业务逻辑**：复杂运算放 Controller，模板只做展示。

## 使用场景

- 服务端渲染页面（SSR）：管理后台、内容站
- 邮件模板：Thymeleaf 渲染 HTML 邮件
- 静态文档生成：把数据填进模板生成 HTML 文档
- 不适用：前后端分离项目（用 Vue/React）、纯 API 后端

## 代码逐行讲解

下面是完整示例模板，覆盖各种语法：

\`\`\`html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">     <!-- 命名空间声明 -->
<head>
    <meta charset="UTF-8">
    <title th:text="#{page.title}">默认标题</title>  <!-- 国际化 -->
</head>
<body>
    <!-- 变量 + 转义 -->
    <h1 th:text="'用户列表：' + \${total}">用户列表</h1>

    <!-- 条件渲染 -->
    <p th:if="\${total == 0}">暂无用户</p>
    <p th:unless="\${total == 0}">共 <span th:text="\${total}">0</span> 人</p>

    <!-- 循环 th:each -->
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>用户名</th>
                <th>邮箱</th>
                <th>状态</th>
            </tr>
        </thead>
        <tbody>
            <tr th:each="user, stat : \${users}">          <!-- stat 是状态变量 -->
                <td th:text="\${user.id}">1</td>
                <td th:text="\${user.username}">user</td>
                <td th:text="\${user.email}">a@b.com</td>
                <td>
                    <span th:if="\${user.active}"
                          th:text="'激活'">激活</span>
                    <span th:unless="\${user.active}"
                          th:text="'未激活'">未激活</span>
                </td>
                <td th:text="\${stat.index}">0</td>        <!-- 当前索引 0-based -->
                <td th:text="\${stat.count}">1</td>        <!-- 计数 1-based -->
                <td th:text="\${stat.size}">10</td>        <!-- 总数 -->
                <td th:text="\${stat.odd} ? '奇' : '偶'">奇</td>   <!-- 是否奇数行 -->
            </tr>
        </tbody>
    </table>

    <!-- URL 表达式 -->
    <a th:href="@{/users/{id}(id=\${user.id})}">详情</a>
    <a th:href="@{/search(q=\${keyword})}">搜索</a>

    <!-- 选择表达式 -->
    <div th:object="\${currentUser}">
        <p>姓名：<span th:text="*{username}">用户名</span></p>
        <p>邮箱：<span th:text="*{email}">邮箱</span></p>
        <p>城市：<span th:text="*{address.city}">城市</span></p>
    </div>

    <!-- Elvis 运算符 -->
    <p th:text="\${user.nickname} ?: '匿名用户'">匿名</p>

    <!-- switch -->
    <div th:switch="\${user.level}">
        <p th:case="'A'">高级会员</p>
        <p th:case="'B'">中级会员</p>
        <p th:case="*">普通会员</p>
    </div>
</body>
</html>
\`\`\`

逐行解析：

- \`xmlns:th="http://www.thymeleaf.org"\` —— Thymeleaf 命名空间声明，浏览器忽略 \`th:\` 属性。
- \`th:text="#{page.title}"\` —— 取国际化消息 \`page.title\`。
- \`th:text="'用户列表：' + \${total}"\` —— 文本字面值 + 变量拼接。\`+\` 是字符串连接。
- \`th:if="\${total == 0}"\` —— 表达式为 true 才渲染该元素。
- \`th:unless="\${total == 0}"\` —— 与 if 相反。
- \`th:each="user, stat : \${users}"\` —— 遍历 \`users\`，每项绑定到 \`user\`，状态变量 \`stat\` 提供 \`index\`、\`count\`、\`size\`、\`odd\`、\`even\`、\`first\`、\`last\`。
- \`th:text="\${user.id}"\` —— 输出属性值。
- \`th:href="@{/users/{id}(id=\${user.id})}"\` —— URL 表达式，路径变量插值。
- \`th:object="\${currentUser}"\` —— 在该 DOM 子树里绑定 \`currentUser\` 为当前对象。
- \`th:text="*{username}"\` —— 选择表达式，等价于 \`\${currentUser.username}\`。
- \`th:text="\${user.nickname} ?: '匿名用户'"\` —— Elvis 运算符，nickname 为 null 时取默认值。
- \`th:case="*"\` —— switch 的默认分支。

Controller 配套：

\`\`\`java
@Controller
public class UserController {

    @GetMapping("/users")
    public String list(Model model) {
        List<User> users = userService.findAll();
        model.addAttribute("users", users);
        model.addAttribute("total", users.size());
        model.addAttribute("currentUser", users.get(0));
        model.addAttribute("keyword", "thymeleaf");
        return "user/list";    // 模板路径 templates/user/list.html
    }
}
\`\`\`

注意：\`return\` 的字符串是视图名，Thymeleaf 默认从 \`src/main/resources/templates/\` 下找 \`{name}.html\`。

## 对比

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

| 维度 | ${} 变量表达式 | *{} 选择表达式 |
| --- | --- | --- |
| 作用域 | 全局上下文 | th:object 作用域 |
| 简洁度 | 需写完整路径 | 简化嵌套访问 |
| 必须配合 | 无 | th:object |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| 忘记声明 xmlns:th | IDE 报错或部分功能失效 | html 根元素加命名空间 |
| th:utext 输出用户输入 | XSS 风险 | 默认用 th:text，确信可信才 utext |
| th:each 用错变量名 | 拼错不报错，渲染空 | 复制属性名，开启模板缓存便于调试 |
| 比较运算符用 > | HTML 解析冲突 | 用 gt/lt/ge/le |
| URL 写死上下文路径 | 改部署路径全失效 | 用 @{} 表达式 |
| th:if 写在自闭合标签 | 不生效 | th:if 必须在带闭合的元素上 |
| 静态文字与动态值差距大 | 设计师看到的预览失真 | 占位文字尽量贴近真实数据 |
| EL 表达式调用方法有副作用 | 模板被多次求值 | 模板只读，副作用放 Controller |
`,
  },

  // =============================================================
  // 第三十八章:Thymeleaf 布局与片段
  // =============================================================
  {
    id: "jw-38",
    group: "模板引擎 Thymeleaf",
    icon: "🎨",
    title: "Thymeleaf 布局与片段",
    content: `# Thymeleaf 布局与片段

## 概念讲解

真实网站的页面 90% 是重复的：导航栏、页脚、侧边栏、HTML 头部。把公共部分抽成「片段」复用，是工程化的基础。Thymeleaf 提供了片段定义、引入、参数传递等完整能力。

### th:fragment 定义片段

用 \`th:fragment\` 在模板里标记一个可复用的片段：

\`\`\`html
<footer th:fragment="copy">
  © 2026 我的公司
</footer>
\`\`\`

\`copy\` 是片段名。可以定义在任意模板文件里，常见做法是集中在 \`templates/fragments/\` 目录。

### th:insert / th:replace / th:include 引入片段

三种引入方式，区别在「包裹结构」：

- **\`th:insert\`**：把片段**作为子节点**插入到目标标签内。目标标签保留。
- **\`th:replace\`**：用片段**替换**目标标签（连同片段的标签一起）。
- **\`th:include\`**：把片段的**内容**插入（不要片段的根标签）。**已废弃**，新版用 \`th:insert\` + \`th:fragment\` 不带标签的写法。

\`\`\`html
<!-- 假设 fragments/footer.html 里定义了 <footer th:fragment="copy"> -->

<div th:insert="~{fragments/footer :: copy}"></div>
<!-- 渲染：<div><footer>© 2026</footer></div> -->

<div th:replace="~{fragments/footer :: copy}"></div>
<!-- 渲染：<footer>© 2026</footer>，div 被替换 -->

<div th:include="~{fragments/footer :: copy}"></div>
<!-- 渲染：<div>© 2026</div>，footer 标签被剥离（已废弃） -->
\`\`\`

语法 \`~{模板路径 :: 片段名}\` 是片段表达式：

- \`~{fragments/footer :: copy}\` —— \`templates/fragments/footer.html\` 里的 \`copy\` 片段
- \`~{:: copy}\` —— 同模板内的 \`copy\` 片段
- \`~{fragments/footer}\` —— 整个 footer.html 模板

简写：\`th:insert="fragments/footer :: copy"\`（不带 \`~{}\`），表达式上下文会自动识别。

### 片段参数传递

片段可以带参数，类似函数调用：

\`\`\`html
<!-- 定义带参数的片段 -->
<div th:fragment="userCard(user, showEmail)">
    <div class="card">
        <h3 th:text="\${user.username}">用户名</h3>
        <p th:if="\${showEmail}" th:text="\${user.email}">邮箱</p>
    </div>
</div>

<!-- 调用并传参 -->
<div th:replace="~{fragments/userCard :: userCard(\${user}, true)}"></div>
\`\`\`

参数可以是任意表达式，也可以用命名参数：

\`\`\`html
<div th:replace="~{fragments/userCard :: userCard(showEmail=false, user=\${user})}"></div>
\`\`\`

### 布局装饰器 th:decorate

要做「整个页面继承一个布局」这种事（像 Django 模板继承、Rails layout），需要 \`thymeleaf-layout-dialect\` 这个扩展。它提供 \`layout:decorate\` 和 \`layout:fragment\` 实现真正的布局继承。

布局模板 \`layout/default.html\`：

\`\`\`html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout">
<head>
    <title layout:title-pattern="$LAYOUT_TITLE - $CONTENT_TITLE">默认标题</title>
</head>
<body>
    <nav>导航栏</nav>
    <main layout:fragment="content">
        <!-- 子页面会填充这里 -->
    </main>
    <footer>页脚</footer>
</body>
</html>
\`\`\`

子页面 \`user/list.html\`：

\`\`\`html
<html layout:decorate="~{layout/default}">
<body>
    <section layout:fragment="content">
        <h1>用户列表</h1>
        <!-- 具体内容 -->
    </section>
</body>
</html>
\`\`\`

子页面声明 \`layout:decorate="~{layout/default}"\` 表示「我要装饰 default 布局」，然后用 \`layout:fragment="content"\` 标记自己要填充到布局的哪个 slot。

注意：这个功能不在 Thymeleaf 核心包里，要单独引入 \`nz.net.ultraq.thymeleaf:thymeleaf-layout-dialect\` 依赖。

### 可复用组件设计

把高频复用的 UI 片段抽成独立片段，配合参数，就是组件化思路：

- 导航栏：根据当前用户渲染菜单
- 分页条：传入总页数、当前页
- 卡片：传入用户对象
- 表单字段：传入字段名、错误信息

这种做法让模板保持 DRY，修改一处所有页面跟着变。

### 导航栏 / 页脚抽取

典型项目结构：

\`\`\`
templates/
├── layout/
│   └── default.html           # 主布局
├── fragments/
│   ├── header.html            # 头部导航
│   ├── footer.html            # 页脚
│   ├── sidebar.html           # 侧边栏
│   └── pagination.html        # 分页组件
├── user/
│   ├── list.html              # 用户列表
│   └── detail.html            # 用户详情
└── index.html
\`\`\`

## 设计原则

1. **片段集中放 fragments/ 目录**：清晰、好维护。
2. **片段参数化**：不要硬编码，让片段可复用。
3. **布局用 layout-dialect**：完整页面继承比 th:insert 拼凑清晰。
4. **片段不要太碎**：太碎模板调用链太长反而难懂，按组件粒度划分。
5. **不传业务逻辑**：片段只做展示，业务逻辑在 Controller 算好。

## 使用场景

- 多页面共享导航/页脚：所有网站
- 邮件模板复用头部签名：通知邮件
- 表单字段组件：表单多的项目
- 卡片组件：列表项复用
- 不适用：单页应用（前端组件已处理）

## 代码逐行讲解

下面是完整的可复用组件设计示例：

**templates/fragments/header.html**：

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
        <li th:if="\${currentUser != null}">
            <a th:href="@{/profile}"
               th:classappend="\${active == 'profile'} ? 'active' : ''">
               <span th:text="\${currentUser.username}">用户</span>
            </a>
        </li>
        <li th:if="\${currentUser == null}">
            <a th:href="@{/login}">登录</a>
        </li>
    </ul>
</nav>

</body>
</html>
\`\`\`

**templates/fragments/pagination.html**：

\`\`\`html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<body>

<!-- 分页片段，参数：page（Spring Data Page 对象）、url -->
<div th:fragment="pagination(page, url)" class="pagination"
     th:if="\${page.totalPages > 1}">

    <a th:href="@{\${url}(page=0)}"
       th:classappend="\${page.first} ? 'disabled'">首页</a>

    <a th:href="@{\${url}(page=\${page.number - 1})}"
       th:if="\${!page.first}">上一页</a>

    <span th:each="i : \${#numbers.sequence(0, page.totalPages - 1)}"
          th:if="\${i >= page.number - 2 and i <= page.number + 2}">
        <a th:href="@{\${url}(page=\${i})}"
           th:text="\${i + 1}"
           th:classappend="\${i == page.number} ? 'current'">1</a>
    </span>

    <a th:href="@{\${url}(page=\${page.number + 1})}"
       th:if="\${!page.last}">下一页</a>

    <a th:href="@{\${url}(page=\${page.totalPages - 1})}"
       th:classappend="\${page.last} ? 'disabled'">末页</a>

    <span class="total">
        共 <span th:text="\${page.totalElements}">0</span> 条
    </span>
</div>

</body>
</html>
\`\`\`

**templates/layout/default.html**（主布局）：

\`\`\`html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout">
<head>
    <meta charset="UTF-8">
    <title layout:title-pattern="$LAYOUT_TITLE - $CONTENT_TITLE">我的网站</title>
    <link rel="stylesheet" th:href="@{/css/app.css}">
</head>
<body>
    <!-- 引入头部，传入当前用户和激活菜单 -->
    <header th:replace="~{fragments/header :: header(\${currentUser}, 'home')}"></header>

    <main layout:fragment="content">
        <!-- 子页面填充这里 -->
    </main>

    <!-- 引入页脚 -->
    <footer th:replace="~{fragments/footer :: footer}"></footer>

    <script th:src="@{/js/app.js}"></script>
    <th:block layout:fragment="scripts"></th:block>   <!-- 子页面额外脚本槽 -->
</body>
</html>
\`\`\`

**templates/user/list.html**（子页面，使用布局）：

\`\`\`html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout"
      layout:decorate="~{layout/default}">
<head>
    <title>用户列表</title>
</head>
<body>
    <section layout:fragment="content">
        <h1>用户列表</h1>
        <table>
            <tr th:each="u : \${users}">
                <td th:text="\${u.id}">1</td>
                <td th:text="\${u.username}">用户</td>
            </tr>
        </table>

        <!-- 引入分页组件 -->
        <div th:replace="~{fragments/pagination :: pagination(\${page}, '/users')}"></div>
    </section>

    <!-- 额外脚本 -->
    <th:block layout:fragment="scripts">
        <script th:src="@{/js/user-list.js}"></script>
    </th:block>
</body>
</html>
\`\`\`

逐行解析：

- \`th:fragment="header(currentUser, active)"\` —— 片段带两个参数，调用方必须传。这是把片段「函数化」的关键。
- \`th:classappend="\${active == 'home'} ? 'active' : ''"\` —— \`th:classappend\` 是追加 class（不覆盖原 class），三元判断当前菜单高亮。
- \`th:if="\${currentUser != null}"\` —— 已登录才显示个人中心链接。
- \`th:if="\${page.totalPages > 1}"\` —— 只有 1 页不显示分页条。
- \`th:href="@{\${url}(page=\${page.number - 1})}"\` —— URL 表达式里 \`\${url}\` 是动态 URL，再加查询参数 page。
- \`#numbers.sequence(0, page.totalPages - 1)\` —— Thymeleaf 内置 \`#numbers\` 工具对象，生成数字序列用于遍历页码。
- \`th:if="\${i >= page.number - 2 and i <= page.number + 2}"\` —— 只显示当前页前后 2 页，避免页码太多。
- \`layout:decorate="~{layout/default}"\` —— 子页面声明使用 \`default\` 布局。
- \`<section layout:fragment="content">\` —— 子页面用 \`layout:fragment\` 标记填充哪个 slot。
- \`<th:block layout:fragment="scripts">\` —— \`th:block\` 是不渲染任何标签的容器，常用于这种「只需要逻辑分组」的场景。

## 对比

| 维度 | th:insert | th:replace | th:include（废弃） |
| --- | --- | --- | --- |
| 行为 | 片段插入目标内 | 替换目标 | 插入片段内容 |
| 标签保留 | 目标标签 | 都不保留 | 目标标签 |
| 当前推荐 | 是 | 是 | 否 |

| 维度 | th:insert 拼装 | layout-dialect 继承 |
| --- | --- | --- |
| 写法 | 每页手动 insert 各片段 | 子页面声明 decorate 一次 |
| 结构 | 模板散乱 | 清晰，像面向对象继承 |
| 依赖 | 无 | 需 thymeleaf-layout-dialect |
| 推荐 | 简单页面 | 多页面项目 |

| 维度 | 片段参数 | 视图模型 Model |
| --- | --- | --- |
| 传递 | 模板调用时传 | Controller 设到 Model |
| 复用 | 同一页不同地方不同参数 | 全局共享 |
| 灵活 | 高 | 中 |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| th:include 还在用 | 已废弃 | 改 th:insert 或 th:replace |
| 片段路径写错 | 渲染抛错 | 路径相对 templates/，不带扩展名 |
| 参数名拼错 | 渲染为 null | 复制片段定义的参数名 |
| layout-dialect 没引入 | layout: 命名空间失效 | pom.xml 加依赖 |
| 片段里访问 Model 变量 | 不一定有 | 片段要的数据通过参数传入 |
| th:replace 把目标标签丢了 | 误以为保留 | 记住 replace 是替换整段 |
| 命名参数顺序错 | 位置参数必须对应 | 用命名参数更安全 |
| 子页面忘了 layout:fragment | 内容不显示 | 必须用 fragment 标记填充槽 |
`,
  },

  // =============================================================
  // 第三十九章:表单绑定与验证
  // =============================================================
  {
    id: "jw-39",
    group: "模板引擎 Thymeleaf",
    icon: "🎨",
    title: "表单绑定与验证",
    content: `# 表单绑定与验证

## 概念讲解

表单是 Web 应用最常见的交互。Thymeleaf 配合 Spring MVC 提供了完整的表单对象绑定、错误显示、表单元素渲染能力，配合 JSR303 校验做到「服务端校验 + 模板回显错误」一气呵成。

### th:object 与 th:field 表单对象绑定

\`th:object\` 把表单绑定到一个命令对象（Command Object / Form Backing Bean），\`th:field\` 则把 input 绑定到该对象的属性。

\`\`\`html
<form th:action="@{/users}" th:object="\${userForm}" method="post">
    <input type="text" th:field="*{username}" />
    <input type="email" th:field="*{email}" />
    <button type="submit">提交</button>
</form>
\`\`\`

\`th:field="*{username}"\` 会做三件事：

1. 渲染 \`name="username"\`（提交时 Spring 能按属性名绑定）
2. 渲染 \`id="username"\`
3. 渲染 \`value="\${userForm.username}"\`（回显已填写的值）

注意 \`th:field\` 用的是 \`*{}\` 选择表达式，配合 \`th:object\` 使用。

### Controller 配套

\`\`\`java
@GetMapping("/users/new")
public String showForm(Model model) {
    model.addAttribute("userForm", new UserForm());
    return "user/form";
}

@PostMapping("/users")
public String submit(@Valid @ModelAttribute("userForm") UserForm form,
                     BindingResult result) {
    if (result.hasErrors()) {
        return "user/form";        // 有错回到表单页，错误会自动回显
    }
    userService.save(form);
    return "redirect:/users";
}
\`\`\`

关键点：

- \`@ModelAttribute("userForm")\` —— 把表单数据绑定到 \`userForm\` 对象，名字要与模板 \`th:object\` 一致。
- \`@Valid\` —— 触发 JSR303 校验。
- \`BindingResult\` —— 校验结果，必须紧跟在 \`@Valid\` 参数后。
- 有错就返回原表单页，Thymeleaf 自动显示错误。

### th:errors 错误显示

\`th:errors="*{username}"\` 显示某字段的全部错误：

\`\`\`html
<input type="text" th:field="*{username}" />
<span th:if="\${#fields.hasErrors('username')}"
      th:errors="*{username}"
      class="error">用户名错误</span>
\`\`\`

\`#fields\` 是 Thymeleaf 内置工具对象，提供：

- \`#fields.hasErrors('字段名')\` —— 该字段是否有错
- \`#fields.errors('字段名')\` —— 该字段错误列表
- \`#fields.hasAnyErrors()\` —— 是否有任何错
- \`#fields.allErrors()\` —— 全部错误

也可用 \`th:errorclass\` 给输入框加错误样式：

\`\`\`html
<input type="text" th:field="*{username}" th:errorclass="invalid" />
\`\`\`

### 表单元素

**复选框**：

\`\`\`html
<input type="checkbox" th:field="*{hobbies}" th:value="阅读" /> 阅读
<input type="checkbox" th:field="*{hobbies}" th:value="运动" /> 运动
\`\`\`

\`th:field\` 用于 checkbox 时会自动判断当前值是否在 \`hobbies\` 集合里，是的就 \`checked\`。

**单选按钮**：

\`\`\`html
<input type="radio" th:field="*{gender}" th:value="M" /> 男
<input type="radio" th:field="*{gender}" th:value="F" /> 女
\`\`\`

**下拉框 th:select**：

\`\`\`html
<select th:field="*{countryId}">
    <option th:each="c : \${countries}"
            th:value="\${c.id}"
            th:text="\${c.name}">国家</option>
</select>
\`\`\`

\`th:field\` 会根据 \`countryId\` 的值自动选中对应的 option。

**th:checked / th:selected**：手动控制选中状态，通常 \`th:field\` 已处理，少用。

### @RequestBody 与表单

注意区分：

- 表单提交（HTML form）—— Spring 用 \`@ModelAttribute\` 绑定，Thymeleaf 渲染。
- JSON 提交（前端 fetch/Axios）—— Spring 用 \`@RequestBody\` 绑定，Thymeleaf 不参与。

\`@RequestBody\` 主要用于 RESTful API（下一组详讲），传统服务端渲染表单用 \`@ModelAttribute\`。

### JSR303 校验 + 自定义校验注解

JSR303（Bean Validation）定义了一组校验注解：

- \`@NotNull\` —— 非 null
- \`@NotEmpty\` —— 非空字符串/集合
- \`@NotBlank\` —— 至少一个非空白字符
- \`@Size(min, max)\` —— 长度
- \`@Min\`、\`@Max\` —— 数值范围
- \`@Pattern(regexp)\` —— 正则
- \`@Email\` —— 邮箱格式
- \`@Past\`、\`@Future\` —— 时间

写在 Command 类字段上：

\`\`\`java
public class UserForm {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 20, message = "用户名长度必须在 3-20 之间")
    private String username;

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;

    @NotNull(message = "年龄不能为空")
    @Min(value = 18, message = "必须年满 18 岁")
    private Integer age;
}
\`\`\`

Controller 加 \`@Valid\` 触发校验，错误放进 \`BindingResult\`。

**自定义校验注解**：内置注解不够用时，写自己的。例如校验手机号：

\`\`\`java
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PhoneValidator.class)
public @interface Phone {
    String message() default "手机号格式不正确";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class PhoneValidator implements ConstraintValidator<Phone, String> {
    private static final Pattern P = Pattern.compile("^1[3-9]\\\\d{9}$");

    @Override
    public boolean isValid(String value, ConstraintValidatorContext ctx) {
        if (value == null) return true;     // null 交给 @NotNull 处理
        return P.matcher(value).matches();
    }
}
\`\`\`

使用：

\`\`\`java
@Phone
private String phone;
\`\`\`

## 设计原则

1. **Command 对象与实体分离**：不要直接拿数据库实体接收表单，避免恶意字段被自动绑定（如 id、role）。
2. **校验在 Command 类上做**：保持实体干净。
3. **错误消息国际化**：消息写在 \`messages.properties\`，不在注解里硬编码。
4. **\`th:field\` 优于手动 name/value**：自动处理选中、回显，省事。
5. **PRG 模式**：提交成功后 redirect 而非 forward，避免刷新重复提交。

## 使用场景

- 用户注册/登录表单
- 内容发布表单（文章、商品）
- 后台管理表单（增删改查）
- 多步骤表单（向导）
- 不适用：纯 API（用 @RequestBody + DTO 校验）

## 代码逐行讲解

下面是完整的注册表单示例：

**Command 类**：

\`\`\`java
package com.example.form;

import jakarta.validation.constraints.*;
import com.example.validator.Phone;     // 自定义注解

public class RegisterForm {

    @NotBlank(message = "{username.notblank}")       // 国际化消息
    @Size(min = 3, max = 20, message = "{username.size}")
    private String username;

    @NotBlank
    @Email(message = "邮箱格式不正确")
    private String email;

    @NotBlank
    @Size(min = 6, max = 50)
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\\\d).+$",
             message = "密码必须包含字母和数字")
    private String password;

    @Phone                                              // 自定义校验
    private String phone;

    @NotNull
    @Min(18)
    @Max(120)
    private Integer age;

    @NotNull
    private String gender;

    private List<String> hobbies = new ArrayList<>();   // 多选

    @NotNull
    private Long countryId;                              // 下拉选

    // getter / setter 省略
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
        // 自定义校验：用户名是否已存在
        if (!result.hasFieldErrors("username")
                && userService.existsByUsername(form.getUsername())) {
            result.rejectValue("username", "duplicate.username");
        }

        if (result.hasErrors()) {
            // 错误时下拉选项要重新放，否则页面选项丢失
            model.addAttribute("countries", countryService.findAll());
            return "register/form";
        }

        userService.register(form);
        return "redirect:/register/success";
    }
}
\`\`\`

**templates/register/form.html**：

\`\`\`html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<body>
<h1>用户注册</h1>

<!-- 全局错误显示 -->
<div th:if="\${#fields.hasGlobalErrors()}" class="global-errors">
    <p th:each="err : \${#fields.globalErrors()}" th:text="\${err}">全局错误</p>
</div>

<form th:action="@{/register}" th:object="\${registerForm}" method="post">

    <!-- 用户名 -->
    <div>
        <label>用户名</label>
        <input type="text" th:field="*{username}"
               th:errorclass="field-error" />
        <span th:if="\${#fields.hasErrors('username')}"
              th:errors="*{username}" class="error">用户名错误</span>
    </div>

    <!-- 邮箱 -->
    <div>
        <label>邮箱</label>
        <input type="email" th:field="*{email}" th:errorclass="field-error" />
        <span th:errors="*{email}" class="error">邮箱错误</span>
    </div>

    <!-- 密码 -->
    <div>
        <label>密码</label>
        <input type="password" th:field="*{password}" th:errorclass="field-error" />
        <span th:errors="*{password}" class="error">密码错误</span>
    </div>

    <!-- 手机号（自定义校验） -->
    <div>
        <label>手机号</label>
        <input type="text" th:field="*{phone}" th:errorclass="field-error" />
        <span th:errors="*{phone}" class="error">手机号错误</span>
    </div>

    <!-- 年龄 -->
    <div>
        <label>年龄</label>
        <input type="number" th:field="*{age}" th:errorclass="field-error" />
        <span th:errors="*{age}" class="error">年龄错误</span>
    </div>

    <!-- 单选 -->
    <div>
        <label>性别</label>
        <label><input type="radio" th:field="*{gender}" value="M" /> 男</label>
        <label><input type="radio" th:field="*{gender}" value="F" /> 女</label>
        <span th:errors="*{gender}" class="error"></span>
    </div>

    <!-- 多选 -->
    <div>
        <label>爱好</label>
        <label><input type="checkbox" th:field="*{hobbies}" value="阅读" /> 阅读</label>
        <label><input type="checkbox" th:field="*{hobbies}" value="运动" /> 运动</label>
        <label><input type="checkbox" th:field="*{hobbies}" value="编程" /> 编程</label>
    </div>

    <!-- 下拉 -->
    <div>
        <label>国家</label>
        <select th:field="*{countryId}">
            <option value="">请选择</option>
            <option th:each="c : \${countries}"
                    th:value="\${c.id}"
                    th:text="\${c.name}">国家名</option>
        </select>
        <span th:errors="*{countryId}" class="error"></span>
    </div>

    <button type="submit">注册</button>
</form>
</body>
</html>
\`\`\`

逐行解析：

- \`@NotBlank(message = "{username.notblank}")\` —— 引用 \`messages.properties\` 的 \`username.notblank\` 消息，实现国际化。
- \`@Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\\\d).+$")\` —— 正则要求至少一个字母和一个数字。Java 字符串里 \`\\\\d\` 是 \`\\d\`。
- \`@Valid @ModelAttribute("registerForm")\` —— 触发校验并绑定到 \`registerForm\` 名字（必须与 \`th:object\` 一致）。
- \`BindingResult result\` —— **必须紧跟 @Valid 参数后**，否则 Spring 不会注入而是抛异常。
- \`result.hasFieldErrors("username")\` —— 检查特定字段是否已有错（避免重复校验）。
- \`result.rejectValue("username", "duplicate.username")\` —— 手动加错误，第二个参数是消息 key。
- \`th:object="\${registerForm}"\` —— 绑定命令对象。
- \`th:field="*{username}"\` —— 自动渲染 name、id、value，配合 th:object。
- \`th:errorclass="field-error"\` —— 该字段有错时给 input 加 class，做样式提示。
- \`th:if="\${#fields.hasErrors('username')}"\` —— 字段有错才显示错误 span。
- \`th:errors="*{username}"\` —— 输出该字段所有错误（多个用换行/逗号分隔）。
- \`th:each="c : \${countries}"\` —— 下拉选项遍历。
- \`th:value="\${c.id}"\` —— option 的 value 是国家 ID。
- \`th:text="\${c.name}"\` —— option 显示文本是国家名。
- \`th:field="*{countryId}"\` —— Spring 根据表单提交的 countryId 自动选中对应 option。

## 对比

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
| 接受 null | 否 | 否 | 否 |

| 维度 | 内置校验 | 自定义校验 |
| --- | --- | --- |
| 易用 | 注解一行 | 写注解 + Validator |
| 灵活 | 受内置规则限制 | 任意逻辑 |
| 复用 | 已内置 | 自己写 |
| 推荐 | 通用场景 | 业务规则（如手机号） |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| BindingResult 位置错 | 必须 @Valid 后 | 紧跟 @Valid 参数后 |
| th:object 与 @ModelAttribute 名字不符 | 绑定失败 | 名字一致 |
| 直接拿实体接收表单 | 字段被恶意绑定（id、role） | 用独立 Command 类 |
| 错误消息硬编码 | 无法国际化 | 写到 messages.properties |
| 下拉错误时选项消失 | 错误回原页没重设 countries | 错误分支重新 model.addAttribute |
| @NotBlank 用在 Integer | 类型不匹配 | Integer 用 @NotNull |
| th:field 与手动 value 冲突 | th:field 会覆盖 | 只用 th:field |
| 多选 checkboxes 绑 List<String> | 集合类型错 | 确保是 List/数组 |
| @Valid 后忘了 BindingResult | 异常直接抛出 | 必须显式接收 |
| 自定义注解没写 groups/payload | 不符合规范 | 三个必填元素都写 |
`,
  },

  // =============================================================
  // 第四十章:国际化与静态资源
  // =============================================================
  {
    id: "jw-40",
    group: "模板引擎 Thymeleaf",
    icon: "🎨",
    title: "国际化与静态资源",
    content: `# 国际化与静态资源

## 概念讲解

国际化（i18n，internationalization 的缩写，i 和 n 之间 18 个字母）让应用根据用户语言显示不同文本。中文用户看中文，英文用户看英文。Thymeleaf 配合 Spring 的 MessageSource 能优雅实现。

### MessageSource 配置

Spring Boot 默认配置了 \`MessageSourceAutoConfiguration\`，从 \`src/main/resources/\` 下读取 \`messages.properties\` 系列文件。关键配置：

\`\`\`properties
# application.properties
spring.messages.basename=messages,errors,menus
spring.messages.encoding=UTF-8
spring.messages.fallback-to-system-locale=false
spring.messages.use-code-as-default-message=true
\`\`\`

- \`basename\` —— 消息文件基名，多个用逗号分隔。每个基名对应一组 properties 文件。
- \`encoding\` —— 文件编码，UTF-8 必备（中文）。
- \`fallback-to-system-locale\` —— 找不到对应语言时是否回退到系统语言。建议 false，统一回退到默认 \`messages.properties\`。
- \`use-code-as-default-message\` —— 找不到消息时是否返回 key 本身。true 便于开发期发现漏译。

### messages_xx.properties 命名规则

文件命名遵循 \`basename_language_country.properties\`：

- \`messages.properties\` —— 默认（兜底）
- \`messages_zh.properties\` —— 中文（语言代码 zh）
- \`messages_zh_CN.properties\` —— 简体中文（中国大陆，语言+国家）
- \`messages_zh_TW.properties\` —— 繁体中文（中国台湾）
- \`messages_en.properties\` —— 英文
- \`messages_en_US.properties\` —— 美式英文

匹配规则：用户 locale 是 \`zh_CN\`，先找 \`messages_zh_CN.properties\`，找不到降级到 \`messages_zh.properties\`，再找不到用 \`messages.properties\`。

文件内容（**注意 properties 文件是 ISO-8859-1 编码**，中文要用 native2ascii 或 IDE 自动转 \\uXXXX 形式；Spring Boot 3 配 \`spring.messages.encoding=UTF-8\` 后可直接写中文）：

\`\`\`properties
# messages_zh.properties
welcome.title=欢迎
user.welcome=欢迎你，{0}
login.username=用户名
login.password=密码
\`\`\`

\`\`\`properties
# messages_en.properties
welcome.title=Welcome
user.welcome=Welcome, {0}
login.username=Username
login.password=Password
\`\`\`

\`{0}\` 是参数占位符，调用时传入。

### th:text="#{key}" 国际化

在模板里用 \`#{key}\` 取消息：

\`\`\`html
<h1 th:text="#{welcome.title}">Welcome</h1>
<p th:text="#{user.welcome(\${user.username})}">欢迎</p>
<label th:text="#{login.username}">Username</label>
\`\`\`

带参数的消息用 \`#{key(arg1, arg2)}\` 语法，参数对应 properties 里的 \`{0}\`、\`{1}\`。

### LocaleResolver

决定当前用户用什么 locale 的策略。Spring 提供：

- **\`AcceptHeaderLocaleResolver\`**（Spring Boot 默认）—— 根据 HTTP \`Accept-Language\` 头决定。最常用，浏览器自动发送。
- **\`SessionLocaleResolver\`** —— 把 locale 存在用户 session 里，记住用户选择。
- **\`CookieLocaleResolver\`** —— 把 locale 存在 cookie 里，跨 session 持久化。
- **\`FixedLocaleResolver\`** —— 固定 locale，调试或单语言系统用。

### LocaleChangeInterceptor

配合拦截器实现「URL 加参数切换语言」：

\`\`\`java
@Bean
public LocaleChangeInterceptor localeChangeInterceptor() {
    LocaleChangeInterceptor i = new LocaleChangeInterceptor();
    i.setParamName("lang");    // ?lang=en 切换英文
    return i;
}

@Override
public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(localeChangeInterceptor());
}
\`\`\`

访问 \`/users?lang=en\` 自动切换到英文。

### 自定义 LocaleResolver

Spring Boot 默认 \`AcceptHeaderLocaleResolver\` 配合默认 locale：

\`\`\`java
@Bean
public LocaleResolver localeResolver() {
    AcceptHeaderLocaleResolver r = new AcceptHeaderLocaleResolver();
    r.setDefaultLocale(Locale.SIMPLIFIED_CHINESE);   // 默认中文
    r.setSupportedLocales(List.of(
        Locale.SIMPLIFIED_CHINESE,
        Locale.US,
        Locale.JAPAN));
    return r;
}
\`\`\`

### 静态资源映射

Spring Boot 默认从这几个目录加载静态资源（按优先级）：

- \`classpath:/META-INF/resources/\`
- \`classpath:/resources/\`
- \`classpath:/static/\`（最常用）
- \`classpath:/public/\`

放在 \`src/main/resources/static/\` 下的文件直接通过根路径访问。例如 \`static/css/app.css\` 通过 \`/css/app.css\` 访问。

### WebMvcConfigurer.addResourceHandlers

自定义静态资源映射：

\`\`\`java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 把 /static/** 映射到 classpath:/static/
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");

        // 把 /files/** 映射到磁盘 D:/uploads/
        registry.addResourceHandler("/files/**")
                .addResourceLocations("file:D:/uploads/");

        // 缓存一年（生产用，开发别开）
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/assets/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic());
    }
}
\`\`\`

\`file:\` 前缀映射磁盘目录，常用于用户上传文件。

## 设计原则

1. **所有用户可见文本走消息源**：不要在模板硬编码文字，全部 \`#{key}\`。
2. **默认文件兜底**：\`messages.properties\` 必须有所有 key，其他语言只覆盖差异。
3. **Locale 用 AcceptHeader**：浏览器自动发，无需用户操作；要切换再加拦截器。
4. **静态资源带版本**：CSS/JS 改了浏览器可能用缓存，加 hash 或版本号 \`app.css?v=123\`。
5. **生产开启缓存**：静态资源设长 Cache-Control，开发关掉便于调试。
6. **上传文件不放在 webapp 下**：用 \`file:\` 映射磁盘目录，避免重新部署丢文件。

## 使用场景

- 多语言网站：中英日韩
- 区域定制：价格、日期格式
- 资源本地化：图片含文字时按语言切换
- 静态资源托管：CSS、JS、图片
- 用户上传文件访问
- 不适用：纯 API 后端（无模板）

## 代码逐行讲解

完整国际化 + 静态资源配置：

**application.properties**：

\`\`\`properties
# 国际化
spring.messages.basename=messages,errors,menus
spring.messages.encoding=UTF-8
spring.messages.fallback-to-system-locale=false
spring.messages.use-code-as-default-message=true
spring.messages.cache-duration=3600

# 默认 locale
spring.web.locale=zh_CN
spring.web.locale-resolver=accept-header

# 静态资源
spring.web.resources.static-locations=classpath:/static/
spring.web.resources.cache.cachecontrol.max-age=365d
spring.web.resources.cache.cachecontrol.cache-public=true
spring.web.resources.chain.strategy.content.enabled=true
spring.web.resources.chain.strategy.content.paths=/**
\`\`\`

**messages_zh.properties**：

\`\`\`properties
# 通用
app.title=我的网站
welcome=欢迎
welcome.user=欢迎你，{0}

# 用户
user.list=用户列表
user.detail=用户详情
user.id=编号
user.username=用户名
user.email=邮箱
user.active=已激活
user.inactive=未激活

# 错误
error.notfound=资源不存在
error.server=服务器内部错误

# 校验
NotBlank.userForm.username=用户名不能为空
Size.userForm.username=用户名长度必须在 {min}-{max} 之间
Email.userForm.email=邮箱格式不正确
\`\`\`

**messages_en.properties**：

\`\`\`properties
app.title=My Site
welcome=Welcome
welcome.user=Welcome, {0}

user.list=User List
user.detail=User Detail
user.id=ID
user.username=Username
user.email=Email
user.active=Active
user.inactive=Inactive

error.notfound=Resource Not Found
error.server=Internal Server Error

NotBlank.userForm.username=Username cannot be empty
Size.userForm.username=Username must be between {min} and {max}
Email.userForm.email=Invalid email format
\`\`\`

**WebConfig.java**：

\`\`\`java
package com.example.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.*;
import org.springframework.web.servlet.i18n.*;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

import java.util.List;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // ===== 国际化 =====

    @Bean
    public LocaleResolver localeResolver() {
        AcceptHeaderLocaleResolver r = new AcceptHeaderLocaleResolver();
        r.setDefaultLocale(Locale.SIMPLIFIED_CHINESE);     // 默认中文
        r.setSupportedLocales(List.of(                     // 支持的语言
            Locale.SIMPLIFIED_CHINESE,
            Locale.US,
            Locale.JAPAN
        ));
        return r;
    }

    @Bean
    public LocaleChangeInterceptor localeChangeInterceptor() {
        LocaleChangeInterceptor i = new LocaleChangeInterceptor();
        i.setParamName("lang");           // ?lang=en_US 切换
        return i;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(localeChangeInterceptor());
    }

    // ===== 静态资源 =====

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 默认 static 目录
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");

        // 上传文件磁盘映射
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:/data/uploads/");

        // 资源版本化缓存
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/assets/")
                .setCacheControl(
                    CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic());
    }
}
\`\`\`

**模板使用**（templates/user/list.html）：

\`\`\`html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      th:lang="\${#locale.language}">     <!-- 根 html lang 跟随 locale -->
<head>
    <meta charset="UTF-8">
    <title th:text="#{user.list}">User List</title>
    <link rel="stylesheet" th:href="@{/assets/css/app.css}">
</head>
<body>
    <h1 th:text="#{user.list}">用户列表</h1>

    <!-- 当前用户欢迎语 -->
    <p th:text="#{welcome.user(\${currentUser.username})}">欢迎</p>

    <!-- 语言切换 -->
    <div class="lang-switcher">
        <a th:href="@{''(lang='zh_CN')}">中文</a>
        <a th:href="@{''(lang='en_US')}">English</a>
        <a th:href="@{''(lang='ja_JP')}">日本語</a>
    </div>

    <table>
        <thead>
            <tr>
                <th th:text="#{user.id}">ID</th>
                <th th:text="#{user.username}">用户名</th>
                <th th:text="#{user.email}">邮箱</th>
                <th th:text="#{user.active}">状态</th>
            </tr>
        </thead>
        <tbody>
            <tr th:each="u : \${users}">
                <td th:text="\${u.id}">1</td>
                <td th:text="\${u.username}">user</td>
                <td th:text="\${u.email}">a@b.com</td>
                <td th:text="\${u.active} ? #{user.active} : #{user.inactive}">
                    已激活
                </td>
            </tr>
        </tbody>
    </table>

    <script th:src="@{/assets/js/app.js}"></script>
</body>
</html>
\`\`\`

逐行解析：

- \`th:lang="\${#locale.language}"\` —— \`#locale\` 是内置对象，把 html 的 lang 属性设为当前语言（\`zh\`、\`en\`），SEO 与无障碍友好。
- \`th:href="@{/assets/css/app.css}"\` —— 静态资源用 \`@{}\` 表达式，自动加上下文路径。
- \`th:text="#{user.list}"\` —— 取国际化消息 \`user.list\`。
- \`th:text="#{welcome.user(\${currentUser.username})}"\` —— 带参数的消息，\`{0}\` 被替换成用户名。
- \`th:href="@{''(lang='zh_CN')}"\` —— \`@{''}\` 是当前 URL，加 \`lang\` 参数触发 \`LocaleChangeInterceptor\` 切换语言。
- \`th:text="\${u.active} ? #{user.active} : #{user.inactive}"\` —— 条件表达式里嵌套 \`#{}\` 取消息。

**Controller**：

\`\`\`java
@Controller
public class UserController {

    @GetMapping("/users")
    public String list(Model model, Locale locale) {
        // locale 由 LocaleResolver 自动注入
        model.addAttribute("users", userService.findAll());
        return "user/list";
    }
}
\`\`\`

参数 \`Locale locale\` 由 Spring 自动注入，是当前用户的 locale。

**messages.properties 校验消息格式化**：

JSR303 校验消息也支持参数：

\`\`\`properties
# {min} {max} 来自 @Size 注解属性
Size.userForm.username=用户名长度必须在 {min}-{max} 之间
# {value} 来自 @Min
Min.userForm.age=年龄必须大于等于 {value}
\`\`\`

## 对比

| 维度 | AcceptHeader | Session | Cookie |
| --- | --- | --- | --- |
| 来源 | 浏览器 Accept-Language | session | cookie |
| 用户切换 | 改浏览器设置 | URL 加 ?lang | URL 加 ?lang |
| 跨 session | 是 | 否 | 是 |
| 服务器存储 | 否 | 是 | 否 |
| 推荐 | 默认场景 | 已登录用户 | 持久偏好 |

| 维度 | properties 默认 | properties_zh | properties_en |
| --- | --- | --- | --- |
| 角色 | 兜底 | 中文 | 英文 |
| 必备 | 是 | 是 | 视需求 |
| 完整度 | 所有 key | 覆盖差异 | 覆盖差异 |

| 维度 | classpath:/static/ | file:/data/uploads/ |
| --- | --- | --- |
| 来源 | 应用内打包 | 磁盘 |
| 部署 | 跟应用走 | 独立 |
| 适用 | 应用自带 CSS/JS | 用户上传文件 |
| 重新部署 | 文件在 | 文件不丢 |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| 中文 properties 乱码 | 默认 ISO-8859-1 编码 | 配 spring.messages.encoding=UTF-8 |
| 切语言没反应 | 没配 LocaleChangeInterceptor | 加拦截器 + 设 paramName |
| 找不到 key 报错 | use-code-as-default-message=false | 设 true 便于发现漏译 |
| 消息参数顺序错 | {0}{1} 与调用参数对应 | 注意顺序 |
| 静态资源 404 | 路径或目录映射错 | 检查 spring.web.resources.static-locations |
| 改 CSS 不更新 | 浏览器缓存 | 加版本号或开发关缓存 |
| 上传文件丢失 | 放在 webapp 下重新部署被清 | 用 file: 映射磁盘目录 |
| LocaleResolver 不是 Bean | 配置无效 | @Bean 显式声明 |
| Accept-Language 不在支持列表 | 不报错但回退默认 | 设 setSupportedLocales 限定 |
| 校验消息不国际化 | 直接写 message | message 写 {key} 引用 properties |
`,
  },
];
