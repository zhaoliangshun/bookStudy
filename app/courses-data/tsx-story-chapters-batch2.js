// =============================================================
// TSX 童话镇 - 第 2 批：事件 + 状态 hooks
// -------------------------------------------------------------
// 第 2 章：电报员小屋（事件处理）
// 第 3 章：镇长的记事本（useState）
// 第 4 章：宝库管理员（useRef）
// =============================================================

export const chapters = [
  // ===========================================================
  // 第 2 章：电报员小屋
  // ===========================================================
  {
    id: "tsx-story-events",
    group: "居民篇：六位老朋友",
    icon: "📬",
    title: "电报员小屋（事件处理）",
    content: `# 📬 第 2 章：电报员小屋

> *童话镇有一位看不见的电报员，他住在每栋房子里。每当有人敲门、按键、悬停，他就会发一封"电报"告诉你发生了什么。这位电报员就叫做 **event**。*

---

## 📨 故事开场

TSX 童话镇上，用户的每一个动作（点击、输入、滚动……）都会触发一封"魔法电报"。React 把电报包装成一个**对象**，通过回调函数送给你。

\`\`\`tsx
function Button() {
  // 📬 收到电报时调用这个函数
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log("电报说：有人按下了按钮！", event.currentTarget.textContent);
  };

  return <button onClick={handleClick}>点我</button>;
}
\`\`\`

**小镇比喻**：\`event\` 对象就像一封信——信封上有"谁发的"、"什么时候发的"、"按了哪个键"等信息。

---

## 🎯 5 种常见电报

### 1️⃣ 鼠标电报 (\`MouseEvent\`)

\`\`\`tsx
function MouseDemo() {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("按下位置：", e.clientX, e.clientY);
    console.log("按的是：", e.currentTarget.textContent);
  };

  return <button onClick={handleClick}>点我记录位置</button>;
}
\`\`\`

**电报内容**：
- \`e.clientX\` / \`e.clientY\`：按下时鼠标的坐标
- \`e.currentTarget\`：触发事件的元素
- \`e.button\`：按了哪个键（0=左，2=右）

### 2️⃣ 输入框电报 (\`ChangeEvent\`)

\`\`\`tsx
function InputDemo() {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("用户输入了：", e.target.value);
  };

  return <input onChange={handleChange} placeholder="试着输入..." />;
}
\`\`\`

**电报内容**：
- \`e.target.value\`：输入框当前内容
- \`e.target.name\`：输入框的 name 属性
- \`e.target.checked\`：checkbox 是否勾选

### 3️⃣ 键盘电报 (\`KeyboardEvent\`)

\`\`\`tsx
function KeyboardDemo() {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      console.log("用户按下了回车！");
    }
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();    // 阻止浏览器默认行为（保存网页）
      console.log("自定义保存！");
    }
  };

  return <input onKeyDown={handleKeyDown} />;
}
\`\`\`

**电报内容**：
- \`e.key\`：按下的键名（"Enter"、"a"、"ArrowUp"）
- \`e.ctrlKey\` / \`e.shiftKey\` / \`e.altKey\`：是否同时按了修饰键
- \`e.preventDefault()\`：阻止浏览器默认行为

### 4️⃣ 表单电报 (\`FormEvent\`)

\`\`\`tsx
function FormDemo() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();   // 阻止表单提交导致页面刷新
    console.log("表单提交了！");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" />
      <button type="submit">提交</button>
    </form>
  );
}
\`\`\`

### 5️⃣ 焦点电报 (\`FocusEvent\`)

\`\`\`tsx
function FocusDemo() {
  return (
    <input
      onFocus={(e) => console.log("聚焦了！")}
      onBlur={(e) => console.log("失焦了！")}
    />
  );
}
\`\`\`

---

## 🧙 高级魔法：泛型参数

\`\`\`tsx
// 📨 React.MouseEvent<HTMLButtonElement>
//    ↑                ↑
//    类型             触发事件的元素类型
\`\`\`

泛型参数告诉 TypeScript："这个事件来自哪个元素"。这样你写 \`e.currentTarget\` 时，TypeScript 知道它是 \`HTMLButtonElement\`，有 \`disabled\`、\`textContent\` 等属性。

\`\`\`tsx
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.disabled = true;   // ✅ TS 知道这是 button，能用 disabled
};

const handleDivClick = (e: React.MouseEvent<HTMLDivElement>) => {
  e.currentTarget.disabled;   // ❌ div 没有 disabled 属性
};
\`\`\`

---

## 🎯 事件类型速查表

| 事件 | 类型 | 触发时机 |
|------|------|---------|
| \`onClick\` | \`MouseEvent<HTMLButtonElement>\` | 鼠标点击 |
| \`onChange\` | \`ChangeEvent<HTMLInputElement>\` | 输入框内容改变 |
| \`onKeyDown\` | \`KeyboardEvent<HTMLInputElement>\` | 按下键盘 |
| \`onSubmit\` | \`FormEvent<HTMLFormElement>\` | 提交表单 |
| \`onFocus\` / \`onBlur\` | \`FocusEvent<HTMLInputElement>\` | 聚焦/失焦 |
| \`onMouseEnter\` | \`MouseEvent<HTMLDivElement>\` | 鼠标进入 |
| \`onScroll\` | \`UIEvent<HTMLDivElement>\` | 滚动 |

---

## 🛠 实用模式

### 模式 1：阻止默认行为

\`\`\`tsx
// 🚫 阻止 a 标签跳转
<a href="https://example.com" onClick={(e) => e.preventDefault()}>
  点击不会跳转
</a>
\`\`\`

### 模式 2：阻止冒泡

\`\`\`tsx
// 🚫 父元素也有 onClick，子元素想阻止触发父级
function Child() {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();   // 不让事件冒泡到父级
    console.log("只触发了我！");
  };
  return <button onClick={handleClick}>点我</button>;
}
\`\`\`

### 模式 3：取表单数据

\`\`\`tsx
function LoginForm() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    console.log("提交的数据：", data);  // { username: "xxx", password: "yyy" }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" placeholder="用户名" />
      <input name="password" type="password" placeholder="密码" />
      <button type="submit">登录</button>
    </form>
  );
}
\`\`\`

### 模式 4：自定义事件 prop 类型

\`\`\`tsx
// 🎁 给组件定义自己的事件 prop
type ButtonProps = {
  label: string;
  onClick?: (id: number) => void;  // 自定义：只传一个 id，不传 event
};

function Button({ label, onClick }: ButtonProps) {
  return (
    <button onClick={() => onClick?.(Date.now())}>
      {label}
    </button>
  );
}

// 用法：<Button label="保存" onClick={(id) => console.log("保存时间", id)} />
\`\`\`

---

## 🎬 小剧场：电报员的一天

> *清晨 8 点，Button 先生的电报员收到第一封电报："有人按下了我"——原来是镇长来查岗。*
> *9 点，Input 女士的电报员收到电报："用户输入了'你好'"——电报员记录下来。*
> *10 点，Form 大叔的电报员收到电报："有人提交了表单"——大叔赶紧阻止页面刷新，把数据送走。*

---

## 📝 第 2 章小结

- 📨 每个事件都是一个 \`event\` 对象，由 React 包装好送给你
- 5 种常见事件：\`MouseEvent\` / \`ChangeEvent\` / \`KeyboardEvent\` / \`FormEvent\` / \`FocusEvent\`
- 泛型参数告诉 TS 事件来自哪个 HTML 元素
- \`e.preventDefault()\` 阻止默认行为
- \`e.stopPropagation()\` 阻止冒泡
- 组件可以定义自己的事件 prop（不必传整个 event）

> *下一章，去拜访镇长——useState！*`,

    code: `// 📬 TSX 童话镇 - 第 2 章 Demo：5 种电报

// 模拟 React 事件对象
type MockMouseEvent = {
  clientX: number;
  clientY: number;
  button: number;
  currentTarget: { textContent: string; disabled: boolean };
  preventDefault: () => void;
  stopPropagation: () => void;
};

type MockChangeEvent = {
  target: { value: string; name: string; checked: boolean };
};

type MockKeyboardEvent = {
  key: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  preventDefault: () => void;
};

type MockFormEvent = {
  preventDefault: () => void;
  currentTarget: HTMLFormElement;
};

// ============================================================
// 📨 1️⃣ 鼠标电报
// ============================================================
function handleMouseClick(e: MockMouseEvent) {
  console.log(\`[MouseEvent] 位置: (\${e.clientX}, \${e.clientY}), 按了按键: \${e.button}\`);
  console.log(\`  currentTarget 内容: "\${e.currentTarget.textContent}"\`);
}

console.log("=== 📨 1️⃣ 鼠标电报 ===");
handleMouseClick({ clientX: 100, clientY: 200, button: 0, currentTarget: { textContent: "点我", disabled: false }, preventDefault: () => {}, stopPropagation: () => {} });
console.log();

// ============================================================
// 📨 2️⃣ 输入框电报
// ============================================================
function handleInputChange(e: MockChangeEvent) {
  console.log(\`[ChangeEvent] name=\${e.target.name} value="\${e.target.value}"\`);
}

console.log("=== 📨 2️⃣ 输入框电报 ===");
handleInputChange({ target: { name: "username", value: "张三", checked: false } });
console.log();

// ============================================================
// 📨 3️⃣ 键盘电报
// ============================================================
function handleKeyDown(e: MockKeyboardEvent) {
  const modifiers = [];
  if (e.ctrlKey) modifiers.push("Ctrl");
  if (e.shiftKey) modifiers.push("Shift");
  if (e.altKey) modifiers.push("Alt");
  const modStr = modifiers.length > 0 ? \`[\${modifiers.join("+")}+]\` : "";
  console.log(\`[KeyboardEvent] 按下了: \${modStr}\${e.key}\`);
  if (e.ctrlKey && e.key === "s") {
    e.preventDefault();
    console.log("  ✅ 已阻止浏览器默认保存！");
  }
}

console.log("=== 📨 3️⃣ 键盘电报 ===");
handleKeyDown({ key: "Enter", ctrlKey: false, shiftKey: false, altKey: false, preventDefault: () => {} });
handleKeyDown({ key: "s", ctrlKey: true, shiftKey: false, altKey: false, preventDefault: () => {} });
handleKeyDown({ key: "k", ctrlKey: true, shiftKey: false, altKey: false, preventDefault: () => {} });
console.log();

// ============================================================
// 📨 4️⃣ 表单电报
// ============================================================
function handleFormSubmit(e: MockFormEvent) {
  e.preventDefault();
  console.log("[FormEvent] 表单提交了，已阻止页面刷新");
}

console.log("=== 📨 4️⃣ 表单电报 ===");
handleFormSubmit({ preventDefault: () => console.log("  (preventDefault 被调用)"), currentTarget: {} as HTMLFormElement });
console.log();

// ============================================================
// 📨 5️⃣ 综合演示：自定义事件 prop
// ============================================================
type CustomButtonProps = {
  label: string;
  onClick?: (id: number) => void;
};

function callButton(props: CustomButtonProps, simulatedEvent: MockMouseEvent) {
  console.log(\`按钮 "\${props.label}" 被点击\`);
  // 组件自己处理 event，调用方只关心业务数据（id）
  props.onClick?.(Date.now());
}

console.log("=== 📨 5️⃣ 自定义事件 prop（推荐）===");
callButton(
  { label: "保存", onClick: (id) => console.log(\`  业务回调收到 id: \${id}\`) },
  { clientX: 50, clientY: 30, button: 0, currentTarget: { textContent: "保存", disabled: false }, preventDefault: () => {}, stopPropagation: () => {} }
);
console.log();

console.log("=== 📝 小结 ===");
console.log("📬 5 种事件类型：MouseEvent / ChangeEvent / KeyboardEvent / FormEvent / FocusEvent");
console.log("🎁 组件可以自定义事件 prop，只传业务数据，不传整个 event")`,
  },
];
