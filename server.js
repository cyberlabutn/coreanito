const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

// Crear o abrir la base de datos SQLite
const db = new sqlite3.Database('./tickets.db');

// Crear las tablas necesarias si no existen
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS tickets (
    number INTEGER PRIMARY KEY,
    name TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS counter (
    id INTEGER PRIMARY KEY,
    currentNumber INTEGER,
    nextTicketNumber INTEGER
  )`);

  // Inicializar el contador si no existe
  db.get(`SELECT * FROM counter WHERE id = 1`, (err, row) => {
    if (!row) {
      db.run(`INSERT INTO counter (id, currentNumber, nextTicketNumber) VALUES (1, 0, 1)`);
    }
  });
});

app.use(express.static('public'));
app.use(bodyParser.json());

// Ruta para servir el archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint para obtener un nuevo ticket
app.post('/getTicket', (req, res) => {
  const userName = req.body.name.trim();

  if (!userName) {
    return res.status(400).json({ error: 'Por favor, ingresa tu nombre.' });
  }

  db.serialize(() => {
    db.get(`SELECT nextTicketNumber FROM counter WHERE id = 1`, (err, row) => {
      const nextTicketNumber = row.nextTicketNumber;

      db.run(`INSERT INTO tickets (number, name) VALUES (?, ?)`, [nextTicketNumber, userName]);
      db.run(`UPDATE counter SET nextTicketNumber = ? WHERE id = 1`, nextTicketNumber + 1);

      res.json({ ticketNumber: nextTicketNumber });
    });
  });
});

// Endpoint para atender el siguiente ticket
app.post('/nextTicket', (req, res) => {
  db.serialize(() => {
    db.get(`SELECT currentNumber, nextTicketNumber FROM counter WHERE id = 1`, (err, row) => {
      let currentNumber = row.currentNumber;
      const nextTicketNumber = row.nextTicketNumber;

      if (currentNumber < nextTicketNumber - 1) {
        currentNumber++;
        db.run(`UPDATE counter SET currentNumber = ? WHERE id = 1`, currentNumber);

        db.get(`SELECT name FROM tickets WHERE number = ?`, [currentNumber], (err, ticketRow) => {
          const currentName = ticketRow ? ticketRow.name : '-';
          res.json({ currentNumber, currentName });
        });
      } else {
        res.status(400).json({ error: 'No hay más tickets en espera.' });
      }
    });
  });
});

// Endpoint para obtener el número y nombre actuales
app.get('/current', (req, res) => {
  db.serialize(() => {
    db.get(`SELECT currentNumber FROM counter WHERE id = 1`, (err, row) => {
      const currentNumber = row ? row.currentNumber : 0;

      db.get(`SELECT name FROM tickets WHERE number = ?`, [currentNumber], (err, ticketRow) => {
        const currentName = ticketRow ? ticketRow.name : '-';
        res.json({ currentNumber, currentName });
      });
    });
  });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
