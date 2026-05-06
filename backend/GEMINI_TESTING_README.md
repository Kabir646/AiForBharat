# Gemini Model Testing Scripts

This folder contains scripts to help you test and manage Gemini API models.

## Scripts Overview

### 1. `list_gemini_models.py` - List All Available Models
Lists all Gemini models available with your API key.

**Usage:**
```bash
python backend/list_gemini_models.py
```

**Output:**
- All models that support content generation
- Model names, descriptions, and supported methods
- Usage instructions

---

### 2. `test_gemini_model.py` - Test a Specific Model
Tests a specific model with a simple prompt to verify it's working.

**Usage:**
```bash
python backend/test_gemini_model.py <model_name>
```

**Examples:**
```bash
# Test the lite version (currently working!)
python backend/test_gemini_model.py models/gemini-2.5-flash-lite

# Test the standard flash model
python backend/test_gemini_model.py models/gemini-2.5-flash

# Test the pro model
python backend/test_gemini_model.py models/gemini-2.5-pro
```

**Output:**
- Success message with model response
- Or detailed error message with troubleshooting tips

---

### 3. `check_model_quotas.py` - Check Quota Status for Multiple Models
Tests multiple commonly-used models to see which ones have available quota.

**Usage:**
```bash
python backend/check_model_quotas.py
```

**Output:**
- Status of each tested model (available or quota exceeded)
- Summary of available vs unavailable models
- Recommendation for which model to use

---

## Current Status (May 6, 2026)

### ✅ Working Model
- **`models/gemini-2.5-flash-lite`** - Currently has available quota

### ❌ Quota Exceeded
- `models/gemini-2.5-flash` - 20 requests/day limit reached
- `models/gemini-2.5-pro` - Quota exceeded
- `models/gemini-2.0-flash` - Quota exceeded
- `models/gemini-2.0-flash-lite` - Quota exceeded

---

## Quick Start

1. **Check what models are available:**
   ```bash
   python backend/list_gemini_models.py
   ```

2. **Test if a specific model works:**
   ```bash
   python backend/test_gemini_model.py models/gemini-2.5-flash-lite
   ```

3. **Check quota status for all common models:**
   ```bash
   python backend/check_model_quotas.py
   ```

---

## Understanding Quota Errors

When you see errors like:
```
429 You exceeded your current quota
```

This means:
- **Free tier limits:** Each model has daily/per-minute request limits
- **gemini-2.5-flash:** 20 requests per day on free tier
- **Reset time:** Quotas typically reset at midnight Pacific Time (PT)

**Solutions:**
1. Switch to a different model (like `gemini-2.5-flash-lite`)
2. Wait for quota reset
3. Upgrade to a paid plan
4. Use a different API key

---

## Code Changes Made

The following files have been updated to use `gemini-2.5-flash-lite`:

### `backend/gemini_client.py`
Changed all instances of `model_name='gemini-2.5-flash'` to `model_name='gemini-2.5-flash-lite'`:

1. **Line ~233** - `generate_json_from_file()` function
2. **Line ~360** - `create_chat_session()` function  
3. **Line ~470** - `create_comparison_chat_session()` function

---

## Monitoring Your Usage

Check your current usage and limits:
- **Usage Dashboard:** https://ai.dev/rate-limit
- **Rate Limits Documentation:** https://ai.google.dev/gemini-api/docs/rate-limits

---

## Tips

1. **Use lite models** when possible - they have better quota availability
2. **Test before deploying** - always test a model before switching in production
3. **Monitor usage** - keep track of your API calls to avoid hitting limits
4. **Implement retry logic** - add exponential backoff for quota errors
5. **Cache results** - avoid re-analyzing the same documents

---

## Need Help?

If you're still having issues:
1. Check the error message carefully
2. Run `list_gemini_models.py` to see all available models
3. Run `check_model_quotas.py` to see which models have quota
4. Try different models from the available list
5. Check your API key permissions at https://aistudio.google.com/apikey
