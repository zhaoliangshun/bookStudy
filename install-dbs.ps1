# 安装 MongoDB、Redis、PostgreSQL
$log = "d:\book\bookStudy\db-install.log"
"=== 数据库安装开始: $(Get-Date) ===" | Out-File $log -Encoding utf8

# 刷新 PATH
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")

# ============ 1. MongoDB ============
"=== 1. 安装 MongoDB ===" | Out-File $log -Append -Encoding utf8
try {
    choco install mongodb -y --no-progress 2>&1 | Out-File $log -Append -Encoding utf8
    # 创建数据目录（MongoDB 需要）
    if (-not (Test-Path "C:\data\db")) {
        New-Item -Path "C:\data\db" -ItemType Directory -Force | Out-Null
    }
    # 启动服务
    $svc = Get-Service -Name "MongoDB*" -ErrorAction SilentlyContinue
    if ($svc) {
        if ($svc.Status -ne "Running") {
            Start-Service -Name $svc.Name -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 5
        }
        "MongoDB 服务: $($svc.Name) 状态: $((Get-Service -Name $svc.Name).Status)" | Out-File $log -Append -Encoding utf8
    } else {
        "MongoDB 服务未找到" | Out-File $log -Append -Encoding utf8
    }
} catch {
    "MongoDB 安装错误: $_" | Out-File $log -Append -Encoding utf8
}

# ============ 2. Redis ============
"=== 2. 安装 Redis ===" | Out-File $log -Append -Encoding utf8
try {
    choco install redis-64 -y --no-progress 2>&1 | Out-File $log -Append -Encoding utf8
    # redis-64 不自动创建服务，手动创建
    $redisExe = "C:\ProgramData\chocolatey\lib\redis-64\tools\redis-server.exe"
    if (-not (Test-Path $redisExe)) {
        $redisExe = Get-ChildItem "C:\Program Files\Redis" -Recurse -Filter "redis-server.exe" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
    }
    if (-not $redisExe) {
        $redisExe = Get-ChildItem "C:\tools" -Recurse -Filter "redis-server.exe" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
    }
    "Redis exe: $redisExe" | Out-File $log -Append -Encoding utf8

    $redisSvc = Get-Service -Name "Redis*" -ErrorAction SilentlyContinue
    if (-not $redisSvc -and $redisExe -and (Test-Path $redisExe)) {
        # 创建 Redis 服务
        $redisDir = Split-Path $redisExe
        # 生成基础配置
        $conf = "$redisDir\redis.windows-service.conf"
        if (-not (Test-Path $conf)) {
            $conf = "$redisDir\redis.conf"
        }
        if (Test-Path $conf) {
            sc.exe create Redis binPath= "`"$redisExe`" --service `"$conf`"" start= auto | Out-File $log -Append -Encoding utf8
            sc.exe description Redis "Redis In-Memory Data Store" | Out-Null
            Start-Service -Name "Redis" -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 3
        }
        $redisSvc = Get-Service -Name "Redis*" -ErrorAction SilentlyContinue
    }
    if ($redisSvc) {
        if ($redisSvc.Status -ne "Running") {
            Start-Service -Name $redisSvc.Name -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 3
        }
        "Redis 服务: $($redisSvc.Name) 状态: $((Get-Service -Name $redisSvc.Name).Status)" | Out-File $log -Append -Encoding utf8
    } else {
        "Redis 服务未创建，exe 路径: $redisExe" | Out-File $log -Append -Encoding utf8
    }
} catch {
    "Redis 安装错误: $_" | Out-File $log -Append -Encoding utf8
}

# ============ 3. PostgreSQL ============
"=== 3. 安装 PostgreSQL ===" | Out-File $log -Append -Encoding utf8
try {
    # 设置 postgres 密码
    choco install postgresql17 --params "'/Password:123456'" -y --no-progress 2>&1 | Out-File $log -Append -Encoding utf8
    $pgSvc = Get-Service -Name "postgres*" -ErrorAction SilentlyContinue
    if ($pgSvc) {
        if ($pgSvc.Status -ne "Running") {
            Start-Service -Name $pgSvc.Name -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 5
        }
        "PostgreSQL 服务: $($pgSvc.Name) 状态: $((Get-Service -Name $pgSvc.Name).Status)" | Out-File $log -Append -Encoding utf8
    } else {
        "PostgreSQL 服务未找到" | Out-File $log -Append -Encoding utf8
    }
} catch {
    "PostgreSQL 安装错误: $_" | Out-File $log -Append -Encoding utf8
}

# ============ 最终状态 ============
"=== 最终服务状态 ===" | Out-File $log -Append -Encoding utf8
Get-Service | Where-Object { $_.Name -match "mysql|mongo|redis|postgres" } | Format-Table Name, Status, StartType -AutoSize | Out-File $log -Append -Encoding utf8 -Width 200

"=== 完成: $(Get-Date) ===" | Out-File $log -Append -Encoding utf8
