// =============================================================
// Java Web 应用开发实战教程 —— 第六批章节
// 分组:Spring Framework 核心(共 4 章)
// -------------------------------------------------------------
// 本文件包含以下章节:
//   jw-21: Spring 概述与 IoC 容器
//   jw-22: Bean 配置与依赖注入
//   jw-23: AOP 面向切面编程
//   jw-24: Spring 事务管理
//
// 转义约定:content 为反引号模板字符串,内部反引号已转义为 \`,
//          三反引号已转义为 \`\`\`,${ 序列已转义为 \${。
// =============================================================

export const chapters = [
  // =========================================================
  // jw-21:Spring 概述与 IoC 容器
  // =========================================================
  {
    id: "jw-21",
    group: "Spring Framework 核心",
    icon: "🌱",
    title: "Spring 概述与 IoC 容器",
    content: `# Spring 概述与 IoC 容器

## 概念解释

### Spring 是什么

**Spring** 是 Java 企业级开发最主流的应用框架,由 Rod Johnson 在 2002 年的著作《Expert One-on-One J2EE Design and Development》中提出,2003 年正式开源。Spring 的核心价值不是提供具体功能(如 Web、数据库),而是提供一套**管理对象及其依赖关系的基础设施**,让业务代码保持简洁的 POJO 风格。

Spring 生态包含多个子项目:Spring Framework(核心框架)、Spring Boot(快速开发)、Spring MVC(Web)、Spring Data(数据访问)、Spring Security(安全)、Spring Cloud(微服务)等。我们常说的"Spring"狭义指 Spring Framework。

### IoC 控制反转

**IoC(Inversion of Control,控制反转)** 是 Spring 最核心的设计思想。传统编程中,对象自己 \`new\` 它依赖的对象(\`UserService\` 里 \`new UserDaoImpl()\`),导致强耦合。IoC 把这个"创建和注入依赖"的控制权反转给**容器(Container)**——对象只声明"我需要什么",容器负责创建依赖并注入。

IoC 的好处:解耦(面向接口编程,换实现不改业务代码)、可测试(单测注入 Mock 对象)、集中管理(对象创建组装集中在容器一处)。

### IoC 容器

Spring 的容器有两个核心接口:

- **\`BeanFactory\`**:最基础容器,提供 \`getBean()\` 等基本功能,**懒加载**(用到 Bean 时才创建)。
- **\`ApplicationContext\`**:BeanFactory 的子接口,功能更全——**预加载**(启动时创建所有单例 Bean)、支持事件、国际化、资源加载。

实际开发中只用 \`ApplicationContext\`(如 \`AnnotationConfigApplicationContext\`),\`BeanFactory\` 只在内存极度受限的嵌入式场景用。

容器启动时做三件事:**扫描**(发现带 \`@Component\` 等注解的类)→ **实例化**(调用构造方法创建对象)→ **装配**(根据依赖关系注入 Bean)。

### stereotype 注解

| 注解 | 用途 | 语义 |
| --- | --- | --- |
| \`@Component\` | 通用组件 | 任何 Spring Bean |
| \`@Service\` | 业务逻辑层 | 标记 Service 层 |
| \`@Repository\` | 数据访问层 | 标记 DAO,额外提供异常转换 |
| \`@Controller\` | 表现层 | 标记控制器,处理 Web 请求 |

\`@Repository\` 的额外能力是**异常转换**:把 Hibernate/JPA 的原生异常转成 Spring 统一的 \`DataAccessException\` 体系。

## 设计原理

### 1. 依赖倒置原则(DIP)

IoC 是依赖倒置原则的工程实现。高层模块(UserService)不依赖低层模块(UserDaoImpl),二者都依赖抽象(UserDao 接口)。抽象不依赖细节,细节依赖抽象。这让低层实现可替换,高层稳定。

### 2. 好莱坞原则(Don't call us, we'll call you)

IoC 的别名。对象不要主动去找依赖,容器会主动把依赖塞给你。这种"被动接收"的编程模型让对象解耦于环境。

### 3. 面向接口编程

注入的对象声明为接口类型而非具体实现。容器注入任何实现都能工作,业务代码不绑定具体类。这是可测试、可替换的根基。

### 4. 单一职责的容器

容器只负责"创建和装配对象",不掺业务逻辑。业务对象本身是 POJO,不依赖 Spring API(除注解外)。这让业务对象可脱离 Spring 独立测试和使用。

## 使用场景

**场景一:声明一个 Service**——用 \`@Service\` 标记,构造器注入依赖。

**场景二:多环境配置切换**——用 \`@Profile\` 标注 Bean,运行时激活对应 profile,实现 dev/test/prod 配置隔离。

**场景三:配置第三方库 Bean**——第三方库的类改不了源码,用 \`@Configuration\` + \`@Bean\` 在 Java 代码里手动声明(如 DataSource、RestTemplate)。

**不适用场景**:脚本类一次性任务、极简命令行工具——这些场景用 Spring 容器太重,直接 \`new\` 对象即可。

## 代码示例

\`\`\`java
// 1. 接口定义
public interface UserDao {
    User findById(Long id);
}

// 2. 实现类,用 @Repository 标记为 Bean
@Repository
public class UserDaoImpl implements UserDao {
    @Override
    public User findById(Long id) {
        return new User(id, "Alice");  // 实际查数据库
    }
}

// 3. 业务类,用 @Service 标记,构造器注入 userDao
@Service
public class UserService {
    private final UserDao userDao;   // final 保证不可变

    // 构造器注入:Spring 自动找 UserDao 类型的 Bean 传入
    // 单一构造器时 @Autowired 可省略,但写上更明确
    @Autowired
    public UserService(UserDao userDao) {
        this.userDao = userDao;
    }

    public User getUser(Long id) {
        return userDao.findById(id);
    }
}

// 4. 配置类,开启组件扫描
@Configuration
@ComponentScan(basePackages = "com.example")  // 扫描该包下的 @Component/@Service 等
public class AppConfig {
    // 也可在这里用 @Bean 声明第三方库的对象
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

// 5. 启动容器并使用
public class Main {
    public static void main(String[] args) {
        // 创建注解配置的容器
        AnnotationConfigApplicationContext ctx =
            new AnnotationConfigApplicationContext(AppConfig.class);

        // 从容器获取 Bean(实际开发中通过注入获取,不手动 getBean)
        UserService userService = ctx.getBean(UserService.class);
        User user = userService.getUser(1L);
        System.out.println(user);

        ctx.close();
    }
}
\`\`\`

逐行说明:\`@Repository\` 标记 \`UserDaoImpl\` 为 Bean,Bean 名默认是类名首字母小写;\`@Service\` 标记 \`UserService\` 为 Bean;\`private final\` + 构造器注入是 Spring 推荐写法,保证依赖不可变;\`@Configuration\` 标记配置类,\`@ComponentScan\` 开启组件扫描让 Spring 自动发现带 stereotype 注解的类;\`@Bean\` 方法声明第三方库的 Bean;\`AnnotationConfigApplicationContext\` 基于注解配置创建容器。

## 对比分析

### BeanFactory vs ApplicationContext

| 维度 | BeanFactory | ApplicationContext |
| --- | --- | --- |
| 加载时机 | 懒加载(用时才创建) | 预加载(启动时创建所有单例) |
| 功能 | 基础 Bean 管理 | 事件、国际化、AOP、资源加载 |
| 适用 | 内存受限嵌入式 | 企业应用(99% 场景) |
| 启动速度 | 快(不创建 Bean) | 慢(要创建所有单例) |
| 错误发现 | 运行时才发现 Bean 问题 | 启动时就能发现配置错误 |

### stereotype 注解对比

| 注解 | 来源 | 用途 | 额外能力 |
| --- | --- | --- | --- |
| @Component | 通用 | 任何 Bean | - |
| @Service | 业务层 | Service 类 | - |
| @Repository | 数据层 | DAO 类 | 异常转换 |
| @Controller | 表现层 | 控制器 | 处理 Web 请求 |

### IoC vs 传统 new

| 维度 | 传统 new | IoC 容器 |
| --- | --- | --- |
| 依赖创建 | 对象自己 new | 容器创建注入 |
| 耦合度 | 强(绑定具体类) | 弱(面向接口) |
| 可测试性 | 差(需 mock 整个环境) | 好(注入 Mock 即可) |
| 配置灵活性 | 低(改代码) | 高(改配置/注解) |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| NoSuchBeanDefinitionException | 没扫描到或没加注解 | 检查 \`@ComponentScan\` 包路径,确认类上有 stereotype 注解 |
| NoUniqueBeanDefinitionException | 同类型多个 Bean 没指定 | 用 \`@Qualifier\` 指定名字,或给某个加 \`@Primary\` |
| 循环依赖报错 | A 依赖 B,B 依赖 A,构造器注入无法解 | 重构设计打破循环,或改用 setter 注入(不推荐) |
| Bean 名冲突 | 两个类同名或 @Bean 方法重名 | 显式命名 \`@Service("xxx")\` |
| 第三方类没法加注解 | 不是自己的代码 | 用 \`@Configuration + @Bean\` 在配置类里声明 |
| 包扫描漏 Bean | basePackages 字符串拼错 | 用 \`basePackageClasses\` 引用标记类避免拼错 |
| 启动慢 | ApplicationContext 预加载所有 Bean | 用 \`@Lazy\` 延迟加载非必需 Bean |
`,
  },

  // =========================================================
  // jw-22:Bean 配置与依赖注入
  // =========================================================
  {
    id: "jw-22",
    group: "Spring Framework 核心",
    icon: "💉",
    title: "Bean 配置与依赖注入",
    content: `# Bean 配置与依赖注入

## 概念解释

**DI(Dependency Injection,依赖注入)** 是 IoC 的具体实现方式——容器把依赖"注入"到对象里。Spring 支持三种注入方式,以及 XML、注解、Java Config 三种配置方式。

### 三种注入方式

#### 1. 构造器注入(推荐)

\`\`\`java
@Service
public class UserService {
    private final UserDao userDao;

    // 通过构造方法传入依赖
    // @Autowired 在单一构造器时可省略
    public UserService(UserDao userDao) {
        this.userDao = userDao;
    }
}
\`\`\`

依赖不可变(\`final\`)、不会出现"对象已创建但依赖还没注入"的中间状态、单元测试时直接 new 传入 Mock 即可。Spring 官方推荐。

#### 2. Setter 注入

\`\`\`java
@Service
public class UserService {
    private UserDao userDao;

    @Autowired
    public void setUserDao(UserDao userDao) {
        this.userDao = userDao;
    }
}
\`\`\`

灵活,可选依赖;可重新注入。缺点:依赖可变、可能为 null。

#### 3. 字段注入(不推荐)

\`\`\`java
@Service
public class UserService {
    @Autowired
    private UserDao userDao;
}
\`\`\`

缺点:依赖不可变(没法 final)、无法脱离容器测试(单测时没法手动注入)、隐藏依赖关系。只在快速原型时用。

### 三种配置方式

1. **XML 配置**(Spring 1.x):所有 Bean 写在 XML 里,啰嗦但集中。
2. **注解配置**(Spring 2.5+):\`@Component\`、\`@Autowired\` 等注解,组件扫描自动发现 Bean。
3. **Java Config**(Spring 3.0+):\`@Configuration\` + \`@Bean\`,用 Java 代码代替 XML,类型安全。**当前主流推荐。**

### @Autowired / @Qualifier / @Resource

\`@Autowired\` 按**类型**匹配。同类型多个 Bean 时报 \`NoUniqueBeanDefinitionException\`,用 \`@Qualifier\` 指定名字。\`@Resource\` 是 JSR-250 标准,按**名字**匹配。

### @Value 读取配置

\`\`\`java
@Value("\${app.name:default}")   // 冒号后是默认值
private String appName;
\`\`\`

\`\${app.name:default}\` 表示读 \`app.name\` 属性,没有则用 \`default\`。

## 设计原理

### 1. 构造器注入优先

Spring 官方文档明确推荐构造器注入。理由:依赖不可变(线程安全)、强制必需依赖(不传编译不过)、避免循环依赖(启动时暴露设计问题)、单元测试友好。

### 2. 配置与代码分离

\`@Value\` 读取外部配置文件,把易变的配置(数据库地址、超时时间)从代码抽离。改配置不用重新编译,部署时换 \`application.properties\` 即可。

### 3. 类型安全的 Java Config

Java Config 用 Java 代码写配置,编译期就能发现类型错误。XML 是字符串,拼错了运行时才报错。Java Config 还能用 IDE 重构、跳转。

### 4. 环境隔离

dev/test/prod 不同环境用 \`@Profile\` 隔离,避免"在代码里 if 判断环境"的丑陋写法。每个环境一套配置,运行时激活对应 profile。

## 使用场景

**场景一:多个实现选择**——同接口有多个实现时用 \`@Qualifier\` 指定注入哪个。

\`\`\`java
@Repository("mysqlUserDao")
public class MySqlUserDao implements UserDao { ... }

@Repository("mongoUserDao")
public class MongoUserDao implements UserDao { ... }

@Service
public class UserService {
    public UserService(@Qualifier("mysqlUserDao") UserDao userDao) { ... }
}
\`\`\`

**场景二:读取配置文件**——\`@PropertySource\` 加载 properties,\`@Value\` 注入值。

**场景三:多环境配置**——\`@Profile\` 标注 Bean 只在特定环境生效,\`-Dspring.profiles.active=prod\` 激活。

**场景四:条件装配**——\`@Conditional\` 根据任意条件决定是否装配 Bean,Spring Boot 自动配置的核心机制。

## 代码示例

\`\`\`java
import org.springframework.context.annotation.*;
import org.springframework.beans.factory.annotation.Value;

// 配置类:等价 XML 的 <beans>
@Configuration
// 扫描 com.example 包下的 @Component/@Service/@Repository
@ComponentScan(basePackages = "com.example")
// 加载 properties 配置文件
@PropertySource("classpath:app.properties")
// 导入其他配置类,组合
@Import(DataSourceConfig.class)
public class AppConfig {

    // 从 properties 读取值,注入字段
    @Value("\${app.name}")
    private String appName;

    // 声明一个 Bean,方法名 helloService 即 Bean 名
    @Bean
    public HelloService helloService() {
        return new HelloService(appName);
    }

    // 条件装配:只在 demo profile 时生效
    @Bean
    @Profile("demo")
    public DemoBean demoBean() {
        return new DemoBean();
    }

    // 必须提供这个 Bean 才能让 @Value 解析占位符 \${}
    @Bean
    public static PropertySourcesPlaceholderConfigurer placeholderConfigurer() {
        return new PropertySourcesPlaceholderConfigurer();
    }
}
\`\`\`

配套的 \`app.properties\`:

\`\`\`properties
# 数据库配置
db.url=jdbc:mysql://localhost:3306/mydb
db.username=root
db.password=123456

# 应用配置
app.name=MyApp
app.timeout=5000
\`\`\`

逐行说明:\`@Configuration\` 标记配置类,Spring 用 CGLIB 增强它保证 \`@Bean\` 方法返回单例;\`@ComponentScan\` 开启组件扫描;\`@PropertySource\` 加载配置文件到 Environment;\`@Import\` 组合其他配置类;\`@Value("\${app.name}")\` 读取配置项注入;\`@Profile("demo")\` 标注 Bean 只在 demo profile 激活时装配;\`PropertySourcesPlaceholderConfigurer\` 必须声明为 Bean 才能解析 \`\${}\` 占位符(传统 Spring 需手动加,Spring Boot 自动配置)。

## 对比分析

### 三种注入方式对比

| 维度 | 构造器注入 | Setter 注入 | 字段注入 |
| --- | --- | --- | --- |
| 不可变性 | 可 final | 不可 final | 不可 final |
| 强制依赖 | 强制(必传) | 可选(不调 setter 为 null) | 强制 |
| 可测试性 | 好(new 时传入) | 中(需调 setter) | 差(需反射) |
| Spring 推荐 | ✅ 首选 | 可选依赖时用 | ❌ 不推荐 |
| 循环依赖 | 启动时报错(暴露问题) | 能解决部分循环 | 能解决但隐藏问题 |

### 三种配置方式对比

| 维度 | XML 配置 | 注解配置 | Java Config |
| --- | --- | --- | --- |
| 配置位置 | XML 文件 | 类上的注解 | 配置类的 @Bean 方法 |
| 类型安全 | 弱(字符串) | 中 | 强(编译期检查) |
| 可读性 | 啰嗦但集中 | 简洁分散 | 清晰集中 |
| IDE 重构 | 难 | 中 | 好 |
| 复杂逻辑 | 难写 | 不适合 | 适合 |
| 推荐度 | 维护老系统 | 标注自有类 | ✅ 主流推荐 |

### @Autowired vs @Resource

| 维度 | @Autowired | @Resource |
| --- | --- | --- |
| 来源 | Spring 自带 | JSR-250 标准 |
| 匹配方式 | 按类型,配合 @Qualifier 按名字 | 按名字,找不到再按类型 |
| 推荐度 | Spring 项目首选 | 需要标准注解时用 |

### @Profile vs @Conditional

| 维度 | @Profile | @Conditional |
| --- | --- | --- |
| 触发条件 | 环境名 | 任意条件(类存在、Bean 存在、属性等) |
| 灵活度 | 低(只判环境) | 高(自定义 Condition) |
| Spring Boot 用 | 简单环境隔离 | 自动配置的核心机制 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 字段注入后单测困难 | @Autowired 私有字段没法手动注入 | 改用构造器注入 |
| @Value 注入 null | 没配 \`PropertySourcesPlaceholderConfigurer\` | Spring Boot 自动有,传统 Spring 需手动声明 |
| @Value 不解析占位符 | 缺占位符解析器 Bean | 加 \`static PropertySourcesPlaceholderConfigurer\` |
| @Profile 没生效 | 没激活对应 profile | 加 \`-Dspring.profiles.active=xxx\` |
| Java Config 里 @Bean 方法互相调 | 担心多次调用不返回同一实例 | 配置类被 CGLIB 增强,需 \`@Configuration\`(不是 \`@Component\`)才保证单例 |
| @PropertySource 文件找不到 | 路径错或没在 classpath | 用 \`classpath:app.properties\` 前缀,确认文件在 resources 下 |
| @Value 用在静态字段 | 静态字段注入不生效 | 改用实例字段,或 setter 注入 |
| XML 和注解混用冲突 | 同一 Bean 被声明两次 | 统一用一种方式,或用 \`@Primary\` 区分 |
`,
  },

  // =========================================================
  // jw-23:AOP 面向切面编程
  // =========================================================
  {
    id: "jw-23",
    group: "Spring Framework 核心",
    icon: "✂️",
    title: "AOP 面向切面编程",
    content: `# AOP 面向切面编程

## 概念解释

### 为什么需要 AOP

考虑一个常见场景:每个 Service 方法都需要日志、事务、权限校验。传统写法是在每个方法里都写一遍这些样板代码,导致**横切关注点(Cross-cutting Concerns)**散落在每个业务方法里,代码重复、维护困难。

**AOP(Aspect-Oriented Programming,面向切面编程)** 把这些横切逻辑抽取到一个**切面(Aspect)** 里,通过配置"在哪些方法上执行",业务方法只写纯业务逻辑。日志、事务、权限由切面在方法执行前后自动织入。

### AOP 核心概念

| 术语 | 含义 | 例子 |
| --- | --- | --- |
| **切面 Aspect** | 横切逻辑的模块化,一个类 | LogAspect(日志切面) |
| **连接点 JoinPoint** | 程序执行中可插入的点,Spring 中是方法调用 | UserService.createUser() |
| **切入点 Pointcut** | 切面要作用哪些连接点的规则 | \`execution(* com.example.service.*.*(..))\` |
| **通知 Advice** | 切面在连接点上要做的动作 | @Before(方法前打日志) |
| **织入 Weaving** | 把切面应用到目标对象的过程 | Spring 运行时用动态代理织入 |
| **目标对象 Target** | 被织入切面的原始对象 | UserService 实例 |
| **代理 Proxy** | 织入后产生的对象 | JdkDynamicProxy 或 CglibProxy |

记忆:**切面 = 通知 + 切入点**。

### 五种通知(Advice)

| 通知 | 注解 | 执行时机 | 能改变流程 |
| --- | --- | --- | --- |
| 前置 | \`@Before\` | 方法执行前 | 否(除非抛异常) |
| 后置(最终) | \`@After\` | 方法执行后(无论成功失败) | 否 |
| 返回 | \`@AfterReturning\` | 方法成功返回后 | 否 |
| 异常 | \`@AfterThrowing\` | 方法抛异常后 | 否 |
| 环绕 | \`@Around\` | 包裹整个方法 | 能(决定是否执行、改返回值) |

执行顺序(正常): \`@Around(前) → @Before → 目标方法 → @AfterReturning → @After → @Around(后)\`

\`@Around\` 最强大——它包裹整个方法,可决定是否执行、改参数、改返回值。事务管理就是用 \`@Around\` 实现的。

### 切入点表达式 execution()

\`\`\`
execution(修饰符? 返回类型 包名.类名.方法名(参数类型) 异常?)
\`\`\`

常用例子:\`execution(* com.example.service.*.*(..))\` 匹配 service 包下所有方法;\`@annotation(com.example.Log)\` 匹配标了 \`@Log\` 注解的方法。

### 实现原理:JDK 动态代理 vs CGLIB

- **JDK 动态代理**:基于接口,目标类必须实现接口。Spring 用 \`Proxy.newProxyInstance()\` 生成代理。
- **CGLIB 代理**:基于继承,生成目标类的子类。不要求目标有接口,但 final 类/方法不能代理。

Spring 选择逻辑:有接口默认用 JDK 代理,无接口用 CGLIB;可强制用 CGLIB(\`@EnableAspectJAutoProxy(proxyTargetClass = true)\`)。

## 设计原理

### 1. 横切关注点分离

AOP 的根本目的是把日志、事务、安全、缓存这些横切在多个业务模块的逻辑抽取到一处。遵循单一职责原则——业务类只管业务,横切逻辑在切面里。

### 2. 声明式优于编程式

通过注解声明"在哪里做什么",而非在每个方法里手写。声明式让横切逻辑集中、可配置、可复用,业务代码不被侵入。

### 3. 代理透明

业务代码不知道自己被代理了——调 \`userService.createUser()\` 实际调的是代理对象,但感知不到。代理在幕后织入横切逻辑,对业务透明。

### 4. 最小侵入

AOP 让业务类保持 POJO——不知道日志、事务的存在。换日志实现、关掉某个切面,业务代码一行不改。

## 使用场景

**场景一:日志切面**——\`@Before\` 记录方法调用,\`@AfterReturning\` 记录返回值。

**场景二:性能监控(环绕通知)**——\`@Around\` 包裹方法,计算耗时,慢查询告警。

**场景三:自定义注解 + 切面**——定义 \`@Loggable\` 注解,切面只对标了该注解的方法生效,实现精细化控制。

**场景四:事务管理**——Spring 的 \`@Transactional\` 底层就是 AOP,在方法前后自动开启/提交/回滚事务。

**不适用场景**:业务逻辑本身(那是 OOP 的事)、简单的单次调用(没必要加切面)。

## 代码示例

\`\`\`java
import org.aspectj.lang.annotation.*;
import org.aspectj.lang.ProceedingJoinPoint;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

// 1. 业务类
@Service
public class UserService {
    public String findUser(Long id) {
        System.out.println("  执行业务:查找用户 " + id);
        return "User-" + id;
    }
}

// 2. 切面
@Aspect          // 声明为切面
@Component       // 注册为 Bean,让 Spring 扫描
public class UserServiceAspect {

    // 切入点:UserService 的所有方法
    @Pointcut("execution(* com.example.UserService.*(..))")
    public void userServiceMethods() {}

    // 前置通知:方法执行前
    @Before("userServiceMethods()")
    public void before(JoinPoint jp) {
        System.out.println("@Before: " + jp.getSignature());
    }

    // 返回通知:方法正常返回后
    @AfterReturning(pointcut = "userServiceMethods()", returning = "ret")
    public void afterReturning(JoinPoint jp, Object ret) {
        System.out.println("@AfterReturning: " + jp.getSignature() + " 返回 " + ret);
    }

    // 异常通知:方法抛异常后
    @AfterThrowing(pointcut = "userServiceMethods()", throwing = "ex")
    public void afterThrowing(JoinPoint jp, Exception ex) {
        System.out.println("@AfterThrowing: " + jp.getSignature() + " 异常 " + ex.getMessage());
    }

    // 后置通知:方法执行后(无论成功失败)
    @After("userServiceMethods()")
    public void after(JoinPoint jp) {
        System.out.println("@After: " + jp.getSignature());
    }

    // 环绕通知:包裹整个方法
    @Around("userServiceMethods()")
    public Object around(ProceedingJoinPoint pjp) throws Throwable {
        System.out.println("@Around: 进入环绕");
        Object result;
        try {
            result = pjp.proceed();          // 执行目标方法
        } catch (Throwable t) {
            System.out.println("@Around: 捕获异常");
            throw t;
        }
        System.out.println("@Around: 退出环绕");
        return result;
    }
}

// 3. 启用 AOP(Spring Boot 自动开启,传统 Spring 需手动)
@Configuration
@EnableAspectJAutoProxy   // 开启 AspectJ 注解驱动的 AOP
@ComponentScan
public class AppConfig {}
\`\`\`

逐行说明:\`@Aspect\` 标记切面类,需配合 \`@Component\` 让 Spring 管理;\`@Pointcut\` 定义切入点,是一个空方法仅作为表达式载体;\`@Before\` 引用切入点,\`JoinPoint\` 参数拿方法签名和参数;\`@AfterReturning(returning = "ret")\` 绑定返回值;\`@AfterThrowing(throwing = "ex")\` 绑定异常;\`@Around + ProceedingJoinPoint\` 最强大,\`pjp.proceed()\` 执行目标方法;\`@EnableAspectJAutoProxy\` 开启注解驱动 AOP。

## 对比分析

### 五种通知对比

| 通知 | 注解 | 时机 | 能拦截执行 | 能改返回值 | 典型用途 |
| --- | --- | --- | --- | --- | --- |
| 前置 | @Before | 方法前 | 否 | 否 | 权限校验、参数日志 |
| 后置 | @After | 方法后(finally) | 否 | 否 | 资源清理 |
| 返回 | @AfterReturning | 成功返回后 | 否 | 否 | 记录结果 |
| 异常 | @AfterThrowing | 抛异常后 | 否 | 否 | 异常上报 |
| 环绕 | @Around | 包裹全程 | 是 | 是 | 事务、性能监控、缓存 |

### JDK 代理 vs CGLIB 对比

| 维度 | JDK 动态代理 | CGLIB |
| --- | --- | --- |
| 基础 | 接口 | 继承(生成子类) |
| 要求 | 目标必须实现接口 | 不需要接口 |
| final 方法 | 不影响 | 不能代理 |
| final 类 | 不影响 | 不能代理 |
| 性能 | 创建快,调用稍慢 | 创建慢,调用快 |
| Spring 默认 | 有接口时用 | 无接口时用 |

### AOP vs OOP

| 维度 | OOP | AOP |
| --- | --- | --- |
| 关注点 | 业务逻辑 | 横切关注点 |
| 单元 | 类/对象 | 切面 |
| 解决问题 | 业务建模 | 横切逻辑抽取 |
| 关系 | 主体 | 补充 OOP |

### 拦截器(Interceptor)vs 过滤器(Filter)vs 切面(Aspect)

| 维度 | Filter | Interceptor | Aspect |
| --- | --- | --- | --- |
| 所属 | Servlet 规范 | Spring MVC | Spring AOP |
| 作用层 | 请求/响应 | Controller 前后 | 任意 Bean 方法 |
| 粒度 | HTTP 请求 | Controller 调用 | 方法级 |
| 典型用途 | 编码、安全头 | 登录校验、日志 | 事务、缓存 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 同类内部调用切面不生效 | 调的是 this.xxx(),没走代理 | 通过 \`AopContext.currentProxy()\` 或注入自身代理 |
| private 方法切面不生效 | 动态代理只能代理 public/protected | 改 public,或用 AspectJ 编译时织入 |
| final 类/方法不能代理 | CGLIB 不能继承 final | 去掉 final 或用接口 |
| 切入点表达式写错 | 包名拼错,匹配不上 | 用 \`@annotation\` 或调试输出 |
| 循环依赖 + 代理冲突 | A 依赖 B,B 依赖 A,且都需要代理 | 用 \`@EnableAspectJAutoProxy(exposeProxy = true)\` |
| @Around 忘记调 proceed | 目标方法没执行 | 必须调 \`pjp.proceed()\` |
| @Around 不返回结果 | 调用方拿到 null | \`return pjp.proceed()\` |
| 同时多个切面顺序乱 | 默认按字母序 | 实现 \`@Order\` 显式控制顺序 |
`,
  },

  // =========================================================
  // jw-24:Spring 事务管理
  // =========================================================
  {
    id: "jw-24",
    group: "Spring Framework 核心",
    icon: "💰",
    title: "Spring 事务管理",
    content: `# Spring 事务管理

## 概念解释

### 事务的 ACID 特性

**事务(Transaction)** 是数据库操作的最小执行单元,满足四个特性:

- **原子性(Atomicity)**:事务内操作要么全部成功,要么全部回滚。
- **一致性(Consistency)**:事务前后数据状态一致(如转账后双方总额不变)。
- **隔离性(Isolation)**:并发事务之间互不干扰。
- **持久性(Durability)**:事务提交后数据永久保存。

### Spring 事务抽象

Spring 提供了统一的事务抽象层,屏蔽了不同数据访问技术(JDBC、Hibernate、JPA)的事务 API 差异。核心接口是 \`PlatformTransactionManager\`,不同技术有不同实现:\`DataSourceTransactionManager\`(JDBC/MyBatis)、\`JpaTransactionManager\`(JPA)、\`HibernateTransactionManager\`(Hibernate)。

开发者只需面向 Spring 的事务抽象编程,不关心底层是哪种持久层技术。

### 声明式事务 @Transactional

Spring 推荐用**声明式事务**——在方法或类上加 \`@Transactional\` 注解,Spring 通过 AOP 自动在方法前后开启/提交/回滚事务,业务代码完全不感知事务存在。

\`\`\`java
@Service
public class TransferService {
    @Transactional
    public void transfer(Long from, Long to, BigDecimal amount) {
        accountDao.debit(from, amount);
        accountDao.credit(to, amount);  // 任一步失败,整个方法回滚
    }
}
\`\`\`

### 事务传播行为(Propagation)

当事务方法调用另一个事务方法时,如何处理?这就是**传播行为**:

| 传播行为 | 含义 | 使用场景 |
| --- | --- | --- |
| \`REQUIRED\`(默认) | 有事务加入,无则新建 | 绝大多数业务方法 |
| \`REQUIRES_NEW\` | 总是新建事务,挂起当前 | 日志记录(不受外层事务影响) |
| \`NESTED\` | 嵌套事务(保存点) | 部分回滚 |
| \`SUPPORTS\` | 有事务加入,无则非事务运行 | 查询方法 |
| \`NOT_SUPPORTED\` | 非事务运行,挂起当前事务 | 不需要事务的操作 |
| \`MANDATORY\` | 必须在事务中,否则抛异常 | 强制要求调用方有事务 |
| \`NEVER\` | 不能在事务中,否则抛异常 | 不允许事务的操作 |

### 事务隔离级别(Isolation)

| 隔离级别 | 脏读 | 不可重复读 | 幻读 |
| --- | --- | --- | --- |
| \`DEFAULT\` | 用数据库默认 | - | - |
| \`READ_UNCOMMITTED\` | 可能 | 可能 | 可能 |
| \`READ_COMMITTED\` | 不可能 | 可能 | 可能 |
| \`REPEATABLE_READ\` | 不可能 | 不可能 | 可能 |
| \`SERIALIZABLE\` | 不可能 | 不可能 | 不可能 |

## 设计原理

### 1. 声明式优于编程式

Spring 推荐声明式事务(\`@Transactional\`),而非编程式(\`TransactionTemplate\` 手动 begin/commit/rollback)。声明式让事务管理与业务代码分离,通过 AOP 自动织入,业务方法只写纯业务逻辑。

### 2. AOP 代理实现

\`@Transactional\` 底层是 AOP。Spring 在 Bean 初始化后,检测到 \`@Transactional\` 注解就创建代理对象。代理在方法前开启事务,方法成功则提交,抛 \`RuntimeException\` 则回滚。

### 3. 统一抽象屏蔽差异

JDBC 用 \`Connection.commit()\`,Hibernate 用 \`Session.getTransaction().commit()\`,JPA 用 \`EntityTransaction.commit()\`。Spring 的事务管理器把这些差异统一在 \`PlatformTransactionManager\` 下,开发者只面对一套 API。

### 4. 异常回滚策略

Spring 默认只回滚 \`RuntimeException\` 和 \`Error\`,不回滚 checked exception。设计理由:checked exception 是业务可预期的异常(如余额不足),不应导致回滚;RuntimeException 才是意外错误。可通过 \`rollbackFor\` 属性自定义。

## 使用场景

**场景一:Service 层方法加事务**——业务方法加 \`@Transactional\`,保证多步数据库操作原子性。

**场景二:日志独立事务**——日志记录用 \`REQUIRES_NEW\`,即使主事务回滚日志也保存。

\`\`\`java
@Service
public class OrderService {
    @Transactional
    public void createOrder(Order order) {
        orderDao.insert(order);
        logService.log("创建订单 " + order.getId());  // REQUIRES_NEW
    }
}

@Service
public class LogService {
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String msg) { logDao.insert(msg); }
}
\`\`\`

**场景三:查询方法只读事务**——\`@Transactional(readOnly = true)\` 标注查询,数据库可做优化。

**场景四:自定义回滚异常**——\`@Transactional(rollbackFor = BusinessException.class)\` 让 checked exception 也回滚。

**不适用场景**:跨多个数据源的分布式事务——需要 JTA/XA 或 Seata 等分布式事务方案,Spring 本地事务管不了。

## 代码示例

\`\`\`java
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;

@Service
public class TransferService {

    private final AccountDao accountDao;
    private final LogService logService;

    // 构造器注入
    public TransferService(AccountDao accountDao, LogService logService) {
        this.accountDao = accountDao;
        this.logService = logService;
    }

    // 声明式事务:方法内任一步失败,整个方法回滚
    @Transactional(
        isolation = Isolation.READ_COMMITTED,   // 隔离级别
        propagation = Propagation.REQUIRED,      // 传播行为(默认)
        rollbackFor = BusinessException.class,   // 指定异常也回滚
        timeout = 30,                             // 超时 30 秒
        readOnly = false                          // 非只读
    )
    public void transfer(Long fromId, Long toId, BigDecimal amount) {
        // 1. 扣款
        Account from = accountDao.findById(fromId);
        if (from.getBalance().compareTo(amount) < 0) {
            throw new BusinessException("余额不足");
        }
        accountDao.debit(fromId, amount);

        // 2. 加款
        accountDao.credit(toId, amount);

        // 3. 记录日志(独立事务,不受外层影响)
        logService.log("转账: " + fromId + " -> " + toId + " 金额: " + amount);
    }
}

@Service
public class LogService {

    // REQUIRES_NEW:总是开启新事务,外层回滚不影响日志
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String msg) {
        logDao.insert(new LogRecord(msg, LocalDateTime.now()));
    }
}

// 配置类:需要配 TransactionManager
@Configuration
@EnableTransactionManagement   // 开启注解驱动的事务管理
public class TxConfig {

    @Bean
    public DataSourceTransactionManager transactionManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}
\`\`\`

逐行说明:\`@Transactional\` 标注方法,Spring AOP 在方法前开启事务,成功提交,异常回滚;\`isolation\` 指定隔离级别;\`propagation = REQUIRES_NEW\` 让日志在独立事务中执行;\`rollbackFor\` 让 checked exception 也回滚(默认只回滚 RuntimeException);\`timeout\` 防止长事务锁表;\`readOnly = true\` 用于查询优化;\`@EnableTransactionManagement\` 开启注解驱动事务;\`DataSourceTransactionManager\` 是 JDBC/MyBatis 的事务管理器实现。

## 对比分析

### 声明式事务 vs 编程式事务

| 维度 | 声明式(@Transactional) | 编程式(TransactionTemplate) |
| --- | --- | --- |
| 侵入性 | 低(只加注解) | 高(业务代码掺事务逻辑) |
| 灵活度 | 方法级粗粒度 | 代码行级细粒度 |
| 可维护性 | 好 | 差 |
| 使用场景 | 绝大多数业务方法 | 需要精确控制事务范围的场景 |

### 传播行为对比

| 传播行为 | 外层有事务时 | 外层无事务时 | 典型场景 |
| --- | --- | --- | --- |
| REQUIRED | 加入 | 新建 | 默认,大多数业务 |
| REQUIRES_NEW | 挂起+新建 | 新建 | 日志、审计 |
| NESTED | 嵌套(保存点) | 新建 | 部分回滚 |
| SUPPORTS | 加入 | 非事务 | 查询 |
| NOT_SUPPORTED | 挂起+非事务 | 非事务 | 不需要事务 |
| MANDATORY | 加入 | 抛异常 | 强制要求事务 |
| NEVER | 抛异常 | 非事务 | 禁止事务 |

### 隔离级别对比

| 隔离级别 | 性能 | 数据一致性 | 适用场景 |
| --- | --- | --- | --- |
| READ_UNCOMMITTED | 最高 | 最差 | 几乎不用 |
| READ_COMMITTED | 高 | 中 | 大多数数据库默认 |
| REPEATABLE_READ | 中 | 高 | MySQL 默认 |
| SERIALIZABLE | 最低 | 最高 | 关键金融业务 |

### @Transactional vs 手动管理事务

| 维度 | @Transactional | 手动(Connection) |
| --- | --- | --- |
| 代码侵入 | 低 | 高 |
| 事务范围 | 整个方法 | 精确控制 |
| 跨数据源 | 不支持 | 手动管理更灵活 |
| 推荐度 | ✅ 首选 | 特殊场景 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 同类调用事务失效 | this.xxx() 没走代理 | 通过 \`AopContext.currentProxy()\` 或拆到不同类 |
| 方法不是 public | Spring AOP 只代理 public 方法 | 改 public,或用 AspectJ 编译时织入 |
| checked exception 不回滚 | 默认只回滚 RuntimeException | 加 \`rollbackFor = XxxException.class\` |
| 异常被 catch 吃掉 | catch 后没重新抛出,Spring 以为成功 | catch 后必须重新 throw,或手动标记回滚 |
| final/static 方法失效 | 代理无法覆盖 final/static | 改为实例方法,去掉 final |
| 多线程事务不生效 | 事务绑定当前线程,新线程没事务 | 避免在事务方法内开新线程 |
| REQUIRES_NEW 嵌套死锁 | 新事务等待外层事务释放锁 | 避免操作同一条数据,或调整执行顺序 |
| 忘记 @EnableTransactionManagement | 注解不生效 | 配置类加 \`@EnableTransactionManagement\` |
| 事务回滚但不彻底 | 部分操作是 API 调用(如发 HTTP) | HTTP 调用无法回滚,放事务外或做幂等 |
`,
  },
];
