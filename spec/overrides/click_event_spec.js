describe('Helm.Overrides.ClickEvent', function() {
  describe('shouldOverride', function() {
    it('returns true when isTouch is true and isWindows is false', function() {
      spyOn(Helm.Overrides.ClickEvent, 'isTouch').and.returnValue(true);
      spyOn(Helm.Overrides.ClickEvent, 'isWindows').and.returnValue(false);

      expect(Helm.Overrides.ClickEvent.shouldOverride()).toEqual(true);
    });

    it('returns false when isTouch is true and isWindows is true', function() {
      spyOn(Helm.Overrides.ClickEvent, 'isTouch').and.returnValue(true);
      spyOn(Helm.Overrides.ClickEvent, 'isWindows').and.returnValue(true);

      expect(Helm.Overrides.ClickEvent.shouldOverride()).toEqual(false);
    });

    it('return false when isTouch is false', function() {
      spyOn(Helm.Overrides.ClickEvent, 'isTouch').and.returnValue(false);
      spyOn(Helm.Overrides.ClickEvent, 'isWindows').and.returnValue(false);

      expect(Helm.Overrides.ClickEvent.shouldOverride()).toEqual(false);
    });
  });

  describe("normalizeListeners", function() {
    var listeners;

    beforeEach(function() {
      listeners = {
        'click .thing': 'myMethod',
        'keyup input': 'catcher'
      };
    });

    describe('when shouldOverride is false', function() {
      beforeEach(function() {
        spyOn(Helm.Overrides.ClickEvent, 'shouldOverride').and.returnValue(false);
      });

      it('returns the same hash', function() {
        expect(Helm.Overrides.ClickEvent.normalizeListeners(listeners)).toEqual(listeners);
      });
    });

    describe('when shouldOverride is true', function() {
      beforeEach(function() {
        spyOn(Helm.Overrides.ClickEvent, 'shouldOverride').and.returnValue(true);
      });

      it("should replace 'click' with 'touchstart'", function() {
        expect(Helm.Overrides.ClickEvent.normalizeListeners(listeners)['touchstart .thing']).toEqual('myMethod');
        expect(Helm.Overrides.ClickEvent.normalizeListeners(listeners)['click .thing']).toBe(undefined);
      });
    });
  });
});
