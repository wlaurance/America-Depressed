(function() {
  var Account, billing;

  billing = require('./billing');

  Account = (function() {

    function Account(db) {
      this.db = db;
      this.dbname = 'account_active';
    }

    Account.prototype.get = function(account_number, cb) {
      return this.db.query("select * from " + this.dbname + " where account_num_a='" + account_number + "'", function(result) {
        return cb(result.rows[0]);
      });
    };

    Account.prototype.postCharge = function(account_number, amount, cb) {};

    Account.prototype.postPayment = function(account_number, amount, cb) {};

    Account.prototype.applyInterest = function(account_number, interest, cb) {};

    Account.prototype.getBilling = function(account_number, forwhen, cb) {};

    return Account;

  })();

  module.exports = Account;

}).call(this);
