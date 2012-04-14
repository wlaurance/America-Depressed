winston = require 'winston'

class Profile
  constructor:(@db)->
    @dbname = "customer"

  get:(username, cb)->
    @db.query "select * from " + @dbname + " where ssn='" + username +"'", (result)->
      if result.rows.length > 0
        cb result.rows[0]
      else
        cb false

module.exports = Profile
