// =============================================================
// Java Web 应用开发实战教程 —— 第十一批章节（RESTful API 设计组，共 4 章）
// 章节 41-44:RESTful 设计原则 / Spring MVC 构建 REST API /
//          内容协商与 HTTP 方法 / 文档化 (Swagger/OpenAPI)
// =============================================================

export const chapters = [
  // =============================================================
  // 第四十一章:RESTful 设计原则
  // =============================================================
  {
    id: "jw-41",
    group: "RESTful API 设计",
    icon: "📐",
    title: "RESTful 设计原则",
    content: `# RESTful 设计原则

## 概念解释

REST（Representational State Transfer，表述性状态转移）是 Roy Fielding 在 2000 年博士论文中提出的**架构风格**。注意是「风格」不是「协议」—— 它是一组设计约束，不是具体规范。理解这 6 大约束，才能写出真正的 RESTful API，而不是「写了 HTTP 接口就叫 REST」。

REST 的 6 大约束：1. **客户端-服务器**分离 UI 与数据存储；2. **无状态**每个请求自包含所有信息，服务器不保存会话状态，好处是可扩展、可靠性高；3. **可缓存**响应必须明确标识是否可缓存；4. **统一接口**包含资源标识（URI）、通过表述操作资源、自描述消息、HATEOAS 四个子约束；5. **分层系统**客户端不知道直接连的是服务器还是中间代理；6. **按需代码**（可选）服务器可临时下发可执行代码。

REST 的核心是「资源」。URI 标识资源，设计好坏直接决定 API 易用性。核心原则：用名词而非动词（\`/users\` 而非 \`/getUsers\`）、用复数（\`/users\` 而非 \`/user\`）、层级表达关系（\`/users/123/orders\` 表示用户 123 的订单）、查询参数表达非资源属性（过滤 \`/users?status=active\`、排序 \`/users?sort=-created_at\`、分页 \`/users?page=2&page_size=20\`）。

## 设计原理

每个 HTTP 方法都有明确语义，对应资源的不同操作。GET 获取资源（安全、幂等）、POST 创建资源（不安全、不幂等）、PUT 全量替换资源（不安全、幂等）、PATCH 部分更新（不安全）、DELETE 删除资源（不安全、幂等）。**安全**指不修改服务器状态，**幂等**指多次调用与一次调用效果相同。正确使用 HTTP 方法让 API 语义清晰、缓存友好。

状态码分 5 类：2xx 成功（200 OK、201 Created、204 No Content）、3xx 重定向、4xx 客户端错误（400 Bad Request、401 Unauthorized 未认证、403 Forbidden 无权限、404 Not Found、409 Conflict、422 Unprocessable Entity、429 Too Many Requests）、5xx 服务器错误。注意 \`401\` 与 \`403\` 区别：401 是「你是谁」未认证；403 是「我知道你是谁，但你不能干这个」已认证无权限。

HATEOAS（Hypermedia As The Engine Of Application State）是 REST 最高级特性：响应里带超链接，客户端通过链接驱动状态，而非硬编码 URL。好处是 API 演进时改了 URL 客户端不用改代码。实际项目严格 HATEOAS 用得少，但理解这个思想能写出更松耦合的 API。

## 使用场景

- 公开 API：第三方接入、移动端后端
- 微服务间通信：内部服务用 REST 互通
- 前后端分离：前端 Vue/React 调后端 REST API
- 移动应用后端：APP 调 REST
- 适合需要 HTTP 缓存的场景（GET 可缓存）
- 不适用：实时双向通信（用 WebSocket）、批量操作（用 gRPC）、复杂查询语言（用 GraphQL）

## 代码示例

下面是规范的 REST API 设计示例（请求响应结构）：

\`\`\`
GET    /api/v1/users                 获取用户列表（分页）
POST   /api/v1/users                 创建用户
GET    /api/v1/users/{id}            获取单个用户
PUT    /api/v1/users/{id}            全量更新用户
PATCH  /api/v1/users/{id}            部分更新用户
DELETE /api/v1/users/{id}            删除用户
GET    /api/v1/users/{id}/orders     用户的订单列表
\`\`\`

创建用户请求与响应：

\`\`\`
POST /api/v1/users HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOi...

{
  "username": "alice",
  "email": "alice@example.com",
  "age": 25
}
\`\`\`

成功响应（注意用 201 而非 200，带 Location 头）：

\`\`\`
HTTP/1.1 201 Created
Location: https://api.example.com/api/v1/users/123
Content-Type: application/json

{
  "id": 123,
  "username": "alice",
  "email": "alice@example.com",
  "created_at": "2026-07-01T10:00:00Z"
}
\`\`\`

校验失败响应（用 422 而非 400，区分语法错与业务错）：

\`\`\`
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "message": "Validation failed",
  "errors": [
    { "field": "username", "message": "用户名已存在" },
    { "field": "email", "message": "邮箱格式不正确" }
  ]
}
\`\`\`

分页列表响应（带分页元信息与链接）：

\`\`\`json
{
  "data": [
    { "id": 123, "username": "alice" },
    { "id": 124, "username": "bob" }
  ],
  "pagination": {
    "page": 2,
    "page_size": 20,
    "total": 87,
    "total_pages": 5
  },
  "links": {
    "self": "/api/v1/users?page=2&page_size=20",
    "next": "/api/v1/users?page=3&page_size=20",
    "prev": "/api/v1/users?page=1&page_size=20"
  }
}
\`\`\`

REST 与 RPC 风格对比：RPC 风格用 \`POST /getUser?id=123\`、\`POST /createUser\`（动词驱动）；REST 风格用 \`GET /users/123\`、\`POST /users\`（资源驱动），更简洁、语义清晰、缓存友好（GET 可缓存）。

## 对比分析

| 维度 | REST | RPC | GraphQL |
| --- | --- | --- | --- |
| 关注点 | 资源 | 动作 | 查询 |
| URL | 名词 | 动词 | 单端点 |
| 方法 | 标准 HTTP | 通常 POST | POST |
| 缓存 | HTTP 缓存 | 难 | 难 |
| 适用 | 通用 | 内部服务 | 复杂前端 |

| 维度 | 401 Unauthorized | 403 Forbidden |
| --- | --- | --- |
| 含义 | 未认证 | 已认证无权限 |
| 触发 | 没 token 或 token 无效 | token 有效但角色不够 |
| 解决 | 登录获取 token | 找管理员授权 |

| 维度 | 400 Bad Request | 422 Unprocessable Entity |
| --- | --- | --- |
| 含义 | 请求语法错 | 语法对但业务校验错 |
| 例 | JSON 解析失败 | 邮箱格式对但已注册 |
| 适用 | 协议层 | 应用层 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| URI 用动词 | 把 RPC 当 REST | 用名词资源 |
| GET 改数据 | 不安全、不幂等、可缓存被改 | GET 只读，改用 POST/PUT |
| 全返回 200 + code | 违背 HTTP 语义 | 用标准状态码 |
| 单数路径 | 不一致 | 统一复数 |
| 状态码乱用 | 401 当 403 用 | 401 未认证，403 无权限 |
| 没版本控制 | 改 API 砸老客户端 | URI 加 /v1/ |
| URI 太深 | /a/b/c/d/e 难维护 | 控制在 2-3 层 |
| 把过滤塞进路径 | /users/active/age/18 | 用查询参数 /users?status=active |
| POST 当 PUT 用 | POST 不幂等，重试出问题 | 更新用 PUT/PATCH |
`,
  },

  // =============================================================
  // 第四十二章:Spring MVC 构建 REST API
  // =============================================================
  {
    id: "jw-42",
    group: "RESTful API 设计",
    icon: "🌍",
    title: "Spring MVC 构建 REST API",
    content: `# Spring MVC 构建 REST API

## 概念解释

上一章讲了 REST 设计原则，本章用 Spring MVC 落地。Spring 提供了一整套注解和工具让 REST API 开发变得简洁。\`@RestController\` 是 \`@Controller\` + \`@ResponseBody\` 的组合注解：\`@Controller\` 标记为控制器并注册为 Bean，\`@ResponseBody\` 让方法返回值直接写入响应体而非视图名。返回的对象会被 \`HttpMessageConverter\`（默认 Jackson）序列化成 JSON。

\`@GetMapping\` / \`@PostMapping\` / \`@PutMapping\` / \`@DeleteMapping\` / \`@PatchMapping\` 是 \`@RequestMapping\` 的快捷方式，对应 HTTP 方法，写法简洁、意图清晰，是现代 Spring REST 的标配。

参数绑定注解：\`@PathVariable\` 从 URL 路径取变量（\`/users/{id}\` → id）、\`@RequestParam\` 取查询参数、\`@RequestBody\` 把请求体反序列化成 Java 对象（要求 \`Content-Type: application/json\`）、\`@RequestHeader\` 取请求头。\`@PathVariable\` 支持类型转换（String → Long、Integer）。

\`ResponseEntity<T>\` 让你完全控制响应：状态码、响应头、响应体。常用于创建资源返回 201 + Location 头（REST 规范要求创建返回 Location 指向新资源）。

## 设计原理

Spring MVC 的设计让控制器保持简洁：\`@RestController\` 默认所有方法都有 \`@ResponseBody\`，返回值自动序列化；\`@RequestMapping("/api/v1/users")\` 类级别基路径，方法路径相对它拼接；\`@PathVariable\` 名字默认与方法参数名一致（Spring Boot 3.x 编译时保留参数名），可重命名 \`@PathVariable("id") Long userId\`。

\`ServletUriComponentsBuilder.fromCurrentRequest()\` 基于当前请求构造 URI，避免硬编码 URL。配合 \`ResponseEntity.created(location)\` 返回 201 状态码 + Location 头，符合 REST 规范。

DTO 与实体分离是重要原则：API 输入输出用 DTO，不直接暴露实体。原因：避免字段泄露（如密码 hash）、避免恶意字段被自动绑定（如 id、role）、解耦数据库结构与 API 契约。更进一步，应拆分 Create DTO 和 Update DTO —— 创建要密码，更新不要密码，永远不要复用一个 DTO。

很多团队定义统一响应体 \`R<T>\`（含 code、message、data 字段），但这与 REST 规范有冲突：REST 要求用 HTTP 状态码表达结果。两种风格都可，团队统一即可。推荐：HTTP 状态码用对（200/201/204/4xx/5xx），业务错误在响应体里再加细节信息。

## 使用场景

- 公开 REST API：第三方对接
- 移动端后端：APP 调用
- 前后端分离项目：Vue/React 调后端
- 微服务内部 HTTP 通信
- 不适用：服务端渲染页面（用 @Controller + Thymeleaf）

## 代码示例

下面是完整的用户 REST 控制器：

\`\`\`java
@RestController                                 // REST 控制器，返回值自动序列化
@RequestMapping("/api/v1/users")                  // 类级别基路径
public class UserRestController {

    private final UserService userService;

    public UserRestController(UserService userService) {  // 构造注入
        this.userService = userService;
    }

    // GET /api/v1/users?page=0&size=20&status=active&sort=-createdAt
    @GetMapping
    public PageResponse<UserDto> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "-createdAt") String sort) {

        Sort sortOrder = Sort.by(sort.replace("-", "").split(","));
        if (sort.startsWith("-")) {
            sortOrder = sortOrder.descending();
        }

        PageRequest pageable = PageRequest.of(page, size, sortOrder);
        Page<UserDto> result = userService.list(status, pageable);
        return PageResponse.of(result);
    }

    // GET /api/v1/users/{id}
    @GetMapping("/{id}")
    public UserDto getById(@PathVariable Long id) {
        UserDto user = userService.findById(id);
        if (user == null) {
            throw new ResourceNotFoundException("User " + id + " not found");
        }
        return user;
    }

    // POST /api/v1/users
    @PostMapping
    public ResponseEntity<UserDto> create(@Valid @RequestBody UserCreateDto dto) {
        UserDto saved = userService.create(dto);

        // 构造 Location 头指向新资源
        URI location = ServletUriComponentsBuilder
            .fromCurrentRequest()                  // /api/v1/users
            .path("/{id}")
            .buildAndExpand(saved.getId())          // 填充 id
            .toUri();

        return ResponseEntity
            .created(location)                      // 201 Created + Location 头
            .body(saved);                           // 响应体
    }

    // PUT /api/v1/users/{id} 全量更新
    @PutMapping("/{id}")
    public UserDto update(@PathVariable Long id,
                          @Valid @RequestBody UserUpdateDto dto) {
        return userService.update(id, dto);
    }

    // DELETE /api/v1/users/{id}
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)          // 204
    public void delete(@PathVariable Long id) {
        userService.delete(id);
    }

    // 嵌套资源：GET /api/v1/users/{id}/orders
    @GetMapping("/{id}/orders")
    public List<OrderDto> userOrders(@PathVariable Long id) {
        return userService.findOrders(id);
    }
}
\`\`\`

DTO 拆分示例（Create 与 Update 分离）：

\`\`\`java
public class UserCreateDto {
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 6)
    private String password;        // 创建要密码
}

public class UserUpdateDto {
    @Email
    private String email;
    private Boolean active;
    // 注意：没有 username、password，更新不允许改这两个
}
\`\`\`

逐行解析：\`@RestController\` 所有方法返回值序列化；\`@RequestParam(defaultValue = "0")\` 查询参数带默认值；\`@RequestParam(required = false)\` 可选参数；\`@PathVariable Long id\` 从路径取值并转 Long；\`throw new ResourceNotFoundException(...)\` 抛业务异常由全局异常处理器转 404；\`@Valid @RequestBody\` 反序列化并触发校验；\`ServletUriComponentsBuilder.fromCurrentRequest()\` 避免硬编码 URL；\`ResponseEntity.created(location)\` 201 + Location 头；\`@ResponseStatus(HttpStatus.NO_CONTENT)\` 删除返回 204；\`@GetMapping("/{id}/orders")\` 嵌套资源表达「用户 123 的订单」。

## 对比分析

| 维度 | @Controller | @RestController |
| --- | --- | --- |
| 返回值 | 视图名 | 响应体（序列化） |
| 用途 | SSR | REST API |
| @ResponseBody | 需手动加 | 默认有 |

| 维度 | 直接返回对象 | ResponseEntity |
| --- | --- | --- |
| 状态码 | 默认 200 | 自定义 |
| 响应头 | 不能设 | 能设 |
| 适用 | 普通查询 | 创建/带 Location |

| 维度 | 统一响应体 R<T> | 直接返回对象 |
| --- | --- | --- |
| 一致性 | 高 | 低 |
| REST 语义 | 弱化（200 + code） | 强（用 HTTP 状态码） |
| 前端处理 | 统一解析 | 直接用 |
| 推荐 | 后台管理系统 | 标准公开 API |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 用 @Controller 忘 @ResponseBody | 返回当视图名 | 用 @RestController |
| 创建返回 200 而非 201 | 不符合规范 | ResponseEntity.created() |
| 直接暴露实体 | 字段泄露、耦合 | 用 DTO |
| 复用一个 DTO 做增改 | 字段被意外绑定 | 拆分 Create/Update DTO |
| @PathVariable 类型转换失败 | id 不是数字 | 抛异常或加校验 |
| @RequestBody 没校验 | 恶意数据入库 | 加 @Valid |
| 嵌套资源层级太深 | URL 难维护 | 控制在 2-3 层 |
| GET 改数据 | 不安全不可缓存 | GET 只读 |
| 删除返回 200 + 空 body | 浪费带宽 | 返回 204 No Content |
`,
  },

  // =============================================================
  // 第四十三章:内容协商与 HTTP 方法
  // =============================================================
  {
    id: "jw-43",
    group: "RESTful API 设计",
    icon: "🔄",
    title: "内容协商与 HTTP 方法",
    content: `# 内容协商与 HTTP 方法

## 概念解释

同一个资源（如 \`/users/123\`）可以用多种格式表述：JSON、XML、HTML。客户端通过 \`Accept\` 头说自己想要什么，服务器根据请求决定返回什么格式 —— 这就是**内容协商**（Content Negotiation）。

HTTP 内容协商基于两个头部：\`Accept\` 客户端期望的响应格式（响应方向，如 \`Accept: application/json\`）、\`Content-Type\` 客户端发送的请求体格式（请求方向，如 \`Content-Type: application/json\`）。服务器根据这些头部选择合适的「转换器」把 Java 对象与文本格式互转。

\`HttpMessageConverter\` 接口负责 Java 对象与 HTTP 消息体的双向转换。Spring 内置多个转换器：\`MappingJackson2HttpMessageConverter\`（JSON，默认主流）、\`MappingJackson2XmlHttpMessageConverter\`（XML，需加依赖）、\`StringHttpMessageConverter\`（text/plain）、\`FormHttpMessageConverter\`（表单）、\`ByteArrayHttpMessageConverter\`（二进制）。Spring Boot 自动配置这些，Jackson 默认生效。

CORS（跨域资源共享）是浏览器的同源策略限制：JS 默认只能请求同源（同协议+域名+端口）的 API。跨域请求要服务器允许，Spring 提供方法级 \`@CrossOrigin\` 和全局 \`WebMvcConfigurer.addCorsMappings\` 两种配置方式。

## 设计原理

内容协商的设计让「一个资源，多种表述」成为可能，符合 REST 的统一接口约束。Spring 根据 \`Accept\` 头自动选择转换器：如果引入了 \`jackson-dataformat-xml\` 依赖，\`Accept: application/xml\` 就返回 XML，\`Accept: application/json\` 返回 JSON，无需写多个方法。

\`produces\` 和 \`consumes\` 属性限制方法处理的格式：\`produces = "application/json"\` 只产出 JSON；\`consumes = "application/json"\` 只接受 JSON 请求体。实际项目大多不写 \`produces\`，让 Spring 按 Accept 头自动协商。

自定义 \`HttpMessageConverter\` 需要继承 \`AbstractHttpMessageConverter\` 并在 \`WebMvcConfigurer.extendMessageConverters\` 注册。注意用 \`extendMessageConverters\`（追加）而非 \`configureMessageConverters\`（覆盖默认列表），否则会丢失默认转换器。

CORS 预检请求：复杂请求（如带自定义头、PUT/DELETE）浏览器先发 \`OPTIONS\` 探测服务器是否允许，服务器响应 CORS 头。Spring 自动处理 \`OPTIONS\`。\`allowCredentials(true)\` 允许带 cookie 时，不能用 \`allowedOrigins("*")\`，要用具体域名或 \`allowedOriginPatterns\`。

## 使用场景

- 多格式 API：JSON + XML 同时支持
- 第三方对接：某些系统只认 XML
- 文件上传：multipart 格式
- 跨域前端：Vue/React 调后端需 CORS
- 移动端：JSON 是默认
- 不适用：SSR 同源应用（不需要 CORS）

## 代码示例

下面是完整的内容协商 + CORS 配置：

\`\`\`java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    // ===== 跨域 CORS 全局配置 =====
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "https://www.example.com",
                    "https://admin.example.com"
                )
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Location", "X-Total-Count")    // 暴露给前端的响应头
                .allowCredentials(true)                          // 允许带 cookie
                .maxAge(3600);                                    // 预检缓存 1 小时

        // 公开 API 允许任意源
        registry.addMapping("/public/**")
                .allowedOrigins("*")
                .allowedMethods("GET");
    }

    // ===== 内容协商配置 =====
    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer
            .defaultContentType(MediaType.APPLICATION_JSON)   // 默认 JSON
            .mediaType("json", MediaType.APPLICATION_JSON)
            .mediaType("xml", MediaType.APPLICATION_XML);
    }

    // ===== 自定义消息转换器 =====
    @Override
    public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
        // 用 extend 而非 configure，避免覆盖默认转换器
        // converters.add(0, new CsvHttpMessageConverter());  // 自定义转换器加最前
    }
}
\`\`\`

控制器按 Accept 自动返回格式：

\`\`\`java
@RestController
@RequestMapping("/api/v1/users")
public class UserRestController {

    @GetMapping(value = "/{id}")   // 不写 produces，让 Spring 按 Accept 头选
    public User getUser(@PathVariable Long id) {
        return userService.findById(id);
        // Accept: application/json → 返回 JSON
        // Accept: application/xml  → 返回 XML（需引入 jackson-dataformat-xml）
    }

    // 限定只接受 JSON 请求体
    @PostMapping(consumes = "application/json")
    public ResponseEntity<User> create(@Valid @RequestBody UserCreateDto dto) {
        User saved = userService.create(dto);
        return ResponseEntity.created(URI.create("/api/v1/users/" + saved.getId()))
                             .body(saved);
    }

    // 方法级 CORS 覆盖全局
    @CrossOrigin(origins = "https://special.example.com",
                 allowedHeaders = "X-Custom-Header")
    @GetMapping("/special/{id}")
    public User getSpecial(@PathVariable Long id) {
        return userService.findById(id);
    }
}
\`\`\`

application.properties 配置：

\`\`\`properties
# Jackson 配置
spring.jackson.date-format=yyyy-MM-dd HH:mm:ss
spring.jackson.time-zone=GMT+8
spring.jackson.default-property-inclusion=non_null          # 忽略 null 字段
spring.jackson.serialization.write-dates-as-timestamps=false # 日期用 ISO 字符串
\`\`\`

逐行解析：\`allowedOrigins\` 收紧白名单，不用 \`*\`；\`exposedHeaders\` 默认浏览器只能读基本响应头，自定义头要暴露；\`allowCredentials(true)\` 开了就不能 \`allowedOrigins("*")\`；\`maxAge(3600)\` 预检结果缓存 1 小时减少 OPTIONS；\`extendMessageConverters\` 追加而非覆盖；不写 \`produces\` 让 Spring 按 Accept 自动协商；\`consumes\` 限定接受的请求体格式；\`default-property-inclusion=non_null\` 减少响应体积。

## 对比分析

| 维度 | URL 后缀协商 | Accept 头协商 | 查询参数协商 |
| --- | --- | --- | --- |
| 形式 | /users.json | Accept 头 | /users?format=json |
| 优点 | 直观 | 标准 | 简单 |
| 缺点 | 路径污染 | 客户端要会设头 | 不标准 |
| 推荐 | 否 | 是 | 兼容老客户端 |

| 维度 | 全局 CORS | 方法级 @CrossOrigin |
| --- | --- | --- |
| 范围 | 全部 /api/** | 单个方法 |
| 灵活 | 中 | 高 |
| 适用 | 通用 | 局部特殊 |

| 维度 | configureMessageConverters | extendMessageConverters |
| --- | --- | --- |
| 行为 | 覆盖默认列表 | 追加到默认列表 |
| 默认转换器 | 丢失 | 保留 |
| 推荐 | 极少 | 常用 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| allowedOrigins("*") + allowCredentials(true) | 浏览器拒绝 | 用具体域名或 allowedOriginPatterns |
| 忘了 exposedHeaders | 前端读不到自定义头 | 暴露需要的头 |
| 用 configureMessageConverters | 默认转换器全没 | 用 extendMessageConverters |
| 自定义转换器没注册 | 不生效 | 加到 WebMvcConfigurer |
| 默认返回时间戳 | 不可读 | 配 write-dates-as-timestamps=false |
| 序列化包含 null 字段 | 响应体积大 | default-property-inclusion=non_null |
| produces 限制太严 | 客户端 Accept 不匹配 406 | 大多不写 produces 让 Spring 协商 |
| CORS 预检失败 | 缺方法或缺头 | 配齐 allowedMethods/allowedHeaders |
| Content-Type 不对 | 反序列化失败 | 客户端正确设 Content-Type |
`,
  },

  // =============================================================
  // 第四十四章:文档化 (Swagger/OpenAPI)
  // =============================================================
  {
    id: "jw-44",
    group: "RESTful API 设计",
    icon: "📖",
    title: "文档化 (Swagger/OpenAPI)",
    content: `# 文档化 (Swagger/OpenAPI)

## 概念解释

OpenAPI（前身 Swagger）是 API 描述规范：用 YAML/JSON 描述 API 的端点、参数、响应、模型，机器可读。配套工具能生成交互式文档页面，前端可在线试 API。文档化让 API 易用、可维护，是工程化的基础。

Spring Boot 项目用 \`springdoc-openapi\`（替代已停更的 \`springfox\`）自动生成 OpenAPI 文档。引入依赖后，\`springdoc\` 自动扫描 \`@RestController\` 生成文档，无需写代码。访问 \`http://localhost:8080/v3/api-docs\` 获取 OpenAPI JSON，访问 \`http://localhost:8080/swagger-ui.html\` 获取交互式 UI。

API 版本控制让新版本与旧版本共存，给客户端迁移时间。主流有三种方式：URI 版本（\`/api/v1/users\`，最常见、直观可见）、自定义请求头（\`X-API-Version: 2\`，URI 干净但不可见）、Accept 头媒体类型（\`Accept: application/vnd.example.v2+json\`，REST 原教旨主义推崇但极不直观）。实际项目首选 URI 版本。

OpenAPI 注解丰富文档：\`@Operation\`（方法摘要与说明）、\`@Parameter\`（参数说明与示例）、\`@ApiResponses\`（响应码说明）、\`@Schema\`（DTO 字段描述）、\`@Tag\`（控制器分组）。注解让文档跟代码走，避免手写文档过期。

## 设计原理

\`springdoc\` 的设计理念是「代码即文档」：自动扫描控制器，根据 \`@RequestMapping\`、方法签名、返回类型、JSR303 校验注解自动生成 OpenAPI schema。开发者只需用注解补充人类可读的描述、示例值，文档就完整了。

版本控制的设计权衡：URI 版本破坏了「资源 URI 永久不变」的 REST 理想，但工程上最实用（可见、可调试、缓存友好）。Accept 头版本最符合 REST 语义但极不直观。实际项目选 URI 版本，配合 \`@Deprecated(since = "2.0")\` 标记旧版本废弃，加 \`Deprecation\`/\`Sunset\` 响应头让客户端程序化检测废弃并主动迁移。

版本控制实现：每个版本一个 controller，路径前缀不同（\`/api/v1/users\` vs \`/api/v2/users\`），分别在不同包（\`api.v1\` / \`api.v2\`）。v1 v2 共用 Service，但 DTO 拆分（\`UserV1Dto\` / \`UserV2Dto\`）避免字段冲突。

## 使用场景

- 公开 API：第三方接入必须有文档
- 移动端后端：APP 多版本共存
- 内部微服务：服务间 API 演进
- 开发期调试：swagger-ui 直接试 API
- 前后端协作：前端看文档联调
- 不适用：一次性脚本、内部紧耦合系统

## 代码示例

下面是完整的版本控制 + 文档配置：

\`\`\`java
// 全局 OpenAPI 元信息
@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("我的网站 API")
                .version("1.0")
                .description("用户、订单管理 RESTful API 文档")
                .contact(new Contact()
                    .name("API Support")
                    .email("api@example.com"))
                .license(new License()
                    .name("Apache 2.0")))
            .servers(List.of(
                new Server().url("https://api.example.com").description("生产"),
                new Server().url("http://localhost:8080").description("本地")
            ));
    }
}
\`\`\`

DTO 加 Schema 注解：

\`\`\`java
@Schema(description = "用户信息")
public class UserDto {

    @Schema(description = "用户 ID", example = "123")
    private Long id;

    @Schema(description = "用户名", example = "alice", minLength = 3, maxLength = 20)
    private String username;

    @Schema(description = "邮箱", example = "alice@example.com")
    private String email;

    @Schema(description = "是否激活", example = "true")
    private Boolean active;
}
\`\`\`

v1 控制器（带文档注解 + 标记废弃）：

\`\`\`java
@Tag(name = "用户管理", description = "用户的增删改查 API")
@RestController
@RequestMapping("/api/v1/users")
@Deprecated(since = "2.0", forRemoval = false)   // 标记 v1 整体废弃
public class UserV1Controller {

    private final UserService userService;

    public UserV1Controller(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "获取用户", description = "根据 ID 查询用户详情")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "成功",
            content = @Content(schema = @Schema(implementation = UserDto.class))),
        @ApiResponse(responseCode = "404", description = "用户不存在"),
        @ApiResponse(responseCode = "401", description = "未认证")
    })
    @GetMapping("/{id}")
    public UserDto getUser(
        @Parameter(description = "用户 ID", required = true, example = "123")
        @PathVariable Long id
    ) {
        return userService.findById(id);
    }

    @Operation(summary = "创建用户", description = "注册新用户")
    @ApiResponse(responseCode = "201", description = "创建成功",
        headers = @Header(name = "Location", description = "新资源 URI"))
    @PostMapping
    public ResponseEntity<UserDto> create(@Valid @RequestBody UserCreateDto dto) {
        UserDto saved = userService.create(dto);
        return ResponseEntity
            .created(URI.create("/api/v1/users/" + saved.getId()))
            .body(saved);
    }
}
\`\`\`

v2 控制器（新版本，返回字段更丰富）：

\`\`\`java
@Tag(name = "用户管理 v2", description = "新增 profile 字段")
@RestController
@RequestMapping("/api/v2/users")
public class UserV2Controller {

    private final UserService userService;

    public UserV2Controller(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "获取用户（v2）", description = "返回包含 profile 的完整信息")
    @GetMapping("/{id}")
    public UserV2Dto getUser(@PathVariable Long id) {
        return userService.findV2ById(id);
    }
}
\`\`\`

application.properties 配置：

\`\`\`properties
# OpenAPI 文档
springdoc.api-docs.path=/v3/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.swagger-ui.operationsSorter=alpha
springdoc.packages-to-scan=com.example.api
springdoc.paths-to-match=/api/**

# 生产环境关闭 swagger-ui（用 profile）
# springdoc.swagger-ui.enabled=false
\`\`\`

逐行解析：\`@Tag\` 控制器分组，swagger-ui 按标签归类接口；\`@Deprecated(since = "2.0")\` 标记废弃，文档显示删除线提示前端迁移；\`@Operation(summary, description)\` 方法级摘要；\`@ApiResponses\` 列出可能的响应码；\`@Content(schema = @Schema(implementation = UserDto.class))\` 指定响应体模型；\`@Parameter(description, required, example)\` 参数说明与示例值；\`@Schema(description, example)\` 字段级文档；\`@Bean OpenAPI\` 全局元信息；v1 v2 控制器分别在不同包，路径前缀不同，共存。

## 对比分析

| 维度 | URI 版本 | 请求头版本 | Accept 头版本 |
| --- | --- | --- | --- |
| 形式 | /v1/users | X-API-Version: 1 | Accept: application/vnd.x.v1+json |
| 可见性 | 高 | 低 | 低 |
| 调试 | 简单 | 麻烦 | 麻烦 |
| 缓存 | 友好 | 可能冲突 | 可能冲突 |
| 实际采用 | 最多 | 少 | 少 |

| 维度 | springdoc | springfox |
| --- | --- | --- |
| 维护 | 活跃 | 已停更 |
| Spring Boot 3 | 支持 | 不支持 |
| OpenAPI 3 | 原生 | 旧版 Swagger 2 |
| 推荐 | 是 | 否 |

| 维度 | 代码内注解 | 外部 YAML |
| --- | --- | --- |
| 维护 | 跟代码走 | 易过期 |
| 同步 | 自动 | 手动 |
| 推荐 | 是 | 极少 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 用 springfox | 已停更，不支持 Boot 3 | 改 springdoc |
| 文档与代码不一致 | 手写文档 | 用注解自动生成 |
| 生产暴露 swagger-ui | API 结构泄露 | profile 关闭 |
| 版本太频繁 | 小改动也升版本 | 向后兼容加字段，大改才升 |
| 旧版本无废弃提示 | 客户端不知要迁 | 加 Deprecation/Sunset 头 |
| @Deprecated 不写 since | 不知何时废弃 | 写 since 与 forRemoval |
| v1 v2 共用 DTO | 字段冲突 | 拆 V1Dto V2Dto |
| 控制器包名一样 | 类名冲突 | 拆 api.v1 api.v2 包 |
| 没配 paths-to-match | 文档包含无关接口 | 限定扫描包和路径 |
| example 与实际不符 | 误导前端 | 注解 example 用真实数据 |
`,
  },
];
