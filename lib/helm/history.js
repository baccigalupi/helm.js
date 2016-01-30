Helm.History = Helm.BaseClass.extend({
  initialize: function() {
    this.list = [];
    this.init(arguments);
  },

  start: function() {
    if (this.started) { return; }
    Backbone.history.start();
    this.started = true;
  },

  listenTo: function(router) {
    router.on('route:start', this.push, this);
  },

  push: function(fragment, args) {
    this.list.push(fragment);
  },

  pop: function() {
    return this.list.pop();
  },

  init: function() {}
});
