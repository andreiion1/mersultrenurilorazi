import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Surse de date",
  description: "Transparență privind sursele de date folosite de Mersul Trenurilor Azi.",
  path: "/surse-de-date",
});

export default function Page() {
  return (
    <Container className="py-2">
      <Breadcrumbs items={[{ name: "Acasă", href: "/" }, { name: "Surse de date" }]} />
      <h1 className="text-2xl font-bold text-strong md:text-3xl">Surse de date</h1>
      <div className="mt-4 max-w-2xl space-y-3 text-body">
        <p><strong>Versiunea MVP folosește date mock realiste</strong> pentru demonstrație. În producție, datele vor proveni din:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Orar oficial static — seturile XML „Mers tren” de pe <a className="text-primary hover:underline" href="https://data.gov.ro/dataset/mers-tren-sntfc-cfr-calatori-s-a" target="_blank" rel="noopener noreferrer">data.gov.ro</a> (CFR Călători și alți operatori).</li>
          <li>Bilete — direcționare către <a className="text-primary hover:underline" href="https://bilete.cfrcalatori.ro/" target="_blank" rel="noopener noreferrer">CFR Călători</a>.</li>
          <li>Status/întârzieri — sursă oficială/semi-live (de clarificat juridic) — <em>TODO producție</em>.</li>
        </ul>
        <p>Informațiile au caracter orientativ. Nu ne asumăm răspunderea pentru decizii luate exclusiv pe baza datelor afișate.</p>
      </div>
    </Container>
  );
}
