<p align="center">
  <img src="assets/prehip-logo.svg" alt="preHIP" width="320">
</p>

<h1 align="center">preHIP</h1>

<p align="center">
  <strong>Dein stärkerer Start für die Hüft-OP.</strong><br>
  Persönliche Prehab-, Trainings- und Vorbereitungs-App für die Zeit vor einer Hüftoperation.
</p>

<p align="center">
  <a href="https://sebmut.github.io/prehab/"><strong>Live-App öffnen</strong></a>
  ·
  <strong>Version v1.1.0-beta.37</strong>
  ·
  <strong>Build 20260814-1544</strong>
</p>

---

## Was ist preHIP?

**preHIP** ist eine mobile Web-App zur persönlichen Vorbereitung auf eine Hüftoperation. Sie verbindet einen individualisierten Trainingsplan mit OP-Countdown, Hüft-Check-ins, Gewichts- und Fortschrittsverlauf, Kalender, organisatorischer OP-Vorbereitung und einem späteren Wechsel von **Prehab** zu **Rehab**.

Der Schwerpunkt liegt nicht auf klassischem Fitness-Tracking, sondern auf einer strukturierten und motivierenden Vorbereitung auf die Zeit rund um eine Hüft-OP.

> **Wichtig:** preHIP ist kein Medizinprodukt und ersetzt keine ärztliche, physiotherapeutische oder klinische Beratung. Trainingsbelastung, postoperative Übungen, Einschränkungen und Hilfsmittel richten sich immer nach den individuellen Vorgaben des Behandlungsteams.

---

## Hauptnavigation

Die App ist bewusst auf fünf Hauptbereiche reduziert:

- **Heute** – persönliches Dashboard, OP-Countdown, Training, preHIP Score, Hüft-Check-in und Tagesübersicht
- **Training** – Wochenplan, Trainingsdetails und aktiver Übungsmodus
- **Fortschritt** – Training, Gewicht, Hüftverlauf und Meilensteine
- **Kalender** – Monatsübersicht mit Trainingstagen, Verlauf und OP-Termin
- **Profil** – persönliche Daten, Ziele, Equipment, Trainingsstart, OP-Daten, Aktivitäten, Cloud und Konto

---

# Aktuelle Features

## 🔐 Login, Konto und Demo

- Start-/Login-Seite mit großem preHIP-Logo
- Anmeldung per E-Mail und Passwort
- Kontoerstellung über **Supabase Auth**
- Demo-Modus ohne eigenes Konto
- lokale Datenspeicherung als Cache
- Cloud-Synchronisierung bei angemeldeten Nutzern
- manuelles „Jetzt synchronisieren“ und „Cloud-Daten neu laden“
- Ausloggen über das Profil
- Konto dauerhaft löschen mit erneuter Passwortabfrage
- alle Einstellungen und gespeicherten Daten zurücksetzen, ebenfalls mit Passwortprüfung

---

## 👋 Persönliches Onboarding

Beim ersten Start werden die wichtigsten Angaben für den individuellen Plan abgefragt:

1. **Vorname**
2. **Ist-Gewicht und Zielgewicht**
3. **OP-Datum**
4. **Ziele / gewünschte Aktivitäten**
5. **aktuelles Aktivitätsniveau**
6. **verfügbares Equipment**
7. **Trainingsstart**
8. **bevorzugte Trainingstage**

### Ziele / Sportarten

Aktuell stehen im Onboarding zur Verfügung:

- Aktiver Alltag
- Radfahren
- Schwimmen
- Wandern
- Fitness
- Tennis
- Skifahren

Bei einem neuen Onboarding sind die Mehrfachauswahlen zunächst vollständig markiert und können anschließend einfach abgewählt werden.

### Equipment

- Theraband
- Kurzhanteln
- Fahrrad
- Rudergerät
- Fitnessstudio
- Schwimmbad
- Sprossenwand

