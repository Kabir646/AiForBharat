# Custom Evaluation Criteria Flow

## Overview

This document explains how custom evaluation criteria works in your DPR analysis system.

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. ADMIN SETS CUSTOM CRITERIA                                   │
│    POST /projects/{project_id}/set-custom-criteria              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. CRITERIA SAVED TO DATABASE                                   │
│    projects.custom_criteria = {                                 │
│      "overallComplianceScore": "number (0-100)",                │
│      "criteriaBreakdown": {                                     │
│        "criterion1": { score, weight, findings, ... },          │
│        "criterion2": { score, weight, findings, ... },          │
│        ...                                                       │
│      }                                                           │
│    }                                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. USER UPLOADS DPR                                             │
│    POST /projects/{project_id}/upload                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. CODE RETRIEVES CUSTOM CRITERIA                               │
│    project = db.get_project(project_id)                         │
│    custom_criteria = project['custom_criteria']                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. SCHEMA MODIFICATION (gemini_client.py line 79)               │
│    schema_dict = json.load(schema.json)                         │
│    if custom_criteria:                                          │
│        schema_dict["evaluationCriteria"] = custom_criteria      │
│                                                                  │
│    BEFORE:                          AFTER:                      │
│    ┌──────────────────┐            ┌──────────────────┐        │
│    │ evaluationCriteria│            │ evaluationCriteria│        │
│    ├──────────────────┤            ├──────────────────┤        │
│    │ Default 6 criteria│    →      │ Custom 3 criteria│        │
│    │ (from schema.json)│            │ (from database)  │        │
│    └──────────────────┘            └──────────────────┘        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. GEMINI RECEIVES MODIFIED SCHEMA                              │
│    generate_json_from_file(file_ref, schema_path, custom_criteria)│
│                                                                  │
│    System Instruction includes:                                 │
│    ✓ "Score each criterion in evaluationCriteria"               │
│    ✓ "Calculate overallScore (REQUIRED)"                        │
│    ✓ "Provide recommendation (REQUIRED)"                        │
│    ✓ "Recommendation thresholds: 80+=Select, 60-80=Shortlist..."│
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. GEMINI ANALYZES DPR                                          │
│    - Reads PDF content                                          │
│    - Scores each custom criterion                               │
│    - Calculates overallScore (weighted sum)                     │
│    - Determines recommendation based on score                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. GEMINI RETURNS JSON                                          │
│    {                                                             │
│      "tenderDetails": { ... },                                  │
│      "executiveSummary": "...",                                 │
│      "overallScore": 85,              ← REQUIRED                │
│      "recommendation": "Shortlist",   ← REQUIRED                │
│      "financialAnalysis": { ... },                              │
│      "technicalEvaluation": { ... },                            │
│      "bidderQualifications": { ... },                           │
│      "riskAssessment": [ ... ],                                 │
│      "inconsistencyDetection": { ... },                         │
│      "evaluationCriteria": {          ← Custom criteria scored  │
│        "overallComplianceScore": 88,                            │
│        "criteriaBreakdown": {                                   │
│          "criterion1": { score: 90, weight: 0.3, ... },         │
│          "criterion2": { score: 85, weight: 0.4, ... },         │
│          "criterion3": { score: 88, weight: 0.3, ... }          │
│        }                                                         │
│      },                                                          │
│      "smartRecommendations": { ... }                            │
│    }                                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9. VALIDATION (gemini_client.py line 325)                       │
│    Required keys check:                                         │
│    ✓ tenderDetails                                              │
│    ✓ executiveSummary                                           │
│    ✓ overallScore                                               │
│    ✓ recommendation                                             │
│    ✓ financialAnalysis                                          │
│    ✓ technicalEvaluation                                        │
│    ✓ bidderQualifications                                       │
│    ✓ riskAssessment                                             │
│    ✓ inconsistencyDetection                                     │
│    ✓ evaluationCriteria                                         │
│    ✓ smartRecommendations                                       │
│                                                                  │
│    If any missing → ValueError with detailed error message      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 10. SAVE TO DATABASE                                            │
│     db.update_dpr_analysis(dpr_id, parsed_json)                 │
│     Status: "analyzed"                                          │
└─────────────────────────────────────────────────────────────────┘
```

## Key Points

### 1. Schema Replacement
- **Default schema** has 6 evaluation criteria (from `schema.json`)
- **Custom criteria** replaces the entire `evaluationCriteria` object
- **Other fields** remain unchanged (tenderDetails, recommendation, etc.)

### 2. Required Fields (Always)
These fields are ALWAYS required, regardless of custom criteria:
- `tenderDetails`
- `executiveSummary`
- `overallScore` ⚠️
- `recommendation` ⚠️
- `financialAnalysis`
- `technicalEvaluation`
- `bidderQualifications`
- `riskAssessment`
- `inconsistencyDetection`
- `evaluationCriteria` (structure changes with custom criteria)
- `smartRecommendations`

### 3. The Fix
**Problem:** Instructions said `overallScore` could be left empty
**Solution:** Made it clear that BOTH `overallScore` and `recommendation` are REQUIRED

### 4. Recommendation Logic
```
overallScore >= 80  → "Select"
60 <= overallScore < 80  → "Shortlist"
40 <= overallScore < 60  → "Review"
overallScore < 40  → "Reject"
```

## Example Custom Criteria

```json
{
  "overallComplianceScore": "number (0-100)",
  "criteriaBreakdown": {
    "technicalFeasibility": {
      "score": "number (0-100)",
      "weight": 0.30,
      "findings": "string",
      "detailedReasoning": "string - Does the tech stack match requirements?",
      "evidence": [
        {
          "quote": "string (VERBATIM quote from PDF)",
          "pageLocation": "string (e.g., 'Page 15, Section 3.2')"
        }
      ],
      "met": "boolean"
    },
    "financialViability": {
      "score": "number (0-100)",
      "weight": 0.40,
      "findings": "string",
      "detailedReasoning": "string - Is the budget realistic?",
      "evidence": [ ... ],
      "met": "boolean"
    },
    "implementationPlan": {
      "score": "number (0-100)",
      "weight": 0.30,
      "findings": "string",
      "detailedReasoning": "string - Is the timeline achievable?",
      "evidence": [ ... ],
      "met": "boolean"
    }
  }
}
```

**Important:** Weights must sum to 1.0 (e.g., 0.30 + 0.40 + 0.30 = 1.0)

## Debugging

If analysis fails with "Missing required keys":

1. **Check logs** - Shows which keys are missing and present
2. **Run debug script:**
   ```bash
   python backend/debug_gemini_response.py
   ```
3. **Verify custom criteria** - Must be valid JSON with correct structure
4. **Check weights** - Must sum to 1.0

## Code Locations

- **Schema file:** `backend/schema.json`
- **Schema modification:** `backend/gemini_client.py` line 79
- **Gemini call:** `backend/gemini_client.py` line 87
- **Validation:** `backend/gemini_client.py` line 325
- **Custom criteria endpoint:** `backend/app.py` line 809
- **Upload with analysis:** `backend/app.py` line 84

## Testing

```bash
# Test if Gemini returns all required fields
python backend/debug_gemini_response.py

# List available models
python backend/list_gemini_models.py

# Test a specific model
python backend/test_gemini_model.py models/gemini-2.5-flash-lite

# Check quota status
python backend/check_model_quotas.py
```

---

**Status:** ✅ Working correctly
**Last Updated:** May 6, 2026
