describe('Helm.ViewModel', function() {
  var viewModel;

  describe("when not initialized with an object to present", function() {
    beforeEach(function() {
      viewModel = new Helm.ViewModel();
    });

    it("toJSON returns an empty object", function() {
      expect(viewModel.toJSON()).toEqual({});
    });
  });

  describe("when initialized with something that converts to json", function() {
    var json;

    beforeEach(function() {
      json = { can: 'be jsoned'};
      presented = {
        toJSON: function () {
          return json;
        }
      };

      viewModel = new Helm.ViewModel(presented);
    });

    it("return the json", function() {
      expect(viewModel.toJSON()).toBe(json);
    });
  });

  describe("when initialized with a plain old json object", function() {
    var json;
    beforeEach(function() {
      json = {plain: 'old'};
    });

    it("returns the object", function() {
      viewModel = new Helm.ViewModel(json);
      expect(viewModel.toJSON()).toBe(json);
    });
  });

  describe('extendability', function () {
    var ViewModel;

    beforeEach(function() {
      ViewModel = Helm.ViewModel.extend({
        init: function() {
          this.initCalled = true;
        }
      });
    });

    it('calls init on creation', function() {
      viewModel = new ViewModel();
      expect(viewModel.initCalled).toEqual(true);
    });
  });

  describe("added properties", function() {
    var ViewModelClass, viewModel, model, json;

    beforeEach(function() {
      ViewModelClass = Helm.ViewModel.extend({
        include: ['nail_polish', 'scoff'],

        nail_polish: function() {
          return 'SocialCoder OO FrontEnd';
        },

        scoff: true
      });
    });

    describe("new attributes", function() {
      beforeEach(function() {
        model = {};
        viewModel = new ViewModelClass(model);
        json = viewModel.toJSON();
      });

      it("adds things that are attributes", function() {
        expect(json.scoff).toBe(true);
      });

      it("adds things that are functions", function() {
        expect(json.nail_polish).toBe('SocialCoder OO FrontEnd');
      });
    });

    describe("overriden attributes", function() {
      beforeEach(function() {
        model = {scoff: 'not so much'};
        viewModel = new ViewModelClass(model);
        json = viewModel.toJSON();
      });

      it("uses the included calculated values over the model values", function() {
        expect(json.scoff).toBe(true);
      });
    });
  });
});
