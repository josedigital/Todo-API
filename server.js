var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

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
  var query = req.query;
  var where = {};

  if (query.hasOwnProperty('completed') && query.completed === 'true') {
    where.completed = true;
  } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
    where.completed = false;
  }

  if (query.hasOwnProperty('q') && query.q.length > 0) {
    where.description = {
      $like: '%' + query.q + '%'
    }
  }

  db.todo.findAll({where: where}).then(function (todos) {
    res.json(todos);
  }, function (e) {
    res.status(500).send;
  });

  // var filteredTodos = todos;
  //
  //
  // if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
  //   filteredTodos = _.where(filteredTodos, {completed: true});
  // } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
  //   filteredTodos = _.where(filteredTodos, {completed: false});
  // }
  //
  // if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
  //   filteredTodos = _.filter(filteredTodos, function(todo) {
  //     return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
  //   });
  // }
  //
  //
  // res.json(filteredTodos);
});



// get single todo - GET /todos/:id
// app.get('/todos/:id', function(req, res) {
//   var todoId = parseInt(req.params.id, 10);
//   var matchedTodo;
//   todos.forEach(function (todo) {
//     console.log(typeof todo.id);
//     if(todoId === todo.id) {
//       matchedTodo = todo;
//     }
//   });
//   if(matchedTodo) {
//     res.json(matchedTodo);
//   } else {
//     res.status(404).send();
//   }
// });
//
// doing the same as above but using underscore
// get single todo - GET /todos/:id
app.get('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id, 10);
  db.todo.findById(todoId).then(function (todo) {
    if(!!todo) {
      res.json(todo.toJSON());
    } else {
      res.status(404).send();
    }
  }, function () {
    res.status(500).send();
  });
  // var matchedTodo = _.findWhere(todos, {id: todoId});
  //
  // if(matchedTodo) {
  //   res.json(matchedTodo);
  // } else {
  //   res.status(404).send();
  // }

});


// POST /todos
app.post('/todos', function(req, res) {
  var body = _.pick(req.body, 'description', 'completed');

  db.todo.create(body).then(function (todo) {
    res.json(todo.toJSON());
  }, function (e) {
    res.status(400).json(e);
  });

  // if( !_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0 ) {
  //   return res.status(404).send();
  // }
  //
  // body.description = body.description.trim();
  // body.id = todoNextId;
  // todos.push(body);
  // todoNextId++;
  // res.json(body);


});



// DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id, 20);

  db.todo.destroy({
    where: {
      id: todoId
    }
  }).then(function (rowsDeleted) {
    if(rowsDeleted === 0) {
      res.json({error: 'no todo with that id'});
    } else {
      res.status(204).send();
    }
  }, function () {
    res.status(500).send();
  });
  // var matchedTodo = _.findWhere(todos, {id: todoId});
  //
  // if(!matchedTodo) {
  //   res.status(404).json({"error": "nothing found with that id"});
  // } else {
  //   todos = _.without(todos, matchedTodo);
  //   res.json(matchedTodo);
  // }

});




// PUT /todos/:id
app.put('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id, 20);
  var body = _.pick(req.body, 'description', 'completed');
  var attributes = {};


  if (body.hasOwnProperty('completed')) {
    attributes.completed = body.completed;
  }

  if (body.hasOwnProperty('description')) {
    attributes.description = body.description;
  }


  // this is what is happening here:
  // the first promise is to check that everything went right with findById. (2 promises)
  // the second promise is a follow-up to todo.update
  db.todo.findById(todoId).then(function (todo) {
    if (todo) {
      todo.update(attributes).then(function (todo) {
        res.json(todo.toJSON());
      }, function (e) {
        res.status(400).json(e);
      });
    } else {
      res.status(404).send();
    }
  }, function () {
    res.status(500).send();
  });


  // var validAttributes = {};
  // var todoId = parseInt(req.params.id, 20);

  // var matchedTodo = _.findWhere(todos, {id: todoId});
  //
  // if(!matchedTodo) {
  //   return res.status(404).send();
  // }

  // if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
  //   validAttributes.completed = body.completed;
  // } else if (body.hasOwnProperty('completed')) {
  //   // not valid
  //   return res.status(400).send();
  // }
  //
  // if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.length > 0) {
  //   validAttributes.description = body.description;
  // } else if(body.hasOwnProperty('description')) {
  //   return res.status(400).send();
  // }
  //
  // _.extend(matchedTodo, validAttributes);
  // res.json(matchedTodo);



});


db.sequelize.sync({}).then(function () {
  app.listen(PORT, function () {
    console.log('express on port ' + PORT);
  });
});
