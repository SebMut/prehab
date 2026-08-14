# preHIP – Apple Health über iPhone-Kurzbefehle

Diese Variante verbindet Apple Health mit der bestehenden preHIP-Web-App **ohne native iOS-App und ohne Xcode**.

## Architektur

```text
Apple Health auf dem iPhone
        ↓
iPhone-Kurzbefehl / Automation
        ↓ HTTPS POST
Supabase Edge Function `health-shortcuts`
        ↓
privater Supabase-Storage
        ↓
preHIP Profil / Gewicht / Schritte / Workouts
```

Der persönliche Import-Schlüssel wird serverseitig **nur als SHA-256-Hash** gespeichert. Der Klartext-Schlüssel wird in preHIP nur einmal nach dem Erstellen angezeigt und gehört anschließend ausschließlich in den persönlichen iPhone-Kurzbefehl.

## Welche Daten werden importiert?

Phase 1 akzeptiert ausschließlich:

- Körpergewicht in kg inklusive Messzeitpunkt
- Schritte
- Workouts
  - Typ
  - Start / Ende
  - Dauer
  - optional Distanz
  - optional aktive Kalorien
  - Datenquelle

Es wird **kein Zugriffstoken von Apple Health** übertragen. Der Kurzbefehl liest die ausgewählten Health-Werte lokal auf dem iPhone und sendet nur diese Werte an preHIP.

## Einrichtung in preHIP

1. In preHIP anmelden.
2. `Profil > Apple Health` öffnen.
3. `Apple Health einrichten` wählen.
4. Den persönlichen Import-Schlüssel kopieren.
5. Zusätzlich API-Adresse und öffentlichen API-Key kopieren.

Wenn ein neuer Import-Schlüssel erstellt wird, wird der vorherige Schlüssel automatisch ungültig.

---

# Kurzbefehl 1 – „preHIP Tagesdaten“

Ziel: Gewicht und heutige Schritte einmal täglich synchronisieren. **Der Name muss exakt `preHIP Tagesdaten` lauten**, damit preHIP den Kurzbefehl später direkt starten und nach der Ausführung automatisch zurückkehren kann.

## A. Gewicht lesen

1. In der App **Kurzbefehle** einen neuen Kurzbefehl erstellen.
2. Aktion **Health-Proben suchen** hinzufügen.
3. Typ: **Körpergewicht**.
4. Sortieren nach: **Startdatum**, neueste zuerst.
5. Limit: **1**.
6. Vom gefundenen Health-Wert den numerischen Wert in **kg** verwenden.
7. Zusätzlich das **Startdatum / Datum dieser Gewichtsprobe** als eigene Variable verwenden. Dieses Datum wird als `weightRecordedAt` übertragen.

Das separate Messdatum ist wichtig: Ein älterer Apple-Health-Gewichtswert darf einen neueren manuellen preHIP-Eintrag nicht überschreiben.

Falls kein Gewicht vorhanden ist, dürfen `weightKg` und `weightRecordedAt` im späteren Dictionary weggelassen werden.

## B. Schritte lesen

1. Zweite Aktion **Health-Proben suchen** hinzufügen.
2. Typ: **Schritte**.
3. Filter: **Startdatum ist heute**.
4. Die gefundenen Werte summieren.

## C. JSON-Dictionary erstellen

Ein Dictionary mit folgenden Schlüsseln anlegen:

```json
{
  "action": "import",
  "weightKg": 87.4,
  "weightRecordedAt": "2026-08-14T07:30:00+02:00",
  "steps": 8431,
  "recordedAt": "2026-08-14T22:30:00+02:00",
  "source": "Apple Health Shortcut"
}
```

Dabei gilt:

- `weightKg` = Wert der neuesten Körpergewichtsprobe
- `weightRecordedAt` = tatsächliches Datum dieser Körpergewichtsprobe
- `steps` = Summe der heutigen Schritte
- `recordedAt` = aktuelles Datum / Zeitpunkt der Synchronisierung

## D. An preHIP senden

Aktion **Inhalte von URL abrufen** hinzufügen:

- URL: die in preHIP angezeigte API-Adresse
- Methode: `POST`
- Request Body: `JSON`
- JSON-Inhalt: das Dictionary aus Schritt C

Header hinzufügen:

```text
apikey: <öffentlicher API-Key aus preHIP>
x-prehip-import-key: <persönlicher Import-Schlüssel>
```

Der öffentliche Supabase-Publishable-Key ist kein Passwort. Der persönliche `x-prehip-import-key` dagegen muss geheim bleiben.

## E. Tagesautomation

Unter **Automation** eine persönliche Automation erstellen, z. B. täglich abends. Der Kurzbefehl `preHIP Tagesdaten` wird dann automatisch ausgeführt.

Zusätzlich kann preHIP den gespeicherten Kurzbefehl direkt über Apples Shortcuts-URL-Schema starten. preHIP nutzt dafür eine X-Callback-URL: Nach erfolgreicher Ausführung wird die Web-App wieder geöffnet und lädt die frisch importierten Daten automatisch neu.

---

# Kurzbefehl 2 – Workout-Import

Ziel: beendete Apple-Watch-/Health-Workouts an preHIP übertragen.

## A. Automation

