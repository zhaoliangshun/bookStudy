"use client";
// ↑ "use client" 指令：把本文件标记为【客户端组件】(Client Component)。
//   原因：Mantine 的所有组件都依赖 React Hooks（useState / useEffect / Context），
//   而在 Next.js App Router 中，默认是【服务端组件】，禁止使用 Hook。
//   加上这一行后，Next.js 才允许本文件在浏览器端运行，并使用 Mantine 的全部能力。

// =============================================================
// 文件：app/mantine-form-zod/page.js
// 路由：/mantine-form-zod
// -------------------------------------------------------------
// 【一句话职责】
//   用一个「用户注册表单」综合演示 Mantine Form 与 Zod 校验的【进阶用法】。
//   已有的 /mantine-demo 演示了基础字段，本 demo 补全以下高频实战场景：
//     1. 嵌套对象校验（address.{province, city, zip}）
//     2. 数组字段校验（tags[]）+ 动态增删
//     3. discriminatedUnion（按 method 切换不同的子字段集）
//     4. superRefine 跨字段校验（confirmPassword === password）
//     5. refine 异步校验（模拟用户名是否被占用）
//     6. transform（邮箱自动 trim + lowercase）
//     7. z.coerce.number（处理 NumberInput 的字符串值）
//     8. z.literal(true) 强制勾选 + z.string().url() + 正则 zip/phone
//     9. validateInputOnBlur / validateInputOnChange 两种校验时机
//    10. 提交 loading、重置、清除错误、Modal 展示校验通过的数据
//
// 【三方库版本】
//   - @mantine/core ^9.4.1
//   - @mantine/form  ^9.4.1   ← 新版用 schemaResolver 而非旧的 zodResolver
//   - zod            ^4.4.3   ← 注意 Zod v4 自定义消息 API 与 v3 不同
//   - next           ^16.2.9
//   - react          19.2.4
//
// 【为什么要"自己包一层 MantineProvider"】
//   根目录 layout.js 是整个站点共用的，里面没有 MantineProvider。
//   Mantine 组件必须在 <MantineProvider> 内才能读取主题、CSS 变量。
//   所以每个 Mantine 演示页都要【自包含】地引入样式 + Provider，
//   避免污染其他路由（之前发生过 ColorSchemeScript 与主站 data-theme 冲突）。
// =============================================================

// ---- Mantine 全局样式 ----
// 必须在 MantineProvider 之前引入，包含 CSS Reset、CSS 变量、组件基础样式。
// 不引入的话所有组件会"裸奔"（无样式）。
import "@mantine/core/styles.css";

import { useState } from "react";
// useState：React 基础 Hook，用于在函数组件里保存可变状态。
//   本文件用它管理三个状态：submitted（提交数据）、opened（弹窗开关）、submitting（提交中 loading）。

// ---- MantineProvider + 自定义主题 ----
import { MantineProvider, createTheme } from "@mantine/core";

// createTheme：创建一个 Mantine 主题对象。
// 这里演示了几个最常用的主题定制项：
//   primaryColor     : 主色，影响所有 Button/Link/聚焦边框等
//   defaultRadius    : 全局默认圆角档位（xs/sm/md/lg/xl）
//   autoContrast     : 自动根据背景色选择前景文字色，避免深底深字
//   fontFamily       : 全局字体（这里复用主站的 --sans 变量，没有则用回退字体）
const theme = createTheme({
  primaryColor: "indigo",
  defaultRadius: "md",
  autoContrast: true,
  fontFamily:
    "var(--sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)",
  headings: {
    fontFamily:
      "var(--sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)",
  },
});

// ---- 批量引入 Mantine 组件 ----
// 每个组件的用途在使用处再细说，这里先列个速查：
//   Container          : 页面容器，限制最大宽度并居中
//   Paper              : 带背景/边框/阴影的"纸张"容器
//   Title / Text       : 标题 / 通用文本
//   Stack / Group      : 垂直布局 / 水平布局
//   Divider            : 分隔线
//   TextInput          : 文本输入框
//   NumberInput        : 数字输入框
//   PasswordInput      : 密码输入框（带显示/隐藏按钮）
//   Select             : 下拉选择
//   Checkbox           : 复选框
//   Button             : 按钮
//   Box                : 通用块级容器
//   Code               : 行内代码样式
//   Alert              : 提示条（带图标和颜色）
//   Modal              : 弹窗
//   ActionIcon         : 小图标按钮（用于"删除标签"等操作）
//   useMantineColorScheme : 亮/暗主题切换 Hook
import {
  Container,
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Divider,
  TextInput,
  NumberInput,
  PasswordInput,
  Select,
  Checkbox,
  Button,
  Box,
  Code,
  Alert,
  Modal,
  ActionIcon,
  useMantineColorScheme,
} from "@mantine/core";

