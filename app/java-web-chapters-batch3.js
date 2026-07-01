// =============================================================
// Java Web 应用开发教程 —— 第三批章节
// 分组:JSP 与表达式语言(共 4 章)
// -------------------------------------------------------------
// 本文件包含以下章节:
//   jw-09: JSP 基础语法
//   jw-10: JSP 九大内置对象
//   jw-11: EL 表达式语言
//   jw-12: JSTL 标签库
//
// 每个章节 content 包含六个模块:
//   概念解释 / 设计原理 / 使用场景 / 代码示例 / 对比分析 / 常见陷阱
// =============================================================

export const chapters = [
  // =========================================================
  // 第九章:JSP 基础语法
  // =========================================================
  {
    id: "jw-09",
    group: "JSP 与表达式语言",
    icon: "📄",
    title: "JSP 基础语法",
    content: `# JSP 基础语法

## 概念解释

**JSP(JavaServer Pages)** 是一种允许在 HTML 中嵌入 Java 代码的服务端模板技术。它的设计初衷是解决"Servlet 用 Java 写 HTML 太痛苦"的问题——在 HTML 里写 Java,比在 Java 里拼 HTML 直观得多。

但 JSP 并非独立技术,它的**本质是一个 Servlet**。容器(Tomcat)第一次访问 JSP 时,会把它**翻译成一个 Java Servlet 源文件**,再编译成 .class 执行。你写的 \`index.jsp\`,最终运行的是一个叫 \`index_jsp.class\` 的 Servlet。

JSP 的基本语法由几类元素构成:**指令(directive)**、**脚本元素(scriptlet/expression/declaration)**、**动作(action)**、**注释**。理解这些元素就能读写 JSP 页面。

- **脚本片段 scriptlet**:\`<% Java 代码 %>\`,执行普通 Java 语句。
- **表达式 expression**:\`<%= 表达式 %>\`,输出表达式的值到页面(注意无分号)。
- **声明 declaration**:\`<%! 成员声明 %>\`,定义 Servlet 的成员变量或方法。
- **指令 directive**:\`<%@ ... %>\`,告诉容器如何翻译这个 JSP。

## 设计原理

JSP → Servlet 的翻译过程是理解 JSP 的关键。当浏览器请求 \`/index.jsp\`,Tomcat 检查 \`work/\` 目录是否有编译好的 \`index_jsp.class\`。若没有或 JSP 被修改过,则:翻译 \`index.jsp\` → \`index_jsp.java\`(一个继承 \`HttpJspBase\` 的 Servlet)→ 用 \`javac\` 编译 → 加载执行。

翻译规则:HTML 文本被当作 \`out.write("...")\` 输出;scriptlet \`<% %>\` 里的代码被原样放入 \`_jspService()\` 方法体;expression \`<%= x %>\` 变成 \`out.print(x)\`;declaration \`<%! %>\` 变成类的成员。所以 scriptlet 里定义的变量是方法局部变量,declaration 里定义的才是成员变量(有线程安全问题)。

JSP 本质是"用 HTML 写法简化 Servlet",但它把 Java 与 HTML 揉在一起,容易产生"意大利面条式代码"——这正是后来 MVC(把 Java 逻辑放 Servlet,展示放 JSP)和模板引擎(Thymeleaf,完全禁止 Java 代码)演进的动力。

指令分三类:\`page\`(页面属性如编码、错误页)、\`include\`(编译期包含)、\`taglib\`(引入标签库)。

## 使用场景

**适合**:传统服务端渲染页面(管理系统、内部工具)、遗留项目维护、需要快速写带逻辑的页面。

**不适合**:前后端分离项目(用 RESTful API + 前端框架)、新项目(推荐 Thymeleaf 更清晰)、复杂业务逻辑(应下沉到 Service,JSP 只负责展示)。

现代项目倾向"JSP 只做展示,不放复杂 Java 代码",配合 EL 表达式与 JSTL 标签,避免使用 scriptlet。

## 代码示例

\`\`\`jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!-- page 指令:设响应类型、编码、错误页 -->
<%@ page errorPage="error.jsp" %>
<!DOCTYPE html>
<html>
<head><title>JSP 基础语法</title></head>
<body>
    <%-- JSP 注释,翻译时丢弃,客户端看不到 --%>
    <!-- HTML 注释,会输出到页面 -->

    <%-- 1. 脚本片段:执行 Java 语句 --%>
    <%
        // 这里是普通 Java 代码,运行在 _jspService 方法内
        String name = request.getParameter("name");
        if (name == null) name = "访客";
        int hour = java.time.LocalTime.now().getHour();
    %>

    <%-- 2. 表达式:直接输出值(注意无分号) --%>
    <h1>你好,<%= name %>!</h1>
    <p>现在小时数:<%= hour %></p>

    <%-- 3. 脚本片段中可用 if/for 控制页面结构 --%>
    <%
        if (hour < 12) {
    %>
        <p>上午好</p>
    <%
        } else {
    %>
        <p>下午好</p>
    <%
        }
    %>

    <%-- 4. 声明:定义类的成员变量/方法(慎用,有线程安全问题) --%>
    <%!
        private int visitCount = 0;  // 成员变量,所有请求共享
        public String greet() {
            return "欢迎光临";
        }
    %>
    <p><%= greet() %>,访问计数:<%= ++visitCount %></p>
</body>
</html>
\`\`\`

逐行解释:\`<%@ page contentType="text/html;charset=UTF-8" %>\` 指令设响应类型与编码,避免乱码;\`<% ... %>\` 脚本片段写 Java 语句,变量是方法局部变量;\`<%= name %>\` 表达式输出值,**不要写分号**;\`<% %>\` 与 HTML 可交错,实现条件渲染;\`<%! ... %>\` 声明定义成员,\`visitCount\` 被所有请求共享(线程不安全,演示用,生产别这么做)。

## 对比分析

| 维度 | JSP | Thymeleaf | 纯 Servlet |
| --- | --- | --- | --- |
| 写法 | HTML 中嵌 Java | HTML 属性式标签 | Java 拼 HTML 字符串 |
| Java 代码 | 允许(scriptlet) | 禁止,只用属性 | 全是 Java |
| 模板可被浏览器直接预览 | 否(需翻译) | 是(自然模板) | 否 |
| 学习曲线 | 低(熟悉 Java 即可) | 中 | 中(拼字符串痛苦) |
| 现代推荐度 | 渐少 | 推荐 | 不推荐(展示场景) |
| 适合场景 | 传统项目、遗留维护 | 新服务端渲染项目 | API、纯数据响应 |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| 表达式输出分号报错 | \`<%= x; %>\` 写了分号 | 表达式不加结尾分号 |
| 中文乱码 | 未设 page 编码 | \`<%@ page pageEncoding="UTF-8" contentType="text/html;charset=UTF-8" %>\` |
| 修改 JSP 不生效 | 缓存或未重新编译 | 删 work/ 目录,或重启 Tomcat |
| declaration 成员变量并发错乱 | 单例多线程共享 | 避免用成员变量存状态,用局部变量 |
| scriptlet 过多难维护 | Java 与 HTML 混杂 | 用 JSTL/EL 替代控制流 |
| 第一次访问慢 | 需翻译编译 | 预编译或在启动时触发首次访问 |
| 500 错误看不到堆栈 | 编译错误被吞 | 看 work/ 下生成的 .java 或 Tomcat logs |`,
  },

  // =========================================================
  // 第十章:JSP 九大内置对象
  // =========================================================
  {
    id: "jw-10",
    group: "JSP 与表达式语言",
    icon: "🎯",
    title: "JSP 九大内置对象",
    content: `# JSP 九大内置对象

## 概念解释

JSP 翻译成 Servlet 后,容器在 \`_jspService()\` 方法内**预定义了九个对象**,无需声明即可直接在 scriptlet 与表达式中使用,称为**九大内置对象(隐式对象)**。它们是 JSP 编程的"快捷工具箱"。

九大内置对象按功能可分为四类:

| 对象 | 类型 | 作用域 | 说明 |
| --- | --- | --- | --- |
| **request** | HttpServletRequest | request | 请求对象,读参数/头/Cookie |
| **response** | HttpServletResponse | page | 响应对象,写头/重定向 |
| **session** | HttpSession | session | 会话对象,跨请求保数据 |
| **application** | ServletContext | application | 全应用共享,最大作用域 |
| **page** | Object(this) | page | 当前 JSP 实例本身 |
| **pageContext** | PageContext | page | 页面上下文,可访问其他对象与所有作用域 |
| **out** | JspWriter | page | 字符输出流,写响应体 |
| **config** | ServletConfig | page | 当前 JSP 的配置(init 参数) |
| **exception** | Throwable | page | 错误页中捕获的异常对象 |

四个作用域由小到大:**page**(仅当前页面)→ **request**(一次请求,转发共享)→ **session**(一次会话,跨请求)→ **application**(整个应用,所有用户共享)。

## 设计原理

内置对象本质是容器在翻译时自动声明的局部变量。例如 \`request\` 就是 \`_jspService\` 方法参数里的 \`HttpServletRequest\`,\`session\` 是 \`request.getSession()\` 的结果,\`out\` 是包装了 \`response.getWriter()\` 的 \`JspWriter\`。它们省去了开发者每次手动获取的麻烦。

\`pageContext\` 是核心枢纽,它提供了访问其他八大对象的方法(\`getRequest()\`、\`getSession()\` 等),还能跨作用域存取属性:\`pageContext.setAttribute("k", v, PageContext.SESSION_SCOPE)\`。EL 表达式查找属性时就是按 page→request→session→application 顺序搜索。

\`exception\` 对象只在**错误页**(声明了 \`isErrorPage="true"\` 的 JSP)中可用,其他页面用它编译报错。\`out\` 与 \`response.getWriter()\` 不同,JSP 中应统一用 \`out\` 输出,它有缓冲管理。

作用域设计体现"最小权限"原则:能用 page 就不用 request,能用 request 就不用 session,能用 session 就不用 application。作用域越大,数据存活越久,内存与并发问题越多。

## 使用场景

**request**:读取表单参数、请求头,在请求链间传值。**session**:保存登录用户信息、购物车,跨请求。**application**:统计在线人数、全应用配置缓存(慎用,所有用户共享有并发问题)。**pageContext**:在自定义标签里访问其他对象。**out**:直接写响应内容。**exception**:在 error.jsp 中展示异常信息。

## 代码示例

\`\`\`jsp
<%@ page contentType="text/html;charset=UTF-8" isErrorPage="true" %>
<!DOCTYPE html>
<html><body>
<%
    // 1. request:读取参数与请求头
    String name = request.getParameter("name");
    String ua = request.getHeader("User-Agent");

    // 2. session:跨请求保存登录信息
    session.setAttribute("user", name);
    Integer visitCount = (Integer) session.getAttribute("count");
    if (visitCount == null) visitCount = 0;
    session.setAttribute("count", ++visitCount);

    // 3. application:全应用共享(如在线人数)
    Integer online = (Integer) application.getAttribute("online");
    if (online == null) online = 0;
    application.setAttribute("online", ++online);

    // 4. pageContext:跨作用域查找,演示按域读取属性
    pageContext.setAttribute("msg", "页面级数据", PageContext.PAGE_SCOPE);
    Object msg = pageContext.getAttribute("msg", PageContext.PAGE_SCOPE);

    // 5. out:直接写响应
    out.println("<h1>欢迎," + name + "</h1>");
%>
<p>本次会话访问次数:<%= visitCount %></p>
<p>当前在线人数:<%= online %></p>

<%-- 6. exception:仅在错误页可用,输出异常信息 --%>
<% if (exception != null) { %>
    <p style="color:red">发生错误:<%= exception.getMessage() %></p>
<% } %>

<%-- 7. config:读取当前 JSP 的初始化参数 --%>
<p>应用名:<%= config.getServletContext().getServletContextName() %></p>
</body></html>
\`\`\`

逐行解释:\`request.getParameter\` 读请求参数;\`session.setAttribute/getAttribute\` 跨请求保存与读取登录态;\`application\` 作用域数据所有用户共享,存在线人数等(注意并发,生产用原子类);\`pageContext.setAttribute(..., SCOPE)\` 指定作用域存取;\`out.println\` 直接写响应体;\`exception\` 仅在 \`isErrorPage="true"\` 的页面可用;\`config\` 读取 web.xml 配的 init 参数。

## 对比分析

| 作用域 | 对象 | 生命周期 | 线程安全 | 典型用途 |
| --- | --- | --- | --- | --- |
| page | pageContext/page/out | 一次请求内当前页 | 是(方法局部) | 页面内临时数据 |
| request | request | 一次请求(转发共享) | 是(单请求) | 传给转发目标的数据 |
| session | session | 一次会话(跨请求) | 需自行保证 | 登录态、购物车 |
| application | application | 应用运行期间 | 需自行保证 | 全局配置、在线统计 |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| exception 对象未定义 | 当前页未声明 isErrorPage | 错误页加 \`isErrorPage="true"\` |
| 滥用 session 致内存涨 | session 数据不清理 | 设超时 \`session.setMaxInactiveInterval\`,用完 removeAttribute |
| application 并发错乱 | 多线程同时改全局属性 | 用同步或原子类,或改用数据库 |
| out 与 getWriter 混用 | 两个输出流冲突 | JSP 中只用 out |
| session 关闭后还访问 | 已 invalidate | 处理前判 \`request.getSession(false) != null\` |
| 作用域过大 | 用 session/application 存临时数据 | 临时数据用 request 或 page |
| 属性名冲突 | 不同作用域同名属性 | 命名加前缀区分,或按域取 |`,
  },

  // =========================================================
  // 第十一章:EL 表达式语言
  // =========================================================
  {
    id: "jw-11",
    group: "JSP 与表达式语言",
    icon: "💬",
    title: "EL 表达式语言",
    content: `# EL 表达式语言

## 概念解释

**EL(Expression Language,表达式语言)** 是 JSP 2.0 引入的一种简洁语言,用于在 JSP 中**无 Java 代码地**访问数据与计算。\`\${表达式}\` 是它的语法,替代了繁琐的 \`<%= ... %>\`,让页面更干净。

EL 的核心能力:访问四大作用域(page/request/session/application)的属性、访问对象的属性与集合元素、做算术/逻辑/关系运算、调用方法、访问请求参数与头。

EL 的设计目标是**消除 scriptlet**。在没有 EL 之前,从 request 取个值要写 \`<%= ((User)request.getAttribute("user")).getName() %>\`,既要强转又要处理 null,极易出错。用 EL 只需 \`\${user.name}\`,自动按作用域查找、自动判空、自动调用 getter。

## 设计原理

EL 表达式 \`\${user.name}\` 的求值过程:容器按 page→request→session→application 顺序查找名为 \`user\` 的属性;找到后调用其 \`getName()\` 方法(注意 EL 的 \`name\` 对应 \`getName\`,不是字段)取值;找不到返回空串(不是 null,不会打印 "null")。

属性访问规则:\`\${a.b}\` 等价于 \`a.getB()\`(调用 getter),而非访问字段 \`a.b\`。这是 JavaBean 规范。\`\${list[0]}\` 或 \`\${map["key"]}\` 用方括号访问数组/List 索引或 Map 键。

EL 运算符:算术(\`+ - * /\`)、关系(\`== != < >\`,也支持 \`eq ne lt gt\` 文本形式)、逻辑(\`&& || !\`)、空判断(\`empty\`,null 或空集合都为 true)。三元运算 \`\${a > 0 ? "正" : "非正"}\`。

EL 还提供隐式对象:\`\${param.name}\` 取请求参数,\`\${header["User-Agent"]}\` 取请求头,\`\${cookie.name.value}\` 取 Cookie,\`\${initParam.dbUrl}\` 取上下文参数。\`\${pageScope}\`、\`\${requestScope}\` 等可指定作用域查找,避免同名属性歧义。

EL 3.0 支持调用静态方法、流式操作(\`stream.filter().toList()\`),但日常用得少。

## 使用场景

**读取作用域属性**:Servlet 处理后 \`setAttribute\`,JSP 用 \`\${user.name}\` 渲染。**表单回显**:\`\${param.name}\` 读请求参数填回输入框。**条件显示**:\`\${empty list ? "无数据" : list.size()}\`。**集合遍历**:配合 JSTL \`<c:forEach>\` 用 EL 取每项属性。

**不适合**:复杂业务逻辑(应放 Servlet/Service);副作用操作(EL 只读,不能修改数据)。EL 只负责"展示数据",这让 JSP 回归纯展示职责。

## 代码示例

Servlet 端准备数据:

\`\`\`java
@WebServlet("/users")
public class UserListServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        List<User> users = List.of(
            new User("张三", 20),
            new User("李四", 25)
        );
        req.setAttribute("users", users);   // 存入 request 域
        req.getRequestDispatcher("/WEB-INF/users.jsp").forward(req, resp);
    }
}
\`\`\`

JSP 用 EL 渲染(\`users.jsp\`):

\`\`\`jsp
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib uri="jakarta.tags.core" prefix="c" %>
<!DOCTYPE html>
<html><body>
<%-- EL 读取请求参数并回显到输入框 --%>
<form>
    <input name="keyword" value="\${param.keyword}" placeholder="搜索"/>
</form>

<%-- empty 判断:列表为空时显示提示 --%>
<c:if test="\${empty users}">
    <p>暂无用户数据</p>
</c:if>

<%-- 遍历集合,用 EL 取每项属性(user.name 自动调 getName) --%>
<table>
<tr><th>姓名</th><th>年龄</th><th>是否成年</th></tr>
<c:forEach items="\${users}" var="user">
    <tr>
        <td>\${user.name}</td>
        <td>\${user.age}</td>
        <%-- 三元运算做条件展示 --%>
        <td>\${user.age >= 18 ? "成年" : "未成年"}</td>
    </tr>
</c:forEach>
</table>

<%-- 访问 Map 与数组 --%>
<p>\${map["key"]}</p>       <%-- Map 取值 --%>
<p>\${users[0].name}</p>     <%-- List 取第一个 --%>

<%-- EL 隐式对象:取请求头、Cookie、上下文参数 --%>
<p>客户端:\${header["User-Agent"]}</p>
<p>会话用户:\${cookie.JSESSIONID.value}</p>
</body></html>
\`\`\`

逐行解释:\`\${param.keyword}\` 读请求参数,无则输出空串(非 null,适合回显);\`\${empty users}\` 判断 null 或空集合;\`\${user.name}\` 自动调 \`getName()\`,无需强转;\`\${user.age >= 18 ? ...}\` 三元运算;\`\${users[0].name}\` 索引取值;\`\${header["..."]}\`、\`\${cookie...}\` 用隐式对象取协议数据。**注意**:在 JS 模板字符串中 EL 表达式里的 \`$\` 必须转义为 \`\\$\`,否则会被当作 JS 插值。

## 对比分析

| 维度 | EL 表达式 | JSP scriptlet |
| --- | --- | --- |
| 语法 | \`\${user.name}\` | \`<%= ((User)request.getAttribute("user")).getName() %>\` |
| 类型转换 | 自动 | 需手动强转 |
| null 处理 | 返回空串,不打印 null | 易 NPE |
| 作用域查找 | 自动按域顺序 | 需显式指定 |
| 可读性 | 高 | 低,Java 与 HTML 混杂 |
| 是否推荐 | 是 | 否(JSP 2.0 后废弃) |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| EL 不解析原样输出 | \`isELIgnored="true"\` 或版本低 | page 指令设 \`isELIgnored="false"\`,web-app 版本 >= 2.4 |
| 属性输出 null 字样 | scriptlet 没判空 | 改用 EL,自动转空串 |
| 找不到属性 | 作用域名拼错或未存 | 检查 Servlet 是否 setAttribute |
| EL 调不到方法 | EL 的 name 对应 getName 而非字段 | 确保有标准 getter |
| JS 模板里 EL 冲突 | EL 的美元符加大括号被当 JS 插值 | 在 JS 模板字符串中需转义美元符 |`,
  },

  // =========================================================
  // 第十二章:JSTL 标签库
  // =========================================================
  {
    id: "jw-12",
    group: "JSP 与表达式语言",
    icon: "🏷️",
    title: "JSTL 标签库",
    content: `# JSTL 标签库

## 概念解释

**JSTL(JSP Standard Tag Library,JSP 标准标签库)** 是一组标准 JSP 标签,用 XML 风格的标签替代 scriptlet 里的 Java 控制流(if/for/switch),让 JSP 真正做到"页面无 Java 代码"。

JSTL 分五个子库,常用的是前三个:

- **核心库 core**(前缀 \`c\`):条件判断、循环、URL、变量赋值。最常用。
- **格式化库 fmt**(前缀 \`fmt\`):国际化、日期/数字格式化。
- **函数库 functions**(前缀 \`fn\`):字符串操作(长度、分割、替换)。
- SQL 库(前缀 \`sql\`):JSP 中直接查数据库(不推荐,应放 DAO 层)。
- XML 库(前缀 \`x\`):解析 XML(已少用)。

使用 JSTL 前需引入依赖并用 \`taglib\` 指令声明:\`<%@ taglib uri="jakarta.tags.core" prefix="c" %>\`。Tomcat 10+ 用 \`jakarta.tags\` 命名空间(旧版是 \`java.sun.com/jsp/jstl/core\`)。

核心标签里最常用的是 \`<c:if>\`(条件)与 \`<c:forEach>\`(循环),它们让 JSP 摆脱 \`<% for(...) %>\` 的混乱。

## 设计原理

JSTL 的本质是**自定义标签的标准化**。每个标签背后是一个 Java 标签处理器类(Tag Handler),容器遇到标签时调用对应方法。比如 \`<c:if test="...">\` 背后是 \`IfTag\`,它读取 test 属性,若为 true 才执行标签体。

\`<c:forEach items="\${list}" var="item">\` 的工作原理:解析 \`items\` 的 EL 表达式得到集合,迭代时把当前元素以 \`var\` 指定的名字存入 page 域,标签体内就能用 \`\${item}\` 访问。它还暴露 \`varStatus\`(索引、是否首/尾等)便于复杂展示。

JSTL 配合 EL 形成"标签做控制流、EL 做数据访问"的分工,页面里看不到一行 \`<% %>\`,可读性与可维护性大幅提升。这是 JSP 时代的最佳实践,也是后来模板引擎的设计雏形。

为什么 JSTL 比 scriptlet 好?标签是声明式的(描述"做什么"),scriptlet 是命令式的(描述"怎么做")。声明式更接近 HTML 语义,设计师也能看懂,且标签有统一属性约定,IDE 能提示。

## 使用场景

**条件渲染**:\`<c:if>\`、\`<c:choose><c:when><c:otherwise>\`(多分支)。**循环渲染**:\`<c:forEach>\` 遍历集合生成表格/列表。**变量赋值**:\`<c:set>\` 在页面存值。**URL 处理**:\`<c:url>\` 自动加上下文路径与会话 ID。**国际化**:\`<fmt:message>\` 读多语言资源。**格式化**:\`<fmt:formatDate>\`、\`<fmt:formatNumber>\`。

## 代码示例

\`\`\`jsp
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib uri="jakarta.tags.core" prefix="c" %>
<%@ taglib uri="jakarta.tags.fmt" prefix="fmt" %>
<%@ taglib uri="jakarta.tags.functions" prefix="fn" %>
<!DOCTYPE html>
<html><body>
<%-- 1. c:set:设置变量到指定作用域 --%>
<c:set var="score" value="\${param.score}" scope="request"/>

<%-- 2. c:if:单条件判断(test 用 EL) --%>
<c:if test="\${score >= 60}">
    <p>及格</p>
</c:if>

<%-- 3. c:choose:多分支(类似 switch) --%>
<c:choose>
    <c:when test="\${score >= 90}"><p>优秀</p></c:when>
    <c:when test="\${score >= 60}"><p>及格</p></c:when>
    <c:otherwise><p>不及格</p></c:otherwise>
</c:choose>

<%-- 4. c:forEach:遍历集合,varStatus 暴露索引等信息 --%>
<table>
<tr><th>序号</th><th>姓名</th><th>状态</th></tr>
<c:forEach items="\${users}" var="u" varStatus="vs">
    <tr class="\${vs.index % 2 == 0 ? 'even' : 'odd'}">
        <td>\${vs.index + 1}</td>          <%-- 序号(从0开始,加1) --%>
        <td>\${u.name}</td>
        <td>\${vs.first ? '首个' : ''}</td>  <%-- 是否第一个 --%>
    </tr>
</c:forEach>
</table>

<%-- 5. c:url:自动补全上下文路径,带会话ID(防Cookie禁用) --%>
<a href="<c:url value='/detail'/>">详情</a>

<%-- 6. fmt:格式化日期与数字 --%>
<p>时间:<fmt:formatDate value="\${now}" pattern="yyyy-MM-dd HH:mm:ss"/></p>
<p>金额:<fmt:formatNumber value="\${price}" type="currency"/></p>

<%-- 7. fn:字符串函数 --%>
<c:set var="str" value="Hello World"/>
<p>长度:\${fn:length(str)}</p>
<p>大写:\${fn:toUpperCase(str)}</p>
</body></html>
\`\`\`

逐行解释:\`<c:set>\` 把值存入指定作用域;\`<c:if test="...">\` 用 EL 判断,为 true 才执行标签体;\`<c:choose>\` 是 switch,按 \`<c:when>\` 顺序匹配,都不中走 \`<c:otherwise>\`;\`<c:forEach>\` 的 \`varStatus\` 提供 index/count/first/last 等;\`<c:url>\` 自动加项目名上下文,适合改项目名时不改链接;\`<fmt:formatDate>\` 格式化日期;\`<fn:length>\` 调字符串长度函数。**注意**:EL 里的 \`$\` 在 JS 模板中需转义为 \`\\$\`。

## 对比分析

| 维度 | JSTL 标签 | scriptlet |
| --- | --- | --- |
| 写法 | \`<c:if test="...">\` | \`<% if(...) { %> ... <% } %>\` |
| 风格 | 声明式,接近 HTML | 命令式,Java 与 HTML 混杂 |
| 可读性 | 高,设计师可读 | 低,纯程序员才能看懂 |
| 重用性 | 标签可复用 | 代码片段难复用 |
| 维护性 | 好 | 差 |
| 现代推荐 | 是(JSP 项目最佳实践) | 否(已废弃) |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| 无法解析 c:if 标签 | 未引 taglib 或依赖 | 加 JSTL 依赖,页面 \`<%@ taglib %>\` |
| uri 写错 | 用旧版 java.sun.com 命名空间 | Tomcat 10+ 用 \`jakarta.tags.core\` |
| c:forEach items 为空报错 | 传了 null | 用 \`<c:if test="\${not empty list}">\` 包裹 |
| 标签不输出 | EL 被禁用 | page 指令 \`isELIgnored="false"\` |
| 日期格式化失败 | value 不是 Date 类型 | 确保传 java.util.Date 对象 |
| 两个 JSTL 版本冲突 | 引了多个 jstl jar | 只留一个,jakarta 版本对应 Tomcat 10+ |
| c:url 路径不对 | value 漏了开头的 / | value 以 / 开头表示绝对路径 |`,
  },
];
