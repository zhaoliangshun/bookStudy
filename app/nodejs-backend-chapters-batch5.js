export const chapters = [
  {
    id: "nb-mysql",
    group: "第三部分：数据库实战",
    icon: "🐬",
    title: "MySQL数据库操作：mysql2驱动",
    content: `# MySQL数据库操作：mysql2驱动

MySQL是世界上最流行的开源关系型数据库之一，在Node.js后端开发中被广泛使用。本章我们学习使用\`mysql2\`驱动来操作MySQL数据库，这是一个性能优秀、支持Promise API的现代MySQL客户端。

---

## 一、为什么选择mysql2？

Node.js生态中有多个MySQL驱动，\`mysql2\`是其中的佼佼者：

### ✅ mysql2的优势

1. **支持Promise API**：可以使用async/await，告别回调地狱
2. **更高性能**：比mysql包快2-3倍
3. **预处理语句**：原生支持Prepared Statement，有效防止SQL注入
4. **连接池**：内置连接池，性能更好
5. **支持MySQL 8.0新特性**：如caching_sha2_password认证
6. **二进制协议**：Prepared Statements使用二进制协议，更高效

---

## 二、安装与配置

### 1. 安装mysql2

\`\`\`bash
npm install mysql2
\`\`\`

### 2. 准备MySQL环境

在开始之前，请确保你的机器上已经安装了MySQL服务：
- macOS: \`brew install mysql\`
- Windows: 下载MySQL Installer
- Linux: \`sudo apt install mysql-server\`

或者使用Docker快速启动一个MySQL容器：
\`\`\`bash
docker run -d --name mysql-demo -e MYSQL_ROOT_PASSWORD=123456 -p 3306:3306 mysql:8.0
\`\`\`

---

## 三、基础连接方式

### 1. 创建连接

mysql2支持两种连接方式：
- 普通连接（createConnection）：每次请求创建新连接，用完关闭
- 连接池（createPool）：预先创建一批连接，复用连接，性能更好（**推荐生产环境使用**）

### 2. Promise版本

我们推荐使用\`mysql2/promise\`，它提供了Promise API，可以配合async/await使用，代码更简洁易读。

---

## 四、CRUD操作详解

CRUD是数据库操作的基础：
- **C**reate（创建）：INSERT语句
- **R**ead（读取）：SELECT语句
- **U**pdate（更新）：UPDATE语句
- **D**elete（删除）：DELETE语句

---

## 五、预处理语句（Prepared Statements）：防SQL注入

### 什么是SQL注入？

SQL注入是一种常见的网络攻击方式，攻击者通过在输入参数中插入恶意SQL代码，从而执行非授权的数据库操作。

**危险示例（不要这样写！）：**
\`\`\`javascript
// ❌ 危险！字符串拼接导致SQL注入
const sql = \`SELECT * FROM users WHERE username = '\${username}' AND password = '\${password}'\`;
// 如果用户输入 username: ' OR 1=1 -- ，密码随意，就能登录成功！
\`\`\`

### 使用预处理语句防止SQL注入

预处理语句的原理是：SQL模板和参数分开传输，MySQL先编译SQL模板，然后再把参数传进去执行。参数不会被当作SQL代码解析，从根本上防止SQL注入。

mysql2中使用\`?\`作为占位符：
\`\`\`javascript
// ✅ 安全！使用?占位符
const [rows] = await connection.execute(
  'SELECT * FROM users WHERE username = ? AND password = ?',
  [username, password]  // 参数数组，按顺序对应?
);
\`\`\`

---

## 六、连接池（Connection Pool）

### 为什么需要连接池？

每次创建和销毁数据库连接都是有开销的（TCP三次握手、MySQL认证等）。连接池的原理是：
1. 应用启动时预先创建N个数据库连接，放在"池"里
2. 需要操作数据库时，从池中取一个空闲连接
3. 使用完毕后，把连接放回池中，而不是关闭
4. 连接复用，大大提升性能

### 连接池配置参数

- **host**: 数据库主机地址
- **port**: 端口（默认3306）
- **user**: 用户名
- **password**: 密码
- **database**: 数据库名
- **waitForConnections**: 连接满了是否等待（默认true）
- **connectionLimit**: 最大连接数（默认10）
- **queueLimit**: 排队等待的请求数限制（默认0，不限制）

---

## 七、本章代码Demo说明

本章的代码示例包含：
1. 连接池配置与初始化
2. 创建数据库和表
3. 完整的CRUD操作
4. 预处理语句的使用演示
5. SQL注入攻击演示与防护
6. 批量插入
7. 事务基础
8. 连接池优雅关闭

**运行前准备**：
- 确保MySQL服务运行在localhost:3306
- 用户名root，密码123456（或修改代码中的配置）
- 如果密码不同，请修改DB_CONFIG中的password字段
`,
    code: `// ============================================
// MySQL数据库操作：mysql2驱动完整示例
// 安装依赖：npm install mysql2
// ============================================

// 导入mysql2的Promise版本
const mysql = require('mysql2/promise');

// ============ 数据库配置 ============
// 实际项目中应该从环境变量读取，不要硬编码！
const DB_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '123456', // 修改为你的MySQL密码
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// ============ 主函数 ============
async function main() {
  let pool;
  
  try {
    console.log('========================================');
    console.log('  🐬 MySQL + mysql2 驱动演示');
    console.log('========================================\\n');

    // ============ 1. 创建连接池 ============
    console.log('📦 步骤1：创建数据库连接池...');
    pool = mysql.createPool(DB_CONFIG);
    console.log('✅ 连接池创建成功\\n');

    // ============ 2. 创建测试数据库 ============
    console.log('🗄️  步骤2：创建测试数据库...');
    await pool.query('CREATE DATABASE IF NOT EXISTS demo_mysql');
    await pool.query('USE demo_mysql');
    console.log('✅ 数据库 demo_mysql 准备就绪\\n');

    // ============ 3. 创建用户表 ============
    console.log('📋 步骤3：创建users表...');
    const createTableSQL = \`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
        username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
        email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
        password VARCHAR(100) NOT NULL COMMENT '密码（实际项目存储hash值）',
        age INT COMMENT '年龄',
        status TINYINT DEFAULT 1 COMMENT '状态：1=正常，0=禁用',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表'
    \`;
    await pool.query(createTableSQL);
    console.log('✅ users表创建成功\\n');

    // ============ 4. CREATE：插入数据 ============
    console.log('➕ 步骤4：插入数据（Create）');
    
    // 4.1 插入单条数据 - 使用?占位符（预处理语句）
    const [insertResult1] = await pool.execute(
      'INSERT INTO users (username, email, password, age) VALUES (?, ?, ?, ?)',
      ['zhangsan', 'zhangsan@example.com', 'hashed_password_123', 25]
    );
    console.log('  插入用户张三，ID:', insertResult1.insertId);

    // 4.2 插入另一条
    const [insertResult2] = await pool.execute(
      'INSERT INTO users (username, email, password, age) VALUES (?, ?, ?, ?)',
      ['lisi', 'lisi@example.com', 'hashed_password_456', 30]
    );
    console.log('  插入用户李四，ID:', insertResult2.insertId);

    // 4.3 批量插入
    const usersToInsert = [
      ['wangwu', 'wangwu@example.com', 'hashed_pwd_789', 28],
      ['zhaoliu', 'zhaoliu@example.com', 'hashed_pwd_abc', 35],
      ['sunqi', 'sunqi@example.com', 'hashed_pwd_def', 22]
    ];
    const [batchResult] = await pool.query(
      'INSERT INTO users (username, email, password, age) VALUES ?',
      [usersToInsert]
    );
    console.log('  批量插入用户数:', batchResult.affectedRows);
    console.log('');

    // ============ 5. READ：查询数据 ============
    console.log('🔍 步骤5：查询数据（Read）');

    // 5.1 查询所有用户
    const [allUsers] = await pool.query('SELECT id, username, email, age, status, created_at FROM users');
    console.log('  所有用户（共' + allUsers.length + '人）：');
    allUsers.forEach(u => {
      console.log(\`    ID:\${u.id} | \${u.username} | \${u.email} | \${u.age}岁 | 状态:\${u.status ? '正常' : '禁用'}\`);
    });

    // 5.2 按ID查询单条
    const [userById] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [insertResult1.insertId]
    );
    console.log('\\n  查询ID=' + insertResult1.insertId + '的用户：', userById[0]?.username);

    // 5.3 条件查询 + 排序 + 分页
    const [adultUsers] = await pool.execute(
      'SELECT id, username, age FROM users WHERE age >= ? ORDER BY age DESC LIMIT ? OFFSET ?',
      [25, 3, 0]
    );
    console.log('\\n  年龄>=25岁的用户（按年龄倒序，最多3条）：');
    adultUsers.forEach(u => {
      console.log(\`    \${u.username} - \${u.age}岁\`);
    });

    // 5.4 聚合查询
    const [stats] = await pool.query(
      'SELECT COUNT(*) as total, AVG(age) as avgAge, MIN(age) as minAge, MAX(age) as maxAge FROM users'
    );
    console.log('\\n  统计信息：');
    console.log(\`    总人数: \${stats[0].total}\`);
    console.log(\`    平均年龄: \${Math.round(stats[0].avgAge)}岁\`);
    console.log(\`    最小年龄: \${stats[0].minAge}岁\`);
    console.log(\`    最大年龄: \${stats[0].maxAge}岁\`);
    console.log('');

    // ============ 6. UPDATE：更新数据 ============
    console.log('✏️  步骤6：更新数据（Update）');
    
    const [updateResult] = await pool.execute(
      'UPDATE users SET age = ?, email = ? WHERE username = ?',
      [26, 'zhangsan_new@example.com', 'zhangsan']
    );
    console.log('  更新张三信息，影响行数:', updateResult.affectedRows);

    // 验证更新
    const [updatedUser] = await pool.execute(
      'SELECT username, email, age FROM users WHERE username = ?',
      ['zhangsan']
    );
    console.log('  更新后：', updatedUser[0]);
    console.log('');

    // ============ 7. DELETE：删除数据 ============
    console.log('🗑️  步骤7：删除数据（Delete）');
    
    const [deleteResult] = await pool.execute(
      'DELETE FROM users WHERE username = ?',
      ['sunqi']
    );
    console.log('  删除用户孙七，影响行数:', deleteResult.affectedRows);

    // 验证删除
    const [deletedCheck] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      ['sunqi']
    );
    console.log('  孙七还在吗？', deletedCheck.length > 0 ? '在（有问题）' : '已删除');
    console.log('');

    // ============ 8. SQL注入演示与防护 ============
    console.log('🛡️  步骤8：SQL注入防护演示');
    
    // 8.1 ❌ 危险的字符串拼接方式（千万别用！）
    const maliciousInput = "' OR '1'='1";
    const dangerousSQL = \`SELECT * FROM users WHERE username = '\${maliciousInput}'\`;
    console.log('  ❌ 危险SQL（字符串拼接）：', dangerousSQL);
    
    const [hackedResult] = await pool.query(dangerousSQL);
    console.log('  ⚠️  注入攻击结果：返回了' + hackedResult.length + '条记录！（不应该这样）');

    // 8.2 ✅ 安全的预处理语句方式
    console.log('  ✅ 使用预处理语句（?占位符）：');
    const [safeResult] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [maliciousInput]
    );
    console.log('  🛡️  安全查询结果：返回' + safeResult.length + '条记录（正确，没有这个用户）');
    console.log('  💡 结论：永远不要用字符串拼接SQL，一定要用?占位符！');
    console.log('');

    // ============ 9. 事务示例 ============
    console.log('🔄 步骤9：事务处理');
    console.log('  事务保证多个操作要么全部成功，要么全部失败回滚');
    
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      console.log('  开始事务...');

      // 在事务中执行两个操作
      await conn.execute(
        'INSERT INTO users (username, email, password, age) VALUES (?, ?, ?, ?)',
        ['transaction_test1', 'tx1@test.com', 'pwd', 20]
      );
      console.log('  插入测试用户1成功');

      await conn.execute(
        'INSERT INTO users (username, email, password, age) VALUES (?, ?, ?, ?)',
        ['transaction_test2', 'tx2@test.com', 'pwd', 21]
      );
      console.log('  插入测试用户2成功');

      await conn.commit();
      console.log('  ✅ 事务提交成功！两个用户都插入了');
    } catch (txErr) {
      await conn.rollback();
      console.log('  ❌ 事务出错，已回滚:', txErr.message);
    } finally {
      conn.release();
    }
    console.log('');

    // ============ 10. 清理测试数据 ============
    console.log('🧹 步骤10：清理测试数据...');
    await pool.query('DROP TABLE IF EXISTS users');
    await pool.query('DROP DATABASE IF EXISTS demo_mysql');
    console.log('✅ 测试数据已清理');
    console.log('');

    console.log('========================================');
    console.log('  🎉 MySQL演示完成！');
    console.log('========================================');
    console.log('');
    console.log('💡 要点总结：');
    console.log('   1. 使用mysql2/promise配合async/await');
    console.log('   2. 生产环境用连接池（createPool）');
    console.log('   3. 永远用execute + ?占位符，防止SQL注入');
    console.log('   4. 批量操作可以提升性能');
    console.log('   5. 多步操作需要保证原子性时用事务');

  } catch (err) {
    console.error('\\n❌ 出错了:', err.message);
    console.error('错误码:', err.code);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 提示：请检查MySQL用户名密码是否正确');
    } else if (err.code === 'ECONNREFUSED') {
      console.log('💡 提示：MySQL服务是否启动？端口3306是否正确？');
    }
  } finally {
    // 关闭连接池
    if (pool) {
      await pool.end();
      console.log('\\n🔌 连接池已关闭');
    }
  }
}

// 运行主函数
main();

// 小练习：
// 1. 修改DB_CONFIG中的密码，运行代码连接你本地的MySQL
// 2. 尝试添加一个posts表，关联users表的user_id外键
// 3. 实现一个简单的用户登录验证函数（用预处理语句）
// 4. 试试在事务中故意制造一个错误，看是否会回滚
`
  },
  {
    id: "nb-mongodb",
    group: "第三部分：数据库实战",
    icon: "🍃",
    title: "MongoDB与Mongoose ODM",
    content: `# MongoDB与Mongoose ODM

MongoDB是流行的NoSQL文档数据库，数据以BSON（二进制JSON）格式存储，非常适合Node.js开发。Mongoose是MongoDB的ODM（Object Document Mapper），提供Schema验证、模型定义、中间件钩子等强大功能，让操作MongoDB更优雅。

---

## 一、MongoDB vs 关系型数据库

| 概念 | 关系型数据库（MySQL） | MongoDB |
|------|----------------------|---------|
| 数据库 | Database | Database |
| 表 | Table | Collection（集合） |
| 行 | Row | Document（文档） |
| 列 | Column | Field（字段） |
| 主键 | Primary Key | _id字段（自动生成） |
| 关联 | JOIN | 嵌套文档/引用（$lookup） |
| Schema | 固定Schema | 灵活Schema（通过Mongoose可强制Schema） |

### MongoDB适合的场景：
1. 数据结构不固定、经常变化
2. 日志、事件、社交关系等数据
3. 快速迭代的项目
4. 需要水平扩展（分片）的大数据场景

---

## 二、Mongoose核心概念

### 1. Schema（模式）
Schema定义了集合中文档的结构、字段类型、验证规则、默认值等。虽然MongoDB本身是Schema-less的，但在实际项目中使用Schema能保证数据一致性。

### 2. Model（模型）
Model是由Schema编译而来的构造器，通过Model可以对数据库进行增删改查操作。Model的每个实例代表一个文档。

### 3. Document（文档）
Model创建的实例就是Document，对应数据库中的一条记录。

---

## 三、安装与连接

### 1. 安装Mongoose
\`\`\`bash
npm install mongoose
\`\`\`

### 2. 准备MongoDB环境
- 本地安装MongoDB Community Server
- 或使用Docker快速启动：
\`\`\`bash
docker run -d --name mongo-demo -p 27017:27017 mongo:6.0
\`\`\`
- 或使用MongoDB Atlas云服务（免费）

---

## 四、Schema类型与选项

### 常用字段类型
- **String**: 字符串
- **Number**: 数字
- **Boolean**: 布尔值
- **Date**: 日期
- **Buffer**: 二进制数据
- **ObjectId**: 主键ID，引用其他文档
- **Array**: 数组
- **Map**: 键值对
- **Schema.Types.Mixed**: 任意类型

### 常用字段选项
- **type**: 字段类型
- **required**: 是否必填
- **default**: 默认值
- **unique**: 是否唯一（会创建索引）
- **trim**: 字符串是否去除首尾空格
- **minlength/maxlength**: 字符串长度限制
- **min/max**: 数字范围限制
- **enum**: 枚举值限制
- **validate**: 自定义验证器

---

## 五、CRUD操作

Mongoose Model提供了丰富的方法：

### 创建文档
- \`Model.create(doc)\`: 创建一个或多个文档
- \`new Model(doc)\` + \`doc.save()\`: 先创建实例再保存

### 查询文档
- \`Model.find(filter)\`: 查询多个文档
- \`Model.findOne(filter)\`: 查询单个文档
- \`Model.findById(id)\`: 按ID查询
- \`Model.findOneAndUpdate()\`: 查询并更新
- \`Model.findByIdAndUpdate()\`: 按ID查询并更新
- \`Model.countDocuments(filter)\`: 统计数量
- \`Model.where()\`: 链式查询构建器

### 更新文档
- \`Model.updateOne(filter, update)\`: 更新一个
- \`Model.updateMany(filter, update)\`: 更新多个
- \`Model.findByIdAndUpdate()\`: 按ID更新

### 删除文档
- \`Model.deleteOne(filter)\`: 删除一个
- \`Model.deleteMany(filter)\`: 删除多个
- \`Model.findByIdAndDelete()\`: 按ID删除

---

## 六、中间件（钩子）

Mongoose中间件（也叫pre/post钩子）让你可以在执行某些操作前后执行自定义逻辑，类似Koa/Express的中间件。

### 支持的中间件类型
- **文档中间件**: init, validate, save, remove
- **查询中间件**: find, findOne, findOneAndUpdate等
- **聚合中间件**: aggregate
- **模型中间件**: insertMany

### 使用场景
- pre('save'): 保存前自动加密密码
- pre('save'): 更新updatedAt时间戳
- post('save'): 保存后发送通知邮件
- pre('find'): 自动过滤软删除的数据
- pre('remove'): 删除前清理关联数据

---

## 七、本章代码Demo说明

本章代码演示了：
1. Mongoose连接数据库
2. Schema定义（包含各种类型和验证）
3. Model创建
4. CRUD完整操作
5. 常用查询方法
6. pre/post中间件钩子
7. 数据验证
8. 虚拟属性
9. 实例方法和静态方法

**运行前准备**：
- 确保MongoDB运行在localhost:27017
- 或修改MONGODB_URI为你的MongoDB连接字符串
`,
    code: `// ============================================
// MongoDB与Mongoose ODM完整示例
// 安装依赖：npm install mongoose
// ============================================

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ============ 数据库连接配置 ============
const MONGODB_URI = 'mongodb://localhost:27017/demo_mongoose';

// ============ 主函数 ============
async function main() {
  try {
    console.log('========================================');
    console.log('  🍃 MongoDB + Mongoose ODM 演示');
    console.log('========================================\\n');

    // ============ 1. 连接数据库 ============
    console.log('🔌 步骤1：连接MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 连接成功！MongoDB版本:', mongoose.version);
    console.log('  数据库:', mongoose.connection.name);
    console.log('');

    // ============ 2. 定义Schema ============
    console.log('📋 步骤2：定义User Schema...');
    
    const userSchema = new Schema({
      username: {
        type: String,
        required: [true, '用户名不能为空'],
        unique: true,
        trim: true,
        minlength: [3, '用户名至少3个字符'],
        maxlength: [20, '用户名最多20个字符']
      },
      email: {
        type: String,
        required: [true, '邮箱不能为空'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\\S+@\\S+\\.\\S+$/, '请输入有效的邮箱地址']
      },
      password: {
        type: String,
        required: [true, '密码不能为空'],
        minlength: [6, '密码至少6位']
      },
      age: {
        type: Number,
        min: [0, '年龄不能为负数'],
        max: [120, '年龄不能超过120岁']
      },
      role: {
        type: String,
        enum: ['user', 'admin', 'guest'],
        default: 'user'
      },
      isActive: {
        type: Boolean,
        default: true
      },
      // 嵌套文档
      profile: {
        nickname: String,
        avatar: String,
        bio: String
      },
      // 数组字段
      tags: [String],
      // 最后登录时间
      lastLoginAt: Date
    }, {
      // 选项：自动添加createdAt和updatedAt字段
      timestamps: true
    });

    // ============ 3. 虚拟属性 ============
    console.log('✨ 步骤3：添加虚拟属性和方法...');
    
    // 虚拟属性：不会存储到数据库，计算得出
    userSchema.virtual('isAdmin').get(function() {
      return this.role === 'admin';
    });

    // 实例方法：文档实例可以调用
    userSchema.methods.info = function() {
      return \`\${this.username} <\${this.email}> [\${this.role}]\`;
    };

    // 静态方法：Model直接调用
    userSchema.statics.findByEmail = function(email) {
      return this.findOne({ email: email.toLowerCase() });
    };

    // ============ 4. 中间件（钩子） ============
    console.log('🪝  步骤4：注册中间件钩子...');
    
    // pre('save')钩子：保存前执行
    // 注意：不能用箭头函数，因为需要this指向文档
    userSchema.pre('save', function(next) {
      console.log('  [pre save钩子] 准备保存用户:', this.username);
      // 模拟密码加密（实际项目用bcrypt）
      if (this.isModified('password')) {
        this.password = 'hashed_' + this.password;
        console.log('  [pre save钩子] 密码已加密');
      }
      next();
    });

    // post('save')钩子：保存后执行
    userSchema.post('save', function(doc) {
      console.log('  [post save钩子] 用户保存成功，ID:', doc._id);
    });

    // pre('find')钩子：查询前自动过滤已禁用用户
    userSchema.pre(/^find/, function(next) {
      // this指向Query对象
      // 注释掉下面这行可以看到被禁用的用户
      // this.where({ isActive: true });
      next();
    });

    console.log('✅ Schema、虚拟属性、中间件已准备好\\n');

    // ============ 5. 创建Model ============
    // 注意：Mongoose会自动把模型名转小写复数作为集合名
    // User -> users集合
    const User = mongoose.model('User', userSchema);
    console.log('✅ Model已创建：User -> users集合\\n');

    // ============ 6. CREATE：创建文档 ============
    console.log('➕ 步骤6：创建文档（Create）');

    // 方式1：create方法
    const user1 = await User.create({
      username: 'zhangsan',
      email: 'ZHANGSAN@example.com', // 会自动转小写
      password: '123456', // pre save钩子会加密
      age: 25,
      profile: {
        nickname: '张三',
        bio: '一个普通的程序员'
      },
      tags: ['nodejs', 'mongodb', 'backend']
    });
    console.log('  创建用户张三:', user1.info());
    console.log('  是管理员吗？', user1.isAdmin);
    console.log('  加密后的密码:', user1.password);

    // 方式2：new Model + save()
    const user2 = new User({
      username: 'lisi',
      email: 'lisi@example.com',
      password: 'abcdef',
      age: 30,
      role: 'admin',
      profile: {
        nickname: '李四',
        bio: '系统管理员'
      },
      tags: ['admin', 'devops']
    });
    await user2.save();
    console.log('  创建用户李四:', user2.info());
    console.log('  是管理员吗？', user2.isAdmin);

    // 批量创建
    await User.create([
      { username: 'wangwu', email: 'wangwu@example.com', password: '111222', age: 28, tags: ['frontend'] },
      { username: 'zhaoliu', email: 'zhaoliu@example.com', password: '333444', age: 35, isActive: false },
      { username: 'sunqi', email: 'sunqi@example.com', password: '555666', age: 22, tags: ['fullstack', 'nodejs'] }
    ]);
    console.log('  批量创建3个用户');
    console.log('');

    // ============ 7. READ：查询文档 ============
    console.log('🔍 步骤7：查询文档（Read）');

    // 7.1 查询所有用户（只返回指定字段）
    const allUsers = await User.find().select('username email role age');
    console.log('  所有用户（共' + allUsers.length + '人）：');
    allUsers.forEach(u => {
      console.log(\`    \${u.username} | \${u.email} | \${u.role} | \${u.age}岁\`);
    });

    // 7.2 查询单个用户
    const zhangsan = await User.findByEmail('zhangsan@example.com');
    console.log('\\n  按邮箱查询张三:', zhangsan?.info());

    // 7.3 条件查询
    const youngUsers = await User.find({ age: { $lt: 30 } }).select('username age');
    console.log('\\n  年龄小于30岁的用户：');
    youngUsers.forEach(u => console.log(\`    \${u.username} - \${u.age}岁\`));

    // 7.4 包含某个标签（数组查询）
    const nodejsUsers = await User.find({ tags: 'nodejs' }).select('username tags');
    console.log('\\n  打了nodejs标签的用户：');
    nodejsUsers.forEach(u => console.log(\`    \${u.username} - 标签: \${u.tags.join(', ')}\`));

    // 7.5 链式查询构建器
    const adminUsers = await User
      .find()
      .where('role').equals('admin')
      .where('isActive').equals(true)
      .select('username email role')
      .sort({ createdAt: -1 })
      .limit(10);
    console.log('\\n  管理员用户（倒序）：');
    adminUsers.forEach(u => console.log('    ' + u.info()));

    // 7.6 统计
    const total = await User.countDocuments();
    const activeCount = await User.countDocuments({ isActive: true });
    console.log(\`\\n  统计：共\${total}个用户，其中\${activeCount}个活跃\`);
    console.log('');

    // ============ 8. UPDATE：更新文档 ============
    console.log('✏️  步骤8：更新文档（Update）');

    // 更新张三
    const updatedZhangsan = await User.findByIdAndUpdate(
      user1._id,
      {
        age: 26,
        'profile.bio': '资深Node.js开发工程师',
        $push: { tags: 'mongoose' }, // 向数组添加元素
        lastLoginAt: new Date()
      },
      { new: true, runValidators: true } // new: true返回更新后的文档
    );
    console.log('  更新张三信息：');
    console.log(\`    年龄: \${updatedZhangsan.age}\`);
    console.log(\`    简介: \${updatedZhangsan.profile.bio}\`);
    console.log(\`    标签: \${updatedZhangsan.tags.join(', ')}\`);
    console.log(\`    最后登录: \${updatedZhangsan.lastLoginAt?.toLocaleString('zh-CN')}\`);
    console.log('');

    // ============ 9. DELETE：删除文档 ============
    console.log('🗑️  步骤9：删除文档（Delete）');

    // 删除王五
    const deleteResult = await User.deleteOne({ username: 'wangwu' });
    console.log('  删除王五，影响行数:', deleteResult.deletedCount);

    const wangwuExists = await User.exists({ username: 'wangwu' });
    console.log('  王五还存在吗？', wangwuExists ? '是（有问题）' : '已删除');
    console.log('');

    // ============ 10. 数据验证演示 ============
    console.log('✅ 步骤10：数据验证演示');
    
    try {
      await User.create({
        username: 'ab', // 太短，会验证失败
        email: 'invalid-email', // 邮箱格式不对
        password: '123' // 密码太短
      });
    } catch (validationErr) {
      console.log('  ⚠️  验证失败（这是预期的）：');
      for (const field in validationErr.errors) {
        console.log(\`    - \${field}: \${validationErr.errors[field].message}\`);
      }
    }
    console.log('');

    // ============ 11. 清理测试数据 ============
    console.log('🧹 步骤11：清理测试数据...');
    await User.deleteMany({});
    // 也可以删除集合：await mongoose.connection.dropCollection('users');
    // 或删除数据库：await mongoose.connection.dropDatabase();
    console.log('✅ 测试数据已清理');
    console.log('');

    console.log('========================================');
    console.log('  🎉 MongoDB + Mongoose演示完成！');
    console.log('========================================');
    console.log('');
    console.log('💡 要点总结：');
    console.log('   1. Schema定义数据结构和验证规则');
    console.log('   2. Model是操作数据库的入口');
    console.log('   3. 利用pre/post钩子处理通用逻辑（如密码加密）');
    console.log('   4. 虚拟属性、实例方法、静态方法让代码更优雅');
    console.log('   5. 灵活使用各种查询操作符和链式调用');

  } catch (err) {
    console.error('\\n❌ 出错了:', err.message);
    if (err.name === 'MongoServerSelectionError') {
      console.log('💡 提示：MongoDB服务是否启动？端口27017是否可访问？');
    } else if (err.code === 11000) {
      console.log('💡 提示：重复键错误，唯一字段冲突');
    }
  } finally {
    // 关闭连接
    await mongoose.disconnect();
    console.log('\\n🔌 数据库连接已关闭');
  }
}

// 运行主函数
main();

// 小练习：
// 1. 添加一个Post集合，包含title、content、author（引用User的_id）
// 2. 实现用户注册/登录的基本逻辑（密码加密用bcryptjs）
// 3. 给Post添加pre('save')钩子，自动生成摘要
// 4. 使用populate()方法查询文章时关联作者信息
`
  },
  {
    id: "nb-orm",
    group: "第三部分：数据库实战",
    icon: "🗃️",
    title: "Sequelize ORM与数据库事务",
    content: `# Sequelize ORM与数据库事务

Sequelize是Node.js生态中最流行的关系型数据库ORM（Object-Relational Mapper）之一，支持MySQL、PostgreSQL、SQLite、SQL Server等多种数据库。使用ORM可以让你用面向对象的方式操作数据库，不用手写大量SQL语句，还能避免SQL注入，提升开发效率。

---

## 一、什么是ORM？

ORM（对象关系映射）是一种程序技术，用于实现面向对象编程语言里不同类型系统的数据之间的转换。简单来说：
- **数据库表** → **Model类**
- **表记录** → **Model实例**
- **字段** → **类属性**
- **SQL操作** → **类方法/实例方法**

### 使用ORM的优缺点

| 优点 | 缺点 |
|------|------|
| 不用写大量重复SQL | 复杂查询可能需要写原始SQL |
| 面向对象编程，代码更易维护 | 需要学习ORM的API |
| 内置防SQL注入 | 极端性能场景可能不如手写SQL |
| 数据库迁移方便，切换数据库成本低 | 复杂关联查询容易产生性能问题（N+1） |
| Model方法可复用，代码组织更清晰 | 新手容易写出低效查询 |

---

## 二、安装与配置

### 1. 安装Sequelize和数据库驱动
\`\`\`bash
# 安装Sequelize核心
npm install sequelize

# 根据你使用的数据库安装对应的驱动
npm install mysql2    # MySQL
npm install pg pg-hstore  # PostgreSQL
npm install sqlite3   # SQLite
npm install tedious   # SQL Server
\`\`\`

### 2. 建立连接
Sequelize通过new Sequelize()创建连接实例，可以传入连接参数。

---

## 三、Model定义

Model代表数据库中的一张表，Sequelize提供两种定义Model的方式：
1. \`sequelize.define(modelName, attributes, options)\`
2. 继承Model类（ES6 Class方式）

### 常用字段类型
- **DataTypes.STRING**: VARCHAR(255)
- **DataTypes.STRING(100)**: VARCHAR(100)
- **DataTypes.TEXT**: TEXT（长文本）
- **DataTypes.INTEGER**: INT
- **DataTypes.BIGINT**: BIGINT
- **DataTypes.FLOAT/DOUBLE/DECIMAL**: 浮点数/精确小数
- **DataTypes.BOOLEAN**: TINYINT(1)
- **DataTypes.DATE**: DATETIME
- **DataTypes.ENUM('a', 'b')**: 枚举
- **DataTypes.JSON**: JSON列（MySQL支持）
- **DataTypes.UUID**: UUID

### 常用字段选项
- **type**: 字段类型
- **allowNull**: 是否允许NULL（默认true）
- **defaultValue**: 默认值
- **unique**: 是否唯一
- **primaryKey**: 是否主键
- **autoIncrement**: 是否自增
- **comment**: 字段注释
- **validate**: 验证规则

---

## 四、关联关系（Associations）

关系型数据库的核心是表与表之间的关系，Sequelize提供四种关联类型：

### 1. HasOne（一对一）
\`\`\`javascript
User.hasOne(Profile); // User有一个Profile
Profile.belongsTo(User); // Profile属于User
\`\`\`

### 2. BelongsTo（属于）
外键在源模型上。比如：Profile属于User，外键userId在profiles表。

### 3. HasMany（一对多）
\`\`\`javascript
User.hasMany(Post); // 一个用户有多篇文章
Post.belongsTo(User); // 文章属于用户
\`\`\`

### 4. BelongsToMany（多对多）
需要中间表（through表）。
\`\`\`javascript
Post.belongsToMany(Tag, { through: 'PostTags' });
Tag.belongsToMany(Post, { through: 'PostTags' });
\`\`\`

### 预加载（Eager Loading）
使用\`include\`选项在查询时同时查询关联数据，避免N+1查询问题：
\`\`\`javascript
const posts = await Post.findAll({
  include: [User, Tag] // 同时查出作者和标签
});
\`\`\`

---

## 五、数据库事务（Transaction）

### 什么是事务？

事务是数据库操作的最小工作单元，事务内的操作要么**全部成功执行**，要么**全部失败回滚**，保证数据一致性。

事务的ACID特性：
- **A**tomicity（原子性）：事务是不可分割的工作单位
- **C**onsistency（一致性）：事务前后数据完整性保持一致
- **I**solation（隔离性）：多个并发事务之间相互隔离
- **D**urability（持久性）：事务提交后对数据的修改是永久的

### Sequelize事务的两种使用方式

#### 1. 自动托管事务（推荐）
使用\`sequelize.transaction\`回调方式，如果回调抛出异常自动回滚，正常返回则自动提交。

#### 2. 手动控制事务
手动调用\`commit()\`和\`rollback()\`。

### 事务隔离级别
Sequelize支持标准的SQL隔离级别：
- **Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED**
- **Transaction.ISOLATION_LEVELS.READ_COMMITTED**（大多数数据库默认）
- **Transaction.ISOLATION_LEVELS.REPEATABLE_READ**（MySQL默认）
- **Transaction.ISOLATION_LEVELS.SERIALIZABLE**

---

## 六、常用查询方法

### 查询
- **Model.create()**: 创建记录
- **Model.findByPk(id)**: 按主键查询
- **Model.findOne(where)**: 查询单条
- **Model.findAll(where)**: 查询多条
- **Model.findOrCreate()**: 查询不存在则创建
- **Model.findAndCountAll()**: 分页查询，返回count和rows
- **Model.count()**: 统计数量
- **Model.sum/min/max()**: 聚合

### 更新/删除
- **Model.update()**: 更新
- **Model.destroy()**: 删除
- **instance.save()**: 保存实例修改
- **instance.destroy()**: 删除实例

### 操作符
Sequelize提供了Op操作符，代替SQL中的各种运算符：
- **Op.eq**: =
- **Op.ne**: !=
- **Op.gt/lt/gte/lte**: > < >= <=
- **Op.in/notIn**: IN/NOT IN
- **Op.like**: LIKE
- **Op.and/or**: AND/OR
- **Op.between**: BETWEEN

---

## 七、本章代码Demo说明

本章代码完整演示了：
1. Sequelize连接MySQL
2. Model定义（User, Post, Tag）
3. 各种关联关系（一对多、多对多）
4. 表自动创建（sync）
5. CRUD完整操作
6. Op操作符使用
7. 预加载（include）
8. 事务处理（经典的转账场景）
9. 分页查询

**运行前准备**：
- MySQL运行在localhost:3306
- 用户名root，密码123456（修改代码中配置）
- 不需要提前建库，Sequelize会自动创建
`,
    code: `// ============================================
// Sequelize ORM与数据库事务完整示例
// 安装依赖：npm install sequelize mysql2
// ============================================

const { Sequelize, DataTypes, Model, Op, Transaction } = require('sequelize');

// ============ 数据库配置 ============
const DB_CONFIG = {
  database: 'demo_sequelize',
  username: 'root',
  password: '123456', // 修改为你的MySQL密码
  host: 'localhost',
  port: 3306,
  dialect: 'mysql',
  logging: false, // 设置为console.log可以打印SQL语句
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

// ============ 主函数 ============
async function main() {
  let sequelize;
  
  try {
    console.log('========================================');
    console.log('  🗃️  Sequelize ORM 演示');
    console.log('========================================\\n');

    // ============ 1. 建立连接 ============
    console.log('🔌 步骤1：连接数据库...');
    sequelize = new Sequelize(DB_CONFIG);
    await sequelize.authenticate();
    console.log('✅ 连接成功！\\n');

    // ============ 2. 定义Model ============
    console.log('📋 步骤2：定义Model...');

    // 用户Model
    class User extends Model {}
    User.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: '用户名'
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        },
        comment: '邮箱'
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '密码hash'
      },
      balance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        comment: '账户余额（用于转账事务演示）'
      },
      age: {
        type: DataTypes.INTEGER,
        validate: {
          min: 0,
          max: 120
        }
      },
      role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    }, {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true // 自动添加createdAt和updatedAt
    });

    // 文章Model
    class Post extends Model {}
    Post.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('draft', 'published'),
        defaultValue: 'draft'
      },
      views: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    }, {
      sequelize,
      modelName: 'Post',
      tableName: 'posts',
      timestamps: true
    });

    // 标签Model
    class Tag extends Model {}
    Tag.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      }
    }, {
      sequelize,
      modelName: 'Tag',
      tableName: 'tags',
      timestamps: true
    });

    console.log('✅ Model定义完成\\n');

    // ============ 3. 定义关联关系 ============
    console.log('🔗 步骤3：定义关联关系...');

    // 一对多：User -> Post（一个用户有多篇文章）
    User.hasMany(Post, {
      foreignKey: 'userId',
      as: 'posts',
      onDelete: 'CASCADE' // 用户删除时，文章也删除
    });
    Post.belongsTo(User, {
      foreignKey: 'userId',
      as: 'author'
    });

    // 多对多：Post <-> Tag（文章和标签多对多）
    // 会自动创建中间表PostTags
    Post.belongsToMany(Tag, { through: 'PostTags', as: 'tags' });
    Tag.belongsToMany(Post, { through: 'PostTags', as: 'posts' });

    console.log('✅ 关联关系定义完成\\n');

    // ============ 4. 同步数据库（创建表） ============
    console.log('🔄 步骤4：同步数据库（创建表）...');
    // force: true 会先删除表再创建（开发用，生产别用！）
    await sequelize.sync({ force: true });
    console.log('✅ 表创建成功！\\n');

    // ============ 5. CREATE：创建数据 ============
    console.log('➕ 步骤5：创建数据（Create）');

    // 创建用户
    const user1 = await User.create({
      username: 'zhangsan',
      email: 'zhangsan@example.com',
      password: 'hashed_pwd_1',
      balance: 1000.00,
      age: 25
    });
    console.log('  创建用户张三，ID:', user1.id, '余额:', user1.balance);

    const user2 = await User.create({
      username: 'lisi',
      email: 'lisi@example.com',
      password: 'hashed_pwd_2',
      balance: 500.00,
      age: 30,
      role: 'admin'
    });
    console.log('  创建用户李四，ID:', user2.id, '余额:', user2.balance);

    // 批量创建用户
    await User.bulkCreate([
      { username: 'wangwu', email: 'wangwu@example.com', password: 'hashed_pwd_3', balance: 800, age: 28 },
      { username: 'zhaoliu', email: 'zhaoliu@example.com', password: 'hashed_pwd_4', balance: 300, age: 35 }
    ]);
    console.log('  批量创建2个用户');

    // 创建文章（关联用户）
    const post1 = await Post.create({
      title: 'Node.js入门教程',
      content: '这是一篇Node.js入门文章...',
      status: 'published',
      views: 100,
      userId: user1.id // 外键关联张三
    });
    const post2 = await Post.create({
      title: 'Sequelize ORM指南',
      content: 'Sequelize是一个优秀的Node.js ORM...',
      status: 'published',
      views: 200,
      userId: user1.id
    });
    console.log('  张三创建了2篇文章');

    // 创建标签
    const tag1 = await Tag.create({ name: 'Node.js' });
    const tag2 = await Tag.create({ name: '后端' });
    const tag3 = await Tag.create({ name: '数据库' });
    const tag4 = await Tag.create({ name: 'ORM' });

    // 为文章添加标签（多对多关联）
    await post1.addTags([tag1, tag2]);
    await post2.addTags([tag1, tag3, tag4]);
    console.log('  为文章添加了标签关联');
    console.log('');

    // ============ 6. READ：查询数据 ============
    console.log('🔍 步骤6：查询数据（Read）');

    // 6.1 查询所有用户
    const allUsers = await User.findAll({
      attributes: ['id', 'username', 'email', 'balance', 'role'],
      order: [['id', 'ASC']]
    });
    console.log('  所有用户：');
    allUsers.forEach(u => {
      console.log(\`    ID:\${u.id} | \${u.username} | 余额:\${u.balance} | \${u.role}\`);
    });

    // 6.2 按主键查询
    const zhangsan = await User.findByPk(user1.id);
    console.log('\\n  按ID查询张三:', zhangsan.username);

    // 6.3 条件查询 + Op操作符
    const richUsers = await User.findAll({
      where: {
        balance: {
          [Op.gte]: 500 // 余额>=500
        },
        age: {
          [Op.between]: [20, 30] // 年龄20-30
        }
      },
      attributes: ['username', 'balance', 'age']
    });
    console.log('\\n  余额>=500且年龄20-30的用户：');
    richUsers.forEach(u => {
      console.log(\`    \${u.username} - 余额:\${u.balance} - \${u.age}岁\`);
    });

    // 6.4 预加载：查询文章时同时查出作者和标签（避免N+1问题）
    console.log('\\n  文章列表（带作者和标签）：');
    const posts = await Post.findAll({
      include: [
        { model: User, as: 'author', attributes: ['username'] },
        { model: Tag, as: 'tags', attributes: ['name'], through: { attributes: [] } }
      ],
      order: [['id', 'ASC']]
    });
    posts.forEach(p => {
      const tagNames = p.tags.map(t => t.name).join(', ');
      console.log(\`    《\${p.title}》 - 作者:\${p.author.username} - 标签:[\${tagNames}] - 浏览:\${p.views}\`);
    });

    // 6.5 分页查询
    const { count, rows: pageUsers } = await User.findAndCountAll({
      limit: 2,
      offset: 0,
      order: [['id', 'ASC']],
      attributes: ['username']
    });
    console.log(\`\\n  分页查询：共\${count}个用户，每页2条，第1页：\`);
    pageUsers.forEach(u => console.log('    ' + u.username));

    // 6.6 聚合查询
    const totalBalance = await User.sum('balance');
    const avgAge = await User.findOne({
      attributes: [[sequelize.fn('AVG', sequelize.col('age')), 'avgAge']]
    });
    console.log(\`\\n  统计：总余额=\${totalBalance}，平均年龄=\${Math.round(avgAge.getDataValue('avgAge'))}岁\`);
    console.log('');

    // ============ 7. UPDATE：更新数据 ============
    console.log('✏️  步骤7：更新数据（Update）');

    // 更新单个实例
    zhangsan.age = 26;
    await zhangsan.save();
    console.log('  张三年龄更新为:', zhangsan.age);

    // 批量更新
    const [updateCount] = await User.update(
      { isActive: true },
      { where: { balance: { [Op.gt]: 0 } } }
    );
    console.log('  更新' + updateCount + '个用户为活跃状态');
    console.log('');

    // ============ 8. DELETE：删除数据 ============
    console.log('🗑️  步骤8：删除数据（Delete）');

    // 先查询赵六，然后删除
    const zhaoliu = await User.findOne({ where: { username: 'zhaoliu' } });
    if (zhaoliu) {
      await zhaoliu.destroy();
      console.log('  赵六已删除');
    }
    console.log('');

    // ============ 9. 数据库事务：转账经典示例 ============
    console.log('🔄 步骤9：数据库事务演示（转账）');
    console.log('  场景：张三给李四转账300元，需要原子操作，不能出现扣了钱没加钱的情况');

    // 重新查询一下当前余额
    let zhangsanBefore = await User.findByPk(user1.id);
    let lisiBefore = await User.findByPk(user2.id);
    console.log(\`  转账前：张三=\${zhangsanBefore.balance}元，李四=\${lisiBefore.balance}元\`);

    // 使用自动托管事务
    try {
      await sequelize.transaction(async (t) => {
        // 在事务中重新查询（带锁）
        const from = await User.findByPk(user1.id, { transaction: t, lock: t.LOCK.UPDATE });
        const to = await User.findByPk(user2.id, { transaction: t, lock: t.LOCK.UPDATE });

        const amount = 300;

        // 检查余额是否充足
        if (Number(from.balance) < amount) {
          throw new Error('余额不足');
        }

        // 扣钱
        from.balance = Number(from.balance) - amount;
        await from.save({ transaction: t });
        console.log(\`  \t张三扣除\${amount}元，余额：\${from.balance}\`);

        // 故意制造错误，测试回滚（取消下面注释看效果）
        // throw new Error('模拟网络故障！');

        // 加钱
        to.balance = Number(to.balance) + amount;
        await to.save({ transaction: t });
        console.log(\`  \t李四增加\${amount}元，余额：\${to.balance}\`);

        // 事务自动提交：走到这里没有异常就会commit
      });
      console.log('  ✅ 转账成功！事务已提交');
    } catch (txErr) {
      console.log('  ❌ 转账失败:', txErr.message);
      console.log('  🔄 事务已回滚，双方余额不会有变化');
    }

    // 验证最终余额
    const zhangsanAfter = await User.findByPk(user1.id);
    const lisiAfter = await User.findByPk(user2.id);
    console.log(\`  转账后：张三=\${zhangsanAfter.balance}元，李四=\${lisiAfter.balance}元\`);
    console.log(\`  总金额守恒：\${Number(zhangsanAfter.balance) + Number(lisiAfter.balance)}元（应该等于转账前的总和）\`);
    console.log('');

    // ============ 10. 清理 ============
    console.log('🧹 步骤10：清理...');
    // 实际项目中不会drop数据库！这里只是演示
    // await sequelize.dropDatabase();
    console.log('✅ 演示完成（保留数据库表供你查看）');
    console.log('');

    console.log('========================================');
    console.log('  🎉 Sequelize ORM演示完成！');
    console.log('========================================');
    console.log('');
    console.log('💡 要点总结：');
    console.log('   1. Model对应数据库表，实例对应记录');
    console.log('   2. hasMany/belongsTo/belongsToMany定义关联');
    console.log('   3. include预加载解决N+1查询问题');
    console.log('   4. 使用Op操作符写条件查询');
    console.log('   5. 多步操作需要原子性一定要用事务！');

  } catch (err) {
    console.error('\\n❌ 出错了:', err.message);
    if (err.original && err.original.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 提示：检查MySQL用户名密码');
    } else if (err.original && err.original.code === 'ECONNREFUSED') {
      console.log('💡 提示：MySQL服务是否启动？端口3306？');
    } else {
      console.error(err);
    }
  } finally {
    if (sequelize) {
      await sequelize.close();
      console.log('\\n🔌 数据库连接已关闭');
    }
  }
}

// 运行主函数
main();

// 小练习：
// 1. 取消事务中的"模拟网络故障"注释，观察是否回滚
// 2. 添加Comment模型，和Post是一对多关系
// 3. 给Post添加查询文章详情的接口（带作者、标签、评论）
// 4. 实现用户A给用户B转账的函数，考虑各种边界情况
// 5. 试试改用SQLite（只需要改dialect为'sqlite'，加storage:':memory'）
`
  }
];
