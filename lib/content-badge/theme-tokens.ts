export type ThemeMode = "light" | "dark";

export type TokenGroup = {
  id: string;
  label: string;
  tokens: string[];
};

export type TokenValue = {
  cssVar: `--${string}`;
  isMissing: boolean;
  value: string;
};

export type TokenGroupSnapshot = TokenGroup & {
  values: TokenValue[];
};

export type ThemeSnapshot = {
  foundCount: number;
  groups: TokenGroupSnapshot[];
  totalCount: number;
};

export type ThemeTokenSnapshots = {
  dark: ThemeSnapshot;
  light: ThemeSnapshot;
  radius: string;
};

export const TOKEN_GROUPS: TokenGroup[] = [
  {
    id: "surface",
    label: "Surface",
    tokens: [
      "background",
      "foreground",
      "card",
      "card-foreground",
      "popover",
      "popover-foreground",
      "border",
      "input",
      "ring",
    ],
  },
  {
    id: "semantic",
    label: "Semantic",
    tokens: [
      "primary",
      "primary-foreground",
      "secondary",
      "secondary-foreground",
      "muted",
      "muted-foreground",
      "accent",
      "accent-foreground",
      "destructive",
      "destructive-foreground",
    ],
  },
  {
    id: "charts",
    label: "Charts",
    tokens: ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"],
  },
  {
    id: "sidebar",
    label: "Sidebar",
    tokens: [
      "sidebar",
      "sidebar-foreground",
      "sidebar-primary",
      "sidebar-primary-foreground",
      "sidebar-accent",
      "sidebar-accent-foreground",
      "sidebar-border",
      "sidebar-ring",
    ],
  },
];

function normalizeValue(value: string) {
  return value.trim();
}

function readGroup(style: CSSStyleDeclaration, group: TokenGroup): TokenGroupSnapshot {
  return {
    ...group,
    values: group.tokens.map((token) => {
      const cssVar = `--${token}` as const;
      const value = normalizeValue(style.getPropertyValue(cssVar));

      return {
        cssVar,
        isMissing: value.length === 0,
        value,
      };
    }),
  };
}

function summarize(groups: TokenGroupSnapshot[]): ThemeSnapshot {
  const totalCount = groups.reduce((count, group) => count + group.values.length, 0);
  const foundCount = groups.reduce(
    (count, group) => count + group.values.filter((token) => !token.isMissing).length,
    0,
  );

  return {
    foundCount,
    groups,
    totalCount,
  };
}

export function readThemeTokenSnapshots(): ThemeTokenSnapshots {
  const lightStyle = getComputedStyle(document.documentElement);
  const darkProbe = document.createElement("div");
  darkProbe.className = "dark";
  darkProbe.style.cssText = "position:fixed;inset:auto;opacity:0;pointer-events:none;contain:layout style;";
  document.documentElement.append(darkProbe);

  const darkStyle = getComputedStyle(darkProbe);
  const radius = normalizeValue(lightStyle.getPropertyValue("--radius"));
  const lightGroups = TOKEN_GROUPS.map((group) => readGroup(lightStyle, group));
  const darkGroups = TOKEN_GROUPS.map((group) => readGroup(darkStyle, group));

  darkProbe.remove();

  return {
    dark: summarize(darkGroups),
    light: summarize(lightGroups),
    radius,
  };
}

export function buildThemeBlock(mode: ThemeMode, snapshot: ThemeSnapshot) {
  const selector = mode === "light" ? ":root" : ".dark";
  const lines = snapshot.groups
    .flatMap((group) => group.values)
    .filter((token) => !token.isMissing)
    .map((token) => `  ${token.cssVar}: ${token.value};`);

  return `${selector} {\n${lines.join("\n")}\n}`;
}
