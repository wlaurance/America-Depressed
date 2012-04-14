(function() {
  var account, admin, auth, journey, needsCredentials, notLoggedin, profile, winston, wrongCreds;

  journey = require("journey");

  winston = require('winston');

  auth = require('./auth');

  profile = require('./profile');

  account = require('./account');

  admin = require('./admin');

  exports.createRouter = function(db) {
    var router;
    auth = new auth(db);
    profile = new profile(db);
    account = new account(db);
    admin = new admin(db);
    router = new journey.Router({
      strict: false,
      strictUrls: false,
      api: "basic"
    });
    router.path(/\/login/, function() {
      return this.post().bind(function(res, params) {
        if (!params.username || !params.password) {
          return needsCredentials(res);
        } else {
          return auth.login(params.username, params.password, function(sessionid) {
            if (sessionid !== 'blah') {
              return res.send(200, {}, {
                token: sessionid
              });
            } else {
              return wrongCreds(res);
            }
          });
        }
      });
    });
    router.path(/\/profile/, function() {
      this.get().bind(function(res, params) {
        return auth.check(params.sessionid, function(username) {
          if (username !== false) {
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
      return this.get(/\/logout/).bind(function(res, params) {
        return auth.logout(params.sessionid, function(value) {
          return res.send(200, {}, {
            message: 'You have successfully logged out'
          });
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
    router.path(/\/admin/, function() {
      return this.post().bind(function(res, params) {
        if (!params.username || !params.password) needsCredentials(res);
        return admin.auth(params.username, params.password, function(adminsession) {
          if (adminsession) {
            return res.send(200, {}, {
              admintoken: adminsession
            });
          } else {
            return needsCredentials(res);
          }
        });
      });
    });
    return router;
  };

  needsCredentials = function(res) {
    return res.send(200, {}, {
      error_message: "Requires a username and password"
    });
  };

  notLoggedin = function(res) {
    return res.send(200, {}, {
      error_message: "You are not logged in"
    });
  };

  wrongCreds = function(res) {
    return res.send(200, {}, {
      error_message: "Incorrect username or password"
    });
  };

}).call(this);
