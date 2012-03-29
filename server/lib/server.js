(function() {
  var database, http, service, winston;

  http = require('http');

  winston = require('winston');

  service = require('./service');

  database = require('./database');

  exports.createServer = function(port, database) {
    var router, server,
      _this = this;
    router = service.createRouter();
    server = http.createServer(function(request, response) {
      var body;
      body = '';
      winston.info('Incoming Request', {
        url: request.url
      });
      request.on('data', function(chunk) {
        return body += chunk;
      });
      return request.on('end', function() {
        return router.handle(request, body, function(route) {
          response.writeHead(route.status, route.headers);
          return response.end(route.body);
        });
      });
    });
    /*if port set it to listen
    */
    if (port) server.listen(port);
    return server;
  };

  exports.start = function(options, callback) {
    var db;
    db = new database.DB(options);
    winston.info('Creating db');
    return callback(null, exports.createServer(options.port, db));
  };

}).call(this);
