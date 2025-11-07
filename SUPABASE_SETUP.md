# Supabase CRUD Setup Guide

## ✅ Completed Setup

All CRUD infrastructure has been implemented:

### Files Created:
- ✅ `src/lib/supabase.ts` - Supabase client configuration
- ✅ `src/data/projects.ts` - Data layer with Zod validation & CRUD functions
- ✅ `src/components/ProjectsGrid.tsx` - Public projects display
- ✅ `src/admin/AdminRoute.tsx` - Admin authentication guard
- ✅ `src/admin/AdminPanel.tsx` - Admin dashboard with project list
- ✅ `src/admin/ProjectEditor.tsx` - Project CRUD form with image upload
- ✅ `scripts/seed-data.json` - Sample project data
- ✅ `scripts/seed.ts` - Database seeding script
- ✅ `src/main.tsx` - Updated with React Router for `/admin` route

### Dependencies Installed:
- ✅ `@supabase/supabase-js` - Supabase client
- ✅ `zod` - Schema validation
- ✅ `react-hook-form` - Form management
- ✅ `@hookform/resolvers` - Zod integration for forms
- ✅ `react-router-dom` - Routing for admin panel

---

## 🚀 Next Steps

### 1. Update Your .env.local File
Replace the placeholders in `.env.local` with your actual Supabase credentials:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJI...  # Your anon key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...  # For seed script only (DO NOT commit!)
```

Get these from: Supabase Dashboard → Settings → API

### 2. Run Database Schema
In Supabase Dashboard → SQL Editor, run the SQL from `supabase-schema.sql`:
- Creates `project_images` table
- Sets up RLS policies (public read, admin write)
- Configures storage bucket policies

### 3. Seed Your Database
Run the seed script to populate initial projects:

```bash
node --env-file=.env scripts/seed.ts
```

### 4. Set Your User as Admin
In Supabase Dashboard:
1. Go to **Authentication** → **Users**
2. Click on your user account
3. Edit **User Metadata** and add:
   ```json
   { "role": "admin" }
   ```

### 5. Test the Admin Panel
1. Start your dev server: `npm run dev`
2. Navigate to `http://localhost:5173/admin`
3. Sign in with your email (magic link)
4. You should see the admin dashboard

### 6. Integrate ProjectsGrid into Your App
Replace static project displays with the dynamic component:

```tsx
// In App.tsx or wherever you display projects
import ProjectsGrid from "./components/ProjectsGrid";

// Replace static project grid with:
<ProjectsGrid persona="cyber" />  // or "soft", "game", "art"
```

---

## 📋 Security Checklist

- ✅ RLS policies enabled on all tables
- ✅ Public read, admin-only write
- ✅ Signed URLs for images
- ✅ User metadata role check for admin UI
- ✅ All inputs validated with Zod
- ✅ `.env.local` in `.gitignore`
- ✅ Service role key only used in Node scripts (never browser)

---

## 🎯 Usage

### Public View
Projects are automatically fetched from Supabase and displayed based on persona filter with:
- **Auto-advancing image carousel** (4.2s intervals)
- **Chevron navigation** (left/right hover zones)
- **Progress bar** showing current slide
- **Accent-colored tags** and metrics badges

### Admin Panel (`/admin`)
- **Create**: Click "+ New Project" button
- **Read**: View all projects in table
- **Update**: Click "Edit" on any project
- **Delete**: Click "Delete" (with confirmation)
- **Images**: Click "🖼️ Images" to manage project images

### Image Management
The Images panel allows you to:
- **Upload multiple images** at once (drag & drop or file picker)
- **Reorder images** with ↑/↓ buttons
- **Set cover image** (moves to first position)
- **Edit alt text** for accessibility
- **Delete images** (removes from storage + database)
- **Preview with signed URLs** (auto-refreshed)

### Image Upload
1. Save project first (to generate ID and slug)
2. Click "Edit" on the project
3. Use file input to upload images
4. Images are stored in `project-media` bucket
5. Signed URLs generated automatically for display

---

## 🔧 Troubleshooting

### "403 • Admins only" Error
- Ensure your user has `role: "admin"` in user_metadata
- Sign out and sign back in after updating metadata

### Images Not Showing
- Check storage bucket `project-media` exists
- Verify storage policies allow public read
- Check browser console for signed URL errors

### Seed Script Fails
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
- Verify database tables exist (run SQL from your instructions)
- Check for unique constraint violations on slug

---

## 📁 Project Structure

```
src/
├── lib/
│   └── supabase.ts          # Supabase client
├── data/
│   └── projects.ts          # CRUD API + types
├── components/
│   └── ProjectsGrid.tsx     # Public project display
├── admin/
│   ├── AdminRoute.tsx       # Auth guard
│   ├── AdminPanel.tsx       # Dashboard
│   └── ProjectEditor.tsx    # CRUD form
└── main.tsx                 # Router setup

scripts/
├── seed-data.json           # Sample data
└── seed.ts                  # Seeding script
```

---

## 🎨 Customization

### Add More Fields
1. Update SQL schema in Supabase
2. Update `ProjectDTO` in `src/data/projects.ts`
3. Add form fields in `ProjectEditor.tsx`

### Change Personas
Update the enum in `src/data/projects.ts`:
```ts
persona: z.enum(["cyber","soft","game","art"])
```

### Customize Admin UI
Edit `AdminPanel.tsx` and `ProjectEditor.tsx` to match your design system.

---

**All set!** Your portfolio now has full CRUD capabilities with Supabase. 🎉
