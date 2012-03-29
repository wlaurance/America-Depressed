http = require 'http'
winston = require 'winston'
service = require './service'
database = require './database'
exports.createServer = (port, database)->
  router = do service.createRouter
  server = http.createServer (request, response) =>
    body = ''
    winston.info 'Incoming Request', { url: request.url }

    request.on 'data', (chunk)->
      body += chunk

    request.on 'end', ->
      router.handle request, body, (route)->
        response.writeHead route.status, route.headers
        response.end route.body

  ###if port set it to listen####
  if port
    server.listen port
  server

exports.start = (options, callback) ->
  db = new database.DB options
  winston.info 'Creating db'
  callback null, exports.createServer options.port, db
