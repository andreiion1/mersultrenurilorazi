// Normalizare diacritice + slug (docs/03 — funcție slug normalizare)
const MAP: Record<string, string> = {
  ă: "a", â: "a", î: "i", ș: "s", ş: "s", ț: "t", ţ: "t",
  Ă: "a", Â: "a", Î: "i", Ș: "s", Ş: "s", Ț: "t", Ţ: "t",
};

export function slugify(input: string): string {
  return input
    .split("")
    .map((c) => MAP[c] ?? c)
    .join("")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function routeSlug(fromSlug: string, toSlug: string): string {
  return `${fromSlug}-${toSlug}`;
}
