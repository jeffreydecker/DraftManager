// Setup
var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  db = require('./config/db'),
  port = process.env.PORT || 8080,
  mongoose = require('mongoose'),
  morgan = require('morgan');

// Connect to db
mongoose.connect(db.url);

// Config app
app.use(express.static(__dirname + '/public'));
app.use('/scripts', express.static(__dirname + '/node_modules/angular/'));
app.use('/scripts', express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use('/scripts', express.static(__dirname + '/node_modules/angular-route/'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());
app.use(require('./app/routes/')); // Use our routes index.js

// Default route for web app
app.get('*', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

// Listen
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
