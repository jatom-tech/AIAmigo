from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()
stored_prompts = []

class PromptInput(BaseModel):
    prompt: str

def calculate_aiamigo_score():
    total_prompts = len(stored_prompts)
    risky_prompts = 0  # Midlertidigt, da vi ikke risikovurderer endnu

    if total_prompts == 0:
        return 100

    score = max(0, 100 - int((risky_prompts / total_prompts) * 100))
    return score

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