# 🌍 Environment Setup Guide

## 🚀 **Current Status: Working with Mock Data**

Your `/classes` page is now working with **mock tag data** so you can see the UI in action immediately!

## 🔧 **When You're Ready for Supabase:**

### **Step 1: Create `.env.local` file**
```bash
# In your tumbo-subframe directory
touch .env.local
```

### **Step 2: Add Supabase credentials**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Step 3: Get Supabase credentials**
1. Go to [supabase.com](https://supabase.com)
2. Create/select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **Step 4: Enable Supabase integration**
1. **Uncomment** these lines in `src/app/classes/page.tsx`:
   ```typescript
   import { getCategoryTags, getTagsByType, searchClasses } from "@/lib/supabase/tags";
   import { Tag, TagType, TAG_TYPES } from "@/lib/types/tags";
   ```

2. **Uncomment** this line in `src/components/ui/tag-badge.tsx`:
   ```typescript
   import { Tag, TagType, getTagColor, getTagDisplayName } from "@/lib/types/tags";
   ```

3. **Replace mock data** with real Supabase calls in the `useEffect`

## 🎯 **What You'll Get:**

- **Real-time tag data** from your database
- **Dynamic filtering** based on actual class tags
- **Search functionality** across all tag types
- **Professional tag management** system

## 🚫 **For Now:**

- ✅ **UI works perfectly** with mock data
- ✅ **All tag functionality** is visible
- ✅ **Color-coded system** is active
- ✅ **Interactive elements** are functional

**Your tag system is ready to go live as soon as you set up Supabase!** 🎉
