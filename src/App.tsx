import { useEffect, useRef, useState, useCallback, type CSSProperties, type ReactNode } from "react";
import { Rive, Layout, Fit } from '@rive-app/canvas';
import { Moon, Sun, MousePointerClick, Move, Sparkles, X, ExternalLink, Linkedin, Github, Mail } from "lucide-react";
import ExperienceHud from "./components/ExperienceHud";

// hooks
import { useTheme } from "./hooks/useTheme";
import { usePersona } from "./hooks/usePersona";
import type { PersonaId } from "./persona";

// components
import PersonaSwitch from "./components/PersonaSwitch";
import PersonaUnderlay from "./components/PersonaUnderlay";
import ContactChip from "./components/ContactChip";
import ProjectsGrid from "./components/ProjectsGrid";
import BigTitle from "./components/BigTitle";
import Chip from "./components/Chip";
import GameGallery from "./components/GameGallery";

type JackState = 'hello' | 'idle' | 'lookaround' | 'agree';

const CYBER_GIFS: Record<JackState, string> = {
  hello: new URL('./assets/gifs/jack-bowbow-hello.gif', import.meta.url).href,
  idle: new URL('./assets/gifs/jack-idle.gif', import.meta.url).href,
  lookaround: new URL('./assets/gifs/jack-lookaround-checking.gif', import.meta.url).href,
  agree: new URL('./assets/gifs/jack-click-agree.gif', import.meta.url).href,
};

const IDLE_LOOPS_BEFORE_LOOKAROUND = 2;

const PRELOADED_IMAGES = new Map<string, HTMLImageElement>();
const GIF_DURATION_CACHE = new Map<string, number>();

const FALLBACK_DURATIONS: Record<JackState, number> = {
  hello: 6000,
  idle: 2000,
  lookaround: 3200,
  agree: 2600,
};

const PERSONA_PROFILES = {
  sec: {
    name: "Han T. Nguyen",
    title: "Security Analyst & Incident Responder",
    blurb: "I enjoy digging into threats, tuning detections, and partnering with teams to keep environments resilient.",
    img: new URL('./assets/profilePics/VnGvYPcbIJxCk02FKvGzTIPMvmw.avif', import.meta.url).href,
  },
  dev: {
    name: "Han T. Nguyen",
    title: "Full-Stack & Platform Engineer",
    blurb: "From MERN to .NET and cloud infra, I love crafting systems that scale without sacrificing developer joy.",
    img: new URL('./assets/profilePics/VnGvYPcbIJxCk02FKvGzTIPMvmw.avif', import.meta.url).href,
  },
  game: {
    name: "Han T. Nguyen",
    title: "Gameplay & Systems Developer",
    blurb: "I prototype playful mechanics, integrate ML/AI, and polish player feedback loops across Unity & Unreal.",
    img: new URL('./assets/profilePics/han-blend.png', import.meta.url).href,
  },
  art: {
    name: "Han T. Nguyen",
    title: "UI/UX & Visual Designer",
    blurb: "I blend accessibility, storytelling, and motion to deliver interfaces that feel intentional and alive.",
    img: new URL('./assets/profilePics/han-blend.png', import.meta.url).href,
  },
} as const;

function preloadGif(src: string) {
  if (typeof window === 'undefined') return;
  if (PRELOADED_IMAGES.has(src)) return;
  const img = new Image();
  img.src = src;
  PRELOADED_IMAGES.set(src, img);
}

function ArtPersonaCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const createPalette = useCallback(() => generatePalette(Math.random()), []);
  const [palette, setPalette] = useState<string[]>(() => createPalette());
  const animationRef = useRef<number | null>(null);
  const hoverRef = useRef(false);

  const regenerate = useCallback(() => {
    setPalette(createPalette());
  }, [createPalette]);

  useEffect(() => {
    const tick = () => {
      if (hoverRef.current) {
        setPalette(prev => shiftPalette(prev));
      }
      animationRef.current = window.requestAnimationFrame(tick);
    };
    animationRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onEnter = () => { hoverRef.current = true; };
    const onLeave = () => {
      hoverRef.current = false;
      setPalette(createPalette());
    };
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('click', regenerate);
    return () => {
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('click', regenerate);
    };
  }, [regenerate, createPalette]);

  return (
    <div ref={containerRef} className="w-full h-full rounded-[24px] bg-black/20 border border-white/6 overflow-hidden relative cursor-pointer group">
      <div className="absolute inset-0 opacity-70 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-px p-3">
        {palette.map((color, idx) => (
          <div
            key={`${color}-${idx}`}
            className="rounded-lg transition-transform duration-300 ease-out"
            style={{
              background: color,
              transform: `scale(${1 + (idx % 5) * 0.01}) rotate(${(idx % 7) - 3}deg)`
            }}
          />
        ))}
      </div>
      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/80 text-xs tracking-wide uppercase">
        <span className="w-2 h-2 rounded-full bg-current animate-ping" />
        Artboard Remix
      </div>
      <div className="absolute top-4 right-4 text-xs text-white/70 flex items-center gap-1">
        <Sparkles className="w-3.5 h-3.5" />
        Live Palette
      </div>
    </div>
  );
}

function generatePalette(seed = Math.random()): string[] {
  const bases = [
    '#7DD3FC', '#FDE68A', '#FBCFE8', '#C4B5FD', '#A7F3D0', '#FCE7F3', '#FECACA', '#BFDBFE'
  ];
  const palette: string[] = [];
  let localSeed = seed;
  const rand = () => {
    localSeed = (localSeed * 9301 + 49297) % 233280;
    return localSeed / 233280;
  };
  for (let i = 0; i < 36; i++) {
    const base = bases[Math.floor(rand() * bases.length)];
    palette.push(tintColor(base, rand() * 0.22 - 0.02));
  }
  return palette;
}

function shiftPalette(prev: string[]): string[] {
  return prev.map(color => tintColor(color, (Math.random() - 0.5) * 0.12));
}

function tintColor(hex: string, delta: number): string {
  const [r, g, b] = hexToRgb(hex);
  const adjust = (v: number) => Math.max(0, Math.min(255, Math.round(v + 255 * delta)));
  return rgbToHex(adjust(r), adjust(g), adjust(b));
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '');
  const bigint = parseInt(normalized, 16);
  return [
    (bigint >> 16) & 255,
    (bigint >> 8) & 255,
    bigint & 255,
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

function ProfileDialog({ persona, open, onClose }: { persona: PersonaId; open: boolean; onClose: () => void }) {
  if (!open) return null;

  const profile = PERSONA_PROFILES[persona];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-w-lg w-full rounded-3xl bg-[rgb(var(--surface))] border border-[rgb(var(--border))] shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white/80 hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))]"
          aria-label="Close profile dialog"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="grid md:grid-cols-[1.1fr_1fr] gap-0">
          <div className="relative bg-gradient-to-br from-[rgb(var(--accent))]/25 to-transparent p-6 flex flex-col gap-4 justify-center">
            <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border border-white/20 shadow-lg">
              <img src={profile.img} alt={profile.name} className="w-full h-full object-cover" draggable={false} />
            </div>
            <div className="flex gap-2">
              <OutboundLink icon={<Linkedin className="w-4 h-4" />} href="https://linkedin.com/in/hanthaonguyen/" label="LinkedIn" />
              <OutboundLink icon={<Github className="w-4 h-4" />} href="https://github.com/nguye340" label="GitHub" />
              <OutboundLink icon={<Mail className="w-4 h-4" />} href="mailto:nguyenthaohan214@gmail.com" label="Gmail" />
            </div>
          </div>
          <div className="p-6 md:p-8 flex flex-col gap-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[rgb(var(--accent))]/80">
                <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--accent))]" />
                persona
              </span>
              <h2 className="mt-2 text-2xl font-semibold text-[rgb(var(--fg))]">{profile.name}</h2>
              <p className="text-sm text-[rgb(var(--sub))]">{profile.title}</p>
            </div>
            <p className="text-[rgb(var(--fg))]/85 leading-relaxed">{profile.blurb}</p>
            <button
              onClick={onClose}
              className="mt-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-[rgb(var(--accent))] text-black font-medium shadow-sm hover:shadow-md transition"
            >
              Got it
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OutboundLink({ icon, href, label }: { icon: ReactNode; href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/30 text-white/80 text-xs font-medium transition hover:bg-black/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))]"
    >
      {icon}
      {label}
    </a>
  );
}

