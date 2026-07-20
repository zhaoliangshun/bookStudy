// =============================================================
// Mantine 从入门到精通大全 - 第七批章节（第七部分 反馈与覆盖层，共 5 章）
// -------------------------------------------------------------
// 本批包含：
//   mantine2-ch28 : 第二十八章 Modal 对话框
//   mantine2-ch29 : 第二十九章 Drawer 抽屉
//   mantine2-ch30 : 第三十章 Popover/Tooltip/HoverCard 悬浮卡片
//   mantine2-ch31 : 第三十一章 Alert 警告与 Notification 通知
//   mantine2-ch32 : 第三十二章 LoadingOverlay/Skeleton/Progress/Loader
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：Mantine v9 / React 19 / Next.js 16
// =============================================================

const chapters = [
  // ============================================================
  // 第二十八章 Modal 对话框
  // ============================================================
  {
    id: 'mantine2-ch28',
    group: '第七部分 反馈与覆盖层',
    icon: '🪟',
    title: '第二十八章 Modal 对话框',
    content: `## 一句话目标

掌握 \`Modal\` 对话框的所有用法——基础属性、子组件拆分、交互行为、过渡动画、全屏模式，并完成一个确认删除对话框实战。

---

## 一、Modal 最小用法

Modal 是覆盖在页面上的对话框，受 \`opened\` 布尔值控制：

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Modal, Button, Group } from '@mantine/core';

export default function Demo() {
  // opened：是否打开；open/close：显式开关
  const [opened, setOpened] = useState(false);

  return (
    <>
      {/* 点击按钮打开 Modal */}
      <Button onClick={() => setOpened(true)}>打开对话框</Button>

      {/* Modal 组件：
          - opened：当前是否显示
          - onClose：关闭回调（点遮罩 / ESC / 关闭按钮都会触发）
          - title：标题栏文字 */}
      <Modal opened={opened} onClose={() => setOpened(false)} title="用户协议">
        <p>请仔细阅读本协议……</p>
      </Modal>
    </>
  );
}
\`\`\`

> ⭐ 记住三件套：\`opened\` + \`onClose\` + \`title\`，就能跑起来一个最简单的对话框。

---

## 二、useDisclosure：开关状态的最佳搭档

手写 \`useState\` + 两个回调函数太啰嗦，Mantine 提供了 \`useDisclosure\`：

\`\`\`jsx
'use client';
import { Modal, Button, Group } from '@mantine/core';
// useDisclosure：专门管理布尔开关状态的 hook
import { useDisclosure } from '@mantine/hooks';

export default function Demo() {
  // 返回 [opened, { open, close, toggle }]
  // - opened：当前状态
  // - open：设为 true
  // - close：设为 false
  // - toggle：切换
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button onClick={open}>打开</Button>

      <Modal opened={opened} onClose={close} title="提示">
        {/* Modal 默认会在右上角渲染关闭按钮，点它也会触发 onClose */}
        <p>用 useDisclosure 写起来更简洁</p>
        <Button fullWidth mt="md" onClick={close}>
          知道了
        </Button>
      </Modal>
    </>
  );
}
\`\`\`

> ⭐ **强烈推荐**：所有 Modal/Drawer/Popover 的开关状态都用 \`useDisclosure\`，代码更清爽。

---

## 三、尺寸、位置与圆角

\`\`\`jsx
'use client';
import { Modal, Button, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export default function Demo() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button onClick={open}>打开</Button>

      <Modal
        opened={opened}
        onClose={close}
        title="自定义尺寸"
        // size：宽度。可以是预设（xs/sm/md/lg/xl）或具体像素
        // md=480px, lg=720px, xl=920px
        size="lg"
        // centered：是否垂直居中（默认是顶部留 100px）
        // 重要表单建议设 true，让焦点居中
        centered
        // radius：圆角，覆盖主题默认值
        radius="lg"
        // padding：内边距，默认是 md
        padding="xl"
      >
        <p>这是一个大尺寸、居中、大圆角的对话框。</p>
      </Modal>
    </>
  );
}
\`\`\`

**常见尺寸对照：**

| size | 宽度 |
| --- | --- |
| xs | 320px |
| sm | 380px |
| md | 480px |
| lg | 720px |
| xl | 920px |

---

## 四、交互行为：关还是不关

Modal 默认行为：点遮罩关闭、按 ESC 关闭、显示关闭按钮。这些都可以单独关闭：

\`\`\`jsx
'use client';
import { Modal, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export default function Demo() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button onClick={open}>打开重要表单</Button>

      <Modal
        opened={opened}
        onClose={close}
        title="填写订单"
        // closeOnClickOutside：点遮罩是否关闭（默认 true）
        // 表单场景设 false，避免误触丢失数据
        closeOnClickOutside={false}
        // closeOnEscape：按 ESC 是否关闭（默认 true）
        // 同样建议重要表单设 false
        closeOnEscape={false}
        // withCloseButton：是否显示右上角关闭按钮（默认 true）
        // 强制流程的弹窗可以隐藏，让用户只能点底部按钮
        withCloseButton={false}
      >
        <p>这时只能通过下方按钮关闭</p>
        <Button fullWidth mt="md" color="gray" onClick={close}>
          取消
        </Button>
      </Modal>
    </>
  );
}
\`\`\`

> ⭐ **设计原则**：表单 / 重要操作的 Modal，关掉 \`closeOnClickOutside\` 和 \`closeOnEscape\`，避免用户误触丢数据。

---

## 五、Modal 子组件：精细控制布局

除了 \`title\` 字符串，还可以用 \`Modal.Header\` / \`Modal.Title\` / \`Modal.Body\` / \`Modal.CloseButton\` 拆分布局：

\`\`\`jsx
'use client';
import { Modal, Button, Group, Text, ThemeIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertTriangle } from '@tabler/icons-react';

export default function Demo() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button onClick={open}>打开自定义布局</Button>

      <Modal opened={opened} onClose={close} size="md">
        {/* Modal.Header：标题栏，包含 title 和关闭按钮
            withCloseButton=false 隐藏默认按钮，自己渲染 */}
        <Modal.Header>
          <Group gap="sm">
            <ThemeIcon color="red" variant="light" radius="xl">
              <IconAlertTriangle size={18} />
            </ThemeIcon>
            {/* Modal.Title：标题文字，自带字体加粗 */}
            <Modal.Title>危险操作</Modal.Title>
          </Group>
          {/* Modal.CloseButton：独立的关闭按钮，自动绑定 onClose */}
          <Modal.CloseButton />
        </Modal.Header>

        {/* Modal.Body：内容区，自动加上 padding */}
        <Modal.Body>
          <Text>此操作将永久删除该用户的所有数据，无法恢复。</Text>
          <Group justify="flex-end" mt="lg">
            <Button variant="default" onClick={close}>取消</Button>
            <Button color="red" onClick={close}>确认删除</Button>
          </Group>
        </Modal.Body>
      </Modal>
    </>
  );
}
\`\`\`

**什么时候用子组件？**

- 自定义标题栏图标、副标题。
- 调整 padding、间距。
- 顶部放 Tabs、底部固定按钮等结构。

---

## 六、过渡动画：transitionProps

Modal 出现/消失的动画可以自定义：

\`\`\`jsx
'use client';
import { Modal, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export default function Demo() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button onClick={open}>打开带动画的 Modal</Button>

      <Modal
        opened={opened}
        onClose={close}
        title="动画配置"
        // transitionProps：传给底层 Transition 组件
        // - transition：动画类型（fade/scale/slide-x/slide-y 等）
        // - duration：动画时长（毫秒）
        // - timingFunction：缓动函数
        transitionProps={{ transition: 'pop', duration: 300 }}
        // exitTransitionDuration：关闭时的动画时长
        // 关闭太快用户看不清，设 200ms 让退出更柔和
        exitTransitionDuration={200}
      >
        <p>scale 缩放 + pop 弹性，对话框会"弹"出来</p>
      </Modal>
    </>
  );
}
\`\`\`

**常用动画类型：**

| transition | 效果 |
| --- | --- |
| fade | 淡入淡出 |
| scale | 缩放 |
| pop | 弹性缩放（默认） |
| slide-up / slide-down | 上下滑入 |
| slide-left / slide-right | 左右滑入 |

---

## 七、全屏 Modal 与焦点陷阱

\`\`\`jsx
'use client';
import { Modal, Button, Stack, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export default function Demo() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button onClick={open}>打开全屏表单</Button>

      <Modal
        opened={opened}
        onClose={close}
        title="多步表单"
        // fullScreen：占满整个视口
        // 适合移动端复杂表单 / 图片查看器
        fullScreen
        // trapFocus：焦点陷阱（默认 true）
        // Tab 键只能在 Modal 内部循环，不会跑到背后页面
        trapFocus
        // returnFocus：关闭后焦点回到触发元素（默认 true）
        // 对无障碍很重要，键盘用户能继续操作
        returnFocus
      >
        <Stack>
          <TextInput label="姓名" placeholder="请输入" />
          <TextInput label="邮箱" placeholder="请输入" />
          <Button onClick={close}>提交</Button>
        </Stack>
      </Modal>
    </>
  );
}
\`\`\`

**trapFocus 和 returnFocus 的作用：**

- \`trapFocus\`：键盘 Tab 键只在 Modal 内循环，符合 WAI-ARIA 无障碍规范。
- \`returnFocus\`：关闭后焦点回到打开 Modal 的那个按钮——盲人用户不用重新找位置。

---

## 八、实战：确认删除对话框

把前面学的全用上，做一个可复用的确认对话框：

\`\`\`jsx
'use client';
import { Modal, Button, Group, Text, ThemeIcon, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconTrash, IconAlertTriangle } from '@tabler/icons-react';
import { useState } from 'react';

// 可复用的确认删除组件
export function ConfirmDeleteModal({ opened, onClose, onConfirm, itemName }) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      // 小尺寸对话框，适合简单确认
      size="sm"
      // 居中显示，焦点明显
      centered
      // 关掉 ESC 和遮罩关闭，强制用户明确点按钮
      closeOnClickOutside={false}
      closeOnEscape={false}
      // 隐藏默认关闭按钮，避免误触
      withCloseButton={false}
      transitionProps={{ transition: 'pop', duration: 200 }}
    >
      <Stack align="center" gap="md" py="sm">
        <ThemeIcon color="red" variant="light" size="xl" radius="xl">
          <IconAlertTriangle size={28} />
        </ThemeIcon>

        <Stack gap="xs" align="center">
          <Text fw={600} size="lg">确认删除？</Text>
          <Text size="sm" c="dimmed" ta="center">
            将永久删除「{itemName}」，此操作不可恢复
          </Text>
        </Stack>

        <Group w="100%" grow>
          <Button variant="default" onClick={onClose}>
            取消
          </Button>
          <Button
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            删除
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

// 使用示例
export default function Demo() {
  const [opened, { open, close }] = useDisclosure(false);
  const [count, setCount] = useState(3);

  return (
    <>
      <Button color="red" variant="light" leftSection={<IconTrash size={16} />} onClick={open}>
        删除项目
      </Button>

      <ConfirmDeleteModal
        opened={opened}
        onClose={close}
        itemName={\`项目 #\${count}\`}
        onConfirm={() => setCount((c) => c - 1)}
      />
    </>
  );
}
\`\`\`

---

## 小结

| prop | 作用 | 默认值 |
| --- | --- | --- |
| opened / onClose | 受控开关 | - |
| title | 标题 | - |
| size | 宽度 | md |
| centered | 垂直居中 | false |
| radius | 圆角 | 主题默认 |
| withCloseButton | 显示关闭按钮 | true |
| closeOnClickOutside | 点遮罩关闭 | true |
| closeOnEscape | ESC 关闭 | true |
| fullScreen | 全屏 | false |
| trapFocus | 焦点陷阱 | true |
| returnFocus | 焦点回退 | true |
| transitionProps | 过渡动画 | { transition: 'pop' } |

下一章我们学 \`Drawer\`——和 Modal 类似但更适合侧滑场景的覆盖层。`,
  },

  // ============================================================
  // 第二十九章 Drawer 抽屉
  // ============================================================
  {
    id: 'mantine2-ch29',
    group: '第七部分 反馈与覆盖层',
    icon: '🗄️',
    title: '第二十九章 Drawer 抽屉',
    content: `## 一句话目标

学会用 \`Drawer\` 抽屉组件——从屏幕四边滑入的覆盖层，常用于筛选、详情、移动端菜单，掌握与 \`Modal\` 的选型差异。

---

## 一、Drawer 最小用法

Drawer 和 Modal API 几乎一样，区别是从侧边滑入：

\`\`\`jsx
'use client';
import { Drawer, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export default function Demo() {
  // useDisclosure 同样适合 Drawer
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button onClick={open}>打开抽屉</Button>

      {/* Drawer：API 与 Modal 一致
          - opened / onClose：受控开关
          - title：标题栏
          - position：默认 "left"，从左侧滑入 */}
      <Drawer opened={opened} onClose={close} title="侧边菜单">
        <p>从左侧滑入的抽屉</p>
      </Drawer>
    </>
  );
}
\`\`\`

> ⭐ \`Drawer\` 与 \`Modal\` 几乎所有 props 都通用：\`size\`、\`radius\`、\`withCloseButton\`、\`closeOnClickOutside\`、\`closeOnEscape\`、\`transitionProps\`、\`trapFocus\` 等。区别只在 \`position\` 和滑入方向。

---

## 二、四个方向：position

Drawer 可以从屏幕四边滑入：

\`\`\`jsx
'use client';
import { Drawer, Button, Group, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export default function Demo() {
  // 用一个对象保存四个方向的开关，复用同一组件
  const [leftOpened, { open: openLeft, close: closeLeft }] = useDisclosure(false);
  const [rightOpened, { open: openRight, close: closeRight }] = useDisclosure(false);
  const [topOpened, { open: openTop, close: closeTop }] = useDisclosure(false);
  const [bottomOpened, { open: openBottom, close: closeBottom }] = useDisclosure(false);

  return (
    <>
      <Group>
        <Button onClick={openLeft}>左侧</Button>
        <Button onClick={openRight}>右侧</Button>
        <Button onClick={openTop}>顶部</Button>
        <Button onClick={openBottom}>底部</Button>
      </Group>

      {/* position="left"：从左滑入（默认）
          适合：导航菜单、侧边操作面板 */}
      <Drawer opened={leftOpened} onClose={closeLeft} title="左侧菜单" position="left">
        <p>左侧抽屉</p>
      </Drawer>

      {/* position="right"：从右滑入
          适合：筛选、详情、设置面板（最常用） */}
      <Drawer opened={rightOpened} onClose={closeRight} title="筛选条件" position="right">
        <p>右侧抽屉</p>
      </Drawer>

      {/* position="top"：从顶部滑入
          适合：搜索框、消息通知 */}
      <Drawer opened={topOpened} onClose={closeTop} title="搜索" position="top">
        <p>顶部抽屉</p>
      </Drawer>

      {/* position="bottom"：从底部滑入
          适合：移动端操作菜单、底部弹起 */}
      <Drawer opened={bottomOpened} onClose={closeBottom} title="操作" position="bottom">
        <p>底部抽屉</p>
      </Drawer>
    </>
  );
}
\`\`\`

**position 选型建议：**

| position | 典型场景 |
| --- | --- |
| left | 移动端导航菜单 |
| right | 筛选、详情、设置（最常用，符合从右滑出的操作习惯） |
| top | 全局搜索、消息中心 |
| bottom | 移动端 ActionSheet、底部操作菜单 |

---

## 三、尺寸、偏移、圆角

\`\`\`jsx
'use client';
import { Drawer, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export default function Demo() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button onClick={open}>打开宽抽屉</Button>

      <Drawer
        opened={opened}
        onClose={close}
        title="详情面板"
        position="right"
        // size：抽屉宽度（左右方向）或高度（上下方向）
        // 可以是预设或具体值：30%、400px、50vw 等
        size="40%"
        // offset：抽屉与屏幕边的距离
        // 默认 0（贴边），设 32px 会留出空隙，看到背后的页面
        offset={32}
        // radius：圆角，配合 offset 用最好看
        radius="md"
      >
        <p>带偏移和圆角的浮起抽屉，看起来像卡片</p>
      </Drawer>
    </>
  );
}
\`\`\`

> ⭐ \`offset\` + \`radius\` 组合，可以让 Drawer 看起来像一张浮起的卡片，比贴边更有现代感。

---

## 四、交互行为（与 Modal 一致）

\`\`\`jsx
'use client';
import { Drawer, Button, Stack, TextInput, Select } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export default function Demo() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button onClick={open}>筛选</Button>

      <Drawer
        opened={opened}
        onClose={close}
        title="高级筛选"
        position="right"
        size="md"
        // withCloseButton：是否显示右上角关闭按钮
        withCloseButton
        // closeOnClickOutside：点遮罩关闭
        closeOnClickOutside
        // closeOnEscape：ESC 关闭
        closeOnEscape
        // lockScroll：打开时锁定页面滚动（默认 true）
        // 避免背景页面跟着滚动造成视觉错乱
        lockScroll
        // transitionProps：滑入动画
        transitionProps={{ transition: 'slide-left', duration: 300 }}
      >
        <Stack gap="md">
          <TextInput label="关键词" placeholder="搜索关键词" />
          <Select
            label="状态"
            placeholder="选择状态"
            data={[
              { value: 'active', label: '启用' },
              { value: 'inactive', label: '禁用' },
            ]}
          />
          <Button onClick={close}>应用筛选</Button>
        </Stack>
      </Drawer>
    </>
  );
}
\`\`\`

---

## 五、Drawer 子组件

和 \`Modal\` 一样，\`Drawer\` 也提供 \`Drawer.Header\` / \`Drawer.Title\` / \`Drawer.Body\` / \`Drawer.CloseButton\`：

\`\`\`jsx
'use client';
import { Drawer, Button, Group, Text, ThemeIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconFilter } from '@tabler/icons-react';

export default function Demo() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button onClick={open}>打开自定义 Drawer</Button>

      <Drawer opened={opened} onClose={close} position="right" size="md">
        {/* Drawer.Header：标题栏 */}
        <Drawer.Header>
          <Group gap="sm">
            <ThemeIcon variant="light">
              <IconFilter size={16} />
            </ThemeIcon>
            {/* Drawer.Title：标题 */}
            <Drawer.Title>筛选与排序</Drawer.Title>
          </Group>
          {/* Drawer.CloseButton：自动绑定 onClose 的关闭按钮 */}
          <Drawer.CloseButton />
        </Drawer.Header>

        {/* Drawer.Body：内容区，自动加 padding */}
        <Drawer.Body>
          <Text c="dimmed" size="sm">在这里放置筛选表单</Text>
        </Drawer.Body>
      </Drawer>
    </>
  );
}
\`\`\`

---

## 六、Modal 还是 Drawer？

两者覆盖层场景，选型参考：

| 维度 | Modal | Drawer |
| --- | --- | --- |
| 内容形态 | 短表单、确认提示、详情弹窗 | 长表单、筛选、侧边导航 |
| 视觉焦点 | 居中聚焦，强制中断 | 侧边滑出，可看背景 |
| 移动端 | 不太合适（容易顶满屏） | 非常合适（贴合原生交互） |
| 关闭速度 | 居中点击更直观 | 边缘滑动手势更自然 |
| 多步骤 | 适合短流程 | 适合长流程（可滚动） |

**经验法则：**
- 「需要用户立刻决策」→ Modal（确认删除、警告）
- 「需要用户输入较多信息」→ Drawer（筛选、详情编辑）
- 「移动端」→ 优先 Drawer，体验更贴近原生 App

---

## 七、实战：侧边筛选抽屉

模拟电商列表的筛选场景，做一个完整的筛选抽屉：

\`\`\`jsx
'use client';
import { useState } from 'react';
import {
  Drawer, Button, Stack, Text, Group, Slider, Checkbox, Divider, ActionIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconFilter, IconX } from '@tabler/icons-react';

export default function ProductFilter() {
  const [opened, { open, close }] = useDisclosure(false);

  // 筛选状态：价格区间、品类、是否包邮
  const [priceRange, setPriceRange] = useState(50);
  const [categories, setCategories] = useState(['electronics']);
  const [freeShipping, setFreeShipping] = useState(false);

  // 重置所有筛选
  const resetFilters = () => {
    setPriceRange(50);
    setCategories(['electronics']);
    setFreeShipping(false);
  };

  return (
    <>
      <Button
        variant="light"
        leftSection={<IconFilter size={16} />}
        onClick={open}
      >
        筛选
      </Button>

      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        size="380px"
        title="筛选条件"
        // 锁定背景滚动，体验更佳
        lockScroll
        // 过渡动画用 slide-left 配合 right 方向
        transitionProps={{ transition: 'slide-left', duration: 280 }}
      >
        <Stack gap="xl">
          {/* 1. 价格区间 */}
          <Stack gap="xs">
            <Text fw={500} size="sm">最高价格：¥{priceRange}</Text>
            <Slider
              value={priceRange}
              onChange={setPriceRange}
              min={0}
              max={1000}
              step={10}
              // 显示当前值的标签
              label={(val) => \`¥\${val}\`}
            />
          </Stack>

          <Divider />

          {/* 2. 品类多选 */}
          <Stack gap="xs">
            <Text fw={500} size="sm">品类</Text>
            <Checkbox.Group value={categories} onChange={setCategories}>
              <Stack gap="xs">
                <Checkbox value="electronics" label="电子产品" />
                <Checkbox value="clothing" label="服装" />
                <Checkbox value="books" label="图书" />
                <Checkbox value="food" label="食品" />
              </Stack>
            </Checkbox.Group>
          </Stack>

          <Divider />

          {/* 3. 包邮选项 */}
          <Checkbox
            checked={freeShipping}
            onChange={(e) => setFreeShipping(e.currentTarget.checked)}
            label="仅显示包邮商品"
          />

          {/* 底部操作按钮 */}
          <Group justify="space-between" mt="md">
            <Button variant="subtle" color="gray" onClick={resetFilters}>
              重置
            </Button>
            <Button onClick={close}>应用筛选</Button>
          </Group>
        </Stack>
      </Drawer>
    </>
  );
}
\`\`\`

---

## 小结

| prop | 作用 | 默认值 |
| --- | --- | --- |
| opened / onClose | 受控开关 | - |
| title | 标题 | - |
| position | 滑入方向 | left |
| size | 宽度/高度 | md |
| offset | 与屏幕边的距离 | 0 |
| radius | 圆角 | 主题默认 |
| withCloseButton | 显示关闭按钮 | true |
| closeOnClickOutside | 点遮罩关闭 | true |
| closeOnEscape | ESC 关闭 | true |
| lockScroll | 锁定背景滚动 | true |
| transitionProps | 过渡动画 | 跟随 position |

下一章我们学 \`Popover\` / \`Tooltip\` / \`HoverCard\`——三种悬浮卡片组件。`,
  },

  // ============================================================
  // 第三十章 Popover/Tooltip/HoverCard 悬浮卡片
  // ============================================================
  {
    id: 'mantine2-ch30',
    group: '第七部分 反馈与覆盖层',
    icon: '💬',
    title: '第三十章 Popover/Tooltip/HoverCard 悬浮卡片',
    content: `## 一句话目标

掌握三种悬浮卡片组件的差异与用法——\`Popover\`（点击触发，内容丰富）、\`Tooltip\`（hover 触发，纯文字提示）、\`HoverCard\`（hover 触发，可放复杂内容），并完成用户名片和操作提示实战。

---

## 一、三者的本质区别

| 组件 | 触发方式 | 内容复杂度 | 典型场景 |
| --- | --- | --- | --- |
| Popover | 点击 | 复杂（表单、菜单） | 颜色选择器、操作菜单 |
| Tooltip | hover / focus | 极简（一行文字 / 图标） | 按钮用途提示、图标说明 |
| HoverCard | hover | 复杂（卡片、链接） | 用户名片、链接预览 |

> ⭐ **口诀**：Popover 是「点开菜单」，Tooltip 是「hover 看提示」，HoverCard 是「hover 看详情」。

---

## 二、Popover 基础

Popover 用 \`Popover.Target\` 包触发元素，\`Popover.Dropdown\` 放浮层内容：

\`\`\`jsx
'use client';
import { Popover, Button, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export default function Demo() {
  const [opened, { toggle, close }] = useDisclosure(false);

  return (
    // width：浮层宽度，可以是数字（px）或字符串
    <Popover opened={opened} onChange={toggle} width={300} position="bottom">
      {/* Popover.Target：触发元素，必须是单根节点 */}
      <Popover.Target>
        <Button onClick={toggle}>点击打开</Button>
      </Popover.Target>

      {/* Popover.Dropdown：浮层内容
          自动定位、自动避让屏幕边缘 */}
      <Popover.Dropdown>
        <Stack>
          <Text fw={500}>这是一个 Popover</Text>
          <Text size="sm" c="dimmed">
            点击外部区域会自动关闭
          </Text>
          <Button variant="light" size="xs" onClick={close}>
            关闭
          </Button>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
\`\`\`

> ⭐ \`Popover.Target\` 包裹的元素**必须能接收 ref**（普通 div、button 都行，自定义组件需要 forwardRef）。

---

## 三、Popover 的 position 与 withArrow

\`\`\`jsx
'use client';
import { Popover, Button, Group, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export default function Demo() {
  const [opened, { toggle }] = useDisclosure(false);

  return (
    <Popover
      opened={opened}
      onChange={toggle}
      // position：浮层相对触发元素的位置
      // 可选：top/bottom/left/right 加 -start/-end 变体
      // 比如 top-start、bottom-end
      position="right"
      // withArrow：显示小箭头，指向触发元素
      withArrow
      // arrowOffset：箭头偏移（像素）
      arrowOffset={20}
      // closeOnClickOutside：点外部关闭（默认 true）
      closeOnClickOutside
      // trapFocus：焦点陷阱，适合放表单
      trapFocus
    >
      <Popover.Target>
        <Button onClick={toggle}>右侧弹出</Button>
      </Popover.Target>

      <Popover.Dropdown>
        <Text>带箭头，从右侧弹出</Text>
      </Popover.Dropdown>
    </Popover>
  );
}
\`\`\`

**12 种 position：**

\`top\` / \`top-start\` / \`top-end\` / \`bottom\` / \`bottom-start\` / \`bottom-end\` / \`left\` / \`left-start\` / \`left-end\` / \`right\` / \`right-start\` / \`right-end\`

---

## 四、Popover 实战：颜色选择器

\`\`\`jsx
'use client';
import { Popover, ActionIcon, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

const COLORS = ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'indigo', 'violet', 'grape'];

export default function ColorPicker({ value, onChange }) {
  const [opened, { close, toggle }] = useDisclosure(false);

  return (
    <Popover opened={opened} onClose={close} position="bottom" withArrow>
      <Popover.Target>
        {/* 当前选中的颜色作为触发按钮 */}
        <ActionIcon
          color={value}
          variant="filled"
          size="lg"
          onClick={toggle}
          aria-label="选择颜色"
        />
      </Popover.Target>

      <Popover.Dropdown>
        <Group gap="xs">
          {COLORS.map((color) => (
            <ActionIcon
              key={color}
              color={color}
              variant={value === color ? 'filled' : 'light'}
              size="md"
              onClick={() => {
                onChange(color);
                close();
              }}
            />
          ))}
        </Group>
      </Popover.Dropdown>
    </Popover>
  );
}
\`\`\`

---

## 五、Tooltip：超轻量提示

Tooltip 用于给按钮 / 图标加一行说明，**不支持复杂内容**：

\`\`\`jsx
'use client';
import { Tooltip, Button, ActionIcon, Group } from '@mantine/core';
import { IconHeart, IconBookmark, IconShare } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Group>
      {/* label：提示文字 */}
      <Tooltip label="收藏到喜欢的列表">
        <ActionIcon variant="light" color="red" size="lg">
          <IconHeart size={18} />
        </ActionIcon>
      </Tooltip>

      {/* position：方向，可选 12 种（同 Popover） */}
      <Tooltip label="保存为草稿" position="right">
        <ActionIcon variant="light" size="lg">
          <IconBookmark size={18} />
        </ActionIcon>
      </Tooltip>

      {/* withArrow：显示小箭头 */}
      <Tooltip label="分享给朋友" position="bottom" withArrow>
        <ActionIcon variant="light" color="blue" size="lg">
          <IconShare size={18} />
        </ActionIcon>
      </Tooltip>

      {/* color：颜色（默认跟随主题灰） */}
      <Tooltip label="这是红色提示" color="red">
        <Button variant="default">悬停看看</Button>
      </Tooltip>

      {/* offset：与触发元素的间距（像素） */}
      <Tooltip label="离我远一点" position="bottom" offset={16}>
        <Button variant="default">远距离</Button>
      </Tooltip>

      {/* delay：延迟显示（毫秒）
          避免鼠标滑过时频繁闪烁 */}
      <Tooltip label="停留 500ms 才显示" delay={500}>
        <Button variant="default">慢一点</Button>
      </Tooltip>
    </Group>
  );
}
\`\`\`

> ⭐ Tooltip 默认 hover / focus 都会触发——所以**键盘 Tab 也能看到提示**，自动符合无障碍要求。

---

## 六、Tooltip.Floating：智能定位

普通 Tooltip 位置固定，靠近屏幕边缘可能被裁切。\`Tooltip.Floating\` 会跟随鼠标位置：

\`\`\`jsx
'use client';
import { Tooltip, Text } from '@mantine/core';

export default function Demo() {
  return (
    // Tooltip.Floating：跟随鼠标位置浮动
    // 适合大区域内的提示，鼠标在哪提示在哪
    <Tooltip.Floating label="点击查看详情">
      <Text
        c="blue"
        style={{ cursor: 'pointer', display: 'inline-block', padding: '40px' }}
      >
        把鼠标在这个区域里移动，Tooltip 会跟着鼠标
      </Text>
    </Tooltip.Floating>
  );
}
\`\`\`

---

## 七、Tooltip.Group：批量管理

多个 Tooltip 一起时，可以用 \`Tooltip.Group\` 让它们互斥（一个显示时其他关闭）：

\`\`\`jsx
'use client';
import { Tooltip, ActionIcon, Group } from '@mantine/core';
import { IconEdit, IconCopy, IconTrash } from '@tabler/icons-react';

export default function Demo() {
  return (
    // Tooltip.Group：组内 Tooltip 互斥
    // 鼠标移到第二个，第一个会立即关闭
    <Tooltip.Group>
      <Group>
        <Tooltip label="编辑">
          <ActionIcon variant="light"><IconEdit size={16} /></ActionIcon>
        </Tooltip>
        <Tooltip label="复制">
          <ActionIcon variant="light"><IconCopy size={16} /></ActionIcon>
        </Tooltip>
        <Tooltip label="删除">
          <ActionIcon variant="light" color="red"><IconTrash size={16} /></ActionIcon>
        </Tooltip>
      </Group>
    </Tooltip.Group>
  );
}
\`\`\`

---

## 八、HoverCard：hover 触发的卡片

\`HoverCard\` 和 \`Popover\` API 类似，但**触发方式是 hover**，常用于用户名片、链接预览：

\`\`\`jsx
'use client';
import {
  HoverCard, Group, Avatar, Text, Button, Stack, ThemeIcon,
} from '@mantine/core';
import { IconBrandGithub, IconMail } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Group>
      <HoverCard width={320} shadow="md" withArrow position="bottom">
        {/* HoverCard.Target：触发元素，通常是链接或头像 */}
        <HoverCard.Target>
          <Avatar
            src="https://avatars.githubusercontent.com/u/1?v=4"
            radius="xl"
            size="lg"
            style={{ cursor: 'pointer' }}
          />
        </HoverCard.Target>

        {/* HoverCard.Dropdown：浮层内容，可以放任意复杂结构 */}
        <HoverCard.Dropdown>
          <Group gap="sm" align="flex-start">
            <Avatar
              src="https://avatars.githubusercontent.com/u/1?v=4"
              radius="xl"
              size="md"
            />
            <Stack gap={2}>
              <Text size="sm" fw={700}>torvalds</Text>
              <Text size="xs" c="dimmed">Linux Foundation</Text>
            </Stack>
          </Group>

          <Text size="sm" mt="md">
            Linux kernel 之父，开源运动的标志性人物。
          </Text>

          <Group gap="xs" mt="md">
            <ThemeIcon variant="light" size="sm">
              <IconBrandGithub size={14} />
            </ThemeIcon>
            <ThemeIcon variant="light" size="sm">
              <IconMail size={14} />
            </ThemeIcon>
            <Button size="xs" variant="default" ml="auto">关注</Button>
          </Group>
        </HoverCard.Dropdown>
      </HoverCard>
    </Group>
  );
}
\`\`\`

**HoverCard 与 Popover 的区别：**

| 维度 | HoverCard | Popover |
| --- | --- | --- |
| 触发方式 | hover（鼠标悬停） | click（点击） |
| 关闭方式 | 鼠标移出 | 点遮罩 / ESC / 按钮 |
| 焦点陷阱 | 无（不抢焦点） | 有 |
| 适合场景 | 浏览型（看名片） | 交互型（填表单） |

> ⭐ **不要用 HoverCard 放交互表单**——用户鼠标一动它就关了。交互内容用 Popover。

---

## 九、HoverCard 的延迟控制

\`\`\`jsx
'use client';
import { HoverCard, Avatar, Text } from '@mantine/core';

export default function Demo() {
  return (
    <HoverCard
      width={280}
      shadow="sm"
      // openDelay：鼠标悬停多久后打开（毫秒）
      // 设大一点避免鼠标划过误触
      openDelay={300}
      // closeDelay：鼠标移出多久后关闭（毫秒）
      // 设大一点允许用户短暂移出再回来（比如想去点浮层内按钮）
      closeDelay={200}
    >
      <HoverCard.Target>
        <Avatar radius="xl" style={{ cursor: 'pointer' }}>ZS</Avatar>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Text size="sm">悬停 300ms 才显示，移出 200ms 后才关闭</Text>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
\`\`\`

---

## 十、实战：操作提示 + 用户名片

把 Tooltip 和 HoverCard 组合起来：

\`\`\`jsx
'use client';
import {
  HoverCard, Tooltip, Group, Avatar, Text, Stack, Badge, Divider, Button,
} from '@mantine/core';
import { IconEdit, IconEye, IconCopy } from '@tabler/icons-react';

export default function UserCard({ user }) {
  return (
    <Group>
      {/* 1. HoverCard：鼠标悬停头像显示完整名片 */}
      <HoverCard width={320} shadow="md" withArrow openDelay={200} closeDelay={150}>
        <HoverCard.Target>
          <Avatar src={user.avatar} radius="xl" style={{ cursor: 'pointer' }} />
        </HoverCard.Target>

        <HoverCard.Dropdown>
          <Stack gap="xs">
            <Group gap="sm">
              <Avatar src={user.avatar} radius="xl" size="md" />
              <Stack gap={2}>
                <Text size="sm" fw={700}>{user.name}</Text>
                <Text size="xs" c="dimmed">@{user.username}</Text>
              </Stack>
              <Badge size="sm" color="blue" variant="light" ml="auto">
                {user.role}
              </Badge>
            </Group>

            <Divider />

            <Text size="sm" c="dimmed">{user.bio}</Text>

            <Group gap="xs" mt="xs">
              <Text size="xs" c="dimmed">{user.followers} 关注者</Text>
              <Text size="xs" c="dimmed">·</Text>
              <Text size="xs" c="dimmed">{user.following} 关注中</Text>
            </Group>
          </Stack>
        </HoverCard.Dropdown>
      </HoverCard>

      {/* 2. Tooltip：每个操作按钮都加提示 */}
      <Tooltip.Group>
        <Group>
          <Tooltip label="编辑用户">
            <Button variant="light" size="xs" leftSection={<IconEdit size={14} />}>
              编辑
            </Button>
          </Tooltip>

          <Tooltip label="查看详情" position="bottom">
            <Button variant="subtle" size="xs" leftSection={<IconEye size={14} />}>
              查看
            </Button>
          </Tooltip>

          <Tooltip label="复制用户名" color="gray">
            <Button variant="subtle" size="xs" leftSection={<IconCopy size={14} />}>
              复制
            </Button>
          </Tooltip>
        </Group>
      </Tooltip.Group>
    </Group>
  );
}
\`\`\`

---

## 小结

| 组件 | 触发 | 内容 | 核心 API |
| --- | --- | --- | --- |
| Popover | 点击 | 复杂 | Target / Dropdown / position / withArrow |
| Tooltip | hover + focus | 一行字 | label / position / delay / offset |
| Tooltip.Floating | hover | 一行字 | 跟随鼠标 |
| Tooltip.Group | hover | 一行字 | 互斥显示 |
| HoverCard | hover | 复杂卡片 | Target / Dropdown / openDelay / closeDelay |

下一章学 \`Alert\` 与 \`Notification\`——两种主动给用户反馈的方式。`,
  },

  // ============================================================
  // 第三十一章 Alert 警告与 Notification 通知
  // ============================================================
  {
    id: 'mantine2-ch31',
    group: '第七部分 反馈与覆盖层',
    icon: '📢',
    title: '第三十一章 Alert 警告与 Notification 通知',
    content: `## 一句话目标

学会两种主动反馈用户的方式——\`Alert\`（页面内的警告条，常驻或可关闭）和 \`Notification\`（全局浮起通知，自动消失），并完成表单提交反馈实战。

---

## 一、Alert 基础

Alert 是页面内的警告框，常用于表单顶部提示、错误信息、公告：

\`\`\`jsx
import { Alert, Stack } from '@mantine/core';
// 图标建议用 tabler-icons
import { IconInfoCircle, IconAlertTriangle, IconCircleCheck, IconX } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Stack>
      {/* 1. 默认 Alert：light 变体 + 跟随主题色 */}
      <Alert
        // title：标题，自动加粗
        title="提示"
        // color：颜色，影响边框、背景、图标
        color="blue"
        // icon：左侧图标，建议尺寸 16-20px
        icon={<IconInfoCircle size={18} />}
      >
        这是一条普通提示，用于告知用户一些信息
      </Alert>

      {/* 2. 警告色 */}
      <Alert title="警告" color="yellow" icon={<IconAlertTriangle size={18} />}>
        操作不可逆，请谨慎
      </Alert>

      {/* 3. 成功色 */}
      <Alert title="成功" color="green" icon={<IconCircleCheck size={18} />}>
        保存成功
      </Alert>

      {/* 4. 错误色 */}
      <Alert title="错误" color="red" icon={<IconX size={18} />}>
        提交失败，请重试
      </Alert>
    </Stack>
  );
}
\`\`\`

> ⭐ \`Alert\` 是**内联组件**（占用页面流式布局），不是浮层——所以适合需要用户**持续看到**的提示。

---

## 二、Alert 的 variant

\`\`\`jsx
import { Alert, Stack } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Stack>
      {/* variant="light"：浅色背景（默认）
          适合：常规提示，不抢眼 */}
      <Alert variant="light" color="blue" title="light 变体" icon={<IconBell size={18} />}>
        浅色背景 + 主色文字
      </Alert>

      {/* variant="filled"：实心背景
          适合：强提醒，背景反差大 */}
      <Alert variant="filled" color="blue" title="filled 变体" icon={<IconBell size={18} />}>
        实心背景 + 白色文字
      </Alert>

      {/* variant="outline"：描边
          适合：融入背景的轻提示 */}
      <Alert variant="outline" color="blue" title="outline 变体" icon={<IconBell size={18} />}>
        透明背景 + 主色边框
      </Alert>

      {/* variant="default"：灰色描边
          适合：不强调颜色的中性提示 */}
      <Alert variant="default" color="blue" title="default 变体" icon={<IconBell size={18} />}>
        灰色描边 + 中性背景
      </Alert>
    </Stack>
  );
}
\`\`\`

---

## 三、可关闭的 Alert

\`\`\`jsx
'use client';
import { Alert, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconInfoCircle } from '@tabler/icons-react';

export default function Demo() {
  const [opened, { close, open }] = useDisclosure(true);

  if (!opened) {
    return <Button variant="subtle" size="xs" onClick={open}>显示公告</Button>;
  }

  return (
    <Alert
      icon={<IconInfoCircle size={18} />}
      title="系统公告"
      color="blue"
      variant="light"
      // withCloseButton：显示右侧关闭按钮
      withCloseButton
      // onClose：点关闭按钮触发的回调
      onClose={close}
    >
      系统将于今晚 22:00 进行维护，预计耗时 30 分钟
    </Alert>
  );
}
\`\`\`

> ⭐ 想做"关闭后不再显示"的公告？配合 \`localStorage\` 持久化 \`opened\` 状态即可。

---

## 四、Alert 的 title 与 children

\`title\` 不是必须的，纯文字提示可以省略：

\`\`\`jsx
import { Alert, Stack } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Stack>
      {/* 有 title：突出主题，children 是详细说明 */}
      <Alert title="保存失败" color="red" icon={<IconInfoCircle size={18} />}>
        <p>网络连接超时，请检查网络后重试</p>
        <p>错误码：TIMEOUT_5000</p>
      </Alert>

      {/* 无 title：纯简短提示 */}
      <Alert color="blue" icon={<IconInfoCircle size={18} />}>
        新版本已发布，刷新页面查看
      </Alert>

      {/* children 可以是任意结构 */}
      <Alert color="yellow" icon={<IconInfoCircle size={18} />} title="待办提醒">
        <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
          <li>审核 3 个待处理订单</li>
          <li>回复 2 条客户消息</li>
        </ul>
      </Alert>
    </Stack>
  );
}
\`\`\`

---

## 五、Notification 通知：全局浮起

\`Notification\` 是浮在屏幕角落的通知，自动消失——需要 \`@mantine/notifications\` 包。

**安装：**

\`\`\`bash
npm install @mantine/notifications
\`\`\`

**1. 引入样式 + Provider：**

\`\`\`jsx
// app/layout.js
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <head><ColorSchemeScript /></head>
      <body>
        <MantineProvider>
          {/* Notifications：通知容器，放在 MantineProvider 内
              position：通知出现的位置 */}
          <Notifications position="top-right" />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
\`\`\`

**2. 调用 \`notifications.show\`：**

\`\`\`jsx
'use client';
import { Button, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconInfoCircle } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Group>
      {/* 1. 成功通知 */}
      <Button
        color="green"
        onClick={() =>
          notifications.show({
            // title：标题（可选）
            title: '保存成功',
            // message：正文
            message: '您的修改已保存到云端',
            // color：主题色
            color: 'green',
            // icon：左侧图标
            icon: <IconCheck size={18} />,
            // autoClose：自动关闭时长（毫秒）
            // false = 不自动关闭，必须手动点
            autoClose: 3000,
          })
        }
      >
        成功
      </Button>

      {/* 2. 错误通知：不自动关闭 */}
      <Button
        color="red"
        onClick={() =>
          notifications.show({
            title: '提交失败',
            message: '网络异常，请重试',
            color: 'red',
            icon: <IconX size={18} />,
            // 错误通知建议不自动关闭，强制用户看到
            autoClose: false,
          })
        }
      >
        失败
      </Button>

      {/* 3. 信息通知 */}
      <Button
        color="blue"
        onClick={() =>
          notifications.show({
            title: '新消息',
            message: '您有 1 条未读消息',
            color: 'blue',
            icon: <IconInfoCircle size={18} />,
            autoClose: 5000,
          })
        }
      >
        信息
      </Button>
    </Group>
  );
}
\`\`\`

> ⭐ \`notifications.show\` 可以在任意地方调用——组件内、回调里、甚至 axios 拦截器里。

---

## 六、notifications 的位置

\`Notifications\` 组件的 \`position\` 控制所有通知出现的位置：

\`\`\`jsx
import { Notifications } from '@mantine/notifications';

// 8 个可选位置：
// top-left / top-center / top-right
// bottom-left / bottom-center / bottom-right
<Notifications position="top-right" />
\`\`\`

| 位置 | 适合场景 |
| --- | --- |
| top-right | 最常见，不打扰主要内容 |
| top-center | 强提醒，比如登录成功 |
| bottom-right | 移动端常见，离拇指近 |
| bottom-center | 移动端 toast 风格 |

---

## 七、更新与清理通知

异步操作完成时，需要更新已有通知的状态：

\`\`\`jsx
'use client';
import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconLoader, IconCheck } from '@tabler/icons-react';

export default function Demo() {
  const handleAsync = async () => {
    // 1. 先显示一个 loading 通知，拿到 id
    const id = notifications.show({
      title: '上传中',
      message: '正在上传文件……',
      color: 'blue',
      icon: <IconLoader size={18} />,
      // loading 通知不能自动关闭
      autoClose: false,
      // withCloseButton：是否显示关闭按钮
      withCloseButton: false,
    });

    try {
      // 模拟异步上传
      await new Promise((r) => setTimeout(r, 2000));

      // 2. 上传成功：用 update 更新同一条通知
      notifications.update({
        id,  // 必须传 id，告诉它更新哪条
        title: '上传成功',
        message: '文件已保存',
        color: 'green',
        icon: <IconCheck size={18} />,
        autoClose: 2000,
      });
    } catch (err) {
      // 3. 失败：更新为错误状态
      notifications.update({
        id,
        title: '上传失败',
        message: err.message,
        color: 'red',
        autoClose: 5000,
      });
    }
  };

  return <Button onClick={handleAsync}>上传文件</Button>;
}
\`\`\`

**其他清理 API：**

\`\`\`jsx
import { notifications } from '@mantine/notifications';

// 清理所有通知
notifications.clean();

// 清理并立即触发关闭动画（更柔和）
notifications.cleanQueue();

// 隐藏单条通知（按 id）
notifications.hide(id);
\`\`\`

---

## 八、Alert vs Notification 选型

| 维度 | Alert | Notification |
| --- | --- | --- |
| 位置 | 页面流式布局 | 屏幕角落浮层 |
| 持续 | 常驻直到关闭 | 自动消失（可设不消失） |
| 范围 | 局部上下文（如表单顶部） | 全局 |
| 用法 | 渲染组件 | 命令式调用 |
| 典型 | 表单校验错误、公告 | 操作成功提示、新消息提醒 |

**经验法则：**
- 信息和**当前页面内容强相关**（比如表单错误）→ Alert
- 信息是**操作反馈**（保存成功、登录失败）→ Notification

---

## 九、实战：表单提交反馈

把 Alert 和 Notification 组合，做一个完整的提交反馈流程：

\`\`\`jsx
'use client';
import { useState } from 'react';
import { Stack, TextInput, Button, Alert, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react';

export default function FeedbackForm() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');  // Alert 错误提示
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. 客户端校验：用 Alert 显示
    if (!name.trim()) {
      setError('请填写姓名');
      return;
    }
    if (message.trim().length < 10) {
      setError('反馈内容至少 10 个字符');
      return;
    }
    setError('');

    setSubmitting(true);

    // 2. 显示 loading 通知
    const id = notifications.show({
      title: '提交中',
      message: '正在发送您的反馈……',
      color: 'blue',
      icon: <IconInfoCircle size={18} />,
      autoClose: false,
      withCloseButton: false,
    });

    try {
      // 模拟 API 调用
      await new Promise((r) => setTimeout(r, 1500));

      // 3. 成功：更新通知 + 清空表单
      notifications.update({
        id,
        title: '提交成功',
        message: '感谢您的反馈，我们会尽快处理',
        color: 'green',
        icon: <IconCheck size={18} />,
        autoClose: 3000,
      });

      setName('');
      setMessage('');
    } catch (err) {
      // 4. 失败：更新通知为错误
      notifications.update({
        id,
        title: '提交失败',
        message: '网络异常，请稍后重试',
        color: 'red',
        icon: <IconAlertTriangle size={18} />,
        autoClose: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
      <Stack>
        {/* Alert：常驻校验错误提示 */}
        {error && (
          <Alert
            color="red"
            variant="light"
            icon={<IconAlertTriangle size={18} />}
            title="提交失败"
            withCloseButton
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        <TextInput
          label="姓名"
          placeholder="请输入您的姓名"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />

        <Textarea
          label="反馈内容"
          placeholder="请输入至少 10 个字符"
          value={message}
          onChange={(e) => setMessage(e.currentTarget.value)}
          autosize
          minRows={3}
        />

        <Button type="submit" loading={submitting}>
          提交反馈
        </Button>
      </Stack>
    </form>
  );
}
\`\`\`

---

## 小结

| API | 作用 |
| --- | --- |
| \`Alert\` | 页面内警告框 |
| \`Alert\` variant | light / filled / outline / default |
| \`Alert\` withCloseButton + onClose | 可关闭 |
| \`notifications.show\` | 显示通知 |
| \`notifications.update\` | 更新通知（按 id） |
| \`notifications.clean\` | 清理所有通知 |
| \`notifications.hide\` | 隐藏单条通知 |
| \`<Notifications position="..." />\` | 全局容器 |

下一章学加载反馈组件——\`LoadingOverlay\`、\`Skeleton\`、\`Progress\`、\`Loader\`。`,
  },

  // ============================================================
  // 第三十二章 LoadingOverlay/Skeleton/Progress/Loader
  // ============================================================
  {
    id: 'mantine2-ch32',
    group: '第七部分 反馈与覆盖层',
    icon: '⏳',
    title: '第三十二章 LoadingOverlay/Skeleton/Progress/Loader',
    content: `## 一句话目标

掌握四种加载反馈组件——\`LoadingOverlay\`（覆盖层）、\`Skeleton\`（骨架屏）、\`Progress\`（进度条）、\`Loader\`（加载图标），并完成数据加载骨架屏实战。

---

## 一、Loader：加载图标

最基础的加载图标，独立使用：

\`\`\`jsx
import { Loader, Stack, Group, Text } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      {/* 1. type：加载动画类型
          - oval：圆环（默认）
          - bars：三条柱状
          - dots：三个点
          - 根据视觉风格选择 */}
      <Group>
        <Loader type="oval" />
        <Loader type="bars" />
        <Loader type="dots" />
      </Group>

      {/* 2. size：尺寸，可以是预设或数字（像素） */}
      <Group>
        <Loader size="xs" />
        <Loader size="sm" />
        <Loader size="md" />
        <Loader size="lg" />
        <Loader size={48} />
      </Group>

      {/* 3. color：颜色，默认跟随主题 primaryColor */}
      <Group>
        <Loader color="blue" />
        <Loader color="red" />
        <Loader color="green" />
      </Group>

      {/* 4. 配合文字：经典 loading 区块 */}
      <Group gap="sm">
        <Loader size="sm" />
        <Text size="sm" c="dimmed">加载中……</Text>
      </Group>
    </Stack>
  );
}
\`\`\`

> ⭐ \`Loader\` 适合**独立展示**的加载状态（比如全屏 loading、按钮内嵌图标）。需要覆盖内容时用 \`LoadingOverlay\`。

---

## 二、LoadingOverlay：覆盖层

\`LoadingOverlay\` 覆盖在父元素上，需要父元素 \`position: relative\`：

\`\`\`jsx
'use client';
import { useState } from 'react';
import { LoadingOverlay, Button, Box, Stack, TextInput } from '@mantine/core';

export default function Demo() {
  const [visible, setVisible] = useState(false);

  const toggle = () => {
    setVisible(true);
    // 2 秒后自动关闭
    setTimeout(() => setVisible(false), 2000);
  };

  return (
    // 父元素必须 position: relative，覆盖层才能定位
    <Box pos="relative" p="lg" style={{ border: '1px solid #ddd', borderRadius: 8 }}>
      <Stack>
        <TextInput label="姓名" placeholder="请输入" />
        <TextInput label="邮箱" placeholder="请输入" />
        <Button onClick={toggle}>保存</Button>
      </Stack>

      {/* LoadingOverlay：覆盖父元素
          - visible：是否显示
          - overlayProps：遮罩配置（颜色、模糊度等）
          - loaderProps：加载图标配置 */}
      <LoadingOverlay
        visible={visible}
        overlayProps={{
          // blur：背景模糊（像素），让覆盖更有层次感
          blur: 2,
          // color：遮罩颜色
          color: '#fff',
          // opacity：透明度 0-1
          opacity: 0.7,
        }}
        loaderProps={{
          // 自定义 loader 样式
          type: 'bars',
          color: 'blue',
          size: 'lg',
        }}
        // zIndex：层级，默认 1000，确保覆盖内容
        zIndex={1000}
      />
    </Box>
  );
}
\`\`\`

> ⭐ \`LoadingOverlay\` 适合**已有内容需要短暂阻塞**的场景——比如保存表单时禁止用户继续操作。

---

## 三、Skeleton：骨架屏

\`Skeleton\` 是占位灰块，模拟即将加载的内容形状，比 \`Loader\` 体验更好：

\`\`\`jsx
import { Skeleton, Stack, Group, Box } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      {/* 1. 基础：height 必填（默认 100% 宽） */}
      <Skeleton height={20} />
      <Skeleton height={20} width="80%" />

      {/* 2. 圆形：circle，常用于头像占位 */}
      <Group>
        <Skeleton circle width={48} height={48} />
        <Stack gap={4}>
          <Skeleton height={12} width={120} />
          <Skeleton height={12} width={80} />
        </Stack>
      </Group>

      {/* 3. radius：圆角，模拟卡片 */}
      <Skeleton height={120} radius="md" />

      {/* 4. animate：是否动画
          - true：闪烁动画（默认）
          - false：静态灰块，适合 SSR 首屏 */}
      <Skeleton height={20} animate={false} />
    </Stack>
  );
}
\`\`\`

**Skeleton 的优势：**
- 视觉占位让用户**预知内容结构**，减少等待焦虑。
- 不会因为内容突然出现造成布局跳动（CLS）。

---

## 四、Skeleton 嵌套布局占位

模拟一个列表项的骨架屏：

\`\`\`jsx
import { Skeleton, Stack, Group, Container, Box } from '@mantine/core';

export default function ListSkeleton() {
  return (
    <Container size="sm">
      <Stack gap="md">
        {/* 顶部标题占位 */}
        <Skeleton height={32} width="60%" />

        {/* 5 个列表项骨架 */}
        {[1, 2, 3, 4, 5].map((i) => (
          // 用 Box 包起来模拟卡片
          <Box key={i} p="md" style={{ border: '1px solid #eee', borderRadius: 8 }}>
            <Group align="flex-start">
              {/* 左侧头像 */}
              <Skeleton circle width={48} height={48} />

              {/* 右侧内容 */}
              <Stack gap="xs" style={{ flex: 1 }}>
                <Skeleton height={14} width="40%" />  {/* 标题 */}
                <Skeleton height={12} width="100%" /> {/* 第一行 */}
                <Skeleton height={12} width="90%" />  {/* 第二行 */}
                <Skeleton height={12} width="70%" />  {/* 第三行 */}
              </Stack>
            </Group>
          </Box>
        ))}
      </Stack>
    </Container>
  );
}
\`\`\`

> ⭐ 骨架屏的**形状要尽量接近真实内容**——宽高比例、行数、头像位置都对得上，过渡才自然。

---

## 五、Progress：进度条

\`Progress\` 用于显示明确的进度（0-100）：

\`\`\`jsx
import { Progress, Stack, Text, Group } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      {/* 1. 基础：value 是 0-100 */}
      <Progress value={65} />

      {/* 2. size：高度（默认 sm） */}
      <Progress value={65} size="sm" />
      <Progress value={65} size="md" />
      <Progress value={65} size="lg" />
      <Progress value={65} size={20} />

      {/* 3. color：颜色 */}
      <Progress value={65} color="blue" />
      <Progress value={65} color="green" />
      <Progress value={65} color="red" />

      {/* 4. radius：圆角 */}
      <Progress value={65} radius="xl" />

      {/* 5. striped：条纹
          animated：让条纹动起来 */}
      <Progress value={65} striped />
      <Progress value={65} striped animated />

      {/* 6. 带 label：在进度条上显示文字 */}
      <Group justify="space-between">
        <Text size="sm">上传进度</Text>
        <Text size="sm" c="dimmed">65%</Text>
      </Group>
      <Progress value={65} size="lg" radius="xl" color="green" striped animated />
    </Stack>
  );
}
\`\`\`

---

## 六、Progress sections：多段进度

\`sections\` 可以让一个进度条显示多段不同颜色的部分：

\`\`\`jsx
import { Progress, Stack, Text, Group } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      <Text size="sm" fw={500}>存储使用情况</Text>

      <Progress
        // sections：分段数组
        // - value：该段所占百分比
        // - color：该段颜色
        // - label：可选，显示在段内的文字
        sections={[
          { value: 40, color: 'blue', label: '图片 40%' },
          { value: 25, color: 'green', label: '视频 25%' },
          { value: 15, color: 'orange', label: '文档 15%' },
          { value: 10, color: 'gray', label: '其他 10%' },
        ]}
        size="xl"
        radius="sm"
      />

      <Group gap="md" mt="xs">
        <Text size="xs" c="dimmed">已用 90%</Text>
        <Text size="xs" c="dimmed">剩余 10%</Text>
      </Group>
    </Stack>
  );
}
\`\`\`

> ⭐ \`sections\` 适合**多类别占比**场景——存储分布、投票结果、技能等级。

---

## 七、实战：数据加载骨架屏

把 Skeleton 和真实数据切换串起来：

\`\`\`jsx
'use client';
import { useEffect, useState } from 'react';
import {
  Skeleton, Stack, Group, Avatar, Text, Box, Container, Button,
} from '@mantine/core';

// 模拟用户数据
const MOCK_USERS = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', bio: '前端工程师，热爱 React' },
  { id: 2, name: '李四', email: 'lisi@example.com', bio: '后端工程师，专精 Node.js' },
  { id: 3, name: '王五', email: 'wangwu@example.com', bio: '设计师，专注 UI/UX' },
  { id: 4, name: '赵六', email: 'zhaoliu@example.com', bio: '产品经理' },
];

// 单个用户卡片
function UserCard({ user }) {
  return (
    <Box p="md" style={{ border: '1px solid #eee', borderRadius: 8 }}>
      <Group align="flex-start">
        <Avatar radius="xl" size="md">{user.name[0]}</Avatar>
        <Stack gap={4} style={{ flex: 1 }}>
          <Text size="sm" fw={600}>{user.name}</Text>
          <Text size="xs" c="dimmed">{user.email}</Text>
          <Text size="sm" mt={4}>{user.bio}</Text>
        </Stack>
      </Group>
    </Box>
  );
}

// 骨架屏版本：形状要和 UserCard 对齐
function UserCardSkeleton() {
  return (
    <Box p="md" style={{ border: '1px solid #eee', borderRadius: 8 }}>
      <Group align="flex-start">
        <Skeleton circle width={40} height={40} />
        <Stack gap={4} style={{ flex: 1 }}>
          <Skeleton height={14} width="30%" />
          <Skeleton height={12} width="50%" />
          <Skeleton height={12} width="100%" mt={4} />
        </Stack>
      </Group>
    </Box>
  );
}

export default function UserList() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  const loadUsers = () => {
    setLoading(true);
    // 模拟 API 请求延迟
    setTimeout(() => {
      setUsers(MOCK_USERS);
      setLoading(false);
    }, 1500);
  };

  // 首次加载
  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <Container size="sm">
      <Group justify="space-between" mb="md">
        <Text size="lg" fw={700}>用户列表</Text>
        <Button variant="light" size="xs" onClick={loadUsers} loading={loading}>
          刷新
        </Button>
      </Group>

      <Stack gap="md">
        {loading
          // 加载中：渲染 4 个骨架屏
          ? [1, 2, 3, 4].map((i) => <UserCardSkeleton key={i} />)
          // 加载完成：渲染真实数据
          : users.map((user) => <UserCard key={user.id} user={user} />)
        }
      </Stack>
    </Container>
  );
}
\`\`\`

**骨架屏最佳实践：**

1. **形状对齐**：骨架屏的元素位置、大小、间距要和真实内容完全一致。
2. **数量对齐**：骨架屏数量最好等于（或接近）真实数据条数。
3. **首屏用 \`animate={false}\`**：避免 SSR 闪烁，让骨架屏立即可见。
4. **加载时间 > 200ms 才显示**：太短的 loading 闪烁一下反而难看。

---

## 八、四种组件对比

| 组件 | 用途 | 适合场景 |
| --- | --- | --- |
| Loader | 单独的加载图标 | 全屏 loading、按钮内 |
| LoadingOverlay | 覆盖已有内容 | 表单提交、阻止操作 |
| Skeleton | 占位灰块 | 列表 / 卡片首屏加载 |
| Progress | 明确的进度 | 上传、下载、安装 |

**选型决策树：**

\`\`\`
有明确进度百分比？
  ├ 是 → Progress
  └ 否
    ├ 需要阻塞已有内容？
    │  ├ 是 → LoadingOverlay
    │  └ 否
    │    ├ 是首屏加载列表/卡片？
    │    │  ├ 是 → Skeleton
    │    │  └ 否 → Loader
\`\`\`

---

## 小结

| API | 作用 | 核心 props |
| --- | --- | --- |
| \`Loader\` | 加载图标 | type / size / color |
| \`LoadingOverlay\` | 覆盖层 | visible / overlayProps / loaderProps |
| \`Skeleton\` | 骨架屏 | height / width / circle / radius / animate |
| \`Progress\` | 进度条 | value / size / color / striped / animated |
| \`Progress sections\` | 多段进度 | sections: [{value, color, label}] |

至此「第七部分 反馈与覆盖层」全部完成。下一部分我们进入「导航与数据展示」——\`AppShell\`、\`Tabs\`、\`Table\` 等。`,
  },
];

export { chapters };
