# 🎨 Project Card Restoration Guide

## What Was Fixed

Your project cards now match the **original clean design** (before CRUD implementation).

### Before (CRUD Implementation)
- ❌ Title overlaid directly on image
- ❌ Awkward spacing and proportions
- ❌ Missing proper gallery component
- ❌ Less polished appearance

### After (Restored Original)
- ✅ Gallery inside card with proper padding
- ✅ Title below gallery with clean separation
- ✅ Professional rounded corners (rounded-3xl)
- ✅ Proper shadow and backdrop blur
- ✅ Tech chips, metrics, and links properly styled
- ✅ Accent-aware chevrons and progress bar

---

## 📁 Files Created/Modified

### New Files
1. **`src/components/ProjectGallery.tsx`**
   - Standalone gallery component with carousel
   - Accent-aware edge tint on hover
   - Circular chevron buttons with backdrop blur
   - Progress bar at bottom
   - Auto-advance every 3.5s (pauses on hover)

2. **`src/lib/projects.ts`**
   - `ProjectVM` type - View Model for project cards
   - `fetchProjectsVM()` - Fetches projects and signs image URLs
   - Handles fallback to placeholder if no images

### Modified Files
1. **`src/components/ProjectCard.tsx`**
   - Restored original card structure
   - Gallery inside card with padding
   - Title, summary, chips below gallery
   - Proper spacing and styling

2. **`src/components/ProjectsGrid.tsx`**
   - Updated to use `fetchProjectsVM()`
   - Uses `ProjectVM` type instead of raw `Project`

---

## 🔧 How It Works

### 1. Data Flow
```
Database (project_images table)
  ↓
fetchProjectsVM() - Fetches projects + images
  ↓
getSignedUrls() - Signs storage paths
  ↓
ProjectVM - Clean view model with signed URLs
  ↓
ProjectCard - Renders with ProjectGallery
```

### 2. Image Handling
```typescript
// In fetchProjectsVM():
1. Fetch projects with project_images relation
2. Sort images by 'sort' field
3. Get signed URLs for all storage paths
4. Map to { url, alt } format
5. Fallback to placeholder if no images
```

### 3. Gallery Features
- **Auto-advance**: Changes slide every 3.5s
- **Pause on hover**: Stops auto-advance when hovering
- **Chevron navigation**: Circular buttons with SVG arrows
- **Progress bar**: Shows current position (0-100%)
- **Accent-aware**: Uses `rgb(var(--accent))` for theming
- **Edge tint**: Subtle gradient on hover

---

## 🎯 Usage

### In Your Pages
```tsx
import ProjectsGrid from '@/components/ProjectsGrid';

export default function CyberPage() {
  return (
    <section>
      <h2>Cybersecurity Projects</h2>
      <ProjectsGrid persona="cyber" />
    </section>
  );
}
```

### ProjectVM Structure
```typescript
type ProjectVM = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  kicker?: string;              // "Featured" badge
  tech_tags?: string[];         // Tech chips
  metric_label?: string;        // "click-through:"
  metric_value?: string;        // "-30%"
  links?: { href, label }[];    // "Repo", "Case study"
  images: { url, alt }[];       // Signed URLs
};
```

---

## 🖼️ Placeholder Setup

Create a placeholder image for projects without images:

1. **Create directory**: `public/placeholders/`
2. **Add image**: `project-dark.png` (or any dark-themed placeholder)
3. **Recommended size**: 1600x900px (16:9 aspect ratio)

Or update the fallback in `src/lib/projects.ts`:
```typescript
if (signedImages.length === 0) {
  signedImages = [{ url: '/your-placeholder.png', alt: p.title }];
}
```

---

## 🎨 Styling Details

### Card Structure
```
┌─────────────────────────────────┐
│  Card (rounded-3xl, shadow)     │
│  ┌───────────────────────────┐  │
│  │  Gallery (rounded-2xl)    │  │ ← Inside card with padding
│  │  - Image carousel         │  │
│  │  - Chevrons on hover      │  │
│  │  - Progress bar           │  │
│  └───────────────────────────┘  │
│                                  │
│  Title + Kicker badge            │
│  Summary text                    │
│  Tech chips                      │
│  Metric (label + value)          │
│  Links (Repo, Case study)        │
└─────────────────────────────────┘
```

### CSS Variables Used
- `--card` - Card background
- `--border` - Border color
- `--accent` - Accent color (chevrons, progress, chips)
- `--sub` - Subdued text color

---

## 🔍 Troubleshooting

### Images not showing in gallery
1. **Check Supabase storage** - See [STORAGE_BUCKET_SETUP.md](./STORAGE_BUCKET_SETUP.md)
2. **Verify signed URLs** - Check browser console for errors
3. **Check placeholder** - Ensure `/placeholders/project-dark.png` exists

### Gallery not auto-advancing
1. **Check images length** - Must be > 1 to auto-advance
2. **Check hover state** - Auto-advance pauses on hover
3. **Check console** - Look for JavaScript errors

### Styling looks off
1. **Verify CSS variables** - Ensure `:root` has `--accent`, `--card`, etc.
2. **Check Tailwind** - Ensure Tailwind CSS is loaded
3. **Check parent overflow** - Gallery needs visible overflow for chevrons

### Type errors
1. **Import ProjectVM** - `import type { ProjectVM } from '@/lib/projects'`
2. **Use correct prop name** - `<ProjectCard p={project} />` (not `project={...}`)
3. **Check fetchProjectsVM** - Returns `ProjectVM[]`, not `Project[]`

---

## 🚀 Next Steps

### 1. Add Placeholder Image
Create `public/placeholders/project-dark.png` with a nice dark gradient or pattern.

### 2. Configure Supabase Storage
Follow [STORAGE_BUCKET_SETUP.md](./STORAGE_BUCKET_SETUP.md) to enable image uploads.

### 3. Add Project Links
If you want "Repo" and "Case study" buttons, add a `links` field to your database:
```sql
ALTER TABLE projects ADD COLUMN links JSONB DEFAULT '[]';
```

Then update in admin panel to add links like:
```json
[
  { "href": "https://github.com/...", "label": "Repo" },
  { "href": "https://...", "label": "Case study" }
]
```

### 4. Customize Gallery Timing
In `ProjectGallery.tsx`, change `autoMs` prop:
```tsx
<ProjectGallery images={p.images} autoMs={5000} /> // 5 seconds
```

---

## ✅ Comparison: Before vs After

| Feature | Before (CRUD) | After (Restored) |
|---------|---------------|------------------|
| Gallery position | Full-width, no padding | Inside card with padding |
| Title position | Overlay on image | Below gallery |
| Rounded corners | rounded-2xl | rounded-3xl (more rounded) |
| Shadow | Basic | Deep shadow (0 10px 40px) |
| Chevrons | SVG inline | Circular buttons with backdrop |
| Progress bar | On image | In gallery component |
| Tech chips | Below title | Below summary |
| Spacing | Cramped | Generous padding |
| Overall look | Cluttered | Clean and professional |

---

## 🎉 Result

Your project cards now have the **original polished design** while fully integrated with:
- ✅ Supabase database
- ✅ Dynamic image loading
- ✅ Signed URL security
- ✅ Auto-advancing carousel
- ✅ Accent-aware theming
- ✅ Responsive layout

**The best of both worlds!** 🚀
