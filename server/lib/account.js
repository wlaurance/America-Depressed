(function() {
  var Account, billing, money, winston,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  billing = require('./billing');

  winston = require('winston');

  money = require('./money');

  Account = (function() {

    function Account(db, auth, rewards) {
      this.db = db;
      this.auth = auth;
      this.rewards = rewards;
      this.nextSequence = __bind(this.nextSequence, this);
      this.updateBalance = __bind(this.updateBalance, this);
      this.getCurrentBalance = __bind(this.getCurrentBalance, this);
      this.dbname = 'account_active';
      this.chargedb = 'charges';
      this.paymentdb = 'payments';
      this.debtor = 'debtor';
      this.accountinactive = 'account_inactive';
    }

    Account.prototype.get = function(username, cb) {
      var _this = this;
      return this.getAccount(username, function(accountnumber) {
        if (accountnumber != null) {
          return _this.db.query("select * from " + _this.dbname + " where account_num_a='" + accountnumber + "'", function(result) {
            if (result.rows.length === 0) {
              return _this.db.query("select * from " + _this.accountinactive + " where account_num_i='" + accountnumber + "'", function(result2) {
                return cb(result2.rows[0]);
              });
            } else {
              return cb(result.rows[0]);
            }
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
        return _this.getAccount(username, function(accountnumber) {
          if (money.isMoney(params.amount) && params.location !== '') {
            return _this.nextSequence(accountnumber, _this.chargedb, function(transnum) {
              var amount, date, values;
              amount = params.amount;
              if (Number(amount) <= 0) {
                cb('negative payment');
                return;
              }
              date = _this.transDate(params.charge_date);
              values = "(" + accountnumber + "," + transnum + ",'" + date + "','$" + amount + "'," + params.location + ")";
              return _this.db.query("insert into " + _this.chargedb + " (account_num, charge_num, charge_date, charge_amount, location) VALUES " + values, function(result) {
                return _this.getCurrentBalance(accountnumber, function(oldbalance) {
                  var newbalance;
                  newbalance = Number(oldbalance) + Number(money.getNumber(amount));
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
          if (money.isMoney(params.amount)) {
            return _this.nextSequence(accountnumber, _this.paymentdb, function(transnum) {
              var amount, date, values;
              amount = params.amount;
              date = _this.transDate(params.charge_date);
              values = "(" + accountnumber + "," + transnum + ",'" + date + "','$" + amount + "')";
              return _this.db.query("insert into " + _this.paymentdb + " (account_num, payment_num, payment_date, payment_amount) VALUES " + values, function(result) {
                return _this.getCurrentBalance(accountnumber, function(oldbalance) {
                  var newbalance;
                  newbalance = Number(oldbalance) - Number(money.getNumber(amount));
                  return _this.updateBalance(newbalance, accountnumber, function(result2) {
                    cb(result);
                    params.points = Math.floor(amount / 100);
                    return _this.rewards.updatePoints(params, function(r3) {});
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

    Account.prototype.applyInterest = function(params, cb) {
      var _this = this;
      return this.db.query("select * from " + this.dbname, function(result) {
        var account, accounts, count, newbalance, _i, _len, _results;
        accounts = result.rows;
        count = 1;
        _results = [];
        for (_i = 0, _len = accounts.length; _i < _len; _i++) {
          account = accounts[_i];
          newbalance = money.getNumber(account.balance) * Number(account.interest_rate);
          winston.info(newbalance - money.getNumber(account.balance));
          _results.push(_this.db.query("update " + _this.dbname + " set balance='" + (money.make(newbalance)) + "' where account_num_a='" + account.account_num_a + "'", function(result) {
            count++;
            if (count >= accounts.length) return cb('applied interest!');
          }));
        }
        return _results;
      });
    };

    Account.prototype.getBilling = function(params, cb) {};

    Account.prototype.getCurrentBalance = function(accountnumber, cb) {
      var _this = this;
      return this.db.query("select balance from " + this.dbname + " where account_num_a='" + accountnumber + "'", function(result) {
        var oldbalance;
        oldbalance = money.getNumber(result.rows[0].balance);
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

    Account.prototype.nextSequence = function(accnum, db, cb) {
      var column;
      if (db === this.chargedb) {
        column = 'charge_num';
      } else {
        column = 'payment_num';
      }
      return this.db.query("select max(" + column + ") from " + db + " where account_num='" + accnum + "'", function(result) {
        winston.info(JSON.stringify(result.rows[0]));
        return cb(Number(result.rows[0].max) + 1);
      });
    };

    Account.prototype.getAccounts = function(params, cb) {
      var db, dbaccount,
        _this = this;
      if (params.type === 'a') {
        db = this.dbname;
      } else if (params.type === 'i') {
        db = this.accountinactive;
      } else {
        db = 'both';
      }
      dbaccount = params.type === 'a' ? 'account_active.account_num_a' : 'account_inactive.account_num_i';
      if (db !== 'both') {
        return this.db.query("select * from " + db + ", debtor, customer where customer.ssn = debtor.ssn and debtor.account_num = " + dbaccount, function(result) {
          return cb(result.rows);
        });
      } else {
        return this.db.query("select * from account_active, debtor, customer where customer.ssn = debtor.ssn and debtor.account_num = account_active.account_num_a", function(result) {
          var aaccounts;
          aaccounts = result.rows;
          return _this.db.query("select * from account_inactive, debtor, customer where customer.ssn = debtor.ssn and debtor.account_num = account_inactive.account_num_i", function(result2) {
            var a, iaccounts, _i, _len;
            iaccounts = result2.rows;
            for (_i = 0, _len = iaccounts.length; _i < _len; _i++) {
              a = iaccounts[_i];
              aaccounts.push(a);
            }
            winston.info('aacounts length: ' + aaccounts.length);
            return cb(aaccounts);
          });
        });
      }
    };

    return Account;

  })();

  module.exports = Account;

}).call(this);
