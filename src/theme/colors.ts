export type AppTheme = {
  background: string;
  card: string;
  text: string;
  muted: string;
  primary: string;
  success: string;
  danger: string;
  border: string;
  accent: string;
};

export const lightTheme: AppTheme = {
  background: "#FFFFFF",
  card: "#F5F7FF",
  text: "#111111",
  muted: "#6B7280",
  primary: "#347679",
  success: "#478387",
  danger: "#74a3a5",
  border: "rgba(0,0,0,0.1)",
  accent: "#347679",
};

export const darkTheme = {
  background: "#0F1C1D",
  card: "#182B2D",
  text: "#FFFFFF",       // PURE WHITE
  muted: "#C7D9DB",      // readable secondary
  primary: "#74a3a5",
  success: "#34D399",
  danger: "#FB7185",
  border: "rgba(255,255,255,0.15)",
  accent: "#74a3a5",
};

