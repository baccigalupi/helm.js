Helm.Notifications = {
  publisher: _.extend({}, Backbone.Events),

  publish: function (event, args) {
    this.publisher.trigger(event, args);
  },

  subscribe: function (event, callback, context) {
    this.publisher.on(event, callback, context);
  },

  unsubscribe: function(event, callback, context) {
    this.publisher.off(event, callback, context);
  }
}
