# 🔧 Image Display Troubleshooting Guide

## Problem: Images Not Displaying

If you see "Loading..." in the admin panel or project cards but images never appear, follow this guide.

---

## ✅ Quick Checklist

Work through these steps in order:

### 1. Verify Supabase Storage Bucket Exists

**Go to**: Supabase Dashboard → **Storage**

**Check**:
- [ ] Bucket named `project-media` exists
- [ ] Bucket is marked as **Public** (toggle should be ON)

**If bucket doesn't exist**:
1. Click **"New bucket"**
2. Name: `project-media`
3. **✅ Check "Public bucket"**
4. Click "Create"

---

### 2. Configure Storage Policies

**Go to**: Storage → `project-media` → **Policies** tab

**You need 2 policies minimum**:

#### Policy 1: Public Read (CRITICAL)
```
Name: public_read
Operation: SELECT
Target roles: public (or anon)
USING expression: true
```

#### Policy 2: Admin Write
```
Name: admin_write
Operations: INSERT, UPDATE, DELETE
Target roles: authenticated
USING expression: (auth.jwt() -> 'user_metadata' ->> 'role'::text) = 'admin'::text
WITH CHECK: (auth.jwt() -> 'user_metadata' ->> 'role'::text) = 'admin'::text
```

**To add policies via SQL** (easier):

Go to **SQL Editor** and run:

```sql
-- Public read (required for images to show)
CREATE POLICY "public_read"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'project-media' );

-- Admin write (required for uploads)
CREATE POLICY "admin_write"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'project-media' 
  AND (auth.jwt() -> 'user_metadata' ->> 'role'::text) = 'admin'::text
)
WITH CHECK (
  bucket_id = 'project-media' 
  AND (auth.jwt() -> 'user_metadata' ->> 'role'::text) = 'admin'::text
);
```

---

### 3. Verify Database Table & Policies

**Go to**: Table Editor → `project_images`

**Check**:
- [ ] Table exists
- [ ] Has columns: `id`, `project_id`, `storage_path`, `alt`, `sort`
- [ ] RLS is enabled (shield icon should be ON)

**Go to**: SQL Editor and run:

```sql
-- Check if table exists and has data
SELECT * FROM project_images LIMIT 5;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'project_images';
```

**If table doesn't exist**, run the schema from `supabase-schema.sql`:

```sql
create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  storage_path text not null,
  alt text,
  sort int default 0,
  created_at timestamptz default now()
);

alter table public.project_images enable row level security;

create policy "pi_read_public"
on public.project_images for select to public using (true);

create policy "pi_write_admin_only"
on public.project_images for all to authenticated
using ( auth.jwt()->'user_metadata'->>'role' = 'admin' )
with check ( auth.jwt()->'user_metadata'->>'role' = 'admin' );
```

---

### 4. Check User Admin Role

**Go to**: Authentication → **Users** → Click your user

**Check User Metadata**:
```json
{
  "role": "admin"
}
```

**If missing**:
1. Click "Edit user"
2. Scroll to **User Metadata**
3. Add: `{ "role": "admin" }`
4. Save
5. **Sign out and sign back in** (important!)

---

### 5. Verify Environment Variables

