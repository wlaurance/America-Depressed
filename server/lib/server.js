(function() {
  var http, winston;

  http = require('http');

  winston = require('winston');

  exports.createServer = function(port) {
    var server,
      _this = this;
    server = http.createServer(function(request, response) {
      var data;
      data = '';
      winston.info('Incoming Request', {
        url: request.url
      });
      request.on('data', function(chunk) {
        return data += chunk;
      });
      response.writeHead(501, {
        'Content-Type': 'application/json'
      });
      return response.end(JSON.stringify({
        message: 'not implemented'
      }));
    });
    if (port) server.listen(port);
    return server;
  };

  exports.start = function(options, callback) {
    var server;
    server = exports.createServer(options.port);
    return callback(null, server);
  };

}).call(this);
