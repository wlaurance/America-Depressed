(function() {
  var Rewards, winston,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  winston = require('winston');

  Rewards = (function() {

    function Rewards(db, auth) {
      this.db = db;
      this.auth = auth;
      this.getNextId = __bind(this.getNextId, this);
      this.updateAccount = __bind(this.updateAccount, this);
      this.updateReward = __bind(this.updateReward, this);
      this.updatePoints = __bind(this.updatePoints, this);
      this.getSpecific = __bind(this.getSpecific, this);
      this.merch = 'reward_merch';
      this.sweep = 'reward_sweep';
      this.reward_account = 'reward_account';
      this.rewards_earned = 'rewards_earned';
      this.earner = 'earner';
    }

    Rewards.prototype.getSpecific = function(params, cb) {
      var _this = this;
      if (params.id === '') {
        cb('');
        return;
      }
      if (params.type === 'sweep') {
        return this.db.query("select * from " + this.sweep + " where sweep_id=" + params.id + "", function(result) {
          return cb(result.rows[0]);
        });
      } else if (params.type === 'merch') {
        return this.db.query("select * from " + this.merch + " where merch_id=" + params.id + "", function(result) {
          return cb(result.rows[0]);
        });
      } else if (params.id !== '') {
        return this.db.query("select * from " + this.sweep + " where sweep_id=" + params.id + "", function(result) {
          if (result.rows.length > 0) cb(result.rows[0]);
          if (result.rows.length === 0) {
            return _this.db.query("select * from " + _this.merch + " where merch_id=" + params.id + "", function(result2) {
              return cb(result2.rows[0]);
            });
          }
        });
      } else {
        return cb('');
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

    Rewards.prototype.getAll = function(params, cb) {
      var _this = this;
      if (params.type === 'm') {
        return this.db.query("select * from " + this.merch, function(merch) {
          return cb(merch.rows);
        });
      } else if (params.type === 's') {
        return this.db.query("select * from " + this.sweep, function(sweep) {
          return cb(sweep.rows);
        });
      } else {
        return this.db.query("select * from " + this.merch, function(merch) {
          merch = merch.rows;
          return _this.db.query("select * from " + _this.sweep, function(sweep) {
            var s, _i, _len, _ref;
            _ref = sweep.rows;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              s = _ref[_i];
              merch.push(s);
            }
            return cb(merch);
          });
        });
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

    Rewards.prototype.updatePoints = function(params, cb) {
      var _this = this;
      return this.account(params, function(reward_account) {
        return _this.db.query("update " + _this.reward_account + " set points='" + (Number(reward_account.points) + Number(params.points)) + "' where acct_id='" + reward_account.acct_id + "'", function(result) {
          return cb(result);
        });
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
              _this.updateReward(reward, function(result) {
                return winston.info('updated reward ' + JSON.stringify(reward));
              });
              return cb(result.message);
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

    Rewards.prototype.redeemed = function(params, cb) {
      var _this = this;
      return this.db.query("select reward_id from " + this.rewards_earned + " where acct_id='" + params.acct_id + "'", function(result) {
        var getreward, r, redeemed, reward_list, _i, _len, _results;
        reward_list = result.rows;
        redeemed = [];
        if (reward_list.length === 0) {
          cb('none');
          return;
        }
        getreward = function(id, cb2) {
          var p;
          p = {
            type: (id < 500 ? 'sweep' : 'merch'),
            id: id
          };
          return _this.getSpecific(p, function(reward) {
            return cb2(reward);
          });
        };
        _results = [];
        for (_i = 0, _len = reward_list.length; _i < _len; _i++) {
          r = reward_list[_i];
          _results.push(getreward(r.reward_id, function(rinfo) {
            redeemed.push(rinfo);
            if (redeemed.length === reward_list.length) return cb(redeemed);
          }));
        }
        return _results;
      });
    };

    Rewards.prototype.create = function(params, cb) {
      var cost, db, end_date, name, quantity, type,
        _this = this;
      if (params.type === 'merch') {
        quantity = params.quantity;
        if (!(quantity != null)) {
          cb('not enough info: rejected');
          return;
        }
        type = params.type;
        db = this.merch;
      } else {
        type = params.type;
        end_date = params.end_date || '5-30-2012';
        db = this.sweep;
      }
      name = params.name;
      cost = params.cost;
      if ((cost != null) && (name != null) && (type != null) && (db != null)) {
        return this.getNextId(db, function(nextid) {
          var values;
          if (db === _this.merch) {
            values = "values(" + nextid + ",'" + name + "'," + cost + ",'" + quantity + "')";
          } else {
            values = "values(" + nextid + ",'" + name + "'," + cost + "," + "'0'" + ",'" + end_date + "')";
          }
          return _this.db.query("insert into " + db + " " + values, function(result) {
            return cb(name + ' inserted');
          });
        });
      } else {
        return cb('not enough info: rejected');
      }
    };

    Rewards.prototype.getNextId = function(db, cb) {
      var id;
      id = db === this.merch ? 'merch_id' : 'sweep_id';
      return this.db.query("select max(" + id + ") from " + db, function(result) {
        return cb(result.rows[0].max + 1);
      });
    };

    Rewards.prototype.update = function(params, cb) {
      var db, id, ov, value, w;
      value = 'set';
      ov = value;
      if ((params.cost != null) && params.cost !== '') {
        if (value !== ov) value = value + ',';
        value = value + " cost='" + params.cost + "'";
      }
      if ((params.name != null) && params.name !== '') {
        if (value !== ov) value = value + ',';
        value = value + " name='" + params.name + "'";
      }
      if (params.type === 'merch') {
        db = this.merch;
        if ((params.quantity != null) && params.quantity !== '') {
          if (value !== ov) value = value + ',';
          value = value + " quantity='" + params.quantity + "'";
        }
      } else if (params.type === 'sweep') {
        db = this.sweep;
        if ((params.end_date != null) && params.end_date !== '') {
          if (value !== ov) value = value + ',';
          value = value + " end_date='" + params.end_date + "'";
        }
      } else {
        cb('nothing to update');
        return;
      }
      if (value !== ov && (params.id != null) && params.id !== '') {
        id = db === this.merch ? 'merch_id' : 'sweep_id';
        w = " where " + id + "=" + params.id + "";
        return this.db.query("update " + db + " " + value + w, function(result) {
          return cb('update ' + params.name);
        });
      } else {
        return cb('nothing to update');
      }
    };

    Rewards.prototype.getNextAcc = function(cb) {
      return this.db.query("select max(acct_id) from " + this.earner, function(result) {
        return cb(Number(result.rows[0].max) + 1);
      });
    };

    Rewards.prototype.createAcc = function(ssn, accnum, cb) {
      var _this = this;
      return this.db.query("insert into " + this.earner + " values('" + ssn + "', '" + accnum + "')", function(r) {
        return _this.db.query("insert into " + _this.reward_account + " values('" + accnum + "', '" + 10 + "', 'Y')", function(r2) {
          return cb('done');
        });
      });
    };

    return Rewards;

  })();

  module.exports = Rewards;

}).call(this);
