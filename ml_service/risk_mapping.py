# Enhanced Risk classification for multi-dataset diseases
import re

# Explicit mappings for primary diseases
PRIMARY_MAPPING = {
    'allergy': ('low', 'Avoid identified triggers and take antihistamines as prescribed.'),
    'influenza': ('low', 'Rest, hydrate, and use over-the-counter flu relief.'),
    'sinusitis': ('low', 'Use saline rinses and steam inhalation. Consult if pain persists.'),
    'migraine': ('low', 'Rest in a dark room. Take prescribed migraine medication.'),
    'common cold': ('low', 'Rest and drink plenty of fluids. Monitor for fever.'),
    'gastritis': ('low', 'Avoid spicy foods and caffeine. Try small, bland meals.'),
    'dermatitis': ('low', 'Apply soothing creams and avoid scratching.'),
    'ibs': ('low', 'Monitor dietary triggers and manage stress levels.'),
    'anemia': ('low', 'Focus on iron-rich foods and consult regarding supplements.'),
    
    'thyroid disorder': ('medium', 'Continue routine hormone therapy and regular blood checks.'),
    'bronchitis': ('medium', 'Use a humidifier and rest. Seek help if breathing worsens.'),
    'diabetes': ('medium', 'Monitor blood sugar levels closely and follow your meal plan.'),
    'arthritis': ('medium', 'Perform low-impact exercises and use prescribed anti-inflammatories.'),
    'asthma': ('medium', 'Keep your rescue inhaler handy and avoid environmental triggers.'),
    'depression': ('medium', 'Maintain contact with your mental health professional.'),
    'anxiety': ('medium', 'Practice deep breathing and groundedness exercises.'),
    'ulcer': ('medium', 'Follow a prescribed diet and complete any antibiotic courses.'),
    'obesity': ('medium', 'Focus on sustainable lifestyle changes and regular activity.'),
    'hypertension': ('medium', 'Monitor blood pressure daily and reduce sodium intake.'),
    'covid-19': ('medium', 'Isolate and monitor oxygen levels. Seek help for shortness of breath.'),
    
    'stroke': ('high', 'EMERGENCY: Call emergency services immediately. Time is critical.'),
    'heart disease': ('high', 'CRITICAL: Seek immediate cardiology evaluation.'),
    'dementia': ('high', 'SPECIALIZED CARE: Ensure a safe environment and specialist follow-up.'),
    'parkinson\'s': ('high', 'SPECIALIZED CARE: Follow strict medication schedules and therapy.'),
    'liver disease': ('high', 'URGENT: Avoid alcohol and consult a hepatologist immediately.'),
    'epilepsy': ('high', 'SAFETY FIRST: Avoid dangerous activities and visit your neurologist.'),
    'tuberculosis': ('high', 'INFECTIOUS: Complete the full course of therapy; isolate if needed.'),
    'pneumonia': ('high', 'URGENT: Requires antibiotics and potential oxygen support.'),
    'chronic kidney disease': ('high', 'CRITICAL: Follow nephrologist instructions and monitor fluids.'),
    
    # Pregnancy Specific
    'pregnancy': ('low', 'PRENATAL CARE: Schedule regular check-ups, take prenatal vitamins, and monitor for changes.'),
    'problem during pregnancy': ('medium', 'CONSULT: Visit your obstetrician to discuss these specific symptoms immediately.'),
    'ectopic pregnancy': ('high', 'EMERGENCY: This condition requires immediate surgical/medical intervention.'),
    'hypertension of pregnancy': ('high', 'CRITICAL: High blood pressure during pregnancy needs immediate medical management.'),
    'threatened pregnancy': ('high', 'URGENT: Seek immediate care for bleeding or severe cramps during pregnancy.')
}

HIGH_KEYWORDS = [
    'cancer', 'stroke', 'heart', 'cardiac', 'failure', 'hemorrhage', 'tumor', 
    'infarction', 'poisoning', 'toxic', 'sepsis', 'coma', 'unconscious', 
    'respiratory arrest', 'malignant', 'acute'
]

MEDIUM_KEYWORDS = [
    'chronic', 'disorder', 'inflammation', 'infection', 'disease', 'condition', 
    'syndrome', 'deficiency', 'fracture', 'broken'
]

LOW_KEYWORDS = [
    'mild', 'cold', 'flu', 'minor', 'irritation', 'rash', 'itch'
]

def get_risk_info(disease_name):
    disease_lower = disease_name.lower().strip()
    
    # 1. Check Primary Mapping
    if disease_lower in PRIMARY_MAPPING:
        return PRIMARY_MAPPING[disease_lower]
        
    # 2. Heuristic Check
    risk = 'medium' # Default
    advice = f"Consult a healthcare professional regarding {disease_name} for a full evaluation."
    
    if any(k in disease_lower for k in HIGH_KEYWORDS):
        risk = 'high'
        advice = f"URGENT: {disease_name.capitalize()} can be serious. Seek immediate medical attention."
    elif any(k in disease_lower for k in LOW_KEYWORDS):
        risk = 'low'
        advice = f"Monitor your symptoms for {disease_name}. Rest and see a doctor if they persist."
    elif any(k in disease_lower for k in MEDIUM_KEYWORDS):
        risk = 'medium'
        advice = f"Schedule an appointment to discuss {disease_name} management options."
        
    return risk, advice
