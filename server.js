var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var PORT = process.env.PORT || 3000;
// todo is the model <- individual todo
// set of todos is a todo collection
// var todos = [
//   {
//     id: 1,
//     description: 'get hair cut',
//     completed: false
//   },
//   {
//     id: 2,
//     description: 'get a new phone',
//     completed: false
//   },
//   {
//     id: 3,
//     description: 'lose weight',
//     completed: false
//   }
// ];
var todos = [];
var todoNextId = 1;


app.use(bodyParser.json());



app.get('/', function(req, res) {
  res.send('todo api root');
});

// get all todos - GET /todos
app.get('/todos', function(req, res) {
  res.json(todos);
});

// get single todo - GET /todos/:id
app.get('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo;
  todos.forEach(function (todo) {
    console.log(typeof todo.id);
    if(todoId === todo.id) {
      matchedTodo = todo;
    }
  });
  if(matchedTodo) {
    res.json(matchedTodo);
  } else {
    res.status(404).send();
  }
});


// POST /todos
app.post('/todos', function(req, res) {
  var body = req.body;

  body.id = todoNextId;
  todos.push(body);
  todoNextId++;
  res.json(body);


});


app.listen(PORT, function() {
  console.log('express on port ' + PORT);
});
