import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from openai import OpenAI
from groq import Groq  # Official Groq client interface
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="PreMortem Risk Engine API",
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

# Multi-Provider Cluster Initialization
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "mock-key"))
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY", "mock-key"))

# OpenRouter targets alternative base endpoints using OpenAI standard specifications
openrouter_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY", "mock-key")
)

class FailureBase(BaseModel):
    title: str = Field(..., example="ZetaDrive: Autonomous Urban Last-Mile Delivery Drones")
    domain: Optional[str] = Field(None, example="Tech")
    description: str = Field(..., example="An autonomous drone fleet designed to deliver small packages in high-density urban environments.")
    root_cause: Optional[str] = Field(None, example="Lithium-ion battery efficiency dropped by 45% during winter temperatures.")
    lessons_learned: Optional[str] = Field(None, example="Environmental limits must be simulated early.")
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

def search_failures(query: Optional[str] = None, domain: Optional[str] = None) -> List[dict]:
    """
    Safely searches through seed data handling structural variances, alternative 
    keys (category/industry), and avoiding missing parameter errors.
    """
    results = []
    
    # Pre-process database records to guarantee everyone has an 'id' and valid fallback fields
    for idx, f in enumerate(FAILURE_DB, start=1):
        item = dict(f)
        if "id" not in item:
            item["id"] = idx
            
        # Unify alternative dataset domain keys mapping down to target schema expectations
        if "domain" not in item:
            item["domain"] = item.get("category", item.get("industry", "General"))
            
        if "lessons_learned" not in item:
            item["lessons_learned"] = item.get("lessons", "No mitigation specified.")
            
        if "root_cause" not in item:
            item["root_cause"] = "Unspecified structural degradation."
            
        if "financial_cost_usd" not in item:
            item["financial_cost_usd"] = item.get("estimated_loss_usd", 0.0)
            
        results.append(item)

    # 1. Filter by Domain safely matching alternate dataset metadata fields
    if domain and domain.strip() and domain != "All domains":
        target_domain = domain.strip().lower().replace(" ", "").replace("/", "")
        matched_by_domain = []
        for f in results:
            val_domain = str(f.get("domain", "")).lower().replace(" ", "").replace("/", "")
            val_category = str(f.get("category", "")).lower().replace(" ", "").replace("/", "")
            val_industry = str(f.get("industry", "")).lower().replace(" ", "").replace("/", "")
            
            if target_domain in val_domain or target_domain in val_category or target_domain in val_industry:
                matched_by_domain.append(f)
        results = matched_by_domain
        
    # 2. Safe descriptive keyword text block index scan
    if query and query.strip():
        q = query.strip().lower()
        matched = []
        for f in results:
            text_context = (
                str(f.get("title", "")) + " " + 
                str(f.get("description", "")) + " " + 
                str(f.get("root_cause", "")) + " " + 
                str(f.get("lessons_learned", "")) + " " +
                str(f.get("domain", "")) + " " +
                str(f.get("category", ""))
            ).lower()
            
            tags_list = f.get("tags", [])
            tags_context = [str(t).lower() for t in tags_list] if isinstance(tags_list, list) else []
            
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
    
    if not new_item.get("domain"):
        new_item["domain"] = "General"
        
    FAILURE_DB.append(new_item)
    return new_item

@app.get("/failures", response_model=List[FailureResponse])
async def get_failures(
    q: Optional[str] = Query(None, description="Search term scanning string descriptions, titles, or tag metrics"),
    domain: Optional[str] = Query(None, description="Filter records strictly by matching workspace domains")
):
    """Retrieve indexed historic breakages using filtering parameters."""
    return search_failures(query=q, domain=domain)

