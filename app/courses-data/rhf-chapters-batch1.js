export const chapters = [
  {
    id: "rhf-intro",
    group: "基础入门",
    icon: "🚀",
    title: "React Hook Form 快速上手",
    content: `# React Hook Form 快速上手

## 为什么选择 React Hook Form？

React Hook Form 是一个轻量级、高性能的 React 表单库，具有以下优势：

- **超小包体积**：约 8KB gzipped，几乎零依赖
- **高性能**：基于 uncontrolled components，减少重渲染
- **TypeScript 友好**：原生支持 TypeScript，类型推断优秀
- **简单易用**：API 简洁直观，学习成本低
- **生态完善**：支持 Zod/Yup/Joi 等验证库，与 MUI/AntD 等 UI 库无缝集成

---

## 安装

使用 npm 或 yarn/pnpm 安装：

\`\`\`bash
npm install react-hook-form
\`\`\`

或者：

\`\`\`bash
yarn add react-hook-form
pnpm add react-hook-form
\`\`\`

---

## 最小示例

这是一个最简单的表单，只有 3 个核心概念：

1. **\`useForm\`**：Hook，返回表单方法和状态
2. **\`register\`**：注册输入框，让表单追踪它的值
3. **\`handleSubmit\`**：包装提交函数，先验证再执行

\`\`\`jsx
import { useForm } from "react-hook-form";

export default function SimpleForm() {
  // 1. 调用 useForm，获取需要的方法
  const { register, handleSubmit } = useForm();

  // 2. 提交回调：只有验证通过才会执行
  const onSubmit = (data) => {
    console.log("表单数据：", data);
    alert("提交成功！" + JSON.stringify(data, null, 2));
  };

  return (
    {/* 3. handleSubmit 包裹你的提交函数 */}
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* 4. 用 register("字段名") 注册输入框 */}
      <input placeholder="用户名" {...register("username")} />
      
      <input type="password" placeholder="密码" {...register("password")} />
      
      <button type="submit">提交</button>
    </form>
  );
}
\`\`\`

就这么简单！提交表单时，\`data\` 对象会包含所有注册字段的值：

\`\`\`json
{
  "username": "张三",
  "password": "123456"
}
\`\`\`

---

## 核心概念：register 的工作原理

\`register\` 函数会返回一个对象，包含以下属性：

\`\`\`javascript
// register("username") 返回的对象大致长这样：
{
  name: "username",
  ref: (ref) => { /* 绑定 ref 用于聚焦等操作 */ },
  onChange: (e) => { /* 追踪值变化 */ },
  onBlur: (e) => { /* 标记是否被触碰过 */ }
}
\`\`\`

通过 \`{...register("字段名")}\` 展开运算符，这些属性会被传递给 input 元素，React Hook Form 就能自动：
- 追踪字段值
- 处理验证
- 管理聚焦状态

---

## 对比原生表单 vs React Hook Form

### 原生方式（受控组件）

\`\`\`jsx
// 原生受控组件：每个字段都要一个 state
import { useState } from "react";

function NativeForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ username, password, email });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="用户名"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="密码"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="邮箱"
      />
      <button type="submit">提交</button>
    </form>
  );
}
\`\`\`

### React Hook Form 方式

\`\`\`jsx
// React Hook Form：不需要手动写 state！
import { useForm } from "react-hook-form";

function RHFForm() {
  const { register, handleSubmit } = useForm();
  const onSubmit = (data) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input placeholder="用户名" {...register("username")} />
      <input type="password" placeholder="密码" {...register("password")} />
      <input type="email" placeholder="邮箱" {...register("email")} />
      <button type="submit">提交</button>
    </form>
  );
}
\`\`\`

看到区别了吗？字段越多，React Hook Form 的优势越明显——不用再写一堆 \`useState\` 和 \`onChange\` 了！

---

## 本章小结

✅ 只需一行 \`npm install react-hook-form\` 安装
✅ \`useForm()\` 获取表单方法
✅ \`register("字段名")\` 注册输入框
✅ \`handleSubmit(onSubmit)\` 处理提交，验证通过才执行
✅ 字段值自动收集在 \`data\` 对象中

下一章我们学习如何添加表单验证！`,
    code: `// React Hook Form 快速上手示例
// 这是一个可运行的最小示例代码
// 在你的 React 项目中复制以下代码即可使用

import { useForm } from "react-hook-form";

// 最简单的登录表单
export default function LoginForm() {
  // 从 useForm 解构出需要的方法
  const {
    register,        // 注册输入框
    handleSubmit,    // 处理表单提交
    formState: { errors }, // 错误状态（下一章详细讲）
  } = useForm();

  // 提交成功时执行
  const onSubmit = (data) => {
    console.log("=== 表单提交数据 ===");
    console.log("用户名:", data.username);
    console.log("密码:", data.password);
    console.log("完整数据:", data);
    alert("提交成功！请查看控制台输出");
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 20 }}>
      <h2>🔐 登录表单</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: 12 }}>
          <label>用户名：</label>
          <input
            placeholder="请输入用户名"
            style={{ width: "100%", padding: 8, marginTop: 4 }}
            {...register("username")}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>密码：</label>
          <input
            type="password"
            placeholder="请输入密码"
            style={{ width: "100%", padding: 8, marginTop: 4 }}
            {...register("password")}
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: 10,
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 16
          }}
        >
          登录
        </button>
      </form>

      <p style={{ marginTop: 20, fontSize: 12, color: "#666" }}>
        💡 提示：填写表单后点击登录，打开浏览器控制台（F12）查看输出
      </p>
    </div>
  );
}
`,
  },

  {
    id: "rhf-validation",
    group: "基础入门",
    icon: "✅",
    title: "表单验证",
    content: `# 表单验证

表单验证是开发中最常见的需求。React Hook Form 让验证变得非常简单！

---

## 内置验证规则

\`register\` 的第二个参数接受一个配置对象，可以直接写验证规则：

\`\`\`jsx
<input
  {...register("username", {
    required: "用户名不能为空",        // 必填，错误提示信息
    minLength: {                      // 最小长度
      value: 2,
      message: "用户名至少 2 个字符"
    },
    maxLength: {                      // 最大长度
      value: 20,
      message: "用户名最多 20 个字符"
    }
  })}
/>
\`\`\`

---

## 常用验证规则一览

| 规则 | 类型 | 说明 | 示例 |
|------|------|------|------|
| \`required\` \| boolean \| string | 是否必填 | \`required: "必填项"\` |
| \`minLength\` \| number \| object | 最小长度 | \`minLength: 2\` |
| \`maxLength\` \| number \| object | 最大长度 | \`maxLength: 20\` |
| \`min\` \| number \| object | 最小值（数字） | \`min: 18\` |
| \`max\` \| number \| object | 最大值（数字） | \`max: 100\` |
| \`pattern\` \| RegExp \| object | 正则匹配 | \`pattern: /^[A-Za-z]+$/\` |
| \`validate\` \| function \| 自定义验证函数 | \`validate: v => v > 10 || "太小了"\` |

---

## 显示错误信息

错误信息在 \`formState.errors\` 中，按字段名访问：

\`\`\`jsx
const {
  register,
  handleSubmit,
  formState: { errors }  // 从 formState 解构 errors
} = useForm();

// JSX 中
<div>
  <input {...register("email", {
    required: "邮箱不能为空",
    pattern: {
      value: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/,
      message: "请输入有效的邮箱地址"
    }
  })} />
  {/* 如果有错误，显示红色提示 */}
  {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}
</div>
\`\`\`

---

## 完整的验证示例

\`\`\`jsx
import { useForm } from "react-hook-form";

function ValidationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = (data) => {
    console.log("验证通过:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* 用户名：必填，2-20字符 */}
      <div>
        <input
          placeholder="用户名"
          {...register("username", {
            required: "请输入用户名",
            minLength: { value: 2, message: "至少2个字符" },
            maxLength: { value: 20, message: "最多20个字符" }
          })}
        />
        {errors.username && <span className="error">{errors.username.message}</span>}
      </div>

      {/* 年龄：数字，18-99 */}
      <div>
        <input
          type="number"
          placeholder="年龄"
          {...register("age", {
            min: { value: 18, message: "年龄必须满18岁" },
            max: { value: 99, message: "年龄不能超过99岁" }
          })}
        />
        {errors.age && <span className="error">{errors.age.message}</span>}
      </div>

      {/* 邮箱：正则验证格式 */}
      <div>
        <input
          type="email"
          placeholder="邮箱"
          {...register("email", {
            required: "请输入邮箱",
            pattern: {
              value: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/,
              message: "邮箱格式不正确"
            }
          })}
        />
        {errors.email && <span className="error">{errors.email.message}</span>}
      </div>

      <button type="submit">提交</button>
    </form>
  );
}
\`\`\`

---

## 自定义验证（validate）

\`validate\` 是最灵活的验证方式，支持异步！

### 同步自定义验证

\`\`\`jsx
<input
  {...register("password", {
    required: "请输入密码",
    validate: (value) => {
      // 返回 true 表示验证通过
      // 返回字符串表示错误信息
      if (value.length < 6) return "密码至少6位";
      if (!/[A-Z]/.test(value)) return "密码必须包含大写字母";
      if (!/[0-9]/.test(value)) return "密码必须包含数字";
      return true; // 验证通过
    }
  })}
/>
\`\`\`

### 异步自定义验证

\`validate\` 也可以返回 Promise，比如检查用户名是否已存在：

\`\`\`jsx
<input
  {...register("username", {
    required: "请输入用户名",
    validate: async (value) => {
      // 模拟 API 调用检查用户名是否重复
      const response = await fetch(\`/api/check-username?name=\${value}\`);
      const isTaken = await response.json();
      
      if (isTaken) return "该用户名已被注册";
      return true;
    }
  })}
/>
\`\`\`

---

## 验证模式（mode）

默认情况下，验证在**提交时**触发。你可以通过 \`mode\` 配置改变触发时机：

\`\`\`jsx
const { register, handleSubmit, formState: { errors } } = useForm({
  mode: "onBlur"  // 可选值：onSubmit | onBlur | onChange | onTouched | all
});
\`\`\`

| mode | 触发时机 | 说明 |
|------|---------|------|
| \`onSubmit\` | 默认值 | 提交时验证 |
| \`onBlur\` | 失去焦点时 | 输入框离开时验证，用户体验好 |
| \`onChange\` | 值变化时 | 每次输入都验证，性能稍差 |
| \`onTouched\` | 首次失去焦点后 | 第一次 blur 后，每次 change 都验证 |
| \`all\` | blur + change | 最实时的验证 |

**推荐**：大多数场景用 \`onBlur\` 体验最好，既及时又不会太频繁。

---

## 确认密码验证（字段依赖）

validate 函数可以接收第二个参数，获取所有表单字段的值，用于确认密码这种场景：

\`\`\`jsx
<input
  type="password"
  placeholder="确认密码"
  {...register("confirmPassword", {
    required: "请确认密码",
    validate: (value, formValues) => {
      // formValues 包含所有字段的值
      if (value !== formValues.password) {
        return "两次输入的密码不一致";
      }
      return true;
    }
  })}
/>
\`\`\`

---

## 本章小结

✅ 在 \`register\` 第二个参数写验证规则
✅ 内置规则：\`required\`, \`minLength\`, \`maxLength\`, \`min\`, \`max\`, \`pattern\`
✅ \`validate\` 支持自定义同步/异步验证
✅ 错误信息在 \`formState.errors\` 中
✅ \`mode\` 配置可以改变验证触发时机
✅ 确认密码场景用 \`validate(value, formValues)\` 实现

下一章学习各种常见输入控件的处理！`,
    code: `import { useForm } from "react-hook-form";

// 完整的注册表单验证示例
export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    mode: "onBlur" // 失去焦点时验证，用户体验更好
  });

  const onSubmit = async (data) => {
    // 模拟 API 请求
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("注册数据:", data);
    alert("注册成功！\\n" + JSON.stringify(data, null, 2));
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 20 }}>
      <h2>📝 用户注册</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 用户名 */}
        <div style={{ marginBottom: 12 }}>
          <label>用户名 *</label>
          <input
            placeholder="2-20个字符"
            style={{
              width: "100%",
              padding: 8,
              marginTop: 4,
              border: errors.username ? "1px solid red" : "1px solid #ddd"
            }}
            {...register("username", {
              required: "用户名不能为空",
              minLength: { value: 2, message: "至少2个字符" },
              maxLength: { value: 20, message: "最多20个字符" }
            })}
          />
          {errors.username && (
            <p style={{ color: "red", fontSize: 12, margin: "4px 0 0" }}>
              {errors.username.message}
            </p>
          )}
        </div>

        {/* 邮箱 */}
        <div style={{ marginBottom: 12 }}>
          <label>邮箱 *</label>
          <input
            type="email"
            placeholder="example@email.com"
            style={{
              width: "100%",
              padding: 8,
              marginTop: 4,
              border: errors.email ? "1px solid red" : "1px solid #ddd"
            }}
            {...register("email", {
              required: "邮箱不能为空",
              pattern: {
                value: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/,
                message: "请输入有效的邮箱地址"
              }
            })}
          />
          {errors.email && (
            <p style={{ color: "red", fontSize: 12, margin: "4px 0 0" }}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* 年龄 */}
        <div style={{ marginBottom: 12 }}>
          <label>年龄</label>
          <input
            type="number"
            placeholder="18-99"
            style={{
              width: "100%",
              padding: 8,
              marginTop: 4,
              border: errors.age ? "1px solid red" : "1px solid #ddd"
            }}
            {...register("age", {
              min: { value: 18, message: "必须满18岁" },
              max: { value: 99, message: "年龄不能超过99岁" }
            })}
          />
          {errors.age && (
            <p style={{ color: "red", fontSize: 12, margin: "4px 0 0" }}>
              {errors.age.message}
            </p>
          )}
        </div>

        {/* 密码 */}
        <div style={{ marginBottom: 12 }}>
          <label>密码 *</label>
          <input
            type="password"
            placeholder="至少6位，包含大写字母和数字"
            style={{
              width: "100%",
              padding: 8,
              marginTop: 4,
              border: errors.password ? "1px solid red" : "1px solid #ddd"
            }}
            {...register("password", {
              required: "密码不能为空",
              validate: (value) => {
                if (value.length < 6) return "密码至少6位";
                if (!/[A-Z]/.test(value)) return "必须包含大写字母";
                if (!/[0-9]/.test(value)) return "必须包含数字";
                return true;
              }
            })}
          />
          {errors.password && (
            <p style={{ color: "red", fontSize: 12, margin: "4px 0 0" }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* 确认密码 */}
        <div style={{ marginBottom: 12 }}>
          <label>确认密码 *</label>
          <input
            type="password"
            placeholder="再次输入密码"
            style={{
              width: "100%",
              padding: 8,
              marginTop: 4,
              border: errors.confirmPassword ? "1px solid red" : "1px solid #ddd"
            }}
            {...register("confirmPassword", {
              required: "请确认密码",
              validate: (value, formValues) =>
                value === formValues.password || "两次密码不一致"
            })}
          />
          {errors.confirmPassword && (
            <p style={{ color: "red", fontSize: 12, margin: "4px 0 0" }}>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: 10,
            background: isSubmitting ? "#ccc" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            fontSize: 16
          }}
        >
          {isSubmitting ? "提交中..." : "注册"}
        </button>
      </form>
    </div>
  );
}
`,
  },
];
