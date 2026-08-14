<p align="center">
  <img src="assets/prehip-logo.svg" alt="preHIP" width="320">
</p>

<h1 align="center">preHIP</h1>

<p align="center">
  <strong>Dein stärkerer Start für die Hüft-OP.</strong><br>
  Mobile Prehab-, Trainings- und Vorbereitungs-App für die Zeit vor und später auch nach einer Hüftoperation.
</p>

<p align="center">
  <a href="https://sebmut.github.io/prehab/"><strong>Live-App öffnen</strong></a>
  ·
  <strong>v1.1.0-beta.39</strong>
</p>

---

## Überblick

**preHIP** verbindet einen persönlichen Trainingsplan mit OP-Countdown, Hüft-Check-ins, Gewichts- und Fortschrittsverlauf, Kalender, organisatorischer OP-Vorbereitung und einer vorbereiteten Prehab→Rehab-Architektur.

Die App ist aktuell als mobile Web-App aufgebaut und wird über GitHub Pages ausgeliefert. Angemeldete Nutzer können ihren App-State über Supabase synchronisieren.

> **Medizinischer Hinweis:** preHIP ist kein Medizinprodukt und ersetzt keine ärztliche, physiotherapeutische oder klinische Beratung. Trainingsbelastung, postoperative Übungen, Einschränkungen und Hilfsmittel richten sich immer nach den individuellen Vorgaben des Behandlungsteams.

---

# Hauptbereiche

Die Navigation ist bewusst auf fünf Bereiche reduziert:

- **Heute** – Dashboard, OP-Countdown, Training, preHIP Score, Hüft-Check-in und Tagesübersicht
- **Training** – Wochenplan, Trainingsdetails und aktiver Übungsmodus
- **Fortschritt** – Training, Gewicht, Hüftverlauf und Meilensteine
- **Kalender** – Monatsübersicht mit Training, Verlauf und OP-Termin
- **Profil** – persönliche Daten, Ziele, Equipment, Trainingsstart, OP-Daten, Apple Health, Cloud und Konto

---

# Features

## 🔐 Login, Konto und Demo

- Start-/Login-Seite mit großem preHIP-Logo
- Anmeldung mit E-Mail und Passwort
- Kontoerstellung über Supabase Auth
- Demo-Modus
- lokaler Cache im Browser
- Supabase-Cloud-Synchronisierung für angemeldete Nutzer
- manuelle Cloud-Synchronisierung / Cloud neu laden
- Ausloggen im Profil
- Einstellungen komplett zurücksetzen mit Passwortprüfung
- Konto dauerhaft löschen mit Passwortprüfung
- Apple-Health-Importdaten werden beim Reset bzw. bei Kontolöschung ebenfalls entfernt

---

## 👋 Persönliches Onboarding

Beim ersten Start werden die wichtigsten Angaben für den persönlichen Plan abgefragt:

1. Vorname
2. Ist-Gewicht
3. Zielgewicht
4. OP-Datum
5. Ziele / gewünschte Aktivitäten
6. aktuelles Aktivitätsniveau
7. verfügbares Equipment
8. Trainingsstart
9. bevorzugte Trainingstage

### Ziele

Aktuell unter anderem:

- Aktiver Alltag
- Radfahren
- Schwimmen
- Wandern
- Fitness
- Tennis
- Skifahren

Die Mehrfachauswahl ist bei einem neuen Onboarding zunächst vollständig aktiviert und kann einfach reduziert werden.

### Equipment

- Theraband
- Kurzhanteln
- Fahrrad
- Rudergerät
- Fitnessstudio
- Schwimmbad
- Sprossenwand

Auch das Equipment ist initial vollständig vorausgewählt.

### Trainingstage

Montag bis Sonntag sind zunächst markiert. Die Planlogik erhält trotzdem mindestens einen kompletten Ruhetag.

### Plan-Erstellung

Nach dem Onboarding zeigt preHIP eine kurze Planberechnung und anschließend **„Dein Plan ist bereit“**. Der kritische Übergang

```text
Onboarding → Plan erstellen → Meinen Plan ansehen → Heute
```

wird automatisiert in GitHub Actions getestet.

Alle Onboarding-Angaben lassen sich später im Profil ändern.

---

## 🏠 Dashboard „Heute“

