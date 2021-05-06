const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(path.join(__dirname, '../db/development.sqlite3'));

function extractTodoObject(requestBody) {
  const todo = {};
  todo.title = requestBody['title'] || '';
  todo.day = requestBody['day'] || '';
  todo.month = requestBody['month'] || '';
  todo.year = requestBody['year'] || '';
  todo.completed = requestBody['completed'] || false;
  todo.description = requestBody['description'] || '';

  return todo;
}

function convertToTodoObject(requestBody) {
  console.log(requestBody);
}

function isValidTodo(todo) {
  return todo.title.length >= 3 && (todo.day.length === 2 || todo.day === '') && (todo.month.length === 2 || todo.month === '') && (todo.year.length === 4 || todo.year === '');
}

function createUpdateQuery(todoObj, id) {
  const attributesForUpdate = Object.keys(todoObj).filter(function(key) {
    return todoObj[key] !== '' && key !== 'completed';
  });

  const attributesForUpdateQuery = attributesForUpdate.map(function(key) {
    return `${key} = "${todoObj[key]}"`;
  });
  
  return `UPDATE TODOS SET ${attributesForUpdateQuery.join(', ')} WHERE id = ${id};`;
}

function mutateAllCompletedToBoolean(todos) {
  todos.forEach(mutateCompletedToBoolean);
}

function mutateCompletedToBoolean(todo) {
  if (!todo['completed'] || todo['completed'] === 'false') {
    todo['completed'] = false;
  } else {
    todo['completed'] = true;
  }
}

/**
 * @api {get} /todos Retreives all todos  
 * @apiGroup Todo
 * 
 * @apiSuccess {Object[]} todos                    List of todos.
 * @apiSuccess {Number}   todo.id                  ID of todo.
 * @apiSuccess {String}   todo.title               Title of todo.
 * @apiSuccess {String}   todo.day                 Day of todo.
 * @apiSuccess {String}   todo.month               Month of todo.
 * @apiSuccess {String}   todo.year                Mear of todo.
 * @apiSuccess {Boolean}  todo.completed           Completed status of todo.
 * @apiSuccess {String}   todo.description         Description of todo.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {'id': '1', 'title': 'todo1', 'day': '11', 'month': '11',
 *         'year': '2017', 'completed': 'true', 'description': 'Some Description'},
 *       {'id': '2', 'title': 'todo2', 'day': '', 'month': '',
 *         'year': '', 'completed': 'false', 'description': ''}
 *     ]
 * 
 */
router.get('/todos', function(req, res, next) {
  db.all('SELECT * FROM TODOS;', function(err, rows) {
    mutateAllCompletedToBoolean(rows);
    res.json(rows);
  });
});

/**
 * @api {get} /todos/:id Retreives todo with id = {id}
 * @apiGroup Todo
 * 
 * @apiParam {Number} id The id of the requested todo.
 *
 * @apiSuccess {Object}   todo                     Todo object.
 * @apiSuccess {Number}   todo.id                  ID of schedule.
 * @apiSuccess {String}   todo.title               Title of todo.
 * @apiSuccess {String}   todo.day                 Day of todo.
 * @apiSuccess {String}   todo.month               Month of todo.
 * @apiSuccess {String}   todo.year                Year of todo.
 * @apiSuccess {Boolean}  todo.completed           Completed status of todo.
 * @apiSuccess {String}   todo.description         Description of todo.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {'id': '1', 'title': 'todo 1', 'day': '11', 'month': '11', 'year': '2017', 'completed': 'true', 'description': 'sample todo'}
 *
 * @apiError (404) NoTodo When the todo with id = {id} cannot be found
 * @apiErrorExample {String} NoTodo Error-Response:
 *     HTTP/1.1 404 Not Found
 *     'The todo could not be found.'
 */
router.get('/todos/:id', function(req, res, next) {
  db.get(`SELECT * FROM TODOS WHERE id = ${req.params['id']}`, function(err, row) {
    if (row) {
      mutateCompletedToBoolean(row);
      res.json(row);
    } else {
      res.status(404).send('The todo could not be found.');
    }
  });
});

/**
 * @api {post} /todos Saves a new todo.
 * @apiDescription Request payload should be in json. Note that you will need the "Content-Type: application/json" header.
 * @apiGroup Todo
 * 
 * @apiParam {String}   title                 Title of todo. At least 3 characters long.
 * @apiParam {String}   [day]                 Format dd. saved if format is incorrect. Day of todo.
 * @apiParam {String}   [month]               Format mm. saved if format is incorrect. Month of todo.
 * @apiParam {String}   [year]                Format yyyy. Not saved if format is incorrect. Year of todo.
 * @apiParam {Boolean}  [completed]           Completed status of todo. Will default to false for a new todo.
 * @apiParam {String}   [description]         Description of todo.
 *
 * @apiParamExample {json} Request-Example (all params provided): 
 *     {'title': 'todo 1', 'day': '11', 'month': '11', 'year': '2017', 'completed': 'true', 'description': 'sample todo'}
 *
 * @apiParamExample {json} Request-Example (not all params provided): 
 *     {'title': 'todo 1', 'description': 'sample todo'}
 *
 * @apiSuccess (Success 201) {json} todo Returns the newly created todo with an id attribute. Empty strings are assigned to properties that were not provided parameter values.
 *
 * @apiSuccessExample {json} Success-Response (all params provided):
 *     HTTP/1.1 201 CREATED
 *     {'id': '1', 'title': 'todo 1', 'day': '11', 'month': '11', 'year': '2017', 'completed': 'true', 'description': 'sample todo'}
 *
 * @apiSuccessExample {json} Success-Response (not all params provided):
 *     HTTP/1.1 201 CREATED
 *     {'id': '1', 'title': 'todo 1', 'day': '', 'month': '', 'year': '', 'completed': 'false', 'description': 'sample todo'}
 * 
 * @apiError (400) InvalidInput When the todo cannot be saved (due to incorrect attrbiutes).
 * @apiErrorExample {String} InvalidInput Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     'Todo cannot be saved.'
 */
