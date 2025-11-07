# 🚀 Quick Start: Format Cards Like Reference Image

## Your Reference Image Layout

```
┌─────────────────────────────────────────────┐
│  ┌───────────────────────────────────────┐  │
│  │  [Image Gallery with Progress Bar]   │  │ ← project_images
│  └───────────────────────────────────────┘  │
│                                              │
│  PhishNClick            [Cut risky clicks]  │ ← title + kicker
│                                              │
│  JWT-secured MERN phishing simulator with   │ ← short_desc
│  GoPhish, Docker Compose to AWS ECS.        │
│                                              │
│  [MERN] [GoPhish] [Docker] [AWS ECS]        │ ← tags[]
│                                              │
│  click-through: -30%                        │ ← metrics[0]
│                                              │
│  [Repo]  [Case study]                       │ ← links[]
└─────────────────────────────────────────────┘
```

---

## ✅ Step-by-Step Setup

### 1. Add Project in Admin Panel

Go to `/admin` → "+ New Project"

**Fill in these fields**:

| Field | Value | Shows As |
|-------|-------|----------|
| **title** | `PhishNClick` | Large title below gallery |
| **slug** | `phishnclick` | URL-friendly identifier |
| **short_desc** | `JWT-secured MERN phishing simulator with GoPhish, Docker Compose to AWS ECS.` | Gray description text |
| **tags** | `["MERN", "GoPhish", "Docker", "AWS ECS"]` | Rounded chip buttons |
| **metrics** | `[{"label": "click-through:", "value": "-30%"}]` | Small metric below chips |
| **persona** | `cyber` | Determines color theme |
| **featured** | `false` | If `true`, shows "Featured" badge |

### 2. Add Images

After saving the project:

1. Click **"🖼️ Images"** button on the project row
2. Click **"📤 Upload images"**
3. Select 2-3 project screenshots
4. First image becomes the cover (or click "⭐ Cover" to change)

### 3. View Result

Navigate to your projects page - should look exactly like the reference!

---

## 📝 Example Data Entry

### Via Admin Panel UI

**Title**:
```
PhishNClick
```

**Short Description**:
```
JWT-secured MERN phishing simulator with GoPhish, Docker Compose to AWS ECS.
```

**Tags** (enter as array or comma-separated):
```
MERN, GoPhish, Docker, AWS ECS
```

**Metrics** (JSON format):
```json
[{"label": "click-through:", "value": "-30%"}]
```

### Via SQL (Alternative)

```sql
INSERT INTO projects (
  slug, title, short_desc, tags, metrics, persona, featured
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

---

## 🎨 What Each Field Controls

### Gallery (Top)
- **Source**: `project_images` table
- **Features**: Auto-advance carousel, chevrons, progress bar
- **Aspect ratio**: 16:9
- **Upload**: Via admin panel "🖼️ Images" button

### Title + Badge
- **Title**: `projects.title` → "PhishNClick"
- **Badge**: `projects.featured` → "Featured" (if true)
- **Position**: Below gallery, left side
- **Style**: Large, bold, white text

### Description
- **Source**: `projects.short_desc`
- **Position**: Below title
- **Style**: Gray text, smaller font
- **Length**: 1-2 sentences recommended

### Tech Chips
- **Source**: `projects.tags` (array)
- **Position**: Below description
- **Style**: Rounded pills with subtle background
- **Example**: `["MERN", "GoPhish", "Docker", "AWS ECS"]`

### Metric
- **Source**: `projects.metrics[0]` (first metric)
- **Format**: `{"label": "click-through:", "value": "-30%"}`
- **Position**: Below tech chips
- **Style**: Label (light) + Value (bold)

### Links (Optional)
- **Source**: Can add `links` column or hardcode
- **Position**: Bottom of card
- **Style**: Bordered buttons
- **Example**: "Repo", "Case study"

---

## 🔧 Customization Options

### Add Custom Kicker Badge

Instead of "Featured", show custom text like "Cut risky clicks in pilot":

**Option 1: Add kicker field to database**
```sql
ALTER TABLE projects ADD COLUMN kicker TEXT;

UPDATE projects 
SET kicker = 'Cut risky clicks in pilot'
WHERE slug = 'phishnclick';
```

**Option 2: Update ViewModel**
```typescript
// In src/lib/projects.ts
kicker: p.kicker || (p.featured ? 'Featured' : undefined)
```

### Add Project Links

**Option 1: Add links column**
```sql
ALTER TABLE projects ADD COLUMN links JSONB DEFAULT '[]';

UPDATE projects 
SET links = '[
  {"label": "Repo", "href": "https://github.com/user/repo"},
  {"label": "Case study", "href": "https://example.com/case-study"}
]'::jsonb
WHERE slug = 'phishnclick';
```

**Option 2: Hardcode in ViewModel**
```typescript
// In src/lib/projects.ts (lines 56-58)
// Uncomment these lines:
links.push({ label: 'Repo', href: `https://github.com/yourusername/${p.slug}` });
links.push({ label: 'Case study', href: `/projects/${p.slug}` });
```

---

## ✅ Verification Checklist

After adding a project, check:

- [ ] Gallery shows images and auto-advances
- [ ] Title displays below gallery
- [ ] Kicker badge shows in top-right (if featured)
- [ ] Description text is gray and readable
- [ ] Tech chips display as rounded pills
- [ ] Metric shows with label and value
- [ ] Links show at bottom (if configured)
- [ ] Card has rounded corners and shadow
- [ ] Hover on gallery shows chevrons

---

## 🎯 Common Issues

### "No images yet" placeholder shows
- Upload images via admin panel "🖼️ Images"
- Or add placeholder: `public/placeholders/project-dark.png`

### Tech chips not showing
- Ensure `tags` is an array: `["MERN", "GoPhish"]`
- Not a string: `"MERN, GoPhish"`

### Metric not showing
- Check JSON format: `[{"label": "...", "value": "..."}]`
- Must be valid JSON array in `metrics` field

### Kicker badge not showing
- Set `featured = true` in database
- Or add custom `kicker` field

### Links not showing
- Links are optional - add them if needed
- See "Add Project Links" section above

---

## 📖 More Details

For complete documentation, see:
- **[DATABASE_MAPPING_GUIDE.md](./DATABASE_MAPPING_GUIDE.md)** - Detailed field mapping
- **[RESTORATION_GUIDE.md](./RESTORATION_GUIDE.md)** - Component architecture
- **[STORAGE_BUCKET_SETUP.md](./STORAGE_BUCKET_SETUP.md)** - Image upload setup

---

**Your cards will now match the reference image!** 🎉

The code is already set up correctly - you just need to add the data in the right format.
