const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('./'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal error!');
});

app.use((req, res) => {
  res.status(404).send('Endpoint does not exist');
});

app.listen(port, () => {
  console.log(`Server running on: http://localhost:${port}`);
});