(function() {
  var Admin, auth;

  auth = require('./auth');

  Admin = (function() {

    function Admin(db) {
      this.db = db;
      this.admindb = 'admin';
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

    Admin.prototype.getAllCustomers = function() {};

    return Admin;

  })();

  module.exports = Admin;

}).call(this);
