// =============================================================
// mini-zod —— 一个迷你版的 Zod Schema 验证库
// -------------------------------------------------------------
// 【设计目标】
//   用不到 800 行代码实现 Zod 的核心能力，覆盖：
//     - 原始类型：string / number / boolean / date
//     - 复合类型：array / object / enum / literal / union / intersection
//     - 修饰器：optional / nullable / nullish / default
//     - 高阶能力：refine(自定义校验) / transform(转换) / pipe(管道)
//     - 对象增强：partial / pick / omit / extend / strict
//     - 统一 API：parse(抛异常) / safeParse(返回结果对象)
//
// 【核心思想：Schema-driven Validation（Schema 驱动校验）】
//   Zod 的本质是「用对象描述数据形状(Schema)，再由 Schema 驱动校验」。
//   每个 Schema 都是一个继承自 ZodType 的对象，它知道：
//     1. 如何判断输入是否符合自己描述的形状（_parse）
//     2. 如何把自己组合成更复杂的形状（optional/nullable/array...）
//     3. 如何把校验结果以统一格式返回（{ success, data } | { success, error }）
//
//   这种「声明 Schema → 复用 Schema」的范式带来三大好处：
//     a) 单一数据源：Schema 既是运行时校验器，也是类型定义（TS 推断）
//     b) 复用与组合：可以像搭积木一样把小 Schema 拼成大 Schema
//     c) 自动错误结构：所有失败都返回 { path, message, code }，UI 直接用
//
// 【_parse 是整个库的心脏】
//   每个子类实现自己的 _parse(input)，返回：
//     - 成功：{ success: true, data }            // data 可能经过转换
//     - 失败：{ success: false, error: ZodError } // error 含 issues 数组
//   基类的 parse / safeParse 都依赖 _parse。
//   返回 Result 风格（不抛异常）的好处：
//     - 调用方决定如何处理错误（表单场景不希望异常打断渲染）
//     - 链式组合时错误可以层层向上传递
//
// 【为什么用 class 继承而不是函数组合】
//   class 继承让「修饰器方法」(optional/nullable/default/refine...) 可以链式调用：
//     z.string().min(8).optional()
//   这些方法在基类 ZodType 上定义一次，所有子类都能复用，避免重复代码。
//   同时，子类只需实现 _parse，无需关心 parse/safeParse/修饰器的实现细节。
//
// 【不可变（Immutable）设计】
//   所有链式方法都返回新对象，不修改原 Schema：
//     const base = z.string().min(3);    // base 描述「至少 3 字符」
//     const extended = base.max(10);     // extended 描述「3-10 字符」，base 不变
//   这让同一个 Schema 可以被多处安全复用，避免意外的状态污染。
//
// 【文件结构】
//   第一部分：错误系统        —— ZodError / makeIssue / ok / fail
//   第二部分：基类 ZodType     —— 提供统一 API 和修饰器
//   第三部分：原始类型        —— ZodString/Number/Boolean/Date
//   第四部分：复合类型        —— ZodArray/Object
//   第五部分：修饰器类型      —— ZodOptional/Nullable/Default
//   第六部分：枚举字面量等    —— ZodEnum/Literal/Union/Intersection
//   第七部分：高阶类型        —— ZodEffects(refine)/Transform/Pipe
//   第八部分：工厂函数 z      —— 对外暴露的统一入口
// =============================================================


// -------------------------------------------------------------
// 第一部分：错误系统
// -------------------------------------------------------------
// 校验失败的统一表示：所有 _parse 失败时都返回 ZodError。
// 设计要点：
//   1. 错误要结构化（issues 数组而非单条 message），便于 UI 逐字段定位
//   2. 每个 issue 携带 path（出错字段在对象中的位置），支持嵌套对象
//   3. ZodError 继承 Error，可以 throw 也可以作为返回值
// -------------------------------------------------------------

/**
 * ZodError —— 校验失败时抛出/返回的错误对象
 * 与原生 Error 的区别：它携带结构化的 issues 数组，
 * 每个 issue 描述「哪条路径出了什么错」，方便表单逐字段定位错误。
 *
 * @example
 *   const e = new ZodError([
 *     { path: ["user", "email"], message: "邮箱格式不正确", code: "invalid_string" },
 *     { path: ["password"],      message: "至少 8 位",      code: "too_small" },
 *   ]);
 *   e.flatten(); // { "user.email": ["邮箱格式不正确"], "password": ["至少 8 位"] }
 */
export class ZodError extends Error {
  constructor(issues) {
    super("Validation failed");
    this.name = "ZodError";
    // issues 形如 [{ path: ["user", "email"], message: "邮箱格式不正确", code: "invalid_string" }]
    // path 是数组而非字符串，方便支持数组索引（如 ["items", 0, "name"]）
    this.issues = issues;
  }

