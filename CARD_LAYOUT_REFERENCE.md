# 🎨 Card Layout Reference

## Exact Mapping: Reference Image → Database

Based on your reference image, here's the **exact** mapping:

---

## 📸 Reference Image Breakdown

```
┌─────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────┐    │
│  │                                                  │    │
│  │         PhishNClick Simulator                    │    │ ← Gallery image
│  │                                                  │    │
│  │         [━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━]    │    │ ← Progress bar
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  PhishNClick                    [Cut risky clicks...]   │ ← Title + Kicker
│                                                          │
│  JWT-secured MERN phishing simulator with GoPhish,      │ ← Description
│  Docker Compose to AWS ECS.                             │
│                                                          │
│  [MERN] [GoPhish] [Docker] [AWS ECS]                    │ ← Tech tags
│                                                          │
│  click-through: -30%                                    │ ← Metric
│                                                          │
│  [Repo]  [Case study]                                   │ ← Action links
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Fields → Card Elements

| Card Element | Database Field | Example Value | Component |
|--------------|----------------|---------------|-----------|
| **Gallery** | `project_images.storage_path` | `projects/abc-123/image.png` | `<ProjectGallery>` |
| **Progress bar** | Auto-generated | N/A | `<ProjectGallery>` |
| **Title** | `projects.title` | `"PhishNClick"` | `<h3>` |
| **Kicker badge** | `projects.featured` or `projects.kicker` | `"Cut risky clicks in pilot"` | `<span>` |
| **Description** | `projects.short_desc` | `"JWT-secured MERN phishing..."` | `<p>` |
| **Tech chips** | `projects.tags[]` | `["MERN", "GoPhish", "Docker", "AWS ECS"]` | `<span>` loop |
| **Metric** | `projects.metrics[0]` | `{"label": "click-through:", "value": "-30%"}` | `<div>` |
| **Links** | `projects.links[]` or hardcoded | `[{"label": "Repo", "href": "..."}]` | `<a>` loop |

---

## 💾 Example Database Record

### Complete Project Entry

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "slug": "phishnclick",
  "title": "PhishNClick",
  "short_desc": "JWT-secured MERN phishing simulator with GoPhish, Docker Compose to AWS ECS.",
  "long_desc": "Full project description...",
  "tags": ["MERN", "GoPhish", "Docker", "AWS ECS"],
  "metrics": [
    {
      "label": "click-through:",
      "value": "-30%"
    }
  ],
  "persona": "cyber",
  "featured": false,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### Related Images

```json
// project_images table
[
  {
    "id": "...",
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "storage_path": "projects/550e8400.../1705315200000-screenshot1.png",
    "alt": "PhishNClick dashboard",
    "sort": 0
  },
  {
    "id": "...",
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "storage_path": "projects/550e8400.../1705315201000-screenshot2.png",
    "alt": "Email template editor",
    "sort": 1
  }
]
```

---

## 🎯 Visual Element Specifications

### Gallery
- **Aspect ratio**: 16:9
- **Border radius**: `rounded-2xl` (16px)
- **Background**: Black with 20% opacity
- **Chevrons**: Circular buttons, appear on hover
- **Progress bar**: Bottom, 2px height, accent color

### Title
- **Font size**: `text-2xl` (24px)
- **Font weight**: `font-semibold` (600)
- **Color**: White (or theme foreground)
- **Position**: Below gallery, left-aligned

### Kicker Badge
- **Font size**: `text-xs` (12px)
- **Padding**: `px-3 py-1` (12px horizontal, 4px vertical)
- **Border radius**: `rounded-full`
- **Background**: Accent color with 12% opacity
- **Color**: Accent color
- **Position**: Top-right, aligned with title

### Description
- **Font size**: `text-[15px]` (15px)
- **Color**: `rgb(var(--sub))` (subdued/gray)
- **Line height**: Normal
- **Margin**: `mt-2` (8px top)

### Tech Chips
- **Font size**: `text-sm` (14px)
- **Padding**: `px-3 py-1.5` (12px horizontal, 6px vertical)
- **Border radius**: `rounded-full`
- **Border**: `1px solid rgb(var(--border))`
- **Background**: White with 3% opacity
- **Gap**: `gap-2` (8px between chips)
- **Margin**: `mt-3` (12px top)

### Metric
- **Font size**: `text-sm` (14px)
- **Label opacity**: 75%
- **Value font weight**: `font-semibold` (600)
- **Margin**: `mt-3` (12px top)

### Links
- **Font size**: Default (16px)
- **Padding**: `px-4 py-2` (16px horizontal, 8px vertical)
- **Border radius**: `rounded-xl` (12px)
- **Border**: `1px solid rgb(var(--border))`
- **Hover**: `opacity-90`
- **Gap**: `gap-3` (12px between buttons)
- **Margin**: `mt-4` (16px top)

---

## 🎨 Color Variables

Ensure these CSS variables are defined:

```css
:root {
  --card: 15 23 42;        /* Slate-900 - Card background */
  --border: 51 65 85;      /* Slate-700 - Borders */
  --accent: 59 130 246;    /* Blue-500 - Accent color */
  --sub: 148 163 184;      /* Slate-400 - Subdued text */
  --fg: 248 250 252;       /* Slate-50 - Foreground text */
}

