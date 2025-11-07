# 🪣 Supabase Storage Bucket Setup

## Critical: Images Not Displaying?

If images show "Loading..." but never appear, you need to configure your Supabase storage bucket properly.

---

## ✅ Step-by-Step Setup

### 1. Create the Storage Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. **Bucket name**: `project-media`
4. **Public bucket**: ✅ **CHECK THIS BOX** (Important!)
5. Click **"Create bucket"**

### 2. Configure Storage Policies

After creating the bucket, you need to add policies for read/write access:

#### Option A: Using the UI (Recommended)

1. Click on the `project-media` bucket
2. Go to **"Policies"** tab
3. Click **"New Policy"**

**Policy 1: Public Read (Required for images to display)**
- **Policy name**: `public_read`
- **Allowed operation**: `SELECT`
- **Target roles**: `public` (or `anon`)
- **USING expression**: `true`
- Click **"Save"**

**Policy 2: Admin Write (Required for uploads)**
- **Policy name**: `admin_write`
- **Allowed operations**: `INSERT`, `UPDATE`, `DELETE`
- **Target roles**: `authenticated`
- **USING expression**: 
  ```sql
  (auth.jwt() -> 'user_metadata' ->> 'role'::text) = 'admin'::text
  ```
- **WITH CHECK expression**: (same as above)
  ```sql
  (auth.jwt() -> 'user_metadata' ->> 'role'::text) = 'admin'::text
  ```
- Click **"Save"**

#### Option B: Using SQL

Go to **SQL Editor** and run:

```sql
-- Enable public read access
CREATE POLICY "public_read"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'project-media' );

-- Enable admin write access
CREATE POLICY "admin_write"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-media' 
  AND (auth.jwt() -> 'user_metadata' ->> 'role'::text) = 'admin'::text
);

CREATE POLICY "admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-media' 
  AND (auth.jwt() -> 'user_metadata' ->> 'role'::text) = 'admin'::text
);

CREATE POLICY "admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-media' 
  AND (auth.jwt() -> 'user_metadata' ->> 'role'::text) = 'admin'::text
);
```

### 3. Verify Bucket Configuration

1. Go to **Storage** → `project-media`
2. Check that:
   - ✅ Bucket is **public**
   - ✅ At least 2 policies exist (read + write)
   - ✅ Public read policy has `true` as USING expression

---

## 🧪 Test Image Upload

1. Go to `/admin` in your app
2. Click **"🖼️ Images"** on any project
3. Click **"📤 Upload images"**
4. Select an image file
5. Check browser console for errors

**Expected behavior:**
- Upload succeeds (no errors)
- Image appears in the grid with preview
- Image displays on public project card

**If upload fails:**
- Check that your user has `role: "admin"` in user_metadata
- Verify storage policies are correct
- Check browser console for specific error messages

---

## 🔍 Debugging Image Display Issues

### Issue: Images show "Loading..." forever

**Cause**: Storage bucket doesn't have public read access

**Fix**: 
1. Go to Storage → `project-media` → Policies
2. Ensure `public_read` policy exists with `true` USING expression
3. If bucket is private, make it public or add proper policies

### Issue: Images upload but don't display

**Cause**: Signed URL generation is failing

**Check**:
1. Open browser DevTools → Console
2. Look for errors like:
   - `"The resource you requested could not be found"`
   - `"403 Forbidden"`
   - `"Invalid bucket"`

**Fix**:
- Verify bucket name is exactly `project-media` (case-sensitive)
- Check that files exist in Storage → `project-media` → `projects/`
- Ensure public read policy is active

### Issue: 403 Forbidden on image URLs

**Cause**: Bucket is private or missing read policy

**Fix**:
1. Make bucket public OR
2. Add public read policy (see above)

### Issue: Images display in admin but not on public page

**Cause**: Signed URLs expired or not being generated

**Fix**:
- Check that `getSignedUrls()` is being called in `ProjectCard.tsx`
- Verify signed URLs are being logged in console
- Ensure URLs have `?token=` parameter

---

## 📊 Storage Bucket Structure

After uploading images, your bucket should look like:

```
project-media/
└── projects/
    ├── {project-id-1}/
    │   ├── 1730234567890-image1.png
    │   └── 1730234567891-image2.jpg
    └── {project-id-2}/
        └── 1730234567892-screenshot.png
```

Each project gets its own folder with timestamped filenames.

---

## 🔐 Security Notes

- **Public bucket** = Anyone can read files (needed for portfolio images)
- **Admin write** = Only authenticated admins can upload/delete
- **Signed URLs** = Temporary access tokens (1 hour expiry)
- **RLS policies** = Control who can read/write in database

---

## ✅ Final Checklist

Before images will work, ensure:

- [ ] Storage bucket `project-media` exists
- [ ] Bucket is marked as **public**
- [ ] Public read policy exists (`SELECT` for `public` role)
- [ ] Admin write policy exists (for authenticated admins)
- [ ] User has `role: "admin"` in user_metadata
- [ ] `.env.local` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [ ] `project_images` table exists in database
- [ ] RLS policies on `project_images` table are enabled

---

## 🚀 Quick Fix Command

If you want to reset and start fresh, run this in SQL Editor:

```sql
-- Delete all storage policies for project-media
DELETE FROM storage.policies WHERE bucket_id = 'project-media';

-- Recreate public read
CREATE POLICY "public_read"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'project-media' );

-- Recreate admin write
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

**After following these steps, your images should display correctly!** 🎉
