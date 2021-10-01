const db = require('../db')

module.exports = (app) => {
  // get questions
  app.get('/qa/questions', (req,res) => {
    //console.log(req.query)
    var product_id = req.query.product_id
    var page = req.query.page || 1
    var count = req.query.count || 5
    // var test = `select * from questions where product_id = ${product_id} limit ${count * page}`
    // var q = 'select questions.id, questions.body, questions.asker_name, questions.reported, questions.helpful, json_object_agg(answers.id , \'\') as answers from questions JOIN answers on answers.question_id = questions.id where product_id = 1 group by questions.id;'

    // var a = `
    // select answers.id, answers.body, answers.date_written, answers.answerer_name, answers.helpful, array_agg(CASE WHEN answers_photos.url is NULL THEN NULL ELSE json_build_object('id', answers_photos.id, 'url', answers_photos.url) END) as photos from questions JOIN answers on answers.question_id= questions.id LEFT OUTER JOIN answers_photos on answers.id = answers_photos.answer_id where product_id = 1 group by answers.id;`

    // var new0 = `
    // with p as (
    // select answers.*, answers_photos.id as photo_id , answers_photos.url from answers left outer join answers_photos on answers.id = answers_photos.answer_id order by answers.id),
    // l as
    // (select p.id, case when p.photo_id is NULL THEN NULL ELSE json_build_object('id',p.photo_id, 'url', p.url)  END as photos from p),
    // k as
    // (select answers.question_id, l.id, answers.body, answers.date_written as date, answers.answerer_name, answers.helpful, COALESCE(array_agg(l.photos) filter (where l.photos is not null), '{}') as photos from l join answers on l.id = answers.id group by l.id, answers.body, answers.answerer_name, answers.date_written, answers.helpful, answers.question_id)

    // select questions.id as quesiton_id, questions.body as question_body, questions.date_written as question_date, questions.asker_name,questions.helpful as questions_helpfulness, questions.reported, json_object_agg(k.id, json_build_object('id',k.id,'body',k.body,'date', to_timestamp(k.date/1000),'answerer_name', k.answerer_name, 'helpfulness', k.helpful,'photos',k.photos)) as answers from questions left join k on questions.id = k.question_id where product_id = ${product_id} group by questions.id order by questions.id LIMIT 100 OFFSET ${(page-1) * count};
    //    `
    var new1 = `
    with p as (
    select answers.*, answers_photos.id as photo_id , answers_photos.url from answers left outer join answers_photos on answers.id = answers_photos.answer_id order by answers.id),
    l as
    (select p.id, case when p.photo_id is NULL THEN NULL ELSE json_build_object('id',p.photo_id, 'url', p.url)  END as photos from p),
    k as
    (select answers.question_id, l.id, answers.body, answers.date_written as date, answers.answerer_name, answers.helpful, COALESCE(array_agg(l.photos) filter (where l.photos is not null), '{}') as photos from l join answers on l.id = answers.id group by l.id, answers.body, answers.answerer_name, answers.date_written, answers.helpful, answers.question_id)

    select questions.id as question_id, questions.body as question_body, questions.date_written as question_date, questions.asker_name,questions.helpful as questions_helpfulness, questions.reported,json_object_agg(case when k.id is null then -1 else k.id end, json_build_object('id',k.id,'body',k.body,'date', to_timestamp(k.date/1000),'answerer_name', k.answerer_name, 'helpfulness', k.helpful,'photos',k.photos)) as answers from questions left join k on questions.id = k.question_id where product_id = ${product_id} group by questions.id order by questions.id LIMIT 100 OFFSET ${(page-1) * count};
    `

    // var new2 =
    // with p as (
    // select answers.*, answers_photos.id as photo_id , answers_photos.url from answers left outer join answers_photos on answers.id = answers_photos.answer_id order by answers.id),
    // l as
    // (select p.id, case when p.photo_id is NULL THEN NULL ELSE json_build_object('id',p.photo_id, 'url', p.url)  END as photos from p),
    // k as
    // (select answers.question_id, l.id, answers.body, answers.date_written as date, answers.answerer_name, answers.helpful, COALESCE(array_agg(l.photos) filter (where l.photos is not null), '{}') as photos from l join answers on l.id = answers.id group by l.id, answers.body, answers.answerer_name, answers.date_written, answers.helpful, answers.question_id)

    // select * from questions left join k on questions.id = k.question_id where product_id = ${product_id} group by questions.id order by questions.id LIMIT 100 OFFSET ${(page-1) * count};
    //
    db.query(new1, (err, result) => {
      if (err) {
        console.log(err)
      } else {
        for (var i =0; i < result.rows.length;i++){
          delete result.rows[i].answers[-1]
        }
        res.json(result.rows)
        }
      })
  })
  // get answers for a specific quesitons
  app.get('/qa/questions/:question_id/answers', (req,res) => {
    var question_id = req.params.question_id
    var page = req.query.page || 1
    var count = req.query.count || 5
    var a = `with p as (
      select answers.*, answers_photos.id as photo_id , answers_photos.url from answers left outer join answers_photos on answers.id = answers_photos.answer_id order by answers.id),
      l as
      (select p.id, case when p.photo_id is NULL THEN NULL ELSE json_build_object('id',p.photo_id, 'url', p.url)  END as photos from p),
      k as
      (select answers.question_id, l.id, answers.body, answers.date_written as date, answers.answerer_name, answers.helpful, COALESCE(array_agg(l.photos) filter (where l.photos is not null), '{}') as photos from l join answers on l.id = answers.id group by l.id, answers.body, answers.answerer_name, answers.date_written, answers.helpful, answers.question_id)

      select k.id as answer_id,k.body, k.date, k.answerer_name, k.helpful as helpfulness, k.photos from k where k.question_id = ${question_id} order by k.id LIMIT ${count} OFFSET ${(page - 1) * count};`

      db.query(a, (err,result) => {
        if (err){
          console.log(err)
        } else {
          res.json(result.rows)
        }
      })
    // console.log(req.params)
    // console.log(req.query)
  })
  // add question
  app.post('/qa/questions', (req,res) => {
    var body = req.body.body
    var name = req.body.name
    var email = req.body.email
    var product_id= req.body.product_id
    //console.log(body)
    //var test = `select setval('questions_id_seq', (select MAX(id) from questions)+1);`
    var q = `


    INSERT INTO questions(product_id, body, date_written, asker_name, asker_email, reported, helpful)
    VALUES (${product_id}, '${body}', ${Date.now()}, '${name}', '${email}', false, 0)
    RETURNING id;
    `
    db.query(q, (err, result) => {
      if (err) {
        console.log(err)
      } else {
        console.log(result.rows.id)
        res.sendStatus(201)
      }
    })
    // console.log(Date.now())
    // console.log(req.body)
  })
  // add answer to a specific question
  app.post('/qa/questions/:question_id/answer', (req, res) => {
    var question_id = req.params.question_id
    var body = req.body.body
    var name = req.body.name
    var email = req.body.email
    var photos = req.body.photos
    var a = `
    INSERT INTO answers (question_id,body,date_written,answerer_name,answerer_email,reported,helpful)
    VALUES(${question_id}, '${body}', ${Date.now()}, '${name}', '${email}',false,0)
    RETURNING id;
    `
    db.query(a)
    .then(results => {
      //console.log(results.rows[0].id)
      if (photos.length !== 0) {
      var pho = ' VALUES'
      for (var i =0; i< photos.length;i++){
        if(i ===  photos.length-1){
          pho += `(${results.rows[0].id}, '${photos[i]}')`
        } else {
          pho += `(${results.rows[0].id}, '${photos[i]}'),`
        }
      }
      var p = `
      INSERT INTO answers_photos(answer_id,url)` + pho
      db.query(p)
      .then(res.sendStatus(201))
      .catch(err => {
        console.log('photo err')
      })
    } else {
      res.sendStatus(201)
    }
    })
    .catch(err => {
      console.log(err)
    })
    //console.log(req.params.question_id)
    //console.log(req.body.photos)
  })
  // mark question as helpful
  app.put('/qa/questions/:question_id/helpful', (req,res) => {
    console.log(req.params)
  })
  //report question
  app.put('/qa/questions/:question_id/report', (req,res) => {
    console.log(req.params)
  })
  // mark answer as helpful
  app.put('/qa/answer/:answer_id/helpful', (req, res) => {
    console.log(req.params)
  })
  // report answer
  app.put('/qa/answer/:answer_id/report', (req, res) => {
    console.log(req.params)
  })

}
