(function() {
  var Admin, auth, money,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  auth = require('./auth');

  money = require('./money');

  Admin = (function() {

    function Admin(db) {
      this.db = db;
      this.avg = __bind(this.avg, this);
      this.admindb = 'admin';
      this.address = 'address';
      this.session = new auth(this.db, this.admindb);
      this.customerinfo = 'customer';
      this.accountinfo = 'account_active';
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

    Admin.prototype.dofunction = function(params, cb) {
      switch (params["function"]) {
        case 'avg(balance)':
          return this.avg('balance', params, this.accountinfo, cb);
        case 'avg(credit_score)':
          return this.avg('credit_score', params, this.customerinfo, cb);
        case 'max(balance)':
          return this.max('balance', params, cb);
        case 'max(credit_score)':
          return this.max('credit_score', params, cb);
        case 'min(balance)':
          return this.min('balance', params, cb);
        case 'min(credit_score)':
          return this.min('credit_score', params, cb);
        case 'sum(balance)':
          return this.sum('balance', params, cb);
        case 'count(account_num)':
          return this.count('account_num', params, cb);
        default:
          return cb('not a valid function');
      }
    };

    Admin.prototype.avg = function(what, params, db, cb) {
      var _this = this;
      return this.db.query("select sum(" + what + ") from " + db, function(result) {
        var sum;
        if (typeof result.rows[0].sum === 'number') {
          sum = result.rows[0].sum;
        } else {
          sum = money.getNumber(result.rows[0].sum);
        }
        return _this.db.query("select count(" + what + ") from " + db, function(result2) {
          var avg, count;
          count = result2.rows[0].count;
          avg = sum / count;
          return cb(avg);
        });
      });
    };

    return Admin;

  })();

  module.exports = Admin;

}).call(this);
