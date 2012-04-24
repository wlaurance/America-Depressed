(function() {
  var account, admin, auth, journey, needsCredentials, notLoggedin, profile, rewards, winston, wrongCreds;

  journey = require("journey");

  winston = require('winston');

  auth = require('./auth');

  profile = require('./profile');

  account = require('./account');

  admin = require('./admin');

  rewards = require('./rewards');

  exports.createRouter = function(db) {
    var router;
    auth = new auth(db);
    profile = new profile(db, auth);
    rewards = new rewards(db, auth);
    account = new account(db, auth, rewards);
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
      this.get(/\/logout/).bind(function(res, params) {
        return auth.logout(params.sessionid, function() {
          return res.send(200, {}, {
            message: 'You have successfully logged out'
          });
        });
      });
      return this.get(/\/update/).bind(function(res, params) {
        return profile.update(params, function(c) {
          return res.send(200, {}, {
            message: c
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
      this.post().bind(function(res, params) {
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
      this.post(/\/payment/).bind(function(res, params) {
        return auth.check(params.sessionid, function(user) {
          if (user) {
            return account.postPayment(params, function(message) {
              return res.send(200, {}, {
                message: message
              });
            });
          } else {
            return notLoggedin(res);
          }
        });
      });
      this.post(/\/charge/).bind(function(res, params) {
        return auth.check(params.sessionid, function(user) {
          if (user) {
            return account.postCharge(params, function(message) {
              return res.send(200, {}, message);
            });
          } else {
            return notLoggedin(res);
          }
        });
      });
      this.get(/\/list/).bind(function(res, params) {
        return account.getAccounts(params, function(result) {
          return res.send(200, {}, {
            accounts: result
          });
        });
      });
      return this.get(/\/applyinterest/).bind(function(res, params) {
        return account.applyInterest(params, function(r) {
          return res.send(200, {}, {
            message: r
          });
        });
      });
    });
    router.path(/\/admin/, function() {
      this.post().bind(function(res, params) {
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
      this.get(/\/logout/).bind(function(res, params) {
        return admin.logout(params.sessionid, function() {
          return res.send(200, {}, {
            message: 'You are now logged out'
          });
        });
      });
      this.get(/\/zip/).bind(function(res) {
        return admin.getAllZips(function(zips) {
          return res.send(200, {}, {
            zip: zips
          });
        });
      });
      return this.post(/\/function/).bind(function(res, params) {
        return admin.dofunction(params, function(result) {
          return res.send(200, {}, {
            results: result
          });
        });
      });
    });
    router.path(/\/rewards/, function() {
      this.get(/\/range/).bind(function(res, params) {
        return rewards.getRange(params, function(r) {
          return res.send(200, {}, {
            rewards: r
          });
        });
      });
      this.get(/\/all/).bind(function(res, params) {
        return rewards.getAll(params, function(r) {
          return res.send(200, {}, {
            rewards: r
          });
        });
      });
      this.get(/\/specific/).bind(function(res, params) {
        return rewards.getSpecific(params, function(r) {
          return res.send(200, {}, {
            reward: r
          });
        });
      });
      this.post(/\/account/).bind(function(res, params) {
        return rewards.account(params, function(result) {
          return res.send(200, {}, {
            rewards_account: result
          });
        });
      });
      this.post(/\/redeem/).bind(function(res, params) {
        return rewards.redeem(params, function(result) {
          return res.send(200, {}, {
            rewards_message: result
          });
        });
      });
      this.post(/\/redeemed/).bind(function(res, params) {
        return rewards.redeemed(params, function(result) {
          return res.send(200, {}, {
            rewards_earned: result
          });
        });
      });
      this.post(/\/create/).bind(function(res, params) {
        return rewards.create(params, function(result) {
          return res.send(200, {}, {
            reward: result
          });
        });
      });
      return this.post(/\/update/).bind(function(res, params) {
        return rewards.update(params, function(result) {
          return res.send(200, {}, {
            reward: result
          });
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
