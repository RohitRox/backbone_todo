$(document).ready(function(){
  // Models
  var Todo = Backbone.Model.extend({

    defaults: function() {
      return {
        title: "untitled",
        done: false,
        priority: 'medium',
        category: 'untitled'
      };
    },

    initialize: function() {
      if (!this.get("title")) {
        this.set({"title": this.defaults().title});
      }
    }

  });

  // Collection

  var TodoList = Backbone.Collection.extend({

    model: Todo,

    localStorage: new Backbone.LocalStorage("todos-backbone"),

    done: function() {
      return this.filter(function(todo){ return todo.get('done'); });
    },

    remaining: function() {
      return this.without.apply(this, this.done());
    }

  });

  var Todos = new TodoList();

  // Views

  var TodoView = Backbone.View.extend({

   tagName:  "div",
   className: 'todo',
   template: _.template($('#todo').html()),

   render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.toggleClass('done', this.model.get('done'));
      this.input = this.$('.edit');
      return this;
    }

  });

  var AppView = Backbone.View.extend({

    el: $("#todo_list"),
    initialize: function() {
      alert(';');
      Todos.fetch();
    },
    render: function(){
      alert('hi');
    }

  });

  var App = new AppView();
  alert('ok');
});