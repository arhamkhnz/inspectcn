function App() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-5 text-slate-50">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-slate-950/40 backdrop-blur">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-cyan-300/80">
            WXT Starter
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            Tailwind is wired into the popup
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Update this component and use Tailwind utility classes directly in
            your extension UI.
          </p>
        </div>

        <div className="grid gap-3 rounded-3xl border border-white/10 bg-slate-900/80 p-4">
          <div className="rounded-2xl bg-cyan-400 px-3 py-2 text-sm font-medium text-slate-950">
            Tailwind v4 via <code>@tailwindcss/vite</code>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
            Entry stylesheet: <code>entrypoints/popup/style.css</code>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
            Vite plugin: <code>wxt.config.ts</code>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
