describe("Helm.View.ParentFinder", function() {
  var selector, parent, finder;

  beforeEach(function() {
    selector = '.find-me';
  });

  describe('when parent is undefined', function() {
    it("and selector is undefined it returns undefined", function() {
      finder = new Helm.View.ParentFinder(undefined, undefined);
      expect(finder.perform()).toBeUndefined();
    });

    describe('but there is a selector', function() {
      beforeEach(function() {
        finder = new Helm.View.ParentFinder(undefined, '#foo');
      });

      it('and the selector is globally available on the page', function() {
        var $parent = $('<div id="foo">bar</div>');
        $('body').append($parent);
        expect(finder.perform().attr('id')).toEqual('foo');

        $parent.remove();
      });

      it('and the selector is not available globally', function() {
        expect(finder.perform()).toBeUndefined();
      });
    });
  });

  describe("when the parent is a jqueryish thing)", function() {
    describe("but there is no selector", function() {
      beforeEach(function() {
        parent = $('<div></div>');

        finder = new Helm.View.ParentFinder(parent, undefined);
      });

      it("returns the parent", function() {
        expect(finder.perform()).toBe(parent);
      });
    });

    describe("and there is a selector", function() {
      describe("and the selector can be found inside the parent", function() {
        beforeEach(function() {
          parent = $('<div class="foo"><span class="find-me"></span></div>');

          finder = new Helm.View.ParentFinder(parent, selector);
        });

        it("returns the element", function() {
          expect(finder.perform().hasClass('find-me')).toBe(true);
        });
      });

      describe('and the selector is the same as the parent\'s selector', function() {
        beforeEach(function() {
          parent = $('<div class="find-me"></div>');

          finder = new Helm.View.ParentFinder(parent, selector);
        });

        it('returns the parent', function() {
          expect(finder.perform().hasClass('find-me')).toBe(true);
        });
      });

      describe("but the selector cannot be found", function() {
        beforeEach(function() {
          parent = $('<div class="foo"></div>');
          finder = new Helm.View.ParentFinder(parent, selector);
        });

        it("returns the undefined", function() {
          expect(finder.perform()).toBe(undefined);
        });
      });
    });
  });

  describe('when the parent has a $el', function() {
    var parent;
    beforeEach(function() {
      parent = {
        $el: $('<div class="parent"><div class="find-me"></div></div>')
      }
    });

    describe('when there is a selector', function () {
      describe('can be found', function() {
        beforeEach(function() {
          finder = new Helm.View.ParentFinder(parent, selector);
        });

        it('returns the selector\'s DOM', function () {
          expect(finder.perform().hasClass('find-me')).toBeTruthy();
        })
      });

      describe('cannot be found', function() {
        beforeEach(function() {
          finder = new Helm.View.ParentFinder(parent, '.something-else');
        });

        it('will return undefined', function() {
          expect(finder.perform()).toBeUndefined();
        });
      });
    });

    describe('when there is no selector', function() {
      it('returns the $el', function() {
        finder = new Helm.View.ParentFinder(parent, undefined);
        expect(finder.perform()).toBe(parent.$el);
      });
    });
  });
});

