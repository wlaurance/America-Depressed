(function() {
  var Profile, winston,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  winston = require('winston');

  Profile = (function() {

    function Profile(db, auth) {
      this.db = db;
      this.auth = auth;
      this.get = __bind(this.get, this);
      this.dbname = "customer";
      this.address = "address";
    }

    Profile.prototype.get = function(username, cb) {
      var _this = this;
      return this.db.query("select * from " + this.dbname + " where ssn='" + username + "'", function(result) {
        var customer;
        if (result.rows.length > 0) {
          customer = result.rows[0];
          return _this.db.query("select * from " + _this.address + " where zip='" + customer.zip + "'", function(result2) {
            var address;
            if (result2.rows.length > 0) {
              address = result2.rows[0];
              customer.city = address.city;
              customer.state = address.state;
              return cb(customer);
            } else {
              return cb(false);
            }
          });
        } else {
          return cb(false);
        }
      });
    };

    Profile.prototype.update = function(params, cb) {
      var _this = this;
      return this.auth.getUsername(params.sessionid, function(username) {
        var a, b, count, q;
        if (username === null || username === void 0) {
          cb('not logged int');
          return;
        }
        q = "update customer set ";
        count = 0;
        if (params.fn) {
          q = q + "first_name='" + params.fn + "' ";
          count++;
        }
        if (params.ln) {
          a = '';
          if (count > 0) a = ', ';
          count++;
          q = q + a + "last_name='" + params.ln + "' ";
        }
        if (params.zip) {
          b = '';
          if (count > 0) b = ', ';
          count++;
          q = q + b + "zip='" + params.zip + "' ";
        }
        q = q + "where ssn='" + username + "'";
        if (count > 0) {
          return _this.db.query(q, function(result) {
            return cb('updated customer info');
          });
        } else {
          return cb('no info to update');
        }
      });
    };

    return Profile;

  })();

  module.exports = Profile;

}).call(this);
