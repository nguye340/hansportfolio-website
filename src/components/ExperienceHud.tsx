import { useEffect, useState } from "react";
import VerticalHudTimeline from "./VerticalHudTimeline";
import { listTimeline, type Timeline, type TimelinePersona } from "../data/timeline";

export default function ExperienceHud({ persona }: { persona?: TimelinePersona }) {
  const [items, setItems] = useState<Timeline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await listTimeline({ persona });
        setItems(res);
      } finally {
        setLoading(false);
      }
    })();
  }, [persona]);

  return (
    <div className="relative p-6 rounded-xl overflow-hidden bg-gradient-to-br from-background to-muted/20 border border-border/50">
      <h2 className="text-2xl font-bold mb-8 text-foreground">Experience</h2>
      {loading ? <div className="opacity-70">Loading timeline…</div> : <VerticalHudTimeline items={items} />}
    </div>
  );
}
