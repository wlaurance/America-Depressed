(function() {
  var Money, accounting, winston;

  winston = require('winston');

  accounting = require('accounting');

  Money = (function() {

    function Money() {}

    Money.prototype.isMoney = function(input) {
      var a;
      a = Number(input);
      if (a !== Number.NaN) {
        return true;
      } else {
        return false;
      }
    };

    Money.prototype.getNumber = function(input) {
      winston.info('input ' + input);
      if (input === null || input === void 0) return null;
      return accounting.unformat(input);
    };

    Money.prototype.make = function(input) {
      return accounting.formatMoney(input);
    };

    return Money;

  })();

  module.exports = new Money();

}).call(this);
