from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from .api.routes import router
from .db.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ProjectPulse API")

origins_env = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000')
origins = origins_env.split(',')

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")
