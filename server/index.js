const express = require('express');
const db = require('../db')
const routes = require('./routes');

const app = express();

app.use(express.json())
const port = 3000;

routes(app);

app.get('/' , (req, res) => {
   res.json('Node.js, Express and postgres API')
 })

app.use('/loaderio-b000007aa98c182f872fd60f26624501.txt', express.static(__dirname + '/token.txt'))


app.listen(port, () => {
  console.log(`server is listening to port ${port}`)
})
