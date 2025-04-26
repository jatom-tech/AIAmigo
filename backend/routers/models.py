from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()
stored_models = []

class ModelInput(BaseModel):
    model: str

def calculate_aiamigo_score():
    # Eksempelberegning baseret på antallet af modeller
    return len(stored_models) * 10

@router.post("/")
def receive_model(data: ModelInput):
    stored_models.append(data.model)
    return {
        "message": "Model received",
        "total": len(stored_models),
        "AIAmigoScore": calculate_aiamigo_score()
    }

@router.get("/")
def get_models():
    return {
        "models": stored_models,
        "AIAmigoScore": calculate_aiamigo_score()
    }
