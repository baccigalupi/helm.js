/*
 * Touch devices often wait 250ms to convert touchstart/touchstop pairs into a click.
 * This leads to terrible feeling mobile first applications.
 * Add this in if you want to get snappier clicks.
 */
Helm.Overrides.ClickEvent = {
  isTouch: function() {
    // taken from Modernizr: http://modernizr.com/license
    return (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
  },

  // windows touch + mouse devices create a total crap show show
  isWindows: function() {
    /Windows/i.test(navigator.userAgent)
  },

  shouldOverride: function() {
    return !this.isWindows() && this.isTouch();
  },

  normalizeListeners: function(listeners) {
    if (!this.shouldOverride()) { return listeners; }

    var events = {};
    var newKey;
    _.each(listeners, function(value, key) {
      newKey = key.replace('click', 'touchstart');
      events[newKey] = value;
    });

    return events;
  }
 };