async function computeGifDuration(src: string, fallback: number): Promise<number> {
  if (GIF_DURATION_CACHE.has(src)) return GIF_DURATION_CACHE.get(src)!;
  if (typeof window === 'undefined') return fallback;
  try {
    const response = await fetch(src, { cache: 'force-cache' });
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let offset = 0;
    const ensure = (step: number) => {
      if (offset + step <= bytes.length) return true;
      offset = bytes.length;
      return false;
    };
    if (!ensure(6)) return fallback;
    offset += 6; // GIF87a/GIF89a
    if (!ensure(7)) return fallback;
    const packed = bytes[offset + 4];
    const hasGlobalTable = (packed & 0x80) !== 0;
    const gctSize = hasGlobalTable ? 3 * (1 << ((packed & 0x07) + 1)) : 0;
    offset += 7 + gctSize;

    let duration = 0;
    let lastDelay = 100;

    const readSubBlocks = () => {
      while (offset < bytes.length) {
        const size = bytes[offset++];
        if (size === 0) break;
        offset += size;
      }
    };

    while (offset < bytes.length) {
      const blockId = bytes[offset++];
      if (blockId === 0x3B) break; // trailer
      if (blockId === 0x21) { // extension
        const label = bytes[offset++];
        if (label === 0xF9) { // graphic control extension
          const blockSize = bytes[offset++]; // typically 4
          if (blockSize === 4 && offset + 4 <= bytes.length) {
            // packed, delay, transparent index
            const delay = bytes[offset + 1] | (bytes[offset + 2] << 8);
            lastDelay = Math.max(delay * 10, 20); // convert to ms, fallback 200ms
          }
          offset += blockSize;
          offset++; // block terminator
        } else {
          readSubBlocks();
        }
      } else if (blockId === 0x2C) { // image descriptor
        if (!ensure(9)) break;
        offset += 9;
        if (!ensure(1)) break;
        const localPacked = bytes[offset++];
        if (localPacked & 0x80) {
          const tableSize = 3 * (1 << ((localPacked & 0x07) + 1));
          offset += tableSize;
        }
        if (!ensure(1)) break;
        offset++; // LZW min code size
        readSubBlocks();
        duration += lastDelay;
      } else {
        readSubBlocks();
      }
    }

    const total = duration || fallback;
    GIF_DURATION_CACHE.set(src, total);
    return total;
  } catch {
    return fallback;
  }
}

async function getStateDuration(state: JackState): Promise<number> {
  if (state === 'idle') {
    const base = await computeGifDuration(CYBER_GIFS.idle, FALLBACK_DURATIONS.idle);
    return Math.max(base, FALLBACK_DURATIONS.idle);
  }
  const duration = await computeGifDuration(CYBER_GIFS[state], FALLBACK_DURATIONS[state]);
  return Math.max(duration, FALLBACK_DURATIONS[state]);
}

