from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import modules, prompts  # Importer dine routers her

app = FastAPI()

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Åben adgang midlertidigt
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inkluder dine routers
app.include_router(modules.router, prefix="/modules", tags=["Modules"])
app.include_router(prompts.router, prefix="/prompts", tags=["Prompts"])

# (Evt. andre routers senere)