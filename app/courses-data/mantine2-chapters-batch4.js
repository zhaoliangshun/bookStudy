// =============================================================
// Mantine 从入门到精通大全 - 第四批章节（第四部分 按钮与标识，共 4 项）
// -------------------------------------------------------------
// 本批包含：
//   mantine2-ch14 : 第十四章 Button 按钮进阶
//   mantine2-ch15 : 第十五章 ActionIcon 图标按钮与 ButtonGroup
//   mantine2-ch16 : 第十六章 Badge 徽章与 Indicator 指示器
//   mantine2-ch17 : 第十七章 ThemeIcon 主题图标与 CloseButton
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：Mantine v9 / React 19 / Next.js 16
// =============================================================

const chapters = [
  // ============================================================
  // 第十四章 Button 按钮进阶
  // ============================================================
  {
    id: 'mantine2-ch14',
    group: '第四部分 按钮与标识',
    icon: '🔘',
    title: '第十四章 Button 按钮进阶',
    content: `## 一句话目标

把 Button 用到「生产级」——掌握 loaderProps、fullWidth、disabled vs loading、component 多态渲染、unstyled 裸奔模式，并写出一个真正防重复点击的提交按钮。

---

## 一、Button 全 props 速查表（复习 + 补充）

第二章我们讲了 \`variant\` / \`color\` / \`size\` / \`radius\` / \`loading\` / \`leftSection\` / \`rightSection\` / \`gradient\`。这一章补齐剩下的常用 props。

| prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| variant | filled/outline/light/subtle/transparent/default/gradient | filled | 视觉样式 |
| color | 主题色名 | blue（或 primaryColor） | 颜色 |
| size | xs/sm/md/lg/xl | sm | 尺寸 |
| radius | xs/sm/md/lg/xl 或像素值 | sm | 圆角 |
| loading | boolean | false | 加载状态（自动禁用 + spinner） |
| loaderProps | object | {} | 自定义加载图标 |
| disabled | boolean | false | 禁用状态 |
| fullWidth | boolean | false | 占满父容器宽度 |
| leftSection | ReactNode | - | 左侧内容（图标） |
| rightSection | ReactNode | - | 右侧内容（图标） |
| gradient | {from, to, deg} | - | 渐变配置（需 variant="gradient"） |
| component | ReactElement 或组件 | button | 渲染成的根元素（多态） |
| renderRoot | function | - | 完全自定义根元素渲染 |
| unstyled | boolean | false | 完全去掉样式 |
| justify | start/center/space-between | center | 内容横向对齐 |
| loaderPosition | left/right/center | left | loading 图标位置 |
| type | button/submit/reset | button | 原生 type 属性 |
| form | string | - | 关联的 form id |
| autoContrast | boolean | false | 文字色自动反色 |
| classNames | object | - | 给内部元素加 class |
| styles | object | - | 给内部元素加 inline 样式 |

> ⭐ 90% 的场景你只会用到前 10 个。后 10 个是「锦上添花」，遇到再查表。

---

## 二、loaderProps：自定义加载图标

\`loading\` 时默认显示一个旋转的圆环。你可以用 \`loaderProps\` 改它：

\`\`\`jsx
import { Button, Group } from '@mantine/core';

export default function Demo() {
  return (
    <Group>
      {/* 默认 loader：旋转圆环 */}
      <Button loading>默认</Button>

      {/* loaderProps.type：改 loader 类型
          - oval：椭圆环（默认）
          - bars：三条跳动竖线
          - dots：三个跳动圆点 */}
      <Button loading loaderProps={{ type: 'bars' }}>
        Bars
      </Button>
      <Button loading loaderProps={{ type: 'dots' }}>
        Dots
      </Button>

      {/* loaderProps.size：改 loader 尺寸（数字或字符串） */}
      <Button loading loaderProps={{ size: 'xs' }}>
        小图标
      </Button>

      {/* loaderProps.color：改 loader 颜色
          注意：filled 按钮的 loader 默认是白色
          这里强制改成黄色，让加载态更显眼 */}
      <Button loading color="blue" loaderProps={{ color: 'yellow' }}>
        黄色加载
      </Button>
    </Group>
  );
}
\`\`\`

**loaderPosition：调整加载图标位置**

\`\`\`jsx
import { Button, Group } from '@mantine/core';

export default function Demo() {
  return (
    <Group>
      {/* 默认 left：图标在文字左边，文字会稍微右移 */}
      <Button loading loaderPosition="left">
        左侧加载
      </Button>

      {/* right：图标在文字右边 */}
      <Button loading loaderPosition="right">
        右侧加载
      </Button>

      {/* center：图标居中，文字隐藏（用于按钮宽度固定场景） */}
      <Button loading loaderPosition="center" w={160}>
        居中加载
      </Button>
    </Group>
  );
}
\`\`\`

---

## 三、fullWidth：占满父容器

\`\`\`jsx
import { Button, Stack } from '@mantine/core';

export default function Demo() {
  return (
    // Stack 默认占满宽度，里面的 Button fullWidth 会撑满
    <Stack gap="md" style={{ maxWidth: 320 }}>
      {/* fullWidth：让按钮占满父容器宽度
          常用于：移动端落地页、登录注册表单底部、Modal 底部操作 */}
      <Button fullWidth size="lg">
        登录
      </Button>

      <Button fullWidth variant="outline" size="lg">
        注册
      </Button>

      {/* justify 配合 fullWidth：内容横向对齐方式 */}
      <Button fullWidth justify="space-between" variant="light">
        <span>继续购物</span>
        <span>→</span>
      </Button>
    </Stack>
  );
}
\`\`\`

> ⭐ **小技巧**：\`fullWidth\` 等价于 \`style={{ width: '100%' }}\`，但语义更清晰。

---

## 四、disabled vs loading：两个相似但不同的状态

这两个 props 都会让按钮「不可点击」，但视觉效果不同：

\`\`\`jsx
import { Button, Group } from '@mantine/core';

export default function Demo() {
  return (
    <Group>
      {/* 正常状态 */}
      <Button>正常</Button>

      {/* disabled：变灰 + 不可点击 + 鼠标变 not-allowed
          用于：权限不足、条件不满足（如未勾选协议） */}
      <Button disabled>禁用</Button>

      {/* loading：显示 spinner + 不可点击 + 鼠标变 wait
          用于：异步操作进行中（提交表单、上传文件）
          注意：loading 会自动 disable，不需要同时写 disabled */}
      <Button loading>加载中</Button>

      {/* 同时设置：loading 优先级更高，显示 spinner
          通常不需要这样写，了解优先级即可 */}
      <Button disabled loading>
        加载且禁用
      </Button>
    </Group>
  );
}
\`\`\`

**关键区别表：**

| 状态 | 视觉 | 鼠标光标 | 触发 onClick | 使用场景 |
| --- | --- | --- | --- | --- |
| 正常 | 主题色 | pointer | ✅ | 默认 |
| disabled | 变灰、半透明 | not-allowed | ❌ | 条件不满足 |
| loading | spinner + 半透明 | wait | ❌ | 异步操作中 |

> ⚠️ **坑点**：\`loading\` 时按钮虽然不可点击，但**键盘 Tab 聚焦后按回车仍可能触发**。生产环境记得在 \`onClick\` 里加 \`if (loading) return;\` 兜底。

---

## 五、component：多态渲染（核心进阶）

默认 \`Button\` 渲染成 \`<button>\` 标签。但有时你要让它渲染成 \`<a>\`（链接）、\`<div>\`（自定义）等——这时用 \`component\`：

\`\`\`jsx
import { Button, Group } from '@mantine/core';

export default function Demo() {
  return (
    <Group>
      {/* 默认：渲染成 <button> */}
      <Button>原生 button</Button>

      {/* component="a"：渲染成 <a> 标签
          所有额外 props（href、target 等）会透传给 <a> */}
      <Button component="a" href="https://mantine.dev" target="_blank">
        外部链接
      </Button>

      {/* component="div"：渲染成 <div>
          注意：<div> 默认不可聚焦、不能触发 click 键盘事件
          实际项目里别这么用，这里只是演示 */}
      <Button component="div">
        我是 div
      </Button>
    </Group>
  );
}
\`\`\`

**多态的原理：**

\`component\` 接收任何 React 组件或字符串标签名。Mantine 会把所有不属于 Button 自身的 props（如 \`href\`、\`to\`、\`onClick\`）透传给 \`component\`。

---

## 六、polymorphic 实战：渲染成 Next.js Link

这是 \`component\` 最常见的实战场景——把 Button 变成客户端路由跳转按钮：

\`\`\`jsx
'use client';
import Link from 'next/link';
import { Button } from '@mantine/core';

export default function Demo() {
  return (
    {/* 把 Button 渲染成 Next.js Link
        - component={Link}：根元素变成 <Link>
        - href="/about"：透传给 Link，触发客户端路由
        - 视觉上还是 Button，但行为是导航 */}
    <Button component={Link} href="/about">
      去关于页
    </Button>
  );
}
\`\`\`

**为什么用 \`component={Link}\` 而不是 \`onClick={() => router.push('/about')}\`？**

- \`Link\` 有**预取**：鼠标 hover 时预加载目标页面，跳转更快。
- \`Link\` 渲染成 \`<a>\`，**右键「在新标签打开」可用**，对用户体验更友好。
- \`Link\` 的 \`href\` 被**搜索引擎爬取**，对 SEO 友好。
- \`onClick + router.push\` 是 JS 行为，没有上述好处。

---

## 七、renderRoot：完全自定义根元素

\`component\` 的进阶版是 \`renderRoot\`——给你一个函数，让你**完全控制根元素的渲染**：

\`\`\`jsx
import Link from 'next/link';
import { Button } from '@mantine/core';

export default function Demo() {
  return (
    {/* renderRoot：接收一个函数，函数参数是 Button 默认的 props
        你可以在这里做任何事：包裹、改 props、返回自定义元素
        这里把 Button 包成 Next.js Link，并加一个 data-track 属性 */}
    <Button
      renderRoot={(props) => (
        <Link {...props} href="/dashboard" data-track="cta-dashboard" />
      )}
    >
      进入控制台
    </Button>
  );
}
\`\`\`

**\`component\` vs \`renderRoot\` 怎么选？**

- 简单替换标签 → 用 \`component\`。
- 需要包裹多层、改 props、加自定义属性 → 用 \`renderRoot\`。

---

## 八、unstyled：裸奔模式

\`unstyled\` 会**完全去掉 Mantine 样式**，只保留行为（onClick、disabled、loading）：

\`\`\`jsx
import { Button, Stack, Text } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      <Text size="sm">下面两个按钮都没有 Mantine 样式：</Text>

      {/* unstyled：去掉所有 Mantine 样式
          场景：完全自定义设计系统、接入第三方主题
          注意：variant/color/size 等 props 全部失效 */}
      <Button unstyled onClick={() => alert('点击了')}>
        我是个裸按钮
      </Button>

      <Button unstyled loading>
        裸按钮加载中
      </Button>
    </Stack>
  );
}
\`\`\`

> ⚠️ \`unstyled\` 用得很少。如果你的项目想「完全换皮」，更推荐用 \`createTheme\` + \`classNames\` 覆盖样式，而不是 unstyled。

---

## 九、autoContrast：文字色自动反色

\`\`\`jsx
import { Button, Group } from '@mantine/core';

export default function Demo() {
  return (
    <Group>
      {/* color="yellow"：黄色按钮
          默认文字色是白色，在浅黄背景上对比度低 */}
      <Button color="yellow">默认对比</Button>

      {/* autoContrast：根据背景色亮度自动选择文字色
          浅色背景 → 文字变深色，深色背景 → 文字变浅色
          Mantine v9 默认开启，这里手动设置演示 */}
      <Button color="yellow" autoContrast>
        自动对比
      </Button>

      {/* lime 也是浅色，对比度问题更明显 */}
      <Button color="lime">Lime 默认</Button>
      <Button color="lime" autoContrast>Lime 自动</Button>
    </Group>
  );
}
\`\`\`

> ⭐ \`autoContrast\` 在主题里可以全局开启：\`theme.autoContrast = true\`。强烈推荐打开，解决「亮黄按钮白字看不清」的常见痛点。

---

## 十、实战：防重复点击的提交按钮

这是 Button 进阶最经典的实战——用户疯狂点击提交按钮，要保证只发一次请求：

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Button, Stack, Text, TextInput } from '@mantine/core';

export default function SubmitForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  // 模拟一个异步提交函数（真实场景替换成 fetch）
  async function submitOrder() {
    setLoading(true);
    setResult('');

    try {
      // 模拟网络请求延迟 2 秒
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setResult('✅ 订单提交成功！');
    } catch (err) {
      setResult('❌ 提交失败：' + err.message);
    } finally {
      // 无论成功失败，都关闭 loading
      setLoading(false);
    }
  }

  return (
    <Stack gap="md" style={{ maxWidth: 360 }}>
      <TextInput label="商品名称" placeholder="例如：MacBook Pro" />

      {/* 关键点：
          1. loading={loading}：提交时显示 spinner + 禁用
          2. loaderPosition="right"：图标在右边更自然
          3. onClick 调 submitOrder，submitOrder 内部管理 loading
          4. 不需要单独的 disabled——loading 自动 disable
          5. type="button"：防止在 form 内被当成 submit 触发默认行为 */}
      <Button
        loading={loading}
        loaderPosition="right"
        onClick={submitOrder}
        type="button"
        fullWidth
        size="md"
      >
        {loading ? '提交中...' : '提交订单'}
      </Button>

      {/* 提示信息 */}
      {result && <Text size="sm" c={result.includes('✅') ? 'green' : 'red'}>{result}</Text>}
    </Stack>
  );
}
\`\`\`

**为什么这个方案能防重复点击？**

1. 点击 → \`setLoading(true)\` → 按钮 \`disabled\`（loading 自动 disable）。
2. 用户再点击 → 按钮 disabled，\`onClick\` 不触发。
3. 请求完成 → \`setLoading(false)\` → 恢复可点击。

**进阶：双重保险（防止快速双击穿透）**

\`\`\`jsx
'use client';
import { useRef, useState } from 'react';
import { Button } from '@mantine/core';

export default function SafeSubmit() {
  const [loading, setLoading] = useState(false);
  // 用 ref 记录「是否正在提交」——比 state 更快同步
  const submittingRef = useRef(false);

  async function handleSubmit() {
    // 双重保险：ref 检查
    // 即使在 loading 状态变成 true 之前的瞬间被点了两次，ref 也能拦住
    if (submittingRef.current) return;

    submittingRef.current = true;
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert('成功');
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  return (
    <Button loading={loading} onClick={handleSubmit}>
      安全提交
    </Button>
  );
}
\`\`\`

> ⭐ **生产级心法**：\`loading\` 防用户点击，\`ref\` 防快速双击穿透，\`后端幂等\` 防网络重试。三者结合才算完整防护。

---

## 小结

| 知识点 | 用途 |
| --- | --- |
| \`loaderProps\` | 自定义加载图标类型/尺寸/颜色 |
| \`fullWidth\` | 占满父容器宽度 |
| \`disabled\` vs \`loading\` | 条件禁用 vs 异步进行中 |
| \`component\` | 多态渲染成 a/Link 等 |
| \`renderRoot\` | 完全自定义根元素 |
| \`unstyled\` | 去掉所有样式 |
| \`autoContrast\` | 文字色自动反色 |
| \`loading + ref\` | 防重复点击 |

下一章我们学 ActionIcon——专门为「纯图标按钮」设计的组件，比 \`<Button leftSection={<Icon />} />\` 更轻量。`,
  },

  // ============================================================
  // 第十五章 ActionIcon 图标按钮与 ButtonGroup
  // ============================================================
  {
    id: 'mantine2-ch15',
    group: '第四部分 按钮与标识',
    icon: '🎯',
    title: '第十五章 ActionIcon 图标按钮与 ButtonGroup',
    content: `## 一句话目标

学会用 ActionIcon 写出「只有图标的方形/圆形按钮」——比 Button 更轻量、更适合工具栏场景。再用 ActionIcon.Group 组合工具栏，配合 Tooltip 加文字提示。

---

## 一、为什么需要 ActionIcon

写一个「删除按钮」时，你**可以**这样：

\`\`\`jsx
<Button variant="subtle" color="red" leftSection={<IconTrash size={16} />} />
\`\`\`

但有问题：

1. Button 默认是矩形 + 有 padding，纯图标时显得「空」。
2. Button 的 \`size\` 是按文字高度算的，图标按钮想要「36×36 正方形」要自己算 padding。
3. Button 没有「圆形」预设。

**ActionIcon 就是为纯图标按钮设计的**——方形/圆形预设、尺寸更合理、API 更简洁。

---

## 二、ActionIcon 基础用法

\`\`\`jsx
import { ActionIcon, Group } from '@mantine/core';
import { IconHeart, IconSettings, IconTrash, IconShare } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Group>
      {/* 最简单的 ActionIcon：传一个图标作为子元素 */}
      <ActionIcon>
        <IconHeart size={16} />
      </ActionIcon>

      {/* variant：和 Button 一样的样式体系 */}
      <ActionIcon variant="filled">填充</ActionIcon>
      <ActionIcon variant="outline">描边</ActionIcon>
      <ActionIcon variant="light">浅色</ActionIcon>
      <ActionIcon variant="subtle">微弱</ActionIcon>
      <ActionIcon variant="transparent">透明</ActionIcon>
      <ActionIcon variant="default">默认</ActionIcon>

      {/* color：主题色，和 Button 一致 */}
      <ActionIcon color="red" variant="light">
        <IconTrash size={16} />
      </ActionIcon>

      {/* size：xs/sm/md/lg/xl，决定按钮整体尺寸 */}
      <ActionIcon size="lg" color="blue">
        <IconSettings size={20} />
      </ActionIcon>
    </Group>
  );
}
\`\`\`

> ⭐ **核心区别**：ActionIcon 的 \`size\` 直接控制按钮尺寸（如 \`md\` 是 36×36），而 Button 的 \`size\` 控制文字大小（图标得自己定尺寸）。

---

## 三、ActionIcon 的 size 对照表

| size | 按钮尺寸 | 图标推荐尺寸 | 用途 |
| --- | --- | --- | --- |
| xs | 22px | 12-14px | 表格内紧凑操作 |
| sm | 26px | 14-16px | 工具栏默认 |
| md | 32px | 16-18px | 常规场景 |
| lg | 38px | 18-22px | 移动端点击区 |
| xl | 44px | 22-28px | 主操作图标 |

\`\`\`jsx
import { ActionIcon, Group, Text } from '@mantine/core';
import { IconStar } from '@tabler/icons-react';

export default function Demo() {
  const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];
  return (
    <Group align="center">
      {sizes.map((s) => (
        <Group key={s} gap="xs">
          <ActionIcon size={s} variant="light" color="yellow">
            <IconStar size={s === 'xs' ? 12 : s === 'xl' ? 24 : 16} />
          </ActionIcon>
          <Text size="xs">{s}</Text>
        </Group>
      ))}
    </Group>
  );
}
\`\`\`

---

## 四、loading 与 disabled

和 Button 一样，ActionIcon 支持 \`loading\` 和 \`disabled\`：

\`\`\`jsx
import { ActionIcon, Group } from '@mantine/core';
import { IconRefresh, IconDownload, IconLock } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Group>
      {/* loading：显示小 spinner + 禁用
          场景：刷新数据、上传图标按钮 */}
      <ActionIcon loading variant="light">
        <IconRefresh size={16} />
      </ActionIcon>

      {/* loaderProps：和 Button 一样可自定义 */}
      <ActionIcon loading loaderProps={{ type: 'dots' }} variant="light">
        <IconDownload size={16} />
      </ActionIcon>

      {/* disabled：变灰 + 禁用 */}
      <ActionIcon disabled variant="light">
        <IconLock size={16} />
      </ActionIcon>
    </Group>
  );
}
\`\`\`

---

## 五、圆形 ActionIcon

\`\`\`jsx
import { ActionIcon, Group } from '@mantine/core';
import { IconUser, IconBell, IconMail } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Group>
      {/* radius="50%"：圆形按钮（等价于 radius={999}）
          场景：头像、铃铛通知、邮件图标 */}
      <ActionIcon radius="50%" variant="light" color="blue" size="lg">
        <IconUser size={20} />
      </ActionIcon>

      <ActionIcon radius="50%" variant="filled" color="red" size="lg">
        <IconBell size={20} />
      </ActionIcon>

      {/* 主题色 gradient：圆形渐变按钮 */}
      <ActionIcon
        radius="50%"
        variant="gradient"
        gradient={{ from: 'indigo', to: 'cyan' }}
        size="lg"
      >
        <IconMail size={20} />
      </ActionIcon>
    </Group>
  );
}
\`\`\`

> ⭐ 头像、消息铃铛、用户菜单触发器，**圆形** + \`variant="light"\` 是经典组合。

---

## 六、Tooltip 配合 ActionIcon

纯图标按钮没有文字，用户不知道是干嘛的——必须配 Tooltip：

\`\`\`jsx
import { ActionIcon, Tooltip, Group } from '@mantine/core';
import { IconEdit, IconTrash, IconShare } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Group>
      {/* Tooltip 包住 ActionIcon
          label：鼠标 hover 时显示的文字
          position：弹出位置（top/bottom/left/right）
          withArrow：带小箭头 */}
      <Tooltip label="编辑" position="bottom" withArrow>
        <ActionIcon variant="subtle" color="blue">
          <IconEdit size={16} />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="删除（不可恢复）" position="bottom" withArrow color="red">
        <ActionIcon variant="subtle" color="red">
          <IconTrash size={16} />
        </ActionIcon>
      </Tooltip>

      {/* openDelay：延迟显示（毫秒），避免鼠标快速划过时弹一堆 */}
      <Tooltip label="分享" position="bottom" openDelay={300}>
        <ActionIcon variant="subtle" color="grape">
          <IconShare size={16} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
\`\`\`

> ⭐ **必备心法**：**任何没有文字的图标按钮都必须有 Tooltip**。这是无障碍（a11y）和用户体验的双重底线。

---

## 七、aria-label：无障碍必备

光有 Tooltip 还不够——屏幕阅读器读不出 Tooltip。必须加 \`aria-label\`：

\`\`\`jsx
import { ActionIcon, Tooltip } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Tooltip label="删除">
      {/* aria-label：屏幕阅读器读这个，盲人用户能听到「删除按钮」 */}
      <ActionIcon variant="subtle" color="red" aria-label="删除">
        <IconTrash size={16} />
      </ActionIcon>
    </Tooltip>
  );
}
\`\`\`

**为什么 Tooltip 不够？**

- Tooltip 是**视觉**提示，鼠标 hover 才显示。
- 屏幕阅读器用户用键盘 / 触摸浏览，看不到 Tooltip。
- \`aria-label\` 是 HTML 标准属性，屏幕阅读器直接读取。

---

## 八、ActionIcon.Group：图标按钮组

多个 ActionIcon 连在一起，用 \`ActionIcon.Group\`：

\`\`\`jsx
import { ActionIcon, Group } from '@mantine/core';
import { IconBold, IconItalic, IconUnderline, IconStrikethrough } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Group>
      {/* ActionIcon.Group：把多个 ActionIcon 连成一组
          边框会自动合并，视觉上像一个工具条 */}
      <ActionIcon.Group>
        <ActionIcon variant="default" aria-label="加粗">
          <IconBold size={16} />
        </ActionIcon>
        <ActionIcon variant="default" aria-label="斜体">
          <IconItalic size={16} />
        </ActionIcon>
        <ActionIcon variant="default" aria-label="下划线">
          <IconUnderline size={16} />
        </ActionIcon>
        <ActionIcon variant="default" aria-label="删除线">
          <IconStrikethrough size={16} />
        </ActionIcon>
      </ActionIcon.Group>

      {/* 配合 borderWidth / orientation */}
      <ActionIcon.Group borderWidth={2}>
        <ActionIcon variant="light" color="blue">A</ActionIcon>
        <ActionIcon variant="light" color="blue">B</ActionIcon>
        <ActionIcon variant="light" color="blue">C</ActionIcon>
      </ActionIcon.Group>
    </Group>
  );
}
\`\`\`

**与 Button.Group 的区别：**

| 特性 | ActionIcon.Group | Button.Group |
| --- | --- | --- |
| 子元素 | ActionIcon | Button |
| 适用场景 | 工具栏、排版按钮 | 表单操作（保存/取消） |
| 视觉 | 紧凑方形 | 带文字矩形 |

---

## 九、ActionIcon vs Button：怎么选

| 场景 | 推荐 | 理由 |
| --- | --- | --- |
| 有文字 | Button | Button 专为文字按钮设计 |
| 纯图标 | ActionIcon | 尺寸更合理，圆形支持好 |
| 图标 + 文字 | Button + leftSection | 两者都可，看团队规范 |
| 工具栏（多个图标连排） | ActionIcon.Group | 紧凑对齐，边框自动合并 |
| 表单提交 | Button | loading 状态更明显 |
| 头像/通知 | ActionIcon 圆形 | 视觉更轻 |

> ⭐ **一句话决策**：**没文字就 ActionIcon，有文字就 Button**。

---

## 十、实战：富文本编辑器工具栏

把上面学的全用上——做一个完整的编辑器工具栏：

\`\`\`jsx
'use client';
import { useState } from 'react';
import { ActionIcon, Group, Tooltip, Divider, Text } from '@mantine/core';
import {
  IconBold, IconItalic, IconUnderline, IconStrikethrough,
  IconAlignLeft, IconAlignCenter, IconAlignRight,
  IconList, IconListNumbers, IconQuote,
  IconLink, IconImage, IconCode,
  IconArrowBack, IconArrowForward,
} from '@tabler/icons-react';

export default function Toolbar() {
  // 记录激活状态（演示用，真实场景对接编辑器 API）
  const [active, setActive] = useState({ bold: false, italic: false });

  // 通用切换函数
  const toggle = (key) => setActive((s) => ({ ...s, [key]: !s[key] }));

  return (
    <Group gap="xs" align="center">
      {/* 撤销/重做：独立分组 */}
      <ActionIcon.Group>
        <Tooltip label="撤销" position="bottom">
          <ActionIcon variant="subtle" aria-label="撤销">
            <IconArrowBack size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="重做" position="bottom">
          <ActionIcon variant="subtle" aria-label="重做">
            <IconArrowForward size={16} />
          </ActionIcon>
        </Tooltip>
      </ActionIcon.Group>

      {/* 分隔线 */}
      <Divider orientation="vertical" />

      {/* 文字样式：互不影响的开关 */}
      <ActionIcon.Group>
        <Tooltip label="加粗" position="bottom">
          {/* active 状态用 variant="filled" 高亮 */}
          <ActionIcon
            variant={active.bold ? 'filled' : 'subtle'}
            color={active.bold ? 'blue' : 'gray'}
            onClick={() => toggle('bold')}
            aria-label="加粗"
          >
            <IconBold size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="斜体" position="bottom">
          <ActionIcon
            variant={active.italic ? 'filled' : 'subtle'}
            color={active.italic ? 'blue' : 'gray'}
            onClick={() => toggle('italic')}
            aria-label="斜体"
          >
            <IconItalic size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="下划线" position="bottom">
          <ActionIcon variant="subtle" aria-label="下划线">
            <IconUnderline size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="删除线" position="bottom">
          <ActionIcon variant="subtle" aria-label="删除线">
            <IconStrikethrough size={16} />
          </ActionIcon>
        </Tooltip>
      </ActionIcon.Group>

      <Divider orientation="vertical" />

      {/* 对齐方式：互斥（一次只能选一个） */}
      <ActionIcon.Group>
        <Tooltip label="左对齐" position="bottom">
          <ActionIcon variant="subtle" aria-label="左对齐">
            <IconAlignLeft size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="居中" position="bottom">
          <ActionIcon variant="subtle" aria-label="居中">
            <IconAlignCenter size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="右对齐" position="bottom">
          <ActionIcon variant="subtle" aria-label="右对齐">
            <IconAlignRight size={16} />
          </ActionIcon>
        </Tooltip>
      </ActionIcon.Group>

      <Divider orientation="vertical" />

      {/* 列表 */}
      <ActionIcon.Group>
        <Tooltip label="无序列表" position="bottom">
          <ActionIcon variant="subtle" aria-label="无序列表">
            <IconList size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="有序列表" position="bottom">
          <ActionIcon variant="subtle" aria-label="有序列表">
            <IconListNumbers size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="引用" position="bottom">
          <ActionIcon variant="subtle" aria-label="引用">
            <IconQuote size={16} />
          </ActionIcon>
        </Tooltip>
      </ActionIcon.Group>

      <Divider orientation="vertical" />

      {/* 插入元素 */}
      <ActionIcon.Group>
        <Tooltip label="插入链接" position="bottom">
          <ActionIcon variant="subtle" color="blue" aria-label="插入链接">
            <IconLink size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="插入图片" position="bottom">
          <ActionIcon variant="subtle" color="blue" aria-label="插入图片">
            <IconImage size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="插入代码" position="bottom">
          <ActionIcon variant="subtle" color="grape" aria-label="插入代码">
            <IconCode size={16} />
          </ActionIcon>
        </Tooltip>
      </ActionIcon.Group>

      <Text size="xs" c="dimmed">当前状态：{JSON.stringify(active)}</Text>
    </Group>
  );
}
\`\`\`

**这个工具栏涵盖了所有知识点：**

1. \`ActionIcon.Group\` 分组——逻辑相关的按钮连成一组。
2. \`Divider orientation="vertical"\` 分隔不同功能组。
3. \`Tooltip\` 给每个按钮加文字提示。
4. \`aria-label\` 保证无障碍。
5. \`variant\` 切换表示激活状态（filled = 激活，subtle = 未激活）。
6. \`color\` 区分操作类型（红色 = 危险，蓝色 = 信息，灰色 = 普通）。

---

## 小结

| 知识点 | 用途 |
| --- | --- |
| \`ActionIcon\` | 纯图标按钮，比 Button 轻 |
| \`variant/color/size\` | 和 Button 一致的样式系统 |
| \`radius="50%"\` | 圆形按钮 |
| \`loading/disabled\` | 异步状态、禁用状态 |
| \`Tooltip\` + \`aria-label\` | 文字提示 + 无障碍 |
| \`ActionIcon.Group\` | 工具栏分组 |

下一章我们学 Badge 与 Indicator——用来显示「状态标签」「未读消息数」的小组件。`,
  },

  // ============================================================
  // 第十六章 Badge 徽章与 Indicator 指示器
  // ============================================================
  {
    id: 'mantine2-ch16',
    group: '第四部分 按钮与标识',
    icon: '🏷️',
    title: '第十六章 Badge 徽章与 Indicator 指示器',
    content: `## 一句话目标

学会用 Badge 显示「状态标签」（如 NEW、上线、VIP），用 Indicator 显示「小红点未读提示」（如消息铃铛上的数字徽标），做出有信息密度的列表与导航。

---

## 一、Badge 是什么

Badge 是一个**小型标签**，用来标注状态、分类、计数：

- 商品列表的「NEW」「HOT」「折扣」
- 用户列表的「在线」「VIP」「禁用」
- 任务列表的「待办」「进行中」「已完成」

视觉上是小矩形/胶囊形，比按钮小、比文字醒目。

---

## 二、Badge 基础用法

\`\`\`jsx
import { Badge, Group } from '@mantine/core';

export default function Demo() {
  return (
    <Group>
      {/* 最简单：直接写文字 */}
      <Badge>默认</Badge>

      {/* variant：和 Button 一致的样式体系 */}
      <Badge variant="filled">Filled</Badge>
      <Badge variant="light">Light</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="dot">Dot</Badge>{/* 左边一个小圆点 */}
      <Badge variant="transparent">Transparent</Badge>

      {/* color：主题色 */}
      <Badge color="green" variant="light">在线</Badge>
      <Badge color="red" variant="filled">下线</Badge>
      <Badge color="grape" variant="outline">VIP</Badge>

      {/* size：xs/sm/md/lg/xl */}
      <Badge size="xs">XS</Badge>
      <Badge size="lg">LG</Badge>
    </Group>
  );
}
\`\`\`

> ⭐ **\`variant="dot"\` 是 Badge 独有的**——左边一个小圆点 + 文字，适合状态标签（如「● 在线」）。

---

## 三、variant="dot" 状态标签实战

\`\`\`jsx
import { Badge, Group, Stack, Text } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      {/* 用户状态列表：dot variant 一目了然 */}
      <Group>
        <Text size="sm">张三</Text>
        <Badge variant="dot" color="green">在线</Badge>
      </Group>
      <Group>
        <Text size="sm">李四</Text>
        <Badge variant="dot" color="yellow">离开</Badge>
      </Group>
      <Group>
        <Text size="sm">王五</Text>
        <Badge variant="dot" color="gray">离线</Badge>
      </Group>
    </Stack>
  );
}
\`\`\`

---

## 四、radius、circle 与 fullWidth

\`\`\`jsx
import { Badge, Group, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      <Group>
        {/* radius：圆角控制 */}
        <Badge radius="xs">XS 圆角</Badge>
        <Badge radius="md">MD 圆角</Badge>
        <Badge radius="xl">XL 圆角</Badge>
        <Badge radius={0}>直角</Badge>
      </Group>

      <Group>
        {/* circle：完全圆形（胶囊形）
            场景：数字徽标、计数器 */}
        <Badge circle color="red" variant="filled">99+</Badge>
        <Badge circle color="blue" variant="filled">5</Badge>
        <Badge circle size="lg" color="grape" variant="filled">VIP</Badge>
      </Group>

      {/* fullWidth：占满父容器宽度
          场景：列表项里的状态标签 */}
      <Stack gap="xs" style={{ maxWidth: 200 }}>
        <Badge fullWidth variant="light" color="green">已审核</Badge>
        <Badge fullWidth variant="light" color="orange">待审核</Badge>
        <Badge fullWidth variant="light" color="red">已驳回</Badge>
      </Stack>
    </Stack>
  );
}
\`\`\`

---

## 五、leftSection / rightSection

\`\`\`jsx
import { Badge, Group } from '@mantine/core';
import { IconStar, IconCheck, IconCrown, IconBolt } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Group>
      {/* leftSection：左侧内容（图标） */}
      <Badge leftSection={<IconStar size={12} />} color="yellow" variant="filled">
        推荐
      </Badge>

      {/* rightSection：右侧内容（图标） */}
      <Badge rightSection={<IconCheck size={12} />} color="green" variant="light">
        已完成
      </Badge>

      {/* 两边都有 */}
      <Badge
        leftSection={<IconCrown size={12} />}
        rightSection={<IconBolt size={12} />}
        color="grape"
        variant="filled"
      >
        超级 VIP
      </Badge>

      {/* leftSection 用文字（适合计数） */}
      <Badge leftSection="ID:" variant="outline">
        #1024
      </Badge>
    </Group>
  );
}
\`\`\`

---

## 六、Badge 完整 props 表

| prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| variant | filled/light/outline/dot/transparent | light | 视觉样式 |
| color | 主题色名 | gray | 颜色 |
| size | xs/sm/md/lg/xl | md | 尺寸 |
| radius | xs/sm/md/lg/xl 或像素值 | xl | 圆角 |
| circle | boolean | false | 完全圆形（胶囊） |
| fullWidth | boolean | false | 占满宽度 |
| leftSection | ReactNode | - | 左侧内容 |
| rightSection | ReactNode | - | 右侧内容 |
| gradient | {from, to, deg} | - | 渐变（需 variant="gradient"） |
| autoContrast | boolean | false | 文字色自动反色 |
| classNames/styles | object | - | 自定义样式 |

---

## 七、Indicator 是什么

Indicator 是**包裹组件**——在子元素的角落显示一个小圆点 / 数字 / 自定义内容。

典型场景：

- 铃铛图标的右上角显示未读数（5、99+）
- 头像的右下角显示在线状态点
- 商品图的左上角显示「NEW」标签

---

## 八、Indicator 基础用法

\`\`\`jsx
import { Indicator, ActionIcon, Avatar, Group } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Group>
      {/* Indicator 包住子元素，在角落显示一个小红点 */}
      <Indicator>
        <ActionIcon variant="light" size="lg">
          <IconBell size={18} />
        </ActionIcon>
      </Indicator>

      {/* 头像右下角的在线点 */}
      <Indicator color="green" position="bottom-end" size={10}>
        <Avatar src="https://avatars.dicebear.com/api/avataaars/1.svg" />
      </Indicator>

      {/* label：显示文字或数字 */}
      <Indicator label="5" color="red" size={18}>
        <ActionIcon variant="light" size="lg">
          <IconBell size={18} />
        </ActionIcon>
      </Indicator>

      {/* 99+ 的处理 */}
      <Indicator label="99+" color="red" size={20}>
        <ActionIcon variant="light" size="lg">
          <IconBell size={18} />
        </ActionIcon>
      </Indicator>
    </Group>
  );
}
\`\`\`

---

## 九、position：指示器位置

\`\`\`jsx
import { Indicator, Avatar, Grid, Text } from '@mantine/core';

export default function Demo() {
  const positions = [
    'top-start', 'top-center', 'top-end',
    'middle-start', 'middle-center', 'middle-end',
    'bottom-start', 'bottom-center', 'bottom-end',
  ];

  return (
    <Grid>
      {positions.map((pos) => (
        <Grid.Col key={pos} span={4}>
          <div style={{ textAlign: 'center' }}>
            {/* position：九宫格位置
                - top/middle/bottom：垂直方向
                - start/center/end：水平方向
                - start/end 会受 dir（rtl）影响 */}
            <Indicator color="red" position={pos} size={12}>
              <Avatar radius="50%" />
            </Indicator>
            <Text size="xs" mt="xs">{pos}</Text>
          </div>
        </Grid.Col>
      ))}
    </Grid>
  );
}
\`\`\`

> ⭐ **常用组合**：
> - \`top-end\`：消息铃铛未读数（右上角）
> - \`bottom-end\`：头像在线状态（右下角）
> - \`top-start\`：商品 NEW 标签（左上角）

---

## 十、size、offset、color

\`\`\`jsx
import { Indicator, ActionIcon, Group } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Group>
      {/* size：指示器尺寸（数字或预设）
          默认 10，纯圆点用 8-12，带数字用 16-20 */}
      <Indicator size={8}>
        <ActionIcon variant="light" size="lg"><IconBell size={18} /></ActionIcon>
      </Indicator>
      <Indicator size={16} label="3" color="red">
        <ActionIcon variant="light" size="lg"><IconBell size={18} /></ActionIcon>
      </Indicator>

      {/* offset：偏移量（数字，向外偏移）
          默认 0，正值向外，负值向内 */}
      <Indicator offset={8} color="red">
        <ActionIcon variant="light" size="lg"><IconBell size={18} /></ActionIcon>
      </Indicator>
      <Indicator offset={-4} color="red">
        <ActionIcon variant="light" size="lg"><IconBell size={18} /></ActionIcon>
      </Indicator>

      {/* color：和主题色一致 */}
      <Indicator color="green">在线点</Indicator>
      <Indicator color="orange">离开</Indicator>
    </Group>
  );
}
\`\`\`

---

## 十一、processing：呼吸闪烁动画

\`\`\`jsx
import { Indicator, ActionIcon, Group } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Group>
      {/* processing：开启呼吸动画（圆环向外扩散）
          场景：新消息刚到、提示用户立即查看 */}
      <Indicator color="red" processing size={12}>
        <ActionIcon variant="light" size="lg">
          <IconBell size={18} />
        </ActionIcon>
      </Indicator>

      {/* 配合 label 一起用 */}
      <Indicator color="red" processing size={16} label="NEW">
        <ActionIcon variant="light" size="lg">
          <IconBell size={18} />
        </ActionIcon>
      </Indicator>
    </Group>
  );
}
\`\`\`

> ⭐ \`processing\` 是**吸引注意力**的利器，但**别滥用**——多个同时闪烁会让用户烦躁。一个页面最多一个 processing。

---

## 十二、disabled 与限制

\`\`\`jsx
import { Indicator, ActionIcon, Group } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Group>
      {/* disabled：隐藏指示器（不渲染）
          场景：未读数为 0 时不显示徽标 */}
      <Indicator disabled>
        <ActionIcon variant="light" size="lg"><IconBell size={18} /></ActionIcon>
      </Indicator>

      {/* showZero=false（默认）：label 为 0 时自动隐藏
          真实场景：根据未读数动态显示 */}
      <Indicator label={0} color="red">
        <ActionIcon variant="light" size="lg"><IconBell size={18} /></ActionIcon>
      </Indicator>
    </Group>
  );
}
\`\`\`

---

## 十三、实战：未读消息数组件

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Indicator, ActionIcon, Group, Button, Text, Stack } from '@mantine/core';
import { IconBell, IconMessage } from '@tabler/icons-react';

export default function UnreadMessages() {
  // 真实场景：从后端拉取未读数
  const [unread, setUnread] = useState(5);

  return (
    <Stack>
      <Group align="center">
        {/* 未读数 > 0 才显示 Indicator
            label 用 unread 数字，>99 显示 99+ */}
        <Indicator
          color="red"
          size={16}
          label={unread > 99 ? '99+' : unread}
          processing={unread > 0}
          disabled={unread === 0}
        >
          <ActionIcon variant="light" size="lg" aria-label="消息">
            <IconBell size={18} />
          </ActionIcon>
        </Indicator>

        <Text size="sm">未读消息：{unread}</Text>
      </Group>

      <Group>
        <Button size="xs" variant="light" onClick={() => setUnread((n) => n + 1)}>
          收到新消息
        </Button>
        <Button size="xs" color="green" onClick={() => setUnread(0)}>
          全部已读
        </Button>
      </Group>
    </Stack>
  );
}
\`\`\`

**这个实战涵盖了：**

1. \`label\` 显示数字，>99 显示 99+（移动端常见模式）。
2. \`processing\` 在有未读时闪烁，吸引注意。
3. \`disabled\` 在未读为 0 时隐藏徽标。
4. \`size={16}\` 配合数字使用（比纯圆点大一点）。

---

## 十四、实战：状态标签列表

\`\`\`jsx
import { Badge, Group, Stack, Text, Avatar } from '@mantine/core';

// 状态映射表：把后端状态码转成 Badge 配置
const statusConfig = {
  pending: { label: '待支付', color: 'orange', variant: 'light' },
  paid: { label: '已支付', color: 'blue', variant: 'light' },
  shipped: { label: '已发货', color: 'cyan', variant: 'dot' },
  completed: { label: '已完成', color: 'green', variant: 'filled' },
  cancelled: { label: '已取消', color: 'gray', variant: 'subtle' },
};

const orders = [
  { id: '#1024', user: '张三', status: 'pending' },
  { id: '#1025', user: '李四', status: 'shipped' },
  { id: '#1026', user: '王五', status: 'completed' },
  { id: '#1027', user: '赵六', status: 'cancelled' },
];

export default function OrderList() {
  return (
    <Stack gap="sm">
      {orders.map((order) => {
        // 从配置表取当前订单的状态展示信息
        const cfg = statusConfig[order.status];
        return (
          <Group key={order.id} justify="space-between">
            <Group>
              <Avatar color="blue" radius="xl" size="sm">
                {order.user[0]}
              </Avatar>
              <Stack gap={0}>
                <Text size="sm" fw={500}>{order.id} · {order.user}</Text>
              </Stack>
            </Group>
            {/* 用配置动态渲染 Badge */}
            <Badge color={cfg.color} variant={cfg.variant}>
              {cfg.label}
            </Badge>
          </Group>
        );
      })}
    </Stack>
  );
}
\`\`\`

> ⭐ **状态映射表**是生产级模式——把后端状态码和 UI 配置解耦，后端加状态只改配置表，不动组件代码。

---

## 十五、Badge vs Indicator 怎么选

| 特性 | Badge | Indicator |
| --- | --- | --- |
| 用途 | 状态标签、分类 | 角落小红点/数字 |
| 独立使用 | ✅ 可独立显示 | ❌ 必须包裹子元素 |
| 视觉 | 矩形/胶囊，有文字 | 圆点/小数字 |
| 典型场景 | 商品「NEW」、用户「VIP」 | 铃铛「5」、头像「在线点」 |
| 是否独立 | 是 | 否（是修饰器） |

> ⭐ **决策**：标签独立显示 → Badge；在某元素角落加修饰 → Indicator。两者也能**配合使用**——Indicator 的 \`label\` 里放一个 Badge！

---

## 小结

| 组件 | 核心 props | 用途 |
| --- | --- | --- |
| \`Badge\` | variant/color/size/circle/fullWidth/leftSection | 状态标签 |
| \`Badge variant="dot"\` | + color | 带圆点的状态标签 |
| \`Indicator\` | position/size/color/label/processing/offset | 角落小红点/数字 |
| \`Indicator position\` | top/middle/bottom + start/center/end | 九宫格位置 |

下一章我们学 ThemeIcon 与 CloseButton——一个是「带主题色的图标容器」，一个是「关闭按钮」。`,
  },

  // ============================================================
  // 第十七章 ThemeIcon 主题图标与 CloseButton
  // ============================================================
  {
    id: 'mantine2-ch17',
    group: '第四部分 按钮与标识',
    icon: '💫',
    title: '第十七章 ThemeIcon 主题图标与 CloseButton',
    content: `## 一句话目标

学会用 ThemeIcon 画「带主题色背景的图标方块」（如步骤序号、特性图标），用 CloseButton 做可访问的关闭按钮（如标签删除、提示框关闭）。

---

## 一、ThemeIcon 是什么

ThemeIcon 是一个**带主题色背景的图标容器**——给图标套一个彩色方块/圆。

典型场景：

- 步骤序号（1、2、3 配不同颜色）
- 特性介绍页的图标（每个特性一个彩色圆）
- 通知类型标识（成功=绿、警告=黄、错误=红）

**和 ActionIcon 的区别**：

- ActionIcon 是**可点击的按钮**，有 hover/loading/disabled 状态。
- ThemeIcon 是**纯展示容器**，不可点击，只负责把图标变好看。

---

## 二、ThemeIcon 基础用法

\`\`\`jsx
import { ThemeIcon, Group } from '@mantine/core';
import { IconCheck, IconAlertTriangle, IconX, IconInfoCircle } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Group>
      {/* 最简单：传一个图标作为子元素 */}
      <ThemeIcon>
        <IconCheck size={16} />
      </ThemeIcon>

      {/* variant：和 Button 一致 */}
      <ThemeIcon variant="filled">填充</ThemeIcon>
      <ThemeIcon variant="light">浅色</ThemeIcon>
      <ThemeIcon variant="outline">描边</ThemeIcon>

      {/* color：主题色，不同状态配不同色 */}
      <ThemeIcon color="green" variant="light">
        <IconCheck size={16} />
      </ThemeIcon>
      <ThemeIcon color="yellow" variant="light">
        <IconAlertTriangle size={16} />
      </ThemeIcon>
      <ThemeIcon color="red" variant="light">
        <IconX size={16} />
      </ThemeIcon>
      <ThemeIcon color="blue" variant="light">
        <IconInfoCircle size={16} />
      </ThemeIcon>
    </Group>
  );
}
\`\`\`

---

## 三、size 与 radius

\`\`\`jsx
import { ThemeIcon, Group, Text, Stack } from '@mantine/core';
import { IconBolt } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Stack>
      <Group align="center">
        {/* size：xs/sm/md/lg/xl，决定容器尺寸 */}
        <ThemeIcon size="xs"><IconBolt size={12} /></ThemeIcon>
        <ThemeIcon size="sm"><IconBolt size={14} /></ThemeIcon>
        <ThemeIcon size="md"><IconBolt size={16} /></ThemeIcon>
        <ThemeIcon size="lg"><IconBolt size={20} /></ThemeIcon>
        <ThemeIcon size="xl"><IconBolt size={28} /></ThemeIcon>
      </Group>

      <Group align="center">
        {/* radius：圆角控制 */}
        <ThemeIcon radius="xs" color="blue"><IconBolt size={16} /></ThemeIcon>
        <ThemeIcon radius="md" color="blue"><IconBolt size={16} /></ThemeIcon>
        <ThemeIcon radius="xl" color="blue"><IconBolt size={16} /></ThemeIcon>

        {/* radius="50%"：完全圆形
            场景：步骤序号、特性图标 */}
        <ThemeIcon radius="50%" color="grape" variant="filled">
          <IconBolt size={16} />
        </ThemeIcon>
      </Group>

      {/* 渐变背景 */}
      <Group>
        <ThemeIcon
          variant="gradient"
          gradient={{ from: 'indigo', to: 'cyan' }}
          radius="50%"
          size="lg"
        >
          <IconBolt size={24} />
        </ThemeIcon>
      </Group>
    </Stack>
  );
}
\`\`\`

---

## 四、ThemeIcon 完整 props 表

| prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| variant | filled/light/outline/gradient | filled | 视觉样式 |
| color | 主题色名 | primaryColor | 颜色 |
| size | xs/sm/md/lg/xl | md | 尺寸 |
| radius | xs/sm/md/lg/xl 或像素值或 50% | sm | 圆角 |
| gradient | {from, to, deg} | - | 渐变配置 |
| autoContrast | boolean | false | 图标色自动反色 |
| classNames/styles | object | - | 自定义样式 |

---

## 五、ThemeIcon vs ActionIcon：怎么选

| 特性 | ThemeIcon | ActionIcon |
| --- | --- | --- |
| 可点击 | ❌ | ✅ |
| 有 hover 效果 | ❌ | ✅ |
| loading/disabled | ❌ | ✅ |
| 用途 | 纯展示（图标 + 背景色） | 可交互（图标按钮） |
| 典型场景 | 步骤序号、特性卡片图标 | 工具栏按钮、删除按钮 |

**决策流程：**

1. 这个图标**需要点击**吗？
   - 是 → 用 ActionIcon
   - 否 → 继续
2. 这个图标需要**独立的彩色背景**吗？
   - 是 → 用 ThemeIcon
   - 否 → 直接放 \`<Icon />\`

---

## 六、实战：步骤序号 + 特性介绍

\`\`\`jsx
import { ThemeIcon, Text, Stack, Group, Divider } from '@mantine/core';
import { IconNumber1, IconNumber2, IconNumber3, IconRocket, IconShield, IconBolt } from '@tabler/icons-react';

// 步骤组件：每步一个圆形数字
function Step({ num, title, desc }) {
  return (
    <Group align="flex-start">
      {/* 步骤序号：圆形 ThemeIcon */}
      <ThemeIcon radius="50%" size="lg" variant="filled" color="blue">
        {num}
      </ThemeIcon>
      <Stack gap={2}>
        <Text fw={600}>{title}</Text>
        <Text size="sm" c="dimmed">{desc}</Text>
      </Stack>
    </Group>
  );
}

// 特性卡片：每个特性配一个渐变图标
function Feature({ icon, title, desc, gradient }) {
  return (
    <Group align="flex-start">
      <ThemeIcon
        radius="50%"
        size="lg"
        variant="gradient"
        gradient={gradient}
      >
        {icon}
      </ThemeIcon>
      <Stack gap={2}>
        <Text fw={600}>{title}</Text>
        <Text size="sm" c="dimmed">{desc}</Text>
      </Stack>
    </Group>
  );
}

export default function Demo() {
  return (
    <Stack gap="md">
      {/* 步骤序号列表 */}
      <Stack gap="md">
        <Step num={1} title="注册账号" desc="邮箱注册，30 秒完成" />
        <Step num={2} title="创建项目" desc="选择模板或从零开始" />
        <Step num={3} title="发布上线" desc="一键部署到全球 CDN" />
      </Stack>

      <Divider my="sm" />

      {/* 特性介绍 */}
      <Stack gap="md">
        <Feature
          icon={<IconRocket size={20} />}
          title="极速启动"
          desc="毫秒级冷启动，全球加速"
          gradient={{ from: 'indigo', to: 'blue' }}
        />
        <Feature
          icon={<IconShield size={20} />}
          title="安全可靠"
          desc="SOC2 合规，数据加密"
          gradient={{ from: 'green', to: 'teal' }}
        />
        <Feature
          icon={<IconBolt size={20} />}
          title="性能强劲"
          desc="自动扩缩容，支持百万 QPS"
          gradient={{ from: 'orange', to: 'red' }}
        />
      </Stack>
    </Stack>
  );
}
\`\`\`

---

## 七、CloseButton 是什么

CloseButton 是一个**专门用于「关闭」的按钮**——本质是个 X 图标按钮，但自带：

1. 默认 X 图标（不用自己 import 图标库）
2. 默认 \`aria-label="Close"\`（无障碍开箱即用）
3. 默认 \`variant="subtle"\`（弱化样式，适合角落关闭）
4. hover 时颜色变红（提示这是关闭操作）

---

## 八、CloseButton 基础用法

\`\`\`jsx
import { CloseButton, Group, Stack, Text, Box } from '@mantine/core';

export default function Demo() {
  return (
    <Group>
      {/* 最简单：直接用，默认 X 图标 */}
      <CloseButton />

      {/* size：xs/sm/md/lg/xl */}
      <CloseButton size="xs" />
      <CloseButton size="md" />
      <CloseButton size="xl" />

      {/* onClick：和普通按钮一样 */}
      <CloseButton onClick={() => alert('点了关闭')} />
    </Group>
  );
}
\`\`\`

---

## 九、自定义 icon

\`\`\`jsx
import { CloseButton, Group } from '@mantine/core';
import { IconX, IconMinus, IconArrowLeft } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Group>
      {/* icon：替换默认的 X 图标
          场景：最小化按钮、返回按钮 */}
      <CloseButton icon={<IconMinus size={16} />} aria-label="最小化" />
      <CloseButton icon={<IconArrowLeft size={16} />} aria-label="返回" />

      {/* 自定义颜色 */}
      <CloseButton icon={<IconX size={16} />} color="red" />

      {/* 自定义 variant（默认 subtle） */}
      <CloseButton variant="filled" color="red" />
    </Group>
  );
}
\`\`\`

---

## 十、CloseButton 完整 props 表

| prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| icon | ReactNode | IconX | 自定义图标 |
| size | xs/sm/md/lg/xl | md | 尺寸 |
| aria-label | string | Close | 无障碍标签 |
| variant | filled/light/subtle/transparent | subtle | 视觉样式 |
| color | 主题色名 | gray | 颜色 |
| radius | xs/sm/md/lg/xl 或像素值 | sm | 圆角 |
| onClick | function | - | 点击回调 |
| disabled | boolean | false | 禁用 |

---

## 十一、实战：可删除的标签

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Group, CloseButton, Text, Stack, Box } from '@mantine/core';

export default function TagList() {
  // 标签数据
  const [tags, setTags] = useState([
    { id: 1, label: 'React' },
    { id: 2, label: 'Next.js' },
    { id: 3, label: 'Mantine' },
    { id: 4, label: 'TypeScript' },
  ]);

  // 删除标签
  const removeTag = (id) => setTags((list) => list.filter((t) => t.id !== id));

  return (
    <Stack>
      <Text size="sm" c="dimmed">点击 X 删除标签：</Text>

      <Group gap="xs">
        {tags.map((tag) => (
          // 标签：Box 模拟一个 chip 样式
          <Box
            key={tag.id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 6px 4px 10px',
              border: '1px solid var(--mantine-color-gray-3)',
              borderRadius: 4,
              fontSize: 13,
            }}
          >
            {tag.label}
            {/* CloseButton 删除标签
                size="xs" 让按钮小巧
                aria-label 写明删除哪个标签 */}
            <CloseButton
              size="xs"
              aria-label={\`删除标签 \${tag.label}\`}
              onClick={() => removeTag(tag.id)}
            />
          </Box>
        ))}
      </Group>

      {tags.length === 0 && <Text size="sm" c="dimmed">全部删完了</Text>}
    </Stack>
  );
}
\`\`\`

---

## 十二、实战：可关闭的提示框

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Alert, CloseButton, Stack, Text } from '@mantine/core';
import { IconInfoCircle, IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react';

// 单个提示框：带关闭按钮
function DismissibleAlert({ icon, title, color, children, onClose }) {
  return (
    <Alert
      icon={icon}
      color={color}
      variant="light"
      title={title}
      // 右上角放 CloseButton
      rightSection={
        <CloseButton
          size="sm"
          aria-label="关闭提示"
          onClick={onClose}
        />
      }
    >
      {children}
    </Alert>
  );
}

export default function NotificationCenter() {
  // 提示列表
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'info', title: '系统通知', message: '今晚 22:00 进行系统维护' },
    { id: 2, type: 'warning', title: '存储告警', message: '磁盘使用率超过 80%' },
    { id: 3, type: 'success', title: '部署成功', message: '生产环境已更新到 v2.1.0' },
  ]);

  // 关闭提示
  const dismiss = (id) => setAlerts((list) => list.filter((a) => a.id !== id));

  // 类型配置
  const config = {
    info: { color: 'blue', icon: <IconInfoCircle size={18} /> },
    warning: { color: 'yellow', icon: <IconAlertTriangle size={18} /> },
    success: { color: 'green', icon: <IconCircleCheck size={18} /> },
  };

  return (
    <Stack>
      <Text size="sm" c="dimmed">点击 X 关闭提示：</Text>

      {alerts.map((alert) => {
        const cfg = config[alert.type];
        return (
          <DismissibleAlert
            key={alert.id}
            icon={cfg.icon}
            color={cfg.color}
            title={alert.title}
            onClose={() => dismiss(alert.id)}
          >
            {alert.message}
          </DismissibleAlert>
        );
      })}

      {alerts.length === 0 && <Text c="dimmed">✅ 所有提示已处理</Text>}
    </Stack>
  );
}
\`\`\`

---

## 十三、ThemeIcon + CloseButton 综合实战：通知条

把 ThemeIcon 当图标容器、CloseButton 当关闭按钮，做出一个完整的可关闭通知条：

\`\`\`jsx
'use client';
import { useState } from 'react';
import { ThemeIcon, CloseButton, Text, Group, Stack, Box, Transition } from '@mantine/core';
import { IconCheck, IconAlertTriangle, IconInfoCircle, IconX } from '@tabler/icons-react';

function NoticeItem({ type, title, message, onClose }) {
  // 类型配置：图标 + 颜色
  const config = {
    success: { icon: <IconCheck size={16} />, color: 'green' },
    warning: { icon: <IconAlertTriangle size={16} />, color: 'yellow' },
    info: { icon: <IconInfoCircle size={16} />, color: 'blue' },
  };
  const cfg = config[type];

  return (
    // 通知条容器：横向布局，左边图标 + 中间内容 + 右边关闭
    <Box
      style={(theme) => ({
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.md,
        padding: theme.spacing.md,
        background: theme.colors[cfg.color][0],
        borderRadius: theme.radius.md,
        border: \`1px solid \${theme.colors[cfg.color][2]}\`,
      })}
    >
      {/* 左侧：ThemeIcon 当图标容器 */}
      <ThemeIcon color={cfg.color} variant="light" radius="50%">
        {cfg.icon}
      </ThemeIcon>

      {/* 中间：标题 + 消息 */}
      <Stack gap={2} style={{ flex: 1 }}>
        <Text size="sm" fw={600}>{title}</Text>
        <Text size="xs" c="dimmed">{message}</Text>
      </Stack>

      {/* 右侧：CloseButton 关闭 */}
      <CloseButton
        size="sm"
        aria-label={\`关闭 \${title}\`}
        onClick={onClose}
      />
    </Box>
  );
}

export default function NoticeList() {
  const [notices, setNotices] = useState([
    { id: 1, type: 'success', title: '保存成功', message: '您的更改已同步到云端' },
    { id: 2, type: 'warning', title: '配额提醒', message: '本月 API 调用已达 80%' },
    { id: 3, type: 'info', title: '新功能上线', message: '试试全新的数据导出功能' },
  ]);

  const dismiss = (id) => setNotices((list) => list.filter((n) => n.id !== id));

  return (
    <Stack gap="sm" style={{ maxWidth: 400 }}>
      {notices.map((n) => (
        <NoticeItem
          key={n.id}
          type={n.type}
          title={n.title}
          message={n.message}
          onClose={() => dismiss(n.id)}
        />
      ))}
      {notices.length === 0 && (
        <Text c="dimmed" ta="center" mt="md">暂无通知</Text>
      )}
    </Stack>
  );
}
\`\`\`

**这个实战组合了：**

1. **ThemeIcon** 当左侧图标容器（圆形 + 浅色背景 + 主题色图标）。
2. **CloseButton** 当右侧关闭按钮（默认 X 图标 + 自动 aria-label）。
3. **类型配置表** 把图标 + 颜色解耦，方便扩展。
4. **动态列表** 支持增删通知。

---

## 小结

| 组件 | 核心 props | 用途 |
| --- | --- | --- |
| \`ThemeIcon\` | variant/color/size/radius/gradient | 带主题色背景的图标容器 |
| \`ThemeIcon radius="50%"\` | + gradient | 圆形渐变图标（特性介绍） |
| \`CloseButton\` | icon/size/variant/color/aria-label | 可访问的关闭按钮 |
| \`CloseButton icon={...}\` | + aria-label | 自定义图标（最小化/返回） |

**第四部分总结：**

| 章节 | 核心 |
| --- | --- |
| 第十四章 | Button 进阶：loaderProps、component 多态、防重复点击 |
| 第十五章 | ActionIcon + ActionIcon.Group + Tooltip 工具栏 |
| 第十六章 | Badge 状态标签 + Indicator 角落红点 |
| 第十七章 | ThemeIcon 图标容器 + CloseButton 关闭按钮 |

至此「按钮与标识」部分结束。下一部分我们进入表单输入——TextInput、Select、Slider、DatePicker 等组件，构建真实可用的表单。`,
  },
];

export { chapters };