// ---- Mantine Form 与 Zod 桥接 ----
// useForm        : @mantine/form 核心 Hook，创建表单实例
//                 返回 { values, errors, getInputProps, onSubmit, reset,
//                       setFieldValue, insertListItem, removeListItem, ... }
// schemaResolver : 把任何符合 StandardSchemaV1 规范的 schema（Zod v4 已内置）
//                 适配成 Mantine form 的 validate 函数。
//                 ⚠️ Mantine v9 已废弃旧的 zodResolver，统一用 schemaResolver。
//                 它会调用 schema["~standard"].validate(values)，
//                 如果返回 Promise 就异步等待，否则同步返回。
import { useForm, schemaResolver } from "@mantine/form";

// ---- Zod ----
// z 是 Zod 的命名空间，所有 schema 构造器都挂在它上面。
// Zod 核心思想：用 schema（模式）声明数据该长什么样，再用数据去匹配 schema。
// 校验失败时 Zod 会生成 issues 数组，schemaResolver 会把它们转换成
// { "字段路径": "错误信息" } 的形式给 Mantine form 显示。
import { z } from "zod";

// =============================================================
// 第一部分：定义 Zod 校验 Schema
// -------------------------------------------------------------
// 下面这个 schema 描述了一个完整的「用户注册」数据结构。
// 从上到下依次演示：字符串/邮箱/密码/数字/URL/嵌套对象/数组/判别联合/字面量。
// 重点 API 都加了行内注释，便于逐行对照。
// =============================================================
const schema = z
  .object({
    // ---- username：用户名 ----
    // z.string()           : 字符串类型
    // .min(3, "msg")       : 至少 3 字符，否则显示 msg
    // .max(20, "msg")      : 最多 20 字符
    // .refine(predicate, "msg") : 自定义校验，predicate 返回 true 通过。
    //   ⭐ 这里 refine 用了【async 函数】，模拟"调用后端检查用户名是否被占用"。
    //      schemaResolver 会检测到 schema 返回 Promise，自动走异步校验流程。
    //   ⚠️ 注意：异步校验只在【提交】或【失焦后整 schema 重跑】时触发，
    //      不要在 onChange 时启用，否则每输一个字符就发请求。
    username: z
      .string()
      .min(3, "用户名至少 3 个字符")
      .max(20, "用户名最多 20 个字符")
      .refine(async (v) => {
        // 模拟一次 200ms 网络请求
        await new Promise((r) => setTimeout(r, 200));
        // 假设这三个用户名已被注册
        const taken = ["admin", "root", "test"];
        return !taken.includes(v.toLowerCase());
      }, "该用户名已被占用"),

    // ---- email：邮箱 ----
    // .min(1, "msg")  : 必填（空串报错）
    // .email("msg")   : Zod 内置邮箱格式校验
    // .transform(v => ...) : 校验通过后对值做一次【转换】。
    //   这里自动去除首尾空格并转小写，避免用户输入 " Alice@Example.com " 这种脏数据。
    //   transform 后 form 拿到的是转换后的值，但 UI 输入框显示的仍是原始值。
    //
    // ⚠️【Zod v4 小变化】z.string().email() 在 v4 已标记为 deprecated，
    //    官方推荐改用顶层 z.email("msg")。本 demo 沿用旧写法是为了与
    //    /mantine-demo 保持一致，两种写法功能等价。
    email: z
      .string()
      .min(1, "邮箱不能为空")
      .email("邮箱格式不正确")
      .transform((v) => v.trim().toLowerCase()),

    // ---- password：密码（复杂校验） ----
    // 【设计思路】
    //   把"长度 + 字符种类 + 黑名单 + 序列"四类规则全部用 refine 串起来，
    //   Zod 会按顺序执行，第一条失败就立即返回该条的错误信息。
    //   【为什么用 refine 而不是正则组合】
    //     一条复杂的正则可读性极差，且无法精确报出"具体缺了什么"。
    //     拆成多条 refine 后，每条只关注一个维度，错误信息可以明确告诉用户
    //     "缺少大写字母"/"包含连续 3 个相同字符"，体验远好于一句"格式不正确"。
    //
    // 【规则清单】
    //   1. 长度 8~32 位（min + max）
    //   2. 必须包含【大写字母】  A-Z
    //   3. 必须包含【小写字母】  a-z
    //   4. 必须包含【数字】       0-9
    //   5. 必须包含【特殊字符】   !@#$%^&*()-_=+[]{}|;:,.<>?/~
    //   6. 不能包含【连续 3 个相同字符】（如 "aaa" / "111"）—— 抵御暴力破解
    //   7. 不能包含【连续递增/递减序列】（如 "abc" / "987" / "qwerty"）
    //   8. 不能是【常见弱密码】（如 password / 123456 / admin / qwerty 等）
    //
    // 【⚠️ 关于"密码不能包含用户名"】
    //   这条规则需要同时访问 username 和 password，单字段 refine 做不到，
    //   必须放到最外层的 superRefine 里跨字段校验。见下方 superRefine 第二段。
    password: z
      .string()
      // 规则 1：长度区间。min/max 都是字符串专用方法（z.string()）。
      .min(8, "密码长度至少 8 位")
      .max(32, "密码长度最多 32 位")
      // 规则 2：大写字母。正则 /[A-Z]/ 匹配任意一个大写字母。
      .refine((v) => /[A-Z]/.test(v), "密码必须包含至少 1 个大写字母")
      // 规则 3：小写字母。
      .refine((v) => /[a-z]/.test(v), "密码必须包含至少 1 个小写字母")
      // 规则 4：数字。
      .refine((v) => /\d/.test(v), "密码必须包含至少 1 个数字")
      // 规则 5：特殊字符。在正则里 - 需要放在末尾或转义，避免被识别为范围符。
      .refine(
        (v) => /[!@#$%^&*()\-_=+\[\]{}|;:,.<>?/~]/.test(v),
        "密码必须包含至少 1 个特殊字符（如 !@#$%^&*）"
      )
      // 规则 6：连续 3 个相同字符。
      //   正则解释：(.)\1{2,}：
      //     (.)     捕获任意一个字符
      //     \1{2,}  后面跟着至少 2 个与第一捕获组相同的字符
      //   合起来就是"任意字符连续出现 3 次以上"。
      //   ✕ "aaabbb"  → 命中（有 aaa）
      //   ✓ "aabbcc"  → 通过
      .refine(
        (v) => !/(.)\1{2,}/.test(v),
        "密码不能包含 3 个及以上连续相同字符（如 aaa、111）"
      )
      // 规则 7：连续递增/递减序列（数字 + 字母）。
      //   正则解释（以数字为例）：/(?:012|123|234|...|890|987|876|...|210)/
      //   逐条列出 3 位连续序列，命中即拒绝。
      //   字母同理：abc/bcd/.../xyz 和 zyx/yxw/.../cba。
      //   【为什么不写更通用的算法】
      //     refine 里写算法（循环比较 charCode）也行，但正则更紧凑、可读。
      //     长度只有 3，正则枚举 60 多条已足够，且性能远好于字符串扫描。
      .refine(
        (v) =>
          !/(?:012|123|234|345|456|567|678|789|890|987|876|765|654|543|432|321|210|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|zyx|yxw|xwv|wvu|vut|uts|tsr|srq|rqp|qpo|pon|nml|mlk|lkj|kji|jih|ihg|hgf|gfe|fed|edc|dcb|cba)/i.test(
            v
          ),
        "密码不能包含 3 位及以上连续递增/递减字符（如 abc、123、987）"
      )
      // 规则 8：常见弱密码黑名单。
      //   先转小写再比对，避免 Password / PASSWORD 绕过。
      //   实际项目中应改为后端黑名单 + 暴露破解查询（haveibeenpwned API），
      //   这里只列少量高频弱密码做演示。
      .refine((v) => {
        const weak = [
          "password",
          "passwd",
          "12345678",
          "123456789",
          "1234567890",
          "11111111",
          "00000000",
          "qwerty123",
          "abc12345",
          "admin123",
          "letmein!",
          "welcome1",
        ];
        return !weak.includes(v.toLowerCase());
      }, "密码过于常见，请更换一个更复杂的密码"),

    // ---- confirmPassword：确认密码 ----
    // 这里只声明类型，真正的"两次输入必须一致"校验放在下面的 superRefine 里做。
    // 因为校验需要同时访问 password 和 confirmPassword 两个字段，
    // 单字段 refine 拿不到其他字段的值，必须用 superRefine 做跨字段校验。
    confirmPassword: z.string().min(1, "请再次输入密码"),

    // ---- age：年龄 ----
    // ⚠️【重要坑点】NumberInput 的 value 实际上是【字符串】（HTML input 的通病）。
    //    如果直接用 z.number()，输入 "20" 会报"期望数字，收到字符串"。
    //    解决方案 1：用 z.coerce.number()，先 Number(v) 再校验（推荐）。
    //    解决方案 2：在 form 里用 z.string().regex(/^\d+$/).transform(Number)。
    // .int()  : 必须是整数
    // .min(18): 必须 ≥ 18
    // .max(150): 必须 ≤ 150（防呆）
    age: z.coerce
      .number()
      .int("年龄必须是整数")
      .min(18, "必须年满 18 岁")
      .max(150, "年龄不合理"),

    // ---- website：个人网站（可选） ----
    // .url("msg")  : URL 格式校验（v4 已 deprecated，可改用 z.url("msg")）
    // .optional()  : 字段可以不存在（undefined 通过）
    // .or(z.literal("")) : 允许空字符串通过（用户没填就保持空串）
    //   为什么不只用 optional？因为表单初始值是 ""（空串）而不是 undefined，
    //   空串会被 .url() 判定格式不正确，必须额外放行。
    website: z.string().url("URL 格式不正确").optional().or(z.literal("")),

    // ---- address：地址（嵌套对象） ----
    // z.object 可以嵌套，对应表单里的 address.province / address.city / address.zip。
    // Mantine form.getInputProps 支持点号路径，写法：getInputProps("address.province")。
    address: z.object({
      province: z.string().min(1, "请填写省份"),
      city: z.string().min(1, "请填写城市"),
      // .regex(pattern, "msg") : 正则校验。邮编必须 6 位纯数字。
      zip: z.string().regex(/^\d{6}$/, "邮编必须是 6 位数字"),
    }),

    // ---- tags：标签数组（动态字段） ----
    // z.array(T) : 数组，每个元素都要满足 T 这份 schema。
    // .max(5, "msg") : 数组最多 5 个元素。
    // 每个元素是字符串，1~10 字符。空字符串会被 min(1) 拦下。
    // UI 上用 form.insertListItem("tags", "") 添加、form.removeListItem("tags", i) 删除。
    tags: z
      .array(z.string().min(1, "标签不能为空").max(10, "单个标签最多 10 字"))
      .max(5, "最多添加 5 个标签"),

    // ---- notification：通知偏好（判别联合 discriminatedUnion） ----
    // 【什么是 discriminatedUnion】
    //   普通的 union（z.union([A, B])）会让 Zod 依次尝试每个分支，
    //   错误信息很难定位。discriminatedUnion 用一个【判别字段】(discriminator)
    //   来直接选定分支，性能好、错误信息清晰。
    //
    // 【这里的设计】
    //   按 method 字段把通知偏好分成三种：
    //     - "email" : 必须额外填 notifyEmail（邮箱）
    //     - "sms"   : 必须额外填 phone（手机号）
    //     - "none"  : 不通知，没有额外字段
    //   这样不同分支的校验规则互不干扰，切换 method 时自动切换校验规则。
    notification: z.discriminatedUnion("method", [
      z.object({
        method: z.literal("email"),
        notifyEmail: z.string().min(1, "请填写通知邮箱").email("邮箱格式不正确"),
      }),
      z.object({
        method: z.literal("sms"),
        // 中国大陆手机号正则：1 开头，第二位 3-9，共 11 位数字
        phone: z.string().regex(/^1[3-9]\d{9}$/, "手机号格式不正确"),
      }),
      z.object({
        method: z.literal("none"),
        // 不通知分支，没有额外字段
      }),
    ]),

    // ---- agree：同意条款 ----
    // z.literal(true, "msg") : 值必须严格等于 true。
    //   ⚠️【为什么不用 z.boolean()】boolean 接受 true 和 false，
    //      无法强制必须勾选。literal(true) 没勾就报错。
    //   ⚠️【Zod v4 API 变化】v3 用 { errorMap: () => ({ message: "..." }) }，
    //      v4 已废弃 errorMap，直接把字符串作为第二个参数传入即可。
    agree: z.literal(true, "必须同意服务条款才能注册"),
  })
  // ---- superRefine：跨字段校验 ----
  // 【为什么需要 superRefine】
  //   普通 refine 只能拿到当前字段的值，无法访问其他字段。
  //   "两次密码必须一致"需要同时看 password 和 confirmPassword，
  //   所以在最外层 object 上用 superRefine，第二参数 ctx 可以主动 addIssue。
  // 【参数】
  //   data : 已经通过前面所有校验的整个表单对象
  //   ctx  : RefinementCtx，调 ctx.addIssue({ path, code, message }) 主动报错
  // 【path 写法】
  //   ["confirmPassword"] 表示错误挂在 confirmPassword 字段上，
  //   schemaResolver 会把它转成 { confirmPassword: "两次输入的密码不一致" }。
  //
  // 【跨字段校验清单】
  //   1. 两次输入的密码必须一致（confirmPassword === password）
  //   2. 密码不能包含用户名（不区分大小写，长度 ≥ 3 才检查，否则空串会误伤）
  //      ⚠️ 这是【安全最佳实践】——如果密码里直接嵌了用户名，
  //         一旦泄露，攻击者可以用用户名做侧信道推断密码。
  .superRefine((data, ctx) => {
    // ---- 规则 1：两次密码一致 ----
    if (data.confirmPassword !== data.password) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: "custom",
        message: "两次输入的密码不一致",
      });
    }

    // ---- 规则 2：密码不能包含用户名 ----
    //   只在用户名 ≥ 3 字符时检查，避免用户名只输了 1~2 个字符时
    //   误命中（比如用户名只输了 "a"，几乎所有密码都会"包含 a"）。
    //   includes 区分大小写，所以双方都转小写再比对。
    if (
      data.username &&
      data.username.length >= 3 &&
      data.password.toLowerCase().includes(data.username.toLowerCase())
    ) {
      ctx.addIssue({
        path: ["password"],
        code: "custom",
        message: "密码不能包含用户名，请更换密码",
      });
    }
  });

