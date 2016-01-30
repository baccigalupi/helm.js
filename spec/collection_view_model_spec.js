describe("Helm.CollectionViewModel", function() {
  var viewModel, ViewModel, collection, json;

  beforeEach(function() {
    ViewModelClass = Helm.CollectionViewModel.extend({
      include: ['ancient_history', 'scoff'],

      ancientHistory: function() {
        return (this.presented.name || "") + ': ashes and dust';
      },

      scoff: true
    });
  });

  describe("when using a backbone collection", function() {
    beforeEach(function() {
      collection = new Backbone.Collection([{foo: 'foo'}, {bar: 'bar'}]);
      viewModel = new ViewModelClass(collection);

      json = viewModel.toJSON();
    });

    it("it can access the stuff", function() {
      expect(json.collection[0].foo).toEqual('foo');
      expect(json.collection[1].bar).toEqual('bar');
    });
  });

  describe("top level key", function() {
    describe("default", function() {
      beforeEach(function() {
        collection = [{foo: 'foo'}, {bar: 'bar'}];
        viewModel = new ViewModelClass(collection);

        json = viewModel.toJSON();
      });

      it("puts everything in a collection namespace", function() {
        expect(json.collection[0].foo).toEqual('foo');
        expect(json.collection[1].bar).toEqual('bar');
      });
    });

    describe("when false", function() {
      beforeEach(function() {
        ViewModelClass.prototype.rootKey = false;

        collection = [{foo: 'foo'}, {bar: 'bar'}];
        viewModel = new ViewModelClass(collection);

        json = viewModel.toJSON();
      });

      it("returns an array", function() {
        expect(json[0].foo).toBe('foo');
        expect(json[1].bar).toBe('bar');
      });
    });

    describe("custom name", function() {
      beforeEach(function() {
        ViewModelClass.prototype.rootKey = 'thingies';

        collection = [{foo: 'foo'}, {bar: 'bar'}];
        viewModel = new ViewModelClass(collection);

        json = viewModel.toJSON();
      });

      it("puts everything in that namespace", function() {
        expect(json.thingies[0].foo).toBe('foo');
        expect(json.thingies[1].bar).toBe('bar');
      });
    });
  });

  describe("inclusions", function() {
    describe("new attributes", function() {
      beforeEach(function() {
        collection = [{foo: 'foo', name: 'foo'}, {bar: 'bar', name: 'bar'}];
        ViewModelClass.prototype.rootKey = false;
        viewModel = new ViewModelClass(collection);
        json = viewModel.toJSON();
      });

      it("adds to each things that are attributes", function() {
        expect(json[0].scoff).toBe(true);
        expect(json[1].scoff).toBe(true);
      });

      it("adds things that are functions", function() {
        expect(json[0].ancient_history).toBe('foo: ashes and dust');
        expect(json[1].ancient_history).toBe('bar: ashes and dust');
      });
    });

    //describe("overriden attributes", function() {
      //beforeEach(function() {
        //model = {scoff: 'not so much'};
        //viewModel = new ViewModelClass(model);
        //json = viewModel.toJSON();
      //});

      //it("uses the included calculated values over the model values", function() {
        //expect(json.scoff).toBe(true);
      //});
    //});
  });
});
