# Import orar real (data.gov.ro)

Site-ul rulează implicit pe date mock. Ca să folosești **orarul oficial real**, fă o singură dată pașii:

## 1. Descarcă fișierul XML

Intră pe pagina setului de date CFR Călători:
👉 https://data.gov.ro/dataset/mers-tren-sntfc-cfr-calatori-s-a

Descarcă resursa în format **XML** pentru anul curent (ex. „Mers tren - SNTFC 2025-2026"). Vei obține un fișier `.xml`.

> Poți descărca și seturile altor operatori (Transferoviar, Regio Călători etc.) și să le combini — vezi pasul 4.

## 2. Pune fișierul în proiect

Creează folderul `data-sources` în `app/` și copiază fișierul acolo, redenumit:

```
app/data-sources/mers-tren.xml
```

## 3. Rulează importul

```bash
cd app
npm install        # dacă nu ai rulat deja (instalează fast-xml-parser)
npm run import:xml
```

Se generează `src/data/generated.json`, pe care site-ul îl folosește **automat** (are prioritate față de datele mock). Repornește `npm run dev`.

## 4. Dacă structura XML diferă (ajustare mapping)

Formatul exact al tag-urilor XML poate varia. Ca să-l vezi:

```bash
npm run import:inspect
```

Comanda afișează structura reală a fișierului. Deschide `scripts/import-xml.mjs` și ajustează obiectul `MAPPING` (numele câmpurilor pentru număr tren, categorie, opriri, ore etc.) ca să se potrivească. Apoi rulează din nou `npm run import:xml`.

## TODO pentru date complete

Importerul acoperă gări, trenuri și opriri. Rămân de adăugat (vezi `docs/10` Sprint 1):

- **Coordonate gări (lat/lng)** — pentru hartă; prin geocodare (Nominatim/OSM) după slug/nume.
- **Zile de circulație reale** — momentan toate trenurile sunt marcate ca circulând zilnic; parsează câmpul de restricții/zile din XML.
- **Metadate gări** (județ, regiune, gară majoră) — pentru navigare și SEO local.
- **Combinare multi-operator** — rulează importul pe fiecare set și unește rezultatele.

## Revenire la datele mock

Șterge `src/data/generated.json` sau golește-i array-urile `stations`/`trains`. Site-ul revine automat pe datele mock.
