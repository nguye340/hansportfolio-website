import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import ExperienceHud from "./components/ExperienceHud";

// hooks
import { useTheme } from "./hooks/useTheme";
import { usePersona } from "./hooks/usePersona";

// components
import PersonaSwitch from "./components/PersonaSwitch";
import PersonaUnderlay from "./components/PersonaUnderlay";
import ContactChip from "./components/ContactChip";
import ProjectsGrid from "./components/ProjectsGrid";
import BigTitle from "./components/BigTitle";
import Chip from "./components/Chip";

export default function App() {
  const [persona, setPersona] = usePersona();                 // "sec" | "dev" | "game" | "art"
  const [mode, setMode] = useState<"dark" | "light">("dark"); // page theme
  useTheme(persona, mode); // <-- sets data-persona & data-theme on <html>

  // Persona copy
  const sub = {
    sec: "Detections, response, and secure SDLC.",
    dev: "Full stack with CI and cloud.",
    game: "UE and Unity, input systems and feel.",
    art: "Painterly comic style, Rive, Blender.",
  }[persona] as string;

  // Map persona to Supabase persona values
  const personaMap = {
    sec: "cyber",
    dev: "soft",
    game: "game",
    art: "art",
  } as const;


  return (
    <div className="min-h-screen flex flex-col relative bg-[rgb(var(--bg))] text-[rgb(var(--fg))]">
      {/* Background layer with animated underlay */}
      <PersonaUnderlay persona={persona} />

      {/* Content wrapper with z-index to appear above the underlay */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
      <header className={`sticky top-0 z-40 border-b border-[rgb(var(--border))] ${mode === 'dark' ? 'bg-[rgb(var(--surface))]/80' : 'bg-white'} backdrop-blur`}>
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 font-semibold">
            <div className="h-6 w-6 rounded-xl bg-[rgb(var(--accent))]" />
            <span>Han T. Nguyen</span>
          </div>

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
        </section>

        {/* Projects */}
        <section>
          <h2 className="text-xl md:text-2xl font-semibold text-accent">Projects</h2>
          <TagBar />
          <ProjectsGrid persona={personaMap[persona]} />
        </section>
        {/* Experience Timeline */}
        <ExperienceHud persona={personaMap[persona]} />
      </main>

      <Footer />
      {/* Floating contact chip (always-on CTA) */}
      <ContactChip />
      </div>
    </div>
  );
}

function TagBar() {
  const tags = ["All", "AWS", "MERN", "UE5", "Unity", "ML", "Rive", "Splunk"];
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
