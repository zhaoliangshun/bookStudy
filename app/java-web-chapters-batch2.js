// =============================================================
// Java Web 应用开发实战教程 —— 第二批章节
// 分组:Servlet 入门(共 4 章)
// -------------------------------------------------------------
// 本文件包含以下章节:
//   jw-05: Servlet 生命周期与 API
//   jw-06: 请求处理:HttpServletRequest
//   jw-07: 响应处理:HttpServletResponse
//   jw-08: 会话管理:Cookie 与 HttpSession
//
// 每个章节 content 包含六个模块:
//   概念讲解 / 设计原则 / 使用场景 / 代码逐行讲解 / 对比 / 常见陷阱
// =============================================================

export const chapters = [
  // =========================================================
  // 第五章:Servlet 生命周期与 API
  // =========================================================
  {
    id: "jw-05",
    group: "Servlet 入门",
    icon: "🔌",
    title: "Servlet 生命周期与 API",
    content: `# Servlet 生命周期与 API

## 概念讲解

### Servlet 是什么

**Servlet** 是 Java Web 的核心抽象:一个运行在 Servlet 容器中的 Java 类,负责接收 HTTP 请求、处理业务、生成响应。所有 Java Web 框架(Spring MVC、Struts)底层都是 Servlet 的封装。理解 Servlet,就理解了 Java Web 的"骨架"。

Servlet 的本质是一个**实现了 \`javax.servlet.Servlet\` 接口(或 \`jakarta.servlet.Servlet\`)**的 Java 对象。容器(Tomcat)负责它的实例化、初始化、调用、销毁——这就是"生命周期"。

### Servlet 接口体系

Servlet 的类继承体系如下:

\`\`\`
           Servlet (接口)
             │
      GenericServlet (抽象类,通用协议)
             │
        HttpServlet (抽象类,HTTP 专用)
             │
     我们自己写的 MyServlet
\`\`\`

各层职责:

- **\`Servlet\` 接口**:定义 5 个生命周期方法(\`init\`/\`service\`/\`destroy\`/\`getServletConfig\`/\`getServletInfo\`)。任何 Servlet 必须实现它。
- **\`GenericServlet\`**:实现了 \`Servlet\` 与 \`ServletConfig\`,把 \`service\` 留作抽象。它是协议无关的(不只服务 HTTP)。提供了 \`getInitParameter\` 等便利方法。
- **\`HttpServlet\`**:专门处理 HTTP。它实现了 \`service()\`,根据 HTTP 方法(GET/POST/PUT/DELETE...)分发到对应的 \`doGet\`/\`doPost\`/\`doPut\`/\`doDelete\` 等方法。我们通常只需重写 \`doGet\`/\`doPost\`。

\`HttpServlet.service()\` 的分发逻辑大致是:

\`\`\`java
protected void service(HttpServletRequest req, HttpServletResponse resp) {
    String method = req.getMethod();
    if (method.equals("GET"))      doGet(req, resp);
    else if (method.equals("POST")) doPost(req, resp);
    else if (method.equals("PUT"))  doPut(req, resp);
    else if (method.equals("DELETE")) doDelete(req, resp);
    // ... 其他方法
    else super.service(req, resp);  // 抛 UnsupportedOperationException
}
\`\`\`

所以**重写时不要覆盖 \`service()\`**,而应覆盖具体的 \`doGet\`/\`doPost\`,否则方法分发失效。

### 生命周期方法

Servlet 生命周期有三个关键阶段,每个阶段对应一个方法:

**1. 初始化:init(ServletConfig config)**

- 容器在**实例化后、处理请求前**调用,且**只调一次**。
- 用于一次性初始化:加载配置、连接资源、读配置文件。
- \`ServletConfig\` 参数携带该 Servlet 的初始化参数(在 web.xml 的 \`<init-param>\` 或 \`@WebInitParam\` 配置)。
- 若初始化失败,抛 \`ServletException\`,容器会卸载该 Servlet。

**2. 处理请求:service(HttpServletRequest req, HttpServletResponse resp)**

- **每次请求**都会调用(对 HttpServlet,实际是 \`doGet\`/\`doPost\` 等)。
- 多个请求**并发**调用同一个 Servlet 实例(单例多线程,见下文)。
- 这是写业务逻辑的地方。

**3. 销毁:destroy()**

- 容器关闭或应用卸载时调用,**只调一次**。
- 用于释放资源:关数据库连接、关文件、停线程。
- 容器会给正在执行的 \`service()\` 一定时间完成,超时强制回收。

完整时序:

\`\`\`
容器启动
  │
  ├─ (若 load-on-startup) 实例化 → init()
  │
  ▼
请求1 → service()  ┐
请求2 → service()  ├─ 并发(同实例多线程)
请求3 → service()  ┘
  │
  ▼
容器关闭 → destroy() → 实例被 GC
\`\`\`

### init 参数与 ServletConfig

每个 Servlet 可有自己的初始化参数,通过 \`ServletConfig\` 读取:

注解方式:

\`\`\`java
@WebServlet(urlPatterns = "/db",
    initParams = {
        @WebInitParam(name = "url", value = "jdbc:mysql://localhost:3306/test"),
        @WebInitParam(name = "user", value = "root")
    }
)
public class DbServlet extends HttpServlet {
    public void init() throws ServletException {
        ServletConfig config = getServletConfig();
        String url = config.getInitParameter("url");   // 读初始化参数
        String user = config.getInitParameter("user");
        // 用这些参数建立连接...
    }
}
\`\`\`

web.xml 方式:

\`\`\`xml
<servlet>
    <servlet-name>db</servlet-name>
    <servlet-class>com.example.DbServlet</servlet-class>
    <init-param>
        <param-name>url</param-name>
        <param-value>jdbc:mysql://localhost:3306/test</param-value>
    </init-param>
</servlet>
\`\`\`

注意区分 **init-param**(Servlet 级,通过 \`ServletConfig\` 取)与 **context-param**(应用级,通过 \`ServletContext\` 取)。

### 单实例多线程模型

这是 Servlet 最重要的运行特性,务必牢记:

- **默认情况下,容器只为每个 Servlet 声明创建一个实例**(单例)。
- **每个请求由一个独立线程调用该实例的 \`service()\`**(多线程)。
- 这意味着:多个请求**同时**访问同一个 Servlet 对象。

\`\`\`
请求1 ──┐
请求2 ──┼──► 唯一的 MyServlet 实例 ──► 各自线程执行 service()
请求3 ──┘
\`\`\`

### 线程安全问题

既然单实例多线程,那么 **Servlet 的实例变量(成员变量)是共享的**,多个线程同时读写会有竞态条件。

**反面教材**:

\`\`\`java
public class CounterServlet extends HttpServlet {
    private int count = 0;   // 危险!实例变量被多线程共享

    protected void doGet(...) {
        count++;              // 非原子操作,并发下丢失更新
        resp.getWriter().println(count);
    }
}
\`\`\`

上面代码在高并发下 \`count\` 会小于实际请求数(丢更新)。

**解决方法**:

1. **不要用实例变量存请求相关状态**:把状态用局部变量(方法内),每次调用都是独立的。
2. **加锁**:用 \`synchronized\` 保护临界区(性能差,慎用)。
3. **用 Atomic 类**:\`AtomicInteger\` 等提供原子操作。
4. **实现 SingleThreadModel**(已废弃):让容器为每个请求创建实例,不推荐。

**经验法则**:**Servlet 里尽量只用局部变量,不要在实例变量里存可变状态**。需要共享的数据放 ServletContext(应用级)、Session(会话级)、数据库。

### load-on-startup

默认情况下,Servlet 在**首次被请求时**才实例化与 init(惰性)。这会让第一个用户感觉慢。配置 \`load-on-startup\` 可让容器启动时就加载:

\`\`\`java
@WebServlet(urlPatterns = "/init", loadOnStartup = 1)
\`\`\`

数字代表加载顺序(≥0 时启动加载,数字小的先加载;负数或不写表示按需加载)。适合:启动时初始化资源(如读取配置、预热缓存)的 Servlet。

### ServletContext 应用级对象

每个 Web 应用有一个 \`ServletContext\`(一个应用一个),所有 Servlet 共享。用途:

- 读应用级初始化参数(\`context-param\`)。
- 存应用级共享数据(\`setAttribute\`/\`getAttribute\`)。
- 获取真实路径(\`getRealPath\`)、MIME 类型。
- 写日志(\`log\`)。

\`\`\`java
// 在 Servlet 中获取
ServletContext ctx = getServletContext();
String driver = ctx.getInitParameter("driver");   // 读 context-param
ctx.setAttribute("onlineCount", 100);              // 存全局数据
Integer count = (Integer) ctx.getAttribute("onlineCount");
\`\`\`

## 设计原则

### 1. 无状态优先

Servlet 应尽量无状态(不用实例变量存请求间共享数据)。这是线程安全的根本保证,也让 Servlet 天然支持高并发。

### 2. 重写 doGet/doPost,不重写 service

\`HttpServlet.service()\` 负责方法分发,覆盖它会破坏分发逻辑。只在 doGet/doPost 写业务。

### 3. init 做重活,service 做快活

把耗时的初始化(读配置、建连接池)放 \`init()\`,只执行一次;\`service()\` 里只做轻量请求处理,保证响应快。

### 4. 资源在 destroy 释放

数据库连接、文件句柄、线程池,在 \`destroy()\` 关闭,避免资源泄漏。

## 使用场景

- **理解 Spring MVC**:\`DispatcherServlet\` 就是一个 Servlet,理解生命周期才能理解 Spring 的请求处理。
- **资源初始化**:数据库连接池、Redis 客户端在 \`init()\` 创建,\`destroy()\` 关闭。
- **全局共享数据**:在线人数、配置缓存存 \`ServletContext\`。
- **遗留系统维护**:很多老项目直接用 Servlet。

## 代码逐行讲解

下面是一个完整演示生命周期的 Servlet:

\`\`\`java
package com.example;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Enumeration;
import java.util.concurrent.atomic.AtomicInteger;

// loadOnStartup=1:容器启动即加载并调用 init()
@WebServlet(urlPatterns = "/life", loadOnStartup = 1,
    initParams = @WebInitParam(name = "encoding", value = "UTF-8"))
public class LifecycleServlet extends HttpServlet {

    // 用 AtomicInteger 存访问计数,线程安全
    private AtomicInteger visitCount = new AtomicInteger(0);

    // 初始化:只调一次,可读 initParams
    @Override
    public void init() throws ServletException {
        System.out.println("[init] 实例化完成,开始初始化...");
        // 通过 getInitParameter 读 <init-param> 或 @WebInitParam
        String encoding = getInitParameter("encoding");
        System.out.println("[init] 配置的编码: " + encoding);
        // 这里可建立连接池、加载配置等
        System.out.println("[init] 初始化完成");
    }

    // GET 请求处理
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        // 计数+1(原子操作,线程安全)
        int current = visitCount.incrementAndGet();

        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        out.println("<h1>Servlet 生命周期演示</h1>");
        out.println("<p>当前访问次数: " + current + "</p>");

        // 读 ServletConfig 的所有初始化参数
        out.println("<h3>初始化参数:</h3><ul>");
        Enumeration<String> params = getInitParameterNames();
        while (params.hasMoreElements()) {
            String name = params.nextElement();
            out.println("<li>" + name + " = " + getInitParameter(name) + "</li>");
        }
        out.println("</ul>");

        // 读 ServletContext(应用级)信息
        ServletContext ctx = getServletContext();
        out.println("<p>应用名: " + ctx.getContextPath() + "</p>");
        out.println("<p>服务器: " + ctx.getServerInfo() + "</p>");
    }

    // 销毁:只调一次,释放资源
    @Override
    public void destroy() {
        System.out.println("[destroy] 当前访问次数: " + visitCount.get());
        System.out.println("[destroy] 释放资源,Servlet 即将卸载...");
    }
}
\`\`\`

逐行解释:

- \`@WebServlet(urlPatterns = "/life", loadOnStartup = 1, initParams = ...)\`:\`loadOnStartup=1\` 让容器启动时初始化;\`initParams\` 配置一个 \`encoding\` 参数。
- \`private AtomicInteger visitCount\`:用 \`AtomicInteger\` 而非 \`int\`,因为 \`int++\` 不是原子操作,多线程下会丢更新。\`AtomicInteger.incrementAndGet()\` 是原子的。
- \`init()\`:重写时无需手动调 \`super.init()\`(\`GenericServlet\` 已实现)。可用 \`getInitParameter()\` 读初始化参数(底层从 \`ServletConfig\` 取)。
- \`getInitParameterNames()\`:获取所有初始化参数名,枚举遍历。
- \`getServletContext()\`:获取应用级上下文,所有 Servlet 共享。\`getServerInfo()\` 返回容器信息(如 \`Apache Tomcat/10.1.x\`)。
- \`destroy()\`:此处只打印日志,实际可关闭连接池、停线程。

## 对比

| 特性 | 实例变量 | 局部变量 | ServletContext 属性 | Session 属性 |
| --- | --- | --- | --- | --- |
| 作用域 | 整个 Servlet 生命周期 | 单次方法调用 | 整个应用 | 单个会话 |
| 线程安全 | 否(共享,需同步) | 是(栈上,独立) | 否(需同步) | 是(单会话) |
| 适合存 | 不变配置(只读) | 临时计算变量 | 全局共享数据 | 用户会话数据 |
| 示例 | 数据源(只读) | 临时计数器 | 在线人数 | 购物车 |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| 实例变量并发丢更新 | 单实例多线程,共享变量 | 用局部变量或 Atomic/synchronized |
| 覆盖 service() 后 doXxx 不调 | service() 是分发入口,覆盖后分发逻辑没了 | 重写 doGet/doPost,不覆盖 service |
| init() 每次请求都调 | 误以为每次请求都 init | init 只调一次,service 才每次调 |
| load-on-startup 不生效 | 写成负数或没配 | 配 ≥0 的整数,值小先加载 |
| init 参数读不到 | 用了 context-param(应用级)而非 init-param(Servlet 级) | init-param 用 getInitParameter,context-param 用 ctx.getInitParameter |
| destroy 不执行就关 JVM | 容器被强制 kill | 用 shutdown 脚本优雅停机 |
| ServletConfig 与 ServletContext 混淆 | 命名相似 | ServletConfig 是 Servlet 级配置,ServletContext 是应用级共享 |`,
  },

  // =========================================================
  // 第六章:请求处理:HttpServletRequest
  // =========================================================
  {
    id: "jw-06",
    group: "Servlet 入门",
    icon: "🔌",
    title: "请求处理:HttpServletRequest",
    content: `# 请求处理:HttpServletRequest

## 概念讲解

### HttpServletRequest 概述

当容器收到 HTTP 请求,会把它封装成一个 \`HttpServletRequest\` 对象,传给 Servlet 的 \`doGet\`/\`doPost\`。这个对象包含了请求的**所有信息**:请求行、头、参数、体、Cookie、Session 等。它是 Servlet 读取用户输入的唯一入口。

\`HttpServletRequest\` 继承自 \`ServletRequest\`,增加了 HTTP 特有的方法。它的生命周期是**单次请求**:请求结束即失效,不能跨请求保存。

### 获取请求参数

请求参数是用户提交的数据,可能来自:

- GET 请求的查询串:\`?name=zhangsan&age=20\`
- POST 请求的表单体:\`application/x-www-form-urlencoded\`
- 表单的复选框等多值参数:\`hobby=read&hobby=code\`

相关 API:

\`\`\`java
// 获取单个参数(只取第一个值),没有返回 null
String name = req.getParameter("name");

// 获取多值参数(如复选框),返回数组
String[] hobbies = req.getParameterValues("hobby");

// 获取所有参数的 Map(key→String[],因为可能多值)
Map<String, String[]> paramMap = req.getParameterMap();

// 获取所有参数名
Enumeration<String> names = req.getParameterNames();
\`\`\`

注意:\`getParameterMap()\` 返回的是 \`Map<String, String[]>\`,即使单值参数也是数组,因为底层统一处理。\`getParameterValues\` 用于多值场景(复选框、多选下拉框)。

### 请求头获取

HTTP 头是键值对,API 用 \`getHeader\` 系列:

\`\`\`java
String ua = req.getHeader("User-Agent");      // 获取指定头
long len = req.getContentLength();             // 等价于 Content-Length
String ct = req.getContentType();               // Content-Type
String host = req.getHeader("Host");
int port = req.getIntHeader("X-Custom-Num");    // 数值头(返回 int)

Enumeration<String> names = req.getHeaderNames(); // 所有头名
while (names.hasMoreElements()) {
    String h = names.nextElement();
    System.out.println(h + ": " + req.getHeader(h));
}
\`\`\`

常用头:\`User-Agent\`(客户端类型)、\`Referer\`(来源)、\`Authorization\`(令牌)、\`Accept\`(可接受类型)、\`Cookie\`(会话)。

### 请求体读取

对于非表单的请求体(如 JSON、文件),需要直接读流:

\`\`\`java
// 字节流:适合二进制(文件上传)
ServletInputStream in = req.getInputStream();
byte[] buf = new byte[1024];
int n;
ByteArrayOutputStream out = new ByteArrayOutputStream();
while ((n = in.read(buf)) != -1) {
    out.write(buf, 0, n);
}
byte[] body = out.toByteArray();

// 字符流:适合文本(JSON、XML)
BufferedReader reader = req.getReader();
String line;
StringBuilder sb = new StringBuilder();
while ((line = reader.readLine()) != null) {
    sb.append(line);
}
String json = sb.toString();
\`\`\`

**注意**:\`getInputStream\` 与 \`getReader\` 二选一,不能同时用(流只能读一次)。若已用 \`getParameter\` 读过表单,再读流会为空。

### 请求转发(forward)

转发是服务器**内部**的资源跳转,浏览器地址栏不变:

\`\`\`java
// 在 Servlet A 中转发到 Servlet B
req.getRequestDispatcher("/b").forward(req, resp);
\`\`\`

转发的特点:

- **一次请求**:浏览器只发一次请求,A 与 B 共享同一个 request 对象。
- **地址栏不变**:浏览器看到的是 A 的 URL。
- **内部跳转**:只能转发到**同应用内**的资源,不能跨域。
- **可传数据**:通过 \`request.setAttribute\` 把数据带给 B。

\`\`\`java
// A 设置属性后转发
req.setAttribute("msg", "来自A的数据");
req.getRequestDispatcher("/b").forward(req, resp);

// B 中读取
String msg = (String) req.getAttribute("msg");
\`\`\`

转发常用于:Servlet 处理完业务后,把结果交给 JSP/模板渲染。

### request 域属性

\`request\` 对象本身就是一个"数据容器",可在请求链中传递数据:

\`\`\`java
req.setAttribute("user", userObj);     // 存任意对象
Object u = req.getAttribute("user");   // 取(需强转)
req.removeAttribute("user");           // 删
Enumeration<String> attrs = req.getAttributeNames();  // 所有属性名
\`\`\`

作用域:**一次请求**。请求结束(响应已发送)就失效。转发链中 A 和 B 是同一次请求,所以能共享。

### CharacterEncoding 处理 POST 乱码

这是 POST 中文乱码的根治方法:

\`\`\`java
// ★ 必须在 getParameter 之前调用!
req.setCharacterEncoding("UTF-8");
String name = req.getParameter("name");   // 中文正常
\`\`\`

原理:POST 参数在请求体,容器默认用 ISO-8859-1 解码。\`setCharacterEncoding\` 告诉容器用 UTF-8 解析请求体。**必须在读取参数前调用**,否则已解码完来不及生效。

GET 参数在 URL 里,Tomcat 用 \`URIEncoding\` 解码(server.xml 配置,Tomcat 8+ 默认 UTF-8)。

乱码的通用原因:**编码与解码用了不同字符集**。排查时确认每一步用什么编码:
- 浏览器发送用什么编码(HTML 的 \`charset\`)。
- 容器解析用什么编码(\`setCharacterEncoding\` / \`URIEncoding\`)。
- 数据库存取用什么编码(连接串 \`characterEncoding\`)。

### 其他常用方法

\`\`\`java
req.getMethod();          // GET / POST
req.getRequestURI();      // /app/user
req.getRequestURL();      // http://localhost:8080/app/user(完整)
req.getQueryString();     // id=1&name=xx(查询串)
req.getContextPath();     // /app(上下文路径)
req.getServletPath();     // /user(Servlet 路径)
req.getPathInfo();        // 路径额外信息
req.getRemoteAddr();      // 客户端 IP
req.getRemoteHost();      // 客户端主机名
req.getLocale();          // 客户端语言(国际化)
req.getProtocol();        // HTTP/1.1
req.isSecure();           // 是否 HTTPS
\`\`\`

## 设计原则

### 1. 先设编码再读参数

\`req.setCharacterEncoding("UTF-8")\` 必须在所有 \`getParameter\` 之前。用过滤器(Filter)统一设置是最佳实践,避免每个 Servlet 都写。

### 2. 请求体只读一次

\`getInputStream\` 与 \`getReader\` 是互斥的,且流只能读一次。若要在过滤器与 Servlet 都读 body,需用包装器缓存(如 Spring 的 \`ContentCachingRequestWrapper\`)。

### 3. request 域只放本次请求需要的数据

跨请求的数据用 Session,跨用户的数据用 ServletContext。不要滥用 request 域存大对象(占内存且请求结束才回收)。

### 4. 参数校验在入口

读取参数后立即校验(非空、格式、范围),非法输入早返回,不要让脏数据流入业务层。

## 使用场景

- **表单处理**:读取并校验用户提交的注册、登录、订单表单。
- **JSON API**:前后端分离时,读 JSON body 反序列化为对象。
- **文件上传**:读 \`multipart\` 体的文件字节(\`@MultipartConfig\`)。
- **请求转发**:Servlet 处理逻辑后转 JSP 渲染页面。
- **国际化**:根据 \`Accept-Language\` 选语言包。

## 代码逐行讲解

下面演示一个注册表单的完整处理:

\`\`\`java
package com.example;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

@WebServlet("/register")
public class RegisterServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        // ★ 第一步:设置请求编码(POST 中文不乱码的关键)
        req.setCharacterEncoding("UTF-8");
        resp.setContentType("text/html;charset=UTF-8");

        PrintWriter out = resp.getWriter();

        // 第二步:读取单个参数
        String username = req.getParameter("username");
        String password = req.getParameter("password");
        String email = req.getParameter("email");

        // 第三步:读取多值参数(复选框 hobby)
        String[] hobbies = req.getParameterValues("hobby");

        // 第四步:参数校验(简单的非空校验)
        if (username == null || username.trim().isEmpty()) {
            out.println("<p style='color:red'>用户名不能为空</p>");
            return;   // 早返回,不继续处理
        }
        if (password == null || password.length() < 6) {
            out.println("<p style='color:red'>密码至少 6 位</p>");
            return;
        }

        // 第五步:读取请求头信息
        String userAgent = req.getHeader("User-Agent");
        String isMobile = userAgent != null && userAgent.contains("Mobile") ? "移动端" : "PC";

        // 第六步:遍历所有参数(调试用)
        out.println("<h2>注册成功</h2>");
        out.println("<p>用户名: " + username + "</p>");
        out.println("<p>邮箱: " + email + "</p>");
        out.println("<p>设备: " + isMobile + "</p>");
        out.println("<p>爱好: ");
        if (hobbies != null) {
            for (String h : hobbies) {
                out.println(h + " ");
            }
        }
        out.println("</p>");

        // 第七步:把用户对象存入 request 域,转发到结果页
        User user = new User(username, email);
        req.setAttribute("user", user);
        // 转发到 /result(共享同一个 request)
        req.getRequestDispatcher("/result").forward(req, resp);
    }

    // 简单 POJO
    static class User {
        String name; String email;
        User(String n, String e) { name = n; email = e; }
    }
}
\`\`\`

逐行解释:

- \`req.setCharacterEncoding("UTF-8")\`:POST 表单中文不乱码的第一行,**必须在 getParameter 前**。
- \`req.getParameterValues("hobby")\`:复选框同名多值,返回数组。若没选返回 \`null\`,要先判空。
- 参数校验后 \`return\`:非法输入早返回,避免后续逻辑出错。生产应用更严格的校验(正则、Bean Validation)。
- \`req.getHeader("User-Agent")\`:读请求头判断客户端类型。简单判断移动端(不严谨,UA 可伪造)。
- \`req.setAttribute("user", user)\`:存对象到 request 域,转发链可读。
- \`getRequestDispatcher("/result").forward(req, resp)\`:转发到 \`/result\` Servlet,地址栏不变,共享 request。

读取 JSON body 的示例:

\`\`\`java
@WebServlet("/api/user")
public class JsonApiServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        // JSON 请求需用字符流读取
        BufferedReader reader = req.getReader();
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        String json = sb.toString();
        // 用 Jackson 解析:User u = new ObjectMapper().readValue(json, User.class);
        System.out.println("收到 JSON: " + json);

        resp.setContentType("application/json;charset=UTF-8");
        resp.getWriter().println("{\\"code\\":0,\\"msg\\":\\"ok\\"}");
    }
}
\`\`\`

- \`req.getReader()\`:返回 \`BufferedReader\`,适合读文本(JSON、XML)。
- 注意 \`getReader\` 与 \`getInputStream\` 只能用一个,且只能读一次。

## 对比

| 跳转方式 | forward(转发) | sendRedirect(重定向) |
| --- | --- | --- |
| 发起方 | 服务器内部 | 浏览器(服务器返回 302) |
| 请求数 | 1 次(共享 request) | 2 次(新 request) |
| 地址栏 | 不变 | 变为目标 URL |
| 跨应用 | 否(仅本应用内) | 是(可任意 URL) |
| 传数据 | request 域属性 | URL 参数或 Session |
| 适合 | 内部页面渲染 | 跳首页、跳外部、避免重复提交 |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| POST 中文乱码 | 未设请求编码 | \`getParameter\` 前 \`setCharacterEncoding("UTF-8")\` |
| getParameterValues 返回 null | 用户没选任何复选框 | 先判 null 再遍历 |
| getReader 读不到数据 | 已先调 getParameter 解析了表单 | 表单与 JSON 互斥,二选一 |
| 转发后还写响应 | forward 后容器已提交响应 | forward 后立即 return,不要再 out.write |
| 乱码出现在 GET 参数 | URL 编码不一致 | Tomcat 配 URIEncoding=UTF-8,或前端 URLEncoder.encode |
| 转发到外部应用报错 | forward 只能本应用内 | 改用 sendRedirect 跨域跳转 |
| request 域存大数据没回收 | request 生命周期到响应结束 | 别存大对象,用数据库或缓存 |`,
  },

  // =========================================================
  // 第七章:响应处理:HttpServletResponse
  // =========================================================
  {
    id: "jw-07",
    group: "Servlet 入门",
    icon: "🔌",
    title: "响应处理:HttpServletResponse",
    content: `# 响应处理:HttpServletResponse

## 概念讲解

### HttpServletResponse 概述

\`HttpServletResponse\` 是 Servlet 输出响应的入口。容器为每个请求创建一个 response 对象,Servlet 通过它设置状态码、响应头、响应体。响应一旦"提交"(committed,即已发到网络),就不能再改状态码与头了。

\`HttpServletResponse\` 继承自 \`ServletResponse\`,增加 HTTP 特有方法(状态码、HTTP 头)。

### 处理响应乱码

响应乱码与请求乱码类似,根源是编码不一致。响应涉及三步:

1. **服务器写**:用某字符集把字符串编码成字节。
2. **网络传输**:字节原样传输。
3. **浏览器解码**:按某字符集把字节解析成字符。

只有三步用同一字符集,才不乱码。控制方法:

\`\`\`java
// 方式一:setContentType(同时设 Content-Type 头与响应编码)
resp.setContentType("text/html;charset=UTF-8");

// 方式二:setCharacterEncoding + setContentType(分开设)
resp.setCharacterEncoding("UTF-8");   // 只设编码
resp.setContentType("text/html");      // 只设 MIME
\`\`\`

推荐方式一,一行搞定。\`charset=UTF-8\` 既告诉 Tomcat 用 UTF-8 编码响应体,又写入 \`Content-Type\` 头告诉浏览器用什么解码。

**关键时序**:这些设置必须在 \`getWriter()\` **之前**调用!因为 \`getWriter\` 会根据当前编码创建字符流,之后再设编码不生效。

### getWriter 与 getOutputStream

response 有两个输出流,二选一:

- **\`getWriter()\`**:返回 \`PrintWriter\`,字符流,适合输出文本(HTML、JSON、XML)。
- **\`getOutputStream()\`**:返回 \`ServletOutputStream\`,字节流,适合输出二进制(图片、文件下载、PDF)。

\`\`\`java
// 字符流输出 HTML
PrintWriter out = resp.getWriter();
out.println("<html>...</html>");

// 字节流输出图片
ServletOutputStream sos = resp.getOutputStream();
sos.write(imageBytes);
\`\`\`

**不能同时用**:一个 response 只能用一个流,两个都调会抛 \`IllegalStateException\`。

### 响应头设置

\`\`\`java
resp.setHeader("Content-Type", "text/html");   // 设置(覆盖)
resp.addHeader("X-Custom", "v1");                // 添加(可多个同名)
resp.setIntHeader("X-Count", 100);               // 数值头
resp.setDateHeader("Expires", System.currentTimeMillis());  // 日期头(毫秒)
\`\`\`

常用响应头:

- \`Content-Type\`:响应体类型与编码(也可 \`setContentType\`)。
- \`Content-Length\`:字节数(可 \`setContentLength\`)。
- \`Cache-Control\`:缓存策略(\`no-cache\`、\`max-age=3600\`)。
- \`Location\`:重定向目标(配合 302)。
- \`Content-Disposition\`:文件下载(\`attachment; filename=xx.pdf\`)。
- \`Set-Cookie\`:下发 Cookie(也可 \`resp.addCookie\`)。

### 重定向 sendRedirect

重定向是让浏览器**重新发一次请求**到新地址:

\`\`\`java
resp.sendRedirect("/app/success");   // 浏览器会跳转到 /app/success
\`\`\`

底层原理:服务器返回 \`302\` 状态码 + \`Location\` 头,浏览器收到后自动再发一次 GET 到 Location。

特点(与转发对比):

- **两次请求**:原请求结束,浏览器发新请求。
- **地址栏变化**:看到目标 URL。
- **新 request**:不共享原 request 域数据(要用 Session 或 URL 参数传)。
- **可跨应用**:可重定向到任意 URL(外部网站也行)。

适合场景:登录后跳首页、表单提交后跳结果页(避免重复提交)、跳外部链接。

### 响应状态码

\`\`\`java
resp.setStatus(200);              // 设置 2xx/3xx(普通)
resp.setStatus(404);              // 客户端错误
resp.sendError(404, "页面不存在");  // 发送错误页(容器默认错误页)
resp.sendError(500, "服务器异常");
\`\`\`

\`setStatus\` 只设状态码,\`sendError\` 还会清空缓冲区并触发错误页处理。生产环境自定义错误页常用 web.xml 的 \`<error-page>\`:

\`\`\`xml
<error-page>
    <error-code>404</error-code>
    <location>/404.html</location>
</error-page>
\`\`\`

### 文件下载实现

文件下载是 response 的经典应用。原理:把文件字节写入 \`getOutputStream\`,设 \`Content-Disposition\` 头让浏览器下载而非显示:

\`\`\`java
@WebServlet("/download")
public class DownloadServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        String filename = "report.pdf";
        // 设置响应头:让浏览器下载文件
        resp.setContentType("application/octet-stream");   // 二进制流
        resp.setHeader("Content-Disposition",
            "attachment; filename=\\"" + filename + "\\"");

        // 读文件字节,写入响应流
        String path = "/data/" + filename;
        FileInputStream fis = new FileInputStream(path);
        ServletOutputStream out = resp.getOutputStream();
        byte[] buf = new byte[4096];
        int n;
        while ((n = fis.read(buf)) != -1) {
            out.write(buf, 0, n);
        }
        fis.close();
        out.flush();
    }
}
\`\`\`

关键点:

- \`Content-Type: application/octet-stream\`:通用二进制类型,浏览器不知道怎么打开就下载。
- \`Content-Disposition: attachment; filename="xxx"\`:\`attachment\` 强制下载,\`filename\` 指定保存名。
- 中文文件名要做 URL 编码(\`URLEncoder.encode\`),否则部分浏览器乱码。

## 设计原则

### 1. 先设头与编码,再获取输出流

状态码、响应头、编码必须在 \`getWriter/getOutputStream\` **之前**设置。一旦开始写响应体,响应就被"提交"(committed),改头无效。

### 2. 字符流与字节流二选一

文本用 \`getWriter\`,二进制用 \`getOutputStream\`,不要混用。

### 3. 重定向避免重复提交

POST 表单处理后用 \`sendRedirect\` 跳转(PRG 模式:Post-Redirect-Get),防止用户刷新重复提交。

### 4. 大文件下载用流式传输

不要把大文件整个读进内存,用缓冲区分块读写,避免 OOM。

## 使用场景

- **页面渲染**:返回 HTML(传统 JSP 模式)。
- **JSON API**:返回 \`application/json\`(前后端分离)。
- **文件下载**:PDF、Excel、图片下载。
- **图片验证码**:动态生成图片字节返回。
- **重定向**:登录后跳转、表单提交后跳页。

## 代码逐行讲解

下面演示一个完整的响应处理 Servlet,涵盖多种输出:

\`\`\`java
package com.example;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.*;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/resp")
public class ResponseDemoServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        String type = req.getParameter("type");   // ?type=html|json|redirect|download

        switch (type == null ? "html" : type) {

            case "html":
                // 情况1:输出 HTML 页面
                // ★ 必须在 getWriter 前设编码
                resp.setContentType("text/html;charset=UTF-8");
                // 设置自定义响应头
                resp.setHeader("X-Powered-By", "MyApp");
                PrintWriter out = resp.getWriter();
                out.println("<!DOCTYPE html>");
                out.println("<html><body>");
                out.println("<h1>HTML 响应</h1>");
                out.println("<p>当前时间: " + new java.util.Date() + "</p>");
                out.println("</body></html>");
                break;

            case "json":
                // 情况2:返回 JSON(前后端分离常用)
                resp.setContentType("application/json;charset=UTF-8");
                // 禁用缓存(动态 JSON 不应缓存)
                resp.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
                resp.setHeader("Pragma", "no-cache");
                resp.setDateHeader("Expires", 0);

                PrintWriter jsonOut = resp.getWriter();
                // 生产环境用 Jackson/Gson 序列化,这里手写演示
                jsonOut.println("{");
                jsonOut.println("  \\"code\\": 0,");
                jsonOut.println("  \\"msg\\": \\"success\\",");
                jsonOut.println("  \\"data\\": { \\"name\\": \\"张三\\", \\"age\\": 20 }");
                jsonOut.println("}");
                break;

            case "redirect":
                // 情况3:重定向到首页
                // 注意路径:建议用 contextPath 拼绝对路径
                String ctx = req.getContextPath();
                resp.sendRedirect(ctx + "/index.html");
                // 重定向后不要继续写响应
                break;

            case "error":
                // 情况4:发送错误状态
                resp.sendError(403, "无权访问");
                break;

            case "download":
                // 情况5:文件下载(简化版)
                resp.setContentType("application/octet-stream");
                resp.setHeader("Content-Disposition",
                    "attachment; filename=\\"hello.txt\\"");
                ServletOutputStream sos = resp.getOutputStream();
                sos.write("Hello, 这是要下载的文件内容。".getBytes("UTF-8"));
                sos.flush();
                break;

            default:
                resp.setStatus(400);
                resp.getWriter().println("不支持的 type 参数");
        }
    }
}
\`\`\`

逐行解释:

- \`switch (type)\`:根据参数演示不同响应类型,实际项目按需选一种。
- \`resp.setHeader("X-Powered-By", "MyApp")\`:自定义响应头,可用 \`X-\` 前缀(虽新规范不强制)。
- JSON 场景设 \`Cache-Control: no-cache\`:动态数据不应被浏览器/CDN 缓存。
- \`resp.sendRedirect(ctx + "/index.html")\`:用 \`contextPath\` 拼绝对路径,避免不同部署路径下 404。
- \`resp.sendError(403, ...)\`:触发错误页,403 表示禁止访问。
- 下载场景:\`Content-Disposition: attachment\` 强制下载,文件名用双引号包裹。

文件下载的中文文件名处理:

\`\`\`java
String filename = "报表.pdf";
// 不同浏览器对中文文件名处理不同,通用做法:URL 编码
String encoded = java.net.URLEncoder.encode(filename, "UTF-8").replace("+", "%20");
resp.setHeader("Content-Disposition",
    "attachment; filename=\\"" + encoded + "\\"; filename*=UTF-8''" + encoded);
\`\`\`

- \`filename="xxx"\`:旧浏览器用,需编码。
- \`filename*=UTF-8''xxx\`:RFC 5987 标准,现代浏览器优先用,可正确显示中文。

## 对比

| 输出方式 | getWriter | getOutputStream | sendRedirect | sendError |
| --- | --- | --- | --- | --- |
| 类型 | 字符流 | 字节流 | 重定向 | 错误响应 |
| 适合 | HTML/JSON 文本 | 图片/文件二进制 | 跳页 | 报错 |
| 可同时用 | 否(二选一) | 否 | 否 | 否 |
| 提交后可改 | 否 | 否 | 否 | 否 |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| 响应中文乱码 | 未设编码或设在 getWriter 之后 | \`getWriter\` 前 \`setContentType("...;charset=UTF-8")\` |
| IllegalStateException | getWriter 与 getOutputStream 都调 | 一个 response 只用一个流 |
| 响应已提交无法设头 | 已开始写响应体才设头 | 所有头与编码在写响应前设 |
| 重定向后还写响应 | 重定向是结束当前响应 | sendRedirect 后立即 return |
| 重定向路径错误 | 用相对路径在不同部署下失效 | 用 contextPath 拼绝对路径 |
| 下载文件名中文乱码 | 浏览器对中文文件名编码不同 | URLEncoder.encode + filename* 语法 |
| 大文件下载 OOM | 整个文件读进内存 | 用缓冲区分块流式读写 |
| JSON 没禁缓存被 CDN 缓存 | 未设 Cache-Control | 动态 JSON 设 no-cache/no-store |`,
  },

  // =========================================================
  // 第八章:会话管理:Cookie 与 HttpSession
  // =========================================================
  {
    id: "jw-08",
    group: "Servlet 入门",
    icon: "🔌",
    title: "会话管理:Cookie 与 HttpSession",
    content: `# 会话管理:Cookie 与 HttpSession

## 概念讲解

### 为什么需要会话管理

HTTP 是**无状态**协议:服务器处理完请求就"忘记"了客户端。但很多业务需要"记住"用户:登录后保持登录态、购物车跨页面保留商品、记住上次选择的语言。**会话管理**就是在无状态的 HTTP 上构建"有状态"体验的机制。

两种主流方案:

- **Cookie**:数据存在**客户端**(浏览器)。
- **Session**:数据存在**服务端**,通过一个 ID 关联客户端。

实际中常组合使用:Session 在服务端存数据,用 Cookie 携带 Session ID。

### Cookie 详解

**Cookie** 是服务器通过响应头 \`Set-Cookie\` 下发到浏览器的一小段数据。浏览器保存后,后续对同域的请求会自动通过 \`Cookie\` 请求头带回。

**Cookie 的属性**:

| 属性 | 作用 | 示例 |
| --- | --- | --- |
| \`Name=Value\` | 键值对 | \`user=zhangsan\` |
| \`Max-Age\` | 有效期(秒),到期自动删除 | \`Max-Age=3600\`(1小时) |
| \`Expires\` | 过期时间点(旧属性) | \`Expires=Wed, 09 Jun 2026 ...\` |
| \`Path\` | 生效路径 | \`Path=/app\`(只 /app 下请求带) |
| \`Domain\` | 生效域名 | \`Domain=.example.com\`(子域共享) |
| \`Secure\` | 仅 HTTPS 传输 | \`Secure\` |
| \`HttpOnly\` | JS 无法读取(防 XSS) | \`HttpOnly\` |
| \`SameSite\` | 跨站发送策略(防 CSRF) | \`SameSite=Lax\` |

**Cookie 的创建与读取**:

\`\`\`java
// 创建 Cookie
Cookie cookie = new Cookie("user", "zhangsan");
cookie.setMaxAge(3600);        // 1小时后过期
cookie.setPath("/");            // 对全站生效
cookie.setHttpOnly(true);        // JS 读不到,防 XSS
cookie.setSecure(true);         // 仅 HTTPS 发送
resp.addCookie(cookie);         // 通过 Set-Cookie 头下发

// 读取 Cookie(从请求中)
Cookie[] cookies = req.getCookies();
if (cookies != null) {
    for (Cookie c : cookies) {
        if ("user".equals(c.getName())) {
            String value = c.getValue();   // zhangsan
        }
    }
}

// 删除 Cookie:设 MaxAge=0 再下发
Cookie del = new Cookie("user", "");
del.setMaxAge(0);              // 立即过期
del.setPath("/");               // 路径要和创建时一致!
resp.addCookie(del);
\`\`\`

**关键点**:

- Cookie 有**大小限制**(约 4KB),且**每个域名 cookie 总数有限**(约 50 个)。
- **删除 Cookie 必须设相同 Path 与 Domain**,否则浏览器视为不同 cookie,删不掉。
- \`MaxAge < 0\`:会话级(浏览器关闭就删);\`MaxAge = 0\`:立即删;\`MaxAge > 0\`:存活指定秒。
- \`HttpOnly\`:设了之后 \`document.cookie\` 读不到,防 XSS 窃取。**敏感 Cookie 必加**。

### Session 原理(JSESSIONID)

**HttpSession** 是服务端保存的会话对象。它的工作原理:

\`\`\`
1. 用户首次访问 → 服务器调 req.getSession() → 创建 Session,生成唯一 ID
2. 服务器通过 Set-Cookie: JSESSIONID=xxx 下发 ID 给浏览器
3. 后续请求浏览器自动带 Cookie: JSESSIONID=xxx
4. 服务器据 ID 找到对应 Session → 读取/写入数据
\`\`\`

关键:\`JSESSIONID\` 是默认的 Cookie 名,Tomcat 用它关联 Session。如果浏览器禁用 Cookie,可用 **URL 重写**(\`resp.encodeURL(url)\`)把 ID 拼在 URL 上(\`;jsessionid=xxx\`),但现代应用很少这么做了。

### HttpSession API

\`\`\`java
// 获取或创建 Session
HttpSession session = req.getSession();        // 没有就创建
HttpSession session = req.getSession(false);   // 没有返回 null(不创建)

// 存取数据(任意 Java 对象)
session.setAttribute("user", userObj);
Object u = session.getAttribute("user");   // 需强转
session.removeAttribute("user");

// 其他方法
session.getId();              // 会话 ID
session.getCreationTime();    // 创建时间(毫秒)
session.getLastAccessedTime(); // 最后访问时间
session.setMaxInactiveInterval(1800);  // 30 分钟不活动则失效
session.isNew();              // 是否本次新建

// 销毁 Session(注销登录)
session.invalidate();         // 清空所有数据并销毁
\`\`\`

Session 数据存在服务端内存,可存任意大小的对象(但要考虑内存占用)。一个用户一个 Session,Session 间数据隔离。

### Session 超时配置

Session 不能永久占用内存,需要过期机制:

**方式一:web.xml(全局)**

\`\`\`xml
<session-config>
    <session-timeout>30</session-timeout>   <!-- 单位:分钟 -->
</session-config>
\`\`\`

**方式二:代码(单个 Session)**

\`\`\`java
session.setMaxInactiveInterval(30 * 60);   // 单位:秒,30 分钟
\`\`\`

**方式三:Tomcat web.xml(全局默认)**

\`conf/web.xml\` 里默认 30 分钟。

超时机制:\`MaxInactiveInterval\` 是"两次请求间的最大间隔",超过就失效。每次访问会重置计时。设 \`0\` 或负数表示永不过期(不推荐,易内存泄漏)。

### Session 持久化

Tomcat 支持把 Session 持久化到磁盘,重启不丢失。配置 \`conf/context.xml\` 的 \`<Manager>\` 元素。但实际生产更多用 Redis 等外部存储做 Session 共享(见下)。

### 分布式 Session 问题预览

当应用部署到多台服务器(集群),问题来了:

\`\`\`
用户登录 → 请求落到服务器A → Session 存在 A 的内存
下次请求 → 负载均衡到服务器B → B 没有 Session → 用户被踢出!
\`\`\`

解决方案:

1. **Session 粘性(Sticky Session)**:负载均衡按 JSESSIONID 固定路由到同一台。简单但有单点风险。
2. **Session 复制**:Tomcat 集群间同步 Session。开销大,节点多时不适用。
3. **集中存储(主流)**:Session 存 Redis 等共享存储,所有服务器都访问同一份。Spring Session + Redis 是现代标准方案。
4. **无状态令牌(JWT)**:不用 Session,身份信息编码在令牌里由客户端携带,服务端无状态。彻底解决扩展问题。

## 设计原则

### 1. 敏感数据存 Session,非敏感存 Cookie

登录状态、用户 ID 存 Session(服务端,安全);语言偏好、最近浏览等放 Cookie(省服务端内存)。

### 2. Cookie 必加 HttpOnly + Secure

防 XSS 窃取(HttpOnly)、防明文传输(Secure)、防 CSRF(SameSite=Lax)。

### 3. Session 数据尽量小

Session 占服务端内存,不要存大集合。需要的大数据存 Redis,Session 只存 ID。

### 4. 注销要 invalidate

登出时调 \`session.invalidate()\`,不要只删某个属性,确保彻底销毁。

### 5. 分布式用集中存储或 JWT

集群环境避免内存 Session,用 Redis Session 或 JWT 无状态方案。

## 使用场景

- **登录态保持**:登录后 Session 存用户对象,后续请求据 Session 判断已登录。
- **购物车**:未登录也可用 Session 存购物车(登录后合并到账户)。
- **验证码**:生成后存 Session,提交时比对。
- **记住我**:Cookie 存长期令牌,下次自动登录。
- **个性化**:Cookie 存语言、主题偏好。

## 代码逐行讲解

下面是一个登录登出 + 访问计数的完整示例:

\`\`\`java
package com.example;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.concurrent.atomic.AtomicInteger;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        resp.setContentType("text/html;charset=UTF-8");

        String username = req.getParameter("username");
        String password = req.getParameter("password");
        String remember = req.getParameter("remember");  // 记住我复选框

        // 1. 简单校验(实际用数据库 + 加密)
        if (!"admin".equals(username) || !"123456".equals(password)) {
            resp.getWriter().println("<p>用户名或密码错误</p>");
            return;
        }

        // 2. 登录成功,创建/获取 Session
        HttpSession session = req.getSession();
        session.setAttribute("user", username);     // 存登录用户
        session.setMaxInactiveInterval(30 * 60);     // 30 分钟不活动失效

        // 3. 记住我:用 Cookie 存长期令牌
        if ("on".equals(remember)) {
            Cookie tokenCookie = new Cookie("authToken", "some-jwt-token-here");
            tokenCookie.setMaxAge(7 * 24 * 3600);   // 7 天
            tokenCookie.setPath("/");
            tokenCookie.setHttpOnly(true);           // 防 XSS
            tokenCookie.setSecure(req.isSecure());    // HTTPS 时才 Secure
            resp.addCookie(tokenCookie);
        }

        // 4. 重定向到首页(PRG 模式,防重复提交)
        resp.sendRedirect(req.getContextPath() + "/home");
    }
}

// 首页:显示登录信息与访问计数
@WebServlet("/home")
class HomeServlet extends HttpServlet {
    // 应用级访问计数(ServletContext 属性)
    @Override
    public void init() {
        getServletContext().setAttribute("visitCount", new AtomicInteger(0));
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        resp.setContentType("text/html;charset=UTF-8");
        HttpSession session = req.getSession(false);   // 不创建

        // 未登录拦截
        if (session == null || session.getAttribute("user") == null) {
            resp.sendRedirect(req.getContextPath() + "/login.html");
            return;
        }

        // 计数+1
        AtomicInteger count = (AtomicInteger) getServletContext().getAttribute("visitCount");
        int total = count.incrementAndGet();

        PrintWriter out = resp.getWriter();
        out.println("<h1>欢迎," + session.getAttribute("user") + "</h1>");
        out.println("<p>本应用总访问量: " + total + "</p>");
        out.println("<p>Session ID: " + session.getId() + "</p>");
        out.println("<p>上次访问: " + new java.util.Date(session.getLastAccessedTime()) + "</p>");
        out.println("<a href='/app/logout'>退出</a>");
    }
}

// 登出:销毁 Session
@WebServlet("/logout")
class LogoutServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        HttpSession session = req.getSession(false);
        if (session != null) {
            session.invalidate();   // 彻底销毁 Session
        }
        // 清除记住我 Cookie
        Cookie del = new Cookie("authToken", "");
        del.setMaxAge(0);
        del.setPath("/");
        del.setHttpOnly(true);
        resp.addCookie(del);

        resp.sendRedirect(req.getContextPath() + "/login.html");
    }
}
\`\`\`

逐行解释:

- \`req.getSession()\`:登录时获取或创建 Session。容器自动通过 \`Set-Cookie: JSESSIONID\` 把 ID 发给浏览器。
- \`session.setAttribute("user", username)\`:存登录用户名,后续请求可据此判断已登录。
- \`session.setMaxInactiveInterval(30 * 60)\`:30 分钟无活动自动失效。\`0\` 表示立即失效,负数表示永不超时。
- \`req.getParameter("remember")\`:复选框选中时值是 \`on\`(或自定义 value),未选则参数不存在。
- \`tokenCookie.setHttpOnly(true)\`:**记住我 Cookie 必加**,否则 JS 可读取被窃。
- \`req.getSession(false)\`:首页用 \`false\`,没 Session 返回 null 而非创建新空 Session(否则无法判断未登录)。
- \`session.invalidate()\`:登出时彻底销毁,清空所有数据,后续请求需重新登录。
- 删除 Cookie 时 \`setMaxAge(0)\` + **相同 Path**,浏览器才会删原 Cookie。

## 对比

| 维度 | Cookie | HttpSession |
| --- | --- | --- |
| 存储位置 | 客户端(浏览器) | 服务端(内存/Redis) |
| 大小限制 | 约 4KB/个 | 理论无限制(受内存) |
| 安全性 | 低(客户端可改) | 高(服务端可控) |
| 性能 | 不占服务端内存,每次请求携带 | 占内存,但传输小(仅 ID) |
| 生命周期 | 可长期(Max-Age) | 默认会话级或短超时 |
| 跨域 | 受同源策略限制 | 通过 ID Cookie 关联,跨域需特殊处理 |
| 适合 | 偏好、非敏感令牌 | 登录态、购物车 |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| Cookie 删不掉 | Path/Domain 与创建时不一致 | 删除时设相同 Path 与 Domain |
| Cookie 被 JS 读取 | 未设 HttpOnly | 敏感 Cookie 设 \`setHttpOnly(true)\` |
| 登出后仍能访问 | 只 removeAttribute 未 invalidate | 用 \`session.invalidate()\` 彻底销毁 |
| Session 丢失(集群) | 多机 Session 不共享 | 用 Redis Session 或 JWT |
| Session 占满内存 | 存大对象或永不超时 | 数据小、设合理超时、用缓存 |
| getSession(false) 误判 | 新建空 Session 也算"已登录" | 用 false 不创建,再判属性 |
| JSESSIONID 泄露 | URL 重写导致 ID 出现在日志 | 禁用 URL 重写,强制用 Cookie |
| CSRF 攻击 | Cookie 自动携带被利用 | 设 \`SameSite=Lax\`,加 CSRF Token |`,
  },
];
