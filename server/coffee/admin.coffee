auth = require './auth'

class Admin
  constructor:(@db)->
    @admindb = 'admin'
    @session = new auth @db, @admindb

  auth:(user, pass, cb)->
    @session.login user, pass, (sessionid)->
      if sessionid isnt 'blah'
        cb sessionid
      else
        cb false

  check:(sessionid, cb)->
    @session.check sessionid, (username)->
      cb username

  getAllCustomers:()->

module.exports = Admin
