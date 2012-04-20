(function() {
  var Rewards, winston;

  winston = require('winston');

  Rewards = (function() {

    function Rewards(db) {
      this.db = db;
      this.merch = 'reward_merch';
      this.sweep = 'reward_sweep';
    }

    Rewards.prototype.getSpecific = function(params, cb) {
      if (params.type === 'sweep') {
        return this.db.query("select * from " + this.sweep + " where sweep_id=" + params.id + "", function(result) {
          return cb(result.rows[0]);
        });
      } else if (params.type === 'merch') {
        return this.db.query("select * from " + this.merch + " where merch_id=" + params.id + "", function(result) {
          return cb(result.rows[0]);
        });
      } else {
        return cb(params.type);
      }
    };

    Rewards.prototype.getRange = function(params, cb) {
      var lower, upper;
      upper = Number(params.upper);
      lower = String(upper - 100);
      if (params.type === 'sweep') {
        return this.db.query("select * from " + this.sweep + " where cost <=" + upper + " and cost >" + lower, function(result) {
          return cb(result.rows);
        });
      } else if (params.type === 'merch') {
        winston.info(upper - 100);
        return this.db.query("select * from " + this.merch + " where cost <=" + upper + " and cost >" + lower, function(result) {
          return cb(result.rows);
        });
      } else {
        return cb(params.type);
      }
    };

    return Rewards;

  })();

  module.exports = Rewards;

}).call(this);
