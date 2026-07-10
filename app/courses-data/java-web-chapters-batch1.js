// =============================================================
// Java Web 应用开发教程 —— 第一批章节
// 分组:Java Web 基础与 HTTP(共 4 章)
// -------------------------------------------------------------
// 本文件包含以下章节:
//   jw-01: Java Web 概述与发展历程
//   jw-02: HTTP 协议详解
//   jw-03: Web 服务器与 Tomcat
//   jw-04: 第一个 Java Web 应用
//
// 每个章节 content 包含六个模块:
//   概念解释 / 设计原理 / 使用场景 / 代码示例 / 对比分析 / 常见陷阱
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章:Java Web 概述与发展历程
  // =========================================================
  {
    id: "jw-01",
    group: "Java Web 基础与 HTTP",
    icon: "🌐",
    title: "Java Web 概述与发展历程",
    content: `# Java Web 概述与发展历程

## 概念解释

**Java Web 开发**是指使用 Java 语言及配套技术栈,构建运行在服务器端、通过浏览器或移动端访问的网络应用程序。当你打开淘宝、登录银行网银、使用 12306 订票时,背后通常就是一套 Java Web 系统。Java 在企业级 Web 领域深耕近三十年,形成了庞大而成熟的生态,是金融、电商、政务等行业后端的绝对主力。

一个完整的 Java Web 应用通常采用分层架构,自上而下依次为:表现层(Web/Controller)、业务层(Service)、持久层(DAO/Repository)和数据库。请求从浏览器经 HTTP 到达 Web 容器(Tomcat),容器调用 Servlet 处理,业务层编排规则,DAO 层通过 JDBC/MyBatis/JPA 操作数据库,最终响应再沿原路返回浏览器。

核心概念包括:**Servlet**(处理 HTTP 请求的 Java 类)、**Web 容器**(管理 Servlet 生命周期的运行环境,如 Tomcat)、**WAR 包**(Web 应用归档)、**请求-响应模型**(一问一答的通信范式)。

## 设计原理

Java Web 的发展大致经历四个阶段,理解演进史能让你明白"为什么现在是这个样子":

**第一阶段:Servlet/JSP 原始时代(1997-2003)**。1997 年 Sun 发布 Servlet 2.0,Java 第一次有了处理 HTTP 的标准 API;但用 Java 代码拼 HTML 字符串极其痛苦。1999 年 JSP 诞生,允许在 HTML 中嵌入 Java,展示变方便了,却又陷入"HTML 里塞满 Java 代码"的混乱。

**第二阶段:MVC 框架百花齐放(2004-2009)**。为解决 JSP 耦合问题,涌现 Struts、Spring MVC(2003)、JSF 等框架,把请求分发、视图渲染做了抽象;Hibernate(2003)解决 ORM,Spring(2003)用 IoC 容器统一组件装配。

**第三阶段:Spring 统一时代(2009-2014)**。Spring 3.0 全面引入注解摆脱 XML,Spring MVC 凭借清晰设计成为主流,但配置仍繁琐。

**第四阶段:Spring Boot 现代化(2014 至今)**。Spring Boot 以"约定优于配置"、内嵌 Tomcat、Starter 依赖,把"从零搭项目"从半天压缩到几分钟,成为新项目首选。

Java Web 设计遵循几个原理:**分层解耦**(层间通过接口耦合,便于独立演化测试)、**规范先行**(Servlet/JSP/JDBC 都是 JSR 标准,多容器实现可替换)、**单例多线程**(Servlet 默认单例,容器用线程池并发调用,故 Servlet 不能有实例状态)。

## 使用场景

**适合**:企业级后台系统(ERP、CRM、OA)、金融与电商(事务与安全要求高)、政务医疗(多系统对接、长期维护)、大数据平台后台(Java/Scala 生态)。

**不适合**:极致并发的实时通信(WebSocket 长连接密集型,Go/Node 更轻)、简单脚本与数据处理(Python 更敏捷)、前端交互密集的 SPA(纯前端框架更合适)。

## 代码示例

下面是引入 Servlet API 依赖的 Maven 配置与一个最简 Servlet:

\`\`\`xml
<!-- pom.xml: 声明 Servlet API 依赖(Tomcat 10+ 用 jakarta 命名空间) -->
<dependency>
    <!-- groupId: 依赖所属组织/团队,通常用反向域名表示 -->
    <groupId>jakarta.servlet</groupId>
    <!-- artifactId: 依赖构件的唯一标识,此处即 Servlet API -->
    <artifactId>jakarta.servlet-api</artifactId>
    <!-- version: 6.0.0 对应 Servlet 6.0 / Jakarta EE 10 规范 -->
    <version>6.0.0</version>
    <!-- provided: 编译期需要,运行期由 Tomcat 提供,不打进 war -->
    <!-- 注意:若误写成 compile,会与容器自带 jar 冲突导致类加载异常 -->
    <scope>provided</scope>
</dependency>
\`\`\`

\`\`\`java
package com.example;   // 声明类所在包,对应目录结构 com/example

// 导入 Servlet API 核心类(Tomcat 10+ 使用 jakarta 命名空间)
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.PrintWriter;

// @WebServlet 注解把该 Servlet 映射到 URL /hello,替代 web.xml 配置
@WebServlet("/hello")
public class HelloServlet extends HttpServlet {
    // 重写 doGet 处理 GET 请求
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws java.io.IOException {
        // 设置响应内容类型与编码,避免中文乱码
        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();   // 获取字符输出流,向响应体写入内容
        out.println("<h1>Hello, Java Web!</h1>");  // 输出一级标题
        out.println("<p>这是我的第一个 Servlet</p>"); // 输出段落
    }
}
\`\`\`

逐行解释:\`@WebServlet("/hello")\` 是 Servlet 3.0 起的注解,把类映射到 URL;\`extends HttpServlet\` 继承 HTTP 专用基类,只需重写 doGet/doPost;\`setContentType\` 告诉浏览器响应是 HTML 且用 UTF-8 解码,**这行不写中文必乱码**;\`getWriter()\` 获取字符流,写出内容即响应体。

## 对比分析

| 维度 | 传统 Servlet/JSP | Spring MVC | Spring Boot |
| --- | --- | --- | --- |
| 配置方式 | web.xml + 大量 XML | 注解 + 少量 XML | 约定 + application.yml |
| 内嵌容器 | 需手动装 Tomcat | 需手动装 Tomcat | 内嵌 Tomcat,直接 run |
| 启动速度 | 慢(容器加载) | 中等 | 快(几秒) |
| 学习曲线 | 中(原理清晰) | 陡(概念多) | 平缓(开箱即用) |
| 适合场景 | 学原理、遗留系统 | 传统企业项目 | 新项目首选 |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| 用 \`javax.servlet\` 但容器是 Tomcat 10+ | Java EE 改名 Jakarta EE,包名迁移 | Tomcat 10+ 必须用 \`jakarta.servlet\` |
| WAR 部署后 404 | URL 漏了上下文路径 | 访问时加 \`/项目名\`,或配根路径 |
| servlet-api 打进 war 冲突 | scope 写成默认 compile | 设为 \`provided\`,由容器提供 |
| JDK 版本与 Spring Boot 不匹配 | Spring Boot 3.x 最低需 JDK 17 | 升级 JDK 或降级 Spring Boot 2.x |`,
  },

  // =========================================================
  // 第二章:HTTP 协议详解
  // =========================================================
  {
    id: "jw-02",
    group: "Java Web 基础与 HTTP",
    icon: "📡",
    title: "HTTP 协议详解",
    content: `# HTTP 协议详解

## 概念解释

**HTTP(HyperText Transfer Protocol,超文本传输协议)** 是 Web 的基石协议,定义了客户端(浏览器)与服务器之间如何交换数据。每次打开网页、点链接、提交表单,本质上都是一次 HTTP 通信。

HTTP 的核心特征:**应用层协议**,基于传输层 TCP(可靠传输);**请求-响应模型**,一问一答;**无状态**,服务器默认不记住"上一次请求是谁发的";**文本协议**,HTTP/1.x 报文是可读的 ASCII 文本(便于调试)。

一个完整的 HTTP 请求由四部分组成:请求行(方法 + URI + 版本)、请求头(键值对元信息)、空行(CRLF 分隔头与体)、请求体(可选)。响应结构类似:状态行(版本 + 状态码 + 短语)、响应头、空行、响应体。

## 设计原理

HTTP 之所以设计成无状态,是为了简化服务器实现、提升可扩展性——任意服务器都能处理任意请求,天然支持负载均衡。但业务需要"记住"用户(登录态、购物车),于是引入 **Cookie/Session** 机制在应用层补足状态。

请求方法被赋予明确语义:**GET** 获取资源(安全且幂等)、**POST** 创建资源(非幂等)、**PUT** 完整更新(幂等)、**DELETE** 删除(幂等)。所谓**安全**指不修改服务器资源,**幂等**指重复执行结果不变。浏览器据此行为:刷新页面时 GET 自动重发,POST 会弹确认框(因可能有副作用)。

状态码按首位分类:1xx 信息、2xx 成功(200 OK、201 Created)、3xx 重定向(301 永久、302 临时、304 缓存命中)、4xx 客户端错误(400 参数错、401 未认证、403 禁止、404 不存在)、5xx 服务器错误(500 内部异常、502 网关错误、503 不可用)。

HTTP 演进推动性能提升:HTTP/1.1 引入 keep-alive 复用连接;HTTP/2 改为二进制分帧、多路复用、头部压缩(HPACK);HTTP/3 基于 QUIC(UDP),0-RTT 建连。HTTPS = HTTP + TLS,提供加密、完整性、身份认证。

## 使用场景

**适合**:接口设计(理解方法与状态码才能设计规范 RESTful API)、跨域处理(前后端分离时理解 CORS 预检 OPTIONS)、性能优化(Cache-Control、ETag 缓存,gzip 压缩)、安全(HTTPS、Cookie 的 HttpOnly/Secure/SameSite 防 XSS/CSRF)、调试(抓包定位"为什么 500""为什么参数没传到")。

## 代码示例

下面在 Servlet 中读取请求头与参数,直观感受协议细节:

\`\`\`java
@WebServlet("/inspect")   // 映射到 /inspect,用于查看 HTTP 请求详情
public class InspectServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws java.io.IOException {
        resp.setContentType("text/plain;charset=UTF-8");  // 纯文本响应,UTF-8 编码
        PrintWriter out = resp.getWriter();   // 获取字符输出流

        // 1. 读取请求行信息
        out.println("方法: " + req.getMethod());        // GET/POST...
        out.println("URI: " + req.getRequestURI());      // /inspect
        out.println("查询串: " + req.getQueryString());  // ?后面的内容

        // 2. 读取单个参数 ?name=xxx
        String name = req.getParameter("name");   // 统一获取参数,GET/POST 通用
        out.println("name 参数: " + name);

        // 3. 遍历所有请求头
        out.println("--- 请求头 ---");
        Enumeration<String> headerNames = req.getHeaderNames();  // 获取所有请求头名枚举
        while (headerNames.hasMoreElements()) {     // 逐个遍历
            String h = headerNames.nextElement();   // 取出下一个头名
            out.println(h + ": " + req.getHeader(h));  // 取对应值并打印
        }

        // 4. 读取 Cookie
        Cookie[] cookies = req.getCookies();   // 获取请求携带的所有 Cookie
        if (cookies != null) {                  // 注意:无 Cookie 时返回 null,需判空
            for (Cookie c : cookies) {
                out.println(c.getName() + "=" + c.getValue());  // 打印名=值
            }
        }
    }
}
\`\`\`

逐行解释:\`getMethod()\` 返回请求方法大写字符串;\`getRequestURI()\` 返回不含查询串与主机的路径;\`getParameter("name")\` 统一获取参数,无论来自查询串还是表单体;\`getHeaderNames()\` 获取所有请求头名,枚举遍历可打印全部元信息,是排查请求问题的利器。

## 对比分析

| 维度 | GET | POST |
| --- | --- | --- |
| 参数位置 | URL 查询串 | 请求体 |
| 长度限制 | 浏览器有上限(约 2KB) | 理论无限制(受服务器配置) |
| 安全性 | 参数暴露在 URL,被日志/历史记录 | 相对隐蔽(非加密) |
| 幂等性 | 幂等 | 非幂等 |
| 缓存 | 可被缓存 | 默认不缓存 |
| 适合场景 | 查询、获取资源 | 提交数据、创建资源 |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| GET 传中文乱码 | URL 编码与解码不一致 | 用 \`URLEncoder.encode\`,Tomcat 配 URIEncoding=UTF-8 |
| POST 中文乱码 | 未设置请求体编码 | 在读取参数前 \`req.setCharacterEncoding("UTF-8")\` |
| 302 跳转丢数据 | 重定向是新请求,request 域数据丢失 | 用转发(forward)或 Session 传递 |
| Cookie 被脚本读取 | 未设 HttpOnly | \`cookie.setHttpOnly(true)\` 防 XSS |
| 跨域请求被拦 | 浏览器同源策略 | 服务器加 CORS 头 \`Access-Control-Allow-Origin\` |`,
  },

  // =========================================================
  // 第三章:Web 服务器与 Tomcat
  // =========================================================
  {
    id: "jw-03",
    group: "Java Web 基础与 HTTP",
    icon: "🖥️",
    title: "Web 服务器与 Tomcat",
    content: `# Web 服务器与 Tomcat

## 概念解释

要理解 Java Web 的运行环境,先区分两类"服务器":

**静态 Web 服务器**:只负责把磁盘上的文件原样发给浏览器,如 Nginx、Apache HTTP Server。它们高效处理静态资源(HTML/CSS/JS/图片),但不会"运算"——内容预先写死,对所有用户一样。

**动态 Web 容器(应用服务器)**:不仅能发静态文件,还能运行程序、动态生成内容。当请求到来,容器把请求交给对应的 Servlet 处理,程序可查数据库、做计算、拼 HTML,再返回结果。**Tomcat、Jetty、Undertow** 就属于这一类。

生产环境常见架构:**Nginx 在前**处理静态资源与反向代理,**Tomcat 在后**运行动态应用。Nginx 抗并发能力强,把动态请求转给 Tomcat。

Tomcat 是 Java Web 最经典的容器,也是 Spring Boot 默认内嵌的容器。它实现了 Servlet/JSP 规范,管理 Servlet 的完整生命周期。

## 设计原理

Tomcat 由若干组件分层组成,理解其内部结构有助于排查部署与性能问题:

\`\`\`
Server (整个 Tomcat 实例,一个 JVM 一个)
└─ Service (把 Connector 与 Engine 组合)
   ├─ Connector (HTTP/AJP,接收连接、解析报文)
   └─ Engine (Catalina,Servlet 引擎)
      └─ Host (虚拟主机,按 Host 头区分)
         └─ Context (一个 Web 应用,对应上下文路径)
            └─ Wrapper (一个 Servlet 实例)
\`\`\`

请求流转:Connector 接收 → 解析为 Request/Response 对象 → 交给 Engine → 匹配 Host → 匹配 Context → 匹配 Wrapper(Servlet) → 调用 \`service()\`。

Servlet 容器管理 Servlet 的完整生命周期:加载(.class 读入 JVM)→ 实例化(无参构造,默认单例)→ 初始化(\`init\`,只调一次)→ 调用(每请求调 \`service\`,多线程并发)→ 销毁(\`destroy\`,容器关闭时)。容器还负责 HTTP 解析、Session 管理、JSP 编译、过滤器链等。

Tomcat 目录结构:\`bin/\` 启动脚本、\`conf/\` 配置(server.xml、web.xml)、\`lib/\` 自带 jar、\`logs/\` 日志、\`webapps/\` 应用部署目录(把 war 丢进去自动部署)、\`work/\` JSP 编译产物。

## 使用场景

**本地开发**:IDEA 内嵌 Tomcat 或用插件调试。**传统部署**:WAR 包丢进 Tomcat webapps,适合遗留系统。**云原生**:Spring Boot 内嵌 Tomcat 打成可执行 jar,Docker 化部署,K8s 编排。**性能调优**:理解 Connector 线程模型(\`maxThreads\`、\`acceptCount\`)才能调优。

## 代码示例

下面是 Tomcat \`conf/server.xml\` 的精简版,讲解关键配置:

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<Server port="8005" shutdown="SHUTDOWN">
    <!-- port=8005:接收关闭命令的端口;向该端口发 SHUTDOWN 字符串即可关闭 Tomcat -->
    <Service name="Catalina">
        <!-- HTTP 连接器:监听 8080 -->
        <Connector port="8080" protocol="HTTP/1.1"
                   connectionTimeout="20000"   <!-- 连接超时 20s -->
                   redirectPort="8443"          <!-- HTTPS 时跳转端口 -->
                   maxThreads="200"             <!-- 最大工作线程 -->
                   acceptCount="100"/>          <!-- 接收队列长度 -->
        <Engine name="Catalina" defaultHost="localhost">  <!-- 引擎:处理所有请求,默认主机 localhost -->
            <Host name="localhost" appBase="webapps"  <!-- 虚拟主机,应用基目录 webapps -->
                  unpackWARs="true" autoDeploy="true">  <!-- 自动解压 war,自动部署 -->
                <!-- 显式配置应用:上下文 /app,磁盘位置 /opt/myapp -->
                <Context path="/app" docBase="/opt/myapp" reloadable="false"/>  <!-- reloadable 生产关掉 -->
            </Host>
        </Engine>
    </Service>
</Server>
\`\`\`

逐行解释:\`<Connector port="8080">\` 监听端口,生产常改 80 或前置 Nginx;\`maxThreads\` 是处理请求的最大线程数,每个请求占一个线程,超过的排队(\`acceptCount\` 是队列长度,满了拒绝);\`<Context path="/app" docBase="/opt/myapp">\` 中 \`path\` 是 URL 前缀,\`docBase\` 是应用磁盘路径;\`reloadable="true"\` 会在 class 变化时自动重载,开发用生产关掉(性能差)。

下面用 Java 嵌入式启动 Tomcat(Spring Boot 的简化原理):

\`\`\`java
import org.apache.catalina.startup.Tomcat;   // 导入 Tomcat 嵌入式启动类
public class EmbeddedTomcatDemo {
    public static void main(String[] args) throws Exception {
        Tomcat tomcat = new Tomcat();          // 创建内嵌 Tomcat 实例,无需独立安装
        tomcat.setPort(8080);                  // 设置监听端口
        // 上下文路径为空表示根 /,源码目录 src/main/webapp
        tomcat.addWebapp("", new File("src/main/webapp").getAbsolutePath());
        tomcat.start();                        // 启动 Tomcat,开始接收请求
        tomcat.getServer().await();            // 主线程阻塞,等待请求
    }
}
\`\`\`

\`new Tomcat()\` 提供可编程 API,无需 xml 即可启动,Spring Boot 正是用它内嵌容器;\`await()\` 让主线程阻塞,否则 main 退出 JVM 就关闭了。

## 对比分析

| 容器 | 特点 | 适合场景 |
| --- | --- | --- |
| Tomcat | 最流行,轻量,Servlet/JSP 标准实现 | 通用 Java Web,Spring Boot 默认内嵌 |
| Jetty | 更轻量,易嵌入,异步友好 | 嵌入式、云原生、WebSocket 密集 |
| Undertow | Red Hat 出品,性能高,资源省 | Spring Boot 高性能场景 |
| WebLogic/WebSphere | 全功能 Java EE 应用服务器,重 | 金融等大型遗留系统 |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| 端口被占用 | 8080 被其他进程占用 | 改 server.xml 端口或杀掉占用进程 |
| war 不自动解压 | unpackWARs 设为 false | 改为 true,或手动解压 |
| 改了 class 不生效 | reloadable=false 或 Tomcat 缓存 | 开发期 reloadable=true,或重启 Tomcat |
| 上下文路径带项目名 | 默认按 war 名作为路径 | 改名 ROOT.war 或显式配 \`path=""\` |
| Session 跨实例不共享 | 多 Tomcat 实例 Session 各自独立 | 用 Redis 共享,或粘性会话 |
| 内嵌 Tomcat 内存溢出 | 默认堆小,大量并发请求 | 调 JVM 参数 \`-Xmx -Xms\` |`,
  },

  // =========================================================
  // 第四章:第一个 Java Web 应用
  // =========================================================
  {
    id: "jw-04",
    group: "Java Web 基础与 HTTP",
    icon: "🚀",
    title: "第一个 Java Web 应用",
    content: `# 第一个 Java Web 应用

## 概念解释

本章带你从零搭建一个完整的 Java Web 项目:用 IDEA 创建 Maven webapp 骨架,配置 Servlet 依赖,编写并部署一个 HelloServlet,通过浏览器访问。掌握这套流程,你就具备了"跑起来一个 Java Web 应用"的能力。

Maven 提供了 \`maven-archetype-webapp\` 骨架,生成标准的 Web 应用结构:\`src/main/java/\` 放源码,\`src/main/resources/\` 放类路径资源,\`src/main/webapp/\` 是 Web 资源根(对应 WAR 根),其中 \`WEB-INF/\` 受保护(客户端无法直接访问),\`web.xml\` 是部署描述符(Servlet 3.0+ 可省略)。

\`web.xml\`(Deployment Descriptor)声明 Servlet、过滤器、监听器、欢迎页、错误页等。从 Servlet 3.0 起支持注解(\`@WebServlet\`),web.xml 可省略,但理解它有助于看懂遗留项目。\`<servlet>\` 与 \`<servlet-mapping>\` 通过 \`<servlet-name>\` 关联,实现"URL → 类"的映射,这是注解的 XML 等价形式。

## 设计原理

部署描述符与注解各有取舍:web.xml 灵活度高(改配置不需重编译),但啰嗦;注解简洁直观,但改需重编译。Spring Boot 进一步用 \`@RestController\` + \`@GetMapping\` 把映射写到方法级,最简洁。

中文乱码是 Java Web 最常见的"小问题大麻烦",根源是**编码与解码不一致**。处理原则:**在读写数据的最早环节指定 UTF-8**。请求参数乱码:GET 的参数在 URL,Tomcat 8+ 默认 UTF-8;POST 的参数在请求体,默认 ISO-8859-1 解码,必须 \`req.setCharacterEncoding("UTF-8")\`(在 \`getParameter\` 之前调)。响应乱码:\`resp.setContentType("text/html;charset=UTF-8")\` 同时设定响应体编码与告知浏览器。

项目遵循"开发用 exploded(解压目录,可热部署),发布用 war(版本可控)"原则。上下文路径默认等于 war 文件名,根路径应用需改名 \`ROOT.war\`。

## 使用场景

**入门第一个项目**:熟悉从建项目到部署访问的全流程。**遗留项目维护**:很多老项目仍是 web.xml + Servlet + JSP 结构。**理解 Spring Boot 内部**:Spring Boot 内嵌 Tomcat,本质也是这套机制。**本地调试**:IDEA + Tomcat 配置是 Java Web 开发的日常。

部署步骤:Maven 打包 \`mvn package\` 生成 \`target/项目名.war\` → 拷贝到 \`$TOMCAT_HOME/webapps/\` → 启动 Tomcat → 浏览器访问 \`http://localhost:8080/项目名/hello\`。

## 代码示例

下面是一个完整的 HelloServlet,演示请求处理、参数读取、中文处理、HTML 输出:

\`\`\`java
package com.example;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

// 映射到 /hello 与 /hi 两个 URL,启动时即加载
@WebServlet(urlPatterns = {"/hello", "/hi"}, loadOnStartup = 1)
public class HelloServlet extends HttpServlet {

    // 容器启动时调用一次,适合做初始化
    @Override
    public void init() throws ServletException {
        System.out.println("HelloServlet 初始化...");   // 仅做演示日志
    }

    // 处理 GET 请求
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        // ★ 关键:必须在 getParameter 之前设置请求编码,解决 POST 中文乱码
        req.setCharacterEncoding("UTF-8");
        // ★ 关键:设置响应内容类型与编码,解决响应中文乱码
        resp.setContentType("text/html;charset=UTF-8");

        // 读取请求参数 ?name=张三
        String name = req.getParameter("name");
        if (name == null || name.isEmpty()) {   // 注意:参数可能为 null 或空串
            name = "世界";   // 默认值
        }

        // 获取字符输出流,写 HTML
        PrintWriter out = resp.getWriter();
        out.println("<!DOCTYPE html>");                           // HTML5 文档声明
        out.println("<html><head><title>首页</title></head><body>"); // 文档头
        out.println("<h1>你好," + name + "!</h1>");               // 拼接参数输出
        out.println("<p>当前时间: " + new java.util.Date() + "</p>"); // 显示当前时间
        out.println("</body></html>");                             // 关闭标签
    }

    // 处理 POST 请求:直接复用 doGet 逻辑
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        doGet(req, resp);   // 委派给 doGet,使 GET/POST 行为一致
    }
}
\`\`\`

逐行解释:\`@WebServlet(urlPatterns = {...}, loadOnStartup = 1)\` 一个 Servlet 可映射多个 URL,\`loadOnStartup\` 表示容器启动时就初始化(而非首次请求时);\`req.setCharacterEncoding("UTF-8")\` 是 POST 中文不乱码的关键,只对请求体生效;\`resp.setContentType(...)\` 浏览器据此解码;\`req.getParameter("name")\` 统一获取参数,GET 从查询串、POST 从表单体都能取到;\`doPost\` 直接调 \`doGet\` 是常见模式,让 GET/POST 走同一逻辑。

\`pom.xml\` 关键部分:

\`\`\`xml
<project>
    <modelVersion>4.0.0</modelVersion>   <!-- POM 模型版本,固定 4.0.0 -->
    <groupId>com.example</groupId>       <!-- 项目所属组织 -->
    <artifactId>java-web-demo</artifactId>  <!-- 项目构件名 -->
    <version>1.0-SNAPSHOT</version>      <!-- SNAPSHOT 表示开发快照版 -->
    <packaging>war</packaging>   <!-- 必须是 war 才能部署到 Tomcat -->
    <properties>
        <maven.compiler.source>17</maven.compiler.source>  <!-- 编译源码用 JDK 17 -->
        <maven.compiler.target>17</maven.compiler.target>   <!-- 生成的字节码版本 17 -->
    </properties>
    <dependencies>
        <dependency>
            <groupId>jakarta.servlet</groupId>
            <artifactId>jakarta.servlet-api</artifactId>
            <version>6.0.0</version>
            <scope>provided</scope>  <!-- 由 Tomcat 提供,不打进 war -->
        </dependency>
    </dependencies>
</project>
\`\`\`

## 对比分析

| 配置方式 | web.xml | @WebServlet 注解 | Spring Boot |
| --- | --- | --- | --- |
| 写法 | XML 两段(servlet + mapping) | 一个注解 | @RestController + @GetMapping |
| 灵活度 | 高(可改不重编译) | 中(改需重编译) | 高(可外置配置) |
| 简洁度 | 啰嗦 | 简洁 | 极简 |
| 适合场景 | 遗留项目、复杂配置 | 现代原生 Servlet | 新项目首选 |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| 404 找不到 Servlet | URL 漏了上下文路径 | 访问 \`/项目名/hello\` 而非 \`/hello\` |
| POST 中文乱码 | 未设请求编码 | \`getParameter\` 前 \`req.setCharacterEncoding("UTF-8")\` |
| 响应中文乱码 | 未设响应编码 | \`resp.setContentType("text/html;charset=UTF-8")\` |
| ClassNotFound: HttpServlet | servlet-api 未引入或 scope 错 | pom 加 jakarta.servlet-api,scope=provided |
| 启动报 jar 包冲突 | 重复打包 servlet-api | scope 设 provided,不打入 war |
| @WebServlet 不生效 | web-app 版本过低 | web.xml 声明 version >= 3.0,metadata-complete=false |`,
  },
];