  /**
   * 把 issues 扁平化成 { "user.email": ["错误1"], "password": ["错误2"] } 的 map
   * 方便表单按字段名快速取错误提示。
   *
   * 约定：path 为空数组的 issue（对象级 refine 失败）会归到 "_root" 键下。
   */
  flatten() {
    const fieldErrors = {};
    for (const issue of this.issues) {
      // path 是数组，用 "." 连接；空 path 用 "_root" 占位（对象级错误）
      const key = issue.path.join(".") || "_root";
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return fieldErrors;
  }
}

/**
 * 创建一个 issue 对象（校验失败的最小描述单元）
 * @param {string}        code     - 错误类型码（如 "invalid_type" / "too_small"）
 * @param {string}        message  - 给人看的错误提示
 * @param {(string|number)[]} path - 出错字段在对象中的路径（如 ["user","email"]）
 */
function makeIssue(code, message, path = []) {
  return { code, message, path };
}

// 两个工厂函数：让 _parse 的返回值更易读
// 用 ok(data) 替代 { success: true, data }，用 fail(issues) 替代 { success: false, error: ... }
const ok = (data) => ({ success: true, data });
const fail = (issues) => ({ success: false, error: new ZodError(issues) });


// -------------------------------------------------------------
// 第二部分：基类 ZodType
// -------------------------------------------------------------
// 所有具体 Schema 类型（ZodString/ZodObject/...）都继承自 ZodType。
// 基类提供：
//   1. parse / safeParse —— 校验的统一入口（依赖子类的 _parse）
//   2. 修饰器方法 optional/nullable/nullish/default —— 描述「原类型 + 容错」
//   3. 高阶组合 refine/transform/pipe —— 描述「原类型 + 额外处理」
// 子类只需实现 _parse(input)，即可获得上述全部能力。
// -------------------------------------------------------------

/**
 * ZodType —— 所有 Schema 类型的基类
 *
 * 子类只需实现 _parse(input)，就能自动获得：
 *   - parse / safeParse（统一入口）
 *   - optional / nullable / nullish / default（修饰器）
 *   - refine / transform / pipe（高阶组合）
 */
class ZodType {
  constructor(def = {}) {
    // 存储 Schema 配置，子类通过 this._def 读取
    this._def = def;
  }

  /**
   * 子类必须实现：对 input 做校验，返回 { success, data } | { success, error }
   * 基类这里只是占位，子类不实现就抛错（避免忘记实现）
   *
   * 这是「模板方法模式」：基类定义算法骨架（parse/safeParse），子类填充细节（_parse）
   */
  _parse(input) {
    throw new Error("_parse must be implemented by subclass");
  }

  /**
   * parse —— 校验输入，成功返回数据，失败抛出 ZodError
   * 适合「断言式」用法：const user = userSchema.parse(req.body)
   *
   * 适合场景：API 入口、配置加载 —— 失败即终止，希望快速暴露问题
   */
  parse(input) {
    const result = this._parse(input);
    if (!result.success) {
      throw result.error;
    }
    return result.data;
  }

  /**
   * safeParse —— 校验输入，无论成功失败都返回结果对象（不抛异常）
   * 适合表单场景：const { success, data, error } = schema.safeParse(values)
   *
   * 适合场景：表单实时校验 —— 不希望异常打断 UI 渲染，由调用方决定如何展示错误
   */
  safeParse(input) {
    return this._parse(input);
  }

  // ---- 修饰器方法：返回新的 Schema，描述「原类型 + 某种修饰」----
  // 关键：每个方法都返回新对象，不修改 this（不可变设计）

  /** 允许值为 undefined（常用于可选字段） */
  optional() {
    return new ZodOptional({ innerType: this });
  }

  /** 允许值为 null（常用于可清空字段） */
  nullable() {
    return new ZodNullable({ innerType: this });
  }

  /** 允许值为 undefined 或 null（optional + nullable 的简写） */
  nullish() {
    // 嵌套包装：先 nullable 再 optional，两层都允许放行
    return new ZodOptional({ innerType: new ZodNullable({ innerType: this }) });
  }

  /**
   * 输入为 undefined 时使用默认值
   * defaultValue 支持函数（惰性求值，如 default(() => new Date())）
   */
  default(defaultValue) {
    return new ZodDefault({ innerType: this, defaultValue });
  }

  /**
   * 自定义校验：check 返回 false / 字符串 / 抛异常 都视为失败
   *
   * message 参数支持两种形式（与 Zod 官方 API 对齐）：
   *   1. 字符串：.refine(check, "错误提示")
   *   2. 配置对象：.refine(check, { message: "...", path: ["confirmPassword"] })
   *
   * path 用于把错误挂到具体字段上（用于对象级 refine 的跨字段校验），
   * 这样 flatten() 后能通过 fieldErrors["confirmPassword"] 取到错误信息，
   * 否则跨字段错误会落到 "_root" 下，UI 无法在对应字段下方显示。
   *
   * @example
   *   // 字段级 refine：只关心当前字段值
   *   z.string().refine(v => /[A-Z]/.test(v), "需要大写字母")
   *
   *   // 对象级 refine：能访问所有字段，用于跨字段校验
   *   z.object({ pwd, confirm }).refine(
   *     d => d.pwd === d.confirm,
   *     { message: "两次密码不一致", path: ["confirm"] }  // 错误挂到 confirm 字段
   *   )
   */
  refine(check, message = "校验失败") {
    // 统一把字符串参数转成 { message } 对象，方便 _parse 处理
    const opts = typeof message === "string"
      ? { message }
      : { message: message.message || "校验失败", path: message.path || [] };
    return new ZodEffects({ innerType: this, check, ...opts });
  }

  /**
   * 转换：校验通过后用 transform 函数把 data 转成新值
   * 这是 Zod「校验器 + 数据变换器」二合一的体现。
   * @example z.string().transform(s => parseInt(s, 10))  // string → number
   */
  transform(fn) {
    return new ZodTransform({ innerType: this, transform: fn });
  }

