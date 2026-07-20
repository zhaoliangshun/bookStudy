// =============================================================
// Mantine 从入门到精通大全 - 第五批章节（第五部分 表单输入，共 7 章）
// -------------------------------------------------------------
// 本批包含：
//   mantine2-ch18 : 第十八章 TextInput/Textarea/PasswordInput 文本输入
//   mantine2-ch19 : 第十九章 NumberInput/Checkbox/Radio/Switch
//   mantine2-ch20 : 第二十章 Select/MultiSelect 下拉选择
//   mantine2-ch21 : 第二十一章 TagsInput/Autocomplete/Combobox
//   mantine2-ch22 : 第二十二章 Slider/RangeSlider/Rating 滑块与评分
//   mantine2-ch23 : 第二十三章 SegmentedControl/Chip 分段控件
//   mantine2-ch24 : 第二十四章 DatePicker/DateInput/TimeInput 日期时间
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：Mantine v9 / React 19 / Next.js 16
// =============================================================

const chapters = [
  // ============================================================
  // 第十八章 TextInput/Textarea/PasswordInput
  // ============================================================
  {
    id: 'mantine2-ch18',
    group: '第五部分 表单输入',
    icon: '✍️',
    title: '第十八章 TextInput/Textarea/PasswordInput 文本输入',
    content: `## 一句话目标

掌握 Mantine 三大文本输入组件——\`TextInput\` 单行、\`Textarea\` 多行、\`PasswordInput\` 密码，搞定登录、注册、评论、备注等 90% 的文本输入场景。

---

## 一、TextInput 的核心 props

\`TextInput\` 是用得最多的输入框。先看它的核心 props：

\`\`\`jsx
'use client';
import { TextInput, Stack, Group } from '@mantine/core';

export default function Demo() {
  return (
    <Stack gap="md">
      {/* 1. label：字段名（显示在输入框上方）
          description：辅助说明（灰色，显示在 label 下）
          placeholder：占位符（输入框内浅色文字） */}
      <TextInput
        label="用户名"
        description="3-20 个字符，支持字母数字下划线"
        placeholder="请输入用户名"
      />

      {/* 2. error：错误提示（红色文字，输入框边框也会变红）
          传字符串显示错误，传 false/undefined 不显示 */}
      <TextInput
        label="邮箱"
        placeholder="you@example.com"
        error="邮箱格式不正确"
      />

      {/* 3. size：尺寸（xs/sm/md/lg/xl）
          影响输入框高度、字号、内边距 */}
      <TextInput label="小号" placeholder="xs" size="xs" />
      <TextInput label="大号" placeholder="lg" size="lg" />

      {/* 4. radius：圆角（xs/sm/md/lg/xl） */}
      <TextInput label="圆角" placeholder="xl 圆角" radius="xl" />

      {/* 5. withAsterisk：在 label 前显示红色星号（仅视觉提示）
          注意：它不会真的做校验，只是告诉用户「这是必填」 */}
      <TextInput
        label="手机号"
        withAsterisk
        placeholder="请输入手机号"
      />
    </Stack>
  );
}
\`\`\`

> ⭐ \`label\` + \`description\` + \`error\` + \`placeholder\` 是输入框四件套，记住这四个就能搭出像样的表单。

---

## 二、leftSection / rightSection：左右插槽

输入框左右两侧可以放图标、按钮、文字：

\`\`\`jsx
'use client';
import { TextInput, Group } from '@mantine/core';
import {
  IconSearch,
  IconAt,
  IconEye,
  IconCurrencyYuan,
} from '@tabler/icons-react';

export default function Demo() {
  return (
    <Group grow>
      {/* leftSection：左侧内容（通常是图标） */}
      <TextInput
        label="搜索"
        placeholder="搜索商品..."
        leftSection={<IconSearch size={16} />}
      />

      {/* rightSection：右侧内容（如单位、操作按钮） */}
      <TextInput
        label="价格"
        placeholder="0.00"
        // 左侧放人民币符号
        leftSection={<IconCurrencyYuan size={16} />}
        // 右侧放单位
        rightSection={<span style={{ fontSize: 12 }}>元</span>}
      />

      {/* 邮箱前缀 @ */}
      <TextInput
        label="邮箱"
        placeholder="hello"
        leftSection={<IconAt size={16} />}
        rightSection={<span style={{ fontSize: 12 }}>@qq.com</span>}
      />
    </Group>
  );
}
\`\`\`

**为什么用 \`leftSection\` 而不是手动加 \`position: absolute\`？**

因为 Mantine 会自动处理输入框的 \`padding-left\`——保证文字不会被图标盖住，且暗色模式下图标颜色也自动适配。

---

## 三、inputWrapperOrder：调整布局顺序

默认顺序是 \`label → description → input → error\`，可以用 \`inputWrapperOrder\` 调整：

\`\`\`jsx
'use client';
import { TextInput } from '@mantine/core';

export default function Demo() {
  return (
    <TextInput
      label="用户名"
      description="3-20 个字符"
      placeholder="请输入"
      error="该用户名已被占用"
      // 把错误提示放到了输入框上方（label 下方）
      inputWrapperOrder={['label', 'description', 'error', 'input']}
    />
  );
}
\`\`\`

---

## 四、required / disabled / readOnly

\`\`\`jsx
'use client';
import { TextInput, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack gap="md">
      {/* required：等价于 withAsterisk + 原生 required 属性
          提交表单时浏览器会弹出「请填写此字段」 */}
      <TextInput label="必填" required placeholder="必须填" />

      {/* disabled：禁用（灰色，不可点击） */}
      <TextInput label="禁用" disabled placeholder="不可编辑" defaultValue="张三" />

      {/* readOnly：只读（不灰，可聚焦可选中，但不可改） */}
      <TextInput label="只读" readOnly defaultValue="ID: 12345" />

      {/* variant="unstyled"：完全去掉样式（只剩 input） */}
      <TextInput variant="unstyled" placeholder="无样式输入框" />
    </Stack>
  );
}
\`\`\`

**required vs withAsterisk 的区别：**

- \`required\`：显示星号 + 加原生 \`required\` 属性（参与表单原生校验）
- \`withAsterisk\`：只显示星号，不加 \`required\` 属性（纯视觉）

---

## 五、受控与非受控

\`\`\`jsx
'use client';
import { useState } from 'react';
import { TextInput, Stack, Text, Code } from '@mantine/core';

export default function Demo() {
  const [value, setValue] = useState('');

  return (
    <Stack gap="md">
      {/* 受控组件：value + onChange 配合 state
          适合需要实时读取输入值的场景 */}
      <TextInput
        label="受控输入"
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        placeholder="输入内容会实时显示在下方"
      />
      <Text>当前值：<Code>{value || '(空)'}</Code></Text>

      {/* 非受控组件：defaultValue 设初值，之后由 DOM 自己管
          适合提交时才读值的简单场景，性能更好 */}
      <TextInput
        label="非受控输入"
        defaultValue="默认值"
        placeholder="不会被 state 控制"
      />
    </Stack>
  );
}
\`\`\`

> ⭐ **选择原则**：需要实时联动用受控，提交时一次性读取用非受控。复杂表单推荐用 \`useForm\`（后面章节讲）。

---

## 六、Textarea：多行文本

\`\`\`jsx
'use client';
import { Textarea, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack gap="md">
      {/* 基础用法 */}
      <Textarea
        label="简介"
        placeholder="介绍一下你自己..."
        description="最多 200 字"
      />

      {/* autosize：自动高度（输入越多越高）
          minRows：最少显示行数
          maxRows：最多显示行数（超出滚动） */}
      <Textarea
        label="评论"
        placeholder="说点什么..."
        autosize
        minRows={3}
        maxRows={8}
      />

      {/* 固定行数（不自动高度） */}
      <Textarea
        label="备注"
        placeholder="备注信息"
        rows={5}
      />

      {/* 带字符计数（用 rightSection 实现） */}
      <Textarea
        label="内容"
        placeholder="输入内容"
        autosize
        minRows={3}
        rightSection={<div style={{ fontSize: 11, padding: 4 }}>0/100</div>}
      />
    </Stack>
  );
}
\`\`\`

---

## 七、PasswordInput：密码输入

\`\`\`jsx
'use client';
import { useState } from 'react';
import { PasswordInput, Stack, Button, Text } from '@mantine/core';

export default function Demo() {
  const [pwd, setPwd] = useState('');

  return (
    <Stack gap="md">
      {/* 基础用法：自带「显示/隐藏密码」按钮 */}
      <PasswordInput
        label="密码"
        placeholder="请输入密码"
        value={pwd}
        onChange={(e) => setPwd(e.currentTarget.value)}
      />

      {/* visibilityToggleButton：控制是否显示切换按钮
          { reveal: true }：始终显示
          { reveal: false }：不显示（自己控制） */}
      <PasswordInput
        label="无切换按钮"
        placeholder="不能切换显示"
        visibilityToggleButton={{ reveal: false }}
      />

      {/* 自定义可见/不可见图标 */}
      <PasswordInput
        label="自定义图标"
        placeholder="点击眼睛切换"
        // visibilityToggleButton.props 可以传给按钮的额外 props
        visibilityToggleButton={{ label: '切换密码可见' }}
      />

      <Text>当前密码：{pwd ? '*'.repeat(pwd.length) : '(空)'}</Text>
    </Stack>
  );
}
\`\`\`

**为什么不用 \`<input type="password">\`？**

因为原生的「显示密码」功能需要自己写 state + 图标 + 切换逻辑，\`PasswordInput\` 全部内置好了，还支持键盘焦点管理。

---

## 八、完整表单示例

\`\`\`jsx
'use client';
import { useState } from 'react';
import { TextInput, Textarea, PasswordInput, Button, Stack, Group, Text } from '@mantine/core';

export default function RegisterForm() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    bio: '',
  });

  // 通用更新函数：用 field 名作为动态 key
  const update = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.currentTarget.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // 提交时一次性读取所有字段
    console.log('提交：', form);
    alert('注册成功！');
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
      <Stack gap="md">
        <TextInput
          label="用户名"
          placeholder="3-20 字符"
          required
          value={form.username}
          onChange={update('username')}
        />
        <TextInput
          label="邮箱"
          type="email"
          placeholder="you@example.com"
          required
          leftSection={<span>@</span>}
          value={form.email}
          onChange={update('email')}
        />
        <PasswordInput
          label="密码"
          placeholder="至少 6 位"
          required
          value={form.password}
          onChange={update('password')}
        />
        <Textarea
          label="个人简介"
          placeholder="可选，介绍一下自己"
          autosize
          minRows={3}
          value={form.bio}
          onChange={update('bio')}
        />
        <Group justify="flex-end">
          <Button type="submit">注册</Button>
        </Group>
        <Text size="xs" c="dimmed">当前用户名：{form.username || '(未填)'}</Text>
      </Stack>
    </form>
  );
}
\`\`\`

---

## 小结

| 组件 | 用途 | 关键 props |
| --- | --- | --- |
| \`TextInput\` | 单行文本 | label / description / error / placeholder / size / radius |
| \`Textarea\` | 多行文本 | autosize / minRows / maxRows / rows |
| \`PasswordInput\` | 密码 | visibilityToggleButton |
| 通用插槽 | 左右内容 | leftSection / rightSection |
| 状态控制 | 受控/非受控 | value / defaultValue / onChange |
| 视觉状态 | 必填/禁用/只读 | required / disabled / readOnly / withAsterisk |

下一章我们学习数字、勾选、单选、开关这四类常用控件。`,
  },

  // ============================================================
  // 第十九章 NumberInput/Checkbox/Radio/Switch
  // ============================================================
  {
    id: 'mantine2-ch19',
    group: '第五部分 表单输入',
    icon: '🔢',
    title: '第十九章 NumberInput/Checkbox/Radio/Switch',
    content: `## 一句话目标

掌握数字输入、复选框、单选框、开关四种基础表单控件，覆盖数量、勾选、单选、开关等所有「点选类」场景。

---

## 一、NumberInput：数字输入

\`\`\`jsx
'use client';
import { NumberInput, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack gap="md">
      {/* 基础用法：只能输入数字，自带加减按钮 */}
      <NumberInput label="数量" placeholder="请输入数量" />

      {/* min/max：最小最大值
          step：每次点击加减按钮的步长 */}
      <NumberInput
        label="年龄"
        placeholder="0-120"
        min={0}
        max={120}
        step={1}
      />

      {/* 小数：precision 控制小数位数
          step 可以是小数 */}
      <NumberInput
        label="价格"
        placeholder="0.00"
        precision={2}
        step={0.01}
        min={0}
      />

      {/* suffix/prefix：前后缀（不是 leftSection，是直接拼接在数字旁） */}
      <NumberInput
        label="月薪"
        placeholder="10000"
        prefix="¥"
        suffix="元"
        step={1000}
      />

      {/* thousandSeparator：千分位分隔符（默认逗号） */}
      <NumberInput
        label="年薪"
        placeholder="100000"
        prefix="¥"
        thousandSeparator=","
      />

      {/* holdOnClick / 不显示加减按钮：hideControls */}
      <NumberInput
        label="隐藏控制按钮"
        placeholder="纯输入"
        hideControls
      />
    </Stack>
  );
}
\`\`\`

---

## 二、parser 与 formatter：自定义解析与格式化

\`parser\` 把输入框的字符串转成数字，\`formatter\` 把数字转成显示字符串：

\`\`\`jsx
'use client';
import { NumberInput } from '@mantine/core';

export default function Demo() {
  return (
    <NumberInput
      label="百分比"
      placeholder="50"
      // formatter：数字 → 显示字符串
      // 例如 0.5 显示为 "50%"
      formatter={(value) => {
        if (!value && value !== 0) return '';
        return \`\${value * 100}%\`;
      }}
      // parser：显示字符串 → 数字
      // 例如 "50%" 解析为 0.5
      parser={(valueString) => {
        const cleaned = valueString.replace(/%$/, '').trim();
        const num = parseFloat(cleaned);
        return Number.isNaN(num) ? '' : num / 100;
      }}
      min={0}
      max={1}
      step={0.01}
      precision={2}
    />
  );
}
\`\`\`

> ⭐ \`parser/formatter\` 让你能实现「带千分位、带单位、带特殊格式」的数字输入——比 \`prefix/suffix\` 更灵活，因为前者参与值本身，后者只是装饰。

---

## 三、Checkbox：复选框

\`\`\`jsx
'use client';
import { Checkbox, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack gap="md">
      {/* 基础用法：label 是右侧文字 */}
      <Checkbox label="同意用户协议" defaultChecked />

      {/* size / color / radius */}
      <Checkbox label="红色" color="red" size="lg" radius="xl" />

      {/* description：副文字 */}
      <Checkbox
        label="接收营销邮件"
        description="我们不会泄露你的邮箱"
        defaultChecked
      />

      {/* indeterminate：半选状态（全选/反选场景用） */}
      <Checkbox label="全选" indeterminate />

      {/* disabled / readOnly */}
      <Checkbox label="禁用" disabled />
      <Checkbox label="只读" readOnly checked />
    </Stack>
  );
}
\`\`\`

---

## 四、Checkbox.Group：多选组

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Checkbox, Stack, Text, Code } from '@mantine/core';

export default function Demo() {
  const [values, setValues] = useState(['react']);

  // 数据：要勾选的技能
  const skills = [
    { label: 'React', value: 'react' },
    { label: 'Vue', value: 'vue' },
    { label: 'Angular', value: 'angular' },
    { label: 'Svelte', value: 'svelte' },
  ];

  return (
    <Stack>
      {/* Checkbox.Group：管理一组 Checkbox 的选中状态
          value：选中值数组
          onChange：变化回调
          label/description：组级别的说明
          orientation：水平或垂直 */}
      <Checkbox.Group
        label="你掌握的技能"
        description="可多选"
        value={values}
        onChange={setValues}
        orientation="vertical"
      >
        <Stack gap="xs" mt="xs">
          {skills.map((s) => (
            <Checkbox key={s.value} label={s.label} value={s.value} />
          ))}
        </Stack>
      </Checkbox.Group>

      <Text>选中：<Code>{JSON.stringify(values)}</Code></Text>
    </Stack>
  );
}
\`\`\`

---

## 五、Radio 与 Radio.Group

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Radio, Stack, Text, Code } from '@mantine/core';

export default function Demo() {
  const [gender, setGender] = useState('male');

  return (
    <Stack>
      {/* Radio.Group：管理一组单选
          name：原生 input name（提交表单用）
          value/onChange：受控 */}
      <Radio.Group
        label="性别"
        name="gender"
        value={gender}
        onChange={setGender}
        description="单选"
      >
        <Stack gap="xs" mt="xs">
          {/* Radio 的 label/description 都是单选按钮的描述 */}
          <Radio value="male" label="男" description="男生" />
          <Radio value="female" label="女" description="女生" />
          <Radio value="other" label="其他" />
        </Stack>
      </Radio.Group>

      <Text>选中：<Code>{gender}</Code></Text>

      {/* 简化版：用 Radio.Group + 数据数组 */}
      <Radio.Group label="喜欢的颜色" defaultValue="blue">
        <Stack gap="xs" mt="xs">
          <Radio value="red" label="红" />
          <Radio value="blue" label="蓝" />
          <Radio value="green" label="绿" />
        </Stack>
      </Radio.Group>
    </Stack>
  );
}
\`\`\`

---

## 六、Switch：开关

\`\`\`jsx
'use client';
import { Switch, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack gap="md">
      {/* 基础用法 */}
      <Switch label="接收通知" defaultChecked />

      {/* size / color */}
      <Switch label="大号紫色" size="lg" color="violet" defaultChecked />

      {/* onLabel/offLabel：开关两端的文字 */}
      <Switch
        label="启用"
        size="lg"
        onLabel="ON"
        offLabel="OFF"
        defaultChecked
      />

      {/* description：副说明 */}
      <Switch
        label="夜间模式"
        description="晚上 10 点后自动切换"
        defaultChecked
      />

      {/* 带左侧图标：用 thumbIcon 或 leftSection */}
      <Switch
        label="带图标"
        defaultChecked
        color="grape"
      />
    </Stack>
  );
}
\`\`\`

---

## 七、实战：设置表单

\`\`\`jsx
'use client';
import { useState } from 'react';
import {
  NumberInput,
  Checkbox,
  Radio,
  Switch,
  Stack,
  Group,
  Button,
  Text,
  Code,
  Divider,
} from '@mantine/core';

export default function SettingsForm() {
  const [settings, setSettings] = useState({
    volume: 50,
    theme: 'light',
    notifications: ['email'],
    autoUpdate: true,
    nightMode: false,
  });

  const update = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Stack gap="lg" style={{ maxWidth: 480 }}>
      {/* 1. 音量：数字输入 */}
      <NumberInput
        label="音量"
        description="0-100"
        value={settings.volume}
        onChange={(val) => update('volume', val ?? 0)}
        min={0}
        max={100}
        suffix="%"
      />

      <Divider />

      {/* 2. 主题：单选 */}
      <Radio.Group
        label="主题"
        value={settings.theme}
        onChange={(val) => update('theme', val)}
      >
        <Stack gap="xs" mt="xs">
          <Radio value="light" label="亮色" />
          <Radio value="dark" label="暗色" />
          <Radio value="auto" label="跟随系统" />
        </Stack>
      </Radio.Group>

      <Divider />

      {/* 3. 通知渠道：多选 */}
      <Checkbox.Group
        label="通知渠道"
        value={settings.notifications}
        onChange={(val) => update('notifications', val)}
      >
        <Stack gap="xs" mt="xs">
          <Checkbox value="email" label="邮件" />
          <Checkbox value="sms" label="短信" />
          <Checkbox value="push" label="推送" />
        </Stack>
      </Checkbox.Group>

      <Divider />

      {/* 4. 开关组 */}
      <Stack gap="md">
        <Switch
          label="自动更新"
          checked={settings.autoUpdate}
          onChange={(e) => update('autoUpdate', e.currentTarget.checked)}
        />
        <Switch
          label="夜间模式"
          checked={settings.nightMode}
          onChange={(e) => update('nightMode', e.currentTarget.checked)}
        />
      </Stack>

      <Group justify="space-between">
        <Button variant="default">重置</Button>
        <Button onClick={() => alert('保存成功')}>保存设置</Button>
      </Group>

      <Text size="xs" c="dimmed">
        当前配置：<Code>{JSON.stringify(settings)}</Code>
      </Text>
    </Stack>
  );
}
\`\`\`

---

## 小结

| 组件 | 用途 | 关键 props |
| --- | --- | --- |
| \`NumberInput\` | 数字输入 | min/max/step/precision/prefix/suffix/parser/formatter |
| \`Checkbox\` | 单个复选框 | label/description/indeterminate/color |
| \`Checkbox.Group\` | 多选组 | value/onChange/orientation |
| \`Radio.Group\` | 单选组 | value/onChange/name |
| \`Switch\` | 开关 | onLabel/offLabel/color/size |

下一章我们学习下拉选择——Select 与 MultiSelect，处理选项多到不适合用 Radio 的场景。`,
  },

  // ============================================================
  // 第二十章 Select/MultiSelect
  // ============================================================
  {
    id: 'mantine2-ch20',
    group: '第五部分 表单输入',
    icon: '📋',
    title: '第二十章 Select/MultiSelect 下拉选择',
    content: `## 一句话目标

掌握 Mantine 的下拉选择组件——\`Select\` 单选、\`MultiSelect\` 多选，处理省市级联、标签选择、分类筛选等场景。

---

## 一、Select 的 data 格式

\`Select\` 最关键的 prop 是 \`data\`——选项数组：

\`\`\`jsx
'use client';
import { Select } from '@mantine/core';

export default function Demo() {
  // 格式 1：字符串数组（最简单，label 和 value 一样）
  const simpleData = ['苹果', '香蕉', '橘子'];

  // 格式 2：对象数组（label 和 value 分开，最常用）
  // value 是提交给后端的值，label 是显示给用户的文字
  const objectData = [
    { value: 'apple', label: '苹果' },
    { value: 'banana', label: '香蕉' },
    { value: 'orange', label: '橘子' },
  ];

  // 格式 3：分组（用 group 字段）
  const groupedData = [
    { group: '水果', items: [
      { value: 'apple', label: '苹果' },
      { value: 'banana', label: '香蕉' },
    ]},
    { group: '蔬菜', items: [
      { value: 'tomato', label: '番茄' },
      { value: 'cucumber', label: '黄瓜' },
    ]},
  ];

  return (
    <>
      <Select label="简单" data={simpleData} placeholder="选一个" />
      <Select label="对象" data={objectData} placeholder="选一个" mt="md" />
      <Select label="分组" data={groupedData} placeholder="选一个" mt="md" />
    </>
  );
}
\`\`\`

> ⭐ 实际开发 90% 用「对象数组」——\`value\` 给后端，\`label\` 给用户看。

---

## 二、searchable / clearable / nothingFoundMessage

\`\`\`jsx
'use client';
import { Select, Stack } from '@mantine/core';

export default function Demo() {
  const data = Array.from({ length: 20 }, (_, i) => ({
    value: String(i + 1),
    label: \`选项 \${i + 1}\`,
  }));

  return (
    <Stack gap="md">
      {/* searchable：开启搜索功能
          选项多时必开 */}
      <Select
        label="可搜索"
        data={data}
        searchable
        placeholder="搜索..."
      />

      {/* clearable：显示清除按钮 */}
      <Select
        label="可清除"
        data={data}
        clearable
        placeholder="选一个"
        defaultValue="1"
      />

      {/* nothingFoundMessage：搜索没结果时的提示 */}
      <Select
        label="无结果提示"
        data={data}
        searchable
        nothingFoundMessage="没找到相关选项"
        placeholder="搜个不存在的试试"
      />

      {/* 组合：搜索 + 清除 + 无结果提示 */}
      <Select
        label="完整版"
        data={data}
        searchable
        clearable
        nothingFoundMessage="无匹配项"
        maxDropdownHeight={200}
        placeholder="搜索并选择"
      />
    </Stack>
  );
}
\`\`\`

---

## 三、左侧图标、右侧内容、自定义渲染

\`\`\`jsx
'use client';
import { Select, Stack } from '@mantine/core';
import {
  IconUser,
  IconHeart,
  IconStar,
  IconBolt,
} from '@tabler/icons-react';

export default function Demo() {
  const data = [
    // leftSection：每个选项左侧的图标
    { value: 'user', label: '用户', leftSection: <IconUser size={16} /> },
    { value: 'heart', label: '收藏', leftSection: <IconHeart size={16} /> },
    { value: 'star', label: '评分', leftSection: <IconStar size={16} /> },
    { value: 'bolt', label: '速度', leftSection: <IconBolt size={16} /> },
  ];

  return (
    <Stack gap="md">
      {/* 选项级别的 leftSection */}
      <Select
        label="带图标的选择"
        data={data}
        placeholder="选一个"
        searchable
      />

      {/* Select 组件级别的 leftSection（在输入框左侧） */}
      <Select
        label="输入框带图标"
        data={data}
        placeholder="选一个"
        leftSection={<IconUser size={16} />}
      />

      {/* rightSection：右侧内容（如下拉箭头自定义） */}
      <Select
        label="右侧内容"
        data={data}
        placeholder="选一个"
        rightSection={<span style={{ fontSize: 10, color: '#888' }}>▼</span>}
      />

      {/* renderOption：完全自定义每个选项的渲染
          v9 新增 API，返回 React 节点 */}
      <Select
        label="自定义渲染选项"
        data={data}
        placeholder="看，每项都带描述了"
        renderOption={({ option }) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {option.leftSection}
            <div>
              <div>{option.label}</div>
              <div style={{ fontSize: 11, color: '#888' }}>
                值：{option.value}
              </div>
            </div>
          </div>
        )}
      />
    </Stack>
  );
}
\`\`\`

---

## 四、creatable / limit / maxDropdownHeight

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Select, Stack, Text, Code } from '@mantine/core';

export default function Demo() {
  const [data, setData] = useState([
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'angular', label: 'Angular' },
  ]);
  const [value, setValue] = useState(null);

  return (
    <Stack gap="md">
      {/* creatable：允许创建新选项
          getCreateLabel：输入新值时显示的提示文字（参数是输入的文本） */}
      <Select
        label="可创建新选项"
        data={data}
        value={value}
        onChange={setValue}
        searchable
        creatable
        getCreateLabel={(query) => \`+ 创建 "\${query}"\`}
        onCreate={(newVal) => {
          // 创建新项时调用：把新项加入 data
          const item = { value: newVal.toLowerCase(), label: newVal };
          setData((prev) => [...prev, item]);
          return item; // 必须返回新建的 item
        }}
        placeholder="搜不到就创建"
      />

      <Text>当前选中：<Code>{value ?? '(无)'}</Code></Text>

      {/* limit：最多显示多少条结果（默认无穷） */}
      <Select
        label="限制显示条数"
        data={Array.from({ length: 50 }, (_, i) => ({
          value: String(i),
          label: \`选项 \${i + 1}\`,
        }))}
        searchable
        limit={5}
        placeholder="搜索时只显示前 5 条"
      />
    </Stack>
  );
}
\`\`\`

---

## 五、MultiSelect：多选

\`\`\`jsx
'use client';
import { useState } from 'react';
import { MultiSelect, Stack, Text, Code } from '@mantine/core';

export default function Demo() {
  const [values, setValues] = useState([]);

  const data = [
    { value: 'js', label: 'JavaScript' },
    { value: 'ts', label: 'TypeScript' },
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'angular', label: 'Angular' },
    { value: 'svelte', label: 'Svelte' },
  ];

  return (
    <Stack gap="md">
      {/* 基础多选 */}
      <MultiSelect
        label="你掌握的技能"
        data={data}
        placeholder="选多个"
        searchable
        clearable
        value={values}
        onChange={setValues}
      />

      <Text>选中：<Code>{JSON.stringify(values)}</Code></Text>

      {/* maxValues：最多选几个 */}
      <MultiSelect
        label="最多选 3 个"
        data={data}
        maxValues={3}
        searchable
        placeholder="最多选 3 个"
      />

      {/* valueFormatter：自定义选中后输入框里显示的文字
          比如显示「已选 N 项」而不是一堆标签 */}
      <MultiSelect
        label="自定义显示"
        data={data}
        placeholder="选几个看看"
        valueFormatter={(value) =>
          value.length > 2 ? \`已选 \${value.length} 项\` : value.join(', ')
        }
      />

      {/* hidePickedOptions：选中后从下拉列表隐藏
          适合「不能重复选」的场景 */}
      <MultiSelect
        label="选中后隐藏"
        data={data}
        hidePickedOptions
        placeholder="选过的就不显示了"
        searchable
      />
    </Stack>
  );
}
\`\`\`

---

## 六、实战：省市级联

\`\`\`jsx
'use client';
import { useState, useMemo } from 'react';
import { Select, Stack, Text, Code } from '@mantine/core';

// 省市级联数据
const regionData = {
  guangdong: [
    { value: 'gz', label: '广州' },
    { value: 'sz', label: '深圳' },
    { value: 'fs', label: '佛山' },
  ],
  jiangsu: [
    { value: 'nj', label: '南京' },
    { value: 'sz', label: '苏州' },
    { value: 'wx', label: '无锡' },
  ],
  zhejiang: [
    { value: 'hz', label: '杭州' },
    { value: 'nb', label: '宁波' },
    { value: 'wz', label: '温州' },
  ],
};

const provinces = [
  { value: 'guangdong', label: '广东省' },
  { value: 'jiangsu', label: '江苏省' },
  { value: 'zhejiang', label: '浙江省' },
];

export default function CityCascader() {
  const [province, setProvince] = useState(null);
  const [city, setCity] = useState(null);

  // 根据省计算城市列表
  const cities = useMemo(() => {
    if (!province) return [];
    return regionData[province] || [];
  }, [province]);

  const handleProvinceChange = (val) => {
    setProvince(val);
    // 切换省份时清空城市
    setCity(null);
  };

  return (
    <Stack gap="md" style={{ maxWidth: 320 }}>
      <Select
        label="省份"
        data={provinces}
        value={province}
        onChange={handleProvinceChange}
        placeholder="请选择省份"
        searchable
        clearable
      />
      <Select
        label="城市"
        data={cities}
        value={city}
        onChange={setCity}
        placeholder={province ? '请选择城市' : '请先选择省份'}
        searchable
        clearable
        // 没选省份时禁用城市选择
        disabled={!province}
      />
      <Text size="sm" c="dimmed">
        当前选择：
        <Code>
          {province ?? '(未选省)'} / {city ?? '(未选市)'}
        </Code>
      </Text>
    </Stack>
  );
}
\`\`\`

---

## 小结

| 组件/prop | 作用 |
| --- | --- |
| \`Select\` | 单选下拉 |
| \`MultiSelect\` | 多选下拉 |
| \`data\` | 选项数组（字符串 / 对象 / 分组） |
| \`searchable\` | 开启搜索 |
| \`clearable\` | 显示清除按钮 |
| \`creatable\` | 允许创建新选项 |
| \`maxValues\` | MultiSelect 最多选几个 |
| \`limit\` | 最多显示多少条搜索结果 |
| \`renderOption\` | 自定义选项渲染 |
| \`valueFormatter\` | MultiSelect 自定义显示文字 |
| \`hidePickedOptions\` | 选中后从列表隐藏 |

下一章我们学习更灵活的输入：TagsInput、Autocomplete 和 Combobox。`,
  },

  // ============================================================
  // 第二十一章 TagsInput/Autocomplete/Combobox
  // ============================================================
  {
    id: 'mantine2-ch21',
    group: '第五部分 表单输入',
    icon: '🏷️',
    title: '第二十一章 TagsInput/Autocomplete/Combobox',
    content: `## 一句话目标

掌握 Mantine 三大「自由输入 + 提示」组件——\`TagsInput\` 标签输入、\`Autocomplete\` 自动补全、\`Combobox\` 完全自定义组合框。

---

## 一、TagsInput：标签输入

\`TagsInput\` 让用户输入多个标签，按回车确认每个标签：

\`\`\`jsx
'use client';
import { useState } from 'react';
import { TagsInput, Stack, Text, Code } from '@mantine/core';

export default function Demo() {
  const [tags, setTags] = useState(['React', 'Vue']);

  return (
    <Stack gap="md">
      {/* 基础用法：输入文字按回车添加标签 */}
      <TagsInput
        label="技能标签"
        placeholder="输入后按回车"
        value={tags}
        onChange={setTags}
      />
      <Text>当前标签：<Code>{JSON.stringify(tags)}</Code></Text>

      {/* splitChars：除了回车，按这些字符也会拆分
          默认是 [',', 'Enter'] */}
      <TagsInput
        label="逗号/回车拆分"
        placeholder="试试用逗号分隔"
        splitChars={[',', ' ', '|']}
      />

      {/* maxTags：最多几个标签 */}
      <TagsInput
        label="最多 3 个"
        placeholder="最多 3 个"
        maxTags={3}
      />

      {/* acceptValueOnBlur：失焦时是否自动添加输入框中的值 */}
      <TagsInput
        label="失焦自动确认"
        placeholder="输入后点别处"
        acceptValueOnBlur
      />

      {/* clearable：清除按钮 */}
      <TagsInput
        label="可清除"
        placeholder="清空所有"
        clearable
        defaultValue={['a', 'b']}
      />

      {/* 带下拉建议：data */}
      <TagsInput
        label="带建议"
        placeholder="输入 R 看看"
        data={['React', 'Redux', 'Router', 'Remix']}
      />
    </Stack>
  );
}
\`\`\`

> ⭐ \`TagsInput\` 适合「文章标签」「关键词」「收件人邮箱」这种**多个自由文本**场景。

---

## 二、Autocomplete：自动补全

\`Autocomplete\` 像 \`Select\` 但允许用户输入任意值（不只是从选项里选）：

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Autocomplete, Stack, Text, Code } from '@mantine/core';

export default function Demo() {
  const [value, setValue] = useState('');

  const data = ['React', 'Redux', 'React Router', 'Remix', 'Recoil'];

  return (
    <Stack gap="md">
      {/* 基础用法：输入时自动匹配 data 里的项 */}
      <Autocomplete
        label="前端框架"
        placeholder="输入 R 看看"
        data={data}
        value={value}
        onChange={setValue}
      />
      <Text>当前值：<Code>{value || '(空)'}</Code></Text>

      {/* 与 Select 的区别：
          - Select 的值必须来自 data（受控时不能输入新值）
          - Autocomplete 可以输入任意值（只是有建议） */}

      {/* data 也支持对象格式 */}
      <Autocomplete
        label="对象格式 data"
        placeholder="试试"
        data={[
          { value: 'js', label: 'JavaScript' },
          { value: 'ts', label: 'TypeScript' },
        ]}
      />

      {/* limit：最多显示几条建议 */}
      <Autocomplete
        label="限制 3 条"
        data={Array.from({ length: 20 }, (_, i) => \`项 \${i + 1}\`)}
        limit={3}
      />
    </Stack>
  );
}
\`\`\`

**Autocomplete vs Select 怎么选？**

- 选项是**固定枚举**（性别、状态）→ 用 \`Select\`
- 选项是**建议但不限制**（用户名、邮箱前缀）→ 用 \`Autocomplete\`

---

## 三、Combobox：最灵活的组合框

\`Combobox\` 是底层组件，\`Select\` 和 \`Autocomplete\` 都是基于它实现的。当你需要完全自定义下拉逻辑时用它。

### 1. 最简 Combobox

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Combobox, TextInput, Text, Stack, ScrollArea } from '@mantine/core';

export default function Demo() {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);

  const options = ['React', 'Vue', 'Angular', 'Svelte'];

  return (
    <Stack>
      {/* useComboboxStore：Combobox 的状态管理（可不用，自己控制 open） */}
      <Combobox
        opened={open}
        onOptionSelect={(val) => {
          // 选中某个选项时回调
          setValue(val);
          setOpen(false);
        }}
        withinPortal
      >
        <Combobox.Target>
          {/* Target：包住触发器（输入框）
              onClick={() => setOpen(true)} 点击打开下拉 */}
          <TextInput
            label="自定义 Combobox"
            placeholder="点我打开下拉"
            value={value}
            onChange={(e) => {
              setValue(e.currentTarget.value);
              setOpen(true);
            }}
            onClick={() => setOpen(true)}
          />
        </Combobox.Target>

        {/* Dropdown：下拉框容器 */}
        <Combobox.Dropdown>
          <Combobox.Options>
            {/* Option：单个选项
                value：选项值，点击会触发 onOptionSelect */}
            {options.map((opt) => (
              <Combobox.Option key={opt} value={opt}>
                {opt}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>

      <Text size="sm">当前选中：<Text span fw={700}>{value || '(空)'}</Text></Text>
    </Stack>
  );
}
\`\`\`

### 2. 带搜索的 Combobox

\`\`\`jsx
'use client';
import { useState } from 'react';
import {
  Combobox,
  TextInput,
  useCombobox,
  Text,
  Group,
  Badge,
} from '@mantine/core';

export default function SearchCombobox() {
  // useCombobox：Combobox 的 hook 版本，封装了状态管理
  const combobox = useCombobox();
  const [value, setValue] = useState('');
  const [search, setSearch] = useState('');

  const data = [
    { value: 'react', label: 'React', popularity: 95 },
    { value: 'vue', label: 'Vue', popularity: 90 },
    { value: 'angular', label: 'Angular', popularity: 70 },
    { value: 'svelte', label: 'Svelte', popularity: 65 },
  ];

  // 根据搜索词过滤
  const filtered = data.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  const options = filtered.map((item) => (
    <Combobox.Option key={item.value} value={item.value}>
      <Group justify="space-between">
        <span>{item.label}</span>
        <Badge size="xs" variant="light">热度 {item.popularity}</Badge>
      </Group>
    </Combobox.Option>
  ));

  return (
    <Combobox
      store={combobox}
      onOptionSelect={(val) => {
        // 找到对应 label 显示
        const selected = data.find((d) => d.value === val);
        setValue(selected ? selected.label : '');
        setSearch('');
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <TextInput
          label="带搜索的 Combobox"
          placeholder="搜一搜"
          value={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
            combobox.openDropdown();
          }}
          onClick={() => combobox.openDropdown()}
          rightSection={
            // 关闭按钮
            value ? (
              <Text
                size="xs"
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setValue('');
                  setSearch('');
                }}
              >
                ✕
              </Text>
            ) : null
          }
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          {/* 没有匹配项时显示 */}
          {options.length === 0 ? (
            <Combobox.Empty>没有找到结果</Combobox.Empty>
          ) : (
            options
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
\`\`\`

---

## 四、实战：邮箱自动补全

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Combobox, TextInput, useCombobox, Group, Text } from '@mantine/core';

// 常见邮箱后缀
const emailDomains = ['qq.com', '163.com', 'gmail.com', 'outlook.com', '126.com'];

export default function EmailAutocomplete() {
  const combobox = useCombobox();
  const [email, setEmail] = useState('');

  // 根据当前输入生成补全建议
  // 比如输入 "hello@qq"，建议补全为 "hello@qq.com"
  const suggestions = (() => {
    const atIndex = email.lastIndexOf('@');
    if (atIndex === -1) return [];  // 没有 @，不补全

    const prefix = email.slice(0, atIndex);
    const domain = email.slice(atIndex + 1);

    // 根据已输入的域名部分过滤匹配的域名
    const matched = emailDomains.filter((d) => d.startsWith(domain));
    return matched.map((d) => ({
      value: \`\${prefix}@\${d}\`,
      label: \`\${prefix}@\${d}\`,
    }));
  })();

  const options = suggestions.map((s) => (
    <Combobox.Option key={s.value} value={s.value}>
      <Group gap="xs">
        <Text size="sm">📧</Text>
        <Text size="sm">{s.label}</Text>
      </Group>
    </Combobox.Option>
  ));

  return (
    <Combobox
      store={combobox}
      onOptionSelect={(val) => {
        setEmail(val);
        combobox.closeDropdown();
      }}
      withinPortal
    >
      <Combobox.Target>
        <TextInput
          label="邮箱"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.currentTarget.value);
            // 输入 @ 后才打开下拉
            if (e.currentTarget.value.includes('@')) {
              combobox.openDropdown();
            } else {
              combobox.closeDropdown();
            }
          }}
          onClick={() => email.includes('@') && combobox.openDropdown()}
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          {options.length === 0 ? (
            <Combobox.Empty>输入 @ 后开始补全</Combobox.Empty>
          ) : (
            options
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
\`\`\`

---

## 小结

| 组件 | 用途 | 适用场景 |
| --- | --- | --- |
| \`TagsInput\` | 多标签输入 | 文章标签、关键词、收件人 |
| \`Autocomplete\` | 自由输入 + 建议 | 用户名、邮箱前缀 |
| \`Combobox\` | 完全自定义组合框 | 复杂交互、自定义渲染 |
| \`useCombobox\` | Combobox 状态 hook | 配合 Combobox 用 |
| \`Combobox.Option\` | 单个选项 | 在 Options 内使用 |
| \`Combobox.Empty\` | 空状态 | 没有匹配项时显示 |

下一章我们学习滑块与评分——直观的连续值输入控件。`,
  },

  // ============================================================
  // 第二十二章 Slider/RangeSlider/Rating
  // ============================================================
  {
    id: 'mantine2-ch22',
    group: '第五部分 表单输入',
    icon: '🎚️',
    title: '第二十二章 Slider/RangeSlider/Rating 滑块与评分',
    content: `## 一句话目标

掌握 Mantine 的滑块与评分组件——\`Slider\` 单值滑块、\`RangeSlider\` 范围滑块、\`Rating\` 评分，搞定音量、价格区间、星级评分等连续值输入场景。

---

## 一、Slider：单值滑块

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Slider, Stack, Text, Code } from '@mantine/core';

export default function Demo() {
  const [value, setValue] = useState(50);

  return (
    <Stack gap="xl">
      {/* 基础用法：默认范围 0-100 */}
      <div>
        <Text size="sm">当前值：{value}</Text>
        <Slider value={value} onChange={setValue} mt="xs" />
      </div>

      {/* min/max/step：自定义范围和步长 */}
      <div>
        <Slider
          defaultValue={25}
          min={0}
          max={10}
          step={0.5}
          label={(val) => \`\${val} 分\`}
        />
      </div>

      {/* marks：刻度标记
          刻度位置自动渲染，用户点击也能跳到对应值 */}
      <div>
        <Slider
          defaultValue={50}
          marks={[
            { value: 0, label: '0%' },
            { value: 25, label: '25%' },
            { value: 50, label: '50%' },
            { value: 75, label: '75%' },
            { value: 100, label: '100%' },
          ]}
        />
      </div>

      {/* color：颜色 */}
      <Slider defaultValue={50} color="red" />
      <Slider defaultValue={50} color="grape" />

      {/* size：粗细（xs/sm/md/lg/xl） */}
      <Slider defaultValue={50} size="xl" radius={0} />

      {/* label：拖动时显示的提示
          传 false 不显示，传函数自定义内容 */}
      <Slider
        defaultValue={50}
        label={(val) => \`\${val}/100\`}
        labelTransitionProps={{ transition: 'skew-down', duration: 150 }}
      />

      {/* disabled：禁用 */}
      <Slider defaultValue={50} disabled />
    </Stack>
  );
}
\`\`\`

> ⭐ \`Slider\` 的 \`onChange\` 接收的是**数字**（不是 event），这点和 TextInput 不同。

---

## 二、Slider 进阶：自定义滑块

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Slider, Box, Text, ThemeIcon } from '@mantine/core';
import { IconHeart } from '@tabler/icons-react';

export default function Demo() {
  const [value, setValue] = useState(40);

  return (
    <Box>
      <Text size="sm" mb="xs">爱心值：{value}</Text>

      <Slider
        value={value}
        onChange={setValue}
        min={0}
        max={100}
        // color 根据值变化：小于 30 红、30-70 橙、大于 70 绿
        color={value < 30 ? 'red' : value < 70 ? 'orange' : 'green'}
        // 自定义滑块上方的提示内容
        label={(val) => (
          <ThemeIcon size="sm" variant="filled" radius="xl">
            {val}
          </ThemeIcon>
        )}
        // thumbIcon：滑块本身显示的图标
        thumbIcon={<IconHeart size={12} />}
        size="lg"
      />
    </Box>
  );
}
\`\`\`

---

## 三、RangeSlider：范围滑块

\`\`\`jsx
'use client';
import { useState } from 'react';
import { RangeSlider, Stack, Text, Code } from '@mantine/core';

export default function Demo() {
  // RangeSlider 的值是数组 [start, end]
  const [range, setRange] = useState([20, 80]);

  return (
    <Stack gap="xl">
      <div>
        <Text size="sm">范围：{range[0]} - {range[1]}</Text>
        {/* 基础用法：value 是 [start, end] 数组 */}
        <RangeSlider value={range} onChange={setRange} mt="xs" />
      </div>

      {/* minRange：两个滑块之间的最小间隔 */}
      <div>
        <Text size="sm" mb="xs">最小间隔 20</Text>
        <RangeSlider
          defaultValue={[30, 60]}
          minRange={20}
          min={0}
          max={100}
        />
      </div>

      {/* 带刻度 */}
      <RangeSlider
        defaultValue={[25, 75]}
        marks={[
          { value: 0, label: '0' },
          { value: 50, label: '50' },
          { value: 100, label: '100' },
        ]}
      />

      {/* 自定义颜色和大小 */}
      <RangeSlider
        defaultValue={[40, 60]}
        color="violet"
        size="lg"
        labelAlwaysOn
      />
    </Stack>
  );
}
\`\`\`

**RangeSlider 的几个坑：**

1. \`value\` 是数组 \`[number, number]\`，不能用单个数字
2. \`minRange\` 不能小于 \`step\`
3. 受控时必须同时传 \`value\` 和 \`onChange\`

---

## 四、inverted：反向填充

\`\`\`jsx
'use client';
import { Slider, Stack, Text } from '@mantine/core';

export default function Demo() {
  return (
    <Stack gap="md">
      <div>
        <Text size="sm">普通（从左到右填充）</Text>
        <Slider defaultValue={70} />
      </div>

      <div>
        <Text size="sm">反向（从右到左填充）</Text>
        {/* inverted：填充方向反过来，常用于「剩余电量」等场景 */}
        <Slider defaultValue={70} inverted color="red" />
      </div>
    </Stack>
  );
}
\`\`\`

---

## 五、Rating：评分

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Rating, Stack, Text, Code } from '@mantine/core';

export default function Demo() {
  const [value, setValue] = useState(3);

  return (
    <Stack gap="md">
      {/* 基础用法：默认 5 颗星 */}
      <div>
        <Rating value={value} onChange={setValue} />
        <Text size="sm" mt="xs">当前评分：{value} 星</Text>
      </div>

      {/* count：星星数量（默认 5） */}
      <Rating defaultValue={3} count={10} />

      {/* fractions：分数（1/2/3/4，允许半星、四分之一星等） */}
      <Rating defaultValue={3.5} fractions={2} />

      {/* size：尺寸 */}
      <Rating defaultValue={3} size="xl" />

      {/* readOnly：只读（展示评分用） */}
      <Rating defaultValue={4.5} fractions={2} readOnly />

      {/* highlightSelectedOnly：只高亮当前选中的星 */}
      <Rating defaultValue={3} highlightSelectedOnly />

      {/* 自定义符号：用 children 替换默认星星 */}
      <Rating defaultValue={3}>
        <span style={{ fontSize: 24 }}>👍</span>
      </Rating>
    </Stack>
  );
}
\`\`\`

> ⭐ \`Rating\` 的 \`fractions={2}\` 是半星，\`fractions={4}\` 是四分之一星。展示用 \`readOnly\`，输入用默认。

---

## 六、实战：价格区间 + 评分筛选

\`\`\`jsx
'use client';
import { useState } from 'react';
import {
  RangeSlider,
  Rating,
  Stack,
  Text,
  Box,
  Group,
  Badge,
} from '@mantine/core';

export default function ProductFilter() {
  const [price, setPrice] = useState([100, 800]);
  const [minRating, setMinRating] = useState(0);

  return (
    <Stack gap="lg" style={{ maxWidth: 480 }}>
      <Box>
        <Text size="sm" fw={600} mb="xs">价格区间</Text>
        <Text size="xs" c="dimmed" mb="md">
          ¥{price[0]} - ¥{price[1]}
        </Text>
        <RangeSlider
          value={price}
          onChange={setPrice}
          min={0}
          max={1000}
          step={50}
          minRange={50}
          marks={[
            { value: 0, label: '¥0' },
            { value: 500, label: '¥500' },
            { value: 1000, label: '¥1000' },
          ]}
          label={(val) => \`¥\${val}\`}
        />
      </Box>

      <Box>
        <Text size="sm" fw={600} mb="xs">最低评分</Text>
        <Group align="center" gap="sm">
          <Rating
            value={minRating}
            onChange={setMinRating}
            fractions={2}
            size="lg"
          />
          <Badge variant="light" color="orange">
            {minRating} 星以上
          </Badge>
        </Group>
      </Box>

      <Text size="xs" c="dimmed">
        筛选条件：价格 ¥{price[0]}-¥{price[1]}，{minRating} 星以上
      </Text>
    </Stack>
  );
}
\`\`\`

---

## 小结

| 组件 | 用途 | 关键 props |
| --- | --- | --- |
| \`Slider\` | 单值滑块 | min/max/step/value/onChange/marks/label/color |
| \`RangeSlider\` | 范围滑块 | value 是数组 [start, end] / minRange |
| \`Rating\` | 评分 | count/fractions/readOnly/value |
| 共用 | 视觉 | color/size/disabled/inverted |

下一章我们学习分段控件——SegmentedControl 与 Chip，处理「几个选项里选一个/多个」的场景。`,
  },

  // ============================================================
  // 第二十三章 SegmentedControl/Chip
  // ============================================================
  {
    id: 'mantine2-ch23',
    group: '第五部分 表单输入',
    icon: '🔀',
    title: '第二十三章 SegmentedControl/Chip 分段控件',
    content: `## 一句话目标

掌握 Mantine 的分段控件——\`SegmentedControl\` 分段选择器（像 iOS 的选项条）、\`Chip\` 芯片标签，搞定视图切换、筛选标签等场景。

---

## 一、SegmentedControl：分段选择器

\`\`\`jsx
'use client';
import { useState } from 'react';
import { SegmentedControl, Stack, Text, Code } from '@mantine/core';

export default function Demo() {
  const [value, setValue] = useState('react');

  return (
    <Stack gap="md">
      {/* 基础用法：data 是选项数组
          data 支持字符串或对象格式 */}
      <SegmentedControl
        value={value}
        onChange={setValue}
        data={[
          { label: 'React', value: 'react' },
          { label: 'Vue', value: 'vue' },
          { label: 'Angular', value: 'angular' },
        ]}
      />
      <Text>当前：<Code>{value}</Code></Text>

      {/* 字符串数组简化写法 */}
      <SegmentedControl
        data={['小', '中', '大']}
        defaultValue="中"
      />

      {/* color：选中项的颜色 */}
      <SegmentedControl
        data={['是', '否']}
        color="violet"
        defaultValue="是"
      />

      {/* size：尺寸 */}
      <SegmentedControl
        data={['xs', 'sm', 'md', 'lg', 'xl']}
        size="xl"
        radius="lg"
      />

      {/* orientation：水平或垂直 */}
      <SegmentedControl
        data={['选项 1', '选项 2', '选项 3']}
        orientation="vertical"
      />

      {/* fullWidth：占满父容器宽度 */}
      <SegmentedControl
        data={['左', '中', '右']}
        fullWidth
      />

      {/* withItemsDivider：选项之间显示分隔线 */}
      <SegmentedControl
        data={['A', 'B', 'C']}
        withItemsDivider
      />
    </Stack>
  );
}
\`\`\`

> ⭐ \`SegmentedControl\` 适合**选项少（2-5 个）、互斥**的场景——比 Radio 直观、比 Select 节省点击。

---

## 二、transitionDuration：动画时长

\`\`\`jsx
'use client';
import { SegmentedControl, Stack, Text } from '@mantine/core';

export default function Demo() {
  return (
    <Stack gap="md">
      <div>
        <Text size="sm" mb="xs">快速动画（150ms）</Text>
        <SegmentedControl
          data={['A', 'B', 'C']}
          defaultValue="A"
          transitionDuration={150}
        />
      </div>

      <div>
        <Text size="sm" mb="xs">慢速动画（500ms）</Text>
        <SegmentedControl
          data={['A', 'B', 'C']}
          defaultValue="A"
          transitionDuration={500}
        />
      </div>

      <div>
        <Text size="sm" mb="xs">无动画（0ms）</Text>
        <SegmentedControl
          data={['A', 'B', 'C']}
          defaultValue="A"
          transitionDuration={0}
        />
      </div>
    </Stack>
  );
}
\`\`\`

---

## 三、Chip：单选芯片

\`Chip\` 是一个可点击的标签，单用就是一个开关：

\`\`\`jsx
'use client';
import { Chip, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack gap="md">
      {/* 基础用法 */}
      <Chip checked={false}>默认未选中</Chip>
      <Chip defaultChecked>默认选中</Chip>

      {/* variant：filled / outline / light */}
      <Chip variant="filled" defaultChecked>Filled</Chip>
      <Chip variant="outline" defaultChecked>Outline</Chip>
      <Chip variant="light" defaultChecked>Light</Chip>

      {/* size / color */}
      <Chip size="lg" color="violet" defaultChecked>大号紫色</Chip>

      {/* 带图标 */}
      <Chip defaultChecked>📌 收藏</Chip>
    </Stack>
  );
}
\`\`\`

---

## 四、Chip.Group：单选/多选组

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Chip, Stack, Text, Code, Group } from '@mantine/core';

export default function Demo() {
  // 单选组
  const [single, setSingle] = useState('react');
  // 多选组
  const [multi, setMulti] = useState(['js', 'ts']);

  return (
    <Stack gap="lg">
      <div>
        <Text size="sm" mb="xs">单选组（默认）</Text>
        {/* Chip.Group 默认是单选
            value/onChange 受控 */}
        <Chip.Group value={single} onChange={setSingle}>
          <Group gap="xs">
            <Chip value="react">React</Chip>
            <Chip value="vue">Vue</Chip>
            <Chip value="angular">Angular</Chip>
          </Group>
        </Chip.Group>
        <Text size="xs" c="dimmed">单选值：<Code>{single}</Code></Text>
      </div>

      <div>
        <Text size="sm" mb="xs">多选组</Text>
        {/* multiple：开启多选
            value 变成数组 */}
        <Chip.Group multiple value={multi} onChange={setMulti}>
          <Group gap="xs">
            <Chip value="js">JavaScript</Chip>
            <Chip value="ts">TypeScript</Chip>
            <Chip value="react">React</Chip>
            <Chip value="vue">Vue</Chip>
          </Group>
        </Chip.Group>
        <Text size="xs" c="dimmed">多选值：<Code>{JSON.stringify(multi)}</Code></Text>
      </div>
    </Stack>
  );
}
\`\`\`

---

## 五、实战 1：视图切换

\`\`\`jsx
'use client';
import { useState } from 'react';
import {
  SegmentedControl,
  Stack,
  Group,
  Text,
  List,
  Grid,
  Card,
  Badge,
} from '@mantine/core';

export default function ViewSwitcher() {
  const [view, setView] = useState('list');

  const items = [
    { id: 1, title: '商品 A', price: 99 },
    { id: 2, title: '商品 B', price: 199 },
    { id: 3, title: '商品 C', price: 299 },
  ];

  return (
    <Stack gap="md">
      {/* SegmentedControl 切换视图模式 */}
      <SegmentedControl
        value={view}
        onChange={setView}
        data={[
          { label: '📋 列表', value: 'list' },
          { label: '🎴 网格', value: 'grid' },
          { label: '📝 详情', value: 'detail' },
        ]}
      />

      {/* 根据视图模式渲染不同布局 */}
      {view === 'list' && (
        <List spacing="xs">
          {items.map((item) => (
            <List.Item key={item.id}>
              {item.title} - ¥{item.price}
            </List.Item>
          ))}
        </List>
      )}

      {view === 'grid' && (
        <Grid>
          {items.map((item) => (
            <Grid.Col key={item.id} span={4}>
              <Card withBorder padding="md">
                <Text fw={600}>{item.title}</Text>
                <Badge color="red" mt="xs">¥{item.price}</Badge>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}

      {view === 'detail' && (
        <Stack gap="xs">
          {items.map((item) => (
            <Card key={item.id} withBorder padding="md">
              <Group justify="space-between">
                <Text fw={600} size="lg">{item.title}</Text>
                <Badge size="lg" color="red">¥{item.price}</Badge>
              </Group>
              <Text size="sm" c="dimmed" mt="xs">
                商品 ID：{item.id} · 详细的商品描述信息...
              </Text>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
\`\`\`

---

## 六、实战 2：筛选标签

\`\`\`jsx
'use client';
import { useState } from 'react';
import {
  Chip,
  Stack,
  Group,
  Text,
  Code,
  Divider,
  Badge,
} from '@mantine/core';

export default function FilterPanel() {
  const [categories, setCategories] = useState(['tech']);
  const [tags, setTags] = useState(['js']);

  return (
    <Stack gap="md" style={{ maxWidth: 480 }}>
      <div>
        <Text size="sm" fw={600} mb="xs">分类（单选）</Text>
        <Chip.Group value={categories[0]} onChange={(v) => setCategories([v])}>
          <Group gap="xs">
            <Chip value="tech">科技</Chip>
            <Chip value="life">生活</Chip>
            <Chip value="design">设计</Chip>
            <Chip value="food">美食</Chip>
          </Group>
        </Chip.Group>
      </div>

      <Divider />

      <div>
        <Text size="sm" fw={600} mb="xs">标签（多选）</Text>
        <Chip.Group multiple value={tags} onChange={setTags}>
          <Group gap="xs">
            <Chip value="js">JavaScript</Chip>
            <Chip value="ts">TypeScript</Chip>
            <Chip value="react">React</Chip>
            <Chip value="vue">Vue</Chip>
            <Chip value="css">CSS</Chip>
            <Chip value="node">Node.js</Chip>
          </Group>
        </Chip.Group>
      </div>

      <Divider />

      <Group gap="xs">
        <Text size="sm">当前筛选：</Text>
        {categories.map((c) => (
          <Badge key={c} color="blue" variant="light">{c}</Badge>
        ))}
        {tags.map((t) => (
          <Badge key={t} color="grape" variant="light">{t}</Badge>
        ))}
      </Group>

      <Text size="xs" c="dimmed">
        <Code>{JSON.stringify({ categories, tags })}</Code>
      </Text>
    </Stack>
  );
}
\`\`\`

---

## 小结

| 组件 | 用途 | 关键 props |
| --- | --- | --- |
| \`SegmentedControl\` | 分段选择器 | data/value/onChange/color/size/orientation/fullWidth |
| \`Chip\` | 单个芯片 | variant/color/size/checked |
| \`Chip.Group\` | 芯片组 | multiple/value/onChange |

**SegmentedControl vs Chip.Group 怎么选？**

- 选项**固定且互斥**（视图切换、模式切换）→ \`SegmentedControl\`
- 选项**可多选**或需要**视觉上像标签**（筛选、关键词）→ \`Chip.Group\`

下一章我们学习日期时间输入——DatePicker、DateInput、TimeInput。`,
  },

  // ============================================================
  // 第二十四章 DatePicker/DateInput/TimeInput
  // ============================================================
  {
    id: 'mantine2-ch24',
    group: '第五部分 表单输入',
    icon: '📅',
    title: '第二十四章 DatePicker/DateInput/TimeInput 日期时间',
    content: `## 一句话目标

掌握 Mantine 的日期时间组件——\`DateInput\` 单日期输入、\`DatePicker\` 日历选择器、\`TimeInput\` 时间输入，搞定预订、日程、提醒等场景。

> 需要 \`@mantine/dates\` 包：\`npm install @mantine/dates\`，并引入 \`@mantine/dates/styles.css\`。

---

## 一、DateInput：日期输入框

\`DateInput\` 是一个输入框，点击会弹出日历。最常用。

\`\`\`jsx
'use client';
import { useState } from 'react';
import { DateInput, Stack, Text, Code } from '@mantine/dates';

export default function Demo() {
  const [value, setValue] = useState(null);

  return (
    <Stack gap="md">
      {/* 基础用法：value 是 Date 对象或 null */}
      <DateInput
        label="出生日期"
        placeholder="选择日期"
        value={value}
        onChange={setValue}
        valueFormat="YYYY-MM-DD"
      />
      <Text>当前值：<Code>{value ? value.toISOString().slice(0, 10) : '(空)'}</Code></Text>

      {/* clearable：清除按钮 */}
      <DateInput
        label="可清除"
        placeholder="选择日期"
        clearable
        valueFormat="YYYY 年 MM 月 DD 日"
      />

      {/* minDate/maxDate：可选范围限制 */}
      <DateInput
        label="今天到一周内"
        placeholder="选择日期"
        // minDate：最早可选今天
        minDate={new Date()}
        // maxDate：最晚可选 7 天后
        maxDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
        valueFormat="YYYY-MM-DD"
      />

      {/* disabledDates：禁用某些日期（数组） */}
      <DateInput
        label="禁用周末"
        placeholder="周末不能选"
        // 禁用所有周六周日
        excludeDate={(date) => date.getDay() === 0 || date.getDay() === 6}
      />

      {/* size / variant */}
      <DateInput
        label="大号"
        size="lg"
        placeholder="选择日期"
      />
    </Stack>
  );
}
\`\`\`

> ⭐ \`DateInput\` 的 \`value\` 是 \`Date\` 对象（不是字符串），提交表单时要自己格式化。

---

## 二、valueFormat：日期格式

\`\`\`jsx
'use client';
import { DateInput, Stack, Text } from '@mantine/dates';

export default function Demo() {
  return (
    <Stack gap="md">
      {/* valueFormat：控制输入框里显示的格式
          使用 dayjs 格式：YYYY 年 MM 月 DD 日 HH:mm:ss */}
      <DateInput
        label="中文格式"
        valueFormat="YYYY 年 MM 月 DD 日"
        placeholder="选择日期"
        defaultValue={new Date()}
      />
      <Text size="xs" c="dimmed">格式：YYYY 年 MM 月 DD 日</Text>

      <DateInput
        label="斜杠格式"
        valueFormat="DD/MM/YYYY"
        placeholder="选择日期"
        defaultValue={new Date()}
      />
      <Text size="xs" c="dimmed">格式：DD/MM/YYYY</Text>

      <DateInput
        label="带星期"
        valueFormat="dddd, YYYY-MM-DD"
        placeholder="选择日期"
        defaultValue={new Date()}
      />
      <Text size="xs" c="dimmed">格式：dddd（星期）, YYYY-MM-DD</Text>
    </Stack>
  );
}
\`\`\`

---

## 三、DatePicker：日历选择器

\`DatePicker\` 只显示日历，没有输入框——通常配合 \`Popover\` 自己包一层，或作为 \`DateInput\` 的内部组件直接使用。

\`\`\`jsx
'use client';
import { useState } from 'react';
import { DatePicker, Stack, Text, Code } from '@mantine/dates';

export default function Demo() {
  const [value, setValue] = useState(null);

  return (
    <Stack gap="md">
      {/* 基础用法：直接显示日历 */}
      <DatePicker
        value={value}
        onChange={setValue}
        // 默认显示哪个月
        defaultDate={new Date()}
      />
      <Text>选中：<Code>{value ? value.toISOString().slice(0, 10) : '(无)'}</Code></Text>

      {/* numberOfColumns：同时显示几个月 */}
      <DatePicker
        numberOfColumns={2}
        placeholder="双月选择"
        defaultDate={new Date()}
      />

      {/* size：尺寸 */}
      <DatePicker size="xl" defaultDate={new Date()} />

      {/* minDate/maxDate */}
      <DatePicker
        defaultDate={new Date()}
        minDate={new Date()}
        maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
      />

      {/* excludeDate：禁用特定日期 */}
      <DatePicker
        defaultDate={new Date()}
        // 禁用周末
        excludeDate={(date) => date.getDay() === 0 || date.getDay() === 6}
      />

      {/* renderDay：自定义日期单元格渲染
          比如给某些日期加红点表示有事件 */}
      <DatePicker
        defaultDate={new Date()}
        renderDay={(date) => {
          const day = date.getDate();
          // 给 15 号加个标记
          return (
            <div style={{ position: 'relative' }}>
              {day}
              {day === 15 && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: 'red',
                  }}
                />
              )}
            </div>
          );
        }}
      />
    </Stack>
  );
}
\`\`\`

---

## 四、自定义渲染日期单元格

\`\`\`jsx
'use client';
import { DatePicker, Badge } from '@mantine/dates';

// 模拟有事件的日期
const events = {
  5: '会议',
  12: '生日',
  20: '截止',
};

export default function Demo() {
  return (
    <DatePicker
      defaultDate={new Date()}
      // renderDay：每个日期单元格的渲染函数
      renderDay={(date) => {
        const day = date.getDate();
        const event = events[day];

        return (
          <div style={{ position: 'relative', width: '100%' }}>
            <div>{day}</div>
            {event && (
              <div
                style={{
                  position: 'absolute',
                  bottom: -2,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 9,
                  color: 'red',
                  whiteSpace: 'nowrap',
                }}
              >
                •
              </div>
            )}
          </div>
        );
      }}
    />
  );
}
\`\`\`

---

## 五、TimeInput：时间输入

\`\`\`jsx
'use client';
import { useState } from 'react';
import { TimeInput, Stack, Text, Code } from '@mantine/dates';

export default function Demo() {
  const [value, setValue] = useState('');

  return (
    <Stack gap="md">
      {/* 基础用法：时:分 */}
      <TimeInput
        label="时间"
        placeholder="HH:MM"
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
      />
      <Text>当前值：<Code>{value || '(空)'}</Code></Text>

      {/* withSeconds：显示秒 */}
      <TimeInput
        label="带秒"
        withSeconds
        placeholder="HH:MM:SS"
      />

      {/* defaultValue */}
      <TimeInput
        label="默认值"
        defaultValue="14:30"
      />

      {/* 带图标 */}
      <TimeInput
        label="带图标"
        defaultValue="09:00"
        leftSection={<span>🕘</span>}
      />

      {/* size */}
      <TimeInput
        label="大号"
        size="lg"
        defaultValue="18:00"
      />
    </Stack>
  );
}
\`\`\`

> ⭐ \`TimeInput\` 的 \`value\` 是字符串（如 \`"14:30"\`），不是 Date 对象——比 DateInput 简单。

---

## 六、DateTimePicker：日期+时间一起选

\`\`\`jsx
'use client';
import { useState } from 'react';
import { DateTimePicker, Stack, Text, Code } from '@mantine/dates';

export default function Demo() {
  const [value, setValue] = useState(null);

  return (
    <Stack gap="md">
      {/* DateTimePicker：日期 + 时间一起选
          valueFormat 控制显示格式 */}
      <DateTimePicker
        label="活动时间"
        placeholder="选择日期时间"
        value={value}
        onChange={setValue}
        valueFormat="YYYY-MM-DD HH:mm"
        clearable
      />
      <Text>当前值：<Code>{value ? value.toISOString() : '(空)'}</Code></Text>
    </Stack>
  );
}
\`\`\`

---

## 七、实战：预订日期选择

\`\`\`jsx
'use client';
import { useState } from 'react';
import {
  DateInput,
  TimeInput,
  Stack,
  Group,
  Button,
  Text,
  Code,
  Divider,
  NumberInput,
  Checkbox,
} from '@mantine/core';
import { DateInput as DInput } from '@mantine/dates';
// 注意：DateInput 从 @mantine/dates 导入，下面演示混用
// 实际项目中应统一从 @mantine/dates 引入 DateInput/TimeInput
import '@mantine/dates/styles.css';

export default function BookingForm() {
  const [date, setDate] = useState(null);
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [options, setOptions] = useState(['window']);

  const handleSubmit = (e) => {
    e.preventDefault();
    const booking = { date, time, guests, options };
    alert(\`预订成功！\\n日期：\${date?.toLocaleDateString()}\\n时间：\${time}\\n人数：\${guests}\\n选项：\${options.join(', ')}\`);
  };

  // 禁用过去的日期 + 周一闭店
  const isClosed = (date) => {
    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
    const isMonday = date.getDay() === 1;
    return isPast || isMonday;
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md" style={{ maxWidth: 420 }}>
        <DInput
          label="预订日期"
          placeholder="选择日期"
          value={date}
          onChange={setDate}
          valueFormat="YYYY 年 MM 月 DD 日"
          minDate={new Date()}
          // 周一闭店 + 不能选过去
          excludeDate={isClosed}
          clearable
          required
        />

        <TimeInput
          label="预订时间"
          placeholder="HH:MM"
          value={time}
          onChange={(e) => setTime(e.currentTarget.value)}
          withSeconds={false}
          required
        />

        <NumberInput
          label="用餐人数"
          value={guests}
          onChange={(val) => setGuests(val ?? 1)}
          min={1}
          max={20}
        />

        <Divider label="座位偏好" labelPosition="center" />

        <Checkbox.Group
          value={options}
          onChange={setOptions}
        >
          <Stack gap="xs">
            <Checkbox value="window" label="靠窗" />
            <Checkbox value="quiet" label="安静角落" />
            <Checkbox value="outdoor" label="露天" />
          </Stack>
        </Checkbox.Group>

        <Group justify="flex-end">
          <Button type="submit" color="orange">
            确认预订
          </Button>
        </Group>

        <Text size="xs" c="dimmed">
          当前预订信息：<Code>{JSON.stringify({ date: date?.toISOString().slice(0, 10), time, guests, options })}</Code>
        </Text>
      </Stack>
    </form>
  );
}
\`\`\`

---

## 小结

| 组件 | 用途 | 关键 props |
| --- | --- | --- |
| \`DateInput\` | 日期输入框（带日历） | value/onChange/valueFormat/clearable/minDate/maxDate/excludeDate |
| \`DatePicker\` | 纯日历选择器 | numberOfColumns/renderDay/size |
| \`TimeInput\` | 时间输入 | withSeconds/value（字符串） |
| \`DateTimePicker\` | 日期+时间 | value（Date 对象） |
| 格式化 | 显示格式 | valueFormat（dayjs 格式） |

**DateInput vs DatePicker 怎么选？**

- 要**输入框 + 日历**（用户表单）→ \`DateInput\`
- 只显示**日历**（如筛选面板）→ \`DatePicker\`

至此第五部分表单输入结束。下一部分我们学习表单进阶——useForm、校验、动态字段。`,
  },
];

export { chapters };