- persönliche Begrüßung abhängig von der Tageszeit
- Name
- Datum und Uhrzeit
- OP-Countdown
- Phasen-/Journey-Darstellung
- heutiges Training
- Wochenziel / Planerfüllung
- zusätzliche Aktivitäten
- Hüft-Check-in
- preHIP Score
- Pre-OP-Checkliste
- Gewicht und Gewichtsentwicklung
- Hüftverlauf mit Schmerz und Steifigkeit
- kontextabhängige Hinweise passend zur verbleibenden Zeit bis zur OP

---

## ⭐ preHIP Score

Motivationswert von 0 bis 100 aus:

- **40 % Planerfüllung**
- **20 % Gewichtsfortschritt**
- **20 % Regelmäßigkeit**
- **20 % persönlichem Befinden**

Der Score ist ausdrücklich **keine medizinische Bewertung**.

---

## 🦴 Hüft-Check-in

Erfasst werden:

- Schmerz 0–10
- Steifigkeit 0–10
- Energie 1–5
- Schlaf 1–5
- optional stärkeres Hinken als sonst

Die App erzeugt daraus eine vorsichtige persönliche Orientierung wie „normal im Plan“, „kontrolliert“ oder „bewusst locker“. Das ist keine medizinische Freigabe.

---

## 🏋️ Personalisierter Trainingsplan

Berücksichtigt werden aktuell:

- Trainingsstart
- OP-Datum
- Ziele
- Trainingstage
- Equipment
- mindestens ein Ruhetag
- wechselnde Einheiten über mehrere Wochen

### Trainingsbausteine

Unter anderem:

- Hüfte & Rumpf
- Alltagskraft & Stabilität
- Radfahren + Mobility / Dehnen
- Rudergerät + Oberkörper
- Schwimmen + Hüftmobilität
- Wandern / Gehfähigkeit
- Fitness / Core
- zielbezogene Stabilitätsarbeit
- Mobility
- komplette Ruhetage

Equipment und Ziele sind verknüpft. Beispiel: feste Schwimmeinheiten werden nur eingeplant, wenn ein Schwimmbad verfügbar ist.

---

## ▶️ Trainingsmodus

- einzelne Übungen innerhalb einer Einheit
- Bilder / anatomische Darstellung
- YouTube-Vorschau per Play-Button
- Satz-Zähler
- Satz erledigen
- Übung komplett markieren
- Warnung bei noch offenen Sätzen
- Übung überspringen
- innerhalb der Einheit zurückgehen
- versehentlich erledigte Übungen wiederherstellen
- Trainingsabschluss
- Alternativen / leichtere Varianten
- unterschiedliche Schwierigkeitsstufen

Postoperative Übungen werden nicht pauschal freigeschaltet. Dafür soll später der konkrete Klinik-/Physiotherapieplan verwendet werden.

---

## 🚶 Zusätzliche Aktivitäten

Zusätzliche Aktivitäten können unabhängig vom festen Plan dokumentiert werden. Der Sportkatalog umfasst unter anderem Spaziergang, Radfahren, Rudern, Schwimmen, Krafttraining, Mobility, Wandern, Walking, Yoga, Pilates, Aqua-Fitness, Fitnessstudio, Tennis und weitere Sportarten.

Im Profil lässt sich auswählen, welche Aktivitäten als Schnellzugriff auf dem Dashboard erscheinen.

---

## ⚖️ Gewicht

- Ist- und Zielgewicht im Onboarding
- Gewicht direkt im Dashboard eintragen
- Datum und Uhrzeit werden gespeichert
- Gewichtshistorie und Diagramm
- Startgewicht / aktuelles Gewicht / Zielgewicht
- Gewicht fließt in den preHIP Score ein
- optionaler Import aus Apple Health

---

## 📈 Fortschritt & Meilensteine

- Wochenübersicht
- Einheiten und Trainingsminuten
- Planerfüllung
- Gewichtsverlauf
- Hüft-Check-ins
- Schmerz- und Steifigkeitsverlauf
- Ziel-Fokus
- Trainingshistorie
- vorbereitungsbezogene Meilensteine
- abgeschlossene Meilenstein-Kapitel können ein- und ausgeklappt werden

---

## 📅 Kalender

