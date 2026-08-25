import Link from "next/link";
import { redirect } from "next/navigation";

import { getEditorSession } from "@/lib/editor-session";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Sprichwörter & Lieder pflegen" };

const input = "mt-2 w-full rounded-xl border border-line bg-card px-4 py-3 text-base outline-none focus:border-koelsch/50 focus:ring-4 focus:ring-koelsch/10";
const card = "grid gap-4 rounded-[var(--radius-card)] border border-line bg-card p-5 shadow-sm";

function Submit({ children }: { children: React.ReactNode }) {
  return <button className="justify-self-end rounded-xl bg-koelsch px-5 py-3 text-sm font-semibold text-white hover:bg-koelsch-deep">{children}</button>;
}

export default async function InhaltePflegenPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  if (!(await getEditorSession())) redirect("/");
  const [{ saved, error }, proverbs, songs] = await Promise.all([
    searchParams,
    prisma.proverb.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.song.findMany({ orderBy: { updatedAt: "desc" } }),
  ]);

  return <div className="grid gap-8">
    <header>
      <Link href="/redaktion" className="text-sm text-koelsch hover:underline">← Zur Redaktion</Link>
      <h1 className="mt-4 font-koelsch text-4xl font-semibold text-ink">Sprichwörter & Lieder</h1>
      <p className="mt-2 text-ink-soft">Weitere Inhalte für den erklärenden Kölsch-Übersetzer pflegen.</p>
    </header>
    {saved ? <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{saved}</p> : null}
    {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}

    <section className="grid gap-4">
      <h2 className="font-koelsch text-2xl font-semibold">Neues Sprichwort</h2>
      <form action="/api/redaktion/inhalte" method="post" className={card}>
        <input type="hidden" name="kind" value="proverb" />
        <label className="text-sm font-medium">Sprichwort auf Kölsch<input required name="koelsch" className={input} /></label>
        <label className="text-sm font-medium">Hochdeutsche Übersetzung<textarea required name="translation" rows={2} className={input} /></label>
        <label className="text-sm font-medium">Erklärung <span className="font-normal text-ink-faint">optional</span><textarea name="explanation" rows={3} className={input} /></label>
        <Submit>Sprichwort anlegen</Submit>
      </form>
      {proverbs.map((proverb) => <details key={proverb.id} className="rounded-xl border border-line bg-card">
        <summary className="cursor-pointer px-5 py-4 font-koelsch text-lg font-semibold">{proverb.koelsch}</summary>
        <form action="/api/redaktion/inhalte" method="post" className="grid gap-4 border-t border-line p-5">
          <input type="hidden" name="kind" value="proverb" /><input type="hidden" name="id" value={proverb.id} />
          <label className="text-sm font-medium">Kölsch<input required name="koelsch" defaultValue={proverb.koelsch} className={input} /></label>
          <label className="text-sm font-medium">Übersetzung<textarea required name="translation" rows={2} defaultValue={proverb.translation} className={input} /></label>
          <label className="text-sm font-medium">Erklärung<textarea name="explanation" rows={3} defaultValue={proverb.explanation ?? ""} className={input} /></label>
          <Submit>Speichern</Submit>
        </form>
      </details>)}
    </section>

    <section className="grid gap-4 border-t border-line pt-8">
      <h2 className="font-koelsch text-2xl font-semibold">Neues Lied</h2>
      <form action="/api/redaktion/inhalte" method="post" className={card}>
        <input type="hidden" name="kind" value="song" />
        <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Titel<input required name="title" className={input} /></label><label className="text-sm font-medium">Interpret<input required name="artist" className={input} /></label></div>
        <label className="text-sm font-medium">Kölscher Liedtext<textarea name="lyrics" rows={6} className={input} /></label>
        <label className="text-sm font-medium">Hochdeutsche Übersetzung<textarea name="translation" rows={6} className={input} /></label>
        <label className="text-sm font-medium">Einordnung / Erklärung<textarea name="notes" rows={3} className={input} /></label>
        <label className="text-sm font-medium">YouTube-URL<input type="url" name="youtubeUrl" className={input} /></label>
        <Submit>Lied anlegen</Submit>
      </form>
      {songs.map((song) => <details key={song.id} className="rounded-xl border border-line bg-card">
        <summary className="cursor-pointer px-5 py-4 font-koelsch text-lg font-semibold">{song.title} <span className="text-sm font-normal text-ink-faint">· {song.artist}</span></summary>
        <form action="/api/redaktion/inhalte" method="post" className="grid gap-4 border-t border-line p-5">
          <input type="hidden" name="kind" value="song" /><input type="hidden" name="id" value={song.id} />
          <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Titel<input required name="title" defaultValue={song.title} className={input} /></label><label className="text-sm font-medium">Interpret<input required name="artist" defaultValue={song.artist} className={input} /></label></div>
          <label className="text-sm font-medium">Kölscher Liedtext<textarea name="lyrics" rows={6} defaultValue={song.lyrics ?? ""} className={input} /></label>
          <label className="text-sm font-medium">Übersetzung<textarea name="translation" rows={6} defaultValue={song.translation ?? ""} className={input} /></label>
          <label className="text-sm font-medium">Einordnung / Erklärung<textarea name="notes" rows={3} defaultValue={song.notes ?? ""} className={input} /></label>
          <label className="text-sm font-medium">YouTube-URL<input type="url" name="youtubeUrl" defaultValue={song.youtubeUrl ?? ""} className={input} /></label>
          <Submit>Speichern</Submit>
        </form>
      </details>)}
    </section>
  </div>;
}
