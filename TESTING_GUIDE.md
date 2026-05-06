# Testing Guide for Authentication Fix

## Prerequisites
1. Backend is running on `http://localhost:8000`
2. Frontend is running on `http://localhost:5173`
3. Environment variables are configured:
   - Backend `.env` has `HACKATHON_ACCESS_TOKEN="hackathon_demo_token_123"`
   - Frontend `frontend/.env.local` has `VITE_HACKATHON_ACCESS_TOKEN="hackathon_demo_token_123"`

## Test Cases

### 1. Test Compliance Weights (Primary Issue)
**Steps:**
1. Navigate to a project detail page
2. Click on "Set Compliance Weights" or similar button
3. Modify the weight sliders
4. Click "Save Weights" or "Save & Recalculate All DPRs"

**Expected Result:**
- ✅ Weights should save successfully
- ✅ Success message should appear
- ✅ No 401 Unauthorized errors in browser console or backend logs

**Previous Behavior:**
- ❌ 401 Unauthorized error
- ❌ Weights not saved

### 2. Test Project List
**Steps:**
1. Navigate to projects page or client dashboard
2. Observe the project list loading

**Expected Result:**
- ✅ Projects load successfully
- ✅ No 401 errors

### 3. Test DPR Analysis
**Steps:**
1. Navigate to a project detail page
2. Click "Analyze" on a pending DPR

**Expected Result:**
- ✅ Analysis starts successfully
- ✅ No 401 errors

### 4. Test Client DPR Upload
**Steps:**
1. Login as a client user
2. Select a project
3. Upload a PDF file

**Expected Result:**
- ✅ Upload succeeds
- ✅ DPR appears in the list
- ✅ No 401 errors

### 5. Test Client DPR Delete
**Steps:**
1. Login as a client user
2. Click delete on one of your DPRs
3. Confirm deletion

**Expected Result:**
- ✅ DPR is deleted successfully
- ✅ No 401 errors

### 6. Test Project Comparison
**Steps:**
1. Navigate to a project with multiple DPRs
2. Click "Compare All DPRs" or view existing comparison

**Expected Result:**
- ✅ Comparison loads or generates successfully
- ✅ No 401 errors

## Verification in Browser DevTools

### Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Perform any of the above actions
4. Click on the API request
5. Check "Request Headers" section

**Expected:**
```
Authorization: Bearer hackathon_demo_token_123
```

### Check Console
- Should see no 401 errors
- Should see successful API responses

## Backend Logs
Monitor the backend terminal for:
- ✅ Successful requests (200 OK)
- ❌ No 401 Unauthorized errors

Example of successful log:
```
INFO:     127.0.0.1:64894 - "PUT /projects/2/compliance-weights HTTP/1.1" 200 OK
```

## Troubleshooting

### If still getting 401 errors:

1. **Check environment variables are loaded:**
   ```bash
   # In frontend directory
   echo $VITE_HACKATHON_ACCESS_TOKEN
   ```

2. **Restart frontend dev server:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Clear browser cache and reload:**
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

4. **Verify token in browser console:**
   ```javascript
   console.log(import.meta.env.VITE_HACKATHON_ACCESS_TOKEN)
   ```

5. **Check backend token matches:**
   - Backend `.env`: `HACKATHON_ACCESS_TOKEN="hackathon_demo_token_123"`
   - Frontend `.env.local`: `VITE_HACKATHON_ACCESS_TOKEN="hackathon_demo_token_123"`
   - Tokens must match exactly!

### If endpoints are still excluded:
Check `backend/app.py` line ~175 in the `TokenAuthMiddleware` to see which paths are excluded from authentication.
