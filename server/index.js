const express = require('express');
const db = require('../db')
const routes = require('./routes');

const app = express();

app.use(express.json())
const port = 3000;

routes(app);

// app.get('/' , (req, res) => {
//   res.json('Node.js, Express and postgres API')
// })


app.listen(port, () => {
  console.log(`server is listening to port ${port}`)
})

module.exports = app;