export default function App() {
  const [persona, setPersona] = usePersona();                 // "sec" | "dev" | "game" | "art"
  const [mode, setMode] = useState<"dark" | "light">("dark"); // page theme
  useTheme(persona, mode); // <-- sets data-persona & data-theme on <html>
  const [showHelloOverlay, setShowHelloOverlay] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (!showHelloOverlay) return;
    let cancelled = false;
    let timeout: number | null = null;
    (async () => {
      const ms = await computeGifDuration(CYBER_GIFS.hello, FALLBACK_DURATIONS.hello);
      if (cancelled) return;
      timeout = window.setTimeout(() => {
        if (!cancelled) setShowHelloOverlay(false);
      }, ms);
    })();
    return () => {
      cancelled = true;
      if (timeout !== null) window.clearTimeout(timeout);
    };
  }, [showHelloOverlay]);

  // Persona copy
  const sub = {
    sec: "Proactive Security Analyst with Experience in SIEM, Threat Hunting, and DFIR",
    dev: "Full-Stack Developer specializing in MERN, .NET, and Cloud Infrastructure",
    game: "Gameplay & Systems Developer experienced in Unity, Unreal, Utils Development, ML/AI in gameplay, and Interaction Design",
    art: "Visual Communication & UX Designer crafting accessible and engaging experiences",
  }[persona] as string;

  // Map persona to Supabase persona values
  const personaMap = {
    sec: "cyber",
    dev: "soft",
    game: "game",
    art: "art",
  } as const;

  const captainRiv = new URL('./assets/captain.riv', import.meta.url).href;
  const catsmithRiv = new URL('./assets/catsmith4.riv', import.meta.url).href;


  return (
    <div className="min-h-screen flex flex-col relative bg-[rgb(var(--bg))] text-[rgb(var(--fg))]">
      {/* Background layer with animated underlay */}
      <PersonaUnderlay persona={persona} />

      {/* Content wrapper with z-index to appear above the underlay */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
      <header className={`sticky top-0 z-40 border-b border-[rgb(var(--border))] ${mode === 'dark' ? 'bg-[rgb(var(--surface))]/80' : 'bg-white'} backdrop-blur`}>
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2 font-semibold rounded-full px-2 py-1 transition hover:bg-[rgb(var(--surface))]/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))]"
          >
            <img
              src={persona === 'sec' || persona === 'dev' ? PERSONA_PROFILES.sec.img : PERSONA_PROFILES.art.img}
              alt="Portrait of Han T. Nguyen"
              className="h-8 w-8 rounded-full object-cover border border-white/20"
              draggable={false}
            />
            <span>Han T. Nguyen</span>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <PersonaSwitch value={persona} onChange={setPersona} />
            <button 
              className="relative w-14 h-7 rounded-full p-0.5 transition-colors duration-300 border border-[rgb(var(--border))] bg-white dark:bg-slate-800"
              onClick={() => setMode(m => (m === "dark" ? "light" : "dark"))}
              aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              <div className="relative w-full h-full overflow-hidden rounded-full">
                {/* Track background */}
                <div className={`absolute inset-0 transition-colors duration-300 ${mode === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
                
                {/* Show inactive icon on the opposite side */}
                <div className="absolute inset-0 flex items-center">
                  {mode === 'dark' ? (
                    <div className="absolute left-2">
                      <Sun className="w-3.5 h-3.5 text-amber-400/70" />
                    </div>
                  ) : (
                    <div className="absolute right-2">
                      <Moon className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  )}
                </div>
                
                {/* Thumb with active icon */}
                <div 
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 flex items-center justify-center ${mode === 'dark' ? 'right-0.5' : 'left-0.5'}`}
                >
                  {mode === 'dark' ? (
                    <Moon className="w-3 h-3 text-slate-700" />
                  ) : (
                    <Sun className="w-3 h-3 text-amber-500" />
                  )}
                </div>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-10 space-y-12">
        {/* Hero */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-[1.25fr_0.75fr] items-center gap-6">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-3 py-1 text-sm">
                <span>{persona.toUpperCase()}</span>
              </div>
              <BigTitle
                text={
                  persona === "sec"  ? "Cyber Analyst" :
                  persona === "dev"  ? "Software Engineer" :
                  persona === "game" ? "Game Developer" :
                                      "UI/UX Designer"
                }
              />
              <p className="mt-3 text-[rgb(var(--sub))] max-w-2xl">{sub}</p>
            </div>
            {persona === 'sec' && (
              <div className="relative w-full h-[360px] md:h-[420px] rounded-[32px]">
              <div className="absolute inset-0 rounded-[inherit] bg-[rgb(var(--surface))]/65 border border-white/12 shadow-[0_25px_60px_rgba(0,0,0,0.45)] backdrop-blur-md" />
                <div className="absolute top-4 left-5 flex items-center gap-2 pointer-events-none z-20">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f57]/80" />
                  <span className="w-3 h-3 rounded-full bg-[#febc2e]/80" />
                  <span className="w-3 h-3 rounded-full bg-[#28c840]/80" />
                </div>
              <div className="absolute inset-0 pt-8 pb-6 px-6">
                {showHelloOverlay ? (
                  <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[inherit]">
                    <img
                      src={`${CYBER_GIFS.hello}?overlay`}
                      alt="Greeting animation"
                      className="w-full h-full object-contain pointer-events-none select-none"
                      draggable={false}
                    />
                  </div>
                ) : (
                  <CyberGifActor />
                )}
              </div>
              <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/45 shadow-lg backdrop-blur-sm text-xs text-white/85 pointer-events-none flex items-center gap-1.5">
                <MousePointerClick className="w-3.5 h-3.5" />
                <span>Click anywhere</span>
              </div>
            </div>
            )}
            {persona === 'dev' && (
              <div className="relative w-full h-[400px] md:h-[480px] rounded-xl overflow-hidden">
                <RiveCanvas
                  src={captainRiv}
                  fit="cover"
                  stateMachine="StateMachine_Idle_Blink"
                  style={{ transform: 'scale(1.5)', transformOrigin: 'center' }}
                />
                <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-xs text-white/80 pointer-events-none flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5" />
                  <span>Move your mouse</span>
                </div>
              </div>
            )}
            {persona === 'game' && (
              <div className="relative w-full h-[360px] md:h-[420px] rounded-xl overflow-hidden">
                <RiveCanvas src={catsmithRiv} fit="cover" stateMachine="State Machine 1" />
                <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-xs text-white/80 pointer-events-none flex items-center gap-1.5">
                  <MousePointerClick className="w-3.5 h-3.5" />
                  <span>Click to interact</span>
                </div>
              </div>
            )}
            {persona === 'art' && (
              <div className="relative w-full h-[360px] md:h-[420px] rounded-[32px]">
                <div className="absolute inset-0 rounded-[inherit] bg-[rgb(var(--surface))]/50 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-md" />
                <div className="absolute top-4 left-5 flex items-center gap-2 pointer-events-none z-20">
                  <span className="w-3 h-3 rounded-full bg-[#34d399]/80" />
                  <span className="w-3 h-3 rounded-full bg-[#38bdf8]/80" />
                  <span className="w-3 h-3 rounded-full bg-[#f472b6]/80" />
                </div>
                <div className="absolute inset-0 pt-9 pb-7 px-7">
                  <ArtPersonaCanvas />
                </div>
                <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/45 shadow-lg backdrop-blur-sm text-xs text-white/85 pointer-events-none flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Hover to remix</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Projects */}
        <section>
          <h2 className="text-xl md:text-2xl font-semibold text-accent">Projects</h2>
          <TagBar persona={persona} />
          <ProjectsGrid persona={personaMap[persona]} />
        </section>
        {/* Game persona galleries */}
        {persona === 'game' && (
          <section>
            <GameGallery />
          </section>
        )}
        {/* Experience Timeline */}
        <ExperienceHud persona={personaMap[persona]} />
      </main>

      <Footer />
      <ProfileDialog
        persona={persona}
        open={showProfile}
        onClose={() => setShowProfile(false)}
      />
      <PersonaUnderlay persona={persona} />
      {/* Floating contact chip (always-on CTA) */}
      <ContactChip />
      </div>
    </div>
  );
}

