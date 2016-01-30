describe('Helm.Router', function() {
  var router, Router, $el, app;

  beforeEach(function() {
    Backbone.history.stop();
    var history = new Helm.History();
    app = {history: history};
    $el = $('<div class="app">Routed content here!</div>');

    Router = Helm.Router.extend({
      routes: {
        things: 'things',
        foo: 'foo',
        bar: 'bar'
      },

      subviews: function() {
        return [
          {render: renderSpy}
        ];
      },

      things: jasmine.createSpy('things'),
      foo: jasmine.createSpy('foo'),
      bar: jasmine.createSpy('bar')
    });

    router = new Router(app, $el);
    location.hash = ''; // so that path triggering doesn't ruin test state
    history.start();
  });

  afterEach(function() {
    Backbone.history.stop();
    history.list = [];
  });

  describe('navigating modifications', function() {
    it("triggers a route:start event", function() {
      var eventCallback = jasmine.createSpy('route:start callback');
      router.on('route:start', eventCallback);

      router.navigate('#bar', {trigger: true});
      expect(eventCallback).toHaveBeenCalled();
    });

    it("calls the original function", function() {
      router.navigate('#things', {trigger: true});
      expect(router.things).toHaveBeenCalled();
    });

    it('adds history', function() {
      router.navigate('#',        {trigger: true});
      router.navigate('#things', {trigger: true});
      router.navigate('#foo',     {trigger: true});
      router.navigate('#bar',     {trigger: true});
      router.navigate('#things', {trigger: true});

      expect(router.history.list).toEqual(['things', 'foo', 'bar', 'things']);
    });

    it("back pops history and goes there", function() {
      router.history.list = ['things', 'foo', 'bar'];
      router.back();
      expect(router.history.list).toEqual(['things', 'foo']);
      expect(window.location).toMatch(/foo$/);
    });
  });

  describe('rendering', function() {
    it('renders all the subviews', function() {
      var renderSpy = jasmine.createSpy();
      router.render([{render: renderSpy}]);
      expect(renderSpy).toHaveBeenCalled();
    });

    it('calls afterRender', function() {
      spyOn(Router.prototype, 'afterRender');
      router.render([]);
      expect(Router.prototype.afterRender).toHaveBeenCalled();
    });

    describe('page', function() {
      it('clears and removes dom', function() {
        router.page([]);
        expect(router.$el.html()).toEqual("");
      });

      it('renders the subview', function() {
        var renderSpy = jasmine.createSpy();
        router.page([{render: renderSpy}]);
        expect(renderSpy).toHaveBeenCalled();
      });
    });
  });
});
