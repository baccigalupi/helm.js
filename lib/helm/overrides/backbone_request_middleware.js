Backbone.ajax = function() {
  var args = _.map(arguments, function(a) {
    return (new Helm.RequestMiddleware.AuthToken(a)).perform();
  });
  args = _.map(args, function(a) {
    return (new Helm.RequestMiddleware.ServerNotifications(a)).perform();
  });

  return Backbone.$.ajax.apply(Backbone.$, args);
};
