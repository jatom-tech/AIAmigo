from fastapi import FastAPI
from backend.routers import prompts, models  # Sørg for at importere dine routere korrekt

# Opret én samlet FastAPI-instans
app = FastAPI(title="AIAmigo Compliance API")

# Tilføj routere
app.include_router(prompts.router, prefix="/prompts")
app.include_router(models.router, prefix="/models")

@app.get("/")
def root():
    """
    Root endpoint, der viser en besked om, at API'et kører.
    """
    return {"message": "AIAmigo Compliance API is running"}

@app.get("/prompts/compliance-score")
def get_compliance_score(total: int = 0, risky: int = 0):
    """
    Beregner compliance score baseret på værdierne for total og risky.
    Hvis total er 0, returneres standardværdien 100.
    """
    compliance = 100 if total == 0 else round(((total - risky) / total) * 100)
    return {"complianceScore": compliance}
