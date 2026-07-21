# 第三章 Mantine Form 验证

> 表单是 Web 应用最常见、最复杂的交互场景之一。它涉及状态管理、用户输入校验、错误提示、提交处理、异步流程等多个层面。Mantine 通过 `@mantine/form` 提供了一套完整、灵活、现代化的表单解决方案。本章是全书的重点章节，将系统讲解 Mantine v9 中表单验证的所有核心知识，包括内置验证函数、Schema 验证（Standard Schema 规范）、嵌套与列表表单、状态管理、跨组件共享、异步验证、迁移要点等。

---

## 3.1 @mantine/form 概述

`@mantine/form` 是 Mantine 官方提供的表单管理包，其核心是 `useForm` hook，用于集中管理表单状态、字段验证和提交逻辑。它具有以下特点：

- **零额外依赖**：除了可选的 Schema 验证库（如 Zod、Valibot），`@mantine/form` 自身不依赖任何第三方库。
- **与 @mantine/core 无缝结合**：通过 `getInputProps` 一键将表单状态绑定到 Mantine 的输入组件（`TextInput`、`Select`、`Checkbox` 等）。
- **支持复杂结构**：原生支持嵌套对象、数组的字段路径（Property Paths）操作。
- **完整的状态体系**：内置 `touched`、`dirty`、`submitting`、`validating` 等状态。
- **schema 验证统一**：v9 起，所有基于 Schema 的验证统一为 `schemaResolver`，遵循 [Standard Schema 规范](https://github.com/standard-schema/standard-schema)。

### 安装

```bash
# 安装 @mantine/form（核心表单包）
npm install @mantine/form

# 如果使用 Zod 进行 schema 验证（v9 推荐方式）
# 注意：v9 推荐使用 zod/v4 入口
npm install zod

# 如果使用 Valibot 进行 schema 验证
npm install valibot
```

### v9 的重要变化

v9 之前，Mantine 为不同的 Schema 验证库提供了不同的 resolver：`zodResolver`、`yupResolver`、`valibotResolver` 等。这些 resolver 通常需要单独的包（如 `mantine-form-zod-resolver`）。

v9 起，**所有 resolver 统一为 `schemaResolver`**，它基于 Standard Schema 规范工作。任何实现了 Standard Schema 接口的库（Zod v4+、Valibot 1.x+、ArkType 等）都可以直接通过 `schemaResolver` 接入，无需额外安装 resolver 包。这是 v9 在表单验证领域最重要的破坏性变更，本章 3.6 节将专门讲解。

### 设计哲学

理解 Mantine Form 的设计哲学，有助于我们在不同场景下做出正确的技术选型：

1. **声明式优先**：通过 `initialValues` 声明表单结构，通过 `validate` 声明验证规则，让数据流单向可追踪。相比于命令式的"先取值再校验"模式，声明式更不易出错。

2. **性能优先**：v7 引入的 `mode: 'uncontrolled'` 是这一思想的集中体现。它牺牲了部分"React 哲学"的纯粹性（不再由 React state 单一源驱动），换取大型表单下的渲染性能。对于包含几十个甚至上百个字段的表单（如动态问卷、复杂配置面板），这一优化能带来肉眼可见的流畅度提升。

3. **渐进式复杂度**：从最简单的"邮箱非空验证"，到"跨字段异步验证"，再到"嵌套数组的 schema 验证"，Mantine Form 提供了一条平滑的难度曲线。你不需要一开始就掌握所有 API，可以按需引入。

4. **类型友好**：Mantine Form 在 TypeScript 项目中表现优异，`initialValues` 的类型会自动推导到所有 `getInputProps`、`setFieldValue` 等方法的路径参数中，路径错误会在编译期暴露。

5. **生态融合**：通过 Standard Schema 规范，Mantine Form 不再"绑定"某个特定的验证库，而是与整个 JS 生态的 Schema 验证规范接轨。这意味着你可以根据团队偏好、项目特性自由选择 Zod、Valibot 或 ArkType，而无需更换表单代码。

### 与其他表单库的对比

为了帮助读者建立参照系，下表对比了 Mantine Form 与其他主流 React 表单方案：

| 特性 | Mantine Form | React Hook Form | Formik |
|------|--------------|------------------|--------|
| 学习曲线 | 平缓 | 中等 | 中等 |
| 性能 | 优秀（非受控） | 优秀（非受控） | 一般（受控） |
| 与 UI 库集成 | 原生支持 Mantine | 需要适配 | 需要适配 |
| Schema 验证 | Standard Schema | 任意（需 resolver） | 任意（需手动） |
| TypeScript 体验 | 优秀 | 优秀 | 一般 |
| 包体积 | 较小 | 极小 | 中等 |
| 适合场景 | Mantine 项目 | 通用 React 项目 | 老项目维护 |

如果你的项目已经使用 Mantine 作为 UI 库，那么 `@mantine/form` 几乎是不二之选——它能最大程度地发挥 Mantine 组件的特性（如 `withAsterisk`、`error` prop 自动绑定等），且无需额外的适配层。

---

## 3.2 useForm hook 基础

`useForm` 是 `@mantine/form` 的核心 hook。它接受一个配置对象，返回一个 `form` 实例，该实例包含所有用于表单操作的方法与状态。

### 核心配置项

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `mode` | `'controlled' \| 'uncontrolled'` | 表单模式，v7+ 默认 `'uncontrolled'`，强烈推荐 |
| `initialValues` | `object` | 表单字段的初始值 |
| `validate` | `object \| function \| schemaResolver` | 验证规则 |
| `validateInputOnChange` | `boolean \| string[]` | 输入时是否触发验证 |
| `validateInputOnBlur` | `boolean \| string[]` | 失焦时是否触发验证 |
| `clearInputErrorOnChange` | `boolean` | 值变化时是否清除错误，默认 `true` |
| `onSubmitPreventDefault` | `'always' \| 'never' \| 'validation-failed'` | 是否阻止默认提交行为 |
| `name` | `string` | 表单名称，配合 `createFormActions` 使用 |
| `touchTrigger` | `'change' \| 'focus'` | 触发 touched 状态的时机，默认 `'change'` |

### 非受控模式（uncontrolled）说明

`mode: 'uncontrolled'` 是 v7+ 的默认推荐模式。其核心思想是：每个字段的输入不再通过 React state 驱动，而是由 Mantine 内部维护一个状态快照（通过 `form.key('path')` 生成稳定的 key 来保证字段在重渲染时正确保持状态）。这样可以避免每次输入都触发整个表单树的重渲染，性能更优，特别适合大型表单。

**关键约定**：在非受控模式下，所有使用 `getInputProps` 的字段都必须同时传入 `key={form.key('path')}`，否则在动态字段、重置等场景下会出现状态错乱问题。

### 完整基础示例

下面是一个最基础的表单示例，包含邮箱和同意条款两个字段：

```javascript
import { Button, Checkbox, Group, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

function BasicForm() {
  // useForm：Mantine 的表单管理 hook
  const form = useForm({
    // mode: 'uncontrolled' 是推荐模式
    // 非受控模式下，输入不会触发整个表单的重渲染，性能更好
    // 必须配合 key={form.key('path')} 使用
    mode: 'uncontrolled',

    // initialValues：表单初始值
    // 所有字段的初始值都在这里定义，路径与字段一一对应
    initialValues: {
      email: '',
      termsOfService: false,
    },

    // validate：验证规则对象
    // 每个字段对应一个验证函数
    // 函数接收字段值，返回错误消息（字符串）或 null（验证通过）
    validate: {
      email: (value) => (
        // 正则校验邮箱格式，通过返回 null，失败返回错误消息
        /^\S+@\S+$/.test(value) ? null : 'Invalid email'
      ),
    },
  });

  return (
    // form.onSubmit：处理表单提交
    // 接收一个回调函数，参数是验证通过后的表单值
    // 内部会自动调用 e.preventDefault() 和 form.validate()
    <form onSubmit={form.onSubmit((values) => console.log(values))}>
      <TextInput
        withAsterisk  // 显示必填星号（视觉提示，不影响验证逻辑）
        label="Email"
        placeholder="your@email.com"
        // key={form.key('path')}：非受控模式必须
        // 确保字段在重渲染时状态正确
        key={form.key('email')}
        // getInputProps：获取字段的所有 props（value, onChange, onBlur, error 等）
        // 一行代码完成双向绑定
        {...form.getInputProps('email')}
      />
      <Checkbox
        mt="md"
        label="I agree to sell my privacy"
        key={form.key('termsOfService')}
        // type: 'checkbox'：对于 Checkbox/Switch 组件必须指定
        // 因为它们的 value 是布尔值，需要特殊处理
        {...form.getInputProps('termsOfService', { type: 'checkbox' })}
      />
      <Group justify="flex-end" mt="md">
        <Button type="submit">Submit</Button>
      </Group>
    </form>
  );
}
```

### getInputProps 的 type 选项

`getInputProps` 的第二个参数用于指定字段类型，常见取值：

- 不传：默认文本类型，返回 `value`、`onChange`、`onBlur`、`error` 等
- `{ type: 'checkbox' }`：用于 `Checkbox`、`Switch`，返回 `checked`、`onChange`
- `{ type: 'file' }`：用于文件上传，返回 `onChange`，绑定 `FileList`

---

## 3.3 验证策略详解

Mantine Form 支持三种验证策略：**规则对象**、**函数式验证**、**formRootRule（特殊规则）**。三者可以根据需要组合使用，但 `validate` 字段只能指定一种主体策略（对象或函数），`formRootRule` 是嵌套结构中的特殊规则。

### 3.3.1 规则对象（rules object）

规则对象是最常用的验证策略：`validate` 是一个对象，键是字段路径，值是验证函数。

每个验证函数接收的完整参数：

- **value** – 当前字段的值
- **values** – 所有表单值（可用于跨字段验证，如确认密码）
- **path** – 当前字段路径（字符串，如 `'user.name'`、`'list.0.field'`）
- **signal** – `AbortSignal`（用于取消异步验证，避免请求竞态）

返回值：

- `null` 或 `undefined`：表示验证通过
- 字符串：表示验证失败，字符串作为错误消息
- `Promise<string | null>`：异步验证

```javascript
const form = useForm({
  mode: 'uncontrolled',
  initialValues: {
    name: '',
    email: '',
    age: 0,
    password: '',
    confirmPassword: '',
  },
  validate: {
    // 基础验证：只使用 value 参数
    name: (value) => (
      value.length < 2 ? 'Name must have at least 2 letters' : null
    ),

    // 正则验证：邮箱格式
    email: (value) => (
      /^\S+@\S+$/.test(value) ? null : 'Invalid email'
    ),

    // 数值范围验证：多分支判断
    age: (value) => {
      if (value < 18) return 'You must be at least 18 to register';
      if (value > 150) return 'Age is out of range';
      return null;
    },

    // 跨字段验证：使用第二个参数 values
    // 验证确认密码与密码一致
    confirmPassword: (value, values) => (
      value !== values.password ? 'Passwords did not match' : null
    ),
  },
});
```

### 3.3.2 函数式验证（function-based validation）

当验证逻辑较为复杂，需要一次性访问所有字段、或需要根据全局状态决定验证策略时，可以将 `validate` 设为一个函数。该函数接收完整的 `values` 对象，返回一个错误对象（结构与 `values` 类似，键为字段路径，值为错误消息或 `null`）。

```javascript
// 当验证逻辑复杂，需要访问所有字段时，使用函数式验证
const form = useForm({
  mode: 'uncontrolled',
  initialValues: { name: '', age: undefined },

  // validate 可以是一个函数
  // 接收所有表单值，返回一个错误对象
  validate: (values) => ({
    name: values.name.length < 2 ? 'Too short name' : null,
    age: values.age === undefined ? 'Age is required'
      : values.age < 18 ? 'You must be at least 18' : null,
  }),
});
```

**规则对象 vs 函数式验证**：

- 规则对象：按字段定义，结构清晰，适合独立验证
- 函数式验证：集中处理，适合跨字段、有依赖关系的验证
- 性能上规则对象更优，因为 Mantine 可以只重新执行受影响字段的验证

### 选择建议

对于绝大多数表单，建议按以下优先级选择验证策略：

1. **优先使用规则对象**：对于字段独立、验证逻辑简单的场景（如邮箱格式、必填、长度限制），规则对象最直观、最易维护。
2. **少量跨字段验证使用规则对象的 `values` 参数**：例如确认密码、日期范围等，可以在字段验证函数中通过 `values` 参数访问其他字段，无需切换到函数式验证。
3. **复杂的全表单联动验证使用函数式验证**：当验证逻辑需要同时考虑多个字段的复杂组合关系时（如"A、B、C 三选一"、"如果 A 大于 10 则 B 必填"），函数式验证能更清晰地表达。
4. **Schema 验证用于结构化、可复用的场景**：见 3.6 节，当验证规则需要在前后端共享、或需要更强的类型推导时，Schema 验证是最佳选择。
5. **`formRootRule` 用于嵌套结构的整体约束**：当你需要对数组长度、嵌套对象的"整体性"约束时使用。

### 异步验证的注意事项

当验证函数返回 Promise 时，需要注意以下几点：

1. **竞态处理**：Mantine 内部通过 `signal` 参数（AbortSignal）处理竞态。当用户快速输入触发多次验证时，较早的验证请求会被取消，只保留最后一次的结果。建议在异步验证中检查 `signal.aborted`：

```javascript
validate: {
  username: async (value, values, path, signal) => {
    // 如果上一次请求还未完成，会被 abort
    const response = await fetch('/api/check-username', {
      signal, // 传入 signal，让浏览器自动取消
      body: JSON.stringify({ username: value }),
    });
    if (signal.aborted) return null; // 已被取消，返回 null
    const data = await response.json();
    return data.taken ? '用户名已被使用' : null;
  },
}
```

2. **避免在 onChange 时使用异步验证**：每次按键都触发 API 请求会造成服务端压力和 UX 问题。推荐在 onBlur 时触发异步验证。

3. **防抖优化**：对于必须在 onChange 触发的异步验证（如搜索建议），可以在验证函数内手动实现防抖：

```javascript
username: async (value) => {
  await new Promise((resolve) => setTimeout(resolve, 300)); // 300ms 防抖
  // 配合 signal.aborted，只有最后一次会真正发起请求
  return await checkUsername(value);
}
```

### 3.3.3 formRootRule（特殊规则）

`formRootRule` 是一个特殊的键，用于在嵌套结构（对象/数组）之外，对整个父级对象/数组添加验证规则。例如：要求 `employees` 数组至少有一项、整个嵌套对象满足某种约束等。

```javascript
import { formRootRule, isNotEmpty, useForm } from '@mantine/form';

const form = useForm({
  mode: 'uncontrolled',
  initialValues: {
    employees: [{ name: '', active: false, key: randomId() }],
  },
  validate: {
    employees: {
      // formRootRule：验证整个 employees 数组
      // 此处检查数组非空（防止用户删空所有员工）
      [formRootRule]: isNotEmpty('At least one employee is required'),
      // 验证数组中每个元素的 name 字段
      name: isNotEmpty('Name is required'),
    },
  },
});
```

`formRootRule` 的常见使用场景：

- 数组至少有一项
- 数组总长度上限（如最多 10 个员工）
- 嵌套对象需要满足某些"整体性"约束（如 `startDate < endDate`）

---

## 3.4 验证时机控制

Mantine Form 支持三种验证时机，可以根据用户体验需求灵活组合：

| 时机 | 配置项 | 默认 | 适用场景 |
|------|--------|------|---------|
| **onChange**（输入时） | `validateInputOnChange` | `false` | 用户名唯一性即时反馈、密码强度提示 |
| **onBlur**（失焦时） | `validateInputOnBlur` | `false` | 邮箱格式、必填检查（避免输入中途频繁报错） |
| **onSubmit**（提交时） | （默认行为） | `true` | 综合验证、跨字段验证 |

三种时机的取值都可以是 `boolean`（影响所有字段）或 `string[]`（只影响指定字段，支持 Property Path）。

### onChange（输入时验证）

```javascript
const form = useForm({
  mode: 'uncontrolled',
  // validateInputOnChange：输入时触发验证
  // true - 所有字段都在输入时验证
  // 数组 - 只有指定字段在输入时验证（支持 Property Path）
  validateInputOnChange: true,
  // 或：validateInputOnChange: ['name', 'email', `jobs.${FORM_INDEX}.title`]
});
```

> ⚠️ 注意：onChange 验证会在用户每次按键时触发，对于复杂的验证逻辑（尤其是异步验证）可能导致性能问题或频繁的请求。建议只对简单、即时反馈价值高的字段开启。

### onBlur（失焦时验证）

```javascript
const form = useForm({
  mode: 'uncontrolled',
  // validateInputOnBlur：失焦时触发验证
  // 这是用户体验最好的验证时机之一
  validateInputOnBlur: true,
  // 或：validateInputOnBlur: ['name', 'email']
});
```

### onSubmit（提交时验证，默认）

提交时验证是默认行为，无需额外配置。通过 `form.onSubmit(handler)` 处理：

```javascript
// 默认在提交时验证
// 通过 form.onSubmit 处理
const form = useForm({
  mode: 'uncontrolled',
  // clearInputErrorOnChange：值变化时是否清除错误（默认 true）
  // 即用户修正错误输入时，错误提示立即消失
  clearInputErrorOnChange: true,
});
```

### 实战：组合使用多种验证时机

实际项目中，组合使用多种验证时机能获得最佳的用户体验。下面是一个综合示例：

```javascript
import { useForm } from '@mantine/form';

const form = useForm({
  mode: 'uncontrolled',
  initialValues: {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  },

  // 只在用户名和邮箱字段输入时验证
  // 这样可以让用户在输入过程中看到即时反馈
  // 密码字段不开启 onChange，避免每次按键都报错
  validateInputOnChange: ['username', 'email'],

  // 所有字段在失焦时验证
  // 让用户离开字段时立即知道是否填错
  validateInputOnBlur: true,

  validate: {
    username: (value) => {
      if (!value) return '用户名不能为空';
      if (value.length < 2) return '用户名至少 2 个字符';
      if (value.length > 20) return '用户名最多 20 个字符';
      return null;
    },
    email: (value) =>
      /^\S+@\S+\.\S+$/.test(value) ? null : '请输入有效的邮箱地址',
    password: (value) => {
      if (value.length < 8) return '密码至少 8 个字符';
      if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) return '密码必须包含字母和数字';
      return null;
    },
    confirmPassword: (value, values) =>
      value !== values.password ? '两次输入的密码不一致' : null,
  },
});
```

**验证时机推荐策略**：

1. **必填字段**：`onBlur` + `onSubmit`
2. **格式校验**（邮箱、URL）：`onBlur` + `onSubmit`
3. **即时反馈字段**（用户名可用性）：`onChange`（异步）+ `onBlur`
4. **跨字段验证**（确认密码）：`onChange` + `onSubmit`
5. **复杂业务规则**：仅 `onSubmit`，避免干扰输入过程

---

## 3.5 内置验证函数（Premade validators）

`@mantine/form` 内置了一系列常用的验证函数，无需手写正则和判断逻辑，开箱即用。这些函数都返回一个标准验证函数（接收 `value` 返回 `null` 或错误消息）。

### 内置验证函数列表

| 函数 | 用途 | 示例 |
|------|------|------|
| `isNotEmpty(error?)` | 非空检查（拒绝空字符串、null、undefined） | `isNotEmpty('不能为空')` |
| `isEmail(error?)` | 邮箱格式校验 | `isEmail('邮箱格式不正确')` |
| `matches(regexp, error?)` | 正则匹配 | `matches(/^#([0-9a-f]{3}){1,2}$/, '无效颜色')` |
| `isInRange({min, max}, error?)` | 数值范围 | `isInRange({min: 18, max: 99}, '年龄必须在18-99岁')` |
| `hasLength({min, max} \| number, error?)` | 字符串/数组长度 | `hasLength({min: 2, max: 10}, '长度2-10')` |
| `matchesField(path, error?)` | 与另一字段值相同 | `matchesField('password', '密码不一致')` |
| `isJSONString(error?)` | JSON 字符串校验 | `isJSONString('无效JSON')` |
| `isUrl(options?, error?)` | URL 校验（可配置 protocols） | `isUrl('无效URL')` |
| `isOneOf(values, error?)` | 枚举值检查 | `isOneOf(['admin', 'user'], '无效角色')` |
| `isNotEmptyHTML(error?)` | 非空 HTML 内容（用于富文本） | `isNotEmptyHTML('内容不能为空')` |

### 使用示例

```javascript
import {
  useForm,
  isNotEmpty,
  isEmail,
  isInRange,
  hasLength,
  matches,
  isUrl,
  isOneOf,
  matchesField,
} from '@mantine/form';

const form = useForm({
  mode: 'uncontrolled',
  initialValues: {
    name: '',
    email: '',
    age: 18,
    website: '',
    role: '',
    password: '',
    confirmPassword: '',
    favoriteColor: '',
  },
  validate: {
    // 字符串长度验证：2-10 个字符
    name: hasLength({ min: 2, max: 10 }, 'Name must be 2-10 characters long'),

    // 邮箱格式验证
    email: isEmail('Invalid email'),

    // 数值范围验证：18-99 岁
    age: isInRange({ min: 18, max: 99 }, 'You must be 18-99 years old'),

    // 正则验证：十六进制颜色（如 #fff 或 #ffffff）
    favoriteColor: matches(/^#([0-9a-f]{3}){1,2}$/, 'Enter a valid hex color'),

    // URL 验证（默认允许 http、https、ftp 等协议）
    website: isUrl('Invalid URL'),

    // 枚举验证：必须是预设角色之一
    role: isOneOf(['developer', 'designer', 'manager'], 'Pick a valid role'),

    // 与另一字段匹配：确认密码需与密码一致
    // 参数是另一字段的路径
    confirmPassword: matchesField('password', 'Passwords did not match'),

    // 非空验证
    password: isNotEmpty('Password is required'),
  },
});
```

### isUrl 的 options 参数

`isUrl` 接受一个可选的配置对象，可以限制允许的协议：

```javascript
// 只允许 https
website: isUrl({ protocols: ['https'] }, '仅支持 HTTPS URL'),

// 允许 http 和 https
website: isUrl({ protocols: ['http', 'https'] }, '无效 URL'),
```

### 内置验证函数的组合

内置函数返回的是标准验证函数，因此可以在规则对象中直接使用。如果需要"满足 A 或 B"的组合验证，可以手写一个函数：

```javascript
validate: {
  // 邮箱或手机号皆可
  contact: (value) => {
    if (isEmail()(value) === null) return null;  // 邮箱通过
    if (/^1[3-9]\d{9}$/.test(value)) return null; // 手机号通过
    return '请输入有效的邮箱或手机号';
  },
}
```

---

## 3.6 Schema 验证（v9 重点！）

Schema 验证是 v9 最重要的变化之一。本节将详细讲解 v9 的 `schemaResolver`、Standard Schema 规范、Zod/Valibot 集成、嵌套与列表、异步验证、跨字段验证等。

### 3.6.1 v9 重大变更：Standard Schema 规范

#### v8 及之前的方式

在 v8 中，针对不同的 Schema 验证库，需要使用不同的 resolver，且通常需要安装额外的包：

```javascript
// v8 写法（已废弃）
import { zodResolver } from 'mantine-form-zod-resolver';
import { yupResolver } from 'mantine-form-yup-resolver';
import { valibotResolver } from 'mantine-form-valibot-resolver';
```

这种方式存在几个问题：

1. **包数量多**：每个 Schema 库都需要一个对应的 resolver 包。
2. **维护成本高**：上游 Schema 库升级时，resolver 包需要同步更新。
3. **类型不一致**：不同 resolver 的 API 略有差异，迁移成本高。

#### v9 的解决方案：schemaResolver + Standard Schema

v9 引入了 [Standard Schema](https://github.com/standard-schema/standard-schema) 规范。这是一个由 Zod、Valibot、ArkType 等主流 Schema 验证库共同遵循的标准接口。任何实现了 Standard Schema 规范的 Schema 都可以直接通过 `schemaResolver` 接入 Mantine Form，无需额外安装 resolver 包。

**v9 的核心变化**：

- `zodResolver` → `schemaResolver`
- `yupResolver` → `schemaResolver`（注：Yup 暂未实现 Standard Schema，可通过自定义 resolver 适配）
- `valibotResolver` → `schemaResolver`
- 所有 Schema 验证统一使用 Standard Schema 规范

#### Standard Schema 规范是什么？

[Standard Schema](https://github.com/standard-schema/standard-schema) 是一个由社区驱动的规范，定义了 JS Schema 验证库的统一接口。其核心思想是：任何 Schema 库只要实现 `~standard` 属性（包含 `validate` 方法、`types` 元信息等），就可以被任何支持该规范的工具消费。

这种"接口约定"的好处是显而易见的：

- **工具生态解耦**：表单库、API 框架、CLI 工具等不再需要为每个 Schema 库单独写适配。
- **用户自由选择**：开发者可以根据项目特性选择最合适的 Schema 库（Zod 重特性丰富、Valibot 轻量、ArkType 类型推导极强），而不被工具绑定。
- **未来兼容性**：新的 Schema 库只要实现规范，就能立即被所有支持 Standard Schema 的工具消费。

目前在 Mantine v9 中，以下 Schema 库已验证可用：

| 库 | 版本要求 | 特点 |
|----|----------|------|
| Zod | v3.24+ 或 v4+ | 生态最丰富、特性最全 |
| Valibot | v1.0+ | 模块化设计、tree-shaking 友好 |
| ArkType | v2.0+ | 类型推导最强、性能优秀 |

#### 为什么 v9 推荐使用 Schema 验证？

相比于手写规则对象，Schema 验证有以下优势：

1. **类型自动推导**：在 TypeScript 项目中，Schema 既是运行时验证器，也是类型定义源。通过 `z.infer<typeof schema>` 可以直接获得表单值的类型，无需手写 interface。

2. **前后端共享**：Schema 可以独立于表单存在，在前后端之间共享。例如：前端表单验证和后端 API 参数校验使用同一个 Zod schema，确保验证规则一致。

3. **错误消息集中管理**：Schema 中的错误消息与验证规则一起定义，便于国际化（i18n）和批量修改。

4. **强大的组合能力**：Schema 支持 `.and()`、`.or()`、`.union()`、`.discriminatedUnion()` 等组合操作，可以表达非常复杂的业务规则。

5. **可序列化**：Schema 可以序列化为 JSON Schema 等格式，用于生成文档、API 契约等。

### 3.6.2 使用 Zod 进行验证（v9 推荐方式）

Zod 是 v9 最推荐的 Schema 验证库，特别是 Zod v4 完整实现了 Standard Schema 规范。

```javascript
import { z } from 'zod/v4';
import { useForm, schemaResolver } from '@mantine/form';

// ============ 定义 Zod Schema ============
const schema = z.object({
  // 字符串验证：最少 2 个字符
  name: z.string().min(2, { error: 'Name should have at least 2 letters' }),

  // 邮箱验证（Zod v4 提供了 z.email 顶层 API）
  email: z.email({ error: 'Invalid email' }),

  // 数值验证：最小值 18
  age: z.number().min(18, { error: 'You must be at least 18 to create an account' }),
});

// ============ 使用 schemaResolver ============
const form = useForm({
  mode: 'uncontrolled',
  initialValues: { name: '', email: '', age: 16 },

  // schemaResolver：将 Zod schema 转换为 Mantine Form 验证器
  // { sync: true } 表示同步验证（Zod 支持同步模式）
  // 传 sync 后 form.validate() 返回同步结果
  validate: schemaResolver(schema, { sync: true }),
});

// 验证后错误格式：
// form.errors
// -> {
//   name: 'Name should have at least 2 letters',
//   email: 'Invalid email',
//   age: 'You must be at least 18 to create an account'
// }
```

**关于 Zod v4 的导入路径**：v9 推荐使用 `zod/v4` 入口（即 `import { z } from 'zod/v4'`），这是 Zod 的新版本入口，完整支持 Standard Schema 规范和新的错误格式（`{ error: '...' }`）。

### 3.6.3 嵌套字段验证

Schema 可以定义嵌套对象，Mantine Form 会自动将嵌套错误信息"扁平化"为点号路径（Property Path），方便绑定到对应字段。

```javascript
import { z } from 'zod/v4';
import { useForm, schemaResolver } from '@mantine/form';

// 嵌套对象的 schema
const nestedSchema = z.object({
  nested: z.object({
    field: z.string().min(2, { error: 'Field should have at least 2 letters' }),
  }),
});

const form = useForm({
  mode: 'uncontrolled',
  initialValues: { nested: { field: '' } },
  validate: schemaResolver(nestedSchema, { sync: true }),
});

// 验证后错误格式（使用点号路径）：
// form.errors
// -> { 'nested.field': 'Field should have at least 2 letters' }

// 在组件中使用：
// <TextInput
//   key={form.key('nested.field')}
//   {...form.getInputProps('nested.field')}
// />
```

### 3.6.4 列表字段验证

数组字段的错误路径会包含索引，格式为 `'list.index.field'`。

```javascript
import { z } from 'zod/v4';
import { useForm, schemaResolver } from '@mantine/form';

// 数组的 schema
const listSchema = z.object({
  list: z.array(
    z.object({
      name: z.string().min(2, { error: 'Name should have at least 2 letters' }),
    })
  ),
});

const form = useForm({
  mode: 'uncontrolled',
  initialValues: { list: [{ name: '' }] },
  validate: schemaResolver(listSchema, { sync: true }),
});

// 验证后错误格式（使用索引路径）：
// form.errors
// -> { 'list.0.name': 'Name should have at least 2 letters' }

// 在组件中渲染列表时使用：
// {form.values.list.map((item, index) => (
//   <TextInput
//     key={item.key}
//     {...form.getInputProps(`list.${index}.name`)}
//   />
// ))}
```

### 3.6.5 异步验证

Schema 验证同样支持异步操作，例如检查邮箱是否已被注册、用户名是否可用等。在 Zod 中，可以使用 `refine` + `async` 函数实现。

```javascript
import { z } from 'zod/v4';
import { useForm, schemaResolver } from '@mantine/form';

// 使用 refine 进行异步验证（如检查邮箱是否已被使用）
const schema = z
  .object({
    email: z.email({ error: 'Invalid email' }),
  })
  // refine：在对象层面添加自定义验证
  // 可以是异步的（返回 Promise<boolean>）
  .refine(
    async (data) => {
      // 模拟 API 调用：检查邮箱是否已存在
      const isTaken = await checkEmailExists(data.email);
      return !isTaken;
    },
    { error: 'Email is already taken', path: ['email'] }
  );

const form = useForm({
  mode: 'uncontrolled',
  initialValues: { email: '' },
  // 注意：异步验证不传 { sync: true }
  validate: schemaResolver(schema),
});

// 异步验证时，form.validate() 返回 Promise
await form.validate();
```

**异步验证注意事项**：

1. Schema 中只要包含任何异步操作（`refine` 的回调返回 Promise），就不能使用 `sync: true`。
2. 异步验证期间，`form.validating` 状态会变为 `true`，可用于 UI 反馈。
3. 建议配合 `validateInputOnBlur` 使用，避免每次按键都发起请求。
4. Mantine 内部会通过 AbortSignal 机制取消过期的异步验证，避免请求竞态。

### 3.6.6 跨字段验证（superRefine）

当需要同时添加多条跨字段验证规则，或需要根据多个字段的值生成错误时，使用 `superRefine`。

```javascript
import { z } from 'zod/v4';
import { useForm, schemaResolver } from '@mantine/form';

const schema = z
  .object({
    password: z.string().min(8, '密码至少 8 个字符'),
    confirmPassword: z.string().min(1, '请确认密码'),
    username: z.string().min(2, '用户名至少 2 个字符'),
  })
  // superRefine：同时添加多条跨字段验证规则
  // ctx 是 issue 上下文，可以多次调用 ctx.addIssue
  .superRefine((data, ctx) => {
    // 规则1：两次密码必须一致
    if (data.confirmPassword !== data.password) {
      ctx.addIssue({
        path: ['confirmPassword'],
        code: 'custom',
        message: '两次输入的密码不一致',
      });
    }

    // 规则2：密码不能包含用户名
    if (data.username && data.username.length >= 3 &&
        data.password.toLowerCase().includes(data.username.toLowerCase())) {
      ctx.addIssue({
        path: ['password'],
        code: 'custom',
        message: '密码不能包含用户名',
      });
    }
  });

const form = useForm({
  mode: 'uncontrolled',
  initialValues: { password: '', confirmPassword: '', username: '' },
  validate: schemaResolver(schema),
  validateInputOnBlur: true,
});
```

**refine vs superRefine**：

- `refine`：单条规则，返回 `boolean` 或 `Promise<boolean>`
- `superRefine`：可以一次添加多条规则，灵活控制错误路径

### 3.6.7 使用 Valibot

Valibot 同样完整实现了 Standard Schema 规范，可以无缝接入 `schemaResolver`。

```javascript
import * as v from 'valibot';
import { useForm, schemaResolver } from '@mantine/form';

// Valibot 同样支持 Standard Schema 规范
// 使用 pipe 组合多个验证规则
const schema = v.object({
  email: v.pipe(v.string(), v.email('Invalid email')),
  name: v.pipe(v.string(), v.minLength(2, 'Too short')),
});

const form = useForm({
  mode: 'uncontrolled',
  initialValues: { email: '', name: '' },
  validate: schemaResolver(schema, { sync: true }),
});
```

Valibot 的优势在于其模块化设计和较小的打包体积，适合对包体积敏感的项目。

### 3.6.8 Sync vs Async 模式详解

`schemaResolver` 的第二个参数是 `{ sync: true }`，用于指定验证模式。

#### 同步模式

当 Schema 中**不包含任何异步验证**时（如纯字段验证、`refine` 同步函数），应使用同步模式：

```javascript
// ============ 同步模式 ============
// 当你确定 schema 是同步的（如 Zod、Valibot 的纯字段验证）
// 传 { sync: true }，使验证方法返回同步类型
const syncForm = useForm({
  mode: 'uncontrolled',
  initialValues: { name: '' },
  validate: schemaResolver(schema, { sync: true }),
});

// form.validate() 返回同步结果
const result = syncForm.validate();
console.log(result.hasErrors);
```

#### 异步模式（默认）

当 Schema 中**包含异步验证**时（如 `refine` 异步函数、外部 API 调用），不应传 `sync` 参数：

```javascript
// ============ 异步模式（默认） ============
// 当 schema 包含异步验证（如 refine async）
// 不传 { sync: true }
const asyncForm = useForm({
  mode: 'uncontrolled',
  initialValues: { email: '' },
  validate: schemaResolver(asyncSchema), // 不传 sync
});

// form.validate() 返回 Promise
const asyncResult = await asyncForm.validate();
console.log(asyncResult.hasErrors);
```

#### 如何选择

| 场景 | 模式 | 原因 |
|------|------|------|
| 纯字段验证（字符串长度、邮箱格式等） | `sync: true` | 性能更好，调用更简单 |
| 包含 `refine` 同步函数 | `sync: true` | 同步执行 |
| 包含 `refine` 异步函数 | 异步（默认） | 必须异步 |
| 不确定时 | 异步（默认） | 更安全，向后兼容 |

> ⚠️ 在同步 Schema 上使用异步模式不会有功能问题，但 `form.validate()` 会返回 Promise，调用时需要 `await`。反之，在异步 Schema 上使用 `sync: true` 会导致异步验证无法正常执行。

---

## 3.7 嵌套表单和列表表单

实际业务中，表单数据往往是嵌套的对象或数组（如用户信息包含地址对象、订单包含商品列表）。Mantine Form 通过 Property Paths 机制原生支持嵌套结构。

### 3.7.1 Property Paths

Property Path 是用点号（`.`）分隔的字段路径字符串，用于定位嵌套结构中的任意字段。数组的索引用数字表示。

```javascript
const form = useForm({
  mode: 'uncontrolled',
  initialValues: {
    user: { firstName: 'John', lastName: 'Doe' },
    fruits: [
      { name: 'Banana', available: true },
      { name: 'Orange', available: false },
    ],
    deeply: {
      nested: {
        object: [{ item: 1 }, { item: 2 }],
      },
    },
  },
});

// 所有 handler 都接受 property path
form.getInputProps('user.firstName');                // 嵌套对象字段
form.setFieldValue('fruits.1.name', 'Carrot');       // 数组字段
await form.validateField('deeply.nested.object.0.item'); // 深层嵌套
```

Property Path 支持的语法：

- `'name'`：顶层字段
- `'user.firstName'`：嵌套对象
- `'list.0.name'`：数组第一项的 name 字段
- `'deeply.nested.object.1.item'`：多层嵌套

### 3.7.2 嵌套对象

下面是一个完整的嵌套对象表单示例，包含用户基本信息和地址信息：

```javascript
import { Button, Group, TextInput, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';

function NestedFormDemo() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      // 顶层字段
      name: '',
      email: '',
      // 嵌套对象：地址
      address: {
        street: '',
        city: '',
        zip: '',
      },
    },
    validate: {
      // 顶层字段验证
      name: (value) => value.length < 2 ? '名字至少 2 个字符' : null,
      email: (value) => /^\S+@\S+$/.test(value) ? null : '邮箱格式不正确',
      // 嵌套对象验证：使用嵌套的 validate 对象
      address: {
        street: (value) => value.length < 5 ? '街道地址至少 5 个字符' : null,
        city: (value) => value.length < 2 ? '请输入城市名' : null,
        zip: (value) => /^\d{6}$/.test(value) ? null : '邮编必须是 6 位数字',
      },
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => console.log(values))}>
      <Stack gap="md">
        {/* 顶层字段 */}
        <TextInput
          label="姓名"
          withAsterisk
          key={form.key('name')}
          {...form.getInputProps('name')}
        />
        <TextInput
          label="邮箱"
          withAsterisk
          key={form.key('email')}
          {...form.getInputProps('email')}
        />

        {/* 嵌套对象字段：使用点号路径 */}
        <TextInput
          label="街道"
          withAsterisk
          key={form.key('address.street')}
          {...form.getInputProps('address.street')}
        />
        <TextInput
          label="城市"
          withAsterisk
          key={form.key('address.city')}
          {...form.getInputProps('address.city')}
        />
        <TextInput
          label="邮编"
          withAsterisk
          key={form.key('address.zip')}
          {...form.getInputProps('address.zip')}
        />

        <Group justify="flex-end">
          <Button type="submit">提交</Button>
        </Group>
      </Stack>
    </form>
  );
}
```

### 3.7.3 嵌套数组（List handlers）

对于数组字段，Mantine Form 提供了 4 个专用的 list handler，用于在不破坏 React 状态不可变性的前提下操作数组：

| 方法 | 签名 | 用途 |
|------|------|------|
| `insertListItem` | `(path, item, index?)` | 在指定位置（默认末尾）插入新项 |
| `removeListItem` | `(path, index)` | 移除指定索引的项 |
| `replaceListItem` | `(path, index, item)` | 替换指定索引的项 |
| `reorderListItem` | `(path, { from, to })` | 调整数组项的顺序 |

#### 完整的动态员工列表示例

下面是一个完整的员工管理表单，支持添加、删除、替换、排序员工：

```javascript
import { Button, Checkbox, Group, Stack, TextInput, ActionIcon, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { randomId } from '@mantine/hooks';
import { IconTrash, IconArrowUp, IconArrowDown, IconPlus } from '@tabler/icons-react';

function EmployeesForm() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      // 每个列表项包含一个 key 字段用于 React 列表渲染
      // randomId() 生成唯一 ID，避免使用数组索引作为 key
      employees: [
        { name: '', active: false, key: randomId() },
      ],
    },
    validate: {
      employees: {
        name: (value) => value.length < 2 ? '姓名至少 2 个字符' : null,
      },
    },
  });

  // 添加员工：在末尾插入新项
  const addEmployee = () => {
    form.insertListItem('employees', {
      name: '',
      active: false,
      key: randomId(), // 必须用 randomId 生成唯一 key
    });
  };

  // 删除员工
  const removeEmployee = (index) => {
    form.removeListItem('employees', index);
  };

  // 上移员工
  const moveUp = (index) => {
    if (index === 0) return;
    form.reorderListItem('employees', { from: index, to: index - 1 });
  };

  // 下移员工
  const moveDown = (index) => {
    if (index === form.values.employees.length - 1) return;
    form.reorderListItem('employees', { from: index, to: index + 1 });
  };

  return (
    <form onSubmit={form.onSubmit((values) => console.log(values))}>
      <Stack gap="md">
        <Text size="lg" fw={500}>员工列表</Text>

        {form.values.employees.map((employee, index) => (
          <Group key={employee.key} align="flex-start">
            <TextInput
              placeholder="员工姓名"
              style={{ flex: 1 }}
              key={form.key(`employees.${index}.name`)}
              {...form.getInputProps(`employees.${index}.name`)}
            />
            <Checkbox
              label="在职"
              mt="md"
              key={form.key(`employees.${index}.active`)}
              {...form.getInputProps(`employees.${index}.active`, { type: 'checkbox' })}
            />
            <Group mt="xs">
              <ActionIcon onClick={() => moveUp(index)} disabled={index === 0}>
                <IconArrowUp size={16} />
              </ActionIcon>
              <ActionIcon
                onClick={() => moveDown(index)}
                disabled={index === form.values.employees.length - 1}
              >
                <IconArrowDown size={16} />
              </ActionIcon>
              <ActionIcon color="red" onClick={() => removeEmployee(index)}>
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          </Group>
        ))}

        <Group justify="space-between">
          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={addEmployee}
          >
            添加员工
          </Button>
          <Button type="submit">提交</Button>
        </Group>
      </Stack>
    </form>
  );
}
```

**关键点说明**：

1. **使用 `randomId()` 生成 key**：数组项需要一个稳定的 `key` 字段（注意不是 React 的 `key` prop，而是数据字段），用于在增删改时保持状态正确。在非受控模式下，这尤为重要。
2. **`form.key(path)` 使用动态路径**：渲染数组项时，`form.key` 的参数必须是包含索引的完整路径，如 `employees.${index}.name`。
3. **替换示例**：`form.replaceListItem('employees', 0, { name: '新名字', active: true, key: randomId() })`。

---

## 3.8 表单状态管理

Mantine Form 提供了丰富的状态管理 API，用于跟踪用户交互、表单变更、提交流程等。这些状态是构建良好用户体验的基础。

### Touched 和 Dirty 状态

#### isTouched

`touched` 表示字段是否被"触碰"过（聚焦或修改）。常用于：仅在用户触碰字段后才显示错误提示，避免表单初始加载就一片红色。

```javascript
// isTouched：检查字段是否被聚焦/修改过
form.isTouched();              // 任何字段被 touched
form.isTouched('path');        // 指定字段
form.isTouched(['path1', 'path2']); // 多个字段中任意一个
```

#### isDirty

`dirty` 表示字段值是否与初始值不同。常用于：显示"未保存的更改"提示、控制"保存"按钮的禁用状态。

```javascript
// isDirty：检查字段值是否与初始值不同
form.isDirty();             // 任何字段被修改
form.isDirty('path');       // 指定字段
form.isDirty('nested.field'); // 支持嵌套路径
```

#### 手动设置和重置

```javascript
// 手动设置 touched/dirty
form.setTouched({ 'user.firstName': true });
form.setDirty({ 'user.firstName': true });

// 重置
form.resetTouched();          // 清除所有 touched 状态
form.resetDirty();            // 清除 dirty 状态，保存当前 values 作为新基准
```

`resetDirty()` 的特殊用途：当用户保存表单后，调用 `resetDirty()` 可以将当前值视为新的"初始值"，从而 dirty 状态归零。这在"自动保存"场景中很有用。

### touchTrigger 选项

`touchTrigger` 控制 touched 状态的触发时机：

```javascript
const form = useForm({
  mode: 'uncontrolled',
  initialValues: { a: 1 },
  // 'change'（默认）：值变化或聚焦时 considered touched
  // 'focus'：仅聚焦时 considered touched
  touchTrigger: 'focus',
});
```

**两种模式的区别**：

- `'change'`（默认）：只要值变化（包括通过 `setFieldValue` 编程式修改）就标记为 touched
- `'focus'`：仅当用户实际聚焦字段时才标记为 touched，编程式修改不会触发 touched

### submitting 状态

`submitting` 表示表单是否正在提交中。当 `form.onSubmit` 的回调返回 Promise 时，Mantine 会自动维护这个状态。

```javascript
const form = useForm({ mode: 'uncontrolled', initialValues: { name: 'John' } });

const handleSubmit = async (values) => {
  // form.submitting 在 Promise 执行期间为 true
  // Promise resolve 或 reject 后变为 false
  await asyncSubmit(values); // 3 秒后 resolve
};

return (
  <form onSubmit={form.onSubmit(handleSubmit)}>
    {/* 提交时禁用输入，防止用户继续修改 */}
    <TextInput disabled={form.submitting} {...form.getInputProps('name')} />
    {/* 提交时显示 loading 状态 */}
    <Button type="submit" loading={form.submitting}>Submit</Button>
  </form>
);
```

### validating 状态

`validating` 表示表单是否正在执行异步验证。常用于显示加载指示器。

```javascript
const form = useForm({
  mode: 'uncontrolled',
  initialValues: { username: '' },
  validate: {
    // 异步验证函数：检查用户名是否可用
    username: async (value) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return value === 'admin' ? 'Username is taken' : null;
    },
  },
});

// form.validating：任何异步验证进行时为 true
// form.isValidating(path)：特定字段是否正在验证
// 在组件中可以使用：
// <TextInput
//   rightSection={form.isValidating('username') ? <Loader size="xs" /> : null}
//   {...form.getInputProps('username')}
// />
```

### 完整状态表

| 状态 | 类型 | 说明 |
|------|------|------|
| `form.values` | `object` | 当前表单值 |
| `form.errors` | `object` | 当前所有错误（路径 → 消息） |
| `form.touched` | `object` | 字段是否被触碰过 |
| `form.dirty` | `object` | 字段是否被修改过 |
| `form.submitting` | `boolean` | 是否正在提交 |
| `form.validating` | `boolean` | 是否正在异步验证 |
| `form.initialValues` | `object` | 初始值快照 |
| `form.isValid` | `boolean` | 当前是否无错误（仅对已验证字段） |
| `form.isValidating(path)` | `function` | 指定字段是否正在验证 |
| `form.isTouched(path?)` | `function` | 字段是否被触碰 |
| `form.isDirty(path?)` | `function` | 字段是否被修改 |

### 状态的实战应用

这些状态在实际项目中有着丰富的应用场景：

**场景一：未保存提示**

当用户尝试离开页面时，如果表单有未保存的修改，应弹出确认对话框：

```javascript
function EditForm() {
  const form = useForm({ /* ... */ });

  useEffect(() => {
    const handler = (e) => {
      if (form.isDirty()) {
        e.preventDefault();
        e.returnValue = ''; // Chrome 需要这行
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [form]);

  return <form>...</form>;
}
```

**场景二：保存按钮禁用**

只有当表单有修改且无错误时，才启用保存按钮：

```javascript
<Button
  type="submit"
  disabled={!form.isDirty() || !form.isValid}
>
  保存
</Button>
```

**场景三：仅在 touched 后显示错误**

避免初始加载时所有字段都是红色，只在用户实际操作过字段后才显示错误：

```javascript
<TextInput
  error={form.isTouched('email') ? form.errors.email : null}
  // ...
/>
```

**场景四：自动保存**

监听 `isDirty` 状态，在用户停止操作后自动保存：

```javascript
useEffect(() => {
  if (!form.isDirty()) return;
  const timer = setTimeout(() => {
    autoSave(form.getValues());
    form.resetDirty(); // 保存后清除 dirty 状态
  }, 3000); // 3 秒无操作后自动保存
  return () => clearTimeout(timer);
}, [form.values]);
```

### 性能优化建议

对于大型表单（几十个字段以上），可以采取以下优化措施：

1. **始终使用非受控模式**：避免每次输入触发整个表单的重渲染。
2. **按需开启 onChange 验证**：只对关键字段开启，减少验证开销。
3. **拆分大表单**：使用 `createFormContext` 将表单拆分为多个子组件，每个子组件只关注自己的字段，重渲染范围更小。
4. **避免在 validate 函数中创建对象**：函数式验证每次执行都会返回新对象，对于超大型表单可能造成 GC 压力。
5. **使用 useMemo 缓存 Schema**：对于 Zod schema，确保它定义在组件外部或用 `useMemo` 缓存，避免每次渲染都重新构建：

```javascript
// ✅ Schema 定义在组件外部（推荐）
const schema = z.object({ name: z.string() });

function MyForm() {
  const form = useForm({ validate: schemaResolver(schema) });
}

// 或在组件内使用 useMemo
function MyForm() {
  const schema = useMemo(() => z.object({ name: z.string() }), []);
  const form = useForm({ validate: schemaResolver(schema) });
}
```

---

## 3.9 表单提交处理

`form.onSubmit` 是表单提交的核心方法，它内部完成了以下工作：

1. 调用 `event.preventDefault()`（根据 `onSubmitPreventDefault` 配置）
2. 执行表单验证
3. 验证成功：调用成功回调，传入表单值
4. 验证失败：调用失败回调（如果提供了），传入错误对象、当前值和事件

### 基础用法

```javascript
function Demo() {
  const form = useForm({ mode: 'uncontrolled' });

  // onSubmit 接收两个参数
  // 第一个：验证成功时的回调
  // 第二个：验证失败时的回调（可选）
  const handleSubmit = (values) => {
    console.log('提交成功：', values);
  };

  const handleValidationError = (validationErrors, values, event) => {
    console.log('验证失败：', validationErrors);
    console.log('当前值：', values);
    console.log('事件对象：', event);
    // 可以在这里滚动到第一个错误字段、显示通知等
  };

  return (
    <>
      {/* 只处理成功 */}
      <form onSubmit={form.onSubmit(handleSubmit)} />

      {/* 同时处理成功和失败 */}
      <form
        onSubmit={form.onSubmit(handleSubmit, handleValidationError)}
      />

      {/* form.onReset 调用 form.reset，将表单重置为 initialValues */}
      <form onReset={form.onReset} />
    </>
  );
}
```

### 异步提交

`onSubmit` 的回调可以是异步函数。当返回 Promise 时，`form.submitting` 会自动维护：

```javascript
const handleSubmit = async (values) => {
  try {
    await api.submitForm(values);
    notifications.show({ message: '提交成功', color: 'green' });
    form.reset();
  } catch (error) {
    // 服务端返回的字段错误，可以通过 form.setErrors 设置
    if (error.fieldErrors) {
      form.setErrors(error.fieldErrors);
    }
    notifications.show({ message: '提交失败', color: 'red' });
  }
};
```

### onSubmitPreventDefault 选项

控制 `form.onSubmit` 内部是否调用 `event.preventDefault()`：

```javascript
const form = useForm({
  mode: 'uncontrolled',
  // 'always'（默认）- 总是调用 preventDefault，阻止表单默认提交
  // 'never' - 从不调用，允许浏览器原生提交（一般配合 form action 使用）
  // 'validation-failed' - 仅验证失败时调用，验证成功时允许原生提交
  onSubmitPreventDefault: 'never',
});
```

| 取值 | 行为 |
|------|------|
| `'always'`（默认） | 总是阻止默认提交，所有提交通过 JS 处理 |
| `'never'` | 从不阻止，适合配合原生 form action |
| `'validation-failed'` | 验证失败时阻止（让用户修正），验证成功时让浏览器提交 |

### 常用 form 实例方法

| 方法 | 用途 |
|------|------|
| `form.onSubmit(success, failure?)` | 提交处理 |
| `form.onReset` | 重置处理 |
| `form.validate()` | 触发全表单验证 |
| `form.validateField(path)` | 验证单个字段 |
| `form.setFieldValue(path, value)` | 设置字段值 |
| `form.setValues(values)` | 批量设置值 |
| `form.setErrors(errors)` | 设置错误 |
| `form.clearErrors()` | 清除所有错误 |
| `form.clearFieldError(path)` | 清除指定字段错误 |
| `form.reset()` | 重置表单到 initialValues |
| `form.resetDirty()` | 清除 dirty 状态 |
| `form.resetTouched()` | 清除 touched 状态 |
| `form.getValues()` | 获取当前值（同步） |
| `form.getInputProps(path, options?)` | 获取字段绑定 props |
| `form.key(path)` | 获取字段的稳定 key |

---

## 3.10 动态表单字段

动态字段是表单的常见需求，例如：根据用户选择显示/隐藏某些字段、动态添加/删除列表项。Mantine Form 通过 list handlers 提供了完整的动态字段支持。

### 添加和删除列表项

```javascript
import { useForm } from '@mantine/form';
import { randomId } from '@mantine/hooks';

const form = useForm({
  mode: 'uncontrolled',
  initialValues: {
    // 每个列表项包含一个 key 字段用于 React 列表渲染
    // 这个 key 字段不会被提交，只是为了 React 的 diff 算法工作
    employees: [{ name: '', active: false, key: randomId() }],
  },
});

// 添加：在末尾插入新项
form.insertListItem('employees', {
  name: '',
  active: false,
  key: randomId() // 必须用 randomId 生成唯一 key
});

// 在指定位置插入（如开头）
form.insertListItem('employees', { name: '', active: false, key: randomId() }, 0);

// 删除：移除指定索引的项
form.removeListItem('employees', index);

// 替换：替换指定索引的项
form.replaceListItem('employees', index, { name: 'New', active: true, key: randomId() });

// 交换位置：将索引 1 的项移到索引 0
form.reorderListItem('employees', { from: 1, to: 0 });
```

### 条件显示字段

对于"条件显示"的字段（如选择"其他"时显示输入框），可以在 `initialValues` 中保留所有可能的字段，然后根据条件渲染：

```javascript
import { Select, TextInput } from '@mantine/core';

function ConditionalForm() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      gender: '',
      customGender: '', // 即使不显示也保留在 values 中
    },
    validate: {
      // 条件验证：只有选择"其他"时才验证 customGender
      customGender: (value, values) => {
        if (values.gender !== 'other') return null;
        return value.length < 1 ? '请输入性别' : null;
      },
    },
  });

  return (
    <>
      <Select
        label="性别"
        data={[
          { value: 'male', label: '男' },
          { value: 'female', label: '女' },
          { value: 'other', label: '其他' },
        ]}
        key={form.key('gender')}
        {...form.getInputProps('gender')}
      />
      {/* 条件渲染：仅在选择了"其他"时显示 */}
      {form.getValues().gender === 'other' && (
        <TextInput
          label="自定义性别"
          key={form.key('customGender')}
          {...form.getInputProps('customGender')}
        />
      )}
    </>
  );
}
```

---

## 3.11 Form Context（多组件共享表单状态）

当表单变得复杂时，将所有字段都写在一个组件中会导致组件过大、难以维护。`createFormContext` 允许你将表单实例通过 React Context 在多组件间共享，实现表单的组件化拆分。

### 基础用法

```javascript
import { TextInput } from '@mantine/core';
import { createFormContext } from '@mantine/form';

// ============ 创建 Form Context ============
// createFormContext 返回 [Provider, useContext, useForm] 三元组
// Provider：用于在父组件中提供 form 实例
// useFormContext：用于在子组件中获取 form 实例
// useForm：一个 hook，与原始 useForm 行为一致，但能与 context 配合
const [FormProvider, useFormContext, useForm] = createFormContext();

// ============ 子组件：通过 context 获取 form ============
function ContextField() {
  const form = useFormContext();
  return (
    <TextInput
      label="Your name"
      key={form.key('name')}
      {...form.getInputProps('name')}
    />
  );
}

// ============ 父组件：创建 form 并通过 Provider 共享 ============
function FormDemo() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { name: '' },
  });

  return (
    <FormProvider form={form}>
      <form onSubmit={form.onSubmit(() => {})}>
        <ContextField />
      </form>
    </FormProvider>
  );
}
```

### 完整的拆分示例

```javascript
import { Button, TextInput, Stack } from '@mantine/core';
import { createFormContext } from '@mantine/form';

const [FormProvider, useFormContext, useForm] = createFormContext();

// 基本信息子组件
function BasicInfoFields() {
  const form = useFormContext();
  return (
    <Stack gap="md">
      <TextInput
        label="姓名"
        key={form.key('name')}
        {...form.getInputProps('name')}
      />
      <TextInput
        label="邮箱"
        key={form.key('email')}
        {...form.getInputProps('email')}
      />
    </Stack>
  );
}

// 地址子组件
function AddressFields() {
  const form = useFormContext();
  return (
    <Stack gap="md">
      <TextInput
        label="街道"
        key={form.key('address.street')}
        {...form.getInputProps('address.street')}
      />
      <TextInput
        label="城市"
        key={form.key('address.city')}
        {...form.getInputProps('address.city')}
      />
    </Stack>
  );
}

// 主表单组件
function ComplexForm() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      email: '',
      address: { street: '', city: '' },
    },
    validate: {
      name: (v) => v.length < 2 ? '姓名太短' : null,
      email: (v) => /^\S+@\S+$/.test(v) ? null : '邮箱格式错误',
    },
  });

  return (
    <FormProvider form={form}>
      <form onSubmit={form.onSubmit((values) => console.log(values))}>
        <Stack gap="xl">
          <BasicInfoFields />
          <AddressFields />
          <Button type="submit">提交</Button>
        </Stack>
      </form>
    </FormProvider>
  );
}
```

`createFormContext` 的优势：

1. **类型安全**：在 TypeScript 项目中，所有子组件都能获得正确的 form 类型
2. **避免 prop drilling**：无需将 form 一层层传递
3. **可复用性**：子字段组件可以独立复用、测试

---

## 3.12 Form Actions（从应用任何位置改变表单状态）

`createFormActions` 是一个更高级的特性，它允许你从应用的任何位置（无需通过 props 或 context）操作一个具名表单。这在以下场景中非常有用：

- 全局通知中心点击"跳转到表单字段"
- 顶部工具栏的"重置"按钮
- 路由变化时清空表单

### 使用方式

```javascript
// ============ 在表单组件中 ============
import { useForm } from '@mantine/form';

function Demo() {
  const form = useForm({
    mode: 'uncontrolled',
    name: 'demo-form', // 给表单命名（必须唯一）
    initialValues: { name: '', age: 0 },
  });
  // ...
}

// ============ 在其他文件中创建 actions ============
import { createFormActions } from '@mantine/form';

// createFormActions 接收表单名称
// 返回一个 actions 对象，包含常用 form 方法
export const demoFormActions = createFormActions('demo-form');

// ============ 从应用任何位置调用 ============
// 设置字段值
demoFormActions.setFieldValue('name', 'John');

// 重置表单
demoFormActions.reset();

// 验证表单
demoFormActions.validate();

// 设置错误
demoFormActions.setErrors({ name: 'Error message' });

// 获取当前值
demoFormActions.getValues();
```

### 实际应用示例

```javascript
// formActions.js
import { createFormActions } from '@mantine/form';
export const userFormActions = createFormActions('user-form');

// Toolbar.jsx - 顶部工具栏
import { Button } from '@mantine/core';
import { userFormActions } from './formActions';

function Toolbar() {
  return (
    <Button
      variant="light"
      color="red"
      onClick={() => userFormActions.reset()}
    >
      重置表单
    </Button>
  );
}

// UserForm.jsx - 实际表单
function UserForm() {
  const form = useForm({
    mode: 'uncontrolled',
    name: 'user-form', // 名称必须与 actions 一致
    initialValues: { name: '', age: 0 },
  });
  // ...
}
```

**注意事项**：

1. 表单名称必须全局唯一
2. `createFormActions` 返回的 actions 在表单未挂载时调用是无效的（no-op）
3. 这是一个"逃生舱"特性，不应滥用。优先使用 props 或 context，仅在跨多层组件、跨路由等场景使用

---

## 3.13 实战：完整的注册表单

本节通过一个完整的注册表单示例，整合前面所有知识点：Zod schema 验证、密码强度、异步提交、loading 状态、成功反馈等。

这个示例模拟了一个真实业务中常见的注册场景，包含以下设计考量：

- **使用 Zod schema 而非手写验证**：注册表单的验证规则较多且需要类型推导，Schema 是更合适的选择。
- **密码强度实时反馈**：通过 `form.getValues()` 读取当前密码值，实时计算强度并展示进度条。
- **不同字段采用不同验证时机**：用户名和邮箱需要即时反馈，密码字段则在失焦时验证避免干扰输入。
- **异步提交与状态管理**：使用本地 state 管理 loading 和 success 状态，提交按钮自动显示加载效果。
- **成功反馈与表单切换**：注册成功后切换到 Alert 提示，而不是清空表单，让用户清楚知道操作结果。
- **服务端错误回填**：在 catch 块中演示了如何将服务端返回的字段错误通过 `form.setErrors` 回填到对应字段。

下面是完整代码：

```javascript
import { useState } from 'react';
import {
  Button,
  PasswordInput,
  TextInput,
  Group,
  Stack,
  Alert,
  Progress,
  Code,
} from '@mantine/core';
import { useForm, schemaResolver } from '@mantine/form';
import { z } from 'zod/v4';

// ============ Zod Schema 定义 ============
const registerSchema = z
  .object({
    // 用户名：2-32 字符，只能包含字母、数字、下划线
    username: z.string()
      .min(2, '用户名至少 2 个字符')
      .max(32, '用户名最多 32 个字符')
      .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),

    // 邮箱
    email: z.string()
      .min(1, '邮箱不能为空')
      .email('邮箱格式不正确'),

    // 密码：8-128 字符，必须包含字母和数字
    password: z.string()
      .min(8, '密码至少 8 个字符')
      .max(128, '密码最多 128 个字符')
      .regex(/^(?=.*[a-zA-Z])(?=.*\d).+$/, '密码必须包含字母和数字'),

    // 确认密码
    confirmPassword: z.string()
      .min(1, '请确认密码'),

    // 同意条款：必须是 true
    // Zod v4 写法：z.literal(true, '错误消息')
    agree: z.literal(true, '必须同意服务条款才能注册'),
  })
  // 跨字段验证：两次密码必须一致
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

// ============ 表单组件 ============
function RegisterForm() {
  // 提交状态：本地 state 控制
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agree: false,
    },
    // 使用 Zod schema 验证
    validate: schemaResolver(registerSchema),
    // 输入时验证用户名和邮箱（即时反馈）
    validateInputOnChange: ['username', 'email'],
    // 所有字段失焦时验证
    validateInputOnBlur: true,
  });

  // 提交处理
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('注册成功：', values);
      setSuccess(true);
    } catch (error) {
      console.error('注册失败：', error);
      // 可以将服务端错误通过 form.setErrors 设置
      // form.setErrors({ username: '该用户名已被使用' });
    } finally {
      setLoading(false);
    }
  };

  // 密码强度计算函数
  // 返回 0-100 的强度值
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;     // 基础长度
    if (password.length >= 12) strength += 25;    // 较长密码
    if (/[a-zA-Z]/.test(password) && /\d/.test(password)) strength += 25; // 字母+数字
    if (/[^a-zA-Z0-9]/.test(password)) strength += 25; // 特殊字符
    return strength;
  };

  // 实时计算密码强度
  const passwordStrength = getPasswordStrength(form.getValues().password);

  // 注册成功后的展示
  if (success) {
    return (
      <Alert color="green" variant="light" title="注册成功">
        欢迎加入！您的账号已创建成功。
      </Alert>
    );
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label="用户名"
          placeholder="输入用户名"
          withAsterisk
          key={form.key('username')}
          {...form.getInputProps('username')}
        />

        <TextInput
          label="邮箱"
          placeholder="your@email.com"
          withAsterisk
          key={form.key('email')}
          {...form.getInputProps('email')}
        />

        <div>
          <PasswordInput
            label="密码"
            placeholder="输入密码"
            withAsterisk
            key={form.key('password')}
            {...form.getInputProps('password')}
          />
          {/* 密码强度指示器：仅在用户输入密码时显示 */}
          {form.getValues().password && (
            <Progress
              value={passwordStrength}
              size="xs"
              color={
                passwordStrength < 50 ? 'red' :
                passwordStrength < 75 ? 'yellow' : 'green'
              }
              mt="xs"
            />
          )}
        </div>

        <PasswordInput
          label="确认密码"
          placeholder="再次输入密码"
          withAsterisk
          key={form.key('confirmPassword')}
          {...form.getInputProps('confirmPassword')}
        />

        <Button type="submit" loading={loading} fullWidth>
          {loading ? '注册中...' : '注册'}
        </Button>
      </Stack>
    </form>
  );
}
```

### 示例要点解析

1. **Schema 定义**：使用 Zod v4，定义了 5 个字段的验证规则，包括正则、长度、范围、跨字段。
2. **schemaResolver**：将 Zod schema 接入 Mantine Form，无需额外的 resolver 包。
3. **验证时机组合**：`username` 和 `email` 在 onChange 时验证（即时反馈），所有字段在 onBlur 时验证。
4. **密码强度**：通过 `form.getValues().password` 实时获取密码值，计算并显示强度条。
5. **异步提交**：`handleSubmit` 是 async 函数，配合 `loading` state 控制 Button 的 loading 状态。
6. **成功反馈**：提交成功后切换到成功提示界面，避免显示已提交的表单。
7. **错误处理**：注释中展示了如何将服务端错误通过 `form.setErrors` 设置到对应字段。

---

## 3.14 v8 到 v9 的迁移要点

如果你正在从 v8 迁移到 v9，下面是表单验证部分的主要变化清单：

### 1. Schema Resolver 统一

**v8（已废弃）**：

```javascript
// v8：需要为每个 Schema 库安装单独的 resolver 包
import { zodResolver } from 'mantine-form-zod-resolver';
import { yupResolver } from 'mantine-form-yup-resolver';
import { valibotResolver } from 'mantine-form-valibot-resolver';

const form = useForm({
  validate: zodResolver(schema),
});
```

**v9（新方式）**：

```javascript
// v9：统一使用 schemaResolver，无需额外安装 resolver 包
import { schemaResolver } from '@mantine/form';

const form = useForm({
  validate: schemaResolver(schema, { sync: true }),
});
```

迁移步骤：

1. 卸载 resolver 包：`npm uninstall mantine-form-zod-resolver`
2. 升级 Schema 库到支持 Standard Schema 的版本：
   - Zod：v3.24+ 或 v4+（推荐使用 `zod/v4` 入口）
   - Valibot：v1.0+
3. 将 `zodResolver(schema)` 替换为 `schemaResolver(schema, { sync: true })`
4. （可选）添加 `{ sync: true }` 优化同步验证的性能

### 2. 完整迁移对照表

| v8 写法 | v9 写法 | 备注 |
|---------|---------|------|
| `zodResolver(schema)` | `schemaResolver(schema, { sync: true })` | Zod 同步验证 |
| `yupResolver(schema)` | （自定义 resolver） | Yup 暂未实现 Standard Schema |
| `valibotResolver(schema)` | `schemaResolver(schema, { sync: true })` | Valibot v1+ |
| `import { zodResolver } from 'mantine-form-zod-resolver'` | `import { schemaResolver } from '@mantine/form'` | 包路径变化 |

### 3. Zod 错误消息格式变化

Zod v4 引入了新的错误消息格式，从 `{ message: '...' }` 改为 `{ error: '...' }`：

**Zod v3（旧）**：

```javascript
const schema = z.object({
  name: z.string().min(2, { message: '名字太短' }),
});
```

**Zod v4（新）**：

```javascript
const schema = z.object({
  name: z.string().min(2, { error: '名字太短' }),
  // 或简写：z.string().min(2, '名字太短')
});
```

### 4. 其他注意事项

- `useForm` 的核心 API（`initialValues`、`validate`、`getInputProps`、`onSubmit` 等）保持兼容
- 非受控模式 `mode: 'uncontrolled'` 仍是推荐模式
- `form.key()` 和 `getInputProps` 的用法不变
- 内置验证函数（`isEmail`、`isNotEmpty` 等）API 保持不变
- List handlers（`insertListItem` 等）API 保持不变
- `createFormContext` 和 `createFormActions` API 保持不变

### 5. 推荐的迁移顺序

1. **升级依赖**：`@mantine/form@^9`、`zod@^4`
2. **全局替换 resolver**：将所有 `zodResolver` 替换为 `schemaResolver`
3. **卸载旧 resolver 包**：`npm uninstall mantine-form-zod-resolver`
4. **更新错误消息格式**：将 `{ message: '...' }` 改为 `{ error: '...' }`（仅 Zod v4）
5. **测试验证**：重点测试嵌套字段、列表字段、异步验证等场景
6. **性能优化**：对纯同步 Schema 添加 `{ sync: true }`

---

## 3.15 常见陷阱与最佳实践

在长期使用 Mantine Form 的过程中，一些陷阱会反复出现。本节总结了开发者最容易踩的坑，以及对应的最佳实践。

### 陷阱 1：非受控模式下忘记 key

**错误示例**：

```javascript
// ❌ 错误：缺少 key，动态字段或重置时会状态错乱
<TextInput {...form.getInputProps('name')} />
```

**正确示例**：

```javascript
// ✅ 正确：必须同时传入 key 和 getInputProps
<TextInput
  key={form.key('name')}
  {...form.getInputProps('name')}
/>
```

**原因**：非受控模式下，Mantine 通过 `form.key()` 生成的稳定 key 来标识字段实例。如果忘记传 key，React 会使用默认的索引 key，导致在字段增删、表单重置时无法正确保持状态。

### 陷阱 2：列表项缺少稳定 key 字段

**错误示例**：

```javascript
// ❌ 错误：列表项没有 key 字段，使用数组索引作为 React key
initialValues: {
  employees: [{ name: '' }], // 缺少 key 字段
}

// 渲染时用 index 作为 key
{form.values.employees.map((emp, index) => (
  <div key={index}>...</div>
))}
```

**正确示例**：

```javascript
// ✅ 正确：使用 randomId 生成唯一 key
import { randomId } from '@mantine/hooks';

initialValues: {
  employees: [{ name: '', key: randomId() }], // 包含 key 字段
}

// 渲染时用 emp.key 作为 React key
{form.values.employees.map((emp, index) => (
  <div key={emp.key}>...</div>
))}
```

**原因**：当用户删除中间项时，使用 index 作为 key 会导致 React 错误地复用组件实例，造成输入框内容错位。使用稳定的 `randomId` 作为 key 可以保证每个列表项在增删时都有正确的 diff 行为。

### 陷阱 3：在 Schema 验证中使用 sync: true 但 schema 包含异步

**错误示例**：

```javascript
// ❌ 错误：schema 包含异步 refine，却使用了 sync: true
const schema = z.object({
  email: z.email(),
}).refine(async (data) => {
  return await checkEmail(data.email);
});

const form = useForm({
  validate: schemaResolver(schema, { sync: true }), // 异步验证不会执行
});
```

**正确示例**：

```javascript
// ✅ 正确：包含异步验证时不传 sync
const form = useForm({
  validate: schemaResolver(schema), // 默认异步模式
});
```

### 陷阱 4：滥用 validateInputOnChange

**错误示例**：

```javascript
// ❌ 错误：对所有字段开启 onChange 验证，且包含异步验证
const form = useForm({
  validateInputOnChange: true, // 所有字段
  validate: {
    username: async (value) => {
      return await checkUsernameAPI(value); // 每次按键都发请求！
    },
  },
});
```

**正确示例**：

```javascript
// ✅ 正确：只对同步验证的字段开启 onChange，异步验证放 onBlur
const form = useForm({
  validateInputOnChange: ['email', 'name'], // 仅同步验证字段
  validateInputOnBlur: true, // 异步验证在失焦时触发
  validate: {
    username: async (value) => {
      return await checkUsernameAPI(value);
    },
  },
});
```

### 陷阱 5：忽略服务端错误处理

很多开发者只关注前端验证，忽略了提交后服务端可能返回的错误（如"用户名已被使用"）。

**最佳实践**：

```javascript
const handleSubmit = async (values) => {
  try {
    await api.register(values);
  } catch (error) {
    if (error.status === 422 && error.fieldErrors) {
      // 将服务端字段错误设置到表单
      form.setErrors(error.fieldErrors);
      // 例如：{ username: '该用户名已被注册' }
    } else {
      // 通用错误，显示通知
      notifications.show({
        title: '提交失败',
        message: error.message,
        color: 'red',
      });
    }
  }
};
```

### 最佳实践汇总

1. **统一使用非受控模式**：`mode: 'uncontrolled'` 是默认推荐，除非有特殊需求。
2. **Schema 验证优先**：新项目推荐使用 Zod + `schemaResolver`，享受类型推导和生态优势。
3. **合理组合验证时机**：必填和格式用 onBlur，即时反馈用 onChange，跨字段用 onSubmit。
4. **错误消息国际化**：将错误消息抽出为常量或 i18n key，避免硬编码。
5. **表单拆分**：超过 5 个字段的表单考虑使用 `createFormContext` 拆分为子组件。
6. **提交状态管理**：使用 `form.submitting` 自动管理 loading，避免手动 state。
7. **服务端错误处理**：始终在 catch 中处理 422 错误，通过 `form.setErrors` 回显到字段。
8. **测试覆盖**：对验证逻辑编写单元测试，特别是跨字段、异步、嵌套等复杂场景。

---

## 3.16 TypeScript 集成

Mantine Form 在 TypeScript 项目中表现优异。本节简要介绍 TypeScript 下的常见用法。

### 类型推导

`useForm` 会根据 `initialValues` 自动推导表单值的类型：

```typescript
import { useForm } from '@mantine/form';

interface FormValues {
  name: string;
  email: string;
  age: number;
}

const form = useForm<FormValues>({
  mode: 'uncontrolled',
  initialValues: { name: '', email: '', age: 0 },
});

// form.values 的类型是 FormValues
// form.getInputProps('name') 的参数会被类型检查
// form.setFieldValue('age', 'abc') 会报错，因为 age 是 number
```

### 与 Zod 的类型推导

结合 Zod，可以从 schema 推导类型，实现"单源真相"：

```typescript
import { z } from 'zod/v4';
import { useForm, schemaResolver } from '@mantine/form';

// Schema 既是验证器，也是类型源
const schema = z.object({
  name: z.string().min(2),
  email: z.email(),
  age: z.number().min(18),
});

// 从 schema 推导类型
type FormValues = z.infer<typeof schema>;

const form = useForm<FormValues>({
  mode: 'uncontrolled',
  initialValues: { name: '', email: '', age: 0 },
  validate: schemaResolver(schema, { sync: true }),
});

// 表单值类型自动与 schema 一致，无需手动维护 interface
```

### FormContext 的类型化

`createFormContext` 也支持泛型，确保所有子组件获得正确的类型：

```typescript
import { createFormContext } from '@mantine/form';

interface FormValues {
  name: string;
  email: string;
}

const [FormProvider, useFormContext, useForm] = createFormContext<FormValues>();

// useFormContext() 返回的 form 实例具有正确的 FormValues 类型
// 在子组件中：form.getInputProps('name') 会被类型检查
```

---

## 本章小结

本章是全书最重要的章节之一，系统讲解了 Mantine v9 中表单验证的方方面面：

1. **核心基础**：`useForm` hook 的配置与使用，非受控模式与 `form.key()` 机制，以及 Mantine Form 的设计哲学与同类库对比。
2. **验证策略**：规则对象、函数式验证、`formRootRule` 三种策略，适用于不同复杂度的场景；异步验证的竞态处理与防抖优化。
3. **验证时机**：onChange、onBlur、onSubmit 三种时机的灵活组合，平衡用户体验与性能。
4. **内置验证函数**：`isEmail`、`isNotEmpty`、`matches`、`isUrl`、`isOneOf` 等 10+ 个开箱即用的验证器。
5. **Schema 验证（v9 重点）**：`schemaResolver` 基于 Standard Schema 规范，统一支持 Zod、Valibot、ArkType 等主流库，包括嵌套、列表、异步、跨字段（superRefine）验证，以及同步/异步模式选择。
6. **嵌套与列表**：Property Paths 机制、4 个 list handler、动态字段的添加删除与排序。
7. **状态管理**：touched、dirty、submitting、validating 等状态的查询与控制。
8. **表单提交**：`onSubmit` 的成功/失败回调、`onSubmitPreventDefault` 选项、异步提交与服务端错误处理。
9. **动态字段**：条件渲染、列表操作、`randomId` 的正确使用。
10. **组件化**：`createFormContext` 实现表单的组件化拆分，`createFormActions` 实现跨组件操作。
11. **实战整合**：通过完整的注册表单示例，综合运用所有知识点。
12. **迁移指南**：v8 到 v9 的核心变化与迁移步骤，包括 resolver 统一和 Zod v4 错误格式变化。
13. **常见陷阱与最佳实践**：5 大常见陷阱的解决方案与 8 条最佳实践汇总。
14. **TypeScript 集成**：类型推导、与 Zod 的"单源真相"、FormContext 的类型化。

掌握本章内容后，你已经能够应对绝大多数复杂的表单验证需求。下一章我们将学习 Mantine 的数据展示组件，包括 Table、DataTable、Pagination 等。

---

## 延伸阅读

- [Mantine Form 官方文档](https://mantine.dev/form/use-form/)
- [Standard Schema 规范](https://github.com/standard-schema/standard-schema)
- [Zod v4 文档](https://zod.dev/v4)
- [Valibot 文档](https://valibot.dev/)
- [Mantine v9 迁移指南](https://mantine.dev/about/migrations/)
