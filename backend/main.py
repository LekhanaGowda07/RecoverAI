import os
import csv
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base, SessionLocal
from backend.models_db import TransactionModel
from backend.routes import router as api_router
from backend.agent_workflow import AgentWorkflowEngine

# Create DB tables
Base.metadata.create_all(bind=engine)
app = FastAPI()

def seed_database_if_empty():
    db = SessionLocal()
    try:
        count = db.query(TransactionModel).count()
        if count == 0:
            csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "synthetic", "payments.csv")
            if os.path.exists(csv_path):
                print(f"[Database Seed] Seeding transactions from {csv_path}...")
                records = []
                with open(csv_path, "r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        txn = TransactionModel(
                            transaction_id=row["transaction_id"],
                            customer_id=row["customer_id"],
                            merchant_id=row["merchant_id"],
                            amount=float(row["amount"]),
                            currency=row["currency"],
                            payment_method=row["payment_method"],
                            payment_method_age=int(row["payment_method_age"]),
                            failure_reason=row["failure_reason"],
                            attempt_number=int(row["attempt_number"]),
                            previous_success_count=int(row["previous_success_count"]),
                            previous_failure_count=int(row["previous_failure_count"]),
                            customer_tenure_days=int(row["customer_tenure_days"]),
                            timestamp=row["timestamp"],
                            country=row["country"],
                            device_type=row["device_type"],
                            is_subscription=row["is_subscription"].lower() in ["true", "1"],
                            subscription_amount=float(row["subscription_amount"]),
                            previous_recovery_attempts=int(row["previous_recovery_attempts"]),
                            final_status=row["final_status"]
                        )
                        records.append(txn)
                db.bulk_save_objects(records)
                db.commit()
                print(f"[Database Seed] Seeded {len(records)} transactions into SQLite database.")

                # Pre-run agent workflow for curated demo transactions
                print("[Database Seed] Pre-running AI Agent workflows for demo transactions...")
                workflow = AgentWorkflowEngine(db)
                for demo_id in ["TXN_DEMO_001", "TXN_DEMO_002", "TXN_DEMO_003", "TXN_DEMO_004", "TXN_DEMO_005"]:
                    try:
                        workflow.execute_recovery_workflow(demo_id)
                    except Exception as e:
                        print(f"Error pre-running {demo_id}: {e}")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_database_if_empty()
    yield

app = FastAPI(
    title="RecoverAI Payment Recovery Agent API",
    description="Autonomous Agentic Payment Failure Recovery Platform for Razorpay Hackathon",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "Welcome to RecoverAI Payment Recovery API",
        "docs": "/docs",
        "health": "/api/health"
    }