function RiveCanvas({ src, fit = 'cover', stateMachine, className = 'w-full h-full', style }: { src: string; fit?: 'cover' | 'contain'; stateMachine?: string; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const riveRef = useRef<Rive | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const syncCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    };

    syncCanvasSize();

    try {
      const instance = new Rive({
        src,
        canvas,
        autoplay: true,
        stateMachines: stateMachine ? [stateMachine] : undefined,
        layout: new Layout({ fit: fit === 'contain' ? Fit.Contain : Fit.Cover }),
      });
      riveRef.current = instance;
    } catch (e) {
      console.error('Rive init error', e);
    }

    const ro = new ResizeObserver(() => {
      syncCanvasSize();
      riveRef.current?.resizeDrawingSurfaceToCanvas?.();
    });
    ro.observe(canvas);

    const invokePointer = (method: 'pointerMove' | 'pointerDown' | 'pointerUp', event: PointerEvent) => {
      const inst = riveRef.current as any;
      if (!inst?.[method]) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width || 1;
      const scaleY = canvas.height / rect.height || 1;
      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;
      inst[method](x, y);
    };

    const handlePointerMove = (event: PointerEvent) => {
      invokePointer('pointerMove', event);
    };

    const handlePointerDown = (event: PointerEvent) => {
      canvas.setPointerCapture?.(event.pointerId);
      invokePointer('pointerDown', event);
    };

    const handlePointerUp = (event: PointerEvent) => {
      invokePointer('pointerUp', event);
      canvas.releasePointerCapture?.(event.pointerId);
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);

    return () => {
      ro.disconnect();
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerUp);
      riveRef.current?.cleanup?.();
    };
  }, [src, fit, stateMachine]);

  return <canvas ref={ref} className={className} style={{ ...style, background: 'transparent' }} />;
}

