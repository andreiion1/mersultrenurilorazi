import type { Operator } from "@/lib/types";

// Operatori feroviari de călători din România (cei cu orar în date.gov.ro).
// ticketUrlPattern: pentru CFR are placeholdere {from}/{to}/{date}; pentru privați
// e platforma lor de bilete (fără parametri — deep-link simplu).
export const operators: Operator[] = [
  {
    slug: "cfr-calatori",
    name: "CFR Călători",
    shortName: "CFR",
    website: "https://www.cfrcalatori.ro/",
    ticketUrlPattern: "https://bilete.cfrcalatori.ro/ro-RO/Itineraries?DepartureStationName={from}&ArrivalStationName={to}&DepartureDate={date}",
    colorHex: "#1E40AF",
  },
  {
    slug: "regio-calatori",
    name: "Regio Călători",
    shortName: "Regio",
    website: "https://regiocalatori.ro/",
    ticketUrlPattern: "https://regiocalatori.ro/mersul-trenurilor/#/cautare/",
    colorHex: "#0E7490",
  },
  {
    slug: "interregional-calatori",
    name: "Interregional Călători",
    shortName: "IRC",
    website: "https://interregional.ro/",
    ticketUrlPattern: "https://interregional.ro/shopping/shop",
    colorHex: "#7C3AED",
  },
  {
    slug: "transferoviar-calatori",
    name: "Transferoviar Călători",
    shortName: "TFC",
    website: "https://tfc.ro/",
    ticketUrlPattern: "https://bilete.tfc-online.ro/ro-RO/",
    colorHex: "#047857",
  },
  {
    slug: "ferotrafic",
    name: "Ferotrafic",
    shortName: "Fero",
    website: "https://ferotrafic.ro/",
    ticketUrlPattern: "https://bilete.ferotrafic.ro/",
    colorHex: "#B45309",
  },
  {
    slug: "softrans",
    name: "Softrans",
    shortName: "Softrans",
    website: "https://softrans.ro/",
    ticketUrlPattern: "https://softrans.ro/",
    colorHex: "#B91C1C",
  },
  {
    slug: "astra-trans-carpatic",
    name: "Astra Trans Carpatic",
    shortName: "Astra",
    website: "https://astratranscarpatic.ro/",
    ticketUrlPattern: "https://online.astratranscarpatic.ro/",
    colorHex: "#9333EA",
  },
];

export const operatorBySlug = (slug: string): Operator | undefined =>
  operators.find((o) => o.slug === slug);
