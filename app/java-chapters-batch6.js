// =============================================================
// Java 交互式教程 —— 第六批章节（数组与控制流组，共 15 章）
// =============================================================
// 本文件包含以下章节：
//   1. java-arrays-basics       — 数组基础
//   2. java-arrays-multidim     — 多维数组
//   3. java-arrays-operations   — 数组操作
//   4. java-arrays-utils        — Arrays 工具类
//   5. java-if-else             — 条件语句
//   6. java-switch-expr         — switch 语句与表达式
//   7. java-for-loop            — for 循环
//   8. java-while-loop          — while 与 do-while
//   9. java-break-continue      — break/continue 与标签
//  10. java-foreach             — 增强 for 循环
//  11. java-nested-loops        — 嵌套循环
//  12. java-loop-optimization   — 循环优化技巧
//  13. java-arrays-sorting      — 数组排序
//  14. java-arrays-searching    — 数组查找
//  15. java-arrays-iteration    — 数组遍历方式
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（本批为"数组与控制流"）
//   content : Markdown 格式的详细讲解
//   code    : 可运行、带详细中文注释的 Java 示例代码（public class Main）
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：数组基础
  // =========================================================
  {
    id: "java-arrays-basics",
    group: "数组与控制流",
    icon: "📊",
    title: "数组基础",
    content: `## 数组基础：同类型数据的有序集合

**数组（Array）** 是 Java 中最基础的数据结构，它是一段**连续内存**中存放的**相同类型**元素的有序集合。数组一旦创建，**长度固定不可变**，但可以通过索引在 O(1) 时间内随机访问任意元素，这让它在性能敏感场景依然不可替代。

### 声明、创建与初始化

Java 中数组是**对象**，因此需要经历"声明引用"和"创建对象"两步：

\`\`\`java
int[] a;              // 声明：a 是一个指向 int 数组的引用（推荐写法）
int b[];              // 也可以这样写（C 风格，不推荐）
a = new int[5];       // 创建：在堆上分配 5 个 int 的连续空间
\`\`\`

也可以一步到位，使用**数组字面量**初始化：

\`\`\`java
int[] nums = {10, 20, 30, 40};   // 静态初始化，长度由元素个数决定
String[] names = new String[]{"Alice", "Bob"}; // 也可以显式 new
\`\`\`

### 数组长度与索引

每个数组对象都有一个 \`length\` 字段（注意是**属性不是方法**），表示元素个数。索引从 \`0\` 开始，到 \`length - 1\` 结束。访问越界索引会抛出 **\`ArrayIndexOutOfBoundsException\`**：

\`\`\`java
int[] a = new int[3];
a[0] = 100;          // 合法
a[3] = 100;          // 运行时异常！有效索引是 0、1、2
\`\`\`

### 默认值

用 \`new\` 创建数组时，元素会自动初始化为**类型的默认值**，无需手动清零：

| 元素类型 | 默认值 |
| --- | --- |
| \`byte/short/int/long\` | \`0\` |
| \`float/double\` | \`0.0\` |
| \`char\` | \`'\\u0000'\`（空字符） |
| \`boolean\` | \`false\` |
| 引用类型（对象、String） | \`null\` |

### 数组是对象

这是新手最容易忽略的事实：**数组在 Java 中是对象**，它存放在**堆**上，变量名只是引用。这意味着：

1. 数组变量可以重新指向另一个数组对象。
2. 把数组作为参数传递或赋值，传递的是**引用**，方法内修改会影响外部。
3. 可以用 \`instanceof\` 判断数组类型，也可以调用 \`Object\` 的方法。

\`\`\`java
int[] a = {1, 2, 3};
int[] b = a;          // b 和 a 指向同一个数组对象
b[0] = 99;            // 修改 b 也影响 a
System.out.println(a[0]); // 输出 99
\`\`\`

### 数组 vs ArrayList

数组长度**固定**，而 \`ArrayList\` 长度**可变**。但 \`ArrayList\` 底层仍是数组——当容量不足时，它会内部 \`new\` 一个更大的数组并复制元素（类似 \`Arrays.copyOf\`）。因此：

- 元素数量已知且不变 → 用数组，零开销。
- 元素数量动态变化 → 用 \`ArrayList\`，免去手动扩容。
- 基本类型 → 数组（\`int[]\`）比 \`ArrayList<Integer>\` 省内存（无装箱）。

### 小结

数组是 Java 的"原生"容器：**长度固定、类型统一、连续存储、O(1) 随机访问**。理解数组的对象本质和默认值规则，是学习集合框架（\`ArrayList\` 底层就是数组）的前提。下方代码演示了声明、创建、初始化、长度、索引、默认值以及"数组是引用"的核心特性。`,
    code: `// ============================================================
// 第 1 章：数组基础演示
// ============================================================
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        // 1. 声明 + 创建（new 在堆上分配空间）
        int[] a = new int[5];
        System.out.println("new int[5] 的默认值: " + Arrays.toString(a));
        System.out.println("数组长度 a.length = " + a.length);

        // 2. 索引访问：从 0 开始，到 length - 1 结束
        for (int i = 0; i < a.length; i++) {
            a[i] = (i + 1) * 10;
        }
        System.out.println("赋值后: " + Arrays.toString(a));

        // 3. 静态初始化（数组字面量）
        int[] nums = {10, 20, 30, 40};
        System.out.println("静态初始化: " + Arrays.toString(nums));

        // 4. 不同类型数组的默认值
        boolean[] bools = new boolean[3];
        double[] doubles = new double[2];
        String[] names = new String[3];
        System.out.println("boolean 默认值: " + Arrays.toString(bools));
        System.out.println("double 默认值: " + Arrays.toString(doubles));
        System.out.println("String 默认值: " + Arrays.toString(names));

        // 5. 数组是对象：引用赋值，修改互相影响
        int[] b = a;
        b[0] = 999;
        System.out.println("修改 b[0] 后 a = " + Arrays.toString(a));

        // 6. 数组对象特性：getClass、equals（引用比较）
        System.out.println("a 的运行时类: " + a.getClass().getName());
        System.out.println("a == b（同一对象）: " + (a == b));

        // 7. 数组越界会抛异常（用 try 捕获展示）
        try {
            int x = nums[10];
            System.out.println("不会执行到这里: " + x);
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("捕获越界异常: " + e.getClass().getSimpleName());
        }
    }
}`,
  },

  // =========================================================
  // 第二章：多维数组
  // =========================================================
  {
    id: "java-arrays-multidim",
    group: "数组与控制流",
    icon: "🔲",
    title: "多维数组",
    content: `## 多维数组：数组的数组

Java 没有真正的"多维数组"，所谓多维数组本质上是**"数组的数组"**——一个二维数组就是"一维数组的数组"，每个元素本身又是一个一维数组。这种设计带来一个强大特性：**每一行的长度可以不同**，即"不规则数组"。

### 二维数组的声明与创建

\`\`\`java
int[][] matrix = new int[3][4];   // 3 行 4 列，规则矩形
int[][] m2 = {{1, 2}, {3, 4, 5}, {6}}; // 静态初始化，不规则
\`\`\`

也可以**只指定行数，不指定列数**，再逐行分配：

\`\`\`java
int[][] grid = new int[3][];      // 先给 3 行的"外壳"
grid[0] = new int[]{1, 2};
grid[1] = new int[]{3, 4, 5};
grid[2] = new int[]{6};
\`\`\`

### 不规则数组（Ragged Array）

由于每行独立分配，各行长度可以不同，这在表示**稀疏结构**（如三角矩阵）时非常节省空间：

\`\`\`java
// 杨辉三角：第 i 行有 i+1 个元素
int[][] tri = new int[5][];
for (int i = 0; i < tri.length; i++) {
    tri[i] = new int[i + 1];
}
\`\`\`

### 遍历多维数组

最常见的是**嵌套 for 循环**，外层遍历行，内层遍历列。对于不规则数组，必须用 \`row.length\` 而非固定列数：

\`\`\`java
for (int i = 0; i < grid.length; i++) {        // 行
    for (int j = 0; j < grid[i].length; j++) { // 当行列数
        System.out.print(grid[i][j] + " ");
    }
    System.out.println();
}
\`\`\`

也可以用增强 for 更简洁：

\`\`\`java
for (int[] row : grid) {
    for (int v : row) { System.out.print(v + " "); }
    System.out.println();
}
\`\`\`

### 三维数组

三维数组是"二维数组的数组"，原理相同，但实际开发中较少使用——当数据维度超过 2 时，通常应考虑用对象建模而非裸数组：

\`\`\`java
int[][][] cube = new int[2][3][4];   // 2 层、3 行、4 列
\`\`\`

### 内存布局

理解内存布局能解释"为什么多维数组可以不规则"：\`int[3][4]\` 在堆上先创建一个长度为 3 的一维数组，每个槽位存放的是一个**引用**，指向另一个长度为 4 的一维数组。这些内层数组**彼此独立分配**，因此可以让某些行更长、某些行更短。

\`\`\`java
int[][] m = new int[3][4];
// m[0]、m[1]、m[2] 是三个独立的 int[4] 数组对象
// m 本身是一个 int[][] 引用，指向长度为 3 的"引用数组"
\`\`\`

也正因如此，\`m[0] == m[1]\` 为 \`false\`（不同对象），但可以故意让 \`m[0] = m[1]\` 使两行共享同一内层数组（修改一处影响两处）。

### 小结

多维数组的核心心智模型是**"数组的数组"**：外层数组存放的是内层数组的引用，因此可以构造不规则数组，遍历时务必使用 \`arr[i].length\`。下方代码演示了规则二维数组、不规则数组（杨辉三角）的创建与遍历，以及三维数组的基本结构。`,
    code: `// ============================================================
// 第 2 章：多维数组演示
// ============================================================
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        // 1. 规则二维数组：3 行 4 列
        int[][] matrix = new int[3][4];
        int counter = 1;
        for (int i = 0; i < matrix.length; i++) {
            for (int j = 0; j < matrix[i].length; j++) {
                matrix[i][j] = counter++;
            }
        }
        System.out.println("--- 规则二维数组 ---");
        for (int[] row : matrix) {
            System.out.println(Arrays.toString(row));
        }

        // 2. 静态初始化的不规则数组
        int[][] ragged = {{1, 2}, {3, 4, 5}, {6}};
        System.out.println("--- 不规则数组 ---");
        for (int i = 0; i < ragged.length; i++) {
            System.out.println("第 " + i + " 行长度 = " + ragged[i].length
                    + " : " + Arrays.toString(ragged[i]));
        }

        // 3. 杨辉三角：第 i 行有 i+1 个元素
        int n = 5;
        int[][] tri = new int[n][];
        for (int i = 0; i < n; i++) {
            tri[i] = new int[i + 1];
            tri[i][0] = 1;
            tri[i][i] = 1;
            for (int j = 1; j < i; j++) {
                tri[i][j] = tri[i - 1][j - 1] + tri[i - 1][j];
            }
        }
        System.out.println("--- 杨辉三角 ---");
        for (int[] row : tri) {
            StringBuilder sb = new StringBuilder();
            for (int v : row) { sb.append(v).append(" "); }
            System.out.println(sb.toString().trim());
        }

        // 4. 三维数组基本结构
        int[][][] cube = new int[2][2][2];
        int val = 1;
        for (int i = 0; i < cube.length; i++) {
            for (int j = 0; j < cube[i].length; j++) {
                for (int k = 0; k < cube[i][j].length; k++) {
                    cube[i][j][k] = val++;
                }
            }
        }
        System.out.println("--- 三维数组 ---");
        System.out.println("cube.length = " + cube.length);
        System.out.println("cube[0] = " + Arrays.deepToString(cube[0]));
        System.out.println("cube[1] = " + Arrays.deepToString(cube[1]));

        // 5. deepToString 一次打印整个二维数组
        System.out.println("--- Arrays.deepToString ---");
        System.out.println(Arrays.deepToString(ragged));
    }
}`,
  },

  // =========================================================
  // 第三章：数组操作
  // =========================================================
  {
    id: "java-arrays-operations",
    group: "数组与控制流",
    icon: "⚙️",
    title: "数组操作",
    content: `## 数组操作：复制、比较、填充与搜索

虽然数组长度不可变，但 \`System\` 类和 \`java.util.Arrays\` 工具类提供了丰富的"操作"方法，让我们能高效地复制、比较、填充和搜索数组。

### 数组复制

复制数组有三种主流方式：

\`\`\`java
// 方式一：System.arraycopy —— 最底层、最高效，原生方法
System.arraycopy(src, srcPos, dest, destPos, length);

// 方式二：Arrays.copyOf —— 复制从头开始，可指定新长度（截断或补默认值）
int[] copy = Arrays.copyOf(original, newLength);

// 方式三：Arrays.copyOfRange —— 复制指定区间 [from, to)
int[] sub = Arrays.copyOfRange(original, from, to);
\`\`\`

| 方法 | 特点 | 适用场景 |
| --- | --- | --- |
| \`System.arraycopy\` | 原生方法，最快，需预分配目标数组 | 批量复制、已知目标大小 |
| \`Arrays.copyOf\` | 简洁，自动分配新数组 | 整体复制、扩容/缩容 |
| \`Arrays.copyOfRange\` | 截取子数组 | 切片操作 |

**注意**：对于对象数组，这三种方式都是**浅拷贝**——只复制引用，不复制对象本身。

### 数组比较

\`Arrays.equals(a, b)\` 逐元素比较**一维数组**是否相等。对于**多维数组**，要用 \`Arrays.deepEquals\`，否则比较的是引用地址：

\`\`\`java
int[][] x = {{1, 2}, {3, 4}};
int[][] y = {{1, 2}, {3, 4}};
Arrays.equals(x, y);      // false！比较的是引用
Arrays.deepEquals(x, y);  // true，逐层比较内容
\`\`\`

### 数组填充

\`Arrays.fill(arr, value)\` 把整个数组填为同一值；\`Arrays.fill(arr, from, to, value)\` 填充指定区间：

\`\`\`java
int[] a = new int[5];
Arrays.fill(a, -1);              // [-1, -1, -1, -1, -1]
Arrays.fill(a, 1, 3, 0);         // [-1, 0, 0, -1, -1]
\`\`\`

### 数组搜索

\`Arrays.binarySearch\` 使用**二分查找**，要求**数组已排序**，返回找到的索引；未找到返回 \`-(插入点+1)\`：

\`\`\`java
int[] a = {10, 20, 30, 40, 50};
int idx = Arrays.binarySearch(a, 30);  // 返回 2
int notFound = Arrays.binarySearch(a, 25); // 返回 -3（应在索引 2 插入）
\`\`\`

**重要**：对未排序数组使用二分查找会得到**未定义结果**（不一定抛异常，但结果不可靠）。无序数组只能用**线性查找**。

### 小结

\`System.arraycopy\` 是底层高速复制，\`Arrays.copyOf/copyOfRange\` 是简洁封装；\`equals\` 比"一维内容"，\`deepEquals\` 比"多维内容"；\`binarySearch\` 必须先排序。下方代码完整演示了这些操作。`,
    code: `// ============================================================
// 第 3 章：数组操作演示（复制/比较/填充/搜索）
// ============================================================
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] src = {10, 20, 30, 40, 50};

        // 1. System.arraycopy：需预先分配目标数组
        int[] dest1 = new int[5];
        System.arraycopy(src, 1, dest1, 0, 3);  // 从 src[1] 复制 3 个到 dest1[0]
        System.out.println("arraycopy: " + Arrays.toString(dest1));

        // 2. Arrays.copyOf：整体复制并指定新长度
        int[] copy = Arrays.copyOf(src, 7);   // 扩容，多出的位置补默认值 0
        System.out.println("copyOf 扩容: " + Arrays.toString(copy));
        int[] shrink = Arrays.copyOf(src, 3); // 缩容，只保留前 3 个
        System.out.println("copyOf 缩容: " + Arrays.toString(shrink));

        // 3. Arrays.copyOfRange：截取区间 [from, to)
        int[] sub = Arrays.copyOfRange(src, 1, 4); // 取索引 1、2、3
        System.out.println("copyOfRange[1,4): " + Arrays.toString(sub));

        // 4. 数组比较：equals（一维内容比较）
        int[] a = {1, 2, 3};
        int[] b = {1, 2, 3};
        System.out.println("a == b（引用）: " + (a == b));
        System.out.println("Arrays.equals(a, b): " + Arrays.equals(a, b));

        // 5. 多维数组比较：deepEquals
        int[][] m1 = {{1, 2}, {3, 4}};
        int[][] m2 = {{1, 2}, {3, 4}};
        System.out.println("Arrays.equals(m1, m2): " + Arrays.equals(m1, m2));
        System.out.println("Arrays.deepEquals(m1, m2): " + Arrays.deepEquals(m1, m2));

        // 6. 数组填充 fill
        int[] filled = new int[5];
        Arrays.fill(filled, 7);
        System.out.println("fill 全 7: " + Arrays.toString(filled));
        Arrays.fill(filled, 1, 3, 0);  // 索引 1、2 填 0
        System.out.println("fill 区间[1,3)=0: " + Arrays.toString(filled));

        // 7. 二分查找：必须先排序
        int[] sorted = {10, 20, 30, 40, 50};
        int idx = Arrays.binarySearch(sorted, 30);
        System.out.println("binarySearch(30) = " + idx);
        int nf = Arrays.binarySearch(sorted, 25);
        System.out.println("binarySearch(25) = " + nf + "（插入点 = " + (-(nf + 1)) + "）");

        // 8. 线性查找（无序数组）
        int[] unsorted = {40, 10, 50, 20, 30};
        int target = 50;
        int found = -1;
        for (int i = 0; i < unsorted.length; i++) {
            if (unsorted[i] == target) { found = i; break; }
        }
        System.out.println("线性查找 50 的索引: " + found);
    }
}`,
  },

  // =========================================================
  // 第四章：Arrays 工具类
  // =========================================================
  {
    id: "java-arrays-utils",
    group: "数组与控制流",
    icon: "🧰",
    title: "Arrays 工具类",
    content: `## Arrays 工具类：数组的瑞士军刀

\`java.util.Arrays\` 是一个**工具类**（所有方法都是 \`static\`），封装了对数组的几乎所有常用操作。掌握它能避免重复造轮子，写出更简洁、更高效的代码。

### 核心方法一览

| 方法 | 作用 |
| --- | --- |
| \`sort(arr)\` | 排序（基本类型用双轴快排，对象用 TimSort） |
| \`parallelSort(arr)\` | 并行排序（大数据量利用多核） |
| \`binarySearch(arr, key)\` | 二分查找（要求有序） |
| \`fill(arr, val)\` | 填充 |
| \`copyOf(arr, n)\` / \`copyOfRange\` | 复制 |
| \`equals(a, b)\` / \`deepEquals\` | 比较 |
| \`toString(arr)\` / \`deepToString\` | 转字符串（调试利器） |
| \`asList(T... a)\` | 数组转 List（固定大小） |
| \`stream(arr)\` | 转为 Stream（支持函数式操作） |

### toString：调试神器

直接 \`System.out.println(arr)\` 只会打印 \`[I@hashcode\`，毫无意义。用 \`Arrays.toString\` 才能看清内容；多维数组用 \`deepToString\`：

\`\`\`java
int[] a = {1, 2, 3};
System.out.println(Arrays.toString(a));       // [1, 2, 3]
int[][] m = {{1, 2}, {3, 4}};
System.out.println(Arrays.deepToString(m));   // [[1, 2], [3, 4]]
\`\`\`

### asList 的"陷阱"

\`asList\` 返回的 \`List\` 是**固定大小**的——它内部直接引用原数组，**不支持 add/remove**（会抛 \`UnsupportedOperationException\`），但可以 \`set\` 修改元素，且修改会**同步影响原数组**：

\`\`\`java
String[] arr = {"a", "b", "c"};
List<String> list = Arrays.asList(arr);
list.set(0, "X");      // 合法，arr[0] 也变成 "X"
list.add("d");          // 抛异常！
\`\`\`

若需可变 List，用 \`new ArrayList<>(Arrays.asList(arr))\` 包一层。

### stream：函数式操作数组

\`Arrays.stream\` 把数组转为 \`Stream\`，可以链式进行过滤、映射、聚合：

\`\`\`java
int sum = Arrays.stream(new int[]{1, 2, 3, 4, 5})
               .filter(x -> x % 2 == 1)
               .sum();   // 1 + 3 + 5 = 9
\`\`\`

### parallelSort：并行排序

\`parallelSort\` 在数据量大（约 > 8192）时，利用 \`ForkJoinPool\` 多线程排序，能显著提升速度；小数组则退化为普通 \`sort\`：

\`\`\`java
int[] big = new int[1000000];
Arrays.parallelSort(big);
\`\`\`

### 小结

\`Arrays\` 工具类覆盖了数组的排序、查找、填充、复制、比较、打印、转换等几乎所有场景。记住两个"坑"：\`asList\` 返回固定大小 List，\`binarySearch\` 要求有序。下方代码演示了这些方法的使用。`,
    code: `// ============================================================
// 第 4 章：Arrays 工具类演示
// ============================================================
import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        // 1. toString：把数组转为可读字符串
        int[] a = {3, 1, 4, 1, 5, 9};
        System.out.println("toString: " + Arrays.toString(a));
        int[][] m = {{1, 2}, {3, 4}};
        System.out.println("deepToString: " + Arrays.deepToString(m));

        // 2. sort：原地排序
        int[] toSort = {3, 1, 4, 1, 5, 9, 2, 6};
        Arrays.sort(toSort);
        System.out.println("sort 升序: " + Arrays.toString(toSort));

        // 3. binarySearch：有序数组二分查找
        int idx = Arrays.binarySearch(toSort, 5);
        System.out.println("binarySearch(5) = " + idx);

        // 4. fill：填充
        int[] filled = new int[5];
        Arrays.fill(filled, 8);
        System.out.println("fill(8): " + Arrays.toString(filled));

        // 5. copyOf / copyOfRange
        int[] copy = Arrays.copyOf(a, 8);
        System.out.println("copyOf 扩容: " + Arrays.toString(copy));
        int[] range = Arrays.copyOfRange(a, 2, 5);
        System.out.println("copyOfRange[2,5): " + Arrays.toString(range));

        // 6. equals / deepEquals
        int[] x = {1, 2, 3};
        int[] y = {1, 2, 3};
        System.out.println("equals: " + Arrays.equals(x, y));
        int[][] m1 = {{1}, {2}};
        int[][] m2 = {{1}, {2}};
        System.out.println("deepEquals: " + Arrays.deepEquals(m1, m2));

        // 7. asList：数组转 List（固定大小，注意陷阱）
        String[] names = {"Alice", "Bob", "Carol"};
        List<String> fixedList = Arrays.asList(names);
        System.out.println("asList: " + fixedList);
        fixedList.set(0, "Anna");  // 合法，原数组也同步改变
        System.out.println("set 后原数组 names[0] = " + names[0]);
        // 包装成可变 List
        List<String> mutable = new ArrayList<>(Arrays.asList(names));
        mutable.add("David");
        System.out.println("可变 List: " + mutable);

        // 8. stream：函数式操作
        int sumOdd = Arrays.stream(a).filter(n -> n % 2 == 1).sum();
        System.out.println("奇数之和: " + sumOdd);
        double avg = Arrays.stream(a).average().orElse(0);
        System.out.println("平均值: " + avg);

        // 9. parallelSort：并行排序（大数据量更高效）
        int[] big = new int[100];
        for (int i = 0; i < big.length; i++) {
            big[i] = (int) (Math.random() * 1000);
        }
        Arrays.parallelSort(big);
        System.out.println("parallelSort 前 10 个: "
                + Arrays.toString(Arrays.copyOfRange(big, 0, 10)));
    }
}`,
  },

  // =========================================================
  // 第五章：条件语句
  // =========================================================
  {
    id: "java-if-else",
    group: "数组与控制流",
    icon: "🔀",
    title: "条件语句",
    content: `## 条件语句：if / else if / else

**条件语句** 让程序根据不同情况执行不同逻辑，是控制流的基础。Java 的条件语句以 \`if\` 为核心，配合 \`else\` 和 \`else if\` 形成"分支树"。

### 基本形式

\`\`\`java
// 形式一：单 if
if (score >= 60) { System.out.println("及格"); }

// 形式二：if-else 二选一
if (score >= 60) { System.out.println("及格"); }
else { System.out.println("不及格"); }

// 形式三：if-else if-else 多选一
if (score >= 90) { System.out.println("优秀"); }
else if (score >= 80) { System.out.println("良好"); }
else if (score >= 60) { System.out.println("及格"); }
else { System.out.println("不及格"); }
\`\`\`

\`else if\` 不是独立关键字，而是 \`else { if(...) }\` 的简写。条件按顺序判断，**一旦某个分支命中，后续分支不再判断**。

### 条件表达式

条件必须是 \`boolean\` 类型。Java **不会**把 \`0\` / 非 \`0\` 当作 false / true（这与 C/C++ 不同）：

\`\`\`java
int x = 0;
if (x) { }       // 编译错误！Java 要求严格的 boolean
if (x == 0) { }  // 正确
\`\`\`

### 嵌套 if

\`if\` 可以嵌套，但层数过多会降低可读性，建议用**提前 return**或**提取方法**重构：

\`\`\`java
if (user != null) {
    if (user.isActive()) {
        if (user.hasPermission("admin")) {
            // 嵌套太深，难维护
        }
    }
}
\`\`\`

### 陷阱一：悬挂 else（Dangling else）

\`\`\`java
if (a > 0)
    if (b > 0) System.out.println("a,b > 0");
else System.out.println("a <= 0");   // 这个 else 其实属于内层 if！
\`\`\`

Java 遵循"就近匹配"原则：\`else\` 总是与**最近的未配对 if** 结合。要避免歧义，**始终用大括号**包住代码块。

### 陷阱二：赋值 vs 比较

\`\`\`java
if (x = 5) { }     // 编译错误：x=5 是赋值，结果是 int 不是 boolean
if (x == 5) { }    // 正确：比较
boolean flag = false;
if (flag = true) { }  // 危险！这是赋值，结果恒为 true
\`\`\`

把常量放左边（"尤达表达式"）能防止这种 bug：\`if (5 == x)\`，若误写为 \`5 = x\` 编译器会报错。

### 三元运算符

简单二选一可用 \`条件 ? 值1 : 值2\`，本质是 if-else 的表达式形式：

\`\`\`java
String result = score >= 60 ? "及格" : "不及格";
\`\`\`

### 小结

\`if-else if-else\` 是最通用的分支结构；条件必须是 \`boolean\`；用大括号避免"悬挂 else"，警惕 \`=\` 与 \`==\` 的混淆。下方代码演示了成绩判定、闰年判断、嵌套 if 和常见陷阱。`,
    code: `// ============================================================
// 第 5 章：条件语句演示
// ============================================================
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        int score = 85;

        // 1. if-else if-else：成绩判定
        String level;
        if (score >= 90) {
            level = "优秀";
        } else if (score >= 80) {
            level = "良好";
        } else if (score >= 60) {
            level = "及格";
        } else {
            level = "不及格";
        }
        System.out.println("分数 " + score + " -> " + level);

        // 2. 嵌套 if：判断是否为闰年
        // 闰年规则：能被 4 整除但不能被 100 整除，或能被 400 整除
        int year = 2024;
        if (year % 4 == 0) {
            if (year % 100 == 0) {
                if (year % 400 == 0) {
                    System.out.println(year + " 是闰年（整百且能被400整除）");
                } else {
                    System.out.println(year + " 不是闰年（整百但不能被400整除）");
                }
            } else {
                System.out.println(year + " 是闰年（非整百且能被4整除）");
            }
        } else {
            System.out.println(year + " 不是闰年（不能被4整除）");
        }

        // 3. 三元运算符
        int a = 10, b = 20;
        int max = a > b ? a : b;
        System.out.println("较大值: " + max);

        // 4. 演示"悬挂 else"陷阱：else 与最近的 if 配对
        boolean condA = false;
        boolean condB = true;
        if (condA)
            if (condB) System.out.println("两个条件都成立");
        else System.out.println("看似属于外层 if，其实属于内层 if（不输出任何内容）");

        // 5. 比较字符串用 equals，不要用 ==
        String s1 = new String("hello");
        String s2 = new String("hello");
        if (s1.equals(s2)) {
            System.out.println("equals 比较：内容相同");
        }
        if (s1 == s2) {
            System.out.println("== 比较：引用相同（不会执行）");
        } else {
            System.out.println("== 比较：引用不同，内容可能相同");
        }

        // 6. 复合条件：短路逻辑
        int[] arr = null;
        // 利用短路避免空指针：先判空，再访问长度
        if (arr != null && arr.length > 0) {
            System.out.println("数组非空");
        } else {
            System.out.println("数组为 null 或长度为 0（短路保护成功）");
        }
    }
}`,
  },

  // =========================================================
  // 第六章：switch 语句与表达式
  // =========================================================
  {
    id: "java-switch-expr",
    group: "数组与控制流",
    icon: "🔘",
    title: "switch 语句与表达式",
    content: `## switch：多路分支的两种形态

\`switch\` 适合"一个值对应多种情况"的场景，比长串 \`if-else if\` 更清晰。Java 14 引入的 **switch 表达式**让 switch 也能作为"有返回值的表达式"使用，配合箭头标签，代码更简洁、更安全。

### 传统 switch 语句

\`\`\`java
switch (day) {
    case 1:
        System.out.println("周一");
        break;          // 必须 break，否则会"贯穿"
    case 2:
        System.out.println("周二");
        break;
    default:
        System.out.println("其他");
}
\`\`\`

**fall-through（贯穿）** 是传统 switch 的特点：如果忘写 \`break\`，执行完一个 \`case\` 后会**继续执行下一个 case** 直到遇到 \`break\`。这有时是有意为之（多个 case 共用代码），但更多时候是 bug 来源。

### switch 表达式（Java 14+）

新语法用**箭头标签 \`case L ->\`**，**自动不贯穿**，且可以**直接返回值**：

\`\`\`java
String name = switch (day) {
    case 1 -> "周一";
    case 2 -> "周二";
    case 6, 7 -> "周末";      // 多值合并
    default -> "其他";
};
\`\`\`

箭头标签右侧可以是**表达式**、**代码块**或 **throw**。若是代码块，需要用 \`yield\` 返回值：

\`\`\`java
int len = switch (s) {
    case null -> 0;
    default -> {
        int n = s.length();
        yield n * 2;     // 块内用 yield 返回
    }
};
\`\`\`

### 箭头 vs 冒号标签

| 特性 | 冒号标签 \`case L:\` | 箭头标签 \`case L ->\` |
| --- | --- | --- |
| 是否贯穿 | 是（需 \`break\`） | 否（自动结束） |
| 是否返回值 | 否（是语句） | 是（可作为表达式） |
| 多值写法 | 多个 case 堆叠 | \`case 1, 2, 3 ->\` |
| 推荐度 | 兼容旧代码 | 现代首选 |

### 枚举与 switch

switch 是处理枚举的绝佳场景，编译器会**检查是否覆盖所有枚举值**，遗漏会警告：

\`\`\`java
enum Color { RED, GREEN, BLUE }
Color c = Color.RED;
String desc = switch (c) {
    case RED -> "红色";
    case GREEN -> "绿色";
    case BLUE -> "蓝色";
    // 无需 default：枚举值已穷举
};
\`\`\`

### 支持的类型

switch 表达式（值）可以是：\`byte/short/int/char\`、对应包装类、\`String\`（Java 7+）、\`enum\`。**不支持** \`long/float/double/boolean\`。

### 小结

传统 \`switch\` 语句需要 \`break\` 防止贯穿；\`switch\` 表达式用箭头标签自动不贯穿，支持返回值和 \`yield\`；枚举 switch 受编译器检查更安全。新代码推荐用 switch 表达式。下方代码演示了传统和新式两种写法。`,
    code: `// ============================================================
// 第 6 章：switch 语句与表达式演示
// ============================================================

// 演示用枚举
enum Color { RED, GREEN, BLUE }

public class Main {
    public static void main(String[] args) {
        int day = 3;

        // 1. 传统 switch 语句（注意 break 防止贯穿）
        System.out.println("--- 传统 switch ---");
        switch (day) {
            case 1:
                System.out.println("周一");
                break;
            case 2:
                System.out.println("周二");
                break;
            case 3:
                System.out.println("周三");
                break;
            default:
                System.out.println("其他");
        }

        // 2. 传统 switch 的贯穿特性（故意利用）
        System.out.println("--- 利用贯穿：周末判断 ---");
        switch (day) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                System.out.println("工作日");
                break;
            case 6:
            case 7:
                System.out.println("周末");
                break;
        }

        // 3. switch 表达式（Java 14+）：箭头标签，自动不贯穿
        System.out.println("--- switch 表达式 ---");
        String name = switch (day) {
            case 1 -> "周一";
            case 2 -> "周二";
            case 3 -> "周三";
            case 4 -> "周四";
            case 5 -> "周五";
            case 6, 7 -> "周末";
            default -> "未知";
        };
        System.out.println("day=" + day + " -> " + name);

        // 4. yield：在代码块中返回值
        int code = 200;
        String msg = switch (code) {
            case 200 -> "OK";
            case 404 -> "Not Found";
            case 500 -> "Server Error";
            default -> {
                System.out.println("  [进入 default 块处理 code=" + code + "]");
                yield "Unknown Code";  // 块内用 yield 返回
            }
        };
        System.out.println("HTTP " + code + " -> " + msg);

        // 5. 枚举 + switch 表达式：编译器检查穷举
        Color c = Color.GREEN;
        String desc = switch (c) {
            case RED -> "红色";
            case GREEN -> "绿色";
            case BLUE -> "蓝色";
        };
        System.out.println("颜色 " + c + " -> " + desc);

        // 6. 字符串 switch（Java 7+）
        String cmd = "start";
        switch (cmd) {
            case "start" -> System.out.println("启动服务");
            case "stop"  -> System.out.println("停止服务");
            case "status"-> System.out.println("查询状态");
            default      -> System.out.println("未知命令");
        }
    }
}`,
  },

  // =========================================================
  // 第七章：for 循环
  // =========================================================
  {
    id: "java-for-loop",
    group: "数组与控制流",
    icon: "🔁",
    title: "for 循环",
    content: `## for 循环：最经典的循环结构

\`for\` 循环是 Java 中使用频率最高的循环，它把"初始化、条件判断、更新"三部分集中在循环头部，结构紧凑、可控性强，特别适合**已知次数**的循环场景。

### 基本语法

\`\`\`java
for (初始化; 条件; 更新) {
    循环体;
}
\`\`\`

执行顺序：**初始化 → 条件判断 → 循环体 → 更新 → 条件判断 → ...**，直到条件为 false。

\`\`\`java
for (int i = 0; i < 5; i++) {
    System.out.println(i);   // 输出 0 1 2 3 4
}
\`\`\`

### 三大部分的灵活性

这三部分都**可以省略**，但**分号必须保留**：

\`\`\`java
// 省略初始化（变量在外部声明）
int i = 0;
for (; i < 5; i++) { ... }

// 省略更新（在循环体内手动更新）
for (int j = 0; j < 5;) {
    System.out.println(j);
    j += 2;
}

// 省略条件 = 永远 true（需用 break 退出）
for (int k = 0;; k++) {
    if (k >= 3) break;
}

// 三者都省略 = 无限循环
for (;;) { ... }
\`\`\`

初始化和更新部分还支持**多个表达式**（用逗号分隔）：

\`\`\`java
for (int i = 0, j = 10; i < j; i++, j--) {
    System.out.println(i + " " + j);
}
\`\`\`

### 循环变量作用域

在 \`for\` 头部声明的变量，**作用域仅限于循环内部**，循环外不可见：

\`\`\`java
for (int i = 0; i < 3; i++) { }
System.out.println(i);  // 编译错误：i 已超出作用域
\`\`\`

如果需要在循环后使用循环变量，必须在循环外声明：

\`\`\`java
int i;
for (i = 0; i < 3; i++) { }
System.out.println("循环结束 i = " + i);  // 3
\`\`\`

### 嵌套 for

\`for\` 可以嵌套，外层每执行一次，内层执行一轮。嵌套循环时间复杂度是**乘积关系**，常用于二维遍历、打印图形：

\`\`\`java
for (int i = 1; i <= 9; i++) {
    for (int j = 1; j <= i; j++) {
        System.out.print(j + "x" + i + "=" + (i * j) + " ");
    }
    System.out.println();
}
\`\`\`

### 无限循环

\`for (;;)\` 和 \`while (true)\` 都能构造无限循环，通常配合 \`break\` 在满足条件时退出，常见于服务器主循环、菜单程序。二者等价，选哪个看团队习惯：\`for (;;)\` 更紧凑，\`while (true)\` 更直白。

### for 与 while 的选择

\`for\` 和 \`while\` 在能力上**完全等价**（任何 for 都能改写成 while，反之亦然），选择依据是**可读性**：当循环次数由一个计数器决定且更新逻辑简单时，\`for\` 把"初始化—条件—更新"集中表达，一眼就能看出循环范围；当循环由复杂状态驱动、更新逻辑分散在循环体各处时，\`while\` 更清晰。

### 小结

\`for\` 循环把"初始化—条件—更新"集中表达，是**次数已知**场景的首选；循环变量作用域限于循环内；多变量、嵌套、无限循环都是合法用法。下方代码演示了这些形式。`,
    code: `// ============================================================
// 第 7 章：for 循环演示
// ============================================================
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        // 1. 基本 for：输出 0 到 4
        System.out.println("--- 基本 for ---");
        for (int i = 0; i < 5; i++) {
            System.out.print(i + " ");
        }
        System.out.println();

        // 2. 多变量 for：i 递增，j 递减
        System.out.println("--- 多变量 for ---");
        for (int i = 0, j = 10; i <= j; i++, j--) {
            System.out.println("i=" + i + ", j=" + j);
        }

        // 3. 省略部分：累加 1 到 100
        System.out.println("--- 省略更新（在体内手动更新）---");
        int sum = 0;
        for (int n = 1; n <= 100; ) {
            sum += n;
            n++;
        }
        System.out.println("1 到 100 之和: " + sum);

        // 4. 无限循环 + break
        System.out.println("--- for(;;) + break ---");
        int count = 0;
        for (;;) {
            count++;
            if (count >= 3) break;
        }
        System.out.println("退出时 count = " + count);

        // 5. 循环变量作用域：循环后不可见
        int last;
        for (last = 0; last < 5; last++) { }
        System.out.println("循环结束后 last = " + last);

        // 6. 嵌套 for：九九乘法表
        System.out.println("--- 九九乘法表 ---");
        for (int i = 1; i <= 9; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.printf("%dx%d=%-4d", j, i, i * j);
            }
            System.out.println();
        }

        // 7. 倒序 for：数组反转
        int[] arr = {1, 2, 3, 4, 5};
        int[] reversed = new int[arr.length];
        for (int i = arr.length - 1; i >= 0; i--) {
            reversed[arr.length - 1 - i] = arr[i];
        }
        System.out.println("原数组: " + Arrays.toString(arr));
        System.out.println("反转后: " + Arrays.toString(reversed));

        // 8. 步长为 2
        System.out.println("--- 步长为 2 ---");
        for (int i = 0; i < 10; i += 2) {
            System.out.print(i + " ");
        }
        System.out.println();
    }
}`,
  },

  // =========================================================
  // 第八章：while 与 do-while
  // =========================================================
  {
    id: "java-while-loop",
    group: "数组与控制流",
    icon: "⏳",
    title: "while 与 do-while",
    content: `## while 与 do-while：条件驱动的循环

\`for\` 循环适合"次数已知"，而 \`while\` 和 \`do-while\` 更适合"次数未知、由条件决定"的场景——比如读取输入直到结束、轮询直到任务完成。

### while 循环

\`\`\`java
while (条件) {
    循环体;
}
\`\`\`

**先判断后执行**：每次循环开始前判断条件，为 true 才执行循环体。若初始条件就为 false，循环体**一次都不执行**：

\`\`\`java
int i = 0;
while (i < 5) {
    System.out.println(i);
    i++;
}
\`\`\`

### do-while 循环

\`\`\`java
do {
    循环体;
} while (条件);   // 注意分号！
\`\`\`

**先执行后判断**：循环体至少执行一次，然后再判断是否继续。这适合"先做一次，再决定要不要继续"的场景，比如**菜单交互**、**至少询问一次**的逻辑：

\`\`\`java
int choice;
do {
    choice = showMenu();   // 至少显示一次菜单
} while (choice != 0);     // 选 0 才退出
\`\`\`

### 二者的区别与选择

| 特性 | while | do-while |
| --- | --- | --- |
| 判断时机 | 先判断 | 后判断 |
| 最少执行次数 | 0 次 | 1 次 |
| 适用场景 | 条件可能一开始就为 false | 至少要执行一次 |
| 语法末尾 | 无分号 | **有分号** |

经验法则：**不确定要不要执行，用 while；保证至少执行一次，用 do-while**。

### 无限循环

\`while (true)\` 是最常见的无限循环写法，配合 \`break\` 退出：

\`\`\`java
while (true) {
    String line = readLine();
    if (line == null) break;
    process(line);
}
\`\`\`

### 循环条件陷阱

**陷阱一：忘记更新循环变量**，导致死循环：

\`\`\`java
int i = 0;
while (i < 10) {
    System.out.println(i);
    // 忘记 i++，永远输出 0
}
\`\`\`

**陷阱二：浮点数比较**，由于精度问题可能死循环：

\`\`\`java
double d = 0.0;
while (d != 1.0) {   // 0.1 累加可能永远到不了精确的 1.0
    d += 0.1;
}
\`\`\`

应改用 \`d < 1.0\` 或容差比较。

**陷阱三：循环条件用 \`=\` 而非 \`==\`**，对 boolean 变量尤其危险。

### 典型应用场景

\`while\` 适合**条件驱动**的循环，常见场景包括：读取输入直到结束符（\`while (scanner.hasNext())\`）、轮询任务状态直到完成、消费队列直到为空（\`while (!queue.isEmpty())\`）、迭代逼近算法（如牛顿迭代法直到收敛）。

\`do-while\` 适合**至少执行一次**的场景：菜单交互（先展示再询问是否继续）、输入校验（先读一次再判断是否合法需重输）、游戏回合（至少进行一回合再决定是否再来）。

### 小结

\`while\` 先判断后执行，\`do-while\` 先执行后判断（至少一次）；选择取决于"是否保证执行一次"；务必确保循环变量正确更新、条件能终止。下方代码演示了这两种循环及常见用法。`,
    code: `// ============================================================
// 第 8 章：while 与 do-while 演示
// ============================================================
public class Main {
    public static void main(String[] args) {
        // 1. while 循环：计算 2 的 n 次方直到超过 1000
        System.out.println("--- while：2 的幂 ---");
        int power = 1;
        int exp = 0;
        while (power <= 1000) {
            System.out.println("2^" + exp + " = " + power);
            power *= 2;
            exp++;
        }

        // 2. while 处理"条件可能一开始就为 false"
        System.out.println("--- while：条件初始为 false ---");
        int n = 10;
        while (n < 5) {
            System.out.println("这行不会执行");
            n++;
        }
        System.out.println("跳过循环，n = " + n);

        // 3. do-while：至少执行一次
        System.out.println("--- do-while：至少执行一次 ---");
        int m = 10;
        do {
            System.out.println("do 块执行了，m = " + m);
            m++;
        } while (m < 5);  // 条件为 false，但已执行过一次
        System.out.println("结束 m = " + m);

        // 4. 模拟菜单交互（用固定数据代替输入）
        System.out.println("--- do-while 模拟菜单 ---");
        int[] choices = {1, 2, 0};
        int idx = 0;
        int choice;
        do {
            choice = choices[idx++];
            System.out.println("用户选择: " + choice);
            switch (choice) {
                case 1 -> System.out.println("  -> 执行新增");
                case 2 -> System.out.println("  -> 执行查询");
                case 0 -> System.out.println("  -> 退出");
            }
        } while (choice != 0);

        // 5. while (true) + break：求数字位数
        System.out.println("--- while(true) 求位数 ---");
        int num = 123456;
        int digits = 0;
        int temp = num;
        while (true) {
            if (temp == 0) break;
            temp /= 10;
            digits++;
        }
        System.out.println(num + " 的位数: " + digits);

        // 6. while 实现"反转数字"
        System.out.println("--- while 反转数字 ---");
        int x = 12345;
        int reversed = 0;
        while (x > 0) {
            reversed = reversed * 10 + x % 10;
            x /= 10;
        }
        System.out.println("反转后: " + reversed);

        // 7. do-while 实现"猜数字"逻辑骨架（直接命中）
        System.out.println("--- do-while 猜数字 ---");
        int target = 7;
        int guess = 7;
        do {
            System.out.println("猜测: " + guess);
            if (guess == target) {
                System.out.println("猜对了！");
                break;
            }
        } while (guess != target);
    }
}`,
  },

  // =========================================================
  // 第九章：break/continue 与标签
  // =========================================================
  {
    id: "java-break-continue",
    group: "数组与控制流",
    icon: "🛑",
    title: "break/continue 与标签",
    content: `## break / continue 与标签：循环的精细控制

普通的循环按部就班执行，但有时我们需要**提前跳出**或**跳过本次**。\`break\` 和 \`continue\` 就是为此而生，配合**标签（label）** 还能精确控制嵌套循环。

### break：跳出整个循环

\`break\` 立即终止**当前所在循环**，执行循环之后的语句。在 \`switch\` 中也用于结束一个 case：

\`\`\`java
for (int i = 0; i < 10; i++) {
    if (i == 5) break;       // i=5 时整个循环结束
    System.out.println(i);   // 输出 0 1 2 3 4
}
\`\`\`

### continue：跳过本次，进入下一次

\`continue\` 跳过循环体剩余部分，直接进入**下一次迭代**（for 会先执行更新部分）：

\`\`\`java
for (int i = 0; i < 10; i++) {
    if (i % 2 == 0) continue;  // 跳过偶数
    System.out.println(i);     // 输出 1 3 5 7 9
}
\`\`\`

### 标签（Label）：控制嵌套循环

Java 支持**带标签的 break/continue**，可以跳出或跳过多层嵌套循环。标签是一个标识符后跟冒号，写在循环之前：

\`\`\`java
outer:                          // 定义标签
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        if (i == 1 && j == 1) break outer;  // 跳出外层循环
        System.out.println(i + "," + j);
    }
}
\`\`\`

- \`break label\`：终止**标签所在循环**。
- \`continue label\`：跳到**标签所在循环的下一次迭代**。

这是 Java 中少有的 goto 风格语法，但在**嵌套循环控制**中非常有用，比如在二维数组中找到目标后立即结束全部搜索。

### break vs continue vs return

| 语句 | 作用范围 | 效果 |
| --- | --- | --- |
| \`break\` | 当前循环或 switch | 终止当前循环 |
| \`continue\` | 当前循环 | 跳过本次，进入下次 |
| \`return\` | 当前方法 | 直接退出整个方法 |
| \`break label\` | 标签循环 | 终止标签循环 |
| \`continue label\` | 标签循环 | 跳到标签循环下次迭代 |

\`return\` 比 \`break\` 更"激进"——直接退出方法。在循环内遇到需要"彻底结束"的情况，\`return\` 常比 \`break + 标志位\` 更简洁。

### 使用建议

- 适度使用 break/continue 能让循环更清晰，但**滥用会破坏结构化**，降低可读性。
- 标签 break 是处理嵌套循环的合法手段，但若嵌套过深，应考虑**提取方法** + \`return\`。
- 避免"在循环里写大量 break/continue"造成的"控制流迷宫"。

### 小结

\`break\` 跳出循环，\`continue\` 跳过本次；标签版可控制嵌套循环；\`return\` 直接退出方法。下方代码演示了在二维数组中查找元素、打印矩阵并跳过特定位置等场景。`,
    code: `// ============================================================
// 第 9 章：break / continue / 标签演示
// ============================================================
public class Main {
    public static void main(String[] args) {
        // 1. break：找到第一个能被 7 整除的数
        System.out.println("--- break：找第一个 7 的倍数 ---");
        for (int i = 1; i <= 100; i++) {
            if (i % 7 == 0) {
                System.out.println("找到: " + i);
                break;
            }
        }

        // 2. continue：输出 1-10 中的奇数
        System.out.println("--- continue：输出奇数 ---");
        for (int i = 1; i <= 10; i++) {
            if (i % 2 == 0) continue;
            System.out.print(i + " ");
        }
        System.out.println();

        // 3. 标签 break：在二维数组中查找目标值
        System.out.println("--- 标签 break：二维查找 ---");
        int[][] matrix = {
            {1, 2, 3},
            {4, 5, 6},
            {7, 8, 9}
        };
        int target = 5;
        boolean found = false;
        int foundRow = -1, foundCol = -1;
        search:
        for (int i = 0; i < matrix.length; i++) {
            for (int j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] == target) {
                    found = true;
                    foundRow = i;
                    foundCol = j;
                    break search;   // 直接跳出两层循环
                }
            }
        }
        System.out.println("查找 " + target + " : "
                + (found ? "找到于 (" + foundRow + "," + foundCol + ")" : "未找到"));

        // 4. 标签 continue：跳过外层某些迭代
        System.out.println("--- 标签 continue：跳过偶数行 ---");
        outer:
        for (int i = 0; i < 4; i++) {
            if (i % 2 == 0) {
                System.out.println("跳过第 " + i + " 行");
                continue outer;   // 直接进入外层下一次迭代
            }
            for (int j = 0; j < 3; j++) {
                System.out.println("  i=" + i + ", j=" + j);
            }
        }

        // 5. return vs break：查找是否存在负数
        System.out.println("--- return：方法内查找 ---");
        int[] data = {3, 8, -1, 5, 2};
        System.out.println("是否含负数: " + hasNegative(data));

        // 6. 在 while 中使用 break/continue
        System.out.println("--- while 中 break/continue ---");
        int k = 0;
        while (true) {
            k++;
            if (k > 20) break;          // 限制最多到 20
            if (k % 3 != 0) continue;   // 只处理 3 的倍数
            System.out.print(k + " ");  // 输出 3 6 9 12 15 18
        }
        System.out.println();
    }

    // 用 return 提前退出方法，等价于 break + 标志位，但更简洁
    static boolean hasNegative(int[] arr) {
        for (int v : arr) {
            if (v < 0) return true;   // 找到就立即返回，不再继续
        }
        return false;
    }
}`,
  },

  // =========================================================
  // 第十章：增强 for 循环
  // =========================================================
  {
    id: "java-foreach",
    group: "数组与控制流",
    icon: "📌",
    title: "增强 for 循环",
    content: `## 增强 for 循环（for-each）

Java 5 引入了**增强 for 循环**（又称 for-each），让遍历数组和集合变得极其简洁，无需关心索引和长度，专注于"对每个元素做什么"。

### 语法

\`\`\`java
for (元素类型 变量 : 可迭代对象) {
    // 对变量操作
}
\`\`\`

\`\`\`java
int[] nums = {1, 2, 3, 4, 5};
for (int n : nums) {
    System.out.println(n);
}

List<String> list = List.of("A", "B", "C");
for (String s : list) {
    System.out.println(s);
}
\`\`\`

### 适用范围

for-each 可用于：
- **任何数组**（基本类型数组、对象数组）
- **实现了 \`Iterable\` 接口的对象**（如 \`List\`、\`Set\`，但 \`Map\` 本身不是）

遍历 \`Map\` 时要遍历 \`entrySet()\`、\`keySet()\` 或 \`values()\`：

\`\`\`java
Map<String, Integer> map = Map.of("a", 1, "b", 2);
for (Map.Entry<String, Integer> e : map.entrySet()) {
    System.out.println(e.getKey() + "=" + e.getValue());
}
\`\`\`

### 与迭代器的等价关系

对集合而言，for-each **等价于**使用迭代器：

\`\`\`java
// for-each 形式
for (String s : list) { System.out.println(s); }

// 等价的迭代器形式
for (Iterator<String> it = list.iterator(); it.hasNext(); ) {
    String s = it.next();
    System.out.println(s);
}
\`\`\`

编译器会自动把 for-each 转换为迭代器调用（对集合）或索引访问（对数组）。

### 限制

for-each 虽然简洁，但有三大限制：

1. **无法获取索引**：如果需要下标（比如交替输出、修改原数组），只能用传统 for。
2. **无法修改集合结构**：遍历时不能 \`add\`/\`remove\`，否则抛 \`ConcurrentModificationException\`（迭代器的 fail-fast 机制）。
3. **变量是值的拷贝**：对基本类型数组，循环变量是元素的**副本**，修改它不影响原数组：

\`\`\`java
int[] a = {1, 2, 3};
for (int x : a) {
    x = 0;   // 只修改了局部变量 x，原数组不变！
}
System.out.println(Arrays.toString(a));  // 仍是 [1, 2, 3]
\`\`\`

但对**对象数组**，循环变量是引用的拷贝，通过它修改对象**属性**会影响原对象（因为指向同一对象）。

### 何时用 for-each，何时用传统 for

| 场景 | 推荐 |
| --- | --- |
| 纯遍历，不需要索引 | for-each |
| 需要下标 | 传统 for |
| 需要修改集合（增删） | 迭代器 \`remove\` 或传统 for + 索引 |
| 多集合并行遍历 | 传统 for + 索引 |
| 只读、追求简洁 | for-each |

### 小结

for-each 是遍历数组/集合的首选，简洁且不易越界；但它无法获取索引、无法结构修改、基本类型变量是拷贝。下方代码演示了 for-each 的用法及其限制。`,
    code: `// ============================================================
// 第 10 章：增强 for 循环（for-each）演示
// ============================================================
import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;
import java.util.Iterator;
import java.util.Map;
import java.util.HashMap;

public class Main {
    public static void main(String[] args) {
        // 1. for-each 遍历基本类型数组
        int[] nums = {10, 20, 30, 40, 50};
        System.out.println("--- 遍历数组 ---");
        for (int n : nums) {
            System.out.print(n + " ");
        }
        System.out.println();

        // 2. for-each 遍历集合
        List<String> names = new ArrayList<>(List.of("Alice", "Bob", "Carol"));
        System.out.println("--- 遍历 List ---");
        for (String s : names) {
            System.out.println("Hello, " + s);
        }

        // 3. for-each 遍历 Map（通过 entrySet）
        Map<String, Integer> scores = new HashMap<>();
        scores.put("语文", 90);
        scores.put("数学", 85);
        scores.put("英语", 95);
        System.out.println("--- 遍历 Map ---");
        for (Map.Entry<String, Integer> e : scores.entrySet()) {
            System.out.println(e.getKey() + ": " + e.getValue());
        }

        // 4. 限制演示：基本类型变量是拷贝，修改不影响原数组
        System.out.println("--- 限制：基本类型是拷贝 ---");
        int[] a = {1, 2, 3};
        for (int x : a) {
            x = 0;   // 仅修改局部变量
        }
        System.out.println("修改 x 后原数组: " + Arrays.toString(a));

        // 5. 对象数组：通过引用修改属性会影响原对象
        class Item {
            int v;
            Item(int v) { this.v = v; }
        }
        Item[] items = {new Item(1), new Item(2)};
        for (Item it : items) {
            it.v += 100;   // 通过引用修改属性，原对象改变
        }
        System.out.print("--- 对象数组修改属性后 ---: ");
        for (Item it : items) {
            System.out.print(it.v + " ");
        }
        System.out.println();

        // 6. for-each 等价于迭代器
        System.out.println("--- 迭代器等价写法 ---");
        Iterator<String> it = names.iterator();
        while (it.hasNext()) {
            System.out.print(it.next() + " ");
        }
        System.out.println();

        // 7. 需要索引时仍用传统 for
        System.out.println("--- 需要索引：带序号输出 ---");
        for (int i = 0; i < names.size(); i++) {
            System.out.println((i + 1) + ". " + names.get(i));
        }
    }
}`,
  },

  // =========================================================
  // 第十一章：嵌套循环
  // =========================================================
  {
    id: "java-nested-loops",
    group: "数组与控制流",
    icon: "🪆",
    title: "嵌套循环",
    content: `## 嵌套循环：循环中的循环

**嵌套循环** 是指一个循环体内又包含另一个循环。外层循环每执行一次，内层循环就完整执行一轮。嵌套循环在处理**二维结构**（矩阵、表格）、**组合枚举**（笛卡尔积）、**排序算法**等场景中不可或缺。

### 时间复杂度

嵌套循环的时间复杂度是**各层循环次数的乘积**。两层各 n 次的循环总执行 n² 次，三层则是 n³ 次。因此嵌套层数直接影响性能，需谨慎设计：

\`\`\`java
for (int i = 0; i < n; i++) {       // n 次
    for (int j = 0; j < n; j++) {   // n 次
        // 总共执行 n*n 次
    }
}
\`\`\`

### 经典案例一：九九乘法表

\`\`\`java
for (int i = 1; i <= 9; i++) {
    for (int j = 1; j <= i; j++) {
        System.out.printf("%dx%d=%-4d", j, i, i * j);
    }
    System.out.println();
}
\`\`\`

外层控制行，内层控制列，内层上限随外层变化，形成三角形。

### 经典案例二：冒泡排序

冒泡排序是嵌套循环的典型应用，每轮把最大元素"冒泡"到末尾：

\`\`\`java
for (int i = 0; i < n - 1; i++) {           // n-1 轮
    for (int j = 0; j < n - 1 - i; j++) {   // 每轮比较范围递减
        if (a[j] > a[j + 1]) {
            int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
        }
    }
}
\`\`\`

时间复杂度 O(n²)，空间 O(1)，稳定排序。

### 经典案例三：矩阵转置

\`\`\`java
int[][] m = {{1, 2, 3}, {4, 5, 6}};     // 2 行 3 列
int[][] t = new int[3][2];              // 转置后 3 行 2 列
for (int i = 0; i < m.length; i++) {
    for (int j = 0; j < m[i].length; j++) {
        t[j][i] = m[i][j];              // 行列互换
    }
}
\`\`\`

### 经典案例四：二维遍历与求和

\`\`\`java
int sum = 0;
for (int[] row : matrix) {
    for (int v : row) {
        sum += v;
    }
}
\`\`\`

### 性能考虑

1. **层数不宜过深**：超过 3 层通常意味着算法可以优化。
2. **尽量把不变的计算移到外层**：内层循环每次都执行的计算，能提到外层就提。
3. **提前退出**：找到目标就用 \`break\`（或标签 break）跳出，避免无谓迭代。
4. **选择合适算法**：O(n²) 的嵌套循环，有时可用哈希表降到 O(n)。

### 小结

嵌套循环处理二维结构、组合枚举、排序等；时间复杂度是乘积关系，层数越深性能越差；务必优化内层、善用提前退出。下方代码演示了乘法表、冒泡排序、矩阵转置等经典案例。`,
    code: `// ============================================================
// 第 11 章：嵌套循环演示
// ============================================================
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        // 1. 九九乘法表
        System.out.println("--- 九九乘法表 ---");
        for (int i = 1; i <= 9; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.printf("%dx%d=%-4d", j, i, i * j);
            }
            System.out.println();
        }

        // 2. 冒泡排序
        System.out.println("--- 冒泡排序 ---");
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        System.out.println("排序前: " + Arrays.toString(arr));
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            boolean swapped = false;   // 优化：若本轮无交换，说明已有序
            for (int j = 0; j < n - 1 - i; j++) {
                if (arr[j] > arr[j + 1]) {
                    int t = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = t;
                    swapped = true;
                }
            }
            if (!swapped) break;   // 提前结束
        }
        System.out.println("排序后: " + Arrays.toString(arr));

        // 3. 矩阵转置
        System.out.println("--- 矩阵转置 ---");
        int[][] m = {{1, 2, 3}, {4, 5, 6}};   // 2 行 3 列
        int rows = m.length;
        int cols = m[0].length;
        int[][] t = new int[cols][rows];       // 转置后 3 行 2 列
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                t[j][i] = m[i][j];
            }
        }
        System.out.println("原矩阵:");
        for (int[] row : m) System.out.println("  " + Arrays.toString(row));
        System.out.println("转置后:");
        for (int[] row : t) System.out.println("  " + Arrays.toString(row));

        // 4. 二维数组求和
        System.out.println("--- 二维数组求和 ---");
        int[][] grid = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
        int sum = 0;
        for (int[] row : grid) {
            for (int v : row) {
                sum += v;
            }
        }
        System.out.println("总和: " + sum);

        // 5. 笛卡尔积：颜色 × 尺寸
        System.out.println("--- 笛卡尔积 ---");
        String[] colors = {"红", "蓝"};
        String[] sizes = {"S", "M", "L"};
        for (String c : colors) {
            for (String s : sizes) {
                System.out.print(c + s + " ");
            }
        }
        System.out.println();

        // 6. 打印直角三角形
        System.out.println("--- 直角三角形 ---");
        for (int i = 1; i <= 5; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.print("*");
            }
            System.out.println();
        }
    }
}`,
  },

  // =========================================================
  // 第十二章：循环优化技巧
  // =========================================================
  {
    id: "java-loop-optimization",
    group: "数组与控制流",
    icon: "🚀",
    title: "循环优化技巧",
    content: `## 循环优化技巧：让热点代码跑得更快

循环往往是程序的热点（hotspot），尤其当循环次数巨大时，微小的优化也能带来可观的收益。但优化前要先记住 Knuth 的名言："**过早优化是万恶之源**"——先用清晰的代码实现功能，再用性能分析工具定位真正的瓶颈，再有针对性地优化。

### 一、减少循环内的重复计算

循环不变的计算应**提到循环外**，避免每次迭代都重算：

\`\`\`java
// 反例：每次都调用 list.size()
for (int i = 0; i < list.size(); i++) { ... }

// 优化：缓存 size
int len = list.size();
for (int i = 0; i < len; i++) { ... }
\`\`\`

现代 JVM 的 JIT 编译器通常能消除这类开销，但显式提出来更保险，也利于阅读。

### 二、提前退出

找到目标就立刻 \`break\`，避免无谓迭代：

\`\`\`java
for (int x : arr) {
    if (x == target) {
        found = true;
        break;   // 找到即停
    }
}
\`\`\`

### 三、循环展开（Loop Unrolling）

通过**减少循环次数、增加每次处理量**，降低循环控制开销。JVM 会自动做部分展开，但手动展开有时更有效：

\`\`\`java
// 原始
for (int i = 0; i < n; i++) { sum += a[i]; }

// 展开 4 倍
int i = 0;
int limit = n - 3;
for (; i < limit; i += 4) {
    sum += a[i] + a[i+1] + a[i+2] + a[i+3];
}
for (; i < n; i++) { sum += a[i]; }   // 处理剩余
\`\`\`

注意：过度展开会降低代码可读性，且可能影响 JIT 优化，需实测验证。

### 四、避免在循环内创建对象

每次 \`new\` 都会触发堆分配和 GC 压力。能复用的对象应**提到循环外**：

\`\`\`java
// 反例：每次创建新对象
for (String s : list) {
    StringBuilder sb = new StringBuilder();
    sb.append(s).append("!");
    process(sb.toString());
}

// 优化：复用同一个对象
StringBuilder sb = new StringBuilder();
for (String s : list) {
    sb.setLength(0);          // 清空而非 new
    sb.append(s).append("!");
    process(sb.toString());
}
\`\`\`

### 五、增强 for vs 索引 for

| 场景 | 推荐 |
| --- | --- |
| 数组遍历 | 二者性能接近，for-each 更简洁 |
| ArrayList | for-each 略快（避免每次 \`get(i)\`） |
| LinkedList | **必须 for-each**（索引 \`get(i)\` 是 O(n)，整体 O(n²)） |
| 需要索引/修改 | 索引 for |

### 六、选择合适的数据结构

循环性能常受数据结构影响：LinkedList 用索引遍历是灾难（O(n²)），换 Iterator 或 ArrayList 即可 O(n)。

### 七、利用短路和分支预测

把**更可能成立**或**计算更廉价**的条件放在 \`&&\` / \`||\` 左侧：

\`\`\`java
if (cheapCheck && expensiveCheck) { }   // cheap 失败就跳过 expensive
\`\`\`

### 小结

循环优化的核心原则：**减少循环内工作、提前退出、避免无谓分配、选对数据结构**。但绝不为微小收益牺牲可读性，除非是经过测量的热点。下方代码对比了优化前后的一些写法。`,
    code: `// ============================================================
// 第 12 章：循环优化技巧演示
// ============================================================
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        // 1. 优化一：减少循环内重复计算
        List<Integer> list = new ArrayList<>();
        for (int i = 0; i < 10000; i++) list.add(i);

        // 反例：每次都调用 size()
        long sum1 = 0;
        for (int i = 0; i < list.size(); i++) {
            sum1 += list.get(i);
        }
        // 优化：缓存长度
        long sum2 = 0;
        int size = list.size();
        for (int i = 0; i < size; i++) {
            sum2 += list.get(i);
        }
        System.out.println("反例 sum = " + sum1 + "，优化 sum = " + sum2);

        // 2. 优化二：提前退出
        int[] arr = {3, 7, 2, 9, 5, 8, 1};
        int target = 9;
        int foundIdx = -1;
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target) {
                foundIdx = i;
                break;   // 找到即停，不继续扫描
            }
        }
        System.out.println("目标 " + target + " 的索引: " + foundIdx);

        // 3. 优化三：循环展开
        int[] data = new int[100];
        for (int i = 0; i < data.length; i++) data[i] = i + 1;
        long sum = 0;
        int n = data.length;
        int i = 0;
        int limit = n - 3;
        for (; i < limit; i += 4) {
            sum += data[i] + data[i + 1] + data[i + 2] + data[i + 3];
        }
        for (; i < n; i++) sum += data[i];   // 处理剩余
        System.out.println("循环展开求和: " + sum);

        // 4. 优化四：复用对象，避免循环内 new
        StringBuilder sb = new StringBuilder();
        String[] words = {"Java", "Kotlin", "Scala", "Groovy"};
        StringBuilder result = new StringBuilder();
        for (String w : words) {
            sb.setLength(0);          // 清空复用
            sb.append(w).append("-").append(w.length());
            result.append(sb.toString()).append(" ");
        }
        System.out.println("复用 StringBuilder: " + result.toString().trim());

        // 5. 优化五：LinkedList 用 for-each 而非索引
        LinkedList<Integer> linked = new LinkedList<>();
        for (int k = 0; k < 1000; k++) linked.add(k);

        // 错误示范（性能差）：索引 get(i) 是 O(n)
        // for (int k = 0; k < linked.size(); k++) sum += linked.get(k);

        // 正确做法：for-each 用迭代器，O(n)
        long linkedSum = 0;
        for (int v : linked) linkedSum += v;
        System.out.println("LinkedList for-each 求和: " + linkedSum);

        // 6. 优化六：短路条件，廉价检查放左边
        String s = "hello";
        if (s != null && s.length() > 3 && s.contains("ell")) {
            System.out.println("短路判断通过: " + s);
        }
    }
}`,
  },

  // =========================================================
  // 第十三章：数组排序
  // =========================================================
  {
    id: "java-arrays-sorting",
    group: "数组与控制流",
    icon: "📈",
    title: "数组排序",
    content: `## 数组排序：从自然序到自定义序

排序是数组最常用的操作之一。\`Arrays\` 工具类提供了强大的排序能力，既支持**自然排序**，也支持**自定义比较器**，还能并行排序以利用多核。

### Arrays.sort：原地排序

\`Arrays.sort(arr)\` 对数组**原地排序**（不返回新数组）。对不同类型采用不同算法：

- **基本类型**：双轴快速排序（Dual-Pivot Quicksort），平均 O(n log n)。
- **对象类型**：TimSort（归并排序的改进），稳定排序，O(n log n)。

\`\`\`java
int[] a = {5, 2, 8, 1, 9};
Arrays.sort(a);   // [1, 2, 5, 8, 9]
\`\`\`

也可以**只排序区间** \`[fromIndex, toIndex)\`：

\`\`\`java
Arrays.sort(a, 1, 4);   // 只排索引 1、2、3
\`\`\`

### 自然排序（Comparable）

对象数组的"自然排序"依赖元素实现 \`Comparable<T>\` 接口的 \`compareTo\` 方法。\`String\`、\`Integer\` 等内置类都已实现：

\`\`\`java
String[] names = {"Charlie", "Alice", "Bob"};
Arrays.sort(names);   // 按字典序：[Alice, Bob, Charlie]
\`\`\`

### 逆序排序

用 \`Collections.reverseOrder()\` 获取逆序比较器（仅对象数组，基本类型需手动转换）：

\`\`\`java
Arrays.sort(names, Collections.reverseOrder());  // [Charlie, Bob, Alice]
\`\`\`

### 自定义 Comparator

当自然序不满足需求时，传入 \`Comparator\` 定制排序规则：

\`\`\`java
// 按字符串长度排序
Arrays.sort(names, Comparator.comparingInt(String::length));

// 按年龄排序
Arrays.sort(people, Comparator.comparingInt(p -> p.age));
\`\`\`

\`Comparator\` 支持链式组合：\`comparing(...).thenComparing(...)\` 实现多级排序。

### 对象数组排序

自定义类排序有两种方式：

1. **实现 \`Comparable\`**：定义类的"天然顺序"。
2. **传入 \`Comparator\`**：定义"临时顺序"，灵活可切换。

\`\`\`java
class Person implements Comparable<Person> {
    String name; int age;
    public int compareTo(Person o) { return Integer.compare(age, o.age); }
}
Arrays.sort(people);   // 用自然序（按 age）
Arrays.sort(people, Comparator.comparing(p -> p.name));  // 临时按 name
\`\`\`

### parallelSort：并行排序

\`Arrays.parallelSort\` 利用 ForkJoinPool 多线程排序，**数据量大时**（约 > 8192 元素）比 \`sort\` 更快；小数据则退化为单线程：

\`\`\`java
int[] big = new int[1_000_000];
Arrays.parallelSort(big);
\`\`\`

### 排序稳定性

- **TimSort（对象排序）**：稳定（相等元素相对顺序不变）。
- **双轴快排（基本类型）**：不稳定（但基本类型无"身份"，无所谓稳定性）。

若需稳定排序基本类型，需转成包装类用 \`sort\`。

### 小结

\`Arrays.sort\` 原地排序，对象用 TimSort（稳定），基本类型用快排（不稳定但快）；\`Comparator\` 灵活定制规则；\`parallelSort\` 适合大数据量。下方代码演示了升序、逆序、按属性、多级排序和并行排序。`,
    code: `// ============================================================
// 第 13 章：数组排序演示
// ============================================================
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;

// 自定义类：实现 Comparable 定义自然序
class Person implements Comparable<Person> {
    String name;
    int age;

    Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // 自然序：按年龄升序
    @Override
    public int compareTo(Person o) {
        return Integer.compare(this.age, o.age);
    }

    @Override
    public String toString() {
        return name + "(" + age + ")";
    }
}

public class Main {
    public static void main(String[] args) {
        // 1. 基本类型数组排序
        int[] nums = {5, 2, 8, 1, 9, 3};
        Arrays.sort(nums);
        System.out.println("升序: " + Arrays.toString(nums));

        // 2. 区间排序：只排索引 [1, 4)
        int[] partial = {9, 3, 1, 7, 5, 2};
        Arrays.sort(partial, 1, 4);
        System.out.println("区间排序[1,4): " + Arrays.toString(partial));

        // 3. 对象数组自然排序（String 字典序）
        String[] names = {"Charlie", "Alice", "Bob", "David"};
        Arrays.sort(names);
        System.out.println("字符串升序: " + Arrays.toString(names));

        // 4. 逆序排序（对象数组）
        Arrays.sort(names, Collections.reverseOrder());
        System.out.println("字符串逆序: " + Arrays.toString(names));

        // 5. 自定义 Comparator：按字符串长度
        Arrays.sort(names, Comparator.comparingInt(String::length));
        System.out.println("按长度排序: " + Arrays.toString(names));

        // 6. 对象数组：自然序（按年龄）
        Person[] people = {
            new Person("Alice", 30),
            new Person("Bob", 25),
            new Person("Carol", 35),
            new Person("Dave", 25)
        };
        Arrays.sort(people);
        System.out.println("按年龄自然序: " + Arrays.toString(people));

        // 7. 多级排序：先按年龄升序，年龄相同按姓名字典序
        Arrays.sort(people, Comparator
                .comparingInt((Person p) -> p.age)
                .thenComparing(p -> p.name));
        System.out.println("多级排序(年龄,姓名): " + Arrays.toString(people));

        // 8. 基本类型逆序：需手动转包装类或反向比较
        Integer[] boxed = {5, 2, 8, 1, 9, 3};
        Arrays.sort(boxed, Collections.reverseOrder());
        System.out.println("基本类型逆序(需包装): " + Arrays.toString(boxed));

        // 9. parallelSort：并行排序大数据量
        int[] big = new int[1000];
        for (int i = 0; i < big.length; i++) {
            big[i] = (int) (Math.random() * 10000);
        }
        Arrays.parallelSort(big);
        System.out.println("parallelSort 前 5 个: "
                + Arrays.toString(Arrays.copyOfRange(big, 0, 5)));
        // 验证是否有序
        boolean sorted = true;
        for (int i = 1; i < big.length; i++) {
            if (big[i] < big[i - 1]) { sorted = false; break; }
        }
        System.out.println("parallelSort 结果是否有序: " + sorted);
    }
}`,
  },

  // =========================================================
  // 第十四章：数组查找
  // =========================================================
  {
    id: "java-arrays-searching",
    group: "数组与控制流",
    icon: "🔎",
    title: "数组查找",
    content: `## 数组查找：线性查找与二分查找

查找（搜索）是数组最常见操作之一：判断元素是否存在、找到其索引、统计出现次数。Java 提供了两种主流查找方式——**线性查找**和**二分查找**，各有适用场景。

### 线性查找（Linear Search）

从头到尾逐个比较，**无需数组有序**，时间复杂度 **O(n)**：

\`\`\`java
int indexOf(int[] a, int target) {
    for (int i = 0; i < a.length; i++) {
        if (a[i] == target) return i;
    }
    return -1;   // 未找到
}
\`\`\`

线性查找适用于**小数组**、**无序数组**、或**只需查找一次**的场景。简单直接，是万能但非最优的方法。

### 二分查找（Binary Search）

要求数组**必须有序**，每次比较中点将范围减半，时间复杂度 **O(log n)**，在大数据量下远胜线性查找：

\`\`\`java
int idx = Arrays.binarySearch(sortedArr, target);
\`\`\`

\`Arrays.binarySearch\` 的返回值含义：
- **找到**：返回目标元素的索引（不一定是最先出现的位置）。
- **未找到**：返回 \`-(插入点 + 1)\`，其中"插入点"是保持有序时应插入的位置。

\`\`\`java
int[] a = {10, 20, 30, 40, 50};
Arrays.binarySearch(a, 30);   // 2
Arrays.binarySearch(a, 25);   // -3（应在索引 2 插入）
Arrays.binarySearch(a, 60);   // -6（应在索引 5 插入）
\`\`\`

### 二分查找的实现要点

手动实现二分查找要注意**边界**和**中点计算**：

\`\`\`java
int lo = 0, hi = a.length - 1;
while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;   // 防溢出，不要写 (lo + hi) / 2
    if (a[mid] == target) return mid;
    else if (a[mid] < target) lo = mid + 1;
    else hi = mid - 1;
}
return -1;
\`\`\`

### 判断是否存在

\`binarySearch\` 返回值 \`>= 0\` 即表示存在：

\`\`\`java
boolean contains = Arrays.binarySearch(a, target) >= 0;
\`\`\`

### 查找多次出现

二分查找找到的不一定是**第一次**出现的位置。若需统计出现次数或找首个/末个，有两种方法：

1. 找到后**向左右扩展**统计（最坏 O(n)）。
2. 用**lower_bound / upper_bound**思路二分定位边界（O(log n)）。

\`\`\`java
// 统计 target 出现次数
int idx = Arrays.binarySearch(a, target);
int count = 0;
if (idx >= 0) {
    int l = idx;
    while (l > 0 && a[l - 1] == target) l--;   // 左扩
    int r = idx;
    while (r < a.length - 1 && a[r + 1] == target) r++;  // 右扩
    count = r - l + 1;
}
\`\`\`

### 选择策略

| 场景 | 推荐方法 |
| --- | --- |
| 无序数组 | 线性查找 O(n) |
| 有序数组、查一次 | 二分查找 O(log n) |
| 有序数组、查多次 | 二分查找（摊销成本低） |
| 频繁查找 | 转 \`HashSet\`/\`TreeSet\`，O(1) / O(log n) |
| 需要保持有序 | \`TreeSet\` |

### 小结

线性查找万能但 O(n)；二分查找要求有序但 O(log n)；\`binarySearch\` 未找到返回 \`-(插入点+1)\`；查找多次出现可扩展或用边界二分。下方代码演示了这些查找方式。`,
    code: `// ============================================================
// 第 14 章：数组查找演示
// ============================================================
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        // 1. 线性查找：无序数组
        int[] unsorted = {40, 10, 50, 20, 30, 10, 60};
        int target = 50;
        int idx = linearSearch(unsorted, target);
        System.out.println("线性查找 " + target + ": 索引 = " + idx);

        // 2. 判断是否存在
        boolean exists = linearSearch(unsorted, 99) >= 0;
        System.out.println("99 是否存在: " + exists);

        // 3. 查找所有出现位置
        System.out.print("10 的所有位置: ");
        for (int i = 0; i < unsorted.length; i++) {
            if (unsorted[i] == 10) System.out.print(i + " ");
        }
        System.out.println();

        // 4. 二分查找：必须先排序
        int[] sorted = {10, 20, 30, 40, 50, 60, 70};
        System.out.println("有序数组: " + Arrays.toString(sorted));

        int found = Arrays.binarySearch(sorted, 30);
        System.out.println("binarySearch(30) = " + found);

        // 5. 未找到：返回 -(插入点+1)
        int nf1 = Arrays.binarySearch(sorted, 25);
        System.out.println("binarySearch(25) = " + nf1
                + "（插入点 = " + (-(nf1 + 1)) + "）");
        int nf2 = Arrays.binarySearch(sorted, 80);
        System.out.println("binarySearch(80) = " + nf2
                + "（插入点 = " + (-(nf2 + 1)) + "）");

        // 6. 手动实现二分查找
        int manual = binarySearch(sorted, 60);
        System.out.println("手动二分查找 60: " + manual);

        // 7. 统计有序数组中重复元素出现次数
        int[] withDups = {10, 20, 20, 20, 30, 30, 40};
        System.out.println("含重复: " + Arrays.toString(withDups));
        int count = countOccurrences(withDups, 20);
        System.out.println("20 出现次数: " + count);

        // 8. 找首个出现位置（lower bound 思路）
        int first = findFirst(withDups, 20);
        System.out.println("20 首个位置: " + first);
        int last = findLast(withDups, 20);
        System.out.println("20 末个位置: " + last);
    }

    // 线性查找
    static int linearSearch(int[] a, int target) {
        for (int i = 0; i < a.length; i++) {
            if (a[i] == target) return i;
        }
        return -1;
    }

    // 手动二分查找（注意防溢出的中点计算）
    static int binarySearch(int[] a, int target) {
        int lo = 0, hi = a.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;   // 防 (lo+hi) 溢出
            if (a[mid] == target) return mid;
            else if (a[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }

    // 统计有序数组中目标出现次数
    static int countOccurrences(int[] a, int target) {
        int idx = Arrays.binarySearch(a, target);
        if (idx < 0) return 0;
        int count = 1;
        // 向左扩展
        for (int l = idx - 1; l >= 0 && a[l] == target; l--) count++;
        // 向右扩展
        for (int r = idx + 1; r < a.length && a[r] == target; r++) count++;
        return count;
    }

    // lower bound：找首个 >= target 的位置（这里找首个 == target）
    static int findFirst(int[] a, int target) {
        int lo = 0, hi = a.length - 1, result = -1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] == target) {
                result = mid;
                hi = mid - 1;   // 继续向左找更早的
            } else if (a[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return result;
    }

    // upper bound 思路：找末个 == target 的位置
    static int findLast(int[] a, int target) {
        int lo = 0, hi = a.length - 1, result = -1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] == target) {
                result = mid;
                lo = mid + 1;   // 继续向右找更晚的
            } else if (a[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return result;
    }
}`,
  },

  // =========================================================
  // 第十五章：数组遍历方式
  // =========================================================
  {
    id: "java-arrays-iteration",
    group: "数组与控制流",
    icon: "🔄",
    title: "数组遍历方式",
    content: `## 数组遍历方式：五种姿势对比

遍历数组是日常编程的高频操作。Java 提供了多种遍历方式，各有特点，理解它们的差异能帮我们在不同场景做出合适选择。

### 方式一：索引 for 循环

最经典、最灵活，可获取下标、可修改元素、可反向遍历、可跳跃：

\`\`\`java
for (int i = 0; i < arr.length; i++) {
    System.out.println(arr[i]);
}
\`\`\`

适用：需要索引、需要修改原数组、需要非顺序遍历。

### 方式二：增强 for（for-each）

最简洁，只读遍历，无法获取索引：

\`\`\`java
for (int v : arr) {
    System.out.println(v);
}
\`\`\`

适用：纯遍历，不关心索引，追求可读性。

### 方式三：Arrays.toString

把数组转为 \`[a, b, c]\` 形式字符串，**调试和快速查看**首选，不适合逐元素处理：

\`\`\`java
System.out.println(Arrays.toString(arr));
\`\`\`

多维数组用 \`Arrays.deepToString\`。

### 方式四：Stream 遍历

\`Arrays.stream\` 把数组转为 \`Stream\`，支持函数式操作（过滤、映射、聚合），代码声明式、可链式：

\`\`\`java
Arrays.stream(arr).forEach(System.out::println);

int sum = Arrays.stream(arr).filter(x -> x > 0).sum();
\`\`\`

适用：需要链式数据处理、并行流、聚合计算。注意基本类型数组有专门的 \`IntStream\`/\`LongStream\`/\`DoubleStream\`，避免装箱开销。

### 方式五：通过 asList 转迭代器

\`Arrays.asList\` 把对象数组转为 \`List\`，再用迭代器或 for-each 遍历。**注意**：基本类型数组不能直接用（\`asList(int[])\` 会得到 \`List<int[]>\`，需 boxed）：

\`\`\`java
String[] arr = {"a", "b", "c"};
Iterator<String> it = Arrays.asList(arr).iterator();
while (it.hasNext()) { System.out.println(it.next()); }
\`\`\`

### 性能对比

| 方式 | 性能 | 灵活性 | 可读性 |
| --- | --- | --- | --- |
| 索引 for | 高 | 最高（可改/可跳） | 中 |
| for-each | 高（数组）/ 略低（集合） | 低（只读） | 高 |
| Arrays.toString | 低（拼字符串） | 无 | 仅调试 |
| Stream | 中（有开销） | 高（函数式） | 高 |
| 迭代器 | 中 | 中 | 中 |

**经验法则**：
- 大数据量、性能敏感：**索引 for** 或 **for-each**。
- 需要过滤/映射/聚合：**Stream**（代码清晰，但有小开销）。
- 调试打印：**Arrays.toString**。
- 需要 List 视图：**asList + 迭代器**。

### 修改原数组的注意事项

- 索引 for 可直接 \`arr[i] = ...\` 修改元素。
- for-each 对**基本类型**变量是拷贝，修改不影响原数组；对**对象数组**修改属性会影响原对象。
- Stream 是只读的，且不应在遍历时修改源数组（导致行为未定义）。

### 小结

五种遍历各有所长：索引 for 灵活、for-each 简洁、toString 调试、Stream 函数式、迭代器兼容 List。性能敏感选前两者，函数式处理选 Stream。下方代码对比了这些方式。`,
    code: `// ============================================================
// 第 15 章：数组遍历方式演示
// ============================================================
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        int[] arr = {10, 20, 30, 40, 50};

        // 1. 索引 for：可获取下标，可修改
        System.out.println("--- 方式一：索引 for ---");
        for (int i = 0; i < arr.length; i++) {
            System.out.println("arr[" + i + "] = " + arr[i]);
        }

        // 2. 增强 for：简洁，只读
        System.out.println("--- 方式二：for-each ---");
        for (int v : arr) {
            System.out.print(v + " ");
        }
        System.out.println();

        // 3. Arrays.toString：调试打印
        System.out.println("--- 方式三：Arrays.toString ---");
        System.out.println(Arrays.toString(arr));

        // 多维数组用 deepToString
        int[][] matrix = {{1, 2}, {3, 4}};
        System.out.println("多维: " + Arrays.deepToString(matrix));

        // 4. Stream 遍历（IntStream，无装箱开销）
        System.out.println("--- 方式四：Stream 遍历 ---");
        Arrays.stream(arr).forEach(v -> System.out.print(v + " "));
        System.out.println();

        // Stream 聚合操作
        int sum = Arrays.stream(arr).sum();
        int max = Arrays.stream(arr).max().orElse(0);
        double avg = Arrays.stream(arr).average().orElse(0);
        System.out.println("sum=" + sum + ", max=" + max + ", avg=" + avg);

        // Stream 过滤
        System.out.print("大于 25 的元素: ");
        Arrays.stream(arr).filter(v -> v > 25).forEach(v -> System.out.print(v + " "));
        System.out.println();

        // 5. asList + 迭代器（仅对象数组）
        System.out.println("--- 方式五：asList + 迭代器 ---");
        String[] words = {"Java", "Kotlin", "Scala"};
        List<String> list = Arrays.asList(words);
        Iterator<String> it = list.iterator();
        while (it.hasNext()) {
            System.out.print(it.next() + " ");
        }
        System.out.println();

        // 6. 简单性能对比（用大数组感受差异）
        int[] big = new int[10_000_000];
        for (int i = 0; i < big.length; i++) big[i] = i;

        long t1 = System.currentTimeMillis();
        long s1 = 0;
        for (int i = 0; i < big.length; i++) s1 += big[i];
        long t2 = System.currentTimeMillis();
        long s2 = 0;
        for (int v : big) s2 += v;
        long t3 = System.currentTimeMillis();
        long s3 = Arrays.stream(big).sum();
        long t4 = System.currentTimeMillis();

        System.out.println("--- 性能对比（求和 " + big.length + " 个元素）---");
        System.out.println("索引 for:  " + (t2 - t1) + " ms, sum=" + s1);
        System.out.println("for-each:  " + (t3 - t2) + " ms, sum=" + s2);
        System.out.println("Stream:    " + (t4 - t3) + " ms, sum=" + s3);
    }
}`,
  },
];
