# Razorpay Setup Guide for Supabase Edge Functions

## Problem
The "Unauthorized" error appears when clicking the buy plan button because Razorpay API keys are not configured in Supabase Edge Functions environment variables.

## Solution

### Step 1: Set Razorpay Keys as Supabase Secrets

You need to add your Razorpay keys to Supabase Edge Functions secrets. There are two ways:

#### Option A: Using Supabase CLI (Recommended)

1. **For Local Development:**
   ```bash
   # Create .env.local file in supabase directory
   cd supabase
   echo "RAZORPAY_KEY_ID=rzp_test_SnIZxBLLUdHiyO" > .env.local
   echo "RAZORPAY_KEY_SECRET=11xhkzuwUsByIt1ZkOV8Exzr" >> .env.local
   ```

   Or manually create `supabase/.env.local`:
   ```
   RAZORPAY_KEY_ID=rzp_test_SnIZxBLLUdHiyO
   RAZORPAY_KEY_SECRET=11xhkzuwUsByIt1ZkOV8Exzr
   ```

2. **For Production (Supabase Cloud):**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Go to **Settings** → **Edge Functions**
   - Click **Secrets**
   - Add new secrets:
     - Key: `RAZORPAY_KEY_ID` → Value: `rzp_test_SnIZxBLLUdHiyO`
     - Key: `RAZORPAY_KEY_SECRET` → Value: `11xhkzuwUsByIt1ZkOV8Exzr`
   - Click **Save**

#### Option B: Using Supabase CLI Commands

```bash
supabase secrets set RAZORPAY_KEY_ID=rzp_test_SnIZxBLLUdHiyO --project-ref YOUR_PROJECT_REF
supabase secrets set RAZORPAY_KEY_SECRET=11xhkzuwUsByIt1ZkOV8Exzr --project-ref YOUR_PROJECT_REF
```

### Step 2: Restart Your Services

**For Local Development:**
```bash
supabase stop
supabase start
```

**For Production:**
- Secrets are applied immediately, no restart needed

### Step 3: Test the Payment Flow

1. Navigate to the pricing page in your app
2. Click on "Upgrade to Pro" or "Upgrade to Elite"
3. You should see the Razorpay payment dialog instead of "Unauthorized" error

## Verification

Check if the keys are properly loaded by looking at the browser console when clicking the buy button. The payment flow should proceed without errors.

## Troubleshooting

**Still getting "Unauthorized"?**
- Clear your browser cache (Cmd+Shift+Delete on Mac)
- Ensure the edge function has access to the secrets
- Check Supabase logs for detailed error messages

**Wrong Keys?**
- If you used test keys accidentally in production, update the secrets immediately
- For live payments, use your production Razorpay keys (rzp_live_*)

## Security Note
⚠️ **Never commit .env.local or expose your Razorpay Secret Key in your code!**
