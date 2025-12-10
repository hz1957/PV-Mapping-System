"""
LLM 工厂

提供当前架构使用的默认 LLM 实例。
"""
import logging
import os
from typing import Any
from dotenv import load_dotenv
from langchain_community.chat_models import ChatOpenAI

# Load .env from backend directory (3 levels up)
backend_env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), '.env')
load_dotenv(backend_env_path)

logger = logging.getLogger(__name__)

_llm_instance: Any = None


def get_default_llm() -> Any:
    """获取或创建默认的 LLM 实例。

    该实现使用标准的LLM配置，保证行为一致。
    使用单例模式避免重复初始化。
    """
    global _llm_instance
    if _llm_instance is not None:
        return _llm_instance

    try:
        # 使用ChatOpenAI作为通用LLM接口
        api_key = os.getenv("LLM_API_KEY")
        base_url = os.getenv("LLM_BASE_URL")
        model = os.getenv("LLM_MODEL", "deepseek-chat")

        if not api_key:
            raise ValueError("LLM_API_KEY env var not found")
            
        _llm_instance = ChatOpenAI(
            model=model,
            base_url=base_url,
            api_key=api_key,
            temperature=0.2,
            max_retries=1,
            max_tokens=32000,
            model_kwargs={
                "response_format": {"type": "json_object"}
            },
        )
        logger.info("Default LLM instance initialized successfully")
        # Test the connection
        print("Testing LLM connection...")
        test_response = _llm_instance.invoke("Hello")
        print(f"LLM test response: {test_response}")
    except Exception as exc:
        logger.error(f"Failed to initialize default LLM instance: {exc}")
        print(f"LLM initialization error: {exc}")
        # 直接抛出异常，不使用MockLLM
        raise Exception(f"LLM初始化失败: {exc}")
    
    return _llm_instance
