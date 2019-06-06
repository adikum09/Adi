// @ts-check
const express = require('express');
const path = require('path');
const router = require('./routes');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router);

// catch error and render home page
app.use(function (req, res, next) {
  res.redirect('/');
});

module.exports = app;