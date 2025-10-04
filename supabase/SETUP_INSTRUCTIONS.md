# 🚀 Quick Setup Guide - Supabase API Keys

## ⚡ Two-Step Setup

### Step 1: Create the Table ✅

1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/siaxwbhyahlshwqzvafe/sql
2. Copy and paste: **`supabase/RUN_THIS_FIRST.sql`** ⭐
3. Click **Run**
4. You should see: "Table created successfully! | row_count: 0"

### Step 2: Insert Your Keys ✅

1. In the same SQL Editor
2. Copy and paste: **`supabase/QUICK_INSERT_KEYS.sql`** ⭐
3. Click **Run**
4. You should see: 9 rows with your API keys

---

## 🎯 The Order Matters!

```
1️⃣ RUN_THIS_FIRST.sql   → Creates table
2️⃣ QUICK_INSERT_KEYS.sql → Adds your keys
```

**You tried to insert keys before creating the table - that's why you got the error!** 

---

## ✅ After Both Scripts Run

Add service role key to your environment:

```bash
# .env.local
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Get it from: Supabase Dashboard → Settings → API → service_role key

---

## 🧪 Test

```bash
npm run dev
```

Visit http://localhost:9002

---

**That's it! Run RUN_THIS_FIRST.sql now, then QUICK_INSERT_KEYS.sql** 🚀
