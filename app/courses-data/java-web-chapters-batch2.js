// =============================================================
// Java Web 应用开发教程 —— 第二批章节
// 分组:Servlet 入门(共 4 章)
// -------------------------------------------------------------
// 本文件包含以下章节:
//   jw-05: Servlet 基础与生命周期
//   jw-06: HttpServletRequest 请求处理
//   jw-07: HttpServletResponse 响应处理
//   jw-08: 请求转发与重定向
//
// 每个章节 content 包含六个模块:
//   概念解释 / 设计原理 / 使用场景 / 代码示例 / 对比分析 / 常见陷阱
// =============================================================

export const chapters = [
  // =========================================================
  // 第五章:Servlet 基础与生命周期
  // =========================================================
  {
    id: "jw-05",
    group: "Servlet 入门",
    icon: "⚙️",
    title: "Servlet 基础与生命周期",
    content: `# Servlet 基础与生命周期

## 概念解释

**Servlet** 是 Java Web 的核心抽象:一个运行在 Servlet 容器中的 Java 类,负责接收 HTTP 请求、处理业务、生成响应。所有 Java Web 框架(Spring MVC、Struts)底层都是 Servlet 的封装。理解 Servlet,就理解了 Java Web 的"骨架"。

Servlet 的本质是实现了 \`jakarta.servlet.Servlet\` 接口的 Java 对象。容器(Tomcat)负责它的实例化、初始化、调用、销毁——这就是"生命周期"。

Servlet 的类继承体系:\`Servlet\` 接口 → \`GenericServlet\`(抽象类,通用协议)→ \`HttpServlet\`(抽象类,HTTP 专用)→ 我们自己写的 Servlet。日常开发只需继承 \`HttpServlet\`,重写 \`doGet\`/\`doPost\` 即可。

\`HttpServlet\` 的 \`service()\` 方法会根据 HTTP 方法自动分发:\`GET\` → \`doGet\`、\`POST\` → \`doPost\`、\`PUT\` → \`doPut\`、\`DELETE\` → \`doDelete\`。若未重写对应方法,默认返回 405 Method Not Allowed。

## 设计原理

Servlet 生命周期由容器全程管理,开发者只在关键节点插入逻辑:

1. **加载与实例化**:容器首次收到请求(或 \`loadOnStartup\` 启动时),用反射调用无参构造创建实例。**Servlet 默认是单例**(一个类只有一个实例),除非实现 \`SingleThreadModel\`(已废弃,不推荐)。
2. **初始化**:容器调用 \`init(ServletConfig)\` 一次,传入配置参数(\`@WebInitParam\` 或 web.xml 的 \`<init-param>\`)。适合做读取配置、建连接池等一次性初始化。
3. **请求处理**:每个请求调一次 \`service()\`,它分发到 \`doGet/doPost\`。**多线程并发调用同一个 Servlet 实例**——这是性能关键,但也意味着 Servlet 不能有实例可变状态,否则会有线程安全问题。
4. **销毁**:容器关闭或应用卸载时调 \`destroy()\` 一次,释放资源(关连接、关线程池)。

为什么 Servlet 设计成单例多线程?因为创建对象有开销,Web 场景请求量大,若每请求 new 一个 Servlet,GC 压力巨大。单例 + 线程池并发,性能最优。代价是开发者必须保证线程安全——局部变量天然安全,实例字段需加锁或避免使用。

\`loadOnStartup\` 控制初始化时机:不配则首次请求时才 init(首请求慢);配为非负整数则容器启动时按数字顺序 init(适合需要预热的应用)。

## 使用场景

**适合**:处理动态请求(表单提交、API 接口)、生成动态内容(报表、流式下载)、做过滤器/监听器基类。**理解框架底层**:Spring MVC 的 \`DispatcherServlet\` 本质就是一个 Servlet。

**不适合**:大量静态资源(交给 Nginx);纯展示页面(用 JSP/Thymeleaf);复杂业务编排(Servlet 应只做请求接发,业务放 Service 层)。

## 代码示例

下面演示完整的生命周期方法:

\`\`\`java
package com.example;

import jakarta.servlet.ServletConfig;       // Servlet 配置接口
import jakarta.servlet.ServletException;     // Servlet 通用异常
import jakarta.servlet.annotation.WebServlet; // URL 映射注解
import jakarta.servlet.http.HttpServlet;     // HTTP Servlet 基类
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

// loadOnStartup=1:容器启动时就初始化,而非首次请求时
@WebServlet(urlPatterns = "/life", loadOnStartup = 1)
public class LifeCycleServlet extends HttpServlet {

    // 1. 构造方法:容器创建实例时调用一次
    public LifeCycleServlet() {
        System.out.println("1. 构造方法:实例化");
    }

    // 2. init:容器初始化时调用一次,可获取配置参数
    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);   // 必须调用父类,保留 ServletConfig
        String dbUrl = config.getInitParameter("dbUrl");  // 读初始化参数
        System.out.println("2. init:初始化,dbUrl=" + dbUrl);
    }

    // 3. service/doGet:每次请求调用,多线程并发
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        // 这里是请求处理逻辑,每次请求都会进入
        resp.setContentType("text/html;charset=UTF-8");   // 设响应类型与编码
        resp.getWriter().println("<h1>请求处理中...</h1>");  // 输出响应体
        System.out.println("3. doGet:处理请求,线程=" + Thread.currentThread().getName());
    }

    // 4. destroy:容器关闭时调用一次,释放资源
    @Override
    public void destroy() {
        System.out.println("4. destroy:销毁,释放资源");   // 适合关闭连接池等
    }
}
\`\`\`

逐行解释:\`@WebServlet(loadOnStartup = 1)\` 让容器启动时即初始化,避免首请求变慢;\`init(ServletConfig)\` 重写时**必须调用 \`super.init(config)\`**,否则 \`getServletConfig()\` 会返回 null;\`config.getInitParameter("dbUrl")\` 读取 \`@WebInitParam\` 配置的参数;\`doGet\` 中打印线程名,可验证"多请求并发用不同线程调用同一实例"。

## 对比分析

| 维度 | Servlet | CGI(Common Gateway Interface) |
| --- | --- | --- |
| 运行方式 | 常驻 JVM,单例多线程 | 每请求启动一个进程 |
| 性能 | 高(无进程创建开销) | 低(进程创建昂贵) |
| 状态共享 | 同实例可共享数据 | 进程隔离,无法共享 |
| 资源占用 | 少(线程级) | 多(进程级) |
| 平台 | 跨平台(基于 JVM) | 依赖系统脚本 |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| Servlet 有实例可变字段 | 单例多线程,实例字段被并发修改 | 用局部变量,或加锁,或用 ThreadLocal |
| 重写 init 漏调 super.init | ServletConfig 丢失 | 必须 \`super.init(config)\` |
| 在构造方法里读配置 | 构造时尚未 init,ServletConfig 为 null | 配置读取放 init 方法 |
| doGet 里写大量业务代码 | Servlet 职责膨胀,难测试 | 业务下沉到 Service 层 |
| loadOnStartup 未配导致首请求慢 | 首次请求才初始化 | 关键 Servlet 配 loadOnStartup |
| 线程安全问题难复现 | 并发时序随机 | 用压测工具并发验证 |`,
  },

  // =========================================================
  // 第六章:HttpServletRequest 请求处理
  // =========================================================
  {
    id: "jw-06",
    group: "Servlet 入门",
    icon: "📥",
    title: "HttpServletRequest 请求处理",
    content: `# HttpServletRequest 请求处理

## 概念解释

**HttpServletRequest** 是 Servlet 容器解析 HTTP 请求后封装的对象,封装了请求行、请求头、请求体、参数、Cookie 等所有信息。开发者在 \`doGet/doPost\` 中通过它读取客户端传来的数据。它是 Java Web 请求处理的"输入端"。

核心能力包括:获取请求参数(\`getParameter\`/\`getParameterValues\`)、获取请求头(\`getHeader\`)、获取请求路径信息(\`getRequestURI\`/\`getQueryString\`)、读取 Cookie(\`getCookies\`)、操作请求属性(\`setAttribute\`/\`getAttribute\`)、获取会话(\`getSession\`)、读取请求体流(\`getInputStream\`)、文件上传(\`getPart\`)。

区分**参数**与**属性**很重要:**参数(parameter)** 来自客户端(查询串或表单体),只读,类型是 String;\`getParameter("name")\` 取单个,\`getParameterValues("name")\` 取多值(如复选框)。**属性(attribute)** 是服务端代码设置的,用于在请求处理链(过滤器、转发)间传递数据,可读写,类型是 Object。

## 设计原理

容器在收到请求时,把 HTTP 报文解析成 \`HttpServletRequest\` 对象,注入给 \`service()\` 方法。请求结束后对象即失效(不要在异步线程里持有它,会引发数据错乱)。

\`getParameter\` 的工作原理:对 GET 请求,从 URL 查询串解析;对 POST 表单请求,从请求体解析(需 \`application/x-www-form-urlencoded\` 类型)。两者可统一用 \`getParameter\` 获取。但注意:**POST 体只能读一次**(流式),若你先 \`getInputStream\` 读过,\`getParameter\` 就取不到——反之亦然。

请求编码:\`setCharacterEncoding\` 只对**请求体**生效(POST),对 GET 的 URL 参数无效——GET 参数的编码由 Connector 的 URIEncoding 决定(Tomcat 8+ 默认 UTF-8)。

属性的作用域:\`request\` 域属性只在**本次请求**有效,转发(forward)时共享,但重定向(redirect)是新请求,属性丢失。

## 使用场景

**读取表单数据**:用户注册、登录、搜索等表单提交。**读取请求头**:做客户端识别(User-Agent)、防盗链(Referer)、内容协商(Accept)。**文件上传**:\`getPart\` 配 \`@MultipartConfig\` 处理 multipart。**请求间传值**:转发前 \`setAttribute\`,目标 Servlet/JSP \`getAttribute\`。**会话管理**:\`getSession\` 获取或创建 Session。

## 代码示例

\`\`\`java
@WebServlet("/form")   // 映射到 /form,处理表单提交
public class FormServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        // ★ 必须在 getParameter 之前设编码,解决 POST 中文乱码
        req.setCharacterEncoding("UTF-8");
        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        // 1. 读取单值参数
        String username = req.getParameter("username");   // 获取 username 字段
        out.println("用户名: " + username);

        // 2. 读取多值参数(复选框 checkbox 同名)
        String[] hobbies = req.getParameterValues("hobby");  // 注意:用 getParameterValues 取多值
        if (hobbies != null) {
            out.println("爱好: " + String.join(", ", hobbies));  // 拼接输出
        }

        // 3. 读取请求头
        String ua = req.getHeader("User-Agent");   // 客户端类型
        String referer = req.getHeader("Referer");   // 来源页
        out.println("客户端: " + ua);

        // 4. 设置请求属性,供转发目标使用
        req.setAttribute("processedAt", System.currentTimeMillis());

        // 5. 获取会话
        HttpSession session = req.getSession();   // 获取或创建 Session
        session.setAttribute("user", username);   // 注意:用户名存入会话,后续请求可读取
    }
}
\`\`\`

逐行解释:\`setCharacterEncoding("UTF-8")\` 必须在读取参数前调用,否则已用默认 ISO-8859-1 解码就晚了;\`getParameterValues\` 取同名多值参数(复选框);\`getHeader\` 按名取请求头,返回 null 表示不存在;\`setAttribute\` 存入对象供后续 \`getAttribute\` 读取;\`getSession\` 获取会话,无则创建,数据跨请求保留。

文件上传需在类上加 \`@MultipartConfig\`,用 \`req.getPart("file")\` 获取:

\`\`\`java
@MultipartConfig   // 开启 multipart 支持,处理文件上传
@WebServlet("/upload")
public class UploadServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException, ServletException {
        req.setCharacterEncoding("UTF-8");   // 设置请求编码
        // getPart 按表单字段名获取上传文件
        Part filePart = req.getPart("avatar");   // 获取名为 avatar 的上传部件
        String fileName = filePart.getSubmittedFileName();   // 原始文件名
        // 写入磁盘
        filePart.write("/uploads/" + fileName);   // 注意:生产环境需校验文件名防路径穿越
    }
}
\`\`\`

## 对比分析

| 维度 | getParameter | getAttribute |
| --- | --- | --- |
| 来源 | 客户端(查询串/表单体) | 服务端代码 set |
| 类型 | String(只能字符串) | Object(任意对象) |
| 可写 | 只读,不可 set | 可读可写 |
| 作用域 | 整个请求期间 | 整个请求期间(转发共享) |
| 典型用途 | 读取用户提交的数据 | 在请求链间传递处理结果 |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| POST 中文乱码 | 未设请求编码 | \`getParameter\` 前 \`setCharacterEncoding("UTF-8")\` |
| getParameter 返回 null | 参数名拼错或未提交 | 检查表单字段 name 属性 |
| POST 体读不到参数 | 先读了 getInputStream | 二者只能读一次,优先用 getParameter |
| 复选框只取到一个值 | 用了 getParameter | 多值用 getParameterValues |
| 文件上传 getPart 返回 null | 未加 @MultipartConfig | 类上加该注解 |
| 异步线程里用 request | 请求已结束,对象失效 | 需要的数据拷贝出来再传给线程 |
| Session 跨域丢 | Cookie 域不匹配 | setCookie 时配 domain |`,
  },

  // =========================================================
  // 第七章:HttpServletResponse 响应处理
  // =========================================================
  {
    id: "jw-07",
    group: "Servlet 入门",
    icon: "📤",
    title: "HttpServletResponse 响应处理",
    content: `# HttpServletResponse 响应处理

## 概念解释

**HttpServletResponse** 是 Servlet 容器提供的响应对象,开发者通过它向客户端写回数据:状态码、响应头、响应体。它是 Java Web 请求处理的"输出端"。

核心能力包括:设置状态码(\`setStatus\`/\`sendError\`)、设置响应头(\`setHeader\`/\`addHeader\`)、设置内容类型与编码(\`setContentType\`)、获取字符输出流(\`getWriter\`)、获取字节输出流(\`getOutputStream\`)、重定向(\`sendRedirect\`)、添加 Cookie(\`addCookie\`)。

响应体有两种写法:**字符流** \`getWriter()\` 适合写文本(HTML/JSON);**字节流** \`getOutputStream()\` 适合写二进制(图片/PDF/文件下载)。**两者互斥**,只能用一个。

## 设计原理

响应头的写入有时机要求:**响应头必须在响应体写入之前设置**。一旦开始写响应体(或调用 flush),Tomcat 会自动提交(commit)响应,此时再设头就无效了——因为头已经发给客户端了。这是新手常踩的坑。

\`setContentType("text/html;charset=UTF-8")\` 同时做两件事:设 Content-Type 头告诉浏览器响应格式,设字符集让 Tomcat 用该编码把字符转字节。所以**写中文前必须设**,否则默认 ISO-8859-1 编码导致乱码。

缓冲机制:Tomcat 默认用缓冲区(约 8KB),写到缓冲区未满时不真正发送,允许你修改头。一旦缓冲区满或显式 flush,响应提交,头锁定。\`setBufferSize\` 可调大小,\`reset()\` 可清空缓冲区回滚到初始(但已提交则不能 reset)。

状态码语义:\`setStatus(200)\` 设成功状态;\`sendError(404, "资源不存在")\` 发送错误页(容器可能用自定义错误页);\`sendRedirect("/login")\` 触发 302 重定向。

## 使用场景

**生成 HTML/JSON**:\`getWriter\` 写文本响应。**文件下载**:\`getOutputStream\` 写字节,配 \`Content-Disposition: attachment\` 头。**重定向**:\`sendRedirect\` 跳转页面。**设置 Cookie**:\`addCookie\` 下发会话标识。**控制缓存**:\`setHeader("Cache-Control", "no-cache")\`。**跨域 CORS**:\`setHeader("Access-Control-Allow-Origin", "*")\`。

## 代码示例

\`\`\`java
@WebServlet("/resp")   // 映射到 /resp,演示响应处理
public class RespServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        // ★ 必须在 getWriter 之前设 Content-Type 与编码
        resp.setContentType("text/html;charset=UTF-8");
        // 设置响应头(如禁缓存)
        resp.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");  // 三管齐下禁缓存

        PrintWriter out = resp.getWriter();   // 获取字符流
        out.println("<html><body>");
        out.println("<h1>响应示例</h1>");
        out.println("</body></html>");
    }
}
\`\`\`

文件下载示例:

\`\`\`java
@WebServlet("/download")   // 映射到 /download,演示文件下载
public class DownloadServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        // 读取磁盘文件
        java.io.File file = new java.io.File("/data/report.pdf");   // 指定下载文件
        // 设置响应头:告诉浏览器这是附件下载,指定文件名
        resp.setHeader("Content-Disposition", "attachment; filename=report.pdf");  // attachment 触发下载
        resp.setContentType("application/octet-stream");   // 二进制流类型
        resp.setContentLengthLong(file.length());   // 响应体大小

        // 用字节流写文件
        try (java.io.OutputStream out = resp.getOutputStream();
             java.io.FileInputStream in = new java.io.FileInputStream(file)) {
            byte[] buf = new byte[8192];   // 8KB 缓冲区
            int n;
            while ((n = in.read(buf)) != -1) {   // 读到文件末尾返回 -1
                out.write(buf, 0, n);   // 边读边写,避免一次性加载大文件
            }
        }   // try-with-resources 自动关闭流
    }
}
\`\`\`

JSON 响应示例(前后端分离常用):

\`\`\`java
@WebServlet("/api/user")   // 映射到 /api/user,返回 JSON
public class UserApiServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        resp.setContentType("application/json;charset=UTF-8");   // 响应类型设为 JSON
        PrintWriter out = resp.getWriter();
        // 手写 JSON(实际项目用 Jackson/Gson 序列化)
        out.println("{\\"name\\":\\"张三\\",\\"age\\":20}");   // 注意:JSON 中双引号需转义
    }
}
\`\`\`

逐行解释:\`setContentType\` 必须在 \`getWriter\` 之前调;\`setHeader("Content-Disposition", "attachment; filename=...")\` 触发浏览器下载而非内联显示;\`setContentLengthLong\` 让浏览器显示下载进度;\`application/octet-stream\` 是通用二进制类型;JSON 响应用 \`application/json\`,转义引号用 \`\\"。\`

## 对比分析

| 维度 | getWriter() | getOutputStream() |
| --- | --- | --- |
| 数据类型 | 字符(文本) | 字节(二进制) |
| 适合内容 | HTML、JSON、纯文本 | 图片、PDF、文件下载 |
| 编码 | 按 contentType 的 charset 自动转码 | 直接写字节,需自己处理编码 |
| 互斥性 | 与 getOutputStream 互斥 | 与 getWriter 互斥 |
| 缓冲 | 有缓冲区 | 有缓冲区 |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| 响应头不生效 | 写完响应体才设头,已提交 | 头必须在 getWriter/写体之前设 |
| 中文乱码 | 未设 charset | \`setContentType("...;charset=UTF-8")\` |
| getOutputStream 与 getWriter 冲突 | 同一响应同时调 | 只能用一个 |
| 大文件 OOM | 一次性读入内存 | 用缓冲边读边写 |
| 下载文件名中文乱码 | filename 头未编码 | 用 \`URLEncoder.encode\` 或 RFC 5987 编码 |
| 已提交后 reset 抛异常 | 响应已发送,无法回滚 | reset 只能在提交前调 |
| flush 后改头无效 | 已提交锁定 | 规划好头部再写体 |`,
  },

  // =========================================================
  // 第八章:请求转发与重定向
  // =========================================================
  {
    id: "jw-08",
    group: "Servlet 入门",
    icon: "🔀",
    title: "请求转发与重定向",
    content: `# 请求转发与重定向

## 概念解释

Web 应用中,一个 Servlet 处理完请求后,常需要把请求"转交"给另一个资源(Servlet/JSP/HTML)。Java Web 提供两种机制:**请求转发(forward)** 与 **重定向(redirect)**。它们看似都做"跳转",机制却截然不同。

**请求转发(forward)**:服务器内部行为。当前 Servlet 把请求与响应对象原封不动交给同一服务器内的另一个资源处理,**客户端完全无感知**。浏览器地址栏不变,只发了一次请求。

**重定向(redirect)**:服务器告诉浏览器"去访问另一个地址"。浏览器收到 302 响应后,**自动发起新的请求**到目标 URL。地址栏会变成新 URL,实际发了两次请求。

理解二者的区别是 Java Web 的关键知识点,直接影响数据传递、地址栏、性能与场景选择。

## 设计原理

**转发**通过 \`RequestDispatcher\` 实现:\`req.getRequestDispatcher("/target").forward(req, resp)\`。转发发生在**服务器内部**,同一个 request/response 对象被传递,所以 \`request\` 域属性(\`setAttribute\`)能在两个资源间共享。转发只能转到**同一 Web 应用**内的资源,不能跨域。

转发流程:浏览器请求 /a → Servlet A 处理 → A 设置属性 → A 调 forward → Servlet B 处理 → B 生成响应 → 浏览器收到响应(以为来自 /a)。

**重定向**通过 \`resp.sendRedirect("/target")\` 实现。它实际是设置 302 状态码与 \`Location\` 响应头,浏览器据此重新发请求。

重定向流程:浏览器请求 /a → Servlet A 返回 302 + Location: /b → 浏览器自动请求 /b → Servlet B 处理 → 浏览器收到响应(地址栏显示 /b)。

为什么有两种机制?转发保留请求上下文(适合内部协作,如 Servlet 处理后转 JSP 渲染),重定向制造新请求(适合跳到外部、避免重复提交、URL 变更需要可见)。表单 POST 后用重定向(PRG 模式:Post-Redirect-Get),刷新不会重复提交。

## 使用场景

**转发适合**:Servlet 处理业务后转 JSP 渲染页面;过滤器链中传递请求;同一应用内资源协作;需要共享 request 数据的场景。地址栏不变,用户看不到内部结构(更安全)。

**重定向适合**:表单提交后跳转(防刷新重复提交);跳到外部站点;跳到不同 Web 应用;需要地址栏更新的场景(如登录后跳首页);/book/123 → /book?id=123 的 URL 美化。

## 代码示例

转发示例(Servlet 处理后转 JSP 渲染):

\`\`\`java
@WebServlet("/list")   // 映射到 /list,列表展示
public class ListServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        // 1. 业务处理:查询数据
        List<String> items = List.of("苹果", "香蕉", "橙子");   // 模拟查询结果

        // 2. 把数据存入 request 域,供转发目标使用
        req.setAttribute("items", items);

        // 3. 转发到 JSP 渲染(地址栏不变,仍是 /list)
        req.getRequestDispatcher("/WEB-INF/list.jsp").forward(req, resp);   // forward:服务器内部转发
    }
}
\`\`\`

重定向示例(登录后跳首页):

\`\`\`java
@WebServlet("/login")   // 映射到 /login,处理登录
public class LoginServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        String user = req.getParameter("user");   // 读取用户名
        String pwd = req.getParameter("pwd");     // 读取密码

        if (checkLogin(user, pwd)) {
            // ★ 登录成功用重定向跳首页,避免刷新重复提交表单
            resp.sendRedirect("/index");   // sendRedirect:客户端重定向,地址栏变化
        } else {
            // 失败也用重定向回登录页
            resp.sendRedirect("/login.html?error=1");   // 通过查询串传递错误标志
        }
    }

    private boolean checkLogin(String u, String p) {   // 模拟登录校验
        return "admin".equals(u) && "123".equals(p);   // 注意:实际项目需加密存储密码
    }
}
\`\`\`

JSP 中读取转发来的属性(\`/WEB-INF/list.jsp\`):

\`\`\`html
<%@ page contentType="text/html;charset=UTF-8" %>   <!-- JSP 指令:声明页面类型与编码 -->
<%@ taglib uri="jakarta.tags.core" prefix="c" %>   <!-- 引入 JSTL 核心标签库,前缀 c -->
<ul>
    <!-- 用 EL 表达式读取 request 域的 items 属性 -->
    <c:forEach items="\${items}" var="it">   <!-- 遍历 items 集合,当前元素变量名 it -->
        <li>\${it}</li>   <!-- EL 表达式输出当前元素 -->
    </c:forEach>
</ul>
\`\`\`

逐行解释:\`getRequestDispatcher("/WEB-INF/list.jsp")\` 获取转发器,路径以 /\` 开头表示相对上下文;\`forward(req, resp)\` 把控制权交给目标,之后的代码不再执行;\`sendRedirect("/index")\` 触发 302,浏览器自动跳转;\`/WEB-INF/\` 下的资源**只能通过转发访问**,客户端直接访问会 404,这是安全设计。注意 EL 表达式 \`\${items}\` 里的 \`$\` 必须转义为 \\\$,否则 JS 模板字符串会误当插值。

## 对比分析

| 维度 | 请求转发(forward) | 重定向(redirect) |
| --- | --- | --- |
| 发起方 | 服务器内部 | 浏览器(收到 302 后) |
| 请求次数 | 1 次 | 2 次 |
| 地址栏 | 不变 | 变为新 URL |
| request 域 | 共享(同一 request) | 不共享(新 request) |
| 跨应用 | 不能,仅限同应用 | 可以,跳任意 URL |
| 速度 | 快(无浏览器往返) | 慢(多一次往返) |
| 典型场景 | Servlet→JSP 渲染 | 登录跳转、防重复提交 |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| 转发后 request 属性读不到 | 用了重定向而非转发 | 共享数据用 forward |
| 转发后地址栏没变 | 转发本就不变 | 想改地址栏用 redirect |
| 重定向丢数据 | 新请求,request 域清空 | 用 Session 或 URL 参数传递 |
| forward 后还写响应 | forward 已交出控制 | forward 后不应再写体 |
| 直接访问 /WEB-INF 下 JSP 404 | 安全保护设计 | 只能通过转发访问 |
| 重定向到外部丢失 Session | 跨域 Cookie 不带 | Session ID 拼到 URL |
| 转发路径写错 404 | 相对路径解析错 | 用绝对路径(以 / 开头) |`,
  },
];
