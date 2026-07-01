import Link from "next/link";
import { Container } from "@/components/Container";

export default function NotFound() {
  return (
    <Container className="py-20 text-center">
      <h1 className="text-4xl font-bold text-strong">404</h1>
      <p className="mt-2 text-muted">Pagina căutată nu există sau a fost mutată.</p>
      <Link href="/" className="mt-6 inline-block rounded-md bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-hover">Înapoi acasă</Link>
    </Container>
  );
}
