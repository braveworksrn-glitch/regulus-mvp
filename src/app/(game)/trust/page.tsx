import Link from "next/link";

export const metadata = { title: "Trust — how ownership actually works — Regulus" };

const CARDS = [
  {
    title: "You own the whole lot — really",
    body: "Each lot lives in its own series of a series LLC. You buy 100% of the membership interest — whole lots only, never fractions — and the operating agreement makes you the manager. Every improvement is a service order you initiate and approve.",
  },
  {
    title: "Title cured before you ever see it",
    body: "No lot is listed until quiet title (or certification) is complete and title insurance is bound. Your digital Deed mints only at that moment. We never sell as-is tax titles.",
  },
  {
    title: "The $500 deed-out — your always-open exit",
    body: "Any day, for $500 flat plus recording costs, we convey the lot into your own name and you walk away from the platform entirely. This right lives in the operating agreement as an irrevocable term — it is what makes the Deed credible.",
  },
  {
    title: "Your money never sits with us",
    body: "Lot purchases and improvement funds flow through a licensed title/escrow partner. Vendor deposits are capped at 50%, with the balance released only on geotagged photo verification.",
  },
  {
    title: "The wind-down covenant",
    body: "If Regulus ever ceases operations: automatic deed-out at cost for every owner, an exportable archive of all your photos and documents, escrowed prepaid taxes, and a named successor servicer. The land outlives the platform.",
  },
  {
    title: "Guardrails on ourselves",
    body: "3-lot cap per account in your first 90 days. Cooling-off period on every purchase. No countdowns, streaks, or scarcity timers anywhere in the product. ETAs quoted in honest week ranges with automatic refunds on blowouts.",
  },
];

export default function TrustPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-900">How this actually works</h1>
      <p className="text-stone-600 text-sm mt-2 max-w-2xl">
        Regulus is a title-cured land shop with a board-game soul. The game layer is
        cosmetic; the land, deeds, crews, and documents are the product.
      </p>

      <div className="grid sm:grid-cols-2 gap-5 mt-8">
        {CARDS.map((c) => (
          <div key={c.title} className="rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="font-bold text-stone-900">{c.title}</h2>
            <p className="text-sm text-stone-600 mt-1.5">{c.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-stone-300 bg-stone-100 p-6">
        <h2 className="font-bold text-stone-900">What this is NOT</h2>
        <p className="text-sm text-stone-700 mt-2">
          No NFT. No token. No crypto. No blockchain. No fractional ownership. No
          valuations, tickers, or projections. No marketplace and no buyback guarantees.
          Regulus is not a financial product and is never marketed as one — it is about
          owning, building, land, and play. XP and ranks are cosmetic and non-transferable;
          they gate early access to lot releases and crew scheduling, never money.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link href="/trust/pricing" className="text-emerald-700 underline">Fee vs. doing it yourself →</Link>
        <Link href="/trust/deed-outs" className="text-emerald-700 underline">Deed-out ledger →</Link>
      </div>
    </main>
  );
}
