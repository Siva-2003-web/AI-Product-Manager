import Link from "next/link";

const dashboardCards = [
  {
    title: "Project Status",
    value: "Live",
    detail: "Your workspace is ready for use.",
  },
  {
    title: "AI Agents",
    value: "7 Active",
    detail: "Planning, design, and build agents online.",
  },
  {
    title: "Sync Health",
    value: "Stable",
    detail: "Auth and MongoDB connectivity are working.",
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#0a0a1a_0%,#0f0f2e_40%,#0a0a1a_100%)] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">
              AI Product Manager
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Dashboard
            </h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-white/10"
          >
            Back to Home
          </Link>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {dashboardCards.map((card) => (
            <article
              key={card.title}
              className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(15,15,40,0.9),rgba(20,20,50,0.85))] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl"
            >
              <p className="text-sm text-slate-400">{card.title}</p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {card.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {card.detail}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(15,15,40,0.9),rgba(20,20,50,0.85))] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
              Next step
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Open the product workspace
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              Your registration is complete. Use this dashboard as the landing
              zone after authentication, or swap the button below to point to
              your main builder app if you want a full handoff.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full bg-[linear-gradient(135deg,#7C3AED,#38BDF8)] px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
              >
                Go to Home
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-500/15 bg-cyan-500/5 p-6 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">
              Session
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>• Authenticated session available</li>
              <li>• MongoDB connection healthy</li>
              <li>• Redirect route now exists</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
