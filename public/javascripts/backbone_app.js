$(document).ready(function(){
  //underscore settings for mustache templates
  _.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
  };

  // Model
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
    },
    getCategories: function () {
    return _.uniq(this.pluck("category"), false, function (category) {
        return category;
    });
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
      return this;
    }

  });

  var TodoListView =  Backbone.View.extend({
    el: $('#todo_app_main'),
    initialize: function(coll){
      this.collection = coll;
      this.on("change:filterCat", this.renderByCat, this);
      this.collection.on("reset", this.render, this);
    },
    events: {
      "click #categories a": "filterByCat"
    },
    render: function(){
      $(this.el).find('.todo').remove();
      var that = this;
      _.each(this.collection.models, function(item){
        that.renderTodo(item);
      },this);
    },
    renderTodo: function(item){
      var todo_view = new TodoView({
      model: item
      });
      var el = $(this.el).find('#todo_list');
      el.append(todo_view.render().el);
    },
    render_categories: function(){
      var el = $(this.el).find('#categories');
      var me = this;
      var categories = me.collection.getCategories();
      var temp = _.template( $('#cats').html() );
      _.each(categories,function(cat){
        var ren = temp({category: cat});
        el.append(ren);
      });
    },
    filterByCat: function(e){
      e.preventDefault();
      var target = $(e.currentTarget);
      target.parents('.cats').find('a').removeClass('active');
      target.addClass('active');
      this.filterCat = target.data('cat');
      this.trigger("change:filterCat");
    },
    renderByCat: function(){
      var filterCat = this.filterCat;
      this.collection.fetch({ silent: true });
      var filtered = _.filter(this.collection.models, function (item) {
        return item.get("category") === filterCat;
      });
      this.collection.reset(filtered);
      todoRouter.navigate("filter/" + filterCat);
    }
  });

  var TodosRouter = Backbone.Router.extend({
      routes: {
          "filter/:type": "urlFilter"
      },
      urlFilter: function (type) {
          todos_view.filterCat = type;
          todos_view.trigger("change:filterCat");
      }
  });

  var todos = new TodoList(boot_todos);
  var todos_view = new TodoListView(todos);
  todos_view.render();
  todos_view.render_categories();
  var todoRouter = new TodosRouter();

  //start history service
  Backbone.history.start();

});