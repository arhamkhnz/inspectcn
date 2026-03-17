import { useEffect, useMemo, useState } from "react";

import { CheckIcon, CopyIcon, PaletteIcon, RocketIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  applyThemeDraftToDocument,
  buildCopyBlock,
  type CapturedThemeDraft,
  clearLocalhostThemeForOrigin,
  isLocalhostPage,
  readCapturedThemeDraft,
  readLocalhostThemeForOrigin,
  removeThemeDraftFromDocument,
  saveCapturedThemeDraft,
  saveLocalhostThemeForOrigin,
} from "@/lib/content-badge/theme-overrides";
import {
  buildThemeBlock,
  readThemeTokenSnapshots,
  type ThemeMode,
  type ThemeSnapshot,
  type ThemeTokenSnapshots,
} from "@/lib/content-badge/theme-tokens";

function TokenRows({
  copiedKey,
  mode,
  onCopy,
  snapshot,
}: {
  copiedKey: string | null;
  mode: ThemeMode;
  onCopy: (value: string, key: string) => Promise<void>;
  snapshot: ThemeSnapshot;
}) {
  return (
    <div className="flex flex-col gap-4">
      {snapshot.groups.map((group, groupIndex) => (
        <div key={`${mode}-${group.id}`} className="flex flex-col gap-2.5">
          {groupIndex > 0 ? <Separator /> : null}
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.08em]">
              {group.label}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {group.values.filter((token) => !token.isMissing).length}/{group.values.length}
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border bg-card/40">
            {group.values.map((token) => {
              const key = `${mode}-${token.cssVar}`;

              return (
                <div
                  key={key}
                  className="flex items-center gap-3 border-b bg-background/70 px-3 py-2.5 last:border-b-0"
                >
                  <span
                    className="size-7 shrink-0 rounded-md border bg-muted"
                    style={{
                      backgroundColor: token.isMissing ? undefined : token.value,
                      backgroundImage: token.isMissing
                        ? "linear-gradient(135deg, transparent 40%, color-mix(in oklab, var(--border) 85%, transparent) 40%, color-mix(in oklab, var(--border) 85%, transparent) 60%, transparent 60%)"
                        : undefined,
                    }}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-[11px] text-foreground">{token.cssVar}</p>
                    <p className="truncate font-mono text-[10px] text-muted-foreground">
                      {token.isMissing ? "Not found on this page" : token.value}
                    </p>
                  </div>

                  <Button
                    className="shrink-0"
                    disabled={token.isMissing}
                    onClick={() => onCopy(`${token.cssVar}: ${token.value};`, key)}
                    size="xs"
                    type="button"
                    variant="ghost"
                  >
                    <CopyIcon data-icon="inline-start" />
                    {copiedKey === key ? "Copied" : "Copy"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ThemeTokenInspector({ isOpen }: { isOpen: boolean }) {
  const [snapshots, setSnapshots] = useState<ThemeTokenSnapshots | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [capturedDraft, setCapturedDraft] = useState<CapturedThemeDraft | null>(null);
  const [appliedDraft, setAppliedDraft] = useState<CapturedThemeDraft | null>(null);

  const localhostMode = useMemo(() => isLocalhostPage(), []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSnapshots(readThemeTokenSnapshots());
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const readDrafts = async () => {
      setCapturedDraft(await readCapturedThemeDraft());
      setAppliedDraft(localhostMode ? await readLocalhostThemeForOrigin(window.location.origin) : null);
    };

    void readDrafts();
  }, [isOpen, localhostMode]);

  const copyValue = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    window.setTimeout(() => {
      setCopiedKey((current) => (current === key ? null : current));
    }, 1200);
  };

  const copyTheme = async (mode: ThemeMode) => {
    if (!snapshots) {
      return;
    }

    await copyValue(buildThemeBlock(mode, snapshots[mode]), `theme-${mode}`);
  };

  const captureCurrentTheme = async () => {
    if (!snapshots) {
      return;
    }

    const draft = await saveCapturedThemeDraft(snapshots);
    setCapturedDraft(draft);
    setCopiedKey("capture-saved");
    window.setTimeout(() => {
      setCopiedKey((current) => (current === "capture-saved" ? null : current));
    }, 1200);
  };

  const applyCapturedTheme = async () => {
    if (!capturedDraft || !localhostMode) {
      return;
    }

    await saveLocalhostThemeForOrigin(window.location.origin, capturedDraft);
    applyThemeDraftToDocument(capturedDraft);
    setAppliedDraft(capturedDraft);
    setSnapshots(readThemeTokenSnapshots());
  };

  const clearAppliedTheme = async () => {
    if (!localhostMode) {
      return;
    }

    await clearLocalhostThemeForOrigin(window.location.origin);
    removeThemeDraftFromDocument();
    setAppliedDraft(null);
    setSnapshots(readThemeTokenSnapshots());
  };

  const copyCapturedTheme = async (mode: ThemeMode) => {
    if (!capturedDraft) {
      return;
    }

    await copyValue(buildCopyBlock(mode, capturedDraft), `captured-${mode}`);
  };

  const sourceLabel = capturedDraft ? new URL(capturedDraft.sourceUrl).hostname.replace(/^www\./, "") : null;
  const captureSummary = localhostMode
    ? capturedDraft
      ? `Captured theme ready for ${window.location.origin}`
      : "Capture a theme on any page, then apply it here."
    : capturedDraft
      ? `Saved from ${sourceLabel || "captured page"}`
      : "Save this page to reuse later on localhost.";
  const captureState = localhostMode ? (appliedDraft ? "Applied" : "Localhost") : capturedDraft ? "Saved" : null;

  if (!snapshots) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 font-medium text-foreground text-sm">
          <PaletteIcon />
          Theme tokens
        </div>
        <p className="text-muted-foreground text-sm">Open the inspector to read the page&apos;s shadcn tokens.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 rounded-xl border bg-card/50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="min-w-0 flex-1 text-foreground text-sm">{captureSummary}</p>
            {captureState ? <span className="text-[11px] text-muted-foreground">{captureState}</span> : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={captureCurrentTheme} size="xs" type="button" variant="outline">
              {copiedKey === "capture-saved" ? (
                <CheckIcon data-icon="inline-start" />
              ) : (
                <PaletteIcon data-icon="inline-start" />
              )}
              {capturedDraft ? "Refresh capture" : "Capture theme"}
            </Button>

            {capturedDraft ? (
              <>
                <Button onClick={() => copyCapturedTheme("light")} size="xs" type="button" variant="ghost">
                  <CopyIcon data-icon="inline-start" />
                  {copiedKey === "captured-light" ? "Copied :root" : "Copy :root"}
                </Button>
                <Button onClick={() => copyCapturedTheme("dark")} size="xs" type="button" variant="ghost">
                  <CopyIcon data-icon="inline-start" />
                  {copiedKey === "captured-dark" ? "Copied .dark" : "Copy .dark"}
                </Button>
              </>
            ) : null}

            {localhostMode ? (
              <>
                <Button
                  disabled={!capturedDraft}
                  onClick={applyCapturedTheme}
                  size="xs"
                  type="button"
                  variant="secondary"
                >
                  <RocketIcon data-icon="inline-start" />
                  Apply to localhost
                </Button>
                <Button disabled={!appliedDraft} onClick={clearAppliedTheme} size="xs" type="button" variant="ghost">
                  Reset local
                </Button>
              </>
            ) : null}
          </div>

          {capturedDraft ? (
            <p className="truncate text-[11px] text-muted-foreground">
              {capturedDraft.sourceTitle || capturedDraft.sourceUrl}
            </p>
          ) : null}
        </div>
      </div>

      <Separator />

      <Tabs className="min-h-0 flex-1 gap-3 p-4" defaultValue="light">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="light">Light</TabsTrigger>
            <TabsTrigger value="dark">Dark</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent className="mt-0 flex min-h-0 flex-1 flex-col gap-3" value="light">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-muted-foreground text-xs">
              {snapshots.light.foundCount}/{snapshots.light.totalCount} tokens found
            </p>
            <Button onClick={() => copyTheme("light")} size="xs" type="button" variant="ghost">
              <CopyIcon data-icon="inline-start" />
              {copiedKey === "theme-light" ? "Copied" : "Copy :root"}
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <TokenRows copiedKey={copiedKey} mode="light" onCopy={copyValue} snapshot={snapshots.light} />
          </div>
        </TabsContent>

        <TabsContent className="mt-0 flex min-h-0 flex-1 flex-col gap-3" value="dark">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-muted-foreground text-xs">
              {snapshots.dark.foundCount}/{snapshots.dark.totalCount} tokens found
            </p>
            <Button onClick={() => copyTheme("dark")} size="xs" type="button" variant="ghost">
              <CopyIcon data-icon="inline-start" />
              {copiedKey === "theme-dark" ? "Copied" : "Copy .dark"}
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <TokenRows copiedKey={copiedKey} mode="dark" onCopy={copyValue} snapshot={snapshots.dark} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
