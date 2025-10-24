export type Link = { label: string; href: string };
export type Metric = { label: string; value: string };

export type Project = {
  title: string;
  summary: string;
  persona: ("sec" | "dev" | "game" | "art")[];
  highlight?: string;         // short outcome tagline
  tags?: string[];            // tech/skills
  metrics?: Metric[];         // 1–3 quick wins
  links?: Link[];             // Repo / Demo / Case Study
  thumb?: string | string[];  // single image path or array of images for slideshow
};

export const PROJECTS: Project[] = [
  {
    title: "PhishNClick",
    summary: "JWT-secured MERN phishing simulator with GoPhish, Docker Compose to AWS ECS.",
    persona: ["sec", "dev", "game"],
    highlight: "Cut risky clicks in pilot",
    tags: ["MERN", "GoPhish", "Docker", "AWS ECS"],
    metrics: [{ label: "click-through", value: "-30%" }],
    links: [
      { label: "Repo", href: "https://github.com/.../phishnclick" },
      { label: "Case study", href: "/cases/phishnclick" },
    ],
    thumb: [
      "https://placehold.co/600x400/1a1a1a/ffffff?text=PhishNClick+Dashboard",
      "https://placehold.co/600x400/1a1a1a/ffffff?text=PhishNClick+Simulator",
      "https://placehold.co/600x400/1a1a1a/ffffff?text=PhishNClick+Analytics"
    ],
  },
  {
    title: "ML Threat Detection",
    summary: "Random Forest on CIC-IDS-2017 to reduce SOC false positives.",
    persona: ["sec", "dev"],
    highlight: "Lowered false positives",
    tags: ["Python", "sklearn", "CIC-IDS-2017"],
    metrics: [
      { label: "FP", value: "-15%" },
      { label: "Precision", value: "+8pt" },
    ],
    links: [{ label: "Notebook", href: "https://…" }],
    thumb: "https://placehold.co/600x400/1a1a1a/ffffff?text=ML+Threat+Detection",
  },
  {
    title: "FableSmiths Website",
    summary: "React site on AWS ECS with Docker CI/CD, ALB, ACM TLS; promotes UE project.",
    persona: ["dev", "game", "art"],
    highlight: "1s cold start on CDN",
    tags: ["React", "Docker", "ECS", "CloudFront"],
    metrics: [{ label: "TTFB", value: "~120ms" }],
    links: [{ label: "Live", href: "https://…" }],
    thumb: "https://placehold.co/600x400/1a1a1a/ffffff?text=FableSmiths",
  },
  {
    title: "Heart O' Nightmares",
    summary: "Unreal Engine 5 C++ narrative adventure with gesture-recognition spells and stylized visuals.",
    persona: ["game", "art"],
    highlight: "AI-driven narrative system",
    tags: ["Unreal Engine 5", "C++", "AI"],
    metrics: [
      { label: "FPS", value: "60+" },
      { label: "Polygons", value: "2M+" },
    ],
    links: [
      { label: "Trailer", href: "https://youtube.com/..." },
      { label: "Case Study", href: "/cases/heart-of-nightmares" },
    ],
    thumb: "https://placehold.co/600x400/1a1a1a/ffffff?text=Heart+O%27+Nightmares",
  },
];
