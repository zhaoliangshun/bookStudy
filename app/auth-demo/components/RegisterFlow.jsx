"use client";

// =============================================================
// 文件：app/auth-demo/components/RegisterFlow.jsx
// -------------------------------------------------------------
// 【职责】
//   ForgeRock 认证 Demo 的「注册流程」组件。引导用户分三步完成
//   账号注册：
//     ① 用户名 + 邮箱
//     ② 密码 + 确认密码（+ 同意条款）
//     ③ 2 个安全问题 + 答案
//   每一步先用 Zod schema 做前端校验，校验通过后把用户输入写入
//   ForgeRock SDK 的 FRStep 回调，再调用 nextAuth 推进认证树。
//
// 【技术栈】
//   - Mantine v9：UI 组件库（Stepper 分步、TextInput/PasswordInput 输入等）
//   - @mantine/form 的 useForm + schemaResolver：表单状态管理 + Zod 校验集成
//   - Zod v4：声明式数据校验（schema 定义在 ../lib/schemas.js）
//   - @forgerock/javascript-sdk：ForgeRock 认证树回调模型（FRStep/FRCallback）
//
// 【ForgeRock 认证树流程（注册）】
//   startAuth("register")
//     → RegisterUsername 步骤（收集用户名 + 邮箱）
//     → RegisterPassword 步骤（收集密码）
//     → RegisterSecurityQuestions 步骤（收集 KBA 安全问题）
//     → LoginSuccess（注册成功并自动登录）
//
// 【"use client" 指令】
//   Next.js App Router 默认组件是 Server Component（服务端渲染）。
//   本组件使用了 useState/useEffect/useRef 等 React Hook，以及只在
//   浏览器端运行的 ForgeRock SDK，必须声明为 Client Component。
//   "use client" 必须放在文件最顶部、所有 import 之前，标记客户端边界。
// =============================================================

// React 核心 Hook：
//   useState：声明会驱动渲染的状态。
//   useEffect：处理副作用（挂载时启动注册流程）。
//   useRef：保存不直接驱动渲染的可变数据（SDK 步骤对象、跨步骤上下文）。
import { useEffect, useRef, useState } from "react";

// Mantine v9 UI 组件：
//   Paper：带阴影/边框的卡片容器，作为整体外层。
//   Stack：垂直堆栈布局（gap 控制子元素间距）。
//   Group：水平排列容器（justify 控制对齐）。
//   TextInput：单行文本输入框。
//   PasswordInput：密码输入框，自带显示/隐藏切换与强度指示（v9 内置）。
//   Select：下拉选择框，data 格式为 [{ value, label }, ...]。
//   Checkbox：复选框，这里用于「同意服务条款」。
//   Button：按钮，支持 loading 态。
//   Alert：带颜色和图标的提示框，用于全局错误/成功提示。
//   Text：文本展示组件，可设字号/字重/颜色。
//   Code：等宽代码块，这里用来展示调试信息（当前 SDK 阶段）。
//   Divider：水平分隔线，划分内容区块。
//   Progress：进度条，辅助展示注册整体完成度。
//   Stepper：分步器，active 控制当前步骤，onStepClick 支持点击跳转。
import {
  Alert,
  Button,
  Checkbox,
  Code,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Progress,
  Select,
  Stack,
  Stepper,
  Text,
  TextInput,
} from "@mantine/core";

// @mantine/form：
//   useForm：表单核心 Hook，管理表单值、错误、校验、字段触达等。
//   schemaResolver：把符合 Standard Schema 规范的 schema（如 Zod v4）
//     包装成 Mantine form 能识别的校验函数。Zod v4 原生实现 Standard Schema，
//     因此可直接传入，无需 zodResolver 第三方适配包。
import { useForm, schemaResolver } from "@mantine/form";

