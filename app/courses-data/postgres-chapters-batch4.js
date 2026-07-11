// =============================================================
// 《PostgreSQL 实战教程》- 章节批次 4
// -------------------------------------------------------------
// 内容：第四部分 PG 特色功能（第 19-24 章）
// =============================================================

const chapters = [
  {
    id: "pg-ch19",
    group: "第四部分 PG 特色功能",
    icon: "📄",
    title: "第 19 章 JSON 与 JSONB",
    content: `# 第 19 章 JSON 与 JSONB

PostgreSQL 对 JSON 的支持是它最强大的"特色武器"之一。与 MySQL 把 JSON 当作一种特殊列不同，PG 同时提供了 \`\`json\`\` 与 \`\`jsonb\`\` 两种类型，再加上 GIN 索引和一整套操作符、函数，几乎可以当作"文档数据库"来用。本章系统讲解 JSON 与 JSONB 的差异、查询、修改、索引和性能调优。

## 19.1 JSON 与 JSONB 概述

PG 提供两种 JSON 类型：

| 类型 | 存储格式 | 保留输入 | 重复键 | 索引支持 | 适用场景 |
| --- | --- | --- | --- | --- | --- |
| \`\`json\`\` | 原始文本（逐字存储） | 保留空格、顺序、重复键 | 保留 | 弱 | 仅作透传、日志归档 |
| \`\`jsonb\`\` | 解析后的二进制 | 不保留空格/顺序 | 后值覆盖 | 强（GIN/BTree） | 查询、修改、索引 |

> **核心建议**：除非有"原样保留"的审计需求，**生产环境一律用 jsonb**。它解析一次后存为二进制，查询快、可索引、可比较。

对比演示：

\`\`\`sql
-- json：原样保留
SELECT '{"a": 1, "a": 2}'::json;
-- {"a": 1, "a": 2}   重复键被保留

-- jsonb：解析后去重，后值覆盖
SELECT '{"a": 1, "a": 2}'::jsonb;
-- {"a": 2}           重复键只保留最后一个

-- jsonb 还会规范化键顺序与空格
SELECT '{"b":2, "a":1}'::jsonb;
-- {"a": 1, "b": 2}   键按内部顺序排序
\`\`\`

\`\`\`sql
-- jsonb 支持相等比较，json 不支持
SELECT '{"a":1,"b":2}'::jsonb = '{"b":2,"a":1}'::jsonb; -- true
SELECT '{"a":1,"b":2}'::json  = '{"b":2,"a":1}'::json;  -- 报错：operator does not exist
\`\`\`

## 19.2 创建表与插入 JSON 数据

\`\`\`sql
-- 创建带 jsonb 列的表
CREATE TABLE users (
  id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  info JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 插入数据：用字符串字面量，PG 会自动转成 jsonb
INSERT INTO users (name, info) VALUES
  ('Alice', '{"age": 28, "city": "北京", "tags": ["vip","admin"]}'),
  ('Bob',   '{"age": 35, "city": "上海", "tags": ["user"], "addr": {"zip": "200000"}}'),
  ('Carol', '{"age": 22, "city": "北京"}');

-- 用 ::jsonb 显式转换更安全
INSERT INTO users (name, info) VALUES ('Dave', ('{"age":40}'::jsonb));

SELECT name, info FROM users;
\`\`\`

> 插入非法 JSON 会直接报错，PG 自带语法校验：\`INSERT INTO users(name,info) VALUES ('Eve','{bad');\` 报 \`invalid input syntax for type json\`。

## 19.3 查询 JSON：->、->>、#>、#>> 操作符

四个最常用的取值操作符：

| 操作符 | 右操作数 | 返回类型 | 说明 |
| --- | --- | --- | --- |
| \`\`->\`\` | int / text | jsonb | 按下标取数组元素 / 按键取对象值，**返回 jsonb** |
| \`\`->>\`\` | int / text | text | 同上，但**返回 text**（去引号） |
| \`\`#>\`\` | text[] | jsonb | 按路径取值，返回 jsonb |
| \`\`#>>\`\` | text[] | text | 按路径取值，返回 text |

\`\`\`sql
-- 取对象字段
SELECT info->'city'      FROM users WHERE name='Alice'; -- "北京"（jsonb，带引号）
SELECT info->>'city'     FROM users WHERE name='Alice'; -- 北京（text，无引号）

-- 取数组元素
SELECT info->'tags'->0      FROM users WHERE name='Alice'; -- "vip"
SELECT info->'tags'->>0     FROM users WHERE name='Alice'; -- vip
SELECT info->'tags'->>1     FROM users WHERE name='Alice'; -- admin

-- 路径取值：用 #> / #>>
SELECT info #>  '{addr,zip}'  FROM users WHERE name='Bob'; -- "200000"
SELECT info #>> '{addr,zip}'  FROM users WHERE name='Bob'; -- 200000
\`\`\`

**用 ->> 在 WHERE 中过滤**（这是最常见用法）：

\`\`\`sql
-- 查所有北京用户
SELECT name, info->>'city' AS city
FROM users
WHERE info->>'city' = '北京';

-- 查年龄大于 30 的用户
SELECT name, info->>'age' AS age
FROM users
WHERE (info->>'age')::int > 30;
\`\`\`

> 注意 \`\`->>\`\` 返回的是 text，要和数字比较需 \`\`::int\`\` 转换，否则走字符串比较会出错。

## 19.4 构建与修改 JSONB

PG 提供一整套函数来"造"和"改" jsonb：

| 函数 | 作用 |
| --- | --- |
| \`\`jsonb_build_object(key, val, ...)\`\` | 按键值对构造 jsonb 对象 |
| \`\`jsonb_build_array(val, ...)\`\` | 构造 jsonb 数组 |
| \`\`jsonb_object(keys, vals)\`\` | 由两个数组构造对象 |
| \`\`jsonb_agg(expr)\`\` | 聚合多行为一个 jsonb 数组 |
| \`\`jsonb_object_agg(key, val)\`\` | 聚合为 jsonb 对象 |
| \`\`jsonb_set(target, path, new_value, create_if_missing)\`\` | 修改/插入指定路径的值 |
| \`\`jsonb_insert(target, path, new_value, insert_after)\`\` | 在数组中插入元素 |
| \`\`jsonb_strip_nulls(jsonb)\`\` | 递归删除值为 null 的键 |
| \`\`-\`\` 操作符 | 删除键或数组下标 |

\`\`\`sql
-- 构造对象
SELECT jsonb_build_object('name','Alice','age',28,'vip',true);
-- {"name": "Alice", "age": 28, "vip": true}

-- 用聚合把多行打包成 JSON 数组（生成接口数据时极有用）
SELECT jsonb_agg(name ORDER BY id) AS names FROM users;
-- ["Alice", "Bob", "Carol", "Dave"]

-- 按城市分组，聚合每个城市的用户名
SELECT
  info->>'city' AS city,
  jsonb_agg(jsonb_build_object('id', id, 'name', name)) AS members
FROM users
GROUP BY info->>'city';
\`\`\`

**修改与删除**：

\`\`\`sql
-- jsonb_set：把 Alice 的 age 改成 29（路径用数组表示）
UPDATE users
SET info = jsonb_set(info, '{age}', '29')
WHERE name = 'Alice';

-- create_if_missing=true（默认）：路径不存在则新增
UPDATE users
SET info = jsonb_set(info, '{addr,zip}', '"100000"', true)
WHERE name = 'Alice';

-- 用 - 删除键
UPDATE users SET info = info - 'tags' WHERE name = 'Bob';

-- 删除数组元素（按下标）
UPDATE users SET info = info #- '{tags,0}' WHERE name = 'Alice';

-- jsonb_insert：在数组末尾追加（-1 表示末尾后追加？注意 PG 语义）
-- path 指向数组，insert_after=false 表示在该位置前插入
UPDATE users
SET info = jsonb_insert(info, '{tags,0}', '"new"')
WHERE name = 'Carol';

-- 去掉所有 null 值
SELECT jsonb_strip_nulls('{"a":1,"b":null,"c":{"d":null}}'::jsonb);
-- {"a": 1, "c": {}}
\`\`\`

> \`\`jsonb_set\`\` 的 path 必须指向"已存在的容器"，否则不会创建中间对象。\`jsonb_set('{"a":{}}'::jsonb, '{a,b}', '1', true)\` 会成功，但 \`jsonb_set('{}'::jsonb, '{a,b}', '1', true)\` 不会自动建出 a 对象——这是常见踩坑点。

## 19.5 包含与存在操作符：@>、<@、?、?|、?&

jsonb 有一组"包含性"操作符，是 jsonb 区别于 json 的核心能力，也是 GIN 索引能加速的对象：

| 操作符 | 含义 |
| --- | --- |
| \`\`@>\`\` | 左侧是否**包含**右侧（右侧是左侧的子集） |
| \`\`<@\`\` | 左侧是否被右侧包含 |
| \`\`?\`\` | 是否存在某个顶层键 / 数组元素 |
| \`\`?|\`\` | 是否存在任一给定键（OR） |
| \`\`?&\`\` | 是否同时存在所有给定键（AND） |
| \`\`@\@\`\` | 全文检索相关（tsvector 用，见第 21 章） |

\`\`\`sql
-- @>：包含子对象
SELECT * FROM users WHERE info @> '{"city":"北京"}';
-- 所有 info 中 city=北京 的行

-- @> 检查数组包含
SELECT * FROM users WHERE info->'tags' @> '"vip"';
-- info.tags 数组中包含 "vip" 的行

-- ?：是否存在键
SELECT * FROM users WHERE info ? 'addr';
-- 只有 info 顶层有 addr 键的行（Bob）

-- ?|：存在任一键
SELECT * FROM users WHERE info ?| array['addr','tags'];

-- ?&：同时存在所有键
SELECT * FROM users WHERE info ?& array['age','city'];
\`\`\`

> \`\`@>\`\` 是性能关键：它能被 GIN 索引高效利用，而 \`\`->>'city'='北京'\`\` 这种"取值再比较"的写法通常无法走索引。能写 \`\`@>\`\` 就别写 \`\`->> =\`\`。

## 19.6 GIN 索引加速 JSONB 查询

jsonb 上最常用的是 **GIN 索引**（Generalized Inverted Index，倒排索引），特别适合"包含"类查询。

\`\`\`sql
-- 建一个覆盖整个 jsonb 的 GIN 索引
CREATE INDEX idx_users_info ON users USING GIN (info);

-- 之后这些查询都能走索引
SELECT * FROM users WHERE info @> '{"city":"北京"}';
SELECT * FROM users WHERE info ? 'addr';
SELECT * FROM users WHERE info ?| array['addr','tags'];
\`\`\`

**jsonb_path_ops：更小更快的 GIN 变体**

\`\`\`sql
-- 默认 GIN(opclass) 支持 @> ? ?| ?&，但索引较大
-- jsonb_path_ops 只支持 @>，但索引更小、对 @> 查询更快
CREATE INDEX idx_users_info_path ON users USING GIN (info jsonb_path_ops);

-- 这个索引只加速 @> 查询
SELECT * FROM users WHERE info @> '{"city":"北京"}';
\`\`\`

| 索引类型 | 支持操作符 | 索引体积 | 适用 |
| --- | --- | --- | --- |
| GIN（默认） | @> <@ ? ?\| ?& | 较大 | 需要多种查询 |
| GIN jsonb_path_ops | 仅 @> | 小 | 只做包含查询 |

**表达式索引**：只对某个常用字段建索引，省空间

\`\`\`sql
-- 只为 city 字段建索引
CREATE INDEX idx_users_city ON users ((info->>'city'));

-- 这个查询会走表达式索引
SELECT * FROM users WHERE info->>'city' = '北京';
\`\`\`

> 表达式索引 \`\`((info->>'city'))\`\` 的双括号不能省：外层括号是表达式索引语法要求，内层是函数调用。

## 19.7 嵌套 JSON 查询实战

实际业务中 JSON 常是多层嵌套，例如商品有规格、规格有属性。

\`\`\`sql
CREATE TABLE products (
  id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name  TEXT,
  spec  JSONB
);

INSERT INTO products (name, spec) VALUES
  ('手机', '{"brand":"X牌", "price":2999, "attrs":{"color":"黑","ram":8}, "tags":["5G","旗舰"]}'),
  ('平板', '{"brand":"Y牌", "price":1999, "attrs":{"color":"银","ram":6}, "tags":["轻薄"]}'),
  ('耳机', '{"brand":"X牌", "price":399,  "attrs":{"color":"白"}, "tags":["无线","降噪"]}');
\`\`\`

\`\`\`sql
-- 1. 找 X 牌且价格低于 2000 的商品
SELECT name, spec->>'price' AS price
FROM products
WHERE spec @> '{"brand":"X牌"}'
  AND (spec->>'price')::int < 2000;

-- 2. 找颜色为黑色的商品（嵌套路径）
SELECT name FROM products WHERE spec #>> '{attrs,color}' = '黑';

-- 3. 找带 "5G" 标签的商品
SELECT name FROM products WHERE spec->'tags' @> '"5G"';

-- 4. 聚合：按品牌统计商品，输出 JSON
SELECT
  spec->>'brand' AS brand,
  jsonb_agg(jsonb_build_object('name', name, 'price', (spec->>'price')::int)) AS goods
FROM products
GROUP BY spec->>'brand';
\`\`\`

**给 spec 建 GIN 索引后，第 1、3 个查询直接走索引**：

\`\`\`sql
CREATE INDEX idx_products_spec ON products USING GIN (spec);
\`\`\`

## 19.8 JSONB vs 独立列：何时使用

很多人一看到 jsonb 就把所有字段塞进去，这是错的。决策原则：

| 用 jsonb 的场景 | 用独立列的场景 |
| --- | --- |
| 字段经常增减（schema 不稳定） | 字段固定、需要强类型约束 |
| 半结构化、每行字段不同 | 需要在 WHERE/ORDER BY 高频使用 |
| 整体读写、很少按单字段查 | 需要外键、CHECK、唯一约束 |
| 配置项、扩展属性 | 高并发更新的余额、库存等 |

\`\`\`sql
-- 推荐：核心字段独立列 + 扩展属性 jsonb
CREATE TABLE orders (
  id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id   BIGINT NOT NULL,            -- 高频查询/连接，独立列
  amount    NUMERIC(10,2) NOT NULL,     -- 需要数值运算，独立列
  status    SMALLINT NOT NULL,          -- 枚举，独立列
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  extra     JSONB NOT NULL DEFAULT '{}' -- 优惠券、备注、来源等扩展信息
);

-- extra 里放不稳定字段
INSERT INTO orders (user_id, amount, status, extra)
VALUES (1, 99.9, 0, '{"coupon":"NEW10","channel":"app","note":"加急"}');
\`\`\`

> 经验法则：**"会不会出现在 WHERE/JOIN/ORDER BY 里"**——会，就独立成列；不会，再丢进 jsonb。

## 19.9 性能建议与常见坑

1. **优先 jsonb**：查询、比较、索引都优于 json。
2. **优先 @> 而非 ->> =**：前者可走 GIN，后者要全表扫描或表达式索引。
3. **大 JSON 不要频繁局部更新**：jsonb 是"整体替换"，\`jsonb_set\` 会重写整列，大文档高频更新代价高。
4. **避免在 jsonb 里存大文本/二进制**：考虑单独表 + 外部存储。
5. **不要用 jsonb 替代关联表**：多对多关系还是用中间表，jsonb 数组难以维护引用完整性。
6. **注意 NULL 语义**：\`info->'notexist'\` 返回 SQL NULL；\`info ? 'notexist'\` 返回 false。
7. **jsonb 顺序敏感**：\`@> '{"a":1,"b":2}'\`\` 与 \`@> '{"b":2,"a":1}'\`\` 等价（jsonb 内部已排序），不用担心键顺序。

\`\`\`sql
-- 演示 NULL 语义
SELECT info->'notexist' IS NULL FROM users WHERE name='Carol'; -- true
SELECT info ? 'notexist'        FROM users WHERE name='Carol'; -- false
\`\`\`

## 19.10 本章小结

- **json vs jsonb**：json 原样存文本，jsonb 解析成二进制；生产用 jsonb。
- **取值操作符**：\`->\` 返回 jsonb，\`->>\` 返回 text，\`#>\`/\`#>>\` 按路径取值。
- **构建/修改**：\`jsonb_build_object\`、\`jsonb_agg\`、\`jsonb_set\`、\`-\` 删除。
- **包含操作符**：\`@>\`（子集）、\`?\`/\`?|\`/\`?&\`（键存在），是 GIN 索引的目标。
- **GIN 索引**：默认 GIN 支持全部操作符，\`jsonb_path_ops\` 仅支持 \`@>\` 但更小更快。
- **设计原则**：核心字段独立列，扩展属性放 jsonb；能用 \`@>\` 就别用 \`->> =\`。

> JSONB 是 PG 的杀手锏，但它不是"万能存储"。把它当作"灵活的扩展字段"而非"替代关系模型"，才能发挥最大价值。下一章我们看另一个 PG 特色——数组类型。`
  },
  {
    id: "pg-ch20",
    group: "第四部分 PG 特色功能",
    icon: "🗂️",
    title: "第 20 章 数组类型",
    content: `# 第 20 章 数组类型

大多数关系数据库没有"真正的数组类型"，要么用逗号分隔字符串凑合，要么必须拆成关联表。PostgreSQL 原生支持**数组类型**——任何基础类型都可以变成数组，还能用 GIN 索引加速。数组类型非常适合"标签""多角色""多附件"这类少量、不需引用完整性的场景。本章全面讲解数组类型。

## 20.1 数组类型声明

PG 中任何基础类型都可以加 \`[]\` 变成数组：

\`\`\`sql
-- 方式 1：列定义时加 []
CREATE TABLE posts (
  id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title   TEXT NOT NULL,
  tags    TEXT[],                  -- 文本数组
  scores  INT[],                   -- 整数数组
  related BIGINT[]                 -- bigint 数组
);

-- 方式 2：用 CREATE TYPE 命名（适合复用）
CREATE TYPE text_array AS TEXT[];
\`\`\`

**多维数组**也支持，但实际中很少用：

\`\`\`sql
CREATE TABLE matrix (
  id    INT PRIMARY KEY,
  grid  INT[][]       -- 二维整数数组
);
\`\`\`

> 数组是无界的——不需要声明长度。和 MySQL 的 \`SET\`/\`ENUM\` 完全不同，PG 数组可以装任意个元素。

## 20.2 数组字面量与插入

数组字面量用花括号 \`{}\` 包裹，元素用逗号分隔，**字符串元素无需引号**（除非含特殊字符）：

\`\`\`sql
INSERT INTO posts (title, tags, scores) VALUES
  ('PG 入门', '{postgres,数据库,入门}', '{5,4,5}'),
  ('PG 进阶', '{postgres,jsonb,索引}', '{5,5}'),
  ('MySQL 对比', '{mysql,postgres}', '{4}');

-- 字符串数组也可以用 ARRAY 构造器，更直观
INSERT INTO posts (title, tags) VALUES
  ('数组用法', ARRAY['postgres','array','进阶']);

-- 查询
SELECT title, tags FROM posts;
\`\`\`

**含特殊字符时要加双引号**：

\`\`\`sql
INSERT INTO posts (title, tags) VALUES
  ('带空格标签', '{"含 空格","带,逗号","含\\"引号"}');
\`\`\`

> 推荐用 \`ARRAY[...]\` 构造器，少踩字符串转义的坑。

## 20.3 数组索引（1-based）

**PG 数组下标从 1 开始**，不是 0！这是从 C 之外的很多传统延续，也是新手最常踩的坑。

\`\`\`sql
SELECT tags[1] FROM posts WHERE id = 1; -- 'postgres'（第一个元素）
SELECT tags[2] FROM posts WHERE id = 1; -- '数据库'
SELECT tags[3] FROM posts WHERE id = 1; -- '入门'

-- 越界访问返回 NULL，不报错
SELECT tags[10] FROM posts WHERE id = 1; -- NULL
\`\`\`

**修改单个元素**：

\`\`\`sql
UPDATE posts SET tags[1] = 'PostgreSQL' WHERE id = 1;
\`\`\`

**用下标扩展数组**（PG 会自动填充中间为 NULL）：

\`\`\`sql
UPDATE posts SET tags[5] = '新增' WHERE id = 1;
SELECT tags FROM posts WHERE id = 1;
-- {PostgreSQL,数据库,入门,NULL,新增}
\`\`\`

**获取数组下标范围**：

\`\`\`sql
SELECT array_lower(tags, 1), array_upper(tags, 1) FROM posts WHERE id = 1;
-- 1   5
\`\`\`

## 20.4 数组操作符：&&、@>、<@、=

数组有一组专用操作符：

| 操作符 | 含义 |
| --- | --- |
| \`\`=\`\` | 两个数组完全相等（元素与顺序都相同） |
| \`\`<>\`\` | 不相等 |
| \`\`&&\`\` | 是否有**交集**（至少一个共同元素） |
| \`\`@>\`\` | 左侧**包含**右侧（右侧是左侧子集） |
| \`\`<@\`\` | 左侧被右侧包含 |
| \`\`||\`\` | 数组**拼接** |

\`\`\`sql
-- &&：有交集（找带 'postgres' 标签的文章）
SELECT title FROM posts WHERE tags && ARRAY['postgres'];

-- @>：包含（tags 里同时包含 postgres 和 jsonb）
SELECT title FROM posts WHERE tags @> ARRAY['postgres','jsonb'];

-- <@：被包含
SELECT ARRAY['postgres'] <@ ARRAY['postgres','mysql']; -- true

-- ||：拼接
SELECT ARRAY[1,2] || ARRAY[3,4];        -- {1,2,3,4}
SELECT ARRAY[1,2] || 3;                  -- {1,2,3}
SELECT 0 || ARRAY[1,2];                  -- {0,1,2}
\`\`\`

> **@> 比 && 更严格**：\`@>\` 要求右侧全部都在左侧；\`&&\` 只要有一个共同元素。两者都能被 GIN 索引加速。

## 20.5 数组函数：unnest、array_agg、array_length 等

PG 提供丰富的数组函数，最常用的几个：

| 函数 | 作用 |
| --- | --- |
| \`\`array_length(arr, dim)\`\` | 返回指定维度的长度 |
| \`\`cardinality(arr)\`\` | 返回数组总元素数（含 NULL） |
| \`\`unnest(arr)\`\` | 把数组**展开为多行**（行转列） |
| \`\`array_agg(expr)\`\` | 把多行**聚合为数组**（列转行，unnest 的逆操作） |
| \`\`array_append(arr, el)\`\` | 末尾追加 |
| \`\`array_prepend(el, arr)\`\` | 头部插入 |
| \`\`array_remove(arr, el)\`\` | 删除所有等于 el 的元素 |
| \`\`array_replace(arr, old, new)\`\` | 替换元素 |
| \`\`array_position(arr, el)\`\` | 返回元素首次出现的下标 |
| \`\`array_positions(arr, el)\`\` | 返回所有匹配下标（数组） |

\`\`\`sql
-- 长度
SELECT array_length(tags, 1) FROM posts WHERE id = 1;
SELECT cardinality(ARRAY[1,2,NULL,4]); -- 4

-- unnest：展开标签，每行一个
SELECT title, unnest(tags) AS tag FROM posts;
-- PG 入门    postgres
-- PG 入门    数据库
-- PG 入门    入门
-- ...

-- array_agg：把分组里的标签聚合回数组
SELECT title, array_agg(tag) FROM (
  SELECT title, unnest(tags) AS tag FROM posts
) t GROUP BY title;

-- 追加/删除/替换
SELECT array_append(ARRAY[1,2], 3);          -- {1,2,3}
SELECT array_prepend(0, ARRAY[1,2]);         -- {0,1,2}
SELECT array_remove(ARRAY[1,2,3,2], 2);      -- {1,3}
SELECT array_replace(ARRAY[1,2,3,2], 2, 9);  -- {1,9,3,9}
SELECT array_position(ARRAY['a','b','c'], 'b'); -- 2
\`\`\`

**经典用法：unnest + array_agg 去重排序**

\`\`\`sql
-- 给每篇文章的标签去重并排序
SELECT title, array_agg(DISTINCT tag ORDER BY tag) AS sorted_tags
FROM (
  SELECT title, unnest(tags) AS tag FROM posts
) t GROUP BY title;
\`\`\`

## 20.6 array_to_string 与 string_to_array

数组与字符串的互转：

\`\`\`sql
-- array_to_string(数组, 分隔符, [NULL 替换符])
SELECT array_to_string(ARRAY['a','b','c'], ',');        -- a,b,c
SELECT array_to_string(ARRAY['a',NULL,'c'], ',', '_');  -- a,_,c

-- string_to_array(字符串, 分隔符)
SELECT string_to_array('a,b,c', ',');   -- {a,b,c}
SELECT string_to_array('a||b||c', '||');-- {a,b,c}
\`\`\`

实战：把"逗号分隔的旧数据"清洗成数组列。

\`\`\`sql
-- 假设旧表 old_posts 有 tags_str 字段 'postgres,数据库'
UPDATE posts p
SET tags = string_to_array(o.tags_str, ',')
FROM old_posts o
WHERE p.id = o.id;
\`\`\`

## 20.7 GIN 索引加速数组查询

数组类型同样能用 GIN 索引，加速 \`@>\`、\`<@\`、\`&&\` 查询：

\`\`\`sql
-- 给 tags 建数组 GIN 索引
CREATE INDEX idx_posts_tags ON posts USING GIN (tags);

-- 以下查询都会走索引
SELECT title FROM posts WHERE tags @> ARRAY['postgres'];
SELECT title FROM posts WHERE tags && ARRAY['postgres','jsonb'];
\`\`\`

对比有无索引的差别——当 \`posts\` 表很大时，\`@>\` 查询从全表扫描变成索引扫描：

\`\`\`sql
EXPLAIN SELECT title FROM posts WHERE tags @> ARRAY['jsonb'];
-- 有索引：Bitmap Index Scan on idx_posts_tags
-- 无索引：Seq Scan on posts
\`\`\`

> 数组 GIN 索引对"包含任意一个"（\`&&\`）和"包含全部"（\`@>\`）都有效，这是 PG 数组相比"逗号分隔字符串"最大的优势。

## 20.8 实战：标签系统

用一个完整例子演示数组在标签系统中的用法。

\`\`\`sql
CREATE TABLE articles (
  id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title   TEXT NOT NULL,
  tags    TEXT[] NOT NULL DEFAULT '{}',
  published_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO articles (title, tags) VALUES
  ('PG 索引指南',   ARRAY['postgres','索引','性能']),
  ('PG JSONB 实战', ARRAY['postgres','jsonb']),
  ('MySQL 调优',    ARRAY['mysql','性能']),
  ('PG 备份方案',   ARRAY['postgres','运维','备份']);

-- 1. 找所有 postgres 标签文章
SELECT title FROM articles WHERE tags @> ARRAY['postgres'];

-- 2. 找同时带 postgres 和 性能 标签
SELECT title FROM articles WHERE tags @> ARRAY['postgres','性能'];

-- 3. 找带 postgres 或 mysql 标签
SELECT title FROM articles WHERE tags && ARRAY['postgres','mysql'];

-- 4. 统计每个标签出现次数（unnest + 聚合）
SELECT tag, COUNT(*) AS cnt
FROM articles, unnest(tags) AS tag
GROUP BY tag
ORDER BY cnt DESC, tag;
-- postgres 3
-- 性能     2
-- jsonb    1
-- ...

-- 5. 给文章追加标签
UPDATE articles SET tags = tags || '进阶' WHERE id = 1;

-- 6. 删除某个标签
UPDATE articles SET tags = array_remove(tags, '运维') WHERE id = 4;
\`\`\`

\`\`\`sql
-- 给 tags 建 GIN 索引，让 1/2/3 查询都飞起来
CREATE INDEX idx_articles_tags ON articles USING GIN (tags);
\`\`\`

> 注意第 4 个查询的写法 \`FROM articles, unnest(tags) AS tag\`——这是 PG 特有的"隐式 lateral"，把每行数组展开成多行参与聚合，非常实用。

## 20.9 常见坑

1. **下标从 1 开始**：从 0 取会得到 NULL，\`tags[0]\` 不是第一个元素。
2. **NULL 与空数组不同**：\`NULL\` 表示"未知"，\`'{}'\` 表示"空集合"。统计数量时 \`array_length(NULL,1)\` 是 NULL，\`cardinality('{}')\` 是 0。
3. **= 比较要求顺序一致**：\`ARRAY[1,2] = ARRAY[2,1]\` 是 false。要"无序相等"用排序后比较。
4. **不要用数组存大量元素**：上千元素的数组维护成本高，应拆成关联表。
5. **不要用数组做外键**：数组元素无法引用完整性约束，多对多还是用中间表。
6. **字符串数组字面量易踩坑**：含逗号、空格、引号时容易写错，优先用 \`ARRAY[]\`。

\`\`\`sql
-- 演示 NULL 与空数组差异
SELECT array_length(NULL::int[], 1);   -- NULL
SELECT cardinality('{}'::int[]);       -- 0

-- 无序相等：先排序再比
SELECT array_sort(ARRAY[2,1]) = array_sort(ARRAY[1,2]); -- 需要 PG 13+ 的 array_sort？实际用 unnest+order
\`\`\`

## 20.10 本章小结

- **声明**：基础类型加 \`[]\` 即数组，无界长度。
- **字面量**：\`'{a,b,c}'\` 或 \`ARRAY['a','b','c']\`，推荐后者。
- **下标**：**1-based**，越界返回 NULL。
- **操作符**：\`@>\` 包含、\`&&\` 交集、\`||\` 拼接、\`=\` 有序相等。
- **函数**：\`unnest\` 展开、\`array_agg\` 聚合、\`array_append/remove/replace\` 编辑、\`array_to_string/string_to_array\` 互转。
- **GIN 索引**：加速 \`@>\`/\`&&\`，是数组可用的关键。
- **适用场景**：标签、多角色等少量元素、无需引用完整性；大量数据用关联表。

> 数组是 PG"轻量级多值"的优雅方案，介于"逗号字符串"和"关联表"之间。用对了事半功倍，用错了（当关联表用）会埋下维护噩梦。下一章我们看 PG 的另一个重头戏——全文检索。`
  },
  {
    id: "pg-ch21",
    group: "第四部分 PG 特色功能",
    icon: "🔍",
    title: "第 21 章 全文检索",
    content: `# 第 21 章 全文检索

在数据库里做"搜索框"是常见需求：用户输入关键词，系统返回匹配的文章/商品。LIKE 做 fuzzy 查询又慢又弱（无法分词、无法排序），而专门的搜索引擎（Elasticsearch）引入成本高。PostgreSQL 内置**全文检索（Full Text Search）**，支持分词、权重、相关性排序、高亮，配合 GIN 索引能达到不错的搜索体验。本章系统讲解。

## 21.1 全文检索概述

全文检索的核心思想：把"自然语言文本"转换成"可比较的词向量"，再做匹配。

三个关键概念：

| 概念 | 类型 | 说明 |
| --- | --- | --- |
| **文档（document）** | text | 原始文本，可能是多个字段拼接 |
| **词向量（tsvector）** | tsvector | 分词 + 去停用词 + 词干化后的"词:位置"列表 |
| **查询（tsquery）** | tsquery | 由词和布尔运算（& \| ! <->）组成的查询表达式 |

\`\`\`sql
-- to_tsvector：把文本转成词向量
SELECT to_tsvector('english', 'The quick brown fox jumps over the lazy dog');
-- 'brown':3 'dog':9 'fox':4 'jumps':5 'lazy':8 'quick':2

-- to_tsquery：构造查询
SELECT to_tsquery('english', 'fox & dog');
-- 'fox' & 'dog'

-- @@：匹配操作符
SELECT to_tsvector('english', 'The quick brown fox') @@ to_tsquery('english', 'fox');
-- true
\`\`\`

> 注意停用词（the/a/is 等）被过滤了，这正是全文检索比 LIKE 强的地方。

## 21.2 tsvector 与 tsquery

**tsvector** 是"词:位置"的有序列表：

\`\`\`sql
SELECT to_tsvector('english', 'a cat sat on a mat, the cat was fat');
-- 'cat':2,7 'fat':9 'mat':6 'sat':3
-- cat 出现在位置 2 和 7
\`\`\`

**tsquery** 支持布尔运算：

| 运算符 | 含义 | 示例 |
| --- | --- | --- |
| \`\`&\`\` | AND（同时出现） | \`foo & bar\` |
| \`\`|\`\` | OR（任一出现） | \`foo | bar\` |
| \`\`!\`\` | NOT（不出现） | \`!foo\` |
| \`\`<->\`\` | 相邻（紧挨着，距离 1） | \`foo <-> bar\` |
| \`\`<N>\`\` | 距离为 N 的相邻 | \`foo <2> bar\` |

\`\`\`sql
-- AND
SELECT to_tsvector('a b c') @@ to_tsquery('b & c'); -- true
-- OR
SELECT to_tsvector('a b c') @@ to_tsquery('x | b'); -- true
-- NOT
SELECT to_tsvector('a b c') @@ to_tsquery('b & !a'); -- false
-- 相邻（短语）
SELECT to_tsvector('the quick brown fox') @@ to_tsquery('quick <-> brown'); -- true
SELECT to_tsvector('the brown quick fox') @@ to_tsquery('quick <-> brown'); -- false（顺序不对）
\`\`\`

## 21.3 构造 tsvector 与 tsquery 的函数

四个构造函数：

| 函数 | 输入 | 特点 |
| --- | --- | --- |
| \`\`to_tsvector(config, text)\`\` | 自然语言文本 | 分词 + 去停用词 + 词干化 |
| \`\`to_tsquery(config, text)\`\` | 带运算符的查询串 | 需自己写 \`&\`/\`|\`，支持运算符 |
| \`\`plainto_tsquery(config, text)\`\` | 纯自然语言 | 自动 AND 连接所有词，最常用 |
| \`\`phraseto_tsquery(config, text)\`\` | 纯自然语言 | 自动按短语（相邻）连接 |
| \`\`websearch_to_tsquery(config, text)\`\` | 搜索引擎语法 | 支持 "引号短语" -排除 OR |

\`\`\`sql
-- to_tsquery：需手写运算符
SELECT to_tsquery('english', 'fox & (dog | cat)');

-- plainto_tsquery：纯文本，自动 AND（最省心）
SELECT plainto_tsquery('english', 'fox dog');
-- 'fox' & 'dog'

-- phraseto_tsquery：短语（要求相邻）
SELECT phraseto_tsquery('english', 'brown fox');
-- 'brown' <-> 'fox'

-- websearch_to_tsquery：搜索引擎风格
SELECT websearch_to_tsquery('english', 'fox OR dog -cat "quick brown"');
-- 'fox' | 'dog' & !'cat' & 'quick' <-> 'brown'
\`\`\`

> 给"用户搜索框"用 \`plainto_tsquery\` 或 \`websearch_to_tsquery\` 最合适——用户不会写 \`&\`/\`|\`。

## 21.4 @@ 匹配操作符与查询

\`\`@@\`\` 是全文检索的核心操作符，tsvector @@ tsquery 返回 bool。

\`\`\`sql
CREATE TABLE docs (
  id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT,
  body  TEXT
);

INSERT INTO docs (title, body) VALUES
  ('PostgreSQL 索引', 'GIN 索引用于 jsonb 和全文检索'),
  ('MySQL 索引',     'B+ 树索引是最常见的索引结构'),
  ('数据库调优',     '索引和查询优化是数据库性能关键');

-- 拼接 title 和 body 作为一个文档
SELECT id, title
FROM docs
WHERE to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(body,''))
      @@ plainto_tsquery('simple', '索引 全文');
\`\`\`

> 这里用 \`'simple'\` 配置避免英文词干化干扰中文演示。中文需专门分词器，见 21.9 节。

## 21.5 ts_rank 与 ts_rank_cd 排序

匹配只是第一步，搜索还要按"相关性"排序。PG 提供两个排名函数：

| 函数 | 排序依据 |
| --- | --- |
| \`\`ts_rank(vector, query, [normalization])\`\` | 基于词频（匹配的词在文档中出现多少次） |
| \`\`ts_rank_cd(vector, query, [normalization])\`\` | 基于覆盖密度（匹配词是否聚集在一起） |

\`\`\`sql
SELECT
  id,
  title,
  ts_rank(
    to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(body,'')),
    plainto_tsquery('simple', '索引')
  ) AS rank
FROM docs
WHERE to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(body,''))
      @@ plainto_tsquery('simple', '索引')
ORDER BY rank DESC;
\`\`\`

**normalization 选项**（可相加组合）：

| 值 | 含义 |
| --- | --- |
| 1 | 除以文档长度（log） |
| 2 | 除以文档词数 |
| 4 | 除以匹配词之间的平均距离 |
| 8 | 除以文档中独立词数 |
| 16 | 除以匹配词数 |
| 32 | 除以 rank+1 |

\`\`\`sql
-- 用 2|8 归一化，让长短文档可比
SELECT ts_rank(vec, q, 2|8) ...
\`\`\`

## 21.6 setweight 权重

不同字段重要性不同（标题匹配 > 正文匹配）。可以用 \`setweight\` 给不同来源的词向量打权重（A/B/C/D 四档，A 最高）。

\`\`\`sql
-- 标题权重 A，正文权重 D
SELECT
  setweight(to_tsvector('simple', title), 'A') ||
  setweight(to_tsvector('simple', body),  'D') AS weighted_vec
FROM docs WHERE id = 1;
\`\`\`

**推荐做法：建一个"加权词向量"生成列**：

\`\`\`sql
CREATE TABLE articles (
  id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT,
  body  TEXT,
  tsv   TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(title,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(body,'')),  'D')
  ) STORED
);

CREATE INDEX idx_articles_tsv ON articles USING GIN (tsv);

-- 查询时用同一个 tsv 列
SELECT id, title,
  ts_rank(tsv, plainto_tsquery('simple', '索引')) AS rank
FROM articles
WHERE tsv @@ plainto_tsquery('simple', '索引')
ORDER BY rank DESC;
\`\`\`

> \`GENERATED ALWAYS AS ... STORED\` 是 PG 12+ 的"存储生成列"，写入时自动算好，查询时无需重算，且能直接建索引。这是全文检索的"标准姿势"。

## 21.7 GIN 与 GiST 索引

tsvector 上可建两种索引：

| 索引 | 特点 | 适用 |
| --- | --- | --- |
| **GIN** | 倒排索引，精确，查询快，更新慢 | **绝大多数场景首选** |
| **GiST** | 有损索引，查询需回表校验，更新快 | 数据频繁更新、可接受查询稍慢 |

\`\`\`sql
-- GIN 索引（推荐）
CREATE INDEX idx_articles_tsv ON articles USING GIN (tsv);

-- 也可直接对表达式建索引（不用生成列时）
CREATE INDEX idx_docs_tsv ON docs USING GIN (
  to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(body,''))
);
\`\`\`

> GIN 索引对大表更新有开销。批量写入后用 \`REINDEX\` 或调整 \`gin_pending_list_limit\` 可提升性能。

## 21.8 ts_headline 高亮

搜索结果常需要"高亮匹配片段"。\`ts_headline\` 自动截取并标记匹配词。

\`\`\`sql
SELECT
  id,
  ts_headline('simple', body, plainto_tsquery('simple', '索引'),
    'StartSel=<b>, StopSel=</b>, MaxWords=35, MinWords=15')
AS snippet
FROM docs
WHERE to_tsvector('simple', body) @@ plainto_tsquery('simple', '索引');
\`\`\`

输出示例：

\`\`\`
GIN <b>索引</b>用于 jsonb 和全文检索
\`\`\`

常用选项：

| 选项 | 含义 |
| --- | --- |
| \`StartSel\` / \`StopSel\` | 匹配词的包裹标签 |
| \`MaxWords\` / \`MinWords\` | 片段最大/最小词数 |
| \`ShortWord\` | 短于该长度的词不显示 |
| \`HighlightAll\` | 是否高亮整篇而非片段 |
| \`MaxFragments\` | 返回几个片段 |

## 21.9 中文分词配置（zhparser / pg_jieba）

PG 默认配置对中文不友好——它按空格分词，而中文没有空格。需要安装中文分词扩展：

**方案 1：zhparser**（基于 SCWS）

\`\`\`sql
-- 安装扩展（需先在系统装 scws 与 zhparser）
CREATE EXTENSION zhparser;

-- 创建中文全文检索配置
CREATE TEXT SEARCH CONFIGURATION zhcn (PARSER = zhparser);
ADD MAPPING FOR n,v,a,i,e,l WITH simple;

-- 测试分词
SELECT to_tsvector('zhcn', 'PostgreSQL 是最强大的开源关系数据库');
-- 'postgresql':1 '关系':6 '开源':5 '强大':3 '数据库':7 '是':2 '最':2
\`\`\`

**方案 2：pg_jieba**（基于结巴分词）

\`\`\`sql
CREATE EXTENSION pg_jieba;
CREATE TEXT SEARCH CONFIGURATION jiebacfg (PARSER = pg_jieba);
ADD MAPPING FOR n,v,a,i,e,l WITH simple;

SELECT to_tsvector('jiebacfg', '我爱北京天安门');
-- '北京':2 '天安门':3 '我':1
\`\`\`

**完整中文搜索示例**：

\`\`\`sql
CREATE TABLE news (
  id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT,
  body  TEXT,
  tsv   TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('zhcn', coalesce(title,'')), 'A') ||
    setweight(to_tsvector('zhcn', coalesce(body,'')),  'D')
  ) STORED
);

CREATE INDEX idx_news_tsv ON news USING GIN (tsv);

INSERT INTO news (title, body) VALUES
  ('PostgreSQL 发布新版本', '新版增强了 JSONB 和全文检索能力'),
  ('数据库性能优化', '索引优化和查询重写是关键');

-- 搜索"全文检索"
SELECT id, title,
  ts_rank(tsv, plainto_tsquery('zhcn', '全文检索')) AS rank,
  ts_headline('zhcn', body, plainto_tsquery('zhcn', '全文检索'),
    'StartSel=<em>, StopSel=</em>') AS snippet
FROM news
WHERE tsv @@ plainto_tsquery('zhcn', '全文检索')
ORDER BY rank DESC;
\`\`\`

> 中文分词质量直接决定搜索效果。结巴/SCWS 对专业术语、新词可能分不准，可自定义词典。若搜索是核心功能且数据量大，仍建议上 Elasticsearch。

## 21.10 本章小结

- **三要素**：tsvector（词向量）、tsquery（查询）、\`@@\`（匹配）。
- **构造函数**：\`to_tsvector\` 分词，\`plainto_tsquery\`/\`websearch_to_tsquery\` 适合用户输入。
- **排序**：\`ts_rank\`（词频）、\`ts_rank_cd\`（密度），配 normalization 归一化。
- **权重**：\`setweight\` A/B/C/D 区分字段重要性，配生成列 tsv。
- **索引**：**GIN 首选**，GiST 适合频繁更新。
- **高亮**：\`ts_headline\` 截取片段并标记。
- **中文**：需 \`zhparser\`/\`pg_jieba\` 扩展 + 自定义 TEXT SEARCH CONFIGURATION。

> PG 全文检索适合中小规模、不想引入额外组件的搜索场景。它让"搜索框"这种需求能在数据库里一站式解决，是 PG 的又一杀手锏。下一章我们看更"硬核"的特色——PostGIS 地理空间数据。`
  },
  {
    id: "pg-ch22",
    group: "第四部分 PG 特色功能",
    icon: "🌍",
    title: "第 22 章 地理空间数据 PostGIS",
    content: `# 第 22 章 地理空间数据 PostGIS

地图、外卖、打车、找房——所有"附近的人""范围内的店""两地距离"类需求，本质上都是**地理空间查询**。PostgreSQL 通过 PostGIS 扩展成为最强大的开源空间数据库，支持空间类型、空间索引、空间运算，甚至能直接处理 GeoJSON。本章带你从安装到实战掌握 PostGIS。

## 22.1 什么是 PostGIS

**PostGIS** 是 PostgreSQL 的空间数据库扩展，为 PG 添加了：

- **空间数据类型**：geometry、geography、raster
- **空间索引**：GiST、SP-GiST、BRIN
- **空间函数**：距离、包含、相交、缓冲区、坐标变换等数百个
- **空间运算**：联合、交集、差集
- **格式转换**：WKT/WKB/GeoJSON/KML/Shapefile

PostGIS 是 OGC（开放地理空间联盟）认证的实现，广泛用于 GIS 行业和互联网 LBS 业务。

## 22.2 安装与 CREATE EXTENSION

PostGIS 是扩展，需先在系统安装包，再在数据库里启用。

\`\`\`sql
-- 1. 系统层安装（Debian/Ubuntu）
-- sudo apt-get install postgresql-16-postgis-3

-- 2. 数据库层启用扩展（每个库只需一次）
CREATE EXTENSION postgis;
-- 如需地理编码、栅格等额外能力
CREATE EXTENSION postgis_topology;
CREATE EXTENSION postgis_raster;

-- 3. 验证安装
SELECT postgis_full_version();
-- POSTGIS="3.4.0" ...
\`\`\`

> 安装扩展需要超级用户或对应权限。\`CREATE EXTENSION\` 会在 \`public\` schema 下创建一批 \`geometry\`/\`geography\` 类型和函数。

## 22.3 geometry 与 geography 类型

两种空间类型，新手最易混淆：

| 类型 | 坐标系 | 计算方式 | 单位 | 性能 | 适用 |
| --- | --- | --- | --- | --- | --- |
| \`\`geometry\`\` | 平面坐标（笛卡尔） | 平面几何 | 与坐标系单位一致（度/米） | 快 | 投影坐标、小范围 |
| \`\`geography\`\` | 球面坐标（经纬度） | 球面几何 | 始终米 | 慢（需球面计算） | 全球范围、跨大区域 |

\`\`\`sql
-- geometry：平面，坐标单位通常是度（EPSG:4326）或米（投影坐标系）
CREATE TABLE shops (
  id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT,
  geom geometry(POINT, 4326)   -- 点，SRID=4326（WGS84 经纬度）
);

-- geography：球面，坐标是经纬度，距离单位米
CREATE TABLE shops_geo (
  id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT,
  geog geography(POINT, 4326)
);
\`\`\`

**SRID（Spatial Reference ID）** 标识坐标系，最常用：

- **4326**：WGS84 经纬度（GPS 用的就是这个，最常见）
- **3857**：Web Mercator（谷歌/高德地图瓦片用的投影，单位米）

> 选择建议：业务跨大区域（国家级）用 \`geography\`，距离计算结果直接是米；小范围城市内可统一用投影坐标系 \`geometry\` 性能更好。

## 22.4 POINT、LINESTRING、POLYGON

三种最常用的几何体：

\`\`\`sql
-- 点 POINT
SELECT ST_GeomFromText('POINT(116.40 39.90)', 4326);  -- 北京天安门附近
-- 更简洁的构造函数
SELECT ST_SetSRID(ST_MakePoint(116.40, 39.90), 4326);

-- 线 LINESTRING
SELECT ST_GeomFromText('LINESTRING(116.40 39.90, 116.41 39.91, 116.42 39.92)', 4326);

-- 多边形 POLYGON（首尾必须闭合）
SELECT ST_GeomFromText('POLYGON((116.40 39.90, 116.42 39.90, 116.42 39.92, 116.40 39.92, 116.40 39.90))', 4326);
\`\`\`

**WKT（Well-Known Text）** 是空间数据的文本表示格式，常用前缀：

| WKT | 含义 |
| --- | --- |
| \`POINT(x y)\` | 点 |
| \`LINESTRING(x1 y1, x2 y2, ...)\` | 线 |
| \`POLYGON((x1 y1, ...))\` | 多边形 |
| \`MULTIPOINT(...)\` | 多点 |
| \`MULTIPOLYGON(...)\` | 多多边形 |

\`\`\`sql
-- 建表插入数据
INSERT INTO shops (name, geom) VALUES
  ('门店A', ST_SetSRID(ST_MakePoint(116.40, 39.90), 4326)),
  ('门店B', ST_SetSRID(ST_MakePoint(116.45, 39.92), 4326)),
  ('门店C', ST_SetSRID(ST_MakePoint(116.50, 39.95), 4326));

SELECT name, ST_AsText(geom) FROM shops;
-- 门店A  POINT(116.4 39.9)
\`\`\`

## 22.5 常用空间函数

PostGIS 有几百个函数，最常用的几个：

| 函数 | 作用 |
| --- | --- |
| \`\`ST_Distance(a, b)\`\` | 两几何体距离（geometry 单位与 SRID 一致，geography 单位米） |
| \`\`ST_DWithin(a, b, dist)\`\` | a 与 b 距离是否在 dist 内（**比 Distance < 快**，能用索引） |
| \`\`ST_Within(a, b)\`\` | a 是否在 b 内部 |
| \`\`ST_Contains(a, b)\`\` | a 是否包含 b（与 Within 相反） |
| \`\`ST_Intersects(a, b)\`\` | a 与 b 是否相交 |
| \`\`ST_Area(geom)\`\` | 面积 |
| \`\`ST_Length(geom)\`\` | 长度 |
| \`\`ST_Buffer(geom, dist)\`\` | 缓冲区 |
| \`\`ST_Transform(geom, srid)\`\` | 坐标系变换 |

\`\`\`sql
-- 距离：geography 直接返回米
SELECT ST_Distance(
  'POINT(116.40 39.90)'::geography,
  'POINT(116.45 39.92)'::geography
); -- 约 4926 米

-- geometry 用 4326 会返回"度"，需转换坐标系才得米
SELECT ST_Distance(
  ST_Transform('SRID=4326;POINT(116.40 39.90)'::geometry, 3857),
  ST_Transform('SRID=4326;POINT(116.45 39.92)'::geometry, 3857)
); -- 约 5500 米（Web Mercator 有畸变）

-- ST_Within：点是否在多边形内
SELECT ST_Within(
  'SRID=4326;POINT(116.41 39.91)'::geometry,
  'SRID=4326;POLYGON((116.40 39.90, 116.42 39.90, 116.42 39.92, 116.40 39.92, 116.40 39.90))'::geometry
); -- true

-- ST_Contains：多边形是否包含点
SELECT ST_Contains(
  'SRID=4326;POLYGON((116.40 39.90, 116.42 39.90, 116.42 39.92, 116.40 39.92, 116.40 39.90))'::geometry,
  'SRID=4326;POINT(116.41 39.91)'::geometry
); -- true
\`\`\`

> **ST_DWithin 是"附近搜索"的核心函数**：它能在 GiST 索引上加速，而 \`ST_Distance(a,b) < 1000\` 这种写法通常无法用索引。

## 22.6 GiST 空间索引

空间数据必须建 **GiST 索引**才能高效查询：

\`\`\`sql
-- 给 geom 列建 GiST 索引
CREATE INDEX idx_shops_geom ON shops USING GIST (geom);

-- geography 同理
CREATE INDEX idx_shops_geog ON shops_geo USING GIST (geog);
\`\`\`

对比有无索引：

\`\`\`sql
-- 找 5 公里内的店（用 ST_DWithin，能走索引）
EXPLAIN SELECT name FROM shops
WHERE ST_DWithin(geom, ST_SetSRID(ST_MakePoint(116.40, 39.90), 4326), 0.05);
-- 有索引：Bitmap Index Scan on idx_shops_geom
-- 无索引：Seq Scan on shops（全表扫描 + 逐行计算）
\`\`\`

> 注意 geometry 的 \`ST_DWithin\` 距离单位是"坐标系单位"。4326 是度，1 度约 111 公里，所以 5 公里 ≈ 0.045 度。为避免混淆，"附近 N 米"需求**优先用 geography**，距离直接写米。

## 22.7 实战：查找附近地点

完整实现一个"附近 3 公里内的店，按距离排序"的查询。

\`\`\`sql
-- 用 geography 类型，距离单位米
CREATE TABLE places (
  id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name  TEXT NOT NULL,
  geog  geography(POINT, 4326) NOT NULL
);

CREATE INDEX idx_places_geog ON places USING GIST (geog);

INSERT INTO places (name, geog) VALUES
  ('咖啡馆A', ST_SetSRID(ST_MakePoint(116.400, 39.900), 4326)::geography),
  ('咖啡馆B', ST_SetSRID(ST_MakePoint(116.410, 39.905), 4326)::geography),
  ('餐厅C',   ST_SetSRID(ST_MakePoint(116.500, 39.950), 4326)::geography);

-- 用户当前位置
-- 附近 3 公里内，按距离升序
SELECT
  name,
  round(ST_Distance(geog, ST_SetSRID(ST_MakePoint(116.400, 39.900), 4326)::geography)) AS dist_m
FROM places
WHERE ST_DWithin(geog, ST_SetSRID(ST_MakePoint(116.400, 39.900), 4326)::geography, 3000)
ORDER BY geog <-> ST_SetSRID(ST_MakePoint(116.400, 39.900), 4326)::geography;
\`\`\`

**关键点**：

1. \`ST_DWithin\` 用 GiST 索引快速筛出候选集。
2. \`<->\` 是"距离排序"操作符（KNN），也能用 GiST 索引，比 \`ORDER BY ST_Distance(...)\` 更快。
3. 距离结果用 \`ST_Distance\` 单独算一次返回给前端。

**范围内查询**（找某多边形内的店）：

\`\`\`sql
-- 给定一个边界框（多边形），找落在其中的店
SELECT name FROM places
WHERE ST_Within(
  geog::geometry,
  ST_GeomFromText('POLYGON((116.39 39.89, 116.42 39.89, 116.42 39.92, 116.39 39.92, 116.39 39.89))', 4326)
);
\`\`\`

## 22.8 GeoJSON 转换 ST_AsGeoJSON

Web 地图（Leaflet、Mapbox）和接口普遍用 **GeoJSON** 交换数据。PostGIS 提供双向转换：

\`\`\`sql
-- 几何体 → GeoJSON 文本
SELECT ST_AsGeoJSON(geom) FROM shops WHERE id = 1;
-- {"type":"Point","coordinates":[116.4,39.9]}

-- GeoJSON → geometry
SELECT ST_GeomFromGeoJSON('{"type":"Point","coordinates":[116.4,39.9]}');

-- 完整 Feature 输出（带属性）
SELECT jsonb_build_object(
  'type', 'Feature',
  'geometry', ST_AsGeoJSON(geom)::jsonb,
  'properties', jsonb_build_object('name', name)
) AS feature
FROM shops;
\`\`\`

**用 GeoJSON 直接插入**：

\`\`\`sql
INSERT INTO shops (name, geom)
SELECT '门店D', ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Point","coordinates":[116.48,39.94]}'), 4326);
\`\`\`

> 接口对接地图前端时，\`ST_AsGeoJSON\` 配合 \`jsonb_build_object\` 能直接产出前端可用的 GeoJSON Feature，省去后端拼装。

## 22.9 常见坑与建议

1. **SRID 不一致会报错**：两个 geometry 运算时 SRID 必须相同，否则报错。插入时务必 \`ST_SetSRID\`。
2. **geometry 距离单位易错**：4326 是度不是米，跨大区域用 geography 或先 \`ST_Transform\` 到投影坐标系。
3. **ST_Distance < N 不走索引**：附近搜索用 \`ST_DWithin\` + GiST，排序用 \`<->\`。
4. **geometry 与 geography 互转**：\`geom::geography\` / \`geog::geometry\`，但 SRID 必须是 4326。
5. **大量数据先建索引再导入**：或导入后 \`ANALYZE\` 表让统计信息准确。
6. **缓冲区单位**：\`ST_Buffer\` 对 4326 geometry 单位是度，对 geography 单位是米，注意区分。

\`\`\`sql
-- SRID 不一致报错示例
SELECT ST_Distance(
  'SRID=4326;POINT(116 39)'::geometry,
  'POINT(117 40)'::geometry   -- 未设 SRID，默认 0
); -- ERROR: Operation on mixed SRIDs
\`\`\`

## 22.10 本章小结

- **PostGIS** 是 PG 的空间扩展，提供类型、索引、函数。
- **geometry vs geography**：平面快（单位随 SRID）、球面慢（单位米），全球范围用 geography。
- **几何体**：POINT/LINESTRING/POLYGON，WKT 文本表示。
- **核心函数**：\`ST_Distance\` 距离、\`ST_DWithin\` 在范围内（走索引）、\`ST_Within\`/\`ST_Contains\` 包含、\`ST_Intersects\` 相交。
- **GiST 索引**：空间查询必须建索引，附近搜索用 \`ST_DWithin\`，距离排序用 \`<->\`。
- **GeoJSON**：\`ST_AsGeoJSON\`/\`ST_GeomFromGeoJSON\` 与前端对接。

> PostGIS 让 PG 能直接支撑 LBS 业务，省去单独维护空间数据库的麻烦。它是 PG 生态里"专业级"扩展的典范。下一章我们看更轻量但很实用的类型系统——枚举与复合类型。`
  },
  {
    id: "pg-ch23",
    group: "第四部分 PG 特色功能",
    icon: "🏷️",
    title: "第 23 章 枚举类型与复合类型",
    content: `# 第 23 章 枚举类型与复合类型

业务里到处是"固定取值集合"的字段：订单状态、用户角色、性别……MySQL 用 ENUM，但只能列级定义、难以复用。PostgreSQL 提供 **CREATE TYPE** 创建可复用的枚举类型和复合类型，还支持带约束的 Domain 类型。本章讲解这些 PG 特色类型。

## 23.1 CREATE TYPE AS ENUM

枚举类型用 \`CREATE TYPE ... AS ENUM\` 定义，值是字符串字面量，按定义顺序排序：

\`\`\`sql
-- 定义订单状态枚举
CREATE TYPE order_status AS ENUM (
  'pending',    -- 待支付
  'paid',       -- 已支付
  'shipped',    -- 已发货
  'completed',  -- 已完成
  'cancelled'   -- 已取消
);

-- 在多张表复用
CREATE TABLE orders (
  id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  status order_status NOT NULL DEFAULT 'pending',
  amount NUMERIC(10,2)
);

CREATE TABLE order_logs (
  id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id  BIGINT NOT NULL,
  from_stat order_status,
  to_stat   order_status,
  changed_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO orders (amount) VALUES (99.9);  -- 默认 pending
INSERT INTO orders (status, amount) VALUES ('paid', 199.0);

-- 插入非法值会报错
INSERT INTO orders (status, amount) VALUES ('unknown', 1);
-- ERROR: invalid input value for enum order_status: "unknown"
\`\`\`

> 枚举类型在数据库层定义一次，多表复用，比 MySQL 的"每列 ENUM"更整洁，也避免了值不一致。

## 23.2 枚举的使用与排序

枚举值的排序**按定义顺序**，不是字母序：

\`\`\`sql
SELECT status FROM orders ORDER BY status;
-- pending → paid → shipped → completed → cancelled（按 ENUM 定义顺序）
\`\`\`

这与字符串排序完全不同：

\`\`\`sql
-- 字符串排序会是 cancelled, completed, paid, pending, shipped
-- 枚举排序是 pending, paid, shipped, completed, cancelled（业务流程顺序）
\`\`\`

**比较运算**：枚举支持 \`= <>\`，但不支持算术比较 \`< >\`（除了按枚举顺序的排序）。

\`\`\`sql
-- 相等比较
SELECT * FROM orders WHERE status = 'paid';

-- 范围比较需要显式列出或用枚举顺序
SELECT * FROM orders WHERE status < 'shipped';  -- pending, paid（定义在 shipped 之前的）
\`\`\`

**获取枚举所有值**：

\`\`\`sql
-- 查看枚举的所有取值及顺序
SELECT enumlabel, enumsortorder
FROM pg_enum
WHERE enumtypid = 'order_status'::regtype;
\`\`\`

## 23.3 添加与删除枚举值

**添加新值**（PG 10+）：

\`\`\`sql
-- 在末尾追加
ALTER TYPE order_status ADD VALUE 'refunded';

-- 指定位置（PG 12+ 支持在事务外）
ALTER TYPE order_status ADD VALUE 'processing' BEFORE 'shipped';
ALTER TYPE order_status ADD VALUE 'reviewing'  AFTER  'paid';
\`\`\`

> **重要限制**：\`ALTER TYPE ... ADD VALUE\` **不能在事务块中执行**（PG 12 之前完全不行，12+ 可用但值在事务提交后才可用）。迁移脚本要注意。

**删除/重命名枚举值**：

PG **不支持直接删除枚举值**，这是常见痛点。变通方案：

\`\`\`sql
-- 不能直接删除单个值
-- ALTER TYPE order_status DROP VALUE 'refunded'; -- 不支持

-- 变通：重命名类型 + 重建
ALTER TYPE order_status RENAME TO order_status_old;
CREATE TYPE order_status AS ENUM ('pending','paid','shipped','completed','cancelled');
-- 迁移数据，删除旧类型
DROP TYPE order_status_old;
\`\`\`

**重命名枚举值**（PG 10+）：

\`\`\`sql
ALTER TYPE order_status RENAME VALUE 'cancelled' TO 'canceled';
\`\`\`

## 23.4 复合类型 CREATE TYPE AS ROW

复合类型（Composite Type）把多个字段打包成一个"结构体"，可作为列类型、函数参数/返回值。

\`\`\`sql
-- 定义复合类型：地址
CREATE TYPE address AS (
  province TEXT,
  city     TEXT,
  street   TEXT,
  zip      TEXT
);

-- 作为列类型
CREATE TABLE customers (
  id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name  TEXT,
  addr  address
);

-- 插入：用 ROW() 构造
INSERT INTO customers (name, addr)
VALUES ('Alice', ROW('北京','北京市','朝阳区xx路','100000'));

-- 也可用字符串字面量
INSERT INTO customers (name, addr)
VALUES ('Bob', '("上海","上海市","浦东yy路","200000")');
\`\`\`

## 23.5 访问复合字段

用 **点号 \`.\`** 访问复合类型的字段，**必须用括号包裹**：

\`\`\`sql
-- ❌ 错误：会被解析成 customers.addr（表别名）
SELECT addr.province FROM customers;

-- ✅ 正确：用括号
SELECT (addr).province, (addr).city FROM customers WHERE id = 1;

-- 更清晰的写法：给列起别名
SELECT (c.addr).province FROM customers c;
\`\`\`

> 复合字段访问的括号极易遗忘，是新手常见语法错误来源。

**修改复合字段**：

\`\`\`sql
-- 更新整个复合值
UPDATE customers SET addr = ROW('北京','北京市','海淀区zz路','100089') WHERE id = 1;

-- 更新单个子字段
UPDATE customers SET addr.zip = '100089' WHERE id = 1;
\`\`\`

**复合类型作为函数返回值**（这是它最大的用武之地）：

\`\`\`sql
-- 返回地址的"省+市"摘要
CREATE OR REPLACE FUNCTION addr_summary(a address) RETURNS TEXT AS $$
  SELECT (a).province || (a).city;
$$ LANGUAGE SQL;

SELECT addr_summary(addr) FROM customers WHERE id = 1;
\`\`\`

**修改复合类型定义**：

\`\`\`sql
-- 新增字段
ALTER TYPE address ADD ATTRIBUTE detail TEXT;

-- 删除字段
ALTER TYPE address DROP ATTRIBUTE detail;

-- 重命名字段
ALTER TYPE address RENAME ATTRIBUTE zip TO postal_code;
\`\`\`

## 23.6 Domain 类型与约束

**Domain** 是"带约束的基础类型"，适合复用业务规则：

\`\`\`sql
-- 定义"正整数"domain
CREATE DOMAIN positive_int AS INT
  CHECK (VALUE > 0);

-- 定义"非空短字符串"domain
CREATE DOMAIN short_text AS VARCHAR(50)
  NOT NULL
  CHECK (length(VALUE) > 0);

-- 使用
CREATE TABLE products (
  id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name  short_text,        -- 非空且不超过 50 字符
  stock positive_int       -- 必须 > 0
);

INSERT INTO products (name, stock) VALUES ('手机', 100);  -- OK
INSERT INTO products (name, stock) VALUES ('耳机', -1);   -- 违反 CHECK
-- ERROR: value for domain positive_int violates check constraint
\`\`\`

**查看 domain 定义**：

\`\`\`sql
SELECT * FROM pg_type WHERE typtype = 'd';
\`\`\`

> Domain 比每次列定义都写 CHECK 简洁，适合"同一规则在多列复用"的场景，如手机号格式、正数金额等。

## 23.7 枚举 vs 查找表：何时用哪个

枚举类型不是万能的，固定值用枚举，可变值用查找表。

| 维度 | 枚举类型 ENUM | 查找表（lookup table） |
| --- | --- | --- |
| 取值是否固定不变 | ✅ 几乎不变 | ❌ 可能新增/修改 |
| 是否需要多语言 | ❌ 仅单值 | ✅ 可存多语言文案 |
| 是否需要附加属性 | ❌ 只有值 | ✅ 可存描述、排序、图标 |
| 修改成本 | 高（需 DDL） | 低（INSERT/UPDATE） |
| 性能 | 极快（4 字节） | 需 JOIN |
| 引用完整性 | 类型保证 | 需外键 |

**查找表示例**：

\`\`\`sql
-- 当状态会变、需要文案时，用查找表
CREATE TABLE order_status_dict (
  code     TEXT PRIMARY KEY,
  name     TEXT NOT NULL,          -- 中文文案
  sort_no  INT,
  is_active BOOLEAN DEFAULT true
);

INSERT INTO order_status_dict VALUES
  ('pending','待支付',1,true),
  ('paid','已支付',2,true),
  ('shipped','已发货',3,true);

CREATE TABLE orders2 (
  id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  status    TEXT NOT NULL,
  amount    NUMERIC(10,2),
  CONSTRAINT fk_status FOREIGN KEY (status) REFERENCES order_status_dict(code)
);

-- 查询带文案
SELECT o.id, d.name AS status_name, o.amount
FROM orders2 o
JOIN order_status_dict d ON o.status = d.code;
\`\`\`

> 经验：**流程性、几乎不变的**（性别、支付渠道）用枚举；**业务可配置、需文案/多语言**（商品分类、运营标签）用查找表。

## 23.8 常见坑

1. **枚举不能在事务里 ADD VALUE（PG 12 前）**：迁移脚本要拆出去单独执行。
2. **枚举不能直接删值**：需重建类型，小心依赖它的表/函数。
3. **枚举排序按定义顺序**：不要假设字母序，定义时按业务流程顺序排。
4. **复合字段访问必须加括号**：\`(addr).city\`，否则语法错误。
5. **枚举大小写敏感**：\`'Paid'\` 和 \`'paid'\` 是不同的，需统一约定。
6. **Domain 约束不能引用其他列**：Domain 的 CHECK 只能检查自身值，跨列约束要用表级 CHECK。

\`\`\`sql
-- 跨列约束不能用 domain
CREATE DOMAIN chk_price AS NUMERIC CHECK (VALUE > 0); -- 只能检查 price 本身

-- 跨列约束用表级 CHECK
CREATE TABLE t (
  price NUMERIC,
  qty   INT,
  CONSTRAINT chk_total CHECK (price * qty > 0)  -- 跨列
);
\`\`\`

## 23.9 本章小结

- **枚举类型**：\`CREATE TYPE ... AS ENUM\`，可复用、按定义顺序排序、类型安全。
- **枚举维护**：可 \`ADD VALUE\`（事务外）、\`RENAME VALUE\`，**不能直接删值**。
- **复合类型**：\`CREATE TYPE ... AS ROW\`，打包多字段，访问需括号 \`(col).field\`。
- **复合类型用途**：作为列、函数参数/返回值，建模"结构体"。
- **Domain**：带约束的基础类型，复用 CHECK 规则。
- **枚举 vs 查找表**：固定不变用枚举，可变/需文案用查找表。

> 类型系统是 PG 的"建模利器"：枚举保证取值合法，复合类型组织结构，Domain 复用约束。用它们能让 schema 更贴近业务语义。下一章我们看 PG 的自增方案——序列与标识列。`
  },
  {
    id: "pg-ch24",
    group: "第四部分 PG 特色功能",
    icon: "🔢",
    title: "第 24 章 序列与标识列",
    content: `# 第 24 章 序列与标识列

自增主键是关系数据库的"标配"。MySQL 用 \`AUTO_INCREMENT\` 一个关键字搞定，PostgreSQL 则更底层、更灵活：它把"自增"拆成独立的 **序列（sequence）** 对象，再由 \`SERIAL\` 伪类型或 \`GENERATED AS IDENTITY\` 标识列包装。理解序列，才能正确处理间隙、迁移、并发等问题。本章系统讲解。

## 24.1 CREATE SEQUENCE

序列是一个独立的数据库对象，专门生成递增（或递减）整数：

\`\`\`sql
-- 最简单的序列
CREATE SEQUENCE seq_order_id;

-- 带完整参数
CREATE SEQUENCE seq_ticket_id
  INCREMENT BY 1      -- 步长
  MINVALUE 1          -- 最小值
  MAXVALUE 999999     -- 最大值
  START WITH 1        -- 起始值
  CACHE 10            -- 缓存个数（性能）
  NO CYCLE;           -- 到达最大值后不循环（CYCLE 则循环）
\`\`\`

**参数说明**：

| 参数 | 含义 | 默认值 |
| --- | --- | --- |
| \`INCREMENT BY\` | 步长，可为负 | 1 |
| \`MINVALUE\` / \`MAXVALUE\` | 范围 | 由类型决定 |
| \`START WITH\` | 起始值 | MINVALUE（递增） |
| \`CACHE\` | 每次预分配个数，减少锁竞争 | 1 |
| \`CYCLE\` / \`NO CYCLE\` | 到边界是否循环 | NO CYCLE |

> 序列是"独立对象"，不依附于任何表。一个序列可被多张表共享（虽然不常见），也可用于非主键列。

## 24.2 nextval、currval、lastval、setval

四个核心序列函数：

| 函数 | 作用 |
| --- | --- |
| \`\`nextval('seq')\`\` | 取下一个值（**推进序列**） |
| \`\`currval('seq')\`\` | 返回**当前会话**上次 nextval 的值（不推进） |
| \`\`lastval()\`\` | 返回当前会话**最近一次** nextval 的值（任意序列） |
| \`\`setval('seq', n)\`\` | 手动设置序列当前值 |

\`\`\`sql
-- 取值
SELECT nextval('seq_order_id');  -- 1
SELECT nextval('seq_order_id');  -- 2
SELECT nextval('seq_order_id');  -- 3

-- currval：返回当前会话上次 nextval 的值（必须先 nextval 过）
SELECT currval('seq_order_id');  -- 3（不推进）

-- lastval：当前会话最近一次 nextval（不指定序列名）
SELECT lastval();                -- 3

-- setval：手动设置
SELECT setval('seq_order_id', 100);     -- 设为 100，下次 nextval 是 101
SELECT setval('seq_order_id', 100, false); -- 第三参数 false：下次 nextval 是 100
\`\`\`

> **currval 是会话级**：它返回"当前会话"上次 nextval 的值，不会被其他会话影响。若当前会话没调用过 nextval，\`currval\` 会报错。这是它和"查当前最大值"的本质区别——它**不会推进序列，也无需推进**。

**常见用法：插入后取 ID**

\`\`\`sql
-- 先取序列值，再用它插入
INSERT INTO orders (id, amount) VALUES (nextval('seq_order_id'), 99.9)
RETURNING id;
\`\`\`

## 24.3 SERIAL 与 BIGSERIAL 伪类型

为简化"序列 + 默认值"的写法，PG 提供 \`SERIAL\` 系列伪类型：

| 伪类型 | 实际类型 | 序列类型 |
| --- | --- | --- |
| \`\`SERIAL\`\` | INT | INT 序列 |
| \`\`BIGSERIAL\`\` | BIGINT | BIGINT 序列 |
| \`\`SMALLSERIAL\`\` | SMALLINT | SMALLINT 序列 |

\`\`\`sql
-- 写法
CREATE TABLE orders_serial (
  id BIGSERIAL PRIMARY KEY,
  amount NUMERIC(10,2)
);

-- 等价于 PG 自动执行：
-- 1. CREATE SEQUENCE orders_serial_id_seq;
-- 2. CREATE TABLE orders_serial (id BIGINT NOT NULL DEFAULT nextval('orders_serial_id_seq'), ...);
-- 3. ALTER TABLE ... ALTER COLUMN id SET DEFAULT nextval(...);
-- 4. ALTER SEQUENCE ... OWNED BY orders_serial.id;
\`\`\`

\`\`\`sql
-- 插入时无需指定 id
INSERT INTO orders_serial (amount) VALUES (99.9) RETURNING id;
\`\`\`

> \`SERIAL\` 会被展开成"序列 + DEFAULT nextval"，本质仍是序列。序列名规则是 \`<表名>_<列名>_seq\`。

## 24.4 GENERATED AS IDENTITY（SQL 标准标识列）

PG 10+ 引入 **SQL 标准的标识列**，是 \`SERIAL\` 的"现代替代"：

\`\`\`sql
CREATE TABLE orders_ident (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  amount NUMERIC(10,2)
);

-- 或 BY DEFAULT
CREATE TABLE orders_ident2 (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  amount NUMERIC(10,2)
);
\`\`\`

**两种模式的区别**：

| 模式 | 用户能手动插 id 吗 | 行为 |
| --- | --- | --- |
| \`\`GENERATED ALWAYS AS IDENTITY\`\` | ❌ 默认拒绝（需 \`OVERRIDING SYSTEM VALUE\`） | 强制由系统生成 |
| \`\`GENERATED BY DEFAULT AS IDENTITY\`\` | ✅ 可以，但用户不指定时系统生成 | 默认由系统生成，可被覆盖 |

\`\`\`sql
-- ALWAYS 模式：手动插 id 会被拒绝
INSERT INTO orders_ident (id, amount) VALUES (100, 9.9);
-- ERROR: cannot insert a non-DEFAULT value into identity column

-- 用 OVERRIDING SYSTEM VALUE 强制
INSERT INTO orders_ident (id, amount) OVERRIDING SYSTEM VALUE VALUES (100, 9.9);

-- BY DEFAULT 模式：可手动插
INSERT INTO orders_ident2 (id, amount) VALUES (100, 9.9); -- OK
\`\`\`

**IDENTITY 相比 SERIAL 的优势**：

1. **SQL 标准**：跨数据库可移植（Oracle/DB2 也支持）。
2. **列与序列绑定更紧**：删列时自动删序列，无"孤儿序列"。
3. **权限更清晰**：不需要单独 GRANT 序列的 USAGE 权限。
4. **ALTER 改 restart 更方便**：\`ALTER TABLE ... RESTART\`。

\`\`\`sql
-- 重启标识列
ALTER TABLE orders_ident ALTER COLUMN id RESTART WITH 1000;

-- SERIAL 重启需操作序列
ALTER SEQUENCE orders_serial_id_seq RESTART WITH 1000;
\`\`\`

> **新项目优先用 GENERATED AS IDENTITY**，SERIAL 是历史遗留兼容写法。

## 24.5 序列间隙

序列**一定会产生间隙**，这是设计如此，不是 bug：

- 事务回滚：取了 nextval 但事务回滚，序列不回退。
- 缓存：\`CACHE\` 预分配的值在会话断开/崩溃时丢失。
- 并发：多个会话各取各的，互不相让。

\`\`\`sql
-- 演示回滚产生间隙
INSERT INTO orders_serial (amount) VALUES (10); -- id=1
BEGIN;
INSERT INTO orders_serial (amount) VALUES (20); -- id=2
ROLLBACK;                                       -- 回滚，但 seq 已到 2
INSERT INTO orders_serial (amount) VALUES (30); -- id=3（不是 2！）
SELECT * FROM orders_serial;
-- 1, 10
-- 3, 30
\`\`\`

> **不要假设自增列连续无缺**。若业务要求"连续编号"（如发票号），不能依赖序列，需用单独的"取号表"+ 行锁，或应用层生成。

## 24.6 序列耗尽

序列达到 MAXVALUE 后，\`NO CYCLE\` 会报错：

\`\`\`sql
CREATE SEQUENCE seq_small MAXVALUE 3 NO CYCLE;
SELECT nextval('seq_small'); -- 1
SELECT nextval('seq_small'); -- 2
SELECT nextval('seq_small'); -- 3
SELECT nextval('seq_small');
-- ERROR: nextval: reached maximum value of sequence "seq_small" (3)
\`\`\`

**INT 的隐患**：\`SERIAL\` 是 INT，最大约 21 亿。高并发写入系统（日志、埋点）可能几年内耗尽。**主键一律用 BIGSERIAL/BIGINT IDENTITY**。

\`\`\`sql
-- ❌ 32 位 int 有耗尽风险
CREATE TABLE logs (id SERIAL PRIMARY KEY, msg TEXT);

-- ✅ 用 bigint
CREATE TABLE logs (id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, msg TEXT);
\`\`\`

> 已经用 INT 的表，可通过 \`ALTER TABLE ... ALTER COLUMN id TYPE bigint\` 升级，但需停机或长事务，提前规划。

## 24.7 手动序列管理

**查看当前序列值**（不推进）：

\`\`\`sql
-- 方法 1：currval（需当前会话先 nextval）
SELECT currval('orders_serial_id_seq');

-- 方法 2：直接查序列的 last_value（注意：CACHE 模式下 last_value 可能领先于实际分配值）
SELECT last_value FROM orders_serial_id_seq;
\`\`\`

**同步序列到表最大值**（数据迁移/导入后常用）：

\`\`\`sql
-- 导入历史数据后，序列还停在 1，需同步
SELECT setval('orders_serial_id_seq', (SELECT COALESCE(MAX(id), 0) FROM orders_serial));
-- 之后 nextval 从 MAX+1 开始
\`\`\`

**一键同步所有序列**（PG 自带函数）：

\`\`\`sql
-- PG 10+ 提供函数同步所有序列
SELECT setval(
  pg_get_serial_sequence(quote_ident(schemaname) || '.' || quote_ident(relname), attname),
  COALESCE(max_id, 0) + 1,
  false
)
FROM (
  SELECT n.nspname AS schemaname, c.relname AS relname, a.attname AS attname,
         pg_get_serial_sequence(quote_ident(n.nspname) || '.' || quote_ident(c.relname), a.attname) AS seqname
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  JOIN pg_attribute a ON a.attrelid = c.oid
  WHERE c.relkind = 'r' AND a.attidentity <> '' OR pg_get_serial_sequence(...) IS NOT NULL
) s
LEFT JOIN LATERAL (
  SELECT MAX(id) AS max_id FROM ... -- 实际按表查
) m ON true;
\`\`\`

> 实际中更推荐写脚本遍历每张表执行 \`setval\`，避免复杂 SQL。社区有 \`pg_sequences\` 视图辅助（见 24.8）。

## 24.8 pg_sequences 视图

PG 10+ 提供 \`pg_sequences\` 系统视图，查看所有序列状态：

\`\`\`sql
SELECT
  schemaname,
  sequencename,
  data_type,
  start_value,
  min_value,
  max_value,
  increment_by,
  cycle,
  cache_size,
  last_value
FROM pg_sequences
WHERE schemaname = 'public';
\`\`\`

输出示例：

\`\`\`
schemaname | sequencename          | data_type | start_value | max_value    | last_value
public     | orders_serial_id_seq  | bigint    | 1           | 922337203... | 3
public     | seq_order_id          | bigint    | 1           | 922337203... | 3
\`\`\`

**监控序列"剩余空间"**：

\`\`\`sql
SELECT
  sequencename,
  last_value,
  max_value,
  round((last_value::numeric / max_value) * 100, 6) AS used_pct
FROM pg_sequences
WHERE schemaname = 'public';
\`\`\`

> 把这个查询接入监控告警，当 \`used_pct > 80%\` 时预警，能避免序列耗尽事故。

## 24.9 CACHE 与并发性能

\`CACHE\` 参数影响并发性能：

- \`CACHE 1\`（默认）：每次 nextval 都更新序列对象，高并发下锁竞争严重。
- \`CACHE N\`：会话一次性预分配 N 个值到内存，减少对序列对象的访问。

\`\`\`sql
-- 高并发写入表，把 cache 调大
ALTER SEQUENCE orders_serial_id_seq CACHE 100;
\`\`\`

> CACHE 的代价：会话崩溃时预分配的值丢失，产生更大间隙。这是"性能 vs 间隙"的权衡。互联网高并发场景常用 \`CACHE 100\` 甚至更大。

## 24.10 本章小结

- **序列**：独立对象，\`CREATE SEQUENCE\`，\`nextval\` 取值推进。
- **函数**：\`nextval\`（取下一个）、\`currval\`（当前会话上次值）、\`lastval\`（最近一次）、\`setval\`（手动设置）。
- **SERIAL/BIGSERIAL**：伪类型，展开为"序列 + DEFAULT nextval"，老语法。
- **GENERATED AS IDENTITY**：SQL 标准标识列，ALWAYS 强制系统生成、BY DEFAULT 可覆盖，**新项目首选**。
- **间隙**：序列设计上会产生间隙（回滚/缓存/并发），不要假设连续。
- **耗尽**：INT 有上限，主键一律 BIGINT；监控 \`pg_sequences\` 预警。
- **CACHE**：调大 CACHE 提升并发，代价是更大间隙。
- **同步序列**：数据迁移后用 \`setval(seq, MAX(id))\` 对齐。

> 序列看似简单，实则是 PG 自增的"底层引擎"。理解它的会话语义、间隙行为、CACHE 权衡，才能在高并发下用好自增主键。至此，第四部分 PG 特色功能介绍完毕，下一部分我们将进入架构与高可用。`
  }
];

export { chapters };
