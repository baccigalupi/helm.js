Function.prototype.bind = Function.prototype.bind || function(context) {
  var func = this;
  return function() {
    return func.apply(context, arguments);
  };
}

