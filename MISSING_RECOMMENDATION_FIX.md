# Fix for "Missing required keys: ['recommendation']" Error

## Problem

When analyzing DPRs with custom evaluation criteria, Gemini sometimes fails to include the `recommendation` field in its response, causing the error:

```
✗ Auto-analysis failed for DPR 5: Missing required keys: ['recommendation']
```

## Root Cause

The issue was caused by **confusing instructions** in the prompt sent to Gemini:

### Original Problematic Instruction (Line 261):
```
- overallScore: compute a number 0-100, You may leave it empty, you may just score 
  the evaluation criteria, and the overallScore will be the weighted sum of all the 
  evaluation criterias that we will do ourselves, you just give the score for each 
  criteria in the json.
```

This told Gemini it could **leave `overallScore` empty**, which confused the model. Since `recommendation` is calculated based on `overallScore`, if Gemini thought it could skip `overallScore`, it might also skip `recommendation`.

## What Was Fixed

### 1. **Clarified the overallScore instruction** (gemini_client.py line ~261)

**Before:**
```python
- overallScore: compute a number 0-100, You may leave it empty, you may just score 
  the evaluation criteria, and the overallScore will be the weighted sum of all the 
  evaluation criterias that we will do ourselves, you just give the score for each 
  criteria in the json.
```

**After:**
```python
- overallScore: REQUIRED - compute a weighted sum (0-100) based on the evaluation 
  criteria scores. Use the weights provided in evaluationCriteria.criteriaBreakdown.
- recommendation: REQUIRED - must be exactly one of ["Select", "Shortlist", "Review", 
  "Reject"] based on the overallScore thresholds.
```

### 2. **Added explicit RECOMMENDATION section** in system instruction (line ~220)

Added a new section that explicitly tells Gemini:
```
13) **RECOMMENDATION FIELD** (CRITICAL - REQUIRED):
    Based on the calculated overallScore, you MUST provide a recommendation field 
    at the ROOT level of the JSON:
    - If overallScore >= 80 → recommendation = "Select"
    - If 60 <= overallScore < 80 → recommendation = "Shortlist"  
    - If 40 <= overallScore < 60 → recommendation = "Review"
    - If overallScore < 40 → recommendation = "Reject"
    
    This field is MANDATORY and must be included in every response.
```

### 3. **Added critical reminder** in user prompt

Added at the end of the user prompt:
```
CRITICAL: You MUST include ALL required fields in your response, especially 
'overallScore' and 'recommendation'. Do not omit any required fields.
```

### 4. **Improved error logging** (line ~325)

When validation fails, the code now prints:
- Which keys are missing
- Which keys are actually present in the response
- First 1000 characters of the response for debugging

This helps identify exactly what Gemini returned.

### 5. **Added debug logging** for custom criteria (line ~79)

```python
if custom_criteria:
    schema_dict["evaluationCriteria"] = custom_criteria
    print(f"✓ Using custom evaluation criteria with {len(custom_criteria.get('criteriaBreakdown', {}))} criteria")
```

## Files Modified

1. **`backend/gemini_client.py`**
   - Line ~79: Added debug logging for custom criteria
   - Line ~220-240: Added explicit RECOMMENDATION FIELD section
   - Line ~261-275: Clarified instructions for overallScore and recommendation
   - Line ~325-330: Improved error logging

## Testing

### Debug Script Created: `backend/debug_gemini_response.py`

Run this script to test if Gemini is returning all required fields:

```bash
python backend/debug_gemini_response.py
```

This script:
- Creates a test schema with custom criteria
- Sends a minimal test prompt to Gemini
- Validates which fields are present/missing
- Shows the raw response for debugging

### Expected Output:
```
✅ Present fields (11/11):
   ✓ tenderDetails
   ✓ executiveSummary
   ✓ overallScore
   ✓ recommendation
   ✓ financialAnalysis
   ✓ technicalEvaluation
   ✓ bidderQualifications
   ✓ riskAssessment
   ✓ inconsistencyDetection
   ✓ evaluationCriteria
   ✓ smartRecommendations

✅ All required fields present!
```

## How Custom Criteria Works

When you set custom evaluation criteria for a project:

1. **Admin sets criteria** via `/projects/{project_id}/set-custom-criteria` endpoint
2. **Criteria is saved** to database in `projects.custom_criteria` column
3. **Before analysis**, the code retrieves the custom criteria:
   ```python
   custom_criteria = project['custom_criteria']
   ```
4. **Schema is modified** to replace the default `evaluationCriteria`:
   ```python
   schema_dict["evaluationCriteria"] = custom_criteria
   ```
5. **Gemini receives** the modified schema with your custom criteria
6. **Gemini scores** each custom criterion and calculates `overallScore`
7. **Gemini returns** the complete JSON including `recommendation`

## Custom Criteria Structure

Your custom criteria should follow this structure:

```json
{
  "overallComplianceScore": "number (0-100)",
  "criteriaBreakdown": {
    "criterionName1": {
      "score": "number (0-100)",
      "weight": 0.30,
      "findings": "string",
      "detailedReasoning": "string - Description of what to evaluate",
      "evidence": [
        {
          "quote": "string (VERBATIM quote)",
          "pageLocation": "string"
        }
      ],
      "met": "boolean"
    },
    "criterionName2": {
      "score": "number (0-100)",
      "weight": 0.40,
      "findings": "string",
      "detailedReasoning": "string - Description of what to evaluate",
      "evidence": [
        {
          "quote": "string (VERBATIM quote)",
          "pageLocation": "string"
        }
      ],
      "met": "boolean"
    }
    // ... more criteria
  }
}
```

**Important:** The weights should sum to 1.0 (e.g., 0.30 + 0.40 + 0.30 = 1.0)

## Validation

The code validates that these 11 required fields are present:

1. `tenderDetails`
2. `executiveSummary`
3. `overallScore` ⚠️ (was being skipped)
4. `recommendation` ⚠️ (was being skipped)
5. `financialAnalysis`
6. `technicalEvaluation`
7. `bidderQualifications`
8. `riskAssessment`
9. `inconsistencyDetection`
10. `evaluationCriteria`
11. `smartRecommendations`

## If the Error Still Occurs

If you still see the "Missing required keys" error after this fix:

1. **Check the logs** - The improved error logging will show:
   - Which keys are missing
   - Which keys are present
   - First 1000 chars of the response

2. **Run the debug script**:
   ```bash
   python backend/debug_gemini_response.py
   ```

3. **Check your custom criteria** - Make sure it's valid JSON and follows the structure above

4. **Try a different model** - If `gemini-2.5-flash-lite` is having issues, try:
   - `models/gemini-flash-latest`
   - `models/gemini-2.5-flash` (if quota available)
   - `models/gemini-2.5-pro` (if quota available)

5. **Simplify the schema** - If the schema is too complex, Gemini might struggle. Consider:
   - Reducing the number of custom criteria
   - Simplifying the `detailedReasoning` descriptions
   - Breaking the analysis into multiple requests

## Summary

The fix makes the instructions **crystal clear** to Gemini that:
- ✅ `overallScore` is REQUIRED (not optional)
- ✅ `recommendation` is REQUIRED (not optional)
- ✅ Both fields must be calculated and included in every response
- ✅ The exact thresholds for recommendation values are specified

This should resolve the "Missing required keys: ['recommendation']" error.