  /**
   * 把当前 Schema 的输出作为新 Schema 的输入，串联校验/转换
   * @example z.string().pipe(z.coerce.number())  // 先校验字符串，再转数字
   */
  pipe(target) {
    return new ZodPipe({ source: this, target });
  }
}


// -------------------------------------------------------------
// 第三部分：原始类型
// -------------------------------------------------------------
// 每种原始类型实现 _parse(input)：
//   1. 先做类型检查（typeof）
//   2. 再执行 checks 数组中的每条约束
// 失败立即返回 fail，全部通过返回 ok
// -------------------------------------------------------------

/**
 * ZodString —— 字符串类型
 *
 * 链式方法（min/max/email/regex...）都返回新的 ZodString，
 * 把新的「检查项」累积到 _def.checks 数组里。
 * _parse 时遍历 checks 逐条校验。
 *
 * 这种「checks 数组」设计的好处：
 *   1. 链式调用顺序就是校验顺序（先 min 再 max 还是先 max 再 min 都一样）
 *   2. 每条 check 独立，易于组合与扩展（新增约束只需加 case）
 *   3. 不可变：每次链式调用返回新对象，原 Schema 不被污染
 *
 * @example
 *   const username = z.string()
 *     .min(3, "用户名至少 3 个字符")
 *     .max(20, "用户名最多 20 个字符")
 *     .regex(/^[a-zA-Z0-9_]+$/, "只能字母数字下划线");
 */
class ZodString extends ZodType {
  constructor(def = { checks: [] }) {
    super(def);
  }

  _parse(input) {
    // 第一步：类型检查（所有类型校验的第一道关卡）
    // 注意：typeof null === "object"，但 typeof undefined === "undefined"
    // 所以这里 typeof 检查已经把 null/undefined 都排除了
    if (typeof input !== "string") {
      return fail([makeIssue("invalid_type", `期望 string，实际 ${typeof input}`, [])]);
    }

    let value = input;

    // 第二步：依次执行 checks 数组中的每条校验
    // 每条 check 都可携带自定义 message（用户调用 .min(3, "xxx") 时传入），
    // 若未提供则使用内置默认提示。这样既能链式配置又保留灵活的错误文案。
    // 任何一条 check 失败立即返回（短路），不继续后面的 check
    for (const check of this._def.checks) {
      switch (check.kind) {
        case "min":
          if (value.length < check.value) {
            return fail([makeIssue("too_small", check.message || `至少 ${check.value} 个字符`, [])]);
          }
          break;
        case "max":
          if (value.length > check.value) {
            return fail([makeIssue("too_big", check.message || `最多 ${check.value} 个字符`, [])]);
          }
          break;
        case "length":
          if (value.length !== check.value) {
            return fail([makeIssue("invalid_length", check.message || `必须是 ${check.value} 个字符`, [])]);
          }
          break;
        case "email":
          // 简化版邮箱正则：xxx@xxx.xxx
          // 真实 Zod 用更复杂的正则，这里为了可读性简化
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return fail([makeIssue("invalid_string", check.message || "邮箱格式不正确", [])]);
          }
          break;
        case "url":
          // 用 URL 构造器校验，比正则更严格
          try {
            new URL(value);
          } catch {
            return fail([makeIssue("invalid_string", check.message || "URL 格式不正确", [])]);
          }
          break;
        case "uuid":
          // 标准 UUID 格式：8-4-4-4-12 位十六进制
          if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
            return fail([makeIssue("invalid_string", check.message || "UUID 格式不正确", [])]);
          }
          break;
        case "regex":
          // 通用正则校验：用户传入 RegExp 实例
          if (!check.value.test(value)) {
            return fail([makeIssue("invalid_string", check.message || "格式不正确", [])]);
          }
          break;
        case "startsWith":
          if (!value.startsWith(check.value)) {
            return fail([makeIssue("invalid_string", check.message || `必须以 "${check.value}" 开头`, [])]);
          }
          break;
        case "endsWith":
          if (!value.endsWith(check.value)) {
            return fail([makeIssue("invalid_string", check.message || `必须以 "${check.value}" 结尾`, [])]);
          }
          break;
        case "includes":
          if (!value.includes(check.value)) {
            return fail([makeIssue("invalid_string", check.message || `必须包含 "${check.value}"`, [])]);
          }
          break;
        case "nonempty":
          // nonempty 是 min(1) 的语义化别名，专门用于「必填」场景
          if (value.length === 0) {
            return fail([makeIssue("too_small", check.message || "不能为空", [])]);
          }
          break;
      }
    }

    return ok(value);
  }

  // ---- 链式方法：每条都返回新的 ZodString，把 check 追加到 checks 数组 ----
  // 不可变设计：返回新对象而非原地修改，保证同一个 Schema 可被多处复用
  // 这意味着：const a = z.string().min(3); const b = a.max(10);
  // a 仍然只有 min(3) 约束，b 才同时有 min(3) 和 max(10)
  _addCheck(check) {
    return new ZodString({ checks: [...this._def.checks, check] });
  }

  // 每个方法都支持可选的 message 参数：.min(3, "用户名至少 3 个字符")
  // 这样既能链式配置约束，又能为每条约束定制错误文案
  min(n, message) { return this._addCheck({ kind: "min", value: n, message }); }
  max(n, message) { return this._addCheck({ kind: "max", value: n, message }); }
  length(n, message) { return this._addCheck({ kind: "length", value: n, message }); }
  email(message) { return this._addCheck({ kind: "email", message }); }
  url(message) { return this._addCheck({ kind: "url", message }); }
  uuid(message) { return this._addCheck({ kind: "uuid", message }); }
  regex(re, message) { return this._addCheck({ kind: "regex", value: re, message }); }
  startsWith(s, message) { return this._addCheck({ kind: "startsWith", value: s, message }); }
  endsWith(s, message) { return this._addCheck({ kind: "endsWith", value: s, message }); }
  includes(s, message) { return this._addCheck({ kind: "includes", value: s, message }); }
  nonempty(message) { return this._addCheck({ kind: "nonempty", message }); }
}

/**
 * ZodNumber —— 数字类型
 *
 * 与 ZodString 类似的 checks 数组设计，但约束种类不同（大小、整数、正负、倍数）。
 * 注意：NaN 虽然是 number 类型，但几乎不会是用户想要的输入，
 * 所以这里明确拒绝 NaN（typeof NaN === "number" 但 isNaN(NaN) === true）。
 *
 * @example
 *   z.number().min(0).max(100).int()      // 0-100 的整数
 *   z.number().positive()                  // 正数
 *   z.number().multipleOf(2)               // 偶数
 */
