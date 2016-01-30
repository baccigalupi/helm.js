Helm.Router = Backbone.Router.extend(Helm.Mixins.Subviews).extend({
  initialize: function(app, $el) {
    this.app = app;
    this.$el = $el;

    this.history = this.app.history;
    this.history.listenTo(this);

    this.init(arguments);
  },

  // We are overriding this method to add some events before and after
  // a route happens. Unfortunately, the anonymous function in the middle
  // doesn't allow us to call the prototype and change just that behavior.
  route: function (route, name, callback) {
    if (!_.isRegExp(route)) route = this._routeToRegExp(route);
    if (_.isFunction(name)) {
      callback = name;
      name = '';
    }
    if (!callback) callback = this[name];

    var router = this;
    Backbone.history.route(route, function(fragment) {
      var args = router._extractParameters(route, fragment);
      router.trigger('route:start', fragment, args);
      router.execute(callback, args);
      router.trigger.apply(router, ['route:' + name].concat(args));
      router.trigger('route', name, args);
      Backbone.history.trigger('route', router, name, args);
    });

    return this;
  },

  go: function(fragment) {
    this.navigate(fragment, {trigger: true});
  },

  back: function() {
    this.history.pop();
    var fragment = this.history.pop();
    this.go(fragment);
  },

  render: function(subviews) {
    this.renderEach(subviews);
    this.afterRender();
  },

  page: function(subviews) {
    this.remove();
    this.$el.empty();
    this.render(subviews);
  },

  defaultParent: function() {
    return this.$el;
  },

  init: function() { },
});
