/* jshint esversion: 8 */
import {Controller} from "./controller.js";
import {DataConverter} from "./dataConverter.js";
import {ToDoAPI} from "./todoAPI.js";
import {UI} from "./ui.js";
import {EventHandler} from "./eventHandler.js";

class ToDoApp {
  constructor() {
    this.ui = new UI();
    this.api = new ToDoAPI();
    this.converter = new DataConverter();
    this.events = new EventHandler();
    this.controller = new Controller(this.ui, this.api, this.converter, this.events);
  }
}

document.addEventListener('DOMContentLoaded', event => {
  new ToDoApp();
});
