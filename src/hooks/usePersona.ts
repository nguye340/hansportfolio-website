import { useEffect, useState } from "react";
import type { PersonaId } from "../persona";
import { PERSONAS } from "../persona";

export function usePersona(): [PersonaId, (p: PersonaId) => void] {
  const initial = (): PersonaId => {
    const h = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    return PERSONAS.some(p => p.id === h) ? (h as PersonaId) : "sec";
  };
  const [p, setP] = useState<PersonaId>(initial);

  useEffect(() => {
    if (typeof window !== "undefined") window.location.hash = p;
  }, [p]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      const n = Number(e.key);
      if (n >= 1 && n <= 4) setP(PERSONAS[n - 1].id as PersonaId);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return [p, setP];
}
