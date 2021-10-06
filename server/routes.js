const db = require('../db')

module.exports = (app) => {
  // get questions
  app.get('/qa/questions', (req,res) => {
    var product_id = req.query.product_id
    var page = req.query.page || 1
    var count = req.query.count || 5

    var new1 = `
    with p as (
    select answers.*, answers_photos.id as photo_id , answers_photos.url from answers left outer join answers_photos on answers.id = answers_photos.answer_id order by answers.id),
    l as
    (select p.id, case when p.photo_id is NULL THEN NULL ELSE json_build_object('id',p.photo_id, 'url', p.url)  END as photos from p),
    k as
    (select answers.question_id, l.id, answers.body, answers.date_written as date, answers.answerer_name, answers.helpful, COALESCE(array_agg(l.photos) filter (where l.photos is not null), '{}') as photos from l join answers on l.id = answers.id where answers.reported = false group by l.id, answers.body, answers.answerer_name, answers.date_written, answers.helpful, answers.question_id)

    select questions.id as question_id, questions.body as question_body, questions.date_written as question_date, questions.asker_name,questions.helpful as questions_helpfulness, questions.reported,json_object_agg(case when k.id is null then -1 else k.id end, json_build_object('id',k.id,'body',k.body,'date', to_timestamp(k.date/1000),'answerer_name', k.answerer_name, 'helpfulness', k.helpful,'photos',k.photos)) as answers from questions left join k on questions.id = k.question_id where product_id = ${product_id} and reported = false group by questions.id order by questions.id LIMIT 100 OFFSET ${(page-1) * count};
    `
      // get all the questions
      // p does gets the question id and answers id from a joint table of answer and questions on the ids where product id = pased in element
      // l does gets the answers id from p and if photo id is null then nothing other wise builds and object photos from
      // joint table of photos and p keeping p stuff
      // k does gets the answers id from l and aggs the photos but if it is null then it becomes an emmpty {} from l
      var newest = `
      with p as (
        select questions.id as questions_id, answers.id as answers_id from answers left outer join questions on answers.question_id = questions.id where questions.product_id = ${product_id}
      ),
      l as (
        select p.answers_id, case when answers_photos.id is NULL THEN NULL ELSE json_build_object('id',answers_photos.id, 'url', answers_photos.url)  END as photos from answers_photos right outer join p on p.answers_id = answers_photos.answer_id),
      k as (
          select l.answers_id  , COALESCE(array_agg(l.photos) filter (where l.photos is not null), '{}') as photos from l group by l.answers_id
        ),
      m as (
        select answers.question_id , k.answers_id, json_build_object('id', k.answers_id, 'body', answers.body, 'date', to_timestamp(answers.date_written/1000), 'answerer_name', answers.answerer_name,'helpfulness', answers.helpful, 'photos',k.photos) as answer from k join answers on k.answers_id = answers.id where answers.reported = false
        ),
      n as (
        select m.question_id, json_object_agg(m.answers_id, m.answer) as answers from m group by m.question_id
      ),
      b as (
        select questions.id as question_id, questions.body as question_body, to_timestamp(questions.date_written/1000) as question_date, questions.asker_name, questions.helpful as question_helpfulness, questions.reported, COALESCE(n.answers , '{}') as answers from n right outer join questions on n.question_id = questions.id where questions.reported = false and questions.product_id = ${product_id} order by questions.id
      )

      select * from b Limit ${count} OFFSET ${(page - 1) * count};
      `

    db.query(newest, (err,result) => {
      if (err){
        console.log(err)
      } else {
      var questions = {}
      questions['product_id'] = product_id;
      questions['page'] = page;
      questions['count'] = count
      questions['results'] = result.rows
      res.json(questions)
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
      (select answers.question_id, l.id, answers.body, answers.date_written as date, answers.answerer_name, answers.helpful, COALESCE(array_agg(l.photos) filter (where l.photos is not null), '{}') as photos from l join answers on l.id = answers.id where answers.reported = false group by l.id, answers.body, answers.answerer_name, answers.date_written, answers.helpful, answers.question_id)

      select k.id as answer_id,k.body, k.date, k.answerer_name, k.helpful as helpfulness, k.photos from k where k.question_id = ${question_id} order by k.id LIMIT ${count} OFFSET ${(page - 1) * count};`

      var b = `with p as (
        select answers.*, answers_photos.id as photo_id , answers_photos.url from answers left outer join answers_photos on answers.id = answers_photos.answer_id order by answers.id),
        l as
        (select p.id, case when p.photo_id is NULL THEN NULL ELSE json_build_object('id',p.photo_id, 'url', p.url)  END as photos from p),
        k as
        (select answers.id, COALESCE(array_agg(l.photos) filter (where l.photos is not null), '{}') as photos from l join answers on l.id = answers.id where answers.reported = false group by answers.id)
        select * from k;
        `
      // get all the answers that match question id
      // get all teh photos that match answer id create objects of the photos
      // join answers with photos
      // agg photos
      // join with quesitons
      var c = `with p as (
        select * from answers where answers.question_id = ${question_id}
      ),
      l as (
        select p.id ,case when answers_photos.id is NULL THEN NULL ELSE json_build_object('id', answers_photos.id, 'url', answers_photos.url) end as photos from p left outer join answers_photos on p.id = answers_photos.answer_id
      ),
      k as (
        select l.id , COALESCE(array_agg(l.photos) filter (where l.photos is not null), '{}') as photos from l group by l.id
      ),
      m as (
        select k.id, answers.body, to_timestamp(answers.date_written/1000) as date , answers.answerer_name, answers.helpful as helpfulness, k.photos from k join answers on k.id = answers.id where answers.reported = false
      )
      select * from m`

      db.query(c, (err,result) => {
        if (err){
          console.log(err)
        } else {
          var answers = {}
          answers['question'] = question_id
          answers['page'] = page
          answers['count'] = count
          answers['results'] = result.rows
          res.json(answers)
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
        res.sendStatus(201)
      }
    })
    // console.log(Date.now())
    // console.log(req.body)
  })
  // add answer to a specific question
  app.post('/qa/questions/:question_id/answers', (req, res) => {
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
        console.log('photo err' )
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
    var query = `update questions set helpful = helpful + 1 where id = ${req.params.question_id}`
    db.query(query)
    .then(res.sendStatus(204))
    .catch(err => {
      console.log(err)
    })
  })
  //report question
  app.put('/qa/questions/:question_id/report', (req,res) => {
    var query = `update questions set reported = true where id = ${req.params.question_id}`
    db.query(query)
    .then(res.sendStatus(204))
    .catch(err => {
      console.log(err)
    })
  })
  // mark answer as helpful
  app.put('/qa/answers/:answer_id/helpful', (req, res) => {
    var query = `update answers set helpful = helpful + 1 where id = ${req.params.answer_id}`
    db.query(query)
    .then(res.sendStatus(204))
    .catch(err => {
      console.log(err)
    })
  })
  // report answer
  app.put('/qa/answers/:answer_id/report', (req, res) => {
    var query = `update answers set reported = true where id = ${req.params.answer_id}`
    db.query(query)
    .then(res.sendStatus(204))
    .catch(err => {
      console.log(err)
    })
  })
}


//Create Index answerphotoid on answers_photos(answer_id DESC);
//Create Index questionId on answers(question_id DESC);



