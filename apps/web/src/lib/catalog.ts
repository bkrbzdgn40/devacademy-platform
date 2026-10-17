import raw from "@/data/catalog.json";

export type CatalogKind = "language" | "concept" | "technology";
export type CatalogEntry = { id: string; slug: string; kind: CatalogKind; name: string; summary: string; level: string; runnable: boolean; tags: string[] };
// Editorial preview: never advertise code execution without an audited runner.
export const catalog: readonly CatalogEntry[] = raw as CatalogEntry[];
export const categoryInfo: Record<CatalogKind, { title: string; description: string; href: string }> = {
  language: { title: "Diller", description: "Popüler ve sıra dışı programlama dillerini keşfet.", href: "/kutuphane/diller" },
  concept: { title: "Kavramlar", description: "Bir dile bağlı kalmadan yazılımın temel fikirlerini öğren.", href: "/kutuphane/kavramlar" },
  technology: { title: "Teknolojiler", description: "Framework'leri, araçları ve yazılım ekosistemlerini tanı.", href: "/kutuphane/teknolojiler" },
};
export const kindByRoute: Record<string, CatalogKind> = { diller: "language", kavramlar: "concept", teknolojiler: "technology" };
export const entriesForKind = (kind: CatalogKind): CatalogEntry[] => catalog.filter((entry) => entry.kind === kind);
