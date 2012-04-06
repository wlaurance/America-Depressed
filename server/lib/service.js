(function() {
  var auth, journey, profile;

  journey = require("journey");

  auth = require('./auth');

  profile = require('./profile');

  exports.createRouter = function(db) {
    var router;
    auth = new auth(db);
    profile = new profile(db);
    router = new journey.Router({
      strict: false,
      strictUrls: false,
      api: "basic"
    });
    router.path(/\/login/, function() {
      return this.post().bind(function(res, params) {
        if (!params.username || !params.password) {
          return res.send(200, {}, {
            error_message: "Requires a username and password"
          });
        } else {
          return auth.login(params.username, params.password, function(sessionid) {
            if (sessionid !== 'blah') {
              return res.send(200, {}, {
                token: sessionid
              });
            } else {
              return res.send(200, {}, {
                error_message: "Wrong username or password"
              });
            }
          });
        }
      });
    });
    router.path(/\/profile/, function() {
      return this.get().bind(function(res, params) {
        return auth.check(params.sessionid, function(username) {
          if (username !== false) {
            profile.get(username);
            return res.send(200, {}, {
              profile: "hdhf"
            });
          } else {
            return res.send(200, {}, {
              error_message: "You are not logged in"
            });
          }
        });
      });
    });
    router.path(/\/time/, function() {
      return this.get().bind(function(res) {
        return db.query("SELECT NOW() as when", function(result) {
          return res.send(200, {}, {
            hello: result.rows[0].when
          });
        });
      });
    });
    return router;
  };

}).call(this);
