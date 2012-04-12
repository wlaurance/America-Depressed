(function() {
  var account, auth, journey, notLoggedin, profile, winston;

  journey = require("journey");

  winston = require('winston');

  auth = require('./auth');

  profile = require('./profile');

  account = require('./account');

  exports.createRouter = function(db) {
    var router;
    auth = new auth(db);
    profile = new profile(db);
    account = new account(db);
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
          if (username) {
            return profile.get(username, function(p) {
              return res.send(200, {}, {
                profile: p
              });
            });
          } else {
            return notLoggedin(res);
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
    router.path(/\/account/, function() {
      return this.post().bind(function(res, params) {
        return auth.check(params.sessionid, function(username) {
          winston.info(username);
          if (username) {
            return account.get(username, function(a) {
              return res.send(200, {}, {
                account: a
              });
            });
          } else {
            return notLoggedin(res);
          }
        });
      });
    });
    return router;
  };

  notLoggedin = function(res) {
    return res.send(200, {}, {
      error_message: "You are not logged in"
    });
  };

}).call(this);
