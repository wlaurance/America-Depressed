(function() {
  var Admin, auth;

  auth = require('./auth');

  Admin = (function() {

    function Admin(db) {
      this.db = db;
      this.admindb = 'admin';
      this.address = 'address';
      this.session = new auth(this.db, this.admindb);
    }

    Admin.prototype.auth = function(user, pass, cb) {
      return this.session.login(user, pass, function(sessionid) {
        if (sessionid !== 'blah') {
          return cb(sessionid);
        } else {
          return cb(false);
        }
      });
    };

    Admin.prototype.check = function(sessionid, cb) {
      return this.session.check(sessionid, function(username) {
        return cb(username);
      });
    };

    Admin.prototype.logout = function(sessionid, cb) {
      return auth.logout(sessionid, function() {
        return cb();
      });
    };

    Admin.prototype.getAllZips = function(cb) {
      return this.db.query("select zip from " + this.address, function(result) {
        var zip, zips, _i, _len, _ref;
        zips = [];
        _ref = result.rows;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          zip = _ref[_i];
          zips.push(zip.zip);
        }
        return cb(zips);
      });
    };

    return Admin;

  })();

  module.exports = Admin;

}).call(this);
