// =============================================================
// Java Web 应用开发实战教程 —— 第十六批章节（实战项目组，共 4 章）
// 章节 61-64:项目实战博客系统需求与架构 / 用户模块与认证授权 /
//          文章 CRUD 与分页查询 / 总结与进阶学习路线
// =============================================================

export const chapters = [
  // =============================================================
  // 第六十一章:项目实战:博客系统需求与架构
  // =============================================================
  {
    id: "jw-61",
    group: "实战项目",
    icon: "📋",
    title: "项目实战:博客系统需求与架构",
    content: `# 项目实战:博客系统需求与架构

## 概念解释

学完前面所有章节后，用一个**博客系统**把知识串起来。博客系统麻雀虽小五脏俱全：用户认证、文章 CRUD、分页查询、评论、标签、缓存、部署——覆盖了 Java Web 开发的核心技能点。本章先做需求分析与架构设计。

### 功能需求

一个博客系统包含以下核心功能：

**用户模块**：
- 注册、登录、登出
- 个人资料查看与编辑
- 密码重置

**文章模块**：
- 发布、编辑、删除文章（支持 Markdown）
- 文章列表分页查询
- 文章详情页（含渲染后的 HTML）
- 按标签筛选、按时间归档

**评论模块**：
- 文章评论、回复评论（树形结构）
- 评论分页

**其他**：
- 文章标签
- 文章草稿与发布状态
- 简单的访问统计

### 非功能需求

- **性能**：文章列表 P99 < 200ms，详情页 P99 < 100ms（走缓存）
- **可用性**：单实例部署，后续可横向扩展
- **安全**：密码加密存储、JWT 鉴权、SQL 注入防护、XSS 防护
- **可维护性**：分层清晰、有单元测试、配置外部化

### 技术选型

| 层 | 技术 | 理由 |
| --- | --- | --- |
| 后端框架 | Spring Boot 3 | 主流，生态完善 |
| 持久层 | Spring Data JPA + MySQL | 开发效率高，SQL 透明 |
| 数据库 | MySQL 8 | 关系型存储文章、用户 |
| 缓存 | Redis | 文章详情缓存、会话 |
| 鉴权 | Spring Security + JWT | 无状态，适合前后端分离 |
| API 文档 | SpringDoc OpenAPI 3 | 自动生成 Swagger 文档 |
| 构建 | Maven | 标准化 |
| 部署 | Docker + docker-compose | 容器化，一键启动 |

## 设计原理

### 原理一：分层架构

经典三层架构，职责分离：
- **Controller 层**：接收 HTTP 请求，参数校验，调用 Service，返回响应。不写业务逻辑。
- **Service 层**：业务逻辑。事务边界在这层。
- **Repository 层**：数据访问，JPA Repository 接口。

层与层之间用 DTO 传输数据，避免实体直接暴露给前端。

### 原理二：数据库设计

核心表：用户、文章、标签、评论。关系：

- 用户 → 文章（一对多）
- 文章 ↔ 标签（多对多，中间表 article_tag）
- 文章 → 评论（一对多）
- 评论 → 评论（自关联，树形回复）

### 原理三：前后端分离

后端只提供 RESTful API，前端独立部署（Vue/React）。好处：前后端并行开发、后端可被多端复用（Web/App/小程序）、部署独立。

### 原理四：配置外部化

数据库密码、Redis 地址等敏感配置通过环境变量注入，不写死在代码里。同一份 jar 跑 dev/test/prod。

### 原理五：缓存策略

文章详情读多写少，适合缓存。策略：首次查询从 DB 读，写入 Redis；后续查询先查 Redis，未命中再查 DB。更新文章时删除缓存（Cache Aside 模式）。

## 使用场景

**适合场景**：个人技术博客、团队知识库、小型 CMS 改造、教学演示项目。

**不适合场景**：超大规模多租户 SaaS（需微服务）、强富文本编辑（需专业编辑器集成）、电商等内容驱动型业务。

## 代码示例

### 项目结构

\`\`\`
blog-system/
├── src/main/java/com/example/blog/
│   ├── BlogApplication.java          # 启动类
│   ├── config/                       # 配置类
│   │   ├── SecurityConfig.java       # Spring Security
│   │   ├── RedisConfig.java          # Redis 配置
│   │   └── OpenApiConfig.java         # Swagger 文档
│   ├── controller/                   # 控制器
│   │   ├── AuthController.java       # 认证
│   │   ├── ArticleController.java     # 文章
│   │   └── CommentController.java     # 评论
│   ├── service/                      # 业务层
│   │   ├── impl/                     # 实现类
│   │   └── *Service.java             # 接口
│   ├── repository/                   # 数据访问
│   │   ├── UserRepository.java
│   │   ├── ArticleRepository.java
│   │   └── CommentRepository.java
│   ├── entity/                       # JPA 实体
│   │   ├── User.java
│   │   ├── Article.java
│   │   ├── Tag.java
│   │   └── Comment.java
│   ├── dto/                          # 数据传输对象
│   │   ├── request/                  # 请求 DTO
│   │   └── response/                 # 响应 DTO
│   ├── security/                     # 安全
│   │   ├── JwtTokenProvider.java     # Token 生成
│   │   └── JwtAuthenticationFilter.java # JWT 过滤器
│   └── exception/                    # 异常处理
│       └── GlobalExceptionHandler.java
├── src/main/resources/
│   ├── application.yml               # 主配置
│   ├── application-dev.yml           # 开发环境
│   ├── application-prod.yml          # 生产环境
│   └── db/migration/                 # 数据库迁移脚本
├── Dockerfile                        # 容器化
├── docker-compose.yml                # 编排
└── pom.xml                           # 依赖
\`\`\`

### 数据库表设计

\`\`\`sql
-- 用户表
CREATE TABLE user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(100) NOT NULL,   -- BCrypt 加密
    nickname VARCHAR(50),
    avatar VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 文章表
CREATE TABLE article (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    author_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    summary VARCHAR(500),                  -- 摘要
    content_md TEXT NOT NULL,              -- Markdown 原文
    content_html TEXT,                      -- 渲染后 HTML
    status TINYINT DEFAULT 0,              -- 0 草稿 1 发布
    view_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_author(author_id),
    INDEX idx_status_created(status, created_at)
);

-- 标签表
CREATE TABLE tag (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- 文章-标签关联表（多对多）
CREATE TABLE article_tag (
    article_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    PRIMARY KEY(article_id, tag_id)
);

-- 评论表（自关联支持树形回复）
CREATE TABLE comment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    article_id BIGINT NOT NULL,
    parent_id BIGINT,                       -- 父评论 ID，顶级评论为 NULL
    author_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_article(article_id),
    INDEX idx_parent(parent_id)
);
\`\`\`

### pom.xml 核心依赖

\`\`\`xml
<dependencies>
    <!-- Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <!-- JPA + MySQL -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
    </dependency>
    <!-- Redis 缓存 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>
    <!-- Security + JWT -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.3</version>
    </dependency>
    <!-- 参数校验 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <!-- API 文档 -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.3.0</version>
    </dependency>
    <!-- Markdown 渲染 -->
    <dependency>
        <groupId>org.commonmark</groupId>
        <artifactId>commonmark</artifactId>
        <version>0.21.0</version>
    </dependency>
</dependencies>
\`\`\`

### application.yml 多环境配置

\`\`\`yaml
# application.yml 默认配置
server:
  port: 8080
spring:
  application:
    name: blog-system
  jpa:
    hibernate:
      ddl-auto: validate       # 用 Flyway 管理表结构
    properties:
      hibernate:
        format_sql: true
  cache:
    type: redis

---
# application-dev.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/blog?useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: root
  redis:
    host: localhost
    port: 6379
logging:
  level:
    org.hibernate.SQL: DEBUG    # 开发期打印 SQL

---
# application-prod.yml
spring:
  datasource:
    url: \${DB_URL}
    username: \${DB_USER}
    password: \${DB_PASSWORD}
  redis:
    host: \${REDIS_HOST}
    port: 6379
    password: \${REDIS_PASSWORD}
logging:
  level:
    root: INFO
\`\`\`

关键点：分层架构 Controller→Service→Repository；多对多用中间表 \`article_tag\`；评论自关联 \`parent_id\` 支持树形；\`content_md\` 存原文 \`content_html\` 存渲染结果（避免每次渲染）；配置分 dev/prod 用环境变量注入。

## 对比分析

| 维度 | 单体博客（本项目） | 微服务博客 | WordPress | Hexo |
| --- | --- | --- | --- | --- |
| 架构 | 单体 | 微服务 | 单体（PHP） | 静态生成 |
| 后端语言 | Java | Java | PHP | Node.js |
| 数据库 | MySQL | 多数据库 | MySQL | 无 |
| 部署 | 一个 jar | 多容器 + K8s | PHP 主机 | 静态托管 |
| 开发复杂度 | 中 | 高 | 低（开箱即用） | 低 |
| 可定制性 | 高 | 极高 | 中（插件） | 中（主题） |
| 适合 | 学习/个人博客 | 大型平台 | 非技术用户 | 技术博客 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 文章内容存 HTML 导致 XSS | 直接渲染用户输入 | 用 Markdown 转义 + XSS 过滤库 |
| 分页深翻慢 | offset 分页深翻扫描多行 | 用游标分页（基于 id/created_at） |
| 评论树查询 N+1 | 每条评论查子评论 | 一次查全部，内存里组装树 |
| 缓存与 DB 不一致 | 更新后没删缓存 | Cache Aside：先更新 DB 再删缓存 |
| 密码明文存储 | 直接存密码 | BCrypt 加密，每次加随机盐 |
| 文章 ID 暴露用户数 | 自增 ID 可推算用户量 | 用雪花 ID 或 UUID |
| 配置硬编码 | 密码写死在代码 | 环境变量 + application-{env}.yml |
| 事务边界不对 | Controller 里调多个 Service 无事务 | 事务放 Service 层，@Transactional 标注 |
`
  },
  // =============================================================
  // 第六十二章:用户模块与认证授权
  // =============================================================
  {
    id: "jw-62",
    group: "实战项目",
    icon: "👤",
    title: "用户模块与认证授权",
    content: `# 用户模块与认证授权

## 概念解释

用户模块是博客系统的基础。涉及注册、登录、鉴权三个核心流程。本项目用 **Spring Security + JWT** 实现无状态认证，适合前后端分离架构。

### 认证 vs 授权

- **认证（Authentication）**：验证"你是谁"。登录时校验账号密码，确认身份。
- **授权（Authorization）**：验证"你能做什么"。已登录用户能否编辑别人的文章？管理员能否删除任意文章？

Spring Security 的 \`AuthenticationManager\` 管认证，\`FilterSecurityInterceptor\` / \`AuthorizationManager\` 管授权。

### JWT（JSON Web Token）

JWT 是一种无状态的 Token 格式，由三部分组成：\`Header.Payload.Signature\`。

- **Header**：算法类型（HS256 等）+ 类型（JWT）。
- **Payload**：声明（claims），如 \`sub\`（用户ID）、\`exp\`（过期时间）、\`role\`（角色）。
- **Signature**：用密钥对 Header + Payload 签名，防篡改。

服务器签发 JWT 给客户端，客户端每次请求带在 \`Authorization: Bearer <token>\` 头里。服务器验签即可确认身份，**不需要存 Session**，天然适合分布式。

### 密码加密

绝不能明文存密码。用 **BCrypt**：每次加密加随机盐，同一密码两次加密结果不同，防彩虹表攻击。Spring Security 内置 \`BCryptPasswordEncoder\`。

## 设计原理

### 原理一：无状态认证

传统 Session 把用户状态存服务器内存，多实例时要共享 Session（粘性会话或 Redis Session）。JWT 把状态放 Token 里，服务器只验签不存储，天然支持多实例横向扩展。

### 原理二：过滤器链鉴权

Spring Security 用过滤器链处理请求。我们自定义 \`JwtAuthenticationFilter\`，在 UsernamePasswordAuthenticationFilter 之前执行：解析 Token → 验签 → 构造 Authentication 放入 SecurityContext。后续过滤器看到已认证即放行。

### 原理三：Access Token + Refresh Token

Access Token 短期（如 2 小时），Refresh Token 长期（如 7 天）。Access Token 过期后用 Refresh Token 换新的，避免用户频繁登录。Refresh Token 存 Redis 可主动失效（登出时删除）。

### 原理四：RBAC 权限模型

Role-Based Access Control：用户→角色→权限。博客系统简单角色：USER（普通用户）、ADMIN（管理员）。ADMIN 能删除任意文章、封禁用户。用 \`@PreAuthorize("hasRole('ADMIN')")\` 注解控制方法访问。

### 原理五：密码重置用一次性 Token

忘记密码时：生成随机 Token 存 Redis（5 分钟过期）→ 发邮件带链接 → 用户点链接 → 校验 Token → 改密码 → 删 Token。绝不能直接发原密码。

## 使用场景

**适合场景**：前后端分离项目、微服务架构、需要无状态认证的移动端 API、多端统一鉴权。

**不适合场景**：强会话管理的传统 Web 应用（如银行）、需要主动踢人下线的场景（JWT 无状态难主动失效，除非维护黑名单）。

## 代码示例

### Spring Security 配置

\`\`\`java
package com.example.blog.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity           // 开启 @PreAuthorize 注解
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();   // 密码加密
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 禁用 CSRF（JWT 无状态，不需要 CSRF Token）
            .csrf(csrf -> csrf.disable())
            // 无状态 Session
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // 路径权限
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()        // 登录注册放行
                .requestMatchers("/api/articles").permitAll()         // 文章列表放行
                .requestMatchers("/api/articles/{id}").permitAll()    // 文章详情放行
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()  // 文档放行
                .requestMatchers("/api/admin/**").hasRole("ADMIN")    // 管理后台需 ADMIN
                .anyRequest().authenticated()                          // 其他需登录
            )
            // 在 UsernamePasswordAuthenticationFilter 前插入 JWT 过滤器
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
\`\`\`

### JWT 工具类

\`\`\`java
package com.example.blog.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long accessTokenValidity;
    private final long refreshTokenValidity;

    public JwtTokenProvider(
            @Value("\${jwt.secret}") String secret,
            @Value("\${jwt.access-token-validity:7200000}") long accessValidity,
            @Value("\${jwt.refresh-token-validity:604800000}") long refreshValidity) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessTokenValidity = accessValidity;       // 默认 2 小时
        this.refreshTokenValidity = refreshValidity;      // 默认 7 天
    }

    // 生成 Access Token
    public String generateAccessToken(Long userId, String username, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenValidity);
        return Jwts.builder()
            .subject(userId.toString())           // sub：用户 ID
            .claim("username", username)
            .claim("role", role)
            .issuedAt(now)
            .expiration(expiry)
            .signWith(key)
            .compact();
    }

    // 生成 Refresh Token（只含 userId，不含业务信息）
    public String generateRefreshToken(Long userId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + refreshTokenValidity);
        return Jwts.builder()
            .subject(userId.toString())
            .issuedAt(now)
            .expiration(expiry)
            .signWith(key)
            .compact();
    }

    // 验证 Token 并返回 Claims
    public Claims parseToken(String token) {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
\`\`\`

### 认证 Controller

\`\`\`java
package com.example.blog.controller;

import com.example.blog.dto.request.LoginRequest;
import com.example.blog.dto.request.RegisterRequest;
import com.example.blog.dto.response.AuthResponse;
import com.example.blog.entity.User;
import com.example.blog.security.JwtTokenProvider;
import com.example.blog.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider tokenProvider;

    public AuthController(AuthService authService, JwtTokenProvider tokenProvider) {
        this.authService = authService;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        User user = authService.register(req);
        String access = tokenProvider.generateAccessToken(user.getId(), user.getUsername(), "USER");
        String refresh = tokenProvider.generateRefreshToken(user.getId());
        return new AuthResponse(access, refresh, user.getUsername());
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        User user = authService.login(req.getUsername(), req.getPassword());
        String access = tokenProvider.generateAccessToken(user.getId(), user.getUsername(), "USER");
        String refresh = tokenProvider.generateRefreshToken(user.getId());
        return new AuthResponse(access, refresh, user.getUsername());
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@RequestHeader("Refresh-Token") String refreshToken) {
        // 验证 refresh token，签发新 access token
        Long userId = Long.valueOf(tokenProvider.parseToken(refreshToken).getSubject());
        User user = authService.findById(userId);
        String access = tokenProvider.generateAccessToken(user.getId(), user.getUsername(), "USER");
        return new AuthResponse(access, refreshToken, user.getUsername());
    }
}
\`\`\`

### JWT 过滤器

\`\`\`java
package com.example.blog.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        // 从 Header 取 Token
        String token = resolveToken(request);
        if (token != null && tokenProvider.validateToken(token)) {
            Claims claims = tokenProvider.parseToken(token);
            // 构造 Authentication 放入 SecurityContext
            String role = claims.get("role", String.class);
            var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
            var auth = new UsernamePasswordAuthenticationToken(
                claims.getSubject(), null, authorities);
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        chain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}
\`\`\`

### 权限控制示例

\`\`\`java
@Service
public class ArticleService {

    @PreAuthorize("hasRole('ADMIN') or @articleSecurity.isOwner(authentication, #articleId)")
    public void deleteArticle(Long articleId) {
        // 只有 ADMIN 或文章作者能删
    }
}

@Component
public class ArticleSecurity {
    public boolean isOwner(Authentication auth, Long articleId) {
        Long userId = Long.valueOf((String) auth.getPrincipal());
        return articleRepository.findById(articleId)
            .map(a -> a.getAuthorId().equals(userId))
            .orElse(false);
    }
}
\`\`\`

关键点：\`STATELESS\` 不创建 Session；\`addFilterBefore\` 在合适位置插入 JWT 过滤器；BCrypt 加密密码；\`@PreAuthorize\` 控制方法级权限；Access Token 短期 + Refresh Token 长期。

## 对比分析

| 维度 | Session | JWT | OAuth2 |
| --- | --- | --- | --- |
| 状态 | 有状态（服务器存） | 无状态（Token 含信息） | 看实现 |
| 多实例 | 需共享 Session | 天然支持 | 天然支持 |
| 主动失效 | 删 Session 即可 | 难（需黑名单） | 撤销 Token |
| 性能 | 内存查询快 | 验签有开销 | 依赖实现 |
| 适合场景 | 传统 Web | 前后端分离、移动端 | 第三方登录 |
| 复杂度 | 低 | 中 | 高 |

密码加密算法对比：

| 算法 | 速度 | 安全性 | 适用 |
| --- | --- | --- | --- |
| MD5 | 极快 | 不安全（已破解） | 不推荐 |
| SHA-256 | 快 | 中（无盐易彩虹表） | 需加盐 |
| BCrypt | 慢（可调成本） | 高（内建盐） | 推荐 |
| Argon2 | 慢 | 极高（抗 GPU） | 新项目首选 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 密码明文存储 | 直接存原密码 | BCrypt 加密，PasswordEncoder.encode |
| JWT 密钥太短 | HS256 需至少 256 位 | 用 32+ 字符随机字符串 |
| JWT 无法主动失效 | 无状态设计固有缺陷 | 维护 Redis 黑名单或用短期 Token |
| 权限注解不生效 | 没加 @EnableMethodSecurity | 配置类加 @EnableMethodSecurity |
| 跨域请求被拦截 | Security 默认拒绝跨域 | 配 CorsConfigurationSource |
| 登录密码明文传 | HTTP 无加密 | 用 HTTPS，或前端 RSA 加密后传输 |
| Token 过期没处理 | 前端没统一拦截 401 | 前端 axios 拦截器自动 refresh |
| 角色判断用 hasRole 还是 hasAuthority | hasRole 自动加 ROLE_ 前缀 | 用 hasRole('ADMIN') 对应 ROLE_ADMIN |
`
  },
  // =============================================================
  // 第六十三章:文章 CRUD 与分页查询
  // =============================================================
  {
    id: "jw-63",
    group: "实战项目",
    icon: "📝",
    title: "文章 CRUD 与分页查询",
    content: `# 文章 CRUD 与分页查询

## 概念解释

文章模块是博客系统的核心。涉及增删改查（CRUD）、分页查询、Markdown 渲染、缓存优化。本章把这些技能点串成一个完整模块。

### CRUD

- **Create**：发布文章，保存到数据库。
- **Read**：文章列表（分页）、文章详情（单篇）。
- **Update**：编辑文章。
- **Delete**：删除文章（软删除更安全）。

### 分页

文章可能上千篇，一次全查会撑爆内存和数据库。分页每次只查一页（如 20 篇）。两种分页方式：

- **Offset 分页**：\`LIMIT 20 OFFSET 40\` 跳过前 40 条。简单但深翻慢（要扫描跳过的行）。
- **游标分页**：\`WHERE id > last_id LIMIT 20\`。快但不能跳页，适合无限滚动。

博客列表通常用 Offset 分页（用户要跳页），后台日志类用游标分页。

### Markdown 渲染

用户输入 Markdown，后端渲染成 HTML 存库。前端直接展示 HTML。用 \`commonmark-java\` 库渲染。注意防 XSS：渲染后过滤危险标签（\`<script>\`、\`<iframe>\`）。

## 设计原理

### 原理一：DTO 隔离实体与接口

JPA 实体 \`Article\` 含数据库字段（id、author_id、content_md、content_html），但接口返回应精简（\`ArticleResponse\` 只含前端需要的字段）。用 DTO 转换避免：

- 实体字段直接暴露（如 password_hash 不该返回）。
- 循环引用（实体双向关联序列化死循环）。
- 前端拿多余字段浪费带宽。

### 原理二：缓存文章详情（Cache Aside）

文章详情读多写少，适合缓存。流程：

1. 查询时先查 Redis，命中直接返回。
2. 未命中查 DB，结果写入 Redis（设 TTL 如 1 小时）。
3. 更新文章时**删除**缓存（不是更新，避免并发不一致）。

用 Spring Cache + Redis：\`@Cacheable\` / \`@CacheEvict\` 注解，零侵入。

### 原理三：异步渲染 HTML

Markdown 渲染成 HTML 耗时（几毫秒到几十毫秒）。保存文章时同步渲染会拖慢响应。可异步：保存原文后立即返回，后台任务渲染 HTML。但博客量小，同步渲染也可接受。

### 原理四：软删除

物理删除（\`DELETE FROM article\`）不可恢复。软删除加 \`deleted\` 字段，查询时 \`WHERE deleted = 0\`。好处：可恢复、保留审计、SEO 不丢链接。坏处：表会膨胀，需定期归档。

### 原理五：N+1 查询问题

查文章列表时每篇文章要查作者名字、标签——若循环里逐条查，N 篇文章查 N+1 次（1 次列表 + N 次作者）。用 JPA \`@EntityGraph\` 或 JOIN FETCH 一次查全。

## 使用场景

**适合场景**：内容管理系统（CMS）、博客、新闻列表、商品列表等"读多写少 + 分页"场景。

**不适合场景**：实时性极高的数据（缓存会过期导致不一致）、需要全文搜索的场景（用 Elasticsearch）。

## 代码示例

### Article 实体

\`\`\`java
package com.example.blog.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "article")
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long authorId;

    @Column(nullable = false, length = 200)
    private String title;

    private String summary;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contentMd;          // Markdown 原文

    @Column(columnDefinition = "TEXT")
    private String contentHtml;        // 渲染后 HTML

    private Integer status = 0;        // 0 草稿 1 发布

    private Integer viewCount = 0;

    private Boolean deleted = false;   // 软删除标记

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "article_tag",
        joinColumns = @JoinColumn(name = "article_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id"))
    private Set<Tag> tags;

    // getter/setter 省略，实际用 Lombok @Data
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    // ... 其他 getter/setter
}
\`\`\`

### ArticleRepository

\`\`\`java
package com.example.blog.repository;

import com.example.blog.entity.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ArticleRepository extends JpaRepository<Article, Long> {

    // 分页查询已发布文章（用 JOIN FETCH 解决 N+1，一次查作者）
    @Query("SELECT a FROM Article a LEFT JOIN FETCH a.author " +
           "WHERE a.status = 1 AND a.deleted = false ORDER BY a.createdAt DESC")
    Page<Article> findPublished(Pageable pageable);

    // 按标签查询
    @Query("SELECT a FROM Article a JOIN a.tags t " +
           "WHERE t.name = :tag AND a.status = 1 AND a.deleted = false")
    Page<Article> findByTag(@Param("tag") String tag, Pageable pageable);

    // 游标分页（无限滚动场景）
    @Query("SELECT a FROM Article a WHERE a.id < :lastId AND a.status = 1 AND a.deleted = false " +
           "ORDER BY a.id DESC")
    List<Article> findBefore(@Param("lastId") Long lastId, Pageable pageable);
}
\`\`\`

### ArticleService（含缓存）

\`\`\`java
package com.example.blog.service.impl;

import com.example.blog.entity.Article;
import com.example.blog.repository.ArticleRepository;
import org.commonmark.node.Node;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.html.HtmlRenderer;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final Parser markdownParser = Parser.builder().build();
    private final HtmlRenderer htmlRenderer = HtmlRenderer.builder().build();

    public ArticleService(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    // 发布文章：保存原文 + 渲染 HTML
    public Article createArticle(Article article) {
        // 渲染 Markdown 为 HTML
        Node document = markdownParser.parse(article.getContentMd());
        article.setContentHtml(htmlRenderer.render(document));
        article.setStatus(1);
        return articleRepository.save(article);
    }

    // 查详情：走缓存
    @Cacheable(value = "article", key = "#id")
    @Transactional(readOnly = true)
    public Article findById(Long id) {
        return articleRepository.findById(id)
            .filter(a -> !a.getDeleted())
            .orElseThrow(() -> new ArticleNotFoundException(id));
    }

    // 分页列表
    @Transactional(readOnly = true)
    public Page<Article> findPublished(int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return articleRepository.findPublished(pageable);
    }

    // 更新：删除缓存（Cache Aside）
    @CacheEvict(value = "article", key = "#id")
    public Article updateArticle(Long id, Article updated) {
        Article article = findById(id);
        article.setTitle(updated.getTitle());
        article.setContentMd(updated.getContentMd());
        // 重新渲染 HTML
        Node document = markdownParser.parse(updated.getContentMd());
        article.setContentHtml(htmlRenderer.render(document));
        return articleRepository.save(article);
    }

    // 软删除
    @CacheEvict(value = "article", key = "#id")
    public void deleteArticle(Long id) {
        Article article = findById(id);
        article.setDeleted(true);
        articleRepository.save(article);
    }
}
\`\`\`

### ArticleController

\`\`\`java
package com.example.blog.controller;

import com.example.blog.dto.request.CreateArticleRequest;
import com.example.blog.dto.response.ArticleDetailResponse;
import com.example.blog.dto.response.ArticleSummaryResponse;
import com.example.blog.entity.Article;
import com.example.blog.service.ArticleService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    // 分页列表：GET /api/articles?page=0&size=20
    @GetMapping
    public Page<ArticleSummaryResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return articleService.findPublished(page, size)
            .map(this::toSummary);
    }

    // 详情：GET /api/articles/123
    @GetMapping("/{id}")
    public ArticleDetailResponse detail(@PathVariable Long id) {
        Article a = articleService.findById(id);
        return toDetail(a);
    }

    // 发布：POST /api/articles
    @PostMapping
    public ResponseEntity<ArticleDetailResponse> create(
            @RequestBody @Valid CreateArticleRequest req,
            Authentication auth) {
        Long userId = Long.valueOf(auth.getName());
        Article article = new Article();
        article.setAuthorId(userId);
        article.setTitle(req.getTitle());
        article.setContentMd(req.getContent());
        Article saved = articleService.createArticle(article);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDetail(saved));
    }

    // 更新：PUT /api/articles/123
    @PutMapping("/{id}")
    public ArticleDetailResponse update(@PathVariable Long id,
                                         @RequestBody @Valid CreateArticleRequest req) {
        // 省略权限校验
        Article updated = new Article();
        updated.setTitle(req.getTitle());
        updated.setContentMd(req.getContent());
        return toDetail(articleService.updateArticle(id, updated));
    }

    // 删除：DELETE /api/articles/123
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        articleService.deleteArticle(id);
    }

    private ArticleSummaryResponse toSummary(Article a) {
        return new ArticleSummaryResponse(a.getId(), a.getTitle(), a.getSummary(),
            a.getAuthorName(), a.getCreatedAt());
    }

    private ArticleDetailResponse toDetail(Article a) {
        return new ArticleDetailResponse(a.getId(), a.getTitle(), a.getContentHtml(),
            a.getAuthorName(), a.getCreatedAt());
    }
}
\`\`\`

### DTO 定义

\`\`\`java
// 请求 DTO
public class CreateArticleRequest {
    @NotBlank @Size(max = 200)
    private String title;
    @NotBlank
    private String content;        // Markdown 原文
    private Set<String> tags;      // 标签名集合
    // getter/setter
}

// 响应 DTO（列表用，精简）
public class ArticleSummaryResponse {
    private Long id;
    private String title;
    private String summary;
    private String authorName;
    private LocalDateTime createdAt;
    // 构造器 + getter
}

// 响应 DTO（详情用，含 HTML）
public class ArticleDetailResponse {
    private Long id;
    private String title;
    private String contentHtml;     // 渲染后 HTML
    private String authorName;
    private LocalDateTime createdAt;
}
\`\`\`

### Redis 缓存配置

\`\`\`java
@Configuration
public class RedisConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofHours(1))             // 默认 1 小时过期
            .disableCachingNullValues();                 // 不缓存 null（防穿透）

        return RedisCacheManager.builder(factory)
            .cacheDefaults(config)
            .withInitialCacheConfigurations(Map.of(
                "article", RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofHours(2))      // 文章缓存 2 小时
            ))
            .build();
    }
}
\`\`\`

关键点：\`@Cacheable\` 读时查缓存；\`@CacheEvict\` 写时删缓存（Cache Aside）；\`JOIN FETCH\` 解决 N+1；\`PageRequest.of(page, size, sort)\` 分页；\`@Valid\` 校验请求体；DTO 隔离实体与接口；软删除用 \`deleted\` 字段。

## 对比分析

| 维度 | PageHelper | Spring Data Pageable | 手写 SQL 分页 |
| --- | --- | --- | --- |
| 接入方式 | MyBatis 插件 | Spring Data 内置 | 自己写 LIMIT |
| 侵入性 | 拦截 SQL 自动加分页 | Repository 参数传 Pageable | 完全手控 |
| 灵活性 | 中 | 高 | 极高 |
| 学习成本 | 低 | 低 | 中 |
| 适合 | MyBatis 项目 | JPA 项目 | 复杂查询 |

分页方式对比：

| 维度 | Offset 分页 | 游标分页 |
| --- | --- | --- |
| 实现 | LIMIT N OFFSET M | WHERE id > last_id LIMIT N |
| 跳页 | 支持 | 不支持 |
| 深翻性能 | 差（扫描跳过行） | 好（直接定位） |
| 数据变化影响 | 大（中间插入会错位） | 小 |
| 适合场景 | 列表页（需跳页） | 无限滚动、Feed 流 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| N+1 查询 | 循环里访问关联属性 | 用 JOIN FETCH 或 @EntityGraph |
| 缓存与 DB 不一致 | 更新后没删缓存 | @CacheEvict 删缓存，Cache Aside 模式 |
| 缓存穿透 | 查不存在的 ID 每次查 DB | 缓存空值，或布隆过滤器 |
| Markdown XSS | 渲染后含 <script> | 用 commonmark + 后置 XSS 过滤 |
| 深翻慢 | OFFSET 大值扫描多行 | 用游标分页或覆盖索引 |
| 事务不生效 | 自调用同类方法 | 拆到另一个 Service 或注入自身代理 |
| 软删除查询忘加条件 | 默认查全部含已删 | 用 @Where(deleted = false) 或 SQL Filter |
| 分页参数没校验 | size 传 10000 撑爆 | 限制 size 最大值（如 100） |
| 文章内容太大 | TEXT 字段返回全量列表 | 列表用 summary 字段，详情才返全量 |
| 并发更新覆盖 | 两人同时编辑 | 用乐观锁 @Version |
`
  },
  // =============================================================
  // 第六十四章:总结与进阶学习路线
  // =============================================================
  {
    id: "jw-64",
    group: "实战项目",
    icon: "🎓",
    title: "总结与进阶学习路线",
    content: `# 总结与进阶学习路线

## 概念解释

恭喜你走到这里！本教程从 Java Web 基础到实战项目，覆盖了一个 Java Web 开发者需要掌握的核心技能。本章回顾全书要点，并给出进阶学习路线，帮你规划下一步。

### 全书知识图谱

本教程围绕"从入门到上线"的主线，分几个大模块：

1. **基础篇**：Servlet/JSP、HTTP 协议、MVC 模式。理解 Web 本质。
2. **Spring 篇**：IoC/DI、AOP、Spring MVC。掌握主流框架。
3. **数据篇**：JDBC、JPA/Hibernate、事务、连接池。会操作数据库。
4. **REST 篇**：RESTful 设计、Spring REST、文档、版本控制。会设计 API。
5. **安全篇**：Spring Security、JWT、OAuth2。会做认证授权。
6. **实时篇**：WebSocket、STOMP、聊天室。会做实时通信。
7. **测试篇**：JUnit 5、Mockito、Spring Boot Test、性能测试。会保证质量。
8. **部署篇**：打包、Docker、Nginx、日志监控。会上线运维。
9. **实战篇**：博客系统，把所有技能点串起来。

### 核心技能清单

一个合格的 Java Web 开发者应掌握：

- **语言**：Java 17+，Lambda、Stream、Optional、新语法。
- **框架**：Spring Boot、Spring MVC、Spring Data JPA、Spring Security。
- **数据库**：MySQL（写 SQL、调索引、看执行计划）、Redis（缓存、分布式锁）。
- **中间件**：消息队列（RabbitMQ/Kafka）、搜索引擎（Elasticsearch）。
- **工具**：Maven/Gradle、Git、Docker、Linux 基本命令。
- **设计**：RESTful API 设计、分层架构、设计模式、领域建模。
- **质量**：单元测试、集成测试、代码评审。
- **运维**：日志、监控、CI/CD、性能调优。

## 设计原理

### 原理一：T 型技能树

先广后深。先横向掌握 Java Web 全栈（前端、后端、数据库、部署），能独立做一个项目。再纵向深挖某个方向（如数据库调优、高并发架构、分布式系统）。深度决定稀缺性，广度决定协作效率。

### 原理二：项目驱动学习

看书看视频是"输入"，做项目是"输出"。只有输出才能检验掌握程度。建议：每学一个技术就做一个 demo，每学一个模块就做一个综合项目。本教程的博客系统就是一次综合输出。

### 原理三：读源码与社区

中级到高级的跨越靠"理解原理"。读 Spring Boot 源码看自动装配怎么实现、读 JPA 源码看 dirty checking 怎么工作。关注 GitHub trending、技术博客、官方文档，保持技术敏感度。

### 原理四：刻意练习

舒适区练习 1 万小时也不会进步。刻意练习：挑不会的做、做错的复盘、向高手请教。Code Review 是刻意练习的好方式——让别人挑你的毛病，你也挑别人的，互相长进。

### 原理五：技术演进意识

技术不断迭代。Spring Boot 2 到 3、Java 8 到 17 到 21、虚拟线程、GraalVM Native Image。保持学习新版本的习惯，但不必追每个新特性——看它能解决什么问题，是否值得迁移成本。

## 使用场景

**适合**：规划职业发展路径、面试准备清单、技术选型参考、查漏补缺对照。

## 代码示例

### 进阶学习路线（思维导图式）

\`\`\`
Java Web 进阶路线
│
├── 1. 深入 Spring 生态
│   ├── Spring Boot 自动装配原理（读源码）
│   ├── Spring Cloud 微服务全家桶
│   │   ├── 服务注册发现：Nacos / Eureka
│   │   ├── 配置中心：Nacos Config
│   │   ├── 网关：Spring Cloud Gateway
│   │   ├── 熔断限流：Sentinel / Resilience4j
│   │   └── 分布式事务：Seata
│   └── Spring Reactive（WebFlux）
│
├── 2. 数据库深入
│   ├── MySQL 调优
│   │   ├── 索引原理（B+ 树、覆盖索引、最左前缀）
│   │   ├── 执行计划分析（EXPLAIN）
│   │   ├── 慢查询优化
│   │   └── 主从复制、读写分离、分库分表
│   ├── Redis 进阶
│   │   ├── 持久化（RDB/AOF）
│   │   ├── 哨兵模式、Cluster 集群
│   │   ├── 分布式锁（Redlock）
│   │   └── 缓存模式（Cache Aside / Write Through / 旁路）
│   └── Elasticsearch 全文搜索
│
├── 3. 高并发架构
│   ├── 消息队列
│   │   ├── RabbitMQ（AMQP 模型）
│   │   ├── Kafka（高吞吐、日志流）
│   │   └── RocketMQ（国产、事务消息）
│   ├── 缓存架构（多级缓存、热点探测）
│   ├── 限流降级（令牌桶、漏桶、熔断器）
│   └── 异步化（CompletableFuture、Reactor、虚拟线程）
│
├── 4. 分布式系统
│   ├── 分布式锁（Redis / Zookeeper）
│   ├── 分布式事务（2PC / TCC / Saga / 本地消息表）
│   ├── 分布式 ID（雪花算法 / UUID / Leaf）
│   ├── 一致性算法（Raft / Paxos）
│   └── CAP 理论与 BASE 理论
│
├── 5. DevOps 与云原生
│   ├── Kubernetes 容器编排
│   ├── Helm / ArgoCD（GitOps）
│   ├── CI/CD（Jenkins / GitHub Actions / GitLab CI）
│   ├── 可观测性
│   │   ├── Prometheus + Grafana（指标）
│   │   ├── ELK / Loki（日志）
│   │   └── Jaeger / SkyWalking（链路追踪）
│   └── Service Mesh（Istio）
│
├── 6. 性能与调优
│   ├── JVM 调优
│   │   ├── GC 算法（G1 / ZGC）
│   │   ├── 内存模型与调优参数
│   │   ├── 线程 dump / 堆 dump 分析
│   │   └── 火焰图（async-profiler）
│   ├── 数据库调优（索引 / 慢 SQL / 连接池）
│   └── 系统容量规划
│
└── 7. 架构与设计
    ├── 设计模式（23 种经典 + 实战）
    ├── 领域驱动设计 DDD
    │   ├── 战术设计（Entity / Value Object / Repository）
    │   └── 战略设计（限界上下文 / 上下文映射）
    ├── 架构风格（单体 / 微服务 / 事件驱动 / CQRS）
    └── 系统设计面试（设计 Twitter / 短链 / 秒杀）
\`\`\`

### 推荐学习资源

\`\`\`text
# 必读书单
《Effective Java》          - Joshua Bloch     # Java 进阶必读
《Spring 实战》             - Craig Walls      # Spring 系统学习
《高性能 MySQL》            - Baron Schwartz   # 数据库圣经
《Redis 设计与实现》        - 黄健宏           # Redis 原理
《Java 并发编程实战》       - Brian Goetz      # 并发编程圣经
《深入理解 Java 虚拟机》    - 周志明           # JVM 必读
《设计模式》               - GoF              # 经典
《领域驱动设计》            - Eric Evans       # DDD 开山之作
《数据密集型应用系统设计》  - Martin Kleppmann  # 分布式系统圣经

# 在线资源
- Spring 官方文档：https://spring.io/projects/spring-boot
- Baeldung：https://www.baeldung.com  （Spring 教程丰富）
-掘金 / InfoQ / 美团技术博客  （国内技术文章）
- LeetCode / 牛客网  （算法面试）
- 系统设计：https://github.com/donnemartin/system-design-primer

# 实战项目建议
1. 个人博客（已完成）
2. 在线商城（电商全流程）
3. 即时通讯系统（WebSocket + 消息队列）
4. 短链接服务（高并发设计）
5. 分布式任务调度平台（Quartz / XXL-JOB）
\`\`\`

### 面试核心考点

\`\`\`java
// Java 基础高频考点
// 1. HashMap 原理：数组 + 链表/红黑树，扩容 2 倍
// 2. ConcurrentHashMap：分段锁（1.7）→ CAS + synchronized（1.8）
// 3. 线程池：核心参数、拒绝策略、执行流程
// 4. volatile：可见性 + 禁止重排序，不保证原子性
// 5. synchronized vs ReentrantLock

// JVM 高频考点
// 1. 内存区域：堆、栈、方法区、程序计数器
// 2. GC 算法：标记-清除、复制、标记-整理
// 3. GC 垃圾收集器：CMS / G1 / ZGC
// 4. 类加载机制：双亲委派模型

// Spring 高频考点
// 1. IoC 原理：BeanDefinition → BeanFactory → Bean 生命周期
// 2. AOP 原理：JDK 动态代理 vs CGLIB
// 3. Spring Boot 自动装配：@EnableAutoConfiguration + SPI
// 4. 事务传播：REQUIRED / REQUIRES_NEW / NESTED

// 数据库高频考点
// 1. 索引：B+ 树、最左前缀、覆盖索引、回表
// 2. 事务隔离级别：读未提交 / 读已提交 / 可重复读 / 串行化
// 3. MVCC：多版本并发控制
// 4. 锁：行锁、表锁、间隙锁、意向锁

// 分布式高频考点
// 1. CAP 理论：一致性、可用性、分区容错三选二
// 2. 分布式锁：Redis SETNX / Redlock / Zookeeper
// 3. 分布式事务：2PC / TCC / Saga / 本地消息表
// 4. 一致性哈希：解决节点增减时缓存大范围失效
\`\`\`

关键点：路线分 7 大方向；每个方向先理解原理再动手实践；读源码是中级到高级的必经之路；保持技术敏感度关注新版本；面试考点是检验掌握程度的标尺。

## 对比分析

| 方向 | 深度型 | 广度型 | T 型（推荐） |
| --- | --- | --- | --- |
| 策略 | 钻一个技术到极致 | 什么都会一点 | 先广后深 |
| 优势 | 不可替代性强 | 适应性好 | 兼顾两者 |
| 劣势 | 视野窄 | 缺乏竞争力 | 时间投入大 |
| 适合 | 大厂专家岗 | 创业全栈 | 大多数人 |
| 职业阶段 | 高级→专家 | 初级→中级 | 中级→高级 |

学习方式对比：

| 方式 | 效率 | 深度 | 适合 |
| --- | --- | --- | --- |
| 看视频 | 低（被动） | 浅 | 入门 |
| 读书 | 中 | 中 | 系统学习 |
| 做项目 | 高 | 深 | 实战巩固 |
| 读源码 | 极高 | 极深 | 高级进阶 |
| 技术分享 | 高 | 深 | 检验掌握 |
| Code Review | 高 | 深 | 团队提升 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 学完就忘 | 没有输出 | 做项目、写博客、教别人 |
| 只看不动手 | 眼高手低 | 每学一个技术写 demo |
| 追新特性上瘾 | 新不一定好 | 看解决什么问题，是否值得迁移 |
| 深度不够 | 什么都会一点不精 | 选一个方向深挖，读源码 |
| 不读官方文档 | 只看二手博客 | 官方文档最权威，二手可能过时 |
| 不做系统设计 | 只会写 CRUD | 学系统设计，看大厂架构分享 |
| 忽视软技能 | 只钻研技术 | 沟通、协作、文档能力同样重要 |
| 面经导向 | 背题不深究 | 理解原理，举一反三 |
| 不关注业务 | 技术脱离业务没价值 | 理解业务，技术为业务服务 |
| 停留在舒适区 | 重复用熟悉技术 | 刻意练习不会的，挑战新项目 |
`
  },
];
