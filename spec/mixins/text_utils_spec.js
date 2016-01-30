describe('Helm.Mixins.TextUtils', function() {
  describe('camelize', function() {
    it('converts a single word to title cased', function() {
      expect(Helm.Mixins.TextUtils.camelize('foo')).toBe('Foo');
    });

    it('translates an underscore before a letter to a capitalized letter', function() {
      expect(Helm.Mixins.TextUtils.camelize('foo_bar')).toBe('FooBar');
    });
  });

  describe('underscore', function() {
    it("converts a title case word to lowercase", function() {
      expect(Helm.Mixins.TextUtils.underscore('Foo')).toBe('foo');
    });

    it("converts a camelized letter to an underscore and the lowercase letten", function() {
      expect(Helm.Mixins.TextUtils.underscore('FooBar')).toBe('foo_bar');
    });
  });

  describe('shorten', function() {
    it('should shorten text that it is provided', function() {
      var text = 'hello my name is something';
      var shortened = Helm.Mixins.TextUtils.shorten(text, 10);
      expect(shortened).toBe('hello my n...');
    });

    it('fails gracefully with insufficient information', function() {
      expect(Helm.Mixins.TextUtils.shorten()).toBe(undefined);
    });
  });

  describe("stripTags", function () {
    it("should remove html tags", function() {
      var text = '<p><strong>Some text</strong> will be stripped</p>of tags.';
      expect(Helm.Mixins.TextUtils.stripTags(text)).toBe('Some text will be stripped of tags.');
    });
  });
});
