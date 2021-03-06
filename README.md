# QuestionsAndAnswers
This repo consists of an API microservice that supports the questions and answers component of a large front-end e-commerce website.

# Overview
Builds a server and a database which supports the front-end e-commerce website, and is optimized to handle large datasets and heavy traffic.
To check out this project:

Start by cloning the repo into your computer in the terminal:

$git clone https://github.com/hr-rfe5-gladiolus/questions-answers.git

# Requirements
- Node.js v16
- Express
- Jest
- node-postgres
- PostgreSQL

# Installation
- npm install
- install postgres
- create apropirate user and create database
- vim ./server/database/index.js and change the username and password to connect to database
- psql -f ./server/database/schema.sql to run the schema file to create tables
