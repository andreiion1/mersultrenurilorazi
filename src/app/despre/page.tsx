import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Despre Mersul Trenurilor la Zi",
  description: "Despre proiectul Mersul Trenurilor la Zi — agregator de orar feroviar din România, rapid și clar.",
  path: "/despre",
});

export default function Page() {
  return (
    <Container className="py-2">
      <Breadcrumbs items={[{ name: "Acasă", href: "/" }, { name: "Despre" }]} />
      <h1 className="text-2xl font-bold text-strong md:text-3xl">Despre noi</h1>
      <div className="mt-4 max-w-2xl space-y-3 text-body">
        <p>Mersul Trenurilor la Zi este un agregator independent de orar feroviar pentru România. Scopul nostru este să oferim o experiență mai rapidă și mai clară decât site-urile oficiale: căutare de rute, plecări și sosiri din gări, status și întârzieri, plus direcționare către cumpărarea biletului.</p>
        <p>Agregăm informații din surse publice și le prezentăm într-un format ușor de folosit pe mobil. Informațiile au caracter orientativ; verifică mereu sursa oficială înainte de călătorie.</p>
      </div>
    </Container>
  );
}
