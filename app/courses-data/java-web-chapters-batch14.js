// =============================================================
// Java Web 应用开发实战教程 —— 第十四批章节（测试与调试组，共 4 章）
// 章节 53-56:JUnit 5 单元测试 / Mockito 与 Spring 测试 /
//          Spring Boot Test 集成测试 / 性能测试与调试技巧
// =============================================================

export const chapters = [
  // =============================================================
  // 第五十三章:JUnit 5 单元测试
  // =============================================================
  {
    id: "jw-53",
    group: "测试与调试",
    icon: "🧪",
    title: "JUnit 5 单元测试",
    content: `# JUnit 5 单元测试

## 概念解释

JUnit 是 Java 生态最主流的单元测试框架。JUnit 5（代号 Jupiter）是 2017 年发布的全新版本，相比 JUnit 4 做了彻底重构，引入了模块化架构、扩展模型、Lambda 风格断言等现代化特性。

### JUnit 5 架构：三大模块

JUnit 5 不再是单一 jar 包，而是拆成三个模块：

- **JUnit Platform**：测试运行的基础平台，定义 \`TestEngine\` API。IDE、构建工具（Maven/Gradle）通过它发现并执行测试。
- **JUnit Jupiter**：JUnit 5 的编程模型和扩展 API，包含 \`@Test\`、\`@DisplayName\` 等注解。
- **JUnit Vintage**：兼容层，让你能在 JUnit 5 平台上跑旧的 JUnit 3/4 测试。

### 核心注解

- **\`@Test\`**：标记测试方法（注意包是 \`org.junit.jupiter.api\`，不是 JUnit 4 的 \`org.junit\`）。
- **\`@DisplayName\`**：自定义测试在报告中的显示名，支持中文、emoji。
- **\`@BeforeEach / @AfterEach\`**：每个测试方法前后执行（替代 JUnit 4 的 \`@Before/@After\`）。
- **\`@BeforeAll / @AfterAll\`**：所有测试方法前后执行一次，方法必须是 static。
- **\`@Disabled\`**：禁用测试（替代 \`@Ignore\`）。
- **\`@ParameterizedTest\`**：参数化测试，搭配 \`@ValueSource\`、\`@CsvSource\` 等数据源。
- **\`@Nested\`**：嵌套测试，把相关测试分组，支持内层外层共享 setUp。

## 设计原理

### 原理一：模块化架构解耦运行平台与编程模型

JUnit 4 把测试 API 和运行器耦合在一起，第三方框架（Spock、Cucumber）要接 JUnit 很难。JUnit 5 拆出 Platform，任何符合 \`TestEngine\` 接口的框架都能挂上去跑，实现生态共赢。

### 原理二：扩展模型替代继承

JUnit 4 想扩展功能要继承 \`Runner\`，多重继承冲突难解。JUnit 5 改用 \`Extension\` 接口组合：\`BeforeAllCallback\`、\`ParameterResolver\`、\`TestExecutionExceptionHandler\` 等，通过 \`@ExtendWith\` 注册，可叠加多个。

### 原理三：生命周期回调更细粒度

JUnit 5 把 \`@Before/@After\` 拆成 \`@BeforeEach/@AfterEach\`（每方法）和 \`@BeforeAll/@AfterAll\`（每类），语义更清晰。还新增 \`@TestInstance(Lifecycle.PER_CLASS)\` 让非 static 方法也能用 \`@BeforeAll\`。

### 原理四：断言支持 Lambda

JUnit 5 的 \`Assertions\` 类支持 \`Supplier<String>\` 做延迟消息计算，失败时才拼接字符串，减少无谓开销。新增 \`assertAll\` 分组断言，多个断言一起跑完才报告，不会因第一个失败就中断。

### 原理五：参数化测试内置支持

JUnit 4 要靠 \`Parameterized\` Runner，写法繁琐。JUnit 5 内置 \`@ParameterizedTest\`，搭配 \`@ValueSource\`、\`@CsvSource\`、\`@MethodSource\` 等多种数据源，简洁直观。

## 使用场景

**适合场景**：纯逻辑单元测试（Service/Util 类）、参数化测试（多组输入验证）、嵌套测试（按功能分组）、TDD 开发流程。

**不适合场景**：需要 Spring 容器的集成测试（用 \`@SpringBootTest\`）、需要 mock 依赖的测试（结合 Mockito）。JUnit 本身只解决"怎么跑测试"，不解决"怎么造数据"。

## 代码示例

下面是一个完整的 JUnit 5 测试示例，演示核心注解、断言、参数化测试：

\`\`\`java
package com.example.demo;

import org.junit.jupiter.api.*;          // JUnit 5 注解
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import static org.junit.jupiter.api.Assertions.*;

// @DisplayName 让测试报告显示中文，方便定位
@DisplayName("计算器测试")
class CalculatorTest {

    private Calculator calculator;

    // 每个测试方法前执行，做初始化
    @BeforeEach
    void setUp() {
        calculator = new Calculator();
    }

    // 所有测试方法前执行一次，必须是 static（除非用 @TestInstance(PER_CLASS)）
    @BeforeAll
    static void initAll() {
        System.out.println("=== 开始 Calculator 测试套件 ===");
    }

    @Test
    @DisplayName("加法：1 + 2 = 3")
    void testAdd() {
        assertEquals(3, calculator.add(1, 2), "1 + 2 应等于 3");
    }

    // assertAll 分组断言：所有断言都跑完才报告，避免第一个失败就中断
    @Test
    @DisplayName("多个断言分组验证")
    void testMultipleAssertions() {
        assertAll("计算器运算",
            () -> assertEquals(5, calculator.add(2, 3), "加法"),
            () -> assertEquals(6, calculator.multiply(2, 3), "乘法"),
            () -> assertEquals(-1, calculator.subtract(2, 3), "减法")
        );
    }

    // 异常断言：验证是否抛出指定异常
    @Test
    @DisplayName("除零应抛出 ArithmeticException")
    void testDivideByZero() {
        ArithmeticException ex = assertThrows(
            ArithmeticException.class,
            () -> calculator.divide(1, 0)
        );
        assertEquals("除数不能为零", ex.getMessage());
    }

    // 参数化测试：@ValueSource 提供基本类型数组
    @ParameterizedTest
    @DisplayName("偶数判断参数化")
    @ValueSource(ints = {2, 4, 6, 8, 100, -2})
    void testIsEven(int number) {
        assertTrue(calculator.isEven(number), number + " 应是偶数");
    }

    // 参数化测试：@CsvSource 提供多列数据，适合多输入多输出
    @ParameterizedTest
    @DisplayName("加法多组数据验证")
    @CsvSource({
        "1, 2, 3",
        "10, 20, 30",
        "-5, 5, 0",
        "100, 200, 300"
    })
    void testAddMultiple(int a, int b, int expected) {
        assertEquals(expected, calculator.add(a, b));
    }

    // 嵌套测试：把相关测试分组，内层可共享外层的 setUp
    @Nested
    @DisplayName("乘法测试组")
    class MultiplyTest {
        @Test
        @DisplayName("正数相乘")
        void testPositive() {
            assertEquals(6, calculator.multiply(2, 3));
        }

        @Test
        @DisplayName("负数相乘")
        void testNegative() {
            assertEquals(6, calculator.multiply(-2, -3));
        }
    }

    // @Disabled 临时禁用测试，可写原因
    @Test
    @Disabled("等待 bug 修复后再启用")
    void testNotReady() { }

    @AfterAll
    static void cleanupAll() {
        System.out.println("=== 测试套件结束 ===");
    }
}
\`\`\`

被测类：

\`\`\`java
class Calculator {
    int add(int a, int b) { return a + b; }
    int subtract(int a, int b) { return a - b; }
    int multiply(int a, int b) { return a * b; }
    int divide(int a, int b) {
        if (b == 0) throw new ArithmeticException("除数不能为零");
        return a / b;
    }
    boolean isEven(int n) { return n % 2 == 0; }
}
\`\`\`

关键点：\`assertEquals(expected, actual, message)\` 第三个参数是失败时消息；\`assertThrows\` 验证异常并返回异常对象供进一步断言；\`@ParameterizedTest\` 配 \`@CsvSource\` 实现数据驱动测试；\`@Nested\` 内层类可访问外层的 \`calculator\` 字段。

## 对比分析

| 维度 | JUnit 4 | JUnit 5 | TestNG |
| --- | --- | --- | --- |
| 架构 | 单一 jar | Platform + Jupiter + Vintage | 单一框架 |
| 包名 | org.junit | org.junit.jupiter.api | org.testng |
| 扩展模型 | Runner 继承 | Extension 组合 | Listener / Hook |
| 参数化测试 | @Parameterized 繁琐 | @ParameterizedTest 简洁 | @DataProvider |
| 嵌套测试 | 不支持 | @Nested 原生支持 | 不支持 |
| 断言 API | Assert.assertEquals | Assertions.assertEquals（支持 Lambda） | Assert.assertEquals |
| 生命周期 | @Before/@After | @BeforeEach/@AfterEach + @BeforeAll/@AfterAll | @BeforeMethod/@AfterMethod |
| 依赖测试 | 不支持 | 不支持 | @dependsOnMethods |
| 并行执行 | 不支持 | 内置支持 | 内置支持 |
| 生态 | 主流但渐老 | 主流且现代 | 企业级但小众 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| @Test 注解导错包 | 误导入 org.junit.Test（JUnit 4） | 用 org.junit.jupiter.api.Test（JUnit 5） |
| @BeforeAll 方法报错非 static | 默认 PER_METHOD 生命周期需 static | 加 static，或用 @TestInstance(PER_CLASS) |
| 参数化测试不识别 | 缺 junit-jupiter-params 依赖 | 引入 junit-jupiter-params 完整依赖 |
| @Nested 内层类无法用外层字段 | 内层类是静态内部类（Java 限制） | 内层类不能加 static，@Nested 默认就是非静态内部类 |
| assertEquals 消息永远是字符串拼接 | JUnit 4 写法传字符串 | JUnit 5 改用 Supplier 延迟拼接：\`() -> "msg" + x\` |
| assertAll 中一个失败后续不跑 | assertAll 默认全部跑完 | 确认用的是 assertAll 不是逐个 assert |
| @Disabled 测试仍执行 | 注解导错包或没生效 | 确认用 org.junit.jupiter.api.Disabled |
| 测试方法不能 private | JUnit 要求测试方法包可见 | 删 private 修饰符，用包可见或 public |
| 参数化测试中文乱码 | @CsvSource 默认编码问题 | 配置 maven-surefire-plugin 的 argLine 加 -Dfile.encoding=UTF-8 |
`
  },
  // =============================================================
  // 第五十四章:Mockito 与 Spring 测试
  // =============================================================
  {
    id: "jw-54",
    group: "测试与调试",
    icon: "🎭",
    title: "Mockito 与 Spring 测试",
    content: `# Mockito 与 Spring 测试

## 概念解释

单元测试要求**隔离被测对象的依赖**。如果测试 UserService 还要真连数据库，那不叫单元测试叫集成测试。Mockito 是 Java 最主流的 Mock 框架，能"伪造"对象的行为，让你专注测被测类本身。

### Mock vs Stub vs Spy

- **Mock**：完全伪造对象，所有方法默认返回默认值（null/0/false），可声明特定调用返回什么。
- **Stub**：类似 Mock，但更强调"打桩"——为特定输入预设返回值。
- **Spy**：包装真实对象，默认调用真实方法，但也能对特定方法打桩。用于"测大部分真实逻辑，只 mock 某个方法"。

Mockito 5 统一了这些概念：\`Mockito.mock()\` 创建 Mock，\`Mockito.spy()\` 创建 Spy，\`when().thenReturn()\` 打桩。

### 核心 API

- **\`mock(Class)\`** / **\`@Mock\`**：创建 Mock 对象。
- **\`when(mock.method(args)).thenReturn(value)\`**：打桩，指定方法返回值。
- **\`verify(mock).method(args)\`**：验证方法是否被调用、调用几次。
- **\`@InjectMocks\`**：把 @Mock 字段自动注入到被测对象的构造器/setter/字段。
- **\`ArgumentCaptor\`**：捕获方法参数，事后断言。
- **\`ArgumentMatchers\`**：参数匹配器（\`any()\`、\`eq()\`、\`contains()\` 等）。

## 设计原理

### 原理一：字节码生成伪造对象

Mockito 用 ByteBuddy（5.x 起，4.x 用 CGLIB）动态生成子类/代理类，重写方法返回默认值。这就是为什么不能 mock final 类、static 方法（5.x 后可用 \`mockStatic\`）。

### 原理二：打桩是"录制-回放"模型

\`when(mock.x()).thenReturn(y)\` 实际是：先调用 \`mock.x()\` 让 Mockito 记录"这个调用"，再 \`thenReturn\` 绑定返回值。所以顺序不能反。

### 原理三：verify 基于 invocations 历史

Mockito 内部维护每个 Mock 对象的调用记录，\`verify\` 查这份历史判断是否匹配。可指定次数：\`times(2)\`、\`never()\`、\`atLeastOnce()\`。

### 原理四：@InjectMocks 自动依赖注入

\`@InjectMocks\` 会尝试构造器注入、setter 注入、字段注入三种方式，把同类型的 @Mock 注入被测对象，省去手动 new。优先级：构造器 > setter > 字段反射。

### 原理五：Spring 测试用 @MockBean

Spring Boot Test 提供 \`@MockBean\`：把 Mock 加入 Spring 容器，替换同类型的真实 Bean。这样集成测试时仍可隔离某个 Service，不需要真连数据库。

## 使用场景

**适合场景**：Service 层单元测试（mock 掉 Repository）、Controller 层测试（mock 掉 Service）、隔离第三方 API（mock HTTP 客户端）、测试异常分支（打桩抛异常）、验证方法调用次数与参数。

**不适合场景**：纯 POJO/DTO 不需要 mock，直接 new 即可；Mapper/Repository 这种数据访问层应该用真实数据库或 Testcontainers 测，mock 没意义；简单工具类逻辑直接断言，不需要 mock 框架。

## 代码示例

下面是 Service 层的 Mockito 测试，演示 mock、打桩、verify、ArgumentCaptor：

\`\`\`java
package com.example.demo;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

// @ExtendWith(MockitoExtension.class) 启用 Mockito 注解支持
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock                       // 创建 mock 的 UserRepository
    private UserRepository userRepository;

    @InjectMocks                // 把 @Mock 注入 UserService（构造器/字段注入）
    private UserService userService;

    @Test
    void testFindById_ReturnsUser() {
        // 1. 打桩：当 findById(1) 时返回一个 User
        User mockUser = new User(1L, "alice");
        when(userRepository.findById(1L)).thenReturn(mockUser);

        // 2. 调用被测方法
        User result = userService.findById(1L);

        // 3. 断言结果
        assertEquals("alice", result.getName());
        // 4. 验证 findById 被调用了一次
        verify(userRepository, times(1)).findById(1L);
    }

    @Test
    void testFindById_NotFound_ThrowsException() {
        // 打桩返回空，模拟找不到
        when(userRepository.findById(999L)).thenReturn(null);

        // 验证抛出异常
        assertThrows(UserNotFoundException.class,
            () -> userService.findById(999L));
    }

    @Test
    void testSaveUser_CapturesArgument() {
        // ArgumentCaptor 捕获传给 save 的参数
        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);

        userService.register("bob@example.com");

        // 验证 save 被调用，并捕获参数
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();
        assertEquals("bob@example.com", saved.getEmail());
        assertNotNull(saved.getCreatedAt());   // 业务逻辑应填充创建时间
    }

    @Test
    void testSaveUser_VerifyNeverCalledOnValidationFail() {
        // 邮箱为空时不应保存
        assertThrows(IllegalArgumentException.class,
            () -> userService.register(""));

        // 验证 save 从未被调用
        verify(userRepository, never()).save(any());
    }
}
\`\`\`

Spring Boot 测试用 \`@MockBean\` 替换真实 Bean：

\`\`\`java
package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest   // 启动完整 Spring 上下文
class OrderServiceIntegrationTest {

    @Autowired
    private OrderService orderService;       // 真实 Bean

    @MockBean                                // 用 Mock 替换容器中的 PaymentClient
    private PaymentClient paymentClient;

    @Test
    void testCreateOrder_PaymentSuccess() {
        // 打桩支付接口返回成功
        when(paymentClient.charge(any())).thenReturn(true);

        Order order = orderService.createOrder(new OrderRequest("item1", 100));

        assertNotNull(order.getId());
        assertEquals(OrderStatus.PAID, order.getStatus());
        verify(paymentClient, times(1)).charge(any());
    }
}
\`\`\`

关键点：\`@ExtendWith(MockitoExtension.class)\` 启用注解；\`@InjectMocks\` 自动注入依赖；\`when().thenReturn()\` 打桩；\`verify\` 验证调用；\`ArgumentCaptor\` 捕获参数事后断言；\`@MockBean\` 在 Spring 上下文里替换 Bean。

## 对比分析

| 维度 | Mockito | PowerMock | EasyMock |
| --- | --- | --- | --- |
| mock 普通类 | 支持 | 支持 | 支持 |
| mock final 类 | 5.x 支持（mock-maker-inline） | 支持 | 需扩展 |
| mock static 方法 | 3.4+ 支持 mockStatic | 支持 | 不支持 |
| mock 构造器 | 3.5+ 支持 mockConstruction | 支持 | 不支持 |
| 学习成本 | 低 | 高 | 中 |
| API 风格 | 自然语言 when().thenReturn() | 类似 Mockito | 录制-回放 |
| 维护活跃度 | 高 | 低（基本停更） | 低 |
| 集成 Spring | @MockBean 原生 | 弱 | 弱 |
| 推荐度 | 首选 | 仅特殊场景 | 不推荐 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| mock final 类报错 | 默认 mock-maker 不支持 final | 配置 mockito-extensions/org.mockito.plugins.MockMaker 为 mock-maker-inline |
| mockStatic 报找不到方法 | Mockito 版本低于 3.4 | 升级到 3.4+，用 try (MockedStatic<X> ms = mockStatic(X.class)) |
| @InjectMocks 注入失败 | 没有 @Mock 同类型字段或构造器有歧义 | 检查被测类构造器，确保 @Mock 类型匹配 |
| verify 报 wanted but not invoked | 打桩参数与实际调用参数不匹配 | 用 any() 匹配，或确认参数值确实相等 |
| thenReturn 返回 null | mock 类型是包装类，默认返回 null | 显式打桩返回具体值，别依赖默认 |
| 测试跑过快导致时间断言失败 | System.currentTimeMillis 精度问题 | 用 Clock 注入或 Instant 替代直接 new Date() |
| @MockBean 导致上下文重启 | 每个 @MockBean 都创建新上下文 | 同测试类内复用，跨类用 @ContextConfiguration 共享 |
| spy 真实方法仍被 mock | spy 默认调用真实方法，但打桩后不调用 | 用 doReturn().when(spy).method() 避免 thenReturn 触发真实方法 |
| mock 集合/Map 出现空指针 | mock List 返回 null 而非空集合 | 别 mock 集合，直接用真实 ArrayList |
| verify 顺序不对 | 默认不校验顺序 | 用 InOrder 验证顺序：inOrder(a, b).verify(a).x() |
`
  },
  // =============================================================
  // 第五十五章:Spring Boot Test 集成测试
  // =============================================================
  {
    id: "jw-55",
    group: "测试与调试",
    icon: "🔬",
    title: "Spring Boot Test 集成测试",
    content: `# Spring Boot Test 集成测试

## 概念解释

单元测试验证单个类，集成测试验证多个组件协作是否正确。Spring Boot Test 是 Spring Boot 提供的测试支持模块（\`spring-boot-starter-test\`），让集成测试写起来像单元测试一样简单。

### 核心注解

- **\`@SpringBootTest\`**：启动完整 Spring 上下文，所有 Bean 都初始化。最重量级，最真实。
- **\`@WebMvcTest\`**：只加载 Web 层（Controller + MVC 基础设施），mock 掉 Service。轻量。
- **\`@DataJpaTest\`**：只加载 JPA 层，自动配置内存数据库（H2），回滚事务。测 Repository。
- **\`@JsonTest\`**：只加载 Jackson 序列化，测 DTO 序列化反序列化。
- **\`@RestClientTest\`**：测 RestTemplate / WebClient，mock 服务端响应。

这些叫"**测试切片**"（Test Slice），只加载应用的一部分，快且隔离。

### MockMvc

测 Controller 不真起 HTTP 服务，用 \`MockMvc\` 模拟 HTTP 请求：

\`\`\`java
mockMvc.perform(get("/users/1").contentType(MediaType.APPLICATION_JSON))
       .andExpect(status().isOk())
       .andExpect(jsonPath("$.name").value("alice"));
\`\`\`

不占端口、不启动嵌入式 Tomcat，速度快。

## 设计原理

### 原理一：测试切片按层加载

\`@SpringBootTest\` 启动所有 Bean，慢。\`@WebMvcTest\` 用 \`@TypeExcludeFilters\` 只保留 Controller 相关注解的 Bean，其他不加载。这样测 Controller 不会触发数据库连接、Redis 初始化等重资源。

### 原理二：ApplicationContext 缓存

Spring Test 在同一 JVM 内缓存 ApplicationContext，相同配置的测试类共享上下文，只启动一次。改变 \`@MockBean\`、\`@TestPropertySource\` 会让缓存失效，触发重新加载。所以测试类应尽量用相同配置以复用上下文。

### 原理三：事务自动回滚

\`@DataJpaTest\` 默认加 \`@Transactional\`，测试方法结束自动回滚，数据库不留垃圾，每个测试方法看到干净的初始状态。

### 原理四：Testcontainers 替代内存数据库

内存数据库（H2）与生产 MySQL 行为有差异，测试通过不代表生产通过。Testcontainers 用 Docker 启动真实数据库，测试完销毁，兼顾真实性与隔离性。

### 原理五：MockMvc 模拟而非真起服务

MockMvc 直接调用 \`DispatcherServlet\`，绕过 Tomcat，不占端口。速度比 \`@SpringBootTest(webEnvironment=RANDOM_PORT)\` + RestTemplate 快几倍，且能细粒度断言。

## 使用场景

**适合场景**：Controller 层 HTTP 接口测试（@WebMvcTest + MockMvc）、Repository 层 SQL 测试（@DataJpaTest + H2/Testcontainers）、全链路集成测试（@SpringBootTest）、JSON 序列化测试（@JsonTest）。

**不适合场景**：纯逻辑 Service 用 Mockito 单测更快（上一章）；前端 E2E 用 Cypress/Playwright；性能压测用 JMeter（下一章）。

## 代码示例

下面演示四种测试切片的完整写法：

\`\`\`java
package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// 1. @WebMvcTest 只加载 Web 层，mock 掉 Service
@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;          // 自动注入，模拟 HTTP

    @MockBean                        // mock 掉 Service，不真查数据库
    private UserService userService;

    @Test
    void testGetUser_ReturnsJson() throws Exception {
        // 打桩 Service
        when(userService.findById(1L)).thenReturn(new User(1L, "alice"));

        // 模拟 GET /users/1，断言响应
        mockMvc.perform(get("/users/1")
                .contentType("application/json"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.name").value("alice"));
    }

    @Test
    void testGetUser_NotFound() throws Exception {
        when(userService.findById(999L)).thenThrow(new UserNotFoundException());

        mockMvc.perform(get("/users/999"))
            .andExpect(status().isNotFound());
    }
}
\`\`\`

JPA 层测试：

\`\`\`java
package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import static org.junit.jupiter.api.Assertions.*;

// 2. @DataJpaTest 只加载 JPA 层，自动用 H2 内存库（默认）或 Testcontainers
@DataJpaTest
@Testcontainers   // 启用 Testcontainers 支持
class UserRepositoryTest {

    // 启动真实 MySQL 容器，@ServiceConnection 自动配置数据源
    @Container
    @ServiceConnection
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0");

    @Autowired
    private UserRepository userRepository;

    @Test
    void testFindByEmail() {
        // 准备数据（事务自动回滚，不影响其他测试）
        userRepository.save(new User("alice@example.com"));

        // 查询
        User found = userRepository.findByEmail("alice@example.com");

        assertNotNull(found);
        assertEquals("alice@example.com", found.getEmail());
    }

    @Test
    void testFindByEmail_NotFound() {
        User found = userRepository.findByEmail("nobody@example.com");
        assertNull(found);
    }
}
\`\`\`

完整集成测试：

\`\`\`java
package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import static org.junit.jupiter.api.Assertions.*;

// 3. @SpringBootTest 启动完整应用，RANDOM_PORT 用真实端口
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class FullIntegrationTest {

    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0");

    @Autowired
    private TestRestTemplate restTemplate;   // 真实 HTTP 调用

    @Test
    void testCreateAndGetUser() {
        // POST 创建用户
        ResponseEntity<User> createResp = restTemplate.postForEntity(
            "/users", new UserRequest("bob@example.com"), User.class);
        assertEquals(201, createResp.getStatusCodeValue());

        Long id = createResp.getBody().getId();

        // GET 查询
        ResponseEntity<User> getResp = restTemplate.getForEntity(
            "/users/" + id, User.class);
        assertEquals(200, getResp.getStatusCodeValue());
        assertEquals("bob@example.com", getResp.getBody().getEmail());
    }
}
\`\`\`

关键点：\`@WebMvcTest\` 只加载 Controller，快；\`MockMvc\` 模拟 HTTP 不占端口；\`@DataJpaTest\` 自动回滚事务；\`@Container + @ServiceConnection\` 用 Testcontainers 启真实数据库；\`@SpringBootTest(RANDOM_PORT)\` + \`TestRestTemplate\` 跑完整链路。

## 对比分析

| 维度 | @SpringBootTest | @WebMvcTest | @DataJpaTest |
| --- | --- | --- | --- |
| 加载范围 | 完整上下文 | 仅 Web 层 | 仅 JPA 层 |
| 启动速度 | 慢（秒级） | 快（百毫秒级） | 快（百毫秒级） |
| 数据库 | 真实配置 | mock 掉 | 内存 H2 或 Testcontainers |
| Service | 真实 | mock（@MockBean） | 不加载 |
| 事务回滚 | 默认不回滚 | 不涉及 | 默认回滚 |
| 适用层 | 全链路 | Controller | Repository |
| 占用资源 | 高 | 低 | 低 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| @WebMvcTest 启动失败找不到 Service | 默认不加载非 Controller Bean | 用 @MockBean 提供 mock，或 @Import 指定 |
| @DataJpaTest 与生产 MySQL 行为不一致 | 默认用 H2，SQL 方言不同 | 用 Testcontainers 启真实 MySQL |
| @SpringBootTest 太慢 | 每次启动完整上下文 | 用测试切片替代，或缓存上下文（相同配置只启动一次） |
| 测试方法间数据污染 | @SpringBootTest 默认不回滚 | 加 @Transactional 让测试方法回滚 |
| @MockBean 导致上下文重启 | 每个 @MockBean 改变上下文配置 | 同测试类内复用，跨类用 @ContextConfiguration |
| MockMvc 测不了文件上传 | 缺 multipart 配置 | 用 .multipart("/upload").file(new MockMultipartFile(...)) |
| Testcontainers 启动超时 | Docker 未运行或镜像拉取慢 | 确认 Docker daemon 启动，预拉镜像 |
| @JsonTest 找不到 ObjectMapper | 自定义了 ObjectMapper Bean | 用 @Import 引入配置类 |
| 随机端口获取不到 | webEnvironment=RANDOM_PORT 但不知道端口 | @LocalServerPort 注入端口号 |
| 测试日志与生产不一致 | 日志级别不同 | application-test.yml 配置 logging.level |
`
  },
  // =============================================================
  // 第五十六章:性能测试与调试技巧
  // =============================================================
  {
    id: "jw-56",
    group: "测试与调试",
    icon: "⚡",
    title: "性能测试与调试技巧",
    content: `# 性能测试与调试技巧

## 概念解释

功能测试验证"能不能用"，性能测试验证"用得好不好"。一个接口单用户跑通不代表上线能扛住 1000 QPS。性能测试是上线前的必经环节，也是线上问题排查的关键手段。

### 性能测试类型

- **负载测试（Load Test）**：模拟预期负载，验证系统能否达到性能指标（如 500 QPS 下 P99 < 200ms）。
- **压力测试（Stress Test）**：持续加压直到系统崩溃，找出极限承载能力。
- **容量测试（Capacity Test）**：测出"系统能扛多少"，为容量规划提供依据。
- **稳定性测试（Soak Test）**：长时间（如 24 小时）中等负载运行，发现内存泄漏等问题。
- **并发测试（Concurrent Test）**：多用户并发同一接口，验证并发安全。

### 核心指标

- **QPS / TPS**：每秒请求数 / 事务数，吞吐量指标。
- **响应时间（Latency）**：平均、P50、P95、P99、P999。**关注尾部延迟**而非平均值。
- **并发数（Concurrency）**：同时在线/同时请求的用户数。
- **错误率**：失败请求占比。
- **资源利用率**：CPU、内存、网络 IO、磁盘 IO、GC 频率。

### 调试工具

- **JDK 自带**：jstack（线程栈）、jmap（堆内存）、jstat（GC 统计）、jconsole（可视化）。
- **Arthas**：阿里开源在线诊断工具，无需重启应用即可查方法耗时、watch 方法返回值。
- **JFR（Java Flight Recorder）**：JDK 内置的低开销性能采集器。
- **async-profiler**：火焰图生成利器，定位 CPU 热点。

## 设计原理

### 原理一：关注尾部延迟而非平均值

平均值会掩盖长尾问题。1000 个请求平均 50ms，可能有 10 个超过 2 秒。生产环境 SLA 通常用 P99（99% 请求在多少 ms 内完成）承诺。监控必须看 P99 / P999。

### 原理二：压力测试模拟真实场景

不能只压单个接口，要按真实流量比例混合压。比如 70% 查询 + 20% 写入 + 10% 复杂查询，这样测出的瓶颈才准。

### 原理三：瓶颈定位用分层排除法

性能问题排查顺序：网络 → 反向代理 → 应用代码 → 数据库 → JVM。先排除外部因素（网络抖动、DNS、CDN），再看应用层（慢 SQL、N+1 查询、锁竞争），最后看 JVM（GC、内存）。

### 原理四：火焰图定位 CPU 热点

火焰图把采样到的调用栈可视化：横轴是调用次数占比，纵轴是调用深度。最宽的函数就是 CPU 消耗最多的，一眼就能找到优化点。

### 原理五：内存泄漏靠 GC 日志和堆 dump

OOM 不是突然发生的，是内存缓慢泄漏的结果。监控 \`jstat -gc\` 的 Old 区增长趋势，定期 dump 堆用 MAT（Memory Analyzer）分析对象引用链。

## 使用场景

**适合场景**：上线前压测验证容量、性能瓶颈排查（慢接口定位）、内存泄漏排查、CPU 飙高排查、GC 调优、容量规划。

**不适合场景**：功能正确性验证（用单元测试）、UI 交互测试（用 E2E）、安全测试（用专门工具）。

## 代码示例

### JMeter 压测脚本

JMeter 用 JMX 文件描述测试计划，也可用命令行非 GUI 模式跑：

\`\`\`bash
# 非 GUI 模式运行，-n 无界面，-t 测试计划，-l 结果文件，-e 生成 HTML 报告
jmeter -n -t load_test.jmx -l result.jtl -e -o ./report

# 关键参数：线程数（并发用户）、Ramp-up（启动时间）、循环次数
# 例如：1000 线程，10 秒内启动完毕，每个线程循环 100 次
\`\`\`

JMX 测试计划核心配置：

\`\`\`xml
<ThreadGroup>
  <stringProp name="ThreadGroup.num_threads">1000</stringProp>
  <stringProp name="ThreadGroup.ramp_time">10</stringProp>
  <boolProp name="ThreadGroup.scheduler">false</boolProp>
  <stringProp name="LoopController.loops">100</stringProp>
</ThreadGroup>
<HTTPSampler>
  <stringProp name="HTTPSampler.domain">api.example.com</stringProp>
  <stringProp name="HTTPSampler.port">443</stringProp>
  <stringProp name="HTTPSampler.protocol">https</stringProp>
  <stringProp name="HTTPSampler.path">/users/1</stringProp>
  <stringProp name="HTTPSampler.method">GET</stringProp>
</HTTPSampler>
\`\`\`

### JVM 调优参数

\`\`\`bash
# 堆内存：初始 2G，最大 4G
-Xms2g -Xmx4g

# 元空间初始 256M
-XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=512m

# GC 日志：记录 GC 详情，便于分析
-Xlog:gc*:file=/var/log/app/gc.log:time,uptime,level,tags:filecount=10,filesize=100m

# 堆 dump：OOM 时自动 dump
-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/log/app/heapdump.hprof

# G1 收集器（JDK 9+ 默认，但建议显式设置）
-XX:+UseG1GC -XX:MaxGCPauseMillis=200
\`\`\`

### 在线调试命令

\`\`\`bash
# 1. jstack 查看线程栈，定位死锁和线程阻塞
jstack <pid> > thread_dump.txt
# 找 BLOCKED 状态线程：grep "BLOCKED" thread_dump.txt

# 2. jmap 查看堆内存使用
jmap -heap <pid>
jmap -histo:live <pid> | head -20   # 活对象统计，找出占用最大的对象

# 3. jstat 监控 GC
jstat -gcutil <pid> 1000 10   # 每秒一次，共 10 次

# 4. jcmd 生成堆 dump（替代 jmap -dump）
jcmd <pid> GC.heap_dump /tmp/heap.hprof

# 5. top 找 CPU 最高的 Java 线程
top -Hp <pid>   # 显示进程内线程
# 把线程 ID 转 16进制，再到 jstack 输出里找对应栈
printf "%x\\n" <tid>
\`\`\`

### Arthas 在线诊断

\`\`\`bash
# 启动 Arthas，attach 到目标 Java 进程
java -jar arthas-boot.jar

# 查看方法耗时
trace com.example.UserService findById '#cost > 10'

# watch 方法返回值
watch com.example.UserService findById returnObj -x 2

# dashboard 看整体状态
dashboard

# thread 查看线程，thread <id> 看栈
thread
thread 12

# 查看哪个方法最慢
trace com.example.OrderService createOrder

# 反编译看线上实际运行的代码
jad com.example.UserService
\`\`\`

关键点：JMeter 用非 GUI 模式跑更稳；JVM 参数 \`-Xms\` 与 \`-Xmx\` 设相同值避免动态扩容停顿；\`jstack\` 找死锁；\`jmap -histo:live\` 找内存大户；Arthas \`trace\` 找慢方法无需重启。

## 对比分析

| 维度 | JMeter | Gatling | wrk | ab |
| --- | --- | --- | --- | --- |
| 语言 | Java | Scala | C | C |
| 编写方式 | GUI / XML | Scala DSL | 命令行 | 命令行 |
| 并发模型 | 线程 | 协程（Actor） | 事件 | 线程 |
| 单机并发 | 千级 | 万级 | 万级 | 千级 |
| 报告 | HTML 详尽 | HTML 优秀 | 文本简陋 | 文本简陋 |
| 分布式 | 原生支持 | 需自行搭 | 不支持 | 不支持 |
| 学习成本 | 中 | 高 | 低 | 极低 |
| 适用场景 | 综合 | 高并发 | 快速基准 | 简单压测 |

JVM 调试工具对比：

| 工具 | 用途 | 优点 | 缺点 |
| --- | --- | --- | --- |
| jstack | 线程栈 | JDK 自带 | 只能快照 |
| jmap | 堆内存 | JDK 自带 | STW 影响 |
| Arthas | 在线诊断 | 无需重启，功能强 | 需 attach |
| JFR | 性能采集 | 开销极低 | JDK 11+ 才免费 |
| async-profiler | 火焰图 | 低开销，精准 | 需额外安装 |
| VisualVM | 综合监控 | 图形化 | 已停止维护 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 压测结果不稳定 | 客户端本身成瓶颈 | 用多台压测机分布式压，或用 wrk/gatling |
| 平均响应时间好看但 P99 很差 | 用平均值误导 | 关注 P99/P999，监控尾部延迟 |
| 压测时数据库连接池打满 | 连接数配置太小 | 调大 HikariCP 的 maximumPoolSize |
| 线程 dump 看不到问题 | 时机不对，采样瞬间没异常 | 多次 dump 对比，或用 async-profiler 持续采样 |
| jmap -dump 让应用卡住 | Full GC 触发 STW | 用 jcmd GC.heap_dump 或在线低峰期操作 |
| GC 频繁但堆没满 | Young 区太小 | 调大 -Xmn 或用 G1 控制暂停 |
| 内存泄漏复现难 | 需要长时间积累 | 用 Soak Test 跑 24 小时，监控 Old 区增长 |
| Arthas trace 影响性能 | trace 会拦截方法 | 加 '#cost > N' 过滤，用完及时 stop |
| CPU 100% 但 jstack 找不到热点 | 采样间隔太长 | 用 async-profiler 生成火焰图 |
| 压测通过上线后崩 | 压测流量与真实流量分布不同 | 按真实流量比例混合压，包含读写混合 |
`
  },
];
