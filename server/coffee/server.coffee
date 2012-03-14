http = require 'http'
winston = require 'winston'

exports.createServer = (port)->
  server = http.createServer (request, response) =>
    data = ''
    winston.info 'Incoming Request', { url: request.url }

    request.on 'data', (chunk)->
        data += chunk

    response.writeHead 501, { 'Content-Type': 'application/json' }
    response.end JSON.stringify { message: 'not implemented' }
  if port
    server.listen port
  server

exports.start = (options, callback) ->
  server = exports.createServer options.port
  callback null, server