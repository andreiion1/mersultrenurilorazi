import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Termeni și condiții",
  description: "Termenii și condițiile de utilizare a site-ului Mersul Trenurilor la Zi.",
  path: "/termeni-si-conditii",
});

export default function Page() {
  return (
    <Container className="py-2">
      <Breadcrumbs items={[{ name: "Acasă", href: "/" }, { name: "Termeni și condiții" }]} />
      <h1 className="text-2xl font-bold text-strong md:text-3xl">Termeni și condiții</h1>
      <div className="mt-4 max-w-2xl space-y-4 text-body">

        <p>Ultima actualizare: iulie 2026. Prin utilizarea site-ului <strong>mersultrenurilorlazi.ro</strong> ești de acord cu termenii de mai jos.</p>

        <h2 className="text-lg font-semibold text-strong">1. Serviciul oferit</h2>
        <p>Mersul Trenurilor la Zi este un agregator informativ <strong>independent</strong>, neafiliat oficial cu CFR Călători, CFR SA sau Informatică Feroviară. Furnizăm informații de orar feroviar, estimări de preț și durată, și link-uri de redirecționare către serviciile oficiale de informare și de cumpărare bilete. Nu suntem un operator de transport și nu vindem bilete.</p>

        <h2 className="text-lg font-semibold text-strong">2. Acuratețea informațiilor</h2>
        <p>Datele de orar provin din seturile de date deschise „Mers tren" publicate pe <a href="https://data.gov.ro/organization/sc-informatica-feroviara-sa" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">data.gov.ro</a> de Informatică Feroviară și operatorii feroviari. Depunem eforturi rezonabile pentru acuratețe, însă <strong>nu garantăm corectitudinea, completitudinea sau actualitatea</strong> informațiilor afișate. Orarul feroviar se poate modifica fără preaviz. Prețurile afișate sunt <strong>estimative</strong>, iar statusul și întârzierile sunt <strong>calculate din orar</strong>, nu preluate în timp real din sistemele oficiale.</p>
        <p>Verifică întotdeauna sursele oficiale <a href="https://mersultrenurilor.infofer.ro/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mersultrenurilor.infofer.ro</a> sau <a href="https://bilete.cfrcalatori.ro/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">CFR Călători</a> înainte de a călători.</p>

        <h2 className="text-lg font-semibold text-strong">3. Limitarea răspunderii</h2>
        <p>Nu ne asumăm răspunderea pentru niciun prejudiciu direct sau indirect rezultat din utilizarea informațiilor prezentate pe acest site, inclusiv (fără a se limita la): pierderea unui tren, cheltuieli suplimentare de transport, rezervări anulate.</p>

        <h2 className="text-lg font-semibold text-strong">4. Proprietate intelectuală</h2>
        <p>Conținutul editorial original, designul și codul sursă al site-ului aparțin operatorului acestui site. Datele de orar sunt reutilizate din seturile publice de pe data.gov.ro sub licența <a href="https://creativecommons.org/licenses/by/4.0/deed.ro" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Creative Commons Atribuire 4.0 (CC BY 4.0)</a> și sunt prelucrate/adaptate de noi, cu atribuirea sursei (vezi <a href="/surse-de-date" className="text-primary hover:underline">Surse de date</a>). Denumirile, mărcile și logo-urile CFR, CFR Călători, Infofer și ale celorlalți operatori aparțin titularilor respectivi; le menționăm exclusiv în scop informativ și de identificare.</p>

        <h2 className="text-lg font-semibold text-strong">5. Link-uri externe</h2>
        <p>Site-ul conține link-uri către CFR Călători, Infofer și alte servicii terțe. Nu controlăm și nu răspundem pentru conținutul sau practicile acestor site-uri externe.</p>

        <h2 className="text-lg font-semibold text-strong">6. Legea aplicabilă</h2>
        <p>Acești termeni sunt guvernați de legislația română. Orice litigiu va fi soluționat de instanțele competente din România.</p>

        <h2 className="text-lg font-semibold text-strong">7. Modificări</h2>
        <p>Ne rezervăm dreptul de a actualiza acești termeni. Versiunea actualizată va fi publicată pe această pagină cu data modificării.</p>

      </div>
    </Container>
  );
}