// 从 ../lib/schemas.js 导入本组件需要的两个 Zod schema：
//   registerSchema：注册账号信息校验
//     - username：2-32 位字母/数字/下划线
//     - email：合法邮箱格式
//     - password：8 位以上且含字母和数字
//     - confirmPassword：与 password 一致（对象层 refine 校验）
//     - agree：必须为 true（z.literal(true, "消息")）
//   securityQuestionsSchema：安全问题校验
//     - question1/answer1、question2/answer2
//     - 两问题不能相同（对象层 refine 校验，错误显示在 question2）
import { registerSchema, securityQuestionsSchema } from "../lib/schemas.js";

// 从 ../lib/sdk.js 导入 Mock 认证引擎的三个 API：
//   startAuth(flowType, context)：启动一个认证流程；传 "register" 启动注册树，
//     返回第 1 步 FRStep（含待填写的回调）。
//   nextAuth(step, context)：提交当前步骤（需先把用户输入写入 step 的回调），
//     返回下一步 FRStep 或终态（LoginSuccess/LoginFailure）。
//     context 会在内部被累积上 pendingUser（用户名/邮箱/密码），用于跨步骤传递。
//   getPredefinedQuestions：返回预定义安全问题字符串数组，供 Select 渲染选项。
import { startAuth, nextAuth, getPredefinedQuestions } from "../lib/sdk.js";

