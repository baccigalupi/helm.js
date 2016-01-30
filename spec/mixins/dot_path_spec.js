describe('Helm.Mixins.DotPath', function() {
  var object;
  beforeEach(function() {
    object = {
      top: 'hat',
      nest: {
        eggs: ['chick', 'chuck', 'goose']
      }
    };
  });

  it('finds top level values', function() {
    expect(Helm.Mixins.DotPath.find(object, 'top')).toEqual('hat');
  });

  it('finds nested values', function() {
    expect(Helm.Mixins.DotPath.find(object, 'nest.eggs')).toEqual(object.nest.eggs);
  });

  it('returns something falsey when a top level key is not found', function() {
    expect(Helm.Mixins.DotPath.find(object, 'gerbil')).toEqual(undefined);
  });

  it('returns something falsey when a nested query key is not found', function() {
    expect(Helm.Mixins.DotPath.find(object, 'gerbil.fish.monster')).toEqual(undefined);
  });
});
