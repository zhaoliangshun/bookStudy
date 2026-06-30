// =============================================================
// 数据库开发教程 —— 第二批章节（SQL 查询进阶篇，共 6 章）
// -------------------------------------------------------------
// 本批聚焦"查询进阶"：WHERE 条件、排序分页、聚合分组、JOIN 连接、子查询、集合操作。
// 所有 code 字段均可在 sqlite3 内存数据库中直接运行。
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：WHERE 条件与运算符
  // =========================================================
  {
    id: "sql-where",
    group: "查询进阶",
    icon: "🔎",
    title: "WHERE 条件与运算符",
    content: `## WHERE 条件与运算符

\`WHERE\` 是 SQL 的"过滤器"，决定哪些行进入结果集。本章讲透各种运算符、模式匹配、NULL 处理——这些是写出正确查询的基础。

### 一、比较运算符

| 运算符 | 含义 | 示例 |
| --- | --- | --- |
| \`=\` | 等于 | \`age = 18\` |
| \`!=\` / \`<>\` | 不等于 | \`age != 18\` |
| \`<\` | 小于 | \`age < 18\` |
| \`>\` | 大于 | \`age > 18\` |
| \`<=\` | 小于等于 | \`age <= 18\` |
| \`>=\` | 大于等于 | \`age >= 18\` |
| \`<=>\` | 安全等于（MySQL，NULL 友好） | \`age <=> NULL\` |

**注意**：SQL 标准用 \`<>\` 表示不等于，\`!=\` 是大多数数据库的扩展。两者通用。

### 二、逻辑运算符

\`\`\`sql
-- AND：两个条件都满足
SELECT * FROM users WHERE age >= 18 AND age <= 30;

-- OR：满足任一条件
SELECT * FROM users WHERE city = '北京' OR city = '上海';

-- NOT：取反
SELECT * FROM users WHERE NOT (age < 18);
\`\`\`

**运算优先级**：\`NOT\` > \`AND\` > \`OR\`。复杂条件务必用括号明确：

\`\`\`sql
-- 推荐：括号明确意图
SELECT * FROM users WHERE (city = '北京' OR city = '上海') AND age >= 18;
\`\`\`

### 三、BETWEEN：范围查询

\`\`\`sql
-- 含边界（闭区间）
SELECT * FROM users WHERE age BETWEEN 18 AND 30;
-- 等价于
SELECT * FROM users WHERE age >= 18 AND age <= 30;

-- NOT BETWEEN
SELECT * FROM users WHERE age NOT BETWEEN 18 AND 30;
\`\`\`

**坑点**：\`BETWEEN\` 是闭区间，包含两端。日期范围查询要小心：

\`\`\`sql
-- ❌ 漏掉 2026-06-29 当天的数据（实际只到 00:00:00）
WHERE created_at BETWEEN '2026-06-01' AND '2026-06-29'

-- ✅ 用 >= 和 <
WHERE created_at >= '2026-06-01' AND created_at < '2026-07-01'
\`\`\`

### 四、IN：枚举匹配

\`\`\`sql
-- 匹配列表中的任一值
SELECT * FROM users WHERE city IN ('北京', '上海', '广州');

-- NOT IN：不在列表中
SELECT * FROM users WHERE city NOT IN ('北京', '上海');

-- 子查询配合 IN
SELECT * FROM orders WHERE user_id IN (SELECT id FROM users WHERE vip = 1);
\`\`\`

**性能提示**：\`IN\` 列表较短时和 \`=\` 等效，较长时（>1000）某些数据库会走不同执行计划。

**NOT IN 的 NULL 陷阱（重要）**：

\`\`\`sql
-- 如果子查询结果含 NULL，NOT IN 会返回空！
SELECT * FROM users WHERE id NOT IN (SELECT user_id FROM banned);
-- 如果 banned.user_id 有 NULL，整个查询返回 0 行
\`\`\`

原因：\`x NOT IN (a, NULL)\` 等价于 \`x != a AND x != NULL\`，而 \`x != NULL\` 永远是 NULL（未知），导致整个条件为 NULL，被过滤掉。

**修复**：\`NOT IN (SELECT ... WHERE user_id IS NOT NULL)\` 或改用 \`NOT EXISTS\`。

### 五、LIKE：模式匹配

\`\`\`sql
-- % 匹配任意数量字符（包括 0 个）
SELECT * FROM users WHERE name LIKE '张%';     -- 张三、张无忌
SELECT * FROM users WHERE name LIKE '%三';     -- 张三、李三
SELECT * FROM users WHERE name LIKE '%张%';    -- 含"张"的

-- _ 匹配单个字符
SELECT * FROM users WHERE name LIKE '张_';    -- 张三（不匹配张无忌）

-- ESCAPE 转义（搜索含 % 或 _ 的字符串）
SELECT * FROM products WHERE name LIKE '50\\%' ESCAPE '\\';
\`\`\`

| 通配符 | 含义 |
| --- | --- |
| \`%\` | 任意长度（含 0）字符 |
| \`_\` | 单个字符 |

**LIKE 的坑点**：

1. **大小写敏感**：SQLite 默认对 ASCII 字母大小写不敏感（\`LIKE\`），但 PostgreSQL 默认敏感（用 \`ILIKE\` 不敏感），MySQL 取决于排序规则。
2. **前缀通配导致索引失效**：
   \`\`\`sql
   -- ✅ 走索引（前缀确定）
   WHERE name LIKE '张%';
   -- ❌ 全表扫描（前缀不确定）
   WHERE name LIKE '%张';
   WHERE name LIKE '%张%';
   \`\`\`
   全文检索场景用 \`FTS\`（全文索引）或专门搜索引擎，而不是 \`LIKE '%...%'\`。

### 六、IS NULL / IS NOT NULL

\`\`\`sql
-- 查 NULL
SELECT * FROM users WHERE email IS NULL;
-- 查非 NULL
SELECT * FROM users WHERE email IS NOT NULL;
\`\`\`

**最大的坑：NULL 比较用 IS，不要用 =**

\`\`\`sql
-- ❌ 永远查不到（NULL = NULL 结果是 NULL，不是 true）
SELECT * FROM users WHERE email = NULL;

-- ✅ 正确写法
SELECT * FROM users WHERE email IS NULL;
\`\`\`

原因：SQL 中 NULL 表示"未知"，\`NULL = NULL\` 的结果是 NULL（不是 true），\`WHERE\` 只接受 true 的行，所以查不到。

**NULL 的三值逻辑**：

| 表达式 | 结果 |
| --- | --- |
| \`NULL = NULL\` | NULL（未知） |
| \`NULL != NULL\` | NULL |
| \`NULL = 1\` | NULL |
| \`NULL IS NULL\` | TRUE |
| \`NULL IS NOT NULL\` | FALSE |

### 七、运算符速查表

| 类别 | 运算符 |
| --- | --- |
| 比较 | \`=\` \`!=\` \`<>\` \`<\` \`>\` \`<=\` \`>=\` |
| 逻辑 | \`AND\` \`OR\` \`NOT\` |
| 范围 | \`BETWEEN\` \`NOT BETWEEN\` |
| 枚举 | \`IN\` \`NOT IN\` |
| 模式 | \`LIKE\` \`NOT LIKE\` |
| NULL | \`IS NULL\` \`IS NOT NULL\` |

### 八、踩坑点

**坑 1：NULL 参与运算**
\`\`\`sql
SELECT 1 + NULL;        -- 结果是 NULL
SELECT NULL OR TRUE;    -- 结果是 TRUE
SELECT NULL AND FALSE;  -- 结果是 FALSE
\`\`\`
聚合时 \`SUM\`/\`AVG\` 等会忽略 NULL，但 \`COUNT(*)\` 不会。

**坑 2：字符串和数字比较**
\`\`\`sql
-- SQLite 中（动态类型）
SELECT '10' < '9';   -- TRUE（字符串比较）
SELECT 10 < 9;       -- FALSE（数字比较）
\`\`\`
类型不同时 SQLite 会按"亲和性"转换，可能导致意外结果。生产中**保持类型一致**。

**坑 3：WHERE 不能用别名**
\`\`\`sql
-- ❌ 报错（WHERE 先执行，别名还不存在）
SELECT salary * 12 AS annual FROM emp WHERE annual > 100000;

-- ✅ 重复表达式
SELECT salary * 12 AS annual FROM emp WHERE salary * 12 > 100000;
\`\`\`

### 九、生产建议

1. **NULL 一律用 IS**：永远不要写 \`x = NULL\`
2. **NOT IN 加 NOT NULL 过滤**：或改用 NOT EXISTS
3. **LIKE 前缀要确定**：\`LIKE 'abc%'\` 才走索引
4. **日期范围用 >= 和 <**：避免 BETWEEN 漏数据
5. **复杂条件加括号**：不要依赖默认优先级
6. **类型保持一致**：字符串和数字不要混比

下面代码演示各种 WHERE 用法。`,
    code: `-- ============================================================
-- 第一章演示：WHERE 条件与运算符
-- ============================================================

CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  city TEXT,
  email TEXT,
  vip INTEGER DEFAULT 0
);

INSERT INTO users (name, age, city, email, vip) VALUES
  ('张三', 28, '北京', 'zhang@example.com', 1),
  ('李四', 34, '上海', 'lisi@example.com', 0),
  ('张无忌', 22, '北京', NULL, 0),
  ('王五', 17, '广州', 'wang@example.com', 0),
  ('赵六', 45, '深圳', 'zhao@example.com', 1),
  ('钱七', 30, '上海', 'qian@example.com', 0),
  ('孙八', NULL, '北京', 'sun@example.com', 0);

-- 1. 比较运算符
SELECT '1. 年龄大于等于30:' AS info;
SELECT name, age FROM users WHERE age >= 30;

-- 2. 逻辑运算符
SELECT '2. 北京或上海的VIP:' AS info;
SELECT name, city, vip FROM users WHERE (city = '北京' OR city = '上海') AND vip = 1;

-- 3. BETWEEN
SELECT '3. 年龄在 18-30 之间:' AS info;
SELECT name, age FROM users WHERE age BETWEEN 18 AND 30;

-- 4. IN
SELECT '4. 一线城市:' AS info;
SELECT name, city FROM users WHERE city IN ('北京', '上海', '广州', '深圳');

-- 5. LIKE 模式匹配
SELECT '5. 姓张的人:' AS info;
SELECT name FROM users WHERE name LIKE '张%';

SELECT '5. 名字两个字:' AS info;
SELECT name FROM users WHERE name LIKE '__';

-- 6. IS NULL / IS NOT NULL
SELECT '6. 没邮箱的人:' AS info;
SELECT name FROM users WHERE email IS NULL;

SELECT '6. 有年龄的人:' AS info;
SELECT name FROM users WHERE age IS NOT NULL;

-- 7. NULL 比较的坑
SELECT '7. NULL 比较演示:' AS info;
SELECT 'NULL = NULL 查不到（0 行）:' AS msg;
SELECT name FROM users WHERE email = NULL;

SELECT 'IS NULL 才能查到:' AS msg;
SELECT name FROM users WHERE email IS NULL;

-- 8. NOT IN 的 NULL 陷阱
SELECT '8. NOT IN 陷阱演示:' AS info;
CREATE TABLE banned (user_id INTEGER);
INSERT INTO banned VALUES (3), (NULL);

SELECT 'NOT IN 含 NULL → 返回 0 行:' AS msg;
SELECT name FROM users WHERE id NOT IN (SELECT user_id FROM banned);

SELECT '过滤掉 NULL 后正常:' AS msg;
SELECT name FROM users WHERE id NOT IN (SELECT user_id FROM banned WHERE user_id IS NOT NULL);

-- 9. 复合条件
SELECT '9. 北京 25 岁以上 VIP:' AS info;
SELECT name, age, city FROM users WHERE city = '北京' AND age > 25 AND vip = 1;`,
  },

  // =========================================================
  // 第二章：排序与分页
  // =========================================================
  {
    id: "sql-order-limit",
    group: "查询进阶",
    icon: "📑",
    title: "排序与分页",
    content: `## 排序与分页

排序（\`ORDER BY\`）和分页（\`LIMIT/OFFSET\`）是用户界面的基石。看似简单，大表上却有严重的性能陷阱。本章讲透排序规则、稳定排序、游标分页。

### 一、ORDER BY 基础

\`\`\`sql
-- 升序（ASC，默认）
SELECT * FROM users ORDER BY age ASC;
SELECT * FROM users ORDER BY age;  -- 等价

-- 降序（DESC）
SELECT * FROM users ORDER BY age DESC;
\`\`\`

### 二、多列排序

\`\`\`sql
-- 先按部门升序，部门相同再按工资降序
SELECT * FROM employees ORDER BY department ASC, salary DESC;
\`\`\`

排序优先级从左到右递减。第一列相同时才看第二列。

### 三、NULL 的排序位置

不同数据库 NULL 的默认位置不同：

| 数据库 | 默认 NULL 位置（升序） |
| --- | --- |
| SQLite | NULL 最前 |
| PostgreSQL | NULL 最后 |
| MySQL | NULL 最前 |
| Oracle | NULL 最后 |

SQLite 3.30+ 支持 \`NULLS FIRST\` / \`NULLS LAST\` 显式指定：

\`\`\`sql
-- NULL 排在最后
SELECT * FROM users ORDER BY age ASC NULLS LAST;

-- NULL 排在最前
SELECT * FROM users ORDER BY age DESC NULLS FIRST;
\`\`\`

MySQL 不支持 \`NULLS FIRST/LAST\`，用技巧：

\`\`\`sql
-- MySQL：升序时 NULL 排最后
ORDER BY (age IS NULL), age ASC;
\`\`\`

### 四、按表达式排序

\`\`\`sql
-- 按计算字段排序
SELECT name, price * quantity AS total FROM orders ORDER BY total DESC;

-- 按字符串长度排序
SELECT name FROM users ORDER BY LENGTH(name) DESC;

-- 用 CASE 自定义排序顺序
SELECT * FROM products ORDER BY CASE status
  WHEN 'urgent' THEN 1
  WHEN 'normal' THEN 2
  WHEN 'low' THEN 3
  ELSE 4
END;
\`\`\`

### 五、按列序号排序

\`\`\`sql
-- 按 SELECT 中第 2 列排序（不推荐，脆弱）
SELECT name, age FROM users ORDER BY 2;
-- 等价于 ORDER BY age
\`\`\`

**踩坑**：列序号易出错（加列后顺序变），生产环境**用列名**。

### 六、LIMIT 与 OFFSET 分页

\`\`\`sql
-- 取前 10 条
SELECT * FROM users ORDER BY id LIMIT 10;

-- 第 2 页（每页 10 条）
SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 10;

-- 第 3 页
SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 20;

-- 简写：LIMIT 偏移, 数量
SELECT * FROM users ORDER BY id LIMIT 20, 10;
\`\`\`

**OFFSET 的原理**：数据库要"扫描并丢弃"前 N 行，所以 OFFSET 越大越慢。

### 七、大表分页的性能问题

\`\`\`sql
-- ❌ 翻到第 10000 页（OFFSET 100000）
SELECT * FROM orders ORDER BY id LIMIT 10 OFFSET 100000;
-- 要扫描 100010 行，丢弃前 10 万行，极慢
\`\`\`

**问题**：OFFSET 是 O(N) 操作，翻得越深越慢。

### 八、游标分页（推荐）

用上一页最后一条的 ID 作为"游标"，下一页从它之后开始：

\`\`\`sql
-- 第一页
SELECT id, name FROM orders ORDER BY id ASC LIMIT 10;
-- 假设最后一条 id = 10

-- 第二页：从 id > 10 开始
SELECT id, name FROM orders WHERE id > 10 ORDER BY id ASC LIMIT 10;
\`\`\`

**优点**：
- 不管翻多深，都是 O(1)（索引定位 + 取 N 行）
- 不受中间数据变动影响（其他人插入/删除不影响）

**缺点**：
- 不能跳页（只能上一页/下一页）
- 排序字段必须唯一且有索引

### 九、稳定排序

如果排序字段有重复值，行的相对顺序**不保证**（数据库返回顺序可能不稳定）。

\`\`\`sql
-- ❌ 不稳定：age 相同时，顺序不可预测
SELECT * FROM users ORDER BY age;

-- ✅ 稳定：加第二排序键（如主键）
SELECT * FROM users ORDER BY age, id;
\`\`\`

**生产建议**：分页查询的 \`ORDER BY\` **必须包含唯一字段**（通常是主键），否则翻页可能出现重复或漏数据。

### 十、踩坑点

**坑 1：忘记 ORDER BY，依赖"自然顺序"**
\`\`\`sql
-- ❌ 没排序，顺序"看起来"按插入顺序，但实际不保证
SELECT * FROM users LIMIT 10;
-- 数据库重整理后顺序可能变
\`\`\`
**永远显式 ORDER BY**，分页查询尤其如此。

**坑 2：OFFSET 大值慢**
\`\`\`sql
-- 大表上 OFFSET 100000 要几秒
-- 改用游标分页
\`\`\`

**坑 3：排序字段无索引**
\`ORDER BY\` 的字段没索引时，数据库要"文件排序"（filesort），数据量大时很慢。给常用排序字段加索引。

**坑 4：LIMIT 不保证返回行数**
\`LIMIT 10\` 可能返回少于 10 行（数据不足或被 WHERE 过滤）。应用层不要假设正好 10 行。

### 十一、生产建议

1. **分页必带 ORDER BY + 唯一字段**：保证稳定
2. **深分页用游标**：避免大 OFFSET
3. **排序字段加索引**：避免 filesort
4. **预估页数**：\`SELECT COUNT(*)\` 算总页数（大表用近似值）
5. **限制最大 OFFSET**：超过 1 万行强制走游标

下面代码演示排序与分页。`,
    code: `-- ============================================================
-- 第二章演示：排序与分页
-- ============================================================

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  salary REAL,
  hire_date TEXT
);

INSERT INTO employees (name, department, salary, hire_date) VALUES
  ('张三', '技术部', 25000, '2023-03-15'),
  ('李四', '市场部', 18000, '2022-08-20'),
  ('王五', '技术部', 30000, '2021-01-10'),
  ('赵六', '人事部', 15000, '2024-02-01'),
  ('孙七', '市场部', 22000, '2023-11-05'),
  ('周八', '技术部', 30000, '2022-06-18'),
  ('吴九', '人事部', 16000, '2023-09-12'),
  ('郑十', '技术部', 28000, '2020-12-01'),
  ('钱十一', '市场部', 19000, '2024-01-15'),
  ('孙十二', '技术部', 27000, '2023-07-20');

-- 1. 单列排序
SELECT '1. 按工资降序:' AS info;
SELECT name, salary FROM employees ORDER BY salary DESC;

-- 2. 多列排序（部门升序，工资降序）
SELECT '2. 部门升序+工资降序:' AS info;
SELECT name, department, salary FROM employees ORDER BY department ASC, salary DESC;

-- 3. NULL 排序位置
CREATE TABLE nullable (id INTEGER PRIMARY KEY, val INTEGER);
INSERT INTO nullable (val) VALUES (5), (NULL), (3), (NULL), (8);

SELECT '3. 默认 NULL 排序:' AS info;
SELECT id, val FROM nullable ORDER BY val ASC;

SELECT '3. NULLS LAST:' AS info;
SELECT id, val FROM nullable ORDER BY val ASC NULLS LAST;

SELECT '3. NULLS FIRST:' AS info;
SELECT id, val FROM nullable ORDER BY val DESC NULLS FIRST;

-- 4. LIMIT 分页（每页 3 条）
SELECT '4. 第 1 页:' AS info;
SELECT id, name, salary FROM employees ORDER BY id ASC LIMIT 3;

SELECT '4. 第 2 页:' AS info;
SELECT id, name, salary FROM employees ORDER BY id ASC LIMIT 3 OFFSET 3;

SELECT '4. 第 3 页:' AS info;
SELECT id, name, salary FROM employees ORDER BY id ASC LIMIT 3 OFFSET 6;

-- 5. 稳定排序（工资相同用 id 兜底）
SELECT '5. 稳定排序（salary 相同时按 id）:' AS info;
SELECT id, name, salary FROM employees ORDER BY salary DESC, id ASC;

-- 6. 游标分页演示
-- 第一页：取前 3 条
SELECT '6. 游标分页 - 第 1 页（记录最后 id=3）:' AS info;
SELECT id, name FROM employees ORDER BY id ASC LIMIT 3;

-- 第二页：id > 3
SELECT '6. 游标分页 - 第 2 页（id > 3）:' AS info;
SELECT id, name FROM employees WHERE id > 3 ORDER BY id ASC LIMIT 3;

-- 第三页：id > 6
SELECT '6. 游标分页 - 第 3 页（id > 6）:' AS info;
SELECT id, name FROM employees WHERE id > 6 ORDER BY id ASC LIMIT 3;

-- 7. 按表达式排序
SELECT '7. 按工龄排序（hire_date 早的在前）:' AS info;
SELECT name, hire_date FROM employees ORDER BY hire_date ASC LIMIT 5;

-- 8. 用 CASE 自定义排序优先级
SELECT '8. 自定义状态排序:' AS info;
CREATE TABLE tasks (id INTEGER PRIMARY KEY, name TEXT, status TEXT);
INSERT INTO tasks (name, status) VALUES
  ('设计文档', 'done'),
  ('写代码', 'urgent'),
  ('测试', 'normal'),
  ('部署', 'low'),
  ('修复 bug', 'urgent');

SELECT name, status FROM tasks ORDER BY CASE status
  WHEN 'urgent' THEN 1
  WHEN 'normal' THEN 2
  WHEN 'done' THEN 3
  ELSE 4
END;`,
  },

  // =========================================================
  // 第三章：聚合函数与分组
  // =========================================================
  {
    id: "sql-aggregate",
    group: "查询进阶",
    icon: "📊",
    title: "聚合函数与分组",
    content: `## 聚合函数与分组

聚合函数把多行变成一行（\`COUNT\`、\`SUM\`、\`AVG\`...），\`GROUP BY\` 把数据分组后分别聚合。这是数据分析的核心能力。

### 一、五大聚合函数

| 函数 | 作用 | 示例 |
| --- | --- | --- |
| \`COUNT(*)\` | 行数（含 NULL 行） | \`COUNT(*)\` |
| \`COUNT(列)\` | 非 NULL 行数 | \`COUNT(email)\` |
| \`SUM(列)\` | 求和（忽略 NULL） | \`SUM(salary)\` |
| \`AVG(列)\` | 平均值（忽略 NULL） | \`AVG(salary)\` |
| \`MIN(列)\` | 最小值（忽略 NULL） | \`MIN(salary)\` |
| \`MAX(列)\` | 最大值（忽略 NULL） | \`MAX(salary)\` |

\`\`\`sql
SELECT
  COUNT(*) AS 总人数,
  AVG(salary) AS 平均工资,
  MIN(salary) AS 最低工资,
  MAX(salary) AS 最高工资,
  SUM(salary) AS 工资总和
FROM employees;
\`\`\`

### 二、COUNT 的三种写法（重点）

\`\`\`sql
-- 1. COUNT(*)：统计所有行（含 NULL）
SELECT COUNT(*) FROM users;  -- 100（表里有 100 行）

-- 2. COUNT(列)：统计该列非 NULL 的行数
SELECT COUNT(email) FROM users;  -- 80（20 个没填邮箱）

-- 3. COUNT(DISTINCT 列)：去重后统计
SELECT COUNT(DISTINCT city) FROM users;  -- 不同城市的数量
\`\`\`

**三者区别（重要）**：

| 写法 | 含义 | 是否忽略 NULL |
| --- | --- | --- |
| \`COUNT(*)\` | 行数 | 否（含 NULL 行） |
| \`COUNT(列)\` | 该列非 NULL 行数 | 是 |
| \`COUNT(DISTINCT 列)\` | 不同值数量 | 是 |

**踩坑**：想统计行数用 \`COUNT(*)\`，不要用 \`COUNT(1)\` 或 \`COUNT(主键)\`。现代数据库对 \`COUNT(*)\` 有优化，\`COUNT(列)\` 反而慢（要检查每行是否 NULL）。

### 三、聚合函数忽略 NULL

\`SUM\`/\`AVG\`/\`MIN\`/\`MAX\` 会**自动忽略 NULL**：

\`\`\`sql
-- 假设有 3 行：salary = 100, 200, NULL
SELECT AVG(salary) FROM t;  -- 结果是 150（不是 100）
-- AVG = (100 + 200) / 2，NULL 不算
SELECT SUM(salary) FROM t;  -- 结果是 300
\`\`\`

**注意**：\`AVG\` 忽略 NULL，不是把 NULL 当 0。如果想"NULL 当 0"：

\`\`\`sql
SELECT AVG(COALESCE(salary, 0)) FROM t;  -- 结果是 100（(100+200+0)/3）
\`\`\`

### 四、GROUP BY 分组

\`\`\`sql
-- 按部门分组，统计每个部门人数和平均工资
SELECT
  department,
  COUNT(*) AS 人数,
  AVG(salary) AS 平均工资
FROM employees
GROUP BY department;
\`\`\`

**执行逻辑**：
1. FROM 取数据
2. WHERE 过滤行
3. GROUP BY 分组
4. 聚合函数对每组计算
5. HAVING 过滤组
6. SELECT 输出
7. ORDER BY 排序

### 五、HAVING：分组后过滤

\`WHERE\` 在分组前过滤行，\`HAVING\` 在分组后过滤组。**HAVING 可以用聚合函数，WHERE 不行**。

\`\`\`sql
-- 找平均工资大于 2 万的部门
SELECT department, AVG(salary) AS avg_salary
FROM employees
GROUP BY department
HAVING AVG(salary) > 20000;
\`\`\`

**WHERE vs HAVING**：

| | 作用时机 | 能否用聚合 | 能否用别名 |
| --- | --- | --- | --- |
| \`WHERE\` | 分组前过滤行 | 否 | 否 |
| \`HAVING\` | 分组后过滤组 | 是 | 部分（标准 SQL 不行，MySQL/SQLite 行） |

\`\`\`sql
-- ❌ WHERE 不能用聚合
SELECT dept, COUNT(*) FROM emp WHERE COUNT(*) > 5 GROUP BY dept;

-- ✅ HAVING 用聚合
SELECT dept, COUNT(*) AS cnt FROM emp GROUP BY dept HAVING COUNT(*) > 5;
\`\`\`

### 六、多列分组

\`\`\`sql
-- 按部门 + 城市双维度分组
SELECT
  department,
  city,
  COUNT(*) AS 人数,
  AVG(salary) AS 平均工资
FROM employees
GROUP BY department, city;
\`\`\`

多列分组 = 这些列的"组合"作为分组键。

### 七、GROUP BY 与 SELECT 列的关系（标准 SQL）

**标准 SQL 规则**：用了 \`GROUP BY\` 后，\`SELECT\` 中的非聚合列必须出现在 \`GROUP BY\` 中。

\`\`\`sql
-- ✅ 合法（name 在 GROUP BY 中）
SELECT department, name, COUNT(*) FROM emp GROUP BY department, name;

-- ❌ 标准不允许（name 不在 GROUP BY 中）
SELECT department, name, COUNT(*) FROM emp GROUP BY department;
-- name 该取哪一行的？不确定
\`\`\`

**例外**：MySQL 的 \`ONLY_FULL_GROUP_BY\` 关闭时允许（取任意一行的值，结果不确定）。SQLite 也允许，取"第一行"的值。**生产环境应避免**这种写法，结果不可预测。

### 八、聚合函数的 DISTINCT

\`\`\`sql
-- 不同城市的数量
SELECT COUNT(DISTINCT city) FROM users;

-- 不同工资的总和
SELECT SUM(DISTINCT salary) FROM users;

-- 不同工资的平均
SELECT AVG(DISTINCT salary) FROM users;
\`\`\`

**性能提示**：\`DISTINCT\` 需要去重，比非 DISTINCT 慢。

### 九、GROUP_CONCAT：分组拼接（SQLite 特性）

\`\`\`sql
-- 把每个部门的人名拼成字符串
SELECT department, GROUP_CONCAT(name, ', ') AS members
FROM employees
GROUP BY department;
-- 结果：技术部 → "张三, 王五, 周八"
\`\`\`

其他数据库：MySQL 也有 \`GROUP_CONCAT\`，PostgreSQL 用 \`STRING_AGG\`，Oracle 用 \`LISTAGG\`。

### 十、踩坑点

**坑 1：AVG 忽略 NULL 的语义**
\`\`\`sql
-- 3 个学生：分数 80, 90, NULL（缺考）
SELECT AVG(score) FROM students;  -- 85（不是 56.67）
-- 缺考的不算分母
\`\`\`
如果业务要求"缺考算 0 分"，用 \`AVG(COALESCE(score, 0))\`。

**坑 2：COUNT(列) 漏掉 NULL 行**
\`\`\`sql
-- ❌ 想统计用户数，但用 COUNT(email)
SELECT COUNT(email) FROM users;  -- 漏掉没填邮箱的

-- ✅ 用 COUNT(*) 或 COUNT(id)
SELECT COUNT(*) FROM users;
\`\`\`

**坑 3：HAVING 用别名（兼容性）**
\`\`\`sql
-- MySQL/SQLite 行，PostgreSQL/Oracle 部分场景不行
SELECT dept, AVG(salary) AS avg_sal FROM emp GROUP BY dept HAVING avg_sal > 20000;
-- 标准写法：HAVING AVG(salary) > 20000
\`\`\`

**坑 4：分组字段有 NULL**
\`\`\`sql
-- NULL 会被当作一个独立分组
SELECT city, COUNT(*) FROM users GROUP BY city;
-- 结果会有一行 city=NULL 的组
\`\`\`

**坑 5：SELECT 非聚合列不在 GROUP BY**
\`\`\`sql
SELECT department, name, COUNT(*) FROM emp GROUP BY department;
-- name 的值不确定（SQLite 取第一行，但不可预测）
\`\`\`

### 十一、生产建议

1. **统计行数用 COUNT(\*)**：不要用 COUNT(1) 或 COUNT(主键)
2. **HAVING 用聚合表达式**：不用别名，兼容性好
3. **GROUP BY 列出所有非聚合列**：避免不确定结果
4. **聚合列加索引**：\`GROUP BY\` 字段有索引时分组更快
5. **大数据量预聚合**：用物化视图或汇总表，避免实时聚合

下面代码演示聚合与分组。`,
    code: `-- ============================================================
-- 第三章演示：聚合函数与分组
-- ============================================================

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  city TEXT,
  salary REAL,
  age INTEGER
);

INSERT INTO employees (name, department, city, salary, age) VALUES
  ('张三', '技术部', '北京', 25000, 28),
  ('李四', '市场部', '上海', 18000, 34),
  ('王五', '技术部', '北京', 30000, 32),
  ('赵六', '人事部', '广州', 15000, 26),
  ('孙七', '市场部', '上海', 22000, 29),
  ('周八', '技术部', '深圳', 28000, 31),
  ('吴九', '人事部', '广州', 16000, 27),
  ('郑十', '技术部', '北京', 28000, 30),
  ('钱十一', '市场部', '上海', 19000, 25),
  ('孙十二', '技术部', '北京', NULL, 28);

-- 1. 基础聚合
SELECT '1. 全表聚合:' AS info;
SELECT
  COUNT(*) AS 总人数,
  AVG(salary) AS 平均工资,
  MIN(salary) AS 最低工资,
  MAX(salary) AS 最高工资,
  SUM(salary) AS 工资总和
FROM employees;

-- 2. COUNT 三种写法
SELECT '2. COUNT 区别（注意 salary 有 NULL）:' AS info;
SELECT
  COUNT(*) AS 总行数,
  COUNT(salary) AS 非空工资数,
  COUNT(DISTINCT department) AS 不同部门数
FROM employees;

-- 3. AVG 忽略 NULL
SELECT '3. AVG 演示（NULL 不算入分母）:' AS info;
SELECT
  AVG(salary) AS 默认平均,
  AVG(COALESCE(salary, 0)) AS NULL当0平均
FROM employees;

-- 4. GROUP BY 单列
SELECT '4. 按部门分组:' AS info;
SELECT
  department,
  COUNT(*) AS 人数,
  AVG(salary) AS 平均工资,
  MAX(salary) AS 最高工资
FROM employees
GROUP BY department
ORDER BY 平均工资 DESC;

-- 5. HAVING 过滤分组
SELECT '5. 平均工资 > 20000 的部门:' AS info;
SELECT
  department,
  COUNT(*) AS 人数,
  AVG(salary) AS 平均工资
FROM employees
GROUP BY department
HAVING AVG(salary) > 20000;

-- 6. 多列分组
SELECT '6. 部门+城市双维度:' AS info;
SELECT
  department,
  city,
  COUNT(*) AS 人数
FROM employees
GROUP BY department, city
ORDER BY department, city;

-- 7. WHERE vs HAVING
SELECT '7. WHERE 过滤行（先过滤再分组）:' AS info;
SELECT department, COUNT(*) AS 人数
FROM employees
WHERE salary > 18000
GROUP BY department;

SELECT '7. HAVING 过滤组（先分组再过滤）:' AS info;
SELECT department, COUNT(*) AS 人数
FROM employees
GROUP BY department
HAVING COUNT(*) > 2;

-- 8. GROUP_CONCAT 拼接
SELECT '8. 各部门成员:' AS info;
SELECT
  department,
  GROUP_CONCAT(name, ', ') AS 成员
FROM employees
GROUP BY department;

-- 9. DISTINCT 在聚合中
SELECT '9. 不同城市数量:' AS info;
SELECT COUNT(DISTINCT city) AS 不同城市数 FROM employees;

-- 10. NULL 分组演示
SELECT '10. NULL 也会形成一组:' AS info;
SELECT
  CASE WHEN salary IS NULL THEN '无工资' ELSE '有工资' END AS 工资状态,
  COUNT(*) AS 人数
FROM employees
GROUP BY 工资状态;`,
  },

  // =========================================================
  // 第四章：JOIN 连接查询
  // =========================================================
  {
    id: "sql-join",
    group: "查询进阶",
    icon: "🔗",
    title: "JOIN 连接查询",
    content: `## JOIN 连接查询

JOIN 把多张表按关联条件"横向拼接"。这是关系型数据库的核心能力，也是性能问题的高发区。本章讲透各种 JOIN 的语义、执行原理、性能优化。

### 一、JOIN 类型一览

| 类型 | 含义 | 保留 |
| --- | --- | --- |
| \`INNER JOIN\` | 两表都匹配的行 | 都不保留 NULL |
| \`LEFT JOIN\` | 左表全 + 右表匹配 | 保留左表 NULL |
| \`RIGHT JOIN\` | 右表全 + 左表匹配 | 保留右表 NULL |
| \`FULL OUTER JOIN\` | 两表全 | 都保留 NULL |
| \`CROSS JOIN\` | 笛卡尔积 | 全组合 |

### 二、INNER JOIN：内连接

只返回两表都匹配的行。

\`\`\`sql
SELECT e.name, d.name AS department
FROM employees e
INNER JOIN departments d ON e.dept_id = d.id;
\`\`\`

**语义**：员工有部门（dept_id 在 departments 中存在）才返回。没部门的员工、没员工的部门都不出现。

### 三、LEFT JOIN：左连接

保留左表全部行，右表没匹配的填 NULL。

\`\`\`sql
SELECT e.name, d.name AS department
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id;
-- 没部门的员工也会出现，department 为 NULL
\`\`\`

**典型用途**：查"主表全部 + 关联信息（可能没有）"。

### 四、RIGHT JOIN：右连接

保留右表全部，左表没匹配的填 NULL。语义上等价于把 LEFT JOIN 的两表调换。

\`\`\`sql
SELECT e.name, d.name AS department
FROM employees e
RIGHT JOIN departments d ON e.dept_id = d.id;
-- 没员工的部门也会出现，name 为 NULL
\`\`\`

**注意**：SQLite 3.39（2022）才支持 RIGHT JOIN。早期版本用 \`SELECT ... FROM departments LEFT JOIN employees\` 替代。

### 五、FULL OUTER JOIN：全连接

两表全保留，没匹配的都填 NULL。

\`\`\`sql
SELECT e.name, d.name AS department
FROM employees e
FULL OUTER JOIN departments d ON e.dept_id = d.id;
\`\`\`

**注意**：SQLite 不支持 FULL OUTER JOIN。用 LEFT JOIN + UNION + RIGHT JOIN 模拟：

\`\`\`sql
SELECT e.name, d.name AS dept FROM employees e LEFT JOIN departments d ON e.dept_id = d.id
UNION
SELECT e.name, d.name AS dept FROM employees e RIGHT JOIN departments d ON e.dept_id = d.id;
\`\`\`

### 六、CROSS JOIN：笛卡尔积

返回两表所有行的组合（M 行 × N 行 = M×N 行）。

\`\`\`sql
SELECT * FROM colors CROSS JOIN sizes;
-- 3 种颜色 × 4 种尺寸 = 12 行
\`\`\`

**慎用**：没写 ON 条件的 \`INNER JOIN\` 也会变成 CROSS JOIN：

\`\`\`sql
SELECT * FROM a, b;          -- 等价于 CROSS JOIN，笛卡尔积
SELECT * FROM a JOIN b;      -- 也是笛卡尔积（没 ON）
\`\`\`

### 七、自连接（Self Join）

一张表和自己 JOIN，用别名区分。

\`\`\`sql
-- 员工和他们的经理（都在 employees 表）
SELECT e.name AS 员工, m.name AS 经理
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
\`\`\`

**典型场景**：树形结构（分类、组织架构）、相邻行比较。

### 八、多表 JOIN

\`\`\`sql
SELECT e.name, d.name AS dept, p.name AS project
FROM employees e
JOIN departments d ON e.dept_id = d.id
JOIN projects p ON e.id = p.leader_id;
\`\`\`

**性能**：每多一个 JOIN，数据量可能指数增长。3 个表 JOIN 通常没问题，5 个以上要小心。

### 九、JOIN 执行原理

数据库执行 JOIN 有三种算法：

| 算法 | 原理 | 适用 |
| --- | --- | --- |
| **Nested Loop** | 外层循环每行，内层扫描匹配 | 通用，小表驱动大表 |
| **Hash Join** | 小表建哈希表，大表探测 | 等值连接，大数据（PostgreSQL/MySQL 8） |
| **Merge Join** | 两表按连接键排序后归并 | 等值连接，已排序数据 |

**SQLite 只用 Nested Loop**（小数据量够用）。大表 JOIN 要靠索引加速。

### 十、ON vs WHERE 的区别

\`\`\`sql
-- INNER JOIN：ON 和 WHERE 等效
SELECT * FROM a JOIN b ON a.id = b.id WHERE b.flag = 1;
SELECT * FROM a JOIN b ON a.id = b.id AND b.flag = 1;  -- 同样

-- OUTER JOIN：区别明显
-- LEFT JOIN + ON：右表的条件放在 ON，左表仍保留全部
SELECT * FROM a LEFT JOIN b ON a.id = b.id AND b.flag = 1;
-- 即使 b.flag != 1，a 的行还在（b 字段为 NULL）

-- LEFT JOIN + WHERE：右表条件放 WHERE，会过滤掉左表
SELECT * FROM a LEFT JOIN b ON a.id = b.id WHERE b.flag = 1;
-- b.flag != 1 或 b.flag IS NULL 的 a 行都没了
\`\`\`

**规则**：LEFT JOIN 后想保留左表全部，右表过滤条件放 ON；想真正过滤左表，放 WHERE。

### 十一、踩坑点

**坑 1：忘记 ON 条件变成笛卡尔积**
\`\`\`sql
SELECT * FROM a, b;  -- 笛卡尔积，可能爆数据量
\`\`\`
老式隐式 JOIN（\`FROM a, b WHERE a.id=b.id\`）忘写 WHERE 就是笛卡尔积。**推荐显式 JOIN ... ON**。

**坑 2：LEFT JOIN 被退化成 INNER JOIN**
\`\`\`sql
-- 想保留左表全部，但右表条件放 WHERE 导致退化
SELECT * FROM emp LEFT JOIN dept ON emp.dept_id = dept.id
WHERE dept.status = 'active';
-- dept.status 为 NULL 的（没部门的员工）被过滤掉了，等价于 INNER JOIN
\`\`\`
**修复**：右表条件放 ON：
\`\`\`sql
SELECT * FROM emp LEFT JOIN dept ON emp.dept_id = dept.id AND dept.status = 'active';
\`\`\`

**坑 3：JOIN 多表性能差**
\`\`\`sql
-- 5 个大表 JOIN，可能几秒甚至几十秒
\`\`\`
优化：
1. 给连接字段加索引（外键 + 主键）
2. 小表驱动大表（小表放左边）
3. 提前 WHERE 过滤（减少 JOIN 数据量）
4. 只 SELECT 需要的列

**坑 4：JOIN 产生重复行**
\`\`\`sql
-- 一个员工多个项目，JOIN 后员工重复
SELECT e.name FROM emp JOIN projects p ON e.id = p.leader_id;
-- 用 DISTINCT 去重，或改用子查询
\`\`\`

**坑 5：NULL 匹配**
\`\`\`sql
-- ON 条件里 NULL = NULL 不匹配
SELECT * FROM a JOIN b ON a.code = b.code;
-- code 为 NULL 的行不会匹配
\`\`\`

### 十二、生产建议

1. **JOIN 字段必须建索引**：外键 + 主键都要
2. **小表驱动大表**：LEFT JOIN 左边放小表
3. **显式 JOIN ... ON**：不用隐式 FROM a, b
4. **OUTER JOIN 的右表条件放 ON**：避免退化
5. **只 SELECT 需要的列**：不要 SELECT *
6. **复杂查询拆分**：超多表 JOIN 考虑拆成多次查询或用视图

下面代码演示各种 JOIN。`,
    code: `-- ============================================================
-- 第四章演示：JOIN 连接查询
-- ============================================================

-- 部门表
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

INSERT INTO departments (name) VALUES ('技术部'), ('市场部'), ('人事部'), ('财务部');

-- 员工表
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  dept_id INTEGER,
  manager_id INTEGER,
  FOREIGN KEY (dept_id) REFERENCES departments(id)
);

INSERT INTO employees (name, dept_id, manager_id) VALUES
  ('张三', 1, NULL),    -- 技术部，无经理（CEO）
  ('李四', 2, 1),       -- 市场部，经理是张三
  ('王五', 1, 1),       -- 技术部
  ('赵六', 3, 1),       -- 人事部
  ('孙七', 1, 3),       -- 技术部
  ('周八', NULL, 1),    -- 没部门
  ('吴九', 2, 2);       -- 市场部

-- 1. INNER JOIN
SELECT '1. INNER JOIN（有部门的员工）:' AS info;
SELECT e.name AS 员工, d.name AS 部门
FROM employees e
INNER JOIN departments d ON e.dept_id = d.id;

-- 2. LEFT JOIN（保留全部员工）
SELECT '2. LEFT JOIN（含没部门的员工）:' AS info;
SELECT e.name AS 员工, d.name AS 部门
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id;

-- 3. RIGHT JOIN（保留全部部门）
SELECT '3. RIGHT JOIN（含没员工的部门）:' AS info;
SELECT e.name AS 员工, d.name AS 部门
FROM employees e
RIGHT JOIN departments d ON e.dept_id = d.id;

-- 4. CROSS JOIN（笛卡尔积）
SELECT '4. CROSS JOIN（颜色 × 尺寸）:' AS info;
CREATE TABLE colors (name TEXT);
INSERT INTO colors VALUES ('红'), ('绿'), ('蓝');
CREATE TABLE sizes (name TEXT);
INSERT INTO sizes VALUES ('S'), ('M'), ('L');

SELECT c.name AS 颜色, s.name AS 尺寸
FROM colors c
CROSS JOIN sizes s;

-- 5. 自连接（员工和经理）
SELECT '5. 自连接（员工-经理）:' AS info;
SELECT e.name AS 员工, m.name AS 经理
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;

-- 6. 多表 JOIN
SELECT '6. 多表 JOIN（员工-部门-经理）:' AS info;
SELECT
  e.name AS 员工,
  d.name AS 部门,
  m.name AS 经理
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id
LEFT JOIN employees m ON e.manager_id = m.id;

-- 7. ON vs WHERE 的区别
SELECT '7. LEFT JOIN + ON（保留左表全部）:' AS info;
SELECT e.name, d.name AS dept
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id AND d.id = 1;
-- 所有员工都在，只有 dept_id=1 的部门名才显示

SELECT '7. LEFT JOIN + WHERE（退化成 INNER）:' AS info;
SELECT e.name, d.name AS dept
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id
WHERE d.id = 1;
-- 只剩技术部的员工

-- 8. 找没部门的员工（LEFT JOIN + IS NULL）
SELECT '8. 没部门的员工:' AS info;
SELECT e.name
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id
WHERE d.id IS NULL;

-- 9. 找没员工的部门（RIGHT JOIN + IS NULL）
SELECT '9. 没员工的部门:' AS info;
SELECT d.name
FROM employees e
RIGHT JOIN departments d ON e.dept_id = d.id
WHERE e.id IS NULL;`,
  },

  // =========================================================
  // 第五章：子查询
  // =========================================================
  {
    id: "sql-subquery",
    group: "查询进阶",
    icon: "🪆",
    title: "子查询",
    content: `## 子查询

子查询是"查询里的查询"——把一个 SELECT 的结果当作另一个 SQL 语句的输入。强大但容易写出低效代码。本章讲清楚各种子查询、何时该用、何时该改写成 JOIN。

### 一、子查询按返回结果分类

| 类型 | 返回 | 用在哪 | 示例 |
| --- | --- | --- | --- |
| **标量子查询** | 单行单列（一个值） | SELECT、WHERE、HAVING | \`WHERE age > (SELECT AVG(age) FROM users)\` |
| **列子查询** | 一列多行 | WHERE 配合 IN/ANY/ALL | \`WHERE id IN (SELECT user_id FROM ...)\` |
| **行子查询** | 一行多列 | WHERE 行比较 | \`WHERE (a, b) = (SELECT ...)\` |
| **表子查询** | 多行多列 | FROM、EXISTS | \`FROM (SELECT ... ) AS t\` |

### 二、标量子查询

返回**一个值**，可用在 SELECT、WHERE、HAVING 中。

\`\`\`sql
-- 查比平均工资高的员工
SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);

-- 在 SELECT 中用
SELECT
  name,
  salary,
  (SELECT AVG(salary) FROM employees) AS 公司平均,
  salary - (SELECT AVG(salary) FROM employees) AS 差额
FROM employees;
\`\`\`

**注意**：标量子查询必须保证只返回一行一列，否则报错。

\`\`\`sql
-- ❌ 子查询返回多行，报错
SELECT * FROM users WHERE age > (SELECT age FROM users WHERE city = '北京');
\`\`\`

### 三、列子查询（配合 IN / ANY / ALL）

返回一列多行，常用 \`IN\`、\`ANY\`、\`ALL\`。

\`\`\`sql
-- IN：在子查询结果中
SELECT * FROM orders
WHERE user_id IN (SELECT id FROM users WHERE vip = 1);

-- ANY：与子查询中任意一个比较
SELECT * FROM products WHERE price > ANY (SELECT price FROM products WHERE category = '电子');
-- 等价于 > MIN(子查询)

-- ALL：与子查询中所有比较
SELECT * FROM products WHERE price > ALL (SELECT price FROM products WHERE category = '电子');
-- 等价于 > MAX(子查询)
\`\`\`

**注意**：SQLite 不支持 \`ANY\`/\`ALL\` 关键字，用 \`MIN\`/\`MAX\` 子查询等价改写：

\`\`\`sql
-- > ANY 改写为 > MIN
SELECT * FROM products WHERE price > (SELECT MIN(price) FROM products WHERE category = '电子');
-- > ALL 改写为 > MAX
SELECT * FROM products WHERE price > (SELECT MAX(price) FROM products WHERE category = '电子');
\`\`\`

**ANY / ALL 速查**：

| 写法 | 等价于 |
| --- | --- |
| \`x > ANY (subquery)\` | \`x > MIN(subquery)\` |
| \`x < ANY (subquery)\` | \`x < MAX(subquery)\` |
| \`x > ALL (subquery)\` | \`x > MAX(subquery)\` |
| \`x < ALL (subquery)\` | \`x < MIN(subquery)\` |
| \`x = ANY (subquery)\` | \`x IN (subquery)\` |
| \`x <> ALL (subquery)\` | \`x NOT IN (subquery)\` |

### 四、表子查询（FROM 子句）

子查询返回结果集，当作一张"临时表"用在 FROM 中。

\`\`\`sql
-- 每个部门的平均工资，再筛出 > 2 万的
SELECT department, avg_salary
FROM (
  SELECT department, AVG(salary) AS avg_salary
  FROM employees
  GROUP BY department
) AS dept_stats
WHERE avg_salary > 20000;
\`\`\`

**注意**：FROM 中的子查询**必须起别名**（\`AS t\`），否则报错。

### 五、EXISTS / NOT EXISTS

返回布尔值，判断子查询"是否有结果"。常用于相关子查询。

\`\`\`sql
-- 查有下订单的用户
SELECT * FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- 查没下订单的用户
SELECT * FROM users u
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);
\`\`\`

**EXISTS 的特点**：
- 不关心子查询返回什么，只关心"有没有"
- 一旦找到第一条就返回 true（短路）
- 适合"存在性判断"

### 六、相关子查询 vs 非相关子查询

**非相关子查询**：子查询不引用外层查询，独立执行一次。

\`\`\`sql
-- 子查询不依赖外层，只算一次
SELECT * FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);
\`\`\`

**相关子查询**：子查询引用外层查询的列，外层每行都要执行一次子查询。

\`\`\`sql
-- 子查询依赖外层 e，每个员工算一次
SELECT e.name, e.salary
FROM employees e
WHERE e.salary > (
  SELECT AVG(salary) FROM employees e2 WHERE e2.department = e.department
);
-- 找比"本部门平均工资"高的员工
\`\`\`

**性能**：相关子查询执行 N 次（N 是外层行数），大数据量时慢。

### 七、子查询 vs JOIN（性能优化）

很多子查询可以改写成 JOIN，性能更好。

\`\`\`sql
-- 子查询写法
SELECT * FROM users WHERE id IN (SELECT user_id FROM orders);

-- JOIN 写法（通常更快）
SELECT DISTINCT u.* FROM users u JOIN orders o ON u.id = o.user_id;

-- EXISTS 写法（适合只需要存在性）
SELECT * FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);
\`\`\`

**选择建议**：

| 场景 | 推荐 |
| --- | --- |
| 需要"存在于"判断 | \`EXISTS\` |
| 需要子查询的值参与运算 | 标量子查询或 JOIN |
| 需要关联表的数据展示 | \`JOIN\` |
| \`IN (子查询)\` 子查询大 | 改 \`EXISTS\` 或 \`JOIN\` |

### 八、子查询在 SELECT 中

\`\`\`sql
-- 每个员工和"所在部门平均工资"对比
SELECT
  e.name,
  e.salary,
  (SELECT AVG(salary) FROM employees e2 WHERE e2.department = e.department) AS 部门平均,
  e.salary - (SELECT AVG(salary) FROM employees e2 WHERE e2.department = e.department) AS 差额
FROM employees e;
\`\`\`

**性能警告**：相关子查询在 SELECT 中，外层每行都执行一次，N 行就 N 次子查询。大表用窗口函数（\`OVER()\`）替代。

### 九、CTE（WITH 子句）替代子查询

复杂子查询嵌套难读，用 \`WITH\`（CTE，Common Table Expression）提升可读性：

\`\`\`sql
-- 用 CTE 改写
WITH dept_avg AS (
  SELECT department, AVG(salary) AS avg_sal
  FROM employees
  GROUP BY department
)
SELECT e.name, e.salary, d.avg_sal
FROM employees e
JOIN dept_avg d ON e.department = d.department
WHERE e.salary > d.avg_sal;
\`\`\`

**优点**：
- 可读性强（自顶向下）
- 可复用（同一 CTE 可被多次引用）
- 递归查询（\`WITH RECURSIVE\`）

### 十、踩坑点

**坑 1：NOT IN 的 NULL 陷阱**
\`\`\`sql
-- 子查询含 NULL，NOT IN 返回空
SELECT * FROM users WHERE id NOT IN (SELECT user_id FROM orders);
-- 如果 orders.user_id 有 NULL，全部返回空
\`\`\`
**修复**：用 \`NOT EXISTS\` 或 \`NOT IN (SELECT ... WHERE col IS NOT NULL)\`。

**坑 2：相关子查询性能**
\`\`\`sql
-- 1 万员工的表，执行 1 万次子查询，慢
SELECT name, (SELECT COUNT(*) FROM orders WHERE user_id = users.id) AS 订单数
FROM users;
\`\`\`
**优化**：用 JOIN + GROUP BY：
\`\`\`sql
SELECT u.name, COUNT(o.id) AS 订单数
FROM users u LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;
\`\`\`

**坑 3：标量子查询返回多行报错**
\`\`\`sql
-- ❌ 子查询返回多行，运行时错误
SELECT * FROM users WHERE age > (SELECT age FROM users);
\`\`\`
加 \`LIMIT 1\` 或用 \`MAX/MIN/AVG\` 保证单值。

**坑 4：FROM 子查询忘起别名**
\`\`\`sql
-- ❌ 报错
SELECT * FROM (SELECT * FROM users);

-- ✅ 起别名
SELECT * FROM (SELECT * FROM users) AS t;
\`\`\`

**坑 5：子查询里的列歧义**
\`\`\`sql
-- 两张表都有 id 列，子查询里写 id 会歧义
SELECT * FROM users WHERE id IN (SELECT id FROM orders);
-- orders 的 id 还是 users 的 id？要写清楚表名
\`\`\`

### 十一、生产建议

1. **优先 JOIN 而非 IN 子查询**：大表 JOIN 通常更快
2. **存在性判断用 EXISTS**：语义清晰，性能好
3. **NOT IN 改 NOT EXISTS**：避免 NULL 陷阱
4. **复杂查询用 CTE**：可读、可复用
5. **相关子查询慎用**：N 次执行可能慢
6. **子查询加 LIMIT 防意外多行**：标量子查询尤其注意

下面代码演示各种子查询。`,
    code: `-- ============================================================
-- 第五章演示：子查询
-- ============================================================

CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  dept_id INTEGER,
  salary REAL
);

INSERT INTO departments (name) VALUES ('技术部'), ('市场部'), ('人事部');

INSERT INTO employees (name, dept_id, salary) VALUES
  ('张三', 1, 25000),
  ('李四', 2, 18000),
  ('王五', 1, 30000),
  ('赵六', 3, 15000),
  ('孙七', 1, 28000),
  ('周八', 2, 22000),
  ('吴九', 3, 16000);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  amount REAL
);

INSERT INTO orders (user_id, amount) VALUES
  (1, 100),
  (1, 200),
  (3, 50),
  (3, 80),
  (3, 120),
  (5, 300);
-- 用户 2, 4, 6, 7 没订单

-- 1. 标量子查询
SELECT '1. 比平均工资高的员工:' AS info;
SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);

-- 2. SELECT 中用标量子查询
SELECT '2. 员工工资与公司平均对比:' AS info;
SELECT
  name,
  salary,
  (SELECT AVG(salary) FROM employees) AS 公司平均
FROM employees;

-- 3. 列子查询 IN
SELECT '3. 有订单的员工:' AS info;
SELECT name FROM employees
WHERE id IN (SELECT user_id FROM orders);

-- 4. ANY / ALL（SQLite 不支持，用 MIN/MAX 等价改写）
-- ANY 等价 > MIN(子查询)，ALL 等价 > MAX(子查询)
SELECT '4. 工资高于技术部最低工资（> ANY 等价 > MIN）:' AS info;
SELECT name, salary FROM employees
WHERE salary > (SELECT MIN(salary) FROM employees WHERE dept_id = 1);

SELECT '4. 工资高于技术部所有人（> ALL 等价 > MAX）:' AS info;
SELECT name, salary FROM employees
WHERE salary > (SELECT MAX(salary) FROM employees WHERE dept_id = 1);

-- 5. 表子查询（FROM）
SELECT '5. 部门平均工资 > 2 万:' AS info;
SELECT dept_id, avg_salary
FROM (
  SELECT dept_id, AVG(salary) AS avg_salary
  FROM employees
  GROUP BY dept_id
) AS dept_stats
WHERE avg_salary > 20000;

-- 6. EXISTS
SELECT '6. 有订单的员工（EXISTS）:' AS info;
SELECT name FROM employees e
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = e.id);

SELECT '6. 没订单的员工（NOT EXISTS）:' AS info;
SELECT name FROM employees e
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = e.id);

-- 7. 相关子查询（比本部门平均高）
SELECT '7. 比本部门平均工资高的人:' AS info;
SELECT e.name, e.salary, e.dept_id
FROM employees e
WHERE e.salary > (
  SELECT AVG(salary) FROM employees e2 WHERE e2.dept_id = e.dept_id
);

-- 8. NOT IN 的 NULL 陷阱
SELECT '8. NOT IN 陷阱演示:' AS info;
CREATE TABLE banned (user_id INTEGER);
INSERT INTO banned VALUES (3), (NULL);

SELECT 'NOT IN 含 NULL → 返回 0 行:' AS msg;
SELECT name FROM employees WHERE id NOT IN (SELECT user_id FROM banned);

SELECT 'NOT EXISTS 不受影响:' AS msg;
SELECT name FROM employees e
WHERE NOT EXISTS (SELECT 1 FROM banned b WHERE b.user_id = e.id);

-- 9. CTE 改写
SELECT '9. CTE 写法（更清晰）:' AS info;
WITH dept_avg AS (
  SELECT dept_id, AVG(salary) AS avg_sal
  FROM employees
  GROUP BY dept_id
)
SELECT e.name, e.salary, d.avg_sal AS 部门平均
FROM employees e
JOIN dept_avg d ON e.dept_id = d.dept_id
WHERE e.salary > d.avg_sal;

-- 10. 子查询改写成 JOIN
SELECT '10. 每个员工的订单数（JOIN 写法）:' AS info;
SELECT e.name, COUNT(o.id) AS 订单数
FROM employees e
LEFT JOIN orders o ON e.id = o.user_id
GROUP BY e.id, e.name
ORDER BY 订单数 DESC;`,
  },

  // =========================================================
  // 第六章：集合操作
  // =========================================================
  {
    id: "sql-set-ops",
    group: "查询进阶",
    icon: "🔀",
    title: "集合操作",
    content: `## 集合操作

集合操作把多个 \`SELECT\` 的结果"纵向"合并（\`UNION\`）、取交集（\`INTERSECT\`）、取差集（\`EXCEPT\`）。和 JOIN 的"横向拼接"不同。

### 一、四种集合操作

| 操作 | 作用 | 去重 |
| --- | --- | --- |
| \`UNION\` | 合并两结果集 | 是 |
| \`UNION ALL\` | 合并两结果集 | 否（保留重复） |
| \`INTERSECT\` | 交集（两结果都有的） | 是 |
| \`EXCEPT\` | 差集（第一个有，第二个没有的） | 是 |

### 二、UNION：合并去重

\`\`\`sql
-- 合并两个表的用户，去重
SELECT name, email FROM users WHERE city = '北京'
UNION
SELECT name, email FROM users WHERE vip = 1;
-- 北京用户 + VIP 用户，重复的只算一次
\`\`\`

**等价于**：
\`\`\`sql
SELECT DISTINCT name, email FROM users WHERE city = '北京' OR vip = 1;
\`\`\`

### 三、UNION ALL：合并不去重

\`\`\`sql
SELECT name FROM users WHERE city = '北京'
UNION ALL
SELECT name FROM users WHERE vip = 1;
-- 重复的保留两次
\`\`\`

**性能**：\`UNION ALL\` 比 \`UNION\` 快，因为不去做重（去重要排序或哈希）。

**选择原则**：
- 确定不会有重复 → 用 \`UNION ALL\`（更快）
- 可能有重复且要去重 → 用 \`UNION\`
- 想保留重复 → 用 \`UNION ALL\`

### 四、INTERSECT：交集

\`\`\`sql
-- 既在北京又是 VIP 的用户
SELECT name FROM users WHERE city = '北京'
INTERSECT
SELECT name FROM users WHERE vip = 1;
\`\`\`

**注意**：\`INTERSECT\` 自动去重。等价于：
\`\`\`sql
SELECT DISTINCT name FROM users WHERE city = '北京' AND vip = 1;
\`\`\`

### 五、EXCEPT：差集

\`\`\`sql
-- 北京用户中不是 VIP 的
SELECT name FROM users WHERE city = '北京'
EXCEPT
SELECT name FROM users WHERE vip = 1;
\`\`\`

**等价于**：
\`\`\`sql
SELECT DISTINCT name FROM users WHERE city = '北京' AND vip = 0;
\`\`\`

**注意**：MySQL 8.0.31 之前不支持 \`INTERSECT\` 和 \`EXCEPT\`，用 \`INNER JOIN\` 和 \`LEFT JOIN ... IS NULL\` 替代。

### 六、集合操作的规则（重要）

1. **列数必须相同**：两个 SELECT 的列数要一致
2. **列类型兼容**：对应列的类型要能隐式转换
3. **列名取第一个**：结果集的列名取第一个 SELECT 的
4. **排序放最后**：\`ORDER BY\` 只能放整个语句末尾

\`\`\`sql
-- ❌ 列数不同，报错
SELECT name FROM users
UNION
SELECT name, email FROM users;

-- ❌ 类型不兼容（SQLite 可能不报错但结果乱）
SELECT id FROM users
UNION
SELECT name FROM users;

-- ✅ 列数类型一致
SELECT name, city FROM users WHERE vip = 1
UNION ALL
SELECT name, city FROM users WHERE city = '北京'
ORDER BY name;  -- ORDER BY 在最后
\`\`\`

### 七、ORDER BY 和 LIMIT 的位置

\`\`\`sql
-- ❌ 错：每个 SELECT 都加 ORDER BY
SELECT name FROM a ORDER BY name
UNION
SELECT name FROM b ORDER BY name;

-- ✅ 对：ORDER BY 放整体最后
SELECT name FROM a
UNION
SELECT name FROM b
ORDER BY name;

-- ✅ LIMIT 也放最后，作用于整体
SELECT name FROM a
UNION
SELECT name FROM b
ORDER BY name
LIMIT 10;
\`\`\`

想分别 LIMIT 每个子查询：用括号 + 子查询包装：

\`\`\`sql
SELECT * FROM (
  (SELECT name FROM a ORDER BY id LIMIT 5)
  UNION
  (SELECT name FROM b ORDER BY id LIMIT 5)
) AS t;
\`\`\`

### 八、UNION 的典型场景

**场景 1：合并不同表的同类数据**
\`\`\`sql
-- 把中国用户和外国用户合并
SELECT name, 'CN' AS region FROM users_cn
UNION ALL
SELECT name, 'US' AS region FROM users_us;
\`\`\`

**场景 2：模拟 FULL OUTER JOIN**（SQLite 不支持）
\`\`\`sql
SELECT * FROM a LEFT JOIN b ON a.id = b.id
UNION
SELECT * FROM a RIGHT JOIN b ON a.id = b.id;
\`\`\`

**场景 3：报表的"分类汇总 + 总计"行**
\`\`\`sql
-- 分类型统计 + 总计
SELECT '电子产品' AS 类别, COUNT(*) AS 数量 FROM products WHERE category = '电子'
UNION ALL
SELECT '服装' AS 类别, COUNT(*) AS 数量 FROM products WHERE category = '服装'
UNION ALL
SELECT '总计' AS 类别, COUNT(*) AS 数量 FROM products;
\`\`\`

### 九、性能对比：UNION vs UNION ALL

\`\`\`sql
-- UNION：需要去重（排序或哈希），O(N log N)
SELECT name FROM big_table1 UNION SELECT name FROM big_table2;

-- UNION ALL：直接拼接，O(N)
SELECT name FROM big_table1 UNION ALL SELECT name FROM big_table2;
\`\`\`

**实测差异**：百万级数据，\`UNION\` 可能比 \`UNION ALL\` 慢几倍。

**优化技巧**：
- 如果两个子查询结果天然不重叠（如按 region 分片），用 \`UNION ALL\`
- 如果要去重但不在乎顺序，部分数据库可加 \`HASH_UNION\` 提示

### 十、踩坑点

**坑 1：列数不匹配**
\`\`\`sql
-- ❌ 报错
SELECT id, name FROM users
UNION
SELECT name FROM employees;
\`\`\`
**规则**：所有 SELECT 的列数必须相同，对应位置类型兼容。

**坑 2：列名混乱**
\`\`\`sql
-- 结果集列名取第一个 SELECT
SELECT name AS 用户名 FROM users
UNION
SELECT name FROM employees;
-- 结果列名是"用户名"，第二个 SELECT 的列名被忽略

-- 想统一：第一个 SELECT 起好别名
\`\`\`

**坑 3：误用 UNION 当 JOIN**
\`\`\`sql
-- ❌ 想把用户和订单合并显示，用 UNION 是错的（纵向合并，不是横向关联）
SELECT name FROM users UNION SELECT product FROM orders;

-- ✅ 用 JOIN 横向关联
SELECT u.name, o.product FROM users u JOIN orders o ON u.id = o.user_id;
\`\`\`

**坑 4：UNION 去重导致丢数据**
\`\`\`sql
-- 两个张三（不同人），UNION 后只剩一个
SELECT name FROM users_a UNION SELECT name FROM users_b;
-- 误以为是同一个人去重了

-- 想保留：用 UNION ALL，或加 id 区分
SELECT id, name FROM users_a UNION ALL SELECT id, name FROM users_b;
\`\`\`

**坑 5：EXCEPT 的顺序敏感**
\`\`\`sql
-- A EXCEPT B ≠ B EXCEPT A
SELECT name FROM a EXCEPT SELECT name FROM b;  -- a 有 b 没有
SELECT name FROM b EXCEPT SELECT name FROM a;  -- b 有 a 没有
\`\`\`

**坑 6：NULL 的处理**
\`\`\`sql
-- 集合操作中 NULL 被视为相等
SELECT NULL AS v UNION SELECT NULL AS v;      -- 只返回一行（去重）
SELECT NULL UNION ALL SELECT NULL;            -- 返回两行（不去重）
\`\`\`

### 十一、生产建议

1. **优先 UNION ALL**：除非确实需要去重
2. **列数和类型对齐**：集合操作前检查
3. **第一个 SELECT 起好列名**：结果集列名取第一个
4. **大结果集考虑临时表**：多次 UNION 性能差，先插入临时表再查
5. **报表场景常用**：分类型汇总 + 总计行
6. **替代 FULL OUTER JOIN**：SQLite/MySQL 用 UNION + LEFT/RIGHT JOIN 模拟

下面代码演示集合操作。`,
    code: `-- ============================================================
-- 第六章演示：集合操作
-- ============================================================

-- 中国用户表
CREATE TABLE users_cn (
  id INTEGER PRIMARY KEY,
  name TEXT,
  city TEXT
);

INSERT INTO users_cn (name, city) VALUES
  ('张三', '北京'),
  ('李四', '上海'),
  ('王五', '广州');

-- 外国用户表
CREATE TABLE users_us (
  id INTEGER PRIMARY KEY,
  name TEXT,
  city TEXT
);

INSERT INTO users_us (name, city) VALUES
  ('Alice', 'New York'),
  ('Bob', 'London'),
  ('张三', '北京');  -- 同名（模拟重复）

-- 1. UNION 合并去重
SELECT '1. UNION（去重）:' AS info;
SELECT name, city FROM users_cn
UNION
SELECT name, city FROM users_us;

-- 2. UNION ALL 合并不去重
SELECT '2. UNION ALL（保留重复）:' AS info;
SELECT name, city FROM users_cn
UNION ALL
SELECT name, city FROM users_us;

-- 3. INTERSECT 交集
SELECT '3. INTERSECT（两表都有的）:' AS info;
SELECT name, city FROM users_cn
INTERSECT
SELECT name, city FROM users_us;

-- 4. EXCEPT 差集
SELECT '4. EXCEPT（中国有，外国没有）:' AS info;
SELECT name, city FROM users_cn
EXCEPT
SELECT name, city FROM users_us;

SELECT '4. EXCEPT（外国有，中国没有）:' AS info;
SELECT name, city FROM users_us
EXCEPT
SELECT name, city FROM users_cn;

-- 5. 合并不同表同类数据（加 region 列）
SELECT '5. 加 region 列合并:' AS info;
SELECT name, city, 'CN' AS region FROM users_cn
UNION ALL
SELECT name, city, 'US' AS region FROM users_us
ORDER BY region, name;

-- 6. 报表场景：分类汇总 + 总计
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT,
  category TEXT,
  price REAL
);

INSERT INTO products (name, category, price) VALUES
  ('手机', '电子', 2999),
  ('耳机', '电子', 299),
  ('T恤', '服装', 89),
  ('外套', '服装', 599),
  ('饼干', '食品', 19);

SELECT '6. 分类汇总 + 总计:' AS info;
SELECT category AS 类别, COUNT(*) AS 数量, SUM(price) AS 总价
FROM products GROUP BY category
UNION ALL
SELECT '总计' AS 类别, COUNT(*) AS 数量, SUM(price) AS 总价
FROM products
ORDER BY 类别;

-- 7. 模拟 FULL OUTER JOIN（SQLite 不支持）
CREATE TABLE a (id INTEGER, val TEXT);
CREATE TABLE b (id INTEGER, val TEXT);
INSERT INTO a VALUES (1, 'a1'), (2, 'a2'), (3, 'a3');
INSERT INTO b VALUES (2, 'b2'), (3, 'b3'), (4, 'b4');

SELECT '7. 模拟 FULL OUTER JOIN:' AS info;
SELECT a.id AS aid, a.val AS aval, b.id AS bid, b.val AS bval
FROM a LEFT JOIN b ON a.id = b.id
UNION
SELECT a.id AS aid, a.val AS aval, b.id AS bid, b.val AS bval
FROM a RIGHT JOIN b ON a.id = b.id
ORDER BY aid, bid;

-- 8. 性能对比说明（原理演示）
SELECT '8. 性能对比说明:' AS info;
SELECT 'UNION 需要去重 → 排序/哈希 → 慢' AS 说明;
SELECT 'UNION ALL 直接拼接 → 快' AS 说明;

-- 9. ORDER BY 和 LIMIT 放最后
SELECT '9. 整体排序 + 取前 3:' AS info;
SELECT name, city FROM users_cn
UNION ALL
SELECT name, city FROM users_us
ORDER BY name
LIMIT 3;

-- 10. NULL 在集合操作中视为相等
SELECT '10. NULL 视为相等（UNION 去重）:' AS info;
SELECT NULL AS v UNION SELECT NULL AS v;

SELECT '10. UNION ALL 保留 NULL 重复:' AS info;
SELECT NULL AS v UNION ALL SELECT NULL AS v;`,
  },
];
