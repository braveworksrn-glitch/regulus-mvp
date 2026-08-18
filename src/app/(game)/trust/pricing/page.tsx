import { SimBadge } from "@/components/game/ui";

export const metadata = { title: "Pricing vs. DIY — Regulus" };

const ROWS = [
  ["Find and underwrite the lot", "50–100 parcels reviewed per lot bought; months of auction lists and county calls", "Done — we reject 80–90% of what we underwrite"],
  ["Win it at auction / land bank", "Deposit, bidding, deed processing, redemption-risk homework", "County acquisition price shown to you as-is"],
  ["Cure the title", "$2,500–$4,500 in legal fees and 6–12 months of quiet-title work", "Included and finished before listing"],
  ["Title insurance", "Hard to bind on tax titles without cure", "Bound before the lot is listed"],
  ["Legal container", "Form an LLC, registered agent, annual filings", "Series LLC included — you own 100%"],
  ["Taxes & upkeep", "Track county bills, mowing, liability insurance yourself", "24 months prepaid in the price, then at-cost servicing (~$6–8/mo)"],
  ["Improvements", "Find rural crews who answer the phone; 30–50% no-show rates", "Retainer-contracted crews, photo-verified, refund on ETA blowout"],
];

export default function PricingPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-900">What the curation fee actually buys</h1>
      <p className="text-stone-600 text-sm mt-2 max-w-2xl">
        You could do all of this yourself — some of our best future customers have. Here
        is the honest comparison, line by line. Quiet title alone typically costs
        $2,500–$4,500 in legal fees before you ever touch the land.
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-[560px]">
          <thead>
            <tr className="text-left border-b-2 border-stone-300">
              <th className="py-2 pr-4 text-stone-900">Step</th>
              <th className="py-2 pr-4 text-stone-900">Doing it yourself</th>
              <th className="py-2 text-stone-900">With Regulus</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([a, b, c]) => (
              <tr key={a} className="border-b border-stone-200 align-top">
                <td className="py-2.5 pr-4 font-medium text-stone-900">{a}</td>
                <td className="py-2.5 pr-4 text-stone-600">{b}</td>
                <td className="py-2.5 text-emerald-800">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-5 text-sm">
        <h2 className="font-bold text-stone-900 mb-2">The curation fee, broken down <SimBadge label="Illustrative" /></h2>
        <ul className="space-y-1 text-stone-700">
          <li className="flex justify-between"><span>Sourcing & underwriting (per lot share)</span><span>$350</span></li>
          <li className="flex justify-between"><span>Title-cure management</span><span>$300</span></li>
          <li className="flex justify-between"><span>Entity & document administration</span><span>$300</span></li>
          <li className="flex justify-between font-bold border-t border-stone-200 pt-1.5 mt-1.5"><span>Flat curation fee</span><span>$950</span></li>
        </ul>
        <p className="text-xs text-stone-500 mt-3">
          Improvements are priced as vendor cost + a disclosed 22% service fee, published
          per county. Improvements may cost more than they add to resale value — owners
          do them for access, build-readiness, and use.
        </p>
      </div>
    </main>
  );
}
