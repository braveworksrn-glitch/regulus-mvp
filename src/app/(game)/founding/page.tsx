import GameWaitlistForm from "@/components/game/GameWaitlistForm";

export const metadata = { title: "Founding members — Regulus" };

const PERKS = [
  ["🗺", "First pick", "Early access to the first 25–50 title-cured lots when the county opens."],
  ["🥾", "Open-house day", "Walk the actual county cluster with the founding crew before you decide anything."],
  ["📷", "Lot Zero front row", "Follow the founder's own lot through the full loop — purchase to deed-out — before a single customer lot sells."],
  ["🎩", "Founding rank", "Permanent founding badge; rank gates early access and crew scheduling priority — never fees."],
];

export default function FoundingPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-900">Founding members</h1>
      <p className="text-stone-600 text-sm mt-2">
        Regulus launches with one county, a small cluster of title-cured lots, and crews
        on retainer. Founding members get there first — and help decide what the platform
        becomes.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mt-8">
        {PERKS.map(([icon, t, b]) => (
          <div key={t} className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="text-2xl">{icon}</div>
            <h2 className="font-bold text-stone-900 mt-1">{t}</h2>
            <p className="text-sm text-stone-600 mt-1">{b}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-emerald-950 p-6">
        <h2 className="text-emerald-50 font-bold text-lg text-center mb-4">Join the founding waitlist</h2>
        <GameWaitlistForm source="founding" />
      </div>
    </main>
  );
}