**Check `.env.local` file**:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJI...
```

**Get these from**: Supabase Dashboard → Settings → **API**

**After updating `.env.local`**:
1. Stop dev server (Ctrl+C)
2. Restart: `npm run dev`

---

### 6. Test Image Upload

1. Go to `/admin`
2. Sign in
3. Click **"🖼️ Images"** on any project
4. Click **"📤 Upload images"**
5. Select a test image
6. **Open browser DevTools** (F12) → **Console** tab

**Expected console output**:
```
Signing URLs for paths: ['projects/abc-123/1730234567890-test.png']
Signed URLs: [{path: '...', url: 'https://...?token=...'}]
```

**If you see errors**:
- `"The resource you requested could not be found"` → Storage path is wrong
- `"403 Forbidden"` → Missing storage policies
- `"Invalid bucket"` → Bucket doesn't exist or wrong name
- `"RLS policy violation"` → User not admin or table policies missing

---

## 🔍 Common Issues & Fixes

### Issue: "Loading..." forever in admin panel

**Cause**: Storage bucket doesn't have public read policy

**Fix**:
1. Go to Storage → `project-media` → Policies
2. Add public read policy (see step 2 above)
3. Refresh page

---

### Issue: Images upload but show broken image icon

**Cause**: Signed URLs are invalid or expired

**Fix**:
1. Check browser console for 404/403 errors
2. Verify storage path format: `projects/{project-id}/{timestamp}-{filename}`
3. Check that files exist in Storage → `project-media` → `projects/`

---

### Issue: 403 Forbidden on image URLs

**Cause**: Bucket is private or missing read policy

**Fix**:
1. Make bucket public: Storage → `project-media` → Settings → Toggle "Public"
2. OR add public read policy (see step 2)

---

### Issue: Images work in admin but not on public page

**Cause**: Signed URLs not being generated for public view

**Fix**:
1. Check `ProjectCard.tsx` is calling `getSignedUrls()`
2. Verify `project.project_images` array has data
3. Check console for errors in `useEffect`

---

### Issue: Upload fails with "RLS policy violation"

**Cause**: User doesn't have admin role

**Fix**:
1. Go to Authentication → Users → Your user
2. Add `{ "role": "admin" }` to User Metadata
3. Sign out and sign back in
4. Try upload again

---

### Issue: Images display in viewer but not in project cards

**Cause**: Different signed URL generation logic

**Fix**:
1. Both should use `getSignedUrls()` from `lib/media.ts`
2. Check that `ProjectCard.tsx` has the `useEffect` that fetches signed URLs
3. Verify `project_images` are being loaded with projects query

---

## 🧪 Manual Test

To verify everything works:

1. **Upload test image**:
   - Go to `/admin`
   - Click "🖼️ Images" on a project
   - Upload a small test image
   - Should see preview immediately

2. **Check storage**:
   - Go to Supabase Storage → `project-media` → `projects/`
   - Should see folder with project ID
   - Should see uploaded file inside

3. **Check database**:
   - Go to Table Editor → `project_images`
   - Should see new row with `storage_path` like `projects/{id}/{timestamp}-{file}`

4. **View on public page**:
   - Go to home page (or wherever ProjectsGrid is)
   - Should see image in project card
   - Should auto-advance if multiple images

---

## 📊 Debug Checklist

Run through this checklist and note what fails:

```
Storage Setup:
[ ] Bucket 'project-media' exists
[ ] Bucket is public
[ ] Public read policy exists
[ ] Admin write policy exists

Database Setup:
[ ] Table 'project_images' exists
[ ] RLS is enabled on table
[ ] Public read policy on table
[ ] Admin write policy on table

User Setup:
[ ] User has role: "admin" in metadata
[ ] User is authenticated
[ ] User signed out/in after metadata change

Environment:
[ ] .env.local has correct VITE_SUPABASE_URL
[ ] .env.local has correct VITE_SUPABASE_ANON_KEY
[ ] Dev server restarted after .env changes

Code:
[ ] getSignedUrls() is called in ProjectCard
[ ] project_images are loaded with projects query
[ ] Console shows signed URLs being generated
[ ] No errors in browser console
```

---

## 🚀 Nuclear Option: Complete Reset

If nothing works, reset everything:

```sql
-- 1. Delete all images from storage
-- Go to Storage → project-media → Select all → Delete

-- 2. Clear database
DELETE FROM project_images;

-- 3. Drop and recreate policies
DROP POLICY IF EXISTS "public_read" ON storage.objects;
DROP POLICY IF EXISTS "admin_write" ON storage.objects;
DROP POLICY IF EXISTS "pi_read_public" ON project_images;
DROP POLICY IF EXISTS "pi_write_admin_only" ON project_images;

-- 4. Recreate storage policies
CREATE POLICY "public_read"
ON storage.objects FOR SELECT TO public
USING ( bucket_id = 'project-media' );

CREATE POLICY "admin_write"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'project-media' 
  AND (auth.jwt() -> 'user_metadata' ->> 'role'::text) = 'admin'::text
)
WITH CHECK (
  bucket_id = 'project-media' 
  AND (auth.jwt() -> 'user_metadata' ->> 'role'::text) = 'admin'::text
);

-- 5. Recreate table policies
CREATE POLICY "pi_read_public"
ON project_images FOR SELECT TO public USING (true);

CREATE POLICY "pi_write_admin_only"
ON project_images FOR ALL TO authenticated
USING ( auth.jwt()->'user_metadata'->>'role' = 'admin' )
WITH CHECK ( auth.jwt()->'user_metadata'->>'role' = 'admin' );
```

Then:
1. Sign out
2. Clear browser cache
3. Sign back in
4. Try uploading again

---

## 📞 Still Not Working?

If you've tried everything above and images still don't display:

1. **Check Supabase logs**: Dashboard → Logs → Filter by "storage"
2. **Check browser network tab**: DevTools → Network → Filter by "storage"
3. **Verify API keys**: Settings → API → Copy fresh keys
4. **Check project URL**: Ensure it matches your Supabase project

**Common mistakes**:
- Using wrong Supabase project
- Bucket name typo (case-sensitive!)
- Forgetting to sign out/in after metadata change
- Not restarting dev server after .env change

---

**After following this guide, your images should work!** 🎉
