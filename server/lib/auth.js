(function() {
  var Authentication, crypto, winston;

  winston = require('winston');

  crypto = require('crypto');

  Authentication = (function() {

    function Authentication(db) {
      this.db = db;
      this.dbname = 'testlogin';
      this.sessionids = {};
    }

    Authentication.prototype.login = function(user, pass, cb) {
      var _this = this;
      return this.db.query('select * from ' + this.dbname + " where username = '" + user + "'", function(result) {
        var h, hp;
        winston.info(JSON.stringify(result));
        h = _this.hash();
        h.update(pass, 'utf-8');
        hp = h.digest('hex');
        if (result.rows.length > 0) {
          if (hp === result.rows[0].password) {
            return cb(_this.sessionid(result.rows[0]));
          } else {
            return cb('blah');
          }
        } else {
          return cb('blah');
        }
      });
    };

    Authentication.prototype.sessionid = function(info) {
      var h, sid;
      h = this.hash();
      h.update(info.password + info.username + (new Date).toString(), 'utf-8');
      sid = h.digest('hex');
      this.sessionids[sid] = info.username;
      return sid;
    };

    Authentication.prototype.check = function(sessionid, cb) {
      winston.info(sessionid);
      return cb(this.sessionids[sessionid]);
    };

    Authentication.prototype.hash = function() {
      var hash;
      return hash = crypto.createHash('sha1');
    };

    return Authentication;

  })();

  module.exports = Authentication;

}).call(this);
