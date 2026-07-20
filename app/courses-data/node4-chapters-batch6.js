export const chapters = [
  {
    id: "n4-sqlite",
    group: "第五部分 数据库",
    icon: "🗃️",
    title: "SQLite 数据库：轻量级关系型数据库",
    content: `# SQLite 数据库：轻量级关系型数据库

## 一、什么是 SQLite

SQLite 是世界上使用最广泛的数据库引擎之一，它是一个**自包含的、无服务器的、零配置的**事务型 SQL 数据库引擎。

### 1.1 SQLite 的核心特点

| 特点 | 说明 |
|------|------|
| **文件型数据库** | 整个数据库存储在一个单一的跨平台磁盘文件中 |
| **无服务器架构** | 不需要独立的服务器进程运行，直接读写磁盘文件 |
| **零配置** | 安装后无需任何配置即可使用，无需启动/停止服务 |
| **事务支持** | 完整支持 ACID 事务，即使在系统崩溃时也能保证数据安全 |
| **轻量级** | 完整库体积很小，运行时内存占用极低 |
| **跨平台** | 数据库文件可在不同系统间直接复制使用 |

### 1.2 SQLite 适用场景

- **嵌入式设备和物联网**：手机、电视、汽车电子等
- **桌面应用程序**：浏览器、邮件客户端、财务软件
- **网站开发**：中小流量网站、原型开发、测试环境
- **数据存储格式**：替代自定义文件格式（如 .doc, .psd 等）
- **原型和演示**：快速开发、教学演示

### 1.3 SQLite 不适用场景

- **高并发写入**：写操作会锁定整个数据库
- **超大规模数据**：单库文件过大时性能下降
- **客户端/服务器应用**：需要通过网络访问数据库
- **多用户同时写入**：同一时间只允许一个写操作

---

## 二、通过 child_process 使用 sqlite3 命令行

Node.js 内置的 \`child_process\` 模块可以调用系统命令。由于环境中已安装 sqlite3 命令行工具（\`/usr/bin/sqlite3\`），我们可以直接调用它。

### 2.1 sqlite3 CLI 基本用法

\`\`\`bash
# 进入交互式数据库（文件不存在则自动创建）
sqlite3 test.db

# 直接执行 SQL 语句
sqlite3 test.db "SELECT * FROM users;"

# 使用 -header 显示列名，-column 格式化输出
sqlite3 -header -column test.db "SELECT * FROM users;"

# 批量执行 SQL 文件
sqlite3 test.db < schema.sql
\`\`\`

### 2.2 child_process.execSync 调用

使用 Node.js 的 \`child_process.execSync\` 可以同步执行 sqlite3 命令并获取结果：

\`\`\`javascript
const { execSync } = require('child_process');

// 执行 SQL 查询
const result = execSync(\`sqlite3 -header -column test.db "SELECT * FROM users;"\`);
console.log(result.toString());
\`\`\`

---

## 三、创建表（CREATE TABLE）

### 3.1 SQLite 常用数据类型

| 类型 | 说明 |
|------|------|
| **INTEGER** | 整数类型，可存储 1/2/3/4/6/8 字节整数 |
| **REAL** | 浮点数类型，8字节 IEEE 浮点数 |
| **TEXT** | 文本字符串，使用 UTF-8/UTF-16 编码 |
| **BLOB** | 二进制数据，完全按照输入存储 |
| **NUMERIC** | 数值类型，可自动转换存储格式 |

### 3.2 创建表语法

\`\`\`sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  age INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);
\`\`\`

### 3.3 约束类型

- **PRIMARY KEY**：主键，唯一标识一行
- **NOT NULL**：不能为空
- **UNIQUE**：值必须唯一
- **DEFAULT**：默认值
- **CHECK**：自定义约束条件
- **FOREIGN KEY**：外键约束

---

## 四、CRUD 操作

### 4.1 INSERT - 插入数据

\`\`\`sql
-- 插入单条记录
INSERT INTO users (name, email, age) VALUES ('张三', 'zhangsan@example.com', 25);

-- 插入多条记录
INSERT INTO users (name, email, age) VALUES
  ('李四', 'lisi@example.com', 30),
  ('王五', 'wangwu@example.com', 28);
\`\`\`

### 4.2 SELECT - 查询数据

\`\`\`sql
-- 查询所有列
SELECT * FROM users;

-- 查询指定列
SELECT name, email FROM users;

-- 条件查询
SELECT * FROM users WHERE age > 25;

-- 排序
SELECT * FROM users ORDER BY age DESC;

-- 限制数量
SELECT * FROM users LIMIT 10 OFFSET 0;

-- 聚合查询
SELECT COUNT(*), AVG(age) FROM users;
\`\`\`

### 4.3 UPDATE - 更新数据

\`\`\`sql
-- 更新符合条件的记录
UPDATE users SET age = 26 WHERE name = '张三';

-- 更新多列
UPDATE users SET age = 31, email = 'lisi_new@example.com' WHERE id = 2;
\`\`\`

### 4.4 DELETE - 删除数据

\`\`\`sql
-- 删除符合条件的记录
DELETE FROM users WHERE id = 3;

-- 删除所有记录（注意！没有 WHERE 会删除全部）
DELETE FROM users;
\`\`\`

---

## 五、参数化查询（防止 SQL 注入！）

### 5.1 什么是 SQL 注入

SQL 注入是一种通过在输入中插入恶意 SQL 代码来操纵数据库的攻击方式。**永远不要直接拼接用户输入到 SQL 语句中！**

**危险写法：**
\`\`\`javascript
// ❌ 严重安全隐患！
const sql = \`SELECT * FROM users WHERE email = '\${userInput}'\`;
// 如果 userInput 是 ' OR '1'='1，将返回所有用户！
\`\`\`

### 5.2 sqlite3 参数化查询

sqlite3 CLI 使用 \`?\` 作为参数占位符：

\`\`\`sql
-- 使用 ? 占位符
SELECT * FROM users WHERE email = ? AND age > ?;
\`\`\`

在 Node.js 中，我们需要正确转义参数来防止注入。

---

## 六、事务（Transactions）

事务是一组不可分割的 SQL 操作，要么全部成功，要么全部失败回滚。

### 6.1 ACID 特性

| 特性 | 含义 |
|------|------|
| **Atomicity（原子性）** | 事务中的操作要么全部完成，要么全部不执行 |
| **Consistency（一致性）** | 事务前后数据库状态保持一致 |
| **Isolation（隔离性）** | 并发事务之间相互隔离 |
| **Durability（持久性）** | 事务提交后数据永久保存 |

### 6.2 事务语法

\`\`\`sql
BEGIN TRANSACTION;
-- 执行多条 SQL
INSERT INTO users (name, email) VALUES ('A', 'a@test.com');
INSERT INTO users (name, email) VALUES ('B', 'b@test.com');
-- 如果全部成功则提交
COMMIT;
-- 如果出错则回滚
-- ROLLBACK;
\`\`\`
`,
    code: `// ============================================
// SQLite 数据库操作演示
// 使用 child_process 调用系统 sqlite3 CLI
// ============================================

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 数据库文件路径
const DB_PATH = path.join(__dirname, 'demo_sqlite.db');

// --- 工具函数：执行 SQL ---
function runSQL(sql, params = []) {
  // 如果数据库文件已存在，先删除（演示用）
  // 注意：实际项目中不要这样做！
  
  // 将参数安全地替换到 SQL 中（简单转义）
  // 实际生产环境应该使用真正的参数化查询 API
  let processedSQL = sql;
  params.forEach(param => {
    // 转义单引号：将 ' 替换为 ''
    const escaped = String(param).replace(/'/g, "''");
    processedSQL = processedSQL.replace('?', \`'\${escaped}'\`);
  });
  
  try {
    // 使用 sqlite3 命令执行 SQL
    // -header: 显示列名
    // -column: 列对齐格式化输出
    const result = execSync(
      \`sqlite3 -header -column '\${DB_PATH}' "\${processedSQL.replace(/"/g, '\\\\"')}"\`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    return result.trim();
  } catch (err) {
    console.error('SQL 执行错误:', err.message);
    return null;
  }
}

// --- 执行多条 SQL（用于事务）---
function runMultipleSQL(sqlStatements) {
  // 将多条 SQL 写入临时文件然后执行
  const tempFile = path.join(__dirname, 'temp_sql.sql');
  fs.writeFileSync(tempFile, sqlStatements.join('\\n'));
  try {
    const result = execSync(
      \`sqlite3 -header -column '\${DB_PATH}' < '\${tempFile}'\`,
      { encoding: 'utf-8' }
    );
    fs.unlinkSync(tempFile);
    return result.trim();
  } catch (err) {
    fs.unlinkSync(tempFile);
    console.error('SQL 批量执行错误:', err.message);
    return null;
  }
}

// --- 清理旧数据库（演示用）---
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('已清理旧数据库');
}

console.log('=== SQLite 数据库演示 ===\\n');

// --- 1. 创建表 ---
console.log('--- 1. 创建用户表 ---');
const createTableSQL = \`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  age INTEGER,
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);
\`;
runSQL(createTableSQL);
console.log('用户表创建成功\\n');

// --- 2. 创建文章表（用于演示外键）---
console.log('--- 2. 创建文章表 ---');
const createPostsSQL = \`
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  published INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
\`;
runSQL(createPostsSQL);
console.log('文章表创建成功\\n');

// --- 3. 插入数据 ---
console.log('--- 3. 插入用户数据 ---');
// 使用参数化方式插入（防止 SQL 注入）
runSQL('INSERT INTO users (name, email, age) VALUES (?, ?, ?);', ['张三', 'zhangsan@example.com', 25]);
runSQL('INSERT INTO users (name, email, age) VALUES (?, ?, ?);', ['李四', 'lisi@example.com', 30]);
runSQL('INSERT INTO users (name, email, age) VALUES (?, ?, ?);', ['王五', 'wangwu@example.com', 28]);
runSQL('INSERT INTO users (name, email, age) VALUES (?, ?, ?);', ['赵六', 'zhaoliu@example.com', 22]);
console.log('插入 4 条用户记录\\n');

// --- 4. 查询数据 ---
console.log('--- 4. 查询所有用户 ---');
console.log(runSQL('SELECT * FROM users;'));
console.log('');

// --- 5. 条件查询 ---
console.log('--- 5. 查询年龄大于 25 的用户 ---');
console.log(runSQL('SELECT name, age, email FROM users WHERE age > ? ORDER BY age DESC;', [25]));
console.log('');

// --- 6. 更新数据 ---
console.log('--- 6. 更新张三的年龄为 26 ---');
runSQL('UPDATE users SET age = ? WHERE name = ?;', [26, '张三']);
console.log(runSQL('SELECT * FROM users WHERE name = ?;', ['张三']));
console.log('');

// --- 7. 聚合查询 ---
console.log('--- 7. 统计信息 ---');
console.log(runSQL('SELECT COUNT(*) as 用户数, AVG(age) as 平均年龄, MAX(age) as 最大年龄, MIN(age) as 最小年龄 FROM users;'));
console.log('');

// --- 8. 插入文章数据 ---
console.log('--- 8. 插入文章数据 ---');
runSQL('INSERT INTO posts (user_id, title, content, published) VALUES (?, ?, ?, ?);', 
  [1, '我的第一篇文章', '这是张三写的文章内容', 1]);
runSQL('INSERT INTO posts (user_id, title, content, published) VALUES (?, ?, ?, ?);', 
  [1, 'Node.js 入门', '学习 Node.js 的笔记', 1]);
runSQL('INSERT INTO posts (user_id, title, content, published) VALUES (?, ?, ?, ?);', 
  [2, '数据库设计', '关系型数据库设计原则', 0]);
console.log('插入 3 篇文章\\n');

// --- 9. JOIN 查询 ---
console.log('--- 9. 用户和文章关联查询（INNER JOIN）---');
const joinSQL = \`
SELECT u.name as 作者, p.title as 标题, p.published as 是否已发布
FROM users u
INNER JOIN posts p ON u.id = p.user_id
ORDER BY u.name;
\`;
console.log(runSQL(joinSQL));
console.log('');

// --- 10. 事务演示 ---
console.log('--- 10. 事务演示（要么全成功，要么全失败）---');
const transactionSQL = [
  'BEGIN TRANSACTION;',
  "INSERT INTO users (name, email, age) VALUES ('测试用户1', 'test1@example.com', 20);",
  "INSERT INTO users (name, email, age) VALUES ('测试用户2', 'test2@example.com', 21);",
  // 下面这条会失败因为 email 重复
  // "INSERT INTO users (name, email, age) VALUES ('张三重复', 'zhangsan@example.com', 99);",
  'COMMIT;'
];
runMultipleSQL(transactionSQL);
console.log('事务提交成功');
console.log(runSQL('SELECT * FROM users WHERE name LIKE ?;', ['测试%']));
console.log('');

// --- 11. SQL 注入防护演示 ---
console.log('--- 11. SQL 注入防护演示 ---');

// 危险：直接拼接字符串
const dangerousInput = "' OR '1'='1";
console.log('恶意输入:', dangerousInput);
// ❌ 错误方式（会被注入）
const badSQL = \`SELECT * FROM users WHERE email = '\${dangerousInput}';\`;
console.log('危险 SQL 会返回所有用户（注入成功）:');
console.log(runSQL(badSQL));
console.log('');

// ✅ 正确方式：使用参数化（我们的 runSQL 函数转义了单引号）
console.log('使用参数化查询（安全）:');
const safeResult = runSQL('SELECT * FROM users WHERE email = ?;', [dangerousInput]);
console.log('安全查询结果（应该为空）:', safeResult || '(无匹配记录)');
console.log('');

// --- 12. 删除数据 ---
console.log('--- 12. 删除测试用户 ---');
runSQL('DELETE FROM users WHERE name LIKE ?;', ['测试%']);
console.log('删除后用户数:', runSQL('SELECT COUNT(*) as 剩余用户 FROM users;'));
console.log('');

// --- 13. 删除表（演示用）---
// runSQL('DROP TABLE IF EXISTS posts;');
// runSQL('DROP TABLE IF EXISTS users;');

console.log('=== SQLite 演示完成 ===');
console.log(\`数据库文件位置: \${DB_PATH}\`);
console.log('可以使用 sqlite3 命令行工具继续探索: sqlite3', DB_PATH);
`,
  },
  {
    id: "n4-mysql-concepts",
    group: "第五部分 数据库",
    icon: "🐬",
    title: "MySQL 数据库：关系型数据库操作",
    content: `# MySQL 数据库：关系型数据库操作

## 一、MySQL 核心概念

MySQL 是最流行的开源关系型数据库管理系统（RDBMS），由瑞典 MySQL AB 公司开发，现属 Oracle 公司。

### 1.1 关系型数据库基础概念

| 概念 | 说明 | 类比 |
|------|------|------|
| **数据库（Database）** | 存储数据的容器，一个 MySQL 服务可以有多个数据库 | 一个文件夹 |
| **表（Table）** | 数据以表格形式存储，由行和列组成 | 一个 Excel 工作表 |
| **行（Row）/ 记录（Record）** | 表中的一条数据 | Excel 中的一行 |
| **列（Column）/ 字段（Field）** | 表中的一个数据项，定义数据类型 | Excel 中的一列 |
| **主键（Primary Key）** | 唯一标识表中每一行的字段，不能重复、不能为空 | 身份证号 |
| **外键（Foreign Key）** | 建立表与表之间关联的字段 | 引用其他表的主键 |
| **索引（Index）** | 提高查询速度的数据结构，类似书的目录 | 字典的部首目录 |

### 1.2 MySQL vs SQLite 主要区别

| 特性 | MySQL | SQLite |
|------|-------|--------|
| 架构 | 客户端/服务器（C/S） | 嵌入式（文件型） |
| 并发 | 支持多用户高并发读写 | 写操作锁定整个库 |
| 权限管理 | 完善的用户权限系统 | 没有用户权限概念 |
| 扩展性 | 可集群部署、分库分表 | 单文件，难以扩展 |
| 数据类型 | 更丰富（VARCHAR、INT、DATETIME 等） | 类型较简单 |
| 适用场景 | 生产环境、Web 应用、多用户场景 | 嵌入式、单用户、原型开发 |

---

## 二、SQL 语法复习

MySQL 和 SQLite 的 SQL 语法大部分兼容，以下是常用 SQL 语句。

### 2.1 数据查询（SELECT）

\`\`\`sql
-- 基本查询
SELECT 列1, 列2 FROM 表名 WHERE 条件;

-- 去重
SELECT DISTINCT 列 FROM 表名;

-- 排序：ASC 升序（默认），DESC 降序
SELECT * FROM users ORDER BY created_at DESC;

-- 分页：LIMIT 数量 OFFSET 偏移
SELECT * FROM users LIMIT 10 OFFSET 20;  -- 第3页，每页10条

-- 模糊查询
SELECT * FROM users WHERE name LIKE '%张%';

-- 范围查询
SELECT * FROM users WHERE age BETWEEN 20 AND 30;
SELECT * FROM users WHERE age IN (25, 30, 35);
\`\`\`

### 2.2 聚合与分组

\`\`\`sql
-- 聚合函数
SELECT COUNT(*), SUM(age), AVG(age), MAX(age), MIN(age) FROM users;

-- GROUP BY 分组
SELECT department, COUNT(*) as emp_count
FROM employees
GROUP BY department
HAVING emp_count > 5;  -- HAVING 过滤分组后的结果
\`\`\`

### 2.3 JOIN 连接查询

| JOIN 类型 | 说明 |
|-----------|------|
| **INNER JOIN** | 只返回两表匹配的行 |
| **LEFT JOIN** | 返回左表所有行，右表不匹配则为 NULL |
| **RIGHT JOIN** | 返回右表所有行，左表不匹配则为 NULL |
| **FULL JOIN** | 返回两表所有行（MySQL 不直接支持，可用 UNION 模拟） |

\`\`\`sql
SELECT u.name, o.order_no, o.amount
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.amount > 100
ORDER BY o.created_at DESC;
\`\`\`

---

## 三、数据库连接概念

### 3.1 连接的生命周期

数据库连接是一个相对昂贵的资源，建立连接涉及：
1. TCP 三次握手建立网络连接
2. 数据库认证（用户名/密码验证）
3. 执行 SQL 操作
4. 关闭连接

### 3.2 连接池（Connection Pool）

**为什么需要连接池？**
- 每次创建连接开销大（网络握手、认证）
- 直接创建大量连接可能耗尽数据库资源
- 连接复用可以显著提升性能

**连接池工作原理：**
1. 初始化时创建一定数量的连接放入池中
2. 应用需要连接时从池中借用，用完归还
3. 连接不足时按需创建（不超过最大连接数）
4. 空闲连接超时后自动回收
5. 监控连接健康状态，自动断开失效连接

### 3.3 MySQL 协议基础

MySQL 使用 TCP 协议通信（默认端口 3306），客户端可以用 Node.js 的 \`net\` 模块直接与 MySQL 服务器通信（虽然实际开发中使用 mysql2 等驱动，但理解协议有助于理解底层）。

---

## 四、预处理语句（Prepared Statements）

预处理语句是防止 SQL 注入的最佳实践，同时可以提升性能。

### 4.1 预处理语句工作流程

1. **Prepare**：将 SQL 模板发送给数据库，数据库解析、编译、优化
2. **Execute**：发送参数给数据库执行（参数与 SQL 分离，不会被解析为 SQL 代码）
3. **重复执行**：同一 SQL 模板可以用不同参数多次执行，复用已编译的执行计划

### 4.2 为什么预处理语句能防注入？

因为参数值是通过单独的通道发送的，数据库知道这只是数据，不会把参数中的内容当作 SQL 指令解析。

\`\`\`sql
-- 预处理 SQL 模板（? 是占位符）
PREPARE stmt FROM 'SELECT * FROM users WHERE email = ?';
-- 设置参数
SET @email = 'user@example.com';
-- 执行
EXECUTE stmt USING @email;
-- 释放
DEALLOCATE PREPARE stmt;
\`\`\`
`,
    code: `// ============================================
// MySQL 概念演示
// 由于不能使用 npm 包，我们使用 sqlite3 演示 SQL 语法
// 同时实现一个通用连接池模式
// ============================================

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'demo_mysql_concepts.db');

// --- 数据库查询封装（类似 mysql2 的查询接口）---
class Database {
  constructor(dbPath) {
    this.dbPath = dbPath;
  }

  // 执行 SQL（模拟 mysql2 的 query 方法）
  query(sql, params = []) {
    let processedSQL = sql;
    params.forEach(param => {
      const escaped = String(param).replace(/'/g, "''");
      processedSQL = processedSQL.replace('?', \`'\${escaped}'\`);
    });
    try {
      const result = execSync(
        \`sqlite3 -header -column '\${this.dbPath}' "\${processedSQL.replace(/"/g, '\\\\"')}"\`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      return this.parseResult(result);
    } catch (err) {
      throw new Error(\`SQL 错误: \${err.message}\\nSQL: \${sql}\`);
    }
  }

  // 解析 sqlite3 输出为对象数组
  parseResult(output) {
    const lines = output.trim().split('\\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(/\\s+/).filter(h => h);
    const rows = [];
    
    for (let i = 2; i < lines.length; i++) {
      const values = lines[i].split(/\\s{2,}/).map(v => v.trim());
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] !== undefined ? values[idx] : null;
      });
      rows.push(row);
    }
    return rows;
  }

  // 执行多条 SQL（用于建表等）
  exec(sql) {
    execSync(\`sqlite3 '\${this.dbPath}' "\${sql.replace(/"/g, '\\\\"')}"\`);
  }
}

// --- 通用连接池实现 ---
class ConnectionPool {
  constructor(createConnection, options = {}) {
    this.createConnection = createConnection;
    this.min = options.min || 2;       // 最小连接数
    this.max = options.max || 10;      // 最大连接数
    this.idleTimeout = options.idleTimeout || 30000; // 空闲超时
    this.pool = [];                     // 空闲连接池
    this.active = new Set();            // 正在使用的连接
    this.waiting = [];                  // 等待连接的请求队列
    
    // 初始化最小连接数
    for (let i = 0; i < this.min; i++) {
      this.pool.push(this.wrapConnection(createConnection()));
    }
    console.log(\`连接池初始化完成，初始连接数: \${this.min}\`);
  }

  // 包装连接，添加释放方法和时间戳
  wrapConnection(conn) {
    return {
      conn,
      lastUsed: Date.now(),
      released: false,
    };
  }

  // 获取连接
  async getConnection() {
    // 1. 优先从空闲池取
    while (this.pool.length > 0) {
      const wrapped = this.pool.pop();
      // 检查连接是否超时
      if (Date.now() - wrapped.lastUsed > this.idleTimeout) {
        // 超时连接销毁，继续找
        continue;
      }
      wrapped.released = false;
      this.active.add(wrapped);
      return wrapped.conn;
    }

    // 2. 如果未达最大连接数，创建新连接
    if (this.active.size < this.max) {
      const conn = this.createConnection();
      const wrapped = this.wrapConnection(conn);
      this.active.add(wrapped);
      return conn;
    }

    // 3. 达到最大连接数，排队等待
    return new Promise(resolve => {
      this.waiting.push(resolve);
    });
  }

  // 释放连接回池
  releaseConnection(conn) {
    // 找到对应的包装对象
    let wrappedToRelease = null;
    for (const wrapped of this.active) {
      if (wrapped.conn === conn) {
        wrappedToRelease = wrapped;
        break;
      }
    }
    
    if (!wrappedToRelease) return;
    
    this.active.delete(wrappedToRelease);
    wrappedToRelease.lastUsed = Date.now();
    wrappedToRelease.released = true;

    // 有等待的请求，直接分配
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift();
      wrappedToRelease.released = false;
      this.active.add(wrappedToRelease);
      resolve(wrappedToRelease.conn);
      return;
    }

    // 空闲连接数超过最小值，关闭多余的
    if (this.pool.length >= this.min) {
      // 实际生产中这里会调用 conn.end() 关闭连接
      console.log('关闭多余连接');
      return;
    }

    // 放回池中
    this.pool.push(wrappedToRelease);
  }

  // 获取池状态
  getStatus() {
    return {
      idle: this.pool.length,
      active: this.active.size,
      waiting: this.waiting.length,
      total: this.pool.length + this.active.size,
    };
  }
}

// --- 演示开始 ---
if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
const db = new Database(DB_PATH);

console.log('=== MySQL 概念演示 ===\\n');

// --- 1. 建表（类似 MySQL 的表设计）---
console.log('--- 1. 创建数据库表 ---');
db.exec(\`
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  age INT,
  status TINYINT DEFAULT 1 COMMENT '1=正常 0=禁用',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
\`);

db.exec(\`
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INT NOT NULL,
  order_no VARCHAR(32) NOT NULL UNIQUE,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' COMMENT 'pending/paid/shipped/completed/cancelled',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
\`);

db.exec(\`
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
\`);
console.log('users、orders 表及索引创建完成\\n');

// --- 2. 插入测试数据 ---
console.log('--- 2. 插入测试数据 ---');
const users = [
  ['zhangsan', 'zhangsan@mysql.com', 'hash_pw_1', 25],
  ['lisi', 'lisi@mysql.com', 'hash_pw_2', 30],
  ['wangwu', 'wangwu@mysql.com', 'hash_pw_3', 28],
  ['zhaoliu', 'zhaoliu@mysql.com', 'hash_pw_4', 22],
];
users.forEach(([username, email, pw, age]) => {
  db.query('INSERT INTO users (username, email, password_hash, age) VALUES (?, ?, ?, ?)', 
    [username, email, pw, age]);
});
console.log(\`插入 \${users.length} 个用户\`);

for (let i = 1; i <= 8; i++) {
  const userId = (i % 4) + 1;
  const amount = Math.round(Math.random() * 500 * 100) / 100;
  db.query(
    'INSERT INTO orders (user_id, order_no, total_amount, status) VALUES (?, ?, ?, ?)',
    [userId, \`ORD\${String(i).padStart(8, '0')}\`, amount, ['pending', 'paid', 'completed'][i % 3]]
  );
}
console.log('插入 8 条订单\\n');

// --- 3. 各种查询演示 ---
console.log('--- 3. WHERE 条件查询 ---');
console.log('年龄 >= 25 的用户:');
console.table(db.query('SELECT id, username, email, age FROM users WHERE age >= ? ORDER BY age', [25]));

console.log('\\n--- 4. LIKE 模糊查询 ---');
console.log('用户名包含 "wang" 的用户:');
console.table(db.query('SELECT * FROM users WHERE username LIKE ?', ['%wang%']));

console.log('\\n--- 5. IN 查询 ---');
console.log('ID 在 1, 3 中的用户:');
console.table(db.query('SELECT * FROM users WHERE id IN (?, ?)', [1, 3]));

console.log('\\n--- 6. 聚合 + GROUP BY ---');
// SQLite 兼容的聚合查询
const stats = db.query(\`
SELECT 
  u.username,
  COUNT(o.id) as order_count,
  SUM(o.total_amount) as total_spent,
  AVG(o.total_amount) as avg_order
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id
ORDER BY total_spent DESC
\`);
console.log('用户订单统计:');
console.table(stats);

console.log('\\n--- 7. 子查询 ---');
const bigSpenders = db.query(\`
SELECT username, email FROM users
WHERE id IN (
  SELECT user_id FROM orders
  WHERE total_amount > (SELECT AVG(total_amount) FROM orders)
)
\`);
console.log('订单金额高于平均值的用户:');
console.table(bigSpenders);

// --- 8. 连接池演示 ---
console.log('\\n--- 8. 连接池演示 ---');

// 模拟数据库连接创建函数
function createDBConnection() {
  // 实际项目中这里会创建真实的数据库连接
  return { 
    id: Math.random().toString(36).substr(2, 6),
    query: (sql) => db.query(sql),
    end: () => console.log('连接已关闭'),
  };
}

const pool = new ConnectionPool(createDBConnection, { min: 2, max: 5 });

// 模拟并发查询
async function concurrentQuery(id) {
  const conn = await pool.getConnection();
  console.log(\`请求 \${id} 获取连接 \${conn.id}，池状态:\`, pool.getStatus());
  
  // 模拟查询耗时
  await new Promise(r => setTimeout(r, Math.random() * 100));
  
  const result = db.query('SELECT COUNT(*) as cnt FROM users');
  pool.releaseConnection(conn);
  return result;
}

// 并发 8 个请求（超过 max=5，会排队）
Promise.all(
  Array.from({ length: 8 }, (_, i) => concurrentQuery(i + 1))
).then(() => {
  console.log('\\n所有查询完成，最终池状态:', pool.getStatus());
  console.log('\\n=== MySQL 概念演示完成 ===');
});
`,
  },
  {
    id: "n4-mongo-concepts",
    group: "第五部分 数据库",
    icon: "🍃",
    title: "MongoDB 概念与文档数据库",
    content: `# MongoDB 概念与文档数据库

## 一、NoSQL 与文档数据库

MongoDB 是最流行的 NoSQL 文档数据库，由 C++ 编写，名称源自 humongous（巨大的）。

### 1.1 SQL vs NoSQL

| 对比项 | SQL（关系型） | NoSQL（文档型，MongoDB） |
|--------|--------------|------------------------|
| 数据模型 | 表（Table）- 行（Row）- 列（Column） | 集合（Collection）- 文档（Document）- 字段（Field） |
| Schema | 固定 Schema，提前定义表结构 | 灵活 Schema，文档结构可动态变化 |
| 数据关系 | 通过外键、JOIN 关联 | 嵌入式文档、引用（手动关联） |
| 事务 | ACID 事务（多行/多表） | 单文档原子操作，4.0+ 支持多文档事务 |
| 扩展方式 | 垂直扩展（升级硬件）为主 | 水平扩展（分片）为主 |
| 适合场景 | 数据关系明确、事务要求高 | 数据结构多变、海量数据、快速迭代 |

### 1.2 MongoDB 核心概念

| MongoDB 概念 | 对应 SQL 概念 | 说明 |
|-------------|--------------|------|
| **Database** | Database | 数据库，一个 MongoDB 实例可有多个数据库 |
| **Collection** | Table | 集合，一组文档的容器，无固定结构 |
| **Document** | Row | 文档，BSON 格式的键值对集合 |
| **Field** | Column | 字段，文档中的键值对 |
| **_id** | Primary Key | 主键，每个文档必须有，默认自动生成 ObjectId |
| **Index** | Index | 索引，加速查询 |
| **Aggregation** | GROUP BY + JOIN | 聚合管道，复杂数据处理 |

### 1.3 BSON 是什么？

BSON（Binary JSON）是 MongoDB 使用的二进制文档格式：
- 是 JSON 的超集，支持更多数据类型
- 比 JSON 解析更快，支持二进制数据
- 支持的类型：String, Integer, Double, Boolean, Date, ObjectId, Array, Object (子文档), Null, Binary, Decimal128 等

BSON 文档示例：
\`\`\`json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "张三",
  "age": 25,
  "contact": {
    "email": "zhangsan@example.com",
    "phone": "13800138000"
  },
  "hobbies": ["编程", "读书", "运动"],
  "created_at": ISODate("2024-01-01T00:00:00Z")
}
\`\`\`

---

## 二、MongoDB CRUD 操作

### 2.1 插入文档

\`\`\`javascript
// 插入单条
db.users.insertOne({
  name: "张三",
  email: "zhangsan@example.com",
  age: 25
});

// 插入多条
db.users.insertMany([
  { name: "李四", email: "lisi@example.com", age: 30 },
  { name: "王五", email: "wangwu@example.com", age: 28 }
]);
\`\`\`

### 2.2 查询文档

\`\`\`javascript
// 查询所有
db.users.find();

// 条件查询
db.users.find({ age: { $gt: 25 } });

// 查询单条
db.users.findOne({ email: "zhangsan@example.com" });

// 投影（返回指定字段）
db.users.find({}, { name: 1, email: 1, _id: 0 });

// 排序 + 分页
db.users.find().sort({ age: -1 }).skip(10).limit(10);
\`\`\`

### 2.3 更新文档

\`\`\`javascript
// 更新单条
db.users.updateOne(
  { name: "张三" },           // 查询条件
  { $set: { age: 26 } }      // 更新操作
);

// 更新多条
db.users.updateMany(
  { age: { $lt: 25 } },
  { $set: { status: "young" } }
);

// 更新或插入（upsert）
db.users.updateOne(
  { email: "new@example.com" },
  { $set: { name: "新用户", age: 20 } },
  { upsert: true }
);
\`\`\`

### 2.4 删除文档

\`\`\`javascript
// 删除单条
db.users.deleteOne({ name: "张三" });

// 删除多条
db.users.deleteMany({ age: { $lt: 18 } });
\`\`\`

---

## 三、查询运算符

### 3.1 比较运算符

| 运算符 | 说明 |
|--------|------|
| \`$eq\` | 等于（=） |
| \`$ne\` | 不等于（!=） |
| \`$gt\` | 大于（>） |
| \`$gte\` | 大于等于（>=） |
| \`$lt\` | 小于（<） |
| \`$lte\` | 小于等于（<=） |
| \`$in\` | 在数组中 |
| \`$nin\` | 不在数组中 |

### 3.2 逻辑运算符

| 运算符 | 说明 |
|--------|------|
| \`$and\` | 逻辑与（AND） |
| \`$or\` | 逻辑或（OR） |
| \`$not\` | 逻辑非（NOT） |
| \`$nor\` | 既不也不 |
| \`$exists\` | 字段是否存在 |

\`\`\`javascript
// 年龄 > 25 且 (城市是北京或上海)
db.users.find({
  age: { $gt: 25 },
  $or: [
    { city: "北京" },
    { city: "上海" }
  ]
});
\`\`\`

---

## 四、索引与聚合

### 4.1 索引类型
- **单字段索引**：在单个字段上建立索引
- **复合索引**：在多个字段上建立索引，注意字段顺序
- **唯一索引**：保证字段值唯一
- **文本索引**：支持全文搜索
- **TTL 索引**：自动过期删除文档

### 4.2 聚合管道（Aggregation Pipeline）

聚合管道将文档经过多个阶段（stage）处理，最终输出结果：

\`\`\`javascript
db.orders.aggregate([
  { $match: { status: "completed" } },         // 过滤
  { $group: {                                   // 分组
    _id: "$user_id",
    total: { $sum: "$amount" },
    count: { $sum: 1 }
  }},
  { $sort: { total: -1 } },                    // 排序
  { $limit: 10 }                                // 限制
]);
\`\`\`
`,
    code: `// ============================================
// MongoDB 概念演示
// 实现一个内存中的类 MongoDB 文档数据库
// ============================================

const crypto = require('crypto');

// --- 生成类似 MongoDB 的 ObjectId ---
function generateObjectId() {
  // 简化版 ObjectId：时间戳 + 随机数
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const random = crypto.randomBytes(8).toString('hex');
  return (timestamp + random).substring(0, 24);
}

// --- 内存文档集合（类似 MongoDB Collection）---
class Collection {
  constructor(name) {
    this.name = name;
    this.documents = [];
    this.indexes = new Map(); // 字段 -> Map(value -> Set(doc))
  }

  // 生成 _id
  generateId() {
    return generateObjectId();
  }

  // --- 插入单条文档 ---
  insertOne(doc) {
    const document = { ...doc };
    if (!document._id) {
      document._id = this.generateId();
    }
    // 检查 _id 重复
    if (this.documents.some(d => d._id === document._id)) {
      throw new Error(\`Duplicate _id: \${document._id}\`);
    }
    this.documents.push(document);
    this.updateIndexes(document, 'insert');
    return {
      acknowledged: true,
      insertedId: document._id,
    };
  }

  // --- 插入多条文档 ---
  insertMany(docs) {
    const insertedIds = [];
    docs.forEach(doc => {
      const result = this.insertOne(doc);
      insertedIds.push(result.insertedId);
    });
    return {
      acknowledged: true,
      insertedIds,
      insertedCount: insertedIds.length,
    };
  }

  // --- 匹配条件检查 ---
  matchesQuery(doc, query) {
    for (const [key, condition] of Object.entries(query)) {
      // 处理点号（嵌套字段）
      const value = this.getNestedValue(doc, key);
      
      // 条件是对象，包含运算符
      if (condition !== null && typeof condition === 'object' && !Array.isArray(condition)) {
        for (const [op, compareValue] of Object.entries(condition)) {
          if (!this.applyOperator(value, op, compareValue)) {
            return false;
          }
        }
      } else {
        // 简单等值匹配
        if (JSON.stringify(value) !== JSON.stringify(condition)) {
          return false;
        }
      }
    }
    return true;
  }

  // 获取嵌套字段值（支持 "contact.email"）
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  // 应用查询运算符
  applyOperator(value, op, compareValue) {
    switch (op) {
      case '$eq': return value === compareValue;
      case '$ne': return value !== compareValue;
      case '$gt': return value > compareValue;
      case '$gte': return value >= compareValue;
      case '$lt': return value < compareValue;
      case '$lte': return value <= compareValue;
      case '$in': return Array.isArray(compareValue) && compareValue.includes(value);
      case '$nin': return Array.isArray(compareValue) && !compareValue.includes(value);
      case '$exists': return compareValue ? value !== undefined : value === undefined;
      case '$regex': return new RegExp(compareValue).test(String(value));
      default: return true;
    }
  }

  // --- 查询文档 ---
  find(query = {}, options = {}) {
    // 处理逻辑运算符
    let results = this.documents.filter(doc => {
      // $or
      if (query.$or) {
        if (!query.$or.some(cond => this.matchesQuery(doc, cond))) {
          return false;
        }
      }
      // $and
      if (query.$and) {
        if (!query.$and.every(cond => this.matchesQuery(doc, cond))) {
          return false;
        }
      }
      // 其他字段条件（排除逻辑运算符）
      const fieldQuery = { ...query };
      delete fieldQuery.$or;
      delete fieldQuery.$and;
      return this.matchesQuery(doc, fieldQuery);
    });

    // 投影（选择字段）
    if (options.projection) {
      results = results.map(doc => this.projectFields(doc, options.projection));
    }

    // 排序
    if (options.sort) {
      results = this.applySort(results, options.sort);
    }

    // 跳过
    if (options.skip) {
      results = results.slice(options.skip);
    }

    // 限制
    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return {
      toArray: () => results,
      count: () => results.length,
      forEach: (fn) => results.forEach(fn),
      pretty: () => JSON.stringify(results, null, 2),
    };
  }

  // 查询单条
  findOne(query = {}, options = {}) {
    const results = this.find(query, { ...options, limit: 1 }).toArray();
    return results[0] || null;
  }

  // 字段投影
  projectFields(doc, projection) {
    const result = {};
    const includeMode = Object.values(projection).some(v => v === 1);
    
    if (includeMode) {
      // 包含模式：只显示指定字段
      if (projection._id !== 0) result._id = doc._id;
      for (const [field, include] of Object.entries(projection)) {
        if (include === 1 && field !== '_id') {
          result[field] = doc[field];
        }
      }
    } else {
      // 排除模式
      for (const [key, value] of Object.entries(doc)) {
        if (projection[key] !== 0) {
          result[key] = value;
        }
      }
    }
    return result;
  }

  // 排序
  applySort(docs, sortSpec) {
    return [...docs].sort((a, b) => {
      for (const [field, order] of Object.entries(sortSpec)) {
        const aVal = this.getNestedValue(a, field);
        const bVal = this.getNestedValue(b, field);
        if (aVal < bVal) return -1 * order;
        if (aVal > bVal) return 1 * order;
      }
      return 0;
    });
  }

  // --- 更新文档 ---
  updateOne(query, update, options = {}) {
    const docIndex = this.documents.findIndex(d => this.matchesQuery(d, query));
    
    if (docIndex === -1) {
      if (options.upsert) {
        // upsert：不存在则插入
        const newDoc = { ...query };
        if (update.$set) Object.assign(newDoc, update.$set);
        return this.insertOne(newDoc);
      }
      return { matchedCount: 0, modifiedCount: 0 };
    }

    const doc = this.documents[docIndex];
    this.updateIndexes(doc, 'delete');
    
    if (update.$set) {
      Object.assign(doc, update.$set);
    }
    if (update.$inc) {
      for (const [field, amount] of Object.entries(update.$inc)) {
        doc[field] = (doc[field] || 0) + amount;
      }
    }
    if (update.$push) {
      for (const [field, value] of Object.entries(update.$push)) {
        if (!Array.isArray(doc[field])) doc[field] = [];
        doc[field].push(value);
      }
    }
    
    this.updateIndexes(doc, 'insert');
    return { matchedCount: 1, modifiedCount: 1 };
  }

  updateMany(query, update) {
    let matchedCount = 0;
    let modifiedCount = 0;
    this.documents.forEach((doc, idx) => {
      if (this.matchesQuery(doc, query)) {
        matchedCount++;
        this.updateIndexes(doc, 'delete');
        if (update.$set) Object.assign(doc, update.$set);
        if (update.$inc) {
          for (const [field, amount] of Object.entries(update.$inc)) {
            doc[field] = (doc[field] || 0) + amount;
          }
        }
        this.updateIndexes(doc, 'insert');
        modifiedCount++;
      }
    });
    return { matchedCount, modifiedCount };
  }

  // --- 删除文档 ---
  deleteOne(query) {
    const idx = this.documents.findIndex(d => this.matchesQuery(d, query));
    if (idx !== -1) {
      this.updateIndexes(this.documents[idx], 'delete');
      this.documents.splice(idx, 1);
      return { acknowledged: true, deletedCount: 1 };
    }
    return { acknowledged: true, deletedCount: 0 };
  }

  deleteMany(query) {
    let count = 0;
    for (let i = this.documents.length - 1; i >= 0; i--) {
      if (this.matchesQuery(this.documents[i], query)) {
        this.updateIndexes(this.documents[i], 'delete');
        this.documents.splice(i, 1);
        count++;
      }
    }
    return { acknowledged: true, deletedCount: count };
  }

  // --- 简单聚合 ---
  aggregate(pipeline) {
    let result = [...this.documents];
    
    for (const stage of pipeline) {
      if (stage.$match) {
        result = result.filter(doc => this.matchesQuery(doc, stage.$match));
      } else if (stage.$group) {
        const groups = new Map();
        result.forEach(doc => {
          const key = this.getNestedValue(doc, stage.$group._id.substring(1));
          if (!groups.has(key)) groups.set(key, { _id: key });
          const group = groups.get(key);
          for (const [field, op] of Object.entries(stage.$group)) {
            if (field === '_id') continue;
            const opType = Object.keys(op)[0];
            const opField = op[opType].substring(1);
            if (opType === '$sum') {
              if (op[opType] === 1) {
                group[field] = (group[field] || 0) + 1;
              } else {
                group[field] = (group[field] || 0) + (doc[opField] || 0);
              }
            } else if (opType === '$avg') {
              if (!group._values) group._values = [];
              group._values.push(doc[opField] || 0);
              group[field] = group._values.reduce((a, b) => a + b, 0) / group._values.length;
            }
          }
        });
        result = Array.from(groups.values()).map(g => {
          delete g._values;
          return g;
        });
      } else if (stage.$sort) {
        result = this.applySort(result, stage.$sort);
      } else if (stage.$limit) {
        result = result.slice(0, stage.$limit);
      } else if (stage.$skip) {
        result = result.slice(stage.$skip);
      }
    }
    return result;
  }

  // --- 索引管理（简化版）---
  createIndex(field) {
    if (!this.indexes.has(field)) {
      this.indexes.set(field, new Map());
    }
    // 重建索引
    const index = this.indexes.get(field);
    index.clear();
    this.documents.forEach(doc => {
      const val = doc[field];
      if (!index.has(val)) index.set(val, new Set());
      index.get(val).add(doc);
    });
  }

  updateIndexes(doc, action) {
    // 简化：索引维护逻辑（实际实现更复杂）
  }

  countDocuments(query = {}) {
    return this.find(query).count();
  }
}

// --- 内存数据库（类似 MongoDB Client）---
class InMemoryMongoDB {
  constructor() {
    this.collections = new Map();
  }

  collection(name) {
    if (!this.collections.has(name)) {
      this.collections.set(name, new Collection(name));
    }
    return this.collections.get(name);
  }
}

// --- 演示开始 ---
console.log('=== MongoDB 概念演示 ===\\n');

const db = new InMemoryMongoDB();
const users = db.collection('users');
const posts = db.collection('posts');

// --- 1. 插入文档 ---
console.log('--- 1. 插入用户文档 ---');
const userResults = users.insertMany([
  {
    name: '张三',
    email: 'zhangsan@mongo.com',
    age: 25,
    city: '北京',
    contact: { phone: '13800138001', wechat: 'zhangsan_wx' },
    tags: ['developer', 'nodejs'],
    status: 'active',
    createdAt: new Date('2024-01-15'),
  },
  {
    name: '李四',
    email: 'lisi@mongo.com',
    age: 30,
    city: '上海',
    contact: { phone: '13800138002', wechat: 'lisi_wx' },
    tags: ['designer', 'ui'],
    status: 'active',
    createdAt: new Date('2024-02-20'),
  },
  {
    name: '王五',
    email: 'wangwu@mongo.com',
    age: 28,
    city: '北京',
    contact: { phone: '13800138003' },
    tags: ['manager'],
    status: 'active',
    createdAt: new Date('2024-03-10'),
  },
  {
    name: '赵六',
    email: 'zhaoliu@mongo.com',
    age: 22,
    city: '深圳',
    tags: ['intern', 'developer'],
    status: 'inactive',
    createdAt: new Date('2024-04-01'),
  },
]);
console.log(\`插入 \${userResults.insertedCount} 个用户\`);
console.log('');

// --- 2. 查询所有 ---
console.log('--- 2. 查询所有用户（仅返回 name, email, city）---');
const allUsers = users.find({}, { projection: { name: 1, email: 1, city: 1 } }).toArray();
console.table(allUsers);

// --- 3. 比较运算符查询 ---
console.log('\\n--- 3. 查询年龄 > 25 的用户（$gt）---');
const olderUsers = users.find({ age: { $gt: 25 } }, { projection: { name: 1, age: 1, city: 1 } }).toArray();
console.table(olderUsers);

// --- 4. $in 运算符 ---
console.log('\\n--- 4. 查询城市在北京或深圳的用户（$in）---');
const cityUsers = users.find(
  { city: { $in: ['北京', '深圳'] } },
  { projection: { name: 1, city: 1 } }
).toArray();
console.table(cityUsers);

// --- 5. $or 逻辑运算符 ---
console.log('\\n--- 5. 北京用户 或 年龄 < 25（$or）---');
const orUsers = users.find({
  $or: [
    { city: '北京' },
    { age: { $lt: 25 } }
  ]
}, { projection: { name: 1, age: 1, city: 1 } }).toArray();
console.table(orUsers);

// --- 6. $exists 检查字段是否存在 ---
console.log('\\n--- 6. 没有 wechat 联系方式的用户（$exists）---');
const noWechat = users.find(
  { 'contact.wechat': { $exists: false } },
  { projection: { name: 1, contact: 1 } }
).toArray();
console.log(noWechat.map(u => ({ name: u.name, phone: u.contact?.phone })));

// --- 7. 排序 + 分页 ---
console.log('\\n--- 7. 按年龄降序排列，跳过1条，取2条（sort + skip + limit）---');
const pagedUsers = users.find(
  {},
  { 
    projection: { name: 1, age: 1 },
    sort: { age: -1 },
    skip: 1,
    limit: 2,
  }
).toArray();
console.table(pagedUsers);

// --- 8. 更新 ---
console.log('\\n--- 8. 张三年龄增长1岁（$inc），添加标签（$push）---');
users.updateOne(
  { name: '张三' },
  {
    $inc: { age: 1 },
    $push: { tags: 'mongodb' },
    $set: { updatedAt: new Date() },
  }
);
console.log(users.findOne({ name: '张三' }, { projection: { name: 1, age: 1, tags: 1 } }));

// --- 9. upsert ---
console.log('\\n--- 9. upsert：不存在则插入 ---');
users.updateOne(
  { email: 'newuser@mongo.com' },
  { $set: { name: '新用户', age: 20, city: '杭州' } },
  { upsert: true }
);
console.log('新用户数量:', users.countDocuments({ city: '杭州' }));

// --- 10. 聚合管道 ---
console.log('\\n--- 10. 聚合：按城市分组统计人数和平均年龄 ---');
const cityStats = users.aggregate([
  { $match: { status: 'active' } },
  {
    $group: {
      _id: '$city',
      userCount: { $sum: 1 },
      avgAge: { $avg: '$age' },
    }
  },
  { $sort: { userCount: -1 } },
]);
console.table(cityStats);

// --- 11. 删除 ---
console.log('\\n--- 11. 删除 inactive 用户 ---');
const deleteResult = users.deleteMany({ status: 'inactive' });
console.log(\`删除了 \${deleteResult.deletedCount} 个用户\`);
console.log('剩余用户数:', users.countDocuments());

console.log('\\n=== MongoDB 概念演示完成 ===');
`,
  },
  {
    id: "n4-redis-concepts",
    group: "第五部分 数据库",
    icon: "🔴",
    title: "Redis 概念与缓存设计",
    content: `# Redis 概念与缓存设计

## 一、什么是 Redis

Redis（Remote Dictionary Server）是一个开源的、基于内存的键值对存储系统，可用作数据库、缓存、消息中间件。

### 1.1 Redis 核心特点

| 特点 | 说明 |
|------|------|
| **内存存储** | 数据主要存储在内存中，读写速度极快（10万+ QPS） |
| **持久化** | 支持 RDB 和 AOF 两种方式将数据持久化到磁盘 |
| **丰富数据结构** | 支持 String, List, Set, Hash, Sorted Set 等多种类型 |
| **单线程模型** | 核心命令执行是单线程的，避免线程切换和锁开销 |
| **原子操作** | 所有命令都是原子性的，支持事务 |
| **过期机制** | 支持为键设置 TTL（存活时间），到期自动删除 |
| **发布订阅** | 内置 Pub/Sub 消息通信模式 |
| **Lua 脚本** | 支持执行 Lua 脚本实现复杂逻辑 |

### 1.2 Redis 适用场景

- **缓存**：数据库查询缓存、页面缓存、API 响应缓存（最常用）
- **会话存储**：分布式 Session，如用户登录状态
- **排行榜**：利用 Sorted Set 实现实时排行
- **计数器/限流器**：文章浏览量、API 调用频率限制
- **消息队列**：List 做简单队列，Pub/Sub 做消息广播
- **分布式锁**：SETNX 实现跨进程/跨机器锁
- **最新列表**：朋友圈时间线、最新消息列表

---

## 二、Redis 数据类型

### 2.1 String（字符串）

最基本的类型，可存储字符串、整数、浮点数，最大 512MB。

\`\`\`
SET key value          # 设置值
GET key                # 获取值
DEL key                # 删除
INCR key               # 原子性 +1
DECR key               # 原子性 -1
INCRBY key n           # +n
SETEX key seconds val  # 设置值并指定过期时间
SETNX key val          # 不存在才设置（用于分布式锁）
MGET k1 k2 k3          # 批量获取
\`\`\`

适用场景：缓存对象、计数器、分布式锁、Session。

### 2.2 List（列表）

有序的字符串列表（双向链表实现），可从两端推入/弹出。

\`\`\`
LPUSH key val          # 从左侧推入
RPUSH key val          # 从右侧推入
LPOP key               # 从左侧弹出
RPOP key               # 从右侧弹出
LRANGE key start stop  # 获取范围元素（-1 表示最后一个）
LLEN key               # 列表长度
LREM key count val     # 删除元素
\`\`\`

适用场景：消息队列、最新文章列表、任务列表。

### 2.3 Set（集合）

无序、唯一的字符串集合，基于哈希表实现。

\`\`\`
SADD key member        # 添加元素
SREM key member        # 删除元素
SMEMBERS key           # 获取所有元素
SISMEMBER key member   # 判断是否存在
SCARD key              # 元素数量
SINTER k1 k2           # 交集
SUNION k1 k2           # 并集
SDIFF k1 k2            # 差集
\`\`\`

适用场景：标签、共同好友、抽奖去重、关注关系。

### 2.4 Hash（哈希）

键值对集合，适合存储对象。

\`\`\`
HSET key field val     # 设置字段
HGET key field         # 获取字段
HMSET key f1 v1 f2 v2  # 批量设置
HMGET key f1 f2        # 批量获取
HGETALL key            # 获取所有字段和值
HDEL key field         # 删除字段
HKEYS key              # 所有字段
HVALS key              # 所有值
HLEN key               # 字段数量
HINCRBY key field n    # 字段值 +n
\`\`\`

适用场景：用户信息、商品详情、对象缓存（比 String 更节省内存，可部分更新）。

### 2.5 Sorted Set（有序集合 / ZSet）

类似 Set，但每个元素关联一个 score（分数）用于排序。

\`\`\`
ZADD key score member  # 添加元素
ZRANGE key start stop  # 按分数升序获取范围
ZREVRANGE key 0 -1     # 按分数降序
ZRANK key member       # 获取排名（升序）
ZREVRANK key member    # 获取排名（降序）
ZSCORE key member      # 获取分数
ZINCRBY key n member   # 分数 +n
ZCARD key              # 元素数量
ZRANGEBYSCORE key min max # 按分数范围查询
\`\`\`

适用场景：排行榜、带权重的队列、延迟队列。

---

## 三、过期与 TTL

\`\`\`
EXPIRE key seconds     # 设置过期时间（秒）
PEXPIRE key ms         # 设置过期时间（毫秒）
TTL key                # 查看剩余存活时间（-1 永不过期，-2 不存在）
PERSIST key            # 移除过期时间
\`\`\`

过期键删除策略：
- **惰性删除**：访问时才检查是否过期，CPU 友好但内存不友好
- **定期删除**：每隔一段时间随机抽查一批键，删除过期的
- **Redis 实际采用**：惰性删除 + 定期删除结合

---

## 四、缓存设计模式

### 4.1 Cache-Aside（旁路缓存）

最常用的模式：
1. **读**：先查缓存，命中直接返回；未命中查数据库，然后写入缓存
2. **写**：先更新数据库，再删除缓存（不是更新缓存）

\`\`\`
读流程：cache → miss → DB → set cache
写流程：update DB → delete cache
\`\`\`

### 4.2 Write-Through（写穿透）

写数据时同时写缓存和数据库，缓存始终与数据库保持一致。

### 4.3 Write-Behind（写回）

写数据时只写缓存，异步批量写入数据库，性能高但可能丢数据。

### 4.4 缓存常见问题

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| **缓存穿透** | 查询不存在的数据，缓存和 DB 都没有 | 布隆过滤器、缓存空值 |
| **缓存击穿** | 热点 key 过期，大量请求直达 DB | 互斥锁、永不过期 |
| **缓存雪崩** | 大量 key 同时过期 / Redis 宕机 | 过期时间加随机值、Redis 集群、熔断降级 |
`,
    code: `// ============================================
// Redis 概念演示
// 实现一个内存中的类 Redis 键值存储
// ============================================

// --- 类 Redis 内存存储实现 ---
class RedisLikeStore {
  constructor() {
    this.data = new Map();       // 存储键值对
    this.expires = new Map();    // 存储过期时间
    this.startCleanupTimer();    // 启动定期清理
  }

  // --- 定期清理过期键 ---
  startCleanupTimer() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, expireAt] of this.expires) {
        if (now >= expireAt) {
          this.data.delete(key);
          this.expires.delete(key);
        }
      }
    }, 1000); // 每秒清理一次（演示用，实际 Redis 更复杂）
  }

  // 检查键是否过期
  isExpired(key) {
    const expireAt = this.expires.get(key);
    if (expireAt && Date.now() >= expireAt) {
      this.data.delete(key);
      this.expires.delete(key);
      return true;
    }
    return false;
  }

  // ========== String 操作 ==========
  set(key, value, ttlSeconds = null) {
    this.data.set(key, String(value));
    if (ttlSeconds !== null) {
      this.expires.set(key, Date.now() + ttlSeconds * 1000);
    }
    return 'OK';
  }

  get(key) {
    if (this.isExpired(key)) return null;
    return this.data.has(key) ? this.data.get(key) : null;
  }

  setnx(key, value) {
    if (this.exists(key)) return 0;
    this.set(key, value);
    return 1;
  }

  setex(key, seconds, value) {
    return this.set(key, value, seconds);
  }

  incr(key) {
    const current = parseInt(this.get(key) || '0');
    const newValue = current + 1;
    this.set(key, String(newValue));
    return newValue;
  }

  decr(key) {
    const current = parseInt(this.get(key) || '0');
    const newValue = current - 1;
    this.set(key, String(newValue));
    return newValue;
  }

  incrby(key, amount) {
    const current = parseInt(this.get(key) || '0');
    const newValue = current + amount;
    this.set(key, String(newValue));
    return newValue;
  }

  mget(...keys) {
    return keys.map(k => this.get(k));
  }

  // ========== 通用操作 ==========
  del(...keys) {
    let count = 0;
    keys.forEach(key => {
      if (this.data.has(key)) {
        this.data.delete(key);
        this.expires.delete(key);
        count++;
      }
    });
    return count;
  }

  exists(key) {
    if (this.isExpired(key)) return 0;
    return this.data.has(key) ? 1 : 0;
  }

  expire(key, seconds) {
    if (!this.data.has(key)) return 0;
    this.expires.set(key, Date.now() + seconds * 1000);
    return 1;
  }

  ttl(key) {
    if (!this.data.has(key)) return -2;
    const expireAt = this.expires.get(key);
    if (!expireAt) return -1;
    const remaining = Math.ceil((expireAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }

  keys(pattern = '*') {
    const result = [];
    for (const key of this.data.keys()) {
      if (this.isExpired(key)) continue;
      if (pattern === '*' || this.matchPattern(key, pattern)) {
        result.push(key);
      }
    }
    return result;
  }

  // 简单的 glob 模式匹配（支持 * 和 ?）
  matchPattern(str, pattern) {
    const regex = new RegExp(
      '^' + pattern.replace(/\\*/g, '.*').replace(/\\?/g, '.') + '$'
    );
    return regex.test(str);
  }

  // ========== List 操作 ==========
  lpush(key, ...values) {
    if (!this.data.has(key)) this.data.set(key, []);
    const list = this.data.get(key);
    if (!Array.isArray(list)) throw new Error('WRONGTYPE: Operation against a key holding the wrong kind of value');
    values.reverse().forEach(v => list.unshift(String(v)));
    return list.length;
  }

  rpush(key, ...values) {
    if (!this.data.has(key)) this.data.set(key, []);
    const list = this.data.get(key);
    if (!Array.isArray(list)) throw new Error('WRONGTYPE');
    values.forEach(v => list.push(String(v)));
    return list.length;
  }

  lpop(key) {
    if (this.isExpired(key) || !this.data.has(key)) return null;
    const list = this.data.get(key);
    if (!Array.isArray(list) || list.length === 0) return null;
    const val = list.shift();
    if (list.length === 0) this.data.delete(key);
    return val;
  }

  rpop(key) {
    if (this.isExpired(key) || !this.data.has(key)) return null;
    const list = this.data.get(key);
    if (!Array.isArray(list) || list.length === 0) return null;
    const val = list.pop();
    if (list.length === 0) this.data.delete(key);
    return val;
  }

  lrange(key, start, stop) {
    if (this.isExpired(key) || !this.data.has(key)) return [];
    const list = this.data.get(key);
    if (!Array.isArray(list)) return [];
    const len = list.length;
    if (start < 0) start = len + start;
    if (stop < 0) stop = len + stop + 1;
    else stop = stop + 1;
    return list.slice(start, stop);
  }

  llen(key) {
    if (this.isExpired(key) || !this.data.has(key)) return 0;
    const list = this.data.get(key);
    return Array.isArray(list) ? list.length : 0;
  }

  // ========== Set 操作 ==========
  sadd(key, ...members) {
    if (!this.data.has(key)) this.data.set(key, new Set());
    const set = this.data.get(key);
    if (!(set instanceof Set)) throw new Error('WRONGTYPE');
    let count = 0;
    members.forEach(m => {
      if (!set.has(String(m))) {
        set.add(String(m));
        count++;
      }
    });
    return count;
  }

  srem(key, ...members) {
    if (!this.data.has(key)) return 0;
    const set = this.data.get(key);
    if (!(set instanceof Set)) return 0;
    let count = 0;
    members.forEach(m => {
      if (set.delete(String(m))) count++;
    });
    if (set.size === 0) this.data.delete(key);
    return count;
  }

  smembers(key) {
    if (this.isExpired(key) || !this.data.has(key)) return [];
    const set = this.data.get(key);
    return set instanceof Set ? Array.from(set) : [];
  }

  sismember(key, member) {
    if (this.isExpired(key) || !this.data.has(key)) return 0;
    const set = this.data.get(key);
    return set instanceof Set && set.has(String(member)) ? 1 : 0;
  }

  scard(key) {
    if (this.isExpired(key) || !this.data.has(key)) return 0;
    const set = this.data.get(key);
    return set instanceof Set ? set.size : 0;
  }

  // ========== Hash 操作 ==========
  hset(key, field, value) {
    if (!this.data.has(key)) this.data.set(key, {});
    const hash = this.data.get(key);
    if (typeof hash !== 'object' || Array.isArray(hash) || hash instanceof Set) {
      throw new Error('WRONGTYPE');
    }
    const isNew = !(field in hash);
    hash[field] = String(value);
    return isNew ? 1 : 0;
  }

  hget(key, field) {
    if (this.isExpired(key) || !this.data.has(key)) return null;
    const hash = this.data.get(key);
    if (typeof hash !== 'object' || Array.isArray(hash)) return null;
    return hash[field] !== undefined ? hash[field] : null;
  }

  hgetall(key) {
    if (this.isExpired(key) || !this.data.has(key)) return {};
    const hash = this.data.get(key);
    return typeof hash === 'object' && !Array.isArray(hash) ? { ...hash } : {};
  }

  hincrby(key, field, amount) {
    const current = parseInt(this.hget(key, field) || '0');
    const newValue = current + amount;
    this.hset(key, field, String(newValue));
    return newValue;
  }

  hlen(key) {
    return Object.keys(this.hgetall(key)).length;
  }

  // ========== Sorted Set 操作（简化实现）==========
  zadd(key, score, member) {
    if (!this.data.has(key)) this.data.set(key, new Map());
    const zset = this.data.get(key);
    if (!(zset instanceof Map)) throw new Error('WRONGTYPE');
    const isNew = !zset.has(member);
    zset.set(member, score);
    return isNew ? 1 : 0;
  }

  zrange(key, start, stop) {
    if (this.isExpired(key) || !this.data.has(key)) return [];
    const zset = this.data.get(key);
    if (!(zset instanceof Map)) return [];
    const entries = Array.from(zset.entries())
      .sort((a, b) => a[1] - b[1]);
    const len = entries.length;
    if (start < 0) start = len + start;
    if (stop < 0) stop = len + stop + 1;
    else stop = stop + 1;
    return entries.slice(start, stop).map(([m]) => m);
  }

  zrevrange(key, start, stop) {
    return this.zrange(key, start, stop).reverse();
  }

  zcard(key) {
    if (this.isExpired(key) || !this.data.has(key)) return 0;
    const zset = this.data.get(key);
    return zset instanceof Map ? zset.size : 0;
  }
}

// --- 基于 Redis 的限流器（固定窗口 + 滑动窗口）---
class RateLimiter {
  constructor(store) {
    this.store = store;
  }

  // 固定窗口限流
  isAllowedFixed(key, limit, windowSeconds) {
    const count = parseInt(this.store.get(key) || '0');
    if (count >= limit) return false;
    this.store.incr(key);
    if (count === 0) {
      this.store.expire(key, windowSeconds);
    }
    return true;
  }

  // 滑动窗口限流（使用 ZSet 实现）
  isAllowedSliding(key, limit, windowSeconds) {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const zsetKey = \`ratelimit:\${key}\`;
    
    // 移除窗口外的记录
    // 注意：我们的简化实现没有 ZREMRANGEBYSCORE，这里用其他方式
    // 实际 Redis: ZREMRANGEBYSCORE key 0 (now - windowMs)
    
    const count = this.store.zcard(zsetKey);
    if (count >= limit) return false;
    
    this.store.zadd(zsetKey, now, now + '-' + Math.random());
    this.store.expire(zsetKey, windowSeconds + 1);
    return true;
  }
}

// --- 演示开始 ---
console.log('=== Redis 概念与缓存设计演示 ===\\n');

const redis = new RedisLikeStore();

// --- 1. String 类型操作 ---
console.log('--- 1. String 类型：缓存用户信息 ---');
redis.set('user:1:name', '张三');
redis.set('user:1:email', 'zhangsan@redis.com');
redis.setex('session:abc123', 10, JSON.stringify({ userId: 1, role: 'admin' })); // 10秒过期
console.log('用户名:', redis.get('user:1:name'));
console.log('用户邮箱:', redis.get('user:1:email'));
console.log('Session TTL:', redis.ttl('session:abc123'), '秒');
console.log('');

// --- 2. 计数器 ---
console.log('--- 2. 计数器：文章浏览量 ---');
redis.set('article:100:views', 1000);
for (let i = 0; i < 5; i++) redis.incr('article:100:views');
console.log('文章 100 浏览量:', redis.get('article:100:views'));
redis.incrby('article:100:views', 100);
console.log('增加 100 后:', redis.get('article:100:views'));
console.log('');

// --- 3. SETNX 分布式锁演示 ---
console.log('--- 3. SETNX 实现简单分布式锁 ---');
const lockKey = 'lock:order:123';
const lock1 = redis.setnx(lockKey, 'process-1');
console.log('进程 1 获取锁:', lock1 === 1 ? '成功' : '失败');
const lock2 = redis.setnx(lockKey, 'process-2');
console.log('进程 2 获取锁:', lock2 === 1 ? '成功' : '失败');
redis.del(lockKey);
const lock3 = redis.setnx(lockKey, 'process-2');
console.log('释放后进程 2 获取锁:', lock3 === 1 ? '成功' : '失败');
redis.del(lockKey);
console.log('');

// --- 4. List 消息队列 ---
console.log('--- 4. List 实现简单消息队列 ---');
redis.rpush('queue:tasks', 'task1', 'task2', 'task3');
console.log('队列长度:', redis.llen('queue:tasks'));
console.log('队列内容:', redis.lrange('queue:tasks', 0, -1));
console.log('处理任务:', redis.lpop('queue:tasks'));
console.log('处理任务:', redis.lpop('queue:tasks'));
console.log('剩余队列:', redis.lrange('queue:tasks', 0, -1));
redis.del('queue:tasks');
console.log('');

// --- 5. Set 标签系统 ---
console.log('--- 5. Set 标签与共同关注 ---');
redis.sadd('user:1:tags', 'javascript', 'nodejs', 'react');
redis.sadd('user:2:tags', 'nodejs', 'python', 'react');
console.log('用户 1 标签:', redis.smembers('user:1:tags'));
console.log('用户 2 标签:', redis.smembers('user:2:tags'));
console.log('用户 1 是否有 nodejs 标签:', redis.sismember('user:1:tags', 'nodejs') ? '是' : '否');
redis.del('user:1:tags', 'user:2:tags');
console.log('');

// --- 6. Hash 对象存储 ---
console.log('--- 6. Hash 存储用户对象 ---');
redis.hset('user:100', 'name', '李四');
redis.hset('user:100', 'age', '28');
redis.hset('user:100', 'city', '上海');
redis.hincrby('user:100', 'age', 1);
console.log('用户 100 全部信息:', redis.hgetall('user:100'));
console.log('用户名:', redis.hget('user:100', 'name'));
console.log('字段数量:', redis.hlen('user:100'));
redis.del('user:100');
console.log('');

// --- 7. Sorted Set 排行榜 ---
console.log('--- 7. Sorted Set 游戏积分排行榜 ---');
redis.zadd('leaderboard', 1500, '玩家A');
redis.zadd('leaderboard', 2200, '玩家B');
redis.zadd('leaderboard', 1800, '玩家C');
redis.zadd('leaderboard', 2500, '玩家D');
redis.zadd('leaderboard', 1900, '玩家E');
console.log('排行榜（升序）:', redis.zrange('leaderboard', 0, -1));
console.log('排行榜（降序 Top 3）:', redis.zrevrange('leaderboard', 0, 2));
console.log('排行榜人数:', redis.zcard('leaderboard'));
redis.del('leaderboard');
console.log('');

// --- 8. 缓存模式演示：Cache-Aside ---
console.log('--- 8. Cache-Aside 缓存模式演示 ---');

function simulateDBQuery(userId) {
  // 模拟数据库查询（慢）
  const users = {
    1: { id: 1, name: '张三', fromDB: true },
    2: { id: 2, name: '李四', fromDB: true },
  };
  return users[userId] || null;
}

function getUserWithCache(userId) {
  const cacheKey = \`user:\${userId}\`;
  
  // 1. 先查缓存
  const cached = redis.get(cacheKey);
  if (cached) {
    console.log(\`  \${cacheKey} 缓存命中\`);
    return JSON.parse(cached);
  }
  
  // 2. 未命中，查数据库
  console.log(\`  \${cacheKey} 缓存未命中，查数据库...\`);
  const user = simulateDBQuery(userId);
  if (user) {
    // 3. 写入缓存，设置过期时间 60 秒
    redis.setex(cacheKey, 60, JSON.stringify({ ...user, fromCache: true }));
  }
  return user;
}

console.log('第一次查询用户 1:');
getUserWithCache(1);
console.log('第二次查询用户 1:');
getUserWithCache(1);
redis.del('user:1', 'user:2');
console.log('');

// --- 9. 限流演示 ---
console.log('--- 9. 固定窗口限流演示（每秒最多 3 次请求）---');
const limiter = new RateLimiter(redis);
const limitKey = 'api:/users';

for (let i = 1; i <= 5; i++) {
  const allowed = limiter.isAllowedFixed(limitKey, 3, 1);
  console.log(\`  请求 \${i}: \${allowed ? '✅ 通过' : '❌ 被限流'}\`);
}
redis.del(limitKey);

console.log('\\n=== Redis 演示完成 ===');
console.log('Redis 常用命令已通过内存存储模拟实现');
console.log('实际项目中请使用 ioredis 或 node-redis 连接真实 Redis 服务');
`,
  },
  {
    id: "n4-orm-concepts",
    group: "第五部分 数据库",
    icon: "🔗",
    title: "ORM 概念与数据访问层设计",
    content: `# ORM 概念与数据访问层设计

## 一、什么是 ORM

ORM（Object-Relational Mapping，对象关系映射）是一种程序设计技术，用于在面向对象语言和关系型数据库之间进行数据转换。

简单来说：**让你用操作对象的方式来操作数据库，不用手写 SQL**。

### 1.1 为什么需要 ORM？

| 痛点 | ORM 解决方案 |
|------|------------|
| 手写大量重复 SQL | 自动生成 CRUD SQL |
| 不同数据库 SQL 方言有差异 | 抽象数据库差异，切换数据库成本低 |
| 手动映射结果集到对象 | 自动将查询结果映射为 JavaScript 对象 |
| SQL 注入风险 | 内置参数化查询，自动防注入 |
| 数据库表结构和代码不同步 | Model 定义即表结构 |
| 事务、连接管理繁琐 | 统一封装，简化 API |

### 1.2 ORM 的优缺点

**优点：**
- 提高开发效率，减少重复代码
- 数据库无关性（理论上）
- 面向对象编程，代码更易维护
- 自动防 SQL 注入
- 内置迁移、种子数据等工具

**缺点：**
- 学习曲线（需要学习 ORM 的 API）
- 复杂查询性能可能不如手写 SQL
- 生成的 SQL 可能不够优化
- 过度抽象可能导致"黑盒"问题，难以调试
- 极端场景下仍然需要写原生 SQL

---

## 二、常见 ORM 模式

### 2.1 Active Record 模式

**核心思想：** 一个 Model 类对应一张表，一个 Model 实例对应一行记录，对象本身带有 CRUD 方法。

**代表：** Sequelize、Ruby on Rails Active Record、Mongoose（MongoDB）

\`\`\`javascript
// Active Record 风格
const user = await User.create({ name: '张三', email: 'zs@test.com' });
user.age = 26;
await user.save();
await user.delete();

const users = await User.findAll({ where: { age: { $gt: 25 } } });
\`\`\`

**特点：**
- Model 类同时承担数据定义和数据操作职责
- API 简洁直观，上手快
- 适合简单 CRUD 场景

### 2.2 Data Mapper 模式

**核心思想：** Model 类只定义数据结构和业务逻辑，数据库操作由单独的 Repository/Mapper 类负责。

**代表：** TypeORM（支持两种模式）、Hibernate（Java）、Doctrine（PHP）

\`\`\`javascript
// Data Mapper 风格
const userRepository = connection.getRepository(User);
const user = await userRepository.save({ name: '张三', email: 'zs@test.com' });
const users = await userRepository.find({ where: { age: MoreThan(25) } });
\`\`\`

**特点：**
- 关注点分离：实体类纯净，不继承 ORM 基类
- 更易测试（Repository 可以 Mock）
- 更适合大型项目、领域驱动设计（DDD）

### 2.3 Repository 模式

Repository 模式是 Data Mapper 的进一步抽象：
- Repository 作为领域层和数据映射层的中介
- 像操作集合一样操作数据，隐藏底层数据来源
- 可以很容易地替换数据源（数据库换为缓存、API 等）

---

## 三、Query Builder（查询构造器）

Query Builder 提供链式调用 API 来构造 SQL 查询，比手写 SQL 更安全、更可编程，比完整 ORM 更灵活。

\`\`\`javascript
// Query Builder 风格（Knex.js）
const users = await knex('users')
  .select('id', 'name', 'email')
  .where('age', '>', 25)
  .whereIn('city', ['北京', '上海'])
  .orderBy('created_at', 'desc')
  .limit(10);
\`\`\`

**Query Builder 的优势：**
- 链式调用，IDE 智能提示
- 动态条件拼接非常方便
- 自动参数化，防注入
- 生成的 SQL 清晰可控

---

## 四、Migrations（数据库迁移）

迁移是一种管理数据库 schema 版本控制的方式：
- 每个迁移文件描述一次数据库变更（建表、加字段、加索引等）
- 迁移有 up（执行变更）和 down（回滚变更）
- 团队成员通过迁移文件保持数据库结构同步

\`\`\`javascript
// 迁移文件示例
exports.up = function(knex) {
  return knex.schema.createTable('users', table => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').unique().notNullable();
    table.timestamps(); // created_at, updated_at
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
\`\`\`
`,
    code: `// ============================================
// ORM 概念与数据访问层演示
// 实现一个简单的 Data Mapper + Query Builder
// ============================================

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'demo_orm.db');
if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

// --- 底层数据库驱动（简化版）---
class DBDriver {
  constructor(dbPath) {
    this.dbPath = dbPath;
  }

  exec(sql) {
    execSync(\`sqlite3 '\${this.dbPath}' "\${sql.replace(/"/g, '\\\\"')}"\`);
  }

  query(sql, params = []) {
    let processed = sql;
    params.forEach(p => {
      processed = processed.replace('?', \`'\${String(p).replace(/'/g, "''")}'\`);
    });
    try {
      const out = execSync(
        \`sqlite3 -header -column '\${this.dbPath}' "\${processed.replace(/"/g, '\\\\"')}"\`,
        { encoding: 'utf-8' }
      );
      return this.parseOutput(out);
    } catch (e) {
      return [];
    }
  }

  parseOutput(output) {
    const lines = output.trim().split('\\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(/\\s+/).filter(h => h);
    const rows = [];
    for (let i = 2; i < lines.length; i++) {
      const vals = lines[i].split(/\\s{2,}/).map(v => v.trim());
      const row = {};
      headers.forEach((h, idx) => row[h] = vals[idx] || null);
      rows.push(row);
    }
    return rows;
  }
}

const driver = new DBDriver(DB_PATH);

// --- Query Builder（链式查询构造器）---
class QueryBuilder {
  constructor(tableName, driver) {
    this.tableName = tableName;
    this.driver = driver;
    this._select = '*';
    this._where = [];
    this._orderBy = [];
    this._limitVal = null;
    this._offsetVal = null;
    this._joinClauses = [];
  }

  // 选择字段
  select(...fields) {
    this._select = fields.join(', ');
    return this;
  }

  // WHERE 条件
  where(field, operator, value) {
    if (value === undefined) {
      value = operator;
      operator = '=';
    }
    this._where.push({ field, operator, value, logic: 'AND' });
    return this;
  }

  whereIn(field, values) {
    const placeholders = values.map(() => '?').join(', ');
    this._where.push({ field, operator: 'IN', value: values, raw: \`\${field} IN (\${placeholders})\`, logic: 'AND' });
    return this;
  }

  whereGT(field, value) { return this.where(field, '>', value); }
  whereLT(field, value) { return this.where(field, '<', value); }
  whereGTE(field, value) { return this.where(field, '>=', value); }
  whereLTE(field, value) { return this.where(field, '<=', value); }

  // OR WHERE
  orWhere(field, operator, value) {
    if (value === undefined) {
      value = operator;
      operator = '=';
    }
    this._where.push({ field, operator, value, logic: 'OR' });
    return this;
  }

  // JOIN
  join(table, onClause) {
    this._joinClauses.push(\`JOIN \${table} ON \${onClause}\`);
    return this;
  }

  leftJoin(table, onClause) {
    this._joinClauses.push(\`LEFT JOIN \${table} ON \${onClause}\`);
    return this;
  }

  // 排序
  orderBy(field, direction = 'ASC') {
    this._orderBy.push(\`\${field} \${direction}\`);
    return this;
  }

  // 分页
  limit(n) { this._limitVal = n; return this; }
  offset(n) { this._offsetVal = n; return this; }

  // 构建 SELECT SQL
  toSQL() {
    let sql = \`SELECT \${this._select} FROM \${this.tableName}\`;
    
    if (this._joinClauses.length) {
      sql += ' ' + this._joinClauses.join(' ');
    }

    if (this._where.length) {
      sql += ' WHERE ';
      sql += this._where.map((w, i) => {
        const prefix = i === 0 ? '' : w.logic + ' ';
        if (w.raw) return prefix + w.raw;
        return \`\${prefix}\${w.field} \${w.operator} ?\`;
      }).join(' ');
    }

    if (this._orderBy.length) {
      sql += ' ORDER BY ' + this._orderBy.join(', ');
    }

    if (this._limitVal !== null) {
      sql += \` LIMIT \${this._limitVal}\`;
    }
    if (this._offsetVal !== null) {
      sql += \` OFFSET \${this._offsetVal}\`;
    }

    return sql;
  }

  // 获取参数
  getParams() {
    const params = [];
    this._where.forEach(w => {
      if (Array.isArray(w.value)) {
        params.push(...w.value);
      } else {
        params.push(w.value);
      }
    });
    return params;
  }

  // 执行查询
  get() {
    return this.driver.query(this.toSQL(), this.getParams());
  }

  first() {
    const results = this.limit(1).get();
    return results[0] || null;
  }

  // 聚合
  count() {
    this._select = 'COUNT(*) as cnt';
    const result = this.first();
    return result ? parseInt(result.cnt) : 0;
  }
}

// --- Model 定义（实体类，Data Mapper 风格）---
class Model {
  static tableName = '';
  static primaryKey = 'id';
  static fields = [];
  static timestamps = true;

  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  // 获取 Repository
  static get repository() {
    return new Repository(this, driver);
  }

  // 创建 QueryBuilder
  static query() {
    return new QueryBuilder(this.tableName, driver);
  }
}

// --- Repository 类（负责 CRUD 操作）---
class Repository {
  constructor(ModelClass, driver) {
    this.Model = ModelClass;
    this.driver = driver;
  }

  // 根据 ID 查找
  async findById(id) {
    const row = this.Model.query()
      .where(this.Model.primaryKey, id)
      .first();
    return row ? new this.Model(row) : null;
  }

  // 查找所有
  findAll() {
    const rows = this.Model.query().get();
    return rows.map(r => new this.Model(r));
  }

  // 条件查找（返回 QueryBuilder 以支持链式调用）
  findWhere() {
    return this.Model.query();
  }

  // 创建记录
  create(data) {
    const modelData = { ...data };
    if (this.Model.timestamps) {
      modelData.created_at = new Date().toISOString();
      modelData.updated_at = new Date().toISOString();
    }
    
    const fields = Object.keys(modelData);
    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map(f => modelData[f]);
    
    const sql = \`INSERT INTO \${this.Model.tableName} (\${fields.join(', ')}) VALUES (\${placeholders})\`;
    this.driver.exec(this.buildSQL(sql, values));
    
    // 获取最后插入的 ID（简化方式）
    const idResult = this.driver.query(\`SELECT last_insert_rowid() as id\`);
    const id = idResult[0]?.id;
    
    return this.findById(id);
  }

  // 更新记录
  update(id, data) {
    const modelData = { ...data };
    if (this.Model.timestamps) {
      modelData.updated_at = new Date().toISOString();
    }

    const setClauses = Object.keys(modelData).map(f => \`\${f} = ?\`).join(', ');
    const values = [...Object.values(modelData), id];
    const sql = \`UPDATE \${this.Model.tableName} SET \${setClauses} WHERE \${this.Model.primaryKey} = ?\`;
    this.driver.exec(this.buildSQL(sql, values));
    return this.findById(id);
  }

  // 删除记录
  delete(id) {
    const sql = \`DELETE FROM \${this.Model.tableName} WHERE \${this.Model.primaryKey} = ?\`;
    this.driver.exec(this.buildSQL(sql, [id]));
    return true;
  }

  // 构建安全 SQL
  buildSQL(sql, params = []) {
    let processed = sql;
    params.forEach(p => {
      const escaped = String(p).replace(/'/g, "''");
      processed = processed.replace('?', \`'\${escaped}'\`);
    });
    return processed;
  }

  // 建表
  createTable(schema) {
    this.driver.exec(schema);
  }
}

// --- 定义具体 Model ---
class User extends Model {
  static tableName = 'users';
  static fields = ['id', 'name', 'email', 'age', 'city', 'created_at', 'updated_at'];
  static timestamps = true;
}

class Post extends Model {
  static tableName = 'posts';
  static fields = ['id', 'user_id', 'title', 'content', 'published', 'created_at', 'updated_at'];
  static timestamps = true;
}

// --- 简单的 Migration 系统 ---
class Migration {
  constructor(driver) {
    this.driver = driver;
    this.migrations = [];
  }

  addMigration(name, up, down) {
    this.migrations.push({ name, up, down });
  }

  migrate() {
    // 建迁移记录表
    this.driver.exec(\`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    \`);

    const executed = new Set(
      this.driver.query('SELECT name FROM migrations').map(r => r.name)
    );

    for (const migration of this.migrations) {
      if (!executed.has(migration.name)) {
        console.log(\`执行迁移: \${migration.name}\`);
        migration.up(this.driver);
        this.driver.exec(
          \`INSERT INTO migrations (name) VALUES ('\${migration.name}')\`
        );
      }
    }
  }
}

// --- 演示开始 ---
console.log('=== ORM 概念与数据访问层演示 ===\\n');

// --- 1. Migration 建表 ---
console.log('--- 1. Migration 执行数据库迁移 ---');
const migration = new Migration(driver);

migration.addMigration(
  'create_users_table',
  (driver) => {
    driver.exec(\`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        age INTEGER,
        city TEXT,
        created_at DATETIME,
        updated_at DATETIME
      )
    \`);
  },
  (driver) => {
    driver.exec('DROP TABLE users');
  }
);

migration.addMigration(
  'create_posts_table',
  (driver) => {
    driver.exec(\`
      CREATE TABLE posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        published INTEGER DEFAULT 0,
        created_at DATETIME,
        updated_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    \`);
  },
  (driver) => {
    driver.exec('DROP TABLE posts');
  }
);

migration.migrate();
console.log('');

// --- 2. Repository 创建数据 ---
console.log('--- 2. 使用 Repository 创建用户 ---');
const userRepo = User.repository;
const postRepo = Post.repository;

const user1 = userRepo.create({
  name: '张三',
  email: 'zhangsan@orm.com',
  age: 25,
  city: '北京',
});
console.log('创建用户:', { id: user1.id, name: user1.name, email: user1.email });

const user2 = userRepo.create({
  name: '李四',
  email: 'lisi@orm.com',
  age: 30,
  city: '上海',
});

const user3 = userRepo.create({
  name: '王五',
  email: 'wangwu@orm.com',
  age: 28,
  city: '北京',
});
console.log('共创建 3 个用户\\n');

// 创建文章
postRepo.create({ user_id: user1.id, title: 'ORM 入门', content: '什么是 ORM...', published: 1 });
postRepo.create({ user_id: user1.id, title: 'Query Builder 详解', content: '链式调用...', published: 1 });
postRepo.create({ user_id: user2.id, title: '数据库设计原则', content: '范式...', published: 0 });

// --- 3. Query Builder 查询 ---
console.log('--- 3. Query Builder 条件查询 ---');
const beijingUsers = User.query()
  .select('id', 'name', 'age', 'city')
  .where('city', '北京')
  .orderBy('age', 'DESC')
  .get();
console.log('北京用户:');
console.table(beijingUsers);

// --- 4. 复杂条件查询 ---
console.log('--- 4. 年龄 > 25 或 城市=上海 ---');
const filteredUsers = User.query()
  .select('name', 'age', 'city')
  .whereGT('age', 25)
  .orWhere('city', '上海')
  .orderBy('age')
  .get();
console.table(filteredUsers);

// --- 5. JOIN 查询 ---
console.log('--- 5. JOIN 查询：用户和他们的文章 ---');
const userPosts = new QueryBuilder('users', driver)
  .select('users.name', 'posts.title', 'posts.published')
  .leftJoin('posts', 'users.id = posts.user_id')
  .orderBy('users.name')
  .get();
console.table(userPosts);

// --- 6. 更新记录 ---
console.log('\\n--- 6. Repository 更新用户 ---');
const updatedUser = userRepo.update(user1.id, { age: 26, city: '深圳' });
console.log('更新后的用户:', { id: updatedUser.id, name: updatedUser.name, age: updatedUser.age, city: updatedUser.city });

// --- 7. 统计 ---
console.log('\\n--- 7. 统计 ---');
console.log('用户总数:', User.query().count());
console.log('北京用户数:', User.query().where('city', '北京').count());
console.log('已发布文章数:', Post.query().where('published', 1).count());

// --- 8. 删除 ---
console.log('\\n--- 8. 删除 ID=3 的用户 ---');
userRepo.delete(user3.id);
console.log('删除后用户数:', User.query().count());

// --- 9. 分页 ---
console.log('\\n--- 9. 分页查询（每页2条，第1页）---');
// 插入更多用户用于演示分页
userRepo.create({ name: '赵六', email: 'zhaoliu@orm.com', age: 22, city: '广州' });
userRepo.create({ name: '钱七', email: 'qianqi@orm.com', age: 35, city: '杭州' });

const page1 = User.query()
  .select('name', 'age', 'city')
  .orderBy('id')
  .limit(2)
  .offset(0)
  .get();
console.log('第1页:');
console.table(page1);

const page2 = User.query()
  .select('name', 'age', 'city')
  .orderBy('id')
  .limit(2)
  .offset(2)
  .get();
console.log('第2页:');
console.table(page2);

console.log('\\n=== ORM 演示完成 ===');
console.log('实现了 Query Builder 链式调用、Repository 模式、Migration 迁移');
console.log('Node.js 生态主流 ORM: Sequelize（Active Record）、TypeORM（混合）、Prisma（现代化）');
`,
  },
  {
    id: "n4-sql-injection",
    group: "第五部分 数据库",
    icon: "🛡️",
    title: "SQL 注入防护与安全数据库操作",
    content: `# SQL 注入防护与安全数据库操作

## 一、什么是 SQL 注入

SQL 注入（SQL Injection）是一种代码注入技术，攻击者通过在应用程序的输入中插入恶意 SQL 代码，从而改变原本的 SQL 语义，执行非授权的数据库操作。

SQL 注入是 **最危险、最常见** 的 Web 安全漏洞之一，长期占据 OWASP Top 10。

### 1.1 经典 SQL 注入示例

假设登录验证的代码如下：

\`\`\`javascript
// ❌ 危险！直接拼接用户输入
const username = req.body.username;
const password = req.body.password;
const sql = \`SELECT * FROM users WHERE username = '\${username}' AND password = '\${password}'\`;
db.query(sql);
\`\`\`

如果攻击者输入：
- 用户名：\`' OR '1'='1\`
- 密码：\`' OR '1'='1\`

拼接后的 SQL 变成：
\`\`\`sql
SELECT * FROM users WHERE username = '' OR '1'='1' AND password = '' OR '1'='1'
\`\`\`

由于 \`'1'='1'\` 永远为真，这个查询会返回 users 表中的**所有用户**，攻击者无需密码就能登录！

### 1.2 SQL 注入的危害

| 危害 | 示例 |
|------|------|
| **绕过认证** | 无需密码登录任意账户，甚至管理员账户 |
| **窃取数据** | 获取所有用户数据、敏感信息（密码、身份证号、银行卡） |
| **篡改数据** | 修改、删除数据库中的数据 |
| **提权** | 获取数据库管理员权限 |
| **服务器控制** | 某些情况下可以执行系统命令（如 MySQL INTO OUTFILE 写 webshell） |
| **删除数据库** | DROP DATABASE / DROP TABLE 删库跑路 |

---

## 二、SQL 注入的常见类型

### 2.1 基于字符串的注入

最常见的类型，输入点在字符串引号内：

\`\`\`sql
-- 原始
SELECT * FROM products WHERE name = '用户输入'

-- 注入输入：' UNION SELECT username, password FROM users --
-- 结果：返回用户表的用户名和密码
SELECT * FROM products WHERE name = '' UNION SELECT username, password FROM users --'
\`\`\`

### 2.2 基于数字的注入

输入点是数字，没有引号包裹：

\`\`\`javascript
// ❌ 危险
const sql = \`SELECT * FROM posts WHERE id = \${req.query.id}\`;
// 输入：1 OR 1=1
// 结果：SELECT * FROM posts WHERE id = 1 OR 1=1 返回所有帖子
\`\`\`

### 2.3 盲注（Blind SQL Injection）

页面不直接显示查询结果，只能通过页面返回的真假（布尔盲注）或响应时间（时间盲注）来推断数据：

\`\`\`sql
-- 布尔盲注：通过页面是否正常返回判断条件真假
SELECT * FROM users WHERE id = 1 AND (SELECT SUBSTRING(password,1,1) FROM users WHERE id=1) = 'a'

-- 时间盲注：通过 SLEEP() 函数延迟判断
SELECT * FROM users WHERE id = 1 AND IF(1=1, SLEEP(5), 0)
\`\`\`

### 2.4 堆叠查询（Stacked Queries）

某些数据库支持分号分隔多条 SQL，可以执行任意语句：

\`\`\`sql
-- 输入：1; DELETE FROM users; --
-- 结果执行：
SELECT * FROM posts WHERE id = 1; DELETE FROM users; -- 删表！
\`\`\`

---

## 三、防护方案

### 3.1 参数化查询 / 预处理语句（最有效！）

**参数化查询是防御 SQL 注入的首要、最有效方法。**

原理：SQL 语句结构和数据分开传输，数据库将参数纯粹作为数据处理，不会解析为 SQL 代码。

\`\`\`javascript
// ✅ 正确：使用参数化查询
const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
db.query(sql, [username, password]);
// 或者命名参数
const sql = 'SELECT * FROM users WHERE username = :username AND password = :password';
db.query(sql, { username, password });
\`\`\`

**为什么有效？**
- SQL 语句模板在参数传入前就已经被数据库解析、编译
- 参数通过单独的协议发送，永远不会被当作 SQL 指令解析
- 无论参数里有什么特殊字符（单引号、分号、注释符等），都只是普通字符串

### 3.2 输入验证

对用户输入进行格式校验：
- 数字 ID 必须是数字（\`parseInt\` 或正则 \`/^\\d+$\`）
- 邮箱必须符合邮箱格式
- 枚举值必须在允许列表中

\`\`\`javascript
// 白名单验证排序字段
const allowedSortFields = ['created_at', 'name', 'age'];
const sortBy = allowedSortFields.includes(req.query.sort) ? req.query.sort : 'created_at';
\`\`\`

### 3.3 最小权限原则

- 应用程序使用的数据库账户**不要用 root / sa**
- 只给必要的权限：普通应用不需要 DROP、ALTER 权限
- 不同环境使用不同账户（开发/测试/生产）
- 禁止数据库用户访问系统文件

\`\`\`sql
-- 创建最小权限用户
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON myapp.* TO 'app_user'@'localhost';
-- 没有 DROP、ALTER、CREATE 权限，即使被注入也无法删表
\`\`\`

### 3.4 ORM / Query Builder

主流 ORM 默认使用参数化查询，自动防注入：

\`\`\`javascript
// Sequelize / TypeORM / Prisma 等自动参数化
const user = await User.findOne({ where: { username, password } });
// 内部生成的 SQL 是参数化的，无需手动处理
\`\`\`

**注意：** ORM 不是万能的！raw query（原生查询）仍然需要手动参数化。

### 3.5 其他防护措施

| 措施 | 说明 |
|------|------|
| **错误信息脱敏** | 生产环境不要返回详细的数据库错误信息（会泄露表结构） |
| **WAF（Web 应用防火墙）** | 部署 WAF 拦截常见注入特征 |
| **定期安全审计** | 代码审查、渗透测试、SQL 漏洞扫描 |
| **密码哈希存储** | 即使被拖库，密码也是哈希值（bcrypt/argon2） |

---

## 四、NoSQL 注入

不仅 SQL 数据库，MongoDB 等 NoSQL 也有注入风险！

### 4.1 MongoDB 注入示例

\`\`\`javascript
// ❌ 危险：直接将用户输入传入查询
db.users.find({ username: req.body.username, password: req.body.password });

// 如果攻击者输入：
// { "username": { "$ne": null }, "password": { "$ne": null } }
// $ne 是 MongoDB 运算符，"not equal"，条件永远成立
// 等价于 SQL 注入的 ' OR 1=1
\`\`\`

### 4.2 MongoDB 注入防护

\`\`\`javascript
// ✅ 正确：确保输入是预期类型
const username = String(req.body.username);
const password = String(req.body.password);
db.users.find({ username, password });

// 或者使用 schema 验证库（Joi、Zod）校验输入类型
\`\`\`
`,
    code: `// ============================================
// SQL 注入演示与防护
// 展示漏洞原理和正确的防护方式
// ============================================

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'demo_sqli.db');
if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

// --- 数据库工具 ---
class VulnerableDB {
  constructor(dbPath) {
    this.dbPath = dbPath;
  }

  exec(sql) {
    try {
      execSync(\`sqlite3 '\${this.dbPath}' "\${sql.replace(/"/g, '\\\\"')}"\`);
    } catch (e) {
      // 静默处理
    }
  }

  // ❌ 危险的查询方法（直接拼接 SQL）
  unsafeQuery(sql) {
    try {
      const out = execSync(
        \`sqlite3 -header -column '\${this.dbPath}' "\${sql.replace(/"/g, '\\\\"')}"\`,
        { encoding: 'utf-8' }
      );
      return this.parseResult(out);
    } catch (e) {
      return [];
    }
  }

  // ✅ 安全的查询方法（参数化查询）
  safeQuery(sql, params = []) {
    let processedSQL = sql;
    params.forEach(param => {
      // 关键：正确转义参数中的单引号
      const escaped = String(param).replace(/'/g, "''");
      processedSQL = processedSQL.replace('?', \`'\${escaped}'\`);
    });
    return this.unsafeQuery(processedSQL);
  }

  parseResult(output) {
    const lines = output.trim().split('\\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(/\\s+/).filter(h => h);
    const rows = [];
    for (let i = 2; i < lines.length; i++) {
      const vals = lines[i].split(/\\s{2,}/).map(v => v.trim());
      const row = {};
      headers.forEach((h, idx) => row[h] = vals[idx] || null);
      rows.push(row);
    }
    return rows;
  }
}

const db = new VulnerableDB(DB_PATH);

// --- 创建测试表和数据 ---
console.log('=== SQL 注入演示与防护 ===\\n');

console.log('--- 初始化测试数据 ---');
db.exec(\`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'user',
    balance REAL DEFAULT 0
  )
\`);

// 插入测试用户（密码应该哈希存储，这里是演示）
const testUsers = [
  ["admin", "admin_secret_123", "admin@example.com", "admin", 10000],
  ["zhangsan", "zs_password", "zhangsan@example.com", "user", 500],
  ["lisi", "ls_password", "lisi@example.com", "user", 300],
  ["wangwu", "ww_password", "wangwu@example.com", "user", 1200],
];
testUsers.forEach(([username, password, email, role, balance]) => {
  db.exec(
    \`INSERT INTO users (username, password, email, role, balance) VALUES ('\${username}', '\${password}', '\${email}', '\${role}', \${balance})\`
  );
});
console.log(\`创建 \${testUsers.length} 个测试用户\\n\`);

// --- 模拟登录功能 ---
console.log('========================================');
console.log('--- 1. 正常登录流程 ---');
console.log('========================================\\n');

// ❌ 漏洞版本的登录验证
function vulnerableLogin(username, password) {
  const sql = \`SELECT * FROM users WHERE username = '\${username}' AND password = '\${password}'\`;
  console.log('执行 SQL:', sql);
  const result = db.unsafeQuery(sql);
  return result.length > 0 ? result[0] : null;
}

// ✅ 安全版本的登录验证
function safeLogin(username, password) {
  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  const result = db.safeQuery(sql, [username, password]);
  return result.length > 0 ? result[0] : null;
}

// 正常登录
console.log('使用正确密码登录 zhangsan:');
let user = vulnerableLogin('zhangsan', 'zs_password');
console.log('登录结果:', user ? \`成功！欢迎 \${user.username} (角色: \${user.role})\` : '失败');
console.log('');

// --- SQL 注入攻击演示 ---
console.log('========================================');
console.log('--- 2. SQL 注入攻击演示 ---');
console.log('========================================\\n');

// 攻击 1：绕过登录（经典 ' OR '1'='1）
console.log('【攻击1】使用注入绕过登录认证:');
console.log('输入用户名: \\' OR 1=1 --');
console.log('输入密码: 任意内容');
console.log('');

const maliciousUsername = "' OR 1=1 --";
const maliciousPassword = 'anything';
user = vulnerableLogin(maliciousUsername, maliciousPassword);
console.log('\\n⚠️  攻击结果:', user ? \`登录成功！返回了第一个用户: \${user.username} (角色: \${user.role})\` : '失败');
console.log('这是因为 -- 是 SQL 注释符，后面的密码检查被注释掉了！');
console.log('');

// 攻击 2：使用 UNION 获取其他表数据
console.log('【攻击2】使用 UNION 注入提取管理员密码:');
const unionUsername = "' UNION SELECT 1, username, password, email, role, balance FROM users WHERE role='admin' --";
const attackResult = db.unsafeQuery(
  \`SELECT * FROM users WHERE username = '\${unionUsername}' AND password = 'x'\`
);
console.log('注入后返回:');
attackResult.forEach(u => {
  if (u.role === 'admin') {
    console.log(\`  ⚠️  获取到管理员账号! 用户名: \${u.username}, 密码: \${u.password}\`);
  }
});
console.log('');

// 攻击 3：堆叠查询（删表/篡改数据）
console.log('【攻击3】篡改其他用户数据（演示，实际环境真的会执行）:');
console.log('假设存在一个修改个人信息的功能，拼接了输入:');
// 实际攻击可能是: "lisi'; UPDATE users SET balance=99999 WHERE username='lisi'; --"
// sqlite3 CLI 默认不支持堆叠执行多条语句，但很多数据库支持
const updateSQL = "UPDATE users SET balance = 500 WHERE username = 'lisi'";
console.log('篡改后李四的余额:', db.unsafeQuery('SELECT balance FROM users WHERE username = ?', ['lisi']));
console.log('');

// --- 防护方案演示 ---
console.log('========================================');
console.log('--- 3. 使用参数化查询防御 ---');
console.log('========================================\\n');

console.log('对同样的恶意输入，使用安全（参数化）查询:');
console.log('用户名:', maliciousUsername);
user = safeLogin(maliciousUsername, maliciousPassword);
console.log('\\n✅ 安全查询结果:', user ? '登录成功（不应该出现！）' : '登录失败，注入被阻止！');
console.log('这是因为单引号被正确转义，整个输入被当作普通字符串处理');
console.log('');

// 展示参数化如何转义
console.log('参数化查询时，单引号被转义为两个单引号:');
const escapedInput = maliciousUsername.replace(/'/g, "''");
console.log(\`原输入: \${maliciousUsername}\`);
console.log(\`转义后: \${escapedInput}\`);
console.log('数据库看到的是一个完整的字符串，而不是 SQL 代码');
console.log('');

// --- 更多防护措施 ---
console.log('========================================');
console.log('--- 4. 输入验证与白名单 ---');
console.log('========================================\\n');

// 白名单验证排序字段（ORDER BY 注入）
function getUserList(sortBy = 'id', order = 'ASC') {
  const allowedFields = ['id', 'username', 'email', 'balance'];
  const allowedOrders = ['ASC', 'DESC'];
  
  // 白名单验证！即使参数化也无法处理 ORDER BY 后的字段名
  const safeSortBy = allowedFields.includes(sortBy) ? sortBy : 'id';
  const safeOrder = allowedOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';
  
  const sql = \`SELECT id, username, email, balance FROM users ORDER BY \${safeSortBy} \${safeOrder}\`;
  return db.unsafeQuery(sql);
}

console.log('白名单验证排序字段:');
console.log('合法排序字段:', getUserList('balance', 'DESC').map(u => ({ username: u.username, balance: u.balance })));

// 尝试注入 ORDER BY 子句
const maliciousSort = "id; DROP TABLE users; --";
console.log('\\n尝试恶意排序字段注入:', maliciousSort);
const safeResult = getUserList(maliciousSort, 'ASC');
console.log('✅ 白名单拦截，使用默认排序，安全！');
console.log('');

// --- 数字类型验证 ---
console.log('--- 5. 数字类型验证 ---');
function getUserById(id) {
  // 数字必须先转换为整数类型
  const numId = parseInt(id, 10);
  if (isNaN(numId) || numId <= 0) {
    return null;
  }
  return db.safeQuery('SELECT id, username, email, role FROM users WHERE id = ?', [numId]);
}

console.log('正常查询 ID=2:', getUserById(2));
console.log('注入输入 ID="1 OR 1=1":', getUserById('1 OR 1=1'));
console.log('✅ parseInt 后变成 1，只查询 ID=1，注入失败');
console.log('');

// --- 模拟最小权限原则 ---
console.log('========================================');
console.log('--- 6. 最小权限原则演示 ---');
console.log('========================================\\n');

console.log('生产环境数据库权限配置建议:');
console.log('  ❌ 不要使用 root/sa 连接应用');
console.log('  ✅ 创建专用应用账户');
console.log('  ✅ 只授予 SELECT/INSERT/UPDATE/DELETE');
console.log('  ✅ 禁止 DROP/ALTER/CREATE 等 DDL 权限');
console.log('  ✅ 禁止访问系统表');
console.log('  ✅ 禁止 FILE 权限（防止写文件）');
console.log('');

// 显示：即使被注入，没有 DROP 权限也无法删表
console.log('示例：如果应用用户没有 DROP 权限，即使注入也无法删表');
console.log('GRANT SELECT, INSERT, UPDATE, DELETE ON myapp.* TO \\'appuser\\'@\\'localhost\\';');

// --- NoSQL 注入演示 ---
console.log('\\n========================================');
console.log('--- 7. NoSQL 注入示例（MongoDB）---');
console.log('========================================\\n');

// 模拟 MongoDB 风格的查询
function simulateMongoQuery(query) {
  // 模拟一个简单的文档集合
  const users = [
    { _id: 1, username: 'admin', password: 'admin123', role: 'admin' },
    { _id: 2, username: 'user1', password: 'pass1', role: 'user' },
  ];
  
  // 模拟查询（不安全的方式：直接使用用户输入作为查询条件）
  return users.filter(u => {
    for (const [key, value] of Object.entries(query)) {
      // 如果 value 是对象（包含运算符），执行比较
      if (value && typeof value === 'object') {
        if (value.$ne !== undefined && u[key] === value.$ne) return false;
        if (value.$ne !== undefined && u[key] !== value.$ne) return true;
      } else {
        if (u[key] !== value) return false;
      }
    }
    return true;
  });
}

console.log('MongoDB 注入演示:');
console.log('正常查询:', simulateMongoQuery({ username: 'admin', password: 'admin123' }).length, '条结果');

// NoSQL 注入：使用 $ne 运算符
const nosqlInjection = { username: { $ne: null }, password: { $ne: null } };
console.log('注入查询:', nosqlInjection);
const injectedResult = simulateMongoQuery(nosqlInjection);
console.log('⚠️  注入结果:', injectedResult.length, '条记录（返回所有用户！）');
console.log('');
console.log('✅ 防护：确保输入类型正确，使用 schema 验证');
console.log('  const username = String(req.body.username);');
console.log('  const safeQuery = { username, password: String(password) };');
console.log('  这样 $ne 运算符就不会被传入了');

console.log('\\n=== SQL 注入防护演示总结 ===');
console.log('');
console.log('🛡️  防护要点：');
console.log('  1. 永远、永远、永远使用参数化查询（最重要！）');
console.log('  2. 不要直接拼接 SQL 字符串，尤其是用户输入');
console.log('  3. 使用 ORM/Query Builder 减少手写 SQL');
console.log('  4. 对输入进行验证（类型、白名单）');
console.log('  5. 使用最小权限数据库账户');
console.log('  6. 生产环境关闭详细错误信息');
console.log('  7. NoSQL 数据库同样有注入风险，注意类型检查');
`,
  },
  {
    id: "n4-env-config",
    group: "第六部分 工程化",
    icon: "⚙️",
    title: "环境变量与配置管理",
    content: `# 环境变量与配置管理

## 一、12-Factor App 配置原则

12-Factor App 是构建 SaaS 应用的方法论，其中关于配置（Config）的原则是：

> **配置存储在环境变量中，严格分离代码和配置。**

### 1.1 为什么要分离配置？

- **不同环境配置不同**：数据库地址、Redis 地址、API 密钥在开发/测试/生产环境各不相同
- **敏感信息不能硬编码**：数据库密码、API Key、密钥不能提交到代码仓库
- **配置可以随时变更**：改配置不需要重新构建代码、重新部署

### 1.2 什么应该放在环境变量中？

| 配置类型 | 示例 |
|---------|------|
| 数据库连接信息 | 主机、端口、用户名、密码、库名 |
| 外部服务地址 | Redis URL、消息队列地址、第三方 API 端点 |
| 密钥与凭证 | JWT_SECRET、API_KEY、加密密钥 |
| 运行环境标识 | NODE_ENV=development/production/test |
| 功能开关 | FEATURE_FLAGS、是否启用某项功能 |
| 端口、日志级别 | PORT、LOG_LEVEL |

**什么不应该放在环境变量中：**
- 代码本身
- 不随环境变化的常量
- 可以硬编码的非敏感配置

---

## 二、process.env 详解

Node.js 提供了 \`process.env\` 对象，包含当前 shell 的所有环境变量。

### 2.1 基本用法

\`\`\`javascript
// 读取环境变量
console.log(process.env.NODE_ENV);  // 'development'
console.log(process.env.PATH);      // 系统 PATH

// 设置环境变量（仅对当前进程有效）
process.env.MY_VAR = 'hello';

// 删除环境变量
delete process.env.MY_VAR;
\`\`\`

**重要特性：**
- \`process.env\` 中所有值都是**字符串类型**，即使设置为数字也会转成字符串
- 对 \`process.env\` 的修改只影响**当前进程和子进程**，不会影响系统环境变量
- 环境变量是在进程启动时从父进程继承的

### 2.2 在启动时传入环境变量

\`\`\`bash
# macOS/Linux
NODE_ENV=production PORT=8080 node app.js

# Windows (cmd)
set NODE_ENV=production && node app.js

# Windows (PowerShell)
$env:NODE_ENV="production"; node app.js
\`\`\`

---

## 三、.env 文件与 dotenv 原理

直接在命令行设置环境变量不便于管理大量配置。社区通用做法是使用 \`.env\` 文件存储配置，配合 \`dotenv\` 这个 npm 包加载。我们从零实现它的原理。

### 3.1 .env 文件格式

\`\`\`
# .env 文件示例
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=secret123
JWT_SECRET=my-super-secret-key
REDIS_URL=redis://localhost:6379

# 带空格和引号的值
APP_NAME=我的 Node 应用
DESCRIPTION="这是一个描述，可以包含空格"
WITH_QUOTES='single quotes also work'

# 注释用 # 开头
EMPTY_VALUE=
\`\`\`

### 3.2 解析规则

dotenv 的解析规则：
- \`KEY=VALUE\` 格式，每行一个键值对
- \`#\` 开头的行是注释
- 值可以用单引号或双引号包裹（值本身不包含引号）
- 空值也是合法的（空字符串）
- 支持 \`export \` 前缀（兼容 bash 的 export 语法）

---

## 四、NODE_ENV 与环境区分

\`NODE_ENV\` 是一个广泛使用的约定：

| 值 | 用途 | 典型行为 |
|----|------|---------|
| \`development\` | 开发环境 | 详细错误信息、热重载、调试日志 |
| \`test\` | 测试环境 | 连接测试数据库、日志精简 |
| \`production\` | 生产环境 | 代码压缩、缓存启用、错误堆栈隐藏 |

\`\`\`javascript
const isDev = process.env.NODE_ENV !== 'production';
const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

if (isDev) {
  console.log('开发模式：启用调试日志');
}
\`\`\`

---

## 五、配置层级与覆盖

配置应该有一个分层优先级（高优先级覆盖低优先级）：

1. **默认值**（代码中硬编码的默认配置）
2. **.env 文件**（项目级配置）
3. **系统环境变量**（部署环境设置的变量）
4. **命令行参数**（启动时传入的参数）

\`\`\`javascript
const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  // 优先级：NODE_ENV > 默认值 'development'
  env: process.env.NODE_ENV || 'development',
};
\`\`\`

---

## 六、配置验证

配置加载后应该验证：
- **必填项检查**：缺少关键配置直接启动失败
- **类型转换**：端口需要转数字，布尔值需要解析
- **格式验证**：URL、邮箱等格式检查

\`\`\`javascript
// 验证必填配置
const required = ['DB_HOST', 'DB_USER', 'JWT_SECRET'];
const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
  throw new Error('缺少必需的环境变量: ' + missing.join(', '));
}
\`\`\`

---

## 七、.gitignore 与安全

**永远不要把 \`.env\` 文件提交到 Git！**

\`\`\`
# .gitignore 文件
.env
.env.local
.env.*.local
node_modules/
\`\`\`

最佳实践：
- 提交 \`.env.example\` 作为模板（不含真实密钥）
- 真实密钥通过安全方式传递（CI/CD Secret、Vault 等）
- 不同环境使用不同的 .env 文件（\`.env.development\`, \`.env.production\`）
`,
    code: `// ============================================
// 环境变量与配置管理演示
// 从零实现 dotenv 解析器、配置验证
// ============================================

const fs = require('fs');
const path = require('path');

// --- 1. 从零实现 dotenv 解析器 ---
function parseEnvFile(content) {
  const result = {};
  const lines = content.split('\\n');

  for (let line of lines) {
    // 去除首尾空白
    line = line.trim();

    // 跳过空行和注释
    if (!line || line.startsWith('#')) continue;

    // 支持 export KEY=VALUE 语法
    if (line.startsWith('export ')) {
      line = line.substring(7);
    }

    // 查找第一个 = 的位置
    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;

    let key = line.substring(0, eqIndex).trim();
    let value = line.substring(eqIndex + 1).trim();

    // 去除引号包裹
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (key) {
      result[key] = value;
    }
  }

  return result;
}

// 加载 .env 文件到 process.env
function config(options = {}) {
  const envPath = options.path || path.join(process.cwd(), '.env');
  const override = options.override || false;

  try {
    const content = fs.readFileSync(envPath, 'utf-8');
    const parsed = parseEnvFile(content);

    for (const [key, value] of Object.entries(parsed)) {
      // 默认不覆盖已存在的环境变量
      if (override || process.env[key] === undefined) {
        process.env[key] = value;
      }
    }

    return { parsed };
  } catch (err) {
    if (options.silent) {
      return { error: err };
    }
    // 找不到 .env 文件不报错（开发环境可选）
    if (err.code !== 'ENOENT') {
      console.warn('加载 .env 文件警告:', err.message);
    }
    return { error: err };
  }
}

// --- 2. 配置验证器 ---
function validateConfig(schema, config) {
  const errors = [];
  const result = {};

  for (const [key, rules] of Object.entries(schema)) {
    let value = config[key];

    // 检查必填
    if (rules.required && (value === undefined || value === '')) {
      errors.push(\`缺少必需的配置: \${key}\`);
      continue;
    }

    // 默认值
    if (value === undefined && rules.default !== undefined) {
      value = rules.default;
    }

    if (value !== undefined) {
      // 类型转换
      if (rules.type === 'number') {
        const num = Number(value);
        if (isNaN(num)) {
          errors.push(\`配置 \${key} 必须是数字，实际值: \${value}\`);
          continue;
        }
        value = num;
      } else if (rules.type === 'boolean') {
        value = value === 'true' || value === '1' || value === true;
      } else if (rules.type === 'array') {
        value = String(value).split(',').map(s => s.trim());
      }

      // 枚举验证
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(\`配置 \${key} 必须是 [\${rules.enum.join(', ')}] 之一，实际值: \${value}\`);
        continue;
      }

      // 自定义验证
      if (rules.validate && !rules.validate(value)) {
        errors.push(\`配置 \${key} 验证失败: \${rules.message || '无效值'}\`);
        continue;
      }
    }

    result[key] = value;
  }

  return {
    success: errors.length === 0,
    errors,
    config: result,
  };
}

// --- 3. 演示 ---
console.log('=== 环境变量与配置管理演示 ===\\n');

// 创建临时 .env 文件用于演示
const demoEnvPath = path.join(__dirname, '.env.demo');
const envContent = \`# 这是一个演示 .env 文件
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=myapp_user
DB_PASS=super_secret_password_123
JWT_SECRET=my-jwt-secret-key-for-signing-tokens
REDIS_URL=redis://localhost:6379
LOG_LEVEL=debug
ENABLE_CACHE=true
CORS_ORIGINS=http://localhost:3000,https://myapp.com
\`;
fs.writeFileSync(demoEnvPath, envContent);
console.log('创建演示 .env 文件\\n');

// 加载配置
console.log('--- 1. 解析 .env 文件 ---');
const { parsed } = config({ path: demoEnvPath, override: true });
console.log('解析到的配置项:', Object.keys(parsed).length, '个');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT, '(类型:', typeof process.env.PORT, ')');
console.log('');

// --- 2. 配置 schema 验证 ---
console.log('--- 2. 配置验证与类型转换 ---');
const configSchema = {
  NODE_ENV: {
    required: true,
    enum: ['development', 'test', 'production'],
    default: 'development',
  },
  PORT: {
    required: true,
    type: 'number',
    default: 3000,
    validate: v => v >= 1 && v <= 65535,
    message: '端口必须在 1-65535 之间',
  },
  DB_HOST: { required: true },
  DB_PORT: { type: 'number', default: 5432 },
  DB_USER: { required: true },
  DB_PASS: { required: true },
  JWT_SECRET: {
    required: true,
    validate: v => v.length >= 16,
    message: 'JWT_SECRET 至少 16 位',
  },
  LOG_LEVEL: {
    type: 'string',
    enum: ['debug', 'info', 'warn', 'error'],
    default: 'info',
  },
  ENABLE_CACHE: { type: 'boolean', default: false },
  CORS_ORIGINS: { type: 'array', default: ['*'] },
  MISSING_OPTIONAL: { type: 'string', default: 'default_value' },
};

const validation = validateConfig(configSchema, process.env);
if (validation.success) {
  console.log('✅ 配置验证通过！');
  console.log('\\n验证后的配置（已做类型转换）:');
  const cfg = validation.config;
  console.log('  NODE_ENV:', cfg.NODE_ENV, '(' + typeof cfg.NODE_ENV + ')');
  console.log('  PORT:', cfg.PORT, '(' + typeof cfg.PORT + ')');
  console.log('  DB_HOST:', cfg.DB_HOST);
  console.log('  ENABLE_CACHE:', cfg.ENABLE_CACHE, '(' + typeof cfg.ENABLE_CACHE + ')');
  console.log('  CORS_ORIGINS:', cfg.CORS_ORIGINS, '(array length:', cfg.CORS_ORIGINS.length + ')');
} else {
  console.log('❌ 配置验证失败:');
  validation.errors.forEach(e => console.log('  -', e));
}
console.log('');

// --- 3. 测试配置错误场景 ---
console.log('--- 3. 错误配置验证演示 ---');
const badConfig = {
  PORT: 'not-a-number',
  NODE_ENV: 'staging',
  JWT_SECRET: 'short',
};
const badValidation = validateConfig(configSchema, badConfig);
console.log('错误配置验证结果:', badValidation.success ? '通过' : '失败');
badValidation.errors.forEach(e => console.log('  ❌', e));
console.log('');

// --- 4. 环境特定配置 ---
console.log('--- 4. 环境特定配置示例 ---');
function getConfig() {
  // 先加载基础配置
  const base = {
    appName: '我的 Node 应用',
    port: parseInt(process.env.PORT || '3000', 10),
  };

  // 根据 NODE_ENV 加载不同配置
  const envConfigs = {
    development: {
      dbHost: 'localhost',
      logLevel: 'debug',
      enableDebug: true,
      cacheTTL: 0,
    },
    test: {
      dbHost: 'localhost',
      dbName: 'myapp_test',
      logLevel: 'error',
      enableDebug: false,
      cacheTTL: 0,
    },
    production: {
      dbHost: process.env.DB_HOST || 'db.production.internal',
      logLevel: 'warn',
      enableDebug: false,
      cacheTTL: 3600,
    },
  };

  const env = process.env.NODE_ENV || 'development';
  return { ...base, ...envConfigs[env], env };
}

// 测试不同环境
['development', 'test', 'production'].forEach(env => {
  process.env.NODE_ENV = env;
  const cfg = getConfig();
  console.log(\`  [\${env}] logLevel=\${cfg.logLevel}, debug=\${cfg.enableDebug}, cacheTTL=\${cfg.cacheTTL}s\`);
});
console.log('');

// --- 5. 显示系统环境变量 ---
console.log('--- 5. 系统环境变量示例 ---');
console.log('PATH (前100字符):', (process.env.PATH || '').substring(0, 100) + '...');
console.log('HOME:', process.env.HOME || process.env.USERPROFILE);
console.log('LANG:', process.env.LANG);

// 清理演示文件
fs.unlinkSync(demoEnvPath);

console.log('\\n=== 环境变量配置管理演示完成 ===');
console.log('\\n💡 最佳实践：');
console.log('  1. 使用 .env 文件管理本地开发配置');
console.log('  2. .env 文件加入 .gitignore，不要提交密钥');
console.log('  3. 提供 .env.example 模板给团队成员');
console.log('  4. 生产环境通过 CI/CD 或云服务注入环境变量');
console.log('  5. 启动时验证配置，缺少关键配置快速失败');
console.log('  6. 实际项目可使用 zod/joi 等库做复杂配置验证');
`,
  },
  {
    id: "n4-lint-format",
    group: "第六部分 工程化",
    icon: "📏",
    title: "代码规范：ESLint 与 Prettier 原理",
    content: `# 代码规范：ESLint 与 Prettier 原理

## 一、为什么需要代码规范

在团队协作中，代码规范至关重要：

| 问题 | 规范的作用 |
|------|----------|
| 代码风格不统一（有人加分号、有人不加） | 统一风格，代码像一个人写的 |
| 低级错误反复出现（未定义变量、忘记 break） | 提前发现潜在 Bug |
| 代码评审纠结格式问题 | 工具自动格式化，评审关注逻辑 |
| 新人上手慢 | 明确的规范降低学习成本 |
| 代码质量参差不齐 | 强制最佳实践 |

### 1.1 代码规范的两个方面

- **代码质量规则（ESLint）**：发现潜在错误和坏味道
  - 不能使用未定义变量
  - 不能有不可达代码
  - 不能声明未使用的变量
  - 禁止使用 \`eval\`、\`with\` 等危险特性
  - 强制使用 \`=== \` 而不是 \`==\`

- **代码格式规则（Prettier）**：统一代码排版风格
  - 缩进：2空格还是4空格
  - 分号：加还是不加
  - 单引号还是双引号
  - 行宽：80字符还是100字符
  - 尾逗号：要不要加

---

## 二、AST（抽象语法树）基础

无论是 ESLint 还是 Prettier，核心都是基于 **AST（Abstract Syntax Tree）** 工作。

### 2.1 什么是 AST？

AST 是源代码的树形结构表示。当 JavaScript 引擎执行代码时：

\`\`\`
源代码 → 词法分析（Tokenizer）→ Token 流 → 语法分析（Parser）→ AST → 解释/编译执行
\`\`\`

例如代码：\`const a = 1 + 2;\`

解析后大致生成这样的 AST（简化版）：

\`\`\`
Program
 └─ VariableDeclaration (const)
     └─ VariableDeclarator
         ├─ id: Identifier (a)
         └─ init: BinaryExpression (+)
             ├─ left: Literal (1)
             └─ right: Literal (2)
\`\`\`

### 2.2 常见 AST 节点类型

| 节点类型 | 说明 |
|---------|------|
| **Program** | 整个程序根节点 |
| **VariableDeclaration** | 变量声明（var/let/const） |
| **FunctionDeclaration** | 函数声明 |
| **ArrowFunctionExpression** | 箭头函数 |
| **CallExpression** | 函数调用 |
| **MemberExpression** | 属性访问（obj.prop） |
| **IfStatement** | if 语句 |
| **ForStatement** | for 循环 |
| **BinaryExpression** | 二元运算（a + b） |
| **Identifier** | 标识符（变量名、属性名） |
| **Literal** | 字面量（数字、字符串、布尔） |

可以使用 [AST Explorer](https://astexplorer.net/) 在线查看任何代码的 AST 结构。

---

## 三、ESLint 工作原理

ESLint 是一个插件化的 JavaScript/TypeScript 代码检查工具。

### 3.1 ESLint 的工作流程

1. **解析（Parse）**：将源码解析为 AST（使用 Espree、@typescript-eslint/parser 等）
2. **遍历（Traverse）**：深度优先遍历 AST 的每个节点
3. **规则检查（Rules）**：在遍历到对应节点时触发规则，报告问题
4. **修复（Fix）**：如果规则支持自动修复，生成修复后的代码

### 3.2 ESLint 规则的本质

一个 ESLint 规则就是一个对象，定义了在访问某些 AST 节点时要做的检查：

\`\`\`javascript
// ESLint 规则示例：禁止 console.log
module.exports = {
  create(context) {
    return {
      // 当遍历到 CallExpression 节点（函数调用）时执行
      CallExpression(node) {
        // 检查是不是 console.log()
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'console' &&
          node.callee.property.name === 'log'
        ) {
          context.report({
            node,
            message: 'Unexpected console.log statement'
          });
        }
      }
    };
  }
};
\`\`\`

### 3.3 ESLint 配置文件

\`\`\`javascript
// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'no-console': 'warn',           // console.log 警告
    'no-unused-vars': 'error',      // 未使用变量报错
    'eqeqeq': ['error', 'always'],  // 必须使用 ===
    'indent': ['error', 2],         // 缩进 2 空格
    'quotes': ['error', 'single'],  // 使用单引号
  },
};
\`\`\`

规则错误级别：\`"off"\` 或 0（关闭）、\`"warn"\` 或 1（警告）、\`"error"\` 或 2（错误）。

---

## 四、Prettier 工作原理

Prettier 是一个"有态度"的代码格式化工具，几乎不给配置选项。

### 4.1 Prettier 的核心理念

- **格式化应该完全自动化**：保存时自动格式化，不用争论风格
- **极少配置选项**：只有 printWidth、tabWidth、semi、singleQuote 等少数选项
- **忽略原始格式**：先把代码解析为 AST，再按照统一规则重新打印

### 4.2 Prettier 工作流程

1. 解析代码为 AST
2. 根据 AST 重新按照固定格式输出代码
3. 原有的空格、换行、缩进等格式完全被忽略

这就是为什么 Prettier 能做到一致的格式化——它根本就不看你原来怎么排的。

### 4.3 Prettier 配置

\`\`\`json
// .prettierrc
{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always"
}
\`\`\`

---

## 五、ESLint vs Prettier 分工

| 工具 | 职责 | 例子 |
|------|------|------|
| **ESLint** | 代码质量问题 + 部分格式 | 未使用变量、隐式全局变量、危险写法 |
| **Prettier** | 纯代码格式 | 缩进、换行、引号、分号、空格 |

通常两者配合使用：用 \`eslint-config-prettier\` 关闭 ESLint 中与 Prettier 冲突的格式规则，让 Prettier 专门负责格式化。

---

## 六、编辑器集成与 Git Hooks

### 6.1 编辑器集成

- VS Code 安装 ESLint、Prettier 插件
- 开启 "Format on Save"，保存时自动格式化
- 安装 Error Lens 插件，直接在代码行内显示错误

### 6.2 Git Hooks（Husky + lint-staged）

在提交代码前自动检查和格式化：

\`\`\`bash
# 提交前自动执行
npx husky add .husky/pre-commit "npx lint-staged"
\`\`\`

\`\`\`json
// package.json
{
  "lint-staged": {
    "*.js": ["eslint --fix", "prettier --write"]
  }
}
\`\`\`

这样可以保证进入仓库的代码都是符合规范的。
`,
    code: `// ============================================
// ESLint 原理演示
// 实现一个简单的 AST-based JavaScript Linter
// ============================================

const fs = require('fs');
const path = require('path');

// --- 简易 JavaScript 词法分析器（Tokenizer）---
// 将源代码拆分为 Token 流
function tokenize(source) {
  const tokens = [];
  let i = 0;
  const len = source.length;

  while (i < len) {
    let ch = source[i];

    // 跳过空白
    if (/\\s/.test(ch)) { i++; continue; }

    // 跳过单行注释
    if (ch === '/' && source[i + 1] === '/') {
      while (i < len && source[i] !== '\\n') i++;
      continue;
    }

    // 跳过多行注释
    if (ch === '/' && source[i + 1] === '*') {
      i += 2;
      while (i < len - 1 && !(source[i] === '*' && source[i + 1] === '/')) i++;
      i += 2;
      continue;
    }

    // 字符串（单引号/双引号/反引号）
    if (ch === '"' || ch === "'" || ch === '\`') {
      const quote = ch;
      const start = i;
      i++;
      while (i < len && source[i] !== quote) {
        if (source[i] === '\\\\') i++; // 转义
        i++;
      }
      i++;
      tokens.push({ type: 'String', value: source.substring(start, i), start });
      continue;
    }

    // 数字
    if (/[0-9]/.test(ch)) {
      const start = i;
      while (i < len && /[0-9.]/.test(source[i])) i++;
      tokens.push({ type: 'Number', value: source.substring(start, i), start });
      continue;
    }

    // 标识符和关键字
    if (/[a-zA-Z_$]/.test(ch)) {
      const start = i;
      while (i < len && /[a-zA-Z0-9_$]/.test(source[i])) i++;
      const word = source.substring(start, i);
      const keywords = ['var', 'let', 'const', 'function', 'return', 'if', 'else',
        'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'new',
        'typeof', 'instanceof', 'true', 'false', 'null', 'undefined', 'this',
        'class', 'extends', 'import', 'export', 'default', 'from', 'async',
        'await', 'try', 'catch', 'finally', 'throw', 'in', 'of', 'delete', 'void'];
      tokens.push({
        type: keywords.includes(word) ? 'Keyword' : 'Identifier',
        value: word,
        start,
      });
      continue;
    }

    // 运算符和分隔符
    const multiOps = ['===', '!==', '==', '!=', '>=', '<=', '=>', '&&', '||', '++', '--', '+=', '-=', '*=', '/='];
    let matched = false;
    for (const op of multiOps) {
      if (source.startsWith(op, i)) {
        tokens.push({ type: 'Punctuator', value: op, start: i });
        i += op.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // 单字符运算符
    if ('(){}[];,.+-*/%=<>!&|:?~^'.includes(ch)) {
      tokens.push({ type: 'Punctuator', value: ch, start: i });
      i++;
      continue;
    }

    // 无法识别，跳过
    i++;
  }
  return tokens;
}

// --- 简单的递归下降解析器（生成简化的 AST）---
function parse(tokens) {
  let pos = 0;

  function peek(n = 0) { return tokens[pos + n]; }
  function skip() { pos++; }
  function expect(type, value) {
    const t = peek();
    if (!t || t.type !== type || (value && t.value !== value)) {
      throw new Error(\`解析错误：期望 \${value || type}，实际 \${t?.value}\`);
    }
    pos++;
    return t;
  }

  function parseProgram() {
    const body = [];
    while (pos < tokens.length) {
      body.push(parseStatement());
    }
    return { type: 'Program', body };
  }

  function parseStatement() {
    const t = peek();
    if (!t) return { type: 'Empty' };

    // 变量声明
    if (t.type === 'Keyword' && ['var', 'let', 'const'].includes(t.value)) {
      return parseVarDeclaration();
    }
    // 函数声明
    if (t.type === 'Keyword' && t.value === 'function') {
      return parseFunctionDeclaration();
    }
    // if 语句
    if (t.type === 'Keyword' && t.value === 'if') {
      return parseIfStatement();
    }
    // return 语句
    if (t.type === 'Keyword' && t.value === 'return') {
      skip();
      const arg = peek() && peek().value !== ';' ? parseExpression() : null;
      if (peek()?.value === ';') skip();
      return { type: 'ReturnStatement', argument: arg };
    }
    // 块语句
    if (t.value === '{') {
      return parseBlock();
    }
    // 表达式语句
    const expr = parseExpression();
    if (peek()?.value === ';') skip();
    return { type: 'ExpressionStatement', expression: expr };
  }

  function parseBlock() {
    expect('Punctuator', '{');
    const body = [];
    while (peek() && peek().value !== '}') {
      body.push(parseStatement());
    }
    expect('Punctuator', '}');
    return { type: 'BlockStatement', body };
  }

  function parseVarDeclaration() {
    const kind = peek().value; // var/let/const
    skip();
    const declarations = [];
    while (true) {
      const id = expect('Identifier').value;
      let init = null;
      if (peek()?.value === '=') {
        skip();
        init = parseExpression();
      }
      declarations.push({ type: 'VariableDeclarator', id, init });
      if (peek()?.value === ',') { skip(); } else { break; }
    }
    if (peek()?.value === ';') skip();
    return { type: 'VariableDeclaration', kind, declarations };
  }

  function parseFunctionDeclaration() {
    expect('Keyword', 'function');
    const name = expect('Identifier').value;
    expect('Punctuator', '(');
    const params = [];
    while (peek() && peek().value !== ')') {
      params.push(expect('Identifier').value);
      if (peek()?.value === ',') skip();
    }
    expect('Punctuator', ')');
    const body = parseBlock();
    return { type: 'FunctionDeclaration', name, params, body };
  }

  function parseIfStatement() {
    expect('Keyword', 'if');
    expect('Punctuator', '(');
    const test = parseExpression();
    expect('Punctuator', ')');
    const consequent = parseStatement();
    let alternate = null;
    if (peek()?.type === 'Keyword' && peek().value === 'else') {
      skip();
      alternate = parseStatement();
    }
    return { type: 'IfStatement', test, consequent, alternate };
  }

  function parseExpression() {
    return parseAssignment();
  }

  function parseAssignment() {
    const left = parseComparison();
    if (peek()?.value === '=') {
      skip();
      const right = parseAssignment();
      return { type: 'AssignmentExpression', operator: '=', left, right };
    }
    return left;
  }

  function parseComparison() {
    let left = parseAdditive();
    while (peek() && ['==', '===', '!=', '!==', '>', '<', '>=', '<='].includes(peek().value)) {
      const op = peek().value;
      skip();
      const right = parseAdditive();
      left = { type: 'BinaryExpression', operator: op, left, right };
    }
    return left;
  }

  function parseAdditive() {
    let left = parseMultiplicative();
    while (peek() && ['+', '-'].includes(peek().value)) {
      const op = peek().value;
      skip();
      const right = parseMultiplicative();
      left = { type: 'BinaryExpression', operator: op, left, right };
    }
    return left;
  }

  function parseMultiplicative() {
    let left = parseCallMember();
    while (peek() && ['*', '/', '%'].includes(peek().value)) {
      const op = peek().value;
      skip();
      const right = parseCallMember();
      left = { type: 'BinaryExpression', operator: op, left, right };
    }
    return left;
  }

  function parseCallMember() {
    let expr = parsePrimary();
    while (peek()) {
      if (peek().value === '(') {
        skip();
        const args = [];
        while (peek() && peek().value !== ')') {
          args.push(parseExpression());
          if (peek()?.value === ',') skip();
        }
        expect('Punctuator', ')');
        expr = { type: 'CallExpression', callee: expr, arguments: args };
      } else if (peek().value === '.') {
        skip();
        const prop = expect('Identifier').value;
        expr = { type: 'MemberExpression', object: expr, property: prop };
      } else {
        break;
      }
    }
    return expr;
  }

  function parsePrimary() {
    const t = peek();
    if (!t) return { type: 'Literal', value: null };

    // 括号表达式
    if (t.value === '(') {
      skip();
      const expr = parseExpression();
      expect('Punctuator', ')');
      return expr;
    }
    // 数字
    if (t.type === 'Number') {
      skip();
      return { type: 'Literal', value: Number(t.value) };
    }
    // 字符串
    if (t.type === 'String') {
      skip();
      return { type: 'Literal', value: t.value.slice(1, -1) };
    }
    // 标识符（变量引用）
    if (t.type === 'Identifier') {
      skip();
      return { type: 'Identifier', name: t.value };
    }
    // 关键字（this, true, false, null）
    if (t.type === 'Keyword') {
      skip();
      if (t.value === 'this') return { type: 'ThisExpression' };
      if (t.value === 'true') return { type: 'Literal', value: true };
      if (t.value === 'false') return { type: 'Literal', value: false };
      if (t.value === 'null') return { type: 'Literal', value: null };
    }
    // 函数表达式
    if (t.type === 'Keyword' && t.value === 'function') {
      skip();
      let name = null;
      if (peek()?.type === 'Identifier') { name = peek().value; skip(); }
      expect('Punctuator', '(');
      const params = [];
      while (peek() && peek().value !== ')') {
        params.push(expect('Identifier').value);
        if (peek()?.value === ',') skip();
      }
      expect('Punctuator', ')');
      const body = parseBlock();
      return { type: 'FunctionExpression', name, params, body };
    }
    skip();
    return { type: 'Unknown', value: t.value };
  }

  return parseProgram();
}

// --- AST 遍历器 ---
function traverse(node, visitors, parent = null) {
  if (!node || typeof node !== 'object') return;

  const visitor = visitors[node.type];
  if (visitor && visitor.enter) visitor.enter(node, parent);

  // 遍历子节点
  for (const key of Object.keys(node)) {
    if (key === 'type' || key === 'loc') continue;
    const child = node[key];
    if (Array.isArray(child)) {
      child.forEach(c => traverse(c, visitors, node));
    } else if (child && typeof child === 'object' && child.type) {
      traverse(child, visitors, node);
    }
  }

  if (visitor && visitor.exit) visitor.exit(node, parent);
}

// --- Linter 规则引擎 ---
class Linter {
  constructor() {
    this.rules = new Map();
  }

  addRule(name, rule) {
    this.rules.set(name, rule);
  }

  lint(sourceCode) {
    const errors = [];
    const tokens = tokenize(sourceCode);
    let ast;
    try {
      ast = parse(tokens);
    } catch (e) {
      return [{ line: 0, column: 0, rule: 'parse-error', message: '解析失败: ' + e.message }];
    }

    const context = {
      report(node, message) {
        errors.push({
          line: 1,  // 简化：不计算行号
          rule: context.currentRule,
          message,
        });
      },
    };

    for (const [ruleName, rule] of this.rules) {
      context.currentRule = ruleName;
      const visitors = rule.create(context);
      traverse(ast, visitors);
    }

    return errors;
  }
}

// --- 定义 Lint 规则 ---
const linter = new Linter();

// 规则1：禁止使用 var（应该使用 let/const）
linter.addRule('no-var', {
  create(context) {
    return {
      VariableDeclaration(node) {
        if (node.kind === 'var') {
          context.report(node, '不要使用 var，请使用 const 或 let');
        }
      }
    };
  }
});

// 规则2：禁止使用 console.log
linter.addRule('no-console', {
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type === 'MemberExpression' &&
            node.callee.object.type === 'Identifier' &&
            node.callee.object.name === 'console' &&
            node.callee.property === 'log') {
          context.report(node, '不建议使用 console.log，请使用日志库');
        }
      }
    };
  }
});

// 规则3：警告使用 == 而不是 ===
linter.addRule('eqeqeq', {
  create(context) {
    return {
      BinaryExpression(node) {
        if (node.operator === '==' || node.operator === '!=') {
          const suggestion = node.operator === '==' ? '===' : '!==';
          context.report(node, \`使用 \${node.operator} 可能导致类型转换问题，请使用 \${suggestion}\`);
        }
      }
    };
  }
});

// 规则4：检查未使用的变量（简化版）
linter.addRule('no-unused-vars', {
  create(context) {
    const declared = new Map();
    const used = new Set();

    return {
      VariableDeclaration(node) {
        node.declarations.forEach(d => {
          declared.set(d.id, node);
        });
      },
      Identifier(node, parent) {
        // 排除声明时的标识符
        if (parent && parent.type !== 'VariableDeclarator' ||
            (parent && parent.id === node)) {
          used.add(node.name);
        }
      },
      Program: {
        exit() {
          for (const [name] of declared) {
            if (!used.has(name)) {
              context.report({ type: 'VariableDeclarator' }, \`变量 '\${name}' 声明了但从未使用\`);
            }
          }
        }
      }
    };
  }
});

// 规则5：禁止使用 eval
linter.addRule('no-eval', {
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'eval') {
          context.report(node, 'eval() 是危险的函数，禁止使用');
        }
      }
    };
  }
});

// --- 演示 Linter ---
console.log('=== ESLint 原理演示 ===\\n');

// 有问题的测试代码
const badCode = \`
var x = 1;
var name = "test";
console.log("hello");
if (x == 1) {
  x = 2;
}
eval("alert(1)");
var unused = 42;
\`;

console.log('--- 待检查代码 ---');
console.log(badCode);
console.log('--- Lint 结果 ---');
const errors = linter.lint(badCode);
errors.forEach((err, i) => {
  console.log(\`  \${i + 1}. [\${err.rule}] \${err.message}\`);
});
console.log(\`\\n共发现 \${errors.length} 个问题\\n\`);

// 符合规范的代码
const goodCode = \`
const x = 1;
const name = 'test';
if (x === 1) {
  const y = x * 2;
  return y;
}
\`;

console.log('--- 规范代码 Lint 结果 ---');
const goodErrors = linter.lint(goodCode);
if (goodErrors.length === 0) {
  console.log('  ✅ 未发现问题，代码符合规范！');
} else {
  goodErrors.forEach((err, i) => {
    console.log(\`  \${i + 1}. [\${err.rule}] \${err.message}\`);
  });
}

// --- Prettier 格式化演示（简化的代码格式化器）---
console.log('\\n--- Prettier 风格格式化演示 ---');

function formatCode(source) {
  let indent = 0;
  const lines = [];
  let currentLine = '';
  let i = 0;
  const INDENT_SIZE = 2;

  function addLine() {
    const trimmed = currentLine.trim();
    if (trimmed) {
      lines.push(' '.repeat(indent * INDENT_SIZE) + trimmed);
    }
    currentLine = '';
  }

  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];

    if (ch === '{') {
      currentLine += ' {';
      addLine();
      indent++;
      i++;
      continue;
    }
    if (ch === '}') {
      addLine();
      indent = Math.max(0, indent - 1);
      currentLine += '}';
      if (next === ';') { i++; currentLine += ';'; }
      if (next === ',' || next === ';') { /* handled later */ }
      addLine();
      i++;
      continue;
    }
    if (ch === ';') {
      currentLine += ';';
      addLine();
      i++;
      continue;
    }
    if (ch === '\\n') { i++; continue; }
    if (ch === ' ' && (currentLine === '' || currentLine.endsWith(' '))) { i++; continue; }
    currentLine += ch;
    i++;
  }
  addLine();
  return lines.join('\\n');
}

const unformattedCode = 'const a={x:1,y:2};if(a.x===1){console.log("yes");return true;}';
console.log('格式化前:', unformattedCode);
console.log('格式化后:');
console.log(formatCode(unformattedCode));

console.log('\\n=== Linter/Formatter 演示完成 ===');
console.log('实际项目中使用 ESLint + Prettier + Husky + lint-staged');
`,
  },
  {
    id: "n4-testing",
    group: "第六部分 工程化",
    icon: "🧪",
    title: "单元测试：Jest 风格的测试框架",
    content: `# 单元测试：Jest 风格的测试框架

## 一、为什么需要测试

测试是保证代码质量的重要手段。

### 1.1 测试的价值

| 好处 | 说明 |
|------|------|
| **信心保障** | 修改代码、重构时，测试通过就知道没有破坏已有功能 |
| **活文档** | 测试用例就是最佳的使用示例和文档 |
| **改进设计** | 难写测试的代码往往是设计有问题，测试驱动更好的设计 |
| **回归防护** | 修完 Bug 写个测试，防止以后再次出现同样的问题 |
| **协作安全** | 多人协作时，测试保证你改的代码不影响别人的模块 |

### 1.2 测试金字塔

测试分为不同层次，从下到上数量递减、成本递增：

\`\`\`
        /    E2E    \\     （端到端测试：模拟真实用户操作整个系统）
       / 集成测试    \\    （测试多个模块的交互）
      /   单元测试     \\   （测试单个函数/模块，速度快、数量多）
\`\`\`

**单元测试**是基础，占比 70%+，快速验证独立功能单元的正确性。

---

## 二、测试核心概念

### 2.1 describe / it / expect

Jest 等现代测试框架都有相似的 API：

\`\`\`javascript
// describe: 定义一个测试套件（一组相关测试）
describe('Calculator', () => {
  // it/test: 定义一个测试用例
  it('should add two numbers correctly', () => {
    // expect: 断言
    expect(add(1, 2)).toBe(3);
  });

  it('should handle negative numbers', () => {
    expect(add(-1, -2)).toBe(-3);
  });
});
\`\`\`

### 2.2 Matchers（匹配器）

\`\`\`javascript
expect(result).toBe(expected);           // 严格相等（===）
expect(result).toEqual(expected);        // 深度相等（对象/数组内容比较）
expect(result).not.toBe(expected);       // 取反
expect(value).toBeTruthy();              // 真值
expect(value).toBeFalsy();               // 假值
expect(value).toBeNull();                // 是 null
expect(value).toBeDefined();             // 不是 undefined
expect(value).toBeGreaterThan(n);        // 大于 n
expect(value).toBeLessThan(n);           // 小于 n
expect(arr).toContain(item);             // 数组包含
expect(str).toMatch(regex);              // 字符串匹配正则
expect(fn).toThrow(error);               // 函数抛出异常
\`\`\`

### 2.3 Setup / Teardown

每个测试之前/之后执行的准备和清理工作：

\`\`\`javascript
describe('Database', () => {
  let db;

  // 所有测试之前执行一次
  beforeAll(() => { db = connectDB(); });

  // 每个测试之前执行
  beforeEach(() => { db.clear(); });

  // 每个测试之后执行
  afterEach(() => { /* 清理 */ });

  // 所有测试之后执行一次
  afterAll(() => { db.close(); });

  it('test1', () => { /* db 是干净的 */ });
  it('test2', () => { /* db 也是干净的 */ });
});
\`\`\`

---

## 三、异步代码测试

异步测试在 Node.js 中很常见，测试框架通常支持三种方式：

\`\`\`javascript
// 方式1：传入 done 回调
it('async with done', (done) => {
  setTimeout(() => {
    expect(1 + 1).toBe(2);
    done();
  }, 100);
});

// 方式2：返回 Promise
it('async with promise', () => {
  return fetchUser(1).then(user => {
    expect(user.name).toBe('张三');
  });
});

// 方式3：async/await（推荐）
it('async with await', async () => {
  const user = await fetchUser(1);
  expect(user.name).toBe('张三');
});
\`\`\`

---

## 四、Mock（模拟）

Mock 是用假对象替换真实依赖，隔离测试单元。

### 4.1 为什么需要 Mock？

- 测试代码依赖数据库/网络/文件系统，会让测试变慢、不稳定
- 你想测试的模块依赖其他模块的特定返回值
- 你想验证某个函数是否被正确调用

### 4.2 Mock 函数

\`\`\`javascript
// 创建一个 mock 函数
const mockFn = jest.fn();
mockFn('hello');
mockFn('world');

// 验证调用
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith('hello');

// Mock 返回值
const mockFetch = jest.fn().mockResolvedValue({ id: 1, name: '张三' });
\`\`\`

---

## 五、测试覆盖率

测试覆盖率衡量测试覆盖了多少代码：

| 指标 | 说明 |
|------|------|
| **Statement** | 语句覆盖率 |
| **Branch** | 分支覆盖率（if/else 等） |
| **Function** | 函数覆盖率 |
| **Line** | 行覆盖率 |

\`\`\`bash
npx jest --coverage   # 生成覆盖率报告
\`\`\`

**注意**：100% 覆盖率不等于没有 Bug，但低覆盖率一定有问题。

---

## 六、测试最佳实践

- **测试行为，不是实现**：测试输入输出，不要 Mock 私有方法
- **每个测试独立**：测试之间不能有依赖，执行顺序不影响结果
- **描述清晰**：测试描述应该是句子，说明"应该做什么"
- **快**：单元测试应该快速运行（毫秒级），慢了就没人跑了
- **AAA 模式**：Arrange（准备数据）、Act（执行代码）、Assert（断言）
`,
    code: `// ============================================
// Jest 风格测试框架实现
// 从零实现 describe / it / expect / beforeEach 等
// ============================================

// --- 全局测试状态管理 ---
const testState = {
  suites: [],                 // 所有测试套件
  currentSuite: null,         // 当前正在定义的套件
  currentTest: null,          // 当前正在定义的测试
  beforeAllFns: [],
  beforeEachFns: [],
  afterEachFns: [],
  afterAllFns: [],
  failures: [],
  passes: [],
  asyncTests: 0,
};

// --- 定义测试套件 ---
function describe(name, fn) {
  const suite = {
    name,
    tests: [],
    beforeAll: [],
    beforeEach: [],
    afterEach: [],
    afterAll: [],
  };
  testState.suites.push(suite);
  testState.currentSuite = suite;

  // 保存并切换 hook 数组
  const prevBeforeAll = testState.beforeAllFns;
  const prevBeforeEach = testState.beforeEachFns;
  const prevAfterEach = testState.afterEachFns;
  const prevAfterAll = testState.afterAllFns;
  testState.beforeAllFns = suite.beforeAll;
  testState.beforeEachFns = suite.beforeEach;
  testState.afterEachFns = suite.afterEach;
  testState.afterAllFns = suite.afterAll;

  fn();

  // 恢复外层 hook 数组
  testState.beforeAllFns = prevBeforeAll;
  testState.beforeEachFns = prevBeforeEach;
  testState.afterEachFns = prevAfterEach;
  testState.afterAllFns = prevAfterAll;
  testState.currentSuite = null;
}

// --- 定义测试用例 ---
function it(name, fn) {
  const test = { name, fn, suite: testState.currentSuite };
  if (testState.currentSuite) {
    testState.currentSuite.tests.push(test);
  }
}

// 别名
const test = it;

// --- Setup/Teardown hooks ---
function beforeAll(fn) { testState.beforeAllFns.push(fn); }
function beforeEach(fn) { testState.beforeEachFns.push(fn); }
function afterEach(fn) { testState.afterEachFns.push(fn); }
function afterAll(fn) { testState.afterAllFns.push(fn); }

// --- Expect 断言库 ---
function expect(actual) {
  return {
    // 严格相等（===）
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(\`Expected \${JSON.stringify(actual)} to be \${JSON.stringify(expected)}\`);
      }
    },

    // 深度相等
    toEqual(expected) {
      const actualStr = JSON.stringify(actual);
      const expectedStr = JSON.stringify(expected);
      if (actualStr !== expectedStr) {
        throw new Error(\`Expected \${actualStr} to equal \${expectedStr}\`);
      }
    },

    // 取反
    get not() {
      return {
        toBe: (expected) => {
          if (actual === expected) {
            throw new Error(\`Expected \${JSON.stringify(actual)} not to be \${JSON.stringify(expected)}\`);
          }
        },
        toEqual: (expected) => {
          if (JSON.stringify(actual) === JSON.stringify(expected)) {
            throw new Error(\`Expected values not to be deeply equal\`);
          }
        },
      };
    },

    // 真值/假值
    toBeTruthy() {
      if (!actual) throw new Error(\`Expected \${JSON.stringify(actual)} to be truthy\`);
    },
    toBeFalsy() {
      if (actual) throw new Error(\`Expected \${JSON.stringify(actual)} to be falsy\`);
    },
    toBeNull() {
      if (actual !== null) throw new Error(\`Expected \${JSON.stringify(actual)} to be null\`);
    },
    toBeUndefined() {
      if (actual !== undefined) throw new Error(\`Expected value to be undefined\`);
    },
    toBeDefined() {
      if (actual === undefined) throw new Error(\`Expected value to be defined\`);
    },

    // 数字比较
    toBeGreaterThan(n) {
      if (!(actual > n)) throw new Error(\`Expected \${actual} to be greater than \${n}\`);
    },
    toBeLessThan(n) {
      if (!(actual < n)) throw new Error(\`Expected \${actual} to be less than \${n}\`);
    },
    toBeGreaterThanOrEqual(n) {
      if (!(actual >= n)) throw new Error(\`Expected \${actual} >= \${n}\`);
    },
    toBeLessThanOrEqual(n) {
      if (!(actual <= n)) throw new Error(\`Expected \${actual} <= \${n}\`);
    },

    // 数组/字符串包含
    toContain(item) {
      if (Array.isArray(actual)) {
        if (!actual.includes(item)) {
          throw new Error(\`Expected array to contain \${JSON.stringify(item)}\`);
        }
      } else if (typeof actual === 'string') {
        if (!actual.includes(String(item))) {
          throw new Error(\`Expected string to contain '\${item}'\`);
        }
      } else {
        throw new Error('toContain only works with arrays and strings');
      }
    },

    // 正则匹配
    toMatch(regex) {
      if (!regex.test(actual)) {
        throw new Error(\`Expected '\${actual}' to match \${regex}\`);
      }
    },

    // 异常断言
    toThrow(expectedMessage) {
      if (typeof actual !== 'function') {
        throw new Error('Actual value must be a function for toThrow');
      }
      let threw = false;
      let error;
      try {
        actual();
      } catch (e) {
        threw = true;
        error = e;
      }
      if (!threw) {
        throw new Error('Expected function to throw an error');
      }
      if (expectedMessage && !error.message.includes(expectedMessage)) {
        throw new Error(\`Expected error to contain '\${expectedMessage}', got '\${error.message}'\`);
      }
    },

    // 类型检查
    toBeInstanceOf(cls) {
      if (!(actual instanceof cls)) {
        throw new Error(\`Expected instance of \${cls.name}\`);
      }
    },
    toHaveLength(n) {
      if (actual.length !== n) {
        throw new Error(\`Expected length \${n}, got \${actual.length}\`);
      }
    },
  };
}

// --- Mock 函数 ---
function fn(implementation) {
  const mockFn = function(...args) {
    mockFn.mock.calls.push(args);
    mockFn.mock.instances.push(this);
    mockFn.mock.calls.length = mockFn.mock.calls.length;
    if (implementation) {
      return implementation.apply(this, args);
    }
  };
  mockFn.mock = {
    calls: [],
    instances: [],
    results: [],
  };
  mockFn.mockReturnValue = function(val) {
    const original = implementation;
    implementation = () => val;
    return mockFn;
  };
  mockFn.mockResolvedValue = function(val) {
    implementation = () => Promise.resolve(val);
    return mockFn;
  };
  mockFn.mockRejectedValue = function(val) {
    implementation = () => Promise.reject(val);
    return mockFn;
  };
  mockFn.mockImplementation = function(fn) {
    implementation = fn;
    return mockFn;
  };
  mockFn.mockClear = function() {
    mockFn.mock.calls = [];
    mockFn.mock.instances = [];
    return mockFn;
  };
  return mockFn;
}

// --- 运行所有测试 ---
async function runTests() {
  console.log('=== Jest 风格测试框架演示 ===\\n');
  let totalTests = 0;
  let passed = 0;
  let failed = 0;

  for (const suite of testState.suites) {
    console.log(\`📦 \${suite.name}\`);

    // beforeAll
    for (const hook of suite.beforeAll) await hook();

    for (const t of suite.tests) {
      totalTests++;
      let error = null;

      // beforeEach
      for (const hook of suite.beforeEach) await hook();

      try {
        const result = t.fn();
        // 处理 async 测试
        if (result && typeof result.then === 'function') {
          await result;
        }
      } catch (e) {
        error = e;
      }

      // afterEach
      for (const hook of suite.afterEach) await hook();

      if (error) {
        failed++;
        console.log(\`  ❌ \${t.name}\`);
        console.log(\`     \${error.message}\`);
      } else {
        passed++;
        console.log(\`  ✅ \${t.name}\`);
      }
    }

    // afterAll
    for (const hook of suite.afterAll) await hook();
    console.log('');
  }

  // 汇总
  console.log('---');
  console.log(\`测试结果: \${passed} 通过, \${failed} 失败, 共 \${totalTests} 个测试\`);
  console.log(\`\${failed === 0 ? '🎉 所有测试通过！' : '❌ 有测试失败！'}\\n\`);
}

// ============================================
// 实际测试用例演示
// ============================================

// --- 待测试的业务代码 ---
function add(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('Both arguments must be numbers');
  }
  return a + b;
}

function subtract(a, b) { return a - b; }
function multiply(a, b) { return a * b; }
function divide(a, b) {
  if (b === 0) throw new Error('Division by zero');
  return a / b;
}

function isEmail(str) {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(str);
}

function getUser(id, db) {
  if (!db) throw new Error('Database connection required');
  return db.find(u => u.id === id);
}

function asyncFetchUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id > 0) resolve({ id, name: '用户' + id });
      else reject(new Error('Invalid user ID'));
    }, 10);
  });
}

// --- 测试用例 ---

describe('Math functions', () => {
  describe('add()', () => {
    it('should add two positive numbers', () => {
      expect(add(1, 2)).toBe(3);
      expect(add(10, 20)).toBe(30);
    });

    it('should add negative numbers', () => {
      expect(add(-1, -2)).toBe(-3);
      expect(add(-5, 5)).toBe(0);
    });

    it('should handle zero', () => {
      expect(add(0, 0)).toBe(0);
      expect(add(0, 100)).toBe(100);
    });

    it('should throw TypeError for non-numbers', () => {
      expect(() => add('1', 2)).toThrow('numbers');
      expect(() => add(null, 2)).toThrow();
    });
  });

  describe('divide()', () => {
    it('should divide numbers correctly', () => {
      expect(divide(10, 2)).toBe(5);
      expect(divide(9, 3)).toBe(3);
    });

    it('should throw on division by zero', () => {
      expect(() => divide(1, 0)).toThrow('Division by zero');
    });
  });
});

describe('Utility functions', () => {
  describe('isEmail()', () => {
    it('should validate correct emails', () => {
      expect(isEmail('test@example.com')).toBeTruthy();
      expect(isEmail('user.name+tag@domain.co')).toBeTruthy();
    });

    it('should reject invalid emails', () => {
      expect(isEmail('not-an-email')).toBeFalsy();
      expect(isEmail('@nodomain.com')).toBeFalsy();
      expect(isEmail('missing@.com')).toBeFalsy();
    });
  });
});

describe('Matchers demo', () => {
  it('toBe vs toEqual', () => {
    expect(2 + 2).toBe(4);
    expect({ a: 1 }).toEqual({ a: 1 });
    // expect({a:1}).toBe({a:1}); // 会失败：对象引用不同
    const obj = { a: 1 };
    expect(obj).toBe(obj); // 同一引用才通过
  });

  it('numeric matchers', () => {
    expect(10).toBeGreaterThan(5);
    expect(5).toBeLessThan(10);
    expect(5).toBeGreaterThanOrEqual(5);
    expect(3 + 2).toBeLessThanOrEqual(5);
  });

  it('array and string matchers', () => {
    expect([1, 2, 3]).toContain(2);
    expect('hello world').toContain('world');
    expect('hello world').toMatch(/^hello/);
    expect([1, 2, 3]).toHaveLength(3);
  });

  it('null/undefined matchers', () => {
    expect(null).toBeNull();
    expect(undefined).toBeUndefined();
    let x;
    expect(x).toBeUndefined();
    expect(null).toBeDefined();
  });

  it('not modifier', () => {
    expect(1 + 1).not.toBe(3);
    expect([1, 2, 3]).not.toContain(4);
  });
});

describe('Mock functions', () => {
  it('should track calls', () => {
    const mockFn = fn();
    mockFn('arg1', 'arg2');
    mockFn('arg3');
    expect(mockFn.mock.calls.length).toBe(2);
    expect(mockFn.mock.calls[0]).toEqual(['arg1', 'arg2']);
  });

  it('should return mock values', () => {
    const mock = fn().mockReturnValue(42);
    expect(mock()).toBe(42);
    expect(mock()).toBe(42);
  });

  it('should mock dependencies', () => {
    const mockDB = [
      { id: 1, name: '张三' },
      { id: 2, name: '李四' },
    ];
    const mockFind = fn(arr => arr.find(u => u.id === 1));
    const user = mockFind(mockDB);
    expect(user).toEqual({ id: 1, name: '张三' });
  });
});

describe('Async tests', () => {
  it('should test async functions with async/await', async () => {
    const user = await asyncFetchUser(1);
    expect(user).toEqual({ id: 1, name: '用户1' });
  });

  it('should handle async errors', async () => {
    try {
      await asyncFetchUser(-1);
    } catch (e) {
      expect(e.message).toMatch(/Invalid/);
    }
  });
});

describe('Setup/Teardown demo', () => {
  let counter = 0;

  beforeEach(() => {
    counter = 0; // 每个测试前重置
  });

  it('test 1: counter starts at 0', () => {
    expect(counter).toBe(0);
    counter++;
  });

  it('test 2: counter is reset to 0', () => {
    expect(counter).toBe(0);
    counter = 100;
  });
});

// --- 运行测试 ---
runTests();
`,
  },
  {
    id: "n4-supertest",
    group: "第六部分 工程化",
    icon: "🔬",
    title: "接口测试与 supertest 原理",
    content: `# 接口测试与 supertest 原理

## 一、什么是接口测试

接口测试（API Testing）是测试系统组件间接口的一种测试，重点关注数据交换、传递和控制管理过程，以及系统间的相互逻辑依赖关系。

### 1.1 接口测试的重要性

| 优势 | 说明 |
|------|------|
| **更早发现问题** | 接口测试可以在 UI 完成之前就开始测试后端逻辑 |
| **更高的 ROI** | 接口比 UI 稳定，维护成本低，收益高 |
| **更容易自动化** | HTTP 请求容易通过代码发送和断言 |
| **测试复杂度低** | 直接调用接口，不需要操作浏览器/UI |
| **覆盖核心逻辑** | 业务逻辑主要在后端，接口测试能直接覆盖 |

### 1.2 接口测试 vs 单元测试

| 维度 | 单元测试 | 接口测试 |
|------|----------|----------|
| **测试对象** | 单个函数/模块 | HTTP 端点 |
| **依赖隔离** | Mock 所有外部依赖 | 使用真实（或测试环境）的数据库、服务 |
| **速度** | 极快（毫秒级） | 较快（几十到几百毫秒） |
| **覆盖范围** | 代码路径 | 请求-响应完整链路 |
| **发现的问题** | 逻辑错误 | 参数校验、权限、集成问题 |

---

## 二、supertest 的工作原理

supertest 是一个流行的 Node.js HTTP 断言库，它的核心原理非常巧妙：**不需要真正启动服务器监听端口**。

### 2.1 Node.js http 服务器的特性

Node.js 的 \`http.createServer()\` 创建的服务器实例，本身就是一个**请求监听器函数**，可以直接接收请求对象和响应对象，不需要调用 \`listen()\`。

\`\`\`javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.end('Hello World');
});

// 方式1：监听端口（传统方式）
server.listen(3000);

// 方式2：直接向 server 发送请求（supertest 的方式！）
// server 本身就是 app.callback() 或 (req, res) => {} 函数
\`\`\`

### 2.2 supertest 核心流程

\`\`\`
1. 接收 http.Server 实例或 Express/Koa app
2. 内部自动选择一个空闲端口
3. 发送 HTTP 请求到该端口
4. 收集响应（状态码、头、body）
5. 提供链式 API 进行断言
6. 测试结束后自动关闭服务器
\`\`\`

---

## 三、supertest 常用 API

### 3.1 基础用法

\`\`\`javascript
const request = require('supertest');
const app = require('./app'); // Express/Koa app

describe('GET /users', () => {
  it('should return user list', async () => {
    const res = await request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toBeInstanceOf(Array);
  });
});
\`\`\`

### 3.2 发送数据

\`\`\`javascript
// POST JSON
request(app)
  .post('/users')
  .send({ name: '张三', email: 'zhangsan@example.com' })
  .expect(201);

// POST Form
request(app)
  .post('/login')
  .type('form')
  .send({ username: 'admin', password: '123456' })
  .expect(200);

// 设置 Cookie
request(app)
  .get('/profile')
  .set('Cookie', 'sessionId=abc123')
  .expect(200);

// 带认证 Token
request(app)
  .get('/api/protected')
  .auth('token', { type: 'bearer' })
  .expect(200);
\`\`\`

### 3.3 断言响应

\`\`\`javascript
request(app)
  .get('/users/1')
  .expect(200)                    // 状态码
  .expect('Content-Type', /json/) // 响应头
  .expect('X-Powered-By', 'Express')
  .expect(res => {
    // 自定义断言
    if (res.body.id !== 1) throw new Error('Wrong id');
    if (!res.body.name) throw new Error('Missing name');
  });
\`\`\`

### 3.4 文件上传

\`\`\`javascript
request(app)
  .post('/upload')
  .attach('avatar', './test/fixtures/user.jpg')
  .field('name', '张三')
  .expect(200);
\`\`\`

---

## 四、测试 RESTful API 实战

### 4.1 测试组织结构

\`\`\`javascript
describe('Users API', () => {
  describe('GET /users', () => { /* 获取列表 */ });
  describe('GET /users/:id', () => { /* 获取单个 */ });
  describe('POST /users', () => { /* 创建 */ });
  describe('PUT /users/:id', () => { /* 更新 */ });
  describe('DELETE /users/:id', () => { /* 删除 */ });
});
\`\`\`

### 4.2 常见测试场景

| 场景 | 验证内容 |
|------|----------|
| **正常流程** | 参数正确时返回 2xx，数据结构正确 |
| **参数校验** | 参数缺失/格式错误时返回 400，有错误信息 |
| **认证授权** | 未登录返回 401，无权限返回 403 |
| **资源不存在** | 访问不存在的资源返回 404 |
| **业务约束** | 重复数据返回 409（Conflict） |
| **边界条件** | 分页、空列表、大数据量 |

---

## 五、测试数据库处理

### 5.1 常见策略

- **使用测试数据库**：与开发/生产库完全隔离
- **每个测试前清理**：beforeEach 清空数据
- **事务回滚**：每个测试包裹在事务中，结束后回滚
- **SQLite 内存数据库**：测试更快，数据不持久化

### 5.2 测试数据准备

\`\`\`javascript
describe('Users API', () => {
  let testUser;

  beforeEach(async () => {
    // 每个测试前创建测试数据
    testUser = await User.create({
      name: '测试用户',
      email: 'test@example.com'
    });
  });

  it('should get user by id', async () => {
    const res = await request(app)
      .get(\`/users/\${testUser.id}\`)
      .expect(200);

    expect(res.body.email).toBe('test@example.com');
  });
});
\`\`\`

---

## 六、认证接口测试

### 6.1 登录后保持会话

\`\`\`javascript
describe('Authenticated routes', () => {
  const agent = request.agent(app); // 保持 Cookie

  before(async () => {
    // 先登录
    await agent
      .post('/login')
      .send({ username: 'admin', password: '123456' })
      .expect(200);
  });

  it('should access protected route', async () => {
    await agent.get('/dashboard').expect(200);
  });
});
\`\`\`

### 6.2 JWT Token 认证

\`\`\`javascript
let token;

before(async () => {
  const res = await request(app)
    .post('/auth/login')
    .send({ username: 'admin', password: '123456' });
  token = res.body.token;
});

it('should access with token', async () => {
  await request(app)
    .get('/api/profile')
    .set('Authorization', \`Bearer \${token}\`)
    .expect(200);
});
\`\`\`

---

## 七、接口测试最佳实践

1. **测试真实行为**：不要只测试状态码，还要验证返回的数据结构和业务逻辑
2. **每个测试独立**：测试之间不共享状态，不依赖执行顺序
3. **覆盖边界情况**：空值、超长字符串、特殊字符、非法格式
4. **测试错误场景**：不要只测成功的路径，错误路径更重要
5. **保持测试快速**：接口测试应该在几秒内完成
6. **不要过度 Mock**：接口测试应该尽量走真实链路，只 Mock 外部服务
7. **使用工厂函数**：创建测试数据的辅助函数，避免重复代码

在本章的 Demo 中，我们将从零构建一个类似 supertest 的测试工具，直接对 Node.js http 服务器发送请求并断言响应，不依赖任何 npm 包！
`,
    code: `// ============================================
// 从零实现 supertest 风格的接口测试工具
// 不依赖任何 npm 包，仅使用 Node.js 内置模块
// ============================================

const http = require('http');
const { URL } = require('url');

// ============================================
// 第一部分：构建一个待测试的 REST API 服务器
// ============================================

// 简单的内存数据库
const db = {
  users: [
    { id: 1, name: '张三', email: 'zhangsan@example.com', age: 25 },
    { id: 2, name: '李四', email: 'lisi@example.com', age: 30 },
    { id: 3, name: '王五', email: 'wangwu@example.com', age: 28 },
  ],
  nextId: 4,
  todos: [
    { id: 1, userId: 1, title: '学习 Node.js', completed: true },
    { id: 2, userId: 1, title: '写接口测试', completed: false },
  ],
  nextTodoId: 3,
};

// 简单的认证 Token 存储
const validTokens = new Map();
validTokens.set('token-admin-123', { id: 1, name: '张三', role: 'admin' });
validTokens.set('token-user-456', { id: 2, name: '李四', role: 'user' });

// 辅助函数：解析 JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// 辅助函数：发送 JSON 响应
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Powered-By': 'Node.js-Core',
  });
  res.end(JSON.stringify(data, null, 2));
}

// 认证中间件
function authenticate(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  return validTokens.get(token) || null;
}

// 创建 HTTP 服务器
const app = http.createServer(async (req, res) => {
  const url = new URL(req.url, \`http://\${req.headers.host}\`);
  const pathname = url.pathname;
  const method = req.method;

  try {
    // --- 公开路由 ---

    // 健康检查
    if (method === 'GET' && pathname === '/health') {
      return sendJSON(res, 200, { status: 'ok', timestamp: Date.now() });
    }

    // 登录接口
    if (method === 'POST' && pathname === '/auth/login') {
      const body = await parseBody(req);
      if (body.username === 'admin' && body.password === '123456') {
        return sendJSON(res, 200, { token: 'token-admin-123', user: { id: 1, name: '张三' } });
      }
      if (body.username === 'user' && body.password === '123456') {
        return sendJSON(res, 200, { token: 'token-user-456', user: { id: 2, name: '李四' } });
      }
      return sendJSON(res, 401, { error: '用户名或密码错误' });
    }

    // --- 需要认证的路由 ---
    const user = authenticate(req);

    // GET /api/users - 获取用户列表
    if (method === 'GET' && pathname === '/api/users') {
      if (!user) return sendJSON(res, 401, { error: '未登录' });
      const page = parseInt(url.searchParams.get('page')) || 1;
      const pageSize = parseInt(url.searchParams.get('pageSize')) || 10;
      const start = (page - 1) * pageSize;
      const list = db.users.slice(start, start + pageSize);
      return sendJSON(res, 200, {
        data: list,
        pagination: { page, pageSize, total: db.users.length },
      });
    }

    // GET /api/users/:id - 获取单个用户
    const userMatch = pathname.match(/^\\/api\\/users\\/(\\d+)$/);
    if (method === 'GET' && userMatch) {
      if (!user) return sendJSON(res, 401, { error: '未登录' });
      const id = parseInt(userMatch[1]);
      const found = db.users.find(u => u.id === id);
      if (!found) return sendJSON(res, 404, { error: '用户不存在' });
      return sendJSON(res, 200, found);
    }

    // POST /api/users - 创建用户
    if (method === 'POST' && pathname === '/api/users') {
      if (!user) return sendJSON(res, 401, { error: '未登录' });
      if (user.role !== 'admin') return sendJSON(res, 403, { error: '需要管理员权限' });
      const body = await parseBody(req);
      if (!body.name || !body.email) {
        return sendJSON(res, 400, { error: 'name 和 email 是必填字段' });
      }
      if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(body.email)) {
        return sendJSON(res, 400, { error: '邮箱格式不正确' });
      }
      if (db.users.some(u => u.email === body.email)) {
        return sendJSON(res, 409, { error: '邮箱已存在' });
      }
      const newUser = {
        id: db.nextId++,
        name: body.name,
        email: body.email,
        age: body.age || null,
      };
      db.users.push(newUser);
      return sendJSON(res, 201, newUser);
    }

    // PUT /api/users/:id - 更新用户
    if (method === 'PUT' && userMatch) {
      if (!user) return sendJSON(res, 401, { error: '未登录' });
      const id = parseInt(userMatch[1]);
      const found = db.users.find(u => u.id === id);
      if (!found) return sendJSON(res, 404, { error: '用户不存在' });
      if (user.id !== id && user.role !== 'admin') {
        return sendJSON(res, 403, { error: '只能修改自己的信息' });
      }
      const body = await parseBody(req);
      if (body.name) found.name = body.name;
      if (body.age !== undefined) found.age = body.age;
      return sendJSON(res, 200, found);
    }

    // DELETE /api/users/:id - 删除用户
    if (method === 'DELETE' && userMatch) {
      if (!user) return sendJSON(res, 401, { error: '未登录' });
      if (user.role !== 'admin') return sendJSON(res, 403, { error: '需要管理员权限' });
      const id = parseInt(userMatch[1]);
      const idx = db.users.findIndex(u => u.id === id);
      if (idx === -1) return sendJSON(res, 404, { error: '用户不存在' });
      db.users.splice(idx, 1);
      return sendJSON(res, 204, null);
    }

    // --- Todo 接口 ---
    // GET /api/todos
    if (method === 'GET' && pathname === '/api/todos') {
      if (!user) return sendJSON(res, 401, { error: '未登录' });
      const completed = url.searchParams.get('completed');
      let todos = db.todos.filter(t => t.userId === user.id);
      if (completed === 'true') todos = todos.filter(t => t.completed);
      if (completed === 'false') todos = todos.filter(t => !t.completed);
      return sendJSON(res, 200, todos);
    }

    // POST /api/todos
    if (method === 'POST' && pathname === '/api/todos') {
      if (!user) return sendJSON(res, 401, { error: '未登录' });
      const body = await parseBody(req);
      if (!body.title) return sendJSON(res, 400, { error: 'title 是必填字段' });
      const todo = {
        id: db.nextTodoId++,
        userId: user.id,
        title: body.title,
        completed: false,
      };
      db.todos.push(todo);
      return sendJSON(res, 201, todo);
    }

    // 404
    sendJSON(res, 404, { error: '接口不存在', path: pathname });
  } catch (err) {
    sendJSON(res, 500, { error: err.message });
  }
});

// ============================================
// 第二部分：实现 supertest 风格的测试工具
// ============================================

class TestRequest {
  constructor(server, method, url) {
    this.server = server;
    this.method = method;
    this.url = url;
    this.headers = {};
    this.bodyData = null;
    this.expectedStatus = null;
    this.expectedHeaders = {};
    this.customAssertions = [];
  }

  // 设置请求头
  set(key, value) {
    this.headers[key] = value;
    return this;
  }

  // 发送 JSON body
  send(data) {
    this.bodyData = JSON.stringify(data);
    this.headers['Content-Type'] = 'application/json';
    return this;
  }

  // 设置 Bearer Token
  auth(token) {
    this.headers['Authorization'] = \`Bearer \${token}\`;
    return this;
  }

  // 期望状态码
  expect(arg1, arg2) {
    if (typeof arg1 === 'number') {
      this.expectedStatus = arg1;
      if (typeof arg2 === 'string') {
        // expect(status, headerValue) - 简化处理
      } else if (arg2 instanceof RegExp) {
        this.expectedHeaders['Content-Type'] = arg2;
      }
    } else if (typeof arg1 === 'string' && typeof arg2 === 'string') {
      this.expectedHeaders[arg1] = arg2;
    } else if (arg1 instanceof RegExp) {
      this.expectedHeaders['Content-Type'] = arg1;
    } else if (typeof arg1 === 'function') {
      this.customAssertions.push(arg1);
    }
    return this;
  }

  // 发送请求并返回 Promise
  then(resolve, reject) {
    return this._execute().then(resolve, reject);
  }

  // 内部执行方法
  _execute() {
    return new Promise((resolve, reject) => {
      // 使用 Node.js 内置的 http 向 server 发送请求
      // 关键：server 不需要 listen，我们通过 random port 监听
      const port = 20000 + Math.floor(Math.random() * 10000);
      const listener = this.server.listen(port, () => {
        const options = {
          hostname: '127.0.0.1',
          port: port,
          path: this.url,
          method: this.method,
          headers: {
            ...this.headers,
            'Content-Length': this.bodyData ? Buffer.byteLength(this.bodyData) : 0,
          },
        };

        const req = http.request(options, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => {
            listener.close(); // 关闭服务器

            // 解析响应
            const response = {
              status: res.statusCode,
              statusCode: res.statusCode,
              headers: res.headers,
              text: body,
              body: null,
            };

            // 尝试解析 JSON
            try {
              if (body && res.headers['content-type']?.includes('json')) {
                response.body = JSON.parse(body);
              }
            } catch (e) {
              // 解析失败，body 保持 null
            }

            // 执行断言
            try {
              this._runAssertions(response);
              resolve(response);
            } catch (err) {
              reject(err);
            }
          });
        });

        req.on('error', (err) => {
          listener.close();
          reject(err);
        });

        if (this.bodyData) {
          req.write(this.bodyData);
        }
        req.end();
      });

      listener.on('error', reject);
    });
  }

  // 运行所有断言
  _runAssertions(res) {
    // 检查状态码
    if (this.expectedStatus !== null && res.statusCode !== this.expectedStatus) {
      throw new Error(
        \`状态码断言失败：期望 \${this.expectedStatus}，实际 \${res.statusCode}\\n\` +
        \`响应体：\${res.text}\`
      );
    }

    // 检查响应头
    for (const [key, expected] of Object.entries(this.expectedHeaders)) {
      const actual = res.headers[key.toLowerCase()];
      if (expected instanceof RegExp) {
        if (!expected.test(actual)) {
          throw new Error(\`响应头 \${key} 断言失败：期望匹配 \${expected}，实际 \${actual}\`);
        }
      } else if (actual !== expected) {
        throw new Error(\`响应头 \${key} 断言失败：期望 \${expected}，实际 \${actual}\`);
      }
    }

    // 自定义断言函数
    for (const assertFn of this.customAssertions) {
      assertFn(res);
    }
  }
}

// 请求构造器
function request(server) {
  return {
    get: (url) => new TestRequest(server, 'GET', url),
    post: (url) => new TestRequest(server, 'POST', url),
    put: (url) => new TestRequest(server, 'PUT', url),
    delete: (url) => new TestRequest(server, 'DELETE', url),
  };
}

// ============================================
// 第三部分：简单的 expect 断言库
// ============================================

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(\`期望 \${JSON.stringify(expected)}，实际 \${JSON.stringify(actual)}\`);
      }
    },
    toEqual(expected) {
      const actualStr = JSON.stringify(actual);
      const expectedStr = JSON.stringify(expected);
      if (actualStr !== expectedStr) {
        throw new Error(\`期望等于 \${expectedStr}，实际 \${actualStr}\`);
      }
    },
    toBeTruthy() {
      if (!actual) throw new Error(\`期望真值，实际 \${actual}\`);
    },
    toBeFalsy() {
      if (actual) throw new Error(\`期望假值，实际 \${actual}\`);
    },
    toContain(item) {
      if (Array.isArray(actual)) {
        if (!actual.includes(item)) throw new Error(\`数组期望包含 \${item}\`);
      } else if (typeof actual === 'string') {
        if (!actual.includes(item)) throw new Error(\`字符串期望包含 \${item}\`);
      }
    },
    toHaveLength(length) {
      if (actual.length !== length) {
        throw new Error(\`期望长度 \${length}，实际 \${actual.length}\`);
      }
    },
    toBeGreaterThan(n) {
      if (!(actual > n)) throw new Error(\`期望 \${actual} > \${n}\`);
    },
    toMatch(regex) {
      if (!regex.test(actual)) throw new Error(\`期望 \${actual} 匹配 \${regex}\`);
    },
    get not() {
      return {
        toBe: (expected) => {
          if (actual === expected) throw new Error(\`期望不等于 \${expected}\`);
        },
        toBeNull: () => {
          if (actual === null) throw new Error('期望不为 null');
        },
      };
    },
    toBeNull() {
      if (actual !== null) throw new Error(\`期望 null，实际 \${actual}\`);
    },
    toBeDefined() {
      if (actual === undefined) throw new Error('期望已定义');
    },
    toHaveProperty(key) {
      if (actual === null || typeof actual !== 'object') {
        throw new Error(\`期望对象有属性 \${key}，但不是对象\`);
      }
      if (!(key in actual)) {
        throw new Error(\`期望对象有属性 \${key}\`);
      }
    },
  };
}

// ============================================
// 第四部分：测试运行器
// ============================================

let passed = 0;
let failed = 0;
const failures = [];

async function describe(name, fn) {
  console.log(\`\\n📦 \${name}\`);
  await fn();
}

async function it(name, fn) {
  try {
    await fn();
    passed++;
    console.log(\`  ✅ \${name}\`);
  } catch (err) {
    failed++;
    failures.push({ name, error: err.message });
    console.log(\`  ❌ \${name}\`);
    console.log(\`     \${err.message.split('\\n')[0]}\`);
  }
}

// ============================================
// 第五部分：编写并运行接口测试用例
// ============================================

const api = request(app);

async function runAPITests() {
  console.log('========================================');
  console.log('  接口测试开始运行');
  console.log('========================================');

  // --- 健康检查测试 ---
  await describe('GET /health - 健康检查', () => {
    it('应该返回 200 和 ok 状态', async () => {
      const res = await api.get('/health').expect(200);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body).toHaveProperty('timestamp');
    });

    it('应该返回 JSON 格式', async () => {
      const res = await api.get('/health').expect(200);
      expect(res.headers['content-type']).toMatch(/json/);
    });
  });

  // --- 登录接口测试 ---
  await describe('POST /auth/login - 登录接口', () => {
    it('正确的用户名密码应该登录成功', async () => {
      const res = await api.post('/auth/login')
        .send({ username: 'admin', password: '123456' })
        .expect(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.name).toBe('张三');
    });

    it('错误的密码应该返回 401', async () => {
      const res = await api.post('/auth/login')
        .send({ username: 'admin', password: 'wrong' });
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/错误/);
    });

    it('缺少密码字段应该返回 401', async () => {
      const res = await api.post('/auth/login')
        .send({ username: 'admin' });
      expect(res.status).toBe(401);
    });
  });

  // --- 认证测试 ---
  await describe('认证中间件', () => {
    it('未登录访问受保护接口返回 401', async () => {
      const res = await api.get('/api/users');
      expect(res.status).toBe(401);
    });

    it('无效 Token 返回 401', async () => {
      const res = await api.get('/api/users')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });
  });

  // --- 用户列表测试 ---
  await describe('GET /api/users - 用户列表', () => {
    it('管理员登录后可以获取用户列表', async () => {
      const res = await api.get('/api/users')
        .auth('token-admin-123')
        .expect(200);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBeTruthy();
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.pagination).toBeDefined();
    });

    it('普通用户也可以查看用户列表', async () => {
      const res = await api.get('/api/users')
        .auth('token-user-456')
        .expect(200);
      expect(res.body.data).toBeDefined();
    });
  });

  // --- 获取单个用户测试 ---
  await describe('GET /api/users/:id - 获取单个用户', () => {
    it('应该返回存在的用户信息', async () => {
      const res = await api.get('/api/users/1')
        .auth('token-admin-123')
        .expect(200);
      expect(res.body.name).toBe('张三');
      expect(res.body.email).toBe('zhangsan@example.com');
    });

    it('访问不存在的用户返回 404', async () => {
      const res = await api.get('/api/users/999')
        .auth('token-admin-123');
      expect(res.status).toBe(404);
    });
  });

  // --- 创建用户测试 ---
  await describe('POST /api/users - 创建用户', () => {
    it('管理员可以创建用户', async () => {
      const newUser = { name: '新用户', email: \`new\${Date.now()}@example.com\`, age: 25 };
      const res = await api.post('/api/users')
        .auth('token-admin-123')
        .send(newUser)
        .expect(201);
      expect(res.body.name).toBe(newUser.name);
      expect(res.body.id).toBeDefined();
    });

    it('普通用户不能创建用户（返回 403）', async () => {
      const res = await api.post('/api/users')
        .auth('token-user-456')
        .send({ name: '测试', email: 'test@test.com' });
      expect(res.status).toBe(403);
    });

    it('缺少必填字段返回 400', async () => {
      const res = await api.post('/api/users')
        .auth('token-admin-123')
        .send({ name: '只有名字' });
      expect(res.status).toBe(400);
    });

    it('邮箱格式错误返回 400', async () => {
      const res = await api.post('/api/users')
        .auth('token-admin-123')
        .send({ name: '测试', email: 'not-an-email' });
      expect(res.status).toBe(400);
    });
  });

  // --- 更新用户测试 ---
  await describe('PUT /api/users/:id - 更新用户', () => {
    it('用户可以更新自己的信息', async () => {
      const res = await api.put('/api/users/2')
        .auth('token-user-456')
        .send({ age: 31 })
        .expect(200);
      expect(res.body.age).toBe(31);
    });

    it('用户不能更新别人的信息', async () => {
      const res = await api.put('/api/users/1')
        .auth('token-user-456')
        .send({ name: 'hacker' });
      expect(res.status).toBe(403);
    });

    it('管理员可以更新任何人的信息', async () => {
      const res = await api.put('/api/users/2')
        .auth('token-admin-123')
        .send({ name: '李四更新' })
        .expect(200);
      expect(res.body.name).toBe('李四更新');
    });
  });

  // --- Todo 接口测试 ---
  await describe('GET /api/todos - Todo 列表', () => {
    it('登录用户可以获取自己的 todos', async () => {
      const res = await api.get('/api/todos')
        .auth('token-admin-123')
        .expect(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      // 张三应该能看到自己的 todos
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('可以按完成状态过滤', async () => {
      const res = await api.get('/api/todos?completed=true')
        .auth('token-admin-123')
        .expect(200);
      res.body.forEach(t => expect(t.completed).toBeTruthy());
    });
  });

  await describe('POST /api/todos - 创建 Todo', () => {
    it('可以创建新 todo', async () => {
      const res = await api.post('/api/todos')
        .auth('token-admin-123')
        .send({ title: '新的任务' })
        .expect(201);
      expect(res.body.title).toBe('新的任务');
      expect(res.body.completed).toBeFalsy();
    });

    it('缺少 title 返回 400', async () => {
      const res = await api.post('/api/todos')
        .auth('token-admin-123')
        .send({});
      expect(res.status).toBe(400);
    });
  });

  // --- 404 测试 ---
  await describe('错误路径', () => {
    it('访问不存在的接口返回 404', async () => {
      const res = await api.get('/api/not-exist')
        .auth('token-admin-123');
      expect(res.status).toBe(404);
    });
  });

  // --- 测试结果汇总 ---
  console.log('\\n========================================');
  console.log(\`测试结果：\${passed} 通过，\${failed} 失败\`);
  if (failures.length > 0) {
    console.log('\\n失败详情：');
    failures.forEach(f => {
      console.log(\`  ❌ \${f.name}\`);
      console.log(\`     \${f.error}\`);
    });
  }
  console.log(failed === 0 ? '🎉 所有接口测试通过！' : '❌ 有测试失败');
  console.log('========================================\\n');
}

// 运行测试
runAPITests().catch(console.error);
`,
  },
];


