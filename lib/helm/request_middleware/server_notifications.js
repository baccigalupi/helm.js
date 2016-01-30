Helm.RequestMiddleware.ServerNotifications = Helm.BaseClass.extend({
  initialize: function(args) {
    this.args = args;
  },

  perform: function () {
    this.args.complete = this.wrapComplete(this.args.complete);
    return this.args;
  },

  wrapComplete: function (callback) {
    return function(xhr, status) {
      // call the original callback
      if (callback) {
        callback(xhr, status);
      }

      // extract the JSON data

      response = xhr.response || xhr.responseText || "{}";
      var data = JSON.parse(response);
      var publisher = Helm.Notifications;

      // publish each event received
      _.each(data.events || {}, function (value, key) {
        publisher.publish(key, value);
      });
    };
  }
});
