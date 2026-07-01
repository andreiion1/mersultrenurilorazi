// Grilă de tarife CFR Călători — clasa a 2-a, tarif STANDARD intern (degresiv pe distanță).
//
// Valorile sunt puncte (km → preț IR clasa 2) calibrate pe tarifele reale CFR.
// Prețul se interpolează liniar între punctele grilei.
//
// >>> Pentru tarife 100% oficiale: înlocuiește perechile din IR_GRID cu valorile exacte
//     din grila publicată CFR Călători („Tarife trenuri InterRegio / Regio", clasa 2).
//     Reducerile/promoțiile NU sunt incluse — pentru ele, butonul „Cumpără bilet" → CFR.

export interface TariffPoint { km: number; price: number; }

// Tarif IR clasa 2 (RON) pe distanțe (puncte de referință).
const IR_GRID: TariffPoint[] = [
  { km: 10, price: 11 },
  { km: 25, price: 15 },
  { km: 50, price: 21 },
  { km: 75, price: 28 },
  { km: 100, price: 34 },
  { km: 125, price: 40 },
  { km: 150, price: 46 },
  { km: 175, price: 52 },
  { km: 200, price: 58 },
  { km: 250, price: 68 },
  { km: 300, price: 77 },
  { km: 350, price: 86 },
  { km: 400, price: 94 },
  { km: 450, price: 101 },
  { km: 500, price: 110 },
  { km: 600, price: 124 },
  { km: 700, price: 138 },
  { km: 800, price: 150 },
];

// Factori pe categorie față de tariful IR (Regio mai ieftin, IC/IRN mai scumpe).
const CATEGORY_FACTOR: Record<string, number> = {
  R: 0.62,   // Regio
  RE: 0.66,  // Regio Expres
  IR: 1.0,   // InterRegio
  IRN: 1.10, // InterRegio Noapte
  IC: 1.15,  // InterCity
};

function interpolateIR(km: number): number {
  const g = IR_GRID;
  if (km <= g[0].km) return g[0].price;
  if (km >= g[g.length - 1].km) {
    // extrapolare ușoară peste ultima distanță
    const last = g[g.length - 1], prev = g[g.length - 2];
    const slope = (last.price - prev.price) / (last.km - prev.km);
    return last.price + slope * (km - last.km);
  }
  for (let i = 0; i < g.length - 1; i++) {
    if (km >= g[i].km && km <= g[i + 1].km) {
      const t = (km - g[i].km) / (g[i + 1].km - g[i].km);
      return g[i].price + t * (g[i + 1].price - g[i].price);
    }
  }
  return g[g.length - 1].price;
}

/** Preț standard clasa 2 (RON) pentru o distanță și o categorie de tren. */
export function tariffPrice(km: number, category: string): number {
  const base = interpolateIR(Math.max(1, km));
  const factor = CATEGORY_FACTOR[category] ?? 1.0;
  return Math.max(7, Math.round(base * factor * 2) / 2); // rotunjit la 0.5 lei
}
