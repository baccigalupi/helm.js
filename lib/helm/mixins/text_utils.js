Helm.Mixins.TextUtils = {
  camelize: function(word) {
    return word
      .replace(/^(\w)/, function(g) {
        return g.toUpperCase();
      }).replace(/(_\w)/g, function(g) {
        return g[1].toUpperCase();
      });
  },

  littelCamelize: function(word) {
    return word.replace(/(_\w)/g, function(g) {
      return g[1].toUpperCase();
    });
  },

  underscore: function (word) {
    return word
      .replace(/^(\w)/, function(g) {
        return g.toLowerCase();
      })
      .replace(/([A-Z])/g, function (g) {
        return "_" + g.toLowerCase();
      });
  },

  shorten: function(text, n) {
    if (!text || !n) { return; }

    if (text.length > n) {
      text = text.substr(0, n) + '...';
    }
    return text;
  },

  stripTags: function (text) {
    return text
      .replace(/<(?:.|\n)*?>/gm, ' ')
      .replace(/\s+/g, ' ')
      .replace(/^\s/, '');
  }
};

