# backend/pipeline.py

import logging
from backend.llm_client import call_llm_for_text, call_llm_for_json
from backend.prompts import (
    get_cleaning_prompt,
    get_problem_goal_prompt,
    get_requirements_prompt,
    get_ambiguity_risk_prompt,
    get_root_cause_prompt,
    get_action_items_prompt,
    get_solutions_prompt,
)

logger = logging.getLogger(__name__)


def run_pipeline(raw_transcript: str) -> dict:
    """
    Runs all 7 pipeline steps in sequence.

    Each step's output is stored and passed as context to later steps.
    If a step fails, we store the error and continue with default/empty values
    so the rest of the pipeline can still complete.

    Returns a dict with all results merged, plus metadata.
    """

    errors = []            # collect any step failures
    steps_completed = 0    # track how many steps succeeded

    # ── STEP 1: Clean the transcript ──────────────────────────────────────────
    logger.info("Pipeline Step 1: Cleaning transcript")
    try:
        system, user = get_cleaning_prompt(raw_transcript)
        cleaned_transcript = call_llm_for_text(system, user)
        steps_completed += 1
        logger.info("Step 1 complete")
    except Exception as e:
        logger.error(f"Step 1 failed: {e}")
        errors.append(f"Step 1 (cleaning) failed: {str(e)}")
        # Fall back to raw transcript if cleaning fails
        cleaned_transcript = raw_transcript

    # ── STEP 2: Problem + Goals ────────────────────────────────────────────────
    logger.info("Pipeline Step 2: Extracting problem and goals")
    problem_statement = ""
    business_goals = []
    try:
        system, user = get_problem_goal_prompt(cleaned_transcript)
        result = call_llm_for_json(system, user)
        if result:
            problem_statement = result.get("problem_statement", "")
            business_goals    = result.get("business_goals", [])
            steps_completed  += 1
        else:
            raise ValueError("LLM returned empty or unparseable JSON")
    except Exception as e:
        logger.error(f"Step 2 failed: {e}")
        errors.append(f"Step 2 (problem/goals) failed: {str(e)}")

    # ── STEP 3: Requirements ──────────────────────────────────────────────────
    logger.info("Pipeline Step 3: Extracting requirements")
    requirements = {"explicit_requirements": [], "implicit_requirements": []}
    try:
        system, user = get_requirements_prompt(cleaned_transcript)
        result = call_llm_for_json(system, user)
        if result:
            requirements    = result
            steps_completed += 1
        else:
            raise ValueError("LLM returned empty or unparseable JSON")
    except Exception as e:
        logger.error(f"Step 3 failed: {e}")
        errors.append(f"Step 3 (requirements) failed: {str(e)}")

    # ── STEP 4: Ambiguities + Risks ───────────────────────────────────────────
    logger.info("Pipeline Step 4: Detecting ambiguities and risks")
    ambiguities      = []
    missing_info     = []
    risks            = []
    try:
        system, user = get_ambiguity_risk_prompt(cleaned_transcript)
        result = call_llm_for_json(system, user)
        if result:
            ambiguities     = result.get("ambiguities", [])
            missing_info    = result.get("missing_information", [])
            risks           = result.get("risks", [])
            steps_completed += 1
        else:
            raise ValueError("LLM returned empty or unparseable JSON")
    except Exception as e:
        logger.error(f"Step 4 failed: {e}")
        errors.append(f"Step 4 (ambiguities/risks) failed: {str(e)}")

    # ── STEP 5: Root Cause Analysis ───────────────────────────────────────────
    logger.info("Pipeline Step 5: Root cause analysis")
    root_cause_analysis = {
        "surface_problem": problem_statement,
        "why_chain": [],
        "root_cause": "",
        "contributing_factors": [],
        "systemic_issues": []
    }
    try:
        system, user = get_root_cause_prompt(cleaned_transcript, problem_statement)
        result = call_llm_for_json(system, user)
        if result:
            root_cause_analysis = result
            steps_completed    += 1
        else:
            raise ValueError("LLM returned empty or unparseable JSON")
    except Exception as e:
        logger.error(f"Step 5 failed: {e}")
        errors.append(f"Step 5 (root cause) failed: {str(e)}")

    # ── STEP 6: Action Items ──────────────────────────────────────────────────
    logger.info("Pipeline Step 6: Generating action items")
    action_items = {"action_items": [], "summary_by_team": {}}
    try:
        system, user = get_action_items_prompt(cleaned_transcript, requirements)
        result = call_llm_for_json(system, user)
        if result:
            action_items    = result
            steps_completed += 1
        else:
            raise ValueError("LLM returned empty or unparseable JSON")
    except Exception as e:
        logger.error(f"Step 6 failed: {e}")
        errors.append(f"Step 6 (action items) failed: {str(e)}")

    # ── STEP 7: Solutions ─────────────────────────────────────────────────────
    logger.info("Pipeline Step 7: Generating solutions")
    solutions = {
        "solutions": [],
        "overall_recommendation": {
            "recommended_solution_id": "",
            "reasoning": "",
            "first_steps": []
        },
        "meeting_intent": "planning"
    }
    try:
        system, user = get_solutions_prompt(
            cleaned_transcript,
            problem_statement,
            risks,
            action_items
        )
        result = call_llm_for_json(system, user)
        if result:
            solutions       = result
            steps_completed += 1
        else:
            raise ValueError("LLM returned empty or unparseable JSON")
    except Exception as e:
        logger.error(f"Step 7 failed: {e}")
        errors.append(f"Step 7 (solutions) failed: {str(e)}")

    # ── ASSEMBLE FINAL RESULT ─────────────────────────────────────────────────
    return {
        "cleaned_transcript":    cleaned_transcript,
        "problem_statement":     problem_statement,
        "business_goals":        business_goals,
        "requirements":          requirements,
        "ambiguities":           ambiguities,
        "missing_information":   missing_info,
        "risks":                 risks,
        "root_cause_analysis":   root_cause_analysis,
        "action_items":          action_items,
        "solutions":             solutions,
        "pipeline_steps_completed": steps_completed,
        "errors":                errors,
    }