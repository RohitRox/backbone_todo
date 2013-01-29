$(document).ready(function(){
  //underscore settings for mustache templates
  _.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
  };

  // Model
  var Todo = Backbone.Model.extend({
    url: '/tasks',
    defaults: function() {
      return {
        title: "untitled",
        status: "Not-Completed",
        priority: 'medium',
        category: 'untitled',
        created_at: this.utc_date()
      };
    },
    initialize: function() {
      if (!this.get("title")) {
        this.set({"title": this.defaults().title});
      }
    },
    utc_date: function(){
      var now = new Date();
      return now.toUTCString();
    }

  });

  // Collection

  var TodoList = Backbone.Collection.extend({

    model: Todo,

    url: "/tasks",

    done: function() {
      return this.filter(function(todo){ return todo.get('status')==="Completed"; });
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
      this.$el.toggleClass('done', this.model.get('status')==="Completed");
      return this;
    }

  });

  var TodoForm = Backbone.View.extend({
    render: function(mod){
      var form = $('#todo_form').html();
      this.$el.html(form);
      var coll = todos_view.collection;
      var categories = coll.getCategories();
      var sel = $(this.$el).find('#c41_category').empty();
      _.each(categories,function(cat){
        sel.append('<option>'+cat+'</option>');
      });
      sel.append('<option>new category</option>');

      $.facebox(this.$el);
    },
    events: {
      "click #new_todo_submit":    "persist",
      "change #c41_category": "change_cat"
    },
    change_cat: function(e){
      var el = e.target;
      if( el.value == "new category"){
        $(el).removeAttr('name');
        $(el).after('<p><br /><input type="text" name="category" /></p>');
      }else{
        $(el).attr('name','category');
        $(el).siblings('p').remove();
      }
    },
    persist: function(){
      var arr = this.$el.find('form').serializeArray();
      var data = _(arr).reduce(function(acc, field) {
        acc[field.name] = field.value;
        return acc;
      }, {});

      this.model = new Todo(data);
      todos_view.collection.add(this.model);
      this.model.save();
      todos_view.render_categories();
      $.facebox.close();
    }
  });

  var TodoListView =  Backbone.View.extend({
    el: $('#todo_app_main'),
    filterCat: "all",
    filterStatus: "all",
    initialize: function(coll){
      this.collection = coll;
      this.on("change:renderFilter", this.renderByFilter, this);
      this.collection.on("reset", this.render, this);
      this.collection.on("add", this.renderTodo, this);
    },
    events: {
      "click #categories a":    "filterByCat",
      "click #status_filter a": "filterByStatus",
      "click #show_all_cats": "show_all_cat",
      "click #new_todo":        "todo_form"
    },
    persist: function(){
      this.form.commit();
      console.log(this.form.model);
    },
    todo_form: function(){
      var t = new TodoForm();
      t.render(new Todo());
    },
    show_all_cat: function(e){
      e.preventDefault();
      var target = $(e.currentTarget);
      this.$el.find('#categories a').removeClass('active');
      this.filterCat = "all";
      this.trigger("change:renderFilter");
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
      var el = $(this.el).find('#categories').empty();
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
      this.trigger("change:renderFilter");
    },
    filterByStatus: function(e){
      e.preventDefault();
      var target = $(e.currentTarget);
      target.parents('#status_filter').find('a').removeClass('active');
      target.addClass('active');
      this.filterStatus = target.data('status');
      this.trigger("change:renderFilter");
    },
    renderByFilter: function(){
      var filterCat = this.filterCat;
      var filterStatus = this.filterStatus;
      this.collection.fetch({ silent: true });
      if( filterCat == "all" && filterStatus == "all" ){
        this.render();
      }
      else{
        var filtered = _.filter(this.collection.models, function (item) {
           if ( filterCat == "all")
            return item.get('status') === filterStatus;
          else if ( filterStatus == "all")
            return item.get("category") === filterCat;
          else
            return item.get("category") === filterCat && item.get('status') === filterStatus;
        });
        this.collection.reset(filtered);
      }

      todoRouter.navigate("filter/" + filterCat+"/"+filterStatus);
    }
  });

  var TodosRouter = Backbone.Router.extend({
      routes: {
        "filter/:type": "urlFilter",
        "filter/:type/:status": "urlFilterStatus"
      },
      urlFilter: function (type) {
        todos_view.filterCat = type;
        todos_view.trigger("change:renderFilter");
      },
      urlFilterStatus: function(type, status){
        todos_view.filterCat = type;
        todos_view.filterStatus = status;
        todos_view.trigger("change:renderFilter");
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