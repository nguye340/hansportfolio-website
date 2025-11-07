# 📊 Database to Card Layout Mapping

## Reference Image Breakdown

Looking at your original card design, here's how each element maps to your database:

```
┌─────────────────────────────────────────┐
│  [Gallery with progress bar]            │ ← project_images table
├─────────────────────────────────────────┤
│  PhishNClick          [Cut risky...]    │ ← title + kicker badge
│                                          │
│  JWT-secured MERN phishing simulator... │ ← short_desc (summary)
│                                          │
│  [MERN] [GoPhish] [Docker] [AWS ECS]    │ ← tags array
│                                          │
│  click-through: -30%                    │ ← metrics[0]
│                                          │
│  [Repo] [Case study]                    │ ← links array (if added)
└─────────────────────────────────────────┘
```

---

## 🗄️ Database Schema Mapping

### Your `projects` Table Structure

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  slug TEXT,
  title TEXT,                    -- "PhishNClick"
  short_desc TEXT,               -- "JWT-secured MERN phishing..."
  long_desc TEXT,                -- (optional, not shown on card)
  tags TEXT[],                   -- ["MERN", "GoPhish", "Docker", "AWS ECS"]
  metrics JSONB,                 -- [{"label": "click-through:", "value": "-30%"}]
  persona TEXT,                  -- "cyber", "soft", "game", "art"
  featured BOOLEAN,              -- true = shows "Featured" kicker
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### How It Maps to `ProjectVM`

```typescript
{
  title: "PhishNClick",              // → Large title
  summary: "JWT-secured MERN...",    // → Gray description text
  kicker: "Cut risky clicks...",     // → Top-right badge (or "Featured")
  tech_tags: ["MERN", "GoPhish"],    // → Rounded chip buttons
  metric_label: "click-through:",    // → Small metric label
  metric_value: "-30%",              // → Bold metric value
  links: [                           // → Bottom buttons
    { label: "Repo", href: "..." },
    { label: "Case study", href: "..." }
  ],
  images: [...]                      // → Gallery carousel
}
```

---

## 📝 Example Database Entry

### SQL Insert Example

```sql
INSERT INTO projects (
  slug,
  title,
  short_desc,
  tags,
  metrics,
  persona,
  featured
) VALUES (
  'phishnclick',
  'PhishNClick',
  'JWT-secured MERN phishing simulator with GoPhish, Docker Compose to AWS ECS.',
  ARRAY['MERN', 'GoPhish', 'Docker', 'AWS ECS'],
  '[{"label": "click-through:", "value": "-30%"}]'::jsonb,
  'cyber',
  false
);
```

### Admin Panel Entry

When using the admin panel at `/admin`:

**Title**: `PhishNClick`

**Short Description**: 
```
JWT-secured MERN phishing simulator with GoPhish, Docker Compose to AWS ECS.
```

**Tags** (comma-separated or array):
```
MERN, GoPhish, Docker, AWS ECS
```

**Metrics** (JSON format):
```json
[
  {
    "label": "click-through:",
    "value": "-30%"
  }
]
```

**Featured**: `false` (or `true` for "Featured" badge)

**Persona**: `cyber`

---

## 🎯 Field-by-Field Mapping

### 1. Gallery (Top Section)
**Database**: `project_images` table
```sql
-- Related via project_id foreign key
SELECT * FROM project_images WHERE project_id = '{project-uuid}';
```

**What it shows**:
- Auto-advancing carousel
- Chevron navigation buttons
- Progress bar at bottom
- Aspect ratio: 16:9

### 2. Title + Kicker Badge
**Database**: `title` + `featured` (or custom kicker field)

```typescript
// In ProjectVM mapping:
title: p.title,                           // "PhishNClick"
kicker: p.featured ? 'Featured' : undefined  // "Featured" badge
```

**To show custom kicker** (like "Cut risky clicks in pilot"):
- Option A: Add `kicker` column to database
- Option B: Use `featured` boolean for "Featured" badge
- Option C: Store in `metrics` or custom field

### 3. Summary/Description
**Database**: `short_desc`

```typescript
summary: p.short_desc  // "JWT-secured MERN phishing simulator..."
```

**Styling**: 
- Color: `rgb(var(--sub))` (subdued text)
- Size: `text-[15px]`
- Margin: `mt-2`

### 4. Tech Chips
**Database**: `tags` (text array)

```typescript
tech_tags: p.tags  // ["MERN", "GoPhish", "Docker", "AWS ECS"]
```

**Styling**:
- Rounded pills: `rounded-full`
- Border: `rgb(var(--border))`
- Background: `rgb(255 255 255 / .03)`
- Padding: `px-3 py-1.5`

### 5. Metric (click-through: -30%)
**Database**: `metrics` (JSONB array)

```typescript
// First metric is displayed
metric_label: p.metrics[0]?.label,  // "click-through:"
metric_value: p.metrics[0]?.value   // "-30%"
```

