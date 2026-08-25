import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Kölsche Lieder" };

export default async function LiederPage() {
  const songs = await prisma.song.findMany({ orderBy: [{ artist: "asc" }, { title: "asc" }] });
  return <div className="grid gap-6">
    <header><p className="text-xs font-semibold uppercase tracking-[0.16em] text-koelsch">Kölsche Tön</p><h1 className="mt-2 font-koelsch text-4xl font-semibold text-ink">Kölsche Lieder</h1><p className="mt-2 text-ink-soft">Liedtexte, Übersetzungen und Kontext zu kölscher Musik.</p></header>
    {songs.length ? <div className="grid gap-4">{songs.map((song) => <article key={song.id} className="rounded-[var(--radius-card)] border border-line bg-card p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-koelsch">{song.artist}</p><h2 className="mt-1 font-koelsch text-2xl font-semibold text-ink">{song.title}</h2>
      {song.notes ? <p className="mt-3 leading-7 text-ink-soft">{song.notes}</p> : null}
      {(song.lyrics || song.translation) ? <div className="mt-5 grid gap-4 sm:grid-cols-2">{song.lyrics ? <section className="rounded-xl bg-paper-soft p-4"><h3 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Kölsch</h3><p className="mt-2 whitespace-pre-line font-koelsch text-lg leading-7">{song.lyrics}</p></section> : null}{song.translation ? <section className="rounded-xl bg-koelsch-soft/40 p-4"><h3 className="text-xs font-semibold uppercase tracking-wider text-koelsch">Hochdeutsch</h3><p className="mt-2 whitespace-pre-line leading-7 text-ink-soft">{song.translation}</p></section> : null}</div> : null}
      {song.youtubeUrl ? <a href={song.youtubeUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-koelsch hover:underline">Auf YouTube anhören <ExternalLink className="size-4" /></a> : null}
    </article>)}</div> : <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-card p-10 text-center text-ink-faint">Noch keine Lieder eingetragen.</div>}
  </div>;
}
