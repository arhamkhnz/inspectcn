import { Button } from "@/components/ui/button";

function App() {
  return (
    <main className="min-h-screen px-4 py-5">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
        <section className="rounded-3xl border border-border/60 bg-card/90 p-4 text-card-foreground shadow-slate-950/10 shadow-xl backdrop-blur">
          <p className="font-pixel-line text-muted-foreground text-xs uppercase tracking-tight">InspectCN</p>
          <h1 className="mt-3 font-semibold text-2xl tracking-tight">shadcn is wired into the popup</h1>
          <p className="mt-2 text-muted-foreground text-sm leading-6">
            The WXT popup is now using the generated shadcn button component and the shared Tailwind theme tokens.
          </p>
          <div className="mt-4 flex gap-2">
            <Button>Primary action</Button>
            <Button variant="outline">Secondary</Button>
          </div>
        </section>

        <section className="grid gap-3 rounded-3xl border border-border/60 bg-background/80 p-4 text-muted-foreground text-sm">
          <div className="rounded-2xl bg-muted px-3 py-2">
            UI source: <code>components/ui/button.tsx</code>
          </div>
          <div className="rounded-2xl bg-muted px-3 py-2">
            Theme CSS: <code>entrypoints/popup/style.css</code>
          </div>
          <div className="rounded-2xl bg-muted px-3 py-2">
            Registry config: <code>components.json</code>
          </div>
        </section>
        <section className="rounded-3xl border border-border/70 border-dashed bg-background/70 p-4 text-muted-foreground text-sm">
          Next sensible additions are <code>card</code>, <code>input</code>, and <code>separator</code> once you decide
          the popup layout.
        </section>
      </div>
    </main>
  );
}

export default App;