Auch das Equipment ist initial vollständig ausgewählt und kann individuell reduziert werden.

### Trainingstage

Montag bis Sonntag sind zunächst markiert. Die Planlogik sorgt trotzdem dafür, dass **mindestens ein kompletter Ruhetag** erhalten bleibt.

### Plan-Erstellung

Nach Abschluss des Onboardings simuliert preHIP für einige Sekunden die persönliche Planberechnung. Dabei werden unter anderem OP-Zeitraum, Ziele und Trainingstage verarbeitet. Anschließend erscheint **„Dein Plan ist bereit“** mit direktem Einstieg in das Dashboard.

Alle Angaben können später jederzeit im Profil geändert werden.

---

## 🏠 Dashboard „Heute“

Die Startseite bündelt die wichtigsten Informationen für den aktuellen Tag:

- persönliche Begrüßung abhängig von der Tageszeit
- Name des Nutzers
- aktuelles Datum und Uhrzeit
- Tage bis zur OP
- Phasen-/Journey-Darstellung
- heutiges Training
- Wochenziel und Planerfüllung
- zusätzliche Aktivitäten
- Tages-Hüft-Check-in
- Pre-OP-Checkliste
- Gewicht und Gewichtsentwicklung
- Hüftverlauf mit Schmerz- und Steifigkeitstrend
- kontextabhängiger Bereich **„Heute wichtig“** passend zur verbleibenden Zeit bis zur OP

---

## ⭐ preHIP Score

Der **preHIP Score** ist ein Motivations- und Vorbereitungswert von 0 bis 100.

Er setzt sich aktuell zusammen aus:

- **40 % Planerfüllung**
- **20 % Gewichtsfortschritt**
- **20 % Regelmäßigkeit**
- **20 % persönliches Befinden**

Der Score ist ausdrücklich **keine medizinische Bewertung**. Er soll lediglich sichtbar machen, wie konstant die persönliche Vorbereitung aktuell läuft.

---

## 🦴 Hüft-Check-in

Der Tages-Check-in erfasst den persönlichen Zustand der Hüfte:

- Schmerz **0–10**
- Steifigkeit **0–10**
- Energie **1–5**
- Schlaf **1–5**
- optional: „Hinken heute stärker als sonst“

Aus dem eigenen Check-in erzeugt die App eine vorsichtige Tagesorientierung, zum Beispiel:

- „Heute normal im Plan“
- „Heute kontrolliert“
- „Heute bewusst locker“

Diese Hinweise dienen ausschließlich der persönlichen Verlaufsdarstellung und ersetzen keine medizinische Einschätzung.

---

## 🏋️ Personalisierter Trainingsplan

Der Wochenplan berücksichtigt aktuell:

- Trainingsstart
- OP-Datum
- ausgewählte Ziele
- bevorzugte Trainingstage
- verfügbares Equipment
- mindestens einen Ruhetag
- unterschiedliche Einheiten von Woche zu Woche

### Mögliche Trainingsbausteine

Unter anderem:

- Hüfte & Rumpf
- Alltagskraft & Stabilität
- Radfahren + Mobility / Dehnen
- Rudergerät + Oberkörper
- Schwimmen + Hüftmobilität
- Wandern / Gehfähigkeit
- Fitness / Core
- tennisbezogene Stabilitätsvorbereitung
- ski-bezogene Bein- und Rumpfvorbereitung
- Mobility
- komplette Ruhetage

Bestimmte Ziele werden mit dem Equipment verknüpft. Beispiel: Eine feste Schwimmeinheit wird nur eingeplant, wenn ein **Schwimmbad** als verfügbar hinterlegt ist.

---

## ▶️ Trainingsmodus

Eine Trainingseinheit lässt sich vollständig öffnen und Schritt für Schritt durchführen.

Aktuell unterstützt der Trainingsmodus unter anderem:

