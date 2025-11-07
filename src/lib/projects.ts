import { getSignedUrls } from './media';
import { listProjects, type Project } from '../data/projects';

// View Model for project cards with signed image URLs
export type ProjectVM = {
  id: string;
  slug: string;
  title: string;
  heroTitle?: string | null;
  summary: string;
  kicker?: string;
  tech_tags?: string[];
  metric_label?: string;
  metric_value?: string;
  links?: { href: string; label: string }[];
  images: { url: string; alt: string | null }[];
};

export async function fetchProjectsVM(persona: Project['persona']): Promise<ProjectVM[]> {
  const projects = await listProjects({ persona });
  
  const vms: ProjectVM[] = [];
  
  for (const p of projects) {
    // Get images and sign URLs
    const imgs = (p.project_images ?? [])
      .sort((a: any, b: any) => (a.sort ?? 0) - (b.sort ?? 0));
    
    let signedImages: { url: string; alt: string | null }[] = [];
    
    if (imgs.length > 0) {
      const paths = imgs.map((i: any) => i.storage_path);
      const signed = await getSignedUrls(paths, 3600);
      const urlMap = new Map(signed.map(s => [s.path, s.url]));
      
      signedImages = imgs.map((i: any) => ({
        url: urlMap.get(i.storage_path) || '',
        alt: i.alt || p.title,
      })).filter(img => img.url); // Only include images with valid URLs
    }
    
    // Fallback to placeholder if no images
    if (signedImages.length === 0) {
      signedImages = [{ url: '/placeholders/project-dark.svg', alt: p.title }];
    }
    
    // Map metrics
    const metric = p.metrics?.[0];

    const links: { href: string; label: string }[] = Array.isArray(p.links)
      ? p.links.filter((l: any) => l?.label && l?.href)
      : [];

    vms.push({
      id: p.id!,
      slug: p.slug,
      title: p.title,
      heroTitle: p.hero_title ?? p.title,
      summary: p.short_desc,
      kicker: p.kicker ?? (p.featured ? 'Featured' : undefined),
      tech_tags: p.tags,
      metric_label: metric?.label,
      metric_value: metric?.value,
      links: links,
      images: signedImages,
    });
  }
  
  return vms;
}
