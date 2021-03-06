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
      this.update = __bind(this.update, this);
      this.validateSSN = __bind(this.validateSSN, this);
      this.getValidAccountNumber = __bind(this.getValidAccountNumber, this);
      this.nextSequence = __bind(this.nextSequence, this);
      this.updateBalance = __bind(this.updateBalance, this);
      this.getCurrentBalance = __bind(this.getCurrentBalance, this);
      this.dbname = 'account_active';
      this.chargedb = 'charges';
      this.paymentdb = 'payments';
      this.debtor = 'debtor';
      this.accountinactive = 'account_inactive';
      this.customer = 'customer';
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

    Account.prototype.specific = function(params, cb, error) {
      var _this = this;
      if (!(params.acctnum != null) || params.acctnum === '') {
        error('no account num');
        return;
      }
      return this.db.query("select * from " + this.debtor + " where account_num='" + params.acctnum + "'", function(r1) {
        var ssn;
        if (!(r1.rows[0] != null) || r1.rows[0].ssn === '') {
          error('invalid ssn');
          return;
        }
        ssn = r1.rows[0].ssn;
        return _this.db.query("select * from " + _this.customer + " where ssn='" + ssn + "'", function(r2) {
          return cb(r2.rows[0]);
        });
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
                    amount = money.getNumber(amount);
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

    Account.prototype.create = function(params, cb, error) {
      var ccscore, firstname, gender, lastname, ssn, zip,
        _this = this;
      firstname = params.fn;
      lastname = params.ln;
      zip = params.zip;
      gender = params.gender;
      ccscore = params.credit_score;
      ssn = params.ssn;
      if (!(firstname != null) || firstname === '' || !(lastname != null) || lastname === '') {
        error('Need a name!!!!');
        return;
      }
      if (!(zip != null) || zip === '') {
        error('Need a zip');
        return;
      }
      if (!(gender != null) || gender === '') {
        error('Need a gender');
        return;
      }
      if (!(ccscore != null) || ccscore === '') {
        error('Need a credit score');
        return;
      }
      if (ccscore > 850 || ccscore < 300) {
        error('Credit score out of range');
        return;
      }
      if (!(ssn != null) || ssn === '') {
        error('Need a ssn?');
        return;
      }
      if (ssn.length > 9) {
        error('Too long of an ssn.');
        return;
      }
      if (ssn.length < 9) {
        error('Too short of an ssn.');
        return;
      }
      return this.getValidAccountNumber(function(accountnum) {
        return _this.validateSSN(ssn, error, function() {
          return _this.rewards.getNextAcc(function(rewardsnum) {
            return _this.getIR(ccscore, function(ir) {
              return _this.db.query("insert into " + _this.debtor + " values('" + ssn + "', '" + accountnum + "')", function(result1) {
                return _this.db.query("insert into " + _this.customer + " values('" + ssn + "', '" + firstname + "', '" + lastname + "', '" + gender + "','" + zip + "','" + ccscore + "')", function(result2) {
                  return _this.db.query("insert into " + _this.dbname + " values('" + accountnum + "', '" + '$0.00' + "', '" + (new Date()).toISOString() + "', '" + ir + "')", function(result3) {
                    return _this.rewards.createAcc(ssn, rewardsnum, function(r) {
                      return _this.db.query("insert into online_account values('" + ssn + "', 'cbfdac6008f9cab4083784cbd1874f76618d2a97')", function(result5) {
                        var account;
                        return cb(account = {
                          first_name: firstname,
                          last_name: lastname,
                          ssn: ssn,
                          credit_score: ccscore,
                          account_num: accountnum,
                          reward_account: rewardsnum,
                          balance: '$0.00'
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    };

    Account.prototype.getIR = function(credit, cb) {
      var interest, interestest, interestestst;
      interest = 0;
      if (credit > 299 && credit < 350) interest = 1.75;
      if (credit > 349 && credit < 400) interest = 1.70;
      if (credit > 399 && credit < 450) interest = 1.65;
      if (credit > 449 && credit < 500) interestest = 1.60;
      if (credit > 499 && credit < 550) interest = 1.55;
      if (credit > 549 && credit < 600) interest = 1.50;
      if (credit > 599 && credit < 650) interest = 1.45;
      if (credit > 649 && credit < 700) interest = 1.40;
      if (credit > 699 && credit < 750) interest = 1.35;
      if (credit > 749 && credit < 800) interestestst = 1.30;
      if (credit > 799 && credit < 851) interest = 1.25;
      return cb(interest);
    };

    Account.prototype.getValidAccountNumber = function(cb) {
      return this.db.query("select max(account_num) from " + this.debtor, function(result) {
        return cb(Number(result.rows[0].max) + 1);
      });
    };

    Account.prototype.validateSSN = function(ssn, error, cb) {
      var _this = this;
      return this.db.query("select ssn from customer where ssn='" + ssn + "'", function(result) {
        if (result.rows.length > 0) {
          error('Sorry ssn taken');
        } else {
          return cb('g2g');
        }
      });
    };

    Account.prototype.update = function(params, error, cb) {
      var _this = this;
      if (!params.acctnum || params.acctnum === '') {
        error('no account num');
        return;
      }
      return this.db.query("select ssn from " + this.debtor + " where account_num='" + params.acctnum + "'", function(result1) {
        var ov, ssn, value;
        if (result1.rows.length === 0) {
          error('no matching ssn');
          return;
        }
        ssn = result1.rows[0].ssn;
        value = 'set';
        ov = value;
        if ((params.fn != null) && params.fn !== '') {
          if (value !== ov) value = value + ',';
          value = value + " first_name='" + params.fn + "'";
        }
        if ((params.ln != null) && params.ln !== '') {
          if (value !== ov) value = value + ',';
          value = value + " last_name='" + params.ln + "'";
        }
        if ((params.zip != null) && params.zip !== '') {
          if (value !== ov) value = value + ',';
          value = value + " zip=" + params.zip + "";
        }
        if ((params.gender != null) && params.gender !== '') {
          if (value !== ov) value = value + ',';
          value = value + " gender='" + params.gender + "'";
        }
        if ((params.credit_score != null) && params.credit_score !== '') {
          if (value !== ov) value = value + ',';
          value = value + " credit_score='" + params.credit_score + "'";
        }
        if (value !== ov) {
          return _this.db.query("update " + _this.customer + " " + value + " where ssn='" + ssn + "'", function(result) {
            return cb('update ' + ssn);
          });
        } else {
          return cb('nothing to update');
        }
      });
    };

    return Account;

  })();

  module.exports = Account;

}).call(this);
