# backend/utils.py

import json
import re
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)


def safe_parse_json(raw_text: str) -> Optional[dict]:
    """
    Safely parse JSON from LLM output.

    LLMs sometimes wrap JSON in markdown code fences like:
```json
        { "key": "value" }
```
    This function strips those fences before parsing.

    Returns the parsed dict, or None if parsing fails.
    """
    if not raw_text or not raw_text.strip():
        return None

    text = raw_text.strip()

    # Remove markdown code fences if present
    # Handles: ```json ... ``` or ``` ... ```
    text = re.sub(r'^```(?:json)?\s*', '', text)
    text = re.sub(r'\s*```$', '', text)
    text = text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        logger.warning(f"JSON parse failed: {e}. Raw text (first 200 chars): {text[:200]}")
        return None


def merge_pipeline_results(results: list[dict]) -> dict:
    """
    Merge outputs from all pipeline steps into a single flat dict.
    Used by the pipeline orchestrator before building the final response.
    """
    merged = {}
    for result in results:
        if result:
            merged.update(result)
    return merged


def truncate_for_context(text: str, max_chars: int = 3000) -> str:
    """
    Truncate a string to prevent exceeding LLM context window limits.
    Used when passing previous step outputs as context to later steps.
    """
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + "\n... [truncated for context]"