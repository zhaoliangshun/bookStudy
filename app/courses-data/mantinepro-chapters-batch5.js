// =============================================================
// Mantine v9 深度实战 —— 第 5 批章节（Form 高级 + 总结）
// -------------------------------------------------------------
// 转义规则:content 内部反引号写作 \`,\${ 写作 \$\{。
// =============================================================

export const chapters = [
  {
    id: "mantinepro-form-state",
    icon: "⚡",
    title: "表单状态管理与高级用法",
    group: "三、Mantine Form 验证",
    content: `# 表单状态管理与高级用法

## 一、表单状态

### 1.1 touched 状态

touched 表示字段是否被用户聚焦或修改过：

\`\`\`jsx
// 检查是否 touched
form.isTouched();           // 任何字段被 touched
form.isTouched('email');    // 指定字段
form.isTouched('user.name'); // 嵌套字段

// 设置 touched
form.setTouched({ email: true });

// 重置
form.resetTouched();
\`\`\`

### 1.2 dirty 状态

dirty 表示字段值是否与 initialValues 不同：

\`\`\`jsx
// 检查是否 dirty
form.isDirty();           // 任何字段被修改
form.isDirty('email');    // 指定字段

// 设置 dirty
form.setDirty({ email: true });

// 重置 dirty：将当前值保存为新的 initialValues 快照
form.resetDirty();
\`\`\`

dirty 状态常用于"离开页面时提示未保存的更改"：

\`\`\`jsx
useEffect(() => {
  const handleBeforeUnload = (e) => {
    if (form.isDirty()) {
      e.preventDefault();
      e.returnValue = '';
    }
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [form]);
\`\`\`

### 1.3 submitting 状态

当 onSubmit 回调返回 Promise 时，submitting 自动为 true：

\`\`\`jsx
const form = useForm({
  mode: 'uncontrolled',
  initialValues: { email: '', password: '' },
});

const handleSubmit = async (values) => {
  // 此 Promise 执行期间 form.submitting 为 true
  await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify(values),
  });
};

return (
  <form onSubmit={form.onSubmit(handleSubmit)}>
    {/* 提交时禁用输入 */}
    <TextInput disabled={form.submitting} {...form.getInputProps('email')} />
    {/* 按钮显示 loading */}
    <Button type="submit" loading={form.submitting}>登录</Button>
  </form>
);
\`\`\`

也可以手动控制：\`form.setSubmitting(true/false)\`

### 1.4 validating 状态

异步验证进行中时，validating 为 true：

\`\`\`jsx
// 任何字段正在验证
form.validating;

// 指定字段正在验证
form.isValidating('username');

// 用法：用户名输入时显示"正在检查..."
<TextInput
  label="用户名"
  rightSection={form.isValidating('username') ? <Loader size="xs" /> : null}
  {...form.getInputProps('username')}
/>;
\`\`\`

---

## 二、表单值操作

### 2.1 获取和设置值

\`\`\`jsx
// 获取所有值
const values = form.getValues();

// 设置多个值
form.setValues({ name: 'John', age: 25 });
// 函数式更新
form.setValues((prev) => ({ ...prev, age: prev.age + 1 }));

// 设置单个字段
form.setFieldValue('email', 'n**@*********');
form.setFieldValue('user.address.city', 'Beijing');
\`\`\`

### 2.2 重置和初始化

\`\`\`jsx
// 重置到 initialValues，清除错误、touched、dirty
form.reset();

// 重置单个字段
form.resetField('email');

// 设置新的 initialValues（影响后续 reset）
form.setInitialValues({ email: '', name: 'Default' });

// initialize：同时设置 initialValues 和当前值
// 常用于异步加载数据后填充表单
useEffect(() => {
  fetchUser(userId).then((user) => {
    form.initialize(user);
  });
}, [userId]);
\`\`\`

### 2.3 transformValues：提交前转换值

\`\`\`jsx
const form = useForm({
  mode: 'uncontrolled',
  initialValues: { username: '', email: '', password: '' },
  // 提交前转换值（如 trim 空格）
  transformValues: (values) => ({
    ...values,
    username: values.username.trim(),
    email: values.email.trim().toLowerCase(),
  }),
});

// 提交时 handleSubmit 收到的是转换后的值
const handleSubmit = (values) => {
  console.log(values.username); // 已 trim
};
\`\`\`

---

## 三、错误处理

\`\`\`jsx
// 手动设置错误
form.setFieldError('email', '邮箱已被注册');
form.setErrors({
  email: '邮箱已被注册',
  password: '密码太弱',
});

// 清除错误
form.clearFieldError('email');
form.clearErrors();

// 验证 API
const result = await form.validate();        // 验证所有字段
const result = await form.validateField('email'); // 验证单个字段
const isValid = await form.isValid();       // 是否全部有效
const isValid = await form.isValid('email'); // 单个字段是否有效
\`\`\`

服务端错误回填：

\`\`\`jsx
const handleSubmit = async (values) => {
  const response = await fetch('/api/register', {
    method: 'POST',
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    const errorData = await response.json();
    // 将服务端返回的错误设置到表单
    // 例如后端返回 { fieldErrors: { email: '邮箱已存在' } }
    form.setErrors(errorData.fieldErrors);
    return;
  }
};
\`\`\`

---

## 四、Form Context：跨组件共享表单

当表单被拆分成多个子组件时，使用 createFormContext 共享表单状态：

\`\`\`jsx
import { createFormContext } from '@mantine/form';

// 创建 Context，返回 [Provider, useContext, useForm]
const [FormProvider, useFormContext, useForm] = createFormContext();

// 子组件：通过 context 获取 form
function EmailField() {
  const form = useFormContext();
  return (
    <TextInput
      label="邮箱"
      key={form.key('email')}
      {...form.getInputProps('email')}
    />
  );
}

function PasswordField() {
  const form = useFormContext();
  return (
    <PasswordInput
      label="密码"
      key={form.key('password')}
      {...form.getInputProps('password')}
    />
  );
}

function SubmitButton() {
  const form = useFormContext();
  return <Button type="submit" loading={form.submitting}>提交</Button>;
}

// 父组件：创建 form 并通过 Provider 共享
function LoginForm() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { email: '', password: '' },
    validate: { email: isEmail('邮箱格式不正确') },
  });

  return (
    <FormProvider form={form}>
      <form onSubmit={form.onSubmit(console.log)}>
        <Stack>
          <EmailField />
          <PasswordField />
          <SubmitButton />
        </Stack>
      </form>
    </FormProvider>
  );
}
\`\`\`

---

## 五、Form Actions：从任何位置操作表单

给表单命名后，可以从应用的任何位置操作它（非常适合与全局状态管理配合）：

\`\`\`jsx
// ===== 在表单组件中 =====
function UserProfileForm() {
  const form = useForm({
    mode: 'uncontrolled',
    name: 'user-profile', // 给表单命名
    initialValues: { name: '', email: '' },
  });
  return <form>...</form>;
}

// ===== 在 actions 文件中 =====
import { createFormActions } from '@mantine/form';

export const userFormActions = createFormActions('user-profile');

// ===== 从任何地方调用 =====
// 比如在 API 响应后填充表单
userFormActions.setValues({ name: 'John', email: 'j***@example.com' });
userFormActions.setFieldError('email', '邮箱已存在');
userFormActions.reset();
userFormActions.validate();
\`\`\`

支持的 actions：setFieldValue、setValues、setErrors、reset、validate、setTouched、setDirty、insertListItem、removeListItem 等。

---

## 六、v8 到 v9 迁移要点

| v8 | v9 |
|----|-----|
| \`zodResolver(schema)\` | \`schemaResolver(schema)\` 或 \`schemaResolver(schema, { sync: true })\` |
| \`yupResolver(schema)\` | \`schemaResolver(schema)\` |
| \`valibotResolver(schema)\` | \`schemaResolver(schema)\` |
| 需要安装 @mantine/form 对应的 resolver 包 | 不需要额外包，schemaResolver 内置 |
| \`z.literal(true, { errorMap: () => ({ message: 'msg' }) })\` | \`z.literal(true, 'msg')\`（Zod v4 简化了） |
| form.validate() 总是同步 | schemaResolver 默认异步，需要 sync: true 才同步 |

---

## 七、最佳实践总结

### 7.1 项目结构建议

\`\`\`
features/auth/
├── schemas.js       # Zod schemas（可复用）
├── LoginForm.jsx    # 登录表单组件
└── RegisterForm.jsx # 注册表单组件
\`\`\`

将 schema 定义在独立文件中，可以在客户端和服务端复用：

\`\`\`jsx
// schemas.js
import { z } from 'zod/v4';

export const loginSchema = z.object({
  email: z.email('邮箱格式不正确'),
  password: z.string().min(1, '密码不能为空'),
});

export const registerSchema = z.object({
  username: z.string().min(2, '至少 2 字符'),
  email: z.email('邮箱格式不正确'),
  password: z.string().min(8, '至少 8 字符'),
});
\`\`\`

### 7.2 表单设计建议

1. **优先使用非受控模式**（mode: 'uncontrolled'），性能更好
2. **验证时机**：推荐 \`validateInputOnBlur: true\`，失焦时验证，不打扰输入
3. **复杂验证**用 Zod schema，简单验证用内联函数
4. **动态列表**用 \`randomId()\` 生成 key，不要用数组索引
5. **错误显示**：Mantine 组件自动显示 error 消息，不需要手动渲染
6. **异步提交**：利用 \`form.submitting\` 自动管理 loading 状态

### 7.3 常见陷阱

| 陷阱 | 解决方案 |
|------|---------|
| 忘记写 \`key={form.key('path')}\` | 非受控模式下每个字段必须写 |
| Checkbox 不工作 | 传 \`{ type: 'checkbox' }\` 给 getInputProps |
| 异步验证后 isValid() 返回 Promise | 用 \`await\` 或传 \`{ sync: true }\` |
| 列表项 key 用数组索引 | 使用 randomId() 生成唯一 key |
| 在组件内创建 theme/useForm 配置 | 提到组件外部，避免重渲染 |

---

## 本章小结

- touched/dirty/submitting/validating 四种状态覆盖各种交互场景
- getValues/setValues/reset/initialize 管理表单值的生命周期
- setErrors 可以回填服务端验证错误
- createFormContext 在深层子组件中共享表单状态
- createFormActions 从应用任何位置操作表单
- v9 统一使用 schemaResolver，不再需要独立 resolver 包
- 遵循最佳实践可以避免常见陷阱

恭喜你学完了 Mantine v9 的核心内容！最后一章是总结与实战建议。`,
  },
  {
    id: "mantinepro-summary",
    icon: "🎯",
    title: "总结：构建生产级 Mantine 应用",
    group: "四、总结与实战",
    content: `# 总结：构建生产级 Mantine 应用

## 一、核心要点回顾

### 1.1 理念层面

Mantine 的设计围绕三个核心目标：

1. **开箱即用**：零配置就能构建美观的界面
2. **开发者体验**：一致的 API、智能的默认值、优秀的 TypeScript 支持
3. **可定制性**：从 Style Props 到 Styles API，多层级定制能力

v9 新增了**AI 工作流优化**，让 AI 编程工具能更好地生成 Mantine 代码。

### 1.2 Theme 层面

- \`createTheme()\` 创建主题覆盖，在组件外部定义
- \`MantineProvider\` 在根节点提供主题上下文
- 颜色是 10 色阶数组，支持 virtualColor 和 generateColors
- CSS 变量引擎让主题切换高性能
- Styles API（classNames/styles/vars）可以精确控制组件内部元素
- \`Component.extend()\` 在主题中全局覆盖组件默认 props 和样式

### 1.3 Form 层面

- \`useForm\` 管理表单状态、验证和提交
- \`mode: 'uncontrolled'\` + \`key={form.key()}\` 是推荐模式
- 验证方式：内联函数、内置验证器、schemaResolver（Zod/Valibot）
- v9 用 schemaResolver 统一所有 schema 库验证
- 嵌套字段用点号路径，数组字段用 insertListItem/removeListItem
- touched/dirty/submitting/validating 状态自动管理

---

## 二、生产级项目配置模板

### 2.1 Next.js App Router 完整配置

\`\`\`jsx
// app/layout.js
import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { theme } from '@/theme'; // 主题配置抽离到独立文件

export const metadata = {
  title: 'My Mantine App',
  description: 'Built with Mantine v9',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
\`\`\`

### 2.2 主题配置文件

\`\`\`jsx
// theme/index.js
import { createTheme, Button, TextInput, Card, Table } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'indigo',
  primaryShade: { light: 6, dark: 4 },
  defaultRadius: 'md',
  autoContrast: true,

  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  headings: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '700',
  },

  components: {
    Button: Button.extend({
      defaultProps: { fw: 500 },
    }),
    TextInput: TextInput.extend({
      defaultProps: { radius: 'md' },
    }),
    Card: Card.extend({
      defaultProps: { padding: 'lg', radius: 'md', withBorder: true },
    }),
  },

  other: {
    sidebarWidth: 260,
    headerHeight: 64,
  },
});
\`\`\`

---

## 三、常见场景实现指南

### 3.1 暗色模式切换

\`\`\`jsx
'use client';

import {
  useMantineColorScheme,
  useComputedColorScheme,
  ActionIcon,
} from '@mantine/core';

export function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme('light');

  return (
    <ActionIcon
      variant="subtle"
      size="lg"
      onClick={() => setColorScheme(computed === 'dark' ? 'light' : 'dark')}
      aria-label="切换主题"
    >
      {computed === 'dark' ? '☀️' : '🌙'}
    </ActionIcon>
  );
}
\`\`\`

### 3.2 全局通知

\`\`\`bash
npm install @mantine/notifications
\`\`\`

\`\`\`jsx
// app/layout.js
import '@mantine/notifications/styles.css';
import { Notifications } from '@mantine/notifications';

<MantineProvider theme={theme}>
  <Notifications position="top-right" />
  {children}
</MantineProvider>
\`\`\`

\`\`\`jsx
import { notifications } from '@mantine/notifications';

// 使用
notifications.show({
  title: '成功',
  message: '操作已完成',
  color: 'green',
});

notifications.show({
  title: '错误',
  message: '操作失败，请重试',
  color: 'red',
});
\`\`\`

### 3.3 模态框管理

\`\`\`bash
npm install @mantine/modals
\`\`\`

\`\`\`jsx
import { ModalsProvider, modals } from '@mantine/modals';

// 确认删除
modals.openConfirmModal({
  title: '确认删除',
  children: '此操作不可撤销，确定要删除吗？',
  labels: { confirm: '删除', cancel: '取消' },
  confirmProps: { color: 'red' },
  onConfirm: () => deleteItem(id),
});
\`\`\`

---

## 四、性能优化建议

1. **非受控模式**：表单使用 \`mode: 'uncontrolled'\`，输入不触发重渲染
2. **主题在组件外创建**：createTheme 不要在组件 body 内调用
3. **列表使用 key**：动态列表始终用唯一 key
4. **合理使用 memo**：复杂子组件用 React.memo 包裹
5. **避免 inline 对象**：Styles API 的 styles/classNames 对象如果不需要 props 响应，提到组件外

---

## 五、延伸学习资源

- [Mantine 官方文档](https://mantine.dev/)——最权威的 API 参考
- [Mantine GitHub](https://github.com/mantinedev/mantine)——源码和 issues
- [Standard Schema 规范](https://standardschema.dev/)——了解 schema 统一标准
- [Zod v4 文档](https://zod.dev/v4)——深入学习 Zod 验证

---

## 结语

Mantine 是一个深思熟虑的 React 组件库，它的每一个 API 设计都在平衡"开箱即用"和"深度定制"。v9 版本通过拥抱 React 19、Standard Schema 和 AI 工作流，进一步巩固了其作为现代 React 应用最佳 UI 解决方案之一的地位。

希望本书帮助你：

- 🎯 理解 Mantine 的设计哲学，而不仅仅是记忆 API
- 🎨 掌握主题系统，打造独特的品牌视觉
- 📋 精通表单验证，构建健壮的数据录入界面
- 🚀 能够在生产项目中自信地使用 Mantine

祝你用 Mantine 构建出优秀的应用！🎨`,
  },
];
