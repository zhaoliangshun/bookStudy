// =============================================================
// Java Web 应用开发实战教程 —— 第九批章节（Spring Data JPA 组，共 4 章）
// 章节 33-36:JPA 与 Hibernate 基础 / 实体映射与关系 /
//          Spring Data JPA 仓库 / 查询方法与 JPQL
// =============================================================

export const chapters = [
  // =============================================================
  // 第三十三章:JPA 与 Hibernate 基础
  // =============================================================
  {
    id: "jw-33",
    group: "Spring Data JPA",
    icon: "💾",
    title: "JPA 与 Hibernate 基础",
    content: `# JPA 与 Hibernate 基础

## 概念讲解

JPA（Java Persistence API）是 Java EE 规范中定义的**对象关系映射标准**，它只定义接口与行为契约，本身不提供实现。Hibernate 是 JPA 规范的一个**具体实现**（也是最流行的实现），此外还有 EclipseLink、OpenJPA 等。

### ORM 核心思想：对象关系映射

ORM（Object-Relational Mapping）的核心思想是：**用面向对象的方式操作关系型数据库**。Java 中的类对应数据库表，对象对应行，字段对应列。开发者不再手写大量 JDBC 模板代码，而是操作 Java 对象，由 ORM 框架在背后生成并执行 SQL。

这种映射解决了「对象模型」与「关系模型」之间的**阻抗失配**（Impedance Mismatch）：

- 对象有继承，关系表没有继承
- 对象有身份（引用相等），关系行靠主键
- 对象有导航（a.getB().getC()），关系靠外键 JOIN
- 对象有集合，关系靠关联表

JPA 通过注解和元数据描述这种映射，让框架在两边自动翻译。

### 规范与实现的关系

JPA 是规范（API），Hibernate 是实现（SPI）。代码面向 JPA 编程，切换实现时只需更换配置和依赖，业务代码不变。这是「面向接口编程」思想在持久层的体现：

\`\`\`
应用代码 → javax.persistence.EntityManager（JPA 接口）
                    ↓ 实现
            Hibernate Session（Hibernate 原生）
                    ↓
                 数据库
\`\`\`

注意：Jakarta EE 9 之后，包名从 \`javax.persistence\` 迁移到 \`jakarta.persistence\`。Spring Boot 3.x 强制使用 Jakarta 命名空间。

### 核心注解

**\`@Entity\`**：标记一个类为持久化实体，框架会为它建表/映射表。一个实体类必须有无参构造（public 或 protected）。

**\`@Table\`**：指定映射的数据库表名。不写则默认使用类名。

**\`@Id\`**：标记主键字段，每个实体必须有一个。

**\`@Column\`**：定制列属性（名称、长度、是否可空、是否唯一等）。

### 主键生成策略

\`@GeneratedValue\` 决定主键如何生成，\`strategy\` 取四种：

- **\`AUTO\`**：让 JPA Provider 自动选择（默认）。可移植但不可控，生产慎用。
- **\`IDENTITY\`**：依赖数据库自增列（MySQL AUTO_INCREMENT、PostgreSQL SERIAL/IDENTITY）。插入后才知道主键，会强制 insert 立即执行，影响批量写入性能和 JDBC 批量优化。
- **\`SEQUENCE\`**：使用数据库序列（Oracle、PostgreSQL 常用）。可预分配 ID，支持批量写入，性能最好。默认序列名 \`hibernate_sequence\`，可用 \`@SequenceGenerator\` 自定义。
- **\`TABLE\`**：用一张专门的表模拟序列，跨数据库可移植但性能最差，几乎不用。

### 持久化上下文与 EntityManager

**EntityManager** 是 JPA 的核心入口，类似 JDBC 的 Connection 但功能更强。它管理一组实体实例，这组实例所处的环境叫**持久化上下文**（Persistence Context）。

持久化上下文是一个**一级缓存**：同一事务内对同一主键的多次查询只会命中数据库一次，后续从缓存取。它还负责**脏检查**（Dirty Checking）：事务提交时自动对比实体快照，把改过的字段生成 UPDATE。

### 实体四种状态

理解实体状态机是掌握 JPA 的关键：

- **NEW（新建）**：\`new User()\` 创建但未 persist，与上下文无关
- **MANAGED（托管/持久化）**：被上下文管理，事务提交时同步到数据库。通过 \`persist\`、\`merge\` 返回值、\`find\` 等进入此状态
- **DETACHED（游离）**：曾经托管但脱离上下文（事务结束、\`clear()\`、\`detach()\`），仍持有数据库数据但修改不会被同步
- **REMOVED（删除）**：被 \`remove\` 标记，事务提交时生成 DELETE

状态转换图：\`NEW --persist--> MANAGED --remove--> REMOVED --commit--> 不存在\`；\`MANAGED --detach/clear--> DETACHED --merge--> MANAGED\`。

## 设计原则

1. **面向 JPA 规范编程**：业务代码依赖 \`EntityManager\`、\`@Entity\` 等标准接口，而非 Hibernate 私有 API（\`Session\`、\`@org.hibernate.annotations.Cache\`）。便于切换实现。
2. **实体保持贫血或轻度充血**：实体应聚焦于数据本身和与自身状态强相关的行为，避免把业务逻辑塞进实体。事务边界放在 Service 层。
3. **主键选择优先业务无关**：用自增或 UUID 之类的代理主键，不要用身份证号、手机号等业务字段做主键，业务字段会变且可能重复。
4. **集合字段用接口类型声明**：\`List<User>\` 而非 \`ArrayList<User>\`，框架会用自己的延迟加载代理实现替换。
5. **事务边界短而清晰**：事务方法结束就 flush+commit，避免长事务持有数据库连接、产生锁竞争。

## 使用场景

- 绝大多数 CRUD 为主的业务系统：用户、订单、商品管理
- 复杂对象图持久化：一对多订单明细、多对多权限角色
- 需要跨数据库可移植的项目：换库只改配置不改代码
- 团队希望减少样板代码（JDBC 模板、ResultMap 映射）的场景
- 不适用：对 SQL 性能极致优化、复杂报表分析、超大规模数据 —— 这类应直接用 JDBC/MyBatis 或专门的分析引擎。

## 代码逐行讲解

下面是一个完整可运行的实体定义，配合注释逐行说明：

\`\`\`java
package com.example.demo.domain;

import jakarta.persistence.*;        // Jakarta 命名空间，Spring Boot 3.x 必需
import java.time.LocalDateTime;

@Entity                              // 标记为 JPA 实体，框架会为其建表/映射
@Table(name = "users")               // 映射到 users 表，不写则默认表名 User
public class User {

    @Id                              // 主键
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // 数据库自增
    @Column(name = "user_id")        // 列名 user_id
    private Long id;                 // 包装类型，新建未保存时为 null

    @Column(name = "username", length = 50, nullable = false, unique = true)
    private String username;         // 非空且唯一，长度 50

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "created_at", updatable = false)  // 创建后不可更新
    private LocalDateTime createdAt = LocalDateTime.now();

    // JPA 要求实体必须有无参构造（protected 也可以）
    protected User() {}

    public User(String username, String email) {
        this.username = username;
        this.email = email;
    }

    // getter / setter 省略...
    public Long getId() { return id; }
    public void setUsername(String username) { this.username = username; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
\`\`\`

逐行解析：

- \`package com.example.demo.domain;\` —— 实体通常放在 \`domain\` 或 \`entity\` 包，与业务层分离。
- \`import jakarta.persistence.*;\` —— Spring Boot 3.x 起强制使用 Jakarta 命名空间（原 \`javax.persistence\`）。如果用 Spring Boot 2.x，要换成 \`javax.persistence\`。
- \`@Entity\` —— 告诉 Hibernate：这个类要作为实体管理，启动时根据配置 \`ddl-auto\` 决定建表/校验。
- \`@Table(name = "users")\` —— \`user\` 是 SQL 关键字/保留字，显式指定表名为 \`users\` 更安全。
- \`@Id\` —— 必备，每个实体至少一个，标识一行。
- \`@GeneratedValue(strategy = GenerationType.IDENTITY)\` —— 主键由数据库自增列生成。Insert 之后 Hibernate 通过 \`getGeneratedKeys\` 回填主键到实体。
- \`@Column(name = "username", length = 50, nullable = false, unique = true)\` —— 控制列定义，Hibernate 启动时会按这些属性生成 DDL。注意：这些约束只在自动建表时生效，生产环境通常禁用 DDL 自动生成。
- \`private Long id;\` —— 用包装类型而非 \`long\`，因为未保存的新实体主键是 \`null\`，可以区分「未持久化」与「主键为 0」。
- \`@Column(name = "created_at", updatable = false)\` —— \`updatable = false\` 表示该列不会被纳入 UPDATE 语句，创建时间永不被修改。
- \`protected User() {}\` —— JPA 规范要求实体有无参构造（public 或 protected），框架通过反射实例化时调用。设为 protected 避免外部误用空构造创建无效对象。

下面演示 EntityManager 的基本用法与状态转换：

\`\`\`java
@Service
public class UserService {

    @PersistenceContext            // 注入容器管理的 EntityManager，线程安全
    private EntityManager em;

    @Transactional                 // 开启事务
    public Long register(String username, String email) {
        User user = new User(username, email);   // 状态：NEW
        em.persist(user);                          // 状态变为 MANAGED
        // 此时 user.id 已经被回填（IDENTITY 策略）
        return user.getId();
    }

    @Transactional
    public void changeEmail(Long id, String newEmail) {
        User user = em.find(User.class, id);      // 状态：MANAGED
        user.setEmail(newEmail);                  // 修改托管对象
        // 无需调用 update，事务提交时脏检查自动生成 UPDATE
    }

    @Transactional
    public void remove(Long id) {
        User user = em.find(User.class, id);
        if (user != null) {
            em.remove(user);                       // 状态：REMOVED，提交时生成 DELETE
        }
    }

    @Transactional
    public User mergeDetached(User detachedUser) {
        // merge 返回托管副本，原 detached 对象状态不变
        User managed = em.merge(detachedUser);
        return managed;
    }
}
\`\`\`

关键点：

- \`@PersistenceContext\` 注入的是**容器代理的 EntityManager**，每次调用绑定当前事务，线程安全，可直接作为单例字段。
- \`persist\` 把 NEW 变成 MANAGED；\`find\` 返回的对象天然是 MANAGED。
- 修改 MANAGED 对象**不需要调用任何 update 方法**，事务提交时 Hibernate 对比快照自动 flush。
- \`merge\` 用于把游离对象「合并」回上下文，返回新托管对象，原对象仍是游离的，这是新手常踩的坑。

## 对比

| 维度 | JPA 规范 | Hibernate 实现 |
| --- | --- | --- |
| 定位 | 标准 API，定义接口契约 | 最流行的实现，提供扩展 |
| 包名 | jakarta.persistence | org.hibernate |
| 切换成本 | 业务代码不变 | 换实现只需改配置和依赖 |
| 扩展功能 | 无（只有规范定义的） | 有（如 @Formula、@Cache、Filter） |
| 学习曲线 | 适中 | 学习曲线更陡，但有大量特性 |

| 主键策略 | 数据库支持 | 性能 | 批量写入 | 可移植性 |
| --- | --- | --- | --- | --- |
| IDENTITY | MySQL/PostgreSQL/SQL Server | 中（insert 后才知 ID） | 差（禁用 JDBC 批量 insert） | 中 |
| SEQUENCE | Oracle/PostgreSQL/DB2 | 高（预分配 ID） | 好 | 中 |
| TABLE | 全部 | 差（每次都查表） | 中 | 高 |
| AUTO | 全部 | 取决于实现 | 不确定 | 最高但不可控 |

| 实体状态 | 触发动作 | 是否同步数据库 | 修改是否生效 |
| --- | --- | --- | --- |
| NEW | new 实体 | 否 | 不会持久化 |
| MANAGED | persist/find/merge 返回值 | 事务提交时同步 | 是（脏检查自动 UPDATE） |
| DETACHED | 事务结束/clear/detach | 否 | 不会自动同步 |
| REMOVED | remove 调用 | 提交时 DELETE | 已标记删除 |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| 实体没有无参构造 | JPA 通过反射调用无参构造 | 加一个 protected 无参构造 |
| 用基本类型做主键 | long 默认值 0，无法区分未保存 | 改用 Long 包装类型 |
| 直接修改 merge 的原对象 | merge 返回新托管对象，原对象仍是游离 | 使用 merge 的返回值 |
| IDENTITY 策略批量插入慢 | 每次 insert 立即执行以拿主键 | 改用 SEQUENCE 或 jdbc.batch_size |
| 在事务外修改托管对象 | 事务已提交对象变游离，修改无效 | 在 @Transactional 方法内操作或用 merge |
| toString 引发懒加载 | toString 打印关联对象触发 N+1 | 重写 toString 避开集合，或用 @JsonIgnore |
| equals/hashCode 用字段而非 ID | ID 未生成前为 null，集合操作异常 | 用 ID 判等（注意 null 处理）或用业务唯一字段 |
| 配置 ddl-auto=update 上生产 | 框架自动改表结构带来风险 | 生产用 validate 或 none，DDL 用工具管理 |
| 使用 javax.persistence 包名 | Spring Boot 3 用 Jakarta 命名空间 | 改用 jakarta.persistence |
`,
  },

  // =============================================================
  // 第三十四章:实体映射与关系
  // =============================================================
  {
    id: "jw-34",
    group: "Spring Data JPA",
    icon: "💾",
    title: "实体映射与关系",
    content: `# 实体映射与关系

## 概念讲解

上一章讲了实体基础，本章深入映射细节：列定制、时间字段、实体之间的关联关系。掌握关联映射是用好 JPA 的分水岭，因为关系一旦配错，要么 N+1 查询拖垮系统，要么级联删除把不该删的数据干掉。

### 基本映射：@Column 详解

\`@Column\` 控制字段如何映射到数据库列：

- \`name\`：列名，不写则用属性名（Hibernate 的命名策略会做驼峰转下划线，比如 \`createdAt\` → \`created_at\`）
- \`length\`：String 类型的列长度，默认 255
- \`nullable\`：是否允许 NULL，默认 true
- \`unique\`：是否唯一约束。注意：单列唯一写 \`unique=true\`，多列联合唯一要用 \`@Table(uniqueConstraints=...)\`
- \`insertable\` / \`updatable\`：是否参与 INSERT/UPDATE 语句，常用于数据库生成的字段（如审计字段、计算列）
- \`precision\` / \`scale\`：BigDecimal 的精度和小数位

### 时间映射

\`java.util.Date\` / \`java.util.Calendar\` 老用法配 \`@Temporal(TemporalType.DATE/TIME/TIMESTAMP)\`。**现代项目应直接用 \`java.time\` 包下的类型**（LocalDate、LocalTime、LocalDateTime、Instant），它们不需要 \`@Temporal\`，Hibernate 5+ 自动识别。

审计字段（创建时间、更新时间、创建人、更新人）推荐用 Spring Data JPA 的 \`@CreatedDate\`、\`@LastModifiedDate\`、\`@CreatedBy\`、\`@LastModifiedBy\` + \`@EntityListeners(AuditingEntityListener.class)\` + \`@EnableJpaAuditing\` 自动填充。

### 关联关系四种

JPA 的核心难点是四种关联，每个都要决定两件事：**方向**（单向/双向）和**多方**（一对多/多对一/一对一/多对多）。

**\`@ManyToOne\`**：最常用，总是外键方（维护方）。例如多个 OrderItem 属于一个 Order，OrderItem 表里有 \`order_id\` 列。默认 EAGER 加载，强烈建议改 LAZY。

**\`@OneToMany\`**：是 \`@ManyToOne\` 的反向，通常加 \`mappedBy\` 表示由对方维护外键。默认 LAZY。

**\`@OneToOne\`**：一对一，外键可在任一方。共享主键或外键两种实现。

**\`@ManyToMany\`**：多对多，必须通过中间关联表（\`@JoinTable\`）。实际项目里很多团队放弃多对多，改用中间实体（如 \`UserRole\`）以携带额外字段（如分配时间）。

### cascade 级联类型

\`cascade\` 决定对父实体的操作是否传播到子实体：

- **\`PERSIST\`**：保存父时一并保存子（\`persist\` 传播）
- **\`MERGE\`**：合并传播
- **\`REMOVE\`**：删除父时一并删子（\`remove\` 传播）—— 危险，慎用
- **\`REFRESH\`**：刷新传播
- **\`DETACH\`**：脱离传播
- **\`ALL\`**：以上全部

注意：\`cascade = REMOVE\` 与 \`orphanRemoval = true\` 不同。前者只在通过 \`remove\` 显式删除父时生效；后者在「从集合中移除子」时就把数据库里那行删掉，更彻底。

### fetch 抓取策略

- **\`EAGER\`**（默认 \`@ManyToOne\`、\`@OneToOne\`）：加载父实体时立即加载关联，可能产生额外查询或 JOIN。
- **\`LAZY\`**（默认 \`@OneToMany\`、\`@ManyToMany\`）：加载父实体时返回代理，访问关联属性时才查数据库。

经验法则：**全部用 LAZY**，需要的数据用 JOIN FETCH 显式拉。EAGER 是 N+1 问题的温床。

### @JoinColumn 与 @JoinTable

\`@JoinColumn\` 指定外键列名，常配 \`@ManyToOne\`、\`@OneToOne\`：

\`\`\`java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "order_id", nullable = false)
private Order order;
\`\`\`

\`@JoinTable\` 用于多对多，指定中间表名和两个外键列：

\`\`\`java
@ManyToMany
@JoinTable(
    name = "user_role",
    joinColumns = @JoinColumn(name = "user_id"),
    inverseJoinColumns = @JoinColumn(name = "role_id")
)
private Set<Role> roles = new HashSet<>();
\`\`\`

### 双向关联与 mappedBy

双向关联中只有一方维护外键（「维护方」），另一方用 \`mappedBy\` 指向对方的属性名，表示「我不维护关系，请看对方」。例如 Order 与 OrderItem 双向，OrderItem 是维护方（外键在它身上），Order 用 \`@OneToMany(mappedBy = "order")\`。

新手常踩的坑：只 set 了集合侧没 set 维护方，结果外键为 null。最佳实践：在父实体里提供 \`addItem\` / \`removeItem\` 同步两边的方法。

## 设计原则

1. **优先单向关联**：双向关联需要同步两边状态，复杂且易错。除非有真实业务查询需求，否则用单向。
2. **集合字段初始化**：\`private List<Item> items = new ArrayList<>();\` 避免空指针，也方便 add/remove。
3. **集合用接口类型声明**：\`List\`/\`Set\` 而非 \`ArrayList\`/\`HashSet\`，Hibernate 需要用自己的持久化集合代理替换。
4. **避免在实体 toString/equals 中触碰关联集合**：会触发懒加载或 StackOverflow（双向引用）。要么不输出关联，要么用 ID。
5. **级联克制使用**：只在「子实体生命周期完全依附于父」时用 \`cascade = ALL\` + \`orphanRemoval = true\`，比如 Order 与 OrderItem。强关联外的场景应手动管理。
6. **多对多慎用**：优先用中间实体，能携带额外字段且关系清晰。

## 使用场景

- 电商订单：Order 1—N OrderItem N—1 Product
- 用户权限：User N—N Role N—N Permission（推荐中间实体 UserRole、RolePermission）
- 论坛：Topic 1—N Post 1—N Comment
- 用户资料：User 1—1 UserProfile
- 组织架构：Department 自关联 1—N Department（parent/children）
- 审计场景：基础实体含 createdAt/updatedAt，配合 @MappedSuperclass 抽出公共字段

## 代码逐行讲解

下面演示一对多双向 + 级联 + 审计字段的完整示例：

\`\`\`java
// 基础实体，提取公共审计字段
@MappedSuperclass                        // 不是实体，子类继承它的映射
@EntityListeners(AuditingEntityListener.class)  // 启用 JPA 审计监听
public abstract class BaseEntity {

    @CreatedDate                         // 创建时自动填充
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate                    // 更新时自动填充
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @CreatedBy                           // 创建人，需配合 AuditorAware
    @Column(name = "created_by", updatable = false)
    private String createdBy;

    // getter / setter 省略
}

@Entity
@Table(name = "orders")
public class Order extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String orderNo;             // 业务订单号

    @OneToMany(mappedBy = "order",       // 由 OrderItem.order 维护外键
               cascade = CascadeType.ALL,  // 级联保存/删除
               orphanRemoval = true,       // 从集合移除即删数据库行
               fetch = FetchType.LAZY)     // 懒加载
    private List<OrderItem> items = new ArrayList<>();  // 初始化空集合

    // 工具方法：双向同步
    public void addItem(OrderItem item) {
        items.add(item);                 // 维护集合侧
        item.setOrder(this);             // 维护外键侧（关键！）
    }

    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);             // orphanRemoval 会把数据库行删掉
    }

    // getter / setter 省略
}

@Entity
@Table(name = "order_items")
public class OrderItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;                  // 维护方，外键在它身上

    @Column(nullable = false)
    private String productName;

    @Column(nullable = false)
    private BigDecimal price;

    private Integer quantity;

    // getter / setter 省略
}
\`\`\`

逐行解析：

- \`@MappedSuperclass\` —— \`BaseEntity\` 不是实体，不会建表，但子类继承它的字段映射。常用于公共审计字段、租户字段。
- \`@EntityListeners(AuditingEntityListener.class)\` —— 注入 Spring Data JPA 提供的审计监听器，配合 \`@EnableJpaAuditing\` 启用。
- \`@CreatedDate\` / \`@LastModifiedDate\` —— 框架自动填充时间，不需要手动 set。
- \`@CreatedBy\` —— 需要提供 \`AuditorAware<String>\` Bean 才能填充当前用户。
- \`@OneToMany(mappedBy = "order", ...)\` —— \`mappedBy\` 指向 OrderItem 的 \`order\` 属性。**这是非维护方**，外键由对方维护。注意：在 Order 上 set items 不会更新数据库外键，必须在 OrderItem.order 上设值。
- \`cascade = CascadeType.ALL\` —— 保存 Order 时一并保存其 items；删除 Order 时一并删除 items。
- \`orphanRemoval = true\` —— 从 items 集合移除一个 OrderItem，对应的数据库行会被删除。这是真正的「父管理子生命周期」。
- \`fetch = FetchType.LAZY\` —— items 默认不加载，访问时才查。一定要配 LAZY。
- \`private List<OrderItem> items = new ArrayList<>();\` —— 初始化空集合，避免空指针，也方便直接 \`addItem\`。
- \`addItem\` / \`removeItem\` 工具方法 —— **双向同步的关键**。同时修改集合侧和外键侧，避免「外键为 null」的常见 bug。
- \`@ManyToOne(fetch = FetchType.LAZY, optional = false)\` —— 多对一也强制 LAZY（默认是 EAGER，要主动改）。\`optional = false\` 表示关系必需（数据库外键非空）。
- \`@JoinColumn(name = "order_id", nullable = false)\` —— 指定外键列名，与 DDL 一致。

下面是多对多改用中间实体的推荐做法：

\`\`\`java
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserRole> roles = new ArrayList<>();

    public void assignRole(Role role, String assignedBy) {
        UserRole ur = new UserRole();
        ur.setUser(this);
        ur.setRole(role);
        ur.setAssignedBy(assignedBy);
        ur.setAssignedAt(LocalDateTime.now());  // 中间实体可携带额外字段
        roles.add(ur);
    }
}

@Entity
@Table(name = "user_roles",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "role_id"}))
public class UserRole {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    private Role role;

    @Column(name = "assigned_by")
    private String assignedBy;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;
    // 携带分配人、分配时间，这是 @ManyToMany 直接关联做不到的
}

@Entity
@Table(name = "roles")
public class Role {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;
}
\`\`\`

## 对比

| 维度 | EAGER 加载 | LAZY 加载 |
| --- | --- | --- |
| 加载时机 | 立即查关联数据 | 访问属性时才查 |
| SQL 数量 | 1-N 次（看配置） | 按需 |
| N+1 风险 | 高（默认遍历触发） | 中（需显式 JOIN FETCH） |
| 适用 | 极少用（强必需字段） | 大多数场景 |

| 维度 | cascade=REMOVE | orphanRemoval=true |
| --- | --- | --- |
| 触发条件 | 显式 remove 父实体 | 从集合移除子 |
| 是否删数据库行 | 是 | 是 |
| 是否影响游离对象 | 否 | 否（仅托管状态生效） |
| 语义 | 父删除子跟着删 | 子脱离父就被删 |

| 维度 | @ManyToMany 直接关联 | 中间实体 |
| --- | --- | --- |
| 携带额外字段 | 不行 | 可以 |
| 查询 | 自动 | 多一层 JOIN |
| 业务表达 | 隐式 | 显式清晰 |
| 推荐 | 简单场景 | 大多数实际项目 |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| 双向关联只 set 一边 | 外键由维护方决定，没 set 维护方导致外键 null | 提供同步方法同时 set 两边 |
| @ManyToOne 默认 EAGER | 加载父实体触发额外查询 | 显式设 fetch = LAZY |
| 在事务外访问懒加载属性 | Session 已关闭，抛 LazyInitializationException | 在 Service 内完成读取或用 DTO 投影 |
| toString 打印双向集合 | 互相递归调用导致栈溢出 | toString 避开关联或用 ID |
| cascade=ALL 用在弱关联 | 删用户级联删订单，业务灾难 | 强关联才用级联，弱关联手动管理 |
| 多对多直接关联想加字段 | 中间表无法携带额外列 | 改用中间实体 |
| @OneToMany 双向忘了 mappedBy | 默认会生成一张中间关联表 | 显式写 mappedBy 指向对方属性 |
| orphanRemoval 配 LAZY 集合未初始化 | 移除时仍要查数据库 | 移除前确保集合已加载 |
| equals/hashCode 用懒加载关联 | 触发懒加载且影响性能 | 仅用业务主键或 ID |
| @CreatedDate 不生效 | 忘了 @EnableJpaAuditing 或 AuditorAware | 配置审计 + AuditorAware Bean |
`,
  },

  // =============================================================
  // 第三十五章:Spring Data JPA 仓库
  // =============================================================
  {
    id: "jw-35",
    group: "Spring Data JPA",
    icon: "💾",
    title: "Spring Data JPA 仓库",
    content: `# Spring Data JPA 仓库

## 概念讲解

Spring Data JPA 在 JPA 之上做了一层**仓库抽象**：你只需定义接口，框架在运行时生成实现类并注入。这一层把「写 CRUD 模板」彻底消灭，是 Spring 生态里最有生产力的模块之一。

### Repository 接口体系

Spring Data 的仓库接口有清晰的继承层次，按功能从弱到强：

\`\`\`
Repository<T, ID>                         // 仅标记，无方法
   ↑
CrudRepository<T, ID>                     // save/findOne/findAll/delete 等 CRUD
   ↑
PagingAndSortingRepository<T, ID>         // 加分页 findAll(Pageable) 和排序 findAll(Sort)
   ↑
JpaRepository<T, ID>                      // 加 flush、saveAndFlush、批量 deleteInBatch 等 JPA 专属
\`\`\`

选择哪个：

- 只读场景或想完全自定义：直接继承 \`Repository\`，配合 \`@Query\` 写方法。
- 通用 CRUD：\`CrudRepository\` 够用。
- 需要分页排序：\`PagingAndSortingRepository\`。
- 需要 JPA 专属能力（flush、批量操作）：\`JpaRepository\`。

实际项目大多直接用 \`JpaRepository\`，但继承越具体耦合越深。如果追求纯净，用 \`CrudRepository\` + \`@Query\` 也能完成 90% 任务。

### @Repository 自动实现

定义接口后，Spring 启动时扫描带 \`@Repository\` 的接口（或被 \`@EnableJpaRepositories\` 扫描），为它生成代理实现类并注册为 Bean。无需写任何实现代码。

### 方法名查询

这是 Spring Data JPA 的招牌特性：**按方法命名约定，框架解析出查询**。比如 \`findByNameAndAge\` 会被翻译成 \`where name=? and age=?\`。

关键字前缀：

- \`findBy\`、\`readBy\`、\`getBy\`、\`queryBy\`、\`streamBy\`、`countBy`、\`existsBy\`、\`deleteBy\` —— 都表示查询/统计/删除
- 后接属性名 + 关键字：\`And\`、\`Or\`、\`Between\`、\`LessThan\`、\`GreaterThan\`、\`Like\`、\`NotLike\`、\`StartingWith\`、\`EndingWith\`、\`Containing\`、\`OrderBy\`、\`IsNull\`、\`IsNotNull\`、\`In\`、\`NotIn\`、\`IgnoreCase\`、\`Distinct\`

例：

\`\`\`java
List<User> findByLastnameOrderByFirstnameDesc(String lastname);   // order by firstname desc
List<User> findByAgeBetween(int min, int max);                    // age between ? and ?
List<User> findByEmailContaining(String keyword);                 // email like %?%
long countByActiveTrue();                                          // count(*) where active = true
boolean existsByUsername(String username);                         // exists 查询
\`\`\`

方法名查询优点是快、零配置；缺点是复杂查询会让方法名极长，可读性差。这时改用 \`@Query\`。

### @Query 自定义查询

\`@Query\` 让你直接写 JPQL 或原生 SQL：

\`\`\`java
@Query("select u from User u where u.email like %:keyword%")
List<User> searchByEmail(@Param("keyword") String keyword);

@Query(value = "select * from users where status = :status", nativeQuery = true)
List<User> findByStatusNative(@Param("status") int status);
\`\`\`

- 默认是 JPQL（面向实体类的查询语言，下一章详讲）。
- \`nativeQuery = true\` 切换到原生 SQL。
- 参数绑定用 \`@Param("name")\` 配合 \`:name\`，或用位置参数 \`?1\`、\`?2\`（不推荐，难维护）。

### @Modifying

执行 UPDATE / DELETE 的查询要加 \`@Modifying\`，并配合 \`@Transactional\`：

\`\`\`java
@Modifying
@Query("update User u set u.email = :email where u.id = :id")
int updateEmail(@Param("id") Long id, @Param("email") String email);
\`\`\`

返回值是受影响行数。注意：\`@Modifying\` 默认不刷新持久化上下文，可能导致一级缓存与数据库不一致，可加 \`clearAutomatically = true\` 让执行后清空上下文。

### 分页 Pageable / Slice / Page

分页用 \`Pageable\` 参数，返回值有三种：

- \`List<T>\`：只取数据，不分页元信息。
- \`Slice<T>\`：有 \`hasNext()\`、\`getContent()\`，不查 \`totalCount\`，性能好。适合无限滚动。
- \`Page<T>\`：继承 \`Slice\`，多了 \`getTotalElements()\`、\`getTotalPages()\`。会多执行一次 count 查询，适合传统分页 UI。

\`\`\`java
Page<User> findByActive(boolean active, Pageable pageable);
\`\`\`

调用：

\`\`\`java
Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());
Page<User> page = repo.findByActive(true, pageable);
List<User> users = page.getContent();
long total = page.getTotalElements();
\`\`\`

### 排序 Sort

\`Sort\` 可单独使用或嵌入 \`Pageable\`：

\`\`\`java
List<User> findByActive(boolean active, Sort sort);

repo.findByActive(true, Sort.by("createdAt").descending().and(Sort.by("username").ascending()));
\`\`\`

注意 \`Sort\` 的字段名是**实体属性名**（驼峰），不是数据库列名。

## 设计原则

1. **仓库只做数据访问**：不要在仓库里写业务逻辑，业务规则放 Service。
2. **复杂查询用 @Query**：方法名超过三四个关键字就要改 \`@Query\`，可读性更高。
3. **投影用接口或 record**：只读部分字段时不要返回完整实体，用投影减少传输与内存。
4. **只读方法加只读事务**：\`@Transactional(readOnly = true)\` 让 Hibernate 跳过脏检查，性能更好。
5. **分页优先 Slice**：除非要显示总页数，用 \`Slice\` 避免 count 查询。

## 使用场景

- 标准 CRUD：用户、商品、配置等表的管理
- 列表分页查询：管理后台
- 报表统计：count/sum 等聚合
- 关键字搜索：like 模糊查询
- 批量更新：用 \`@Modifying\` + 批量 UPDATE 一条 SQL 搞定
- 不适用：极复杂的动态条件拼接（用 Specification 或 QueryDSL）、超大数据集（用 JDBC 流式或分批处理）

## 代码逐行讲解

下面是完整的仓库定义示例，覆盖各种用法：

\`\`\`java
public interface UserRepository extends JpaRepository<User, Long> {

    // ===== 方法名查询 =====

    // 根据用户名查找（单个）
    Optional<User> findByUsername(String username);

    // 多条件 + 排序
    List<User> findByLastnameAndAgeGreaterThanOrderByFirstnameAsc(
        String lastname, int minAge);

    // 模糊查询
    List<User> findByEmailContainingIgnoreCase(String keyword);

    // 是否存在
    boolean existsByUsername(String username);

    // 统计
    long countByActiveTrue();

    // 删除（需要 @Transactional）
    long deleteByActiveFalse();

    // ===== @Query JPQL =====

    // 命名参数 + 模糊
    @Query("select u from User u where u.email like %:keyword% " +
           "and u.active = :active order by u.createdAt desc")
    List<User> searchActiveUsers(@Param("keyword") String keyword,
                                 @Param("active") boolean active);

    // 投影：只取部分字段（用接口）
    interface UserSummary {
        Long getId();
        String getUsername();
        String getEmail();
    }

    @Query("select u.id as id, u.username as username, u.email as email " +
           "from User u where u.active = true")
    List<UserSummary> findAllActiveSummaries();

    // ===== @Modifying 更新 =====

    @Modifying(clearAutomatically = true)        // 执行后清空一级缓存避免脏数据
    @Query("update User u set u.active = :active where u.id in :ids")
    int batchUpdateActive(@Param("ids") List<Long> ids,
                          @Param("active") boolean active);

    // ===== 分页 =====

    Page<User> findByActive(boolean active, Pageable pageable);

    Slice<User> findByCreatedAtAfter(LocalDateTime time, Pageable pageable);

    // ===== 原生 SQL =====

    @Query(value = "select * from users where date(created_at) = :date",
           nativeQuery = true)
    List<User> findByExactDate(@Param("date") LocalDate date);

    @Query(value = "select count(*) from users where active = true",
           nativeQuery = true)
    long countActiveNative();
}
\`\`\`

逐行解析：

- \`extends JpaRepository<User, Long>\` —— 实体类型 \`User\`，主键类型 \`Long\`。自动获得 \`save\`、\`findById\`、\`findAll\`、\`deleteById\` 等 20+ 方法。
- \`Optional<User> findByUsername(String)\` —— 返回 \`Optional\` 表示可能没有，调用方必须处理不存在的情况，比返回 \`null\` 安全。
- \`findByLastnameAndAgeGreaterThanOrderByFirstnameAsc\` —— 方法名解析：\`where lastname = ? and age > ? order by firstname asc\`。注意 \`GreaterThan\` 是 \`>\`，\`GreaterThanEqual\` 才是 \`>=\`。
- \`findByEmailContainingIgnoreCase\` —— \`Containing\` 翻译成 \`like %?%\`，\`IgnoreCase\` 加 \`lower()\` 函数（数据库大小写不敏感时无效）。
- \`long countByActiveTrue()\` —— \`True\` 表示布尔为 true，返回 long。
- \`long deleteByActiveFalse()\` —— 删除方法，**必须在事务内调用**，通常 Service 层加 \`@Transactional\`。
- \`@Query("select u from User u where ...")\` —— JPQL，\`User\` 是实体名（不是表名），\`u\` 是别名。
- \`@Param("keyword")\` —— 命名参数，与 JPQL 里的 \`:keyword\` 对应。Spring Boot 3.x 编译时保留参数名，可省略 \`@Param\`，但显式写更清晰、向后兼容。
- \`interface UserSummary { ... }\` —— **投影接口**，Spring Data 在运行时生成实现，只 SELECT 三列。比返回完整实体省内存、省网络。
- \`@Modifying(clearAutomatically = true)\` —— 标记为修改查询，\`clearAutomatically\` 让执行后清空 EntityManager 缓存，避免读到旧数据。
- \`Page<User> findByActive(boolean, Pageable)\` —— 传入 \`Pageable\` 自动分页，返回 \`Page\` 包含总数和内容。
- \`Slice<User> findByCreatedAtAfter(LocalDateTime, Pageable)\` —— \`Slice\` 不查总数，适合无限滚动场景。
- \`nativeQuery = true\` —— 切换到原生 SQL，\`users\` 是表名。JPQL 不支持的数据库函数（如 \`date()\`）只能用原生。

下面是 Service 层调用示例：

\`\`\`java
@Service
@Transactional(readOnly = true)          // 类级别只读事务
public class UserService {

    private final UserRepository repo;

    public UserService(UserRepository repo) { this.repo = repo; }

    public Optional<User> findByUsername(String username) {
        return repo.findByUsername(username);
    }

    public Page<User> listActiveUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size,
            Sort.by("createdAt").descending());
        return repo.findByActive(true, pageable);
    }

    public List<UserRepository.UserSummary> listActiveSummaries() {
        return repo.findAllActiveSummaries();   // 只取三列，效率高
    }

    @Transactional                          // 单独覆盖为读写事务
    public int deactivate(List<Long> ids) {
        return repo.batchUpdateActive(ids, false);   // 返回受影响行数
    }
}
\`\`\`

## 对比

| 维度 | CrudRepository | JpaRepository |
| --- | --- | --- |
| 方法数 | 少（CRUD 基础） | 多（flush、saveAndFlush、deleteInBatch 等） |
| 耦合度 | 低 | 较高（绑 JPA） |
| 适用 | 通用、跨存储 | JPA 项目 |

| 维度 | 方法名查询 | @Query |
| --- | --- | --- |
| 学习成本 | 低（关键字） | 中（要会 JPQL） |
| 复杂度 | 简单查询 | 复杂查询 |
| 可读性 | 简单时高，复杂时差 | 始终清晰 |
| 性能 | 一样 | 一样 |
| 灵活 | 受关键字限制 | 高（可写任意 JPQL/SQL） |

| 维度 | Slice | Page |
| --- | --- | --- |
| 包含总数 | 否 | 是 |
| SQL 次数 | 1（数据） | 2（数据 + count） |
| 适用 | 无限滚动、瀑布流 | 传统分页 UI 显示页码 |

| 维度 | 返回完整实体 | 返回投影 |
| --- | --- | --- |
| 数据传输量 | 大 | 小 |
| 内存占用 | 大 | 小 |
| 字段固定 | 否 | 是 |
| 适用 | 写入场景 | 只读列表展示 |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| 方法名拼错关键字 | 解析失败抛 InvalidDataAccessApiUsageException | 查官方文档关键字表，用 IDE 插件校验 |
| deleteBy 没加事务 | 默认只读，删除会失败 | Service 加 @Transactional |
| @Modifying 不清缓存 | 一级缓存读到旧数据 | 加 clearAutomatically = true |
| 分页页码从 1 开始 | Spring Data 页码从 0 开始 | 调用方减 1 |
| 投影接口属性名与别名不符 | 投影为 null | 别名 as 属性名要对应 |
| nativeQuery 用实体名 | 原生 SQL 应用表名 | 区分 JPQL（实体名）与 SQL（表名） |
| 大结果集直接 findAll | 内存溢出 | 用分页或 Stream<T> 流式处理 |
| 忽略 Optional 直接 get | 找不到抛 NoSuchElementException | 用 isPresent / orElse 处理 |
| 投影接口想写入 | 投影是只读接口 | 写入用完整实体 |
| @Query 用 select * | JPQL 不支持 * | 用 select u from User u |
`,
  },

  // =============================================================
  // 第三十六章:查询方法与 JPQL
  // =============================================================
  {
    id: "jw-36",
    group: "Spring Data JPA",
    icon: "💾",
    title: "查询方法与 JPQL",
    content: `# 查询方法与 JPQL

## 概念讲解

上一章讲了仓库的用法，本章深入 JPQL 语法和高级查询。掌握 JPQL 让你能写任意复杂度的查询，不依赖方法名关键字的限制。

### JPQL 与 SQL 的区别

JPQL（Java Persistence Query Language）是面向**实体类**的查询语言，而 SQL 面向**数据库表**：

| 维度 | JPQL | SQL |
| --- | --- | --- |
| 操作对象 | 实体类 | 数据库表 |
| 大小写 | 实体名大小写敏感 | 表名通常不敏感 |
| 字段 | 实体属性名 | 列名 |
| 关联 | 用对象导航（u.orders） | 用 JOIN + ON |
| 数据库函数 | 部分（不支持方言特定函数） | 全部 |
| 可移植性 | 高 | 低 |

JPQL 最终会被 Hibernate 翻译成具体数据库的 SQL，所以你在 JPQL 里写的查询可以跨 MySQL、PostgreSQL、Oracle 运行。

### JPQL 语法

完整语法类似 SQL：

\`\`\`
SELECT [DISTINCT] select_clause
FROM from_clause
[WHERE where_clause]
[GROUP BY group_by_clause [HAVING having_clause]]
[ORDER BY order_by_clause]
\`\`\`

例：

\`\`\`jpql
select u from User u
where u.age > :minAge
  and u.active = true
order by u.createdAt desc
\`\`\`

注意 \`u\` 是实体别名（任意名字，类似 SQL 表别名），\`u.age\` 是属性导航，会被翻译成数据库列 \`age\`。

### 参数绑定

**位置参数**（不推荐）：\`?1\`、\`?2\`，顺序敏感，加参数就崩。

**命名参数**（推荐）：\`:name\`，配合 \`@Param("name")\`：

\`\`\`java
@Query("select u from User u where u.username = :name")
User findByName(@Param("name") String name);
\`\`\`

**命名参数**可读性强、顺序无关、易扩展。

### 聚合函数

JPQL 支持 \`COUNT\`、\`SUM\`、\`AVG\`、\`MAX\`、\`MIN\`：

\`\`\`java
@Query("select count(u) from User u where u.active = :active")
long countByActive(@Param("active") boolean active);

@Query("select avg(u.age) from User u where u.country = :country")
Double averageAge(@Param("country") String country);
\`\`\`

聚合通常配合 GROUP BY / HAVING 使用。

### GROUP BY / HAVING

\`\`\`jpql
select u.country, count(u)
from User u
where u.active = true
group by u.country
having count(u) > :minCount
order by count(u) desc
\`\`\`

返回多列结果时，可用 \`List<Object[]>\` 接收，或定义 DTO 构造表达式：

\`\`\`java
@Query("select new com.example.dto.CountryStat(u.country, count(u)) " +
       "from User u group by u.country")
List<CountryStat> countByCountry();
\`\`\`

\`CountryStat\` 要有匹配参数的构造函数。

### 关联查询 JOIN FETCH

普通 JOIN 不影响实体加载策略，关联属性仍是懒加载。**JOIN FETCH** 强制一次性把关联数据查出来，是解决 N+1 的标准手段：

\`\`\`java
@Query("select distinct o from Order o " +
       "left join fetch o.items " +
       "where o.id = :id")
Order findWithItems(@Param("id") Long id);
\`\`\`

不加 \`fetch\` 只是过滤条件，加了 \`fetch\` 才真正取数据并填充到实体。

注意：

- \`fetch\` 的 JOIN 不能用于关联实体的 WHERE 条件中（只能用普通 JOIN）
- \`JOIN FETCH\` 后不能在 SELECT 里引用 fetch 的关联（默认就是取主实体）
- 双向关联全 fetch 容易笛卡尔积，要加 \`distinct\`

### 子查询

JPQL 支持子查询，常用于 \`EXISTS\`、\`IN\`：

\`\`\`jpql
select u from User u
where u.id in (select o.user.id from Order o where o.total > 1000)
\`\`\`

或 \`EXISTS\`：

\`\`\`jpql
select u from User u
where exists (select 1 from Order o where o.user = u and o.status = 'PAID')
\`\`\`

### 命名查询 @NamedQuery

预先定义好的 JPQL，启动时校验语法，避免运行时才发现错误：

\`\`\`java
@Entity
@NamedQuery(name = "User.findByActive",
            query = "select u from User u where u.active = :active")
public class User { ... }
\`\`\`

仓库里：

\`\`\`java
@Query(name = "User.findByActive")   // 引用命名查询
List<User> findByActive(@Param("active") boolean active);
\`\`\`

现代项目多用 \`@Query\` 直接写在仓库上，\`@NamedQuery\` 用得少，但启动校验语法这点有价值。

### Specifications 动态查询

业务里常常要拼条件：「按用户名查、可选按邮箱查、可选按状态查」—— 条件个数运行时才知道。方法名查询和 \`@Query\` 都是静态的。Spring Data JPA 提供 \`Specification\`（基于 JPA Criteria API）做动态拼接：

让仓库继承 \`JpaSpecificationExecutor\`：

\`\`\`java
public interface UserRepository
    extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
}
\`\`\`

使用：

\`\`\`java
public List<User> search(String username, String email, Boolean active) {
    Specification<User> spec = (root, query, cb) -> {
        List<Predicate> ps = new ArrayList<>();
        if (username != null) {
            ps.add(cb.like(root.get("username"), "%" + username + "%"));
        }
        if (email != null) {
            ps.add(cb.equal(root.get("email"), email));
        }
        if (active != null) {
            ps.add(cb.equal(root.get("active"), active));
        }
        return cb.and(ps.toArray(new Predicate[0]));
    };
    return repo.findAll(spec);
}
\`\`\`

\`Specification\` 是函数式接口，参数：\`root\`（根实体，取字段用）、\`query\`（查询对象）、\`cb\`（CriteriaBuilder，构造谓词）。可读性差但灵活。

### QueryDSL 简介

Criteria API 写起来又长又难懂，QueryDSL 提供了**类型安全**的流畅 API，是替代方案：

\`\`\`java
QUser user = QUser.user;
List<User> result = queryFactory
    .selectFrom(user)
    .where(user.username.contains(keyword)
        .and(user.active.isTrue()))
    .orderBy(user.createdAt.desc())
    .fetch();
\`\`\`

Q 类由 Maven 插件根据实体自动生成。优点：

- 类型安全（属性名错就编译失败）
- 重构友好（改字段名自动跟着变）
- API 流畅，比 Criteria 可读

缺点：要加插件、生成 Q 类、学习成本。复杂动态查询项目里非常值得。

## 设计原则

1. **参数绑定用命名参数**：可读、可维护、不易错。
2. **N+1 用 JOIN FETCH 解决**：列表展示关联数据时一定要 fetch。
3. **复杂动态条件用 Specification 或 QueryDSL**：别用字符串拼接 SQL（注入风险）。
4. **聚合查询用投影 DTO**：别返回 Object[] 难维护。
5. **分页大表用 count 优化**：Page 的 count 在大表上慢，可考虑 Slice 或手写 count 查询。
6. **避免 select 全部字段**：只查需要的列，用投影减少传输。

## 使用场景

- 多条件动态查询：管理后台筛选器
- 关联数据展示：订单 + 明细
- 报表统计：分组聚合
- 关键字搜索：like 多字段
- 复杂业务规则：子查询判断
- 不适用：跨多库、超大数据集 —— 用专门的数据访问方案

## 代码逐行讲解

下面是覆盖 JPQL 各种特性的仓库示例：

\`\`\`java
public interface OrderRepository
    extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    // ===== JOIN FETCH 解决 N+1 =====

    @Query("select distinct o from Order o " +
           "left join fetch o.items i " +              // 一次性加载明细
           "where o.userId = :userId " +
           "order by o.createdAt desc")
    List<Order> findWithItemsByUser(@Param("userId") Long userId);

    // ===== 聚合 + GROUP BY + DTO 投影 =====

    @Query("select new com.example.dto.UserOrderStat(" +     // 构造表达式
           "       o.userId, count(o), sum(o.total)) " +
           "from Order o " +
           "where o.createdAt >= :since " +
           "group by o.userId " +
           "having sum(o.total) > :minTotal " +
           "order by sum(o.total) desc")
    List<UserOrderStat> statByUser(@Param("since") LocalDateTime since,
                                   @Param("minTotal") BigDecimal minTotal);

    // ===== 子查询 =====

    @Query("select u from User u " +
           "where u.id in (select o.userId from Order o where o.status = :status)")
    List<User> findUsersWithOrderStatus(@Param("status") String status);

    @Query("select u from User u where exists " +
           "(select 1 from Order o where o.userId = u.id and o.total > :min)")
    List<User> findUsersWithBigOrder(@Param("min") BigDecimal min);

    // ===== 聚合函数 =====

    @Query("select count(o) from Order o where o.status = :status")
    long countByStatus(@Param("status") String status);

    @Query("select coalesce(sum(o.total), 0) from Order o " +    // 处理 null
           "where o.userId = :userId and o.status = 'PAID'")
    BigDecimal totalPaidByUser(@Param("userId") Long userId);

    // ===== 子查询 + 关联 =====

    @Query("select o from Order o where o.total = " +
           "(select max(o2.total) from Order o2)")
    List<Order> findMaxTotalOrders();
}
\`\`\`

逐行解析：

- \`left join fetch o.items i\` —— \`left\` 保证没有明细的订单也返回；\`fetch\` 把明细一次性查出来填充到 \`o.items\`；\`i\` 是关联的别名。\`distinct\` 防止一个订单有多条明细时返回重复的 Order。
- \`select new com.example.dto.UserOrderStat(o.userId, count(o), sum(o.total))\` —— **构造表达式**，JPQL 直接调用 DTO 构造函数。要求 DTO 有匹配参数类型和顺序的构造函数。返回强类型 \`List<UserOrderStat>\` 而非 \`List<Object[]>\`。
- \`group by o.userId having sum(o.total) > :minTotal\` —— 先按用户分组，再用 HAVING 过滤组级条件（having 用聚合，where 不能）。
- \`where u.id in (select o.userId from Order o where o.status = :status)\` —— 子查询返回 ID 集合，外层用 IN 过滤。
- \`where exists (select 1 from Order o where o.userId = u.id ...)\` —— 关联子查询，外层 \`u\` 是主查询的别名，子查询里能引用。EXISTS 比 IN 在大数据集上通常更快。
- \`coalesce(sum(o.total), 0)\` —— \`coalesce\` 返回第一个非 null 参数，避免用户没订单时返回 null 让调用方崩。
- \`select o from Order o where o.total = (select max(o2.total) from Order o2)\` —— 子查询返回标量，外层用 = 比较。

DTO 定义：

\`\`\`java
package com.example.dto;

import java.math.BigDecimal;

public class UserOrderStat {
    private final Long userId;
    private final Long orderCount;
    private final BigDecimal totalAmount;

    // 构造函数参数顺序与 JPQL 一致
    public UserOrderStat(Long userId, Long orderCount, BigDecimal totalAmount) {
        this.userId = userId;
        this.orderCount = orderCount;
        this.totalAmount = totalAmount;
    }

    public Long getUserId() { return userId; }
    public Long getOrderCount() { return orderCount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
}
\`\`\`

Specification 动态查询完整示例：

\`\`\`java
@Service
@Transactional(readOnly = true)
public class OrderQueryService {

    private final OrderRepository repo;

    public OrderQueryService(OrderRepository repo) { this.repo = repo; }

    public Page<Order> search(OrderQuery q, Pageable pageable) {
        // 用 Specification 拼条件
        Specification<Order> spec = Specification.where(null);

        if (q.getUserId() != null) {
            spec = spec.and((root, query, cb) ->
                cb.equal(root.get("userId"), q.getUserId()));
        }
        if (q.getStatus() != null) {
            spec = spec.and((root, query, cb) ->
                cb.equal(root.get("status"), q.getStatus()));
        }
        if (q.getMinTotal() != null) {
            spec = spec.and((root, query, cb) ->
                cb.greaterThan(root.get("total"), q.getMinTotal()));
        }
        if (q.getStart() != null && q.getEnd() != null) {
            spec = spec.and((root, query, cb) ->
                cb.between(root.get("createdAt"), q.getStart(), q.getEnd()));
        }

        return repo.findAll(spec, pageable);
    }
}
\`\`\`

解析：

- \`Specification.where(null)\` —— 创建空 Specification 作为起点。
- \`spec.and((root, query, cb) -> ...)\` —— 链式追加 AND 条件。每个 lambda 接收 \`root\`（实体根）、\`query\`（查询对象）、\`cb\`（CriteriaBuilder）。
- \`cb.equal(root.get("userId"), value)\` —— 等于条件。注意 \`"userId"\` 是字符串，没类型安全。
- \`cb.greaterThan(root.get("total"), min)\` —— 大于。
- \`cb.between(root.get("createdAt"), start, end)\` —— BETWEEN。
- 只在条件非 null 时才追加，实现「可选筛选」。
- \`repo.findAll(spec, pageable)\` —— Specification + Pageable 组合使用。

QueryDSL 等价实现：

\`\`\`java
@Service
@Transactional(readOnly = true)
public class OrderQueryServiceQdsl {

    private final JPAQueryFactory queryFactory;

    public OrderQueryServiceQdsl(JPAQueryFactory queryFactory) {
        this.queryFactory = queryFactory;
    }

    public List<Order> search(OrderQuery q) {
        QOrder order = QOrder.order;

        // 构建条件，类型安全
        BooleanBuilder builder = new BooleanBuilder();
        if (q.getUserId() != null) {
            builder.and(order.userId.eq(q.getUserId()));
        }
        if (q.getStatus() != null) {
            builder.and(order.status.eq(q.getStatus()));
        }
        if (q.getMinTotal() != null) {
            builder.and(order.total.gt(q.getMinTotal()));
        }
        if (q.getStart() != null && q.getEnd() != null) {
            builder.and(order.createdAt.between(q.getStart(), q.getEnd()));
        }

        return queryFactory
            .selectFrom(order)
            .where(builder)
            .orderBy(order.createdAt.desc())
            .fetch();
    }
}
\`\`\`

对比可见：QueryDSL 用 \`order.userId.eq(...)\` 这种**属性名直接引用**，写错字段名编译就报错，比 Specification 的 \`root.get("userId")\` 字符串安全得多。

## 对比

| 维度 | JPQL | Criteria API | QueryDSL |
| --- | --- | --- | --- |
| 写法 | 字符串 | 强类型 Java API | 强类型流畅 API |
| 类型安全 | 否（运行时错） | 是 | 是 |
| 可读性 | 高（像 SQL） | 低 | 高 |
| 动态拼接 | 难（字符串拼） | 易 | 易 |
| 学习成本 | 低 | 中 | 中 |
| 依赖 | 无 | 无 | 需 Q 类生成插件 |

| 维度 | JOIN | JOIN FETCH |
| --- | --- | --- |
| 作用 | 关联过滤 | 关联取数据 |
| 影响懒加载 | 否 | 是（填充关联） |
| SELECT 能否取关联 | 能 | 默认取主实体 |
| 解决 N+1 | 否 | 是 |

| 维度 | 位置参数 ?1 | 命名参数 :name |
| --- | --- | --- |
| 顺序敏感 | 是 | 否 |
| 可读性 | 差 | 好 |
| 扩展性 | 差 | 好 |
| 推荐 | 不推荐 | 推荐 |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| JPQL 用表名 | JPQL 操作实体 | 用实体名和属性名 |
| JOIN 不 fetch 仍 N+1 | 普通 JOIN 不取数据 | 用 JOIN FETCH |
| 构造表达式 DTO 没构造函数 | JPQL 调用构造 | 提供匹配参数的构造函数 |
| GROUP BY 后 SELECT 非聚合字段 | 数据库报错 | SELECT 只放分组字段或聚合 |
| Object[] 强转类型 | 多列查询返回 Object[] | 用 DTO 构造表达式 |
| Specification 字段名拼错 | 运行时才报错 | 单测覆盖或改用 QueryDSL |
| 大表 count(*) 慢 | Page 全表统计 | 用 Slice 或手写 count 优化 |
| 子查询 SELECT * | JPQL 子查询不支持 * | select 1 或 select 字段 |
| 关联 fetch 笛卡尔积 | 多个 fetch 关联相乘 | 加 distinct 或拆多次查询 |
| 动态 SQL 字符串拼接 | 注入风险 + 难维护 | 用 Specification / QueryDSL |
`,
  },
];
