// app.js

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var createError = require('http-errors');
var session = require('express-session');
require("./utils/filepath");
const schedule = require('node-schedule');
const axios=require("axios")
// console.log(url_pathname);
require("./helper/global")
var DatabaseClass = require('./config/db.config');
var indexRouter = require('./routes/index');
var productsRouter = require('./routes/routes');
var dotenv = require("dotenv").config();
var fs = require('fs');
var http = require('http');
var https = require('https');
var app = express();
const cors = require('cors');
const { log } = require('console');

app.use(cors({
  origin: 'url_pathname',
  credentials: true,
}));

// Session setup
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
  }
}));

// Serve static files
// app.use('/upload', express.static(path.join(__dirname, 'public/upload')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes setup
app.use('/', indexRouter);
app.use('/admin', productsRouter);

// Initialize the global Database instance
global.Database = new DatabaseClass();
global.Database.createConnection();

// Error handling
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});
schedule.scheduleJob('1 * * * *', async () => { 
  try {
    const response = await axios.get(`${url_pathname}admin/scheduler`);
    console.log('Scheduler route called successfully:', response.data);
  } catch (error) {
    console.error('Error calling route:', error.message);
  }
});




// SSL setup
// var options = {
//   key: fs.readFileSync(path.join(__dirname, 'ssl', 'private.key')),
//   cert: fs.readFileSync(path.join(__dirname, 'ssl', 'certificate.crt'))
// };

const PORT = process.env.PORT || 5559;
console.log(PORT);

try {
  // const server = http.createServer(app);
  // const server = https.createServer(app);
  app.listen(PORT, function () {
    console.log(`Server running at https://localhost:${PORT}`);
  });
} catch (error) {
  console.error('Error starting HTTPS server:', error);
}

module.exports = app;
