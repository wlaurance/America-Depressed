(function() {
  var DB, dns, pg, rl, winston,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  pg = require('pg');

  winston = require('winston');

  dns = require('dns');

  rl = require('readline');

  DB = (function() {

    function DB(password) {
      this.resolve = __bind(this.resolve, this);
      var i,
        _this = this;
      this.port = '5432';
      this.user = 'wslaur';
      i = rl.createInterface(process.stdin, process.stdout, null);
      i.question("Password? ", function(pass) {
        _this.pass = pass;
        return _this.resolve('bg6.cs.wm.edu', function() {
          _this.connect();
          i.close();
          return process.stdin.destroy();
        });
      });
    }

    DB.prototype.connect = function() {
      var _this = this;
      this.connString = 'tcp://' + this.user + ':' + this.pass + '@' + this.host + '/postgres';
      winston.info(this.connString);
      return pg.connect(this.connString, function(err, client) {
        _this.client = client;
        if (err) throw err;
        return winston.info(JSON.stringify(_this.client));
      });
    };

    DB.prototype.resolve = function(hostname, cb) {
      var _this = this;
      return dns.resolve4(hostname, function(err, adds) {
        if (err) throw err;
        _this.host = adds[0];
        return cb();
      });
    };

    return DB;

  })();

  exports.DB = DB;

}).call(this);
