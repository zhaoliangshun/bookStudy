"""
============================================================
 配置模块 —— 集中管理所有可配置项
------------------------------------------------------------

【为什么单独抽一个 config 模块】
    把配置跟代码分离，有几个好处：
    1. 改配置不用动业务代码
    2. 不同环境（开发/测试/生产）用不同配置，只改 .env 不改代码
    3. 测试时可以覆盖配置，不用 mock 全局变量

【配置从哪里来】
    优先级（从高到低）：
    1. 系统环境变量（生产部署用）
    2. .env 文件（本地开发用，python-dotenv 自动加载）
    3. 代码里的默认值（兜底）

【Pydantic Settings】
    用 Pydantic v2 的 BaseSettings 自动做类型转换和校验：
    - 读到的字符串自动转 int / list
    - 字段缺失给默认值
    - 类型不对会抛错，启动就暴露问题
"""
from functools import lru_cache

# Pydantic v2 的配置基类（pip install pydantic-settings）
# 如果没装 pydantic-settings，可以用 pydantic.BaseSettings（v1 风格）
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """全局配置。所有字段都从环境变量或 .env 读取。"""

    # ----- 模型配置 -----
    # env_file：指定 .env 文件路径
    # extra='ignore'：.env 里多余的字段忽略，不报错
    # case_sensitive=False：环境变量名不区分大小写
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # ---------- 数据库 ----------
    # MySQL 连接字符串。默认指向本地 blog_platform 库
    # 格式：mysql+pymysql://用户:密码@主机:端口/库?charset=utf8mb4
    DATABASE_URL: str = (
        "mysql+pymysql://root:123456@127.0.0.1:3306/blog_platform?charset=utf8mb4"
    )

    # ---------- JWT ----------
    # 签名密钥：默认值仅供开发用，生产必须改
    JWT_SECRET: str = "dev-only-secret-please-change-in-production-32chars"
    # 签名算法：HS256 是对称加密，足够快
    JWT_ALGORITHM: str = "HS256"
    # Token 有效期（分钟），默认 12 小时
    JWT_EXPIRE_MINUTES: int = 720

    # ---------- CORS ----------
    # 允许的前端来源，逗号分隔。代码里会拆成 list
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        """把逗号分隔的字符串拆成列表，方便 CORSMiddleware 使用。"""
        # strip 去掉前后空白，过滤掉空字符串
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


# -------------------------------------------------------------
# 用 lru_cache 缓存 Settings 实例
# -------------------------------------------------------------
# 【为什么加这个装饰器】
#   Settings() 每次实例化都要读 .env、做校验，有点开销。
#   加 @lru_cache 后，整个进程只有第一次调用真的创建，
#   后续 get_settings() 返回同一个实例，省时省内存。
#   测试时可以用 get_settings.cache_clear() 重置。
@lru_cache
def get_settings() -> Settings:
    """返回全局唯一的 Settings 实例。"""
    return Settings()