class ZodNumber extends ZodType {
  constructor(def = { checks: [] }) {
    super(def);
  }

  _parse(input) {
    // 类型检查：拒绝非 number 类型，也拒绝 NaN
    if (typeof input !== "number" || Number.isNaN(input)) {
      return fail([makeIssue("invalid_type", `期望 number，实际 ${typeof input}`, [])]);
    }

    let value = input;
    // 与 ZodString 一致：每条 check 可携带自定义 message
    for (const check of this._def.checks) {
      switch (check.kind) {
        case "min":
          if (value < check.value) return fail([makeIssue("too_small", check.message || `必须 ≥ ${check.value}`, [])]);
          break;
        case "max":
          if (value > check.value) return fail([makeIssue("too_big", check.message || `必须 ≤ ${check.value}`, [])]);
          break;
        case "int":
          if (!Number.isInteger(value)) return fail([makeIssue("invalid_type", check.message || "必须是整数", [])]);
          break;
        case "positive":
          if (value <= 0) return fail([makeIssue("too_small", check.message || "必须是正数", [])]);
          break;
        case "nonnegative":
          if (value < 0) return fail([makeIssue("too_small", check.message || "不能为负数", [])]);
          break;
        case "negative":
          if (value >= 0) return fail([makeIssue("too_big", check.message || "必须是负数", [])]);
          break;
        case "multipleOf":
          // 注意浮点数取模可能有精度问题，真实 Zod 用更稳健的实现
          if (value % check.value !== 0) return fail([makeIssue("invalid_type", check.message || `必须是 ${check.value} 的倍数`, [])]);
          break;
      }
    }
    return ok(value);
  }

  _addCheck(check) {
    return new ZodNumber({ checks: [...this._def.checks, check] });
  }

  min(n, message) { return this._addCheck({ kind: "min", value: n, message }); }
  max(n, message) { return this._addCheck({ kind: "max", value: n, message }); }
  int(message) { return this._addCheck({ kind: "int", message }); }
  positive(message) { return this._addCheck({ kind: "positive", message }); }
  nonnegative(message) { return this._addCheck({ kind: "nonnegative", message }); }
  negative(message) { return this._addCheck({ kind: "negative", message }); }
  multipleOf(n, message) { return this._addCheck({ kind: "multipleOf", value: n, message }); }
}

/**
 * ZodBoolean —— 布尔类型
 * 最简单的类型：只做 typeof 检查，无 checks 数组
 * @example z.boolean()  // 接受 true / false
 */
class ZodBoolean extends ZodType {
  _parse(input) {
    if (typeof input !== "boolean") {
      return fail([makeIssue("invalid_type", `期望 boolean，实际 ${typeof input}`, [])]);
    }
    return ok(input);
  }
}

/**
 * ZodDate —— 日期类型
 * 接受 Date 实例；如果传入数字/字符串会尝试转成 Date（提升易用性）
 * 这种「宽容输入」设计避免了调用方反复 new Date() 的样板代码
 *
 * @example
 *   z.date()                  // 严格只接受 Date 实例（真实 Zod 行为）
 *   本 mini 版也接受数字/字符串并自动转换
 */
class ZodDate extends ZodType {
  _parse(input) {
    if (input instanceof Date) {
      // 检查无效日期（如 new Date("invalid") 会得到 Invalid Date）
      if (Number.isNaN(input.getTime())) {
        return fail([makeIssue("invalid_date", "无效日期", [])]);
      }
      return ok(input);
    }
    // 宽容处理：只对数字（时间戳）/ 字符串（ISO 日期）尝试转换
    // 注意：必须限定类型，否则 new Date(true)=1970-01-01T00:00:00.001Z、
    // new Date(null)=epoch 都会被当成「有效日期」，导致 boolean/null 被静默接受
    if (typeof input !== "number" && typeof input !== "string") {
      return fail([makeIssue("invalid_type", `期望 date，实际 ${input === null ? "null" : typeof input}`, [])]);
    }
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) {
      return fail([makeIssue("invalid_type", "无法解析为日期", [])]);
    }
    return ok(date);
  }
}


// -------------------------------------------------------------
// 第四部分：复合类型
// -------------------------------------------------------------
// 复合类型把多个 Schema 组合成更复杂的数据结构：
//   ZodArray：ZodType + element Schema → 数组
//   ZodObject：{ key: ZodType } → 对象
// 关键技术：递归调用子 Schema 的 _parse，把子错误 path 前面加上当前层级
// -------------------------------------------------------------

/**
 * ZodArray —— 数组类型
 * _def.element 描述数组元素的 Schema
 *
 * @example
 *   z.array(z.number())               // 数字数组
 *   z.array(z.string()).min(1).max(10) // 1-10 个字符串
 *
 * 错误路径设计：
 *   元素错误的 path 会带上索引，如 ["items", 0, "name"]
 *   方便 UI 高亮具体的数组元素
 */
class ZodArray extends ZodType {
  constructor(def) {
    super(def); // { element, checks }
  }

