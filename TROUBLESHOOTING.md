# 🔧 Image Display Troubleshooting

## Issue: Images Not Showing in Admin Panel or Public View

### Quick Diagnostic Steps:

#### 1. **Check Browser Console**
Open DevTools (F12) → Console tab and look for errors:

**Common errors:**
```
❌ "Failed to fetch signed URL"
   → Storage bucket doesn't exist or policies are wrong

❌ "403 Forbidden" 
   → RLS policies blocking access

❌ "404 Not Found"
   → Image path is incorrect or file doesn't exist

❌ "CORS error"
   → Storage bucket CORS not configured
```

#### 2. **Verify Storage Bucket Exists**
1. Go to Supabase Dashboard
2. Click **Storage** in sidebar
3. Check if `project-media` bucket exists
4. If not, create it:
   - Click "New bucket"
   - Name: `project-media`
   - Public: **No** (we use signed URLs)
   - Click "Create bucket"

#### 3. **Check Storage Policies**
In Storage → `project-media` → Policies:

**You need 2 policies:**

**A. Public Read (for signed URLs)**
```sql
-- Policy name: public_read_signed
-- Operation: SELECT
-- Target roles: public
-- USING expression:
true
```

**B. Admin Write**
```sql
-- Policy name: admin_write
-- Operations: INSERT, UPDATE, DELETE
-- Target roles: authenticated
-- USING expression:
(auth.jwt() -> 'user_metadata' ->> 'role'::text) = 'admin'::text

-- WITH CHECK expression:
(auth.jwt() -> 'user_metadata' ->> 'role'::text) = 'admin'::text
```

#### 4. **Verify Database Table**
Run in SQL Editor:
```sql
-- Check if project_images table exists
SELECT * FROM project_images LIMIT 5;

-- Check if your images are in the database
SELECT id, project_id, storage_path, sort 
FROM project_images 
ORDER BY created_at DESC;
```

#### 5. **Check RLS Policies on project_images**
```sql
-- Should show 2 policies
SELECT * FROM pg_policies 
WHERE tablename = 'project_images';
```

Expected output:
- `pi_read_public` - allows public SELECT
- `pi_write_admin_only` - allows admin INSERT/UPDATE/DELETE

#### 6. **Test Signed URL Generation**
Add this to your browser console:
```javascript
// Replace with your actual values
const { createClient } = window.supabase;
const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_ANON_KEY');

// Test signing a URL
const { data, error } = await supabase.storage
  .from('project-media')
  .createSignedUrl('projects/YOUR_PROJECT_ID/test.png', 60);

console.log('Signed URL:', data);
console.log('Error:', error);
```

#### 7. **Verify Image Upload Path**
Images should be stored with this pattern:
```
projects/{projectId}/{timestamp}-{filename}
```

Example:
```
projects/123e4567-e89b-12d3-a456-426614174000/1730000000000-hero.png
```

### Common Fixes:

#### Fix 1: Recreate Storage Bucket
```sql
-- In Supabase SQL Editor
-- This will NOT delete existing files
DROP POLICY IF EXISTS public_read_signed ON storage.objects;
DROP POLICY IF EXISTS admin_write ON storage.objects;

-- Then recreate bucket in UI and add policies
```

#### Fix 2: Reset RLS Policies
```sql
-- Drop existing policies
DROP POLICY IF EXISTS pi_read_public ON project_images;
DROP POLICY IF EXISTS pi_write_admin_only ON project_images;

-- Recreate (run the SQL from supabase-schema.sql)
```

#### Fix 3: Check User Metadata
```sql
-- Verify your user has admin role
SELECT raw_user_meta_data 
FROM auth.users 
WHERE email = 'your@email.com';

-- Should show: {"role": "admin"}
```

### Debug Mode

Add this to `ProjectImagesPanel.tsx` temporarily:

```tsx
// After the load() function
useEffect(() => {
  console.log('Rows:', rows);
  console.log('Signed URLs:', signed);
  console.log('Project ID:', projectId);
}, [rows, signed, projectId]);
```

This will log the state to console so you can see:
- Are rows loading? (should show array of images)
- Are signed URLs being generated? (should show object with paths → URLs)
- Is projectId correct? (should be a UUID)

### Still Not Working?

**Check these:**
1. ✅ `.env.local` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. ✅ Dev server restarted after adding env vars
3. ✅ Browser cache cleared (Ctrl+Shift+R)
4. ✅ No ad blockers blocking Supabase requests
5. ✅ Supabase project is not paused (free tier auto-pauses after 7 days inactivity)

### Get Help

If still stuck, share these in your error report:
1. Browser console errors (screenshot)
2. Network tab showing failed requests
3. Output of: `SELECT * FROM project_images LIMIT 1;`
4. Storage bucket policies screenshot