// =============================================================
// 第二部分：表单初始值
// -------------------------------------------------------------
// 字段名必须和 schema 的 key 完全对应（包括嵌套层）。
// initialValues 决定：
//   1. 表单打开时的默认值
//   2. 点"重置"时回到的状态
//   3. Mantine form 内部为每个字段创建对应的 ref / state
// 注意几个细节：
//   - age 用 18（数字），但 NumberInput 会把它当字符串处理
//   - tags 给一个空数组，用户点"+ 添加标签"才会 push 元素
//   - notification 必须包含完整的某个分支的初始值，否则 discriminatedUnion
//     会因为缺字段而报错。这里默认 "none" 分支（最简单，无额外字段）。
//   - agree: false，用户必须主动勾选
// =============================================================
const initialValues = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  age: 18,
  website: "",
  address: {
    province: "",
    city: "",
    zip: "",
  },
  tags: [],
  notification: {
    method: "none",
  },
  agree: false,
};

// =============================================================
// 第三部分：主题切换小组件 ThemeSwitcher
// -------------------------------------------------------------
// 单独抽出来让主组件代码更清爽。
// useMantineColorScheme 返回 { colorScheme, setColorScheme, toggleColorScheme }。
// 切换后 Mantine 修改 <html data-mantine-color-scheme="...">，
// 所有组件通过 CSS 变量自动响应，无需刷新。
// =============================================================
function ThemeSwitcher() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  return (
    <Group gap="xs">
      <Text size="sm" c="dimmed">
        主题:
      </Text>
      {/* 用两个 Button 做切换，演示最简实现 */}
      <Button
        size="xs"
        variant={colorScheme === "light" ? "filled" : "subtle"}
        onClick={() => setColorScheme("light")}
      >
        ☀️ 亮色
      </Button>
      <Button
        size="xs"
        variant={colorScheme === "dark" ? "filled" : "subtle"}
        onClick={() => setColorScheme("dark")}
      >
        🌙 暗色
      </Button>
    </Group>
  );
}