  _parse(input) {
    if (!Array.isArray(input)) {
      return fail([makeIssue("invalid_type", `期望 array，实际 ${typeof input}`, [])]);
    }

    const result = [];
    for (let i = 0; i < input.length; i++) {
      // 关键：逐元素用 element Schema 校验，path 带上索引方便定位
      // 这是「递归校验」的体现：element 可能是另一个复合 Schema
      const itemResult = this._def.element._parse(input[i]);
      if (!itemResult.success) {
        // 把子错误的 path 前面加上当前索引，形成完整路径
        // 例如 element 是 z.object({name: z.string()})，子错误原 path 是 ["name"]
        // 加索引后变成 [0, "name"]，UI 能定位到「第 0 个元素的 name 字段」
        const mapped = itemResult.error.issues.map((iss) => ({
          ...iss,
          path: [i, ...iss.path],
        }));
        return fail(mapped);
      }
      result.push(itemResult.data);
    }

    // 数组级别的 checks（min/max/length/nonempty）
    // 与元素校验分开：先校验所有元素，再校验数组本身
    if (this._def.checks) {
      for (const check of this._def.checks) {
        if (check.kind === "min" && result.length < check.value) {
          return fail([makeIssue("too_small", `至少 ${check.value} 个元素`, [])]);
        }
        if (check.kind === "max" && result.length > check.value) {
          return fail([makeIssue("too_big", `最多 ${check.value} 个元素`, [])]);
        }
        if (check.kind === "length" && result.length !== check.value) {
          return fail([makeIssue("invalid_length", `必须 ${check.value} 个元素`, [])]);
        }
      }
    }
    return ok(result);
  }

  min(n) { return new ZodArray({ element: this._def.element, checks: [...(this._def.checks || []), { kind: "min", value: n }] }); }
  max(n) { return new ZodArray({ element: this._def.element, checks: [...(this._def.checks || []), { kind: "max", value: n }] }); }
  length(n) { return new ZodArray({ element: this._def.element, checks: [...(this._def.checks || []), { kind: "length", value: n }] }); }
  nonempty() { return this.min(1); }
}

/**
 * ZodObject —— 对象类型（最常用的复合类型）
 *
 * _def.shape 是一个 { key: ZodType } 的对象，描述每个字段的 Schema。
 * _def.unknownKeys 描述「shape 中没有的额外字段」该如何处理。
 *
 * 三种额外字段策略（对应三种使用场景）：
 *   - strip（默认）：丢弃额外字段 —— 严格输出，防止意外数据穿透
 *   - passthrough：保留额外字段 —— 宽松输入，适合代理转发场景
 *   - strict：额外字段视为错误 —— 最严格，适合白名单校验
 *
 * 校验流程：
 *   1. 输入必须是对象（排除 null/Array，它们 typeof 都是 "object"）
 *   2. 遍历 shape 的每个 key，用对应 Schema 校验该字段
 *   3. 字段不存在时，交给字段 Schema 自己处理（ZodOptional 返回 undefined，
 *      ZodDefault 返回默认值，普通 Schema 报「required」错）
 *   4. 根据 unknownKeys 策略处理额外字段
 *
 * @example
 *   const userSchema = z.object({
 *     name: z.string(),
 *     age: z.number().optional(),
 *     role: z.string().default("user"),
 *   });
 */
class ZodObject extends ZodType {
  constructor(def) {
    super(def); // { shape, unknownKeys }
  }

  _parse(input) {
    // 注意 typeof null === "object"，需要单独排除
    // Array 也是 object，也要排除（数组不能当对象用）
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return fail([makeIssue("invalid_type", `期望 object，实际 ${input === null ? "null" : typeof input}`, [])]);
    }

    const result = {};
    const issues = [];
    const shape = this._def.shape;
    const unknownKeys = this._def.unknownKeys || "strip"; // strip | passthrough | strict

    // 1. 校验 shape 中定义的每个字段
    // 关键：字段不存在时传 undefined 给字段 Schema，由它自己决定怎么处理
    //   - ZodOptional._parse(undefined) → ok(undefined)
    //   - ZodDefault._parse(undefined) → ok(默认值)
    //   - ZodString._parse(undefined) → fail（类型不符）
    // 这种「把缺失值处理下放给字段」的设计避免了基类对修饰器的特殊判断
    for (const key of Object.keys(shape)) {
      const fieldSchema = shape[key];
      const hasKey = key in input;
      const value = hasKey ? input[key] : undefined;

      const fieldResult = fieldSchema._parse(value);
      if (!fieldResult.success) {
        // 把子错误的 path 前面加上字段名
        // 例如字段是 z.array(z.string())，子错误原 path 是 [0]
        // 加字段名后变成 ["items", 0]，UI 能定位到「items 字段的第 0 个元素」
        for (const iss of fieldResult.error.issues) {
          issues.push({ ...iss, path: [key, ...iss.path] });
        }
      } else {
        // 校验成功就写入结果：
        //   - 必填字段：直接写入
        //   - ZodOptional 且字段不存在：_parse 返回 ok(undefined)，写入 undefined
        //   - ZodDefault 且字段不存在：_parse 返回 ok(默认值)，写入默认值
        // 这里的统一写入避免了「字段不存在时不写入」导致 result 缺 key 的问题
        result[key] = fieldResult.data;
      }
    }

    // 如果字段校验已有错误，先返回（避免后续 strict 检查干扰）
    // 这是「fail fast」策略：字段错误优先于额外字段错误
    if (issues.length > 0) return fail(issues);

    // 2. 处理 shape 中未定义的「额外字段」
    for (const key of Object.keys(input)) {
      if (!(key in shape)) {
        if (unknownKeys === "passthrough") {
          // 原样保留额外字段（不校验）
          result[key] = input[key];
        } else if (unknownKeys === "strict") {
          // 额外字段视为错误（白名单模式）
          issues.push(makeIssue("unrecognized_key", `未定义的字段：${key}`, [key]));
        }
        // strip 模式直接忽略（不写入 result，相当于丢弃）
      }
    }

