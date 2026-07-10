// =============================================================
// Java Web 应用开发实战教程 —— 第七批章节
// 分组:Spring Boot 入门(共 4 章)
// -------------------------------------------------------------
// 本文件包含以下章节:
//   jw-25: Spring Boot 快速开始
//   jw-26: 自动配置原理
//   jw-27: 配置文件与外部化
//   jw-28: Spring Boot Starter 与 Actuator
//
// 转义约定:content 为反引号模板字符串,内部反引号已转义为 \`,
//          三反引号已转义为 \`\`\`,${ 序列已转义为 \${。
// =============================================================

export const chapters = [
  // =========================================================
  // jw-25:Spring Boot 快速开始
  // =========================================================
  {
    id: "jw-25",
    group: "Spring Boot 入门",
    icon: "🚀",
    title: "Spring Boot 快速开始",
    content: `# Spring Boot 快速开始

## 概念解释

### Spring Boot 是什么

**Spring Boot** 是 Spring 团队于 2014 年推出的快速开发框架,它的核心理念是**约定优于配置**(Convention over Configuration)。在 Spring Boot 出现之前,用 Spring Framework 开发 Web 应用需要大量手动配置:配 web.xml、配 DispatcherServlet、配 DataSource、配各种 Bean,还要打 war 包部署到 Tomcat。一个简单的 Hello World 项目,配置文件比业务代码还多。

Spring Boot 通过**自动配置(Auto-Configuration)** 和 **起步依赖(Starter)** 解决了这个问题:它根据类路径上有什么 jar,自动配置对应的 Bean;它把常用依赖按功能打包成 starter,引入一个就拉进一组配套依赖。开发者只需几行代码就能跑起一个 Web 服务。

### Spring Boot 的核心特性

1. **独立运行**:内嵌 Tomcat/Jetty/Undertow,打成可执行 jar,用 \`java -jar\` 直接运行,不需要外部容器。
2. **自动配置**:根据类路径自动配置 Bean,减少 90% 的样板配置。
3. **起步依赖**:按功能组织依赖,\`spring-boot-starter-web\` 一行搞定 Web 开发所需全部依赖。
4. **生产就绪**:内置 Actuator 提供健康检查、指标监控等运维端点。
5. **无代码生成**:不用 XML 配置,不用代码生成,纯 Java 配置。

### 主启动类

每个 Spring Boot 应用都有一个主启动类,用 \`@SpringBootApplication\` 注解标注:

\`\`\`java
@SpringBootApplication
public class MyApplication {
    public static void main(String[] args) {
        SpringApplication.run(MyApplication.class, args);
    }
}
\`\`\`

\`@SpringBootApplication\` 是一个组合注解,等价于:\`@SpringBootConfiguration\` + \`@EnableAutoConfiguration\` + \`@ComponentScan\`。

## 设计原理

### 1. 约定优于配置

Spring Boot 预设了大量合理的默认值:默认用 Tomcat、默认端口 8080、默认读 \`application.properties\`、默认用 HikariCP 连接池。你不需要任何配置就能跑起来,只在偏离约定时才需自定义。

### 2. 自动配置的"条件化"

自动配置不是无脑配所有 Bean,而是基于 \`@Conditional\` 注解做条件判断:类路径有 \`DataSource\` 类才配数据源;有 \`RedisTemplate\` 才配 Redis。这种"条件化"确保只配你真正用到的组件,不会引入无用 Bean。

### 3. 起步依赖的版本仲裁

Spring Boot 的父 pom(\`spring-boot-starter-parent\`)管理了数百个常用库的版本号,称为 **BOM(Bill of Materials)**。你引入 starter 时不写 version,版本由父 pom 统一保证兼容。这解决了"版本不匹配"的经典痛点。

### 4. 内嵌容器

传统 Spring Web 应用打成 war 包部署到外部 Tomcat。Spring Boot 内嵌 Tomcat,打成可执行 jar 直接运行。这简化了部署(一条命令)、方便了 DevOps(Docker 友好)、还避免了"本地能跑线上不能跑"的环境差异。

## 使用场景

**场景一:快速创建 Web API**——用 Spring Initializr(\`start.spring.io\`)生成项目骨架,选 Web starter,几分钟跑起 REST API。

**场景二:微服务**——每个微服务一个 Spring Boot 应用,打成 jar 独立部署,配合 Spring Cloud 做服务治理。

**场景三:批处理**——用 \`spring-boot-starter-batch\` 开发批处理任务。

**场景四:命令行工具**——用 \`spring-boot-starter\`(非 Web)开发命令行工具,不需要 Servlet 容器。

**不适用场景**:需要高度自定义 Servlet 容器配置的传统 war 部署;需要用 EJB 等重量级 Java EE 特性的老系统。

## 代码示例

### 创建第一个 Spring Boot 应用

\`\`\`java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;

// @SpringBootApplication:组合注解,开启自动配置+组件扫描
@SpringBootApplication
public class MyApplication {

    public static void main(String[] args) {
        // 启动 Spring Boot 应用,内嵌 Tomcat 自动启动
        SpringApplication.run(MyApplication.class, args);
    }
}

// REST 控制器
@RestController
@RequestMapping("/api")
class UserController {

    // GET /api/hello
    @GetMapping("/hello")
    public String hello() {
        return "Hello, Spring Boot!";
    }

    // GET /api/users/{id}
    @GetMapping("/users/{id}")
    public User getUser(@PathVariable Long id) {
        return new User(id, "Alice");
    }
}

// 简单 POJO
class User {
    private Long id;
    private String name;
    // 构造器、getter、setter 省略
    public User(Long id, String name) { this.id = id; this.name = name; }
    public Long getId() { return id; }
    public String getName() { return name; }
}
\`\`\`

### pom.xml 依赖

\`\`\`xml
<parent>
    <!-- Spring Boot 父 pom,管理所有 starter 的版本 -->
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>
</parent>

<dependencies>
    <!-- Web starter:含 Spring MVC + 内嵌 Tomcat + Jackson -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <!-- 不需要写 version,由父 pom 管理 -->
    </dependency>
</dependencies>
\`\`\`

逐行说明:\`@SpringBootApplication\` 开启自动配置和组件扫描;\`SpringApplication.run()\` 启动应用,内嵌 Tomcat 监听 8080 端口;\`@RestController\` 是 \`@Controller + @ResponseBody\`,返回值自动转 JSON;\`spring-boot-starter-parent\` 管理所有依赖版本,引入 starter 时不写 version; \`spring-boot-starter-web\` 一行拉进 Spring MVC、Tomcat、Jackson 等全部 Web 开发依赖。

## 对比分析

### Spring Boot vs Spring Framework

| 维度 | Spring Framework | Spring Boot |
| --- | --- | --- |
| 配置量 | 大(XML/Java Config) | 小(自动配置) |
| 部署方式 | war 包部署到容器 | 可执行 jar 独立运行 |
| 依赖管理 | 手动管版本 | starter + BOM 统一管理 |
| 内嵌容器 | 无 | 有(Tomcat/Jetty) |
| 上手难度 | 中高 | 低 |
| 适用 | 需要精细控制 | 快速开发、微服务 |

### jar vs war 部署对比

| 维度 | jar(可执行) | war(外部容器) |
| --- | --- | --- |
| 部署 | \`java -jar app.jar\` | 丢进 Tomcat webapps |
| 容器 | 内嵌 | 外部 |
| Docker 友好 | 极好 | 一般 |
| 端口管理 | 应用自己管 | 容器管 |
| 多应用共享容器 | 不支持 | 支持 |
| Spring Boot 推荐 | ✅ | 兼容老部署 |

### 常用 Starter 对比

| Starter | 引入的能力 |
| --- | --- |
| spring-boot-starter | 核心 + 自动配置 + 日志 |
| spring-boot-starter-web | Web + Tomcat + Jackson |
| spring-boot-starter-data-jpa | JPA + Hibernate |
| spring-boot-starter-data-redis | Redis |
| spring-boot-starter-security | Spring Security |
| spring-boot-starter-test | JUnit + Mockito |
| spring-boot-starter-actuator | 运维监控端点 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 端口 8080 被占用 | 默认端口冲突 | 在 application.yml 配 \`server.port: 8081\` |
| 自动配置不生效 | 包不在扫描范围内 | 主启动类放根包,或调 \`@ComponentScan\` |
| starter 版本不匹配 | 手动写了 version 覆盖父 pom | 不要写 version,让父 pom 仲裁 |
| jar 包太大 | 打进了所有依赖 | 用 \`spring-boot-maven-plugin\` 的 layered jars 或排除无用依赖 |
| 启动慢 | 扫描范围过大 | 限制 \`@ComponentScan\` 范围,或用 \`@Lazy\` |
| 找不到 Bean | 自动配置条件不满足 | 查看启动日志的 ConditionEvaluationReport |
| 中文乱码 | 默认编码不是 UTF-8 | 配 \`spring.http.encoding.charset=UTF-8\` |
`,
  },

  // =========================================================
  // jw-26:自动配置原理
  // =========================================================
  {
    id: "jw-26",
    group: "Spring Boot 入门",
    icon: "🤖",
    title: "自动配置原理",
    content: `# 自动配置原理

## 概念解释

### 什么是自动配置

自动配置(Auto-Configuration)是 Spring Boot 最核心的特性。它根据类路径上有什么 jar 包、配置文件有什么属性,**自动创建并配置**对应的 Bean。比如:类路径有 \`mysql-connector-java\`,就自动配置一个 MySQL 的 DataSource;有 \`spring-webmvc\`,就自动配置 DispatcherServlet。

在传统 Spring 中,你需要手动在 XML 或 Java Config 里声明每个 Bean。Spring Boot 把这些"标准配置"抽取成一个个 **自动配置类(Auto-Configuration Class)**,根据条件自动生效。

### @SpringBootApplication 的组成

\`@SpringBootApplication\` 是组合注解:

- \`@SpringBootConfiguration\`:等价 \`@Configuration\`,标记主配置类。
- \`@EnableAutoConfiguration\`:开启自动配置,这是自动配置的入口。
- \`@ComponentScan\`:组件扫描,自动发现 \`@Component/@Service/@Controller\` 等。

### @EnableAutoConfiguration 的工作机制

\`@EnableAutoConfiguration\` 通过 \`@Import(AutoConfigurationImportSelector.class)\` 导入一个选择器。这个选择器读取 \`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports\` 文件(Spring Boot 3.x)或 \`spring.factories\`(2.x),里面列出了所有自动配置类的全限定名。

Spring Boot 启动时会加载这些自动配置类,但不是全部生效——每个类上有 \`@Conditional\` 条件注解,只有条件满足才真正装配。

### @Conditional 条件注解

| 注解 | 条件 |
| --- | --- |
| \`@ConditionalOnClass\` | 类路径存在指定类时生效 |
| \`@ConditionalOnMissingClass\` | 类路径不存在指定类时生效 |
| \`@ConditionalOnBean\` | 容器中存在指定 Bean 时生效 |
| \`@ConditionalOnMissingBean\` | 容器中不存在指定 Bean 时生效 |
| \`@ConditionalOnProperty\` | 配置文件有指定属性时生效 |
| \`@ConditionalOnWebApplication\` | 是 Web 应用时生效 |
| \`@ConditionalOnExpression\` | SpEL 表达式为 true 时生效 |

最关键的是 \`@ConditionalOnMissingBean\`——它实现了"自动配置可被覆盖"的设计:如果用户自己定义了某个 Bean,自动配置就不创建默认的。这就是 Spring Boot"零配置但可覆盖"的奥秘。

## 设计原理

### 1. 条件化装配

自动配置不是"无脑全配",而是基于条件判断。每个自动配置类用 \`@Conditional\` 系列注解声明"什么条件下才生效"。这确保只装配你真正用到的组件,不会引入无用 Bean,也不会和你手动配置的 Bean 冲突。

### 2. 用户优先(User Override)

\`@ConditionalOnMissingBean\` 保证了"用户定义的 Bean 优先于自动配置"。如果用户自己声明了 \`DataSource\`,自动配置的 \`DataSource\` 就不创建。这让自动配置成为"默认值"而非"强制值"——你可以随时覆盖任何自动配置。

### 3. 加载顺序与排除

自动配置类有加载顺序(\`@AutoConfigureBefore\`、\`@AutoConfigureAfter\`、\`@AutoConfigureOrder\`)。如果某个自动配置你不想要,可以用 \`@SpringBootApplication(exclude = XxxAutoConfiguration.class)\` 排除,或在配置文件 \`spring.autoconfigure.exclude\` 排除。

### 4. 外部化配置绑定

自动配置类从 \`Environment\`(即 application.yml/properties、环境变量、命令行参数等)读取属性,用 \`@ConfigurationProperties\` 绑定到 Java 对象。这让配置完全外部化,改配置不用改代码。

## 使用场景

**场景一:引入 starter 自动配置**——引入 \`spring-boot-starter-data-jpa\`,自动配置 DataSource、EntityManagerFactory、TransactionManager,你只需配数据库连接信息。

**场景二:覆盖自动配置**——自己定义 \`DataSource\` Bean,自动配置的默认 DataSource 自动让位。

**场景三:查看自动配置报告**——启动时加 \`--debug\` 参数,控制台打印 \`CONDITIONS EVALUATION REPORT\`,显示哪些自动配置生效、哪些没生效及原因。

**场景四:排除不需要的自动配置**——\`@SpringBootApplication(exclude = DataSourceAutoConfiguration.class)\` 排除数据源自动配置(比如不需要数据库的应用)。

## 代码示例

### 自动配置类示例(简化版)

\`\`\`java
import org.springframework.boot.autoconfigure.condition.*;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.*;
import javax.sql.DataSource;

// 自动配置类:只在类路径有 DataSource 时才生效
@Configuration
@ConditionalOnClass(DataSource.class)
@EnableConfigurationProperties(DataSourceProperties.class)
public class DataSourceAutoConfiguration {

    // 从配置文件读取的属性对象
    private final DataSourceProperties properties;

    // 构造器注入属性
    public DataSourceAutoConfiguration(DataSourceProperties properties) {
        this.properties = properties;
    }

    // @Bean + @ConditionalOnMissingBean:用户没定义才创建默认的
    @Bean
    @ConditionalOnMissingBean
    public DataSource dataSource() {
        HikariDataSource ds = new HikariDataSource();
        // 从 properties 读配置
        ds.setJdbcUrl(properties.getUrl());
        ds.setUsername(properties.getUsername());
        ds.setPassword(properties.getPassword());
        return ds;
    }
}

// 配置属性绑定:把 application.yml 的 spring.datasource.* 绑定到字段
@ConfigurationProperties(prefix = "spring.datasource")
public class DataSourceProperties {
    private String url;
    private String username;
    private String password;
    // getter/setter 省略
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
\`\`\`

### application.yml 配置

\`\`\`yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: 123456
\`\`\`

逐行说明:\`@ConditionalOnClass(DataSource.class)\` 确保类路径有 DataSource 才装配;\`@EnableConfigurationProperties\` 把 yaml 配置绑定到 \`DataSourceProperties\` 对象;\`@ConditionalOnMissingBean\` 保证用户自己定义了 DataSource 时不创建默认的;\`@ConfigurationProperties(prefix = "spring.datasource")\` 把 yaml 中 \`spring.datasource.*\` 的值注入对应字段。这就是"你配了 yaml,Spring Boot 自动创建 DataSource;你定义了自己的 DataSource Bean,默认的就让位"。

## 对比分析

### 自动配置 vs 手动配置

| 维度 | 自动配置 | 手动配置 |
| --- | --- | --- |
| 配置量 | 几乎为零 | 大量 XML/Java Config |
| 可控性 | 中(可覆盖) | 高(完全自定义) |
| 上手速度 | 快 | 慢 |
| 适合 | 80% 标准场景 | 20% 特殊需求 |
| 调试 | 启动日志看 report | 代码里看 |

### @Conditional 系列注解对比

| 注解 | 判断什么 | 典型用途 |
| --- | --- | --- |
| @ConditionalOnClass | 类路径有无某类 | 有 jar 才配 |
| @ConditionalOnBean | 容器有无某 Bean | 有依赖 Bean 才配 |
| @ConditionalOnMissingBean | 容器无某 Bean | 用户没配才默认配 |
| @ConditionalOnProperty | 配置有无某属性 | 开关式控制 |
| @ConditionalOnWebApplication | 是否 Web 应用 | Web 专属配置 |

### Spring Boot 2.x vs 3.x 自动配置加载

| 维度 | Spring Boot 2.x | Spring Boot 3.x |
| --- | --- | --- |
| 配置文件 | spring.factories | AutoConfiguration.imports |
| 位置 | META-INF/spring.factories | META-INF/spring/... |
| 格式 | key=value 列表 | 纯类名列表 |
| 原因 | 兼容老格式 | 更清晰、更高效 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 自动配置不生效 | 条件不满足(类不存在等) | 启动加 \`--debug\` 看 report |
| 多个 DataSource 冲突 | 引入了多个数据源 starter | 用 \`@Primary\` 或排除不需要的 |
| 自定义 Bean 不覆盖自动配置 | 没满足 \`@ConditionalOnMissingBean\` 的类型匹配 | 确保自定义 Bean 类型与自动配置一致 |
| 配置属性不绑定 | 没加 \`@EnableConfigurationProperties\` | 在配置类加注解注册 Properties 类 |
| 排除自动配置不生效 | exclude 写在错误位置 | 用 \`@SpringBootApplication(exclude=...)\` 或 yaml |
| 启动报 Bean 循环依赖 | 自动配置间依赖顺序问题 | 用 \`@AutoConfigureAfter\` 调整顺序 |
| properties 中 \${} 没解析 | 没配 PropertySourcesPlaceholderConfigurer | Spring Boot 自动有,检查是否被覆盖 |
`,
  },

  // =========================================================
  // jw-27:配置文件与外部化
  // =========================================================
  {
    id: "jw-27",
    group: "Spring Boot 入门",
    icon: "📝",
    title: "配置文件与外部化",
    content: `# 配置文件与外部化

## 概念解释

### 外部化配置理念

Spring Boot 的一个核心设计是**配置与代码分离**——所有可变配置(数据库地址、端口、密钥等)都放在外部配置文件里,代码不硬编码。这样同一份代码在不同环境(dev/test/prod)运行时,只需换配置文件,不用重新编译。

### application.yml vs application.properties

Spring Boot 支持两种配置文件格式:

\`\`\`properties
# application.properties 风格
server.port=8080
spring.datasource.url=jdbc:mysql://localhost/mydb
spring.datasource.username=root
\`\`\`

\`\`\`yaml
# application.yml 风格(推荐,层次清晰)
server:
  port: 8080
spring:
  datasource:
    url: jdbc:mysql://localhost/mydb
    username: root
\`\`\`

YAML 支持层次结构,可读性更好,是社区主流选择。properties 是扁平的键值对,适合简单配置。

### Profile 多环境配置

用 \`application-{profile}.yml\` 实现多环境隔离:\`application-dev.yml\`、\`application-prod.yml\`。激活方式:

\`\`\`bash
java -jar app.jar --spring.profiles.active=prod
# 或环境变量
export SPRING_PROFILES_ACTIVE=prod
\`\`\`

激活后,\`application-prod.yml\` 的配置覆盖 \`application.yml\` 的同名键。

### 配置加载优先级

Spring Boot 配置有严格的优先级(高到低):

1. 命令行参数(\`--server.port=9090\`)
2. 环境变量(\`SERVER_PORT=9090\`)
3. application.yml / application.properties(外部,与 jar 同级)
4. application.yml / application.properties(类路径内)
5. 默认值

高优先级覆盖低优先级。这让线上紧急改配置时,可以用命令行参数临时覆盖,不用重新打包。

### @ConfigurationProperties 批量绑定

把一组相关配置绑定到一个 Java 对象:

\`\`\`java
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private String name;
    private int timeout;
    // getter/setter
}
\`\`\`

对应 yaml:

\`\`\`yaml
app:
  name: MyApplication
  timeout: 5000
\`\`\`

### @Value 单值注入

\`\`\`java
@Value("\${app.name:default}")
private String appName;
\`\`\`

\`\${app.name:default}\` 表示读 \`app.name\`,没有则用默认值 \`default\`。

## 设计原理

### 1. 约定优于配置

配置文件默认叫 \`application.yml\`,默认放 \`src/main/resources\`。Spring Boot 自动加载,不需要指定路径。端口默认 8080,数据源默认 H2 内存库。你什么都不配就能跑。

### 2. 优先级覆盖机制

多层配置按优先级覆盖,从高到低:命令行 > 环境变量 > 外部文件 > 内部文件 > 默认值。这让"线上临时改配置"和"开发用默认配置"都能优雅实现,不需要 if/else 判断环境。

### 3. 松散绑定(Relaxed Binding)

\`@ConfigurationProperties\` 支持松散绑定:\`app-name\`、\`app_name\`、\`APP_NAME\` 都能绑定到 \`appName\` 字段。这让环境变量命名(通常全大写+下划线)和 yaml 命名(通常短横线)能自动对应。

### 4. 类型安全绑定

\`@ConfigurationProperties\` 把配置绑定到强类型 Java 对象,编译期就能发现类型错误。还支持 \`@Validated\` 做 JSR-303 校验(\`@NotNull\`、\`@Min\` 等),配置值非法时启动即报错。

## 使用场景

**场景一:多环境配置**——dev 用 H2 内存库,prod 用 MySQL,用 Profile 隔离。

**场景二:敏感信息外部化**——数据库密码、API Key 不写在代码里,用环境变量注入。

**场景三:结构化配置**——用 \`@ConfigurationProperties\` 把一组配置绑定为对象,代码里注入对象而非散落的 \`@Value\`。

**场景四:Docker 部署**——用环境变量覆盖配置:\`docker run -e SERVER_PORT=9090 -e SPRING_DATASOURCE_URL=... myapp\`。

## 代码示例

### application.yml 完整示例

\`\`\`yaml
# 服务器配置
server:
  port: 8080
  servlet:
    context-path: /api

# Spring 配置
spring:
  profiles:
    active: dev   # 默认激活 dev
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: \${DB_USER:root}        # 环境变量 DB_USER,默认 root
    password: \${DB_PASSWORD:123456}
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

# 自定义应用配置
app:
  name: My Application
  version: 1.0.0
  timeout: 5000
  features:
    - logging
    - metrics
    - security
\`\`\`

### @ConfigurationProperties 绑定

\`\`\`java
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.constraints.*;

@Component
@ConfigurationProperties(prefix = "app")
@Validated   // 启用校验
public class AppProperties {

    @NotBlank
    private String name;

    @Min(1) @Max(100000)
    private int timeout = 5000;   // 默认值

    private List<String> features;

    // getter/setter 省略
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getTimeout() { return timeout; }
    public void setTimeout(int timeout) { this.timeout = timeout; }
    public List<String> getFeatures() { return features; }
    public void setFeatures(List<String> features) { this.features = features; }
}

// 使用:直接注入
@Service
public class SomeService {
    private final AppProperties appProps;

    public SomeService(AppProperties appProps) {
        this.appProps = appProps;
    }

    public void doSomething() {
        String name = appProps.getName();
        int timeout = appProps.getTimeout();
    }
}
\`\`\`

逐行说明:\`\${DB_USER:root}\` 表示优先读环境变量 \`DB_USER\`,没有则用默认值 \`root\`;\`@ConfigurationProperties(prefix = "app")\` 把 yaml 中 \`app.*\` 绑定到字段;\`@Validated\` 启用 JSR-303 校验,\`@NotBlank\` 保证 name 不为空;\`@Min/@Max\` 校验数值范围;List 类型的 \`features\` 自动绑定 yaml 的列表;\`@Component\` 让 Properties 类本身成为 Bean,可在任意地方注入使用。

## 对比分析

### application.yml vs application.properties

| 维度 | application.yml | application.properties |
| --- | --- | --- |
| 格式 | 层次化 YAML | 扁平 key=value |
| 可读性 | 好(层次清晰) | 一般(前缀重复) |
| 支持列表/Map | 原生支持 | 需特殊语法 |
| 支持多 Profile | --- 分隔 | 需多文件 |
| 社区推荐 | ✅ | 兼容 |

### @Value vs @ConfigurationProperties

| 维度 | @Value | @ConfigurationProperties |
| --- | --- | --- |
| 注入方式 | 单个字段 | 整个 Bean 属性绑定 |
| 松绑定 | 不支持 | 支持(app-name → appName) |
| 校验 | 不支持 | 支持 @Validated |
| 元数据 | 无 | 有(IDE 提示) |
| 适用 | 简单值 | 结构化配置(多字段) |

### 配置加载优先级对比

| 优先级 | 来源 | 示例 |
| --- | --- | --- |
| 1(最高) | 命令行参数 | --server.port=9090 |
| 2 | 环境变量 | SERVER_PORT=9090 |
| 3 | 外部 application.yml | jar 同级目录 |
| 4 | 内部 application.yml | jar 内 classpath |
| 5(最低) | 默认值 | 代码里的默认值 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| YAML 缩进错误 | 用了 Tab 或缩进不一致 | 统一用空格,严格对齐 |
| 环境变量名不对 | 大小写或下划线不匹配 | 用松散绑定:SPRING_DATASOURCE_URL → spring.datasource.url |
| Profile 没生效 | 没激活或名字写错 | 检查 \`spring.profiles.active\` 或 \`SPRING_PROFILES_ACTIVE\` |
| @ConfigurationProperties 不绑定 | 没加 @Component 或没 @EnableConfigurationProperties | 加 @Component 或在配置类 @EnableConfigurationProperties |
| @Value 注入失败 | 属性名写错或没默认值 | 检查 key,加 \`:default\` 默认值 |
| 密码明文在 yaml | 安全隐患 | 用环境变量或加密(\${DB_PASSWORD}) |
| YAML 中 \${} 没解析 | 没配占位符解析器 | Spring Boot 自动有,检查是否被覆盖 |
| 外部配置文件不加载 | 路径不对 | 放 jar 同级或 config/ 子目录,或 \`--spring.config.location\` |
`,
  },

  // =========================================================
  // jw-28:Spring Boot Starter 与 Actuator
  // =========================================================
  {
    id: "jw-28",
    group: "Spring Boot 入门",
    icon: "🩺",
    title: "Spring Boot Starter 与 Actuator",
    content: `# Spring Boot Starter 与 Actuator

## 概念解释

### Starter 起步依赖

**Starter** 是 Spring Boot 的依赖组织方式。它把某个功能所需的全部依赖打包成一个 POM,引入一个 starter 就拉进一组配套的、版本兼容的依赖。

比如 \`spring-boot-starter-web\` 一个依赖就包含:Spring MVC、内嵌 Tomcat、Jackson JSON、Validation 等。不用再手动一个个加 spring-web、tomcat-embed-core、jackson-databind 并管版本。

### 官方常用 Starter

| Starter | 功能 |
| --- | --- |
| \`spring-boot-starter\` | 核心,含自动配置、日志 |
| \`spring-boot-starter-web\` | Web 开发(MVC + Tomcat + Jackson) |
| \`spring-boot-starter-data-jpa\` | JPA + Hibernate |
| \`spring-boot-starter-data-redis\` | Redis 客户端 |
| \`spring-boot-starter-security\` | Spring Security 认证授权 |
| \`spring-boot-starter-test\` | 测试(JUnit + Mockito + AssertJ) |
| \`spring-boot-starter-actuator\` | 运维监控端点 |
| \`spring-boot-starter-validation\` | 参数校验(Bean Validation) |
| \`spring-boot-starter-jdbc\` | JDBC + 连接池 |
| \`spring-boot-starter-mail\` | 邮件发送 |
| \`spring-boot-starter-amqp\` | RabbitMQ |
| \`spring-boot-starter-logging\` | 日志(Logback) |

命名约定:官方 starter 以 \`spring-boot-starter-\` 开头;第三方 starter 以 \`xxx-spring-boot-starter\` 结尾。

### Actuator 运维监控

**Actuator** 是 Spring Boot 的生产就绪(Production-Ready)模块,提供一系列 HTTP 端点(Endpoint)用于监控和管理运行中的应用。引入 \`spring-boot-starter-actuator\` 后,默认暴露两个端点:\`/actuator/health\` 和 \`/actuator/info\`。

### 常用 Actuator 端点

| 端点 | 路径 | 作用 |
| --- | --- | --- |
| health | /actuator/health | 健康检查(数据库、磁盘、Redis 状态) |
| info | /actuator/info | 应用基本信息 |
| metrics | /actuator/metrics | JVM、HTTP 等指标 |
| env | /actuator/env | 环境变量和配置属性 |
| loggers | /actuator/loggers | 动态查看/修改日志级别 |
| beans | /actuator/beans | 所有 Bean 列表 |
| mappings | /actuator/mappings | 所有 URL 映射 |
| shutdown | /actuator/shutdown | 优雅关闭(默认关闭) |
| threaddump | /actuator/threaddump | 线程转储 |
| heapdump | /actuator/heapdump | 堆转储(下载 .hprof) |

### 自定义 Starter

公司内部公共组件也可以做成 Starter。一个 Starter 通常包含:

1. **自动配置类**:用 \`@Configuration\` + \`@ConditionalOnXxx\` 实现条件装配。
2. **配置属性类**:用 \`@ConfigurationProperties\` 接收用户配置。
3. **AutoConfiguration.imports 文件**:在 \`META-INF/spring/\` 下声明自动配置类。

## 设计原理

### 1. 依赖聚合与版本仲裁

Starter 本质是一个 POM,通过 \`<dependencies>\` 把功能相关的依赖聚合。引入 starter 时 Maven 传递依赖把所有子依赖拉进来。版本由父 pom 的 BOM 统一仲裁,保证兼容。

### 2. 自动配置随 Starter 联动

每个 Starter 不仅提供依赖,还带一个对应的自动配置类。引入 \`spring-boot-starter-data-redis\`,既拉进 Redis 客户端 jar,又激活 \`RedisAutoConfiguration\` 自动配置 RedisTemplate。这就是"引入即用"的体验。

### 3. Actuator 的安全设计

Actuator 端点默认只暴露 health 和 info,避免敏感信息泄露。其他端点可通过 \`management.endpoints.web.exposure.include\` 配置开放。生产环境通常只开放 health 给负载均衡器探活,其余端点通过认证或内网访问。

### 4. 健康检查的指标聚合

\`/actuator/health\` 聚合多个 HealthIndicator:DataSourceHealthIndicator(查数据库)、DiskSpaceHealthIndicator(查磁盘)、RedisHealthIndicator(查 Redis)。任一指标 DOWN 则整体 DOWN,负载均衡器据此摘除不健康实例。

## 使用场景

**场景一:引入 Web 开发能力**——\`spring-boot-starter-web\` 一行搞定,自动配置 DispatcherServlet 和内嵌 Tomcat。

**场景二:接入数据库**——\`spring-boot-starter-data-jpa\` + \`mysql-connector-java\`,自动配置 DataSource、EntityManager、TransactionManager。

**场景三:K8s 健康探针**——配置 \`/actuator/health\` 为 K8s liveness/readiness 探针端点。

**场景四:自定义 Starter**——公司公共工具(如内部 RPC 框架)封装成 Starter,各项目引入即用。

**场景五:动态调日志级别**——不重启应用,通过 \`/actuator/loggers/com.example\` POST 修改日志级别。

## 代码示例

### 引入 Actuator

\`\`\`xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
\`\`\`

### application.yml 配置 Actuator

\`\`\`yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,env,loggers   # 开放端点
        exclude: shutdown                            # 排除端点
  endpoint:
    health:
      show-details: always    # 显示健康详情(各子指标)
    shutdown:
      enabled: true            # 开启优雅关闭
  info:
    env:
      enabled: true
\`\`\`

### 自定义健康检查指标

\`\`\`java
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class CustomHealthIndicator implements HealthIndicator {

    @Override
    public Health health() {
        // 检查外部服务是否可用
        boolean serviceOk = checkExternalService();

        if (serviceOk) {
            return Health.up()
                .withDetail("externalService", "running")
                .withDetail("responseTime", "50ms")
                .build();
        } else {
            return Health.down()
                .withDetail("externalService", "unavailable")
                .withDetail("error", "Connection timeout")
                .build();
        }
    }

    private boolean checkExternalService() {
        // 实际检查逻辑(如 ping 第三方 API)
        return true;
    }
}
\`\`\`

### 自定义 Starter 结构

\`\`\`
my-spring-boot-starter/
├── pom.xml
├── src/main/java/
│   ├── com/example/starter/
│   │   ├── MyServiceAutoConfiguration.java   # 自动配置类
│   │   ├── MyServiceProperties.java          # 配置属性
│   │   └── MyService.java                   # 核心服务
└── src/main/resources/
    └── META-INF/spring/
        └── org.springframework.boot.autoconfigure.AutoConfiguration.imports
\`\`\`

\`\`\`java
// 自动配置类
@Configuration
@ConditionalOnClass(MyService.class)
@EnableConfigurationProperties(MyServiceProperties.class)
public class MyServiceAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public MyService myService(MyServiceProperties props) {
        return new MyService(props.getPrefix());
    }
}

// 配置属性
@ConfigurationProperties(prefix = "my.service")
public class MyServiceProperties {
    private String prefix = "default";
    public String getPrefix() { return prefix; }
    public void setPrefix(String prefix) { this.prefix = prefix; }
}
\`\`\`

AutoConfiguration.imports 文件内容:

\`\`\`
com.example.starter.MyServiceAutoConfiguration
\`\`\`

逐行说明:\`management.endpoints.web.exposure.include\` 控制哪些端点开放;\`show-details: always\` 显示健康检查各子指标;\`HealthIndicator\` 接口实现自定义健康检查,返回 \`Health.up()\` 或 \`Health.down()\`;自定义 Starter 需在 \`AutoConfiguration.imports\` 文件声明自动配置类全名,Spring Boot 启动时自动加载;\`@ConditionalOnMissingBean\` 保证用户可覆盖默认的 MyService。

## 对比分析

### Actuator 端点安全级别对比

| 端点 | 敏感度 | 默认是否暴露 | 建议 |
| --- | --- | --- | --- |
| health | 低 | ✅ 是 | 给负载均衡探活 |
| info | 低 | ✅ 是 | 应用信息 |
| metrics | 中 | ❌ 否 | 配认证后开放 |
| env | 高 | ❌ 否 | 内网/认证访问 |
| beans | 高 | ❌ 否 | 内网/认证访问 |
| shutdown | 极高 | ❌ 否 | 谨慎开启 |

### 官方 Starter vs 第三方 Starter

| 维度 | 官方 Starter | 第三方 Starter |
| --- | --- | --- |
| 命名 | spring-boot-starter-xxx | xxx-spring-boot-starter |
| 版本 | 跟 Spring Boot 版本走 | 独立版本 |
| 质量 | 官方维护 | 看作者 |
| 典型 | starter-web、starter-data-jpa | mybatis-spring-boot-starter |

### health 端点状态对比

| 状态 | 含义 | 负载均衡行为 |
| --- | --- | --- |
| UP | 健康 | 正常路由 |
| DOWN | 不健康 | 摘除流量 |
| OUT_OF_SERVICE | 暂停服务 | 摘除流量 |
| UNKNOWN | 未知 | 视策略而定 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| Actuator 端点 404 | 默认只暴露 health/info | 配 \`management.endpoints.web.exposure.include: *\` |
| 敏感端点泄露 | env/beans 开放到公网 | 配认证(Spring Security)或只内网访问 |
| health 不显示详情 | 默认不显示子指标 | 配 \`management.endpoint.health.show-details: always\` |
| 自定义 Starter 不生效 | AutoConfiguration.imports 路径错 | 确认在 \`META-INF/spring/\` 下 |
| Starter 名命名不规范 | 与官方重名或混淆 | 官方前缀 spring-boot-starter-;第三方后缀 -spring-boot-starter |
| shutdown 误触发 | 开了 shutdown 端点且无认证 | 默认关闭,开启需配认证 |
| 健康检查导致应用启动慢 | DataSource/Redis 健康检查超时 | 配 \`management.health.defaults.enabled\` 按需关闭 |
| metrics 没有自定义指标 | 没注册 MeterRegistry | 用 \`MeterRegistry\` 注册自定义指标 |
`,
  },
];
