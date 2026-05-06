#!/usr/bin/env python3
"""
Script to list all available Gemini models using the API key from .env
"""
import os
import sys
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

def list_available_models():
    """List all available Gemini models"""
    
    # Get API key from environment
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    
    if not api_key:
        print("❌ Error: No API key found in .env file")
        print("   Please set GEMINI_API_KEY or GOOGLE_API_KEY in your .env file")
        sys.exit(1)
    
    print(f"🔑 Using API key: {api_key[:20]}...")
    print()
    
    # Configure the API
    try:
        genai.configure(api_key=api_key)
        print("✅ API configured successfully")
        print()
    except Exception as e:
        print(f"❌ Failed to configure API: {e}")
        sys.exit(1)
    
    # List all models
    try:
        print("📋 Fetching available models...")
        print("=" * 80)
        print()
        
        models = genai.list_models()
        
        generation_models = []
        other_models = []
        
        for model in models:
            model_info = {
                'name': model.name,
                'display_name': model.display_name if hasattr(model, 'display_name') else 'N/A',
                'description': model.description if hasattr(model, 'description') else 'N/A',
                'supported_methods': model.supported_generation_methods if hasattr(model, 'supported_generation_methods') else []
            }
            
            # Check if model supports content generation
            if 'generateContent' in model_info['supported_methods']:
                generation_models.append(model_info)
            else:
                other_models.append(model_info)
        
        # Print generation models (the ones you can use)
        print("🚀 MODELS THAT SUPPORT CONTENT GENERATION (Use these!):")
        print("=" * 80)
        
        if generation_models:
            for i, model in enumerate(generation_models, 1):
                print(f"\n{i}. Model Name: {model['name']}")
                print(f"   Display Name: {model['display_name']}")
                print(f"   Description: {model['description'][:100]}..." if len(model['description']) > 100 else f"   Description: {model['description']}")
                print(f"   Supported Methods: {', '.join(model['supported_methods'])}")
        else:
            print("   No generation models found")
        
        print("\n" + "=" * 80)
        print(f"\n✅ Found {len(generation_models)} models that support content generation")
        
        # Print other models
        if other_models:
            print("\n" + "=" * 80)
            print("\n📦 OTHER MODELS (Limited functionality):")
            print("=" * 80)
            
            for i, model in enumerate(other_models, 1):
                print(f"\n{i}. Model Name: {model['name']}")
                print(f"   Display Name: {model['display_name']}")
                print(f"   Supported Methods: {', '.join(model['supported_methods'])}")
        
        # Print usage instructions
        print("\n" + "=" * 80)
        print("\n💡 HOW TO USE THESE MODELS:")
        print("=" * 80)
        print("\n1. Copy the 'Model Name' (e.g., 'models/gemini-1.5-flash')")
        print("2. Use it in your code like this:")
        print("   model = genai.GenerativeModel(model_name='models/gemini-1.5-flash')")
        print("\n3. Or test it with the test_gemini_model.py script:")
        print("   python backend/test_gemini_model.py models/gemini-1.5-flash")
        
        print("\n" + "=" * 80)
        
    except Exception as e:
        print(f"❌ Error listing models: {e}")
        print(f"   Error type: {type(e).__name__}")
        print(f"   Full error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    list_available_models()
