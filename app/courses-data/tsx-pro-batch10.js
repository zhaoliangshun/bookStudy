// =============================================================
// TypeScript + React 全栈精通 - Batch 10: 表单与样式与动画
// -------------------------------------------------------------
// 章节范围（共 6 章）：
//   60. tspro-controlled-forms  受控表单 vs 非受控表单
//   61. tspro-react-hook-form   React Hook Form 完整指南
//   62. tspro-zod               Zod 表单校验
//   63. tspro-tailwind          Tailwind CSS 实战
//   64. tspro-css-in-js         CSS-in-JS（Styled Components / Emotion）
//   65. tspro-framer-motion     Framer Motion 动画
//
// 代码运行环境：ts.transpileModule + jsx: ReactJSX + target ES2020
// 沙箱注入 react / react/jsx-runtime 的 mock，可写 JSX 语法
// =============================================================

export const chapters = [
  // =========================================================
  // 第六十章：受控表单 vs 非受控表单
  // =========================================================
  {
    id: "tspro-controlled-forms",
    group: "十、表单与样式与动画",
    icon: "📝",
    title: "受控表单 vs 非受控表单",
    content: `# 第六十章：受控表单 vs 非受控表单

## 60.1 表单的两种处理方式

React 处理表单输入有两条路线：

- **受控组件**：表单值由 React state 控制，输入框只是 state 的"投影"
- **非受控组件**：表单值由 DOM 自己管，React 用 ref 读取

差别在哪？看一个输入框：

\`\`\`tsx
// 受控：value 绑定 state，onChange 同步回 state
function ControlledInput() {
  const [text, setText] = useState('');
  return <input value={text} onChange={e => setText(e.target.value)} />;
}

// 非受控：defaultValue 给个初值，ref 读最终值
function UncontrolledInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  return <input defaultValue="" ref={inputRef} />;
}
\`\`\`

受控像"由 React 当数据源"，非受控像"由 DOM 当数据源，React 只读"。

## 60.2 受控组件的核心模式

受控 = state 单一数据源。input 的 value 永远等于 state，输入触发 onChange 改 state，state 变触发重渲染，input 显示新值。

\`\`\`tsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('提交:', { email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="邮箱" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">登录</button>
    </form>
  );
}
\`\`\`

\`value\` 和 \`onChange\` 成对出现：只写 \`value\` 不写 \`onChange\` 会变成只读输入框。

## 60.3 受控的优势：实时校验

受控最大的好处是 state 实时反映输入，可以边输边校验：

\`\`\`tsx
function EmailInput() {
  const [email, setEmail] = useState('');
  const isValid = /^[^@]+@[^@]+\\.[^@]+$/.test(email);

  return (
    <div>
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ borderColor: email && !isValid ? 'red' : '#ccc' }}
      />
      {email && !isValid && <span style={{ color: 'red' }}>邮箱格式错误</span>}
      {isValid && <span style={{ color: 'green' }}>✓</span>}
    </div>
  );
}
\`\`\`

输入时立刻给出视觉反馈：边框变红、显示错误提示。还能做"密码强度条"、"实时字数统计"、"联动下拉选项"等。

## 60.4 非受控组件：useRef 取值

非受控让 DOM 自己管状态，React 不参与每次输入的重渲染，只在提交时一次性读值。

\`\`\`tsx
function SearchForm() {
  const keywordRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 提交时一次性读
    const data = {
      keyword: keywordRef.current?.value,
      category: categoryRef.current?.value,
    };
    console.log('搜索:', data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input defaultValue="" ref={keywordRef} placeholder="关键词" />
      <select defaultValue="all" ref={categoryRef}>
        <option value="all">全部</option>
        <option value="article">文章</option>
      </select>
      <button type="submit">搜索</button>
    </form>
  );
}
\`\`\`

注意是 \`defaultValue\` 不是 \`value\`：用 \`value\` 不写 \`onChange\` 输入框就锁死。

## 60.5 FormData 提交

更彻底的非受控：用原生 \`FormData\` 一次性收集整个表单，连 ref 都不用。

\`\`\`tsx
function RegisterForm() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // FormData 用 get(name) 取值
    const data = {
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      age: Number(formData.get('age')),
      subscribe: formData.get('subscribe') === 'on',
    };
    console.log('提交数据:', data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" />
      <input name="email" type="email" />
      <input name="age" type="number" />
      <input name="subscribe" type="checkbox" />
      <button type="submit">注册</button>
    </form>
  );
}
\`\`\`

\`FormData\` 要求每个字段都有 \`name\` 属性。勾选框 \`get\` 返回 \`'on'\` 或 \`null\`。

## 60.6 何时用受控

受控适合：

- **需要实时校验**：边输边提示错误
- **需要联动**：选 A 下拉影响 B 下拉选项
- **需要格式化输入**：自动加千分位、限制只能数字
- **需要禁用按钮**：必填项没填时按钮 disabled
- **值需要在多个组件间共享**：搜索框值要传给列表组件

\`\`\`tsx
function FormatInput() {
  const [phone, setPhone] = useState('');
  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\\D/g, '').slice(0, 11);
    // 138 0000 0000 格式
    return digits.replace(/(\\d{3})(\\d{4})(\\d{0,4})/, (_, a, b, c) =>
      c ? \`\${a} \${b} \${c}\` : b ? \`\${a} \${b}\` : a
    );
  };
  return <input value={phone} onChange={e => setPhone(formatPhone(e.target.value))} />;
}
\`\`\`

这种"边输边格式化"非受控没法做。

## 60.7 何时用非受控

非受控适合：

- **一次性提交**：简单表单只在提交时读一次值
- **性能敏感**：大表单受控每次输入都重渲染整树
- **第三方控件集成**：富文本编辑器、日期选择器有自己的状态
- **不需要 React 控制的字段**：纯前端文件上传

\`\`\`tsx
// 大表单：受控每次输入都重渲染整树
function BigFormControlled() {
  const [form, setForm] = useState({ name: '', age: '', email: '', phone: '', address: '' });
  // 改一个字段触发整个组件重渲染
  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  return (
    <form>
      <input value={form.name} onChange={update('name')} />
      <input value={form.age} onChange={update('age')} />
      {/* ... 几十个字段 */}
    </form>
  );
}

// 非受控：DOM 自管，只在提交时一次性读
function BigFormUncontrolled() {
  const formRef = useRef<HTMLFormElement>(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(formRef.current!);
    console.log(Object.fromEntries(data));
  };
  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input name="name" />
      <input name="age" />
      {/* ... 几十个字段，输入时不重渲染 */}
    </form>
  );
}
\`\`\`

## 60.8 Hybrid 混合模式

实际项目经常混合用：关键交互字段用受控，其他用非受控。

\`\`\`tsx
function CheckoutForm() {
  // 卡号需要实时格式化和校验，受控
  const [card, setCard] = useState('');
  const cardValid = card.replace(/\\s/g, '').length === 16;

  // 地址、备注用非受控，省渲染
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      card,
      address: fd.get('address'),
      note: fd.get('note'),
    };
    if (!cardValid) return;
    console.log('提交:', data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={card}
        onChange={e => setCard(e.target.value.replace(/\\D/g, '').replace(/(\\d{4})/g, '$1 ').trim())}
        placeholder="卡号"
      />
      {!cardValid && card && <span>卡号需 16 位</span>}
      <input name="address" placeholder="地址" />
      <textarea name="note" placeholder="备注" />
      <button type="submit" disabled={!cardValid}>支付</button>
    </form>
  );
}
\`\`\`

混合模式核心思路：**需要实时响应的用受控，剩下的用 FormData**。

## 60.9 受控的坑

1. **忘记 onChange**：\`<input value={text} />\` 不写 onChange 输入框锁死
2. **value 是 undefined**：state 初始值是 undefined 会让 input 变成 uncontrolled 警告
3. **number 类型转换**：\`e.target.value\` 永远是 string，要 number 得 \`Number()\`
4. **checkbox 不一样**：用 \`checked\` 不是 \`value\`，读 \`e.target.checked\`
5. **多个输入共用一个 onChange**：用计算属性名 \`[name]: e.target.value\`

\`\`\`tsx
// checkbox 是 checked 不是 value
<input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />

// 多字段共用 onChange
function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  const { name, value } = e.target;
  setForm(prev => ({ ...prev, [name]: value }));
}
\`\`\`

## 60.10 小结

- 受控：state 是数据源，\`value\` + \`onChange\` 成对，适合实时校验、联动、格式化
- 非受控：DOM 自管，\`useRef\` 或 \`FormData\` 提交时读，适合一次性提交、大表单、性能敏感
- \`FormData\` 一次性收集整个表单，要求 \`name\` 属性
- 实际项目常用 Hybrid：关键字段受控，其余用 FormData
- 受控的坑：忘 onChange、undefined 初值、number 转换、checkbox 用 checked
`,
    code: `// =============================================================
// 第 60 章 demo：受控表单 vs 非受控表单
// 模拟受控/非受控/Hybrid 三种模式
// =============================================================

// ---- 模拟 React useState / useRef ----
const states = [];
let stateIdx = 0;

function useState(initial) {
  const idx = stateIdx++;
  if (states[idx] === undefined) states[idx] = initial;
  const setter = (val) => {
    states[idx] = typeof val === 'function' ? val(states[idx]) : val;
    console.log('    [setState] 新值:', JSON.stringify(states[idx]));
  };
  return [states[idx], setter];
}

function useRef(initial) {
  return { current: initial };
}

// ---- 1. 受控组件：state 是数据源 ----
console.log('=== 1. 受控组件（value + onChange）===');

stateIdx = 0;
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 模拟用户输入：每次 onChange 同步到 state
  const handleEmail = (val) => setEmail(val);
  const handlePassword = (val) => setPassword(val);

  console.log('  初始 state: email="' + email + '" password="' + password + '"');

  // 模拟用户依次输入
  handleEmail('tom');
  handleEmail('tom@');
  handleEmail('tom@x.com');
  handlePassword('123456');

  console.log('  最终 state:', { email: states[0], password: states[1] });
}
LoginForm();

// ---- 2. 受控实时校验 ----
console.log('\\n=== 2. 受控实时校验 ===');

stateIdx = 0;
function EmailInput() {
  const [email, setEmail] = useState('');
  const isValid = /^[^@]+@[^@]+\\.[^@]+$/.test(email);

  // 模拟输入
  setEmail('tom');
  const r1 = { value: states[0], valid: /^[^@]+@[^@]+\\.[^@]+$/.test(states[0]) };
  setEmail('tom@x');
  const r2 = { value: states[0], valid: /^[^@]+@[^@]+\\.[^@]+$/.test(states[0]) };
  setEmail('tom@x.com');
  const r3 = { value: states[0], valid: /^[^@]+@[^@]+\\.[^@]+$/.test(states[0]) };

  console.log('  输入 "tom":', r1.valid ? '✓' : '✗ 格式错误');
  console.log('  输入 "tom@x":', r2.valid ? '✓' : '✗ 格式错误');
  console.log('  输入 "tom@x.com":', r3.valid ? '✓' : '✗ 格式错误');
}
EmailInput();

// ---- 3. 非受控：useRef 取值 ----
console.log('\\n=== 3. 非受控（useRef + defaultValue）===');

function SearchForm() {
  // 模拟 DOM input，ref.current.value 是 DOM 中的真实值
  const keywordRef = useRef('');
  const categoryRef = useRef('all');

  // 模拟用户在 DOM 中输入（不触发 React 重渲染）
  keywordRef.current = 'React hooks';
  categoryRef.current = 'article';

  const handleSubmit = () => {
    // 提交时一次性读
    const data = {
      keyword: keywordRef.current,
      category: categoryRef.current,
    };
    console.log('  提交搜索:', data);
  };
  handleSubmit();
}
SearchForm();

// ---- 4. FormData 提交 ----
console.log('\\n=== 4. FormData 提交（连 ref 都不用）===');

function RegisterForm() {
  // 模拟 form 提交事件
  const fakeForm = {
    username: 'tom_2024',
    email: 'tom@x.com',
    age: '25',
    subscribe: 'on',
  };

  // 模拟 FormData API
  const formData = {
    get(name) {
      return fakeForm[name] ?? null;
    },
  };

  const data = {
    username: formData.get('username'),
    email: formData.get('email'),
    age: Number(formData.get('age')),
    subscribe: formData.get('subscribe') === 'on',
  };
  console.log('  注册数据:', data);
}
RegisterForm();

// ---- 5. 性能对比：受控 vs 非受控 ----
console.log('\\n=== 5. 性能对比 ===');

let renderCount = 0;
stateIdx = 0;

// 受控：每次输入都重渲染
function ControlledBigForm() {
  const [form, setForm] = useState({});
  renderCount++;
  setForm({ ...form, f1: 'a' });
  renderCount++;
  setForm({ ...form, f2: 'b' });
  renderCount++;
}
ControlledBigForm();
console.log('  受控：3 次输入 → ' + renderCount + ' 次重渲染');

// 非受控：DOM 自管，不重渲染
renderCount = 0;
function UncontrolledBigForm() {
  // 一次性读，整个流程只渲染 1 次
  renderCount++;
}
UncontrolledBigForm();
console.log('  非受控：3 次输入 → ' + renderCount + ' 次重渲染');

// ---- 6. Hybrid 混合模式 ----
console.log('\\n=== 6. Hybrid 混合模式 ===');

stateIdx = 0;
function CheckoutForm() {
  // 卡号需要实时校验：受控
  const [card, setCard] = useState('');
  setCard('1234 5678 9012 3456');
  const cardValid = states[0].replace(/\\s/g, '').length === 16;

  // 地址/备注用 FormData
  const formData = {
    address: '北京市朝阳区',
    note: '工作日配送',
  };

  const handleSubmit = () => {
    if (!cardValid) {
      console.log('  卡号无效，阻止提交');
      return;
    }
    const data = {
      card: states[0],
      address: formData.address,
      note: formData.note,
    };
    console.log('  提交:', data);
  };
  handleSubmit();
}
CheckoutForm();

// ---- 7. 各种输入控件 ----
console.log('\\n=== 7. 各种输入控件取值方式 ===');

stateIdx = 0;
function MultiInputs() {
  const [text, setText] = useState('hello');
  const [number, setNumber] = useState(0);
  const [checked, setChecked] = useState(false);
  const [selected, setSelected] = useState('apple');

  // 模拟输入
  setText('world');        // text 类型直接用 value
  setNumber(42);            // number 要 Number() 转
  setChecked(true);         // checkbox 用 checked 不是 value
  setSelected('banana');   // select 用 value

  console.log('  text:', states[0]);
  console.log('  number:', states[1], '(typeof:', typeof states[1] + ')');
  console.log('  checkbox:', states[2]);
  console.log('  select:', states[3]);
}
MultiInputs();

// ---- 关键要点总结 ----
console.log('\\n=== 表单核心要点 ===');
console.log('1. 受控：state 是数据源，value + onChange 成对');
console.log('2. 受控优势：实时校验、联动、格式化');
console.log('3. 非受控：DOM 自管，useRef 或 FormData 一次性读');
console.log('4. FormData 要求 name 属性');
console.log('5. 大表单/性能敏感选非受控');
console.log('6. 实际项目常用 Hybrid 混合模式');
console.log('7. checkbox 用 checked，number 要 Number() 转');
`,
  },

  // =========================================================
  // 第六十一章：React Hook Form 完整指南
  // =========================================================
  {
    id: "tspro-react-hook-form",
    group: "十、表单与样式与动画",
    icon: "🪝",
    title: "React Hook Form 完整指南",
    content: `# 第六十一章：React Hook Form 完整指南

## 61.1 为什么需要 React Hook Form

受控表单写到 10 个字段就开始痛：

- 每个 input 都要 \`useState\` + \`onChange\`
- 每次输入触发整树重渲染，大表单明显卡顿
- 校验逻辑分散，错误信息管理混乱
- 表单状态、错误、提交状态、脏标记都要自己维护

\`\`\`tsx
// 传统受控：5 个字段 = 5 个 state + 5 个 onChange + 5 个 error state
function Form() {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  // ... 还有 password / age / phone
  // 提交时还要统一校验一遍
}
\`\`\`

React Hook Form（RHF）目标是**少写代码 + 性能更好 + 校验更专业**。

## 61.2 RHF 核心思想：非受控 + ref 注册

RHF 走非受控路线：用 \`register\` 把 ref 注册到 input，输入不触发 React 重渲染，提交时一次性读所有值。性能天然比受控好。

\`\`\`tsx
import { useForm } from 'react-hook-form';

interface FormValues {
  name: string;
  email: string;
  age: number;
}

function Form() {
  const { register, handleSubmit } = useForm<FormValues>();

  const onSubmit = (data: FormValues) => {
    console.log('提交:', data);  // { name, email, age }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} placeholder="姓名" />
      <input type="email" {...register('email')} placeholder="邮箱" />
      <input type="number" {...register('age')} placeholder="年龄" />
      <button type="submit">提交</button>
    </form>
  );
}
\`\`\`

跟受控对比：没 useState、没 onChange、没手动 ref。代码量减半。

\`{...register('name')}\` 等价于 \`{ name: 'name', ref: (el) => ..., onChange: ..., onBlur: ... }\`。

## 61.3 useForm 核心 API

\`useForm\` 返回的核心方法：

\`\`\`tsx
const {
  register,        // 注册字段（绑定 name + ref）
  handleSubmit,    // 包装 onSubmit，自动收集 + 校验
  watch,            // 监听字段变化（受控效果）
  getValues,       // 一次性读所有字段值
  setValue,        // 手动设置字段值
  reset,           // 重置表单到初值
  formState: { errors, isSubmitting, isDirty, isValid },
} = useForm<FormValues>();
\`\`\`

\`formState\` 提供状态：

- \`errors\`：每个字段的错误信息
- \`isSubmitting\`：\`handleSubmit\` 的 \`onSubmit\` 异步函数执行中
- \`isDirty\`：表单是否被修改过
- \`isValid\`：所有字段是否通过校验

## 61.4 register 内联校验

\`register\` 第二参数支持内置校验规则：

\`\`\`tsx
<input
  {...register('name', {
    required: '姓名不能为空',
    minLength: { value: 2, message: '至少 2 个字符' },
    maxLength: 20,
    pattern: /^[a-zA-Z\\u4e00-\\u9fa5]+$/,
  })}
/>
{errors.name && <span style={{ color: 'red' }}>{errors.name.message}</span>}
\`\`\`

内置规则：

- \`required\`：必填
- \`min\` / \`max\`：number 最小/最大值
- \`minLength\` / \`maxLength\`：字符串长度
- \`pattern\`：正则
- \`validate\`：自定义函数

\`\`\`tsx
{...register('password', {
  required: '密码必填',
  minLength: 8,
  validate: {
    hasUpper: v => /[A-Z]/.test(v) || '需要大写字母',
    hasNumber: v => /\\d/.test(v) || '需要数字',
  }
})}
\`\`\`

## 61.5 watch 实时监听

\`watch\` 让指定字段"变受控"：值变化触发重渲染。

\`\`\`tsx
function Form() {
  const { register, watch } = useForm();
  const password = watch('password', '');

  // 强度条根据 password 实时变化
  const strength = calcStrength(password);

  return (
    <div>
      <input type="password" {...register('password')} />
      <div>强度：{strength}</div>  {/* 实时变化 */}
    </div>
  );
}
\`\`\`

\`watch()\` 不带参数监听整个表单，性能差；\`watch('field')\` 监听单字段。

\`watch\` 触发重渲染，违反了"非受控性能好"的初衷，**只在确实需要联动时才用**。

## 61.6 useController 接管第三方控件

有些第三方控件（日期选择器、富文本、自定义 Select）不能直接用 \`register\`（它们要 \`value\` + \`onChange\` 而不是 \`ref\`）。这时用 \`useController\` 接管。

\`\`\`tsx
import { useForm, useController } from 'react-hook-form';
import DatePicker from 'react-datepicker';

function Form() {
  const { control, handleSubmit } = useForm();
  const { field, fieldState } = useController({
    name: 'birthday',
    control,
    rules: { required: '生日必填' },
  });

  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <DatePicker
        selected={field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
      />
      {fieldState.error && <span>{fieldState.error.message}</span>}
    </form>
  );
}
\`\`\`

\`useController\` 提供 \`value\` / \`onChange\` / \`onBlur\` / \`ref\`，相当于把 RHF 的字段接出来。

## 61.7 TS 类型 Resolver

RHF 跟 TS 配合用 \`Resolver\` 推断校验返回类型：

\`\`\`tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// schema 既是校验规则，也是 TS 类型源
const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18),
});

// 通过 zodResolver 注入：useForm 自动从 schema 推断 FormValues
type FormValues = z.infer<typeof schema>;

function Form() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),  // 关键：用 Zod 校验
  });

  const onSubmit = (data: FormValues) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      <input {...register('email')} />
      <input type="number" {...register('age')} />
      <button type="submit">提交</button>
    </form>
  );
}
\`\`\`

schema 既是运行时校验规则，也是编译时 TS 类型——**单源真理**。改 schema 类型自动变，不会再有"校验改了忘改 TS 类型"的 bug。

## 61.8 性能优势

RHF 性能远超受控方案。原理：

- **非受控**：register 用 ref 绑定，输入不触发 React 重渲染
- **订阅式 formState**：\`formState.errors\` 等用 Proxy 跟踪访问，只在访问的字段变化时触发重渲染
- **批量更新**：多个字段同时改用 \`trigger\` 一次校验

对比测试（50 个字段的表单输入一次）：

- 受控 useState：50 次重渲染（每个字段 setState 触发整组件）
- RHF register：0 次重渲染（DOM 自管，state 不变）
- RHF + watch：只重渲染订阅的字段

大表单 RHF 性能优势能到 10 倍以上。

## 61.9 reset / setValue 程序化操作

\`\`\`tsx
function EditForm({ defaultValues }) {
  const { register, reset, setValue, handleSubmit } = useForm({
    defaultValues,
  });

  // 加载远程数据后填回表单
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues]);

  // 程序化改字段值（如选了某省后清空市）
  const onProvinceChange = (val) => {
    setValue('city', '');
  };

  // 提交后清空表单
  const onSubmit = (data) => {
    console.log(data);
    reset();  // 清空
  };
}
\`\`\`

\`defaultValues\` 重要：影响 \`isDirty\` 判断和初次渲染值。表单有"编辑模式"必须传 \`defaultValues\`。

## 61.10 小结

- RHF 走非受控路线，\`register\` 用 ref 绑定，输入不触发重渲染
- 核心 API：\`useForm\` / \`register\` / \`handleSubmit\` / \`watch\` / \`formState.errors\`
- \`useController\` 接管第三方控件（不能 ref 的）
- TS 配合 \`zodResolver\`：schema 既是校验也是类型，单源真理
- \`watch\` 让指定字段变受控，性能成本高，按需用
- 大表单性能：RHF > 受控 useState 一个数量级
- \`reset\` / \`setValue\` 程序化操作
`,
    code: `// =============================================================
// 第 61 章 demo：React Hook Form 完整指南
// 模拟 useForm / register / handleSubmit / formState 实现
// =============================================================

// ---- 模拟 React Hook Form 核心 ----
function useForm(options = {}) {
  const fields = {};        // name -> { value, ref, rules }
  const errors = {};        // name -> error message
  let renderCount = 0;     // 重渲染计数
  const watchers = {};      // name -> 订阅回调

  // register：返回 name + ref，把元素挂上来
  function register(name, rules = {}) {
    return {
      name,
      ref: (el) => { if (el) fields[name] = { value: el.value || '', rules }; },
      onChange: (e) => {
        if (fields[name]) fields[name].value = e.target.value;
        // 触发 watch 订阅者
        if (watchers[name]) watchers[name].forEach(fn => fn(e.target.value));
      },
    };
  }

  // 内联校验
  function validateField(name, value) {
    const rules = fields[name]?.rules || {};
    if (rules.required && !value) {
      errors[name] = { message: typeof rules.required === 'string' ? rules.required : '必填' };
      return false;
    }
    if (rules.minLength && value.length < rules.minLength.value) {
      errors[name] = { message: rules.minLength.message || '太短' };
      return false;
    }
    if (rules.pattern && !rules.pattern.test(value)) {
      errors[name] = { message: '格式错误' };
      return false;
    }
    if (rules.validate) {
      const result = rules.validate(value);
      if (typeof result === 'string') { errors[name] = { message: result }; return false; }
    }
    delete errors[name];
    return true;
  }

  // handleSubmit：返回 onSubmit 包装函数
  function handleSubmit(onSubmit) {
    return (e) => {
      if (e && e.preventDefault) e.preventDefault();
      // 校验所有字段
      let valid = true;
      Object.keys(fields).forEach(name => {
        if (!validateField(name, fields[name].value)) valid = false;
      });
      if (valid) {
        const data = {};
        Object.keys(fields).forEach(name => { data[name] = fields[name].value; });
        onSubmit(data);
      }
    };
  }

  // watch：监听字段变化（受控效果）
  function watch(name, callback) {
    if (!watchers[name]) watchers[name] = [];
    watchers[name].push(callback);
    return fields[name]?.value;
  }

  // getValues：一次性读所有
  function getValues() {
    const data = {};
    Object.keys(fields).forEach(name => { data[name] = fields[name].value; });
    return data;
  }

  // setValue：手动设值
  function setValue(name, value) {
    if (fields[name]) fields[name].value = value;
  }

  // reset：重置
  function reset(values = {}) {
    Object.keys(fields).forEach(name => {
      fields[name].value = values[name] || '';
    });
  }

  const formState = {
    errors,
    isDirty: false,
    isValid: Object.keys(errors).length === 0,
  };

  return { register, handleSubmit, watch, getValues, setValue, reset, formState };
}

// ---- 1. 基本 register + handleSubmit ----
console.log('=== 1. 基本 register + handleSubmit ===');

const form1 = useForm();

// 模拟注册 3 个字段
const nameReg = form1.register('name', { required: '姓名必填' });
const emailReg = form1.register('email', { required: '邮箱必填', pattern: /^[^@]+@[^@]+\\.[^@]+$/ });
const ageReg = form1.register('age', { required: '年龄必填' });

// 模拟用户输入（DOM 自管，不触发重渲染）
nameReg.ref({ value: 'Tom' });
nameReg.onChange({ target: { value: 'Tom' } });
emailReg.onChange({ target: { value: 'tom@x.com' } });
ageReg.onChange({ target: { value: 25 } });

// 模拟提交
const submit1 = form1.handleSubmit((data) => {
  console.log('  提交成功:', data);
});
submit1({ preventDefault: () => {} });

// ---- 2. 校验失败 ----
console.log('\\n=== 2. 校验失败（email 格式错）===');

const form2 = useForm();
const e2 = form2.register('email', { required: '邮箱必填', pattern: /^[^@]+@[^@]+\\.[^@]+$/ });
e2.ref({ value: '' });
e2.onChange({ target: { value: 'bad-email' } });  // 故意输错

const submit2 = form2.handleSubmit((data) => console.log('  通过:', data));
submit2({ preventDefault: () => {} });
console.log('  errors:', form2.formState.errors);

// ---- 3. watch 实时监听 ----
console.log('\\n=== 3. watch 实时监听 ===');

const form3 = useForm();
let watchedName = '';
form3.register('name');
form3.watch('name', (val) => {
  watchedName = val;
  console.log('  [watch] name 变化:', val);
});

const n3 = form3.register('name');
n3.ref({ value: '' });
n3.onChange({ target: { value: 'T' } });
n3.onChange({ target: { value: 'To' } });
n3.onChange({ target: { value: 'Tom' } });
console.log('  最终 watchedName:', watchedName);

// ---- 4. setValue / reset ----
console.log('\\n=== 4. setValue / reset 程序化操作 ===');

const form4 = useForm({ defaultValues: { name: 'Tom', age: 20 } });
form4.register('name');
form4.register('age');
form4.setValue('name', 'Jerry');
form4.setValue('age', 30);
console.log('  setValue 后:', form4.getValues());

form4.reset({ name: '', age: 0 });
console.log('  reset 后:', form4.getValues());

// ---- 5. TS 类型推断模拟（zodResolver 思路）----
console.log('\\n=== 5. 模拟 zodResolver 类型推断 ===');

// 模拟 Zod schema
const schema = {
  name: { type: 'string', min: 2, required: true },
  email: { type: 'string', email: true, required: true },
  age: { type: 'number', min: 18, required: true },
};

// zodResolver：把 schema 转 register rules
function zodResolver(schema) {
  return (values) => {
    const errors = {};
    Object.keys(schema).forEach(name => {
      const rule = schema[name];
      if (rule.required && !values[name]) {
        errors[name] = { message: name + ' 必填' };
      }
      if (rule.min && values[name] && values[name] < rule.min) {
        errors[name] = { message: name + ' 不能小于 ' + rule.min };
      }
      if (rule.email && values[name] && !/^[^@]+@[^@]+\\.[^@]+$/.test(values[name])) {
        errors[name] = { message: '邮箱格式错误' };
      }
    });
    return { values, errors };
  };
}

const resolver = zodResolver(schema);
const result = resolver({ name: 'Tom', email: 'bad', age: 15 });
console.log('  校验结果:', result);

// ---- 6. 性能对比 ----
console.log('\\n=== 6. 性能对比（受控 vs RHF）===');

// 受控：每次 setState 触发重渲染
let controlledRenders = 0;
function controlledInput() {
  controlledRenders++;  // 每次输入都触发
}
['a', 'ab', 'abc'].forEach(() => controlledInput());
console.log('  受控 3 次输入 → ' + controlledRenders + ' 次重渲染');

// RHF：register 用 ref，输入不触发重渲染
let rhfRenders = 0;
const rhfForm = useForm();
rhfForm.register('name');
console.log('  RHF 3 次输入 → ' + rhfRenders + ' 次重渲染（DOM 自管）');

// ---- 7. useController 模拟（接管第三方控件）----
console.log('\\n=== 7. useController 模拟 ===');

function useController useFormAware(name, control) {
  const [value, setValue] = [undefined, (v) => { console.log('    [controller] 设值:', v); }];
  return {
    field: {
      value: '2024-01-01',
      onChange: (v) => console.log('    [controller] onChange:', v),
      onBlur: () => console.log('    [controller] onBlur'),
    },
    fieldState: { error: undefined, isDirty: false },
  };
}

const ctrl = useController useFormAware('birthday', null);
console.log('  接管 DatePicker value:', ctrl.field.value);
ctrl.field.onChange('2024-12-31');

// ---- 关键要点总结 ----
console.log('\\n=== React Hook Form 核心要点 ===');
console.log('1. RHF 走非受控路线，register 用 ref 绑定');
console.log('2. 输入不触发 React 重渲染，性能远超受控');
console.log('3. register(name, rules) 内联校验');
console.log('4. handleSubmit 包装 onSubmit 自动收集 + 校验');
console.log('5. watch 让指定字段变受控，按需用');
console.log('6. useController 接管不能 ref 的第三方控件');
console.log('7. zodResolver 让 schema 既是校验也是 TS 类型');
console.log('8. formState.errors / isDirty / isValid 状态齐全');
`,
  },

  // =========================================================
  // 第六十二章：Zod 表单校验
  // =========================================================
  {
    id: "tspro-zod",
    group: "十、表单与样式与动画",
    icon: "✅",
    title: "Zod 表单校验",
    content: `# 第六十二章：Zod 表单校验

## 62.1 为什么需要 Zod

校验是表单不可绕过的一环：必填、长度、邮箱格式、数字范围、密码强度……传统方案各有痛点。

\`\`\`tsx
// 手写校验：逻辑分散、复用难、错误信息难管
function validate(data) {
  const errors = {};
  if (!data.name) errors.name = '姓名必填';
  if (!data.email.includes('@')) errors.email = '邮箱格式错';
  if (data.age < 18) errors.age = '未成年';
  return errors;
}

// TS 类型只保证编译时，运行时丢光
interface User { name: string; email: string; age: number; }
// 接口拿到的 data 类型断言成 User，但实际可能是 { name: 123 }
const user = JSON.parse(jsonStr) as User;  // 编译过运行时炸
\`\`\`

Zod 想解决：

- **运行时校验**：TS 编译完就没了，Zod 让校验"活"在运行时
- **schema = 类型源**：写一份 schema，TS 类型从 schema 推断，**单源真理**
- **错误信息集中**：每个字段定制 message
- **嵌套 / 联合 / 工具方法**：复杂结构轻松表达

## 62.2 Zod 是什么

Zod 是 TypeScript 优先的运行时校验库。"声明 schema → 解析数据 → 拿到类型安全的值"。

\`\`\`tsx
import { z } from 'zod';

// 声明 schema
const UserSchema = z.object({
  name: z.string().min(2).max(20),
  email: z.string().email(),
  age: z.number().int().min(18).max(150),
  role: z.enum(['admin', 'user', 'guest']),  // 字面量联合
});

// 解析：成功返回数据，失败抛 ZodError
const user = UserSchema.parse({ name: 'Tom', email: 'tom@x.com', age: 25, role: 'user' });

// TS 类型从 schema 推断
type User = z.infer<typeof UserSchema>;
// 等价于 { name: string; email: string; age: number; role: 'admin' | 'user' | 'guest' }
\`\`\`

\`z.infer\` 是 Zod 的灵魂：**schema 是唯一的真相源，TS 类型自动跟随**。改 schema 不用改类型，永远不会出现"类型对不上的数据"。

## 62.3 常用 schema 类型

\`\`\`tsx
// 基础类型
z.string();       // 字符串
z.number();       // 数字
z.boolean();      // 布尔
z.bigint();
z.date();         // Date 对象
z.any();          // 任意
z.unknown();      // 未知（比 any 安全）
z.never();        // 永不

// 字面量
z.literal('admin');             // 'admin'
z.literal(42);                  // 42
z.enum(['admin', 'user']);      // 'admin' | 'user'

// 字符串细化
z.string().email();             // 邮箱
z.string().url();               // URL
z.string().uuid();              // UUID
z.string().min(8).max(20);      // 长度 8-20
z.string().regex(/^\\d+$/);      // 正则

// 数字细化
z.number().int().positive();    // 正整数
z.number().min(0).max(100);     // 0-100
\`\`\`

## 62.4 parse vs safeParse

\`parse\` 解析失败抛异常；\`safeParse\` 返回 \`{ success, data, error }\`，适合表单场景。

\`\`\`tsx
const Schema = z.object({ email: z.string().email() });

// parse：失败抛 ZodError
try {
  Schema.parse({ email: 'bad' });
} catch (e) {
  // e 是 ZodError，e.errors 是所有错误数组
  console.log(e.errors[0].message);  // 'Invalid email'
}

// safeParse：失败返回错误对象，不抛
const result = Schema.safeParse({ email: 'bad' });
if (!result.success) {
  console.log(result.error.issues);  // 错误数组
} else {
  console.log(result.data);  // 类型安全的 data
}
\`\`\`

表单场景几乎都用 \`safeParse\`：拿到 \`error.issues\` 数组，按 \`path\` 把每个字段的错误显示到对应位置。

## 62.5 嵌套对象和数组

\`\`\`tsx
const OrderSchema = z.object({
  id: z.string().uuid(),
  items: z.array(z.object({
    name: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
  })).min(1, '至少一个商品'),
  address: z.object({
    province: z.string(),
    city: z.string(),
    detail: z.string().min(5),
  }),
  createdAt: z.date(),
});

type Order = z.infer<typeof OrderSchema>;
// 推断出嵌套类型
// { id: string; items: { name: string; price: number; quantity: number }[]; ... }
\`\`\`

错误 \`path\` 是数组，能定位到嵌套字段：

\`\`\`tsx
const result = OrderSchema.safeParse({ items: [] });
if (!result.success) {
  // path: ['items'] → items 字段错
  result.error.issues.forEach(i => console.log(i.path, i.message));
}
\`\`\`

## 62.6 错误信息定制

每个规则都能定制 message：

\`\`\`tsx
const Schema = z.object({
  name: z
    .string({ required_error: '姓名不能为空', invalid_type_error: '姓名必须是字符串' })
    .min(2, '姓名至少 2 个字符')
    .max(20, '姓名最多 20 个字符'),
  email: z.string().email('邮箱格式不正确'),
  age: z.number().int().min(18, '必须成年').max(150, '年龄不合法'),
  password: z
    .string()
    .min(8, '密码至少 8 位')
    .refine(v => /[A-Z]/.test(v), '需要大写字母')
    .refine(v => /\\d/.test(v), '需要数字'),
});
\`\`\`

\`refine\` 自定义校验，\`superRefine\` 能在一个函数里给多个字段加错：

\`\`\`tsx
const Schema = z.object({
  password: z.string(),
  confirm: z.string(),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirm) {
    ctx.addIssue({
      path: ['confirm'],
      message: '两次密码不一致',
      code: 'custom',
    });
  }
});
\`\`\`

## 62.7 联合类型和可选

\`\`\`tsx
// 联合
const StatusSchema = z.union([z.string(), z.number()]);
type Status = z.infer<typeof StatusSchema>;  // string | number

// 简写
const StatusSchema2 = z.string().or(z.number());

// 字面量联合（更常用）
const RoleSchema = z.enum(['admin', 'user', 'guest']);
type Role = z.infer<typeof RoleSchema>;  // 'admin' | 'user' | 'guest'

// 可选 / 默认
const UserSchema = z.object({
  name: z.string(),                       // 必填
  age: z.number().optional(),              // 可选（age?: number）
  role: z.enum(['admin', 'user']).default('user'),  // 默认值
  nickname: z.string().nullable(),         // 可以是 null
  phone: z.string().nullish(),             // 可以是 null 或 undefined
});
\`\`\`

## 62.8 z.infer 推断类型

\`z.infer\` 让 schema 自动变 TS 类型：

\`\`\`tsx
const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  tags: z.array(z.string()),
  meta: z.object({
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
});

// 不用手写 interface User
type User = z.infer<typeof UserSchema>;
// 等价于
// interface User {
//   name: string;
//   email: string;
//   tags: string[];
//   meta: { createdAt: Date; updatedAt: Date };
// }

// input 和 output 类型可能不同（default / transform）
const Schema = z.object({
  count: z.number().default(0),     // input 可选，output 一定有
  date: z.string().transform(s => new Date(s)),  // input string，output Date
});

type Input = z.input<typeof Schema>;   // { count?: number; date: string }
type Output = z.output<typeof Schema>; // { count: number; date: Date }
\`\`\`

\`z.input\` 是用户传进来的类型，\`z.output\` 是 parse 完拿到的类型。带 \`default\` / \`transform\` 时两者不一样。

## 62.9 与 React Hook Form 配合

RHF + Zod 是当前 React 表单最佳实践。用 \`zodResolver\` 连接：

\`\`\`tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. 定义 schema（既校验又类型）
const schema = z.object({
  name: z.string().min(2, '至少 2 个字符'),
  email: z.string().email('邮箱格式错'),
  age: z.coerce.number().min(18, '必须成年'),  // coerce: 字符串自动转 number
});

// 2. 从 schema 推断类型
type FormData = z.infer<typeof schema>;

// 3. useForm 注入 zodResolver
function Form() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    // data 已经通过校验，类型安全
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="number" {...register('age')} />
      {errors.age && <span>{errors.age.message}</span>}

      <button type="submit">提交</button>
    </form>
  );
}
\`\`\`

\`z.coerce.number()\` 解决 HTML input 永远返回 string 的问题：自动把 \`'25'\` 转 \`25\`。

## 62.10 小结

- Zod 是 TS 优先的运行时校验库，schema 既是校验也是类型源
- \`z.infer\` 从 schema 推断类型，\`z.input\` / \`z.output\` 区分输入输出类型
- \`parse\` 抛异常，\`safeParse\` 返回结果对象，表单用 safeParse
- 嵌套对象、数组、联合、可选、默认值都支持
- 错误信息每个字段独立定制，\`refine\` / \`superRefine\` 自定义
- 与 RHF 配合用 \`zodResolver\`，schema 校验 + 类型推断一站式
- \`z.coerce.number()\` 让 input 的 string 自动转 number
`,
    code: `// =============================================================
// 第 62 章 demo：Zod 表单校验
// 模拟 Zod schema / parse / safeParse / z.infer 实现
// =============================================================

// ---- 模拟 Zod 核心 ----
function zString(opts = {}) {
  return {
    _type: 'string',
    _min: null,
    _max: null,
    _pattern: null,
    _email: false,
    min(n, msg) { this._min = { n, msg }; return this; },
    max(n, msg) { this._max = { n, msg }; return this; },
    pattern(p, msg) { this._pattern = { p, msg }; return this; },
    email(msg) { this._email = true; this._emailMsg = msg || '邮箱格式错'; return this; },
    parse(val) {
      const r = this.safeParse(val);
      if (!r.success) throw new ZodError(r.errors);
      return r.data;
    },
    safeParse(val) {
      const errors = [];
      if (typeof val !== 'string') {
        errors.push({ path: [], message: '期望 string' });
        return { success: false, error: { issues: errors }, data: undefined };
      }
      if (this._min && val.length < this._min.n) {
        errors.push({ path: [], message: this._min.msg || '太短' });
      }
      if (this._max && val.length > this._max.n) {
        errors.push({ path: [], message: this._max.msg || '太长' });
      }
      if (this._pattern && !this._pattern.p.test(val)) {
        errors.push({ path: [], message: this._pattern.msg || '格式错' });
      }
      if (this._email && !/^[^@]+@[^@]+\\.[^@]+$/.test(val)) {
        errors.push({ path: [], message: this._emailMsg });
      }
      if (errors.length) return { success: false, error: { issues: errors }, data: undefined };
      return { success: true, data: val };
    },
  };
}

function zNumber() {
  return {
    _type: 'number', _min: null, _max: null, _int: false,
    min(n, msg) { this._min = { n, msg }; return this; },
    max(n, msg) { this._max = { n, msg }; return this; },
    int() { this._int = true; return this; },
    parse(val) {
      if (typeof val !== 'number') throw new Error('期望 number');
      if (this._int && !Number.isInteger(val)) throw new Error('期望整数');
      if (this._min && val < this._min.n) throw new Error(this._min.msg || '太小');
      if (this._max && val > this._max.n) throw new Error(this._max.msg || '太大');
      return val;
    },
    safeParse(val) {
      try { return { success: true, data: this.parse(val) }; }
      catch (e) { return { success: false, error: { issues: [{ path: [], message: e.message }] } }; }
    },
  };
}

function zEnum(values) {
  return {
    _values: values,
    parse(val) {
      if (!values.includes(val)) throw new Error('必须是 ' + values.join('/'));
      return val;
    },
  };
}

function zObject(shape) {
  return {
    _shape: shape,
    parse(data) {
      const result = {};
      Object.keys(shape).forEach(key => {
        result[key] = shape[key].parse(data[key]);
      });
      return result;
    },
    safeParse(data) {
      const errors = [];
      const result = {};
      Object.keys(this._shape).forEach(key => {
        const r = this._shape[key].safeParse(data[key]);
        if (!r.success) {
          r.error.issues.forEach(i => errors.push({ path: [key, ...i.path], message: i.message }));
        } else {
          result[key] = r.data;
        }
      });
      if (errors.length) return { success: false, error: { issues: errors }, data: undefined };
      return { success: true, data: result };
    },
  };
}

class ZodError extends Error {
  constructor(issues) {
    super('ZodError');
    this.issues = issues;
    this.errors = issues;
  }
}

// z.infer 模拟：从 schema 提取 TS 类型
function inferType(schema) {
  // 简化：返回示意
  if (schema._type === 'string') return 'string';
  if (schema._type === 'number') return 'number';
  if (schema._values) return schema._values.join(' | ');
  if (schema._shape) {
    const obj = {};
    Object.keys(schema._shape).forEach(k => { obj[k] = inferType(schema._shape[k]); });
    return obj;
  }
  return 'unknown';
}

// ---- 1. 基本 schema + parse ----
console.log('=== 1. 基本 schema + parse ===');

const NameSchema = zString().min(2, '姓名至少 2 个字符').max(20);
console.log('  parse("Tom"):', NameSchema.parse('Tom'));
try { NameSchema.parse('T'); } catch (e) { console.log('  parse("T") 抛错:', e.issues[0].message); }

// ---- 2. safeParse ----
console.log('\\n=== 2. safeParse 不抛异常 ===');

const EmailSchema = zString().email();
const r1 = EmailSchema.safeParse('tom@x.com');
const r2 = EmailSchema.safeParse('bad');
console.log('  safeParse("tom@x.com"):', r1.success, '→', r1.data);
console.log('  safeParse("bad"):', r2.success, '→', r2.error.issues[0].message);

// ---- 3. 嵌套对象 ----
console.log('\\n=== 3. 嵌套对象 z.object ===');

const UserSchema = zObject({
  name: zString().min(2, '姓名至少 2 字'),
  email: zString().email('邮箱格式错'),
  age: zNumber().int().min(18, '必须成年'),
  role: zEnum(['admin', 'user']),
});

const good = UserSchema.safeParse({ name: 'Tom', email: 'tom@x.com', age: 25, role: 'admin' });
console.log('  合法数据:', good.success, '→', JSON.stringify(good.data));

const bad = UserSchema.safeParse({ name: 'T', email: 'bad', age: 15, role: 'guest' });
console.log('  非法数据:', bad.success);
bad.error.issues.forEach(i => console.log('    path:', i.path.join('.'), '|', i.message));

// ---- 4. z.infer 推断类型 ----
console.log('\\n=== 4. z.infer 推断类型 ===');

const InferredUser = inferType(UserSchema);
console.log('  推断的 User 类型:', JSON.stringify(InferredUser, null, 2));

// ---- 5. 错误信息定制 ----
console.log('\\n=== 5. 错误信息定制 ===');

const PasswordSchema = zString().min(8, '密码至少 8 位');
const r3 = PasswordSchema.safeParse('123');
console.log('  密码 "123":', r3.error.issues[0].message);

const r4 = PasswordSchema.safeParse('12345678');
console.log('  密码 "12345678":', r4.success);

// ---- 6. refine 自定义校验 ----
console.log('\\n=== 6. refine 自定义校验 ===');

function refine(schema, fn, msg) {
  const original = schema.safeParse.bind(schema);
  schema.safeParse = (val) => {
    const r = original(val);
    if (!r.success) return r;
    if (!fn(r.data)) {
      return { success: false, error: { issues: [{ path: [], message: msg }] }, data: undefined };
    }
    return r;
  };
  return schema;
}

const StrongPasswordSchema = refine(
  zString().min(8),
  v => /[A-Z]/.test(v) && /\\d/.test(v),
  '需要大写字母和数字'
);
console.log('  "weakweak":', StrongPasswordSchema.safeParse('weakweak').error.issues[0].message);
console.log('  "Strong123":', StrongPasswordSchema.safeParse('Strong123').success);

// ---- 7. 与 React Hook Form 配合 ----
console.log('\\n=== 7. zodResolver 模拟（RHF + Zod）===');

function zodResolver(schema) {
  return (values) => {
    const r = schema.safeParse(values);
    return {
      values: r.success ? r.data : {},
      errors: r.success ? {} : Object.fromEntries(
        r.error.issues.map(i => [i.path[0], { message: i.message }])
      ),
    };
  };
}

const resolver = zodResolver(UserSchema);
const resolved = resolver({ name: 'T', email: 'bad', age: 15, role: 'guest' });
console.log('  校验结果:', resolved.values ? '通过' : '失败');
console.log('  字段错误:');
Object.entries(resolved.errors).forEach(([k, v]) => {
  console.log('    ' + k + ':', v.message);
});

// ---- 8. z.coerce 模拟（自动转类型）----
console.log('\\n=== 8. z.coerce 自动转类型 ===');

function zCoerceNumber() {
  const base = zNumber();
  const origParse = base.parse.bind(base);
  base.parse = (val) => {
    if (typeof val === 'string') val = Number(val);
    return origParse(val);
  };
  return base;
}

const CoercedAge = zCoerceNumber().min(18);
console.log('  HTML input "25" (string):', CoercedAge.parse('25'), '(typeof:', typeof CoercedAge.parse('25') + ')');
console.log('  HTML input "15" (string) 校验: ', (() => {
  const r = CoercedAge.safeParse('15');
  return r.success ? '通过' : '失败 → ' + r.error.issues[0].message;
})());

// ---- 关键要点总结 ----
console.log('\\n=== Zod 核心要点 ===');
console.log('1. Zod 是 TS 优先的运行时校验库');
console.log('2. schema 既是校验规则也是 TS 类型源（z.infer）');
console.log('3. parse 抛异常，safeParse 返回 { success, data, error }');
console.log('4. 嵌套对象用 z.object，数组用 z.array');
console.log('5. 错误信息每字段独立定制');
console.log('6. refine / superRefine 自定义校验');
console.log('7. z.enum 字面量联合，z.union 任意联合');
console.log('8. z.coerce.number() 自动转 string → number');
console.log('9. zodResolver 连接 RHF：schema 一份搞定校验 + 类型');
`,
  },

  // =========================================================
  // 第六十三章：Tailwind CSS 实战
  // =========================================================
  {
    id: "tspro-tailwind",
    group: "十、表单与样式与动画",
    icon: "🎨",
    title: "Tailwind CSS 实战",
    content: `# 第六十三章：Tailwind CSS 实战

## 63.1 为什么需要 Tailwind

传统 CSS 写法：

\`\`\`tsx
// 写一个按钮要在 CSS 文件里建 .btn 类
.btn { padding: 8px 16px; border-radius: 4px; background: #3b82f6; color: white; }
.btn-primary { background: #2563eb; }
.btn-large { padding: 12px 24px; }

// 然后 JSX 引用
<button className="btn btn-primary btn-large">提交</button>
\`\`\`

痛点：

- **起名累**：每个组件要起 \`btn\` / \`btn-primary\` / \`btn-large\` 等类名
- **CSS 文件膨胀**：项目越大 CSS 越大，删了组件类名还留着
- **复用难**：要改 padding 得改 CSS 文件，要 inline 调整做不到
- **上下文切换**：在 JSX 和 CSS 之间来回跳

Tailwind 是**原子化 CSS**方案：只提供"基础工具类"，组合起来用，不再写自定义类。

\`\`\`tsx
// Tailwind：直接用工具类组合
<button className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">
  提交
</button>
\`\`\`

每个类对应一条 CSS 属性：\`px-4\` = \`padding-left/right: 1rem\`，\`bg-blue-500\` = \`background: #3b82f6\`。

## 63.2 Tailwind 是什么

Tailwind 是 utility-first CSS 框架。所有样式都通过预设的小类组合实现，**不在 CSS 文件里写规则**。

- \`px-4\`：左右 padding 1rem（16px）
- \`py-2\`：上下 padding 0.5rem（8px）
- \`text-white\`：白色文字
- \`bg-blue-500\`：蓝色背景
- \`rounded\`：圆角 0.25rem
- \`font-bold\`：粗体
- \`flex\`：\`display: flex\`
- \`gap-2\`：flex/grid 间距

最终产物是按需生成的 CSS 文件，只包含项目里实际用到的类，体积小。

## 63.3 常用工具类速查

\`\`\`tsx
// 间距：p / m / px / py / mx / my / pt ...
<div className="p-4">       // padding: 1rem
<div className="px-2 py-1"> // 左右 0.5rem 上下 0.25rem
<div className="m-2">       // margin: 0.5rem
<div className="gap-4">     // flex/grid 间距 1rem

// 颜色：bg- / text- / border-
<button className="bg-blue-500 text-white border border-gray-300">

// 字体
<span className="text-lg font-bold text-gray-800">

// 布局
<div className="flex items-center justify-between">
<div className="grid grid-cols-3 gap-4">

// 尺寸
<img className="w-32 h-32 rounded-full" />  // 8rem 8rem 圆形

// 边框圆角
<div className="border border-gray-200 rounded-lg shadow">

// 交互状态
<button className="hover:bg-blue-600 focus:ring-2 focus:ring-blue-300">
\`\`\`

数字是 Tailwind 的"刻度系统"：\`1\` = 0.25rem，\`2\` = 0.5rem，\`4\` = 1rem，\`8\` = 2rem。颜色 \`500\` 是主色，\`100\` 浅 \`900\` 深。

## 63.4 响应式前缀 sm / md / lg

Tailwind 用前缀实现响应式：\`sm:\` / \`md:\` / \`lg:\` / \`xl:\`。

\`\`\`tsx
// 移动端单列，桌面端三列
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div>卡片 1</div>
  <div>卡片 2</div>
  <div>卡片 3</div>
</div>

// 文字大小响应式
<h1 className="text-2xl md:text-4xl lg:text-5xl">标题</h1>

// 隐藏/显示
<div className="hidden md:block">桌面端才显示</div>
<div className="block md:hidden">移动端才显示</div>
\`\`\`

默认断点：

- \`sm:\`：≥640px（小屏手机横屏）
- \`md:\`：≥768px（平板）
- \`lg:\`：≥1024px（小桌面）
- \`xl:\`：≥1280px（大桌面）
- \`2xl:\`：≥1536px

**移动优先**：不写前缀是手机样式，加了前缀是大屏覆盖。

## 63.5 暗色模式 dark:

\`dark:\` 前缀实现暗色模式，配合 \`prefers-color-scheme\` 或 class 策略：

\`\`\`tsx
// 自动跟随系统
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  内容
</div>

// 手动 class 策略（在 html 上加 dark 类）
<html className="dark">
  <div className="bg-white dark:bg-gray-900">...</div>
</html>
\`\`\`

切换主题：

\`\`\`tsx
function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);
  return <button onClick={() => setDark(!dark)}>切换</button>;
}
\`\`\`

## 63.6 自定义颜色和主题

\`tailwind.config.js\` 扩展主题：

\`\`\`tsx
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          500: '#3b82f6',  // 主色
          700: '#1d4ed8',
        },
      },
      spacing: {
        '18': '4.5rem',  // 自定义刻度
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
};
\`\`\`

用的时候跟内置类一样：\`bg-brand-500\` / \`text-brand-700\` / \`p-18\`。

## 63.7 条件类：clsx / cva

实际项目经常要"满足条件才加某个类"。手写模板字符串难看：

\`\`\`tsx
// 丑陋
const className = 'btn ' + (primary ? 'btn-primary ' : '') + (large ? 'btn-large' : '');
\`\`\`

\`clsx\` 是处理条件类的轻量库：

\`\`\`tsx
import clsx from 'clsx';

const className = clsx(
  'px-4 py-2 rounded',         // 基础类
  primary && 'bg-blue-500',    // 条件类
  large && 'px-6 py-3',         // 覆盖
  disabled && 'opacity-50 cursor-not-allowed'
);
\`\`\`

\`cva\`（class-variance-authority）更进一步：定义组件的 variants。

\`\`\`tsx
import { cva } from 'class-variance-authority';

const button = cva('px-4 py-2 rounded font-medium', {
  variants: {
    variant: {
      primary: 'bg-blue-500 text-white hover:bg-blue-600',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
      danger: 'bg-red-500 text-white hover:bg-red-600',
    },
    size: {
      sm: 'px-2 py-1 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

function Button({ variant, size, className, ...props }) {
  return <button className={button({ variant, size, className })} {...props} />;
}

// 用
<Button variant="danger" size="lg">删除</Button>
\`\`\`

\`cva\` 让组件的样式 variants 类型安全，TS 还能自动推断 \`variant\` / \`size\` 的可选值。

## 63.8 @apply 用法

有时嫌 className 太长想抽成类，用 \`@apply\`：

\`\`\`css
/* 在 global.css */
.btn-primary {
  @apply px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600;
}

.card {
  @apply bg-white rounded-lg shadow-md p-6 border border-gray-200;
}
\`\`\`

JSX 引用普通类名即可：

\`\`\`tsx
<button className="btn-primary">提交</button>
<div className="card">...</div>
\`\`\`

\`@apply\` 让 Tailwind 跟传统 CSS 共存。但 Tailwind 官方建议**慎用 @apply**：抽出去了又回到"起名地狱"，工具类组合才灵活。

## 63.9 性能和按需生成

Tailwind 通过扫描源码"按需生成"CSS：

- 配置 \`content\` 指定要扫描的文件
- 编译时分析每个文件里出现的类名
- 只把用到的类生成进最终 CSS

\`\`\`tsx
module.exports = {
  content: ['./src/**/*.{ts,tsx,html}'],  // 扫描所有 ts/tsx
  // ...
};
\`\`\`

最终 CSS 体积通常只有 10-20KB（gzip 后），跟传统手写 CSS 文件比小一个数量级。

生产构建还会自动去重、压缩、合并。JIT（Just-in-Time）编译让任意值都支持：

\`\`\`tsx
// 任意值
<div className="bg-[#1da1f2] w-[327px] grid-cols-[200px_1fr]">
\`\`\`

## 63.10 小结

- Tailwind 是原子化 CSS，用工具类组合代替自定义类
- 优势：不起名、CSS 不膨胀、上下文不切换、按需生成
- \`sm/md/lg/xl\` 响应式前缀，移动优先
- \`dark:\` 暗色模式，\`hover:\` \`focus:\` 状态前缀
- \`tailwind.config.js\` 扩展主题，自定义颜色、间距、字体
- \`clsx\` 处理条件类，\`cva\` 定义组件 variants
- \`@apply\` 抽工具类组合成新类（慎用）
- JIT 编译支持任意值 \`bg-[#1da1f2]\`
`,
    code: `// =============================================================
// 第 63 章 demo：Tailwind CSS 实战
// 模拟工具类组合 / 响应式 / 条件类 / cva 实现
// =============================================================

// ---- 1. 模拟 Tailwind 工具类映射 ----
const tailwindClasses = {
  // 间距
  'p-1': 'padding: 0.25rem', 'p-2': 'padding: 0.5rem', 'p-4': 'padding: 1rem',
  'px-2': 'padding-left: 0.5rem; padding-right: 0.5rem',
  'px-4': 'padding-left: 1rem; padding-right: 1rem',
  'py-2': 'padding-top: 0.5rem; padding-bottom: 0.5rem',
  'm-2': 'margin: 0.5rem', 'gap-4': 'gap: 1rem',
  // 颜色
  'bg-blue-500': 'background: #3b82f6',
  'bg-blue-600': 'background: #2563eb',
  'bg-red-500': 'background: #ef4444',
  'bg-gray-900': 'background: #111827',
  'text-white': 'color: white',
  'text-gray-800': 'color: #1f2937',
  // 圆角
  'rounded': 'border-radius: 0.25rem',
  'rounded-lg': 'border-radius: 0.5rem',
  'rounded-full': 'border-radius: 9999px',
  // 边框
  'border': 'border-width: 1px',
  'border-gray-200': 'border-color: #e5e7eb',
  // 字体
  'font-bold': 'font-weight: 700',
  'text-sm': 'font-size: 0.875rem',
  'text-lg': 'font-size: 1.125rem',
  // 布局
  'flex': 'display: flex',
  'grid': 'display: grid',
  'grid-cols-3': 'grid-template-columns: repeat(3, 1fr)',
  'items-center': 'align-items: center',
  'justify-center': 'justify-content: center',
};

function resolveClasses(classNames) {
  // 把字符串里的所有类名解析成 CSS
  const list = classNames.trim().split(/\\s+/);
  const css = [];
  list.forEach(cls => {
    // 处理 hover: / dark: / md: 等前缀
    const prefix = cls.match(/^(hover:|dark:|md:|lg:)?(.+)/);
    if (!prefix) return;
    const [, pre, name] = prefix;
    const cssRule = tailwindClasses[name];
    if (cssRule) {
      css.push(pre ? pre + ' { ' + cssRule + ' }' : cssRule);
    }
  });
  return css;
}

// ---- 1. 基本 Tailwind 类组合 ----
console.log('=== 1. Tailwind 类组合 ===');

const btnClasses = 'px-4 py-2 rounded bg-blue-500 text-white font-bold';
const btnCss = resolveClasses(btnClasses);
console.log('  按钮类:', btnClasses);
console.log('  生成的 CSS:');
btnCss.forEach(c => console.log('    ' + c));

// ---- 2. 响应式前缀 ----
console.log('\\n=== 2. 响应式前缀 md: / lg: ===');

const cardClasses = 'grid grid-cols-3 md:gap-4 lg:bg-gray-900';
const cardCss = resolveClasses(cardClasses);
console.log('  卡片类:', cardClasses);
console.log('  生成的 CSS:');
cardCss.forEach(c => console.log('    ' + c));

// ---- 3. 暗色模式 dark: ----
console.log('\\n=== 3. 暗色模式 dark: ===');

const themeClasses = 'bg-white text-gray-800 dark:bg-gray-900 dark:text-white';
const themeCss = resolveClasses(themeClasses);
console.log('  类:', themeClasses);
themeCss.forEach(c => console.log('    ' + c));

// ---- 4. 模拟 clsx 处理条件类 ----
console.log('\\n=== 4. 模拟 clsx 条件类 ===');

function clsx(...args) {
  const classes = [];
  args.forEach(arg => {
    if (typeof arg === 'string') classes.push(arg);
    else if (typeof arg === 'object' && arg !== null) {
      Object.keys(arg).forEach(key => { if (arg[key]) classes.push(key); });
    }
  });
  return classes.join(' ');
}

const isPrimary = true;
const isLarge = false;
const isDisabled = true;
const result1 = clsx(
  'px-4 py-2 rounded',
  isPrimary && 'bg-blue-500 text-white',
  isLarge && 'px-6 py-3',
  isDisabled && 'opacity-50 cursor-not-allowed'
);
console.log('  条件组合:', result1);

// ---- 5. 模拟 cva 定义组件 variants ----
console.log('\\n=== 5. 模拟 cva 组件 variants ===');

function cva(base, config) {
  return function (props = {}) {
    const { variant, size, className } = props;
    const variantClass = config.variants?.variant?.[variant] || '';
    const sizeClass = config.variants?.size?.[size] || '';
    const defaultVariant = config.defaultVariants?.variant;
    const defaultSize = config.defaultVariants?.size;
    const finalVariant = variantClass || config.variants?.variant?.[defaultVariant];
    const finalSize = sizeClass || config.variants?.size?.[defaultSize];
    return clsx(base, finalVariant, finalSize, className);
  };
}

const button = cva('px-4 py-2 rounded font-medium', {
  variants: {
    variant: {
      primary: 'bg-blue-500 text-white',
      secondary: 'bg-gray-200 text-gray-800',
      danger: 'bg-red-500 text-white',
    },
    size: {
      sm: 'px-2 py-1 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

console.log('  默认:', button());
console.log('  danger + lg:', button({ variant: 'danger', size: 'lg' }));
console.log('  secondary + 自定义:', button({ variant: 'secondary', className: 'shadow' }));

// ---- 6. 自定义颜色 ----
console.log('\\n=== 6. 自定义颜色（模拟 tailwind.config.js）===');

const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff', 500: '#3b82f6', 700: '#1d4ed8',
        },
      },
    },
  },
};

// 把自定义颜色合并到 classes 映射
Object.keys(tailwindConfig.theme.extend.colors.brand).forEach(shade => {
  tailwindClasses['bg-brand-' + shade] = 'background: ' + tailwindConfig.theme.extend.colors.brand[shade];
  tailwindClasses['text-brand-' + shade] = 'color: ' + tailwindConfig.theme.extend.colors.brand[shade];
});

const brandClasses = 'bg-brand-500 text-white hover:bg-brand-700';
console.log('  品牌色类:', brandClasses);
resolveClasses(brandClasses).forEach(c => console.log('    ' + c));

// ---- 7. @apply 模拟 ----
console.log('\\n=== 7. @apply 抽工具类组合 ===');

function applyTailwind(classNames) {
  // 把 Tailwind 类组合成一个"复合类"
  const css = resolveClasses(classNames);
  return { className: 'custom-class', css: css.join('; ') };
}

const customBtn = applyTailwind('px-4 py-2 rounded bg-blue-500 text-white');
console.log('  .btn-primary @apply 后:');
console.log('    className:', customBtn.className);
console.log('    合并 CSS:', customBtn.css);

// ---- 8. JIT 任意值 ----
console.log('\\n=== 8. JIT 任意值 bg-[#1da1f2] ===');

function resolveArbitrary(cls) {
  // 模拟解析 bg-[#xxx] w-[xxxpx]
  const m1 = cls.match(/^bg-\\[#([0-9a-fA-F]+)\\]$/);
  if (m1) return 'background: #' + m1[1];
  const m2 = cls.match(/^w-\\[(\\d+)px\\]$/);
  if (m2) return 'width: ' + m2[1] + 'px';
  const m3 = cls.match(/^h-\\[(\\d+)px\\]$/);
  if (m3) return 'height: ' + m3[1] + 'px';
  return null;
}

['bg-[#1da1f2]', 'w-[327px]', 'h-[64px]'].forEach(cls => {
  console.log('  ' + cls + ' → ' + resolveArbitrary(cls));
});

// ---- 9. 完整组件示例 ----
console.log('\\n=== 9. 完整组件示例 ===');

function Card({ title, content, dark }) {
  const baseClass = clsx(
    'rounded-lg p-6',
    dark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800',
    'border border-gray-200'
  );
  return { tag: 'div', className: baseClass, children: [
    { tag: 'h3', className: 'text-lg font-bold mb-2', children: title },
    { tag: 'p', className: dark ? 'text-gray-300' : 'text-gray-600', children: content },
  ]};
}

const card = Card({ title: 'Tailwind 实战', content: '原子化 CSS 让样式更灵活', dark: true });
console.log('  Card(dark) className:', card.className);
console.log('  h3 className:', card.children[0].className);

// ---- 关键要点总结 ----
console.log('\\n=== Tailwind 核心要点 ===');
console.log('1. 原子化 CSS，工具类组合代替自定义类');
console.log('2. sm/md/lg/xl 响应式前缀，移动优先');
console.log('3. dark: 暗色模式，hover:/focus: 状态前缀');
console.log('4. tailwind.config.js 扩展主题、自定义颜色');
console.log('5. clsx 处理条件类');
console.log('6. cva 定义组件 variants，类型安全');
console.log('7. @apply 抽工具类组合（慎用）');
console.log('8. JIT 支持任意值 bg-[#xxx] w-[xxxpx]');
console.log('9. 按需生成，最终 CSS 仅 10-20KB');
`,
  },

  // =========================================================
  // 第六十四章：CSS-in-JS（Styled Components / Emotion）
  // =========================================================
  {
    id: "tspro-css-in-js",
    group: "十、表单与样式与动画",
    icon: "💅",
    title: "CSS-in-JS（Styled Components / Emotion）",
    content: `# 第六十四章：CSS-in-JS（Styled Components / Emotion）

## 64.1 CSS-in-JS 是什么

CSS-in-JS 把 CSS 写在 JS 里：用 JS 模板字符串生成 CSS，运行时注入到 \`<style>\` 标签。

\`\`\`tsx
import styled from 'styled-components';

// 用模板字符串定义样式
const Button = styled.button\`
  padding: 8px 16px;
  border-radius: 4px;
  background: #3b82f6;
  color: white;
  border: none;
  cursor: pointer;
  &:hover { background: #2563eb; }
\`;

function App() {
  return <Button>提交</Button>;
}
\`\`\`

跟传统 CSS 文件、Tailwind 都不一样：

- 传统 CSS：样式独立文件，类名引用
- Tailwind：工具类组合，不在 CSS 文件写规则
- CSS-in-JS：样式写在 JS 里，组件即样式

## 64.2 为什么需要 CSS-in-JS

CSS-in-JS 解决传统 CSS 的工程化痛点：

- **作用域隔离**：自动生成唯一类名，不会冲突
- **样式跟随组件**：删了组件样式自动删，没"僵尸 CSS"
- **动态样式**：能读 JS 变量做条件样式
- **代码分割**：组件按需加载，样式一起加载
- **TS 类型支持**：props 类型安全

\`\`\`tsx
// 传统 CSS 痛点
.btn { ... }              // 全局污染
.btn-primary { ... }      // 删了组件类还在
.btn-large { ... }        // 复用难
// CSS-in-JS：每个 styled.button 自动生成 hash 类名，永远不冲突
\`\`\`

## 64.3 Styled Components vs Emotion

两个主流库：

| 维度 | Styled Components | Emotion |
|------|-------------------|---------|
| API | styled.div 模板字符串 | css + styled 两种 |
| 性能 | 运行时 hash | 略快 |
| 包体积 | ~12KB | ~8KB |
| TS 支持 | 完整 | 完整 |
| 生态 | 大 | 大 |
| 推荐场景 | 中大型项目 | 性能敏感 |

Emotion 更轻量灵活，styled-components API 更直观。两个思路一致，学一个另一个就会。

\`\`\`tsx
// styled-components
import styled from 'styled-components';
const Btn = styled.button\` padding: 8px; \`;

// emotion
import styled from '@emotion/styled';
const Btn = styled.button\` padding: 8px; \`;

// emotion css prop（推荐用法）
import { css } from '@emotion/react';
const style = css\` padding: 8px; \`;
<button css={style}>按钮</button>
\`\`\`

## 64.4 styled.div 基本用法

\`\`\`tsx
import styled from 'styled-components';

const Card = styled.div\`
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  h3 {
    margin: 0 0 8px;
    font-size: 18px;
  }

  p {
    margin: 0;
    color: #6b7280;
  }
\`;

function App() {
  return (
    <Card>
      <h3>标题</h3>
      <p>内容</p>
    </Card>
  );
}
\`\`\`

\`styled.div\` 等价于"创建一个带样式的 div 组件"。能嵌套（\`h3\` / \`p\`）、能伪类（\`&:hover\`）。

## 64.5 props 动态样式

最大威力：能根据 props 动态改样式：

\`\`\`tsx
interface BtnProps {
  primary?: boolean;
  large?: boolean;
  disabled?: boolean;
}

const Button = styled.button<BtnProps>\`
  padding: \${props => props.large ? '12px 24px' : '8px 16px'};
  border-radius: 4px;
  border: none;
  cursor: pointer;
  background: \${props => props.primary ? '#3b82f6' : '#e5e7eb'};
  color: \${props => props.primary ? 'white' : '#374151'};

  &:hover {
    background: \${props => props.primary ? '#2563eb' : '#d1d5db'};
  }

  \${props => props.disabled && css\`
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  \`}
\`;

// 用
<Button primary large>主按钮</Button>
<Button>次要按钮</Button>
<Button disabled>禁用</Button>
\`\`\`

\`\${(props) => ...}\` 模板字符串里函数会拿到 props，返回值插到 CSS 里。这是 CSS-in-JS 的灵魂。

## 64.6 theme 主题

\`ThemeProvider\` 注入主题，所有 styled 组件共享：

\`\`\`tsx
import { ThemeProvider, styled } from 'styled-components';

const theme = {
  colors: {
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    text: '#1f2937',
    muted: '#6b7280',
    bg: '#ffffff',
  },
  spacing: {
    sm: '8px',
    md: '16px',
    lg: '24px',
  },
  fontSize: {
    sm: '12px',
    md: '14px',
    lg: '18px',
  },
};

const Button = styled.button\`
  padding: \${props => props.theme.spacing.sm} \${props => props.theme.spacing.md};
  background: \${props => props.theme.colors.primary};
  color: white;
\`;

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Button>提交</Button>
    </ThemeProvider>
  );
}
\`\`\`

切换主题：换 \`theme\` 对象即可。暗色模式就是定义两套 theme 切换。

## 64.7 TS 类型扩展 StyledProps

跟 TS 配合要扩展 props 类型：

\`\`\`tsx
interface ButtonProps {
  variant: 'primary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = styled.button<ButtonProps>\`
  padding: \${({ size }) => size === 'lg' ? '12px 24px' : '8px 16px'};
  background: \${({ variant }) => variant === 'primary' ? '#3b82f6' : variant === 'danger' ? '#ef4444' : 'transparent'};
\`;

// 调用时 TS 会校验 variant 字面量
<Button variant="primary" size="lg">主按钮</Button>
<Button variant="danger">删除</Button>
// <Button variant="foo" /> 编译报错
\`\`\`

\`styled.button<ButtonProps>\` 泛型里写 props 类型，TS 才能识别。还能扩展 \`theme\` 默认类型：

\`\`\`tsx
import 'styled-components';
import { theme } from './theme';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: typeof theme.colors;
    spacing: typeof theme.spacing;
  }
}

// 之后 styled 里 props.theme 自动有类型
\`\`\`

## 64.8 性能 vs Tailwind

CSS-in-JS vs Tailwind 是当前 React 社区两大流派：

| 维度 | CSS-in-JS | Tailwind |
|------|-----------|---------|
| 运行时开销 | 有（生成 hash、注入 style） | 无（编译期生成） |
| SSR | 需要收集样式提取 | 原生支持 |
| 包体积 | 大（库本身） | 小（按需生成） |
| 动态样式 | 极强 | 一般（任意值） |
| 维护 | 起组件名 | 不起名 |
| 学习曲线 | 平缓（会 CSS 就行） | 要记类名 |

实际项目取舍：

- **要极强动态样式**（高度主题化产品）：CSS-in-JS
- **要最佳性能**（To C 高并发）：Tailwind
- **要快速开发**：Tailwind（工具类上手快）
- **要组件 API 抽象**：CSS-in-JS

Next.js App Router 默认推荐 Tailwind，CSS-in-JS 在 RSC 下需要额外配置。

## 64.9 Emotion css prop

Emotion 推荐的 \`css\` prop 用法比 styled 更轻：

\`\`\`tsx
import { css } from '@emotion/react';

// 直接在 JSX 上写 css prop
function Button({ primary }) {
  return (
    <button
      css={css\`
        padding: 8px 16px;
        border-radius: 4px;
        background: \${primary ? '#3b82f6' : '#e5e7eb'};
        color: \${primary ? 'white' : '#374151'};
        &:hover { background: \${primary ? '#2563eb' : '#d1d5db'}; }
      \`}
    >
      按钮
    </button>
  );
}
\`\`\`

不需要预先 \`styled.button\`，样式跟着组件写。性能略低于 styled（每次 render 重新计算），但开发更灵活。

## 64.10 小结

- CSS-in-JS 把样式写在 JS 里，运行时生成 hash 类名注入 style 标签
- 优势：作用域隔离、动态样式、样式跟组件走、代码分割
- styled-components API 直观，emotion 更轻量灵活
- \`styled.div\` 模板字符串 + 嵌套 + 伪类
- props 动态样式是核心威力：\`\${(props) => ...}\`
- ThemeProvider 共享主题，切主题换 theme 对象
- TS 配合：\`styled.button<Props>\` 泛型 + 模块扩展 DefaultTheme
- vs Tailwind：CSS-in-JS 动态强但运行时开销大，Tailwind 性能最优
- 实际取舍：动态主题化用 CSS-in-JS，性能 / 快速开发用 Tailwind
`,
    code: `// =============================================================
// 第 64 章 demo：CSS-in-JS（Styled Components / Emotion）
// 模拟 styled.div / props 动态样式 / theme 实现
// =============================================================

// ---- 模拟 styled-components 核心 ----
let classCounter = 0;  // 用于生成唯一类名

const styleRegistry = {};  // className -> CSS 字符串

function hash(str) {
  // 简化 hash：取字符码累加
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return 'sc-' + Math.abs(h).toString(36).slice(0, 6);
}

function styled(tag) {
  return function (strings, ...interpolations) {
    // 生成唯一 className
    const rawCss = strings.reduce((acc, str, i) => {
      const interp = interpolations[i - 1];
      return acc + (typeof interp === 'function' ? '__FN__' + (i - 1) + '__' : interp || '') + str;
    });
    const className = hash(rawCss);

    // 返回组件构造器
    function createComponent(props = {}) {
      // 执行插值：函数拿到 props
      const cssStr = strings.reduce((acc, str, i) => {
        if (i === 0) return str;
        const interp = interpolations[i - 1];
        let val = interp;
        if (typeof interp === 'function') val = interp(props);
        return acc + val + str;
      }, '');

      // 注册样式（运行时注入 style 标签模拟）
      styleRegistry[className] = cssStr;
      return { tag, className, css: cssStr, props };
    }

    createComponent.className = className;
    return createComponent;
  };
}

styled.div = styled('div');
styled.button = styled('button');
styled.span = styled('span');

// ---- 1. 基本 styled.div ----
console.log('=== 1. 基本 styled.div ===');

const Card = styled.div\`
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
\`;

const cardInstance = Card({});
console.log('  生成的 className:', cardInstance.className);
console.log('  生成的 CSS:');
cardInstance.css.split('\\n').forEach(line => console.log('    ' + line.trim()));

// ---- 2. props 动态样式 ----
console.log('\\n=== 2. props 动态样式 ===');

const Button = styled.button\`
  padding: \${props => props.large ? '12px 24px' : '8px 16px'};
  border-radius: 4px;
  border: none;
  cursor: pointer;
  background: \${props => props.primary ? '#3b82f6' : '#e5e7eb'};
  color: \${props => props.primary ? 'white' : '#374151'};
  &:hover {
    background: \${props => props.primary ? '#2563eb' : '#d1d5db'};
  }
\`;

const btn1 = Button({ primary: true, large: true });
const btn2 = Button({ primary: false });
console.log('  primary + large:');
btn1.css.split('\\n').forEach(line => { if (line.trim()) console.log('    ' + line.trim()); });
console.log('  secondary:');
btn2.css.split('\\n').forEach(line => { if (line.trim()) console.log('    ' + line.trim()); });

// ---- 3. theme 主题注入 ----
console.log('\\n=== 3. theme 主题注入 ===');

const defaultTheme = {
  colors: { primary: '#3b82f6', text: '#1f2937', muted: '#6b7280' },
  spacing: { sm: '8px', md: '16px', lg: '24px' },
};

function ThemeProvider(theme) {
  return { theme };
}

const themeProvider = ThemeProvider(defaultTheme);

const ThemeButton = styled.button\`
  padding: \${props => props.theme.spacing.sm} \${props => props.theme.spacing.md};
  background: \${props => props.theme.colors.primary};
  color: white;
\`;

const themeBtn = ThemeButton({ theme: themeProvider.theme });
console.log('  带 theme 的按钮 CSS:');
themeBtn.css.split('\\n').forEach(line => { if (line.trim()) console.log('    ' + line.trim()); });

// 切换暗色主题
const darkTheme = {
  colors: { primary: '#1e40af', text: '#f3f4f6', muted: '#9ca3af' },
  spacing: defaultTheme.spacing,
};
const darkProvider = ThemeProvider(darkTheme);
const darkBtn = ThemeButton({ theme: darkProvider.theme });
console.log('  暗色主题按钮 background:', darkBtn.css.match(/background: ([^;]+)/)?.[1]);

// ---- 4. 嵌套和伪类 ----
console.log('\\n=== 4. 嵌套和伪类 ===');

const List = styled.ul\`
  list-style: none;
  padding: 0;
  li {
    padding: 8px 0;
    border-bottom: 1px solid #e5e7eb;
    &:last-child { border-bottom: none; }
    &:hover { background: #f9fafb; }
  }
\`;

const listInstance = List({});
console.log('  List className:', listInstance.className);
console.log('  CSS 包含 li 嵌套规则:', listInstance.css.includes('li {'));

// ---- 5. TS 类型扩展模拟 ----
console.log('\\n=== 5. 模拟 TS 类型扩展 StyledProps ===');

// 模拟 styled.button<Props> 泛型
function typedStyledButton(strings, ...interpolations) {
  const allowedProps = ['variant', 'size'];  // 编译时检查的字段
  return function (props) {
    // 运行时校验（模拟 TS 编译时检查）
    Object.keys(props).forEach(key => {
      if (key !== 'children' && key !== 'theme' && !allowedProps.includes(key)) {
        console.log('    [TS] 警告：未声明的 prop "' + key + '"');
      }
    });
    if (props.variant && !['primary', 'danger', 'ghost'].includes(props.variant)) {
      console.log('    [TS] 错误：variant 必须是 primary/danger/ghost');
    }
    return styled.button(strings, ...interpolations)(props);
  };
}

const TypedButton = typedStyledButton\`
  background: \${props => props.variant === 'primary' ? '#3b82f6' : '#e5e7eb'};
\`;

console.log('  调用 <TypedButton variant="primary" />');
TypedButton({ variant: 'primary' });
console.log('  调用 <TypedButton variant="invalid" />（应该 TS 报错）');
TypedButton({ variant: 'invalid' });

// ---- 6. Emotion css prop 模拟 ----
console.log('\\n=== 6. Emotion css prop 模拟 ===');

function css(strings, ...interpolations) {
  return function (props) {
    return strings.reduce((acc, str, i) => {
      if (i === 0) return str;
      const interp = interpolations[i - 1];
      let val = interp;
      if (typeof interp === 'function') val = interp(props);
      return acc + val + str;
    }, '');
  };
}

function EmotionButton({ primary, children }) {
  // css prop：每次 render 重新计算
  const styleObj = css\`
    padding: 8px 16px;
    border-radius: 4px;
    background: \${props => props.primary ? '#3b82f6' : '#e5e7eb'};
    color: \${props => props.primary ? 'white' : '#374151'};
  \`({ primary });

  return { tag: 'button', css: styleObj, children };
}

const e1 = EmotionButton({ primary: true, children: '主按钮' });
console.log('  Emotion Button CSS:');
e1.css.split('\\n').forEach(line => { if (line.trim()) console.log('    ' + line.trim()); });

// ---- 7. 性能对比 ----
console.log('\\n=== 7. 性能对比（CSS-in-JS vs Tailwind）===');

console.log('  CSS-in-JS 特点:');
console.log('    - 运行时生成 hash 类名');
console.log('    - 注入 <style> 标签');
console.log('    - props 变化重新计算 CSS');
console.log('    - 包体积较大（库本身 ~12KB）');
console.log('  Tailwind 特点:');
console.log('    - 编译期生成，运行时零开销');
console.log('    - 按需扫描源码生成 CSS');
console.log('    - 包体积 ~10-20KB（按需）');
console.log('    - 动态样式能力较弱');

// ---- 关键要点总结 ----
console.log('\\n=== CSS-in-JS 核心要点 ===');
console.log('1. 样式写在 JS 里，运行时生成 hash 类名注入 style');
console.log('2. 优势：作用域隔离、动态样式、样式跟组件走');
console.log('3. styled-components API 直观，emotion 更轻量');
console.log('4. styled.div 模板字符串，支持嵌套和伪类');
console.log('5. props 动态样式：\${(props) => ...} 是核心威力');
console.log('6. ThemeProvider 注入 theme，切主题换对象');
console.log('7. TS：styled.button<Props> 泛型 + 模块扩展 DefaultTheme');
console.log('8. Emotion css prop 更轻量，开发更灵活');
console.log('9. vs Tailwind：动态主题化用 CSS-in-JS，性能优先用 Tailwind');
`,
  },

  // =========================================================
  // 第六十五章：Framer Motion 动画
  // =========================================================
  {
    id: "tspro-framer-motion",
    group: "十、表单与样式与动画",
    icon: "🎬",
    title: "Framer Motion 动画",
    content: `# 第六十五章：Framer Motion 动画

## 65.1 为什么需要 Framer Motion

写动画传统方式：CSS transition / animation + JS 改 class。痛点：

- **状态管理难**：进场、退场、悬停、点击多个状态切换要管理一堆 class
- **退场动画难**：React 卸载组件瞬间消失，没机会播退场动画
- **手势/拖拽**：自己写 drag 要算位置、惯性、边界，超复杂
- **联动动画**：滚动驱动、布局动画几乎写不了

\`\`\`tsx
// 传统 CSS 动画：状态切换要手动管 class
function Modal({ open }) {
  return <div className={open ? 'modal show' : 'modal hide'}>...</div>;
}
// 关闭瞬间 hide 类还没播完，组件已经被父级移除
\`\`\`

Framer Motion（现叫 \`motion\`）是 React 动画库标杆：声明式 API + 自动管理进场退场 + 手势/滚动/布局动画开箱即用。

## 65.2 Framer Motion 是什么

Framer Motion 把动画"声明化"：用 \`animate\` prop 描述目标状态，库自己算插值、播动画。

\`\`\`tsx
import { motion } from 'framer-motion';

// 进场动画：透明度 0 → 1，向上滑入
function Box() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      淡入
    </motion.div>
  );
}
\`\`\`

- \`motion.div\` 是带动画能力的 div（替换原 \`<div>\`）
- \`initial\`：初始状态
- \`animate\`：目标状态
- \`transition\`：过渡参数（时长、缓动函数）

不用写 CSS keyframes，不用切 class，声明完库自动播放。

## 65.3 motion.div + animate 属性

\`motion.div\` 可以是任意 HTML 标签：\`motion.span\` / \`motion.button\` / \`motion.ul\` / \`motion.li\` 等。

\`\`\`tsx
// 悬停动画
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: 'spring', stiffness: 300 }}
>
  点击我
</motion.button>

// 状态切换
function Tab({ active }) {
  return (
    <motion.div
      animate={{
        backgroundColor: active ? '#3b82f6' : '#e5e7eb',
        color: active ? 'white' : '#374151',
      }}
    >
      {active ? '激活' : '未激活'}
    </motion.div>
  );
}
\`\`\`

可动画属性：

- \`opacity\`：透明度
- \`x\` / \`y\` / \`z\`：translate
- \`scale\`：缩放
- \`rotate\`：旋转
- \`backgroundColor\` / \`color\`：颜色
- \`width\` / \`height\`：尺寸
- \`borderRadius\`：圆角

## 65.4 variants：状态集合

多个元素同一套状态用 \`variants\` 复用：

\`\`\`tsx
const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

function Box() {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      内容
    </motion.div>
  );
}
\`\`\`

variants 的真正威力：**子组件自动继承父级状态**。

\`\`\`tsx
const list = {
  visible: { transition: { staggerChildren: 0.1 } },  // 子元素错开 0.1s 进场
};

const item = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

function List() {
  return (
    <motion.ul variants={list} initial="hidden" animate="visible">
      <motion.li variants={item}>条目 1</motion.li>
      <motion.li variants={item}>条目 2</motion.li>
      <motion.li variants={item}>条目 3</motion.li>
    </motion.ul>
  );
}
\`\`\`

父级 \`animate="visible"\` 自动传给所有子 \`motion.li\`，配合 \`staggerChildren\` 实现错峰进场。

## 65.5 transition：过渡参数

\`transition\` 控制动画"怎么变"：

\`\`\`tsx
// 1. tween：标准过渡
<motion.div animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: 'easeInOut' }} />

// 2. spring：弹簧物理
<motion.div animate={{ x: 100 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} />

// 3. inertia：惯性
<motion.div drag transition={{ type: 'inertia', velocity: 50 }} />
\`\`\`

关键参数：

- \`duration\`：时长（秒）
- \`delay\`：延迟
- \`ease\`：缓动函数（\`easeInOut\` / \`easeOut\` / \`easeIn\` / \`linear\` 或自定义贝塞尔）
- \`type: 'spring'\`：弹簧，配合 \`stiffness\`（硬度）/ \`damping\`（阻尼）
- \`repeat\`：\`Infinity\` / 数字 / \`'reverse'\`
- \`staggerChildren\`：子元素错峰延迟

弹簧物理比线性过渡更自然，是 Framer Motion 推荐默认。

## 65.6 AnimatePresence：退场动画

最常用的特性：让组件**卸载时也能播动画**。

\`\`\`tsx
import { AnimatePresence, motion } from 'framer-motion';

function Modal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <h2>Modal</h2>
          <button onClick={onClose}>关闭</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
\`\`\`

原理：\`AnimatePresence\` 检测子元素被移除时**保留它**直到 \`exit\` 动画播完才真卸载。这是 React 原生做不到的。

经典场景：

- Modal / Drawer 进出场
- Tab 切换
- 列表项增删（\`<motion.li>\` + \`layout\`）
- Toast 通知

## 65.7 滚动联动 useScroll

\`useScroll\` 让动画跟随滚动条进度：

\`\`\`tsx
import { motion, useScroll, useTransform } from 'framer-motion';

function ScrollBox() {
  const { scrollYProgress } = useScroll();  // 0 到 1
  const width = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

  return (
    <>
      <motion.div style={{ width, height: 4, background: 'blue' }} />
      <motion.div style={{ opacity }}>滚动到中间才显示</motion.div>
    </>
  );
}
\`\`\`

\`useScroll\` 返回 \`scrollYProgress\` 是 \`MotionValue\`，\`useTransform\` 把它映射成别的值（如颜色、宽度、透明度）。视差、进度条、滚动揭示都能做。

\`useScroll\` 还能监听特定元素：

\`\`\`tsx
const { scrollYProgress } = useScroll({
  target: ref,
  offset: ['start end', 'end start'],  // 元素从底部进顶部出
});
\`\`\`

## 65.8 拖拽 drag

\`drag\` 让元素可拖拽：

\`\`\`tsx
// 自由拖拽
<motion.div
  drag
  dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
  dragElastic={0.2}
  whileDrag={{ scale: 1.1 }}
>
  拖我
</motion.div>

// 单方向拖
<motion.div drag="x">只能左右拖</motion.div>

// 拖到指定容器内
<motion.div
  drag
  dragConstraints={containerRef}  // 限制在容器内
  onDragEnd={(e, info) => {
    console.log('拖到', info.point.x, info.point.y);
  }}
/>
\`\`\`

\`dragConstraints\` 限制范围，\`dragElastic\` 弹性（0 完全限制，1 完全弹性）。 \`onDragEnd\` / \`onDrag\` 拿到拖拽信息。

## 65.9 layout 动画：布局变化自动过渡

最神奇特性：加 \`layout\` prop，元素**位置或尺寸变化时自动播过渡动画**。

\`\`\`tsx
function List() {
  const [items, setItems] = useState([1, 2, 3]);
  return (
    <div>
      <button onClick={() => setItems(prev => [prev[prev.length - 1], ...prev.slice(0, -1)])}>
        移到最前
      </button>
      <ul>
        {items.map(i => (
          <motion.li key={i} layout>{i}</motion.li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`

列表顺序变了，Framer Motion 自动算位置差，平滑过渡——不用写任何插值。

更强大：\`<LayoutGroup>\` 让一组元素共享布局上下文，\`layoutId\` 让两个不同元素**共享身份**做"魔法移动"：

\`\`\`tsx
// 点缩略图后大图从缩略图位置飞过来
function Gallery() {
  const [selected, setSelected] = useState(null);
  return (
    <>
      <div className="grid">
        {items.map(item => (
          <motion.img
            layoutId="image"
            src={item.src}
            onClick={() => setSelected(item)}
          />
        ))}
      </div>
      <AnimatePresence>
        {selected && (
          <motion.img
            layoutId="image"
            src={selected.src}
            onClick={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
\`\`\`

相同 \`layoutId\` 的元素切换时自动从前者位置过渡到后者，是 Apple 风格切换动画的实现方式。

## 65.10 小结

- Framer Motion 是 React 动画库标杆，声明式 API
- \`motion.div\` + \`initial\` / \`animate\` / \`transition\` 描述动画
- \`variants\` 复用状态集合，子组件自动继承父级状态
- \`transition\` 控制 tween / spring / inertia 三种过渡
- \`AnimatePresence\` 让组件卸载时播退场动画（核心特性）
- \`useScroll\` + \`useTransform\` 滚动驱动动画
- \`drag\` 拖拽，\`dragConstraints\` 限制范围
- \`layout\` / \`layoutId\` 布局变化自动过渡，跨元素"魔法移动"
- 实际场景：Modal 进出场、列表错峰、滚动揭示、拖拽、共享元素切换
`,
    code: `// =============================================================
// 第 65 章 demo：Framer Motion 动画
// 模拟 motion.div / variants / AnimatePresence / useScroll 实现
// =============================================================

// ---- 模拟 Framer Motion 核心 ----
const motionElements = [];  // 已注册的 motion 元素
let frameCount = 0;         // 帧计数

// 模拟 requestAnimationFrame
function requestAnimationFrame(fn) {
  return setTimeout(() => fn(performance.now()), 16);  // 60fps
}

// 简单插值：从 from 到 to 按进度 t（0-1）算中间值
function interpolate(from, to, t) {
  if (typeof from === 'number' && typeof to === 'number') {
    return from + (to - from) * t;
  }
  return t > 0.5 ? to : from;  // 非数字（如颜色）简化处理
}

// 缓动函数
const easings = {
  easeInOut: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  easeOut: t => 1 - Math.pow(1 - t, 3),
  easeIn: t => t * t * t,
  linear: t => t,
};

// motion.div 构造器
function motion(tag) {
  return function MotionComponent(props) {
    const { initial, animate, exit, transition, variants, children } = props;
    const state = {
      tag,
      current: initial || animate || {},
      target: animate || {},
      transition: transition || { duration: 0.3, ease: 'easeInOut' },
      isAnimating: false,
      children,
    };

    function play(fromState, toState, onComplete) {
      const duration = state.transition.duration || 0.3;
      const ease = easings[state.transition.ease] || easings.easeInOut;
      const startTime = performance.now();
      state.isAnimating = true;

      function tick(now) {
        const elapsed = (now - startTime) / 1000;
        const t = Math.min(elapsed / duration, 1);
        const easedT = ease(t);

        // 插值每一帧
        const frameValues = {};
        Object.keys(toState).forEach(key => {
          if (fromState[key] !== undefined) {
            frameValues[key] = interpolate(fromState[key], toState[key], easedT);
          }
        });
        state.current = { ...state.current, ...frameValues };

        frameCount++;
        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          state.isAnimating = false;
          if (onComplete) onComplete();
        }
      }
      requestAnimationFrame(tick);
    }

    // 进场：initial → animate
    if (initial && animate) {
      play(initial, animate);
    }

    return { tag, state, play, props };
  };
}

motion.div = motion('div');
motion.span = motion('span');
motion.li = motion('li');

// ---- 1. 基本 motion.div 进场动画 ----
console.log('=== 1. motion.div 进场动画 ===');

const box = motion.div({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' },
});

console.log('  初始状态:', box.state.current);
setTimeout(() => {
  console.log('  动画完成后状态:', box.state.current);
}, 600);

// ---- 2. variants 状态集合 ----
console.log('\\n=== 2. variants 状态集合 ===');

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
};

const card = motion.div({
  variants: cardVariants,
  initial: 'hidden',
  animate: 'visible',
});

// variants 模拟：根据字符串找对应状态
function resolveVariant(variants, name) {
  return variants[name];
}

console.log('  initial="hidden":', resolveVariant(cardVariants, 'hidden'));
console.log('  animate="visible":', resolveVariant(cardVariants, 'visible'));
console.log('  exit="exit":', resolveVariant(cardVariants, 'exit'));

// ---- 3. staggerChildren 错峰 ----
console.log('\\n=== 3. staggerChildren 错峰进场 ===');

const listVariants = {
  visible: { transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

// 模拟 3 个子元素错峰
const items = [1, 2, 3];
console.log('  父级 visible 触发：');
items.forEach((i, idx) => {
  const delay = idx * 0.1;  // stagger
  setTimeout(() => {
    const item = motion.li({
      variants: itemVariants,
      initial: 'hidden',
      animate: 'visible',
      transition: { duration: 0.3, delay },
    });
    console.log('    item ' + i + ' 进场，delay=' + delay.toFixed(1) + 's');
  }, idx * 100);
});

// ---- 4. AnimatePresence 退场动画 ----
console.log('\\n=== 4. AnimatePresence 退场动画 ===');

function AnimatePresence({ children, onExitComplete }) {
  // 检测 children 移除时，先播 exit 再卸载
  return { type: 'AnimatePresence', children, onExitComplete };
}

function Modal({ open, onClose }) {
  console.log('  Modal open=' + open);
  if (!open) {
    console.log('    open=false: AnimatePresence 检测到移除，播 exit 动画');
    return AnimatePresence({ children: null });
  }
  console.log('    open=true: 渲染 modal，播 initial → animate');
  return AnimatePresence({
    children: motion.div({
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
    }),
  });
}

// 模拟 open → close 切换
Modal({ open: true });
setTimeout(() => {
  Modal({ open: false });  // 触发 exit
  console.log('    （动画播完后才真卸载）');
}, 200);

// ---- 5. useScroll 滚动联动 ----
console.log('\\n=== 5. useScroll 滚动联动 ===');

function useScroll(options = {}) {
  return {
    scrollYProgress: {  // 0 到 1 的 MotionValue
      current: 0,
      get: function () { return this.current; },
      set: function (v) { this.current = v; },
      on: function (event, fn) { this._callback = fn; },
    },
  };
}

function useTransform(value, inputRange, outputRange) {
  return {
    get: function () {
      const v = value.get();
      // 线性映射 inputRange → outputRange
      const t = (v - inputRange[0]) / (inputRange[1] - inputRange[0]);
      const start = outputRange[0];
      const end = outputRange[1];
      if (typeof start === 'string' && typeof end === 'string') {
        // '0%' → '100%'
        const s = parseFloat(start);
        const e = parseFloat(end);
        return (s + (e - s) * t) + '%';
      }
      return start + (end - start) * t;
    },
  };
}

const { scrollYProgress } = useScroll();
const widthMotion = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
const opacityMotion = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

console.log('  滚动 0%: width=' + widthMotion.get() + ', opacity=' + opacityMotion.get());
scrollYProgress.set(0.5);
console.log('  滚动 50%: width=' + widthMotion.get() + ', opacity=' + opacityMotion.get());
scrollYProgress.set(1);
console.log('  滚动 100%: width=' + widthMotion.get() + ', opacity=' + opacityMotion.get());

// ---- 6. drag 拖拽 ----
console.log('\\n=== 6. drag 拖拽 ===');

function draggable(config) {
  const { dragConstraints, dragElastic = 0.2 } = config;
  let pos = { x: 0, y: 0 };

  return {
    onPointerMove: (dx, dy) => {
      let newX = pos.x + dx;
      let newY = pos.y + dy;
      // 限制范围
      if (dragConstraints) {
        newX = Math.max(dragConstraints.left || -Infinity, Math.min(dragConstraints.right || Infinity, newX));
        newY = Math.max(dragConstraints.top || -Infinity, Math.min(dragConstraints.bottom || Infinity, newY));
      }
      pos = { x: newX, y: newY };
      return pos;
    },
    getPosition: () => pos,
  };
}

const dragBox = draggable({
  dragConstraints: { left: -100, right: 100, top: -100, bottom: 100 },
});

console.log('  初始位置:', dragBox.getPosition());
console.log('  拖 +150,+150:', dragBox.onPointerMove(150, 150), '（被限制到 100）');
console.log('  拖 -200,-200:', dragBox.onPointerMove(-200, -200), '（被限制到 -100）');

// ---- 7. layout 动画 ----
console.log('\\n=== 7. layout 布局变化自动过渡 ===');

function layoutAnimate(from, to) {
  console.log('  检测到布局变化:');
  console.log('    旧位置:', from);
  console.log('    新位置:', to);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  console.log('    位移 dx=' + dx + ', dy=' + dy + '，自动播过渡');
}

layoutAnimate({ x: 100, y: 50 }, { x: 300, y: 50 });
console.log('  （不用写插值，加 layout prop 自动算）');

// ---- 8. layoutId 共享元素 ----
console.log('\\n=== 8. layoutId 共享元素（魔法移动）===');

function SharedElement({ layoutId, src }) {
  return { layoutId, src };
}

const thumb = SharedElement({ layoutId: 'image', src: 'thumb.jpg' });
const big = SharedElement({ layoutId: 'image', src: 'big.jpg' });

console.log('  缩略图和大图 layoutId 都是 "image":');
console.log('    缩略图:', thumb);
console.log('    大图:', big);
console.log('  → 切换时自动从前者位置飞到后者位置');

// ---- 9. transition 类型对比 ----
console.log('\\n=== 9. transition 类型 ===');

function playTransition(type, options) {
  const steps = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    let easedT = t;
    if (type === 'tween') easedT = easings[options.ease || 'easeInOut'](t);
    else if (type === 'spring') {
      // 简化弹簧：去振一段
      const stiffness = options.stiffness || 300;
      const damping = options.damping || 20;
      easedT = 1 - Math.exp(-damping * t) * Math.cos(stiffness * t * 0.1);
    }
    else if (type === 'inertia') easedT = t * (options.velocity || 1);
    steps.push(easedT.toFixed(2));
  }
  return steps.join(' → ');
}

console.log('  tween (easeInOut, 0.5s):', playTransition('tween', { ease: 'easeInOut' }));
console.log('  spring (stiffness=300):', playTransition('spring', { stiffness: 300, damping: 20 }));
console.log('  inertia (velocity=2):', playTransition('inertia', { velocity: 2 }));

// ---- 关键要点总结 ----
setTimeout(() => {
  console.log('\\n=== Framer Motion 核心要点 ===');
  console.log('1. motion.div + initial/animate/transition 声明动画');
  console.log('2. variants 状态集合，子组件自动继承父级');
  console.log('3. staggerChildren 子元素错峰进场');
  console.log('4. AnimatePresence 让卸载时播 exit 动画（核心）');
  console.log('5. useScroll + useTransform 滚动驱动动画');
  console.log('6. drag + dragConstraints 拖拽');
  console.log('7. layout prop 布局变化自动过渡');
  console.log('8. layoutId 跨元素共享身份做"魔法移动"');
  console.log('9. transition: tween / spring / inertia 三种过渡');
}, 700);
`,
  },
];
