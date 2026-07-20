// =============================================================
// mini-zod —— 一个迷你版的 Zod Schema 验证库
// -------------------------------------------------------------
// 【设计目标】
//   用不到 500 行代码实现 Zod 的核心能力，覆盖：
//     - 原始类型：string / number / boolean / date
//     - 复合类型：array / object / enum / literal / union / intersection
//     - 修饰器：optional / nullable / nullish / default
//     - 高阶能力：refine(自定义校验) / transform(转换) / pipe(管道) / preprocess
//     - 对象增强：partial / pick / omit / extend / strict
//     - 统一 API：parse(抛异常) / safeParse(返回结果对象)
//
// 【核心思想】
//   Zod 的本质是「用对象描述数据形状(Schema)，再由 Schema 驱动校验」。
//   每个 Schema 都是一个继承自 ZodType 的对象，它知道：
//     1. 如何判断输入是否符合自己描述的形状（_parse）
//     2. 如何把自己组合成更复杂的形状（optional/nullable/array...）
//     3. 如何把校验结果以统一格式返回（{ success, data } | { success, error }）
//
//   _parse(input) 是整个库的心脏：每个子类实现它，返回：
//     - 成功：{ success: true, data }
//     - 失败：{ success: false, error: ZodError }
//   基类的 parse / safeParse 都依赖 _parse。
//
// 【为什么用 class 继承而不是函数组合】
//   class 继承让「修饰器方法」(optional/nullable/default/refine...) 可以链式调用：
//     z.string().min(8).optional()
//   这些方法在基类 ZodType 上定义一次，所有子类都能复用，避免重复代码。
// =============================================================


// -------------------------------------------------------------
// 第一部分：错误系统
// -------------------------------------------------------------

/**
 * ZodError —— 校验失败时抛出/返回的错误对象
 * 与原生 Error 的区别：它携带结构化的 issues 数组，
 * 每个 issue 描述「哪条路径出了什么错」，方便表单逐字段定位错误。
 */
export class ZodError extends Error {
  constructor(issues) {
    super("Validation failed");
    this.name = "ZodError";
    // issues 形如 [{ path: ["user", "email"], message: "邮箱格式不正确" }]
    this.issues = issues;
  }

