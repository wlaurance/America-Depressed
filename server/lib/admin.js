(function() {
  var Admin, auth, money, winston,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  auth = require('./auth');

  money = require('./money');

  winston = require('winston');

  Admin = (function() {

    function Admin(db) {
      this.db = db;
      this.processDBClause = __bind(this.processDBClause, this);
      this.count = __bind(this.count, this);
      this.countacc = __bind(this.countacc, this);
      this.sum = __bind(this.sum, this);
      this.min = __bind(this.min, this);
      this.max = __bind(this.max, this);
      this.avg = __bind(this.avg, this);
      this.admindb = 'admin';
      this.address = 'address';
      this.session = new auth(this.db, this.admindb);
      this.customerinfo = 'customer';
      this.accountinfo = 'account_active';
      this.accountinactive = 'account_inactive';
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
          return this.max('balance', params, this.accountinfo, cb);
        case 'max(credit_score)':
          return this.max('credit_score', params, this.customerinfo, cb);
        case 'min(balance)':
          return this.min('balance', params, this.accountinfo, cb);
        case 'min(credit_score)':
          return this.min('credit_score', params, this.customerinfo, cb);
        case 'sum(balance)':
          return this.sum('balance', params, this.accountinfo, cb);
        case 'count(account_num)':
          return this.countacc('account_num', params, this.accountinfo, cb);
        default:
          return cb('not a valid function');
      }
    };

    Admin.prototype.avg = function(what, params, db, cb) {
      var _this = this;
      db = this.processDBClause(params, db, what === 'balance');
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
          if (what === 'balance') {
            return cb(money.make(avg));
          } else {
            return cb(avg);
          }
        });
      });
    };

    Admin.prototype.max = function(what, params, db, cb) {
      var _this = this;
      db = this.processDBClause(params, db, what === 'balance');
      return this.db.query("select max(" + what + ") from " + db, function(result) {
        return cb(result.rows[0].max);
      });
    };

    Admin.prototype.min = function(what, params, db, cb) {
      var _this = this;
      db = this.processDBClause(params, db, what === 'balance');
      return this.db.query("select min(" + what + ") from " + db, function(result) {
        return cb(result.rows[0].min);
      });
    };

    Admin.prototype.sum = function(what, params, db, cb) {
      var _this = this;
      db = this.processDBClause(params, db, what === 'balance');
      return this.db.query("select sum(" + what + ") from " + db, function(result) {
        return cb(result.rows[0].sum);
      });
    };

    Admin.prototype.countacc = function(what, params, db, cb) {
      var _this = this;
      return this.count('account_num_a', params, this.accountinfo, function(count1) {
        return _this.count('account_num_i', params, _this.accountinactive, function(count2) {
          return cb(count1 + count2);
        });
      });
    };

    Admin.prototype.count = function(what, params, db, cb) {
      var _this = this;
      db = this.processDBClause(params, db, what === 'balance' || what === 'account_num_a' || what === 'account_num_i', what === 'account_num_i');
      return this.db.query("select count(" + what + ") from " + db, function(result) {
        return cb(result.rows[0].count);
      });
    };

    Admin.prototype.processDBClause = function(params, db, involvesAccounts, inactive) {
      var account, astr, bstr, cstr, genderspecific, statespecific, zipspecific;
      if (involvesAccounts == null) involvesAccounts = false;
      if (inactive == null) inactive = false;
      winston.info(JSON.stringify(params));
      genderspecific = false;
      statespecific = false;
      zipspecific = false;
      if (params.gender !== 'ALL') genderspecific = true;
      if (params.zip !== 'ALL') zipspecific = true;
      if (params.state !== 'ALL') {
        statespecific = true;
        zipspecific = false;
      }
      if (inactive) {
        account = 'account_inactive.account_num_i';
      } else {
        account = 'account_active.account_num_a';
      }
      astr = "customer, address where customer.zip = address.zip";
      bstr = "customer, debtor, address where customer.ssn = debtor.ssn and " + account + " = debtor.account_num and customer.zip = address.zip";
      cstr = "customer, debtor where customer.ssn = debtor.ssn and " + account + " = debtor.account_num";
      if (!genderspecific && !statespecific && !zipspecific) return db;
      if (genderspecific && statespecific && involvesAccounts) {
        return db + ", " + bstr + " and address.state='" + params.state + "' and customer.gender='" + params.gender + "'";
      }
      if (genderspecific && statespecific) {
        return astr + " and address.state='" + params.state + "' and customer.gender='" + params.gender + "'";
      }
      if (genderspecific && zipspecific && involvesAccounts) {
        return db + ", " + cstr + " and customer.zip ='" + params.zip + "' and customer.gender='" + params.gender + "'";
      }
      if (genderspecific && zipspecific) {
        return "customer where gender='" + params.gender + "' and zip='" + params.zip + "'";
      }
      if (genderspecific && involvesAccounts) {
        return db + ", " + cstr + " and customer.gender='" + params.gender + "'";
      }
      if (genderspecific) return "customer where gender='" + params.gender + "'";
      if (statespecific && involvesAccounts) {
        return db + ", " + bstr + " and address.state='" + params.state + "'";
      }
      if (statespecific) {
        return astr + " where address.state='" + params.state + "'";
      }
      if (zipspecific && involvesAccounts) {
        return db + ", " + bstr + " and customer.zip='" + params.zip + "'";
      }
      if (zipspecific) {
        return "customer where zip='" + params.zip + "'";
      } else {
        return db;
      }
    };

    return Admin;

  })();

  module.exports = Admin;

}).call(this);
