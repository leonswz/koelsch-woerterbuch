# Kölsch Wörterbuch

Next.js-16-Anwendung mit PostgreSQL/Prisma für ein nachvollziehbar gepflegtes Kölsch-Wörterbuch.

## Entwicklung

```bash
npm ci
npm run dev
```

Weitere Prüfungen:

```bash
npm test
npm run lint
npx prisma validate
npm run build
```

## Wiktionary-Pilotimport

Der erste Import verwendet die offizielle MediaWiki-API und liest die Seiten aus der Kategorie [„Übersetzungen (Kölsch)“](https://de.wiktionary.org/wiki/Kategorie:%C3%9Cbersetzungen_(K%C3%B6lsch)). Standardmäßig wird **nur eine JSON-Vorschau** erzeugt:

```bash
npm run scrape:wiktionary
```

Ausgabe: `data/imports/wiktionary-koelsch-pilot.json`

Optionen:

```bash
# Nur die ersten zehn Quellseiten verarbeiten
npm run scrape:wiktionary -- --limit=10

# Nach Prüfung in die konfigurierte Datenbank schreiben
npm run scrape:wiktionary -- --write
```

Der Datenbankmodus verwendet `createMany(..., skipDuplicates: true)`: vorhandene Wörter oder Slugs werden nicht überschrieben. Neue Importe erhalten zunächst `reviewStatus = "pending"`. Mehrdeutige Formen werden zu einem Wort zusammengeführt, während alle Wiktionary-Seiten und Revisionsnummern im JSON-Feld `sources` erhalten bleiben.

## Privates persönliches Prüfkorpus

Für die persönliche Sichtung kann zusätzlich ein lokales Korpus aus den A–Z-Seiten von `koelsch-woerterbuch.de` erzeugt werden:

```bash
# Kleiner Probelauf
npm run scrape:private -- --limit=100

# Vollständiger, gedrosselter Lauf
npm run scrape:private
```

Der Importer übernimmt ausschließlich Kölsch-/Deutsch-Wortpaare. Lieder, Sprichwörter, das Kölsche Grundgesetz, Kommentare, Beispiele und redaktionelle Texte werden ausgeschlossen. Cache und Ergebnis landen unter `.private/koelsch-woerterbuch-de/`, sind per `.gitignore` vom Repository ausgeschlossen und werden nicht automatisch in die öffentliche Datenbank geschrieben. Ein abgebrochener Lauf wird über `crawl-cache.jsonl` fortgesetzt.

Optionale Steuerung:

```bash
npm run scrape:private -- --concurrency=6 --rps=8
```

## Quelle und Lizenz

Die importierten Übersetzungen stammen aus dem [deutschsprachigen Wiktionary](https://de.wiktionary.org/) und stehen unter [Creative Commons Namensnennung – Weitergabe unter gleichen Bedingungen 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.de). Jeder importierte Datensatz enthält Quellenlink, Seiten-ID, Revisions-ID, Revisionszeitpunkt und Lizenzangabe.

Der Importer sendet einen benannten User-Agent, nutzt ausschließlich die öffentliche MediaWiki-API und verarbeitet die kleine Kölsch-Kategorie stapelweise statt HTML-Seiten aggressiv abzurufen.
