# Feels Like Organic 🌿 - Trainingsverwaltung

Dies ist das Repo für die Webanwendung "Feels Like". 
Das Projekt besteht aus einem React-Frontend und einem Node.js-Backend.

## 🏗 Architektur & Tech-Stack

Wir folgen einer **3-Schichten-Architektur**:
1.  **Frontend:** React (Vite) - *Ordner: `/client`*
2.  **Backend:** Node.js (Express) - *Ordner: `/server`*
3.  **Datenbank:** SQLite (via Sequelize) - *Lokal als Datei*

> **Hinweis zur Datenbank:** > Wir nutzen für die Entwicklung **SQLite**.
> Die Datenbank ist einfach eine Datei (`server/database.sqlite`), die beim Start automatisch erstellt wird.

---

## 🚀 Installation & Start (Optimiert)

Wir haben Skripte im Hauptordner eingerichtet, damit man nicht ständig ordner wechseln muss.

### 1. Repository klonen & Installieren
```bash
git clone <DEIN-REPO-URL>
cd feels-like-organic

# Dieser Befehl installiert ALLES (Root, Client und Server Dependencies)
npm run install-all
```

### 2. Environment Variablen (WICHTIG!)
Im Ordner `server` liegt eine Datei namens `.env.example`.
1.  Benenne diese um in `.env` (oder kopiere sie).
2.  Passe ggf. das `JWT_SECRET` an.

**Hinweis:** Die `.env` Datei wird **nicht** ins Git hochgeladen (Sicherheit!), daher muss jeder Entwickler seine eigene erstellen.

### 3. Datenbank vorbereiten
Um Testdaten zu haben (inkl. 1 Trainer-Account und 3 Athleten), führe aus:

```bash
npm run seed
```

---

## ▶️ Projekt starten
Du hast zwei Möglichkeiten:

### Option A: Der "All-in-One" Modus (Empfohlen) 👍
Startet Backend und Frontend gleichzeitig in einem Terminal.

```bash
npm run dev
```
Nutze `STRG + C` um beide Server zu stoppen.

### Option B: Manuell (Getrennte Terminals)
Falls du die Logs getrennt sehen willst:

**Terminal 1:** `npm run dev:server`  
**Terminal 2:** `npm run dev:client`

---

## 🏗 Architektur & Tech-Stack
Die App ist dann unter `http://localhost:5173` erreichbar. Die API läuft unter `http://localhost:3000`.

---

## 🤝 Entwickler-Workflow (WICHTIG!)

Damit wir uns nicht gegenseitig stören und Merge-Konflikte vermeiden, gelten folgende Regeln:

### 1. 🛡️ Schutz des `dev` Branch
Niemand pusht direkt auf `main` oder `dev`! Diese Branches müssen immer stabil sein.

### 2. 🌱 Neue Features entwickeln (Feature Branches)
Erstelle für JEDE Aufgabe einen neuen Branch:

```bash
# Zuerst aktualisieren
git checkout dev
git pull

# Neuer Branch für dein Feature (Namensschema: type/name)
# Beispiele: feature/login-page, fix/dashboard-css, docs/update-readme
git checkout -b feature/mein-neues-feature
```

### 3. 💾 Speichern & Hochladen

```bash
git add .
git commit -m "Kurze Beschreibung was gemacht wurde"
git push origin feature/mein-neues-feature
```

### 4. 👀 Pull Request (PR) & Code Review
1. Gehe auf GitHub.
2. Erstelle einen **Pull Request** von deinem Branch auf `dev`.
3. Weise einem Teammitglied den PR als **Reviewer** zu.
4. **Merge erst, wenn das Review approved wurde!**

---

## 📂 Ordnerstruktur

- docs/: Projektdokumentation (Pflichtenheft, SDP, Architektur, ...).

- client/src/views/: Hier liegen die Seiten der App (Login, Dashboard).

- server/src/models/: Hier sind die Datenbank-Tabellen definiert (Athlet, Training).

- server/src/services/: Hier liegt die Geschäftslogik (Rankings, Statistiken).