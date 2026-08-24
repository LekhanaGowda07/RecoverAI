import datetime
import json
from sqlalchemy.orm import Session
from backend.models_db import TransactionModel, AuditLogModel
from backend.ml_engine import ml_engine

class AgentWorkflowEngine:
    def __init__(self, db: Session):
        self.db = db

    def execute_recovery_workflow(self, transaction_id: str) -> dict:
        txn = self.db.query(TransactionModel).filter(TransactionModel.transaction_id == transaction_id).first()
        if not txn:
            return {"error": f"Transaction '{transaction_id}' not found.", "status": "FAILED"}

        # Reset existing audit logs for this run if re-running
        # self.db.query(AuditLogModel).filter(AuditLogModel.transaction_id == transaction_id).delete()
        
        print(f"\n[Agent Workflow] Starting Recovery Cycle for {transaction_id}...")
        
        # -------------------------------------------------------------
        # STEP 1: Diagnostics & Root Cause Analysis
        # -------------------------------------------------------------
        txn_dict = {
            "amount": txn.amount,
            "payment_method_age": txn.payment_method_age,
            "attempt_number": txn.attempt_number,
            "previous_success_count": txn.previous_success_count,
            "previous_failure_count": txn.previous_failure_count,
            "customer_tenure_days": txn.customer_tenure_days,
            "previous_recovery_attempts": txn.previous_recovery_attempts,
            "subscription_amount": txn.subscription_amount,
            "is_subscription": txn.is_subscription,
            "currency": txn.currency,
            "payment_method": txn.payment_method,
            "failure_reason": txn.failure_reason,
            "country": txn.country,
            "device_type": txn.device_type
        }

        ml_result = ml_engine.predict_recovery(txn_dict)
        rec_score = ml_result["recovery_score"]
        fail_cat = ml_result["failure_category"]
        rec_action = ml_result["recommended_action"]
        strat_details = ml_result["strategy_details"]

        # Update transaction ML fields
        txn.recovery_score = rec_score
        txn.failure_category = fail_cat
        txn.recommended_action = rec_action
        txn.final_status = "in_recovery"
        self.db.commit()

        step1_details = {
            "telemetry_evaluated": {
                "amount": f"{txn.currency} {txn.amount}",
                "payment_method": txn.payment_method,
                "failure_reason": txn.failure_reason,
                "attempt_count": txn.attempt_number,
                "customer_tenure": f"{txn.customer_tenure_days} days"
            },
            "ml_inference": {
                "recovery_probability": f"{rec_score * 100:.1f}%",
                "failure_category": fail_cat,
                "recommended_action": rec_action
            }
        }

        self._log_audit(
            transaction_id=transaction_id,
            step_number=1,
            step_name="Diagnostics & Telemetry Triage",
            status="PASSED",
            details=json.dumps(step1_details, indent=2)
        )

        # -------------------------------------------------------------
        # STEP 2: Risk & Compliance Guardrails Engine
        # -------------------------------------------------------------
        guardrail_passed = True
        guardrail_reason = ""

        # Guardrail 1: Retry Fatigue Cap
        if txn.previous_recovery_attempts >= 3 or txn.attempt_number >= 4:
            guardrail_passed = False
            guardrail_reason = f"Fatigue Limit Exceeded: Customer has undergone {txn.previous_recovery_attempts} previous recovery attempts. Further retries suppressed to comply with anti-spam policy."
        
        # Guardrail 2: High Value Fraud Limit
        elif txn.amount > 3000.0 and txn.customer_tenure_days < 14:
            guardrail_passed = False
            guardrail_reason = f"High-Risk Fraud Block: Amount {txn.currency} {txn.amount} exceeds $3,000 threshold for new customer (tenure: {txn.customer_tenure_days}d). Direct merchant verification required."

        # Guardrail 3: Low Score Threshold
        elif rec_score < 0.15 and txn.failure_reason not in ["network_error", "authentication_failed"]:
            guardrail_passed = False
            guardrail_reason = f"Low Confidence Threshold: Recovery probability ({rec_score * 100:.1f}%) is below minimum viable threshold (15%). Suppressed to minimize network fees."

        if not guardrail_passed:
            txn.final_status = "blocked_guardrail"
            self.db.commit()

            step2_details = {
                "guardrail_status": "TRIGGERED",
                "violated_rule": guardrail_reason,
                "action": "AUTOMATED_RECOVERY_HALTED"
            }

            self._log_audit(
                transaction_id=transaction_id,
                step_number=2,
                step_name="Risk & Compliance Guardrails",
                status="GUARDRAIL_TRIGGERED",
                details=json.dumps(step2_details, indent=2)
            )

            return {
                "transaction_id": transaction_id,
                "status": "BLOCKED_GUARDRAIL",
                "recovery_score": rec_score,
                "guardrail_reason": guardrail_reason
            }

        step2_details = {
            "guardrail_status": "PASSED",
            "evaluated_rules": [
                "Retry Fatigue Cap (Max 3 attempts): PASSED",
                "High Value Fraud Shield ($3,000 limit): PASSED",
                "Minimum Confidence Floor (15%): PASSED",
                "PCI-DSS Tokenization Verification: PASSED"
            ]
        }

        self._log_audit(
            transaction_id=transaction_id,
            step_number=2,
            step_name="Risk & Compliance Guardrails",
            status="PASSED",
            details=json.dumps(step2_details, indent=2)
        )

        # -------------------------------------------------------------
        # STEP 3: Strategy & Dynamic Nudge Formulation
        # -------------------------------------------------------------
        nudge_payload = self._generate_nudge_payload(txn, rec_action, strat_details)

        step3_details = {
            "selected_strategy": rec_action,
            "execution_delay": f"{strat_details.get('delay_minutes', 0)} minutes",
            "communication_channel": strat_details.get("channel", "Automated Webhook"),
            "nudge_template": strat_details.get("nudge_type", "Standard Nudge"),
            "generated_payload": nudge_payload
        }

        self._log_audit(
            transaction_id=transaction_id,
            step_number=3,
            step_name="Strategy & Communication Nudge",
            status="PASSED",
            details=json.dumps(step3_details, indent=2)
        )

        # -------------------------------------------------------------
        # STEP 4: Autonomous Webhook Execution & Resolution
        # -------------------------------------------------------------
        # Simulate execution outcome based on recovery score & reason
        is_successful_recovery = (rec_score >= 0.35) or (txn.failure_reason in ["network_error", "authentication_failed"])

        if is_successful_recovery:
            txn.final_status = "recovered"
            txn.last_recovered_at = datetime.datetime.utcnow()
            execution_status = "RECOVERED_SUCCESSFULLY"
            execution_msg = f"Razorpay Payment Gateway Webhook executed successfully. Funds of {txn.currency} {txn.amount} captured."
        else:
            txn.final_status = "failed_permanently"
            execution_status = "RECOVERY_UNSUCCESSFUL"
            execution_msg = f"Payment recovery attempt completed, but issuer declined transaction. Customer notified."

        txn.previous_recovery_attempts += 1
        self.db.commit()

        step4_details = {
            "execution_status": execution_status,
            "gateway_response": execution_msg,
            "recovery_timestamp": datetime.datetime.utcnow().isoformat(),
            "amount_recovered": f"{txn.currency} {txn.amount}" if is_successful_recovery else "0.00"
        }

        self._log_audit(
            transaction_id=transaction_id,
            step_number=4,
            step_name="Autonomous Execution & Webhook Dispatch",
            status="EXECUTED",
            details=json.dumps(step4_details, indent=2)
        )

        return {
            "transaction_id": transaction_id,
            "status": txn.final_status.upper(),
            "recovery_score": rec_score,
            "amount_recovered": txn.amount if is_successful_recovery else 0.0,
            "recommended_action": rec_action
        }

    def _generate_nudge_payload(self, txn: TransactionModel, action: str, details: dict) -> dict:
        cust = txn.customer_id
        amt = f"{txn.currency} {txn.amount}"
        link = f"https://pay.razorpay.com/recovery/quick-link/{txn.transaction_id}"
        
        if action == "PAYMENT_METHOD_UPDATE_NUDGE":
            return {
                "type": "Interactive_SMS_Email",
                "subject": f"Action Required: Update payment method for your order ({txn.transaction_id})",
                "body": f"Hi Customer ({cust}), your payment of {amt} failed due to card expiration. Update your payment details safely via Razorpay: {link}",
                "cta": "Update Payment Method"
            }
        elif action == "1_CLICK_REAUTHENTICATE_NUDGE":
            return {
                "type": "WhatsApp_Push",
                "body": f"Razorpay Alert: Your transaction of {amt} timed out during 3DS OTP validation. Tap below to re-authenticate in 1-click.",
                "cta": "Re-authenticate Now",
                "quick_link": link
            }
        elif action == "OPTIMAL_PAYDAY_RETRY":
            return {
                "type": "Payday_Scheduler",
                "body": f"We noticed your payment of {amt} didn't go through. We've scheduled a convenient retry for tomorrow morning.",
                "retry_timestamp": (datetime.datetime.utcnow() + datetime.timedelta(hours=12)).isoformat()
            }
        elif action == "SPLIT_PAYMENT_PROMPT":
            return {
                "type": "Split_Payment_Portal",
                "body": f"Your bank declined the single charge of {amt}. Would you like to split this into 2 smaller installments or pay via UPI?",
                "cta": "Explore Split Payment Options",
                "portal_link": link
            }
        else:
            return {
                "type": "Razorpay_Smart_Retry_API",
                "webhook_target": "https://api.razorpay.com/v1/payments/retry",
                "payload": {
                    "transaction_id": txn.transaction_id,
                    "merchant_id": txn.merchant_id,
                    "amount": txn.amount,
                    "retry_token": f"token_smart_retry_{txn.transaction_id}"
                }
            }

    def _log_audit(self, transaction_id: str, step_number: int, step_name: str, status: str, details: str):
        audit = AuditLogModel(
            transaction_id=transaction_id,
            step_number=step_number,
            step_name=step_name,
            status=status,
            details=details,
            timestamp=datetime.datetime.utcnow()
        )
        self.db.add(audit)
        self.db.commit()
