# Quick Reference - Gemini & Custom Criteria

## 🚨 Common Issues & Solutions

### Issue 1: "Missing required keys: ['recommendation']"
**Cause:** Gemini not returning all required fields  
**Solution:** ✅ Fixed in `backend/gemini_client.py` - instructions now explicitly require `overallScore` and `recommendation`  
**Test:** `python backend/debug_gemini_response.py`

### Issue 2: "429 Quota exceeded"
**Cause:** Hit daily/per-minute API limits  
**Solution:** Switch to a different model or wait for quota reset  
**Check:** `python backend/check_model_quotas.py`

### Issue 3: "Model not found" or "ngdd44"
**Cause:** Invalid model name or model doesn't exist  
**Solution:** Use `python backend/list_gemini_models.py` to see available models

---

## 📋 Quick Commands

```bash
# List all available Gemini models
python backend/list_gemini_models.py

# Test a specific model
python backend/test_gemini_model.py models/gemini-2.5-flash-lite

# Check quota status for common models
python backend/check_model_quotas.py

# Debug custom criteria response
python backend/debug_gemini_response.py
```

---

## ✅ Currently Working Models

1. **models/gemini-2.5-flash-lite** ⭐ (Currently used in code)
2. **models/gemini-flash-latest**
3. **models/gemini-flash-lite-latest**

---

## 📊 Required JSON Fields

All DPR analysis responses MUST include these 11 fields:

1. ✓ `tenderDetails`
2. ✓ `executiveSummary`
3. ✓ `overallScore` (number 0-100)
4. ✓ `recommendation` ("Select" | "Shortlist" | "Review" | "Reject")
5. ✓ `financialAnalysis`
6. ✓ `technicalEvaluation`
7. ✓ `bidderQualifications`
8. ✓ `riskAssessment`
9. ✓ `inconsistencyDetection`
10. ✓ `evaluationCriteria`
11. ✓ `smartRecommendations`

---

## 🎯 Recommendation Thresholds

```
overallScore >= 80  → "Select"
60 <= overallScore < 80  → "Shortlist"
40 <= overallScore < 60  → "Review"
overallScore < 40  → "Reject"
```

---

## 🔧 Custom Criteria Structure

```json
{
  "overallComplianceScore": "number (0-100)",
  "criteriaBreakdown": {
    "criterionName": {
      "score": "number (0-100)",
      "weight": 0.30,
      "findings": "string",
      "detailedReasoning": "string",
      "evidence": [
        {
          "quote": "string (VERBATIM)",
          "pageLocation": "string"
        }
      ],
      "met": "boolean"
    }
  }
}
```

**⚠️ Important:** Weights must sum to 1.0

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `backend/schema.json` | Default DPR analysis schema |
| `backend/gemini_client.py` | Gemini API integration |
| `backend/app.py` | API endpoints |
| `.env` | API keys and config |

---

## 🔍 Debugging Steps

1. **Check logs** - Look for error messages
2. **Run debug script** - `python backend/debug_gemini_response.py`
3. **Check quota** - `python backend/check_model_quotas.py`
4. **Verify custom criteria** - Must be valid JSON
5. **Try different model** - If current model has issues

---

## 📚 Documentation Files

- **GEMINI_MODELS_SUMMARY.md** - All available models and their status
- **MISSING_RECOMMENDATION_FIX.md** - Detailed fix explanation
- **CUSTOM_CRITERIA_FLOW.md** - Visual flow diagram
- **FIX_SUMMARY.md** - Quick fix summary
- **backend/GEMINI_TESTING_README.md** - Testing scripts guide

---

## 🆘 Emergency Fixes

### If analysis keeps failing:

1. **Check model quota:**
   ```bash
   python backend/check_model_quotas.py
   ```

2. **Switch to different model in `backend/gemini_client.py`:**
   ```python
   # Line ~233, ~362, ~472
   model_name='models/gemini-flash-latest'  # or another available model
   ```

3. **Simplify custom criteria:**
   - Reduce number of criteria
   - Simplify descriptions
   - Ensure weights sum to 1.0

4. **Check API key:**
   - Verify in `.env` file
   - Check at https://aistudio.google.com/apikey

---

## 💡 Tips

- ✅ Use `gemini-2.5-flash-lite` for better quota availability
- ✅ Test with debug script before deploying changes
- ✅ Keep custom criteria simple and clear
- ✅ Monitor API usage at https://ai.dev/rate-limit
- ✅ Weights in custom criteria must sum to 1.0
- ✅ Always include `detailedReasoning` in custom criteria

---

**Last Updated:** May 6, 2026  
**Status:** ✅ All issues resolved
