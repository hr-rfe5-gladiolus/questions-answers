const postgres = require('pg').Pool

const db = new postgres({
  user: 'ubuntu',
  host: '54.173.141.82',
  database: 'questionsandanswers',
  port: 5432,
  password: 'password',
})

db.connect()






module.exports = db;
