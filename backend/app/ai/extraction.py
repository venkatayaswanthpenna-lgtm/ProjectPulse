import os
import json
import google.generativeai as genai
from typing import List, Dict, Any

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

if GEMINI_API_KEY and GEMINI_API_KEY != 'your_gemini_api_key_here':
    genai.configure(api_key=GEMINI_API_KEY)

def extract_events_from_text(text: str) -> List[Dict[str, Any]]:
    """
    Extracts structured events from messy daily progress report text.
    """
    if not GEMINI_API_KEY or GEMINI_API_KEY == 'your_gemini_api_key_here':
        return _mock_extraction(text)

    prompt = f"""
    You are an AI assistant for a construction project manager. 
    Extract the activities mentioned in the following Daily Progress Report snippet.
    Return ONLY a JSON array of objects, where each object has:
    - "description": string (the core activity)
    - "discipline": string (e.g., Civil, Mechanical, Electrical, Structural - infer if possible, or null)
    - "location": string (e.g., Zone A, Floor 2, or null)
    - "status": string (e.g., In Progress, Completed, Delayed, Not Started)

    Report Snippet:
    {text}
    """
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        # Parse JSON from response
        # Sometimes the model wraps it in markdown `json ... `
        content = response.text.strip()
        if content.startswith('`json'):
            content = content[7:-3]
        elif content.startswith('`'):
            content = content[3:-3]
            
        return json.loads(content.strip())
    except Exception as e:
        print(f"AI Extraction failed: {e}")
        return _mock_extraction(text)

def _mock_extraction(text: str) -> List[Dict[str, Any]]:
    # A realistic fallback for the demo
    text_lower = text.lower()
    events = []
    if "rebar" in text_lower or "foundation" in text_lower:
        events.append({
            "description": "Tying rebar for main raft foundation",
            "discipline": "Civil",
            "location": "Zone A",
            "status": "In Progress"
        })
    if "concrete" in text_lower or "pour" in text_lower:
        events.append({
            "description": "Pouring concrete for columns",
            "discipline": "Civil",
            "location": "Level 1",
            "status": "Completed"
        })
    if "excavation" in text_lower:
        events.append({
            "description": "Trench excavation for drainage",
            "discipline": "Civil",
            "location": "North Sector",
            "status": "In Progress"
        })
    if not events:
         events.append({
            "description": text[:50],
            "discipline": "General",
            "location": "Site",
            "status": "In Progress"
        })
    return events
