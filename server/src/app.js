require('dotenv').config();

const { connectDB, sequelize } = require('./config/db');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Modelle laden
require('./models/index');

// Routen Importieren
const authRoutes = require('./routes/authRoutes');
const trainingRoutes = require('./routes/trainingRoutes');
const rankingRoutes = require('./routes/rankingRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
// Für Cookies: origin genau definieren, credentials: true
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true 
}));
app.use(express.json());      // Erlaubt JSON im Request-Body
app.use(cookieParser());      // Erlaubt Lesen von Cookies

// Routen registrieren
app.use('/api/auth', authRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/users', userRoutes);

// Health-Check für API
app.get('/api', (req, res) => {
  res.json({ message: 'API is running' });
});

// Test-Root
app.get('/', (req, res) => {
  res.send('API läuft!');
});

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  
  sequelize.sync().then(() => {
    console.log('✅ Tabellen sind synchronisiert');
    app.listen(PORT, () => {
      console.log(`🚀 Server läuft auf Port ${PORT}`);
    });
  });

});