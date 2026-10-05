import { THEME_MODE } from "./config";

export function placeholderImage(seed: number, initial: string): string {
  const isPharaonic = THEME_MODE === "pharaonic";
  const palette = isPharaonic
    ? { from: "#F2E2C2", to: "#E4C888", frame: "#93690F", ring: "#10203E", text: "#10203E", brand: "#33456B" }
    : { from: "#F3E9D2", to: "#E4D2A8", frame: "#B3894A", ring: "#0f0b05", text: "#0f0b05", brand: "#6B5133" };
  const displayFont = isPharaonic ? "Reem Kufi, sans-serif" : "Amiri, serif";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <defs><linearGradient id="g${seed}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.from}"/><stop offset="100%" stop-color="${palette.to}"/>
    </linearGradient></defs>
    <rect width="400" height="400" fill="url(#g${seed})"/>
    <rect x="16" y="16" width="368" height="368" fill="none" stroke="${palette.frame}" stroke-width="1.5"/>
    <circle cx="200" cy="168" r="66" fill="none" stroke="${palette.ring}" stroke-width="1.2" opacity="0.55"/>
    <text x="200" y="192" font-family="${displayFont}" font-size="64" fill="${palette.text}" text-anchor="middle" opacity="0.9">${initial}</text>
    <text x="200" y="330" font-family="IBM Plex Sans Arabic, sans-serif" font-size="13" fill="${palette.brand}" text-anchor="middle" letter-spacing="3">GALLERY REPUBLIC</text>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
