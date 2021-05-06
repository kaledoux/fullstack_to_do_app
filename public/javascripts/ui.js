/* jshint esversion: 8 */
export class UI {
  constructor() {
    this.templates = TemplateEngine.buildTemplates();
  }

  // building DOM elements
  updateDisplay(completedObj) {
    let html = this.templates.main_template(completedObj);
    document.body.innerHTML = html;
  }

  buildFormModal(todoObj) {
    const html = this.templates.formModal(todoObj);
    document.body.innerHTML += html;
    this.updateFormModal();
  }

  remove(element) {
    element.remove();
  }

  show(...elements) {
    elements.forEach(ele => {
      ele.style.display = 'block';
    });
  }

  highlightActiveList() {
    const title = document.querySelector('#section_title'),
          currentType = title.getAttribute('data-list_type'),
          currentName = title.getAttribute('data-title');
    const activeTitle = document
      .querySelectorAll(`dl[data-title="${currentName}"], header[data-title="${currentName}"]`);

    for (let i = 0; i < activeTitle.length; i++) {
      let current = activeTitle[i];
      if (current.getAttribute('data-list_type') === currentType) {
        current.classList.add('active');
        break;
      }
    }
  }

  // updating main list
  updateMainListByCompleted(tableBodyDOMObject) {
    tableBodyDOMObject.querySelectorAll('tr').forEach(row => {
      let checkbox = row.querySelector('input');
      if (checkbox.hasAttribute('checked')) {
        tableBodyDOMObject.insertAdjacentElement('beforeend', row);
      }
    });
  }

  stripIncompleteTodos(table) {
    const title = document.querySelector('#section_title'),
          type = title.getAttribute('data-list_type');

    if (type === 'complete') {
      table.querySelectorAll('tr').forEach(row => {
        if (!row.firstElementChild.firstElementChild.hasAttribute('checked')) {
          row.remove();
        }
      });
    }
  }

  cleanList() {
    let table = document.querySelector('tbody');
    this.updateMainListByCompleted(table);
    this.stripIncompleteTodos(table);
  }

  updateTitleCounter() {
    let div = document.querySelector('#items'),
          itemCount = div.querySelectorAll('tr').length,
          titleCount = div.querySelector('dd');
    titleCount.textContent = itemCount;
  }

  // form specific update
  updateFormModal(todoObj) {
    if (!todoObj) return '';
    const formModal = document.querySelector('#form_modal');
    const types = ['day', 'month', 'year'];
    types.forEach(type => {
      let selected = formModal.querySelector(`select[id="due_${type}"]`);
      selected.querySelector(`option[value="${todoObj[type]}"]`)
              .setAttribute('selected', true);
    });
  }
}

class TemplateEngine {
  static buildTemplates() {
    let templateObj = {};
    document.querySelectorAll("script[type='text/x-handlebars-template']")
      .forEach(template => {
        templateObj[template.getAttribute('id')] = Handlebars.compile(template.innerHTML);
      });
    document.querySelectorAll("[data-type=partial]").forEach(template => {
      Handlebars.registerPartial(template.id, template.innerHTML);
    });
    Handlebars.registerHelper('if_true', function(todoStatus, opts) {
      if (todoStatus === true) {
        return opts.fn(this);
      } else {
        return opts.inverse(this);
      }
    });
    return templateObj;
  }
}
