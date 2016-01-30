Helm.Mixins.DotPath = {
  find: function(object, path) {
    var paths = path.split('.');
    var length = paths.length;
    var current = object;
    var i;
    for(i = 0; i < length; i++) {
      if (_.isObject(current)) {
        current = current[paths[i]];
      } else {
        current = undefined;
        break;
      }
    }
    return current;
  }
}
