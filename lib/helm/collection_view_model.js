Helm.CollectionViewModel = Helm.BaseClass.extend({
  _init: function (presented) {
    this.presentedCollection = presented || []
  },

  presentedToJSON: function () {
    var json
    if (this.presentedCollection && this.presentedCollection.toJSON) {
      json = this.presentedCollection.toJSON()
    }
    return json || this.presentedCollection
  },

  inclusionsForModel: function (model) {
    this.presented = model
    var inclusions = {}

    _.each(this.include || [], function (prop) {
      inclusions[prop] = _.result(this, prop) || _.result(this, Helm.Mixins.TextUtils.littelCamelize(prop))
    }.bind(this))

    return inclusions
  },

  inclusions: function () {
    var models = this.presentedCollection.models || this.presentedCollection

    return _.map(models, function (model) {
      return this.inclusionsForModel(model)
    }.bind(this))
  },

  toJSON: function () {
    var base = this.presentedToJSON()
    var inclusions = this.inclusions()

    var merged = _.map(base, function (baseJSON, i) {
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

