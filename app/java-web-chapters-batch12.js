// =============================================================
// Java Web 应用开发实战教程 —— 第十二批章节（Spring Security 认证组，共 4 章）
// 章节 45-48:Spring Security 入门 / 认证与授权配置 /
//          JWT 与无状态会话 / OAuth2 与方法级安全
// =============================================================

export const chapters = [
  // =============================================================
  // 第四十五章:Spring Security 入门
  // =============================================================
  {
    id: "jw-45",
    group: "Spring Security 认证",
    icon: "🔐",
    title: "Spring Security 入门",
    content: `# Spring Security 入门

## 概念解释

Spring Security 是 Spring 生态中处理**认证**（Authentication，你是谁）与**授权**（Authorization，你能做什么）的安全框架。它是 Java 后端事实上的安全标准，几乎所有 Spring Boot 企业级项目都基于它构建防护。

认证与授权是两个不同概念：认证是验证身份（如登录账号密码对不对），授权是判断权限（如普通用户能不能访问管理后台）。两者顺序固定：先认证（知道你是谁）再授权（判断能不能做）。没认证就谈不上授权。

Spring Security 的核心是**过滤器链**（Filter Chain）。每个请求都要穿过一连串过滤器，每个过滤器负责一类安全职责：\`SecurityContextPersistenceFilter\` 恢复会话、\`UsernamePasswordAuthenticationFilter\` 处理表单登录、\`BasicAuthenticationFilter\` 处理 HTTP Basic、\`ExceptionTranslationFilter\` 把异常转成 HTTP 响应、\`FilterSecurityInterceptor\` 做 URL 级授权。这些过滤器组成 \`FilterChainProxy\`，由 \`DelegatingFilterProxy\` 桥接进 Servlet 容器。

核心对象：\`Authentication\`（认证信息，含主体、凭证、权限）、\`UserDetails\`（用户详细信息接口）、\`UserDetailsService\`（按用户名加载用户）、\`PasswordEncoder\`（密码加密）、\`SecurityContext\`（持有当前 Authentication）、\`SecurityContextHolder\`（线程级持有 SecurityContext）。

## 设计原理

Spring Security 5.7+ 推荐**Lambda DSL** 配置，弃用 \`WebSecurityConfigurerAdapter\`。用 \`SecurityFilterChain\` Bean 声明规则，链式调用更清晰。每个 \`SecurityFilterChain\` 对应一组 URL 规则，可配置多个 Bean 处理不同路径。

\`PasswordEncoder\` 默认用 \`BCryptPasswordEncoder\`，内置盐值且可调强度（默认 10 轮）。BCrypt 是单向哈希，不可逆，每次加密同密码结果不同（盐随机），抗彩虹表与暴力破解。**永远不要明文存密码**，也不要用 MD5/SHA（已被破解）。

默认配置：引入 \`spring-boot-starter-security\` 后，所有 URL 都需认证，自动生成一个用户名 \`user\`、密码启动时打印在控制台的临时账号，并提供一个自动生成的登录页 \`/login\`。这是「安全优先」设计——默认全部保护，开发者显式放行才开放。

\`SecurityContextHolder\` 默认用 \`ThreadLocal\` 策略持有当前用户，所以任何地方都能通过 \`SecurityContextHolder.getContext().getAuthentication()\` 拿到当前登录用户。异步场景需配合 \`DelegatingSecurityContextRunnable\` 传递上下文。

## 使用场景

- 任何需要登录的 Web 应用：管理后台、用户系统
- API 鉴权：REST API 防止匿名访问
- 角色权限控制：管理员、普通用户分层
- 与 OAuth2/JWT 集成：SSO、前后端分离
- 不适用：纯静态站点、内部完全信任的服务间通信

## 代码示例

最小化安全配置（Spring Boot 3.x + Spring Security 6）：

\`\`\`java
package com.example.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity         // 开启 Spring Security
public class SecurityConfig {

    // 密码编码器：BCrypt 哈希
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 内存用户（演示用，生产换数据库实现）
    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder encoder) {
        var admin = User.builder()
            .username("admin")
            .password(encoder.encode("123456"))
            .roles("ADMIN")
            .build();
        var user = User.builder()
            .username("user")
            .password(encoder.encode("123456"))
            .roles("USER")
            .build();
        return new InMemoryUserDetailsManager(admin, user);
    }

    // 安全过滤链：定义 URL 规则
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/public/**", "/login", "/css/**").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/home")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout")
            )
            .csrf(csrf -> csrf.disable());   // API 场景禁用，SSR 要保留
        return http.build();
    }
}
\`\`\`

获取当前登录用户：

\`\`\`java
@GetMapping("/me")
public Map<String, Object> currentUser() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    return Map.of(
        "name", auth.getName(),
        "roles", auth.getAuthorities()
    );
}
\`\`\`

逐行解析：\`@EnableWebSecurity\` 开启安全支持；\`BCryptPasswordEncoder\` 哈希密码；\`User.builder()\` 构造用户；\`roles("ADMIN")\` 自动加 \`ROLE_\` 前缀；\`requestMatchers("/admin/**").hasRole("ADMIN")\` URL 级授权；\`anyRequest().authenticated()\` 兜底要求认证；\`formLogin\` 表单登录；\`SecurityContextHolder.getContext().getAuthentication()\` 取当前用户。

## 对比分析

| 维度 | 认证 Authentication | 授权 Authorization |
| --- | --- | --- |
| 解决问题 | 你是谁 | 你能做什么 |
| 顺序 | 先 | 后 |
| 依据 | 凭证（密码/Token） | 角色/权限 |
| 失败响应 | 401 | 403 |

| 维度 | BCrypt | MD5 | 明文 |
| --- | --- | --- | --- |
| 安全性 | 高 | 低（已破解） | 无 |
| 加盐 | 内置随机盐 | 需手动 | 无 |
| 不可逆 | 是 | 是（但易碰撞） | 否 |
| 推荐 | 是 | 否 | 否 |

| 维度 | WebSecurityConfigurerAdapter | SecurityFilterChain Bean |
| --- | --- | --- |
| 版本 | 5.7 前 | 5.7+ 推荐 |
| 方式 | 继承重写 | Bean 声明 |
| 灵活性 | 中 | 高 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 密码明文存库 | 偷懒 | 用 BCryptPasswordEncoder |
| 用 MD5 加密 | 已不安全 | 改 BCrypt |
| 放行规则写错顺序 | anyRequest 在前 | 先具体后通配 |
| CSRF 禁用但用 SSR | 表单提交失败 | SSR 保留 CSRF，API 才禁用 |
| 拿不到当前用户 | 异步线程丢失上下文 | 用 DelegatingSecurityContextRunnable |
| roles 没加 ROLE_ 前缀 | hasRole 自动加前缀 | 用 hasRole 写无前缀，hasAuthority 写全名 |
| 默认 user 账号上线 | 漏配 UserDetailsService | 配置自己的用户源 |
| SecurityFilterChain 顺序错 | 多链匹配错乱 | @Order 控制顺序 |
`,
  },

  // =============================================================
  // 第四十六章:认证与授权配置
  // =============================================================
  {
    id: "jw-46",
    group: "Spring Security 认证",
    icon: "👮",
    title: "认证与授权配置",
    content: `# 认证与授权配置

## 概念解释

实际项目中，默认的内存用户和登录页远远不够。需要**自定义 UserDetailsService** 从数据库加载用户、**自定义登录页**符合 UI 规范、**细粒度授权**控制方法级访问。

\`UserDetailsService\` 是核心接口，只有一个方法 \`loadUserByUsername(String)\` 返回 \`UserDetails\`。Spring Security 在认证时调用它查用户，比对密码后构造 \`Authentication\`。实现自己的 \`UserDetailsService\` 即可对接任意数据源（数据库、LDAP、外部 API）。

\`UserDetails\` 接口定义用户信息：用户名、密码、权限集、是否未过期、是否未锁定、是否启用。Spring 提供 \`User\` 实现类可快速构造。自定义实体实现该接口即可。

授权分两个层级：**URL 级授权**在 \`SecurityFilterChain\` 用 \`authorizeHttpRequests\` 配置（如 \`/admin/**\` 要 ADMIN 角色），**方法级授权**用 \`@PreAuthorize\`、\`@PostAuthorize\`、\`@Secured\` 注解控制（如「只能改自己的资料」）。\`@EnableMethodSecurity\` 开启方法级安全（默认开启 \`@PreAuthorize\`）。

\`@PreAuthorize\` 用 Spring EL 表达式：\`hasRole('ADMIN')\`、\`hasAuthority('user:write')\`、\`@PreAuthorize("#user.id == authentication.principal.id")\`（只能改自己）、\`@PreAuthorize("hasRole('ADMIN') or #user.id == authentication.principal.id")\`。

## 设计原理

\`UserDetailsService\` 的设计分离了「用户数据从哪来」与「怎么认证」。Spring Security 只关心拿到 \`UserDetails\`，不关心是数据库还是 LDAP。这让安全框架与业务解耦。

\`DaoAuthenticationProvider\` 是默认认证提供者：调用 \`UserDetailsService\` 取用户 → 用 \`PasswordEncoder\` 比对密码 → 成功构造 \`UsernamePasswordAuthenticationToken\` 存入 \`SecurityContext\`。这套流程固定，开发者只需提供 \`UserDetailsService\` 和 \`PasswordEncoder\`。

方法级安全用 AOP 实现：\`@PreAuthorize\` 由 \`MethodSecurityInterceptor\` 切面拦截方法调用，在执行前评估表达式。表达式根对象是 \`MethodSecurityExpressionRoot\`，提供 \`hasRole\`、\`hasAuthority\`、\`authentication\`、\`principal\` 等内置变量。

\`#参数名\` 语法引用方法参数：\`@PreAuthorize("#user.id == authentication.principal.id")\` 中 \`#user\` 引用方法参数 \`user\`，需要方法参数名编译时保留（Spring Boot 3.x 默认保留）。

## 使用场景

- 数据库用户源：从用户表加载
- 自定义登录页：统一 UI 风格
- 方法级权限：编辑自己资源、管理员特权操作
- 细粒度授权：读写分离、数据隔离
- 不适用：极简 demo（默认配置够用）

## 代码示例

自定义 UserDetailsService（数据库实现）：

\`\`\`java
@Service
public class DbUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public DbUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserEntity user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("用户不存在：" + username));

        // 把数据库角色转成 GrantedAuthority
        Collection<GrantedAuthority> authorities = user.getRoles().stream()
            .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName()))
            .collect(Collectors.toList());

        return new User(
            user.getUsername(),
            user.getPassword(),       // 已 BCrypt 哈希存的
            user.isEnabled(),
            true,                     // accountNonExpired
            true,                     // credentialsNonExpired
            user.isAccountNonLocked(),
            authorities
        );
    }
}
\`\`\`

自定义登录页配置：

\`\`\`java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/", "/login", "/register", "/static/**").permitAll()
            .requestMatchers("/admin/**").hasRole("ADMIN")
            .requestMatchers("/user/**").hasAnyRole("USER", "ADMIN")
            .anyRequest().authenticated()
        )
        .formLogin(form -> form
            .loginPage("/login")
            .loginProcessingUrl("/authenticate")   // 表单提交到此
            .defaultSuccessUrl("/home", true)        // 成功跳转
            .failureUrl("/login?error=true")        // 失败跳转
            .permitAll()
        )
        .logout(logout -> logout
            .logoutRequestMatcher(new AntPathRequestMatcher("/logout", "POST"))
            .logoutSuccessUrl("/login?logout")
            .invalidateHttpSession(true)
            .deleteCookies("JSESSIONID")
            .permitAll()
        )
        .rememberMe(remember -> remember
            .key("uniqueAndSecret")
            .tokenValiditySeconds(7 * 24 * 3600)   // 7 天
        );
    return http.build();
}
\`\`\`

方法级安全（开启 + 注解使用）：

\`\`\`java
@Configuration
@EnableMethodSecurity   // 开启 @PreAuthorize @PostAuthorize
public class MethodSecurityConfig { }

@RestController
@RequestMapping("/api/users")
public class UserApiController {

    // 只有 ADMIN 能删除
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        userService.delete(id);
    }

    // 只能改自己的资料，或 ADMIN 可改任何人
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    @PutMapping("/{id}")
    public UserDto update(@PathVariable Long id, @RequestBody UserUpdateDto dto) {
        return userService.update(id, dto);
    }

    // 返回后过滤：只返回自己能看到的数据
    @PostAuthorize("hasRole('ADMIN') or returnObject.owner == authentication.principal.username")
    @GetMapping("/{id}/secret")
    public SecretDto getSecret(@PathVariable Long id) {
        return secretService.findById(id);
    }
}
\`\`\`

逐行解析：\`implements UserDetailsService\` 自定义用户源；\`UsernameNotFoundException\` 用户不存在时抛；\`ROLE_ + role.getName()\` 角色加前缀；\`new User(...)\` 用 Spring 内置实现；\`loginProcessingUrl\` 表单 action 地址；\`@EnableMethodSecurity\` 开启方法安全；\`@PreAuthorize("hasRole('ADMIN')")\` 调用前校验；\`#id == authentication.principal.id\` 引用方法参数与当前用户；\`@PostAuthorize\` 返回后校验，\`returnObject\` 指返回值。

## 对比分析

| 维度 | URL 级授权 | 方法级授权 |
| --- | --- | --- |
| 配置位置 | SecurityFilterChain | @PreAuthorize |
| 粒度 | 路径 | 单方法 |
| 表达式 | hasRole/permitAll | Spring EL（含参数） |
| 适用 | 粗粒度入口控制 | 细粒度业务权限 |

| 维度 | @PreAuthorize | @PostAuthorize | @Secured |
| --- | --- | --- | --- |
| 时机 | 方法前 | 方法后 | 方法前 |
| 表达式 | Spring EL | Spring EL（returnObject） | 仅角色名 |
| 灵活性 | 高 | 高 | 低 |
| 推荐 | 是 | 数据过滤时 | 兼容旧代码 |

| 维度 | hasRole('ADMIN') | hasAuthority('user:write') |
| --- | --- | --- |
| 前缀 | 自动加 ROLE_ | 不加前缀 |
| 粒度 | 角色 | 权限 |
| 适用 | 粗粒度 | 细粒度 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 角色名加 ROLE_ 前缀重复 | hasRole 已自动加 | hasRole 写 ADMIN，DB 存 ROLE_ADMIN |
| @PreAuthorize 不生效 | 没开 @EnableMethodSecurity | 加 @EnableMethodSecurity |
| #参数名取不到 | 参数名未保留 | 加 -parameters 编译参数 |
| 自定义登录页表单 action 错 | Spring 不知道往哪提交 | loginProcessingUrl 指定 |
| 密码比对失败 | 编码器不一致 | 全局统一 PasswordEncoder |
| 内部方法调用 @PreAuthorize 失效 | AOP 自调用不走代理 | 注入自身代理或抽到另一 Bean |
| logout 用 GET | CSRF 漏洞 | 用 POST 提交 |
| @PostAuthorize 性能差 | 方法已执行 | 仅用于数据过滤，权限拒绝用 @PreAuthorize |
`,
  },

  // =============================================================
  // 第四十七章:JWT 与无状态会话
  // =============================================================
  {
    id: "jw-47",
    group: "Spring Security 认证",
    icon: "🎫",
    title: "JWT 与无状态会话",
    content: `# JWT 与无状态会话

## 概念解释

JWT（JSON Web Token，RFC 7519）是无状态的令牌格式，用于在两方之间安全传递信息。它由三部分组成：\`Header\`（头部，含算法类型）、\`Payload\`（负载，含声明 claims）、\`Signature\`（签名），用点号连接：\`xxxxx.yyyyy.zzzzz\`。

传统 Session 认证：服务器存会话（内存或 Redis），用 Cookie 携带 Session ID。问题：多服务器要共享 Session（粘性会话或 Redis），横向扩展麻烦。JWT 是**自包含**的：令牌本身携带用户信息与签名，服务器无需查 Session，任何节点验签即可，天然支持水平扩展。

JWT 三部分：
- **Header**：\`{"alg": "HS256", "typ": "JWT"}\`，Base64URL 编码。
- **Payload**：声明，含标准声明（\`iss\` 签发者、\`exp\` 过期时间、\`sub\` 主体、\`aud\` 受众）与自定义声明（\`userId\`、\`roles\`）。**注意 Payload 只是 Base64 编码不是加密，别放敏感信息**。
- **Signature**：用 Header 指定算法对 \`base64(header) + "." + base64(payload)\` 签名，验签保证完整性。

无状态会话（Stateless）配置 \`SessionCreationPolicy.STATELESS\`：Spring Security 不创建/不使用 HttpSession，完全靠 JWT 每次请求携带鉴权。

## 设计原理

JWT 的设计让认证状态从「服务器存」变成「客户端带」，服务器变成无状态。每次请求带 \`Authorization: Bearer <token>\` 头，服务器验签后从 Payload 取用户信息构造 \`Authentication\`，存入 \`SecurityContext\`，本次请求结束后丢弃。下次请求重新构造，无状态可任意扩展。

\`OncePerRequestFilter\` 是 Spring 提供的保证每请求只执行一次的过滤器基类。自定义 \`JwtAuthenticationFilter\` 继承它：取 Token → 验签 → 取用户 → 构造 \`Authentication\` → 存入 \`SecurityContext\`。

JWT 的两个关键安全点：**1. 签名密钥必须保密**，泄露则可伪造任意令牌；**2. 必须设过期时间**（\`exp\`），否则令牌泄露后永久有效。无状态意味着无法主动让某个令牌失效（除非维护黑名单，但那又变有状态了），所以过期时间是核心防线。

刷新令牌（Refresh Token）模式：签发短期 Access Token（如 15 分钟）+ 长期 Refresh Token（如 7 天）。Access Token 过期后用 Refresh Token 换新的，避免用户频繁登录，又限制了 Access Token 泄露的窗口。

## 使用场景

- 前后端分离：前端存 JWT 调 API
- 移动端 APP：无 Cookie 场景
- 微服务间认证：服务间传递用户身份
- 单点登录（SSO）：一个令牌多系统通用
- 不适用：强依赖 Session 的 SSR 应用（用 Cookie+Session 更合适）、需要主动登出（JWT 难撤销）

## 代码示例

JWT 工具类（用 jjwt 库）：

\`\`\`java
package com.example.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtil {

    private final SecretKey key;
    private final long accessExp;
    private final long refreshExp;

    // @Value 注入配置，注意 \${} 是 Spring 占位符
    public JwtUtil(
        @Value("\${jwt.secret}") String secret,
        @Value("\${jwt.access-expiration:900000}") long accessExp,
        @Value("\${jwt.refresh-expiration:604800000}") long refreshExp
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessExp = accessExp;
        this.refreshExp = refreshExp;
    }

    // 签发 Access Token
    public String generateAccessToken(String username, List<String> roles) {
        return Jwts.builder()
            .subject(username)
            .claim("roles", roles)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + accessExp))
            .signWith(key)
            .compact();
    }

    // 签发 Refresh Token（不含角色，减少泄露风险）
    public String generateRefreshToken(String username) {
        return Jwts.builder()
            .subject(username)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + refreshExp))
            .signWith(key)
            .compact();
    }

    // 解析并验签
    public Claims parse(String token) {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public boolean isValid(String token) {
        try {
            parse(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
\`\`\`

JWT 认证过滤器：

\`\`\`java
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserDetailsService uds) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = uds;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain chain) throws IOException, ServletException {
        // 从 Authorization 头取 Bearer token
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }
        String token = header.substring(7);

        if (jwtUtil.isValid(token)) {
            Claims claims = jwtUtil.parse(token);
            String username = claims.getSubject();

            // 检查 SecurityContext 是否已有认证（避免重复）
            if (username != null
                && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails user = userDetailsService.loadUserByUsername(username);
                UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                        user, null, user.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        chain.doFilter(request, response);
    }
}
\`\`\`

无状态安全配置：

\`\`\`java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http, JwtUtil jwtUtil,
                                        UserDetailsService uds) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/auth/login", "/auth/refresh").permitAll()
            .anyRequest().authenticated()
        )
        .addFilterBefore(new JwtAuthenticationFilter(jwtUtil, uds),
                         UsernamePasswordAuthenticationFilter.class);
    return http.build();
}
\`\`\`

application.properties 配置：

\`\`\`properties
# JWT 密钥（生产用环境变量，至少 32 字节）
jwt.secret=mySecretKeyThatIsAtLeast32BytesLongForHS256
jwt.access-expiration=900000
jwt.refresh-expiration=604800000
\`\`\`

逐行解析：\`@Value("\${jwt.secret}")\` 注入配置（注意 \${} 转义）；\`Keys.hmacShaKeyFor\` 生成 HS256 密钥；\`Jwts.builder().subject().claim().signWith().compact()\` 链式签发；\`exp\` 过期时间是核心防线；\`OncePerRequestFilter\` 保证每请求一次；\`header.startsWith("Bearer ")\` 解析 Bearer 头；\`SecurityContextHolder.getContext().getAuthentication() == null\` 避免重复认证；\`SessionCreationPolicy.STATELESS\` 完全无状态；\`addFilterBefore\` 把 JWT 过滤器插在表单登录前。

## 对比分析

| 维度 | Session+Cookie | JWT |
| --- | --- | --- |
| 状态 | 服务器存 | 无状态 |
| 存储 | 服务器内存/Redis | 客户端 |
| 扩展 | 需共享 Session | 任意节点验签 |
| 撤销 | 删 Session 即可 | 难（需黑名单） |
| 跨域 | Cookie 限制 | 头携带无限制 |
| 移动端 | 不友好 | 友好 |
| 大小 | Session ID 小 | JWT 较大 |

| 维度 | Access Token | Refresh Token |
| --- | --- | --- |
| 有效期 | 短（15 分钟） | 长（7 天） |
| 用途 | 调 API | 换新 Access |
| 携带 | 每请求 | 偶尔 |
| 泄露风险 | 低（短） | 中 |

| 维度 | HS256（对称） | RS256（非对称） |
| --- | --- | --- |
| 密钥 | 单密钥 | 公私钥对 |
| 签发 | 同密钥签 | 私钥签 |
| 验证 | 同密钥验 | 公钥验 |
| 适用 | 单服务 | 多服务（认证中心签，其他验） |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| Payload 放密码 | Base64 可解码 | 只放必要声明 |
| 不设过期时间 | 令牌永久有效 | 必设 exp |
| 密钥太短 | HS256 要 32 字节 | 用足够长随机串 |
| 密钥硬编码 | 泄露风险 | 用环境变量 |
| 没法主动登出 | 无状态难撤销 | 维护黑名单或缩短 exp |
| Token 存 localStorage | XSS 偷走 | 存 HttpOnly Cookie 或加 CSP |
| 不验签直接用 | 篡改风险 | 必须验签 |
| 多服务共用 HS256 密钥 | 密钥扩散 | 用 RS256 公私钥 |
`,
  },

  // =============================================================
  // 第四十八章:OAuth2 与方法级安全
  // =============================================================
  {
    id: "jw-48",
    group: "Spring Security 认证",
    icon: "🛡️",
    title: "OAuth2 与方法级安全",
    content: `# OAuth2 与方法级安全

## 概念解释

OAuth2 是**授权框架**（RFC 6749），解决「让第三方应用在不拿到你密码的前提下，访问你在某服务上的资源」。典型场景：用 GitHub 账号登录第三方网站、用微信扫码登录 APP。注意 OAuth2 是授权不是认证——但实践中常借它做登录（OpenID Connect 在 OAuth2 上扩展做认证）。

OAuth2 的四个角色：
- **资源拥有者（Resource Owner）**：你，能授权访问自己资源的人。
- **客户端（Client）**：第三方应用，想访问你的资源。
- **授权服务器（Authorization Server）**：颁发令牌的服务（如 GitHub）。
- **资源服务器（Resource Server）**：托管资源并接受令牌（如 GitHub API）。

四种授权模式：**授权码模式（Authorization Code）**最常用、最安全，适合有服务端的应用；**隐式模式**已不推荐（被 PKCE 替代）；**密码模式**仅信任客户端才用；**客户端凭证模式**用于服务间通信。授权码模式流程：用户点「用 GitHub 登录」→ 跳 GitHub 授权页 → 用户同意 → GitHub 回调带 code → 后端用 code 换 token → 用 token 调 API 取用户信息。

Spring Security 对 OAuth2 提供完整支持：\`spring-boot-starter-oauth2-client\`（做客户端，集成第三方登录）、\`spring-boot-starter-oauth2-resource-server\`（做资源服务器，验证 JWT 令牌）。

## 设计原理

授权码模式引入 \`code\` 中间层是出于安全考虑：直接在前端拿 token 会被恶意脚本截获。后端用 code + clientSecret 换 token，整个过程在后端完成，token 不暴露给前端浏览器。PKCE（Proof Key for Code Exchange）进一步保护公开客户端（SPA/移动端无后端），用动态 challenge 替代 clientSecret。

Spring Security OAuth2 Client 的设计：配置 \`ClientRegistration\`（含 clientId、clientSecret、授权端点、token 端点、用户信息端点），框架自动处理跳转、回调、换 token、取用户信息全流程。开发者只需配 \`application.yml\` + 一个 \`SecurityFilterChain\` 即可集成 GitHub/Google 登录。

\`OAuth2LoginAuthenticationFilter\` 拦截登录回调，自动完成 code → token → userInfo 流程，成功后构造 \`OAuth2AuthenticationToken\` 存入 \`SecurityContext\`，\`@RegisteredOAuth2AuthorizedClient\` 注解可拿到令牌调 API。

资源服务器模式：Spring Security 用 \`oauth2ResourceServer().jwt()\` 配置，自动解析 \`Authorization: Bearer <jwt>\` 头，验签后构造 \`Authentication\`。配合 JWT 与 JWK（JSON Web Key）端点，资源服务器用公钥验签，授权服务器用私钥签发。

## 使用场景

- 第三方登录：GitHub/Google/微信登录
- SSO 单点登录：一套账号多系统
- 微服务资源服务器：API 验 JWT
- 服务间通信：客户端凭证模式
- 不适用：纯内部可信网络（直接调）、简单登录（用本地账号密码更快）

## 代码示例

OAuth2 客户端配置（GitHub 登录）：

\`\`\`java
@Configuration
@EnableWebSecurity
public class OAuth2ClientConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/login", "/error").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth -> oauth
                .loginPage("/login")
                .defaultSuccessUrl("/home", true)
                .userInfoEndpoint(ui -> ui
                    .userService(new CustomOAuth2UserService())   // 自定义取用户信息
                )
            )
            .logout(logout -> logout
                .logoutSuccessUrl("/")
            );
        return http.build();
    }
}
\`\`\`

application.yml 配置：

\`\`\`yaml
spring:
  security:
    oauth2:
      client:
        registration:
          github:
            client-id: \${GITHUB_CLIENT_ID}
            client-secret: \${GITHUB_CLIENT_SECRET}
            scope: read:user, user:email
          google:
            client-id: \${GOOGLE_CLIENT_ID}
            client-secret: \${GOOGLE_CLIENT_SECRET}
            scope: profile, email
\`\`\`

获取第三方用户信息：

\`\`\`java
@GetMapping("/user")
public Map<String, Object> user(@AuthenticationPrincipal OAuth2User principal) {
    return principal.getAttributes();
    // GitHub: {login=alice, id=123, name=Alice, email=...}
    // Google: {sub=123, name=Alice, email=alice@...}
}
\`\`\`

资源服务器配置（验 JWT）：

\`\`\`java
@Configuration
@EnableWebSecurity
public class ResourceServerConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/public/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth -> oauth
                .jwt(Customizer.withDefaults())   // 默认从 Authorization 头解析
            );
        return http.build();
    }
}
\`\`\`

资源服务器 application.yml（从 JWK 端点取公钥）：

\`\`\`yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          jwk-set-uri: https://auth.example.com/.well-known/jwks.json
\`\`\`

方法级安全进阶：

\`\`\`java
@Configuration
@EnableMethodSecurity
public class MethodSecurityConfig {

    // 自定义权限检查方法，可在 @PreAuthorize 调用
    @Bean
    public MethodSecurityExpressionHandler methodSecurityExpressionHandler(
            PermissionEvaluator evaluator) {
        DefaultMethodSecurityExpressionHandler handler =
            new DefaultMethodSecurityExpressionHandler();
        handler.setPermissionEvaluator(evaluator);
        return handler;
    }
}

@Component("articleSecurity")
public class ArticleSecurity {

    // @PreAuthorize 调用：@articleSecurity.isOwner(#id, authentication)
    public boolean isOwner(Long articleId, Authentication auth) {
        String username = auth.getName();
        return articleService.isOwner(articleId, username);
    }
}

@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    @PreAuthorize("@articleSecurity.isOwner(#id, authentication)")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        articleService.delete(id);
    }
}
\`\`\`

逐行解析：\`oauth2Login\` 开启第三方登录；\`userInfoEndpoint.userService\` 自定义取用户信息；\`@AuthenticationPrincipal OAuth2User\` 注入第三方用户；\`oauth2ResourceServer().jwt()\` 资源服务器验 JWT；\`jwk-set-uri\` 公钥端点；\`@EnableMethodSecurity\` 开方法安全；\`@Component("articleSecurity")\` 注册为 SpEL 可调用 Bean；\`@PreAuthorize("@articleSecurity.isOwner(#id, authentication)")\` 调用自定义权限检查。

## 对比分析

| 维度 | OAuth2 授权码模式 | 隐式模式 | 密码模式 |
| --- | --- | --- | --- |
| 安全性 | 高 | 低 | 中 |
| 后端 | 需要 | 不需要 | 需要 |
| 适用 | Web 服务端 | SPA（已用 PKCE 替代） | 信任客户端 |
| Token 暴露 | 否 | 是（前端） | 否 |

| 维度 | OAuth2 Client | OAuth2 Resource Server |
| --- | --- | --- |
| 角色 | 第三方登录客户端 | API 资源服务器 |
| 功能 | 跳转取 token 调 API | 验 token 保护 API |
| 依赖 | oauth2-client | oauth2-resource-server |
| 场景 | 接入 GitHub 登录 | 微服务验 JWT |

| 维度 | @PreAuthorize 内置表达式 | 自定义 SpEL Bean |
| --- | --- | --- |
| 灵活性 | 中 | 高 |
| 复用 | 框架提供 | 自定义业务权限 |
| 例 | hasRole | @articleSecurity.isOwner |
| 适用 | 角色级 | 资源所有者级 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| clientSecret 写代码里 | 泄露 | 用环境变量 |
| 回调 URL 配错 | OAuth2 流程断 | 精确配 redirect-uri |
| scope 太宽 | 权限过大 | 最小化 scope |
| 不验 state | CSRF 攻击 | 启用 state 校验 |
| 第三方用户直接登录 | 无账号关联 | 首次登录绑定本地账号 |
| 资源服务器不验签 | 伪造令牌 | 配 jwk-set-uri 验签 |
| 自定义权限方法抛异常 | 500 错误 | 方法内 try-catch 返回 false |
| 多 OAuth2 Provider 用户冲突 | 同邮箱不同平台 | 用 provider+openid 唯一标识 |
`,
  },
];
