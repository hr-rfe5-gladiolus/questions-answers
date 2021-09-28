const postgres = require('pg').Pool

const db = new postgres({
  user: 'james',
  host: 'localhost',
  database: 'questionsandanswers',
  port: 5432,
  password: 'password',
})

db.connect()

module.exports = db;