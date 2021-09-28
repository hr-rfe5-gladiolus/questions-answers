DROP DATABASE IF EXISTS questionsandanswers;
CREATE DATABASE questionsandanswers;

\c questionsandanswers;

DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS answers;
DROP TABLE IF EXISTS answers_photos;

-- USE QuestionsAndAnswers;



CREATE TABLE questions(
  id SERIAL NOT NULL ,
  product_id INT NOT NULL,
  body VARCHAR NOT NULL ,
  date_written BIGINT NOT NULL,
  asker_name VARCHAR NOT NULL,
  asker_email VARCHAR NOT NULL,
  reported BOOLEAN NOT NULL,
  helpful INT NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE answers(
  id SERIAL NOT NULL,
  question_id INT NOT NULL,
  body VARCHAR NOT NULL,
  date_written BIGINT NOT NULL,
  answerer_name VARCHAR NOT NULL,
  answerer_email VARCHAR NOT NULL,
  reported BOOLEAN NOT NULL,
  helpful INT NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE answers_photos(
  id SERIAL NOT NULL,
  answer_id INT NOT NULL,
  url VARCHAR NOT NULL,
  PRIMARY KEY (id)
);

COPY questions (id, product_id, body, date_written, asker_name, asker_email, reported, helpful)
FROM '/home/james/Desktop/RFE/questions-answers/questions.csv'
DELIMITER ','
CSV HEADER;

copy answers (id, question_id, body, date_written, answerer_name, answerer_email, reported, helpful)
FROM '/home/james/Desktop/RFE/questions-answers/answers.csv'
DELIMITER ','
CSV HEADER;


COPY answers_photos(id, answer_id, url)
FROM '/home/james/Desktop/RFE/questions-answers/answers_photos.csv'
DELIMITER ','
CSV HEADER;