    if (issues.length > 0) return fail(issues);
    return ok(result);
  }

  // ---- 对象增强方法 ----
  // 这些方法都返回新的 ZodObject，体现了不可变设计
  // 应用场景：在不同场景复用同一个基础 Schema

  /** 允许保留额外字段（替代默认的 strip 行为） */
  passthrough() {
    return new ZodObject({ ...this._def, unknownKeys: "passthrough" });
  }

  /** 额外字段视为错误（白名单模式） */
  strict() {
    return new ZodObject({ ...this._def, unknownKeys: "strict" });
  }

  /**
   * 所有字段变可选
   * 应用场景：更新接口（PATCH）只需要传部分字段
   */
  partial() {
    const newShape = {};
    for (const [k, v] of Object.entries(this._def.shape)) {
      newShape[k] = v.optional();
    }
    return new ZodObject({ ...this._def, shape: newShape });
  }

  /**
   * 只保留指定字段（白名单）
   * @example userSchema.pick(["name", "email"])  // 只要 name 和 email
   */
  pick(keys) {
    const newShape = {};
    for (const k of keys) {
      if (k in this._def.shape) newShape[k] = this._def.shape[k];
    }
    return new ZodObject({ ...this._def, shape: newShape });
  }

  /**
   * 排除指定字段（黑名单）
   * @example userSchema.omit(["password"])  // 排除密码字段
   */
  omit(keys) {
    const newShape = {};
    for (const [k, v] of Object.entries(this._def.shape)) {
      if (!keys.includes(k)) newShape[k] = v;
    }
    return new ZodObject({ ...this._def, shape: newShape });
  }

  /**
   * 合并另一个对象 Schema（或额外字段定义）
   * @example userSchema.extend({ avatar: z.string() })
   */
  extend(extra) {
    return new ZodObject({
      ...this._def,
      shape: { ...this._def.shape, ...extra },
    });
  }

  /** 获取 shape（方便外部读取字段定义，如生成表单） */
  get shape() {
    return this._def.shape;
  }
}


// -------------------------------------------------------------
// 第五部分：修饰器类型
// -------------------------------------------------------------
// 修饰器包装一个内部 Schema，扩展其行为：
//   ZodOptional：允许 undefined
//   ZodNullable：允许 null
//   ZodDefault：undefined 时用默认值
// 设计模式：装饰器模式（Decorator Pattern），不修改原 Schema 即可增强
// -------------------------------------------------------------

/**
 * ZodOptional —— 包装一个 Schema，允许值为 undefined
 * _parse 先判 undefined，是则直接成功；否则交给内部 Schema 校验
 *
 * 这是 ZodObject 字段「可选」的实现基础：
 *   z.object({ age: z.number().optional() })
 *   当 age 缺失时，ZodObject 传 undefined 给 ZodOptional，返回 ok(undefined)
 */
class ZodOptional extends ZodType {
  _parse(input) {
    if (input === undefined) return ok(undefined);
    return this._def.innerType._parse(input);
  }
}

/**
 * ZodNullable —— 包装一个 Schema，允许值为 null
 * 与 ZodOptional 类似，但针对 null（表单中常见「清空」操作）
 */
class ZodNullable extends ZodType {
  _parse(input) {
    if (input === null) return ok(null);
    return this._def.innerType._parse(input);
  }
}

/**
 * ZodDefault —— 包装一个 Schema，输入为 undefined 时使用默认值
 *
 * 与 ZodOptional 的区别：
 *   ZodOptional：undefined → ok(undefined)（结果仍是 undefined）
 *   ZodDefault：undefined → ok(默认值)（结果被填充为默认值）
 *
 * defaultValue 支持函数形式，用于惰性求值：
 *   z.date().default(() => new Date())  // 每次校验都用当前时间
 */
class ZodDefault extends ZodType {
  _parse(input) {
    if (input === undefined) {
      // defaultValue 可能是函数（惰性求值），也可能是普通值
      const def = this._def.defaultValue;
      return ok(typeof def === "function" ? def() : def);
    }
    return this._def.innerType._parse(input);
  }
}


// -------------------------------------------------------------
// 第六部分：枚举 / 字面量 / 联合 / 交集
// -------------------------------------------------------------
// 这些类型描述「有限的取值集合」或「多种类型的组合」：
//   ZodEnum：从字符串列表中选一个（如下拉框选项）
//   ZodLiteral：精确匹配某个字面量（如 z.literal("admin")）
//   ZodUnion：多选一（如 string | number）
//   ZodIntersection：必须同时满足（如 有 a 字段 AND 有 b 字段）
// -------------------------------------------------------------

/**
 * ZodEnum —— 从一组字符串字面量中选一个
 * 如 z.enum(["red", "green", "blue"])
 *
 * 应用场景：下拉框、单选按钮组的值校验
 * options getter 方便 UI 读取所有合法值生成选项
 */
class ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input !== "string" || !this._def.values.includes(input)) {
      return fail([makeIssue("invalid_enum_value", `必须是 ${this._def.values.join(" | ")} 之一`, [])]);
    }
    return ok(input);
  }

  // 提取枚举值数组，方便生成 UI 下拉选项
  get options() {
    return this._def.values;
  }
}

/**
 * ZodLiteral —— 精确匹配某个字面量值
 * 如 z.literal("hello") 只接受 "hello"
 *
 * 与 ZodEnum 的区别：ZodLiteral 只匹配一个值，ZodEnum 匹配多个之一
 * 常用于判别式联合（discriminated union）的 tag 字段
 */
class ZodLiteral extends ZodType {
  _parse(input) {
    if (input !== this._def.value) {
      return fail([makeIssue("invalid_literal", `必须是 ${JSON.stringify(this._def.value)}`, [])]);
    }
    return ok(input);
  }
}

/**
 * ZodUnion —— 联合类型：多个 Schema 中任一通过即可
 * 如 z.union([z.string(), z.number()]) 接受字符串或数字
 *
 * 实现：依次尝试每个 Schema，全部失败才报错
 * 短路策略：第一个成功的 Schema 立即返回，不再尝试后续
 *
 * 应用场景：
 *   - 多种输入格式：z.union([z.string(), z.number()])
 *   - 多种对象形状：z.union([adminSchema, userSchema])
 *
 * 错误信息：聚合各分支的首条 issue 到 unionErrors 字段，
 * 方便调试时看到「每个分支分别为什么失败」，而非只有一句笼统提示。
 */