- Monatsübersicht
- geplante Trainingstage
- absolvierte Trainingstage
- nicht vollständig absolvierte Tage hervorgehoben
- Ruhetage
- Trainingsstart
- OP-Termin
- Tagesdetails

Tage vor dem gewählten Trainingsstart werden nicht als verpasste Trainingstage bewertet.

---

# 🍎 Apple Health ohne native App

Seit beta.39 verwendet preHIP für die erste produktive Apple-Health-Anbindung **iPhone-Kurzbefehle + Supabase** statt einer zwingenden nativen iOS-App.

```text
Apple Health
   ↓
iPhone-Kurzbefehl / Automation
   ↓ HTTPS
Supabase Edge Function
   ↓
private Health-Ablage
   ↓
preHIP
```

### Phase 1 importiert

- Körpergewicht inklusive tatsächlichem Messzeitpunkt
- heutige Schritte
- Workouts
  - Typ
  - Start / Ende
  - Dauer
  - optional Distanz
  - optional aktive Kalorien
  - Quelle

### Einrichtung

Im Profil gibt es den Bereich **Apple Health**.

Dort kann ein persönlicher Import-Schlüssel erzeugt werden. Dieser besteht aus einer zufälligen 256-Bit-Komponente; serverseitig wird ausschließlich der SHA-256-Hash des Geheimnisses gespeichert. Der Klartext-Schlüssel wird nur beim Erstellen angezeigt und anschließend im persönlichen iPhone-Kurzbefehl hinterlegt.

Der Kurzbefehl **`preHIP Tagesdaten`** kann später direkt aus preHIP gestartet werden. Über Apples X-Callback-URL-Schema kehrt das iPhone nach erfolgreicher Ausführung wieder zu preHIP zurück und die App lädt die importierten Werte neu.

Apple-Watch-Trainings können zusätzlich über eine persönliche Shortcut-Automation beim Trainingsende importiert werden.

### Datenschutz / Datentrennung

Rohdaten zu Schritten und Workouts liegen getrennt vom normalen preHIP-App-State in einem privaten Supabase-Storage-Bereich. Im Browser wird nur ein nutzerspezifischer lokaler Anzeigecache verwendet.

Ein importiertes Health-Gewicht wird nur zum aktuellen preHIP-Gewicht, wenn sein tatsächlicher **Messzeitpunkt** nicht älter als der neueste vorhandene Gewichtseintrag ist.

Ein Schritte-only-Import löscht kein Gewicht; ein Gewicht-only-Import löscht keine Schritte.

Ausführliche Einrichtung:

**[`APPLE_HEALTH_SHORTCUTS.md`](APPLE_HEALTH_SHORTCUTS.md)**

Die ältere native HealthKit-Prototypbasis bleibt im Ordner `ios/` als mögliche spätere App-Store-Option erhalten, ist aber in der aktuellen Web-App nicht aktiv geladen.

---

# ✅ Pre-OP-Vorbereitung

## Checkliste

Unter anderem:

- Klinikunterlagen
- Medikamentenliste
- Heimfahrt
- Unterstützung zu Hause
- Wohnung vorbereiten
- Hilfsmittel
- Reha / Nachsorge
- Arbeit / AU
- Kliniktasche

## Meine OP / Wissen

Kurze Informationskarten zu Vorbereitung, Klinik, Reha und Rückkehr in den Alltag.

## Fragen an Arzt & Klinik

Persönliche Fragenliste mit eigenen Ergänzungen und Erledigt-Status.

## Packlisten

Getrennte Listen für Klinik und Reha, inklusive eigener Einträge.

---

# 🔄 Prehab → Rehab

Die Architektur unterscheidet bereits zwischen **Prehab** und **Rehab**. Im automatischen Modus wechselt die App ab dem OP-Datum in den Rehab-Modus.

Postoperative Übungen werden erst mit einem konkreten Klinik-/Physiotherapieplan aktiviert.

---

# Technik

## Frontend

- HTML5
- CSS
- Vanilla JavaScript
- mobile / iPhone-orientierte Oberfläche
- statisches Hosting über GitHub Pages

## Backend

- Supabase Auth
- Supabase REST API
- App-State pro Nutzer
- Sportkatalog / Sportvorschläge
- Edge Function für sichere Kontolöschung
- Edge Function für Apple-Health-Kurzbefehle
- privater Supabase Storage für Health-Importdaten