function CyberGifActor({ active = true }: { active?: boolean }) {
  const [playback, setPlayback] = useState<{ state: JackState; token: number }>({ state: 'idle', token: 0 });
  const stateRef = useRef<JackState>('idle');
  const timerRef = useRef<number | null>(null);
  const idleLoopsRef = useRef<number>(0);
  const agreeActiveRef = useRef<boolean>(false);
  const pendingScheduleRef = useRef<boolean>(true);
  const scheduleSeqRef = useRef<number>(0);

  useEffect(() => {
    Object.values(CYBER_GIFS).forEach(preloadGif);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const changeState = useCallback((next: JackState) => {
    clearTimer();
    stateRef.current = next;
    pendingScheduleRef.current = true;
    agreeActiveRef.current = next === 'agree';
    setPlayback(prev => ({ state: next, token: prev.token + 1 }));
  }, [clearTimer]);

  const scheduleWithDelay = useCallback((state: JackState, duration: number) => {
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      if (stateRef.current !== state) return;
      if (state === 'idle') {
        idleLoopsRef.current += 1;
        if (idleLoopsRef.current >= IDLE_LOOPS_BEFORE_LOOKAROUND) {
          idleLoopsRef.current = 0;
          changeState('lookaround');
        } else {
          changeState('idle');
        }
      } else if (state === 'lookaround') {
        idleLoopsRef.current = 0;
        changeState('idle');
      } else if (state === 'agree') {
        idleLoopsRef.current = 0;
        changeState('idle');
      }
    }, duration);
  }, [changeState, clearTimer]);

  const scheduleNext = useCallback((state: JackState) => {
    clearTimer();
    scheduleSeqRef.current += 1;
    const seq = scheduleSeqRef.current;

    getStateDuration(state)
      .then((duration) => {
        if (scheduleSeqRef.current !== seq) return;
        scheduleWithDelay(state, duration);
      })
      .catch(() => {
        if (scheduleSeqRef.current !== seq) return;
        scheduleWithDelay(state, FALLBACK_DURATIONS[state]);
      });
  }, [scheduleWithDelay, clearTimer]);

  const handleImageLoad = useCallback(() => {
    if (!pendingScheduleRef.current || !active) return;
    pendingScheduleRef.current = false;
    scheduleNext(stateRef.current);
  }, [scheduleNext, active]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  useEffect(() => {
    if (!active) return;
    const handleClick = () => {
      if (agreeActiveRef.current || stateRef.current !== 'idle') return;
      changeState('agree');
    };
    window.addEventListener('pointerdown', handleClick);
    return () => window.removeEventListener('pointerdown', handleClick);
  }, [changeState, active]);

  useEffect(() => {
    pendingScheduleRef.current = true;
    if (active) {
      scheduleNext(stateRef.current);
    } else {
      clearTimer();
    }
  }, [active, scheduleNext, clearTimer]);

  const displaySrc = `${CYBER_GIFS[playback.state]}?v=${playback.token}`;

  return (
    <div className={`w-full h-full rounded-xl overflow-hidden transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-0'}`}>
      <img
        src={displaySrc}
        onLoad={handleImageLoad}
        alt="Animated cyber analyst character"
        className="w-full h-full object-contain pointer-events-none select-none rounded-[inherit]"
        draggable={false}
      />
    </div>
  );
}

function TagBar({ persona }: { persona: 'sec' | 'dev' | 'game' | 'art' }) {
  const tags = (
    persona === 'sec' ? [
      "SIEM",
      "Threat Hunting",
      "Incident Response",
      "DFIR",
      "Malware Analysis",
      "Azure Sentinel",
      "Splunk",
      "MITRE ATT&CK",
      "Python",
      "Bash Automation",
    ] : persona === 'dev' ? [
      "Full-Stack Development",
      "API Design",
      "MERN Stack",
      ".NET (C#)",
      "Spring Boot",
      "RESTful Services",
      "CI/CD",
      "Docker",
      "AWS",
      "Azure",
      "Database Design",
      "DevOps",
      "Agile/Scrum",
      "Secure Coding",
      "Automation",
      "Java",
      "MongoDB",
      "Firebase",
      "Angular",
      "React",
      "Material UI",
      "Bootstrap",
      "Tailwind CSS",
      "Python",
      "Flask",
      "Supabase",
      "Agile SDLC",
      "JIRA",
      "Creative Problem Solving",
    ] : persona === 'game' ? [
      "C++",
      "Unreal Engine 5",
      "Unity",
      "Gameplay Programming",
      "AI Systems",
      "Behavior Trees",
      "Gesture Recognition",
      "$Q Recognizer",
      "Shader Design",
      "3D Modeling",
      "Animation",
      "Level Design",
      "Blueprints",
      "Dialogue Systems",
      "Game AI",
      "Blender",
      "Clip Studio Paint",
      "Photoshop",
    ] : [
      "UI/UX Design",
      "Visual Communication",
      "Accessibility",
      "Graphic Design",
      "Information Hierarchy",
      "Typography",
      "Color Psychology",
      "Figma",
      "Canva",
      "Clip Studio Paint",
      "Design Thinking",
      "Branding",
      "Prototyping",
      "Responsive Layouts",
      "Community Outreach",
      "Rive",
      "Blender",
    ]
  );
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {tags.map(tag => (
        <Chip key={tag}>{tag}</Chip>
      ))}
    </div>
  );
}

function Footer() {
  return (
    <footer 
      className="mt-auto pt-16 pb-6 text-center text-sm"
      style={{ color: "rgb(var(--sub))" }}
    >
      © {new Date().getFullYear()} Han T Nguyen • Built with React
    </footer>
  );
}
