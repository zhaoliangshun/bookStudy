"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chapters = void 0;

exports.chapters = [
  {
    id: "ts3-domain-driven-design",
    title: "DDD 领域驱动设计类型",
    icon: "🏛️",
    group: "架构与实战",
    content: `# DDD 领域驱动设计类型

领域驱动设计（Domain-Driven Design，DDD）是一种软件设计方法论，强调以业务领域为核心来构建软件系统。TypeScript 的类型系统为 DDD 提供了强大的编译时保障，能够将领域概念精确地映射到类型层面。本章将深入探讨如何使用 TypeScript 的高级类型特性来实现 DDD 的核心模式，包括值对象、实体、聚合根、仓储、领域事件、领域服务、限界上下文和规约模式。

## 一、值对象类型与标称类型

值对象（Value Object）是 DDD 中最基础的构建块之一。值对象没有唯一标识，它们通过属性值来定义相等性。在 TypeScript 中，原生类型系统是结构化的（structural typing），这意味着两个具有相同结构的类型会被认为是兼容的。但在领域建模中，我们经常需要区分具有相同底层结构但代表不同业务概念的类型，例如 UserId 和 OrderId 可能都是 string 类型，但它们在业务上完全不同。

标称类型（Nominal Typing）解决了这个问题。通过品牌类型（Branded Types）或唯一符号（unique symbol），我们可以在 TypeScript 中模拟标称类型系统。品牌类型的核心思想是在基础类型上附加一个不可伪造的"品牌"标记，使得类型检查器能够区分看似相同但语义不同的类型。

实现标称类型有多种方式。最简单的方式是使用交叉类型和一个唯一的 brand 属性。更严格的方式可以使用 unique symbol 来确保品牌标记的唯一性，防止外部伪造。使用枚举或字面量类型作为品牌标记也是常见做法。

值对象应该是不可变的。一旦创建，其状态就不能改变。当需要修改值对象时，应该创建一个新的实例。这可以通过 Readonly 工具类型或 Object.freeze 来强制执行。不可变性带来了许多好处：线程安全、可以安全地共享、易于推理、避免意外的副作用。

值对象的相等性判断也是关键。两个值对象相等当且仅当它们的所有属性都相等。我们可以为值对象实现 equals 方法，或者使用自定义的类型守卫来进行比较。在 TypeScript 中，我们还可以利用类型系统来确保只有相同类型的值对象才能进行比较。

## 二、实体类型

实体（Entity）与值对象不同，实体具有唯一标识符，即使其属性发生变化，实体的身份保持不变。例如，一个用户的姓名或邮箱可能改变，但 UserId 不变，该用户仍然是同一个实体。

在 TypeScript 中建模实体时，首先需要定义实体的标识类型。使用标称类型来区分不同实体的 ID 是最佳实践。实体本身应该包含一个只读的 id 属性，以及其他可变的属性。实体的属性应该被封装，只通过方法来修改，这样可以确保业务规则在状态变更时得到执行。

实体的相等性基于 ID 而非属性值。两个实体如果 ID 相同，即使其他属性不同，也应该被认为是同一个实体。这与值对象形成鲜明对比。在 TypeScript 中，我们可以创建一个基础实体类型或抽象类，定义通用的 id 属性和 equals 方法。

实体的状态变更应该通过领域方法来进行，而不是直接修改属性。这些方法应该包含业务规则验证，确保实体始终处于有效状态。例如，修改订单状态时，需要验证状态转换是否合法（如已发货的订单不能直接变为已取消）。TypeScript 的类型系统可以帮助我们建模状态机，使用可辨识联合来限制允许的状态转换。

## 三、聚合根类型

聚合（Aggregate）是一组相关对象的集合，作为数据修改的单元。每个聚合都有一个根（Aggregate Root）和一个边界。聚合根是聚合中唯一允许外部对象引用的对象，聚合内的其他对象只能通过聚合根来访问。

聚合根类型在实体类型的基础上增加了边界约束。聚合根负责维护聚合内部的一致性规则。在 TypeScript 中，我们可以通过访问修饰符（如 private、protected）或使用模块系统来强制聚合边界，将聚合内部的实体和值对象设为只能在聚合内部访问。

聚合根的设计原则包括：聚合之间通过 ID 引用而非对象引用，这样可以避免加载整个对象图；一个事务只修改一个聚合；聚合应该尽量小，只包含必要的业务规则。使用 TypeScript 的类型系统，我们可以定义聚合根接口，确保只有聚合根类型才能被仓储直接操作。

聚合根负责发布领域事件。当聚合内部发生重要的状态变更时，聚合根创建并记录领域事件，但不立即发布。这些事件会在工作单元（Unit of Work）提交时统一发布。这种设计确保了事件只在事务成功提交后才被处理，避免了不一致的状态。

## 四、仓储接口

仓储（Repository）模式用于封装数据访问逻辑，提供类似集合的接口来访问聚合根。仓储接口定义在领域层，实现在基础设施层，这是依赖倒置原则的应用。

在 TypeScript 中，仓储应该被定义为接口或抽象类，包含对聚合根进行增删改查的方法。仓储接口应该使用领域语言来命名方法，而不是技术语言。例如，使用 findById 而非 selectById，使用 save 而非 insertOrUpdate。

仓储接口应该针对聚合根来定义，每个聚合根对应一个仓储接口。仓储不应该暴露聚合内部的实体，所有操作都应该通过聚合根来进行。仓储的方法参数和返回值应该使用领域类型（如值对象、实体），而不是原始类型或数据库特定类型。

规格模式（Specification Pattern）经常与仓储结合使用，用于封装查询条件。规格是一个可组合的谓词，用于判断对象是否满足某些条件。在 TypeScript 中，规格可以表示为一个带有 isSatisfiedBy 方法的接口，并且可以通过 and、or、not 等方法进行组合。

## 五、领域事件类型

领域事件（Domain Event）表示领域中发生过的事情。事件是不可变的，表示过去发生的事实，使用过去时态命名（如 OrderCreated、PaymentConfirmed）。

在 TypeScript 中，领域事件应该包含事件发生的时间戳、事件 ID，以及与事件相关的数据。使用可辨识联合来定义所有可能的事件类型，可以确保事件处理的完整性。每个事件类型都有一个 kind 或 type 字段作为判别式，使得类型守卫能够在 switch 语句中 narrowing 事件类型。

事件处理器（Event Handler）是响应领域事件的组件。在 TypeScript 中，可以使用映射类型来建立事件类型到处理器的对应关系，确保每个事件都有对应的处理器，且处理器接收正确的事件数据类型。事件总线（Event Bus）负责分发事件到相应的处理器。

领域事件的一个重要特性是它们可以被用来实现跨聚合的最终一致性。当一个聚合修改后发布事件，其他聚合可以监听这些事件并相应地更新自己的状态。这种方式可以降低聚合之间的耦合度。

## 六、领域服务与应用服务类型

领域服务（Domain Service）用于实现不属于任何实体或值对象的领域逻辑。当某个操作涉及多个聚合根，或者需要外部资源但本质上是领域逻辑时，应该使用领域服务。

应用服务（Application Service）负责协调领域对象来完成用例。应用服务是很薄的一层，它不包含业务规则，只负责：获取输入、调用领域对象、持久化变更、发布事件、返回结果。

在 TypeScript 中，服务应该通过接口来定义，依赖通过构造函数注入。使用类型系统来表达服务的依赖关系，可以在编译时检查依赖是否满足。命令（Command）和查询（Query）对象也可以用类型来定义，使用可辨识联合来区分不同的命令类型。

## 七、限界上下文

限界上下文（Bounded Context）是 DDD 中最核心的模式之一。它定义了模型适用的范围，在不同的限界上下文中，同一个术语可能有不同的含义。例如，"用户"在身份认证上下文中可能包含用户名和密码，在订单上下文中可能只包含用户 ID 和收货地址。

在 TypeScript 中，我们可以使用模块（module）或命名空间（namespace）来划分限界上下文。每个限界上下文有自己的领域模型，它们之间通过上下文映射（Context Map）来集成。集成方式包括：防腐层（Anti-Corruption Layer）、开放主机服务（Open Host Service）、共享内核（Shared Kernel）等。

使用 TypeScript 的模块系统，我们可以控制哪些类型可以导出到上下文外部，哪些只能在内部使用。跨上下文的通信应该通过显式的转换层，将一个上下文的模型转换为另一个上下文的模型，避免模型污染。

## 八、规约模式类型

规约模式（Specification）是一种将业务规则封装为可组合单元的模式。规约有三种用途：验证（检查对象是否满足某些条件）、选择（从集合中筛选满足条件的对象）、按需创建（指定对象在创建时必须满足的条件）。

在 TypeScript 中，规约接口通常包含一个 isSatisfiedBy 方法，接收一个候选对象并返回布尔值。规约可以通过 and、or、not 等方法进行组合，形成复合规约。使用泛型来让规约适用于不同的实体类型。

规约模式与仓储结合时，可以用来表达查询条件。但需要注意的是，内存中的规约与数据库查询可能需要不同的实现。一种方式是让规约接口同时支持内存判断和查询转换，另一种方式是使用 separate interface 模式。

TypeScript 的类型系统可以帮助我们确保规约组合的类型安全。例如，一个针对 Order 的规约只能与另一个针对 Order 的规约进行 and 组合，而不能与针对 User 的规约组合。

通过本章的学习，你将掌握如何使用 TypeScript 的高级类型特性来构建类型安全的 DDD 架构，将业务规则编码到类型系统中，让编译器帮助我们捕获更多的错误。`,
    code: `// ==================== DDD 领域驱动设计 TypeScript 实现 ====================

// ---------- 工具类型：标称类型（Nominal Typing） ----------
declare const Brand: unique symbol;
type Brand<T, B> = T & { readonly [Brand]: B };

// ---------- 值对象（Value Object）基类 ----------
abstract class ValueObject<T> {
  protected readonly props: Readonly<T>;

  constructor(props: T) {
    this.props = Object.freeze({ ...props });
  }

  public equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) return false;
    if (vo.props === undefined) return false;
    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }
}

// ---------- 具体值对象定义 ----------
type OrderId = Brand<string, 'OrderId'>;
type UserId = Brand<string, 'UserId'>;
type ProductId = Brand<string, 'ProductId'>;
type MoneyAmount = Brand<number, 'MoneyAmount'>;

const createOrderId = (id: string): OrderId => id as OrderId;
const createUserId = (id: string): UserId => id as UserId;
const createProductId = (id: string): ProductId => id as ProductId;
const createMoney = (amount: number): MoneyAmount => {
  if (amount < 0) throw new Error('金额不能为负数');
  return Math.round(amount * 100) / 100 as MoneyAmount;
};

class Address extends ValueObject<{
  street: string;
  city: string;
  zipCode: string;
  country: string;
}> {
  get street() { return this.props.street; }
  get city() { return this.props.city; }
  get zipCode() { return this.props.zipCode; }
  get country() { return this.props.country; }

  toString() {
    return \`\${this.country} \${this.city} \${this.street} \${this.zipCode}\`;
  }
}

class Money extends ValueObject<{ amount: MoneyAmount; currency: string }> {
  get amount() { return this.props.amount; }
  get currency() { return this.props.currency; }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error(\`货币不匹配: \${this.currency} vs \${other.currency}\`);
    }
    return new Money({
      amount: createMoney(this.amount + other.amount),
      currency: this.currency
    });
  }

  multiply(factor: number): Money {
    return new Money({
      amount: createMoney(this.amount * factor),
      currency: this.currency
    });
  }

  toString() {
    return \`\${this.currency} \${this.amount.toFixed(2)}\`;
  }
}

// ---------- 实体（Entity）基类 ----------
abstract class Entity<Id, Props> {
  protected readonly _id: Id;
  protected props: Props;

  constructor(id: Id, props: Props) {
    this._id = id;
    this.props = props;
  }

  get id() { return this._id; }

  public equals(entity?: Entity<Id, Props>): boolean {
    if (entity === null || entity === undefined) return false;
    if (entity === this) return true;
    return this._id === entity._id;
  }
}

// ---------- 领域事件（Domain Event） ----------
interface DomainEvent {
  readonly eventId: string;
  readonly occurredOn: Date;
  readonly eventType: string;
}

type OrderCreatedEvent = DomainEvent & {
  readonly eventType: 'OrderCreated';
  readonly orderId: OrderId;
  readonly userId: UserId;
  readonly totalAmount: Money;
};

type OrderItemAddedEvent = DomainEvent & {
  readonly eventType: 'OrderItemAdded';
  readonly orderId: OrderId;
  readonly productId: ProductId;
  readonly quantity: number;
};

type OrderPaidEvent = DomainEvent & {
  readonly eventType: 'OrderPaid';
  readonly orderId: OrderId;
  readonly paidAt: Date;
};

type OrderShippedEvent = DomainEvent & {
  readonly eventType: 'OrderShipped';
  readonly orderId: OrderId;
  readonly trackingNumber: string;
};

type OrderEvents = OrderCreatedEvent | OrderItemAddedEvent | OrderPaidEvent | OrderShippedEvent;

// ---------- 订单状态机 ----------
type OrderStatus = 'Created' | 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled';

const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  Created: ['Paid', 'Cancelled'],
  Paid: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
  Delivered: [],
  Cancelled: []
};

// ---------- 订单项实体 ----------
interface OrderItemProps {
  productId: ProductId;
  productName: string;
  unitPrice: Money;
  quantity: number;
}

class OrderItem extends Entity<string, OrderItemProps> {
  constructor(props: OrderItemProps) {
    super(\`item-\${props.productId}\`, props);
  }

  get productId() { return this.props.productId; }
  get productName() { return this.props.productName; }
  get unitPrice() { return this.props.unitPrice; }
  get quantity() { return this.props.quantity; }

  get subtotal(): Money {
    return this.unitPrice.multiply(this.quantity);
  }

  updateQuantity(newQuantity: number): void {
    if (newQuantity <= 0) throw new Error('数量必须大于0');
    this.props = { ...this.props, quantity: newQuantity };
  }
}

// ---------- 聚合根：订单（Order） ----------
interface OrderProps {
  userId: UserId;
  items: OrderItem[];
  status: OrderStatus;
  shippingAddress: Address;
  createdAt: Date;
  paidAt?: Date;
  shippedAt?: Date;
}

class Order extends Entity<OrderId, OrderProps> {
  private _domainEvents: OrderEvents[] = [];

  private constructor(id: OrderId, props: OrderProps) {
    super(id, props);
  }

  static create(id: OrderId, userId: UserId, shippingAddress: Address): Order {
    const order = new Order(id, {
      userId,
      items: [],
      status: 'Created',
      shippingAddress,
      createdAt: new Date()
    });
    order.addEvent({
      eventId: \`evt-\${Date.now()}-1\`,
      occurredOn: new Date(),
      eventType: 'OrderCreated',
      orderId: id,
      userId,
      totalAmount: new Money({ amount: createMoney(0), currency: 'CNY' })
    });
    return order;
  }

  get userId() { return this.props.userId; }
  get status() { return this.props.status; }
  get items() { return [...this.props.items]; }
  get shippingAddress() { return this.props.shippingAddress; }
  get createdAt() { return this.props.createdAt; }
  get domainEvents() { return [...this._domainEvents]; }

  get totalAmount(): Money {
    const zero = new Money({ amount: createMoney(0), currency: 'CNY' });
    return this.props.items.reduce((total, item) => total.add(item.subtotal), zero);
  }

  private addEvent(event: OrderEvents): void {
    this._domainEvents.push(event);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }

  addItem(productId: ProductId, productName: string, unitPrice: Money, quantity: number): void {
    if (this.props.status !== 'Created') {
      throw new Error(\`无法在 \${this.props.status} 状态下添加商品\`);
    }
    if (quantity <= 0) throw new Error('数量必须大于0');

    const existingItem = this.props.items.find(item => item.productId === productId);
    if (existingItem) {
      existingItem.updateQuantity(existingItem.quantity + quantity);
    } else {
      this.props.items.push(new OrderItem({ productId, productName, unitPrice, quantity }));
    }

    this.addEvent({
      eventId: \`evt-\${Date.now()}-\${this._domainEvents.length + 1}\`,
      occurredOn: new Date(),
      eventType: 'OrderItemAdded',
      orderId: this._id,
      productId,
      quantity
    });
  }

  pay(): void {
    this.transitionTo('Paid');
    this.props.paidAt = new Date();
    this.addEvent({
      eventId: \`evt-\${Date.now()}-\${this._domainEvents.length + 1}\`,
      occurredOn: new Date(),
      eventType: 'OrderPaid',
      orderId: this._id,
      paidAt: this.props.paidAt
    });
  }

  ship(trackingNumber: string): void {
    this.transitionTo('Shipped');
    this.props.shippedAt = new Date();
    this.addEvent({
      eventId: \`evt-\${Date.now()}-\${this._domainEvents.length + 1}\`,
      occurredOn: new Date(),
      eventType: 'OrderShipped',
      orderId: this._id,
      trackingNumber
    });
  }

  cancel(): void {
    this.transitionTo('Cancelled');
  }

  private transitionTo(newStatus: OrderStatus): void {
    const allowed = validTransitions[this.props.status];
    if (!allowed.includes(newStatus)) {
      throw new Error(\`无法从 \${this.props.status} 转换到 \${newStatus}\`);
    }
    this.props = { ...this.props, status: newStatus };
  }
}

// ---------- 规约模式（Specification） ----------
interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
  and(other: Specification<T>): Specification<T>;
  or(other: Specification<T>): Specification<T>;
  not(): Specification<T>;
}

abstract class AbstractSpecification<T> implements Specification<T> {
  abstract isSatisfiedBy(candidate: T): boolean;

  and(other: Specification<T>): Specification<T> {
    return new AndSpecification(this, other);
  }

  or(other: Specification<T>): Specification<T> {
    return new OrSpecification(this, other);
  }

  not(): Specification<T> {
    return new NotSpecification(this);
  }
}

class AndSpecification<T> extends AbstractSpecification<T> {
  constructor(private left: Specification<T>, private right: Specification<T>) { super(); }
  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate);
  }
}

class OrSpecification<T> extends AbstractSpecification<T> {
  constructor(private left: Specification<T>, private right: Specification<T>) { super(); }
  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate);
  }
}

class NotSpecification<T> extends AbstractSpecification<T> {
  constructor(private spec: Specification<T>) { super(); }
  isSatisfiedBy(candidate: T): boolean {
    return !this.spec.isSatisfiedBy(candidate);
  }
}

class OrderStatusSpecification extends AbstractSpecification<Order> {
  constructor(private expectedStatus: OrderStatus) { super(); }
  isSatisfiedBy(order: Order): boolean {
    return order.status === this.expectedStatus;
  }
}

class MinOrderAmountSpecification extends AbstractSpecification<Order> {
  constructor(private minAmount: Money) { super(); }
  isSatisfiedBy(order: Order): boolean {
    return order.totalAmount.amount >= this.minAmount.amount;
  }
}

// ---------- 仓储接口（Repository Interface） ----------
interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: OrderId): Promise<Order | null>;
  findByUserId(userId: UserId): Promise<Order[]>;
  findBySpecification(spec: Specification<Order>): Promise<Order[]>;
}

class InMemoryOrderRepository implements OrderRepository {
  private orders: Map<string, Order> = new Map();

  async save(order: Order): Promise<void> {
    this.orders.set(order.id as string, order);
  }

  async findById(id: OrderId): Promise<Order | null> {
    return this.orders.get(id as string) || null;
  }

  async findByUserId(userId: UserId): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(o => o.userId === userId);
  }

  async findBySpecification(spec: Specification<Order>): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(o => spec.isSatisfiedBy(o));
  }
}

// ---------- 领域服务（Domain Service） ----------
class OrderPricingService {
  calculateDiscount(order: Order, discountRate: number): Money {
    if (discountRate < 0 || discountRate > 1) {
      throw new Error('折扣率必须在 0 到 1 之间');
    }
    return order.totalAmount.multiply(1 - discountRate);
  }
}

// ---------- 事件处理器 ----------
type EventHandler<E extends DomainEvent> = (event: E) => void;

class EventBus {
  private handlers: Map<string, EventHandler<any>[]> = new Map();

  subscribe<E extends OrderEvents>(eventType: E['eventType'], handler: EventHandler<E>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  publish(event: OrderEvents): void {
    const handlers = this.handlers.get(event.eventType) || [];
    handlers.forEach(handler => handler(event));
  }

  publishAll(events: OrderEvents[]): void {
    events.forEach(event => this.publish(event));
  }
}

// ---------- 运行演示 ----------
console.log('=== 🏛️ DDD 领域驱动设计演示 ===\\n');

// 创建值对象
const userId = createUserId('user-001');
const orderId = createOrderId('order-001');
const address = new Address({
  street: '中关村大街1号',
  city: '北京',
  zipCode: '100080',
  country: '中国'
});

const price1 = new Money({ amount: createMoney(99.00), currency: 'CNY' });
const price2 = new Money({ amount: createMoney(299.00), currency: 'CNY' });

console.log('📦 创建订单...');
const order = Order.create(orderId, userId, address);
console.log('订单状态:', order.status);
console.log('收货地址:', address.toString());

console.log('\\n🛒 添加商品...');
order.addItem(createProductId('prod-001'), 'TypeScript 实战教程', price1, 2);
order.addItem(createProductId('prod-002'), '机械键盘', price2, 1);
console.log('订单商品数量:', order.items.length);
order.items.forEach(item => {
  console.log(\`  - \${item.productName} x\${item.quantity} = \${item.subtotal.toString()}\`);
});
console.log('订单总额:', order.totalAmount.toString());

console.log('\\n💳 支付订单...');
order.pay();
console.log('订单状态:', order.status);

console.log('\\n🚚 发货...');
order.ship('SF1234567890');
console.log('订单状态:', order.status);

// 测试规约
console.log('\\n📋 规约模式测试...');
const paidSpec = new OrderStatusSpecification('Paid');
const shippedSpec = new OrderStatusSpecification('Shipped');
const minAmountSpec = new MinOrderAmountSpecification(
  new Money({ amount: createMoney(100), currency: 'CNY' })
);

console.log('已发货规约:', shippedSpec.isSatisfiedBy(order));
console.log('已支付规约:', paidSpec.isSatisfiedBy(order));
console.log('满100元规约:', minAmountSpec.isSatisfiedBy(order));

const expensiveShippedOrder = shippedSpec.and(minAmountSpec);
console.log('已发货且满100元:', expensiveShippedOrder.isSatisfiedBy(order));

// 测试仓储
console.log('\\n🗄️ 仓储测试...');
const repo = new InMemoryOrderRepository();
repo.save(order);
repo.findById(orderId).then(found => {
  if (found) {
    console.log('找到订单, 状态:', found.status, '总额:', found.totalAmount.toString());
  }
});

// 测试事件
console.log('\\n📡 领域事件...');
console.log('产生的事件数量:', order.domainEvents.length);
order.domainEvents.forEach(evt => {
  console.log(\`  - [\${evt.eventType}] at \${evt.occurredOn.toISOString()}\`);
});

const eventBus = new EventBus();
eventBus.subscribe('OrderCreated', (e) => {
  console.log(\`  🔔 处理事件: 订单 \${e.orderId} 已创建\`);
});
eventBus.subscribe('OrderPaid', (e) => {
  console.log(\`  🔔 处理事件: 订单 \${e.orderId} 于 \${e.paidAt.toLocaleTimeString()} 支付\`);
});
eventBus.publishAll(order.domainEvents);

// 测试值对象相等性
console.log('\\n🔍 值对象相等性...');
const addr1 = new Address({ street: 'A', city: 'B', zipCode: '100', country: 'CN' });
const addr2 = new Address({ street: 'A', city: 'B', zipCode: '100', country: 'CN' });
const addr3 = new Address({ street: 'X', city: 'Y', zipCode: '200', country: 'CN' });
console.log('addr1 equals addr2:', addr1.equals(addr2));
console.log('addr1 equals addr3:', addr1.equals(addr3));

// 测试标称类型
const uid = createUserId('user-123');
const oid = createOrderId('order-123');
console.log('\\n🏷️ 标称类型:');
console.log('UserId 与 OrderId 结构相同但类型不同 (编译时区分)');
console.log('uid:', uid, typeof uid);
console.log('oid:', oid, typeof oid);

console.log('\\n✅ DDD 演示完成');
`
  },
  {
    id: "ts3-plugin-architecture",
    title: "插件化架构",
    icon: "🧩",
    group: "架构与实战",
    content: `# 插件化架构

插件化架构（Plugin Architecture）是一种允许核心系统在运行时动态加载扩展功能的架构模式。通过插件机制，系统可以在不修改核心代码的情况下增加新功能，实现了开闭原则（OCP）——对扩展开放，对修改关闭。TypeScript 的类型系统为插件架构提供了编译时的类型安全保障，确保插件与宿主之间的契约得到遵守。

## 一、插件接口设计

插件接口是插件与宿主系统之间的契约。设计良好的插件接口应该遵循最小接口原则（ISP），只暴露插件真正需要的能力。在 TypeScript 中，插件接口通常包含：插件元数据（名称、版本、描述）、插件生命周期钩子（初始化、启动、停止）、插件扩展的功能点。

插件接口应该使用 TypeScript 的 interface 关键字定义，而不是 type 别名。这样可以获得更好的错误提示和声明合并能力。插件接口可以包含可选的方法，让插件只实现自己需要的钩子。使用 readonly 修饰符标记插件元数据，确保它们在运行时不会被修改。

版本兼容性是插件接口设计中的重要考虑。可以在接口中包含 apiVersion 字段，宿主系统在加载插件时检查版本兼容性，避免不兼容的插件导致系统崩溃。使用 semver（语义化版本）来管理 API 版本。

## 二、扩展点类型

扩展点（Extension Point）是宿主系统暴露给插件的"插槽"，插件可以通过这些插槽向系统注入新行为。扩展点的设计决定了插件可以在哪些方面扩展系统。

在 TypeScript 中，扩展点可以用多种方式建模。一种常见方式是使用钩子函数类型，定义插件在特定时机可以执行的函数签名。另一种方式是使用注册器模式，插件向注册器注册自己的实现。

扩展点类型应该是可组合的。宿主可以定义多个扩展点接口，插件根据需要实现其中的一部分。使用 TypeScript 的交叉类型（Intersection Types）可以将多个扩展点能力组合起来。使用 Partial 类型可以让所有扩展点变为可选，方便插件只实现需要的部分。

每个扩展点应该有清晰的输入输出类型定义。例如，一个转换数据的扩展点接收 T 类型输入，返回 U 类型输出；一个验证扩展点接收数据并返回验证结果。使用泛型可以让扩展点更加灵活和复用。

## 三、插件注册类型

插件注册（Plugin Registration）是插件告知宿主系统自身存在和能力的过程。注册机制需要确保插件元数据的完整性和类型安全。

在 TypeScript 中，可以定义 PluginManifest 类型来描述插件的元数据和能力声明。Manifest 包含插件的基本信息（id、name、version、author）、依赖的其他插件、提供的扩展点实现、需要的宿主 API 版本等。

插件注册表（Plugin Registry）维护所有已注册插件的信息。注册表的类型应该确保只有符合 Plugin 接口的对象才能被注册。可以使用 Map 数据结构存储插件，以插件 ID 为键。注册表提供注册、注销、查询、解析依赖等方法。

依赖解析是插件注册中的复杂问题。插件可能依赖其他插件，宿主需要按照正确的顺序加载和初始化插件。可以使用拓扑排序算法来解决依赖顺序问题。在类型层面，可以使用条件类型来递归解析依赖链，在编译时检查依赖是否满足。

## 四、能力发现

能力发现（Capability Discovery）是指宿主系统或其他插件能够查询某个插件提供了哪些功能。这是插件之间相互协作的基础。

在 TypeScript 中，可以使用类型映射（Mapped Types）和条件类型来构建类型安全的能力发现机制。每个扩展点可以有一个唯一的符号或字符串常量作为标识符，插件声明自己实现了哪些标识符对应的能力。

使用 TypeScript 的 satisfies 运算符可以确保插件正确实现了它声明的能力接口。这比直接使用类型注解更灵活，因为它保留了插件的具体类型，同时验证了它满足所需的接口。

能力发现还涉及到能力的查询和匹配。宿主可能需要查找所有实现了某个特定扩展点的插件。在类型层面，我们可以定义一个类型函数，给定一个扩展点类型，返回所有实现了该扩展点的插件类型集合。

## 五、Hook 系统类型

Hook 系统是插件架构中常见的模式，它允许插件在特定事件发生时执行自定义逻辑。Hook 系统有多种变体：同步 Hook、异步 Hook、并行 Hook、瀑布式 Hook（前一个 Hook 的输出作为后一个的输入）。

在 TypeScript 中建模 Hook 系统，首先需要定义 Hook 上下文（Hook Context）类型，包含 Hook 执行时插件可以访问的数据和方法。每个 Hook 点有自己的上下文类型。Hook 函数接收上下文并可能修改它或返回值。

Hook 的执行顺序很重要。可以使用优先级（priority）来控制 Hook 的执行顺序，数值越小优先级越高。也可以允许插件指定在某个插件之前或之后执行。在类型层面，Hook 注册函数应该接收正确类型的 Hook 回调。

对于瀑布式 Hook（也称为 Pipeline 模式），需要确保每个 Hook 的输入类型与前一个 Hook 的输出类型匹配。这可以通过泛型和类型推断来实现，形成一个类型安全的数据处理管道。

异步 Hook 在现代应用中非常常见，因为插件可能需要执行 IO 操作。Hook 的类型应该支持返回 Promise，宿主在执行 Hook 时使用 await。并行执行多个异步 Hook 时使用 Promise.all。

## 六、中间件与插件组合

中间件模式（Middleware Pattern）是插件组合的一种常见形式，特别适用于请求处理管道。每个中间件可以：修改请求/响应、短路请求（直接返回响应）、调用下一个中间件。

在 TypeScript 中，中间件的经典类型签名是 (context, next) => Promise<void> 或类似变体。next 函数调用下一个中间件。使用类型别名来定义中间件类型，使得可以在多个地方复用。

中间件组合（compose）函数将多个中间件组合成一个函数。组合函数的类型应该正确推导，确保中间件之间的类型兼容。使用泛型参数来表示上下文类型，让 compose 函数适用于不同的上下文。

洋葱模型是中间件的经典执行模型：请求从外到内穿过每个中间件，响应从内到外返回。这要求 next 函数的调用位置决定了中间件逻辑的执行时机（next 之前的代码在"请求阶段"执行，next 之后的代码在"响应阶段"执行）。

插件组合还涉及到插件间通信。可以设计事件总线或服务注册中心，让插件之间通过松耦合的方式通信，而不是直接依赖。

## 七、依赖注入类型

依赖注入（Dependency Injection，DI）是插件架构的重要伙伴。DI 容器负责管理对象的创建和依赖解析，使得插件不需要手动创建和管理其依赖。

在 TypeScript 中实现 DI，首先需要定义服务标识符。可以使用类构造函数、字符串或 Symbol 作为标识符。使用 Symbol 可以避免命名冲突。为了类型安全，可以使用 Branded Types 或泛型来将标识符与服务类型关联起来。

服务注册是 DI 容器的核心功能。可以注册类（容器自动实例化）、工厂函数（容器调用函数获取实例）、已存在的值（直接使用）。注册时需要指定生命周期：瞬态（每次获取创建新实例）、单例（整个容器只有一个实例）、请求作用域（每个请求一个实例）。

服务解析需要处理构造函数参数的依赖注入。在 TypeScript 中，通常使用装饰器（如 @injectable()、@inject()）来标记可注入的类和依赖。或者，也可以使用类型令牌（Type Token）模式，通过 reflect-metadata 库在运行时获取参数类型。

类型安全的 DI 容器可以在编译时检查依赖是否存在、是否类型正确。使用 TypeScript 的类型系统，可以实现一个类型安全的容器，在错误注入依赖时产生编译错误，而不是运行时错误。

## 八、容器类型

插件容器（Plugin Container）是整个插件系统的运行时环境。它负责管理插件的生命周期、提供宿主 API、协调插件间通信、维护 DI 容器。

容器类型应该封装所有插件管理的复杂性，对外提供简洁的 API。核心方法包括：register（注册插件）、init（初始化所有插件）、start（启动所有插件）、stop（停止所有插件）、getPlugin（获取指定插件实例）、getService（从 DI 容器获取服务）。

容器的启动顺序很重要：先加载插件，然后按依赖顺序初始化，最后启动。关闭时逆序停止。在类型层面，容器的状态可以使用可辨识联合来建模，防止在未初始化时调用启动方法等无效操作。

容器还应该提供错误隔离机制。一个插件的错误不应该导致整个系统崩溃。可以使用 try-catch 包裹每个插件的生命周期方法调用，并提供错误处理钩子让宿主决定如何处理错误。

沙箱机制是容器的高级特性，用于限制插件的能力，防止恶意或有 bug 的插件破坏系统。在 Web 环境中可以使用 iframe 或 Worker 实现沙箱，在 Node.js 中可以使用 vm 模块。TypeScript 的类型可以用来限制沙箱暴露给插件的 API。

通过本章的学习，你将掌握如何使用 TypeScript 设计和实现一个类型安全的插件化架构，包括插件接口、扩展点、Hook 系统、依赖注入容器等核心组件，构建可扩展、可维护的应用程序架构。`,
    code: `// ==================== 插件化架构 TypeScript 实现 ====================

// ---------- 类型工具 ----------
type Brand<T, B> = T & { readonly __brand: B };
type PluginId = Brand<string, 'PluginId'>;
type ExtensionPointName = Brand<string, 'ExtensionPoint'>;

const createPluginId = (id: string): PluginId => id as PluginId;
const createExtensionPoint = (name: string): ExtensionPointName => name as ExtensionPointName;

// ---------- 插件元数据与清单 ----------
interface PluginManifest {
  readonly id: PluginId;
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  readonly author?: string;
  readonly dependencies?: PluginId[];
  readonly apiVersion: string;
}

// ---------- 生命周期钩子 ----------
interface PluginLifecycle {
  install?(context: PluginContext): void | Promise<void>;
  activate?(context: PluginContext): void | Promise<void>;
  deactivate?(): void | Promise<void>;
  uninstall?(): void | Promise<void>;
}

// ---------- 扩展点定义 ----------
interface LoggerExtension {
  log(message: string, level?: 'info' | 'warn' | 'error'): void;
}

interface CommandExtension {
  name: string;
  execute(args: string[]): string | Promise<string>;
}

interface TransformExtension {
  transform(input: string): string;
}

interface ExtensionPoints {
  logger: LoggerExtension;
  commands: CommandExtension;
  transforms: TransformExtension;
}

// ---------- Hook 类型 ----------
type HookHandler<T = any> = (data: T) => T | Promise<T>;
type HookName = Brand<string, 'HookName'>;

interface HookSystem {
  register<T>(hook: HookName, handler: HookHandler<T>, priority?: number): void;
  dispatch<T>(hook: HookName, data: T): Promise<T>;
}

// ---------- 插件上下文 ----------
interface PluginContext {
  readonly api: HostApi;
  readonly logger: LoggerExtension;
  hooks: HookSystem;
  registerExtension<K extends keyof ExtensionPoints>(
    point: K,
    extension: ExtensionPoints[K]
  ): void;
  getService<T>(token: symbol): T | undefined;
}

// ---------- 宿主 API ----------
interface HostApi {
  readonly version: string;
  getPlugins(): PluginManifest[];
  getPlugin(id: PluginId): Plugin | undefined;
  queryExtensions<K extends keyof ExtensionPoints>(point: K): ExtensionPoints[K][];
}

// ---------- 插件基类 ----------
interface Plugin extends PluginLifecycle {
  readonly manifest: PluginManifest;
}

// ---------- 实现 Hook 系统 ----------
class AsyncHookSystem implements HookSystem {
  private handlers: Map<string, { handler: HookHandler; priority: number }[]> = new Map();

  register<T>(hook: HookName, handler: HookHandler<T>, priority: number = 100): void {
    const key = hook as string;
    if (!this.handlers.has(key)) {
      this.handlers.set(key, []);
    }
    this.handlers.get(key)!.push({ handler, priority });
    this.handlers.get(key)!.sort((a, b) => a.priority - b.priority);
  }

  async dispatch<T>(hook: HookName, data: T): Promise<T> {
    const key = hook as string;
    const handlers = this.handlers.get(key) || [];
    let result = data;
    for (const { handler } of handlers) {
      result = await handler(result);
    }
    return result;
  }
}

// ---------- DI 容器 ----------
type ServiceToken<T = any> = symbol & { __type?: T };

class DIContainer {
  private services: Map<symbol, { factory: () => any; instance?: any; lifecycle: 'singleton' | 'transient' }> = new Map();

  registerSingleton<T>(token: ServiceToken<T>, factory: () => T): void {
    this.services.set(token, { factory, lifecycle: 'singleton' });
  }

  registerInstance<T>(token: ServiceToken<T>, instance: T): void {
    this.services.set(token, { factory: () => instance, instance, lifecycle: 'singleton' });
  }

  registerTransient<T>(token: ServiceToken<T>, factory: () => T): void {
    this.services.set(token, { factory, lifecycle: 'transient' });
  }

  get<T>(token: ServiceToken<T>): T | undefined {
    const registration = this.services.get(token);
    if (!registration) return undefined;

    if (registration.lifecycle === 'singleton') {
      if (registration.instance === undefined) {
        registration.instance = registration.factory();
      }
      return registration.instance;
    }
    return registration.factory();
  }

  has(token: ServiceToken): boolean {
    return this.services.has(token);
  }
}

// ---------- 中间件组合 ----------
type Middleware<C> = (context: C, next: () => Promise<void>) => Promise<void>;

function composeMiddlewares<C>(middlewares: Middleware<C>[]): Middleware<C> {
  return async (context: C, finalNext: () => Promise<void>) => {
    let index = -1;
    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) throw new Error('next() called multiple times');
      index = i;
      if (i < middlewares.length) {
        await middlewares[i](context, () => dispatch(i + 1));
      } else {
        await finalNext();
      }
    };
    await dispatch(0);
  };
}

// ---------- 插件容器 ----------
type ContainerState = 'created' | 'initializing' | 'initialized' | 'starting' | 'running' | 'stopping' | 'stopped' | 'error';

class PluginContainer {
  private plugins: Map<PluginId, Plugin> = new Map();
  private extensions: Map<keyof ExtensionPoints, any[]> = new Map();
  private hooks: AsyncHookSystem = new AsyncHookSystem();
  private di: DIContainer = new DIContainer();
  private state: ContainerState = 'created';
  private middlewares: Middleware<any>[] = [];

  readonly hostApi: HostApi = {
    version: '1.0.0',
    getPlugins: () => Array.from(this.plugins.values()).map(p => p.manifest),
    getPlugin: (id: PluginId) => this.plugins.get(id),
    queryExtensions: <K extends keyof ExtensionPoints>(point: K) => {
      return (this.extensions.get(point) || []) as ExtensionPoints[K][];
    }
  };

  constructor() {
    (Object.keys({ logger: 0, commands: 0, transforms: 0 }) as (keyof ExtensionPoints)[])
      .forEach(point => this.extensions.set(point, []));
  }

  registerPlugin(plugin: Plugin): void {
    if (this.state !== 'created' && this.state !== 'initialized') {
      throw new Error(\`无法在 \${this.state} 状态下注册插件\`);
    }
    if (this.plugins.has(plugin.manifest.id)) {
      throw new Error(\`插件 \${plugin.manifest.id} 已注册\`);
    }
    this.plugins.set(plugin.manifest.id, plugin);
  }

  use(middleware: Middleware<any>): void {
    this.middlewares.push(middleware);
  }

  private createContext(plugin: Plugin): PluginContext {
    const defaultLogger: LoggerExtension = {
      log: (msg, level = 'info') => {
        const prefix = \`[\${plugin.manifest.name}]\`;
        const output = \`\${prefix} [\${level.toUpperCase()}] \${msg}\`;
        if (level === 'error') console.error(output);
        else if (level === 'warn') console.warn(output);
        else console.log(output);
      }
    };

    return {
      api: this.hostApi,
      logger: defaultLogger,
      hooks: this.hooks,
      registerExtension: (point, extension) => {
        const list = this.extensions.get(point);
        if (list) list.push(extension);
      },
      getService: <T>(token: symbol) => this.di.get<T>(token as ServiceToken<T>)
    };
  }

  private resolveLoadOrder(): Plugin[] {
    const visited = new Set<PluginId>();
    const result: Plugin[] = [];
    const visiting = new Set<PluginId>();

    const visit = (id: PluginId) => {
      if (visited.has(id)) return;
      if (visiting.has(id)) throw new Error(\`检测到循环依赖: \${String(id)}\`);

      const plugin = this.plugins.get(id);
      if (!plugin) throw new Error(\`依赖的插件不存在: \${String(id)}\`);

      visiting.add(id);
      (plugin.manifest.dependencies || []).forEach(depId => visit(depId));
      visiting.delete(id);
      visited.add(id);
      result.push(plugin);
    };

    this.plugins.forEach((_, id) => visit(id));
    return result;
  }

  async init(): Promise<void> {
    if (this.state !== 'created') throw new Error('容器已经初始化');
    this.state = 'initializing';

    try {
      const orderedPlugins = this.resolveLoadOrder();

      for (const plugin of orderedPlugins) {
        const ctx = this.createContext(plugin);
        if (plugin.install) {
          await plugin.install(ctx);
        }
      }

      this.state = 'initialized';
    } catch (e) {
      this.state = 'error';
      throw e;
    }
  }

  async start(): Promise<void> {
    if (this.state !== 'initialized') throw new Error('请先初始化容器');
    this.state = 'starting';

    try {
      const orderedPlugins = this.resolveLoadOrder();
      const pipeline = composeMiddlewares(this.middlewares);

      await pipeline({ container: this, stage: 'startup' }, async () => {
        for (const plugin of orderedPlugins) {
          const ctx = this.createContext(plugin);
          if (plugin.activate) {
            await plugin.activate(ctx);
          }
        }
      });

      this.state = 'running';
    } catch (e) {
      this.state = 'error';
      throw e;
    }
  }

  async stop(): Promise<void> {
    if (this.state !== 'running') return;
    this.state = 'stopping';

    try {
      const orderedPlugins = this.resolveLoadOrder().reverse();
      for (const plugin of orderedPlugins) {
        if (plugin.deactivate) {
          try {
            await plugin.deactivate();
          } catch (e) {
            console.error(\`插件 \${plugin.manifest.name} 停止时出错:\`, e);
          }
        }
      }
      this.state = 'stopped';
    } catch (e) {
      this.state = 'error';
      throw e;
    }
  }

  getHooks(): HookSystem { return this.hooks; }
  getDIContainer(): DIContainer { return this.di; }
  getState(): ContainerState { return this.state; }
  getExtensions<K extends keyof ExtensionPoints>(point: K): ExtensionPoints[K][] {
    return (this.extensions.get(point) || []) as ExtensionPoints[K][];
  }
}

// ---------- 创建具体插件 ----------
function createLoggerPlugin(): Plugin {
  return {
    manifest: {
      id: createPluginId('core-logger'),
      name: 'Logger Plugin',
      version: '1.0.0',
      description: '提供日志功能',
      apiVersion: '1.0.0'
    },
    install(ctx) {
      ctx.logger.log('Logger 插件安装中...');
    },
    activate(ctx) {
      ctx.logger.log('Logger 插件已激活');
      ctx.registerExtension('logger', ctx.logger);
    }
  };
}

function createCommandsPlugin(): Plugin {
  return {
    manifest: {
      id: createPluginId('core-commands'),
      name: 'Commands Plugin',
      version: '1.0.0',
      dependencies: [createPluginId('core-logger')],
      apiVersion: '1.0.0'
    },
    activate(ctx) {
      ctx.logger.log('注册命令...');
      ctx.registerExtension('commands', {
        name: 'hello',
        execute: (args) => \`Hello, \${args.join(' ') || 'World'}!\`
      });
      ctx.registerExtension('commands', {
        name: 'echo',
        execute: async (args) => {
          await new Promise(r => setTimeout(r, 10));
          return args.join(' ');
        }
      });
    }
  };
}

function createTransformPlugin(): Plugin {
  return {
    manifest: {
      id: createPluginId('text-transforms'),
      name: 'Text Transforms',
      version: '1.0.0',
      dependencies: [createPluginId('core-logger')],
      apiVersion: '1.0.0'
    },
    activate(ctx) {
      ctx.registerExtension('transforms', {
        transform: (input) => input.toUpperCase()
      });
      ctx.registerExtension('transforms', {
        transform: (input) => input.split('').reverse().join('')
      });
      ctx.hooks.register(
        createExtensionPoint('text:transform') as unknown as HookName,
        (text: string) => text.trim(),
        10
      );
      ctx.logger.log('文本转换插件已激活');
    }
  };
}

// ---------- 运行演示 ----------
async function runDemo() {
  console.log('=== 🧩 插件化架构演示 ===\\n');

  const container = new PluginContainer();

  // 注册中间件（错误隔离）
  container.use(async (ctx, next) => {
    const start = Date.now();
    console.log(\`🔄 中间件: \${ctx.stage} 开始\`);
    try {
      await next();
      console.log(\`✅ 中间件: \${ctx.stage} 完成 (耗时 \${Date.now() - start}ms)\`);
    } catch (e) {
      console.error(\`❌ 中间件捕获错误:\`, e);
      throw e;
    }
  });

  // 注册服务
  const TOKENS = {
    Config: Symbol('Config') as ServiceToken<{ env: string; debug: boolean }>,
    Clock: Symbol('Clock') as ServiceToken<{ now: () => Date }>
  };

  container.getDIContainer().registerInstance(TOKENS.Config, { env: 'development', debug: true });
  container.getDIContainer().registerSingleton(TOKENS.Clock, () => ({ now: () => new Date() }));

  // 注册插件
  console.log('📦 注册插件...');
  container.registerPlugin(createLoggerPlugin());
  container.registerPlugin(createCommandsPlugin());
  container.registerPlugin(createTransformPlugin());
  console.log('已注册插件数量:', container.hostApi.getPlugins().length);

  // 初始化
  console.log('\\n⚙️ 初始化容器...');
  await container.init();
  console.log('容器状态:', container.getState());

  // 启动
  console.log('\\n🚀 启动容器...');
  await container.start();
  console.log('容器状态:', container.getState());

  // 列出已加载插件
  console.log('\\n📋 已加载插件:');
  container.hostApi.getPlugins().forEach(p => {
    console.log(\`  - \${p.name} v\${p.version} (\${String(p.id)})\`);
  });

  // 测试命令扩展
  console.log('\\n⌨️ 命令扩展测试:');
  const commands = container.getExtensions('commands');
  for (const cmd of commands) {
    const result = await cmd.execute(cmd.name === 'hello' ? ['TypeScript'] : ['Plugin', 'System']);
    console.log(\`  /\${cmd.name}: \${result}\`);
  }

  // 测试转换扩展
  console.log('\\n🔄 转换扩展测试:');
  const transforms = container.getExtensions('transforms');
  const testText = '  Hello Plugin  ';
  console.log(\`  原始文本: "\${testText}"\`);
  for (const t of transforms) {
    console.log(\`  转换后: "\${t.transform(testText)}"\`);
  }

  // 测试 Hook
  console.log('\\n🪝 Hook 系统测试:');
  const hooks = container.getHooks();
  hooks.register(
    createExtensionPoint('text:transform') as unknown as HookName,
    (text: string) => text.replace(/\\s+/g, '-'),
    200
  );
  const hookResult = await hooks.dispatch(
    createExtensionPoint('text:transform') as unknown as HookName,
    testText
  );
  console.log(\`  Hook 管道处理结果: "\${hookResult}"\`);

  // 测试 DI
  console.log('\\n💉 依赖注入测试:');
  const config = container.getDIContainer().get(TOKENS.Config);
  const clock = container.getDIContainer().get(TOKENS.Clock);
  console.log('  Config:', JSON.stringify(config));
  console.log('  Clock now:', clock?.now().toISOString());

  // Logger 扩展
  console.log('\\n📝 Logger 扩展:');
  const loggers = container.getExtensions('logger');
  loggers.forEach(l => l.log('这是来自插件日志系统的消息', 'info'));

  // 停止容器
  console.log('\\n🛑 停止容器...');
  await container.stop();
  console.log('容器状态:', container.getState());

  console.log('\\n✅ 插件架构演示完成');
}

runDemo().catch(console.error);
`
  },
  {
    id: "ts3-runtime-type-safety",
    title: "运行时类型安全",
    icon: "🛡️",
    group: "架构与实战",
    content: `# 运行时类型安全

TypeScript 提供了强大的编译时类型检查，但 JavaScript 运行时并不了解类型。当数据从外部边界（API 响应、表单输入、localStorage、环境变量、文件读取等）进入系统时，编译时类型无法保证这些数据确实符合我们的类型定义。运行时类型安全（Runtime Type Safety）填补了这一空白，确保在程序运行时验证数据的形状和类型。

## 一、为什么需要运行时类型安全

TypeScript 的类型在编译后会被完全擦除，这意味着任何在编译时看起来类型正确的代码，在运行时如果接收到不符合预期的数据，就可能出错。这种风险在以下场景尤为突出：

API 调用：后端返回的数据结构可能与前端定义的类型不一致。后端可能修改字段名、更改字段类型、返回额外字段或缺少字段。没有运行时检查，这些问题会导致难以追踪的 bug。

表单输入：用户输入永远是不可信的。即使用了 HTML 表单验证，用户仍可能通过开发者工具绕过。表单数据需要在服务端和客户端都进行验证。

环境变量：process.env 中的值始终是 string 或 undefined，但配置可能需要 number、boolean 或复杂对象。启动时验证环境变量可以避免应用在运行中因配置错误而崩溃。

消息队列/WebSocket：通过消息传递的数据其结构可能随时间变化。消息生产者和消费者可能部署在不同时间，版本不一致会导致数据格式不匹配。

"Parse, Don't Validate" 是运行时类型安全的核心理念：与其仅仅检查数据是否合法（validate）然后继续使用原始数据，不如将未知数据解析（parse）为类型良好的值，解析过程本身就完成了验证。如果解析成功，你得到的就是一个类型安全的值；如果失败，你会得到明确的错误信息。

## 二、Schema 设计原理

Schema 是数据结构的运行时描述。一个好的 Schema 库应该：能够描述任意的 TypeScript 类型、能够从 Schema 自动推导出 TypeScript 类型、提供详细的错误信息、支持转换和转换（coercion/transformation）、支持组合和复用。

Schema 可以表示原始类型（string、number、boolean、null、undefined）、复杂类型（array、object、tuple、union、intersection）以及各种约束（最小/最大长度、正则匹配、枚举值等）。

在设计 Schema 库时，核心数据结构是一个 Schema 类或接口，它包含一个 parse 方法（或 safeParse 方法）用于将未知数据解析为目标类型。每个具体的 Schema 类型（如 StringSchema、NumberSchema）继承自基础 Schema 并实现特定的解析逻辑。

方法链（Method Chaining）是 Schema 库常见的 API 设计，如 z.string().min(3).max(20).email()。每个方法返回 this 或新的 Schema 实例，允许以声明式的方式组合约束。

## 三、Schema-to-Type 推断

Schema 到 TypeScript 类型的推断是类型安全的关键。在 TypeScript 中，可以使用 infer 关键字和条件类型来从 Schema 实例类型中提取出它解析成功后返回的 TypeScript 类型。

每个 Schema 实例应该有一个"输出类型"的幻影类型（phantom type）参数。例如 ZodType<Output> 中的 Output 类型参数表示 parse 成功时返回的类型。使用 infer 关键字可以提取这个类型参数，这就是 z.infer 的实现原理。

对于对象 Schema，需要将每个属性的 Schema 的输出类型映射出来：{ [K in keyof T]: Infer<T[K]> }。对于数组 Schema，输出类型是 Infer<ElementSchema>[]。对于联合类型，输出类型是各成员类型的联合。

类型推断需要考虑可选属性和默认值。可选属性（.optional()）输出 T | undefined；有默认值的 Schema（.default(value)）输出非可选的 T，因为即使输入缺失也会使用默认值。

## 四、类型守卫与边界保护

类型守卫（Type Guard）是 TypeScript 中返回 boolean 并使用 type predicate 的函数，如 (x: unknown): x is string => typeof x === 'string'。类型守卫在 if 块中窄化（narrow）变量的类型。

在系统边界处（如 API 客户端、数据库访问层、消息处理器），应该始终使用 Schema 解析而不是类型断言。类型断言（as SomeType）只是告诉编译器"相信我，这是 SomeType"，但它不进行任何运行时检查，等同于掩耳盗铃。

一个好的实践是在每个系统入口点设置"类型防火墙"：所有进入系统的外部数据都必须通过 Schema 解析，解析失败则立即拒绝并返回明确的错误。这样可以将类型错误尽早捕获在边界处，而不是让它们传播到系统内部导致难以定位的运行时错误。

is 类型守卫（is method）是 Schema 提供的一个便捷方法，它返回一个类型守卫函数。这在需要对已有数据进行检查（而不是解析转换）时很有用，例如在 Array.filter 中过滤出特定类型的元素。

## 五、品牌类型与运行时验证结合

品牌类型（Branded Types）在编译时区分相同基础类型的不同语义，而 Schema 验证在运行时确保数据符合约束。将两者结合可以实现从边界到核心的完整类型安全。

例如，EmailAddress 类型在编译时是 branded string，在运行时通过 email Schema 验证。这意味着：在系统内部，任何需要 EmailAddress 的地方不能传入普通 string（编译时错误）；任何从外部进入系统的 email 都必须通过 Schema 验证才能成为 EmailAddress（运行时保障）。

实现方式是让 Schema 的 parse 方法返回带品牌的类型。例如 email Schema parse 成功后返回的不是 string，而是 EmailAddress 类型。还可以提供 refine 或 brand 方法让用户为 Schema 添加自定义品牌标记。

## 六、表单与 API 输入验证

表单验证是运行时类型安全最常见的应用场景。表单数据通常具有以下特点：所有输入都是字符串（即使是数字字段）、需要友好的错误信息、可能需要异步验证（如检查用户名是否已存在）、可能涉及字段间的依赖验证（如确认密码必须与密码相同）。

API 输入验证与表单验证类似，但更关注数据结构的正确性。一个良好实践是：每个 API 端点都有对应的请求 Schema 和响应 Schema；请求在处理前被解析和验证；响应在发送前也被验证（防止意外泄露或返回错误数据）。

联合类型和可辨识联合在 API 验证中非常有用。例如，一个搜索 API 的响应可能是成功结果或错误结果，两者有不同的结构。使用可辨识联合的 Schema 可以正确解析和 narrow 这两种情况。

Schema 转换（transform）在表单处理中非常有用。例如，将字符串 "1990-01-01" 转换为 Date 对象，将字符串 "true"/"false" 转换为 boolean，将字符串数字转换为 number。这样解析后得到的就是业务逻辑直接可用的正确类型，而不是需要后续手动转换的原始字符串。

## 七、环境变量与配置验证

应用配置是另一个运行时验证的关键场景。配置错误可能导致应用在启动后运行不正常，且难以排查。启动时验证所有配置可以在应用接收流量之前就发现问题。

环境变量的特点是：所有值都是 string | undefined，但可能需要解析为 number、boolean、URL、甚至复杂对象。常见的转换规则：PORT 需要解析为 number，DEBUG 需要解析为 boolean，DATABASE_URL 需要解析为 URL 对象并验证格式，FEATURE_FLAGS 可能需要解析为 Record<string, boolean>。

配置 Schema 通常使用 coerce 选项来自动进行类型转换。例如，将 env 中的 string "3000" 自动转换为 number 3000，将 "true" 转换为 boolean true。转换后再进行范围检查，如端口号必须在 1-65535 之间。

## 八、错误处理与报告

好的 Schema 库应该提供友好、详细的错误信息。错误信息应该指明哪个字段出了问题、期望什么类型、实际收到了什么值、问题出在路径的哪个位置。

错误路径（path）对于嵌套对象和数组尤其重要。例如，address.city 字段的错误应该报告路径为 ["address", "city"]，数组中第 3 个元素的 name 字段错误路径为 ["users", 2, "name"]。

联合类型的错误处理比较复杂。当验证联合类型时，可能每个成员都有一些错误，需要决定如何报告：是报告所有成员的错误，还是报告"最接近"的那个成员的错误？Zod 的策略是报告导致错误最少的那个成员的错误，这提供了更好的开发体验。

安全解析（safeParse）vs 抛出错误：parse 方法在验证失败时抛出异常，适用于快速失败的场景；safeParse 返回 { success: true, data: T } 或 { success: false, error: ValidationError }，适用于需要优雅处理错误的场景（如表单验证显示错误消息）。

本章将实现一个迷你的 Zod 风格验证库，涵盖上述核心概念，并展示如何在实际项目中应用运行时类型安全。`,
    code: `// ==================== 运行时类型安全：迷你 Zod 实现 ====================

// ---------- 工具类型 ----------
type Brand<T, B> = T & { readonly __brand: B };

// ---------- Schema 类型基础 ----------
type Infer<T> = T extends Schema<infer U> ? U : never;

type ValidationIssue = {
  path: (string | number)[];
  message: string;
  expected: string;
  received: string;
};

class ValidationError extends Error {
  public readonly issues: ValidationIssue[];

  constructor(issues: ValidationIssue[]) {
    super(\`验证失败: \${issues.length} 个错误\\n\` +
      issues.map(i => \`  - \${i.path.length > 0 ? i.path.join('.') + ': ' : ''}\${i.message}\`).join('\\n'));
    this.name = 'ValidationError';
    this.issues = issues;
  }
}

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: ValidationError };

// ---------- 基础 Schema 类 ----------
abstract class Schema<T> {
  readonly _type!: T;
  protected _optional = false;
  protected _nullable = false;
  protected _defaultValue?: T;
  protected _refinements: Array<{ check: (val: T) => boolean; message: string }> = [];

  abstract _parse(input: unknown, path: (string | number)[]): ParseResult<T>;

  parse(input: unknown): T {
    const result = this.safeParse(input);
    if (!result.success) throw result.error;
    return result.data;
  }

  safeParse(input: unknown): ParseResult<T> {
    let result: ParseResult<T>;

    if (input === undefined && this._defaultValue !== undefined) {
      result = { success: true, data: this._defaultValue };
    } else if (input === undefined && this._optional) {
      result = { success: true, data: undefined as T };
    } else if (input === null && this._nullable) {
      result = { success: true, data: null as T };
    } else if ((input === undefined && !this._optional) || (input === null && !this._nullable)) {
      result = {
        success: false,
        error: new ValidationError([{
          path: [],
          message: input === undefined ? '必填字段缺失' : '不能为 null',
          expected: this._optional ? 'T | undefined' : this._nullable ? 'T | null' : 'T',
          received: String(input)
        }])
      };
    } else {
      result = this._parse(input, []);
    }

    if (result.success) {
      for (const refinement of this._refinements) {
        if (!refinement.check(result.data)) {
          return {
            success: false,
            error: new ValidationError([{
              path: [],
              message: refinement.message,
              expected: 'refinement passed',
              received: String(result.data)
            }])
          };
        }
      }
    }

    return result;
  }

  is(input: unknown): input is T {
    return this.safeParse(input).success;
  }

  optional(): Schema<T | undefined> {
    const clone = Object.create(Object.getPrototypeOf(this)) as Schema<T | undefined>;
    Object.assign(clone, this);
    clone._optional = true;
    return clone;
  }

  nullable(): Schema<T | null> {
    const clone = Object.create(Object.getPrototypeOf(this)) as Schema<T | null>;
    Object.assign(clone, this);
    clone._nullable = true;
    return clone;
  }

  default(val: T): Schema<T> {
    const clone = Object.create(Object.getPrototypeOf(this)) as Schema<T>;
    Object.assign(clone, this);
    clone._defaultValue = val;
    clone._optional = true;
    return clone;
  }

  refine(check: (val: T) => boolean, message: string): Schema<T> {
    const clone = Object.create(Object.getPrototypeOf(this)) as Schema<T>;
    Object.assign(clone, this);
    clone._refinements = [...this._refinements, { check, message }];
    return clone;
  }

  transform<U>(fn: (val: T) => U): Schema<U> {
    return new TransformSchema(this, fn);
  }

  brand<B extends string>(brandName: B): Schema<Brand<T, B>> {
    return this as unknown as Schema<Brand<T, B>>;
  }
}

// ---------- String Schema ----------
class StringSchema extends Schema<string> {
  private _min?: number;
  private _max?: number;
  private _regex?: RegExp;
  private _email = false;
  private _url = false;
  private _coerce = false;

  _parse(input: unknown, path: (string | number)[]): ParseResult<string> {
    let val = input;
    if (this._coerce && typeof val !== 'string') {
      val = String(val);
    }
    if (typeof val !== 'string') {
      return {
        success: false,
        error: new ValidationError([{
          path, message: '期望是字符串', expected: 'string', received: typeof input
        }])
      };
    }
    const issues: ValidationIssue[] = [];
    if (this._min !== undefined && val.length < this._min) {
      issues.push({ path, message: \`字符串长度不能少于 \${this._min}\`, expected: \`min: \${this._min}\`, received: \`length: \${val.length}\` });
    }
    if (this._max !== undefined && val.length > this._max) {
      issues.push({ path, message: \`字符串长度不能超过 \${this._max}\`, expected: \`max: \${this._max}\`, received: \`length: \${val.length}\` });
    }
    if (this._regex && !this._regex.test(val)) {
      issues.push({ path, message: '字符串格式不正确', expected: this._regex.toString(), received: val });
    }
    if (this._email && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(val)) {
      issues.push({ path, message: '邮箱格式不正确', expected: 'email', received: val });
    }
    if (this._url) {
      try { new URL(val); } catch { issues.push({ path, message: 'URL 格式不正确', expected: 'url', received: val }); }
    }
    if (issues.length > 0) return { success: false, error: new ValidationError(issues) };
    return { success: true, data: val };
  }

  min(n: number) { this._min = n; return this; }
  max(n: number) { this._max = n; return this; }
  length(n: number) { this._min = n; this._max = n; return this; }
  regex(r: RegExp) { this._regex = r; return this; }
  email() { this._email = true; return this; }
  url() { this._url = true; return this; }
  coerce() { this._coerce = true; return this; }
}

// ---------- Number Schema ----------
class NumberSchema extends Schema<number> {
  private _min?: number;
  private _max?: number;
  private _int = false;
  private _positive = false;
  private _coerce = false;

  _parse(input: unknown, path: (string | number)[]): ParseResult<number> {
    let val = input;
    if (this._coerce && typeof val === 'string') {
      const parsed = Number(val);
      if (!isNaN(parsed)) val = parsed;
    }
    if (typeof val !== 'number' || isNaN(val)) {
      return {
        success: false,
        error: new ValidationError([{
          path, message: '期望是数字', expected: 'number', received: String(input)
        }])
      };
    }
    const issues: ValidationIssue[] = [];
    if (this._int && !Number.isInteger(val)) {
      issues.push({ path, message: '期望是整数', expected: 'integer', received: String(val) });
    }
    if (this._min !== undefined && val < this._min) {
      issues.push({ path, message: \`数字不能小于 \${this._min}\`, expected: \`>= \${this._min}\`, received: String(val) });
    }
    if (this._max !== undefined && val > this._max) {
      issues.push({ path, message: \`数字不能大于 \${this._max}\`, expected: \`<= \${this._max}\`, received: String(val) });
    }
    if (this._positive && val <= 0) {
      issues.push({ path, message: '必须是正数', expected: 'positive', received: String(val) });
    }
    if (issues.length > 0) return { success: false, error: new ValidationError(issues) };
    return { success: true, data: val };
  }

  min(n: number) { this._min = n; return this; }
  max(n: number) { this._max = n; return this; }
  int() { this._int = true; return this; }
  positive() { this._positive = true; return this; }
  coerce() { this._coerce = true; return this; }
}

// ---------- Boolean Schema ----------
class BooleanSchema extends Schema<boolean> {
  private _coerce = false;

  _parse(input: unknown, path: (string | number)[]): ParseResult<boolean> {
    let val = input;
    if (this._coerce) {
      if (val === 'true' || val === '1' || val === 1) val = true;
      else if (val === 'false' || val === '0' || val === 0) val = false;
    }
    if (typeof val !== 'boolean') {
      return {
        success: false,
        error: new ValidationError([{
          path, message: '期望是布尔值', expected: 'boolean', received: typeof input
        }])
      };
    }
    return { success: true, data: val };
  }

  coerce() { this._coerce = true; return this; }
}

// ---------- Object Schema ----------
type ObjectShape = Record<string, Schema<any>>;
type InferObject<S extends ObjectShape> = { [K in keyof S]: Infer<S[K]> };

class ObjectSchema<S extends ObjectShape> extends Schema<InferObject<S>> {
  private _strict = false;

  constructor(private shape: S) { super(); }

  _parse(input: unknown, path: (string | number)[]): ParseResult<InferObject<S>> {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      return {
        success: false,
        error: new ValidationError([{
          path, message: '期望是对象', expected: 'object', received: input === null ? 'null' : typeof input
        }])
      };
    }
    const obj = input as Record<string, unknown>;
    const result: Record<string, any> = {};
    const issues: ValidationIssue[] = [];
    const keys = new Set([...Object.keys(this.shape), ...Object.keys(obj)]);

    for (const key of keys) {
      const schema = this.shape[key];
      const val = obj[key];

      if (!schema) {
        if (this._strict) {
          issues.push({ path: [...path, key], message: '不允许额外字段', expected: 'known key', received: key });
        }
        continue;
      }

      const fieldResult = schema.safeParse(val);
      if (fieldResult.success) {
        if (!(val === undefined && !(key in this.shape) && !(key in obj))) {
          result[key] = fieldResult.data;
        }
      } else {
        issues.push(...fieldResult.error.issues.map(i => ({
          ...i,
          path: [...path, key, ...i.path]
        })));
      }
    }

    if (issues.length > 0) return { success: false, error: new ValidationError(issues) };
    return { success: true, data: result as InferObject<S> };
  }

  strict() { this._strict = true; return this; }

  extend<E extends ObjectShape>(extra: E): ObjectSchema<S & E> {
    return new ObjectSchema({ ...this.shape, ...extra });
  }

  pick<K extends keyof S>(keys: K[]): ObjectSchema<Pick<S, K>> {
    const newShape = {} as Pick<S, K>;
    keys.forEach(k => { (newShape as any)[k] = this.shape[k]; });
    return new ObjectSchema(newShape);
  }
}

// ---------- Array Schema ----------
class ArraySchema<T> extends Schema<T[]> {
  constructor(private itemSchema: Schema<T>) { super(); }
  private _min?: number;
  private _max?: number;

  _parse(input: unknown, path: (string | number)[]): ParseResult<T[]> {
    if (!Array.isArray(input)) {
      return {
        success: false,
        error: new ValidationError([{
          path, message: '期望是数组', expected: 'array', received: typeof input
        }])
      };
    }
    const issues: ValidationIssue[] = [];
    const result: T[] = [];
    for (let i = 0; i < input.length; i++) {
      const itemResult = this.itemSchema.safeParse(input[i]);
      if (itemResult.success) {
        result.push(itemResult.data);
      } else {
        issues.push(...itemResult.error.issues.map(iss => ({
          ...iss,
          path: [...path, i, ...iss.path]
        })));
      }
    }
    if (this._min !== undefined && input.length < this._min) {
      issues.push({ path, message: \`数组长度不能少于 \${this._min}\`, expected: \`min: \${this._min}\`, received: \`length: \${input.length}\` });
    }
    if (this._max !== undefined && input.length > this._max) {
      issues.push({ path, message: \`数组长度不能超过 \${this._max}\`, expected: \`max: \${this._max}\`, received: \`length: \${input.length}\` });
    }
    if (issues.length > 0) return { success: false, error: new ValidationError(issues) };
    return { success: true, data: result };
  }

  min(n: number) { this._min = n; return this; }
  max(n: number) { this._max = n; return this; }
}

// ---------- Union Schema ----------
class UnionSchema<T extends Schema<any>[]> extends Schema<Infer<T[number]>> {
  constructor(private schemas: T) { super(); }

  _parse(input: unknown, path: (string | number)[]): ParseResult<Infer<T[number]>> {
    const allIssues: ValidationIssue[][] = [];
    for (const schema of this.schemas) {
      const result = schema.safeParse(input);
      if (result.success) return result as ParseResult<Infer<T[number]>>;
      allIssues.push(result.error.issues);
    }
    const minIssues = allIssues.reduce((min, cur) => cur.length < min.length ? cur : min);
    return {
      success: false,
      error: new ValidationError(minIssues.map(i => ({ ...i, path: [...path, ...i.path] })))
    };
  }
}

// ---------- Enum Schema ----------
class EnumSchema<T extends string | number> extends Schema<T> {
  constructor(private values: readonly T[]) { super(); }

  _parse(input: unknown, path: (string | number)[]): ParseResult<T> {
    if (!this.values.includes(input as T)) {
      return {
        success: false,
        error: new ValidationError([{
          path,
          message: \`值必须是 [\${this.values.join(', ')}] 之一\`,
          expected: this.values.join(' | '),
          received: String(input)
        }])
      };
    }
    return { success: true, data: input as T };
  }
}

// ---------- Transform Schema ----------
class TransformSchema<I, O> extends Schema<O> {
  constructor(private inner: Schema<I>, private fn: (val: I) => O) { super(); }

  _parse(input: unknown, path: (string | number)[]): ParseResult<O> {
    const result = this.inner.safeParse(input);
    if (!result.success) return { success: false, error: new ValidationError(result.error.issues.map(i => ({ ...i, path: [...path, ...i.path] }))) };
    try {
      return { success: true, data: this.fn(result.data) };
    } catch (e: any) {
      return {
        success: false,
        error: new ValidationError([{ path, message: \`转换失败: \${e.message}\`, expected: 'transformable', received: String(result.data) }])
      };
    }
  }
}

// ---------- Literal Schema ----------
class LiteralSchema<T extends string | number | boolean | null> extends Schema<T> {
  constructor(private value: T) { super(); }

  _parse(input: unknown, path: (string | number)[]): ParseResult<T> {
    if (input !== this.value) {
      return {
        success: false,
        error: new ValidationError([{
          path,
          message: \`期望字面量值 \${String(this.value)}\`,
          expected: String(this.value),
          received: String(input)
        }])
      };
    }
    return { success: true, data: this.value };
  }
}

// ---------- Recursive Schema 辅助 ----------
function lazy<T>(fn: () => Schema<T>): Schema<T> {
  let cached: Schema<T> | undefined;
  const getSchema = () => {
    if (!cached) cached = fn();
    return cached;
  };
  return new (class extends Schema<T> {
    _parse(input: unknown, path: (string | number)[]): ParseResult<T> {
      return getSchema()._parse(input, path) as ParseResult<T>;
    }
  })();
}

// ---------- v 对象（API 入口） ----------
const v = {
  string: () => new StringSchema(),
  number: () => new NumberSchema(),
  boolean: () => new BooleanSchema(),
  object: <S extends ObjectShape>(shape: S) => new ObjectSchema(shape),
  array: <T>(item: Schema<T>) => new ArraySchema(item),
  union: <T extends Schema<any>[]>(...schemas: T) => new UnionSchema(schemas),
  enum: <T extends string | number>(values: readonly T[]) => new EnumSchema(values),
  literal: <T extends string | number | boolean | null>(val: T) => new LiteralSchema(val),
  lazy,
  infer: ({} as any) as <S extends Schema<any>>(s: S) => Infer<S>
};

// ---------- 运行演示 ----------
console.log('=== 🛡️ 运行时类型安全验证演示 ===\\n');

// 1. 基础类型验证
console.log('📝 基础类型验证:');
try {
  v.string().parse('hello');
  console.log('  ✅ string().parse("hello") 通过');
} catch (e) { console.log('  ❌', (e as Error).message); }

const strResult = v.string().safeParse(123);
if (!strResult.success) {
  console.log('  ❌ string().safeParse(123) 失败:', strResult.error.issues[0].message);
}

// 2. 字符串约束
console.log('\\n🔤 字符串约束:');
const usernameSchema = v.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/);
console.log('  valid_user123:', usernameSchema.safeParse('valid_user123').success ? '✅' : '❌');
console.log('  ab:', usernameSchema.safeParse('ab').success ? '✅' : '❌ 太短');
console.log('  has-dash:', usernameSchema.safeParse('has-dash').success ? '✅' : '❌ 含非法字符');

// 3. 邮箱验证
console.log('\\n📧 邮箱验证:');
const emailSchema = v.string().email().brand<'Email'>('Email');
type Email = Infer<typeof emailSchema>;
const emailResult = emailSchema.safeParse('user@example.com');
console.log('  user@example.com:', emailResult.success ? '✅' : '❌');
const badEmail = emailSchema.safeParse('not-an-email');
if (!badEmail.success) console.log('  not-an-email: ❌', badEmail.error.issues[0].message);

// 4. 数字验证 + coerce
console.log('\\n🔢 数字验证:');
const ageSchema = v.number().int().min(0).max(150).coerce();
console.log('  25:', ageSchema.safeParse(25).success ? '✅' : '❌');
console.log('  "30" (coerce):', ageSchema.safeParse('30').success ? '✅ 转换为数字' : '❌');
console.log('  200:', ageSchema.safeParse(200).success ? '✅' : '❌ 超出范围');

// 5. 对象验证
console.log('\\n📦 对象验证:');
const UserSchema = v.object({
  id: v.number().int().positive(),
  name: v.string().min(1),
  email: v.string().email(),
  age: v.number().int().min(0).max(150).optional(),
  role: v.enum(['admin', 'user', 'guest'] as const)
});
type User = Infer<typeof UserSchema>;

const validUser = { id: 1, name: '张三', email: 'zhang@example.com', age: 28, role: 'admin' };
const userResult = UserSchema.safeParse(validUser);
console.log('  有效用户:', userResult.success ? '✅' : '❌');

const invalidUser = { id: -1, name: '', email: 'bad-email', role: 'superadmin' };
const badUserResult = UserSchema.safeParse(invalidUser);
if (!badUserResult.success) {
  console.log('  无效用户 ❌ 错误数:', badUserResult.error.issues.length);
  badUserResult.error.issues.forEach(i => {
    console.log(\`    - \${i.path.join('.')}: \${i.message}\`);
  });
}

// 6. 嵌套对象
console.log('\\n🪆 嵌套对象验证:');
const AddressSchema = v.object({
  street: v.string().min(1),
  city: v.string().min(1),
  zipCode: v.string().regex(/^\\d{5,6}$/)
});
const OrderSchema = v.object({
  orderId: v.string().min(1),
  items: v.array(v.object({
    productId: v.string(),
    quantity: v.number().int().positive()
  })).min(1),
  shippingAddress: AddressSchema
});
type Order = Infer<typeof OrderSchema>;

const validOrder = {
  orderId: 'ORD-001',
  items: [{ productId: 'P1', quantity: 2 }, { productId: 'P2', quantity: 1 }],
  shippingAddress: { street: '中关村1号', city: '北京', zipCode: '100080' }
};
console.log('  有效订单:', OrderSchema.safeParse(validOrder).success ? '✅' : '❌');

// 7. 数组验证
console.log('\\n📚 数组验证:');
const tagsSchema = v.array(v.string().min(1).max(20)).min(1).max(5);
console.log('  ["js","ts"]:', tagsSchema.safeParse(['js', 'ts']).success ? '✅' : '❌');
console.log('  []:', tagsSchema.safeParse([]).success ? '✅' : '❌ 空数组');
console.log('  ["", "ok"]:', tagsSchema.safeParse(['', 'ok']).success ? '✅' : '❌ 含空字符串');

// 8. Union / 联合类型
console.log('\\n🔀 联合类型验证:');
const StringOrNumber = v.union(v.string(), v.number());
console.log('  "hello":', StringOrNumber.safeParse('hello').success ? '✅' : '❌');
console.log('  42:', StringOrNumber.safeParse(42).success ? '✅' : '❌');
console.log('  true:', StringOrNumber.safeParse(true).success ? '✅' : '❌');

// 9. Transform
console.log('\\n🔄 转换 (Transform):');
const DateSchema = v.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/).transform(s => new Date(s));
const dateResult = DateSchema.safeParse('2024-06-15');
if (dateResult.success) console.log('  "2024-06-15" 转换为 Date:', dateResult.data.toISOString().split('T')[0], '✅');

// 10. 环境变量验证
console.log('\\n⚙️ 环境变量验证:');
const EnvSchema = v.object({
  PORT: v.number().int().min(1).max(65535).coerce().default(3000),
  NODE_ENV: v.enum(['development', 'production', 'test'] as const).default('development'),
  DEBUG: v.boolean().coerce().default(false),
  DATABASE_URL: v.string().url()
});

const env = {
  PORT: '4000',
  NODE_ENV: 'development',
  DEBUG: 'true',
  DATABASE_URL: 'postgres://localhost:5432/mydb'
};
const envResult = EnvSchema.safeParse(env);
if (envResult.success) {
  console.log('  解析后配置:');
  console.log(\`    PORT: \${envResult.data.PORT} (类型: \${typeof envResult.data.PORT})\`);
  console.log(\`    NODE_ENV: \${envResult.data.NODE_ENV}\`);
  console.log(\`    DEBUG: \${envResult.data.DEBUG} (类型: \${typeof envResult.data.DEBUG})\`);
  console.log(\`    DATABASE_URL: \${envResult.data.DATABASE_URL} ✅\`);
}

// 11. 默认值
console.log('\\n📋 默认值测试:');
const ConfigSchema = v.object({
  pageSize: v.number().int().min(1).max(100).default(20),
  timeout: v.number().positive().default(5000)
});
const partialConfig = { pageSize: 50 };
const configResult = ConfigSchema.parse(partialConfig);
console.log(\`  输入 pageSize=50, timeout 使用默认值: timeout=\${configResult.timeout} ✅\`);

// 12. 类型守卫
console.log('\\n🛡️ 类型守卫 (is):');
const isEmail = (val: unknown): val is Email => emailSchema.is(val);
console.log('  isEmail("bad"):', isEmail('bad'));
console.log('  isEmail("a@b.c"):', isEmail('a@b.c'));

// 13. 递归类型 (Category 树)
console.log('\\n🌳 递归类型验证:');
interface Category {
  name: string;
  children?: Category[];
}
const CategorySchema: Schema<Category> = v.lazy(() =>
  v.object({
    name: v.string().min(1),
    children: v.array(CategorySchema).optional()
  })
);
const tree = {
  name: 'Root',
  children: [
    { name: 'Child1', children: [{ name: 'Grandchild1' }] },
    { name: 'Child2' }
  ]
};
console.log('  分类树:', CategorySchema.safeParse(tree).success ? '✅ 通过' : '❌');

// 14. Refine
console.log('\\n✨ 自定义校验 (refine):');
const PasswordSchema = v.string().min(8).refine(
  p => /[A-Z]/.test(p),
  '密码必须包含至少一个大写字母'
).refine(
  p => /[0-9]/.test(p),
  '密码必须包含至少一个数字'
);
const pwGood = PasswordSchema.safeParse('Password123');
const pwBad = PasswordSchema.safeParse('password');
console.log('  "Password123":', pwGood.success ? '✅' : '❌');
if (!pwBad.success) console.log('  "password": ❌', pwBad.error.issues[0].message);

console.log('\\n✅ 运行时类型安全演示完成');
`
  },
  {
    id: "ts3-event-driven-architecture",
    title: "事件驱动架构",
    icon: "📡",
    group: "架构与实战",
    content: `# 事件驱动架构

事件驱动架构（Event-Driven Architecture，EDA）是一种软件架构模式，其中系统组件之间通过事件的发出和响应进行通信，而不是通过直接的同步调用。EDA 提供了松耦合、高可扩展性、异步处理、实时响应等优势，是现代分布式系统和微服务架构的核心模式之一。TypeScript 的类型系统能够为事件驱动系统提供编译时的类型安全，确保事件的发出和处理在类型层面正确。

## 一、事件驱动架构核心概念

事件驱动架构由三个核心组件构成：事件生产者（Event Producer）、事件通道/路由器（Event Channel/Router）、事件消费者（Event Consumer）。生产者发出事件，通道负责路由事件，消费者订阅并处理感兴趣的事件。

事件（Event）是系统中已发生事实的记录。事件应该是不可变的，使用过去时态命名（如 UserCreated、OrderPlaced、PaymentProcessed），包含事件发生所需的所有信息。在 TypeScript 中，事件应该定义为只读接口，确保事件对象一旦创建就不能被修改。

事件与命令（Command）有本质区别：命令是"做某事"的请求，可以被拒绝；事件是"某事已发生"的事实，不能被拒绝。命令发送给特定的接收者，事件广播给所有感兴趣的订阅者。在类型层面，命令通常有一个预期的响应类型，事件没有返回值。

## 二、类型安全的事件总线

事件总线（Event Bus）是事件驱动系统的中枢，负责事件的分发。一个类型安全的事件总线在编译时就能确保：发布的事件结构正确、事件名称与事件类型对应、订阅者处理的事件类型正确、不会订阅不存在的事件类型。

在 TypeScript 中实现类型安全事件总线的关键是使用事件映射类型（Event Map）。Event Map 是一个接口或类型字面量，将事件名称映射到事件载荷类型。事件总线的 emit/publish 方法使用泛型约束，确保事件名称是 Event Map 的键，载荷类型与对应键的值匹配。subscribe 方法同样使用泛型，确保回调函数接收正确类型的载荷。

事件总线可以支持通配符订阅（订阅所有事件）和前缀订阅，但这会牺牲部分类型安全性。如果需要通配符功能，应该使用单独的方法（如 subscribeAll）而不是让类型系统允许任意字符串。

事件总线还应该支持一次性订阅（once）、取消订阅（unsubscribe）、错误处理、事件元数据（如时间戳、事件 ID）等功能。

## 三、CQRS 类型模式

命令查询职责分离（Command Query Responsibility Segregation，CQRS）是一种将读操作（查询）和写操作（命令）分离的架构模式。在 CQRS 中，命令改变状态但不返回值，查询返回值但不改变状态。

在 TypeScript 中建模 CQRS，需要分别定义命令类型和查询类型。命令使用可辨识联合，每个命令有一个 kind/type 字段作为判别式。命令总线（Command Bus）接收命令并路由到对应的命令处理器（Command Handler）。查询和查询总线（Query Bus）类似。

命令处理器负责执行业务逻辑：验证命令、调用领域模型、持久化变更、发布领域事件。每个命令类型对应一个处理器接口，使用 TypeScript 的映射类型可以自动建立命令类型到处理器的对应关系。

命令和查询都应该有验证逻辑。可以配合前一章介绍的运行时 Schema 验证，在命令执行前验证命令数据的正确性。类型系统确保命令的结构正确，Schema 验证确保业务规则得到满足。

CQRS 的一个关键优势是读写模型可以独立优化。写模型（命令端）关注业务规则和一致性，读模型（查询端）可以专门为查询优化（如反范式、物化视图）。在类型层面，命令的输入类型和查询的结果类型可以完全独立设计。

## 四、事件溯源类型模式

事件溯源（Event Sourcing）是一种持久化模式，不存储对象的当前状态，而是存储对象经历的所有事件。通过重放这些事件，可以重建对象的当前状态。事件溯源天然与 CQRS 和 DDD 配合良好。

事件存储（Event Store）是事件溯源的核心组件。它是一个只追加（append-only）的数据存储，提供事件的持久化和检索。在 TypeScript 中，事件存储接口应该支持：追加事件到流（stream）、从流中读取事件、订阅全局事件流。

事件流（Event Stream）通常以聚合根 ID 为单位。每个聚合根有自己的事件流，包含该聚合从创建到现在的所有事件。事件版本号用于实现乐观并发控制：如果追加事件时版本号不匹配，说明有并发修改，操作应重试或失败。

快照（Snapshot）是事件溯源的性能优化手段。当事件流很长时，重放所有事件来重建状态会很慢。快照定期保存聚合的当前状态和版本号，重建时先加载快照，再重放快照之后的事件。在类型层面，快照应该包含聚合类型、快照数据、快照版本号。

在 TypeScript 中建模事件溯源，事件类型应该是可辨识联合，每个事件包含聚合 ID 和版本号。聚合根需要有一个 applyEvent 方法来应用事件改变状态。聚合根的状态通过事件回放来重建，而不是通过直接赋值。

## 五、Saga 与编排类型

Saga 模式用于管理跨多个服务或聚合的分布式事务。Saga 将一个长事务拆分为多个本地事务，每个本地事务更新一个服务并发布事件或消息，触发下一个本地事务。如果某个步骤失败，Saga 执行补偿事务来回滚之前的更改。

Saga 有两种主要形式：编排（Choreography）和协调（Orchestration）。编排式 Saga 中，每个服务监听其他服务的事件并决定是否执行动作，没有中心化的协调器。协调式 Saga 中有一个中心化的 Saga 协调器（Orchestrator）告诉各个参与者执行什么操作。

在 TypeScript 中建模协调式 Saga，可以定义 Saga 接口，包含步骤定义和补偿定义。每个步骤包含：触发的命令、成功后发出的事件、失败时的补偿动作。Saga 协调器维护 Saga 实例的状态（进行中、已完成、已补偿、补偿失败）。

Saga 的状态可以用可辨识联合来建模，不同状态下允许的操作不同。使用状态机模式确保 Saga 的状态转换合法，防止非法操作（如已完成的 Saga 不能再收到失败事件）。

## 六、Outbox 模式类型

Outbox 模式（发件箱模式）解决了消息/事件可靠性和数据库一致性的问题。在分布式系统中，"数据库事务提交"和"消息发送到消息代理"是两个独立的操作，无法原子性地完成。如果数据库提交成功但消息发送失败，系统会进入不一致状态。

Outbox 模式的解决方案是：在同一个数据库事务中，不仅更新业务数据，还将待发送的事件/消息写入一个 outbox 表。一个独立的进程（Outbox Relay）定期轮询 outbox 表，将消息发送到消息代理，发送成功后标记或删除 outbox 记录。

在 TypeScript 中建模 Outbox 模式，需要定义 Outbox 消息类型，包含：消息 ID、消息类型、消息载荷、目标通道/主题、创建时间、状态（待发送、已发送、发送失败）、重试次数、锁定信息（用于并发控制）。

Outbox Relay 的类型应该确保正确序列化和反序列化消息，处理发送失败的重试逻辑，并提供幂等性保证（同一消息不会被重复消费）。使用消息 ID 实现幂等性，消费者在处理消息前检查是否已处理过该 ID 的消息。

## 七、消息代理类型抽象

消息代理（Message Broker）如 Kafka、RabbitMQ、Redis Pub/Sub 是事件驱动架构的基础设施。直接依赖特定消息代理的 API 会导致代码与基础设施耦合。通过定义抽象的消息代理接口，可以在不同消息代理之间切换，也方便在测试中使用内存实现。

消息代理抽象通常包含以下类型：
- Producer：生产者接口，包含 send/publish 方法
- Consumer：消费者接口，包含 subscribe 方法和消息处理回调
- Message：消息类型，包含 key、value、headers、timestamp、topic
- Topic/Queue：主题或队列的类型表示

在 TypeScript 中，可以使用泛型来关联主题与消息类型。定义一个 TopicMap 类型映射主题名到消息类型，生产者和消费者的方法使用 TopicMap 来确保类型安全。

消息传递语义是一个重要考虑：至多一次（at-most-once）、至少一次（at-least-once）、恰好一次（exactly-once）。不同的语义需要不同的实现策略（重试、去重、事务）。在类型层面，消息处理函数应该返回成功或失败的指示，供消息代理决定是否重试。

## 八、发布/订阅类型安全

发布/订阅（Pub/Sub）是事件驱动架构中最常见的通信模式。发布者向主题发布消息，订阅者从主题接收消息。发布者和订阅者互不感知，实现了时间、空间和同步上的解耦。

类型安全的 Pub/Sub 需要解决以下问题：主题名称与消息类型的对应、消息序列化/反序列化的类型安全、通配符订阅的类型处理、消息元数据的类型定义。

TypeScript 的模板字面量类型（Template Literal Types）可以用来建模主题层级和通配符订阅。例如，主题 "order.created"、"order.paid"、"order.shipped" 可以用 'order.*' 通配符订阅。类型系统可以计算出通配符订阅匹配的具体主题类型。

消息序列化需要考虑类型信息的保留。如果使用 JSON 序列化，类型信息会丢失。解决方案包括：使用 Schema 验证（如前一章介绍）在反序列化后验证消息结构、使用带类型标签的序列化格式（如 Protocol Buffers、Avro）、在消息头中包含消息类型。

## 九、事件版本控制与迁移

系统演进时，事件结构会发生变化。已存储的事件可能是旧版本，而新代码期望新版本的事件结构。事件版本控制和迁移确保系统能够处理新旧版本的事件。

事件版本控制策略包括：
1. 向上转换（Upcasting）：读取旧事件时将其转换为新格式
2. 弱类型模式：新字段设为可选，处理代码兼容缺失字段
3. 版本号字段：每个事件包含版本号，根据版本号使用不同的解析逻辑

在 TypeScript 中建模事件版本，可以为每个事件版本定义对应的类型，并定义版本迁移函数。迁移函数接收旧版本事件，返回新版本事件。使用管道方式可以顺序应用多个迁移，将任意旧版本转换为最新版本。

事件版本迁移应该是纯函数，容易测试。迁移函数链的类型应该确保每个迁移函数的输入类型是前一个的输出类型，最终输出是最新版本类型。

通过本章的学习，你将掌握如何使用 TypeScript 构建类型安全的事件驱动系统，包括事件总线、CQRS、事件溯源、Saga、Outbox 模式、消息代理抽象等核心模式，打造松耦合、可扩展、类型安全的架构。`,
    code: `// ==================== 事件驱动架构 TypeScript 实现 ====================

const crypto = require('crypto');

// ---------- 类型工具 ----------
type Brand<T, B> = T & { readonly __brand: B };
type EventId = Brand<string, 'EventId'>;
type StreamId = Brand<string, 'StreamId'>;
type CommandId = Brand<string, 'CommandId'>;

const createEventId = (): EventId => crypto.randomUUID() as EventId;
const createStreamId = (id: string): StreamId => id as StreamId;
const createCommandId = (): CommandId => crypto.randomUUID() as CommandId;

// ---------- 事件与元数据 ----------
interface EventMetadata {
  readonly eventId: EventId;
  readonly timestamp: Date;
  readonly version: number;
  readonly causationId?: CommandId | EventId;
  readonly correlationId?: string;
}

type DomainEventBase<K extends string, P> = {
  readonly kind: K;
  readonly payload: Readonly<P>;
  readonly metadata: EventMetadata;
};

// ---------- 领域事件定义 ----------
type OrderCreated = DomainEventBase<'order.created', {
  orderId: string; userId: string; totalAmount: number; shippingAddress: string; items: Array<{ productId: string; quantity: number; price: number }>;
}>;

type OrderPaid = DomainEventBase<'order.paid', {
  orderId: string; paidAmount: number; paidAt: Date; paymentMethod: string;
}>;

type OrderShipped = DomainEventBase<'order.shipped', {
  orderId: string; trackingNumber: string; shippedAt: Date;
}>;

type OrderDelivered = DomainEventBase<'order.delivered', {
  orderId: string; deliveredAt: Date;
}>;

type OrderCancelled = DomainEventBase<'order.cancelled', {
  orderId: string; reason: string; cancelledAt: Date;
}>;

type PaymentFailed = DomainEventBase<'payment.failed', {
  orderId: string; reason: string;
}>;

type InventoryReserved = DomainEventBase<'inventory.reserved', {
  orderId: string; items: Array<{ productId: string; quantity: number }>;
}>;

type OrderEvents = OrderCreated | OrderPaid | OrderShipped | OrderDelivered | OrderCancelled | PaymentFailed | InventoryReserved;
type EventKinds = OrderEvents['kind'];

type EventForKind<K extends EventKinds> = Extract<OrderEvents, { kind: K }>;

// ---------- 类型安全事件总线 ----------
type EventHandler<E extends OrderEvents> = (event: E) => void | Promise<void>;
type AnyEventHandler = (event: OrderEvents) => void | Promise<void>;

class TypedEventBus {
  private handlers: Map<string, Set<EventHandler<any>>> = new Map();
  private wildcardHandlers: Set<AnyEventHandler> = new Set();
  private middleware: Array<(event: OrderEvents, next: () => Promise<void>) => Promise<void>> = [];

  use(mw: (event: OrderEvents, next: () => Promise<void>) => Promise<void>): void {
    this.middleware.push(mw);
  }

  subscribe<K extends EventKinds>(kind: K, handler: EventHandler<EventForKind<K>>): () => void {
    if (!this.handlers.has(kind)) this.handlers.set(kind, new Set());
    this.handlers.get(kind)!.add(handler);
    return () => this.handlers.get(kind)!.delete(handler);
  }

  subscribeAll(handler: AnyEventHandler): () => void {
    this.wildcardHandlers.add(handler);
    return () => this.wildcardHandlers.delete(handler);
  }

  async publish(event: OrderEvents): Promise<void> {
    const run = async (index: number): Promise<void> => {
      if (index < this.middleware.length) {
        await this.middleware[index](event, () => run(index + 1));
      } else {
        await this.deliver(event);
      }
    };
    await run(0);
  }

  private async deliver(event: OrderEvents): Promise<void> {
    const handlers = this.handlers.get(event.kind) || new Set();
    const promises: Promise<void>[] = [];
    for (const handler of handlers) {
      promises.push(Promise.resolve(handler(event)));
    }
    for (const handler of this.wildcardHandlers) {
      promises.push(Promise.resolve(handler(event)));
    }
    await Promise.all(promises);
  }

  async publishMany(events: OrderEvents[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }
}

// ---------- 命令定义 ----------
interface CommandMetadata {
  readonly commandId: CommandId;
  readonly timestamp: Date;
  readonly correlationId?: string;
}

type CommandBase<K extends string, P> = {
  readonly kind: K;
  readonly payload: P;
  readonly metadata: CommandMetadata;
};

type CreateOrderCmd = CommandBase<'order.create', { userId: string; items: Array<{ productId: string; quantity: number; price: number }>; shippingAddress: string }>;
type PayOrderCmd = CommandBase<'order.pay', { orderId: string; paymentMethod: string }>;
type ShipOrderCmd = CommandBase<'order.ship', { orderId: string; trackingNumber: string }>;
type CancelOrderCmd = CommandBase<'order.cancel', { orderId: string; reason: string }>;

type OrderCommands = CreateOrderCmd | PayOrderCmd | ShipOrderCmd | CancelOrderCmd;
type CommandKinds = OrderCommands['kind'];
type CommandForKind<K extends CommandKinds> = Extract<OrderCommands, { kind: K }>;

type CommandHandler<C extends OrderCommands> = (cmd: C) => Promise<OrderEvents[]>;

// ---------- 命令总线 ----------
class CommandBus {
  private handlers: Map<string, CommandHandler<any>> = new Map();
  private middlewares: Array<(cmd: OrderCommands, next: (c: OrderCommands) => Promise<OrderEvents[]>) => Promise<OrderEvents[]>> = [];

  use(mw: (cmd: OrderCommands, next: (c: OrderCommands) => Promise<OrderEvents[]>) => Promise<OrderEvents[]>): void {
    this.middlewares.push(mw);
  }

  register<K extends CommandKinds>(kind: K, handler: CommandHandler<CommandForKind<K>>): void {
    this.handlers.set(kind, handler);
  }

  async execute(cmd: OrderCommands): Promise<OrderEvents[]> {
    const run = async (index: number, currentCmd: OrderCommands): Promise<OrderEvents[]> => {
      if (index < this.middlewares.length) {
        return this.middlewares[index](currentCmd, (c) => run(index + 1, c));
      }
      const handler = this.handlers.get(currentCmd.kind);
      if (!handler) throw new Error(\`没有处理器注册命令: \${currentCmd.kind}\`);
      return handler(currentCmd as any);
    };
    return run(0, cmd);
  }
}

// ---------- 聚合根 + 事件溯源 ----------
interface AggregateState {
  id: string;
  version: number;
}

interface OrderState extends AggregateState {
  userId: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  status: 'created' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  shippingAddress: string;
  paidAt?: Date;
  paymentMethod?: string;
  trackingNumber?: string;
  shippedAt?: Date;
}

class OrderAggregate {
  private state: OrderState;
  private newEvents: OrderEvents[] = [];

  constructor(streamId: string, events?: OrderEvents[]) {
    this.state = {
      id: streamId,
      version: 0,
      userId: '',
      items: [],
      status: 'cancelled',
      totalAmount: 0,
      shippingAddress: ''
    };
    if (events) {
      events.forEach(e => this.apply(e, false));
    }
  }

  static create(streamId: string, userId: string, items: Array<{ productId: string; quantity: number; price: number }>, address: string): OrderAggregate {
    const order = new OrderAggregate(streamId);
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    order.raise({
      kind: 'order.created',
      payload: { orderId: streamId, userId, totalAmount: total, shippingAddress: address, items: items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })) },
      metadata: { eventId: createEventId(), timestamp: new Date(), version: 1 }
    });
    return order;
  }

  private apply(event: OrderEvents, isNew: boolean = true): void {
    switch (event.kind) {
      case 'order.created':
        this.state.id = event.payload.orderId;
        this.state.userId = event.payload.userId;
        this.state.totalAmount = event.payload.totalAmount;
        this.state.shippingAddress = event.payload.shippingAddress;
        this.state.items = [...event.payload.items];
        this.state.status = 'created';
        break;
      case 'order.paid':
        this.state.status = 'paid';
        this.state.paidAt = event.payload.paidAt;
        this.state.paymentMethod = event.payload.paymentMethod;
        break;
      case 'order.shipped':
        this.state.status = 'shipped';
        this.state.trackingNumber = event.payload.trackingNumber;
        this.state.shippedAt = event.payload.shippedAt;
        break;
      case 'order.delivered':
        this.state.status = 'delivered';
        break;
      case 'order.cancelled':
        this.state.status = 'cancelled';
        break;
    }
    this.state.version = event.metadata.version;
    if (isNew) this.newEvents.push(event);
  }

  private raise(event: OrderEvents): void {
    this.apply(event);
  }

  pay(paymentMethod: string): void {
    if (this.state.status !== 'created') {
      throw new Error(\`无法在 \${this.state.status} 状态下支付\`);
    }
    this.raise({
      kind: 'order.paid',
      payload: { orderId: this.state.id, paidAmount: this.state.totalAmount, paidAt: new Date(), paymentMethod },
      metadata: { eventId: createEventId(), timestamp: new Date(), version: this.state.version + 1 }
    });
  }

  ship(trackingNumber: string): void {
    if (this.state.status !== 'paid') {
      throw new Error(\`无法在 \${this.state.status} 状态下发货\`);
    }
    this.raise({
      kind: 'order.shipped',
      payload: { orderId: this.state.id, trackingNumber, shippedAt: new Date() },
      metadata: { eventId: createEventId(), timestamp: new Date(), version: this.state.version + 1 }
    });
  }

  cancel(reason: string): void {
    if (this.state.status === 'shipped' || this.state.status === 'delivered') {
      throw new Error(\`无法在 \${this.state.status} 状态下取消订单\`);
    }
    if (this.state.status === 'cancelled') return;
    this.raise({
      kind: 'order.cancelled',
      payload: { orderId: this.state.id, reason, cancelledAt: new Date() },
      metadata: { eventId: createEventId(), timestamp: new Date(), version: this.state.version + 1 }
    });
  }

  deliver(): void {
    if (this.state.status !== 'shipped') {
      throw new Error(\`无法在 \${this.state.status} 状态下送达\`);
    }
    this.raise({
      kind: 'order.delivered',
      payload: { orderId: this.state.id, deliveredAt: new Date() },
      metadata: { eventId: createEventId(), timestamp: new Date(), version: this.state.version + 1 }
    });
  }

  getUncommittedEvents(): OrderEvents[] { return [...this.newEvents]; }
  clearUncommittedEvents(): void { this.newEvents = []; }
  getState(): Readonly<OrderState> { return { ...this.state }; }
  getVersion(): number { return this.state.version; }
}

// ---------- 事件存储（Event Store） ----------
interface EventStore {
  append(streamId: StreamId, events: OrderEvents[], expectedVersion: number): Promise<void>;
  load(streamId: StreamId): Promise<OrderEvents[]>;
  subscribeToAll(handler: (event: OrderEvents) => void): () => void;
}

class InMemoryEventStore implements EventStore {
  private streams: Map<string, OrderEvents[]> = new Map();
  private subscribers: Array<(event: OrderEvents) => void> = [];

  async append(streamId: StreamId, events: OrderEvents[], expectedVersion: number): Promise<void> {
    const key = streamId as string;
    const current = this.streams.get(key) || [];
    if (current.length !== expectedVersion) {
      throw new Error(\`并发冲突: 期望版本 \${expectedVersion}, 实际版本 \${current.length}\`);
    }
    let version = expectedVersion;
    const stampedEvents = events.map(e => {
      version++;
      return { ...e, metadata: { ...e.metadata, version } };
    });
    this.streams.set(key, [...current, ...stampedEvents]);
    stampedEvents.forEach(e => this.subscribers.forEach(s => s(e)));
  }

  async load(streamId: StreamId): Promise<OrderEvents[]> {
    return this.streams.get(streamId as string) || [];
  }

  subscribeToAll(handler: (event: OrderEvents) => void): () => void {
    this.subscribers.push(handler);
    return () => {
      const idx = this.subscribers.indexOf(handler);
      if (idx >= 0) this.subscribers.splice(idx, 1);
    };
  }
}

// ---------- Outbox 模式 ----------
type OutboxStatus = 'pending' | 'processing' | 'published' | 'failed';

interface OutboxMessage {
  id: EventId;
  eventType: string;
  payload: unknown;
  metadata: EventMetadata;
  status: OutboxStatus;
  retryCount: number;
  createdAt: Date;
  publishedAt?: Date;
}

class OutboxStore {
  private messages: OutboxMessage[] = [];

  add(event: OrderEvents): void {
    this.messages.push({
      id: event.metadata.eventId,
      eventType: event.kind,
      payload: event.payload,
      metadata: event.metadata,
      status: 'pending',
      retryCount: 0,
      createdAt: new Date()
    });
  }

  getPending(limit: number = 10): OutboxMessage[] {
    return this.messages.filter(m => m.status === 'pending').slice(0, limit);
  }

  markProcessing(id: EventId): void {
    const msg = this.messages.find(m => m.id === id);
    if (msg) msg.status = 'processing';
  }

  markPublished(id: EventId): void {
    const msg = this.messages.find(m => m.id === id);
    if (msg) { msg.status = 'published'; msg.publishedAt = new Date(); }
  }

  markFailed(id: EventId): void {
    const msg = this.messages.find(m => m.id === id);
    if (msg) { msg.status = 'pending'; msg.retryCount++; }
  }

  getStats(): Record<string, number> {
    const stats: Record<string, number> = { pending: 0, processing: 0, published: 0, failed: 0 };
    this.messages.forEach(m => {
      if (m.status === 'pending' && m.retryCount > 0) stats.failed++;
      else stats[m.status]++;
    });
    return stats;
  }
}

// ---------- Saga 协调器 ----------
type SagaState = 'idle' | 'running' | 'completed' | 'compensating' | 'failed';

interface SagaInstance {
  id: string;
  orderId: string;
  state: SagaState;
  stepsCompleted: string[];
  createdAt: Date;
}

class OrderProcessingSaga {
  private instances: Map<string, SagaInstance> = new Map();

  start(orderId: string): SagaInstance {
    const id = crypto.randomUUID();
    const instance: SagaInstance = {
      id, orderId, state: 'running', stepsCompleted: [], createdAt: new Date()
    };
    this.instances.set(id, instance);
    return instance;
  }

  handleEvent(event: OrderEvents): { nextCommands?: OrderCommands[]; compensate?: boolean } {
    switch (event.kind) {
      case 'order.created': {
        const instance = this.start(event.payload.orderId);
        return {
          nextCommands: [{
            kind: 'order.pay',
            payload: { orderId: event.payload.orderId, paymentMethod: 'credit_card' },
            metadata: { commandId: createCommandId(), timestamp: new Date(), correlationId: instance.id }
          }]
        };
      }
      case 'order.paid': {
        return {
          nextCommands: [{
            kind: 'order.ship',
            payload: { orderId: event.payload.orderId, trackingNumber: 'SF' + Date.now() },
            metadata: { commandId: createCommandId(), timestamp: new Date() }
          }]
        };
      }
      case 'payment.failed': {
        return {
          nextCommands: [{
            kind: 'order.cancel',
            payload: { orderId: event.payload.orderId, reason: '支付失败: ' + event.payload.reason },
            metadata: { commandId: createCommandId(), timestamp: new Date() }
          }]
        };
      }
      case 'order.shipped': {
        return {};
      }
      case 'order.cancelled': {
        return { compensate: true };
      }
      default:
        return {};
    }
  }
}

// ---------- 仓储（Repository） ----------
class OrderRepository {
  constructor(private eventStore: EventStore, private outbox: OutboxStore) {}

  async save(order: OrderAggregate): Promise<void> {
    const events = order.getUncommittedEvents();
    if (events.length === 0) return;
    const version = order.getVersion() - events.length;
    await this.eventStore.append(createStreamId(order.getState().id), events, version);
    events.forEach(e => this.outbox.add(e));
    order.clearUncommittedEvents();
  }

  async load(orderId: string): Promise<OrderAggregate> {
    const events = await this.eventStore.load(createStreamId(orderId));
    return new OrderAggregate(orderId, events);
  }
}

// ---------- 命令处理器实现 ----------
function createOrderHandlers(repo: OrderRepository) {
  return {
    'order.create': async (cmd: CreateOrderCmd): Promise<OrderEvents[]> => {
      const orderId = 'order-' + Date.now();
      const order = OrderAggregate.create(
        orderId, cmd.payload.userId, cmd.payload.items, cmd.payload.shippingAddress
      );
      const events = order.getUncommittedEvents();
      await repo.save(order);
      return events;
    },
    'order.pay': async (cmd: PayOrderCmd): Promise<OrderEvents[]> => {
      const order = await repo.load(cmd.payload.orderId);
      try {
        order.pay(cmd.payload.paymentMethod);
        const events = order.getUncommittedEvents();
        await repo.save(order);
        return events;
      } catch (e: any) {
        return [{
          kind: 'payment.failed',
          payload: { orderId: cmd.payload.orderId, reason: e.message },
          metadata: { eventId: createEventId(), timestamp: new Date(), version: order.getVersion() + 1 }
        }];
      }
    },
    'order.ship': async (cmd: ShipOrderCmd): Promise<OrderEvents[]> => {
      const order = await repo.load(cmd.payload.orderId);
      order.ship(cmd.payload.trackingNumber);
      const events = order.getUncommittedEvents();
      await repo.save(order);
      return events;
    },
    'order.cancel': async (cmd: CancelOrderCmd): Promise<OrderEvents[]> => {
      const order = await repo.load(cmd.payload.orderId);
      order.cancel(cmd.payload.reason);
      const events = order.getUncommittedEvents();
      await repo.save(order);
      return events;
    }
  };
}

// ---------- 运行演示 ----------
async function runDemo() {
  console.log('=== 📡 事件驱动架构演示 ===\\n');

  const eventBus = new TypedEventBus();
  const commandBus = new CommandBus();
  const eventStore = new InMemoryEventStore();
  const outbox = new OutboxStore();
  const repo = new OrderRepository(eventStore, outbox);
  const saga = new OrderProcessingSaga();

  // 事件总线中间件：日志
  eventBus.use(async (event, next) => {
    console.log(\`  📨 事件: \${event.kind} (v\${event.metadata.version})\`);
    await next();
  });

  // 命令总线中间件：日志和验证
  commandBus.use(async (cmd, next) => {
    console.log(\`  📤 命令: \${cmd.kind}\`);
    const start = Date.now();
    try {
      const events = await next(cmd);
      console.log(\`     -> 产生 \${events.length} 个新事件 (耗时 \${Date.now() - start}ms)\`);
      return events;
    } catch (e: any) {
      console.error(\`     ❌ 命令失败: \${e.message}\`);
      throw e;
    }
  });

  // 注册事件处理器
  eventBus.subscribe('order.created', (e) => {
    console.log(\`     🔔 订单已创建: \${e.payload.orderId}, 金额 ¥\${e.payload.totalAmount}\`);
  });
  eventBus.subscribe('order.paid', (e) => {
    console.log(\`     🔔 订单已支付: ¥\${e.payload.paidAmount} via \${e.payload.paymentMethod}\`);
  });
  eventBus.subscribe('order.shipped', (e) => {
    console.log(\`     🔔 订单已发货: 运单号 \${e.payload.trackingNumber}\`);
  });
  eventBus.subscribe('order.cancelled', (e) => {
    console.log(\`     🔔 订单已取消: \${e.payload.reason}\`);
  });

  let sagaCommands: OrderCommands[] = [];
  eventBus.subscribeAll(async (event) => {
    const result = saga.handleEvent(event);
    if (result.nextCommands) sagaCommands.push(...result.nextCommands);
  });

  // 注册命令处理器
  const handlers = createOrderHandlers(repo);
  (Object.keys(handlers) as CommandKinds[]).forEach(kind => {
    commandBus.register(kind, handlers[kind] as any);
  });

  // 执行流程：创建订单
  console.log('🛒 创建订单流程:');
  const createCmd: CreateOrderCmd = {
    kind: 'order.create',
    payload: {
      userId: 'user-001',
      items: [
        { productId: 'P001', quantity: 2, price: 99 },
        { productId: 'P002', quantity: 1, price: 299 }
      ],
      shippingAddress: '北京市中关村1号'
    },
    metadata: { commandId: createCommandId(), timestamp: new Date() }
  };

  const createEvents = await commandBus.execute(createCmd);
  await eventBus.publishMany(createEvents);
  let currentOrderId = '';
  createEvents.forEach(e => {
    if (e.kind === 'order.created') currentOrderId = e.payload.orderId;
  });

  // 执行 Saga 产生的后续命令
  console.log('\\n⚡ 执行 Saga 后续命令:');
  while (sagaCommands.length > 0) {
    const cmd = sagaCommands.shift()!;
    const newEvents = await commandBus.execute(cmd);
    await eventBus.publishMany(newEvents);
  }

  // 加载订单状态
  console.log('\\n📋 订单最终状态:');
  const firstOrderEvents = await eventStore.load(createStreamId(currentOrderId));
  if (firstOrderEvents.length > 0) {
    const loaded = await repo.load(currentOrderId);
    const state = loaded.getState();
    console.log(\`  订单 ID: \${state.id}\`);
    console.log(\`  用户 ID: \${state.userId}\`);
    console.log(\`  状态: \${state.status}\`);
    console.log(\`  金额: ¥\${state.totalAmount}\`);
    console.log(\`  商品数量: \${state.items.length}\`);
    console.log(\`  版本: \${state.version}\`);
    console.log(\`  运单号: \${state.trackingNumber || 'N/A'}\`);
  }

  // 事件流历史
  console.log('\\n📜 事件流历史:');
  firstOrderEvents.forEach((e, i) => {
    console.log(\`  \${i + 1}. [v\${e.metadata.version}] \${e.kind} @ \${e.metadata.timestamp.toLocaleTimeString()}\`);
  });

  // Outbox 状态
  console.log('\\n📤 Outbox 状态:');
  const stats = outbox.getStats();
  console.log(\`  待发送: \${stats.pending}\`);
  console.log(\`  已发布: \${stats.published}\`);

  // 模拟 Outbox Relay
  console.log('\\n🔄 Outbox Relay 发送消息:');
  const pending = outbox.getPending();
  for (const msg of pending) {
    outbox.markProcessing(msg.id);
    await new Promise(r => setTimeout(r, 5));
    outbox.markPublished(msg.id);
  }
  console.log(\`  已发送 \${pending.length} 条消息\`);
  const afterStats = outbox.getStats();
  console.log(\`  发送后 - 待发送: \${afterStats.pending}, 已发布: \${afterStats.published}\`);

  // 测试错误流程：取消已发货订单（应该失败）
  console.log('\\n❌ 测试错误流程:');
  const badCancel: CancelOrderCmd = {
    kind: 'order.cancel',
    payload: { orderId: currentOrderId, reason: '测试取消已发货订单' },
    metadata: { commandId: createCommandId(), timestamp: new Date() }
  };
  try {
    await commandBus.execute(badCancel);
    console.log('  注意: 已发货订单取消成功（不应该发生）');
  } catch (e: any) {
    console.log(\`  预期错误: \${e.message}\`);
  }

  // 重新创建一个订单然后取消它（在支付前取消）
  console.log('\\n🔄 创建并取消新订单:');
  const createCmd2: CreateOrderCmd = {
    kind: 'order.create',
    payload: { userId: 'user-002', items: [{ productId: 'P003', quantity: 1, price: 50 }], shippingAddress: '上海' },
    metadata: { commandId: createCommandId(), timestamp: new Date() }
  };
  const events2 = await commandBus.execute(createCmd2);
  await eventBus.publishMany(events2);
  const newOrderId = (events2[0] as OrderCreated).payload.orderId;

  const cancelCmd: CancelOrderCmd = {
    kind: 'order.cancel',
    payload: { orderId: newOrderId, reason: '用户主动取消' },
    metadata: { commandId: createCommandId(), timestamp: new Date() }
  };
  await commandBus.execute(cancelCmd);
  const newOrder = await repo.load(newOrderId);
  console.log(\`  新订单状态: \${newOrder.getState().status}\`);

  console.log('\\n✅ 事件驱动架构演示完成');
}

runDemo().catch(console.error);
`
  },
  {
    id: "ts3-production-typescript",
    title: "生产级 TypeScript",
    icon: "🚀",
    group: "架构与实战",
    content: `# 生产级 TypeScript

将 TypeScript 应用到生产环境不仅仅是写出能通过编译的代码。生产级 TypeScript 涉及严格的配置管理、类型覆盖率监控、性能优化、错误调试、编码规范、依赖管理、升级策略等多个方面。本章将深入探讨如何在企业级和生产环境中有效地使用 TypeScript，构建高质量、可维护、高性能的应用程序。

## 一、严格配置深度解析

tsconfig.json 的 strict 系列选项是生产级 TypeScript 的基础。strict 选项启用了一组严格的类型检查选项，但理解每个子选项的具体含义和作用，能够帮助你根据项目情况做出合适的配置决策。

strictNullChecks 是 strict 家族中最重要的选项之一。启用后，null 和 undefined 成为独立的类型，不能赋值给其他类型，也不能在它们上面访问属性或调用方法。这迫使开发者显式处理空值情况，从根本上消除了"Cannot read property of null/undefined"这类常见错误。在生产代码中，这个选项必须始终开启。

strictFunctionTypes 确保函数参数类型是逆变（contravariant）检查的，而不是双变（bivariant）。在关闭状态下，TypeScript 允许函数参数类型的不严格匹配，这可能导致运行时错误。开启后，函数类型的检查更加严格，回调函数和高阶函数的类型安全得到保障。

strictBindCallApply 严格检查 bind、call、apply 方法的参数类型。在没有这个选项时，这些方法的参数类型是 any，完全失去类型保护。开启后，编译器会验证传入的参数是否与原函数参数匹配。

noImplicitAny 禁止隐式的 any 类型。当 TypeScript 无法推断出变量或参数的类型时，它会默认使用 any，这相当于关闭了该位置的类型检查。开启 noImplicitAny 后，编译器会在无法推断类型时报错，迫使开发者显式标注类型或修正代码使类型可被推断。

noImplicitThis 要求 this 的类型必须明确。在类方法中 this 通常可以被正确推断，但在普通函数或回调中，this 的类型可能隐式为 any。开启此选项后，需要显式指定 this 的类型（通常使用 this 参数语法）。

useUnknownInCatchVariables 将 catch 子句中的错误变量默认类型从 any 改为 unknown。这是 TypeScript 4.0 引入的选项，强制开发者在 catch 块中进行类型检查后才能使用错误对象的属性，比直接使用 any 更加安全。

exactOptionalPropertyTypes 确保可选属性不会被赋值为 undefined。在默认情况下，TypeScript 允许将 undefined 赋值给可选属性（如 obj.prop = undefined），即使 prop 的类型是 string | undefined。开启此选项后，可选属性要么存在且值为声明的类型，要么完全不存在，这使得对象的形状更加精确。

noUncheckedIndexedAccess 为索引访问结果添加 undefined。在默认情况下，访问数组元素或通过 Record 索引访问值时，TypeScript 假设结果一定存在。但实际上索引可能越界或键不存在。开启此选项后，arr[0] 的类型是 T | undefined，迫使开发者检查结果是否存在。

## 二、strictNullChecks 实战模式

strictNullChecks 开启后，需要正确处理 null 和 undefined 的各种模式。可选链（?.）和空值合并（??）是最常用的语法。可选链允许安全地访问可能为 null/undefined 的对象属性，如果中间任何一环为空，整个表达式返回 undefined。空值合并运算符提供了一个简洁的方式来在值为 null/undefined 时提供默认值。

类型守卫（Type Guards）是处理空值的另一种重要方式。通过 if (value !== null && value !== undefined) 检查后，TypeScript 会在 if 块中将 value 的类型窄化为非空类型。自定义类型守卫函数可以封装常用的非空检查逻辑。

非空断言（!）是一种告诉编译器"我确定这个值不为空"的方式。但这应该谨慎使用，因为它本质上是绕过了类型检查。非空断言适用于开发者通过逻辑分析可以确定值不为空，但编译器无法推断的场景。使用时应该添加注释说明为什么该值一定非空。

对于可能为空的值，一个好的模式是使用 Result 类型或 Option 类型，显式表示成功/失败或有值/无值两种情况。这比抛出异常或返回 null 更加类型安全，也迫使调用者处理所有情况。

## 三、no-explicit-any 强制执行策略

any 类型是 TypeScript 的"逃生舱"，它允许你完全绕过类型系统。在生产代码中，any 的使用应该受到严格控制。any 会传染——一个 any 类型的值传递给其他函数，会导致这些函数的类型推断也失效。

禁止 any 的策略包括：启用 no-explicit-any ESLint 规则、在代码审查中拒绝包含 any 的 PR（除非有充分理由和注释说明）、使用 @typescript-eslint/no-explicit-any 规则并将其设置为 error。当需要"任意类型"时，应该考虑使用 unknown 替代 any。unknown 是类型安全的 any，使用前必须进行类型检查或类型断言。

有时候 any 是必要的：与第三方无类型 JavaScript 库交互、处理 truly dynamic 的数据（如 JSON.parse 的结果）、在类型系统无法表达复杂类型关系时。但在这些情况下，应该：尽可能缩小 any 的作用域（不要在大范围内使用 any 类型）、添加注释说明为什么需要 any、在 any 值的使用边界处添加类型守卫。

// @ts-ignore 和 // @ts-expect-error 是另一种绕过类型检查的方式。@ts-expect-error 比 @ts-ignore 更好，因为如果下一行实际上没有类型错误，@ts-expect-error 会报错，提醒你移除不必要的抑制指令。使用这些指令时必须添加注释说明原因。

## 四、类型覆盖率与质量度量

类型覆盖率（Type Coverage）衡量代码库中类型化值的比例。type-coverage 工具可以统计项目中有类型和 any 类型的比例，帮助团队追踪类型安全的改进进度。生产级项目应该追求 95% 以上的类型覆盖率。

类型覆盖率不是唯一的质量指标。更重要的是类型的准确性和严格性。一个全部标注了类型但大量使用 any 的项目，类型覆盖率可能很高，但实际类型安全性很差。需要结合代码审查和 lint 规则来确保类型的质量。

常用的 TypeScript 质量度量包括：
- no-explicit-any 违规数量和趋势
- @ts-ignore / @ts-expect-error 指令数量
- 严格模式选项的启用情况
- 类型导出的清晰度（是否有良好的公共 API 类型）
- 类型测试（dtslint、expect-type 等工具验证类型推断的正确性）

在 CI/CD 流程中集成类型检查和 lint 是确保质量的关键。应该在每次提交和 PR 中运行 tsc --noEmit 确保没有类型错误，运行 lint 确保代码风格和最佳实践得到遵守。

## 五、性能优化策略

TypeScript 编译速度在大型项目中可能成为瓶颈。优化 TypeScript 性能的策略包括：

项目引用（Project References）是 TypeScript 3.0 引入的功能，允许将大型代码库拆分为多个子项目，每个子项目有自己的 tsconfig。这使得 TypeScript 可以增量编译，只重新编译变更的部分，大幅提升构建速度。

incremental 选项和 tsBuildInfoFile 让 TypeScript 缓存编译信息，后续编译可以利用缓存加速。composite 选项与项目引用配合使用，确保子项目可以被正确引用和增量构建。

skipLibCheck 跳过声明文件（.d.ts）的类型检查。第三方库的声明文件有时存在类型错误或冲突，skipLibCheck 可以跳过这些检查，加快编译速度。这通常是安全的，因为我们不需要检查第三方库的类型。

文件包含策略：使用 include 和 exclude 精确指定需要编译的文件，避免包含不必要的文件（如 node_modules、测试文件、构建产物目录）。使用 files 列表指定入口文件时更加精确。

避免在类型层面进行复杂的递归计算，如深层嵌套的条件类型、大型映射类型、递归类型推断等，这些可能导致类型检查性能问题。对于特别复杂的类型，可以考虑简化或使用接口代替交叉类型。

## 六、TypeScript 错误调试技巧

TypeScript 的错误信息有时看起来晦涩难懂，特别是涉及泛型、条件类型、映射类型等高级特性时。掌握调试 TypeScript 错误的技巧可以显著提升开发效率。

理解错误信息的结构是第一步。TypeScript 错误通常包含：错误位置（文件和行号）、错误代码（TS2345 等）、错误描述、涉及的类型信息。错误描述中的 "is not assignable to type" 是最常见的错误，它表示值的类型与期望的类型不匹配。

对于复杂的泛型错误，可以使用以下技巧：在类型参数位置使用显式类型注解来帮助编译器推断；将复杂的类型表达式拆分为多个中间类型别名，逐步验证每个部分的类型是否正确；使用 extends 条件类型来调试类型关系。

使用 // @ts-expect-error 来定位具体哪一行有错误，然后逐步缩小范围。当整个函数报错时，可以先注释掉部分代码，找到导致错误的具体位置。

工具类型如 Prettify（展开交叉类型使其更易读）可以帮助理解复杂类型：type Prettify<T> = { [K in keyof T]: T[K] } & {}。这个工具类型将交叉类型展开为扁平的对象结构，便于阅读。

对于类型不匹配的错误，对比两个类型的差异是关键。可以将两个类型分别赋给一个需要特定结构的变量，观察错误信息中显示的具体差异。

## 七、ts-reset 与类型改进模式

ts-reset 是由 Total TypeScript 作者创建的库，它通过声明合并（Declaration Merging）修复了 TypeScript 标准库中一些不严格或不理想的类型定义。理解 ts-reset 的工作原理可以帮助我们在需要时编写自己的类型修复。

ts-reset 的主要改进包括：
- JSON.parse 返回 unknown 而非 any：强制在使用 JSON.parse 结果前进行类型验证
- Array.prototype.filter 的类型守卫推断：当 filter 回调是类型守卫时，正确窄化数组元素类型
- fetch 的 Response.json() 返回 Promise<unknown> 而非 Promise<any>
- 改进 .includes() 方法的类型，使其更严格

实现这些改进的技术是声明合并。通过在全局作用域（declare global）中重新声明接口，可以向现有接口添加方法或修改方法签名。这是一种强大但需要谨慎使用的技术，因为它会改变全局类型。

## 八、企业级 TypeScript 编码约定

大型团队使用 TypeScript 需要统一的编码约定，以确保代码风格一致、类型使用合理、避免反模式。

命名约定：类型和接口使用 PascalCase（UserConfig）；类型变量使用简短的大写字母（T、U、K、V）；品牌类型使用 Brand<T, Name> 模式；React 组件名使用 PascalCase，事件处理函数以 handle 前缀（handleClick）；布尔变量/属性使用 is/has/should 前缀（isLoading、hasError）。

文件组织约定：每个模块有清晰的公共 API，通过 index.ts barrel 文件导出；类型定义文件（.d.ts）放在 types 目录或与代码并列；测试文件以 .test.ts 或 .spec.ts 结尾；避免在一个文件中放过多内容，大文件拆分为小模块。

导入导出约定：使用 named export 而非 default export（便于重构和自动导入）；避免循环依赖；按外部依赖、内部模块、类型导入分组；类型导入使用 import type 语法，明确区分类型和值的导入。

错误处理约定：不要使用 any 作为 catch 的错误类型；使用 unknown 并进行类型检查；定义自定义错误类并使用 instanceof 进行错误类型检查；异步函数始终返回 Promise 并正确处理 rejection。

## 九、TypeScript 版本升级策略

TypeScript 每三个月发布一个新版本，每个版本都带来新特性、类型检查改进和性能优化。但升级 TypeScript 版本可能导致新的类型错误出现（因为 TypeScript 不断修复类型检查的漏洞，使类型系统更加严格）。

升级策略应该是渐进式的：定期升级（每 2-3 个小版本），避免跨多个大版本升级导致大量修复工作；在升级前阅读版本发布说明，特别是 Breaking Changes 部分；在单独的分支进行升级，修复类型错误后再合并；使用 TypeScript 的降级版本（如通过 resolutions 固定版本）来协调多个包的 TypeScript 版本依赖。

升级时常见的问题包括：更严格的类型检查导致的新错误、标准库类型的变化、lib.d.ts 更新、装饰器行为变化、模块解析算法调整。对于第三方库的类型不兼容，可以暂时使用 skipLibCheck、patch-package 或 @ts-expect-error 来过渡。

通过本章的学习，你将掌握生产环境使用 TypeScript 的最佳实践，从配置、编码、质量度量到性能优化、升级策略的全链路知识，构建真正企业级的 TypeScript 项目。`,
    code: `// ==================== 生产级 TypeScript 模式与工具 ====================

const assert = require('assert');
const util = require('util');

// ---------- 1. Result/Option 类型（替代 null/undefined 和异常） ----------
type Ok<T> = { ok: true; value: T };
type Err<E> = { ok: false; error: E };
type Result<T, E = Error> = Ok<T> | Err<E>;

const Ok = <T>(value: T): Ok<T> => ({ ok: true, value });
const Err = <E>(error: E): Err<E> => ({ ok: false, error });

function tryCatch<T, E = Error>(fn: () => T): Result<T, E> {
  try {
    return Ok(fn());
  } catch (e) {
    return Err(e as E);
  }
}

async function tryCatchAsync<T, E = Error>(fn: () => Promise<T>): Promise<Result<T, E>> {
  try {
    return Ok(await fn());
  } catch (e) {
    return Err(e as E);
  }
}

// ---------- 2. 品牌类型工具 ----------
declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };

type NonEmptyString = Brand<string, 'NonEmptyString'>;
const NonEmptyString = (s: string): Result<NonEmptyString, string> => {
  if (s.trim().length === 0) return Err('字符串不能为空');
  return Ok(s as NonEmptyString);
};

type EmailAddress = Brand<string, 'EmailAddress'>;
const EmailAddress = (s: string): Result<EmailAddress, string> => {
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(s)) return Err('邮箱格式不正确');
  return Ok(s as EmailAddress);
};

// ---------- 3. Prettify 工具类型（展开交叉类型便于调试） ----------
type Prettify<T> = { [K in keyof T]: T[K] } & {};

// ---------- 4. 类型安全的环境变量解析 ----------
type EnvSchema = Record<string, (v: string | undefined) => Result<any, string>>;
type InferEnv<S extends EnvSchema> = { [K in keyof S]: S[K] extends (v: any) => Result<infer T, any> ? T : never };

function parseEnv<S extends EnvSchema>(schema: S, env: Record<string, string | undefined>): Result<InferEnv<S>, string[]> {
  const result: Record<string, any> = {};
  const errors: string[] = [];
  for (const [key, parser] of Object.entries(schema)) {
    const parsed = parser(env[key]);
    if (parsed.ok) {
      result[key] = parsed.value;
    } else {
      errors.push(\`\${key}: \${parsed.error}\`);
    }
  }
  if (errors.length > 0) return Err(errors);
  return Ok(result as InferEnv<S>);
}

const envSchema = {
  PORT: (v) => {
    const n = v ? Number(v) : 3000;
    if (isNaN(n) || n < 1 || n > 65535) return Err('端口必须是 1-65535 的数字');
    return Ok(n);
  },
  NODE_ENV: (v) => {
    const allowed = ['development', 'production', 'test'] as const;
    if (!v) return Ok('development' as const);
    if (!(allowed as readonly string[]).includes(v)) return Err(\`必须是 \${allowed.join(', ')} 之一\`);
    return Ok(v as typeof allowed[number]);
  },
  DATABASE_URL: (v) => {
    if (!v) return Err('DATABASE_URL 是必填项');
    try { new URL(v); return Ok(v); } catch { return Err('必须是有效的 URL'); }
  }
};

// ---------- 5. 类型守卫工具 ----------
function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    && Object.getPrototypeOf(value) === Object.prototype;
}

function hasProperty<K extends string>(obj: object, key: K): obj is { [P in K]: unknown } {
  return key in obj;
}

// 类型守卫 + filter 辅助
function filterDefined<T>(arr: Array<T | null | undefined>): T[] {
  return arr.filter(isDefined);
}

// ---------- 6. 自定义错误类 ----------
class BaseError extends Error {
  readonly code: string;
  readonly cause?: Error;
  readonly context?: Record<string, unknown>;

  constructor(message: string, opts: { code?: string; cause?: Error; context?: Record<string, unknown> } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = opts.code || this.constructor.name;
    this.cause = opts.cause;
    this.context = opts.context;
    Error.captureStackTrace?.(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      stack: this.stack,
      cause: this.cause instanceof BaseError ? this.cause.toJSON() : this.cause?.message
    };
  }
}

class ValidationError extends BaseError {
  readonly issues: string[];
  constructor(issues: string[]) {
    super(\`验证失败: \${issues.length} 个错误\`, { code: 'VALIDATION_ERROR', context: { issues } });
    this.issues = issues;
  }
}

class NotFoundError extends BaseError {
  constructor(entity: string, id: string) {
    super(\`\${entity} 不存在: \${id}\`, { code: 'NOT_FOUND', context: { entity, id } });
  }
}

// ---------- 7. 不可变数据工具 ----------
function deepFreeze<T>(obj: T): Readonly<T> {
  if (obj === null || typeof obj !== 'object') return obj;
  const propNames = Object.getOwnPropertyNames(obj);
  for (const name of propNames) {
    const value = (obj as any)[name];
    deepFreeze(value);
  }
  return Object.freeze(obj);
}

// ---------- 8. 类型安全的事件发射器封装 ----------
type EventMap = Record<string | symbol, any>;

class TypedEventEmitter<E extends EventMap> {
  private emitter = new (require('events').EventEmitter)();

  on<K extends keyof E>(event: K, listener: (payload: E[K]) => void): () => void {
    this.emitter.on(event as string, listener);
    return () => this.emitter.off(event as string, listener);
  }

  once<K extends keyof E>(event: K, listener: (payload: E[K]) => void): () => void {
    this.emitter.once(event as string, listener);
    return () => this.emitter.off(event as string, listener);
  }

  emit<K extends keyof E>(event: K, payload: E[K]): void {
    this.emitter.emit(event as string, payload);
  }

  removeAllListeners(event?: keyof E): void {
    this.emitter.removeAllListeners(event as string | undefined);
  }
}

// ---------- 9. 函数式工具（类型安全） ----------
function pipe<A, B>(value: A, fn1: (a: A) => B): B;
function pipe<A, B, C>(value: A, fn1: (a: A) => B, fn2: (b: B) => C): C;
function pipe<A, B, C, D>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D): D;
function pipe(value: any, ...fns: Array<(v: any) => any>): any {
  return fns.reduce((acc, fn) => fn(acc), value);
}

// ---------- 10. Deferred Promise (类型安全) ----------
interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

// ---------- 11. ts-reset 风格的类型改进示例 ----------
interface Array<T> {
  filter<S extends T>(predicate: (value: T, index: number, array: T[]) => value is S): S[];
  filter(predicate: (value: T, index: number, array: T[]) => unknown): T[];
}

// ---------- 12. 配置验证示例（严格） ----------
interface AppConfig {
  readonly port: number;
  readonly env: 'development' | 'production' | 'test';
  readonly dbUrl: string;
  readonly features: {
    readonly auth: boolean;
    readonly cache: boolean;
  };
}

function loadConfig(env: Record<string, string | undefined>): Result<AppConfig, string[]> {
  const result = parseEnv({
    PORT: envSchema.PORT,
    NODE_ENV: envSchema.NODE_ENV,
    DATABASE_URL: envSchema.DATABASE_URL
  }, env);

  if (!result.ok) return result;

  return Ok(deepFreeze({
    port: result.value.PORT,
    env: result.value.NODE_ENV,
    dbUrl: result.value.DATABASE_URL,
    features: {
      auth: true,
      cache: result.value.NODE_ENV === 'production'
    }
  }) as AppConfig);
}

// ---------- 运行演示 ----------
console.log('=== 🚀 生产级 TypeScript 模式演示 ===\\n');

// 1. Result 类型模式
console.log('📋 Result 类型模式:');
const safeDiv = (a: number, b: number): Result<number, string> => {
  if (b === 0) return Err('除数不能为零');
  return Ok(a / b);
};

const r1 = safeDiv(10, 2);
if (r1.ok) console.log('  10 / 2 =', r1.value);
const r2 = safeDiv(10, 0);
if (!r2.ok) console.log('  10 / 0 错误:', r2.error);

// tryCatch 包装
const jsonResult = tryCatch(() => JSON.parse('{"name":"ts"}'));
console.log('  JSON.parse 成功:', jsonResult.ok);
const badJson = tryCatch(() => JSON.parse('invalid'));
if (!badJson.ok) console.log('  JSON.parse 失败: (已捕获)');

// 2. 品牌类型验证
console.log('\\n🏷️ 品牌类型验证:');
const email1 = EmailAddress('user@example.com');
console.log('  "user@example.com":', email1.ok ? '✅ 有效邮箱' : '❌');
const email2 = EmailAddress('bad-email');
if (!email2.ok) console.log('  "bad-email": ❌', email2.error);

const name1 = NonEmptyString('John');
console.log('  "John":', name1.ok ? '✅ 有效' : '❌');
const name2 = NonEmptyString('   ');
if (!name2.ok) console.log('  空白字符串: ❌', name2.error);

// 3. 环境变量解析
console.log('\\n⚙️ 环境变量解析:');
const validEnv = {
  PORT: '4000',
  NODE_ENV: 'production',
  DATABASE_URL: 'postgres://localhost:5432/app'
};
const configResult = loadConfig(validEnv);
if (configResult.ok) {
  console.log('  有效配置:');
  console.log(\`    PORT: \${configResult.value.port}\`);
  console.log(\`    ENV: \${configResult.value.env}\`);
  console.log(\`    DB: \${configResult.value.dbUrl}\`);
  console.log(\`    features.auth: \${configResult.value.features.auth}\`);
  console.log(\`    features.cache: \${configResult.value.features.cache}\`);
  console.log('    配置已冻结:', Object.isFrozen(configResult.value));
}

const invalidEnv = { PORT: '99999', DATABASE_URL: 'not-a-url' };
const badConfig = loadConfig(invalidEnv);
if (!badConfig.ok) {
  console.log('  无效配置错误:');
  badConfig.error.forEach(e => console.log('    -', e));
}

const defaultConfig = loadConfig({ DATABASE_URL: 'postgres://localhost/db' });
if (defaultConfig.ok) {
  console.log(\`  默认配置: PORT=\${defaultConfig.value.port}, ENV=\${defaultConfig.value.env}\`);
}

// 4. 类型守卫
console.log('\\n🛡️ 类型守卫工具:');
const mixed = [1, 'hello', null, 42, undefined, 'world', 0];
const numbers = mixed.filter(isNumber);
const strings = mixed.filter(isString);
const defined = filterDefined(mixed);
console.log('  混合数组:', mixed);
console.log('  数字:', numbers);
console.log('  字符串:', strings);
console.log('  非空:', defined);

const obj = { name: 'test', value: 42 };
console.log('  isPlainObject({}):', isPlainObject({}));
console.log('  isPlainObject(null):', isPlainObject(null));
console.log('  hasProperty(obj, "name"):', hasProperty(obj, 'name'));
console.log('  hasProperty(obj, "age"):', hasProperty(obj, 'age'));

// 5. 自定义错误
console.log('\\n❌ 自定义错误类:');
const notFound = new NotFoundError('User', 'user-123');
console.log('  NotFoundError:', notFound.message);
console.log('  错误码:', notFound.code);
console.log('  错误上下文:', JSON.stringify(notFound.context));

try {
  throw new ValidationError(['邮箱格式错误', '密码太短']);
} catch (e: any) {
  console.log(\`  ValidationError: \${e.message}\`);
  console.log('  issues:', e.issues);
}

// 6. deepFreeze
console.log('\\n🔒 不可变数据:');
const mutable = { a: 1, nested: { b: 2 } };
const frozen = deepFreeze({ ...mutable });
try {
  (frozen as any).a = 999;
  console.log('  冻结后修改 a: 严格模式下会抛出错误');
} catch (e) {
  console.log('  冻结后修改 a: 抛出错误 (严格模式)');
}

// 7. TypedEventEmitter
console.log('\\n📡 类型安全事件发射器:');
interface AppEvents {
  'user:login': { userId: string; timestamp: Date };
  'user:logout': { userId: string };
  'error': Error;
}
const emitter = new TypedEventEmitter<AppEvents>();
let eventCount = 0;

const off = emitter.on('user:login', (payload) => {
  eventCount++;
  console.log(\`  🔔 用户登录: \${payload.userId}\`);
});

emitter.emit('user:login', { userId: 'user-001', timestamp: new Date() });
emitter.emit('user:login', { userId: 'user-002', timestamp: new Date() });
console.log('  事件触发次数:', eventCount);
off();
emitter.emit('user:login', { userId: 'user-003', timestamp: new Date() });
console.log('  取消订阅后触发次数:', eventCount, '(已取消,不增加)');

// 8. pipe 函数
console.log('\\n🔗 函数式 pipe:');
const double = (n: number) => n * 2;
const addOne = (n: number) => n + 1;
const toString = (n: number) => \`结果: \${n}\`;
const pipedResult = pipe(5, double, addOne, toString);
console.log('  pipe(5, double, addOne, toString) =', pipedResult);

// 9. Deferred Promise
console.log('\\n⏳ Deferred Promise:');
const d = deferred<string>();
setTimeout(() => d.resolve('异步结果'), 50);
d.promise.then(val => console.log('  Deferred 结果:', val));

// 10. 验证 assert 断言
console.log('\\n✅ 断言验证:');
try {
  assert.strictEqual(1 + 1, 2, '基本数学应该正确');
  console.log('  1 + 1 === 2 ✅');
} catch (e) {
  console.log('  断言失败:', (e as Error).message);
}

console.log('\\n✅ 生产级 TypeScript 模式演示完成');
`
  }
];