@app.post("/failures/assess-risk", response_model=RiskAssessmentResponse)
async def assess_project_risk(proposal: ProjectProposal):
    """
    Evaluates a system proposal against legacy breakdown records using a multi-provider LLM pipeline chain.
    """
    matched_failures = search_failures(query=proposal.description)
    
    # Fallback lookup reads sanitized data dictionary format to prevent validation error drops
    if not matched_failures:
        all_sanitized_cases = search_failures(query=None, domain=None)
        matched_failures = all_sanitized_cases[:3] if all_sanitized_cases else []

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
    summary = None

    # ---- LAYER 1: OPENAI PROMPT ENGINE ----
    if summary is None and openai_client.api_key != "mock-key":
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
            print("✅ Success: Assessment compiled via OpenAI Layer.")
        except Exception as e:
            print(f"⚠️ OpenAI Pipe dropped: {e}")

    # ---- LAYER 2: GROQ PROMPT ENGINE (Llama 3 Fallback) ----
    if summary is None and groq_client.api_key != "mock-key":
        try:
            response = groq_client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.15
            )
            summary = response.choices[0].message.content
            print("✅ Success: Assessment compiled via Groq Llama Layer.")
        except Exception as e:
            print(f"⚠️ Groq Pipe dropped: {e}")

    # ---- LAYER 3: OPENROUTER PROMPT ENGINE (DeepSeek Fallback) ----
    if summary is None and openrouter_client.api_key != "mock-key":
        try:
            response = openrouter_client.chat.completions.create(
                model="deepseek/deepseek-chat",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.15
            )
            summary = response.choices[0].message.content
            print("✅ Success: Assessment compiled via OpenRouter DeepSeek Layer.")
        except Exception as e:
            print(f"⚠️ OpenRouter Pipe dropped: {e}")

    # ---- LAYER 4: ZERO-DOWNTIME DETERMINISTIC LOCAL SHIELD ----
    if not summary:
        print("🚨 All network pipelines exhausted. Launching autonomous local engine core fallback router.")
        text = proposal.description.lower()
        primary_match = matched_failures[0] if matched_failures else {}
        
        if any(w in text for w in ["startup", "business", "store", "delivery", "app", "scale", "market"]):
            summary = (
                "⚠️ [LOCAL ENGINE AUTONOMOUS MODE]: AGGRESSIVE OPERATIONS & SCALING VECTOR DETECTED\n\n"
                "Your business and software deployment roadmap shares high systemic risks with rapid infrastructure scaling loops.\n\n"
                "📋 CRITICAL STRUCTURAL VULNERABILITIES:\n"
                "• Core Operational Weakness: Scaling unit logistics before validating baseline margins. Expanding your infrastructure footprint prematurely will cause cash burn to compound exponentially.\n"
                "• Growth Paradox: Chasing vanity metrics (user count, city expansion) while operating on sub-optimal unit economics acts as a cascade failure trigger.\n\n"
                "🛡️ IMMEDIATE ACTIONABLE MITIGATION BLUEPRINT:\n"
                "1. Freeze geographic or infrastructure expansions immediately. Prove solid, repeatable unit economics in a single micro-market first.\n"
                "2. Shift architecture KPIs from raw growth volume metrics to transactional retention value and margin sustainability parameters."
            )
        elif any(w in text for w in ["classifier", "ai", "ml", "model", "resume"]):
            summary = (
                "⚠️ [LOCAL ENGINE AUTONOMOUS MODE]: ALGORITHMIC BIAS & BIAS DRIFT VECTOR DETECTED\n\n"
                "Your predictive modeling architecture matches historical operational risks found in legacy training classifiers.\n\n"
                "📋 CRITICAL STRUCTURAL VULNERABILITIES:\n"
                "• Core Operational Weakness: Algorithmic amplification of historical patterns. The model risks mapping proxy variables that inadvertently replicate real-world data skew.\n"
                "• Systemic Risk Matrix: Training dataset parameters have insufficient programmatic validation for outlier exclusions or diversity constraints.\n\n"
                "🛡️ IMMEDIATE ACTIONABLE MITIGATION BLUEPRINT:\n"
                "1. Implement strict mathematical parity checks (such as Demographic Parity or Equalized Odds metrics) directly into your loss and optimization functions.\n"
                "2. Force continuous verification passes via synthetic adversarial profiles to audit model bias before exposing inference routes."
            )
        elif any(w in text for w in ["finance", "liquidity", "pool", "trade", "crypto"]):
            summary = (
                "⚠️ [LOCAL ENGINE AUTONOMOUS MODE]: FINANCIAL LIQUIDITY RISK VECTOR DETECTED\n\n"
                "Your transactional network layout shares systemic overlap paths with historical decentralized asset runs.\n\n"
                "📋 CRITICAL STRUCTURAL VULNERABILITIES:\n"
                "• Core Operational Weakness: High vulnerability to multi-vector oracle lag during systemic flash crashes.\n"
                "• Economic Blast Radius: Stale external price feeds can open immediate arbitrage windows that drain system collateral reserves automatically.\n\n"
                "🛡️ IMMEDIATE ACTIONABLE MITIGATION BLUEPRINT:\n"
                "1. Enforce a minimum of three independent distributed decentralized oracle streaming layers with median fallback thresholds.\n"
                "2. Integrate stateful circuit-breakers to instantly pause outbound state execution blocks if volatility crosses safety bands."
            )
        else:
            summary = (
                f"⚠️ [LOCAL ENGINE AUTONOMOUS MODE]: PHYSICAL ARCHITECTURE & ENVIRONMENTAL DEGRADATION SEEN\n\n"
                f"Based on historical telemetry metrics, your proposal shares an engineering vector profile overlapping with operational environmental limits.\n\n"
                f"📋 CRITICAL STRUCTURAL VULNERABILITIES:\n"
                f"• Core Operational Weakness: {primary_match.get('root_cause', 'Parameter variances under extreme scale.')}\n"
                f"• Sunk Capital Index: Baseline configurations faced historical write-downs of approximately ${primary_match.get('financial_cost_usd', 0):,.2f} USD.\n\n"
                f"🛡️ IMMEDIATE ACTIONABLE MITIGATION BLUEPRINT:\n"
                f"1. Mandatory physical simulation: {primary_match.get('lessons_learned', 'Simulate extreme runtime parameters early in staging cycles.')}\n"
                f"2. Run environmental stress analysis loops to insulate the bare metal controllers from micro-climate temperature spikes."
            )
    
    return RiskAssessmentResponse(
        proposed_project=proposal.description,
        relevant_past_failures=matched_failures,
        risk_summary=summary
    )