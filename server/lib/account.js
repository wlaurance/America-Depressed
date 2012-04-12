(function() {
  var Account;

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

    return Account;

  })();

  module.exports = Account;

}).call(this);
