(function() {
  var Account, billing, winston,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  billing = require('./billing');

  winston = require('winston');

  Account = (function() {

    function Account(db) {
      this.db = db;
      this.nextSequence = __bind(this.nextSequence, this);
      this.dbname = 'account_active';
      this.chargedb = 'charges';
      this.debtor = 'debtor';
    }

    Account.prototype.get = function(username, cb) {
      var _this = this;
      return this.db.query("select account_num from " + this.debtor + " where ssn='" + username + "'", function(query) {
        var accountnumber;
        accountnumber = query.rows[0].account_num;
        if (accountnumber != null) {
          return _this.db.query("select * from " + _this.dbname + " where account_num_a='" + accountnumber + "'", function(result) {
            return cb(result.rows[0]);
          });
        } else {
          return cb(null);
        }
      });
    };

    Account.prototype.postCharge = function(params, cb) {
      var _this = this;
      if (params.accountnumber) {
        return this.nextSequence(params.accountnumber, this.chargedb, function(transnum) {
          var amount, values;
          amount = _this.formatMoney(params.amount);
          values = "(" + params.accountnumber + "," + transnum + ",'" + (new Date()).toUTCString() + "','" + amount + "','" + params.location + "')";
          return _this.db.query("insert into " + _this.chargedb + " (account_num, charge_num, charge_date, charge_amount, location) VALUES " + values, function(result) {
            return _this.db.query("select balance from " + _this.dbname + " where account_num_a='" + params.accountnumber + "'", function(result) {
              var newbalance, oldbalance;
              oldbalance = _this.deformatMoney(result.rows[0].balance);
              winston.info(Number(oldbalance) + Number(params.amount));
              newbalance = Number(oldbalance) + Number(params.amount);
              newbalance = _this.formatMoney(newbalance);
              winston.info(newbalance);
              return _this.db.query("update " + _this.dbname + " set balance='" + newbalance + "' where account_num_a='" + params.accountnumber + "'", function(result) {
                return cb('charge complete');
              });
            });
          });
        });
      } else {
        return cb('Need an accountnumber');
      }
    };

    Account.prototype.postPayment = function(params, cb) {};

    Account.prototype.applyInterest = function(params, cb) {};

    Account.prototype.getBilling = function(params, cb) {};

    Account.prototype.formatMoney = function(a) {
      a = Number(a);
      return '$' + a.toFixed(2);
    };

    Account.prototype.deformatMoney = function(a) {
      a = a.replace('$', '');
      a = a.replace(',', '');
      return a;
    };

    Account.prototype.nextSequence = function(accnum, db, cb) {
      var column;
      if (db === this.chargedb) {
        column = 'charge_num';
      } else {
        column = 'payment_num';
      }
      return this.db.query("select max(" + column + ") from " + db, function(result) {
        winston.info(JSON.stringify(result.rows[0]));
        return cb(Number(result.rows[0].max) + 1);
      });
    };

    return Account;

  })();

  module.exports = Account;

}).call(this);