In Kurzbefehle unter **Automation** einen Trigger für ein beendetes Apple-Watch-Training verwenden. Falls der Trigger auf der jeweiligen iOS-Version kein Workout-Objekt direkt bereitstellt, unmittelbar danach über **Health-Proben suchen** das zuletzt beendete Workout ermitteln.

## B. Workout-Dictionary

Das Workout wird im Feld `workout` übertragen:

```json
{
  "action": "import",
  "workout": {
    "id": "optional-eindeutige-id",
    "activityType": "cycling",
    "label": "Radfahren",
    "start": "2026-08-14T18:10:00+02:00",
    "end": "2026-08-14T18:57:00+02:00",
    "durationMinutes": 47,
    "distanceKm": 18.7,
    "activeEnergyKcal": 412,
    "source": "Apple Watch"
  }
}
```

Erlaubte Beispiele für `activityType`:

- `cycling`
- `swimming`
- `rowing`
- `walking`
- `hiking`
- `tennis`
- `skiing`
- `functional-strength-training`
- `traditional-strength-training`

Ist keine stabile Workout-ID verfügbar, kann `id` fehlen. preHIP erzeugt dann aus Workout-Typ, Zeit, Dauer und Quelle eine reproduzierbare ID und verhindert dadurch Mehrfachimporte desselben Workouts.

## C. POST

Dieselben URL- und Header-Einstellungen wie beim Tagesdaten-Kurzbefehl verwenden.

---

# Datenverhalten

- Ein Schritte-only-Import löscht kein bereits gespeichertes Gewicht desselben Tages.
- Ein Gewicht-only-Import löscht keine bereits gespeicherten Schritte desselben Tages.
- Ein älterer Health-Gewichtswert ersetzt keinen neueren bereits gespeicherten Health-Wert.
- In preHIP wird ein Health-Gewicht nur zum aktuellen Gewicht, wenn dessen **Messzeitpunkt** mindestens so neu ist wie der neueste vorhandene Gewichtseintrag.
- Rohdaten zu Schritten und Workouts werden **nicht** in den normalen `app_state` kopiert. Sie bleiben in der getrennten privaten Health-Ablage; im Browser existiert nur ein nutzerspezifischer lokaler Anzeigecache.
- Workouts werden anhand einer stabilen ID bzw. einer reproduzierbaren Ersatz-ID idempotent gespeichert.

---

# Sicherheitsregeln

Der Server verwirft unter anderem:

- ungültige oder widerrufene Import-Schlüssel
- Körpergewicht außerhalb 30–300 kg
- Schrittzahlen außerhalb 0–200.000
- Workouts mit unplausibler Dauer
- Workouts mit ungültigen Zeitangaben
- mehr als 50 Workouts pro einzelner Anfrage
- sehr große Requests
- manipulierte Workout-IDs / unsichere Storage-Dateinamen

Health-Daten werden in einem **privaten Supabase-Storage-Bucket** gespeichert. Der Zugriff aus der Web-App erfolgt nicht direkt auf den Bucket, sondern über die serverseitige Edge Function.

## Konto löschen / Daten zurücksetzen

- `Alle Einstellungen löschen` entfernt auch den Health-Import-Schlüssel und die importierten Health-Daten.
- `Konto löschen` entfernt die privaten Health-Import-Dateien **vor** der endgültigen Kontolöschung.
- Falls die Health-Daten beim Kontolöschen nicht vollständig entfernt werden könnten, bricht die Kontolöschung ab, damit keine verwaisten Gesundheitsdaten zurückbleiben.

---

# API Referenz

Endpoint:

```text
POST https://zmbkaslkgqyxmdythvba.supabase.co/functions/v1/health-shortcuts
```

### Import vom iPhone

Header:

```text
apikey: <Supabase publishable key>
x-prehip-import-key: ph1.<user-uuid>.<secret>
Content-Type: application/json
```

Body: `action=import` plus Tagesdaten und/oder Workout.

### Aktionen aus der angemeldeten Web-App

Mit Supabase User-JWT im `Authorization: Bearer ...` Header:

- `status`
- `createKey`
- `revokeKey`
- `clear`

Die Edge Function wird mit `verify_jwt=false` betrieben, weil der iPhone-Kurzbefehl keinen Supabase-User-JWT besitzt. Deshalb validiert die Funktion **jede Aktion selbst**: Benutzeraktionen über einen gültigen Supabase-User-JWT, Health-Imports über den persönlichen 256-Bit-Import-Schlüssel.

---

# Tests vor dem Deployment

Die GitHub-Actions-Suite prüft unter anderem:

- Syntax des Browser-Moduls
- Type-Check der Edge Function mit Deno
- Gewichts- und Schrittgrenzen
- Workout-Plausibilität
- Workout-Deduplizierung
- sichere Dateinamen
- Schutz gegen partielle Tagesimporte, die andere Werte löschen würden
- Priorität neuerer manueller Gewichte gegenüber älteren Health-Gewichten
- Trennung des Health-Anzeigecaches vom normalen preHIP-State
- korrekte Integration des Shortcuts-Moduls in `index.html`

Nach dem Supabase-Deployment wird zusätzlich der öffentliche Function-Endpunkt mit einem bewusst ungültigen Import-Schlüssel getestet. Erwartet wird eine saubere `401`-Antwort statt eines Gateway-/Konfigurationsfehlers.
