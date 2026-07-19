// =============================================================
// Mantine 从入门到精通大全 - 第八批章节（第八部分 导航与数据展示，共 6 章）
// -------------------------------------------------------------
// 本批包含：
//   mantine2-ch33 : 第三十三章 AppShell 后台布局全解
//   mantine2-ch34 : 第三十四章 Tabs 选项卡与 NavLink 导航链接
//   mantine2-ch35 : 第三十五章 Breadcrumbs/Pagination/Stepper
//   mantine2-ch36 : 第三十六章 Accordion 折叠面板与 Menu 菜单
//   mantine2-ch37 : 第三十七章 Table 表格与 Card 卡片
//   mantine2-ch38 : 第三十八章 Timeline 时间线与 Avatar 头像
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：Mantine v9 / React 19 / Next.js 16
//
// 转义规则：反引号写作 \`，\${ 写作 \$\{，正则中的 \S \d \w 写作 \\S \\d \\w。
// =============================================================

const chapters = [
  // ============================================================
  // 第三十三章 AppShell 后台布局全解
  // ============================================================
  {
    id: 'mantine2-ch33',
    group: '第八部分 导航与数据展示',
    icon: '🏗️',
    title: '第三十三章 AppShell 后台布局全解',
    content: `## 一句话目标

用 \`AppShell\` 一次性搭出「顶栏 + 侧边栏 + 副侧栏 + 底栏 + 主内容」的标准后台布局——响应式折叠、 Burger 联动、 \`useDisclosure\` 状态控制，全部讲透。

---

## 一、AppShell 是什么

后台管理系统几乎都长一个样：顶部一条 header，左边一条 navbar，右边可能还有 aside，主内容居中。如果手写 CSS + flex/grid，每改一处边距都要重新算布局。

\`AppShell\` 把这套布局**封装成声明式 API**——你只声明每个区域的尺寸和折叠状态，它自动算 main 的偏移、响应式断点、滚动行为。

\`\`\`
┌─────────────────────────────────────┐
│              Header                 │
├──────────┬──────────────────┬───────┤
│          │                  │       │
│  Navbar  │   Main (内容)     │ Aside │
│          │                  │       │
├──────────┴──────────────────┴───────┤
│              Footer                 │
└─────────────────────────────────────┘
\`\`\`

> ⭐ AppShell 不是「一个组件」，而是「一组组件」：\`AppShell\` 是外壳，内部用 \`AppShell.Header\` / \`AppShell.Navbar\` / \`AppShell.Aside\` / \`AppShell.Footer\` / \`AppShell.Main\` 拼装。

---

## 二、最小可运行例子

先跑一个最简单的「顶栏 + 主内容」布局：

\`\`\`jsx
'use client';
import { AppShell } from '@mantine/core';

export default function Demo() {
  return (
    // AppShell 是外壳，header={{ height: 60 }} 声明顶栏高度
    // 传了 header 配置，内部才会渲染 AppShell.Header 的位置
    <AppShell header={{ height: 60 }} padding="md">
      {/* AppShell.Header：顶栏，高度自动套用上面声明的 60 */}
      <AppShell.Header>这是顶栏</AppShell.Header>

      {/* AppShell.Main：主内容区，padding 自动套用上面声明的 md */}
      <AppShell.Main>
        这里是主内容，会自动避开顶栏 60px 高度
      </AppShell.Main>
    </AppShell>
  );
}
\`\`\`

**关键点**：\`AppShell.Header\` 不是任意 div，它内部会读取父级 \`AppShell\` 上的 \`header\` 配置来计算定位。两者必须配套使用。

---

## 三、Header 配置详解

顶栏的配置对象支持这些字段：

\`\`\`jsx
<AppShell
  header={{
    height: 60,        // 高度（数字或字符串，如 '4rem'）
    offset: true,      // 是否让 main 向下避开 header（默认 true）
    collapsed: false,  // 是否完全隐藏 header
  }}
>
\`\`\`

实战一个完整 header：

\`\`\`jsx
'use client';
import { AppShell, Burger, Text, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export default function Demo() {
  // useDisclosure：Mantine 的「开关」hook
  // 返回 [open, { open, close, toggle }]
  // open 是布尔值，toggle 是切换函数
  const [mobileOpen, { toggle }] = useDisclosure();

  return (
    <AppShell
      // header.height 可以传数组：[移动端高度, 桌面端高度]
      // 也可以只传一个值，所有断点统一
      header={{ height: 60, offset: true, collapsed: false }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          {/* Burger：汉堡按钮，opened 控制三横/叉 */}
          {/* size 决定按钮大小，onClick 切换状态 */}
          <Burger opened={mobileOpen} onClick={toggle} size="sm" />
          <Text fw={700}>我的后台</Text>
          <Text size="sm" c="dimmed">管理员</Text>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        当前 Burger 状态：{mobileOpen ? '打开' : '关闭'}
      </AppShell.Main>
    </AppShell>
  );
}
\`\`\`

> ⭐ \`useDisclosure\` 来自 \`@mantine/hooks\`，是后台布局最常用的状态 hook——比 \`useState(false)\` 多了 \`open/close/toggle\` 三个语义化方法。

---

## 四、Navbar 配置详解

左侧栏是后台系统的核心——通常放菜单。配置：

\`\`\`jsx
<AppShell
  navbar={{
    width: 300,              // 宽度
    breakpoint: 'sm',        // 在 sm（< 768px）及以下断点时自动折叠成抽屉
    collapsed: { mobile: !opened, desktop: false },
    // collapsed.mobile：移动端是否折叠（true 时隐藏，会变抽屉）
    // collapsed.desktop：桌面端是否折叠（true 时完全收起）
  }}
>
\`\`\`

实战：

\`\`\`jsx
'use client';
import { AppShell, Burger, NavLink, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconHome, IconUsers, IconSettings } from '@tabler/icons-react';

export default function Demo() {
  // mobileOpen：移动端 navbar 抽屉是否打开
  const [mobileOpen, { toggle }] = useDisclosure();
  // desktopCollapsed：桌面端 navbar 是否收起
  const [desktopCollapsed, { toggle: toggleDesktop }] = useDisclosure(false);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',  // sm 以下变抽屉
        collapsed: {
          mobile: !mobileOpen,        // 移动端跟随 mobileOpen
          desktop: desktopCollapsed,  // 桌面端跟随 desktopCollapsed
        },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          {/* 这个 Burger 同时控制移动端抽屉 */}
          <Burger opened={mobileOpen} onClick={toggle} size="sm" hiddenFrom="sm" />
          <Burger opened={desktopCollapsed} onClick={toggleDesktop} size="sm" visibleFrom="sm" />
          <Text fw={700}>我的后台</Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        {/* NavLink：导航链接组件，active 控制高亮 */}
        <NavLink label="首页" leftSection={<IconHome size={16} />} active />
        <NavLink label="用户管理" leftSection={<IconUsers size={16} />} />
        <NavLink label="设置" leftSection={<IconSettings size={16} />} />
      </AppShell.Navbar>

      <AppShell.Main>
        主内容
        {/* hiddenFrom / visibleFrom：响应式隐藏
            hiddenFrom="sm"：sm 及以上隐藏（只移动端显示）
            visibleFrom="sm"：sm 以下隐藏（只桌面端显示） */}
      </AppShell.Main>
    </AppShell>
  );
}
\`\`\`

> ⭐ **关键概念**：\`collapsed.mobile\` 控制移动端是否变抽屉，\`collapsed.desktop\` 控制桌面端是否收起。两个布尔值独立管理，互不干扰。

---

## 五、Aside 副侧栏

aside 是右侧栏，常见用法：放目录、历史记录、辅助信息。配置和 navbar 类似：

\`\`\`jsx
'use client';
import { AppShell, Text, ThemeIcon, Stack } from '@mantine/core';
import { IconBell, IconHistory } from '@tabler/icons-react';

export default function Demo() {
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 200, breakpoint: 'sm', collapsed: { mobile: true, desktop: false } }}
      aside={{
        width: 280,
        breakpoint: 'md',  // md 以下隐藏 aside
        collapsed: { mobile: true, desktop: false },
      }}
      padding="md"
    >
      <AppShell.Header><Text px="md" fw={700}>Aside 示例</Text></AppShell.Header>
      <AppShell.Navbar p="xs">左侧菜单</AppShell.Navbar>

      {/* Aside：右侧栏，常放通知、历史 */}
      <AppShell.Aside p="md">
        <Stack gap="lg">
          <Text fw={700}>通知</Text>
          <Text size="sm" c="dimmed">暂无新通知</Text>
          <ThemeIcon variant="light" color="grape"><IconBell size={16} /></ThemeIcon>
        </Stack>
      </AppShell.Aside>

      <AppShell.Main>主内容</AppShell.Main>
    </AppShell>
  );
}
\`\`\`

---

## 六、Footer 底栏

\`\`\`jsx
<AppShell
  footer={{
    height: 50,        // 高度
    offset: false,     // false 时底栏浮在 main 上面（不占文档流）
                       // true 时 main 会让出 50px 给底栏
  }}
>
  <AppShell.Footer>版权信息</AppShell.Footer>
</AppShell>
\`\`\`

实战：

\`\`\`jsx
'use client';
import { AppShell, Text, Group } from '@mantine/core';

export default function Demo() {
  return (
    <AppShell
      header={{ height: 60 }}
      footer={{ height: 40, offset: true }}
      padding="md"
    >
      <AppShell.Header><Text px="md">顶栏</Text></AppShell.Header>
      <AppShell.Main style={{ minHeight: '60vh' }}>主内容</AppShell.Main>
      {/* Footer：底栏 */}
      <AppShell.Footer>
        <Group h="100%" px="md" justify="space-between">
          <Text size="xs" c="dimmed">© 2026 我的公司</Text>
          <Text size="xs" c="dimmed">v1.0.0</Text>
        </Group>
      </AppShell.Footer>
    </AppShell>
  );
}
\`\`\`

---

## 七、padding 与 layout

\`\`\`jsx
<AppShell
  padding="md"           // 主内容区内边距，默认 md
  layout="default"      // 'default'（默认）或 'alt'
  // default：navbar 在左、aside 在右（标准后台）
  // alt：aside 在左、navbar 在右（少见，常用于聊天应用）
>
\`\`\`

\`layout="alt"\` 示例：

\`\`\`jsx
'use client';
import { AppShell, Text } from '@mantine/core';

export default function Demo() {
  return (
    // layout="alt"：aside 在左，navbar 在右
    <AppShell
      layout="alt"
      header={{ height: 60 }}
      navbar={{ width: 200, breakpoint: 'sm', collapsed: { mobile: true, desktop: false } }}
      aside={{ width: 280, breakpoint: 'md', collapsed: { mobile: true, desktop: false } }}
      padding="md"
    >
      <AppShell.Header><Text px="md">聊天应用</Text></AppShell.Header>
      <AppShell.Navbar p="xs">联系人列表（右）</AppShell.Navbar>
      <AppShell.Aside p="xs">会话窗口（左）</AppShell.Aside>
      <AppShell.Main>消息内容</AppShell.Main>
    </AppShell>
  );
}
\`\`\`

---

## 八、AppShell.Section：分块布局

navbar 或 aside 内部可能要分多块——顶部 Logo、中间菜单、底部用户信息。这时用 \`AppShell.Section\`：

\`\`\`jsx
'use client';
import { AppShell, NavLink, Text, Avatar, Divider } from '@mantine/core';
import { IconHome, IconSettings } from '@tabler/icons-react';

export default function Demo() {
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: true, desktop: false } }}
    >
      <AppShell.Header />
      <AppShell.Navbar p="xs">
        {/* grow：占满剩余空间，菜单区会自动撑高 */}
        <AppShell.Section grow>
          <NavLink label="首页" leftSection={<IconHome size={16} />} active />
          <NavLink label="设置" leftSection={<IconSettings size={16} />} />
        </AppShell.Section>

        {/* 不写 grow：固定高度，常放底部用户卡 */}
        <AppShell.Section>
          <Divider />
          <NavLink
            label="张三"
            description="zhangsan@example.com"
            leftSection={<Avatar size="sm" color="blue">张</Avatar>}
          />
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main />
    </AppShell>
  );
}
\`\`\`

> ⭐ \`grow\` 是分块布局的关键——一个 section 用 \`grow\` 它就会吃掉所有剩余高度，其他 section 固定高度。这样底部用户信息就能贴底。

---

## 九、实战：完整后台管理布局

把前面所有知识点合起来，搭一个能直接用的后台：

\`\`\`jsx
'use client';
import { useState } from 'react';
import { AppShell, Burger, Group, Avatar, Text, NavLink, ScrollArea, Badge, Divider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconHome, IconUsers, IconSettings, IconBell, IconLogout, IconSearch } from '@tabler/icons-react';

export default function AdminLayout() {
  // 移动端抽屉控制
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  // 桌面端 navbar 折叠
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  // 当前选中菜单
  const [active, setActive] = useState('home');

  // 菜单数据
  const menus = [
    { key: 'home', label: '首页', icon: IconHome },
    { key: 'users', label: '用户管理', icon: IconUsers, badge: '12' },
    { key: 'settings', label: '设置', icon: IconSettings },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: desktopOpened ? 250 : 80,  // 折叠时变窄成 80
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: false },
      }}
      aside={{
        width: 280,
        breakpoint: 'lg',
        collapsed: { mobile: true, desktop: false },
      }}
      padding="md"
    >
      {/* ===== 顶栏 ===== */}
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            {/* 移动端：显示汉堡（sm 以下） */}
            <Burger opened={mobileOpened} onClick={toggleMobile} size="sm" hiddenFrom="sm" />
            {/* 桌面端：显示折叠按钮（sm 以上） */}
            <Burger opened={desktopOpened} onClick={toggleDesktop} size="sm" visibleFrom="sm" />
            <Text fw={700}>Admin Pro</Text>
          </Group>
          <Group>
            <IconSearch size={18} />
            <IconBell size={18} />
            <Avatar size="sm" color="indigo">A</Avatar>
          </Group>
        </Group>
      </AppShell.Header>

      {/* ===== 左侧导航 ===== */}
      <AppShell.Navbar p="xs">
        <AppShell.Section grow component={ScrollArea}>
          {menus.map((m) => (
            <NavLink
              key={m.key}
              active={active === m.key}
              onClick={() => setActive(m.key)}
              label={desktopOpened ? m.label : ''}  // 折叠时不显示文字
              leftSection={<m.icon size={16} />}
              rightSection={m.badge ? <Badge size="xs">{m.badge}</Badge> : null}
            />
          ))}
        </AppShell.Section>

        <AppShell.Section>
          <Divider />
          <NavLink
            label={desktopOpened ? '退出登录' : ''}
            leftSection={<IconLogout size={16} />}
            color="red"
          />
        </AppShell.Section>
      </AppShell.Navbar>

      {/* ===== 右侧 aside：通知中心 ===== */}
      <AppShell.Aside p="md">
        <Text fw={700} mb="sm">最近通知</Text>
        <Text size="sm" c="dimmed">暂无新通知</Text>
      </AppShell.Aside>

      {/* ===== 主内容 ===== */}
      <AppShell.Main>
        <Text size="xl" fw={700}>当前页面：{menus.find((m) => m.key === active)?.label}</Text>
      </AppShell.Main>
    </AppShell>
  );
}
\`\`\`

---

## 小结

| API | 作用 |
| --- | --- |
| \`AppShell\` | 外壳，声明 header/navbar/aside/footer 配置 |
| \`AppShell.Header/Navbar/Aside/Footer/Main\` | 各区域组件 |
| \`AppShell.Section\` | 区域内分块，\`grow\` 占满剩余高度 |
| \`header.height\` | 顶栏高度 |
| \`navbar.width / breakpoint / collapsed\` | 侧栏宽/响应式断点/折叠状态 |
| \`layout="alt"\` | aside 移到左侧 |
| \`padding\` | 主内容内边距 |
| \`useDisclosure\` | 控制 Burger 折叠状态 |
| \`Burger\` | 汉堡按钮 |
| \`hiddenFrom / visibleFrom\` | 响应式隐藏 |

下一章我们学 Tabs 选项卡和 NavLink，把菜单做得更花哨。`,
  },

  // ============================================================
  // 第三十四章 Tabs 选项卡与 NavLink 导航链接
  // ============================================================
  {
    id: 'mantine2-ch34',
    group: '第八部分 导航与数据展示',
    icon: '📑',
    title: '第三十四章 Tabs 选项卡与 NavLink 导航链接',
    content: `## 一句话目标

用 \`Tabs\` 切换内容视图、用 \`NavLink\` 做导航菜单——两者都是「上下文切换」的核心组件，掌握它们就掌握了一半的导航场景。

---

## 一、Tabs 基础用法

\`Tabs\` 把内容分组到不同标签下，点击切换：

\`\`\`jsx
'use client';
import { Tabs } from '@mantine/core';

export default function Demo() {
  return (
    // defaultValue：初始激活哪个 tab（值对应 Tabs.Tab 的 value）
    <Tabs defaultValue="account">
      {/* Tabs.List：标签栏容器，水平排列所有 Tabs.Tab */}
      <Tabs.List>
        {/* value：唯一标识 */}
        <Tabs.Tab value="account">账号</Tabs.Tab>
        <Tabs.Tab value="security">安全</Tabs.Tab>
        <Tabs.Tab value="notifications">通知</Tabs.Tab>
      </Tabs.List>

      {/* Tabs.Panel：内容面板，value 对应哪个 Tab */}
      <Tabs.Panel value="account" pt="xs">
        账号设置内容
      </Tabs.Panel>
      <Tabs.Panel value="security" pt="xs">
        安全设置内容
      </Tabs.Panel>
      <Tabs.Panel value="notifications" pt="xs">
        通知设置内容
      </Tabs.Panel>
    </Tabs>
  );
}
\`\`\`

> ⭐ 默认情况下，未激活的 \`Tabs.Panel\` 不会被渲染（\`keepMounted={false}\`）——切换 tab 时会卸载上一个、挂载新的，组件内的 state 不会保留。如果要保留，看后面 \`keepMounted\` 一节。

---

## 二、受控 vs 非受控

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Tabs, TextInput, Group, Button } from '@mantine/core';

export default function Demo() {
  // 非受控：用 defaultValue，内部自己维护
  // 受控：用 value + onTabChange，外部控制
  const [active, setActive] = useState('first');

  return (
    <>
      {/* 受控模式：value 和 onTabChange 配套 */}
      <Tabs value={active} onTabChange={setActive}>
        <Tabs.List>
          <Tabs.Tab value="first">第一个</Tabs.Tab>
          <Tabs.Tab value="second">第二个</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="first">第一个内容</Tabs.Panel>
        <Tabs.Panel value="second">第二个内容</Tabs.Panel>
      </Tabs>

      {/* 外部按钮也能切换 tab */}
      <Group mt="md">
        <Button onClick={() => setActive('first')}>跳到第一个</Button>
        <Button onClick={() => setActive('second')}>跳到第二个</Button>
      </Group>
    </>
  );
}
\`\`\`

---

## 三、orientation 与 placement

\`\`\`jsx
'use client';
import { Tabs } from '@mantine/core';

export default function Demo() {
  return (
    // orientation="vertical"：标签栏垂直排列
    // placement="left"：标签栏在左（默认），可选 right
    <Tabs defaultValue="account" orientation="vertical" placement="left">
      <Tabs.List>
        <Tabs.Tab value="account">账号</Tabs.Tab>
        <Tabs.Tab value="security">安全</Tabs.Tab>
      </Tabs.List>
      <div>
        <Tabs.Panel value="account" pt="xs">账号设置</Tabs.Panel>
        <Tabs.Panel value="security" pt="xs">安全设置</Tabs.Panel>
      </div>
    </Tabs>
  );
}
\`\`\`

| 属性 | 可选值 | 说明 |
| --- | --- | --- |
| \`orientation\` | horizontal / vertical | 标签栏方向 |
| \`placement\` | left / right | 垂直模式下标签栏位置 |

---

## 四、color 与 variant

\`\`\`jsx
'use client';
import { Tabs } from '@mantine/core';

export default function Demo() {
  return (
    <>
      {/* color：激活色，影响下划线/背景 */}
      <Tabs defaultValue="a" color="red">
        <Tabs.List>
          <Tabs.Tab value="a">红色下划线</Tabs.Tab>
          <Tabs.Tab value="b">B</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {/* variant：视觉样式
          - default：默认下划线
          - outline：描边
          - pills：药丸形（推荐，最现代） */}
      <Tabs defaultValue="a" variant="pills" color="indigo" mt="md">
        <Tabs.List>
          <Tabs.Tab value="a">Pills 样式</Tabs.Tab>
          <Tabs.Tab value="b">B</Tabs.Tab>
        </Tabs.List>
      </Tabs>
    </>
  );
}
\`\`\`

---

## 五、keepMounted：保留 panel 状态

默认切换 tab 时旧 panel 卸载。如果你不希望组件被卸载（比如表单里输入了一半内容），用 \`keepMounted\`：

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Tabs, TextInput } from '@mantine/core';

export default function Demo() {
  const [tab1, setTab1] = useState('');
  const [tab2, setTab2] = useState('');

  return (
    // keepMounted：true 时所有 panel 都保留在 DOM（用 display:none 隐藏）
    // 好处：组件状态不丢，input 不被清空
    <Tabs defaultValue="t1" keepMounted>
      <Tabs.List>
        <Tabs.Tab value="t1">表单 A</Tabs.Tab>
        <Tabs.Tab value="t2">表单 B</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="t1" pt="xs">
        <TextInput
          label="A 表单输入"
          value={tab1}
          onChange={(e) => setTab1(e.currentTarget.value)}
          placeholder="切换到 B 再切回来，值还在"
        />
      </Tabs.Panel>

      <Tabs.Panel value="t2" pt="xs">
        <TextInput
          label="B 表单输入"
          value={tab2}
          onChange={(e) => setTab2(e.currentTarget.value)}
          placeholder="切换到 A 再切回来，值还在"
        />
      </Tabs.Panel>
    </Tabs>
  );
}
\`\`\`

> ⭐ **取舍**：\`keepMounted\` 保留状态但所有 tab 都会渲染（首次加载稍慢）；默认 \`keepMounted={false}\` 性能好但状态丢失。表单类用 \`true\`，展示类用 \`false\`。

---

## 六、activateTabWithKeyboard / allowTabDeactivation / loop

\`\`\`jsx
<Tabs
  defaultValue="a"
  // 用键盘左右箭头切换 tab（无障碍友好）
  activateTabWithKeyboard
  // 允许再次点击已激活的 tab 取消激活（变回无选中）
  // 此时 onTabChange 会收到 null
  allowTabDeactivation
  // 箭头键到头时循环到另一端
  loop
>
  <Tabs.List>
    <Tabs.Tab value="a">A</Tabs.Tab>
    <Tabs.Tab value="b">B</Tabs.Tab>
  </Tabs.List>
</Tabs>
\`\`\`

---

## 七、图标 Tabs 与右侧 Tabs

\`\`\`jsx
'use client';
import { Tabs } from '@mantine/core';
import { IconUser, IconLock, IconBell } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Tabs defaultValue="account">
      <Tabs.List>
        {/* Tab 内部放图标 + 文字 */}
        <Tabs.Tab value="account" leftSection={<IconUser size={14} />}>
          账号
        </Tabs.Tab>
        <Tabs.Tab value="security" leftSection={<IconLock size={14} />}>
          安全
        </Tabs.Tab>
        <Tabs.Tab value="notifications" leftSection={<IconBell size={14} />}>
          通知
        </Tabs.Tab>
        {/* rightSection：右侧内容，常放计数 */}
        <Tabs.Tab value="extra" rightSection={<span style={{ color: 'red' }}>3</span>}>
          待办
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="account" pt="xs">账号设置</Tabs.Panel>
      <Tabs.Panel value="security" pt="xs">安全设置</Tabs.Panel>
      <Tabs.Panel value="notifications" pt="xs">通知设置</Tabs.Panel>
      <Tabs.Panel value="extra" pt="xs">待办列表</Tabs.Panel>
    </Tabs>
  );
}
\`\`\`

---

## 八、NavLink 基础

\`NavLink\` 是「导航链接」组件，常用于侧边栏：

\`\`\`jsx
'use client';
import { NavLink } from '@mantine/core';
import { IconHome, IconUsers } from '@tabler/icons-react';

export default function Demo() {
  return (
    <>
      {/* 基础：label 显示文字，leftSection 放图标 */}
      <NavLink label="首页" leftSection={<IconHome size={16} />} />

      {/* active：高亮当前项 */}
      <NavLink label="用户" leftSection={<IconUsers size={16} />} active />

      {/* description：副标题，灰色小字 */}
      <NavLink
        label="设置"
        description="个人偏好配置"
        leftSection={<IconUsers size={16} />}
      />

      {/* rightSection：右侧内容，常放徽标 */}
      <NavLink
        label="消息"
        leftSection={<IconUsers size={16} />}
        rightSection={<span style={{ background: 'red', color: 'white', borderRadius: 8, padding: '0 6px', fontSize: 12 }}>3</span>}
      />
    </>
  );
}
\`\`\`

---

## 九、嵌套 NavLink

NavLink 可以嵌套——子菜单默认折叠，点击父级展开：

\`\`\`jsx
'use client';
import { useState } from 'react';
import { NavLink } from '@mantine/core';
import { IconUsers, IconUserPlus, IconUserEdit } from '@tabler/icons-react';

export default function Demo() {
  // 控制「用户管理」是否展开
  const [opened, setOpened] = useState(false);

  return (
    <>
      {/* 父 NavLink：onClick 控制子菜单展开 */}
      <NavLink
        label="用户管理"
        leftSection={<IconUsers size={16} />}
        opened={opened}
        onChange={setOpened}
        // autoContrast：让文字颜色在彩色背景上自动对比
        color="indigo"
        active
      >
        {/* 子 NavLink：缩进显示，去掉 leftSection */}
        <NavLink label="新增用户" leftSection={<IconUserPlus size={16} />} ml="lg" />
        <NavLink label="编辑用户" leftSection={<IconUserEdit size={16} />} ml="lg" active />
      </NavLink>

      <NavLink label="订单管理" leftSection={<IconUsers size={16} />} mt="sm" />
    </>
  );
}
\`\`\`

> ⭐ 子菜单的 \`active\` 会自动让父级也高亮，符合直觉。

---

## 十、实战：设置页 Tabs + 侧边导航

把 Tabs 和 NavLink 合用，做一个真实的设置页：

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Tabs, NavLink, Stack, TextInput, Switch, Button, Group, Divider, Text } from '@mantine/core';
import { IconUser, IconLock, IconBell } from '@tabler/icons-react';

export default function SettingsPage() {
  const [active, setActive] = useState('account');

  return (
    <Group align="flex-start" gap="xl">
      {/* 左侧导航 */}
      <Stack gap="xs" w={200}>
        <Text fw={700} mb="xs">设置</Text>
        <NavLink
          label="账号"
          leftSection={<IconUser size={16} />}
          active={active === 'account'}
          onClick={() => setActive('account')}
        />
        <NavLink
          label="安全"
          leftSection={<IconLock size={16} />}
          active={active === 'security'}
          onClick={() => setActive('security')}
        />
        <NavLink
          label="通知"
          leftSection={<IconBell size={16} />}
          active={active === 'notifications'}
          onClick={() => setActive('notifications')}
        />
      </Stack>

      {/* 右侧内容：用 Tabs 同步状态 */}
      <div style={{ flex: 1 }}>
        <Tabs value={active} onTabChange={setActive} variant="pills">
          <Tabs.List style={{ display: 'none' }}>
            {/* 隐藏 Tabs.List，只用 Tabs.Panel 渲染内容 */}
            <Tabs.Tab value="account">账号</Tabs.Tab>
            <Tabs.Tab value="security">安全</Tabs.Tab>
            <Tabs.Tab value="notifications">通知</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="account">
            <Stack gap="md">
              <TextInput label="用户名" defaultValue="zhangsan" />
              <TextInput label="邮箱" defaultValue="zhangsan@example.com" />
              <Button>保存</Button>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="security">
            <Stack gap="md">
              <Switch label="开启两步验证" />
              <Switch label="登录提醒" defaultChecked />
              <Button>更新安全设置</Button>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="notifications">
            <Stack gap="md">
              <Switch label="邮件通知" defaultChecked />
              <Switch label="站内通知" defaultChecked />
              <Switch label="短信通知" />
              <Divider />
              <Button>保存</Button>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </div>
    </Group>
  );
}
\`\`\`

---

## 小结

| 组件 / API | 作用 |
| --- | --- |
| \`Tabs\` | 选项卡容器 |
| \`Tabs.List\` / \`Tabs.Tab\` / \`Tabs.Panel\` | 标签栏/标签/面板 |
| \`value\` / \`onTabChange\` / \`defaultValue\` | 受控/非受控 |
| \`orientation\` / \`placement\` | 方向/位置 |
| \`variant\` / \`color\` | 视觉样式/激活色 |
| \`keepMounted\` | 保留 panel 状态 |
| \`NavLink\` | 导航链接 |
| \`NavLink\` 嵌套 | 子菜单 |
| \`leftSection\` / \`rightSection\` | 左右内容 |

下一章我们继续学导航类组件——Breadcrumbs、Pagination、Stepper。`,
  },

  // ============================================================
  // 第三十五章 Breadcrumbs/Pagination/Stepper
  // ============================================================
  {
    id: 'mantine2-ch35',
    group: '第八部分 导航与数据展示',
    icon: '🧾',
    title: '第三十五章 Breadcrumbs/Pagination/Stepper',
    content: `## 一句话目标

学会三个「位置感知」组件：\`Breadcrumbs\`（面包屑导航）、\`Pagination\`（分页器）、\`Stepper\`（步骤器）——它们告诉用户「你在哪、还有多远」。

---

## 一、Breadcrumbs 基础

\`\`\`jsx
'use client';
import { Breadcrumbs, Anchor } from '@mantine/core';

export default function Demo() {
  // 面包屑数据
  const items = [
    { title: '首页', href: '/' },
    { title: '用户管理', href: '/users' },
    { title: '详情', href: '/users/123' },
  ];

  return (
    // Breadcrumbs：渲染面包屑，默认分隔符是 /
    // mt：上外边距
    <Breadcrumbs mt="md">
      {items.map((item, index) => (
        // Anchor：Mantine 的 a 标签，支持 size/color/underline 等
        <Anchor size="sm" href={item.href} key={index}>
          {item.title}
        </Anchor>
      ))}
    </Breadcrumbs>
  );
}
\`\`\`

---

## 二、separator 自定义分隔符

\`\`\`jsx
'use client';
import { Breadcrumbs, Anchor, Text } from '@mantine/core';

export default function Demo() {
  return (
    <>
      {/* separator：分隔符，可以是字符串或任意 ReactNode */}
      <Breadcrumbs separator="→" mt="md">
        <Anchor size="sm" href="#">首页</Anchor>
        <Anchor size="sm" href="#">列表</Anchor>
        <Text size="sm">详情</Text>
      </Breadcrumbs>

      {/* 用图标作分隔符 */}
      <Breadcrumbs separator="·" mt="md">
        <Anchor size="sm" href="#">A</Anchor>
        <Anchor size="sm" href="#">B</Anchor>
        <Text size="sm">C</Text>
      </Breadcrumbs>
    </>
  );
}
\`\`\`

---

## 三、Breadcrumbs.Item

v9 引入了 \`Breadcrumbs.Item\`，配合 \`Breadcrumbs\` 可以更结构化：

\`\`\`jsx
'use client';
import { Breadcrumbs } from '@mantine/core';

export default function Demo() {
  return (
    <Breadcrumbs mt="md">
      {/* Breadcrumbs.Item：v9 推荐写法，类型更明确 */}
      <Breadcrumbs.Item href="/">首页</Breadcrumbs.Item>
      <Breadcrumbs.Item href="/users">用户</Breadcrumbs.Item>
      {/* 最后一项不写 href，表示当前位置 */}
      <Breadcrumbs.Item>详情</Breadcrumbs.Item>
    </Breadcrumbs>
  );
}
\`\`\`

---

## 四、Pagination 基础

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Pagination, Text } from '@mantine/core';

export default function Demo() {
  // value：当前页（从 1 开始）
  // onChange：页码变化回调，参数是新的页码
  const [page, setPage] = useState(1);

  return (
    <>
      <Text mb="sm">当前页：{page}</Text>

      {/* total：总页数 */}
      <Pagination value={page} onChange={setPage} total={10} />
    </>
  );
}
\`\`\`

> ⭐ \`value\` + \`onChange\` 是受控写法。也可以用 \`defaultValue\` 非受控，但实际项目几乎都用受控。

---

## 五、siblings / boundaries / size / color

\`\`\`jsx
'use client';
import { Pagination } from '@mantine/core';

export default function Demo() {
  return (
    <>
      {/* siblings：当前页前后显示几个数字（默认 1） */}
      <Pagination total={20} defaultValue={10} siblings={2} />

      {/* boundaries：开头和结尾显示几个数字（默认 1） */}
      <Pagination total={20} defaultValue={10} boundaries={2} mt="md" />

      {/* size：xs/sm/md/lg/xl */}
      <Pagination total={10} size="lg" mt="md" />

      {/* color：主题色 */}
      <Pagination total={10} color="red" mt="md" />
    </>
  );
}
\`\`\`

**为什么需要 \`siblings\` 和 \`boundaries\`？**

总页数 100 时，不可能把 1-100 都显示出来。Mantine 用一个公式决定显示哪些：

- 开头 \`boundaries\` 个（默认 1）
- 当前页前后 \`siblings\` 个（默认 1）
- 中间用 \`...\` 折叠
- 结尾 \`boundaries\` 个

---

## 六、withEdges / withControls / getControlAriaLabel

\`\`\`jsx
'use client';
import { Pagination } from '@mantine/core';

export default function Demo() {
  return (
    <>
      {/* withEdges：是否显示首尾跳转按钮（<< >>） */}
      <Pagination total={20} defaultValue={5} withEdges />

      {/* withControls：是否显示前后箭头（默认 true） */}
      <Pagination total={10} withControls={false} />

      {/* getControlAriaLabel：自定义无障碍标签
          参数：'first' / 'last' / 'previous' / 'next' / 页码数字 */}
      <Pagination
        total={10}
        getControlAriaLabel={(control) => {
          const labels = {
            first: '跳到第一页',
            last: '跳到最后一页',
            previous: '上一页',
            next: '下一页',
          };
          return labels[control] || '第 ' + control + ' 页';
        }}
      />
    </>
  );
}
\`\`\`

> ⭐ \`getControlAriaLabel\` 在做无障碍优化时必加——屏幕阅读器能告诉用户当前按钮是什么意思。

---

## 七、Stepper 基础

\`Stepper\` 是步骤器，常用于多步表单或流程引导：

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Stepper, Button, Group } from '@mantine/core';

export default function Demo() {
  // active：当前激活的步骤（从 0 开始）
  const [active, setActive] = useState(1);

  // nextStep / prevStep：包装函数，限制在 0-2 之间
  const nextStep = () => setActive((cur) => (cur < 2 ? cur + 1 : cur));
  const prevStep = () => setActive((cur) => (cur > 0 ? cur - 1 : cur));

  return (
    <>
      {/* Stepper：步骤容器，active 是当前步骤 */}
      <Stepper active={active} onStepClick={setActive}>
        {/* Stepper.Step：单个步骤
            label：主标题，description：副标题 */}
        <Stepper.Step label="第一步" description="填写信息">
          这是第一步的内容
        </Stepper.Step>
        <Stepper.Step label="第二步" description="确认信息">
          这是第二步的内容
        </Stepper.Step>
        <Stepper.Step label="第三步" description="完成">
          这是第三步的内容
        </Stepper.Step>

        {/* Stepper.Completed：全部步骤完成后的内容 */}
        <Stepper.Completed>
          全部步骤完成！
        </Stepper.Completed>
      </Stepper>

      <Group justify="center" mt="xl">
        <Button variant="default" onClick={prevStep}>上一步</Button>
        <Button onClick={nextStep}>下一步</Button>
      </Group>
    </>
  );
}
\`\`\`

> ⭐ \`onStepClick\` 允许用户点击步骤号直接跳转——如果不想要这个行为，不传该回调即可。

---

## 八、orientation 与 Step 配置

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Stepper } from '@mantine/core';
import { IconUserCheck, IconMailCheck, IconCheck } from '@tabler/icons-react';

export default function Demo() {
  const [active, setActive] = useState(0);
  return (
    // orientation="vertical"：垂直步骤器
    <Stepper active={active} onStepClick={setActive} orientation="vertical">
      {/* completedIcon：完成步骤显示的图标 */}
      {/* progressIcon：当前步骤显示的图标 */}
      <Stepper.Step
        label="注册账号"
        description="填写用户名密码"
        completedIcon={<IconCheck size={18} />}
        progressIcon={<IconUserCheck size={18} />}
      >
        内容 1
      </Stepper.Step>
      <Stepper.Step
        label="验证邮箱"
        description="点击邮件里的链接"
        completedIcon={<IconCheck size={18} />}
        progressIcon={<IconMailCheck size={18} />}
      >
        内容 2
      </Stepper.Step>
      <Stepper.Step
        label="完成"
        description="开始使用"
        completedIcon={<IconCheck size={18} />}
        // allowStepSelect={false}：禁止用户跳过此步骤
        allowStepSelect={false}
      >
        内容 3
      </Stepper.Step>
    </Stepper>
  );
}
\`\`\`

| Stepper.Step 属性 | 作用 |
| --- | --- |
| \`label\` | 主标题 |
| \`description\` | 副标题 |
| \`icon\` | 默认图标（未激活时） |
| \`progressIcon\` | 当前步骤图标 |
| \`completedIcon\` | 已完成步骤图标 |
| \`allowStepSelect\` | 是否允许跳转到此步 |
| \`allowStepClick\` | 是否允许点击 |

---

## 九、实战：多步注册表单

把前面知识点合起来，做一个三步注册流程：

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Stepper, Button, Group, TextInput, Stack, Checkbox, Alert } from '@mantine/core';
import { IconUserCheck, IconMailCheck, IconCheck } from '@tabler/icons-react';

export default function RegisterSteps() {
  const [active, setActive] = useState(0);
  // 表单数据
  const [form, setForm] = useState({ name: '', email: '', agree: false });
  const [error, setError] = useState('');

  const nextStep = () => {
    setError('');
    // 第一步：校验用户名
    if (active === 0 && !form.name) {
      setError('请填写用户名');
      return;
    }
    // 第二步：校验邮箱
    if (active === 1 && !form.email.includes('@')) {
      setError('请填写正确邮箱');
      return;
    }
    // 第三步：必须同意条款
    if (active === 2 && !form.agree) {
      setError('必须同意条款才能继续');
      return;
    }
    setActive((cur) => Math.min(cur + 1, 3));
  };

  const prevStep = () => setActive((cur) => Math.max(cur - 1, 0));

  return (
    <Stack gap="xl">
      <Stepper active={active} onStepClick={setActive}>
        <Stepper.Step
          label="基本信息"
          description="设置用户名"
          completedIcon={<IconCheck size={18} />}
          progressIcon={<IconUserCheck size={18} />}
        >
          <TextInput
            label="用户名"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
            placeholder="3-20 位字符"
          />
        </Stepper.Step>

        <Stepper.Step
          label="联系方式"
          description="绑定邮箱"
          completedIcon={<IconCheck size={18} />}
          progressIcon={<IconMailCheck size={18} />}
        >
          <TextInput
            label="邮箱"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.currentTarget.value })}
            placeholder="you@example.com"
          />
        </Stepper.Step>

        <Stepper.Step
          label="确认条款"
          description="同意服务协议"
          completedIcon={<IconCheck size={18} />}
        >
          <Checkbox
            checked={form.agree}
            onChange={(e) => setForm({ ...form, agree: e.currentTarget.checked })}
            label="我已阅读并同意《用户协议》和《隐私政策》"
          />
        </Stepper.Step>

        <Stepper.Completed>
          <Alert color="green" title="注册成功">
            欢迎 {form.name || '新用户'}！你的账号已创建。
          </Alert>
        </Stepper.Completed>
      </Stepper>

      {/* 错误提示 */}
      {error && <Alert color="red">{error}</Alert>}

      {/* 步骤按钮 */}
      <Group justify="space-between">
        <Button variant="default" onClick={prevStep} disabled={active === 0}>
          上一步
        </Button>
        <Button onClick={nextStep} disabled={active === 3}>
          {active === 2 ? '提交注册' : '下一步'}
        </Button>
      </Group>
    </Stack>
  );
}
\`\`\`

---

## 小结

| 组件 | 核心 API |
| --- | --- |
| \`Breadcrumbs\` | \`separator\`、\`Breadcrumbs.Item\` |
| \`Pagination\` | \`value\`、\`onChange\`、\`total\`、\`siblings\`、\`boundaries\` |
| \`Pagination\` | \`withEdges\`、\`withControls\`、\`getControlAriaLabel\` |
| \`Stepper\` | \`active\`、\`onStepClick\`、\`orientation\` |
| \`Stepper.Step\` | \`label\`、\`description\`、\`completedIcon\`、\`progressIcon\` |
| \`Stepper.Completed\` | 完成后展示内容 |

下一章学 Accordion 折叠面板和 Menu 菜单。`,
  },

  // ============================================================
  // 第三十六章 Accordion 折叠面板与 Menu 菜单
  // ============================================================
  {
    id: 'mantine2-ch36',
    group: '第八部分 导航与数据展示',
    icon: '📂',
    title: '第三十六章 Accordion 折叠面板与 Menu 菜单',
    content: `## 一句话目标

学两个「折叠/弹出」组件：\`Accordion\`（内容折叠面板，常用于 FAQ）和 \`Menu\`（右键式下拉菜单，常用于操作列表）。

---

## 一、Accordion 基础

\`\`\`jsx
'use client';
import { Accordion } from '@mantine/core';

export default function Demo() {
  return (
    // Accordion：折叠面板容器
    // defaultValue：默认展开哪个 item（值对应 Accordion.Item 的 value）
    <Accordion defaultValue="q1">
      {/* Accordion.Item：单个折叠项 */}
      <Accordion.Item value="q1">
        {/* Accordion.Control：可点击的标题区 */}
        <Accordion.Control>什么是 Mantine？</Accordion.Control>
        {/* Accordion.Panel：展开后的内容区 */}
        <Accordion.Panel>
          Mantine 是一个现代化的 React 组件库，提供 80+ 组件和 50+ hooks。
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="q2">
        <Accordion.Control>支持 TypeScript 吗？</Accordion.Control>
        <Accordion.Panel>支持，全套类型定义完善。</Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="q3">
        <Accordion.Control>收费吗？</Accordion.Control>
        <Accordion.Panel>MIT 协议，完全免费。</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
\`\`\`

> ⭐ \`Accordion.Item\` / \`Accordion.Control\` / \`Accordion.Panel\` 必须配套使用，缺一不可。

---

## 二、variant 视觉样式

\`\`\`jsx
'use client';
import { Accordion } from '@mantine/core';

export default function Demo() {
  return (
    <>
      {/* variant="default"：默认样式，每个 item 之间有分隔线 */}
      <Accordion variant="default" defaultValue="a">
        <Accordion.Item value="a">
          <Accordion.Control>Default</Accordion.Control>
          <Accordion.Panel>默认分隔线样式</Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      {/* variant="contained"：每个 item 独立成卡片 */}
      <Accordion variant="contained" defaultValue="b" mt="md">
        <Accordion.Item value="b">
          <Accordion.Control>Contained</Accordion.Control>
          <Accordion.Panel>独立卡片样式</Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      {/* variant="separated"：每个 item 分隔明显 */}
      <Accordion variant="separated" defaultValue="c" mt="md">
        <Accordion.Item value="c">
          <Accordion.Control>Separated</Accordion.Control>
          <Accordion.Panel>分离样式</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </>
  );
}
\`\`\`

---

## 三、chevronPosition、chevronSize、disableChevronRotation

\`\`\`jsx
'use client';
import { Accordion } from '@mantine/core';

export default function Demo() {
  return (
    <Accordion
      defaultValue="a"
      // chevronPosition：箭头位置，left（默认）或 right
      chevronPosition="right"
      // chevronSize：箭头大小（数字或字符串）
      chevronSize={20}
      // disableChevronRotation：禁用展开时箭头旋转动画
      // 默认展开时箭头会顺时针转 90 度
      disableChevronRotation={false}
    >
      <Accordion.Item value="a">
        <Accordion.Control>箭头在右边</Accordion.Control>
        <Accordion.Panel>展开看看箭头是否旋转</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
\`\`\`

---

## 四、multiple 多选模式与受控

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Accordion, Text } from '@mantine/core';

export default function Demo() {
  // multiple=true 时 value 是数组
  const [value, setValue] = useState(['q1']);

  return (
    <>
      <Text mb="sm">已展开：{value.join(', ')}</Text>

      {/* multiple：允许同时展开多个 item */}
      <Accordion multiple value={value} onChange={setValue}>
        <Accordion.Item value="q1">
          <Accordion.Control>问题 1</Accordion.Control>
          <Accordion.Panel>答案 1</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="q2">
          <Accordion.Control>问题 2</Accordion.Control>
          <Accordion.Panel>答案 2</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </>
  );
}
\`\`\`

> ⭐ **关键点**：\`multiple\` 模式下 \`value\` 是**字符串数组**；非 \`multiple\` 模式下 \`value\` 是**字符串**。类型不一样，别写错。

---

## 五、Menu 基础

\`Menu\` 是「点击触发下拉」的菜单，常用于操作菜单：

\`\`\`jsx
'use client';
import { Menu, Button, Text } from '@mantine/core';

export default function Demo() {
  return (
    // Menu：菜单容器
    // shadow：阴影，影响下拉框立体感
    // width：下拉框宽度（数字或字符串）
    <Menu shadow="md" width={200}>
      {/* Menu.Target：触发器，必须是单个元素 */}
      <Menu.Target>
        <Button>打开菜单</Button>
      </Menu.Target>

      {/* Menu.Dropdown：下拉内容容器 */}
      <Menu.Dropdown>
        {/* Menu.Item：菜单项 */}
        <Menu.Item>新建</Menu.Item>
        <Menu.Item>编辑</Menu.Item>
        <Menu.Item>复制</Menu.Item>

        {/* Menu.Divider：分隔线 */}
        <Menu.Divider />

        {/* Menu.Label：分组标题，灰色小字 */}
        <Menu.Label>危险操作</Menu.Label>
        <Menu.Item color="red">删除</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
\`\`\`

---

## 六、trigger / position / closeOnItemClick

\`\`\`jsx
'use client';
import { Menu, Button } from '@mantine/core';

export default function Demo() {
  return (
    <>
      {/* trigger="hover"：鼠标悬停时打开（默认是 click） */}
      <Menu trigger="hover" openDelay={100} closeDelay={400}>
        <Menu.Target>
          <Button variant="light">悬停打开</Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item>项 1</Menu.Item>
          <Menu.Item>项 2</Menu.Item>
        </Menu.Dropdown>
      </Menu>

      {/* position：下拉位置
          - bottom-start（默认）/ bottom-end / top-start / top-end 等 */}
      <Menu position="bottom-end" mt="md">
        <Menu.Target><Button variant="light">右下角</Button></Menu.Target>
        <Menu.Dropdown>
          <Menu.Item>项 1</Menu.Item>
        </Menu.Dropdown>
      </Menu>

      {/* closeOnItemClick：点击 item 后是否自动关闭（默认 true） */}
      <Menu closeOnItemClick={false} mt="md">
        <Menu.Target><Button variant="light">点了不关</Button></Menu.Target>
        <Menu.Dropdown>
          <Menu.Item>点我试试</Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  );
}
\`\`\`

---

## 七、loop / trapFocus

\`\`\`jsx
'use client';
import { Menu, Button } from '@mantine/core';

export default function Demo() {
  return (
    <Menu
      // loop：键盘箭头到头时循环到另一端（无障碍友好）
      loop
      // trapFocus：焦点锁定在菜单内（Tab 不会跑出去）
      trapFocus
    >
      <Menu.Target><Button>键盘导航</Button></Menu.Target>
      <Menu.Dropdown>
        <Menu.Item>新建文件</Menu.Item>
        <Menu.Item>打开文件</Menu.Item>
        <Menu.Item>保存</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
\`\`\`

> ⭐ 打开菜单后按 Tab 或方向键试试——焦点会在菜单项之间循环，不会跑出去。

---

## 八、Menu.Item 高级配置

\`\`\`jsx
'use client';
import { Menu, Button } from '@mantine/core';
import { IconTrash, IconEdit, IconShare, IconCopy } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Menu width={240} shadow="lg">
      <Menu.Target><Button>高级菜单</Button></Menu.Target>
      <Menu.Dropdown>
        {/* leftSection：左侧内容，常放图标 */}
        <Menu.Item leftSection={<IconEdit size={14} />}>编辑</Menu.Item>
        <Menu.Item leftSection={<IconCopy size={14} />}>复制</Menu.Item>

        {/* rightSection：右侧内容，常放快捷键提示 */}
        <Menu.Item leftSection={<IconShare size={14} />} rightSection={<span style={{ opacity: 0.5 }}>⌘S</span>}>
          分享
        </Menu.Item>

        <Menu.Divider />

        {/* color：文字颜色（常用于危险操作） */}
        <Menu.Item color="red" leftSection={<IconTrash size={14} />}>删除</Menu.Item>

        {/* disabled：禁用 */}
        <Menu.Item disabled>不可用项</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
\`\`\`

---

## 九、实战 1：FAQ 折叠面板

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Accordion, Text, TextInput, Stack, ThemeIcon } from '@mantine/core';
import { IconQuestionMark } from '@tabler/icons-react';

const faqs = [
  { q: '如何安装 Mantine？', a: '运行 npm install @mantine/core @mantine/hooks 即可。' },
  { q: '支持 Next.js 吗？', a: '支持，App Router 和 Pages Router 都行。' },
  { q: '如何切换暗色模式？', a: '使用 useMantineColorScheme hook 调用 setColorScheme。' },
  { q: '商业项目要付费吗？', a: 'MIT 协议，商业项目也免费。' },
];

export default function FAQ() {
  const [keyword, setKeyword] = useState('');

  // 过滤匹配的问题
  const filtered = faqs.filter((f) => f.q.includes(keyword));

  return (
    <Stack>
      <Text size="xl" fw={700}>常见问题</Text>
      <TextInput
        placeholder="搜索问题..."
        value={keyword}
        onChange={(e) => setKeyword(e.currentTarget.value)}
      />

      <Accordion variant="contained" chevronPosition="right">
        {filtered.map((faq, i) => (
          <Accordion.Item key={i} value={'q' + i}>
            <Accordion.Control>
              <Text fw={500}>{faq.q}</Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Text size="sm" c="dimmed">{faq.a}</Text>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>

      {filtered.length === 0 && (
        <Text c="dimmed" ta="center" mt="md">没有匹配的问题</Text>
      )}
    </Stack>
  );
}
\`\`\`

---

## 十、实战 2：右键上下文菜单

模拟文件管理器的右键菜单：

\`\`\`jsx
'use client';
import { Menu, Text, Stack } from '@mantine/core';
import { IconFolder, IconFile, IconTrash, IconPencil, IconCopy, IconDownload } from '@tabler/icons-react';

export default function FileList() {
  const files = [
    { name: '我的文档', type: 'folder' },
    { name: '简历.pdf', type: 'file' },
    { name: '照片.jpg', type: 'file' },
  ];

  return (
    <Stack gap="xs">
      {files.map((file) => (
        // 把整行包成 Menu.Target，整行都能触发
        <Menu key={file.name} width={200} shadow="md" position="bottom-start">
          <Menu.Target>
            <div style={{
              padding: '8px 12px',
              border: '1px solid #eee',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              {file.type === 'folder' ? <IconFolder size={18} /> : <IconFile size={18} />}
              <Text>{file.name}</Text>
            </div>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item leftSection={<IconPencil size={14} />}>重命名</Menu.Item>
            <Menu.Item leftSection={<IconCopy size={14} />}>复制</Menu.Item>
            <Menu.Item leftSection={<IconDownload size={14} />} disabled={file.type === 'folder'}>
              下载
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item color="red" leftSection={<IconTrash size={14} />}>删除</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ))}
    </Stack>
  );
}
\`\`\`

---

## 小结

| 组件 / API | 作用 |
| --- | --- |
| \`Accordion\` | 折叠面板容器 |
| \`Accordion.Item/Control/Panel\` | 项/标题/内容 |
| \`variant\` | default/contained/separated |
| \`chevronPosition / chevronSize\` | 箭头位置/大小 |
| \`disableChevronRotation\` | 禁用箭头旋转 |
| \`multiple\` | 多选模式（value 变数组） |
| \`Menu\` | 菜单容器 |
| \`Menu.Target / Dropdown / Item / Label / Divider\` | 触发器/下拉/项/标签/分隔 |
| \`trigger / position\` | 触发方式/位置 |
| \`closeOnItemClick / loop / trapFocus\` | 关闭/循环/焦点锁定 |
| \`Menu.Item\` | \`leftSection / rightSection / color / disabled\` |

下一章学 Table 表格和 Card 卡片。`,
  },

  // ============================================================
  // 第三十七章 Table 表格与 Card 卡片
  // ============================================================
  {
    id: 'mantine2-ch37',
    group: '第八部分 导航与数据展示',
    icon: '📊',
    title: '第三十七章 Table 表格与 Card 卡片',
    content: `## 一句话目标

用 \`Table\` 渲染结构化数据表格（带斑马纹、悬停高亮、固定表头、列边框），用 \`Card\` 组织内容卡片——后台系统最常用的两个展示组件。

---

## 一、Table 基础

\`\`\`jsx
'use client';
import { Table } from '@mantine/core';

export default function Demo() {
  const users = [
    { id: 1, name: '张三', age: 25, email: 'zhangsan@example.com' },
    { id: 2, name: '李四', age: 30, email: 'lisi@example.com' },
    { id: 3, name: '王五', age: 28, email: 'wangwu@example.com' },
  ];

  return (
    // Table：表格容器，withTableBorder 让表格带外边框
    <Table withTableBorder>
      {/* Table.Thead：表头 */}
      <Table.Thead>
        <Table.Tr>
          <Table.Th>ID</Table.Th>
          <Table.Th>姓名</Table.Th>
          <Table.Th>年龄</Table.Th>
          <Table.Th>邮箱</Table.Th>
        </Table.Tr>
      </Table.Thead>

      {/* Table.Tbody：表体 */}
      <Table.Tbody>
        {users.map((user) => (
          <Table.Tr key={user.id}>
            <Table.Td>{user.id}</Table.Td>
            <Table.Td>{user.name}</Table.Td>
            <Table.Td>{user.age}</Table.Td>
            <Table.Td>{user.email}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>

      {/* Table.Tfoot：表脚（可选，常用于汇总） */}
      <Table.Tfoot>
        <Table.Tr>
          <Table.Td colSpan={4}>共 {users.length} 条</Table.Td>
        </Table.Tr>
      </Table.Tfoot>
    </Table>
  );
}
\`\`\`

> ⭐ v9 推荐用 \`Table.Thead/Tbody/Tr/Th/Td\` 这种语义化子组件，类似原生 HTML 但带样式。也可以直接写 \`<thead>\`，但会失去类型提示。

---

## 二、striped / highlightOnHover / spacing

\`\`\`jsx
'use client';
import { Table } from '@mantine/core';

export default function Demo() {
  return (
    <Table
      // striped：斑马纹（奇数行浅灰背景）
      striped
      // highlightOnHover：鼠标悬停高亮整行
      highlightOnHover
      // horizontalSpacing：列间距（默认 xs）
      horizontalSpacing="md"
      // verticalSpacing：行间距（默认 xs）
      verticalSpacing="sm"
      withTableBorder
      withColumnBorders  // 列之间加分隔线
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th>姓名</Table.Th>
          <Table.Th>分数</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <Table.Tr><Table.Td>张三</Table.Td><Table.Td>95</Table.Td></Table.Tr>
        <Table.Tr><Table.Td>李四</Table.Td><Table.Td>88</Table.Td></Table.Tr>
        <Table.Tr><Table.Td>王五</Table.Td><Table.Td>72</Table.Td></Table.Tr>
      </Table.Tbody>
    </Table>
  );
}
\`\`\`

---

## 三、borderColor / withTableBorder / withColumnBorders

\`\`\`jsx
'use client';
import { Table } from '@mantine/core';

export default function Demo() {
  return (
    <>
      {/* withTableBorder：表格外边框 */}
      <Table withTableBorder>
        <Table.Thead><Table.Tr><Table.Th>仅外边框</Table.Th></Table.Tr></Table.Thead>
        <Table.Tbody><Table.Tr><Table.Td>无列分隔线</Table.Td></Table.Tr></Table.Tbody>
      </Table>

      {/* withColumnBorders：列分隔线 */}
      <Table withTableBorder withColumnBorders mt="md">
        <Table.Thead><Table.Tr><Table.Th>列 1</Table.Th><Table.Th>列 2</Table.Th></Table.Tr></Table.Thead>
        <Table.Tbody><Table.Tr><Table.Td>A</Table.Td><Table.Td>B</Table.Td></Table.Tr></Table.Tbody>
      </Table>

      {/* borderColor：自定义边框色 */}
      <Table withTableBorder borderColor="blue.3" mt="md">
        <Table.Thead><Table.Tr><Table.Th>蓝色边框</Table.Th></Table.Tr></Table.Thead>
        <Table.Tbody><Table.Tr><Table.Td>内容</Table.Td></Table.Tr></Table.Tbody>
      </Table>
    </>
  );
}
\`\`\`

---

## 四、Caption 表格标题

\`\`\`jsx
'use client';
import { Table } from '@mantine/core';

export default function Demo() {
  return (
    <Table withTableBorder>
      {/* Table.Caption：表格标题（无障碍友好，屏幕阅读器会读） */}
      <Table.Caption>2026 年第一季度销售数据</Table.Caption>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>月份</Table.Th>
          <Table.Th>销售额</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <Table.Tr><Table.Td>1 月</Table.Td><Table.Td>¥120,000</Table.Td></Table.Tr>
        <Table.Tr><Table.Td>2 月</Table.Td><Table.Td>¥150,000</Table.Td></Table.Tr>
      </Table.Tbody>
    </Table>
  );
}
\`\`\`

---

## 五、表头排序

Table 本身不提供排序逻辑（要自己写），但提供受控样式：

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Table, Group, Text, Badge } from '@mantine/core';

export default function Demo() {
  const data = [
    { name: '张三', age: 25, score: 95 },
    { name: '李四', age: 30, score: 88 },
    { name: '王五', age: 22, score: 72 },
    { name: '赵六', age: 28, score: 91 },
  ];

  // sortKey：按哪个字段排序，sortOrder：asc 或 desc
  const [sortKey, setSortKey] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // 排序函数
  const sorted = [...data].sort((a, b) => {
    const va = a[sortKey];
    const vb = b[sortKey];
    if (va < vb) return sortOrder === 'asc' ? -1 : 1;
    if (va > vb) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // 点击表头切换排序
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <Table striped highlightOnHover withTableBorder withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          {/* 点击表头排序 */}
          <Table.Th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
            姓名 {sortKey === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
          </Table.Th>
          <Table.Th onClick={() => handleSort('age')} style={{ cursor: 'pointer' }}>
            年龄 {sortKey === 'age' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
          </Table.Th>
          <Table.Th onClick={() => handleSort('score')} style={{ cursor: 'pointer' }}>
            分数 {sortKey === 'score' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {sorted.map((u) => (
          <Table.Tr key={u.name}>
            <Table.Td>{u.name}</Table.Td>
            <Table.Td>{u.age}</Table.Td>
            <Table.Td>
              {/* 分数用 Badge 显示颜色 */}
              <Badge color={u.score >= 90 ? 'green' : u.score >= 80 ? 'yellow' : 'red'}>
                {u.score}
              </Badge>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
\`\`\`

---

## 六、stickyHeader 固定表头

表格内容很多时，滚动到下面会看不到表头。用 \`stickyHeader\`：

\`\`\`jsx
'use client';
import { Table, ScrollArea } from '@mantine/core';

export default function Demo() {
  // 造 50 行假数据
  const rows = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: '用户 ' + (i + 1),
    email: 'user' + (i + 1) + '@example.com',
  }));

  return (
    // ScrollArea：可滚动容器
    <ScrollArea h={300}>
      <Table
        striped
        highlightOnHover
        withTableBorder
        // stickyHeader：表头粘在顶部（滚动时不动）
        stickyHeader
        // stickyHeaderOffset：粘顶时距顶偏移（如果有其他吸顶元素）
        stickyHeaderOffset={0}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ID</Table.Th>
            <Table.Th>姓名</Table.Th>
            <Table.Th>邮箱</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((r) => (
            <Table.Tr key={r.id}>
              <Table.Td>{r.id}</Table.Td>
              <Table.Td>{r.name}</Table.Td>
              <Table.Td>{r.email}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
\`\`\`

> ⭐ \`stickyHeader\` 配合 \`ScrollArea\` 是后台表格的标配——50 行以上数据必须固定表头，否则用户分不清哪列是什么。

---

## 七、Card 基础

\`\`\`jsx
'use client';
import { Card, Text, Group, Button, Badge } from '@mantine/core';

export default function Demo() {
  return (
    // Card：卡片容器
    // shadow：阴影，从 sm 到 xl 越来越深
    // padding：内边距
    // radius：圆角
    // withBorder：是否显示边框
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Text fw={500}>产品标题</Text>
        <Badge color="pink" variant="light">新品</Badge>
      </Group>

      <Text size="sm" c="dimmed">
        这是产品的描述文字，介绍这个产品的特点和功能。
      </Text>

      <Button fullWidth mt="md" variant="light" color="blue">
        立即购买
      </Button>
    </Card>
  );
}
\`\`\`

---

## 八、Card.Section 与子组件

\`Card.Section\` 是「全宽区段」——不受父级 padding 影响，常用于卡片内的图片：

\`\`\`jsx
'use client';
import { Card, Image, Text, Group, Button, Badge } from '@mantine/core';

export default function Demo() {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder w={300}>
      {/* Card.Section：脱离父级 padding，铺满卡片宽度 */}
      <Card.Section>
        <Image
          src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"
          height={160}
          alt="商品图"
        />
      </Card.Section>

      {/* Card.Header：可选的头部区 */}
      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500}>北欧风椅子</Text>
        <Badge color="green" variant="light">¥299</Badge>
      </Group>

      <Text size="sm" c="dimmed">
        简约现代设计，木质结构，适合任何家居风格。
      </Text>

      <Button color="blue" fullWidth mt="md" radius="md">
        加入购物车
      </Button>
    </Card>
  );
}
\`\`\`

> ⭐ \`Card.Section\` 默认上下有 1px 间距——配 \`inheritPadding\` 可以让它继承父级 padding：

\`\`\`jsx
<Card.Section inheritPadding withBorder>
  继承父级 padding 的区段
</Card.Section>
\`\`\`

---

## 九、Card.Title 与组合

\`\`\`jsx
'use client';
import { Card, Text, Group, ThemeIcon, Badge, Divider, Stack } from '@mantine/core';
import { IconStar } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Card withBorder padding="lg" radius="md" w={320}>
      <Group justify="space-between" mb="sm">
        {/* Card.Title：标题样式，比普通 Text 粗一点 */}
        <Card.Title>订单 #12345</Card.Title>
        <Badge color="green" variant="light">已完成</Badge>
      </Group>

      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">商品数量</Text>
          <Text size="sm">3 件</Text>
        </Group>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">总金额</Text>
          <Text size="sm" fw={500}>¥899</Text>
        </Group>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">下单时间</Text>
          <Text size="sm">2026-07-19 10:30</Text>
        </Group>
      </Stack>

      <Divider my="sm" />

      <Group justify="space-between">
        <Group gap={4}>
          <ThemeIcon variant="light" color="yellow" size="sm">
            <IconStar size={14} />
          </ThemeIcon>
          <Text size="sm">5 星好评</Text>
        </Group>
      </Group>
    </Card>
  );
}
\`\`\`

---

## 十、实战：用户列表表格

把 Table 和 Card 合用，做一个后台用户列表页：

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Card, Table, Group, Text, Avatar, Badge, Button, TextInput, Stack } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

const users = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', role: 'admin', status: 'active' },
  { id: 2, name: '李四', email: 'lisi@example.com', role: 'editor', status: 'active' },
  { id: 3, name: '王五', email: 'wangwu@example.com', role: 'viewer', status: 'inactive' },
  { id: 4, name: '赵六', email: 'zhaoliu@example.com', role: 'editor', status: 'active' },
];

export default function UserList() {
  const [keyword, setKeyword] = useState('');

  // 按关键字过滤
  const filtered = users.filter(
    (u) => u.name.includes(keyword) || u.email.includes(keyword)
  );

  // 角色徽标颜色
  const roleColors = { admin: 'red', editor: 'blue', viewer: 'gray' };
  // 状态徽标颜色
  const statusColors = { active: 'green', inactive: 'gray' };

  return (
    <Stack>
      {/* 顶部：标题 + 搜索框 */}
      <Group justify="space-between">
        <Text size="xl" fw={700}>用户管理</Text>
        <TextInput
          placeholder="搜索用户..."
          leftSection={<IconSearch size={16} />}
          value={keyword}
          onChange={(e) => setKeyword(e.currentTarget.value)}
          w={300}
        />
      </Group>

      {/* 卡片包裹表格 */}
      <Card withBorder padding={0} radius="md">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>用户</Table.Th>
              <Table.Th>邮箱</Table.Th>
              <Table.Th>角色</Table.Th>
              <Table.Th>状态</Table.Th>
              <Table.Th>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filtered.map((user) => (
              <Table.Tr key={user.id}>
                <Table.Td>
                  <Group gap="sm">
                    <Avatar color={roleColors[user.role]} size="sm" radius="xl">
                      {user.name[0]}
                    </Avatar>
                    <Text size="sm" fw={500}>{user.name}</Text>
                  </Group>
                </Table.Td>
                <Table.Td><Text size="sm">{user.email}</Text></Table.Td>
                <Table.Td>
                  <Badge color={roleColors[user.role]} variant="light">
                    {user.role}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge color={statusColors[user.status]} variant="filled">
                    {user.status === 'active' ? '活跃' : '禁用'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Button size="xs" variant="subtle">编辑</Button>
                  <Button size="xs" variant="subtle" color="red">删除</Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {filtered.length === 0 && (
          <Text ta="center" c="dimmed" py="xl">没有匹配的用户</Text>
        )}
      </Card>
    </Stack>
  );
}
\`\`\`

---

## 小结

| 组件 / API | 作用 |
| --- | --- |
| \`Table\` | 表格容器 |
| \`Table.Thead/Tbody/Tfoot\` | 表头/表体/表脚 |
| \`Table.Tr/Th/Td\` | 行/表头单元格/单元格 |
| \`Table.Caption\` | 表格标题 |
| \`striped\` | 斑马纹 |
| \`highlightOnHover\` | 悬停高亮 |
| \`horizontalSpacing / verticalSpacing\` | 列/行间距 |
| \`withTableBorder / withColumnBorders / borderColor\` | 边框 |
| \`stickyHeader\` | 固定表头 |
| \`Card\` | 卡片容器 |
| \`Card.Section\` | 全宽区段 |
| \`Card.Header / Card.Title\` | 头部/标题 |

下一章学 Timeline 时间线和 Avatar 头像。`,
  },

  // ============================================================
  // 第三十八章 Timeline 时间线与 Avatar 头像
  // ============================================================
  {
    id: 'mantine2-ch38',
    group: '第八部分 导航与数据展示',
    icon: '🕐',
    title: '第三十八章 Timeline 时间线与 Avatar 头像',
    content: `## 一句话目标

用 \`Timeline\` 展示有先后顺序的事件（订单流程、操作日志），用 \`Avatar\` 显示用户头像（支持图片、占位、堆叠）——两个组件合在一起就是「订单详情」最常见的一段。

---

## 一、Timeline 基础

\`\`\`jsx
'use client';
import { Timeline, Text } from '@mantine/core';

export default function Demo() {
  return (
    // Timeline：时间线容器
    // active={2}：标记前 3 个项目（0/1/2）为已完成（蓝色填充）
    <Timeline active={2} bulletSize={24} lineWidth={2}>
      {/* Timeline.Item：单个时间点 */}
      {/* title：标题，会显示在 bullet 右边 */}
      <Timeline.Item title="订单已创建">
        <Text c="dimmed" size="sm">2026-07-19 10:00</Text>
        <Text size="xs" mt={4}>用户下单，等待支付</Text>
      </Timeline.Item>

      <Timeline.Item title="支付成功">
        <Text c="dimmed" size="sm">2026-07-19 10:05</Text>
        <Text size="xs" mt={4}>支付金额 ¥299</Text>
      </Timeline.Item>

      <Timeline.Item title="商家发货">
        <Text c="dimmed" size="sm">2026-07-19 14:00</Text>
        <Text size="xs" mt={4}>顺丰快递 SF1234567890</Text>
      </Timeline.Item>

      <Timeline.Item title="用户签收">
        <Text c="dimmed" size="sm">等待中</Text>
      </Timeline.Item>
    </Timeline>
  );
}
\`\`\`

> ⭐ \`active\` 的语义：从第 0 项开始到第 \`active\` 项，全部标记为「已完成」。如果传 \`active={3}\` 但只有 4 项，那第 0-3 项都已完成，只剩第 4 项未完成。

---

## 二、bulletSize / lineWidth / align

\`\`\`jsx
'use client';
import { Timeline } from '@mantine/core';

export default function Demo() {
  return (
    <Timeline
      active={1}
      // bulletSize：圆点大小（默认 20）
      bulletSize={28}
      // lineWidth：连接线宽度（默认 4）
      lineWidth={3}
      // align：对齐方向，left（默认）或 right
      align="left"
    >
      <Timeline.Item title="步骤 1" bulletSize={28} />
      <Timeline.Item title="步骤 2" />
      <Timeline.Item title="步骤 3" />
    </Timeline>
  );
}
\`\`\`

| 属性 | 作用 | 默认值 |
| --- | --- | --- |
| \`active\` | 已完成的项目数 | 0 |
| \`bulletSize\` | 圆点大小 | 20 |
| \`lineWidth\` | 连接线宽度 | 4 |
| \`align\` | 对齐方向 | left |

---

## 三、自定义 bullet 与 icon

\`\`\`jsx
'use client';
import { Timeline, Text } from '@mantine/core';
import { IconCheck, IconX, IconLoader } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Timeline active={1} bulletSize={30} lineWidth={2}>
      {/* bullet：自定义圆点内容，覆盖默认样式 */}
      <Timeline.Item
        bullet={<IconCheck size={18} />}
        title="已完成步骤"
      >
        <Text size="sm" c="dimmed">绿色对勾</Text>
      </Timeline.Item>

      {/* icon 等同于 bullet */}
      <Timeline.Item bullet={<IconLoader size={18} />} title="进行中步骤">
        <Text size="sm" c="dimmed">旋转图标</Text>
      </Timeline.Item>

      <Timeline.Item bullet={<IconX size={18} />} title="失败步骤">
        <Text size="sm" c="dimmed">红色叉号</Text>
      </Timeline.Item>

      {/* 不传 bullet 的项目用默认圆点 */}
      <Timeline.Item title="默认样式">
        <Text size="sm" c="dimmed">普通圆点</Text>
      </Timeline.Item>
    </Timeline>
  );
}
\`\`\`

---

## 四、Avatar 基础

\`\`\`jsx
'use client';
import { Avatar } from '@mantine/core';

export default function Demo() {
  return (
    <>
      {/* 1. src 加载图片 */}
      <Avatar src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png" alt="用户" />

      {/* 2. size：尺寸，支持数字或 xs/sm/md/lg/xl */}
      <Avatar src="https://avatars.githubusercontent.com/u/1?v=4" size="lg" />

      {/* 3. radius：圆角，xl 是圆形 */}
      <Avatar src="https://avatars.githubusercontent.com/u/2?v=4" radius="xl" size={50} />

      {/* 4. color：当没有 src 时，背景色 */}
      <Avatar color="blue" radius="xl">ZS</Avatar>

      {/* 5. variant：filled（默认）/ light / outline / subtle */}
      <Avatar color="grape" variant="light" radius="sm">LS</Avatar>
    </>
  );
}
\`\`\`

---

## 五、placeholder：无图占位

当 \`src\` 加载失败或没传时，显示什么？用 \`placeholder\`：

\`\`\`jsx
'use client';
import { Avatar } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';

export default function Demo() {
  return (
    <>
      {/* placeholder：src 失败时显示的内容 */}
      <Avatar
        src="https://example.com/broken-image.png"
        // 如果图片加载失败，会显示这个图标
        placeholder={<IconUser size={20} />}
        color="gray"
        radius="xl"
        size={50}
      />

      {/* 没传 src，直接显示 children */}
      <Avatar color="red" radius="xl" size={50} ml="md">
        WK
      </Avatar>

      {/* children 自动居中，可以是文字或图标 */}
      <Avatar color="teal" radius="xl" size={50} ml="md">
        <IconUser size={20} />
      </Avatar>
    </>
  );
}
\`\`\`

> ⭐ \`placeholder\` 和 \`children\` 的区别：\`children\` 永远显示，\`placeholder\` 只在 \`src\` 加载失败时显示。生产中通常用 \`placeholder\` + 一个默认头像图标。

---

## 六、Avatar.Group：堆叠头像

多个头像要叠在一起显示时用 \`Avatar.Group\`：

\`\`\`jsx
'use client';
import { Avatar, AvatarGroup, Text, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      {/* AvatarGroup：堆叠头像容器 */}
      <AvatarGroup spacing="sm">
        {/* spacing：堆叠间距，sm 是部分重叠 */}
        <Avatar src="https://avatars.githubusercontent.com/u/1?v=4" />
        <Avatar src="https://avatars.githubusercontent.com/u/2?v=4" />
        <Avatar src="https://avatars.githubusercontent.com/u/3?v=4" />
      </AvatarGroup>

      {/* max：最多显示几个，多的用 +N 表示 */}
      <AvatarGroup spacing="lg" max={3}>
        <Avatar src="https://avatars.githubusercontent.com/u/1?v=4" />
        <Avatar src="https://avatars.githubusercontent.com/u/2?v=4" />
        <Avatar src="https://avatars.githubusercontent.com/u/3?v=4" />
        <Avatar src="https://avatars.githubusercontent.com/u/4?v=4" />
        <Avatar src="https://avatars.githubusercontent.com/u/5?v=4" />
        {/* 5 个头像只显示前 3 个，剩余的合并为 "+2" */}
      </AvatarGroup>
    </Stack>
  );
}
\`\`\`

> ⭐ \`Avatar.Group\` 在「参与人数」「协作成员」场景特别有用——比如看板卡片上显示参与项目的成员头像。

---

## 七、Indicator：状态指示器

\`Indicator\` 常配合 \`Avatar\` 显示在线状态、未读消息数等：

\`\`\`jsx
'use client';
import { Avatar, Indicator, Group, Text, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Group>
      {/* Indicator：在右上角加状态点 */}
      {/* color：圆点颜色，size：圆点大小，offset：偏移 */}
      <Indicator color="green" size={12} offset={5} processing>
        {/* processing：圆点呼吸动画（在线状态） */}
        <Avatar src="https://avatars.githubusercontent.com/u/1?v=4" />
      </Indicator>

      {/* 离线状态 */}
      <Indicator color="gray" size={12} offset={5}>
        <Avatar src="https://avatars.githubusercontent.com/u/2?v=4" />
      </Indicator>

      {/* 带数字的徽标 */}
      <Indicator color="red" size={16} offset={-3} label={9} inline>
        {/* label：显示数字，inline：内联模式 */}
        <Avatar src="https://avatars.githubusercontent.com/u/3?v=4" />
      </Indicator>

      {/* 带边框的指示器 */}
      <Indicator color="blue" size={14} offset={7} withBorder>
        <Avatar color="blue" radius="xl">A</Avatar>
      </Indicator>
    </Group>
  );
}
\`\`\`

---

## 八、实战：订单流程时间线 + 协作成员

把 Timeline、Avatar、Avatar.Group、Indicator 合起来，做一个完整的订单详情页：

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Card, Timeline, Text, Group, Avatar, AvatarGroup, Indicator, Badge, Stack, Button, Divider } from '@mantine/core';
import { IconCheck, IconPackage, IconTruck, IconHome, IconUser } from '@tabler/icons-react';

const orderEvents = [
  {
    title: '订单已创建',
    time: '2026-07-19 10:00',
    desc: '用户张三下单购买商品',
    icon: <IconUser size={16} />,
  },
  {
    title: '支付完成',
    time: '2026-07-19 10:05',
    desc: '微信支付 ¥299.00',
    icon: <IconCheck size={16} />,
  },
  {
    title: '商家已发货',
    time: '2026-07-19 14:00',
    desc: '顺丰快递，运单号 SF1234567890',
    icon: <IconPackage size={16} />,
  },
  {
    title: '运输中',
    time: '2026-07-20 09:30',
    desc: '包裹已到达上海转运中心',
    icon: <IconTruck size={16} />,
  },
  {
    title: '等待签收',
    time: '预计 2026-07-21 送达',
    desc: '请保持电话畅通',
    icon: <IconHome size={16} />,
  },
];

const collaborators = [
  { name: '张三', avatar: 'https://avatars.githubusercontent.com/u/1?v=4', online: true },
  { name: '李四', avatar: 'https://avatars.githubusercontent.com/u/2?v=4', online: false },
  { name: '王五', avatar: 'https://avatars.githubusercontent.com/u/3?v=4', online: true },
  { name: '赵六', avatar: 'https://avatars.githubusercontent.com/u/4?v=4', online: true },
  { name: '钱七', avatar: 'https://avatars.githubusercontent.com/u/5?v=4', online: false },
];

export default function OrderTimeline() {
  // 当前已完成到第 3 步（运输中），第 4 步待完成
  const [activeStep] = useState(3);

  return (
    <Stack gap="lg">
      {/* 顶部：订单号 + 协作成员 */}
      <Card withBorder padding="lg" radius="md">
        <Group justify="space-between">
          <Stack gap={4}>
            <Text size="xl" fw={700}>订单 #20260719001</Text>
            <Group>
              <Badge color="blue" variant="light">运输中</Badge>
              <Text size="sm" c="dimmed">¥299.00</Text>
            </Group>
          </Stack>

          {/* 协作成员头像组 */}
          <Group>
            <AvatarGroup spacing="sm" max={3}>
              {collaborators.map((c) => (
                <Indicator
                  key={c.name}
                  color={c.online ? 'green' : 'gray'}
                  size={10}
                  offset={4}
                  processing={c.online}
                >
                  <Avatar src={c.avatar} name={c.name} />
                </Indicator>
              ))}
            </AvatarGroup>
            <Text size="xs" c="dimmed">+5</Text>
          </Group>
        </Group>
      </Card>

      {/* 时间线卡片 */}
      <Card withBorder padding="lg" radius="md">
        <Text size="lg" fw={700} mb="md">订单流程</Text>

        <Timeline active={activeStep} bulletSize={28} lineWidth={3}>
          {orderEvents.map((event, i) => (
            <Timeline.Item
              key={i}
              bullet={event.icon}
              title={
                <Group gap="xs">
                  <Text fw={500}>{event.title}</Text>
                  {i === activeStep && <Badge size="xs" color="blue" variant="light">当前</Badge>}
                  {i < activeStep && <Badge size="xs" color="green" variant="light">完成</Badge>}
                </Group>
              }
            >
              <Text c="dimmed" size="sm">{event.time}</Text>
              <Text size="xs" mt={4}>{event.desc}</Text>
            </Timeline.Item>
          ))}
        </Timeline>

        <Divider my="lg" />

        <Group justify="flex-end">
          <Button variant="default">联系客服</Button>
          <Button color="blue">查看物流</Button>
        </Group>
      </Card>
    </Stack>
  );
}
\`\`\`

---

## 小结

| 组件 / API | 作用 |
| --- | --- |
| \`Timeline\` | 时间线容器 |
| \`active\` | 已完成项目数 |
| \`bulletSize / lineWidth / align\` | 圆点大小/线宽/对齐 |
| \`Timeline.Item\` | 单个时间点 |
| \`bullet / title\` | 自定义圆点/标题 |
| \`Avatar\` | 头像 |
| \`src / size / radius / color / variant\` | 头像配置 |
| \`placeholder\` | 加载失败时的占位 |
| \`AvatarGroup\` | 堆叠头像 |
| \`spacing / max\` | 间距/最多显示几个 |
| \`Indicator\` | 状态指示器 |
| \`color / size / offset / processing / label / withBorder\` | Indicator 配置 |

至此「导航与数据展示」部分结束。下一部分我们进入主题与样式定制。`,
  },
];

export { chapters };
