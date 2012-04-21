(function() {
  var Rewards, winston,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  winston = require('winston');

  Rewards = (function() {

    function Rewards(db, auth) {
      this.db = db;
      this.auth = auth;
      this.updateAccount = __bind(this.updateAccount, this);
      this.updateReward = __bind(this.updateReward, this);
      this.getSpecific = __bind(this.getSpecific, this);
      this.merch = 'reward_merch';
      this.sweep = 'reward_sweep';
      this.reward_account = 'reward_account';
      this.rewards_earned = 'rewards_earned';
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
        return this.db.query("select * from " + this.sweep + " where cost <=" + upper + " and cost >" + lower + " order by sweep_id", function(result) {
          return cb(result.rows);
        });
      } else if (params.type === 'merch') {
        winston.info(upper - 100);
        return this.db.query("select * from " + this.merch + " where cost <=" + upper + " and cost >" + lower + " order by merch_id", function(result) {
          return cb(result.rows);
        });
      } else {
        return cb(params.type);
      }
    };

    Rewards.prototype.account = function(params, cb) {
      var _this = this;
      return this.auth.getUsername(params.sessionid, function(username) {
        if (!username) {
          cb('error');
        } else {
          return _this.db.query("select acct_id from earner where ssn='" + username + "'", function(result) {
            return _this.db.query("select * from " + _this.reward_account + " where acct_id='" + result.rows[0].acct_id + "'", function(result) {
              return cb(result.rows[0]);
            });
          });
        }
      });
    };

    Rewards.prototype.redeem = function(params, cb) {
      var _this = this;
      winston.info(JSON.stringify(params));
      return this.auth.getUsername(params.sessionid, function(username) {
        if (!username) {
          cb('error');
        } else {
          return _this.getSpecific(params, function(reward) {
            var cost;
            cost = reward.cost;
            if (params.type === 'sweep') {
              reward.entries++;
            } else {
              reward.quantity--;
              if (reward.quantity < 0) {
                cb('Sorry, there are not enough of this item :(');
                return;
              }
            }
            return _this.updateAccount(params.acct_id, reward, function(result) {
              if (result.err === true) {
                cb(result.message);
                return;
              }
              return _this.updateReward(reward, function(result) {
                winston.info('updated reward ' + JSON.stringify(reward));
                return cb(result.message);
              });
            });
          });
        }
      });
    };

    Rewards.prototype.updateReward = function(reward, cb) {
      var _this = this;
      if (reward.merch_id != null) {
        return this.db.query("update " + this.merch + " set quantity='" + reward.quantity + "' where merch_id='" + reward.merch_id + "'", function(result) {
          return cb(result);
        });
      } else {
        return this.db.query("update " + this.sweep + " set entries='" + reward.entries + "'where sweep_id='" + reward.sweep_id + "'", function(result) {
          return cb(result);
        });
      }
    };

    Rewards.prototype.updateAccount = function(acct_id, reward, cb) {
      var rewardid,
        _this = this;
      rewardid = reward.merch_id || reward.sweep_id;
      return this.db.query("select points from " + this.reward_account + " where acct_id='" + acct_id + "'", function(account) {
        var error;
        if (reward.cost > account.rows[0].points) {
          cb(error = {
            err: true,
            message: 'Not enough points'
          });
          return;
        }
        return _this.db.query("select * from " + _this.rewards_earned + " where acct_id='" + acct_id + "' and reward_id='" + rewardid + "'", function(result) {
          if (result.rows.length > 0) {
            cb(error = {
              err: true,
              message: 'HEY!!!! You already redeemed this one!'
            });
            return;
          }
          return _this.db.query("update " + _this.reward_account + " set points='" + (account.rows[0].points - reward.cost) + "' where acct_id='" + acct_id + "'", function(r) {
            return _this.db.query("insert into " + _this.rewards_earned + " VALUES('" + acct_id + "','" + rewardid + "')", function(r2) {
              var success;
              return cb(success = {
                err: false,
                message: 'Congrats! Reward redeemed'
              });
            });
          });
        });
      });
    };

    return Rewards;

  })();

  module.exports = Rewards;

}).call(this);