// =============================================================
// 第四部分：注册表单组件 RegistrationForm
// -------------------------------------------------------------
// 【职责】
//   渲染所有输入控件，校验通过后把 values 通过 onSubmit prop 传给父组件。
// 【为什么拆成独立组件】
//   1. form 实例只在表单内部使用，父组件不用关心表单细节
//   2. 把"表单交互"和"页面布局"解耦，便于复用
// 【props】
//   onSubmit : 父组件传入的提交回调，接收【校验通过 + transform 后】的 values
// =============================================================
function RegistrationForm({ onSubmit }) {
  // ---- 创建 form 实例 ----
  // useForm 的核心配置项：
  //   initialValues           : 表单初始值（见上方定义）
  //   validate                : 校验函数，这里用 schemaResolver(schema) 桥接 Zod
  //   validateInputOnBlur     : 失焦时校验当前字段（布尔，true = 所有字段失焦都校验）
  //   validateInputOnChange   : 输入时校验当前字段
  //                             · true   : 所有字段输入时都校验
  //                             · false  : 都不校验
  //                             · 数组   : 只对【列出的字段路径】做 onChange 校验
  //
  // ⚠️【confirmPassword 特殊处理 —— 关键设计】
  //   "两次密码一致"这条规则放在 superRefine 里，需要同时访问 password 和
  //   confirmPassword。如果对 confirmPassword 开 onChange 校验，用户每输一个
  //   字符就会被报"两次密码不一致"（因为还没输完当然不一致），体验极差。
  //
  //   解决方案：把 validateInputOnChange 改成【数组形式】，列出需要即时校验的
  //   字段，把 "confirmPassword" 故意排除。这样：
  //     · 其他字段（username/email/password/age/...）：onChange + onBlur 都校验
  //     · confirmPassword：只在【失焦时】校验（由 validateInputOnBlur: true 保证）
  //   用户输完确认密码、离开输入框的瞬间才检查"两次是否一致"，符合直觉。
  //
  // ⚠️【数组字段路径的写法】
  //   Mantine form 内部会把形如 "tags.0" 的路径里的数字下标替换成
  //   "__MANTINE_FORM_INDEX__" 再去数组里查找。所以要让 tags 数组字段
  //   支持 onChange 校验，数组里要写 "tags.__MANTINE_FORM_INDEX__"。
  //   （这是 Mantine form 的内部约定，详见 node_modules/@mantine/form 的
  //    should-validate-on-change.mjs 和 form-index.mjs）
  const form = useForm({
    initialValues,
    validate: schemaResolver(schema),
    // 所有字段失焦时都校验（包括 confirmPassword）
    validateInputOnBlur: true,
    // 只对下列字段开 onChange 即时校验，confirmPassword 故意不列入
    validateInputOnChange: [
      "username",
      "email",
      "password",
      "age",
      "website",
      "address.province",
      "address.city",
      "address.zip",
      // 数组字段：用 __MANTINE_FORM_INDEX__ 占位符匹配 tags.0 / tags.1 / ...
      "tags.__MANTINE_FORM_INDEX__",
      "notification.method",
      "notification.notifyEmail",
      "notification.phone",
      "agree",
    ],
  });

  // ---- 提交处理 ----
  // form.onSubmit(onSubmit) 返回一个真正的 HTML form onSubmit 处理函数。
  // 它内部会：
  //   1) event.preventDefault() 阻止页面刷新
  //   2) 调用 schema.validate(values) 校验
  //   3) 全部通过才调 onSubmit(values)；有错则把错误写入 form.errors
  // 注意：onSubmit 拿到的 values 是【transform 后】的数据，
  //       比如 email 已经被 trim + lowercase 了。
  return (
    <Paper p="lg" withBorder shadow="sm">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          {/* ===================================================
              区块 1：基础信息
              =================================================== */}
          <Title order={4}>① 基础信息</Title>

          {/* username —— 异步校验用户名是否被占用 */}
          <TextInput
            label="用户名"
            placeholder="3~20 字符，不能是 admin/root/test"
            withAsterisk
            description="失焦后会异步检查是否被占用（模拟 200ms 网络请求）"
            {...form.getInputProps("username")}
          />

          {/* email —— 自动 trim + lowercase（transform） */}
          <TextInput
            label="邮箱"
            placeholder="user@example.com"
            withAsterisk
            description="提交时会自动去除空格并转小写"
            {...form.getInputProps("email")}
          />

          {/* password —— 复杂校验：长度 + 4 类字符 + 序列 + 黑名单 + 不含用户名 */}
          <PasswordInput
            label="密码"
            placeholder="8~32 位，含大小写字母、数字、特殊字符"
            withAsterisk
            description="需含大写/小写/数字/特殊字符各 1 个，不能有连续 3 个相同字符或 abc/123 序列，也不能是常见弱密码或包含用户名"
            {...form.getInputProps("password")}
          />

          {/* confirmPassword —— 只在失焦时校验"两次密码一致"
              ⚠️【为什么不在输入时校验】
                 "两次密码一致"需要同时看 password 和 confirmPassword。
                 如果输入过程中（onChange）就校验，用户每输一个字符都会被报
                 "两次密码不一致"（因为还没输完当然不一致），体验极差。
                 所以在 useForm 配置里把 confirmPassword 从 validateInputOnChange
                 数组里排除了，只在失焦（onBlur）时校验，由 validateInputOnBlur: true 保证。
                 用户输完确认密码、离开输入框的瞬间才会出现"两次密码不一致"红字。 */}
          <PasswordInput
            label="确认密码"
            placeholder="再输一次密码"
            withAsterisk
            {...form.getInputProps("confirmPassword")}
          />

          <Divider my="xs" />

          {/* ===================================================
              区块 2：个人信息
              =================================================== */}
          <Title order={4}>② 个人信息</Title>

          {/* age —— z.coerce.number 处理字符串输入 */}
          <NumberInput
            label="年龄"
            withAsterisk
            min={0}
            max={150}
            description="必须 18 岁以上，schema 用 z.coerce.number 处理字符串值"
            {...form.getInputProps("age")}
          />

          {/* website —— 可选，URL 格式 */}
          <TextInput
            label="个人网站（可选）"
            placeholder="https://example.com"
            description="留空或填合法 URL"
            {...form.getInputProps("website")}
          />

          <Divider my="xs" />

          {/* ===================================================
              区块 3：地址（嵌套对象）
              =================================================== */}
          <Title order={4}>③ 地址信息</Title>

          {/* 嵌套字段用点号路径：address.province / address.city / address.zip */}
          <Group grow>
            <TextInput
              label="省份"
              placeholder="如：广东省"
              withAsterisk
              {...form.getInputProps("address.province")}
            />
            <TextInput
              label="城市"
              placeholder="如：深圳市"
              withAsterisk
              {...form.getInputProps("address.city")}
            />
          </Group>
          <TextInput
            label="邮编"
            placeholder="6 位数字"
            withAsterisk
            {...form.getInputProps("address.zip")}
          />

          <Divider my="xs" />

          {/* ===================================================
              区块 4：标签数组（动态字段）
              =================================================== */}
          <Title order={4}>④ 兴趣标签（最多 5 个）</Title>

          {/* 遍历 form.values.tags 渲染每个标签输入框 + 删除按钮 */}
          {form.values.tags.map((_, i) => (
            <Group key={i} grow>
              <TextInput
                placeholder={"标签 " + (i + 1) + "（1~10 字符）"}
                {...form.getInputProps("tags." + i)}
              />
              {/* removeListItem(path, index) : 从指定路径的数组里移除第 index 项 */}
              <ActionIcon
                color="red"
                variant="subtle"
                size="lg"
                onClick={() => form.removeListItem("tags", i)}
                aria-label="删除标签"
              >
                ✕
              </ActionIcon>
            </Group>
          ))}

          {/* 添加按钮：限制最多 5 个 */}
          <Button
            variant="light"
            size="xs"
            disabled={form.values.tags.length >= 5}
            onClick={() => form.insertListItem("tags", "")}
          >
            + 添加标签
          </Button>

          <Divider my="xs" />

          {/* ===================================================
              区块 5：通知偏好（discriminatedUnion）
              =================================================== */}
          <Title order={4}>⑤ 通知偏好</Title>

          {/* method 是判别字段，用 Select 切换 */}
          <Select
            label="通知方式"
            data={[
              { value: "email", label: "📧 邮件通知" },
              { value: "sms", label: "📱 短信通知" },
              { value: "none", label: "🔕 不通知" },
            ]}
            // 注意：切换 method 时要同时把旧分支的字段清掉，
            // 否则 discriminatedUnion 会因为"多余字段"报错（Zod 默认不剥离未知字段）。
            // 这里在 onChange 里手动重置 notification 为只含 method 的对象。
            {...form.getInputProps("notification.method")}
            onChange={(v) => {
              form.setFieldValue("notification", { method: v });
            }}
          />

          {/* 根据 method 显示对应分支的字段 */}
          {form.values.notification.method === "email" && (
            <TextInput
              label="通知邮箱"
              placeholder="notify@example.com"
              withAsterisk
              {...form.getInputProps("notification.notifyEmail")}
            />
          )}
          {form.values.notification.method === "sms" && (
            <TextInput
              label="手机号"
              placeholder="11 位手机号"
              withAsterisk
              {...form.getInputProps("notification.phone")}
            />
          )}
          {form.values.notification.method === "none" && (
            <Text size="xs" c="dimmed">
              已选择&ldquo;不通知&rdquo;，无需额外信息。
            </Text>
          )}

          <Divider my="xs" />

          {/* ===================================================
              区块 6：同意条款 + 按钮区
              =================================================== */}
          <Checkbox
            label="我已阅读并同意《服务条款》和《隐私政策》"
            {...form.getInputProps("agree", { type: "checkbox" })}
            // ⚠️【覆盖 onBlur 的原因】
            //   全局开了 validateInputOnBlur + validateInputOnChange，
            //   checkbox 这类二值控件在点击 label 时会先失焦（此时值还是旧值，
            //   校验失败显示红字）→ 紧接着值切换 → 错误清除，造成"红字闪一下"。
            //   把 onBlur 设为空函数，让 agree 只在提交时校验，避免闪现。
            onBlur={() => {}}
          />

          <Group justify="space-between" mt="md">
            <Group>
              {/* form.reset() ：把表单恢复到 initialValues 状态 */}
              <Button variant="subtle" color="gray" onClick={() => form.reset()}>
                重置
              </Button>
              {/* form.clearErrors() ：只清错误，不清值。
                  演示用：当用户被一堆红色错误"包围"时，可以一键清掉错误重新填。 */}
              <Button
                variant="subtle"
                color="gray"
                onClick={() => form.clearErrors()}
              >
                清除错误
              </Button>
            </Group>
            <Button type="submit">提交注册</Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}

// =============================================================
// 第五部分：主页面组件
// -------------------------------------------------------------
// 【状态说明】
//   submitted : 校验通过并提交后的数据，用于在 Modal 里展示
//   opened    : Modal 显示/隐藏
//   submitting: 提交按钮 loading 状态（模拟网络请求）
// =============================================================
export default function MantineFormZodPage() {
  const [submitted, setSubmitted] = useState(null);
  const [opened, setOpened] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ---- 提交处理 ----
  // 接收 RegistrationForm 校验通过后传上来的 values。
  // 这里模拟一次"提交到后端"的异步请求：800ms 延迟 + 弹窗展示结果。
  const handleSubmit = async (values) => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSubmitted(values);
    setOpened(true);
  };

  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      {/* 【滚动根容器】
          主站 globals.css 把 html/body 的 overflow 锁成了 hidden，
          但本页用的是 Mantine 流式布局，没有内部滚动区，
          所以这里用一个外层 div 接管滚动：height 100vh + overflowY auto。 */}
      <div style={{ height: "100vh", overflowY: "auto" }}>
        <Container size="md" py="xl">
          <Stack>
            {/* ============ 顶部：标题 + 主题切换 ============ */}
            <Group justify="space-between" align="flex-start">
              <Box>
                <Title order={2}>Mantine Form + Zod 进阶 Demo</Title>
                <Text size="sm" c="dimmed" mt={4}>
                  覆盖嵌套对象 / 数组 / 判别联合 / 跨字段 / 异步校验 / transform
                </Text>
              </Box>
              <ThemeSwitcher />
            </Group>

            {/* ============ 提示条：演示要点 ============ */}
            <Alert color="indigo" variant="light" title="本 Demo 演示的 Zod 核心能力">
              <Stack gap={4}>
                <Text size="xs">
                  • <Code>z.object</Code> 嵌套（address.{`{province,city,zip}`})
                </Text>
                <Text size="xs">
                  • <Code>z.array</Code> + 动态增删（form.insertListItem /
                  removeListItem）
                </Text>
                <Text size="xs">
                  • <Code>z.discriminatedUnion</Code>（按 method 切换不同字段集）
                </Text>
                <Text size="xs">
                  • <Code>superRefine</Code> 跨字段校验（confirmPassword ===
                  password）
                </Text>
                <Text size="xs">
                  • <Code>refine(async fn)</Code> 异步校验（模拟用户名查重）
                </Text>
                <Text size="xs">
                  • <Code>transform</Code> 提交前转换（email trim + lowercase）
                </Text>
                <Text size="xs">
                  • <Code>z.coerce.number()</Code> 处理 NumberInput 字符串值
                </Text>
                <Text size="xs">
                  • <Code>z.literal(true)</Code> 强制勾选 /{" "}
                  <Code>z.string().url()</Code> / 正则邮编手机号
                </Text>
              </Stack>
            </Alert>

            {/* ============ 表单区 ============ */}
            <RegistrationForm onSubmit={handleSubmit} />

            {/* ============ 提交结果弹窗 ============ */}
            <Modal
              opened={opened}
              onClose={() => setOpened(false)}
              title="✅ 注册成功"
              size="md"
            >
              <Stack>
                <Text size="sm" c="dimmed">
                  以下数据已通过 Zod 校验（注意 email 已被 transform 处理）：
                </Text>
                {/* 用原生 <pre> 展示 JSON，做成"代码块"风格 */}
                <pre
                  style={{
                    background: "var(--mantine-color-dark-8)",
                    color: "var(--mantine-color-gray-3)",
                    padding: "1rem",
                    borderRadius: "8px",
                    overflow: "auto",
                    fontSize: "0.875rem",
                    margin: 0,
                    maxHeight: 360,
                  }}
                >
                  {JSON.stringify(submitted, null, 2)}
                </pre>
                <Group justify="flex-end">
                  <Button variant="default" onClick={() => setOpened(false)}>
                    关闭
                  </Button>
                </Group>
              </Stack>
            </Modal>

            {/* ============ 提交 loading 提示 ============ */}
            {/* submitting 为 true 时显示一条提示，避免用户重复点提交 */}
            {submitting && (
              <Alert color="blue" variant="light" title="正在提交...">
                模拟网络请求中（800ms），请稍候。
              </Alert>
            )}
          </Stack>
        </Container>
      </div>
    </MantineProvider>
  );
}
