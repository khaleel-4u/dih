import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Helper: Call local ML Service (Merged Dataset Model)
async function getLocalMLPrediction(symptom_text: string) {
  const mlResponse = await fetch('http://localhost:5001/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms: symptom_text }),
  });

  if (!mlResponse.ok) {
    throw new Error('Local ML Service Error');
  }

  return await mlResponse.json();
}

export async function POST(req: Request) {
  const session_start = new Date().toISOString();
  
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }); },
        remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: '', ...options }); },
      },
    }
  );

  try {
    const body = await req.json();
    const symptom_text = body.symptom_text as string;
    const user_id = body.user_id as string;

    if (!symptom_text) {
      return NextResponse.json({ error: 'Symptom text is required' }, { status: 400 });
    }

    let finalRisk: string;
    let finalAction: string;
    let triggerWords: string[] = [];
    let explanation: string;
    let adviceResult: string | null = null;

    try {
      // Primary source: Local ML Model (Merged Dataset)
      console.log("Executing Local ML Prediction (Merged Dataset Source)...");
      const mlData = await getLocalMLPrediction(symptom_text);
      
      finalRisk = mlData.risk_level;
      adviceResult = mlData.advice || mlData.recommendation;
      finalAction = adviceResult;
      explanation = `Local ML Prediction: Detected ${mlData.disease} with ${(mlData.confidence * 100).toFixed(1)}% confidence. [Based on expanded Healthcare dataset]`;

    } catch (error) {
      console.error('Local ML Service failed, using rule-based fallback...', error);
      // Simple emergency rule-based fallback
      const isHigh = symptom_text.toLowerCase().includes('chest pain') || symptom_text.toLowerCase().includes('breath');
      finalRisk = isHigh ? 'high' : 'low';
      finalAction = isHigh 
        ? "Seek immediate medical attention right now." 
        : "Rest, hydrate, and monitor symptoms.";
      explanation = "Response generated via Emergency Fallback (Inference Service Reachability Issue).";
      adviceResult = finalAction;
    }

    // Highlight trigger words for UI
    const knownSymptoms = [
        'abdominal pain', 'anxiety', 'appetite loss', 'back pain', 'blurred vision', 
        'chest pain', 'cough', 'depression', 'diarrhea', 'dizziness', 'fatigue', 
        'fever', 'headache', 'insomnia', 'joint pain', 'muscle pain', 'nausea', 
        'rash', 'runny nose', 'shortness of breath', 'sneezing', 'sore throat', 
        'sweating', 'swelling', 'tremors', 'vomiting', 'weight gain', 'weight loss'
    ];
    triggerWords = knownSymptoms.filter(s => symptom_text.toLowerCase().includes(s));

    const session_end = new Date().toISOString();
    const duration = Math.ceil((new Date(session_end).getTime() - new Date(session_start).getTime()) / 60000);

    // Save logs to Supabase
    await supabase.from("symptom_logs").insert({
      user_id,
      symptom_text,
      risk_level: finalRisk,
      recommendation: finalAction,
      trigger_words: triggerWords,
      session_start,
      session_end,
      duration_minutes: duration
    });

    return NextResponse.json({
      risk_level: finalRisk,
      recommended_action: finalAction,
      trigger_words: triggerWords,
      explanation,
      advice: adviceResult,
      source: 'Local ML (Merged Dataset)'
    });

  } catch (error: any) {
    console.error('Prediction error:', error);
    return NextResponse.json({ error: "Medical detection service is currently unavailable. Please try again later." }, { status: 500 });
  }
}
