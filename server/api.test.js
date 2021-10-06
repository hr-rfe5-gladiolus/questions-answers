
request = require('supertest');
app = require('./index.js');

describe('GET /qa/questions', () => {
  test(`should get all questions for a specific product id`, async() => {
    const response = await request(app).get('/qa/questions/?product_id=1')
    expect(response.body.results).toBeInstanceOf(Array);
    expect(response.body.results.length).toBeGreaterThan(0);
  })
})

describe('GET /qa/questions/:question/answer', () => {
  test(`should get all answers for a specfic question_id`, async() => {
    const response = await request(app).get('/qa/questions/1/answers')
    expect(response.body.results).toBeInstanceOf(Array);
    expect(response.body.results.length).toBeGreaterThan(0);
  })
})

describe('POST /qa/questions', () => {
  test('should add a question for a given product', async() => {
    var body_param = {"body": "text", "name": "Username", "email": "email@email.com","product_id": 34}
    const response = await request(app).post('/qa/questions').send(body_param)
    expect(response.statusCode).toBe(201)
  })
})

describe('POST /qa/questions/:question_id/answers', () => {
  test('should add an answer for a given question', async() => {
    var body_param = {"body": "text", "name": "Username", "email": "email@email.com","photos": []}
    const response = await request(app).post('/qa/questions/61/answers').send(body_param)
    expect(response.statusCode).toBe(201)
  })
})

describe('PUT /qa/questions/:question_id/helpful', () => {
  test('should add 1 to the helpfulness of a question', async() => {
    const response = await request(app).put('/qa/questions/1/helpful')
    expect(response.statusCode).toBe(204)
  })
})

describe('PUT /qa/questions/:question_id/report', () => {
  test('should report a question', async() => {
    const response = await request(app).put('/qa/questions/125/report')
    expect(response.statusCode).toBe(204)
  })
})

describe('PUT /qa/answers/:answer_id/helpful', () => {
  test('should add 1 to the helpfulness of a answer', async() => {
    const response = await request(app).put('/qa/answers/1/helpful')
    expect(response.statusCode).toBe(204)
  })
})

describe('PUT /qa/answers/:answer_id/report', () => {
  test('should report a question', async() => {
    const response = await request(app).put('/qa/answers/127/report')
    expect(response.statusCode).toBe(204)
  })
})