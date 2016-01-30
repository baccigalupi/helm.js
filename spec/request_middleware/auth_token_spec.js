describe('Helm.RequestMiddleware.AuthToken', function() {
  var token, args;

  var transformedArguments = function (args) {
    var authorizer = new Helm.RequestMiddleware.AuthToken(args);
    return authorizer.perform();
  };

  beforeEach(function() {
    token = 'my-long-auth-token';
    Helm.RequestMiddleware.AuthToken.token = token
  });

  describe("GET requests", function() {
    beforeEach(function() {
      args = {
        url: '/foo?search=some-term',
        type: 'GET'
      };
    });

    it("leaves everything as is", function() {
      expect(transformedArguments(args)).toEqual(args);
    });
  });

  describe("DELETE", function() {
    beforeEach(function() {
      args = {
        url: '/my_resource',
        type: 'DELETE'
      };
    });

    it("adds the auth token to the url", function() {
      var url = transformedArguments(args).url;
      expect(url).toMatch(/\?authenticity_token=/)
    });
  });

  describe("other requests", function() {
    var data;
    describe("no data", function() {
      beforeEach(function() {
        args = {
          url: '/my_resource',
          type: 'PATCH'
        };
      });

      it("adds the auth token as the only data", function() {
        data = transformedArguments(args).data;
        expect(_.isString(data)).toBe(true);
        expect(JSON.parse(data).authenticity_token).toBe(token);
      });
    });

    describe("string data", function() {
      beforeEach(function() {
        args = {
          url: '/my_resource',
          type: 'PATCH',
          data: JSON.stringify({goo:'far'})
        };

        data = JSON.parse(transformedArguments(args).data);
      });

      it("maintains existing data", function() {
        expect(data.goo).toEqual('far');
      });

      it("adds the auth token", function() {
        expect(data.authenticity_token).toBe(token);
      });
    });

    describe("object data", function() {
      beforeEach(function() {
        args = {
          url: '/my_resource',
          type: 'PATCH',
          data: {goo:'far'}
        };

        data = JSON.parse(transformedArguments(args).data);
      });

      it("maintains existing data", function() {
        expect(data.goo).toEqual('far');
      });

      it("adds the auth token", function() {
        expect(data.authenticity_token).toBe(token);
      });
    });
  });
});
