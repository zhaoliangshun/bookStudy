// =============================================================
// TSX 教程 - 第二批章节（第五部分 事件与受控组件，共 5 章）
// -------------------------------------------------------------
// 覆盖：事件处理基础 / 表单元素与受控组件 / 非受控组件 / 事件传参 / 键盘鼠标事件
// 每章包含详细讲解 + 多个代码示例 + 可运行 demo
// =============================================================

const chapters = [
  // ===========================================================
  // 第 21 章：事件处理基础
  // ===========================================================
  {
    id: "tsx2-ch21",
    group: "第五部分 事件与受控组件",
    icon: "🖱️",
    title: "第二十一章 事件处理基础",
    content: `# 事件处理基础

事件是 React 与用户交互的核心机制——点击、输入、提交、键盘、鼠标，每个动作都对应一个事件。本章系统讲解 React 事件对象、合成事件、常见事件类型与控制事件行为的两个关键方法。

---

## 一、为什么 React 事件叫"合成事件"？

React 并不会直接把原生的 DOM 事件（如 \`click\`）绑定到元素上，而是**在最外层容器（17 之后是 root 节点，17 之前是 document）统一绑定**。当事件冒泡到根节点时，React 拦截并包装成 **SyntheticEvent** 派发给真正的回调。

**这样做的好处**：

| 优点 | 说明 |
| --- | --- |
| 跨浏览器一致 | 不同浏览器原生事件有差异（如 \`event.target\` vs \`event.srcElement\`），合成事件统一了 API |
| 性能优化 | 事件委托到根节点，避免给每个 DOM 元素单独绑定监听器 |
| 自动回收 | React 17 之前事件对象会被复用，访问后会被清空；17+ 改为原生事件机制 |

\`\`\`tsx
// 简洁的点击事件——onClick 是驼峰式，接收一个函数
function ClickDemo() {
  // 处理函数：名字通常以 handle 开头
  const handleClick = () => {
    // 为什么能直接 console.log？因为合成事件冒泡到根节点时
    // React 会调度一个微任务触发状态更新
    console.log("按钮被点击了");
  };

  return <button onClick={handleClick}>点击我</button>;
}
\`\`\`

> 💡 **小贴士**：React 事件命名用 camelCase（\`onClick\`、\`onChange\`），而原生 HTML 是小写（\`onclick\`、\`onchange\`），这是初学者最常犯的拼写错误。

---

## 二、React 事件对象类型全解

TypeScript 下必须为事件处理函数标注正确的类型，否则会丢失所有类型推断。React 在 \`@types/react\` 中提供了一整套类型，对应不同 DOM 事件：

| 事件类型 | 适用场景 | 关键属性 |
| --- | --- | --- |
| \`React.MouseEvent\` | 点击、移动、悬停 | \`clientX\`、\`clientY\`、\`button\` |
| \`React.ChangeEvent\` | input / textarea / select 内容变化 | \`target.value\`、\`target.checked\` |
| \`React.FormEvent\` | 表单提交 | \`preventDefault()\`、\`currentTarget\` |
| \`React.KeyboardEvent\` | 键盘按键 | \`key\`、\`code\`、\`keyCode\`（不推荐） |
| \`React.FocusEvent\` | 聚焦 / 失焦 | \`relatedTarget\`、\`currentTarget\` |
| \`React.UIEvent\` | 滚动、缩放等 UI 事件 | \`detail\` |
| \`React.WheelEvent\` | 滚轮 | \`deltaY\`、\`deltaMode\` |
| \`React.ClipboardEvent\` | 复制 / 剪切 / 粘贴 | \`clipboardData\` |
| \`React.DragEvent\` | 拖拽 | \`dataTransfer\` |

\`\`\`tsx
// 完整类型标注——给事件处理函数加类型
import React from "react";

// 1. 鼠标事件：点击拿到坐标
function MouseDemo() {
  // 为什么用 React.MouseEvent<HTMLButtonElement>？
  // 泛型第一个参数是元素类型，让 event.currentTarget 自动推断为 HTMLButtonElement
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // clientX/Y 是相对于视口的坐标；pageX/Y 是相对于整个文档
    console.log(\`点击位置：(\${e.clientX}, \${e.clientY})\`);
    // currentTarget：绑定事件的元素，TS 能正确推断为 HTMLButtonElement
    console.log(\`按钮文本：\${e.currentTarget.textContent}\`);
  };

  return <button onClick={handleClick}>点我</button>;
}

// 2. 表单事件：提交时阻止默认行为
function FormDemo() {
  // React.FormEvent<HTMLFormElement>——对应 <form> 元素
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // preventDefault 阻止表单的默认提交（页面跳转）
    // 如果不写，提交后浏览器会刷新页面，丢失所有 React 状态
    e.preventDefault();
    console.log("表单被提交了，但不会刷新页面");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" />
      <button type="submit">提交</button>
    </form>
  );
}

// 3. 改变事件：input 内容变化
function InputDemo() {
  // React.ChangeEvent<HTMLInputElement>——e.target 自动是 HTMLInputElement
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // e.target.value 就是输入框当前的字符串
    // 注意：每次按键都会触发，所以不要在这里做昂贵计算
    console.log(\`输入内容：\${e.target.value}\`);
  };

  return <input onChange={handleChange} placeholder="输入文字" />;
}
\`\`\`

> 💡 **小贴士**：泛型参数是元素类型。\`React.MouseEvent<HTMLDivElement>\` 表示事件源是 \`<div>\`，这样 \`event.currentTarget\` 自动推断为 \`HTMLDivElement\`，可以直接访问该元素特有的属性。

---

## 三、preventDefault 与 stopPropagation

这两个方法是控制事件行为的关键，初学者最容易混淆：

### preventDefault：阻止**默认行为**

\`\`\`tsx
function PreventDefaultDemo() {
  // 场景 1：阻止链接跳转
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // 不阻止 → 点击会跳转到 href 指向的 URL
    e.preventDefault();
    console.log("链接被点击，但被阻止跳转");
  };

  // 场景 2：阻止表单提交后的页面刷新
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // 表单默认行为：把表单数据拼到 URL，刷新页面跳到 action
    // React 应用中 99% 的场景都需要阻止
    e.preventDefault();
    // 接下来自己 fetch 提交数据
  };

  // 场景 3：阻止右键菜单（自定义上下文菜单）
  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    // 默认行为：弹出浏览器右键菜单
    e.preventDefault();
    console.log("弹出自定义菜单");
  };

  return (
    <div onContextMenu={handleContextMenu}>
      <a href="https://example.com" onClick={handleLinkClick}>
        不会跳转的链接
      </a>
    </div>
  );
}
\`\`\`

### stopPropagation：阻止**事件冒泡**

\`\`\`tsx
function StopPropagationDemo() {
  // 外层点击：弹"外层"
  const handleOuterClick = () => {
    console.log("外层被点击");
  };

  // 内层点击：弹"内层"，但调用 stopPropagation 后外层不会触发
  const handleInnerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 阻止事件继续向上冒泡到外层
    e.stopPropagation();
    console.log("内层被点击（外层不会触发）");
  };

  return (
    // 点击内部时，如果不阻止，默认会先触发 inner 再触发 outer
    <div onClick={handleOuterClick} style={{ padding: 20, background: "#eee" }}>
      <div onClick={handleInnerClick} style={{ padding: 20, background: "#fff" }}>
        点击我
      </div>
    </div>
  );
}
\`\`\`

### 两者对比

| 方法 | 阻止什么 | 典型场景 |
| --- | --- | --- |
| \`preventDefault()\` | 元素的**默认行为** | 表单提交不刷新、链接不跳转、右键菜单 |
| \`stopPropagation()\` | 事件**继续传播** | 嵌套点击只触发内层、模态框点击不冒泡 |
| \`stopImmediatePropagation()\` | 同上 + 阻止同元素的其他监听器 | 几乎用不到，仅在极端场景 |

> ⚠️ **警告**：滥用 \`stopPropagation\` 会让代码难以调试。优先考虑用 \`e.target\` 与 \`e.currentTarget\` 判断事件源，而不是直接阻断冒泡。

---

## 四、可运行 Demo：完整事件系统演示

下面是一个完整的事件演示组件，整合本章所有知识点。复制到 React 项目中即可运行：

\`\`\`tsx
// 完整 Demo：事件类型 + preventDefault + stopPropagation
import React, { useState } from "react";

// ---------- 1. 类型化的事件处理器 ----------
type LogEntry = {
  id: number;
  message: string;
  time: string;
};

function EventShowcase() {
  // 日志列表——展示哪些事件被触发了
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [inputValue, setInputValue] = useState("");

  // 通用工具：在日志列表头部插入一条记录
  // 为什么用函数式更新 setLogs(prev => [newLog, ...prev])？
  // 因为 onChange/onClick 短时间内可能连续触发，
  // 函数式更新保证基于最新 state 计算，避免覆盖。
  const addLog = (message: string) => {
    setLogs((prev) => [
      {
        id: Date.now() + Math.random(),
        message,
        time: new Date().toLocaleTimeString(),
      },
      ...prev.slice(0, 9), // 最多保留 10 条
    ]);
  };

  // ---------- 2. 鼠标事件：捕获点击坐标 ----------
  // React.MouseEvent<HTMLDivElement>——泛型让 e.currentTarget 自动推断
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // pageX/Y 包含滚动距离；clientX/Y 只看视口
    setPosition({ x: e.clientX, y: e.clientY });
  };

  // ---------- 3. 表单提交：阻止默认刷新 ----------
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // 关键：阻止默认行为，否则页面会刷新，React 状态全丢
    e.preventDefault();
    addLog(\`表单提交: "\${inputValue}"\`);
    setInputValue(""); // 清空输入
  };

  // ---------- 4. 阻止冒泡：内层按钮不触发外层 ----------
  const handleOuterClick = () => {
    addLog("外层 div 被点击");
  };

  const handleInnerClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // 阻止冒泡——外层 div 的 onClick 不会被触发
    e.stopPropagation();
    addLog("内层按钮被点击（已阻止冒泡）");
  };

  // ---------- 5. 阻止右键默认菜单 ----------
  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    addLog(\`自定义右键菜单: (\${e.clientX}, \${e.clientY})\`);
  };

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <h2>事件处理 Demo</h2>

      {/* 鼠标移动区域 */}
      <div
        onMouseMove={handleMouseMove}
        style={{
          height: 80,
          background: "#f0f0f0",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {position ? \`鼠标位置: (\${position.x}, \${position.y})\` : "在此区域移动鼠标"}
      </div>

      {/* 表单提交 */}
      <form onSubmit={handleFormSubmit} style={{ marginBottom: 12 }}>
        <input
          // onChange 每次按键都触发——这是受控组件
          onChange={(e) => setInputValue(e.target.value)}
          value={inputValue}
          placeholder="输入文字后回车提交"
        />
        <button type="submit">提交</button>
      </form>

      {/* 事件冒泡演示 */}
      <div
        onClick={handleOuterClick}
        onContextMenu={handleContextMenu}
        style={{
          padding: 16,
          background: "#e3f2fd",
          marginBottom: 12,
        }}
      >
        外层区域（点空白处触发；右键触发自定义菜单）
        <div style={{ marginTop: 8 }}>
          <button onClick={handleInnerClick}>内层按钮（不触发外层）</button>
        </div>
      </div>

      {/* 日志展示 */}
      <h3>事件日志</h3>
      {logs.length === 0 ? (
        <p style={{ color: "#999" }}>暂无事件</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {logs.map((log) => (
            <li key={log.id} style={{ padding: 4, borderBottom: "1px solid #eee" }}>
              <span style={{ color: "#999", marginRight: 8 }}>{log.time}</span>
              {log.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default EventShowcase;
\`\`\`

**代码要点回顾**：

1. **类型标注**——\`React.MouseEvent<HTMLDivElement>\`、\`React.FormEvent<HTMLFormElement>\` 等
2. **preventDefault**——表单提交、链接跳转必须调用
3. **stopPropagation**——只阻断冒泡，不影响其他监听器
4. **函数式更新**——\`setLogs(prev => ...)\` 保证连续触发时不丢更新

---

## 五、常见坑点

### 1. 直接传字符串（不存在的回调）

\`\`\`tsx
// ❌ 错——React 不支持字符串形式的处理器（区别于原生 HTML）
<button onClick="handleClick()">点击</button>

// ✅ 正确——传函数引用
<button onClick={handleClick}>点击</button>
\`\`\`

### 2. 错误的事件名大小写

\`\`\`tsx
// ❌ 错——React 要求驼峰式
<button onclick={handleClick}>点击</button>
<button onchange={handleChange}>输入</button>

// ✅ 正确
<button onClick={handleClick}>点击</button>
<button onChange={handleChange}>输入</button>
\`\`\`

### 3. 事件处理器返回 false 不会阻止默认行为

\`\`\`tsx
// ❌ 错——React 不会像原生 HTML 那样处理 return false
<a href="/" onClick={() => false}>链接</a>

// ✅ 正确
<a href="/" onClick={(e) => e.preventDefault()}>链接</a>
\`\`\`

### 4. 给元素绑定不存在的 prop

\`\`\`tsx
// ❌ 错——没有 onInputChange 这个 prop
<input onInputChange={handleChange} />

// ✅ 正确——应该用 onChange
<input onChange={handleChange} />
\`\`\`

---

## 小结

本章核心知识点：

1. **合成事件**：React 17+ 把事件统一委托到 root 节点，性能更好、跨浏览器一致
2. **事件类型**：\`React.MouseEvent\`、\`React.ChangeEvent\`、\`React.FormEvent\` 等，泛型参数是元素类型
3. **preventDefault**：阻止默认行为（表单提交、链接跳转、右键菜单）
4. **stopPropagation**：阻止事件冒泡，谨慎使用
5. **驼峰命名**：React 事件一律驼峰（\`onClick\`、\`onChange\`），与原生 HTML 的小写（\`onclick\`）区分
6. **TS 类型标注**：TypeScript 环境下必须给处理器正确标注类型，否则 \`e.target\` 等属性无法访问

下一章将基于这些事件基础，讲解**表单元素与受控组件**，这是 React 中最常用的交互模式。`,
  },
  // ===========================================================
  // 第 22 章：表单元素与受控组件
  // ===========================================================
  {
    id: "tsx2-ch22",
    group: "第五部分 事件与受控组件",
    icon: "📝",
    title: "第二十二章 表单元素与受控组件",
    content: `# 表单元素与受控组件

React 中处理表单有两种方式：**受控组件**（由 React state 驱动）和**非受控组件**（由 DOM 自己维护）。本章聚焦受控组件——绝大多数业务场景的首选。

---

## 一、什么是受控组件？

**受控组件**的核心思想：把表单元素的值交给 React state 管理，每次输入都更新 state，state 变化再驱动 UI 更新。

\`\`\`tsx
// 最简单的受控 input
function ControlledInput() {
  // 1. 用 state 保存输入框的值
  const [value, setValue] = useState("");

  // 2. onChange 中更新 state——输入框的值完全由 value 决定
  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="受控输入框"
    />
  );
}
\`\`\`

**为什么叫"受控"？**
- value 由 React state 控制 → React 是"单一数据源"
- 用户输入 → onChange 触发 → setState → 重新渲染 → input 显示新值
- 整个流程完全可预测、可调试

> 💡 **对比原生 HTML**：原生 input 自己维护 value（保存在 DOM 中），React 拿不到中间值。受控组件把数据"提升"到 React 层，状态变化可以触发其他逻辑（校验、联动、提交等）。

---

## 二、各种表单元素的受控写法

### 1. input（text / number / password）

\`\`\`tsx
function TextInputs() {
  const [name, setName] = useState("");
  const [age, setAge] = useState(0);
  const [password, setPassword] = useState("");

  return (
    <>
      {/* 文本：e.target.value 永远是 string */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* 数字：手动转 number，否则存的是字符串 */}
      <input
        type="number"
        value={age}
        // 为什么要 Number(...)？
        // 因为 input type="number" 的 value 仍然是字符串，
        // 手动转换后 state 才是真正的 number
        onChange={(e) => setAge(Number(e.target.value) || 0)}
      />

      {/* 密码：和文本一样，只是 type 不同 */}
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* 显示当前值，方便调试 */}
      <p>name: {name}, age: {age}, password: {"*".repeat(password.length)}</p>
    </>
  );
}
\`\`\`

### 2. textarea

\`\`\`tsx
function ControlledTextarea() {
  const [content, setContent] = useState("");

  return (
    <>
      {/* textarea 也用 value+onChange，不像 HTML 那样用 children */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        cols={40}
        placeholder="多行文本输入"
      />
      <p>字符数: {content.length}</p>
    </>
  );
}
\`\`\`

### 3. select（下拉选择）

\`\`\`tsx
function ControlledSelect() {
  const [fruit, setFruit] = useState("apple");
  const [city, setCity] = useState("");

  return (
    <>
      {/* 受控 select：value 绑定当前选中项 */}
      <select value={fruit} onChange={(e) => setFruit(e.target.value)}>
        <option value="apple">苹果</option>
        <option value="banana">香蕉</option>
        <option value="cherry">樱桃</option>
      </select>
      <p>选中水果: {fruit}</p>

      {/* 带空选项的 select（受控） */}
      <select value={city} onChange={(e) => setCity(e.target.value)}>
        <option value="">请选择城市</option>
        <option value="beijing">北京</option>
        <option value="shanghai">上海</option>
      </select>
      <p>选中城市: {city || "未选择"}</p>
    </>
  );
}
\`\`\`

> ⚠️ **注意**：不要在 select 上用 \`selected\` 属性（那是 HTML 原生写法）。React 始终用 \`value\`。

### 4. checkbox（复选框）

\`\`\`tsx
function ControlledCheckbox() {
  // 单个 checkbox：state 是 boolean
  const [agreed, setAgreed] = useState(false);
  // 多个 checkbox：state 是数组或对象
  const [hobbies, setHobbies] = useState<string[]>([]);

  // 切换爱好函数
  const toggleHobby = (hobby: string) => {
    setHobbies((prev) =>
      // includes 判断是否已选，有则移除，无则添加
      prev.includes(hobby) ? prev.filter((h) => h !== hobby) : [...prev, hobby]
    );
  };

  return (
    <>
      {/* 单选 checkbox：checked + onChange */}
      <label>
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        同意协议
      </label>

      {/* 多选 checkbox 数组：每个 value 单独判断 */}
      <div>
        {["阅读", "运动", "音乐"].map((hobby) => (
          <label key={hobby} style={{ marginRight: 12 }}>
            <input
              type="checkbox"
              // 受控：checked 由 state 决定
              checked={hobbies.includes(hobby)}
              onChange={() => toggleHobby(hobby)}
            />
            {hobby}
          </label>
        ))}
      </div>

      <p>爱好: {hobbies.join(", ") || "无"}</p>
    </>
  );
}
\`\`\`

### 5. radio（单选）

\`\`\`tsx
function ControlledRadio() {
  // radio 用同一个 state 变量存储选中的值
  const [gender, setGender] = useState("");

  return (
    <>
      {["male", "female", "other"].map((g) => (
        <label key={g} style={{ marginRight: 12 }}>
          <input
            type="radio"
            name="gender"            // 同组 radio 必须有相同 name
            value={g}
            // 受控：checked 决定是否选中
            checked={gender === g}
            onChange={(e) => setGender(e.target.value)}
          />
          {g === "male" ? "男" : g === "female" ? "女" : "其他"}
        </label>
      ))}
      <p>性别: {gender || "未选择"}</p>
    </>
  );
}
\`\`\`

---

## 三、统一处理多个输入：单个 handler + name 属性

表单字段多时，给每个 input 写一个 setState 非常繁琐。可以用 \`name\` 属性 + 单个 handler 统一管理：

\`\`\`tsx
// 表单 state 类型
type FormState = {
  username: string;
  email: string;
  age: number;
  bio: string;
};

function UnifiedForm() {
  // 用对象统一管理表单字段
  const [form, setForm] = useState<FormState>({
    username: "",
    email: "",
    age: 0,
    bio: "",
  });

  // 统一处理函数：通过 e.target.name 知道是哪个字段
  // 类型断言 e.target 为带 name 的 input/textarea
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      // 数字 input 手动转 number；checkbox 走 checked
      [name]: type === "number" ? Number(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("提交:", form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="username"
        value={form.username}
        onChange={handleChange}
        placeholder="用户名"
      />
      <input
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        placeholder="邮箱"
      />
      <input
        name="age"
        type="number"
        value={form.age}
        onChange={handleChange}
        placeholder="年龄"
      />
      <textarea
        name="bio"
        value={form.bio}
        onChange={handleChange}
        placeholder="个人简介"
      />
      <button type="submit">提交</button>

      {/* 实时预览 */}
      <pre>{JSON.stringify(form, null, 2)}</pre>
    </form>
  );
}
\`\`\`

**关键技巧**：
- \`e.target.name\` 拿到字段名
- 计算属性 \`[name]: value\` 动态设置对应字段
- 数字、checkbox 需要类型判断

---

## 四、完整 Demo：登录 + 注册表单

\`\`\`tsx
// 完整 Demo：受控组件综合应用
import React, { useState } from "react";

type LoginForm = {
  username: string;
  password: string;
  remember: boolean;
};

type RegisterForm = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: "male" | "female" | "";
  agree: boolean;
};

function FormShowcase() {
  // 登录表单 state
  const [login, setLogin] = useState<LoginForm>({
    username: "",
    password: "",
    remember: false,
  });

  // 注册表单 state
  const [register, setRegister] = useState<RegisterForm>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    agree: false,
  });

  const [submitted, setSubmitted] = useState<string | null>(null);

  // 登录表单的通用 handler
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLogin((prev) => ({
      ...prev,
      // checkbox 用 checked，其他用 value
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 注册表单的通用 handler（同时处理 input 和 radio）
  const handleRegisterChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setRegister((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 登录提交
  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(\`登录: \${login.username}\${login.remember ? " (记住我)" : ""}\`);
  };

  // 注册提交（含校验）
  const handleRegisterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 简单校验：密码一致性 + 协议同意
    if (register.password !== register.confirmPassword) {
      alert("两次密码不一致");
      return;
    }
    if (!register.agree) {
      alert("请先同意协议");
      return;
    }
    setSubmitted(\`注册: \${register.username} (\${register.gender})\`);
  };

  return (
    <div style={{ padding: 16, display: "grid", gap: 24 }}>
      <h2>表单综合 Demo</h2>

      {/* 登录表单 */}
      <form onSubmit={handleLoginSubmit} style={{ border: "1px solid #ccc", padding: 12 }}>
        <h3>登录</h3>
        <div>
          <input
            name="username"
            value={login.username}
            onChange={handleLoginChange}
            placeholder="用户名"
          />
        </div>
        <div>
          <input
            name="password"
            type="password"
            value={login.password}
            onChange={handleLoginChange}
            placeholder="密码"
          />
        </div>
        <label>
          <input
            name="remember"
            type="checkbox"
            checked={login.remember}
            onChange={handleLoginChange}
          />
          记住我
        </label>
        <button type="submit">登录</button>
      </form>

      {/* 注册表单 */}
      <form onSubmit={handleRegisterSubmit} style={{ border: "1px solid #ccc", padding: 12 }}>
        <h3>注册</h3>
        <div>
          <input
            name="username"
            value={register.username}
            onChange={handleRegisterChange}
            placeholder="用户名"
          />
        </div>
        <div>
          <input
            name="email"
            type="email"
            value={register.email}
            onChange={handleRegisterChange}
            placeholder="邮箱"
          />
        </div>
        <div>
          <input
            name="password"
            type="password"
            value={register.password}
            onChange={handleRegisterChange}
            placeholder="密码"
          />
        </div>
        <div>
          <input
            name="confirmPassword"
            type="password"
            value={register.confirmPassword}
            onChange={handleRegisterChange}
            placeholder="确认密码"
          />
        </div>
        <div>
          {(["male", "female"] as const).map((g) => (
            <label key={g} style={{ marginRight: 12 }}>
              <input
                type="radio"
                name="gender"
                value={g}
                checked={register.gender === g}
                onChange={handleRegisterChange}
              />
              {g === "male" ? "男" : "女"}
            </label>
          ))}
        </div>
        <label>
          <input
            name="agree"
            type="checkbox"
            checked={register.agree}
            onChange={handleRegisterChange}
          />
          同意用户协议
        </label>
        <button type="submit">注册</button>
      </form>

      {/* 提交结果 */}
      {submitted && (
        <div style={{ background: "#e8f5e9", padding: 12 }}>
          最新提交: {submitted}
        </div>
      )}
    </div>
  );
}

export default FormShowcase;
\`\`\`

---

## 小结

本章核心知识点：

1. **受控组件**：value 由 React state 控制，onChange 更新 state
2. **各种元素写法**：
   - text/number/email：\`value={x} onChange={e => setX(e.target.value)}\`
   - textarea：和 input 一致
   - select：\`value\` 绑定选中项
   - checkbox：\`checked={bool} onChange={e => setX(e.target.checked)}\`
   - radio：\`checked={state === value}\`
3. **统一 handler**：通过 \`e.target.name\` 配合 \`[name]: value\` 动态更新
4. **数字 input**：\`type="number"\` 的 value 仍是字符串，需手动 \`Number()\`
5. **checkbox/radio**：用 \`checked\` 而非 \`value\`，事件对象属性是 \`checked\`

下一章将学习受控组件的反面——**非受控组件**（用 ref 直接读 DOM）。`,
  },
  // ===========================================================
  // 第 23 章：非受控组件
  // ===========================================================
  {
    id: "tsx2-ch23",
    group: "第五部分 事件与受控组件",
    icon: "🔓",
    title: "第二十三章 非受控组件",
    content: `# 非受控组件

不是所有表单场景都需要受控——某些情况下，**让 DOM 自己维护值、提交时再读取**更简单高效。这就是非受控组件。

---

## 一、受控 vs 非受控：核心区别

| 维度 | 受控组件 | 非受控组件 |
| --- | --- | --- |
| 数据源 | React state | DOM 本身 |
| 同步方式 | 每次输入都触发 setState | 不同步，只在需要时读取 |
| 重渲染 | 每次输入都重渲染 | 输入时不重渲染 |
| 性能 | 输入频繁时较慢 | 性能更好 |
| 编程模式 | "声明式" | "命令式" |
| 校验/联动 | 容易 | 较难 |

\`\`\`tsx
// 受控：value 由 state 控制
function Controlled() {
  const [value, setValue] = useState("");
  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}

// 非受控：value 由 DOM 控制，只用 ref 在需要时读取
function Uncontrolled() {
  const ref = useRef<HTMLInputElement>(null);
  // 提交时读取
  const handleSubmit = () => console.log(ref.current?.value);
  return <input ref={ref} defaultValue="初始值" />;
}
\`\`\`

---

## 二、useRef 读取 DOM

\`useRef\` 返回一个对象 \`{ current: ... }\`，可以保存任意可变值。访问 DOM 是最常见的用法：

\`\`\`tsx
import React, { useRef } from "react";

function UseRefDemo() {
  // 泛型指定 ref 指向的元素类型
  // initial value 传 null——初次渲染时 ref 还未挂载
  const inputRef = useRef<HTMLInputElement>(null);

  // 读取 input 的值
  const handleRead = () => {
    // ref.current 在挂载后是 input DOM 节点
    // 用可选链 ?. 防止初次渲染时为 null
    console.log("当前值:", inputRef.current?.value);
  };

  // 主动聚焦 input
  const handleFocus = () => {
    inputRef.current?.focus();
  };

  return (
    <>
      {/* ref 把 input DOM 节点存入 inputRef.current */}
      <input ref={inputRef} defaultValue="hello" />

      <button onClick={handleRead}>读取值</button>
      <button onClick={handleFocus}>聚焦</button>
    </>
  );
}
\`\`\`

> 💡 **为什么用可选链？** 组件挂载之前 \`inputRef.current\` 是 \`null\`，访问 \`.value\` 会报错。\`?.\` 运算符在 null/undefined 时短路返回。

---

## 三、defaultValue：非受控的初始值

非受控组件用 \`defaultValue\` 设置初始值（不是 \`value\`）：

\`\`\`tsx
function DefaultValueDemo() {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);
  const countryRef = useRef<HTMLSelectElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 提交时统一读取
    const data = {
      name: nameRef.current?.value,
      email: emailRef.current?.value,
      bio: bioRef.current?.value,
      country: countryRef.current?.value,
    };
    console.log("提交数据:", data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* defaultValue 只在挂载时生效，之后用户输入完全由 DOM 维护 */}
      <input ref={nameRef} defaultValue="张三" placeholder="姓名" />
      <input ref={emailRef} type="email" defaultValue="" placeholder="邮箱" />
      <textarea ref={bioRef} defaultValue="" placeholder="简介" />
      <select ref={countryRef} defaultValue="cn">
        <option value="cn">中国</option>
        <option value="us">美国</option>
      </select>
      <button type="submit">提交</button>
    </form>
  );
}
\`\`\`

> ⚠️ **重要区别**：\`value\`（受控）vs \`defaultValue\`（非受控）。同时设置 \`value\` 和 \`defaultValue\` 会得到警告。

---

## 四、checkbox / radio 的非受控写法

\`\`\`tsx
function UncontrolledCheckbox() {
  const agreeRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // checkbox/radio：读 .checked 而不是 .value
    console.log("同意协议:", agreeRef.current?.checked);
    console.log("性别:", genderRef.current?.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        <input ref={agreeRef} type="checkbox" defaultChecked />
        同意协议
      </label>
      <label>
        <input ref={genderRef} type="radio" name="g" value="male" defaultChecked />
        男
      </label>
      <label>
        <input ref={genderRef} type="radio" name="g" value="female" />
        女
      </label>
      <button type="submit">读取</button>
    </form>
  );
}
\`\`\`

> 💡 **注意**：radio 用 ref 只能拿到**最后一个 ref 绑定的元素**——因为同 name 的 radio 是互斥的。实际中读 radio 最好用受控。

---

## 五、文件 input：天然非受控

文件 input 的 value 是只读的（安全考虑，浏览器不允许 JS 设置文件路径），所以**必须用非受控方式**：

\`\`\`tsx
function FileInput() {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    // FileList 包含用户选择的文件
    const file = fileRef.current?.files?.[0];
    if (!file) {
      console.log("未选择文件");
      return;
    }
    console.log(\`文件名: \${file.name}, 大小: \${file.size} bytes, 类型: \${file.type}\`);
    // 实际项目里：构造 FormData 上传到服务器
    const formData = new FormData();
    formData.append("file", file);
    // fetch("/api/upload", { method: "POST", body: formData })
  };

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" />
      <button onClick={handleUpload}>上传</button>
    </>
  );
}
\`\`\`

---

## 六、什么时候用非受控？

| 场景 | 推荐 | 理由 |
| --- | --- | --- |
| 表单字段很多（> 10 个） | ✅ 非受控 | 避免大量 useState 和重渲染 |
| 提交时才需要值（如搜索） | ✅ 非受控 | 输入过程不关心值 |
| 文件上传 | ✅ 必须非受控 | 文件 input value 只读 |
| 需要实时校验 / 联动 | ❌ 受控 | 非受控拿不到中间值 |
| 字段值影响其他 UI | ❌ 受控 | 例如禁用提交按钮、显示字数 |
| 简单登录表单（1-3 字段） | 两者皆可 | 视团队习惯 |

---

## 七、完整 Demo：搜索框（最常见非受控场景）

\`\`\`tsx
// 完整 Demo：非受控组件综合应用
import React, { useRef, useState } from "react";

function UncontrolledShowcase() {
  // 多个 ref
  const searchRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  // 提交后的结果
  const [result, setResult] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<string | null>(null);

  // 场景 1：搜索（输入过程不关心，提交时读取）
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const keyword = searchRef.current?.value.trim() ?? "";
    if (!keyword) {
      alert("请输入搜索词");
      // 主动聚焦
      searchRef.current?.focus();
      return;
    }
    setResult(\`搜索: "\${keyword}"\`);
  };

  // 场景 2：清空输入
  const handleClear = () => {
    if (searchRef.current) {
      searchRef.current.value = "";
    }
    searchRef.current?.focus();
  };

  // 场景 3：文件预览
  const handleFileChange = () => {
    const file = fileRef.current?.files?.[0];
    if (file) {
      setFileInfo(\`已选择: \${file.name} (\${(file.size / 1024).toFixed(1)} KB)\`);
    } else {
      setFileInfo(null);
    }
  };

  // 场景 4：评论提交
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = commentRef.current?.value ?? "";
    if (!text) return;
    setResult(\`评论: "\${text}"\`);
    if (commentRef.current) {
      commentRef.current.value = "";
    }
  };

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <h2>非受控组件 Demo</h2>

      {/* 场景 1：搜索 */}
      <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
        <input
          ref={searchRef}
          // 关键：用 defaultValue 而非 value
          defaultValue=""
          placeholder="搜索..."
        />
        <button type="submit">搜索</button>
        <button type="button" onClick={handleClear}>清空</button>
      </form>

      {/* 场景 2：文件 input */}
      <div style={{ marginBottom: 16 }}>
        <input
          ref={fileRef}
          type="file"
          onChange={handleFileChange}  // 仅用于显示文件名，不受控
        />
        {fileInfo && <p>{fileInfo}</p>}
      </div>

      {/* 场景 3：评论 */}
      <form onSubmit={handleCommentSubmit} style={{ marginBottom: 16 }}>
        <textarea
          ref={commentRef}
          defaultValue=""
          rows={3}
          placeholder="写下你的评论..."
        />
        <button type="submit">发表</button>
      </form>

      {/* 结果展示 */}
      {result && (
        <div style={{ background: "#e8f5e9", padding: 12 }}>
          {result}
        </div>
      )}
    </div>
  );
}

export default UncontrolledShowcase;
\`\`\`

**代码要点**：
- 所有 input 用 \`ref\` 而非 \`value\`
- 初始值用 \`defaultValue\`
- 提交时 \`ref.current?.value\` 读取
- 文件 input 只能非受控

---

## 小结

本章核心知识点：

1. **非受控**：表单值由 DOM 维护，React 不参与输入过程
2. **useRef**：\`useRef<T>(null)\` 创建 ref，挂载后 \`ref.current\` 是 DOM 节点
3. **defaultValue**：非受控的初始值，对应 \`defaultChecked\`（checkbox）
4. **文件 input**：必须用非受控（\`value\` 只读）
5. **何时用**：
   - 字段多 / 提交时才需要值 / 文件上传 → 非受控
   - 需要实时校验 / 联动 / 影响其他 UI → 受控
6. **清空非受控**：直接 \`ref.current.value = ""\`

下一章讲解**事件传参与回调函数**——处理复杂交互时的必备技巧。`,
  },
  // ===========================================================
  // 第 24 章：事件传参与回调函数
  // ===========================================================
  {
    id: "tsx2-ch24",
    group: "第五部分 事件与受控组件",
    icon: "📤",
    title: "第二十四章 事件传参与回调函数",
    content: `# 事件传参与回调函数

实际开发中，我们经常需要给事件处理器**传递额外参数**（如列表项的 id）。本章系统讲解 4 种传参方式、性能考量与事件委托。

---

## 一、问题：为什么 onClick={handleClick(id)} 会立即执行？

初学者最常踩的坑：

\`\`\`tsx
function ListBad() {
  const items = ["A", "B", "C"];

  return (
    <ul>
      {items.map((item) => (
        // ❌ 错：每次渲染时立即调用 handleClick(item)
        // React 看到的是 handleClick(item) 的返回值（undefined），而不是函数
        <li key={item} onClick={handleClick(item)}>
          {item}
        </li>
      ))}
    </ul>
  );

  function handleClick(value: string) {
    console.log("点击:", value);
  }
}
\`\`\`

**原因**：\`onClick={handleClick(item)}\` 是函数**调用**，不是函数**引用**。React 拿到的是返回值，传给 onClick 不会触发任何逻辑。

---

## 二、四种正确传参方式

### 方式 1：箭头函数包裹（最直观）

\`\`\`tsx
function ListArrow() {
  const items = ["A", "B", "C"];

  const handleClick = (value: string) => {
    console.log("点击:", value);
  };

  return (
    <ul>
      {items.map((item) => (
        // ✅ 正确：箭头函数返回一个函数，传给 onClick
        // 触发时机：点击时；item 通过闭包捕获
        <li key={item} onClick={() => handleClick(item)}>
          {item}
        </li>
      ))}
    </ul>
  );
}
\`\`\`

> 💡 **原理**：箭头函数 \`() => handleClick(item)\` 返回一个新函数，React 保存这个函数引用，点击时才执行。

### 方式 2：currying（柯里化，返回函数）

\`\`\`tsx
function ListCurry() {
  const items = ["A", "B", "C"];

  // 高阶函数：返回一个接收事件的函数
  // 第一次调用：传入 item，返回事件处理器
  // 第二次调用：实际点击时，传入 event 执行
  const handleClick = (value: string) => (e: React.MouseEvent) => {
    console.log(\`点击: \${value}, 类型: \${e.type}\`);
  };

  return (
    <ul>
      {items.map((item) => (
        // 直接传 handleClick(item)——返回一个函数
        <li key={item} onClick={handleClick(item)}>
          {item}
        </li>
      ))}
    </ul>
  );
}
\`\`\`

> 💡 **优势**：相比箭头函数，currying 不会在每次渲染时创建新函数（外层 handleClick 引用不变），性能略好。

### 方式 3：data-* 属性 + 事件委托

\`\`\`tsx
function ListDataAttr() {
  const items = [
    { id: 1, name: "A" },
    { id: 2, name: "B" },
    { id: 3, name: "C" },
  ];

  // 单个 handler 处理所有点击，通过 dataset 读 id
  const handleClick = (e: React.MouseEvent<HTMLUListElement>) => {
    // 找到实际被点击的 li
    const target = e.target as HTMLElement;
    const li = target.closest("li[data-id]") as HTMLLIElement | null;
    if (!li) return;
    // dataset.id 是字符串，转 number
    const id = Number(li.dataset.id);
    const item = items.find((i) => i.id === id);
    console.log("点击了:", item);
  };

  return (
    // 外层 ul 绑定一次，内部 li 通过 data-id 传参
    <ul onClick={handleClick}>
      {items.map((item) => (
        <li key={item.id} data-id={item.id}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}
\`\`\`

> 💡 **事件委托**：1000 个 li 只在 ul 上绑定一个监听器，性能显著优于每个 li 单独绑定。

### 方式 4：useCallback 包装（性能优化）

\`\`\`tsx
import { useCallback } from "react";

function ListCallback() {
  const items = ["A", "B", "C"];

  // useCallback 缓存函数——依赖项不变则返回同一引用
  // 配合 React.memo 使用的子组件可以避免不必要重渲染
  const makeHandler = useCallback(
    (value: string) => {
      return (e: React.MouseEvent) => {
        console.log(\`点击: \${value}\`);
      };
    },
    [] // 无依赖——items 来自外部，如果会变应该加进去
  );

  return (
    <ul>
      {items.map((item) => (
        <li key={item} onClick={makeHandler(item)}>
          {item}
        </li>
      ))}
    </ul>
  );
}
\`\`\`

---

## 三、四种方式对比

| 方式 | 写法 | 每次渲染创建新函数？ | 性能 | 可读性 |
| --- | --- | --- | --- | --- |
| 箭头函数 | \`onClick={() => fn(id)}\` | ✅ 是 | 一般 | ⭐⭐⭐⭐⭐ |
| Currying | \`onClick={fn(id)}\` | ❌ 否 | 更好 | ⭐⭐⭐ |
| data-attr | ul 绑一次，内部读 dataset | ❌ 否 | 最好（事件委托） | ⭐⭐⭐⭐ |
| useCallback | \`useCallback\` 包装 | ❌ 否 | 最好 | ⭐⭐ |

> 💡 **实战建议**：
> - 列表 < 50 项：箭头函数最直观
> - 列表 ≥ 50 项：用 data-attr + 事件委托
> - 性能敏感场景：用 useCallback + React.memo

---

## 四、事件委托（Event Delegation）

**核心思想**：把监听器绑在父元素上，通过 \`e.target\` 找到实际点击的子元素。

\`\`\`tsx
function EventDelegation() {
  const items = [
    { id: 1, name: "首页" },
    { id: 2, name: "产品" },
    { id: 3, name: "关于" },
  ];

  // 单个 handler 处理整个菜单
  const handleMenuClick = (e: React.MouseEvent<HTMLUListElement>) => {
    // 关键：从 e.target 反查被点击的 li
    const li = (e.target as HTMLElement).closest("li[data-id]");
    if (!li) return;
    const id = li.getAttribute("data-id");
    console.log("点击了菜单项:", id);
  };

  return (
    <ul onClick={handleMenuClick} style={{ display: "flex", gap: 12 }}>
      {items.map((item) => (
        // data-* 属性携带数据；不绑 onClick
        <li
          key={item.id}
          data-id={item.id}
          style={{ cursor: "pointer", padding: 8 }}
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
}
\`\`\`

**事件委托的优势**：
1. **内存**：N 个子元素只需 1 个监听器
2. **动态元素**：新增的子元素自动支持（无需重新绑定）
3. **性能**：减少 DOM 监听器数量

---

## 五、性能考量：何时不绑新函数？

\`\`\`tsx
// ❌ 性能问题：每次渲染创建新函数
function BadPerformance({ items }: { items: string[] }) {
  return items.map((item) => (
    // 每次渲染：100 个 item = 100 个新箭头函数
    <Item key={item} name={item} onClick={() => console.log(item)} />
  ));
}

// 子组件用 React.memo 才有意义（见后文）
const Item = React.memo(function Item({
  name,
  onClick,
}: {
  name: string;
  onClick: () => void;
}) {
  console.log(\`Item \${name} rendered\`);
  return <li onClick={onClick}>{name}</li>;
});

// ✅ 优化 1：useCallback 缓存
function GoodPerformance({ items }: { items: string[] }) {
  const handleClick = useCallback((name: string) => {
    console.log(name);
  }, []);

  return items.map((item) => (
    <Item key={item} name={item} onClick={() => handleClick(item)} />
  ));
  // 注意：内层 onClick 仍是新函数，但 handleClick 引用稳定
}

// ✅ 优化 2：传 data-attr，让 Item 内部解析
function BetterPerformance({ items }: { items: string[] }) {
  const handleClick = useCallback((e: React.MouseEvent<HTMLUListElement>) => {
    const target = e.target as HTMLElement;
    const item = target.dataset.name;
    if (item) console.log(item);
  }, []);

  return (
    <ul onClick={handleClick}>
      {items.map((item) => (
        // 关键：不传 onClick，只传 data-name
        <Item key={item} name={item} />
      ))}
    </ul>
  );
}
\`\`\`

---

## 六、完整 Demo：可操作表格（综合应用）

\`\`\`tsx
// 完整 Demo：列表项操作 + 事件委托 + 传参
import React, { useState, useCallback } from "react";

type User = {
  id: number;
  name: string;
  role: string;
};

function TableDemo() {
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: "张三", role: "管理员" },
    { id: 2, name: "李四", role: "编辑" },
    { id: 3, name: "王五", role: "访客" },
  ]);
  const [action, setAction] = useState<string | null>(null);

  // 用 useCallback 缓存 handler
  const handleTableClick = useCallback(
    (e: React.MouseEvent<HTMLTableElement>) => {
      // 找到被点击的按钮（事件委托）
      const btn = (e.target as HTMLElement).closest("button[data-action]");
      if (!btn) return;
      const actionType = btn.getAttribute("data-action");
      const id = Number(btn.getAttribute("data-id"));
      const user = users.find((u) => u.id === id);
      if (!user) return;

      if (actionType === "edit") {
        setAction(\`编辑: \${user.name}\`);
      } else if (actionType === "delete") {
        setAction(\`删除: \${user.name}\`);
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else if (actionType === "view") {
        setAction(\`查看: \${user.name} (\${user.role})\`);
      }
    },
    [users] // users 变化时重新创建
  );

  return (
    <div style={{ padding: 16 }}>
      <h2>用户表格</h2>
      {/* 关键：只在 table 上绑一个 handler */}
      <table
        onClick={handleTableClick}
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>ID</th>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>姓名</th>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>角色</th>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{user.id}</td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{user.name}</td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{user.role}</td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>
                {/* data-* 携带参数，不绑 onClick */}
                <button data-action="view" data-id={user.id}>查看</button>
                <button data-action="edit" data-id={user.id}>编辑</button>
                <button data-action="delete" data-id={user.id}>删除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {action && (
        <div style={{ marginTop: 12, padding: 8, background: "#e3f2fd" }}>
          {action}
        </div>
      )}
    </div>
  );
}

export default TableDemo;
\`\`\`

**关键技巧总结**：
- 表格只有一个 \`onClick\`
- 按钮用 \`data-action\` 和 \`data-id\` 携带参数
- \`closest()\` 反查被点击的元素
- \`useCallback\` 缓存 handler 引用

---

## 小结

本章核心知识点：

1. **四种传参方式**：
   - 箭头函数（最直观）
   - Currying（性能略好）
   - data-attr + 事件委托（最佳性能）
   - useCallback（结合 React.memo）
2. **事件委托**：父元素统一处理，通过 \`e.target\` / \`closest()\` 找子元素
3. **性能考量**：
   - 列表小：箭头函数够用
   - 列表大：用事件委托
   - 子组件用 React.memo 时：必须 useCallback
4. **dataset**：\`el.dataset.xxx\` 读 \`data-xxx\` 属性
5. **closest()**：从当前元素向上找匹配选择器的最近祖先

下一章讲解**键盘事件与鼠标事件**——更细粒度的用户交互。`,
  },
  // ===========================================================
  // 第 25 章：键盘事件与鼠标事件
  // ===========================================================
  {
    id: "tsx2-ch25",
    group: "第五部分 事件与受控组件",
    icon: "⌨️",
    title: "第二十五章 键盘事件与鼠标事件",
    content: `# 键盘事件与鼠标事件

除了基础的 onClick / onChange，React 还提供丰富的鼠标、键盘事件 API。本章深入讲解它们的差异、按键识别、自定义 Hook 封装。

---

## 一、键盘事件三剑客

| 事件 | 触发时机 | 常见用途 |
| --- | --- | --- |
| \`onKeyDown\` | 按键**按下**时 | 快捷键、提交、回车 |
| \`onKeyPress\`（已废弃）| 按键产生字符时 | 不推荐，浏览器支持有限 |
| \`onKeyUp\` | 按键**松开**时 | 输入结束、组合键释放 |

> ⚠️ \`onKeyPress\` 已被废弃，新代码不要再用。需要时用 \`onKeyDown\`。

\`\`\`tsx
import React, { useState } from "react";

function KeyboardBasics() {
  const [log, setLog] = useState<string[]>([]);

  // 按下时触发
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // e.key 是按键的语义名称（推荐）
    console.log(\`keyDown: key=\${e.key}, code=\${e.code}\`);
  };

  // 松开时触发
  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setLog((prev) => [\`释放: \${e.key}\`, ...prev].slice(0, 5));
  };

  return (
    <>
      <input
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        placeholder="试试按键"
      />
      <ul>
        {log.map((l, i) => <li key={i}>{l}</li>)}
      </ul>
    </>
  );
}
\`\`\`

---

## 二、识别按键：key vs code

| 属性 | 含义 | 例子 | 推荐度 |
| --- | --- | --- | --- |
| \`e.key\` | 字符含义（受输入法、布局影响） | "a", "A", "Enter", "ArrowUp" | ⭐⭐⭐⭐⭐ |
| \`e.code\` | 物理按键（不受布局影响） | "KeyA", "Enter", "ArrowUp" | ⭐⭐⭐⭐ |
| \`e.keyCode\` | 数字编码（已废弃） | 13, 65, 38 | ❌ 不要用 |

\`\`\`tsx
function KeyIdentification() {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 推荐用 e.key——语义化、跨键盘布局
    if (e.key === "Enter") {
      console.log("回车键");
    } else if (e.key === "Escape") {
      console.log("ESC 键");
    } else if (e.key === "ArrowUp") {
      console.log("上箭头");
    } else if (e.key === " ") {  // 空格
      console.log("空格键");
    }

    // 区分大小写：e.key 在按住 Shift 时会变成大写
    if (e.key === "a") console.log("小写 a");
    if (e.key === "A") console.log("大写 A（Shift+a）");

    // 修饰键：e.ctrlKey / e.shiftKey / e.altKey / e.metaKey
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();  // 阻止浏览器保存网页
      console.log("Ctrl+S 保存");
    }
  };

  return <input onKeyDown={handleKeyDown} placeholder="按 Ctrl+S 试试" />;
}
\`\`\`

> 💡 **最佳实践**：用 \`e.key\` 而不是 \`e.keyCode\`。\`e.key\` 是 W3C 标准，且对不同语言键盘布局更友好。

---

## 三、常见快捷键封装

\`\`\`tsx
// 通用快捷键 Hook
function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: { ctrl?: boolean; shift?: boolean; alt?: boolean } = {}
) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // 检查修饰键
      if (options.ctrl && !e.ctrlKey) return;
      if (options.shift && !e.shiftKey) return;
      if (options.alt && !e.altKey) return;
      // 大小写不敏感
      if (e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        callback();
      }
    };
    // 全局监听
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, callback, options.ctrl, options.shift, options.alt]);
}

// 使用
function ShortcutDemo() {
  const [count, setCount] = useState(0);
  // Ctrl+S 保存（阻止浏览器默认）
  useKeyboardShortcut("s", () => {
    console.log("保存！count =", count);
  }, { ctrl: true });
  // 单独按 Esc
  useKeyboardShortcut("Escape", () => console.log("取消"));
  // Shift+? 帮助
  useKeyboardShortcut("?", () => console.log("显示帮助"), { shift: true });

  return <p>按 Ctrl+S / Esc / Shift+? 试试（count: {count}）</p>;
}
\`\`\`

---

## 四、鼠标事件详解

\`\`\`tsx
import React, { useState } from "react";

function MouseEvents() {
  const [hovered, setHovered] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // 鼠标进入（不会冒泡，子元素不触发）
  const handleMouseEnter = () => setHovered(true);
  // 鼠标离开
  const handleMouseLeave = () => setHovered(false);

  // 鼠标在区域内移动
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };

  // 鼠标按下 / 松开
  const handleMouseDown = () => console.log("按下");
  const handleMouseUp = () => console.log("松开");

  // 右键点击
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log(\`右键 (\${e.clientX}, \${e.clientY})\`);
  };

  // 双击
  const handleDoubleClick = () => console.log("双击");

  // 滚轮
  const handleWheel = (e: React.WheelEvent) => {
    // deltaY: 向下滚动正值，向上滚动负值
    console.log(\`滚轮: \${e.deltaY > 0 ? "向下" : "向上"}\`);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
      onWheel={handleWheel}
      style={{
        width: 300,
        height: 200,
        background: hovered ? "#ffeb3b" : "#fff",
        border: "2px solid #333",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      鼠标坐标: ({position.x}, {position.y})
    </div>
  );
}
\`\`\`

> 💡 **mouseenter vs mouseover**：
> - \`mouseenter\`：只在进入元素时触发，**不会冒泡**（推荐）
> - \`mouseover\`：进入或进入子元素都触发，会冒泡（DOM 标准行为）

---

## 五、聚焦与失焦

\`\`\`tsx
function FocusBlur() {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          setFocused(false);
          // 失焦时校验
          if (!e.target.value) {
            console.log("不能为空");
          }
        }}
        style={{
          outline: focused ? "2px solid #2196f3" : "none",
        }}
      />
      <button onClick={() => inputRef.current?.focus()}>聚焦</button>
    </>
  );
}
\`\`\`

---

## 六、封装自定义 Hook：useKeyPress

\`\`\`tsx
// 监听单个按键是否被按下
function useKeyPress(targetKey: string): boolean {
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const downHandler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === targetKey.toLowerCase()) {
        setPressed(true);
      }
    };
    const upHandler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === targetKey.toLowerCase()) {
        setPressed(false);
      }
    };
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    // 清理
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, [targetKey]);

  return pressed;
}

// 使用
function KeyPressDemo() {
  const isEnterPressed = useKeyPress("Enter");
  const isShiftPressed = useKeyPress("Shift");
  return (
    <p>
      Enter: {isEnterPressed ? "🟢按下" : "⚪未按"} |
      Shift: {isShiftPressed ? "🟢按下" : "⚪未按"}
    </p>
  );
}
\`\`\`

---

## 七、完整 Demo：键盘控制的数字输入框

\`\`\`tsx
// 完整 Demo：键盘 + 鼠标事件综合应用
import React, { useState, useRef, useEffect } from "react";

function NumberInput() {
  const [value, setValue] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // 记录历史
  const commit = (newVal: number) => {
    setValue(newVal);
    setHistory((prev) => [newVal, ...prev].slice(0, 5));
  };

  // 键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 上箭头：+1
    if (e.key === "ArrowUp") {
      e.preventDefault();  // 阻止光标移到末尾
      commit(value + 1);
    }
    // 下箭头：-1
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      commit(value - 1);
    }
    // 回车：保存
    else if (e.key === "Enter") {
      e.preventDefault();
      commit(value);
    }
    // r 键：重置
    else if (e.key.toLowerCase() === "r") {
      e.preventDefault();
      commit(0);
    }
  };

  // 鼠标事件
  const handleDoubleClick = () => {
    // 双击重置
    commit(0);
  };

  const handleWheel = (e: React.WheelEvent) => {
    // 滚轮调节
    if (e.deltaY > 0) commit(value - 1);
    else commit(value + 1);
  };

  // 暴露 ref 方法
  useEffect(() => {
    // 挂载后自动聚焦
    inputRef.current?.focus();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>数字输入框（键盘 + 鼠标控制）</h2>

      <input
        ref={inputRef}
        type="number"
        value={value}
        // 受控：onChange 还是必要的
        onChange={(e) => setValue(Number(e.target.value) || 0)}
        onKeyDown={handleKeyDown}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        style={{
          fontSize: 32,
          width: 100,
          textAlign: "center",
          padding: 8,
        }}
      />

      <p>当前值: <strong>{value}</strong></p>

      <div style={{ background: "#f5f5f5", padding: 12, fontSize: 14 }}>
        <strong>操作说明：</strong>
        <ul>
          <li>↑ / ↓：加减 1</li>
          <li>Enter：保存到历史</li>
          <li>r：重置为 0</li>
          <li>双击：重置</li>
          <li>滚轮：调节</li>
        </ul>
      </div>

      <h3>历史记录</h3>
      {history.length === 0 ? (
        <p style={{ color: "#999" }}>暂无</p>
      ) : (
        <ol>
          {history.map((v, i) => <li key={i}>{v}</li>)}
        </ol>
      )}
    </div>
  );
}

export default NumberInput;
\`\`\`

---

## 小结

本章核心知识点：

1. **键盘事件**：\`onKeyDown\`（按下）、\`onKeyUp\`（松开）；\`onKeyPress\` 已废弃
2. **按键识别**：
   - \`e.key\` 语义化（推荐）
   - \`e.code\` 物理键
   - \`e.keyCode\` 已废弃，不要用
3. **修饰键**：\`e.ctrlKey\` / \`e.shiftKey\` / \`e.altKey\` / \`e.metaKey\`
4. **鼠标事件**：\`onMouseEnter\`（不冒泡）vs \`onMouseOver\`（冒泡）；\`onContextMenu\` 右键；\`onDoubleClick\` 双击；\`onWheel\` 滚轮
5. **聚焦/失焦**：\`onFocus\` / \`onBlur\`
6. **自定义 Hook**：\`useKeyPress\`、\`useKeyboardShortcut\` 封装复用逻辑

至此"事件与受控组件"部分全部完成。下一部分将深入 **useState 进阶**。`,
  },
];

export { chapters };
