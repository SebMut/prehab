# preHIP iOS / Apple Health

Dieser Ordner enthält die native iOS-Grundlage für die Apple-Health-Anbindung von preHIP.

## Architektur

Die bestehende preHIP-Web-App bleibt die Oberfläche. Eine kleine native iOS-App lädt preHIP in einer `WKWebView` und stellt über eine JavaScript-Bridge den Zugriff auf HealthKit bereit.

Phase 1 liest ausschließlich:

- Körpergewicht (`bodyMass`)
- Schritte (`stepCount`)
- Workouts (`workoutType`)

Es werden noch **keine Daten in Apple Health geschrieben**.

## Xcode-Projekt anlegen

1. Auf einem Mac Xcode öffnen.
2. `File > New > Project > iOS App`.
3. Product Name: `preHIP`.
4. Interface: `SwiftUI`.
5. Language: `Swift`.
6. Bundle Identifier z. B. `de.prehip.app`.
7. Die Swift-Dateien aus `ios/PrehipApp/` in das neue Target übernehmen.
8. Unter `Signing & Capabilities` die Capability **HealthKit** hinzufügen.
9. Keine Clinical Health Records aktivieren.
10. Unter `Target > Info` den Eintrag **Privacy - Health Share Usage Description** hinzufügen:

   `preHIP liest Gewicht, Schritte und Workouts, um deinen persönlichen Trainings- und Vorbereitungsverlauf automatisch zu ergänzen.`

11. `Prehip.entitlements` dem Target zuordnen oder die von Xcode erzeugte HealthKit-Entitlement-Datei verwenden.
12. Auf einem echten iPhone starten. HealthKit ist im Simulator nur eingeschränkt sinnvoll testbar.

## JavaScript-Bridge

Die Web-App sendet Nachrichten an:

```text
window.webkit.messageHandlers.prehipHealthKit
```

Unterstützte Aktionen:

- `status`
- `requestAuthorization`
- `sync`

Die native App antwortet über:

```text
window.prehipHealthNativeReceive(...)
```

## Aktueller Datenfluss

```text
Apple Health
   ↓ HealthKit
HealthKitBridge.swift
   ↓ WKWebView JavaScript Bridge
v1-healthkit.js
   ↓
preHIP state / Gewicht / Profilanzeige
   ↓
lokaler Cache + vorhandener Supabase-Sync
```

## Wichtiger Datenschutz-Hinweis

HealthKit-Daten sind sensible Gesundheitsdaten. Der Nutzer muss den Zugriff für jeden Datentyp ausdrücklich freigeben. Eine Ablehnung von Leserechten ist für Apps absichtlich nicht eindeutig von „keine Daten vorhanden“ unterscheidbar. preHIP sollte daher niemals aus fehlenden Daten schließen, dass eine Berechtigung erteilt oder verweigert wurde.

## Nächste Schritte

- echtes Xcode-Projekt erzeugen und auf iPhone installieren
- HealthKit-Berechtigungsdialog testen
- Gewicht aus Apple Health gegen manuelle Gewichtseinträge testen
- Workout-Typen in preHIP-Aktivitäten übersetzen
- Schrittverlauf auf dem Dashboard darstellen
- optional später Schlaf integrieren
- optional später preHIP-Workouts in HealthKit zurückschreiben
