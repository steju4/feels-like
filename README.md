# Feels Like Organic

Trainingsverwaltung mit React-Frontend und Node.js-Backend

---

## Kurzüberblick

| Bereich | Stack |
|---|---|
| Frontend | React, Vite |
| Backend | Node.js, Express |
| Datenbank | SQLite, Sequelize |

## Inhalt

1. [Projekt und Architektur](#projekt-und-architektur)
2. [Team](#team)
3. [Voraussetzungen](#voraussetzungen)
4. [Schnellstart](#schnellstart)
5. [Setup und Start im Detail](#setup-und-start-im-detail)
6. [Starten der Anwendung](#starten-der-anwendung)
7. [Custom NPM Scripts](#custom-npm-scripts)
8. [Tests und QA](#tests-und-qa)
9. [Seed-Accounts](#seed-accounts)
10. [Ordnerstruktur](#ordnerstruktur)

---

## Projekt und Architektur

Das Projekt ist als klassische 3-Schichten-Architektur aufgebaut:

| Schicht | Technologie | Ort |
|---|---|---|
| Frontend | React + Vite | client |
| Backend | Node.js + Express | server |
| Persistenz | SQLite + Sequelize | server/database.sqlite |

> **Wichtig:**
> Die lokale Datenbank wird beim Seeding neu erzeugt. Bestehende Daten gehen dabei verloren.

---

## Team

| Name | Rolle/Funktion |
|---|---|
| Julian Stengele | Scrum Master, Development Team |
| Atussa Mehrawari | Product Owner, Development Team |
| Isabella Schwarz | Developer, Development Team |
| Sophie Lazarjan | Developer, Development Team |
| Joey Stöckle | Developer, Development Team |

> **Hinweis:**
> Joey Stöckle wird in der Projektdokumentation weiterhin als Teammitglied geführt. Im Projektverlauf wurde die Teamgröße jedoch von 5 auf 4 reduziert, daher war er in der späteren Umsetzungsphase nicht mehr als aktives Kernteammitglied eingeplant und aktiv beteiligt.

---

## Voraussetzungen

### Getestete lokale Versionen

| Tool | Version |
|---|---|
| Node.js | v22.14.0 |
| npm | 10.9.2 |

### Empfehlung

- Node.js LTS (mindestens 20.x)
- npm ab 10.x

Versionen prüfen:

```bash
node -v
npm -v
```

---

## Schnellstart

```bash
cd feels-like
npm run install-all
npm run seed
npm run dev
```

Danach erreichbar unter:

- Frontend: http://localhost:5173
- API: http://localhost:3000

---

## Setup und Start im Detail

### 1) In Projektordner wechseln

```bash
cd feels-like
```

### 2) Dependencies installieren

Empfohlen:

```bash
npm run install-all
```

Manuell (falls gewünscht):

```bash
npm install
cd client && npm install
cd ../server && npm install
```

### 3) Environment konfigurieren (.env)

Datei `server/.env` auf Basis von `server/.env.example` erstellen

Windows (PowerShell):

```powershell
Copy-Item server/.env.example server/.env
```

macOS/Linux:

```bash
cp server/.env.example server/.env
```

### 4) Minimale .env für lokale Entwicklung

```env
PORT=3000
JWT_SECRET=bitte_einen_langen_zufaelligen_wert_setzen
DB_LOGGING=false
APP_BASE_URL=http://localhost:5173
MAIL_MODE=auto
```

### 5) Wichtige .env Variablen

| Variable | Zweck | Beispiel |
|---|---|---|
| PORT | Backend-Port | 3000 |
| JWT_SECRET | Signierung von JWTs | sehr-langer-zufallswert |
| APP_BASE_URL | Basis-URL für Einladungs-/Reset-Links | http://localhost:5173 |
| MAIL_MODE | Mailmodus: auto, smtp, ethereal, console | auto |
| DB_LOGGING | Sequelize SQL-Logging | false |

Weitere optionale Variablen (z. B. SMTP-Details, Passwort-Reset-TTL) stehen in `server/.env.example`


>`MAIL_MODE` kurz erklärt:
>- auto: SMTP wenn vollständig konfiguriert, sonst Ethereal, sonst Konsole
>- smtp: echter SMTP-Versand
>- ethereal: Testversand mit Preview-Link
>- console: Link nur in der Konsole

### 6) Testdaten einspielen

```bash
npm run seed
```

Wichtig:
Der Seed führt im Backend sequelize.sync({ force: true }) aus und setzt die Datenbank zurück

---

## Starten der Anwendung

### Alles in einem Terminal

```bash
npm run dev
```

### Getrennte Terminals

Terminal 1:

```bash
npm run dev:server
```

Terminal 2:

```bash
npm run dev:client
```

---

## Custom NPM Scripts

### Root

| Befehl | Beschreibung |
|---|---|
| npm run install-all | installiert Root + client + server Dependencies |
| npm run seed | führt server seed aus |
| npm run dev | startet client und server parallel |
| npm run dev:server | startet nur server im Dev-Modus |
| npm run dev:client | startet nur client im Dev-Modus |
| npm run build | baut client |
| npm run build:client | baut client (alias) |
| npm run lint | lint client + server |
| npm run lint:client | lint nur client |
| npm run lint:server | lint nur server |
| npm run test | führt server Tests aus |
| npm run qa | lint + test |
| npm run qa:release | qa + build |

### Server

| Befehl | Beschreibung |
|---|---|
| npm run dev --prefix server | startet server mit nodemon |
| npm run start --prefix server | startet server ohne nodemon |
| npm run seed --prefix server | führt Seed direkt aus |
| npm run lint --prefix server | lint server + tests |
| npm run test --prefix server | alle Jest Tests |
| npm run test:watch --prefix server | Jest Watch Mode |
| npm run test:coverage --prefix server | Jest Coverage |

### Client

| Befehl | Beschreibung |
|---|---|
| npm run dev --prefix client | startet Vite Dev Server |
| npm run build --prefix client | erstellt Build |
| npm run preview --prefix client | zeigt Build lokal an |
| npm run lint --prefix client | lint client |

---

## Tests und QA

Schnellprüfung:

```bash
npm run qa
```

Nur Tests:

```bash
npm run test
```

Coverage:

```bash
npm run test:coverage --prefix server
```

---

## Seed-Accounts

Nach npm run seed sind folgende Accounts vorhanden:

| Name | E-Mail | Passwort | Rolle | Status |
|---|---|---|---|---|
| Julian Stengele | julian@test.de | 123456 | trainer | aktiv |
| Isabella Schwarz | isabella@test.de | geheim | athlet | aktiv |
| Sophie Lazarjan | sophie@test.de | geheim | athlet | aktiv |
| Atussa Mehrawari | atussa@test.de | geheim | athlet | aktiv |
| Joey Stoeckle | joey@test.de | geheim | athlet | aktiv |
| Simon Zweigler | simon@test.de | geheim | athlet | aktiv |
| Lena Berg | lena@test.de | geheim | athlet | aktiv |
| Max Kramer | max@test.de | geheim | athlet | aktiv |
| Nina Vollmer | nina@test.de | geheim | athlet | inaktiv |
| Fabio Neumann | fabio@test.de | geheim | athlet | aktiv |

Hinweis:
Seed-Daten sind nur für lokale Entwicklung/Tests gedacht

---

## Ordnerstruktur

| Pfad | Inhalt |
|---|---|
| docs | Projektdokumentation |
| client | Frontend |
| server | Backend |
| server/src/models | Sequelize Modelle |
| server/src/services | Geschäftslogik |
| server/src/controllers | API-Controller |
| server/src/routes | API-Routen |