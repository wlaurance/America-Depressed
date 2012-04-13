(function() {
  var Singleton;

  Singleton = (function() {

    function Singleton() {}

    Singleton.get = function() {
      var _ref;
      return (_ref = this.instance) != null ? _ref : this.instance = new this;
    };

    return Singleton;

  })();

  module.exports = Singleton;

}).call(this);
