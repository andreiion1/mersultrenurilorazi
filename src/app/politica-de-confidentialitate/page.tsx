import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Politica de confidențialitate",
  description: "Cum tratăm datele personale pe Mersul Trenurilor la Zi.",
  path: "/politica-de-confidentialitate",
});

export default function Page() {
  return (
    <Container className="py-2">
      <Breadcrumbs items={[{ name: "Acasă", href: "/" }, { name: "Confidențialitate" }]} />
      <h1 className="text-2xl font-bold text-strong md:text-3xl">Politica de confidențialitate</h1>
      <div className="mt-4 max-w-2xl space-y-4 text-body">

        <p>Ultima actualizare: iunie 2025. Operatorul acestui site respectă Regulamentul (UE) 2016/679 (GDPR) și legislația română privind protecția datelor cu caracter personal.</p>

        <h2 className="text-lg font-semibold text-strong">1. Cine suntem</h2>
        <p>Mersul Trenurilor la Zi este un serviciu informativ independent pentru călătorii feroviare în România, disponibil la adresa <strong>mersultrenurilorlazi.ro</strong>. Nu suntem afiliat oficial cu CFR Călători sau Infofer.</p>

        <h2 className="text-lg font-semibold text-strong">2. Ce date colectăm</h2>
        <p><strong>Date pe care NU le colectăm:</strong> nu solicităm cont, nu stocăm email, nume sau orice date cu caracter personal pe serverele noastre.</p>
        <p><strong>Date tehnice de acces (log-uri server):</strong> Vercel (furnizorul de hosting) poate stoca temporar adresa IP și datele HTTP standard (user-agent, URL accesat, timestamp) în scopuri de securitate și diagnosticare, conform propriei lor politici de confidențialitate disponibile pe <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">vercel.com/legal/privacy-policy</a>.</p>
        <p><strong>Favorite (localStorage):</strong> dacă salvezi rute sau stații favorite, acestea sunt stocate exclusiv în browserul tău (localStorage), nu pe serverele noastre. Nu avem acces la aceste date.</p>

        <h2 className="text-lg font-semibold text-strong">3. Cookie-uri</h2>
        <p>Versiunea actuală a site-ului nu folosește cookie-uri de tracking, publicitate sau analytics terțe. Preferința de temă (întunecat/luminos) poate fi stocată în localStorage.</p>

        <h2 className="text-lg font-semibold text-strong">4. Baza legală</h2>
        <p>Prelucrarea datelor tehnice de acces se bazează pe interesul legitim al operatorului (art. 6 alin. 1 lit. f GDPR) de a asigura securitatea și funcționarea corectă a serviciului.</p>

        <h2 className="text-lg font-semibold text-strong">5. Drepturile tale</h2>
        <p>Conform GDPR, ai dreptul de acces, rectificare, ștergere, restricționare, portabilitate și opoziție. Întrucât nu colectăm date personale identificabile, exercitarea acestor drepturi nu este aplicabilă în practică pentru serviciul nostru. Pentru orice nelămurire, ne poți contacta.</p>

        <h2 className="text-lg font-semibold text-strong">6. Modificări</h2>
        <p>Ne rezervăm dreptul de a actualiza această politică. Data ultimei modificări este indicată în antetul paginii.</p>

      </div>
    </Container>
  );
}
