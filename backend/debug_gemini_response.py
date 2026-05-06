#!/usr/bin/env python3
"""
Debug script to test Gemini response with custom criteria
This helps identify why certain fields might be missing from the response
"""
import os
import sys
import json
import asyncio
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

async def test_with_custom_criteria():
    """Test Gemini with custom evaluation criteria"""
    
    # Configure API
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("❌ No API key found")
        sys.exit(1)
    
    genai.configure(api_key=api_key)
    
    # Load the schema
    schema_path = "backend/schema.json"
    with open(schema_path, 'r') as f:
        schema_dict = json.load(f)
    
    # Create sample custom criteria (similar to what your app does)
    custom_criteria = {
        "overallComplianceScore": "number (0-100)",
        "criteriaBreakdown": {
            "technicalFeasibility": {
                "score": "number (0-100)",
                "weight": 0.30,
                "findings": "string",
                "detailedReasoning": "string - Technical analysis",
                "evidence": [
                    {
                        "quote": "string (VERBATIM quote)",
                        "pageLocation": "string"
                    }
                ],
                "met": "boolean"
            },
            "financialViability": {
                "score": "number (0-100)",
                "weight": 0.40,
                "findings": "string",
                "detailedReasoning": "string - Financial analysis",
                "evidence": [
                    {
                        "quote": "string (VERBATIM quote)",
                        "pageLocation": "string"
                    }
                ],
                "met": "boolean"
            },
            "implementationPlan": {
                "score": "number (0-100)",
                "weight": 0.30,
                "findings": "string",
                "detailedReasoning": "string - Implementation analysis",
                "evidence": [
                    {
                        "quote": "string (VERBATIM quote)",
                        "pageLocation": "string"
                    }
                ],
                "met": "boolean"
            }
        }
    }
    
    # Replace evaluationCriteria
    schema_dict["evaluationCriteria"] = custom_criteria
    schema_content = json.dumps(schema_dict, indent=2)
    
    print("=" * 80)
    print("TESTING GEMINI WITH CUSTOM CRITERIA")
    print("=" * 80)
    print()
    print("Custom Criteria Structure:")
    print(json.dumps(custom_criteria, indent=2))
    print()
    print("=" * 80)
    print()
    
    # Create a simple test prompt
    test_prompt = f"""You are testing a JSON schema. Return a MINIMAL valid JSON object that matches this schema.

For this test, use placeholder/dummy data but ensure ALL required fields are present.

CRITICAL REQUIREMENTS:
1. Include ALL top-level fields from the schema
2. Especially include: "recommendation" field (must be one of: "Select", "Shortlist", "Review", "Reject")
3. Include: "overallScore" field (number 0-100)
4. Include: "executiveSummary" field (string)
5. Include all other required fields

Use minimal/dummy data for testing purposes.

SCHEMA:
{schema_content}

Return ONLY the JSON object, no markdown, no extra text."""
    
    print("Sending test prompt to Gemini...")
    print()
    
    try:
        model = genai.GenerativeModel(model_name='models/gemini-2.5-flash-lite')
        response = await asyncio.to_thread(model.generate_content, test_prompt)
        
        print("✅ Got response from Gemini")
        print()
        print("=" * 80)
        print("RAW RESPONSE:")
        print("=" * 80)
        print(response.text[:2000])
        if len(response.text) > 2000:
            print(f"\n... (truncated, total length: {len(response.text)} chars)")
        print()
        print("=" * 80)
        print()
        
        # Try to parse
        response_text = response.text.strip()
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        elif response_text.startswith('```'):
            response_text = response_text[3:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        parsed = json.loads(response_text)
        
        print("✅ Successfully parsed JSON")
        print()
        
        # Check for required fields
        required_keys = [
            "tenderDetails", "executiveSummary", "overallScore", "recommendation",
            "financialAnalysis", "technicalEvaluation", "bidderQualifications",
            "riskAssessment", "inconsistencyDetection", "evaluationCriteria", "smartRecommendations"
        ]
        
        present_keys = [k for k in required_keys if k in parsed]
        missing_keys = [k for k in required_keys if k not in parsed]
        
        print("=" * 80)
        print("FIELD VALIDATION:")
        print("=" * 80)
        print()
        print(f"✅ Present fields ({len(present_keys)}/{len(required_keys)}):")
        for key in present_keys:
            print(f"   ✓ {key}")
        print()
        
        if missing_keys:
            print(f"❌ Missing fields ({len(missing_keys)}):")
            for key in missing_keys:
                print(f"   ✗ {key}")
            print()
        else:
            print("✅ All required fields present!")
            print()
        
        # Check specific fields
        print("=" * 80)
        print("SPECIFIC FIELD VALUES:")
        print("=" * 80)
        print()
        print(f"overallScore: {parsed.get('overallScore', 'MISSING')}")
        print(f"recommendation: {parsed.get('recommendation', 'MISSING')}")
        print(f"executiveSummary: {parsed.get('executiveSummary', 'MISSING')[:100] if parsed.get('executiveSummary') else 'MISSING'}...")
        print()
        
        if 'evaluationCriteria' in parsed:
            print("evaluationCriteria structure:")
            print(f"  - overallComplianceScore: {parsed['evaluationCriteria'].get('overallComplianceScore', 'MISSING')}")
            if 'criteriaBreakdown' in parsed['evaluationCriteria']:
                print(f"  - criteriaBreakdown keys: {list(parsed['evaluationCriteria']['criteriaBreakdown'].keys())}")
        print()
        
        print("=" * 80)
        print()
        
        if missing_keys:
            print("⚠️  ISSUE IDENTIFIED: Gemini is not returning all required fields")
            print("   This is likely why your analysis is failing.")
            print()
            print("   Possible solutions:")
            print("   1. Make the prompt more explicit about required fields")
            print("   2. Add examples of the expected output structure")
            print("   3. Use a different model (try gemini-2.5-flash or gemini-2.5-pro)")
            print("   4. Simplify the schema or split into multiple requests")
        else:
            print("✅ SUCCESS: All required fields are present!")
            print("   The schema and prompt are working correctly.")
        
    except json.JSONDecodeError as e:
        print(f"❌ JSON parsing failed: {e}")
        print(f"   Response might not be valid JSON")
    except Exception as e:
        print(f"❌ Error: {e}")
        print(f"   Type: {type(e).__name__}")


if __name__ == "__main__":
    asyncio.run(test_with_custom_criteria())