class ZodUnion extends ZodType {
  _parse(input) {
    const branchIssues = [];
    for (const option of this._def.options) {
      const result = option._parse(input);
      if (result.success) return result;
      // 收集每个分支的首条错误，供聚合展示（真实 Zod 也会保留分支错误详情）
      branchIssues.push(...result.error.issues);
    }
    return fail([
      { ...makeIssue("invalid_union", "所有分支均校验失败", []), unionErrors: branchIssues },
    ]);
  }
}

/**
 * ZodIntersection —— 交集类型：所有 Schema 都要通过
 * 如 z.intersection(z.object({a: z.string()}), z.object({b: z.number()}))
 * 要求输入同时满足两个对象 Schema
 *
 * 与 ZodUnion 的区别：
 *   Union：任一通过即可（OR）
 *   Intersection：全部通过才行（AND）
 *
 * 应用场景：把多个对象 Schema 合并成一个更严格的 Schema
 * 成功时合并所有字段（对象用展开运算符合并）
 */
class ZodIntersection extends ZodType {
  _parse(input) {
    const left = this._def.left._parse(input);
    const right = this._def.right._parse(input);

    // 任一失败立即返回（fail fast）
    if (!left.success) return left;
    if (!right.success) return right;

    // 两个分支都成功：合并结果
    // 只对「纯对象」用展开运算符合并（后者覆盖前者的同名字段）。
    // 注意 typeof [] === "object" 且 typeof null === "object"，
    // 若不排除数组/null，{...[1,2]} 会得到 {0:1,1:2} 这种畸形对象。
    const isPlainObject = (v) =>
      v !== null && typeof v === "object" && !Array.isArray(v);
    if (isPlainObject(left.data) && isPlainObject(right.data)) {
      return ok({ ...left.data, ...right.data });
    }
    // 非纯对象：以后者为准（较少用）
    return ok(right.data);
  }
}


// -------------------------------------------------------------
// 第七部分：高阶类型（refine / transform / pipe）
// -------------------------------------------------------------
// 这些类型用于在基础校验之上叠加额外处理：
//   ZodEffects(refine)：自定义校验函数（如跨字段一致性检查）
//   ZodTransform：转换数据（如 string → number）
//   ZodPipe：串联两个 Schema（前者的输出作为后者的输入）
//
// 它们都包装一个内部 Schema，先让内部 Schema 校验通过，再做额外操作。
// 这种「先校验再加工」的分层设计让代码更清晰。
// -------------------------------------------------------------

/**
 * ZodEffects —— 自定义校验（refine 的底层实现）
 *
 * 先用内部 Schema 校验通过，再用 check 函数做额外校验。
 * check 返回值按「真值性」判定（与 Zod 官方一致）：
 *   - 非空字符串：校验失败，字符串作为错误信息（替代 message 参数）
 *   - 其他真值（true / 非零数字 / 对象...）：校验通过
 *   - 任意假值（false / 0 / NaN / null / undefined / ""）：校验失败，用 message 参数
 *   - 抛异常：异常 message 作为错误信息
 *
 * 这种「真值即通过、假值即失败」的语义让 refine 写起来很灵活，
 * 同时避免了常见陷阱——例如 .refine(v => v.match(/\d/)) 未匹配时返回 null，
 * 应当判为失败（旧实现只在严格 === false 时才失败，会把 null/0 误判为通过）：
 *   .refine(v => v.length > 0, "不能为空")            // 返回 boolean
 *   .refine(v => v.length > 0 ? true : "不能为空")    // 返回 string 作为自定义消息
 *   .refine(v => v.match(/\d/), "需要数字")            // 返回 null/数组，按真值性判定
 *   .refine(v => { if (...) throw new Error("xxx") }) // 抛异常
 *
 * path 字段（来自 refine 的第二参数）决定错误挂载位置：
 *   - 默认 []：挂到 root（对象级错误）
 *   - ["confirmPassword"]：挂到 confirmPassword 字段
 *   这对跨字段校验至关重要，让 UI 能在对应字段下显示错误
 */

// 递归解包 ZodEffects/ZodTransform/ZodPipe，找到最底层的基础 Schema
// 用于判断一个链式 Schema 是否最终包装了 ZodObject（即对象级校验）
function _getBaseSchema(schema) {
  if (schema instanceof ZodEffects || schema instanceof ZodTransform) {
    return _getBaseSchema(schema._def.innerType);
  }
  if (schema instanceof ZodPipe) {
    return _getBaseSchema(schema._def.source);
  }
  return schema;
}

