import { SiteFooter, SiteHeader, TrustStrip } from "@/components/game/ui";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col">
      <TrustStrip />
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
