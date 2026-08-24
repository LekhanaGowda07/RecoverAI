import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class TransactionModel(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, unique=True, index=True, nullable=False)
    customer_id = Column(String, index=True)
    merchant_id = Column(String, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    payment_method = Column(String)
    payment_method_age = Column(Integer)
    failure_reason = Column(String)
    attempt_number = Column(Integer, default=1)
    previous_success_count = Column(Integer, default=0)
    previous_failure_count = Column(Integer, default=0)
    customer_tenure_days = Column(Integer, default=0)
    timestamp = Column(String)
    country = Column(String)
    device_type = Column(String)
    is_subscription = Column(Boolean, default=False)
    subscription_amount = Column(Float, default=0.0)
    previous_recovery_attempts = Column(Integer, default=0)
    final_status = Column(String, default="failed") # "failed", "in_recovery", "recovered", "abandoned", "blocked_guardrail"
    
    # ML & Agent Inference fields
    recovery_score = Column(Float, nullable=True)
    failure_category = Column(String, nullable=True)
    recommended_action = Column(String, nullable=True)
    last_recovered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    audit_logs = relationship("AuditLogModel", back_populates="transaction", cascade="all, delete-orphan")

class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, ForeignKey("transactions.transaction_id"), nullable=False)
    step_number = Column(Integer, nullable=False)
    step_name = Column(String, nullable=False)
    status = Column(String, nullable=False) # "PASSED", "WARNING", "GUARDRAIL_TRIGGERED", "EXECUTED"
    details = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    transaction = relationship("TransactionModel", back_populates="audit_logs")
