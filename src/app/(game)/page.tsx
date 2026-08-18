import Link from "next/link";
import BeforeAfterScrubber from "@/components/game/BeforeAfterScrubber";
import { SimBadge } from "@/components/game/ui";
import GameWaitlistForm from "@/components/game/GameWaitlistForm";

export const metadata = {
  title: "Regulus — Own a real lot. Direct real crews. Watch it become build-ready.",
  description:
    "A title-cured land shop with a board-game soul. Real lots, real crews, verified photos — with honest itemized pricing and no financial promises.",
};

export default function Landing() {
  return (
    <main>
      {/* Hero — land-dream framing (spec §6.1), not gamer framing */}
      <section className="max-w-6xl mx-auto px-4 pt-14 pb-10 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="mb-3"><SimBadge label="Product demo — simulated inventory, no money collected" /></div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-stone-900">
            Own a real lot.<br />Direct real crews.<br />
            <span className="text-emerald-700">Watch it become build-ready.</span>
          </h1>
          <p className="mt-4 text-stone-600 text-lg">
            Regulus sells whole, title-cured lots in one county at transparent, itemized
            prices. You direct real improvements — clearing, survey, driveway — executed
            by retainer-contracted local crews and verified by geotagged photos that
            transform your tile on a living board.
          </p>
          <p className="mt-2 text-sm text-stone-500">
            No token. No ticker. No promises — except that the land, the deed, and the
            work are real.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/sandbox" className="rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-3 font-semibold">
              Try the free sandbox lot →
            </Link>
            <Link href="/board" className="rounded-xl border border-stone-300 hover:bg-stone-100 px-5 py-3 font-semibold text-stone-800">
              See the living board
            </Link>
          </div>
        </div>
        <div>
          <BeforeAfterScrubber />
          <p className="text-xs text-stone-500 mt-2 text-center">
            Drag the divider — every tile state change is backed by verified before/after photos.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-stone-200 py-12">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-6 text-sm">
          {[
            ["1 · Cured before listed", "No lot appears until quiet title is done and title insurance is bound. Your Deed exists because the paperwork does."],
            ["2 · You own 100%", "Each lot lives in its own series LLC — you hold the whole membership interest and you are the manager. Whole lots only, never fractions."],
            ["3 · Real crews, verified", "Order improvements à la carte at vendor cost + a disclosed 22% service fee. Geotagged 4-corner photos and county docs update your tile."],
            ["4 · Exit any day", "Deed-out to your own name for $500 flat, or sell off-platform — we process the assignment for a flat documentation fee."],
          ].map(([t, b]) => (
            <div key={t}>
              <h3 className="font-bold text-stone-900 mb-1">{t}</h3>
              <p className="text-stone-600">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Honest pricing teaser */}
      <section className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Pricing you can check against the county</h2>
          <p className="mt-2 text-stone-600 text-sm">
            Every lot shows the county acquisition price — the number you could look up
            yourself — plus itemized title cure, entity, insurance, and a flat curation
            fee. Improvements show vendor cost and our fee separately. We publish no
            valuations, run no marketplace, and take no percentage of anything you sell.
          </p>
          <Link href="/trust/pricing" className="inline-block mt-3 text-emerald-700 underline text-sm">
            Compare with doing it yourself →
          </Link>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 text-sm">
          <div className="flex justify-between py-1"><span>County acquisition price</span><span>$2,140</span></div>
          <div className="flex justify-between py-1"><span>Title cure + insurance bind</span><span>$1,890</span></div>
          <div className="flex justify-between py-1"><span>Series LLC + registered agent</span><span>$450</span></div>
          <div className="flex justify-between py-1"><span>Insurance + 24&nbsp;mo taxes prepaid</span><span>$380</span></div>
          <div className="flex justify-between py-1"><span>Curation fee (flat)</span><span>$950</span></div>
          <div className="flex justify-between py-2 mt-1 border-t border-stone-200 font-bold"><span>Total</span><span>$5,810</span></div>
          <div className="text-right"><SimBadge label="Example — simulated" /></div>
        </div>
      </section>

      {/* Waitlist */}
      <section className="bg-emerald-950 text-emerald-50 py-14">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold">Join the founding waitlist</h2>
          <p className="text-emerald-200/80 text-sm mt-2">
            First release: 25–50 title-cured lots in one county. Founding members get
            early access to lot releases and an invite to the on-site open-house day.
          </p>
          <div className="mt-5"><GameWaitlistForm source="landing" /></div>
        </div>
      </section>
    </main>
  );
}
