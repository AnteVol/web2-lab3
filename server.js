const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Serviranje statičkih datoteka
app.use(express.static('./'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Nešto je pošlo po krivu!');
});

// Handle 404
app.use((req, res) => {
  res.status(404).send('Stranica nije pronađena');
});

app.listen(port, () => {
  console.log(`Server je pokrenut na http://localhost:${port}`);
});