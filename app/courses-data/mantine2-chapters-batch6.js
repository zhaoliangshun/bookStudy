// =============================================================
// Mantine 从入门到精通大全 - 第六批章节（第六部分 表单进阶，共 3 章）
// -------------------------------------------------------------
// 本批包含：
//   mantine2-ch25 : 第二十五章 useForm hook 全解
//   mantine2-ch26 : 第二十六章 表单校验全解
//   mantine2-ch27 : 第二十七章 动态表单与嵌套字段
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：Mantine v9 / React 19 / Next.js 16
//
// 转义规则：反引号写作 \`，\${ 写作 \$\{，正则中的 \S \d \w 写作 \\S \\d \\w。
// =============================================================

const chapters = [
  // ============================================================
  // 第二十五章 useForm hook 全解
  // ============================================================
  {
    id: 'mantine2-ch25',
    group: '第六部分 表单进阶',
    icon: '🚀',
    title: '第二十五章 useForm hook 全解',
    content: `## 一句话目标

掌握 Mantine 表单的核心引擎 \`useForm\`——从初始化、字段绑定、提交重置，到值监听、状态判断、提交值转换，一口气讲透，搭出一个能上生产的注册表单。

---

## 一、useForm 是什么

前面 7 章我们学了各种输入组件（TextInput、Select、Checkbox……），但都是「裸写」\`value\` 和 \`onChange\`。一旦字段多了，手写状态管理会爆炸——10 个字段就有 10 个 useState、10 个 onChange、10 个 error。

\`useForm\` 就是 Mantine 给你的「表单大管家」，一个 hook 解决：

- **状态管理**：所有字段值存在一个对象里
- **字段绑定**：\`getInputProps('name')\` 一行搞定 value/onChange/onBlur/error
- **提交处理**：\`onSubmit\` 自动校验 + 拿到干净数据
- **重置**：\`reset()\` 一键回初始值
- **校验**：声明式规则，下章细讲
- **状态判断**：touched、dirty、submitting 一应俱全

> ⭐ \`useForm\` 来自 \`@mantine/form\` 包，是独立于 \`@mantine/core\` 的。但可以配合任何输入组件（甚至原生 input）使用。

\`\`\`bash
# 还没装的话先装一下
npm install @mantine/form
\`\`\`

---

## 二、第一个表单：initialValues + getInputProps

先看最简单的用法——一个邮箱 + 同意条款的表单：

\`\`\`jsx
'use client';
import { Button, Checkbox, Group, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

export default function Demo() {
  // useForm 接收一个配置对象
  const form = useForm({
    // mode: 'uncontrolled' 是 v9 推荐模式
    // 字段用 ref 维护，不触发整表重渲染，性能最好
    mode: 'uncontrolled',

    // initialValues：表单初始值，决定字段结构和默认值
    // 每个字段都必须在这里声明，否则 getInputProps 拿不到值
    initialValues: {
      email: '',
      termsOfService: false,
    },

    // validate：校验规则对象，下章详讲
    // key 是字段名，value 是函数：返回 error 字符串或 null
    validate: {
      email: (value) => (/^\\S+@\\S+$/.test(value) ? null : '邮箱格式不正确'),
    },
  });

  return (
    // form.onSubmit(handler)：包装函数，自动校验通过后调用 handler
    // handler 收到的就是当前表单值
    <form onSubmit={form.onSubmit((values) => console.log(values))}>
      {/* withAsterisk：label 前显示红色星号（仅视觉提示） */}
      <TextInput
        withAsterisk
        label="邮箱"
        placeholder="your@email.com"
        /* key={form.key('email')}：uncontrolled 模式必加！
           它给字段一个稳定 key，避免值错位 */
        key={form.key('email')}
        /* getInputProps('email')：展开成 { value, onChange, onBlur, error }
           一行绑定所有事件，不用手写 */
        {...form.getInputProps('email')}
      />

      {/* Checkbox 用 getInputProps 时要传 { type: 'checkbox' }
          让它走 checked/onChange 而不是 value/onChange */}
      <Checkbox
        mt="md"
        label="我同意隐私条款"
        key={form.key('termsOfService')}
        {...form.getInputProps('termsOfService', { type: 'checkbox' })}
      />

      <Group justify="flex-end" mt="md">
        <Button type="submit">提交</Button>
      </Group>
    </form>
  );
}
\`\`\`

> ⭐ **核心心法**：\`initialValues\` 决定结构，\`getInputProps\` 绑定字段，\`onSubmit\` 处理提交。记住这三步，80% 的表单你都会写了。

---

## 三、uncontrolled vs controlled 模式

\`mode\` 有两个值，决定字段怎么维护状态：

| 模式 | 状态存哪 | 重渲染 | key 必填 | 适用 |
| --- | --- | --- | --- | --- |
| \`uncontrolled\`（默认） | ref 内部 | 不会 | **是** | 99% 场景，性能好 |
| \`controlled\` | React state | 每次 onChange 重渲染整个表单 | 否 | 需要实时读取值（如联动） |

\`\`\`jsx
'use client';
import { TextInput, Text, Box } from '@mantine/core';
import { useForm } from '@mantine/form';

export default function ControlledDemo() {
  // controlled 模式：form.values 实时反映最新值，会触发重渲染
  const form = useForm({
    mode: 'controlled',
    initialValues: { name: '' },
  });

  return (
    <Box>
      {/* controlled 模式不需要 key */}
      <TextInput
        label="姓名"
        placeholder="输入姓名"
        {...form.getInputProps('name')}
      />
      {/* 因为 form.values 实时更新，这里能立刻显示输入内容 */}
      <Text mt="sm" c="dimmed">
        实时预览：{form.values.name || '（空）'}
      </Text>
    </Box>
  );
}
\`\`\`

**uncontrolled 模式下怎么实时读值？** 用 \`form.watch\`（后面讲）或 \`form.getValues()\`。

> ⭐ 不知道选哪个？**默认 uncontrolled**，遇到需要联动再切 controlled 或用 watch。

---

## 四、getInputProps 与各种组件配合

\`getInputProps\` 几乎适配所有 Mantine 输入组件。关键是知道哪些需要传 \`{ type: 'checkbox' }\` 或 \`{ type: 'radio' }\`：

\`\`\`jsx
'use client';
import {
  TextInput,
  Textarea,
  NumberInput,
  Select,
  Checkbox,
  Switch,
  Radio,
  Slider,
  Box,
  Button,
  Group,
} from '@mantine/core';
import { useForm } from '@mantine/form';

export default function AllInputsDemo() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      bio: '',
      age: 18,
      city: '',
      subscribe: false,
      newsletter: true,
      gender: '',
      score: 50,
    },
  });

  return (
    <Box maw={420}>
      <form onSubmit={form.onSubmit((v) => console.log(v))}>
        {/* 文本类：TextInput / Textarea / PasswordInput 直接展开即可 */}
        <TextInput label="姓名" key={form.key('name')} {...form.getInputProps('name')} />
        <Textarea label="简介" mt="sm" key={form.key('bio')} {...form.getInputProps('bio')} />

        {/* NumberInput：值是 number，getInputProps 自动适配 */}
        <NumberInput label="年龄" mt="sm" key={form.key('age')} {...form.getInputProps('age')} />

        {/* Select：值是 string，正常展开 */}
        <Select
          label="城市"
          mt="sm"
          data={['北京', '上海', '深圳']}
          key={form.key('city')}
          {...form.getInputProps('city')}
        />

        {/* Checkbox：必须传 { type: 'checkbox' }，否则值不对 */}
        <Checkbox
          label="订阅"
          mt="sm"
          key={form.key('subscribe')}
          {...form.getInputProps('subscribe', { type: 'checkbox' })}
        />

        {/* Switch：和 Checkbox 一样，要传 { type: 'checkbox' } */}
        <Switch
          label="接收邮件周报"
          mt="sm"
          key={form.key('newsletter')}
          {...form.getInputProps('newsletter', { type: 'checkbox' })}
        />

        {/* Radio.Group：把 Radio 当 children，name 用 getInputProps */}
        <Radio.Group
          label="性别"
          mt="sm"
          key={form.key('gender')}
          {...form.getInputProps('gender')}
        >
          <Group mt="xs">
            <Radio value="male" label="男" />
            <Radio value="female" label="女" />
          </Group>
        </Radio.Group>

        {/* Slider：值是 number，正常展开 */}
        <Slider
          label="分数"
          mt="xl"
          key={form.key('score')}
          {...form.getInputProps('score')}
        />

        <Button type="submit" mt="md">提交</Button>
      </form>
    </Box>
  );
}
\`\`\`

> ⭐ **速记口诀**：\`Checkbox\`、\`Switch\` 要加 \`{ type: 'checkbox' }\`；\`Radio.Group\` 把 \`getInputProps\` 放 Group 上；其他直接展开。

---

## 五、onSubmit 与 onReset

\`form.onSubmit\` 是个高阶函数：接收你的 handler，返回一个 \`<form onSubmit>\` 能直接用的函数。

\`\`\`jsx
'use client';
import { Button, Group, TextInput, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';

export default function SubmitResetDemo() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { name: '', email: '' },
  });

  return (
    <Stack>
      {/* form.onSubmit 接收两个参数：
          1. handleSubmit(values, event)：校验通过时调用
          2. handleErrors(errors, values, event)：校验失败时调用（可选） */}
      <form
        onSubmit={form.onSubmit(
          (values) => {
            // 校验通过，values 是干净数据
            console.log('提交成功：', values);
            alert('提交成功！查看 console');
          },
          (errors, values, event) => {
            // 校验失败，可以在这里弹通知
            console.log('校验失败：', errors);
          }
        )}
        {/* form.onReset：直接绑定到 form 的 onReset，内部调用 form.reset() */}
        onReset={form.onReset}
      >
        <TextInput label="姓名" key={form.key('name')} {...form.getInputProps('name')} />
        <TextInput label="邮箱" mt="sm" key={form.key('email')} {...form.getInputProps('email')} />

        <Group justify="space-between" mt="md">
          {/* type="reset" 触发 form 的 onReset → form.reset() */}
          <Button type="reset" variant="default">重置</Button>
          {/* type="submit" 触发 form 的 onSubmit → 校验 + handler */}
          <Button type="submit">提交</Button>
        </Group>
      </form>

      {/* 也可以用普通按钮手动调用 form.reset() */}
      <Button variant="subtle" onClick={() => form.reset()}>
        手动重置（不走 form.onReset）
      </Button>
    </Stack>
  );
}
\`\`\`

**onSubmitPreventDefault 选项**：默认 \`form.onSubmit\` 会调用 \`event.preventDefault()\` 阻止表单默认提交（刷新页面）。可以改：

\`\`\`jsx
const form = useForm({
  mode: 'uncontrolled',
  // always（默认）：永远阻止默认行为
  // never：永远不阻止（罕见，比如你想让浏览器原生提交）
  // validation-failed：仅在校验失败时阻止
  onSubmitPreventDefault: 'validation-failed',
});
\`\`\`

---

## 六、values / getValues / setValues / setFieldValue / reset

读取和修改值的 API 一览：

\`\`\`jsx
'use client';
import { Button, Group, TextInput, Code, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { randomId } from '@mantine/hooks';

export default function ValuesDemo() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { name: '', email: '', age: 0 },
  });

  return (
    <Stack>
      <TextInput label="姓名" key={form.key('name')} {...form.getInputProps('name')} />
      <TextInput label="邮箱" key={form.key('email')} {...form.getInputProps('email')} />

      <Group>
        {/* form.getValues()：拿当前值的快照（uncontrolled 模式下不会自动重渲染） */}
        <Button variant="default" onClick={() => console.log(form.getValues())}>
          打印当前值
        </Button>

        {/* form.setFieldValue(path, value)：改单个字段，路径支持嵌套 */}
        <Button variant="default" onClick={() => form.setFieldValue('name', randomId())}>
          随机姓名
        </Button>

        {/* form.setValues(partial)：批量改值，浅合并 */}
        <Button
          variant="default"
          onClick={() => form.setValues({ name: '张三', email: 'zs@test.com' })}
        >
          填入张三
        </Button>

        {/* form.setValues 也支持函数式更新 */}
        <Button
          variant="default"
          onClick={() => form.setValues((prev) => ({ ...prev, age: prev.age + 1 }))}
        >
          年龄 +1
        </Button>

        {/* form.reset()：回到 initialValues，清错误，清 touched/dirty */}
        <Button color="red" variant="light" onClick={() => form.reset()}>
          重置
        </Button>
      </Group>

      {/* 显示当前值（uncontrolled 模式下，要刷新视图需要触发重渲染） */}
      <Code block>{JSON.stringify(form.getValues(), null, 2)}</Code>
    </Stack>
  );
}
\`\`\`

**API 速查表**：

| API | 作用 |
| --- | --- |
| \`form.values\` | 当前值（uncontrolled 模式下是快照，不触发重渲染） |
| \`form.getValues()\` | 同上，函数形式 |
| \`form.setFieldValue(path, value)\` | 改单个字段，支持嵌套路径 |
| \`form.setValues(obj)\` | 批量改值，浅合并 |
| \`form.setValues((prev) => next)\` | 函数式更新 |
| \`form.reset()\` | 重置到 initialValues + 清错误 + 清状态 |
| \`form.resetField(path)\` | 重置单个字段 |
| \`form.setInitialValues(obj)\` | 改 initialValues（影响 reset 和 dirty 判断） |
| \`form.initialize(values)\` | 一次性初始化（接口数据回填，只能调一次） |

> ⭐ 接口数据回填表单：用 \`form.initialize(data)\` 而不是 \`setValues\`。它会同时更新 initialValues，让 reset 后还能回到接口值。

---

## 七、watch：订阅字段变化

uncontrolled 模式下，\`form.values\` 不触发重渲染。要响应值变化（比如实时算总价、联动下拉），用 \`form.watch\`：

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Stack, TextInput, Text } from '@mantine/core';
import { useForm } from '@mantine/form';

export default function WatchDemo() {
  const [preview, setPreview] = useState('');

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { name: '', email: '' },
  });

  // form.watch(path, callback)：订阅某字段变化
  // callback 收到 { previousValue, value, touched, dirty }
  // 注意：内部用 useEffect 实现，必须放在组件顶层，不能放条件/循环里
  form.watch('name', ({ value }) => {
    setPreview(value);
  });

  return (
    <Stack>
      <TextInput label="姓名" key={form.key('name')} {...form.getInputProps('name')} />
      <Text c="dimmed" size="sm">实时预览：{preview || '（空）'}</Text>

      {/* 也可以监听整个对象 */}
      <Text c="blue" size="sm">
        姓名长度：{preview.length}
      </Text>
    </Stack>
  );
}
\`\`\`

**onValuesChange：监听所有字段变化**

\`\`\`jsx
const form = useForm({
  mode: 'uncontrolled',
  initialValues: { name: '', email: '' },
  // 任何字段变化都会调用，比 watch 更宽
  onValuesChange: (values) => {
    console.log('当前所有值：', values);
  },
});
\`\`\`

> ⭐ 监听单字段用 \`watch\`，监听全表用 \`onValuesChange\`。\`watch\` 是 useEffect 包装，遵守 hooks 规则——不能放 \`if\` 里。

---

## 八、touched 与 dirty 状态

- **touched**：用户「碰过」这个字段（聚焦或改过值）
- **dirty**：字段值与 initialValues 不一致（用 fast-deep-equal 比较）

\`\`\`jsx
'use client';
import { Box, Button, Group, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

export default function StatusDemo() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { name: '初始名', email: '' },
    // touchTrigger: 'change'（默认）值变化就 touched
    // touchTrigger: 'focus' 只在聚焦时才 touched
    touchTrigger: 'change',
  });

  return (
    <Box maw={400}>
      <TextInput label="姓名" key={form.key('name')} {...form.getInputProps('name')} />
      <TextInput label="邮箱" mt="sm" key={form.key('email')} {...form.getInputProps('email')} />

      <Group mt="md">
        {/* isTouched(path)：指定字段是否被碰过 */}
        <Text size="sm">姓名 touched: {String(form.isTouched('name'))}</Text>
        <Text size="sm">邮箱 touched: {String(form.isTouched('email'))}</Text>
      </Group>
      <Group>
        {/* isDirty(path)：指定字段是否被改过 */}
        <Text size="sm">姓名 dirty: {String(form.isDirty('name'))}</Text>
        {/* isDirty() 不传参：整表是否有字段 dirty */}
        <Text size="sm">整表 dirty: {String(form.isDirty())}</Text>
        <Text size="sm">整表 touched: {String(form.isTouched())}</Text>
      </Group>

      <Group mt="md">
        <Button size="xs" variant="default" onClick={() => form.resetTouched()}>
          清 touched
        </Button>
        <Button size="xs" variant="default" onClick={() => form.resetDirty()}>
          清 dirty（以当前值为新基准）
        </Button>
        <Button size="xs" color="red" variant="light" onClick={() => form.reset()}>
          完整重置
        </Button>
      </Group>
    </Box>
  );
}
\`\`\`

**典型用法**：「离开页面时弹确认」——表单 dirty 才提示。

\`\`\`jsx
useEffect(() => {
  const handler = (e) => {
    if (form.isDirty()) {
      e.preventDefault();
      e.returnValue = ''; // Chrome 需要
    }
  };
  window.addEventListener('beforeunload', handler);
  return () => window.removeEventListener('beforeunload', handler);
}, [form]);
\`\`\`

---

## 九、submitting：提交中的状态

如果 \`form.onSubmit\` 的 handler 返回 Promise，\`form.submitting\` 会自动变 true，Promise 结束后变 false。

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

// 模拟一个耗时 3 秒的接口
const fakeApi = (values) =>
  new Promise((resolve) => setTimeout(() => resolve(values), 3000));

export default function SubmittingDemo() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { name: 'John' },
  });
  const [done, setDone] = useState(false);

  // handler 是 async 函数 → form.submitting 自动管理
  const handleSubmit = async (values) => {
    await fakeApi(values);
    setDone(true);
  };

  if (done) {
    return (
      <Stack>
        <Text>提交成功！</Text>
        <Button onClick={() => setDone(false)}>返回</Button>
      </Stack>
    );
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <TextInput
        withAsterisk
        label="姓名"
        key={form.key('name')}
        {/* submitting 时禁用所有输入框，防止用户继续改 */}
        disabled={form.submitting}
        {...form.getInputProps('name')}
      />
      <Group justify="flex-end" mt="md">
        {/* loading={form.submitting}：自动显示转圈 + 禁用 */}
        <Button type="submit" loading={form.submitting}>
          {form.submitting ? '提交中...' : '提交'}
        </Button>
      </Group>
    </form>
  );
}
\`\`\`

**手动控制 submitting**：如果你想在不走 onSubmit 的情况下管理 loading（比如调外部 API 后才提交）：

\`\`\`jsx
form.setSubmitting(true);
// ...做点耗时的事
form.setSubmitting(false);
\`\`\`

> ⭐ **省心写法**：handler 写成 \`async\`，所有 loading/disabled 都用 \`form.submitting\` 驱动，不用自己 useState。

---

## 十、transformValues：提交前转换数据

接口要的数据结构常和表单结构不一样。比如表单里是 \`firstName\` + \`lastName\`，接口要 \`fullName\`。用 \`transformValues\` 在提交前转换：

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Button, Code, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

export default function TransformDemo() {
  const [result, setResult] = useState('');

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      firstName: 'Jane',
      lastName: 'Doe',
      age: '33', // 字符串！因为来自 input
    },
    // transformValues(values)：接收原始值，返回转换后的对象
    // 注意：onSubmit 拿到的是转换后的值，不是原始值
    transformValues: (values) => ({
      // 拼接全名
      fullName: \`\${values.firstName} \${values.lastName}\`,
      // 字符串转 number
      age: Number(values.age) || 0,
    }),
  });

  return (
    <div>
      <form onSubmit={form.onSubmit((values) => setResult(JSON.stringify(values, null, 2)))}>
        <TextInput label="First name" key={form.key('firstName')} {...form.getInputProps('firstName')} />
        <TextInput label="Last name" mt="sm" key={form.key('lastName')} {...form.getInputProps('lastName')} />
        <TextInput type="number" label="Age" mt="sm" key={form.key('age')} {...form.getInputProps('age')} />
        <Button type="submit" mt="md">提交</Button>
      </form>

      {result && <Code block mt="md">{result}</Code>}

      {/* 在 onSubmit 之外也能拿到转换后的值 */}
      <Button variant="subtle" mt="sm" onClick={() => console.log(form.getTransformedValues())}>
        打印转换后的值
      </Button>
    </div>
  );
}
\`\`\`

提交后 console 输出：

\`\`\`json
{
  "fullName": "Jane Doe",
  "age": 33
}
\`\`\`

> ⭐ \`transformValues\` 适合：字符串转数字、合并字段、删字段、加默认值。复杂的还是建议在 handler 里手动转。

---

## 十一、完整注册表单示例

把上面学的全用上——一个真实可用的注册表单：

\`\`\`jsx
'use client';
import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Group,
  PasswordInput,
  Stack,
  TextInput,
  Title,
  Text,
  Code,
} from '@mantine/core';
import { useForm } from '@mantine/form';

// 模拟注册接口
async function registerApi(values) {
  await new Promise((r) => setTimeout(r, 1500));
  // 模拟 10% 概率邮箱已存在
  if (Math.random() < 0.1) {
    throw new Error('邮箱已被注册');
  }
  return { userId: Date.now() };
}

export default function RegisterForm() {
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState('');

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
    validate: {
      // 姓名校验：2-20 字符
      name: (v) => (v.length < 2 || v.length > 20 ? '姓名 2-20 个字符' : null),
      // 邮箱：正则
      email: (v) => (/^\\S+@\\S+$/.test(v) ? null : '邮箱格式不正确'),
      // 密码：至少 8 位
      password: (v) => (v.length < 8 ? '密码至少 8 位' : null),
      // 确认密码：跨字段校验，第二个参数是全部值
      confirmPassword: (v, values) =>
        v !== values.password ? '两次密码不一致' : null,
      // 必须同意条款
      agreeTerms: (v) => (v ? null : '请同意条款'),
    },
    // 提交前转换：删掉 confirmPassword（接口不要）
    transformValues: (values) => ({
      name: values.name,
      email: values.email,
      password: values.password,
      agreeTerms: values.agreeTerms,
    }),
  });

  const handleSubmit = async (values) => {
    setApiError('');
    try {
      const data = await registerApi(values);
      setResult(data);
    } catch (err) {
      setApiError(err.message);
      // 接口报错时，手动给 email 字段设置错误
      if (err.message.includes('邮箱')) {
        form.setFieldError('email', err.message);
      }
    }
  };

  if (result) {
    return (
      <Stack align="center" mt={40}>
        <Title order={3} c="green">注册成功！</Title>
        <Text>用户 ID：{result.userId}</Text>
        <Button variant="subtle" onClick={() => { setResult(null); form.reset(); }}>
          再注册一个
        </Button>
      </Stack>
    );
  }

  return (
    <Box maw={460} mx="auto" mt={20}>
      <Title order={2} mb="lg">注册账号</Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            withAsterisk
            label="姓名"
            placeholder="2-20 个字符"
            key={form.key('name')}
            disabled={form.submitting}
            {...form.getInputProps('name')}
          />
          <TextInput
            withAsterisk
            label="邮箱"
            placeholder="you@example.com"
            key={form.key('email')}
            disabled={form.submitting}
            {...form.getInputProps('email')}
          />
          <PasswordInput
            withAsterisk
            label="密码"
            placeholder="至少 8 位"
            key={form.key('password')}
            disabled={form.submitting}
            {...form.getInputProps('password')}
          />
          <PasswordInput
            withAsterisk
            label="确认密码"
            placeholder="再次输入"
            key={form.key('confirmPassword')}
            disabled={form.submitting}
            {...form.getInputProps('confirmPassword')}
          />
          <Checkbox
            label="我已阅读并同意《用户协议》"
            key={form.key('agreeTerms')}
            disabled={form.submitting}
            {...form.getInputProps('agreeTerms', { type: 'checkbox' })}
          />

          {apiError && (
            <Text c="red" size="sm">{apiError}</Text>
          )}

          <Group justify="space-between" mt="md">
            <Button variant="default" type="reset" disabled={form.submitting}>
              重置
            </Button>
            <Button type="submit" loading={form.submitting}>
              {form.submitting ? '注册中...' : '注册'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
}
\`\`\`

这个例子集齐了：\`initialValues\` + \`getInputProps\` + \`validate\` + \`transformValues\` + \`submitting\` + \`setFieldError\` + \`reset\`。

---

## 小结

| API | 作用 | 使用频率 |
| --- | --- | --- |
| \`useForm({ initialValues })\` | 初始化表单 | ⭐⭐⭐ |
| \`mode: 'uncontrolled'\` | 性能模式（推荐） | ⭐⭐⭐ |
| \`form.getInputProps(path)\` | 绑定字段到组件 | ⭐⭐⭐ |
| \`form.key(path)\` | uncontrolled 模式必填 key | ⭐⭐⭐ |
| \`form.onSubmit(handler)\` | 提交包装 | ⭐⭐⭐ |
| \`form.onReset\` | 重置包装 | ⭐⭐ |
| \`form.values\` / \`form.getValues()\` | 读当前值 | ⭐⭐⭐ |
| \`form.setFieldValue(path, v)\` | 改单字段 | ⭐⭐⭐ |
| \`form.setValues(obj)\` | 批量改值 | ⭐⭐ |
| \`form.reset()\` | 重置 | ⭐⭐⭐ |
| \`form.initialize(values)\` | 接口数据回填 | ⭐⭐ |
| \`form.watch(path, cb)\` | 订阅字段变化 | ⭐⭐ |
| \`form.isTouched(path)\` | 字段是否被碰过 | ⭐⭐ |
| \`form.isDirty(path)\` | 字段是否被改过 | ⭐⭐⭐ |
| \`form.submitting\` | 提交中状态 | ⭐⭐⭐ |
| \`form.setSubmitting(bool)\` | 手动控制 submitting | ⭐ |
| \`transformValues(values)\` | 提交前转换数据 | ⭐⭐ |
| \`form.getTransformedValues()\` | 在 onSubmit 外拿转换值 | ⭐ |

下一章我们深入校验系统——这是表单的「门面」，写好校验能让用户体验飞跃。`,
  },

  // ============================================================
  // 第二十六章 表单校验全解
  // ============================================================
  {
    id: 'mantine2-ch26',
    group: '第六部分 表单进阶',
    icon: '✅',
    title: '第二十六章 表单校验全解',
    content: `## 一句话目标

彻底搞懂 Mantine 表单校验——从规则函数、内置校验器，到异步校验、校验时机、跨字段校验，最后搭出一个生产级的注册表单校验流程。

---

## 一、校验的本质：返回 error 或 null

Mantine 校验的核心契约非常简单——**一个函数，返回字符串（错误信息）或 null（通过）**：

\`\`\`js
// 校验函数的契约
const validateField = (value) => {
  // value：当前字段的值
  if (不通过) return '错误信息'; // 返回字符串/ReactNode 表示错误
  return null;                  // 返回 null 表示通过
};
\`\`\`

返回值类型：

| 返回 | 含义 |
| --- | --- |
| \`null\` / \`undefined\` | 校验通过 |
| 字符串 | 错误信息，显示在字段下方 |
| React 节点 | 可以是 JSX，比如带图标的错误 |
| \`Promise<string | null>\` | 异步校验，下章讲 |

---

## 二、字段级校验：rules 对象

最常用的方式——\`validate\` 是个对象，key 是字段路径，value 是校验函数：

\`\`\`jsx
'use client';
import { Button, NumberInput, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

export default function RulesDemo() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { name: '', email: '', age: 0 },
    validate: {
      // 每个字段对应一个校验函数
      name: (value) => (value.length < 2 ? '姓名至少 2 个字' : null),
      email: (value) => (/^\\S+@\\S+$/.test(value) ? null : '邮箱格式不正确'),
      age: (value) => (value < 18 ? '必须年满 18 岁' : null),
    },
  });

  return (
    <form onSubmit={form.onSubmit(console.log)}>
      <TextInput label="姓名" key={form.key('name')} {...form.getInputProps('name')} />
      <TextInput label="邮箱" mt="sm" key={form.key('email')} {...form.getInputProps('email')} />
      <NumberInput label="年龄" mt="sm" key={form.key('age')} {...form.getInputProps('age')} />
      <Button type="submit" mt="sm">提交</Button>
    </form>
  );
}
\`\`\`

**校验函数的完整参数**：

\`\`\`js
validate: {
  email: (value, values, path, signal) => {
    // value: 当前字段值
    // values: 整个表单值对象（用于跨字段校验）
    // path: 字段路径，如 'user.email' 或 'cart.0.price'
    // signal: AbortSignal，异步校验时用来取消旧请求
    return null;
  },
}
\`\`\`

> ⭐ 字段级校验是最推荐的方式——声明式、可读性高、易于维护。

---

## 三、表单级校验：函数式

如果校验逻辑跨多个字段、逻辑复杂，可以传一个函数：

\`\`\`jsx
'use client';
import { Box, Button, Group, NumberInput, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

export default function FunctionValidateDemo() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { name: '', age: undefined },
    // validate 是函数：接收所有 values，返回 errors 对象
    // 字段通过就 omit 或设为 null
    validate: (values) => ({
      name: values.name.length < 2 ? '姓名太短' : null,
      age:
        values.age === undefined ? '必填'
        : values.age < 18 ? '必须年满 18 岁'
        : null,
    }),
  });

  return (
    <Box maw={340} mx="auto">
      <form onSubmit={form.onSubmit((v) => console.log(v))}>
        <TextInput label="姓名" key={form.key('name')} {...form.getInputProps('name')} />
        <NumberInput label="年龄" mt="sm" key={form.key('age')} {...form.getInputProps('age')} />
        <Group justify="flex-end" mt="md">
          <Button type="submit">提交</Button>
        </Group>
      </form>
    </Box>
  );
}
\`\`\`

**字段级 vs 表单级对比**：

| 维度 | 字段级（rules 对象） | 表单级（函数） |
| --- | --- | --- |
| 写法 | \`{ name: fn }\` | \`(values) => ({ name: ... })\` |
| 可读性 | 高，一目了然 | 中，所有规则混一起 |
| 跨字段 | 通过第二参数 values | 直接访问 |
| 性能 | 只校验改动字段 | 整表校验 |
| 推荐 | 90% 场景 | 复杂联动时 |

---

## 四、内置校验规则

\`@mantine/form\` 自带一组常用校验函数，不用自己写正则：

\`\`\`jsx
'use client';
import { Button, Group, NativeSelect, NumberInput, TextInput } from '@mantine/core';
import {
  useForm,
  isNotEmpty,
  isEmail,
  isInRange,
  hasLength,
  matches,
  matchesField,
  isUrl,
  isOneOf,
  isJSONString,
} from '@mantine/form';

export default function BuiltInValidatorsDemo() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      job: '',
      email: '',
      favoriteColor: '',
      age: 18,
      website: '',
      role: '',
      password: '',
      confirmPassword: '',
      json: '',
    },
    validate: {
      // hasLength：长度限制
      // - hasLength(5)：正好 5
      // - hasLength({ min: 2, max: 10 })：2-10
      // - hasLength({ min: 2 })：至少 2
      // 第二参数是错误消息（可选）
      name: hasLength({ min: 2, max: 10 }, '姓名 2-10 个字符'),

      // isNotEmpty：非空（空字符串/false/null/空数组都算空）
      job: isNotEmpty('请输入职业'),

      // isEmail：邮箱格式
      email: isEmail('邮箱格式不正确'),

      // matches：正则匹配（颜色 #fff 或 #ffffff）
      favoriteColor: matches(/^#([0-9a-f]{3}){1,2}$/, '请输入合法的十六进制颜色'),

      // isInRange：数值范围
      age: isInRange({ min: 18, max: 99 }, '年龄必须在 18-99 之间'),

      // isUrl：URL 格式
      website: isUrl('URL 格式不正确'),

      // isOneOf：枚举值
      role: isOneOf(['developer', 'designer', 'manager'], '请选择有效角色'),

      // matchesField：与另一字段相等（密码确认经典场景）
      confirmPassword: matchesField('password', '两次密码不一致'),

      // isJSONString：JSON 字符串校验
      json: isJSONString('不是合法的 JSON'),
    },
  });

  return (
    <form onSubmit={form.onSubmit(() => alert('校验通过'))}>
      <TextInput label="姓名" key={form.key('name')} {...form.getInputProps('name')} />
      <TextInput label="职业" mt="sm" key={form.key('job')} {...form.getInputProps('job')} />
      <TextInput label="邮箱" mt="sm" key={form.key('email')} {...form.getInputProps('email')} />
      <TextInput label="喜爱的颜色 (#fff)" mt="sm" key={form.key('favoriteColor')} {...form.getInputProps('favoriteColor')} />
      <NumberInput label="年龄" mt="sm" key={form.key('age')} {...form.getInputProps('age')} />
      <TextInput label="网站" mt="sm" placeholder="https://..." key={form.key('website')} {...form.getInputProps('website')} />
      <NativeSelect
        label="角色"
        mt="sm"
        data={['', 'developer', 'designer', 'manager']}
        key={form.key('role')}
        {...form.getInputProps('role')}
      />
      <TextInput label="密码" mt="sm" key={form.key('password')} {...form.getInputProps('password')} />
      <TextInput label="确认密码" mt="sm" key={form.key('confirmPassword')} {...form.getInputProps('confirmPassword')} />
      <TextInput label="JSON 字符串" mt="sm" placeholder='{"key":"value"}' key={form.key('json')} {...form.getInputProps('json')} />
      <Button type="submit" mt="md">提交</Button>
    </form>
  );
}
\`\`\`

**所有内置校验器一览**：

| 校验器 | 作用 | 示例 |
| --- | --- | --- |
| \`isNotEmpty(msg)\` | 非空 | \`isNotEmpty('必填')\` |
| \`isEmail(msg)\` | 邮箱 | \`isEmail('邮箱不合法')\` |
| \`hasLength({min,max}, msg)\` | 长度范围 | \`hasLength({ min: 6 }, '至少 6 位')\` |
| \`isInRange({min,max}, msg)\` | 数值范围 | \`isInRange({ min: 0, max: 100 }, '0-100')\` |
| \`matches(regexp, msg)\` | 正则匹配 | \`matches(/^1[3-9]\\d{9}$/, '手机号不对')\` |
| \`matchesField(path, msg)\` | 等于另一字段 | \`matchesField('password', '不一致')\` |
| \`isUrl(opts, msg)\` | URL 校验 | \`isUrl({ allowLocalhost: true }, 'URL 不对')\` |
| \`isOneOf(list, msg)\` | 枚举值 | \`isOneOf(['A','B'], '只能 A 或 B')\` |
| \`isJSONString(msg)\` | JSON 字符串 | \`isJSONString('JSON 不合法')\` |
| \`isNotEmptyHTML(msg)\` | 富文本非空 | \`isNotEmptyHTML('内容必填')\` |

> ⭐ 所有 \`msg\` 参数都是可选的——不传时只显示红色边框，不显示文字。生产环境建议都传。

---

## 五、跨字段校验

校验「确认密码」需要读另一个字段。两种写法：

**写法一：用第二参数 values（字段级）**

\`\`\`jsx
validate: {
  confirmPassword: (value, values) =>
    value !== values.password ? '两次密码不一致' : null,
}
\`\`\`

**写法二：用 matchesField（更简洁）**

\`\`\`jsx
import { matchesField } from '@mantine/form';

validate: {
  confirmPassword: matchesField('password', '两次密码不一致'),
}
\`\`\`

**写法三：用 formRootRule 校验对象组合**

当你要校验「对象整体」而非单字段（比如起止日期关系）：

\`\`\`jsx
import { formRootRule, isNotEmpty, useForm } from '@mantine/form';

const form = useForm({
  mode: 'uncontrolled',
  initialValues: {
    user: { firstName: '', lastName: '' },
  },
  validate: {
    user: {
      // formRootRule：校验整个 user 对象
      [formRootRule]: (value) =>
        value.firstName.trim().length > 0 && value.firstName === value.lastName
          ? '姓和名不能相同'
          : null,
      // 同时还能校验子字段
      firstName: isNotEmpty('姓必填'),
      lastName: isNotEmpty('名必填'),
    },
  },
});
\`\`\`

> ⭐ \`formRootRule\` 是 \`@mantine/form\` 导出的特殊 symbol，用来给「对象/数组本身」加校验，常配合嵌套字段使用。

---

## 六、异步校验：返回 Promise

校验用户名是否被占用、邮箱是否已注册——这种要查接口的场景，校验函数返回 Promise 即可：

\`\`\`jsx
'use client';
import { Button, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

// 模拟接口：admin 已被占用
async function checkUsername(name) {
  await new Promise((r) => setTimeout(r, 500)); // 模拟网络延迟
  return name === 'admin'; // true = 已占用
}

export default function AsyncValidateDemo() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { username: '' },
    validate: {
      // 返回 Promise<string | null> 即是异步校验
      username: async (value, values, path, signal) => {
        if (value.length < 3) return '用户名至少 3 位';

        // signal：当用户继续输入触发新校验时，旧请求会被 abort
        // 用 signal 可以取消 fetch 请求：
        // const res = await fetch('/api/check?name=' + value, { signal });
        const taken = await checkUsername(value);
        return taken ? '用户名已被占用' : null;
      },
    },
  });

  return (
    <form onSubmit={form.onSubmit(() => alert('校验通过'))}>
      <TextInput
        withAsterisk
        label="用户名"
        placeholder="试试 admin"
        key={form.key('username')}
        // form.validating：异步校验进行中
        // form.isValidating('username')：指定字段在异步校验
        rightSection={form.isValidating('username') ? '...' : null}
        {...form.getInputProps('username')}
      />
      <Button type="submit" mt="md" loading={form.submitting}>
        提交
      </Button>
    </form>
  );
}
\`\`\`

**关键点**：

1. **返回 Promise** → 自动识别为异步校验
2. **\`form.validating\`** → true 表示有异步校验在进行
3. **\`form.isValidating(path)\`** → 指定字段是否在校验中
4. **\`signal\`** → 用户继续输入时，旧请求会被 abort，避免竞态。配合 \`fetch(url, { signal })\` 使用最佳

> ⭐ 异步校验默认在 **onBlur** 触发（避免每次按键都查接口）。如果要在 onChange 触发，配 \`validateInputOnChange: true\`。

---

## 七、校验时机：onChange / onBlur / onSubmit

默认情况下，Mantine 校验时机：

- **onChange**：不校验（避免用户输一半就报错）
- **onBlur**：不校验（默认行为，下面会改）
- **onSubmit**：必校验

可以通过选项改：

\`\`\`jsx
const form = useForm({
  mode: 'uncontrolled',

  // validateInputOnChange: true → 所有字段在 onChange 时校验
  // 适合实时反馈的场景，但可能骚扰用户
  validateInputOnChange: true,

  // 或者只对指定字段开启 onChange 校验
  // validateInputOnChange: ['name', 'email'],

  // validateInputOnBlur: true → 所有字段在 onBlur 时校验
  validateInputOnBlur: true,

  // 同样支持字段数组
  // validateInputOnBlur: ['name', \`jobs.\${FORM_INDEX}.title\`],
});
\`\`\`

**FORM_INDEX 占位符**：数组字段校验时用 \`FORM_INDEX\` 代替具体索引，规则会应用到数组所有元素：

\`\`\`jsx
import { FORM_INDEX, useForm } from '@mantine/form';

const form = useForm({
  mode: 'uncontrolled',
  validateInputOnChange: [
    'email',
    'name',
    // jobs 数组下所有 title 字段都开启 onChange 校验
    \`jobs.\${FORM_INDEX}.title\`,
  ],
  initialValues: {
    name: '',
    email: '',
    jobs: [{ title: '' }, { title: '' }],
  },
  validate: {
    name: (v) => (v.length < 2 ? '太短' : null),
    email: (v) => (/^\\S+@\\S+$/.test(v) ? null : '邮箱不对'),
    jobs: {
      title: (v) => (v.length < 2 ? '职位太短' : null),
    },
  },
});
\`\`\`

**clearInputErrorOnChange**：用户改值时，是否清掉字段的错误？默认 \`true\`（清掉）。如果设 \`false\`，错误会一直显示直到下次校验：

\`\`\`jsx
const form = useForm({
  mode: 'uncontrolled',
  clearInputErrorOnChange: false, // 改值不清错误
});
\`\`\`

> ⭐ **推荐组合**：必填字段用 \`validateInputOnBlur: true\`（用户填完离开时校验），异步校验字段（如用户名查重）配 \`validateInputOnChange: ['username']\` 实时校验。

---

## 八、手动控制错误：setErrors / setFieldError / clearErrors

有时错误来自接口（比如登录返回「密码错误」），这时要手动设置错误：

\`\`\`jsx
'use client';
import { Button, Group, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

export default function ManualErrorDemo() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { username: '', password: '' },
    validate: {
      username: (v) => (v.length < 2 ? '用户名太短' : null),
      password: (v) => (v.length < 6 ? '密码至少 6 位' : null),
    },
  });

  const handleSubmit = async (values) => {
    // 模拟调接口
    const res = await fakeLogin(values);
    if (!res.ok) {
      // setFieldError(path, msg)：给单个字段设错误
      // 接口说密码错，就标在 password 字段上
      form.setFieldError('password', '用户名或密码错误');
      return;
    }
    alert('登录成功');
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <TextInput label="用户名" key={form.key('username')} {...form.getInputProps('username')} />
      <TextInput label="密码" mt="sm" key={form.key('password')} {...form.getInputProps('password')} />

      <Group mt="md">
        <Button type="submit">登录</Button>
        {/* clearFieldError(path)：清单个字段错误 */}
        <Button variant="default" onClick={() => form.clearFieldError('password')}>
          清密码错误
        </Button>
        {/* clearErrors()：清所有错误 */}
        <Button variant="default" onClick={() => form.clearErrors()}>
          清所有错误
        </Button>
        {/* setErrors(obj)：一次设多个错误 */}
        <Button
          variant="default"
          onClick={() => form.setErrors({ username: 'A 错', password: 'B 错' })}
        >
          设多个错误
        </Button>
      </Group>

      <pre style={{ marginTop: 12, fontSize: 12 }}>
        当前错误：{JSON.stringify(form.errors, null, 2)}
      </pre>
    </form>
  );
}

// 模拟登录接口
async function fakeLogin(values) {
  await new Promise((r) => setTimeout(r, 300));
  if (values.username === 'admin' && values.password === '123456') {
    return { ok: true };
  }
  return { ok: false };
}
\`\`\`

**错误 API 速查**：

| API | 作用 |
| --- | --- |
| \`form.errors\` | 当前所有错误（对象） |
| \`form.setErrors({ a: 'msg' })\` | 一次性设多个错误（覆盖） |
| \`form.setFieldError(path, msg)\` | 设单个字段错误 |
| \`form.clearErrors()\` | 清所有错误 |
| \`form.clearFieldError(path)\` | 清单个字段错误 |

---

## 九、手动触发校验

不一定要走 \`onSubmit\`，可以手动校验：

\`\`\`jsx
'use client';
import { Button, Group, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

export default function ManualValidateDemo() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { name: '', email: '' },
    validate: {
      name: (v) => (v.length < 2 ? '太短' : null),
      email: (v) => (/^\\S+@\\S+$/.test(v) ? null : '邮箱不对'),
    },
  });

  const handleClick = async () => {
    // form.validate()：校验所有字段，返回 { hasErrors, errors }
    const result = await form.validate();
    if (result.hasErrors) {
      console.log('有错：', result.errors);
    } else {
      console.log('全通过，值：', form.getValues());
    }
  };

  const checkEmailOnly = async () => {
    // form.validateField(path)：只校验单个字段
    const result = await form.validateField('email');
    console.log('email 校验结果：', result);
  };

  const checkIsValid = async () => {
    // form.isValid()：返回 boolean，不设置 form.errors
    // 适合「检查能不能进入下一步」
    const valid = await form.isValid();
    alert(valid ? '可以提交' : '还有错');
  };

  return (
    <div>
      <TextInput label="姓名" key={form.key('name')} {...form.getInputProps('name')} />
      <TextInput label="邮箱" mt="sm" key={form.key('email')} {...form.getInputProps('email')} />

      <Group mt="md">
        <Button onClick={handleClick}>校验全部</Button>
        <Button variant="default" onClick={checkEmailOnly}>只校验邮箱</Button>
        <Button variant="default" onClick={checkIsValid}>检查是否有效</Button>
      </Group>
    </div>
  );
}
\`\`\`

**校验 API 对比**：

| API | 是否设 errors | 返回值 | 用途 |
| --- | --- | --- | --- |
| \`form.validate()\` | 是 | \`{ hasErrors, errors }\` | 提交前完整校验 |
| \`form.validateField(path)\` | 是 | \`{ hasError, error }\` | 单字段校验 |
| \`form.isValid()\` | 否 | \`Promise<boolean>\` | 不污染状态地检查 |
| \`form.isValid(path)\` | 否 | \`Promise<boolean>\` | 单字段检查 |

---

## 十、自定义错误消息

错误消息不一定是字符串，可以是任意 React 节点——加图标、加链接都行：

\`\`\`jsx
'use client';
import { Anchor, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

export default function CustomErrorDemo() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { email: '' },
    validate: {
      email: (value) => {
        if (value.length === 0) {
          // 字符串消息
          return '邮箱必填';
        }
        if (!/^\\S+@\\S+$/.test(value)) {
          // JSX 消息：可以放链接、图标
          return (
            <Text c="red" size="sm">
              邮箱格式不对，
              <Anchor size="sm" href="https://help.example.com/email" target="_blank">
                查看帮助
              </Anchor>
            </Text>
          );
        }
        return null;
      },
    },
  });

  return (
    <form onSubmit={form.onSubmit(() => {})}>
      <TextInput
        label="邮箱"
        placeholder="you@example.com"
        key={form.key('email')}
        {...form.getInputProps('email')}
      />
    </form>
  );
}
\`\`\`

> ⭐ 错误消息国际化：把所有消息抽到 i18n 字典里，校验函数从字典取消息即可。

---

## 十一、onSubmit 中处理校验失败

\`form.onSubmit\` 第二个参数是「校验失败回调」，常用来弹通知：

\`\`\`jsx
'use client';
import { Button, Group, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

export default function SubmitErrorHandlerDemo() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { name: '', email: '' },
    validate: {
      name: (v) => (v.length < 2 ? '姓名太短' : null),
      email: (v) => (/^\\S+@\\S+$/.test(v) ? null : '邮箱不对'),
    },
  });

  return (
    <form
      onSubmit={form.onSubmit(
        (values) => {
          // 校验通过
          notifications.show({
            title: '提交成功',
            message: \`欢迎 \${values.name}！\`,
            color: 'green',
          });
        },
        (errors, values, event) => {
          // 校验失败，弹红色通知
          notifications.show({
            title: '请检查表单',
            message: \`还有 \${Object.keys(errors).length} 个字段未通过\`,
            color: 'red',
          });
        }
      )}
    >
      <TextInput label="姓名" key={form.key('name')} {...form.getInputProps('name')} />
      <TextInput label="邮箱" mt="sm" key={form.key('email')} {...form.getInputProps('email')} />
      <Button type="submit" mt="md">提交</Button>
    </form>
  );
}
\`\`\`

---

## 十二、实战：注册表单完整校验

综合所有知识点，写一个生产级校验流程：

\`\`\`jsx
'use client';
import { useState } from 'react';
import {
  Anchor,
  Box,
  Button,
  Checkbox,
  Group,
  PasswordInput,
  Progress,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { isEmail, isNotEmpty, matchesField, useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

// 异步检查用户名
async function checkUsernameAvailable(name, signal) {
  await new Promise((r) => setTimeout(r, 600));
  const taken = ['admin', 'test', 'root', 'user'].includes(name.toLowerCase());
  return !taken;
}

// 密码强度计算（0-100）
function passwordStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score += 25;
  if (pwd.length >= 12) score += 15;
  if (/[A-Z]/.test(pwd)) score += 15;
  if (/[a-z]/.test(pwd)) score += 15;
  if (/[0-9]/.test(pwd)) score += 15;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 15;
  return Math.min(100, score);
}

export default function FullRegisterForm() {
  const [strength, setStrength] = useState(0);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
    // 校验时机配置
    validateInputOnBlur: true,                  // 所有字段离开时校验
    validateInputOnChange: ['password'],        // 密码实时校验（算强度）
    validate: {
      // 用户名：异步校验是否被占用
      username: async (value, _values, _path, signal) => {
        if (value.length < 3) return '用户名至少 3 位';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return '只能字母数字下划线';
        const available = await checkUsernameAvailable(value, signal);
        return available ? null : '用户名已被占用';
      },
      email: isEmail('邮箱格式不正确'),
      password: (v) => {
        if (v.length < 8) return '密码至少 8 位';
        if (!/[A-Z]/.test(v)) return '需包含大写字母';
        if (!/[0-9]/.test(v)) return '需包含数字';
        return null;
      },
      confirmPassword: matchesField('password', '两次密码不一致'),
      agreeTerms: (v) => (v ? null : '必须同意条款才能注册'),
    },
  });

  // watch 密码：实时算强度
  form.watch('password', ({ value }) => {
    setStrength(passwordStrength(value));
  });

  const handleSubmit = async (values) => {
    // 模拟提交
    await new Promise((r) => setTimeout(r, 1000));
    notifications.show({
      title: '注册成功',
      message: \`欢迎 \${values.username}！\`,
      color: 'green',
    });
    form.reset();
    setStrength(0);
  };

  const strengthLabel =
    strength < 30 ? '弱' : strength < 60 ? '中' : strength < 90 ? '强' : '非常强';
  const strengthColor =
    strength < 30 ? 'red' : strength < 60 ? 'orange' : strength < 90 ? 'blue' : 'green';

  return (
    <Box maw={460} mx="auto" mt={20}>
      <Title order={2} mb="lg">创建账号</Title>

      <form onSubmit={form.onSubmit(handleSubmit, (errors) => {
        notifications.show({
          title: '请检查表单',
          message: \`还有 \${Object.keys(errors).length} 个错误\`,
          color: 'red',
        });
      })}>
        <Stack gap="md">
          <TextInput
            withAsterisk
            label="用户名"
            placeholder="3-20 位字母数字下划线"
            description="试试 admin（会被占用）"
            key={form.key('username')}
            rightSection={form.isValidating('username') ? <Text size="xs">...</Text> : null}
            {...form.getInputProps('username')}
          />
          <TextInput
            withAsterisk
            label="邮箱"
            placeholder="you@example.com"
            key={form.key('email')}
            {...form.getInputProps('email')}
          />
          <div>
            <PasswordInput
              withAsterisk
              label="密码"
              placeholder="至少 8 位，含大写和数字"
              key={form.key('password')}
              {...form.getInputProps('password')}
            />
            {/* 密码强度条 */}
            {form.getValues().password && (
              <Group gap="xs" mt="xs">
                <Progress value={strength} color={strengthColor} size="sm" style={{ flex: 1 }} />
                <Text size="xs" c={strengthColor}>{strengthLabel}</Text>
              </Group>
            )}
          </div>
          <PasswordInput
            withAsterisk
            label="确认密码"
            placeholder="再次输入密码"
            key={form.key('confirmPassword')}
            {...form.getInputProps('confirmPassword')}
          />
          <Checkbox
            label={<>我已阅读并同意 <Anchor href="#" size="sm">用户协议</Anchor></>}
            key={form.key('agreeTerms')}
            {...form.getInputProps('agreeTerms', { type: 'checkbox' })}
          />

          <Group justify="space-between" mt="md">
            <Button variant="default" type="reset" onClick={() => setStrength(0)}>
              重置
            </Button>
            <Button type="submit" loading={form.submitting}>
              注册
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
}
\`\`\`

这个实战集成了：\`isEmail\`/\`isNotEmpty\`/\`matchesField\` 内置校验器 + 异步校验 + \`signal\` 取消 + 跨字段校验 + \`validateInputOnChange\`/\`validateInputOnBlur\` 时机控制 + \`form.watch\` 联动 + \`form.submitting\` + \`onSubmit\` 错误回调 + 通知系统。

---

## 小结

| 知识点 | 关键 API |
| --- | --- |
| 校验契约 | 返回 string/JSX 或 null |
| 字段级校验 | \`validate: { field: fn }\` |
| 表单级校验 | \`validate: (values) => errors\` |
| 内置校验器 | \`isNotEmpty/isEmail/hasLength/isInRange/matches/matchesField/isUrl/isOneOf/isJSONString/isNotEmptyHTML\` |
| 异步校验 | 返回 \`Promise<string | null>\` |
| 取消旧请求 | 用第四参数 \`signal\` 配 \`fetch(url, { signal })\` |
| 跨字段校验 | 第二参数 \`values\` 或 \`matchesField\` |
| 对象/数组自身校验 | \`[formRootRule]: fn\` |
| 校验时机 | \`validateInputOnChange\`/\`validateInputOnBlur\`（bool 或 path 数组） |
| 数组字段时机 | \`\` \`jobs.\${FORM_INDEX}.title\` \`\` |
| 手动校验 | \`form.validate()\`/\`form.validateField()\`/\`form.isValid()\` |
| 设错误 | \`form.setErrors\`/\`form.setFieldError\` |
| 清错误 | \`form.clearErrors\`/\`form.clearFieldError\` |
| 提交失败处理 | \`form.onSubmit(handleSubmit, handleErrors)\` |
| 异步校验状态 | \`form.validating\`/\`form.isValidating(path)\` |

下一章我们挑战表单的「Boss 关」——动态字段和嵌套结构。`,
  },

  // ============================================================
  // 第二十七章 动态表单与嵌套字段
  // ============================================================
  {
    id: 'mantine2-ch27',
    group: '第六部分 表单进阶',
    icon: '🔧',
    title: '第二十七章 动态表单与嵌套字段',
    content: `## 一句话目标

掌握 Mantine 表单的「Boss 关」——嵌套对象字段、数组字段、动态增删行，搭出动态问卷、订单明细等复杂表单，告别手写\`useState\`数组的痛苦。

---

## 一、属性路径语法

Mantine 表单的所有 API（\`getInputProps\`、\`setFieldValue\`、\`validateField\` 等）第一个参数都是「属性路径」。

路径语法用**点号**分隔，数组用**数字索引**：

\`\`\`js
const form = useForm({
  mode: 'uncontrolled',
  initialValues: {
    name: '',                          // 顶层字段
    user: {                            // 嵌套对象
      firstName: 'John',
      lastName: 'Doe',
    },
    fruits: [                          // 数组
      { name: 'Banana', available: true },
      { name: 'Orange', available: false },
    ],
    deeply: {                          // 深层嵌套
      nested: {
        object: [{ item: 1 }, { item: 2 }],
      },
    },
  },
});

// 顶层字段
form.getInputProps('name');

// 嵌套对象字段
form.getInputProps('user.firstName');

// 数组里的字段：用数字索引
form.getInputProps('fruits.0.name');
form.getInputProps('fruits.1.available');

// 深层嵌套 + 数组
form.getInputProps('deeply.nested.object.0.item');

// setFieldValue 也支持任意深度路径
form.setFieldValue('fruits.1.name', 'Carrot');
form.setFieldValue('user', { firstName: 'Jane', lastName: 'Loe' }); // 整对象替换

// 校验也支持嵌套路径
await form.validateField('deeply.nested.object.0.item');
\`\`\`

> ⭐ 路径语法 = JS 对象访问，但用点号 + 数字。Mantine 内部会自动解析。

---

## 二、嵌套对象字段

最常见场景：用户表单里有「联系人」对象，联系人里有 \`firstName\`/\`lastName\`/\`phone\`。

\`\`\`jsx
'use client';
import { Box, Checkbox, TextInput, Title, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';

export default function NestedObjectDemo() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      terms: false,
      user: {
        firstName: '',
        lastName: '',
        phone: '',
      },
    },
    // 嵌套对象的校验：用嵌套对象写
    validate: {
      user: {
        firstName: (v) => (v.length < 2 ? '名至少 2 字' : null),
        lastName: (v) => (v.length < 2 ? '姓至少 2 字' : null),
        phone: (v) => (/^1[3-9]\\d{9}$/.test(v) ? null : '手机号不对'),
      },
    },
  });

  return (
    <Box maw={420} mx="auto">
      <Title order={3} mb="md">用户信息</Title>
      <form onSubmit={form.onSubmit((v) => console.log(v))}>
        <Stack gap="sm">
          {/* 嵌套字段：路径用点号 user.firstName */}
          <TextInput
            label="名"
            key={form.key('user.firstName')}
            {...form.getInputProps('user.firstName')}
          />
          <TextInput
            label="姓"
            key={form.key('user.lastName')}
            {...form.getInputProps('user.lastName')}
          />
          <TextInput
            label="手机号"
            placeholder="13800138000"
            key={form.key('user.phone')}
            {...form.getInputProps('user.phone')}
          />
          <Checkbox
            label="同意条款"
            mt="sm"
            key={form.key('terms')}
            {...form.getInputProps('terms', { type: 'checkbox' })}
          />
        </Stack>
      </form>
    </Box>
  );
}
\`\`\`

**校验错误对象的 key**：

校验后 \`form.errors\` 的 key 是**完整路径**（用点号），不是嵌套对象：

\`\`\`js
form.errors;
// {
//   'user.firstName': '名至少 2 字',
//   'user.phone': '手机号不对',
// }
\`\`\`

---

## 三、嵌套对象的两种 set 方式

\`\`\`jsx
const form = useForm({
  mode: 'uncontrolled',
  initialValues: {
    user: { name: '', occupation: '' },
  },
});

// 方式一：逐字段设值
form.setFieldValue('user.name', 'John');
form.setFieldValue('user.occupation', 'Engineer');

// 方式二：整对象替换
form.setFieldValue('user', { name: 'Jane', occupation: 'Architect' });

// 方式三：用 setValues 批量设值（浅合并）
form.setValues({
  user: { name: 'Bob', occupation: 'Chef' },
});
\`\`\`

---

## 四、数组字段：基础用法

数组字段是动态表单的核心——动态问卷、订单明细、员工列表都用它。

Mantine 数组字段的写法关键是：**用 \`.map\` 渲染 + 用 \`\` \`list.\${index}.field\` \`\` 路径绑定**。

\`\`\`jsx
'use client';
import { ActionIcon, Box, Button, Group, Switch, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { randomId } from '@mantine/hooks';
import { IconTrash } from '@tabler/icons-react';

export default function ArrayBasicDemo() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      // 数组字段：每个元素自带一个稳定的 key（用于 React 列表渲染）
      employees: [
        { name: '', active: false, key: randomId() },
      ],
    },
  });

  // 关键：用 form.getValues() 拿当前值，map 渲染
  // 注意：不能直接用 form.values.employees，因为 uncontrolled 模式下不触发重渲染
  // 改用 form.getValues() + 依赖 useState/外部触发来刷新
  // 这里依赖 insertListItem/removeListItem 自带的刷新机制
  const fields = form.getValues().employees.map((item, index) => (
    // key 用 item.key（不是 index），避免增删时 React 复用错组件
    <Group key={item.key} mt="xs">
      <TextInput
        placeholder="John Doe"
        withAsterisk
        style={{ flex: 1 }}
        // 路径用模板字符串：employees.\${index}.name
        key={form.key(\`employees.\${index}.name\`)}
        {...form.getInputProps(\`employees.\${index}.name\`)}
      />
      <Switch
        label="在职"
        key={form.key(\`employees.\${index}.active\`)}
        {...form.getInputProps(\`employees.\${index}.active\`, { type: 'checkbox' })}
      />
      <ActionIcon color="red" onClick={() => form.removeListItem('employees', index)}>
        <IconTrash size={16} />
      </ActionIcon>
    </Group>
  ));

  return (
    <Box maw={500} mx="auto">
      <Title order={3} mb="md">员工列表</Title>
      <form onSubmit={form.onSubmit((v) => console.log(v))}>
        {fields.length > 0 ? (
          <Group mb="xs">
            <Text fw={500} size="sm" style={{ flex: 1 }}>姓名</Text>
            <Text fw={500} size="sm" pr={90}>状态</Text>
          </Group>
        ) : (
          <Text c="dimmed" ta="center">暂无员工</Text>
        )}

        {fields}

        <Group justify="center" mt="md">
          <Button
            variant="default"
            onClick={() => form.insertListItem('employees', {
              name: '',
              active: false,
              key: randomId(), // 必须给稳定 key
            })}
          >
            添加员工
          </Button>
        </Group>
        <Group justify="flex-end" mt="md">
          <Button type="submit">提交</Button>
        </Group>
      </form>
    </Box>
  );
}
\`\`\`

**两个关键细节**：

1. **每条数据带 \`key: randomId()\`**：Mantine 文档推荐做法。给每行一个稳定 ID 作为 React key，避免增删时输入框错位。
2. **\`form.key(\`path\`)\` 也要给**：uncontrolled 模式下，每个字段都需要稳定 key。

---

## 五、数组操作 API 全解

Mantine 提供四个数组操作方法：

### 5.1 insertListItem：添加

\`\`\`jsx
// 在末尾添加
form.insertListItem('employees', { name: '', active: false, key: randomId() });

// 在指定位置插入（第二个参数是 index）
// 如果 index 大于数组长度，插在末尾
form.insertListItem('employees', { name: 'New', active: true, key: randomId() }, 1);
\`\`\`

### 5.2 removeListItem：删除

\`\`\`jsx
// 删除指定 index 的元素
form.removeListItem('employees', 1);

// 删除后，后面的元素自动前移
// form.getValues().employees.length 自动减 1
\`\`\`

### 5.3 replaceListItem：替换

\`\`\`jsx
// 替换指定 index 的元素
form.replaceListItem('employees', 1, {
  name: 'Replaced',
  active: true,
  key: randomId(),
});
\`\`\`

### 5.4 reorderListItem：重排序

\`\`\`jsx
// 把 index 1 的元素移到 index 0
form.reorderListItem('employees', { from: 1, to: 0 });

// 适合实现拖拽排序后更新数据
\`\`\`

**API 速查**：

| API | 作用 |
| --- | --- |
| \`insertListItem(path, item, index?)\` | 添加元素，不传 index 加末尾 |
| \`removeListItem(path, index)\` | 删除指定 index |
| \`replaceListItem(path, index, newItem)\` | 替换指定 index |
| \`reorderListItem(path, { from, to })\` | 重排序（移动） |

---

## 六、为什么 Mantine 不需要 useFieldArray

如果你用过 React Hook Form，会记得它有 \`useFieldArray\` hook。Mantine 没有——为什么？

**因为 \`getInputProps\` 的路径语法已经覆盖了数组**。RHF 的 \`useFieldArray\` 主要是为了：

1. 提供 \`fields.map\` 渲染（Mantine 直接 \`form.getValues().list.map\`）
2. 提供 \`append\`/\`remove\`/\`move\` 等方法（Mantine 直接 \`form.insertListItem\` 等）
3. 维护稳定 key（Mantine 让你自己加 \`key: randomId()\`）

Mantine 的设计哲学是**少抽象、直接操作**——少一个 hook，少一层心智负担。代价是要自己加 \`randomId()\`。

> ⭐ 如果你想要类 RHF 的封装，可以自己写个薄包装：把 \`form.getValues().list.map\` 和 \`form.insertListItem\` 等组合成自定义 hook。但 90% 场景直接用 \`form.xxxListItem\` 更清晰。

---

## 七、数组字段校验

数组字段的校验写法略特殊——用嵌套对象，但字段名不带索引：

\`\`\`jsx
const form = useForm({
  mode: 'uncontrolled',
  initialValues: {
    users: [
      { name: 'John', age: 12 },
      { name: '', age: 22 },
    ],
  },
  validate: {
    // 注意：users 是个嵌套对象，里面的 key 是字段名（不带索引）
    // Mantine 会自动把规则应用到数组所有元素
    users: {
      name: (value) => (value.length < 2 ? '名字至少 2 字' : null),
      age: (value) => (value < 18 ? '必须年满 18' : null),
    },
  },
});

// 校验后 errors 的 key 是带索引的：
// form.errors = {
//   'users.0.age': '必须年满 18',
//   'users.1.name': '名字至少 2 字',
// }
\`\`\`

**用 FORM_INDEX 区分索引**：

如果不同位置的元素规则不一样（罕见），用 \`FORM_INDEX\` 占位符：

\`\`\`jsx
import { FORM_INDEX, useForm } from '@mantine/form';

const form = useForm({
  mode: 'uncontrolled',
  initialValues: { list: [{ x: 1 }, { x: 2 }] },
  validate: {
    list: {
      x: (value, values, path) => {
        // path 会是 'list.0.x' / 'list.1.x' 等
        // 可以从 path 提取索引做差异化校验
        const index = Number(path.split('.')[1]);
        return index === 0 && value < 5 ? '第一个至少 5' : null;
      },
    },
  },
});
\`\`\`

**用 formRootRule 校验数组本身**：

「至少要有一行」这种规则，用 \`formRootRule\`：

\`\`\`jsx
import { formRootRule, isNotEmpty, useForm } from '@mantine/form';

const form = useForm({
  mode: 'uncontrolled',
  initialValues: {
    employees: [{ name: '', active: false, key: randomId() }],
  },
  validate: {
    employees: {
      // formRootRule：校验整个数组
      [formRootRule]: isNotEmpty('至少要有一个员工'),
      // 同时校验子字段
      name: isNotEmpty('姓名必填'),
    },
  },
});
\`\`\`

---

## 八、form.watch 监听数组变化

\`form.watch\` 也能监听数组字段——任何子字段变化，或 \`insertListItem\`/\`removeListItem\` 等操作都会触发：

\`\`\`jsx
'use client';
import { useState } from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Code,
  Group,
  NumberInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { randomId } from '@mantine/hooks';
import { IconTrash } from '@tabler/icons-react';

export default function WatchArrayDemo() {
  const [total, setTotal] = useState(0);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      products: [
        { name: 'Apple', price: 2, quantity: 3, key: randomId() },
        { name: 'Orange', price: 1, quantity: 5, key: randomId() },
      ],
    },
  });

  // 监听整个 products 数组：
  // 任何子字段（name/price/quantity）变化，或增删行，都会触发
  form.watch('products', ({ value }) => {
    setTotal(value.reduce((acc, item) => acc + item.price * item.quantity, 0));
  });

  return (
    <Stack>
      <Title order={3}>购物车</Title>
      <Text fw={700} size="lg">总价：\${total}</Text>

      {form.getValues().products.map((item, index) => (
        <Group key={item.key} align="flex-end">
          <TextInput
            label="名称"
            style={{ flex: 1 }}
            key={form.key(\`products.\${index}.name\`)}
            {...form.getInputProps(\`products.\${index}.name\`)}
          />
          <NumberInput
            label="单价"
            style={{ width: 100 }}
            key={form.key(\`products.\${index}.price\`)}
            {...form.getInputProps(\`products.\${index}.price\`)}
          />
          <NumberInput
            label="数量"
            style={{ width: 100 }}
            key={form.key(\`products.\${index}.quantity\`)}
            {...form.getInputProps(\`products.\${index}.quantity\`)}
          />
          <ActionIcon
            color="red"
            mb={6}
            onClick={() => form.removeListItem('products', index)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ))}

      <Group>
        <Button
          variant="default"
          onClick={() =>
            form.insertListItem('products', {
              name: '',
              price: 0,
              quantity: 1,
              key: randomId(),
            })
          }
        >
          添加商品
        </Button>
      </Group>

      <Code block>{JSON.stringify(form.getValues(), null, 2)}</Code>
    </Stack>
  );
}
\`\`\`

> ⭐ \`form.watch\` 监听数组时，回调的 \`value\` 是整个数组的最新值。改任一子字段、增删行都会触发——非常适合算总价、做联动。

---

## 九、实战：动态问卷

动态问卷典型场景：管理员配置 N 个问题，用户填答。每个问题有 \`question\`/\`type\`/\`answer\`。

\`\`\`jsx
'use client';
import { useState } from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
  SegmentedControl,
} from '@mantine/core';
import { isNotEmpty, useForm } from '@mantine/form';
import { randomId } from '@mantine/hooks';
import { IconTrash, IconPlus } from '@tabler/icons-react';

export default function SurveyForm() {
  const [result, setResult] = useState(null);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      title: '',
      questions: [
        { text: '你最喜欢的编程语言？', type: 'text', answer: '', key: randomId() },
      ],
    },
    validate: {
      title: isNotEmpty('问卷标题必填'),
      questions: {
        text: isNotEmpty('问题文本必填'),
        answer: (value, values, path) => {
          // path 形如 'questions.0.answer'，可以从 path 提取索引
          const index = Number(path.split('.')[1]);
          const question = values.questions[index];
          // 必答
          if (!question) return null;
          return value.length === 0 ? '请填写答案' : null;
        },
      },
    },
  });

  const addQuestion = (type) => {
    form.insertListItem('questions', {
      text: '',
      type,
      answer: type === 'rating' ? 3 : '',
      key: randomId(),
    });
  };

  const handleSubmit = (values) => {
    setResult(values);
  };

  if (result) {
    return (
      <Stack>
        <Title order={3}>问卷结果</Title>
        <Text>标题：{result.title}</Text>
        {result.questions.map((q, i) => (
          <Text key={q.key}>
            {i + 1}. {q.text} → <strong>{String(q.answer)}</strong>
          </Text>
        ))}
        <Button variant="subtle" onClick={() => { setResult(null); form.reset(); }}>
          再填一份
        </Button>
      </Stack>
    );
  }

  return (
    <Box maw={640} mx="auto">
      <Title order={2} mb="lg">动态问卷</Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            withAsterisk
            label="问卷标题"
            key={form.key('title')}
            {...form.getInputProps('title')}
          />

          <Stack gap="sm" mt="md">
            {form.getValues().questions.map((q, index) => (
              <Box key={q.key} p="md" style={{ border: '1px solid #ddd', borderRadius: 8 }}>
                <Group justify="space-between" mb="sm">
                  <Text fw={500}>问题 {index + 1}（{q.type}）</Text>
                  <ActionIcon
                    color="red"
                    onClick={() => form.removeListItem('questions', index)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>

                <TextInput
                  label="问题文本"
                  key={form.key(\`questions.\${index}.text\`)}
                  {...form.getInputProps(\`questions.\${index}.text\`)}
                />

                {/* 根据问题类型渲染不同的答题组件 */}
                {q.type === 'text' && (
                  <TextInput
                    label="回答"
                    mt="sm"
                    key={form.key(\`questions.\${index}.answer\`)}
                    {...form.getInputProps(\`questions.\${index}.answer\`)}
                  />
                )}
                {q.type === 'longtext' && (
                  <Textarea
                    label="回答"
                    mt="sm"
                    autosize
                    minRows={2}
                    key={form.key(\`questions.\${index}.answer\`)}
                    {...form.getInputProps(\`questions.\${index}.answer\`)}
                  />
                )}
                {q.type === 'rating' && (
                  <Stack mt="sm">
                    <Text size="sm">评分</Text>
                    <SegmentedControl
                      data={['1', '2', '3', '4', '5']}
                      key={form.key(\`questions.\${index}.answer\`)}
                      {...form.getInputProps(\`questions.\${index}.answer\`)}
                    />
                  </Stack>
                )}
                {q.type === 'choice' && (
                  <Select
                    label="回答"
                    mt="sm"
                    data={['选项 A', '选项 B', '选项 C']}
                    key={form.key(\`questions.\${index}.answer\`)}
                    {...form.getInputProps(\`questions.\${index}.answer\`)}
                  />
                )}
              </Box>
            ))}
          </Stack>

          <Group>
            <Button variant="default" leftSection={<IconPlus size={16} />} onClick={() => addQuestion('text')}>
              文本题
            </Button>
            <Button variant="default" leftSection={<IconPlus size={16} />} onClick={() => addQuestion('longtext')}>
              长文本
            </Button>
            <Button variant="default" leftSection={<IconPlus size={16} />} onClick={() => addQuestion('rating')}>
              评分题
            </Button>
            <Button variant="default" leftSection={<IconPlus size={16} />} onClick={() => addQuestion('choice')}>
              选择题
            </Button>
          </Group>

          <Group justify="flex-end" mt="md">
            <Button type="submit">提交问卷</Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
}
\`\`\`

要点：

1. 每个问题用 \`Box\` 包起来，加边框视觉分组
2. \`q.type\` 决定渲染哪种答题组件——经典的「动态字段」模式
3. 校验函数用 \`path\` 参数提取索引，差异化处理
4. \`removeListItem\` / \`insertListItem\` 完成增删

---

## 十、实战：订单明细

更复杂的场景：订单有客户信息（嵌套对象）+ 多个商品行（数组），每行有名称、单价、数量，需要算小计和总计。

\`\`\`jsx
'use client';
import { useState } from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Code,
  Divider,
  Group,
  NumberInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { isEmail, isNotEmpty, useForm } from '@mantine/form';
import { randomId } from '@mantine/hooks';
import { IconPlus, IconTrash } from '@tabler/icons-react';

export default function OrderForm() {
  const [total, setTotal] = useState(0);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      customer: {
        name: '',
        email: '',
        address: '',
      },
      items: [
        { name: '', price: 0, quantity: 1, key: randomId() },
      ],
    },
    validate: {
      customer: {
        name: isNotEmpty('客户姓名必填'),
        email: isEmail('邮箱格式不对'),
        address: isNotEmpty('地址必填'),
      },
      items: {
        name: isNotEmpty('商品名必填'),
        price: (v) => (v <= 0 ? '单价必须大于 0' : null),
        quantity: (v) => (v < 1 ? '数量至少 1' : null),
      },
    },
  });

  // 监听整个 items 数组：任一字段或增删行都触发，重算总价
  form.watch('items', ({ value }) => {
    setTotal(value.reduce((sum, item) => sum + item.price * item.quantity, 0));
  });

  const handleSubmit = (values) => {
    // 用 transformValues 整理提交数据（也可以直接在 useForm 里配 transformValues）
    const payload = {
      customer: values.customer,
      items: values.items.map(({ key, ...rest }) => rest), // 剥掉 key
      total,
    };
    console.log('提交：', payload);
    alert('订单已提交，查看 console');
  };

  return (
    <Box maw={720} mx="auto">
      <Title order={2} mb="lg">新建订单</Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* 一、客户信息：嵌套对象 */}
          <Box>
            <Title order={5} mb="sm">客户信息</Title>
            <SimpleGrid cols={2}>
              <TextInput
                label="姓名"
                key={form.key('customer.name')}
                {...form.getInputProps('customer.name')}
              />
              <TextInput
                label="邮箱"
                key={form.key('customer.email')}
                {...form.getInputProps('customer.email')}
              />
            </SimpleGrid>
            <TextInput
              label="地址"
              mt="sm"
              key={form.key('customer.address')}
              {...form.getInputProps('customer.address')}
            />
          </Box>

          <Divider />

          {/* 二、商品明细：数组字段 */}
          <Box>
            <Group justify="space-between" mb="sm">
              <Title order={5}>商品明细</Title>
              <Button
                size="xs"
                variant="default"
                leftSection={<IconPlus size={14} />}
                onClick={() => form.insertListItem('items', {
                  name: '',
                  price: 0,
                  quantity: 1,
                  key: randomId(),
                })}
              >
                添加商品
              </Button>
            </Group>

            <Stack gap="xs">
              {form.getValues().items.map((item, index) => (
                <Group key={item.key} align="flex-end" gap="sm">
                  <TextInput
                    label={\`商品 \${index + 1}\`}
                    placeholder="商品名称"
                    style={{ flex: 1 }}
                    key={form.key(\`items.\${index}.name\`)}
                    {...form.getInputProps(\`items.\${index}.name\`)}
                  />
                  <NumberInput
                    label="单价"
                    min={0}
                    style={{ width: 100 }}
                    key={form.key(\`items.\${index}.price\`)}
                    {...form.getInputProps(\`items.\${index}.price\`)}
                  />
                  <NumberInput
                    label="数量"
                    min={1}
                    style={{ width: 80 }}
                    key={form.key(\`items.\${index}.quantity\`)}
                    {...form.getInputProps(\`items.\${index}.quantity\`)}
                  />
                  <Text size="sm" style={{ width: 80, textAlign: 'right' }}>
                    ¥{item.price * item.quantity}
                  </Text>
                  <ActionIcon
                    color="red"
                    mb={6}
                    onClick={() => form.removeListItem('items', index)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              ))}
            </Stack>
          </Box>

          <Divider />

          {/* 三、总价汇总 */}
          <Group justify="flex-end">
            <Title order={4}>总计：¥{total}</Title>
          </Group>

          <Group justify="flex-end">
            <Button type="submit">提交订单</Button>
          </Group>
        </Stack>
      </form>

      <Code block mt="lg">{JSON.stringify(form.getValues(), null, 2)}</Code>
    </Box>
  );
}
\`\`\`

这个实战集成了所有知识点：嵌套对象（customer）+ 数组字段（items）+ \`watch\` 算总价 + 增删行 + 数组校验 + 提交时剥掉内部 \`key\` 字段。

---

## 十一、常见坑点

### 坑 1：忘给数组元素加稳定 key

\`\`\`jsx
// ❌ 错误：用 index 作为 key
{form.getValues().items.map((item, index) => (
  <Group key={index}>...</Group>
))}

// 删除中间元素时，后面的元素 key 全部前移，
// React 会复用错组件，输入框内容错位

// ✅ 正确：每个元素自带 randomId
{form.getValues().items.map((item, index) => (
  <Group key={item.key}>...</Group>
))}
\`\`\`

### 坑 2：uncontrolled 模式下用 form.values 渲染

\`\`\`jsx
// ❌ uncontrolled 模式下，form.values 不触发重渲染
// 改了值，UI 不刷新
{form.values.items.map(...)}

// ✅ 用 form.getValues()
// 配合 insertListItem/removeListItem（它们内部会触发重渲染）
{form.getValues().items.map(...)}
\`\`\`

### 坑 3：嵌套字段忘加 form.key

\`\`\`jsx
// ❌ 漏掉 key，uncontrolled 模式下输入框会错位
<TextInput {...form.getInputProps('user.firstName')} />

// ✅ 必须加
<TextInput key={form.key('user.firstName')} {...form.getInputProps('user.firstName')} />
\`\`\`

### 坑 4：数组校验写成数组而非对象

\`\`\`jsx
// ❌ 错误：写成数组
validate: {
  items: [
    { name: (v) => ... }
  ],
}

// ✅ 正确：写成嵌套对象，key 是字段名
validate: {
  items: {
    name: (v) => (v.length === 0 ? '必填' : null),
  },
}
\`\`\`

---

## 小结

| 知识点 | 关键 API / 写法 |
| --- | --- |
| 路径语法 | \`user.firstName\` / \`fruits.0.name\` |
| 嵌套对象读取 | \`form.getInputProps('user.firstName')\` |
| 嵌套对象设值 | \`form.setFieldValue('user.name', v)\` 或整对象替换 |
| 嵌套对象校验 | \`validate: { user: { name: fn } }\` |
| 数组渲染 | \`form.getValues().list.map((item, i) => ...)\` |
| 数组路径绑定 | \`\` \`list.\${i}.field\` \`\` |
| 稳定 key | 每个元素加 \`key: randomId()\`，渲染时用 \`item.key\` |
| 数组添加 | \`form.insertListItem(path, item, index?)\` |
| 数组删除 | \`form.removeListItem(path, index)\` |
| 数组替换 | \`form.replaceListItem(path, index, newItem)\` |
| 数组重排 | \`form.reorderListItem(path, { from, to })\` |
| 数组字段校验 | \`validate: { list: { field: fn } }\` |
| 数组整体校验 | \`validate: { list: { [formRootRule]: fn } }\` |
| 按索引差异化校验 | 第三参数 \`path\` 提取索引 |
| 监听数组变化 | \`form.watch('list', ({ value }) => ...)\` |
| 是否需要 useFieldArray | 不需要，\`getInputProps\` 路径语法已覆盖 |

至此表单进阶部分结束。你已经掌握 Mantine 表单的全部核心能力——\`useForm\` + 校验 + 嵌套/数组。下一部分我们进入反馈与覆盖层组件，学 Modal、Drawer、Popover 等弹层。`,
  },
];

export { chapters };
