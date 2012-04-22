(function() {
  var Money, winston;

  winston = require('winston');

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
      var a;
      winston.info('input ' + input);
      if (input === null || input === void 0) return null;
      a = input.replace(/[$,]/g, '');
      a = Number(a);
      return a.toFixed(2);
    };

    return Money;

  })();

  module.exports = new Money();

}).call(this);