/* Cyber persona (blue theme) */
[data-persona="cyber"] {
  --accent: 59 130 246;    /* Blue-500 */
}

/* Soft persona (purple theme) */
[data-persona="soft"] {
  --accent: 168 85 247;    /* Purple-500 */
}

/* Game persona (green theme) */
[data-persona="game"] {
  --accent: 34 197 94;     /* Green-500 */
}

/* Art persona (pink theme) */
[data-persona="art"] {
  --accent: 236 72 153;    /* Pink-500 */
}
```

---

## 📐 Spacing & Layout

### Card Container
```css
padding: 1rem (16px) on mobile
padding: 1.25rem (20px) on desktop
border-radius: 1.5rem (24px)
box-shadow: 0 10px 40px rgba(0,0,0,.35)
backdrop-filter: blur(12px)
```

### Inner Spacing
```
Gallery: Full width within padding
↓ 16px gap
Title + Badge: Flex row, space-between
↓ 8px gap
Description
↓ 12px gap
Tech Chips: Flex wrap, 8px gap
↓ 12px gap
Metric
↓ 16px gap
Links: Flex wrap, 12px gap
```

---

## ✅ Component Structure

```tsx
<article className="rounded-3xl border bg-[rgb(var(--card))/60] backdrop-blur-md">
  <div className="p-4 md:p-5">
    {/* Gallery */}
    <ProjectGallery images={p.images} />
    
    {/* Title + Badge */}
    <div className="mt-4 flex items-start gap-3">
      <h3>{p.title}</h3>
      {p.kicker && <span>{p.kicker}</span>}
    </div>
    
    {/* Description */}
    <p className="mt-2">{p.summary}</p>
    
    {/* Tech Chips */}
    <div className="mt-3 flex flex-wrap gap-2">
      {p.tech_tags.map(t => <span>{t}</span>)}
    </div>
    
    {/* Metric */}
    <div className="mt-3">
      <span>{p.metric_label}</span>
      <span>{p.metric_value}</span>
    </div>
    
    {/* Links */}
    <div className="mt-4 flex flex-wrap gap-3">
      {p.links.map(l => <a href={l.href}>{l.label}</a>)}
    </div>
  </div>
</article>
```

---

## 🚀 Implementation Status

✅ **Already Implemented**:
- Gallery component with carousel
- Auto-advance and manual navigation
- Progress bar
- Title and description
- Tech chips
- Metric display
- Link buttons
- Responsive layout
- Accent-aware theming

🎯 **You Just Need**:
1. Add project data in correct format
2. Upload images via admin panel
3. Configure Supabase storage (see STORAGE_BUCKET_SETUP.md)

---

## 📖 Related Guides

- **[QUICK_START_CARD_FORMAT.md](./QUICK_START_CARD_FORMAT.md)** - Step-by-step setup
- **[DATABASE_MAPPING_GUIDE.md](./DATABASE_MAPPING_GUIDE.md)** - Detailed field mapping
- **[RESTORATION_GUIDE.md](./RESTORATION_GUIDE.md)** - Component architecture

---

**Everything is ready - just add your data!** 🎉
