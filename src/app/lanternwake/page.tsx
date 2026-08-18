import type { Metadata } from "next";
import LanternwakeApp from "../../game/ui";

export const metadata: Metadata = {
  title: "Lanternwake — a night-fishing discipline trainer",
  description:
    "A cozy fishing-village sim whose mechanics map 1:1 to trading primitives. Simulated waters only — a trainer for pre-commitment habits.",
};

export default function LanternwakePage() {
  return <LanternwakeApp />;
}
