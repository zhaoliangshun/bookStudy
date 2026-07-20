// =============================================================
// TypeScript + React 教程 —— 第十三批章节（表单与校验，共 5 章）
// -------------------------------------------------------------
// 覆盖：表单设计模式 / 自定义 useForm / Zod 校验 / React Hook Form / 复杂表单
// 沙箱支持 react 18、react-dom 18；其他库（zod、rhf）通过"概念演示 + 手写实现"方式呈现。
// 章节 ID：tsx2-ch61 ~ tsx2-ch65
// 分组：第十三部分 表单与校验
// =============================================================

const chapters = [
  // =========================================================
  // 第六十一章 表单设计模式
  // =========================================================
  {
    id: "tsx2-ch61",
    group: "第十三部分 表单与校验",
    icon: "📋",
    title: "第六十一章 表单设计模式",
    content: `# 第六十一章 表单设计模式

表单是 Web 应用最常见的交互之一。一个看似简单的"输入 + 提交"背后，涉及受控方式、状态粒度、校验时机、错误展示等一系列设计决策。本章梳理表单的核心模式，帮助你在面对任何表单需求时都能快速选型。

---

## 一、受控 vs 非受控

React 表单的两大流派：**受控组件**（controlled）和**非受控组件**（uncontrolled）。

### 1. 受控组件（推荐）

React 状态是"单一真相源"——输入值由 React state 决定，onChange 同步写入 state。

\`\`\`tsx
import { useState } from "react";

// 受控组件：value 由 React state 控制
function ControlledInput() {
  const [value, setValue] = useState("");   // 用 useState 持有输入框的值
  return (
    <div style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 8 }}>
      {/* value 绑定 state → React 知道当前值 → 可校验、可格式化、可联动 */}
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}  // 每次输入同步到 state
        placeholder="受控输入框"
        style={{ padding: 8, width: "100%" }}
      />
      <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
        实时长度：{value.length} | 大写：{value.toUpperCase()}
      </p>
    </div>
  );
}

export default function App() {
  return <ControlledInput />;
}
\`\`\`

**优势**：
- 实时拿到值（用于校验、格式化、联动）
- React 知道值变化，能精准控制何时 re-render
- 易于受控/禁用/只读切换

**代价**：每个字符都触发 onChange → state 更新 → re-render。大表单性能可能下降。

### 2. 非受控组件

值由 DOM 自己管理，React 只在需要时通过 ref 取值。

\`\`\`tsx
import { useRef, useState } from "react";

// 非受控组件：值由 DOM 持有，React 仅在提交时取值
function UncontrolledForm() {
  const nameRef = useRef<HTMLInputElement>(null);    // ref 指向 input 元素
  const [submitted, setSubmitted] = useState("");

  const handleSubmit = () => {
    // 仅在提交时从 DOM 读取值
    const name = nameRef.current?.value ?? "";
    setSubmitted(name);
  };

  return (
    <div style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 8 }}>
      {/* defaultValue 设置初值；之后 value 由 DOM 管理 */}
      <input
        ref={nameRef}
        defaultValue=""
        placeholder="非受控输入框"
        style={{ padding: 8, width: "100%" }}
      />
      <button
        onClick={handleSubmit}
        style={{ marginTop: 8, padding: "6px 12px", cursor: "pointer" }}
      >
        提交
      </button>
      {submitted && <p style={{ marginTop: 8 }}>已提交：{submitted}</p>}
    </div>
  );
}

export default function App() {
  return <UncontrolledForm />;
}
\`\`\`

**优势**：性能更好（不每次触发 re-render）；与原生 form 行为更接近（如 file input 只能非受控）。

**代价**：拿不到实时值，校验只能 blur 或 submit 时做。

### 3. 决策表

| 场景 | 推荐 | 原因 |
| --- | --- | --- |
| 实时校验/格式化/联动 | 受控 | 需要每次输入拿到值 |
| 简单提交、字段少 | 受控 | 简单直接 |
| 大表单（> 20 字段） | 混合/库 | 全受控性能差 |
| 文件上传 | 非受控 | \`<input type="file">\` 只能非受控 |
| 第三方组件封装 | 看组件 API | 通常是受控 |

---

## 二、表单库 vs 手写

### 1. 手写表单

\`\`\`tsx
import { useState } from "react";

// 手写一个最简"姓名 + 邮箱"表单
type FormState = { name: string; email: string };
type FormErrors = Partial<Record<keyof FormState, string>>;

function SimpleForm() {
  const [values, setValues] = useState<FormState>({ name: "", email: "" });
  const [errors, setErrors] = useState<FormErrors>({});

  // 通用字段更新函数
  const update = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setValues((v) => ({ ...v, [key]: val }));  // 更新单个字段
  };

  // 提交时校验
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();                       // 阻止 form 默认提交
    const errs: FormErrors = {};
    if (!values.name) errs.name = "姓名必填";
    if (!/^\\S+@\\S+\\.\\S+$/.test(values.email)) errs.email = "邮箱格式错误";
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      alert("提交成功：" + JSON.stringify(values));
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, padding: 12 }}>
      <div>
        <input
          placeholder="姓名"
          value={values.name}
          onChange={(e) => update("name", e.target.value)}  // 类型安全的更新
        />
        {errors.name && <span style={{ color: "red", fontSize: 12 }}>{errors.name}</span>}
      </div>
      <div>
        <input
          placeholder="邮箱"
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
        />
        {errors.email && <span style={{ color: "red", fontSize: 12 }}>{errors.email}</span>}
      </div>
      <button type="submit">提交</button>
    </form>
  );
}

export default function App() { return <SimpleForm />; }
\`\`\`

**手写的优势**：零依赖、完全可控、代码即文档。
**手写的痛点**：字段多了后，setValues 散落、校验逻辑重复、错误状态难管。

### 2. 用表单库

\`React Hook Form\` + \`Zod\` 是当前主流组合：声明 schema → 库负责收集值、追踪 touched/dirty、运行校验、管理提交。

\`\`\`tsx
// 概念演示：react-hook-form 的 useForm 风格 API
// 注：沙箱无第三方库，下面用 useState 模拟"字段注册 + 校验"流程
import { useState, useCallback } from "react";

type FieldRules = { required?: boolean; minLength?: number; pattern?: RegExp };

// 模拟 register(name, rules) 的返回值
function useSimpleForm<T extends Record<string, string>>(initial: T) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  // 字段注册：返回 input 需要的 props
  const register = useCallback(
    (name: keyof T, rules?: FieldRules) => ({
      value: values[name] ?? "",                      // 受控值
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setValues((prev) => ({ ...prev, [name]: v }));  // 更新值
        // 简单实时校验
        if (rules?.required && !v) {
          setErrors((er) => ({ ...er, [name]: "必填" }));
        } else if (rules?.minLength && v.length < rules.minLength) {
          setErrors((er) => ({ ...er, [name]: \`至少 \${rules.minLength} 字\` }));
        } else {
          setErrors((er) => ({ ...er, [name]: undefined }));
        }
      },
    }),
    [values]
  );

  return { values, errors, register };
}

function DemoForm() {
  const { values, errors, register } = useSimpleForm({ name: "", email: "" });
  return (
    <form style={{ padding: 12, display: "grid", gap: 8 }}>
      <div>
        <input placeholder="姓名" {...register("name", { required: true, minLength: 2 })} />
        {errors.name && <span style={{ color: "red", fontSize: 12 }}>{errors.name}</span>}
      </div>
      <div>
        <input placeholder="邮箱" {...register("email", { required: true })} />
        {errors.email && <span style={{ color: "red", fontSize: 12 }}>{errors.email}</span>}
      </div>
      <code style={{ fontSize: 12 }}>{JSON.stringify(values)}</code>
    </form>
  );
}

export default function App() { return <DemoForm />; }
\`\`\`

---

## 三、单字段 vs 表单级状态

### 1. 单字段 state（最细粒度）

\`\`\`tsx
// 每个字段独立 useState
function FieldLevel() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState(0);
  // 字段多了后：声明冗长、提交时要一个个收集
  // 适合：字段 < 3 个且互不相关
  return <div>{name} {email} {age}</div>;
}
\`\`\`

### 2. 表单级 state（一个对象）

\`\`\`tsx
// 一个 useState 持有整个表单值
type Profile = { name: string; email: string; age: number };
function FormLevel() {
  const [profile, setProfile] = useState<Profile>({ name: "", email: "", age: 0 });
  // 更新单个字段的通用写法
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) =>
    setProfile((p) => ({ ...p, [k]: v }));
  // 提交时直接拿 profile 即可
  return <div>{profile.name}</div>;
}
\`\`\`

### 3. 用 useReducer（复杂联动）

\`\`\`tsx
// 状态间有联动时用 useReducer 收拢逻辑
type State = { username: string; email: string; isAdmin: boolean };
type Action =
  | { type: "setUsername"; value: string }
  | { type: "setEmail"; value: string }
  | { type: "setAdmin"; value: boolean };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "setUsername":
      // 用户名改了 → 联动清掉 isAdmin（业务规则）
      return { ...s, username: a.value, isAdmin: a.value === "root" };
    case "setEmail":   return { ...s, email: a.value };
    case "setAdmin":   return { ...s, isAdmin: a.value };
  }
}
\`\`\`

---

## 四、组合对比

| 维度 | 手写 + useState | 手写 + useReducer | 表单库 |
| --- | --- | --- | --- |
| 学习成本 | 0 | 低 | 中 |
| 适用规模 | 1-3 字段 | 3-10 字段 | 10+ 字段 |
| 校验 | 自己写 | 自己写 | Schema 声明 |
| 性能 | 一般 | 一般 | 优（按需 re-render） |
| 测试 | 易 | 易 | 需 mock |
| 体积 | 0 | 0 | ~10KB+ |

**经验法则**：
- < 3 字段：手写 useState
- 3-10 字段、需联动：useReducer / Context
- > 10 字段、复杂校验：React Hook Form + Zod

---

## 小结

1. **受控**适合绝大多数场景；**非受控**只在大表单性能瓶颈或 file input 时用
2. 手写表单上限大约 5-8 字段；超出后考虑 useForm / RHF
3. 状态粒度：单字段 → 表单对象 → useReducer，随复杂度递增
4. 校验时机：onChange（实时）→ onBlur（失焦）→ onSubmit（提交）
5. 错误展示位置：字段下方/右侧，避免弹窗打断用户
6. 永远 \`e.preventDefault()\` 阻止 form 默认提交
`,
  },

  // =========================================================
  // 第六十二章 表单状态 Hook 设计
  // =========================================================
  {
    id: "tsx2-ch62",
    group: "第十三部分 表单与校验",
    icon: "🎛️",
    title: "第六十二章 表单状态 Hook 设计",
    content: `# 第六十二章 表单状态 Hook 设计

上一章我们比较了手写与表单库。本章从零实现一个 \`useForm\` 自定义 Hook，覆盖：字段状态、校验状态、提交处理、错误信息。学完这一章，你会理解 React Hook Form 的核心抽象，并具备自己造轮子的能力。

---

## 一、最小可用 useForm

先定 API：暴露 \`register(name, rules)\` 给 input 使用，\`handleSubmit(onValid)\` 包装提交。

\`\`\`tsx
import { useState, useCallback, useRef } from "react";

// ---------- 类型设计 ----------
type Rules = {
  required?: boolean | string;                       // 必填，可指定错误文案
  minLength?: number | string;                       // 最小长度
  maxLength?: number | string;
  pattern?: { regex: RegExp; message: string };      // 正则
  validate?: (val: string) => string | undefined;    // 自定义校验
};

type FieldError = string | undefined;
type Errors<T> = Partial<Record<keyof T, FieldError>>;

// ---------- 核心 Hook ----------
function useForm<T extends Record<string, string>>(initial: T) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Errors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const valuesRef = useRef(values);    // ref 让 handleSubmit 拿最新值
  valuesRef.current = values;          // 每次渲染同步

  // 单字段校验
  const validateField = useCallback(
    (name: keyof T, val: string, rules?: Rules): FieldError => {
      if (!rules) return undefined;
      if (rules.required) {
        if (!val) return typeof rules.required === "string" ? rules.required : "必填";
      }
      if (rules.minLength !== undefined && val.length < Number(rules.minLength)) {
        return typeof rules.minLength === "string"
          ? rules.minLength
          : \`至少 \${rules.minLength} 字\`;
      }
      if (rules.pattern && !rules.pattern.regex.test(val)) {
        return rules.pattern.message;
      }
      if (rules.validate) return rules.validate(val);
      return undefined;
    },
    []
  );

  // 字段注册器：返回 spread 给 input 的 props
  const register = useCallback(
    (name: keyof T, rules?: Rules) => ({
      value: values[name] ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setValues((prev) => ({ ...prev, [name]: v }));
        // 输入时实时校验（仅校验已 touched 的字段，避免一开始满屏红字）
        if (touched[name]) {
          setErrors((er) => ({ ...er, [name]: validateField(name, v, rules) }));
        }
      },
      onBlur: () => {
        // 失焦时校验并标记 touched
        setTouched((t) => ({ ...t, [name]: true }));
        setErrors((er) => ({ ...er, [name]: validateField(name, values[name] ?? "", rules) }));
      },
    }),
    [values, touched, validateField]
  );

  // 提交流程：先跑全量校验，全通过才调 onValid
  const handleSubmit = useCallback(
    (onValid: (vals: T) => void) => (e: React.FormEvent) => {
      e.preventDefault();
      const newErrors: Errors<T> = {};
      // 收集所有字段的当前值 + 规则（用 valuesRef 拿最新）
      Object.keys(valuesRef.current).forEach((k) => {
        const key = k as keyof T;
        const fieldRules = (e.currentTarget.querySelector(\`[name="\${String(key)}"]\`) as any)?.dataset;
        // 简化：实际项目应在 register 闭包里缓存 rules
      });
      // 简化版：全量 revalidate 用 valuesRef
      setErrors((er) => ({ ...er }));   // 触发刷新
      // 这里仅演示结构，不深入 rules 反查
      onValid(valuesRef.current);
    },
    []
  );

  return { values, errors, touched, register, handleSubmit, setValues };
}

export default function App() {
  const { values, errors, register, handleSubmit } = useForm({ name: "", email: "" });

  return (
    <form
      onSubmit={handleSubmit((vals) => alert("OK: " + JSON.stringify(vals)))}
      style={{ padding: 16, display: "grid", gap: 10, maxWidth: 360 }}
    >
      <h3 style={{ margin: 0 }}>注册</h3>
      <div>
        <input name="name" placeholder="姓名" {...register("name", { required: "请输入姓名", minLength: 2 })} style={inp} />
        {errors.name && <FieldError text={errors.name} />}
      </div>
      <div>
        <input name="email" placeholder="邮箱" {...register("email", { pattern: { regex: /^\\S+@\\S+$/, message: "邮箱格式错" } })} style={inp} />
        {errors.email && <FieldError text={errors.email} />}
      </div>
      <button type="submit" style={btn}>提交</button>
      <pre style={{ fontSize: 11, background: "#f3f4f6", padding: 8, borderRadius: 4 }}>{JSON.stringify(values, null, 2)}</pre>
    </form>
  );
}

const inp: React.CSSProperties = { padding: 8, width: "100%", boxSizing: "border-box" };
const btn: React.CSSProperties = { padding: "8px 16px", background: "#2563eb", color: "#fff", border: 0, borderRadius: 4, cursor: "pointer" };

function FieldError({ text }: { text: string }) {
  return <div style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>{text}</div>;
}
\`\`\`

---

## 二、把校验规则收进闭包

上面 register 没把 rules 缓存在闭包里，导致 handleSubmit 拿不到规则。下面改进：

\`\`\`tsx
import { useState, useCallback, useRef } from "react";

type Rules = {
  required?: boolean | string;
  minLength?: number | string;
  pattern?: { regex: RegExp; message: string };
  validate?: (val: string) => string | undefined;
};

// 改进版：内部维护 rulesRef
function useFormV2<T extends Record<string, string>>(initial: T) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const rulesRef = useRef<Partial<Record<keyof T, Rules>>>({});  // 缓存每个字段的 rules
  const valuesRef = useRef(values);
  valuesRef.current = values;

  const runValidate = (name: keyof T, val: string): string | undefined => {
    const r = rulesRef.current[name];
    if (!r) return undefined;
    if (r.required && !val) return typeof r.required === "string" ? r.required : "必填";
    if (r.minLength !== undefined && val.length < Number(r.minLength)) {
      return typeof r.minLength === "string" ? r.minLength : \`至少 \${r.minLength} 字\`;
    }
    if (r.pattern && !r.pattern.regex.test(val)) return r.pattern.message;
    if (r.validate) return r.validate(val);
    return undefined;
  };

  const register = useCallback(
    (name: keyof T, rules?: Rules) => {
      if (rules) rulesRef.current[name] = rules;   // 注册时缓存
      return {
        name: String(name),                        // 让 handleSubmit 能查 DOM
        value: values[name] ?? "",
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          const v = e.target.value;
          setValues((p) => ({ ...p, [name]: v }));
          setErrors((er) => ({ ...er, [name]: runValidate(name, v) }));
        },
        onBlur: () => {
          setErrors((er) => ({ ...er, [name]: runValidate(name, values[name] ?? "") }));
        },
      };
    },
    [values]
  );

  const handleSubmit = useCallback(
    (onValid: (v: T) => void) => (e: React.FormEvent) => {
      e.preventDefault();
      const newErrs: Partial<Record<keyof T, string>> = {};
      let ok = true;
      (Object.keys(valuesRef.current) as (keyof T)[]).forEach((k) => {
        const err = runValidate(k, valuesRef.current[k] ?? "");
        if (err) { ok = false; newErrs[k] = err; }
      });
      setErrors((er) => ({ ...er, ...newErrs }));
      if (ok) onValid(valuesRef.current);
    },
    []
  );

  return { values, errors, register, handleSubmit, setValues };
}
\`\`\`

---

## 三、完整示例：登录 + 注册

\`\`\`tsx
import { useState } from "react";

function useFormStrict<T extends Record<string, string>>(initial: T) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const rulesRef = useRef<Partial<Record<keyof T, any>>>({});

  const validate = (name: keyof T, val: string): string | undefined => {
    const r = rulesRef.current[name];
    if (!r) return;
    if (r.required && !val.trim()) return r.message || "必填";
    if (r.min !== undefined && val.length < r.min) return \`至少 \${r.min} 字\`;
    if (r.regex && !r.regex.test(val)) return r.regexMsg || "格式错";
    return undefined;
  };

  const register = (name: keyof T, rules?: any) => {
    if (rules) rulesRef.current[name] = rules;
    return {
      name: String(name),
      value: values[name] ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setValues((p) => ({ ...p, [name]: v }));
        setErrors((er) => ({ ...er, [name]: validate(name, v) }));
      },
    };
  };

  const handleSubmit = (onValid: (v: T) => void) => (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Partial<Record<keyof T, string>> = {};
    let ok = true;
    (Object.keys(values) as (keyof T)[]).forEach((k) => {
      const err = validate(k, values[k] ?? "");
      if (err) { errs[k] = err; ok = false; }
    });
    setErrors((er) => ({ ...er, ...errs }));
    if (ok) onValid(values);
  };

  return { values, errors, register, handleSubmit, setValues };
}

function SignupForm() {
  const { values, errors, register, handleSubmit } = useFormStrict({
    username: "",
    password: "",
    confirm: "",
  });

  return (
    <form
      onSubmit={handleSubmit((v) => alert("注册成功：" + v.username))}
      style={{ padding: 16, display: "grid", gap: 12, maxWidth: 380 }}
    >
      <h3 style={{ margin: 0 }}>注册账号</h3>
      <Field label="用户名" name="username" errors={errors} register={register}
        rules={{ required: true, min: 3, regex: /^[a-zA-Z0-9_]+$/, regexMsg: "仅字母数字下划线" }} />
      <Field label="密码" name="password" type="password" errors={errors} register={register}
        rules={{ required: true, min: 6 }} />
      <Field label="确认密码" name="confirm" type="password" errors={errors} register={register}
        rules={{
          required: true,
          validate: (v: string) => v === (document.querySelector('input[name="password"]') as HTMLInputElement)?.value ? undefined : "两次密码不一致",
        }} />
      <button type="submit" style={{ padding: "8px 16px", background: "#10b981", color: "#fff", border: 0, borderRadius: 4, cursor: "pointer" }}>
        注册
      </button>
    </form>
  );
}

function Field({ label, name, type = "text", errors, register, rules }: any) {
  return (
    <div>
      <label style={{ fontSize: 12, color: "#6b7280" }}>{label}</label>
      <input type={type} {...register(name, rules)}
        style={{ display: "block", padding: 8, width: "100%", boxSizing: "border-box", marginTop: 4 }} />
      {errors[name] && <div style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>{errors[name]}</div>}
    </div>
  );
}

export default function App() { return <SignupForm />; }
\`\`\`

---

## 四、提交时附加行为

实际项目里 \`handleSubmit\` 还要做：loading 态、提交失败提示、跳转等。

\`\`\`tsx
function useFormWithAsync<T extends Record<string, string>>(initial: T) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [submitting, setSubmitting] = useState(false);    // 提交中态
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 模拟异步提交
  const submit = async (vals: T) => {
    setSubmitting(true);
    setSubmitError(null);
    await new Promise((r) => setTimeout(r, 800));           // 假装在请求
    if (vals.username === "admin") {
      setSubmitError("用户名已被占用");
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    alert("提交成功");
  };

  // 简化：复用上面的 register
  const register = (name: keyof T) => ({
    name: String(name),
    value: values[name] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((p) => ({ ...p, [name]: e.target.value })),
  });

  const handleSubmit = () => (e: React.FormEvent) => {
    e.preventDefault();
    submit(values);
  };

  return { values, errors, submitting, submitError, register, handleSubmit };
}
\`\`\`

---

## 小结

1. **useForm 抽象**= 状态（values）+ 校验（errors）+ 注册（register）+ 提交（handleSubmit）
2. **register 返回 spread-able props**：value/onChange/onBlur/name，input 直接展开
3. **rules 用 ref 缓存**：避免 handleSubmit 重新读 DOM 解析 data-* 属性
4. **校验时机**：onChange 实时 + onBlur 失焦 + onSubmit 全量，三段式
5. **异步提交**：用 \`submitting\` state 控制按钮 disabled，\`submitError\` 单独存放服务端错误
6. **自定义校验 validate**：字段间联动（密码一致性）用闭包或 ref 取其他字段值
`,
  },

  // =========================================================
  // 第六十三章 Zod 校验入门
  // =========================================================
  {
    id: "tsx2-ch63",
    group: "第十三部分 表单与校验",
    icon: "🛡️",
    title: "第六十三章 Zod 校验入门",
    content: `# 第六十三章 Zod 校验入门

Zod 是 TypeScript 生态最流行的"运行时校验"库。它的杀手锏是：**一份 schema 同时产出类型 + 校验器**。本章我们手写一个迷你 Zod，理解其核心思想后，在真实项目里就能用 \`z.object({...}).infer<typeof X>\` 自由组合。

---

## 一、为什么需要 Zod

TypeScript 类型在编译期消失——运行时你拿不到任何类型信息。\`any\`、\`as\` 都能绕过。所以"运行时校验"必不可少。

\`\`\`tsx
// 场景：API 返回的数据形状未知
type User = { id: number; name: string; email: string };
async function getUser(): Promise<User> {
  const r = await fetch("/api/user/1");
  return r.json();        // 编译期相信是 User，运行期可能是 null/缺字段/类型错
}
\`\`\`

Zod 的解法：先定义 schema（既是校验器也是类型源），再 \`schema.parse(data)\`，校验通过才用。

---

## 二、迷你 Zod 实现

我们用 50 行 TypeScript 复刻 Zod 的核心 API。

\`\`\`tsx
// ========== 迷你 Zod 类型系统 ==========
type ParseResult<T> = { success: true; data: T } | { success: false; error: string };

// 抽象基类：所有 schema 都要实现 parse
abstract class ZodBase<T> {
  abstract parse(data: unknown): ParseResult<T>;
  // 类型推断入口
  infer(): T { return undefined as unknown as T; }
}

// ========== string 类型 ==========
class ZodString extends ZodBase<string> {
  parse(data: unknown): ParseResult<string> {
    if (typeof data !== "string") return { success: false, error: "期望字符串" };
    return { success: true, data };
  }
  // 链式：min(n)
  min(n: number, msg?: string) {
    const self = this;
    return new (class extends ZodBase<string> {
      parse(d: unknown) {
        const r = self.parse(d);
        if (!r.success) return r;
        if (r.data.length < n) return { success: false, error: msg || \`至少 \${n} 字\` };
        return { success: true, data: r.data };
      }
    })();
  }
  // 链式：email 正则
  email(msg = "邮箱格式错误") {
    const self = this;
    return new (class extends ZodBase<string> {
      parse(d: unknown) {
        const r = self.parse(d);
        if (!r.success) return r;
        if (!/^\\S+@\\S+\\.\\S+$/.test(r.data)) return { success: false, error: msg };
        return { success: true, data: r.data };
      }
    })();
  }
}

// ========== number 类型 ==========
class ZodNumber extends ZodBase<number> {
  parse(data: unknown): ParseResult<number> {
    if (typeof data !== "number" || Number.isNaN(data))
      return { success: false, error: "期望数字" };
    return { success: true, data };
  }
  min(n: number) {
    return this.refine((v) => v >= n, \`>= \${n}\`);
  }
  max(n: number) {
    return this.refine((v) => v <= n, \`<= \${n}\`);
  }
  private refine(fn: (v: number) => boolean, msg: string) {
    const self = this;
    return new (class extends ZodBase<number> {
      parse(d: unknown) {
        const r = self.parse(d);
        if (!r.success) return r;
        return fn(r.data) ? { success: true, data: r.data } : { success: false, error: msg };
      }
    })();
  }
}

// ========== object 类型 ==========
class ZodObject<S extends Record<string, ZodBase<any>>> extends ZodBase<{ [K in keyof S]: ReturnType<S[K]["infer"]> }> {
  constructor(private shape: S) { super(); }
  parse(data: unknown): ParseResult<any> {
    if (typeof data !== "object" || data === null) return { success: false, error: "期望对象" };
    const obj = data as Record<string, unknown>;
    const result: any = {};
    for (const k in this.shape) {
      const r = this.shape[k].parse(obj[k]);
      if (!r.success) return { success: false, error: \`字段 \${k}: \${r.error}\` };
      result[k] = r.data;
    }
    return { success: true, data: result };
  }
}

// ========== 工厂函数 ==========
const z = {
  string: () => new ZodString(),
  number: () => new ZodNumber(),
  object: <S extends Record<string, ZodBase<any>>>(shape: S) => new ZodObject(shape),
};

export default function App() {
  // 定义 schema（一次定义，处处复用）
  const userSchema = z.object({
    name: z.string().min(2, "姓名至少 2 字"),
    email: z.string().email(),
    age: z.number().min(0).max(150),
  });

  // 校验 1：合法数据
  const ok = userSchema.parse({ name: "张三", email: "a@b.com", age: 20 });
  // 校验 2：非法数据
  const bad = userSchema.parse({ name: "x", email: "no-at", age: -1 });

  return (
    <pre style={{ padding: 12, fontSize: 12 }}>
{JSON.stringify({ ok, bad }, null, 2)}
    </pre>
  );
}
\`\`\`

**运行结果**：
\`\`\`
{
  "ok":  { "success": true,  "data": { "name": "张三", "email": "a@b.com", "age": 20 } },
  "bad": { "success": false, "error": "字段 name: 姓名至少 2 字" }
}
\`\`\`

---

## 三、parse vs safeParse

\`\`\`tsx
// parse：失败抛异常
try {
  const data = userSchema.parse(input);
  // 用 data
} catch (err) {
  // err 是 ZodError
}

// safeParse：失败返回结果对象（推荐用于表单）
const result = userSchema.safeParse(input);
if (result.success) {
  // result.data 已校验
} else {
  // result.error 是 ZodError，含 issues 数组
  result.error.issues.forEach((issue) => {
    console.log(issue.path, issue.message);
  });
}
\`\`\`

| API | 失败行为 | 推荐场景 |
| --- | --- | --- |
| \`.parse(d)\` | 抛 \`ZodError\` | 已知数据可信，只想兜底 |
| \`.safeParse(d)\` | 返回 \`{success:false,error}\` | 表单提交、用户输入 |

---

## 四、类型推断 z.infer

\`\`\`tsx
// 一份 schema 产出类型
const userSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email(),
});

// 提取 TS 类型
type User = z.infer<typeof userSchema>;
// 等价于：
// type User = { name: string; age: number; email: string };

// 用法：函数签名、表单 state
function saveUser(user: User) { /* ... */ }
const [form, setForm] = useState<User>({ name: "", age: 0, email: "" });
\`\`\`

迷你版实现：
\`\`\`tsx
// 在 ZodObject 上加一个 _output 字段
class ZodObject<S extends Record<string, ZodBase<any>>> extends ZodBase<any> {
  // 用一个 phantom 类型承载 infer 结果
  readonly _output!: { [K in keyof S]: any };
  constructor(private shape: S) { super(); }
  // ... parse 同上
}

// 类型工具
type Infer<T> = T extends { _output: infer O } ? O : never;
type infer<T> = Infer<T>;
\`\`\`

---

## 五、refinement：自定义校验

\`\`\`tsx
// 密码规则：至少 8 字、含数字、含大写
const passwordSchema = z
  .string()
  .min(8, "至少 8 字")
  .refine((v) => /[0-9]/.test(v), "需含数字")
  .refine((v) => /[A-Z]/.test(v), "需含大写");

// 字段间联动：确认密码 === 密码
const signupSchema = z
  .object({
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "两次密码不一致",
    path: ["confirm"],
  });
\`\`\`

迷你版 refinement：
\`\`\`tsx
class ZodBase<T> {
  // refinement：在 parse 通过后追加自定义校验
  refine(fn: (v: T) => boolean, msg: string) {
    const self = this;
    return new (class extends ZodBase<T> {
      parse(d: unknown) {
        const r = self.parse(d);
        if (!r.success) return r;
        return fn(r.data) ? r : { success: false, error: msg };
      }
    })();
  }
}
\`\`\`

---

## 六、错误处理

\`\`\`tsx
const r = userSchema.safeParse(input);
if (!r.success) {
  // r.error.issues: [{ path: ["email"], message: "邮箱格式错误", code: "invalid_string" }]
  r.error.issues.forEach((issue) => {
    const fieldName = issue.path.join(".");
    console.log(\`字段 \${fieldName}: \${issue.message}\`);
  });
}

// 转成 { field: message } 形式
function toFieldErrors(error: any): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    out[issue.path.join(".")] = issue.message;
  }
  return out;
}
\`\`\`

---

## 七、组合 Schema

\`\`\`tsx
// 基础 schema
const addressSchema = z.object({
  city: z.string(),
  street: z.string(),
});

// 复用
const userSchema = z.object({
  name: z.string(),
  address: addressSchema,         // 嵌套
});

// 数组
const listSchema = z.array(userSchema);   // User[]

// Partial / Pick / Omit
const updateSchema = userSchema.partial();   // 所有字段可选
\`\`\`

---

## 小结

1. **运行时校验**补全 TypeScript 编译期消失的类型信息
2. **一份 schema 双重产出**：用 \`schema.parse\` 校验、用 \`z.infer<typeof S>\` 拿类型
3. **parse vs safeParse**：表单场景优先 \`safeParse\`
4. **链式 API**：\`z.string().min(3).email()\` 像砌积木
5. **refinement** 解决字段级自定义 + 跨字段联动
6. **错误结构**：\`issues: [{path, message, code}]\` 标准统一，前端可映射到字段下方
7. **嵌套 + 数组 + Partial** 让 schema 自由组合，复用性极强
`,
  },

  // =========================================================
  // 第六十四章 React Hook Form 实战
  // =========================================================
  {
    id: "tsx2-ch64",
    group: "第十三部分 表单与校验",
    icon: "📝",
    title: "第六十四章 React Hook Form 实战",
    content: `# 第六十四章 React Hook Form 实战

React Hook Form（RHF）是当前最主流的 React 表单库。它用 **ref + 订阅模式** 替代了受控的"全量 re-render"，性能极佳；又用 **Zod resolver** 把 schema 校验无缝接进来。本章用"手写 mini-RHF"的方式，让你看清它的核心抽象。

---

## 一、为什么 RHF 更快

受控表单每个 keystroke 都触发 setState → re-render → 全部子组件重渲染。RHF 用 \`ref\` 直接读 DOM 值，**只有订阅了 formState 的组件会 re-render**。

\`\`\`tsx
// 受控：每次输入整个表单都 re-render
function Controlled() {
  const [name, setName] = useState("");
  return (
    <>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <ExpensiveChild name={name} />   // 每次输入都重渲染
    </>
  );
}

// RHF 风格：值存在 ref，输入不触发 re-render
function RHFLike() {
  const nameRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input ref={nameRef} name="username" />
      <ExpensiveChild />   // 不会因为输入重渲染
    </>
  );
}
\`\`\`

---

## 二、迷你 RHF 实现

\`\`\`tsx
import { useRef, useState, useCallback } from "react";

type FormValues = Record<string, any>;
type FormErrors = Record<string, string | undefined>;
type Rules = {
  required?: boolean | string;
  minLength?: number;
  pattern?: { value: RegExp; message: string };
  validate?: (val: any) => string | undefined;
};

// 内部 store：values、errors、touched、rules
function createFormStore<T extends FormValues>(defaultValues: T) {
  const store = {
    values: { ...defaultValues } as T,
    errors: {} as FormErrors,
    touched: {} as Record<string, boolean>,
    rules: {} as Record<string, Rules>,
    subscribers: new Set<() => void>(),          // 订阅 formState 变化的回调
  };
  return store;
}

export function useForm<T extends FormValues>(defaultValues: T) {
  const storeRef = useRef(createFormStore(defaultValues));
  const [, force] = useState(0);                  // 用于触发订阅者 re-render

  // 订阅：组件挂载时注册 forceUpdate
  const subscribe = useCallback((cb: () => void) => {
    storeRef.current.subscribers.add(cb);
    return () => storeRef.current.subscribers.delete(cb);
  }, []);
  const notify = () => storeRef.current.subscribers.forEach((cb) => cb());

  // 单字段校验
  const validate = (name: string, val: any): string | undefined => {
    const r = storeRef.current.rules[name];
    if (!r) return;
    if (r.required && (val === undefined || val === null || val === "")) {
      return typeof r.required === "string" ? r.required : "必填";
    }
    if (r.minLength !== undefined && String(val).length < r.minLength) {
      return \`至少 \${r.minLength} 字\`;
    }
    if (r.pattern && !r.pattern.value.test(String(val))) return r.pattern.message;
    if (r.validate) return r.validate(val);
  };

  // register：返回 spread 给 input 的 props
  const register = (name: keyof T, rules?: Rules) => {
    if (rules) storeRef.current.rules[name as string] = rules;
    return {
      name: String(name),
      ref: (el: HTMLInputElement | null) => {
        // ref 回调：DOM 挂载时把值同步到 store
        if (el) storeRef.current.values[name as T[keyof T]] = el.value as any;
      },
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        storeRef.current.values[name as T[keyof T]] = v as any;   // 不触发 React re-render
        // 实时校验（仅校验已 touched）
        if (storeRef.current.touched[name as string]) {
          storeRef.current.errors[name as string] = validate(name as string, v);
          notify();                                                // 通知订阅者
        }
      },
      onBlur: () => {
        storeRef.current.touched[name as string] = true;
        storeRef.current.errors[name as string] = validate(name as string, storeRef.current.values[name as T[keyof T]]);
        notify();
      },
    };
  };

  // handleSubmit：全量校验，全通过调 onValid
  const handleSubmit = (onValid: (v: T) => void) => (e: React.FormEvent) => {
    e.preventDefault();
    let ok = true;
    for (const k of Object.keys(storeRef.current.values)) {
      const err = validate(k, storeRef.current.values[k]);
      storeRef.current.errors[k] = err;
      storeRef.current.touched[k] = true;
      if (err) ok = false;
    }
    notify();
    if (ok) onValid(storeRef.current.values);
  };

  return {
    register,
    handleSubmit,
    formState: {
      // 简化：getter 让组件订阅
      get errors() { return storeRef.current.errors; },
      get values() { return storeRef.current.values; },
      get touched() { return storeRef.current.touched; },
    },
    _subscribe: subscribe,    // 给 Controller 等内部用
  };
}
\`\`\`

---

## 三、Controller：包装第三方组件

RHF 的 \`register\` 假设 input 有 \`ref/name/onChange/onBlur\`，但 MUI \`<TextField>\`、AntD \`<Input>\` 不一定支持 ref。这时用 \`Controller\` 手动桥接。

\`\`\`tsx
// 迷你 Controller：用 render props 桥接第三方组件
function Controller<T>({ name, control, render }: {
  name: string;
  control: ReturnType<typeof useForm<any>>;
  render: (props: { value: any; onChange: (v: any) => void }) => React.ReactElement;
}) {
  // 订阅 formState 变化，触发本组件 re-render
  const [, force] = useState(0);
  useEffect(() => {
    return control._subscribe(() => force((n) => n + 1));
  }, [control]);
  return render({
    value: control.formState.values[name],
    onChange: (v) => {
      // 自定义 onChange 写入 store
      (control as any)._setValue?.(name, v);
    },
  });
}
\`\`\`

**真实 RHF 写法**：
\`\`\`tsx
import { useForm, Controller } from "react-hook-form";

// 第三方组件没有 ref 时，用 Controller 手动桥接
<Controller
  name="city"
  control={control}
  rules={{ required: "必填" }}
  render={({ field, fieldState }) => (
    <Select
      value={field.value}
      onChange={field.onChange}
      error={!!fieldState.error}
      helperText={fieldState.error?.message}
    />
  )}
/>
\`\`\`

---

## 四、useController：Hook 版 Controller

RHF 7+ 提供 \`useController\`，让自定义组件用 hook 形式拿到 field 状态。

\`\`\`tsx
// useController 的概念用法
function MyCustomInput({ name, control, rules }) {
  const { field, fieldState } = useController({ name, control, rules });
  // field: { value, onChange, onBlur, ref, name }
  // fieldState: { error, isTouched, isDirty }
  return (
    <div>
      <input
        value={field.value}
        onChange={(e) => field.onChange(e.target.value)}
        onBlur={field.onBlur}
        ref={field.ref}
        style={{ borderColor: fieldState.error ? "red" : undefined }}
      />
      {fieldState.error && <span>{fieldState.error.message}</span>}
    </div>
  );
}
\`\`\`

---

## 五、Zod Resolver 集成

把 Zod schema 当 RHF 的校验器：一次定义，两端复用。

\`\`\`tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// 1. 定义 Zod schema
const schema = z.object({
  name: z.string().min(2, "姓名至少 2 字"),
  email: z.string().email("邮箱格式错误"),
  age: z.number().min(0).max(150),
});
type FormData = z.infer<typeof schema>;   // 自动推出类型

// 2. 接入 RHF
function App() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),         // 关键：把 schema 变 resolver
    defaultValues: { name: "", email: "", age: 0 },
    mode: "onBlur",                        // 校验时机：onChange | onBlur | onSubmit | onTouched | all
  });

  const onSubmit = (data: FormData) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="number" {...register("age", { valueAsNumber: true })} />
      {errors.age && <span>{errors.age.message}</span>}

      <button type="submit">提交</button>
    </form>
  );
}
\`\`\`

**resolver 做了什么**：把 RHF 收集的 values 交给 \`schema.safeParse\`，把 \`issues\` 转成 \`errors\` 对象。

---

## 六、迷你 Resolver

\`\`\`tsx
// 把 Zod schema 包成 RHF resolver
function zodResolver(schema: any) {
  return async (values: any) => {
    const result = schema.safeParse(values);
    if (result.success) return { values, errors: {} };
    const errors: Record<string, any> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      errors[path] = { type: issue.code, message: issue.message };
    }
    return { values: {}, errors };
  };
}
\`\`\`

---

## 七、formState 详解

\`\`\`tsx
const { formState } = useForm(...);

// 常用字段
formState.isDirty     // 任意字段被改
formState.isSubmitting // 提交中
formState.isValid     // 全部通过校验（需 mode: 'onChange'）
formState.errors      // 错误对象
formState.touchedFields // 字段被 blur 过
formState.dirtyFields   // 字段值与 default 不同

// 性能优化：只订阅需要的字段
const { formState: { isDirty } } = useForm(...);  // 但 isDirty 是浅引用，需配合 shouldUnregister
// 或者用 useFormState hook 局部订阅
const isDirty = useFormState({ name: "username" }).isDirty;
\`\`\`

---

## 八、完整示例

\`\`\`tsx
function CompleteForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<{
    email: string;
    password: string;
  }>({
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  const onSubmit = async (data: any) => {
    await new Promise((r) => setTimeout(r, 800));
    alert("登录成功");
    reset();   // 重置表单
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 16, display: "grid", gap: 12, maxWidth: 360 }}>
      <h3>登录</h3>
      <div>
        <input placeholder="邮箱" {...register("email", { required: "必填", pattern: { value: /^\\S+@\\S+$/, message: "格式错" } })} style={inp} />
        {errors.email && <small style={{ color: "red" }}>{errors.email.message}</small>}
      </div>
      <div>
        <input type="password" placeholder="密码" {...register("password", { required: "必填", minLength: { value: 6, message: "至少 6 位" } })} style={inp} />
        {errors.password && <small style={{ color: "red" }}>{errors.password.message}</small>}
      </div>
      <button type="submit" disabled={isSubmitting} style={btn}>
        {isSubmitting ? "登录中..." : "登录"}
      </button>
    </form>
  );
}

const inp = { padding: 8, width: "100%", boxSizing: "border-box" as const };
const btn = { padding: "8px 16px", background: "#2563eb", color: "#fff", border: 0, borderRadius: 4, cursor: "pointer" };
\`\`\`

---

## 小结

1. **RHF 性能优势**：值用 ref 存，输入不触发 React re-render，只有订阅 formState 的组件更新
2. **register** 返回 {name, ref, onChange, onBlur}，spread 给原生 input
3. **Controller / useController** 桥接第三方组件（无 ref）
4. **Zod resolver** = schema 同时给类型和校验器，零冗余
5. **formState** 提供 isDirty/isValid/isSubmitting/errors/touched/dirty 六个核心信号
6. **mode** 决定校验时机：onChange / onBlur / onSubmit / onTouched / all
7. **大型表单推荐**：RHF + Zod + useFieldArray（动态字段）+ DevTools
`,
  },

  // =========================================================
  // 第六十五章 复杂表单实战
  // =========================================================
  {
    id: "tsx2-ch65",
    group: "第十三部分 表单与校验",
    icon: "🏗️",
    title: "第六十五章 复杂表单实战",
    content: `# 第六十五章 复杂表单实战

现实项目里，表单往往不是"一屏填完提交"那么简单。本章把多步骤、动态字段、异步校验、文件上传四个高难度场景拆开讲，每个场景都给出可运行的迷你实现。

---

## 一、多步骤表单（Multi-step Form）

把 5 屏表单拆成 3 步：基本信息 → 联系方式 → 确认提交。每步独立校验，全过才允许下一步。

\`\`\`tsx
import { useState } from "react";

type FormData = {
  // step 1
  username: string;
  password: string;
  // step 2
  email: string;
  phone: string;
  // step 3
  agree: boolean;
};

const initial: FormData = { username: "", password: "", email: "", phone: "", agree: false };

// 每步独立校验规则
const validators = {
  step1: (d: FormData) => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (d.username.length < 3) e.username = "用户名至少 3 字";
    if (d.password.length < 6) e.password = "密码至少 6 位";
    return e;
  },
  step2: (d: FormData) => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!/^\\S+@\\S+$/.test(d.email)) e.email = "邮箱格式错";
    if (!/^1\\d{10}$/.test(d.phone)) e.phone = "手机号格式错";
    return e;
  },
  step3: (d: FormData) => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!d.agree) e.agree = "请同意条款";
    return e;
  },
};

function MultiStepForm() {
  const [data, setData] = useState<FormData>(initial);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const update = <K extends keyof FormData>(k: K, v: FormData[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));   // 输入即清错
  };

  const next = () => {
    const errs = step === 1 ? validators.step1(data) : validators.step2(data);
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep((s) => s + 1);
  };
  const prev = () => setStep((s) => s - 1);
  const submit = () => {
    const errs = validators.step3(data);
    setErrors(errs);
    if (Object.keys(errs).length === 0) alert("提交成功：" + JSON.stringify(data));
  };

  return (
    <div style={{ padding: 16, maxWidth: 420, border: "1px solid #e5e7eb", borderRadius: 8 }}>
      {/* 步骤指示器 */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i <= step ? "#2563eb" : "#e5e7eb",
          }} />
        ))}
      </div>

      {step === 1 && (
        <div style={{ display: "grid", gap: 10 }}>
          <h3>第 1 步：账号信息</h3>
          <div>
            <input placeholder="用户名" value={data.username} onChange={(e) => update("username", e.target.value)} style={inp} />
            {errors.username && <small style={errStyle}>{errors.username}</small>}
          </div>
          <div>
            <input type="password" placeholder="密码" value={data.password} onChange={(e) => update("password", e.target.value)} style={inp} />
            {errors.password && <small style={errStyle}>{errors.password}</small>}
          </div>
          <button onClick={next} style={btn}>下一步</button>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: "grid", gap: 10 }}>
          <h3>第 2 步：联系方式</h3>
          <div>
            <input placeholder="邮箱" value={data.email} onChange={(e) => update("email", e.target.value)} style={inp} />
            {errors.email && <small style={errStyle}>{errors.email}</small>}
          </div>
          <div>
            <input placeholder="手机号" value={data.phone} onChange={(e) => update("phone", e.target.value)} style={inp} />
            {errors.phone && <small style={errStyle}>{errors.phone}</small>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={prev} style={btnGhost}>上一步</button>
            <button onClick={next} style={{ ...btn, flex: 1 }}>下一步</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ display: "grid", gap: 10 }}>
          <h3>第 3 步：确认</h3>
          <pre style={{ fontSize: 11, background: "#f3f4f6", padding: 8, borderRadius: 4 }}>{JSON.stringify(data, null, 2)}</pre>
          <label>
            <input type="checkbox" checked={data.agree} onChange={(e) => update("agree", e.target.checked)} />
            同意服务条款
          </label>
          {errors.agree && <small style={errStyle}>{errors.agree}</small>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={prev} style={btnGhost}>上一步</button>
            <button onClick={submit} style={{ ...btn, flex: 1, background: "#10b981" }}>提交</button>
          </div>
        </div>
      )}
    </div>
  );
}

const inp: React.CSSProperties = { padding: 8, width: "100%", boxSizing: "border-box" };
const btn: React.CSSProperties = { padding: "8px 16px", background: "#2563eb", color: "#fff", border: 0, borderRadius: 4, cursor: "pointer" };
const btnGhost: React.CSSProperties = { ...btn, background: "#fff", color: "#374151", border: "1px solid #d1d5db" };
const errStyle: React.CSSProperties = { color: "#dc2626", fontSize: 12 };

export default function App() { return <MultiStepForm />; }
\`\`\`

---

## 二、动态字段：useFieldArray

场景：用户可以"添加多个收货地址"，每个地址是独立对象。

\`\`\`tsx
import { useState } from "react";

type Address = { city: string; detail: string; isDefault: boolean };

// 迷你 useFieldArray
function useFieldArray<T>(initial: T[]) {
  const [items, setItems] = useState<T[]>(initial);

  const append = (item: T) => setItems((arr) => [...arr, item]);
  const remove = (index: number) => setItems((arr) => arr.filter((_, i) => i !== index));
  const update = <K extends keyof T>(index: number, key: K, value: T[K]) => {
    setItems((arr) => arr.map((it, i) => (i === index ? { ...it, [key]: value } : it)));
  };
  const swap = (i: number, j: number) => {
    setItems((arr) => {
      const cp = [...arr];
      [cp[i], cp[j]] = [cp[j], cp[i]];
      return cp;
    });
  };

  return { items, append, remove, update, swap, setItems };
}

function AddressList() {
  const { items, append, remove, update } = useFieldArray<Address>([
    { city: "北京", detail: "朝阳区xx路", isDefault: true },
  ]);

  return (
    <div style={{ padding: 16, maxWidth: 480, border: "1px solid #e5e7eb", borderRadius: 8 }}>
      <h3>收货地址</h3>
      {items.map((addr, i) => (
        <div key={i} style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 4, marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <strong>#{i + 1}</strong>
            {addr.isDefault && <span style={{ background: "#10b981", color: "#fff", fontSize: 10, padding: "2px 6px", borderRadius: 3 }}>默认</span>}
            {items.length > 1 && (
              <button onClick={() => remove(i)} style={{ marginLeft: "auto", background: "#fee2e2", color: "#dc2626", border: 0, padding: "4px 8px", borderRadius: 3, cursor: "pointer" }}>
                删除
              </button>
            )}
          </div>
          <input
            placeholder="城市"
            value={addr.city}
            onChange={(e) => update(i, "city", e.target.value)}
            style={{ ...inp, marginTop: 8 }}
          />
          <input
            placeholder="详细地址"
            value={addr.detail}
            onChange={(e) => update(i, "detail", e.target.value)}
            style={{ ...inp, marginTop: 8 }}
          />
          <label style={{ display: "block", marginTop: 8, fontSize: 12 }}>
            <input
              type="radio"
              name="default"
              checked={addr.isDefault}
              onChange={() => {
                // 只有一个默认：把所有 isDefault 设为 false，当前设为 true
                items.forEach((_, idx) => update(idx, "isDefault", idx === i));
              }}
            />
            设为默认
          </label>
        </div>
      ))}
      <button
        onClick={() => append({ city: "", detail: "", isDefault: items.length === 0 })}
        style={{ ...btn, background: "#fff", color: "#2563eb", border: "1px dashed #2563eb", width: "100%", marginTop: 8 }}
      >
        + 添加地址
      </button>
    </div>
  );
}
\`\`\`

---

## 三、异步校验

场景：用户名是否被占用，需要调接口查。

\`\`\`tsx
import { useState } from "react";

// 模拟接口
async function checkUsernameAvailable(name: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 500));
  return name.toLowerCase() !== "admin";   // admin 已占用
}

function AsyncValidateForm() {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "ok" | "taken">("idle");
  const [email, setEmail] = useState("");

  // debounce + 异步校验
  const onUsernameChange = (v: string) => {
    setUsername(v);
    setStatus("checking");
    // 简易 debounce：500ms 后才查
    setTimeout(async () => {
      // 如果输入已变更（取最新值），跳过旧请求
      const available = await checkUsernameAvailable(v);
      setStatus(available ? "ok" : "taken");
    }, 500);
  };

  // 邮箱异步校验
  const [emailStatus, setEmailStatus] = useState<string>("");

  return (
    <form style={{ padding: 16, maxWidth: 380, display: "grid", gap: 12 }}>
      <h3>注册（异步校验）</h3>
      <div>
        <input value={username} onChange={(e) => onUsernameChange(e.target.value)} placeholder="用户名" style={inp} />
        {status === "checking" && <small style={{ color: "#6b7280" }}>检查中...</small>}
        {status === "ok" && <small style={{ color: "#10b981" }}>✓ 可用</small>}
        {status === "taken" && <small style={{ color: "#dc2626" }}>✗ 已被占用</small>}
      </div>
      <div>
        <input value={email} onChange={(e) => {
          setEmail(e.target.value);
          // 实时：邮箱格式本地 + 后端是否在白名单
          if (!/^\\S+@\\S+$/.test(e.target.value)) setEmailStatus("格式错");
          else setEmailStatus("✓");
        }} placeholder="邮箱" style={inp} />
        <small style={{ color: emailStatus === "✓" ? "#10b981" : "#dc2626" }}>{emailStatus}</small>
      </div>
    </form>
  );
}
\`\`\`

---

## 四、文件上传

文件 input **必须**是非受控（\`value\` 是只读）。用 ref + FormData 提交。

\`\`\`tsx
import { useRef, useState } from "react";

function FileUploadForm() {
  const fileRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string>("");
  const [progress, setProgress] = useState(0);

  // 单文件预览
  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // FileReader 读为 base64 预览
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  // 多文件
  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list) return;
    setFiles(Array.from(list));
  };

  // 提交：FormData
  const submit = async () => {
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));          // 多个文件
    if (avatarRef.current?.files?.[0]) {
      fd.append("avatar", avatarRef.current.files[0]);    // 单个文件
    }
    // 模拟上传 + 进度
    setProgress(0);
    for (let i = 0; i <= 100; i += 20) {
      await new Promise((r) => setTimeout(r, 200));
      setProgress(i);
    }
    alert("上传完成");
  };

  return (
    <form style={{ padding: 16, maxWidth: 480, display: "grid", gap: 12 }}>
      <h3>文件上传</h3>
      <div>
        <label style={{ fontSize: 12, color: "#6b7280" }}>头像（单文件）</label>
        <input ref={avatarRef} type="file" accept="image/*" onChange={onAvatarChange} />
        {preview && <img src={preview} alt="预览" style={{ width: 80, height: 80, borderRadius: "50%", marginTop: 8 }} />}
      </div>
      <div>
        <label style={{ fontSize: 12, color: "#6b7280" }}>附件（多文件）</label>
        <input ref={fileRef} type="file" multiple onChange={onFilesChange} />
        {files.length > 0 && (
          <ul style={{ fontSize: 12, marginTop: 4 }}>
            {files.map((f, i) => <li key={i}>{f.name} ({Math.round(f.size / 1024)}KB)</li>)}
          </ul>
        )}
      </div>
      <button type="button" onClick={submit} style={btn}>上传</button>
      {progress > 0 && (
        <div>
          <div style={{ height: 4, background: "#e5e7eb", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: \`\${progress}%\`, background: "#2563eb", transition: "width 0.2s" }} />
          </div>
          <small style={{ color: "#6b7280" }}>{progress}%</small>
        </div>
      )}
    </form>
  );
}
\`\`\`

---

## 五、完整示例：用户注册

把上面所有点组合起来：多步骤 + 动态字段 + 异步校验 + 文件上传。

\`\`\`tsx
import { useState } from "react";

type FullForm = {
  // step 1
  username: string;
  password: string;
  // step 2
  email: string;
  phone: string;
  addresses: Address[];
  // step 3
  avatar: string;       // base64
  agree: boolean;
};

type Address = { city: string; detail: string };

function FullRegister() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FullForm>({
    username: "", password: "", email: "", phone: "",
    addresses: [{ city: "", detail: "" }],
    avatar: "", agree: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [usernameStatus, setUsernameStatus] = useState("");

  const update = (k: keyof FullForm, v: any) => setData((d) => ({ ...d, [k]: v }));

  // step 1 校验
  const validateStep1 = async (): Promise<boolean> => {
    const e: Record<string, string> = {};
    if (data.username.length < 3) e.username = "至少 3 字";
    if (data.password.length < 6) e.password = "至少 6 位";
    // 异步检查
    setUsernameStatus("检查中...");
    const available = await new Promise<boolean>((r) =>
      setTimeout(() => r(data.username.toLowerCase() !== "admin"), 500)
    );
    setUsernameStatus(available ? "✓ 可用" : "✗ 已被占用");
    if (!available) e.username = "已被占用";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = async () => {
    if (step === 1 && !(await validateStep1())) return;
    setStep((s) => s + 1);
  };

  const submit = () => {
    const e: Record<string, string> = {};
    if (!data.agree) e.agree = "请同意条款";
    if (data.addresses.some((a) => !a.city)) e.address = "地址必填";
    setErrors(e);
    if (Object.keys(e).length === 0) alert("全部提交成功！");
  };

  const onAvatar = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => update("avatar", r.result as string);
    r.readAsDataURL(f);
  };

  return (
    <div style={{ padding: 16, maxWidth: 500, border: "1px solid #e5e7eb", borderRadius: 8 }}>
      <h3>完整注册（{step}/3）</h3>
      {step === 1 && (
        <div style={{ display: "grid", gap: 10 }}>
          <div>
            <input value={data.username} onChange={(e) => update("username", e.target.value)} placeholder="用户名" style={inp} />
            {errors.username && <small style={err}>{errors.username}</small>}
            {usernameStatus && <small style={{ color: "#6b7280" }}>{usernameStatus}</small>}
          </div>
          <div>
            <input type="password" value={data.password} onChange={(e) => update("password", e.target.value)} placeholder="密码" style={inp} />
            {errors.password && <small style={err}>{errors.password}</small>}
          </div>
          <button onClick={next} style={btn}>下一步（异步校验）</button>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: "grid", gap: 10 }}>
          <input value={data.email} onChange={(e) => update("email", e.target.value)} placeholder="邮箱" style={inp} />
          <input value={data.phone} onChange={(e) => update("phone", e.target.value)} placeholder="手机号" style={inp} />
          <h4>地址</h4>
          {data.addresses.map((a, i) => (
            <div key={i} style={{ display: "grid", gap: 4, padding: 8, border: "1px solid #e5e7eb", borderRadius: 4 }}>
              <input value={a.city} onChange={(e) => {
                const cp = [...data.addresses]; cp[i] = { ...a, city: e.target.value }; update("addresses", cp);
              }} placeholder="城市" style={inp} />
              <input value={a.detail} onChange={(e) => {
                const cp = [...data.addresses]; cp[i] = { ...a, detail: e.target.value }; update("addresses", cp);
              }} placeholder="详细" style={inp} />
            </div>
          ))}
          <button onClick={() => update("addresses", [...data.addresses, { city: "", detail: "" }])} style={btnGhost}>+ 添加地址</button>
          {errors.address && <small style={err}>{errors.address}</small>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setStep(1)} style={btnGhost}>上一步</button>
            <button onClick={() => setStep(3)} style={{ ...btn, flex: 1 }}>下一步</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ display: "grid", gap: 10 }}>
          <input type="file" accept="image/*" onChange={onAvatar} />
          {data.avatar && <img src={data.avatar} style={{ width: 60, height: 60, borderRadius: "50%" }} />}
          <label>
            <input type="checkbox" checked={data.agree} onChange={(e) => update("agree", e.target.checked)} />
            同意条款
          </label>
          {errors.agree && <small style={err}>{errors.agree}</small>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setStep(2)} style={btnGhost}>上一步</button>
            <button onClick={submit} style={{ ...btn, flex: 1, background: "#10b981" }}>提交</button>
          </div>
        </div>
      )}
    </div>
  );
}
\`\`\`

---

## 小结

1. **多步骤表单**：每步独立校验，state 累积，进度条反馈
2. **动态字段（useFieldArray）**：append / remove / update / swap 四大操作
3. **异步校验**：debounce + 取消旧请求（用 ref 存最新 token）
4. **文件上传**：input 永远非受控，\`FormData\` 提交，\`FileReader\` 做预览
5. **完整表单** = 多步骤 + 动态字段 + 异步校验 + 文件上传 + 错误展示 + 加载态
6. **性能优化**：大表单用 RHF + Zod，动态字段用 useFieldArray，提交状态用 isSubmitting
`,
  },
];

export { chapters };
