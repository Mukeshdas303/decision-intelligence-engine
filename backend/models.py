# backend/models.py

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


# ─────────────────────────────────────────────
# REQUEST MODEL
# ─────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    """
    What the user sends to POST /analyze
    """
    transcript: str = Field(
        ...,                          # ... means required
        min_length=50,                # reject transcripts that are too short
        max_length=50000,             # prevent abuse with huge inputs
        description="The raw meeting transcript text"
    )
    meeting_title: Optional[str] = Field(
        default=None,
        description="Optional title to label the analysis"
    )
    meeting_date: Optional[str] = Field(
        default=None,
        description="Optional date in YYYY-MM-DD format"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "transcript": "John: We need to fix the checkout. Sara: Agreed, it's too slow.",
                "meeting_title": "Q3 Checkout Performance Review",
                "meeting_date": "2024-07-15"
            }
        }


# ─────────────────────────────────────────────
# RESPONSE SUB-MODELS (building blocks)
# ─────────────────────────────────────────────

class BusinessGoal(BaseModel):
    goal: str
    type: str           # "explicit" or "implicit"
    priority: str       # "high", "medium", "low"

class Requirement(BaseModel):
    id: str
    description: str
    category: str       # "functional", "non-functional", "business", "technical"
    priority: str       # "must-have", "should-have", "nice-to-have"
    source: Optional[str] = None      # for explicit requirements
    rationale: Optional[str] = None   # for implicit requirements

class Requirements(BaseModel):
    explicit_requirements: List[Requirement]
    implicit_requirements: List[Requirement]

class Ambiguity(BaseModel):
    id: str
    description: str
    clarification_needed: str

class MissingInfo(BaseModel):
    topic: str
    why_it_matters: str

class Risk(BaseModel):
    id: str
    description: str
    risk_type: str      # "technical", "business", "resource", "timeline", "compliance"
    severity: str       # "critical", "high", "medium", "low"
    likelihood: str     # "high", "medium", "low"
    mitigation: str

class WhyChainItem(BaseModel):
    level: int
    why: str
    because: str

class RootCauseAnalysis(BaseModel):
    surface_problem: str
    why_chain: List[WhyChainItem]
    root_cause: str
    contributing_factors: List[str]
    systemic_issues: List[str]

class ActionItem(BaseModel):
    id: str
    title: str
    description: str
    team: str
    owner: str
    priority: str       # "P0-critical", "P1-high", "P2-medium", "P3-low"
    effort: str         # "small", "medium", "large"
    deadline: str
    depends_on: List[str]

class ActionItems(BaseModel):
    action_items: List[ActionItem]
    summary_by_team: Dict[str, int]

class Solution(BaseModel):
    id: str
    title: str
    description: str
    approach_type: str  # "quick-win", "long-term", "hybrid"
    pros: List[str]
    cons: List[str]
    tech_stack: List[str]
    complexity: str     # "low", "medium", "high"
    impact: str         # "low", "medium", "high"

class OverallRecommendation(BaseModel):
    recommended_solution_id: str
    reasoning: str
    first_steps: List[str]

class Solutions(BaseModel):
    solutions: List[Solution]
    overall_recommendation: OverallRecommendation
    meeting_intent: str  # "planning", "review", "escalation", etc.


# ─────────────────────────────────────────────
# FINAL RESPONSE MODEL
# ─────────────────────────────────────────────

class AnalyzeResponse(BaseModel):
    """
    The complete structured output returned from POST /analyze
    """
    success: bool
    meeting_title: Optional[str]
    meeting_date: Optional[str]

    # Step 1 output
    cleaned_transcript: str

    # Step 2 output
    problem_statement: str
    business_goals: List[BusinessGoal]

    # Step 3 output
    requirements: Requirements

    # Step 4 output
    ambiguities: List[Ambiguity]
    missing_information: List[MissingInfo]
    risks: List[Risk]

    # Step 5 output
    root_cause_analysis: RootCauseAnalysis

    # Step 6 output
    action_items: ActionItems

    # Step 7 output
    solutions: Solutions

    # Metadata
    pipeline_steps_completed: int
    errors: List[str]   # any steps that failed gracefully