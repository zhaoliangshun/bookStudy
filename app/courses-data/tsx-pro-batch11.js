// =============================================================
// TypeScript + React 全栈精通 - Batch 11: 测试与工程化
// -------------------------------------------------------------
// 章节范围（共 5 章）：
//   66. tspro-vitest   Vitest 单元测试
//   67. tspro-rtl      React Testing Library 组件测试
//   68. tspro-e2e      E2E 测试（Playwright）
//   69. tspro-vite     Vite 构建工具实战
//   70. tspro-nextjs   Next.js 全栈框架
//
// 代码运行环境：ts.transpileModule + jsx: ReactJSX + target ES2020
// 沙箱注入 react / react/jsx-runtime 的 mock，可写 JSX 语法
// =============================================================

export const chapters = [
  // =========================================================
  // 第六十六章：Vitest 单元测试
  // =========================================================
  {
    id: "tspro-vitest",
    group: "十一、测试与工程化",
    icon: "🧪",
    title: "Vitest 单元测试",
    content: `# 第六十六章：Vitest 单元测试

## 66.1 为什么需要单元测试

写代码时所有人都觉得自己写的没问题，上线后用户输入奇怪的数据，bug 就冒出来了。单元测试就是"提前给代码出难题"——把每个函数当成黑盒，给定输入验证输出。

测试带来三个好处：

1. **立刻发现回归**：改 A 模块不会偷偷弄坏 B 模块
2. **充当文档**：测试用例展示了函数该有的用法
3. **重构有底气**：有测试兜底，敢动老代码

Vitest 是 Vite 团队出的测试框架，API 几乎和 Jest 一致，但启动快得多（复用 Vite 的转换管线），是 2024+ React 项目首选。

## 66.2 安装与配置

\`\`\`bash
# 安装 Vitest + 测试环境（jsdom 模拟浏览器 DOM）
npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom

# 装 UI 面板（可选，可视化看测试结果）
npm i -D @vitest/ui
\`\`\`

\`\`\`ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',           // 模拟 DOM
    globals: true,                  // 全局 API：describe/it/expect 不用 import
    setupFiles: './test/setup.ts', // 每个测试前执行的脚本
    coverage: {
      provider: 'v8',              // 用 v8 收集覆盖率
      reporter: ['text', 'json', 'html'],
    },
  },
});
\`\`\`

\`\`\`ts
// test/setup.ts —— 每个测试运行前都会执行
import '@testing-library/jest-dom/vitest';  // 扩展 expect：toBeVisible 等
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// 每个测试结束清理 DOM，避免测试间互相污染
afterEach(() => cleanup());
\`\`\`

\`globals: true\` 让你在测试文件里直接用 \`describe / it / expect\`，不用 import。和 Jest 完全一致。

## 66.3 第一个测试：纯函数

测试的核心是"三段式"：**Arrange 准备 → Act 执行 → Assert 验证**。

\`\`\`ts
// src/utils/format.ts —— 被测函数
export function formatPrice(cents: number, currency = 'CNY'): string {
  if (!Number.isFinite(cents)) throw new Error('无效金额');
  const symbols: Record<string, string> = { CNY: '¥', USD: '$', EUR: '€' };
  const symbol = symbols[currency] ?? '';
  return \`\${symbol}\${(cents / 100).toFixed(2)}\`;
}

export function clamp(value: number, min: number, max: number): number {
  if (min > max) throw new Error('min 不能大于 max');
  return Math.min(Math.max(value, min), max);
}
\`\`\`

\`\`\`ts
// src/utils/format.test.ts —— 测试文件
// 文件名必须包含 .test. 或 .spec. 后缀才会被 Vitest 识别
import { describe, it, expect } from 'vitest';
import { formatPrice, clamp } from './format';

// describe 把相关测试分组，输出更好看
describe('formatPrice', () => {
  // it = test，写法等价
  it('应该把分转成元并加上 ¥ 符号', () => {
    // Arrange
    const cents = 12345;
    // Act
    const result = formatPrice(cents);
    // Assert
    expect(result).toBe('¥123.45');
  });

  it('应该支持 USD 货币', () => {
    expect(formatPrice(1000, 'USD')).toBe('$10.00');
  });

  it('应该支持 EUR 货币', () => {
    expect(formatPrice(999, 'EUR')).toBe('€9.99');
  });

  it('未知货币应该没符号', () => {
    expect(formatPrice(500, 'JPY')).toBe('5.00');
  });

  it('NaN 应该抛错', () => {
    // 测抛错用 throws
    expect(() => formatPrice(NaN)).toThrow('无效金额');
  });
});

describe('clamp', () => {
  it('值在范围内不变', () => {
    expect(clamp(5, 1, 10)).toBe(5);
  });

  it('值小于 min 返回 min', () => {
    expect(clamp(-3, 1, 10)).toBe(1);
  });

  it('值大于 max 返回 max', () => {
    expect(clamp(99, 1, 10)).toBe(10);
  });

  it('边界值正确', () => {
    expect(clamp(1, 1, 10)).toBe(1);
    expect(clamp(10, 1, 10)).toBe(10);
  });

  it('min > max 抛错', () => {
    expect(() => clamp(5, 10, 1)).toThrow('min 不能大于 max');
  });
});
\`\`\`

\`describe\` 嵌套也行：\`describe('clamp', () => { describe('边界', () => { it(...) }) })\`。

## 66.4 Matchers 匹配器全解

\`expect(x).toBe(y)\` 是最基本的，Vitest 还有大量匹配器：

\`\`\`ts
// 相等
expect(2 + 2).toBe(4);              // 严格相等 ===
expect({ a: 1 }).toEqual({ a: 1 }); // 深度相等（递归比较）
expect([1, 2, 3]).toEqual([1, 2, 3]);

// 真假
expect(true).toBeTruthy();          // 真：true / 1 / 'x' / {} / []
expect(null).toBeFalsy();           // 假：false / 0 / '' / null / undefined
expect(null).toBeNull();
expect(undefined).toBeUndefined();
expect(NaN).toBeNaN();

// 数字
expect(3.14).toBeCloseTo(3.14, 2);   // 浮点比较（避免精度问题）
expect(5).toBeGreaterThan(3);
expect(5).toBeGreaterThanOrEqual(5);
expect(3).toBeLessThan(5);

// 字符串
expect('hello world').toMatch(/hello/);   // 正则匹配
expect('hello world').toContain('world'); // 包含子串
expect('hello world').toMatch(/^\w+ \w+$/);

// 数组 / 可迭代
expect([1, 2, 3]).toContain(2);           // 包含元素
expect([1, 2, 3]).toHaveLength(3);
expect(new Set([1, 2])).toContain(1);

// 对象
expect({ a: 1, b: 2 }).toHaveProperty('a');       // 有属性
expect({ a: 1, b: 2 }).toHaveProperty('a', 1);    // 属性等于
expect({ name: 'tom' }).toMatchObject({ name: 'tom' }); // 部分匹配

// 异常
expect(() => { throw new Error('boom'); }).toThrow();
expect(() => { throw new Error('boom'); }).toThrow('boom');          // 错误消息
expect(() => { throw new Error('boom'); }).toThrow(/boo/);            // 正则
expect(() => { throw new TypeError('type'); }).toThrow(TypeError);   // 类型

// 取反 .not
expect(5).not.toBe(6);
expect('hello').not.toContain('world');
\`\`\`

记不住没关系，常用就 \`toBe / toEqual / toContain / toThrow / toBeTruthy\` 这几个。

## 66.5 异步测试

异步函数有三种测法，对应三种返回：

\`\`\`ts
// 1. Promise 返回
async function fetchUser(id: number): Promise<{ name: string }> {
  return { name: 'tom' };
}

// 写法 A：return Promise + expect
it('Promise 写法 A', () => {
  return fetchUser(1).then(user => {
    expect(user.name).toBe('tom');
  });
});

// 写法 B：async/await（推荐）
it('async/await 写法', async () => {
  const user = await fetchUser(1);
  expect(user.name).toBe('tom');
});

// 写法 C：resolves（语法糖）
it('resolves 写法', async () => {
  await expect(fetchUser(1)).resolves.toEqual({ name: 'tom' });
});

// 2. Promise reject
async function failingApi(): Promise<never> {
  throw new Error('网络错误');
}

it('reject 测试', async () => {
  await expect(failingApi()).rejects.toThrow('网络错误');
});

// 3. 回调函数（setTimeout 等需要用 done 或 fake timer）
function delayHello(cb: (msg: string) => void) {
  setTimeout(() => cb('hello'), 100);
}

it('回调测试用 vi.useFakeTimers', () => {
  vi.useFakeTimers();
  const cb = vi.fn();
  delayHello(cb);
  vi.advanceTimersByTime(100);  // 快进 100ms
  expect(cb).toHaveBeenCalledWith('hello');
  vi.useRealTimers();
});
\`\`\`

\`async/await\` 最常用，回调用 fake timer 跳过等待。

## 66.6 Mock 函数

测试组件 A 时，A 调用了 B，但 B 慢或者有副作用（发请求、写文件），就用 mock 把 B 替换成"假函数"。

\`\`\`ts
import { vi } from 'vitest';

// 1. 创建 mock 函数
const mockFn = vi.fn();

// 设置返回值
mockFn.mockReturnValue(42);
mockFn(); // → 42

mockFn.mockReturnValueOnce(1).mockReturnValueOnce(2).mockReturnValue(99);
mockFn(); // 1
mockFn(); // 2
mockFn(); // 99（之后都是）

mockFn.mockResolvedValue('async value');       // Promise.resolve
mockFn.mockRejectedValue(new Error('失败'));    // Promise.reject
mockFn.mockImplementation((x) => x * 2);        // 自定义实现

// 断言调用情况
expect(mockFn).toHaveBeenCalled();              // 被调用过
expect(mockFn).toHaveBeenCalledTimes(3);        // 调用 3 次
expect(mockFn).toHaveBeenCalledWith('tom');      // 用 'tom' 调用过
expect(mockFn).toHaveBeenLastCalledWith('end'); // 最后一次用 'end'

// 取数据
console.log(mockFn.mock.calls);     // [[arg1, arg2], [arg1']] 所有调用的参数
console.log(mockFn.mock.results);   // [{ value: 42 }, ...] 所有返回值

// 清空 mock 记录（不影响实现）
mockFn.mockClear();

// 重置实现（恢复成空 mock）
mockFn.mockReset();
\`\`\`

## 66.7 Mock 模块

测试用 axios 的代码时，不要真发请求，把整个 axios 模块 mock 掉：

\`\`\`ts
// src/api.ts
import axios from 'axios';
export async function getUser(id: number) {
  const { data } = await axios.get(\`/api/users/\${id}\`);
  return data;
}

// src/api.test.ts
import { vi, describe, it, expect } from 'vitest';
vi.mock('axios');  // 整个 axios 模块变成 mock

import axios from 'axios';
import { getUser } from './api';

describe('getUser', () => {
  it('应该调用 axios.get 并返回 data', async () => {
    // 设置 mock 实现
    axios.get.mockResolvedValue({ data: { id: 1, name: 'tom' } });

    const user = await getUser(1);

    expect(axios.get).toHaveBeenCalledWith('/api/users/1');
    expect(user).toEqual({ id: 1, name: 'tom' });
  });

  it('网络错误应该抛异常', async () => {
    axios.get.mockRejectedValue(new Error('网络错误'));
    await expect(getUser(1)).rejects.toThrow('网络错误');
  });
});
\`\`\`

\`vi.mock('axios')\` 一定要在 import axios 之前（会被 hoist 到顶部）。Mock 后所有 axios 方法都变成 \`vi.fn()\`，可以单独控制返回值。

## 66.8 Mock 自定义模块

\`\`\`ts
// utils/auth.ts
export function isAdmin(user: { role: string }) {
  return user.role === 'admin';
}

// 在另一个文件中 import 了 isAdmin
// src/auth-button.tsx
import { isAdmin } from './utils/auth';
export function AuthButton({ user }) {
  return isAdmin(user) ? <button>删除</button> : null;
}

// 测试时 mock isAdmin
vi.mock('./utils/auth', () => ({
  isAdmin: vi.fn(),
}));

import { isAdmin } from './utils/auth';
isAdmin.mockReturnValue(true);  // 强制返回 true
\`\`\`

## 66.9 Spy 监视真实函数

mock 完全替换，spy 在原函数基础上监视调用：

\`\`\`ts
import { vi } from 'vitest';

const obj = {
  add(a: number, b: number) { return a + b; },
};

// spy：原函数照常执行，但能查到调用记录
const spy = vi.spyOn(obj, 'add');

const result = obj.add(2, 3);

expect(result).toBe(5);                              // 真实返回值
expect(spy).toHaveBeenCalledWith(2, 3);              // 调用参数
expect(spy).toHaveBeenCalledTimes(1);

// 也可以临时改实现
spy.mockImplementation(() => 999);
expect(obj.add(2, 3)).toBe(999);

// 恢复
spy.mockRestore();
\`\`\`

## 66.10 beforeEach / afterEach / beforeAll / afterAll

\`\`\`ts
import { describe, beforeEach, afterEach, beforeAll, afterAll, it } from 'vitest';

describe('数据库操作', () => {
  let db;

  // 所有测试前执行一次：建表、连数据库
  beforeAll(async () => {
    db = await connectDB();
    await db.query('CREATE TABLE users (...)');
  });

  // 所有测试后执行一次：断开连接
  afterAll(async () => {
    await db.close();
  });

  // 每个测试前执行：清空表
  beforeEach(async () => {
    await db.query('DELETE FROM users');
  });

  // 每个测试后执行：清理文件、恢复 mock
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('插入用户', async () => {
    await db.query('INSERT INTO users VALUES (1, "tom")');
    const rows = await db.query('SELECT * FROM users');
    expect(rows).toHaveLength(1);
  });
});
\`\`\`

执行顺序：\`beforeAll → (beforeEach → it → afterEach) × N → afterAll\`。

## 66.11 only / skip / todo

调试时只跑某个测试：

\`\`\`ts
it.only('只跑这个', () => { ... });     // 跳过其他 it
it.skip('跳过这个', () => { ... });      // 不跑
it.todo('待写');                         // 占位，不算失败
it.fails('预期会失败', () => {            // 反向：期望函数抛错
  expect(1).toBe(2);
});
\`\`\`

## 66.12 配置 npm scripts

\`\`\`json
// package.json
{
  "scripts": {
    "test": "vitest",                // watch 模式
    "test:run": "vitest run",         // 单次跑
    "test:ui": "vitest --ui",         // UI 面板
    "test:coverage": "vitest run --coverage"
  }
}
\`\`\`

CI 用 \`vitest run\`，本地开发用 \`vitest\`（watch 改文件自动重跑）。

## 66.13 小结

- Vitest 三段式：Arrange / Act / Assert
- 常用 API：\`describe / it / expect / beforeEach\`
- 常用 matcher：\`toBe / toEqual / toContain / toThrow / toHaveBeenCalledWith\`
- 异步用 \`async/await\`，回调用 \`vi.useFakeTimers\`
- Mock 模块：\`vi.mock('axios')\` 整个替换，\`vi.spyOn(obj, 'm')\` 监视真实
- 命令：\`vitest\` watch、\`vitest run\` 单次、\`vitest --ui\` 面板
- 文件名必须包含 \`.test.\` 或 \`.spec.\`，配置在 \`vitest.config.ts\``,
    code: `// =============================================================
// 第 66 章 demo：Vitest 单元测试（沙箱模拟）
// =============================================================
// 真实项目里用 npm test 跑 vitest，这里用代码模拟测试流程
// 演示 describe / it / expect / mock 的核心机制

// ---- 1. 简易 expect 实现 ----
// 演示 expect 链式调用的原理：返回一个带 matcher 方法的对象
function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error('AssertionError: 期望 ' + JSON.stringify(actual) + ' 等于 ' + JSON.stringify(expected) + ' (===)');
      }
      return this;
    },
    toEqual(expected) {
      // 深度比较（简化版：JSON 序列化对比）
      const a = JSON.stringify(actual);
      const b = JSON.stringify(expected);
      if (a !== b) {
        throw new Error('AssertionError: 深度不等\\n  实际: ' + a + '\\n  期望: ' + b);
      }
      return this;
    },
    toContain(item) {
      if (typeof actual === 'string') {
        if (!actual.includes(item)) throw new Error('字符串不包含: ' + item);
      } else if (Array.isArray(actual)) {
        if (!actual.includes(item)) throw new Error('数组不包含: ' + JSON.stringify(item));
      }
      return this;
    },
    toThrow(msg) {
      if (typeof actual !== 'function') throw new Error('toThrow 需要 function');
      try {
        actual();
        throw new Error('未抛错，但期望抛错');
      } catch (e) {
        if (msg && !e.message.includes(msg)) {
          throw new Error('错误消息不匹配: ' + e.message + ' 不包含 ' + msg);
        }
      }
      return this;
    },
    toBeTruthy() {
      if (!actual) throw new Error(JSON.stringify(actual) + ' 不是 truthy');
      return this;
    },
    toBeFalsy() {
      if (actual) throw new Error(JSON.stringify(actual) + ' 不是 falsy');
      return this;
    },
    not: {
      // 简化：只支持 not.toBe
      toBe(expected) {
        if (actual === expected) throw new Error('期望不相等，但都是 ' + JSON.stringify(actual));
      },
    },
  };
}

// ---- 2. describe / it 框架 ----
let passCount = 0;
let failCount = 0;
const failures = [];

function describe(name, fn) {
  console.log('\\n■ ' + name);
  fn();
}

function it(name, fn) {
  try {
    fn();
    passCount++;
    console.log('  ✓ ' + name);
  } catch (e) {
    failCount++;
    failures.push({ name, error: e.message });
    console.log('  ✗ ' + name);
    console.log('      → ' + e.message);
  }
}

// ---- 3. 被测代码：业务函数 ----
function formatPrice(cents, currency) {
  currency = currency || 'CNY';
  if (!Number.isFinite(cents)) throw new Error('无效金额');
  const symbols = { CNY: '¥', USD: '$', EUR: '€' };
  const symbol = symbols[currency] || '';
  return symbol + (cents / 100).toFixed(2);
}

function clamp(value, min, max) {
  if (min > max) throw new Error('min 不能大于 max');
  return Math.min(Math.max(value, min), max);
}

// ---- 4. 运行测试套件 ----
console.log('=== Vitest 单元测试 Demo ===\\n');

describe('formatPrice', () => {
  it('分转元 + ¥ 符号', () => {
    expect(formatPrice(12345)).toBe('¥123.45');
  });
  it('支持 USD', () => {
    expect(formatPrice(1000, 'USD')).toBe('$10.00');
  });
  it('支持 EUR', () => {
    expect(formatPrice(999, 'EUR')).toBe('€9.99');
  });
  it('未知货币无符号', () => {
    expect(formatPrice(500, 'JPY')).toBe('5.00');
  });
  it('NaN 抛错', () => {
    expect(() => formatPrice(NaN)).toThrow('无效金额');
  });
});

describe('clamp', () => {
  it('值在范围内不变', () => {
    expect(clamp(5, 1, 10)).toBe(5);
  });
  it('小于 min 返回 min', () => {
    expect(clamp(-3, 1, 10)).toBe(1);
  });
  it('大于 max 返回 max', () => {
    expect(clamp(99, 1, 10)).toBe(10);
  });
  it('min > max 抛错', () => {
    expect(() => clamp(5, 10, 1)).toThrow('min 不能大于 max');
  });
});

// ---- 5. Mock 函数演示 ----
function viFn() {
  const fn = function (...args) {
    fn.mock.calls.push(args);
    const impl = fn.mock.implementations[fn.mock.calls.length - 1] || fn.mock.defaultValue;
    const result = impl ? impl(...args) : undefined;
    fn.mock.results.push(result);
    return result;
  };
  fn.mock = { calls: [], results: [], implementations: [], defaultValue: undefined };
  fn.mockReturnValue = (v) => { fn.mock.defaultValue = () => v; return fn; };
  fn.mockReturnValueOnce = (v) => { fn.mock.implementations.push(() => v); return fn; };
  fn.mockImplementation = (impl) => { fn.mock.defaultValue = impl; return fn; };
  fn.mockClear = () => { fn.mock.calls = []; fn.mock.results = []; };
  return fn;
}

console.log('\\n=== Mock 函数演示 ===\\n');

const mockFetch = viFn();
mockFetch.mockReturnValueOnce({ id: 1, name: 'tom' });
mockFetch.mockReturnValue({ id: 0, name: 'unknown' });

console.log('第一次调用:', mockFetch('/api/1'));
console.log('第二次调用:', mockFetch('/api/2'));
console.log('调用次数:', mockFetch.mock.calls.length);
console.log('调用参数:', JSON.stringify(mockFetch.mock.calls));
console.log('返回值:', JSON.stringify(mockFetch.mock.results));

// ---- 6. 测试结果统计 ----
console.log('\\n=== 测试结果 ===');
console.log('通过: ' + passCount + ' / 失败: ' + failCount);
if (failures.length) {
  console.log('\\n失败用例:');
  failures.forEach(f => console.log('  - ' + f.name + ': ' + f.error));
}`,
  },

  // =========================================================
  // 第六十七章：React Testing Library 组件测试
  // =========================================================
  {
    id: "tspro-rtl",
    group: "十一、测试与工程化",
    icon: "🧬",
    title: "React Testing Library 组件测试",
    content: `# 第六十七章：React Testing Library 组件测试

## 67.1 单元测试 vs 组件测试

第 66 章测的是纯函数：\`formatPrice(12345)\` 返回 \`'¥123.45'\`。但 React 组件不是函数，它有 props、有 state、有事件、有副作用，单纯调函数测不出来。

React Testing Library（RTL）的核心思想是：**像真实用户一样测试组件**。

- 不测内部 state、不测私有方法、不测实现细节
- 测用户能看到什么、能点什么、输入什么

测试通过 \`querySelector\` 查 DOM 元素 → 模拟点击 → 断言新内容出现。用户怎么操作，测试就怎么写。

## 67.2 安装与查询 API

\`\`\`bash
npm i -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
\`\`\`

\`\`\`ts
// test/setup.ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
afterEach(() => cleanup());
\`\`\`

核心查询 API（按可见性分两类）：

| 查询 | 单个 | 多个 | 说明 |
|------|------|------|------|
| 通过标签 | \`getByRole\` | \`getAllByRole\` | **推荐首选** |
| 通过文本 | \`getByText\` | \`getAllByText\` | 用户能看到的文字 |
| 通过 placeholder | \`getByPlaceholderText\` | \`getAllByPlaceholderText\` | 输入框 |
| 通过 label | \`getByLabelText\` | \`getAllByLabelText\` | 表单字段 |
| 通过显示值 | \`getByDisplayValue\` | \`getAllByDisplayValue\` | 已选/已输入 |
| 通过 alt | \`getByAltText\` | \`getAllByAltText\` | 图片 |
| 通过 title | \`getByTitle\` | \`getAllByTitle\` | 悬停提示 |
| 通过 testid | \`getByTestId\` | \`getAllByTestId\` | 最后兜底 |

变体（按错误处理分三种）：

- \`getBy...\` —— 找不到就报错（最常用）
- \`queryBy...\` —— 找不到返回 null（断言"不存在"用）
- \`findBy...\` —— 异步等元素出现（Promise）

\`\`\`ts
// 找到 Button 角色并断言可点击
const btn = screen.getByRole('button', { name: '提交' });
expect(btn).toBeEnabled();

// 找不到应该返回 null（断言"不存在"）
expect(screen.queryByRole('alert')).toBeNull();
// 或写：expect(screen.queryByRole('alert')).not.toBeInTheDocument();

// 异步等待元素出现（默认 1000ms 超时）
const alert = await screen.findByRole('alert');
\`\`\`

## 67.3 第一个组件测试

\`\`\`tsx
// src/components/Counter.tsx
import { useState } from 'react';

export function Counter({ initial = 0, step = 1 }: { initial?: number; step?: number }) {
  const [count, setCount] = useState(initial);
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={() => setCount(c => c + step)}>加 {step}</button>
      <button onClick={() => setCount(c => c - step)}>减 {step}</button>
    </div>
  );
}
\`\`\`

\`\`\`tsx
// src/components/Counter.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './Counter';

describe('Counter', () => {
  it('显示初始值', () => {
    render(<Counter initial={10} />);
    expect(screen.getByTestId('count')).toHaveTextContent('10');
  });

  it('点击 + 按钮 +1', async () => {
    const user = userEvent.setup();
    render(<Counter initial={0} step={1} />);

    await user.click(screen.getByRole('button', { name: '加 1' }));

    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('点击 - 按钮 -2', async () => {
    const user = userEvent.setup();
    render(<Counter initial={10} step={2} />);

    await user.click(screen.getByRole('button', { name: '减 2' }));

    expect(screen.getByTestId('count')).toHaveTextContent('8');
  });
});
\`\`\`

\`render(<Component />)\` 把组件渲染到 jsdom 模拟的 DOM，\`screen\` 是全局查询入口。\`userEvent.setup()\` 创建一个"虚拟用户"，更接近真实交互（焦点、事件触发顺序都对）。

## 67.4 fireEvent vs userEvent

\`\`\`ts
import { fireEvent } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

// 老写法：fireEvent，只触发一个事件
fireEvent.click(button);
fireEvent.change(input, { target: { value: 'hello' } });

// 新写法：userEvent，模拟真实用户操作链
const user = userEvent.setup();
await user.click(button);
await user.type(input, 'hello');          // 一个字符一个字符输入
await user.keyboard('{Enter}');             // 按回车
await user.tab();                            // 按 Tab
await user.clear(input);                     // 清空
await user.selectOptions(select, 'option1'); // 选下拉
await user.upload(input, file);              // 上传文件
\`\`\`

优先用 \`userEvent\`：它会触发 \`focus → keydown → input → keyup → blur\` 等完整事件链，更真实。\`fireEvent\` 适合"我就要触发一个 click"的场景。

## 67.5 测交互：表单提交

\`\`\`tsx
// src/components/LoginForm.tsx
import { useState } from 'react';

export function LoginForm({ onSubmit }: { onSubmit: (data: { email: string; password: string }) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('邮箱格式错误');
      return;
    }
    if (password.length < 6) {
      setError('密码至少 6 位');
      return;
    }
    setError('');
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>邮箱<input value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label>密码<input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
      {error && <div role="alert">{error}</div>}
      <button type="submit">登录</button>
    </form>
  );
}
\`\`\`

\`\`\`tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('邮箱格式错误显示提示', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('邮箱'), 'not-an-email');
    await user.type(screen.getByLabelText('密码'), 'password123');
    await user.click(screen.getByRole('button', { name: '登录' }));

    expect(screen.getByRole('alert')).toHaveTextContent('邮箱格式错误');
    expect(onSubmit).not.toHaveBeenCalled();  // 没提交
  });

  it('密码太短显示提示', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('邮箱'), 'tom@x.com');
    await user.type(screen.getByLabelText('密码'), '123');
    await user.click(screen.getByRole('button', { name: '登录' }));

    expect(screen.getByRole('alert')).toHaveTextContent('密码至少 6 位');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('校验通过调用 onSubmit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('邮箱'), 'tom@x.com');
    await user.type(screen.getByLabelText('密码'), 'password123');
    await user.click(screen.getByRole('button', { name: '登录' }));

    expect(screen.queryByRole('alert')).toBeNull();  // 没错误提示
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'tom@x.com',
      password: 'password123',
    });
  });
});
\`\`\`

\`queryByRole\` 返回 null 用于断言"不存在"。用户表单交互流程："输入 → 点击 → 验证"。

## 67.6 测异步：useEffect + fetch

\`\`\`tsx
// src/components/UserProfile.tsx
import { useEffect, useState } from 'react';

export function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(\`/api/users/\${userId}\`)
      .then(r => {
        if (!r.ok) throw new Error('网络错误');
        return r.json();
      })
      .then(data => { if (!cancelled) { setUser(data); setError(''); }})
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId]);

  if (loading) return <div>加载中...</div>;
  if (error) return <div role="alert">{error}</div>;
  return <div>{user?.name}</div>;
}
\`\`\`

\`\`\`tsx
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserProfile } from './UserProfile';

// mock 全局 fetch
afterEach(() => vi.restoreAllMocks());

describe('UserProfile', () => {
  it('加载中 → 显示用户名', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ name: 'Tom' }),
    } as Response);

    render(<UserProfile userId={1} />);

    // 阶段 1：loading
    expect(screen.getByText('加载中...')).toBeInTheDocument();

    // 阶段 2：异步等待用户名出现
    expect(await screen.findByText('Tom')).toBeInTheDocument();
    expect(screen.queryByText('加载中...')).toBeNull();

    // 验证 fetch 调用
    expect(fetch).toHaveBeenCalledWith('/api/users/1');
  });

  it('请求失败 → 显示错误', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    render(<UserProfile userId={1} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('网络错误');
  });

  it('fetch 抛异常 → 显示错误', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('连接超时'));

    render(<UserProfile userId={1} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('连接超时');
  });
});
\`\`\`

异步用 \`findByText\` / \`findByRole\` 自动等元素出现（默认 1000ms）。多阶段用同步 \`getByText\`（必须立刻出现）+ 异步 \`findByX\`（等待）混搭。

## 67.7 测 Context Provider

\`\`\`tsx
// src/contexts/UserContext.tsx
import { createContext, useContext } from 'react';
type UserCtx = { name: string; logout: () => void };
export const UserContext = createContext<UserCtx | null>(null);
export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser 必须在 Provider 内使用');
  return ctx;
};

// src/components/UserBar.tsx
import { useUser } from '../contexts/UserContext';
export function UserBar() {
  const { name, logout } = useUser();
  return (
    <div>
      <span>欢迎，{name}</span>
      <button onClick={logout}>退出</button>
    </div>
  );
}
\`\`\`

\`\`\`tsx
// 测试时手动包 Provider
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserContext } from '../contexts/UserContext';
import { UserBar } from './UserBar';

// 工具函数：包一层 Provider，复用
function renderWithUser(value) {
  return render(
    <UserContext.Provider value={value}>
      <UserBar />
    </UserContext.Provider>
  );
}

describe('UserBar', () => {
  it('显示用户名', () => {
    renderWithUser({ name: 'Tom', logout: () => {} });
    expect(screen.getByText('欢迎，Tom')).toBeInTheDocument();
  });

  it('点击退出调用 logout', async () => {
    const user = userEvent.setup();
    const logout = vi.fn();
    renderWithUser({ name: 'Tom', logout });

    await user.click(screen.getByRole('button', { name: '退出' }));

    expect(logout).toHaveBeenCalledTimes(1);
  });
});
\`\`\`

## 67.8 测路由（react-router）

\`\`\`tsx
import { MemoryRouter, Routes, Route } from 'react-router-dom';

it('点链接跳转', async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </MemoryRouter>
  );

  await user.click(screen.getByRole('link', { name: '关于' }));
  expect(screen.getByText('关于我们')).toBeInTheDocument();
});
\`\`\`

用 \`MemoryRouter\` 而不是 \`BrowserRouter\`：前者历史记录在内存里，不影响真实 URL。

## 67.9 snapshot 快照测试

\`\`\`tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('快照：默认样式', () => {
    const { container } = render(<Button>提交</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('inline 快照', () => {
    const { container } = render(<Button disabled>提交</Button>);
    expect(container.firstChild).toMatchInlineSnapshot();
  });
});
\`\`\`

第一次跑会生成 \`.snap\` 文件，下次跑如果结构变了就报错（防止意外改动 UI）。改了 UI 就跑 \`vitest -u\` 更新快照。

## 67.10 测试覆盖率

\`\`\`bash
# 运行所有测试 + 收集覆盖率
npx vitest run --coverage
\`\`\`

输出每个文件的覆盖率：行、分支、函数、语句。目标：核心逻辑覆盖率 80%+，UI 组件 50%+，整体 70%+。

不要追求 100%——边际场景、错误分支测起来收益低，性价比不高。

## 67.11 测试最佳实践

1. **查 user-facing 文字，不查 className**：用户看到"提交"就查 \`getByRole('button', { name: '提交' })\`，不要查 \`.btn-primary\`
2. **用 \`data-testid\` 是最后手段**：找不到合适的 role / text / label 时才用
3. **不要测实现细节**：测 \`state\` 是 \`5\` 是错的，测屏幕显示 \`5\` 才对
4. **一个 it 一个断言主题**：可以多个 expect，但都要围绕"用户能登录"这种主题
5. **测试名用业务语言**：\`'密码太短时显示错误'\` 比 \`'测试 1'\` 好
6. **mock 在测试边界**：mock \`fetch\` 可以，但别 mock 自己的 utils

## 67.12 小结

- RTL 核心：像真实用户一样测，不查 state 只查 DOM
- 查询 API：\`getByRole\`（首选）、\`getByText\`、\`getByLabelText\`、\`getByTestId\`（兜底）
- 变体：\`getBy\` 找不到报错、\`queryBy\` 返回 null、\`findBy\` 异步等待
- 交互用 \`userEvent\`（推荐），\`fireEvent\` 适合单个事件
- 异步用 \`findByText\` 等元素出现，mock fetch 控制 API 返回
- 测 Context / Router 用 Provider / MemoryRouter 包一层
- 覆盖率 70%+ 即可，不追求 100%`,
    code: `// =============================================================
// 第 67 章 demo：React Testing Library（沙箱模拟）
// =============================================================
// 真实项目里 vitest + jsdom 跑组件测试
// 这里模拟 render / screen / userEvent 的核心机制

// ---- 1. 模拟 DOM（极简版） ----
// 真实用 jsdom，这里用一个 JS 对象模拟 DOM 树
let domRoot = null;
let elementIdCounter = 0;

function createElement(tag, props = {}, children = []) {
  return {
    id: ++elementIdCounter,
    tag,
    props: props || {},
    text: '',
    children: Array.isArray(children) ? children : [children],
    parent: null,
  };
}

// 把"React 元素树"渲染成 DOM 树（简化版）
function renderToDOM(element, parent = null) {
  if (element == null || element === false) return null;
  if (typeof element === 'string' || typeof element === 'number') {
    const textNode = createElement('#text', {}, []);
    textNode.text = String(element);
    textNode.parent = parent;
    if (parent) parent.children.push(textNode);
    return textNode;
  }
  if (Array.isArray(element)) {
    return element.map(el => renderToDOM(el, parent));
  }
  const dom = createElement(element.type || 'div', element.props || {}, []);
  dom.text = element.props?.children ? '' : '';
  if (element.props?.children != null) {
    const kids = Array.isArray(element.props.children) ? element.props.children : [element.props.children];
    kids.forEach(k => renderToDOM(k, dom));
  }
  dom.parent = parent;
  if (parent) parent.children.push(dom);
  return dom;
}

// 简化的 React.createElement（不依赖真实 React）
function h(type, props, ...children) {
  return { type, props: props || {}, children: children.flat() };
}

// ---- 2. render / screen 模拟 ----
function render(element) {
  domRoot = createElement('div', { 'data-testid': 'root' }, []);
  renderToDOM(element, domRoot);
  return { container: domRoot };
}

const screen = {
  // 递归遍历 DOM 树找元素
  _query(predicate) {
    const results = [];
    function walk(node) {
      if (!node) return;
      if (predicate(node)) results.push(node);
      node.children.forEach(walk);
    }
    walk(domRoot);
    return results;
  },
  getByText(text) {
    const matches = this._query(n => n.tag === '#text' && n.text.includes(text));
    if (matches.length === 0) throw new Error('找不到文本: ' + text);
    if (matches.length > 1) throw new Error('找到多个文本: ' + text);
    return matches[0].parent;
  },
  getByRole(role, options = {}) {
    const roleMap = { button: 'button', link: 'a' };
    const tag = roleMap[role] || role;
    const matches = this._query(n => n.tag === tag && (!options.name || (n.props.children || n.text || '').includes(options.name)));
    if (matches.length === 0) throw new Error('找不到 role=' + role + (options.name ? ' name=' + options.name : ''));
    return matches[0];
  },
  queryByText(text) {
    const matches = this._query(n => n.tag === '#text' && n.text.includes(text));
    return matches[0]?.parent || null;
  },
  getByTestId(testid) {
    const matches = this._query(n => n.props['data-testid'] === testid);
    if (matches.length === 0) throw new Error('找不到 testid: ' + testid);
    return matches[0];
  },
};

// ---- 3. userEvent 简化版 ----
function userEvent() {
  return {
    async click(element) {
      const onClick = element.props.onClick;
      if (onClick) await onClick({ preventDefault() {} });
    },
    async type(element, text) {
      const onChange = element.props.onChange;
      if (onChange) {
        for (const ch of text) {
          await onChange({ target: { value: (element.props.value || '') + ch } });
        }
      }
    },
  };
}

// ---- 4. expect 扩展（RTL 风格） ----
function expectEl(element) {
  return {
    toBeInTheDocument() {
      if (!element) throw new Error('元素不在文档中');
      return this;
    },
    toHaveTextContent(text) {
      function getText(node) {
        if (!node) return '';
        if (node.tag === '#text') return node.text;
        return node.children.map(getText).join('');
      }
      const actual = getText(element);
      if (!actual.includes(text)) throw new Error('文本不匹配: 期望 ' + text + ' 实际 ' + actual);
      return this;
    },
    toBeNull() {
      if (element != null) throw new Error('期望 null，但找到元素');
      return this;
    },
  };
}

// ---- 5. 被测组件：模拟 Counter ----
// 真实用 React，这里用闭包模拟 useState
function useState(initial) {
  let state = initial;
  const setters = useState._setters || (useState._setters = []);
  const idx = setters.length;
  const setState = (val) => {
    state = typeof val === 'function' ? val(state) : val;
    setters[idx] = state;
  };
  setters.push(state);
  return [state, setState];
}

function Counter({ initial = 0, step = 1 }) {
  const [count, setCount] = useState(initial);
  return h('div', {},
    h('span', { 'data-testid': 'count' }, count),
    h('button', { onClick: () => setCount(c => c + step) }, '加 ' + step),
    h('button', { onClick: () => setCount(c => c - step) }, '减 ' + step),
  );
}

// ---- 6. 运行测试 ----
console.log('=== React Testing Library Demo ===\\n');

let passed = 0, failed = 0;
function it(name, fn) {
  try { fn(); passed++; console.log('  ✓ ' + name); }
  catch (e) { failed++; console.log('  ✗ ' + name + '\\n    → ' + e.message); }
}

it('Counter 显示初始值', () => {
  useState._setters = [];
  render(h(Counter, { initial: 10 }));
  expectEl(screen.getByTestId('count')).toHaveTextContent('10');
});

it('点击 + 按钮 step=1', async () => {
  useState._setters = [];
  const user = userEvent();
  render(h(Counter, { initial: 0, step: 1 }));
  await user.click(screen.getByRole('button', { name: '加 1' }));
  expectEl(screen.getByTestId('count')).toHaveTextContent('1');
});

it('点击 - 按钮 step=2', async () => {
  useState._setters = [];
  const user = userEvent();
  render(h(Counter, { initial: 10, step: 2 }));
  await user.click(screen.getByRole('button', { name: '减 2' }));
  expectEl(screen.getByTestId('count')).toHaveTextContent('8');
});

it('queryByText 找不到返回 null', () => {
  useState._setters = [];
  render(h(Counter, { initial: 0 }));
  const notFound = screen.queryByText('不存在的文本');
  expectEl(notFound).toBeNull();
});

console.log('\\n=== 测试结果 ===');
console.log('通过: ' + passed + ' / 失败: ' + failed);`,
  },

  // =========================================================
  // 第六十八章：E2E 测试（Playwright）
  // =========================================================
  {
    id: "tspro-e2e",
    group: "十一、测试与工程化",
    icon: "🎭",
    title: "E2E 测试（Playwright）",
    content: `# 第六十八章：E2E 测试（Playwright）

## 68.1 单元 / 组件 / E2E 三层测试

测试金字塔从底到顶：

| 层级 | 工具 | 测什么 | 速度 | 数量 |
|------|------|--------|------|------|
| 单元 | Vitest | 函数输入输出 | 极快（毫秒） | 多 |
| 组件 | RTL | 单个组件交互 | 快（百毫秒） | 中 |
| E2E | Playwright | 真浏览器跑完整流程 | 慢（秒） | 少 |

E2E（End-to-End）测试启动一个真实浏览器，访问你的网站，模拟用户点击、输入、跳转。它最接近真实用户体验，但也最慢、最脆弱——所以数量要少。

**E2E 适合测什么**：
- 核心业务流程（登录 → 下单 → 支付 → 订单列表）
- 跨页面跳转
- 第三方集成（OAuth、支付网关的 mock 模式）
- 整体回归（每次发版前跑一遍）

**不适合测什么**：
- 单个组件细节（用 RTL）
- 纯函数逻辑（用 Vitest）
- 视觉细节（像素差异）

## 68.2 安装 Playwright

\`\`\`bash
# 安装 Playwright Test
npm i -D @playwright/test

# 安装浏览器（chromium / firefox / webkit 都装）
npx playwright install

# 装系统依赖（Linux 需要的库）
npx playwright install-deps
\`\`\`

\`\`\`ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',                    // 测试目录
  fullyParallel: true,                // 多个测试并行跑
  forbidOnly: !!process.env.CI,       // CI 上禁用 .only
  retries: process.env.CI ? 2 : 0,    // CI 上失败重试 2 次
  workers: process.env.CI ? 1 : undefined,  // CI 单线程
  reporter: [
    ['html'],                          // HTML 报告
    ['list'],                          // 控制台列表
  ],
  use: {
    baseURL: 'http://localhost:3000',  // 基础 URL
    trace: 'on-first-retry',           // 首次失败时录制 trace
    screenshot: 'only-on-failure',     // 失败时截图
    video: 'retain-on-failure',        // 失败时保留视频
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
\`\`\`

\`webServer\` 配置自动启动开发服务器，跑完测试自动关闭。

## 68.3 第一个 E2E 测试

\`\`\`ts
// e2e/home.spec.ts
import { test, expect } from '@playwright/test';

test('首页显示欢迎信息', async ({ page }) => {
  // 1. 访问页面
  await page.goto('/');

  // 2. 断言标题可见
  await expect(page.getByRole('heading', { name: '欢迎' })).toBeVisible();

  // 3. 断言 URL
  await expect(page).toHaveURL('/');
});
\`\`\`

\`test\` 定义测试，\`page\` 是 Playwright 提供的浏览器页面对象。所有操作都是 \`await\`，因为浏览器操作是异步的。

运行：

\`\`\`bash
npx playwright test              # 跑所有测试
npx playwright test --headed     // 显示浏览器窗口
npx playwright test --ui         // UI 模式（推荐调试用）
npx playwright test home.spec.ts // 跑指定文件
npx playwright test -g "首页"     // 跑名字匹配的测试
\`\`\`

## 68.4 选择器（Locator）

Playwright 推荐 \`getBy\* 系列选择器，和 RTL 类似：

\`\`\`ts
// 通过 role（推荐）
page.getByRole('button', { name: '提交' });
page.getByRole('link', { name: '登录' });
page.getByRole('heading', { name: '欢迎' });
page.getByRole('checkbox', { name: '记住我' });

// 通过文本
page.getByText('登录成功');
page.getByText(/欢迎.+/);

// 通过 label
page.getByLabel('邮箱');
page.getByLabel('密码', { exact: true });

// 通过 placeholder
page.getByPlaceholder('请输入邮箱');

// 通过 testid
page.getByTestId('submit-button');

// CSS（最后手段）
page.locator('.btn-primary');
page.locator('#login-form button[type="submit"]');
page.locator('[data-testid="submit"]');

// 链式（更精确）
page.getByRole('listitem').filter({ hasText: '苹果' });
page.locator('form').getByRole('button');
\`\`\`

**优先级**：role > label/text > placeholder > testid > CSS。能用 role 就别用 CSS。

## 68.5 操作：点击、输入、按键

\`\`\`ts
test('登录流程', async ({ page }) => {
  await page.goto('/login');

  // 填表单
  await page.getByLabel('邮箱').fill('tom@x.com');
  await page.getByLabel('密码').fill('password123');

  // 点击按钮
  await page.getByRole('button', { name: '登录' }).click();

  // 等跳转完成
  await page.waitForURL('/dashboard');

  // 验证欢迎信息
  await expect(page.getByText('欢迎，Tom')).toBeVisible();
});
\`\`\`

\`\`\`ts
// 模拟键盘
await page.keyboard.press('Enter');
await page.keyboard.press('Control+S');
await page.keyboard.type('hello world');

// 模拟鼠标
await page.mouse.click(100, 200);
await page.mouse.move(100, 200);
await page.mouse.down();
await page.mouse.up();

// hover
await page.getByRole('button', { name: '菜单' }).hover();

// 选择下拉
await page.getByLabel('国家').selectOption('cn');
await page.getByLabel('爱好').selectOption(['reading', 'coding']);

// 上传文件
await page.getByLabel('头像').setInputFiles('test/fixtures/avatar.png');

// 多文件
await page.getByLabel('附件').setInputFiles([
  'test/fixtures/file1.pdf',
  'test/fixtures/file2.pdf',
]);

// 复选框
await page.getByLabel('同意').check();
await page.getByLabel('同意').uncheck();
\`\`\`

## 68.6 断言

\`\`\`ts
// 可见性
await expect(page.getByText('成功')).toBeVisible();
await expect(page.getByText('加载中')).toBeHidden();

// 启用 / 禁用
await expect(page.getByRole('button', { name: '提交' })).toBeEnabled();
await expect(page.getByRole('button', { name: '提交' })).toBeDisabled();

// 文本内容
await expect(page.getByRole('heading')).toHaveText('欢迎');
await expect(page.getByRole('heading')).toContainText('欢迎');

// 属性
await expect(page.getByRole('input')).toHaveValue('tom@x.com');
await expect(page.getByRole('button')).toHaveAttribute('aria-busy', 'true');
await expect(page.getByRole('img')).toHaveAttribute('alt', '头像');

// 计数（多个匹配元素）
await expect(page.getByRole('listitem')).toHaveCount(5);

// URL
await expect(page).toHaveURL('/dashboard');
await expect(page).toHaveURL(/\\/users\\/\\d+/);

// 标题
await expect(page).toHaveTitle(/My App/);

// 截图对比（视觉回归）
await expect(page).toHaveScreenshot('home.png');

// class
await expect(page.getByRole('button')).toHaveClass(/primary/);
\`\`\`

所有断言都是 \`await\`：Playwright 会自动重试，直到超时（默认 5s）或断言通过。这就是 E2E 不需要手动 \`waitFor\` 的原因。

## 68.7 等待策略

\`\`\`ts
// ❌ 错误：硬等待
await page.waitForTimeout(5000);  // 不可靠，慢

// ✅ 正确：等元素出现
await page.getByText('加载完成').waitFor();
await expect(page.getByText('加载完成')).toBeVisible();

// 等网络请求完成
await page.waitForResponse(resp => resp.url().includes('/api/users') && resp.status() === 200);

// 等加载状态结束
await page.getByText('加载中...').waitFor({ state: 'hidden' });

// 点击前等元素可用
await page.getByRole('button', { name: '提交' }).click({ timeout: 10000 });

// 等待导航
await Promise.all([
  page.waitForURL('/dashboard'),                       // 等 URL 变化
  page.getByRole('button', { name: '登录' }).click(),   // 触发跳转
]);
\`\`\`

\`Promise.all\` 模式：点击和等跳转并行，避免点击后才开始等导致错过事件。

## 68.8 拦截网络请求（mock API）

\`\`\`ts
test('登录成功跳转 dashboard', async ({ page }) => {
  // 拦截 /api/login 请求，返回假数据
  await page.route('**/api/login', async route => {
    const json = { token: 'fake-token', user: { name: 'Tom' } };
    await route.fulfill({ json });
  });

  await page.route('**/api/users/*', async route => {
    await route.fulfill({ json: { id: 1, name: 'Tom' } });
  });

  await page.goto('/login');
  await page.getByLabel('邮箱').fill('tom@x.com');
  await page.getByLabel('密码').fill('any');
  await page.getByRole('button', { name: '登录' }).click();

  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByText('欢迎，Tom')).toBeVisible();
});

test('网络错误重试', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/data', async route => {
    calls++;
    if (calls < 2) {
      await route.abort();  // 第一次失败
    } else {
      await route.fulfill({ json: { data: 'hello' } });  // 第二次成功
    }
  });

  await page.goto('/');
  await expect(page.getByText('hello')).toBeVisible();
});
\`\`\`

\`page.route\` 拦截所有匹配的请求，\`fulfill\` 返回假数据，\`abort\` 模拟网络错误。

## 68.9 多浏览器 / 多设备测试

\`\`\`ts
// playwright.config.ts 的 projects 数组
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },
  {
    name: 'mobile-chrome',
    use: { ...devices['Pixel 7'] },
  },
  {
    name: 'mobile-safari',
    use: { ...devices['iPhone 14'] },
  },
],
\`\`\`

每个 project 独立跑一份所有测试。可用 \`testProject\` 限定某些测试只在特定浏览器跑：

\`\`\`ts
test('Safari 特定 bug', async ({ page, browserName }) => {
  test.skip(browserName !== 'webkit', '只在 Safari 跑');
  // ...
});
\`\`\`

## 68.10 测试组织：Page Object 模式

E2E 测试代码会很长，把"页面操作"封装成 Page Object 提高复用：

\`\`\`ts
// e2e/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('邮箱');
    this.passwordInput = page.getByLabel('密码');
    this.submitButton = page.getByRole('button', { name: '登录' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(message: string) {
    await expect(this.errorMessage).toHaveText(message);
  }
}
\`\`\`

\`\`\`ts
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('登录成功', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('tom@x.com', 'password123');
  await expect(page).toHaveURL('/dashboard');
});

test('邮箱格式错误', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('not-an-email', 'password123');
  await loginPage.expectError('邮箱格式错误');
});
\`\`\`

UI 改了（如改了按钮文案），只改 Page Object 一个地方。

## 68.11 测试夹具（fixtures）

\`\`\`ts
// e2e/fixtures.ts
import { test as base } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

// 扩展 test，注入登录过的 page
export const test = base.extend<{ loggedInPage: Page }>({
  loggedInPage: async ({ page }, use) => {
    // 前置：登录
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('tom@x.com', 'password123');
    await page.waitForURL('/dashboard');

    // 把登录后的 page 交给测试用
    await use(page);

    // 后置：清理（可选）
  },
});

// e2e/profile.spec.ts
import { test, expect } from './fixtures';

test('查看个人资料', async ({ loggedInPage }) => {
  await loggedInPage.getByRole('link', { name: '个人资料' }).click();
  await expect(loggedInPage.getByText('Tom')).toBeVisible();
});
\`\`\`

Fixture 让"先登录再操作"变成一行 \`test('xxx', ({ loggedInPage }) => {})\`。

## 68.12 调试技巧

\`\`\`bash
# UI 模式：弹出 Playwright Inspector，可视化选元素、看 trace
npx playwright test --ui

# 调试模式：步进、看每步的 DOM 快照
npx playwright test --debug

# 显示浏览器跑
npx playwright test --headed

# 慢动作
npx playwright test --headed --workers=1
\`\`\`

\`\`\`ts
test('调试', async ({ page }) => {
  await page.pause();  // 暂停，弹出 Inspector
});
\`\`\`

失败时自动生成：

- 截图：\`test-results/xxx.png\`
- 视频：\`test-results/xxx.webm\`
- Trace：\`trace.zip\`，用 \`npx playwright show-trace trace.zip\` 打开可视化时间线

## 68.13 最佳实践

1. **少而精**：E2E 跑慢，整个项目 20-50 个核心流程就够
2. **测用户旅程，不测按钮颜色**：测"下单成功"，不测"按钮 hover 颜色"
3. **用 mock API**：不依赖真实后端，避免测试环境不稳定
4. **测试间独立**：每个测试自己准备数据，不依赖另一个测试
5. **稳定选择器**：用 role / label，不依赖 className（容易变）
6. **失败时截图视频**：方便排查
7. **CI 上失败重试 2 次**：偶发性失败（动画、网络）允许重试

## 68.14 小结

- E2E 启真实浏览器跑完整流程，最接近用户
- 选择器优先级：role > label/text > placeholder > testid > CSS
- 操作异步：所有 \`click\` \`fill\` 都是 \`await\`
- 断言自动重试，不需要手动 \`waitFor\`
- 用 \`page.route\` mock API
- Page Object + fixtures 提高复用
- 调试用 \`--ui\` / \`--debug\` / \`page.pause()\``,
    code: `// =============================================================
// 第 68 章 demo：E2E 测试（Playwright 沙箱模拟）
// =============================================================
// 真实项目用 npx playwright test 跑真实浏览器
// 这里模拟 page / locator / expect 的核心机制

// ---- 1. 模拟浏览器 page 对象 ----
// 真实用 Playwright 控制真实浏览器，这里用 JS 对象模拟 DOM
const fakeDOM = {
  url: '/',
  elements: {},
  networkLogs: [],
  interceptedRoutes: {},
};

// 模拟"用户已访问的页面"
const pageHTML = {
  '/': {
    title: '首页',
    html: '<h1>欢迎</h1><nav><a href="/login">登录</a><a href="/products">产品</a></nav>',
  },
  '/login': {
    title: '登录',
    html: '<h1>登录</h1><form><label>邮箱<input id="email" /></label><label>密码<input id="password" type="password" /></label><button id="submit">登录</button><div id="error" role="alert" style="display:none"></div></form>',
  },
  '/dashboard': {
    title: '仪表盘',
    html: '<h1>欢迎，Tom</h1><p>token: fake-token</p>',
  },
};

function fakePage() {
  return {
    // 访问 URL
    async goto(url) {
      fakeDOM.url = url;
      console.log('    [page.goto] ' + url);
      const page = pageHTML[url];
      if (!page) throw new Error('404: ' + url);
      // 解析 HTML，提取元素到 fakeDOM.elements
      const matches = page.html.matchAll(/<(\\w+)(?:\\s+([^>]*))?\\s*(?:id="([^"]+)")?[^>]*>([^<]*)<\\/\\1>/g);
      fakeDOM.elements = {};
      for (const m of matches) {
        const [_, tag, attrs, id, text] = m;
        fakeDOM.elements[id || tag + '-' + Math.random().toString(36).slice(2, 6)] = { tag, text: text || '', value: '' };
      }
      // 简化：直接用 id 索引
      if (url === '/login') {
        fakeDOM.elements = {
          email: { tag: 'input', text: '', value: '' },
          password: { tag: 'input', text: '', value: '' },
          submit: { tag: 'button', text: '登录', disabled: false },
          error: { tag: 'div', text: '', visible: false },
        };
      } else if (url === '/dashboard') {
        fakeDOM.elements = {
          welcome: { tag: 'h1', text: '欢迎，Tom' },
        };
      }
    },
    // 模拟 locator
    getByLabel(text) {
      for (const [id, el] of Object.entries(fakeDOM.elements)) {
        if (text.includes('邮箱') && id === 'email') return makeLocator(id, el);
        if (text.includes('密码') && id === 'password') return makeLocator(id, el);
      }
      throw new Error('找不到 label: ' + text);
    },
    getByRole(role, options = {}) {
      for (const [id, el] of Object.entries(fakeDOM.elements)) {
        if (el.tag === role || (role === 'button' && el.tag === 'button')) {
          if (!options.name || el.text === options.name) return makeLocator(id, el);
        }
      }
      throw new Error('找不到 role=' + role + (options.name ? ' name=' + options.name : ''));
    },
    getByText(text) {
      for (const [id, el] of Object.entries(fakeDOM.elements)) {
        if (el.text && el.text.includes(text)) return makeLocator(id, el);
      }
      throw new Error('找不到文本: ' + text);
    },
    // 拦截网络请求
    async route(pattern, handler) {
      fakeDOM.interceptedRoutes[pattern] = handler;
    },
    async waitForURL(url) {
      // 模拟"等待跳转"——根据拦截的 /api/login 响应决定跳哪
      console.log('    [waitForURL] 等待跳转到 ' + url);
      if (url === '/dashboard' && fakeDOM.elements.email?.value.includes('@')) {
        fakeDOM.url = '/dashboard';
        await this.goto('/dashboard');
      } else if (url === '/dashboard') {
        throw new Error('未跳转：邮箱格式错误');
      }
    },
    waitForResponse() { return Promise.resolve({ status: 200 }); },
    get url() { return fakeDOM.url; },
  };
}

function makeLocator(id, el) {
  return {
    _id: id,
    _el: el,
    async fill(value) {
      el.value = value;
      console.log('    [fill] #' + id + ' = "' + value + '"');
    },
    async click() {
      console.log('    [click] #' + id);
      // 模拟登录按钮点击：调用拦截的 /api/login
      if (id === 'submit') {
        const routeHandler = fakeDOM.interceptedRoutes['**/api/login'];
        if (routeHandler) {
          const email = fakeDOM.elements.email.value;
          if (!email.includes('@')) {
            fakeDOM.elements.error.text = '邮箱格式错误';
            fakeDOM.elements.error.visible = true;
            return;
          }
          // 模拟 route.fulfill
          const route = {
            async fulfill({ json }) {
              fakeDOM._loginResponse = json;
              console.log('    [route.fulfill] 返回 ' + JSON.stringify(json));
            },
          };
          await routeHandler(route);
        }
      }
    },
    async waitFor() { return this; },
  };
}

// ---- 2. expect 断言（异步） ----
async function expectPlaywright(locator, matcher, ...args) {
  if (matcher === 'toBeVisible') {
    if (locator._el?.visible === false) {
      throw new Error('元素不可见: #' + locator._id);
    }
    return;
  }
  if (matcher === 'toHaveText') {
    const expected = args[0];
    if (!locator._el?.text?.includes(expected)) {
      throw new Error('文本不匹配: 期望 "' + expected + '" 实际 "' + (locator._el?.text || '') + '"');
    }
    return;
  }
  if (matcher === 'toHaveURL') {
    if (fakeDOM.url !== args[0]) {
      throw new Error('URL 不匹配: 期望 ' + args[0] + ' 实际 ' + fakeDOM.url);
    }
    return;
  }
}

// ---- 3. 测试运行器 ----
let passed = 0, failed = 0;
async function test(name, fn) {
  console.log('\\n■ ' + name);
  try {
    await fn({ page: fakePage() });
    passed++;
    console.log('  ✓ 通过');
  } catch (e) {
    failed++;
    console.log('  ✗ 失败: ' + e.message);
  }
}

// ---- 4. 运行 E2E 测试场景 ----
console.log('=== Playwright E2E 测试 Demo ===\\n');

test('首页显示欢迎信息', async ({ page }) => {
  await page.goto('/');
  const heading = page.getByText('欢迎');
  await expectPlaywright(heading, 'toBeVisible');
});

test('登录流程：正确邮箱 → 跳转 dashboard', async ({ page }) => {
  // mock /api/login
  await page.route('**/api/login', async (route) => {
    await route.fulfill({ json: { token: 'fake-token', user: { name: 'Tom' } } });
  });

  await page.goto('/login');
  await page.getByLabel('邮箱').fill('tom@x.com');
  await page.getByLabel('密码').fill('password123');
  await page.getByRole('button', { name: '登录' }).click();
  await page.waitForURL('/dashboard');
  await expectPlaywright(page.getByText('欢迎，Tom'), 'toBeVisible');
});

test('登录失败：邮箱格式错误', async ({ page }) => {
  await page.route('**/api/login', async (route) => {
    await route.fulfill({ json: { error: '邮箱格式错误' } });
  });

  await page.goto('/login');
  await page.getByLabel('邮箱').fill('not-an-email');
  await page.getByLabel('密码').fill('password123');
  await page.getByRole('button', { name: '登录' }).click();
  // 应该停留在 /login，不跳转
  if (fakeDOM.url !== '/login') throw new Error('不应该跳转');
});

console.log('\\n=== 测试结果 ===');
console.log('通过: ' + passed + ' / 失败: ' + failed);
console.log('\\n（真实项目用 npx playwright test --ui 可视化跑）');`,
  },

  // =========================================================
  // 第六十九章：Vite 构建工具实战
  // =========================================================
  {
    id: "tspro-vite",
    group: "十一、测试与工程化",
    icon: "⚡",
    title: "Vite 构建工具实战",
    content: `# 第六十九章：Vite 构建工具实战

## 69.1 为什么是 Vite

Webpack 时代，开发时启动慢——把所有模块打包成一个 bundle 才能跑，项目一大要等 30 秒。Vite 反过来：

- **开发时**：不打包，浏览器直接 ESM import，按需加载
- **生产时**：用 Rollup 打包（Tree-shaking、Code Splitting）

启动时间从 30s 降到 300ms。改一个文件只重编译那一个文件，HMR（热更新）毫秒级。

Vite = Vite dev server（开发）+ Rollup（生产打包）。配置文件 \`vite.config.ts\`。

## 69.2 创建项目

\`\`\`bash
# Vite + React + TS 模板
npm create vite@latest my-app -- --template react-ts

# 进目录装依赖
cd my-app
npm install

# 启动开发服务器
npm run dev

# 生产构建
npm run build

# 预览生产包
npm run preview
\`\`\`

项目结构：

\`\`\`
my-app/
├── public/              # 静态资源（原样拷贝）
├── src/
│   ├── App.tsx          # 根组件
│   ├── main.tsx         # 入口文件
│   ├── index.css        # 全局样式
│   └── ...
├── index.html          # HTML 模板（Vite 入口）
├── vite.config.ts      # Vite 配置
├── tsconfig.json
└── package.json
\`\`\`

\`index.html\` 是 Vite 的入口（不是 main.tsx），它通过 \`<script type="module" src="/src/main.tsx">\` 引入 JS。Vite 会处理这个 script 的依赖。

## 69.3 基础配置

\`\`\`ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],   // React 支持：JSX、Fast Refresh
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),  // @ 指向 src
    },
  },
  server: {
    port: 3000,         // 端口
    open: true,         // 启动时打开浏览器
    proxy: {
      // 开发时把 /api 转发到后端
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\\/api/, ''),  // 去掉 /api 前缀
      },
    },
  },
  build: {
    outDir: 'dist',         // 输出目录
    sourcemap: true,        // 生成 sourcemap
    target: 'es2020',       // 编译目标
    chunkSizeWarningLimit: 1000,  // chunk 超过 1000kb 警告
    rollupOptions: {
      output: {
        manualChunks: {
          // 把 react 系列单独打到 vendor
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
        },
      },
    },
  },
});
\`\`\`

\`@vitejs/plugin-react\` 自动启用 Fast Refresh（改组件不丢 state）。开发服务器 \`proxy\` 解决开发时跨域。

## 69.4 路径别名 + TS 配合

\`\`\`ts
// vite.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@components': path.resolve(__dirname, './src/components'),
    '@utils': path.resolve(__dirname, './src/utils'),
  },
}
\`\`\`

\`\`\`json
// tsconfig.json 也要配，否则 TS 不认
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@utils/*": ["./src/utils/*"]
    }
  }
}
\`\`\`

代码里用：

\`\`\`ts
import { Button } from '@components/Button';     // 而不是 '../../../components/Button'
import { formatPrice } from '@utils/format';
\`\`\`

## 69.5 环境变量

\`\`\`bash
# .env            —— 所有环境都加载
VITE_APP_TITLE=我的应用

# .env.development —— dev 模式加载
VITE_API_BASE=http://localhost:8080

# .env.production  —— build 模式加载
VITE_API_BASE=https://api.example.com
\`\`\`

\`\`\`ts
// 代码里访问
const apiBase = import.meta.env.VITE_API_BASE;
const title = import.meta.env.VITE_APP_TITLE;

// 类型定义（vite-env.d.ts）
interface ImportMetaEnv {
  readonly VITE_API_BASE: string;
  readonly VITE_APP_TITLE: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
\`\`\`

只有 \`VITE_\` 开头的变量才会暴露给前端代码。其他变量（如数据库密码）只在 \`process.env\` 里，前端拿不到——避免泄露。

\`\`\`bash
# 跑 dev 加载 .env + .env.development
npm run dev

# 跑 build 加载 .env + .env.production
npm run build

# 指定模式
vite build --mode staging   # 加载 .env.staging
\`\`\`

## 69.6 静态资源处理

\`\`\`tsx
// 1. public 目录：原样拷贝，用绝对路径访问
// public/logo.png → /logo.png
<img src="/logo.png" />

// 2. import 资源：Vite 处理路径，加 hash
import logo from './assets/logo.png';
<img src={logo} />  // → /assets/logo.a1b2c3.png

// 3. 动态 import（运行时决定）
const imgUrl = new URL('./assets/avatar.png', import.meta.url).href;

// 4. SVG as Component（用 vite-plugin-svgr）
import { ReactComponent as Logo } from './logo.svg';
<Logo width={100} />

// 5. CSS / CSS Modules
import './style.css';                  // 全局
import styles from './Button.module.css';  // CSS Modules
<button className={styles.btn}>...</button>

// 6. JSON 直接 import
import data from './data.json';
\`\`\`

小资源（< 4kb）转 base64 内联，大资源保留文件加 hash。配置：

\`\`\`ts
build: {
  assetsInlineLimit: 4096,  // 小于 4kb 内联
}
\`\`\`

## 69.7 常用插件

\`\`\`ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import mkcert from 'vite-plugin-mkcert';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    svgr(),                          // SVG as Component
    mkcert(),                        // 自动生成 https 证书（开发用）
    visualizer({ open: true }),      // 打包体积可视化
    VitePWA({                        // PWA 支持
      registerType: 'autoUpdate',
      manifest: { name: 'My App', theme_color: '#3b82f6' },
    }),
  ],
});
\`\`\`

常用插件：

- \`@vitejs/plugin-react\`：React + Fast Refresh
- \`@vitejs/plugin-vue\`：Vue 支持
- \`vite-plugin-svgr\`：SVG 当 React 组件
- \`vite-plugin-mkcert\`：开发 https
- \`rollup-plugin-visualizer\`：打包分析
- \`vite-plugin-pwa\`：PWA 支持
- \`unplugin-auto-import\`：自动 import（不用写 \`import React from 'react'\`）
- \`unplugin-vue-components\` / \`unplugin-react-components\`：自动注册组件

## 69.8 HMR 热更新机制

Vite HMR 比 Webpack 快，因为：

1. 不重新打包，只通知"这个模块变了"
2. 接受方模块重新执行，更新自身
3. React Fast Refresh 保留组件 state

\`\`\`ts
// 模块自己声明 HMR 处理（少用，框架已封装）
if (import.meta.hot) {
  import.meta.hot.accept('./module', (newModule) => {
    // 这个模块更新了，newModule 是新版本
  });

  import.meta.hot.dispose(() => {
    // 模块被替换前清理（清定时器、解绑事件）
  });
}
\`\`\`

日常不用写，React / Vue 插件已经处理了。改 \`App.tsx\` 后浏览器立刻更新，state 不丢。

## 69.9 代码分割（Code Splitting）

Vite 用动态 \`import()\` 自动分割：

\`\`\`ts
// 静态 import：打到主 bundle
import Home from './pages/Home';

// 动态 import：单独 chunk，按需加载
const About = lazy(() => import('./pages/About'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// 路由级别分割（最常用）
const routes = [
  { path: '/', element: <Home /> },
  { path: '/about', element: <Suspense><About /></Suspense> },
  { path: '/dashboard', element: <Suspense><Dashboard /></Suspense> },
];
\`\`\`

访问 \`/about\` 时才下载 \`About.js\`。首屏只下载 \`Home.js\`，加载快。

\`\`\`ts
// 手动分包（vite.config.ts）
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom'],
        'router-vendor': ['react-router-dom'],
        'query-vendor': ['@tanstack/react-query'],
      },
    },
  },
}
\`\`\`

把稳定的大依赖单独打包，利用浏览器缓存——发版后用户不用重新下载 react。

## 69.10 Tree Shaking

Vite（Rollup）会自动移除没用的代码：

\`\`\`ts
// utils.ts
export function used() { console.log('used'); }
export function unused() { console.log('never imported'); }

// app.ts
import { used } from './utils';
used();
// 打包后只有 used，没有 unused
\`\`\`

但要注意副作用：

\`\`\`ts
// side-effect.ts
export const a = 1;
window.__myLib = 'something';  // 副作用！Rollup 不敢删

// package.json 标记无副作用
{
  "name": "my-lib",
  "sideEffects": false  // 整个包没副作用，放心删
}
\`\`\`

\`\`\`ts
// 只对特定文件保留副作用
{
  "sideEffects": ["./src/polyfill.js", "*.css"]
}
\`\`\`

## 69.11 CSS 处理

\`\`\`ts
// 1. CSS 文件
import './global.css';

// 2. CSS Modules（xxx.module.css）
import styles from './Button.module.css';
<button className={styles.primary}>  // → button_primary_xxx

// 3. SCSS / Sass（要装 sass）
npm i -D sass
import './style.scss';

// 4. PostCSS（自动加前缀等）
// postcss.config.js
export default {
  plugins: {
    autoprefixer: {},
    'postcss-preset-env': {},
  },
};

// 5. CSS-in-JS：直接装 emotion / styled-components
import { css } from '@emotion/react';
const style = css\`color: red;\`;
\`\`\`

## 69.12 多页面应用

\`\`\`ts
// vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),         // 主页
        admin: resolve(__dirname, 'admin/index.html'),   // 管理后台
        landing: resolve(__dirname, 'landing/index.html'),
      },
    },
  },
});
\`\`\`

每个 HTML 是一个独立入口，独立打包。

## 69.13 SSR / SSG

\`\`\`ts
// vite.config.ts
export default defineConfig({
  ssr: {
    noExternal: ['some-ssr-lib'],  // 这个库不外置，参与打包
  },
});

// 服务端入口
import { renderToString } from 'react-dom/server';
import express from 'express';
const app = express();

app.get('*', (req, res) => {
  const html = renderToString(<App url={req.url} />);
  res.send(\`<!DOCTYPE html><div id="root">\${html}</div>\`);
});
\`\`\`

Vite 提供 \`viteSSR\` 帮你做 React SSR。完整框架直接用 Next.js（第 70 章）。

## 69.14 部署

\`\`\`bash
# 构建
npm run build

# 输出在 dist/
# 静态部署：Nginx / Vercel / Netlify / GitHub Pages
\`\`\`

\`\`\`nginx
# Nginx 配置
server {
  listen 80;
  root /var/www/my-app/dist;

  location / {
    try_files $uri $uri/ /index.html;  # SPA fallback
  }

  # 静态资源长缓存
  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
\`\`\`

\`try_files ... /index.html\` 让 React Router 的 history 模式正常工作。

## 69.15 性能优化

1. **分包**：vendor 单独打包，利用缓存
2. **路由懒加载**：每个路由单独 chunk
3. **图片优化**：用 webp 格式、压缩、响应式 \`srcset\`
4. **预加载**：\`<link rel="modulepreload" href="...">\` 关键 chunk
5. **gzip / brotli**：服务器开启压缩
6. **CDN**：静态资源放 CDN
7. **按需引入**：\`import { Button } from 'antd'\` 而不是 \`import antd\`

\`\`\`ts
// vite.config.ts
build: {
  minify: 'esbuild',  // 比 terser 快，但略大
  // 或 'terser' 更激进压缩
  chunkSizeWarningLimit: 1500,
  cssCodeSplit: true,  // CSS 也分包
  reportCompressedSize: true,  // 报告 gzip 后大小
}
\`\`\`

## 69.16 调试技巧

\`\`\`bash
# 显示详细日志
vite --debug

# 清缓存
rm -rf node_modules/.vite

# 分析依赖
npx vite optimize

# 看打包大小
npx vite-bundle-visualizer
\`\`\`

\`\`\`ts
// vite.config.ts 加 debug
export default defineConfig({
  logLevel: 'info',  // 'silent' | 'error' | 'warn' | 'info'
});
\`\`\`

## 69.17 小结

- Vite 开发不打包，生产用 Rollup
- 配置文件 \`vite.config.ts\`：plugins、resolve.alias、server.proxy、build.rollupOptions
- 路径别名：vite.config + tsconfig 双配
- 环境变量 \`VITE_\` 开头暴露给前端
- 代码分割：动态 \`import()\` + \`manualChunks\`
- Tree Shaking：标记 \`sideEffects\`
- 部署：\`npm run build\` → \`dist/\` → 静态服务器`,
    code: `// =============================================================
// 第 69 章 demo：Vite 构建工具（沙箱模拟）
// =============================================================
// 真实项目里 vite 是 CLI 工具，这里用代码演示核心概念

// ---- 1. 模拟 import.meta.env ----
const importMetaEnv = {
  VITE_APP_TITLE: '我的应用',
  VITE_API_BASE: 'http://localhost:8080',
};

// ---- 2. 模拟 alias 解析 ----
const aliasMap = {
  '@': '/src',
  '@components': '/src/components',
  '@utils': '/src/utils',
};

function resolveImport(importPath) {
  // @components/Button → /src/components/Button
  for (const [alias, target] of Object.entries(aliasMap)) {
    if (importPath.startsWith(alias + '/')) {
      return importPath.replace(alias, target);
    }
    if (importPath === alias) return target;
  }
  return importPath;
}

console.log('=== Vite 路径别名解析 ===');
console.log("@/utils →", resolveImport('@/utils'));
console.log("@components/Button →", resolveImport('@components/Button'));
console.log("@utils/format →", resolveImport('@utils/format'));
console.log("react →", resolveImport('react'), '(第三方不动)');

// ---- 3. 模拟环境变量 ----
console.log('\\n=== 环境变量 ===');
console.log('VITE_APP_TITLE:', importMetaEnv.VITE_APP_TITLE);
console.log('VITE_API_BASE:', importMetaEnv.VITE_API_BASE);
console.log('注意：只有 VITE_ 开头的变量才会暴露给前端代码');

// ---- 4. 模拟代码分割 ----
console.log('\\n=== 代码分割（dynamic import）===');

// 模拟一个懒加载模块
const chunks = {
  './pages/Home.js': { default: { type: 'Home', name: 'Home' } },
  './pages/About.js': { default: { type: 'About', name: 'About' } },
  './pages/Dashboard.js': { default: { type: 'Dashboard', name: 'Dashboard' } },
};

const loadedChunks = new Set();

async function lazyImport(path) {
  if (loadedChunks.has(path)) {
    console.log('  [cache] 命中：' + path);
  } else {
    console.log('  [chunk] 下载新 chunk：' + path);
    loadedChunks.add(path);
    // 模拟网络延迟
    await new Promise(r => setTimeout(r, 10));
  }
  return chunks[path].default;
}

async function demoLazyLoad() {
  console.log('\\n--- 用户访问 / ---');
  const Home = await lazyImport('./pages/Home.js');
  console.log('  渲染:', Home.name);

  console.log('\\n--- 用户跳转到 /about ---');
  const About = await lazyImport('./pages/About.js');
  console.log('  渲染:', About.name);

  console.log('\\n--- 用户回到 / ---');
  const Home2 = await lazyImport('./pages/Home.js');
  console.log('  渲染:', Home2.name, '(chunk 已缓存)');
}
await demoLazyLoad();

// ---- 5. 模拟 manualChunks ----
console.log('\\n=== manualChunks 分包策略 ===');

const deps = [
  { name: 'react', size: 4500 },
  { name: 'react-dom', size: 12000 },
  { name: 'react-router-dom', size: 1800 },
  { name: '@tanstack/react-query', size: 2100 },
  { name: 'axios', size: 800 },
  { name: 'lodash', size: 4500 },
  { name: 'app-code', size: 8000 },
];

const chunkStrategy = {
  'react-vendor': ['react', 'react-dom'],
  'router-vendor': ['react-router-dom'],
  'query-vendor': ['@tanstack/react-query'],
  'utils-vendor': ['axios', 'lodash'],
};

const chunks2 = {};
deps.forEach(d => {
  let target = 'app';
  for (const [chunkName, list] of Object.entries(chunkStrategy)) {
    if (list.includes(d.name)) { target = chunkName; break; }
  }
  if (!chunks2[target]) chunks2[target] = { deps: [], totalSize: 0 };
  chunks2[target].deps.push(d.name);
  chunks2[target].totalSize += d.size;
});

Object.entries(chunks2).forEach(([name, info]) => {
  console.log('  ' + name + ' (' + (info.totalSize / 1024).toFixed(1) + ' KB): ' + info.deps.join(', '));
});

console.log('\\n说明：vendor 单独打包，发版后用户复用缓存，不用重新下载 react');

// ---- 6. 模拟 Tree Shaking ----
console.log('\\n=== Tree Shaking ===');

const utilsModule = {
  exports: {
    used: { value: 'I am used', sideEffects: false },
    unused: { value: 'I am unused', sideEffects: false },
    withSideEffect: { value: 'I have side effects', sideEffects: true },
  },
};

function treeShake(imports) {
  const kept = [];
  const removed = [];
  for (const [name, info] of Object.entries(utilsModule.exports)) {
    if (imports.includes(name)) {
      kept.push(name);
    } else if (info.sideEffects) {
      kept.push(name + ' (保留：有副作用)');
    } else {
      removed.push(name);
    }
  }
  return { kept, removed };
}

const result = treeShake(['used']);
console.log('  导出:', Object.keys(utilsModule.exports).join(', '));
console.log('  导入:', ['used'].join(', '));
console.log('  保留:', result.kept.join(', '));
console.log('  移除:', result.removed.join(', '));

// ---- 7. 模拟 build 产物分析 ----
console.log('\\n=== 打包产物 ===');
const buildOutput = [
  { file: 'index.html', size: 0.5 },
  { file: 'assets/index.a1b2.js', size: 8.5 },
  { file: 'assets/react-vendor.c3d4.js', size: 16.5 },
  { file: 'assets/router-vendor.e5f6.js', size: 1.8 },
  { file: 'assets/index.g7h8.css', size: 2.1 },
  { file: 'assets/logo.i9j0.png', size: 4.2 },
];

let totalSize = 0;
buildOutput.forEach(f => {
  console.log('  ' + f.file.padEnd(28) + (f.size + ' KB').padStart(10));
  totalSize += f.size;
});
console.log('  ' + '-'.repeat(38));
console.log('  ' + '总计'.padEnd(28) + (totalSize + ' KB').padStart(10));
console.log('  Gzip 后约 ' + (totalSize * 0.3).toFixed(1) + ' KB');

console.log('\\n说明：实际项目用 npx vite-bundle-visualizer 看可视化分析图');`,
  },

  // =========================================================
  // 第七十章：Next.js 全栈框架
  // =========================================================
  {
    id: "tspro-nextjs",
    group: "十一、测试与工程化",
    icon: "🚀",
    title: "Next.js 全栈框架",
    content: `# 第七十章：Next.js 全栈框架

## 70.1 Next.js 是什么

Vite + React Router 解决了"前端怎么跑"，但还有一堆问题没解决：

- **SEO 差**：纯 SPA 首屏是空 HTML，搜索引擎看不到内容
- **首屏慢**：要等 JS 下载完才渲染，白屏时间长
- **没后端**：API 要单独写 Express / Fastify
- **路由要手写**：自己配 react-router
- **图片优化、字体优化要手做**

Next.js 一站式解决：

- 路由：文件即路由（\`app/about/page.tsx\` → \`/about\`）
- 渲染：SSR（服务端渲染）/ SSG（静态生成）/ ISR（增量静态再生成）
- API：\`app/api/route.ts\` 直接写后端
- 优化：图片、字体、脚本自动优化
- 部署：Vercel 一键上线

Next.js 14+ 默认 App Router（基于 React Server Components）。

## 70.2 创建项目

\`\`\`bash
npx create-next-app@latest my-app --typescript --app --tailwind --eslint

# 选项：
# TypeScript: Yes
# ESLint: Yes
# Tailwind CSS: Yes
# src/ directory: Yes (推荐)
# App Router: Yes (必选)
# Import alias: @/* (推荐)
\`\`\`

项目结构：

\`\`\`
my-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # 根布局（包所有页面）
│   │   ├── page.tsx         # 首页（/）
│   │   ├── globals.css     # 全局样式
│   │   ├── about/
│   │   │   └── page.tsx     # /about
│   │   ├── blog/
│   │   │   ├── page.tsx     # /blog
│   │   │   └── [slug]/
│   │   │       └── page.tsx # /blog/:slug（动态路由）
│   │   └── api/
│   │       └── users/
│   │           └── route.ts # /api/users
│   ├── components/
│   └── lib/
├── public/
├── next.config.js
└── package.json
\`\`\`

## 70.3 文件即路由

\`\`\`tsx
// app/page.tsx → /
export default function Home() {
  return <h1>首页</h1>;
}

// app/about/page.tsx → /about
export default function About() {
  return <h1>关于我们</h1>;
}

// app/blog/[slug]/page.tsx → /blog/hello-world
export default function BlogPost({ params }: { params: { slug: string } }) {
  return <h1>文章：{params.slug}</h1>;
}

// app/blog/[...slug]/page.tsx → /blog/2024/01/hello（catch-all）
export default function CatchAll({ params }: { params: { slug: string[] } }) {
  return <h1>路径：{params.slug.join('/')}</h1>;
}

// app/shop/[[...slug]]/page.tsx → /shop 或 /shop/a/b/c（可选 catch-all）
\`\`\`

特殊文件：

- \`page.tsx\`：页面（必须有才能访问）
- \`layout.tsx\`：布局（嵌套，包子页面）
- \`loading.tsx\`：加载态（Suspense 包子页面）
- \`error.tsx\`：错误边界
- \`not-found.tsx\`：404 页
- \`route.ts\`：API 路由
- \`template.tsx\`：和 layout 类似，但每次切换都重新挂载
- \`default.tsx\`：Parallel Routes 默认页

## 70.4 Server Components vs Client Components

App Router 默认所有组件都是 **Server Component**（在服务端渲染，不发 JS 到浏览器）。

\`\`\`tsx
// app/page.tsx —— Server Component（默认）
import { db } from '@/lib/db';

export default async function Home() {
  const users = await db.user.findMany();  // 直接查数据库
  return (
    <ul>
      {users.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}
\`\`\`

Server Component 优势：
- 直接访问数据库、文件系统、私密环境变量
- 不发 JS 到浏览器，包体积小
- SEO 友好（HTML 有内容）

但有局限：
- 不能用 \`useState\` / \`useEffect\` / 事件处理
- 不能用 Browser API（\`window\`、\`localStorage\`）

需要交互就加 \`'use client'\`：

\`\`\`tsx
// app/components/Counter.tsx —— Client Component
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
\`\`\`

**最佳实践**：默认 Server Component，只在需要交互的最小组件加 \`'use client'\`。

\`\`\`tsx
// app/page.tsx —— Server Component
import { db } from '@/lib/db';
import LikeButton from './LikeButton';   // Client Component

export default async function Post({ id }: { id: string }) {
  const post = await db.post.findUnique({ where: { id } });
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <LikeButton postId={id} />  {/* 嵌入 Client Component */}
    </article>
  );
}
\`\`\`

## 70.5 数据获取

\`\`\`tsx
// app/users/page.tsx —— Server Component 直接 fetch
export default async function UsersPage() {
  // 服务端 fetch，可以慢，但用户已经看到 HTML
  const res = await fetch('https://api.example.com/users', {
    next: { revalidate: 60 },  // 缓存 60 秒（ISR）
  });
  const users = await res.json();

  return (
    <ul>
      {users.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}

// 静态生成（构建时跑一次）
export default async function Posts() {
  const res = await fetch('https://api.example.com/posts', {
    cache: 'force-cache',  // 默认行为
  });
  // ...
}

// 每次请求都拿最新
export default async function Profile() {
  const res = await fetch('https://api.example.com/me', {
    cache: 'no-store',  // 不缓存
  });
  // ...
}

// ISR：定期重新生成
export default async function Products() {
  const res = await fetch('https://api.example.com/products', {
    next: { revalidate: 60 },  // 每 60 秒后台重新生成
  });
  // ...
}
\`\`\`

\`\`\`tsx
// 动态路由 + generateStaticParams（SSG 预生成所有路径）
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json());
  return posts.map(p => ({ slug: p.slug }));  // 构建时生成 /blog/post-1, /blog/post-2 ...
}

export default async function Post({ params }: { params: { slug: string } }) {
  const post = await fetch(\`https://api.example.com/posts/\${params.slug}\`).then(r => r.json());
  return <article><h1>{post.title}</h1><p>{post.content}</p></article>;
}
\`\`\`

## 70.6 Layout 布局

\`\`\`tsx
// app/layout.tsx —— 根布局（必须有 <html><body>）
import './globals.css';

export const metadata = {
  title: '我的应用',
  description: 'Next.js 14 全栈',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>
        <header>导航栏</header>
        <main>{children}</main>
        <footer>页脚</footer>
      </body>
    </html>
  );
}

// app/dashboard/layout.tsx —— 嵌套布局
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <aside>侧边栏</aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
\`\`\`

访问 \`/dashboard/users\` 渲染顺序：

\`RootLayout → DashboardLayout → UsersPage\`

布局之间不重新渲染（切换 \`/dashboard/users\` 到 \`/dashboard/settings\` 只重渲染 \`SettingsPage\`）。

## 70.7 Loading / Error / Not Found

\`\`\`tsx
// app/blog/loading.tsx —— 加载态
export default function Loading() {
  return <div>加载中...</div>;
}

// app/blog/error.tsx —— 错误边界（必须是 Client Component）
'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>出错了：{error.message}</h2>
      <button onClick={reset}>重试</button>
    </div>
  );
}

// app/blog/not-found.tsx —— 404
export default function NotFound() {
  return <h1>文章不存在</h1>;
}

// 在页面里手动抛 404
import { notFound } from 'next/navigation';

export default async function Post({ params }) {
  const post = await getPost(params.slug);
  if (!post) notFound();  // 触发 not-found.tsx
  return <article>...</article>;
}
\`\`\`

\`loading.tsx\` 自动用 React Suspense 包裹子页面，加载完直接替换。

## 70.8 API Routes

\`\`\`ts
// app/api/users/route.ts —— GET /api/users
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';

  const users = await db.user.findMany({
    skip: (Number(page) - 1) * 10,
    take: 10,
  });

  return NextResponse.json({ users, page: Number(page) });
}

// POST /api/users
export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await db.user.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}

// app/api/users/[id]/route.ts
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await db.user.findUnique({ where: { id: params.id } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(user);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await db.user.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
\`\`\`

导出 \`GET / POST / PUT / DELETE / PATCH\` 函数对应 HTTP 方法。

## 70.9 路由跳转

\`\`\`tsx
'use client';
import { useRouter, usePathname, useSearchParams, Link } from 'next/navigation';

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q = searchParams.get('q');

  return (
    <nav>
      {/* Link 自动 prefetch */}
      <Link href="/about" prefetch>关于</Link>
      <Link href={\`/blog/\${slug}\`}>文章</Link>

      <button onClick={() => router.push('/login')}>登录</button>
      <button onClick={() => router.back()}>返回</button>
      <button onClick={() => router.refresh()}>刷新数据</button>

      <p>当前路径：{pathname}</p>
      <p>搜索参数：{q}</p>
    </nav>
  );
}

// Server Component 里用 redirect
import { redirect } from 'next/navigation';

export default async function OldPage() {
  redirect('/new-page');  // 永久跳转
}
\`\`\`

## 70.10 动态渲染 vs 静态渲染

\`\`\`tsx
// 静态：构建时生成 HTML
export default async function Page() {
  const data = await fetch('https://api.example.com/data');
  // ...
}

// 动态：每次请求都重新生成
export const dynamic = 'force-dynamic';  // 强制动态

export default async function Page() {
  const data = await fetch('https://api.example.com/data', { cache: 'no-store' });
  // ...
}

// ISR：定期重新生成
export const revalidate = 60;  // 60 秒

// 其他配置
export const fetchCache = 'force-no-store';
export const preferredRegion = 'auto';
\`\`\`

## 70.11 Server Actions（重点）

Server Actions 让 Client Component 直接调用服务端函数，不用写 API：

\`\`\`tsx
// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

export async function createPost(formData: FormData) {
  const parsed = schema.parse({
    title: formData.get('title'),
    content: formData.get('content'),
  });

  const post = await db.post.create({ data: parsed });
  revalidatePath('/blog');  // 重新生成 /blog 页面
  return post;
}

// app/blog/new/page.tsx
import { createPost } from '@/app/actions';

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" />
      <textarea name="content" />
      <button type="submit">发布</button>
    </form>
  );
}
\`\`\`

Client Component 里用 \`useActionState\` 拿到 loading / error：

\`\`\`tsx
'use client';
import { useActionState } from 'react';
import { createPost } from '@/app/actions';

export default function NewPost() {
  const [state, formAction, isPending] = useActionState(createPost, null);

  return (
    <form action={formAction}>
      <input name="title" />
      {state?.error && <p>{state.error}</p>}
      <button disabled={isPending}>{isPending ? '发布中...' : '发布'}</button>
    </form>
  );
}
\`\`\`

## 70.12 缓存与 revalidate

\`\`\`ts
import { revalidatePath, revalidateTag } from 'next/cache';

// 重新生成某个路径
revalidatePath('/blog');
revalidatePath('/blog/[slug]', 'page');  // 所有动态路由

// 重新生成带 tag 的 fetch
await fetch('https://api.example.com/posts', {
  next: { tags: ['posts'] },
});

revalidateTag('posts');  // 让所有 tag=posts 的 fetch 重新拉
\`\`\`

\`\`\`ts
import { unstable_cache } from 'next/cache';

const cachedFn = unstable_cache(
  async (key: string) => {
    return await db.expensiveQuery(key);
  },
  ['my-tag'],
  { revalidate: 60, tags: ['my-tag'] }
);

// 调用 cachedFn('foo') 会缓存结果
\`\`\`

## 70.13 中间件

\`\`\`ts
// middleware.ts (项目根)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 鉴权
  const token = request.cookies.get('token')?.value;
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 注入 header
  const response = NextResponse.next();
  response.headers.set('x-custom-header', 'hello');
  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/admin/:path*'],
};
\`\`\`

中间件在 Edge Runtime 跑，每个请求都执行。

## 70.14 图片优化

\`\`\`tsx
import Image from 'next/image';

// 自动：转 webp、压缩、响应式 srcset、懒加载、防抖动
<Image
  src="/avatar.png"        // 远程图片要配 next.config.js 的 remotePatterns
  alt="头像"
  width={100}
  height={100}
  placeholder="blur"        // 模糊占位
  priority                   // 优先加载（首屏）
/>

// fill 模式：填满父容器
<div style={{ position: 'relative', width: 300, height: 200 }}>
  <Image src="/cover.jpg" alt="封面" fill style={{ objectFit: 'cover' }} />
</div>
\`\`\`

\`\`\`js
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.example.com' },
    ],
  },
};
\`\`\`

## 70.15 字体优化

\`\`\`tsx
// app/layout.tsx
import { Inter, Noto_Sans_SC } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoSansSC = Noto_Sans_SC({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-noto' });

export default function RootLayout({ children }) {
  return (
    <html className={\`\${inter.variable} \${notoSansSC.variable}\`}>
      <body>{children}</body>
    </html>
  );
}
\`\`\`

字体文件自托管，没有 Google Fonts 的网络请求，加载快。

## 70.16 元数据 SEO

\`\`\`tsx
// app/layout.tsx —— 静态元数据
export const metadata = {
  title: '我的应用',
  description: 'Next.js 14 全栈教程',
  keywords: ['Next.js', 'React', '全栈'],
  openGraph: {
    title: '我的应用',
    description: 'Next.js 14 全栈教程',
    images: ['/og.png'],
  },
  twitter: { card: 'summary_large_image' },
};

// app/blog/[slug]/page.tsx —— 动态元数据
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { images: [post.coverImage] },
  };
}
\`\`\`

## 70.17 部署

**Vercel（首选）**：

\`\`\`bash
# 一行命令部署
npx vercel

# 自动配置：CDN、HTTPS、Edge Functions、图片优化
\`\`\`

**自托管**：

\`\`\`bash
# 构建
npm run build

# 启动 Node 服务器（默认 3000）
npm run start

# 或用 PM2 守护
pm2 start npm --name "my-app" -- start
\`\`\`

\`\`\`dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
\`\`\`

\`\`\`js
// next.config.js 启用 standalone 输出
module.exports = {
  output: 'standalone',
};
\`\`\`

\`standalone\` 输出独立的 Node 服务器，不需要 \`node_modules\`，部署包小。

## 70.18 性能优化清单

1. **Server Component 优先**：减少客户端 JS
2. **代码分割**：动态 \`import()\` 大依赖
3. **图片优化**：用 \`next/image\` 自动 webp / lazy
4. **字体优化**：用 \`next/font\`
5. **预取**：\`<Link prefetch>\` 预取下一页
6. **缓存**：\`fetch\` 的 \`next.revalidate\` 配 ISR
7. **元数据**：用 \`metadata\` API 设 SEO
8. **bundle 分析**：\`@next/bundle-analyzer\`
9. **避免水合错误**：Server / Client 渲染要一致
10. **Edge Runtime**：地理位置敏感用 Edge

## 70.19 小结

- Next.js = 路由 + 渲染 + API + 优化 + 部署 一站式
- App Router：文件即路由，\`app/xxx/page.tsx\` → \`/xxx\`
- Server Component 默认：直接查 DB / 文件，不发 JS
- Client Component：\`'use client'\`，能用 hooks / 事件
- 数据获取：\`fetch\` + \`next.revalidate\` 配 ISR
- Server Actions：\`'use server'\` 函数，直接 form action
- 优化：\`next/image\` / \`next/font\` / \`next/link\` 全套自动
- 部署：Vercel 一键，自托管 \`output: 'standalone'\`

## 全书结语

🎉 恭喜读完《TypeScript + React 全栈精通》70 章！你已完整掌握：

- **TypeScript**：类型系统、泛型、高级类型、工程化
- **React 基础**：组件、Props、事件、JSX
- **React Hooks**：useState 到自定义 Hook
- **React 进阶**：HOC、Render Props、复合组件、性能优化
- **状态管理**：Context、Zustand、React Query
- **路由**：React Router v6 + Next.js App Router
- **表单**：受控/非受控、React Hook Form、Zod
- **样式**：Tailwind、CSS-in-JS、Framer Motion
- **测试**：Vitest、RTL、Playwright
- **工程化**：Vite 构建、Next.js 全栈、SSR/SSG/ISR

每个知识点都配有可运行 demo 和详细注释。把这些用到真实项目里，就是合格的 TypeScript + React 全栈工程师。`,
    code: `// =============================================================
// 第 70 章 demo：Next.js 全栈框架（沙箱模拟）
// =============================================================
// 真实项目用 npx create-next-app 创建，这里模拟核心机制

// ---- 1. 模拟文件路由系统 ----
// Next.js App Router：文件即路由
const fileRoutes = {
  'app/page.tsx': { path: '/', component: 'Home' },
  'app/about/page.tsx': { path: '/about', component: 'About' },
  'app/blog/page.tsx': { path: '/blog', component: 'BlogList' },
  'app/blog/[slug]/page.tsx': { path: '/blog/:slug', component: 'BlogPost', dynamic: true },
  'app/blog/[...slug]/page.tsx': { path: '/blog/:slug*', component: 'CatchAll', catchAll: true },
  'app/dashboard/users/page.tsx': { path: '/dashboard/users', component: 'Users' },
  'app/api/users/route.ts': { path: '/api/users', isApi: true },
  'app/api/users/[id]/route.ts': { path: '/api/users/:id', isApi: true, dynamic: true },
};

console.log('=== Next.js 文件路由系统 ===\\n');
console.log('文件路径'.padEnd(40) + 'URL'.padEnd(25) + '组件');
console.log('-'.repeat(85));
Object.entries(fileRoutes).forEach(([file, route]) => {
  console.log(file.padEnd(40) + route.path.padEnd(25) + (route.component || 'API'));
});

// ---- 2. 模拟路由匹配 ----
function matchRoute(url) {
  for (const [file, route] of Object.entries(fileRoutes)) {
    if (route.dynamic) {
      // 简化匹配：/blog/hello → /blog/:slug
      const pattern = route.path.replace(':slug', '([^/]+)').replace(':slug*', '(.+)');
      const re = new RegExp('^' + pattern + '$');
      const m = url.match(re);
      if (m) return { file, route, params: { slug: m[1] } };
    } else if (route.path === url) {
      return { file, route, params: {} };
    }
  }
  return null;
}

console.log('\\n=== 路由匹配 ===');
console.log('/about →', matchRoute('/about')?.file);
console.log('/blog/hello-world →', matchRoute('/blog/hello-world')?.file);
console.log('/dashboard/users →', matchRoute('/dashboard/users')?.file);
console.log('/non-existent →', matchRoute('/non-existent') || '404');

// ---- 3. 模拟 Server Component / Client Component ----
console.log('\\n=== Server / Client Component ===\\n');

// Server Component：默认，在服务端跑
// - 可以 async，可以 await fetch / db
// - 不能用 useState / onClick
function ServerComponent() {
  return {
    type: 'ServerComponent',
    features: ['async', 'await fetch', 'await db', 'no useState', 'no onClick'],
    shipsJS: false,
    canAccessDB: true,
  };
}

// Client Component：'use client'，在浏览器跑
function ClientComponent() {
  return {
    type: 'ClientComponent',
    features: ['useState', 'useEffect', 'onClick', 'window', 'localStorage'],
    shipsJS: true,
    canAccessDB: false,
  };
}

console.log('Server Component:');
console.log('  ' + JSON.stringify(ServerComponent(), null, 2).replace(/[{}\\[\\]]/g, '').replace(/,/g, '\\n  '));
console.log('\\nClient Component (\\'use client\\'):');
console.log('  ' + JSON.stringify(ClientComponent(), null, 2).replace(/[{}\\[\\]]/g, '').replace(/,/g, '\\n  '));

console.log('\\n最佳实践：默认 Server Component，只在最小组件加 \\'use client\\'');

// ---- 4. 模拟 Server Actions ----
console.log('\\n=== Server Actions ===\\n');

// 'use server' 函数：客户端可以直接 form action={fn}
const serverActions = {
  createPost: async function (formData) {
    const title = formData.get('title');
    const content = formData.get('content');
    if (!title) return { error: '标题不能为空' };
    // 模拟写数据库
    console.log('    [server] 写入数据库:', { title, content: content?.slice(0, 20) + '...' });
    return { success: true, id: Date.now() };
  },
};

// 模拟客户端表单提交
async function submitForm(formData) {
  console.log('  客户端：提交表单 →', Object.fromEntries(formData));
  const result = await serverActions.createPost(formData);
  console.log('  服务端返回:', result);
}

const formData1 = new Map();
formData1.set('title', 'Hello Next.js');
formData1.set('content', 'This is my first post using Server Actions...');
await submitForm(formData1);

const formData2 = new Map();
formData2.set('content', 'No title');
await submitForm(formData2);

// ---- 5. 模拟渲染模式 ----
console.log('\\n=== 渲染模式 ===\\n');

const renderModes = [
  {
    mode: 'SSG (Static Site Generation)',
    when: 'build 时生成 HTML',
    use: '博客、文档站，内容不常变',
    code: 'export const dynamic = "force-static"\\n// 或 fetch(url, { cache: "force-cache" })',
  },
  {
    mode: 'SSR (Server-Side Rendering)',
    when: '每次请求都重新渲染',
    use: '用户个性化页面、实时数据',
    code: 'export const dynamic = "force-dynamic"\\n// 或 fetch(url, { cache: "no-store" })',
  },
  {
    mode: 'ISR (Incremental Static Regeneration)',
    when: '构建时生成 + 定期更新',
    use: '电商商品页、新闻列表',
    code: 'export const revalidate = 60\\n// 或 fetch(url, { next: { revalidate: 60 } })',
  },
  {
    mode: 'CSR (Client-Side Rendering)',
    when: '浏览器渲染',
    use: '后台管理、登录后仪表盘',
    code: "\\"use client\\"\\nuseEffect(() => fetch(url).then(...), [])',
  },
];

renderModes.forEach(m => {
  console.log('■ ' + m.mode);
  console.log('  何时用: ' + m.when);
  console.log('  场景: ' + m.use);
  console.log('  代码: ' + m.code);
  console.log('');
});

// ---- 6. 模拟 Layout 嵌套渲染 ----
console.log('=== Layout 嵌套渲染 ===\\n');

const layoutTree = [
  { path: 'app/layout.tsx', name: 'RootLayout', persists: true },
  { path: 'app/dashboard/layout.tsx', name: 'DashboardLayout', persists: true },
  { path: 'app/dashboard/users/page.tsx', name: 'UsersPage', persists: false },
];

console.log('访问 /dashboard/users 时的渲染顺序：');
console.log('  <RootLayout>');
console.log('    <DashboardLayout>');
console.log('      <UsersPage />');
console.log('    </DashboardLayout>');
console.log('  </RootLayout>');

console.log('\\n切换 /dashboard/users → /dashboard/settings：');
console.log('  ✓ RootLayout 不重渲染');
console.log('  ✓ DashboardLayout 不重渲染');
console.log('  ✗ 只有 SettingsPage 重新渲染');

// ---- 7. 模拟 next/image 优化 ----
console.log('\\n=== next/image 优化 ===\\n');

const imageOptimizations = [
  '自动转 WebP / AVIF 格式',
  '响应式 srcset（不同 dpr 设备加载不同尺寸）',
  '懒加载（默认 loading="lazy"）',
  '防抖动（width + height 留位）',
  '模糊占位（placeholder="blur"）',
  'CDN 分发（Vercel 自动）',
  '远端图片白名单（防 SSRF）',
];

console.log('next/image 自动做：');
imageOptimizations.forEach(o => console.log('  ✓ ' + o));

console.log('\\n使用：<Image src="/cover.jpg" width={800} height={600} alt="封面" priority />');

// ---- 8. 全书总结 ----
console.log('\\n');
console.log('================================================');
console.log('🎉 《TypeScript + React 全栈精通》全书完！');
console.log('================================================');
console.log('共 70 章，覆盖日常开发 100% 知识点：');
console.log('');
console.log('TypeScript（1-26 章）：类型、泛型、工具类型、工程化');
console.log('React 基础（27-34 章）：JSX、组件、Props、事件');
console.log('React Hooks（35-42 章）：全套 Hooks + 自定义 Hook');
console.log('React 进阶（43-48 章）：HOC、Render Props、复合组件');
console.log('React 性能（49-53 章）：memo、Suspense、Error Boundary');
console.log('状态管理（54-59 章）：Context、Zustand、React Query');
console.log('表单样式（60-65 章）：RHF、Zod、Tailwind、Framer');
console.log('测试工程（66-70 章）：Vitest、RTL、Playwright、Vite、Next');
console.log('');
console.log('每个知识点都有详细注释的可运行 demo。');
console.log('把这些用到真实项目里，就是合格的 TS + React 全栈工程师。');`,
  },
];
