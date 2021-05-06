/* jshint esversion: 8 */
export class DataConverter {
  constructor() {
    this.listSorter = new ListSortingUtility();
  }

  formatMainTemplateData(allTodosArray, targetList, dueDate, selectDone) {
    const done = this.getCompletedTodos(allTodosArray),
        todos_by_date = this.getTodosByDate(allTodosArray),
        done_todos_by_date = this.getCompletedTodosByDate(done),
        current_section = this.getSectionTitleInfo(allTodosArray, targetList),
        selected = this.filterTodosByDate(allTodosArray, dueDate, selectDone);

      return {
        todos: allTodosArray,
        todos_by_date,
        done,
        done_todos_by_date,
        current_section,
        selected,
      };
  }

  getSectionTitleInfo(todosArray, targetList=false) {
    if (!targetList) {
      let title = 'All Todos',
          data = todosArray.length;
      return {title, data, type: 'incomplete'};
    } else {
      let title = targetList.getAttribute('data-title'),
          data = targetList.getAttribute('data-total'),
          type = targetList.getAttribute('data-list_type');
      return {title, data, type};
    }
  }

  getCompletedTodos(todosArray) {
    const completedTodos = [];
    todosArray.forEach(todoObj => {
      if (todoObj.completed) {
        completedTodos.push(todoObj);
      }
    });
    return completedTodos;
  }

  getTodosByDate(todosArray) {
    const todosByDate = {};
    todosArray.forEach(todoObj => {
      let dueDate = this.getDueDate(todoObj);
      if (todosByDate[dueDate]) {
        todosByDate[dueDate].push(todoObj.id);
      } else {
        todosByDate[dueDate] = [];
        todosByDate[dueDate].push(todoObj.id);
      }
    });
    return this.listSorter.orderListBydate(todosByDate);
  }

  getCompletedTodosByDate(completedTodosArray) {
    return this.getTodosByDate(completedTodosArray);
  }

  getTodosForList(listName, todosArray) {
    if (listName === 'Completed') {
      return this.getCompletedTodos(todosArray);
    } else {
      return todosArray;
    }
  }

  filterTodosByDate(todosArray, dueDate, selectDone) {
    if (selectDone) {
      todosArray = this.getCompletedTodos(todosArray);
    }

    todosArray.forEach(todoObj => todoObj.due_date = this.getDueDate(todoObj));

    if (this.invalidDueDate(dueDate)) {
      return this.getTodosForList(dueDate, todosArray);
    }

    const todosByDate = [];
    todosArray.forEach(todoObj => {
      if (dueDate === todoObj.due_date) {
        // we can just use the todoObj itself, at this point it has the necessary
        // properties
        // const obj = {id: todoObj.id, title: todoObj.title,
        //              'due_date': todoObj.due_date,
        //              completed: todoObj.completed};
        todosByDate.push(todoObj);
      }
    });
    return todosByDate;
  }

  // utility functions
  invalidDueDate(dueDate) {
    return (dueDate === 'All Todos' ||
            dueDate === 'Completed' ||
            dueDate === undefined);
  }

  getDueDate(todoObj) {
    if (todoObj.month !== '' && todoObj.year !== '') {
      return `${todoObj.month}/${todoObj.year.slice(-2)}`;
    } else {
      return 'No Due Date';
    }
  }

  flipCompleteStatus(todoObj) {
    todoObj.completed = !todoObj.completed;
    return todoObj;
  }

  getFlippedJSON(todoObj) {
    return JSON.stringify(this.flipCompleteStatus(todoObj));
  }
}

// unnecessary variable creation !!!
class ListSortingUtility {
  orderListBydate(listObj) {
    // let self = this;
    return Object.keys(listObj)
                 // .sort(self.compareByDueDateString.bind(self))
                 .sort(this.compareByDueDateString.bind(this))
                 .reduce((obj, key) => {
                   obj[key] = listObj[key];
                   return obj;
                 }, {});
  }

  dateToNum(d) {
    if (!d || !d.match(/^[0-9]{2}\/[0-9]{2}$/)) {
      return 0;
    }
    let numbers = d.split("/");
    return Number(numbers[1] + numbers[0]);
  }

  compareByDueDateString(a, b) {
    return this.dateToNum(a) - this.dateToNum(b);
  }
}
