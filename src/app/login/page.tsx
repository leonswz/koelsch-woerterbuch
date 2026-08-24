import type { Metadata } from "next";

import { safeRedirectPath } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "Anmelden",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const parameters = await searchParams;
  const destination = safeRedirectPath(parameters.next);
  const hasError = parameters.error === "1";

  return (
    <div className="mx-auto flex min-h-[68vh] w-full max-w-md items-center">
      <section className="w-full rounded-[28px] border border-line bg-card p-7 shadow-[0_24px_70px_rgba(63,45,32,0.10)] sm:p-9">
        <div className="mb-8">
          <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-koelsch-soft text-koelsch-deep">
            <svg
              aria-hidden="true"
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="10" width="14" height="10" rx="3" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </div>
          <p className="text-sm font-medium text-koelsch">Privates Wörterbuch</p>
          <h1 className="mt-1 font-koelsch text-4xl font-semibold tracking-tight text-ink">
            Schön, dich zu sehen.
          </h1>
          <p className="mt-3 leading-7 text-ink-soft">
            Melde dich an, um das Kölsch-Wörterbuch zu öffnen.
          </p>
        </div>

        <form action="/api/session" method="post" className="grid gap-5">
          <input type="hidden" name="next" value={destination} />

          <label className="grid gap-2 text-sm font-medium text-ink">
            Benutzername
            <input
              name="username"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
              autoFocus
              className="h-12 rounded-[var(--radius-control)] border border-line bg-paper/55 px-4 text-base font-normal text-ink outline-none transition focus:border-koelsch/55 focus:bg-card focus:ring-4 focus:ring-koelsch/10"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-ink">
            Passwort
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="h-12 rounded-[var(--radius-control)] border border-line bg-paper/55 px-4 text-base font-normal text-ink outline-none transition focus:border-koelsch/55 focus:bg-card focus:ring-4 focus:ring-koelsch/10"
            />
          </label>

          {hasError ? (
            <p
              role="alert"
              className="rounded-[var(--radius-control)] border border-koelsch/20 bg-koelsch-soft px-4 py-3 text-sm text-koelsch-deep"
            >
              Benutzername oder Passwort stimmt nicht.
            </p>
          ) : null}

          <button
            type="submit"
            className="mt-1 h-12 rounded-[var(--radius-control)] bg-koelsch px-5 font-semibold text-white transition hover:bg-koelsch-deep focus:outline-none focus:ring-4 focus:ring-koelsch/20"
          >
            Wörterbuch öffnen
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-ink-faint">
          Der Zugang ist nur für den persönlichen Gebrauch bestimmt.
        </p>
      </section>
    </div>
  );
}
