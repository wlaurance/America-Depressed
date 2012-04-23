winston = require 'winston'

class Profile
  constructor:(@db, @auth)->
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


  update:(params, cb)->

    @auth.getUsername params.sessionid, (username)=>
      if username is null or username is undefined
        cb 'not logged int'
        return
      q = "update customer set "
      count = 0
      if params.fn
        q = q + "first_name='" + params.fn + "' "
        count++
      if params.ln
        a = ''
        if count > 0
          a = ', '
        count++
        q = q + a + "last_name='" + params.ln + "' "
      if params.zip
        b = ''
        if count > 0
          b = ', '
        count++
        q = q + b + "zip='" + params.zip + "' "

      q = q + "where ssn='" + username + "'"
      if count > 0
        @db.query q, (result)=>
          cb 'updated customer info'
      else
        cb 'no info to update'

module.exports = Profile