- einzelne Übungen innerhalb einer Einheit
- Übungsbild / anatomische Darstellung
- Play-Button für passende YouTube-Videos
- Satz-Zähler
- „Satz erledigt“
- „Übung komplett“
- Hinweis, wenn eine Übung als komplett markiert wird, obwohl noch nicht alle Sätze erledigt sind
- Übung überspringen
- innerhalb des Trainings zur vorherigen Übung zurückgehen
- absolvierte Übungen später wiederherstellen
- Trainingsabschluss
- alternative bzw. leichtere Übungsvarianten
- drei Schwierigkeitsstufen für unterstützte Übungen

Postoperative Übungen werden bewusst noch nicht pauschal freigeschaltet, da dafür die konkrete Vorgabe von Klinik und Physiotherapie erforderlich ist.

---

## 🔀 Ziele beeinflussen den Wochenplan

Die im Onboarding gewählten Ziele sind nicht nur Profilinformationen, sondern steuern den Trainingsplan.

Der **Hüft-/Rumpfkern** bleibt als Basis erhalten. Freie Trainingstage werden anschließend mit passenden Einheiten aus den gewählten Zielen belegt und von Woche zu Woche durchmischt.

Dadurch soll der Plan abwechslungsreicher werden, ohne die OP-spezifische Basis zu verlieren.

---

## 🚶 Zusätzliche Aktivitäten

Neben dem festen Plan können zusätzliche Aktivitäten dokumentiert werden.

Der aktuelle Sportkatalog enthält unter anderem:

- Spaziergang
- Radfahren
- Rudergerät
- Schwimmen
- Krafttraining
- Mobilität
- Wandern
- Nordic Walking
- Walking
- Joggen
- Yoga
- Pilates
- Aqua-Fitness
- Wassergymnastik
- Fitnessstudio
- Crosstrainer
- Tanzen
- Gymnastik
- Tennis
- Tischtennis
- Badminton
- Pickleball
- Padel
- Golf
- Basketball
- Fußball
- Volleyball
- Handball
- Klettern
- Skifahren
- Skilanglauf

Im Profil kann ausgewählt werden, welche Aktivitäten als Schnellzugriff auf der Startseite erscheinen.

Fehlende Sportarten können vorgeschlagen werden. Vorschläge werden getrennt gespeichert und können später nach Prüfung für alle Nutzer freigegeben werden.

---

## ⚖️ Gewicht & Zielgewicht

- Ist-Gewicht bereits im Onboarding
- persönliches Zielgewicht
- neues Gewicht direkt auf der Startseite eintragen
- Datum und Uhrzeit werden gespeichert
- Gewichtshistorie
- grafischer Verlauf
- Startgewicht, aktuelles Gewicht und Zielgewicht im Fortschrittsbereich
- Gewicht ist Bestandteil des preHIP Scores

---

## 📈 Fortschritt

Der Fortschrittsbereich zeigt nicht nur absolvierte Trainings, sondern kombiniert verschiedene Aspekte der Vorbereitung:

- Wochenübersicht
- absolvierte Einheiten
- Trainingsminuten
- Planerfüllung
- Gewichtsentwicklung
- Hüft-Check-ins
- Schmerz- und Steifigkeitsverlauf
- Ziel-Fokus der Woche
- Meilensteine
- Trainingshistorie

Abgehakte Übungen lassen sich bei versehentlicher Erledigung wieder dem ursprünglichen Tag zuordnen und wiederherstellen.

---

## 🏆 Meilensteine

Statt klassischer Fitness-Streaks setzt preHIP auf vorbereitungsbezogene Meilensteine.

Beispiele:

- Gewichtsziele
- absolvierte Trainingsanzahl
- Rad-/Rudereinheiten
- Planerfüllung
- regelmäßige Check-ins
- Countdown-Meilensteine bis zur OP
- abgeschlossene Vorbereitungsschritte

Abgeschlossene Kapitel können eingeklappt und bei Bedarf wieder geöffnet werden.

---

## 📅 Kalender

