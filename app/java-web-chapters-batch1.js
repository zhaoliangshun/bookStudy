// =============================================================
// Java Web 应用开发实战教程 —— 第一批章节
// 分组:Java Web 基础与 HTTP(共 4 章)
// -------------------------------------------------------------
// 本文件包含以下章节:
//   jw-01: Java Web 开发全景与学习路线
//   jw-02: HTTP 协议深入理解
//   jw-03: 从静态到动态:Web 服务器与容器
//   jw-04: 第一个 Java Web 程序
//
// 每个章节 content 包含六个模块:
//   概念讲解 / 设计原则 / 使用场景 / 代码逐行讲解 / 对比 / 常见陷阱
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章:Java Web 开发全景与学习路线
  // =========================================================
  {
    id: "jw-01",
    group: "Java Web 基础与 HTTP",
    icon: "🌐",
    title: "Java Web 开发全景与学习路线",
    content: `# Java Web 开发全景与学习路线

## 概念讲解

### 什么是 Java Web 开发

**Java Web 开发**是指使用 Java 语言及相关技术栈,构建运行在服务器端、通过浏览器(或移动端)访问的网络应用程序。当你访问淘宝、12306、银行网银时,背后很可能就是一套 Java Web 系统。Java 在企业级 Web 领域深耕近三十年,形成了庞大而成熟的生态,是金融、电商、政务等行业后端的绝对主力。

一个完整的 Java Web 应用,通常由以下几层组成:

\`\`\`
┌──────────────────────────────────────────────┐
│  浏览器 / 移动端 App  (客户端表示层)            │
└──────────────────────────────────────────────┘
                      │  HTTP / HTTPS
                      ▼
┌──────────────────────────────────────────────┐
│  Web 服务器 + Servlet 容器  (Tomcat / Jetty)   │
│  ├─ 接收 HTTP 请求                              │
│  ├─ 调用 Servlet / Controller 处理              │
│  └─ 生成 HTTP 响应                              │
└──────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────┐
│  业务逻辑层  (Service)                          │
│  ├─ 事务管理                                    │
│  └─ 业务规则编排                                │
└──────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────┐
│  数据访问层  (DAO / Repository)                 │
│  ├─ JDBC / MyBatis / JPA                        │
│  └─ 数据库连接池                                 │
└──────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────┐
│  数据库  (MySQL / Oracle / PostgreSQL)          │
└──────────────────────────────────────────────┘
\`\`\`

### Java Web 生态发展史

理解技术演进史,能帮你明白"为什么现在是这样",而不至于迷失在各种框架里。Java Web 的发展大致经历了四个阶段:

**第一阶段:Servlet/JSP 原始时代(1997-2003)**

1997 年 Sun 发布 **Servlet 2.0**,Java 第一次有了处理 HTTP 请求的标准 API。Servlet 用 Java 代码写 HTML,字符串拼接极其痛苦。1999 年 **JSP(JavaServer Pages)** 诞生,允许在 HTML 中嵌入 Java 代码(\`<% %>\`),前端展示变得方便,但很快又陷入"HTML 里塞满 Java 代码"的混乱。这一阶段是 Java Web 的"刀耕火种"期。

**第二阶段:MVC 框架百花齐放(2004-2009)**

为解决 JSP 耦合混乱的问题,涌现出一批 MVC 框架:**Struts**(Apache,2001)、**WebWork**、**Spring MVC**(2003 随 Spring 1.0 发布)、**JSF**(Java 标准)。它们把请求分发、视图渲染、表单绑定做了抽象,开发效率显著提升。同时 **Hibernate**(2003)解决了对象与关系数据库的映射(ORM)问题,**Spring**(2003)用 IoC 容器统一了组件装配。

**第三阶段:Spring 统一时代(2009-2014)**

Spring 逐渐成为 Java 企业开发的事实标准。**Spring 3.0(2009)** 全面引入注解,摆脱 XML 配置;**Spring MVC** 凭借清晰的设计成为主流 Web 框架。但配置仍然繁琐:搭一个空项目要写一堆 XML。

**第四阶段:Spring Boot 现代化(2014-至今)**

2014 年 **Spring Boot 1.0** 问世,口号"**Just Run**"。它通过"约定优于配置"、Starter 依赖、内嵌 Tomcat,把"从零搭项目"的时间从半天压缩到几分钟。同时微服务兴起,**Spring Cloud** 提供了分布式系统全套方案。今天,绝大多数新 Java Web 项目都基于 Spring Boot。

### Java Web 技术栈全景图

| 层次 | 核心技术 | 说明 |
| --- | --- | --- |
| Web 容器 | Tomcat / Jetty / Undertow | 接收 HTTP 请求,管理 Servlet 生命周期 |
| Web 框架 | Servlet / Spring MVC / Spring Boot | 处理请求、路由、参数绑定 |
| 模板引擎 | JSP / Thymeleaf / FreeMarker | 服务端渲染 HTML |
| ORM/数据访问 | JDBC / MyBatis / Spring Data JPA | 操作数据库 |
| 数据库 | MySQL / PostgreSQL / Oracle | 持久化存储 |
| 缓存 | Redis / Caffeine | 减轻数据库压力 |
| 消息队列 | RabbitMQ / Kafka | 异步解耦 |
| 安全 | Spring Security / Shiro | 认证授权 |
| 测试 | JUnit / Mockito | 单元测试与集成测试 |
| 构建 | Maven / Gradle | 依赖管理与打包 |

### 学习路径建议

Java Web 体系庞大,初学者容易"从 Spring Boot 入门却不懂原理"。推荐的学习顺序是由底向上、由原理到框架:

1. **先打基础**:HTTP 协议、HTML/CSS/JS 基本概念、SQL 基础
2. **再学 Servlet/JSP**:这是所有 Java Web 框架的底层,理解了 Servlet,Spring MVC 只是它的封装
3. **掌握 JDBC**:理解数据库是怎么连的、事务怎么管,才能用好 JPA/MyBatis
4. **学习 Maven**:依赖管理与构建工具,现代 Java 项目标配
5. **进入 Spring 体系**:IoC/AOP → Spring MVC → Spring Boot
6. **数据访问进阶**:Spring Data JPA / MyBatis
7. **工程化**:Spring Security、RESTful API 设计、测试、部署

本教程正是按这个顺序组织的 64 章。

### 开发环境准备

| 工具 | 版本要求 | 说明 |
| --- | --- | --- |
| JDK | 17+(推荐 LTS) | Java 17 是 Spring Boot 3.x 的最低要求 |
| IntelliJ IDEA | 社区版即可,旗舰版更佳 | 最强 Java IDE |
| Apache Tomcat | 10+(Jakarta EE) 或 9(Java EE) | Servlet 容器 |
| Maven | 3.6+ | 依赖与构建 |
| MySQL | 8.0+ | 数据库 |

> 注意命名空间迁移:Java EE 在 2017 年交给 Eclipse 基金会后改名 **Jakarta EE**,包名从 \`javax.servlet\` 变为 \`jakarta.servlet\`。Tomcat 10+ 对应 Jakarta EE(新包名),Tomcat 9 及以下对应 Java EE(旧包名)。**新项目建议用 Tomcat 10+ / Jakarta EE**。

### Web 应用部署结构

一个传统的 Java Web 应用打包成 **WAR(Web Application Archive)** 文件,其内部结构如下:

\`\`\`
myapp.war
├── index.html              // 静态资源(可直接访问)
├── css/
│   └── style.css
├── js/
│   └── app.js
├── WEB-INF/                // 受保护目录,客户端无法直接访问
│   ├── web.xml             // 部署描述符(Servlet 3.0+ 可选)
│   ├── classes/            // 编译后的 .class 文件
│   │   └── com/
│   │       └── example/
│   │           └── HelloServlet.class
│   └── lib/                // 第三方依赖 jar
│       ├── mysql-connector-j-8.0.33.jar
│       └── jstl-2.0.0.jar
└── META-INF/
\`\`\`

**关键点**:\`WEB-INF\` 下的资源不能被浏览器直接访问,只能通过 Servlet 转发或映射访问,这是安全性的基础。

### 请求-响应模型

Web 应用的本质就是**请求-响应**模型:

\`\`\`
浏览器                          服务器
  │                               │
  │  1. 用户点击链接 / 提交表单     │
  │  ──── HTTP 请求 ────────────►  │
  │                               │  2. 容器解析请求
  │                               │  3. 找到对应 Servlet
  │                               │  4. 调用 service() → doGet/doPost
  │                               │  5. 业务处理 / 查数据库
  │                               │  6. 生成响应内容
  │  ◄──── HTTP 响应 ────────────  │
  │  7. 浏览器渲染页面              │
\`\`\`

无论框架怎么变,这个"请求进来 → 处理 → 响应出去"的核心模型不变。Spring MVC 的 \`@RequestMapping\`、Servlet 的 \`doGet\`,本质都是在这个模型的某个环节上做封装。

## 设计原则

### 1. 分层架构原则

Java Web 应用遵循经典的**三层架构**:表现层(Web)、业务层(Service)、持久层(DAO)。层与层之间通过接口耦合,上层依赖下层抽象,不依赖具体实现。这能让各层独立演化、便于测试。

### 2. 约定优于配置

这是 Spring Boot 的核心思想。与其让开发者写大量 XML 配置,Spring Boot 提供合理默认值(如内嵌 Tomcat 监听 8080、默认扫描主类所在包)。只有需要改变默认行为时才显式配置。

### 3. 无状态与可扩展性

HTTP 协议本身是无状态的。早期用 Session 在服务端保存状态,但这让横向扩展困难(多台服务器间 Session 不共享)。现代设计倾向**无状态服务 + 客户端携带令牌(JWT)**,让任意服务器都能处理任意请求。

### 4. 单一职责

一个 Servlet / Controller 应只负责一类请求的处理。不要把用户管理、订单、商品全塞进一个巨大的 Servlet。Spring MVC 的 \`@RestController\` 配合 \`@RequestMapping\` 让职责划分自然清晰。

## 使用场景

### 适合 Java Web 的场景

- **企业级后台系统**:ERP、CRM、OA,对事务、安全、稳定性要求高
- **金融与电商**:银行网银、支付清算、电商订单系统,Java 的事务管理与生态成熟
- **政务与医疗**:多系统对接、复杂权限模型、长期维护需求
- **大数据平台后台**:Hadoop、Spark 等大数据组件多为 Java/Scala 生态

### 不那么适合的场景

- **极致并发的实时通信**:WebSocket 长连接密集型场景,Go/Node 可能更轻
- **简单脚本与数据处理**:Python 更敏捷
- **前端交互密集的应用**:更适合纯前端 SPA 框架(React/Vue)

## 代码逐行讲解

下面通过一个 Maven 项目的 \`pom.xml\` 配置,讲解如何引入 Servlet API 依赖。

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- pom.xml 是 Maven 项目的核心配置文件,描述项目信息与依赖 -->
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <!-- POM 模型版本,固定 4.0.0 -->
    <modelVersion>4.0.0</modelVersion>

    <!-- 项目坐标: groupId + artifactId + version 唯一标识一个制品 -->
    <groupId>com.example</groupId>          <!-- 组织/公司域名反写 -->
    <artifactId>java-web-demo</artifactId>  <!-- 项目名 -->
    <version>1.0-SNAPSHOT</version>         <!-- SNAPSHOT 表示开发中版本 -->
    <packaging>war</packaging>              <!-- 打包方式:war 才能部署到 Tomcat -->

    <!-- 属性:统一管理版本号,方便升级 -->
    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <!-- 依赖声明 -->
    <dependencies>
        <!-- Servlet API: Tomcat 10+ 用 jakarta 命名空间 -->
        <dependency>
            <groupId>jakarta.servlet</groupId>
            <artifactId>jakarta.servlet-api</artifactId>
            <version>6.0.0</version>
            <!-- scope=provided 表示运行时由容器(Tomcat)提供,不打进 war -->
            <scope>provided</scope>
        </dependency>
    </dependencies>
</project>
\`\`\`

逐行解释:

- \`<packaging>war</packaging>\`:打包类型。Java Web 项目用 \`war\`,普通 Java 项目用 \`jar\`(默认)。
- \`<maven.compiler.source>17</maven.compiler.source>\`:指定源码用 Java 17 语法编译。
- \`jakarta.servlet-api\`:Servlet 规范的 API 包。注意是 \`jakarta\` 不是 \`javax\`(Tomcat 10+)。
- \`<scope>provided</scope>\`:这个作用域表示"编译期需要,运行期由容器提供"。Tomcat 自带 servlet-api,如果再打进 war 会冲突。

下面是一个最简的 Servlet 示例(后续章节会详细讲解):

\`\`\`java
package com.example;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.annotation.WebServlet;
import java.io.PrintWriter;

// @WebServlet 注解:把该 Servlet 映射到 URL /hello
@WebServlet("/hello")
public class HelloServlet extends HttpServlet {
    // 重写 doGet 处理 GET 请求
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws java.io.IOException {
        // 设置响应内容类型与编码,避免中文乱码
        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();   // 获取字符输出流
        out.println("<h1>Hello, Java Web!</h1>");
        out.println("<p>这是我的第一个 Servlet</p>");
    }
}
\`\`\`

- \`@WebServlet("/hello")\`:Servlet 3.0 起支持的注解,替代 \`web.xml\` 里的映射配置。访问 \`http://localhost:8080/项目名/hello\` 即触发。
- \`extends HttpServlet\`:继承 HTTP 专用的 Servlet 基类,只需重写 \`doGet/doPost\`。
- \`resp.setContentType("text/html;charset=UTF-8")\`:告诉浏览器响应是 HTML、用 UTF-8 解码。**这一行不写,中文必乱码**。

## 对比

| 维度 | 传统 Servlet/JSP | Spring MVC | Spring Boot |
| --- | --- | --- | --- |
| **配置方式** | web.xml + 大量 XML | 注解 + 少量 XML | 约定 + application.yml |
| **内嵌容器** | 需手动装 Tomcat | 需手动装 Tomcat | 内嵌 Tomcat,直接 run |
| **启动速度** | 慢(容器加载) | 中等 | 快(几秒) |
| **学习曲线** | 中(原理清晰) | 陡(概念多) | 平缓(开箱即用) |
| **适合场景** | 学原理、遗留系统 | 传统企业项目 | 新项目首选 |
| **微服务支持** | 无 | 有限 | 与 Spring Cloud 深度整合 |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| 用 \`javax.servlet\` 但容器是 Tomcat 10+ | Java EE 与 Jakarta EE 命名空间迁移导致 | Tomcat 10+ 必须用 \`jakarta.servlet\`,或换 Tomcat 9 |
| WAR 部署后 404 | URL 路径带了项目名(上下文路径) | 访问时加 \`/项目名\`,或在 Tomcat 配置根路径 |
| 中文乱码 | 未设置请求/响应编码 | 请求前 \`req.setCharacterEncoding("UTF-8")\`,响应设 Content-Type |
| servlet-api 打进 war 导致冲突 | scope 写成默认 compile | 设为 \`provided\`,由容器提供 |
| JDK 版本与 Spring Boot 不匹配 | Spring Boot 3.x 最低需 JDK 17 | 升级 JDK 或降级 Spring Boot 2.x |
| 启动报 ClassNotFoundException | 依赖未引入或 scope 错误 | 检查 pom.xml 依赖与 scope 配置 |`,
  },

  // =========================================================
  // 第二章:HTTP 协议深入理解
  // =========================================================
  {
    id: "jw-02",
    group: "Java Web 基础与 HTTP",
    icon: "🌐",
    title: "HTTP 协议深入理解",
    content: `# HTTP 协议深入理解

## 概念讲解

### HTTP 是什么

**HTTP(HyperText Transfer Protocol,超文本传输协议)**是 Web 的基石协议。它定义了客户端(浏览器)与服务器之间如何交换数据。你每一次打开网页、点链接、提交表单,本质上都是一次 HTTP 通信。

HTTP 的核心特征:

- **应用层协议**:位于 TCP/IP 模型最顶层,基于传输层 TCP(可靠传输)。
- **请求-响应模型**:一问一答,客户端发请求,服务器回响应。
- **无状态**:服务器默认不记住"上一次请求是谁发的",每次请求相互独立。
- **文本协议**:HTTP/1.x 的报文是可读的 ASCII 文本(便于调试)。

### HTTP 请求结构

一个完整的 HTTP 请求由四部分组成:

\`\`\`
GET /api/users?id=123 HTTP/1.1        ← 请求行(方法 + URI + 协议版本)
Host: www.example.com                  ← 请求头(每行一个,键:值)
User-Agent: Mozilla/5.0 (Windows...)
Accept: application/json
Cookie: JSESSIONID=abc123
                                       ← 空行(分隔头与体)
name=zhangsan&age=20                   ← 请求体(可选,GET 通常无)
\`\`\`

**请求行**:三段用空格分隔——方法、URI、协议版本。\`GET\` 请求的参数拼在 URI 的查询串里(\`?key=value\`),\`POST\` 请求的参数放在请求体里。

**请求头**:以键值对形式传递元信息。\`Host\` 指定目标主机(虚拟主机靠它区分),\`User-Agent\` 标识客户端类型,\`Accept\` 声明能接受的响应类型,\`Cookie\` 携带会话标识。

**空行**:CRLF(\`\\r\\n\`)空行标志头部结束,这是协议规定,容器靠它区分头与体。

**请求体**:GET/HEAD/DELETE 一般无体;POST/PUT/PATCH 才放数据,格式由 \`Content-Type\` 头决定。

### HTTP 响应结构

\`\`\`
HTTP/1.1 200 OK                       ← 状态行(协议版本 + 状态码 + 原因短语)
Content-Type: text/html;charset=UTF-8 ← 响应头
Content-Length: 128
Set-Cookie: token=xyz; Path=/

<html><body>...</body></html>          ← 响应体
\`\`\`

**状态行**:版本 + 状态码 + 短语。\`200 OK\` 表示成功。

### HTTP 请求方法及语义

| 方法 | 语义 | 安全 | 幂等 | 有请求体 |
| --- | --- | --- | --- | --- |
| **GET** | 获取资源 | 是(不改变服务器状态) | 是(多次执行结果相同) | 一般无 |
| **POST** | 创建资源 | 否 | 否 | 有 |
| **PUT** | 完整更新/替换资源 | 否 | 是 | 有 |
| **DELETE** | 删除资源 | 否 | 是 | 可选 |
| **PATCH** | 部分更新 | 否 | 否 | 有 |
| **HEAD** | 只取响应头 | 是 | 是 | 无 |
| **OPTIONS** | 查询服务器支持的方法 | 是 | 是 | 无 |

**安全(safe)**:不修改服务器资源;**幂等(idempotent)**:重复执行结果不变。GET 必须安全且幂等,这也是刷新页面时 GET 请求会自动重发而 POST 会弹确认框的原因——浏览器认为 POST 可能有副作用。

### HTTP 状态码

状态码是三位数字,按首位分类:

| 类别 | 含义 | 典型 |
| --- | --- | --- |
| **1xx** | 信息性 | 100 Continue、101 Switching Protocols(WebSocket 升级) |
| **2xx** | 成功 | 200 OK、201 Created、204 No Content |
| **3xx** | 重定向 | 301 永久重定向、302 临时重定向、304 Not Modified(缓存) |
| **4xx** | 客户端错误 | 400 Bad Request、401 未认证、403 禁止访问、404 Not Found、405 方法不允许、415 不支持的媒体类型 |
| **5xx** | 服务器错误 | 500 内部错误、502 网关错误、503 服务不可用、504 网关超时 |

记住几个高频:\`200\` 成功、\`301/302\` 跳转、\`401\` 未登录、\`403\` 无权限、\`404\` 资源不存在、\`500\` 服务器异常。在 Spring 中可用 \`@ResponseStatus\` 或 \`ResponseEntity\` 自定义。

### HTTP Headers 详解

请求头与响应头是 HTTP 协议最灵活的部分:

**常用请求头**:
- \`Host\`:目标主机(必填,HTTP/1.1)。
- \`User-Agent\`:客户端标识,服务器可据此返回 PC/移动版页面。
- \`Accept\`:声明能接受的 MIME 类型,如 \`Accept: application/json\`。
- \`Accept-Encoding: gzip\`:接受压缩传输,服务器可 gzip 压缩以省带宽。
- \`Content-Type\`:请求体的格式。表单是 \`application/x-www-form-urlencoded\`,文件上传是 \`multipart/form-data\`,JSON 是 \`application/json\`。
- \`Authorization: Bearer <token>\`:携带认证令牌(JWT 常见)。
- \`Cookie: name=value; ...\`:携带 Cookie。
- \`Referer\`:来源页面 URL,用于防盗链、统计。

**常用响应头**:
- \`Content-Type\`:响应体类型与编码。
- \`Content-Length\`:响应体字节数。
- \`Set-Cookie\`:服务器下发 Cookie,浏览器后续请求自动带上。
- \`Cache-Control\`:缓存策略(\`max-age=3600\`、\`no-cache\`、\`no-store\`)。
- \`Location\`:重定向目标(配合 301/302)。
- \`Access-Control-Allow-Origin\`:CORS 跨域允许的来源。

### 无状态性与 Cookie/Session

HTTP 协议本身无状态:服务器处理完请求就"忘记"了你。但很多业务(购物车、登录态)需要"记住"用户。两种方案:

**Cookie**:服务器通过 \`Set-Cookie\` 头在浏览器存一小段数据,后续请求浏览器自动通过 \`Cookie\` 头带回。优点是保存在客户端,不占服务器内存;缺点是有大小限制(约 4KB)、每次请求都携带、存在 XSS/CSRF 风险。

**Session**:服务器端保存会话数据,通过一个 \`JSESSIONID\` Cookie 标识哪个会话。用户登录后服务器创建 Session,JSESSIONID 通过 Cookie 传给浏览器,后续请求带这个 ID,服务器据此找到对应用户数据。Session 数据可很大,但占服务器内存,且多机部署时存在共享问题。

### HTTP/1.1 vs HTTP/2 vs HTTP/3

| 特性 | HTTP/1.1 | HTTP/2 | HTTP/3 |
| --- | --- | --- | --- |
| 传输层 | TCP | TCP | QUIC(基于 UDP) |
| 多路复用 | 否(队头阻塞) | 是(一个连接多请求) | 是 |
| 头部压缩 | 否 | HPACK | QPACK |
| 二进制分帧 | 否(纯文本) | 是 | 是 |
| 服务器推送 | 否 | 是 | 是 |
| 连接建立 | TCP 三次握手 + TLS | 同 HTTP/1.1 | 0-RTT/1-RTT |

HTTP/2 在 HTTP 语义不变的前提下,把传输改成二进制分帧,大幅提升性能。Java 9+ 的 HttpClient、Tomcat 8.5+ 都支持 HTTP/2。

### HTTPS 与 TLS

**HTTPS = HTTP + TLS/SSL**。TLS 在 TCP 与 HTTP 之间加密,提供:

- **加密**:防止窃听。
- **完整性**:防止篡改。
- **身份认证**:通过证书证明服务器身份,防钓鱼。

握手简化流程:

1. 客户端发 \`ClientHello\`(支持的 TLS 版本、加密套件、随机数)。
2. 服务器回 \`ServerHello\`(选定套件、随机数) + 证书 + \`ServerHelloDone\`。
3. 客户端验证证书(证书链、域名、有效期),生成预主密钥,用服务器公钥加密发送。
4. 双方用三个随机数算出会话密钥,后续用对称加密通信。

现代 Web 几乎强制 HTTPS,Chrome 对 HTTP 站点标记"不安全"。Java Web 部署时常用 Nginx 做 TLS 终止,后端 Tomcat 走 HTTP。

### 用 Chrome DevTools 抓包分析

1. F12 打开开发者工具,切到 **Network** 面板。
2. 刷新页面,左侧列出所有请求。
3. 点某个请求,右侧看四标签:
   - **Headers**:请求头、响应头、状态码。
   - **Payload**:请求参数。
   - **Preview/Response**:响应内容。
   - **Timing**:DNS、连接、传输各阶段耗时。

这是排查 Web 问题最常用的手段。也可以用 \`curl -v\` 命令查看完整报文。

## 设计原则

### 1. 用正确的 HTTP 方法

不要用 GET 做删除操作(可能被爬虫/预加载触发)。RESTful 风格严格遵循方法语义:\`GET /users\` 列表、\`POST /users\` 创建、\`PUT /users/1\` 更新、\`DELETE /users/1\` 删除。

### 2. 用正确的状态码

不要所有错误都返回 200。资源不存在返回 404,权限不足返回 403,服务器异常返回 500。让状态码本身承载语义,客户端可据此分支处理。

### 3. 无状态优先

服务端尽量不保存会话状态,用 JWT 等令牌让客户端携带身份信息,便于水平扩展。

### 4. 安全头部

设置 \`X-Content-Type-Options: nosniff\`、\`X-Frame-Options: DENY\`、\`Content-Security-Policy\` 等安全头,防范 XSS、点击劫持。

## 使用场景

- **接口设计**:理解方法与状态码才能设计规范的 RESTful API。
- **跨域处理**:前后端分离时,理解 CORS 预检请求(\`OPTIONS\`)是关键。
- **性能优化**:用 \`Cache-Control\`、\`ETag\` 做缓存,用 \`gzip\` 压缩。
- **安全**:理解 HTTPS、Cookie 的 \`HttpOnly\`/\`Secure\`/\`SameSite\` 属性防 XSS/CSRF。
- **调试**:抓包定位"为什么返回 500""为什么参数没传到"。

## 代码逐行讲解

下面用 Java 模拟一个 HTTP 请求,直观感受报文结构:

\`\`\`java
import java.io.OutputStream;
import java.net.Socket;

public class HttpRawClient {
    public static void main(String[] args) throws Exception {
        // 用原生 Socket 发送一个最简 HTTP 请求,看清报文长什么样
        Socket socket = new Socket("example.com", 80);  // 建立 TCP 连接

        OutputStream out = socket.getOutputStream();
        // 手动构造 HTTP 请求报文:CRLF 结尾,空行分隔头与体
        String request = "GET / HTTP/1.1\\r\\n"           // 请求行
                       + "Host: example.com\\r\\n"          // 必填请求头
                       + "Connection: close\\r\\n"          // 请求完关闭连接
                       + "\\r\\n";                           // 空行,标志头结束
        out.write(request.getBytes("ISO-8859-1"));
        out.flush();

        // 读取响应
        java.io.InputStream in = socket.getInputStream();
        byte[] buf = new byte[4096];
        int n;
        while ((n = in.read(buf)) != -1) {
            System.out.print(new String(buf, 0, n, "ISO-8859-1"));
        }
        socket.close();
    }
}
\`\`\`

逐行解释:

- \`Socket socket = new Socket("example.com", 80)\`:建立到目标 80 端口的 TCP 连接。HTTP 默认 80,HTTPS 默认 443。
- 报文用 \`\\r\\n\` 作为行结束符,这是 HTTP 规范(\`CRLF\`)。
- \`Connection: close\`:告诉服务器响应完就关连接。HTTP/1.1 默认是 \`keep-alive\`(复用连接)。
- 最后一个 \`\\r\\n\` 是空行,容器靠它区分头部与请求体。

下面演示如何在 Servlet 中读取请求头与参数:

\`\`\`java
@WebServlet("/inspect")
public class InspectServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws java.io.IOException {
        resp.setContentType("text/plain;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        // 1. 读取请求行信息
        out.println("方法: " + req.getMethod());          // GET/POST...
        out.println("URI: " + req.getRequestURI());        // /inspect
        out.println("查询串: " + req.getQueryString());    // ?后面的内容

        // 2. 读取单个参数
        String name = req.getParameter("name");            // ?name=xxx
        out.println("name 参数: " + name);

        // 3. 遍历所有请求头
        out.println("--- 请求头 ---");
        Enumeration<String> headerNames = req.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String h = headerNames.nextElement();
            out.println(h + ": " + req.getHeader(h));
        }

        // 4. 读取 Cookie
        out.println("--- Cookie ---");
        Cookie[] cookies = req.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) {
                out.println(c.getName() + "=" + c.getValue());
            }
        }
    }
}
\`\`\`

- \`req.getMethod()\`:返回请求方法,大写字符串。
- \`req.getRequestURI()\`:返回 URI(不含查询串与主机)。
- \`req.getParameter("name")\`:统一获取参数,无论来自查询串还是表单体。
- \`req.getHeaderNames()\`:获取所有请求头名,枚举遍历。

## 对比

| 维度 | GET | POST |
| --- | --- | --- |
| 参数位置 | URL 查询串 | 请求体 |
| 长度限制 | 浏览器有上限(约 2KB) | 理论无限制(受服务器配置) |
| 安全性 | 参数暴露在 URL,会被日志/历史记录 | 相对隐蔽(非加密) |
| 幂等性 | 幂等 | 非幂等 |
| 缓存 | 可被缓存 | 默认不缓存 |
| 浏览器重发 | 刷新自动重发 | 会弹确认框 |
| 适合场景 | 查询、获取资源 | 提交数据、创建资源 |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| GET 传中文乱码 | URL 编码与解码不一致 | 用 \`URLEncoder.encode\`,Tomcat 配置 URIEncoding=UTF-8 |
| POST 中文乱码 | 未设置请求体编码 | 在读取参数前 \`req.setCharacterEncoding("UTF-8")\` |
| 302 跳转丢数据 | 重定向是新请求, request 域数据丢失 | 用转发(forward)或 Session 传递 |
| Cookie 被脚本读取 | 未设 HttpOnly | \`cookie.setHttpOnly(true)\` 防 XSS |
| 跨域请求被拦 | 浏览器同源策略 | 服务器加 CORS 头 \`Access-Control-Allow-Origin\` |
| 大文件上传失败 | 超过默认大小限制 | Tomcat 配 \`maxPostSize\`,Spring Boot 配 \`max-file-size\` |
| HTTPS 混合内容警告 | HTTPS 页面加载 HTTP 资源 | 全站 HTTPS,或用协议相对 URL |`,
  },

  // =========================================================
  // 第三章:从静态到动态:Web 服务器与容器
  // =========================================================
  {
    id: "jw-03",
    group: "Java Web 基础与 HTTP",
    icon: "🌐",
    title: "从静态到动态:Web 服务器与容器",
    content: `# 从静态到动态:Web 服务器与容器

## 概念讲解

### 静态服务器 vs 动态容器

要理解 Java Web 的运行环境,先区分两类"服务器":

**静态 Web 服务器**:只负责把磁盘上的文件原样发给浏览器。如 Nginx、Apache HTTP Server。它们能高效地处理静态资源(HTML/CSS/JS/图片),但不会"运算"——你访问 \`/index.html\`,它就读 \`index.html\` 发出去。内容是预先写死的,对所有用户都一样。

**动态 Web 容器(应用服务器)**:不仅能发静态文件,还能运行程序、动态生成内容。当请求到来,容器把请求交给对应的 Java 程序(Servlet)处理,程序可以查数据库、做计算、拼 HTML,再把结果返回。**Tomcat、Jetty、Undertow** 就属于这类。

| 对比 | 静态服务器(Nginx) | 动态容器(Tomcat) |
| --- | --- | --- |
| 主要职责 | 发文件、反代、负载均衡 | 运行 Servlet/JSP |
| 处理静态资源 | 极快(零拷贝) | 较慢 |
| 处理动态请求 | 不直接支持 | 核心能力 |
| 并发模型 | 事件驱动,单线程数万连接 | 多线程,每个请求一线程 |
| 典型用法 | 前置反代 + 静态资源 | 后端跑 Java 应用 |

生产环境常见架构:**Nginx 在前**处理静态资源与反代,**Tomcat 在后**运行动态应用。Nginx 抗并发能力强,把动态请求转给 Tomcat。

### Tomcat 体系结构

Tomcat 是 Java Web 最经典的容器,理解它的内部结构有助于排查部署、性能问题。Tomcat 由若干组件分层组成:

\`\`\`
┌─────────────────────────────────────────────────┐
│  Server (整个 Tomcat 实例, 一个 JVM 一个)         │
│  ┌─────────────────────────────────────────────┐  │
│  │  Service (把 Connector 与 Engine 组合)        │  │
│  │  ┌──────────────┐   ┌────────────────────┐ │  │
│  │  │  Connector   │   │  Engine (Catalina) │ │  │
│  │  │  (HTTP/AJP)  │──►│  ├─ Host: localhost │ │  │
│  │  │  接收连接      │   │  │   └─ Context:   │ │  │
│  │  └──────────────┘   │  │       /app      │ │  │
│  │                      │  └─ Host: ...      │ │  │
│  │                      └────────────────────┘ │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
\`\`\`

各组件职责:

- **Server**:Tomcat 实例顶层,一个 JVM 通常一个 Server。
- **Service**:把一个或多个 Connector 与一个 Engine 组合。
- **Connector**:监听端口、接收 TCP 连接、解析 HTTP 报文。常见 HTTP(8080)与 AJP(8009,Apache/Tomcat 通信协议)。
- **Engine**:Servlet 引擎(Catalina),处理所有请求。
- **Host**:虚拟主机,按 \`Host\` 头区分(如 localhost、www.a.com)。
- **Context**:一个 Web 应用,对应一个上下文路径(如 \`/myapp\`)。一个 Context 包含若干 Wrapper。
- **Wrapper**:一个 Servlet 实例。

请求流转:Connector 接收 → 解析为 Request/Response 对象 → 交给 Engine → 匹配 Host → 匹配 Context → 匹配 Wrapper(Servlet) → 调用 Servlet.service()。

### Servlet 容器的职责

Servlet 容器(Tomcat)管理 Servlet 的完整生命周期:

1. **加载**:把 .class 文件或 jar 读入 JVM(类加载器)。
2. **实例化**:调用无参构造创建 Servlet 对象(默认单例)。
3. **初始化**:调用 \`init(ServletConfig)\`,传入配置参数。只调一次。
4. **调用**:每个请求调一次 \`service()\`,它根据方法分发到 \`doGet/doPost\` 等。多线程并发调用。
5. **销毁**:容器关闭或应用卸载时调 \`destroy()\`,释放资源。

容器还负责:HTTP 解析、Session 管理、安全(权限)、JSP 编译、过滤器链、错误页处理等。

### Tomcat 目录结构

解压 Tomcat 后,目录如下:

\`\`\`
apache-tomcat-10.1.x/
├── bin/          // 启动停止脚本:startup.sh、shutdown.sh、catalina.sh
├── conf/         // 配置文件
│   ├── server.xml        // Server/Service/Connector/Engine 配置
│   ├── web.xml           // 全局默认 web.xml
│   └── context.xml       // 全局资源(如数据源)配置
├── lib/          // Tomcat 自带 jar(servlet-api 等)
├── logs/         // 日志:catalina.out、localhost.*.log
├── temp/         // 临时文件
├── webapps/      // 默认应用部署目录,把 war 丢进去自动部署
│   ├── ROOT.war           // 根应用(上下文路径为 /)
│   ├── docs/
│   ├── examples/
│   └── manager/           // 管理应用
└── work/         // JSP 编译后的 .class(运行时生成)
\`\`\`

- \`webapps\`:把 \`myapp.war\` 放这里,Tomcat 启动时自动解压成 \`webapps/myapp/\`,上下文路径为 \`/myapp\`。\`ROOT.war\` 或 \`ROOT/\` 对应根路径 \`/\`。
- \`conf/server.xml\`:核心配置,改端口(8080→80)、改连接器、配置虚拟主机都在这里。

### 部署应用的方式

1. **热部署到 webapps**:把 war 拷进 \`webapps/\`,Tomcat 自动解压部署。简单但生产不推荐(重启丢失配置)。
2. **server.xml 配置 Context**:\`<Context path="/app" docBase="/opt/myapp"/>\`。灵活但侵入主配置。
3. **独立 context.xml**:在应用 \`META-INF/context.xml\` 放配置,Tomcat 自动读取。
4. **内嵌容器**:Spring Boot 把 Tomcat 作为依赖打进 jar,\`java -jar app.jar\` 直接启动,无需外部 Tomcat。这是现代主流。

### 启动流程

1. 执行 \`bin/startup.sh\`(Linux/Mac)或 \`startup.bat\`(Windows)。
2. 脚本调用 \`catalina.sh start\`,启动 JVM 运行 \`org.apache.catalina.startup.Bootstrap\`。
3. Bootstrap 读取 \`conf/server.xml\`,构建 Server/Service/Connector/Engine 组件树。
4. 各组件 \`init()\` 初始化(绑定端口、加载默认 web.xml)。
5. 扫描 \`webapps\`,加载并初始化各 Web 应用(实例化、init Servlet)。
6. Connector 开始监听端口,接受请求。

关闭时执行 \`shutdown.sh\`,发送 SHUTDOWN 命令到 8005 端口,Server 收到后调用各组件 \`destroy()\`。

## 设计原则

### 1. 前后端分离,动静分离

静态资源交给 Nginx,动态请求交给 Tomcat。Nginx 抗并发、发文件快,Tomcat 专注业务。这是现代 Java Web 部署的标配。

### 2. 无状态化便于水平扩展

容器尽量不存会话状态(Session 改用 Redis),这样 Tomcat 可多实例并行,Nginx 负载均衡即可扩展。

### 3. 容器配置与代码分离

端口、数据源、上下文路径等环境相关配置应外置,不写死在代码里。Spring Boot 用 \`application-{profile}.yml\` 区分环境。

### 4. 优雅停机

收到关闭信号时,容器应停止接收新请求、等正在处理的请求完成、再释放资源。Tomcat 的 \`shutdown.sh\` 与 Spring Boot 的 graceful shutdown 都支持。

## 使用场景

- **本地开发**:IDEA 内嵌 Tomcat 或用 Tomcat 插件调试。
- **传统部署**:WAR 包丢进 Tomcat webapps,适合遗留系统。
- **云原生**:Spring Boot 内嵌 Tomcat 打成可执行 jar,Docker 化部署,K8s 编排。
- **性能优化**:理解 Connector 线程模型(\`maxThreads\`、\`acceptCount\`)才能调优。

## 代码逐行讲解

下面是 Tomcat \`conf/server.xml\` 的精简版,讲解关键配置:

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<Server port="8005" shutdown="SHUTDOWN">
    <!-- port=8005:接收关闭命令的端口; shutdown=SHUTDOWN:关闭口令 -->

    <Service name="Catalina">
        <!-- HTTP 连接器:监听 8080 -->
        <Connector port="8080" protocol="HTTP/1.1"
                   connectionTimeout="20000"   <!-- 连接超时 20s -->
                   redirectPort="8443"          <!-- HTTPS 时跳转端口 -->
                   maxThreads="200"             <!-- 最大工作线程 -->
                   acceptCount="100"/>          <!-- 接收队列长度 -->

        <Engine name="Catalina" defaultHost="localhost">
            <!-- 默认虚拟主机 localhost -->
            <Host name="localhost" appBase="webapps"
                  unpackWARs="true" autoDeploy="true">
                <!-- unpackWARs:自动解压 war; autoDeploy:运行时热部署 -->

                <!-- 显式配置一个应用:上下文路径 /app,磁盘位置 /opt/myapp -->
                <Context path="/app" docBase="/opt/myapp" reloadable="false"/>
            </Host>
        </Engine>
    </Service>
</Server>
\`\`\`

逐行解释:

- \`<Connector port="8080">\`:监听端口,生产常改 80(需 root)或前置 Nginx。
- \`maxThreads="200"\`:Tomcat 处理请求的最大线程数。每个请求占一个线程,超过的排队。\`acceptCount\` 是队列长度,满了就拒绝。
- \`redirectPort="8443"\`:收到需要 SSL 的请求时跳转的端口。
- \`<Host name="localhost" appBase="webapps">\`:\`appBase\` 是应用根目录,相对于 Tomcat 主目录。
- \`<Context path="/app" docBase="/opt/myapp">\`:\`path\` 是 URL 前缀,\`docBase\` 是应用磁盘路径。\`reloadable="true"\` 会在 class 变化时自动重载,开发用,生产关掉(性能差)。

下面用 Java 嵌入式启动 Tomcat(Spring Boot 的简化原理):

\`\`\`java
import org.apache.catalina.startup.Tomcat;

public class EmbeddedTomcatDemo {
    public static void main(String[] args) throws Exception {
        // 创建内嵌 Tomcat,监听 8080
        Tomcat tomcat = new Tomcat();
        tomcat.setPort(8080);

        // 配置一个 Context:上下文路径 /,源码目录 src/main/webapp
        tomcat.addWebapp("", new File("src/main/webapp").getAbsolutePath());

        // 启动并阻塞,等待请求
        tomcat.start();
        tomcat.getServer().await();   // 主线程阻塞
    }
}
\`\`\`

- \`new Tomcat()\`:Tomcat 提供了可编程 API,无需 xml 即可启动。Spring Boot 正是用它内嵌容器。
- \`addWebapp("", path)\`:第一个参数是上下文路径(空串表示根 \`/\`)。
- \`tomcat.getServer().await()\`:让主线程阻塞,否则 main 退出 JVM 就关闭了。

## 对比

| 容器 | 特点 | 适合场景 |
| --- | --- | --- |
| **Tomcat** | 最流行,轻量,Servlet/JSP 标准实现 | 通用 Java Web,默认内嵌于 Spring Boot |
| **Jetty** | 更轻量,易嵌入,异步友好 | 嵌入式、云原生、WebSocket 密集 |
| **Undertow** | Red Hat 出品,性能高,资源省 | Spring Boot 高性能场景 |
| **WebLogic/WebSphere** | 全功能 Java EE 应用服务器,重 | 金融等大型遗留系统 |
| **WildFly** | 开源 Jakarta EE 服务器 | 全栈 Jakarta EE 应用 |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| 端口被占用 | 8080 被其他进程占用 | 改 server.xml 端口或杀掉占用进程 |
| war 不自动解压 | unpackWARs 设为 false | 改为 true,或手动解压 |
| 改了 class 不生效 | reloadable=false 或 Tomcat 缓存 | 开发期 reloadable=true,或重启 Tomcat |
| 上下文路径带项目名 | 默认按 war 名作为路径 | 改名为 ROOT.war 或显式配 \`path=""\` |
| 日志看不到异常 | 日志写到 logs/catalina.out | 检查 logs 目录,或改 logging 配置 |
| Session 跨实例不共享 | 多 Tomcat 实例 Session 各自独立 | 用 Redis 共享,或粘性会话 |
| 内嵌 Tomcat 内存溢出 | 默认堆小,大量并发请求 | 调 JVM 参数 \`-Xmx -Xms\` |`,
  },

  // =========================================================
  // 第四章:第一个 Java Web 程序
  // =========================================================
  {
    id: "jw-04",
    group: "Java Web 基础与 HTTP",
    icon: "🌐",
    title: "第一个 Java Web 程序",
    content: `# 第一个 Java Web 程序

## 概念讲解

本章带你从零搭建一个完整的 Java Web 项目:用 IDEA 创建 Maven webapp 骨架,配置 Servlet 依赖,编写并部署一个 HelloServlet,通过浏览器访问。掌握这套流程,你就具备了"跑起来一个 Java Web 应用"的能力。

### Maven webapp 项目结构

Maven 提供了 \`maven-archetype-webapp\` 骨架,生成标准的 Web 应用结构:

\`\`\`
java-web-demo/
├── pom.xml                       // Maven 配置
└── src/
    └── main/
        ├── java/                 // Java 源码
        │   └── com/example/
        │       └── HelloServlet.java
        ├── resources/             // 类路径资源(配置文件)
        └── webapp/                // Web 资源根(对应 WAR 根)
            ├── index.jsp          // 首页(可选)
            └── WEB-INF/
                └── web.xml       // 部署描述符(可选,Servlet 3.0+)
\`\`\`

\`src/main/webapp\` 就是将来 WAR 包的根目录。其中的资源(HTML/CSS/JS)部署后可直接通过 URL 访问;而 \`WEB-INF/\` 下的内容受保护,外部无法直接访问。

### web.xml 部署描述符

\`web.xml\`(Deployment Descriptor)是传统 Java Web 应用的核心配置,声明 Servlet、过滤器、监听器、欢迎页、错误页等。从 **Servlet 3.0** 起支持注解(\`@WebServlet\` 等),web.xml 可省略,但理解它有助于看懂遗留项目。

一个典型的 web.xml 片段:

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="https://jakarta.ee/xml/ns/jakartaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="https://jakarta.ee/xml/ns/jakartaee
         https://jakarta.ee/xml/ns/jakartaee/web-app_6_0.xsd"
         version="6.0">

    <!-- 声明一个 Servlet:类名与实例名 -->
    <servlet>
        <servlet-name>hello</servlet-name>
        <servlet-class>com.example.HelloServlet</servlet-class>
        <load-on-startup>1</load-on-startup>  <!-- 启动时即加载,数字越小越早 -->
    </servlet>

    <!-- 把 URL 映射到 Servlet -->
    <servlet-mapping>
        <servlet-name>hello</servlet-name>
        <url-pattern>/hello</url-pattern>     <!-- 访问 /项目名/hello -->
    </servlet-mapping>

    <!-- 欢迎页:访问 / 时依次尝试 -->
    <welcome-file-list>
        <welcome-file>index.html</welcome-file>
        <welcome-file>index.jsp</welcome-file>
    </welcome-file-list>
</web-app>
\`\`\`

\`<servlet>\` 与 \`<servlet-mapping>\` 通过 \`<servlet-name>\` 关联,实现"URL → 类"的映射。这是注解 \`@WebServlet("/hello")\` 的 XML 写法,二者等价。

### @WebServlet 注解方式

Servlet 3.0 起推荐用注解,一个注解替代两段 XML:

\`\`\`java
@WebServlet("/hello")
public class HelloServlet extends HttpServlet { ... }
\`\`\`

注解的属性:

- \`urlPatterns\` 或 \`value\`:URL 模式,支持通配符(\`/api/*\`)。
- \`name\`:Servlet 名(默认类名)。
- \`loadOnStartup\`:启动时加载顺序。
- \`initParams\`:初始化参数(\`@WebInitParam\`)。
- \`asyncSupported\`:是否支持异步。

### 部署与访问

部署到外部 Tomcat 的方式:

1. Maven 打包:\`mvn package\`,生成 \`target/java-web-demo.war\`。
2. 拷贝 war 到 \`$TOMCAT_HOME/webapps/\`。
3. 启动 Tomcat:\`bin/startup.sh\`。
4. 浏览器访问:\`http://localhost:8080/java-web-demo/hello\`。

其中 \`java-web-demo\` 是上下文路径(默认等于 war 文件名)。若想用根路径 \`/\`,把 war 改名 \`ROOT.war\`。

在 IDEA 中开发,可配置 Tomcat Run Configuration,直接点运行按钮调试,免去手动拷贝。

### 中文乱码处理

中文乱码是 Java Web 最常见的"小问题大麻烦"。乱码的根源是**编码与解码不一致**。处理原则:**在读写数据的最早环节指定 UTF-8**。

- **请求参数乱码**:GET 的参数在 URL 里,Tomcat 解码 URI。Tomcat 8+ 默认 UTF-8,一般无问题;POST 的参数在请求体,默认用 ISO-8859-1 解码,必须 \`req.setCharacterEncoding("UTF-8")\` —— 而且要在 \`getParameter\` 之前调!
- **响应乱码**:服务器生成的 HTML 用什么编码,浏览器用什么解码,必须一致。\`resp.setContentType("text/html;charset=UTF-8")\` 同时设定响应体编码与告知浏览器。
- **JSP 乱码**:JSP 文件顶部 \`<%@ page pageEncoding="UTF-8" contentType="text/html;charset=UTF-8"%>\`。
- **数据库乱码**:连接串加 \`?useUnicode=true&characterEncoding=UTF-8\`,数据库与表也要 UTF-8。
- **文件编码**:IDEA 中确保源码文件本身用 UTF-8 保存(Settings → File Encodings)。

### IDEA 创建 Maven webapp 项目步骤

1. New Project → Maven → 勾选 "Create from archetype" → 选 \`org.apache.maven.archetypes:maven-archetype-webapp\`。
2. 填 groupId(com.example)、artifactId(java-web-demo)。
3. 确认 Maven 路径,Finish。
4. 等待 Maven 下载骨架生成项目。
5. 在 \`src/main\` 下手动建 \`java\` 与 \`resources\` 目录,并 Mark Directory as Sources/Resources Root。
6. 修改 \`pom.xml\` 添加 servlet-api 依赖、设 Java 版本。
7. 配置 Tomcat:Run → Edit Configurations → + → Tomcat Server → Local → 选 Tomcat 安装目录 → Deployment 加 Artifact(war exploded)。
8. 写 Servlet,运行。

## 设计原则

### 1. 配置优先用注解

Servlet 3.0+ 用注解替代 web.xml,减少样板配置,提高可读性。但若配置需要随环境变化(如不同环境不同 Servlet 映射),仍用 XML 或外部配置更灵活。

### 2. 编码统一 UTF-8

项目全链路统一 UTF-8:源文件、编译、请求、响应、数据库。任何一环用 ISO-8859-1 就可能乱码。

### 3. 开发用 exploded,发布用 war

IDEA 调试时用 "war exploded"(解压目录),改代码可热部署;发布用打好的 war 包,版本可控。

### 4. 上下文路径显式化

不要依赖默认路径(war 名),在 CI/CD 中显式配置上下文路径,避免环境差异。

## 使用场景

- **入门第一个项目**:熟悉从建项目到部署访问的全流程。
- **遗留项目维护**:很多老项目仍是 web.xml + Servlet + JSP 结构。
- **理解 Spring Boot 内部**:Spring Boot 内嵌 Tomcat,本质也是这套机制。
- **本地调试**:IDEA + Tomcat 配置是 Java Web 开发的日常。

## 代码逐行讲解

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

// 把该 Servlet 映射到 /hello 与 /hi 两个 URL
@WebServlet(urlPatterns = {"/hello", "/hi"}, loadOnStartup = 1)
public class HelloServlet extends HttpServlet {

    // 容器启动时调用一次,适合做初始化
    @Override
    public void init() throws ServletException {
        System.out.println("HelloServlet 初始化...");
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
        if (name == null || name.isEmpty()) {
            name = "世界";   // 默认值
        }

        // 获取字符输出流,写 HTML
        PrintWriter out = resp.getWriter();
        out.println("<!DOCTYPE html>");
        out.println("<html><head><title>首页</title></head><body>");
        out.println("<h1>你好," + name + "!</h1>");
        out.println("<p>当前时间: " + new java.util.Date() + "</p>");
        out.println("<form method='post' action='hello'>");
        out.println("  姓名:<input name='name' value='" + name + "'/>");
        out.println("  <button>提交</button>");
        out.println("</form>");
        out.println("</body></html>");
    }

    // 处理 POST 请求:直接复用 doGet 逻辑
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        doGet(req, resp);
    }

    // 容器关闭时调用一次,释放资源
    @Override
    public void destroy() {
        System.out.println("HelloServlet 销毁...");
    }
}
\`\`\`

逐行解释:

- \`@WebServlet(urlPatterns = {"/hello", "/hi"}, loadOnStartup = 1)\`:一个 Servlet 可映射多个 URL。\`loadOnStartup=1\` 表示容器启动时就初始化(而非首次请求时),数字代表顺序。
- \`init()\`:重写初始化方法。注意不是必须的,GenericServlet 已有默认实现。
- \`req.setCharacterEncoding("UTF-8")\`:**这一行是 POST 中文不乱码的关键**。它告诉容器用 UTF-8 解析请求体。但只对请求体生效,GET 的参数在 URL,Tomcat 用 URIEncoding 解码。
- \`resp.setContentType("text/html;charset=UTF-8")\`:设置响应为 HTML,并指定 UTF-8。浏览器据此解码。这行不写,中文必乱码。
- \`req.getParameter("name")\`:获取参数。GET 从查询串、POST 从表单体都能取到,API 统一。
- \`resp.getWriter()\`:获取字符输出流 \`PrintWriter\`。写出的内容就是响应体。Tomcat 会自动按 contentType 的字符集编码。
- \`doPost\` 直接调 \`doGet\`:常见模式,让 GET/POST 走同一逻辑,方便用户既能在地址栏访问也能表单提交。

下面是 \`pom.xml\` 的关键部分:

\`\`\`xml
<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>java-web-demo</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>war</packaging>   <!-- 必须是 war 才能部署到 Tomcat -->

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- Jakarta Servlet API(Tomcat 10+) -->
        <dependency>
            <groupId>jakarta.servlet</groupId>
            <artifactId>jakarta.servlet-api</artifactId>
            <version>6.0.0</version>
            <scope>provided</scope>  <!-- 由 Tomcat 提供,不打进 war -->
        </dependency>
    </dependencies>

    <build>
        <finalName>java-web-demo</finalName>  <!-- war 文件名 -->
    </build>
</project>
\`\`\`

- \`<packaging>war</packaging>\`:打包类型。Maven 默认 jar,Web 项目改 war。
- \`<scope>provided</scope>\`:编译期需要,运行期由 Tomcat 提供。避免与 Tomcat 自带的 servlet-api 冲突(ClassNotFoundException 或类转换异常)。
- \`<finalName>\`:生成的 war 文件名,也是上下文路径。

## 对比

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
| IDEA 找不到 Tomcat | 未配置 Run Configuration | Run → Edit Configurations → Tomcat Local |
| 改代码不生效 | 未重新部署或浏览器缓存 | 重启 Tomcat,浏览器 Ctrl+F5 强刷 |
| @WebServlet 不生效 | web-app 版本过低 | web.xml 声明 version >= 3.0,metadata-complete=false |`,
  },
];
