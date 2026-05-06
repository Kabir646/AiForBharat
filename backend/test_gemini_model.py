#!/usr/bin/env python3
"""
Script to test a specific Gemini model with a simple prompt
Usage: python backend/test_gemini_model.py <model_name>
Example: python backend/test_gemini_model.py models/gemini-1.5-flash
"""
import os
import sys
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

def test_model(model_name):
    """Test a specific Gemini model"""
    
    # Get API key from environment
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    
    if not api_key:
        print("❌ Error: No API key found in .env file")
        print("   Please set GEMINI_API_KEY or GOOGLE_API_KEY in your .env file")
        sys.exit(1)
    
    print(f"🔑 Using API key: {api_key[:20]}...")
    print(f"🤖 Testing model: {model_name}")
    print()
    
    # Configure the API
    try:
        genai.configure(api_key=api_key)
        print("✅ API configured successfully")
        print()
    except Exception as e:
        print(f"❌ Failed to configure API: {e}")
        sys.exit(1)
    
    # Test the model
    try:
        print("=" * 80)
        print("🧪 TESTING MODEL WITH SIMPLE PROMPT")
        print("=" * 80)
        print()
        
        # Create model instance
        model = genai.GenerativeModel(model_name=model_name)
        print(f"✅ Model instance created: {model_name}")
        print()
        
        # Test prompt
        test_prompt = "Hello! Please respond with a short message confirming you're working. Also tell me what model you are."
        
        print(f"📝 Sending test prompt: '{test_prompt}'")
        print()
        print("⏳ Waiting for response...")
        print()
        
        # Generate response
        response = model.generate_content(test_prompt)
        
        print("=" * 80)
        print("✅ SUCCESS! Model responded:")
        print("=" * 80)
        print()
        print(response.text)
        print()
        print("=" * 80)
        print()
        
        # Print additional info if available
        if hasattr(response, 'prompt_feedback'):
            print("📊 Prompt Feedback:")
            print(f"   {response.prompt_feedback}")
            print()
        
        if hasattr(response, 'candidates') and response.candidates:
            candidate = response.candidates[0]
            if hasattr(candidate, 'finish_reason'):
                print(f"🏁 Finish Reason: {candidate.finish_reason}")
            if hasattr(candidate, 'safety_ratings'):
                print(f"🛡️  Safety Ratings: {candidate.safety_ratings}")
            print()
        
        print("✅ Model test completed successfully!")
        print()
        print("💡 This model is working and can be used in your application.")
        
    except Exception as e:
        print("=" * 80)
        print("❌ ERROR TESTING MODEL")
        print("=" * 80)
        print()
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print()
        
        # Check for common errors
        if "404" in str(e) or "not found" in str(e).lower():
            print("💡 This model doesn't exist or is not available with your API key.")
            print("   Run 'python backend/list_gemini_models.py' to see available models.")
        elif "429" in str(e) or "quota" in str(e).lower():
            print("💡 You've exceeded your API quota or rate limit.")
            print("   Wait a bit and try again, or check your billing at:")
            print("   https://ai.google.dev/gemini-api/docs/rate-limits")
        elif "403" in str(e) or "permission" in str(e).lower():
            print("💡 Permission denied. Your API key might not have access to this model.")
            print("   Check your API key permissions or try a different model.")
        elif "400" in str(e):
            print("💡 Bad request. The model name might be incorrect.")
            print("   Make sure you're using the full model name (e.g., 'models/gemini-1.5-flash')")
        
        print()
        sys.exit(1)


def main():
    """Main function"""
    
    if len(sys.argv) < 2:
        print("❌ Error: No model name provided")
        print()
        print("Usage: python backend/test_gemini_model.py <model_name>")
        print()
        print("Examples:")
        print("  python backend/test_gemini_model.py models/gemini-1.5-flash")
        print("  python backend/test_gemini_model.py models/gemini-1.5-pro")
        print("  python backend/test_gemini_model.py models/gemini-2.0-flash-exp")
        print()
        print("💡 Run 'python backend/list_gemini_models.py' to see all available models")
        sys.exit(1)
    
    model_name = sys.argv[1]
    
    # If user didn't include 'models/' prefix, add it
    if not model_name.startswith('models/'):
        print(f"⚠️  Note: Adding 'models/' prefix to model name")
        model_name = f'models/{model_name}'
        print(f"   Using: {model_name}")
        print()
    
    test_model(model_name)


if __name__ == "__main__":
    main()
