import VerticalHudTimeline from "./VerticalHudTimeline";

export default function ExperienceHud() {
  return (
    <div className="relative p-6 rounded-xl overflow-hidden bg-gradient-to-br from-background to-muted/20 border border-border/50">
      <h2 className="text-2xl font-bold mb-8 text-foreground">Experience</h2>
      <VerticalHudTimeline />
    </div>
  );
}
