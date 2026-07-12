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

        <p>Ultima actualizare: iulie 2026. Operatorul acestui site respectă Regulamentul (UE) 2016/679 (GDPR) și legislația română privind protecția datelor cu caracter personal.</p>

        <h2 className="text-lg font-semibold text-strong">1. Cine suntem</h2>
        <p>Mersul Trenurilor la Zi este un serviciu informativ independent pentru călătorii feroviare în România, disponibil la adresa <strong>mersultrenurilorlazi.ro</strong>. Nu suntem afiliat oficial cu CFR Călători sau Infofer.</p>

        <h2 className="text-lg font-semibold text-strong">2. Ce date colectăm</h2>
        <p><strong>Date pe care NU le colectăm:</strong> nu solicităm cont, nu stocăm email, nume sau orice date cu caracter personal pe serverele noastre.</p>
        <p><strong>Date tehnice de acces (log-uri server):</strong> Vercel (furnizorul de hosting) poate stoca temporar adresa IP și datele HTTP standard (user-agent, URL accesat, timestamp) în scopuri de securitate și diagnosticare, conform propriei lor politici de confidențialitate disponibile pe <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">vercel.com/legal/privacy-policy</a>.</p>
        <p><strong>Favorite (localStorage):</strong> dacă salvezi rute sau stații favorite, acestea sunt stocate exclusiv în browserul tău (localStorage), nu pe serverele noastre. Nu avem acces la aceste date.</p>

        <h2 className="text-lg font-semibold text-strong">3. Cookie-uri și tehnologii similare</h2>
        <p><strong>Stocare strict necesară (localStorage):</strong> preferința de temă (întunecat/luminos) și rutele/gările favorite, stocate exclusiv în browserul tău.</p>
        <p><strong>Publicitate — Google AdSense:</strong> afișăm reclame prin Google AdSense. Google și partenerii săi pot folosi cookie-uri pentru a difuza reclame și a le măsura performanța. Pentru utilizatorii din Spațiul Economic European, Regatul Unit și Elveția afișăm un mesaj de consimțământ printr-o platformă de consimțământ (CMP) certificată de Google; reclamele personalizate se activează doar cu acordul tău. Detalii: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">cum folosește Google cookie-urile în publicitate</a>.</p>
        <p><strong>Statistici — Google Analytics:</strong> folosim Google Analytics (cu IP anonimizat) pentru statistici agregate de utilizare, ca să îmbunătățim site-ul. Prin Google Consent Mode, datele se colectează doar după consimțământ; fără acord, Analytics nu stochează cookie-uri și nu colectează date.</p>
        <p><strong>Controlul tău:</strong> îți poți schimba sau retrage oricând consimțământul din linkul <strong>„Setări confidențialitate"</strong> din subsolul site-ului. Preferințele de reclame le poți gestiona și în <a href="https://myadcenter.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google My Ad Center</a>.</p>

        <h2 className="text-lg font-semibold text-strong">4. Baza legală</h2>
        <p>Prelucrarea datelor tehnice de acces se bazează pe interesul legitim al operatorului (art. 6 alin. 1 lit. f GDPR) de a asigura securitatea și funcționarea corectă a serviciului.</p>

        <h2 className="text-lg font-semibold text-strong">5. Drepturile tale</h2>
        <p>Conform GDPR, ai dreptul de acces, rectificare, ștergere, restricționare, portabilitate și opoziție. Noi nu stocăm date personale pe serverele noastre; datele prelucrate prin Google (Analytics și AdSense) sunt guvernate de politicile Google și se activează doar cu consimțământul tău, pe care îl poți retrage oricând. Pentru orice solicitare, ne poți contacta la <a href="mailto:contact@mersultrenurilorlazi.ro" className="text-primary hover:underline">contact@mersultrenurilorlazi.ro</a>.</p>

        <h2 className="text-lg font-semibold text-strong">6. Modificări</h2>
        <p>Ne rezervăm dreptul de a actualiza această politică. Data ultimei modificări este indicată în antetul paginii.</p>

      </div>
    </Container>
  );
}
