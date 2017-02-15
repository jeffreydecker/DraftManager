// Setup
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

// Config
mongoose.connect('mongodb://shoeless-app:barefeet@ds145359.mlab.com:45359/shoeless-db');

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

// Data models
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("db connected");
});

var Schema = mongoose.Schema;

var todoSchema = new Schema({
  text : String
});

var Todo = mongoose.model('Todo', todoSchema);

// API
 /*
 Fetch all todos
 */
app.get('/api/todos', function(req, res) {
  Todo.find(function(err, todos) {
    if (err) res.send(err);
    console.log("Todos: " + todos);
    res.json(todos);
  });
});

/*
Add a new todo
*/
app.post('/api/todos', function(req, res) {
  Todo.create({
    text : req.body.text,
    done : false
  }, function(err, todo) {
    if (err) res.send(err);
    Todo.find(function(res, todos) {
      if (err) res.send(err);
      res.json(todos);
    });
  });
});

/*
Delete a todo
*/
app.delete('/api/todos/:todo_id', function(req, res) {
  Todo.remove({
    _id : req.params.todo_id
  }, function(err, todo) {
    if (err) res.send(err);
    Todo.find(function(res, todos) {
      if (err) res.send(err);
      res.json(todos);
    });
  });
});

// Listen
app.listen(8080);
console.log("Listening on 8080");
