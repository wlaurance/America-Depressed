(function() {
  var Profile, winston;

  winston = require('winston');

  Profile = (function() {

    function Profile(db) {
      this.db = db;
      this.dbname = "customer";
    }

    Profile.prototype.get = function(username, cb) {
      return this.db.query("select * from " + this.dbname + " where username='" + username(+"'", function(result) {
        if (result.rows > 0) {
          return cb(result.rows[0]);
        } else {
          return cb(false);
        }
      }));
    };

    return Profile;

  })();

  module.exports = Profile;

}).call(this);
