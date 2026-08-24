import os
import csv
import random
import uuid
from datetime import datetime, timedelta

def generate_synthetic_payments(filename="data/synthetic/payments.csv", num_records=5000):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    currencies = ["USD", "INR", "EUR", "GBP"]
    payment_methods = ["credit_card", "debit_card", "upi", "net_banking", "wallet", "ach"]
    countries = ["US", "IN", "GB", "CA", "DE", "AU"]
    device_types = ["mobile_app", "web_browser", "api_integration"]
    
    failure_reasons = [
        "insufficient_funds",
        "expired_card",
        "authentication_failed",
        "bank_declined",
        "network_error",
        "limit_exceeded",
        "invalid_payment_method",
        "unknown"
    ]
    
    # Probabilities for realistic distribution
    reason_weights = [0.35, 0.15, 0.15, 0.12, 0.10, 0.05, 0.05, 0.03]
    
    fieldnames = [
        "transaction_id",
        "customer_id",
        "merchant_id",
        "amount",
        "currency",
        "payment_method",
        "payment_method_age",
        "failure_reason",
        "attempt_number",
        "previous_success_count",
        "previous_failure_count",
        "customer_tenure_days",
        "timestamp",
        "country",
        "device_type",
        "is_subscription",
        "subscription_amount",
        "previous_recovery_attempts",
        "final_status"
    ]
    
    records = []
    
    # 1. Generate 10 curated demo transactions for hackathon presentation
    curated_demo_txns = [
        {
            "transaction_id": "TXN_DEMO_001",
            "customer_id": "CUST_DEMO_01",
            "merchant_id": "MERCH_DEMO",
            "amount": 49.99,
            "currency": "USD",
            "payment_method": "credit_card",
            "payment_method_age": 420,
            "failure_reason": "network_error",
            "attempt_number": 1,
            "previous_success_count": 14,
            "previous_failure_count": 0,
            "customer_tenure_days": 450,
            "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(),
            "country": "US",
            "device_type": "mobile_app",
            "is_subscription": True,
            "subscription_amount": 49.99,
            "previous_recovery_attempts": 0,
            "final_status": "failed"
        },
        {
            "transaction_id": "TXN_DEMO_002",
            "customer_id": "CUST_DEMO_02",
            "merchant_id": "MERCH_DEMO",
            "amount": 129.00,
            "currency": "USD",
            "payment_method": "credit_card",
            "payment_method_age": 730,
            "failure_reason": "expired_card",
            "attempt_number": 1,
            "previous_success_count": 8,
            "previous_failure_count": 1,
            "customer_tenure_days": 365,
            "timestamp": (datetime.now() - timedelta(hours=5)).isoformat(),
            "country": "US",
            "device_type": "web_browser",
            "is_subscription": True,
            "subscription_amount": 129.00,
            "previous_recovery_attempts": 0,
            "final_status": "failed"
        },
        {
            "transaction_id": "TXN_DEMO_003",
            "customer_id": "CUST_DEMO_03",
            "merchant_id": "MERCH_DEMO",
            "amount": 89.50,
            "currency": "USD",
            "payment_method": "debit_card",
            "payment_method_age": 180,
            "failure_reason": "insufficient_funds",
            "attempt_number": 2,
            "previous_success_count": 5,
            "previous_failure_count": 1,
            "customer_tenure_days": 200,
            "timestamp": (datetime.now() - timedelta(hours=12)).isoformat(),
            "country": "IN",
            "device_type": "mobile_app",
            "is_subscription": False,
            "subscription_amount": 0.0,
            "previous_recovery_attempts": 1,
            "final_status": "failed"
        },
        {
            "transaction_id": "TXN_DEMO_004",
            "customer_id": "CUST_DEMO_04",
            "merchant_id": "MERCH_DEMO",
            "amount": 2499.00,
            "currency": "USD",
            "payment_method": "credit_card",
            "payment_method_age": 30,
            "failure_reason": "limit_exceeded",
            "attempt_number": 1,
            "previous_success_count": 1,
            "previous_failure_count": 0,
            "customer_tenure_days": 35,
            "timestamp": (datetime.now() - timedelta(hours=18)).isoformat(),
            "country": "GB",
            "device_type": "web_browser",
            "is_subscription": False,
            "subscription_amount": 0.0,
            "previous_recovery_attempts": 0,
            "final_status": "failed"
        },
        {
            "transaction_id": "TXN_DEMO_005",
            "customer_id": "CUST_DEMO_05",
            "merchant_id": "MERCH_DEMO",
            "amount": 19.99,
            "currency": "USD",
            "payment_method": "upi",
            "payment_method_age": 90,
            "failure_reason": "authentication_failed",
            "attempt_number": 3,
            "previous_success_count": 2,
            "previous_failure_count": 3,
            "customer_tenure_days": 100,
            "timestamp": (datetime.now() - timedelta(hours=24)).isoformat(),
            "country": "IN",
            "device_type": "mobile_app",
            "is_subscription": True,
            "subscription_amount": 19.99,
            "previous_recovery_attempts": 3,
            "final_status": "failed"
        },
        {
            "transaction_id": "TXN_DEMO_006",
            "customer_id": "CUST_DEMO_06",
            "merchant_id": "MERCH_DEMO",
            "amount": 499.00,
            "currency": "USD",
            "payment_method": "credit_card",
            "payment_method_age": 500,
            "failure_reason": "bank_declined",
            "attempt_number": 1,
            "previous_success_count": 12,
            "previous_failure_count": 0,
            "customer_tenure_days": 600,
            "timestamp": (datetime.now() - timedelta(hours=30)).isoformat(),
            "country": "DE",
            "device_type": "web_browser",
            "is_subscription": True,
            "subscription_amount": 499.00,
            "previous_recovery_attempts": 0,
            "final_status": "failed"
        },
        {
            "transaction_id": "TXN_DEMO_007",
            "customer_id": "CUST_DEMO_07",
            "merchant_id": "MERCH_DEMO",
            "amount": 1250.00,
            "currency": "USD",
            "payment_method": "ach",
            "payment_method_age": 10,
            "failure_reason": "unknown",
            "attempt_number": 1,
            "previous_success_count": 0,
            "previous_failure_count": 1,
            "customer_tenure_days": 12,
            "timestamp": (datetime.now() - timedelta(hours=36)).isoformat(),
            "country": "US",
            "device_type": "api_integration",
            "is_subscription": False,
            "subscription_amount": 0.0,
            "previous_recovery_attempts": 0,
            "final_status": "failed"
        },
        {
            "transaction_id": "TXN_DEMO_008",
            "customer_id": "CUST_DEMO_08",
            "merchant_id": "MERCH_DEMO",
            "amount": 75.00,
            "currency": "USD",
            "payment_method": "debit_card",
            "payment_method_age": 300,
            "failure_reason": "invalid_payment_method",
            "attempt_number": 3,
            "previous_success_count": 3,
            "previous_failure_count": 4,
            "customer_tenure_days": 320,
            "timestamp": (datetime.now() - timedelta(hours=48)).isoformat(),
            "country": "CA",
            "device_type": "web_browser",
            "is_subscription": False,
            "subscription_amount": 0.0,
            "previous_recovery_attempts": 3,
            "final_status": "abandoned"
        },
        {
            "transaction_id": "TXN_DEMO_009",
            "customer_id": "CUST_DEMO_09",
            "merchant_id": "MERCH_DEMO",
            "amount": 99.00,
            "currency": "USD",
            "payment_method": "credit_card",
            "payment_method_age": 250,
            "failure_reason": "insufficient_funds",
            "attempt_number": 1,
            "previous_success_count": 6,
            "previous_failure_count": 0,
            "customer_tenure_days": 280,
            "timestamp": (datetime.now() - timedelta(hours=60)).isoformat(),
            "country": "US",
            "device_type": "mobile_app",
            "is_subscription": True,
            "subscription_amount": 99.00,
            "previous_recovery_attempts": 1,
            "final_status": "recovered"
        },
        {
            "transaction_id": "TXN_DEMO_010",
            "customer_id": "CUST_DEMO_10",
            "merchant_id": "MERCH_DEMO",
            "amount": 3500.00,
            "currency": "USD",
            "payment_method": "net_banking",
            "payment_method_age": 5,
            "failure_reason": "authentication_failed",
            "attempt_number": 1,
            "previous_success_count": 0,
            "previous_failure_count": 0,
            "customer_tenure_days": 2,
            "timestamp": (datetime.now() - timedelta(hours=72)).isoformat(),
            "country": "AU",
            "device_type": "web_browser",
            "is_subscription": False,
            "subscription_amount": 0.0,
            "previous_recovery_attempts": 0,
            "final_status": "failed"
        }
    ]
    
    records.extend(curated_demo_txns)
    
    # 2. Generate remaining synthetic records up to num_records
    now = datetime.now()
    random.seed(42)  # For reproducible synthetic dataset
    
    for i in range(len(curated_demo_txns) + 1, num_records + 1):
        customer_id = f"CUST_{random.randint(100, 1500):04d}"
        merchant_id = f"MERCH_{random.randint(1, 10):02d}"
        
        # Realistic amounts with subscription bias
        is_sub = random.choice([True, False, False])
        if is_sub:
            amount = round(random.choice([9.99, 19.99, 29.99, 49.99, 99.00, 199.00, 499.00]), 2)
            sub_amount = amount
        else:
            amount = round(random.expovariate(1.0 / 150.0) + 5.0, 2)
            if amount > 5000.0:
                amount = 4999.99
            sub_amount = 0.0
            
        failure_reason = random.choices(failure_reasons, weights=reason_weights)[0]
        
        previous_success = random.randint(0, 20)
        previous_failure = random.randint(0, 5)
        tenure = random.randint(1, 1000)
        card_age = min(tenure, random.randint(1, 1000))
        attempt_num = random.choices([1, 2, 3, 4], weights=[0.65, 0.20, 0.10, 0.05])[0]
        prev_recovery_attempts = attempt_num - 1
        
        # Determine status based on realistic rules
        if prev_recovery_attempts >= 3:
            final_status = random.choice(["failed", "abandoned"])
        else:
            final_status = random.choices(["failed", "recovered", "abandoned"], weights=[0.60, 0.30, 0.10])[0]
            
        hours_ago = random.uniform(0.1, 720.0)  # past 30 days
        timestamp = (now - timedelta(hours=hours_ago)).isoformat()
        
        rec = {
            "transaction_id": f"TXN_{i:06d}",
            "customer_id": customer_id,
            "merchant_id": merchant_id,
            "amount": amount,
            "currency": random.choice(currencies),
            "payment_method": random.choice(payment_methods),
            "payment_method_age": card_age,
            "failure_reason": failure_reason,
            "attempt_number": attempt_num,
            "previous_success_count": previous_success,
            "previous_failure_count": previous_failure,
            "customer_tenure_days": tenure,
            "timestamp": timestamp,
            "country": random.choice(countries),
            "device_type": random.choice(device_types),
            "is_subscription": is_sub,
            "subscription_amount": sub_amount,
            "previous_recovery_attempts": prev_recovery_attempts,
            "final_status": final_status
        }
        records.append(rec)
        
    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)
        
    print(f"Successfully generated {len(records)} synthetic payment records in '{filename}'.")

if __name__ == "__main__":
    generate_synthetic_payments()
