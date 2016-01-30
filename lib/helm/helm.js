var Helm = {
  Mixins: {},
  Overrides: {},
  RequestMiddleware: {},
  Subscribers: {}
};

Helm.BaseClass = function() {
  this.initialize.apply(this, arguments);
}
Helm.BaseClass.prototype.initialize = function() {
  this._init.apply(this, arguments);
  this.init.apply(this, arguments);
};
Helm.BaseClass.prototype.init = Helm.BaseClass.prototype._init = function() {};
Helm.BaseClass.extend = Backbone.Model.extend;



