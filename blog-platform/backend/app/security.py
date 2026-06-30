"""
============================================================
 安全模块 —— 密码哈希 + JWT 生成/验证
------------------------------------------------------------

【为什么密码不能明文存数据库】
    1. 数据库泄露 → 所有用户密码暴露
    2. 内部员工（DBA）能看到
    3. 用户习惯复用密码，一处泄露多处遭殃
    所以必须哈希存储。哈希不可逆，即使拿到哈希也算不出原密码。

【为什么用 bcrypt 而不是 MD5/SHA256】
    MD5/SHA256 是「通用哈希」，速度太快 → 暴力破解容易。
    bcrypt 是「密码哈希」，刻意做得慢 + 自带 salt + 可调成本因子，
    专门为对抗暴力破解设计。一秒钟只能算几十次，
    而通用哈希一秒能算几百万次。

【JWT 是什么】
    JSON Web Token：服务端签名的、自包含的 token。
    - 自包含：token 内部就携带用户信息（如 user_id），不用每次查库
    - 签名：用 JWT_SECRET 签名，伪造不了，验证得了
    - 有过期时间：泄露了也只用一阵子

    登录流程：
        客户端 → POST /auth/login {用户名, 密码}
        服务端 → 校验密码 → 生成 JWT 返回
        客户端 → 把 JWT 存 localStorage → 之后每次请求放 Authorization 头
        服务端 → 验证 JWT → 取出 user_id → 知道是谁在请求
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

import bcrypt
from jose import jwt, JWTError

from app.config import get_settings

settings = get_settings()


# =============================================================
# 密码哈希
# =============================================================
def hash_password(plain_password: str) -> str:
    """把明文密码哈希成可存储的字符串。

    【过程】
        1. 明文编码成 bytes（bcrypt 接受 bytes 不接受 str）
        2. bcrypt.gensalt() 生成随机 salt（每次都不一样）
        3. bcrypt.hashpw() 把明文 + salt 算成哈希
        4. 解码回 str 存数据库

    【返回值格式】
        形如 '$2b$12$....' 的 60 字符字符串
        - $2b$ 算法版本
        - 12 是成本因子（2^12 次迭代）
        - 后面 22 字符是 salt，31 字符是哈希结果
        验证时把整个字符串当 salt 传给 checkpw 即可。
    """
    # 编码成 utf-8 bytes
    password_bytes = plain_password.encode("utf-8")
    # 生成 salt（成本因子默认 12，足够安全，再高会太慢）
    salt = bcrypt.gensalt(rounds=12)
    # 哈希
    hashed = bcrypt.hashpw(password_bytes, salt)
    # 解码回 str 存数据库
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """校验明文密码是否匹配哈希。

    【关键点】
        bcrypt.checkpw 内部会从 hashed_password 里解析出 salt，
        用同样的 salt 算一遍明文的哈希，再比对两个哈希是否相等。
        所以即使每个用户的 salt 不同，校验时也能正常工作。
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except (ValueError, TypeError):
        # hashed_password 格式不对、或明文不是 str 等
        return False


# =============================================================
# JWT
# =============================================================
def create_access_token(subject: str | int, extra_data: dict | None = None) -> str:
    """生成 JWT access token。

    参数：
        subject：token 的主体，通常是 user_id（字符串化）
        extra_data：要放进 payload 的额外字段（如 username、is_admin）

    返回：
        编码后的 JWT 字符串，前端拿到后存 localStorage
    """
    # 计算过期时间 = 当前时间 + 有效期
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)

    # payload：JWT 的「内容部分」，编码后是 token 的中间段
    payload = {
        # sub：标准字段，token 主体（subject）
        "sub": str(subject),
        # exp：标准字段，过期时间（Unix 时间戳）
        "exp": expire,
        # iat：标准字段，签发时间
        "iat": datetime.now(timezone.utc),
    }
    if extra_data:
        payload.update(extra_data)

    # 用密钥 + 算法签名生成最终 token
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    """解码并验证 JWT。

    返回：
        验证成功 → payload 字典（含 sub, exp 等）
        验证失败（签名错/过期/格式错）→ None
    """
    try:
        return jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except JWTError:
        # 签名不对、过期、格式错误都进这里
        return None
