import { Shield, Code2, Gamepad2, Paintbrush } from "lucide-react";

export type PersonaId = "sec" | "dev" | "game" | "art";

export const PERSONAS = [
  { id: "sec",  label: "Cybersecurity", icon: Shield },
  { id: "dev",  label: "Software Dev",  icon: Code2 },
  { id: "game", label: "Game Dev",      icon: Gamepad2 },
  { id: "art",  label: "UI/UX",           icon: Paintbrush },
] as const;
