import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

import { CheckIcon, CopyIcon, LoaderCircleIcon, PaletteIcon, RocketIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  applyThemeDraftToDocument,
  buildCopyBlock,
  type CapturedThemeDraft,
  clearCapturedThemeDraft,
  clearLocalhostThemeForOrigin,
  isLocalhostPage,
  readCapturedThemeDraft,
  readLocalhostThemeForOrigin,
  removeThemeDraftFromDocument,
  saveCapturedThemeDraft,
  saveLocalhostThemeForOrigin,
} from "@/lib/content-badge/theme-overrides";
import {
  type ActiveThemeSnapshot,
  buildThemeBlock,
  readThemeTokenSnapshots,
  type ThemeSnapshot,
} from "@/lib/content-badge/theme-tokens";

export type ThemeTokenInspectorState = {
  appliedDraft: CapturedThemeDraft | null;
  applyCapturedTheme: () => Promise<void>;
  captureCurrentTheme: () => Promise<void>;
  captureState: string | null;
  captureSummary: string;
  capturedDraft: CapturedThemeDraft | null;
  clearCapturedTheme: () => Promise<void>;
  clearAppliedTheme: () => Promise<void>;
  copiedKey: string | null;
  copyCapturedTheme: () => Promise<void>;
  copyTheme: () => Promise<void>;
  copyValue: (value: string, key: string) => Promise<void>;
  isLoading: boolean;
  localhostMode: boolean;
  refresh: () => Promise<void>;
  snapshots: ActiveThemeSnapshot | null;
};

type IdleWindow = Window &
  typeof globalThis & {
    requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  };

