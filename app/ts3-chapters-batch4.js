// =============================================================
// TypeScript 工具链与工程化（第三册）—— 第四批章节（共 5 章）
// -------------------------------------------------------------
// 分组：工具链与工程化
//   1. ts3-testing-typesafe  — 类型安全的测试
//   2. ts3-tsc-api           — TypeScript 编译器 API
//   3. ts3-codegen           — 代码生成与类型提取
//   4. ts3-monorepo          — Monorepo 工程化
//   5. ts3-migration-js-to-ts — JavaScript 到 TypeScript 迁移实战
// =============================================================

export const chapters = [
  {
    id: "ts3-testing-typesafe",
    title: "类型安全的测试",
    icon: "🧪",
    group: "工具链与工程化",
    content: `# 类型安全的测试

在现代前端工程化体系中，测试是保障代码质量的重要环节。TypeScript 作为一门静态类型语言，其类型系统与测试框架的结合能够为我们提供更加强大的保障——不仅在运行时验证代码行为，还能在编译时捕获测试代码本身的错误。本章将深入探讨如何在 Jest/Vitest 等测试框架中实现类型安全的测试模式，从测试夹具的类型定义到 Mock 函数的类型约束，从泛型测试工具到类型层面的断言，全面构建类型安全的测试体系。

## 一、测试框架的类型基础

Jest 和 Vitest 作为目前最流行的 JavaScript/TypeScript 测试框架，都提供了完善的类型定义。理解这些基础类型是编写类型安全测试的第一步。

### 1.1 Jest/Vitest 的全局类型

在使用 Jest 或 Vitest 时，describe、it、test、expect 等全局函数都有对应的类型定义。这些类型确保了测试用例的基本结构正确：describe 接收字符串名称和回调函数；test 定义单个测试用例；expect 通过泛型推断断言值类型，使得链式匹配器获得正确的类型提示。例如对字符串调用 expect 后，.toBeGreaterThan() 等数字匹配器会被标记为类型错误。

### 1.2 测试函数的返回值类型

测试函数可以返回 void 或 Promise<void>。使用 async/await 编写异步测试时，TypeScript 自动推断返回类型为 Promise。配合 @typescript-eslint/no-floating-promises 规则可以在静态检查阶段发现未处理的 Promise rejection。

## 二、类型化的测试夹具（Test Fixtures）

测试夹具是测试中用于固定测试环境的数据和配置。类型化的夹具能够确保测试数据始终符合被测代码的接口契约。

### 2.1 使用 satisfies 运算符约束夹具类型

TypeScript 4.9 引入的 satisfies 运算符是定义类型安全夹具的利器。它既能验证数据符合目标类型，又能保留精确的字面量类型，不会将类型 widened 到宽泛的接口类型。在测试分支逻辑时，TypeScript 知道某个字段的确切值，可以进行更精确的类型收窄。

### 2.2 夹具工厂函数与泛型

对于需要多个变体的测试数据，工厂函数是更好的选择。通过泛型工厂函数，我们可以创建具有默认值但允许部分覆盖的夹具生成器。默认值保证测试数据的基本合法性，泛型约束确保覆盖的字段符合原始类型，返回值类型精确反映传入的覆盖参数。使用 Required、Partial 等工具类型可以精确描述合并后的类型。

### 2.3 嵌套夹具的类型组合

在复杂场景中，测试数据往往是嵌套结构。类型安全的嵌套夹具需要为每一层定义独立类型，使用深度 Partial 类型支持部分覆盖，通过递归类型定义支持任意层级的覆盖。可以实现 DeepPartial 工具类型将所有属性（包括嵌套属性）变为可选，配合深度合并逻辑确保夹具生成既类型安全又灵活。

## 三、Mock 函数的类型安全

Mock 是测试中最常用的技术之一，但也是类型安全的薄弱环节。不正确的 Mock 类型可能导致测试通过但生产环境报错。

### 3.1 jest.MockedFunction 与 vi.MockedFunction

Jest 和 Vitest 都提供了 MockedFunction<T> 工具类型。使用 jest.fn() 创建 Mock 函数时默认类型是 Mock<any, any>，会丢失所有类型信息。将真实函数的类型传入 MockedFunction，可以让 Mock 保留原始函数的参数类型、返回值类型，以及 .mockReturnValue()、.mockResolvedValue()、.mock.calls 等 Mock 特有方法的类型。

### 3.2 Mock 模块的类型安全

当需要 Mock 整个模块时，可以使用 jest.Mocked<typeof import('./module')> 获取整个模块的 Mock 类型，使得模块中所有导出函数都被正确标记为 Mock 函数，可安全访问 .mock 属性。自动 Mock 虽然方便，但类型安全需要手动标注。更好的做法是提供类型化的 Mock 工厂，或使用 __mocks__ 目录下的手动 Mock 文件并保持与原模块类型一致。

### 3.3 Mock 返回值的类型约束

.mockReturnValue() 接收的参数必须符合原函数的返回值类型。如果原函数返回 Promise，应使用 .mockResolvedValue() 而非 .mockReturnValue(Promise.resolve(...))——前者类型更精确。条件返回的 Mock 可使用 .mockImplementation() 并为实现函数添加正确类型注解。

## 四、泛型测试工具函数

在编写测试时，我们经常需要可复用的工具函数来简化重复逻辑。这些工具函数本身也应该是类型安全的。

### 4.1 类型安全的测试包装器

常见模式是创建测试包装器函数，如为 React 组件测试提供 Provider 包裹、为数据库测试提供事务回滚等。使用泛型参数约束被包装函数的参数和返回值，可以确保包装器不破坏原有类型信息。

### 4.2 通用断言工具

可以封装常用断言模式为类型安全工具函数。例如验证对象包含某些键的断言函数，通过泛型和 keyof 约束确保传入的键确实是对象的属性，避免拼写错误在运行时才被发现。

### 4.3 测试用例的参数化类型

参数化测试（test.each）在表格驱动测试中非常有用。使用泛型约束测试用例数据类型，或通过 as const 让 TypeScript 自动推断元组类型，使得回调函数参数类型能根据表格结构自动推导。

## 五、类型层面的断言（Expect-Style Types）

类型测试是 TypeScript 特有的测试维度——不仅要测试运行时行为，还要测试类型系统是否按预期工作。

### 5.1 expect-type 库与类型断言

expect-type 是流行的类型级断言库，提供类似 expect 的 API 但断言发生在类型层面。expectTypeOf<MyType>().toMatchTypeOf<OtherType>() 等断言在编译时执行，类型不匹配就产生编译错误。这对于测试工具类型、泛型约束、重载函数等类型层面代码至关重要。

### 5.2 条件类型测试与分配性

测试条件类型时需特别注意分布式条件类型的行为。当条件类型作用于联合类型时，它会分配到每个联合成员。使用 .toEqualTypeOf() 进行严格类型相等检查，而非仅检查兼容性。

### 5.3 @ts-expect-error 与错误断言

@ts-expect-error 指令标记下一行代码应该产生类型错误。如果该行没有错误，TypeScript 反而报错——正好用来测试某些代码应该不通过类型检查的场景。这在测试类型守卫、泛型约束、严格检查等场景非常有用。

## 六、快照测试的类型安全

快照测试是 Jest/Vitest 的特色功能，但快照本身是无类型的 JSON 结构。

### 6.1 快照的类型守卫

可以为快照文件创建类型守卫或断言函数，在快照使用前验证其结构。当组件 Props 结构变更时，类型守卫能在测试运行前甚至编译时发现结构不匹配问题。

### 6.2 内联快照的类型推断

内联快照将快照内容直接写入测试文件。可封装类型化快照工具，在写入快照前对要快照的值进行类型约束。

### 6.3 序列化器的类型安全

自定义快照序列化器应该为对应类型提供正确序列化逻辑，TypeScript 帮助确保序列化器输入类型与目标类型匹配。

## 七、基于属性的测试类型

基于属性的测试（Property-Based Testing）以 fast-check 为代表，通过自动生成大量随机输入验证代码不变量。

### 7.1 Arbitrary 的类型参数

在 fast-check 中 Arbitrary<T> 是泛型类型，类型参数 T 确保生成值类型与被测函数参数类型匹配。fc.string() 返回 Arbitrary<string>，组合子如 fc.array()、fc.record() 正确传递泛型参数。

### 7.2 模型的类型安全

有状态属性测试中，抽象模型的状态和操作都应有明确类型，确保模型转换与实际系统行为在类型层面一致。

### 7.3 属性断言的类型

属性函数（predicate）接收生成的值并断言，泛型约束确保参数类型与 Arbitrary 生成类型一致。

## 八、测试泛型函数

泛型函数测试比普通函数更复杂，因为泛型在不同类型参数下可能表现不同。

### 8.1 使用具体类型实例化测试泛型

最简单方式是用具体类型实例化泛型函数然后测试。应选择有代表性的类型实例：原始类型、对象类型、联合类型、可选类型、嵌套泛型类型等。

### 8.2 泛型约束的测试

如果泛型有约束，需要测试符合约束的类型正常工作、不符合约束的类型被类型系统拒绝（使用 @ts-expect-error）、使用约束上的属性是安全的。

### 8.3 类型推断的测试

许多泛型函数依赖类型推断，如接收回调函数并从回调参数推断其他参数类型。使用 expect-type 断言特定调用方式下泛型参数被推断为预期类型。

## 九、集成测试中的类型安全

在集成测试中，API 请求/响应类型、数据库查询结果类型、事件消息类型等需要端到端类型保障。使用 tRPC、OpenAPI codegen 或 GraphQL codegen 生成类型化 API 客户端；使用 ORM 时保留查询结果精确类型；E2E 测试中页面对象模型结合类型系统为页面元素提供类型安全封装。

## 十、测试覆盖率与类型覆盖率

类型覆盖率衡量项目类型完善程度。type-coverage 工具统计 any 类型使用比例，在 CI 中设置阈值防止新代码引入不安全的 any。启用 strict 模式是类型安全测试的前提。测试代码也应纳入与生产代码相同的严格类型检查标准，类型错误的测试可能给出错误的安全感。

## 小结

类型安全的测试通过类型化夹具、类型安全 Mock、泛型测试工具、类型级断言等手段，将测试安全性从运行时延伸到编译时。类型系统本身就是一种测试——对程序行为的形式化验证，运行时测试是对具体场景的经验验证，两者结合才能最大程度保障代码质量。`,
    code: `// 类型安全测试演示
interface User { id: number; name: string; email: string; role: 'admin'|'user'|'guest'; createdAt: Date; }

function createUserFixture(overrides?: Partial<User>): User {
  return { id: 1, name: 'Test', email: 'test@example.com', role: 'user', createdAt: new Date('2024-01-01'), ...overrides };
}

type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] };

function deepMerge<T>(target: T, source: DeepPartial<T>): T {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key], source[key] as any);
    } else if (source[key] !== undefined) result[key] = source[key] as any;
  }
  return result;
}

type MockedFunction<T extends (...args: any[]) => any> = T & {
  _isMockFunction: true;
  mock: { calls: Parameters<T>[]; results: any[] };
  mockReturnValue: (v: ReturnType<T>) => MockedFunction<T>;
  mockResolvedValue: (v: Awaited<ReturnType<T>>) => MockedFunction<T>;
};

function createTypedMock<T extends (...args: any[]) => any>(impl?: T): MockedFunction<T> {
  let fn: T = impl || ((() => {}) as T);
  const calls: any[] = [], results: any[] = [];
  const mockFn = ((...args: any[]) => { calls.push(args); const r = fn(...args); results.push(r); return r; }) as MockedFunction<T>;
  mockFn._isMockFunction = true;
  mockFn.mock = { calls, results };
  mockFn.mockReturnValue = (v: any) => { fn = (() => v) as any; return mockFn; };
  mockFn.mockResolvedValue = (v: any) => { fn = (() => Promise.resolve(v)) as any; return mockFn; };
  return mockFn;
}

function createTypeGuard<T>(validator: (v: unknown) => v is T) {
  return (v: unknown): T => { if (!validator(v)) throw new Error('类型守卫失败'); return v; };
}

const isUser = (v: unknown): v is User => typeof v === 'object' && v !== null && 'id' in v && typeof (v as any).id === 'number' && 'name' in v && typeof (v as any).name === 'string';

interface Arbitrary<T> { generate(rng: () => number): T; map<U>(fn: (v: T) => U): Arbitrary<U>; }
function createArbitrary<T>(gen: (rng: () => number) => T): Arbitrary<T> { return { generate: gen, map(fn) { return createArbitrary(r => fn(gen(r))); } }; }
const integer = (min=-100, max=100) => createArbitrary(r => Math.floor(r()*(max-min+1))+min);
const arrayArb = <T>(arb: Arbitrary<T>, min=0, max=5) => createArbitrary(r => { const l=Math.floor(r()*(max-min+1))+min; const a=[]; for(let i=0;i<l;i++) a.push(arb.generate(r)); return a; });

function forAll<T>(arb: Arbitrary<T>, prop: (v: T) => boolean, n=50) {
  let passed=0, failed=0;
  for (let i=0; i<n; i++) { const v=arb.generate(Math.random); try { if (prop(v)!==false) passed++; else failed++; } catch { failed++; } }
  return { passed, failed };
}

console.log('========== 🧪 类型安全测试演示 ==========');
console.log('1. 夹具演示:');
const admin = createUserFixture({id:2, name:'Admin', role:'admin'});
console.log('  默认用户:', createUserFixture().name, '| 管理员:', admin.name, '| 角色:', admin.role);
const cfg = deepMerge({server:{port:3000}}, {server:{port:8080}});
console.log('  深度合并端口:', cfg.server.port);

console.log('\\n2. Mock函数演示:');
const mockCalc = createTypedMock((a:number,b:number)=>a+b);
mockCalc.mockReturnValue(42);
console.log('  mockCalc(1,2)=', mockCalc(1,2), '| 调用次数:', mockCalc.mock.calls.length);

console.log('\\n3. 类型守卫验证:');
const guard = createTypeGuard(isUser);
try { guard({id:1, name:'Alice'}); console.log('  ✓ 有效用户通过'); } catch(e:any) { console.log('  ✗', e.message); }
try { guard({id:'bad'}); console.log('  ✗ 应拒绝'); } catch(e:any) { console.log('  ✓ 无效用户被拒绝'); }

console.log('\\n4. 属性测试:');
const addResult = forAll(createArbitrary((r)=>({a:integer(-50,50).generate(r),b:integer(-50,50).generate(r),c:integer(-50,50).generate(r)})), ({a,b,c})=>(a+b)+c===a+(b+c));
console.log('  加法结合律:', addResult.passed, '通过,', addResult.failed, '失败');
const revResult = forAll(arrayArb(integer(0,100)), arr => { const d=[...arr].reverse(); const dd=[...d].reverse(); return dd.length===arr.length && dd.every((v,i)=>v===arr[i]); }, 30);
console.log('  数组反转幂等:', revResult.passed, '通过,', revResult.failed, '失败');

function identity<T>(v: T): T { return v; }
console.log('\\n5. 泛型函数测试:');
console.log('  identity<string>("hello") =', identity('hello'));
console.log('  identity<number>(42) =', identity(42));

// 参数化测试
const cases: [string, number, number, number][] = [['1+1=2',1,1,2],['2+3=5',2,3,5],['0+0=0',0,0,0]];
console.log('\\n6. 参数化测试:');
for (const [name,a,b,expected] of cases) {
  const result = a+b;
  console.log(' ', result===expected?'✓':'✗', name, result===expected?'':'(结果:'+result+')');
}

console.log('\\n========== 演示完成 ==========');
`
  },
  {
    id: "ts3-tsc-api",
    title: "TypeScript 编译器 API",
    icon: "⚙️",
    group: "工具链与工程化",
    content: `# TypeScript 编译器 API

TypeScript 不仅是一门语言，更是一个强大的编译器平台。其公开的 Compiler API 允许开发者以编程方式操作 TypeScript 代码——从解析源码生成 AST，到类型检查、诊断信息收集，再到代码转换和生成。掌握 TypeScript Compiler API 是构建高级工具、代码生成器、自定义 lint 规则、迁移脚本等工程化设施的关键能力。

## 一、编译器 API 概览

TypeScript 编译器（tsc）本身用 TypeScript 编写，核心逻辑封装在 typescript npm 包中。编译过程分为六个阶段：程序创建（ts.createProgram()）、解析（Parsing，源码转 AST）、绑定（Binder，构建符号表）、类型检查（TypeChecker）、转换（Transformation）和发射（Emit，输出 JS/.d.ts/source map）。

API 分为几层：扫描层（ts.createScanner 字符流转 Token）、解析层（ts.createSourceFile 生成 AST）、绑定层（内部通过 TypeChecker 访问）、类型检查层（program.getTypeChecker()）、转换层（ts.transform）、发射层（program.emit）。

## 二、SourceFile 与 AST 遍历

ts.createSourceFile() 是解析单文件源码的入口，返回 SourceFile 对象（kind 为 SourceFile），包含 statements（顶级语句数组）、fileName、text 等属性。每个 AST 节点都有 kind 属性（ts.SyntaxKind 枚举），包含数百种节点类型（Identifier、VariableStatement、CallExpression 等）。所有节点共享 pos/end（字符偏移）、parent（父节点引用）、flags（修饰符标志）等通用属性。

遍历 AST 推荐使用 ts.forEachChild(node, callback)，它以深度优先访问直接子节点；递归遍历需在回调中再次调用 forEachChild。对于已知节点类型，直接访问 .name、.parameters、.body 等属性更高效精确。ts.visitEachChild() 支持 Visitor 模式，可在访问子节点时进行节点替换，是转换器的基础。

## 三、类型检查器 API

TypeChecker 必须通过 program.getTypeChecker() 获取，因为类型检查需要完整编译上下文。checker.getTypeAtLocation(node) 返回节点的 Type 对象，适用于表达式、变量声明、调用表达式等。Type 对象提供 typeToString()（类型可读字符串）、flags（TypeFlags 枚举）、getProperties()（属性列表）、getCallSignatures()（调用签名）等方法。

Symbol 代表具名实体（变量、函数、类、接口等），通过 checker.getSymbolAtLocation(node) 或 type.symbol 获取。Symbol 包含 name、flags（SymbolFlags）、declarations（声明节点列表）等属性。函数类型的调用签名（Signature）通过 getSignaturesOfType 获取，包含参数列表、返回类型和泛型参数。

## 四、诊断信息

program 提供多种诊断获取方法：getSyntacticDiagnostics（语法错误）、getSemanticDiagnostics（语义错误如类型不匹配）、getGlobalDiagnostics（配置问题）。Diagnostic 对象包含 code（TS错误码）、category（Error/Warning）、messageText、file、start/length（出错位置）。ts.formatDiagnosticsWithColorAndContext() 可格式化为类似 tsc 命令行的可读错误输出。

## 五、转换 API

转换器是接收 TransformationContext 返回 Visitor 函数的工厂。Visitor 函数接收节点返回节点（原节点、新节点或 undefined 删除）。典型模式是先用 ts.visitEachChild 递归处理子节点（自底向上），再处理当前节点。ts.factory 提供 createVariableStatement、createIdentifier、createCallExpression、createArrowFunction 等大量节点工厂函数。ts.isIdentifier、ts.isFunctionDeclaration、ts.isCallExpression 等类型守卫函数在运行时检查节点类型并在 TypeScript 中收窄类型。

常见转换场景包括编译时代码注入（日志、埋点）、语法降级、自定义装饰器、代码插桩、AOP面向切面编程、移除调试代码等。

## 六、Compiler Host 与代码发射

CompilerHost 是 Program 与文件系统间的抽象层。ts.createCompilerHost(options) 创建默认宿主（使用 Node.js fs 模块）。自定义 CompilerHost 适用于虚拟文件系统（在线编辑器/Playground）、文件过滤预处理、内存发射等场景，需实现 getSourceFile、writeFile、getCurrentDirectory、fileExists、readFile 等方法。

program.emit() 触发代码发射，可传入自定义 writeFile 回调在内存中收集结果。如果只需将 AST 打印为字符串，使用 ts.createPrinter()，其 printNode() 和 printFile() 方法可将任意节点格式化为代码。

## 七、代码生成模式

代码生成有两种路径：AST 构建法（用 ts.factory 构建完整AST后Printer打印，语法一定正确但较繁琐）和字符串模板法（模板字符串写代码后用 createSourceFile 验证，简单直观但需验证）。无论哪种方式都应解析验证生成代码的语法正确性。常见陷阱包括字符串转义、import路径相对位置、格式化不一致（可用Prettier二次格式化）、JSDoc注释需特殊API添加、变量名作用域冲突。

## 八、实战场景

Compiler API 典型应用包括自定义 Lint 规则（需类型信息的规则）、大规模迁移脚本（废弃API替换、CJS转ESM、自动加类型注解）、文档生成（TypeDoc提取JSDoc和类型签名）、类型提取（生成运行时验证器、JSON Schema）、在线编辑器（浏览器内编译和类型检查）。理解 Compiler API 的核心概念后，从简单 AST 分析工具入手逐步深入，你将掌握解锁 TypeScript 编译器全部能力的钥匙。`,
    code: `// 简化编译器API概念演示
enum SyntaxKind { SourceFile, VariableStatement, Identifier, StringLiteral, NumericLiteral, FunctionDeclaration, CallExpression, PropertyAccessExpression, ObjectLiteralExpression, BinaryExpression, ReturnStatement, Block, VariableDeclaration, Parameter, PropertyAssignment }
enum NodeFlags { None=0, Const=1, Let=2 }
enum TypeFlags { Any=0, String=1, Number=2, Boolean=4, Object=8, Function=16, Void=32 }

interface Node { kind: SyntaxKind; pos: number; end: number; flags: NodeFlags; parent?: Node; }
interface Identifier extends Node { kind: SyntaxKind.Identifier; text: string; }
interface StringLiteral extends Node { kind: SyntaxKind.StringLiteral; text: string; }
interface NumericLiteral extends Node { kind: SyntaxKind.NumericLiteral; text: string; }
interface VariableDeclaration extends Node { kind: SyntaxKind.VariableDeclaration; name: Identifier; initializer?: Expression; }
interface VariableStatement extends Node { kind: SyntaxKind.VariableStatement; declarationList: VariableDeclaration[]; }
interface Parameter extends Node { kind: SyntaxKind.Parameter; name: Identifier; }
interface Block extends Node { kind: SyntaxKind.Block; statements: Statement[]; }
interface ReturnStatement extends Node { kind: SyntaxKind.ReturnStatement; expression?: Expression; }
interface FunctionDeclaration extends Node { kind: SyntaxKind.FunctionDeclaration; name?: Identifier; parameters: Parameter[]; body?: Block; }
interface CallExpression extends Node { kind: SyntaxKind.CallExpression; expression: Expression; arguments: Expression[]; }
interface PropertyAccessExpression extends Node { kind: SyntaxKind.PropertyAccessExpression; expression: Expression; name: Identifier; }
interface PropertyAssignment extends Node { kind: SyntaxKind.PropertyAssignment; name: Identifier; initializer: Expression; }
interface ObjectLiteralExpression extends Node { kind: SyntaxKind.ObjectLiteralExpression; properties: PropertyAssignment[]; }
interface BinaryExpression extends Node { kind: SyntaxKind.BinaryExpression; left: Expression; operatorToken: string; right: Expression; }
interface SourceFile extends Node { kind: SyntaxKind.SourceFile; statements: Statement[]; fileName: string; text: string; }
type Expression = Identifier|StringLiteral|NumericLiteral|CallExpression|PropertyAccessExpression|ObjectLiteralExpression|BinaryExpression;
type Statement = VariableStatement|FunctionDeclaration|ReturnStatement|Block|Expression;

class MiniParser {
  private pos=0; private text: string;
  constructor(text: string, private fileName: string) { this.text=text; }
  private skipWs() { while(this.pos<this.text.length&&/\\s/.test(this.text[this.pos])) this.pos++; }
  private peekKw(kw: string) { return this.text.startsWith(kw,this.pos)&&(this.pos+kw.length>=this.text.length||!/[a-zA-Z0-9_$]/.test(this.text[this.pos+kw.length])); }
  private eatKw(kw: string) { this.pos+=kw.length; this.skipWs(); }
  private expectCh(ch: string) { if(this.text[this.pos]!==ch) throw new Error('Expected '+ch); this.pos++; this.skipWs(); }
  parse(): SourceFile {
    const stmts: Statement[]=[]; this.skipWs();
    while(this.pos<this.text.length) { const s=this.parseStmt(); if(s) stmts.push(s); this.skipWs(); }
    return { kind:SyntaxKind.SourceFile, pos:0, end:this.text.length, statements:stmts, fileName:this.fileName, text:this.text, flags:NodeFlags.None };
  }
  private parseStmt(): Statement|undefined {
    this.skipWs(); if(this.pos>=this.text.length) return;
    if(this.text[this.pos]===';'){this.pos++;return this.parseStmt();}
    if(this.peekKw('function')){const fn=this.parseFn();if(this.text[this.pos]===';')this.pos++;this.skipWs();return fn;}
    if(this.peekKw('const')||this.peekKw('let')||this.peekKw('var')) return this.parseVar();
    if(this.peekKw('return')) return this.parseRet();
    if(this.text[this.pos]==='{') return this.parseBlock();
    const s=this.pos; const e=this.parseExpr();
    if(this.pos===s) throw new Error('Unexpected char: '+this.text[this.pos]);
    if(this.text[this.pos]===';') this.pos++;
    this.skipWs();
    return e;
  }
  private parseIdent(): Identifier { const s=this.pos; while(this.pos<this.text.length&&/[a-zA-Z0-9_$]/.test(this.text[this.pos])) this.pos++; const t=this.text.slice(s,this.pos); this.skipWs(); return { kind:SyntaxKind.Identifier, text:t, pos:s, end:this.pos, flags:NodeFlags.None }; }
  private parseVar(): VariableStatement {
    const s=this.pos; let fl=NodeFlags.None;
    if(this.peekKw('const')){this.eatKw('const');fl|=NodeFlags.Const;}else if(this.peekKw('let')){this.eatKw('let');fl|=NodeFlags.Let;}else this.eatKw('var');
    const nm=this.parseIdent(); let init: Expression|undefined;
    if(this.text[this.pos]==='='){this.pos++;this.skipWs();init=this.parseExpr();}
    if(this.text[this.pos]===';') this.pos++; this.skipWs();
    return { kind:SyntaxKind.VariableStatement, pos:s, end:this.pos, flags:fl, declarationList:[{kind:SyntaxKind.VariableDeclaration,name:nm,initializer:init,pos:s,end:this.pos,flags:NodeFlags.None}] };
  }
  private parseFn(): FunctionDeclaration {
    const s=this.pos; this.eatKw('function'); const nm=this.parseIdent(); this.expectCh('(');
    const params: Parameter[]=[]; this.skipWs();
    if(this.text[this.pos]!==')'){while(true){this.skipWs();const pn=this.parseIdent();params.push({kind:SyntaxKind.Parameter,name:pn,pos:pn.pos,end:pn.end,flags:NodeFlags.None});this.skipWs();if(this.text[this.pos]===',')this.pos++;else break;}}
    this.expectCh(')'); this.skipWs(); const body=this.parseBlock();
    return { kind:SyntaxKind.FunctionDeclaration, pos:s, end:this.pos, flags:NodeFlags.None, name:nm, parameters:params, body };
  }
  private parseBlock(): Block {
    const s=this.pos; this.expectCh('{'); const stmts: Statement[]=[]; this.skipWs();
    while(this.pos<this.text.length&&this.text[this.pos]!=='}'){const st=this.parseStmt();if(st)stmts.push(st);this.skipWs();}
    this.expectCh('}'); return { kind:SyntaxKind.Block, pos:s, end:this.pos, flags:NodeFlags.None, statements:stmts };
  }
  private parseRet(): ReturnStatement { const s=this.pos; this.eatKw('return'); let e:Expression|undefined; if(this.text[this.pos]!==';'&&this.text[this.pos]!=='}')e=this.parseExpr(); if(this.text[this.pos]===';')this.pos++; return { kind:SyntaxKind.ReturnStatement, pos:s, end:this.pos, flags:NodeFlags.None, expression:e }; }
  private parseExpr(): Expression { return this.parseBinary(); }
  private parseBinary(): Expression {
    let l=this.parsePrimary(); this.skipWs();
    const ops=['+','-','*','/'];
    while(this.pos<this.text.length){let op:string|undefined;for(const o of ops)if(this.text.startsWith(o,this.pos)){op=o;break;}if(!op)break;this.pos+=op.length;this.skipWs();const r=this.parsePrimary();l={kind:SyntaxKind.BinaryExpression,pos:l.pos,end:r.end,flags:NodeFlags.None,left:l,operatorToken:op,right:r};this.skipWs();}
    return l;
  }
  private parsePrimary(): Expression {
    this.skipWs(); const ch=this.text[this.pos];
    if(ch==="'"||ch==='"'){const s=this.pos;const q=ch;this.pos++;let t='';while(this.pos<this.text.length&&this.text[this.pos]!==q){t+=this.text[this.pos];this.pos++;}this.pos++;this.skipWs();return{kind:SyntaxKind.StringLiteral,text:t,pos:s,end:this.pos,flags:NodeFlags.None};}
    if(/[0-9]/.test(ch)){const s=this.pos;while(this.pos<this.text.length&&/[0-9.]/.test(this.text[this.pos]))this.pos++;const t=this.text.slice(s,this.pos);this.skipWs();return{kind:SyntaxKind.NumericLiteral,text:t,pos:s,end:this.pos,flags:NodeFlags.None};}
    if(ch==='{'){const s=this.pos;this.expectCh('{');const props:PropertyAssignment[]=[];this.skipWs();while(this.pos<this.text.length&&this.text[this.pos]!=='}'){const pn=this.parseIdent();this.skipWs();this.expectCh(':');const pi=this.parseExpr();props.push({kind:SyntaxKind.PropertyAssignment,name:pn,initializer:pi,pos:pn.pos,end:pi.end,flags:NodeFlags.None});this.skipWs();if(this.text[this.pos]===',')this.pos++;this.skipWs();}this.expectCh('}');return{kind:SyntaxKind.ObjectLiteralExpression,properties:props,pos:s,end:this.pos,flags:NodeFlags.None};}
    const id=this.parseIdent(); this.skipWs(); let e:Expression=id;
    while(this.pos<this.text.length){if(this.text[this.pos]==='('){e=this.parseCall(e);}else if(this.text[this.pos]==='.'){this.pos++;this.skipWs();const mn=this.parseIdent();e={kind:SyntaxKind.PropertyAccessExpression,expression:e,name:mn,pos:e.pos,end:mn.end,flags:NodeFlags.None};}else break; this.skipWs();}
    return e;
  }
  private parseCall(expr: Expression): CallExpression { const s=expr.pos; this.expectCh('('); const args:Expression[]=[]; this.skipWs(); if(this.text[this.pos]!==')'){while(true){args.push(this.parseExpr());this.skipWs();if(this.text[this.pos]===','){this.pos++;this.skipWs();}else break;}} this.expectCh(')'); return { kind:SyntaxKind.CallExpression, expression:expr, arguments:args, pos:s, end:this.pos, flags:NodeFlags.None }; }
}

function walk(node: Node, fn: (n:Node,d:number)=>void, d=0) { fn(node,d); const kids:Node[]=[]; switch(node.kind){case SyntaxKind.SourceFile:(node as SourceFile).statements.forEach(k=>kids.push(k));break;case SyntaxKind.VariableStatement:(node as VariableStatement).declarationList.forEach(k=>kids.push(k));break;case SyntaxKind.VariableDeclaration:{const vd=node as VariableDeclaration;kids.push(vd.name);if(vd.initializer)kids.push(vd.initializer);break;}case SyntaxKind.Parameter:kids.push((node as Parameter).name);break;case SyntaxKind.PropertyAssignment:{const pa=node as PropertyAssignment;kids.push(pa.name);kids.push(pa.initializer);break;}case SyntaxKind.FunctionDeclaration:{const fd=node as FunctionDeclaration;if(fd.name)kids.push(fd.name);fd.parameters.forEach(k=>kids.push(k));if(fd.body)kids.push(fd.body);break;}case SyntaxKind.Block:(node as Block).statements.forEach(k=>kids.push(k));break;case SyntaxKind.CallExpression:{const ce=node as CallExpression;kids.push(ce.expression);ce.arguments.forEach(k=>kids.push(k));break;}case SyntaxKind.BinaryExpression:{const be=node as BinaryExpression;kids.push(be.left);kids.push(be.right);break;}case SyntaxKind.PropertyAccessExpression:kids.push((node as PropertyAccessExpression).expression);kids.push((node as PropertyAccessExpression).name);break;case SyntaxKind.ReturnStatement:if((node as ReturnStatement).expression)kids.push((node as ReturnStatement).expression!);break;case SyntaxKind.ObjectLiteralExpression:(node as ObjectLiteralExpression).properties.forEach(k=>kids.push(k));break;} for(const k of kids) walk(k,fn,d+1); }
function skName(k: SyntaxKind):string { return SyntaxKind[k]; }

interface TypeInfo { flags: TypeFlags; name?: string; props?: Map<string,TypeInfo>; retType?: TypeInfo; }
class SimpleChecker {
  private syms = new Map<string,{type:TypeInfo;decl:Node}>();
  constructor(private sf: SourceFile) { this.collectNode(sf); }
  private collectNode(n: Node) {
    if(n.kind===SyntaxKind.VariableStatement){for(const d of(n as VariableStatement).declarationList){this.syms.set(d.name.text,{type:this.infer(d.initializer),decl:d});}}
    if(n.kind===SyntaxKind.FunctionDeclaration){const fd=n as FunctionDeclaration;if(fd.name){this.syms.set(fd.name.text,{type:{flags:TypeFlags.Function,retType:this.inferRet(fd)},decl:fd});}}
    const kids:Node[]=[];
    switch(n.kind){case SyntaxKind.SourceFile:(n as SourceFile).statements.forEach(k=>kids.push(k));break;case SyntaxKind.VariableStatement:(n as VariableStatement).declarationList.forEach(k=>kids.push(k));break;case SyntaxKind.VariableDeclaration:{const vd=n as VariableDeclaration;kids.push(vd.name);if(vd.initializer)kids.push(vd.initializer);break;}case SyntaxKind.Parameter:kids.push((n as Parameter).name);break;case SyntaxKind.PropertyAssignment:{const pa=n as PropertyAssignment;kids.push(pa.name);kids.push(pa.initializer);break;}case SyntaxKind.FunctionDeclaration:{const fd=n as FunctionDeclaration;if(fd.name)kids.push(fd.name);fd.parameters.forEach(k=>kids.push(k));if(fd.body)kids.push(fd.body);break;}case SyntaxKind.Block:(n as Block).statements.forEach(k=>kids.push(k));break;case SyntaxKind.CallExpression:{const ce=n as CallExpression;kids.push(ce.expression);ce.arguments.forEach(k=>kids.push(k));break;}case SyntaxKind.BinaryExpression:{const be=n as BinaryExpression;kids.push(be.left);kids.push(be.right);break;}case SyntaxKind.PropertyAccessExpression:kids.push((n as PropertyAccessExpression).expression);kids.push((n as PropertyAccessExpression).name);break;case SyntaxKind.ReturnStatement:if((n as ReturnStatement).expression)kids.push((n as ReturnStatement).expression!);break;case SyntaxKind.ObjectLiteralExpression:(n as ObjectLiteralExpression).properties.forEach(k=>kids.push(k));break;}
    for(const k of kids) this.collectNode(k);
  }
  private inferRet(fd: FunctionDeclaration): TypeInfo { if(fd.body)for(const s of fd.body.statements)if(s.kind===SyntaxKind.ReturnStatement)return this.infer((s as ReturnStatement).expression); return{flags:TypeFlags.Void}; }
  private infer(e?: Expression): TypeInfo {
    if(!e)return{flags:TypeFlags.Any};
    switch(e.kind){case SyntaxKind.StringLiteral:return{flags:TypeFlags.String,name:'string'};case SyntaxKind.NumericLiteral:return{flags:TypeFlags.Number,name:'number'};case SyntaxKind.ObjectLiteralExpression:{const ps=new Map<string,TypeInfo>();for(const p of(e as ObjectLiteralExpression).properties)ps.set(p.name.text,this.infer(p.initializer));return{flags:TypeFlags.Object,props:ps,name:'object'};}case SyntaxKind.CallExpression:{const ce=e as CallExpression;const callee=this.infer(ce.expression);return callee.retType||{flags:TypeFlags.Any};}case SyntaxKind.Identifier:{const s=this.syms.get((e as Identifier).text);if(s)return s.type;if((e as Identifier).text==='console')return{flags:TypeFlags.Object,props:new Map([['log',{flags:TypeFlags.Function,retType:{flags:TypeFlags.Void}}]]),name:'Console'};return{flags:TypeFlags.Any};}case SyntaxKind.PropertyAccessExpression:{const pa=e as PropertyAccessExpression;const ot=this.infer(pa.expression);return ot.props?.get(pa.name.text)||{flags:TypeFlags.Any};}default:return{flags:TypeFlags.Any};}
  }
  typeStr(t: TypeInfo): string { if(t.name)return t.name; if(t.flags&TypeFlags.String)return'string';if(t.flags&TypeFlags.Number)return'number';if(t.flags&TypeFlags.Function)return'()=>'+this.typeStr(t.retType||{flags:TypeFlags.Void});if(t.flags&TypeFlags.Void)return'void';if(t.flags&TypeFlags.Object&&t.props)return'{'+[...t.props.entries()].map(([k,v])=>k+':'+this.typeStr(v)).join(',')+'}';return'any'; }
  getType(node: Node): TypeInfo { return this.infer(node as Expression); }
  getSymbol(name: string): TypeInfo | undefined { return this.syms.get(name)?.type; }
}

class MiniPrinter {
  private ind=0; private is(){return'  '.repeat(this.ind);}
  print(sf: SourceFile):string { this.ind=0; return sf.statements.map(s=>this.stmt(s)).join('\\n\\n')+'\\n'; }
  private stmt(s: Statement):string{switch(s.kind){case SyntaxKind.VariableStatement:{const vs=s as VariableStatement;const kw=vs.flags&NodeFlags.Const?'const':vs.flags&NodeFlags.Let?'let':'var';const ds=vs.declarationList.map(d=>d.name.text+(d.initializer?' = '+this.expr(d.initializer):'')).join(', ');return this.is()+kw+' '+ds+';';}case SyntaxKind.FunctionDeclaration:{const fd=s as FunctionDeclaration;const ps=fd.parameters.map(p=>p.name.text).join(', ');return this.is()+'function '+(fd.name?.text||'')+'('+ps+') '+this.block(fd.body!);}case SyntaxKind.ReturnStatement:return this.is()+'return'+((s as ReturnStatement).expression?' '+this.expr((s as ReturnStatement).expression):'')+';';case SyntaxKind.Block:return this.block(s as Block);default:return this.is()+this.expr(s as Expression)+';';}}
  private block(b: Block):string{const lines:string[]=['{'];this.ind++;for(const s of b.statements)lines.push(this.stmt(s));this.ind--;lines.push(this.is()+'}');return lines.join('\\n');}
  private expr(e: Expression):string{switch(e.kind){case SyntaxKind.Identifier:return(e as Identifier).text;case SyntaxKind.StringLiteral:return'"'+(e as StringLiteral).text+'"';case SyntaxKind.NumericLiteral:return(e as NumericLiteral).text;case SyntaxKind.CallExpression:{const ce=e as CallExpression;return this.expr(ce.expression)+'('+ce.arguments.map(a=>this.expr(a)).join(', ')+')';}case SyntaxKind.PropertyAccessExpression:return this.expr((e as PropertyAccessExpression).expression)+'.'+(e as PropertyAccessExpression).name.text;case SyntaxKind.ObjectLiteralExpression:return'{ '+(e as ObjectLiteralExpression).properties.map(p=>p.name.text+': '+this.expr(p.initializer)).join(', ')+' }';case SyntaxKind.BinaryExpression:{const be=e as BinaryExpression;return this.expr(be.left)+' '+be.operatorToken+' '+this.expr(be.right);}default:return'?';}}
}

console.log('========== ⚙️  编译器API概念演示 ==========\\n');
const code='const greeting = "Hello"; const count = 42; function add(a,b){return a+b;} const user={name:"Alice",age:30}; console.log(greeting);';
console.log('1. 解析源代码...');
const parser=new MiniParser(code,'demo.ts'); const sf=parser.parse();
console.log('  ✓ 顶级语句数:',sf.statements.length);

console.log('\\n2. AST遍历:');
walk(sf,(n,d)=>{let det='';if(n.kind===SyntaxKind.Identifier)det='"'+(n as Identifier).text+'"';if(n.kind===SyntaxKind.StringLiteral)det='"'+(n as StringLiteral).text+'"';if(n.kind===SyntaxKind.NumericLiteral)det=(n as NumericLiteral).text;if(n.kind===SyntaxKind.FunctionDeclaration)det=(n as FunctionDeclaration).name?.text||'';if(n.kind===SyntaxKind.VariableStatement)det=(n as VariableStatement).flags&NodeFlags.Const?'const':'let';console.log('  ','  '.repeat(d)+'├─',skName(n.kind),det);});

console.log('\\n3. 类型检查:');
const checker=new SimpleChecker(sf);
console.log('  greeting:',checker.typeStr(checker.getSymbol('greeting')||{flags:0}));
console.log('  count:',checker.typeStr(checker.getSymbol('count')||{flags:0}));
console.log('  add:',checker.typeStr(checker.getSymbol('add')||{flags:0}));
console.log('  user:',checker.typeStr(checker.getSymbol('user')||{flags:0}));

console.log('\\n4. 代码打印:');
const printer=new MiniPrinter();
console.log(printer.print(sf).split('\\n').map(l=>'  '+l).join('\\n'));

console.log('\\n5. 内存文件系统(CompilerHost):');
const memFs=new Map<string,string>();
memFs.set('demo.js',printer.print(sf));
console.log('  发射文件: '+[...memFs.keys()].join(', '));
console.log('\\n========== 演示完成 ==========');
`
  },
  {
    id: "ts3-codegen",
    title: "代码生成与类型提取",
    icon: "🏭",
    group: "工具链与工程化",
    content: `# 代码生成与类型提取

代码生成与类型提取是连接类型世界与运行时世界的桥梁，通过从单一真相来源（Single Source of Truth）自动生成类型定义、验证器、客户端代码等，消除手动维护多份定义带来的不一致问题，实现真正的端到端类型安全（End-to-End Type Safety）。在大型工程中，代码生成是提升开发效率、减少人为错误、保证多端类型一致的关键工程实践。

## 一、核心价值与设计原则

代码生成的核心价值在于消除重复定义（DRY原则）和填补类型擦除带来的空白——TypeScript类型在编译后完全消失，代码生成可在编译阶段生成运行时所需的JSON Schema、验证函数、序列化器、API客户端等。良好的代码生成方案应遵循以下设计原则：单一真相来源（所有类型从一个地方派生）、可重复性（幂等生成，相同输入产生相同输出）、不手动修改生成文件（标记AUTO-GENERATED）、保留精确类型（不宽泛化为any）、集成到构建流程（自动触发而非手动执行）、生成速度快（影响开发体验）。

## 二、从 Schema 生成类型

JSON Schema到TypeScript的映射规则：string→string、number/integer→number、boolean→boolean、object+properties→interface、array+items→T[]、required数组控制必填属性、enum→字面量联合类型、oneOf/anyOf→联合类型、allOf→交叉类型、$ref→类型引用。Zod、Valibot、ArkType等运行时类型库采用Schema-first方式：先定义运行时Schema，通过z.infer<typeof schema>等工具类型提取TS类型，一次定义同时获得运行时验证和编译时类型。反向从TS类型到Schema（typescript-to-zod、ts-json-schema-generator）需使用Compiler API遍历类型。as const断言将字面量值推断为最精确的字面量类型，可从const对象配置（如路由表、权限枚举、Feature Flag）中提取路径、角色等联合类型，实现"配置即类型"。

## 三、OpenAPI 到 TypeScript

OpenAPI（Swagger）规范是REST API的行业标准，components/schemas部分映射为TS接口时有精确规则：required数组控制必选属性、nullable→与null联合、allOf→交叉类型或interface extends、oneOf→判别联合类型（discriminated union）、additionalProperties→索引签名、format:uuid→品牌类型（branded type）或string。paths中每个端点生成请求参数类型（path参数/query参数/header参数）、请求体类型、按HTTP状态码区分的响应类型（200/400/401/404各有不同类型）。基于这些类型可生成类型安全的fetch客户端：路径参数要求对应string、query参数可选/必选有别、请求体有精确类型、响应数据按状态码收窄。openapi-typescript、openapi-typescript-codegen、openapi-zod-client提供成熟方案，后者还能同时生成Zod验证器。

## 四、GraphQL 代码生成

GraphQL类型系统天然适合代码生成，因为Schema本身就是强类型的。映射规则：type→interface、enum→TypeScript枚举或字面量字符串联合、interface/union→判别联合、input type→Mutation/Query变量接口、custom scalar→对应TS类型（如DateTime→Date、JSON→unknown）。比完整Schema生成更实用的是基于实际GraphQL查询文档（.gql文件）生成类型——每个查询生成精确对应的TS类型，选择集（selection set）决定类型结构，响应类型只包含实际请求的字段，不会出现多余字段或缺失字段。GraphQL Code Generator（@graphql-codegen/cli）配合typescript-react-apollo等插件还能生成React Hooks（useQuery/useMutation），实现数据获取的完全类型安全。Fragment Masking（遮罩）模式让组件只知道自己声明的字段，强制数据依赖显式声明，避免隐式数据耦合。

## 五、数据库内省类型

数据库层的类型安全是后端类型安全的最后一公里。Prisma通过prisma generate从schema.prisma文件生成类型安全的数据库客户端，findUnique/findFirst/create/update/delete等方法都有精确类型，select/include参数决定返回值类型——只选择需要的字段，TypeScript类型也只包含这些字段，实现了查询与类型的联动。数据库内省（introspection）通过连接数据库读取information_schema获取真实的表名、列名、列数据类型、可空性、默认值、外键关系、索引等，自动映射为TS类型（varchar/text→string、int/bigint→number/bigint、timestamp/datetime→Date、boolean→boolean、jsonb→unknown）。Kysely、Drizzle ORM等利用高级类型（模板字面量类型、条件类型、映射类型）在类型层面精确表示数据库Schema，通过类型推断得到SQL查询结果类型，无需代码生成步骤。

## 六、运行时到类型的生成

从实际数据反推类型在迁移老项目时非常有用：quicktype等工具可从JSON示例数据生成初始TS类型，然后手动细化和优化。环境变量类型安全是常见需求：从.env.example模板或Zod schema定义解析，生成NodeJS.ProcessEnv类型声明并在应用启动时运行时验证，缺失或类型错误的环境变量会立即报错。路由表/权限配置表使用as const+typeof+keyof提取类型，添加新路由或新权限时类型自动更新，无需手动维护枚举类型。Builder模式通过泛型参数跟踪已设置字段（Phantom Types模式），确保build()方法只在所有必需字段设置完成后才可调用，避免运行时遗漏必填项。类型安全i18n从翻译JSON文件提取所有键名和插值参数类型，翻译函数t()只接受合法键名，插值参数有精确类型检查，typesafe-i18n、next-intl等库提供完整实现。

## 七、工具链集成与最佳实践

代码生成时机选择：开发时使用文件监听（--watch模式）自动重新生成，保证开发过程中类型始终最新；构建时在prebuild钩子运行codegen确保CI构建产物正确；CI中运行codegen后检查git工作区是否有变更，防止开发者忘记提交最新生成文件。package.json应定义codegen、codegen:watch、codegen:check等脚本统一入口。生成文件头部必须包含"AUTO-GENERATED, DO NOT EDIT"注释和生成来源（源文件hash或时间戳），防止手动修改。Monorepo中共享Schema定义放在shared/packages包，使用Turborepo/Nx的pipeline配置确保依赖包的类型先于消费包生成。生成文件通常加入.gitignore（如果每次构建都重新生成）或提交到仓库（如果构建时不运行codegen），根据团队约定选择。

## 小结

代码生成实现了"一次定义，多处使用"的工程理想。无论是OpenAPI/GraphQL类型安全客户端、ORM数据库类型、类型安全i18n还是运行时环境变量验证，本质都是用自动化确保类型定义与实际数据结构保持一致，从根本上杜绝手动同步类型带来的漂移问题。关键原则：确立单一真相来源、将生成步骤集成到构建和CI流程、追求生成代码的类型精确性（避免any）、标记生成文件禁止手动编辑、为生成代码配置IDE支持（如跳转到定义）。掌握代码生成模式，你将能够构建出端到端、全链路类型安全的现代TypeScript应用。`,
    code: `// 代码生成与类型提取模式演示

// --- 1. JSON Schema -> TypeScript 类型生成 ---
type JSType = 'string'|'number'|'integer'|'boolean'|'array'|'object';
interface JsonSchema {
  type?: JSType; properties?: Record<string,JsonSchema>; items?: JsonSchema;
  required?: string[]; enum?: (string|number)[]; oneOf?: JsonSchema[];
}

function schemaToTS(schema: JsonSchema, name?: string, depth=0): string {
  const ind = '  '.repeat(depth);
  if (schema.enum) return schema.enum.map(v=>typeof v==='string'?'"'+v+'"':String(v)).join(' | ');
  if (schema.oneOf) return schema.oneOf.map(s=>schemaToTS(s,undefined,depth)).join(' | ');
  switch(schema.type) {
    case 'string': return 'string';
    case 'number': case 'integer': return 'number';
    case 'boolean': return 'boolean';
    case 'array': return schema.items?schemaToTS(schema.items,undefined,depth)+'[]':'any[]';
    case 'object': {
      if (!schema.properties) return 'Record<string, any>';
      const req = new Set(schema.required||[]);
      const lines = Object.entries(schema.properties).map(([k,v])=>{
        const opt = req.has(k)?'':'?';
        return ind+'  '+k+opt+': '+schemaToTS(v,k,depth+1)+';';
      });
      return '{\\n'+lines.join('\\n')+'\\n'+ind+'}';
    }
    default: return 'any';
  }
}

const userSchema: JsonSchema = {
  type:'object',
  properties:{
    id:{type:'integer'}, name:{type:'string'}, email:{type:'string'},
    role:{type:'string',enum:['admin','user','guest']},
    tags:{type:'array',items:{type:'string'}},
    profile:{type:'object',properties:{avatar:{type:'string'},age:{type:'integer'}},required:['avatar']}
  },
  required:['id','name','email']
};

// --- 2. Zod风格运行时类型+类型提取 ---
class ZodType<T> {
  readonly _t!: T;
  parse(v: unknown): T { const r=this.safeParse(v); if(!r.ok) throw new Error(r.error); return r.data; }
  safeParse(v: unknown): {ok:true;data:T}|{ok:false;error:string} { return this.validate(v); }
  validate(_v: unknown): {ok:true;data:T}|{ok:false;error:string} { return {ok:true,data:_v as T}; }
  optional(): ZodOptional<T> { return new ZodOptional(this); }
}
class ZodOptional<T> extends ZodType<T|undefined> {
  constructor(private i: ZodType<T>){super();}
  validate(v:unknown){ return v===undefined?{ok:true,data:undefined}:this.i.validate(v) as any; }
}
class ZodString extends ZodType<string> {
  validate(v:unknown){ return typeof v==='string'?{ok:true,data:v}:{ok:false,error:'Expected string'}; }
}
class ZodNumber extends ZodType<number> {
  validate(v:unknown){ return typeof v==='number'?{ok:true,data:v}:{ok:false,error:'Expected number'}; }
}
class ZodBoolean extends ZodType<boolean> {
  validate(v:unknown){ return typeof v==='boolean'?{ok:true,data:v}:{ok:false,error:'Expected boolean'}; }
}
class ZodObject<T extends Record<string,ZodType<any>>> extends ZodType<{[K in keyof T]: T[K] extends ZodType<infer V>?V:never}> {
  constructor(public shape: T){super();}
  validate(v:unknown){
    if(typeof v!=='object'||v===null) return {ok:false,error:'Expected object'};
    const res:any={}; const errs:string[]=[];
    for(const [k,s] of Object.entries(this.shape)){
      const r=(s as ZodType<any>).validate((v as any)[k]);
      if(!r.ok) errs.push(k+': '+r.error); else res[k]=r.data;
    }
    return errs.length?{ok:false,error:errs.join('; ')}:{ok:true,data:res};
  }
}
class ZodArray<T> extends ZodType<T[]> {
  constructor(private item: ZodType<T>){super();}
  validate(v:unknown){
    if(!Array.isArray(v)) return {ok:false,error:'Expected array'};
    const res:T[]=[];
    for(let i=0;i<v.length;i++){const r=this.item.validate(v[i]); if(!r.ok) return {ok:false,error:'['+i+']: '+r.error}; res.push(r.data);}
    return {ok:true,data:res};
  }
}
class ZodEnum<T extends readonly [string,...string[]]> extends ZodType<T[number]> {
  constructor(public vals:T){super();}
  validate(v:unknown){ return typeof v==='string'&&this.vals.includes(v)?{ok:true,data:v as T[number]}:{ok:false,error:'Expected one of '+this.vals.join(',')}; }
}
const z = {
  string:()=>new ZodString(), number:()=>new ZodNumber(), boolean:()=>new ZodBoolean(),
  object:<T extends Record<string,ZodType<any>>>(s:T)=>new ZodObject(s),
  array:<T>(i:ZodType<T>)=>new ZodArray(i),
  enum:<T extends readonly [string,...string[]]>(v:T)=>new ZodEnum(v),
};
type InferZod<S> = S extends ZodType<infer T>?T:never;

const UserZod = z.object({
  id: z.number(), name: z.string(), email: z.string(),
  role: z.enum(['admin','user','guest'] as const), tags: z.array(z.string()),
});
type ZUser = InferZod<typeof UserZod>;

// --- 3. 从const对象提取类型（路由配置模式）---
const routes = [
  {path:'/users',method:'GET',roles:['admin','user'] as const},
  {path:'/users/:id',method:'GET',roles:['admin','user'] as const},
  {path:'/admin',method:'GET',roles:['admin'] as const},
  {path:'/login',method:'POST',roles:[] as const},
] as const;
type RoutePath = typeof routes[number]['path'];
type Role = typeof routes[number]['roles'][number];

type ExtractParams<P extends string> =
  P extends \`\${string}:\${infer Param}/\${infer Rest}\`
    ? {[K in Param|keyof ExtractParams<Rest>]:string}
    : P extends \`\${string}:\${infer Param}\`?{[K in Param]:string}:{};

// --- 4. i18n 类型安全演示 ---
const en = {
  greeting: 'Hello {{name}}!',
  pages: { home: 'Home', about: 'About', user: { profile: 'Profile of {{username}}' } },
  errors: { notFound: 'Not found', serverError: 'Server error {{code}}' }
} as const;

type ExtractInterp<S extends string> =
  S extends \`\${string}{{\${infer Key}}}\${infer Rest}\`
    ? {[K in Key|keyof ExtractInterp<Rest>]:string} : {};

type FlattenKeys<T, Prefix extends string=''> =
  T extends Record<string,unknown>
    ? {[K in keyof T]: K extends string
        ? T[K] extends string
          ? Prefix extends ''?K:\`\${Prefix}.\${K}\`
          : FlattenKeys<T[K], Prefix extends ''?K:\`\${Prefix}.\${K}\`>
        : never}[keyof T]
    : never;

type I18nKeys = FlattenKeys<typeof en>;

function t<K extends I18nKeys>(key: K, params?: ExtractInterp<K extends keyof typeof en?typeof en[K]&string:string>): string {
  const parts = key.split('.'); let val:any = en;
  for (const p of parts) val = val?.[p];
  if (typeof val !== 'string') return key;
  if (params) {
    return val.replace(/\{\{(\w+)\}\}/g, (_,k) => (params as any)[k] ?? '');
  }
  return val;
}

// --- 5. 代码生成器演示 ---
function generateAPIClient(spec: { name: string; endpoints: { method: string; path: string; req?: string; resp: string }[] }): string {
  const lines: string[] = ['// AUTO-GENERATED, DO NOT EDIT', ''];
  lines.push('export const '+spec.name+' = {');
  for (const ep of spec.endpoints) {
    const fnName = ep.method.toLowerCase()+ep.path.replace(/[:\\/]/g,'_').replace(/_([a-z])/g,(_,c)=>c.toUpperCase());
    const params = ep.path.includes(':') ? 'params: {'+ep.path.match(/:([^/]+)/g)?.map(p=>p.slice(1)+': string').join(', ')+'}, ' : '';
    const bodyParam = ep.req ? 'body: '+ep.req+', ' : '';
    lines.push('  '+fnName+': async ('+params+bodyParam+'): Promise<'+ep.resp+'> => {');
    const bodyInFetch = ep.req ? 'body: JSON.stringify(body), ' : '';
    lines.push('    const res = await fetch("'+ep.path.replace(/:(\w+)/g,'"+params.$1+"')+'", { method: "'+ep.method.toUpperCase()+'", '+bodyInFetch+'headers: {"Content-Type":"application/json"} });');
    lines.push('    return res.json();');
    lines.push('  },');
  }
  lines.push('};');
  return lines.join('\\n');
}

// --- 主程序 ---
console.log('========== 🏭 代码生成与类型提取演示 ==========\\n');

console.log('1. JSON Schema -> TypeScript 类型:');
console.log('  export interface User', schemaToTS(userSchema));

console.log('\\n2. Zod运行时验证:');
const validUser = {id:1,name:'Alice',email:'a@b.com',role:'admin',tags:['ts']};
const invalidUser = {id:'bad',name:123};
console.log('  有效数据验证:', UserZod.safeParse(validUser).ok?'✓ 通过':'✗ 失败');
const invResult = UserZod.safeParse(invalidUser);
console.log('  无效数据验证:', invResult.ok?'✓ 通过':'✗ 失败 ('+invResult.err+')');

console.log('\\n3. 从const提取类型:');
console.log('  路由路径类型: /users | /users/:id | /admin | /login');
console.log('  角色类型: admin | user');
console.log('  路由数量:', routes.length);

console.log('\\n4. 类型安全i18n:');
console.log('  t("greeting",{name:"World"}) =', t('greeting', {name:'World'} as any));
// t("nonexistent") 会报类型错误
// t("greeting") 缺少name参数会报类型错误

console.log('\\n5. API客户端代码生成:');
const clientCode = generateAPIClient({
  name: 'userApi',
  endpoints: [
    {method:'get',path:'/users',resp:'User[]'},
    {method:'get',path:'/users/:id',resp:'User'},
    {method:'post',path:'/users',req:'CreateUser',resp:'User'},
  ]
});
console.log(clientCode.split('\\n').map(l=>'  '+l).join('\\n'));

console.log('\\n========== 演示完成 ==========');
`
  },
  {
    id: "ts3-monorepo",
    title: "Monorepo 工程化",
    icon: "🏗️",
    group: "工具链与工程化",
    content: `# Monorepo 工程化

Monorepo（单一代码仓库）是将多个项目、包、应用放在同一个Git仓库中统一管理的工程化策略。与之对应的是Polyrepo（多仓库）策略，每个包独立一个仓库。Monorepo在Google、Meta、Microsoft、Uber等大型科技公司广泛使用，配合TypeScript的项目引用（Project References）、路径映射（Path Mapping）、组合项目（Composite Projects）等特性，可以在超大型代码库中实现类型安全的跨包引用、高效的增量构建和智能的构建编排。pnpm、Turborepo、Nx等现代工具链让中小型团队也能轻松实践Monorepo。

## 一、Project References 项目引用

Project References是TypeScript 3.0引入的核心Monorepo特性，允许一个tsconfig项目引用其他tsconfig项目，形成有向无环图（DAG）结构。在tsconfig.json中通过references数组声明依赖：\`"references": [{ "path": "../packages/shared" }, { "path": "../packages/types" }]\`。被引用的项目必须设置\`"composite": true\`，这会强制生成.d.ts声明文件和.tsbuildinfo增量构建信息文件。使用\`tsc --build\`（简写\`tsc -b\`）模式构建时，TypeScript会自动按拓扑依赖顺序构建项目，检测哪些项目的源文件有变更，只重建变更项目及其依赖它的下游项目，支持跨项目增量构建。\`tsc -b --clean\`可清理构建产物，\`tsc -b --force\`强制全量重建。

## 二、Path Mapping 路径映射

paths配置允许为模块导入路径创建别名，彻底避免深层嵌套的相对路径地狱（如\`../../../utils/format\`变成\`@utils/format\`）。配置方式：在compilerOptions中设置\`"baseUrl": "."\`，然后在paths中配置映射：\`"@app/*": ["src/*"]\`（单包项目）、\`"@shared/*": ["packages/shared/src/*"]\`（Monorepo跨包引用）。paths需要配合baseUrl使用，且仅影响TypeScript的类型解析——运行时不会自动将别名转换为真实路径，因此需要额外配置：Node.js可使用subpath imports（package.json的#imports字段）或tsconfig-paths/tsx的注册钩子；打包工具（Webpack/Vite/Rollup/esbuild）需配置resolve.alias；Jest/Vitest需配置moduleNameMapper。在Monorepo中，通常在根tsconfig.base.json中统一配置所有内部包的paths映射，子包继承即可。

## 三、Composite Projects 组合项目

\`"composite": true\`是Project References的前提条件，它强制以下约束：declaration必须为true（生成.d.ts类型声明供下游包使用）、outDir必须显式设置（不能默认为源文件同目录）、所有实现文件必须被include或files包含（不允许隐式包含）。组合项目使得TypeScript能够快速确定项目是否需要重新构建——通过比较源文件哈希、输出文件时间戳和.tsbuildinfo中的依赖图，无需重新检查整个依赖树。\`"incremental": true\`配合composite进一步优化，将上次编译的模块依赖图和符号信息保存到.tsbuildinfo文件，下次编译时只重新分析变更文件。\`"disableSourceOfProjectReferenceRedirect": true\`可在某些场景下提升性能，禁用源文件重定向直接使用.d.ts。

## 四、内部包类型与 Barrel Exports

Monorepo中的内部包（packages）需要正确配置package.json的类型入口。\`"types"\`或\`"typings"\`字段指定.d.ts声明文件入口（TypeScript优先读取），\`"main"\`指定CommonJS JS入口，\`"module"\`指定ESM JS入口，\`"exports"\`字段提供更精确的条件导出支持（支持\`"import"\`/\`"require"\`/\`"types"\`条件及子路径导出）。Barrel exports（index.ts作为门面重新导出所有内容）虽然导入方便（\`import { X } from '@shared'\`），但存在诸多问题：可能导致类型导入循环依赖、阻碍tree-shaking（所有导出被标记为used）、增加编辑器类型加载时间、加剧类型实例化过深错误。推荐使用barrel-less imports直接导入具体文件路径（\`import { X } from '@shared/user'\`），或使用@zamiell/ts-barrel-export等工具辅助。TypeScript 5.0的\`"verbatimModuleSyntax": true\`配合精确的导入路径可以获得更好的类型检查和构建性能，同时强制区分type-only导入。

## 五、tsconfig 继承与共享配置

tsconfig的extends字段支持继承其他配置文件，这是Monorepo中统一TypeScript编译标准的关键模式。推荐做法：根目录创建tsconfig.base.json，包含所有包共享的编译选项（strict: true、target、module、moduleResolution、esModuleInterop、skipLibCheck等）；根据运行环境创建多个基础配置变体，如tsconfig.node.json（extends base，module: NodeNext）、tsconfig.browser.json（extends base，JSX/DOM lib）；apps/*和packages/*的tsconfig.json通过extends引用对应基础配置，只覆盖包特定选项（outDir、include、references路径等）。根tsconfig.json使用references引用所有子包，运行\`tsc -b\`从根目录即可构建整个仓库。注意tsconfig的extends是深度合并，但references数组不会合并，子包需声明自己的依赖。

## 六、构建编排与工具链

仅靠tsc -b的编排能力不足以应对现代Monorepo的复杂构建需求（涉及Babel/SWC转译、CSS处理、代码生成等非TS步骤）。Turborepo、Nx、Rush、Lerna（v5+）、pnpm-workspace等工具提供更强大的任务编排：pipeline配置明确任务间依赖关系（"build"依赖"^build"表示先构建所有依赖包，"test"依赖"build"，"lint"和"test"可并行）；内容寻址缓存（本地缓存+远程缓存）跳过未变更的任务；分布式执行在CI中并行执行多包任务；管道过滤只构建受影响的包。pnpm作为包管理器内置workspace协议支持（\`"@app/shared": "workspace:*"\`），通过硬链接和符号链接实现高效的依赖管理，避免重复安装。tsc -b --watch可在开发时监听模式下增量构建所有引用项目，配合vite/turbopack等热更新工具实现流畅的开发体验。

## 七、常见 Monorepo 类型陷阱

Monorepo类型安全常见问题与对策：1) 包间循环依赖——TypeScript可能不立即报错但会导致构建顺序混乱和运行时错误，使用dpdm、madge或Nx图分析工具检测循环；2) 隐式any跨越包边界——一个包导出的any类型会污染下游所有消费方的类型推断，启用skiplibCheck:false（对内部包）或使用@typescript-eslint/no-explicit-any约束；3) 依赖版本不一致——同一依赖在不同包中安装了不同版本导致类型不兼容，使用pnpm.overrides/resolutions统一版本，peerDependencies声明兼容范围；4) 生成文件未同步——d.ts或codegen产出过期导致类型错误，CI中增加codegen:check确保生成文件最新；5) barrel文件类型爆炸——深层barrel导出链导致TypeScript加载大量无用类型，严重降低编辑器响应速度，使用knip检测未使用导出，迁移到barrel-less导入；6) 幽灵依赖——未在package.json中声明但可被导入的包，pnpm默认阻止但需注意配置。

## 小结

Monorepo类型安全的核心是正确配置Project References + composite + incremental实现高效的跨项目增量构建，通过tsconfig继承层次统一编译标准，使用paths改善内部包的导入体验，配合pnpm workspace协议和Turborepo/Nx编排工具管理构建顺序与缓存，持续警惕循环依赖、any类型泄漏、版本不一致等陷阱。一个配置良好的TypeScript Monorepo能在保持端到端类型安全的同时，获得比多仓库更好的代码共享能力、原子提交体验和跨包重构安全性。`,
    code: `// Monorepo 工程化类型模式演示

// --- 1. tsconfig 继承模式 (概念演示) ---
const baseConfig = {
  compilerOptions: {
    strict: true,
    target: 'ES2022',
    module: 'ESNext',
    moduleResolution: 'bundler',
    declaration: true,
    declarationMap: true,
    sourceMap: true,
    esModuleInterop: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
    isolatedModules: true,
    verbatimModuleSyntax: true,
  },
};

const nodeConfig = {
  extends: './tsconfig.base.json',
  compilerOptions: { module: 'NodeNext', moduleResolution: 'NodeNext' },
};

// --- 2. Path Mapping 类型模拟 ---
type PathMap = {
  '@shared/*': ['../packages/shared/src/*'],
  '@utils/*': ['../packages/utils/src/*'],
  '@types/*': ['../packages/types/src/*'],
};

type ResolvePath<P extends string> =
  P extends \`@shared/\${infer Rest}\` ? \`../packages/shared/src/\${Rest}\` :
  P extends \`@utils/\${infer Rest}\` ? \`../packages/utils/src/\${Rest}\` :
  P extends \`@types/\${infer Rest}\` ? \`../packages/types/src/\${Rest}\` : P;

// --- 3. 包依赖图与拓扑排序 ---
interface Package { name: string; deps: string[]; path: string; }

const packages: Record<string, Package> = {
  'types':    { name: 'types',    deps: [],                  path: 'packages/types' },
  'utils':    { name: 'utils',    deps: ['types'],           path: 'packages/utils' },
  'shared':   { name: 'shared',   deps: ['types', 'utils'],  path: 'packages/shared' },
  'api':      { name: 'api',      deps: ['shared', 'types'], path: 'apps/api' },
  'web':      { name: 'web',      deps: ['shared', 'types'], path: 'apps/web' },
  'docs':     { name: 'docs',     deps: ['shared'],          path: 'apps/docs' },
};

function topoSort(pkgs: Record<string, Package>): string[] {
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const order: string[] = [];
  function visit(name: string) {
    if (visited.has(name)) return;
    if (visiting.has(name)) throw new Error('Circular dependency: '+name);
    visiting.add(name);
    for (const dep of pkgs[name].deps) visit(dep);
    visiting.delete(name);
    visited.add(name);
    order.push(name);
  }
  for (const name of Object.keys(pkgs)) visit(name);
  return order;
}

// 检测循环依赖
function detectCycles(pkgs: Record<string, Package>): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const stack: string[] = [];
  function dfs(name: string) {
    if (stack.includes(name)) {
      const idx = stack.indexOf(name);
      cycles.push([...stack.slice(idx), name]);
      return;
    }
    if (visited.has(name)) return;
    stack.push(name);
    for (const dep of pkgs[name].deps) dfs(dep);
    stack.pop();
    visited.add(name);
  }
  for (const name of Object.keys(pkgs)) dfs(name);
  return cycles;
}

// --- 4. 内部包类型注册模拟 ---
interface ApiResponse<T> { data: T; ok: boolean; }
interface User { id: number; name: string; }
interface PackageExports {
  'types': { User: User; ApiResponse: <T>(data: T) => ApiResponse<T> };
  'utils': { formatDate: (d: Date) => string; deepClone: <T>(o: T) => T };
  'shared': { config: { apiUrl: string; timeout: number }; httpClient: { get: <T>(url: string) => Promise<T> } };
}

// 模拟从包名获取导出类型的工具
type ImportFrom<Pkg extends keyof PackageExports> = PackageExports[Pkg];

// --- 5. Barrel Export vs 直接导入对比 ---
// Barrel (index.ts): export * from './user'; export * from './post';
// 问题: 导入未使用的内容, tree-shaking困难, 类型加载慢
// 直接导入: import { User } from '@shared/user';
// 优点: 精确导入, 更好tree-shaking, 更快类型检查

// --- 6. tsbuildinfo 增量构建概念演示 ---
class BuildCache {
  private cache = new Map<string, { hash: string; buildTime: number; deps: string[] }>();
  hash(content: string): number {
    let h = 0;
    for (let i = 0; i < content.length; i++) h = ((h << 5) - h + content.charCodeAt(i)) | 0;
    return Math.abs(h);
  }
  needsRebuild(pkgName: string, files: Map<string,string>): boolean {
    const prev = this.cache.get(pkgName);
    if (!prev) return true;
    const currentHash = this.hash(JSON.stringify([...files.entries()].sort()));
    return prev.hash !== currentHash;
  }
  recordBuild(pkgName: string, files: Map<string,string>, deps: string[], time: number) {
    this.cache.set(pkgName, { hash: this.hash(JSON.stringify([...files.entries()].sort())), buildTime: time, deps });
  }
  getBuildOrder(pkgs: Record<string, Package>): string[] {
    return topoSort(pkgs);
  }
}

// 模拟构建系统
class MonorepoBuilder {
  private cache = new BuildCache();
  build(pkgs: Record<string, Package>, fileContents: Map<string,Map<string,string>>) {
    const order = this.cache.getBuildOrder(pkgs);
    const results: { pkg: string; rebuilt: boolean; time: number }[] = [];
    for (const name of order) {
      const files = fileContents.get(name) || new Map();
      const rebuilt = this.cache.needsRebuild(name, files);
      const time = rebuilt ? Math.floor(Math.random()*500+100) : 0;
      if (rebuilt) this.cache.recordBuild(name, files, pkgs[name].deps, time);
      results.push({ pkg: name, rebuilt, time });
    }
    return results;
  }
}

// --- 主程序演示 ---
console.log('========== 🏗️  Monorepo工程化演示 ==========\\n');

console.log('1. 包依赖拓扑排序:');
const order = topoSort(packages);
console.log('  构建顺序:', order.join(' → '));

console.log('\\n2. 循环依赖检测:');
const cycles = detectCycles(packages);
console.log('  正常依赖图循环:', cycles.length === 0 ? '✓ 无循环依赖' : '✗ 发现循环');

// 测试循环检测
const cyclicPackages = {
  a: { name: 'a', deps: ['b'], path: 'a' },
  b: { name: 'b', deps: ['c'], path: 'b' },
  c: { name: 'c', deps: ['a'], path: 'c' },
};
const cyclicResult = detectCycles(cyclicPackages);
console.log('  循环依赖图检测:', cyclicResult.length > 0 ? '✓ 检测到循环: '+cyclicResult[0].join(' → ') : '✗ 未检测到');

console.log('\\n3. 增量构建演示:');
const builder = new MonorepoBuilder();
const files1 = new Map<string, Map<string,string>>();
for (const name of Object.keys(packages)) {
  files1.set(name, new Map([['index.ts', '// source code for '+name]]));
}
console.log('  第一次构建（全量）:');
const build1 = builder.build(packages, files1);
let totalTime1 = 0;
for (const r of build1) { console.log('    '+r.pkg+':', r.rebuilt?'重新构建 ('+r.time+'ms)':'缓存命中'); totalTime1+=r.time; }
console.log('    总耗时: '+totalTime1+'ms');

console.log('\\n  第二次构建（无变更，增量）:');
const build2 = builder.build(packages, files1);
let rebuilt2 = 0;
for (const r of build2) { if (r.rebuilt) rebuilt2++; }
console.log('    重新构建包数: '+rebuilt2+' (期望0)');

console.log('\\n  第三次构建（修改utils包）:');
const files3 = new Map(files1);
files3.set('utils', new Map([['index.ts', '// updated source code']]));
const build3 = builder.build(packages, files3);
for (const r of build3) { console.log('    '+r.pkg+':', r.rebuilt?'重新构建':'缓存命中'); }

console.log('\\n4. Path Mapping 演示:');
type Ex1 = ResolvePath<'@shared/config'>;  // -> ../packages/shared/src/config
type Ex2 = ResolvePath<'@utils/format'>;   // -> ../packages/utils/src/format
type Ex3 = ResolvePath<'./local'>;         // -> ./local (无映射)
console.log('  @shared/config -> ../packages/shared/src/config');
console.log('  @utils/format -> ../packages/utils/src/format');
console.log('  ./local -> ./local (无变化)');

console.log('\\n5. 跨包类型导入概念:');
console.log('  import type { User } from \\'types\\'');
console.log('  import { formatDate } from \\'utils\\'');
console.log('  import { httpClient } from \\'shared\\'');
console.log('  类型在包间正确传递，保持端到端类型安全');

console.log('\\n6. tsconfig继承层次:');
console.log('  tsconfig.base.json (strict, target, moduleResolution)');
console.log('  ├── tsconfig.node.json (extends base, NodeNext)');
console.log('  ├── apps/api/tsconfig.json (extends node, references shared, types)');
console.log('  ├── apps/web/tsconfig.json (extends base, references shared, types)');
console.log('  └── packages/*/tsconfig.json (extends base, references deps)');

console.log('\\n========== 演示完成 ==========');
`
  },
  {
    id: "ts3-migration-js-to-ts",
    title: "JavaScript 到 TypeScript 迁移实战",
    icon: "🔄",
    group: "工具链与工程化",
    content: `# JavaScript 到 TypeScript 迁移实战

将大型 JavaScript 项目迁移到 TypeScript 是一项渐进式工程，不必追求一次性完成。TypeScript 提供了 allowJs、checkJs、JSDoc 类型推断、环境声明等工具，支持从宽松到严格的渐进式迁移策略。合理的迁移计划可以在不中断业务开发的前提下，逐步获得类型安全的益处。

## 一、迁移策略总览

主流迁移策略有三种：1) **宽松启动**——初始 strict: false，allowJs: true，仅对新文件使用 .ts，逐步收紧；2) **混合模式**——allowJs + checkJs: true，让 TypeScript 检查现有 JS 文件中的 JSDoc 类型和明显错误；3) **激进迁移**——一次性将所有文件重命名为 .ts，通过大量 any 和 // @ts-ignore 先让编译通过，再逐步收紧。推荐第一种"宽松启动+渐进收紧"策略，风险最低，团队适应成本最小。关键原则：迁移过程中保持代码可运行、测试可通过、CI绿色，不要在迁移的同时大规模重构业务逻辑。

## 二、allowJs + checkJs 混合模式

allowJs: true 允许 TypeScript 编译器处理 .js 文件，将它们与 .ts 文件一起编译输出。checkJs: true 进一步在 .js 文件中启用类型检查，TypeScript 会根据 JSDoc 注解、变量初始化值、函数体内的使用模式推断类型并报告错误。这两个选项组合使用时，可以在不重命名任何文件的情况下开始获得类型检查的好处。可以在特定文件顶部添加 // @ts-nocheck 跳过检查，或添加 // @ts-ignore 忽略下一行错误，也可以用 // @ts-check 在非checkJs模式下对单个文件启用检查。渐进式策略：先开启allowJs不开checkJs，稳定后开启checkJs，再逐个文件修复错误。

## 三、JSDoc 类型注解到 .d.ts

在不修改文件扩展名的情况下，可以通过 JSDoc 注解为 JavaScript 代码提供类型信息。TypeScript 支持的 JSDoc 标签包括：@param {类型} 参数名 描述、@returns {类型} 描述、@type {类型}、@typedef 定义复杂类型、@template T 定义泛型、@callback 定义函数类型、@property 描述对象属性。当 JSDoc 类型遍布项目后，可以使用 \`tsc --declaration --allowJs --emitDeclarationOnly\` 从 JSDoc 注解的 JS 代码自动生成 .d.ts 声明文件，为后续完全迁移到 TS 打下基础。TypeScript 还能识别 CommonJS 的 module.exports 和 require 调用进行类型推断。

## 四、Strict 模式渐进开启

strict: true 是一组严格选项的总开关，包含：strictNullChecks（null/undefined不能赋值给其他类型）、noImplicitAny（禁止隐式any）、strictFunctionTypes（函数参数逆变检查）、strictBindCallApply（bind/call/apply类型检查）、noImplicitThis（this必须有明确类型）、alwaysStrict、useUnknownInCatchVariables（catch变量为unknown）。渐进开启策略：1) 初始所有strict子选项关闭；2) 先开启noImplicitThis和alwaysStrict，影响较小；3) 再开启noImplicitAny，最常见的错误来源；4) 开启strictNullChecks，最大的类型安全提升但修复成本最高；5) 最后开启strictFunctionTypes等。也可以在子目录放置更严格的tsconfig，先让新代码区域严格起来。

## 五、第三方库类型与 Shim 声明

迁移过程中最常见的障碍是第三方库缺少类型。解决方案：1) 首先检查 @types/ 包——\`npm install -D @types/lodash\` 安装社区维护的类型声明；2) 对于没有 @types 包的库，创建 ambient declaration（shim）：在项目中创建 \`declarations.d.ts\` 文件，使用 \`declare module 'some-lib'\` 声明模块，最简形式为 \`declare module 'some-lib';\` （完全any类型），逐步补充精确类型；3) 对于非JS资源（CSS模块、图片、JSON），需要声明模块：\`declare module '*.css' { const classes: Record<string,string>; export default classes; }\`；4) 对于全局变量（如window上挂载的第三方SDK），使用 \`declare interface Window { MySDK: any; }\` 扩展。

## 六、Ambient Declarations 环境声明详解

.d.ts 文件中的 declare 关键字用于告诉 TypeScript 某个值的类型"在别处存在"，不需要编译器生成JS代码。\`declare function\`、\`declare class\`、\`declare const/let/var\`、\`declare namespace\`、\`declare module\` 是主要形式。全局声明文件（无import/export）中的声明自动全局可用；包含import/export的文件成为模块，需要通过import使用或 \`declare global { ... }\` 扩展全局。三斜线指令 /// <reference types="..." /> 和 /// <reference path="..." /> 用于引入其他声明文件。对于使用UMD格式的库，可以用 \`export as namespace LibName;\` 声明全局变量。

## 七、常见迁移陷阱

迁移过程中容易遇到的坑：1) **CommonJS vs ESM 模块互操作**——\`import foo = require('foo')\` 或 esModuleInterop: true 解决 import 形式导入 CJS 模块的问题；2) **this 隐式绑定丢失**——回调函数中的 this 常被推断为 any，需要明确绑定或使用箭头函数；3) **对象动态属性访问**——\`obj[key]\` 在 key 类型不精确时报错，可用 keyof 或 Record<string,unknown> 处理；4) **原型链扩展**——JS 中往原型上挂方法需要在 .d.ts 中 interface 补充声明；5) **高阶函数和装饰器**--JS 常见的装饰器/包裹模式在 TS 中需要精确的泛型签名；6) **默认导出问题**--\`module.exports = x\` 对应 \`export = x\`，需要 esModuleInterop 或 import = require 语法；7) **枚举迁移**--JS 对象常量不要急于改成 TS enum，先用 as const 和 string literal 更兼容。

## 八、测量迁移进度

量化迁移进度有助于团队保持动力和追踪问题：1) 统计 .ts/.tsx 文件占总文件数比例；2) 统计 // @ts-expect-error / // @ts-ignore 的数量，目标是逐步减少；3) tsc --noEmit 输出的错误数量趋势；4) strict 模式相关错误（如 TS2339 属性不存在、TS2345 参数类型不匹配）的数量；5) 开启 @typescript-eslint 规则统计 any 使用量；6) 使用 type-coverage 工具统计类型覆盖率（目标95%+）。将这些指标集成到CI，建立Dashboard，将"去any化"作为日常技术债处理而非大爆炸式迁移。

## 九、从 Loose 到 Strict 过渡工具

TypeScript 官方和社区提供多种辅助工具：1) **ts-migrate**（Airbnb开源）——自动将JS文件转为TS，批量添加any类型和注释，快速让项目编译通过；2) **type-wizard**——交互式为第三方库生成类型声明；3) **dts-gen**——从运行时值自动生成初始 .d.ts；4) **typescript-eslint**——提供 no-explicit-any、no-unsafe-* 等规则，配合ESLint渐进修复；5) **ts-prune**——检测未使用的导出和类型；6) **@ts-expect-error** 比 @ts-ignore 更好——当修复了错误后TS会报告多余的 @ts-expect-error，帮助追踪未完成的类型修复。使用类型改善PR模板：要求新代码不引入新的any，新文件使用strict模式。

## 小结

JS→TS迁移是马拉松而非短跑。核心策略是 allowJs起步→checkJs渐进检查→JSDoc提供中间类型→子目录/新代码优先strict→定期统计和减少any与@ts-ignore→最终全strict。每个阶段都保持CI绿色和测试通过，让团队在业务迭代中自然过渡。好的迁移不会让开发者感觉到"被类型系统阻碍"，而是逐步体验到"类型帮助发现问题"的价值。`,
    code: `// JavaScript 到 TypeScript 迁移模式演示

// --- 1. JSDoc 类型注解示例 (模拟JS文件用JSDoc标注类型) ---
/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {'admin'|'user'|'guest'} role
 */

/**
 * 创建用户
 * @param {Partial<User>} overrides
 * @returns {User}
 */
function createUserJS(overrides) {
  return { id: 1, name: 'Anonymous', email: '', role: 'user', ...overrides };
}

/**
 * 按属性分组数组
 * @template T
 * @param {T[]} arr
 * @param {keyof T} key
 * @returns {Record<string, T[]>}
 */
function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = String(item[key]);
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, /** @type {Record<string, T[]>} */ ({}));
}

// --- 2. 迁移阶段进度追踪 ---
interface MigrationStats {
  totalFiles: number;
  tsFiles: number;
  jsFiles: number;
  tsIgnoreCount: number;
  anyCount: number;
  strictErrors: number;
  typeCoveragePercent: number;
}

class MigrationTracker {
  private snapshots: { date: string; stats: MigrationStats }[] = [];
  record(stats: MigrationStats) {
    this.snapshots.push({ date: new Date().toISOString().slice(0,10), stats });
  }
  tsRatio(stats: MigrationStats): number {
    return stats.totalFiles > 0 ? (stats.tsFiles / stats.totalFiles * 100) : 0;
  }
  progress(): { tsRatio: number; typeCoverage: number; trend: string } {
    if (this.snapshots.length === 0) return { tsRatio: 0, typeCoverage: 0, trend: 'no data' };
    const latest = this.snapshots[this.snapshots.length-1].stats;
    if (this.snapshots.length === 1) return { tsRatio: this.tsRatio(latest), typeCoverage: latest.typeCoveragePercent, trend: 'first record' };
    const prev = this.snapshots[this.snapshots.length-2].stats;
    const delta = this.tsRatio(latest) - this.tsRatio(prev);
    return {
      tsRatio: this.tsRatio(latest),
      typeCoverage: latest.typeCoveragePercent,
      trend: delta > 0 ? ('improving +'+delta.toFixed(1)+'%') : delta < 0 ? 'regressing' : 'stable',
    };
  }
  getSnapshots() { return this.snapshots; }
}

// --- 3. Shim/Ambient Declaration 示例模式 ---
// declare module 'untyped-lib' { const lib: any; export default lib; }
// declare module '*.module.css' { const c: Record<string,string>; export default c; }
// declare interface Window { __APP_CONFIG__: { apiUrl: string }; }
// These are .d.ts patterns - demonstrate the concept in JS runtime:

function createShim(moduleName) {
  return \`// Minimal shim for untyped module: \${moduleName}
declare module '\${moduleName}';

// Better shim (gradually add types):
// declare module '\${moduleName}' {
//   export function doSomething(input: string): string;
//   export const version: string;
// }\`;
}

// --- 4. 从 any 到精确类型的迁移演示 ---
// 阶段1: 完全any (迁移早期)
function getUserDataBad(id) { // id: any, return any
  return { id, name: 'User'+id };
}
// 阶段2: 添加基本类型
function getUserDataMid(id: number): { id: number; name: string } {
  return { id, name: 'User'+id };
}
// 阶段3: 接口+完整类型
interface GetUserDataResult { id: number; name: string; createdAt: Date; }
function getUserDataGood(id: number): GetUserDataResult {
  return { id, name: 'User'+id, createdAt: new Date() };
}

// --- 5. CommonJS <-> ESM 互操作模式 ---
// JS 中: const lodash = require('lodash');
// TS 迁移选项:
//   a) import lodash = require('lodash');   (传统)
//   b) import lodash from 'lodash';        (需 esModuleInterop: true)
//   c) import * as lodash from 'lodash';   (命名空间导入, 用于纯ESM)

// --- 6. 模拟strict模式增量开启顺序 ---
const strictAdoption = [
  { option: 'alwaysStrict',          effort: 1, impact: 1, desc: '始终使用严格模式' },
  { option: 'noImplicitThis',        effort: 2, impact: 2, desc: 'this必须有类型注解' },
  { option: 'noImplicitAny',         effort: 4, impact: 5, desc: '禁止隐式any' },
  { option: 'strictBindCallApply',   effort: 2, impact: 3, desc: 'bind/call/apply类型检查' },
  { option: 'useUnknownInCatchVars', effort: 3, impact: 4, desc: 'catch变量为unknown' },
  { option: 'strictNullChecks',      effort: 8, impact: 10, desc: 'null/undefined严格检查' },
  { option: 'strictFunctionTypes',   effort: 5, impact: 7, desc: '函数参数逆变检查' },
  { option: 'strictPropertyInit',    effort: 6, impact: 6, desc: '类属性必须初始化' },
];

// --- 7. @ts-ignore vs @ts-expect-error 对比 ---
// @ts-ignore: 忽略下一行错误, 但即使错误被修复也不会提示
// @ts-expect-error: 标记下一行"期望有错误", 错误修复后TS会报错提示移除注释
// 迁移中优先使用 @ts-expect-error, 便于未来清理

// --- 8. 动态对象访问迁移模式 ---
// JS: const val = obj[key]; (任意key访问任意属性)
// TS迁移方案:
function safeGet<T extends object, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// --- 9. 迁移配置生成器 ---
function generateMigrationConfig(stage) {
  switch(stage) {
    case 1: return {  // 初始: 仅allowJs
      compilerOptions: { allowJs: true, checkJs: false, strict: false, outDir: './dist' },
      include: ['src/**/*'],
    };
    case 2: return {  // 开始checkJs
      compilerOptions: { allowJs: true, checkJs: true, strict: false, outDir: './dist' },
      include: ['src/**/*'],
    };
    case 3: return {  // 部分strict开启
      compilerOptions: { allowJs: true, checkJs: true, noImplicitAny: true, alwaysStrict: true, outDir: './dist' },
      include: ['src/**/*'],
    };
    case 4: return {  // strict但保留allowJs
      compilerOptions: { allowJs: true, checkJs: true, strict: true, esModuleInterop: true, outDir: './dist' },
      include: ['src/**/*'],
    };
    case 5: return {  // 完全TS, strict
      compilerOptions: { strict: true, esModuleInterop: true, outDir: './dist' },
      include: ['src/**/*.ts', 'src/**/*.tsx'],
    };
  }
}

// --- 主程序演示 ---
console.log('========== 🔄 JS→TS迁移演示 ==========\\n');

console.log('1. JSDoc类型注解 (迁移早期在JS中添加类型):');
const u1 = createUserJS({ name: 'Alice' });
console.log('  createUserJS result:', JSON.stringify(u1));

const users = [
  { id:1, role:'admin', name:'A' },
  { id:2, role:'user', name:'B' },
  { id:3, role:'admin', name:'C' },
];
const grouped = groupBy(users, 'role');
console.log('  groupBy(users, role):', JSON.stringify(grouped));

console.log('\\n2. 迁移进度追踪:');
const tracker = new MigrationTracker();
tracker.record({ totalFiles:100, tsFiles:0, jsFiles:100, tsIgnoreCount:0, anyCount:0, strictErrors:0, typeCoveragePercent:0 });
tracker.record({ totalFiles:105, tsFiles:20, jsFiles:85, tsIgnoreCount:30, anyCount:150, strictErrors:500, typeCoveragePercent:25 });
tracker.record({ totalFiles:110, tsFiles:50, jsFiles:60, tsIgnoreCount:45, anyCount:200, strictErrors:300, typeCoveragePercent:45 });
tracker.record({ totalFiles:115, tsFiles:85, jsFiles:30, tsIgnoreCount:20, anyCount:80, strictErrors:50, typeCoveragePercent:78 });
tracker.record({ totalFiles:120, tsFiles:120, jsFiles:0, tsIgnoreCount:5, anyCount:15, strictErrors:0, typeCoveragePercent:95 });

for (const snap of tracker.getSnapshots()) {
  const r = (snap.stats.tsFiles/snap.stats.totalFiles*100).toFixed(0);
  console.log('  '+snap.date+' | TS文件: '+snap.stats.tsFiles+'/'+snap.stats.totalFiles+' ('+r+'%) | @ts-ignore: '+snap.stats.tsIgnoreCount+' | any: '+snap.stats.anyCount+' | 覆盖率: '+snap.stats.typeCoveragePercent+'%');
}
const prog = tracker.progress();
console.log('  当前状态: TS占比'+prog.tsRatio.toFixed(0)+'%, 类型覆盖率'+prog.typeCoverage+'%, 趋势: '+prog.trend);

console.log('\\n3. strict模式渐进开启路径:');
for (const s of strictAdoption) {
  const bar = '█'.repeat(s.effort) + '░'.repeat(8-s.effort);
  console.log('  '+s.option.padEnd(28)+' 修复成本:'+bar+' 收益:'+'★'.repeat(s.impact)+' '+s.desc);
}

console.log('\\n4. 迁移阶段tsconfig配置:');
for (let i=1; i<=5; i++) {
  console.log('  阶段'+i+':', JSON.stringify(generateMigrationConfig(i)).replace(/,"/g, ', "'));
}

console.log('\\n5. Shim声明模板示例:');
console.log(createShim('some-untyped-lib').split('\\n').map(l=>'  '+l).join('\\n'));

console.log('\\n6. 迁移阶段类型精度提升:');
console.log('  阶段1 (any):     getUserDataBad("1") =>', JSON.stringify(getUserDataBad('1')));
console.log('  阶段2 (基础类型): getUserDataMid(1) =>', JSON.stringify(getUserDataMid(1)));
console.log('  阶段3 (精确类型): getUserDataGood(1) =>', JSON.stringify(getUserDataGood(1)));

console.log('\\n7. 安全属性访问 (替代any索引):');
const obj = { name: 'test', age: 25 } as const;
console.log('  safeGet({name,age}, "name") =', safeGet(obj, 'name'));
// safeGet(obj, 'invalid');  // TS编译错误 - 这就是类型安全!

console.log('\\n8. @ts-expect-error 优于 @ts-ignore:');
console.log('  - @ts-ignore: 永久忽略错误, 不提示清理');
console.log('  - @ts-expect-error: 错误修复后TS报告"多余注释", 推动清理技术债');

console.log('\\n========== 迁移演示完成 ==========');
`
  }
];
