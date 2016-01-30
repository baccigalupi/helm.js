Helm.View = Backbone.View.extend(Helm.Mixins.Subviews).extend({
  initialize: function(opts) {
    this._init(opts);
    this.init(opts);
  },

  _init: function(opts) {
    opts || (opts = {});
    this.config = _.extend(_.clone(this.defaultConfig), this.config);
    this.parent = opts.parent || _.result(this, 'parent');
  },

  defaultConfig: {
    attach: 'append',
    viewModel: 'ViewModel',
  },

  events: function() {
    if (this._events) { return this._events; }
    this._events = Helm.Overrides.ClickEvent.normalizeListeners(_.result(this.config, 'events') || {});
    return this._events;
  },

  render: function () {
    this.renderSelf();
    this.renderSubviews();
    this.attachToParent();
    this.afterRender();
  },

  renderSelf: function() {
    var template = this.template();
    if (!template) { return; }

    var rendered = template.render(this.viewModel(), _.result(this, 'partials'));
    this.$el.html(rendered);
  },

  renderSubviews: function() {
    this.renderEach(this.subviews());
  },

  attachToParent: function () {
    var $parent = new Helm.View.ParentFinder(
      this.parent, this.config.parentSelector
    ).perform();

    $parent && $parent[this.config.attach](this.el);
  },

  removeSelf: function() {
    Backbone.View.prototype.remove.apply(this);
  },

  viewModelClass: function() {
    if (_.isFunction(this.config.viewModel)) {
      return this.config.viewModel();
    } else {
      return Helm.Mixins.DotPath.find(this.viewModelClasses, this.config.viewModel) || Helm.ViewModel;
    }
  },

  template: function() {
    if (!this.config.template) { return; }
    return this.templates[_.result(this.config, 'template')];
  },

  viewModel: function() {
    var subject = this.model || this.collection;
    var viewModel = new (this.viewModelClass())(subject);
    viewModel.repository || (viewModel.repository = this.repository);
    return viewModel.toJSON();
  },

  // ----------- Functions and Attrs to override

  init: function() {},
  subviews: function() { return []; },
  config: {},
  partials: function() {
    return this.templates;
  }
});
