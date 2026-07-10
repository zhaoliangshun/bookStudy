export const chapters = [
  {
    id: "deploy-linux-file",
    icon: "📁",
    title: "文件与目录操作",
    group: "Linux 常用命令",
    content: `# 文件与目录操作

## 一、Linux 文件系统概述

### 1.1 Linux 目录结构

Linux 采用树形目录结构，根目录为 \`/\`，所有文件和目录都从根目录开始。

\`\`\`text
Linux 核心目录说明：
/               根目录，所有目录的起点
/bin            存放系统基本命令（普通用户可用）
/sbin           存放系统管理命令（root 用户使用）
/etc            存放系统配置文件
/home           普通用户家目录
/root           root 用户家目录
/var            经常变化的文件（日志、缓存）
/tmp            临时文件
/usr            用户程序和文件
/opt            第三方软件安装目录
/dev            设备文件
/proc           虚拟文件系统（进程信息）
/sys            虚拟文件系统（硬件信息）
/mnt            临时挂载点
/media          可移动设备挂载点
\`\`\`

### 1.2 绝对路径与相对路径

\`\`\`text
绝对路径：从根目录 / 开始的完整路径
  示例：/home/zhangsan/projects/myapp

相对路径：相对于当前工作目录的路径
  .     当前目录
  ..    上一级目录
  ~     用户家目录
  -     上一次所在目录

示例：
当前在 /home/zhangsan/projects
./myapp        等价于 /home/zhangsan/projects/myapp
../docs        等价于 /home/zhangsan/docs
~/download     等价于 /home/zhangsan/download
\`\`\`

## 二、pwd 显示当前目录

### 2.1 基本用法

\`pwd\`（print working directory）显示当前工作目录的绝对路径。

\`\`\`bash
# 显示当前目录
pwd
# 输出示例：
# /home/zhangsan/projects/myapp
\`\`\`

### 2.2 常用参数

\`\`\`bash
# -P 显示物理路径（排除软链接）
pwd -P
# 假设当前目录 /home/zhangsan/link 是软链接指向 /data/realdir
# 输出：/data/realdir

# -L 显示逻辑路径（保留软链接，默认）
pwd -L
# 输出：/home/zhangsan/link
\`\`\`

### 2.3 实用场景

\`\`\`bash
# 在脚本中获取当前目录并保存到变量
CURRENT_DIR=$(pwd)
echo "脚本运行目录：$CURRENT_DIR"

# 切换目录后再切回
cd /tmp
echo "现在在：$(pwd)"
cd -    # 回到原目录
echo "回到：$(pwd)"
\`\`\`

## 三、cd 切换目录

### 3.1 基本用法

\`\`\`bash
# 切换到指定目录（绝对路径）
cd /home/zhangsan/projects

# 切换到上一级目录
cd ..
# 从 /home/zhangsan/projects 回到 /home/zhangsan

# 切换到用户家目录
cd ~
# 或简写
cd

# 切换到上一次目录
cd -
\`\`\`

### 3.2 相对路径切换

\`\`\`bash
# 假设当前在 /home/zhangsan
cd projects       # 进入 /home/zhangsan/projects
cd myapp/src      # 进入 /home/zhangsan/projects/myapp/src
cd ../../docs     # 回退两级再进入 docs 目录
\`\`\`

### 3.3 实用技巧

\`\`\`bash
# 利用 tab 键自动补全目录名
cd /ho<Tab>      # 自动补全为 /home/
cd /home/zhan<Tab>  # 补全为 /home/zhangsan/

# 利用通配符
cd /home/zhang*/projects

# 配合 pushd/popd 在多个目录间切换
pushd /var/log       # 压栈并切换
pushd /etc           # 再压栈并切换
popd                 # 弹栈回到 /var/log
popd                 # 弹栈回到原目录
\`\`\`

## 四、ls 列出目录内容

### 4.1 基本用法

\`\`\`bash
# 列出当前目录文件
ls
# 输出示例：
# app.py  config.yaml  requirements.txt  static  templates

# 列出指定目录
ls /home/zhangsan
ls /etc /var/log    # 同时列出多个目录
\`\`\`

### 4.2 常用参数详解

\`\`\`bash
# -l 长格式显示（详细信息）
ls -l
# 输出示例：
# -rw-r--r-- 1 zhangsan staff  2048 7月  3 10:30 app.py
# drwxr-xr-x 5 zhangsan staff   160 7月  3 09:15 static
# 字段含义：
# -rw-r--r--    文件类型与权限
# 1            硬链接数
# zhangsan     所有者
# staff        所属组
# 2048         文件大小（字节）
# 7月 3 10:30  修改时间
# app.py       文件名

# -a 显示所有文件（包括隐藏文件）
ls -a
# 输出示例：
# .  ..  .bashrc  .git  app.py  config.yaml

# -h 人类可读大小（K/M/G）
ls -lh
# -rw-r--r-- 1 zhangsan staff 2.0K 7月  3 10:30 app.py
# drwxr-xr-x 5 zhangsan staff 160B 7月  3 09:15 static

# -t 按修改时间排序（新在前）
ls -lt
# -rt 按修改时间逆序（旧在前）
ls -lrt

# -r 逆序
ls -lr

# -R 递归列出子目录
ls -R
# 输出示例：
# .:
# app.py  static  templates
# ./static:
# css  js
# ./static/css:
# style.css

# -S 按文件大小排序
ls -lSh

# -1 每行一个文件
ls -1

# --color 彩色输出
ls --color=auto
\`\`\`

### 4.3 长格式字段详解

\`\`\`text
-rw-r--r-- 1 zhangsan staff 2048 7月 3 10:30 app.py
│└──┬──┘ │ │       │      │    │         │
│  │    │ │       │      │    │         └─ 文件名
│  │    │ │       │      │    └─ 修改时间
│  │    │ │       │      └─ 修改日期
│  │    │ │       └─ 文件大小（字节）
│  │    │ └─ 所属组
│  │    └─ 所有者
│  └─ 硬链接数
└─ 文件类型与权限
   第1位：文件类型
     - 普通文件
     d 目录
     l 软链接
     c 字符设备
     b 块设备
   后9位：3组权限
     所有者(u) | 所属组(g) | 其他人(o)
     r 读 / w 写 / x 执行
\`\`\`

### 4.4 组合使用示例

\`\`\`bash
# 查看最近修改的 5 个文件
ls -lt | head -6

# 只显示目录
ls -l | grep '^d'

# 统计当前目录文件数量
ls -1 | wc -l

# 查找最大的 3 个文件
ls -lSh | head -4

# 查看隐藏文件大小
ls -lah
\`\`\`

## 五、mkdir 创建目录

### 5.1 基本用法

\`\`\`bash
# 创建单个目录
mkdir docs
# 输出：（无输出表示成功）

# 创建多个目录
mkdir docs tests config

# 在指定位置创建
mkdir /tmp/myproject
\`\`\`

### 5.2 -p 递归创建

\`\`\`bash
# 不加 -p，父目录不存在会报错
mkdir a/b/c
# mkdir: cannot create directory 'a/b/c': No such file or directory

# 加 -p 自动创建父目录
mkdir -p a/b/c
# 成功创建 a、a/b、a/b/c 三级目录

# 实战：创建 Python 项目结构
mkdir -p myapp/{src,tests,docs,config}
mkdir -p myapp/src/{models,views,utils}
\`\`\`

### 5.3 -m 设置权限

\`\`\`bash
# 创建时指定权限
mkdir -m 700 secret       # 仅所有者可读写执行
mkdir -m 755 public       # 所有者可读写执行，其他人可读执行
mkdir -m 777 shared       # 所有人可读写执行（不安全）

# -v 显示创建过程
mkdir -pv project/{backend,frontend}/{src,tests}
# mkdir: created directory 'project'
# mkdir: created directory 'project/backend'
# mkdir: created directory 'project/backend/src'
# ...
\`\`\`

## 六、rmdir 删除空目录

\`\`\`bash
# 只能删除空目录
rmdir emptydir

# 删除多级空目录
rmdir -p a/b/c
# 等价于 rmdir a/b/c && rmdir a/b && rmdir a

# 目录非空时报错
rmdir docs
# rmdir: failed to remove 'docs': Directory not empty
\`\`\`

## 七、rm 删除文件或目录

### 7.1 基本用法

\`\`\`bash
# 删除单个文件
rm app.py

# 删除多个文件
rm a.txt b.txt c.txt

# 使用通配符
rm *.log         # 删除所有 .log 文件
rm temp_*        # 删除以 temp_ 开头的文件
\`\`\`

### 7.2 常用参数

\`\`\`bash
# -r 递归删除（删除目录及内容）
rm -r old_project

# -f 强制删除（不提示）
rm -f *.tmp

# -i 交互式确认
rm -i important.txt
# rm: remove regular file 'important.txt'? y

# -rf 递归强制删除（最常用，但危险）
rm -rf /tmp/test

# -v 显示删除过程
rm -rv old_dir
# removed 'old_dir/file1.txt'
# removed 'old_dir/file2.txt'
# removed directory 'old_dir'
\`\`\`

### 7.3 安全建议

\`\`\`bash
# 危险！绝对不要执行
# rm -rf /              # 删除整个系统
# rm -rf ~              # 删除家目录所有文件

# 建议做法：
# 1. 先用 ls 确认要删除的内容
ls /tmp/test
# 2. 再执行删除
rm -rf /tmp/test

# 3. 使用 trash-cli 替代 rm（可恢复）
# 安装：pip install trash-cli
trash-put important.txt
\`\`\`

## 八、cp 复制文件或目录

### 8.1 基本用法

\`\`\`bash
# 复制文件
cp app.py app_backup.py

# 复制到另一目录
cp app.py /tmp/

# 复制并改名
cp app.py /tmp/main.py

# 复制多个文件到目录
cp a.txt b.txt /tmp/
\`\`\`

### 8.2 常用参数

\`\`\`bash
# -r 递归复制（复制目录必须加）
cp -r project project_backup

# -i 覆盖前确认
cp -i app.py /tmp/app.py
# cp: overwrite '/tmp/app.py'? y

# -p 保留属性（时间、权限、所有者）
cp -p config.yaml /backup/config.yaml

# -v 显示复制过程
cp -rv src /backup/
# 'src' -> '/backup/src'
# 'src/app.py' -> '/backup/src/app.py'

# -u 只在源文件较新时复制（增量备份）
cp -ru project /backup/

# -a 归档模式（保留所有属性，常用于备份）
cp -a project project_archive
\`\`\`

### 8.3 实战示例

\`\`\`bash
# 备份整个 Python 项目（排除虚拟环境）
cp -a --no-target-directory myapp myapp_$(date +%Y%m%d)

# 复制目录并保留权限
cp -rp /etc/nginx /backup/nginx_config
\`\`\`

## 九、mv 移动或重命名

\`\`\`bash
# 重命名文件
mv old_name.py new_name.py

# 移动文件到目录
mv app.py /tmp/

# 移动并改名
mv app.py /tmp/main.py

# 移动多个文件
mv a.txt b.txt c.txt /tmp/

# 移动目录
mv old_project /home/zhangsan/projects/

# -i 覆盖前确认
mv -i file.txt /tmp/file.txt

# -n 不覆盖已存在文件
mv -n new.txt /tmp/    # 如果 /tmp/new.txt 存在则不移动

# -v 显示过程
mv -v *.log /var/log/archive/
# 'app.log' -> '/var/log/archive/app.log'
\`\`\`

## 十、touch 创建空文件或更新时间

\`\`\`bash
# 创建空文件
touch newfile.txt

# 创建多个空文件
touch a.txt b.txt c.txt

# 更新文件修改时间
touch existing.txt    # 时间变为当前时间

# -t 指定时间
touch -t 202401010000 newyear.txt    # 设置为 2024-01-01 00:00

# -a 只修改访问时间
touch -a file.txt

# -m 只修改修改时间
touch -m file.txt

# -c 文件不存在时不创建
touch -c maybe_exists.txt
\`\`\`

## 十一、find 查找文件

### 11.1 按名称查找

\`\`\`bash
# 按文件名查找（精确）
find . -name "app.py"
# ./app.py

# 按文件名查找（不区分大小写）
find . -iname "README*"
# ./README.md
# ./readme.txt

# 使用通配符
find /home -name "*.py"          # 所有 .py 文件
find /home -name "test_*.py"     # 以 test_ 开头的 py 文件
find /var/log -name "*.log.*"    # 日志归档文件
\`\`\`

### 11.2 按类型查找

\`\`\`bash
# -type f 普通文件
find . -type f -name "*.py"

# -type d 目录
find . -type d -name "__pycache__"

# -type l 软链接
find /usr -type l -name "python*"
\`\`\`

### 11.3 按大小查找

\`\`\`bash
# -size 按大小
# c=字节, k=KB, M=MB, G=GB
find . -size +10M              # 大于 10MB 的文件
find . -size -1k               # 小于 1KB 的文件
find . -size +100M -size -1G   # 100MB 到 1GB 之间的文件

# 查找大文件并显示大小
find . -type f -size +50M -exec ls -lh {} \\;
\`\`\`

### 11.4 按时间查找

\`\`\`bash
# -mtime 按修改时间（天）
find . -mtime -7        # 7 天内修改过的文件
find . -mtime +30       # 30 天前修改过的文件
find . -mtime 1         # 恰好 1 天前修改的文件

# -mmin 按修改时间（分钟）
find . -mmin -60        # 60 分钟内修改的文件
find . -mmin +1440      # 24 小时前修改的文件

# -atime 按访问时间
find /var/log -atime -1  # 1 天内访问过的日志

# -ctime 按状态改变时间
find . -ctime -1         # 1 天内属性改变的文件
\`\`\`

### 11.5 按权限查找

\`\`\`bash
# -perm 按权限
find . -perm 644             # 权限为 644 的文件
find . -perm 755             # 权限为 755 的文件
find . -perm /u+x            # 所有者有执行权限的文件
find . -perm -u+x            # 同上（旧语法）
find . -perm /o+w            # 其他人有写权限的文件（安全检查）
\`\`\`

### 11.6 按所有者查找

\`\`\`bash
# -user 按所有者
find /home -user zhangsan

# -group 按所属组
find /home -group developers

# -uid 按用户 ID
find / -uid 1000

# -nouser 文件所有者不存在（删除用户后残留）
find / -nouser 2>/dev/null
\`\`\`

### 11.7 对查找结果执行操作

\`\`\`bash
# -exec 对每个结果执行命令
find . -name "*.pyc" -exec rm {} \\;

# -delete 删除找到的文件
find . -name "*.pyc" -delete

# -exec ls -l 显示详情
find . -name "*.log" -exec ls -l {} \\;

# + 批量执行（更高效）
find . -name "*.py" -exec chmod 644 {} +

# -print0 与 xargs -0 配合处理带空格文件名
find . -name "*.txt" -print0 | xargs -0 grep "error"
\`\`\`

### 11.8 综合查找示例

\`\`\`bash
# 查找 7 天前的 .log 文件并压缩归档
find /var/log -name "*.log" -mtime +7 -exec gzip {} \\;

# 查找大于 100MB 的文件并按大小排序
find / -type f -size +100M -exec ls -lh {} \\; 2>/dev/null | sort -k5 -h

# 查找并删除所有 __pycache__ 目录
find . -type d -name "__pycache__" -exec rm -rf {} +

# 查找所有 .py 文件中包含 TODO 的
find . -name "*.py" -exec grep -l "TODO" {} \\;
\`\`\`

## 十二、tree 树形显示目录

\`\`\`bash
# 安装
# Ubuntu/Debian: sudo apt install tree
# CentOS/RHEL:   sudo yum install tree
# macOS:         brew install tree

# 基本用法
tree
# .
# ├── app.py
# ├── config.yaml
# ├── static
# │   ├── css
# │   │   └── style.css
# │   └── js
# │       └── main.js
# └── templates
#     └── index.html

# -L 限制显示层级
tree -L 2
# .
# ├── app.py
# ├── config.yaml
# ├── static
# └── templates

# -d 只显示目录
tree -d

# -a 显示隐藏文件
tree -a

# -f 显示完整路径
tree -f

# -h 显示文件大小
tree -h

# 查找特定文件
tree -P "*.py"            # 只显示 .py 文件
tree -I "node_modules"    # 排除 node_modules

# 输出到文件
tree -L 3 > project_structure.txt
\`\`\`

## 十三、文件权限详解

### 13.1 权限模型

\`\`\`text
Linux 文件权限分三组：
  所有者 (user, u) | 所属组 (group, g) | 其他人 (other, o)

每组三个权限：
  r = 读 (read)     数值 4
  w = 写 (write)    数值 2
  x = 执行 (execute) 数值 1

示例：rw-r--r--
  所有者：rw- (6) 读+写
  所属组：r-- (4) 只读
  其他人：r-- (4) 只读
  数值：644
\`\`\`

### 13.2 chmod 修改权限

\`\`\`bash
# 查看当前权限
ls -l app.py
# -rw-r--r-- 1 zhangsan staff 2048 app.py

# 数字模式
chmod 755 app.py        # rwxr-xr-x
chmod 644 app.py        # rw-r--r--
chmod 600 config.yaml   # rw-------（仅所有者可读写）
chmod 777 public.sh     # rwxrwxrwx（不安全）

# 符号模式
chmod u+x app.py        # 给所有者加执行权限
chmod u-x app.py        # 去掉所有者执行权限
chmod g+w app.py        # 给所属组加写权限
chmod o-r app.py        # 去掉其他人读权限
chmod a+r app.py        # 所有人加读权限（a=ugo）
chmod u=rwx,g=rx,o=r app.py   # 直接设置

# -R 递归修改
chmod -R 755 /var/www

# 常用权限组合
chmod 755 script.sh     # 脚本文件常用
chmod 644 config.yaml   # 配置文件常用
chmod 600 id_rsa        # SSH 私钥必须
chmod 644 id_rsa.pub    # SSH 公钥
chmod 700 ~/.ssh        # .ssh 目录
\`\`\`

### 13.3 chown 修改所有者

\`\`\`bash
# 修改所有者
chown zhangsan app.py

# 修改所有者和所属组
chown zhangsan:developers app.py

# 只修改所属组
chown :developers app.py

# -R 递归修改
chown -R zhangsan:developers /home/project

# --reference 参照其他文件
chown --reference=reference.txt target.txt
\`\`\`

### 13.4 chgrp 修改所属组

\`\`\`bash
# 修改所属组
chgrp developers app.py

# -R 递归
chgrp -R developers /home/project
\`\`\`

### 13.5 特殊权限位

\`\`\`bash
# SUID（4）：执行时以所有者身份运行
chmod 4755 /usr/bin/passwd    # ls -l 显示 rwsr-xr-x

# SGID（2）：在目录下创建文件继承目录所属组
chmod 2775 /shared            # ls -l 显示 rwxrwsr-x

# Sticky Bit（1）：目录下文件只有所有者能删除
chmod 1777 /tmp               # ls -l 显示 rwxrwxrwt
\`\`\`

## 十四、软链接与硬链接

### 14.1 软链接（Symbolic Link）

\`\`\`bash
# 创建软链接
ln -s /home/zhangsan/projects/myapp /home/zhangsan/myapp_link

# 查看软链接
ls -l /home/zhangsan/myapp_link
# lrwxrwxrwx 1 zhangsan staff 30B myapp_link -> /home/zhangsan/projects/myapp

# 软链接特点：
# 1. 类似 Windows 快捷方式
# 2. 可以跨文件系统
# 3. 可以链接目录
# 4. 原文件删除后软链接失效（ dangling link）
# 5. 占用少量 inode

# 实战：为 Python 版本创建软链接
ln -sf /usr/bin/python3.10 /usr/local/bin/python3
# -f 强制覆盖已存在的链接

# 软链接目录
ln -s /var/log /home/zhangsan/logs
cd /home/zhangsan/logs    # 实际进入 /var/log
\`\`\`

### 14.2 硬链接（Hard Link）

\`\`\`bash
# 创建硬链接
ln app.py app_hardlink.py

# 硬链接特点：
# 1. 多个文件名指向同一 inode
# 2. 不能跨文件系统
# 3. 不能链接目录
# 4. 删除原文件，硬链接仍可用
# 5. 修改任一硬链接，其他同步变化

# 查看 inode
ls -i app.py app_hardlink.py
# 1234567 app.py
# 1234567 app_hardlink.py   # inode 相同

# 查看硬链接数
ls -l app.py
# -rw-r--r-- 2 zhangsan staff 2048 app.py   # 第 2 列为 2

# 实战：备份重要配置
ln /etc/nginx/nginx.conf /backup/nginx.conf.hardlink
\`\`\`

### 14.3 软链接 vs 硬链接对比

\`\`\`text
特性          软链接              硬链接
命令          ln -s               ln
inode         不同                相同
跨文件系统    可以                不可以
链接目录      可以                不可以
原文件删除    失效                仍可用
创建后大小    路径长度            0（共享数据）
显示标记      ->                  无
\`\`\`

## 十五、实战：Python 项目目录操作

### 15.1 创建标准项目结构

\`\`\`bash
# 进入家目录
cd ~

# 创建项目根目录
mkdir -p myproject

# 创建标准 Python 项目结构
cd myproject
mkdir -p src/{models,views,services,utils}
mkdir -p tests/{unit,integration}
mkdir -p docs config logs

# 创建关键文件
touch src/__init__.py
touch src/main.py
touch src/models/__init__.py
touch src/views/__init__.py
touch requirements.txt
touch README.md
touch .gitignore
touch config/settings.yaml

# 查看结构
tree
# .
# ├── README.md
# ├── config
# │   └── settings.yaml
# ├── docs
# ├── .gitignore
# ├── logs
# ├── requirements.txt
# ├── src
# │   ├── __init__.py
# │   ├── main.py
# │   ├── models
# │   │   └── __init__.py
# │   ├── services
# │   ├── utils
# │   └── views
# │       └── __init__.py
# └── tests
#     ├── integration
#     └── unit
\`\`\`

### 15.2 设置权限

\`\`\`bash
# 配置文件设为仅所有者可读写
chmod 600 config/settings.yaml

# 脚本文件加执行权限
chmod +x src/main.py

# 日志目录设为组可写
chmod 775 logs
chgrp -R developers logs

# 查看权限
ls -la
\`\`\`

### 15.3 备份项目

\`\`\`bash
# 创建备份目录
mkdir -p ~/backups

# 完整备份（保留权限）
cp -a ~/myproject ~/backups/myproject_$(date +%Y%m%d)

# 排除日志和缓存备份
mkdir -p ~/backups/myproject_clean
rsync -a --exclude='logs' --exclude='__pycache__' \\
    ~/myproject/ ~/backups/myproject_clean/

# 查找并清理 pyc 缓存文件
find ~/myproject -name "*.pyc" -delete
find ~/myproject -type d -name "__pycache__" -exec rm -rf {} +
\`\`\`

### 15.4 查找大文件优化项目

\`\`\`bash
# 查找项目中大于 10MB 的文件
find ~/myproject -type f -size +10M -exec ls -lh {} \\;

# 统计各目录大小
du -sh ~/myproject/*

# 查找最近 7 天修改的文件
find ~/myproject -type f -mtime -7 -name "*.py"
\`\`\`

## 十六、本章小结

\`\`\`text
本章学习的核心命令：

目录操作：
- pwd        显示当前目录
- cd         切换目录
- ls         列出目录内容
- mkdir      创建目录
- rmdir      删除空目录

文件操作：
- touch      创建空文件/更新时间
- cp         复制文件/目录
- mv         移动/重命名
- rm         删除文件/目录

查找：
- find       强大的文件查找工具
- tree       树形显示目录

权限：
- chmod      修改权限
- chown      修改所有者
- chgrp      修改所属组

链接：
- ln -s      创建软链接
- ln         创建硬链接

下一章将学习文本查看与处理命令，包括 cat、grep、sed、awk 等强大的文本处理工具，
这些命令在分析日志、处理配置文件、数据提取等场景中至关重要。
\`\`\`
`
  },
  {
    id: "deploy-linux-text",
    icon: "📝",
    title: "文本查看与处理",
    group: "Linux 常用命令",
    content: `# 文本查看与处理

## 一、cat 查看文件内容

### 1.1 基本用法

\`cat\`（concatenate）用于查看、合并、创建文件。

\`\`\`bash
# 查看文件内容
cat app.py
# 输出文件全部内容到终端

# 查看多个文件
cat a.txt b.txt

# 合并文件
cat a.txt b.txt > merged.txt
\`\`\`

### 1.2 常用参数

\`\`\`bash
# -n 显示行号
cat -n app.py
#      1  import os
#      2  from flask import Flask
#      3
#      4  app = Flask(__name__)
#      5
#      6  @app.route('/')
#      7  def hello():
#      8      return 'Hello World'

# -b 只对非空行编号
cat -b app.py

# -s 压缩连续空行为一行
cat -s app.py

# -A 显示特殊字符（结束符$、Tab^I）
cat -A config.yaml
# server:$
# ^Iport: 8080$    # ^I 表示 Tab
# ^Ihost: localhost$

# -T 只显示 Tab
cat -T file.txt

# -E 只显示行结束符
cat -E file.txt
\`\`\`

### 1.3 创建文件

\`\`\`bash
# 从键盘输入创建文件（Ctrl+D 结束）
cat > newfile.txt
输入第一行
输入第二行
^D

# 追加内容
cat >> existing.txt
追加的内容
^D

# 合并多个文件
cat header.txt body.txt footer.txt > page.html
\`\`\`

## 二、tac 反向显示

\`\`\`bash
# tac 是 cat 的反向，从最后一行开始显示
tac app.log
# 输出：最后一行 ... 第一行

# 实战：查看日志最新内容在最前
tac /var/log/syslog | head -20
\`\`\`

## 三、nl 显示行号

\`\`\`bash
# nl 比 cat -n 更灵活
nl app.py
#      1  import os
#      2  from flask import Flask

# -ba 所有行编号（包括空行）
nl -ba app.py

# -bt 只对非空行编号
nl -bt app.py

# -nrz 右对齐补零
nl -nrz app.py
# 000001  import os
# 000002  from flask import Flask
\`\`\`

## 四、head 查看文件开头

\`\`\`bash
# 默认显示前 10 行
head app.log

# 指定行数
head -n 20 app.log      # 前 20 行
head -20 app.log        # 简写

# 显示前 50 字节
head -c 50 app.log

# 显示多个文件
head a.txt b.txt
# ==> a.txt <==
# 内容...
# ==> b.txt <==
# 内容...

# 实战：查看文件头部信息
head -5 /etc/passwd
# root:x:0:0:root:/root:/bin/bash
# daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
# ...
\`\`\`

## 五、tail 查看文件末尾

### 5.1 基本用法

\`\`\`bash
# 默认显示后 10 行
tail app.log

# 指定行数
tail -n 50 app.log
tail -50 app.log

# 显示后 100 字节
tail -c 100 app.log
\`\`\`

### 5.2 -f 实时跟踪日志（最常用）

\`\`\`bash
# 实时跟踪文件新增内容
tail -f /var/log/syslog

# 跟踪应用日志
tail -f /home/zhangsan/myapp/logs/app.log

# -F 文件被轮转（重命名/重建）也能跟踪
tail -F app.log

# 同时跟踪多个日志
tail -f access.log error.log

# 配合 grep 过滤
tail -f app.log | grep ERROR

# 只看最新的 100 行并持续跟踪
tail -n 100 -f app.log
\`\`\`

### 5.3 实战场景

\`\`\`bash
# 监控 Nginx 访问日志中 404 错误
tail -f /var/log/nginx/access.log | grep ' 404 '

# 监控应用日志中的异常
tail -f app.log | grep --line-buffered -i 'error\\|exception\\|traceback'

# 查看最近的 100 条登录记录
tail -n 100 /var/log/auth.log

# Ctrl+C 退出 tail -f
\`\`\`

## 六、more 与 less 分页查看

### 6.1 more 分页查看

\`\`\`bash
# 分页查看（空格翻页，q 退出）
more large_file.txt

# 从第 100 行开始
more +100 large_file.txt

# 每页显示 20 行
more -20 large_file.txt

# more 操作键：
# 空格    下一页
# b       上一页
# Enter   下一行
# q       退出
# /字符串 查找
\`\`\`

### 6.2 less 增强版分页查看

\`\`\`bash
# less 比 more 更强大，支持前后翻页
less large_file.txt

# 带行号
less -N app.py

# 忽略大小写搜索
less -I app.py

# less 操作键：
# 空格/Page Down  下一页
# b/Page Up       上一页
# g               跳到开头
# G               跳到末尾
# /字符串         向下查找
# ?字符串         向上查找
# n               下一个匹配
# N               上一个匹配
# v               用编辑器打开
# q               退出

# 实战：查看长日志
less /var/log/syslog
# 输入 /ERROR 查找 ERROR，n 跳到下一个

# 配合管道
ps aux | less
\`\`\`

## 七、grep 文本搜索

### 7.1 基本用法

\`grep\`（Global Regular Expression Print）是强大的文本搜索工具。

\`\`\`bash
# 基本搜索
grep "error" app.log
# 输出包含 error 的行

# 搜索多个文件
grep "error" access.log error.log

# 在当前目录所有文件搜索
grep "TODO" *.py
\`\`\`

### 7.2 常用参数

\`\`\`bash
# -i 忽略大小写
grep -i "error" app.log    # 匹配 ERROR、Error、error

# -n 显示行号
grep -n "error" app.log
# 42:2024-01-01 ERROR Something went wrong

# -v 反向匹配（不包含的行）
grep -v "DEBUG" app.log    # 显示非 DEBUG 的行

# -r 递归搜索目录
grep -r "import" /home/zhangsan/myproject
# myproject/src/main.py:import os
# myproject/src/models/user.py:from datetime import datetime

# -l 只显示文件名（不显示内容）
grep -rl "TODO" /home/zhangsan/myproject
# /home/zhangsan/myproject/src/main.py
# /home/zhangsan/myproject/src/utils.py

# -c 统计匹配行数
grep -c "ERROR" app.log
# 42

# -w 全词匹配
grep -w "cat" file.txt    # 匹配 cat，不匹配 category

# -x 整行匹配
grep -x "exact line" file.txt

# -A 显示匹配行后 N 行
grep -A 3 "error" app.log
# 2024-01-01 ERROR Something went wrong
# Traceback (most recent call last):
#   File "app.py", line 42
#     raise Exception()

# -B 显示匹配行前 N 行
grep -B 3 "error" app.log

# -C 显示匹配行前后各 N 行
grep -C 3 "error" app.log

# -e 多个模式（或）
grep -e "error" -e "warning" -e "critical" app.log

# -E 扩展正则（等价于 egrep）
grep -E "error|warning|critical" app.log

# --color 高亮匹配
grep --color=auto "error" app.log

# -o 只输出匹配部分
grep -o "[0-9]\\+" app.log    # 只输出数字

# -m 限制匹配次数
grep -m 5 "error" app.log    # 只显示前 5 个匹配
\`\`\`

### 7.3 正则表达式

\`\`\`bash
# 基本正则
grep "^import" app.py             # 以 import 开头
grep "world$" file.txt            # 以 world 结尾
grep "er.or" file.txt             # . 匹配任意单字符
grep "a*" file.txt                # * 匹配前一个 0 次或多次
grep "a\\{2,3\\}" file.txt         # a 出现 2-3 次
grep "[abc]" file.txt             # a 或 b 或 c
grep "[0-9]" file.txt             # 数字
grep "[^0-9]" file.txt            # 非数字
grep "\\<import" app.py           # 以 import 开头的词

# 扩展正则（-E）
grep -E "import|from" app.py      # import 或 from
grep -E "[0-9]+" app.py           # 一个或多个数字
grep -E "https?" file.txt         # http 或 https
grep -E "([0-9]{1,3}\\.){3}[0-9]{1,3}" access.log  # IP 地址
\`\`\`

### 7.4 实战示例

\`\`\`bash
# 查找 Python 源码中所有 TODO
grep -rn "TODO" --include="*.py" .

# 查找未关闭的文件句柄
grep -r "open(" --include="*.py" . | grep -v "close()\\|with "

# 统计每种日志级别数量
grep -oE "(DEBUG|INFO|WARNING|ERROR|CRITICAL)" app.log | sort | uniq -c

# 查找包含特定 IP 的访问记录
grep "192.168.1.100" access.log

# 查找异常并显示上下文
grep -C 5 "Traceback" app.log

# 排除注释和空行查看配置
grep -v "^#" nginx.conf | grep -v "^$"
\`\`\`

## 八、sed 流编辑器

### 8.1 基本语法

\`sed\`（Stream Editor）用于对文本流进行编辑，常用于替换、删除、插入。

\`\`\`text
sed 语法：
sed [选项] '命令' 文件

常用选项：
-n    只输出处理后的行
-i    直接修改原文件
-i.bak 修改前备份
-e    多个命令
-r/-E 扩展正则

常用命令：
s/old/new/   替换
d            删除行
p            打印行
a\\           在行后追加
i\\           在行前插入
c\\           替换整行
y/abc/xyz/   字符替换
\`\`\`

### 8.2 替换命令 s

\`\`\`bash
# 基本替换（只替换每行第一个）
sed 's/old/new/' file.txt

# 全局替换（替换所有）
sed 's/old/new/g' file.txt

# 替换第 2 个匹配
sed 's/old/new/2' file.txt

# 忽略大小写
sed 's/old/new/gi' file.txt

# 实战：将 localhost 替换为 0.0.0.0
sed 's/localhost/0.0.0.0/g' config.yaml

# 使用 & 引用匹配内容
sed 's/[0-9]\\+/[&]/' file.txt    # 数字加方括号，如 123 -> [123]

# 使用分组（扩展正则）
sed -E 's/([0-9]+)-([0-9]+)/\\2-\\1/' file.txt   # 交换 123-456 -> 456-123

# 使用其他分隔符（路径替换）
sed 's|/old/path|/new/path|g' config.txt

# -i 直接修改文件
sed -i 's/localhost/0.0.0.0/g' config.yaml

# -i.bak 修改前备份
sed -i.bak 's/localhost/0.0.0.0/g' config.yaml
# 生成 config.yaml.bak 备份
\`\`\`

### 8.3 删除命令 d

\`\`\`bash
# 删除第 3 行
sed '3d' file.txt

# 删除第 3-5 行
sed '3,5d' file.txt

# 删除最后一行
sed '$d' file.txt

# 删除所有空行
sed '/^$/d' file.txt

# 删除包含 error 的行
sed '/error/d' app.log

# 删除以 # 开头的注释行
sed '/^#/d' config.conf

# 删除第 3 行到结尾
sed '3,$d' file.txt

# 删除不包含 success 的行
sed '/success/!d' app.log
\`\`\`

### 8.4 插入与追加

\`\`\`bash
# 在第 2 行后追加
sed '2a\\new line' file.txt

# 在第 2 行前插入
sed '2i\\new line' file.txt

# 在文件开头添加
sed '1i\\#!/bin/bash' script.sh

# 在文件末尾追加
sed '$a\\# End of file' file.txt

# 在匹配行后追加
sed '/pattern/a\\inserted line' file.txt

# 追加多行
sed '2a\\line1\\nline2\\nline3' file.txt
\`\`\`

### 8.5 打印命令 p

\`\`\`bash
# 只打印第 5 行
sed -n '5p' file.txt

# 打印第 3-5 行
sed -n '3,5p' file.txt

# 打印包含 error 的行
sed -n '/error/p' app.log

# 打印奇数行
sed -n '1~2p' file.txt

# 打印偶数行
sed -n '2~2p' file.txt
\`\`\`

### 8.6 综合示例

\`\`\`bash
# 批量替换项目中所有 .py 文件的字符串
find . -name "*.py" -exec sed -i 's/old_module/new_module/g' {} +

# 删除文件中所有注释和空行
sed -i '/^#/d; /^$/d' config.conf

# 修改配置文件中的端口
sed -i 's/port: 8080/port: 9090/' config.yaml

# 在配置文件指定位置插入新配置
sed -i '/\\[database\\]/a host = 192.168.1.100' app.conf

# 提取两个标记之间的内容
sed -n '/START/,/END/p' file.txt
\`\`\`

## 九、awk 文本处理

### 9.1 基本语法

\`awk\` 是强大的文本分析工具，按行和字段处理。

\`\`\`text
awk 语法：
awk [选项] '模式 {动作}' 文件

内置变量：
$0      整行
$1-$N   第 N 个字段（默认按空格/Tab 分隔）
NR      当前行号
NF      当前行的字段数
FS      输入字段分隔符（默认空格）
OFS     输出字段分隔符
RS      输入记录分隔符（默认换行）
ORS     输出记录分隔符
FILENAME 文件名
\`\`\`

### 9.2 基本用法

\`\`\`bash
# 打印每行第一个字段
awk '{print $1}' file.txt

# 打印第一个和第三个字段
awk '{print $1, $3}' file.txt

# 打印整行
awk '{print $0}' file.txt

# 打印行号和内容
awk '{print NR, $0}' file.txt

# 打印最后一列
awk '{print $NF}' file.txt

# 打印倒数第二列
awk '{print $(NF-1)}' file.txt

# 指定分隔符 -F
awk -F: '{print $1}' /etc/passwd    # 按冒号分隔，打印用户名
awk -F, '{print $1, $3}' data.csv   # CSV 文件
awk -F'\\t' '{print $1}' data.tsv    # TSV 文件
\`\`\`

### 9.3 条件过滤

\`\`\`bash
# 打印第 2 列大于 100 的行
awk '$2 > 100' data.txt

# 打印包含 error 的行
awk '/error/' app.log

# 打印第 1 列等于 root 的行
awk '$1 == "root"' /etc/passwd

# 打印字段数大于 5 的行
awk 'NF > 5' file.txt

# 组合条件
awk '$3 > 100 && $3 < 200' data.txt
awk '$1 == "ERROR" || $1 == "WARNING"' app.log
\`\`\`

### 9.4 BEGIN 与 END

\`\`\`bash
# BEGIN 在处理前执行
awk 'BEGIN {print "开始处理"; FS=","} {print $1} END {print "处理完成"}' data.csv

# 统计行数
awk 'END {print NR}' file.txt

# 求和
awk '{sum += $1} END {print sum}' numbers.txt

# 求平均值
awk '{sum += $1; count++} END {print sum/count}' numbers.txt

# 找最大值
awk 'NR == 1 {max = $1} $1 > max {max = $1} END {print max}' numbers.txt

# 统计每个 IP 出现次数
awk '{count[$1]++} END {for (ip in count) print count[ip], ip}' access.log | sort -rn
\`\`\`

### 9.5 格式化输出

\`\`\`bash
# printf 格式化
awk '{printf "%-10s %5d\\n", $1, $2}' data.txt

# 自定义分隔符
awk 'BEGIN {FS=":"; OFS="|"} {print $1, $3, $7}' /etc/passwd
# root|0|/bin/bash
# daemon|1|/usr/sbin/nologin

# 多行输出
awk 'BEGIN {print "用户列表"; print "----------"} {print NR": "$1}' users.txt
\`\`\`

### 9.6 实战示例

\`\`\`bash
# 统计 Nginx 访问日志各状态码数量
awk '{count[$9]++} END {for (code in count) print code, count[code]}' access.log

# 找出访问量最大的 10 个 IP
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -10

# 计算日志中第 5 列（响应大小）的总和
awk '{sum += $5} END {print sum/1024/1024 " MB"}' access.log

# 提取特定时间段日志
awk '$4 >= "[01/Jan/2024:00:00:00" && $4 < "[01/Jan/2024:01:00:00"' access.log

# 按字段条件过滤 CSV
awk -F, '$3 > 1000 {print $1, $2, $3}' sales.csv
\`\`\`

## 十、sort 排序

\`\`\`bash
# 基本排序（按 ASCII）
sort file.txt

# -n 数字排序
sort -n numbers.txt
# 1, 2, 10, 100（默认字母排序是 1, 10, 100, 2）

# -r 逆序
sort -rn numbers.txt

# -k 按字段排序
sort -k 2 data.txt          # 按第 2 列排序
sort -k 2 -n data.txt       # 按第 2 列数字排序
sort -k 2,2 -n data.txt     # 只按第 2 列排序

# -t 指定分隔符
sort -t: -k 3 -n /etc/passwd   # 按冒号分隔，按第 3 列（UID）数字排序

# -u 去重
sort -u file.txt

# -f 忽略大小写
sort -f file.txt

# -M 按月份排序
sort -M months.txt

# -h 人类可读数字排序（K/M/G）
du -sh * | sort -h

# 实战：找出磁盘占用最大的目录
du -sh /home/zhangsan/* | sort -rh | head -10
\`\`\`

## 十一、uniq 去重

\`\`\`bash
# uniq 只能去除相邻重复行，需配合 sort
sort file.txt | uniq

# -c 统计重复次数
sort file.txt | uniq -c
#       3 apple
#       2 banana
#       1 cherry

# -d 只显示重复行
sort file.txt | uniq -d

# -u 只显示唯一行
sort file.txt | uniq -u

# -i 忽略大小写
sort file.txt | uniq -ci

# 实战：统计访问日志中 IP 出现次数
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -10

# 找出只出现一次的行
sort file.txt | uniq -u
\`\`\`

## 十二、cut 字段提取

\`\`\`bash
# -f 提取字段（默认 Tab 分隔）
cut -f 1 data.tsv
cut -f 1,3 data.tsv
cut -f 1-3 data.tsv

# -d 指定分隔符
cut -d: -f 1 /etc/passwd      # 提取用户名
cut -d, -f 2 data.csv         # CSV 第 2 列
cut -d" " -f 1 access.log     # 提取 IP

# -c 按字符位置
cut -c 1-5 file.txt           # 每行前 5 个字符
cut -c 1,3,5 file.txt         # 第 1、3、5 个字符

# --complement 补集（提取指定之外的字段）
cut -d: -f 1 --complement /etc/passwd   # 提取除第 1 列外的所有列

# 实战：提取日志中的 URL
cut -d'"' -f 2 access.log | cut -d' ' -f 2
\`\`\`

## 十三、tr 字符替换

\`\`\`bash
# tr 只能从 stdin 读取
# 小写转大写
echo "hello" | tr 'a-z' 'A-Z'
# HELLO

# 替换字符
echo "hello" | tr 'l' 'L'
# heLLo

# 删除字符 -d
echo "hello 123 world" | tr -d '0-9'
# hello  world

# 压缩重复字符 -s
echo "hello    world" | tr -s ' '
# hello world

# 删除非数字
echo "abc123def456" | tr -cd '0-9'
# 123456

# 换行符转换
cat file.txt | tr '\\n' ' '        # 换行转空格
cat dos_file.txt | tr -d '\\r' > unix_file.txt   # DOS 转 Unix

# 实战：统计单词出现次数
cat file.txt | tr -s ' ' '\\n' | sort | uniq -c | sort -rn
\`\`\`

## 十四、wc 统计

\`\`\`bash
# 统计行数、单词数、字节数
wc file.txt
#  10  20 100 file.txt   (行 单词 字节)

# -l 只统计行数
wc -l file.txt

# -w 只统计单词数
wc -w file.txt

# -c 只统计字节数
wc -c file.txt

# -m 只统计字符数
wc -m file.txt

# 统计多个文件
wc -l *.py
#   50 app.py
#   30 utils.py
#   80 total

# 实战
# 统计代码行数
find . -name "*.py" | xargs wc -l | tail -1

# 统计当前目录文件数
ls -1 | wc -l
\`\`\`

## 十五、管道与重定向

### 15.1 管道 |

管道将前一个命令的输出作为后一个命令的输入。

\`\`\`bash
# 基本管道
ls -l | grep ".py"
cat app.log | grep ERROR
ps aux | grep python

# 多级管道
cat access.log | grep "404" | awk '{print $1}' | sort | uniq -c | sort -rn | head -10

# 管道配合 head/tail
ps aux | head -20
history | tail -20
\`\`\`

### 15.2 输出重定向 > >>

\`\`\`bash
# > 覆盖写入
echo "hello" > file.txt
ls -l > filelist.txt
grep "error" app.log > errors.txt

# >> 追加写入
echo "world" >> file.txt
date >> access_audit.log

# 合并标准输出和错误
command > all.log 2>&1
# 或（bash 4.0+）
command &> all.log

# 追加标准输出和错误
command >> all.log 2>&1
\`\`\`

### 15.3 输入重定向 <

\`\`\`bash
# 从文件读取输入
wc -l < file.txt
sort < unsorted.txt
mysql -u root < database.sql

# Here Document <<（多行输入）
cat << EOF > config.yaml
server:
  port: 8080
  host: localhost
database:
  url: postgres://localhost/mydb
EOF

# Here String <<<（单行输入）
grep "error" <<< "this is an error message"
\`\`\`

### 15.4 错误重定向 2>

\`\`\`bash
# 2> 重定向错误输出
command 2> error.log

# 2>> 追加错误
command 2>> error.log

# 丢弃错误（黑洞）
command 2> /dev/null

# 只保留错误
command 2> error.log 1> /dev/null

# 标准输出和错误分别重定向
command 1> output.log 2> error.log

# 丢弃所有输出
command > /dev/null 2>&1
\`\`\`

### 15.5 tee 命令

\`tee\` 将输出同时显示到终端和写入文件。

\`\`\`bash
# 同时显示和保存
ls -l | tee filelist.txt
echo "log message" | tee -a app.log

# 同时保存到多个文件
command | tee file1.txt file2.txt

# 实战：编译并保存日志
make 2>&1 | tee build.log

# -a 追加
echo "new line" | tee -a file.txt
\`\`\`

## 十六、实战：分析 Nginx 访问日志

### 16.1 日志格式说明

\`\`\`text
Nginx 默认日志格式：
192.168.1.100 - - [01/Jan/2024:10:00:00 +0800] "GET /api/users HTTP/1.1" 200 1234 "https://example.com" "Mozilla/5.0"

字段说明：
$1   192.168.1.100       客户端 IP
$4   [01/Jan/2024:10:00:00 +0800]  时间
$6   "GET                请求方法
$7   /api/users          请求路径
$8   HTTP/1.1"           协议
$9   200                 状态码
$10  1234                响应大小
$11  "https://..."       Referer
$12  "Mozilla/5.0"       User-Agent
\`\`\`

### 16.2 常用分析命令

\`\`\`bash
# 1. 统计总访问量
wc -l access.log

# 2. 统计各状态码数量
awk '{print $9}' access.log | sort | uniq -c | sort -rn
#    5000 200
#     200 404
#      50 500
#      30 301

# 3. 找出访问量 Top 10 的 IP
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -10

# 4. 找出访问量 Top 10 的 URL
awk '{print $7}' access.log | sort | uniq -c | sort -rn | head -10

# 5. 统计 404 错误的 URL
awk '$9 == 404 {print $7}' access.log | sort | uniq -c | sort -rn | head -20

# 6. 找出响应最慢的请求（假设日志有响应时间）
awk '{print $NF, $7}' access.log | sort -rn | head -10

# 7. 统计每小时的访问量
awk '{print substr($4, 14, 2)}' access.log | sort | uniq -c
#   300 09
#   500 10
#   450 11

# 8. 统计爬虫访问（User-Agent 含 bot）
grep -i "bot" access.log | wc -l

# 9. 查找特定 IP 的访问记录
grep "192.168.1.100" access.log

# 10. 统计流量（响应大小总和）
awk '{sum += $10} END {print sum/1024/1024 " MB"}' access.log

# 11. 查找异常状态码（非 2xx）
awk '$9 !~ /^2/' access.log | head -20

# 12. 实时监控 500 错误
tail -f access.log | awk '$9 == 500 {print}'

# 13. 统计各 HTTP 方法使用情况
awk '{print $6}' access.log | cut -d'"' -f2 | sort | uniq -c
#    8000 GET
#     500 POST
#      50 PUT
#      10 DELETE

# 14. 导出当天日志
grep "$(date +'%d/%b/%Y')" access.log > today.log

# 15. 找出访问频率过高的 IP（可能攻击）
awk '{print $1}' access.log | sort | uniq -c | sort -rn | awk '$1 > 1000 {print}'
\`\`\`

### 16.3 综合分析脚本

\`\`\`bash
#!/bin/bash
# Nginx 日志分析脚本

LOG_FILE=$1

echo "========== 日志分析报告 =========="
echo "日志文件：$LOG_FILE"
echo ""

echo "总访问量："
wc -l < "$LOG_FILE"
echo ""

echo "状态码分布："
awk '{print $9}' "$LOG_FILE" | sort | uniq -c | sort -rn
echo ""

echo "Top 10 IP："
awk '{print $1}' "$LOG_FILE" | sort | uniq -c | sort -rn | head -10
echo ""

echo "Top 10 URL："
awk '{print $7}' "$LOG_FILE" | sort | uniq -c | sort -rn | head -10
echo ""

echo "404 错误 URL："
awk '$9 == 404 {print $7}' "$LOG_FILE" | sort | uniq -c | sort -rn | head -10

echo "=================================="
\`\`\`

## 十七、本章小结

\`\`\`text
本章学习的核心命令：

查看文件：
- cat        查看/合并/创建文件
- tac        反向显示
- nl         显示行号
- head       查看开头
- tail       查看末尾（-f 实时跟踪）
- more/less  分页查看

搜索处理：
- grep       文本搜索（正则、递归、反向）
- sed        流编辑（替换、删除、插入）
- awk        字段处理、统计、格式化

统计排序：
- sort       排序
- uniq       去重（配合 sort）
- cut        字段提取
- tr         字符替换
- wc         统计行/单词/字节

管道与重定向：
- |          管道
- > >>       输出重定向
- <          输入重定向
- 2>         错误重定向
- tee        双向输出

下一章将学习进程与服务管理，包括 ps、top、kill、systemctl 等命令，
以及如何把 Python 应用做成 systemd 服务实现开机自启和崩溃自动重启。
\`\`\`
`
  },
  {
    id: "deploy-linux-process",
    icon: "⚙️",
    title: "进程与服务管理",
    group: "Linux 常用命令",
    content: `# 进程与服务管理

## 一、进程基础概念

### 1.1 什么是进程

\`\`\`text
进程（Process）是程序运行的实例。

关键概念：
- PID：进程 ID，唯一标识一个进程
- PPID：父进程 ID
- UID：启动进程的用户 ID
- 进程状态：
  R (Running)       运行中
  S (Sleeping)      睡眠（可中断）
  D (Disk sleep)    不可中断睡眠（通常在等 IO）
  Z (Zombie)        僵尸进程
  T (Stopped)       停止/暂停
  N (Nice)          低优先级

进程类型：
- 前台进程：占用终端，Ctrl+C 可终止
- 后台进程：不占用终端，& 启动
- 守护进程：系统服务，后台长期运行
\`\`\`

### 1.2 进程与程序的区别

\`\`\`text
程序：静态的，存在磁盘上的可执行文件
进程：动态的，程序在内存中的运行实例

一个程序可以同时有多个进程：
  python app.py    启动 3 次 → 3 个独立进程，PID 不同
\`\`\`

## 二、ps 查看进程

### 2.1 ps aux（BSD 风格）

\`\`\`bash
# 查看所有进程
ps aux
# USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
# root         1  0.0  0.0 169372 13472 ?        Ss   10:00   0:02 /sbin/init
# root         2  0.0  0.0      0     0 ?        S    10:00   0:00 [kthreadd]
# zhangsan  1234  0.5  1.2 234567 25600 ?        S    10:15   0:05 python app.py

# 字段说明：
# USER    进程所有者
# PID     进程 ID
# %CPU    CPU 占用率
# %MEM    内存占用率
# VSZ     虚拟内存大小（KB）
# RSS     物理内存大小（KB）
# TTY     终端（? 表示无终端）
# STAT    进程状态
# START   启动时间
# TIME    累计 CPU 时间
# COMMAND 启动命令
\`\`\`

### 2.2 ps -ef（System V 风格）

\`\`\`bash
# 查看所有进程（显示父进程）
ps -ef
# UID        PID  PPID  C STIME TTY          TIME CMD
# root         1     0  0 10:00 ?        00:00:02 /sbin/init
# root         2     0  0 10:00 ?        00:00:00 [kthreadd]
# zhangsan  1234     1  0 10:15 ?        00:00:05 python app.py

# 字段说明：
# PPID    父进程 ID
# C       CPU 使用率（旧式）
\`\`\`

### 2.3 常用过滤

\`\`\`bash
# 查看当前用户的进程
ps -u zhangsan

# 查看指定进程
ps -p 1234
ps -p 1234 -o pid,ppid,cmd

# 查找特定进程
ps aux | grep python
ps aux | grep nginx
# 注意：grep 自身也会出现，可排除
ps aux | grep python | grep -v grep

# 查看进程树
ps -ef --forest
pstree
pstree -p    # 显示 PID
pstree -u    # 显示用户

# 自定义输出格式
ps -eo pid,ppid,user,%cpu,%mem,cmd --sort=-%cpu | head
\`\`\`

### 2.4 实战示例

\`\`\`bash
# 找出占用 CPU 最高的 10 个进程
ps aux --sort=-%cpu | head -11

# 找出占用内存最高的 10 个进程
ps aux --sort=-%mem | head -11

# 查看所有 Python 进程
ps aux | grep "[p]ython"    # 技巧：[p] 避免匹配 grep 自身

# 查看进程的完整命令行
ps -p 1234 -o pid,cmd
\`\`\`

## 三、top 实时监控

### 3.1 基本用法

\`\`\`bash
# 启动 top
top
\`\`\`

\`\`\`text
top 输出示例：
top - 10:30:00 up  1:00,  2 users,  load average: 0.20, 0.15, 0.10
Tasks: 150 total,   1 running, 149 sleeping,   0 stopped,   0 zombie
%Cpu(s):  5.0 us,  2.0 sy,  0.0 ni, 92.0 id,  1.0 wa,  0.0 hi,  0.0 si
MiB Mem :   8000.0 total,   4000.0 free,   2000.0 used,   2000.0 buff/cache
MiB Swap:   2000.0 total,   2000.0 free,      0.0 used

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 1234 zhangsan  20   0  234567  25600   8000 S   5.0  1.2   0:05.00 python
 1235 mysql     20   0 1000000 200000  20000 S   2.0  5.0   0:10.00 mysqld

系统信息说明：
- load average: 1/5/15 分钟平均负载
- Tasks: 进程总数及各状态数量
- %Cpu(s): CPU 使用率
  us 用户态, sy 内核态, id 空闲, wa 等待 IO
- Mem: 内存使用
- Swap: 交换分区使用

进程信息说明：
- PR    优先级
- NI    nice 值（-20 到 19，越小优先级越高）
- VIRT  虚拟内存
- RES   物理内存
- SHR   共享内存
- S     状态
\`\`\`

### 3.2 top 交互命令

\`\`\`text
top 运行时的交互命令：
P    按 CPU 排序
M    按内存排序
T    按时间排序
N    按 PID 排序
1    显示所有 CPU 核心
m    切换内存显示方式
t    切换任务显示方式
c    显示完整命令
u    筛选用户
k    杀死进程（输入 PID）
r    修改 nice 值
z    彩色显示
x    高亮排序列
q    退出
h    帮助
\`\`\`

### 3.3 命令行参数

\`\`\`bash
# -d 刷新间隔（秒）
top -d 2

# -n 刷新次数后退出
top -n 5

# -b 批处理模式（适合脚本）
top -b -n 1 > top_snapshot.txt

# -p 监控指定进程
top -p 1234 -p 1235

# -u 指定用户
top -u zhangsan
\`\`\`

## 四、htop 增强版

\`\`\`bash
# 安装
# Ubuntu/Debian: sudo apt install htop
# CentOS/RHEL:   sudo yum install htop
# macOS:         brew install htop

# 启动
htop
\`\`\`

\`\`\`text
htop 比 top 的优势：
- 彩色界面，更直观
- 支持鼠标操作
- 可横向滚动查看完整命令
- 树形显示进程
- 快捷键操作更友好

htop 快捷键：
F5  树形视图
F6  排序
F9  杀死进程
F7/F8  调整 nice 值
+/-  折叠/展开子进程
/   搜索
q   退出
\`\`\`

## 五、kill 终止进程

### 5.1 信号说明

\`\`\`text
kill 通过发送信号控制进程。

常用信号：
SIGHUP    (1)   挂起（常用于重新加载配置）
SIGINT    (2)   中断（Ctrl+C）
SIGQUIT   (3)   退出（Ctrl+\\）
SIGKILL   (9)   强制杀死（不可捕获，最后手段）
SIGTERM   (15)  优雅终止（默认）
SIGCONT   (18)  继续
SIGSTOP   (19)  暂停
SIGTSTP   (20)  暂停（Ctrl+Z）

查看所有信号：
kill -l
\`\`\`

### 5.2 基本用法

\`\`\`bash
# 默认发送 SIGTERM（优雅终止）
kill 1234

# 发送指定信号
kill -9 1234       # 强制杀死
kill -SIGKILL 1234 # 同上
kill -15 1234      # 优雅终止
kill -1 1234       # SIGHUP（重新加载配置）

# 发送 SIGHUP 让 nginx 重新加载配置
kill -HUP $(cat /var/run/nginx.pid)

# 查看信号列表
kill -l
\`\`\`

### 5.3 killall 按进程名杀死

\`\`\`bash
# 按进程名杀死所有匹配的进程
killall python
killall nginx

# 指定信号
killall -9 python
killall -SIGTERM python

# 交互确认
killall -i python

# 杀死指定用户的进程
killall -u zhangsan python

# 等待直到所有进程被杀死
killall -w python
\`\`\`

### 5.4 pkill 模式匹配杀死

\`\`\`bash
# 按名称匹配
pkill python
pkill -f "python app.py"    # -f 匹配完整命令行

# 按用户
pkill -u zhangsan

# 按终端
pkill -t pts/0

# 发送信号
pkill -9 -f "python app.py"

# 实战：杀死所有占用 8080 端口的进程
pkill -f ":8080"
\`\`\`

### 5.5 安全终止流程

\`\`\`bash
# 1. 先尝试优雅终止
kill 1234
# 等待几秒

# 2. 检查是否还在
ps -p 1234

# 3. 如果还在，强制杀死
kill -9 1234

# 4. 确认已终止
ps -p 1234
# 如果无输出，说明已终止
\`\`\`

## 六、后台运行

### 6.1 & 后台运行

\`\`\`bash
# 命令后加 & 放到后台
python app.py &
# [1] 12345    # [1] 是作业号，12345 是 PID

# 查看后台作业
jobs
# [1]+  Running                 python app.py &

# 后台运行并丢弃输出
python app.py > /dev/null 2>&1 &
\`\`\`

### 6.2 jobs / fg / bg

\`\`\`bash
# 查看后台作业
jobs
# [1]-  Running                 python app.py &
# [2]+  Running                 python worker.py &

# jobs -l 显示 PID
jobs -l

# 把后台作业调到前台
fg %1    # 调出作业 1
# 此时 Ctrl+C 可终止，Ctrl+Z 暂停

# Ctrl+Z 暂停后，用 bg 继续在后台运行
bg %1

# 终止后台作业
kill %1
\`\`\`

### 6.3 nohup 不挂断运行

\`nohup\`（no hangup）让命令在用户退出后继续运行。

\`\`\`bash
# nohup 运行（退出终端不终止）
nohup python app.py &
# nohup: ignoring input and appending output to 'nohup.out'
# 输出默认保存到 nohup.out

# 指定输出文件
nohup python app.py > app.log 2>&1 &

# 完整示例
nohup python app.py > /var/log/myapp.log 2>&1 &
echo $!    # 输出最近后台进程的 PID
\`\`\`

### 6.4 disown 脱离终端

\`\`\`bash
# 启动后台进程
python app.py &
# [1] 12345

# 从作业表移除（即使关闭终端也不会终止）
disown %1

# 或启动后立即 disown
python app.py & disown

# disown -h 标记不接收 SIGHUP
disown -h %1
\`\`\`

### 6.5 nohup vs disown vs &

\`\`\`text
&         后台运行，关闭终端会被 SIGHUP 终止
nohup     忽略 SIGHUP，关闭终端继续运行
disown    从 shell 作业表移除，避免 SIGHUP

最佳实践：
nohup command > log 2>&1 &    # 最常用
\`\`\`

## 七、systemctl 服务管理

### 7.1 systemd 简介

\`\`\`text
systemd 是现代 Linux 的初始化系统（init），PID 为 1。
systemctl 是管理 systemd 服务的命令。

特点：
- 并行启动，启动速度快
- 按需启动服务
- 自动依赖管理
- 日志统一管理（journalctl）
- 服务状态监控与自动重启
\`\`\`

### 7.2 服务管理命令

\`\`\`bash
# 启动服务
sudo systemctl start nginx

# 停止服务
sudo systemctl stop nginx

# 重启服务
sudo systemctl restart nginx

# 重新加载配置（不中断服务）
sudo systemctl reload nginx

# 查看状态
sudo systemctl status nginx
# ● nginx.service - The nginx HTTP and reverse proxy server
#      Loaded: loaded (/usr/lib/systemd/system/nginx.service; enabled)
#      Active: active (running) since Thu 2024-01-01 10:00:00 CST; 1h ago
#    Main PID: 1234 (nginx)
#       Tasks: 2
#      Memory: 5.0M
#         CPU: 100ms
#      CGroup: /system.slice/nginx.service
#              ├─1234 nginx: master process
#              └─1235 nginx: worker process

# 设置开机自启
sudo systemctl enable nginx

# 取消开机自启
sudo systemctl disable nginx

# 启动并设置开机自启
sudo systemctl enable --now nginx

# 停止并取消开机自启
sudo systemctl disable --now nginx

# 检查是否开机自启
systemctl is-enabled nginx
# enabled

# 检查是否运行
systemctl is-active nginx
# active

# 查看所有服务
systemctl list-units --type=service

# 查看运行中的服务
systemctl list-units --type=service --state=running

# 查看失败的服务
systemctl --failed

# 查看所有已安装的服务
systemctl list-unit-files --type=service
\`\`\`

### 7.3 重载 systemd 配置

\`\`\`bash
# 修改 service 文件后需要 reload
sudo systemctl daemon-reload

# 然后重启服务
sudo systemctl restart myapp
\`\`\`

## 八、journalctl 日志查看

### 8.1 基本用法

\`\`\`bash
# 查看所有日志
journalctl

# 查看指定服务日志
journalctl -u nginx
journalctl -u myapp.service

# 实时跟踪日志
journalctl -u myapp -f

# 查看最近 100 行
journalctl -u myapp -n 100

# 查看今天的日志
journalctl --since today

# 指定时间范围
journalctl --since "2024-01-01 10:00:00" --until "2024-01-01 12:00:00"
journalctl --since "1 hour ago"
journalctl --since "30 min ago"

# 按优先级过滤
journalctl -p err    # 错误及以上
journalctl -p warning
# 优先级：emerg/alert/crit/err/warning/notice/info/debug

# 按进程 PID
journalctl _PID=1234

# 按用户
journalctl _UID=1000

# 只显示错误
journalctl -p err -u myapp
\`\`\`

### 8.2 输出格式

\`\`\`bash
# 不分页输出
journalctl --no-pager -u myapp

# JSON 格式
journalctl -u myapp -o json

# 详细输出
journalctl -o verbose -u myapp

# 只显示内核日志
journalctl -k
\`\`\`

### 8.3 日志维护

\`\`\`bash
# 查看日志占用空间
journalctl --disk-usage

# 清理日志（保留最近 2 天）
sudo journalctl --vacuum-time=2d

# 清理日志（保留 100MB）
sudo journalctl --vacuum-size=100M

# 验证日志完整性
journalctl --verify
\`\`\`

## 九、编写 systemd 服务文件

### 9.1 服务文件结构

\`\`\`text
服务文件位置：
/etc/systemd/system/xxx.service    # 系统级（推荐）
/usr/lib/systemd/system/xxx.service  # 软件包安装
~/.config/systemd/user/xxx.service  # 用户级

服务文件结构：
[Unit]        单元描述与依赖
[Service]     服务配置（启动命令等）
[Install]     安装配置（开机自启）
\`\`\`

### 9.2 基础服务文件示例

\`\`\`bash
# 创建服务文件
sudo vim /etc/systemd/system/myapp.service
\`\`\`

\`\`\`ini
[Unit]
Description=My Python Application
Documentation=https://example.com/docs
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=zhangsan
Group=zhangsan
WorkingDirectory=/home/zhangsan/myapp
Environment="PATH=/home/zhangsan/myapp/venv/bin:/usr/bin"
EnvironmentFile=/home/zhangsan/myapp/.env
ExecStart=/home/zhangsan/myapp/venv/bin/python app.py
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
\`\`\`

### 9.3 配置项详解

\`\`\`text
[Unit] 段：
Description    描述
Documentation  文档链接
After          在哪些服务之后启动
Before         在哪些服务之前启动
Wants          弱依赖（启动失败不影响）
Requires       强依赖（启动失败则本服务失败）
Conflicts      冲突服务

[Service] 段：
Type           服务类型
  simple       默认，ExecStart 启动的进程就是主进程
  forking      进程会 fork，父进程退出
  oneshot      一次性任务
  notify       启动完成后通知 systemd
User/Group     运行用户/组
WorkingDirectory  工作目录
Environment    环境变量
EnvironmentFile 环境变量文件
ExecStart      启动命令
ExecStop       停止命令
ExecReload     重新加载命令
Restart        重启策略
  no           不重启（默认）
  always       总是重启
  on-failure   非正常退出时重启
  on-success   正常退出时重启
RestartSec     重启间隔（秒）
TimeoutStartSec  启动超时
TimeoutStopSec   停止超时
StandardOutput 标准输出
StandardError  标准错误
LimitNOFILE    文件描述符限制
KillMode       杀死模式

[Install] 段：
WantedBy       安装到哪个 target
  multi-user.target  多用户模式（命令行）
  graphical.target   图形界面
\`\`\`

### 9.4 gunicorn 服务示例

\`\`\`ini
[Unit]
Description=Gunicorn for My Django App
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/home/zhangsan/myapp
Environment="PATH=/home/zhangsan/myapp/venv/bin"
ExecStart=/home/zhangsan/myapp/venv/bin/gunicorn \\
    --workers 4 \\
    --bind 0.0.0.0:8000 \\
    --access-logfile - \\
    --error-logfile - \\
    myproject.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
\`\`\`

### 9.5 Celery Worker 服务示例

\`\`\`ini
[Unit]
Description=Celery Worker Service
After=network.target redis-server.service

[Service]
Type=forking
User=zhangsan
Group=zhangsan
WorkingDirectory=/home/zhangsan/myapp
EnvironmentFile=/home/zhangsan/myapp/.env
ExecStart=/home/zhangsan/myapp/venv/bin/celery -A myapp worker --detach
ExecStop=/home/zhangsan/myapp/venv/bin/celery -A myapp control shutdown
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
\`\`\`

## 十、实战：把 Python 应用做成 systemd 服务

### 10.1 准备应用

\`\`\`bash
# 创建应用目录
mkdir -p /home/zhangsan/myapp
cd /home/zhangsan/myapp

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install flask gunicorn

# 创建应用
cat > app.py << 'EOF'
from flask import Flask
import os
import socket

app = Flask(__name__)

@app.route('/')
def hello():
    hostname = socket.gethostname()
    return f'Hello from {hostname}!'

@app.route('/health')
def health():
    return {'status': 'ok'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
EOF

# 创建环境变量文件
cat > .env << 'EOF'
FLASK_ENV=production
SECRET_KEY=my-secret-key
EOF
\`\`\`

### 10.2 创建服务文件

\`\`\`bash
# 创建服务文件
sudo tee /etc/systemd/system/myapp.service > /dev/null << 'EOF'
[Unit]
Description=My Flask Application
After=network.target

[Service]
Type=simple
User=zhangsan
Group=zhangsan
WorkingDirectory=/home/zhangsan/myapp
Environment="PATH=/home/zhangsan/myapp/venv/bin:/usr/bin"
EnvironmentFile=/home/zhangsan/myapp/.env
ExecStart=/home/zhangsan/myapp/venv/bin/gunicorn \\
    --workers 4 \\
    --bind 0.0.0.0:8000 \\
    --access-logfile - \\
    --error-logfile - \\
    app:app
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
\`\`\`

### 10.3 启动与管理服务

\`\`\`bash
# 重载 systemd 配置
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start myapp

# 查看状态
sudo systemctl status myapp
# ● myapp.service - My Flask Application
#      Active: active (running)
#    Main PID: 12345 (gunicorn)

# 设置开机自启
sudo systemctl enable myapp

# 测试访问
curl http://localhost:8000/
# Hello from hostname!

curl http://localhost:8000/health
# {"status":"ok"}

# 查看日志
sudo journalctl -u myapp -f

# 重新加载配置（修改代码后）
sudo systemctl restart myapp

# 停止服务
sudo systemctl stop myapp
\`\`\`

### 10.4 验证自动重启

\`\`\`bash
# 查看主进程 PID
sudo systemctl status myapp | grep "Main PID"
# Main PID: 12345 (gunicorn)

# 强制杀死
sudo kill -9 12345

# 等待 5 秒后查看，应该自动重启
sleep 6
sudo systemctl status myapp
# Active: active (running)
# Main PID: 12346 (gunicorn)    # PID 变了，说明重启了

# 查看重启日志
sudo journalctl -u myapp | grep -i restart
\`\`\`

### 10.5 常用运维命令

\`\`\`bash
# 查看服务日志（实时）
sudo journalctl -u myapp -f

# 查看最近 100 行日志
sudo journalctl -u myapp -n 100

# 查看今天的错误日志
sudo journalctl -u myapp --since today -p err

# 修改服务文件后
sudo systemctl daemon-reload
sudo systemctl restart myapp

# 查看服务资源占用
systemd-cgtop
systemctl status myapp
\`\`\`

## 十一、本章小结

\`\`\`text
本章学习的核心命令：

进程查看：
- ps         查看进程快照（aux、-ef）
- top/htop   实时监控
- pstree     进程树
- jobs       后台作业

进程控制：
- kill       按 PID 杀死
- killall    按名称杀死
- pkill      模式匹配杀死
- &          后台运行
- fg/bg      前后台切换
- nohup      不挂断运行
- disown     脱离终端

服务管理：
- systemctl  服务管理（start/stop/enable）
- journalctl 日志查看

服务文件：
- [Unit]     描述与依赖
- [Service]  服务配置
- [Install]  开机自启

通过 systemd 管理 Python 应用，可以实现：
- 开机自动启动
- 崩溃自动重启
- 统一日志管理
- 依赖服务管理
- 用户权限隔离

下一章将学习网络命令与防火墙，包括网络配置、端口查看、远程传输、
SSH 远程登录、防火墙配置等，这些是排查 Python 服务网络问题的必备技能。
\`\`\`
`
  },
  {
    id: "deploy-linux-network",
    icon: "🌐",
    title: "网络命令与防火墙",
    group: "Linux 常用命令",
    content: `# 网络命令与防火墙

## 一、网络配置查看

### 1.1 ifconfig（旧命令）

\`\`\`bash
# 查看所有网络接口
ifconfig
# eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
#         inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
#         inet6 fe80::a00:27ff:fe4e:66a1  prefixlen 64  scopeid 0x20<link>
#         ether 08:00:27:4e:66:a1  txqueuelen 1000  (Ethernet)
#         RX packets 12345  bytes 1234567 (1.2 MB)
#         TX packets 6789  bytes 987654 (987.6 KB)
#
# lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
#         inet 127.0.0.1  netmask 255.0.0.0

# 查看指定接口
ifconfig eth0

# 启用/禁用接口
sudo ifconfig eth0 up
sudo ifconfig eth0 down

# 配置 IP（临时）
sudo ifconfig eth0 192.168.1.100 netmask 255.255.255.0
\`\`\`

### 1.2 ip（新命令，推荐）

\`\`\`bash
# 查看所有网络接口
ip addr show
# 或简写
ip a

# 查看指定接口
ip addr show eth0
ip a show eth0

# 查看 IP 地址
ip -4 addr    # 只看 IPv4
ip -6 addr    # 只看 IPv6

# 查看链路状态
ip link show
ip link show eth0

# 启用/禁用接口
sudo ip link set eth0 up
sudo ip link set eth0 down

# 配置 IP 地址
sudo ip addr add 192.168.1.100/24 dev eth0
sudo ip addr del 192.168.1.100/24 dev eth0

# 查看路由表
ip route
ip route show
# default via 192.168.1.1 dev eth0
# 192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.100

# 查看默认网关
ip route | grep default

# 添加路由
sudo ip route add 10.0.0.0/24 via 192.168.1.1

# 查看 ARP 表
ip neigh
# 192.168.1.1 dev eth0 lladdr 00:1a:2b:3c:4d:5e REACHABLE

# 查看网络统计
ip -s link
\`\`\`

### 1.3 hostname 查看主机名

\`\`\`bash
# 查看主机名
hostname
# myserver

# 查看 FQDN
hostname -f

# 查看所有 IP
hostname -I
# 192.168.1.100 10.0.0.5

# 临时修改主机名
sudo hostname newname

# 永久修改
sudo hostnamectl set-hostname newname
\`\`\`

## 二、网络连通性测试

### 2.1 ping 测试连通性

\`\`\`bash
# 基本用法
ping 192.168.1.1
ping google.com

# 指定次数
ping -c 4 google.com
# PING google.com (142.250.80.46): 56 data bytes
# 64 bytes from 142.250.80.46: icmp_seq=0 ttl=117 time=10.5 ms
# 64 bytes from 142.250.80.46: icmp_seq=1 ttl=117 time=11.2 ms
# 64 bytes from 142.250.80.46: icmp_seq=2 ttl=117 time=10.8 ms
# 64 bytes from 142.250.80.46: icmp_seq=3 ttl=117 time=10.9 ms
# --- google.com ping statistics ---
# 4 packets transmitted, 4 received, 0.0% packet loss
# round-trip min/avg/max/stddev = 10.5/10.8/11.2/0.3 ms

# 指定间隔
ping -i 2 192.168.1.1     # 每 2 秒一次

# 指定包大小
ping -s 1000 192.168.1.1  # 1000 字节

# 指定超时
ping -W 2 192.168.1.1     # 等待 2 秒

# 洪水测试（需 root）
sudo ping -f 192.168.1.1

# 检测网络是否通
ping -c 1 -W 2 8.8.8.8 > /dev/null 2>&1 && echo "通" || echo "不通"
\`\`\`

### 2.2 traceroute 路由追踪

\`\`\`bash
# 追踪路由
traceroute google.com
# traceroute to google.com (142.250.80.46), 30 hops max
#  1  192.168.1.1 (192.168.1.1)  1.234 ms
#  2  10.0.0.1 (10.0.0.1)  5.678 ms
#  3  isp-router.com (1.2.3.4)  10.111 ms
#  ...

# 指定最大跳数
traceroute -m 15 google.com

# 指定查询次数
traceroute -q 1 google.com

# 使用 TCP（绕过防火墙）
sudo traceroute -T google.com

# macOS 使用
traceroute google.com
# 或
sudo traceroute -I google.com    # 使用 ICMP
\`\`\`

### 2.3 mtr 综合工具

\`mtr\` 结合了 ping 和 traceroute，实时显示每跳的丢包率。

\`\`\`bash
# 安装
# Ubuntu: sudo apt install mtr
# CentOS: sudo yum install mtr
# macOS:  brew install mtr

# 运行
mtr google.com
\`\`\`

\`\`\`text
mtr 输出示例：
                              My traceroute
                          HOST: myserver               Loss%   Snt   Last   Avg  Best  Wrst StDev
  1. 192.168.1.1                 0.0%    10    1.2   1.5   1.0   2.3   0.4
  2. 10.0.0.1                    0.0%    10    5.6   5.8   5.0   6.5   0.5
  3. isp-router.com              0.0%    10   10.1  10.5   9.8  11.2   0.4
  4. google.com                  0.0%    10   10.9  11.0  10.5  11.5   0.3

字段说明：
Loss%  丢包率
Snt    发送包数
Last   最后一次延迟
Avg    平均延迟
Best   最低延迟
Wrst   最高延迟
StDev  标准差
\`\`\`

\`\`\`bash
# 报告模式（运行 N 次后退出）
mtr -r -c 10 google.com > mtr_report.txt

# 显示 IP 而非主机名
mtr -n google.com

# 使用 TCP
sudo mtr -T google.com
\`\`\`

## 三、端口与连接查看

### 3.1 netstat（旧命令）

\`\`\`bash
# 查看所有连接
netstat -a

# 查看监听端口
netstat -l
netstat -tlnp     # -t TCP -l 监听 -n 数字 -p 进程

# 查看所有 TCP 连接
netstat -ant

# 查看所有 UDP 连接
netstat -anu

# 查看监听端口及进程（需 root）
sudo netstat -tlnp
# Proto Local Address     Foreign Address   State    PID/Program
# tcp    0.0.0.0:80        0.0.0.0:*         LISTEN   1234/nginx
# tcp    0.0.0.0:8000      0.0.0.0:*         LISTEN   1235/python
# tcp    127.0.0.1:5432    0.0.0.0:*         LISTEN   1236/postgres

# 查看路由表
netstat -r

# 查看接口统计
netstat -i

# 统计各状态连接数
netstat -ant | awk '{print $6}' | sort | uniq -c | sort -rn
\`\`\`

### 3.2 ss（新命令，推荐）

\`ss\`（socket statistics）比 netstat 更快。

\`\`\`bash
# 查看所有连接
ss -a

# 查看 TCP 连接
ss -t    # -t TCP
ss -u    # -u UDP

# 查看监听端口
ss -l
ss -tln
ss -tlnp    # -p 显示进程（需 root）

# 查看所有监听端口
sudo ss -tlnp
# State   Local Address:Port   Process
# LISTEN  0.0.0.0:80           users:(("nginx",pid=1234,fd=6))
# LISTEN  0.0.0.0:8000         users:(("python",pid=1235,fd=3))

# 查看指定端口
ss -tlnp | grep :8000
ss -tln 'sport = :8000'

# 查看指定端口的所有连接
ss -tn 'sport = :80'
ss -tn 'dport = :80'

# 查看已建立的连接
ss -t state established

# 查看 TIME_WAIT 状态连接
ss -t state time-wait | wc -l

# 统计各状态连接数
ss -ant | awk '{print $1}' | sort | uniq -c | sort -rn

# 查看连接本机 80 端口的 IP
ss -tn state established '( sport = :80 )' | awk '{print $4}' | cut -d: -f1 | sort | uniq -c
\`\`\`

### 3.3 lsof 查看端口占用

\`\`\`bash
# 查看指定端口占用
sudo lsof -i :8000
# COMMAND   PID    USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
# python   12345 zhangsan    3u  IPv4  12345      0t0  TCP *:8000 (LISTEN)

# 查看指定进程打开的文件
lsof -p 12345

# 查看指定用户打开的文件
lsof -u zhangsan

# 查看所有网络连接
lsof -i

# 查看 TCP 连接
lsof -i tcp

# 查看 80 端口的进程
sudo lsof -i :80
\`\`\`

### 3.4 实战：排查端口冲突

\`\`\`bash
# 启动应用报错端口被占用
python app.py
# OSError: [Errno 98] Address already in use

# 查看端口占用
sudo lsof -i :8000
# 或
sudo ss -tlnp | grep :8000

# 杀死占用进程
sudo kill -9 12345

# 重新启动
python app.py
\`\`\`

## 四、curl HTTP 请求

### 4.1 基本用法

\`\`\`bash
# GET 请求
curl http://example.com
curl https://api.example.com/users

# -o 保存到文件
curl -o file.zip http://example.com/file.zip

# -O 用原文件名保存
curl -O http://example.com/file.zip

# -L 跟随重定向
curl -L http://example.com

# -I 只看响应头
curl -I http://example.com
# HTTP/1.1 200 OK
# Server: nginx
# Content-Type: text/html
# Content-Length: 1234

# -i 显示响应头和正文
curl -i http://example.com

# -v 显示详细通信过程
curl -v http://example.com
\`\`\`

### 4.2 发送不同请求

\`\`\`bash
# -X 指定方法
curl -X POST http://example.com/api
curl -X PUT http://example.com/api/1
curl -X DELETE http://example.com/api/1

# -d 发送数据（POST）
curl -X POST -d "name=张三&age=25" http://example.com/api

# -H 指定请求头
curl -H "Content-Type: application/json" http://example.com/api

# 发送 JSON
curl -X POST \\
    -H "Content-Type: application/json" \\
    -d '{"name":"张三","age":25}' \\
    http://example.com/api

# 发送 JSON 文件
curl -X POST \\
    -H "Content-Type: application/json" \\
    -d @data.json \\
    http://example.com/api

# 认证
curl -u username:password http://example.com
curl -H "Authorization: Bearer token123" http://example.com/api
\`\`\`

### 4.3 实用参数

\`\`\`bash
# -s 静默模式（不显示进度）
curl -s http://example.com

# -S 显示错误
curl -sS http://example.com

# -w 格式化输出
curl -s -o /dev/null -w "%{http_code}" http://example.com
# 200

curl -s -o /dev/null -w "HTTP: %{http_code}\\nTime: %{time_total}s\\n" http://example.com
# HTTP: 200
# Time: 0.234s

# --connect-timeout 连接超时
curl --connect-timeout 5 http://example.com

# --max-time 最大超时
curl --max-time 10 http://example.com

# -x 代理
curl -x http://proxy.example.com:8080 http://example.com

# --retry 重试
curl --retry 3 http://example.com

# 测试接口响应时间
curl -o /dev/null -s -w "连接: %{time_connect}s\\nTTFB: %{time_starttransfer}s\\n总时间: %{time_total}s\\n" http://localhost:8000/
\`\`\`

### 4.4 测试本地服务

\`\`\`bash
# 测试健康检查
curl http://localhost:8000/health

# 测试 API
curl http://localhost:8000/api/users | python -m json.tool

# 带认证的请求
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/profile

# 上传文件
curl -X POST -F "file=@photo.jpg" http://localhost:8000/upload

# 下载文件
curl -O http://localhost:8000/files/report.pdf
\`\`\`

## 五、wget 下载工具

\`\`\`bash
# 基本下载
wget http://example.com/file.zip

# -O 指定保存文件名
wget -O myfile.zip http://example.com/file.zip

# -c 断点续传
wget -c http://example.com/large_file.zip

# -b 后台下载
wget -b http://example.com/large_file.zip

# -q 静默模式
wget -q http://example.com/file.zip

# 递归下载（整站）
wget -r http://example.com/
wget -r -l 2 http://example.com/    # 深度 2

# 限制下载速度
wget --limit-rate=100k http://example.com/file.zip

# 镜像网站
wget --mirror --convert-links --adjust-extension --page-requisites \\
    http://example.com/

# 下载需要认证的文件
wget --user=username --password=password http://example.com/protected.zip

# 使用代理
wget -e use_proxy=yes -e http_proxy=http://proxy:8080 http://example.com/
\`\`\`

## 六、scp 远程文件传输

### 6.1 基本用法

\`\`\`bash
# 上传本地文件到远程
scp file.zip user@remote:/path/to/dest/

# 下载远程文件到本地
scp user@remote:/path/to/file.zip ./

# 在两台远程服务器间传输
scp user1@host1:/file user2@host2:/dest/

# 指定端口
scp -P 2222 file.zip user@remote:/dest/

# 传输目录
scp -r mydir/ user@remote:/dest/

# -v 详细输出
scp -v file.zip user@remote:/dest/

# -C 压缩传输
scp -C large_file.zip user@remote:/dest/

# -p 保留原文件时间
scp -p file.zip user@remote:/dest/
\`\`\`

### 6.2 实战示例

\`\`\`bash
# 部署代码到服务器
scp -r myapp/ deploy@server:/home/deploy/

# 下载服务器日志
scp deploy@server:/var/log/myapp/app.log ./logs/

# 传输数据库备份
scp backup.sql root@db-server:/backups/

# 使用 SSH 配置中的别名
scp file.zip myserver:/dest/
\`\`\`

## 七、rsync 增量同步

\`rsync\` 比 scp 更强大，支持增量同步、断点续传。

### 7.1 基本用法

\`\`\`bash
# 本地同步
rsync -av src/ dest/

# 上传到远程
rsync -av myapp/ user@remote:/path/to/dest/

# 从远程下载
rsync -av user@remote:/path/to/src/ dest/

# -a 归档模式（保留权限、时间等）
# -v 详细输出
# -z 压缩传输
# -P 显示进度 + 断点续传
# --delete 删除目标中源没有的文件
# --exclude 排除
\`\`\`

### 7.2 常用参数组合

\`\`\`bash
# 常用：增量同步并显示进度
rsync -avzP myapp/ user@remote:/path/to/dest/

# 排除某些文件
rsync -av --exclude='*.pyc' --exclude='__pycache__' --exclude='.git' \\
    myapp/ user@remote:/path/to/dest/

# 使用排除文件
echo "*.pyc" > exclude.txt
echo "__pycache__/" >> exclude.txt
echo ".git/" >> exclude.txt
rsync -av --exclude-from='exclude.txt' myapp/ user@remote:/dest/

# 删除目标中源已删除的文件（镜像同步）
rsync -av --delete myapp/ user@remote:/dest/

# 限制带宽
rsync -av --bwlimit=1000 myapp/ user@remote:/dest/    # 限速 1MB/s

# 指定 SSH 端口
rsync -av -e "ssh -p 2222" myapp/ user@remote:/dest/

# 模拟运行（不实际传输）
rsync -av --dry-run myapp/ user@remote:/dest/
\`\`\`

### 7.3 部署实战

\`\`\`bash
# 部署 Python 项目（排除虚拟环境和缓存）
rsync -avzP --delete \\
    --exclude='venv/' \\
    --exclude='__pycache__/' \\
    --exclude='*.pyc' \\
    --exclude='.git/' \\
    --exclude='logs/' \\
    --exclude='.env' \\
    ./myapp/ deploy@server:/home/deploy/myapp/

# 部署后远程执行命令
ssh deploy@server "cd /home/deploy/myapp && source venv/bin/activate && pip install -r requirements.txt && sudo systemctl restart myapp"
\`\`\`

## 八、ssh 远程登录

### 8.1 基本用法

\`\`\`bash
# 远程登录
ssh user@hostname
ssh user@192.168.1.100

# 指定端口
ssh -p 2222 user@hostname

# 执行远程命令后返回
ssh user@hostname "ls -l /var/log"
ssh user@hostname "systemctl status nginx"

# 指定密钥
ssh -i ~/.ssh/id_rsa user@hostname

# 使用配置中的别名
ssh myserver
\`\`\`

### 8.2 SSH 密钥认证

\`\`\`bash
# 1. 生成密钥对
ssh-keygen -t rsa -b 4096 -C "zhangsan@example.com"
# 一路回车使用默认设置
# 生成：
#   ~/.ssh/id_rsa      私钥（保密）
#   ~/.ssh/id_rsa.pub  公钥（可公开）

# 2. 上传公钥到远程服务器
ssh-copy-id user@hostname
ssh-copy-id -i ~/.ssh/id_rsa.pub user@hostname

# 3. 测试免密登录
ssh user@hostname
# 不再需要输入密码

# 手动添加公钥（如果 ssh-copy-id 不可用）
cat ~/.ssh/id_rsa.pub | ssh user@hostname "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
\`\`\`

### 8.3 SSH 配置文件

\`\`\`bash
# 编辑 SSH 客户端配置
vim ~/.ssh/config
\`\`\`

\`\`\`text
# ~/.ssh/config 示例
Host myserver
    HostName 192.168.1.100
    User zhangsan
    Port 22
    IdentityFile ~/.ssh/id_rsa
    ServerAliveInterval 60

Host prod
    HostName production.example.com
    User deploy
    Port 2222
    IdentityFile ~/.ssh/prod_key

Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
\`\`\`

\`\`\`bash
# 使用别名
ssh myserver
ssh prod "systemctl status myapp"
scp file myserver:/dest/
\`\`\`

### 8.4 SSH 端口转发

\`\`\`bash
# 本地端口转发（访问本地 8080 = 访问远程的 80）
ssh -L 8080:localhost:80 user@remote
# 然后本地访问 http://localhost:8080 即访问远程的 80

# 本地转发到其他主机
ssh -L 8080:internal-server:80 user@jump-server
# 通过 jump-server 访问 internal-server 的 80 端口

# 远程端口转发（让远程能访问本地服务）
ssh -R 8080:localhost:80 user@remote
# 在远程访问 localhost:8080 = 访问本地的 80

# 动态端口转发（SOCKS 代理）
ssh -D 1080 user@remote
# 本地 1080 端口作为 SOCKS5 代理

# 后台运行端口转发
ssh -fN -L 8080:localhost:80 user@remote
# -f 后台, -N 不执行命令

# 实战：通过跳板机访问内网数据库
ssh -L 5432:db-internal:5432 user@jump-server
# 本地连接 5432 即可访问内网 PostgreSQL
\`\`\`

### 8.5 SSH 安全配置

\`\`\`bash
# 编辑 SSH 服务端配置
sudo vim /etc/ssh/sshd_config
\`\`\`

\`\`\`text
# 安全配置建议
Port 22                          # 修改默认端口
PermitRootLogin no               # 禁止 root 直接登录
PasswordAuthentication no        # 禁用密码登录（用密钥）
PubkeyAuthentication yes         # 启用密钥登录
MaxAuthTries 3                   # 最大认证尝试次数
AllowUsers zhangsan deploy       # 只允许特定用户
X11Forwarding no                 # 关闭 X11 转发

# 修改后重启 SSH 服务
sudo systemctl restart sshd
\`\`\`

## 九、防火墙配置

### 9.1 ufw（Ubuntu 默认）

\`\`\`bash
# 启用 ufw
sudo ufw enable

# 禁用 ufw
sudo ufw disable

# 查看状态
sudo ufw status
sudo ufw status verbose

# 允许端口
sudo ufw allow 80           # 允许 80 端口
sudo ufw allow 8000/tcp     # 允许 8000 TCP
sudo ufw allow 443/udp      # 允许 443 UDP

# 允许服务名
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# 限制（防暴力破解）
sudo ufw limit ssh          # 限制 SSH 连接频率

# 拒绝端口
sudo ufw deny 3306          # 拒绝外部访问 MySQL

# 删除规则
sudo ufw delete allow 80
sudo ufw delete allow 8000/tcp

# 允许特定 IP
sudo ufw allow from 192.168.1.100
sudo ufw allow from 192.168.1.0/24 to any port 22

# 允许特定 IP 访问特定端口
sudo ufw allow from 192.168.1.100 to any port 5432

# 按编号删除规则
sudo ufw status numbered
sudo ufw delete 3

# 重置
sudo ufw reset
\`\`\`

### 9.2 iptables（底层防火墙）

\`\`\`bash
# 查看规则
sudo iptables -L
sudo iptables -L -n -v
sudo iptables -L -n --line-numbers

# 查看 NAT 表
sudo iptables -t nat -L -n

# 允许已建立的连接
sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# 允许本地回环
sudo iptables -A INPUT -i lo -j ACCEPT

# 允许 SSH
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# 允许 HTTP/HTTPS
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# 允许 Python 应用端口
sudo iptables -A INPUT -p tcp --dport 8000 -j ACCEPT

# 拒绝其他所有入站
sudo iptables -A INPUT -j DROP
# 或
sudo iptables -P INPUT DROP

# 按编号删除规则
sudo iptables -L --line-numbers
sudo iptables -D INPUT 3

# 保存规则
# Ubuntu: sudo iptables-save | sudo tee /etc/iptables/rules.v4
# CentOS: sudo service iptables save

# 恢复规则
sudo iptables-restore < /etc/iptables/rules.v4
\`\`\`

### 9.3 firewalld（CentOS/RHEL 默认）

\`\`\`bash
# 查看状态
sudo systemctl status firewalld
sudo firewall-cmd --state

# 查看已开放的端口
sudo firewall-cmd --list-all

# 开放端口
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=8000/tcp

# 开放服务
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# 移除端口
sudo firewall-cmd --permanent --remove-port=8000/tcp

# 重新加载（使永久规则生效）
sudo firewall-cmd --reload

# 临时开放（重启失效）
sudo firewall-cmd --add-port=8080/tcp
\`\`\`

## 十、其他网络工具

### 10.1 nslookup / dig DNS 查询

\`\`\`bash
# nslookup
nslookup google.com
nslookup google.com 8.8.8.8    # 指定 DNS 服务器

# dig（更详细）
dig google.com
dig @8.8.8.8 google.com        # 指定 DNS
dig google.com MX              # 查询 MX 记录
dig google.com A               # 查询 A 记录
dig google.com NS              # 查询 NS 记录
dig +short google.com          # 简短输出

# host 命令
host google.com
host -t MX google.com
\`\`\`

### 10.2 nc (netcat) 网络工具

\`\`\`bash
# 测试端口是否开放
nc -zv 192.168.1.100 80
# Connection to 192.168.1.100 80 port [tcp/http] succeeded!

# 测试端口范围
nc -zv 192.168.1.100 80-90

# 监听端口
nc -l 8080

# 简单聊天
# 终端 1
nc -l 8080
# 终端 2
nc 192.168.1.100 8080

# 传输文件
# 接收端
nc -l 8080 > file.txt
# 发送端
nc 192.168.1.100 8080 < file.txt

# 端口扫描
nc -zvn 192.168.1.100 1-1000 2>&1 | grep succeeded
\`\`\`

### 10.3 tcpdump 抓包

\`\`\`bash
# 抓取指定接口的包
sudo tcpdump -i eth0

# 抓取指定端口
sudo tcpdump -i eth0 port 80

# 抓取指定主机的包
sudo tcpdump -i eth0 host 192.168.1.100

# 抓取指定主机和端口
sudo tcpdump -i eth0 host 192.168.1.100 and port 80

# 抓取 TCP 包
sudo tcpdump -i eth0 tcp

# 保存到文件
sudo tcpdump -i eth0 port 80 -w capture.pcap

# 读取抓包文件
tcpdump -r capture.pcap

# 显示 ASCII 内容
sudo tcpdump -i eth0 port 80 -A

# 限制抓取数量
sudo tcpdump -i eth0 -c 100
\`\`\`

## 十一、实战：排查 Python 服务网络问题

### 11.1 服务无法访问排查流程

\`\`\`bash
# 场景：Python 应用部署后无法从外部访问

# 1. 检查服务是否运行
sudo systemctl status myapp
ps aux | grep python

# 2. 检查端口是否监听
sudo ss -tlnp | grep 8000
# 如果显示 127.0.0.1:8000，说明只监听本地
# 需要改成 0.0.0.0:8000 才能外部访问

# 3. 本地测试
curl http://localhost:8000/
curl http://127.0.0.1:8000/

# 4. 检查防火墙
sudo ufw status
# 或
sudo firewall-cmd --list-all
# 或
sudo iptables -L -n

# 5. 开放端口
sudo ufw allow 8000/tcp
# 或
sudo firewall-cmd --permanent --add-port=8000/tcp && sudo firewall-cmd --reload

# 6. 从外部测试
curl http://your-server-ip:8000/

# 7. 检查云服务器安全组
# （在云平台控制台配置安全组规则）

# 8. 测试端口连通性
nc -zv your-server-ip 8000
\`\`\`

### 11.2 应用绑定地址问题

\`\`\`bash
# 问题：Flask 默认绑定 127.0.0.1，外部无法访问

# 错误写法
app.run()                          # 默认 127.0.0.1:5000
# 外部无法访问

# 正确写法
app.run(host='0.0.0.0', port=8000)  # 监听所有网卡
# 外部可访问

# gunicorn 同理
gunicorn --bind 0.0.0.0:8000 app:app
\`\`\`

### 11.3 网络延迟排查

\`\`\`bash
# 1. 测试到服务器的网络延迟
ping your-server-ip

# 2. 追踪路由
traceroute your-server-ip
mtr your-server-ip

# 3. 测试 HTTP 响应时间
curl -o /dev/null -s -w "DNS: %{time_namelookup}s\\n连接: %{time_connect}s\\nTLS: %{time_appconnect}s\\n首字节: %{time_starttransfer}s\\n总时间: %{time_total}s\\n" http://your-server/

# 4. 检查服务器负载
uptime
top

# 5. 检查网络连接状态
ss -s
ss -ant | awk '{print $1}' | sort | uniq -c | sort -rn
\`\`\`

### 11.4 端口被占用排查

\`\`\`bash
# 启动报错：Address already in use

# 1. 查看端口占用
sudo lsof -i :8000
# 或
sudo ss -tlnp | grep :8000

# 2. 查看进程详情
ps -p 12345 -o pid,cmd

# 3. 如果是僵尸进程，杀死
sudo kill -9 12345

# 4. 确认端口已释放
sudo ss -tlnp | grep :8000

# 5. 重新启动应用
python app.py
\`\`\`

### 11.5 综合排查脚本

\`\`\`bash
#!/bin/bash
# 网络问题排查脚本

echo "===== 系统信息 ====="
hostname
uptime

echo ""
echo "===== 网络接口 ====="
ip -4 addr show | grep inet

echo ""
echo "===== 监听端口 ====="
sudo ss -tlnp

echo ""
echo "===== 活跃连接数 ====="
ss -s

echo ""
echo "===== 防火墙状态 ====="
sudo ufw status 2>/dev/null || sudo firewall-cmd --list-all 2>/dev/null || echo "无 ufw/firewalld"

echo ""
echo "===== 测试外网连通性 ====="
ping -c 3 8.8.8.8

echo ""
echo "===== DNS 解析测试 ====="
nslookup google.com | head -5

echo ""
echo "===== HTTP 测试 ====="
curl -o /dev/null -s -w "HTTP: %{http_code}, Time: %{time_total}s\\n" http://localhost:8000/ 2>/dev/null || echo "8000 端口无服务"
\`\`\`

## 十二、本章小结

\`\`\`text
本章学习的核心命令：

网络配置：
- ifconfig/ip    查看/配置网络接口
- hostname       主机名管理

连通性测试：
- ping           测试连通性
- traceroute     路由追踪
- mtr            综合网络诊断

端口与连接：
- netstat/ss     查看端口与连接
- lsof           查看端口占用

HTTP 工具：
- curl           HTTP 请求（API 测试利器）
- wget           文件下载

文件传输：
- scp            远程文件复制
- rsync          增量同步

远程管理：
- ssh            远程登录与端口转发

防火墙：
- ufw            Ubuntu 防火墙
- iptables       底层防火墙
- firewalld      CentOS 防火墙

DNS 与抓包：
- nslookup/dig   DNS 查询
- nc             网络瑞士军刀
- tcpdump        抓包分析

下一章将学习用户、权限与磁盘管理，包括用户创建、sudo 配置、磁盘使用查看、
文件压缩解压、定时任务等系统管理必备技能。
\`\`\`
`
  },
  {
    id: "deploy-linux-user",
    icon: "👤",
    title: "用户、权限与磁盘",
    group: "Linux 常用命令",
    content: `# 用户、权限与磁盘

## 一、Linux 用户与组

### 1.1 用户与组的概念

\`\`\`text
Linux 是多用户操作系统，每个用户都有唯一标识。

用户类型：
- root（超级用户）：UID 0，拥有所有权限
- 系统用户：UID 1-999，运行系统服务（如 mysql、nginx）
- 普通用户：UID 1000+，日常使用

用户组：
- 每个用户至少属于一个主组
- 可以加入多个附加组
- 组用于权限共享

相关文件：
/etc/passwd    用户信息
/etc/shadow    用户密码（加密）
/etc/group     组信息
/etc/gshadow   组密码
\`\`\`

### 1.2 /etc/passwd 文件格式

\`\`\`bash
# 查看用户信息
cat /etc/passwd
# root:x:0:0:root:/root:/bin/bash
# zhangsan:x:1000:1000:Zhang San:/home/zhangsan:/bin/bash

# 字段说明（以冒号分隔）：
# zhangsan  用户名
# x         密码占位（实际在 /etc/shadow）
# 1000      UID
# 1000      GID（主组 ID）
# Zhang San 用户描述
# /home/zhangsan  家目录
# /bin/bash       默认 shell
\`\`\`

## 二、用户管理

### 2.1 useradd 创建用户

\`\`\`bash
# 基本创建
sudo useradd zhangsan
# 默认不创建家目录

# -m 创建家目录
sudo useradd -m zhangsan

# -d 指定家目录
sudo useradd -m -d /home/zs zhangsan

# -s 指定登录 shell
sudo useradd -m -s /bin/bash zhangsan

# -g 指定主组
sudo useradd -m -g developers zhangsan

# -G 指定附加组
sudo useradd -m -G docker,sudo zhangsan

# -u 指定 UID
sudo useradd -m -u 2000 zhangsan

# -c 添加描述
sudo useradd -m -c "Zhang San" zhangsan

# -e 指定账号过期时间
sudo useradd -m -e 2024-12-31 tempuser

# 综合示例
sudo useradd -m -d /home/zhangsan -s /bin/bash -G sudo,docker -c "Zhang San" zhangsan
\`\`\`

### 2.2 adduser（交互式创建，Ubuntu）

\`\`\`bash
# Ubuntu 的 adduser 是交互式的，更友好
sudo adduser zhangsan
# 会依次提示输入密码、描述等信息
\`\`\`

### 2.3 usermod 修改用户

\`\`\`bash
# 修改用户名
sudo usermod -l newname oldname

# 修改家目录
sudo usermod -d /home/newdir -m zhangsan   # -m 迁移内容

# 修改 shell
sudo usermod -s /bin/zsh zhangsan

# 添加到附加组
sudo usermod -aG docker zhangsan       # -aG 追加到组
sudo usermod -aG sudo,docker zhangsan  # 添加多个组

# 修改主组
sudo usermod -g developers zhangsan

# 锁定/解锁账号
sudo usermod -L zhangsan    # 锁定
sudo usermod -U zhangsan    # 解锁

# 设置过期时间
sudo usermod -e 2024-12-31 zhangsan

# 注意：修改正在登录的用户需先让其退出
\`\`\`

### 2.4 userdel 删除用户

\`\`\`bash
# 只删除用户（保留家目录）
sudo userdel zhangsan

# 删除用户及家目录
sudo userdel -r zhangsan

# 删除用户及家目录、邮箱
sudo userdel -r -f zhangsan

# 查看用户是否存在
id zhangsan
\`\`\`

### 2.5 passwd 密码管理

\`\`\`bash
# 修改自己的密码
passwd

# 修改其他用户密码（需 root）
sudo passwd zhangsan

# 锁定密码
sudo passwd -l zhangsan

# 解锁密码
sudo passwd -u zhangsan

# 删除密码（无密码登录）
sudo passwd -d zhangsan

# 查看密码状态
sudo passwd -S zhangsan
# zhangsan P 01/01/2024 0 99999 7 -1
# P=有密码, L=锁定, NP=无密码
\`\`\`

## 三、组管理

### 3.1 groupadd 创建组

\`\`\`bash
# 创建组
sudo groupadd developers

# 指定 GID
sudo groupadd -g 2000 developers

# 创建系统组
sudo groupadd -r sysgroup
\`\`\`

### 3.2 groupmod 修改组

\`\`\`bash
# 修改组名
sudo groupmod -n newdevs developers

# 修改 GID
sudo groupmod -g 3000 developers
\`\`\`

### 3.3 groupdel 删除组

\`\`\`bash
# 删除组（组内不能有用户作为主组）
sudo groupdel developers
\`\`\`

### 3.4 gpasswd 组成员管理

\`\`\`bash
# 添加用户到组
sudo gpasswd -a zhangsan developers

# 从组中移除用户
sudo gpasswd -d zhangsan developers

# 设置组管理员
sudo gpasswd -A zhangsan developers

# 设置组密码
sudo gpasswd developers

# 批量添加用户
sudo gpasswd -M zhangsan,lisi,wangwu developers
\`\`\`

### 3.5 查看组信息

\`\`\`bash
# 查看用户所属组
groups zhangsan
# zhangsan : zhangsan developers docker

# 查看组内成员
getent group developers
# developers:x:2000:zhangsan,lisi

# 查看用户详细信息
id zhangsan
# uid=1000(zhangsan) gid=1000(zhangsan) groups=1000(zhangsan),2000(developers),998(docker)
\`\`\`

## 四、su 与 sudo

### 4.1 su 切换用户

\`\`\`bash
# 切换到 root（需输入 root 密码）
su -
su root

# 切换到指定用户
su - zhangsan

# - 表示加载目标用户的环境变量

# 执行命令后返回
su - zhangsan -c "whoami"

# 使用 sudo 切换到 root（推荐）
sudo -i        # 进入 root 交互式 shell
sudo -s        # 进入 root 非登录 shell
sudo su -      # 同 su -
\`\`\`

### 4.2 sudo 临时提权

\`\`\`bash
# 以 root 执行命令
sudo command

# 查看当前用户的 sudo 权限
sudo -l

# 切换用户执行命令
sudo -u zhangsan whoami

# -k 重新输入密码（清除缓存）
sudo -k
\`\`\`

### 4.3 sudoers 配置

\`\`\`bash
# 编辑 sudoers（必须用 visudo）
sudo visudo
\`\`\`

\`\`\`text
# /etc/sudoers 配置示例

# 允许用户执行所有命令
zhangsan ALL=(ALL:ALL) ALL

# 允许用户无需密码执行所有命令
zhangsan ALL=(ALL) NOPASSWD: ALL

# 允许用户执行特定命令
zhangsan ALL=(ALL) /usr/bin/systemctl, /usr/bin/apt

# 允许用户无需密码执行特定命令
zhangsan ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart myapp

# 允许组内用户执行所有命令
%sudo ALL=(ALL:ALL) ALL
%admin ALL=(ALL) ALL

# 允许组内用户无需密码执行
%developers ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart myapp

# 语法说明：
# 用户  主机=(可切换用户:可切换组) [NOPASSWD:] 命令
\`\`\`

### 4.4 sudoers 最佳实践

\`\`\`text
1. 永远用 visudo 编辑，会检查语法
2. 优先使用 /etc/sudoers.d/ 目录存放单独配置
3. 给应用专用用户最小权限
4. 生产环境避免 NOPASSWD: ALL
5. 命令使用绝对路径
\`\`\`

\`\`\`bash
# 创建单独的 sudoers 配置
sudo visudo -f /etc/sudoers.d/myapp
\`\`\`

\`\`\`text
# /etc/sudoers.d/myapp
deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart myapp
deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl reload myapp
deploy ALL=(ALL) NOPASSWD: /usr/bin/journalctl -u myapp
\`\`\`

## 五、磁盘使用查看

### 5.1 df 查看磁盘空间

\`\`\`bash
# 查看所有文件系统使用情况
df
# Filesystem     1K-blocks    Used Available Use% Mounted on
# /dev/sda1       50000000 20000000  30000000  40% /
# tmpfs             1000000       0    1000000   0% /dev/shm

# -h 人类可读
df -h
# Filesystem      Size  Used Avail Use% Mounted on
# /dev/sda1        50G   20G   30G  40% /

# -H 以 1000 为单位
df -H

# 查看指定文件系统
df -h /home

# -T 显示文件系统类型
df -T

# -i 查看 inode 使用
df -i

# 只看本地磁盘
df -hl

# 实战：监控磁盘并发告警
df -h | awk 'NR>1 && int($5) > 80 {print "警告："$1" 使用率 "$5}'
\`\`\`

### 5.2 du 查看目录大小

\`\`\`bash
# 查看当前目录总大小
du -sh .

# 查看各子目录大小
du -sh *

# -h 人类可读
du -h

# -s 只显示总计
du -sh /home/zhangsan

# --max-depth 限制深度
du -h --max-depth=1 /home/zhangsan

# 按大小排序（找出最大的目录）
du -sh * | sort -rh | head -10

# 排除某些目录
du -sh --exclude='node_modules' --exclude='.git' .

# 统计所有 .log 文件大小
find /var/log -name "*.log" -exec du -ch {} + | tail -1

# 实战：找出项目中最大的文件
find . -type f -exec du -h {} + | sort -rh | head -20
\`\`\`

### 5.3 磁盘使用排查

\`\`\`bash
# 1. 查看整体磁盘使用
df -h

# 2. 找出根目录下最大的目录
sudo du -sh /* 2>/dev/null | sort -rh | head -10

# 3. 深入大目录
sudo du -sh /var/* 2>/dev/null | sort -rh | head -10

# 4. 查找大文件
sudo find / -type f -size +100M 2>/dev/null | head -20

# 5. 检查日志目录大小
sudo du -sh /var/log

# 6. 清理旧日志
sudo journalctl --vacuum-time=7d
sudo find /var/log -name "*.gz" -mtime +30 -delete
\`\`\`

## 六、mount 挂载文件系统

### 6.1 挂载命令

\`\`\`bash
# 查看已挂载的文件系统
mount
# /dev/sda1 on / type ext4 (rw,relatime)
# proc on /proc type proc (rw,nosuid,nodev,noexec)

# 挂载 U 盘
sudo mount /dev/sdb1 /mnt/usb

# 挂载指定文件系统类型
sudo mount -t ext4 /dev/sdb1 /mnt/data
sudo mount -t ntfs /dev/sdb1 /mnt/windows

# 挂载 ISO 文件
sudo mount -o loop ubuntu.iso /mnt/iso

# 挂载 NFS 共享
sudo mount -t nfs 192.168.1.100:/share /mnt/nfs

# 只读挂载
sudo mount -o ro /dev/sdb1 /mnt/data

# 卸载
sudo umount /mnt/usb
sudo umount /dev/sdb1

# -l 强制卸载（忙时）
sudo umount -l /mnt/usb
\`\`\`

### 6.2 /etc/fstab 开机自动挂载

\`\`\`bash
# 查看fstab
cat /etc/fstab
# 设备         挂载点  类型  选项      dump pass
# /dev/sda1    /       ext4  defaults   0   1
# /dev/sdb1    /data   ext4  defaults   0   2

# 添加自动挂载
echo "/dev/sdb1 /data ext4 defaults 0 2" | sudo tee -a /etc/fstab

# 测试挂载
sudo mount -a

# 查看挂载信息
findmnt
\`\`\`

## 七、tar 压缩归档

### 7.1 基本用法

\`\`\`bash
# 创建 tar 包（不压缩）
tar -cvf archive.tar dir/
# -c 创建 -v 详细 -f 文件名

# 查看 tar 包内容
tar -tvf archive.tar

# 解压 tar 包
tar -xvf archive.tar
# -x 解压

# 解压到指定目录
tar -xvf archive.tar -C /tmp/
\`\`\`

### 7.2 压缩格式

\`\`\`bash
# gzip 压缩（.tar.gz 或 .tgz，最常用）
tar -czvf archive.tar.gz dir/
# -z gzip 压缩

# bzip2 压缩（.tar.bz2，压缩率更高）
tar -cjvf archive.tar.bz2 dir/
# -j bzip2 压缩

# xz 压缩（.tar.xz，压缩率最高）
tar -cJvf archive.tar.xz dir/
# -J xz 压缩

# 对应解压
tar -xzvf archive.tar.gz
tar -xjvf archive.tar.bz2
tar -xJvf archive.tar.xz
\`\`\`

### 7.3 实用选项

\`\`\`bash
# 排除文件
tar -czvf archive.tar.gz --exclude='*.pyc' --exclude='__pycache__' dir/
tar -czvf archive.tar.gz --exclude-from=exclude.txt dir/

# 追加文件到 tar 包
tar -rvf archive.tar newfile.txt

# 只解压指定文件
tar -xzvf archive.tar.gz path/to/file

# 查看压缩包大小
ls -lh archive.tar.gz

# 实战：备份 Python 项目
tar -czvf myapp_$(date +%Y%m%d).tar.gz \\
    --exclude='venv' \\
    --exclude='__pycache__' \\
    --exclude='.git' \\
    --exclude='logs' \\
    myapp/
\`\`\`

## 八、zip / unzip 压缩

### 8.1 zip 压缩

\`\`\`bash
# 压缩单个文件
zip archive.zip file.txt

# 压缩多个文件
zip archive.zip a.txt b.txt c.txt

# 压缩目录（-r 递归）
zip -r project.zip myproject/

# 排除文件
zip -r project.zip myproject/ -x "*.pyc" -x "*/__pycache__/*"

# 加密码
zip -e -r secret.zip secret/

# 追加文件
zip archive.zip newfile.txt

# 压缩级别（0-9）
zip -9 -r archive.zip dir/    # 最高压缩率
zip -0 -r archive.zip dir/    # 不压缩（仅打包）
\`\`\`

### 8.2 unzip 解压

\`\`\`bash
# 解压
unzip archive.zip

# 解压到指定目录
unzip archive.zip -d /tmp/

# 查看内容（不解压）
unzip -l archive.zip

# 解压指定文件
unzip archive.zip file.txt

# 解压到 stdout
unzip -p archive.zip file.txt

# 测试完整性
unzip -t archive.zip
\`\`\`

### 8.3 其他压缩工具

\`\`\`bash
# gzip（单文件压缩）
gzip file.txt          # 生成 file.txt.gz，原文件消失
gzip -k file.txt       # -k 保留原文件
gzip -d file.txt.gz    # 解压
gunzip file.txt.gz     # 同上

# bzip2（压缩率更高）
bzip2 file.txt         # 生成 file.txt.bz2
bzip2 -d file.txt.bz2  # 解压
bunzip2 file.txt.bz2   # 同上

# xz（压缩率最高）
xz file.txt            # 生成 file.txt.xz
xz -d file.txt.xz      # 解压
unxz file.txt.xz       # 同上

# 7z（需安装 p7zip）
7z a archive.7z dir/
7z x archive.7z
\`\`\`

## 九、crontab 定时任务

### 9.1 cron 表达式

\`\`\`text
cron 表达式格式：
分 时 日 月 周 命令
0-59 0-23 1-31 1-12 0-7

特殊字符：
*     任意值
,     列表（1,3,5）
-     范围（1-5）
/     步长（*/5 每 5 分钟）

示例：
*/5 * * * *           每 5 分钟
0 * * * *             每小时整点
0 0 * * *             每天 0 点
0 0 * * 0             每周日 0 点
0 0 1 * *             每月 1 号 0 点
0 9 * * 1-5           工作日 9 点
0 */2 * * *           每 2 小时
0 0,12 * * *          每天 0 点和 12 点
\`\`\`

### 9.2 crontab 命令

\`\`\`bash
# 查看当前用户的定时任务
crontab -l

# 编辑定时任务
crontab -e

# 删除所有定时任务
crontab -r

# 交互式删除
crontab -ri

# 指定用户（需 root）
sudo crontab -u zhangsan -l
sudo crontab -u zhangsan -e

# 从文件导入
crontab cron_tasks.txt
\`\`\`

### 9.3 定时任务示例

\`\`\`bash
# 编辑定时任务
crontab -e
\`\`\`

\`\`\`text
# 每天凌晨 2 点备份数据库
0 2 * * * /home/zhangsan/scripts/backup_db.sh

# 每 5 分钟检查服务并重启
*/5 * * * * /home/zhangsan/scripts/check_service.sh

# 每周一 9 点清理日志
0 9 * * 1 find /var/log/myapp -name "*.log" -mtime +30 -delete

# 每天 0 点同步数据到备份服务器
0 0 * * * rsync -az /data/ backup@remote:/backup/

# 每小时执行 Python 数据处理脚本
0 * * * * /home/zhangsan/myapp/venv/bin/python /home/zhangsan/myapp/process_data.py

# 工作日 9 点发送日报
0 9 * * 1-5 /home/zhangsan/scripts/daily_report.sh
\`\`\`

### 9.4 cron 注意事项

\`\`\`bash
# 1. 环境变量问题：cron 环境变量有限，建议在脚本中设置
#!/bin/bash
source /home/zhangsan/.bashrc
export PATH="/home/zhangsan/myapp/venv/bin:$PATH"
python /home/zhangsan/myapp/script.py

# 2. 使用绝对路径
0 2 * * * /usr/bin/python3 /home/zhangsan/myapp/script.py

# 3. 输出重定向（避免邮件堆积）
0 2 * * * /home/zhangsan/scripts/backup.sh >> /var/log/backup.log 2>&1

# 4. 丢弃输出
0 2 * * * /home/zhangsan/scripts/backup.sh > /dev/null 2>&1

# 5. cron 日志位置
# Ubuntu: /var/log/syslog
# CentOS: /var/log/cron
grep CRON /var/log/syslog
\`\`\`

## 十、实战：为 Python 应用创建专用用户

### 10.1 创建专用用户

\`\`\`bash
# 创建专用用户（不能登录，无 shell）
sudo useradd -r -s /bin/false -d /opt/myapp -m myapp
# -r 系统用户
# -s /bin/false 不能登录
# -d 指定家目录
# -m 创建家目录

# 或创建可登录的用户
sudo useradd -m -s /bin/bash -d /home/myapp myapp

# 设置密码
sudo passwd myapp

# 加入 docker 组（如需使用 docker）
sudo usermod -aG docker myapp
\`\`\`

### 10.2 配置项目目录

\`\`\`bash
# 创建项目目录
sudo mkdir -p /opt/myapp

# 设置所有者
sudo chown -R myapp:myapp /opt/myapp

# 进入目录
cd /opt/myapp

# 切换到 myapp 用户
sudo su - myapp

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install flask gunicorn

# 退出
exit
\`\`\`

### 10.3 配置 sudo 权限

\`\`\`bash
# 让 myapp 用户能重启服务
sudo visudo -f /etc/sudoers.d/myapp
\`\`\`

\`\`\`text
# /etc/sudoers.d/myapp
myapp ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart myapp
myapp ALL=(ALL) NOPASSWD: /usr/bin/systemctl reload myapp
myapp ALL=(ALL) NOPASSWD: /usr/bin/systemctl status myapp
myapp ALL=(ALL) NOPASSWD: /usr/bin/journalctl -u myapp
\`\`\`

### 10.4 配置定时备份

\`\`\`bash
# 切换到 myapp 用户
sudo su - myapp

# 创建备份脚本
cat > /opt/myapp/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/myapp"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# 备份代码
tar -czf $BACKUP_DIR/myapp_$DATE.tar.gz \\
    --exclude='venv' \\
    --exclude='__pycache__' \\
    --exclude='logs' \\
    /opt/myapp/

# 删除 7 天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "[$(date)] 备份完成: myapp_$DATE.tar.gz"
EOF

# 添加执行权限
chmod +x /opt/myapp/backup.sh

# 配置定时任务（每天凌晨 3 点备份）
crontab -e
# 添加：
0 3 * * * /opt/myapp/backup.sh >> /var/log/myapp_backup.log 2>&1
\`\`\`

### 10.5 验证配置

\`\`\`bash
# 检查用户
id myapp

# 检查目录权限
ls -ld /opt/myapp

# 检查 sudo 权限
sudo -u myapp sudo -l

# 测试备份脚本
sudo -u myapp /opt/myapp/backup.sh

# 查看定时任务
sudo crontab -u myapp -l
\`\`\`

## 十一、本章小结

\`\`\`text
本章学习的核心命令：

用户管理：
- useradd     创建用户
- usermod     修改用户
- userdel     删除用户
- passwd      密码管理

组管理：
- groupadd    创建组
- groupmod    修改组
- groupdel    删除组
- gpasswd     组成员管理

权限提升：
- su          切换用户
- sudo        临时提权
- visudo      编辑 sudoers

磁盘管理：
- df          查看磁盘空间
- du          查看目录大小
- mount       挂载文件系统
- umount      卸载

压缩解压：
- tar         归档压缩
- zip/unzip   ZIP 格式
- gzip/gunzip gzip 格式

定时任务：
- crontab     定时任务管理

为 Python 应用创建专用用户的好处：
1. 权限隔离，提升安全性
2. 资源限制，避免影响系统
3. 审计追踪，日志清晰
4. 符合最小权限原则

下一章将学习环境变量与 Shell 脚本，包括环境变量配置、PATH 设置、
Shell 脚本编写等，帮助你自动化部署和运维 Python 应用。
\`\`\`
`
  },
  {
    id: "deploy-linux-env",
    icon: "🛠️",
    title: "环境变量与 Shell",
    group: "Linux 常用命令",
    content: `# 环境变量与 Shell

## 一、环境变量基础

### 1.1 什么是环境变量

\`\`\`text
环境变量是操作系统提供的命名值对，用于存储配置信息。

特点：
- 进程可以从父进程继承环境变量
- 影响程序运行行为
- 分为系统级和用户级
- 大写命名是惯例（如 PATH、HOME）

常见环境变量：
PATH        命令搜索路径
HOME        用户家目录
USER        当前用户名
SHELL       当前 shell
PWD         当前工作目录
LANG        语言设置
TERM        终端类型
EDITOR      默认编辑器
PYTHONPATH  Python 模块搜索路径
VIRTUAL_ENV 虚拟环境路径
\`\`\`

### 1.2 查看环境变量

\`\`\`bash
# 查看所有环境变量
env
# 或
printenv

# 查看指定环境变量
echo $PATH
echo $HOME
printenv PATH

# printenv 可指定多个
printenv HOME SHELL USER

# set 显示所有变量（包括 shell 变量和环境变量）
set | head -20

# declare 显示变量属性
declare -p PATH
\`\`\`

### 1.3 设置环境变量

\`\`\`bash
# 临时设置（仅当前 shell 有效）
export MY_VAR="hello"
export APP_PORT=8000
export DATABASE_URL="postgres://localhost/mydb"

# 验证
echo $MY_VAR
printenv MY_VAR

# 设置多个
export VAR1=a VAR2=b VAR3=c

# 在命令前设置（仅对该命令有效）
APP_ENV=production python app.py
DEBUG=true ./script.sh

# 删除环境变量
unset MY_VAR
\`\`\`

### 1.4 export 与普通变量

\`\`\`bash
# 普通变量（子进程不可见）
MY_VAR="hello"
bash -c 'echo $MY_VAR'    # 输出为空

# export 后子进程可见
export MY_VAR="hello"
bash -c 'echo $MY_VAR'    # 输出 hello

# 查看是否 export
export -p | grep MY_VAR
declare -x MY_VAR="hello"  # -x 表示 export
\`\`\`

## 二、配置文件

### 2.1 配置文件加载顺序

\`\`\`text
登录 shell 加载顺序：
1. /etc/profile        系统级，所有用户
2. ~/.bash_profile     用户级（登录时）
3. ~/.bash_login       （如果 .bash_profile 不存在）
4. ~/.profile          （如果以上都不存在）

非登录 shell（如新开终端）：
~/.bashrc              用户级

退出时：
~/.bash_logout

最佳实践：
- 系统级配置放 /etc/profile.d/*.sh
- 用户级配置放 ~/.bashrc
- 在 ~/.bash_profile 中 source ~/.bashrc
\`\`\`

### 2.2 .bashrc 配置

\`\`\`bash
# 编辑 ~/.bashrc
vim ~/.bashrc
\`\`\`

\`\`\`bash
# ~/.bashrc 常用配置

# 别名
alias ll='ls -lah'
alias la='ls -A'
alias ..='cd ..'
alias ...='cd ../..'
alias grep='grep --color=auto'
alias python='python3'
alias pip='pip3'

# 环境变量
export EDITOR=vim
export VISUAL=vim
export LANG=en_US.UTF-8

# PATH 添加自定义目录
export PATH="$PATH:$HOME/bin:$HOME/.local/bin"

# Python 虚拟环境
export WORKON_HOME=$HOME/.virtualenvs
export VIRTUALENVWRAPPER_PYTHON=/usr/bin/python3
source /usr/local/bin/virtualenvwrapper.sh

# 命令提示符自定义
PS1='\\u@\\h:\\w\\$ '
# \\u 用户名 \\h 主机名 \\w 当前目录

# 历史命令配置
export HISTSIZE=10000
export HISTFILESIZE=20000
export HISTCONTROL=ignoredups

# 函数
mkcd() {
    mkdir -p "$1" && cd "$1"
}
\`\`\`

### 2.3 .bash_profile 配置

\`\`\`bash
# 编辑 ~/.bash_profile
vim ~/.bash_profile
\`\`\`

\`\`\`bash
# ~/.bash_profile
# 加载 .bashrc
if [ -f ~/.bashrc ]; then
    source ~/.bashrc
fi

# 登录时执行的命令
echo "欢迎回来，$USER！"
\`\`\`

### 2.4 系统级配置

\`\`\`bash
# /etc/profile.d/ 目录（推荐方式）
sudo vim /etc/profile.d/myapp.sh
\`\`\`

\`\`\`bash
# /etc/profile.d/myapp.sh
export MYAPP_HOME=/opt/myapp
export PATH=$PATH:$MYAPP_HOME/bin
\`\`\`

\`\`\`bash
# /etc/environment（系统级，不能使用变量展开）
sudo vim /etc/environment
\`\`\`

\`\`\`text
# /etc/environment
JAVA_HOME=/usr/lib/jvm/java-11
PYTHONPATH=/opt/myapp/src
\`\`\`

## 三、PATH 变量

### 3.1 PATH 工作原理

\`\`\`bash
# 查看 PATH
echo $PATH
# /usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin

# 命令查找过程
# 1. 输入命令 python
# 2. 依次在 PATH 各目录中查找 python
# 3. 找到第一个就执行

# 查看命令位置
which python
# /usr/bin/python

which python3
# /usr/local/bin/python3

# 查看所有匹配位置
whereis python
# python: /usr/bin/python /usr/local/bin/python

# type 查看命令类型
type cd
# cd is a shell builtin
type ls
# ls is aliased to 'ls --color=auto'
type python
# python is /usr/bin/python
\`\`\`

### 3.2 修改 PATH

\`\`\`bash
# 临时修改（当前 shell）
export PATH=$PATH:/opt/myapp/bin

# 在前面添加（优先级更高）
export PATH=/opt/myapp/bin:$PATH

# 永久修改（写入配置文件）
echo 'export PATH=$PATH:$HOME/bin' >> ~/.bashrc
source ~/.bashrc

# 添加多个路径
export PATH=$PATH:/opt/app1/bin:/opt/app2/bin

# 实战：让 pip 安装的命令可用
export PATH=$PATH:$HOME/.local/bin

# 实战：Python 虚拟环境
source venv/bin/activate
# activate 脚本会临时修改 PATH，把 venv/bin 放最前
\`\`\`

### 3.3 PATH 安全注意

\`\`\`bash
# 危险：把当前目录放 PATH 前面
export PATH=.:$PATH
# 攻击者可在目录放同名恶意脚本

# 安全：把自定义目录放后面
export PATH=$PATH:/my/custom/bin

# 检查 PATH 中是否有可写目录
echo $PATH | tr ':' '\\n' | xargs ls -ld
\`\`\`

## 四、source 与执行脚本

### 4.1 source 与 . 命令

\`\`\`bash
# source 和 . 是等价的，在当前 shell 执行脚本
source script.sh
. script.sh

# 特点：
# 1. 在当前 shell 中执行（不创建子进程）
# 2. 脚本中的变量、函数、alias 在当前 shell 可用
# 3. 不需要执行权限
\`\`\`

### 4.2 直接执行脚本

\`\`\`bash
# 直接执行（创建子进程）
./script.sh
bash script.sh

# 特点：
# 1. 在子 shell 中执行
# 2. 脚本中的变量不影响当前 shell
# 3. 需要执行权限（./script.sh）

# 添加执行权限
chmod +x script.sh
\`\`\`

### 4.3 对比示例

\`\`\`bash
# 创建测试脚本
cat > test.sh << 'EOF'
#!/bin/bash
MY_VAR="from script"
export MY_VAR
cd /tmp
EOF

# 方式 1：source
source test.sh
echo $MY_VAR    # 输出 from script
pwd             # 输出 /tmp（目录变了）

# 方式 2：直接执行
./test.sh
echo $MY_VAR    # 输出为空
pwd             # 目录没变
\`\`\`

\`\`\`text
使用场景：
source    需要让脚本影响当前环境（如配置环境变量）
直接执行  需要隔离执行（如运行应用）
\`\`\`

## 五、Shell 脚本基础

### 5.1 脚本结构

\`\`\`bash
#!/bin/bash
# 这是注释
echo "Hello World"
\`\`\`

\`\`\`text
脚本说明：
#!/bin/bash           shebang，指定解释器
#                     注释
echo "Hello World"    命令

常见 shebang：
#!/bin/bash           bash 脚本
#!/bin/sh             sh 脚本
#!/usr/bin/env python3  Python 脚本
#!/usr/bin/env node   Node.js 脚本
\`\`\`

### 5.2 变量

\`\`\`bash
#!/bin/bash
# 变量定义（等号两边不能有空格）
name="张三"
age=25
PI=3.14

# 使用变量
echo "姓名：$name"
echo "年龄：$age"
echo "圆周率：$PI"

# 变量名加花括号（推荐）
echo "\${name}今年\${age}岁"

# 命令替换
current_date=$(date +%Y-%m-%d)
files_count=$(ls | wc -l)
echo "今天是 $current_date"
echo "文件数：$files_count"

# 只读变量
readonly CONFIG_FILE="/etc/myapp.conf"
# CONFIG_FILE="new"  # 报错

# 删除变量
unset name

# 特殊变量
echo "脚本名：$0"
echo "第一个参数：$1"
echo "第二个参数：$2"
echo "参数个数：$#"
echo "所有参数：$@"
echo "所有参数（字符串）：$*"
echo "当前进程 PID：$$"
echo "上一命令退出码：$?"
\`\`\`

### 5.3 字符串

\`\`\`bash
#!/bin/bash
# 单引号（原样输出，不解析变量）
name="张三"
echo 'Hello $name'        # Hello $name

# 双引号（解析变量和命令）
echo "Hello $name"        # Hello 张三
echo "今天是 $(date)"     # 今天是 ...

# 字符串拼接
greeting="你好, "$name
greeting2="你好, \${name}"

# 字符串长度
str="Hello World"
echo \${#str}              # 11

# 子字符串
echo \${str:0:5}           # Hello
echo \${str:6}             # World

# 字符串替换
text="Hello World"
echo \${text/World/Python}   # Hello Python（替换第一个）
echo \${text//o/0}           # Hell0 W0rld（替换所有）

# 删除匹配
file="archive.tar.gz"
echo \${file%.gz}            # archive.tar（从后删除最短匹配）
echo \${file%%.*}            # archive（从后删除最长匹配）
echo \${file#*.}             # tar.gz（从前删除最短匹配）
echo \${file##*.}            # gz（从前删除最长匹配）
\`\`\`

### 5.4 条件判断

\`\`\`bash
#!/bin/bash
# if 语句
if [ $age -ge 18 ]; then
    echo "成年"
else
    echo "未成年"
fi

# 数值比较
# -eq 等于 -ne 不等于
# -gt 大于 -lt 小于
# -ge 大于等于 -le 小于等于

if [ $a -eq $b ]; then echo "相等"; fi
if [ $a -gt $b ]; then echo "a 大于 b"; fi

# 字符串比较
# = 相等 != 不相等
# -z 空 -n 非空

if [ "$str1" = "$str2" ]; then echo "相等"; fi
if [ -z "$str" ]; then echo "空字符串"; fi
if [ -n "$str" ]; then echo "非空"; fi

# 文件测试
# -f 文件存在 -d 目录存在
# -r 可读 -w 可写 -x 可执行
# -e 存在 -s 非空

if [ -f "/etc/passwd" ]; then echo "文件存在"; fi
if [ -d "/tmp" ]; then echo "目录存在"; fi
if [ -r "file.txt" ]; then echo "可读"; fi
if [ -x "script.sh" ]; then echo "可执行"; fi

# 多条件
if [ $a -gt 0 ] && [ $a -lt 100 ]; then echo "在范围内"; fi
if [ $a -lt 0 ] || [ $a -gt 100 ]; then echo "超出范围"; fi

# [[ ]] 支持 && 和 ||
if [[ $a -gt 0 && $a -lt 100 ]]; then echo "在范围内"; fi

# case 语句
case $1 in
    start)
        echo "启动服务"
        ;;
    stop)
        echo "停止服务"
        ;;
    restart)
        echo "重启服务"
        ;;
    *)
        echo "用法：$0 {start|stop|restart}"
        exit 1
        ;;
esac
\`\`\`

### 5.5 循环

\`\`\`bash
#!/bin/bash
# for 循环
for i in 1 2 3 4 5; do
    echo "数字：$i"
done

# 序列
for i in {1..10}; do
    echo $i
done

for i in {1..10..2}; do    # 步长 2
    echo $i
done

# C 风格 for
for ((i=0; i<10; i++)); do
    echo $i
done

# 遍历文件
for file in *.py; do
    echo "处理：$file"
done

# 遍历命令输出
for file in $(ls *.txt); do
    echo "$file"
done

# while 循环
count=0
while [ $count -lt 5 ]; do
    echo "count: $count"
    ((count++))
done

# 读取文件行
while read line; do
    echo "行：$line"
done < file.txt

# until 循环（条件为假时执行）
count=0
until [ $count -ge 5 ]; do
    echo $count
    ((count++))
done

# break 和 continue
for i in {1..10}; do
    if [ $i -eq 5 ]; then break; fi
    if [ $((i % 2)) -eq 0 ]; then continue; fi
    echo $i
done
\`\`\`

### 5.6 函数

\`\`\`bash
#!/bin/bash
# 定义函数
function greet() {
    echo "Hello, $1!"
}

# 或简写
greet() {
    echo "Hello, $1!"
}

# 调用
greet "张三"
greet "李四"

# 带返回值
add() {
    echo $(($1 + $2))
}
result=$(add 3 5)
echo "3 + 5 = $result"

# return 返回状态码
is_even() {
    if [ $(($1 % 2)) -eq 0 ]; then
        return 0    # true
    else
        return 1    # false
    fi
}

if is_even 4; then
    echo "偶数"
fi

# 局部变量
counter() {
    local count=0    # local 局部变量
    ((count++))
    echo $count
}
\`\`\`

## 六、Here Document 与 Here String

### 6.1 Here Document

\`\`\`bash
# << 标记多行输入
cat << EOF
第一行
第二行
第三行
EOF

# 写入文件
cat << EOF > config.yaml
server:
  port: 8080
  host: localhost
EOF

# 追加
cat << EOF >> config.yaml
database:
  url: postgres://localhost/mydb
EOF

# 不解析变量（用引号包裹标记）
cat << 'EOF' > script.sh
echo "今天是 $(date)"
echo "用户：$USER"
EOF
# 输出文件内容：$(date) 和 $USER 不会被解析

# 实战：创建 Python 文件
cat << 'EOF' > app.py
from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello World'
EOF

# 缩进（<<- 删除开头的 Tab）
cat <<- EOF
	缩进的内容
	更多内容
EOF
\`\`\`

### 6.2 Here String

\`\`\`bash
# <<< 单行输入
grep "error" <<< "this is an error message"

# 转换变量
echo "HELLO WORLD" | tr 'A-Z' 'a-z'
tr 'A-Z' 'a-z' <<< "HELLO WORLD"

# 用作命令输入
wc -w <<< "one two three four"
# 4

# 实战
var="apple,banana,cherry"
IFS=',' read -ra fruits <<< "$var"
for fruit in "\${fruits[@]}"; do
    echo "$fruit"
done
\`\`\`

## 七、命令替换

### 7.1 $() 与反引号

\`\`\`bash
# $() 命令替换（推荐）
current_date=$(date +%Y-%m-%d)
files=$(ls *.py)
user_count=$(wc -l < /etc/passwd)

# 反引号（旧语法，不推荐）
current_date=\`date +%Y-%m-%d\`
files=\`ls *.py\`

# $() 优势：
# 1. 支持嵌套
# 2. 可读性好
# 3. 不需要转义

# 嵌套示例
echo "当前目录文件数：$(ls $(pwd) | wc -l)"

# 实战
today=$(date +%Y%m%d)
backup_file="backup_\${today}.tar.gz"
tar -czf $backup_file myapp/
\`\`\`

### 7.2 算术运算

\`\`\`bash
# $(( )) 算术运算
a=10
b=3
echo $((a + b))    # 13
echo $((a - b))    # 7
echo $((a * b))    # 30
echo $((a / b))    # 3
echo $((a % b))    # 1
echo $((a ** b))   # 1000（幂）

# 自增自减
count=0
((count++))        # count=1
((count++))        # count=2
((count--))        # count=1

# 赋值
((total = 5 + 3))
echo $total        # 8

# let 命令
let x=5+3
let x++
\`\`\`

## 八、实战：Python 应用部署脚本

### 8.1 部署脚本

\`\`\`bash
#!/bin/bash
# deploy.sh - Python 应用部署脚本
# 用法：./deploy.sh [dev|staging|prod]

set -e    # 出错即退出

# ===== 配置 =====
APP_NAME="myapp"
APP_DIR="/opt/$APP_NAME"
VENV_DIR="$APP_DIR/venv"
SERVICE_NAME="$APP_NAME.service"
DEPLOY_USER="deploy"

# 环境配置
ENV=\${1:-production}
case $ENV in
    dev)
        BRANCH="develop"
        SERVERS=("dev.example.com")
        ;;
    staging)
        BRANCH="release"
        SERVERS=("staging.example.com")
        ;;
    prod|production)
        BRANCH="main"
        SERVERS=("prod1.example.com" "prod2.example.com")
        ;;
    *)
        echo "用法：$0 [dev|staging|prod]"
        exit 1
        ;;
esac

# ===== 函数定义 =====
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    log "ERROR: $1" >&2
    exit 1
}

check_command() {
    command -v "$1" > /dev/null 2>&1 || error "$1 未安装"
}

# ===== 检查依赖 =====
log "检查依赖..."
check_command git
check_command python3
check_command pip3

# ===== 部署流程 =====
deploy_to_server() {
    local server=$1
    log "开始部署到 $server (环境: $ENV, 分支: $BRANCH)"

    # 1. 同步代码
    log "同步代码到 $server..."
    rsync -avzP --delete \\
        --exclude='venv/' \\
        --exclude='__pycache__/' \\
        --exclude='*.pyc' \\
        --exclude='.git/' \\
        --exclude='logs/' \\
        --exclude='.env' \\
        ./ "$DEPLOY_USER@$server:$APP_DIR/"

    # 2. 远程执行
    log "在 $server 上执行部署命令..."
    ssh "$DEPLOY_USER@$server" << EOF
        set -e
        cd $APP_DIR

        # 激活虚拟环境
        source $VENV_DIR/bin/activate

        # 安装依赖
        pip install -r requirements.txt

        # 数据库迁移
        python manage.py migrate

        # 收集静态文件
        python manage.py collectstatic --noinput

        # 重启服务
        sudo systemctl restart $SERVICE_NAME

        # 健康检查
        sleep 3
        if curl -sf http://localhost:8000/health > /dev/null; then
            echo "部署成功：$server"
        else
            echo "部署失败：$server 健康检查未通过"
            exit 1
        fi
EOF

    log "$server 部署完成"
}

# ===== 主流程 =====
log "开始部署 $APP_NAME (环境: $ENV)"

# 检查当前分支
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "$BRANCH" ]; then
    log "切换到分支 $BRANCH"
    git checkout "$BRANCH"
    git pull origin "$BRANCH"
fi

# 部署到每台服务器
for server in "\${SERVERS[@]}"; do
    if deploy_to_server "$server"; then
        log "✓ $server 部署成功"
    else
        log "✗ $server 部署失败"
        exit 1
    fi
done

log "全部部署完成"
\`\`\`

### 8.2 数据库备份脚本

\`\`\`bash
#!/bin/bash
# backup_db.sh - PostgreSQL 数据库备份脚本

# 配置
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="myapp"
DB_USER="postgres"
BACKUP_DIR="/backup/db"
KEEP_DAYS=7
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/\${DB_NAME}_\${DATE}.sql.gz"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 备份
echo "[$(date)] 开始备份 $DB_NAME..."

PGPASSWORD=$DB_PASSWORD pg_dump \\
    -h "$DB_HOST" \\
    -p "$DB_PORT" \\
    -U "$DB_USER" \\
    "$DB_NAME" | gzip > "$BACKUP_FILE"

# 检查是否成功
if [ $? -eq 0 ]; then
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "[$(date)] 备份成功: $BACKUP_FILE ($SIZE)"
else
    echo "[$(date)] 备份失败!"
    exit 1
fi

# 清理旧备份
echo "[$(date)] 清理 $KEEP_DAYS 天前的备份..."
find "$BACKUP_DIR" -name "\${DB_NAME}_*.sql.gz" -mtime +$KEEP_DAYS -delete

# 统计
COUNT=$(find "$BACKUP_DIR" -name "\${DB_NAME}_*.sql.gz" | wc -l)
echo "[$(date)] 当前备份文件数: $COUNT"
\`\`\`

### 8.3 服务监控脚本

\`\`\`bash
#!/bin/bash
# monitor.sh - 服务监控脚本

SERVICES=("myapp" "nginx" "postgresql")
ALERT_EMAIL="admin@example.com"
LOG_FILE="/var/log/service_monitor.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_service() {
    local service=$1
    if systemctl is-active --quiet "$service"; then
        log "✓ $service 运行正常"
        return 0
    else
        log "✗ $service 已停止，尝试重启..."
        sudo systemctl restart "$service"
        sleep 3
        if systemctl is-active --quiet "$service"; then
            log "✓ $service 重启成功"
        else
            log "✗ $service 重启失败!"
            # 发送告警邮件
            echo "$service 在 $(date) 重启失败" | mail -s "服务告警" "$ALERT_EMAIL"
            return 1
        fi
    fi
}

check_disk() {
    local threshold=80
    local usage=$(df / | awk 'NR==2 {print int($5)}')
    if [ $usage -gt $threshold ]; then
        log "⚠ 磁盘使用率 \${usage}% 超过阈值 \${threshold}%"
    fi
}

check_memory() {
    local threshold=90
    local usage=$(free | awk '/Mem/ {printf "%.0f", $3/$2*100}')
    if [ $usage -gt $threshold ]; then
        log "⚠ 内存使用率 \${usage}% 超过阈值 \${threshold}%"
    fi
}

# 主检查
log "===== 开始监控检查 ====="
for svc in "\${SERVICES[@]}"; do
    check_service "$svc"
done
check_disk
check_memory
log "===== 监控检查完成 ====="
\`\`\`

### 8.4 配置定时执行

\`\`\`bash
# 添加到 crontab
crontab -e

# 每 5 分钟检查服务
*/5 * * * * /opt/scripts/monitor.sh

# 每天凌晨 3 点备份数据库
0 3 * * * /opt/scripts/backup_db.sh

# 部署（手动执行）
./deploy.sh prod
\`\`\`

## 九、本章小结

\`\`\`text
本章学习的核心内容：

环境变量：
- export     设置环境变量
- env/printenv 查看环境变量
- set        查看所有变量

配置文件：
- /etc/profile    系统级
- ~/.bashrc       用户级（非登录）
- ~/.bash_profile 用户级（登录）
- /etc/profile.d/ 系统级片段

PATH 变量：
- PATH 决定命令查找路径
- export PATH=$PATH:/new/path

脚本执行：
- source/.    当前 shell 执行
- ./script    子 shell 执行

Shell 脚本：
- 变量、字符串
- 条件判断 if/case
- 循环 for/while/until
- 函数定义与调用

高级特性：
- Here Document <<（多行输入）
- Here String <<<（单行输入）
- 命令替换 $()（推荐）
- 算术运算 $(())

通过 Shell 脚本可以自动化：
- 应用部署流程
- 数据库备份
- 服务监控告警
- 日志清理
- 批量操作

至此，Linux 常用命令章节全部学习完毕。掌握这些命令后，
你将能够熟练地在 Linux 服务器上部署、运维 Python 应用，
处理日常运维工作中的各种场景。
\`\`\`
`
  }
];