Der Kalender ersetzt die frühere reine „Heute + 6 Tage“-Ansicht.

Aktuell werden unter anderem dargestellt:

- Monatsübersicht
- geplante Trainingstage
- absolvierte Trainingstage
- nicht vollständig absolvierte Tage farblich hervorgehoben
- Ruhetage
- OP-Termin
- Trainingsstart
- Tagesdetails
- Gewicht / Aktivitäten / Verlauf je nach vorhandenen Daten

Tage vor dem individuell gewählten Trainingsstart werden nicht fälschlicherweise als verpasste Trainingstage bewertet.

---

# OP-Vorbereitung

## ✅ Pre-OP-Checkliste

Die integrierte Checkliste enthält aktuell unter anderem:

- Klinikunterlagen vollständig
- Medikamentenliste geklärt
- Heimfahrt organisiert
- Unterstützung zu Hause organisiert
- Wohnung vorbereitet
- Hilfsmittel geklärt
- Reha / Nachsorge geklärt
- Arbeit / AU organisiert
- Kliniktasche vorbereitet

Der Fortschritt wird direkt im Dashboard angezeigt.

---

## 🏥 „Meine OP“ / OP-Begleiter

Im Profil gibt es einen eigenen Bereich für die OP-Vorbereitung.

### Wissen / Meine OP

Kurze Karten zu:

- Vorbereitung vor der OP
- Klinikaufenthalt
- Reha & Physiotherapie
- Rückkehr in den Alltag

### Fragen an Arzt & Klinik

Eine persönliche Fragenliste, z. B. zu:

- OP-Verfahren
- Bewegungs- und Belastungsgrenzen
- Medikamenten
- Physiotherapie / Reha
- Hilfsmitteln
- Warnzeichen nach der OP

Eigene Fragen können ergänzt und als geklärt markiert werden.

### Packlisten

Getrennte Listen für:

- Klinik
- Reha

Eigene Einträge können ergänzt werden.

---

## 🔄 Prehab → Rehab

Die Architektur unterscheidet bereits zwischen **Prehab** und **Rehab**.

Im automatischen Modus wechselt die App ab dem hinterlegten OP-Datum in den Rehab-Modus. Aktuell wird dort bewusst noch ein Platzhalter angezeigt:

> Postoperative Übungen werden erst aktiviert, wenn der konkrete Klinik-/Physiotherapieplan vorliegt.

Dadurch muss später keine zweite App aufgebaut werden; die bestehende Struktur kann um den individuellen Rehab-Plan erweitert werden.

---

# Profil & Einstellungen

Im Profil können unter anderem geändert werden:

- Name
- OP-Datum
- Trainingsstart
- Ziele
- Trainingstage
- Equipment
- Aktivitätsniveau
- zusätzliche Aktivitäten
- Klinik
- Operateur
- OP-Verfahren
- Reha-Start
- OP-Notizen
- Programmmodus Prehab / Rehab / automatisch
- Cloud-Synchronisierung
- Konto und Daten

---

# Technik

preHIP ist aktuell als bewusst schlanke **mobile Web-App / PWA-nahe Anwendung** aufgebaut.

### Frontend

- HTML5
- CSS
- Vanilla JavaScript
- responsive / iPhone-orientiertes Layout
- keine klassische Build-Pipeline notwendig
- statisches Hosting über GitHub Pages

### Backend / Cloud

- Supabase Auth
- Supabase REST API
- persistenter App-State pro Nutzer
- Sportkatalog und Sportvorschläge über Supabase-Tabellen
- sichere Kontolöschung über serverseitige Function vorgesehen / angebunden

### Datenspeicherung

Die App arbeitet mit zwei Ebenen:

1. **LocalStorage** als schneller lokaler Cache
2. **Supabase Cloud** für angemeldete Nutzer

Gespeichert werden unter anderem:

- Profil
- Trainingsplan
- Trainingsergebnisse
- Gewichtsverlauf
- Hüft-Check-ins
- Aktivitäten
- Termine
- Meilensteine
- Checklisten
- OP-Daten
- persönliche Einstellungen

