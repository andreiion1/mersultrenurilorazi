// Hartă Google Maps embed pentru pagina unei gări.
// Fără API key: folosim iframe-ul clasic maps.google.com (output=embed).
// IMPORTANT: căutăm după NUMELE locului (ex. "Gara de Nord București"), nu după
// coordonate brute — așa Google pune pin-ul exact pe gara reală, nu aproximativ.

export function StationMap({ name, city, county, mapQuery }: {
  name: string; city: string; county?: string; mapQuery?: string;
}) {
  // Query prioritar: explicit (mapQuery) > "Gara <nume>, <oraș>, România".
  const cleanName = name.replace(/\s+(Gr\.?\s*[A-Z]|Călători|Calatori)\s*$/i, "").trim();
  const q = mapQuery ?? `Gara ${cleanName}, ${city}, România`;
  const query = encodeURIComponent(q);
  const embedSrc = `https://maps.google.com/maps?q=${query}&z=16&hl=ro&output=embed`;
  const openHref = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xl font-bold text-strong">Unde se află Gara {name}</h2>
      <div className="overflow-hidden rounded-md border border-line bg-card">
        <iframe
          src={embedSrc}
          title={`Harta Gara ${name}`}
          width="100%"
          height="340"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ border: 0, display: "block" }}
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-muted">{city}{county ? `, județul ${county}` : ""}</p>
        <a href={openHref} target="_blank" rel="noopener noreferrer"
          className="font-medium text-primary hover:underline">
          Deschide în Google Maps →
        </a>
      </div>
    </section>
  );
}
