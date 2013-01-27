$(document).ready(function(){
  _.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
  };
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

    url: "/tasks",

    done: function() {
      return this.filter(function(todo){ return todo.get('done'); });
    },

    remaining: function() {
      return this.without.apply(this, this.done());
    }

  });


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

  var TodoListView =  Backbone.View.extend({
    el: $('#todo_list'),
    initialize: function(coll){
      this.collection = coll;
    },
    render: function(){
      var that = this;
      _.each(this.collection.models, function(item){
        that.renderTodo(item);
      },this);
    },
    renderTodo: function(item){
      var todo_view = new TodoView({
      model: item
      });
      $(this.el).append(todo_view.render().el);
    }
  });

  var AppView = Backbone.View.extend({
    initialize: function() {
      var todos = new TodoList();
      todos.fetch({ success: function(tasks){
        var todos_view = new TodoListView(tasks);
        todos_view.render();
      }
      });

    }

  });

  var App = new AppView();

});