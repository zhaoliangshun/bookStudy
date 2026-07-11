# MySQL 安装脚本 - 日志输出到 d:\book\bookStudy\mysql-setup.log
$log = "d:\book\bookStudy\mysql-setup.log"
"=== MySQL 安装开始: $(Get-Date) ===" | Out-File $log -Encoding utf8

try {
    "=== 1. choco install mysql ===" | Out-File $log -Append -Encoding utf8
    $output = choco install mysql -y --no-progress 2>&1
    $output | Out-File $log -Append -Encoding utf8

    "=== 2. 刷新 PATH ===" | Out-File $log -Append -Encoding utf8
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")

    "=== 3. 检查服务 ===" | Out-File $log -Append -Encoding utf8
    $svc = Get-Service -Name "MySQL*" -ErrorAction SilentlyContinue
    if ($svc) {
        "服务: $($svc.Name) 状态: $($svc.Status)" | Out-File $log -Append -Encoding utf8
        if ($svc.Status -ne "Running") {
            Start-Service -Name $svc.Name -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 5
            "启动后状态: $((Get-Service -Name $svc.Name).Status)" | Out-File $log -Append -Encoding utf8
        }
    } else {
        "未找到 MySQL 服务" | Out-File $log -Append -Encoding utf8
        "所有服务:" | Out-File $log -Append -Encoding utf8
        (Get-Service | Where-Object { $_.DisplayName -like "*sql*" -or $_.DisplayName -like "*MySQL*" }) | Out-File $log -Append -Encoding utf8
    }

    "=== 4. 查找 mysql.exe ===" | Out-File $log -Append -Encoding utf8
    $mysqlExe = Get-ChildItem "C:\Program Files\MySQL" -Recurse -Filter "mysql.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $mysqlExe) {
        $mysqlExe = Get-ChildItem "C:\ProgramData\MySQL" -Recurse -Filter "mysql.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
    }
    if ($mysqlExe) {
        "mysql.exe: $($mysqlExe.FullName)" | Out-File $log -Append -Encoding utf8

        "=== 5. 设置 root 密码 ===" | Out-File $log -Append -Encoding utf8
        # 尝试用 init 文件方式设置密码
        $initFile = "C:\Windows\Temp\mysql-init.sql"
        "ALTER USER 'root'@'localhost' IDENTIFIED BY '123456';" | Out-File $initFile -Encoding ascii
        "FLUSH PRIVILEGES;" | Out-File $initFile -Append -Encoding ascii

        $mysqldExe = Get-ChildItem "C:\Program Files\MySQL" -Recurse -Filter "mysqld.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
        "mysqld.exe: $($mysqldExe.FullName)" | Out-File $log -Append -Encoding utf8

        # 停止服务
        if ($svc) {
            Stop-Service -Name $svc.Name -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 3
        }

        # 用 --init-file 启动
        "用 --init-file 启动 mysqld..." | Out-File $log -Append -Encoding utf8
        $proc = Start-Process -FilePath $mysqldExe.FullName -ArgumentList "--init-file=$initFile","--console" -PassThru -WindowStyle Hidden
        Start-Sleep -Seconds 15

        # 测试登录
        "=== 6. 测试 root/123456 登录 ===" | Out-File $log -Append -Encoding utf8
        $test = & $mysqlExe.FullName -u root -p123456 -e "SELECT VERSION();" 2>&1
        "登录测试: $test" | Out-File $log -Append -Encoding utf8

        # 停止临时进程
        if ($proc -and -not $proc.HasExited) {
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 3
        }

        # 启动正式服务
        if ($svc) {
            Start-Service -Name $svc.Name -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 5
            "服务最终状态: $((Get-Service -Name $svc.Name).Status)" | Out-File $log -Append -Encoding utf8
        }

        # 最终测试
        "=== 7. 最终验证 ===" | Out-File $log -Append -Encoding utf8
        $final = & $mysqlExe.FullName -u root -p123456 -e "SELECT VERSION(); SELECT 'OK' AS status;" 2>&1
        "最终验证: $final" | Out-File $log -Append -Encoding utf8

        # 清理 init 文件
        Remove-Item $initFile -ErrorAction SilentlyContinue
    } else {
        "未找到 mysql.exe!" | Out-File $log -Append -Encoding utf8
        "搜索 C:\Program Files:" | Out-File $log -Append -Encoding utf8
        (Get-ChildItem "C:\Program Files" -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "*mysql*" -or $_.Name -like "*MySQL*" }) | Out-File $log -Append -Encoding utf8
    }
}
catch {
    "错误: $_" | Out-File $log -Append -Encoding utf8
}
"=== 完成: $(Get-Date) ===" | Out-File $log -Append -Encoding utf8
