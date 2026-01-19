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

## 🚀 Installation & Start (First Time Setup)

Voraussetzung: [Node.js](https://nodejs.org/) muss installiert sein.

### 1. Repository klonen
```bash
git clone <DEIN-REPO-URL>
cd feels-like-organic
```

### 2. Backend einrichten
Öffne ein Terminal und führe aus:

```bash
cd server
npm install
```
Erstelle im Ordner `server` eine Datei namens `.env` mit folgendem Inhalt:

```env
PORT=3000
JWT_SECRET=unser_geheimes_projekt_passwort
```

### 3. Frontend einrichten
Öffne ein neues Terminal (oder geh zurück) und führe aus:

```bash
cd client
npm install
```

---

## ▶️ Projekt starten
Um zu entwickeln, müssen Backend und Frontend gleichzeitig laufen. Am besten man nutzt dafür **zwei Terminals** in VS Code.

### Terminal 1: Backend starten

```bash
cd server
npm run dev
```
Kurz warten, bis "✅ SQLite Datenbank erfolgreich verbunden!" erscheint.

### Terminal 2: Frontend starten

```bash
cd client
npm run dev
```
Die App ist dann unter `http://localhost:5173` erreichbar. Die API läuft unter `http://localhost:3000`.

## 📂 Ordnerstruktur

- docs/: Projektdokumentation (Pflichtenheft, SDP, Architektur, ...).

- client/src/views/: Hier liegen die Seiten der App (Login, Dashboard).

- server/src/models/: Hier sind die Datenbank-Tabellen definiert (Athlet, Training).

- server/src/services/: Hier liegt die Geschäftslogik (Rankings, Statistiken).