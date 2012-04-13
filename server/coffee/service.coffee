journey = require "journey"
winston = require 'winston'
auth = require './auth'
profile = require './profile'
account = require './account'
admin = require './admin'

exports.createRouter = (db)->
  auth = new auth db
  profile = new profile db
  account = new account db
  admin = new admin db
  router = new (journey.Router)(
    strict: false
    strictUrls: false
    api: "basic"
  )
  router.path /\/login/, ->
    @post().bind (res, params) ->
      if not params.username or not params.password
        needsCredentials res
      else
        auth.login params.username, params.password, (sessionid)->
          if sessionid isnt 'blah'
            res.send 200, {},
              token: sessionid
          else
            notLoggedin res

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

  router.path /\/admin/, ->
    @post().bind (res,params)->
      if not params.username or not params.password
        needsCredentials res
      admin.auth params.username, params.password, (adminsession)->
        if adminsession
          res.send 200, {},
            admintoken: adminsession
        else
          needsCredentials res
  router


needsCredentials = (res)->
  res.send 200, {},
    error_message:"Requires a username and password"

notLoggedin = (res)->
  res.send 200, {},
    error_message:"You are not logged in"