class ZodEffects extends ZodType {
  _parse(input) {
    const inner = this._def.innerType._parse(input);
    const path = this._def.path || [];

    // 确定用于 check 的数据：
    //   - inner 成功：用 inner.data（经过字段校验/转换的干净数据）
    //   - inner 失败且最终包装的是 ZodObject（对象级 refine）：
    //     仍然用原始 input 执行跨字段校验，因为用户在逐字段填写表单时，
    //     即使其他字段未填完，当前字段的跨字段错误（如密码不一致）也应该显示。
    //     这避免了「字段错误阻塞跨字段校验」导致 UI 不报错的问题。
    //   - inner 失败且非对象级（字段级 refine 类型错误）：直接返回 inner 错误，
    //     因为类型不对时执行 check 没有意义（如 z.string().refine(...) 收到 undefined）
    const isObjectLevel = _getBaseSchema(this) instanceof ZodObject;
    let dataToCheck;
    if (inner.success) {
      dataToCheck = inner.data;
    } else if (isObjectLevel) {
      dataToCheck = input;
    } else {
      return inner;
    }

    // 收集对象级 refine 产生的额外错误
    let extraIssue = null;
    try {
      const checkResult = this._def.check(dataToCheck);
      if (typeof checkResult === "string" && checkResult.length > 0) {
        extraIssue = makeIssue("custom", checkResult, path);
      } else if (!checkResult) {
        extraIssue = makeIssue("custom", this._def.message, path);
      }
    } catch (e) {
      // 对象级 refine 在字段不完整时可能因访问 undefined 属性而抛异常
      // （如 data.password.length 当 password 为 undefined 时）
      // 捕获异常但不添加错误，因为此时字段错误才是主要问题
      if (inner.success) {
        extraIssue = makeIssue("custom", e.message, path);
      }
    }

    // 根据 inner 结果和 extraIssue 组合返回
    if (inner.success) {
      if (extraIssue) {
        return fail([extraIssue]);
      }
      return ok(inner.data);
    } else {
      // inner 有字段错误，把对象级 refine 的错误也合并进去
      if (extraIssue) {
        // 避免重复添加相同 path+message 的错误
        const alreadyHas = inner.error.issues.some(
          (iss) =>
            iss.path.join(".") === extraIssue.path.join(".") &&
            iss.message === extraIssue.message
        );
        if (!alreadyHas) {
          return fail([...inner.error.issues, extraIssue]);
        }
      }
      return inner;
    }
  }
}

/**
 * ZodTransform —— 转换：校验通过后用 transform 函数变换数据
 * 如 z.string().transform(s => s.toUpperCase())
 *
 * 关键特性：转换后的类型可能和输入不同！
 *   z.string().transform(s => parseInt(s, 10))  // string → number
 * 这是 Zod「校验器 + 数据变换器」二合一的体现，
 * 让 Schema 不仅能验证数据，还能规范化数据格式。
 *
 * 应用场景：
 *   - 字符串 trim：z.string().transform(s => s.trim())
 *   - 字符串转数字：z.string().transform(s => parseInt(s, 10))
 *   - 复杂对象重组：z.object({...}).transform(o => flatten(o))
 *
 * 如果 transform 抛异常，会被捕获并转成校验失败
 */
class ZodTransform extends ZodType {
  _parse(input) {
    const inner = this._def.innerType._parse(input);
    if (!inner.success) return inner;
    try {
      // 用 transform 函数处理已校验通过的数据
      // 异常会被捕获并转成 fail（让 transform 也能做校验）
      return ok(this._def.transform(inner.data));
    } catch (e) {
      return fail([makeIssue("custom", e.message, [])]);
    }
  }
}

/**
 * ZodPipe —— 管道：把 source 的输出作为 target 的输入
 * 串联校验/转换，如 z.string().pipe(z.coerce.number())
 *
 * 与 transform 的区别：
 *   transform：用任意函数变换（无类型保障）
 *   pipe：用另一个 Schema 校验（有类型保障，target 的输出符合其描述）
 *
 * 应用场景：
 *   - 先转类型再校验：z.string().pipe(z.number())  // string → number → 校验
 *   - 多阶段处理：先 trim 再校验长度
 *
 * 实现：source._parse → target._parse，任一失败即返回
 */
class ZodPipe extends ZodType {
  _parse(input) {
    const source = this._def.source._parse(input);
    if (!source.success) return source;
    return this._def.target._parse(source.data);
  }
}


// -------------------------------------------------------------
// 第八部分：工厂函数（对外暴露的 z 对象）
// -------------------------------------------------------------
// z 是统一入口，所有 Schema 都从这里创建：
//   z.string() / z.number() / z.object({...}) / z.enum([...]) ...
//
// 设计考量：
//   1. 用对象方法而非导出多个独立函数，避免命名冲突（如 string/z.string）
//   2. 工厂函数都返回 new XxxSchema()，每次调用都是新实例（不可变）
//   3. 与 Zod 官方 API 对齐，方便迁移到真实 Zod
// -------------------------------------------------------------

/**
 * z —— 统一的入口对象，所有 Schema 都从这里创建
 * 用法：z.string() / z.number() / z.object({...}) / z.enum([...]) ...
 */
export const z = {
  // 原始类型（无参数，返回空 Schema 实例）
  string: () => new ZodString(),
  number: () => new ZodNumber(),
  boolean: () => new ZodBoolean(),
  date: () => new ZodDate(),

  // 复合类型（带参数：element Schema / shape 对象）
  array: (element) => new ZodArray({ element, checks: [] }),
  object: (shape) => new ZodObject({ shape, unknownKeys: "strip" }),

  // 枚举与字面量
  enum: (values) => new ZodEnum({ values }),
  literal: (value) => new ZodLiteral({ value }),

  // 联合与交集
  union: (options) => new ZodUnion({ options }),
  intersection: (left, right) => new ZodIntersection({ left, right }),

  // 工具：从已有 Schema 推断类型（运行时无操作，仅用于 TS 类型推断的占位）
  // 在纯 JS 中这个函数只是原样返回，保留是为了和 Zod API 对齐
  inferred: (schema) => schema,
};

// 把所有内部类导出（方便调试和扩展）
// 用户通常只需 z 工厂对象，但高级用法可能需要直接访问类（如 instanceof 检查）
export {
  ZodType,
  ZodString,
  ZodNumber,
  ZodBoolean,
  ZodDate,
  ZodArray,
  ZodObject,
  ZodOptional,
  ZodNullable,
  ZodDefault,
  ZodEnum,
  ZodLiteral,
  ZodUnion,
  ZodIntersection,
  ZodEffects,
  ZodTransform,
  ZodPipe,
};
