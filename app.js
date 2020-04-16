const express = require('express');
const path = require('path');

const dir = path.join(__dirname, '/dist');
const app = express();

app.use(express.static(dir));

app.get('*', (req, res) => {
  res.sendFile(dir + '/index.html');
});

app.listen(5000, () => {
  console.log('client running');
});