# backend/llm_client.py

import os
import logging
from groq import Groq
from backend.config import settings
from backend.utils import safe_parse_json

logger = logging.getLogger(__name__)

client = Groq(api_key=settings.GROQ_API_KEY)


def call_llm(system_prompt: str, user_prompt: str) -> str:
    logger.info(f"Calling Groq model={settings.GROQ_MODEL}")

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=settings.TEMPERATURE,
    )

    text = response.choices[0].message.content
    return text


def call_llm_for_json(system_prompt: str, user_prompt: str):
    raw = call_llm(system_prompt, user_prompt)
    parsed = safe_parse_json(raw)

    if parsed is None:
        logger.error(f"JSON parse failed: {raw[:300]}")

    return parsed


def call_llm_for_text(system_prompt: str, user_prompt: str):
    return call_llm(system_prompt, user_prompt)