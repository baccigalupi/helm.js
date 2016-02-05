var jsdom = require('jsdom')

var setupWindow = function (callback) {
  global.$ = require('jquery')
  global._ = require('underscore')
  global.Backbone = require('backbone')
  require(__dirname + "/../../dist/helm-0.7.0")

  callback()
}

var launchDom = function (callback) {
  jsdom.env({
    html: "<html><body></body></html>",
    done: function(errs, window) {
      global.window = window;
      setupWindow(callback)
    }
  })
}

module.exports = launchDom
