/* jshint esversion: 8 */
export class ToDoAPI {
  getAllTodos() {
    return fetch('http://localhost:3000/api/todos')
    .then(allContacts => allContacts.json());
  }

  getTodoByID(id) {
    return fetch(`http://localhost:3000/api/todos/${id}`)
    .then(response => response.json());
  }

  addTodo(jsonFormData) {
    return fetch('http://localhost:3000/api/todos',
      { method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: jsonFormData,
      })
    .then(response => {
      response.json();
    });
  }

  updateTodo(id, jsonFormData) {
    return fetch(`http://localhost:3000/api/todos/${id}`,
      { method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: jsonFormData
      })
    .then(response => response.json());
  }

  deleteTodo(id) {
    return fetch(`http://localhost:3000/api/todos/${id}`,
      {method: 'DELETE'}
    ).then(res => res)
    .catch(error => error);
  }
}