router.post('/todos', function(req, res, next) {
  const todoObj = extractTodoObject(req.body);

  if (isValidTodo(todoObj)) {
    const result = db.run('INSERT INTO TODOS (title, day, month, year, completed, description) VALUES ($title, $day, $month, $year, $completed, $description);', {
      $title: todoObj.title,
      $day: todoObj.day,
      $month: todoObj.month,
      $year: todoObj.year,
      $completed: todoObj.completed,
      $description: todoObj.description
    }, function(err) {
      db.get('SELECT * FROM TODOS WHERE id = $id', { $id: this.lastID },  function(err, row) {
        mutateCompletedToBoolean(row);
        res.status(201).json(row);
      });
    });
  } else {
    res.status(400).send('Todo cannot be saved.');    
  }
});

/**
 * @api {put} /todos/:id Updates a todo.
 * @apiDescription Uses key/value pairs to set the attributes of the todo. If the key/value pair is not present, its previous value is preserved. Note that the key/value pairs are in json and that you need the "Content-Type: application/json" header.
 * @apiGroup Todo
 * 
 * @apiParam {String}   [title]               Title of todo. At least 3 characters long.
 * @apiParam {String}   [day]                 Format dd. saved if format is incorrect. Day of todo.
 * @apiParam {String}   [month]               Format mm. saved if format is incorrect. Month of todo.
 * @apiParam {String}   [year]                Format yyyy. Not saved if format is incorrect. Year of todo.
 * @apiParam {Boolean}  [completed]           Completed status of todo.
 * @apiParam {String}   [description]         Description of todo.
 *
 * @apiSuccess (200) {json} todo Returns the updated todo.
 * @apiError (400) InvalidInput When the todo cannot be saved (due to incorrect attrbiutes) or todo with the given id does not exist.
 * @apiErrorExample {String} InvalidInput Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     'Todo cannot be saved.'
 *
 * @apiError (404) NoTodo When the todo with id = {id} cannot be found
 * @apiErrorExample {String} NoTodo Error-Response:
 *     HTTP/1.1 404 Not Found
 *     'The todo could not be found.'
 */
router.put('/todos/:id', function(req, res, next) {
  const id = req.params['id'];

  db.get('SELECT * FROM TODOS WHERE id = $id', { $id: id }, function(err, row) {
    if (row) {
      const todoObj = Object.assign(row, req.body);
      console.log(todoObj);

      if (isValidTodo(todoObj)) {
        const updateQuery = createUpdateQuery(todoObj, id);
        db.run(updateQuery, [], function(err) {
          if (Object.keys(req.body).includes('completed')) {
            db.run('UPDATE TODOS SET completed = $completed WHERE id = $id',  { $completed: req.body.completed, $id: id }, function(err, row) {
              db.get('SELECT * FROM TODOS WHERE id = $id', { $id: id }, function(err, row) {
                mutateCompletedToBoolean(row);
                res.status(200).json(row);
              });
            });
          } else {
            db.get('SELECT * FROM TODOS WHERE id = $id', { $id: id }, function(err, row) {
              mutateCompletedToBoolean(row);
              res.status(200).json(row);
            });
          }
        });
      } else {
        res.status(400).send('Todo cannot be updated.');        
      }
    } else {
      res.status(404).send('The todo could not be found.');
    }
  });
});

/**
 * @api {delete} /todos/:id Deletes a todo
 * @apiGroup Todo
 * 
 * @apiSuccessExample {String} Success-Response:
 *     HTTP/1.1 204 No Content
 *
 * @apiError (404) NoTodo When the todo with id = {id} cannot be found
 * @apiErrorExample {String} NoTodo Error-Response:
 *     HTTP/1.1 404 Not Found
 *     'The todo could not be found.'
 */
router.delete('/todos/:id', function(req, res, next) {
  const id = req.params['id'];
  db.get('SELECT * FROM TODOS where id = $id', { $id: id }, function(err, row) {
    if (row) {
      db.run('DELETE FROM TODOS where id = $id', { $id: id }, function(err) {
        res.sendStatus(204);
      });
    } else {
      res.status(404).send('The todo could not be found.');
    }
  });
});

/**
 * @api {get} /reset Resets the database.  
 * @apiGroup Todo
 *
 * @apiSuccessExample {String} Success-Response:
 *     HTTP/1.1 200 OK
 *     'Database reset successful!'
 */
router.get('/reset', function(req, res, next) {
  const sql = fs.readFileSync(path.join(__dirname, '../db/reset.sql')).toString();
  db.exec(sql, function(error){
    if (error) {
      res.status(500).send(error);
    }

    res.status(200).send('Database reset successful!');
  });
});

module.exports = router;
