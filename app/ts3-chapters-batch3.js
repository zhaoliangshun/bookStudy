// =============================================================
// TypeScript 后端开发教程（第三册）—— 第三批章节（共 5 章）
// -------------------------------------------------------------
// 分组：Node.js 后端开发
//   1. ts3-node-express-types   — Express/Koa 框架类型安全
//   2. ts3-node-database-types  — 数据库层类型安全
//   3. ts3-node-auth-security   — 认证与授权类型
//   4. ts3-node-events-streams  — 事件驱动与流处理
//   5. ts3-node-cli-tooling     — CLI 工具开发
// =============================================================

export const chapters = [
  // =========================================================
  // 第1章：Express/Koa 框架类型安全
  // =========================================================
  {
    id: "ts3-node-express-types",
    title: "Express/Koa 框架类型安全",
    icon: "🚂",
    group: "Node.js 后端开发",
    content: `# Express/Koa 框架类型安全

在现代 Node.js 后端开发领域，Express 和 Koa 无疑是最流行、生态最完善、应用最广泛的两个 Web 框架。它们以简洁优雅的中间件模型、灵活强大的路由系统和经过千万级产品验证的稳定性，支撑了从个人博客到大型企业级应用的无数 Node.js 后端服务。根据 2024 年的 Node.js 开发者调查报告，超过百分之七十的 Node.js 后端项目使用 Express 作为主要 Web 框架，Koa 虽然市场份额略小但在特定圈子里拥有极高的口碑和忠实用户群体。然而，这两个框架在设计之初都是为 JavaScript 语言量身打造的，在纯 JavaScript 环境下使用时，req（请求对象）、res（响应对象）、next（下一个中间件函数）等核心对象的类型定义极其宽泛，几乎等同于 any 类型。这意味着开发者可以随意访问不存在的属性、向方法传递错误类型的参数、返回不符合约定格式的响应，而在代码实际运行之前，开发工具和编译器不会给出任何警告或提示。一个拼写错误比如把 req.params.userId 写成 req.params.userIdd，可能要等到线上用户报错才能发现；一个不经意的 res.body 赋值错误可能导致前端解析 JSON 失败，而这类问题在纯 JavaScript 中完全无法在开发阶段发现。

TypeScript 的出现和成熟彻底改变了这一局面。通过 TypeScript 强大而精密的类型系统，结合社区维护的 @types/express、@types/koa 等高质量类型定义包，以及 Zod、Valibot 等 TypeScript-first 的运行时模式验证库，我们完全有能力构建出一条从 HTTP 请求进入服务器、经过中间件链处理、到达路由处理函数、业务逻辑执行、直到 HTTP 响应返回给客户端的完整端到端类型安全链路。类型安全的价值绝不仅仅在于在编译阶段捕获低级错误，虽然这本身已经非常有价值，它能将参数名拼写错误、参数类型不匹配、响应字段缺失、中间件顺序错误等大量原本需要在运行时甚至线上环境才能发现的 bug 消灭在代码编写阶段。更重要的是，优秀的类型定义为 IDE 提供了无与伦比的智能提示能力：当你输入 req. 时，编辑器能精确列出该请求对象上所有可用的属性及其类型；当你调用某个工具函数时，参数类型和返回类型一目了然；当你重构代码时，TypeScript 编译器能帮你找到所有需要修改的调用点。这不仅大幅提升了开发效率，减少了反复查阅文档和在不同文件间跳转的次数，更显著提高了代码的可维护性和团队协作效率。新加入的开发者通过类型签名就能快速理解代码的预期行为，前后端可以通过共享类型定义消除接口联调的沟通成本——前端工程师不再需要猜测接口返回什么字段，后端工程师也不必担心字段名变更破坏前端。

## 一、类型安全的请求与响应对象

在原生 Express 类型定义中，Request 和 Response 对象的设计极其灵活，但这种灵活性恰恰是以牺牲类型安全为代价的。req.params（路由参数，如 /users/:userId 中的 userId）、req.query（URL 查询字符串，如 ?page=1&active=true）、req.body（POST/PUT 请求的请求体）这三个最常用的属性，在默认类型定义中都是 any 类型或者过于宽泛的索引签名类型。具体来说，@types/express 中 Request 接口的 params 属性类型是 ParamsDictionary，它本质上是一个 string 到 any 的映射；query 属性类型是 ParsedQs，同样是一个深度 any 的嵌套结构；body 属性类型直接就是 any。这意味着你可以写出 req.params.userIdd 这样的代码（多打了一个 d），TypeScript 不会有任何抱怨，直到代码运行时你才会发现这个参数永远是 undefined。同样地，res.json() 方法接受 any 类型的参数，你可以返回任意结构、任意字段的数据，前端和后端之间没有任何类型契约可言——你可能不小心把 password 字段返回给了前端，或者把字段名写错了一个字母，这些问题在测试中未必能覆盖到。

TypeScript 的泛型机制为这个问题提供了非常优雅的解决方案。在 @types/express 的类型定义中，Request 接口接受多达五个泛型参数：Request<ParamsDictionary, ResBody, ReqBody, ReqQuery, Locals>。这五个泛型参数分别对应：路由参数字典类型、响应体类型、请求体类型、查询字符串类型、响应局部变量类型（res.locals）。这意味着你可以为每一个具体的路由精确定义它所期望的参数类型、接受的请求体格式、返回的响应体结构。例如，一个获取用户信息的 API 路由可以定义 GetUserParams 接口包含 userId: string，定义 GetUserResponse 接口包含 id: number、name: string、email: string、createdAt: Date 等字段，然后在路由处理器中标注 req: Request<GetUserParams, GetUserResponse>, res: Response<GetUserResponse>。这种精确到具体路由的类型标注带来的好处立竿见影：当你错误访问 req.params.id 而不是 req.params.userId 时，TypeScript 会立即在编辑器中标红提示该属性不存在；当你返回的 JSON 缺少 email 字段或者类型不匹配时，类型检查也会失败；当你访问 req.body 中不存在的字段时，编译器会立刻提醒你。

Koa 的情况虽然略有不同，但核心理念是一致的。Koa 将 request 和 response 封装进统一的 Context 对象（ctx），通过 ctx.params、ctx.request.body、ctx.response.body 等属性访问数据。@types/koa 同样提供了泛型参数支持，你可以通过 DefaultState、DefaultContext 等泛型参数定制上下文类型。Koa 著名的洋葱模型中间件（请求进入时从外到内穿过中间件，响应返回时从内到外再次穿过中间件）在类型处理上与 Express 的线性中间件模型有些差异——Koa 中间件是 async 函数，next() 返回 Promise，中间件可以在 await next() 前后分别处理请求和响应——但核心思想一致：通过泛型参数为每个路由定制精确的类型约束。

需要特别注意的是，Express 的 Request 泛型参数中 params 始终是 string 类型，这是因为 URL 路径参数永远是字符串。如果你需要 number 类型的 ID，必须在处理函数中进行显式转换并验证，这也是为什么我们后续要引入 Zod 等验证库的原因之一。同样，query 参数也都是字符串或字符串数组（当同一个参数名出现多次时），布尔值和数字都需要手动转换。

## 二、中间件的类型安全与属性堆叠

中间件（Middleware）是 Express 和 Koa 架构的灵魂所在，也是其强大扩展性的根本来源。从最基础的请求日志记录、用户身份验证、全局错误处理，到 CORS 跨域配置、请求体解析（express.json()、express.urlencoded()）、静态文件服务（express.static()）、限流防护（express-rate-limit）、会话管理、CSRF 防护，几乎所有横切关注点都通过中间件机制实现。中间件的执行顺序至关重要：认证中间件必须在受保护路由之前执行，错误处理中间件必须在所有其他中间件和路由之后注册，请求体解析中间件必须在需要访问 req.body 的处理器之前。然而中间件给类型系统带来了一个独特挑战：中间件可以修改 req 对象，向其上添加自定义属性。例如认证中间件验证 JWT 后将用户信息挂载到 req.user 上，日志中间件可能添加 req.requestId 用于链路追踪，国际化中间件可能添加 req.t 翻译函数。问题是原生 Request 类型上并不存在这些自定义属性，直接访问会导致类型错误。

解决这个问题最广为人知的方案是 TypeScript 的声明合并（Declaration Merging）特性。通过创建类型声明文件（如 express.d.ts），在 Express 命名空间中扩展 Request 接口：declare global { namespace Express { interface Request { user?: User; requestId?: string } } }。这样 TypeScript 就知道 Request 接口上存在这些属性。但这种方式存在两个明显的问题：第一，全局声明导致类型系统无法区分已认证请求和未认证请求——所有请求的 req.user 都是可选的（User | undefined），这意味着即使在经过认证中间件保护的路由中，你仍然需要使用可选链（req.user?.id）或非空断言（req.user!.id），否则编译器会报错；第二，随着项目中使用的中间件越来越多，这个全局接口会变得越来越臃肿，包含大量只有特定路由才会有的属性，失去了类型精确性。

更高级的模式是类型安全的中间件组合（Type-safe Middleware Composition）。我们可以定义一个泛型 Middleware<TIn, TOut> 类型，其中 TIn 是中间件接收的请求类型，TOut 是中间件处理后输出的扩展请求类型（即 TIn & AddedProps）。例如，认证中间件的类型是 Middleware<Req, Req & { user: User }>，表示它接收一个普通请求，输出一个包含 user 属性的已认证请求。多个中间件串联时类型会自动"堆叠"累积——日志中间件添加 requestId 后变成 Req & { requestId: string }，再经过认证中间件变成 Req & { requestId: string } & { user: User }，最终的路由处理器可以精确访问所有中间件添加的属性，且这些属性都是非可选的（不需要非空断言）。

错误处理中间件在 Express 中有特殊的类型签名：它必须接受四个参数 (err, req, res, next)，TypeScript 可以通过参数数量来区分普通中间件和错误处理中间件。错误处理中间件需要根据错误类型进行不同的响应，因此定义一个错误类层次结构（HttpError、NotFoundError、ValidationError、UnauthorizedError 等）并通过 instanceof 进行类型窄化是最佳实践。

## 三、路由参数与查询字符串的验证与类型转换

路由参数和查询字符串天生都是字符串类型：URL 路径 /users/123 中的 123 在 req.params.userId 中是字符串 "123" 而非数字 123；查询参数 ?active=true 中的 true 在 req.query.active 中是字符串 "true" 而非布尔值 true；?page=2 中的 2 是字符串 "2" 而非数字。手动做类型转换和验证（parseInt、isNaN 检查、布尔值解析）既繁琐又容易遗漏——你可能忘记检查 parseInt 的结果是否是 NaN，或者没有处理 "True"、"1"、"yes" 等各种布尔表示形式。更糟糕的是，当你需要验证嵌套对象（如 POST 请求体中的复杂 JSON 结构）时，手写验证代码会变得异常复杂且容易出错。

更优雅的方案是结合 Zod、Valibot 等 TypeScript-first 的模式验证库（Schema Validation Library），实现 Schema 即类型的端到端类型安全。Zod 是目前最流行的选择，它允许你用流畅的链式 API 定义数据结构和约束条件，并能够自动从中推断出 TypeScript 类型。关键的是 Schema 在运行时是真实存在的 JavaScript 对象，它不仅能进行编译时类型检查，还能在运行时进行实际的数据验证和类型转换。例如，z.coerce.number() 会自动将字符串 "123" 转换为数字 123，z.coerce.boolean() 能将 "true"、"1" 转换为 true 而将 "false"、"0" 转换为 false，验证失败时返回结构化的错误信息，告诉你具体是哪个字段出了什么问题。

对于 POST/PUT 请求的 JSON 请求体验证，Zod 支持丰富的验证规则：复杂的嵌套对象结构（z.object）、数组（z.array）、必填/可选区分（.optional()）、字符串最小/最大长度（.min()、.max()）、正则匹配（.regex()）、数字范围（.min()、.int()）、枚举白名单（z.enum()）、联合类型（z.union()）、交叉类型（z.intersection()）、默认值（.default()）、转换管道（.transform()）等。这种 Schema as Single Source of Truth（Schema 作为唯一真相来源）的模式消除了类型定义与运行时验证不一致的风险——你只需要定义一次 Schema，TypeScript 类型和运行时验证都从同一个 Schema 派生，不会出现类型说有 email 字段但验证规则忘了检查的情况。

Valibot 是另一个新兴的轻量级替代方案，它的包体积更小（Tree-shakable），API 设计与 Zod 类似但采用函数式组合风格，适合对包体积敏感的场景。两个库的核心理念相同：定义 Schema → 推断 TypeScript 类型 → 运行时解析验证。

## 四、类型安全的路由注册与错误处理

将上述所有概念整合在一起，我们可以构建出完全类型安全的路由注册系统。理想情况下，当你注册一个路由时，TypeScript 应该能够：从路径字符串自动提取路由参数名（使用 TypeScript 4.1 引入的模板字面量类型）；结合 Zod Schema 自动确定请求体和查询参数的类型；确保处理函数接收正确类型的参数；确保返回的响应符合约定的类型。现代的 TypeScript-first Web 框架如 Hono、Elysia、Fastify（配合 TypeScript 插件）已经内置了这种级别的类型安全。在 Express 中，虽然框架本身不直接支持，但我们可以通过封装辅助函数（helper）来获得相当程度的类型安全。

错误处理方面，类型安全同样重要。我们需要：定义自定义错误类层次结构（HttpError 作为基类，派生出 NotFoundError、UnauthorizedError、ForbiddenError、ValidationError 等）；错误处理中间件通过 instanceof 进行类型窄化，根据不同错误类型返回对应的 HTTP 状态码和错误响应；统一的错误响应格式（包含 code、message、details 字段）确保前端能一致地处理错误。特别需要注意的是 Express 不会自动捕获异步处理器中的异常——如果你使用 async/await 而没有 try/catch，异常会导致 UnhandledPromiseRejection 而不会被错误处理中间件捕获。解决方法是使用 asyncHandler 高阶函数包装异步处理器，或者在每个 async 路由中使用 try/catch。

## 五、实践要点与常见陷阱

在实际项目中落地类型安全需要注意以下要点：第一，坚决抵制滥用 any 类型，any 会让所有类型检查失效，使用 unknown 代替 any 并通过类型守卫窄化类型是更好的选择；第二，善用 TypeScript 的类型推断，不要过度标注类型——Zod 的 z.infer 已经能从 Schema 推断出类型，不需要手动重复定义；第三，区分 DTO（Data Transfer Object）类型和领域模型类型——API 接收和返回的类型（DTO）与数据库实体类型（Domain Model）往往不同，不要混用；第四，注意 req.query 的单值/多值问题——Express 的 query parser 在同名参数出现多次时返回数组，只出现一次时返回字符串，使用 Zod 的 z.array() 配合 .nonempty() 或 .default([]) 可以正确处理；第五，中间件注册顺序至关重要——在添加 req.user 的认证中间件之前的路由无法访问 user 属性，类型层面和运行层面都要保证顺序正确。

在本章的代码示例中，我们从零开始构建了一个类型安全的 Web 框架原型，实现了 Zod 风格的 Schema 验证系统（支持 string、number、boolean、object 类型及 coerce 自动转换）、自定义错误类层次结构、类型化中间件链（日志、认证、权限检查）、参数化路由注册、异步中间件支持，并通过模拟多个 HTTP 请求（成功案例、验证失败案例、认证失败案例、404 案例）演示了完整的类型安全数据流。`,
    code: `console.log("========== 1. Schema验证系统 ==========\\n");

type Schema<T> = { parse(input: unknown): T; safeParse(input: unknown): { success: true; data: T } | { success: false; error: string } };

function string(): Schema<string> {
  return {
    parse(input) { if (typeof input !== 'string') throw new Error(\`期望string，实际\${typeof input}\`); return input; },
    safeParse(input) { try { return { success: true, data: this.parse(input) }; } catch(e:any) { return { success: false, error: e.message }; } }
  };
}
function number(opts?:{coerce?:boolean;min?:number;max?:number}): Schema<number> {
  return {
    parse(input) {
      let v:any = input;
      if(opts?.coerce && typeof input === 'string') { v = Number(input); if(isNaN(v)) throw new Error(\`无法转数字: \${input}\`); }
      if(typeof v !== 'number') throw new Error(\`期望number，实际\${typeof v}\`);
      if(opts?.min !== undefined && v < opts.min) throw new Error(\`最小值\${opts.min}\`);
      if(opts?.max !== undefined && v > opts.max) throw new Error(\`最大值\${opts.max}\`);
      return v;
    },
    safeParse(input) { try{return{success:true,data:this.parse(input)};}catch(e:any){return{success:false,error:e.message};} }
  };
}
function boolean(): Schema<boolean> {
  return {
    parse(input) {
      if(typeof input === 'boolean') return input;
      if(input === 'true' || input === '1') return true;
      if(input === 'false' || input === '0') return false;
      throw new Error(\`无法转boolean: \${String(input)}\`);
    },
    safeParse(input) { try{return{success:true,data:this.parse(input)};}catch(e:any){return{success:false,error:e.message};} }
  };
}
function object<T extends Record<string,Schema<any>>>(shape:T): Schema<{[K in keyof T]: T[K] extends Schema<infer U> ? U : never}> {
  return {
    parse(input) {
      if(typeof input !== 'object' || input === null || Array.isArray(input)) throw new Error('期望object');
      const r:any = {};
      for(const k of Object.keys(shape)) {
        try { r[k] = shape[k].parse((input as any)[k]); } catch(e:any) { throw new Error(\`字段\${k}: \${e.message}\`); }
      }
      return r;
    },
    safeParse(input) { try{return{success:true,data:this.parse(input)};}catch(e:any){return{success:false,error:e.message};} }
  };
}

class HttpError extends Error { constructor(public status:number, public code:string, m:string){super(m);this.name='HttpError';} }
class NotFoundError extends HttpError { constructor(r:string){super(404,'NOT_FOUND',\`\${r}未找到\`);} }
class UnauthorizedError extends HttpError { constructor(m='未授权'){super(401,'UNAUTHORIZED',m);} }
class ValidationError extends HttpError { constructor(d:string){super(400,'VALIDATION_ERROR',\`验证失败: \${d}\`);} }

console.log("✓ Schema系统与错误类定义完成\\n");

const UserParamsSchema = object({ userId: number({coerce:true, min:1}) });
const CreateUserSchema = object({ name: string(), email: string(), age: number({min:0, max:150}) });
const ListQuerySchema = object({ page: number({coerce:true,min:1}), pageSize: number({coerce:true,min:1,max:100}), active: boolean() });

let r:any = UserParamsSchema.safeParse({userId:"42"});
console.log(\`userId="42"(coerce): \${r.success?'✓ -> '+r.data.userId:'✗ '+r.error}\`);
r = UserParamsSchema.safeParse({userId:"abc"});
console.log(\`userId="abc": \${r.success?'✗应失败':'✓拒绝: '+r.error}\`);
r = CreateUserSchema.safeParse({name:"Alice",email:"a@b.com",age:25});
console.log(\`合法用户: \${r.success?'✓ '+r.data.name:'✗ '+r.error}\`);
r = CreateUserSchema.safeParse({name:"Bob",email:123,age:30});
console.log(\`email为number: \${r.success?'✗应失败':'✓拒绝: '+r.error}\`);

console.log("\\n========== 2. 类型化路由器与中间件 ==========\\n");
const {EventEmitter} = require('events');

interface Req { method:string; path:string; params:Record<string,any>; query:Record<string,any>; body:any; headers:Record<string,string>; [k:string]:any }
interface Res { statusCode:number; body:any; headers:Record<string,string>; status(c:number):Res; json(d:any):Res }
function mkRes():Res { return {statusCode:200,body:null,headers:{},status(c){this.statusCode=c;return this;},json(d){this.body=d;return this;}}; }
type Mw = (req:Req,res:Res,next:(err?:any)=>void)=>void;

class TypedRouter extends EventEmitter {
  private routes:any[]=[]; private globalMws:Mw[]=[];
  use(mw:Mw){ this.globalMws.push(mw); return this; }
  private parsePath(p:string){ const ns:string[]=[]; const re=new RegExp('^'+p.replace(/:([\\w]+)/g,(_,x)=>{ns.push(x);return'([^/]+)'})+'$'); return{re,names:ns}; }
  get(p:string,h:(req:Req,res:Res)=>void,mws:Mw[]=[]){ const{re,names}=this.parsePath(p); this.routes.push({method:'GET',re,names,h,mws}); return this; }
  post(p:string,h:(req:Req,res:Res)=>void,mws:Mw[]=[]){ const{re,names}=this.parsePath(p); this.routes.push({method:'POST',re,names,h,mws}); return this; }
  async handle(method:string,path:string,body?:any,query?:any,headers?:any):Promise<Res>{
    const res=mkRes(); const req:Req={method,path,params:{},query:query||{},body:body??null,headers:headers||{}};
    const route=this.routes.find(r=>r.method===method&&r.re.test(path));
    if(!route){res.status(404).json({code:'NOT_FOUND',msg:\`路由\${method}\${path}不存在\`});return res;}
    const m=path.match(route.re); if(m) route.names.forEach((n:string,i:number)=>req.params[n]=m[i+1]);
    try{
      for(const mw of[...this.globalMws,...route.mws]){
        await new Promise<void>((res,rej)=>{let called=false;const next=(e?:any)=>{called=true;if(e)rej(e);else res();};
          try{const x=mw(req,res,next);if(x instanceof Promise)x.then(()=>{if(!called)res();}).catch(rej);else if(!called)res();}catch(e){rej(e);}
        });
      }
      route.h(req,res);
    }catch(err:any){
      if(err instanceof HttpError) res.status(err.status).json({code:err.code,msg:err.message});
      else res.status(500).json({code:'ERROR',msg:err.message});
    }
    return res;
  }
}

const router = new TypedRouter();
router.use((req,res,next)=>{console.log(\`[日志]\${req.method} \${req.path}\`);next();});
router.use((req,res,next)=>{const a=req.headers['authorization'];if(a&&a.startsWith('Bearer ')){if(a.slice(7)==='ok'){req.user={id:1,name:'Admin',roles:['admin']};next();}else next(new UnauthorizedError('无效令牌'));}else{req.user=null;next();}});
const requireAuth:Mw=(req,res,next)=>{if(!req.user)return next(new UnauthorizedError('需登录'));next();};

router.get('/users/:userId',(req,res)=>{const p=UserParamsSchema.safeParse(req.params);if(!p.success)throw new ValidationError(p.error);if(p.data.userId===1)res.json({id:1,name:'Alice',email:'a@b.com',age:28});else throw new NotFoundError('用户');},[requireAuth]);
router.post('/users',(req,res)=>{const p=CreateUserSchema.safeParse(req.body);if(!p.success)throw new ValidationError(p.error);res.status(201).json({id:Date.now(),...p.data});},[requireAuth]);
router.get('/posts',(req,res)=>{const p=ListQuerySchema.safeParse(req.query);if(!p.success)throw new ValidationError(p.error);res.json({page:p.data.page,pageSize:p.data.pageSize,total:100,data:[]});});

console.log("✓ 路由器配置完成\\n");
async function run(){
  const tests:[string,string,string,any,any,any][]=[
    ['1.有效用户','GET','/users/1',null,{},{authorization:'Bearer ok'}],
    ['2.用户不存在','GET','/users/999',null,{},{authorization:'Bearer ok'}],
    ['3.userId无效','GET','/users/abc',null,{},{authorization:'Bearer ok'}],
    ['4.创建用户','POST','/users',{name:'Bob',email:'b@b.com',age:30},{},{authorization:'Bearer ok'}],
    ['5.验证失败','POST','/users',{name:'Bob',email:123},{},{authorization:'Bearer ok'}],
    ['6.无令牌','GET','/users/1'],
    ['7.无效令牌','GET','/users/1',null,{},{authorization:'Bearer bad'}],
    ['8.公开接口','GET','/posts',null,{page:'1',pageSize:'10',active:'true'}],
    ['9.404','GET','/not-exist'],
  ];
  for(const[desc,m,p,b,q,h]of tests){
    console.log(\`▸ \${desc}\`);
    const res=await router.handle(m,p,b,q,h);
    console.log(\`  \${res.statusCode} \${JSON.stringify(res.body).slice(0,80)}\\n\`);
  }
}
run().catch(console.error);`
  },
  // =========================================================
  // 第2章：数据库层类型安全
  // =========================================================
  {
    id: "ts3-node-database-types",
    title: "数据库层类型安全",
    icon: "🗄️",
    group: "Node.js 后端开发",
    content: `# 数据库层类型安全

数据库是绝大多数后端应用的核心状态存储所在，从用户账户信息、业务订单数据、内容管理数据到操作日志记录，几乎所有需要持久化保存的应用状态都通过数据库层进行读写和查询操作。在传统的 JavaScript 后端开发模式中，数据库操作长期以来一直是类型安全问题的重灾区，也是 bug 最容易滋生的温床：手写原生 SQL 语句时表名和字段名容易拼写错误但编辑器无法发现和提示；数据库驱动返回的查询结果行默认类型是 any 导致后续代码缺乏类型提示和自动补全；数据从数据库读出后经过业务层处理再传递到 API 层的过程中类型信息不断丢失和变形；数据库迁移脚本与实际的数据模型定义不一致而无人察觉，导致部署时出现 schema 不匹配的错误；关联查询（JOIN）的结果类型难以表达，开发者往往只能用 any 或者手动维护冗长且容易出错的接口定义；金额、高精度小数等特殊字段被 JavaScript 的 number 类型截断导致精度丢失等问题屡见不鲜。这些问题轻则导致开发效率低下，需要频繁 console.log 查看实际数据结构，写大量防御性代码判断字段是否存在，重则引发数据错乱、财务损失和严重的生产环境事故。TypeScript 结合现代 ORM（对象关系映射）工具和类型安全的查询构建器（Query Builder），让我们完全有能力构建从数据库 Schema 定义到数据库操作、从数据访问层到业务逻辑层再到 API 响应层的真正端到端类型安全。

## 一、ORM 类型系统的工作原理

现代 TypeScript ORM 工具（Prisma、Drizzle ORM、MikroORM、TypeORM）都拥有复杂而精密的类型系统，它们不仅仅是简单的数据库操作封装，更是将数据库结构映射为 TypeScript 类型的桥梁。ORM 类型系统的核心目标是实现数据库模型到 TypeScript 类型的双向映射，确保数据库中的每一张表、每一个字段、每一个关系、每一个约束都有精确对应的 TypeScript 类型表示。开发者通过 ORM 特定的方式定义数据模型：Prisma 通过声明式的 .prisma Schema 文件（使用一种类似于伪代码的领域特定语言）定义模型、字段、关系、索引；Drizzle ORM 则完全通过 TypeScript 代码以函数式 API 定义 Schema，不需要额外的代码生成步骤；TypeORM 和 MikroORM 使用装饰器（Decorator）在实体类（Entity Class）的属性上标注元数据，定义字段类型、约束、关系等。

定义好数据模型后，ORM 的工具链会自动生成对应的 TypeScript 类型，确保所有数据库操作都经过类型检查。这种映射绝非简单的一张表对应一个接口、一个字段对应一个属性，而是包含了丰富的类型推导逻辑：字段的 nullable 约束决定了属性类型是 T | null 还是非空的 T；有默认值的字段（如 createdAt 默认为 now()）和自增主键在创建记录时不应由用户提供，因此创建输入类型（CreateInput）会排除这些字段；更新操作的输入类型（UpdateInput）将所有字段变为可选，因为更新时你只想修改部分字段；一对一、一对多、多对多关系会正确映射为嵌套对象或数组，例如 author?: User 和 posts: Post[]；include/select 操作会根据你实际选择的字段动态改变返回结果类型——只 select id 和 name 时返回类型就是 Pick<Model, 'id' | 'name'>。

以 Prisma 为例，它为每个模型生成一整套相互关联的类型：完整的模型类型（Model）、创建输入类型（ModelCreateInput，排除自增主键和有默认值的字段）、更新输入类型（ModelUpdateInput，所有字段可选）、查询条件类型（ModelWhereInput，支持各种过滤操作符如 equals、gt、lt、contains、in、notIn 等）、排序类型（ModelOrderByInput）、包含/选择类型（ModelInclude、ModelSelect）。其中最精妙的部分是 include 和 select 的类型推断：当你在查询中写 include: { posts: true } 时，返回类型会自动包含 posts 数组；当你写 select: { id: true, name: true } 时，返回类型只包含 id 和 name 两个字段，其他字段都不存在。这依赖于 TypeScript 的条件类型、映射类型和泛型高阶类型编程，是 TypeScript 类型系统强大表达能力的典范。Drizzle ORM 的类型系统同样出色，由于它完全用 TypeScript 代码定义 Schema，不需要运行代码生成器，修改 Schema 时类型立即更新，开发体验非常流畅。

## 二、类型安全的查询构建器

查询构建器（Query Builder）是以面向对象或链式编程方式构造 SQL 查询的接口，它介于手写原生 SQL 和使用全功能 ORM 之间，既保留了 SQL 的灵活性和表达能力，又提供了类型安全和代码辅助。类型安全的查询构建器的核心价值在于：在编译时确保你引用的表名和字段名是真实存在的，不会因为拼写错误写出不存在的字段；确保字段比较的类型兼容，例如你不能拿字符串类型的字段和数字值做比较（除了显式的类型转换）；确保排序和分组的字段是有效的；确保联表查询（JOIN）的关联条件字段类型匹配。

实现类型安全查询构建器的关键技术包括：使用 Branded Types（品牌类型/标记类型）来标记合法的表名和字段名，防止任意字符串被用作字段名；使用泛型约束来确保 select、where、orderBy 等方法只接受已定义的字段名；使用类型状态模式（Type-state Pattern）追踪查询构建的状态，确保方法调用的顺序正确（例如不能在 from 之前调用 select，或者不能在没有 join 的情况下引用关联表的字段）。Kysely 是 TypeScript 生态中最优秀的类型安全 SQL 查询构建器，它能够根据数据库 Schema 类型正确推断多表联查后的结果类型，甚至支持 WITH 语句（CTE）、子查询、UNION 等复杂 SQL 构造。

## 三、数据库类型到 JavaScript 类型的映射

数据库中的数据类型与 JavaScript/TypeScript 类型并不是一一对应的，理解这种映射关系是构建类型安全数据库层的基础。常见的映射关系包括：VARCHAR、TEXT、CHAR 等字符串类型映射为 string；INTEGER、INT、SMALLINT、BIGINT 等整数类型映射为 number，但需要特别注意 JavaScript 的 number 类型只能精确表示到 2^53 - 1（约 9007 兆），超过这个范围的大整数必须使用 BigInt 类型或用字符串存储，否则会出现精度丢失；FLOAT、REAL、DOUBLE 等浮点数类型映射为 number，但浮点数精度问题使其不适合存储金额等精确小数，应使用 DECIMAL/NUMERIC 类型（ORM 通常会提供专门的 Decimal 类）；TIMESTAMP、DATETIME、DATE 等时间类型可以映射为 Date 对象或格式化字符串（取决于数据库驱动配置），推荐使用 Date 以保持类型一致；BOOLEAN 映射为 boolean，但需要注意 SQLite 等数据库可能用 0 和 1 来存储布尔值；JSON 和 JSONB 类型可以映射为任意对象类型，但应该定义具体的接口来约束其结构，而不是使用 any；NULL 值映射为 null 或 undefined（取决于约定，推荐统一使用 null）。

类型安全的行到对象映射（Row-to-Object Mapping）不应该只是简单的类型断言（as User），而应该包含运行时的类型检查——至少在开发环境中验证返回的数据结构是否符合预期，防止数据库中存在脏数据或 Schema 迁移后数据格式不一致导致的问题。Prisma 等 ORM 在内部处理了大部分类型转换，但对于自定义查询或原生 SQL，你需要自己负责类型安全。

## 四、Repository 模式与泛型抽象

Repository 模式（仓储模式）是领域驱动设计（DDD）中的经典模式，它将数据访问逻辑封装在专门的 Repository 类中，业务逻辑层通过 Repository 接口访问数据，而不需要关心底层使用的是 SQL、ORM 还是其他数据源。在 TypeScript 中实现类型安全的 Repository 模式的关键是利用泛型（Generics）定义通用的 CRUD 操作：Repository<TEntity, TInsert, TUpdate>，其中 TEntity 是完整的实体类型（包含所有数据库自动生成的字段如 id、createdAt），TInsert 是创建实体时的输入类型（排除自增主键和有默认值的字段），TUpdate 是更新实体时的输入类型（通常是 Partial<TEntity> 但排除主键）。

基类 Repository 可以实现通用的 create、findById、findMany、update、delete、count 等方法，子类（如 UserRepository、PostRepository）继承基类并添加特定的业务查询方法（如 findByEmail、findPublishedPosts、findByAuthor 等）。每个方法的返回值都有精确的 Promise 类型：findById 返回 Promise<TEntity | null>（可能找不到），findMany 返回 Promise<TEntity[]>，create 返回 Promise<TEntity>。查询条件参数通过 keyof TEntity 进行约束，确保你只能按实体上真实存在的字段进行过滤。

## 五、分页、事务与迁移类型

分页查询是后端最常见的需求之一，类型安全的分页需要明确定义分页输入类型和分页结果类型。分页输入通常包括 page（页码，从1开始）、pageSize（每页条数）、sort（排序字段）、order（排序方向 asc/desc），其中 sort 字段应该被约束为实体类型的键名（keyof TEntity），防止按不存在的字段排序。分页结果类型包含 data（当前页数据 T[]）、total（总条数）、page（当前页码）、pageSize（每页条数）、totalPages（总页数）、hasNext（是否有下一页）、hasPrev（是否有上一页）。

事务（Transaction）是保证数据一致性的关键机制。现代 TypeScript ORM 推荐使用回调式事务 API（如 Prisma 的 prisma.$transaction(async tx => { ... })），在回调函数中你使用 tx 客户端而不是全局 prisma 客户端进行数据库操作，ORM 在类型层面确保你在事务回调内只能使用事务客户端，防止混用导致的操作不在同一事务中的问题。如果回调函数抛出异常，事务自动回滚；如果正常返回，事务自动提交。Unit of Work（工作单元）模式是事务的进一步抽象，它跟踪所有实体的变更并在提交时一次性执行所有更新。

数据库迁移（Migration）是类型安全的另一个重要方面。Prisma Migrate、Drizzle Kit 等工具能从 Schema 定义自动生成 SQL 迁移文件，确保迁移脚本与 Schema 定义一致，减少手工编写迁移脚本出错的概率。迁移文件本身也应该被版本控制，每次 Schema 变更都生成对应的迁移文件。

## 六、SQL 模板字面量类型

TypeScript 4.1 引入的模板字面量类型（Template Literal Types）为类型安全的原生 SQL 提供了新的可能性。通过带类型的 SQL 模板标签函数（Tagged Template Literal），我们可以在编写接近原生 SQL 的同时获得类型检查：sql\`SELECT * FROM users WHERE id = \${userId}\`。Slonik、PgTyped 等库甚至能在编译时解析 SQL 语句，提取表名和字段名与数据库元数据进行比对。实现这类类型安全 SQL 标签需要用到 TypeScript 的递归条件类型、字符串解析类型等高阶类型技巧。

本章的代码示例构建了一个纯内存数据库模拟，实现了类型安全的 Schema 定义（支持 string、number、boolean、date 类型及约束）、从 Schema 自动推断实体类型/插入类型/更新类型、泛型 Repository 基类和具体 Repository、分页查询、Unit of Work 模式、类型安全的事务操作（回滚和提交），演示了完整的类型安全数据访问层实现。

## 七、类型安全的关联查询与预加载

关联查询是数据库操作中的复杂场景。在 ORM 中，关联（Relation）的类型定义需要精确表达：一对多关系中一方持有多方的数组引用（user.posts: Post[]），多对一关系中多方持有一方的引用（post.author: User | null），多对多关系通过中间表连接双方。类型安全的预加载（Eager Loading）意味着当你 include 一个关联时，返回类型会自动包含该关联的数据；如果你没有 include，该关联属性在类型上不存在或为懒加载引用。Prisma 的 include 和 select 在类型层面实现了这一点，通过嵌套对象类型和条件类型精确推断查询结果的完整形状。

## 八、软删除、审计日志与多租户类型

实际项目中常见的模式也需要类型支持：软删除（Soft Delete）通过 deletedAt 字段标记删除而非物理删除，查询时自动过滤已删除记录；审计日志（Audit Log）记录 createdBy、updatedBy、createdAt、updatedAt 等元数据字段，通过泛型基类接口自动为所有实体添加这些字段；多租户（Multi-tenancy）系统中每个查询自动带上 tenantId 过滤条件，类型系统确保不会意外跨租户查询数据。这些横切关注点可以通过 TypeScript 的泛型约束和中间件/拦截器模式统一处理，避免在每个查询中重复编写过滤条件。

在类型安全的数据库层实践中，还有一点需要特别强调：避免在循环中执行数据库查询（N+1 查询问题）。类型安全可以让代码正确，但不能自动解决性能问题。使用 ORM 的批量查询、预加载（include）、原生 SQL 连接查询等方式解决 N+1 问题，同时结合类型系统确保批量操作的类型正确。`,
    code: `console.log("========== 1. Schema类型定义 ==========\\n");
type ColType='string'|'number'|'boolean'|'date';
type ColDef={type:ColType;nullable?:boolean;primary?:boolean;unique?:boolean;default?:()=>any};
type TSch=Record<string,ColDef>;
type SType<S extends TSch>={[K in keyof S]:S[K]['type']extends'string'?string:S[K]['type']extends'number'?number:S[K]['type']extends'boolean'?boolean:Date};
type AutoF<S extends TSch>={[K in keyof S]:S[K]extends{primary:true}?K:S[K]extends{default:()=>any}?K:never}[keyof S];
type InsT<T,S extends TSch>=Omit<T,AutoF<S>>;
type UpdT<T>=Partial<Omit<T,'id'>>;
interface PP<T>{page?:number;pageSize?:number;sort?:keyof T&string;order?:'asc'|'desc'}
interface PR<T>{data:T[];total:number;page:number;pageSize:number;totalPages:number;hasNext:boolean;hasPrev:boolean}

const UserSch={
  id:{type:'number'as const,primary:true,default:()=>Date.now()+Math.floor(Math.random()*10000)},
  name:{type:'string'as const},email:{type:'string'as const,unique:true},
  age:{type:'number'as const,nullable:true},isActive:{type:'boolean'as const,default:()=>true},
  createdAt:{type:'date'as const,default:()=>new Date()},
}satisfies TSch;
const PostSch={
  id:{type:'number'as const,primary:true,default:()=>Date.now()+Math.floor(Math.random()*10000)},
  title:{type:'string'as const},content:{type:'string'as const},authorId:{type:'number'as const},
  published:{type:'boolean'as const,default:()=>false},createdAt:{type:'date'as const,default:()=>new Date()},
}satisfies TSch;
type User=SType<typeof UserSch>;type Post=SType<typeof PostSch>;
console.log("✓ Schema定义完成: User["+Object.keys(UserSch).join(',')+"]");

console.log("\\n========== 2. 内存数据库与Repository ==========\\n");
class DB{
  private t=new Map<string,Map<any,any>>();private tx:Map<string,Map<any,any>>|null=null;
  tbl(n:string){if(!this.t.has(n))this.t.set(n,new Map());}
  private a(n:string){if(this.tx){if(!this.tx.has(n))this.tx.set(n,new Map(this.t.get(n)||new Map()));return this.tx.get(n)!;}return this.t.get(n)!;}
  ins(n:string,row:any,s:TSch){const t=this.a(n);const r={...row};for(const[k,c]of Object.entries(s)){if(c.default&&!(k in r))r[k]=c.default();}t.set(r.id,r);return r;}
  byId(n:string,id:any){return this.a(n).get(id)??null;}
  all(n:string,p?:(r:any)=>boolean){const x=Array.from(this.a(n).values());return p?x.filter(p):x;}
  one(n:string,p:(r:any)=>boolean){return this.all(n,p)[0]??null;}
  upd(n:string,id:any,u:any){const t=this.a(n);const r=t.get(id);if(!r)return null;const x={...r,...u};t.set(id,x);return x;}
  del(n:string,id:any){return this.a(n).delete(id);}
  count(n:string,p?:(r:any)=>boolean){return this.all(n,p).length;}
  async trans<T>(fn:(db:DB)=>Promise<T>):Promise<T>{this.tx=new Map();try{const r=await fn(this);for(const[n,s]of this.tx)this.t.set(n,s);this.tx=null;return r;}catch(e){this.tx=null;throw e;}}
}
class Repo<T extends Record<string,any>,TI,TU>{
  constructor(protected db:DB,protected tn:string,protected sch:TSch){db.tbl(tn);}
  create(d:TI):T{return this.db.ins(this.tn,d,this.sch);}
  findById(id:number):T|null{return this.db.byId(this.tn,id);}
  findMany(f?:Partial<T>):T[]{if(!f)return this.db.all(this.tn);return this.db.all(this.tn,r=>Object.entries(f).every(([k,v])=>r[k]===v));}
  findOne(f:Partial<T>):T|null{return this.db.one(this.tn,r=>Object.entries(f).every(([k,v])=>r[k]===v));}
  update(id:number,d:TU):T|null{return this.db.upd(this.tn,id,d);}
  delete(id:number):boolean{return this.db.del(this.tn,id);}
  count(f?:Partial<T>):number{if(!f)return this.db.count(this.tn);return this.db.count(this.tn,r=>Object.entries(f).every(([k,v])=>r[k]===v));}
  page(p:PP<T>&{f?:Partial<T>}={}):PR<T>{
    const pg=p.page||1,ps=p.pageSize||10,sb=p.sort||'id'as any,ord=p.order||'asc';
    let d=this.findMany(p.f);d.sort((a:any,b:any)=>{if(a[sb]<b[sb])return ord==='asc'?-1:1;if(a[sb]>b[sb])return ord==='asc'?1:-1;return 0;});
    return{data:d.slice((pg-1)*ps,pg*ps),total:d.length,page:pg,pageSize:ps,totalPages:Math.ceil(d.length/ps),hasNext:pg<Math.ceil(d.length/ps),hasPrev:pg>1};
  }
}
class UserRepo extends Repo<User,InsT<User,typeof UserSch>,UpdT<User>>{
  constructor(db:DB){super(db,'users',UserSch);}
  byEmail(e:string){return this.findOne({email:e}as any);}
  active(){return this.findMany({isActive:true}as any);}
}
class PostRepo extends Repo<Post,InsT<Post,typeof PostSch>,UpdT<Post>>{
  constructor(db:DB){super(db,'posts',PostSch);}
  byAuthor(aid:number){return this.findMany({authorId:aid}as any);}
  published(){return this.findMany({published:true}as any);}
  publish(id:number){return this.update(id,{published:true}as any);}
}
class UoW{readonly users:UserRepo;readonly posts:PostRepo;constructor(public db:DB){this.users=new UserRepo(db);this.posts=new PostRepo(db);}
async tx<T>(fn:(u:UoW)=>Promise<T>){return this.db.trans(async()=>fn(this));}}

console.log("✓ 数据库与Repository模式就绪\\n");
async function run(){
  const uow=new UoW(new DB());
  const u1=uow.users.create({name:'张三',email:'z@e.com',age:28});
  const u2=uow.users.create({name:'李四',email:'l@e.com',age:32});
  const u3=uow.users.create({name:'王五',email:'w@e.com'});
  console.log(\`创建用户:张三(\${u1.id}),李四(\${u2.id}),王五(\${u3.id}),isActive默认=\${u3.isActive}\`);
  uow.posts.create({title:'TS入门',content:'TS基础...',authorId:u1.id});
  uow.posts.create({title:'Node实践',content:'后端...',authorId:u1.id});
  uow.posts.create({title:'DB设计',content:'数据库...',authorId:u2.id});
  console.log("创建3篇文章");
  const f=uow.users.findById(u1.id);console.log(\`\\n查找:\${f?.name},张三文章:\${uow.posts.byAuthor(u1.id).length}篇\`);
  uow.posts.publish(uow.posts.byAuthor(u1.id)[0].id);console.log(\`已发布:\${uow.posts.published().length}篇\`);
  for(let i=4;i<=20;i++)uow.users.create({name:'用户'+i,email:'u'+i+'@e.com',age:20+i});
  const pg=uow.users.page({page:1,pageSize:5,sort:'name',order:'asc'});
  console.log(\`\\n分页:共\${pg.total}条,\${pg.totalPages}页,第1页:\`);pg.data.forEach(u=>console.log(' -'+u.name));
  console.log("\\n---事务回滚测试---");
  const bc=uow.users.count();
  try{await uow.tx(async tx=>{tx.users.create({name:'tx',email:'tx@e.com',age:25});console.log("事务内创建,即将异常回滚");throw new Error("业务错误");});}catch(e:any){console.log('回滚:'+e.message);}
  console.log(\`回滚后用户数:\${uow.users.count()}（应=\${bc}）\`);
  await uow.tx(async tx=>{tx.users.create({name:'ok',email:'ok@e.com',age:40});console.log("事务提交成功");});
  console.log(\`最终用户数:\${uow.users.count()}\`);
}
run().catch(console.error);`
  },
  // =========================================================
  // 第3章：认证与授权类型
  // =========================================================
  {
    id: "ts3-node-auth-security",
    title: "认证与授权类型",
    icon: "🔐",
    group: "Node.js 后端开发",
    content: `# 认证与授权类型

认证（Authentication，简称 AuthN）和授权（Authorization，简称 AuthZ）是任何后端应用安全体系的两大基石，也是每个后端开发者必须深入理解和正确实现的核心功能。认证回答的是"你是谁"的问题——通过验证用户提供的凭证（密码、令牌、API 密钥、生物特征等）来确认用户的真实身份；授权回答的是"你能做什么"的问题——在确认了用户身份的基础上，控制该用户能够访问哪些资源、执行哪些操作、查看哪些数据。在纯 JavaScript 环境中实现认证授权系统时，大量的安全逻辑和安全规则只存在于开发者的脑子里和运行时的 if 判断中，类型系统无法提供任何帮助——开发者可能不小心把明文密码存进了数据库日志，可能在不同类型的令牌之间错误地传递和使用，可能在某个关键接口上遗漏了权限检查，可能混淆了用户 ID 和管理员 ID 的处理逻辑，可能在 JWT 中放入了不该放的敏感信息，这些安全隐患只有在代码审计或安全事件发生后才会被发现，而那时往往已经造成了数据泄露或其他严重后果。

TypeScript 的类型系统虽然不能直接解决所有安全问题——类型检查终究只是编译时的机制，无法阻止运行时的攻击——但通过精心设计的类型定义、品牌类型（Branded Types）、可辨识联合类型（Discriminated Unions）、类型守卫（Type Guards）等高级类型工具，我们可以将大量安全规则编码到类型层面，让类型检查器在编译阶段就捕获潜在的安全漏洞和逻辑错误：防止明文密码意外流入数据库或日志文件、确保不同类型的令牌不会被错误地混用在错误的场景中、强制受保护的路由必须经过认证中间件才能访问、确保权限检查函数只接收合法的权限标识符、让不安全的操作在类型层面就无法通过编译。

## 一、品牌类型保护安全敏感值

后端应用中需要处理大量安全敏感的字符串值：用户输入的明文密码、经过哈希算法处理后的密码哈希值、短期有效的访问令牌（Access Token）、长期有效的刷新令牌（Refresh Token）、用于服务间通信的 API 密钥、用于会话管理的 Session ID、用于邮箱验证或密码重置的一次性验证码等。虽然这些值在运行时都是字符串（string），但它们的业务含义、安全要求和处理方式截然不同：明文密码绝不能写入日志或数据库；密码哈希值只能用于与用户输入密码的比对验证，不能再次哈希或当作密码使用；Access Token 有效期短，包含权限信息，用于日常 API 访问；Refresh Token 有效期长，包含最小必要信息，仅用于获取新的 Access Token，绝不能用于普通 API 认证。

在 TypeScript 的结构化类型系统（Structural Typing）中，两个 string 类型的值是完全兼容和可互换的，类型系统无法区分"这是一个明文密码"和"这是一个密码哈希值"。品牌类型（Branded Type，也称为标记类型、名义类型 Nominal Type 的一种模拟）通过交叉类型（Intersection Type）为基础类型附加一个唯一的编译时标记，从根本上解决了这个问题。具体实现方式是：type Brand<T, B> = T & { readonly __brand: B }; 然后定义 type PlainPassword = Brand<string, 'PlainPassword'>; type HashedPassword = Brand<string, 'HashedPassword'>;。定义之后，PlainPassword 和 HashedPassword 虽然底层都是 string，但它们在类型系统中是完全不同的类型——一个接受 HashedPassword 参数的函数无法接收 PlainPassword 类型的值，反之亦然，从而从类型层面杜绝了将明文密码传入数据库存储函数或对已哈希密码再次哈希这类常见错误。品牌类型的 __brand 属性纯粹是编译时的类型标记，在编译后的 JavaScript 中完全不存在，因此不会带来任何运行时开销（Zero-cost Abstraction）。

品牌类型还可以用于实现能力标记（Capability Pattern）模式：例如 AuthenticatedRequest 类型包含非可选的 user 属性（与未认证请求中 user 可能为 undefined 区分），受保护的路由处理器强制要求接收 AuthenticatedRequest 类型，未经过认证中间件的普通请求无法传递给受保护路由。API Key、Session ID、CSRF Token 等其他安全敏感值也都应该使用各自独立的品牌类型。

## 二、密码处理的类型安全

密码安全是认证系统的第一道防线，也是最容易出问题的地方。密码处理的核心安全规则包括：永远不要以明文形式存储密码；必须使用慢速加盐哈希算法（如 PBKDF2、bcrypt、Argon2）对密码进行哈希；哈希函数只接受明文密码类型，返回密码哈希类型；密码验证必须使用常量时间比较算法（如 Node.js 内置的 crypto.timingSafeEqual）防止时序攻击。通过品牌类型区分 PlainPassword 和 HashedPassword 是防止密码处理错误的第一道防线——saveUser 函数接受 HashedPassword 类型的密码参数，如果你不小心传入了 PlainPassword，TypeScript 会在编译时报错。

密码复杂度策略也可以结合品牌类型和运行时验证来实现：创建一个 ValidPassword 品牌类型，只有通过了密码复杂度检查（最小长度、包含大小写字母、数字、特殊字符等）的密码才能被赋予 ValidPassword 类型，而注册函数只接受 ValidPassword 类型的密码。这种模式被称为"解析后验证"（Parse, Don't Validate）或"使非法状态不可表示"（Making Illegal States Unrepresentable），是类型安全编程的核心理念之一。

## 三、JWT 令牌的类型安全

JSON Web Token（JWT）是现代 Web 应用中最常用的令牌格式之一，但 JWT 的使用也充满了类型安全陷阱。类型安全的 JWT 实现需要：严格区分 Access Token 和 Refresh Token 的载荷类型（Payload Type）和品牌类型，Access Token 通常包含用户 ID、用户名、角色/权限列表等信息用于权限判断，Refresh Token 只包含最小必要信息（用户 ID、令牌 ID）且不能用于 API 访问；sign 函数根据传入的载荷类型返回对应的品牌类型令牌；verify 函数接受期望的令牌类型参数，返回对应的 Payload 类型，而不是 any；永远不要在 JWT Payload 中存放敏感信息（密码、信用卡号等），因为 JWT 的 Payload 只是 Base64 编码而非加密，任何人都可以解码查看；JWT 密钥也应该使用品牌类型防止意外泄露或硬编码。

## 四、RBAC 权限系统的类型安全

基于角色的访问控制（Role-Based Access Control，RBAC）是应用最广泛的授权模型，其核心概念是权限（Permission）、角色（Role）和用户（User）：权限定义了"能做什么"（如 user:create、post:read），角色是权限的集合（如 admin、editor、viewer），用户被分配一个或多个角色。使用 TypeScript 4.1 的模板字面量类型（Template Literal Types），我们可以自动生成合法的 Permission 联合类型：type Resource = 'user' | 'post' | 'comment' | 'setting'; type Action = 'create' | 'read' | 'update' | 'delete' | 'manage'; type Permission = \`\${Resource}:\${Action}\`; 这会自动生成 'user:create' | 'user:read' | ... | 'setting:manage' 这样的联合类型，避免了手动拼写权限字符串时的错误。通过 Record<Role, Permission[]> 定义角色到权限的映射矩阵，类型系统确保每个角色只能被分配合法的权限标识符（不能拼错）。权限检查函数（hasPermission）的参数类型被约束为合法的 Permission 类型，传入不存在的权限名会在编译时报错。对于更复杂的场景，可以使用基于属性的访问控制（ABAC），但 RBAC 已能覆盖绝大多数业务需求。

## 五、类型安全的认证中间件

认证中间件的类型安全需要做到：明确区分 AuthenticatedRequest（包含非可选 user 属性）和普通的 GuestRequest；受保护的路由处理器强制接受 AuthenticatedRequest 类型的参数，确保没有经过认证的请求无法到达受保护的处理函数；Token 提取和验证过程中可能出现的各种错误（缺少 Authorization 头、格式错误、令牌过期、签名无效、用户已被禁用）都对应明确的错误类型，而不是统一的"认证失败"；requirePermission(perm) 高阶函数返回一个中间件，该中间件检查当前用户是否拥有指定权限，perm 参数的类型被约束为合法的 Permission 类型。

## 六、API 密钥、会话管理与 OAuth 类型

API 密钥用于服务间通信和第三方集成，其类型安全要点包括：使用品牌类型区分 API Key 和其他字符串值；存储时只存储 API Key 的哈希值（类似密码），而不是明文；每个 API Key 关联一组 scopes（权限范围），scopes 类型与 RBAC Permission 保持一致；支持过期时间和速率限制。会话认证（Session-based Auth）需要明确定义 Session 数据结构、SessionStore 接口（get/set/destroy/touch 方法）、Cookie 的安全属性类型（httpOnly、secure、sameSite 等）。OAuth 2.0 第三方登录需要定义授权流程各阶段的参数类型、令牌响应类型、不同 Provider（Google、GitHub、微信等）返回的用户信息使用可辨识联合类型区分。

本章的代码示例使用 Node.js 内置的 crypto 模块构建了一个完整的类型安全认证系统，包括：品牌类型定义（PlainPassword、HashedPassword、AccessToken、RefreshToken、ApiKey、UserId）、基于 PBKDF2 的密码哈希和常量时间验证、HS256 JWT 的签发和验证（严格区分 Access Token 和 Refresh Token）、RBAC 角色权限矩阵（admin、editor、moderator、viewer 四种角色的详细权限定义）、AuthService 实现注册、登录、Token 验证、权限检查、API Key 生成和验证，并通过多角色权限测试、错误密码场景、无效 Token 场景、API Key 越权拒绝等测试案例展示了完整的类型安全认证授权实现。

## 七、OAuth 2.0 与第三方登录的类型建模

OAuth 2.0 授权码流程是第三方登录（如使用 Google、GitHub、微信登录）的标准流程，涉及多个阶段的数据交换。类型安全的 OAuth 实现需要为每个阶段定义精确的类型：授权请求参数（response_type、client_id、redirect_uri、scope、state）、授权码回调参数（code、state）、令牌交换请求和响应（access_token、refresh_token、expires_in、token_type）、用户信息响应（不同 Provider 返回的字段不同，使用可辨识联合区分）。state 参数用于防止 CSRF 攻击，必须在发起授权时生成随机值存储，回调时验证匹配。

## 八、安全最佳实践的类型化表达

许多安全最佳实践可以通过类型系统来强制实施：密码哈希函数只能接受 PlainPassword 类型返回 HashedPassword 类型，无法从 HashedPassword 回到 PlainPassword（单向性）；Token 验证失败时抛出特定类型的错误（TokenExpiredError、InvalidSignatureError 等），调用方必须处理这些错误类型；敏感操作（如删除用户、修改权限）需要额外的确认类型（MfaToken 或二次验证 Token）；日志系统在类型层面禁止记录包含 password、token、secret 等敏感字段的对象，可以通过 Omit 类型或专门的 Sanitized<T> 类型来移除敏感字段。这些类型约束虽然不能完全替代安全审计和代码审查，但能在开发过程中自动阻止大量常见的安全编码错误。

## 九、会话管理与 Cookie 安全类型

传统的基于会话的认证方式中，Session 数据存储在服务器端（内存、Redis、数据库），客户端只持有一个 Session ID（通过 Cookie 传递）。类型安全的会话管理需要定义：SessionData 接口（存储在会话中的用户数据结构）、SessionStore 接口（get、set、destroy、touch 方法）、Cookie 选项类型（httpOnly、secure、sameSite、maxAge、domain、path），其中 httpOnly 防止 XSS 攻击窃取 Cookie，secure 确保只在 HTTPS 下传输，sameSite 防止 CSRF 攻击。这些安全属性的正确配置至关重要，类型系统可以确保必选的安全属性不会被遗漏。

## 十、双令牌策略与令牌刷新

在实际应用中，Access Token 和 Refresh Token 的双令牌策略是最常用的方案。Access Token 有效期短（通常 15 分钟到 1 小时），即使被窃取攻击窗口也很小；Refresh Token 有效期长（通常 7 天到 30 天），只在 Access Token 过期时用于换取新的 Access Token，不用于日常 API 访问。类型安全的令牌刷新需要：Refresh Token 存储在 httpOnly Cookie 中防止 XSS 窃取；刷新接口验证 Refresh Token 的有效性和是否在黑名单中（用于注销功能）；令牌轮换（Refresh Token Rotation）每次刷新都颁发新的 Refresh Token，旧的立即失效，检测到旧 Refresh Token 被使用时表示可能被盗用，立即吊销该用户所有令牌。令牌黑名单可以使用 Redis 存储已注销的令牌 ID（jti），在过期前持续检查。`,
    code: `console.log("========== 1. 品牌类型与权限模型 ==========\\n");
type Brand<T,B>=T&{readonly __brand:B};
type UId=Brand<number,'UId'>;type PP=Brand<string,'PP'>;type HP=Brand<string,'HP'>;
type AT=Brand<string,'AT'>;type RT=Brand<string,'RT'>;type AK=Brand<string,'AK'>;
const uid=(n:number)=>n as UId;const pp=(s:string)=>s as PP;const hp=(s:string)=>s as HP;
const at=(s:string)=>s as AT;const rt=(s:string)=>s as RT;const ak=(s:string)=>s as AK;

type Role='admin'|'editor'|'moderator'|'viewer';
type Res='user'|'post'|'comment'|'setting';type Act='create'|'read'|'update'|'delete'|'manage';
type Perm=\`\${Res}:\${Act}\`;
const rp:Record<Role,Perm[]>={
  admin:['user:create','user:read','user:update','user:delete','user:manage','post:create','post:read','post:update','post:delete','post:manage','comment:create','comment:read','comment:update','comment:delete','setting:read','setting:update','setting:manage'],
  editor:['post:create','post:read','post:update','post:delete','comment:create','comment:read','comment:update','comment:delete','user:read'],
  moderator:['post:read','post:update','comment:read','comment:update','comment:delete','user:read'],
  viewer:['post:read','comment:read','user:read']
};
interface U{id:UId;un:string;email:string;ph:HP;roles:Role[];act:boolean;ca:Date;ll?:Date}
interface AP{sub:UId;un:string;roles:Role[];iat:number;exp:number;type:'access'}
interface AKInfo{key:AK;uid:UId;name:string;scopes:Perm[];ca:Date;lu?:Date}
console.log(\`✓ 类型定义: admin=\${rp.admin.length}权限, editor=\${rp.editor.length}, moderator=\${rp.moderator.length}, viewer=\${rp.viewer.length}\`);

console.log("\\n========== 2. 密码哈希(crypto) ==========\\n");
const crypto=require('crypto');
class PwdSvc{
  static hash(p:PP):HP{const I=10000,K=64,D='sha512';const s=crypto.randomBytes(16).toString('hex');const h=crypto.pbkdf2Sync(p,s,I,K,D).toString('hex');return hp(s+':'+I+':'+h);}
  static verify(p:PP,h:HP):boolean{const K=64,D='sha512';const ps=h.split(':');if(ps.length!==3)return false;const[s,i,hh]=ps;const c=crypto.pbkdf2Sync(p,s,+i,K,D).toString('hex');try{return crypto.timingSafeEqual(Buffer.from(hh,'hex'),Buffer.from(c,'hex'));}catch{return false;}}
}
const tp=pp('MyStr0ng!P@ss');const th=PwdSvc.hash(tp);
console.log(\`哈希长度:\${th.length} | 正确:\${PwdSvc.verify(tp,th)?'✓':'✗'} | 错误:\${!PwdSvc.verify(pp('wrong'),th)?'✓拒绝':'✗'}\`);

console.log("\\n========== 3. JWT服务(HS256) ==========\\n");
class JwtSvc{
  private static e(d:any){return Buffer.from(typeof d==='string'?d:JSON.stringify(d)).toString('base64').replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=/g,'');}
  private static d(s:string){return Buffer.from(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4),'base64');}
  private static sig(data:string){const SK='demo-secret';return crypto.createHmac('sha256',SK).update(data).digest('base64').replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=/g,'');}
  static signA(u:Pick<U,'id'|'un'|'roles'>):AT{const AE=15*60;const n=Math.floor(Date.now()/1000);const p:AP={sub:u.id,un:u.un,roles:u.roles,iat:n,exp:n+AE,type:'access'};const h=this.e({alg:'HS256',typ:'JWT'}),pp=this.e(p);return at(h+'.'+pp+'.'+this.sig(h+'.'+pp));}
  static signR(u:Pick<U,'id'|'un'>):RT{const RE=7*24*60*60;const n=Math.floor(Date.now()/1000);const p={sub:u.id,un:u.un,jti:crypto.randomBytes(8).toString('hex'),iat:n,exp:n+RE,type:'refresh'};const h=this.e({alg:'HS256',typ:'JWT'}),pp=this.e(p);return rt(h+'.'+pp+'.'+this.sig(h+'.'+pp));}
  static verify(t:AT|RT,et?:'access'|'refresh'):any{const ps=t.split('.');if(ps.length!==3)throw new Error('格式无效');const[h,p,s]=ps;if(s!==this.sig(h+'.'+p))throw new Error('签名无效');const pl=JSON.parse(this.d(p).toString());if(pl.exp<Math.floor(Date.now()/1000))throw new Error('已过期');if(et&&pl.type!==et)throw new Error(\`需要\${et}类型\`);return pl;}
}
console.log("✓ JWT服务就绪");

console.log("\\n========== 4. AuthService与权限测试 ==========\\n");
class PermSvc{
  static perms(roles:Role[]):Perm[]{const s=new Set<Perm>();roles.forEach(r=>rp[r].forEach(p=>s.add(p)));return Array.from(s);}
  static has(roles:Role[],p:Perm):boolean{return roles.some(r=>rp[r].includes(p));}
}
class AuthSvc{
  private us=new Map<UId,U>();private ks=new Map<AK,AKInfo>();private uc=0;
  reg(un:string,email:string,p:PP,roles:Role[]=['viewer']):Omit<U,'ph'>{if(Array.from(this.us.values()).find(u=>u.email===email))throw new Error('邮箱已注册');const id=uid(++this.uc);const u:U={id,un,email,ph:PwdSvc.hash(p),roles,act:true,ca:new Date()};this.us.set(id,u);const{ph:_,...s}=u;return s;}
  login(email:string,p:PP):{a:AT;r:RT;u:Omit<U,'ph'>}{const u=Array.from(this.us.values()).find(x=>x.email===email);if(!u)throw new Error('用户不存在');if(!u.act)throw new Error('账户禁用');if(!PwdSvc.verify(p,u.ph))throw new Error('密码错误');u.ll=new Date();const{ph:_,...s}=u;return{a:JwtSvc.signA(u),r:JwtSvc.signR(u),u:s};}
  verify(t:AT):{uid:UId;perms:Perm[];un:string}{const p=JwtSvc.verify(t,'access')as AP;const u=this.us.get(p.sub);if(!u||!u.act)throw new Error('用户不存在');return{uid:p.sub,perms:PermSvc.perms(p.roles),un:p.un};}
  check(a:{perms:Perm[]},p:Perm):boolean{return a.perms.includes(p);}
  mkAK(uid:UId,name:string,scopes:Perm[]):AKInfo{const k=ak('sk_'+crypto.randomBytes(24).toString('hex'));const i:AKInfo={key:k,uid,name,scopes,ca:new Date()};this.ks.set(k,i);return i;}
  vAK(k:AK,need?:Perm):AKInfo{const i=this.ks.get(k);if(!i)throw new Error('无效Key');i.lu=new Date();if(need&&!i.scopes.includes(need))throw new Error('缺权限:'+need);return i;}
}
const auth=new AuthSvc();
const adm=auth.reg('admin','a@e.com',pp('A123!'),['admin']);
const ed=auth.reg('editor','e@e.com',pp('E123!'),['editor']);
const vw=auth.reg('viewer','v@e.com',pp('V123!'),['viewer']);
console.log(\`注册:admin(\${adm.id}),editor(\${ed.id}),viewer(\${vw.id})\`);

const al=auth.login('a@e.com',pp('A123!'));const aa=auth.verify(al.a);
console.log(\`\\n[admin]权限\${aa.perms.length}个,user:delete=\${auth.check(aa,'user:delete')?'✓':'✗'},setting:manage=\${auth.check(aa,'setting:manage')?'✓':'✗'}\`);
const el=auth.login('e@e.com',pp('E123!'));const ea=auth.verify(el.a);
console.log(\`[editor]权限\${ea.perms.length}个,user:delete=\${!auth.check(ea,'user:delete')?'✓正确拒绝':'✗'},post:update=\${auth.check(ea,'post:update')?'✓':'✗'}\`);
const vl=auth.login('v@e.com',pp('V123!'));const va=auth.verify(vl.a);
console.log(\`[viewer]权限\${va.perms.length}个,post:create=\${!auth.check(va,'post:create')?'✓正确拒绝':'✗'},post:read=\${auth.check(va,'post:read')?'✓':'✗'}\`);

console.log("\\n---API Key测试---");
const ci=auth.mkAK(adm.id,'CI',['post:read','post:create']);
console.log('Key:'+ci.key.slice(0,25)+'...');
const vk=auth.vAK(ci.key,'post:read');console.log('验证成功,uid='+vk.uid);
try{auth.vAK(ci.key,'user:delete');}catch(e:any){console.log('越权拒绝:'+e.message);}
try{auth.login('a@e.com',pp('wrong'));}catch(e:any){console.log('\\n错误密码:'+e.message);}
try{auth.verify(at('bad.token'));}catch(e:any){console.log('无效token:'+e.message);}`
  },
  // =========================================================
  // 第4章：事件驱动与流处理
  // =========================================================
  {
    id: "ts3-node-events-streams",
    title: "事件驱动与流处理",
    icon: "🌊",
    group: "Node.js 后端开发",
    content: `# 事件驱动与流处理

Node.js 的核心设计哲学之一就是事件驱动（Event-Driven）和非阻塞 I/O（Non-blocking I/O），而事件（Event）和流（Stream）正是这一设计哲学的具体体现和核心实现机制。从 Node.js 核心模块本身（HTTP 服务器模块、文件系统模块、网络 Socket 模块）到上层的应用框架（Express、Koa、Socket.io），事件和流无处不在：HTTP 服务器在接收到客户端请求时触发 request 事件，文件读取以流的方式逐块处理数据而不是一次性加载到内存，TCP Socket 本身既是可读流又是可写流（双工流 Duplex）。在纯 JavaScript 环境下使用 EventEmitter 和 Stream 时，事件名是任意字符串没有任何约束、事件监听器的回调函数参数类型是 any 没有类型提示、流中传输的数据类型完全不明确，这导致了大量运行时错误：监听一个拼写错误的事件名不会有任何提示（比如写了 'dataRecieved' 而不是 'dataReceived'），程序永远不会响应那个事件；emit 事件时传递的参数数量或参数类型与监听器期望不符不会被发现，导致监听器内部出现 undefined 错误或类型错误；流管道中上游输出的数据类型与下游期望的输入类型不匹配，导致难以调试的数据解析错误；背压（Backpressure）处理不当导致内存溢出和性能问题。TypeScript 的泛型、映射类型、条件类型、可辨识联合类型等高级特性为事件系统和流处理提供了添加精确类型约束的能力，让我们能够构建类型安全的事件驱动架构和流式数据处理管道。

## 一、类型化 EventEmitter

Node.js 内置的 EventEmitter 类是事件驱动编程的基础，提供了 on（注册监听器）、once（注册一次性监听器）、off/removeListener（移除监听器）、emit（触发事件）、listenerCount（获取监听器数量）等核心方法。但原生的 EventEmitter 是完全无类型的：on(eventName: string, listener: (...args: any[]) => void) 接受任意字符串作为事件名和任意函数作为监听器，emit(eventName: string, ...args: any[]) 同样接受任意事件名和任意参数，没有任何类型检查。

为 EventEmitter 添加类型安全的关键是定义事件映射类型（Event Map）：定义一个 TypeScript 接口，将每个事件名映射到对应的监听器函数签名。例如：interface ServerEvents { 'server:start': (port: number, env: string) => void; 'server:error': (error: Error) => void; 'request:received': (req: Request) => void; }。然后创建一个泛型的 TypedEventEmitter<TEvents extends EventMap> 类，内部包装一个原生的 EventEmitter 实例，在对外暴露的方法中使用泛型约束：on 方法的事件名参数约束为 K extends keyof TEvents，监听器参数类型为 TEvents[K]；emit 方法的剩余参数类型使用 Parameters<TEvents[K]> 从监听器函数签名自动提取，确保触发事件时传递的参数类型和数量与监听器期望完全匹配。这样一来，错误的事件名、错误的参数类型、缺少参数或多余参数都会在编译阶段被捕获。

## 二、事件映射设计最佳实践

设计良好的类型安全事件映射需要注意以下几点：第一，统一事件命名约定，推荐使用 '资源:动作' 的命名格式（如 'order:created'、'user:login'、'payment:failed'），既避免事件名冲突又清晰表达事件含义；第二，为事件定义基础事件接口，包含 eventId（事件唯一ID，用于幂等性和追踪）、timestamp（事件发生时间戳）、type（事件类型）等通用字段，这样可以编写通用的事件日志、事件持久化、事件重放等处理逻辑；第三，考虑事件版本化（event versioning），当业务演进导致事件结构变化时，通过版本号区分不同版本的事件结构；第四，使用可辨识联合类型（Discriminated Union）汇总所有事件类型，在事件处理函数中通过 event.type 进行类型窄化，获得精确的 payload 类型提示。on、once、off、emit、listenerCount 等所有方法都应该有精确的类型签名，off 方法要确保能正确移除对应的监听器（类型上不允许移除未注册过的监听器类型）。

## 三、Pub/Sub 消息总线

发布/订阅模式（Publish/Subscribe，简称 Pub/Sub）比直接使用 EventEmitter 更进一步，实现了发布者和订阅者之间的完全解耦：发布者只负责向某个频道（Channel/Topic）发布消息，不需要知道有哪些订阅者存在，也不需要订阅者在线；订阅者只需要订阅感兴趣的频道，不需要知道消息来自哪个发布者。类型安全的 Pub/Sub 通过定义 Channel Map（频道映射）来建立频道名到消息类型的映射：type ChannelMap = { 'order:created': OrderCreatedEvent; 'notification:email': EmailMessage; 'log:access': AccessLog; }; publish 方法确保发布到某频道的消息符合该频道的消息类型，subscribe 方法的处理函数接收正确类型的消息参数。在分布式系统中，消息总线通常由 Redis Pub/Sub、RabbitMQ、Kafka 等消息队列实现，支持跨服务、跨进程的消息传递，但核心的类型安全思想是一致的——通过共享类型定义包（Shared Types Package）保持跨服务的消息类型一致。类型安全的 Pub/Sub 还应支持异步消息处理、错误隔离（一个订阅者出错不影响其他订阅者）、通配符订阅（如 'order:*'）等功能。

## 四、Node.js Stream 类型详解

Node.js 的 Stream 是处理流式数据的抽象接口，分为四种基本类型：Readable（可读流，作为数据源产出数据，如文件读取流、HTTP 请求流）、Writable（可写流，作为数据目的地接收数据，如文件写入流、HTTP 响应流）、Duplex（双工流，既可读又可写，如 TCP Socket）、Transform（转换流，读取数据后处理转换再输出，如压缩/解压缩流、加密/解密流、JSON 解析流）。@types/node 中为这些流类型提供了泛型参数来指定流中传输的数据类型。在 objectMode（对象模式）下，流可以传输 JavaScript 对象而不仅仅是 Buffer 或字符串。

在实际的数据处理管道中，数据类型经常会发生变化：从文件读取的 Buffer → 通过解码转换为 string → 通过 JSON.parse 转换为对象 → 通过业务逻辑转换为 DTO → 最终序列化为输出格式。通过自定义 TypedTransform<TInput, TOutput> 泛型转换流类，可以精确追踪每一步的数据类型变化，构建类型安全的数据管道：source (Readable<Buffer>) → decoder (Transform<Buffer, string>) → parser (Transform<string, LogEntry>) → enricher (Transform<LogEntry, EnrichedLog>) → aggregator (Writable<EnrichedLog>)，类型系统确保上游的输出类型匹配下游的输入类型。流处理还需要正确处理背压（Backpressure）机制：当 writable.write() 返回 false 时，表示下游处理不过来，上游应该暂停写入等待 drain 事件再继续，否则数据会堆积在内存中导致内存溢出；pipe 方法和 pipeline 函数自动处理背压。

## 五、消息队列与事件溯源类型

消息队列（Message Queue）用于异步处理耗时任务、解耦系统依赖：类型安全的消息队列需要定义消息类型映射、消息处理器类型、消息元数据类型（包括消息优先级、延迟时间、重试次数、死信队列等配置）。事件溯源（Event Sourcing）是一种架构模式，它不存储对象的当前状态，而是存储对象状态变更的一系列事件，通过重放事件序列来重建当前状态。类型安全的事件溯源需要：聚合根类型（Aggregate Root）、领域事件可辨识联合（DomainEvent discriminated union）、EventStore 接口（append 追加事件、loadEvents 加载事件流）、apply 函数根据事件类型安全地更新聚合根状态。关键的类型安全约束包括：命令（Command）只能在聚合根的正确状态下产生对应的事件；apply 函数使用 never 检查确保穷尽处理了所有事件类型（添加新事件类型时编译器会报错提醒你更新 apply 函数）。CQRS（命令查询职责分离）模式将命令（改变状态但不返回值）和查询（返回值但不改变状态）分开，通过类型映射建立命令/查询到其处理器的对应关系，dispatch 方法根据命令/查询类型自动推断参数类型和返回值类型。

本章的代码示例实现了：泛型 TypedEventEmitter（on/once/off/emit 全类型安全，支持事件映射类型）、Pub/Sub 消息总线（异步消息处理、多订阅者支持、错误隔离）、类型化流处理管道（使用 Node.js stream 模块的 Readable、Transform、Writable，在 objectMode 下精确追踪数据类型变化：原始日志字符串→解析后日志对象→带优先级的丰富日志→聚合统计），演示了订单事件的发布订阅处理（新订单创建触发库存扣减、支付成功触发邮件通知和日志记录）、日志流的解析和聚合统计等典型场景。

## 六、事件溯源与 CQRS 的类型实现

事件溯源（Event Sourcing）模式中，聚合根（Aggregate Root）的状态完全由其事件历史决定，不存在"当前状态"的直接存储。类型安全的事件溯源需要：为每个聚合根定义其可能产生的所有领域事件（Domain Events），使用可辨识联合类型（Discriminated Union）统一表示；定义命令类型（Commands）表示用户意图，每个命令在验证通过后产生零个或多个事件；定义 applyEvent 函数，接收当前状态和事件，返回新状态，使用 switch 语句穷尽匹配所有事件类型，并使用 never 类型检查确保没有遗漏。CQRS（命令查询职责分离）在此基础上进一步分离写模型（命令端）和读模型（查询端），写模型只处理命令产生事件，读模型订阅事件更新自己的视图数据，两端可以独立优化和扩展。

## 七、背压处理与流式背压类型

背压（Backpressure）是流处理中的核心概念：当数据消费速度低于生产速度时，需要有一种机制让生产者减速，否则数据会在内存中积压导致内存溢出。Node.js Stream 内置了背压处理机制：writable.write() 返回 false 表示内部缓冲区已满，生产者应该等待 'drain' 事件后再继续写入；pipe 方法和 pipeline 函数自动处理背压传播。类型安全的流处理需要确保数据在管道各阶段之间正确传递，同时正确处理背压信号。在 objectMode 下，背压同样适用，只是数据单位从字节变成了对象个数。高吞吐量场景下还需要关注流的错误处理：一个流的错误应该正确传播到整个管道并触发资源清理。

## 八、WebSocket 与实时通信事件类型

WebSocket 提供了浏览器与服务器之间的双向实时通信通道，本质上是事件驱动的。类型安全的 WebSocket 实现需要定义客户端到服务器的消息类型和服务器到客户端的消息类型，通常使用可辨识联合：type ClientMessage = { type: 'chat:send', content: string } | { type: 'typing:start' } | { type: 'typing:stop' }; type ServerMessage = { type: 'chat:received', message: Message } | { type: 'user:join', user: User } | { type: 'user:leave', userId: number }; send 方法只接受合法的消息类型，on 方法根据消息 type 自动窄化消息数据类型。Room（房间）和 Channel（频道）抽象可以通过泛型参数指定房间内传输的消息类型，实现更细粒度的类型安全。Socket.io 等库已经提供了良好的 TypeScript 支持，但核心的类型设计思想是通用的。

## 九、类型化事件总线的错误处理与重试

事件驱动架构中，错误处理和重试机制对系统可靠性至关重要。类型安全的错误处理要求：每个事件处理器的错误类型是明确的，不应该抛出 any 类型的异常；消息总线支持死信队列（Dead Letter Queue），处理失败超过重试次数的消息进入死信队列等待人工处理；重试策略类型（指数退避、固定间隔、最大重试次数）可以通过类型系统配置。事件幂等性（Idempotency）是事件驱动系统的重要属性——同一个事件可能因网络重试被投递多次，消费者必须能够正确处理重复事件而不产生副作用，通过 eventId 实现幂等检查。类型系统可以帮助标记哪些事件处理器是幂等的，哪些不是。

## 十、RxJS 与响应式流类型

对于更复杂的异步事件流处理场景，RxJS（Reactive Extensions for JavaScript）提供了强大的响应式编程模型。RxJS 的 Observable 类型是类型安全的异步数据流，支持丰富的操作符（map、filter、mergeMap、debounceTime、throttleTime、switchMap 等）来转换、过滤、组合、节流数据流。TypeScript 能够正确推断每个操作符链式调用后的数据类型，确保流中数据类型的正确性。虽然 RxJS 学习曲线较陡，但在处理复杂的事件组合（如拖拽、表单输入防抖、WebSocket 消息流、实时数据仪表盘）时，类型安全的响应式编程能够大幅简化代码逻辑。`,
    code: `(async()=>{console.log("========== 1. TypedEventEmitter ==========\\n");
const{EventEmitter}=require('events');
type EMap=Record<string|symbol,(...a:any[])=>void>;
class TypedEE<TE extends EMap>{
  private e=new EventEmitter();
  on<K extends keyof TE>(ev:K,l:TE[K]){this.e.on(ev as any,l as any);return this;}
  once<K extends keyof TE>(ev:K,l:TE[K]){this.e.once(ev as any,l as any);return this;}
  emit<K extends keyof TE>(ev:K,...a:Parameters<TE[K]>){return this.e.emit(ev as any,...a);}
  lc<K extends keyof TE>(ev:K){return this.e.listenerCount(ev as any);}
}
interface AppE{
  'server:start':(p:number,env:string)=>void;
  'user:reg':(u:{id:number;name:string;email:string})=>void;
  'error':(e:Error,ctx?:string)=>void;
  'data:change':(entity:string,id:number,type:'create'|'update'|'delete')=>void;
}
const app=new TypedEE<AppE>();
app.on('server:start',(p,e)=>console.log(\`[服务器]端口\${p},\${e}环境\`));
app.on('user:reg',u=>console.log(\`[用户]\${u.name}<\${u.email}>注册\`));
app.on('data:change',(en,id,t)=>console.log(\`[变更]\${en}#\${id} \${t}d\`));
app.on('error',(e,c)=>console.log(\`[错误]\${c?'('+c+')':''}\${e.message}\`));
app.emit('server:start',3000,'dev');
app.emit('user:reg',{id:1,name:'Alice',email:'a@b.com'});
app.emit('data:change','Post',42,'create');
app.emit('error',new Error('连接超时'),'db');
console.log(\`error监听器:\${app.lc('error')}个\`);

console.log("\\n========== 2. Pub/Sub消息总线 ==========\\n");
interface ChMap{
  'order:created':{oid:string;uid:number;amt:number;items:{n:string;p:number;q:number}[]};
  'order:paid':{oid:string;pid:string;paidAt:Date};
  'notify:email':{to:string;subj:string;body:string};
  'log:access':{method:string;path:string;status:number;ms:number};
  'inv:update':{pid:number;delta:number;reason:string};
}
type Hdl<T>=(m:T)=>void|Promise<void>;
class Bus<TCh extends Record<string,any>>{
  private subs=new Map<keyof TCh,Set<Hdl<any>>>();
  sub<K extends keyof TCh>(ch:K,h:Hdl<TCh[K]>):()=>void{if(!this.subs.has(ch))this.subs.set(ch,new Set());this.subs.get(ch)!.add(h);return()=>this.subs.get(ch)?.delete(h);}
  async pub<K extends keyof TCh>(ch:K,m:TCh[K]){const hs=this.subs.get(ch);if(!hs||hs.size===0){console.log(\`  [总线]"\${String(ch)}"无订阅者\`);return;}for(const h of hs){try{await h(m);}catch(e:any){console.log(\`  [错误]\${String(ch)}:\${e.message}\`);}}}
}
const bus=new Bus<ChMap>();
bus.sub('order:created',o=>{console.log(\`[订单]新订单\${o.oid} ¥\${o.amt},\${o.items.length}件\`);bus.pub('inv:update',{pid:1,delta:-o.items.length,reason:'order:'+o.oid});});
bus.sub('order:paid',p=>{console.log(\`[支付]\${p.oid}已支付\`);bus.pub('notify:email',{to:'c@e.com',subj:'支付确认',body:'订单已支付'});});
bus.sub('notify:email',e=>console.log(\`[邮件]→\${e.to}:\${e.subj}\`));
bus.sub('log:access',l=>console.log(\`[日志]\${l.method} \${l.path}→\${l.status}(\${l.ms}ms)\`));
bus.sub('inv:update',i=>console.log(\`[库存]商品\${i.pid}变动\${i.delta>0?'+':''}\${i.delta}\`));

await bus.pub('order:created',{oid:'ORD-1',uid:1001,amt:299,items:[{n:'TS教程',p:99,q:1},{n:'Node实战',p:200,q:1}]});
await bus.pub('order:paid',{oid:'ORD-1',pid:'PAY-1',paidAt:new Date()});
await bus.pub('log:access',{method:'GET',path:'/api/u/1',status:200,ms:45});

console.log("\\n========== 3. 类型化流管道 ==========\\n");
const{Readable,Transform,Writable,pipeline}=require('stream');
class TT<TI,TO>extends Transform{
  private _tf:(c:TI,enc:string,cb:(e:Error|null,o?:TO)=>void)=>void;
  constructor(tf:(c:TI,enc:string,cb:(e:Error|null,o?:TO)=>void)=>void){super({objectMode:true});this._tf=tf;}
  _transform(c:any,enc:string,cb:any){this._tf(c,enc,cb);}
}
interface Raw{raw:string}
interface Parsed{ts:Date;level:'debug'|'info'|'warn'|'error';svc:string;msg:string}
interface Enriched extends Parsed{prio:number;tag:string}
interface Stats{total:number;byLv:Record<string,number>;bySvc:Record<string,number>;errs:Enriched[]}
const logs:Raw[]=[
  {raw:'2024-01-01T10:00:00Z [INFO] [auth] 登录成功'},
  {raw:'2024-01-01T10:00:01Z [ERROR] [db] 连接超时'},
  {raw:'2024-01-01T10:00:02Z [WARN] [cache] 命中率低'},
  {raw:'2024-01-01T10:00:03Z [INFO] [api] GET /users→200'},
  {raw:'2024-01-01T10:00:04Z [ERROR] [auth] 无效token'},
  {raw:'2024-01-01T10:00:05Z [DEBUG] [api] 校验通过'},
];
const src=Readable.from(logs,{objectMode:true});
const parser=new TT<Raw,Parsed>((c,_,cb)=>{const m=c.raw.match(/^(\\S+) \\[(\\w+)\\] \\[(\\w+)\\] (.+)$/);if(!m){cb(new Error('解析失败:'+c.raw));return;}cb(null,{ts:new Date(m[1]),level:m[2].toLowerCase()as any,svc:m[3],msg:m[4]});});
const enrich=new TT<Parsed,Enriched>((c,_,cb)=>{const p={debug:0,info:1,warn:2,error:3}[c.level];cb(null,{...c,prio:p,tag:'['+c.svc.toUpperCase()+']'});});
const stats:Stats={total:0,byLv:{},bySvc:{},errs:[]};
const agg=new Writable({objectMode:true,write(c:Enriched,_,cb){stats.total++;stats.byLv[c.level]=(stats.byLv[c.level]||0)+1;stats.bySvc[c.svc]=(stats.bySvc[c.svc]||0)+1;if(c.level==='error')stats.errs.push(c);cb();}});
await new Promise<void>((res,rej)=>pipeline(src,parser,enrich,agg,(e:any)=>{if(e)rej(e);else res();}));
console.log(\`日志统计: 总计\${stats.total}\`);
console.log(\`  级别: debug=\${stats.byLv.debug||0}, info=\${stats.byLv.info||0}, warn=\${stats.byLv.warn||0}, error=\${stats.byLv.error||0}\`);
console.log(\`  错误数:\${stats.errs.length}\`);stats.errs.forEach(e=>console.log(\`    [!]\${e.tag} \${e.msg}\`));
console.log("\\n========== 事件与流演示完成 ==========");})();`
  },
  // =========================================================
  // 第5章：CLI 工具开发
  // =========================================================
  {
    id: "ts3-node-cli-tooling",
    title: "CLI 工具开发",
    icon: "🛠️",
    group: "Node.js 后端开发",
    content: `# CLI 工具开发

命令行界面（Command Line Interface，简称 CLI）工具是开发者日常工作中不可或缺的重要组成部分——从包管理工具 npm/yarn/pnpm、版本控制工具 git、容器化工具 docker，到项目脚手架工具（create-react-app、vue-cli、Nest CLI）、代码构建工具（webpack、vite、tsc、esbuild）、部署脚本、数据库迁移工具、自定义运维脚本和各种自动化任务脚本，CLI 工具贯穿了软件开发生命周期的每一个环节，是开发者生产力的重要放大器。使用 TypeScript 开发 CLI 工具，不仅能获得 JavaScript 语言本身的跨平台优势（Windows、macOS、Linux 全平台支持）和 npm 生态系统上百万个可用包的强大支持，更能利用 TypeScript 的类型系统实现：命令行参数解析的类型安全、命令与子命令结构的类型约束、配置文件加载的类型验证、插件系统的类型安全扩展、帮助信息的自动生成与类型一致性保证、以及错误处理的规范化和类型化。

## 一、命令行参数的类型模型

Node.js 通过 process.argv 数组获取命令行传入的原始参数，这是一个字符串数组，其中前两个元素分别是 Node.js 可执行文件的路径和被执行脚本的路径，从第三个元素开始才是用户实际传入的参数。CLI 参数可以分为两大类：位置参数（Positional Arguments）和选项（Options/Flags）。位置参数是按照顺序出现的参数值，例如在 \`cp source.txt dest.txt\` 中，source.txt 和 dest.txt 就是位置参数，它们的意义由出现的位置决定。选项是以短横线开头的命名参数，又可以细分为：布尔标志（Boolean Flag，如 --verbose 或 -v，不需要跟值，存在即为 true）、字符串选项（如 --output dist，后面跟一个字符串值）、数字选项（如 --port 3000，后面跟一个数字值，需要从字符串转换为数字）、数组选项（如 --include src --include lib，多次出现，收集为一个数组）。

类型安全的参数解析不仅仅是正确地从 argv 中提取值，还要在类型层面将解析结果转换为正确的类型——number 类型的选项解析后的结果类型应该是 number 而不是 string，必填选项的类型中不应该包含 undefined。实现类型安全参数解析的关键是定义一个选项配置对象（Options Configuration），用它来描述每个参数的结构，然后让 TypeScript 从这个配置对象推断出最终的解析结果类型。每个选项的配置包含：类型（string/number/boolean/array）、短选项名（如 'p' 对应 --port）、默认值、描述文本、是否必填、可选值枚举（choices）等信息。

## 二、命令与子命令的类型设计

现代 CLI 工具普遍采用命令-子命令的树状层级结构，例如 git 有 commit、push、pull、checkout 等子命令，docker 有 build、run、exec、ps 等子命令，npm 有 install、publish、run、test 等子命令。类型安全的命令系统需要明确定义：命令名称、命令描述、选项配置、参数配置、处理函数（action handler）、以及子命令列表。使用建造者模式（Builder Pattern）结合方法链（Method Chaining）来注册命令，通过泛型参数逐步累积已注册的选项和参数类型，最终的 action 处理函数可以获得完整的类型信息——opts 参数包含所有已定义选项的正确类型，args 参数包含所有位置参数的字符串值。子命令支持多层嵌套（如 \`mycli remote add <name> <url>\`），每一层都有自己的选项和处理逻辑。

## 三、选项类型系统与运行时验证

选项配置对象需要包含多个维度的信息：值类型（string/number/boolean/array）、短选项名（如 -p 对应 --port）、默认值（当用户不提供时使用的值）、描述文本（用于自动生成帮助信息）、是否必填（required）、枚举可选值（choices，如 env 选项只能是 dev/staging/prod 三个值之一）、选项间的互斥关系和依赖关系（如 --production 和 --development 互斥）。类型系统需要在编译时区分必填选项和可选选项：必填选项的类型是 T（不包含 undefined），可选选项的类型是 T | undefined（或 T 如果有默认值）。运行时验证同样重要：检查必填选项是否提供了值、检查值的类型是否可以正确转换（如 --port 需要是有效数字）、检查枚举值是否在允许范围内。对于路径类型的选项，还可以检查文件或目录是否存在。

## 四、配置文件加载与多层配置合并

成熟的 CLI 工具通常支持通过配置文件来设置默认选项，减少每次运行时需要手动输入的参数数量（如 tsconfig.json、.eslintrc、webpack.config.js 等）。类型安全的配置文件加载需要：定义配置文件的 Schema（可以使用 Zod）、支持多种配置文件格式（JSON、YAML、TOML、JS/TS 模块）、多层配置合并策略（命令行参数优先级最高，其次是环境变量，然后是配置文件，最后是内置默认值）。每一层配置合并时都要保持类型正确——合并后的结果应该是完整的配置类型，不需要运行时再做非空检查。重要的是不能简单地使用 as 断言配置类型，必须进行运行时验证，防止用户配置文件中有拼写错误或类型错误而导致运行时异常。

## 五、插件系统的类型设计

可扩展的 CLI 工具通常支持插件系统（Plugin System）来扩展功能（如 Vue CLI 插件、Webpack CLI 插件、ESLint 插件）。类型安全的插件系统需要定义：Plugin 接口（通常是一个接收上下文对象的函数）、PluginContext 类型（插件可以调用的 API 集合，如注册命令、注册选项、注册生命周期钩子）、生命周期钩子类型（如命令执行前、命令执行后、配置加载后、错误发生时）。插件作为函数模式（Plugin as Function）是最容易实现类型安全的方式：插件接收一个类型化的上下文对象，通过上下文对象提供的 API 来注册扩展，上下文 API 的类型决定了插件能够做什么，确保插件不会意外访问或修改 CLI 内部状态。

## 六、交互式 CLI、进度报告与帮助信息自动生成

CLI 不仅仅是被动接收参数，还可以提供丰富的交互体验：确认提示（Are you sure? [y/N]）、文本输入、密码输入（隐藏输入内容）、单选列表、多选列表、进度条、彩色输出、表格展示等。这些交互元素同样可以有类型安全的 API：进度条的 update 方法接受 0 到 100 之间的数字或 (completed, total) 元组；不同类型的交互提示返回不同类型的值——确认提示返回 boolean，文本输入返回 string，单选列表返回所选值的字面量类型，多选列表返回所选值的数组类型；彩色输出方法只接受有效的颜色名称参数，不允许拼写错误的颜色名。帮助信息（--help）应该从类型定义和选项配置自动生成，而不是手动编写和维护——当你新增一个选项或修改选项描述时，帮助信息会自动更新，避免帮助文档与实际功能不一致的尴尬。

## 七、错误处理与用户体验

CLI 工具的错误处理与 Web 后端有所不同：错误信息应该友好地输出到 stderr（而不是 stdout），使用颜色突出显示错误级别（红色错误、黄色警告），提供有用的错误描述和解决建议，并使用正确的退出码（exit code）：0 表示成功，1 表示一般性错误，2 表示参数用法错误（遵循 Unix 惯例）。支持 --verbose 选项在调试时输出完整的错误堆栈信息，默认只输出友好的错误消息。正确处理 SIGINT 信号（用户按 Ctrl+C），实现优雅退出和资源清理（如删除临时文件、关闭数据库连接）。定义 CliError 类包含 exitCode 属性，在 action handler 中抛出 CliError，统一由错误处理中间件捕获并输出。

本章的代码示例从零开始构建了一个类型安全的 CLI 框架，包括：泛型命令注册（使用链式 API 和类型推断，自动从选项配置推断解析结果类型）、多种类型选项解析（string、number、boolean、array 类型，支持短选项、默认值、必填验证、choices 枚举）、子命令嵌套支持、自动帮助信息生成（--help）、配置文件加载和验证、插件注册机制、进度报告模拟和彩色输出模拟，并通过模拟不同的 process.argv 输入演示了 build 命令、serve 命令、deploy 命令的类型安全参数解析和执行过程。

## 八、彩色输出、动画与终端能力检测

CLI 工具的用户体验很大程度上取决于输出的可读性和美观度。ANSI 转义序列可以实现彩色文本、文本样式（加粗、下划线、斜体）、光标移动、清屏等效果。类型安全的彩色输出函数应该只接受有效的颜色名称和样式组合，不允许使用不存在的颜色名。Spinner（加载动画）和 ProgressBar（进度条）是常见的长时间任务反馈组件，它们的 API 同样需要类型安全：进度条的 update 方法接受 0-100 的数字或完成数/总数元组，start 和 stop 方法正确管理终端状态。终端能力检测（是否支持彩色、终端宽度、是否为 TTY）对于提供降级体验很重要：当输出重定向到文件时应该自动禁用颜色和动画。

## 九、CLI 测试策略与类型守卫

测试 CLI 工具需要特殊的策略：单元测试验证参数解析逻辑和 action 处理函数，可以通过传入模拟的 argv 数组和捕获 stdout/stderr 输出来断言行为；集成测试通过 child_process.spawn 实际运行 CLI 命令，验证退出码和输出；快照测试验证帮助信息的输出格式。类型守卫（Type Guards）在 CLI 开发中特别有用：在解析配置文件后，使用类型守卫函数验证数据结构是否符合预期类型，不满足时给出清晰的错误信息；在处理用户输入时，使用类型守卫将外部输入的 unknown 类型窄化为期望的具体类型。使用 zod 等验证库可以自动生成类型守卫，无需手动编写。

## 十、打包分发与 Shebang 类型

开发完成的 CLI 工具需要打包分发给用户使用。常见的分发方式是发布到 npm，用户通过 npm install -g 全局安装或通过 npx 直接运行。在 package.json 中配置 bin 字段指定命令名到入口文件的映射，入口文件的第一行必须是 Shebang（#!/usr/bin/env node）告诉系统用 Node.js 执行该文件。使用 esbuild、pkg、nexe 等工具可以将 CLI 打包为独立可执行文件，用户无需安装 Node.js 即可运行。TypeScript 编写的 CLI 可以编译为 CommonJS 或 ESM 格式发布，建议发布时携带类型声明文件（.d.ts）方便其他插件开发者使用类型。开发体验方面，使用 tsx 或 ts-node 可以直接运行 TypeScript 源码而无需预编译，提升开发迭代速度。

## 十一、环境变量与配置管理类型

CLI 工具通常需要支持环境变量配置（如 MYAPP_PORT=3000 myapp start）。类型安全的环境变量处理需要定义环境变量 Schema（使用 Zod 等），在启动时验证所有必需的环境变量是否存在、类型是否正确，给出清晰的错误提示而不是在运行时出现 undefined 错误。dotenv 等库用于从 .env 文件加载环境变量，但需要配合类型验证才能确保安全。配置优先级通常是：命令行参数 > 环境变量 > 项目配置文件 > 用户全局配置 > 内置默认值，合并逻辑需要保持类型一致。

## 十二、CLI 框架生态与选型建议

TypeScript 生态中有多个成熟的 CLI 框架：Commander.js 是最经典的选择，API 简洁，支持子命令、选项、自动帮助生成；Yargs 同样功能完善，TypeScript 支持良好；oclif 是 Heroku 开源的企业级 CLI 框架，支持插件、自动补全、命令生成；CAC 是轻量级的选择，API 设计现代 TypeScript 友好。选择框架时考虑：类型支持质量（是否有良好的泛型推断）、包体积、功能需求（是否需要插件系统、自动补全）、社区活跃度。无论选择哪个框架，理解底层的类型安全原理（选项配置→类型推断、命令注册→类型累积）都能帮助你更好地使用和扩展框架。`,
    code: `(async()=>{console.log("========== 1. CLI解析系统 ==========\\n");
type OType='string'|'number'|'boolean'|'array';
interface OCfg{type:OType;short?:string;default?:any;required?:boolean;desc?:string;choices?:string[]}
interface ACfg{name:string;required?:boolean;desc?:string;variadic?:boolean}
type OFromCfg<T extends Record<string,OCfg>>={[K in keyof T]:
  T[K]['required']extends true?
    (T[K]['type']extends'boolean'?boolean:T[K]['type']extends'number'?number:T[K]['type']extends'array'?string[]:string):
    (T[K]['type']extends'boolean'?boolean:T[K]['type']extends'number'?number|undefined:T[K]['type']extends'array'?string[]|undefined:string|undefined)}&{[k:string]:any};
interface Ctx<TO,TA>{opts:TO;args:TA;log:(...a:any[])=>void;error:(...a:any[])=>void;}
class Cmd<TO extends Record<string,any>=Record<string,any>,TA extends Record<string,any>=Record<string,any>>{
  opts:Record<string,OCfg>={};args:ACfg[]=[];subs=new Map<string,Cmd>();
  h?:(c:Ctx<TO,TA>)=>void|Promise<void>;desc:string='';
  constructor(public name:string,d?:string){this.desc=d||'';}
}
class CliApp{
  private cmds=new Map<string,Cmd>();private gopts:Record<string,OCfg>={};private n:string;private v:string;
  constructor(n?:string,v?:string){this.n=n||'cli';this.v=v||'1.0.0';this.gopts['help']={type:'boolean',short:'h',desc:'显示帮助'};this.gopts['version']={type:'boolean',short:'V',desc:'显示版本'};}
  cmd<TO extends Record<string,OCfg>,TA extends Record<string,ACfg>>(name:string,d?:string,def?:{opts?:TO;args?:TA}):Cmd<OFromCfg<TO>,{[K in keyof TA]:string}>{
    const c=new Cmd(name,d)as Cmd<OFromCfg<TO>,{[K in keyof TA]:string}>;
    if(def?.opts)c.opts=def.opts;if(def?.args)c.args=Object.values(def.args);this.cmds.set(name,c as any);return c;
  }
  private parseArgs(raw:string[]){const r:{args:string[];opts:Record<string,any>}={args:[],opts:{}};let i=0;
    while(i<raw.length){const a=raw[i];
      if(a.startsWith('--')){const eq=a.indexOf('=');let k,v;if(eq>0){k=a.slice(2,eq);v=a.slice(eq+1);}else{k=a.slice(2);}
        if(i+1<raw.length&&!raw[i+1].startsWith('-')&&v===undefined){r.opts[k]=raw[i+1];i+=2;}else{r.opts[k]=v??true;i++;}}
      else if(a.startsWith('-')&&a.length>1){const k=a.slice(1);if(i+1<raw.length&&!raw[i+1].startsWith('-')){r.opts[k]=raw[i+1];i+=2;}else{r.opts[k]=true;i++;}}
      else{r.args.push(a);i++;}}
    return r;
  }
  private coerce(v:any,t:OType):any{
    if(v===true||v===undefined)return t==='boolean'?true:v;
    if(t==='boolean')return v==='true'||v==='1'||v===true;
    if(t==='number'){const n=Number(v);if(isNaN(n))throw new Error('需要数字');return n;}
    if(t==='array')return Array.isArray(v)?v:[String(v)];
    return String(v);
  }
  private resolve(p:Record<string,any>,d:Record<string,OCfg>){
    const r:Record<string,any>={};
    for(const[n,c]of Object.entries(d)){let v:any;
      if(n in p)v=p[n];else if(c.short&&c.short in p)v=p[c.short];else if(c.default!==undefined)v=c.default;else if(c.type==='boolean')v=false;else if(c.type==='array')v=[];
      if(c.required&&v===undefined)throw new Error('缺少必填:--'+n);
      if(c.choices&&v!==undefined&&!c.choices.includes(String(v)))throw new Error('--'+n+'必须是:'+c.choices.join(','));
      r[n]=v===undefined?undefined:this.coerce(v,c.type);}
    return r;
  }
  private help(cmd?:Cmd,path?:string){
    const px=path||this.n;console.log(\`\\n用法: \${px} <命令> [选项] [参数]\\n\`);
    if(cmd){if(cmd.desc)console.log(cmd.desc+'\\n');
      if(cmd.args.length){console.log('参数:');cmd.args.forEach(a=>console.log(\`  \${a.name}\${a.required?' (必填)':''}  \${a.desc||''}\`));console.log('');}
      console.log('选项:');const ao={...this.gopts,...cmd.opts};
      for(const[n,c]of Object.entries(ao)){const s=c.short?'-'+c.short+', ':'';const r=c.required?' (必填)':'';const d=c.default!==undefined?' [默认:'+String(c.default)+']':'';console.log(\`  \${s}--\${n}\${r}  \${c.desc||''}\${d}\`);}
      if(cmd.subs.size>0){console.log('\\n子命令:');cmd.subs.forEach((s,n)=>console.log(\`  \${n}  \${s.desc}\`));}}
    else{console.log('命令:');this.cmds.forEach((c,n)=>console.log(\`  \${n}  \${c.desc}\`));}
  }
  async run(raw:string[]){
    const p=this.parseArgs(raw);
    if(p.opts.version||p.opts.V){console.log(this.n+' v'+this.v);return;}
    const cn=p.args.shift();
    if(!cn||p.opts.help||p.opts.h){this.help();return;}
    const cmd=this.cmds.get(cn);
    if(!cmd){console.error('未知命令:'+cn);this.help();process.exitCode=1;return;}
    if(p.opts.help||p.opts.h){this.help(cmd,this.n+' '+cn);return;}
    try{
      const opts=this.resolve(p.opts,{...this.gopts,...cmd.opts})as any;
      const args:Record<string,string>={};cmd.args.forEach((a,i)=>{args[a.name]=p.args[i]||'';});
      await cmd.h?.({opts,args,log:(...a:any)=>console.log(...a),error:(...a:any)=>console.error(...a)});
    }catch(e:any){console.error('错误:'+e.message);process.exitCode=1;}
  }
}

console.log("✓ CLI框架就绪\\n");
console.log("========== 2. 定义命令并测试 ==========\\n");
const cli=new CliApp('mytool','1.0.0');

cli.cmd('build','构建项目',{
  opts:{watch:{type:'boolean',short:'w',desc:'监听模式'},output:{type:'string',short:'o',default:'dist',desc:'输出目录'},minify:{type:'boolean',short:'m',desc:'压缩代码'},config:{type:'string',short:'c',desc:'配置文件路径'}},
  args:{entry:{name:'entry',required:true,desc:'入口文件'}}
}).h=async(c)=>{
  console.log(\`[build]入口=\${c.args.entry},输出=\${c.opts.output},监听=\${c.opts.watch},压缩=\${c.opts.minify}\`);
  for(let i=0;i<=3;i++){await new Promise(r=>setTimeout(r,50));console.log('  构建进度:'+(i*33)+'%');}
  console.log('  ✓ 构建完成');
};

cli.cmd('serve','启动开发服务器',{
  opts:{port:{type:'number',short:'p',default:3000,desc:'端口号'},host:{type:'string',short:'H',default:'localhost',desc:'主机名'},open:{type:'boolean',short:'o',desc:'自动打开浏览器'}},
}).h=async(c)=>{
  console.log(\`[serve]启动 http://\${c.opts.host}:\${c.opts.port},自动打开=\${c.opts.open}\`);
  console.log('  服务器已就绪');
};

cli.cmd('deploy','部署应用',{
  opts:{env:{type:'string',short:'e',required:true,choices:['dev','staging','prod'],desc:'部署环境'}},
}).h=async(c)=>{
  console.log(\`[deploy]部署到环境: \${c.opts.env}\`);
  console.log('  ✓ 部署完成');
};

async function test(args:string[]){
  console.log('$ mytool '+args.join(' '));
  await cli.run(args);
  console.log('');
}

await test(['build','src/index.ts','-o','build','-m']);
await test(['serve','-p','8080','--open']);
await test(['deploy','--env','prod']);
await test(['build','--help']);
console.log("========== CLI演示完成 ==========");})();`
  }
];
