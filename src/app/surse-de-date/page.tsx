import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Surse de date",
  description: "Transparență privind sursele de date folosite de Mersul Trenurilor la Zi.",
  path: "/surse-de-date",
});

export default function Page() {
  return (
    <Container className="py-2">
      <Breadcrumbs items={[{ name: "Acasă", href: "/" }, { name: "Surse de date" }]} />
      <h1 className="text-2xl font-bold text-strong md:text-3xl">Surse de date</h1>
      <div className="mt-4 max-w-2xl space-y-4 text-body">
        <p>Suntem un serviciu informativ <strong>independent</strong>, neafiliat oficial cu CFR Călători, CFR SA sau Informatică Feroviară. Mai jos explicăm de unde provine fiecare tip de informație afișată.</p>

        <h2 className="text-lg font-semibold text-strong">Orarul trenurilor</h2>
        <p>Orarul (rute, opriri, ore, zile de circulație) provine din seturile de date deschise <strong>„Mers tren"</strong> publicate pe portalul guvernamental <a className="text-primary hover:underline" href="https://data.gov.ro/organization/sc-informatica-feroviara-sa" target="_blank" rel="noopener noreferrer">data.gov.ro</a> de către Informatică Feroviară și operatorii feroviari (CFR Călători și ceilalți operatori licențiați). Aceste seturi sunt publicate ca <strong>date deschise</strong>, destinate reutilizării. Drepturile asupra datelor aparțin operatorilor/emitenților; noi doar le prezentăm într-un format mai ușor de folosit, cu atribuire.</p>

        <h2 className="text-lg font-semibold text-strong">Prețurile biletelor</h2>
        <p>Prețurile afișate sunt <strong>estimări proprii</strong>, calculate pe baza grilei de tarifare pe distanță (clasa a 2-a) și a categoriei trenului. Sunt <strong>orientative</strong> și nu includ reduceri, oferte sau supliente. Pentru prețul exact și cumpărare, te direcționăm către platforma oficială <a className="text-primary hover:underline" href="https://bilete.cfrcalatori.ro/" target="_blank" rel="noopener noreferrer">CFR Călători</a>.</p>

        <h2 className="text-lg font-semibold text-strong">Statusul și întârzierile</h2>
        <p>Poziția pe hartă și estimările de întârziere sunt <strong>calculate din orar</strong> (semi-live), nu preluate în timp real din sistemele oficiale. Pentru statusul <strong>oficial în timp real</strong> al unui tren, îți punem pe fiecare pagină de tren un buton „Status live pe Infofer" care te trimite direct la sursa oficială <a className="text-primary hover:underline" href="https://mersultrenurilor.infofer.ro/ro-RO/Trains" target="_blank" rel="noopener noreferrer">Trenul meu — Infofer</a>.</p>

        <h2 className="text-lg font-semibold text-strong">Hărți</h2>
        <p>Hărțile folosesc <a className="text-primary hover:underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> și Google Maps pentru localizarea gărilor.</p>

        <p className="text-sm text-muted">Informațiile au caracter orientativ. Verifică întotdeauna sursa oficială înainte de călătorie. Nu ne asumăm răspunderea pentru decizii luate exclusiv pe baza datelor afișate aici.</p>
      </div>
    </Container>
  );
}
