export const metadata = { title: "Deed-out ledger — Regulus" };

export default function DeedOutsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-900">Deed-out ledger</h1>
      <p className="text-stone-600 text-sm mt-2">
        Every completed $500 deed-out will be listed here with its county recorder link,
        so you can verify the exit works before you ever buy. We would rather show you an
        honest zero than a fake number.
      </p>

      <div className="mt-8 rounded-2xl border border-dashed border-stone-300 p-10 text-center">
        <div className="text-4xl">📄</div>
        <div className="mt-2 text-2xl font-bold text-stone-900">0 completed</div>
        <p className="text-sm text-stone-600 mt-1">
          Lot Zero — the founder&apos;s own lot — is first in line.
        </p>
      </div>

      <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="font-bold text-stone-900">The Lot Zero plan</h2>
        <ol className="mt-3 space-y-2 text-sm text-stone-700 list-decimal pl-5">
          <li>Founder buys Lot Zero through the exact same flow as any customer — itemized price, series LLC, escrowed funds.</li>
          <li>Full improvement path on camera: clearing, survey, perc, driveway, Build-Ready packet — every crew visit photo-verified and published.</li>
          <li>Then the $500 deed-out, end to end, with the recorded deed and county recorder link posted here.</li>
          <li>Only after Lot Zero&apos;s deed-out is public does the first customer lot go live.</li>
        </ol>
      </section>
    </main>
  );
}