**Format in database**:
```json
[
  {
    "label": "click-through:",
    "value": "-30%"
  }
]
```

**Styling**:
- Label: `opacity-75` (lighter)
- Value: `font-semibold` (bold)
- Size: `text-sm`

### 6. Links (Repo, Case study)
**Database**: Add `links` column (JSONB) or hardcode

**Option A: Add to Database**
```sql
ALTER TABLE projects ADD COLUMN links JSONB DEFAULT '[]';

UPDATE projects 
SET links = '[
  {"label": "Repo", "href": "https://github.com/..."},
  {"label": "Case study", "href": "https://..."}
]'::jsonb
WHERE slug = 'phishnclick';
```

**Option B: Update ProjectVM Mapping**
```typescript
// In src/lib/projects.ts
links: [
  { label: 'Repo', href: `https://github.com/yourusername/${p.slug}` },
  { label: 'Case study', href: `/projects/${p.slug}` }
]
```

---

## 🔄 Complete Data Flow

### 1. Database → ViewModel
```typescript
// src/lib/projects.ts
export async function fetchProjectsVM(persona) {
  const projects = await listProjects({ persona });
  
  return projects.map(p => ({
    id: p.id,
    slug: p.slug,
    title: p.title,                    // ← "PhishNClick"
    summary: p.short_desc,             // ← "JWT-secured MERN..."
    kicker: p.featured ? 'Featured' : undefined,
    tech_tags: p.tags,                 // ← ["MERN", "GoPhish", ...]
    metric_label: p.metrics[0]?.label, // ← "click-through:"
    metric_value: p.metrics[0]?.value, // ← "-30%"
    links: [],                         // ← Add your links
    images: signedImages               // ← From project_images
  }));
}
```

### 2. ViewModel → Card Component
```tsx
// src/components/ProjectCard.tsx
<article>
  <ProjectGallery images={p.images} />        {/* Gallery */}
  
  <h3>{p.title}</h3>                          {/* PhishNClick */}
  {p.kicker && <span>{p.kicker}</span>}       {/* Featured badge */}
  
  <p>{p.summary}</p>                          {/* Description */}
  
  {p.tech_tags.map(t => <span>{t}</span>)}    {/* Tech chips */}
  
  <div>
    <span>{p.metric_label}</span>             {/* click-through: */}
    <span>{p.metric_value}</span>             {/* -30% */}
  </div>
  
  {p.links.map(l => <a href={l.href}>{l.label}</a>)}  {/* Repo, Case study */}
</article>
```

---

## ✅ Checklist: Match Reference Image

To make your cards look exactly like the reference:

- [ ] **Title**: Set `title` field in database
- [ ] **Kicker badge**: Set `featured = true` or add custom `kicker` field
- [ ] **Description**: Set `short_desc` with 1-2 sentence summary
- [ ] **Tech chips**: Set `tags` array with tech stack
- [ ] **Metric**: Set `metrics` JSON with label + value
- [ ] **Links**: Add `links` column or hardcode in ViewModel
- [ ] **Images**: Upload via `/admin` → "🖼️ Images"
- [ ] **Gallery**: Images auto-load from `project_images` table

---

## 🎨 Styling Variables

Ensure your CSS has these variables for proper theming:

```css
:root {
  --card: 15 23 42;        /* Card background */
  --border: 51 65 85;      /* Border color */
  --accent: 59 130 246;    /* Blue accent (or your theme color) */
  --sub: 148 163 184;      /* Subdued text */
}
```

For cyber persona (blue theme):
```css
[data-persona="cyber"] {
  --accent: 59 130 246;    /* Blue */
}
```

---

## 🚀 Quick Setup Example

### 1. Add a Project via Admin Panel

1. Go to `/admin`
2. Click "+ New Project"
3. Fill in:
   - **Title**: `PhishNClick`
   - **Slug**: `phishnclick`
   - **Short Desc**: `JWT-secured MERN phishing simulator with GoPhish, Docker Compose to AWS ECS.`
   - **Tags**: `MERN, GoPhish, Docker, AWS ECS`
   - **Metrics**: `[{"label": "click-through:", "value": "-30%"}]`
   - **Persona**: `cyber`
   - **Featured**: `false`
4. Click "Save"

### 2. Add Images

1. Click "🖼️ Images" on the project row
2. Upload 2-3 screenshots
3. Set first image as cover

### 3. View Result

Navigate to your projects page - should match the reference image!

---

## 🔧 Troubleshooting

### Kicker badge not showing
- Check `featured` is `true` in database
- Or add custom `kicker` field and update ViewModel

### Tech chips not showing
- Ensure `tags` is an array: `["MERN", "GoPhish"]`
- Not a string: `"MERN, GoPhish"`

### Metric not showing
- Check `metrics` format: `[{"label": "...", "value": "..."}]`
- Must be valid JSON array

### Links not showing
- Add `links` column to database
- Or update `fetchProjectsVM()` to hardcode links

---

**Your card will now match the reference image exactly!** 🎉
