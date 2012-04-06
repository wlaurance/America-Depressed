(function() {
  var DB, dns, pg, rl, winston,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  pg = require('pg');

  winston = require('winston');

  dns = require('dns');

  rl = require('readline');

  DB = (function() {

    function DB(opts) {
      var i,
        _this = this;
      this.opts = opts;
      this.resume = __bind(this.resume, this);
      this.resolve = __bind(this.resolve, this);
      this.connect = __bind(this.connect, this);
      winston.info(JSON.stringify(this.opts));
      this.port = '5432';
      this.user = this.opts.dbuser;
      if (!(this.opts.pass != null)) {
        if (process.env.PGPASSWORD != null) {
          this.pass = process.env.PGPASSWORD;
          this.resume();
        } else {
          i = rl.createInterface(process.stdin, process.stdout, null);
          i.question("Password? ", function(pass) {
            _this.pass = pass;
            _this.resume();
            i.close();
            return process.stdin.destroy();
          });
        }
      } else {
        this.pass = this.opts.pass;
        this.resume();
      }
    }

    DB.prototype.connect = function() {
      var _this = this;
      this.connString = 'tcp://' + this.user + ':' + this.pass + '@' + this.host + '/americadepressed';
      winston.info(this.connString);
      return pg.connect(this.connString, function(err, client) {
        if (err) throw err;
        return winston.info('Connected to db');
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

    DB.prototype.resume = function() {
      var _this = this;
      if (this.opts.dbhost !== 'localhost') {
        return this.resolve(this.opts.dbhost, function() {
          return _this.connect();
        });
      } else {
        this.host = this.opts.dbhost;
        return this.connect();
      }
    };

    DB.prototype.query = function(sql, cb) {
      var _this = this;
      return pg.connect(this.connString, function(err, client) {
        if (err) throw err;
        return client.query(sql, function(err, result) {
          if (err) throw err;
          return cb(result);
        });
      });
    };

    return DB;

  })();

  exports.DB = DB;

}).call(this);
