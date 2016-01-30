Helm.ViewModel = Helm.BaseClass.extend({
  _init: function(presented) {
    this.presented = presented || {};
  },

  presentedToJSON: function() {
    var json;
    if (this.presented && this.presented.toJSON) {
      json = this.presented.toJSON();
    }
    return json || this.presented;
  },

  inclusions: function() {
    var inclusions = {};
    _.each(this.include || [], function(prop) {
      inclusions[prop] = _.result(this, prop) || _.result(this, Helm.Mixins.TextUtils.littelCamelize(prop));
    }.bind(this));
    return inclusions;
  },

/*
  Returns a template-friendly json representation of `presented`.

  Example:

    var model = new Backbone.Model({ username: "socialcoder" });

    var MyViewModel = NailPolish.ViewModel.extend({
      include: ["status", "likes"],

      status: "better than ever",

      likes: function() {
        return ["clean code", "nice documentation"];
      }
    });

    var viewModel = new MyViewModel(model);

    viewModel.toJSON();

    // {
    //   "likes": ["clean code", "nice documentation"],
    //   "status": "better than ever",
    //   "username": "socialcoder",
    //   "username_error": "is too awesome"
    // }
*/
  toJSON: function() {
    var base = this.presentedToJSON();
    var inclusions = this.inclusions();
    return _.extend(base, inclusions);
  }
});

