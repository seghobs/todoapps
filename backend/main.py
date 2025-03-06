from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import todo, user
from app.database.base import Base, engine
from app.utils.config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user.router, prefix=settings.API_V1_STR)
app.include_router(todo.router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Todo App API",
        "docs": "/docs",
        "redoc": "/redoc"
    } 