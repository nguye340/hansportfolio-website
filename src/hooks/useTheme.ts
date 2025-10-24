import { useEffect } from "react";
import type { PersonaId } from "../persona";

export function useTheme(persona: PersonaId, mode: "dark" | "light") {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-persona", persona);
    root.setAttribute("data-theme", mode);
  }, [persona, mode]);
}
