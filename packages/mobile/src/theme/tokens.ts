export const colors = {
  // Neutrals
  ink: {
    950: "#090C10",
    900: "#0C1117",
    850: "#11171F",
    800: "#161D26",
    750: "#1B2530",
    700: "#222E3A",
    600: "#2E3C49",
    500: "#3D4D5C",
    400: "#566777",
    300: "#7D8D9C",
    200: "#A9B7C3",
    100: "#D2DBE3",
    50: "#EAEFF3",
  },

  // Summit Gold
  gold: {
    300: "#FFD888",
    400: "#FBC555",
    500: "#F4B740",
    600: "#E0A026",
    700: "#B87C14",
  },

  // Status
  sky: { 300: "#84D3F2", 400: "#46B6E8", 500: "#2B9ED4" },
  spruce: { 300: "#74DC9E", 400: "#37BE76", 500: "#1E9B5A" },
  coral: { 300: "#F79683", 400: "#F2705A", 500: "#E0503F" },

  // Tiers
  tiers: {
    bronze: "#C77B43",
    silver: "#B4C1CD",
    gold: "#F4B740",
    platinum: "#8FE0E6",
  },

  // Heatmap
  heat: {
    0: "#19222C",
    1: "#3E3518",
    2: "#715C1B",
    3: "#AC831E",
    4: "#F4B740",
  },

  // Semantic aliases
  bgApp: "#090C10",
  bgBase: "#0C1117",
  surfaceSunken: "#11171F",
  surfaceCard: "#161D26",
  surfaceRaised: "#1B2530",
  surfaceHover: "#222E3A",
  surfaceOverlay: "rgba(12, 17, 23, 0.72)",

  borderSubtle: "rgba(255, 255, 255, 0.06)",
  borderDefault: "rgba(255, 255, 255, 0.10)",
  borderStrong: "rgba(255, 255, 255, 0.16)",
  borderGold: "rgba(244, 183, 64, 0.45)",

  textPrimary: "#EAEFF3",
  textSecondary: "#A9B7C3",
  textMuted: "#7D8D9C",
  textFaint: "#566777",
  textOnGold: "#090C10",
  textAccent: "#FBC555",

  accent: "#F4B740",
  accentHover: "#FBC555",
  accentPress: "#E0A026",
  accentSoft: "rgba(244, 183, 64, 0.12)",

  statusSuccess: "#37BE76",
  statusInfo: "#46B6E8",
  statusDanger: "#E0503F",

  white: "#FFFFFF",
};

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 32,
  8: 40,
  9: 48,
  10: 64,
  11: 80,
  12: 96,
} as const;

export const radius = {
  xs: 6,
  sm: 8,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  pill: 999,
} as const;

export const typography = {
  display: "SpaceGrotesk_700Bold",
  displaySemiBold: "SpaceGrotesk_600SemiBold",
  displayRegular: "SpaceGrotesk_400Regular",
  body: "HankenGrotesk_400Regular",
  bodyMedium: "HankenGrotesk_500Medium",
  bodySemiBold: "HankenGrotesk_600SemiBold",
  mono: "SpaceMono_400Regular",
} as const;

export const tabbarHeight = 72;
export const topbarHeight = 64;
export const tapMin = 44;
