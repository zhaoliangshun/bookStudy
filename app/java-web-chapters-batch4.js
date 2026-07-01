// =============================================================
// Java Web 应用开发教程 —— 第四批章节
// 分组:JDBC 数据库访问(共 4 章)
// -------------------------------------------------------------
// 本文件包含以下章节:
//   jw-13: JDBC 基础与连接管理
//   jw-14: Statement 与 PreparedStatement
//   jw-15: ResultSet 与事务管理
//   jw-16: 连接池与 DAO 模式
//
// 每个章节 content 包含六个模块:
//   概念解释 / 设计原理 / 使用场景 / 代码示例 / 对比分析 / 常见陷阱
// =============================================================

export const chapters = [
  // =========================================================
  // 第十三章:JDBC 基础与连接管理
  // =========================================================
  {
    id: "jw-13",
    group: "JDBC 数据库访问",
    icon: "🔌",
    title: "JDBC 基础与连接管理",
    content: `# JDBC 基础与连接管理

## 概念解释

**JDBC(Java Database Connectivity)** 是 Java 访问关系数据库的标准 API,定义在 \`java.sql\` 与 \`jakarta.sql\` 包中。它提供了一套统一的接口,让 Java 程序能以相同方式操作不同数据库(MySQL、Oracle、PostgreSQL),屏蔽了各数据库协议的差异。

JDBC 解决的核心问题是"**如何用 Java 连数据库、执行 SQL、处理结果**"。无论上层用 MyBatis 还是 JPA,底层都是 JDBC。

JDBC 的核心对象:**DriverManager**(驱动管理,建连接)、**Connection**(数据库连接)、**Statement/PreparedStatement**(执行 SQL)、**ResultSet**(结果集)。一条主线:获取 Connection → 创建 Statement → 执行 SQL → 处理 ResultSet → 释放资源。

数据库厂商提供各自的**驱动 jar**(实现了 JDBC 接口),如 \`mysql-connector-j\`。JDBC 4.0 起驱动会自动注册(通过 SPI 机制),不再需要手动 \`Class.forName\`。

## 设计原理

JDBC 采用"**接口 + 厂商实现**"的设计:\`java.sql.Connection\` 是接口,真正干活的是驱动 jar 里的实现类(如 \`com.mysql.cj.jdbc.ConnectionImpl\`)。这种"面向接口编程"让应用代码与具体数据库解耦,换数据库只需换驱动 jar 与 URL。

连接的本质:一条到数据库的 TCP 连接 + 会话状态。建立连接要经过 TCP 三次握手、认证、协商,开销很大(毫秒级)。所以 JDBC 连接是**重资源**,用完必须关闭,否则连接泄漏导致数据库连接耗尽。

JDBC 连接管理的关键原则:**谁打开谁关闭,用完即关,且要在 finally 中关**。Java 7 引入 **try-with-resources**,能自动关闭实现了 \`AutoCloseable\` 的资源(Connection、Statement、ResultSet 都是),这是现代写法,杜绝忘记关闭。

事务默认行为:Connection 默认 \`autoCommit=true\`,每条 SQL 执行完立即提交。需要多语句原子操作时要 \`setAutoCommit(false)\` 开启事务(详见事务章节)。

## 使用场景

**适合**:需要细粒度控制 SQL 的场景(复杂报表、批量操作)、学习数据库原理、轻量项目不想引 ORM。**理解 ORM 底层**:MyBatis/JPA 底层都是 JDBC,排查问题需懂 JDBC。

**不适合**:大型业务系统直接写 JDBC 太繁琐(SQL 与 Java 耦合、结果集映射手工),应用 MyBatis/JPA 提效;简单 CRUD 用 Spring Data JPA 一行代码搞定。

## 代码示例

\`\`\`java
package com.example;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class JdbcDemo {
    public static void main(String[] args) {
        // 数据库连接信息
        String url = "jdbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai";
        String user = "root";
        String pwd = "123456";

        // ★ try-with-resources:自动关闭 Connection/Statement/ResultSet
        // 资源声明的顺序:Connection 先开最后关,Statement 依赖 Connection
        try (Connection conn = DriverManager.getConnection(url, user, pwd);
             Statement stmt = conn.createStatement()) {

            // 执行查询,返回结果集(同样用 try-with-resources 或在内部关)
            try (ResultSet rs = stmt.executeQuery("SELECT id, name FROM users")) {
                while (rs.next()) {                          // 游标后移,有数据返回 true
                    int id = rs.getInt("id");               // 按列名取值
                    String name = rs.getString("name");
                    System.out.println(id + " : " + name);
                }
            }

            // 执行写操作(增删改),executeUpdate 返回受影响行数
            int rows = stmt.executeUpdate("UPDATE users SET name='张三' WHERE id=1");
            System.out.println("更新行数:" + rows);

        } catch (Exception e) {   // 捕获 SQLException
            e.printStackTrace();
        }
        // 离开 try 块,rs/stmt/conn 自动按逆序关闭,无需 finally
    }
}
\`\`\`

逐行解释:\`DriverManager.getConnection(url, user, pwd)\` 建立连接,URL 里 \`jdbc:mysql\` 是协议,\`//host:port/db\` 是地址,\`?\` 后是连接参数(编码、时区等);\`createStatement()\` 创建语句对象;\`executeQuery\` 执行 SELECT 返回 ResultSet,\`executeUpdate\` 执行 INSERT/UPDATE/DELETE 返回影响行数;\`rs.next()\` 移动游标,初始指向第一行之前;\`rs.getInt("id")\` 按列名取值(也可按索引 \`getInt(1)\`,从 1 开始);**try-with-resources 自动关闭资源**,顺序是声明的逆序(先 rs,再 stmt,再 conn)。

依赖(Maven):

\`\`\`xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <version>8.0.33</version>
</dependency>
\`\`\`

## 对比分析

| 维度 | JDBC | MyBatis | JPA/Hibernate |
| --- | --- | --- | --- |
| 抽象层级 | 底层 API | 半自动 ORM | 全自动 ORM |
| SQL 编写 | 手写,与 Java 耦合 | 手写,XML/注解分离 | 框架生成 |
| 结果映射 | 手工 rs.getXxx | 自动映射到对象 | 自动映射到实体 |
| 灵活度 | 最高 | 高 | 中(复杂 SQL 难写) |
| 学习成本 | 低(但要写大量模板代码) | 中 | 高 |
| 适合场景 | 学习原理、极致控制 | 中大型项目(国内主流) | 简单 CRUD、领域建模 |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| 忘记关连接 | 未用 try-with-resources,异常跳过 close | 统一用 try-with-resources |
| 连接泄漏致数据库挂 | 连接数耗尽 | 用连接池设上限,监控活跃连接 |
| ClassNotFoundException | 驱动 jar 未引入 | pom 加 mysql-connector-j |
| 时区报错 | serverTimezone 未配 | URL 加 \`serverTimezone=Asia/Shanghai\` |
| 中文乱码 | characterEncoding 未配 | URL 加 \`characterEncoding=UTF-8\` |
| ResultSet 关闭后还能用 | stmt 关了导致 rs 也关 | 在 rs 使用完前不要关 stmt |
| getInt 对 NULL 返回 0 | 无法区分"0"与"NULL" | 先 \`rs.wasNull()\` 判断 |`,
  },

  // =========================================================
  // 第十四章:Statement 与 PreparedStatement
  // =========================================================
  {
    id: "jw-14",
    group: "JDBC 数据库访问",
    icon: "🛡️",
    title: "Statement 与 PreparedStatement",
    content: `# Statement 与 PreparedStatement

## 概念解释

JDBC 提供两种执行 SQL 的对象:**Statement** 与 **PreparedStatement**。

**Statement**:直接执行静态 SQL,SQL 字符串拼接而成。每次执行都完整解析编译。

**PreparedStatement**:预编译语句,SQL 用 \`?\` 占位,先用 SQL 模板预编译,再填充参数执行。它是 \`Statement\` 的子接口。

二者最关键的区别是**安全性与性能**:\`PreparedStatement\` 能防止 SQL 注入,且对重复执行的 SQL 有性能优势。**生产环境必须用 PreparedStatement**,Statement 基本只在特殊场景(执行 DDL、动态表名)用。

还有 \`CallableStatement\`(PreparedStatement 子接口),用于调用存储过程。

## 设计原理

**SQL 注入**是 Statement 最大的问题。假如登录用拼接 SQL:

\`SELECT * FROM users WHERE name=' + name + ' AND pwd=' + pwd + '\`

用户输入 name 为 \`admin' --\`,SQL 变成:

\`SELECT * FROM users WHERE name='admin' --' AND pwd='...'\`

\`--\` 后面被注释,密码校验被绕过,直接登录成功。这就是 SQL 注入——攻击者通过精心构造输入篡改 SQL 语义。

**PreparedStatement 防注入的原理**:SQL 模板与参数分离。模板先发给数据库预编译(\`SELECT * FROM users WHERE name=? AND pwd=?\`),数据库已确定结构,后续 \`setString(1, name)\` 传的参数**永远被当作数据值**,不会被解析为 SQL 语法。即使用户输入 \`admin' --\`,它也只是个字符串值,不会改变 SQL 结构。

**预编译的性能优势**:同一条 SQL 模板多次执行时,数据库只需解析编译一次,后续复用执行计划。批量插入大量数据时 PreparedStatement 明显更快。

**参数设置方法**:\`setInt(index, value)\`、\`setString\`、\`setDate\`、\`setObject\` 等,索引从 **1** 开始(不是 0)。类型由方法决定,驱动负责转成数据库格式。

## 使用场景

**PreparedStatement 适合**:几乎所有带外部输入的查询(用户输入、表单)、批量操作、带参数的 CRUD。这是默认选择。

**Statement 适合**:执行 DDL(建表、删表,无参数)、动态拼接表名/列名(不能用 \`?\` 占位表名,只能拼接——此时必须自行白名单校验)、执行一次性简单语句。

记住:**任何来自用户的值都该用 \`?\` 占位**,绝不拼接。

## 代码示例

\`\`\`java
package com.example;

import java.sql.*;

public class PreparedDemo {
    // 登录查询(防注入写法)
    public boolean login(Connection conn, String name, String pwd) throws SQLException {
        // ★ 用 ? 占位,绝不拼接字符串
        String sql = "SELECT id FROM users WHERE name = ? AND pwd = ?";

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            // 填充参数,索引从 1 开始
            ps.setString(1, name);   // 第一个 ?
            ps.setString(2, pwd);    // 第二个 ?
            // 即便 name 是 "admin' --",也只被当作字符串值,无法注入

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();    // 有记录则登录成功
            }
        }
    }

    // 新增用户
    public void insert(Connection conn, String name, int age) throws SQLException {
        String sql = "INSERT INTO users(name, age) VALUES(?, ?)";
        try (PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, name);
            ps.setInt(2, age);
            ps.executeUpdate();     // 执行写操作

            // 获取自增主键
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    long id = keys.getLong(1);
                    System.out.println("新用户 id=" + id);
                }
            }
        }
    }

    // 批量插入(复用预编译,性能高)
    public void batchInsert(Connection conn) throws SQLException {
        String sql = "INSERT INTO users(name, age) VALUES(?, ?)";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < 100; i++) {
                ps.setString(1, "user" + i);
                ps.setInt(2, 20 + i % 10);
                ps.addBatch();           // 累积到批
            }
            ps.executeBatch();           // 一次性提交
        }
    }
}
\`\`\`

逐行解释:\`prepareStatement(sql)\` 预编译模板;\`setString(1, name)\` 填第一个占位符,索引从 1;\`executeQuery\` 返回结果集,\`executeUpdate\` 返回影响行数;\`RETURN_GENERATED_KEYS\` 让执行后能取自增主键;\`getGeneratedKeys()\` 返回主键结果集;\`addBatch\` 累积 SQL,\`executeBatch\` 一次执行多条,复用预编译计划,批量场景性能远超逐条执行。

## 对比分析

| 维度 | Statement | PreparedStatement |
| --- | --- | --- |
| SQL 形式 | 拼接字符串 | 模板 + ? 占位 |
| SQL 注入 | 易被注入 | 防注入(参数不参与解析) |
| 预编译 | 每次重新解析编译 | 复用执行计划,批量快 |
| 参数处理 | 手工拼引号、转义 | setXxx 自动处理类型与转义 |
| 可读性 | 差(引号嵌套) | 好 |
| 推荐 | 仅 DDL/动态表名 | 默认选择 |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| 仍被注入 | 把 ? 又拼成字符串了 | 占位符必须用 ?,参数用 setXxx |
| 占位符索引越界 | 用了 0 或超过 ? 数量 | 索引从 1 开始,数清 ? 个数 |
| 用 ? 占位表名失败 | ? 只能占值,不能占表名/列名 | 表名用拼接 + 白名单校验 |
| setString 日期错 | 字符串格式不符数据库 | 用 setDate + java.sql.Date 或 setTimestamp |
| 批量插入仍慢 | 未复用 ps 或逐条 execute | addBatch + executeBatch 一次提交 |
| 主键取不到 | 未传 RETURN_GENERATED_KEYS | prepareStatement 时加该参数 |
| LIKE 模糊查询注入 | 把 % 拼进参数 | % 作为参数值传入,或转义 |`,
  },

  // =========================================================
  // 第十五章:ResultSet 与事务管理
  // =========================================================
  {
    id: "jw-15",
    group: "JDBC 数据库访问",
    icon: "📊",
    title: "ResultSet 与事务管理",
    content: `# ResultSet 与事务管理

## 概念解释

**ResultSet(结果集)** 是 JDBC 执行查询返回的对象,它是一个**游标**(cursor),指向结果数据的当前行。初始游标在第一行之前,调用 \`next()\` 后移一行并返回是否有数据。通过 \`getXxx\` 方法按列名或索引取当前行各列的值。

**事务(Transaction)** 是一组原子操作的 SQL 集合,要么全部成功提交,要么全部回滚撤销。经典例子:转账,扣款与加款必须同时成功或同时失败,不能只扣不加。

事务的 ACID 特性:**原子性**(Atomicity,不可分割)、**一致性**(Consistency,执行前后数据合法)、**隔离性**(Isolation,并发事务互不干扰)、**持久性**(Durability,提交后永久保存)。

JDBC 事务由 \`Connection\` 管理:\`setAutoCommit(false)\` 开启事务(默认 true 自动提交),执行完所有 SQL 后 \`commit()\` 提交,出错则 \`rollback()\` 回滚到事务开始前。

## 设计原理

ResultSet 默认是**只进、只读**的(\`TYPE_FORWARD_ONLY\`、\`CONCUR_READ_ONLY\}):只能 \`next()\` 往前走,不能修改。需要可滚动或可更新结果集时,创建时指定类型:

- 类型:\`TYPE_FORWARD_ONLY\`(默认,只能前进)、\`TYPE_SCROLL_INSENSITIVE\`(可滚动,不感知他方修改)、\`TYPE_SCROLL_SENSITIVE\`(可滚动且感知修改)。
- 并发:\`CONCUR_READ_ONLY\`(只读)、\`CONCUR_UPDATABLE\`(可直接 rs.updateXxx 改库)。

可滚动结果集提供 \`first()\`、\`last()\`、\`absolute(row)\`、\`previous()\` 等定位方法。但生产中很少用可更新结果集,直接 UPDATE 更清晰。

事务隔离级别由 \`Connection.setTransactionIsolation\` 设置,从低到高: \`TRANSACTION_NONE\`、\`READ_UNCOMMITTED\`(脏读)、\`READ_COMMITTED\`(不可重复读)、\`REPEATABLE_READ\`(幻读)、\`SERIALIZABLE\`(串行化)。级别越高一致性越强但并发越低。MySQL InnoDB 默认 \`REPEATABLE_READ\`。

并发问题对应:**脏读**(读到未提交数据)、**不可重复读**(同事务内两次读同一行结果不同)、**幻读**(同事务内两次范围查询结果集不同)。

事务务必在 finally 中处理回滚,避免异常时事务悬挂、锁不释放。

## 使用场景

**ResultSet**:遍历查询结果生成报表、列表;聚合统计(\`COUNT/SUM\`)。**事务**:转账、下单扣库存、多表关联写入,凡是多步必须原子的操作。**隔离级别**:高并发电商用 \`READ_COMMITTED\` 平衡一致与性能;对一致性要求极高用 \`SERIALIZABLE\`(性能差)。

## 代码示例

\`\`\`java
package com.example;

import java.sql.*;

public class TransferDemo {
    // 转账:从 from 扣钱,给 to 加钱,必须原子
    public void transfer(Connection conn, int fromId, int toId, int amount) throws SQLException {
        // ★ 关闭自动提交,开启事务
        conn.setAutoCommit(false);
        Statement stmt = null;
        try {
            stmt = conn.createStatement();

            // 步骤1:扣款(余额不足应回滚)
            int n1 = stmt.executeUpdate(
                "UPDATE account SET balance = balance - " + amount + " WHERE id = " + fromId + " AND balance >= " + amount);
            if (n1 == 0) {
                throw new RuntimeException("余额不足");
            }

            // 步骤2:加款
            int n2 = stmt.executeUpdate(
                "UPDATE account SET balance = balance + " + amount + " WHERE id = " + toId);
            if (n2 == 0) {
                throw new RuntimeException("收款人不存在");
            }

            // ★ 全部成功,提交事务
            conn.commit();
            System.out.println("转账成功");
        } catch (Exception e) {
            // ★ 出错回滚,撤销已执行的 SQL
            conn.rollback();
            System.out.println("转账失败,已回滚:" + e.getMessage());
            throw e;
        } finally {
            // 恢复自动提交(连接若复用,避免影响后续)
            conn.setAutoCommit(true);
            if (stmt != null) stmt.close();
        }
    }

    // 可滚动结果集示例
    public void scrollDemo(Connection conn) throws SQLException {
        Statement stmt = conn.createStatement(
            ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
        try (ResultSet rs = stmt.executeQuery("SELECT id, name FROM users")) {
            rs.last();                       // 跳到最后一行
            int total = rs.getRow();         // 当前行号 = 总行数
            System.out.println("总记录:" + total);
            rs.first();                      // 回到第一行
            System.out.println(rs.getString("name"));
        }
    }
}
\`\`\`

逐行解释:\`setAutoCommit(false)\` 开启事务,之后执行的所有 SQL 不会自动提交;\`commit()\` 提交让变更永久生效;\`rollback()\` 出错时撤销整个事务;\`finally\` 中恢复 autoCommit,因为连接可能被连接池复用,避免影响下次;\`TYPE_SCROLL_INSENSITIVE\` 创建可滚动结果集;\`last()\`、\`first()\`、\`absolute()\`、\`previous()\` 定位游标;\`getRow()\` 返回当前行号。注意本例转账的 SQL 为简化用了拼接,实际应用余额、ID 等参数应改用 PreparedStatement 防注入。

## 对比分析

| 隔离级别 | 脏读 | 不可重复读 | 幻读 | 性能 |
| --- | --- | --- | --- | --- |
| READ_UNCOMMITTED | 可能 | 可能 | 可能 | 最高 |
| READ_COMMITTED | 防止 | 可能 | 可能 | 高 |
| REPEATABLE_READ | 防止 | 防止 | 可能(InnoDB 多用间隙锁防) | 中 |
| SERIALIZABLE | 防止 | 防止 | 防止 | 最低 |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| 事务未回滚致数据不一致 | 异常未捕获 rollback | try-catch-finally 中 rollback |
| 忘记 commit | autoCommit=false 后没提交 | 成功后显式 commit |
| 连接复用事务混乱 | 未恢复 autoCommit | finally 里 setAutoCommit(true) |
| ResultSet 关闭后还取值 | stmt/conn 关了导致 rs 失效 | rs 用完再关 stmt |
| 长事务锁表 | 事务里夹杂耗时操作(如远程调用) | 事务只包数据库操作,缩短持锁时间 |
| 可滚动结果集内存大 | 全部数据加载到内存 | 大结果用分页(LIMIT) |
| 事务嵌套报错 | JDBC 不支持嵌套事务 | 用 Savepoint 或拆分 |`,
  },

  // =========================================================
  // 第十六章:连接池与 DAO 模式
  // =========================================================
  {
    id: "jw-16",
    group: "JDBC 数据库访问",
    icon: "🔄",
    title: "连接池与 DAO 模式",
    content: `# 连接池与 DAO 模式

## 概念解释

直接用 \`DriverManager.getConnection\` 每次都新建 TCP 连接,用完关闭——建立连接的开销(毫秒级)远大于执行 SQL 本身,高并发下数据库会扛不住。**连接池(Connection Pool)** 解决这个问题:预先建立一批连接放池子里,用时借出、用完归还复用,避免反复建连。

主流连接池:**HikariCP**(性能最高,Spring Boot 默认)、**Druid**(阿里出品,监控强,国内流行)、**Tomcat JDBC Pool**、**C3P0**(老旧)。它们都实现 \`DataSource\` 接口,通过 \`dataSource.getConnection()\` 借连接。

**DAO(Data Access Object)模式**是数据访问层的标准设计:把数据库操作封装到专门的 DAO 类里,Service 层调用 DAO,不直接碰 JDBC。这样业务逻辑与数据访问分离,DAO 可独立替换(换库、换 ORM 只改 DAO)。

DAO 通常配合**实体类(Entity/POJO)**:一行表数据映射成一个 Java 对象,字段对应列。DAO 提供 CRUD 方法(\`findById\`、\`save\`、\`update\`、\`delete\`、\`findAll\`)。

## 设计原理

连接池的核心机制:**预创建 + 借还复用**。池启动时建若干连接(初始大小),应用调用 \`getConnection\` 时借出一个空闲连接;用完 \`close()\` 时不是真关闭,而是归还池等待复用。池管理空闲连接数与活跃连接数,按策略扩容或回收。

\`DataSource\` 接口是关键抽象:\`getConnection()\` 返回连接。直接 DriverManager 与连接池都实现了 DataSource,应用代码只面向 \`DataSource\` 接口,切换实现只需换配置。Spring Boot 里配 \`spring.datasource\` 就自动建 HikariDataSource。

借出连接的 \`close()\` 被池包装:调用 close 时,池把连接状态重置(清临时表、回滚未提交事务)、归还空闲队列,而非断 TCP。所以应用代码仍可放心 try-with-resources。

DAO 的设计原理是**单一职责**与**依赖倒置**:DAO 只管"怎么存取这一类实体",Service 只管业务编排,二者通过接口耦合。Service 依赖 \`UserDao\` 接口而非具体实现,便于测试(可 Mock)与替换。实体类是纯数据载体(POJO),不包含业务逻辑。

## 使用场景

**连接池**:任何生产 Java Web 应用都该用连接池,绝不用裸 DriverManager。Spring Boot 自动配 HikariCP,传统项目可手动配 Druid。

**DAO 模式**:中大型项目分层时,把每类实体的数据访问封进 DAO(\`UserDao\`、\`OrderDao\`)。配合 Service 层形成清晰的三层架构(Web → Service → DAO)。需要换 ORM(如从 JDBC 迁到 MyBatis)时,DAO 接口不变,只改实现。

## 代码示例

实体类:

\`\`\`java
package com.example.entity;

public class User {
    private Integer id;
    private String name;
    private Integer age;
    // getter/setter 省略
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
}
\`\`\`

DAO 接口与实现(基于连接池):

\`\`\`java
package com.example.dao;

import com.example.entity.User;
import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public interface UserDao {
    User findById(int id) throws SQLException;
    List<User> findAll() throws SQLException;
    void save(User u) throws SQLException;
}

public class UserDaoImpl implements UserDao {
    private final DataSource ds;   // 依赖 DataSource(连接池),而非具体类

    public UserDaoImpl(DataSource ds) { this.ds = ds; }

    @Override
    public User findById(int id) throws SQLException {
        String sql = "SELECT id, name, age FROM users WHERE id = ?";
        // 从池借连接,try-with-resources 自动归还
        try (Connection conn = ds.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);   // 映射成对象
                }
            }
        }
        return null;
    }

    @Override
    public List<User> findAll() throws SQLException {
        String sql = "SELECT id, name, age FROM users";
        List<User> list = new ArrayList<>();
        try (Connection conn = ds.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                list.add(mapRow(rs));
            }
        }
        return list;
    }

    @Override
    public void save(User u) throws SQLException {
        String sql = "INSERT INTO users(name, age) VALUES(?, ?)";
        try (Connection conn = ds.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, u.getName());
            ps.setInt(2, u.getAge());
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) u.setId(keys.getInt(1));
            }
        }
    }

    // 把一行结果集映射成实体对象(ORM 的雏形)
    private User mapRow(ResultSet rs) throws SQLException {
        User u = new User();
        u.setId(rs.getInt("id"));
        u.setName(rs.getString("name"));
        u.setAge(rs.getInt("age"));
        return u;
    }
}
\`\`\`

HikariCP 连接池配置:

\`\`\`java
package com.example;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import javax.sql.DataSource;

public class PoolDemo {
    public static DataSource createDataSource() {
        HikariConfig cfg = new HikariConfig();
        cfg.setJdbcUrl("jdbc:mysql://localhost:3306/test?useSSL=false&serverTimezone=Asia/Shanghai");
        cfg.setUsername("root");
        cfg.setPassword("123456");
        cfg.setMaximumPoolSize(10);      // 最大连接数
        cfg.setMinimumIdle(2);           // 最小空闲连接
        cfg.setConnectionTimeout(30000); // 获取连接超时 30s
        cfg.setIdleTimeout(600000);      // 空闲连接超时 10min
        return new HikariDataSource(cfg);
    }
}
\`\`\`

逐行解释:\`DataSource\` 是连接池抽象,DAO 依赖它而非 Hikari 具体类,便于换池;\`ds.getConnection()\` 从池借连接,\`close()\` 归还而非断开;\`mapRow\` 把 ResultSet 行映射成实体,这是 ORM 的核心思想;\`maximumPoolSize\` 控制最大连接数,过高会压垮数据库,过低则请求排队;HikariCP 性能高源于精心优化(如 FastList、并发设计)。

## 对比分析

| 维度 | 裸 DriverManager | 连接池(HikariCP) |
| --- | --- | --- |
| 建连开销 | 每次新建 TCP(毫秒级) | 借出已有连接(微秒级) |
| 并发支持 | 易耗尽数据库连接 | 限流,可控上限 |
| 性能 | 低 | 高 |
| 配置 | 简单 | 需调参数 |
| 生产使用 | 不推荐 | 必用 |

| 模式 | 特点 | 适合场景 |
| --- | --- | --- |
| DAO 模式 | 接口 + 实现,数据访问与业务分离 | 三层架构、可替换 ORM |
| Active Record | 实体自带 save/find 方法 | 简单项目(Rails 风格) |
| Repository(Spring Data) | 接口自动生成实现 | Spring Boot 项目 |

## 常见陷阱

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| 连接泄漏 | 借出未归还(未 close) | try-with-resources 保证归还 |
| 池大小过大压垮 DB | maximumPoolSize 设太高 | 按数据库承载调优(经验:CPU 核数*2+磁盘数) |
| 池大小过小请求堆积 | 上限太低 | 监控等待时间,适当上调 |
| 连接失效 | 数据库重启或超时断连 | 配 validationQuery 或连接活性检测 |
| DAO 里写业务逻辑 | 职责混淆 | 业务放 Service,DAO 只存取 |
| 实体与表不对应 | 字段名/类型不匹配 | 严格命名一致,注意驼峰与下划线转换 |
| 事务跨多个 DAO 难管 | 每个 DAO 各自开关连接 | 事务在 Service 层用同一连接管理(Spring 事务) |`,
  },
];
