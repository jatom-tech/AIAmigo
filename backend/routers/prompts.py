from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()
stored_prompts = []

class PromptInput(BaseModel):
    prompt: str

def calculate_aiamigo_score():
    # Eksempelberegning baseret på antallet af prompts
    return len(stored_prompts) * 5

@router.post("")
def receive_prompt(data: PromptInput):
    stored_prompts.append(data.prompt)
    return {
        "message": "Prompt received",
        "total": len(stored_prompts),
        "AIAmigoScore": calculate_aiamigo_score()
    }

@router.get("")
def get_prompts():
    return {
        "prompts": stored_prompts,
        "AIAmigoScore": calculate_aiamigo_score()
    }

@router.get("/compliance-score")
def get_compliance_score():
    return {
        "complianceScore": calculate_aiamigo_score()
    }