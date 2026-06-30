export const chapters = [
  {
    id: "py6-file-read",
    group: "文件与异常",
    icon: "📖",
    title: "文件读取",
    content: `## 文件读取基础

文件读取是Python中最常见的I/O操作之一。

### 核心方法

- \`open(file, mode='r', encoding=None)\`：打开文件，返回文件对象
- \`read(size=-1)\`：读取指定字节数，默认读取全部
- \`readline(size=-1)\`：读取一行
- \`readlines(hint=-1)\`：读取所有行，返回列表
- \`close()\`：关闭文件

### 编码问题

在Windows上默认编码可能是GBK，处理中文文件时务必指定\`encoding='utf-8'\`。

### 大文件读取

使用for循环直接迭代文件对象，逐行读取，内存友好。

### 常见错误

- FileNotFoundError：文件路径错误
- UnicodeDecodeError：编码不匹配
- PermissionError：权限不足

### 最佳实践

始终使用with语句确保文件正确关闭，这是Python推荐的方式。`,
    code: `import tempfile
import os

# 创建临时文件演示，程序结束自动删除
with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as f:
    temp_path = f.name
    f.write("第一行：Python文件读取教程\\n")
    f.write("第二行：read()方法读取全部内容\\n")
    f.write("第三行：readline()读取单行\\n")
    f.write("第四行：readlines()读取为列表\\n")
    f.write("第五行：大文件建议迭代读取\\n")

try:
    # ========== 1. read() 读取全部内容 ==========
    print("=" * 50)
    print("1. read() 读取全部内容")
    print("=" * 50)
    file = open(temp_path, 'r', encoding='utf-8')
    content = file.read()
    print(content)
    file.close()

    # ========== 2. read(size) 读取指定字符数 ==========
    print("=" * 50)
    print("2. read(10) 读取前10个字符")
    print("=" * 50)
    file = open(temp_path, 'r', encoding='utf-8')
    partial = file.read(10)
    print(f"读取内容: {repr(partial)}")
    file.close()

    # ========== 3. readline() 逐行读取 ==========
    print("=" * 50)
    print("3. readline() 逐行读取")
    print("=" * 50)
    file = open(temp_path, 'r', encoding='utf-8')
    line1 = file.readline()
    line2 = file.readline()
    print(f"第一行: {line1.rstrip()}")
    print(f"第二行: {line2.rstrip()}")
    file.close()

    # ========== 4. readlines() 读取所有行到列表 ==========
    print("=" * 50)
    print("4. readlines() 所有行作为列表")
    print("=" * 50)
    file = open(temp_path, 'r', encoding='utf-8')
    lines = file.readlines()
    print(f"共{len(lines)}行")
    for i, line in enumerate(lines, 1):
        print(f"  行{i}: {line.rstrip()}")
    file.close()

    # ========== 5. 迭代文件对象（大文件推荐） ==========
    print("=" * 50)
    print("5. 迭代文件对象（内存友好）")
    print("=" * 50)
    file = open(temp_path, 'r', encoding='utf-8')
    for lineno, line in enumerate(file, 1):
        print(f"  行{lineno}: {line.rstrip()}")
    file.close()

    # ========== 6. 二进制模式读取 ==========
    print("=" * 50)
    print("6. 二进制模式 'rb'")
    print("=" * 50)
    file = open(temp_path, 'rb')
    binary_data = file.read(20)
    print(f"二进制前20字节: {binary_data}")
    file.close()

finally:
    # 清理临时文件
    if os.path.exists(temp_path):
        os.unlink(temp_path)
        print(f"\\n临时文件已清理: {temp_path}")
`
  },
  {
    id: "py6-file-write",
    group: "文件与异常",
    icon: "✍️",
    title: "文件写入",
    content: `## 文件写入详解

### 核心方法

- \`write(s)\`：写入字符串，返回写入字符数
- \`writelines(lines)\`：写入字符串列表，不自动加换行
- \`flush()\`：刷新缓冲区，立即写入磁盘

### 文件模式

- \`'w'\`：写入模式，覆盖原有内容，文件不存在则创建
- \`'a'\`：追加模式，在文件末尾添加内容
- \`'x'\`：独占创建，文件已存在则报错
- \`'r+'\`：读写模式

### 注意事项

1. 'w'模式会清空原文件！重要数据请备份或使用'a'模式
2. write()不会自动添加换行符，需要手动加

3. writelines()接收字符串列表，元素间不加分隔符
4. 写入完成后记得close()或使用with语句

### 编码

写入中文时务必指定encoding='utf-8'，否则可能出现乱码。`,
    code: `import tempfile
import os

# 创建临时目录
temp_dir = tempfile.mkdtemp()
print(f"临时目录: {temp_dir}")

try:
    file1 = os.path.join(temp_dir, 'write_demo.txt')
    file2 = os.path.join(temp_dir, 'append_demo.txt')

    # ========== 1. write() 基础写入 ==========
    print("=" * 50)
    print("1. write() 写入文件（'w'模式覆盖）")
    print("=" * 50)
    f = open(file1, 'w', encoding='utf-8')
    count = f.write("第一行内容\\n")
    print(f"写入{count}个字符")
    f.write("第二行内容\\n")
    f.write("第三行：中文测试 ✓\\n")
    f.close()
    print("写入完成，文件内容：")
    print(open(file1, 'r', encoding='utf-8').read())

    # ========== 2. 'w'模式会覆盖原文件 ==========
    print("=" * 50)
    print("2. 'w'模式覆盖原文件（注意！）")
    print("=" * 50)
    f = open(file1, 'w', encoding='utf-8')
    f.write("【新内容】原来的内容被覆盖了！\\n")
    f.close()
    print("覆盖后内容：")
    print(open(file1, 'r', encoding='utf-8').read())

    # ========== 3. 'a' 追加模式 ==========
    print("=" * 50)
    print("3. 'a' 追加模式（不覆盖原内容）")
    print("=" * 50)
    f = open(file2, 'w', encoding='utf-8')
    f.write("初始第一行\\n")
    f.close()
    # 追加写入
    f = open(file2, 'a', encoding='utf-8')
    f.write("追加第二行\\n")
    f.write("追加第三行\\n")
    f.close()
    print("追加后内容：")
    print(open(file2, 'r', encoding='utf-8').read())

    # ========== 4. writelines() 写入列表 ==========
    print("=" * 50)
    print("4. writelines() 写入字符串列表")
    print("=" * 50)
    lines = ["列表项1\\n", "列表项2\\n", "列表项3（无换行符）"]
    f = open(file1, 'w', encoding='utf-8')
    f.writelines(lines)
    f.close()
    print("writelines后内容：")
    content = open(file1, 'r', encoding='utf-8').read()
    print(content)
    print("注意：最后一项没有换行符，不会自动换行！")

    # ========== 5. 二进制写入 ==========
    print("=" * 50)
    print("5. 'wb' 二进制写入")
    print("=" * 50)
    bin_file = os.path.join(temp_dir, 'binary.bin')
    f = open(bin_file, 'wb')
    f.write(bytes([65, 66, 67, 100, 101, 102]))  # ABCdef
    f.close()
    print(f"二进制文件大小: {os.path.getsize(bin_file)} 字节")
    print(f"读取验证: {open(bin_file, 'rb').read()}")

finally:
    # 清理临时目录及所有文件
    import shutil
    shutil.rmtree(temp_dir)
    print(f"\\n临时目录已清理: {temp_dir}")
`
  },
  {
    id: "py6-file-with",
    group: "文件与异常",
    icon: "🤝",
    title: "with 上下文管理器",
    content: `## with 上下文管理器

### 为什么用with？

手动调用close()可能因为异常导致文件无法关闭，造成资源泄漏。with语句能保证文件无论是否发生异常都会被正确关闭。

### 工作原理

with语句通过上下文管理器协议工作：
- \`__enter__()\`：进入with块时调用，返回值赋给as后的变量
- \`__exit__(exc_type, exc_val, exc_tb)\`：离开with块时调用，负责清理资源

### with的优势

1. **自动关闭**：即使发生异常也会关闭文件
2. **代码简洁**：不需要try/finally确保close
3. **异常安全**：资源正确释放

### 适用场景

- 文件操作（最常见）
- 数据库连接
- 线程锁
- 网络连接
- 任何需要获取/释放资源的场景

### 语法格式

\`\`\`python
with open('file.txt', 'r') as f:
    content = f.read()
# 离开with块后f自动关闭，即使内部出错
\`\`\``,
    code: `import tempfile
import os

# 创建临时文件
with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as f:
    temp_path = f.name
    f.write("Python with语句教程\\n")
    f.write("这是第二行\\n")
    f.write("这是第三行\\n")

try:
    # ========== 1. with基础用法 ==========
    print("=" * 50)
    print("1. with 基础：自动关闭文件")
    print("=" * 50)
    with open(temp_path, 'r', encoding='utf-8') as f:
        content = f.read()
        print(content)
        print(f"with块内文件是否关闭: {f.closed}")
    print(f"离开with块后文件是否关闭: {f.closed}")

    # ========== 2. 对比：不用with的危险写法 ==========
    print("=" * 50)
    print("2. 演示：异常时也能安全关闭")
    print("=" * 50)
    try:
        with open(temp_path, 'r', encoding='utf-8') as f:
            first_line = f.readline()
            print(f"读取一行: {first_line.rstrip()}")
            raise ValueError("模拟发生异常！")
    except ValueError as e:
        print(f"捕获异常: {e}")
        print(f"异常发生后文件是否关闭: {f.closed}")
    print("✓ 即使异常，文件仍被正确关闭！")

    # ========== 3. 同时打开多个文件 ==========
    print("=" * 50)
    print("3. 同时打开多个文件（复制文件）")
    print("=" * 50)
    copy_path = temp_path + '.copy'
    with open(temp_path, 'r', encoding='utf-8') as src, \\
         open(copy_path, 'w', encoding='utf-8') as dst:
        dst.write(src.read())
    print(f"文件已复制到: {os.path.basename(copy_path)}")
    print(f"目标文件内容: {open(copy_path, 'r', encoding='utf-8').read()}")
    os.unlink(copy_path)

    # ========== 4. with + 逐行迭代 ==========
    print("=" * 50)
    print("4. with + 逐行迭代（大文件推荐）")
    print("=" * 50)
    with open(temp_path, 'r', encoding='utf-8') as f:
        for i, line in enumerate(f, 1):
            print(f"  行{i}: {line.rstrip()}")

    # ========== 5. with写入文件 ==========
    print("=" * 50)
    print("5. with写入文件")
    print("=" * 50)
    write_path = temp_path + '.write'
    with open(write_path, 'w', encoding='utf-8') as f:
        f.write("with写入第一行\\n")
        f.write("with写入第二行\\n")
    print(f"写入文件存在: {os.path.exists(write_path)}")
    print("写入内容：")
    print(open(write_path, 'r', encoding='utf-8').read())
    os.unlink(write_path)

finally:
    os.unlink(temp_path)
    print(f"\\n临时文件已清理")
`
  },
  {
    id: "py6-file-modes",
    group: "文件与异常",
    icon: "📂",
    title: "文件打开模式详解",
    content: `## 文件打开模式全面解析

open()函数的mode参数决定文件打开方式：

### 基础模式（互斥）

| 模式 | 说明 | 文件不存在 | 原内容 |
|------|------|-----------|--------|
| \`r\` | 只读（默认） | 报错 | 保留 |
| \`w\` | 只写 | 创建 | 清空 |
| \`a\` | 追加 | 创建 | 保留，末尾追加 |
| \`x\` | 独占创建 | 创建 | 已存在则报错 |

### 扩展模式（可组合）

| 符号 | 说明 |
|------|------|
| \`b\` | 二进制模式 |
| \`t\` | 文本模式（默认） |
| \`+\` | 读写模式 |

### 常用组合

| 模式 | 含义 |
|------|------|
| \`rb\` | 二进制只读 |
| \`wb\` | 二进制写入 |
| \`ab\` | 二进制追加 |
| \`r+\` | 读写，文件必须存在 |
| \`w+\` | 读写，创建/覆盖 |
| \`a+\` | 读写，追加，指针在末尾 |

### 文本模式 vs 二进制模式

- 文本模式('t')：处理str类型，自动编码解码，处理换行符
- 二进制模式('b')：处理bytes类型，原样读写，适合图片/视频/可执行文件`,
    code: `import tempfile
import os
import io

temp_dir = tempfile.mkdtemp()
print(f"临时目录: {temp_dir}\\n")

try:
    # ========== 1. r模式：只读 ==========
    print("=" * 50)
    print("1. 'r' 只读模式（默认）")
    print("=" * 50)
    r_file = os.path.join(temp_dir, 'r_test.txt')
    with open(r_file, 'w', encoding='utf-8') as f:
        f.write("r模式测试内容\\n")
    with open(r_file, 'r', encoding='utf-8') as f:
        print(f"读取成功: {f.read().rstrip()}")
    try:
        f_read = open(r_file, 'r')
        f_read.write("尝试写入")  # r模式无法写入
        f_read.close()
    except io.UnsupportedOperation:
        print("✓ r模式不能写入，会抛异常")

    # ========== 2. w模式：覆盖写入 ==========
    print("\\n" + "=" * 50)
    print("2. 'w' 写入模式（清空原内容）")
    print("=" * 50)
    w_file = os.path.join(temp_dir, 'w_test.txt')
    with open(w_file, 'w', encoding='utf-8') as f:
        f.write("第一次写入\\n")
    with open(w_file, 'w', encoding='utf-8') as f:
        f.write("第二次写入（第一次的内容没了！）\\n")
    print("w模式后内容：")
    print(open(w_file, 'r', encoding='utf-8').read())

    # ========== 3. a模式：追加 ==========
    print("=" * 50)
    print("3. 'a' 追加模式（保留原内容）")
    print("=" * 50)
    a_file = os.path.join(temp_dir, 'a_test.txt')
    with open(a_file, 'w', encoding='utf-8') as f:
        f.write("初始内容\\n")
    with open(a_file, 'a', encoding='utf-8') as f:
        f.write("追加的内容1\\n")
        f.write("追加的内容2\\n")
    print("a模式后内容：")
    print(open(a_file, 'r', encoding='utf-8').read())

    # ========== 4. b模式：二进制 ==========
    print("=" * 50)
    print("4. 'b' 二进制模式")
    print("=" * 50)
    bin_file = os.path.join(temp_dir, 'bin_test.dat')
    data = bytes([0x48, 0x65, 0x6C, 0x6C, 0x6F])  # Hello
    with open(bin_file, 'wb') as f:
        f.write(data)
    with open(bin_file, 'rb') as f:
        result = f.read()
        print(f"写入字节: {data}")
        print(f"读取字节: {result}")
        print(f"解码为文本: {result.decode('ascii')}")

    # ========== 5. r+模式：读写（文件必须存在） ==========
    print("=" * 50)
    print("5. 'r+' 读写模式（不截断）")
    print("=" * 50)
    rp_file = os.path.join(temp_dir, 'rp_test.txt')
    with open(rp_file, 'w', encoding='utf-8') as f:
        f.write("AAAAAAAAAA")  # 10个A
    with open(rp_file, 'r+', encoding='utf-8') as f:
        print(f"原始内容: {f.read()}")
        f.seek(0)  # 回到开头
        f.write("BB")  # 覆盖前两个字符
    with open(rp_file, 'r', encoding='utf-8') as f:
        print(f"修改后: {f.read()}")

    # ========== 6. x模式：独占创建 ==========
    print("=" * 50)
    print("6. 'x' 独占创建模式")
    print("=" * 50)
    x_file = os.path.join(temp_dir, 'x_test.txt')
    with open(x_file, 'x', encoding='utf-8') as f:
        f.write("x模式创建成功\\n")
    print("首次创建成功")
    try:
        with open(x_file, 'x', encoding='utf-8') as f:
            pass
    except FileExistsError:
        print("✓ 文件已存在时x模式报错！")

finally:
    import shutil
    shutil.rmtree(temp_dir)
    print(f"\\n临时目录已清理")
`
  },
  {
    id: "py6-file-csv",
    group: "文件与异常",
    icon: "📊",
    title: "CSV 文件处理",
    content: `## CSV 文件处理

CSV(Comma-Separated Values)是最常见的数据交换格式之一。Python标准库提供\`csv\`模块处理CSV文件。

### 核心类与函数

- \`csv.reader(file)\`：返回行迭代器，每行是列表
- \`csv.writer(file)\`：写入器，writerow/writerows
- \`csv.DictReader(file)\`：字典读取器，每行是OrderedDict
- \`csv.DictWriter(file, fieldnames)\`：字典写入器

### 常用参数

- \`delimiter=','\`：字段分隔符，可用制表符	等
- \`quotechar='\\"'\`：引用字符
- \`lineterminator='
'\`：行终止符
- \`encoding='utf-8'\`：文件编码

### 注意事项

1. 处理中文CSV用utf-8-sig编码可兼容Excel
2. 含逗号/换行符/引号的字段会自动加引号
3. 读取Excel生成的CSV可能需注意编码
4. DictWriter必须先调用writeheader()写入表头`,
    code: `import csv
import tempfile
import os

temp_dir = tempfile.mkdtemp()

try:
    csv_path = os.path.join(temp_dir, 'data.csv')

    # ========== 1. writer 写入CSV ==========
    print("=" * 50)
    print("1. csv.writer 写入")
    print("=" * 50)
    with open(csv_path, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        writer.writerow(['姓名', '年龄', '城市', '职业'])
        writer.writerow(['张三', 25, '北京', '工程师'])
        writer.writerow(['李四', 30, '上海', '设计师'])
        writer.writerows([
            ['王五', 28, '广州', '产品经理'],
            ['赵六', 35, '深圳', '数据分析师'],
            ['孙七, Jr.', 40, '杭州', '经理'],  # 含逗号自动加引号
        ])
    print("CSV文件已写入，内容预览：")
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        print(f.read())

    # ========== 2. reader 读取CSV ==========
    print("=" * 50)
    print("2. csv.reader 读取")
    print("=" * 50)
    with open(csv_path, 'r', newline='', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        for i, row in enumerate(reader):
            if i == 0:
                print(f"表头: {row}")
            else:
                print(f"  行{i}: {row}")

    # ========== 3. DictWriter 字典方式写入 ==========
    print("=" * 50)
    print("3. csv.DictWriter 字典写入")
    print("=" * 50)
    dict_csv = os.path.join(temp_dir, 'dict_data.csv')
    headers = ['id', 'name', 'score', 'grade']
    with open(dict_csv, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()  # 必须写入表头
        writer.writerow({'id': 1, 'name': '小明', 'score': 95, 'grade': 'A'})
        writer.writerow({'id': 2, 'name': '小红', 'score': 88, 'grade': 'B'})
        writer.writerows([
            {'id': 3, 'name': '小刚', 'score': 92, 'grade': 'A'},
            {'id': 4, 'name': '小美', 'score': 78, 'grade': 'C'},
        ])
    print("DictWriter写入内容：")
    print(open(dict_csv, 'r', encoding='utf-8-sig').read())

    # ========== 4. DictReader 字典方式读取 ==========
    print("=" * 50)
    print("4. csv.DictReader 字典读取")
    print("=" * 50)
    with open(dict_csv, 'r', newline='', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        print(f"表头字段: {reader.fieldnames}")
        for row in reader:
            print(f"  学生#{row['id']}: {row['name']}, 分数={row['score']}, 等级={row['grade']}")

    # ========== 5. 自定义分隔符 ==========
    print("=" * 50)
    print("5. 自定义分隔符（制表符）")
    print("=" * 50)
    tsv_path = os.path.join(temp_dir, 'data.tsv')
    with open(tsv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f, delimiter='\\t')
        writer.writerow(['产品', '价格', '库存'])
        writer.writerow(['Python教程', '99', '1000'])
        writer.writerow(['Java教程', '89', '500'])
    print("TSV内容（制表符分隔）：")
    print(open(tsv_path, 'r', encoding='utf-8').read())

finally:
    import shutil
    shutil.rmtree(temp_dir)
    print(f"\\n临时目录已清理")
`
  },
  {
    id: "py6-file-json",
    group: "文件与异常",
    icon: "📋",
    title: "JSON 序列化与反序列化",
    content: `## JSON 数据处理

JSON是现代应用最常用的数据交换格式，Python的\`json\`模块提供完整支持。

### 核心函数

| 函数 | 作用 |
|------|------|
| \`json.dumps(obj)\` | Python对象 → JSON字符串 |
| \`json.loads(s)\` | JSON字符串 → Python对象 |
| \`json.dump(obj, file)\` | Python对象 → 写入JSON文件 |
| \`json.load(file)\` | 读取JSON文件 → Python对象 |

### 类型映射

| Python | JSON |
|--------|------|
| dict | object |
| list, tuple | array |
| str | string |
| int, float | number |
| True/False | true/false |
| None | null |

### 常用参数

- \`ensure_ascii=False\`：不转义中文，直接输出Unicode
- \`indent=2\`：美化缩进，便于阅读
- \`sort_keys=True\`：按键名排序
- \`skipkeys=True\`：跳过无法序列化的键

### 注意事项

1. JSON不支持set、datetime、自定义类等类型
2. 元组序列化后变成数组（列表）
3. 键必须是字符串类型`,
    code: `import json
import tempfile
import os

temp_dir = tempfile.mkdtemp()

try:
    json_path = os.path.join(temp_dir, 'data.json')

    # ========== 1. dumps: Python对象 → JSON字符串 ==========
    print("=" * 50)
    print("1. json.dumps() 对象转JSON字符串")
    print("=" * 50)
    data = {
        "name": "Python教程",
        "version": 3.13,
        "is_free": True,
        "tags": ["编程", "入门", "实战"],
        "score": None,
        "author": {"name": "张老师", "age": 35}
    }
    json_str = json.dumps(data)
    print(f"默认输出（紧凑）:\\n{json_str}")
    json_str_pretty = json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True)
    print(f"\\n美化输出（中文不转义+缩进+排序）:\\n{json_str_pretty}")

    # ========== 2. loads: JSON字符串 → Python对象 ==========
    print("\\n" + "=" * 50)
    print("2. json.loads() JSON字符串转对象")
    print("=" * 50)
    json_text = '{"name": "李四", "age": 25, "skills": ["Python", "Go"]}'
    obj = json.loads(json_text)
    print(f"解析结果类型: {type(obj)}")
    print(f"姓名: {obj['name']}, 年龄: {obj['age']}")
    print(f"技能: {obj['skills']}")

    # ========== 3. dump: 写入JSON文件 ==========
    print("\\n" + "=" * 50)
    print("3. json.dump() 写入JSON文件")
    print("=" * 50)
    users = [
        {"id": 1, "name": "张三", "email": "zhangsan@example.com"},
        {"id": 2, "name": "李四", "email": "lisi@example.com"},
        {"id": 3, "name": "王五", "email": "wangwu@example.com"},
    ]
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(users, f, ensure_ascii=False, indent=2)
    print("JSON文件内容：")
    print(open(json_path, 'r', encoding='utf-8').read())

    # ========== 4. load: 读取JSON文件 ==========
    print("=" * 50)
    print("4. json.load() 读取JSON文件")
    print("=" * 50)
    with open(json_path, 'r', encoding='utf-8') as f:
        loaded_users = json.load(f)
    print(f"读取到{len(loaded_users)}个用户：")
    for user in loaded_users:
        print(f"  #{user['id']} {user['name']} <{user['email']}>")

    # ========== 5. 常见序列化问题演示 ==========
    print("=" * 50)
    print("5. 类型注意事项")
    print("=" * 50)
    print("tuple序列化后变成list：")
    tuple_data = (1, 2, 3, "hello")
    print(f"  原类型: {type(tuple_data)} = {tuple_data}")
    tuple_json = json.dumps(tuple_data)
    tuple_loaded = json.loads(tuple_json)
    print(f"  序列化再解析后: {type(tuple_loaded)} = {tuple_loaded}")

    print("\\n不能序列化set类型：")
    try:
        json.dumps({1, 2, 3})
    except TypeError as e:
        print(f"  错误: {e}")
        print("  解决: 先转成list -> json.dumps(list({1,2,3}))")

finally:
    import shutil
    shutil.rmtree(temp_dir)
    print(f"\\n临时目录已清理")
`
  },
  {
    id: "py6-file-pickle",
    group: "文件与异常",
    icon: "🥒",
    title: "pickle 序列化",
    content: `## pickle 二进制序列化

pickle是Python特有的序列化协议，可以将几乎任意Python对象序列化为二进制，也能反序列化还原。

### 核心函数

- \`pickle.dumps(obj)\`：对象 → bytes
- \`pickle.loads(bytes)\`：bytes → 对象
- \`pickle.dump(obj, file)\`：对象 → 二进制文件
- \`pickle.load(file)\`：二进制文件 → 对象

### pickle vs JSON

| 特性 | pickle | JSON |
|------|--------|------|
| 格式 | 二进制 | 文本 |
| 跨语言 | ❌ Python专用 | ✅ 通用 |
| 可读性 | ❌ 不可读 | ✅ 可读 |
| Python自定义对象 | ✅ 支持 | ❌ 不支持 |
| 安全性 | ⚠️ 不安全 | ✅ 安全 |

### ⚠️ 严重安全警告

**永远不要反序列化来自不受信任来源的pickle数据！**
恶意构造的pickle数据可以在反序列化时执行任意代码，造成严重安全漏洞。

### 适用场景

- 临时缓存Python对象
- 进程间传递Python对象
- 保存程序中间状态（自己生成自己读取）

### protocol版本

pickle有多个协议版本，协议越高越高效，但可能不兼容旧版Python。`,
    code: `import pickle
import tempfile
import os

temp_dir = tempfile.mkdtemp()

try:
    pkl_path = os.path.join(temp_dir, 'data.pkl')

    # ========== 1. 基本序列化/反序列化 ==========
    print("=" * 50)
    print("1. dumps/loads 基本用法")
    print("=" * 50)
    data = {
        "name": "pickle测试",
        "numbers": [1, 1, 2, 3, 5, 8],
        "nested": {"a": True, "b": None},
        "tuple": (10, 20, 30),
    }
    pickled = pickle.dumps(data)
    print(f"序列化后字节长度: {len(pickled)}")
    print(f"前30字节: {pickled[:30]}...")
    restored = pickle.loads(pickled)
    print(f"反序列化后: {restored}")
    print(f"元组类型保留: {type(restored['tuple'])}")

    # ========== 2. 序列化自定义类对象 ==========
    print("\\n" + "=" * 50)
    print("2. 序列化自定义类实例（JSON做不到！）")
    print("=" * 50)
    class Student:
        def __init__(self, name, score):
            self.name = name
            self.score = score
        def __repr__(self):
            return f"Student(name={self.name!r}, score={self.score})"
        def is_passed(self):
            return self.score >= 60

    stu = Student("小明", 95)
    print(f"原对象: {stu}")
    print(f"是否及格: {stu.is_passed()}")
    # pickle序列化
    stu_pickle = pickle.dumps(stu)
    stu_restored = pickle.loads(stu_pickle)
    print(f"反序列化: {stu_restored}")
    print(f"方法可调用: {stu_restored.is_passed()}")

    # ========== 3. dump/load 文件操作 ==========
    print("\\n" + "=" * 50)
    print("3. dump/load 文件读写")
    print("=" * 50)
    complex_data = {
        "list": [1, 2, 3],
        "set": {1, 2, 3},  # set! JSON不支持
        "dict": {"key": "value"},
        "student": Student("小红", 88),
    }
    with open(pkl_path, 'wb') as f:
        pickle.dump(complex_data, f)
    print(f"已写入pickle文件: {os.path.getsize(pkl_path)} 字节")
    with open(pkl_path, 'rb') as f:
        loaded = pickle.load(f)
    print(f"读取后: list={loaded['list']}")
    print(f"读取后: set={loaded['set']}")
    print(f"读取后: student={loaded['student']}")

    # ========== 4. protocol参数 ==========
    print("\\n" + "=" * 50)
    print("4. protocol协议版本")
    print("=" * 50)
    for proto in range(pickle.HIGHEST_PROTOCOL + 1):
        size = len(pickle.dumps(data, protocol=proto))
        print(f"  协议{proto}: {size} 字节")

    # ========== 5. 安全警告演示 ==========
    print("\\n" + "=" * 50)
    print("5. ⚠️ 安全警告")
    print("=" * 50)
    print("❌ 永远不要加载/反序列化来自不信任来源的pickle！")
    print("❌ 不要通过网络接收pickle数据直接loads！")
    print("❌ 不要从不可信的文件读取pickle！")
    print("✅ 推荐：配置文件/数据交换用JSON，跨语言用JSON/MessagePack")
    print("✅ pickle仅用于自己程序内部临时存储")

finally:
    import shutil
    shutil.rmtree(temp_dir)
    print(f"\\n临时目录已清理")
`
  },
  {
    id: "py6-exception-basic",
    group: "文件与异常",
    icon: "⚠️",
    title: "异常处理基础",
    content: `## 异常处理基础

程序运行时发生错误（如文件不存在、除零、类型错误）时，Python会抛出异常。如果不处理，程序会终止并显示错误信息。

### try/except 基本语法

\`\`\`python
try:
    可能出错的代码
except 异常类型:
    出错时执行的代码
\`\`\`

### 常见内置异常类型

| 异常 | 说明 |
|------|------|
| \`NameError\` | 使用未定义变量 |
| \`TypeError\` | 类型不匹配 |
| \`ValueError\` | 值不合法 |
| \`ZeroDivisionError\` | 除零错误 |
| \`IndexError\` | 索引越界 |
| \`KeyError\` | 字典键不存在 |
| \`FileNotFoundError\` | 文件不存在 |
| \`AttributeError\` | 属性/方法不存在 |
| \`ImportError\` | 导入失败 |

### 异常处理原则

1. 捕获具体异常，不要裸except
2. 只捕获你能处理的异常
3. 避免空except吞掉所有错误
4. 异常处理粒度要合适

### 错误 vs 异常

- 语法错误：代码写得不对，运行前就能发现
- 运行时异常：语法正确但运行时出错，需要try/except处理`,
    code: `import tempfile
import os

print("=" * 50)
print("1. 不处理异常：程序直接崩溃")
print("=" * 50)
print("如果取消注释下面这行，程序会崩溃")
# result = 10 / 0  # ZeroDivisionError
print("（示例代码已注释，避免崩溃）")

# ========== 1. 基础try/except ==========
print("\\n" + "=" * 50)
print("2. try/except 捕获异常")
print("=" * 50)
try:
    result = 10 / 0
    print(f"结果: {result}")
except ZeroDivisionError:
    print("❌ 捕获到除零错误！不能除以0")
print("程序继续运行...")

# ========== 2. 多种常见异常演示 ==========
print("\\n" + "=" * 50)
print("3. 各种常见异常演示")
print("=" * 50)

# NameError
try:
    print(undefined_variable)
except NameError as e:
    print(f"❌ NameError: {e}")

# TypeError
try:
    result = "10" + 5
except TypeError as e:
    print(f"❌ TypeError: {e}")

# ValueError
try:
    num = int("abc")
except ValueError as e:
    print(f"❌ ValueError: {e}")

# IndexError
try:
    lst = [1, 2, 3]
    print(lst[10])
except IndexError as e:
    print(f"❌ IndexError: {e}")

# KeyError
try:
    d = {"name": "张三"}
    print(d["age"])
except KeyError as e:
    print(f"❌ KeyError: 键{e}不存在")

# AttributeError
try:
    x = 42
    x.append(100)
except AttributeError as e:
    print(f"❌ AttributeError: {e}")

# ========== 3. 文件操作异常 ==========
print("\\n" + "=" * 50)
print("4. 文件操作异常处理")
print("=" * 50)
try:
    with open("/path/that/never/exists.txt", "r") as f:
        content = f.read()
except FileNotFoundError as e:
    print(f"❌ FileNotFoundError: {e}")
    print("  提示：请检查文件路径是否正确")

# ========== 4. 类型转换安全函数 ==========
print("\\n" + "=" * 50)
print("5. 实用：安全的类型转换函数")
print("=" * 50)
def safe_int(s, default=None):
    try:
        return int(s)
    except (ValueError, TypeError):
        return default

test_values = ["123", "45.6", "abc", None, "789"]
for v in test_values:
    result = safe_int(v)
    print(f"  safe_int({v!r}) = {result}")

# ========== 5. ❌ 不要做的事 ==========
print("\\n" + "=" * 50)
print("6. ❌ 反模式：裸except（不要这样写！）")
print("=" * 50)
print("裸except会捕获所有异常包括KeyboardInterrupt，")
print("让你无法用Ctrl+C终止程序，也难以调试。")
print("✅ 应该指定具体异常类型，如 except ValueError:")
`
  },
  {
    id: "py6-exception-multiple",
    group: "文件与异常",
    icon: "🚨",
    title: "多个except与异常类型",
    content: `## 多个except子句

一个try块可以有多个except子句，分别处理不同类型的异常。

### 语法

\`\`\`python
try:
    代码
except 类型1:
    处理类型1
except (类型2, 类型3):
    处理类型2或3
except 类型4 as e:
    处理类型4，e是异常对象
\`\`\`

### 匹配规则

1. 异常发生后，从上到下依次匹配except
2. 匹配到第一个符合的except后就不再往下匹配
3. 子类异常要放在父类前面，否则父类会先匹配

### 获取异常对象

使用\`except 类型 as e\`可以获取异常对象，包含错误详情。

### 异常继承关系

所有异常都继承自BaseException，常见异常继承关系：
- BaseException
  - SystemExit
  - KeyboardInterrupt
  - GeneratorExit
  - Exception
    - ValueError
    - TypeError
    - LookupError（IndexError, KeyError的父类）
    - OSError（FileNotFoundError等）

### 最佳实践

1. 从小到大、从具体到宽泛排列except
2. 相同处理逻辑的异常可以用元组组合
3. 始终用as e获取异常信息便于调试
4. Exception放在最后作为兜底（不要用BaseException）`,
    code: `import os
import tempfile

print("=" * 50)
print("1. 多个except分别处理不同异常")
print("=" * 50)
def divide(a, b):
    try:
        result = a / b
        return result
    except ZeroDivisionError:
        return "错误：除数不能为0"
    except TypeError:
        return "错误：参数类型不对，需要数字"

print(divide(10, 2))
print(divide(10, 0))
print(divide("10", 2))

# ========== 2. 元组组合多种异常 ==========
print("\\n" + "=" * 50)
print("2. 元组组合多种异常，相同处理")
print("=" * 50)
def get_value(lst, index):
    try:
        return lst[index]
    except (IndexError, TypeError) as e:
        return f"获取失败: {type(e).__name__}: {e}"

print(get_value([1, 2, 3], 1))
print(get_value([1, 2, 3], 10))
print(get_value(None, 0))

# ========== 3. 获取异常对象 as e ==========
print("\\n" + "=" * 50)
print("3. as e 获取异常对象详情")
print("=" * 50)
try:
    num = int("xyz")
except ValueError as e:
    print(f"异常类型: {type(e).__name__}")
    print(f"异常信息: {e}")
    print(f"异常参数: {e.args}")

# ========== 4. except顺序：子类要在前 ==========
print("\\n" + "=" * 50)
print("4. except顺序很重要（子类在前）")
print("=" * 50)
print("FileNotFoundError 是 OSError 的子类")
print()

def read_file(path):
    try:
        f = open(path, 'r')
        content = f.read()
        f.close()
        return content
    except FileNotFoundError:
        return "文件不存在"
    except PermissionError:
        return "没有权限读取"
    except OSError as e:
        return f"其他IO错误: {e}"

print(read_file("/nonexistent/path.txt"))
print("（演示一个存在的文件）")
with tempfile.NamedTemporaryFile(mode='w', delete=False) as f:
    temp_path = f.name
    f.write("临时文件内容")
print(read_file(temp_path))
os.unlink(temp_path)

# ========== 5. 异常层级演示 ==========
print("\\n" + "=" * 50)
print("5. 异常继承关系验证")
print("=" * 50)
print(f"ZeroDivisionError 是 Exception 的子类: {issubclass(ZeroDivisionError, Exception)}")
print(f"FileNotFoundError 是 OSError 的子类: {issubclass(FileNotFoundError, OSError)}")
print(f"IndexError 是 LookupError 的子类: {issubclass(IndexError, LookupError)}")
print(f"KeyError 是 LookupError 的子类: {issubclass(KeyError, LookupError)}")

# ========== 6. 实用：健壮的输入函数 ==========
print("\\n" + "=" * 50)
print("6. 实用示例：健壮的数字输入")
print("=" * 50)
def safe_divide_demo(a_str, b_str):
    try:
        a = float(a_str)
        b = float(b_str)
        result = a / b
        return f"结果: {a} / {b} = {result}"
    except ValueError:
        return "请输入有效的数字！"
    except ZeroDivisionError:
        return "除数不能为0！"
    except Exception as e:
        return f"未知错误: {type(e).__name__}: {e}"

test_cases = [("10", "2"), ("10", "0"), ("abc", "2"), ("10", "xyz")]
for a, b in test_cases:
    print(f"  divide({a!r}, {b!r}): {safe_divide_demo(a, b)}")
`
  },
  {
    id: "py6-exception-else-finally",
    group: "文件与异常",
    icon: "🔚",
    title: "else和finally子句",
    content: `## else 和 finally 子句

### 完整结构

\`\`\`python
try:
    可能出错的代码
except 异常类型:
    异常处理代码
else:
    没有异常时执行
finally:
    无论是否异常都执行（清理）
\`\`\`

### else子句

- **只有try块没有发生异常时才执行**
- 如果有异常，else不执行
- 把不抛异常的代码放在else里，避免捕获意外异常
- else在finally之前执行

### finally子句

- **无论是否发生异常，总会执行**
- 即使try/except中有return/break/continue，finally也会执行
- 主要用于清理资源：关闭文件、释放锁、断开连接等
- 这就是为什么with语句本质上就是finally的语法糖

### 执行顺序

1. 无异常：try → else → finally
2. 有异常被捕获：try → except → finally
3. 有异常未被捕获：try → finally → 异常向上抛出

### 注意事项

- finally中的return会覆盖try/except中的return
- 避免在finally中使用return，容易引起混淆
- 不要把业务逻辑放在finally里`,
    code: `import tempfile
import os

# ========== 1. 完整结构演示 ==========
print("=" * 50)
print("1. try/except/else/finally 完整流程")
print("=" * 50)

def demo(x):
    print(f"\\n--- 调用 demo({x}) ---")
    try:
        print("try: 执行计算...")
        result = 10 / x
    except ZeroDivisionError:
        print("except: 捕获到除零错误！")
    else:
        print(f"else: 计算成功，结果={result}")
    finally:
        print("finally: 清理资源（总是执行）")

demo(2)    # 正常情况
demo(0)    # 异常情况

# ========== 2. finally 保证资源清理 ==========
print("\\n" + "=" * 50)
print("2. finally 确保文件关闭（with之前的写法）")
print("=" * 50)
temp_path = tempfile.mktemp(suffix='.txt')
f = None
try:
    f = open(temp_path, 'w', encoding='utf-8')
    f.write("测试finally关闭文件\\n")
    print("文件写入成功")
    raise ValueError("模拟异常！")
except ValueError as e:
    print(f"捕获异常: {e}")
finally:
    if f:
        f.close()
        print(f"finally: 文件已关闭，closed={f.closed}")
os.unlink(temp_path)

# ========== 3. try/else 正确区分 ==========
print("\\n" + "=" * 50)
print("3. else的作用：明确哪些代码不应该抛异常")
print("=" * 50)

def parse_config(config_str):
    try:
        # 只有这行可能抛异常
        config = eval(config_str)  # 注意：eval有安全风险，仅演示
    except SyntaxError:
        print("配置语法错误")
        return None
    else:
        # else中的代码不会被上面的except捕获
        print(f"配置解析成功: {config}")
        return config

parse_config("{'debug': True}")
parse_config("{invalid syntax")

# ========== 4. finally与return的坑 ==========
print("\\n" + "=" * 50)
print("4. ⚠️ finally中的return会覆盖之前的return")
print("=" * 50)
def bad_func():
    try:
        return "try中的return"
    finally:
        return "finally中的return（覆盖了前面的！）"

result = bad_func()
print(f"函数返回: {result}")
print("❌ 不要在finally里return！会导致逻辑混乱")

# ========== 5. finally与break/continue ==========
print("\\n" + "=" * 50)
print("5. finally 在循环 break/continue 时也执行")
print("=" * 50)
for i in range(3):
    try:
        print(f"  迭代 {i}")
        if i == 1:
            print("  break!")
            break
    finally:
        print(f"  finally: 迭代{i}结束")

# ========== 6. 实际应用：数据库连接模式 ==========
print("\\n" + "=" * 50)
print("6. 实际应用模式：资源获取与释放")
print("=" * 50)
print("伪代码模式：")
print("""
conn = None
try:
    conn = connect_db()
    data = conn.query("SELECT ...")
except DBError as e:
    log_error(e)
else:
    process_data(data)
finally:
    if conn:
        conn.close()  # 确保连接关闭
""")
print("（Python推荐用with上下文管理器简化此模式）")
`
  },
  {
    id: "py6-exception-raise",
    group: "文件与异常",
    icon: "🔼",
    title: "主动抛出异常",
    content: `## 主动抛出异常 (raise)

除了Python自动抛出的异常，你也可以用\`raise\`语句主动抛出异常。

### 语法形式

1. **\`raise 异常类\`**：创建实例并抛出
2. **\`raise 异常实例\`**：直接抛出实例
3. **\`raise\`**（不带参数）：重新抛出当前异常
4. **\`raise 新异常 from 原异常\`**：异常链（下一章讲）

### 什么时候该抛异常？

- 函数接收到无效参数
- 前置条件不满足
- 操作无法完成（如文件无法创建）
- 遇到不应该发生的情况（assert）

### 常见误区

- ❌ 用异常做正常流程控制（应该用if判断）
- ❌ 抛出太宽泛的Exception
- ❌ 捕获异常后什么都不做（吞异常）
- ✅ 抛出有意义的具体异常类型
- ✅ 异常信息要清晰，说明原因和修复建议

### assert 断言

\`assert 条件, 错误信息\`在条件为False时抛出AssertionError。
用于调试阶段检查不可能发生的情况，优化模式(-O)下assert会被移除。`,
    code: `print("=" * 50)
print("1. raise 基础用法")
print("=" * 50)

def set_age(age):
    if not isinstance(age, int):
        raise TypeError("年龄必须是整数")
    if age < 0 or age > 150:
        raise ValueError(f"年龄不合法: {age}，应在0-150之间")
    print(f"年龄设置为: {age}")

set_age(25)
try:
    set_age(-5)
except ValueError as e:
    print(f"❌ {e}")
try:
    set_age("abc")
except TypeError as e:
    print(f"❌ {e}")

# ========== 2. 创建异常实例再抛出 ==========
print("\\n" + "=" * 50)
print("2. 两种raise写法")
print("=" * 50)
def divide(a, b):
    if b == 0:
        # 写法1：直接抛类（自动创建实例）
        raise ZeroDivisionError("除数不能为零")
    return a / b

try:
    # 写法2：先创建实例再抛（可以自定义更多属性）
    err = ValueError("自定义错误消息")
    raise err
except ValueError as e:
    print(f"捕获: {e}")

# ========== 3. 不带参数的raise：重新抛出 ==========
print("\\n" + "=" * 50)
print("3. 裸raise：在except中重新抛出异常")
print("=" * 50)
def process_file(filename):
    try:
        f = open(filename, 'r')
        content = f.read()
        f.close()
        return content
    except FileNotFoundError:
        print(f"[日志] 文件不存在: {filename}")
        raise  # 重新抛出，让上层调用者也能处理

try:
    process_file("/no/such/file.txt")
except FileNotFoundError as e:
    print(f"上层也收到了异常: {type(e).__name__}")

# ========== 4. raise from 异常链 ==========
print("\\n" + "=" * 50)
print("4. raise from 显式异常链")
print("=" * 50)
def parse_int(s):
    try:
        return int(s)
    except ValueError as e:
        raise RuntimeError(f"无法解析整数: {s!r}") from e

try:
    parse_int("not-a-number")
except RuntimeError as e:
    print(f"捕获异常: {e}")
    print(f"原始原因 (__cause__): {e.__cause__}")

# ========== 5. assert 断言 ==========
print("\\n" + "=" * 50)
print("5. assert 断言（调试用）")
print("=" * 50)
def calculate_average(numbers):
    assert isinstance(numbers, list), "参数必须是列表"
    assert len(numbers) > 0, "列表不能为空"
    return sum(numbers) / len(numbers)

print(f"平均值: {calculate_average([1, 2, 3, 4, 5])}")
try:
    calculate_average([])
except AssertionError as e:
    print(f"❌ 断言失败: {e}")
print("⚠️ 注意：python -O 运行时assert会被移除！")

# ========== 6. 自定义错误消息的最佳实践 ==========
print("\\n" + "=" * 50)
print("6. 好的错误消息应该包含什么")
print("=" * 50)
def connect_database(host, port):
    if not host:
        raise ValueError("数据库host不能为空，请检查配置文件DB_HOST项")
    if not (1 <= port <= 65535):
        raise ValueError(f"端口号{port}无效，应在1-65535范围内")
    print(f"连接到 {host}:{port}")

connect_database("localhost", 3306)
try:
    connect_database("localhost", 99999)
except ValueError as e:
    print(f"❌ {e}")
`
  },
  {
    id: "py6-exception-custom",
    group: "文件与异常",
    icon: "🎨",
    title: "自定义异常",
    content: `## 自定义异常类

当内置异常类型无法准确描述你的错误场景时，应该自定义异常类。

### 为什么自定义异常？

1. **语义清晰**：异常名直接说明是什么错误
2. **精准捕获**：调用者可以只捕获你的特定异常
3. **携带额外信息**：自定义属性存放错误详情
4. **分层处理**：业务异常、系统异常区分开

### 如何定义

\`\`\`python
class 自定义异常名(Exception):
    def __init__(self, 参数):
        self.参数 = 参数
        super().__init__(错误消息)
\`\`\`

### 最佳实践

1. 继承Exception，不要继承BaseException
2. 异常类名以Error结尾（如ConfigError, not Config）
3. 建议创建项目基础异常类，其他异常继承它
4. 可以添加自定义属性和方法
5. 异常消息要对用户友好

### 异常层级设计

\`\`\`
class AppError(Exception): pass
class ConfigError(AppError): pass
class DatabaseError(AppError): pass
class ValidationError(AppError): pass
\`\`\`

这样调用者可以捕获AppError处理所有业务异常。`,
    code: `# ========== 1. 最简单的自定义异常 ==========
print("=" * 50)
print("1. 基础自定义异常")
print("=" * 50)

class InsufficientBalanceError(Exception):
    """账户余额不足异常"""
    pass

class BankAccount:
    def __init__(self, balance=0):
        self.balance = balance
    def withdraw(self, amount):
        if amount > self.balance:
            raise InsufficientBalanceError(
                f"余额不足，当前{self.balance}元，尝试取{amount}元"
            )
        self.balance -= amount
        return amount

acc = BankAccount(100)
print(f"初始余额: {acc.balance}")
acc.withdraw(30)
print(f"取款30后余额: {acc.balance}")
try:
    acc.withdraw(200)
except InsufficientBalanceError as e:
    print(f"❌ 取款失败: {e}")

# ========== 2. 带自定义属性的异常 ==========
print("\\n" + "=" * 50)
print("2. 携带额外信息的自定义异常")
print("=" * 50)

class ValidationError(Exception):
    def __init__(self, field, message, value=None):
        self.field = field
        self.message = message
        self.value = value
        super().__init__(f"{field}: {message} (值: {value!r})")

def validate_user(user):
    if not user.get("username"):
        raise ValidationError("username", "用户名不能为空")
    if len(user.get("password", "")) < 6:
        raise ValidationError("password", "密码长度至少6位", user.get("password"))
    age = user.get("age")
    if age is not None and (age < 0 or age > 150):
        raise ValidationError("age", "年龄不合法", age)
    return True

test_users = [
    {"username": "alice", "password": "123456", "age": 25},
    {"username": "", "password": "123456"},
    {"username": "bob", "password": "123"},
    {"username": "carol", "password": "123456", "age": 200},
]
for u in test_users:
    try:
        validate_user(u)
        print(f"✓ 用户{u['username']!r}验证通过")
    except ValidationError as e:
        print(f"❌ {e.message}")
        print(f"  字段: {e.field}, 值: {e.value!r}")

# ========== 3. 异常层级设计 ==========
print("\\n" + "=" * 50)
print("3. 异常层级（基础异常类+子类）")
print("=" * 50)

class AppError(Exception):
    """应用基础异常类"""
    error_code = 1000
    def __init__(self, message, details=None):
        self.message = message
        self.details = details
        super().__init__(message)

class ConfigError(AppError):
    error_code = 2001

class DatabaseError(AppError):
    error_code = 3001
    def __init__(self, message, db_name=None):
        super().__init__(message)
        self.db_name = db_name

class AuthError(AppError):
    error_code = 4001

def simulate_error(error_type):
    if error_type == "config":
        raise ConfigError("配置文件格式错误")
    elif error_type == "db":
        raise DatabaseError("连接超时", db_name="main_db")
    elif error_type == "auth":
        raise AuthError("Token已过期")

for err_type in ["config", "db", "auth"]:
    try:
        simulate_error(err_type)
    except AppError as e:
        print(f"✓ 捕获AppError子类: {type(e).__name__}")
        print(f"  错误码: {e.error_code}, 消息: {e.message}")
        if hasattr(e, 'db_name'):
            print(f"  数据库: {e.db_name}")

# ========== 4. 自定义异常的__str__ ==========
print("\\n" + "=" * 50)
print("4. 自定义__str__输出格式")
print("=" * 50)

class APIError(Exception):
    def __init__(self, code, message, url=None):
        self.code = code
        self.message = message
        self.url = url
        super().__init__(message)
    def __str__(self):
        base = f"[API错误 {self.code}] {self.message}"
        if self.url:
            base += f" (请求: {self.url})"
        return base

try:
    raise APIError(404, "资源不存在", "/api/users/999")
except APIError as e:
    print(f"直接打印异常: {e}")
`
  },
  {
    id: "py6-exception-chain",
    group: "文件与异常",
    icon: "🔗",
    title: "异常链",
    content: `## 异常链 (Exception Chaining)

处理异常时又抛出新异常，Python会自动维护异常之间的关联，形成异常链。

### 两种异常链

1. **显式链**：\`raise X from Y\`
   - 明确表示X是由Y直接导致的
   - 设置\`__cause__\`属性
   - 表明有意转换异常类型

2. **隐式链**：except块中抛新异常，不带from
   - 处理异常时不小心又出异常
   - 设置\`__context__\`属性
   - Python自动关联

### 特殊用法：\`raise X from None\`

- 禁止异常链，不显示原始异常
- 当你想完全隐藏内部实现细节时使用
- 但不要滥用，否则难以调试

### 属性说明

| 属性 | 说明 |
|------|------|
| \`__cause__\` | 显式链：from后的原始异常 |
| \`__context__\` | 隐式链：处理时发生的异常 |
| \`__traceback__\` | 追踪信息对象 |
| \`__suppress_context__\` | from None时为True |

### 什么时候需要异常链？

- 底层异常转换为业务异常时，保留根因
- 调试时能看到完整错误传播路径
- 日志记录完整异常栈`,
    code: `print("=" * 50)
print("1. 隐式异常链（__context__）")
print("=" * 50)
print("在except块中抛出新异常，Python自动链接")
print()

def load_config(path):
    try:
        f = open(path, 'r')
        content = f.read()
        f.close()
        return content
    except FileNotFoundError as e:
        # 在处理FileNotFoundError时又抛RuntimeError
        # Python自动设置 __context__
        raise RuntimeError("配置加载失败") from e

try:
    load_config("/missing/config.ini")
except RuntimeError as e:
    print(f"捕获异常: {e}")
    print(f"__context__（原始异常）: {e.__context__}")
    print(f"__cause__（显式链）: {e.__cause__}")

# ========== 2. 显式异常链 raise from ==========
print("\\n" + "=" * 50)
print("2. 显式异常链 raise X from Y")
print("=" * 50)

def get_user_age(user_id):
    users = {"1": 25, "2": 30}
    try:
        age_str = users[user_id]
        return int(age_str)
    except KeyError as e:
        raise ValueError(f"用户{user_id}不存在") from e
    except ValueError as e:
        raise RuntimeError("年龄数据损坏") from e

try:
    get_user_age("999")
except ValueError as e:
    print(f"异常: {e}")
    print(f"__cause__: {e.__cause__}")

# ========== 3. 链式异常的追踪 ==========
print("\\n" + "=" * 50)
print("3. 多层异常链")
print("=" * 50)

def level3():
    raise FileNotFoundError("文件找不到")

def level2():
    try:
        level3()
    except FileNotFoundError as e:
        raise ValueError("数据解析失败") from e

def level1():
    try:
        level2()
    except ValueError as e:
        raise RuntimeError("业务流程失败") from e

try:
    level1()
except RuntimeError as e:
    print(f"最终异常: {e}")
    print(f"原因1 (__cause__): {e.__cause__}")
    print(f"原因2 (__cause__.__cause__): {e.__cause__.__cause__}")

# ========== 4. from None 抑制异常链 ==========
print("\\n" + "=" * 50)
print("4. raise X from None：抑制异常链")
print("=" * 50)

def process_data(data):
    try:
        return int(data)
    except ValueError:
        # from None 隐藏原始ValueError
        raise RuntimeError(f"数据处理失败: {data!r}") from None

try:
    process_data("abc")
except RuntimeError as e:
    print(f"异常: {e}")
    print(f"__cause__: {e.__cause__}")
    print(f"__suppress_context__: {e.__suppress_context__}")
    print("（原始ValueError被隐藏）")

# ========== 5. 隐式链示例（错误处理中又出错） ==========
print("\\n" + "=" * 50)
print("5. 隐式链：处理异常时又出错")
print("=" * 50)

def bad_except_demo():
    try:
        result = 10 / 0
    except ZeroDivisionError:
        # 这里不小心又出了NameError
        print(undefined_var)  # noqa

try:
    bad_except_demo()
except NameError as e:
    print(f"捕获: {e}")
    print(f"__context__（处理什么异常时出错）: {e.__context__}")

# ========== 6. 实际应用 ==========
print("\\n" + "=" * 50)
print("6. 最佳实践：什么时候用raise from")
print("=" * 50)
print("✅ 转换异常类型时保留根因：")
print("   except IOError as e:")
print("       raise DataLoadError('数据加载失败') from e")
print()
print("✅ 封装第三方库异常为自己的异常：")
print("   except requests.Error as e:")
print("       raise APIError('请求失败') from e")
print()
print("✅ from None 用于：")
print("   - 异常类型转换是设计的一部分")
print("   - 原始异常包含敏感信息不希望暴露")
`
  },
  {
    id: "py6-context-manager",
    group: "文件与异常",
    icon: "🛡️",
    title: "自定义上下文管理器",
    content: `## 自定义上下文管理器

上下文管理器是with语句背后的协议，你可以自己定义来管理任何资源。

### 两种实现方式

#### 方式一：类实现（__enter__ + __exit__）

\`\`\`python
class MyContext:
    def __enter__(self):
        # 获取资源
        return 资源对象  # 赋值给as变量
    def __exit__(self, exc_type, exc_val, exc_tb):
        # 释放资源
        # 返回True表示吞掉异常，False/None继续抛出
\`\`\`

\`__exit__\`参数：
- \`exc_type\`：异常类型（无异常时为None）
- \`exc_val\`：异常实例
- \`exc_tb\`：traceback对象

#### 方式二：contextlib.contextmanager装饰器

用生成器语法更简洁：

\`\`\`python
@contextmanager
def my_context():
    # __enter__代码：获取资源
    yield 资源  # 这里暂停，执行with块
    # __exit__代码：释放资源
\`\`\`

### 应用场景

- 计时统计
- 临时切换工作目录
- 数据库事务（提交/回滚）
- 日志追踪
- 临时修改环境变量
- 捕获并统计异常`,
    code: `import tempfile
import os
import time
from contextlib import contextmanager

# ========== 1. 类方式：计时器 ==========
print("=" * 50)
print("1. 类实现：计时器上下文管理器")
print("=" * 50)

class Timer:
    def __init__(self, name="操作"):
        self.name = name
    def __enter__(self):
        self.start = time.time()
        print(f"[{self.name}] 开始计时...")
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end = time.time()
        self.elapsed = self.end - self.start
        print(f"[{self.name}] 耗时: {self.elapsed:.6f}秒")
        return False  # 不吞异常

with Timer("求和计算"):
    total = sum(range(1000000))
    print(f"计算结果: {total}")

# ========== 2. 类方式：临时目录 ==========
print("\\n" + "=" * 50)
print("2. 类实现：自动创建和清理临时目录")
print("=" * 50)

class TempDir:
    def __enter__(self):
        self.path = tempfile.mkdtemp()
        print(f"创建临时目录: {self.path}")
        return self.path
    def __exit__(self, exc_type, exc_val, exc_tb):
        import shutil
        shutil.rmtree(self.path)
        print(f"删除临时目录: {self.path}")
        return False

with TempDir() as tmpdir:
    filepath = os.path.join(tmpdir, "test.txt")
    with open(filepath, 'w') as f:
        f.write("hello")
    print(f"目录内文件: {os.listdir(tmpdir)}")
print("with块结束后目录已删除")

# ========== 3. contextmanager装饰器方式 ==========
print("\\n" + "=" * 50)
print("3. @contextmanager 装饰器（更简洁）")
print("=" * 50)

@contextmanager
def timer(name="任务"):
    start = time.time()
    print(f"[{name}] 开始")
    yield  # yield前是__enter__，yield后是__exit__
    elapsed = time.time() - start
    print(f"[{name}] 结束，耗时: {elapsed:.6f}秒")

with timer("列表推导"):
    result = [i*i for i in range(200000)]
    print(f"生成{len(result)}个元素")

# ========== 4. 带返回值的contextmanager ==========
print("\\n" + "=" * 50)
print("4. @contextmanager yield返回值给as")
print("=" * 50)

@contextmanager
def open_temp_file(content=""):
    tmp = tempfile.NamedTemporaryFile(mode='w', delete=False, encoding='utf-8')
    tmp.write(content)
    tmp.close()
    try:
        yield tmp.name  # 这个值赋给as变量
    finally:
        os.unlink(tmp.name)

with open_temp_file("这是临时文件内容\\n第二行") as path:
    print(f"临时文件路径: {path}")
    print("内容:")
    with open(path, 'r', encoding='utf-8') as f:
        print(f.read())
print("文件已自动删除")

# ========== 5. 异常处理 ==========
print("\\n" + "=" * 50)
print("5. __exit__处理异常")
print("=" * 50)

class ExceptionCatcher:
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            print(f"捕获到异常: {exc_type.__name__}: {exc_val}")
            return True  # 返回True吞掉异常，程序继续
        return False

with ExceptionCatcher():
    print("with块内")
    raise ValueError("测试异常")
print("异常被吞掉，程序继续运行！")

# ========== 6. 实用：缩进打印 ==========
print("\\n" + "=" * 50)
print("6. 实用示例：嵌套缩进打印")
print("=" * 50)

@contextmanager
def indent(level=2):
    indent.indent_level = getattr(indent, 'indent_level', 0) + level
    yield
    indent.indent_level -= level

def iprint(*args):
    print(" " * getattr(indent, 'indent_level', 0), end="")
    print(*args)

iprint("开始")
with indent():
    iprint("第一层")
    with indent():
        iprint("第二层")
        iprint("还是第二层")
    iprint("回到第一层")
iprint("结束")
`
  },
  {
    id: "py6-tempfile",
    group: "文件与异常",
    icon: "🌡️",
    title: "tempfile 临时文件",
    content: `## tempfile 临时文件模块

临时文件用于程序运行时存储临时数据，程序结束后自动删除。

### 核心函数与类

| 函数/类 | 说明 |
|---------|------|
| \`TemporaryFile(mode)\` | 匿名临时文件，关闭即删 |
| \`NamedTemporaryFile(mode, delete)\` | 有文件名的临时文件 |
| \`TemporaryDirectory()\` | 临时目录，with自动清理 |
| \`mkstemp()\` | 创建临时文件，返回(fd, path) |
| \`mkdtemp()\` | 创建临时目录，返回路径 |
| \`mktemp()\` | 仅生成路径，不创建文件（⚠️不安全） |
| \`gettempdir()\` | 获取系统临时目录 |
| \`gettempdirb()\` | 同上，bytes版本 |

### 参数说明

- \`mode='w+b'\`：默认二进制读写，文本模式用'w+'
- \`suffix=''/'\`：文件名后缀
- \`prefix='tmp'\`：文件名前缀
- \`dir=None\`：所在目录（默认系统临时目录）
- \`delete=True\`：关闭时自动删除（NamedTemporaryFile）
- \`encoding=None\`：文本模式编码

### 安全优势

1. 文件名包含随机字符，防止冲突
2. 权限设置安全（仅当前用户可访问）
3. with语句自动清理，不会留下垃圾文件

### 注意事项

- Windows上NamedTemporaryFile打开时其他进程无法访问，delete=False时需手动关闭再操作
- 推荐使用with语句确保清理
- mktemp()存在安全风险，推荐用mkstemp()/NamedTemporaryFile()`,
    code: `import tempfile
import os

# ========== 1. 获取系统临时目录 ==========
print("=" * 50)
print("1. 系统临时目录信息")
print("=" * 50)
print(f"临时目录: {tempfile.gettempdir()}")
print(f"前缀: {tempfile.template}")

# ========== 2. TemporaryFile：匿名临时文件 ==========
print("\\n" + "=" * 50)
print("2. TemporaryFile（匿名，无文件名）")
print("=" * 50)
with tempfile.TemporaryFile(mode='w+', encoding='utf-8') as f:
    f.write("第一行\\n")
    f.write("第二行\\n")
    f.write("第三行\\n")
    f.seek(0)
    content = f.read()
    print("写入并读取：")
    print(content)
    print(f"文件对象name属性: {f.name}")
print("with退出后文件已自动删除")

# ========== 3. NamedTemporaryFile：有名字的临时文件 ==========
print("=" * 50)
print("3. NamedTemporaryFile（有文件名）")
print("=" * 50)
with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', prefix='mydata_',
                                  delete=False, encoding='utf-8') as f:
    print(f"临时文件名: {f.name}")
    f.write("Hello from Python!\\n")
    f.write("中文内容测试\\n")
# delete=False时文件仍存在，可以被其他进程读取
print(f"文件存在: {os.path.exists(f.name)}")
with open(f.name, 'r', encoding='utf-8') as f2:
    print("读取内容：")
    print(f2.read())
os.unlink(f.name)  # 手动删除
print(f"手动删除后存在: {os.path.exists(f.name)}")

# ========== 4. TemporaryDirectory：临时目录 ==========
print("\\n" + "=" * 50)
print("4. TemporaryDirectory（临时目录）")
print("=" * 50)
with tempfile.TemporaryDirectory() as tmpdir:
    print(f"临时目录: {tmpdir}")
    # 在临时目录创建文件
    for i in range(3):
        p = os.path.join(tmpdir, f"file{i}.txt")
        with open(p, 'w') as f:
            f.write(f"文件{i}内容")
    print(f"目录内文件: {sorted(os.listdir(tmpdir))}")
print(f"退出后目录存在: {os.path.exists(tmpdir)}")

# ========== 5. mkstemp / mkdtemp：手动管理 ==========
print("\\n" + "=" * 50)
print("5. mkstemp/mkdtemp（手动创建和清理）")
print("=" * 50)
fd, path = tempfile.mkstemp(suffix='.log', prefix='app_')
print(f"mkstemp: fd={fd}, path={path}")
with os.fdopen(fd, 'w') as f:
    f.write("日志内容\\n")
os.unlink(path)
print("已手动清理")

tmpdir = tempfile.mkdtemp()
print(f"mkdtemp: {tmpdir}")
os.rmdir(tmpdir)
print("已手动清理")

# ========== 6. SpooledTemporaryFile：内存缓冲 ==========
print("\\n" + "=" * 50)
print("6. SpooledTemporaryFile：先在内存，超限后写磁盘")
print("=" * 50)
with tempfile.SpooledTemporaryFile(max_size=100, mode='w+', encoding='utf-8') as f:
    print(f"是否在内存: {not f._rolled}")
    f.write("短数据" * 10)
    print(f"写入后是否仍在内存: {not f._rolled}")
    f.seek(0)
    print(f"内容: {f.read()[:50]}...")
    f.seek(0, 2)  # 移到末尾
    f.write("大量数据" * 100)  # 超过max_size
    print(f"写入大量数据后是否滚动到磁盘: {f._rolled}")

# ========== 7. 实际应用模式 ==========
print("\\n" + "=" * 50)
print("7. 典型用法：处理上传文件/临时计算")
print("=" * 50)
print("""
# 模式1：需要临时文件给其他函数/库用
with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as f:
    generate_pdf(f)  # 生成内容
    pdf_path = f.name
try:
    send_email(pdf_path)  # 发送
finally:
    os.unlink(pdf_path)  # 清理

# 模式2：临时目录处理批量文件
with tempfile.TemporaryDirectory() as tmpdir:
    download_files(tmpdir)
    process_files(tmpdir)
# 自动清理所有文件
""")
`
  }
]
