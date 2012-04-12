journey = require "journey"
winston = require 'winston'
auth = require './auth'
profile = require './profile'
account = require './account'
#billing = require './billing'


exports.createRouter = (db)->
  auth = new auth db
  profile = new profile db
  account = new account db
  router = new (journey.Router)(
    strict: false
    strictUrls: false
    api: "basic"
  )
  router.path /\/login/, ->
    @post().bind (res, params) ->
      if not params.username or not params.password
        res.send 200, {} ,
          error_message: "Requires a username and password"
      else
        auth.login params.username, params.password, (sessionid)->
          if sessionid isnt 'blah'
            res.send 200, {},
              token: sessionid
          else
            res.send 200, {},
              error_message:"Wrong username or password"


  router.path /\/profile/, ->
    @get().bind (res, params) ->
      auth.check params.sessionid, (username)->
        if username
          profile.get username, (p)->
            res.send 200, {}
              profile: p
        else
          notLoggedin res

  router.path /\/time/, ->
    @get().bind (res) ->
      db.query "SELECT NOW() as when", (result)->
        res.send 200, {},
          hello: result.rows[0].when


  router.path /\/account/, ->
    @post().bind (res,params)->
      auth.check params.sessionid, (username)->
        winston.info username
        if username
          account.get username, (a)->
            res.send 200, {},
              account:a
        else
          notLoggedin res
  router


notLoggedin = (res)->
  res.send 200, {},
    error_message:"You are not logged in"


