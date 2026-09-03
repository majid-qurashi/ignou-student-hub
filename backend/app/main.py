from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import init_db_tables
from app.api.routes import programmes, sessions, assignments, admin, gradecard, calculator

app = FastAPI(
    title="IGNOU Student Hub Official API",
    description="FastAPI Backend & Collector Service for Official IGNOU Assignments, Grade Card & Tools",
    version="2.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db_tables()

# Register API Routers
app.include_router(programmes.router, prefix="/api", tags=["Programmes"])
app.include_router(sessions.router, prefix="/api", tags=["Sessions"])
app.include_router(assignments.router, prefix="/api", tags=["Assignments"])
app.include_router(admin.router, prefix="/api", tags=["Admin Sync"])
app.include_router(gradecard.router, prefix="/api", tags=["Grade Card"])
app.include_router(calculator.router, prefix="/api", tags=["Calculator"])

@app.get("/")
def root():
    return {
        "service": "IGNOU Student Hub FastAPI Backend & Collector",
        "status": "online",
        "docs": "/docs"
    }