// -------------------------------------------------------------
// 组件主体
// -------------------------------------------------------------
// props：
//   onRegisterSuccess：注册成功后的回调，父组件据此切换视图（如进入已登录态）。
//   onSwitchToLogin：切换到登录视图的回调。
// -------------------------------------------------------------
export default function RegisterFlow({ onRegisterSuccess, onSwitchToLogin }) {
  // ---- UI 状态 ----
  // active：当前激活的步骤索引（0/1/2），驱动 Stepper 高亮哪一步。
  //   active=3 表示进入 Stepper.Completed（完成态）。
  const [active, setActive] = useState(0);

  // loading：提交中状态。控制按钮 loading 动画与禁用，防止用户重复点击提交。
  const [loading, setLoading] = useState(false);

  // error：全局错误信息（如「用户名已被注册」「邮箱已被注册」），渲染在顶部 Alert。
  const [error, setError] = useState("");

  // success：注册成功提示信息。设置后隐藏「下一步」按钮、显示完成态。
  const [success, setSuccess] = useState("");

  // questions：预定义安全问题，转成 Mantine Select 需要的 { value, label } 格式。
  const [questions, setQuestions] = useState([]);

  // stages：每一步对应的 SDK stage 名称（如 "RegisterUsername" / "RegisterPassword" /
  //   "RegisterSecurityQuestions"）。在收到新 step 时同步写入，用于在 UI 上展示
  //   当前阶段名。必须用 state（而非 ref）才能驱动重渲染，并避免在 render 中
  //   直接读取 ref.current（react-hooks/refs 规则禁止此举）。
  const [stages, setStages] = useState([]);

  // ---- SDK 步骤历史（ref，不直接驱动渲染）----
  // stepsRef.current[i] 保存第 i 步的 FRStep 对象：
  //   [0] = startAuth 返回的第 1 步（RegisterUsername 阶段）
  //   [1] = 提交第 1 步后返回的第 2 步（RegisterPassword 阶段）
  //   [2] = 提交第 2 步后返回的第 3 步（RegisterSecurityQuestions 阶段）
  // 用 useRef 而非 useState：步骤对象是中间数据，不需要触发重渲染；
  // 同时保留历史步骤，便于用户「返回上一步」后重新提交对应步骤。
  const stepsRef = useRef([]);

  // ---- 跨步骤上下文 ----
  // ForgeRock 认证树本身无状态，每一步之间靠 context 关联同一注册会话。
  // Mock SDK 会在 nextAuth 内部把用户输入累积到 context.pendingUser：
  //   第 1 步后：context.pendingUser = { username, email }
  //   第 2 步后：context.pendingUser.password = password
  //   第 3 步读取 context.pendingUser 创建用户。
  // 必须用同一个 context 对象贯穿始终，故用 useRef 持有。
  const contextRef = useRef({});

  // ---- 账号信息表单（覆盖步骤 1 & 2 的字段）----
  // 用 registerSchema 做整体校验；分步提交时用 validateField 只校验当前步骤
  // 涉及的字段，避免在第 1 步就报出第 2 步密码的错误。
  const accountForm = useForm({
    // initialValues：表单初始值。registerSchema 涉及的所有字段都要给初始值，
    // 否则 schema 校验会因为字段 undefined 而报错。
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      agree: false, // 同意条款；registerSchema 用 z.literal(true) 要求必须勾选
    },
    // schemaResolver(registerSchema)：把 Zod schema 转成 Mantine 校验器。
    // 注意：schemaResolver 默认返回异步 resolver，因此 validate/validateField
    // 返回 Promise，调用时需 await。
    validate: schemaResolver(registerSchema),
    // validateInputOnChange：输入即校验，提供即时反馈。
    // 仅对这几个字段开启；agree（布尔）不开启，避免勾选瞬间触发多余校验。
    validateInputOnChange: ["username", "email", "password", "confirmPassword"],
  });

  // ---- 安全问题表单（步骤 3）----
  // 用 securityQuestionsSchema 校验：2 个问题 + 2 个答案，且两问不能相同。
  const securityForm = useForm({
    initialValues: {
      question1: "",
      answer1: "",
      question2: "",
      answer2: "",
    },
    validate: schemaResolver(securityQuestionsSchema),
    // 答案输入即时校验；问题用 Select 的 onChange 触发即可。
    validateInputOnChange: ["answer1", "answer2"],
  });

  // ---- 初始化：启动注册流程 + 加载安全问题选项 ----
  useEffect(() => {
    // mounted 标志：组件卸载后不再 setState，避免 React 内存泄漏警告。
    let mounted = true;

    (async () => {
      try {
        // getPredefinedQuestions 同步返回字符串数组（如「你的出生城市是哪里？」）。
        // 转成 Mantine Select 要求的 { value, label } 结构（value 与 label 相同）。
        const list = getPredefinedQuestions();
        if (!mounted) return;
        setQuestions(list.map((q) => ({ value: q, label: q })));

        // startAuth("register") 启动注册认证树，返回第 1 步 FRStep。
        // 该 FRStep 的 callbacks 包含：
        //   [0] ValidatedCreateUsernameCallback（待填用户名）
        //   [1] StringAttributeInputCallback（待填邮箱）
        // 动态 import SDK 在 sdk.js 内部完成（避免 SSR 报错），这里 await 即可。
        const step1 = await startAuth("register");
        if (!mounted) return;
        stepsRef.current[0] = step1;
        // 同步写入第 1 步的 stage 名称到 state，供 UI 调试信息展示。
        setStages((prev) => {
          const next = [...prev];
          next[0] = step1?.getStage?.() ?? "";
          return next;
        });
      } catch (e) {
        // 初始化失败时展示错误（如 SDK 加载异常）。
        if (mounted) setError("初始化注册流程失败：" + (e?.message || e));
      }
    })();

    // 清理函数：组件卸载时把 mounted 置 false，阻止后续 setState。
    return () => {
      mounted = false;
    };
  }, []); // 空依赖数组：仅在挂载时执行一次。

  // ---- 工具：判断 SDK 返回是终态还是下一步 ----
  // ForgeRock 的 StepType 是字符串枚举："Step" / "LoginSuccess" / "LoginFailure"。
  // 直接比较字符串值，避免在组件里 import SDK 枚举——SDK 依赖浏览器环境，
  // 静态 import 会破坏 Next.js 的服务端渲染（与 sdk.js 动态 import 的初衷一致）。
  const isLoginSuccess = (res) => res?.type === "LoginSuccess";
  const isLoginFailure = (res) => res?.type === "LoginFailure";

  // ---- 步骤 1 → 2：提交用户名 + 邮箱 ----
  const handleStep1Next = async () => {
    setError("");

    // 仅校验第 1 步相关字段。
    // validateField 会运行完整 schema 但只返回/设置该字段路径上的错误，
    // 因此不会把第 2 步密码的错误提前暴露给用户。
    // 因 schemaResolver 为异步，这里需 await。
    const r1 = await accountForm.validateField("username");
    const r2 = await accountForm.validateField("email");
    if (r1.hasError || r2.hasError) return; // 有错误则停留在本步

    // 取出第 1 步 FRStep。理论上挂载时已写入 stepsRef.current[0]。
    const step = stepsRef.current[0];
    if (!step) {
      setError("注册流程尚未初始化，请稍候。");
      return;
    }

    // 把表单值写入 FRStep 的回调：
    //   callbacks[0] = ValidatedCreateUsernameCallback → 用户名
    //   callbacks[1] = StringAttributeInputCallback → 邮箱
    // FRCallback.setInputValue(value) 默认写入第 0 个 input 元素，
    // 这两个回调各只有一个 input，故无需指定索引。
    step.callbacks[0].setInputValue(accountForm.values.username);
    step.callbacks[1].setInputValue(accountForm.values.email);

    setLoading(true);
    try {
      // nextAuth 提交当前步骤，返回下一步或终态。
      // 传入 contextRef.current：Mock SDK 会把 { username, email }
      // 累积到 context.pendingUser，供后续步骤使用。
      const res = await nextAuth(step, contextRef.current);

      // 终态判定：失败则展示错误信息（如「用户名已被注册」）。
      if (isLoginFailure(res)) {
        setError(res.getMessage?.() || res.getDetail?.() || "提交失败");
        return;
      }

      // 成功推进：缓存第 2 步 FRStep，UI 前进到步骤 2（active=1）。
      stepsRef.current[1] = res;
      // 同步把第 2 步 stage 写入 state，供 UI 调试信息展示。
      setStages((prev) => {
        const next = [...prev];
        next[1] = res?.getStage?.() ?? "";
        return next;
      });
      setActive(1);
    } catch (e) {
      setError("提交失败：" + (e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  // ---- 步骤 2 → 3：提交密码 + 确认密码（+ 同意条款）----
  const handleStep2Next = async () => {
    setError("");

    // 校验第 2 步字段：密码、确认密码、同意条款。
    // confirmPassword 的「两次一致」由 registerSchema 的 refine 校验，
    // 其 path 指向 confirmPassword，故 validateField("confirmPassword")
    // 能正确返回该跨字段校验的错误。
    const r1 = await accountForm.validateField("password");
    const r2 = await accountForm.validateField("confirmPassword");
    const r3 = await accountForm.validateField("agree");
    if (r1.hasError || r2.hasError || r3.hasError) return;

    const step = stepsRef.current[1];
    if (!step) {
      setError("步骤数据丢失，请返回上一步重试。");
      return;
    }

    // 第 2 步只有一个 ValidatedCreatePasswordCallback → 密码。
    step.callbacks[0].setInputValue(accountForm.values.password);

    setLoading(true);
    try {
      // 提交后 Mock SDK 会把 password 累积到 context.pendingUser.password。
      const res = await nextAuth(step, contextRef.current);

      if (isLoginFailure(res)) {
        setError(res.getMessage?.() || res.getDetail?.() || "提交失败");
        return;
      }

      // 缓存第 3 步 FRStep，UI 前进到步骤 3（active=2）。
      stepsRef.current[2] = res;
      // 同步把第 3 步 stage 写入 state，供 UI 调试信息展示。
      setStages((prev) => {
        const next = [...prev];
        next[2] = res?.getStage?.() ?? "";
        return next;
      });
      setActive(2);
    } catch (e) {
      setError("提交失败：" + (e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  // ---- 步骤 3 → 完成：提交 2 个安全问题 + 答案 ----
  const handleStep3Submit = async () => {
    setError("");

    // securityForm.validate() 运行完整 securityQuestionsSchema（含「两问不同」的 refine）。
    // 返回 { hasErrors, errors }，hasErrors 为 true 表示有校验错误。
    const result = await securityForm.validate();
    if (result.hasErrors) return;

    const step = stepsRef.current[2];
    if (!step) {
      setError("步骤数据丢失，请返回上一步重试。");
      return;
    }

    // 第 3 步有 2 个 KbaCreateCallback，每个需设置「问题」和「答案」。
    // KbaCreateCallback 提供便捷方法：
    //   setQuestion(q) 写入 input[0]（安全问题文本）
    //   setAnswer(a)   写入 input[1]（用户答案）
    step.callbacks[0].setQuestion(securityForm.values.question1);
    step.callbacks[0].setAnswer(securityForm.values.answer1);
    step.callbacks[1].setQuestion(securityForm.values.question2);
    step.callbacks[1].setAnswer(securityForm.values.answer2);

    setLoading(true);
    try {
      // 提交后 Mock SDK 读取 context.pendingUser 与安全问题，创建用户并自动登录，
      // 返回 LoginSuccess 终态（内部已设置 currentSession）。
      const res = await nextAuth(step, contextRef.current);

      if (isLoginFailure(res)) {
        setError(res.getMessage?.() || res.getDetail?.() || "注册失败");
        return;
      }

      // 注册成功：展示提示并通知父组件。
      // getMessage() 返回友好文案（如「欢迎回来，新用户」）。
      const msg = res.getMessage?.() || "注册成功";
      setSuccess(msg);

      // 调用父组件传入的成功回调，把会话标识与消息传出。
      // 父组件可据此切换到「已登录」视图。
      onRegisterSuccess?.({
        sessionId: res.sessionId,
        message: msg,
      });
    } catch (e) {
      setError("注册失败：" + (e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  // ---- 统一的「下一步」分发：依据当前 active 调用对应处理函数 ----
  const handleNext = () => {
    if (active === 0) return handleStep1Next();
    if (active === 1) return handleStep2Next();
    if (active === 2) return handleStep3Submit();
  };

  // ---- 返回上一步：仅回退 UI（active），不重置已填表单数据 ----
  // stepsRef 保留了历史步骤，用户返回后再次「下一步」会重新提交对应步骤，
  // 因此来回切换是安全的。
  const handleBack = () => {
    setError("");
    if (active > 0) setActive(active - 1);
  };

  // ---- Stepper 点击跳转：注册成功后禁止跳转，避免误操作 ----
  // allowNextStepsSelect={false} 已限制只能点击已完成步骤；
  // 这里再在成功态拦截，防止注册完成后误回退。
  const handleStepClick = (index) => {
    if (success) return;
    setActive(index);
  };

  // 整体进度百分比：3 步，active=0→0%，1→33%，2→66%，完成(3)→100%。
  // 用 Math.min 防止超出 100。
  const progressValue = Math.min(Math.round((active / 3) * 100), 100);

  return (
    <Paper shadow="md" radius="lg" p="xl" withBorder>
      <Stack gap="md">
        {/* 标题区 */}
        <div>
          <Text fw={700} size="xl" component="h2">
            创建新账号
          </Text>
          <Text size="sm" c="dimmed">
            分 3 步完成注册：账号信息 → 设置密码 → 安全问题
          </Text>
        </div>

        {/* 整体进度条：辅助 Stepper 直观展示完成度 */}
        <Progress value={progressValue} size="sm" radius="xl" />

        {/* 全局错误提示：如「用户名已被注册」「邮箱已被注册」 */}
        {error && (
          <Alert
            color="red"
            variant="light"
            title="出错了"
            withCloseButton
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {/* 成功提示 */}
        {success && (
          <Alert color="green" variant="light" title="注册成功">
            {success}
          </Alert>
        )}

        {/* 调试信息：展示当前流程类型、步骤进度与 SDK 阶段名（Demo 调试用） */}
        <Code>
          流程: register | 当前步骤: {active + 1} / 3 | stage:{" "}
          {stages[active] || "—"}
        </Code>

        <Divider />

        {/* 分步器：
            active 控制当前高亮步骤；
            onStepClick 支持点击已完成步骤回看；
            allowNextStepsSelect={false} 禁止跳到尚未到达的步骤。 */}
        <Stepper
          active={active}
          onStepClick={handleStepClick}
          allowNextStepsSelect={false}
        >
          {/* ===== 步骤 1：用户名 + 邮箱 ===== */}
          <Stepper.Step label="账号信息" description="用户名与邮箱">
            <Stack gap="md" mt="sm">
              <TextInput
                label="用户名"
                placeholder="2-32 位字母、数字、下划线"
                /* key() 返回字段稳定 key，保证字段在 Stepper 卸载/挂载时状态正确重置 */
                key={accountForm.key("username")}
                /* getInputProps 展开返回 { value, onChange, error, ... }，
                   一次性接好受控值、变更与错误展示 */
                {...accountForm.getInputProps("username")}
              />
              <TextInput
                label="邮箱"
                placeholder="you@example.com"
                key={accountForm.key("email")}
                {...accountForm.getInputProps("email")}
              />
            </Stack>
          </Stepper.Step>

          {/* ===== 步骤 2：密码 + 确认密码 + 同意条款 ===== */}
          <Stepper.Step label="设置密码" description="密码与确认">
            <Stack gap="md" mt="sm">
              <PasswordInput
                label="密码"
                placeholder="至少 8 位，含字母和数字"
                /* PasswordInput 自带显示/隐藏与强度指示，无需额外实现（Mantine v9） */
                key={accountForm.key("password")}
                {...accountForm.getInputProps("password")}
              />
              <PasswordInput
                label="确认密码"
                placeholder="再次输入密码"
                key={accountForm.key("confirmPassword")}
                {...accountForm.getInputProps("confirmPassword")}
              />
              {/* 同意条款复选框：registerSchema 要求 agree === true。
                  按 Demo 要求不在 Checkbox 上使用 withAsterisk。
                  type: "checkbox" 让 getInputProps 返回 checked/onChange 适配复选框。 */}
              <Checkbox
                label="我已阅读并同意《服务条款》与《隐私政策》"
                key={accountForm.key("agree")}
                {...accountForm.getInputProps("agree", { type: "checkbox" })}
              />
            </Stack>
          </Stepper.Step>

          {/* ===== 步骤 3：2 个安全问题 + 答案 ===== */}
          <Stepper.Step label="安全问题" description="用于账户恢复">
            <Stack gap="md" mt="sm">
              <Select
                label="安全问题 1"
                placeholder="请选择一个问题"
                /* data 必须是 [{ value, label }, ...] 格式 */
                data={questions}
                key={securityForm.key("question1")}
                {...securityForm.getInputProps("question1")}
              />
              <TextInput
                label="答案 1"
                placeholder="2-100 个字符"
                key={securityForm.key("answer1")}
                {...securityForm.getInputProps("answer1")}
              />
              <Select
                label="安全问题 2"
                placeholder="请选择另一个问题"
                data={questions}
                key={securityForm.key("question2")}
                {...securityForm.getInputProps("question2")}
              />
              <TextInput
                label="答案 2"
                placeholder="2-100 个字符"
                key={securityForm.key("answer2")}
                {...securityForm.getInputProps("answer2")}
              />
            </Stack>
          </Stepper.Step>

          {/* ===== 完成态：active=3 时展示 ===== */}
          <Stepper.Completed>
            <Alert color="green" variant="light" title="注册完成">
              {success || "您的账号已创建并自动登录。"}
            </Alert>
          </Stepper.Completed>
        </Stepper>

        <Divider />

        {/* 操作按钮区 */}
        <Group justify="space-between">
          {/* 左侧：切换到登录 */}
          <Button variant="subtle" color="gray" onClick={onSwitchToLogin}>
            已有账号？去登录
          </Button>

          {/* 右侧：上一步 / 下一步（完成注册） */}
          <Group>
            {/* 返回按钮：第 1 步或已成功时隐藏 */}
            {active > 0 && !success && (
              <Button variant="default" onClick={handleBack} disabled={loading}>
                上一步
              </Button>
            )}
            {/* 下一步 / 完成注册：成功后隐藏 */}
            {!success && (
              <Button onClick={handleNext} loading={loading}>
                {active === 2 ? "完成注册" : "下一步"}
              </Button>
            )}
          </Group>
        </Group>
      </Stack>
    </Paper>
  );
}
