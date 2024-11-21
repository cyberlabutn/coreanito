const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

let currentNumber = 0;
let nextTicketNumber = 1;
let ticketQueue = {};

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
    return res.status(400).json({ error: 'Name is required' });
  }

  ticketQueue[nextTicketNumber] = userName;
  const ticketNumber = nextTicketNumber;
  nextTicketNumber++;

  res.json({ ticketNumber });
});

// Endpoint para atender el siguiente ticket
app.post('/nextTicket', (req, res) => {
  if (currentNumber < nextTicketNumber - 1) {
    currentNumber++;
    const currentName = ticketQueue[currentNumber] || '-';
    res.json({ currentNumber, currentName });
  } else {
    res.status(400).json({ error: 'No hay más tickets en espera.' });
  }
});

// Endpoint para obtener el número y nombre actuales
app.get('/current', (req, res) => {
  const currentName = ticketQueue[currentNumber] || '-';
  res.json({ currentNumber, currentName });
});

module.exports = app;
