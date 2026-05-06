#!/usr/bin/env python3
"""
Script to check quota status for multiple Gemini models
This will test each model with a minimal request to see which ones are available
"""
import os
import sys
from dotenv import load_dotenv
import google.generativeai as genai
import time

# Load environment variables
load_dotenv()

# Models to test (most commonly used ones)
MODELS_TO_TEST = [
    'models/gemini-2.5-flash-lite',
    'models/gemini-2.5-flash',
    'models/gemini-2.5-pro',
    'models/gemini-2.0-flash',
    'models/gemini-2.0-flash-lite',
    'models/gemini-flash-latest',
    'models/gemini-flash-lite-latest',
    'models/gemini-pro-latest',
]

def test_model_quota(model_name):
    """Test if a model has available quota"""
    try:
        model = genai.GenerativeModel(model_name=model_name)
        response = model.generate_content("Hi")
        return True, "✅ Available"
    except Exception as e:
        error_str = str(e)
        if "429" in error_str or "quota" in error_str.lower() or "ResourceExhausted" in str(type(e).__name__):
            # Extract quota info if available
            if "limit: 0" in error_str:
                return False, "❌ No quota (limit: 0)"
            elif "limit:" in error_str:
                # Try to extract the limit
                try:
                    limit_start = error_str.find("limit: ") + 7
                    limit_end = error_str.find(",", limit_start)
                    if limit_end == -1:
                        limit_end = error_str.find(" ", limit_start)
                    limit = error_str[limit_start:limit_end].strip()
                    return False, f"❌ Quota exceeded (limit: {limit}/day)"
                except:
                    return False, "❌ Quota exceeded"
            else:
                return False, "❌ Quota exceeded"
        elif "404" in error_str or "not found" in error_str.lower():
            return False, "❌ Model not found"
        elif "403" in error_str or "permission" in error_str.lower():
            return False, "❌ Permission denied"
        else:
            return False, f"❌ Error: {str(e)[:50]}"

def main():
    """Main function"""
    
    # Get API key from environment
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    
    if not api_key:
        print("❌ Error: No API key found in .env file")
        sys.exit(1)
    
    print(f"🔑 Using API key: {api_key[:20]}...")
    print()
    
    # Configure the API
    try:
        genai.configure(api_key=api_key)
        print("✅ API configured successfully")
    except Exception as e:
        print(f"❌ Failed to configure API: {e}")
        sys.exit(1)
    
    print()
    print("=" * 80)
    print("🧪 TESTING MODEL QUOTAS")
    print("=" * 80)
    print()
    print("Testing each model with a minimal request...")
    print("This may take a minute...")
    print()
    
    results = []
    
    for i, model_name in enumerate(MODELS_TO_TEST, 1):
        print(f"[{i}/{len(MODELS_TO_TEST)}] Testing {model_name}...", end=" ", flush=True)
        
        available, status = test_model_quota(model_name)
        results.append((model_name, available, status))
        
        print(status)
        
        # Small delay to avoid rate limiting
        if i < len(MODELS_TO_TEST):
            time.sleep(0.5)
    
    # Print summary
    print()
    print("=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    print()
    
    available_models = [r for r in results if r[1]]
    unavailable_models = [r for r in results if not r[1]]
    
    if available_models:
        print("✅ AVAILABLE MODELS (Use these!):")
        print("-" * 80)
        for model_name, _, status in available_models:
            print(f"  • {model_name}")
        print()
    
    if unavailable_models:
        print("❌ UNAVAILABLE MODELS:")
        print("-" * 80)
        for model_name, _, status in unavailable_models:
            print(f"  • {model_name} - {status}")
        print()
    
    print("=" * 80)
    print()
    
    if available_models:
        print(f"💡 Recommendation: Use {available_models[0][0]}")
        print()
        print("To update your code, change the model_name in backend/gemini_client.py:")
        print(f"  model_name='{available_models[0][0]}'")
    else:
        print("⚠️  No models available. You may need to:")
        print("  1. Wait for quota reset (usually midnight Pacific Time)")
        print("  2. Upgrade to a paid plan")
        print("  3. Use a different API key")
    
    print()


if __name__ == "__main__":
    main()
