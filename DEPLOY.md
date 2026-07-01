# Cum pun site-ul live — ghid pas cu pas

Site-ul e o aplicație Next.js. Îl punem live pe **Vercel** (gratuit, făcut pentru Next.js).
Durează ~15 minute. Ai nevoie o singură dată de: un cont GitHub și un cont Vercel.

---

## PASUL 0 — Ce îți trebuie instalat (o singură dată)

1. **Node.js** — de pe https://nodejs.org (versiunea LTS). Verifici în terminal:
   ```
   node -v
   ```
   (trebuie să afișeze v18 sau mai nou)

2. **Git** — de pe https://git-scm.com/download/win . Verifici:
   ```
   git -v
   ```

3. **Cont GitHub** — gratuit pe https://github.com (Sign up).
4. **Cont Vercel** — pe https://vercel.com → „Sign Up" → alege **Continue with GitHub** (le legi din start).

---

## PASUL 1 — Verifică build-ul local

Deschide un terminal în folderul `app` (în File Explorer, intră în `MersulTrenurilorAzi\app`, scrie `cmd` în bara de adrese, Enter), apoi:
```
npm install
npm run build
```
Trebuie să se termine cu „Compiled successfully" / fără erori roșii.
Dacă apar erori, oprește-te și trimite-mi textul lor.

---

## PASUL 2 — Pune codul pe GitHub

În același terminal (în folderul `app`):
```
git init
git add .
git commit -m "MVP mersultrenurilorazi"
```

Apoi creează un repository gol pe GitHub:
1. Intră pe https://github.com/new
2. Repository name: `mersultrenurilorazi`
3. Lasă-l **Public** sau **Private** (oricare).
4. NU bifa „Add a README" / „.gitignore" / „license" (lasă-l gol).
5. Click **Create repository**.

GitHub îți arată o adresă de forma `https://github.com/NUMELE-TAU/mersultrenurilorazi.git`. Copiaz-o și rulează (înlocuiește cu adresa ta):
```
git branch -M main
git remote add origin https://github.com/NUMELE-TAU/mersultrenurilorazi.git
git push -u origin main
```
Dacă îți cere autentificare, loghează-te cu contul GitHub (se deschide o fereastră în browser).

---

## PASUL 3 — Deploy pe Vercel

1. Intră pe https://vercel.com/new
2. La „Import Git Repository" alege repo-ul `mersultrenurilorazi` → **Import**.
3. **FOARTE IMPORTANT:** la secțiunea **Root Directory**, apasă **Edit** și selectează folderul **`app`**.
   (Pentru că proiectul Next.js e în subfolderul `app`, nu în rădăcina repo-ului.)
4. Framework Preset: se detectează automat **Next.js** — îl lași așa.
5. Build/Output: lasă valorile implicite. Nu adăuga nicio variabilă de mediu.
6. Click **Deploy**.

În ~2 minute apare „Congratulations" și un link de forma `mersultrenurilorazi.vercel.app`.
**Site-ul e live!** Deschide linkul și testează.

> De acum, orice modificare pe care o faci `git push` se publică automat (Vercel redeployează singur).

---

## PASUL 4 — Pune domeniul `mersultrenurilorazi.ro`

1. În Vercel: proiectul tău → **Settings** → **Domains**.
2. Scrie `mersultrenurilorazi.ro` → **Add**.
3. Vercel îți arată ce să setezi la DNS. De obicei:
   - Pentru domeniul principal (`mersultrenurilorazi.ro`): un record **A** către `76.76.21.21`
   - Pentru `www`: un record **CNAME** către `cname.vercel-dns.com`
   (Folosește EXACT valorile pe care ți le arată Vercel — pot diferi.)
4. Intră în contul de la **registrarul domeniului** (de unde ai cumpărat `.ro` — ex. ROTLD/reseller) → secțiunea DNS → adaugă recordurile de mai sus.
5. Înapoi în Vercel, așteaptă să apară bifa verde (propagarea DNS poate dura de la câteva minute la câteva ore). HTTPS-ul (certificatul) se activează automat.

Gata — site-ul e pe `https://mersultrenurilorazi.ro`.

---

## După lansare (opțional, recomandat)
- **Google Search Console** (https://search.google.com/search-console): adaugi domeniul, confirmi proprietatea, trimiți `https://mersultrenurilorazi.ro/sitemap.xml`.
- Când vrei status live real: în Vercel → Settings → Environment Variables → adaugi `IRIS_ENABLED = 1` (doar după validarea endpoint-ului + aspectul juridic).
- Re-import orar nou (anual, în decembrie): înlocuiești `app/data-sources/mers-tren.xml`, rulezi `npm run import:xml`, apoi `git add . && git commit -m "orar nou" && git push`.

---

## Dacă ceva nu merge
- Build eșuează pe Vercel → verifică să fi pus **Root Directory = `app`**.
- `git push` cere user/parolă și eșuează → folosește login-ul prin browser sau un „Personal Access Token" GitHub.
- Domeniul nu se activează → verifică recordurile DNS să fie exact cele din Vercel; așteaptă propagarea.
