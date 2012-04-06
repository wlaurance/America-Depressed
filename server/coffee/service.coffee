journey = require "journey"
auth = require './auth'
profile = require './profile'

exports.createRouter = (db)->
  auth = new auth db
  profile = new profile db
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
        if username isnt false
          profile.get username
          res.send 200, {},
            profile: "hdhf"
        else
          res.send 200, {},
            error_message:"You are not logged in"


  router.path /\/time/, ->
    @get().bind (res) ->
      db.query "SELECT NOW() as when", (result)->
        res.send 200, {},
          hello: result.rows[0].when


  router
