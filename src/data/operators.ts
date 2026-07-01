import type { Operator } from "@/lib/types";

export const operators: Operator[] = [
  {
    slug: "cfr-calatori",
    name: "CFR Călători",
    shortName: "CFR",
    website: "https://www.cfrcalatori.ro/",
    // Deep-link informativ către platforma oficială de bilete (parametrii reali — TODO de validat)
    ticketUrlPattern: "https://bilete.cfrcalatori.ro/ro-RO/Itineraries?DepartureStationName={from}&ArrivalStationName={to}&DepartureDate={date}",
    colorHex: "#1E40AF",
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
    slug: "transferoviar-calatori",
    name: "Transferoviar Călători",
    shortName: "TFC",
    website: "https://tfc.ro/",
    ticketUrlPattern: "https://tfc.ro/",
    colorHex: "#047857",
  },
];

export const operatorBySlug = (slug: string): Operator | undefined =>
  operators.find((o) => o.slug === slug);
