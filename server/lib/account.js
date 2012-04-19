(function() {
  var Account, billing, winston,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  billing = require('./billing');

  winston = require('winston');

  Account = (function() {

    function Account(db, auth) {
      this.db = db;
      this.auth = auth;
      this.nextSequence = __bind(this.nextSequence, this);
      this.updateBalance = __bind(this.updateBalance, this);
      this.getCurrentBalance = __bind(this.getCurrentBalance, this);
      this.dbname = 'account_active';
      this.chargedb = 'charges';
      this.paymentdb = 'payments';
      this.debtor = 'debtor';
    }

    Account.prototype.get = function(username, cb) {
      var _this = this;
      return this.getAccount(username, function(accountnumber) {
        if (accountnumber != null) {
          return _this.db.query("select * from " + _this.dbname + " where account_num_a='" + accountnumber + "'", function(result) {
            return cb(result.rows[0]);
          });
        } else {
          return cb(null);
        }
      });
    };

    Account.prototype.getAccount = function(ssn, cb) {
      var _this = this;
      return this.db.query("select account_num from " + this.debtor + " where ssn='" + ssn + "'", function(query) {
        return cb(query.rows[0].account_num);
      });
    };

    Account.prototype.postCharge = function(params, cb) {
      var _this = this;
      return this.auth.getUsername(params.sessionid, function(username) {
        winston.info(username + ' username');
        return _this.getAccount(username, function(accountnumber) {
          winston.info(accountnumber);
          if (_this.isMoney(params.amount) && params.location !== '') {
            return _this.nextSequence(accountnumber, _this.chargedb, function(transnum) {
              var amount, date, values;
              winston.info(params.amount);
              amount = params.amount;
              winston.info(amount);
              date = _this.transDate(params.charge_date);
              values = "(" + accountnumber + "," + transnum + ",'" + date + "','$" + amount + "'," + params.location + ")";
              return _this.db.query("insert into " + _this.chargedb + " (account_num, charge_num, charge_date, charge_amount, location) VALUES " + values, function(result) {
                return _this.getCurrentBalance(accountnumber, function(oldbalance) {
                  var newbalance;
                  winston.info(oldbalance);
                  newbalance = Number(oldbalance) + Number(_this.getNumber(amount));
                  winston.info(newbalance);
                  return _this.updateBalance(newbalance, accountnumber, function(result) {
                    return cb(result);
                  });
                });
              });
            });
          } else {
            return cb('error need amount and location');
          }
        });
      });
    };

    Account.prototype.postPayment = function(params, cb) {
      var _this = this;
      return this.auth.getUsername(params.sessionid, function(username) {
        return _this.getAccount(username, function(accountnumber) {
          if (_this.isMoney(params.amount)) {
            return _this.nextSequence(accountnumber, _this.paymentdb, function(transnum) {
              var amount, date, values;
              amount = params.amount;
              date = _this.transDate(params.charge_date);
              values = "(" + accountnumber + "," + transnum + ",'" + date + "','$" + amount + "')";
              return _this.db.query("insert into " + _this.paymentdb + " (account_num, payment_num, payment_date, payment_amount) VALUES " + values, function(resutl) {
                return _this.getCurrentBalance(accountnumber, function(oldbalance) {
                  var newbalance;
                  newbalance = Number(oldbalance) - Number(_this.getNumber(amount));
                  return _this.updateBalance(newbalance, accountnumber, function(result) {
                    return cb(result);
                  });
                });
              });
            });
          } else {
            return cb('error need amount');
          }
        });
      });
    };

    Account.prototype.applyInterest = function(params, cb) {};

    Account.prototype.getBilling = function(params, cb) {};

    Account.prototype.getCurrentBalance = function(accountnumber, cb) {
      var _this = this;
      return this.db.query("select balance from " + this.dbname + " where account_num_a='" + accountnumber + "'", function(result) {
        var oldbalance;
        oldbalance = _this.getNumber(result.rows[0].balance);
        return cb(oldbalance);
      });
    };

    Account.prototype.updateBalance = function(newbalance, accountnumber, cb) {
      var _this = this;
      return this.db.query("update " + this.dbname + " set balance='$" + newbalance + "' where account_num_a='" + accountnumber + "'", function(result) {
        return cb('success');
      });
    };

    Account.prototype.transDate = function(date) {
      if (date !== void 0) {
        return new Date(date);
      } else {
        return new Date;
      }
    };

    Account.prototype.isMoney = function(input) {
      var a;
      a = Number(input);
      if (a !== Number.NaN) {
        return true;
      } else {
        return false;
      }
    };

    Account.prototype.getNumber = function(input) {
      var a;
      winston.info('input ' + input);
      a = input.replace('$', "");
      winston.info('a1 ' + a);
      a = a.replace(',', "");
      a = a.replace("'", "");
      winston.info('a2 ' + a);
      a = Number(a);
      return a.toFixed(2);
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
