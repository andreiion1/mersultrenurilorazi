"use client";

// Redeschide mesajul de consimțământ al CMP-ului Google (pentru retragerea/schimbarea alegerii).
// Apare relevant doar pentru utilizatorii cărora Google le-a arătat mesajul (UE/SEE/UK/CH).
export function CookieSettingsButton() {
  const open = () => {
    const w = window as unknown as { googlefc?: { showRevocationMessage?: () => void } };
    if (w.googlefc && typeof w.googlefc.showRevocationMessage === "function") {
      w.googlefc.showRevocationMessage();
    }
  };
  return (
    <li>
      <button type="button" onClick={open}
        className="text-xs transition-colors"
        style={{ color: "rgba(255,255,255,0.70)" }}>
        Setări confidențialitate
      </button>
    </li>
  );
}
