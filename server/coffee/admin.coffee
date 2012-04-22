auth = require './auth'

class Admin
  constructor:(@db)->
    @admindb = 'admin'
    @address = 'address'
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
  
  logout:(sessionid, cb)->
    auth.logout sessionid, ->
      do cb

  getAllZips:(cb)->
    @db.query "select zip from " + @address, (result)->
      zips = []
      for zip in result.rows
        zips.push zip.zip
      cb zips

module.exports = Admin
