Helm.App = Helm.BaseClass.extend(Helm.Mixins.Subviews).extend({
  _init: function ($el) {
    this.$el = this.parent = $el
    Helm.RequestMiddleware.AuthToken.token = $('meta[name="csrf-token"]').attr('content')
  },

  start: function () {
    this.setup()
    this.render()
  },

  render: function () {
    this.renderEach(this.subviews())
    this.afterRender()
  },

  manageHistory: function () {
    if (Helm.history) {
      this.history = Helm.history
    } else {
      this.history = Helm.history = new Helm.History()
    }
  },

  routerClass: function () {
    if (this.constructor.Router) { return this.constructor.Router }
    throw new Error('No Router class found!')
  },

  createRepository: function () {
    var Klass = this.constructor.Repository
    Klass || (Klass = this.Repository)
    if (Klass) {
      return new Klass()
    } else {
      return {}
    }
  },

  loadTemplates: function () {
    if (this.constructor.RawTemplates) {
      this.loadRawTemplates()
    }
  },

  loadRawTemplates: function () {
    var templates = this.constructor.Templates
    var rawTemplates = this.constructor.RawTemplates
    _.each(rawTemplates, function (value, key) {
      templates[key] = Hogan.compile(value)
    })
  },

  setup: function () {
    this.loadTemplates()
    this.manageHistory()
    this.repository || (this.repository = this.createRepository())
    this.router = new (this.routerClass())(this, this.$el)
    this.injectRouter()
    this.history.start()
  },

  injectRouter: function () {
    var router = this.router
    router.app = this
    router.repository = this.repository
    router.templates = this.constructor.Templates
    router.viewModelClasses = this.constructor.ViewModels
    router.router = router
  }
})

Helm.App.extend = function () {
  var klass = Helm.BaseClass.extend.apply(this, arguments)
  klass.Models = {}
  klass.Views = {}
  klass.Templates = {}
  klass.ViewModels = {}
  return klass
}
