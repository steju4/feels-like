const { connectDB, sequelize } = require('./config/db');
const express = require('express');
const cors = require('cors');
// Routen Importieren
const testRoutes = require('./routes/testRoutes');

require('dotenv').config();

// App initialisieren
const app = express();

// Middleware
app.use(cors());              // Erlaubt Zugriff vom Frontend
app.use(express.json());      // Erlaubt JSON im Request-Body

// Routen registrieren
app.use('/api', testRoutes);

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