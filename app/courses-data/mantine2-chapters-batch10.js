// =============================================================
// Mantine 从入门到精通大全 - 第十批章节（第十部分 Hooks 与实战 + 结尾，共 7 项）
// -------------------------------------------------------------
// 本批包含：
//   mantine2-ch43       : 第四十三章 Mantine Hooks 大全
//   mantine2-ch44       : 第四十四章 Notifications 通知系统
//   mantine2-ch45       : 第四十五章 实战：表单+Modal+Table 完整后台
//   mantine2-ch46       : 第四十六章 实战：暗色主题切换+响应式布局
//   mantine2-ch47       : 第四十七章 性能优化与最佳实践
//   mantine2-ch48       : 第四十八章 Next.js 集成与 SSR
//   mantine2-epilogue   : 结语与进阶路线
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：Mantine v9 / React 19 / Next.js 16
//
// 转义规则：反引号写作 \`，\${ 写作 \$\{，正则中的 \S \d \w 写作 \\S \\d \\w。
// =============================================================

const chapters = [
  // ============================================================
  // 第四十三章 Mantine Hooks 大全
  // ============================================================
  {
    id: 'mantine2-ch43',
    group: '第十部分 Hooks 与实战',
    icon: '🪝',
    title: '第四十三章 Mantine Hooks 大全',
    content: `## 一句话目标

一口气学完 Mantine 最常用的 17 个 hooks——从开合状态、防抖、热键、本地存储，到滚动、剪贴板、点击外部，每个 hook 配可运行 demo，学完日常 90% 的交互需求不用再装第三方库。

---

## 一、为什么用 Mantine Hooks

写过 React 的都知道：状态、副作用、防抖、节流……每个都要自己写 \`useEffect\` + \`useRef\`，烦且容易写错。

Mantine 把这些高频小工具封装成 50+ 个 hooks，特点：

- **零依赖**：只依赖 React，包体积小（按需 tree-shaking）。
- **TS 友好**：完整类型定义。
- **API 一致**：返回 \`[state, handlers]\` 或 \`{ state, actions }\`，统一好记。

\`\`\`bash
# 已经在 @mantine/hooks 里，安装一次就够了
npm install @mantine/hooks
\`\`\`

---

## 二、useDisclosure：开合状态（最常用）

控制 Modal/Drawer/Popover/Menu 等组件的开关状态。**这是日常用得最多的 hook，没有之一**。

\`\`\`jsx
'use client';
import { useDisclosure, Button, Modal, Group } from '@mantine/core';

export default function Demo() {
  // useDisclosure 接收初始状态（默认 false）
  // 返回数组：[opened, handlers]
  // handlers 包含 open / close / toggle / setState 四个方法
  const [opened, { open, close, toggle }] = useDisclosure(false);

  return (
    <>
      <Group>
        {/* open：打开 Modal */}
        <Button onClick={open}>打开</Button>
        {/* toggle：切换 */}
        <Button variant="light" onClick={toggle}>切换</Button>
      </Group>

      {/* Modal 的 opened 与 close 直接喂给它 */}
      <Modal opened={opened} onClose={close} title="确认操作">
        你确定要执行这个操作吗？
      </Modal>
    </>
  );
}
\`\`\`

> ⭐ **核心心法**：任何带 \`opened\` / \`onClose\` 的组件，都能用 \`useDisclosure\` 一行接管。

---

## 三、useDebouncedValue / useDebouncedCallback：防抖

搜索框输入时，用户每按一个键都触发请求会打爆服务器。**防抖**：等用户停顿一段时间再触发。

\`\`\`jsx
'use client';
import { useState } from 'react';
import { useDebouncedValue, TextInput, Text } from '@mantine/core';

export default function Demo() {
  const [value, setValue] = useState('');
  // useDebouncedValue：返回防抖后的值
  // 第二个参数是延迟毫秒数，默认 200ms
  const [debounced] = useDebouncedValue(value, 500);

  return (
    <div>
      <TextInput
        label="搜索用户"
        placeholder="输入关键字..."
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
      />
      {/* value 立即变化，debounced 等 500ms 没新输入才变 */}
      <Text mt="sm">当前输入：{value}</Text>
      <Text c="dimmed">防抖后值：{debounced}</Text>
      {/* 实际请求时用 debounced，而不是 value */}
    </div>
  );
}
\`\`\`

\`useDebouncedCallback\` 用于防抖函数本身（不是值）：

\`\`\`jsx
'use client';
import { useDebouncedCallback, Button } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

export default function Demo() {
  // useDebouncedCallback：返回防抖后的函数
  // 连续点击 1 秒内只触发最后一次
  const handleClick = useDebouncedCallback(() => {
    notifications.show({ message: '保存成功' });
  }, 1000);

  return <Button onClick={handleClick}>保存（连点会防抖）</Button>;
}
\`\`\`

---

## 四、useHotkeys：快捷键

监听全局快捷键，比如 \`Cmd+K\` 打开搜索、\`/\` 聚焦输入框。

\`\`\`jsx
'use client';
import { useHotkeys, Text, Kbd } from '@mantine/core';

export default function Demo() {
  // useHotkeys 接收数组：['快捷键', 回调]
  // - mod：跨平台的 Ctrl/Cmd（Mac 上是 Cmd，Win 上是 Ctrl）
  // - shift、alt、ctrl、meta 也能组合
  // - 字母键直接写，比如 'k'、's'
  useHotkeys([
    ['mod+k', () => alert('打开了搜索框')],
    ['mod+s', () => alert('触发了保存')],
    ['shift+/', () => alert('按了 ? 键')],
  ]);

  return (
    <Text>
      试试按 <Kbd>⌘</Kbd> + <Kbd>K</Kbd> 触发搜索快捷键
    </Text>
  );
}
\`\`\`

> ⭐ \`mod\` 是跨平台关键——别在 Mac 上写 \`ctrl+k\`，Mac 用户按 Cmd 是不会触发的。

---

## 五、useLocalStorage / useSessionStorage：本地存储

把状态自动同步到 localStorage / sessionStorage，刷新不丢。

\`\`\`jsx
'use client';
import { useLocalStorage, Button, Text } from '@mantine/core';

export default function Demo() {
  // useLocalStorage：状态 + localStorage 双向同步
  // 参数：{ key, defaultValue, deserialize, serialize }
  const [value, setValue] = useLocalStorage({
    key: 'user-theme',
    defaultValue: 'light',
    // serialize/deserialize 默认是 JSON.stringify/parse
    // 存简单字符串可以覆盖：
    // serialize: (v) => v,
    // deserialize: (v) => v,
  });

  return (
    <div>
      <Text>当前值：{value}（刷新页面也不丢）</Text>
      <Button onClick={() => setValue(value === 'light' ? 'dark' : 'light')}>
        切换
      </Button>
    </div>
  );
}
\`\`\`

\`useSessionStorage\` 用法完全相同，只是存在 sessionStorage（标签页关闭就清）。

---

## 六、useMediaQuery：媒体查询

在 JS 里判断 CSS 媒体查询是否匹配，常用于响应式逻辑分支。

\`\`\`jsx
'use client';
import { useMediaQuery, Text, Button } from '@mantine/core';

export default function Demo() {
  // useMediaQuery：返回 boolean，是否匹配该查询
  // 注意：SSR 时返回 false，hydration 后才更新
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 1280px)');

  return (
    <div>
      <Text>设备类型：{isMobile ? '手机' : isDesktop ? '桌面' : '平板'}</Text>
      {/* 根据设备类型渲染不同按钮尺寸 */}
      <Button size={isMobile ? 'sm' : 'md'}>
        {isMobile ? '小按钮' : '正常按钮'}
      </Button>
    </div>
  );
}
\`\`\`

---

## 七、useViewportSize：视口尺寸

拿到 \`{ width, height }\`，窗口变化时自动更新。

\`\`\`jsx
'use client';
import { useViewportSize, Text } from '@mantine/core';

export default function Demo() {
  const { width, height } = useViewportSize();

  return (
    <Text>
      当前视口：{width} × {height}（缩放窗口试试）
    </Text>
  );
}
\`\`\`

---

## 八、useScrollIntoView：滚动到视图

点击按钮把某个元素滚到可视区，常用于「回到顶部」「锚点导航」。

\`\`\`jsx
'use client';
import { useRef } from 'react';
import { useScrollIntoView, Button, Box, Stack } from '@mantine/core';

export default function Demo() {
  const targetRef = useRef(null);
  // useScrollIntoView：返回 { scrollIntoView, cancel, setTargetRef }
  // 可以传 axis（'vertical' | 'horizontal'）和 duration（动画时长）
  const { scrollIntoView } = useScrollIntoView({ duration: 500 });

  return (
    <Stack>
      <Button onClick={() => scrollIntoView({ target: targetRef.current })}>
        滚动到目标
      </Button>
      {/* 占位高度让页面可滚 */}
      <Box h="150vh" bg="gray.1">向下滚动看效果...</Box>
      <Box ref={targetRef} p="lg" bg="blue.1">
        🎯 目标元素
      </Box>
    </Stack>
  );
}
\`\`\`

---

## 九、useIntersection：交叉观察

判断元素是否进入视口，常用于「图片懒加载」「无限滚动」。

\`\`\`jsx
'use client';
import { useRef } from 'react';
import { useIntersection, Box, Text } from '@mantine/core';

export default function Demo() {
  const ref = useRef(null);
  // useIntersection：返回 { ref, entry, reinit }
  // root：相对哪个父容器判断，默认浏览器视口
  // threshold：触发阈值（0~1）
  const { ref: intersectionRef, entry } = useIntersection({
    root: null,
    threshold: 0.5,
  });

  const visible = entry?.isIntersecting;

  return (
    <div>
      <Text>元素可见：{visible ? '✅ 是' : '❌ 否'}</Text>
      <Box h="120vh" bg="gray.1">滚动页面，让下面的元素进入视口...</Box>
      <Box
        ref={(node) => { ref.current = node; intersectionRef(node); }}
        p="xl"
        bg={visible ? 'green.1' : 'red.1'}
      >
        🎯 观察目标（进入视口会变绿）
      </Box>
    </div>
  );
}
\`\`\`

---

## 十、useHover / useFocusWithin：交互状态

判断鼠标 hover 或元素/子元素是否聚焦。

\`\`\`jsx
'use client';
import { useRef } from 'react';
import { useHover, useFocusWithin, Box, TextInput } from '@mantine/core';

export default function Demo() {
  const hoverRef = useRef(null);
  // useHover：返回 { ref, hovered }
  const { ref: hRef, hovered } = useHover();

  const focusRef = useRef(null);
  // useFocusWithin：子元素任意一个聚焦都算 true
  const { ref: fRef, focusWithin } = useFocusWithin();

  return (
    <Box
      ref={(node) => { hoverRef.current = node; hRef(node); }}
      p="lg"
      bg={hovered ? 'blue.1' : 'gray.1'}
    >
      鼠标 hover 我会变蓝（{hovered ? '已 hover' : '未 hover'}）
    </Box>

    <Box
      ref={(node) => { focusRef.current = node; fRef(node); }}
      p="lg"
      mt="md"
      bg={focusWithin ? 'green.1' : 'gray.1'}
    >
      <TextInput placeholder="聚焦我，外层会变绿" />
      <TextInput placeholder="任意一个聚焦都算" mt="sm" />
    </Box>
  );
}
\`\`\`

---

## 十一、useMergedRef：合并 ref

当你需要把同一个 ref 同时给组件库和自己用时。

\`\`\`jsx
'use client';
import { useRef } from 'react';
import { useMergedRef, TextInput, Button } from '@mantine/core';

export default function Demo() {
  const myRef = useRef(null);

  return (
    <div>
      {/* TextInput 内部也有 ref，用 useMergedRef 合并不冲突 */}
      <TextInput ref={useMergedRef(myRef)} placeholder="输入文字" />
      <Button mt="sm" onClick={() => myRef.current?.focus()}>
        聚焦输入框
      </Button>
    </div>
  );
}
\`\`\`

> ⭐ 实战场景：组件库组件 + 自己写的 \`forwardRef\` 包一层，必须合并 ref。

---

## 十二、usePrevious：上一个值

拿到上一次渲染的值，常用于「比较前后变化」。

\`\`\`jsx
'use client';
import { useState } from 'react';
import { usePrevious, Button, Text } from '@mantine/core';

export default function Demo() {
  const [count, setCount] = useState(0);
  // usePrevious：返回上一次渲染时的值（首次为 undefined）
  const prevCount = usePrevious(count);

  return (
    <div>
      <Text>当前：{count}，上一个：{prevCount ?? '无'}</Text>
      <Text c="dimmed">
        变化：{prevCount !== undefined ? count - prevCount : 0}
      </Text>
      <Button onClick={() => setCount(count + 1)}>+1</Button>
    </div>
  );
}
\`\`\`

---

## 十三、useSetState：setState 便捷版

类似 class 组件的 \`this.setState\`，自动浅合并。

\`\`\`jsx
'use client';
import { useSetState, Button, Text } from '@mantine/hooks';

export default function Demo() {
  // useSetState：返回 [state, setState]
  // setState 会自动浅合并，不用写 ...state
  const [state, setState] = useSetState({
    name: 'Tom',
    age: 18,
    city: 'Shanghai',
  });

  return (
    <div>
      <Text>{JSON.stringify(state)}</Text>
      {/* 只改 age，其他字段自动保留 */}
      <Button onClick={() => setState({ age: state.age + 1 })}>
        长一岁
      </Button>
      {/* 一次改多个字段 */}
      <Button onClick={() => setState({ name: 'Jerry', city: 'Beijing' })}>
        改名 + 改城市
      </Button>
    </div>
  );
}
\`\`\`

---

## 十四、useTimeout / useInterval：定时器

自动清理的定时器，组件卸载时不会内存泄漏。

\`\`\`jsx
'use client';
import { useState } from 'react';
import { useTimeout, useInterval, Button, Text } from '@mantine/core';

export default function Demo() {
  const [count, setCount] = useState(0);
  const [autoCount, setAutoCount] = useState(0);

  // useTimeout：返回 { start, clear }
  // 默认不启动，调用 start 才开始
  const { start: startTimeout } = useTimeout(() => {
    alert('3 秒到了');
  }, 3000);

  // useInterval：第二个参数是 delay，传 null 暂停
  const [intervalState, setIntervalState] = useState(true);
  useInterval(() => setAutoCount((c) => c + 1), intervalState ? 1000 : null);

  return (
    <div>
      <Button onClick={startTimeout}>3 秒后弹窗</Button>
      <Text mt="sm">自动计数：{autoCount}</Text>
      <Button onClick={() => setIntervalState(!intervalState)}>
        {intervalState ? '暂停' : '开始'}
      </Button>
    </div>
  );
}
\`\`\`

> ⭐ 比手写 \`useEffect\` + \`setTimeout\` 强的地方：组件卸载时**自动 clear**，不会有「组件已卸载还 setState」警告。

---

## 十五、useClickOutside：点击外部

点击元素外部时触发回调，常用于「点击遮罩关闭」「点击外部收起下拉」。

\`\`\`jsx
'use client';
import { useRef, useState } from 'react';
import { useClickOutside, Box, Text } from '@mantine/core';

export default function Demo() {
  const [opened, setOpened] = useState(false);
  // useClickOutside：返回 ref，挂到要保护的元素上
  const ref = useClickOutside(() => setOpened(false));

  return (
    <div>
      <button onClick={() => setOpened(true)}>打开菜单</button>
      {opened && (
        <Box
          ref={ref}
          p="md"
          bg="blue.1"
          style={{ position: 'absolute', marginTop: 4 }}
        >
          <Text>点我会保持打开，点外面就关掉</Text>
        </Box>
      )}
    </div>
  );
}
\`\`\`

---

## 十六、useClipboard：复制到剪贴板

\`\`\`jsx
'use client';
import { useClipboard, Button, TextInput, Text } from '@mantine/core';

export default function Demo() {
  // useClipboard：返回 { copy, copied, reset }
  // copied：复制后 1.5 秒内为 true，自动重置
  const { copy, copied } = useClipboard({ timeout: 1500 });

  return (
    <div>
      <TextInput defaultValue="hello@example.com" id="copy-input" />
      <Button
        mt="sm"
        color={copied ? 'teal' : 'blue'}
        onClick={() => copy(document.getElementById('copy-input').value)}
      >
        {copied ? '已复制 ✓' : '复制'}
      </Button>
    </div>
  );
}
\`\`\`

---

## 十七、useCounter / usePagination：计数/分页

\`\`\`jsx
'use client';
import { useCounter, usePagination, Button, Text, Group } from '@mantine/hooks';

export default function Demo() {
  // useCounter：受控计数器
  // 参数：(initialValue, { min, max })
  const [count, { increment, decrement, set, reset }] = useCounter(5, {
    min: 0,
    max: 10,
  });

  // usePagination：分页状态
  // total：总页数，initialPage：起始页
  const [page, { next, prev, setPage }] = usePagination({
    total: 5,
    initialPage: 1,
  });

  return (
    <div>
      <Group>
        <Button onClick={decrement}>-</Button>
        <Text>{count}</Text>
        <Button onClick={increment}>+</Button>
        <Button variant="light" onClick={reset}>重置</Button>
      </Group>

      <Group mt="md">
        <Button onClick={prev} disabled={page === 1}>上一页</Button>
        <Text>第 {page} / 5 页</Text>
        <Button onClick={next} disabled={page === 5}>下一页</Button>
      </Group>
    </div>
  );
}
\`\`\`

---

## 十八、实战：搜索防抖 + 快捷键

把前面学的 hooks 组合起来，搭一个真实的搜索体验：

- 输入框防抖 500ms 才请求
- \`Cmd+K\` 聚焦搜索框
- \`Esc\` 清空搜索

\`\`\`jsx
'use client';
import { useState, useRef, useEffect } from 'react';
import {
  useDisclosure,
  useDebouncedValue,
  useHotkeys,
  ActionIcon,
  Text,
  TextInput,
  Kbd,
  Stack,
  Loader,
} from '@mantine/core';

// 模拟 API 请求
async function searchUsers(keyword) {
  if (!keyword) return [];
  // 假装请求耗时
  await new Promise((r) => setTimeout(r, 300));
  return ['张三', '李四', '王五'].filter((u) => u.includes(keyword));
}

export default function SearchDemo() {
  const [value, setValue] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  // 防抖 500ms
  const [debounced] = useDebouncedValue(value, 500);

  const inputRef = useRef(null);

  // Cmd+K 聚焦输入框
  useHotkeys([
    ['mod+k', () => inputRef.current?.focus()],
    ['escape', () => {
      setValue('');
      inputRef.current?.blur();
    }],
  ]);

  // 监听防抖值变化，触发请求
  useEffect(() => {
    if (!debounced) {
      setResults([]);
      return;
    }
    setLoading(true);
    searchUsers(debounced).then((data) => {
      setResults(data);
      setLoading(false);
    });
  }, [debounced]);

  return (
    <Stack>
      <TextInput
        ref={inputRef}
        label="搜索用户"
        placeholder="输入关键字..."
        description={<>按 <Kbd>⌘</Kbd> + <Kbd>K</Kbd> 聚焦，<Kbd>Esc</Kbd> 清空</>}
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        rightSection={loading ? <Loader size="xs" /> : null}
      />
      <div>
        {results.map((u) => (
          <Text key={u} py="xs">{u}</Text>
        ))}
        {!loading && debounced && results.length === 0 && (
          <Text c="dimmed">无匹配结果</Text>
        )}
      </div>
    </Stack>
  );
}
\`\`\`

---

## 小结

| Hook | 用途 | 返回 |
| --- | --- | --- |
| \`useDisclosure\` | 开合状态 | \`[opened, { open, close, toggle }]\` |
| \`useDebouncedValue\` | 值防抖 | \`[debounced]\` |
| \`useDebouncedCallback\` | 函数防抖 | \`debouncedFn\` |
| \`useHotkeys\` | 快捷键 | \`void\` |
| \`useLocalStorage\` | 本地存储 | \`[value, setValue]\` |
| \`useMediaQuery\` | 媒体查询 | \`boolean\` |
| \`useViewportSize\` | 视口尺寸 | \`{ width, height }\` |
| \`useScrollIntoView\` | 滚动到视图 | \`{ scrollIntoView }\` |
| \`useIntersection\` | 交叉观察 | \`{ ref, entry }\` |
| \`useHover\` | 鼠标 hover | \`{ ref, hovered }\` |
| \`useFocusWithin\` | 子元素聚焦 | \`{ ref, focusWithin }\` |
| \`useMergedRef\` | 合并 ref | \`mergedRef\` |
| \`usePrevious\` | 上一个值 | \`prevValue\` |
| \`useSetState\` | 浅合并 setState | \`[state, setState]\` |
| \`useTimeout\` | 单次定时器 | \`{ start, clear }\` |
| \`useInterval\` | 循环定时器 | \`void\` |
| \`useClickOutside\` | 点击外部 | \`ref\` |
| \`useClipboard\` | 复制剪贴板 | \`{ copy, copied }\` |
| \`useCounter\` | 计数器 | \`[count, { inc, dec, set, reset }]\` |
| \`usePagination\` | 分页 | \`[page, { next, prev, setPage }]\` |

下一章我们学 Notifications 通知系统，配合这些 hooks 能搭出超顺滑的交互体验。`,
  },

  // ============================================================
  // 第四十四章 Notifications 通知系统
  // ============================================================
  {
    id: 'mantine2-ch44',
    group: '第十部分 Hooks 与实战',
    icon: '🔔',
    title: '第四十四章 Notifications 通知系统',
    content: `## 一句话目标

接入 \`@mantine/notifications\`，学会用 \`notifications.show\` 弹出成功/失败/加载通知，并实现「提交中→成功」的通知链，让用户每次操作都有即时反馈。

---

## 一、为什么需要 Notifications

表单提交成功后弹个 \`alert('保存成功')\`？太丑、太突兀、阻塞主线程、移动端体验差。

Mantine Notifications 是一套**非阻塞的右上角提示系统**：

- 自动消失（默认 4 秒）
- 可堆叠（多个通知排队展示）
- 支持图标、颜色、加载态
- 支持更新（"提交中"→"成功"）
- 支持 SSR（Next.js 直接用）

---

## 二、安装与配置

\`\`\`bash
# 1. 安装包
npm install @mantine/notifications

# 2. 引入样式（在 layout.js 或根组件）
\`\`\`

\`\`\`jsx
// app/layout.js
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css'; // 通知样式

import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <head><ColorSchemeScript /></head>
      <body>
        <MantineProvider>
          {/* Notifications：通知容器，必须放在 MantineProvider 内
              position：通知位置，默认 'top-right'
              zIndex：层级，默认 999
              autoClose：默认自动关闭时间，默认 4000ms，false 表示不自动关
              limit：最多同时显示几条，默认 5 */}
          <Notifications position="top-right" zIndex={1000} autoClose={4000} limit={5} />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
\`\`\`

> ⭐ **坑点**：忘了引入 \`@mantine/notifications/styles.css\`，通知能弹出但完全没样式——位置乱、动画丢。

---

## 三、notifications.show：基本用法

\`notifications.show\` 是最常用的 API，参数：

\`\`\`jsx
'use client';
import { notifications } from '@mantine/notifications';
import { Button, Group } from '@mantine/core';
import { IconCheck, IconX, IconInfoCircle, IconLoader } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Group>
      {/* 1. 最简单的：只给 message */}
      <Button onClick={() => notifications.show({ message: '你好，世界' })}>
        默认通知
      </Button>

      {/* 2. 成功通知：title + color + icon */}
      <Button
        color="green"
        onClick={() => notifications.show({
          title: '保存成功',
          message: '你的修改已保存到服务器',
          color: 'green',
          icon: <IconCheck size={18} />,
        })}
      >
        成功通知
      </Button>

      {/* 3. 错误通知 */}
      <Button
        color="red"
        onClick={() => notifications.show({
          title: '提交失败',
          message: '网络错误，请重试',
          color: 'red',
          icon: <IconX size={18} />,
        })}
      >
        错误通知
      </Button>

      {/* 4. 信息通知 */}
      <Button
        color="blue"
        onClick={() => notifications.show({
          title: '系统通知',
          message: '您有 3 条新消息',
          color: 'blue',
          icon: <IconInfoCircle size={18} />,
        })}
      >
        信息通知
      </Button>

      {/* 5. 加载态通知：loading: true */}
      <Button
        variant="light"
        onClick={() => notifications.show({
          message: '正在处理...',
          color: 'blue',
          loading: true,
          // loading 时禁止自动关闭，等手动 update
          autoClose: false,
          // 隐藏关闭按钮
          withCloseButton: false,
        })}
      >
        加载通知
      </Button>

      {/* 6. 不自动关闭 */}
      <Button
        variant="outline"
        onClick={() => notifications.show({
          title: '需要确认',
          message: '这条通知不会自动消失，需要手动关闭',
          color: 'orange',
          autoClose: false,
          withCloseButton: true,
        })}
      >
        不自动关闭
      </Button>
    </Group>
  );
}
\`\`\`

---

## 四、notifications.update：更新通知

最常见的场景：**提交时弹"加载中"，请求成功后更新成"成功"**。

\`\`\`jsx
'use client';
import { notifications } from '@mantine/notifications';
import { Button } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

export default function Demo() {
  const handleSubmit = async () => {
    // 1. 先弹一个 loading 通知，拿到 id
    const id = notifications.show({
      title: '正在提交',
      message: '请稍候...',
      color: 'blue',
      loading: true,
      autoClose: false,
      withCloseButton: false,
    });

    try {
      // 2. 模拟 API 请求
      await new Promise((r) => setTimeout(r, 1500));

      // 3. 更新成成功
      notifications.update({
        id, // 必须传 id 才能更新已有的
        title: '提交成功',
        message: '数据已保存',
        color: 'teal',
        icon: <IconCheck size={18} />,
        loading: false,
        autoClose: 2000, // 2 秒后自动关
      });
    } catch (err) {
      // 失败也要更新
      notifications.update({
        id,
        title: '提交失败',
        message: err.message,
        color: 'red',
        loading: false,
        autoClose: 3000,
      });
    }
  };

  return <Button onClick={handleSubmit}>提交表单</Button>;
}
\`\`\`

> ⭐ **核心思路**：先 \`show\` 拿 \`id\`，再 \`update\` 传 \`id\`。这是通知链的标准模式。

---

## 五、clean / cleanQueue / hide：批量控制

\`\`\`jsx
'use client';
import { notifications } from '@mantine/notifications';
import { Button, Group } from '@mantine/core';

export default function Demo() {
  const popMany = () => {
    // 连弹 5 个通知
    for (let i = 1; i <= 5; i++) {
      notifications.show({ message: \`通知 \${i}\` });
    }
  };

  return (
    <Group>
      <Button onClick={popMany}>弹 5 个</Button>

      {/* cleanQueue：清空队列中还没显示的通知（已显示的不动） */}
      <Button color="orange" variant="light" onClick={() => notifications.cleanQueue()}>
        清空队列
      </Button>

      {/* clean：清空所有通知（包括已显示和队列中的） */}
      <Button color="red" variant="light" onClick={() => notifications.clean()}>
        清空所有
      </Button>

      {/* hide：根据 id 关闭单个通知 */}
      <Button
        variant="outline"
        onClick={() => {
          const id = notifications.show({
            message: '3 秒后我会被手动关掉',
            autoClose: false,
          });
          setTimeout(() => notifications.hide(id), 3000);
        }}
      >
        手动关闭单个
      </Button>
    </Group>
  );
}
\`\`\`

---

## 六、自定义通知内容（children）

当 \`message\` 不够灵活时，用 \`children\` 渲染任意 ReactNode：

\`\`\`jsx
'use client';
import { notifications } from '@mantine/notifications';
import { Button, Text, Group, Avatar, Progress } from '@mantine/core';

export default function Demo() {
  const showCustom = () => {
    notifications.show({
      title: '文件上传中',
      // children：完全自定义内容
      message: null, // message 设为 null
      autoClose: false,
      withCloseButton: false,
      children: (
        <div>
          <Group gap="sm">
            <Avatar color="blue">📄</Avatar>
            <div>
              <Text size="sm" fw={500}>报告.pdf</Text>
              <Text size="xs" c="dimmed">2.4 MB / 5 MB</Text>
            </div>
          </Group>
          <Progress value={48} size="xs" mt="sm" color="blue" />
        </div>
      ),
    });
  };

  return <Button onClick={showCustom}>自定义通知</Button>;
}
\`\`\`

---

## 七、实战：表单提交通知链

把 \"开始→加载→成功/失败\" 完整链路封装成一个工具函数，复用：

\`\`\`jsx
'use client';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { Button, TextInput, Stack } from '@mantine/core';
import { useState } from 'react';

/**
 * 异步操作通知封装
 * @param {string} title - 通知标题
 * @param {() => Promise<any>} fn - 要执行的异步函数
 * @param {object} options - 配置
 * @param {string} options.successMessage - 成功消息
 * @param {string} options.errorMessage - 失败消息
 */
async function withNotification(title, fn, options = {}) {
  const {
    successMessage = '操作成功',
    errorMessage = '操作失败',
  } = options;

  // 1. 弹 loading 通知
  const id = notifications.show({
    title,
    message: '正在处理...',
    color: 'blue',
    loading: true,
    autoClose: false,
    withCloseButton: false,
  });

  try {
    const result = await fn();
    // 2. 成功
    notifications.update({
      id,
      title: '✅ 成功',
      message: successMessage,
      color: 'teal',
      icon: <IconCheck size={18} />,
      loading: false,
      autoClose: 2000,
    });
    return result;
  } catch (err) {
    // 3. 失败
    notifications.update({
      id,
      title: '❌ 失败',
      message: errorMessage + ': ' + err.message,
      color: 'red',
      icon: <IconX size={18} />,
      loading: false,
      autoClose: 4000,
    });
    throw err;
  }
}

export default function Demo() {
  const [email, setEmail] = useState('');

  const handleSubmit = async () => {
    // 调用：一行实现完整通知链
    await withNotification(
      '订阅邮件',
      async () => {
        // 模拟 API
        await new Promise((r) => setTimeout(r, 1500));
        if (!email.includes('@')) throw new Error('邮箱格式错误');
        return { ok: true };
      },
      { successMessage: \`已订阅 \${email}\`, errorMessage: '订阅失败' }
    );
  };

  return (
    <Stack>
      <TextInput
        label="邮箱"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
      />
      <Button onClick={handleSubmit}>订阅</Button>
    </Stack>
  );
}
\`\`\`

---

## 小结

| API | 作用 |
| --- | --- |
| \`notifications.show({ title, message, color, icon, autoClose, loading })\` | 弹通知，返回 id |
| \`notifications.update({ id, ...props })\` | 根据 id 更新已有通知 |
| \`notifications.hide(id)\` | 关闭单个通知 |
| \`notifications.clean()\` | 清空所有通知 |
| \`notifications.cleanQueue()\` | 清空待显示队列 |
| \`children\` | 自定义通知内容 |
| \`loading\` | 加载态（显示 spinner，不自动关） |
| \`autoClose: false\` | 禁用自动关闭 |

下一章我们综合前面所有知识，搭一个真实的「用户管理后台」。`,
  },

  // ============================================================
  // 第四十五章 实战：表单+Modal+Table 完整后台
  // ============================================================
  {
    id: 'mantine2-ch45',
    group: '第十部分 Hooks 与实战',
    icon: '🎯',
    title: '第四十五章 实战：表单+Modal+Table 完整后台',
    content: `## 一句话目标

把前面学的 **AppShell 布局 + Table 数据展示 + Modal 弹窗 + useForm 表单 + Notifications 反馈** 全部串起来，搭出一个能直接交付生产的「用户管理后台」。

---

## 一、要做什么

一个完整的 CRUD 后台页面：

- **AppShell** 顶部导航 + 侧边栏布局
- **Table** 显示用户列表，支持搜索、分页
- **Modal** 弹窗新增/编辑用户
- **useForm** 表单 + 校验
- **Notifications** 提交反馈

数据用内存数组模拟，方便直接跑。

---

## 二、安装与文件结构

\`\`\`bash
# 确保装好这些包
npm install @mantine/core @mantine/hooks @mantine/form @mantine/notifications @tabler/icons-react
\`\`\`

文件结构（简化版，所有代码放一个文件方便理解）：

\`\`\`
app/
├── layout.js          # 根布局（已配 MantineProvider + Notifications）
└── admin/
    └── users/
        └── page.js    # 用户管理页面（本节代码）
\`\`\`

---

## 三、完整代码

\`\`\`jsx
// app/admin/users/page.js
'use client';
import { useState, useMemo } from 'react';
import {
  AppShell,
  AppShellHeader,
  AppShellNavbar,
  AppShellMain,
  Burger,
  Group,
  Title,
  Text,
  TextInput,
  Button,
  Table,
  Modal,
  Stack,
  ActionIcon,
  Pagination,
  Avatar,
  Badge,
  Menu,
  Center,
  Grid,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconDotsVertical,
  IconUsers,
  IconSettings,
  IconDashboard,
} from '@tabler/icons-react';

// 模拟数据
const initialUsers = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', role: 'admin', status: 'active' },
  { id: 2, name: '李四', email: 'lisi@example.com', role: 'editor', status: 'active' },
  { id: 3, name: '王五', email: 'wangwu@example.com', role: 'viewer', status: 'inactive' },
  { id: 4, name: '赵六', email: 'zhaoliu@example.com', role: 'editor', status: 'active' },
  { id: 5, name: '孙七', email: 'sunqi@example.com', role: 'viewer', status: 'active' },
  { id: 6, name: '周八', email: 'zhouba@example.com', role: 'admin', status: 'inactive' },
  { id: 7, name: '吴九', email: 'wujiu@example.com', role: 'editor', status: 'active' },
  { id: 8, name: '郑十', email: 'zhengshi@example.com', role: 'viewer', status: 'active' },
];

// 角色映射
const roleConfig = {
  admin: { label: '管理员', color: 'red' },
  editor: { label: '编辑', color: 'blue' },
  viewer: { label: '访客', color: 'gray' },
};

const PAGE_SIZE = 5;

export default function UserAdminPage() {
  // === 状态管理 ===
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // === Modal 开合 ===
  // openCreate：新增模式，openEdit：编辑模式
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingId, setEditingId] = useState(null);
  const isEditing = editingId !== null;

  // === 侧边栏 ===
  const [navbarOpened, { toggle: toggleNavbar }] = useDisclosure(false);

  // === 表单 ===
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      email: '',
      role: 'viewer',
      status: 'active',
    },
    validate: {
      // name：必填，至少 2 个字符
      name: (v) => (v && v.trim().length >= 2 ? null : '姓名至少 2 个字符'),
      // email：必填，正则校验
      email: (v) => (/^\\S+@\\S+\\.\\S+$/.test(v) ? null : '邮箱格式不正确'),
      // role：必须是预设值
      role: (v) => ['admin', 'editor', 'viewer'].includes(v) ? null : '角色无效',
    },
  });

  // === 搜索过滤 + 分页 ===
  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(keyword) ||
        u.email.toLowerCase().includes(keyword)
    );
  }, [users, search]);

  // 分页后的数据
  const pagedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, page]);

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);

  // === 新增/编辑处理 ===
  const handleAdd = () => {
    setEditingId(null);
    form.reset();
    openModal();
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    // 注意：uncontrolled 模式下用 setValues 设置初始值
    form.setValues({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    openModal();
  };

  const handleSubmit = async (values) => {
    // 模拟异步请求
    const id = notifications.show({
      title: isEditing ? '正在保存' : '正在创建',
      message: '请稍候...',
      color: 'blue',
      loading: true,
      autoClose: false,
      withCloseButton: false,
    });

    await new Promise((r) => setTimeout(r, 800));

    if (isEditing) {
      // 更新
      setUsers((prev) =>
        prev.map((u) => (u.id === editingId ? { ...u, ...values } : u))
      );
      notifications.update({
        id,
        title: '✅ 已保存',
        message: \`用户 \${values.name} 已更新\`,
        color: 'teal',
        loading: false,
        autoClose: 2000,
      });
    } else {
      // 新增
      const newUser = { ...values, id: Date.now() };
      setUsers((prev) => [newUser, ...prev]);
      notifications.update({
        id,
        title: '✅ 已创建',
        message: \`用户 \${values.name} 已添加\`,
        color: 'teal',
        loading: false,
        autoClose: 2000,
      });
    }

    closeModal();
  };

  // === 删除处理 ===
  const handleDelete = (user) => {
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    notifications.show({
      title: '🗑️ 已删除',
      message: \`用户 \${user.name} 已删除\`,
      color: 'red',
    });
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 220,
        breakpoint: 'sm',
        collapsed: { mobile: !navbarOpened },
      }}
      padding="md"
    >
      {/* === 顶部导航 === */}
      <AppShellHeader>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={navbarOpened}
              onClick={toggleNavbar}
              hiddenFrom="sm"
              size="sm"
            />
            <Title order={4}>📋 用户管理后台</Title>
          </Group>
          <Text size="sm" c="dimmed">管理员视角</Text>
        </Group>
      </AppShellHeader>

      {/* === 侧边栏 === */}
      <AppShellNavbar p="md">
        <Stack gap="xs">
          <Button variant="subtle" justify="flex-start" leftSection={<IconDashboard size={18} />}>
            仪表盘
          </Button>
          <Button variant="light" justify="flex-start" leftSection={<IconUsers size={18} />}>
            用户管理
          </Button>
          <Button variant="subtle" justify="flex-start" leftSection={<IconSettings size={18} />}>
            系统设置
          </Button>
        </Stack>
      </AppShellNavbar>

      {/* === 主内容区 === */}
      <AppShellMain>
        <Stack gap="md">
          {/* 工具栏：搜索 + 新增按钮 */}
          <Group justify="space-between">
            <TextInput
              placeholder="搜索姓名或邮箱..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => {
                setSearch(e.currentTarget.value);
                setPage(1); // 搜索时回到第一页
              }}
              w={{ base: '100%', sm: 300 }}
            />
            <Button leftSection={<IconPlus size={16} />} onClick={handleAdd}>
              新增用户
            </Button>
          </Group>

          {/* 用户列表表格 */}
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>用户</Table.Th>
                <Table.Th>邮箱</Table.Th>
                <Table.Th>角色</Table.Th>
                <Table.Th>状态</Table.Th>
                <Table.Th style={{ textAlign: 'right' }}>操作</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {pagedUsers.map((user) => (
                <Table.Tr key={user.id}>
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar color="blue" radius="xl" size="sm">
                        {user.name[0]}
                      </Avatar>
                      <Text fw={500}>{user.name}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>{user.email}</Table.Td>
                  <Table.Td>
                    <Badge color={roleConfig[user.role].color} variant="light">
                      {roleConfig[user.role].label}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={user.status === 'active' ? 'green' : 'gray'} variant="dot">
                      {user.status === 'active' ? '活跃' : '禁用'}
                    </Badge>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    <Group gap="xs" justify="flex-end">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => handleEdit(user)}
                        aria-label="编辑"
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <Menu position="bottom-end" shadow="md" width={160}>
                        <Menu.Target>
                          <ActionIcon variant="subtle" aria-label="更多">
                            <IconDotsVertical size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => handleDelete(user)}>
                            删除用户
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
              {pagedUsers.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Center py="xl">
                      <Text c="dimmed">无匹配用户</Text>
                    </Center>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>

          {/* 分页 */}
          {totalPages > 1 && (
            <Group justify="flex-end">
              <Pagination total={totalPages} page={page} onChange={setPage} />
            </Group>
          )}
        </Stack>
      </AppShellMain>

      {/* === 新增/编辑 Modal === */}
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={isEditing ? '编辑用户' : '新增用户'}
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="姓名"
              placeholder="请输入姓名"
              withAsterisk
              key={form.key('name')}
              {...form.getInputProps('name')}
            />
            <TextInput
              label="邮箱"
              placeholder="you@example.com"
              withAsterisk
              key={form.key('email')}
              {...form.getInputProps('email')}
            />
            {/* 这里用 Select 更合适，简化为 TextInput 演示 */}
            <TextInput
              label="角色"
              description="可选：admin / editor / viewer"
              key={form.key('role')}
              {...form.getInputProps('role')}
            />
            <TextInput
              label="状态"
              description="可选：active / inactive"
              key={form.key('status')}
              {...form.getInputProps('status')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={closeModal}>取消</Button>
              <Button type="submit">{isEditing ? '保存' : '创建'}</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </AppShell>
  );
}
\`\`\`

---

## 四、关键点解析

### 1. 编辑时怎么填充表单？

\`\`\`js
form.setValues({ name: user.name, ... });
\`\`\`

\`useForm\` 的 \`setValues\` 会重置所有字段（包括 uncontrolled 模式）。但要注意：uncontrolled 模式下 \`key={form.key('name')}\` 必须写——这是 React 强制重渲染的机制。

### 2. 搜索后为什么 page 要重置？

\`\`\`js
setSearch(value); setPage(1);
\`\`\`

不重置的话，搜索结果可能比当前页少，比如原来在第 3 页有数据，搜索后只剩 2 条，page 还是 3 → 看不到任何结果。

### 3. 为什么用 \`useMemo\`？

\`filteredUsers\` 依赖 \`users\` 和 \`search\`，每次组件渲染都重新计算会浪费——特别是数据量大时。包一层 \`useMemo\` 避免无谓计算。

### 4. 为什么 Modal 里用 Stack 不用 Grid？

表单字段是垂直堆叠的，\`Stack\` 天然适合。Grid 适合横向并排（如姓名+邮箱同一行）。

---

## 小结

| 模块 | 用到的组件/Hook |
| --- | --- |
| 布局 | AppShell + Header + Navbar + Main |
| 数据展示 | Table + Badge + Avatar + ActionIcon |
| 弹窗 | Modal + useDisclosure |
| 表单 | useForm + TextInput + 校验 |
| 反馈 | notifications.show + update |
| 搜索 | useMemo + onChange |
| 分页 | Pagination + useState |

下一章我们做另一个实战：暗色主题切换 + 响应式落地页。`,
  },

  // ============================================================
  // 第四十六章 实战：暗色主题切换+响应式布局
  // ============================================================
  {
    id: 'mantine2-ch46',
    group: '第十部分 Hooks 与实战',
    icon: '🌗',
    title: '第四十六章 实战：暗色主题切换+响应式布局',
    content: `## 一句话目标

做一个落地页（Landing Page）：响应式 Grid 卡片布局 + 暗色/亮色切换 + localStorage 持久化 + 移动端 Burger 菜单 + 主题色动态切换，一套代码搞定多端多主题。

---

## 一、要做什么

一个 SaaS 产品落地页：

- **顶部导航**：Logo + 菜单 + 主题切换 + 主题色选择器
- **Hero 区**：标题 + 描述 + CTA 按钮
- **特性区**：响应式 Grid 卡片（桌面 3 列，平板 2 列，手机 1 列）
- **Footer**：版权信息

移动端导航收进 Burger 菜单。

---

## 二、核心知识回顾

实战前先回顾几个关键 API：

\`\`\`js
// 1. 暗色切换（第四章已学）
const { colorScheme, setColorScheme } = useMantineColorScheme();
const computed = useComputedColorScheme('light', { getInitialValueInEffect: true });

// 2. 主题色动态切换
// primaryColor 在运行时不能直接改，要通过 key 强制 MantineProvider 重新渲染
// 或者用 CSS 变量直接覆盖

// 3. 响应式 props
// Mantine 的 width、padding 等 props 都支持响应式对象：
// w={{ base: '100%', sm: 300 }} 表示手机 100%、sm 以上 300px
\`\`\`

---

## 三、完整代码

\`\`\`jsx
// app/landing/page.js
'use client';
import { useState } from 'react';
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  Burger,
  Container,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Grid,
  Card,
  ThemeIcon,
  ActionIcon,
  Menu,
  SimpleGrid,
  Box,
  Avatar,
  Badge,
  Center,
  useMantineTheme,
  useMantineColorScheme,
  useComputedColorScheme,
  MANTINE_COLORS,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconSun,
  IconMoon,
  IconPalette,
  IconRocket,
  IconShield,
  IconBolt,
  IconChartBar,
  IconCode,
  IconCloud,
} from '@tabler/icons-react';

// 特性数据
const features = [
  { icon: IconRocket, title: '极速启动', desc: '冷启动 < 100ms，体验丝滑。', color: 'blue' },
  { icon: IconShield, title: '安全可靠', desc: '企业级加密，数据零泄露。', color: 'teal' },
  { icon: IconBolt, title: '高性能', desc: '毫秒级响应，万级并发。', color: 'orange' },
  { icon: IconChartBar, title: '数据驱动', desc: '可视化报表，决策有据。', color: 'grape' },
  { icon: IconCode, title: '开放 API', desc: '完整 SDK，灵活集成。', color: 'indigo' },
  { icon: IconCloud, title: '云端部署', desc: '一键上云，弹性扩容。', color: 'cyan' },
];

export default function LandingPage() {
  // === 主题相关 ===
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  });
  const isDark = computedColorScheme === 'dark';
  const theme = useMantineTheme();

  // 主题色：用 useState 维护，下文用 CSS 变量覆盖
  const [primaryColor, setPrimaryColor] = useState('blue');

  // === 移动端菜单 ===
  const [opened, { toggle }] = useDisclosure(false);

  // === 主题色选择菜单 ===
  const [paletteOpened, { toggle: togglePalette }] = useDisclosure(false);

  // 暴露给 CSS 的变量（动态主色）
  const cssVariables = {
    '--app-primary-color': theme.colors[primaryColor][6],
    '--app-primary-color-light': theme.colors[primaryColor][0],
  };

  return (
    <Box style={cssVariables}>
      <AppShell header={{ height: 64 }} padding={0}>
        {/* === 顶部导航 === */}
        <AppShellHeader>
          <Container size="lg" h="100%" fluid>
            <Group h="100%" justify="space-between">
              <Group gap="sm">
                <Burger
                  opened={opened}
                  onClick={toggle}
                  hiddenFrom="sm"
                  size="sm"
                />
                <Avatar color="blue" variant="filled">🚀</Avatar>
                <Title order={4} visibleFrom="sm">RocketApp</Title>
              </Group>

              {/* 桌面端菜单 */}
              <Group gap="md" visibleFrom="sm">
                <Button variant="subtle" size="sm">产品</Button>
                <Button variant="subtle" size="sm">价格</Button>
                <Button variant="subtle" size="sm">文档</Button>
              </Group>

              <Group gap="xs">
                {/* 主题色选择器 */}
                <Menu
                  opened={paletteOpened}
                  onClose={togglePalette}
                  position="bottom-end"
                  shadow="md"
                  width={200}
                >
                  <Menu.Target>
                    <ActionIcon variant="default" size="lg" onClick={togglePalette} aria-label="主题色">
                      <IconPalette size={18} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>选择主题色</Menu.Label>
                    {/* 用 SimpleGrid 把 30 种颜色排成网格 */}
                    <SimpleGrid cols={6} spacing="xs" p="xs">
                      {MANTINE_COLORS.slice(0, 12).map((color) => (
                        <Box
                          key={color}
                          onClick={() => setPrimaryColor(color)}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            cursor: 'pointer',
                            background: theme.colors[color][6],
                            border: primaryColor === color ? '2px solid black' : 'none',
                          }}
                        />
                      ))}
                    </SimpleGrid>
                  </Menu.Dropdown>
                </Menu>

                {/* 暗/亮切换 */}
                <ActionIcon
                  variant="default"
                  size="lg"
                  onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
                  aria-label="切换主题"
                >
                  {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
                </ActionIcon>

                <Button size="sm" visibleFrom="sm" style={{ background: 'var(--app-primary-color)' }}>
                  免费试用
                </Button>
              </Group>
            </Group>
          </Container>
        </AppShellHeader>

        {/* === 移动端菜单（抽屉式） === */}
        {opened && (
          <Box
            hiddenFrom="sm"
            p="md"
            bg={isDark ? theme.colors.dark[7] : theme.colors.gray[0]}
            style={{ borderBottom: '1px solid ' + (isDark ? theme.colors.dark[5] : theme.colors.gray[2]) }}
          >
            <Stack>
              <Button variant="subtle" justify="flex-start">产品</Button>
              <Button variant="subtle" justify="flex-start">价格</Button>
              <Button variant="subtle" justify="flex-start">文档</Button>
              <Button fullWidth style={{ background: 'var(--app-primary-color)' }}>免费试用</Button>
            </Stack>
          </Box>
        )}

        {/* === 主内容 === */}
        <AppShellMain>
          {/* Hero 区 */}
          <Container size="lg" py={{ base: 40, sm: 80 }}>
            <Stack align="center" gap="md" ta="center">
              <Badge variant="light" color={primaryColor} size="lg">
                ✨ 全新 v2.0 发布
              </Badge>
              <Title
                order={1}
                size={{ base: 32, sm: 48, md: 64 }}
                style={{ background: 'var(--app-primary-color)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                让开发更简单
              </Title>
              <Text size="lg" c="dimmed" maw={600}>
                一站式 SaaS 平台，集部署、监控、扩展于一体。
                从创业到上市，全程陪伴。
              </Text>
              <Group mt="md">
                <Button size="lg" style={{ background: 'var(--app-primary-color)' }}>
                  立即开始
                </Button>
                <Button size="lg" variant="default">查看文档</Button>
              </Group>
            </Stack>
          </Container>

          {/* 特性卡片 Grid */}
          <Container size="lg" py={{ base: 40, sm: 80 }}>
            <Stack align="center" gap="xl">
              <Title order={2}>为什么选择我们</Title>
              <Text c="dimmed" ta="center" maw={500}>
                六大核心能力，覆盖你的所有需求
              </Text>

              {/* SimpleGrid：响应式栅格
                  cols={{ base: 1, sm: 2, md: 3 }}
                  手机 1 列、平板 2 列、桌面 3 列 */}
              <SimpleGrid
                cols={{ base: 1, sm: 2, md: 3 }}
                spacing="lg"
                w="100%"
              >
                {features.map((f) => {
                  const Icon = f.icon;
                  return (
                    <Card key={f.title} shadow="sm" padding="lg" radius="md" withBorder>
                      <Stack gap="sm">
                        <ThemeIcon size={48} radius="md" color={f.color} variant="light">
                          <Icon size={24} />
                        </ThemeIcon>
                        <Title order={4}>{f.title}</Title>
                        <Text size="sm" c="dimmed">{f.desc}</Text>
                      </Stack>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Stack>
          </Container>

          {/* CTA 区 */}
          <Container size="lg" py={{ base: 40, sm: 80 }}>
            <Card
              padding={{ base: 30, sm: 50 }}
              radius="lg"
              style={{ background: 'var(--app-primary-color)' }}
            >
              <Stack align="center" gap="md" ta="center">
                <Title order={2} c="white">准备好开始了吗？</Title>
                <Text c="white" opacity={0.9}>
                  14 天免费试用，无需信用卡
                </Text>
                <Button size="lg" color="dark">立即注册</Button>
              </Stack>
            </Card>
          </Container>

          {/* Footer */}
          <Box bg={isDark ? theme.colors.dark[8] : theme.colors.gray[1]} py={30} mt={40}>
            <Container size="lg">
              <Grid>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Group gap="sm">
                    <Avatar color="blue" variant="filled">🚀</Avatar>
                    <Title order={5">RocketApp</Title>
                  </Group>
                  <Text size="sm" c="dimmed" mt="sm">让开发更简单</Text>
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 2 }}>
                  <Stack gap="xs">
                    <Text size="sm" fw={700}>产品</Text>
                    <Text size="sm" c="dimmed">功能</Text>
                    <Text size="sm" c="dimmed">价格</Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 2 }}>
                  <Stack gap="xs">
                    <Text size="sm" fw={700}>公司</Text>
                    <Text size="sm" c="dimmed">关于</Text>
                    <Text size="sm" c="dimmed">博客</Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 2 }}>
                  <Stack gap="xs">
                    <Text size="sm" fw={700}>资源</Text>
                    <Text size="sm" c="dimmed">文档</Text>
                    <Text size="sm" c="dimmed">API</Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 2 }}>
                  <Stack gap="xs">
                    <Text size="sm" fw={700}>法律</Text>
                    <Text size="sm" c="dimmed">隐私</Text>
                    <Text size="sm" c="dimmed">条款</Text>
                  </Stack>
                </Grid.Col>
              </Grid>
              <Text size="xs" c="dimmed" ta="center" mt={30}>
                © 2026 RocketApp. All rights reserved.
              </Text>
            </Container>
          </Box>
        </AppShellMain>
      </AppShell>
    </Box>
  );
}
\`\`\`

---

## 四、关键点解析

### 1. 暗色模式怎么持久化的？

\`useMantineColorScheme\` 内部自动把值写入 \`localStorage\`，**不用自己写 useEffect**。刷新页面时 \`ColorSchemeScript\` 读取并立即应用（防闪烁，见第 4 章）。

### 2. 主题色动态切换的两种方式

**方式 A（推荐，本例用）：CSS 变量覆盖**

\`\`\`js
const cssVariables = {
  '--app-primary-color': theme.colors[primaryColor][6],
};
<Box style={cssVariables}>
  <Button style={{ background: 'var(--app-primary-color)' }}>按钮</Button>
</Box>
\`\`\`

不用重新挂载组件，性能最好。

**方式 B：强制 MantineProvider 重渲染**

\`\`\`jsx
// 把 theme 作为 state，改 primaryColor 后用 key 强制刷新
<MantineProvider theme={theme} key={primaryColor}>
\`\`\`

简单粗暴，但所有组件会重新挂载（状态丢失），不推荐用于复杂场景。

### 3. 响应式断点

Mantine 默认断点：

\`\`\`
xs: 36em (576px)
sm: 48em (768px)
md: 62em (992px)
lg: 75em (1200px)
xl: 88em (1400px)
\`\`\`

响应式 props 用法：

\`\`\`jsx
// 1. 数值型：对象形式
<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>

// 2. 显示控制
<Box visibleFrom="sm">  // sm 以上显示
<Box hiddenFrom="md">   // md 以下显示
\`\`\`

### 4. 移动端 Burger 菜单

\`\`\`js
const [opened, { toggle }] = useDisclosure(false);
\`\`\`

点击 Burger 切换 \`opened\`，条件渲染下拉菜单。生产环境推荐用 \`Drawer\` 组件替代，体验更好。

---

## 小结

| 功能 | 实现方式 |
| --- | --- |
| 暗色切换 | \`useMantineColorScheme\` + \`useComputedColorScheme\` |
| 持久化 | Mantine 自动写 localStorage + ColorSchemeScript |
| 主题色动态切换 | CSS 变量 + style 注入 |
| 响应式 Grid | \`SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}\` |
| 移动端菜单 | Burger + useDisclosure + visibleFrom/hiddenFrom |
| 渐变文字 | \`WebkitBackgroundClip: 'text'\` + \`WebkitTextFillColor: 'transparent'\` |

下一章我们关注性能优化与最佳实践。`,
  },

  // ============================================================
  // 第四十七章 性能优化与最佳实践
  // ============================================================
  {
    id: 'mantine2-ch47',
    group: '第十部分 Hooks 与实战',
    icon: '⚡',
    title: '第四十七章 性能优化与最佳实践',
    content: `## 一句话目标

掌握 Mantine 应用的性能优化套路——从打包体积、渲染性能、表单性能，到无障碍最佳实践，让你的应用快得不像 React 写的。

---

## 一、组件按需引入（tree-shaking）

Mantine 默认支持 tree-shaking，**只打包你真正用到的组件**：

\`\`\`jsx
// ✅ 好的写法：具名引入，按需打包
import { Button, TextInput, Modal } from '@mantine/core';

// ❌ 反模式：全量引入，打包体积爆炸
import * as Mantine from '@mantine/core';
const { Button } = Mantine;
\`\`\`

但 tree-shaking 依赖现代打包器（Webpack 5+、esbuild、Rollup）。如果你用旧版 Webpack 4，需要配 \`babel-plugin-import\` 或换打包器。

**验证是否生效**：

\`\`\`bash
# 分析打包体积
npm install -g webpack-bundle-analyzer
ANALYZE=true npm run build
\`\`\`

如果看到 \`@mantine/core\` 整个被打进来（而不是只有 Button），说明 tree-shaking 没生效。

---

## 二、动态导入大组件（next/dynamic）

日期选择器、富文本编辑器等组件体积大且首屏用不到，用 \`next/dynamic\` 懒加载：

\`\`\`jsx
// app/page.js
'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@mantine/core';

// 1. 普通引入：DatePicker 会进首屏 bundle
// import { DatePicker } from '@mantine/dates';

// 2. 动态引入：用到时才加载
const DatePicker = dynamic(
  () => import('@mantine/dates').then((mod) => mod.DatePicker),
  {
    // loading：加载时显示骨架屏
    loading: () => <div style={{ height: 36, background: '#eee' }} />,
    ssr: false, // 关闭 SSR（如果组件依赖 window）
  }
);

export default function Demo() {
  const [show, setShow] = useState(false);

  return (
    <div>
      <Button onClick={() => setShow(true)}>打开日期选择器</Button>
      {show && <DatePicker />}
    </div>
  );
}
\`\`\`

> ⭐ 适用场景：地图组件、图表库（Recharts）、Markdown 编辑器、视频播放器——首屏不需要的都该懒加载。

---

## 三、useMemo / useCallback 配合

避免每次渲染都创建新对象/函数，触发不必要的子组件重渲染：

\`\`\`jsx
'use client';
import { useMemo, useCallback, useState } from 'react';
import { Button, Table, TextInput } from '@mantine/core';

// 假设这是一个很重的子组件
const HeavyRow = function HeavyRow({ user, onEdit }) {
  console.log('HeavyRow 渲染了:', user.id);
  return (
    <Table.Tr>
      <Table.Td>{user.name}</Table.Td>
      <Table.Td>
        <Button size="xs" onClick={() => onEdit(user)}>编辑</Button>
      </Table.Td>
    </Table.Tr>
  );
};

export default function UserList() {
  const [keyword, setKeyword] = useState('');
  const [users, setUsers] = useState([
    { id: 1, name: '张三' },
    { id: 2, name: '李四' },
  ]);

  // ✅ useMemo：过滤结果缓存
  // 依赖 keyword 和 users，只有它们变了才重新计算
  const filteredUsers = useMemo(
    () => users.filter((u) => u.name.includes(keyword)),
    [users, keyword]
  );

  // ✅ useCallback：函数引用稳定
  // 没有这个的话，每次重渲染 onEdit 都是新函数，子组件 memo 失效
  const handleEdit = useCallback((user) => {
    console.log('编辑', user);
  }, []);

  return (
    <div>
      <TextInput
        placeholder="搜索"
        value={keyword}
        onChange={(e) => setKeyword(e.currentTarget.value)}
      />
      <Table>
        <Table.Tbody>
          {filteredUsers.map((u) => (
            <HeavyRow key={u.id} user={u} onEdit={handleEdit} />
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}
\`\`\`

> ⭐ **心法**：\`useMemo\`/\`useCallback\` 配合 \`React.memo\` 才有意义——单独用没效果。但**不要滥用**：简单组件不需要 memo，优化反而更慢。

---

## 四、表单性能：uncontrolled 模式

\`useForm\` 的 \`mode: 'uncontrolled'\` 是 v9 推荐模式：

\`\`\`jsx
const form = useForm({
  mode: 'uncontrolled', // ✅ 推荐
  initialValues: { name: '', email: '' },
});
\`\`\`

**为什么 uncontrolled 快？**

- **controlled 模式**：每次按键都 setState → 整个表单重渲染 → 10 个字段就重渲染 10 次
- **uncontrolled 模式**：值存在 ref 里，按键只更新 ref → 不触发重渲染

实测：50 个字段的表单，controlled 模式打字有明显延迟，uncontrolled 流畅。

\`\`\`jsx
// 关键写法：key={form.key('xxx')} 不能省
<TextInput
  key={form.key('name')}  // ✅ 必须写
  {...form.getInputProps('name')}
/>
\`\`\`

\`form.key\` 返回一个稳定 key，让 React 在初始化/重置时正确处理 uncontrolled 字段。

---

## 五、避免不必要的 Provider 嵌套

\`\`\`jsx
// ❌ 反模式：每个页面都包一层 MantineProvider
function Page() {
  return (
    <MantineProvider>
      <Content />
    </MantineProvider>
  );
}

// ✅ 正确：MantineProvider 放根 layout.js，所有页面共用
// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <MantineProvider>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
\`\`\`

多次嵌套会导致：
- 多套 CSS 变量注入（重复样式）
- 多个 ColorScheme 上下文（互相覆盖）
- 主题切换失效

---

## 六、CSS 变量性能优势

Mantine v9 大量用 CSS 变量驱动样式，比 v6 的 Emotion 运行时快得多：

\`\`\`jsx
// ✅ 优先用 style props（编译成 CSS 变量）
<Box bg="blue.6" c="white" p="md">快</Box>

// ❌ 避免 sx prop + Emotion 运行时（v9 仍支持但慢）
<Box sx={(theme) => ({ background: theme.colors.blue[6] })}>慢</Box>

// ⚠️ style props 写法（中等性能，简单场景可用）
<Box style={{ background: 'var(--mantine-color-blue-6)' }}>中</Box>
\`\`\`

---

## 七、图片优化：Image 组件

Mantine 的 \`Image\` 组件配合 Next.js \`next/image\` 用：

\`\`\`jsx
'use client';
import { Image } from '@mantine/core';

export default function Demo() {
  return (
    // 1. 直接用 Mantine Image（简单场景）
    <Image
      src="/hero.jpg"
      alt="Hero"
      w={400}
      h={300}
      fit="cover"
      radius="md"
    />
  );
}

// 2. 性能优先：用 next/image，Mantine Image 包一层做样式
import NextImage from 'next/image';
import { Box } from '@mantine/core';

export function OptimizedImage() {
  return (
    <Box w={400} h={300} radius="md" style={{ overflow: 'hidden' }}>
      <NextImage
        src="/hero.jpg"
        alt="Hero"
        width={400}
        height={300}
        priority // 首屏图加 priority
      />
    </Box>
  );
}
\`\`\`

> ⭐ \`next/image\` 自动生成 WebP/AVIF、按设备分辨率自适应、懒加载——比裸 \`<img>\` 强 10 倍。

---

## 八、无障碍最佳实践

### 1. 所有可交互元素必须有 aria-label

\`\`\`jsx
// ❌ 反模式：图标按钮没文字，屏幕阅读器读不出
<ActionIcon onClick={toggle}>
  <IconSun />
</ActionIcon>

// ✅ 正确：加 aria-label
<ActionIcon onClick={toggle} aria-label="切换主题">
  <IconSun />
</ActionIcon>
\`\`\`

### 2. 表单字段必须有 label

\`\`\`jsx
// ❌ 反模式：只有 placeholder，屏幕阅读器读不出
<TextInput placeholder="邮箱" />

// ✅ 正确：有 label（或用 aria-label）
<TextInput label="邮箱" placeholder="you@example.com" />

// 或用 aria-label（视觉上不要 label 时）
<TextInput aria-label="邮箱" placeholder="you@example.com" />
\`\`\`

### 3. Modal/Drawer 必须 trap focus

Mantine 的 \`Modal\` / \`Drawer\` 默认开启 focus trap——Tab 键不会跑到外面。**不要禁用它**：

\`\`\`jsx
// ❌ 反模式
<Modal trapFocus={false}>...</Modal>

// ✅ 正确：保持默认
<Modal>...</Modal>
\`\`\`

### 4. 装饰性图标用 aria-hidden

\`\`\`jsx
<Button>
  <IconDownload aria-hidden /> {/* 装饰性，屏幕阅读器跳过 */}
  下载
</Button>
\`\`\`

---

## 九、常见反模式

### 1. 把组件当字符串拼

\`\`\`jsx
// ❌ 反模式
const content = someCondition ? '<Button>OK</Button>' : '';
return <div dangerouslySetInnerHTML={{ __html: content }} />;

// ✅ 正确
return <div>{someCondition ? <Button>OK</Button> : null}</div>;
\`\`\`

### 2. 在 render 里创建组件

\`\`\`jsx
// ❌ 反模式：每次渲染都创建新组件，状态全丢
function Bad() {
  const InnerComponent = () => <div>Inner</div>;
  return <InnerComponent />;
}

// ✅ 正确：提到外面
function InnerComponent() {
  return <div>Inner</div>;
}
function Good() {
  return <InnerComponent />;
}
\`\`\`

### 3. 不必要的全局状态

\`\`\`jsx
// ❌ 反模式：父组件用 useState 存所有字段，每次按键都重渲染整页
function Bad() {
  const [form, setForm] = useState({ name: '', email: '', age: '', ... });
  return <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />;
}

// ✅ 正确：用 useForm uncontrolled 模式
function Good() {
  const form = useForm({ mode: 'uncontrolled', initialValues: {...} });
  return <TextInput key={form.key('name')} {...form.getInputProps('name')} />;
}
\`\`\`

### 4. 过度使用 Provider

\`\`\`jsx
// ❌ 反模式：每个 Modal 都加一层 Notifications Provider
<Notifications>
  <Modal />
</Notifications>

// ✅ 正确：根 layout 加一次，全局共用
// app/layout.js
<MantineProvider>
  <Notifications />
  {children}
</MantineProvider>
\`\`\`

---

## 十、性能检测清单

部署前自检：

- [ ] Lighthouse Performance > 90
- [ ] 首屏 bundle < 200KB（gzip）
- [ ] 大组件用 \`next/dynamic\` 懒加载
- [ ] 图片用 \`next/image\` 优化
- [ ] 表单用 \`mode: 'uncontrolled'\`
- [ ] 关键交互响应 < 100ms
- [ ] 所有图标按钮有 \`aria-label\`
- [ ] 暗色模式无闪烁

---

## 小结

| 优化点 | 方法 |
| --- | --- |
| 打包体积 | tree-shaking + next/dynamic |
| 渲染性能 | useMemo + useCallback + React.memo |
| 表单性能 | useForm mode='uncontrolled' |
| 图片性能 | next/image + WebP/AVIF |
| CSS 性能 | 用 style props，避免 sx |
| 无障碍 | aria-label + label + focus trap |
| 防止反模式 | 不要在 render 里建组件 |

下一章我们讲 Mantine 与 Next.js App Router 的深度集成。`,
  },

  // ============================================================
  // 第四十八章 Next.js 集成与 SSR
  // ============================================================
  {
    id: 'mantine2-ch48',
    group: '第十部分 Hooks 与实战',
    icon: '🔧',
    title: '第四十八章 Next.js 集成与 SSR',
    content: `## 一句话目标

把 Mantine 正确接入 Next.js 16 App Router——搞定 SSR 配置、防闪烁、'use client' 使用时机、静态导出注意事项，拿到一份可直接套用的 \`layout.js\` 模板。

---

## 一、为什么 Next.js 集成有坑

Next.js App Router 默认是**服务端组件（RSC）**，而 Mantine 大量组件依赖客户端 hooks（useState、useEffect）。

直接在 RSC 里用 Mantine 组件会报错：

\`\`\`
Error: createContext only works in Client Components
\`\`\`

所以集成时要注意：

1. **CSS 怎么引**（不能在 RSC 里 import？其实可以）
2. **哪些组件要 'use client'**
3. **怎么防 SSR 闪烁**
4. **怎么处理 window/document 未定义**

---

## 二、完整 layout.js 模板

直接复制可用：

\`\`\`jsx
// app/layout.js
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';        // 用了日期组件才加
import '@mantine/notifications/styles.css'; // 用了通知才加

import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

// metadata：Next.js 16 推荐用 generateMetadata 或静态导出
export const metadata = {
  title: 'My Mantine App',
  description: 'Built with Mantine v9 + Next.js 16',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        {/* ColorSchemeScript：在 hydration 前注入颜色方案，
            防止暗色模式用户刷新时闪烁。
            必须放 head 里、MantineProvider 外。
            defaultColorScheme：'light' | 'dark' | 'auto' */}
        <ColorSchemeScript defaultColorScheme="light" />

        {/* 自定义字体（可选） */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        {/* MantineProvider：包所有内容
            注意：MantineProvider 在 layout.js（Server Component）里可以用，
            因为它本身不调用 useState/useEffect，只是注入 Context。 */}
        <MantineProvider defaultColorScheme="light">
          {/* Notifications 也放这里，全局可用 */}
          <Notifications position="top-right" />

          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
\`\`\`

> ⭐ **关键点**：\`layout.js\` 本身**不需要** \`'use client'\`。MantineProvider 可以在 Server Component 里渲染——它只是 Context Provider，没用到客户端 hooks。

---

## 三、'use client' 使用时机

| 场景 | 是否要 'use client' |
| --- | --- |
| 直接渲染 \`<Button>\` 不带事件 | 不需要 |
| \`<Button onClick={...}>\` | 需要 |
| 用 \`useState\` / \`useEffect\` | 需要 |
| 用 \`useForm\` | 需要 |
| 用 \`useDisclosure\` 等 hooks | 需要 |
| 用 \`useMantineColorScheme\` | 需要 |
| 静态展示页面（无交互） | 不需要 |

**实战心法**：从「不需要」开始，遇到报错再加 \`'use client'\`。

### 反例：过度使用 'use client'

\`\`\`jsx
// ❌ 反模式：整页都标 'use client'，失去 SSR 优势
'use client';
export default function StaticPage() {
  return (
    <div>
      <Title>About Us</Title>
      <Text>我们是...</Text>
    </div>
  );
}

// ✅ 正确：静态页面不加，让 Next.js 静态生成
export default function StaticPage() {
  return (
    <div>
      <Title>About Us</Title>
      <Text>我们是...</Text>
    </div>
  );
}
\`\`\`

### 拆分策略：Server + Client 混合

\`\`\`jsx
// app/products/page.js（Server Component，默认）
import { getProductList } from '@/lib/api';
import { ProductList } from './ProductList'; // Client Component

export default async function Page() {
  // 服务端取数据，无 'use client'
  const products = await getProductList();

  // 把数据传给客户端组件渲染交互
  return <ProductList products={products} />;
}

// app/products/ProductList.js
'use client'; // 这里有交互，标 client
import { useState } from 'react';
import { Card, Button } from '@mantine/core';

export function ProductList({ products }) {
  const [filter, setFilter] = useState('');
  // ... 客户端交互逻辑
}
\`\`\`

---

## 四、ColorSchemeScript 防 SSR 闪烁

第 4 章讲过原理，这里再强调配置：

\`\`\`jsx
<head>
  <ColorSchemeScript
    defaultColorScheme="light"
    // localStorageKey：默认 'color-scheme'，可自定义
    localStorageKey="my-app-color-scheme"
    // forceSameLayoutInEffect：保持 hydration 前后 DOM 一致
  />
</head>
\`\`\`

**自定义 localStorageKey 的场景**：多个 Mantine 应用共用一个域名时，避免 key 冲突。

**工作原理再回顾**：

1. 服务端渲染时，\`ColorSchemeScript\` 注入一段内联 JS
2. 这段 JS 在 React 执行前同步运行
3. 读 localStorage，给 \`<html>\` 设置 \`data-mantine-color-scheme="dark"\`
4. Mantine 的 CSS 基于 \`[data-mantine-color-scheme]\` 选择器，立即生效
5. React hydration 时颜色已对，无闪烁

---

## 五、SSR 注意事项：window/document 未定义

服务端没有 \`window\` 和 \`document\`，直接访问会报错：

\`\`\`
ReferenceError: window is not defined
\`\`\`

### 1. 用 useMounted 或 useEffect 判断

\`\`\`jsx
'use client';
import { useEffect, useState } from 'react';
import { useViewportSize } from '@mantine/hooks';

export default function Demo() {
  const [mounted, setMounted] = useState(false);
  const { width } = useViewportSize();

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR 时返回占位，hydration 后才返回真实值
  if (!mounted) return <div>加载中...</div>;

  return <div>视口宽度：{width}</div>;
}
\`\`\`

### 2. useMediaQuery 的 SSR 处理

\`useMediaQuery\` 内部已经处理了 SSR，首次渲染返回 \`false\`，hydration 后才更新。但可能造成「移动端先显示桌面布局，再切回移动」的闪烁。

解决：用 CSS 媒体查询代替 JS 判断，能 CSS 解决就别用 JS：

\`\`\`jsx
// ❌ 反模式：用 JS 判断设备
const isMobile = useMediaQuery('(max-width: 768px)');
return isMobile ? <MobileLayout /> : <DesktopLayout />;

// ✅ 正确：用 visibleFrom / hiddenFrom
import { Box } from '@mantine/core';
return (
  <>
    <Box visibleFrom="sm"><DesktopLayout /></Box>
    <Box hiddenFrom="sm"><MobileLayout /></Box>
  </>
);
\`\`\`

\`visibleFrom\` / \`hiddenFrom\` 用 CSS \`display\` 控制，SSR 不会闪烁。

---

## 六、useMantineColorScheme 与 next-themes 对比

\`next-themes\` 是 Next.js 生态最流行的主题切换库，对比：

| 维度 | Mantine 内置 | next-themes |
| --- | --- | --- |
| 集成成本 | 0（MantineProvider 已带） | 中（额外装包+配置） |
| CSS 变量 | 自动注入全套 | 需手动定义 |
| 组件联动 | Mantine 组件自动响应 | 需自己写 |
| 跨组件库 | 仅 Mantine | 任意（Tailwind 等） |
| SSR 防闪烁 | ColorSchemeScript 内置 | 自带 |
| 持久化 | 自动 localStorage | 自动 localStorage |
| 系统 preference | 支持 \`auto\` | 支持 \`system\` |

**建议**：

- **纯 Mantine 项目**：用 \`useMantineColorScheme\`，零配置。
- **Mantine + Tailwind 混用**：用 \`next-themes\`，统一管理。
- **多套 UI 库混用**：用 \`next-themes\`，避免多套机制打架。

### Mantine + next-themes 集成（混合方案）

\`\`\`jsx
// app/layout.js
import { ThemeProvider } from 'next-themes';
import { MantineProvider, useProps } from '@mantine/core';
import { useTheme } from 'next-themes';

// 包装一层：让 Mantine 跟随 next-themes
function MantineWithNextTheme({ children }) {
  const { resolvedTheme } = useTheme();
  return (
    <MantineProvider forceColorScheme={resolvedTheme}>
      {children}
    </MantineProvider>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system">
          <MantineWithNextTheme>
            {children}
          </MantineWithNextTheme>
        </ThemeProvider>
      </body>
    </html>
  );
}
\`\`\`

> ⭐ \`forceColorScheme\` 是 v9 新增 prop，强制 Mantine 用某个颜色方案（不读自己的 localStorage）。配合 next-themes 时用这个。

---

## 七、静态导出（next export）注意事项

如果用 \`next build && next export\`（或 \`output: 'export'\`）生成纯静态站点：

\`\`\`js
// next.config.js
const nextConfig = {
  output: 'export',
  // 静态导出时图片要禁用优化
  images: { unoptimized: true },
};
module.exports = nextConfig;
\`\`\`

**注意事项**：

1. **不能用动态路由的 \`generateStaticParams\` 之外的服务端 API**（如 cookies、headers）
2. **ColorSchemeScript 仍可用**（它是客户端 JS）
3. **暗色模式仍可用**（基于 localStorage）
4. **不能 SSR 的组件**要加 \`ssr: false\`：

\`\`\`jsx
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('./MyComponent'), {
  ssr: false, // 静态导出时禁用 SSR
});
\`\`\`

---

## 八、部署到 Vercel / 自托管

### Vercel（推荐）

零配置部署：

\`\`\`bash
# 1. 推到 GitHub
git push origin main

# 2. 在 Vercel 导入项目
# Vercel 自动识别 Next.js，无需配置
\`\`\`

注意事项：
- Mantine 的 CSS 文件是预编译的，Vercel 会自动 CDN 加速
- 设置环境变量时，记得客户端变量要加 \`NEXT_PUBLIC_\` 前缀

### 自托管（Node server）

\`\`\`bash
# 1. 构建
npm run build

# 2. 启动
npm start

# 或用 PM2 守护
pm2 start npm --name "my-app" -- start
\`\`\`

### Docker 部署

\`\`\`dockerfile
# Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

---

## 九、常见报错排查

### 1. \`useContext must be used within a MantineProvider\`

\`\`\`
Error: MantineProvider was not found in the tree
\`\`\`

**原因**：用了 Mantine 组件但没包 MantineProvider。

**解决**：检查 \`layout.js\` 是否包了 \`<MantineProvider>\`。

### 2. \`createContext only works in Client Components\`

**原因**：在 Server Component 里用了客户端 hook（如 \`useDisclosure\`）。

**解决**：在该文件顶部加 \`'use client';\`。

### 3. 样式丢失（HTML 能渲染但完全没样式）

**原因**：忘了 \`import '@mantine/core/styles.css'\`。

**解决**：在 \`layout.js\` 顶部加上。

### 4. 暗色模式刷新闪烁

**原因**：忘了 \`<ColorSchemeScript />\` 或放错位置。

**解决**：放在 \`<head>\` 内、\`<MantineProvider>\` 外。

### 5. \`window is not defined\`

**原因**：在 SSR 时访问了 \`window\` 或 \`document\`。

**解决**：用 \`useEffect\` 包裹，或加 \`mounted\` 判断。

---

## 十、完整最小项目结构

\`\`\`
my-app/
├── app/
│   ├── layout.js          # MantineProvider + ColorSchemeScript
│   ├── page.js            # 首页（Server Component）
│   └── admin/
│       ├── page.js        # 后台首页
│       └── users/
│           ├── page.js    # 用户列表（Server Component，取数据）
│           └── UserTable.js # 'use client' 表格组件
├── components/
│   ├── ThemeToggle.js     # 'use client' 主题切换按钮
│   └── Navbar.js          # 导航栏
├── lib/
│   ├── api.js             # API 调用
│   └── theme.js           # createTheme 配置
├── package.json
└── next.config.js
\`\`\`

\`\`\`js
// lib/theme.js
import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'indigo',
  defaultRadius: 'md',
  fontFamily: 'Inter, system-ui, sans-serif',
});
\`\`\`

\`\`\`jsx
// app/layout.js
import '@mantine/core/styles.css';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { theme } from '@/lib/theme';

export const metadata = {
  title: 'My App',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
\`\`\`

---

## 小结

| 配置点 | 关键 |
| --- | --- |
| layout.js | 包 \`MantineProvider\` + \`ColorSchemeScript\` |
| 'use client' | 用到 hooks/事件才加 |
| CSS 引入 | \`import '@mantine/core/styles.css'\` |
| 防 SSR 闪烁 | \`<ColorSchemeScript />\` 放 head |
| window 未定义 | 用 \`useEffect\` + \`mounted\` 判断 |
| 响应式逻辑 | 优先用 \`visibleFrom\`/\`hiddenFrom\`（CSS） |
| next-themes 混用 | 用 \`forceColorScheme\` 同步 |
| 静态导出 | \`output: 'export'\` + \`images.unoptimized\` |
| Vercel | 零配置 |
| Docker | 多阶段构建 |

至此，Mantine 的所有核心知识讲完了。下一章是结语与进阶路线。`,
  },

  // ============================================================
  // 结语
  // ============================================================
  {
    id: 'mantine2-epilogue',
    group: '结尾',
    icon: '🎓',
    title: '结语与进阶路线',
    content: `## 一句话目标

回顾全书 48 章的核心脉络，了解 Mantine 完整生态，给出清晰的进阶学习路线与官方资源链接——读完这本，你已经能用 Mantine 搭出能上生产的后台系统了。

---

## 一、全书回顾

48 章，十大模块，覆盖 Mantine 日常开发的 100% 高频场景：

| 模块 | 章节 | 核心知识 |
| --- | --- | --- |
| 入门基础 | 第 1-4 章 | 安装、Button、主题、暗色模式 |
| 文本与排版 | 第 5-9 章 | Text、Title、List、Mark、Code |
| 布局组件 | 第 10-13 章 | Box、Stack、Group、Grid、Flex |
| 按钮与标识 | 第 14-17 章 | Button、ActionIcon、Badge、Indicator |
| 表单输入 | 第 18-24 章 | TextInput、Select、Slider、DatePicker |
| 表单进阶 | 第 25-27 章 | useForm、校验、动态字段 |
| 反馈与覆盖层 | 第 28-32 章 | Modal、Drawer、Popover、Alert、Skeleton |
| 导航与数据展示 | 第 33-38 章 | AppShell、Tabs、Table、Card、Timeline |
| 主题与样式定制 | 第 39-42 章 | createTheme、style props、vars |
| Hooks 与实战 | 第 43-48 章 | Hooks 大全、Notifications、实战案例 |

### 五个最该记住的核心点

1. **props 体系**：\`variant\` + \`color\` + \`size\` 三个 prop 控制绝大多数组件样式。
2. **CSS 变量驱动**：Mantine v9 改用 CSS 变量，性能好、SSR 友好、暗色模式零成本。
3. **useForm uncontrolled 模式**：大表单性能的关键。
4. **MantineProvider + ColorSchemeScript**：Next.js 集成必备。
5. **Hooks 大全**：50+ hooks 替代 80% 的第三方工具库。

---

## 二、Mantine 完整生态

Mantine 不只是 \`@mantine/core\`，还有一系列官方包，每个都精雕细琢：

| 包名 | 用途 | 是否常用 |
| --- | --- | --- |
| \`@mantine/core\` | 核心组件（80+） | ⭐⭐⭐⭐⭐ |
| \`@mantine/hooks\` | 实用 hooks（50+） | ⭐⭐⭐⭐⭐ |
| \`@mantine/form\` | 表单管理 useForm | ⭐⭐⭐⭐⭐ |
| \`@mantine/notifications\` | 通知系统 | ⭐⭐⭐⭐ |
| \`@mantine/dates\` | 日期选择器（基于 dayjs） | ⭐⭐⭐⭐ |
| \`@mantine/modals\` | 命令式 Modal 管理 | ⭐⭐⭐ |
| \`@mantine/dropzone\` | 文件拖拽上传 | ⭐⭐⭐ |
| \`@mantine/carousel\` | 轮播图（基于 Embla） | ⭐⭐⭐ |
| \`@mantine/prism\` | 代码高亮（基于 Prism） | ⭐⭐ |
| \`@mantine/spotlight\` | 命令面板（Cmd+K 搜索） | ⭐⭐ |
| \`@mantine/tiptap\` | 富文本编辑器（基于 Tiptap） | ⭐⭐ |
| \`@mantine/code-highlight\` | 代码高亮（v9 替代 Prism） | ⭐⭐ |

### 没讲但值得学的

#### @mantine/modals：命令式 Modal

不用每次写 \`useState\` + \`<Modal>\`，直接 \`openModal()\`：

\`\`\`jsx
import { openConfirmModal } from '@mantine/modals';

const handleDelete = () => {
  openConfirmModal({
    title: '确认删除',
    children: <Text>这个操作不可撤销，确定删除？</Text>,
    labels: { confirm: '删除', cancel: '取消' },
    confirmProps: { color: 'red' },
    onConfirm: () => api.deleteUser(id),
  });
};
\`\`\`

#### @mantine/spotlight：Cmd+K 命令面板

像 VS Code / Raycast 那样的快捷搜索：

\`\`\`jsx
import { Spotlight } from '@mantine/spotlight';

function App() {
  return (
    <>
      <Spotlight
        actions={[
          { id: 'home', label: '首页', onClick: () => router.push('/') },
          { id: 'settings', label: '设置', onClick: () => router.push('/settings') },
        ]}
        nothingFound="无匹配"
        shortcut={['mod+k']}
      />
    </>
  );
}
\`\`\`

#### @mantine/carousel：响应式轮播

\`\`\`jsx
import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';

<Carousel slideSize="70%" slideGap="md" loop>
  <Carousel.Slide>1</Carousel.Slide>
  <Carousel.Slide>2</Carousel.Slide>
  <Carousel.Slide>3</Carousel.Slide>
</Carousel>
\`\`\`

---

## 三、进阶学习路线

### 阶段 1：把这本教程的代码全部敲一遍（1-2 周）

- 48 章每章的 demo 都跑通
- 把第 45 章「用户管理后台」改成你自己的业务（订单管理、商品管理都行）

### 阶段 2：学官方未讲的高级特性（1 周）

- **Mantine Provider 嵌套**：多套主题并存（适合白标 SaaS）
- **CSS Layers**：和 Tailwind 等 CSS 框架混用时避免冲突
- **Server Components 集成**：拆分 Server / Client 边界的最佳实践
- **自定义组件库**：用 Mantine 二次封装自己公司的设计系统

### 阶段 3：扩展生态（1-2 周）

- **@mantine/modals**：替代 useState + Modal 的命令式 API
- **@mantine/spotlight**：实现 Notion / Linear 风格的 Cmd+K
- **@mantine/dropzone**：实现图片上传 + 预览
- **@mantine/carousel**：响应式轮播图
- **@mantine/tiptap**：集成富文本编辑器

### 阶段 4：性能与工程化（持续）

- Lighthouse 评分 > 90
- 单元测试：\`@mantine/core\` 组件配合 \`@testing-library/react\`
- Storybook 集成：搭组件文档站
- 视觉回归测试：Chromatic / Percy

### 阶段 5：源码阅读（可选）

Mantine 源码是 React 组件库的**最佳实践范本**：

- \`packages/@mantine/core/src/components/Button/\` 看一个组件怎么写
- \`packages/@mantine/core/src/core/\` 看 MantineProvider、CSS 变量注入怎么实现
- \`packages/@mantine/hooks/src/\` 看每个 hook 怎么实现的

---

## 四、官方资源链接

| 资源 | 链接 |
| --- | --- |
| 官方文档 | https://mantine.dev/ |
| GitHub 仓库 | https://github.com/mantinedev/mantine |
| Discord 社区 | https://discord.gg/wbZzM4qQ |
| 官方示例 | https://github.com/mantinedev/mantine-examples |
| 更新日志 | https://github.com/mantinedev/mantine/releases |
| Twitter | https://twitter.com/mantinedev |
| 模板项目 | https://github.com/mantinedev/nextjs-template |
| 主题生成器 | https://mantine.dev/colors-generator/ |
| 图标库 | https://tabler.io/icons |

### 推荐博客与视频

- **Mantine 官方博客**：发布新版本特性解读
- **Vitaly Rtishchev（作者）的 Twitter**：第一时间更新动态
- **YouTube**：搜 "Mantine tutorial" 有不少英文教程

---

## 五、最后的话

读完这本教程，你已经具备：

- ✅ 用 Mantine 搭出**完整后台系统**的能力
- ✅ 处理**表单、表格、弹窗、通知**等高频场景
- ✅ 做出**响应式 + 暗色模式**的现代化界面
- ✅ 在 **Next.js App Router** 里正确集成 Mantine
- ✅ 识别并避免**常见反模式**

但记住——**会用组件库只是起点**，真正拉开差距的是：

- **业务理解**：知道用户要什么，而不是堆组件
- **设计感**：能判断一个界面好不好看，知道怎么改
- **性能意识**：每个 \`useMemo\` 都该有理由，不要为优化而优化
- **工程化思维**：组件复用、状态管理、模块边界

这些靠练习、靠看优秀项目、靠时间积累。

---

> 🎓 **下一步**：合上这本书，打开编辑器，**做一个你真正想做的项目**——哪怕只是个待办清单。从实践中发现问题、回查文档、解决问题——这才是最快的学习方式。

祝你写出又快又美的应用。我们江湖再见。`,
  },
];

export { chapters };
