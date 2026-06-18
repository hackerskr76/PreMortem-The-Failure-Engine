import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Failure Engine Database API",
    description="Backend microservice mapping past operational breakdowns to assess engineering vector risks.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.seed import FAILURE_DB

openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "mock-key"))

class FailureBase(BaseModel):
    title: str = Field(..., example="ZetaDrive: Autonomous Urban Last-Mile Delivery Drones")
    domain: str = Field(..., example="Tech")
    description: str = Field(..., example="An autonomous drone fleet designed to deliver small packages in high-density urban environments.")
    root_cause: str = Field(..., example="Lithium-ion battery efficiency dropped by 45% during winter temperatures.")
    lessons_learned: str = Field(..., example="Environmental limits must be simulated early.")
    time_cost_months: Optional[float] = Field(None, example=18.0)
    financial_cost_usd: Optional[float] = Field(None, example=2400000.00)
    tags: List[str] = Field(default=[], example=["Hardware", "Drones", "Battery"])

class FailureResponse(FailureBase):
    id: int

class ProjectProposal(BaseModel):
    description: str = Field(..., example="Building an electric courier delivery vehicle fleet mapping routes across cold environments.")

class RiskAssessmentResponse(BaseModel):
    proposed_project: str
    relevant_past_failures: List[FailureResponse]
    risk_summary: str

def search_failures(query: str, domain: Optional[str] = None) -> List[dict]:
    """
    Simulates a vector DB search. Performs metadata domain pairing and deep text matching.
    """
    results = FAILURE_DB
    
    if domain:
        results = [f for f in results if f.get("domain", "").lower() == domain.lower() or f.get("category", "").lower() == domain.lower()]
        
    if query:
        q = query.lower()
        matched = []
        for f in results:
            text_context = (
                f.get("title", "") + " " + 
                f.get("description", "") + " " + 
                f.get("root_cause", "") + " " + 
                f.get("lessons_learned", "")
            ).lower()
            
            tags_context = [t.lower() for t in f.get("tags", [])]
            
            if q in text_context or any(q in tag for tag in tags_context):
                matched.append(f)
        results = matched
        
    return results

@app.post("/failures", response_model=FailureResponse, status_code=201)
async def submit_failure(failure: FailureBase):
    """Log a brand new architecture breakdown event to the dataset."""
    new_id = len(FAILURE_DB) + 1
    new_item = failure.model_dump()
    new_item["id"] = new_id
    FAILURE_DB.append(new_item)
    return new_item

@app.get("/failures", response_model=List[FailureResponse])
async def get_failures(
    q: Optional[str] = Query(None, description="Search term scanning string descriptions, titles, or tag metrics"),
    domain: Optional[str] = Query(None, description="Filter records strictly by matching workspace domains (e.g. Tech, Biotechnology)")
):
    """Retrieve indexed historic breakages using filtering parameters."""
    return search_failures(query=q, domain=domain)

@app.post("/failures/assess-risk", response_model=RiskAssessmentResponse)
async def assess_project_risk(proposal: ProjectProposal):
    """
    Evaluates a system proposal against legacy breakdown records using an LLM pipeline.
    """
    
    matched_failures = search_failures(query=proposal.description)
    
    if not matched_failures:
        matched_failures = FAILURE_DB[:3]

    failures_context = ""
    for idx, failure in enumerate(matched_failures, 1):
        failures_context += f"\n[Past Failure #{idx}] {failure.get('title')} ({failure.get('domain', 'N/A')})\n"
        failures_context += f"• Overview: {failure.get('description')}\n"
        failures_context += f"• Root Cause: {failure.get('root_cause')}\n"
        failures_context += f"• Lessons Learned: {failure.get('lessons_learned')}\n"
        failures_context += f"• Sunk Cost: {failure.get('financial_cost_usd', 'Unknown')} USD\n"

    system_prompt = (
        "You are an expert Solutions Architect and Risk Management Officer. Review the upcoming project specification "
        "and compare it directly with the provided historical system failures. Draft a 'Risk Assessment Summary' "
        "detailing matching engineering vectors, systemic structural vulnerabilities, and immediate actionable steps "
        "needed to insulate the deployment. Rely on strict logical deduction."
    )

    user_prompt = f"NEW PROJECT SPECIFICATION:\n{proposal.description}\n\nHISTORICAL REFERENCE INCIDENTS:\n{failures_context}"

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.15
        )
        summary = response.choices[0].message.content
    except Exception as e:
        summary = f"AI compilation failed during extraction: {str(e)}"
    
    return RiskAssessmentResponse(
        proposed_project=proposal.description,
        relevant_past_failures=matched_failures,
        risk_summary=summary
    )