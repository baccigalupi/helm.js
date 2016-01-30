Helm.RequestMiddleware.AuthToken = Helm.BaseClass.extend({
  initialize: function(args) {
    this.args = args;
    this.type = args.type.toLowerCase();
    this.data = _.clone(args.data || {});
  },

  perform: function () {
    if ( this.isDataRequest() ) {
      this.handlePostPutPatch();
    } else if ( this.isDeleteRequest() ) {
      this.handleDelete();
    }
    return this.args;
  },

  isDataRequest: function() {
    return this.type == 'post' || this.type == 'put' || this.type == 'patch';
  },

  isDeleteRequest: function() {
    return this.type == 'delete';
  },

  handleDelete: function () {
    this.args.url = this.args.url +
      "?authenticity_token=" +
      encodeURIComponent(this.authenticityToken);
  },

  handlePostPutPatch: function () {
    if ( _.isString(this.data) ) {
      this.repackageStringData();
    }

    this.addAuthToken();
  },

  repackageStringData: function () {
    this.data = JSON.parse(this.data);
  },

  addAuthToken: function () {
    data = _.extend(this.data, {authenticity_token: this.constructor.token});
    this.args.data = this.data = JSON.stringify(data);
  }
});
