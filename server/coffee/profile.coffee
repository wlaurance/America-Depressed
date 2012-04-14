winston = require 'winston'

class Profile
  constructor:(@db)->
    @dbname = "customer"
    @address = "address"

  get:(username, cb)=>
    @db.query "select * from " + @dbname + " where ssn='" + username + "'", (result) =>
      if result.rows.length > 0
        customer = result.rows[0]
        @db.query "select * from " + @address + " where zip='" + customer.zip + "'", (result2) =>
          if result2.rows.length > 0
            address = result2.rows[0]
            customer.city = address.city
            customer.state = address.state
            cb customer
          else
            cb false
      else
        cb false

module.exports = Profile
