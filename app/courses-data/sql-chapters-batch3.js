// =============================================================
// 数据库开发教程 —— 第三批章节（高级查询篇，共 5 章）
// -------------------------------------------------------------
// 本批聚焦"高级查询"：窗口函数、CASE 表达式、常用函数、CTE、视图。
// 所有 code 字段均可在 sqlite3 内存数据库中直接运行。
// 注意：窗口函数需要 SQLite 3.25+ 支持。
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：窗口函数 Window Functions
  // =========================================================
  {
    id: "sql-window",
    group: "高级查询",
    icon: "🪟",
    title: "窗口函数 Window Functions",
    content: `## 窗口函数 Window Functions

窗口函数是 SQL 的"高级武器"：它对每行都计算一个结果，但**不像 GROUP BY 那样把多行压成一行**。换句话说，窗口函数让你"既看到聚合值，又看到明细行"。

### 一、为什么需要窗口函数

先看一个痛点：**查出每个员工的工资 + 所在部门的平均工资**。

用 GROUP BY 做不到（因为聚合后只剩一行，没法和明细对齐）：

\`\`\`sql
-- ❌ 这样查不到每个员工
SELECT dept, AVG(salary) FROM emp GROUP BY dept;
\`\`\`

用子查询可以，但要 join 自己，啰嗦。窗口函数一行搞定：

\`\`\`sql
-- ✅ 窗口函数：每行都带上部门平均工资
SELECT name, dept, salary,
       AVG(salary) OVER (PARTITION BY dept) AS dept_avg
FROM emp;
\`\`\`

**核心区别**：

| 对比项 | GROUP BY 聚合 | 窗口函数 |
| --- | --- | --- |
| 结果行数 | 每组一行 | 与原表行数相同 |
| 能否同时看明细 | 否 | 是 |
| 语法 | \`AVG(salary)\` | \`AVG(salary) OVER(...)\` |

### 二、OVER() 子句

\`OVER()\` 是窗口函数的标志，括号里定义"窗口"（即计算范围）：

\`\`\`sql
函数名() OVER (
  [PARTITION BY 分区列]   -- 类似 GROUP BY，按列分区
  [ORDER BY 排序列]       -- 区内排序
  [ROWS/RANGE BETWEEN ... AND ...]  -- 窗口框架
)
\`\`\`

**空 \`OVER()\`**：对整张表计算。

\`\`\`sql
SELECT name, salary,
       SUM(salary) OVER() AS 总工资,
       AVG(salary) OVER() AS 平均工资
FROM emp;
\`\`\`

### 三、PARTITION BY：分区

按列分组，每组独立计算。和 GROUP BY 的"分组"概念一致，但不压缩行。

\`\`\`sql
-- 每个部门内的工资排名
SELECT name, dept, salary,
       RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS dept_rank
FROM emp;
\`\`\`

### 四、ORDER BY：窗口内排序

加上 ORDER BY 后，窗口变成"从分区第一行到当前行"的**累计窗口**。

\`\`\`sql
-- 按日期累计求和（running total）
SELECT date, amount,
       SUM(amount) OVER (ORDER BY date) AS 累计金额
FROM sales;
\`\`\`

**关键对比**：

| 写法 | 含义 |
| --- | --- |
| \`SUM(x) OVER(PARTITION BY d)\` | 每个分区内的总和（不累计） |
| \`SUM(x) OVER(ORDER BY d)\` | 从第一行到当前行的累计和 |
| \`SUM(x) OVER(PARTITION BY d ORDER BY d)\` | 每个分区内的累计和 |

### 五、ROWS / RANGE：窗口框架

控制"当前行参与计算的范围"：

\`\`\`sql
-- 当前行 + 前2行 + 后1行
SUM(x) OVER (ORDER BY d
  ROWS BETWEEN 2 PRECEDING AND 1 FOLLOWING)

-- 当前行 + 之前所有行（默认，等价于 ORDER BY 不写框架）
SUM(x) OVER (ORDER BY d
  RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
\`\`\`

| 框架关键字 | 含义 |
| --- | --- |
| \`UNBOUNDED PRECEDING\` | 分区第一行 |
| \`n PRECEDING\` | 前 n 行（ROWS）/ 同值前 n（RANGE） |
| \`CURRENT ROW\` | 当前行 |
| \`n FOLLOWING\` | 后 n 行 |
| \`UNBOUNDED FOLLOWING\` | 分区最后一行 |

**ROWS vs RANGE**：ROWS 按"物理行"算，RANGE 按"逻辑值"算（相同值会一起进窗口）。默认是 \`RANGE UNBOUNDED PRECEDING\`。

### 六、ROW_NUMBER()：行号

给每行编号，**永不重复**（即使值相同）。

\`\`\`sql
SELECT name, salary,
       ROW_NUMBER() OVER (ORDER BY salary DESC) AS 排名
FROM emp;
\`\`\`

常用于分页、去重取一条。

### 七、RANK() / DENSE_RANK()：排名

| 函数 | 并列处理 | 示例（值 100,100,90） |
| --- | --- | --- |
| \`ROW_NUMBER()\` | 不并列 | 1, 2, 3 |
| \`RANK()\` | 并列，跳号 | 1, 1, 3 |
| \`DENSE_RANK()\` | 并列，不跳号 | 1, 1, 2 |

\`\`\`sql
SELECT name, salary,
       RANK()      OVER (ORDER BY salary DESC) AS rank_skip,
       DENSE_RANK() OVER (ORDER BY salary DESC) AS rank_dense
FROM emp;
\`\`\`

**面试题**：取每个部门工资最高的两人。用 \`ROW_NUMBER() PARTITION BY dept\`。

### 八、LAG() / LEAD()：偏移访问

引用"前一行 / 后一行"的值，做环比、同比、差值。

\`\`\`sql
SELECT date, amount,
       LAG(amount, 1)  OVER (ORDER BY date) AS 上期,
       amount - LAG(amount, 1) OVER (ORDER BY date) AS 环比增减,
       LEAD(amount, 1) OVER (ORDER BY date) AS 下期
FROM sales;
\`\`\`

\`LAG(col, n, default)\`：向前偏移 n 行，找不到用 default。

### 九、FIRST_VALUE() / LAST_VALUE()

取窗口内第一/最后一个值。

\`\`\`sql
SELECT date, amount,
       FIRST_VALUE(amount) OVER (ORDER BY date
         ROWS UNBOUNDED PRECEDING) AS 期初值
FROM sales;
\`\`\`

**坑**：\`LAST_VALUE\` 默认框架是"到当前行"，所以 \`LAST_VALUE\` 拿到的就是当前行自己。要拿"分区最后一个"，必须显式写 \`ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING\`。

### 十、NTILE(n)：分桶

把数据按排序均分成 n 桶，常用于"四分位数"分析。

\`\`\`sql
SELECT name, salary,
       NTILE(4) OVER (ORDER BY salary DESC) AS 四分位桶
FROM emp;  -- 1=最高 25%, 4=最低 25%
\`\`\`

### 十一、窗口函数 vs GROUP BY

| 维度 | GROUP BY | 窗口函数 |
| --- | --- | --- |
| 行数 | 压缩为每组一行 | 保留原行数 |
| 同时取明细和聚合 | 不行 | 可以 |
| 排名/行号 | 做不到 | 强项 |
| 偏移访问 | 做不到 | LAG/LEAD |
| 性能 | 通常更快 | 大表上较慢 |

### 十二、典型应用场景

1. **排行榜**：\`ROW_NUMBER() PARTITION BY 类目 ORDER BY 销量 DESC\`
2. **环比 / 同比**：\`LAG\` 取上期，做差或做比
3. **累计求和**：\`SUM OVER(ORDER BY date)\` 看 K 线累计
4. **连续登录 N 天**：日期 - \`ROW_NUMBER()\` 分组
5. **Top-N per group**：\`ROW_NUMBER() PARTITION BY\` 后取 \`<= N\`
6. **去重保留最新**：按时间倒序编号取第一条

### 十三、踩坑点

**坑 1：忘记 ORDER BY 导致全分区累计**
\`\`\`sql
-- 没有 ORDER BY，结果是"整个分区的总和"，不是累计
SUM(x) OVER (PARTITION BY d)   -- 不是累计
SUM(x) OVER (PARTITION BY d ORDER BY d)  -- 才是累计
\`\`\`

**坑 2：LAST_VALUE 取不到"最后一个"**
默认框架 \`RANGE ... CURRENT ROW\`，要拿全分区最后一个必须显式 \`ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING\`。

**坑 3：窗口函数不能用在 WHERE 里**
\`\`\`sql
-- ❌ 报错
SELECT * FROM t WHERE ROW_NUMBER() OVER(...) > 1;
-- ✅ 用子查询或 CTE 包一层
SELECT * FROM (
  SELECT *, ROW_NUMBER() OVER(...) AS rn FROM t
) WHERE rn > 1;
\`\`\`

**坑 4：SQLite 版本要求**
窗口函数需要 **SQLite 3.25+（2018-09）**。老版本会报语法错误。

### 十四、生产建议

1. **大表加索引**：窗口函数的 PARTITION BY / ORDER BY 列建索引可大幅加速
2. **避免全表窗口**：\`OVER()\` 不带分区会扫描全表，慎用
3. **Top-N 用窗口比子查询快**：传统写法 join 自身很慢
4. **递归累计数据量注意**：累计窗口在大表上可能 O(n²) 行为，监控执行计划

下面代码演示窗口函数的主要用法。`,
    code: `-- ============================================================
-- 第一章演示：窗口函数 Window Functions
-- 需要 SQLite 3.25+
-- ============================================================

CREATE TABLE sales (
  id INTEGER PRIMARY KEY,
  salesperson TEXT,
  region TEXT,
  amount REAL,
  sale_date TEXT
);

INSERT INTO sales (salesperson, region, amount, sale_date) VALUES
  ('张三', '华东', 1200, '2026-01-05'),
  ('张三', '华东', 1500, '2026-01-12'),
  ('李四', '华东', 900,  '2026-01-05'),
  ('李四', '华东', 1800, '2026-01-12'),
  ('王五', '华北', 2200, '2026-01-05'),
  ('王五', '华北', 1100, '2026-01-12'),
  ('赵六', '华北', 3000, '2026-01-05'),
  ('赵六', '华北', 2800, '2026-01-12');

SELECT '0. 原始数据:' AS info;
SELECT * FROM sales;

-- 1. OVER() 空窗口：每行带全局聚合
SELECT '1. 每行带全局总/均值:' AS info;
SELECT salesperson, region, amount,
       SUM(amount) OVER() AS 全局总额,
       ROUND(AVG(amount) OVER(), 2) AS 全局均值
FROM sales;

-- 2. PARTITION BY 分区：每行带分区内聚合
SELECT '2. 每行带区域总额:' AS info;
SELECT salesperson, region, amount,
       SUM(amount) OVER (PARTITION BY region) AS 区域总额,
       ROUND(AVG(amount) OVER (PARTITION BY region), 2) AS 区域均值
FROM sales;

-- 3. ROW_NUMBER() 行号
SELECT '3. 按金额倒序编号:' AS info;
SELECT salesperson, amount,
       ROW_NUMBER() OVER (ORDER BY amount DESC) AS 行号
FROM sales;

-- 4. RANK vs DENSE_RANK（并列处理差异）
SELECT '4. RANK vs DENSE_RANK:' AS info;
SELECT salesperson, amount,
       RANK()       OVER (ORDER BY amount DESC) AS rank_skip,
       DENSE_RANK() OVER (ORDER BY amount DESC) AS rank_dense
FROM sales
ORDER BY amount DESC;

-- 5. 分区内排名（每个区域内的工资排名）
SELECT '5. 区域内排名:' AS info;
SELECT region, salesperson, amount,
       RANK() OVER (PARTITION BY region ORDER BY amount DESC) AS 区域排名
FROM sales
ORDER BY region, 区域排名;

-- 6. Top-N per group：每个区域金额最高的一单
SELECT '6. 每区域最高一单:' AS info;
SELECT * FROM (
  SELECT region, salesperson, amount,
         ROW_NUMBER() OVER (PARTITION BY region ORDER BY amount DESC) AS rn
  FROM sales
) WHERE rn = 1;

-- 7. 累计求和（running total）
SELECT '7. 按日期累计金额:' AS info;
SELECT sale_date, salesperson, amount,
       SUM(amount) OVER (ORDER BY sale_date, id) AS 累计金额
FROM sales
ORDER BY sale_date, id;

-- 8. 分区内累计
SELECT '8. 区域内按日期累计:' AS info;
SELECT region, sale_date, amount,
       SUM(amount) OVER (PARTITION BY region ORDER BY sale_date, id) AS 区域累计
FROM sales
ORDER BY region, sale_date, id;

-- 9. LAG / LEAD 偏移访问（环比）
SELECT '9. LAG/LEAD 环比:' AS info;
SELECT sale_date, salesperson, amount,
       LAG(amount, 1, 0)  OVER (PARTITION BY salesperson ORDER BY sale_date) AS 上期,
       amount - LAG(amount, 1, 0) OVER (PARTITION BY salesperson ORDER BY sale_date) AS 环比增减,
       LEAD(amount, 1) OVER (PARTITION BY salesperson ORDER BY sale_date) AS 下期
FROM sales
ORDER BY salesperson, sale_date;

-- 10. FIRST_VALUE：每行带区域最高单
SELECT '10. 每行带区域最高单:' AS info;
SELECT region, salesperson, amount,
       FIRST_VALUE(amount) OVER (PARTITION BY region ORDER BY amount DESC) AS 区域最高
FROM sales;

-- 11. LAST_VALUE（注意默认框架，需显式框架才能拿"分区最后"）
SELECT '11. LAST_VALUE 拿区域最低单:' AS info;
SELECT region, salesperson, amount,
       LAST_VALUE(amount) OVER (
         PARTITION BY region ORDER BY amount DESC
         ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
       ) AS 区域最低
FROM sales;

-- 12. ROWS BETWEEN 自定义框架（滑动 3 日均）
SELECT '12. 滑动窗口（当前+前1+后1）:' AS info;
SELECT sale_date, salesperson, amount,
       ROUND(AVG(amount) OVER (
         ORDER BY sale_date, id
         ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING
       ), 2) AS 滑动均值
FROM sales
ORDER BY sale_date, id;

-- 13. NTILE 分桶
SELECT '13. NTILE 4 分桶:' AS info;
SELECT salesperson, amount,
       NTILE(4) OVER (ORDER BY amount DESC) AS 桶号
FROM sales
ORDER BY amount DESC;

-- 14. 连续登录 N 天（经典面试题）
CREATE TABLE login_log (
  user_id INTEGER,
  login_date TEXT
);
INSERT INTO login_log VALUES
  (1, '2026-01-01'), (1, '2026-01-02'), (1, '2026-01-03'),
  (1, '2026-01-05'), (1, '2026-01-06'),
  (2, '2026-01-01'), (2, '2026-01-03'), (2, '2026-01-04');

-- 思路：日期 - ROW_NUMBER() 相同 => 连续
SELECT '14. 找连续登录 >=3 天的用户:' AS info;
SELECT user_id, MIN(login_date) AS 起始日, MAX(login_date) AS 结束日, COUNT(*) AS 连续天数
FROM (
  SELECT user_id, login_date,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) AS rn,
         DATE(login_date, '-' || (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) - 1) || ' days') AS grp
  FROM login_log
)
GROUP BY user_id, grp
HAVING COUNT(*) >= 3
ORDER BY user_id;`,
  },

  // =========================================================
  // 第二章：CASE 条件表达式
  // =========================================================
  {
    id: "sql-case",
    group: "高级查询",
    icon: "🔀",
    title: "CASE 条件表达式",
    content: `## CASE 条件表达式

\`CASE\` 是 SQL 里的"if-else"，让查询能根据条件返回不同值。它是行级逻辑的核心，几乎所有"标签化、分级、行转列"的场景都离不开它。

### 一、两种 CASE 写法

**1. 简单 CASE（值匹配）**

\`\`\`sql
CASE 表达式
  WHEN 值1 THEN 结果1
  WHEN 值2 THEN 结果2
  ELSE 默认结果
END
\`\`\`

像 switch-case，拿"表达式"和"值"做等值匹配：

\`\`\`sql
SELECT dept,
       CASE dept
         WHEN '技术部' THEN 'Tech'
         WHEN '市场部' THEN 'Mkt'
         ELSE 'Other'
       END AS dept_en
FROM emp;
\`\`\`

**2. 搜索 CASE（条件判断，更灵活）**

\`\`\`sql
CASE
  WHEN 条件1 THEN 结果1
  WHEN 条件2 THEN 结果2
  ELSE 默认结果
END
\`\`\`

每个 WHEN 后是**任意布尔表达式**，能比大小、用函数：

\`\`\`sql
SELECT name, salary,
       CASE
         WHEN salary >= 30000 THEN '高'
         WHEN salary >= 15000 THEN '中'
         ELSE '低'
       END AS 工资档
FROM emp;
\`\`\`

**区别**：

| 类型 | 匹配方式 | 灵活度 | 适用 |
| --- | --- | --- | --- |
| 简单 CASE | 等值 | 低 | 枚举翻译 |
| 搜索 CASE | 任意条件 | 高 | 范围判断、复合条件 |

**心法**：能用搜索 CASE 就别用简单 CASE，可读性更好、扩展性强。

### 二、CASE 的匹配规则

- **从上到下**匹配，**匹配到就停止**（不再往下判断）
- **ELSE 可省**，省略时若没匹配上返回 \`NULL\`
- 所有 \`THEN\` 结果类型要兼容（否则隐式转换可能踩坑）

\`\`\`sql
-- 注意 ELSE 缺省返回 NULL
SELECT CASE WHEN 1=2 THEN 'a' END;  -- NULL
\`\`\`

### 三、CASE 在 SELECT 中

最常见用法：派生列、标签化。

\`\`\`sql
SELECT name, age,
       CASE WHEN age >= 18 THEN '成年' ELSE '未成年' END AS 状态
FROM users;
\`\`\`

### 四、CASE 在 ORDER BY 中

实现"自定义排序"：把某些值排到最前/最后。

\`\`\`sql
-- 把"待支付"订单排最前，其他按时间倒序
SELECT * FROM orders
ORDER BY
  CASE status WHEN '待支付' THEN 0 ELSE 1 END,
  created_at DESC;
\`\`\`

\`\`\`sql
-- 自定义枚举顺序（不用 CASE 的话只能用 FIELD/DECODE）
ORDER BY CASE status
  WHEN '待支付' THEN 1
  WHEN '已支付' THEN 2
  WHEN '已发货' THEN 3
  WHEN '已完成' THEN 4
  ELSE 99
END;
\`\`\`

### 五、CASE 在 UPDATE 中

一次 UPDATE 按不同条件改不同值，比写多条 UPDATE 高效：

\`\`\`sql
UPDATE products SET price = CASE
  WHEN price < 100  THEN price * 1.1
  WHEN price < 1000 THEN price * 1.05
  ELSE price
END;
\`\`\`

### 六、CASE 聚合：行转列（透视表）

**经典技巧**：\`SUM(CASE WHEN ... THEN 1 ELSE 0 END)\` 把行变成列。

\`\`\`sql
-- 统计各部门人数，部门做列
SELECT
  SUM(CASE WHEN dept='技术部' THEN 1 ELSE 0 END) AS 技术,
  SUM(CASE WHEN dept='市场部' THEN 1 ELSE 0 END) AS 市场,
  SUM(CASE WHEN dept='人事部' THEN 1 ELSE 0 END) AS 人事
FROM emp;
\`\`\`

更通用的"行转列"：

\`\`\`sql
-- 每个用户、每个科目的成绩，科目变列
SELECT user_id,
  MAX(CASE WHEN subject='数学' THEN score END) AS 数学,
  MAX(CASE WHEN subject='语文' THEN score END) AS 语文,
  MAX(CASE WHEN subject='英语' THEN score END) AS 英语
FROM scores
GROUP BY user_id;
\`\`\`

\`MAX\`/\`MIN\` 聚合掉 NULL（其他科目行该列为 NULL），保留有值的那个。

**反操作：列转行**用 UNION ALL：

\`\`\`sql
SELECT user_id, '数学' AS subject, 数学 AS score FROM t
UNION ALL
SELECT user_id, '语文', 语文 FROM t;
\`\`\`

### 七、嵌套 CASE

CASE 里再套 CASE：

\`\`\`sql
SELECT name, dept, salary,
       CASE
         WHEN dept = '技术部' THEN
           CASE WHEN salary > 30000 THEN '高薪技术' ELSE '普通技术' END
         WHEN dept = '市场部' THEN
           CASE WHEN salary > 20000 THEN '高薪市场' ELSE '普通市场' END
         ELSE '其他'
       END AS 标签
FROM emp;
\`\`\`

**心法**：嵌套超过 2 层可读性骤降，考虑拆 CTE 或换业务层处理。

### 八、NULL 处理

\`CASE\` 对 NULL 的处理是初学者的常见坑：

\`\`\`sql
-- ❌ 简单 CASE 中 NULL 不等于 NULL
CASE col WHEN NULL THEN '空' ELSE '非空' END   -- 永远走 ELSE！

-- ✅ 用 IS NULL 判断
CASE WHEN col IS NULL THEN '空' ELSE '非空' END
\`\`\`

因为 SQL 里 \`NULL = NULL\` 结果是 \`NULL\`（未知），不是 true。

### 九、COALESCE / NULLIF / IFNULL

**COALESCE(col1, col2, ..., default)**：返回第一个非 NULL 的值，常用于"填默认值"。

\`\`\`sql
SELECT name, COALESCE(nickname, real_name, '匿名') AS 显示名
FROM users;
\`\`\`

**IFNULL(a, b)**：SQLite/MySQL 特有，等价于 \`COALESCE(a, b)\`（只支持两参数）。

**NULLIF(a, b)**：若 \`a = b\` 返回 NULL，否则返回 a。常用于**避免除零**：

\`\`\`sql
-- ❌ 报错：除以 0
SELECT total / zero_count FROM t;

-- ✅ NULLIF 把 0 转成 NULL，除法结果是 NULL 不报错
SELECT total / NULLIF(count, 0) FROM t;
\`\`\`

组合拳：\`COALESCE(a / NULLIF(b, 0), 0)\` → 除零时返回 0。

### 十、COALESCE vs CASE WHEN IS NULL

\`\`\`sql
-- 等价
COALESCE(col, 0)
CASE WHEN col IS NULL THEN 0 ELSE col END
\`\`\`

\`COALESCE\` 更简洁，且支持多参数链式回退。

### 十一、踩坑点

**坑 1：THEN 类型不一致**
\`\`\`sql
-- ❌ 数字和字符串混用，可能被隐式转换
CASE WHEN x THEN 1 ELSE '未知' END
\`\`\`

**坑 2：CASE 在 GROUP BY 后的别名**
\`SELECT\` 里的别名在 \`GROUP BY\` 不可用（执行顺序），要在 GROUP BY 里重复 CASE 表达式或用 CTE 包一层。

**坑 3：忘记 ELSE 导致 NULL**
没匹配上又没 ELSE，结果悄无声息地变 NULL。

**坑 4：聚合函数里用 CASE**
\`SUM(CASE WHEN ... THEN amount ELSE 0 END)\` 是有条件求和，**注意 ELSE 0 不能省**（否则其他行被算成 NULL，SUM 会忽略 NULL，结果可能对，但建议显式 0 避免误解）。

### 十二、生产建议

1. **优先搜索 CASE**：可读、可扩展
2. **行转列用 SUM/MAX + CASE**：比 PIVOT（SQL Server 独有）可移植
3. **除法必加 NULLIF**：防除零
4. **默认值用 COALESCE**：比 ISNULL/IFNULL 更标准、可链式
5. **复杂嵌套拆 CTE**：每层一个 WITH，可读性大幅提升

下面代码演示 CASE 的各种用法。`,
    code: `-- ============================================================
-- 第二章演示：CASE 条件表达式
-- ============================================================

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  dept TEXT,
  salary REAL,
  age INTEGER,
  nickname TEXT
);

INSERT INTO employees (name, dept, salary, age, nickname) VALUES
  ('张三', '技术部', 35000, 30, '老张'),
  ('李四', '市场部', 22000, 28, NULL),
  ('王五', '技术部', 28000, 35, NULL),
  ('赵六', '人事部', 15000, 24, '小赵'),
  ('孙七', '市场部', 18000, 40, NULL),
  ('周八', '技术部', 32000, 29, '老周'),
  ('吴九', '人事部', NULL, 26, NULL);

SELECT '0. 原始数据:' AS info;
SELECT * FROM employees;

-- 1. 简单 CASE（枚举翻译）
SELECT '1. 简单 CASE:' AS info;
SELECT name, dept,
       CASE dept
         WHEN '技术部' THEN 'Tech'
         WHEN '市场部' THEN 'Marketing'
         WHEN '人事部' THEN 'HR'
         ELSE 'Other'
       END AS dept_en
FROM employees;

-- 2. 搜索 CASE（范围分级）
SELECT '2. 工资分级:' AS info;
SELECT name, salary,
       CASE
         WHEN salary IS NULL THEN '未知'
         WHEN salary >= 30000 THEN '高'
         WHEN salary >= 20000 THEN '中'
         ELSE '低'
       END AS 工资档
FROM employees;

-- 3. CASE 在 ORDER BY（自定义排序：把"人事部"排最前）
SELECT '3. 自定义排序:' AS info;
SELECT name, dept FROM employees
ORDER BY
  CASE dept WHEN '人事部' THEN 0 ELSE 1 END,
  name;

-- 4. UPDATE 用 CASE 分情况调薪
UPDATE employees SET salary = CASE
  WHEN salary IS NULL THEN 15000
  WHEN salary < 20000 THEN salary * 1.2
  WHEN salary < 30000 THEN salary * 1.1
  ELSE salary * 1.05
END;
SELECT '4. 调薪后:' AS info;
SELECT name, salary FROM employees;

-- 5. CASE 聚合：行转列（各部门人数）
SELECT '5. 行转列（部门做列）:' AS info;
SELECT
  COUNT(*) AS 总人数,
  SUM(CASE WHEN dept='技术部' THEN 1 ELSE 0 END) AS 技术,
  SUM(CASE WHEN dept='市场部' THEN 1 ELSE 0 END) AS 市场,
  SUM(CASE WHEN dept='人事部' THEN 1 ELSE 0 END) AS 人事
FROM employees;

-- 6. 行转列：成绩表（科目变列）
CREATE TABLE scores (
  student TEXT,
  subject TEXT,
  score INTEGER
);
INSERT INTO scores VALUES
  ('小明', '数学', 90), ('小明', '语文', 85), ('小明', '英语', 78),
  ('小红', '数学', 88), ('小红', '语文', 92), ('小红', '英语', 95);

SELECT '6. 列转行（科目变列）:' AS info;
SELECT student,
  MAX(CASE WHEN subject='数学' THEN score END) AS 数学,
  MAX(CASE WHEN subject='语文' THEN score END) AS 语文,
  MAX(CASE WHEN subject='英语' THEN score END) AS 英语
FROM scores
GROUP BY student;

-- 7. 嵌套 CASE
SELECT '7. 嵌套 CASE:' AS info;
SELECT name, dept, salary,
       CASE
         WHEN dept = '技术部' THEN
           CASE WHEN salary >= 30000 THEN '高薪技术' ELSE '普通技术' END
         WHEN dept = '市场部' THEN
           CASE WHEN salary >= 22000 THEN '高薪市场' ELSE '普通市场' END
         ELSE '其他岗位'
       END AS 标签
FROM employees;

-- 8. NULL 处理：COALESCE / IFNULL / NULLIF
SELECT '8. COALESCE 填默认值:' AS info;
SELECT name, COALESCE(nickname, name, '匿名') AS 显示名,
       COALESCE(salary, 0) AS 工资_默认0
FROM employees;

-- 9. NULLIF 防止除零
CREATE TABLE stats (id INTEGER, total INTEGER, count INTEGER);
INSERT INTO stats VALUES (1, 100, 5), (2, 80, 0), (3, 60, 3);
SELECT '9. NULLIF 防除零:' AS info;
SELECT id, total, count,
       total / count AS 直接除_可能报错或NULL,
       total / NULLIF(count, 0) AS 安全除,
       COALESCE(total * 1.0 / NULLIF(count, 0), 0) AS 均值_默认0
FROM stats;

-- 10. 条件求和：各部门高薪人数
SELECT '10. 条件求和:' AS info;
SELECT dept,
       COUNT(*) AS 部门总人数,
       SUM(CASE WHEN salary >= 25000 THEN 1 ELSE 0 END) AS 高薪人数,
       SUM(CASE WHEN salary < 25000 THEN 1 ELSE 0 END) AS 普通人数
FROM employees
WHERE salary IS NOT NULL
GROUP BY dept;

-- 11. 列转行（UNION ALL）
SELECT '11. 列转行:' AS info;
SELECT student, '数学' AS subject, 数学 AS score FROM (
  SELECT student,
    MAX(CASE WHEN subject='数学' THEN score END) AS 数学,
    MAX(CASE WHEN subject='语文' THEN score END) AS 语文,
    MAX(CASE WHEN subject='英语' THEN score END) AS 英语
  FROM scores GROUP BY student
)
UNION ALL
SELECT student, '语文', 语文 FROM (
  SELECT student,
    MAX(CASE WHEN subject='数学' THEN score END) AS 数学,
    MAX(CASE WHEN subject='语文' THEN score END) AS 语文,
    MAX(CASE WHEN subject='英语' THEN score END) AS 英语
  FROM scores GROUP BY student
)
ORDER BY student, subject;`,
  },

  // =========================================================
  // 第三章：常用函数大全
  // =========================================================
  {
    id: "sql-functions",
    group: "高级查询",
    icon: "🧮",
    title: "常用函数大全",
    content: `## 常用函数大全

SQL 内置函数是"加工列值"的工具箱。本章按"字符串 / 日期 / 数学 / 类型转换 / NULL 处理"五类梳理 SQLite 常用函数，并对照其他数据库的差异。

### 一、字符串函数

| 函数 | 作用 | 示例 | 结果 |
| --- | --- | --- | --- |
| \`LENGTH(s)\` | 字符数（注意是字符不是字节） | \`LENGTH('你好')\` | \`2\` |
| \`SUBSTR(s, start, len)\` | 截取（start 从 1 开始，可负） | \`SUBSTR('hello',2,3)\` | \`'ell'\` |
| \`REPLACE(s, a, b)\` | 替换 | \`REPLACE('a-b','-','_')\` | \`'a_b'\` |
| \`UPPER(s)\` / \`LOWER(s)\` | 大/小写 | \`UPPER('abc')\` | \`'ABC'\` |
| \`TRIM(s)\` | 去两端空白 | \`TRIM(' x ')\` | \`'x'\` |
| \`LTRIM\` / \`RTRIM\` | 去左/右 | - | - |
| \`INSTR(s, sub)\` | 子串首次出现位置（1-based，找不到 0） | \`INSTR('hello','ll')\` | \`3\` |
| \`PRINTF(fmt, ...)\` | 格式化（C 风格） | \`PRINTF('%05.2f', 3.1)\` | \`'03.10'\` |
| \`||\` \| 拼接（SQLite/PostgreSQL） \| \`'a' || 'b'\` \| \`'ab'\` |
| \`SUBSTR(s, start)\` | 从 start 截到末尾 | \`SUBSTR('hello',3)\` | \`'llo'\` |

**SQLite 注意**：\`LENGTH('你好')\` 返回 2（按字符）。若要字节长度用 \`LENGTH(CAST('你好' AS BLOB))\`。

\`\`\`sql
SELECT SUBSTR('2026-06-29', 1, 4);  -- '2026' 截年份
SELECT REPLACE('010-1234-5678', '-', '');  -- 去横线
SELECT PRINTF('%.2f', 3.14159);  -- 3.14
\`\`\`

### 二、日期时间函数

SQLite 日期函数强大但语法独特，统一接受 **3 种格式**：文本（ISO 8601）、Julian Day（儒略日）、Unix 时间戳。

| 函数 | 作用 | 示例 |
| --- | --- | --- |
| \`DATE(t, ...)\` | 返回日期 \`YYYY-MM-DD\` | \`DATE('now')\` |
| \`TIME(t, ...)\` | 返回时间 \`HH:MM:SS\` | \`TIME('now')\` |
| \`DATETIME(t, ...)\` | 日期+时间 | \`DATETIME('now')\` |
| \`STRFTIME(fmt, t, ...)\` | 按格式串返回（最灵活） | \`STRFTIME('%Y年%m月', 'now')\` |
| \`JULIANDAY(t, ...)\` | 儒略日（浮点，便于算差） | \`JULIANDAY('now')\` |
| \`UNIXEPOCH(t, ...)\` | Unix 时间戳（3.38+） | \`UNIXEPOCH('now')\` |

**修饰符**（可叠加多个）：\`'+1 day'\`、\`'-2 months'\`、\`'start of month'\`、\`'weekday 1'\`、\`'localtime'\`、\`'utc'\`。

\`\`\`sql
SELECT DATE('now', 'localtime');                       -- 今天
SELECT DATE('now', '+7 days');                         -- 7 天后
SELECT DATE('now', 'start of month', '-1 month');     -- 上月 1 号
SELECT DATETIME('2026-06-29', '+1 year', '+2 months'); -- 加 1 年 2 月
SELECT STRFTIME('%w', 'now');                          -- 星期几（0=周日）
SELECT STRFTIME('%s', 'now');                          -- Unix 时间戳
\`\`\`

**STRFTIME 格式符**：

| 符号 | 含义 | 示例 |
| --- | --- | --- |
| \`%Y\` | 4 位年 | 2026 |
| \`%m\` | 月（01-12） | 06 |
| \`%d\` | 日（01-31） | 29 |
| \`%H\` | 时（00-23） | 14 |
| \`%M\` | 分（00-59） | 30 |
| \`%S\` | 秒 | 00 |
| \`%w\` | 周几（0-6，0=周日） | 1 |
| \`%j\` | 年内第几天（001-366） | 180 |
| \`%s\` | Unix 时间戳 | - |

**算日期差**：用 \`JULIANDAY\` 做浮点减法。

\`\`\`sql
SELECT JULIANDAY('2026-12-31') - JULIANDAY('2026-01-01');  -- 364 天
SELECT (JULIANDAY('now') - JULIANDAY('2026-01-01')) * 24;   -- 距年初的小时数
\`\`\`

**踩坑**：
- \`DATE('now')\` 是 UTC，本地时间要加 \`'localtime'\` 修饰符
- SQLite 没有 \`DATEDIFF\`、\`DATEADD\`（SQL Server 那套），用 \`JULIANDAY\` 算差

### 三、数学函数

| 函数 | 作用 | 示例 | 结果 |
| --- | --- | --- | --- |
| \`ABS(x)\` | 绝对值 | \`ABS(-5)\` | 5 |
| \`ROUND(x, n)\` | 四舍五入 n 位 | \`ROUND(3.14159, 2)\` | 3.14 |
| \`RANDOM()\` | 随机整数（-2^63 ~ 2^63-1） | \`RANDOM()\` | 大整数 |
| \`MAX(a,b)\` / \`MIN(a,b)\` | 两值取大/小 | \`MAX(3,5)\` | 5 |
| \`MOD(a,b)\` 或 \`%\` | 取模 | \`MOD(7,3)\` | 1 |
| \`SIGN(x)\` | 符号 | \`SIGN(-5)\` | -1 |
| \`PI()\` / \`SQRT()\` | 数学常量/平方根 | \`SQRT(16)\` | 4 |

**聚合函数 MAX/MIN vs 标量函数 MAX/MIN**：聚合 \`MAX(col)\` 是对一列求最大；标量 \`MAX(a,b)\` 是两值取大。SQLite 中同名但参数个数不同。

**取随机 N 行**：
\`\`\`sql
SELECT * FROM t ORDER BY RANDOM() LIMIT 5;
\`\`\`

### 四、类型转换 CAST

\`\`\`sql
CAST(表达式 AS 类型)
\`\`\`

\`\`\`sql
SELECT CAST('123' AS INTEGER);    -- 123
SELECT CAST(3.9 AS INTEGER);       -- 3（截断，不四舍五入！）
SELECT CAST(3.14159 AS TEXT);     -- '3.14159'
SELECT CAST('abc' AS INTEGER);    -- 0（无法解析，返回 0，不报错）
\`\`\`

**坑**：
- \`CAST(3.9 AS INTEGER)\` 是**截断**为 3，不是 4（要四舍五入用 \`ROUND\` 后再转）
- \`CAST('abc' AS INTEGER)\` 返回 0，不报错（SQLite 宽松，其他库会报错）

### 五、NULL 处理函数

| 函数 | 作用 | 等价写法 |
| --- | --- | --- |
| \`COALESCE(a, b, c, ...)\` | 第一个非 NULL | - |
| \`IFNULL(a, b)\` | a 为 NULL 返回 b | \`COALESCE(a, b)\`（仅两参数） |
| \`NULLIF(a, b)\` | a=b 返回 NULL，否则 a | \`CASE WHEN a=b THEN NULL ELSE a END\` |

\`\`\`sql
SELECT COALESCE(NULL, NULL, 'c');     -- 'c'
SELECT IFNULL(NULL, 'default');       -- 'default'
SELECT NULLIF(5, 5);                  -- NULL
SELECT NULLIF(5, 0);                  -- 5
\`\`\`

**生产建议**：
- 用 \`COALESCE\` 而不是 \`IFNULL\`（前者是 SQL 标准，跨库通用）
- 除法防除零：\`x / NULLIF(y, 0)\`

### 六、聚合函数一览

| 函数 | 作用 |
| --- | --- |
| \`COUNT(*)\` / \`COUNT(col)\` | 行数 / 非 NULL 行数 |
| \`SUM(x)\` / \`AVG(x)\` | 求和 / 平均 |
| \`MAX(x)\` / \`MIN(x)\` | 最大 / 最小 |
| \`GROUP_CONCAT(x, sep)\` | 拼接成字符串 |
| \`TOTAL(x)\` | 永远返回浮点（即使空表也返回 0.0） |

**COUNT 的坑**：
\`\`\`sql
COUNT(*)          -- 所有行（含 NULL）
COUNT(col)        -- col 非 NULL 的行数
COUNT(DISTINCT col) -- 去重后计数
\`\`\`

**GROUP_CONCAT**（SQLite）：
\`\`\`sql
SELECT dept, GROUP_CONCAT(name, ',') FROM emp GROUP BY dept;
-- 技术: '张三,王五'
\`\`\`

### 七、条件函数（SQLite 没有 IF，用 CASE）

- MySQL 有 \`IF(cond, a, b)\`、\`IFNULL\`
- PostgreSQL 有 \`COALESCE\`、\`NULLIF\`
- SQLite **没有 IF**，用 \`CASE WHEN cond THEN a ELSE b END\`

### 八、SQLite 与其他数据库函数差异

| 功能 | SQLite | MySQL | PostgreSQL |
| --- | --- | --- | --- |
| 拼接 \| \`a || b\` \| \`CONCAT(a,b)\` \| \`a || b\` 或 \`CONCAT\` |
| 取子串 | \`SUBSTR\` | \`SUBSTRING\`/\`SUBSTR\` | \`SUBSTRING\`/\`SUBSTR\` |
| 查位置 | \`INSTR\` | \`LOCATE\`/\`INSTR\` | \`POSITION(... IN ...)\` |
| 长度 | \`LENGTH\`（字符） | \`CHAR_LENGTH\`/\`LENGTH\`(字节) | \`CHAR_LENGTH\`/\`LENGTH\` |
| 格式化 | \`PRINTF\` | \`FORMAT\` | \`TO_CHAR\` |
| 当前时间 | \`DATETIME('now')\` | \`NOW()\` | \`NOW()\`/\`CURRENT_TIMESTAMP\` |
| 日期差 | \`JULIANDAY\` 算 | \`DATEDIFF\`/\`TIMESTAMPDIFF\` | \`EXTRACT(EPOCH FROM ...)\` |
| 日期加 | \`DATE(t,'+1 day')\` | \`DATE_ADD\` | \`t + INTERVAL '1 day'\` |
| IF 函数 | 无（用 CASE） | \`IF(c,a,b)\` | 无（用 CASE） |
| 自增 | \`INTEGER PRIMARY KEY\` | \`AUTO_INCREMENT\` | \`SERIAL\`/\`GENERATED\` |

**移植建议**：写跨库 SQL 时，**用标准函数**（\`COALESCE\`、\`CAST\`、\`SUBSTR\`、\`CASE\`），避免方言。

### 九、踩坑点

**坑 1：SUBSTR 起始位置**
\`SUBSTR(s, 0, 2)\` 在 SQLite 里和 \`SUBSTR(s, 1, 2)\` 行为类似但不规范，建议**始终从 1 开始**。

**坑 2：LENGTH 算的是字符还是字节**
SQLite 按字符，MySQL \`LENGTH\` 按字节、\`CHAR_LENGTH\` 按字符，移植时易错。

**坑 3：CAST 截断而非四舍五入**
\`CAST(3.9 AS INT)\` = 3。要四舍五入先 \`ROUND\`。

**坑 4：日期 'now' 是 UTC**
\`DATETIME('now')\` 是 UTC 时间，国内要 \`'localtime'\`。

### 十、生产建议

1. **跨库用标准函数**：\`COALESCE\`/\`CAST\`/\`CASE\`/\`SUBSTR\`
2. **金额转字符串用 PRINTF**：\`PRINTF('%.2f', amount)\` 保证 2 位小数
3. **日期统一 ISO 8601 存储**：\`'2026-06-29 14:30:00'\`，便于排序与跨库
4. **避免在 WHERE 里对列用函数**：\`WHERE DATE(col) = '2026-06-29'\` 会让索引失效，改用范围：\`WHERE col >= '2026-06-29' AND col < '2026-06-30'\`

下面代码演示各类函数用法。`,
    code: `-- ============================================================
-- 第三章演示：常用函数大全
-- ============================================================

-- 1. 字符串函数
SELECT '1. 字符串函数:' AS info;
SELECT
  LENGTH('hello')               AS 长度,
  LENGTH('你好')               AS 中文字符数,
  SUBSTR('hello world', 7)     AS 截取到尾,
  SUBSTR('hello world', 7, 5)  AS 截取5字符,
  REPLACE('a-b-c', '-', '_')  AS 替换,
  UPPER('abc')                 AS 大写,
  LOWER('ABC')                 AS 小写,
  TRIM('  hi  ')               AS 去两端空白,
  INSTR('hello', 'll')         AS 子串位置,
  PRINTF('%05.2f', 3.1)        AS 格式化,
  'Hello' || ', ' || 'World'  AS 拼接;

-- 2. 日期函数
SELECT '2. 日期函数:' AS info;
SELECT
  DATE('now', 'localtime')                          AS 今天,
  TIME('now', 'localtime')                          AS 当前时间,
  DATETIME('now', 'localtime')                     AS 当前日期时间,
  DATE('now', '+7 days')                            AS "7天后",
  DATE('now', '-1 month')                          AS "1月前",
  DATE('now', 'start of month')                    AS 本月1号,
  DATE('now', 'start of month', '-1 month')         AS 上月1号,
  STRFTIME('%Y年%m月%d日 %H时%M分', 'now', 'localtime') AS 中文格式,
  STRFTIME('%w', 'now')                            AS 星期几_0周日,
  STRFTIME('%j', 'now')                            AS 年内第几天;

-- 3. 日期运算与差值
SELECT '3. 日期差值:' AS info;
SELECT
  JULIANDAY('2026-12-31') - JULIANDAY('2026-01-01')                AS 年内剩余天数差,
  CAST(JULIANDAY('now') - JULIANDAY('2026-01-01') AS INTEGER)      AS 距年初天数,
  CAST((JULIANDAY('now','localtime') - JULIANDAY('2026-01-01')) * 24 AS INTEGER) AS 距年初小时;

-- 4. 数学函数
SELECT '4. 数学函数:' AS info;
SELECT
  ABS(-7.5)        AS 绝对值,
  ROUND(3.14159,2) AS 四舍五入,
  MAX(3, 5, 2)     AS 三数最大,
  MIN(3, 5, 2)     AS 三数最小,
  7 % 3            AS 取模,
  SIGN(-5)         AS 符号,
  SQRT(16)         AS 平方根;

-- 5. CAST 类型转换
SELECT '5. 类型转换:' AS info;
SELECT
  CAST('123' AS INTEGER)    AS 字符串转整数,
  CAST(3.9 AS INTEGER)      AS 浮点转整数_截断,
  ROUND(3.9, 0)             AS 四舍五入_4,
  CAST(ROUND(3.9,0) AS INTEGER) AS 四舍五入再转,
  CAST(3.14159 AS TEXT)     AS 数字转文本,
  CAST('abc' AS INTEGER)    AS 无法解析_返回0;

-- 6. NULL 处理
SELECT '6. NULL 处理:' AS info;
SELECT
  COALESCE(NULL, NULL, 'c')   AS COALESCE取首个非空,
  IFNULL(NULL, 'default')     AS IFNULL,
  NULLIF(5, 5)                AS NULLIF相等返NULL,
  NULLIF(5, 0)                AS NULLIF不等返原值;

-- 7. 除零防护组合拳
SELECT '7. 除零防护:' AS info;
SELECT
  100 / NULLIF(0, 0)                       AS 除零_返回NULL,
  COALESCE(100 * 1.0 / NULLIF(0, 0), 0)    AS 均值_默认0;

-- 8. 聚合函数
CREATE TABLE emp (
  id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary REAL
);
INSERT INTO emp (name, dept, salary) VALUES
  ('张三','技术',35000),('王五','技术',28000),
  ('李四','市场',22000),('赵六','市场',NULL);

SELECT '8. 聚合函数:' AS info;
SELECT
  COUNT(*)           AS 总行数,
  COUNT(salary)      AS 非空salary数,
  COUNT(DISTINCT dept) AS 不同部门数,
  SUM(salary)        AS 总和,
  AVG(salary)        AS 平均_忽略NULL,
  TOTAL(salary)      AS 总和_浮点,
  MAX(salary)        AS 最大,
  MIN(salary)        AS 最小
FROM emp;

-- 9. GROUP_CONCAT 字符串聚合
SELECT '9. 字符串聚合:' AS info;
SELECT dept, GROUP_CONCAT(name, ', ') AS 成员
FROM emp
GROUP BY dept;

-- 10. COUNT(*) vs COUNT(col) 差异
SELECT '10. COUNT 差异:' AS info;
SELECT
  COUNT(*)        AS 全部行数,
  COUNT(salary)   AS 非空salary,
  COUNT(name)     AS 非空name
FROM emp;

-- 11. 随机取行
SELECT '11. 随机取 2 行:' AS info;
SELECT name, dept FROM emp ORDER BY RANDOM() LIMIT 2;

-- 12. 字符串实战：清洗手机号
SELECT '12. 手机号清洗:' AS info;
SELECT
  REPLACE('010-1234-5678', '-', '') AS 去横线,
  SUBSTR('13812345678', 1, 3) || '****' || SUBSTR('13812345678', 8) AS 脱敏;

-- 13. 日期实战：年龄计算
SELECT '13. 年龄计算:' AS info;
SELECT
  CAST((JULIANDAY('now') - JULIANDAY('1990-06-15')) / 365.25 AS INTEGER) AS 年龄_粗略,
  STRFTIME('%Y', 'now') - STRFTIME('%Y', '1990-06-15') AS 年份差;`,
  },

  // =========================================================
  // 第四章：CTE 通用表表达式
  // =========================================================
  {
    id: "sql-cte",
    group: "高级查询",
    icon: "📋",
    title: "CTE 通用表表达式",
    content: `## CTE 通用表表达式

CTE（Common Table Expression）用 \`WITH\` 子句定义"临时结果集"，让 SQL 像"写程序"一样**分步骤、有名字**地组织查询。它是替代子查询的优雅方案，递归 CTE 更是处理树形结构的利器。

### 一、WITH 子句基础

\`\`\`sql
WITH cte_name AS (
  SELECT ...   -- 临时结果集定义
)
SELECT * FROM cte_name;   -- 像查表一样引用
\`\`\`

对比子查询写法：

\`\`\`sql
-- 子查询：嵌套、可读性差
SELECT * FROM (SELECT dept, AVG(salary) AS avg_s FROM emp GROUP BY dept) t
WHERE avg_s > 20000;

-- CTE：扁平、清晰
WITH dept_avg AS (
  SELECT dept, AVG(salary) AS avg_s FROM emp GROUP BY dept
)
SELECT * FROM dept_avg WHERE avg_s > 20000;
\`\`\`

### 二、多个 CTE 串联

一次 \`WITH\` 可以定义多个 CTE，**后者可引用前者**：

\`\`\`sql
WITH
  step1 AS (SELECT dept, AVG(salary) AS avg_s FROM emp GROUP BY dept),
  step2 AS (SELECT * FROM step1 WHERE avg_s > 20000),
  step3 AS (SELECT e.* FROM emp e JOIN step2 s ON e.dept = s.dept)
SELECT * FROM step3;
\`\`\`

像管道一样一步步加工数据，比"嵌套 5 层子查询"可读性高一个数量级。

### 三、CTE 提升可读性

**核心价值**：把"一大坨"SQL 拆成命名小块。复杂业务查询用 CTE 重构后，维护成本骤降。

\`\`\`sql
-- ❌ 一坨嵌套
SELECT u.name, t.total FROM users u JOIN (
  SELECT user_id, SUM(amount) AS total FROM (
    SELECT * FROM orders WHERE status='paid'
  ) GROUP BY user_id
) t ON u.id = t.user_id WHERE t.total > 1000;

-- ✅ CTE 拆解
WITH paid AS (
  SELECT * FROM orders WHERE status='paid'
),
user_total AS (
  SELECT user_id, SUM(amount) AS total FROM paid GROUP BY user_id
)
SELECT u.name, ut.total
FROM users u
JOIN user_total ut ON u.id = ut.user_id
WHERE ut.total > 1000;
\`\`\`

### 四、多次引用同一 CTE

一个 CTE 定义后可被多次引用（子查询要复制多份）：

\`\`\`sql
WITH dept_stats AS (
  SELECT dept, AVG(salary) AS avg_s, COUNT(*) AS cnt FROM emp GROUP BY dept
)
-- 同一个 CTE 被引用两次
SELECT e.name, e.salary, ds.avg_s
FROM emp e
JOIN dept_stats ds ON e.dept = ds.dept
WHERE e.salary > ds.avg_s
UNION ALL
SELECT '总计', NULL, NULL FROM dept_stats WHERE cnt > 1;
\`\`\`

### 五、递归 CTE：WITH RECURSIVE

递归 CTE 是 CTE 的"超级用法"，能处理**树形结构、层级关系**。语法：

\`\`\`sql
WITH RECURSIVE cte AS (
  -- 基础查询（锚点，递归起点）
  SELECT ...
  UNION ALL
  -- 递归部分：引用自己
  SELECT ... FROM cte JOIN ...
)
SELECT * FROM cte;
\`\`\`

**执行原理**：
1. 先执行"锚点"得到初始结果集
2. 用初始结果去 join 自己，得到下一层
3. 重复 2，直到没有新数据
4. 用 UNION 合并所有层

### 六、递归 CTE 实战 1：组织架构树

\`\`\`sql
-- 员工表（带上级 manager_id）
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT,
  manager_id INTEGER
);

-- 查某员工的所有下属（含多层）
WITH RECURSIVE subordinates AS (
  -- 锚点：起点
  SELECT id, name, manager_id, 1 AS level
  FROM employees WHERE id = 1
  UNION ALL
  -- 递归：找上一层的下属
  SELECT e.id, e.name, e.manager_id, s.level + 1
  FROM employees e
  JOIN subordinates s ON e.manager_id = s.id
)
SELECT * FROM subordinates;
\`\`\`

### 七、递归 CTE 实战 2：斐波那契数列

\`\`\`sql
WITH RECURSIVE fib(n, a, b) AS (
  SELECT 1, 0, 1          -- 锚点：第1项
  UNION ALL
  SELECT n+1, b, a+b      -- 递归：下一项
  FROM fib WHERE n < 10
)
SELECT n, a FROM fib;
\`\`\`

### 八、递归 CTE 实战 3：连续数字 / 日期序列

生成"日历表"或"连续 ID 序列"：

\`\`\`sql
-- 生成 1 到 10 的序列
WITH RECURSIVE seq(n) AS (
  SELECT 1
  UNION ALL
  SELECT n+1 FROM seq WHERE n < 10
)
SELECT * FROM seq;

-- 生成最近 7 天
WITH RECURSIVE days(d) AS (
  SELECT DATE('now')
  UNION ALL
  SELECT DATE(d, '-1 day') FROM days WHERE d > DATE('now','-6 days')
)
SELECT * FROM days;
\`\`\`

### 九、CTE vs 子查询 vs 视图

| 维度 | CTE | 子查询 | 视图 |
| --- | --- | --- | --- |
| 作用域 | 单条语句 | 单条语句 | 持久化 |
| 可复用 | 同语句内多次 | 否 | 跨语句 |
| 命名 | 有 | 无 | 有 |
| 可读性 | 高 | 低 | 高 |
| 性能 | 通常等同子查询 | - | 可缓存（物化视图） |
| 递归 | 支持 | 不支持 | 不支持（除非物化） |

**选择心法**：
- 单条语句内的临时计算 → **CTE**
- 只用一次的简单子查询 → **子查询**（不必硬上 CTE）
- 多条语句复用 → **视图**
- 树形/层级 → **递归 CTE**

### 十、CTE 性能考虑

**关键事实**：在 SQLite / PostgreSQL 中，CTE 通常是"语法糖"，被优化器内联，性能与子查询基本一致。

但要注意：
- **PostgreSQL 12 之前** CTE 是"优化栅栏"（不内联，必须物化），可能慢；12+ 默认内联
- **多次引用的 CTE** 可能被多次执行（除非优化器能复用）
- **递归 CTE** 一定要有终止条件，否则死循环

\`\`\`sql
-- ❌ 没有终止条件，死循环
WITH RECURSIVE r AS (
  SELECT 1 AS n UNION ALL SELECT n+1 FROM r
) SELECT * FROM r;  -- 会一直递归直到报错/超时

-- ✅ 加 WHERE 限制
WITH RECURSIVE r AS (
  SELECT 1 AS n UNION ALL SELECT n+1 FROM r WHERE n < 100
) SELECT * FROM r;
\`\`\`

### 十一、递归 CTE 注意事项

1. **必须有 UNION / UNION ALL**：连接锚点和递归部分
2. **递归部分不能有 GROUP BY / HAVING / 聚合函数**（在递归项里）
3. **递归列数和类型必须一致**（UNION 要求）
4. **加 LIMIT 兜底**：保险起见加 \`LIMIT\` 防止意外死循环
5. **层级深时性能**：每层都全表扫描，深度大可加索引

### 十二、踩坑点

**坑 1：递归没有终止**
忘记 \`WHERE n < ...\`，导致无限递归。务必加边界条件。

**坑 2：CTE 名字冲突**
\`\`\`sql
WITH t AS (...), t AS (...)  -- ❌ 重名
\`\`\`

**坑 3：递归项用了 LEFT JOIN 可能放大结果**
\`\`\`sql
-- LEFT JOIN 在递归里会把不匹配的也带进来，导致重复
\`\`\`
递归通常用 INNER JOIN。

**坑 4：CTE 在 SQLite 中默认物化**
老版本 SQLite（3.25 之前）CTE 不内联，多次引用会多次执行。

### 十三、生产建议

1. **复杂查询首选 CTE**：可读性远高于嵌套子查询
2. **递归处理树形结构**：组织架构、评论树、菜单树
3. **生成序列用递归**：补齐日期、生成连续 ID
4. **递归加 LIMIT 兜底**：\`... LIMIT 1000\` 防死循环
5. **递归项的关联列建索引**：如 \`manager_id\` 建索引

下面代码演示 CTE 和递归 CTE 的用法。`,
    code: `-- ============================================================
-- 第四章演示：CTE 通用表表达式
-- ============================================================

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  dept TEXT,
  salary REAL,
  manager_id INTEGER
);

INSERT INTO employees (name, dept, salary, manager_id) VALUES
  ('CEO张', '管理层', 100000, NULL),
  ('技术总监李', '技术部', 60000, 1),
  ('市场总监王', '市场部', 55000, 1),
  ('组长赵', '技术部', 40000, 2),
  ('组长钱', '技术部', 38000, 2),
  ('工程师孙', '技术部', 30000, 4),
  ('工程师周', '技术部', 32000, 4),
  ('工程师吴', '技术部', 28000, 5),
  ('市场员郑', '市场部', 25000, 3),
  ('市场员冯', '市场部', 24000, 3);

SELECT '0. 原始数据:' AS info;
SELECT * FROM employees;

-- 1. 基础 CTE：各部门平均工资
SELECT '1. CTE 求部门均薪:' AS info;
WITH dept_avg AS (
  SELECT dept, AVG(salary) AS avg_s, COUNT(*) AS cnt
  FROM employees
  GROUP BY dept
)
SELECT * FROM dept_avg ORDER BY avg_s DESC;

-- 2. 多个 CTE 串联
SELECT '2. 多 CTE 串联（找高于部门均薪的员工）:' AS info;
WITH
  dept_avg AS (
    SELECT dept, AVG(salary) AS avg_s FROM employees GROUP BY dept
  ),
  above_avg AS (
    SELECT e.name, e.dept, e.salary, da.avg_s
    FROM employees e
    JOIN dept_avg da ON e.dept = da.dept
    WHERE e.salary > da.avg_s
  )
SELECT * FROM above_avg ORDER BY dept, salary DESC;

-- 3. 多次引用同一 CTE
SELECT '3. 同一 CTE 多次引用:' AS info;
WITH dept_stats AS (
  SELECT dept, AVG(salary) AS avg_s, MAX(salary) AS max_s, MIN(salary) AS min_s
  FROM employees GROUP BY dept
)
SELECT e.name, e.dept, e.salary,
       ds.avg_s AS 部门均薪,
       CASE WHEN e.salary = ds.max_s THEN '部门最高'
            WHEN e.salary = ds.min_s THEN '部门最低'
            ELSE '普通' END AS 标签
FROM employees e
JOIN dept_stats ds ON e.dept = ds.dept
ORDER BY e.dept, e.salary DESC;

-- 4. 递归 CTE：组织架构树（找 CEO 的所有下属，多层）
SELECT '4. 组织架构树:' AS info;
WITH RECURSIVE org_tree AS (
  -- 锚点：CEO（顶层）
  SELECT id, name, manager_id, 0 AS level, name AS path
  FROM employees WHERE manager_id IS NULL
  UNION ALL
  -- 递归：找下属
  SELECT e.id, e.name, e.manager_id, t.level + 1, t.path || ' > ' || e.name
  FROM employees e
  JOIN org_tree t ON e.manager_id = t.id
)
SELECT level AS 层级, name AS 姓名, path AS 路径 FROM org_tree
ORDER BY level, name;

-- 5. 递归 CTE：找某人的所有下属（以技术总监李 id=2 为例）
SELECT '5. 技术总监的所有下属:' AS info;
WITH RECURSIVE subs AS (
  SELECT id, name, manager_id, 1 AS level
  FROM employees WHERE manager_id = 2
  UNION ALL
  SELECT e.id, e.name, e.manager_id, s.level + 1
  FROM employees e JOIN subs s ON e.manager_id = s.id
)
SELECT level AS 层级, name AS 姓名 FROM subs ORDER BY level, name;

-- 6. 递归 CTE：找上级链（从工程师周 id=7 往上找所有上级）
SELECT '6. 从员工向上找上级链:' AS info;
WITH RECURSIVE bosses AS (
  SELECT id, name, manager_id, 0 AS level
  FROM employees WHERE id = 7
  UNION ALL
  SELECT e.id, e.name, e.manager_id, b.level + 1
  FROM employees e JOIN bosses b ON e.id = b.manager_id
)
SELECT level AS 距离, name AS 姓名 FROM bosses ORDER BY level;

-- 7. 递归生成数字序列
SELECT '7. 生成 1-10 序列:' AS info;
WITH RECURSIVE seq(n) AS (
  SELECT 1
  UNION ALL
  SELECT n+1 FROM seq WHERE n < 10
)
SELECT n, n*n AS 平方 FROM seq;

-- 8. 递归生成日期序列（最近 7 天）
SELECT '8. 最近 7 天日期:' AS info;
WITH RECURSIVE days(d) AS (
  SELECT DATE('now', 'localtime')
  UNION ALL
  SELECT DATE(d, '-1 day') FROM days
  WHERE d > DATE('now','localtime','-6 days')
)
SELECT d AS 日期, STRFTIME('%w', d) AS 周几 FROM days ORDER BY d;

-- 9. 递归生成斐波那契数列
SELECT '9. 斐波那契前 10 项:' AS info;
WITH RECURSIVE fib(n, a, b) AS (
  SELECT 1, 0, 1
  UNION ALL
  SELECT n+1, b, a+b FROM fib WHERE n < 10
)
SELECT n AS 项, a AS 值 FROM fib;

-- 10. CTE 对比子查询：补齐缺失日期
CREATE TABLE daily_sales (sale_date TEXT, amount REAL);
INSERT INTO daily_sales VALUES
  ('2026-06-25', 100), ('2026-06-27', 200), ('2026-06-28', 150);
-- 缺少 06-26 和 06-29

SELECT '10. 补齐缺失日期:' AS info;
WITH RECURSIVE date_range(d) AS (
  SELECT DATE('2026-06-25')
  UNION ALL
  SELECT DATE(d, '+1 day') FROM date_range WHERE d < DATE('2026-06-29')
)
SELECT dr.d AS 日期, COALESCE(ds.amount, 0) AS 销售额
FROM date_range dr
LEFT JOIN daily_sales ds ON dr.d = ds.sale_date
ORDER BY dr.d;

-- 11. 递归带 LIMIT 兜底
SELECT '11. 递归加 LIMIT 兜底:' AS info;
WITH RECURSIVE counter(n) AS (
  SELECT 1
  UNION ALL
  SELECT n+1 FROM counter WHERE n < 100
)
SELECT COUNT(*) AS 生成了多少条 FROM counter;`,
  },

  // =========================================================
  // 第五章：视图 VIEW
  // =========================================================
  {
    id: "sql-view",
    group: "高级查询",
    icon: "👁️",
    title: "视图 VIEW",
    content: `## 视图 VIEW

视图是"**存起来的查询**"——不存数据，只存 SQL 定义。查视图时，数据库把定义展开成对基表的查询。视图是简化查询、控制权限、抽象数据的利器。

### 一、CREATE VIEW 基础

\`\`\`sql
CREATE VIEW 视图名 AS
SELECT ...;
\`\`\`

\`\`\`sql
CREATE VIEW active_users AS
SELECT id, name, email FROM users WHERE status = 'active';

-- 像查表一样用
SELECT * FROM active_users;
\`\`\`

### 二、视图是虚拟表

**核心特征**：视图不存数据，只存查询定义。每次查视图，数据库都"实时"展开成对基表的查询。

\`\`\`sql
-- 查 active_users 等价于：
SELECT id, name, email FROM users WHERE status = 'active';
\`\`\`

**含义**：
- 基表数据变了，视图结果**自动跟着变**
- 视图本身**不占数据存储**（只占一点元数据）
- 视图可以再被其他视图引用（但别套太深）

### 三、视图的用途

**1. 简化查询**

把复杂的 join、聚合封装成视图，业务层只查视图：

\`\`\`sql
-- 复杂查询封装
CREATE VIEW order_summary AS
SELECT o.id, u.name AS customer, o.total, o.status
FROM orders o JOIN users u ON o.user_id = u.id;

-- 业务层简单查询
SELECT * FROM order_summary WHERE status='paid';
\`\`\`

**2. 权限控制**

只暴露部分列给某些用户：

\`\`\`sql
-- 用户表有 password 列，对外只暴露基本信息
CREATE VIEW user_public AS
SELECT id, name, email FROM users;  -- 不含 password
\`\`\`

给某用户只授权 \`user_public\`，无法看到密码。

**3. 数据抽象**

基表结构变化时，视图做"适配层"，业务层 SQL 不变：

\`\`\`sql
-- 老表 users 拆成 user_profile + user_auth
-- 用视图保持对外接口不变
CREATE VIEW users AS
SELECT p.id, p.name, a.email, a.password
FROM user_profile p JOIN user_auth a ON p.id = a.user_id;
\`\`\`

### 四、CREATE OR REPLACE / IF NOT EXISTS

\`\`\`sql
-- PostgreSQL / MySQL: CREATE OR REPLACE（替换已有视图）
CREATE OR REPLACE VIEW v AS SELECT ...;

-- SQLite 不支持 OR REPLACE，要先 DROP 再 CREATE
DROP VIEW IF EXISTS v;
CREATE VIEW v AS SELECT ...;

-- 防止报错
CREATE VIEW IF NOT EXISTS v AS SELECT ...;
\`\`\`

### 五、WITH CHECK OPTION

保证通过视图**修改的数据**仍满足视图的 WHERE 条件：

\`\`\`sql
CREATE VIEW active_users AS
SELECT * FROM users WHERE status='active'
WITH CHECK OPTION;

-- 插入 status='inactive' 会被拒绝（违反视图条件）
INSERT INTO active_users (id, name, status) VALUES (1, 'x', 'inactive');  -- 报错
\`\`\`

**作用**：防止"通过视图写入"不符合视图过滤条件的数据。

**注意**：SQLite 不支持 \`WITH CHECK OPTION\`，MySQL/PostgreSQL 支持。

### 六、可更新视图

简单视图（单表、无聚合、无 DISTINCT、无 GROUP BY）支持 \`INSERT/UPDATE/DELETE\`，操作直接落到基表。

\`\`\`sql
CREATE VIEW v AS SELECT id, name FROM users;

UPDATE v SET name='新名' WHERE id=1;  -- 等价于 UPDATE users SET name='新名' WHERE id=1;
\`\`\`

**不可更新的视图**：
- 含聚合（SUM/COUNT/...）
- 含 DISTINCT
- 含 GROUP BY / HAVING
- 多表 join（部分数据库支持有限更新）
- 含计算列

### 七、物化视图 MATERIALIZED VIEW

普通视图是"虚拟的"，每次查都重算。**物化视图**把结果**实际存下来**，查得快但要刷新。

\`\`\`sql
-- PostgreSQL 语法
CREATE MATERIALIZED VIEW sales_summary AS
SELECT product, SUM(amount) FROM sales GROUP BY product;

-- 刷新（手动或定时）
REFRESH MATERIALIZED VIEW sales_summary;
\`\`\`

| 对比 | 普通视图 | 物化视图 |
| --- | --- | --- |
| 存数据 | 否 | 是 |
| 查询速度 | 慢（实时算） | 快（查快照） |
| 数据时效 | 实时 | 取决于刷新 |
| 占空间 | 几乎不占 | 占 |
| 支持 | 所有数据库 | PostgreSQL/Oracle/SQL Server（MySQL 无） |

**SQLite 没有 MATERIALIZED VIEW**。要模拟：用 \`CREATE TABLE summary AS SELECT ...\` 定时重建。

### 八、视图 vs 表 vs CTE

| 维度 | 表 | 视图 | CTE |
| --- | --- | --- | --- |
| 存数据 | 是 | 否 | 否 |
| 持久化 | 是 | 是 | 否（单语句） |
| 跨语句复用 | 是 | 是 | 否 |
| 实时性 | 实时 | 实时（基表变即变） | - |
| 占空间 | 大 | 极小 | 无 |
| 性能 | 直接 | 取决于查询复杂度 | 取决于优化器 |

**选择心法**：
- 真实业务数据 → **表**
- 跨会话复用的查询逻辑 → **视图**
- 单条复杂查询内的临时计算 → **CTE**
- 数据量大、查询慢、可容忍延迟 → **物化视图**

### 九、视图的局限

**1. 性能不一定提升**
视图本质是"展开 SQL"，复杂视图查起来和直接写一样慢，甚至更慢（优化器可能放弃某些优化）。

**2. 嵌套视图难维护**
\`v3\` 引用 \`v2\` 引用 \`v1\`，调试地狱。改底层一个视图，可能影响一堆上层。

**3. 视图不能加索引**
视图本身没索引（索引在基表上）。复杂视图的性能优化要回到基表。

**4. 视图与基表耦合**
基表结构变了（删列、改类型），视图可能失效。需同步更新视图定义。

**5. 权限传递的坑**
视图的查询权限取决于"视图所有者"还是"当前用户"（不同数据库行为不同）：
- PostgreSQL：默认 \`security_barrier=off\`，视图所有者权限
- MySQL：SQL SECURITY DEFINER / INVOKER 可选

### 十、视图 vs 临时表

| 维度 | 视图 | 临时表 |
| --- | --- | --- |
| 持久 | 持久（元数据） | 会话级 |
| 存数据 | 否 | 是 |
| 跨会话 | 是 | 否 |
| 实时 | 是 | 创建时的快照 |

**用临时表的场景**：同一会话多次用同一中间结果，且数据量大。临时表能加索引、可改数据，性能比反复查视图好。

### 十一、DROP / ALTER VIEW

\`\`\`sql
DROP VIEW view_name;
DROP VIEW IF EXISTS view_name;  -- 防报错

-- 改视图：SQLite 不支持 ALTER VIEW，只能 DROP + CREATE
-- PostgreSQL 支持 CREATE OR REPLACE
\`\`\`

### 十二、踩坑点

**坑 1：视图列名重复**
\`\`\`sql
-- 两列都叫 name 会冲突
CREATE VIEW v AS SELECT u.name, d.name FROM users u JOIN dept d ...;
-- ✅ 起别名
CREATE VIEW v AS SELECT u.name AS user_name, d.name AS dept_name ...;
\`\`\`

**坑 2：视图性能陷阱**
"视图让查询更快"是误解。视图是语法糖，复杂视图查起来一样慢。优化必须回到基表加索引、改 SQL。

**坑 3：嵌套视图**
\`v3 → v2 → v1\`，看似模块化，实则难调试、难优化、难维护。**建议视图最多 2 层**。

**坑 4：可更新视图的隐式行为**
通过视图 UPDATE 可能意外改了不该改的行（因为视图 WHERE 条件可能不直观）。慎用可更新视图做关键业务。

**坑 5：物化视图的"过期"**
物化视图不自动同步基表，数据可能滞后。业务上要明确"可容忍多久延迟"。

### 十三、生产建议

1. **视图用于简化与抽象**：不指望它提速
2. **视图层级 ≤ 2**：避免嵌套地狱
3. **列名起别名**：避免重名冲突
4. **物化视图明确刷新策略**：定时任务或基表变更时触发
5. **权限控制用视图**：暴露必要的列，隐藏敏感字段
6. **基表重构用视图兜接口**：保持对外 SQL 不变
7. **大查询别用视图**：直接写 SQL + 索引，性能更可控

下面代码演示视图的创建、查询、更新与局限。`,
    code: `-- ============================================================
-- 第五章演示：视图 VIEW
-- ============================================================

-- 基表
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  password TEXT,        -- 敏感字段
  dept_id INTEGER,
  status TEXT DEFAULT 'active'
);

CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  amount REAL,
  status TEXT,
  created_at TEXT DEFAULT (datetime('now','localtime'))
);

INSERT INTO departments (name) VALUES ('技术部'), ('市场部'), ('人事部');

INSERT INTO users (name, email, password, dept_id, status) VALUES
  ('张三', 'zs@example.com', 'pwd1', 1, 'active'),
  ('李四', 'ls@example.com', 'pwd2', 2, 'active'),
  ('王五', 'ww@example.com', 'pwd3', 1, 'inactive'),
  ('赵六', 'zl@example.com', 'pwd4', 3, 'active');

INSERT INTO orders (user_id, amount, status) VALUES
  (1, 100, 'paid'), (1, 200, 'paid'),
  (2, 150, 'pending'), (2, 300, 'paid'),
  (3, 50, 'paid'),
  (4, 500, 'paid');

SELECT '0. 基表 users:' AS info;
SELECT id, name, email, dept_id, status FROM users;

-- 1. 创建视图：简化查询（用户+部门）
SELECT '1. 视图简化 join:' AS info;
CREATE VIEW user_with_dept AS
SELECT u.id, u.name, u.email, d.name AS dept, u.status
FROM users u
LEFT JOIN departments d ON u.dept_id = d.id;

SELECT * FROM user_with_dept ORDER BY id;

-- 2. 视图做权限控制（隐藏 password 列）
SELECT '2. 视图隐藏敏感列:' AS info;
CREATE VIEW user_public AS
SELECT id, name, email, status FROM users;

SELECT * FROM user_public ORDER BY id;

-- 3. 视图带 WHERE 过滤（只看活跃用户）
SELECT '3. 视图过滤活跃用户:' AS info;
CREATE VIEW active_users AS
SELECT id, name, email, dept_id FROM users WHERE status='active';

SELECT * FROM active_users ORDER BY id;

-- 4. 视图实时性（基表改了视图跟着变）
SELECT '4. 视图实时性:' AS info;
INSERT INTO users (name, email, dept_id, status) VALUES ('孙七', 'sq@example.com', 2, 'active');
SELECT '新增孙七后查 active_users:' AS info;
SELECT * FROM active_users ORDER BY id;

-- 5. 复杂视图：用户订单汇总
SELECT '5. 复杂视图（用户订单汇总）:' AS info;
CREATE VIEW user_order_summary AS
SELECT u.id, u.name, u.email,
       COUNT(o.id) AS 订单数,
       COALESCE(SUM(o.amount), 0) AS 总消费,
       COUNT(CASE WHEN o.status='paid' THEN 1 END) AS 已付款数
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name, u.email;

SELECT * FROM user_order_summary ORDER BY 总消费 DESC;

-- 6. 可更新视图说明（SQLite 默认不支持通过视图 UPDATE，需用 INSTEAD OF 触发器）
SELECT '6. 视图更新说明:' AS info;
-- SQLite 默认不允许 UPDATE 视图，直接更新基表
UPDATE users SET email='new_zs@example.com' WHERE id=1;
SELECT '更新基表后（视图 active_users 自动反映）:' AS info;
SELECT id, name, email FROM users WHERE id=1;

-- 7. 视图嵌套（视图引用视图，慎用）
SELECT '7. 视图嵌套:' AS info;
CREATE VIEW vip_users AS
SELECT * FROM user_order_summary WHERE 总消费 >= 300;
SELECT * FROM vip_users ORDER BY 总消费 DESC;

-- 8. 视图聚合（不可更新）
SELECT '8. 聚合视图不可更新:' AS info;
CREATE VIEW dept_stats AS
SELECT d.name AS 部门, COUNT(u.id) AS 人数
FROM departments d LEFT JOIN users u ON u.dept_id = d.id
GROUP BY d.name;
SELECT * FROM dept_stats ORDER BY 人数 DESC;

-- 9. DROP 与重建视图
SELECT '9. 重建视图:' AS info;
DROP VIEW IF EXISTS active_users;
CREATE VIEW active_users AS
SELECT id, name, email, dept_id, status FROM users WHERE status='active';
SELECT * FROM active_users ORDER BY id;

-- 10. 模拟物化视图（SQLite 用 CREATE TABLE AS）
SELECT '10. 模拟物化视图（快照表）:' AS info;
CREATE TABLE sales_summary AS
SELECT u.name AS 用户, COUNT(o.id) AS 订单数, COALESCE(SUM(o.amount),0) AS 总额
FROM users u LEFT JOIN orders o ON u.id=o.user_id
GROUP BY u.name;
SELECT * FROM sales_summary ORDER BY 总额 DESC;

-- 基表变化后，"快照表"不自动更新（对比视图）
INSERT INTO orders (user_id, amount, status) VALUES (1, 999, 'paid');
SELECT '基表新增订单后对比:' AS info;
SELECT '视图 user_order_summary（实时）:' AS label;
SELECT id, name, 总消费 FROM user_order_summary WHERE id=1;
SELECT '快照表 sales_summary（不更新）:' AS label;
SELECT * FROM sales_summary WHERE 用户='张三';

-- 11. 视图用于列重命名与计算
SELECT '11. 视图计算列:' AS info;
CREATE VIEW order_with_label AS
SELECT id, user_id, amount, status, created_at,
       CASE
         WHEN amount >= 300 THEN '大单'
         WHEN amount >= 100 THEN '中单'
         ELSE '小单'
       END AS 单据等级
FROM orders;
SELECT * FROM order_with_label ORDER BY amount DESC;`,
  },
];
