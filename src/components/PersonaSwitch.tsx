import { PERSONAS } from "../persona";

export default function PersonaSwitch({
  value,
  onChange,
}: {
  value: (typeof PERSONAS)[number]["id"];
  onChange: (p: any) => void;
}) {
  return (
    <div className="nav-plate flex gap-1 rounded-full p-1 bg-[rgb(var(--surface))] border border-[rgb(var(--border))]">
      {PERSONAS.map((p, i) => {
        const Icon = p.icon;
        const active = value === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            className={`pill ${active ? "pill--active" : ""}`}
            title={`${p.label} • press ${i + 1}`}
            aria-label={p.label}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{p.label}</span>
          </button>
        );
      })}
    </div>
  );
}