  // 把 issues 扁平化成 { "user.email": "邮箱格式不正确" } 的 map
  // 方便表单按字段名快速取错误提示
  flatten() {
    const fieldErrors = {};
    for (const issue of this.issues) {
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
const ok = (data) => ({ success: true, data });
const fail = (issues) => ({ success: false, error: new ZodError(issues) });


// -------------------------------------------------------------
// 第二部分：基类 ZodType
// -------------------------------------------------------------

/**
 * ZodType —— 所有 Schema 类型的基类
 *
 * 子类只需实现 _parse(input)，就能自动获得：
 *   - parse / safeParse（统一入口）
 *   - optional / nullable / nullish / default（修饰器）
 *   - refine / transform / pipe / preprocess（高阶组合）
 */
class ZodType {
  constructor(def = {}) {
    // _def 存放构造该 Schema 时的配置（如 min 的长度、object 的字段等）
    // 子类通过 super(def) 把配置传上来，自己的 _parse 再从 this._def 读取
    this._def = def;
  }

  /**
   * 子类必须实现：对 input 做校验，返回 { success, data } | { success, error }
   * 基类这里只是占位，子类不实现就抛错（避免忘记实现）
   */
  _parse(input) {
    throw new Error("_parse must be implemented by subclass");
  }

  /**
   * parse —— 校验输入，成功返回数据，失败抛出 ZodError
   * 适合「断言式」用法：const user = userSchema.parse(req.body)
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
   */
  safeParse(input) {
    return this._parse(input);
  }

  // ---- 修饰器方法：返回新的 Schema，描述「原类型 + 某种修饰」----

  /** 允许值为 undefined */
  optional() {
    return new ZodOptional({ innerType: this });
  }

  /** 允许值为 null */
  nullable() {
    return new ZodNullable({ innerType: this });
  }

  /** 允许值为 undefined 或 null（optional + nullable 的简写） */
  nullish() {
    return new ZodOptional({ innerType: new ZodNullable({ innerType: this }) });
  }

  /** 输入为 undefined 时使用默认值 */
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
   */
  refine(check, message = "校验失败") {
    // 统一把字符串参数转成 { message } 对象，方便 _parse 处理
    const opts = typeof message === "string"
      ? { message }
      : { message: message.message || "校验失败", path: message.path || [] };
    return new ZodEffects({ innerType: this, check, ...opts });
  }

  /** 转换：校验通过后用 transform 函数把 data 转成新值 */
  transform(fn) {
    return new ZodTransform({ innerType: this, transform: fn });
  }

  /** 把当前 Schema 的输出作为新 Schema 的输入，串联校验/转换 */
  pipe(target) {
    return new ZodPipe({ source: this, target });
  }
}


// -------------------------------------------------------------
// 第三部分：原始类型
// -------------------------------------------------------------

/**
 * ZodString —— 字符串类型
 *
 * 链式方法（min/max/email/regex...）都返回新的 ZodString，
 * 把新的「检查项」累积到 _def.checks 数组里。
 * _parse 时遍历 checks 逐条校验。
 *
 * 这种「checks 数组」设计的好处：链式调用顺序就是校验顺序，
 * 且每条 check 独立，易于组合与扩展。
 */
class ZodString extends ZodType {
  constructor(def = { checks: [] }) {
    super(def);
  }

  _parse(input) {
    // 第一步：类型检查（所有类型校验的第一道关卡）
    if (typeof input !== "string") {
      return fail([makeIssue("invalid_type", `期望 string，实际 ${typeof input}`, [])]);
    }

    let value = input;

    // 第二步：依次执行 checks 数组中的每条校验
    // 每条 check 都可携带自定义 message（用户调用 .min(3, "xxx") 时传入），
    // 若未提供则使用内置默认提示。这样既能链式配置又保留灵活的错误文案。
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
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return fail([makeIssue("invalid_string", check.message || "邮箱格式不正确", [])]);
          }
          break;
        case "url":
          try {
            new URL(value);
          } catch {
            return fail([makeIssue("invalid_string", check.message || "URL 格式不正确", [])]);
          }
          break;
        case "uuid":
          if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
            return fail([makeIssue("invalid_string", check.message || "UUID 格式不正确", [])]);
          }
          break;
        case "regex":
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
 * 注意：NaN 虽然是 number 类型，但几乎不会是用户想要的输入，
 * 所以这里明确拒绝 NaN。
 */
class ZodNumber extends ZodType {
  constructor(def = { checks: [] }) {
    super(def);
  }

  _parse(input) {
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
 */
class ZodDate extends ZodType {
  _parse(input) {
    if (input instanceof Date) {
      if (Number.isNaN(input.getTime())) {
        return fail([makeIssue("invalid_date", "无效日期", [])]);
      }
      return ok(input);
    }
    // 宽容处理：数字/字符串尝试转换
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

/**
 * ZodArray —— 数组类型
 * _def.element 描述数组元素的 Schema
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
      const itemResult = this._def.element._parse(input[i]);
      if (!itemResult.success) {
        // 把子错误的 path 前面加上当前索引，形成完整路径
        const mapped = itemResult.error.issues.map((iss) => ({
          ...iss,
          path: [i, ...iss.path],
        }));
        return fail(mapped);
      }
      result.push(itemResult.data);
    }

    // 数组级别的 checks（min/max/length/nonempty）
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
 * _def.catchall 描述「shape 中没有的额外字段」该如何处理（strip/passthrough/strict）。
 *
 * 校验流程：
 *   1. 输入必须是对象
 *   2. 遍历 shape 的每个 key，用对应 Schema 校验该字段
 *   3. 根据 catchall 策略处理额外字段：
 *      - strip（默认）：丢弃额外字段
 *      - passthrough：保留额外字段
 *      - strict：额外字段视为错误
 */
class ZodObject extends ZodType {
  constructor(def) {
    super(def); // { shape, catchall, unknownKeys }
  }

  _parse(input) {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return fail([makeIssue("invalid_type", `期望 object，实际 ${input === null ? "null" : typeof input}`, [])]);
    }

    const result = {};
    const issues = [];
    const shape = this._def.shape;
    const unknownKeys = this._def.unknownKeys || "strip"; // strip | passthrough | strict

    // 1. 校验 shape 中定义的每个字段
    for (const key of Object.keys(shape)) {
      const fieldSchema = shape[key];
      const hasKey = key in input;
      const value = hasKey ? input[key] : undefined;

      const fieldResult = fieldSchema._parse(value);
      if (!fieldResult.success) {
        // 把子错误的 path 前面加上字段名
        for (const iss of fieldResult.error.issues) {
          issues.push({ ...iss, path: [key, ...iss.path] });
        }
      } else {
        // 校验成功就写入结果：
        //   - 必填字段：直接写入
        //   - ZodOptional 且字段不存在：_parse 返回 ok(undefined)，写入 undefined
        //   - ZodDefault 且字段不存在：_parse 返回 ok(默认值)，写入默认值
        result[key] = fieldResult.data;
      }
    }

    // 如果字段校验已有错误，先返回（避免后续 strict 检查干扰）
    if (issues.length > 0) return fail(issues);

    // 2. 处理 shape 中未定义的「额外字段」
    for (const key of Object.keys(input)) {
      if (!(key in shape)) {
        if (unknownKeys === "passthrough") {
          result[key] = input[key];
        } else if (unknownKeys === "strict") {
          issues.push(makeIssue("unrecognized_key", `未定义的字段：${key}`, [key]));
        }
        // strip 模式直接忽略
      }
    }

    if (issues.length > 0) return fail(issues);
    return ok(result);
  }

  // ---- 对象增强方法 ----

  /** 允许保留额外字段 */
  passthrough() {
    return new ZodObject({ ...this._def, unknownKeys: "passthrough" });
  }

  /** 额外字段视为错误 */
  strict() {
    return new ZodObject({ ...this._def, unknownKeys: "strict" });
  }

  /** 所有字段变可选 */
  partial() {
    const newShape = {};
    for (const [k, v] of Object.entries(this._def.shape)) {
      newShape[k] = v.optional();
    }
    return new ZodObject({ ...this._def, shape: newShape });
  }

  /** 只保留指定字段 */
  pick(keys) {
    const newShape = {};
    for (const k of keys) {
      if (k in this._def.shape) newShape[k] = this._def.shape[k];
    }
    return new ZodObject({ ...this._def, shape: newShape });
  }

  /** 排除指定字段 */
  omit(keys) {
    const newShape = {};
    for (const [k, v] of Object.entries(this._def.shape)) {
      if (!keys.includes(k)) newShape[k] = v;
    }
    return new ZodObject({ ...this._def, shape: newShape });
  }

  /** 合并另一个对象 Schema */
  extend(extra) {
    return new ZodObject({
      ...this._def,
      shape: { ...this._def.shape, ...extra },
    });
  }

  /** 获取 shape（方便外部读取字段定义） */
  get shape() {
    return this._def.shape;
  }
}


// -------------------------------------------------------------
// 第五部分：修饰器类型
// -------------------------------------------------------------

/**
 * ZodOptional —— 包装一个 Schema，允许值为 undefined
 * _parse 先判 undefined，是则直接成功；否则交给内部 Schema 校验
 */
class ZodOptional extends ZodType {
  _parse(input) {
    if (input === undefined) return ok(undefined);
    return this._def.innerType._parse(input);
  }
}

/**
 * ZodNullable —— 包装一个 Schema，允许值为 null
 */
class ZodNullable extends ZodType {
  _parse(input) {
    if (input === null) return ok(null);
    return this._def.innerType._parse(input);
  }
}

/**
 * ZodDefault —— 包装一个 Schema，输入为 undefined 时使用默认值
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

/**
 * ZodEnum —— 从一组字符串字面量中选一个
 * 如 z.enum(["red", "green", "blue"])
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
 * 优化点：返回第一个子 Schema 的错误信息（更友好）
 */
class ZodUnion extends ZodType {
  _parse(input) {
    const errors = [];
    for (const option of this._def.options) {
      const result = option._parse(input);
      if (result.success) return result;
      errors.push(result.error.issues[0]);
    }
    return fail([makeIssue("invalid_union", "所有分支均校验失败", [])]);
  }
}

/**
 * ZodIntersection —— 交集类型：所有 Schema 都要通过
 * 如 z.intersection(z.object({a: z.string()}), z.object({b: z.number()}))
 * 要求输入同时满足两个对象 Schema
 */
class ZodIntersection extends ZodType {
  _parse(input) {
    const left = this._def.left._parse(input);
    const right = this._def.right._parse(input);

    if (!left.success) return left;
    if (!right.success) return right;

    // 两个分支都成功：合并结果（对象合并，非对象以后者为准）
    if (typeof left.data === "object" && typeof right.data === "object") {
      return ok({ ...left.data, ...right.data });
    }
    return ok(right.data);
  }
}


// -------------------------------------------------------------
// 第七部分：高阶类型（refine / transform / pipe / preprocess）
// -------------------------------------------------------------

/**
 * ZodEffects —— 自定义校验（refine 的底层实现）
 *
 * 先用内部 Schema 校验通过，再用 check 函数做额外校验。
 * check 返回：
 *   - false：校验失败
 *   - true：校验通过
 *   - 字符串：校验失败，字符串作为错误信息
 *   - 抛异常：异常 message 作为错误信息
 */
class ZodEffects extends ZodType {
  _parse(input) {
    const inner = this._def.innerType._parse(input);
    if (!inner.success) return inner;

    // refine 的错误路径：默认 []（root），
    // 若 refine 调用时传了 { path: ["confirmPassword"] }，则错误挂到该字段
    const path = this._def.path || [];

    try {
      const checkResult = this._def.check(inner.data);
      if (checkResult === false) {
        return fail([makeIssue("custom", this._def.message, path)]);
      }
      if (typeof checkResult === "string") {
        return fail([makeIssue("custom", checkResult, path)]);
      }
      return ok(inner.data);
    } catch (e) {
      return fail([makeIssue("custom", e.message, path)]);
    }
  }
}

/**
 * ZodTransform —— 转换：校验通过后用 transform 函数变换数据
 * 如 z.string().transform(s => s.toUpperCase())
 * 注意：转换后的类型可能和输入不同，这是 Zod 强大之处的体现
 */
class ZodTransform extends ZodType {
  _parse(input) {
    const inner = this._def.innerType._parse(input);
    if (!inner.success) return inner;
    try {
      return ok(this._def.transform(inner.data));
    } catch (e) {
      return fail([makeIssue("custom", e.message, [])]);
    }
  }
}

/**
 * ZodPipe —— 管道：把 source 的输出作为 target 的输入
 * 串联校验/转换，如 z.string().pipe(z.coerce.number())
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

/**
 * z —— 统一的入口对象，所有 Schema 都从这里创建
 * 用法：z.string() / z.number() / z.object({...}) / z.enum([...]) ...
 */
export const z = {
  // 原始类型
  string: () => new ZodString(),
  number: () => new ZodNumber(),
  boolean: () => new ZodBoolean(),
  date: () => new ZodDate(),

  // 复合类型
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
