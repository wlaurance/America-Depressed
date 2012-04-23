journey = require "journey"
winston = require 'winston'
auth = require './auth'
profile = require './profile'
account = require './account'
admin = require './admin'
rewards = require './rewards'

exports.createRouter = (db)->
  auth = new auth db
  profile = new profile db, auth
  rewards = new rewards db, auth
  account = new account db, auth, rewards
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
      auth.logout params.sessionid, ->
        res.send 200, {},
          message:'You have successfully logged out'


    @get(/\/update/).bind (res, params)->
      profile.update params, (c)->
        res.send 200, {},
          message: c

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

    @get(/\/list/).bind (res, params)->
      account.getAccounts params, (result)->
        res.send 200, {},
          accounts: result

    @get(/\/applyinterest/).bind (res, params)->
      account.applyInterest params, (r)->
        res.send 200, {},
          message: r

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

    @get(/\/logout/).bind (res, params)->
      admin.logout params.sessionid, ->
        res.send 200, {},
          message: 'You are now logged out'

    @get(/\/zip/).bind (res)->
      admin.getAllZips (zips)->
        res.send 200, {},
          zip: zips

    @post(/\/function/).bind (res, params)->
      admin.dofunction params, (result)->
        res.send 200, {},
          results:result


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


