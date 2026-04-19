# backend/prompts.py

import json
from backend.utils import truncate_for_context

def get_cleaning_prompt(raw_transcript: str) -> tuple[str, str]:
    system = """You are a transcript cleaning specialist. Your job is to clean and normalize
meeting transcripts for downstream analysis. Do NOT summarize or change meaning.
Only clean formatting and remove noise."""

    user = f"""Clean the following raw meeting transcript. Apply these rules:
1. Remove filler words: "um", "uh", "you know", "like" (when used as filler), "basically"
2. Fix inconsistent speaker names (e.g., "Jon", "John", "J:" → use the most complete form)
3. Remove timestamps if present (e.g., [00:04:32])
4. Fix obvious transcription errors
5. Preserve ALL content, decisions, and named items exactly
6. Keep speaker labels in format: "SpeakerName: dialogue"

Return ONLY the cleaned transcript as plain text. No commentary.

RAW TRANSCRIPT:
{raw_transcript}"""

    return system, user


def get_problem_goal_prompt(cleaned_transcript: str) -> tuple[str, str]:
    system = """You are a senior product analyst and business strategist. You extract structured
decision intelligence from meeting transcripts. Always respond with valid JSON only.
No markdown, no commentary, no code fences."""

    user = f"""Analyze the following meeting transcript and extract:

1. problem_statement: A precise 2-3 sentence description of the core problem.
   - Be specific, not generic
   - Include the impact of the problem
   - Use neutral, factual language

2. business_goals: Goals the business wants to achieve by solving this problem.
   - Include both stated goals and goals that are clearly implied

Respond ONLY with this JSON structure:
{{
  "problem_statement": "string",
  "business_goals": [
    {{
      "goal": "string",
      "type": "explicit or implicit",
      "priority": "high or medium or low"
    }}
  ]
}}

TRANSCRIPT:
{cleaned_transcript}"""

    return system, user


def get_requirements_prompt(cleaned_transcript: str) -> tuple[str, str]:
    system = """You are a senior business analyst and requirements engineer. You specialize in
extracting both stated and unstated requirements from conversations. Always respond
with valid JSON only. No markdown, no commentary, no code fences."""

    user = f"""From the following meeting transcript, extract all requirements.

DEFINITIONS:
- Explicit requirement: Clearly and directly stated by a participant
- Implicit requirement: Logically implied by context, industry standards, or stated goals

For each requirement assign:
- category: functional | non-functional | business | technical | compliance
- priority: must-have | should-have | nice-to-have
- source (explicit only): quote or paraphrase that justifies it
- rationale (implicit only): why this is implied

Respond ONLY with this JSON structure:
{{
  "explicit_requirements": [
    {{
      "id": "REQ-E-001",
      "description": "string",
      "category": "string",
      "priority": "string",
      "source": "string"
    }}
  ],
  "implicit_requirements": [
    {{
      "id": "REQ-I-001",
      "description": "string",
      "category": "string",
      "priority": "string",
      "rationale": "string"
    }}
  ]
}}

TRANSCRIPT:
{cleaned_transcript}"""

    return system, user


def get_ambiguity_risk_prompt(cleaned_transcript: str) -> tuple[str, str]:
    system = """You are a risk analyst and quality assurance expert. You identify gaps,
ambiguities, and risks in business discussions. Always respond with valid JSON only."""

    user = f"""Analyze the following meeting transcript for ambiguities, missing information,
and risks.

Respond ONLY with this JSON structure:
{{
  "ambiguities": [
    {{
      "id": "AMB-001",
      "description": "string",
      "clarification_needed": "string"
    }}
  ],
  "missing_information": [
    {{
      "topic": "string",
      "why_it_matters": "string"
    }}
  ],
  "risks": [
    {{
      "id": "RISK-001",
      "description": "string",
      "risk_type": "technical or business or resource or timeline or compliance",
      "severity": "critical or high or medium or low",
      "likelihood": "high or medium or low",
      "mitigation": "string"
    }}
  ]
}}

TRANSCRIPT:
{cleaned_transcript}"""

    return system, user