function ThemeTokenRows({
  copiedKey,
  onCopy,
  snapshot,
}: {
  copiedKey: string | null;
  onCopy: (value: string, key: string) => Promise<void>;
  snapshot: ThemeSnapshot;
}) {
  return (
    <div className="flex flex-col gap-4">
      {snapshot.groups.map((group, groupIndex) => (
        <div key={group.id} className="flex flex-col gap-2.5">
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
              const key = token.cssVar;

              return (
                <div
                  key={key}
                  className="flex items-center gap-3 border-b bg-background/70 px-3 py-2.5 last:border-b-0"
                >
                  <span
                    className="size-7 shrink-0 rounded-md border bg-muted"
                    style={{
                      backgroundColor: token.isMissing ? undefined : token.previewValue,
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

export function ThemeTokenEmptyState() {
  return (
    <>
      <div className="flex items-center gap-2 font-medium text-foreground text-sm">
        <PaletteIcon />
        Theme tokens
      </div>
      <p className="text-muted-foreground text-sm">Open the inspector to read the page&apos;s shadcn tokens.</p>
    </>
  );
}

export function ThemeTokenLoadingState() {
  return (
    <>
      <div className="flex items-center gap-2 font-medium text-foreground text-sm">
        <LoaderCircleIcon className="animate-spin" />
        Reading active theme
      </div>
      <p className="text-muted-foreground text-sm">
        Sampling visible UI and resolving shadcn tokens for the current page state.
      </p>
    </>
  );
}

export function ThemeCapturePanel({ inspector }: { inspector: ThemeTokenInspectorState }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card/50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 flex-1 text-foreground text-sm">{inspector.captureSummary}</p>
        {inspector.captureState ? (
          <span className="text-[11px] text-muted-foreground">{inspector.captureState}</span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button disabled={inspector.isLoading} onClick={inspector.refresh} size="xs" type="button" variant="ghost">
          {inspector.isLoading ? <LoaderCircleIcon className="animate-spin" data-icon="inline-start" /> : null}
          {inspector.isLoading ? "Reading..." : "Reread"}
        </Button>
        <Button
          disabled={inspector.isLoading}
          onClick={inspector.captureCurrentTheme}
          size="xs"
          type="button"
          variant="outline"
        >
          {inspector.copiedKey === "capture-saved" ? (
            <CheckIcon data-icon="inline-start" />
          ) : (
            <PaletteIcon data-icon="inline-start" />
          )}
          {inspector.capturedDraft ? "Refresh capture" : "Capture theme"}
        </Button>

        {inspector.capturedDraft ? (
          <>
            <Button onClick={inspector.copyCapturedTheme} size="xs" type="button" variant="ghost">
              <CopyIcon data-icon="inline-start" />
              {inspector.copiedKey === "captured-theme"
                ? `Copied ${inspector.capturedDraft?.mode === "dark" ? ".dark" : ":root"}`
                : `Copy ${inspector.capturedDraft?.mode === "dark" ? ".dark" : ":root"}`}
            </Button>
            <Button onClick={inspector.clearCapturedTheme} size="xs" type="button" variant="ghost">
              Clear saved
            </Button>
          </>
        ) : null}

        {inspector.localhostMode ? (
          <>
            <Button
              disabled={!inspector.capturedDraft}
              onClick={inspector.applyCapturedTheme}
              size="xs"
              type="button"
              variant="secondary"
            >
              <RocketIcon data-icon="inline-start" />
              Apply to localhost
            </Button>
            <Button
              disabled={!inspector.appliedDraft}
              onClick={inspector.clearAppliedTheme}
              size="xs"
              type="button"
              variant="ghost"
            >
              Reset local
            </Button>
          </>
        ) : null}
      </div>

      {inspector.isLoading ? <p className="text-[11px] text-muted-foreground">Refreshing active page tokens…</p> : null}

      {inspector.capturedDraft ? (
        <p className="truncate text-[11px] text-muted-foreground">
          {inspector.capturedDraft.sourceTitle || inspector.capturedDraft.sourceUrl}
        </p>
      ) : null}
    </div>
  );
}

export function ThemeTokenTabs({ inspector }: { inspector: ThemeTokenInspectorState }) {
  if (!inspector.snapshots) {
    return null;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">
          Active mode: {inspector.snapshots.mode === "dark" ? "Dark" : "Light"}
        </p>
        <p className="text-muted-foreground text-xs">
          {inspector.snapshots.snapshot.foundCount}/{inspector.snapshots.snapshot.totalCount} tokens found
        </p>
        <Button onClick={inspector.copyTheme} size="xs" type="button" variant="ghost">
          <CopyIcon data-icon="inline-start" />
          {inspector.copiedKey === "theme-active"
            ? `Copied ${inspector.snapshots.mode === "dark" ? ".dark" : ":root"}`
            : `Copy ${inspector.snapshots.mode === "dark" ? ".dark" : ":root"}`}
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        <ThemeTokenRows
          copiedKey={inspector.copiedKey}
          onCopy={inspector.copyValue}
          snapshot={inspector.snapshots.snapshot}
        />
      </div>
    </div>
  );
}

export function useThemeTokenInspector(isOpen: boolean): ThemeTokenInspectorState {
  const [snapshots, setSnapshots] = useState<ActiveThemeSnapshot | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [capturedDraft, setCapturedDraft] = useState<CapturedThemeDraft | null>(null);
  const [appliedDraft, setAppliedDraft] = useState<CapturedThemeDraft | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const localhostMode = useMemo(() => isLocalhostPage(), []);
  const refreshRequestRef = useRef(0);
  const openRefreshTimeoutRef = useRef<number | null>(null);
  const prewarmTimeoutRef = useRef<number | null>(null);

  const waitForNextPaint = () =>
    new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => resolve());
    });

  const waitForIdle = () =>
    new Promise<void>((resolve) => {
      const idleWindow = window as IdleWindow;

      if (typeof idleWindow.requestIdleCallback === "function") {
        idleWindow.requestIdleCallback(
          () => {
            resolve();
          },
          { timeout: 250 },
        );
        return;
      }

      setTimeout(() => resolve(), 0);
    });

  const refresh = useEffectEvent(async (showLoading = true) => {
    const requestId = refreshRequestRef.current + 1;
    refreshRequestRef.current = requestId;

    if (showLoading) {
      setIsLoading(true);
      await waitForNextPaint();
      await waitForNextPaint();
    }

    await waitForIdle();

    try {
      const nextSnapshots = await readThemeTokenSnapshots();
      const [nextCapturedDraft, nextAppliedDraft] = await Promise.all([
        readCapturedThemeDraft(),
        localhostMode ? readLocalhostThemeForOrigin(window.location.origin) : Promise.resolve(null),
      ]);

      if (refreshRequestRef.current !== requestId) {
        return;
      }

      setSnapshots(nextSnapshots);
      setCapturedDraft(nextCapturedDraft);
      setAppliedDraft(nextAppliedDraft);
    } finally {
      if (showLoading && refreshRequestRef.current === requestId) {
        setIsLoading(false);
      }
    }
  });

  useEffect(() => {
    if (isOpen || snapshots) {
      return;
    }

    prewarmTimeoutRef.current = window.setTimeout(() => {
      void refresh(false);
    }, 1200);

    return () => {
      if (prewarmTimeoutRef.current !== null) {
        window.clearTimeout(prewarmTimeoutRef.current);
        prewarmTimeoutRef.current = null;
      }
    };
  }, [isOpen, snapshots]);

  useEffect(() => {
    if (!isOpen) {
      if (openRefreshTimeoutRef.current !== null) {
        window.clearTimeout(openRefreshTimeoutRef.current);
        openRefreshTimeoutRef.current = null;
      }
      return;
    }

    if (openRefreshTimeoutRef.current !== null) {
      window.clearTimeout(openRefreshTimeoutRef.current);
    }

    openRefreshTimeoutRef.current = window.setTimeout(
      () => {
        void refresh(!snapshots);
        openRefreshTimeoutRef.current = null;
      },
      snapshots ? 180 : 120,
    );

    return () => {
      if (openRefreshTimeoutRef.current !== null) {
        window.clearTimeout(openRefreshTimeoutRef.current);
        openRefreshTimeoutRef.current = null;
      }
    };
  }, [isOpen, snapshots]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleRefresh = () => {
      if (document.visibilityState === "visible") {
        void refresh(false);
      }
    };

    document.addEventListener("visibilitychange", handleRefresh);
    window.addEventListener("focus", handleRefresh);

    return () => {
      document.removeEventListener("visibilitychange", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (openRefreshTimeoutRef.current !== null) {
        window.clearTimeout(openRefreshTimeoutRef.current);
      }

      if (prewarmTimeoutRef.current !== null) {
        window.clearTimeout(prewarmTimeoutRef.current);
      }
    };
  }, []);

  const copyValue = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    window.setTimeout(() => {
      setCopiedKey((current) => (current === key ? null : current));
    }, 1200);
  };

  const copyTheme = async () => {
    if (!snapshots) {
      return;
    }

    await copyValue(buildThemeBlock(snapshots.mode, snapshots.snapshot), "theme-active");
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
    await refresh();
  };

  const clearAppliedTheme = async () => {
    if (!localhostMode) {
      return;
    }

    await clearLocalhostThemeForOrigin(window.location.origin);
    removeThemeDraftFromDocument();
    setAppliedDraft(null);
    await refresh();
  };

  const clearCapturedTheme = async () => {
    await clearCapturedThemeDraft();
    setCapturedDraft(null);
    setCopiedKey((current) => (current === "capture-saved" || current === "captured-theme" ? null : current));
  };

  const copyCapturedTheme = async () => {
    if (!capturedDraft) {
      return;
    }

    await copyValue(buildCopyBlock(capturedDraft), "captured-theme");
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

  return {
    appliedDraft,
    applyCapturedTheme,
    captureCurrentTheme,
    captureState,
    captureSummary,
    capturedDraft,
    clearCapturedTheme,
    clearAppliedTheme,
    copiedKey,
    copyCapturedTheme,
    copyTheme,
    copyValue,
    isLoading,
    localhostMode,
    refresh,
    snapshots,
  };
}
