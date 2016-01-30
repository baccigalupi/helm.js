Helm.View.ParentFinder = Helm.BaseClass.extend({
  initialize: function(parent, selector) {
    this.parent = parent;
    this.selector = selector;
  },

  perform: function() {
    if (!this.parent && !this.selector) { return; }

    var found;
    if (!this.parent) {
      found = this.seekGlobally();
    } else if (!this.selector) {
      found = this.searchParent();
    } else {
      found = this.findIn$(this.searchParent());
    }
    return found;
  },

  searchParent: function() {
    return this.parent.$el ? this.parent.$el : this.parent;
  },

  seekGlobally: function() {
    var element = $(this.selector);
    if (element.length) { return element; }
  },

  findIn$: function(parent) {
    if (!this.selector) { return parent; }

    var element = parent.find(this.selector);
    if (!element.length && parent.is(this.selector)) {
      element = parent;
    }

    if (element.length) { return element; }
  }
});
