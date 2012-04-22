journey = require "journey"
winston = require 'winston'
auth = require './auth'
profile = require './profile'
account = require './account'
admin = require './admin'
rewards = require './rewards'

exports.createRouter = (db)->
  auth = new auth db
  profile = new profile db
  account = new account db, auth
  admin = new admin db
  rewards = new rewards db, auth
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
            wrongCreds res

  router.path /\/profile/, ->
    @get().bind (res, params) ->
      auth.check params.sessionid, (username)->
        if username isnt false
          profile.get username, (p)->
            res.send 200, {}
              profile: p
        else
          notLoggedin res

    @get(/\/logout/).bind (res, params) ->
      res.send 200, {},
        message:'You have successfully logged out'

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

    @post(/\/payment/).bind (res, params)->
      auth.check params.sessionid, (user)->
        if user
          account.postPayment params, (message)->
            res.send 200, {},
              message:message
        else
          notLoggedin res

    @post(/\/charge/).bind (res, params)->
      auth.check params.sessionid, (user)->
        if user
          account.postCharge params, (message)->
            res.send 200, {},
              message
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

  router.path /\/rewards/, ->
    @get(/\/range/).bind (res, params)->
      rewards.getRange params, (r)->
        res.send 200, {},
          rewards: r
  
    @get(/\/specific/).bind (res,params)->
      rewards.getSpecific params, (r)->
        res.send 200, {},
          rewards: r

    @post(/\/account/).bind (res, params)->
      rewards.account params, (result)->
        res.send 200, {},
          rewards_account: result

    @post(/\/redeem/).bind (res, params)->
      rewards.redeem params, (result)->
        res.send 200, {},
          rewards_message: result

    @post(/\/redeemed/).bind (res, params)->
      rewards.redeemed params, (result)->
        res.send 200, {},
          rewards_earned: result

  router


needsCredentials = (res)->
  res.send 200, {},
    error_message:"Requires a username and password"

notLoggedin = (res)->
  res.send 200, {},
    error_message:"You are not logged in"

wrongCreds = (res)->
  res.send 200, {},
    error_message:"Incorrect username or password"


