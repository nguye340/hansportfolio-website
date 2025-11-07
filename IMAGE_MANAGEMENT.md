# 🖼️ Image Management System

Complete guide for the multi-image upload and carousel system.

## 🚨 Images Not Displaying?

**See these guides first**:
- 📖 **[STORAGE_BUCKET_SETUP.md](./STORAGE_BUCKET_SETUP.md)** - Step-by-step Supabase storage configuration
- 🔧 **[TROUBLESHOOTING_IMAGES.md](./TROUBLESHOOTING_IMAGES.md)** - Complete troubleshooting checklist

---

## ✅ What's Implemented

### 1. **Multi-Image Upload**
- Upload multiple images at once via file picker
- Images stored in Supabase Storage (`project-media` bucket)
- Automatic path generation: `projects/{projectId}/{timestamp}-{filename}`
- Sequential ordering with `sort` field

### 2. **Image Carousel (Auto-Advancing)**
- **Auto-advance**: Slides change every 4.2 seconds
- **Manual navigation**: Click left/right hover zones with chevrons
- **Progress bar**: Visual indicator of current slide position
- **Smooth transitions**: CSS animations for slide changes
- **Accent-aware**: Uses your CSS `--accent` variable for tinting

### 3. **Admin Image Panel**
Located at `/admin` → Click "🖼️ Images" on any project

**Features:**
- ✅ Upload multiple images (multi-select file input)
- ✅ Reorder with ↑/↓ buttons
- ✅ Set cover image (moves to position 0)
- ✅ Edit alt text inline
- ✅ Delete images (removes from storage + DB)
- ✅ Live preview with signed URLs
- ✅ Grid layout (responsive: 1/2/3 columns)

### 4. **Security**
- **RLS Policies**: Public read, admin-only write
- **Signed URLs**: All images served via temporary signed URLs (1 hour expiry)
- **Storage Policies**: Admin-only upload/delete
- **Cascade Delete**: Images auto-deleted when project is deleted

---

## 📁 File Structure

```
src/
├── lib/
│   └── media.ts                    # Image upload/delete helpers
├── components/
│   ├── ProjectCard.tsx             # Carousel component
│   └── ProjectsGrid.tsx            # Grid of cards
└── admin/
    ├── AdminPanel.tsx              # Main admin UI (with Images button)
    └── ProjectImagesPanel.tsx      # Image management modal

supabase-schema.sql                 # Database schema + RLS
```

---

## 🎨 How the Carousel Works

### ProjectCard Component

```tsx
// Fetches images from project.project_images
const imgs = project.project_images.sort((a, b) => a.sort - b.sort);

// Gets signed URLs
const signedUrls = await getSignedUrls(imgs.map(i => i.storage_path));

// Auto-advances every 4.2s
useEffect(() => {
  timer = setInterval(() => setIdx(i => (i + 1) % slides.length), 4200);
}, [slides]);
```

**Visual Features:**
- **Hover zones**: Left/right 33% of image area
- **Chevrons**: SVG arrows with hover animation
- **Progress bar**: Bottom of image, accent-colored
- **Gradient overlay**: Accent-tinted on hover

---

## 🔧 Usage Guide

### For Admins

1. **Create a project** via "+ New Project"
2. **Click "🖼️ Images"** on the project row
3. **Upload images**:
   - Click "📤 Upload images"
   - Select multiple files (Ctrl/Cmd+Click)
   - Images upload sequentially
4. **Manage images**:
   - **Reorder**: Use ↑/↓ buttons
   - **Set cover**: Click "⭐ Cover" (moves to first)
   - **Edit alt**: Click in text field, type, blur to save
   - **Delete**: Click 🗑️ (confirms first)

### For Developers

**Fetch projects with images:**
```tsx
const projects = await listProjects({ persona: 'cyber' });
// Each project has project_images: [{ storage_path, alt, sort }]
```

**Display with carousel:**
```tsx
<ProjectCard project={project} />
// Automatically handles image loading, carousel, navigation
```

**Upload new image:**
```tsx
const path = await uploadImageForProject(projectId, file);
await supabase.from('project_images').insert({
  project_id: projectId,
  storage_path: path,
  alt: file.name,
  sort: 0
});
```

---

## 🗄️ Database Schema

### `project_images` Table

| Column        | Type      | Description                          |
|---------------|-----------|--------------------------------------|
| `id`          | uuid      | Primary key                          |
| `project_id`  | uuid      | Foreign key → `projects.id`          |
| `storage_path`| text      | Path in Storage bucket               |
| `alt`         | text      | Alt text for accessibility           |
| `sort`        | int       | Display order (0 = first/cover)      |
| `created_at`  | timestamp | Auto-set on insert                   |

**Constraints:**
- `ON DELETE CASCADE` - deletes images when project deleted
- RLS enabled with public read, admin write

---

## 🎯 Image Ordering

Images are ordered by the `sort` field:
- **0** = Cover image (first in carousel)
- **1, 2, 3...** = Subsequent slides

**Reordering logic:**
```tsx
// Move up: swap sort values with previous image
// Move down: swap sort values with next image
// Set cover: set to 0, increment all others by 1
```

---

## 🚀 Performance Tips

1. **Lazy load signed URLs**: Only fetch when needed
2. **Cache signed URLs**: 1-hour expiry, store in state
3. **Optimize images**: Use WebP format, compress before upload
4. **Limit carousel size**: 5-10 images max per project
5. **Preload next slide**: Improve transition smoothness

---

## 🔐 Security Checklist

- ✅ RLS policies on `project_images` table
- ✅ Storage bucket policies (admin write only)
- ✅ Signed URLs for all image access
- ✅ User role validation (`role: "admin"` in metadata)
- ✅ File type validation (accept="image/*")
- ✅ Cascade delete on project removal

---

## 🐛 Troubleshooting

**For detailed troubleshooting, see [TROUBLESHOOTING_IMAGES.md](./TROUBLESHOOTING_IMAGES.md)**

### Quick Fixes

**Images not showing**:
1. ✅ Verify `project-media` bucket exists and is **public**
2. ✅ Add public read policy to storage bucket
3. ✅ Check browser console for signed URL errors
4. ✅ See [STORAGE_BUCKET_SETUP.md](./STORAGE_BUCKET_SETUP.md)

**Upload fails**:
1. ✅ Verify user has `role: "admin"` in user_metadata
2. ✅ Sign out and sign back in after adding admin role
3. ✅ Check storage write policy allows authenticated admin
4. ✅ Ensure file is valid image format

**Carousel not auto-advancing**:
1. Check `slides.length > 1`
2. Verify `useEffect` timer is running
3. Check for JavaScript errors in console
4. Ensure images loaded successfully

---

## 🎨 Customization

### Change auto-advance speed
```tsx
// In ProjectCard.tsx
setInterval(() => setIdx(...), 4200); // Change 4200 to desired ms
```

### Modify hover zones
```tsx
// In ProjectCard.tsx
className="... w-1/3" // Change width (1/3 = 33%)
```

### Adjust progress bar style
```tsx
// In ProjectCard.tsx
<div className="h-[6px]"> // Change height
  <div style={{ background: accentRGBA(0.9) }}> // Change opacity
```

---

**All set!** Your portfolio now has a complete image management system with auto-advancing carousels. 🎉
