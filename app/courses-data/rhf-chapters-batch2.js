export const chapters = [
  {
    id: "rhf-inputs",
    group: "基础入门",
    icon: "📝",
    title: "各种输入控件",
    content: `# 各种输入控件

React Hook Form 支持所有原生 HTML 表单控件，用法都差不多！

---

## 文本输入 (input type="text")

最基础的输入框：

\`\`\`jsx
<input placeholder="请输入姓名" {...register("name")} />
\`\`\`

---

## 密码输入 (input type="password")

\`\`\`jsx
<input
  type="password"
  placeholder="请输入密码"
  {...register("password", { required: "密码不能为空" })}
/>
\`\`\`

---

## 数字输入 (input type="number")

\`\`\`jsx
<input
  type="number"
  placeholder="年龄"
  {...register("age", {
    valueAsNumber: true,  // 重要！自动转成数字类型，而不是字符串
    min: { value: 0, message: "年龄不能小于0" }
  })}
/>
\`\`\`

💡 **重要**：对于 type="number"，一定要加 \`valueAsNumber: true\`，否则你拿到的值是字符串 "25" 而不是数字 25！

---

## 复选框 (Checkbox)

单个 checkbox（布尔值）：

\`\`\`jsx
<label>
  <input
    type="checkbox"
    {...register("agreeTerms")}
  />
  我同意服务条款
</label>
\`\`\`

多个 checkbox（选多个，数组）：

\`\`\`jsx
<div>
  <p>选择你的兴趣爱好：</p>
  <label>
    <input type="checkbox" value="coding" {...register("hobbies")} />
    编程
  </label>
  <label>
    <input type="checkbox" value="reading" {...register("hobbies")} />
    阅读
  </label>
  <label>
    <input type="checkbox" value="sports" {...register("hobbies")} />
    运动
  </label>
</div>
\`\`\`

选中 "编程" 和 "阅读" 后，\`data.hobbies\` 是 \`["coding", "reading"]\`

---

## 单选框 (Radio)

同一组 radio 用相同的 name：

\`\`\`jsx
<div>
  <p>性别：</p>
  <label>
    <input
      type="radio"
      value="male"
      {...register("gender", { required: "请选择性别" })}
    />
    男
  </label>
  <label>
    <input
      type="radio"
      value="female"
      {...register("gender")}
    />
    女
  </label>
  <label>
    <input
      type="radio"
      value="other"
      {...register("gender")}
    />
    其他
  </label>
</div>
\`\`\`

---

## 下拉选择 (Select)

原生 select 也可以直接用：

\`\`\`jsx
<select {...register("city", { required: "请选择城市" })}>
  <option value="">请选择城市</option>
  <option value="beijing">北京</option>
  <option value="shanghai">上海</option>
  <option value="guangzhou">广州</option>
  <option value="shenzhen">深圳</option>
</select>
\`\`\`

注意第一个 \`<option value="">\` 是占位符，这样 required 验证才能生效！

---

## 多行文本 (Textarea)

\`\`\`jsx
<textarea
  placeholder="个人简介"
  rows={4}
  {...register("bio", {
    maxLength: { value: 200, message: "简介最多200字" }
  })}
/>
\`\`\`

---

## 文件上传 (File)

文件输入用 \`register\` 时，值是 FileList 对象：

\`\`\`jsx
<input
  type="file"
  accept="image/*"  // 只接受图片
  {...register("avatar")}
/>
\`\`\`

提交时获取文件：

\`\`\`jsx
const onSubmit = (data) => {
  const file = data.avatar[0]; // File 对象
  if (file) {
    console.log("文件名:", file.name);
    console.log("文件大小:", file.size);
    // 可以用 FormData 上传
    const formData = new FormData();
    formData.append("avatar", file);
  }
};
\`\`\`

多文件上传加 \`multiple\`：

\`\`\`jsx
<input
  type="file"
  multiple
  {...register("photos")}
/>
// data.photos 是 FileList
\`\`\`

---

## 日期输入 (Date)

\`\`\`jsx
<input
  type="date"
  {...register("birthday", {
    valueAsDate: true  // 自动转成 Date 对象
  })}
/>
\`\`\`

类似还有 \`type="datetime-local"\`, \`type="time"\`, \`type="month"\`, \`type="week"\` 等。

---

## 范围输入 (Range)

\`\`\`jsx
<div>
  <label>音量: {watchVolume}</label>
  <input
    type="range"
    min="0"
    max="100"
    {...register("volume", { valueAsNumber: true })}
  />
</div>
\`\`\`

---

## 隐藏字段 (Hidden)

\`\`\`jsx
<input
  type="hidden"
  value="some-id-123"
  {...register("userId")}
/>
\`\`\`

---

## 完整示例：各种控件大全

\`\`\`jsx
import { useForm } from "react-hook-form";

export default function AllInputsForm() {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      gender: "male",
      volume: 50
    }
  });

  const onSubmit = (data) => {
    console.log("表单数据:", data);
    alert(JSON.stringify(data, null, 2));
  };

  // watch 可以实时监听字段值（下一章详细讲）
  const volume = watch("volume");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* 文本 */}
      <input placeholder="姓名" {...register("name", { required: true })} />

      {/* 数字 */}
      <input
        type="number"
        placeholder="年龄"
        {...register("age", { valueAsNumber: true, min: 0 })}
      />

      {/* 单选 */}
      <div>
        性别：
        <label><input type="radio" value="male" {...register("gender")} /> 男</label>
        <label><input type="radio" value="female" {...register("gender")} /> 女</label>
      </div>

      {/* 多选 */}
      <div>
        爱好：
        <label><input type="checkbox" value="coding" {...register("hobbies")} /> 编程</label>
        <label><input type="checkbox" value="reading" {...register("hobbies")} /> 阅读</label>
      </div>

      {/* 下拉 */}
      <select {...register("city")}>
        <option value="">请选择</option>
        <option value="bj">北京</option>
        <option value="sh">上海</option>
      </select>

      {/* 文本域 */}
      <textarea placeholder="简介" {...register("bio")} />

      {/* 滑块 */}
      <div>
        音量: {volume}
        <input type="range" min="0" max="100" {...register("volume", { valueAsNumber: true })} />
      </div>

      {/* 同意条款 */}
      <label>
        <input type="checkbox" {...register("agree", { required: true })} />
        我同意条款
      </label>

      <button type="submit">提交</button>
    </form>
  );
}
\`\`\`

---

## 本章小结

✅ 所有原生表单控件都可以直接用 \`register\`
✅ \`type="number"\` 记得加 \`valueAsNumber: true\`
✅ \`type="date"\` 记得加 \`valueAsDate: true\`
✅ 多个 checkbox 用相同的 name，值是数组
✅ radio 用相同的 name，值是选中的那个
✅ select 的第一个 option 设置 \`value=""\` 配合 required
✅ 文件输入的值是 FileList，通过 \`data.field[0]\` 获取

下一章学习默认值、watch 监听和表单重置！`,
    code: `import { useForm } from "react-hook-form";

// 包含各种常见输入控件的表单示例
export default function CompleteForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      gender: "male",
      newsletter: true,
      volume: 50
    },
    mode: "onBlur"
  });

  const onSubmit = (data) => {
    console.log("=== 表单提交数据 ===");
    console.log(JSON.stringify(data, null, 2));
    alert("提交成功！\\n" + JSON.stringify(data, null, 2));
  };

  // 实时监听字段值
  const volume = watch("volume");
  const bio = watch("bio") || "";

  const inputStyle = {
    width: "100%",
    padding: 8,
    marginTop: 4,
    border: "1px solid #ddd",
    borderRadius: 4,
    boxSizing: "border-box"
  };

  const errorStyle = { color: "red", fontSize: 12, margin: "4px 0 0" };
  const labelStyle = { display: "block", marginTop: 12, fontSize: 14 };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 20 }}>
      <h2>📋 完整表单示例</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 姓名 */}
        <label style={labelStyle}>姓名 *</label>
        <input
          placeholder="请输入姓名"
          style={{ ...inputStyle, border: errors.name ? "1px solid red" : inputStyle.border }}
          {...register("name", { required: "请输入姓名" })}
        />
        {errors.name && <p style={errorStyle}>{errors.name.message}</p>}

        {/* 年龄 */}
        <label style={labelStyle}>年龄</label>
        <input
          type="number"
          placeholder="请输入年龄"
          style={{ ...inputStyle, border: errors.age ? "1px solid red" : inputStyle.border }}
          {...register("age", {
            valueAsNumber: true,
            min: { value: 0, message: "年龄不能小于0" },
            max: { value: 120, message: "年龄不能超过120" }
          })}
        />
        {errors.age && <p style={errorStyle}>{errors.age.message}</p>}

        {/* 邮箱 */}
        <label style={labelStyle}>邮箱 *</label>
        <input
          type="email"
          placeholder="example@email.com"
          style={{ ...inputStyle, border: errors.email ? "1px solid red" : inputStyle.border }}
          {...register("email", {
            required: "请输入邮箱",
            pattern: {
              value: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/,
              message: "邮箱格式不正确"
            }
          })}
        />
        {errors.email && <p style={errorStyle}>{errors.email.message}</p>}

        {/* 生日 */}
        <label style={labelStyle}>生日</label>
        <input
          type="date"
          style={inputStyle}
          {...register("birthday", { valueAsDate: true })}
        />

        {/* 性别 */}
        <div style={labelStyle}>
          性别：
          <label style={{ marginLeft: 10 }}>
            <input type="radio" value="male" {...register("gender")} /> 男
          </label>
          <label style={{ marginLeft: 10 }}>
            <input type="radio" value="female" {...register("gender")} /> 女
          </label>
          <label style={{ marginLeft: 10 }}>
            <input type="radio" value="other" {...register("gender")} /> 其他
          </label>
        </div>

        {/* 城市 */}
        <label style={labelStyle}>所在城市 *</label>
        <select
          style={{ ...inputStyle, border: errors.city ? "1px solid red" : inputStyle.border }}
          {...register("city", { required: "请选择城市" })}
        >
          <option value="">请选择城市</option>
          <option value="beijing">北京</option>
          <option value="shanghai">上海</option>
          <option value="guangzhou">广州</option>
          <option value="shenzhen">深圳</option>
          <option value="hangzhou">杭州</option>
        </select>
        {errors.city && <p style={errorStyle}>{errors.city.message}</p>}

        {/* 爱好 */}
        <div style={labelStyle}>
          兴趣爱好（可多选）：
          <div style={{ marginTop: 4 }}>
            <label style={{ marginRight: 15 }}>
              <input type="checkbox" value="coding" {...register("hobbies")} /> 编程
            </label>
            <label style={{ marginRight: 15 }}>
              <input type="checkbox" value="reading" {...register("hobbies")} /> 阅读
            </label>
            <label style={{ marginRight: 15 }}>
              <input type="checkbox" value="sports" {...register("hobbies")} /> 运动
            </label>
            <label style={{ marginRight: 15 }}>
              <input type="checkbox" value="music" {...register("hobbies")} /> 音乐
            </label>
            <label>
              <input type="checkbox" value="travel" {...register("hobbies")} /> 旅行
            </label>
          </div>
        </div>

        {/* 个人简介 */}
        <label style={labelStyle}>个人简介（{bio.length}/200）</label>
        <textarea
          placeholder="介绍一下你自己..."
          rows={4}
          style={{ ...inputStyle, border: errors.bio ? "1px solid red" : inputStyle.border }}
          {...register("bio", { maxLength: { value: 200, message: "最多200字" } })}
        />
        {errors.bio && <p style={errorStyle}>{errors.bio.message}</p>}

        {/* 音量滑块 */}
        <div style={labelStyle}>
          <div>通知音量: {volume}%</div>
          <input
            type="range"
            min="0"
            max="100"
            style={{ width: "100%" }}
            {...register("volume", { valueAsNumber: true })}
          />
        </div>

        {/* 头像上传 */}
        <label style={labelStyle}>头像</label>
        <input
          type="file"
          accept="image/*"
          style={{ marginTop: 4 }}
          {...register("avatar")}
        />

        {/* 订阅 */}
        <label style={{ display: "block", marginTop: 15 }}>
          <input type="checkbox" {...register("newsletter")} />
          订阅新品通知
        </label>

        {/* 同意条款 */}
        <div style={{ marginTop: 10 }}>
          <label>
            <input
              type="checkbox"
              {...register("agree", { required: "请同意服务条款" })}
            />
            我已阅读并同意服务条款 *
          </label>
          {errors.agree && <p style={errorStyle}>{errors.agree.message}</p>}
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: 12,
            marginTop: 20,
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 16
          }}
        >
          提交
        </button>
      </form>
    </div>
  );
}
`,
  },

  {
    id: "rhf-defaults-watch-reset",
    group: "核心功能",
    icon: "⚙️",
    title: "默认值、监听与重置",
    content: `# 默认值、监听与重置

这一章介绍三个非常实用的功能：设置默认值、实时监听字段、重置表单。

---

## 设置默认值 (defaultValues)

### 方式一：useForm 配置

这是最常用的方式，在 \`useForm\` 中传入 \`defaultValues\`：

\`\`\`jsx
const { register, handleSubmit } = useForm({
  defaultValues: {
    username: "张三",
    email: "zhangsan@example.com",
    age: 25,
    gender: "male",
    newsletter: true
  }
});
\`\`\`

### 方式二：reset 方法（异步获取数据时用）

如果默认值是从 API 获取的（比如编辑表单），用 \`reset\`：

\`\`\`jsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";

function EditUserForm({ userId }) {
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    // 模拟 API 获取用户数据
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(data => {
        // 用获取到的数据填充表单
        reset(data);
      });
  }, [userId, reset]);

  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input {...register("name")} />
      <input {...register("email")} />
      <button type="submit">保存</button>
    </form>
  );
}
\`\`\`

---

## 实时监听字段 (watch)

\`watch\` 可以让你实时获取字段的值，常用于：
- 实时预览
- 条件渲染
- 联动字段

### 监听单个字段

\`\`\`jsx
const { register, watch } = useForm();

// 监听 password 字段
const password = watch("password");

return (
  <form>
    <input type="password" {...register("password")} />
    
    {/* 实时显示密码强度 */}
    {password && password.length > 0 && (
      <div>
        密码强度：
        {password.length < 6 && "弱 🔴"}
        {password.length >= 6 && password.length < 10 && "中 🟡"}
        {password.length >= 10 && "强 🟢"}
      </div>
    )}
  </form>
);
\`\`\`

### 监听多个字段

\`\`\`jsx
// 传入数组，监听多个字段
const [name, email] = watch(["name", "email"]);
\`\`\`

### 监听所有字段

\`\`\`jsx
// 不传参数，监听整个表单
const allValues = watch();
// allValues 是 { name: "...", email: "...", ... }
\`\`\`

### 带默认值的 watch

\`\`\`jsx
// 第二个参数是默认值（字段还没值时返回）
const quantity = watch("quantity", 1);
\`\`\`

⚠️ **注意**：\`watch\` 在每次值变化时都会触发重渲染。如果只需要在提交时获取值，不要用 watch！

---

## 获取值但不监听 (getValues)

如果你需要获取值，但不想触发重渲染（比如在事件处理中），用 \`getValues\`：

\`\`\`jsx
const { register, getValues } = useForm();

const handleCheck = () => {
  // 在点击按钮时获取值，不会触发重渲染
  const values = getValues();
  console.log("当前表单值:", values);
  
  // 也可以获取单个字段
  const email = getValues("email");
};

return (
  <form>
    <input {...register("email")} />
    <button type="button" onClick={handleCheck}>
      检查当前输入
    </button>
  </form>
);
\`\`\`

---

## 重置表单 (reset)

### 重置为默认值

\`\`\`jsx
const { register, handleSubmit, reset } = useForm({
  defaultValues: { name: "", email: "" }
});

const onSubmit = (data) => {
  console.log(data);
  // 提交后重置为空（默认值）
  reset();
};
\`\`\`

### 重置为指定值

\`\`\`jsx
// 重置为新的值
reset({
  name: "新名字",
  email: "new@example.com"
});
\`\`\`

### 只重置部分字段

\`\`\`jsx
// 只清空某个字段
resetField("email");

// resetField 还可以设置新的默认值
resetField("email", { defaultValue: "default@example.com" });
\`\`\`

### keep 选项

重置时可以保留某些状态：

\`\`\`jsx
reset(data, {
  keepErrors: true,      // 保留错误信息
  keepDirty: true,      // 保留脏字段标记
  keepValues: false     // 不保留值
});
\`\`\`

---

## setValue：手动设置字段值

有时候你需要手动设置某个字段的值（比如点按钮自动填充）：

\`\`\`jsx
const { register, setValue } = useForm();

const fillDemoData = () => {
  setValue("name", "张三");
  setValue("email", "zhangsan@example.com");
  setValue("age", 25);
};

return (
  <form>
    <input {...register("name")} />
    <input {...register("email")} />
    <button type="button" onClick={fillDemoData}>
      填充示例数据
    </button>
  </form>
);
\`\`\`

setValue 也可以触发验证和标记脏状态：

\`\`\`jsx
setValue("name", "李四", {
  shouldValidate: true,   // 设置后立即验证
  shouldDirty: true       // 标记为已修改
});
\`\`\`

---

## 表单状态 (formState)

\`formState\` 包含很多有用的状态：

\`\`\`jsx
const {
  register,
  handleSubmit,
  formState: {
    isSubmitting,   // 是否正在提交中
    isDirty,        // 表单是否被修改过
    dirtyFields,    // 哪些字段被修改过
    isSubmitted,    // 是否提交过
    isSubmitSuccessful, // 是否提交成功
    errors,         // 错误对象
    isValid,        // 表单是否通过验证
    isValidating,   // 是否正在验证中
    touchedFields   // 哪些字段被触碰过
  }
} = useForm();
\`\`\`

### 常用场景示例

\`\`\`jsx
// 1. 提交按钮 loading 状态
<button type="submit" disabled={isSubmitting}>
  {isSubmitting ? "提交中..." : "提交"}
</button>

// 2. 有修改时才显示"保存"按钮
{isDirty && <button type="submit">保存修改</button>}

// 3. 表单有效时才允许点击
<button type="submit" disabled={!isValid}>提交</button>
\`\`\`

---

## 条件字段

根据某个字段的值显示/隐藏其他字段：

\`\`\`jsx
function ConditionalForm() {
  const { register, watch } = useForm();
  const hasCompany = watch("hasCompany"); // 监听"是否有公司"

  return (
    <form>
      <label>
        <input type="checkbox" {...register("hasCompany")} />
        我有公司
      </label>

      {/* 只有勾选了才显示公司名称输入框 */}
      {hasCompany && (
        <div>
          <label>公司名称</label>
          <input
            {...register("companyName", {
              required: hasCompany ? "请输入公司名称" : false
            })}
          />
        </div>
      )}
    </form>
  );
}
\`\`\`

---

## 本章小结

✅ \`defaultValues\` 设置初始默认值
✅ 异步获取编辑数据用 \`reset(data)\`
✅ \`watch("字段名")\` 实时监听值（会触发重渲染）
✅ \`getValues()\` 获取值但不监听（不触发重渲染）
✅ \`reset()\` 重置表单，\`resetField()\` 重置单个字段
✅ \`setValue()\` 手动设置字段值
✅ \`formState\` 包含 \`isSubmitting\`, \`isDirty\`, \`isValid\` 等实用状态
✅ \`watch\` + 条件渲染可以实现联动字段

下一章学习如何与 UI 组件库（MUI/AntD等）集成！`,
    code: `import { useForm } from "react-hook-form";

// 默认值、watch监听、重置示例
export default function WatchResetDemo() {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    getValues,
    resetField,
    formState: { isDirty, isSubmitting, errors, touchedFields }
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      age: 18,
      bio: "",
      newsletter: true
    },
    mode: "onBlur"
  });

  const onSubmit = async (data) => {
    // 模拟提交
    await new Promise(r => setTimeout(r, 1000));
    console.log("提交数据:", data);
    alert("提交成功！\\n" + JSON.stringify(data, null, 2));
    // 提交后重置表单
    reset();
  };

  // 实时监听
  const firstName = watch("firstName");
  const bio = watch("bio") || "";
  const age = watch("age");

  const fillDemo = () => {
    setValue("firstName", "三");
    setValue("lastName", "张");
    setValue("email", "zhangsan@example.com");
    setValue("age", 28);
    setValue("bio", "一名热爱编程的开发者");
  };

  const showCurrentValues = () => {
    alert("当前表单值：\\n" + JSON.stringify(getValues(), null, 2));
  };

  const inputStyle = {
    width: "100%",
    padding: 8,
    marginTop: 4,
    border: "1px solid #ddd",
    borderRadius: 4,
    boxSizing: "border-box"
  };
  const btnStyle = {
    padding: "8px 16px",
    borderRadius: 4,
    border: "none",
    cursor: "pointer",
    fontSize: 14
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 20 }}>
      <h2>⚙️ 默认值 / 监听 / 重置</h2>

      {/* 实时预览区 */}
      <div style={{
        background: "#f5f5f5",
        padding: 12,
        borderRadius: 4,
        marginBottom: 20,
        fontSize: 14
      }}>
        <strong>👀 实时预览：</strong>
        <div style={{ marginTop: 8 }}>
          姓名：{firstName || "（未输入）"}<br/>
          年龄：{age}<br/>
          简介字数：{bio.length}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label>姓</label>
            <input style={inputStyle} {...register("lastName")} />
          </div>
          <div style={{ flex: 1 }}>
            <label>名 *</label>
            <input
              style={{ ...inputStyle, border: errors.firstName ? "1px solid red" : inputStyle.border }}
              {...register("firstName", { required: "请输入名" })}
            />
            {errors.firstName && <p style={{ color: "red", fontSize: 12, margin: "4px 0 0" }}>{errors.firstName.message}</p>}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label>邮箱 *</label>
          <input
            type="email"
            style={{ ...inputStyle, border: errors.email ? "1px solid red" : inputStyle.border }}
            {...register("email", { required: "请输入邮箱" })}
          />
          {errors.email && <p style={{ color: "red", fontSize: 12, margin: "4px 0 0" }}>{errors.email.message}</p>}
        </div>

        <div style={{ marginTop: 12 }}>
          <label>年龄</label>
          <input
            type="number"
            style={inputStyle}
            {...register("age", { valueAsNumber: true, min: 0, max: 120 })}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label>简介（{bio.length}/200）</label>
          <textarea
            rows={3}
            style={{ ...inputStyle, border: errors.bio ? "1px solid red" : inputStyle.border }}
            {...register("bio", { maxLength: { value: 200, message: "最多200字" } })}
          />
          {errors.bio && <p style={{ color: "red", fontSize: 12, margin: "4px 0 0" }}>{errors.bio.message}</p>}
        </div>

        <label style={{ display: "block", marginTop: 12 }}>
          <input type="checkbox" {...register("newsletter")} />
          订阅邮件通知
        </label>

        {/* 按钮区 */}
        <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{ ...btnStyle, background: "#007bff", color: "white" }}
          >
            {isSubmitting ? "提交中..." : "提交"}
          </button>

          <button
            type="button"
            onClick={fillDemo}
            style={{ ...btnStyle, background: "#28a745", color: "white" }}
          >
            填充示例
          </button>

          <button
            type="button"
            onClick={() => reset()}
            style={{ ...btnStyle, background: "#ffc107", color: "black" }}
          >
            重置全部
          </button>

          <button
            type="button"
            onClick={() => resetField("email")}
            style={{ ...btnStyle, background: "#6c757d", color: "white" }}
          >
            只清空邮箱
          </button>

          <button
            type="button"
            onClick={showCurrentValues}
            style={{ ...btnStyle, background: "#17a2b8", color: "white" }}
          >
            查看当前值
          </button>
        </div>

        {/* 状态提示 */}
        <div style={{ marginTop: 15, fontSize: 13, color: "#666" }}>
          {isDirty && <span style={{ color: "orange" }}>● 表单已修改</span>}
        </div>
      </form>
    </div>
  );
}
`,
  },
];
