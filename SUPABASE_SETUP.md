# preHIP – Supabase Setup

## 1. Supabase-Projekt anlegen
Erstelle im Supabase Dashboard ein neues Projekt, z. B. `prehip`.

## 2. Datenbank vorbereiten
Öffne im Supabase Dashboard den SQL Editor und führe den Inhalt von `supabase-schema.sql` aus.

Dadurch entsteht die Tabelle `public.app_state` mit Row Level Security (RLS). Jeder eingeloggte Benutzer darf nur seine eigene Datenzeile lesen und ändern.

## 3. Auth Redirect konfigurieren
Unter Authentication → URL Configuration:

- Site URL: `https://sebmut.github.io/prehab/`
- Redirect URL hinzufügen: `https://sebmut.github.io/prehab/`

## 4. Browser-Konfiguration
Unter Project Settings / API werden benötigt:

- Project URL
- Publishable Key (oder bei älteren Projekten der `anon` Key)

Der `service_role` / Secret Key darf niemals in die Web-App eingebaut werden.

## 5. Geplanter Ablauf in preHIP

1. preHIP lädt weiterhin sofort aus dem lokalen Cache.
2. Anmeldung über Supabase Auth per Magic Link.
3. Nach Login wird `app_state` aus Supabase geladen.
4. Änderungen werden lokal sofort gespeichert und anschließend automatisch in Supabase synchronisiert.
5. Beim ersten Login können die bisherigen lokalen Daten einmalig in die Cloud übernommen werden.
6. Nach Cache-Löschen oder Neuinstallation reicht eine erneute Anmeldung; die Trainingsdaten bleiben in Supabase erhalten.
