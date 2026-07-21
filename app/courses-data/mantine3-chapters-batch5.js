// =============================================================
// Mantine 之道 · 理念与设计目的 —— 第五批章节
// -------------------------------------------------------------
// 本批包含：
//   mantine3-ch26 : 第二十六章 useForm 基础与设计哲学
//   mantine3-ch27 : 第二十七章 校验函数与错误信息
//   mantine3-ch28 : 第二十八章 getInputProps 与受控模式
//   mantine3-ch29 : 第二十九章 校验时机：blur / change / submit
//   mantine3-ch30 : 第三十章 Zod 联动
//   mantine3-ch31 : 第三十一章 动态字段
//   mantine3-ch32 : 第三十二章 数组字段
//   mantine3-ch33 : 第三十三章 嵌套对象与复杂校验
//
// 风格：API 详尽，每个章节都有完整 demo
// 适用版本：Mantine v9 / React 19 / Next.js 16
// =============================================================

const chapters = [
  // ============================================================
  // 第二十六章
  // ============================================================
  {
    id: "mantine3-ch26",
    group: "第四部分 Form 验证体系",
    icon: "📝",
    title: "第二十六章 useForm 基础与设计哲学",
    content: `## 26.1 为什么用 useForm

React 里有 4 种管理表单的方式：

| 方式 | 代码量 | 性能 | 校验 |
| --- | --- | --- | --- |
| 原生 useState | 多 | 中 | 自己写 |
| React Hook Form | 少 | 高 | 第三方 |
| Formik | 中 | 中 | 第三方 |
| **Mantine useForm** | **少** | **高** | **内置** |

**Mantine useForm 的优势**：

- **零依赖**：不用装 react-hook-form、yup、formik。
- **类型推断完整**：泛型 `<FormValues>` 贯穿整个表单。
- **校验内置**：`validate` 配置即可，不用额外库。
- **Zod 集成**：\`zodResolver\` 一行接入。

---

## 26.2 useForm 的设计哲学

### 哲学 1：校验逻辑放在 hook 里

传统做法是把校验放在组件里：

\`\`\`jsx
// ❌ 校验逻辑散落在组件
function Form() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleBlur = () => {
    if (!/^\\S+@\\S+\\.\\S+$/.test(email)) {
      setEmailError('邮箱格式错误');
    }
  };

  return <TextInput value={email} onChange={...} onBlur={handleBlur} error={emailError} />;
}
\`\`\`

useForm 把校验逻辑收到 hook 里：

\`\`\`jsx
// ✅ 校验在 hook，组件只负责 UI
function Form() {
  const form = useForm({
    initialValues: { email: '' },
    validate: {
      email: (value) => (/^\\S+@\\S+\\.\\S+$/.test(value) ? null : '邮箱格式错误'),
    },
  });

  return <TextInput {...form.getInputProps('email')} />;
}
\`\`\`

### 哲学 2：getInputProps 是「一站式」API

\`getInputProps\` 返回**所有需要的 props**（value、onChange、onBlur、error 等），一行搞定。

\`\`\`jsx
<NumberInput {...form.getInputProps('age')} />
// 等价于
<NumberInput
  value={form.values.age}
  onChange={(value) => form.setFieldValue('age', value)}
  onBlur={() => form.validateField('age')}
  error={form.errors.age}
/>
\`\`\`

### 哲学 3：两种模式（controlled / uncontrolled）

\`\`\`ts
useForm({
  mode: 'controlled',  // controlled = 每次输入都更新 values
  // uncontrolled = 不更新 values，只在 submit 时读 DOM 值
})
\`\`\`

---

## 26.3 useForm 的最小示例

\`\`\`jsx
import { useForm } from '@mantine/form';
import { TextInput, Button } from '@mantine/core';

function LoginForm() {
  const form = useForm({
    // 1. 初始值（必填，TypeScript 用泛型推断类型）
    mode: 'controlled',
    initialValues: { email: '', password: '' },

    // 2. 校验函数
    validate: {
      email: (value) => (/^\\S+@\\S+\\.\\S+$/.test(value) ? null : '邮箱格式错误'),
      password: (value) => (value.length < 6 ? '密码至少 6 位' : null),
    },

    // 3. 校验时机
    validateInputOnBlur: true,
  });

  // 4. 提交处理
  const handleSubmit = (values) => {
    console.log('提交数据', values);
    // 调用 API
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <TextInput
        label="邮箱"
        placeholder="your@email.com"
        {...form.getInputProps('email')}
      />
      <TextInput
        label="密码"
        type="password"
        {...form.getInputProps('password')}
      />
      <Button type="submit">登录</Button>
    </form>
  );
}
\`\`\`

---

## 26.4 useForm 完整 API

### 接受的配置

\`\`\`ts
interface UseFormInput<T> {
  mode?: 'controlled' | 'uncontrolled';
  initialValues: T;
  initialErrors?: Record<keyof T, string>;
  initialTouched?: Record<keyof T, boolean>;
  initialDirty?: Record<keyof T, boolean>;
  validate?: Record<keyof T, (value: any, values: T) => string | null>;
  validateInputOnBlur?: boolean;
  validateInputOnChange?: boolean | ((keyof T)[]);
  validateInputOnChangeIfTouched?: boolean;
  transformValues?: (values: T) => any;
  clearErrorsOnFocus?: boolean;
  enhancedReturn?: boolean;
  errorElement?: 'input' | 'root';  // v9 新增
  onValuesChange?: (values: T) => void;
  onErrorsChange?: (errors: T) => void;
  onSubmit?: (values: T) => void;
  onReset?: (values: T) => void;
}
\`\`\`

### 返回的对象

\`\`\`ts
interface UseFormReturnType<T> {
  // 值与状态
  values: T;
  errors: Record<keyof T, string | null>;
  touched: Record<keyof T, boolean>;
  dirty: Record<keyof T, boolean>;
  isValid: boolean;
  isDirty: boolean;

  // 设置
  setValues: (values: Partial<T>) => void;
  setFieldValue: <K extends keyof T>(key: K, value: T[K]) => void;
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;
  setFieldError: (key: keyof T, error: string) => void;
  clearErrors: () => void;
  clearFieldError: (key: keyof T) => void;
  setTouched: (touched: Partial<Record<keyof T, boolean>>) => void;
  setFieldTouched: (key: keyof T, touched?: boolean) => void;

  // 校验
  validate: () => boolean;  // 返回 true = 校验通过
  validateField: (key: keyof T) => boolean;

  // 重置
  reset: () => void;

  // 提交
  onSubmit: (handler: (values: T, event) => void) => (event) => void;

  // 辅助
  getInputProps: <K extends keyof T>(key: K, options?) => {
    value: T[K];
    onChange: (event) => void;
    onBlur: () => void;
    error: string | null;
    // ...
  };
  getValues: () => T;
  insertListItem: <K>(key: K, value: any, index?: number) => void;
  removeListItem: <K>(key: K, index: number) => void;
  reorderListItem: <K>(key: K, index: number, newIndex: number) => void;
  replaceListItem: <K>(key: K, index: number, newValue: any) => void;
}
\`\`\`

---

## 26.5 两种模式详解

### controlled 模式

\`\`\`jsx
const form = useForm({
  mode: 'controlled',  // 默认值
  initialValues: { name: '' },
});

// 每次输入都更新 form.values
// UI 重新渲染由 React 控制
\`\`\`

**适用场景**：

- 大多数场景（推荐）。
- 需要实时显示 form.values（如预览）。
- 复杂联动（如一个字段变化影响另一个字段的选项）。

### uncontrolled 模式

\`\`\`jsx
const form = useForm({
  mode: 'uncontrolled',
  initialValues: { name: '' },
});

// form.values 不更新，只在 submit 时从 DOM 读取
// 性能更好（不触发 re-render）
\`\`\`

**适用场景**：

- 性能敏感（如大表单、100+ 字段）。
- 不需要实时联动。
- 简单表单。

**注意**：uncontrolled 模式下，\`getInputProps\` 返回的 \`value\` 来自 \`defaultValue\`，不是 \`value\`。

\`\`\`jsx
// uncontrolled 模式
<form onSubmit={form.onSubmit((values) => console.log(values))}>
  {/* 用 key 强制重新挂载，或用 ref 获取 DOM 值 */}
  <TextInput name="name" defaultValue={form.values.name} />
</form>
\`\`\`

---

## 26.6 TypeScript 泛型推断

\`\`\`ts
interface FormValues {
  name: string;
  age: number;
  email: string;
  agreed: boolean;
}

const form = useForm<FormValues>({
  initialValues: {
    name: '',
    age: 0,
    email: '',
    agreed: false,
  },
  validate: {
    name: (value) => (value.length < 2 ? '太短' : null),
    age: (value) => (value < 18 ? '未成年' : null),
  },
});

// form.values 自动推断为 FormValues
const name: string = form.values.name;  // ✅
// const wrong: number = form.values.name;  // ❌ TypeScript 报错

// form.getInputProps 的 key 必须是 FormValues 的 key
form.getInputProps('name');    // ✅
form.getInputProps('invalid'); // ❌ TypeScript 报错
\`\`\`

---

## 26.7 实战：登录表单

\`\`\`jsx
import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Button, Stack, Anchor } from '@mantine/core';

interface LoginValues {
  email: string;
  password: string;
}

function LoginForm() {
  const form = useForm<LoginValues>({
    mode: 'controlled',
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\\S+@\\S+\\.\\S+$/.test(value) ? null : '邮箱格式不正确'),
      password: (value) => (value.length < 8 ? '密码至少 8 位' : null),
    },
    validateInputOnBlur: true,
  });

  const handleSubmit = async (values: LoginValues) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('登录失败');
      // 跳转
    } catch (err) {
      form.setFieldError('password', '邮箱或密码错误');
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          label="邮箱"
          placeholder="your@email.com"
          required
          {...form.getInputProps('email')}
        />
        <PasswordInput
          label="密码"
          placeholder="至少 8 位"
          required
          {...form.getInputProps('password')}
        />
        <Anchor href="/forgot">忘记密码？</Anchor>
        <Button type="submit">登录</Button>
      </Stack>
    </form>
  );
}
\`\`\`

---

## 26.8 实战：注册表单

\`\`\`jsx
interface RegisterValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreed: boolean;
}

function RegisterForm() {
  const form = useForm<RegisterValues>({
    mode: 'controlled',
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreed: false,
    },
    validate: {
      username: (value) => {
        if (value.length < 3) return '用户名至少 3 位';
        if (value.length > 20) return '用户名最多 20 位';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return '只能包含字母、数字、下划线';
        return null;
      },
      email: (value) => (/^\\S+@\\S+\\.\\S+$/.test(value) ? null : '邮箱格式不正确'),
      password: (value) => {
        if (value.length < 8) return '密码至少 8 位';
        if (!/[A-Z]/.test(value)) return '密码需包含大写字母';
        if (!/[0-9]/.test(value)) return '密码需包含数字';
        return null;
      },
      confirmPassword: (value, values) =>
        value !== values.password ? '两次密码不一致' : null,
      agreed: (value) => (value ? null : '请同意服务条款'),
    },
    validateInputOnBlur: true,
    transformValues: (values) => ({
      // 提交前转大写用户名
      ...values,
      username: values.username.toLowerCase(),
    }),
  });

  return (
    <form onSubmit={form.onSubmit((values) => console.log(values))}>
      {/* ... 表单字段 ... */}
    </form>
  );
}
\`\`\`

---

## 26.9 常见错误

### 错误 1：忘记传 initialValues

\`\`\`jsx
// ❌ 报错
const form = useForm({});

// ✅ 修正
const form = useForm({ initialValues: { name: '' } });
\`\`\`

### 错误 2：validate 函数没返回 null

\`\`\`jsx
// ❌ 校验通过应该返回 null，不是 undefined 或 ''
validate: {
  email: (value) => {
    if (someCondition) return '错误';
    // 没有 return，错误状态会变 undefined
  },
}

// ✅ 显式返回 null
validate: {
  email: (value) => {
    if (someCondition) return '错误';
    return null;
  },
}
\`\`\`

### 错误 3：onSubmit 没调用 form.onSubmit

\`\`\`jsx
// ❌ 不会触发校验
<form onSubmit={(e) => { e.preventDefault(); handleSubmit(form.values); }}>

// ✅ form.onSubmit 先校验再调用
<form onSubmit={form.onSubmit(handleSubmit)}>
\`\`\`

---

## 26.10 小结

- \`useForm\` 是 Mantine 内置的表单管理 hook，**零依赖 + 类型推断完整**。
- 三大设计哲学：**校验内置、getInputProps 一站式、controlled/uncontrolled 双模式**。
- 配置：\`initialValues\`, \`validate\`, \`validateInputOnBlur\`, \`transformValues\`。
- 提交：\`form.onSubmit(handler)\` 自动先校验再调用。
- TypeScript 泛型 \`<FormValues>\` 贯穿整个表单。

> ⭐ 记住：**「useForm = 校验内置 + getInputProps 一站式 + 类型推断完整」**。

下一章我们看校验函数与错误信息。
`,
  },

  // ============================================================
  // 第二十七章
  // ============================================================
  {
    id: "mantine3-ch27",
    group: "第四部分 Form 验证体系",
    icon: "✅",
    title: "第二十七章 校验函数与错误信息",
    content: `## 27.1 校验函数签名

\`validate\` 字段是 **key-value 对象**，key 是字段名，value 是校验函数：

\`\`\`ts
validate: {
  fieldName: (value: any, values: T) => string | null;
}
\`\`\`

**返回规则**：

- \`null\`：校验通过
- \`string\`：校验失败，string 是错误信息

\`\`\`jsx
const form = useForm({
  initialValues: { email: '', age: 0, password: '' },
  validate: {
    // 单个字段校验
    email: (value) => (/^\\S+@\\S+\\.\\S+$/.test(value) ? null : '邮箱格式错误'),
    age: (value) => (value < 18 ? '未成年' : null),
  },
});
\`\`\`

---

## 27.2 单字段校验 vs 跨字段校验

### 单字段校验

\`\`\`jsx
validate: {
  email: (value) => (/^\\S+@\\S+\\.\\S+$/.test(value) ? null : '邮箱格式错误'),
}
\`\`\`

### 跨字段校验

\`\`\`jsx
validate: {
  // value 是当前字段的值，values 是整个表单的值
  confirmPassword: (value, values) => {
    return value === values.password ? null : '两次密码不一致';
  },
}
\`\`\`

**例子**：

\`\`\`jsx
const form = useForm({
  initialValues: { password: '', confirmPassword: '' },
  validate: {
    password: (value) => (value.length < 8 ? '密码至少 8 位' : null),
    confirmPassword: (value, values) =>
      value === values.password ? null : '两次密码不一致',
  },
});
\`\`\`

---

## 27.3 复杂校验

### 校验多个规则

\`\`\`jsx
validate: {
  password: (value) => {
    // 多个条件，每个都返回不同错误
    if (value.length < 8) return '密码至少 8 位';
    if (value.length > 32) return '密码最多 32 位';
    if (!/[A-Z]/.test(value)) return '需包含大写字母';
    if (!/[a-z]/.test(value)) return '需包含小写字母';
    if (!/[0-9]/.test(value)) return '需包含数字';
    if (!/[^A-Za-z0-9]/.test(value)) return '需包含特殊字符';
    return null;
  },
}
\`\`\`

### 异步校验

\`\`\`jsx
validate: {
  username: async (value) => {
    if (value.length < 3) return '用户名至少 3 位';
    // 异步检查用户名是否已存在
    const res = await fetch(\`/api/check-username?name=\${value}\`);
    const { exists } = await res.json();
    return exists ? '用户名已被占用' : null;
  },
}
\`\`\`

> ⚠️ 注意：异步校验时，\`validateInputOnChange\` 会让每次按键都发请求，**性能可能有问题**。建议用 \`validateInputOnBlur: true\`，只在 blur 时校验。

### 用正则校验

\`\`\`jsx
validate: {
  phone: (value) =>
    /^1[3-9]\\d{9}$/.test(value) ? null : '手机号格式错误',
  email: (value) =>
    /^\\S+@\\S+\\.\\S+$/.test(value) ? null : '邮箱格式错误',
  idCard: (value) =>
    /(^\\d{15}$)|(^\\d{18}$)|(^\\d{17}(\\d|X|x)$)/.test(value) ? null : '身份证号格式错误',
  url: (value) =>
    /^https?:\\/\\//.test(value) ? null : 'URL 必须以 http/https 开头',
}
\`\`\`

---

## 27.4 错误信息的国际化

### 简单方案：用对象

\`\`\`jsx
const messages = {
  zh: {
    required: '必填',
    email: '邮箱格式错误',
    minLength: '太短',
  },
  en: {
    required: 'Required',
    email: 'Invalid email',
    minLength: 'Too short',
  },
};

const t = messages.zh;

const form = useForm({
  initialValues: { email: '' },
  validate: {
    email: (value) => (!value ? t.required : !/^\\S+@\\S+\\.\\S+$/.test(value) ? t.email : null),
  },
});
\`\`\`

### 进阶方案：用 i18n 库

\`\`\`jsx
import { useTranslations } from 'next-intl';

function Form() {
  const t = useTranslations('form');

  const form = useForm({
    initialValues: { email: '' },
    validate: {
      email: (value) =>
        !value ? t('required') : !/^\\S+@\\S+\\.\\S+$/.test(value) ? t('invalidEmail') : null,
    },
  });
}
\`\`\`

---

## 27.5 自定义错误信息

### 方式 1：直接返回字符串

\`\`\`jsx
validate: {
  email: (value) => '邮箱格式错误',  // 任何值都返回错误
}
\`\`\`

### 方式 2：返回 React 节点（v9 新增）

\`\`\`jsx
validate: {
  password: (value) => {
    if (value.length < 8) {
      return (
        <span>
          密码至少 8 位，<a href="/help">查看规则</a>
        </span>
      );
    }
    return null;
  },
}
\`\`\`

### 方式 3：返回对象（v9 新增）

\`\`\`jsx
validate: {
  email: (value) => {
    if (!value) return { message: '必填', code: 'REQUIRED' };
    if (!/^\\S+@\\S+\\.\\S+$/.test(value)) {
      return { message: '格式错误', code: 'INVALID_FORMAT' };
    }
    return null;
  },
}
\`\`\`

---

## 27.6 错误状态对象

\`useForm\` 内部维护 \`errors\` 对象：

\`\`\`ts
{
  email: '邮箱格式错误',
  password: null,
  age: '未成年',
}
\`\`\`

**访问方式**：

\`\`\`jsx
// 1. 通过 getInputProps 自动传给组件 error
<TextInput {...form.getInputProps('email')} />
// 自动 error={form.errors.email}

// 2. 手动读取
<Alert color="red">{form.errors.email}</Alert>

// 3. 检查是否有错误
form.isValid  // false = 有错误
\`\`\`

---

## 27.7 手动设置错误

### 设置单个字段错误

\`\`\`jsx
// 比如服务器返回「邮箱已被注册」
form.setFieldError('email', '邮箱已被注册');
\`\`\`

### 设置多个字段错误

\`\`\`jsx
form.setErrors({
  email: '邮箱已被注册',
  password: '密码强度不够',
});
\`\`\`

### 清除错误

\`\`\`jsx
form.clearFieldError('email');  // 清除单个
form.clearErrors();  // 清除所有
\`\`\`

**实战**：

\`\`\`jsx
const handleSubmit = async (values) => {
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const { field, message } = await res.json();
      // 后端返回 { field: 'email', message: '邮箱已被注册' }
      form.setFieldError(field, message);
      return;
    }
    // 成功
  } catch (err) {
    form.setFieldError('root', '网络错误，请稍后重试');
  }
};
\`\`\`

---

## 27.8 错误显示位置

### input 下方（默认）

\`\`\`jsx
<TextInput {...form.getInputProps('email')} />
// 错误信息显示在 input 下方
\`\`\`

### 整体错误（form 顶部）

\`\`\`jsx
<form onSubmit={form.onSubmit(handleSubmit)}>
  {form.errors.root && (
    <Alert color="red" mb="md">{form.errors.root}</Alert>
  )}
  {/* 字段 ... */}
</form>
\`\`\>

\`\`\`jsx
// 在 handleSubmit 里设置 root 错误
form.setFieldError('root', '表单提交失败');
\`\`\`

### 自定义位置

\`\`\`jsx
<TextInput
  {...form.getInputProps('email', { withError: false })}
  error={null}
/>
<MyCustomError message={form.errors.email} />
\`\`\`

---

## 27.9 实战：完整的登录注册错误处理

\`\`\`jsx
interface LoginValues {
  email: string;
  password: string;
}

function LoginForm() {
  const form = useForm<LoginValues>({
    initialValues: { email: '', password: '' },
    validate: {
      email: (value) => {
        if (!value) return '请输入邮箱';
        if (!/^\\S+@\\S+\\.\\S+$/.test(value)) return '邮箱格式错误';
        return null;
      },
      password: (value) => {
        if (!value) return '请输入密码';
        if (value.length < 8) return '密码至少 8 位';
        return null;
      },
    },
    validateInputOnBlur: true,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: LoginValues) => {
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json();
        // 后端返回 { message, field? }
        if (data.field) {
          // 字段级错误
          form.setFieldError(data.field, data.message);
        } else {
          // 整体错误
          form.setFieldError('root', data.message);
        }
        return;
      }

      // 成功
      window.location.href = '/dashboard';
    } catch (err) {
      form.setFieldError('root', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      {form.errors.root && (
        <Alert color="red" mb="md" title="登录失败">
          {form.errors.root}
        </Alert>
      )}
      <TextInput
        label="邮箱"
        placeholder="your@email.com"
        {...form.getInputProps('email')}
      />
      <PasswordInput
        label="密码"
        {...form.getInputProps('password')}
      />
      <Button type="submit" loading={loading} fullWidth>
        登录
      </Button>
    </form>
  );
}
\`\`\`

---

## 27.10 常见错误

### 错误 1：validate 函数返回 undefined

\`\`\`jsx
// ❌ 没 return 会返回 undefined，被视为错误
validate: {
  email: (value) => {
    if (someCondition) return '错误';
    // 这里没有 return，等于 return undefined
  },
}

// ✅ 显式返回 null
validate: {
  email: (value) => {
    if (someCondition) return '错误';
    return null;
  },
}
\`\`\`

### 错误 2：跨字段校验没传 values 参数

\`\`\`jsx
// ❌ 只用了 value，没用 values
validate: {
  confirmPassword: (value) => value === password ? null : '错误',
  // password 是闭包变量，不是最新值
}

// ✅ 用 values 参数
validate: {
  confirmPassword: (value, values) => value === values.password ? null : '错误',
}
\`\`\`

### 错误 3：把整个表单的错误放在一个字段

\`\`\`jsx
// ❌ 错误放在 email
form.setFieldError('email', '通用错误');

// ✅ 用 root 字段（如果定义了）或其他语义字段
form.setFieldError('root', '通用错误');
\`\`\`

---

## 27.11 小结

- \`validate\` 是 \`Record<key, (value, values) => string | null>\`。
- 跨字段校验用 \`(value, values) => ...\`，values 是整个表单。
- 异步校验用 \`async (value) => ...\`，但要注意请求频率。
- 错误信息支持 string、React 节点、对象。
- 手动设置错误用 \`setFieldError\` / \`setErrors\`。
- 整体错误用 \`root\` 字段。

> ⭐ 记住：**「validate 函数返回 null 通过，返回 string 失败」**。

下一章我们看 getInputProps 与受控模式。
`,
  },

  // ============================================================
  // 第二十八章
  // ============================================================
  {
    id: "mantine3-ch28",
    group: "第四部分 Form 验证体系",
    icon: "🔌",
    title: "第二十八章 getInputProps 与受控模式",
    content: `## 28.1 getInputProps 是什么

\`getInputProps\` 是 useForm 的**核心 API**，返回一个**所有必要 props 的对象**，一键绑定到组件：

\`\`\`ts
form.getInputProps('email')
// 返回：
{
  value: form.values.email,
  onChange: (event) => form.setFieldValue('email', event.target.value),
  onBlur: () => form.validateField('email'),
  error: form.errors.email,
}
\`\`\`

\`\`\`jsx
<TextInput {...form.getInputProps('email')} />
\`\`\`

---

## 28.2 基础用法

### TextInput / PasswordInput / NumberInput 等

\`\`\`jsx
<TextInput {...form.getInputProps('name')} />
<PasswordInput {...form.getInputProps('password')} />
<NumberInput {...form.getInputProps('age')} />
<Textarea {...form.getInputProps('description')} />
\`\`\`

### Select / MultiSelect / TagsInput

\`\`\`jsx
<Select
  data={['React', 'Vue', 'Angular']}
  {...form.getInputProps('framework')}
/>
\`\`\`

**注意**：Select 等组件的 \`onChange\` 接收的是值（不是事件），getInputProps 内部已经处理。

### Checkbox / Switch

\`\`\`jsx
<Checkbox
  label="同意条款"
  {...form.getInputProps('agreed', { type: 'checkbox' })}
/>
\`\`\`

**\`type: 'checkbox'\`** 告诉 useForm 当前是 checkbox，用 \`event.currentTarget.checked\` 而非 \`event.target.value\`。

### Radio

\`\`\`jsx
<Radio.Group
  label="性别"
  {...form.getInputProps('gender')}
>
  <Radio value="male" label="男" />
  <Radio value="female" label="女" />
</Radio.Group>
\`\`\`

### Slider / RangeSlider

\`\`\`jsx
<Slider
  min={0}
  max={100}
  {...form.getInputProps('volume')}
/>
\`\`\`

### DatePicker

\`\`\`jsx
<DatePicker
  {...form.getInputProps('birthday')}
/>
\`\`\`

---

## 28.3 完整 API

\`\`\`ts
form.getInputProps(path, options?)
\`\`\`

**options 字段**：

| 字段 | 类型 | 作用 |
| --- | --- | --- |
| \`type\` | \`'input' \\| 'checkbox' \\| 'radio'\` | 区分值类型 |
| \`withError\` | boolean | 是否返回 error prop（默认 true） |
| \`withFocus\` | boolean | 是否返回 onFocus（用于 clearErrorsOnFocus） |
| \`defaultValue\` | any | uncontrolled 模式下的默认值 |
| \`defaultChecked\` | boolean | uncontrolled 模式下的默认勾选 |

\`\`\`jsx
// 不返回 error，自己控制
<TextInput
  {...form.getInputProps('email', { withError: false })}
  error={myCustomError}
/>

// Checkbox
<Checkbox {...form.getInputProps('agreed', { type: 'checkbox' })} />

// Radio.Group
<Radio.Group {...form.getInputProps('gender', { type: 'radio' })} />
\`\`\`

---

## 28.4 手动绑定（不推荐但有时需要）

如果组件不接受 \`onChange\` 事件，需要手动绑定：

\`\`\`jsx
// 1. 用 form.values + onChange
<TextInput
  value={form.values.name}
  onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
  error={form.errors.name}
/>

// 2. 用 onBlur 触发校验
<TextInput
  value={form.values.name}
  onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
  onBlur={() => form.validateField('name')}
  error={form.errors.name}
/>
\`\`\`

**为什么要避免手动绑定？**

- 容易忘记 \`onBlur\` 触发校验。
- 容易忘记传 \`error\`。
- 每次写都很繁琐。

**getInputProps 的好处**：

- 一次写好，到处用。
- 内部已经处理所有细节。

---

## 28.5 嵌套字段的 getInputProps

### 嵌套对象

\`\`\`ts
interface FormValues {
  user: {
    name: string;
    email: string;
  };
}

const form = useForm<FormValues>({
  initialValues: {
    user: { name: '', email: '' },
  },
});

// 用点号访问嵌套字段
<TextInput {...form.getInputProps('user.name')} />
<TextInput {...form.getInputProps('user.email')} />
\`\`\`

### 数组字段

\`\`\`ts
interface FormValues {
  tags: string[];
}

const form = useForm<FormValues>({
  initialValues: { tags: [] },
});

// 数组里某一项的 getInputProps
<TagsInput {...form.getInputProps('tags')} />

// 手动管理数组项
<>
  {form.values.tags.map((_, index) => (
    <TextInput
      key={index}
      {...form.getInputProps(\`tags.\${index}\`)}
    />
  ))}
</>
\`\`\`

---

## 28.6 受控模式（controlled）

\`\`\`jsx
const form = useForm({
  mode: 'controlled',  // 默认
  initialValues: { name: '' },
});

// 每次输入都更新 form.values
// form.values 是 React state，会触发 re-render
\`\`\`

**适用场景**：

- 大多数场景（推荐）。
- 需要实时联动。
- 复杂表单。

\`\`\`jsx
function Preview({ form }) {
  // 因为 form.values 是 controlled，可以实时看到
  return <div>当前值: {form.values.name}</div>;
}

function Form() {
  const form = useForm({
    mode: 'controlled',
    initialValues: { name: '' },
  });

  return (
    <>
      <TextInput {...form.getInputProps('name')} />
      <Preview form={form} />  // 实时显示
    </>
  );
}
\`\`\`

---

## 28.7 非受控模式（uncontrolled）

\`\`\`jsx
const form = useForm({
  mode: 'uncontrolled',
  initialValues: { name: '' },
});

// form.values 不会更新，只在 submit 时从 DOM 读取
\`\`\`

**适用场景**：

- 性能敏感（100+ 字段）。
- 不需要实时联动。
- 表单很少改值。

**注意**：uncontrolled 模式下，\`<TextInput>\` 用 \`defaultValue\` 而不是 \`value\`。

\`\`\`jsx
function Form() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { name: '' },
  });

  return (
    <form onSubmit={form.onSubmit((values) => console.log(values))}>
      <TextInput name="name" defaultValue={form.values.name} />
      {/* values 来自 DOM 读取 */}
    </form>
  );
}
\`\`\`

---

## 28.8 controlled vs uncontrolled 性能对比

### controlled 模式

\`\`\`
用户输入 → onChange → setFieldValue → React state 更新 → 组件 re-render
\`\`\`

**重渲染**：

- 每次按键都触发组件 re-render。
- 大表单（100+ 字段）会有性能问题。

### uncontrolled 模式

\`\`\`
用户输入 → 直接更新 DOM → form.values 不更新 → 不触发 re-render
\`\`\`

**重渲染**：

- 只有 onBlur / submit 触发 re-render。
- 性能更好。

### 实战建议

- **< 20 字段**：用 controlled（推荐）。
- **20-50 字段**：用 controlled + 优化（如 useDeferredValue）。
- **> 50 字段**：用 uncontrolled + 局部受控（如关键字段用 controlled）。

---

## 28.9 实战：复杂表单（controlled）

\`\`\`jsx
interface FormValues {
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female';
  framework: string;
  tags: string[];
  agreed: boolean;
}

function ComplexForm() {
  const form = useForm<FormValues>({
    mode: 'controlled',
    initialValues: {
      name: '',
      email: '',
      age: 18,
      gender: 'male',
      framework: 'react',
      tags: [],
      agreed: false,
    },
    validate: {
      // ...
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => console.log(values))}>
      <TextInput label="姓名" {...form.getInputProps('name')} />
      <TextInput label="邮箱" {...form.getInputProps('email')} />
      <NumberInput label="年龄" {...form.getInputProps('age')} />
      <Radio.Group label="性别" {...form.getInputProps('gender')}>
        <Radio value="male" label="男" />
        <Radio value="female" label="女" />
      </Radio.Group>
      <Select
        label="框架"
        data={['react', 'vue', 'angular']}
        {...form.getInputProps('framework')}
      />
      <TagsInput
        label="标签"
        {...form.getInputProps('tags')}
      />
      <Checkbox
        label="同意条款"
        {...form.getInputProps('agreed', { type: 'checkbox' })}
      />
      <Button type="submit">提交</Button>
    </form>
  );
}
\`\`\`

---

## 28.10 实战：自定义组件用 getInputProps

如果你写了自己的组件，可以模仿 getInputProps 的接口：

\`\`\`jsx
// 自己的 input 组件
function MyInput({ value, onChange, onBlur, error, ...rest }) {
  return (
    <div>
      <input
        value={value}
        onChange={(e) => onChange(e)}
        onBlur={onBlur}
        {...rest}
      />
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}

// 用 getInputProps
<MyInput {...form.getInputProps('name')} />
\`\`\`

---

## 28.11 实战：自定义校验时机

\`\`\`jsx
const form = useForm({
  initialValues: { name: '', email: '' },
  validate: { /* ... */ },
  // 1. blur 时校验
  validateInputOnBlur: true,
  // 2. 每次输入都校验（仅指定字段）
  validateInputOnChange: ['email'],
  // 3. 触摸后输入校验
  validateInputOnChangeIfTouched: true,
});
\`\`\`

---

## 28.12 实战：受控 + 实时预览

\`\`\`jsx
function FormWithPreview() {
  const form = useForm({
    mode: 'controlled',
    initialValues: {
      name: '',
      description: '',
    },
  });

  return (
    <Grid>
      <Grid.Col span={6}>
        <TextInput label="名称" {...form.getInputProps('name')} />
        <Textarea label="描述" {...form.getInputProps('description')} />
      </Grid.Col>
      <Grid.Col span={6}>
        <Card>
          <Title order={3}>{form.values.name || '预览'}</Title>
          <Text>{form.values.description || '...'}</Text>
        </Card>
      </Grid.Col>
    </Grid>
  );
}
\`\`\`

---

## 28.13 小结

- \`getInputProps\` 返回 value / onChange / onBlur / error 一站式绑定。
- 支持 TextInput / Select / Checkbox / Radio / Slider / DatePicker 等所有 Mantine 表单组件。
- 用 \`type: 'checkbox'\` 处理 Checkbox / Switch。
- nested field 用点号 \`user.name\`。
- controlled 模式 = 每次输入更新 form.values（性能一般）。
- uncontrolled 模式 = 只在 submit 时读 DOM（性能更好）。

> ⭐ 记住：**「getInputProps = value + onChange + onBlur + error，一行绑定」**。

下一章我们看校验时机。
`,
  },

  // ============================================================
  // 第二十九章
  // ============================================================
  {
    id: "mantine3-ch29",
    group: "第四部分 Form 验证体系",
    icon: "⏱️",
    title: "第二十九章 校验时机：blur / change / submit",
    content: `## 29.1 三种校验时机

Mantine useForm 支持 3 种校验时机：

| 时机 | 触发 | 体验 |
| --- | --- | --- |
| **blur** | 失焦时 | 友好（用户完成输入后才校验） |
| **change** | 输入时 | 严格（每次按键都校验） |
| **submit** | 提交时 | 宽松（只在提交时校验） |

\`\`\`jsx
const form = useForm({
  initialValues: { email: '' },
  validate: { /* ... */ },
  validateInputOnBlur: true,  // 失焦时校验
  validateInputOnChange: false,  // 输入时不校验
  // 默认只在 submit 时校验
});
\`\`\`

---

## 29.2 默认行为：只在校验失败后变更

Mantine useForm 的**默认行为**是：

1. 提交时校验所有字段。
2. 校验**失败**的字段，在 **change 时**也会重新校验（以清除错误）。
3. 校验**通过**的字段，不会自动在 change 时校验。

**为什么这样设计？**

- 用户体验：不会每次输入都看到错误。
- 但用户输入时，**错误会立即清除**（不显得「卡住」）。

---

## 29.3 validateInputOnBlur

\`\`\`jsx
const form = useForm({
  initialValues: { email: '' },
  validate: {
    email: (value) => (/^\\S+@\\S+\\.\\S+$/.test(value) ? null : '邮箱格式错误'),
  },
  validateInputOnBlur: true,  // 失焦时校验
});
\`\`\`

**效果**：

- 用户输入 \`abc\` → 没有错误。
- 用户失焦 → 校验，显示「邮箱格式错误」。
- 用户继续输入 → 不校验（除非开启 validateInputOnChange）。
- 用户再次失焦 → 校验。

**适用场景**：

- 大多数表单（推荐）。
- 用户体验友好。

---

## 29.4 validateInputOnChange

\`\`\`jsx
const form = useForm({
  initialValues: { email: '' },
  validate: {
    email: (value) => (/^\\S+@\\S+\\.\\S+$/.test(value) ? null : '邮箱格式错误'),
  },
  validateInputOnChange: true,  // 输入时校验
});
\`\`\`

**效果**：

- 用户输入 \`a\` → 显示「邮箱格式错误」。
- 用户输入 \`abc@\` → 仍然「邮箱格式错误」。
- 用户输入 \`abc@d.com\` → 错误消失。

**适用场景**：

- 实时反馈（如密码强度）。
- 严格表单（如金融场景）。

**缺点**：

- 用户体验差（一开始就看到错误）。
- 性能可能差（每次按键都校验）。

### 选择性校验：只对部分字段

\`\`\`jsx
validateInputOnChange: ['email', 'username']  // 只对这两个字段
\`\`\`

---

## 29.5 validateInputOnChangeIfTouched

\`\`\`jsx
const form = useForm({
  initialValues: { email: '' },
  validate: { /* ... */ },
  validateInputOnBlur: true,
  validateInputOnChangeIfTouched: true,  // 触摸后输入校验
});
\`\`\`

**效果**：

- 用户输入 \`abc\` → 没有错误（未触摸）。
- 用户失焦 → 显示「邮箱格式错误」（已触摸）。
- 用户继续输入 → 立即校验（已触摸）。

**适用场景**：

- 大多数表单（推荐 + validateInputOnBlur）。
- 既保留 blur 友好，又在用户改错时立即反馈。

---

## 29.6 实战：组合配置

\`\`\`jsx
const form = useForm({
  initialValues: { email: '', username: '', password: '' },
  validate: { /* ... */ },
  // 推荐组合：blur 校验 + 触摸后 change 校验
  validateInputOnBlur: true,
  validateInputOnChangeIfTouched: true,
});
\`\`\`

**用户体验**：

- 用户进入页面 → 看到所有字段（无错误）。
- 用户输入后失焦 → 看到错误。
- 用户开始改错 → 立即看到错误清除/更新。

---

## 29.7 clearErrorsOnFocus

\`\`\`jsx
const form = useForm({
  initialValues: { email: '' },
  validate: { /* ... */ },
  validateInputOnBlur: true,
  clearErrorsOnFocus: true,  // focus 时清除错误
});
\`\`\`

**效果**：

- 字段有错误 → 用户点击 → 错误立即清除。
- 用户输入完成 → 失焦时校验。

**适用场景**：

- 长表单（减少错误噪音）。
- 用户可能多次编辑同一字段。

---

## 29.8 手动触发校验

### 校验整个表单

\`\`\`jsx
// 手动触发校验
const isValid = form.validate();
if (!isValid) {
  console.log('有错误', form.errors);
}
\`\`\`

### 校验单个字段

\`\`\`jsx
const isValid = form.validateField('email');
if (!isValid) {
  console.log('email 字段有错误');
}
\`\`\`

**实战**：

\`\`\`jsx
// 提交前手动校验
const handleSaveDraft = () => {
  if (form.validateField('title')) {
    // 只校验标题，保存草稿
    saveDraft(form.values);
  } else {
    // 标题错误，提示用户
    notifications.show({ message: '请填写标题', color: 'red' });
  }
};
\`\`\`

---

## 29.9 实战：实时密码强度

\`\`\`jsx
function PasswordStrength() {
  const form = useForm({
    initialValues: { password: '' },
    validate: {
      password: (value) => {
        if (value.length < 8) return '密码至少 8 位';
        return null;
      },
    },
    validateInputOnChange: true,  // 实时校验
  });

  // 计算强度
  const getStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;  // 0-5
  };

  const strength = getStrength(form.values.password);
  const labels = ['弱', '较弱', '一般', '良好', '强', '极强'];
  const colors = ['red', 'orange', 'yellow', 'lime', 'green', 'teal'];

  return (
    <Stack>
      <PasswordInput
        label="密码"
        {...form.getInputProps('password')}
      />
      <div>
        <Text size="sm">强度: {labels[strength]}</Text>
        <Progress value={(strength / 5) * 100} color={colors[strength]} />
      </div>
    </Stack>
  );
}
\`\`\`

---

## 29.10 实战：异步校验（防抖）

\`\`\`jsx
import { useDebouncedValue } from '@mantine/hooks';

function AsyncValidation() {
  const form = useForm({
    initialValues: { username: '' },
    validate: {
      username: async (value) => {
        if (value.length < 3) return null;  // 客户端基础校验
        // 异步检查
        const res = await fetch(\`/api/check-username?name=\${value}\`);
        const { exists } = await res.json();
        return exists ? '用户名已被占用' : null;
      },
    },
    // 输入时不立即触发异步校验
    validateInputOnChange: false,
  });

  // 用 useDebouncedValue 延迟校验
  const [debounced] = useDebouncedValue(form.values.username, 500);

  useEffect(() => {
    if (debounced.length >= 3) {
      form.validateField('username');
    }
  }, [debounced]);

  return (
    <TextInput
      label="用户名"
      {...form.getInputProps('username')}
    />
  );
}
\`\`\`

---

## 29.11 实战：服务端校验错误回填

\`\`\`jsx
const handleSubmit = async (values) => {
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json();
      // 后端返回 { errors: { email: '邮箱已被注册', username: '用户名已被占用' } }
      if (data.errors) {
        form.setErrors(data.errors);
      }
      return;
    }
  } catch (err) {
    form.setFieldError('root', '网络错误');
  }
};
\`\`\`

---

## 29.12 实战：表单分步校验

\`\`\`jsx
function MultiStepForm() {
  const [step, setStep] = useState(0);
  const form = useForm({
    initialValues: {
      // step 0
      name: '',
      email: '',
      // step 1
      address: '',
      phone: '',
      // step 2
      payment: '',
    },
    validate: {
      // step 0
      name: (value) => (value ? null : '必填'),
      email: (value) => (/^\\S+@\\S+\\.\\S+$/.test(value) ? null : '邮箱错误'),
      // step 1
      address: (value) => (value ? null : '必填'),
      phone: (value) => (/^1[3-9]\\d{9}$/.test(value) ? null : '手机号错误'),
      // step 2
      payment: (value) => (value ? null : '必填'),
    },
  });

  const nextStep = () => {
    // 校验当前步骤的字段
    const stepFields = step === 0 ? ['name', 'email'] : step === 1 ? ['address', 'phone'] : ['payment'];
    const valid = stepFields.every((field) => form.validateField(field));
    if (valid) {
      setStep(step + 1);
    }
  };

  return (
    <>
      <Stepper active={step}>
        <Stepper.Step label="基本信息">...</Stepper.Step>
        <Stepper.Step label="联系方式">...</Stepper.Step>
        <Stepper.Step label="支付信息">...</Stepper.Step>
      </Stepper>
      <Button onClick={nextStep}>下一步</Button>
    </>
  );
}
\`\`\`

---

## 29.13 校验时机选择建议

| 场景 | 推荐配置 |
| --- | --- |
| 登录注册 | \`validateInputOnBlur: true\` |
| 用户资料 | \`validateInputOnBlur: true\` + \`validateInputOnChangeIfTouched: true\` |
| 实时密码强度 | \`validateInputOnChange: ['password']\` |
| 严格金融表单 | \`validateInputOnChange: true\` |
| 异步校验（用户名查重） | \`validateInputOnChange: false\` + \`useDebouncedValue\` |
| 多步表单 | \`validateInputOnBlur: true\` + 手动 \`validateField\` |

---

## 29.14 小结

- 3 种校验时机：**blur / change / submit**。
- 推荐组合：\`validateInputOnBlur: true\` + \`validateInputOnChangeIfTouched: true\`。
- \`validateInputOnChange\` 可以是 boolean 或字段数组。
- 手动校验用 \`form.validate()\` / \`form.validateField('fieldName')\`。
- 异步校验要用 \`useDebouncedValue\` 防抖。
- 服务端校验错误用 \`form.setErrors(data.errors)\` 回填。

> ⭐ 记住：**「validateInputOnBlur + validateInputOnChangeIfTouched = 友好 + 严格」**。

下一章我们看 Zod 联动。
`,
  },

  // ============================================================
  // 第三十章
  // ============================================================
  {
    id: "mantine3-ch30",
    group: "第四部分 Form 验证体系",
    icon: "🛡️",
    title: "第三十章 Zod 联动",
    content: `## 30.1 什么是 Zod

**Zod** 是一个 TypeScript 优先的**数据校验库**。它让你用 **schema 描述数据形状**，并自动推导 TypeScript 类型。

\`\`\`ts
import { z } from 'zod';

// 定义 schema
const UserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18),
});

// 推断类型
type User = z.infer<typeof UserSchema>;
// 等价于
// type User = { name: string; email: string; age: number };

// 校验数据
const result = UserSchema.safeParse({ name: 'a', email: 'invalid', age: 10 });
if (!result.success) {
  console.log(result.error.issues);
  // [{ path: ['name'], message: 'String must contain at least 2 character(s)' }, ...]
}
\`\`\`

---

## 30.2 为什么用 Zod 配合 Mantine

**优势 1：一份 schema，两端共用**

\`\`\`ts
// schema 写一次
const schema = z.object({ email: z.string().email() });

// 前端校验
const errors = schema.safeParse(form.values);

// 后端校验（Node.js）
app.post('/api/register', (req, res) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json(result.error.flatten());
});
\`\`\`

**优势 2：类型自动推导**

\`\`\`ts
const schema = z.object({
  name: z.string(),
  age: z.number(),
});

type FormValues = z.infer<typeof schema>;
// FormValues = { name: string; age: number }
\`\`\`

**优势 3：复杂校验（嵌套、联合、refine）**

\`\`\`ts
const schema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次密码不一致',
  path: ['confirmPassword'],
});
\`\`\`

---

## 30.3 安装 Zod

\`\`\`bash
npm install zod
\`\`\`

---

## 30.4 zodResolver：Mantine + Zod 的桥梁

\`\`\`bash
# 不需要单独装，Mantine v9 内置 zodResolver
# 如果用 v7 / v8，需要装 @mantine/form-zod-resolver
npm install @mantine/form-zod-resolver
\`\`\`

---

## 30.5 基础用法

### 1. 定义 schema

\`\`\`ts
import { z } from 'zod';

const registerSchema = z.object({
  username: z.string().min(3, '用户名至少 3 位').max(20, '用户名最多 20 位'),
  email: z.string().email('邮箱格式错误'),
  password: z.string().min(8, '密码至少 8 位'),
  confirmPassword: z.string(),
  age: z.number().min(18, '必须年满 18 岁'),
  agreed: z.literal(true, { errorMap: () => ({ message: '请同意条款' }) }),
});

// 推断类型
type RegisterValues = z.infer<typeof registerSchema>;
\`\`\`

### 2. 接入 useForm

\`\`\`ts
import { zodResolver } from '@mantine/form';
import { useForm } from '@mantine/form';

const form = useForm<RegisterValues>({
  mode: 'controlled',
  initialValues: {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: 18,
    agreed: false as true,  // TypeScript hack
  },
  validate: zodResolver(registerSchema),  // ✅ 一行接入
  validateInputOnBlur: true,
});
\`\`\`

### 3. 跨字段校验

\`\`\`ts
const schema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次密码不一致',
  path: ['confirmPassword'],
});
\`\`\`

\`\`\`ts
const form = useForm({
  initialValues: { password: '', confirmPassword: '' },
  validate: zodResolver(schema),
});
\`\`\`

---

## 30.6 完整实战：注册表单

\`\`\`ts
// schemas.ts
import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, '用户名至少 3 位')
    .max(20, '用户名最多 20 位')
    .regex(/^[a-zA-Z0-9_]+$/, '只能包含字母、数字、下划线'),
  email: z.string().email('邮箱格式错误'),
  password: z
    .string()
    .min(8, '密码至少 8 位')
    .regex(/[A-Z]/, '需包含大写字母')
    .regex(/[a-z]/, '需包含小写字母')
    .regex(/[0-9]/, '需包含数字'),
  confirmPassword: z.string(),
  age: z
    .number()
    .min(18, '必须年满 18 岁')
    .max(120, '年龄不合理'),
  agreed: z.literal(true, { errorMap: () => ({ message: '请同意服务条款' }) }),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次密码不一致',
  path: ['confirmPassword'],
});

export type RegisterValues = z.infer<typeof registerSchema>;
\`\`\`

\`\`\`tsx
// register-form.tsx
'use client';

import { useForm, zodResolver } from '@mantine/form';
import { TextInput, PasswordInput, NumberInput, Checkbox, Button, Stack } from '@mantine/core';
import { registerSchema, RegisterValues } from './schemas';

export function RegisterForm() {
  const form = useForm<RegisterValues>({
    mode: 'controlled',
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: 18,
      agreed: false as true,
    },
    validate: zodResolver(registerSchema),
    validateInputOnBlur: true,
  });

  const handleSubmit = async (values: RegisterValues) => {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      // 成功
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          label="用户名"
          placeholder="3-20 位字母数字下划线"
          {...form.getInputProps('username')}
        />
        <TextInput
          label="邮箱"
          {...form.getInputProps('email')}
        />
        <PasswordInput
          label="密码"
          {...form.getInputProps('password')}
        />
        <PasswordInput
          label="确认密码"
          {...form.getInputProps('confirmPassword')}
        />
        <NumberInput
          label="年龄"
          {...form.getInputProps('age')}
        />
        <Checkbox
          label="我同意服务条款"
          {...form.getInputProps('agreed', { type: 'checkbox' })}
        />
        <Button type="submit">注册</Button>
      </Stack>
    </form>
  );
}
\`\`\`

---

## 30.7 Zod 高级用法

### 嵌套对象

\`\`\`ts
const schema = z.object({
  user: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
  address: z.object({
    city: z.string(),
    street: z.string(),
  }),
});

type FormValues = z.infer<typeof schema>;
\`\`\`

### 数组字段

\`\`\`ts
const schema = z.object({
  tags: z.array(z.string()).min(1, '至少 1 个标签'),
  emails: z.array(z.string().email()).min(1, '至少 1 个邮箱'),
});
\`\`\`

### 联合类型

\`\`\`ts
const schema = z.object({
  contact: z.union([
    z.object({ type: z.literal('email'), email: z.string().email() }),
    z.object({ type: z.literal('phone'), phone: z.string().regex(/^1[3-9]\\d{9}$/) }),
  ]),
});
\`\`\`

### refine 自定义校验

\`\`\`ts
const schema = z.object({
  age: z.number().refine((val) => val % 2 === 0, { message: '年龄必须是偶数' }),
});
\`\`\`

### transform 数据转换

\`\`\`ts
const schema = z.object({
  email: z.string().email().transform((val) => val.toLowerCase()),
  age: z.string().transform((val) => parseInt(val, 10)),
});
\`\`\`

---

## 30.8 错误信息的本地化

### 用 Zod 的 errorMap

\`\`\`ts
import { z } from 'zod';

const errorMap: z.ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      return { message: '类型错误' };
    case z.ZodIssueCode.too_small:
      if (issue.type === 'string') {
        return { message: \`至少 \${issue.minimum} 个字符\` };
      }
      return { message: \`最小值 \${issue.minimum}\` };
    // ...
    default:
      return { message: ctx.defaultError };
  }
};

z.setErrorMap(errorMap);
\`\`\`

### 用 i18n 库

\`\`\`ts
import { useTranslations } from 'next-intl';
import { z } from 'zod';

function Form() {
  const t = useTranslations('form');

  const schema = z.object({
    email: z.string().email(t('invalidEmail')),
    password: z.string().min(8, t('passwordTooShort')),
  });
}
\`\`\`

---

## 30.9 Zod 与服务端共用 schema

\`\`\`ts
// schemas/register.ts（前后端共用）
import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
});

// === 前端 ===
import { zodResolver } from '@mantine/form';
const form = useForm({
  validate: zodResolver(registerSchema),
  // ...
});

// === 后端 ===
// app/api/register/route.ts
import { registerSchema } from '@/schemas/register';

export async function POST(req: Request) {
  const body = await req.json();
  const result = registerSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { errors: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // result.data 是类型安全的
  const { username, email, password } = result.data;
  // ...
}
\`\`\`

---

## 30.10 Zod 与 form errors 的双向回填

### 服务端返回 Zod 错误

\`\`\`ts
// app/api/register/route.ts
import { registerSchema } from '@/schemas/register';

export async function POST(req: Request) {
  const body = await req.json();
  const result = registerSchema.safeParse(body);

  if (!result.success) {
    return Response.json({
      errors: result.error.flatten().fieldErrors,
    }, { status: 400 });
  }
}
\`\`\`

### 前端回填

\`\`\`ts
const handleSubmit = async (values) => {
  const res = await fetch('/api/register', { /* ... */ });
  if (!res.ok) {
    const data = await res.json();
    // data.errors = { email: ['邮箱已被注册'], username: ['用户名已被占用'] }
    if (data.errors) {
      // 转成 Mantine form.errors 格式
      const mantineErrors = Object.entries(data.errors).reduce((acc, [key, msgs]) => ({
        ...acc,
        [key]: (msgs as string[])[0],
      }), {});
      form.setErrors(mantineErrors);
    }
  }
};
\`\`\`

---

## 30.11 实战：动态校验（条件校验）

\`\`\`ts
const schema = z.object({
  type: z.enum(['personal', 'company']),
  companyName: z.string().optional(),
  taxId: z.string().optional(),
}).refine(
  (data) => data.type === 'personal' || (data.companyName && data.taxId),
  {
    message: '公司账户必须填写公司名和税号',
    path: ['companyName'],
  }
);
\`\`\`

\`\`\`tsx
function Form() {
  const form = useForm({
    validate: zodResolver(schema),
    initialValues: {
      type: 'personal' as 'personal' | 'company',
      companyName: '',
      taxId: '',
    },
  });

  return (
    <>
      <Select
        label="类型"
        data={[{ value: 'personal', label: '个人' }, { value: 'company', label: '公司' }]}
        {...form.getInputProps('type')}
      />
      {form.values.type === 'company' && (
        <>
          <TextInput label="公司名" {...form.getInputProps('companyName')} />
          <TextInput label="税号" {...form.getInputProps('taxId')} />
        </>
      )}
    </>
  );
}
\`\`\`

---

## 30.12 实战：Zod 与异步校验

\`\`\`ts
const schema = z.object({
  username: z.string().min(3).refine(
    async (val) => {
      const res = await fetch(\`/api/check-username?name=\${val}\`);
      const { exists } = await res.json();
      return !exists;
    },
    { message: '用户名已被占用' }
  ),
});
\`\`\`

**注意**：\`zodResolver\` 内部用 \`schema.safeParse\` 同步执行，**async refine 需要 v3.20+**。

---

## 30.13 Zod vs Yup vs Joi

| 维度 | Zod | Yup | Joi |
| --- | --- | --- | --- |
| TypeScript 优先 | ✅ | ⚠️ | ❌ |
| 包大小 | 中 | 中 | 大 |
| 学习曲线 | 低 | 低 | 中 |
| 社区生态 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| 性能 | 中 | 中 | 中 |
| Mantine 集成 | ✅ 一行 | 需 adapter | 需 adapter |

**推荐 Zod**：TypeScript 友好 + 社区活跃 + Mantine 官方支持。

---

## 30.14 小结

- \`zodResolver(registerSchema)\` 一行接入 Mantine useForm。
- 跨字段校验用 \`refine\`。
- 错误信息可以本地化（i18n）。
- 前后端共用 schema（一份代码，两端使用）。
- 服务端返回的 Zod 错误可以直接 \`form.setErrors()\` 回填。
- Zod 3.20+ 支持 async refine。

> ⭐ 记住：**「Zod schema = 前端校验 + 后端校验 + TypeScript 类型三合一」**。

下一章我们看动态字段。
`,
  },

  // ============================================================
  // 第三十一章
  // ============================================================
  {
    id: "mantine3-ch31",
    group: "第四部分 Form 验证体系",
    icon: "🔄",
    title: "第三十一章 动态字段",
    content: `## 31.1 什么是动态字段

**动态字段** = 字段数量在运行时变化（用户可添加 / 删除）。

常见场景：
- 添加多个收货地址
- 添加多个联系方式
- 添加多个工作经验

\`\`\`jsx
function Form() {
  // 用户可以动态添加联系方式
  const form = useForm({
    initialValues: {
      contacts: [{ type: 'email', value: '' }],
    },
  });

  return (
    <>
      {form.values.contacts.map((_, index) => (
        <div key={index}>
          <Select
            data={['email', 'phone']}
            {...form.getInputProps(\`contacts.\${index}.type\`)}
          />
          <TextInput
            {...form.getInputProps(\`contacts.\${index}.value\`)}
          />
          <Button onClick={() => form.removeListItem('contacts', index)}>删除</Button>
        </div>
      ))}
      <Button onClick={() => form.insertListItem('contacts', { type: 'email', value: '' })}>
        添加联系方式
      </Button>
    </>
  );
}
\`\`\`

---

## 31.2 数组字段的 4 个核心 API

\`useForm\` 提供了 **4 个数组操作 API**：

| API | 作用 |
| --- | --- |
| \`insertListItem(path, item, index?)\` | 在指定位置插入项 |
| \`removeListItem(path, index)\` | 删除指定位置项 |
| \`reorderListItem(path, from, to)\` | 移动项 |
| \`replaceListItem(path, index, newItem)\` | 替换项 |

### insertListItem：插入

\`\`\`jsx
// 在末尾追加
form.insertListItem('contacts', { type: 'email', value: '' });

// 在指定位置插入
form.insertListItem('contacts', { type: 'phone', value: '' }, 1);  // 插入到 index 1
\`\`\`

### removeListItem：删除

\`\`\`jsx
form.removeListItem('contacts', 0);  // 删除 index 0
\`\`\`

### reorderListItem：移动

\`\`\`jsx
// 把 index 0 移动到 index 2
form.reorderListItem('contacts', 0, 2);
\`\`\`

### replaceListItem：替换

\`\`\`jsx
form.replaceListItem('contacts', 0, { type: 'phone', value: '13800138000' });
\`\`\`

---

## 31.3 实战：动态联系方式

\`\`\`tsx
interface Contact {
  type: 'email' | 'phone';
  value: string;
}

interface FormValues {
  contacts: Contact[];
}

function ContactForm() {
  const form = useForm<FormValues>({
    mode: 'controlled',
    initialValues: {
      contacts: [{ type: 'email', value: '' }],
    },
    validate: {
      contacts: {
        // ✅ 嵌套校验
        value: (value, values) => {
          if (!value) return '必填';
          // 邮箱类型用邮箱校验
          // 注意：这里拿不到 type，需要自定义
          return null;
        },
      },
    },
  });

  return (
    <Stack>
      {form.values.contacts.map((contact, index) => (
        <Group key={index} align="flex-end">
          <Select
            label="类型"
            data={[
              { value: 'email', label: '邮箱' },
              { value: 'phone', label: '手机' },
            ]}
            value={contact.type}
            onChange={(value) => form.setFieldValue(\`contacts.\${index}.type\`, value as 'email' | 'phone')}
            w={120}
          />
          <TextInput
            label="值"
            placeholder={contact.type === 'email' ? 'your@email.com' : '13800138000'}
            value={contact.value}
            onChange={(event) => form.setFieldValue(\`contacts.\${index}.value\`, event.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <ActionIcon
            color="red"
            variant="subtle"
            onClick={() => form.removeListItem('contacts', index)}
            disabled={form.values.contacts.length === 1}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ))}
      <Button
        variant="light"
        onClick={() => form.insertListItem('contacts', { type: 'email', value: '' })}
      >
        + 添加联系方式
      </Button>
    </Stack>
  );
}
\`\`\`

---

## 31.4 动态字段的校验

### 用嵌套对象校验

\`\`\`ts
const form = useForm({
  initialValues: {
    contacts: [{ type: 'email', value: '' }],
  },
  validate: {
    // 整体校验（在校验函数里访问 values）
    contacts: (value, values) => {
      const errors = value.map((contact) => {
        if (contact.type === 'email' && !/^\\S+@\\S+\\.\\S+$/.test(contact.value)) {
          return '邮箱格式错误';
        }
        if (contact.type === 'phone' && !/^1[3-9]\\d{9}$/.test(contact.value)) {
          return '手机号格式错误';
        }
        return null;
      });
      // Mantine useForm 不直接支持数组级错误
      // 需要返回第一项错误
      return errors.find((e) => e !== null) || null;
    },
  },
});
\`\`\`

### 用 Zod 校验（推荐）

\`\`\`ts
const contactSchema = z.object({
  type: z.enum(['email', 'phone']),
  value: z.string().superRefine((val, ctx) => {
    if (ctx.path.length === 0) return;
    // 这里简化，实际需要根据 type 决定
  }),
});

const schema = z.object({
  contacts: z.array(contactSchema),
});
\`\`\`

更简单的方式是用 \`superRefine\` 或自定义校验：

\`\`\`ts
const schema = z.object({
  contacts: z.array(
    z.object({
      type: z.enum(['email', 'phone']),
      value: z.string().min(1, '必填'),
    }).superRefine((data, ctx) => {
      if (data.type === 'email' && !/^\\S+@\\S+\\.\\S+$/.test(data.value)) {
        ctx.addIssue({
          path: ['value'],
          code: z.ZodIssueCode.custom,
          message: '邮箱格式错误',
        });
      }
      if (data.type === 'phone' && !/^1[3-9]\\d{9}$/.test(data.value)) {
        ctx.addIssue({
          path: ['value'],
          code: z.ZodIssueCode.custom,
          message: '手机号格式错误',
        });
      }
    })
  ),
});
\`\`\`

---

## 31.5 实战：拖拽排序

\`\`\`tsx
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function SortableContacts() {
  const form = useForm({ /* ... */ });

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    form.reorderListItem('contacts', source.index, destination.index);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="contacts">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {form.values.contacts.map((contact, index) => (
              <Draggable key={index} draggableId={String(index)} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {/* 联系方式字段 */}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
\`\`\`

---

## 31.6 实战：动态字段的限制

\`\`\`jsx
// 限制最多 N 个
const MAX_CONTACTS = 5;

<Button
  onClick={() => form.insertListItem('contacts', { type: 'email', value: '' })}
  disabled={form.values.contacts.length >= MAX_CONTACTS}
>
  添加联系方式（{form.values.contacts.length}/{MAX_CONTACTS}）
</Button>
\`\`\`

### 至少 N 个

\`\`\`jsx
// 至少 1 个（不能删完）
<ActionIcon
  onClick={() => form.removeListItem('contacts', index)}
  disabled={form.values.contacts.length === 1}
>
  <IconTrash />
</ActionIcon>
\`\`\`

---

## 31.7 实战：复杂动态表单（简历）

\`\`\`tsx
interface Experience {
  company: string;
  position: string;
  startDate: Date | null;
  endDate: Date | null;
  description: string;
}

interface ResumeValues {
  name: string;
  email: string;
  experiences: Experience[];
}

function ResumeForm() {
  const form = useForm<ResumeValues>({
    initialValues: {
      name: '',
      email: '',
      experiences: [],
    },
  });

  return (
    <Stack>
      <TextInput label="姓名" {...form.getInputProps('name')} />
      <TextInput label="邮箱" {...form.getInputProps('email')} />

      <Title order={4}>工作经历</Title>

      {form.values.experiences.map((_, index) => (
        <Card key={index} withBorder>
          <Group justify="space-between" mb="md">
            <Title order={5}>经历 {index + 1}</Title>
            <ActionIcon
              color="red"
              variant="subtle"
              onClick={() => form.removeListItem('experiences', index)}
            >
              <IconTrash />
            </ActionIcon>
          </Group>

          <Stack>
            <TextInput
              label="公司"
              {...form.getInputProps(\`experiences.\${index}.company\`)}
            />
            <TextInput
              label="职位"
              {...form.getInputProps(\`experiences.\${index}.position\`)}
            />
            <Group grow>
              <DatePickerInput
                label="开始日期"
                {...form.getInputProps(\`experiences.\${index}.startDate\`)}
              />
              <DatePickerInput
                label="结束日期"
                {...form.getInputProps(\`experiences.\${index}.endDate\`)}
              />
            </Group>
            <Textarea
              label="工作描述"
              autosize
              minRows={2}
              {...form.getInputProps(\`experiences.\${index}.description\`)}
            />
          </Stack>
        </Card>
      ))}

      <Button
        variant="light"
        onClick={() => form.insertListItem('experiences', {
          company: '',
          position: '',
          startDate: null,
          endDate: null,
          description: '',
        })}
      >
        + 添加工作经历
      </Button>
    </Stack>
  );
}
\`\`\`

---

## 31.8 实战：嵌套对象

\`\`\`tsx
interface Address {
  city: string;
  street: string;
  zipCode: string;
}

interface FormValues {
  name: string;
  address: Address;
}

function AddressForm() {
  const form = useForm<FormValues>({
    initialValues: {
      name: '',
      address: { city: '', street: '', zipCode: '' },
    },
  });

  return (
    <Stack>
      <TextInput label="姓名" {...form.getInputProps('name')} />
      <Title order={4}>地址</Title>
      <TextInput label="城市" {...form.getInputProps('address.city')} />
      <TextInput label="街道" {...form.getInputProps('address.street')} />
      <TextInput label="邮编" {...form.getInputProps('address.zipCode')} />
    </Stack>
  );
}
\`\`\`

---

## 31.9 性能优化

### 大量动态字段

如果有 100+ 动态字段，re-render 会很慢。**优化方式**：

\`\`\`tsx
// ✅ 用 uncontrolled + ref
function HeavyListForm() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      items: Array(100).fill({ name: '' }),
    },
  });

  return (
    <>
      {form.values.items.map((_, index) => (
        <TextInput
          key={index}
          name={\`items.\${index}.name\`}
          defaultValue=""
        />
      ))}
    </>
  );
}
\`\`\`

### 用 React.memo

\`\`\`tsx
const ContactItem = React.memo(({ contact, index, onRemove, onChange }) => {
  return (
    <Group>
      <TextInput
        value={contact.value}
        onChange={(e) => onChange(index, e.currentTarget.value)}
      />
      <Button onClick={() => onRemove(index)}>删除</Button>
    </Group>
  );
});
\`\`\`

---

## 31.10 常见错误

### 错误 1：用 \`getInputProps(\`items.${index}.name\`)\` 触发 re-render

\`\`\`jsx
// ❌ 每次输入都 re-render 整个列表
{form.values.items.map((item, index) => (
  <TextInput {...form.getInputProps(\`items.\${index}.name\`)} />
))}
\`\`\`

**解法**：用 React.memo 包装子组件。

### 错误 2：忘记 \`key={index}\`

\`\`\`jsx
// ❌ 没有 key 会导致状态错乱
{form.values.items.map((item) => (
  <TextInput {...form.getInputProps(\`items.0.name\`)} />  // 错！
))}
\`\`\`

\`\`\`jsx
// ✅ 正确：用 index 作 key（注意：删除中间项会重排，可能丢失输入）
// 更好：用稳定 id 作 key
{form.values.items.map((item, index) => (
  <TextInput key={item.id || index} {...form.getInputProps(\`items.\${index}.name\`)} />
))}
\`\`\`

### 错误 3：动态字段校验没配置

\`\`\`ts
// ❌ 数组字段不校验
validate: {
  contacts: undefined,
}

// ✅ 用 Zod 或嵌套校验
validate: zodResolver(z.object({
  contacts: z.array(z.object({
    type: z.enum(['email', 'phone']),
    value: z.string().min(1),
  })),
})),
\`\`\`

---

## 31.11 小结

- 4 个数组操作 API：**insertListItem / removeListItem / reorderListItem / replaceListItem**。
- 用 \`getInputProps(\`items.${index}.name\`)\` 访问嵌套字段。
- 动态字段校验推荐用 Zod schema。
- 大量动态字段用 **uncontrolled 模式** + **React.memo** 优化。
- 用稳定 id 作 key（避免删除时状态错乱）。

> ⭐ 记住：**「insertListItem 添加、removeListItem 删除、reorderListItem 排序」**。

下一章我们看数组字段。
`,
  },

  // ============================================================
  // 第三十二章
  // ============================================================
  {
    id: "mantine3-ch32",
    group: "第四部分 Form 验证体系",
    icon: "📚",
    title: "第三十二章 数组字段",
    content: `## 32.1 数组字段与动态字段的区别

**数组字段** = 一组相似的数据，字段数量在运行时变化，但**结构相同**。

**动态字段** = 字段名 / 结构在运行时变化（如一个字段是 input，另一个是 select）。

本章讲**数组字段**（更常见）。

---

## 32.2 数组字段的 4 种渲染方式

### 方式 1：基础列表

\`\`\`tsx
function TagsForm() {
  const form = useForm({
    initialValues: { tags: [] as string[] },
  });

  return (
    <>
      <TagsInput
        label="标签"
        {...form.getInputProps('tags')}
      />
      {/* TagsInput 内置添加 / 删除 */}
    </>
  );
}
\`\`\`

### 方式 2：自管理列表

\`\`\`tsx
function CustomListForm() {
  const form = useForm({
    initialValues: { items: [''] },
  });

  return (
    <>
      {form.values.items.map((_, index) => (
        <Group key={index}>
          <TextInput {...form.getInputProps(\`items.\${index}\`)} />
          <Button onClick={() => form.removeListItem('items', index)}>删除</Button>
        </Group>
      ))}
      <Button onClick={() => form.insertListItem('items', '')}>添加</Button>
    </>
  );
}
\`\`\`

### 方式 3：对象数组

\`\`\`tsx
function ObjectsForm() {
  const form = useForm({
    initialValues: {
      users: [
        { name: '', email: '' },
      ],
    },
  });

  return (
    <>
      {form.values.users.map((user, index) => (
        <div key={index}>
          <TextInput {...form.getInputProps(\`users.\${index}.name\`)} />
          <TextInput {...form.getInputProps(\`users.\${index}.email\`)} />
          <Button onClick={() => form.removeListItem('users', index)}>删除</Button>
        </div>
      ))}
      <Button onClick={() => form.insertListItem('users', { name: '', email: '' })}>
        添加用户
      </Button>
    </>
  );
}
\`\`\`

### 方式 4：用第三方组件

\`\`\`tsx
// 用 @mantine/form 的 FieldArray
import { FieldArray } from '@mantine/form';

<FieldArray form={form} name="users">
  {(fields) => (
    <>
      {fields.map((field, index) => (
        <div key={field.key}>
          {/* 自动绑定 field.key 和 field.id */}
          <TextInput {...form.getInputProps(\`users.\${index}.name\`)} />
        </div>
      ))}
    </>
  )}
</FieldArray>
\`\`\`

---

## 32.3 数组字段的校验

### 基础校验（非空）

\`\`\`ts
const schema = z.object({
  tags: z.array(z.string().min(1, '标签不能为空')).min(1, '至少 1 个标签'),
  emails: z.array(z.string().email('邮箱格式错误')).min(1, '至少 1 个邮箱'),
});
\`\`\`

### 对象数组校验

\`\`\`ts
const userSchema = z.object({
  name: z.string().min(1, '姓名必填'),
  email: z.string().email('邮箱格式错误'),
});

const schema = z.object({
  users: z.array(userSchema).min(1, '至少 1 个用户'),
});
\`\`\`

### 复杂校验（关联）

\`\`\`ts
const schema = z.object({
  startDate: z.date(),
  endDate: z.date(),
}).refine((data) => data.endDate > data.startDate, {
  message: '结束日期必须晚于开始日期',
  path: ['endDate'],
});
\`\`\`

---

## 32.4 FieldArray 组件

\`@mantine/form\` v9 内置 **FieldArray** 组件，简化数组管理：

\`\`\`tsx
import { FieldArray } from '@mantine/form';

interface FormValues {
  contacts: { name: string; email: string }[];
}

function Form() {
  const form = useForm<FormValues>({
    initialValues: {
      contacts: [{ name: '', email: '' }],
    },
  });

  return (
    <FieldArray form={form} name="contacts">
      {(fields) => (
        <>
          {fields.map((field, index) => (
            // field.key 是稳定的，field.id 也是
            <Group key={field.key}>
              <TextInput
                label="姓名"
                {...form.getInputProps(\`contacts.\${index}.name\`)}
              />
              <TextInput
                label="邮箱"
                {...form.getInputProps(\`contacts.\${index}.email\`)}
              />
              <Button onClick={() => form.removeListItem('contacts', index)}>删除</Button>
            </Group>
          ))}
          <Button onClick={() => form.insertListItem('contacts', { name: '', email: '' })}>
            添加
          </Button>
        </>
      )}
    </FieldArray>
  );
}
\`\`\`

### FieldArray 的优势

- 自动生成稳定的 \`key\`（用 \`field.key\`）。
- 提供 \`fields\` 数组（包含 id 和 key）。
- 支持嵌套（FieldArray 嵌套 FieldArray）。

---

## 32.5 实战：完整地址簿

\`\`\`tsx
interface Address {
  label: string;
  city: string;
  street: string;
  isDefault: boolean;
}

interface FormValues {
  addresses: Address[];
}

function AddressBookForm() {
  const form = useForm<FormValues>({
    initialValues: {
      addresses: [
        { label: '家', city: '', street: '', isDefault: true },
      ],
    },
    validate: zodResolver(
      z.object({
        addresses: z.array(
          z.object({
            label: z.string().min(1, '标签必填'),
            city: z.string().min(1, '城市必填'),
            street: z.string().min(1, '街道必填'),
            isDefault: z.boolean(),
          })
        ).min(1, '至少 1 个地址'),
      }).refine(
        (data) => data.addresses.filter((a) => a.isDefault).length === 1,
        { message: '必须有且仅有一个默认地址', path: ['addresses'] }
      )
    ),
  });

  return (
    <Stack>
      {form.values.addresses.map((address, index) => (
        <Card key={index} withBorder>
          <Group justify="space-between" mb="md">
            <Title order={5}>地址 {index + 1}</Title>
            <Group>
              <Checkbox
                label="默认地址"
                checked={address.isDefault}
                onChange={(event) => {
                  // 只能有一个默认
                  form.values.addresses.forEach((_, i) => {
                    form.setFieldValue(\`addresses.\${i}.isDefault\`, i === index);
                  });
                }}
              />
              <ActionIcon
                color="red"
                variant="subtle"
                onClick={() => form.removeListItem('addresses', index)}
                disabled={form.values.addresses.length === 1}
              >
                <IconTrash />
              </ActionIcon>
            </Group>
          </Group>

          <Stack>
            <TextInput
              label="标签"
              placeholder="家 / 公司 / 学校"
              {...form.getInputProps(\`addresses.\${index}.label\`)}
            />
            <TextInput
              label="城市"
              {...form.getInputProps(\`addresses.\${index}.city\`)}
            />
            <TextInput
              label="街道"
              {...form.getInputProps(\`addresses.\${index}.street\`)}
            />
          </Stack>
        </Card>
      ))}

      <Button
        variant="light"
        onClick={() => form.insertListItem('addresses', {
          label: '',
          city: '',
          street: '',
          isDefault: false,
        })}
      >
        + 添加地址
      </Button>
    </Stack>
  );
}
\`\`\`

---

## 32.6 实战：拖拽排序

\`\`\`tsx
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function SortableList() {
  const form = useForm({ /* ... */ });

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;
    form.reorderListItem('items', result.source.index, result.destination.index);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="list">
        {(provided) => (
          <Stack {...provided.droppableProps} ref={provided.innerRef}>
            {form.values.items.map((item, index) => (
              <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                {(provided) => (
                  <Card
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {/* 字段 */}
                  </Card>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Stack>
        )}
      </Droppable>
    </DragDropContext>
  );
}
\`\`\`

---

## 32.7 实战：标签输入

\`\`\`tsx
function TagsForm() {
  const form = useForm({
    initialValues: { tags: [] },
  });

  return (
    <TagsInput
      label="标签"
      description="按回车添加标签"
      placeholder="按回车添加"
      {...form.getInputProps('tags')}
    />
  );
}
\`\`\`

> Mantine 的 \`<TagsInput>\` 自动处理添加 / 删除，**不需要手动管理数组**。

---

## 32.8 实战：多选下拉

\`\`\`tsx
function MultiSelectForm() {
  const form = useForm({
    initialValues: { frameworks: [] },
  });

  return (
    <MultiSelect
      label="技术栈"
      data={['React', 'Vue', 'Angular', 'Svelte', 'Solid']}
      {...form.getInputProps('frameworks')}
    />
  );
}
\`\`\`

---

## 32.9 实战：文件上传（数组）

\`\`\`tsx
function FileUploadForm() {
  const form = useForm({
    initialValues: { files: [] as File[] },
  });

  return (
    <FileInput
      label="上传文件"
      placeholder="选择文件"
      multiple
      {...form.getInputProps('files')}
    />
  );
}
\`\`\`

> ⚠️ 注意：File 对象不能直接 form.setFieldValue，需要特殊处理。

---

## 32.10 实战：完整的发票表单（含多个项目）

\`\`\`tsx
interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface FormValues {
  customerName: string;
  items: InvoiceItem[];
}

const itemSchema = z.object({
  description: z.string().min(1, '描述必填'),
  quantity: z.number().min(1, '数量至少 1'),
  unitPrice: z.number().min(0, '单价必须 ≥ 0'),
});

const schema = z.object({
  customerName: z.string().min(1, '客户名必填'),
  items: z.array(itemSchema).min(1, '至少 1 个项目'),
});

function InvoiceForm() {
  const form = useForm<FormValues>({
    initialValues: {
      customerName: '',
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
    validate: zodResolver(schema),
  });

  // 计算总价
  const total = form.values.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  return (
    <Stack>
      <TextInput label="客户名" {...form.getInputProps('customerName')} />

      <Title order={4}>项目</Title>

      {form.values.items.map((item, index) => (
        <Card key={index} withBorder>
          <Group justify="space-between" mb="sm">
            <Text fw={600}>项目 {index + 1}</Text>
            <ActionIcon
              color="red"
              variant="subtle"
              onClick={() => form.removeListItem('items', index)}
              disabled={form.values.items.length === 1}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
          <Stack>
            <TextInput
              label="描述"
              {...form.getInputProps(\`items.\${index}.description\`)}
            />
            <Group grow>
              <NumberInput
                label="数量"
                min={1}
                {...form.getInputProps(\`items.\${index}.quantity\`)}
              />
              <NumberInput
                label="单价"
                min={0}
                decimalScale={2}
                {...form.getInputProps(\`items.\${index}.unitPrice\`)}
              />
              <NumberInput
                label="小计"
                value={item.quantity * item.unitPrice}
                readOnly
              />
            </Group>
          </Stack>
        </Card>
      ))}

      <Button
        variant="light"
        onClick={() => form.insertListItem('items', { description: '', quantity: 1, unitPrice: 0 })}
      >
        + 添加项目
      </Button>

      <Group justify="flex-end">
        <Title order={4}>总价: ¥{total.toFixed(2)}</Title>
      </Group>

      <Button type="submit" onClick={form.onSubmit((values) => console.log(values))}>
        提交发票
      </Button>
    </Stack>
  );
}
\`\`\`

---

## 32.11 数组字段的常见错误

### 错误 1：array index 改变导致状态错乱

\`\`\`jsx
// ❌ 删除中间项后，下面的项 index 变了，state 错位
{form.values.items.map((item, index) => (
  <TextInput key={index} {...form.getInputProps(\`items.\${index}.name\`)} />
))}

// ✅ 用稳定 id 作 key
{form.values.items.map((item, index) => (
  <TextInput key={item.id} {...form.getInputProps(\`items.\${index}.name\`)} />
))}
\`\`\`

### 错误 2：uncontrolled 模式 + 动态字段

\`\`\`jsx
// ❌ uncontrolled 模式 + getInputProps 不会正确响应变化
const form = useForm({ mode: 'uncontrolled', initialValues: { items: [] } });

{form.values.items.map((_, index) => (
  <TextInput {...form.getInputProps(\`items.\${index}.name\`)} />  // 可能不会更新
))}
\`\`\`

**解法**：uncontrolled 模式 + 手动 \`defaultValue\`。

---

## 32.12 小结

- **数组字段** = 同一结构的多份数据。
- 4 个核心 API：**insertListItem / removeListItem / reorderListItem / replaceListItem**。
- 用 \`<FieldArray>\` 组件管理稳定的 key。
- 数组校验用 Zod 的 \`z.array(itemSchema)\`。
- 用稳定 id（不是 index）作 key，避免删除时状态错乱。
- 复杂场景（拖拽、嵌套）用第三方库（@hello-pangea/dnd）。

> ⭐ 记住：**「数组字段 = 重复结构 + 增删改 + 嵌套校验」**。

下一章我们看嵌套对象与复杂校验。
`,
  },

  // ============================================================
  // 第三十三章
  // ============================================================
  {
    id: "mantine3-ch33",
    group: "第四部分 Form 验证体系",
    icon: "🧬",
    title: "第三十三章 嵌套对象与复杂校验",
    content: `## 33.1 嵌套对象基础

\`\`\`ts
interface FormValues {
  user: {
    name: string;
    email: string;
  };
  address: {
    city: string;
    street: string;
  };
}

const form = useForm<FormValues>({
  initialValues: {
    user: { name: '', email: '' },
    address: { city: '', street: '' },
  },
});

// 用点号访问
<TextInput {...form.getInputProps('user.name')} />
<TextInput {...form.getInputProps('address.city')} />
\`\`\`

---

## 33.2 嵌套对象的校验

### 简单嵌套校验

\`\`\`ts
validate: {
  'user.name': (value) => (value ? null : '姓名必填'),
  'user.email': (value) => (/^\\S+@\\S+\\.\\S+$/.test(value) ? null : '邮箱错误'),
  'address.city': (value) => (value ? null : '城市必填'),
}
\`\`\`

### 嵌套对象的整体校验

\`\`\`ts
validate: {
  user: (value) => {
    if (!value.name) return '姓名必填';
    if (!value.email) return '邮箱必填';
    return null;
  },
}
\`\`\`

---

## 33.3 Zod 嵌套校验

\`\`\`ts
const schema = z.object({
  user: z.object({
    name: z.string().min(1, '姓名必填'),
    email: z.string().email('邮箱错误'),
  }),
  address: z.object({
    city: z.string().min(1, '城市必填'),
    street: z.string().min(1, '街道必填'),
    zipCode: z.string().regex(/^\\d{6}$/, '邮编必须是 6 位数字'),
  }),
});

const form = useForm({
  validate: zodResolver(schema),
  initialValues: { /* ... */ },
});
\`\`\`

---

## 33.4 跨字段校验（refine）

\`\`\`ts
const schema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: '两次密码不一致',
    path: ['confirmPassword'],  // 错误归到 confirmPassword 字段
  }
);
\`\`\`

---

## 33.5 条件校验（discriminatedUnion）

\`\`\`ts
const schema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('personal'),
    name: z.string(),
  }),
  z.object({
    type: z.literal('company'),
    companyName: z.string(),
    taxId: z.string(),
  }),
]);
\`\`\`

\`\`\`tsx
function Form() {
  const form = useForm({
    initialValues: {
      type: 'personal' as 'personal' | 'company',
      name: '',
      companyName: '',
      taxId: '',
    },
    validate: zodResolver(schema),
  });

  return (
    <>
      <Select
        data={['personal', 'company']}
        {...form.getInputProps('type')}
      />
      {form.values.type === 'personal' ? (
        <TextInput label="姓名" {...form.getInputProps('name')} />
      ) : (
        <>
          <TextInput label="公司名" {...form.getInputProps('companyName')} />
          <TextInput label="税号" {...form.getInputProps('taxId')} />
        </>
      )}
    </>
  );
}
\`\`\`

---

## 33.6 条件校验（superRefine）

\`\`\`ts
const schema = z.object({
  hasCompany: z.boolean(),
  companyName: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.hasCompany && !data.companyName) {
    ctx.addIssue({
      path: ['companyName'],
      code: z.ZodIssueCode.custom,
      message: '勾选「有公司」时公司名必填',
    });
  }
});
\`\`\`

---

## 33.7 复杂实战：用户注册（多步骤 + 条件字段）

\`\`\`ts
const registerSchema = z.object({
  // 步骤 1：基础信息
  username: z.string().min(3, '用户名至少 3 位'),
  email: z.string().email('邮箱格式错误'),
  password: z.string().min(8, '密码至少 8 位'),
  confirmPassword: z.string(),

  // 步骤 2：个人信息
  profile: z.object({
    firstName: z.string().min(1, '名必填'),
    lastName: z.string().min(1, '姓必填'),
    age: z.number().min(18, '必须年满 18 岁'),
    gender: z.enum(['male', 'female', 'other']),
  }),

  // 步骤 3：偏好（条件字段）
  preferences: z.object({
    receiveNewsletter: z.boolean(),
    newsletterEmail: z.string().email().optional(),
    receiveSMS: z.boolean(),
    phoneNumber: z.string().optional(),
  }),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: '两次密码不一致', path: ['confirmPassword'] }
).superRefine((data, ctx) => {
  // 条件校验：勾选 newsletter 必须填邮箱
  if (data.preferences.receiveNewsletter && !data.preferences.newsletterEmail) {
    ctx.addIssue({
      path: ['preferences', 'newsletterEmail'],
      code: z.ZodIssueCode.custom,
      message: '勾选订阅时邮箱必填',
    });
  }
  // 条件校验：勾选 SMS 必须填手机
  if (data.preferences.receiveSMS && !data.preferences.phoneNumber) {
    ctx.addIssue({
      path: ['preferences', 'phoneNumber'],
      code: z.ZodIssueCode.custom,
      message: '勾选短信时手机号必填',
    });
  }
  // 手机号格式
  if (data.preferences.phoneNumber && !/^1[3-9]\\d{9}$/.test(data.preferences.phoneNumber)) {
    ctx.addIssue({
      path: ['preferences', 'phoneNumber'],
      code: z.ZodIssueCode.custom,
      message: '手机号格式错误',
    });
  }
});

type RegisterValues = z.infer<typeof registerSchema>;
\`\`\`

\`\`\`tsx
function RegisterForm() {
  const [step, setStep] = useState(0);
  const form = useForm<RegisterValues>({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      profile: {
        firstName: '',
        lastName: '',
        age: 18,
        gender: 'male',
      },
      preferences: {
        receiveNewsletter: false,
        newsletterEmail: '',
        receiveSMS: false,
        phoneNumber: '',
      },
    },
    validate: zodResolver(registerSchema),
  });

  return (
    <form onSubmit={form.onSubmit((values) => console.log(values))}>
      <Stepper active={step}>
        <Stepper.Step label="账号">
          <TextInput label="用户名" {...form.getInputProps('username')} />
          <TextInput label="邮箱" {...form.getInputProps('email')} />
          <PasswordInput label="密码" {...form.getInputProps('password')} />
          <PasswordInput label="确认密码" {...form.getInputProps('confirmPassword')} />
        </Stepper.Step>
        <Stepper.Step label="个人信息">
          <TextInput label="名" {...form.getInputProps('profile.firstName')} />
          <TextInput label="姓" {...form.getInputProps('profile.lastName')} />
          <NumberInput label="年龄" {...form.getInputProps('profile.age')} />
          <Radio.Group label="性别" {...form.getInputProps('profile.gender')}>
            <Radio value="male" label="男" />
            <Radio value="female" label="女" />
            <Radio value="other" label="其他" />
          </Radio.Group>
        </Stepper.Step>
        <Stepper.Step label="偏好">
          <Checkbox
            label="订阅邮件"
            {...form.getInputProps('preferences.receiveNewsletter', { type: 'checkbox' })}
          />
          {form.values.preferences.receiveNewsletter && (
            <TextInput
              label="订阅邮箱"
              {...form.getInputProps('preferences.newsletterEmail')}
            />
          )}
          <Checkbox
            label="接收短信"
            {...form.getInputProps('preferences.receiveSMS', { type: 'checkbox' })}
          />
          {form.values.preferences.receiveSMS && (
            <TextInput
              label="手机号"
              {...form.getInputProps('preferences.phoneNumber')}
            />
          )}
        </Stepper.Step>
      </Stepper>

      <Group justify="space-between" mt="xl">
        <Button variant="default" onClick={() => setStep(step - 1)} disabled={step === 0}>
          上一步
        </Button>
        {step < 2 ? (
          <Button onClick={() => setStep(step + 1)}>下一步</Button>
        ) : (
          <Button type="submit">提交</Button>
        )}
      </Group>
    </form>
  );
}
\`\`\`

---

## 33.8 实战：嵌套对象 + 数组

\`\`\`ts
interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface Order {
  customerId: string;
  shipping: {
    name: string;
    address: string;
    phone: string;
  };
  items: OrderItem[];
  payment: {
    method: 'credit' | 'alipay' | 'wechat';
    cardNumber?: string;
  };
}

const orderSchema = z.object({
  customerId: z.string().min(1, '客户必填'),
  shipping: z.object({
    name: z.string().min(1, '收货人必填'),
    address: z.string().min(1, '地址必填'),
    phone: z.string().regex(/^1[3-9]\\d{9}$/, '手机号错误'),
  }),
  items: z.array(z.object({
    productId: z.string().min(1, '产品必选'),
    quantity: z.number().min(1, '数量至少 1'),
    price: z.number().min(0, '价格 ≥ 0'),
  })).min(1, '至少 1 个商品'),
  payment: z.object({
    method: z.enum(['credit', 'alipay', 'wechat']),
    cardNumber: z.string().optional(),
  }),
}).superRefine((data, ctx) => {
  // 信用卡支付必须填卡号
  if (data.payment.method === 'credit' && !data.payment.cardNumber) {
    ctx.addIssue({
      path: ['payment', 'cardNumber'],
      code: z.ZodIssueCode.custom,
      message: '信用卡支付必须填卡号',
    });
  }
});
\`\`\`

---

## 33.9 嵌套对象的手动设置错误

\`\`\`jsx
// 单个字段
form.setFieldError('user.email', '邮箱已被注册');

// 嵌套对象
form.setFieldError('address.city', '城市必填');

// 多个错误
form.setErrors({
  'user.email': '邮箱已被注册',
  'user.name': '用户名已被占用',
  'address.zipCode': '邮编错误',
});
\`\`\`

---

## 33.10 嵌套对象的 transform

\`\`\`ts
const schema = z.object({
  name: z.string().transform((val) => val.trim()),
  email: z.string().email().transform((val) => val.toLowerCase()),
  age: z.string().transform((val) => parseInt(val, 10)),
});
\`\`\`

\`\`\`tsx
const form = useForm({
  initialValues: { name: '', email: '', age: '' },
  validate: zodResolver(schema),
  transformValues: (values) => ({
    name: values.name.trim(),
    email: values.email.toLowerCase(),
    age: Number(values.age),
  }),
});
\`\`\`

---

## 33.11 实战：复杂表单（含嵌套 + 数组 + 条件 + 跨字段）

\`\`\`ts
interface ResumeValues {
  basic: {
    name: string;
    email: string;
    phone: string;
  };
  experiences: Array<{
    company: string;
    position: string;
    startDate: Date;
    endDate: Date | null;
    isCurrent: boolean;
    description: string;
  }>;
  educations: Array<{
    school: string;
    degree: string;
    startDate: Date;
    endDate: Date;
  }>;
}

const resumeSchema = z.object({
  basic: z.object({
    name: z.string().min(1, '姓名必填'),
    email: z.string().email('邮箱错误'),
    phone: z.string().regex(/^1[3-9]\\d{9}$/, '手机号错误'),
  }),
  experiences: z.array(
    z.object({
      company: z.string().min(1, '公司必填'),
      position: z.string().min(1, '职位必填'),
      startDate: z.date(),
      endDate: z.date().nullable(),
      isCurrent: z.boolean(),
      description: z.string().min(10, '描述至少 10 字'),
    }).refine(
      (data) => data.isCurrent || data.endDate !== null,
      { message: '非当前职位必须填结束日期', path: ['endDate'] }
    ).refine(
      (data) => data.isCurrent || (data.endDate && data.endDate > data.startDate),
      { message: '结束日期必须晚于开始日期', path: ['endDate'] }
    )
  ),
  educations: z.array(
    z.object({
      school: z.string().min(1, '学校必填'),
      degree: z.string().min(1, '学历必填'),
      startDate: z.date(),
      endDate: z.date(),
    }).refine(
      (data) => data.endDate > data.startDate,
      { message: '结束日期必须晚于开始日期', path: ['endDate'] }
    )
  ),
});
\`\`\`

---

## 33.12 性能优化

### 大表单 + 嵌套对象

\`\`\`jsx
// ✅ 用 uncontrolled 模式
const form = useForm({
  mode: 'uncontrolled',
  initialValues: { /* 大对象 */ },
});

// ✅ 用 React.memo 包装子组件
const NestedField = React.memo(({ form, path }) => {
  return <TextInput {...form.getInputProps(path)} />;
});
\`\`\`

### 用 useDeferredValue 延迟输入

\`\`\`jsx
import { useDeferredValue } from 'react';

function Form() {
  const form = useForm({ /* ... */ });
  const deferredEmail = useDeferredValue(form.values.email);

  // 依赖 deferredEmail 的重计算会被延迟
  return <Preview email={deferredEmail} />;
}
\`\`\`

---

## 33.13 常见错误

### 错误 1：getInputProps 路径错误

\`\`\`jsx
// ❌ 错误路径
form.getInputProps('user.email');  // 但 initialValues 里没有 user

// ✅ 修正 initialValues
initialValues: { user: { email: '' } }
\`\`\`

### 错误 2：嵌套对象的 form.setFieldValue

\`\`\`jsx
// ❌ 浅设置
form.setFieldValue('user', { name: 'new' });  // 整个 user 被替换

// ✅ 点号设置
form.setFieldValue('user.name', 'new');  // 只修改 name
\`\`\`

### 错误 3：discriminatedUnion 的 type 没传

\`\`\`ts
// ❌ 没 type
form.getInputProps('name');  // type 不知道是哪种

// ✅ 传 type
form.getInputProps('name');  // TypeScript 根据 type 推断
\`\`\`

---

## 33.14 小结

- 嵌套对象用点号访问：\`user.email\` / \`address.city\`。
- 嵌套校验用 Zod 的 \`z.object({ ... })\`。
- 跨字段校验用 \`refine\`。
- 条件校验用 \`superRefine\` 或 \`discriminatedUnion\`。
- 错误可以归到具体路径：\`path: ['user', 'email']\`。
- 大表单用 **uncontrolled 模式 + React.memo**。

> ⭐ 记住：**「Zod schema + superRefine + 嵌套对象 = 最强校验」**。

---

## 第四部分上半总结

到这里，我们讲完了 **Form 验证体系**的前半部分：

- 第二十六章：useForm 基础与设计哲学
- 第二十七章：校验函数与错误信息
- 第二十八章：getInputProps 与受控模式
- 第二十九章：校验时机：blur / change / submit
- 第三十章：Zod 联动
- 第三十一章：动态字段
- 第三十二章：数组字段
- 第三十三章：嵌套对象与复杂校验

接下来进入 **Form 验证体系**的后半部分 + 综合实战，我们看 form 在 Next.js 中的最佳实践、模态框表单、复杂业务场景。
`,
  },
];

export { chapters };
