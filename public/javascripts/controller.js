/* jshint esversion: 8 */
import {FormConverter} from "./formConverter.js";

export class Controller {
  constructor(ui, api, converter, events) {
    this.ui = ui;
    this.api = api;
    this.converter = converter;
    this.events = events;
    this.bindEvents();
    this.updateDisplay();
  }

  bindEvents() {
    this.events.bindEvents.call(this);
  }

  updateDisplay(targetList, dueDate, selectDone=false) {
    this.api.getAllTodos()
    .then(allTodosArray => {
      let data = this.converter.formatMainTemplateData(allTodosArray, targetList, dueDate, selectDone);
      this.ui.updateDisplay(data);
      this.ui.cleanList();
      this.ui.highlightActiveList();
      this.ui.updateTitleCounter();
    });
  }

  generateForm(todoObj) {
    this.ui.buildFormModal(todoObj);
    const formModal = document.querySelector('#form_modal'),
          modalLayer = document.querySelector('#modal_layer');
    this.ui.show(formModal, modalLayer);
  }

  // utility functions
  getTargetListAndDueDate(context='main', target) {
    let targetList,
        dueDate;
    switch (context) {
      case 'main':
        targetList = document.querySelector('#section_title');
        dueDate = targetList.getAttribute('data-title');
        break;
      case 'delete':
      // this was being used to track item counts; made redundant
        // let header = document.querySelector('#section_title'),
        // // redundant - could just use dueDate
        // title = header.getAttribute('data-title');
        // targetList = document.querySelector(`dl[data-title="${title}"]`);
        // dueDate = header.getAttribute('data-title');
        //   if (!targetList) {
        //   targetList = document.querySelector(`header[data-title="${title}"]`);
        //   }
          targetList = document.querySelector('#section_title');
          dueDate = targetList.getAttribute('data-title');

        break;
      case 'list':
        targetList = target.parentElement.parentElement;
        dueDate = target.textContent;
        break;
    }
    return [targetList, dueDate];
  }
  getIDForChecks(target) {
    let id = target.parentElement.getAttribute('data-todoID');

    if (target.classList.contains('check')) {
      id = target.previousElementSibling.getAttribute('data-todoid');
    }

    return id;
  }

  getJSONFormData() {
    let form = document.querySelector('form'),
        data = new FormData(form);
    return FormConverter.convertFormDataToJSON(data);
  }

  // for event handling
  modalLayer() {
    let [targetList, dueDate] = this.getTargetListAndDueDate();
    this.updateDisplay(targetList, dueDate);
  }
  saveContact() {
    // unnecessary; leftover item
    // const name = document.querySelector("input[name='title']");
      let jsonData = this.getJSONFormData();
    if (JSON.parse(jsonData).title.length < 3) {
      window.alert('You must enter a title at least 3 characters long.');
    } else {
      this.api.addTodo(jsonData)
      .then(result => {
        this.updateDisplay();
      });
    }
  }
  editContact(target) {
    let jsonData = this.getJSONFormData(),
    id = target.getAttribute('data-todoid');

    this.api.updateTodo(id, jsonData)
    .then(result => {
      let [targetList, dueDate] = this.getTargetListAndDueDate();
      this.updateDisplay(targetList, dueDate);
    });
  }

  markComplete(target) {
    let id = target.getAttribute('data-todoid');
    this.api.getTodoByID(id)
    .then(todoObj => {
      let [targetList, dueDate] = this.getTargetListAndDueDate();

      if (!todoObj.completed) {
        let json = this.converter.getFlippedJSON(todoObj);
        this.api.updateTodo(id, json)
        .then(result => {
          this.updateDisplay(targetList, dueDate);
        });
      } else {
        this.updateDisplay(targetList, dueDate);
      }
    });
  }

  delete(target) {
    let id = target.getAttribute('data-todoID');

    this.api.deleteTodo(id)
    .then(result => {
      let [targetList, dueDate] = this.getTargetListAndDueDate('delete');
      this.updateDisplay(targetList, dueDate);
    });
  }

  openList(target) {
    let id = target.parentElement.parentElement.getAttribute('data-todoID');
    this.api.getTodoByID(id)
    .then(todoObj => {
      this.generateForm(todoObj);
      this.ui.updateFormModal(todoObj);
    });
  }

  checkTodo(target) {
    let id = this.getIDForChecks(target);

    this.api.getTodoByID(id)
    .then(todoObj => {
      let json = this.converter.getFlippedJSON(todoObj);
      this.api.updateTodo(id, json)
      .then(result => {
        let [targetList, dueDate] = this.getTargetListAndDueDate();
        this.updateDisplay(targetList, dueDate);
      });
    });
  }

  buildList(target) {
    let [targetList, dueDate] = this.getTargetListAndDueDate('list', target);

    if (target.hasAttribute('data-completed')) {
      this.updateDisplay(targetList, dueDate, 'completed');
    } else {
      this.updateDisplay(targetList, dueDate);
    }
  }
}