def get_root_cause_prompt(
    cleaned_transcript: str,
    problem_statement: str
) -> tuple[str, str]:
    system = """You are a systems thinking expert and root cause analyst. You apply structured
analytical frameworks to identify why problems exist at their deepest level.
Always respond with valid JSON only."""

    user = f"""Using the problem statement and transcript below, perform a root cause analysis.

Apply the "5 Whys" methodology — ask "why does this happen?" at each level
until you reach a root cause (a systemic issue that can be changed).

Respond ONLY with this JSON structure:
{{
  "surface_problem": "string",
  "why_chain": [
    {{ "level": 1, "why": "string", "because": "string" }},
    {{ "level": 2, "why": "string", "because": "string" }},
    {{ "level": 3, "why": "string", "because": "string" }}
  ],
  "root_cause": "string",
  "contributing_factors": ["string"],
  "systemic_issues": ["string"]
}}

PROBLEM STATEMENT:
{problem_statement}

TRANSCRIPT:
{truncate_for_context(cleaned_transcript)}"""

    return system, user


def get_action_items_prompt(
    cleaned_transcript: str,
    requirements: dict
) -> tuple[str, str]:
    system = """You are a technical project manager. You convert meeting discussions into precise,
actionable tasks assigned to appropriate teams. Always respond with valid JSON only."""

    req_context = truncate_for_context(json.dumps(requirements), max_chars=1500)

    user = f"""From the following meeting transcript, extract all action items.

Rules:
- Each task must be specific and completable (not vague like "look into X")
- Teams: Engineering, Product, Design, QA, DevOps, Management, Data, Legal, Other
- effort: small (<1 day), medium (1-3 days), large (>3 days)
- Set deadline only if explicitly mentioned; otherwise "Not specified"
- priority: P0-critical | P1-high | P2-medium | P3-low

Respond ONLY with this JSON structure:
{{
  "action_items": [
    {{
      "id": "TASK-001",
      "title": "string",
      "description": "string",
      "team": "string",
      "owner": "string",
      "priority": "string",
      "effort": "string",
      "deadline": "string",
      "depends_on": []
    }}
  ],
  "summary_by_team": {{
    "Engineering": 2,
    "Product": 1
  }}
}}

TRANSCRIPT:
{cleaned_transcript}

REQUIREMENTS CONTEXT:
{req_context}"""

    return system, user


def get_solutions_prompt(
    cleaned_transcript: str,
    problem_statement: str,
    risks: list,
    action_items: dict
) -> tuple[str, str]:
    system = """You are a senior solutions architect and engineering lead. You propose concrete,
practical solutions to business and technical problems. Always respond with valid JSON only."""

    risks_ctx   = truncate_for_context(json.dumps(risks),         max_chars=1000)
    actions_ctx = truncate_for_context(json.dumps(action_items),  max_chars=1000)

    user = f"""Based on the full analysis below, suggest 2-3 solutions to the core problem.

For each solution:
- approach_type: quick-win | long-term | hybrid
- complexity and impact: low | medium | high

Also provide overall_recommendation (which solution to do first and why).

meeting_intent options: planning | review | escalation | brainstorming | decision | status-update

Respond ONLY with this JSON structure:
{{
  "solutions": [
    {{
      "id": "SOL-001",
      "title": "string",
      "description": "string",
      "approach_type": "string",
      "pros": ["string"],
      "cons": ["string"],
      "tech_stack": ["string"],
      "complexity": "string",
      "impact": "string"
    }}
  ],
  "overall_recommendation": {{
    "recommended_solution_id": "SOL-001",
    "reasoning": "string",
    "first_steps": ["string"]
  }},
  "meeting_intent": "string"
}}

PROBLEM STATEMENT:
{problem_statement}

RISKS:
{risks_ctx}

ACTION ITEMS SUMMARY:
{actions_ctx}

TRANSCRIPT:
{truncate_for_context(cleaned_transcript)}"""

    return system, user