winston = require 'winston'

class Profile
  constructor:(@db)->
    @dbname = "testusers"

  get:(username, cb)->
    @db.query "select * from " + @dbname + " where username='" + username +"'", (result)->
      if result.rows > 0
        cb result.rows[0]
      else
        cb false

module.exports = Profile
