from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import modules, prompts  # Korrekt importsti

app = FastAPI()

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://chat.openai.com",
        "https://chatgpt.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Inkluder routers
app.include_router(modules.router, prefix="/modules", tags=["Modules"])
app.include_router(prompts.router, prefix="/prompts", tags=["Prompts"])