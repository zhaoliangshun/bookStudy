// =============================================================
// Java Web 应用开发实战教程 —— 第八批章节
// 分组:Spring MVC Web(共 4 章)
// -------------------------------------------------------------
// 本文件包含以下章节:
//   jw-29: Spring MVC 架构与请求流程
//   jw-30: 控制器与路由映射
//   jw-31: 参数绑定与数据校验
//   jw-32: 拦截器与异常处理
//
// 转义约定:content 为反引号模板字符串,内部反引号已转义为 \`,
//          三反引号已转义为 \`\`\`,${ 序列已转义为 \${。
// =============================================================

export const chapters = [
  // =========================================================
  // jw-29:Spring MVC 架构与请求流程
  // =========================================================
  {
    id: "jw-29",
    group: "Spring MVC Web",
    icon: "🏗️",
    title: "Spring MVC 架构与请求流程",
    content: `# Spring MVC 架构与请求流程

## 概念解释

### Spring MVC 是什么

**Spring MVC** 是 Spring 框架的 Web 模块,基于经典的 **MVC(Model-View-Controller)** 设计模式构建的 Web 框架。它围绕 **前端控制器(Front Controller)** 模式设计,核心是 \`DispatcherServlet\`——所有 HTTP 请求都先经过它,再由它分发给对应的处理器。

Spring MVC 是当前 Java Web 开发的主流框架,几乎所有的 Spring Web 应用都基于它(或其响应式版本 Spring WebFlux)。在 Spring Boot 中引入 \`spring-boot-starter-web\` 就自动配置了 Spring MVC。

### 核心组件

| 组件 | 作用 |
| --- | --- |
| \`DispatcherServlet\` | 前端控制器,接收所有请求并分发 |
| \`HandlerMapping\` | 处理器映射,根据 URL 找到对应的 Controller 方法 |
| \`HandlerAdapter\` | 处理器适配器,调用 Controller 方法 |
| \`ViewResolver\` | 视图解析器,把逻辑视图名解析为物理视图(REST API 时代少用) |
| \`HandlerInterceptor\` | 拦截器,在 Controller 前后插入逻辑 |
| \`HandlerExceptionResolver\` | 异常解析器,统一处理 Controller 抛出的异常 |

### 请求处理流程

一个 HTTP 请求从到达到响应,完整经过以下步骤:

\`\`\`
浏览器请求 → DispatcherServlet → HandlerMapping → HandlerAdapter
    → HandlerInterceptor.preHandle → Controller 方法
    → HandlerInterceptor.postHandle → ViewResolver/消息转换器
    → HandlerInterceptor.afterCompletion → 响应返回浏览器
\`\`\`

详细步骤:

1. **DispatcherServlet 接收请求**:所有请求(\`/\`)先到达 DispatcherServlet。
2. **HandlerMapping 查找处理器**:根据 URL 和 HTTP 方法,找到对应的 \`@RequestMapping\` 方法和拦截器链。
3. **HandlerInterceptor.preHandle**:拦截器的前置处理(如登录校验),返回 false 则中断。
4. **HandlerAdapter 调用 Controller**:适配器调用 Controller 方法,处理参数绑定。
5. **Controller 执行业务**:方法执行,返回结果(String 视图名、对象、ResponseEntity 等)。
6. **HandlerInterceptor.postHandle**:拦截器后置处理(可修改 ModelAndView)。
7. **结果处理**:REST API 用 \`HttpMessageConverter\`(如 Jackson)把返回对象转 JSON;传统 MVC 用 ViewResolver 渲染视图。
8. **HandlerInterceptor.afterCompletion**:拦截器完成后处理(清理资源),即使异常也会执行。

### 前端控制器模式

DispatcherServlet 是"前端控制器"模式的实现。它的好处:所有请求统一入口,便于做**全局处理**(拦截器、异常处理、编码设置),避免每个 Servlet 各自为战。Controller 只关注业务逻辑,不关心请求分发。

## 设计原理

### 1. 单一入口的 DispatcherServlet

所有请求经过一个 Servlet,统一处理编码、安全头、异常等横切逻辑。Controller 不直接处理 HTTP 协议细节,只接收已解析的参数。

### 2. 分层解耦

DispatcherServlet 负责流程编排,HandlerMapping 负责找处理器,HandlerAdapter 负责调用,ViewResolver/MessageConverter 负责结果渲染。各组件职责单一,可替换。比如换 JSON 库只需换 HttpMessageConverter,不动其他组件。

### 3. 约定优于配置

\`@RequestMapping\` 默认按 URL 匹配;\`@ResponseBody\` 默认用 Jackson 序列化;视图名默认拼前缀+名字+后缀。不需要显式配 HandlerMapping 或 ViewResolver,默认开箱即用。

### 4. 可扩展的拦截器链

拦截器链模式让横切逻辑(日志、权限、性能)以插件方式插入,不侵入 Controller。多个拦截器按顺序执行,灵活组合。

## 使用场景

**场景一:REST API 开发**——\`@RestController\` + \`@GetMapping\`,返回对象自动转 JSON,前后端分离标配。

**场景二:传统 MVC 页面渲染**——Controller 返回视图名,ViewResolver 渲染 Thymeleaf/JSP。适合服务端渲染场景。

**场景三:文件上传下载**——\`MultipartFile\` 接收上传,\`ResponseEntity\` 返回下载流。

**场景四:全局异常处理**——\`@ControllerAdvice\` 统一捕获异常,返回标准错误 JSON。

**不适用场景**:响应式/非阻塞 IO 场景用 Spring WebFlux(基于 Netty + Reactor),不用 Spring MVC(基于 Servlet,阻塞 IO)。

## 代码示例

### Spring MVC 请求流程演示

\`\`\`java
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

// @RestController = @Controller + @ResponseBody
// 所有方法返回值自动转 JSON
@RestController
@RequestMapping("/api/users")
public class UserController {

    // GET /api/users/{id}
    // @PathVariable 绑定 URL 路径变量
    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        User user = userService.findById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();  // 404
        }
        return ResponseEntity.ok(user);  // 200 + JSON
    }

    // POST /api/users
    // @RequestBody 把请求体 JSON 绑定到对象
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User saved = userService.save(user);
        return ResponseEntity.status(201).body(saved);  // 201 Created
    }

    // PUT /api/users/{id}
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);
        return userService.save(user);
    }

    // DELETE /api/users/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteById(id);
        return ResponseEntity.noContent().build();  // 204
    }
}
\`\`\`

### DispatcherServlet 配置(Spring Boot 自动配)

\`\`\`java
// Spring Boot 自动配置了 DispatcherServlet,不需要手动配
// 传统 Spring 需要在 web.xml 中配:
/*
<servlet>
    <servlet-name>dispatcher</servlet-name>
    <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
    <init-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>classpath:spring-mvc.xml</param-value>
    </init-param>
    <load-on-startup>1</load-on-startup>
</servlet>
<servlet-mapping>
    <servlet-name>dispatcher</servlet-name>
    <url-pattern>/</url-pattern>   <!-- 拦截所有请求 -->
</servlet-mapping>
*/
\`\`\`

逐行说明:\`@RestController\` 标记控制器且所有方法返回值转 JSON;\`@RequestMapping("/api/users")\` 定义类级别基础路径;\`@GetMapping("/{id}")\` 组合注解,等价 \`@RequestMapping(method=GET, value="/{id}")\`;\`@PathVariable\` 把 URL 中的 \`{id}\` 绑定到方法参数;\`@RequestBody\` 把请求体 JSON 反序列化为对象;\`ResponseEntity\` 可自定义 HTTP 状态码和响应体;Spring Boot 自动配置 DispatcherServlet,传统 Spring 需在 web.xml 手动配。

## 对比分析

### Spring MVC vs Spring WebFlux

| 维度 | Spring MVC | Spring WebFlux |
| --- | --- | --- |
| 底层 | Servlet API(阻塞 IO) | Reactor(非阻塞 IO) |
| 容器 | Tomcat/Jetty(Servlet) | Netty/Undertow(非 Servlet) |
| 编程模型 | 同步阻塞 | 响应式(Mono/Flux) |
| 线程模型 | 一请求一线程 | 少量线程处理大量请求 |
| 学习曲线 | 低 | 高(需懂 Reactor) |
| 适用 | 传统 Web API | 高并发实时场景 |

### Spring MVC vs Struts2

| 维度 | Spring MVC | Struts2 |
| --- | --- | --- |
| 核心 | DispatcherServlet | FilterDispatcher |
| 入口 | 方法级 | 类级 |
| 参数绑定 | 方法参数 | 成员变量 |
| 线程安全 | 单例(线程安全) | 每请求新建实例 |
| 生态 | Spring 全家桶 | 独立 |
| 现状 | 主流 | 已淘汰 |

### REST API vs 传统 MVC

| 维度 | REST API(@RestController) | 传统 MVC(@Controller) |
| --- | --- | --- |
| 返回 | JSON/XML 数据 | 视图名(HTML) |
| 转换 | HttpMessageConverter | ViewResolver |
| 前后端 | 分离 | 耦合 |
| 适用 | 前端 SPA、移动端 | 服务端渲染 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 404 找不到映射 | URL 路径不匹配 | 检查 \`@RequestMapping\` 路径和 HTTP 方法 |
| 返回 JSON 乱码 | 没配字符编码 | Spring Boot 默认 UTF-8,传统 Spring 需配 \`CharacterEncodingFilter\` |
| @RequestBody 报 415 | Content-Type 不对 | 请求头加 \`Content-Type: application/json\` |
| 静态资源 404 | DispatcherServlet 拦截了所有请求 | Spring Boot 自动处理,传统 Spring 需配 \`<mvc:resources>\` |
| Controller 是单例 | 默认单例,不要有实例变量 | 无状态设计,或用 \`@Scope("prototype")\` |
| 响应不是 JSON | 缺 Jackson 依赖 | 引入 \`spring-boot-starter-web\`(含 Jackson) |
`,
  },

  // =========================================================
  // jw-30:控制器与路由映射
  // =========================================================
  {
    id: "jw-30",
    group: "Spring MVC Web",
    icon: "🎯",
    title: "控制器与路由映射",
    content: `# 控制器与路由映射

## 概念解释

### 控制器(Controller)

控制器是 Spring MVC 中处理 HTTP 请求的组件。用 \`@Controller\` 或 \`@RestController\` 标注一个类,其中的每个方法对应一个请求处理器。

- \`@Controller\`:传统 MVC,方法返回视图名,配合 ViewResolver 渲染页面。
- \`@RestController\`:\`@Controller + @ResponseBody\`,方法返回值直接转为响应体(通常是 JSON)。**REST API 开发首选。**

### 路由映射注解

Spring MVC 用 \`@RequestMapping\` 及其快捷变体做路由映射:

| 注解 | HTTP 方法 | 用途 |
| --- | --- | --- |
| \`@GetMapping\` | GET | 查询资源 |
| \`@PostMapping\` | POST | 创建资源 |
| \`@PutMapping\` | PUT | 全量更新资源 |
| \`@PatchMapping\` | PATCH | 部分更新资源 |
| \`@DeleteMapping\` | DELETE | 删除资源 |
| \`@RequestMapping\` | 任意/指定 | 通用映射 |

这些组合注解是 \`@RequestMapping(method = RequestMethod.XXX)\` 的快捷方式,更简洁。

### URL 路径模式

\`@RequestMapping\` 支持多种路径模式:

- 精确匹配:\`/api/users\`
- 路径变量:\`/api/users/{id}\`,用 \`@PathVariable\` 获取
- Ant 模式:\`/api/users/**\` 匹配多层路径
- 正则:\`/api/users/{id:[0-9]+}\` 限定 id 为数字

### RESTful 路由设计

REST(Representational State Transfer)是一种 Web API 设计风格,用 HTTP 方法表示操作,URL 表示资源:

| HTTP 方法 | URL | 操作 | 示例 |
| --- | --- | --- | --- |
| GET | /api/users | 查询列表 | 获取所有用户 |
| GET | /api/users/{id} | 查询单个 | 获取 id=1 的用户 |
| POST | /api/users | 创建 | 新建用户 |
| PUT | /api/users/{id} | 全量更新 | 更新用户信息 |
| PATCH | /api/users/{id} | 部分更新 | 更新用户某字段 |
| DELETE | /api/users/{id} | 删除 | 删除用户 |

RESTful 的核心:URL 是名词(资源),HTTP 方法是动词(操作),用 HTTP 状态码表示结果。

### 请求参数绑定

| 注解 | 作用 | 来源 |
| --- | --- | --- |
| \`@PathVariable\` | URL 路径变量 | \`/users/{id}\` 中的 id |
| \`@RequestParam\` | 查询参数 | \`?name=alice\` 中的 name |
| \`@RequestBody\` | 请求体 | POST/PUT 的 body |
| \`@RequestHeader\` | 请求头 | Header 中的值 |
| \`@CookieValue\` | Cookie 值 | Cookie 中的值 |

## 设计原理

### 1. 方法级路由

Spring MVC 的路由是**方法级**的——每个 \`@RequestMapping\` 方法是一个独立处理器。这与 Struts2 的类级路由不同,方法级更灵活,一个 Controller 可处理多个 URL。

### 2. RESTful 约定

用 HTTP 方法区分 CRUD 操作,URL 是资源名词不带动词。这比 \`/getUserById?id=1\` 更规范、更语义化。GET 是幂等的(多次请求结果一致),POST 不幂等,PUT/DELETE 应该幂等。

### 3. 参数自动绑定

Spring MVC 自动把请求数据(路径变量、查询参数、请求体、请求头)绑定到方法参数。开发者只需声明参数类型和注解,不用手动从 request 中取值和类型转换。

### 4. 内容协商

返回 \`@ResponseBody\` 时,Spring MVC 根据请求头 \`Accept\` 决定响应格式(JSON/XML)。默认用 \`HttpMessageConverter\`(Jackson 对应 JSON,JAXB 对应 XML)序列化返回对象。这让一个方法支持多种响应格式。

## 使用场景

**场景一:RESTful CRUD API**——资源用名词 URL,操作用 HTTP 方法,状态码表示结果。

**场景二:文件上传**——\`@RequestParam("file") MultipartFile\` 接收上传文件。

**场景三:多 URL 映射到同一方法**——\`@GetMapping({"/users", "/u"})\` 多个路径映射到同一处理器。

**场景四:跨域控制**——\`@CrossOrigin(origins = "http://localhost:3000")\` 允许前端跨域访问。

## 代码示例

\`\`\`java
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    // 构造器注入
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // GET /api/users?page=0&size=10
    // @RequestParam 绑定查询参数,带默认值
    @GetMapping
    public List<User> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return userService.findAll(page, size);
    }

    // GET /api/users/{id}
    // @PathVariable 绑定 URL 路径变量
    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Long id) {
        User user = userService.findById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    // GET /api/users/search?name=alice
    @GetMapping("/search")
    public List<User> searchByName(@RequestParam String name) {
        return userService.findByName(name);
    }

    // POST /api/users
    // @RequestBody 把请求体 JSON 绑定到 User 对象
    @PostMapping
    public ResponseEntity<User> create(@RequestBody User user) {
        User saved = userService.save(user);
        return ResponseEntity.status(201).body(saved);
    }

    // PUT /api/users/{id}
    @PutMapping("/{id}")
    public User update(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);
        return userService.save(user);
    }

    // DELETE /api/users/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
\`\`\`

逐行说明:\`@RequestMapping("/api/users")\` 定义类级基础路径,方法路径会拼接;\`@GetMapping\` 不带路径时映射到类级路径;\`@RequestParam(defaultValue = "0")\` 绑定查询参数并设默认值;\`@PathVariable\` 绑定 \`{id}\` 路径变量;\`@RequestBody\` 把 POST/PUT 请求体 JSON 反序列化为对象;\`ResponseEntity\` 可自定义状态码和响应体,201 表示创建成功,204 表示无内容,404 表示未找到。

## 对比分析

### @Controller vs @RestController

| 维度 | @Controller | @RestController |
| --- | --- | --- |
| 返回值 | 视图名 | JSON/响应体 |
| 含 @ResponseBody | 否 | 是 |
| 适用 | 服务端渲染 | REST API |
| 前后端 | 耦合 | 分离 |

### 路径变量 vs 查询参数

| 维度 | @PathVariable | @RequestParam |
| --- | --- | --- |
| 来源 | URL 路径 | 查询字符串 |
| 必需 | 默认必需 | 可设 optional |
| URL 示例 | /users/123 | /users?id=123 |
| 适用 | 资源标识 | 过滤条件 |

### RESTful vs 非 RESTful 路由

| 维度 | RESTful | 非 RESTful |
| --- | --- | --- |
| URL | 名词(/users/1) | 动词(/getUser?id=1) |
| 方法 | GET/POST/PUT/DELETE | 都用 GET/POST |
| 状态码 | 200/201/204/404/500 | 都用 200 |
| 语义 | 清晰 | 模糊 |

### HTTP 状态码对比

| 状态码 | 含义 | 使用场景 |
| --- | --- | --- |
| 200 OK | 成功 | GET/PUT/PATCH 成功 |
| 201 Created | 已创建 | POST 创建成功 |
| 204 No Content | 无内容 | DELETE 成功 |
| 400 Bad Request | 请求错误 | 参数校验失败 |
| 404 Not Found | 未找到 | 资源不存在 |
| 500 Internal Error | 服务器错误 | 未捕获异常 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 路径变量名不匹配 | \`{id}\` 和参数名不一致 | 加 \`@PathVariable("id")\` 显式指定 |
| @RequestBody 报 415 | Content-Type 不对 | 请求头加 \`application/json\` |
| @RequestParam 中文乱码 | GET 请求 URL 编码问题 | Tomcat 配 URIEncoding=UTF-8 |
| POST 请求参数为 null | 没加 @RequestBody 或 Content-Type 错 | 加 @RequestBody,设 Content-Type |
| 多个映射冲突 | 两个方法匹配同一 URL | 检查路径是否有歧义 |
| PUT/PATCH 不生效 | 表单只支持 GET/POST | 加 HiddenHttpMethodFilter |
| @PathVariable 类型转换失败 | URL 是字符串但参数是 Long | 确保路径变量值可转数字 |
| 返回日期格式不对 | Jackson 默认时间戳 | 配 \`spring.jackson.date-format\` |
`,
  },

  // =========================================================
  // jw-31:参数绑定与数据校验
  // =========================================================
  {
    id: "jw-31",
    group: "Spring MVC Web",
    icon: "✅",
    title: "参数绑定与数据校验",
    content: `# 参数绑定与数据校验

## 概念解释

### 参数绑定

Spring MVC 自动把 HTTP 请求数据绑定到 Controller 方法参数上。根据数据来源不同,用不同注解:

| 注解 | 数据来源 | 示例 |
| --- | --- | --- |
| \`@PathVariable\` | URL 路径变量 | \`/users/{id}\` → id |
| \`@RequestParam\` | 查询参数/表单字段 | \`?name=alice\` → name |
| \`@RequestBody\` | 请求体(JSON) | POST body → User 对象 |
| \`@RequestHeader\` | 请求头 | \`Authorization\` 头 |
| \`@CookieValue\` | Cookie | \`sessionId\` Cookie |
| 无注解 | 自动推断 | 简单类型自动匹配查询参数 |

### 数据校验(Bean Validation)

用户提交的数据不可信——邮箱格式错、年龄为负数、必填字段为空。**Bean Validation**(JSR-380,即 Hibernate Validator 实现)提供了一套声明式校验注解,在对象字段上标注校验规则,框架自动校验。

### 常用校验注解

| 注解 | 作用 | 示例 |
| --- | --- | --- |
| \`@NotNull\` | 不为 null | \`@NotNull private String name;\` |
| \`@NotBlank\` | 不为 null 且非空串 | \`@NotBlank private String email;\` |
| \`@NotEmpty\` | 不为 null 且非空集合 | \`@NotEmpty private List<String> tags;\` |
| \`@Size\` | 长度范围 | \`@Size(min=6, max=20) String password;\` |
| \`@Min/@Max\` | 数值范围 | \`@Min(0) @Max(150) int age;\` |
| \`@Email\` | 邮箱格式 | \`@Email String email;\` |
| \`@Pattern\` | 正则匹配 | \`@Pattern(regexp="^1[3-9]\\\\d{9}$") String phone;\` |
| \`@Past/@Future\` | 过去/未来日期 | \`@Past LocalDate birthday;\` |
| \`@Valid\` | 级联校验嵌套对象 | \`@Valid Address address;\` |

### @Valid vs @Validated

- \`@Valid\`:JSR-380 标准注解,支持嵌套校验,不支持分组。
- \`@Validated\`:Spring 扩展注解,支持**分组校验**(不同场景用不同校验规则),不支持嵌套。

### 分组校验

同一对象在不同场景用不同校验规则。比如 User 在创建时需要校验 id 为空(自动生成),在更新时需要校验 id 不为空:

\`\`\`java
public class User {
    @NotNull(groups = Update.class)   // 更新时 id 不能为空
    @Null(groups = Create.class)      // 创建时 id 必须为空
    private Long id;
}
\`\`\`

## 设计原理

### 1. 声明式校验

校验规则用注解声明在字段上,而非在业务代码里 if/else 判断。这让校验逻辑与业务逻辑分离,规则集中、可复用、可维护。

### 2. 失败即拒绝

\`@Valid\` 标注的参数,框架在调用 Controller 方法前自动校验。校验失败抛 \`MethodArgumentNotValidException\`,方法根本不会被调用。这保证了 Controller 方法拿到的参数一定是合法的。

### 3. 分组校验的灵活性

同一对象不同场景不同规则,通过分组接口实现。这避免了"创建时校验 id 为空,更新时校验 id 不为空"的矛盾,不需要建两个 DTO。

### 4. 国际化错误消息

校验失败的消息可以从 \`ValidationMessages.properties\` 读取,支持多语言。每个校验注解的 message 可指定 key,按语言环境取消息。

## 使用场景

**场景一:表单提交校验**——用户注册时校验邮箱格式、密码长度、手机号格式。

**场景二:API 参数校验**——REST API 接收 JSON 时校验必填字段、数值范围。

**场景三:分组校验**——创建和更新用不同校验规则。

**场景四:嵌套校验**——User 内有 Address 对象,用 \`@Valid\` 级联校验 Address 的字段。

## 代码示例

\`\`\`java
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

// 校验分组接口
public interface Create {}
public interface Update {}

// DTO 对象,字段上标注校验规则
public class UserDTO {

    @NotNull(groups = Update.class)    // 更新时必须有 id
    @Null(groups = Create.class)       // 创建时 id 必须为空
    private Long id;

    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 20, message = "用户名长度必须在 3-20 之间")
    private String username;

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;

    @NotBlank(groups = Create.class, message = "密码不能为空")  // 仅创建时校验
    @Size(min = 6, max = 20, groups = Create.class)
    private String password;

    @Min(value = 0, message = "年龄不能小于 0")
    @Max(value = 150, message = "年龄不能大于 150")
    private Integer age;

    // 嵌套对象校验
    @Valid
    private AddressDTO address;

    // getter/setter 省略
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public AddressDTO getAddress() { return address; }
    public void setAddress(AddressDTO address) { this.address = address; }
}

// 嵌套 DTO
public class AddressDTO {
    @NotBlank(message = "地址不能为空")
    private String detail;

    @NotBlank(message = "城市不能为空")
    private String city;

    public String getDetail() { return detail; }
    public void setDetail(String detail) { this.detail = detail; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
}

@RestController
@RequestMapping("/api/users")
@Validated   // 类级别开启校验(支持分组)
public class UserController {

    // POST 创建:@Validated(Create.class) 使用 Create 分组规则
    @PostMapping
    public User create(@RequestBody @Validated(Create.class) UserDTO dto) {
        // 走到这里说明校验已通过
        return userService.create(dto);
    }

    // PUT 更新:@Validated(Update.class) 使用 Update 分组规则
    @PutMapping("/{id}")
    public User update(@PathVariable Long id, @RequestBody @Validated(Update.class) UserDTO dto) {
        dto.setId(id);
        return userService.update(dto);
    }

    // GET 查询:@RequestParam 校验
    @GetMapping("/search")
    public List<User> search(
            @RequestParam @NotBlank String name,     // 不能为空串
            @RequestParam @Min(1) int page) {        // 页码至少为 1
        return userService.search(name, page);
    }
}
\`\`\`

逐行说明:\`@NotNull/@Null\` + \`groups\` 实现分组校验——更新时 id 必须有,创建时 id 必须空;\`@NotBlank\` 校验非空串(\`@NotNull\` 只校验非 null,空串能过);\`@Email\` 校验邮箱格式;\`@Size(min, max)\` 校验字符串长度;\`@Min/@Max\` 校验数值范围;\`@Valid\` 级联校验嵌套的 AddressDTO 字段;\`@Validated(Create.class)\` 指定使用 Create 分组;\`@Validated\` 标在类上支持方法参数级别的校验(如 \`@RequestParam @NotBlank\`)。

## 对比分析

### @Valid vs @Validated

| 维度 | @Valid | @Validated |
| --- | --- | --- |
| 来源 | JSR-380 标准 | Spring 扩展 |
| 分组校验 | 不支持 | 支持 |
| 嵌套校验 | 支持 | 不支持 |
| 用在 | 方法参数、字段 | 类、方法参数 |
| 推荐 | 嵌套校验用 | 分组校验用 |

### @NotNull vs @NotBlank vs @NotEmpty

| 注解 | null | 空串 | 空集合 | 适用类型 |
| --- | --- | --- | --- | --- |
| @NotNull | ❌ 不通过 | ✅ 通过 | ✅ 通过 | 任意 |
| @NotBlank | ❌ 不通过 | ❌ 不通过 | - | String |
| @NotEmpty | ❌ 不通过 | ❌ 不通过 | ❌ 不通过 | String/集合 |

### 前端校验 vs 后端校验

| 维度 | 前端校验 | 后端校验 |
| --- | --- | --- |
| 位置 | 浏览器 | 服务器 |
| 目的 | 用户体验 | 安全保障 |
| 可绕过 | 是(JS 可禁用) | 否 |
| 必须有 | 否 | ✅ 必须 |

### 手动校验 vs 注解校验

| 维度 | 手动 if/else | 注解校验 |
| --- | --- | --- |
| 代码量 | 多 | 少 |
| 可维护性 | 差 | 好 |
| 复用性 | 低 | 高 |
| 灵活度 | 高 | 中 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 校验不生效 | 忘了加 @Valid 或 @Validated | 参数前加 \`@Valid\` 或 \`@Validated\` |
| @NotBlank 对 Integer 无效 | @NotBlank 只适用于 String | 用 \`@NotNull\` 校验非 String 类型 |
| 分组校验不生效 | @Valid 不支持分组 | 用 \`@Validated(GroupName.class)\` |
| 嵌套对象没校验 | 没加 @Valid | 在嵌套字段加 \`@Valid\` |
| 校验失败返回 500 | 没全局异常处理 | 加 \`@ControllerAdvice\` 捕获 \`MethodArgumentNotValidException\` |
| message 显示英文 | 没配中文消息 | 在 message 里写中文或配 \`ValidationMessages_zh.properties\` |
| @Pattern 正则不生效 | Java 正则需双重转义 | 字符串中 \`\\\\d\` 表示正则 \`\\d\` |
| @RequestParam 校验不生效 | 类上没加 @Validated | 类上加 \`@Validated\` 才支持参数校验 |
`,
  },

  // =========================================================
  // jw-32:拦截器与异常处理
  // =========================================================
  {
    id: "jw-32",
    group: "Spring MVC Web",
    icon: "🛡️",
    title: "拦截器与异常处理",
    content: `# 拦截器与异常处理

## 概念解释

### 拦截器(Interceptor)

**拦截器(HandlerInterceptor)** 是 Spring MVC 提供的机制,在 Controller 方法执行前后插入自定义逻辑。它和 Servlet 的 Filter 类似,但更贴近 Spring MVC——拦截器能访问 Handler 信息(目标方法、参数),Filter 只能访问原始请求/响应。

### 拦截器三个回调

| 方法 | 执行时机 | 能否中断 | 典型用途 |
| --- | --- | --- | --- |
| \`preHandle\` | Controller 前 | 返回 false 则中断 | 登录校验、权限检查 |
| \`postHandle\` | Controller 后、视图渲染前 | 否 | 修改 ModelAndView |
| \`afterCompletion\` | 视图渲染后(即使异常也执行) | 否 | 资源清理、耗时统计 |

执行顺序:

\`\`\`
preHandle → Controller → postHandle → afterCompletion
\`\`\`

多个拦截器时,preHandle 按注册顺序执行,postHandle/afterCompletion 按逆序执行(类似栈)。

### 注册拦截器

在 Spring Boot 中,实现 \`WebMvcConfigurer\` 接口的 \`addInterceptors\` 方法注册:

\`\`\`java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LoginInterceptor())
                .addPathPatterns("/api/**")        // 拦截路径
                .excludePathPatterns("/api/login"); // 排除路径
    }
}
\`\`\`

### 全局异常处理

Controller 抛出异常后,如果没有 try-catch,异常会向上传播到 DispatcherServlet。Spring MVC 提供 \`@ControllerAdvice\` + \`@ExceptionHandler\` 统一捕获异常,返回标准错误响应:

\`\`\`java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    @ResponseBody
    public ErrorResponse handleBusiness(BusinessException e) {
        return new ErrorResponse(400, e.getMessage());
    }
}
\`\`\`

### @ControllerAdvice vs @RestControllerAdvice

- \`@ControllerAdvice\`:配合 \`@ExceptionHandler\` 使用,需配合 \`@ResponseBody\` 才返回 JSON。
- \`@RestControllerAdvice\`:\`@ControllerAdvice + @ResponseBody\`,所有方法返回值自动转 JSON。**REST API 首选。**

## 设计原理

### 1. 拦截器链模式

多个拦截器组成链,按顺序执行 preHandle,逆序执行 postHandle/afterCompletion。这种设计让横切逻辑(认证、日志、限流)以插件方式组合,不侵入 Controller。

### 2. 异常集中处理

Controller 不需要 try-catch 每个异常——把异常抛出去,由 \`@ControllerAdvice\` 统一处理。这让 Controller 只关注业务逻辑,异常处理逻辑集中在一处,避免每个 Controller 重复写相同的 try-catch。

### 3. 拦截器 vs Filter 分层

Filter 在 Servlet 容器层(DispatcherServlet 之前),拦截不到 Spring MVC 的 Handler 信息;拦截器在 Spring MVC 层(DispatcherServlet 之后),能拿到 Handler 方法、参数等。**认证、限流用拦截器(需要知道访问哪个方法);编码、CORS 用 Filter(在更外层)。**

### 4. 异常处理的优先级

\`@ExceptionHandler\` 按异常类型匹配,优先匹配最具体的异常类型。比如 \`NullPointerException\` 优先匹配 \`@ExceptionHandler(NullPointerException.class)\` 而非 \`@ExceptionHandler(Exception.class)\`。

## 使用场景

**场景一:登录拦截器**——preHandle 检查 session/token,未登录返回 401。

**场景二:权限校验拦截器**——preHandle 检查用户是否有访问该资源的权限。

**场景三:日志拦截器**——preHandle 记录请求开始时间,afterCompletion 计算耗时并记录。

**场景四:全局异常处理**——捕获 BusinessException 返回 400,捕获 Exception 返回 500,返回统一的错误 JSON 格式。

**场景五:限流拦截器**——preHandle 调用 Redis 计数,超限返回 429 Too Many Requests。

## 代码示例

### 登录拦截器

\`\`\`java
import org.springframework.web.servlet.HandlerInterceptor;
import jakarta.servlet.http.*;

public class LoginInterceptor implements HandlerInterceptor {

    // Controller 执行前:检查登录状态
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response,
                             Object handler) throws Exception {
        // 从请求头获取 token
        String token = request.getHeader("Authorization");
        if (token == null || token.isEmpty()) {
            response.setStatus(401);  // Unauthorized
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":401,\"message\":\"未登录\"}");
            return false;  // 返回 false 中断请求,不执行 Controller
        }
        // 校验 token 有效性
        if (!tokenService.isValid(token)) {
            response.setStatus(401);
            response.getWriter().write("{\"code\":401,\"message\":\"token 无效\"}");
            return false;
        }
        // token 有效,放行
        return true;
    }

    // Controller 执行后(视图渲染前)
    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response,
                           Object handler, ModelAndView modelAndView) throws Exception {
        // 可修改 modelAndView,REST API 通常不用
    }

    // 完成后(即使异常也执行)
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) throws Exception {
        // 资源清理,如清除 ThreadLocal
        UserContext.clear();
    }
}
\`\`\`

### 全局异常处理

\`\`\`java
import org.springframework.web.bind.annotation.*;

// 统一错误响应格式
public class ErrorResponse {
    private int code;
    private String message;
    private long timestamp;

    public ErrorResponse(int code, String message) {
        this.code = code;
        this.message = message;
        this.timestamp = System.currentTimeMillis();
    }

    // getter 省略
    public int getCode() { return code; }
    public String getMessage() { return message; }
    public long getTimestamp() { return timestamp; }
}

// 业务异常
public class BusinessException extends RuntimeException {
    private int code;
    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }
    public int getCode() { return code; }
}

// 资源不存在异常
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) { super(message); }
}

// 全局异常处理(@RestControllerAdvice = @ControllerAdvice + @ResponseBody)
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 处理业务异常 → 400
    @ExceptionHandler(BusinessException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleBusiness(BusinessException e) {
        return new ErrorResponse(e.getCode(), e.getMessage());
    }

    // 处理资源不存在 → 404
    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(NotFoundException e) {
        return new ErrorResponse(404, e.getMessage());
    }

    // 处理参数校验异常 → 400
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(err -> err.getField() + ": " + err.getDefaultMessage())
            .reduce((a, b) -> a + "; " + b)
            .orElse("参数校验失败");
        return new ErrorResponse(400, message);
    }

    // 处理所有未捕获异常 → 500(兜底)
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleAll(Exception e) {
        // 生产环境不暴露堆栈给用户
        return new ErrorResponse(500, "服务器内部错误");
    }
}
\`\`\`

### 注册拦截器

\`\`\`java
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final LoginInterceptor loginInterceptor;

    // 构造器注入(拦截器需要依赖时用注入而非 new)
    public WebConfig(LoginInterceptor loginInterceptor) {
        this.loginInterceptor = loginInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loginInterceptor)
                .addPathPatterns("/api/**")           // 拦截所有 /api/ 开头的请求
                .excludePathPatterns("/api/login",      // 登录接口不拦截
                                     "/api/register",   // 注册接口不拦截
                                     "/actuator/**");   // 监控端点不拦截
    }
}
\`\`\`

逐行说明:\`HandlerInterceptor\` 的 \`preHandle\` 返回 false 则中断请求,Controller 不执行;\`postHandle\` 在 Controller 后执行,可修改 ModelAndView;\`afterCompletion\` 即使异常也执行,适合清理 ThreadLocal;\`@RestControllerAdvice\` 全局捕获异常,按 \`@ExceptionHandler\` 的异常类型匹配;\`@ResponseStatus\` 指定 HTTP 状态码;最后一个 \`@ExceptionHandler(Exception.class)\` 兜底捕获所有未处理异常;\`addPathPatterns\` 指定拦截路径,\`excludePathPatterns\` 排除不需要拦截的路径。

## 对比分析

### 拦截器(Interceptor)vs 过滤器(Filter)

| 维度 | Filter | Interceptor |
| --- | --- | --- |
| 所属 | Servlet 规范 | Spring MVC |
| 执行时机 | DispatcherServlet 前后 | Controller 前后 |
| 能访问 Handler | 否 | 是 |
| 能拿到 Spring Bean | 需特殊处理 | 直接注入 |
| 典型用途 | 编码、CORS、安全头 | 登录校验、日志、限流 |
| 执行顺序 | 在 Interceptor 之前 | 在 Filter 之后 |

### @ControllerAdvice vs @RestControllerAdvice

| 维度 | @ControllerAdvice | @RestControllerAdvice |
| --- | --- | --- |
| 含 @ResponseBody | 否 | 是 |
| 返回值 | 视图名 | JSON |
| 适用 | 传统 MVC | REST API |
| 推荐 | 服务端渲染 | ✅ API 首选 |

### 异常处理方式对比

| 方式 | 位置 | 灵活度 | 推荐度 |
| --- | --- | --- | --- |
| try-catch 在 Controller | 每个 Controller | 高 | ❌ 重复 |
| @ExceptionHandler 在 Controller | 单个 Controller | 中 | 局部异常 |
| @ControllerAdvice 全局 | 全局 | 中 | ✅ 推荐 |
| @ResponseStatus 注解 | 异常类上 | 低 | 简单场景 |

### 多拦截器执行顺序对比

| 阶段 | 执行顺序 | 说明 |
| --- | --- | --- |
| preHandle | A → B → C | 按注册顺序 |
| Controller | - | 业务执行 |
| postHandle | C → B → A | 逆序 |
| afterCompletion | C → B → A | 逆序 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 拦截器不生效 | 没注册或路径不匹配 | 检查 \`addInterceptors\` 的 pathPatterns |
| 拦截器无法注入 Bean | 直接 new 了拦截器 | 在配置类用构造器注入拦截器实例 |
| 拦截静态资源 | pathPatterns 范围太大 | 用 excludePathPatterns 排除静态资源 |
| 异常处理返回 HTML | 用了 @ControllerAdvice 没 @ResponseBody | 改用 @RestControllerAdvice |
| 异常处理不生效 | @ExceptionHandler 类型不匹配 | 确保异常类型能匹配,或加兜底的 Exception.class |
| 500 异常暴露堆栈 | 兜底处理返回了 e.getMessage() | 生产环境返回通用错误信息,日志记录堆栈 |
| preHandle 中 response.getWriter() 后 Controller 仍执行 | 返回了 true | 必须返回 false 才中断 |
| ThreadLocal 内存泄漏 | afterCompletion 没清理 | 在 afterCompletion 调 \`ThreadLocal.remove()\` |
`,
  },
];
