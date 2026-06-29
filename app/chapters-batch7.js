// =============================================================
// Node.js 交互式教程 —— 第七批章节（数据存储组，共 6 章）
// =============================================================

// 注意：fs/path/crypto 仅在各章节 code 字符串（用户代码）中使用，
// 运行时由沙箱执行，不需要在此模块顶层 require。

const chapters = [
  // =============================================================
  // 第 1 章：MySQL 集成
  // =============================================================
  {
    id: 'node-database-mysql',
    group: '数据存储',
    icon: '🐬',
    title: 'MySQL 集成',
    content: `
## MySQL 集成：关系型数据库入门

MySQL 是世界上最流行的开源关系型数据库管理系统（RDBMS），它使用 **结构化查询语言（SQL）** 来管理数据。在 Node.js 中，通常通过 \`mysql2\` 或 \`knex\` 等驱动与 MySQL 交互。

### 1. 关系型数据库核心概念

**表（Table）** — 数据的二维结构，行代表记录，列代表字段。  
**主键（Primary Key）** — 唯一标识每一行记录的字段，通常为自增整数或 UUID。  
**外键（Foreign Key）** — 关联两个表的字段，确保引用完整性。  
**索引（Index）** — 加速查询的数据结构，类似于书的目录。  
**范式化（Normalization）** — 消除数据冗余的设计过程，通常到 3NF。

### 2. 常见数据类型

| 类型 | 说明 | 示例 |
|------|------|------|
| INT | 整数 | age INT |
| VARCHAR(n) | 变长字符串 | name VARCHAR(100) |
| TEXT | 长文本 | description TEXT |
| DECIMAL(p,s) | 精确小数 | price DECIMAL(10,2) |
| DATETIME | 日期时间 | created_at DATETIME |
| BOOLEAN | 布尔值 | is_active BOOLEAN |
| BLOB | 二进制大对象 | avatar BLOB |

### 3. SQL 基础操作

\`\`\`sql
-- 创建表
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入数据（参数化查询防 SQL 注入）
INSERT INTO users (name, email) VALUES (?, ?);

-- 查询数据
SELECT * FROM users WHERE email = ?;
SELECT u.name, o.amount FROM users u
  JOIN orders o ON u.id = o.user_id
  WHERE o.created_at > ?;

-- 更新数据
UPDATE users SET name = ? WHERE id = ?;

-- 删除数据
DELETE FROM users WHERE id = ?;
\`\`\`

### 4. SQL 注入与参数化查询

**永远不要拼接用户输入到 SQL 字符串中！** 使用参数化查询（占位符 \`?\`）可以让数据库驱动自动转义特殊字符，从根本上防止 SQL 注入攻击。

### 5. 连接字符串格式

\`\`\`
mysql://user:password@host:port/database
\`\`\`

常见配置项：\`host\`、\`port\`（默认 3306）、\`user\`、\`password\`、\`database\`、\`connectionLimit\`（连接池大小）。

### 6. 示例代码说明

下面的代码使用 **fs 模块**实现了一个轻量级的 JSON 文件数据库，模拟 MySQL 的核心功能：  
- 表结构定义（字段类型、主键、唯一约束）  
- 参数化 CRUD 操作（防注入）  
- 简单的 JOIN 查询  
- 数据持久化到本地 JSON 文件
`,
    code: `// =============================================================
// 模拟 MySQL 的 JSON 文件数据库
// 支持：表定义、CRUD、参数化查询、JOIN
// =============================================================

const fs = require('fs');
const path = require('path');

// -------------------- 数据库引擎 --------------------
class JsonFileDB {
  constructor(dbPath = './data') {
    this.dbPath = dbPath;
    this.tables = {}; // 内存中的表数据
    this.schemas = {}; // 表结构定义
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }
  }

  // 创建表：定义字段名称、类型、主键、唯一约束
  createTable(tableName, schema) {
    if (this.schemas[tableName]) {
      throw new Error(\`表 "\${tableName}" 已存在\`);
    }
    this.schemas[tableName] = schema;
    this.tables[tableName] = [];
    // 从文件加载已有数据
    const filePath = path.join(this.dbPath, \`\${tableName}.json\`);
    if (fs.existsSync(filePath)) {
      this.tables[tableName] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    console.log(\`表 "\${tableName}" 创建成功，字段: \${schema.columns.map(c => c.name).join(', ')}\`);
    return this;
  }

  // 持久化到文件
  _save(tableName) {
    const filePath = path.join(this.dbPath, \`\${tableName}.json\`);
    fs.writeFileSync(filePath, JSON.stringify(this.tables[tableName], null, 2), 'utf-8');
  }

  // 参数化插入：将 ? 占位符替换为实际值并转义
  _parameterize(sql, params) {
    let idx = 0;
    return sql.replace(/\\?/g, () => {
      if (idx >= params.length) throw new Error('参数数量不匹配');
      const val = params[idx++];
      // 模拟参数化：数字不加引号，字符串加引号并转义
      if (typeof val === 'number') return val;
      if (val === null) return 'NULL';
      return \`'\${String(val).replace(/'/g, "''")}'\`;
    });
  }

  // 插入数据
  insert(tableName, data) {
    const schema = this.schemas[tableName];
    if (!schema) throw new Error(\`表 "\${tableName}" 不存在\`);
    // 校验必填字段
    for (const col of schema.columns) {
      if (col.required && data[col.name] === undefined) {
        throw new Error(\`字段 "\${col.name}" 不能为空\`);
      }
    }
    // 主键自增
    if (schema.primaryKey) {
      const pk = schema.primaryKey;
      if (data[pk] === undefined) {
        const maxId = this.tables[tableName].reduce((max, row) => Math.max(max, row[pk] || 0), 0);
        data[pk] = maxId + 1;
      }
    }
    // 唯一约束检查
    for (const col of schema.columns) {
      if (col.unique && data[col.name] !== undefined) {
        const exists = this.tables[tableName].some(row => row[col.name] === data[col.name]);
        if (exists) throw new Error(\`唯一约束违反: \${col.name} = \${data[col.name]} 已存在\`);
      }
    }
    this.tables[tableName].push({ ...data });
    this._save(tableName);
    console.log(\`插入成功: \${JSON.stringify(data)}\`);
    return data;
  }

  // 条件匹配
  _matchRow(row, conditions) {
    for (const [key, value] of Object.entries(conditions)) {
      if (row[key] !== value) return false;
    }
    return true;
  }

  // 查询数据
  select(tableName, where = {}) {
    const rows = this.tables[tableName] || [];
    const result = rows.filter(row => this._matchRow(row, where));
    console.log(\`查询 "\${tableName}" 返回 \${result.length} 条记录\`);
    return result;
  }

  // 更新数据
  update(tableName, where, newData) {
    const schema = this.schemas[tableName];
    let updated = 0;
    this.tables[tableName] = this.tables[tableName].map(row => {
      if (this._matchRow(row, where)) {
        updated++;
        return { ...row, ...newData };
      }
      return row;
    });
    this._save(tableName);
    console.log(\`更新了 \${updated} 条记录\`);
    return updated;
  }

  // 删除数据
  delete(tableName, where) {
    const before = this.tables[tableName].length;
    this.tables[tableName] = this.tables[tableName].filter(row => !this._matchRow(row, where));
    const deleted = before - this.tables[tableName].length;
    this._save(tableName);
    console.log(\`删除了 \${deleted} 条记录\`);
    return deleted;
  }

  // 简单 JOIN：左表 rightKey 匹配右表 leftKey
  join(tableA, tableB, leftKey, rightKey) {
    const rowsA = this.tables[tableA] || [];
    const rowsB = this.tables[tableB] || [];
    const result = [];
    for (const a of rowsA) {
      const matched = rowsB.filter(b => b[rightKey] === a[leftKey]);
      if (matched.length > 0) {
        for (const b of matched) {
          result.push({ ...a, ...b });
        }
      } else {
        result.push({ ...a });
      }
    }
    console.log(\`JOIN 结果: \${result.length} 条记录\`);
    return result;
  }
}

// -------------------- 运行示例 --------------------
const db = new JsonFileDB('./mysql_demo_data');

// 定义用户表结构
db.createTable('users', {
  primaryKey: 'id',
  columns: [
    { name: 'id', type: 'INT', required: false },
    { name: 'name', type: 'VARCHAR(100)', required: true },
    { name: 'email', type: 'VARCHAR(255)', required: true, unique: true },
    { name: 'age', type: 'INT', required: false },
  ],
});

// 定义订单表结构
db.createTable('orders', {
  primaryKey: 'id',
  columns: [
    { name: 'id', type: 'INT', required: false },
    { name: 'user_id', type: 'INT', required: true },
    { name: 'amount', type: 'DECIMAL(10,2)', required: true },
    { name: 'product', type: 'VARCHAR(200)', required: true },
  ],
});

// 模拟参数化插入（防 SQL 注入）
console.log('\\n=== 插入用户数据 ===');
db.insert('users', { name: '张三', email: 'zhangsan@example.com', age: 28 });
db.insert('users', { name: '李四', email: 'lisi@example.com', age: 35 });
// 尝试 SQL 注入：带单引号的值
db.insert('users', { name: "test' OR '1'='1", email: 'hacker@evil.com', age: 99 });

console.log('\\n=== 插入订单数据 ===');
db.insert('orders', { user_id: 1, amount: 199.99, product: '机械键盘' });
db.insert('orders', { user_id: 1, amount: 49.50, product: '鼠标垫' });
db.insert('orders', { user_id: 2, amount: 2999.00, product: '显示器' });

console.log('\\n=== SELECT 查询所有用户 ===');
console.log(db.select('users'));

console.log('\\n=== SELECT 条件查询（age > 30） ===');
// 查年龄大于30的用户
const users = db.select('users');
console.log(users.filter(u => u.age > 30));

console.log('\\n=== UPDATE 更新用户 ===');
db.update('users', { id: 1 }, { name: '张三(已更新)', age: 29 });

console.log('\\n=== JOIN 查询：用户订单关联 ===');
const joined = db.join('users', 'orders', 'id', 'user_id');
joined.forEach(row => {
  console.log(\`\${row.name} 购买了 \${row.product}，金额: ¥\${row.amount}\`);
});

console.log('\\n=== DELETE 删除 ===');
db.delete('orders', { id: 1 });
console.log('剩余订单:', db.select('orders'));

console.log('\\n=== 演示完成 ===');
// 清理测试数据
const dataDir = path.join(__dirname, 'mysql_demo_data');
if (fs.existsSync(dataDir)) {
  fs.readdirSync(dataDir).forEach(f => fs.unlinkSync(path.join(dataDir, f)));
  fs.rmdirSync(dataDir);
}
`,
  },

  // =============================================================
  // 第 2 章：MongoDB 集成
  // =============================================================
  {
    id: 'node-database-mongo',
    group: '数据存储',
    icon: '🍃',
    title: 'MongoDB 集成',
    content: `
## MongoDB 集成：文档数据库入门

MongoDB 是一个面向文档的 NoSQL 数据库，它使用类似 JSON 的 **BSON** 格式存储数据，具有灵活的模式（Schema-less）设计。

### 1. 文档数据库核心概念

**文档（Document）** — MongoDB 的基本数据单元，相当于关系型数据库中的一行记录。  
**集合（Collection）** — 一组文档的容器，相当于关系型数据库中的表。  
**ObjectId** — 每个文档的默认主键，12 字节 BSON 类型，包含时间戳、机器标识、进程 ID 和计数器。  
**BSON** — Binary JSON，MongoDB 的内部存储格式，支持更多数据类型（日期、二进制、ObjectId 等）。

### 2. MongoDB vs MySQL 术语对比

| MySQL | MongoDB |
|-------|---------|
| Database | Database |
| Table | Collection |
| Row | Document |
| Column | Field |
| Index | Index |
| JOIN | \\$lookup / 嵌入文档 |
| PRIMARY KEY | \\_id (ObjectId) |

### 3. CRUD 操作

\`\`\`javascript
// 插入文档
db.collection('users').insertOne({ name: '张三', age: 28 });
db.collection('users').insertMany([{...}, {...}]);

// 查询文档（MongoDB 查询操作符）
db.collection('users').find({ age: { $gte: 18, $lte: 60 } });
db.collection('users').findOne({ email: 'test@example.com' });

// 更新文档
db.collection('users').updateOne(
  { _id: ObjectId('...') },
  { $set: { name: '新名字' }, $inc: { loginCount: 1 } }
);

// 删除文档
db.collection('users').deleteMany({ status: 'inactive' });
\`\`\`

### 4. 聚合管道（Aggregation Pipeline）

聚合管道是一系列数据处理阶段的组合，每个阶段对文档进行转换：

\`\`\`javascript
db.collection('orders').aggregate([
  { $match: { status: 'completed' } },           // 过滤
  { $group: { _id: '$userId', total: { $sum: '$amount' } } }, // 分组聚合
  { $sort: { total: -1 } },                      // 排序
  { $limit: 10 },                                 // 限制
]);
\`\`\`

### 5. Mongoose ODM 概念

Mongoose 是 MongoDB 的对象文档映射（ODM）库，提供：
- **Schema 定义**：定义文档结构和验证规则
- **Model**：基于 Schema 创建的构造函数，用于操作数据库
- **中间件**：pre/post hooks，在保存/查询前后执行逻辑
- **虚拟属性**：不存储到数据库的计算属性
- **填充（Populate）**：类似 JOIN 的关联查询

### 6. 示例代码说明

下面的代码在**内存中实现了一个文档数据库**，模拟 MongoDB 的核心功能：ObjectId 生成、CRUD 操作、查询操作符（\\$eq/\\$gt/\\$lt/\\$in/\\$regex）、排序、分页、简单聚合管道。
`,
    code: `// =============================================================
// 内存文档数据库 —— 模拟 MongoDB 核心功能
// 支持：ObjectId、CRUD、查询操作符、排序分页、聚合管道
// =============================================================

const crypto = require('crypto');

// -------------------- ObjectId 生成器 --------------------
// 模拟 MongoDB ObjectId：12 字节十六进制字符串
let objectIdCounter = 0;
function generateObjectId() {
  // 4字节时间戳 + 5字节随机 + 3字节计数器
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = crypto.randomBytes(5).toString('hex');
  const counter = (++objectIdCounter % 0xffffff).toString(16).padStart(6, '0');
  return timestamp + random + counter;
}

// -------------------- 内存文档数据库 --------------------
class InMemoryDocumentDB {
  constructor() {
    this.collections = {};
  }

  collection(name) {
    if (!this.collections[name]) {
      this.collections[name] = { documents: [], indexes: {} };
    }
    const col = this.collections[name];

    // 查询操作符匹配（局部函数，供所有方法使用）
    function matchQuery(doc, query) {
      for (const [field, condition] of Object.entries(query)) {
        const docVal = doc[field];
        // 简单等值匹配
        if (condition === null || typeof condition !== 'object') {
          if (docVal !== condition) return false;
          continue;
        }
        // 查询操作符
        for (const [op, opVal] of Object.entries(condition)) {
          switch (op) {
            case '$eq':  if (docVal !== opVal) return false; break;
            case '$ne':  if (docVal === opVal) return false; break;
            case '$gt':  if (!(docVal > opVal)) return false; break;
            case '$gte': if (!(docVal >= opVal)) return false; break;
            case '$lt':  if (!(docVal < opVal)) return false; break;
            case '$lte': if (!(docVal <= opVal)) return false; break;
            case '$in':  if (!opVal.includes(docVal)) return false; break;
            case '$nin': if (opVal.includes(docVal)) return false; break;
            case '$regex': {
              if (typeof docVal !== 'string') return false;
              const regex = new RegExp(opVal, 'i');
              if (!regex.test(docVal)) return false;
              break;
            }
            default: break;
          }
        }
      }
      return true;
    }

    return {
      // 插入单个文档
      insertOne: (doc) => {
        const document = { _id: generateObjectId(), ...doc };
        col.documents.push(document);
        return { acknowledged: true, insertedId: document._id };
      },

      // 批量插入
      insertMany: (docs) => {
        const insertedIds = [];
        for (const doc of docs) {
          const result = this.collection(name).insertOne(doc);
          insertedIds.push(result.insertedId);
        }
        return { acknowledged: true, insertedCount: docs.length, insertedIds };
      },

      // 查询文档
      find: (query = {}) => {
        const results = col.documents.filter(doc => matchQuery(doc, query));

        const cursor = {
          _results: results,

          // 排序：{ field: 1 } 升序，{ field: -1 } 降序
          sort: function(sortObj) {
            const [field, order] = Object.entries(sortObj)[0];
            this._results.sort((a, b) => {
              if (a[field] < b[field]) return -1 * order;
              if (a[field] > b[field]) return 1 * order;
              return 0;
            });
            return this;
          },

          // 跳过指定数量
          skip: function(n) {
            this._results = this._results.slice(n);
            return this;
          },

          // 限制返回数量
          limit: function(n) {
            this._results = this._results.slice(0, n);
            return this;
          },

          // 投影：只返回指定字段
          project: function(fields) {
            this._results = this._results.map(doc => {
              const projected = {};
              for (const f of fields) projected[f] = doc[f];
              return projected;
            });
            return this;
          },

          // 转为数组
          toArray: function() { return this._results; },
        };
        return cursor;
      },

      // 查找单个文档
      findOne: (query = {}) => {
        const result = this.collection(name).find(query).limit(1);
        return result._results[0] || null;
      },

      // 更新单个文档
      updateOne: (filter, update) => {
        for (let i = 0; i < col.documents.length; i++) {
          if (matchQuery(col.documents[i], filter)) {
            const doc = col.documents[i];
            // 处理 $set 操作符
            if (update.$set) {
              Object.assign(doc, update.$set);
            }
            // 处理 $inc 操作符
            if (update.$inc) {
              for (const [k, v] of Object.entries(update.$inc)) {
                doc[k] = (doc[k] || 0) + v;
              }
            }
            // 处理 $unset 操作符
            if (update.$unset) {
              for (const k of Object.keys(update.$unset)) {
                delete doc[k];
              }
            }
            return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
          }
        }
        return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
      },

      // 更新多个文档
      updateMany: (filter, update) => {
        let matched = 0;
        for (let i = 0; i < col.documents.length; i++) {
          if (matchQuery(col.documents[i], filter)) {
            matched++;
            const doc = col.documents[i];
            if (update.$set) Object.assign(doc, update.$set);
            if (update.$inc) {
              for (const [k, v] of Object.entries(update.$inc)) {
                doc[k] = (doc[k] || 0) + v;
              }
            }
          }
        }
        return { acknowledged: true, matchedCount: matched, modifiedCount: matched };
      },

      // 删除单个文档
      deleteOne: (filter) => {
        const idx = col.documents.findIndex(doc => matchQuery(doc, filter));
        if (idx !== -1) {
          col.documents.splice(idx, 1);
          return { acknowledged: true, deletedCount: 1 };
        }
        return { acknowledged: true, deletedCount: 0 };
      },

      // 删除多个文档
      deleteMany: (filter) => {
        const before = col.documents.length;
        col.documents = col.documents.filter(doc => !matchQuery(doc, filter));
        return { acknowledged: true, deletedCount: before - col.documents.length };
      },

      // 统计文档数量
      countDocuments: (query = {}) => {
        return col.documents.filter(doc => matchQuery(doc, query)).length;
      },

      // 聚合管道
      aggregate: (pipeline) => {
        let docs = [...col.documents];
        for (const stage of pipeline) {
          if (stage.$match) {
            docs = docs.filter(doc => matchQuery(doc, stage.$match));
          } else if (stage.$group) {
            const groups = {};
            for (const doc of docs) {
              const key = typeof stage.$group._id === 'string' && stage.$group._id.startsWith('$')
                ? doc[stage.$group._id.slice(1)]
                : stage.$group._id;
              if (!groups[key]) groups[key] = { _id: key };
              // 处理 $sum 累加器
              for (const [field, acc] of Object.entries(stage.$group)) {
                if (field === '_id') continue;
                if (typeof acc === 'object' && acc.$sum !== undefined) {
                  if (typeof acc.$sum === 'number') {
                    // 直接数字，如 { $sum: 1 }
                    groups[key][field] = (groups[key][field] || 0) + acc.$sum;
                  } else if (typeof acc.$sum === 'string' && acc.$sum.startsWith('$')) {
                    // 引用字段，如 { $sum: '$balance' }
                    const srcField = acc.$sum.slice(1);
                    groups[key][field] = (groups[key][field] || 0) + (doc[srcField] || 0);
                  }
                }
              }
            }
            docs = Object.values(groups);
          } else if (stage.$sort) {
            const [field, order] = Object.entries(stage.$sort)[0];
            docs.sort((a, b) => (a[field] > b[field] ? 1 : -1) * order);
          } else if (stage.$limit) {
            docs = docs.slice(0, stage.$limit);
          }
        }
        return docs;
      },
    };
  }
}

// -------------------- 运行示例 --------------------
console.log('=== MongoDB 模拟数据库演示 ===\\n');
const db = new InMemoryDocumentDB();

// 插入用户文档
console.log('--- 插入用户 ---');
const users = db.collection('users');
users.insertMany([
  { name: '张三', email: 'zhangsan@example.com', age: 28, city: '北京', balance: 5000 },
  { name: '李四', email: 'lisi@example.com', age: 35, city: '上海', balance: 12000 },
  { name: '王五', email: 'wangwu@example.com', age: 22, city: '北京', balance: 3000 },
  { name: '赵六', email: 'zhaoliu@example.com', age: 40, city: '深圳', balance: 8000 },
]);

// 查询：年龄大于等于 25 的用户
console.log('\\n--- 查询：age >= 25 ---');
const result = users.find({ age: { $gte: 25 } }).sort({ age: 1 }).toArray();
result.forEach(u => console.log(\`  \${u.name} - \${u.age}岁 - \${u.city}\`));

// 查询：正则匹配邮箱
console.log('\\n--- 查询：邮箱包含 example ---');
const regexResult = users.find({ email: { $regex: 'example' } }).toArray();
regexResult.forEach(u => console.log(\`  \${u.name}: \${u.email}\`));

// 更新：$set 和 $inc
console.log('\\n--- 更新：张三年龄+1，余额+1000 ---');
users.updateOne({ name: '张三' }, { $set: { city: '杭州' }, $inc: { age: 1, balance: 1000 } });
const updated = users.findOne({ name: '张三' });
console.log(\`  更新后: \${updated.name}, 年龄:\${updated.age}, 城市:\${updated.city}, 余额:\${updated.balance}\`);

// 聚合管道：按城市分组，统计人数和总余额
console.log('\\n--- 聚合管道：按城市分组统计 ---');
const aggResult = users.aggregate([
  { $group: { _id: '$city', count: { $sum: 1 }, totalBalance: { $sum: '$balance' } } },
  { $sort: { totalBalance: -1 } },
]);
aggResult.forEach(g => console.log(\`  \${g._id}: \${g.count}人, 总余额¥\${g.totalBalance}\`));

// 分页查询
console.log('\\n--- 分页查询：第1页，每页2条 ---');
const page1 = users.find({}).sort({ age: 1 }).skip(0).limit(2).toArray();
page1.forEach(u => console.log(\`  \${u.name} - \${u.age}岁\`));

console.log('\\n--- 分页查询：第2页，每页2条 ---');
const page2 = users.find({}).sort({ age: 1 }).skip(2).limit(2).toArray();
page2.forEach(u => console.log(\`  \${u.name} - \${u.age}岁\`));

// 删除操作
console.log('\\n--- 删除：年龄小于25的用户 ---');
const delResult = users.deleteMany({ age: { $lt: 25 } });
console.log(\`  删除了 \${delResult.deletedCount} 条记录\`);
console.log(\`  剩余用户数: \${users.countDocuments()}\`);

console.log('\\n=== 演示完成 ===');
`,
  },

  // =============================================================
  // 第 3 章：连接池管理
  // =============================================================
  {
    id: 'node-connection-pool',
    group: '数据存储',
    icon: '🏊',
    title: '连接池管理',
    content: `
## 连接池管理：高效复用数据库连接

### 1. 为什么需要连接池？

每次创建数据库连接都需要：TCP 三次握手 → 认证 → 分配资源。这是一个**昂贵**的操作（通常 50-200ms）。在高并发场景下，频繁创建/销毁连接会导致：
- 数据库服务器资源耗尽
- 应用响应延迟急剧增加
- 可能出现 "Too many connections" 错误

**连接池**通过预创建一批连接并复用它们来解决这个问题。

### 2. 连接池核心参数

| 参数 | 说明 | 典型值 |
|------|------|--------|
| max | 最大连接数 | 10-50 |
| min | 最小空闲连接数 | 2-5 |
| idleTimeout | 空闲连接超时(ms) | 10000-30000 |
| acquireTimeout | 获取连接超时(ms) | 10000-60000 |
| maxLifetime | 连接最大存活时间 | 30min-1h |

### 3. 连接池工作流程

1. **初始化**：创建 min 个连接放入池中
2. **获取连接**：从空闲池取出一个连接，标记为"使用中"
3. **执行查询**：使用连接执行 SQL
4. **释放连接**：将连接归还到空闲池
5. **连接耗尽时**：如果使用中的连接数 < max，创建新连接；否则等待
6. **连接超时**：空闲超过 idleTimeout 的连接被关闭
7. **健康检查**：定期检查连接是否仍然有效

### 4. 连接泄漏检测

连接泄漏是指**获取连接后未释放**的情况。检测方法：
- 记录每个连接的获取时间和调用栈
- 设置获取超时警告阈值
- 定期扫描长时间未释放的连接

### 5. 常见连接池库

- **mysql2/promise**：\`createPool({ connectionLimit: 10 })\`
- **pg-pool**：PostgreSQL 连接池
- **generic-pool**：通用资源池库
- **mongoDB Node.js driver**：内置连接池

### 6. 示例代码说明

下面的代码实现了一个完整的连接池管理器，包括：连接获取与释放、超时控制、健康检查、连接泄漏检测、统计信息。
`,
    code: `// =============================================================
// 连接池管理器 —— 模拟数据库连接池
// 支持：获取/释放、超时、健康检查、泄漏检测
// =============================================================

const { EventEmitter } = require('events');

// -------------------- 模拟数据库连接 --------------------
class MockConnection {
  constructor(id) {
    this.id = id;
    this.createdAt = Date.now();
    this.healthy = true;
    this.queryCount = 0;
  }

  async query(sql) {
    if (!this.healthy) throw new Error('连接已断开');
    this.queryCount++;
    // 模拟查询延迟
    await new Promise(r => setTimeout(r, 10 + Math.random() * 20));
    return { rows: [], affectedRows: 0 };
  }

  async close() {
    this.healthy = false;
  }

  async ping() {
    if (!this.healthy) throw new Error('连接不可用');
    // 模拟 ping 延迟
    await new Promise(r => setTimeout(r, 5));
    return true;
  }
}

// -------------------- 连接池 --------------------
class ConnectionPool extends EventEmitter {
  constructor(options = {}) {
    super();
    this.max = options.max || 10;                    // 最大连接数
    this.min = options.min || 2;                     // 最小空闲连接数
    this.idleTimeout = options.idleTimeout || 10000; // 空闲超时(ms)
    this.acquireTimeout = options.acquireTimeout || 5000; // 获取超时(ms)
    this.maxLifetime = options.maxLifetime || 600000; // 连接最大存活时间(ms)
    this.healthCheckInterval = options.healthCheckInterval || 30000; // 健康检查间隔(ms)

    this._free = [];           // 空闲连接池
    this._used = new Map();    // 使用中的连接：connection -> { acquiredAt, stack }
    this._waiting = [];        // 等待队列：{ resolve, reject, timer }
    this._id = 0;              // 连接 ID 计数器
    this._closed = false;
    this._stats = {
      created: 0, destroyed: 0, acquired: 0, released: 0,
      timeouts: 0, waitTimeouts: 0,
    };

    // 初始化最小连接数
    this._initialize();
    // 启动健康检查定时器
    this._healthCheckTimer = setInterval(() => this._healthCheck(), this.healthCheckInterval);
    // 启动空闲连接回收定时器
    this._idleCheckTimer = setInterval(() => this._reapIdle(), this.idleTimeout / 2);
  }

  async _initialize() {
    const toCreate = Math.max(0, this.min - this._free.length);
    for (let i = 0; i < toCreate; i++) {
      await this._createConnection();
    }
    console.log(\`连接池初始化完成：空闲=\${this._free.length}, 最小=\${this.min}, 最大=\${this.max}\`);
  }

  async _createConnection() {
    if (this._totalCount >= this.max) return null;
    const conn = new MockConnection(++this._id);
    this._free.push({ connection: conn, idleSince: Date.now() });
    this._stats.created++;
    this.emit('connectionCreated', conn.id);
    return conn;
  }

  get _totalCount() {
    return this._free.length + this._used.size;
  }

  get status() {
    return {
      total: this._totalCount,
      free: this._free.length,
      used: this._used.size,
      waiting: this._waiting.length,
      max: this.max,
      stats: { ...this._stats },
    };
  }

  // 获取连接
  async acquire() {
    if (this._closed) throw new Error('连接池已关闭');

    // 尝试从空闲池获取
    if (this._free.length > 0) {
      const entry = this._free.shift();
      const conn = entry.connection;
      this._used.set(conn, {
        acquiredAt: Date.now(),
        stack: new Error('连接获取调用栈').stack,
      });
      this._stats.acquired++;
      this.emit('connectionAcquired', conn.id);
      return conn;
    }

    // 尝试创建新连接
    if (this._totalCount < this.max) {
      await this._createConnection();
      return this.acquire(); // 递归获取新创建的连接
    }

    // 连接池已满，进入等待队列
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        // 等待超时
        const idx = this._waiting.findIndex(w => w.resolve === resolve);
        if (idx !== -1) {
          this._waiting.splice(idx, 1);
          this._stats.waitTimeouts++;
          reject(new Error(\`获取连接超时（\${this.acquireTimeout}ms），当前队列长度: \${this._waiting.length}\`));
        }
      }, this.acquireTimeout);

      this._waiting.push({ resolve, reject, timer });
      this.emit('waiting', this._waiting.length);
    });
  }

  // 释放连接
  release(connection) {
    if (!this._used.has(connection)) {
      console.warn(\`警告：连接 #\${connection.id} 未被使用或已释放\`);
      return;
    }
    const entry = this._used.get(connection);
    this._used.delete(connection);
    this._stats.released++;
    this.emit('connectionReleased', connection.id);

    // 检查连接是否超龄
    if (Date.now() - connection.createdAt > this.maxLifetime) {
      connection.close();
      this._stats.destroyed++;
      this._createConnection().catch(() => {});
      this._processWaitQueue();
      return;
    }

    // 归还到空闲池
    this._free.push({ connection, idleSince: Date.now() });
    this._processWaitQueue();
  }

  // 处理等待队列
  _processWaitQueue() {
    if (this._waiting.length === 0 || this._free.length === 0) return;
    const waiter = this._waiting.shift();
    clearTimeout(waiter.timer);
    const entry = this._free.shift();
    this._used.set(entry.connection, {
      acquiredAt: Date.now(),
      stack: new Error('连接获取调用栈').stack,
    });
    this._stats.acquired++;
    waiter.resolve(entry.connection);
  }

  // 健康检查
  async _healthCheck() {
    console.log(\`[健康检查] 总连接:\${this._totalCount}, 使用中:\${this._used.size}, 空闲:\${this._free.length}\`);
    // 检查所有空闲连接
    const unhealthy = [];
    for (const entry of this._free) {
      try {
        await entry.connection.ping();
      } catch {
        unhealthy.push(entry);
      }
    }
    // 移除不健康的连接
    for (const entry of unhealthy) {
      this._free = this._free.filter(e => e !== entry);
      this._stats.destroyed++;
      console.log(\`[健康检查] 移除不健康连接 #\${entry.connection.id}\`);
    }
    // 补齐最小连接数
    while (this._free.length < this.min) {
      await this._createConnection();
    }
  }

  // 回收空闲连接
  _reapIdle() {
    const now = Date.now();
    const keep = [];
    for (const entry of this._free) {
      if (now - entry.idleSince > this.idleTimeout && this._free.length > this.min) {
        entry.connection.close();
        this._stats.destroyed++;
        console.log(\`[空闲回收] 关闭连接 #\${entry.connection.id}（空闲 \${now - entry.idleSince}ms）\`);
      } else {
        keep.push(entry);
      }
    }
    this._free = keep;
  }

  // 连接泄漏检测
  detectLeaks(thresholdMs = 30000) {
    const now = Date.now();
    const leaks = [];
    for (const [conn, entry] of this._used) {
      const duration = now - entry.acquiredAt;
      if (duration > thresholdMs) {
        leaks.push({
          connectionId: conn.id,
          duration,
          queryCount: conn.queryCount,
          acquiredAt: new Date(entry.acquiredAt).toISOString(),
          stack: entry.stack,
        });
      }
    }
    return leaks;
  }

  // 关闭连接池
  async close() {
    this._closed = true;
    clearInterval(this._healthCheckTimer);
    clearInterval(this._idleCheckTimer);
    // 关闭所有连接
    for (const entry of this._free) {
      await entry.connection.close();
    }
    for (const conn of this._used.keys()) {
      await conn.close();
    }
    // 拒绝所有等待者
    for (const waiter of this._waiting) {
      clearTimeout(waiter.timer);
      waiter.reject(new Error('连接池已关闭'));
    }
    this._free = [];
    this._used.clear();
    this._waiting = [];
    console.log('连接池已关闭');
  }
}

// -------------------- 运行示例 --------------------
async function main() {
  console.log('=== 连接池管理器演示 ===\\n');

  // 创建连接池
  const pool = new ConnectionPool({
    max: 5,
    min: 2,
    idleTimeout: 5000,
    acquireTimeout: 3000,
    maxLifetime: 30000,
    healthCheckInterval: 10000,
  });

  // 监听事件
  pool.on('connectionCreated', id => console.log(\`[事件] 连接 #\${id} 已创建\`));
  pool.on('connectionAcquired', id => console.log(\`[事件] 连接 #\${id} 已获取\`));
  pool.on('connectionReleased', id => console.log(\`[事件] 连接 #\${id} 已释放\`));

  console.log('初始状态:', pool.status);

  // 模拟并发请求
  console.log('\\n--- 模拟 8 个并发请求（最大连接数=5） ---');
  const tasks = [];
  for (let i = 0; i < 8; i++) {
    tasks.push((async () => {
      try {
        const conn = await pool.acquire();
        console.log(\`请求 #\${i} 获得连接 #\${conn.id}\`);
        await conn.query('SELECT * FROM users');
        // 模拟业务处理时间
        await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
        pool.release(conn);
        console.log(\`请求 #\${i} 释放连接 #\${conn.id}\`);
      } catch (err) {
        console.error(\`请求 #\${i} 错误: \${err.message}\`);
      }
    })());
  }
  await Promise.all(tasks);

  console.log('\\n执行后状态:', pool.status);

  // 泄漏检测
  console.log('\\n--- 连接泄漏检测 ---');
  const leaks = pool.detectLeaks(1000);
  if (leaks.length > 0) {
    leaks.forEach(l => console.log(\`  泄漏: 连接#\${l.connectionId}, 持有 \${l.duration}ms\`));
  } else {
    console.log('  未检测到连接泄漏');
  }

  // 关闭连接池
  await pool.close();
  console.log('\\n最终统计:', pool.status.stats);
  console.log('\\n=== 演示完成 ===');
}

main().catch(console.error);
`,
  },

  // =============================================================
  // 第 4 章：ORM 与查询构建器
  // =============================================================
  {
    id: 'node-orm',
    group: '数据存储',
    icon: '🗂️',
    title: 'ORM 与查询构建器',
    content: `
## ORM 与查询构建器：优雅地操作数据库

### 1. 什么是 ORM？

ORM（Object-Relational Mapping，对象关系映射）是一种将数据库表映射为编程语言对象的技术。它让你用面向对象的方式操作数据库，而不需要编写原始 SQL。

### 2. Active Record vs Data Mapper

| 模式 | 特点 | 代表库 |
|------|------|--------|
| **Active Record** | 模型对象自身包含 CRUD 方法，一个对象对应一行记录 | Sequelize（默认模式） |
| **Data Mapper** | 模型与持久化逻辑分离，通过 Repository 操作数据 | TypeORM |

**Active Record 示例：**
\`\`\`javascript
const user = new User({ name: '张三' });
await user.save();  // 对象自己保存自己
const users = await User.findAll({ where: { age: { $gt: 18 } } });
\`\`\`

**Data Mapper 示例：**
\`\`\`javascript
const repository = getRepository(User);
const user = new User();
user.name = '张三';
await repository.save(user);
\`\`\`

### 3. 模型定义

ORM 模型定义了数据库表的结构映射：

\`\`\`javascript
// Sequelize 风格
const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true },
  age: { type: DataTypes.INTEGER, defaultValue: 0 },
});
\`\`\`

### 4. 关联关系

| 关系类型 | 示例 | ORM 对应 |
|---------|------|----------|
| 一对一 | 用户 ↔ 用户资料 | hasOne / belongsTo |
| 一对多 | 用户 ↔ 订单 | hasMany / belongsTo |
| 多对多 | 学生 ↔ 课程 | belongsToMany |

### 5. 查询构建器（Query Builder）

查询构建器提供**链式调用**来构建 SQL 查询，比原始 SQL 更安全、更易读：

\`\`\`javascript
// Knex 风格查询构建器
const users = await db('users')
  .select('name', 'email')
  .where('age', '>', 18)
  .whereIn('city', ['北京', '上海'])
  .orderBy('name', 'asc')
  .limit(10)
  .offset(0);
\`\`\`

### 6. 常见 ORM 库

- **Sequelize**：最流行的 Node.js ORM，支持 MySQL/PostgreSQL/SQLite/MSSQL
- **TypeORM**：TypeScript 优先的 ORM，支持 Active Record 和 Data Mapper
- **Prisma**：新一代 ORM，自动生成类型安全的客户端
- **Knex**：SQL 查询构建器（非完整 ORM），轻量灵活

### 7. 示例代码说明

下面的代码实现了一个轻量级 ORM，包括：模型定义、字段映射与验证、关联关系（hasMany/belongsTo）、查询构建器链式调用、CRUD 操作。
`,
    code: `// =============================================================
// 轻量级 ORM —— 模拟 Sequelize/Knex 核心功能
// 支持：模型定义、字段映射、关联关系、查询构建器
// =============================================================

// -------------------- 数据存储（模拟数据库） --------------------
const store = {};

// -------------------- 查询构建器 --------------------
class QueryBuilder {
  constructor(tableName) {
    this._table = tableName;
    this._selects = ['*'];
    this._wheres = [];
    this._orderBy = null;
    this._limitVal = null;
    this._offsetVal = 0;
    this._includes = [];
  }

  // 选择字段
  select(...fields) {
    this._selects = fields;
    return this;
  }

  // 等值条件
  where(field, value) {
    this._wheres.push({ field, operator: '=', value });
    return this;
  }

  // 大于条件
  whereGt(field, value) {
    this._wheres.push({ field, operator: '>', value });
    return this;
  }

  // 小于条件
  whereLt(field, value) {
    this._wheres.push({ field, operator: '<', value });
    return this;
  }

  // IN 条件
  whereIn(field, values) {
    this._wheres.push({ field, operator: 'IN', value: values });
    return this;
  }

  // LIKE 条件
  whereLike(field, pattern) {
    this._wheres.push({ field, operator: 'LIKE', value: pattern });
    return this;
  }

  // 排序
  orderBy(field, direction = 'asc') {
    this._orderBy = { field, direction };
    return this;
  }

  // 限制数量
  limit(n) {
    this._limitVal = n;
    return this;
  }

  // 跳过数量
  offset(n) {
    this._offsetVal = n;
    return this;
  }

  // 关联加载
  include(relation) {
    this._includes.push(relation);
    return this;
  }

  // 执行查询
  execute() {
    let rows = (store[this._table] || []).slice();

    // 应用过滤条件
    for (const w of this._wheres) {
      rows = rows.filter(row => {
        switch (w.operator) {
          case '=': return row[w.field] === w.value;
          case '>': return row[w.field] > w.value;
          case '<': return row[w.field] < w.value;
          case 'IN': return w.value.includes(row[w.field]);
          case 'LIKE': {
            const regex = new RegExp(w.value.replace(/%/g, '.*'), 'i');
            return regex.test(row[w.field] || '');
          }
          default: return true;
        }
      });
    }

    // 排序
    if (this._orderBy) {
      const { field, direction } = this._orderBy;
      rows.sort((a, b) => {
        if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
        if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // 分页
    rows = rows.slice(this._offsetVal, this._limitVal ? this._offsetVal + this._limitVal : undefined);

    // 投影（字段选择）
    if (this._selects[0] !== '*') {
      rows = rows.map(row => {
        const projected = {};
        for (const f of this._selects) projected[f] = row[f];
        return projected;
      });
    }

    // 关联加载
    for (const rel of this._includes) {
      rows = rows.map(row => {
        const relatedData = store[rel.table] || [];
        const related = relatedData.filter(r => r[rel.foreignKey] === row[rel.localKey || 'id']);
        return { ...row, [rel.as]: related };
      });
    }

    return rows;
  }
}

// -------------------- 模型基类 --------------------
class Model {
  constructor(data = {}) {
    // 设置默认值
    for (const [field, def] of Object.entries(this.constructor.fields || {})) {
      this[field] = data[field] !== undefined ? data[field] : def.defaultValue;
    }
    // 设置额外字段
    for (const [key, value] of Object.entries(data)) {
      if (this.constructor.fields && this.constructor.fields[key]) {
        this[key] = value;
      }
    }
  }

  // 获取表名（类名小写 + s）
  static get tableName() {
    return this.name.toLowerCase() + 's';
  }

  // 定义模型字段
  static define(fields) {
    this.fields = fields;
    // 初始化存储
    if (!store[this.tableName]) {
      store[this.tableName] = [];
    }
  }

  // 定义关联关系
  static hasMany(targetModel, options = {}) {
    if (!this._relations) this._relations = [];
    this._relations.push({
      type: 'hasMany',
      model: targetModel,
      foreignKey: options.foreignKey || (this.name.toLowerCase() + '_id'),
      as: options.as || targetModel.tableName,
    });
  }

  static belongsTo(targetModel, options = {}) {
    if (!this._relations) this._relations = [];
    this._relations.push({
      type: 'belongsTo',
      model: targetModel,
      foreignKey: options.foreignKey || (targetModel.name.toLowerCase() + '_id'),
      as: options.as || targetModel.name.toLowerCase(),
    });
  }

  // 保存：新增或更新
  async save() {
    // 自动生成 ID
    if (this.id === undefined) {
      const rows = store[this.constructor.tableName] || [];
      this.id = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    }
    // 设置时间戳
    const now = new Date().toISOString();
    const rows = store[this.constructor.tableName];
    const existingIdx = rows.findIndex(r => r.id === this.id);
    if (existingIdx >= 0) {
      this.updated_at = now;
      rows[existingIdx] = { ...this };
    } else {
      this.created_at = now;
      this.updated_at = now;
      rows.push({ ...this });
    }
    return this;
  }

  // 静态查询方法
  static query() {
    return new QueryBuilder(this.tableName);
  }

  static async findAll(options = {}) {
    const qb = new QueryBuilder(this.tableName);
    if (options.where) {
      for (const [k, v] of Object.entries(options.where)) qb.where(k, v);
    }
    if (options.order) {
      for (const [k, v] of Object.entries(options.order)) qb.orderBy(k, v);
    }
    if (options.limit) qb.limit(options.limit);
    if (options.offset) qb.offset(options.offset);
    if (options.include) {
      for (const inc of options.include) qb.include(inc);
    }
    const rows = qb.execute();
    // 将普通对象转换为 Model 实例，保留所有属性
    return rows.map(row => {
      const instance = new this(row);
      // 复制所有非字段属性（如关联数据、时间戳等）
      for (const key of Object.keys(row)) {
        if (!(this.fields && this.fields[key])) {
          instance[key] = row[key];
        }
      }
      return instance;
    });
  }

  static async findOne(where) {
    const results = await this.findAll({ where, limit: 1 });
    return results[0] || null;
  }

  static async findById(id) {
    return this.findOne({ id });
  }

  static async destroy(where) {
    const before = (store[this.tableName] || []).length;
    store[this.tableName] = (store[this.tableName] || []).filter(row => {
      return !Object.entries(where).every(([k, v]) => row[k] === v);
    });
    return before - store[this.tableName].length;
  }
}

// -------------------- 定义模型 --------------------
class User extends Model {}
User.define({
  id: { type: 'INT', defaultValue: undefined },
  name: { type: 'STRING', defaultValue: '' },
  email: { type: 'STRING', defaultValue: '' },
  age: { type: 'INT', defaultValue: 0 },
  city: { type: 'STRING', defaultValue: '' },
});

class Order extends Model {}
Order.define({
  id: { type: 'INT', defaultValue: undefined },
  user_id: { type: 'INT', defaultValue: null },
  product: { type: 'STRING', defaultValue: '' },
  amount: { type: 'DECIMAL', defaultValue: 0 },
  status: { type: 'STRING', defaultValue: 'pending' },
});

// 定义关联关系
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// -------------------- 运行示例 --------------------
async function main() {
  console.log('=== ORM 与查询构建器演示 ===\\n');

  // 创建用户
  const user1 = new User({ name: '张三', email: 'zhangsan@example.com', age: 28, city: '北京' });
  const user2 = new User({ name: '李四', email: 'lisi@example.com', age: 35, city: '上海' });
  const user3 = new User({ name: '王五', email: 'wangwu@example.com', age: 22, city: '北京' });
  await user1.save();
  await user2.save();
  await user3.save();
  console.log('用户创建完成');

  // 创建订单
  const order1 = new Order({ user_id: 1, product: '机械键盘', amount: 399, status: 'completed' });
  const order2 = new Order({ user_id: 1, product: '鼠标', amount: 149, status: 'pending' });
  const order3 = new Order({ user_id: 2, product: '显示器', amount: 2999, status: 'completed' });
  await order1.save();
  await order2.save();
  await order3.save();
  console.log('订单创建完成');

  // 查询构建器：链式调用
  console.log('\\n--- 查询构建器：年龄>25，按年龄降序 ---');
  const adultUsers = User.query()
    .select('id', 'name', 'age', 'city')
    .whereGt('age', 25)
    .orderBy('age', 'desc')
    .execute();
  console.log(adultUsers);

  // 查询构建器：WHERE IN
  console.log('\\n--- 查询构建器：城市 IN [北京, 上海] ---');
  const cityUsers = User.query()
    .whereIn('city', ['北京', '上海'])
    .execute();
  cityUsers.forEach(u => console.log(\`  \${u.name} - \${u.city}\`));

  // 分页查询
  console.log('\\n--- 分页查询：limit 2, offset 0 ---');
  const page1 = User.query().limit(2).offset(0).execute();
  page1.forEach(u => console.log(\`  \${u.name}\`));

  // 关联加载
  console.log('\\n--- 关联加载：用户及其订单 ---');
  const usersWithOrders = await User.findAll({
    include: [{ table: 'orders', foreignKey: 'user_id', localKey: 'id', as: 'orders' }],
  });
  usersWithOrders.forEach(u => {
    console.log(\`  \${u.name} 的订单: \${u.orders.map(o => o.product).join(', ') || '无'}\`);
  });

  // 更新数据
  console.log('\\n--- 更新用户 ---');
  const foundUser = await User.findOne({ id: 1 });
  if (foundUser) {
    foundUser.age = 29;
    foundUser.city = '杭州';
    await foundUser.save();
    console.log(\`  更新后: \${foundUser.name}, \${foundUser.age}岁, \${foundUser.city}\`);
  }

  // 删除数据
  console.log('\\n--- 删除操作 ---');
  const deleted = await User.destroy({ id: 3 });
  console.log(\`  删除了 \${deleted} 条记录\`);
  const remaining = await User.findAll();
  console.log(\`  剩余用户: \${remaining.map(u => u.name).join(', ')}\`);

  console.log('\\n=== 演示完成 ===');
}

main().catch(console.error);
`,
  },

  // =============================================================
  // 第 5 章：事务处理
  // =============================================================
  {
    id: 'node-transaction',
    group: '数据存储',
    icon: '📝',
    title: '事务处理',
    content: `
## 事务处理：保证数据一致性

### 1. ACID 特性

事务是数据库操作的最小逻辑单元，必须满足 ACID 四个特性：

| 特性 | 说明 | 示例 |
|------|------|------|
| **原子性 (Atomicity)** | 事务中的操作要么全部成功，要么全部失败回滚 | 转账：扣款和入款必须同时成功或同时失败 |
| **一致性 (Consistency)** | 事务前后数据必须保持一致状态 | 转账前后总金额不变 |
| **隔离性 (Isolation)** | 并发事务之间互不干扰 | 两个转账操作不会互相看到中间状态 |
| **持久性 (Durability)** | 事务提交后数据永久保存 | 系统崩溃后已提交的数据不丢失 |

### 2. 事务隔离级别

| 级别 | 脏读 | 不可重复读 | 幻读 | 性能 |
|------|------|-----------|------|------|
| READ UNCOMMITTED | ✓ | ✓ | ✓ | 最高 |
| READ COMMITTED | ✗ | ✓ | ✓ | 高 |
| REPEATABLE READ | ✗ | ✗ | ✓ | 中 |
| SERIALIZABLE | ✗ | ✗ | ✗ | 最低 |

MySQL 默认隔离级别为 **REPEATABLE READ**。

### 3. 事务基本操作

\`\`\`javascript
// 使用 Sequelize 事务
const t = await sequelize.transaction();
try {
  const user = await User.create({ name: '张三' }, { transaction: t });
  await Order.create({ userId: user.id, amount: 100 }, { transaction: t });
  await t.commit();  // 提交事务
} catch (error) {
  await t.rollback(); // 回滚事务
}
\`\`\`

### 4. 嵌套事务与 Savepoint

嵌套事务通过在事务内部创建保存点（Savepoint）来实现部分回滚：

\`\`\`sql
BEGIN;
  INSERT INTO users VALUES (1, '张三');
  SAVEPOINT sp1;
    INSERT INTO orders VALUES (1, 100);
  ROLLBACK TO sp1;  -- 只回滚订单插入，用户插入保留
COMMIT;
\`\`\`

### 5. 乐观锁 vs 悲观锁

**悲观锁（Pessimistic Lock）**：假设冲突会发生，操作前先锁定数据。  
\`\`\`sql
SELECT * FROM inventory WHERE id = 1 FOR UPDATE; -- 行级锁
\`\`\`

**乐观锁（Optimistic Lock）**：假设冲突不会发生，提交时检查版本号。  
\`\`\`sql
UPDATE inventory SET stock = stock - 1, version = version + 1
WHERE id = 1 AND version = 5; -- 版本号匹配才更新
\`\`\`

### 6. 分布式事务

跨多个数据库/服务的事务，通常使用 **两阶段提交（2PC）** 或 **Saga 模式** 来保证最终一致性。

### 7. 示例代码说明

下面的代码实现了一个事务管理器，支持：事务的 BEGIN/COMMIT/ROLLBACK、嵌套事务（Savepoint）、乐观锁、操作日志记录。
`,
    code: `// =============================================================
// 事务管理器 —— 支持提交、回滚、嵌套事务、乐观锁
// =============================================================

// -------------------- 数据存储（模拟数据库） --------------------
// 每张表格式：{ rows: [], version: 0 }
const db = {
  accounts: {
    rows: [
      { id: 1, name: '张三', balance: 10000, version: 1 },
      { id: 2, name: '李四', balance: 5000, version: 1 },
    ],
  },
  transfer_logs: {
    rows: [],
  },
};

// -------------------- 事务管理器 --------------------
class Transaction {
  constructor(parent = null) {
    this.parent = parent;                 // 父事务（用于嵌套事务）
    this._snapshots = new Map();          // 操作前的数据快照 { tableName: [...rows] }
    this._pendingOps = [];                // 待执行的操作列表
    this._savepoints = new Map();         // 保存点
    this._committed = false;
    this._rolledBack = false;
    this._depth = parent ? parent._depth + 1 : 0;
  }

  // 获取表数据（考虑当前事务的未提交修改）
  _getTable(tableName) {
    // 如果有快照，使用快照（已修改的数据）
    if (this._snapshots.has(tableName)) {
      return this._snapshots.get(tableName);
    }
    // 否则从父事务或数据库获取
    if (this.parent) {
      return this.parent._getTable(tableName);
    }
    return JSON.parse(JSON.stringify(db[tableName]?.rows || []));
  }

  // 确保表有快照（首次修改时创建快照）
  _ensureSnapshot(tableName) {
    if (!this._snapshots.has(tableName)) {
      this._snapshots.set(tableName, this._getTable(tableName));
    }
  }

  // 插入操作
  insert(tableName, row) {
    if (this._committed || this._rolledBack) {
      throw new Error('事务已结束，无法操作');
    }
    this._ensureSnapshot(tableName);
    const rows = this._snapshots.get(tableName);
    const newRow = { ...row };
    // 自动生成 ID
    if (newRow.id === undefined) {
      newRow.id = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    }
    rows.push(newRow);
    this._pendingOps.push({ type: 'insert', tableName, row: newRow });
    return newRow;
  }

  // 更新操作（支持乐观锁）
  update(tableName, where, updates, options = {}) {
    if (this._committed || this._rolledBack) {
      throw new Error('事务已结束，无法操作');
    }
    this._ensureSnapshot(tableName);
    const rows = this._snapshots.get(tableName);
    let updated = 0;

    for (const row of rows) {
      const match = Object.entries(where).every(([k, v]) => row[k] === v);
      if (!match) continue;

      // 乐观锁：检查版本号
      if (options.optimisticLock && options.expectedVersion !== undefined) {
        if (row.version !== options.expectedVersion) {
          throw new Error(
            \`乐观锁冲突：期望版本 \${options.expectedVersion}，实际版本 \${row.version}\`
          );
        }
      }

      Object.assign(row, updates);
      if (row.version !== undefined) row.version++;
      updated++;
    }

    this._pendingOps.push({ type: 'update', tableName, where, updates });
    return updated;
  }

  // 删除操作
  delete(tableName, where) {
    if (this._committed || this._rolledBack) {
      throw new Error('事务已结束，无法操作');
    }
    this._ensureSnapshot(tableName);
    const rows = this._snapshots.get(tableName);
    const before = rows.length;
    this._snapshots.set(tableName, rows.filter(row => {
      return !Object.entries(where).every(([k, v]) => row[k] === v);
    }));
    const deleted = before - this._snapshots.get(tableName).length;
    this._pendingOps.push({ type: 'delete', tableName, where });
    return deleted;
  }

  // 查询操作（能看到当前事务的未提交修改）
  select(tableName, where = {}) {
    const rows = this._getTable(tableName);
    if (this._snapshots.has(tableName)) {
      // 使用当前事务的快照
      return this._snapshots.get(tableName).filter(row =>
        Object.entries(where).every(([k, v]) => row[k] === v)
      );
    }
    return rows.filter(row =>
      Object.entries(where).every(([k, v]) => row[k] === v)
    );
  }

  // 创建保存点（嵌套事务）
  savepoint(name) {
    if (this._savepoints.has(name)) {
      throw new Error(\`保存点 "\${name}" 已存在\`);
    }
    this._savepoints.set(name, {
      snapshotCount: this._snapshots.size,
      pendingOpsCount: this._pendingOps.length,
      // 深拷贝当前快照
      snapshots: new Map(
        Array.from(this._snapshots).map(([k, v]) => [k, JSON.parse(JSON.stringify(v))])
      ),
    });
    console.log(\`  [SAVEPOINT] 创建保存点: "\${name}"\`);
  }

  // 回滚到保存点
  rollbackTo(name) {
    const sp = this._savepoints.get(name);
    if (!sp) throw new Error(\`保存点 "\${name}" 不存在\`);
    // 恢复快照
    this._snapshots = sp.snapshots;
    this._pendingOps = this._pendingOps.slice(0, sp.pendingOpsCount);
    this._savepoints.delete(name);
    console.log(\`  [ROLLBACK TO] 回滚到保存点: "\${name}"\`);
  }

  // 提交事务
  commit() {
    if (this._committed || this._rolledBack) {
      throw new Error('事务已结束');
    }
    if (this.parent) {
      // 嵌套事务：将修改合并到父事务
      for (const [tableName, rows] of this._snapshots) {
        this.parent._snapshots.set(tableName, rows);
      }
      this.parent._pendingOps.push(...this._pendingOps);
    } else {
      // 顶层事务：写入数据库
      for (const [tableName, rows] of this._snapshots) {
        if (db[tableName]) {
          db[tableName].rows = rows;
        }
      }
    }
    this._committed = true;
    console.log(\`  [COMMIT] 事务提交成功（嵌套层级: \${this._depth}）\`);
  }

  // 回滚事务
  rollback() {
    if (this._committed || this._rolledBack) {
      throw new Error('事务已结束');
    }
    this._rolledBack = true;
    this._snapshots.clear();
    this._pendingOps = [];
    this._savepoints.clear();
    console.log(\`  [ROLLBACK] 事务已回滚（嵌套层级: \${this._depth}）\`);
  }
}

// -------------------- 事务管理器工厂 --------------------
class TransactionManager {
  begin() {
    return new Transaction();
  }
}

// -------------------- 运行示例 --------------------
async function main() {
  console.log('=== 事务管理器演示 ===\\n');

  const tm = new TransactionManager();

  console.log('初始数据:');
  console.log(db.accounts.rows);

  // 示例 1：基本事务 —— 转账
  console.log('\\n--- 示例 1：转账事务（原子性） ---');
  const t1 = tm.begin();
  try {
    const from = t1.select('accounts', { id: 1 })[0];
    const to = t1.select('accounts', { id: 2 })[0];
    console.log(\`  转账前: \${from.name} ¥\${from.balance}, \${to.name} ¥\${to.balance}\`);

    // 扣款
    t1.update('accounts', { id: 1 }, { balance: from.balance - 2000 });
    // 入款
    t1.update('accounts', { id: 2 }, { balance: to.balance + 2000 });
    // 记录日志
    t1.insert('transfer_logs', { from_id: 1, to_id: 2, amount: 2000, time: new Date().toISOString() });

    t1.commit();
    console.log(\`  转账后: 张三 ¥\${t1.select('accounts', { id: 1 })[0].balance}\`);
    console.log(\`  转账后: 李四 ¥\${t1.select('accounts', { id: 2 })[0].balance}\`);
  } catch (err) {
    t1.rollback();
    console.error(\`  转账失败: \${err.message}\`);
  }

  // 示例 2：事务回滚
  console.log('\\n--- 示例 2：事务回滚 ---');
  const t2 = tm.begin();
  try {
    t2.update('accounts', { id: 1 }, { balance: 999999 });
    console.log(\`  修改后（未提交）: 张三 ¥\${t2.select('accounts', { id: 1 })[0].balance}\`);
    throw new Error('模拟业务异常，触发回滚');
    t2.commit();
  } catch (err) {
    console.log(\`  捕获异常: \${err.message}\`);
    t2.rollback();
  }
  console.log(\`  回滚后: 张三 ¥\${db.accounts.rows[0].balance}\`);

  // 示例 3：嵌套事务（Savepoint）
  console.log('\\n--- 示例 3：嵌套事务（保存点） ---');
  const t3 = tm.begin();
  try {
    t3.update('accounts', { id: 1 }, { balance: 15000 });
    console.log(\`  外部事务: 修改张三余额为 ¥15000\`);

    // 创建保存点
    t3.savepoint('sp_order');
    t3.update('accounts', { id: 2 }, { balance: 100 });
    console.log(\`  保存点内: 修改李四余额为 ¥100\`);

    // 回滚保存点
    t3.rollbackTo('sp_order');
    console.log(\`  回滚保存点后: 李四 ¥\${t3.select('accounts', { id: 2 })[0].balance}\`);

    t3.commit();
    console.log(\`  最终提交: 张三 ¥\${db.accounts.rows[0].balance}\`);
  } catch (err) {
    t3.rollback();
  }

  // 示例 4：乐观锁
  console.log('\\n--- 示例 4：乐观锁 ---');
  const t4 = tm.begin();
  try {
    const account = t4.select('accounts', { id: 1 })[0];
    console.log(\`  当前版本: \${account.version}, 余额: ¥\${account.balance}\`);
    // 使用乐观锁更新
    t4.update(
      'accounts',
      { id: 1 },
      { balance: account.balance - 500 },
      { optimisticLock: true, expectedVersion: account.version }
    );
    console.log(\`  乐观锁更新成功\`);
    t4.commit();
  } catch (err) {
    console.error(\`  乐观锁错误: \${err.message}\`);
    t4.rollback();
  }

  // 模拟乐观锁冲突
  console.log('\\n--- 模拟乐观锁冲突 ---');
  const t5 = tm.begin();
  try {
    const account = t5.select('accounts', { id: 1 })[0];
    // 另一个事务先修改了数据
    db.accounts.rows[0].version += 1;
    db.accounts.rows[0].balance -= 100;
    console.log(\`  另一个事务已修改：版本变为 \${db.accounts.rows[0].version}\`);
    // 当前事务尝试用旧版本号更新
    t5.update(
      'accounts',
      { id: 1 },
      { balance: account.balance - 999 },
      { optimisticLock: true, expectedVersion: account.version }
    );
    t5.commit();
  } catch (err) {
    console.error(\`  乐观锁冲突: \${err.message}\`);
    t5.rollback();
  }

  console.log('\\n最终数据:');
  console.log(db.accounts.rows);
  console.log('转账日志:', db.transfer_logs.rows);

  console.log('\\n=== 演示完成 ===');
}

main().catch(console.error);
`,
  },

  // =============================================================
  // 第 6 章：缓存策略
  // =============================================================
  {
    id: 'node-caching',
    group: '数据存储',
    icon: '⚡',
    title: '缓存策略',
    content: `
## 缓存策略：提升系统性能的利器

### 1. 缓存层级

现代应用通常采用多层缓存架构：

| 层级 | 技术 | 访问延迟 | 容量 |
|------|------|---------|------|
| 应用内存 | 本地变量 / Map | < 1μs | MB 级 |
| 本地缓存 | LRU Cache / node-cache | < 1ms | GB 级 |
| 分布式缓存 | Redis / Memcached | < 1ms | TB 级 |
| CDN | CloudFront / Cloudflare | 10-50ms | PB 级 |

### 2. 缓存策略模式

**Cache-Aside（旁路缓存）** — 最常用的模式：
1. 读：先查缓存，命中则返回；未命中则查数据库，写入缓存后返回
2. 写：直接写数据库，然后失效（或更新）缓存

**Read-Through（读穿透）**：缓存层自动查数据库加载数据，对应用透明。

**Write-Through（写穿透）**：写入时同时更新缓存和数据库，保证强一致性。

**Write-Behind（写回）**：先写缓存，异步批量写数据库，提升写入性能但可能丢数据。

### 3. 缓存失效策略

| 策略 | 说明 | 适用场景 |
|------|------|---------|
| **TTL（Time To Live）** | 设置过期时间，到期自动失效 | 大部分场景 |
| **主动失效** | 数据变更时主动删除缓存 | 数据一致性要求高 |
| **LRU（Least Recently Used）** | 淘汰最久未使用的数据 | 内存有限时 |
| **LFU（Least Frequently Used）** | 淘汰使用频率最低的数据 | 热点数据场景 |

### 4. 缓存三大问题

**缓存穿透**：查询不存在的数据，缓存和数据库都查不到。
→ 解决：布隆过滤器、空值缓存（短 TTL）

**缓存击穿**：热点数据过期瞬间，大量请求打到数据库。
→ 解决：互斥锁（只让一个请求查数据库）、永不过期 + 异步刷新

**缓存雪崩**：大量缓存同时过期，数据库压力骤增。
→ 解决：TTL 加随机值、多级缓存、限流降级

### 5. 缓存键设计

好的缓存键应该：唯一、可读、有命名空间。
\`\`\`
格式：{业务模块}:{实体类型}:{标识符}:{条件}
示例：user:profile:12345
      product:list:category:electronics:page:1
\`\`\`

### 6. 示例代码说明

下面的代码实现了：LRU 缓存（双向链表+哈希表）、TTL 缓存、四种缓存策略模式（Cache-Aside/Read-Through/Write-Through/Write-Behind）、缓存穿透防护。
`,
    code: `// =============================================================
// 缓存策略 —— LRU 缓存、TTL 缓存、四种缓存策略模式
// =============================================================

// -------------------- LRU 缓存（双向链表 + 哈希表） --------------------
class LRUCache {
  constructor(capacity = 100) {
    this.capacity = capacity;
    this.cache = new Map(); // key -> Node
    // 哨兵节点（头尾）
    this.head = { key: null, value: null, prev: null, next: null };
    this.tail = { key: null, value: null, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this._size = 0;
    this._hits = 0;
    this._misses = 0;
  }

  // 移除节点
  _removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  // 添加到头部（最近使用）
  _addToHead(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }

  // 移动到头部
  _moveToHead(node) {
    this._removeNode(node);
    this._addToHead(node);
  }

  // 移除尾部节点（最久未使用）
  _removeTail() {
    const node = this.tail.prev;
    if (node === this.head) return null;
    this._removeNode(node);
    return node;
  }

  get(key) {
    const node = this.cache.get(key);
    if (!node) {
      this._misses++;
      return undefined;
    }
    this._hits++;
    this._moveToHead(node);
    return node.value;
  }

  set(key, value) {
    const existing = this.cache.get(key);
    if (existing) {
      existing.value = value;
      this._moveToHead(existing);
      return;
    }
    const node = { key, value, prev: null, next: null };
    this.cache.set(key, node);
    this._addToHead(node);
    this._size++;
    // 超过容量，淘汰最久未使用
    if (this._size > this.capacity) {
      const removed = this._removeTail();
      if (removed) {
        this.cache.delete(removed.key);
        this._size--;
      }
    }
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    const node = this.cache.get(key);
    if (!node) return false;
    this._removeNode(node);
    this.cache.delete(key);
    this._size--;
    return true;
  }

  clear() {
    this.cache.clear();
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this._size = 0;
  }

  get size() { return this._size; }
  get hitRate() {
    const total = this._hits + this._misses;
    return total === 0 ? 0 : (this._hits / total * 100).toFixed(1) + '%';
  }
  get stats() {
    return { hits: this._hits, misses: this._misses, size: this._size, hitRate: this.hitRate };
  }
}

// -------------------- TTL 缓存（带过期时间） --------------------
class TTLCache {
  constructor(defaultTTL = 60000) {
    this.defaultTTL = defaultTTL; // 默认过期时间(ms)
    this.store = new Map();       // key -> { value, expiresAt }
    this._cleanupTimer = setInterval(() => this._cleanup(), defaultTTL);
  }

  set(key, value, ttl) {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    this.store.set(key, { value, expiresAt });
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  has(key) {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  delete(key) {
    return this.store.delete(key);
  }

  // 主动清理过期条目
  _cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  clear() {
    this.store.clear();
  }

  get size() { return this.store.size; }

  destroy() {
    clearInterval(this._cleanupTimer);
    this.store.clear();
  }
}

// -------------------- 模拟数据库 --------------------
const mockDB = {
  users: {
    1: { id: 1, name: '张三', email: 'zhangsan@example.com', age: 28 },
    2: { id: 2, name: '李四', email: 'lisi@example.com', age: 35 },
    3: { id: 3, name: '王五', email: 'wangwu@example.com', age: 22 },
  },
};

async function queryDatabase(id) {
  // 模拟数据库查询延迟
  await new Promise(r => setTimeout(r, 50));
  return mockDB.users[id] || null;
}

// -------------------- 缓存策略模式 --------------------
class CacheStrategyManager {
  constructor(strategy = 'cache-aside', cacheOptions = {}) {
    this.strategy = strategy;
    this.cache = new LRUCache(cacheOptions.lruCapacity || 100);
    this.stats = { dbQueries: 0, cacheHits: 0, cacheMisses: 0 };
    // 防穿透：空值缓存
    this.nullCache = new TTLCache(cacheOptions.nullTTL || 5000);
    // 防击穿：正在加载的 key
    this._loading = new Map();
  }

  async _fetchFromDB(key) {
    this.stats.dbQueries++;
    // 解析缓存键：格式 user:1
    const [, id] = key.split(':');
    return queryDatabase(parseInt(id));
  }

  // Cache-Aside：应用控制缓存逻辑
  async cacheAside(key) {
    // 1. 查缓存
    let data = this.cache.get(key);
    if (data !== undefined) {
      this.stats.cacheHits++;
      return data;
    }
    this.stats.cacheMisses++;

    // 2. 防穿透：检查空值缓存
    if (this.nullCache.has(key)) {
      return null;
    }

    // 3. 防击穿：互斥锁
    if (this._loading.has(key)) {
      return this._loading.get(key);
    }

    // 4. 查数据库并缓存
    const promise = this._fetchFromDB(key).then(result => {
      this._loading.delete(key);
      if (result) {
        this.cache.set(key, result);
      } else {
        // 空值缓存，防止穿透
        this.nullCache.set(key, null);
      }
      return result;
    });

    this._loading.set(key, promise);
    return promise;
  }

  // Read-Through：缓存层自动加载
  async readThrough(key) {
    let data = this.cache.get(key);
    if (data !== undefined) {
      this.stats.cacheHits++;
      return data;
    }
    this.stats.cacheMisses++;
    data = await this._fetchFromDB(key);
    if (data) this.cache.set(key, data);
    return data;
  }

  // Write-Through：同时写缓存和数据库
  async writeThrough(key, value) {
    this.cache.set(key, value);
    // 模拟写入数据库
    await new Promise(r => setTimeout(r, 20));
    console.log(\`  [Write-Through] 数据已同步写入缓存和数据库: \${key}\`);
    return value;
  }

  // Write-Behind：先写缓存，异步写数据库
  async writeBehind(key, value) {
    this.cache.set(key, value);
    // 异步批量写入数据库
    if (!this._writeQueue) this._writeQueue = [];
    this._writeQueue.push({ key, value, timestamp: Date.now() });
    if (!this._flushTimer) {
      this._flushTimer = setTimeout(() => this._flushBehind(), 2000);
    }
    console.log(\`  [Write-Behind] 数据已写入缓存，异步排队写入数据库: \${key}\`);
    return value;
  }

  async _flushBehind() {
    const batch = this._writeQueue;
    this._writeQueue = [];
    this._flushTimer = null;
    console.log(\`  [Write-Behind] 异步批量写入数据库: \${batch.length} 条数据\`);
    // 模拟批量写入
    await new Promise(r => setTimeout(r, 30));
    for (const item of batch) {
      const [, id] = item.key.split(':');
      if (mockDB.users[id]) {
        Object.assign(mockDB.users[id], item.value);
      }
    }
  }

  async get(key) {
    switch (this.strategy) {
      case 'cache-aside': return this.cacheAside(key);
      case 'read-through': return this.readThrough(key);
      default: return this.cacheAside(key);
    }
  }

  async set(key, value) {
    switch (this.strategy) {
      case 'write-through': return this.writeThrough(key, value);
      case 'write-behind': return this.writeBehind(key, value);
      case 'cache-aside':
      default:
        // Cache-Aside 写策略：更新数据库，失效缓存
        const [, id] = key.split(':');
        if (mockDB.users[id]) {
          Object.assign(mockDB.users[id], value);
        }
        this.cache.delete(key);
        await new Promise(r => setTimeout(r, 20));
        return value;
    }
  }
}

// -------------------- 运行示例 --------------------
async function main() {
  console.log('=== 缓存策略演示 ===\\n');

  // 示例 1：LRU 缓存
  console.log('--- 示例 1：LRU 缓存 ---');
  const lru = new LRUCache(3);
  lru.set('a', 1);
  lru.set('b', 2);
  lru.set('c', 3);
  console.log(\`  插入 a,b,c 后缓存大小: \${lru.size}\`);
  lru.get('a'); // 将 a 移到头部
  lru.set('d', 4); // 插入 d，淘汰最久未用的 b
  console.log(\`  访问 a 后插入 d，缓存: \${JSON.stringify([...lru.cache.keys()])}\`);
  console.log(\`  命中率: \${lru.stats.hitRate}\`);

  // 示例 2：TTL 缓存
  console.log('\\n--- 示例 2：TTL 缓存 ---');
  const ttl = new TTLCache(2000);
  ttl.set('session', { userId: 1, role: 'admin' }, 3000);
  console.log(\`  立即获取: \${JSON.stringify(ttl.get('session'))}\`);
  console.log(\`  等待 2.5s 后获取...\`);
  await new Promise(r => setTimeout(r, 2500));
  console.log(\`  2.5s 后获取: \${JSON.stringify(ttl.get('session'))}\`);
  console.log(\`  等待 3.5s 后获取...\`);
  await new Promise(r => setTimeout(r, 1000));
  console.log(\`  3.5s 后获取: \${JSON.stringify(ttl.get('session'))}\`);
  ttl.destroy();

  // 示例 3：Cache-Aside 策略
  console.log('\\n--- 示例 3：Cache-Aside 策略 ---');
  const cacheAsideMgr = new CacheStrategyManager('cache-aside');
  console.log('  第一次查询 user:1（缓存未命中）:');
  const u1 = await cacheAsideMgr.get('user:1');
  console.log(\`  结果: \${u1.name}\`);
  console.log('  第二次查询 user:1（缓存命中）:');
  const u2 = await cacheAsideMgr.get('user:1');
  console.log(\`  结果: \${u2.name}\`);
  console.log(\`  统计: \${JSON.stringify(cacheAsideMgr.stats)}\`);

  // 示例 4：缓存穿透防护
  console.log('\\n--- 示例 4：缓存穿透防护 ---');
  console.log('  查询不存在的 user:999（第一次）:');
  const null1 = await cacheAsideMgr.get('user:999');
  console.log(\`  结果: \${null1}\`);
  console.log('  查询不存在的 user:999（第二次，命中空值缓存）:');
  const null2 = await cacheAsideMgr.get('user:999');
  console.log(\`  结果: \${null2}\`);
  console.log(\`  统计: \${JSON.stringify(cacheAsideMgr.stats)}\`);

  // 示例 5：Write-Through 策略
  console.log('\\n--- 示例 5：Write-Through 策略 ---');
  const writeThroughMgr = new CacheStrategyManager('write-through');
  await writeThroughMgr.set('user:1', { name: '张三(已更新)', age: 29 });
  const updated = await writeThroughMgr.get('user:1');
  console.log(\`  读取更新后的数据: \${JSON.stringify(updated)}\`);

  // 示例 6：缓存雪崩防护 —— TTL 加随机值
  console.log('\\n--- 示例 6：缓存雪崩防护（TTL 随机化） ---');
  const baseTTL = 3000;
  const ttlWithJitter = () => baseTTL + Math.floor(Math.random() * 2000); // 3000-5000ms
  const ttl2 = new TTLCache(3000);
  const keys = ['hot:product:1', 'hot:product:2', 'hot:product:3'];
  for (const key of keys) {
    const jitteredTTL = ttlWithJitter();
    ttl2.set(key, { data: key }, jitteredTTL);
    console.log(\`  \${key} 过期时间: \${jitteredTTL}ms\`);
  }
  console.log('  通过随机化 TTL，避免大量缓存同时过期');
  ttl2.destroy();

  console.log('\\n=== 演示完成 ===');
}

main().catch(console.error);
`,
  },
];

// =============================================================
// 导出
// =============================================================
module.exports = { chapters };