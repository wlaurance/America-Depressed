(function() {
  var Billing, singleton,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  singleton = require('./utils/singleton');

  Billing = (function(_super) {

    __extends(Billing, _super);

    function Billing() {}

    Billing.prototype.getBillFor = function(account_number, timewhen, cb) {};

    return Billing;

  })(singleton);

  module.exports = Billing.get();

}).call(this);
