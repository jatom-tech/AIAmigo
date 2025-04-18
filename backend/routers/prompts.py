from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()
stored_prompts = []  # <--- vigtig linje

class PromptInput(BaseModel):
    prompt: str

@router.post("")
def receive_prompt(data: PromptInput):
    stored_prompts.append(data.prompt)
    return {"message": "Prompt received", "total": len(stored_prompts)}

@router.get("")
def get_prompts():
    return {"prompts": stored_prompts}

