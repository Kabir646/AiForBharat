# Gemini Models Summary

## Current Status (May 6, 2026)

### ✅ Working Models (Quota Available)
- **`models/gemini-2.5-flash-lite`** ✅ WORKING - Use this one!

### ❌ Models with Quota Exceeded
- `models/gemini-2.5-flash` - 20 requests/day limit reached
- `models/gemini-2.5-pro` - Quota exceeded
- `models/gemini-2.0-flash` - Quota exceeded
- `models/gemini-2.0-flash-lite` - Quota exceeded

## All Available Models (32 total)

### Recommended for Production Use:
1. **models/gemini-2.5-flash-lite** ⭐ (Currently working!)
2. models/gemini-2.5-flash (quota exceeded - wait for reset)
3. models/gemini-2.5-pro (quota exceeded - wait for reset)
4. models/gemini-2.0-flash
5. models/gemini-2.0-flash-lite

### Latest Versions (Auto-updated):
- models/gemini-flash-latest
- models/gemini-flash-lite-latest
- models/gemini-pro-latest

### Preview/Experimental Models:
- models/gemini-3-pro-preview
- models/gemini-3-flash-preview
- models/gemini-3.1-pro-preview
- models/gemini-3.1-pro-preview-customtools
- models/gemini-3.1-flash-lite-preview

### Specialized Models:
- models/gemini-2.5-flash-preview-tts (Text-to-Speech)
- models/gemini-2.5-pro-preview-tts (Text-to-Speech)
- models/gemini-2.5-flash-image (Image generation)
- models/gemini-3-pro-image-preview (Image generation)
- models/gemini-3.1-flash-image-preview (Image generation)
- models/gemini-2.5-computer-use-preview-10-2025 (Computer use)
- models/gemini-robotics-er-1.5-preview (Robotics)
- models/gemini-robotics-er-1.6-preview (Robotics)

### Deep Research Models:
- models/deep-research-max-preview-04-2026
- models/deep-research-preview-04-2026
- models/deep-research-pro-preview-12-2025

### Gemma Models (Open Source):
- models/gemma-4-26b-a4b-it
- models/gemma-4-31b-it

### Audio/Video Models:
- models/lyria-3-clip-preview (Audio)
- models/lyria-3-pro-preview (Audio)
- models/gemini-3.1-flash-tts-preview (Text-to-Speech)

## Free Tier Quota Limits

Based on the error messages:
- **gemini-2.5-flash**: 20 requests per day
- **gemini-2.5-pro**: Very limited (0 shown in error)
- **gemini-2.0-flash**: Very limited (0 shown in error)
- **gemini-2.5-flash-lite**: ✅ Has available quota

## How to Test Models

### List all available models:
```bash
python backend/list_gemini_models.py
```

### Test a specific model:
```bash
python backend/test_gemini_model.py models/gemini-2.5-flash-lite
```

## Recommendation

**Switch to `models/gemini-2.5-flash-lite`** in your application code. This model:
- ✅ Currently has available quota
- ✅ Is a stable release (not preview)
- ✅ Supports all required features (generateContent, countTokens, etc.)
- ✅ Is optimized for speed and efficiency
- ✅ Should handle your DPR analysis tasks well

## Code Change Required

In `backend/gemini_client.py`, change line 233 from:
```python
model_name='gemini-2.5-flash',
```

To:
```python
model_name='gemini-2.5-flash-lite',
```

## Quota Reset

Free tier quotas typically reset:
- **Daily quotas**: Reset at midnight Pacific Time (PT)
- **Per-minute quotas**: Reset after 60 seconds

Check your usage at: https://ai.dev/rate-limit
