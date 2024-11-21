const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

let currentNumber = 0; // Number currently being served
let nextTicketNumber = 1; // Next available ticket number
let ticketQueue = {}; // Map of ticket numbers to user names

app.use(express.static('public'));
app.use(bodyParser.json());

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint to get a new ticket
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

// Endpoint to serve the next ticket
app.post('/nextTicket', (req, res) => {
  if (currentNumber < nextTicketNumber - 1) {
    currentNumber++;
    const currentName = ticketQueue[currentNumber] || '-';
    res.json({ currentNumber, currentName });
  } else {
    res.status(400).json({ error: 'No hay más tickets en espera.' });
  }
});

// Endpoint to get the current number and name
app.get('/current', (req, res) => {
  const currentName = ticketQueue[currentNumber] || '-';
  res.json({ currentNumber, currentName });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
