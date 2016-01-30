describe('Helm.RequestMiddleware.ServerNotifications', function() {
  var xhr, transformed;

  beforeEach(function() {
    xhr = {
      response: JSON.stringify({
        events: {
          redirect: '/sign_in',
          flash: 'Please sign in'
        }
      })
    };
  });

  describe("when there is no complete attribute in the args", function() {
    beforeEach(function() {
      transformer = new Helm.RequestMiddleware.ServerNotifications({});
      transformed = transformer.perform();
    });

    it("adds a complete attribute", function() {
      expect(_.isFunction(transformed.complete)).toBe(true);
    });

    it("the complete callback publishes the right events", function() {
      spyOn(Helm.Notifications, 'publish');

      transformed.complete(xhr);

      expect(Helm.Notifications.publish.calls.count()).toEqual(2);
      expect(Helm.Notifications.publish.calls.argsFor(0)).toEqual(['redirect', '/sign_in']);
      expect(Helm.Notifications.publish.calls.argsFor(1)).toEqual(['flash', 'Please sign in']);
    });
  });

  describe("when there is already a complete callback", function() {
    var originalComplete;
    beforeEach(function() {
      originalComplete = jasmine.createSpy('complete callback');
      var args = {
        complete: originalComplete
      };
      transformer = new Helm.RequestMiddleware.ServerNotifications(args);
      transformed = transformer.perform();
    });

    it("calls the original callback", function() {
      transformed.complete(xhr, 'success');
      expect(originalComplete).toHaveBeenCalledWith(xhr, 'success');
    });

    it("the complete callback publishes the right events", function() {
      spyOn(Helm.Notifications, 'publish');

      transformed.complete(xhr);

      expect(originalComplete).toHaveBeenCalled();
      expect(Helm.Notifications.publish.calls.count()).toEqual(2);
      expect(Helm.Notifications.publish.calls.argsFor(0)).toEqual(['redirect', '/sign_in']);
      expect(Helm.Notifications.publish.calls.argsFor(1)).toEqual(['flash', 'Please sign in']);
    });
  });
});
