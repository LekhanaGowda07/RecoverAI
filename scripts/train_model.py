import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score, accuracy_score

def train_recovery_model(data_path="data/synthetic/payments.csv", model_output_path="models/recovery_model.joblib"):
    print(f"Loading dataset from {data_path}...")
    df = pd.read_csv(data_path)
    
    # Target 1: Binary recoverability classification (1 = recovered, 0 = failed/abandoned)
    df['target_recoverable'] = (df['final_status'] == 'recovered').astype(int)
    
    # Define features
    numeric_features = [
        "amount",
        "payment_method_age",
        "attempt_number",
        "previous_success_count",
        "previous_failure_count",
        "customer_tenure_days",
        "previous_recovery_attempts",
        "subscription_amount"
    ]
    
    categorical_features = [
        "currency",
        "payment_method",
        "failure_reason",
        "country",
        "device_type"
    ]
    
    # Convert boolean is_subscription to int
    df['is_subscription'] = df['is_subscription'].astype(int)
    numeric_features.append('is_subscription')
    
    X = df[numeric_features + categorical_features]
    y = df['target_recoverable']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Preprocessor pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ]
    )
    
    # Classifier pipeline
    clf_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10, min_samples_split=5))
    ])
    
    print("Training Random Forest Recovery Model...")
    clf_pipeline.fit(X_train, y_train)
    
    # Evaluate
    y_pred = clf_pipeline.predict(X_test)
    y_proba = clf_pipeline.predict_proba(X_test)[:, 1]
    
    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_proba)
    
    print("\n--- Model Evaluation ---")
    print(f"Accuracy: {acc:.4f}")
    print(f"ROC AUC:  {auc:.4f}")
    print("\nClassification Report:\n", classification_report(y_test, y_pred))
    
    # Ensure directory exists and save model
    os.makedirs(os.path.dirname(model_output_path), exist_ok=True)
    joblib.dump(clf_pipeline, model_output_path)
    print(f"\nSuccessfully saved trained ML model pipeline to '{model_output_path}'.")

if __name__ == "__main__":
    train_recovery_model()
