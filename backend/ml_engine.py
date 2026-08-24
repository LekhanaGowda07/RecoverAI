import os
import joblib
import pandas as pd
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models", "recovery_model.joblib")

class MLEngine:
    def __init__(self, model_path=MODEL_PATH):
        self.model_path = model_path
        self.model = None
        self.load_model()

    def load_model(self):
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                print(f"ML Engine: Successfully loaded trained recovery model from {self.model_path}")
            except Exception as e:
                print(f"ML Engine Warning: Could not load model ({e}). Using rule-based fallback.")
                self.model = None
        else:
            print(f"ML Engine Warning: Model file not found at {self.model_path}. Using rule-based fallback.")
            self.model = None

    def predict_recovery(self, txn_dict: dict) -> dict:
        """
        Runs ML model or rule-based fallback to return:
        - recovery_score (float 0.0-1.0)
        - failure_category (str)
        - recommended_action (str)
        - strategy_details (dict)
        """
        failure_reason = txn_dict.get("failure_reason", "unknown").lower()
        amount = float(txn_dict.get("amount", 0.0))
        attempt_number = int(txn_dict.get("attempt_number", 1))
        prev_success = int(txn_dict.get("previous_success_count", 0))
        prev_failure = int(txn_dict.get("previous_failure_count", 0))
        tenure = int(txn_dict.get("customer_tenure_days", 0))
        card_age = int(txn_dict.get("payment_method_age", 0))
        prev_attempts = int(txn_dict.get("previous_recovery_attempts", 0))

        # Default fallback score
        recovery_score = 0.50

        if self.model is not None:
            try:
                # Prepare single-row DataFrame for pipeline
                input_df = pd.DataFrame([{
                    "amount": amount,
                    "payment_method_age": card_age,
                    "attempt_number": attempt_number,
                    "previous_success_count": prev_success,
                    "previous_failure_count": prev_failure,
                    "customer_tenure_days": tenure,
                    "previous_recovery_attempts": prev_attempts,
                    "subscription_amount": float(txn_dict.get("subscription_amount", 0.0)),
                    "is_subscription": 1 if txn_dict.get("is_subscription") else 0,
                    "currency": txn_dict.get("currency", "USD"),
                    "payment_method": txn_dict.get("payment_method", "credit_card"),
                    "failure_reason": failure_reason,
                    "country": txn_dict.get("country", "US"),
                    "device_type": txn_dict.get("device_type", "web_browser")
                }])
                
                # Predict probability of success
                probabilities = self.model.predict_proba(input_df)
                recovery_score = float(probabilities[0][1])
            except Exception as e:
                print(f"ML Inference error: {e}. Falling back to domain heuristic scoring.")
                recovery_score = self._domain_heuristic_score(failure_reason, prev_success, prev_failure, attempt_number)
        else:
            recovery_score = self._domain_heuristic_score(failure_reason, prev_success, prev_failure, attempt_number)

        # Categorize Failure & Assign Recommended Action
        failure_category, recommended_action, strategy_details = self._determine_strategy(
            failure_reason=failure_reason,
            amount=amount,
            recovery_score=recovery_score,
            payment_method=txn_dict.get("payment_method", "credit_card")
        )

        return {
            "recovery_score": round(recovery_score, 4),
            "failure_category": failure_category,
            "recommended_action": recommended_action,
            "strategy_details": strategy_details
        }

    def _domain_heuristic_score(self, failure_reason, prev_success, prev_failure, attempt_number):
        base_score = 0.60
        if failure_reason in ["network_error", "authentication_failed"]:
            base_score += 0.25
        elif failure_reason in ["expired_card", "invalid_payment_method"]:
            base_score += 0.10
        elif failure_reason == "insufficient_funds":
            base_score -= 0.15
        elif failure_reason == "limit_exceeded":
            base_score -= 0.20
        elif failure_reason == "bank_declined":
            base_score -= 0.10

        if prev_success > 5:
            base_score += 0.15
        if prev_failure > 3:
            base_score -= 0.20
        if attempt_number > 2:
            base_score -= 0.15

        return max(0.05, min(0.98, base_score))

    def _determine_strategy(self, failure_reason: str, amount: float, recovery_score: float, payment_method: str):
        if failure_reason == "network_error":
            cat = "Soft Decline - Gateway Network Latency"
            act = "SMART_RETRY_SCHEDULED"
            det = {
                "delay_minutes": 15,
                "channel": "Razorpay Smart Retry Gateway",
                "nudge_type": "None (Silent Background Retry)",
                "explanation": "Transient network issue detected. High probability of immediate background resolution."
            }
        elif failure_reason == "expired_card":
            cat = "Hard Decline - Expired Instrument"
            act = "PAYMENT_METHOD_UPDATE_NUDGE"
            det = {
                "delay_minutes": 0,
                "channel": "SMS & Email Interactive Link",
                "nudge_type": "Secure 1-Click Card Expiry Update Portal",
                "explanation": "Card credentials expired. Requires customer intervention via secure Razorpay checkout link."
            }
        elif failure_reason == "insufficient_funds":
            cat = "Soft Decline - Insufficient Balance"
            act = "OPTIMAL_PAYDAY_RETRY"
            det = {
                "delay_minutes": 720, # 12 hours / morning retry
                "channel": "WhatsApp + Payday Retry Engine",
                "nudge_type": "Balance Reminder & Alternative Payment Nudge",
                "explanation": "Temporary balance deficit. Scheduled for morning retry when liquidity typically improves."
            }
        elif failure_reason == "authentication_failed":
            cat = "Soft Decline - 3DS/OTP Timeout"
            act = "1_CLICK_REAUTHENTICATE_NUDGE"
            det = {
                "delay_minutes": 5,
                "channel": "WhatsApp Push Notification",
                "nudge_type": "Instant 3DS Re-authentication Link",
                "explanation": "Customer failed 3DS OTP challenge. Direct 1-click retry sent via mobile notification."
            }
        elif failure_reason == "limit_exceeded":
            cat = "Hard Decline - Daily Spend Limit Exceeded"
            act = "SPLIT_PAYMENT_PROMPT"
            det = {
                "delay_minutes": 0,
                "channel": "Email & SMS Nudge",
                "nudge_type": "Split Payment or Alternative Method Link",
                "explanation": "Card issuer transaction limit hit. Prompting user to switch to UPI or Split Payment."
            }
        elif failure_reason == "bank_declined":
            cat = "Soft Decline - Issuing Bank Block"
            act = "ALT_ROUTING_RETRY"
            det = {
                "delay_minutes": 60,
                "channel": "Multi-Acquirer Smart Router",
                "nudge_type": "None (Automated Secondary Gateway Switch)",
                "explanation": "Primary acquirer rejected transaction. Rerouting via secondary banking node."
            }
        elif failure_reason == "invalid_payment_method":
            cat = "Hard Decline - Invalid Account/Card Details"
            act = "PAYMENT_METHOD_UPDATE_NUDGE"
            det = {
                "delay_minutes": 0,
                "channel": "Email + Portal Nudge",
                "nudge_type": "Add New Payment Method Link",
                "explanation": "Payment method details invalid or closed. Prompt user to bind a new valid payment method."
            }
        else:
            cat = "Uncategorized Failure"
            act = "DIRECT_SUPPORT_ENGAGEMENT"
            det = {
                "delay_minutes": 120,
                "channel": "Merchant Care Concierge",
                "nudge_type": "Personalized Support Email",
                "explanation": "Ambiguous failure code. Dispatching automated support inquiry ticket."
            }

        return cat, act, det

# Global ML Engine Instance
ml_engine = MLEngine()