---

# Projektstruktur

Die Anwendung ist modular in mehrere JavaScript- und CSS-Dateien aufgeteilt.

Wichtige Dateien:

```text
index.html
v1-app.js                   Grundfunktionen und Kernansichten
v1-dashboard.js             Heute-Dashboard, Score, Check-in, Pre-OP
v1-name-onboarding.js       Name und Gewicht im Onboarding
v1-onboarding-defaults.js   initiale Vorauswahl
v1-training-start.js        persönlicher Trainingsstart
v1-goal-plan.js             zielbasierte Wochenplanung
v1-goal-ui.js               Darstellung personalisierter Ziele
v1-plan-builder.js          Planberechnungs-Animation
v1-plan-handoff-final.js    sicherer Übergang ins Dashboard
v1-training-upgrades.js     erweiterter Trainingsmodus
v1-video-preview.js         Video-/YouTube-Vorschau
v1-activities.js            zusätzliche Aktivitäten / Sportkatalog
v1-op-companion.js          Wissen, Arztfragen, Packlisten
v1-milestones.js            Meilensteine
v1-account.js               Logout, Reset, Kontolöschung
supabase-rest-sync.js       Login, Cloud-State und Synchronisierung
assets/                     Logo und weitere Assets
```

---

# Lokal starten

Da preHIP aktuell ohne Bundler auskommt, reicht ein einfacher lokaler Webserver.

Zum Beispiel mit Python:

```bash
python -m http.server 8080
```

Danach:

```text
http://localhost:8080
```

Für Cloud-Funktionen muss eine gültige Supabase-Konfiguration vorhanden sein.

---

# Deployment

Die produktive Testversion wird über **GitHub Pages** veröffentlicht:

**https://sebmut.github.io/prehab/**

GitHub Actions übernimmt dabei unter anderem:

- JavaScript-Validierung
- Pages-Deployment
- automatisierten Browser-Smoke-Test für den kritischen Ablauf
  **Onboarding → Plan erstellen → Meinen Plan ansehen → Heute**

Dieser Test wurde ergänzt, nachdem ein Laufzeitfehler in der personalisierten Wochenplanung erkannt wurde, und soll Regressionen beim Onboarding-Handoff künftig automatisch auffangen.

---

# Aktueller Entwicklungsstatus

**Status:** Beta / aktive Entwicklung

**Aktuelle Version:** `v1.1.0-beta.37`

Die App ist derzeit vor allem für Tests und die persönliche Weiterentwicklung gedacht. UI, Datenmodell und Rehab-Logik können sich noch ändern.

---

# Geplante / mögliche nächste Schritte

- vollständiger Rehab-Modus auf Basis konkreter Klinik-/Physiotherapiepläne
- Apple Health / HealthKit-Anbindung für Gewicht, Schritte und Workouts
- Arzt-/Physio-Bericht für die letzten Wochen
- Export / PDF-Zusammenfassung
- detailliertere Auswertung „Befinden vor und nach Training“
- statistische Zusammenhänge zwischen Aktivität und persönlichem Hüftbefinden
- Therapeutenmodus
- weiter verbesserte anatomische Übungsbilder
- noch präzisere Übungsalternativen abhängig von Equipment und Beschwerden
- App-Store-/Native-App-Prüfung nach Stabilisierung der Web-Version

---

## Medizinischer Hinweis

preHIP dient der **Dokumentation, Organisation und Motivation** rund um die persönliche OP-Vorbereitung.

Die App stellt keine Diagnose, gibt keine individuelle medizinische Freigabe und ersetzt keine Behandlung. Bei neuen, starken oder ungewöhnlichen Beschwerden sowie bei Fragen zu Belastungsgrenzen, Medikamenten, Hilfsmitteln oder postoperativen Übungen ist das behandelnde medizinische Team zuständig.
