/* jshint esversion: 8 */
export class EventHandler {

  bindEvents() {
    document.addEventListener('click', event => {
      const target = event.target,
            classes = target.classList;

      if (target.hasAttribute('data-add_new')) {
        this.generateForm();
      }

      if (target.id === "modal_layer") {
        this.modalLayer();
      }

      if (target.id === 'save_contact') {
        event.preventDefault();
        this.saveContact();
      }

      if (target.id === 'inactive_complete_btn') {
        event.preventDefault();
        window.alert('You need to create a todo before it can be completed!');
      }

      if (target.id === 'edit_contact') {
        event.preventDefault();
        this.editContact(target);
      }

      if (target.id === 'mark_complete_btn') {
        event.preventDefault();
        this.markComplete(target);
      }

      if (classes.contains('delete')) {
        this.delete(target);
      }

      if (classes.contains('list_item_link')) {
        this.openList(target);
      }

      if (classes.contains('check') || classes.contains('list_item')) {
        event.preventDefault();
        this.checkTodo(target);
      }

      if (target.hasAttribute('data-list_link')) {
        event.preventDefault();
        this.buildList(target);
      }
    });
  }
}
