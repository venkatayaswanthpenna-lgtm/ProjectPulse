import os
import google.generativeai as genai
import numpy as np
from typing import List

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

if GEMINI_API_KEY and GEMINI_API_KEY != 'your_gemini_api_key_here':
    genai.configure(api_key=GEMINI_API_KEY)

def get_embedding(text: str) -> List[float]:
    """
    Gets a 768-dimensional embedding for a text string.
    """
    if not GEMINI_API_KEY or GEMINI_API_KEY == 'your_gemini_api_key_here':
        return _mock_embedding(text)
        
    try:
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=text,
            task_type="semantic_similarity"
        )
        return result['embedding']
    except Exception as e:
        print(f"AI Embedding failed: {e}")
        return _mock_embedding(text)

def _mock_embedding(text: str) -> List[float]:
    # Generate a deterministic pseudo-random embedding based on text hash
    import hashlib
    hash_val = int(hashlib.md5(text.encode()).hexdigest(), 16)
    np.random.seed(hash_val % (2**32 - 1))
    vec = np.random.randn(768)
    vec = vec / np.linalg.norm(vec)
    return vec.tolist()

