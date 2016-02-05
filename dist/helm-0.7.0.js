(function(factory) {
  // this load pattern is taken from Backbone, removes AMD support for right now

  // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
  // We use `self` instead of `window` for `WebWorker` support.
  var root = (typeof self == 'object' && self.self == self && self) ||
    (typeof global == 'object' && global.global == global && global)

  if (typeof exports !== 'undefined') {
    // for node on the server
    var _, $;
    var Backbone = require('backbone');
    try {
      $ = require('jquery');
    } catch (e) {}
    try {
      _ = require('underscore');
    } catch (e) {}

    factory(root, exports, _, $, Backbone);
  } else {
    // for the browser
    root.Backbone = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$), root.Backbone);
  }

}(function(root, Helm, _, $, Backbone) {
  Helm.Mixins = {}
  Helm.Overrides = {}
  Helm.RequestMiddleware = {}
  Helm.Subscribers = {}

  Helm.BaseClass = function() {
    this.initialize.apply(this, arguments)
  }

  Helm.BaseClass.prototype.initialize = function() {
    this._init.apply(this, arguments)
    this.init.apply(this, arguments)
  }

  Helm.BaseClass.prototype.init = Helm.BaseClass.prototype._init = function() {}

  Helm.BaseClass.extend = Backbone.Model.extend

  Helm.RequestMiddleware.AuthToken = Helm.BaseClass.extend({
    initialize: function(args) {
      this.args = args
      this.type = args.type.toLowerCase()
      this.data = _.clone(args.data || {})
    },

    perform: function() {
      if (this.isDataRequest()) {
        this.handlePostPutPatch()
      } else if (this.isDeleteRequest()) {
        this.handleDelete()
      }
      return this.args
    },

    isDataRequest: function() {
      return this.type === 'post' || this.type === 'put' || this.type === 'patch'
    },

    isDeleteRequest: function() {
      return this.type === 'delete'
    },

    handleDelete: function() {
      this.args.url = this.args.url +
        '?authenticity_token=' +
        encodeURIComponent(this.authenticityToken)
    },

    handlePostPutPatch: function() {
      if (_.isString(this.data)) {
        this.repackageStringData()
      }

      this.addAuthToken()
    },

    repackageStringData: function() {
      this.data = JSON.parse(this.data)
    },

    addAuthToken: function() {
      var data = _.extend(this.data, {
        authenticity_token: this.constructor.token
      })
      this.args.data = this.data = JSON.stringify(data)
    }
  })

  Helm.RequestMiddleware.ServerNotifications = Helm.BaseClass.extend({
    initialize: function(args) {
      this.args = args
    },

    perform: function() {
      this.args.complete = this.wrapComplete(this.args.complete)
      return this.args
    },

    wrapComplete: function(callback) {
      return function(xhr, status) {
        // call the original callback
        if (callback) {
          callback(xhr, status)
        }

        // extract the JSON data

        var response = xhr.response || xhr.responseText || '{}'
        var data = JSON.parse(response)
        var publisher = Helm.Notifications

        // publish each event received
        _.each(data.events || {}, function(value, key) {
          publisher.publish(key, value)
        })
      }
    }
  })

  Backbone.ajax = function() {
    var args = _.map(arguments, function(a) {
      return (new Helm.RequestMiddleware.AuthToken(a)).perform()
    })
    args = _.map(args, function(a) {
      return (new Helm.RequestMiddleware.ServerNotifications(a)).perform()
    })

    return Backbone.$.ajax.apply(Backbone.$, args)
  }

  /*
   * Touch devices often wait 250ms to convert touchstart/touchstop pairs into a click.
   * This leads to terrible feeling mobile first applications.
   * Add this in if you want to get snappier clicks.
   */
  Helm.Overrides.ClickEvent = {
    isTouch: function() {
      // taken from Modernizr: http://modernizr.com/license
      return (('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch)
    },

    // windows touch + mouse devices create a total crap show show
    isWindows: function() {
      /Windows/i.test(navigator.userAgent)
    },

    shouldOverride: function() {
      return !this.isWindows() && this.isTouch()
    },

    normalizeListeners: function(listeners) {
      if (!this.shouldOverride()) {
        return listeners
      }

      var events = {}
      var newKey
      _.each(listeners, function(value, key) {
        newKey = key.replace('click', 'touchstart')
        events[newKey] = value
      })

      return events
    }
  }

  if (!Function.prototype.bind) {
    Function.prototype.bind || function(context) {
      var func = this
      return function() {
        return func.apply(context, arguments)
      }
    }
  }


  Helm.Mixins.DotPath = {
    find: function(object, path) {
      var paths = path.split('.')
      var length = paths.length
      var current = object
      var i
      for (i = 0; i < length; i++) {
        if (_.isObject(current)) {
          current = current[paths[i]]
        } else {
          current = undefined
          break
        }
      }
      return current
    }
  }

  Helm.Mixins.Subviews = {
    renderEach: function(subviews) {
      this._subviews = subviews

      _.each(subviews, function(view) {
        if (view) {
          view.parent = view.parent || this.defaultParent()
          view.repository = view.repository || this.repository
          view.templates = view.templates || this.templates
          view.viewModelClasses = view.viewModelClasses || this.viewModelClasses
          view.router = view.router || this.router
          view.render()
        }
      }.bind(this))
    },

    remove: function() {
      this.removeSelf()

      _.each(this._subviews || [], function(view) {
        view.remove()
      })
    },

    removeSelf: function() {
      // override me!
    },

    defaultParent: function() {
      return this
    },

    subviews: function() {
      return []
    },
    afterRender: function() {}
  }

  Helm.Mixins.TextUtils = {
    camelize: function(word) {
      return word
        .replace(/^(\w)/, function(g) {
          return g.toUpperCase()
        }).replace(/(_\w)/g, function(g) {
          return g[1].toUpperCase()
        })
    },

    littelCamelize: function(word) {
      return word.replace(/(_\w)/g, function(g) {
        return g[1].toUpperCase()
      })
    },

    underscore: function(word) {
      return word
        .replace(/^(\w)/, function(g) {
          return g.toLowerCase()
        })
        .replace(/([A-Z])/g, function(g) {
          return '_' + g.toLowerCase()
        })
    },

    shorten: function(text, n) {
      if (!text || !n) {
        return
      }

      if (text.length > n) {
        text = text.substr(0, n) + '...'
      }
      return text
    },

    stripTags: function(text) {
      return text
        .replace(/<(?:.|\n)*?>/gm, ' ')
        .replace(/\s+/g, ' ')
        .replace(/^\s/, '')
    }
  }


  Helm.Subscribers.Redirector = function(url) {
    window.location = url
  }

  Helm.View = Backbone.View.extend(Helm.Mixins.Subviews).extend({
    initialize: function(opts) {
      this._init(opts)
      this.init(opts)
    },

    _init: function(opts) {
      opts || (opts = {})
      this.config = _.extend(_.clone(this.defaultConfig), this.config)
      this.parent = opts.parent || _.result(this, 'parent')
    },

    defaultConfig: {
      attach: 'append',
      viewModel: 'ViewModel'
    },

    events: function() {
      if (this._events) {
        return this._events
      }
      this._events = Helm.Overrides.ClickEvent.normalizeListeners(_.result(this.config, 'events') || {})
      return this._events
    },

    render: function() {
      this.renderSelf()
      this.renderSubviews()
      this.attachToParent()
      this.afterRender()
    },

    renderSelf: function() {
      var template = this.template()
      if (!template) {
        return
      }

      var rendered = template.render(this.viewModel(), _.result(this, 'partials'))
      this.$el.html(rendered)
    },

    renderSubviews: function() {
      this.renderEach(this.subviews())
    },

    attachToParent: function() {
      var $parent = new Helm.View.ParentFinder(
        this.parent, this.config.parentSelector
      ).perform()

      $parent && $parent[this.config.attach](this.el)
    },

    removeSelf: function() {
      Backbone.View.prototype.remove.apply(this)
    },

    viewModelClass: function() {
      if (_.isfunction(this.config.viewModel)) {
        return this.config.viewModel()
      } else {
        return Helm.Mixins.DotPath.find(this.viewModelClasses, this.config.viewModel) || Helm.ViewModel
      }
    },

    template: function() {
      if (!this.config.template) {
        return
      }
      return this.templates[_.result(this.config, 'template')]
    },

    viewModel: function() {
      var subject = this.model || this.collection
      var viewModel = new(this.viewModelClass())(subject)
      viewModel.repository || (viewModel.repository = this.repository)
      return viewModel.toJSON()
    },

    // ----------- Functions and Attrs to override

    init: function() {},
    subviews: function() {
      return []
    },
    config: {},
    partials: function() {
      return this.templates
    }
  })

  Helm.View.ParentFinder = Helm.BaseClass.extend({
    initialize: function(parent, selector) {
      this.parent = parent
      this.selector = selector
    },

    perform: function() {
      if (!this.parent && !this.selector) {
        return
      }

      var found
      if (!this.parent) {
        found = this.seekGlobally()
      } else if (!this.selector) {
        found = this.searchParent()
      } else {
        found = this.findIn$(this.searchParent())
      }
      return found
    },

    searchParent: function() {
      return this.parent.$el ? this.parent.$el : this.parent
    },

    seekGlobally: function() {
      var element = $(this.selector)
      if (element.length) {
        return element
      }
    },

    findIn$: function(parent) {
      if (!this.selector) {
        return parent
      }

      var element = parent.find(this.selector)
      if (!element.length && parent.is(this.selector)) {
        element = parent
      }

      if (element.length) {
        return element
      }
    }
  })

  Helm.App = Helm.BaseClass.extend(Helm.Mixins.Subviews).extend({
    _init: function($el) {
      this.$el = this.parent = $el
      Helm.RequestMiddleware.AuthToken.token = $('meta[name="csrf-token"]').attr('content')
    },

    start: function() {
      this.setup()
      this.render()
    },

    render: function() {
      this.renderEach(this.subviews())
      this.afterRender()
    },

    manageHistory: function() {
      if (Helm.history) {
        this.history = Helm.history
      } else {
        this.history = Helm.history = new Helm.History()
      }
    },

    routerClass: function() {
      if (this.constructor.Router) {
        return this.constructor.Router
      }
      throw new Error('No Router class found!')
    },

    createRepository: function() {
      var Klass = this.constructor.Repository
      Klass || (Klass = this.Repository)
      if (Klass) {
        return new Klass()
      } else {
        return {}
      }
    },

    loadTemplates: function() {
      if (this.constructor.RawTemplates) {
        this.loadRawTemplates()
      }
    },

    loadRawTemplates: function() {
      var templates = this.constructor.Templates
      var rawTemplates = this.constructor.RawTemplates
      _.each(rawTemplates, function(value, key) {
        templates[key] = Hogan.compile(value)
      })
    },

    setup: function() {
      this.loadTemplates()
      this.manageHistory()
      this.repository || (this.repository = this.createRepository())
      this.router = new(this.routerClass())(this, this.$el)
      this.injectRouter()
      this.history.start()
    },

    injectRouter: function() {
      var router = this.router
      router.app = this
      router.repository = this.repository
      router.templates = this.constructor.Templates
      router.viewModelClasses = this.constructor.ViewModels
      router.router = router
    }
  })

  Helm.App.extend = function() {
    var klass = Helm.BaseClass.extend.apply(this, arguments)
    klass.Models = {}
    klass.Views = {}
    klass.Templates = {}
    klass.ViewModels = {}
    return klass
  }

  Helm.ViewModel = Helm.BaseClass.extend({
    _init: function(presented) {
      this.presented = presented || {}
    },

    presentedToJSON: function() {
      var json
      if (this.presented && this.presented.toJSON) {
        json = this.presented.toJSON()
      }
      return json || this.presented
    },

    inclusions: function() {
      var inclusions = {}
      _.each(this.include || [], function(prop) {
        inclusions[prop] = _.result(this, prop) || _.result(this, Helm.Mixins.TextUtils.littelCamelize(prop))
      }.bind(this))
      return inclusions
    },

    /*
      Returns a template-friendly json representation of `presented`.
  
      Example:
  
        var model = new Backbone.Model({ username: "socialcoder" })
  
        var MyViewModel = NailPolish.ViewModel.extend({
          include: ["status", "likes"],
  
          status: "better than ever",
  
          likes: function () {
            return ["clean code", "nice documentation"]
          }
        })
  
        var viewModel = new MyViewModel(model)
  
        viewModel.toJSON()
  
        // {
        //   "likes": ["clean code", "nice documentation"],
        //   "status": "better than ever",
        //   "username": "socialcoder",
        //   "username_error": "is too awesome"
        // }
    */
    toJSON: function() {
      var base = this.presentedToJSON()
      var inclusions = this.inclusions()
      return _.extend(base, inclusions)
    }
  })


  Helm.CollectionViewModel = Helm.BaseClass.extend({
    _init: function(presented) {
      this.presentedCollection = presented || []
    },

    presentedToJSON: function() {
      var json
      if (this.presentedCollection && this.presentedCollection.toJSON) {
        json = this.presentedCollection.toJSON()
      }
      return json || this.presentedCollection
    },

    inclusionsForModel: function(model) {
      this.presented = model
      var inclusions = {}

      _.each(this.include || [], function(prop) {
        inclusions[prop] = _.result(this, prop) || _.result(this, Helm.Mixins.TextUtils.littelCamelize(prop))
      }.bind(this))

      return inclusions
    },

    inclusions: function() {
      var models = this.presentedCollection.models || this.presentedCollection

      return _.map(models, function(model) {
        return this.inclusionsForModel(model)
      }.bind(this))
    },

    toJSON: function() {
      var base = this.presentedToJSON()
      var inclusions = this.inclusions()

      var merged = _.map(base, function(baseJSON, i) {
        return _.extend(baseJSON, inclusions[i] || {})
      })

      var json = merged
      if (this.rootKey !== false) {
        json = {}
        var rootKey = this.rootKey || 'collection'
        json[rootKey] = merged
      }
      return json
    }
  })


  Helm.History = Helm.BaseClass.extend({
    initialize: function() {
      this.list = []
      this.init(arguments)
    },

    start: function() {
      if (this.started) {
        return
      }
      Backbone.history.start()
      this.started = true
    },

    listenTo: function(router) {
      router.on('route:start', this.push, this)
    },

    push: function(fragment, args) {
      this.list.push(fragment)
    },

    pop: function() {
      return this.list.pop()
    },

    init: function() {}
  })

  Helm.Notifications = {
    publisher: _.extend({}, Backbone.Events),

    publish: function(event, args) {
      this.publisher.trigger(event, args)
    },

    subscribe: function(event, callback, context) {
      this.publisher.on(event, callback, context)
    },

    unsubscribe: function(event, callback, context) {
      this.publisher.off(event, callback, context)
    }
  }

  Helm.Router = Backbone.Router.extend(Helm.Mixins.Subviews).extend({
    initialize: function(app, $el) {
      this.app = app
      this.$el = $el

      this.history = this.app.history
      this.history.listenTo(this)

      this.init(arguments)
    },

    // We are overriding this method to add some events before and after
    // a route happens. Unfortunately, the anonymous function in the middle
    // doesn't allow us to call the prototype and change just that behavior.
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route)
      if (_.isfunction(name)) {
        callback = name
        name = ''
      }
      if (!callback) callback = this[name]

      var router = this
      Backbone.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment)
        router.trigger('route:start', fragment, args)
        router.execute(callback, args)
        router.trigger.apply(router, ['route:' + name].concat(args))
        router.trigger('route', name, args)
        Backbone.history.trigger('route', router, name, args)
      })

      return this
    },

    go: function(fragment) {
      this.navigate(fragment, {
        trigger: true
      })
    },

    back: function() {
      this.history.pop()
      var fragment = this.history.pop()
      this.go(fragment)
    },

    render: function(subviews) {
      this.renderEach(subviews)
      this.afterRender()
    },

    page: function(subviews) {
      this.remove()
      this.$el.empty()
      this.render(subviews)
    },

    defaultParent: function() {
      return this.$el
    },

    init: function() {}
  })


  root.Helm = Helm
  return Helm
}))
