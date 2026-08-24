export function EmptyList({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="grid gap-8">
      <header>
        <h1 className="font-koelsch text-3xl font-semibold tracking-tight text-ink">
          {title}
        </h1>
        <p className="mt-2 text-ink-soft">{text}</p>
      </header>
      <section className="rounded-[var(--radius-card)] border border-line bg-card p-6">
        <p className="text-ink-soft">
          Noch nichts eingespielt – die Inhalte folgen, sobald die Daten
          aufbereitet sind.
        </p>
      </section>
    </div>
  );
}
