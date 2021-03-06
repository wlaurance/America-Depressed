winston = require 'winston'
crypto = require 'crypto'
class Authentication
  constructor: (@db, @dbname = 'online_account')->
    @sessionids = {}
  login: (user, pass, cb)->
    @db.query 'select * from ' + @dbname + " where username = '"+user+"'", (result) =>
      winston.info JSON.stringify result
      h = do @hash
      h.update pass, 'utf-8'
      hp = h.digest 'hex'
      if result.rows.length > 0
        if hp is result.rows[0].password
          cb (@sessionid result.rows[0])
        else
          cb 'blah'
      else
        cb 'blah'

  sessionid:(info)->
    h = do @hash
    h.update (info.password + info.username + do (new Date).toString), 'utf-8'
    sid = h.digest 'hex'
    @sessionids[sid] = info.username
    sid

  check: (sessionid, cb)->
    winston.info sessionid
    cb @sessionids[sessionid]

  hash:()->
    hash = crypto.createHash 'sha1'

  logout:(sessionid, cb)->
    winston.info JSON.stringify @sessionids
    if @sessionids[sessionid]
      @sessionids[sessionid] = undefined
      winston.info JSON.stringify @sessionids
    do cb

  getUsername:(sessionid, cb)->
    if @sessionids[sessionid]
      cb @sessionids[sessionid]
    else
      cb null

module.exports = Authentication
