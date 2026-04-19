import pandas as pd
import numpy as np
import os
import joblib
import re
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Dataset paths
D1_PATH = r'C:\Users\sayed\.cache\kagglehub\datasets\kundanbedmutha\healthcare-symptomsdisease-classification-dataset\versions\1\Healthcare.csv'
D2_PATH = r'C:\Users\sayed\.cache\kagglehub\datasets\dhivyeshrk\diseases-and-symptoms-dataset\versions\1\Final_Augmented_dataset_Diseases_and_Symptoms.csv'
MERGED_DATA_PATH = r'g:\dih\ml_service\data\merged_symptom_disease_dataset.csv'

def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'[^a-zA-Z0-9\s,]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def train_model():
    print("Loading first dataset (D1)...")
    df1 = pd.read_csv(D1_PATH)
    d1_processed = df1[['Disease', 'Symptoms']].rename(columns={'Disease': 'disease', 'Symptoms': 'symptoms'})
    
    print("Loading second dataset (D2)...")
    df2 = pd.read_csv(D2_PATH)
    
    print("Transforming D2 wide format to comma-separated strings...")
    symptom_cols = df2.columns[1:]
    
    def get_symptoms(row):
        # Filter for columns where value is 1
        return ", ".join([col for col in symptom_cols if row[col] == 1])
    
    # Process D2
    df2['symptoms'] = df2.apply(get_symptoms, axis=1)
    d2_processed = df2[['diseases', 'symptoms']].rename(columns={'diseases': 'disease'})
    
    print("Merging and unifying datasets...")
    merged_df = pd.concat([d1_processed, d2_processed], ignore_index=True)
    
    print("Cleaning and normalizing merged data...")
    merged_df['symptoms'] = merged_df['symptoms'].apply(clean_text)
    merged_df['disease'] = merged_df['disease'].str.strip().str.lower()
    
    initial_count = len(merged_df)
    merged_df.drop_duplicates(subset=['disease', 'symptoms'], inplace=True)
    print(f"Deduplication complete: {initial_count} -> {len(merged_df)} rows")
    
    print(f"Saving merged dataset to {MERGED_DATA_PATH}...")
    os.makedirs(os.path.dirname(MERGED_DATA_PATH), exist_ok=True)
    merged_df.to_csv(MERGED_DATA_PATH, index=False)
    
    print("Preparing features and labels...")
    all_symptoms_list = set()
    for row in merged_df['symptoms']:
        all_symptoms_list.update([s.strip() for s in row.split(',') if s.strip()])
    
    sorted_symptoms = sorted(list(all_symptoms_list))
    symptom_to_idx = {s: i for i, s in enumerate(sorted_symptoms)}
    
    def encode_symptoms(s_string):
        vector = np.zeros(len(sorted_symptoms), dtype=np.int8) # Use int8 for memory efficiency
        present = [s.strip() for s in s_string.split(',') if s.strip()]
        for s in present:
            if s in symptom_to_idx:
                vector[symptom_to_idx[s]] = 1
        return vector

    print("Encoding symptoms into binary vectors...")
    X = np.stack(merged_df['symptoms'].apply(encode_symptoms).values)
    y = merged_df['disease']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1, random_state=42)
    
    print(f"Training Random Forest model on {len(X_train)} samples...")
    model = RandomForestClassifier(n_estimators=50, random_state=42, n_jobs=-1, max_depth=20) # Added max_depth to prevent memory explosion if classes are many
    model.fit(X_train, y_train)
    
    print("Evaluating...")
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Training Accuracy: {accuracy:.2%}")
    
    print("Saving updated artifacts...")
    os.makedirs('ml_service/models', exist_ok=True)
    joblib.dump(model, 'ml_service/models/model.joblib')
    joblib.dump(sorted_symptoms, 'ml_service/models/symptom_list.joblib')
    print("Multi-dataset model training complete!")

if __name__ == "__main__":
    train_model()