## Datenspeicherung

### Normaler App-State

- LocalStorage als schneller Cache
- Supabase `app_state` für angemeldete Nutzer

Enthält unter anderem Profil, Trainingsdaten, Gewichtshistorie, Check-ins, Termine, Checklisten und Einstellungen.

### Apple Health

Rohimporte werden bewusst getrennt gespeichert:

```text
prehip-health-imports/
├── keys/<user>.json
├── daily/<user>/<date>.json
└── workouts/<user>/<workout>.json
```

Der Bucket ist privat. Die Edge Function vermittelt den Zugriff.

---

# Relevante Dateien

```text
index.html
v1-app.js
v1-dashboard.js
v1-name-onboarding.js
v1-onboarding-defaults.js
v1-training-start.js
v1-goal-plan.js
v1-goal-ui.js
v1-plan-builder.js
v1-plan-handoff-final.js
v1-training-upgrades.js
v1-video-preview.js
v1-activities.js
v1-op-companion.js
v1-milestones.js
v1-account.js
supabase-rest-sync.js

v1-health-shortcuts.js
v1-health-shortcuts.css
APPLE_HEALTH_SHORTCUTS.md
supabase/functions/health-shortcuts/index.ts
supabase/functions/health-shortcuts/logic.mjs
supabase/functions/delete-account/index.ts
supabase/config.toml

tests/handoff-smoke.mjs
tests/health-shortcuts-logic.test.mjs
tests/health-shortcuts-client.test.mjs
```

---

# Tests / CI

GitHub Actions prüft unter anderem:

### preHIP Kern

- kritischer Browser-Smoke-Test für Onboarding → Plan → Heute

### Apple Health

- Browser-JavaScript-Syntax
- Deno-Typecheck der Edge Function
- Gewichtsgrenzen
- Schrittgrenzen
- Workout-Plausibilität
- Workout-Deduplizierung
- sichere Storage-Dateinamen
- partielle Tagesimporte
- tatsächlicher Gewichtsmesszeitpunkt
- Schutz neuerer manueller Gewichtseinträge
- Trennung des Health-Caches vom normalen Cloud-State
- Integration der Shortcuts-Dateien

Nach dem Supabase-Deployment prüft ein Laufzeittest zusätzlich CORS sowie die erwartete `401`-Antwort für einen absichtlich ungültigen Import-Schlüssel.

---

# Deployment

Produktive Testversion:

**https://sebmut.github.io/prehab/**

GitHub Actions übernimmt:

- JavaScript-Validierung
- GitHub-Pages-Deployment
- Handoff-Smoke-Test
- Apple-Health-Smoke-Tests
- Deployment der Supabase Edge Functions
- Runtime-Smoke-Test des Apple-Health-Endpunkts

---

# Aktueller Stand

**Status:** Beta / aktive Entwicklung  
**Version:** `v1.1.0-beta.39`

Gesicherte Absprungbasis vor Apple Health:

```text
baseline-v1.1.0-beta.37-pre-apple-health
```

Damit kann jederzeit auf den stabilen Stand vor der Health-Integration zurückgegangen werden.

---

# Mögliche nächste Schritte

- Apple-Health-Kurzbefehl auf dem echten iPhone einrichten und End-to-End testen
- Workout-Typen automatisch preHIP-Planpositionen zuordnen
- Schritte als Verlauf im Fortschrittsbereich darstellen
- automatische Erkennung „geplante Radeinheit durch Apple-Watch-Workout erfüllt“
- Schlaf optional importieren
- Arzt-/Physio-Bericht / PDF-Export
- vollständiger Rehab-Modus auf Basis konkreter Klinik-/Physiotherapiepläne
- später optional native HealthKit-App / App-Store-Version

---

## Medizinischer Hinweis

preHIP dient der **Dokumentation, Organisation und Motivation** rund um die persönliche OP-Vorbereitung.

Die App stellt keine Diagnose, gibt keine individuelle medizinische Freigabe und ersetzt keine Behandlung. Bei neuen, starken oder ungewöhnlichen Beschwerden sowie bei Fragen zu Belastungsgrenzen, Medikamenten, Hilfsmitteln oder postoperativen Übungen ist das behandelnde medizinische Team zuständig.
