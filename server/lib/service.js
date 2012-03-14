(function() {
  var journey;

  journey = require("journey");

  exports.createRouter = function() {
    var router;
    router = new journey.Router({
      strict: false,
      strictUrls: false,
      api: "basic"
    });
    router.path(/\/profile/, function() {
      this.get().bind(function(res) {
        return res.send(501, {}, {
          action: "list"
        });
      });
      this.get(/\/([\w|\d|\-|\_]+)/).bind(function(res, id) {
        return res.send(501, {}, {
          action: "show"
        });
      });
      this.post().bind(function(res, bookmark) {
        return res.send(501, {}, {
          action: "create"
        });
      });
      this.put(/\/([\w|\d|\-|\_]+)/).bind(function(res, profile) {
        return res.send(501, {}, {
          action: "update"
        });
      });
      return this.del(/\/([\w|\d|\-|\_]+)/).bind(function(res, id) {
        return res.send(501, {}, {
          action: "delete"
        });
      });
    });
    return router;
  };

}).call(this);
