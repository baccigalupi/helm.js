describe('Helm.View', function() {
  var View, view;

  describe('event overrides', function() {
    beforeEach(function() {
      spyOn(Helm.Overrides.ClickEvent, 'shouldOverride').and.returnValue(true);

      View = Helm.View.extend({
        config: {
          events: {
            'click .thing': 'myMethod'
          }
        }
      });

      view = new View();
    });

    it("events should override the 'click' with 'touchstart' using the ClickEvent overrides object", function() {
      expect(view.events()).toEqual({'touchstart .thing': 'myMethod'});
    });
  });

  describe('initialize', function() {
    it('calls init', function() {
      spyOn(Helm.View.prototype, 'init');
      new Helm.View();
      expect(Helm.View.prototype.init).toHaveBeenCalled();
    });

    it('sets a default attach method', function() {
      view = new Helm.View();
      expect(view.config.attach).toEqual('append');
    });

    it('does not overwrite existing attachVia method/attribute', function() {
      View = Helm.View.extend({
        config: {
          attach: 'something_dynamic'
        }
      });
      view = new View();
      expect(view.config.attach).toBe('something_dynamic');
    });
  });

  describe('viewModelClass', function() {
    var viewModelClasses;

    beforeEach(function() {
      viewModelClasses = {
        'ViewModel': 'ViewModel',
        'CustomViewModel': {'ChildViewModel': 'end goal'}
      };
    });

    it('finds the default viewModel', function() {
      view = new Helm.View();
      view.viewModelClasses = viewModelClasses;

      expect(view.viewModelClass()).toBe(viewModelClasses.ViewModel);
    });

    it('finds custom viewModel classes by attribute', function() {
      View = Helm.View.extend({
        config: {
          viewModel: 'CustomViewModel'
        }
      });

      view = new View();
      view.viewModelClasses = viewModelClasses;
      expect(view.viewModelClass()).toEqual(viewModelClasses.CustomViewModel);
    });

    it('finds nested viewModels', function() {
      View = Helm.View.extend({
        config: {
          viewModel: 'CustomViewModel.ChildViewModel'
        }
      });

      view = new View();
      view.viewModelClasses = viewModelClasses;
      expect(view.viewModelClass()).toEqual(viewModelClasses.CustomViewModel.ChildViewModel);
    });
  });

  describe('viewModel', function() {
    it('uses the model when present', function() {
      model = new Backbone.Model({foo: 'bar'});
      collection = new Backbone.Collection([{foo: 'some stuff'}]);
      view = new Helm.View({model: model, collection: collection});
      expect(view.viewModel()).toEqual(model.toJSON());
    });

    it('uses a collection when model not present', function() {
      collection = new Backbone.Collection([{foo: 'some stuff'}]);
      view = new Helm.View({collection: collection});
      expect(view.viewModel()).toEqual(collection.toJSON());
    });

    it('uses an empty hash when neither present', function() {
      view = new Helm.View();
      expect(view.viewModel()).toEqual({});
    });

    it('passes down the repository to the view model', function() {
      var CustomViewModel = Helm.ViewModel.extend({
        include: ['greeting'],

        greeting: function() {
          return this.repository.greeting;
        }
      });

      View = Helm.View.extend({
        config: {
          viewModel: 'CustomViewModel'
        }
      });

      view = new View();
      view.viewModelClasses = {CustomViewModel: CustomViewModel};
      view.repository = { greeting: 'hello there' };

      expect(view.viewModel()).toEqual({greeting: 'hello there'});
    });
  });

  describe('template', function() {
    var templates;

    beforeEach(function() {
      templates = {
        'foo.zardoz': 'template zardoz'
      };
    });

    it('finds custom viewModel classes by attribute', function() {
      View = Helm.View.extend({
        config: {
          template: 'foo.zardoz'
        }
      });

      view = new View();
      view.templates = templates;
      expect(view.template()).toEqual(templates['foo.zardoz']);
    });
  });

  describe('render', function() {
    it('includes the Subviews mixin', function() {
      view = new Helm.View();
      expect(_.isFunction(view.renderEach)).toBe(true);
    });

    describe('renderSubviews', function() {
      it('passes the subviews to the renderEach in the mixin', function() {
        view = new Helm.View();
        subviews = ['subviews'];

        spyOn(view, 'renderEach');
        spyOn(view, 'subviews').and.returnValue(subviews);
        view.renderSubviews();
        expect(view.renderEach).toHaveBeenCalledWith(subviews);
      });
    });

    describe('renderSelf', function() {
      beforeEach(function() {
        view = new Helm.View();
        view.$el.html($('<section>Whoa! emptiness ...</section>'));
        view.templates = {};
      });

      it('does nothing if a templates is not found', function() {
        view.renderSelf();
        expect(view.$el.text()).toEqual('Whoa! emptiness ...');
      });

      describe('when there is a template', function() {
        var templateSpy;

        beforeEach(function() {
          templateSpy = jasmine.createSpy();
          spyOn(view, 'template').and.returnValue({render: templateSpy});
          spyOn(view, 'viewModel').and.returnValue({hello: 'viewModel'});
          spyOn(view, 'partials').and.returnValue({partials: 'here'});
        });

        it('calls render on the template if it is found', function() {
          view.renderSelf();
          expect(templateSpy).toHaveBeenCalledWith({hello: 'viewModel'}, {partials: 'here'});
        });

        it('replaces the contents of the $el with the rendered content', function() {
          templateSpy.and.returnValue('<section>content</section>');
          view.renderSelf();
          expect(view.$el.text()).toEqual('content');
        });
      });
    });

    describe('attachToParent', function() {
      var finderSpy;

      beforeEach(function() {
        finderSpy = spyOn(Helm.View.ParentFinder.prototype, 'perform');
      });

      it('attaches to the found parent', function() {
        var attachSpy = jasmine.createSpy();
        finderSpy.and.returnValue({append: attachSpy});
        view = new Helm.View();
        view.attachToParent();
        expect(attachSpy).toHaveBeenCalledWith(view.el);
      });

      it('does not fail when the parent can\'t be found', function() {
        view = new Helm.View();
        expect(function() {
          view.attachToParent();
        }).not.toThrowError();
      });
    });

    describe('render', function() {
      var spies;
      beforeEach(function() {
        view = new Helm.View();
        spies = {
          renderSelf: spyOn(view, 'renderSelf'),
          renderSelf: spyOn(view, 'renderSubviews'),
          renderSelf: spyOn(view, 'attachToParent'),
          renderSelf: spyOn(view, 'afterRender')
        };

        view.render();
      });

      it('calls renderSelf', function() {
        expect(spies.renderSelf).toHaveBeenCalled();
      });

      it('calls renderSubviews', function() {
        expect(spies.renderSelf).toHaveBeenCalled();
      });

      it('calls attachToParent', function() {
        expect(spies.renderSelf).toHaveBeenCalled();
      });

      it('calls afterRender', function() {
        expect(spies.renderSelf).toHaveBeenCalled();
      });
    });
  });

  describe('removeSelf', function() {
    it('calls the Backbone.View underlying remove method', function() {
      spyOn(Backbone.View.prototype, 'remove');
      view = new Helm.View();
      view.removeSelf();
      expect(Backbone.View.prototype.remove).toHaveBeenCalled();
    });
  });
});
