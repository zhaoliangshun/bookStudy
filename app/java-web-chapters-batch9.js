// =============================================================
// Java Web 应用开发实战教程 —— 第九批章节（Spring Data JPA 组，共 4 章）
// 章节 33-36:JPA 基础与实体映射 / Repository 接口与查询方法 /
//          JPQL 与 Criteria 查询 / 关联映射与 Cascade
// =============================================================

export const chapters = [
  // =============================================================
  // 第三十三章:JPA 基础与实体映射
  // =============================================================
  {
    id: "jw-33",
    group: "Spring Data JPA",
    icon: "🗄️",
    title: "JPA 基础与实体映射",
    content: `# JPA 基础与实体映射

## 概念解释

JPA（Java Persistence API）是 Java 平台定义的**对象关系映射标准**，它只定义接口与行为契约，本身不提供实现。Hibernate 是 JPA 最流行的实现，此外还有 EclipseLink、OpenJPA。Spring Boot 默认采用 Hibernate 作为 JPA 实现。

ORM（Object-Relational Mapping）的核心思想是**用面向对象的方式操作关系型数据库**：Java 类对应数据库表，对象对应行，字段对应列。开发者不再手写大量 JDBC 模板代码，而是操作 Java 对象，由框架在背后生成并执行 SQL。这种映射解决了「对象模型」与「关系模型」之间的阻抗失配：对象有继承而关系表没有、对象靠引用而关系靠外键、对象有集合而关系靠关联表。

JPA 规范与实现的关系体现了「面向接口编程」：业务代码依赖 \`jakarta.persistence.EntityManager\` 等标准接口，切换实现时只需更换配置和依赖，业务代码不变。注意 Spring Boot 3.x 强制使用 Jakarta 命名空间（\`jakarta.persistence\`），而非旧的 \`javax.persistence\`。

## 设计原理

JPA 通过注解和元数据描述对象与表的映射关系，让框架在两边自动翻译。其设计的核心在于**持久化上下文**（Persistence Context）：\`EntityManager\` 管理一组实体实例，充当一级缓存——同一事务内对同一主键的多次查询只命中数据库一次。它还负责**脏检查**（Dirty Checking）：事务提交时自动对比实体快照，把改过的字段生成 UPDATE，开发者修改托管对象后无需调用任何 update 方法。

实体有四种状态构成状态机：NEW（新建未持久化）、MANAGED（被上下文管理，提交时同步数据库）、DETACHED（脱离上下文，修改不会同步）、REMOVED（标记删除）。理解状态转换是掌握 JPA 的关键。

主键生成策略体现不同数据库特性：\`IDENTITY\` 依赖数据库自增列（MySQL 常用，但 insert 后才知道主键，影响批量写入）；\`SEQUENCE\` 使用数据库序列（PostgreSQL、Oracle 常用，可预分配 ID，性能最好）；\`TABLE\` 用专门表模拟序列，跨数据库可移植但性能差。

## 使用场景

- 适用于绝大多数 CRUD 为主的业务系统：用户、订单、商品管理
- 适合复杂对象图持久化：一对多订单明细、多对多权限角色
- 适合需要跨数据库可移植的项目，换库只改配置不改代码
- 适合团队希望减少样板代码的场景
- 不适用：对 SQL 性能极致优化的报表分析、超大规模数据批处理，这类应直接用 JDBC/MyBatis

## 代码示例

下面是完整可运行的实体定义，配合注释逐行说明：

\`\`\`java
package com.example.demo.domain;

import jakarta.persistence.*;        // Jakarta 命名空间，Spring Boot 3.x 必需
import java.time.LocalDateTime;

@Entity                              // 标记为 JPA 实体，框架会为其建表/映射
@Table(name = "users")               // 映射到 users 表，不写则默认用类名
public class User {

    @Id                              // 主键，每个实体必须有一个
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // 数据库自增
    @Column(name = "user_id")        // 列名 user_id
    private Long id;                 // 包装类型，新建未保存时为 null

    @Column(name = "username", length = 50, nullable = false, unique = true)
    private String username;         // 非空且唯一，长度 50

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "created_at", updatable = false)  // 创建后不可更新
    private LocalDateTime createdAt = LocalDateTime.now();

    protected User() {}              // JPA 要求实体必须有无参构造

    public User(String username, String email) {
        this.username = username;
        this.email = email;
    }

    // getter / setter 省略
}
\`\`\`

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
        return user.getId();                       // IDENTITY 策略此时已回填主键
    }

    @Transactional
    public void changeEmail(Long id, String newEmail) {
        User user = em.find(User.class, id);      // 状态：MANAGED
        user.setEmail(newEmail);                  // 修改托管对象
        // 无需调用 update，事务提交时脏检查自动生成 UPDATE
    }
}
\`\`\`

关键点：\`@PersistenceContext\` 注入的是容器代理的 EntityManager，每次调用绑定当前事务，线程安全。修改 MANAGED 对象不需要调用任何 update 方法，事务提交时 Hibernate 对比快照自动 flush。

## 对比分析

| 维度 | JPA 规范 | Hibernate 实现 |
| --- | --- | --- |
| 定位 | 标准 API，定义接口契约 | 最流行的实现，提供扩展 |
| 包名 | jakarta.persistence | org.hibernate |
| 切换成本 | 业务代码不变 | 换实现只改配置和依赖 |
| 扩展功能 | 无（只有规范定义的） | 有（如 @Formula、@Cache） |

| 主键策略 | 数据库支持 | 批量写入性能 | 可移植性 |
| --- | --- | --- | --- |
| IDENTITY | MySQL/PostgreSQL | 差（禁用 JDBC 批量 insert） | 中 |
| SEQUENCE | Oracle/PostgreSQL | 好（预分配 ID） | 中 |
| TABLE | 全部 | 差（每次都查表） | 高 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 实体没有无参构造 | JPA 通过反射调用无参构造 | 加一个 protected 无参构造 |
| 用基本类型做主键 | long 默认值 0，无法区分未保存 | 改用 Long 包装类型 |
| IDENTITY 策略批量插入慢 | 每次 insert 立即执行以拿主键 | 改用 SEQUENCE 策略 |
| 在事务外修改托管对象 | 事务已提交对象变游离，修改无效 | 在 @Transactional 方法内操作或用 merge |
| 使用 javax.persistence 包名 | Spring Boot 3 用 Jakarta 命名空间 | 改用 jakarta.persistence |
| 配置 ddl-auto=update 上生产 | 框架自动改表结构带来风险 | 生产用 validate 或 none |
| equals/hashCode 用懒加载关联 | 触发懒加载且影响性能 | 仅用业务主键或 ID |
`,
  },

  // =============================================================
  // 第三十四章:Repository 接口与查询方法
  // =============================================================
  {
    id: "jw-34",
    group: "Spring Data JPA",
    icon: "🔍",
    title: "Repository 接口与查询方法",
    content: `# Repository 接口与查询方法

## 概念解释

Spring Data JPA 在 JPA 之上做了一层**仓库抽象**：你只需定义接口，框架在运行时生成实现类并注入。这一层把「写 CRUD 模板」彻底消灭，是 Spring 生态里最有生产力的模块之一。开发者定义接口继承 \`JpaRepository\`，就自动获得 \`save\`、\`findById\`、\`findAll\`、\`deleteById\` 等 20+ 方法，无需写任何实现代码。

仓库接口体系有清晰的继承层次，按功能从弱到强：\`Repository<T, ID>\`（仅标记，无方法）→ \`CrudRepository<T, ID>\`（save/findOne/findAll/delete 等 CRUD）→ \`PagingAndSortingRepository<T, ID>\`（加分页和排序）→ \`JpaRepository<T, ID>\`（加 flush、saveAndFlush、批量 deleteInBatch 等 JPA 专属能力）。选择哪个取决于需要的功能：通用 CRUD 用 \`CrudRepository\` 够用；需要分页排序用 \`PagingAndSortingRepository\`；需要 JPA 专属能力用 \`JpaRepository\`。

最招牌的特性是**方法名查询**：按方法命名约定，框架解析出查询。比如 \`findByNameAndAge\` 会被翻译成 \`where name=? and age=?\`，\`findByEmailContainingIgnoreCase\` 翻译成 \`where lower(email) like lower(%?%)\`。

## 设计原理

Spring Data 在启动时扫描带 \`@Repository\` 的接口（或被 \`@EnableJpaRepositories\` 扫描的接口），为它生成代理实现类并注册为 Bean。方法名查询通过解析方法名的前缀（\`findBy\`、\`readBy\`、\`getBy\`、\`countBy\`、\`existsBy\`、\`deleteBy\`）和后续的关键字（\`And\`、\`Or\`、\`Between\`、\`LessThan\`、\`GreaterThan\`、\`Like\`、\`Containing\`、\`OrderBy\`、\`IsNull\`、\`In\` 等）动态构造 JPQL。

这种设计让简单查询零配置、零样板代码，但复杂查询会让方法名极长、可读性差，这时改用 \`@Query\` 注解直接写 JPQL 或原生 SQL。分页返回值有三种选择：\`List<T>\`（只取数据）、\`Slice<T>\`（有 hasNext 但不查总数，性能好，适合无限滚动）、\`Page<T>\`（继承 Slice，多了总元素数和总页数，会多执行一次 count 查询，适合传统分页 UI）。

\`@Modifying\` 标记 UPDATE/DELETE 查询，配合 \`@Transactional\` 使用，返回受影响行数。注意默认不刷新持久化上下文，可能导致一级缓存与数据库不一致，可加 \`clearAutomatically = true\` 让执行后清空上下文。

## 使用场景

- 标准 CRUD：用户、商品、配置等表的管理
- 列表分页查询：管理后台、商品列表
- 关键字搜索：like 模糊查询
- 批量更新：用 \`@Modifying\` + 批量 UPDATE 一条 SQL 搞定
- 只读投影：用接口投影只取部分字段，减少传输与内存
- 不适用：极复杂的动态条件拼接（用 Specification 或 QueryDSL，下章详讲）

## 代码示例

下面是覆盖各种用法的仓库定义示例：

\`\`\`java
public interface UserRepository extends JpaRepository<User, Long> {

    // ===== 方法名查询 =====

    // 根据用户名查找（返回 Optional 更安全）
    Optional<User> findByUsername(String username);

    // 多条件 + 排序：where lastname = ? and age > ? order by firstname asc
    List<User> findByLastnameAndAgeGreaterThanOrderByFirstnameAsc(
        String lastname, int minAge);

    // 模糊查询：email like %?% （忽略大小写）
    List<User> findByEmailContainingIgnoreCase(String keyword);

    // 是否存在
    boolean existsByUsername(String username);

    // 统计
    long countByActiveTrue();

    // ===== @Query JPQL =====

    // 命名参数 + 模糊查询
    @Query("select u from User u where u.email like %:keyword% " +
           "and u.active = :active order by u.createdAt desc")
    List<User> searchActiveUsers(@Param("keyword") String keyword,
                                 @Param("active") boolean active);

    // 投影接口：只取部分字段，省内存省网络
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

    // Page 包含总数和内容（多一次 count 查询）
    Page<User> findByActive(boolean active, Pageable pageable);

    // Slice 不查总数，适合无限滚动
    Slice<User> findByCreatedAtAfter(LocalDateTime time, Pageable pageable);

    // ===== 原生 SQL =====

    @Query(value = "select * from users where date(created_at) = :date",
           nativeQuery = true)
    List<User> findByExactDate(@Param("date") LocalDate date);
}
\`\`\`

Service 层调用示例：

\`\`\`java
@Service
@Transactional(readOnly = true)          // 类级别只读事务，跳过脏检查性能更好
public class UserService {

    private final UserRepository repo;

    public UserService(UserRepository repo) { this.repo = repo; }

    public Page<User> listActiveUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size,
            Sort.by("createdAt").descending());
        return repo.findByActive(true, pageable);
    }

    @Transactional                          // 单独覆盖为读写事务
    public int deactivate(List<Long> ids) {
        return repo.batchUpdateActive(ids, false);   // 返回受影响行数
    }
}
\`\`\`

关键点：\`@Param("keyword")\` 与 JPQL 里的 \`:keyword\` 对应，命名参数可读性强、顺序无关。投影接口的别名 \`as id\` 必须与接口方法名 \`getId\` 对应。分页页码从 0 开始，调用方需注意减 1。

## 对比分析

| 维度 | CrudRepository | JpaRepository |
| --- | --- | --- |
| 方法数 | 少（CRUD 基础） | 多（flush、saveAndFlush、deleteInBatch） |
| 耦合度 | 低 | 较高（绑 JPA） |
| 适用 | 通用、跨存储 | JPA 项目 |

| 维度 | 方法名查询 | @Query |
| --- | --- | --- |
| 学习成本 | 低（关键字） | 中（要会 JPQL） |
| 复杂度 | 简单查询 | 复杂查询 |
| 可读性 | 简单时高，复杂时差 | 始终清晰 |
| 灵活 | 受关键字限制 | 高（可写任意 JPQL/SQL） |

| 维度 | Slice | Page |
| --- | --- | --- |
| 包含总数 | 否 | 是 |
| SQL 次数 | 1（数据） | 2（数据 + count） |
| 适用 | 无限滚动、瀑布流 | 传统分页 UI 显示页码 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 方法名拼错关键字 | 解析失败抛异常 | 查官方关键字表 |
| deleteBy 没加事务 | 默认只读，删除会失败 | Service 加 @Transactional |
| @Modifying 不清缓存 | 一级缓存读到旧数据 | 加 clearAutomatically = true |
| 分页页码从 1 开始 | Spring Data 页码从 0 开始 | 调用方减 1 |
| 投影接口属性名与别名不符 | 投影为 null | 别名 as 属性名要对应 |
| nativeQuery 用实体名 | 原生 SQL 应用表名 | 区分 JPQL（实体名）与 SQL（表名） |
| 大结果集直接 findAll | 内存溢出 | 用分页或 Stream<T> 流式处理 |
| 忽略 Optional 直接 get | 找不到抛 NoSuchElementException | 用 isPresent / orElse 处理 |
`,
  },

  // =============================================================
  // 第三十五章:JPQL 与 Criteria 查询
  // =============================================================
  {
    id: "jw-35",
    group: "Spring Data JPA",
    icon: "📝",
    title: "JPQL 与 Criteria 查询",
    content: `# JPQL 与 Criteria 查询

## 概念解释

上一章讲了仓库的用法，本章深入 JPQL 语法和动态查询技术。掌握这些让能写任意复杂度的查询，不依赖方法名关键字的限制。

JPQL（Java Persistence Query Language）是面向**实体类**的查询语言，而 SQL 面向**数据库表**。JPQL 操作的是实体名和属性名，最终被 Hibernate 翻译成具体数据库的 SQL，所以可以跨 MySQL、PostgreSQL、Oracle 运行。例如 \`select u from User u where u.age > :minAge\` 中 \`User\` 是实体名（不是表名 \`users\`），\`u.age\` 是属性导航。

业务里常常要拼条件：「按用户名查、可选按邮箱查、可选按状态查」—— 条件个数运行时才知道。方法名查询和 \`@Query\` 都是静态的。这时需要动态查询技术：JPA Criteria API 或 Spring Data JPA 的 \`Specification\`（基于 Criteria 封装），或第三方库 QueryDSL（提供类型安全的流畅 API）。

## 设计原理

JPQL 的设计目标是在 SQL 之上提供面向对象的抽象：用对象导航（\`u.orders\`）替代 JOIN + ON，让查询与实体模型一致。参数绑定支持位置参数 \`?1\`（顺序敏感，不推荐）和命名参数 \`:name\`（顺序无关，推荐，配合 \`@Param\`）。

\`JOIN FETCH\` 是 JPQL 解决 N+1 问题的标准手段：普通 JOIN 只用于过滤条件不影响实体加载策略，关联属性仍是懒加载；\`JOIN FETCH\` 强制一次性把关联数据查出来填充到实体，避免遍历时逐条查询。

Criteria API 是 JPA 规范提供的**类型安全**动态查询 API，通过 \`CriteriaBuilder\` 构造谓词（\`Predicate\`）、\`Root\` 取字段、\`query\` 组装查询。优点是类型安全、动态拼接容易；缺点是写起来又长又难懂。Spring Data 的 \`Specification\` 把 Criteria 封装成函数式接口，配合 \`JpaSpecificationExecutor\` 使用更简洁。QueryDSL 则更进一步，通过自动生成的 Q 类提供 \`user.username.contains(keyword)\` 这种流畅 API，属性名错就编译失败。

## 使用场景

- 多条件动态查询：管理后台筛选器（条件个数运行时决定）
- 关联数据展示：订单 + 明细一次性查出（JOIN FETCH）
- 报表统计：分组聚合（GROUP BY / HAVING）
- 复杂业务规则：子查询判断（EXISTS / IN）
- 关键字搜索：like 多字段
- 不适用：跨多库、超大数据集 —— 用专门的数据访问方案

## 代码示例

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

    // ===== 聚合 + GROUP BY + DTO 构造表达式 =====
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

    // ===== 聚合函数 + coalesce 处理 null =====
    @Query("select coalesce(sum(o.total), 0) from Order o " +
           "where o.userId = :userId and o.status = 'PAID'")
    BigDecimal totalPaidByUser(@Param("userId") Long userId);
}
\`\`\`

Specification 动态查询示例：

\`\`\`java
@Service
@Transactional(readOnly = true)
public class OrderQueryService {

    private final OrderRepository repo;

    public OrderQueryService(OrderRepository repo) { this.repo = repo; }

    public Page<Order> search(OrderQuery q, Pageable pageable) {
        // 用 Specification 拼条件，只追加非 null 的条件
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

逐行解析：\`Specification.where(null)\` 创建空 Specification 作为起点；\`spec.and((root, query, cb) -> ...)\` 链式追加 AND 条件，lambda 接收 \`root\`（实体根，取字段用）、\`query\`（查询对象）、\`cb\`（CriteriaBuilder，构造谓词）；只在条件非 null 时才追加，实现「可选筛选」；\`repo.findAll(spec, pageable)\` 组合 Specification 与分页。

QueryDSL 等价实现更类型安全：\`builder.and(order.userId.eq(q.getUserId()))\` 直接引用属性，写错字段名编译就报错，比 Specification 的 \`root.get("userId")\` 字符串安全得多。

## 对比分析

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
| 解决 N+1 | 否 | 是 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| JPQL 用表名 | JPQL 操作实体 | 用实体名和属性名 |
| JOIN 不 fetch 仍 N+1 | 普通 JOIN 不取数据 | 用 JOIN FETCH |
| 构造表达式 DTO 没构造函数 | JPQL 调用构造 | 提供匹配参数的构造函数 |
| GROUP BY 后 SELECT 非聚合字段 | 数据库报错 | SELECT 只放分组字段或聚合 |
| Object[] 强转类型 | 多列查询返回 Object[] | 用 DTO 构造表达式 |
| Specification 字段名拼错 | 运行时才报错 | 单测覆盖或改用 QueryDSL |
| 大表 count(*) 慢 | Page 全表统计 | 用 Slice 或手写 count 优化 |
| 关联 fetch 笛卡尔积 | 多个 fetch 关联相乘 | 加 distinct 或拆多次查询 |
| 动态 SQL 字符串拼接 | 注入风险 + 难维护 | 用 Specification / QueryDSL |
`,
  },

  // =============================================================
  // 第三十六章:关联映射与 Cascade
  // =============================================================
  {
    id: "jw-36",
    group: "Spring Data JPA",
    icon: "🔗",
    title: "关联映射与 Cascade",
    content: `# 关联映射与 Cascade

## 概念解释

关联映射是 JPA 的核心难点，因为关系一旦配错，要么 N+1 查询拖垮系统，要么级联删除把不该删的数据干掉。JPA 定义了四种关联关系，每个都要决定两件事：**方向**（单向/双向）和**多方**（一对多/多对一/一对一/多对多）。

\`@ManyToOne\` 最常用，总是外键方（维护方）。例如多个 OrderItem 属于一个 Order，OrderItem 表里有 \`order_id\` 列。默认 EAGER 加载，强烈建议改 LAZY。\`@OneToMany\` 是 \`@ManyToOne\` 的反向，通常加 \`mappedBy\` 表示由对方维护外键，默认 LAZY。\`@OneToOne\` 一对一，外键可在任一方。\`@ManyToMany\` 多对多，必须通过中间关联表（\`@JoinTable\`），实际项目里很多团队放弃多对多，改用中间实体（如 \`UserRole\`）以携带额外字段。

\`cascade\` 决定对父实体的操作是否传播到子实体：\`PERSIST\`（保存父时一并保存子）、\`MERGE\`（合并传播）、\`REMOVE\`（删除父时一并删子，危险慎用）、\`ALL\`（以上全部）。注意 \`cascade = REMOVE\` 与 \`orphanRemoval = true\` 不同：前者只在通过 \`remove\` 显式删除父时生效；后者在「从集合中移除子」时就把数据库里那行删掉，更彻底。

## 设计原理

\`fetch\` 抓取策略决定关联数据何时加载：\`EAGER\`（默认 \`@ManyToOne\`、\`@OneToOne\`）加载父实体时立即加载关联，可能产生额外查询或 JOIN；\`LAZY\`（默认 \`@OneToMany\`、\`@ManyToMany\`）加载父实体时返回代理，访问关联属性时才查数据库。经验法则：**全部用 LAZY**，需要的数据用 \`JOIN FETCH\` 显式拉。EAGER 是 N+1 问题的温床。

双向关联中只有一方维护外键（「维护方」），另一方用 \`mappedBy\` 指向对方的属性名，表示「我不维护关系，请看对方」。例如 Order 与 OrderItem 双向，OrderItem 是维护方（外键在它身上），Order 用 \`@OneToMany(mappedBy = "order")\`。新手常踩的坑：只 set 了集合侧没 set 维护方，结果外键为 null。最佳实践：在父实体里提供 \`addItem\` / \`removeItem\` 同步两边的方法。

\`orphanRemoval = true\` 配合 \`cascade = ALL\` 实现真正的「父管理子生命周期」：从 items 集合移除一个 OrderItem，对应的数据库行会被删除。这适用于子实体生命周期完全依附于父的强关联场景，比如 Order 与 OrderItem。

## 使用场景

- 电商订单：Order 1—N OrderItem N—1 Product（一对多双向 + 级联）
- 用户权限：User N—N Role（推荐中间实体 UserRole 携带分配时间）
- 论坛：Topic 1—N Post 1—N Comment
- 用户资料：User 1—1 UserProfile（一对一）
- 组织架构：Department 自关联 1—N Department（parent/children）
- 审计场景：基础实体含 createdAt/updatedAt，配合 @MappedSuperclass 抽出公共字段
- 不适用：弱关联（用户与日志）不应级联删除

## 代码示例

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

    // 工具方法：双向同步的关键，同时修改集合侧和外键侧
    public void addItem(OrderItem item) {
        items.add(item);                 // 维护集合侧
        item.setOrder(this);             // 维护外键侧（关键！）
    }

    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);             // orphanRemoval 会把数据库行删掉
    }
}

@Entity
@Table(name = "order_items")
public class OrderItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)  // 强制 LAZY
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;                  // 维护方，外键在它身上

    @Column(nullable = false)
    private String productName;

    @Column(nullable = false)
    private BigDecimal price;

    private Integer quantity;
}
\`\`\`

下面是多对多改用中间实体的推荐做法（能携带额外字段）：

\`\`\`java
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
    private String assignedBy;            // 携带分配人，@ManyToMany 做不到

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;    // 携带分配时间
}
\`\`\`

关键点：\`@MappedSuperclass\` 让 \`BaseEntity\` 不建表但子类继承字段映射；\`addItem\` / \`removeItem\` 工具方法是双向同步的关键，避免「外键为 null」的常见 bug；\`@ManyToOne\` 默认 EAGER 要主动改 LAZY；中间实体比 \`@ManyToMany\` 直接关联更能携带额外字段且关系清晰。

## 对比分析

| 维度 | EAGER 加载 | LAZY 加载 |
| --- | --- | --- |
| 加载时机 | 立即查关联数据 | 访问属性时才查 |
| SQL 数量 | 1-N 次 | 按需 |
| N+1 风险 | 高 | 中（需显式 JOIN FETCH） |
| 适用 | 极少用 | 大多数场景 |

| 维度 | cascade=REMOVE | orphanRemoval=true |
| --- | --- | --- |
| 触发条件 | 显式 remove 父实体 | 从集合移除子 |
| 是否删数据库行 | 是 | 是 |
| 语义 | 父删除子跟着删 | 子脱离父就被删 |

| 维度 | @ManyToMany 直接关联 | 中间实体 |
| --- | --- | --- |
| 携带额外字段 | 不行 | 可以 |
| 业务表达 | 隐式 | 显式清晰 |
| 推荐 | 简单场景 | 大多数实际项目 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 双向关联只 set 一边 | 外键由维护方决定，没 set 维护方导致外键 null | 提供同步方法同时 set 两边 |
| @ManyToOne 默认 EAGER | 加载父实体触发额外查询 | 显式设 fetch = LAZY |
| 在事务外访问懒加载属性 | Session 已关闭，抛 LazyInitializationException | 在 Service 内完成读取或用 DTO 投影 |
| toString 打印双向集合 | 互相递归调用导致栈溢出 | toString 避开关联或用 ID |
| cascade=ALL 用在弱关联 | 删用户级联删订单，业务灾难 | 强关联才用级联，弱关联手动管理 |
| 多对多直接关联想加字段 | 中间表无法携带额外列 | 改用中间实体 |
| @OneToMany 双向忘了 mappedBy | 默认会生成一张中间关联表 | 显式写 mappedBy 指向对方属性 |
| equals/hashCode 用懒加载关联 | 触发懒加载且影响性能 | 仅用业务主键或 ID |
| @CreatedDate 不生效 | 忘了 @EnableJpaAuditing | 配置审计 + AuditorAware Bean |
`,
  },
];
