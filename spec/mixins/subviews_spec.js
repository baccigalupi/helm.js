describe("Helm.Mixins.Subviews", function() {
  var SubviewContainer, subviews, subviewManager;

  beforeEach(function() {
    subviews = [
      {
        render: jasmine.createSpy('render 1'),
        parent: {hello: 'parent'},
        repository: {some: 'stuff'},
        templates:  {got: '<div>templates</div>'},
        viewModelClasses: {ViewModelUno: 'viewModel class here'},
        remove: jasmine.createSpy('remove 1')
      },
      {
        render: jasmine.createSpy('render 2'),
        remove: jasmine.createSpy('remove 2')
      }
    ]

    SubviewContainer = function() {};
    _.extend(SubviewContainer.prototype, Helm.Mixins.Subviews);
    subviewManager = new SubviewContainer();
  });

  describe('renderEach', function() {
    beforeEach(function() {
      subviewManager.repository = {hey: 'data'};
      subviewManager.templates  = {hello: 'templates'};
      subviewManager.viewModelClasses = {ViewModelUno: 'viewModel class here'}
      subviewManager.renderEach(subviews);
    });

    it('sets the parent to the subview manager to itself when subview has no parent', function() {
      expect(subviews[1].parent).toEqual(subviewManager);
    });

    it('does not change the view parent if it has one', function() {
      expect(subviews[0].parent).toEqual({hello: 'parent'});
    });

    it('sets the repository of the subview to that of the parent when none exists', function() {
      expect(subviews[1].repository).toEqual(subviewManager.repository);
    });

    it('leave the repository as is when subview has one', function() {
      expect(subviews[0].repository).toEqual({some: 'stuff'});
    });

    it('sets the templates of the subview to that of the parent when none exists', function() {
      expect(subviews[1].templates).toEqual(subviewManager.templates);
    });

    it('leave the repository as is when subview has one', function() {
      expect(subviews[0].templates).toEqual({got: '<div>templates</div>'});
    });

    it('sets the templates of the subview to that of the parent when none exists', function() {
      expect(subviews[1].viewModelClasses).toEqual(subviewManager.viewModelClasses);
    });

    it('leave the repository as is when subview has one', function() {
      expect(subviews[0].viewModelClasses).toEqual({ViewModelUno: 'viewModel class here'});
    });

    it('renders each view', function() {
      _.each(subviews, function(view) {
        expect(view.render).toHaveBeenCalled();
      });
    });
  });

  describe('remove', function() {
    it('calls hook, removeSelf', function() {
      var removeSelf = jasmine.createSpy();
      subviewManager.removeSelf = removeSelf;
      subviewManager.remove();
      expect(removeSelf).toHaveBeenCalled();
    });

    it('calls remove on each subview', function() {
      subviewManager._subviews = subviews;
      subviewManager.remove();
      _.each(subviews, function(view) {
        expect(view.remove).toHaveBeenCalled();
      });
    });
  });
});
