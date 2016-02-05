var domSetup = require(__dirname + "/support/dom_helper")

describe('Helm.App', function() {
  var App, app;

  beforeEach(function (done) {
    domSetup(function () {
      spyOn(Backbone.history, 'start')
      done()
    })
  });

  afterEach(function() {
    Helm.history = undefined;
  });

  describe('extension', function() {
    it('comes with Views, Models, and ViewModels empty objects', function() {
      App = Helm.App.extend();
      expect(App.Models).toEqual({});
      expect(App.Views).toEqual({});
      expect(App.Templates).toEqual({});
      expect(App.Models).toEqual({});
    });

    it('adds addionial attributes to the class', function() {
      App = Helm.App.extend({foo: 'bar'});
      app = new App();
      expect(app.foo).toEqual('bar');
    });
  });

  describe('initialization', function() {
    describe('parent element', function() {
      var $el;

      beforeEach(function() {
        $el = $('<div>parent</div>');
        app = new App($el);
      });

      it('stores it as $el', function() {
        expect(app.$el).toBe($el);
      });

      it('stores it as $el', function() {
        expect(app.parent).toBe($el);
      });
    });
  });

  describe('start', function() {
    var router, RouterClass, $el;

    beforeEach(function() {
      App = Helm.App.extend();
      router = {hello: 'routes'};
      RouterClass = jasmine.createSpy('RouterClass').and.returnValue(router);
      $el = $('<div>app</div>');
    });

    describe('when history has been created and stored on Helm', function() {
      beforeEach(function() {
        Helm.history = {name: 'history', start: jasmine.createSpy()};
        app = new App();
        App.Router = RouterClass;
        app.start();
      });

      it('gets Helm.history when it exists', function() {
        expect(app.history).toEqual(Helm.history);
      });

      it('starts history, and expects that object to manage Backbone history starting only once', function() {
        expect(Helm.history.start).toHaveBeenCalled();
      });
    });

    describe('when history is not yet created for Helm', function() {
      beforeEach(function() {
        app = new App();
        App.Router = RouterClass;
        app.start();
      });

      it('creates it and sets it on the Helm global', function() {
        expect(Helm.history.constructor).toBe(Helm.History);
      });

      it('sets it on the app', function() {
        expect(app.history).toBe(Helm.history);
      });

      it('starts history', function() {
        expect(Backbone.history.start).toHaveBeenCalled();
      });
    });

    describe('when router class is overridden in a function', function() {
      var $el;

      beforeEach(function() {
        $el = $('<div>app</div>');

        App = Helm.App.extend({
          routerClass: function() {
            return RouterClass;
          }
        });

        app = new App($el);
        app.start();
      });

      it('builds one and attaches it to itself', function() {
        expect(RouterClass).toHaveBeenCalledWith(app, $el);
        expect(app.router).toEqual(router);
      });
    });

    describe('when router class exists at App.Router', function() {
      beforeEach(function() {
        app = new App($el);
        App.Router = RouterClass;
        app.start();
      });

      it('builds one and attaches it to itself', function() {
        expect(RouterClass).toHaveBeenCalledWith(app, $el);
        expect(app.router).toEqual(router);
      });
    });

    describe('when router class cannnot be found', function() {
      beforeEach(function() {
        app = new App($el);
      });

      it('raises an error', function() {
        expect(function() {
          app.start();
        }).toThrow();
      });
    });

    it('calls render', function() {
      App.Router = RouterClass;
      app = new App();
      spyOn(app, 'render');
      app.start();
      expect(app.render).toHaveBeenCalled();
    });

    describe('when there is a repository class defined on the App class', function() {
      var Repository, repository;

      beforeEach(function() {
        repository = {yo: 'data'};
        Repository = jasmine.createSpy().and.returnValue(repository);
        App.Repository = Repository;
        App.Router = RouterClass;
        app = new App();
      });

      it('should make and store the repository from the class', function() {
        app.start();
        expect(Repository).toHaveBeenCalled();
        expect(app.repository).toBe(repository);
        expect(app.router.repository).toBe(repository);
      });
    });

    describe('when there is a repository class defined on the instance', function() {
      var Repository, repository;

      beforeEach(function() {
        repository = {yo: 'data'};
        Repository = jasmine.createSpy().and.returnValue(repository);
        App.Router = RouterClass;
        app = new App();
        app.Repository = Repository;
      });

      it('should make and store the repository fro the class', function() {
        app.start();
        expect(Repository).toHaveBeenCalled();
        expect(app.repository).toBe(repository);
        expect(app.router.repository).toBe(repository);
      });
    });

    describe('when a repository is already defined on the instance', function() {
      var repository;

      beforeEach(function() {
        repository = {yo: 'data'};
        App.Router = RouterClass;
        app = new App();
        app.repository = repository;
      });

      it('should transfer it to the router', function() {
        app.start();
        expect(app.repository).toBe(repository);
        expect(app.router.repository).toBe(repository);
      });
    });
  });

  describe('render', function() {
    var subviews;
    beforeEach(function() {
      subviews = [
        {render: jasmine.createSpy('view1 render')},
        {render: jasmine.createSpy('view2 render')}
      ];

      App = Helm.App.extend({
        subviews: function() {
          return subviews;
        }
      });

      app = new App();
    });

    it('renders subviews', function() {
      app.render();
      _.each(subviews, function(subview) {
        expect(subview.render).toHaveBeenCalled();
      });
    });

    it('calls afterRender', function() {
      spyOn(app, 'afterRender');
      app.render();
      expect(app.afterRender).toHaveBeenCalled();
    });
  });
});

