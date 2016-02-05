(function (factory) {
  // this load pattern is taken from Backbone, removes AMD support for right now

  // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
  // We use `self` instead of `window` for `WebWorker` support.
  var root = (typeof self == 'object' && self.self == self && self) ||
             (typeof global == 'object' && global.global == global && global)

  if (typeof exports !== 'undefined') {
    // for node on the server
    var _, $;
    var Backbone = require('backbone');
    try { $ = require('jquery'); } catch(e) {}
    try { _ = require('underscore'); } catch(e) {}

    factory(root, exports, _, $, Backbone);
  } else {
    // for the browser
    root.Backbone = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$), root.Backbone);
  }

}(function (root, Helm, _, $, Backbone) {
  Helm.Mixins = {}
  Helm.Overrides = {}
  Helm.RequestMiddleware = {}
  Helm.Subscribers = {}

  Helm.BaseClass = function () {
    this.initialize.apply(this, arguments)
  }

  Helm.BaseClass.prototype.initialize = function () {
    this._init.apply(this, arguments)
    this.init.apply(this, arguments)
  }

  Helm.BaseClass.prototype.init = Helm.BaseClass.prototype._init = function () {}

  Helm.BaseClass.extend = Backbone.Model.extend

  //= require request_middleware/*.js
  //= require overrides/*.js
  //= require mixins/*.js
  //= require subscribers/*.js
  //= require view.js
  //= require view/*.js
  //= require app.js
  //= require view_model.js
  //= require collection_view_model.js
  //= require history.js
  //= require notifications.js
  //= require router.js

  root.Helm = Helm
  return Helm
}))
