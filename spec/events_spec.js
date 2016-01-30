describe("Helm.Notifications", function() {
  describe("publish", function() {
    it("triggers an event on the publisher", function() {
      spyOn(Helm.Notifications.publisher, 'trigger');
      var args = {};
      var event = 'publication:yo';

      Helm.Notifications.publish(event, args);

      expect(Helm.Notifications.publisher.trigger).toHaveBeenCalledWith(
        event, args
      );
    });
  });

  describe("subscribe", function() {
    it("calls the callback when the event is triggered", function() {
      var sentMessage;
      var context = {
        foo: function(message) {
          sentMessage = message;
        }
      };

      Helm.Notifications.subscribe('flash', function(message) { this.foo(message) }, context);

      Helm.Notifications.publish('flash', 'do it again some more!');
      expect(sentMessage).toBe('do it again some more!');
    });
  });

  describe('unsubscribe', function() {
    it('stops listening to that event', function() {
      var sentMessage;
      var context = {
        foo: function(message) {
          sentMessage = message;
        }
      };

      var handler = function(message) { this.foo(message) };

      Helm.Notifications.subscribe('flash', handler, context);
      Helm.Notifications.unsubscribe('flash', handler, context);
      Helm.Notifications.publish('flash', 'do it again some more!');

      expect(sentMessage).toBe(undefined);
    });
  });
});

