http = require 'http'
winston = require 'winston'
service = require './service'

exports.createServer = (port)->
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
  server = exports.createServer options.port
  callback null, server