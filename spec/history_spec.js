describe('Helm.History', function() {
  var router, history;

  beforeEach(function() {
    spyOn(Backbone.history, 'start');
    router = _.extend({}, Backbone.Events);
    history = new Helm.History();
  });

  it('listens for route:start events and pushes history', function() {
    history.listenTo(router);
    router.trigger('route:start', 'my-path');
    expect(history.list).toEqual(['my-path']);
  });

  it('pops the last history fragment', function() {
    history.list = ['one', 'two'];
    expect(history.pop()).toEqual('two');
    expect(history.list).toEqual(['one']);
  });

  it('start method starts Backbone.history', function() {
    history.start();
    expect(Backbone.history.start).toHaveBeenCalled();
  });

  it('only starts backbone history once', function() {
    history.start();
    history.start();
    expect(Backbone.history.start.calls.count()).toEqual(1);
  });
});
