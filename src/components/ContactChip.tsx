import { Mail, Github, Linkedin } from "lucide-react";

export default function ContactChip() {
  return (
    <div className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full border px-3 py-2"
         style={{ background: "rgb(var(--surface))", borderColor: "rgb(var(--border))", color: "rgb(var(--fg))" }}>
      <a className="accent-ring rounded-full p-1" href="mailto:nguyenthaohan@gmail.com" aria-label="Email"><Mail className="h-4 w-4" /></a>
      <a className="accent-ring rounded-full p-1" href="https://github.com/nguye340" target="_blank"><Github className="h-4 w-4"/></a>
      <a className="accent-ring rounded-full p-1" href="https://www.linkedin.com/in/hanthaonguyen" target="_blank"><Linkedin className="h-4 w-4"/></a>
    </div>
  );
}
