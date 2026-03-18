function App() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-4">
      <section className="w-full rounded-3xl border border-border/60 bg-card/95 p-4 text-card-foreground shadow-lg shadow-slate-950/8">
        <p className="font-pixel-line text-[11px] text-muted-foreground uppercase tracking-tight">InspectCN</p>
        <h1 className="mt-3 font-semibold text-lg tracking-tight">Use the page badge</h1>
        <p className="mt-2 text-muted-foreground text-sm leading-6">
          Open any page and click the <span className="font-medium text-foreground">CN</span> badge to inspect the
          currently active shadcn theme tokens.
        </p>
      </section>
    </main>
  );
}

export default App;
