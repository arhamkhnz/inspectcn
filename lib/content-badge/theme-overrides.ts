import { buildThemeBlock, type ThemeTokenSnapshots } from "@/lib/content-badge/theme-tokens";

const CAPTURED_THEME_KEY = "inspectcn:captured-theme";
const LOCALHOST_THEME_KEY = "inspectcn:localhost-themes";
const THEME_STYLE_ID = "inspectcn-theme-override";

export type CapturedThemeDraft = {
  capturedAt: number;
  sourceTitle: string;
  sourceUrl: string;
  snapshots: ThemeTokenSnapshots;
};

type LocalhostThemeMap = Record<string, CapturedThemeDraft>;

function getLocalhostMapValue(value: unknown): LocalhostThemeMap {
  return typeof value === "object" && value !== null ? (value as LocalhostThemeMap) : {};
}

export function isLocalhostPage(url = window.location.href) {
  try {
    const { hostname, protocol } = new URL(url);
    return protocol === "http:" && (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0");
  } catch {
    return false;
  }
}

export function buildThemeStyles(draft: CapturedThemeDraft) {
  const radiusLine = draft.snapshots.radius ? `  --radius: ${draft.snapshots.radius};\n` : "";

  return [
    ":root {",
    `${radiusLine}${draft.snapshots.light.groups
      .flatMap((group) => group.values)
      .filter((token) => !token.isMissing)
      .map((token) => `  ${token.cssVar}: ${token.value};`)
      .join("\n")}`,
    "}",
    "",
    ".dark {",
    `${draft.snapshots.dark.groups
      .flatMap((group) => group.values)
      .filter((token) => !token.isMissing)
      .map((token) => `  ${token.cssVar}: ${token.value};`)
      .join("\n")}`,
    "}",
  ].join("\n");
}

export function applyThemeDraftToDocument(draft: CapturedThemeDraft) {
  const style =
    document.getElementById(THEME_STYLE_ID) ?? Object.assign(document.createElement("style"), { id: THEME_STYLE_ID });

  style.textContent = buildThemeStyles(draft);
  document.head.append(style);
}

export function removeThemeDraftFromDocument() {
  document.getElementById(THEME_STYLE_ID)?.remove();
}

export async function readCapturedThemeDraft() {
  const stored = (await browser.storage.local.get(CAPTURED_THEME_KEY)) as Record<
    string,
    CapturedThemeDraft | undefined
  >;

  return stored[CAPTURED_THEME_KEY] ?? null;
}

export async function saveCapturedThemeDraft(snapshots: ThemeTokenSnapshots) {
  const draft: CapturedThemeDraft = {
    capturedAt: Date.now(),
    sourceTitle: document.title,
    sourceUrl: window.location.href,
    snapshots,
  };

  await browser.storage.local.set({
    [CAPTURED_THEME_KEY]: draft,
  });

  return draft;
}

export async function readLocalhostThemeForOrigin(origin: string) {
  const stored = (await browser.storage.local.get(LOCALHOST_THEME_KEY)) as Record<
    string,
    LocalhostThemeMap | undefined
  >;

  return getLocalhostMapValue(stored[LOCALHOST_THEME_KEY])[origin] ?? null;
}

export async function saveLocalhostThemeForOrigin(origin: string, draft: CapturedThemeDraft) {
  const stored = (await browser.storage.local.get(LOCALHOST_THEME_KEY)) as Record<
    string,
    LocalhostThemeMap | undefined
  >;
  const nextMap = {
    ...getLocalhostMapValue(stored[LOCALHOST_THEME_KEY]),
    [origin]: draft,
  };

  await browser.storage.local.set({
    [LOCALHOST_THEME_KEY]: nextMap,
  });

  return draft;
}

export async function clearLocalhostThemeForOrigin(origin: string) {
  const stored = (await browser.storage.local.get(LOCALHOST_THEME_KEY)) as Record<
    string,
    LocalhostThemeMap | undefined
  >;
  const nextMap = {
    ...getLocalhostMapValue(stored[LOCALHOST_THEME_KEY]),
  };

  delete nextMap[origin];

  await browser.storage.local.set({
    [LOCALHOST_THEME_KEY]: nextMap,
  });
}

export async function applyStoredLocalhostThemeForCurrentPage() {
  if (!isLocalhostPage()) {
    return null;
  }

  const draft = await readLocalhostThemeForOrigin(window.location.origin);

  if (draft) {
    applyThemeDraftToDocument(draft);
    return draft;
  }

  removeThemeDraftFromDocument();
  return null;
}

export function buildCopyBlock(mode: "light" | "dark", draft: CapturedThemeDraft) {
  return buildThemeBlock(mode, draft.snapshots[mode]);
}
