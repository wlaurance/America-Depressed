billing = require './billing'
winston = require 'winston'

class Account
  constructor:(@db, @auth)->
    @dbname = 'account_active'
    @chargedb = 'charges'
    @debtor = 'debtor'

  get:(username, cb)->
    @getAccount username, (accountnumber)=>
      if accountnumber?
        @db.query "select * from " + @dbname + " where account_num_a='" + accountnumber + "'" , (result) ->
          cb result.rows[0]
      else
        cb null
  
  getAccount:(ssn, cb)->
    @db.query "select account_num from " + @debtor + " where ssn='" + ssn + "'", (query)=>
      cb query.rows[0].account_num

  postCharge:(params, cb)->
    @auth.getUsername params.sessionid, (username)=>
      winston.info username + ' username'
      @getAccount username, (accountnumber)=>
        winston.info accountnumber
        if @isMoney(params.amount) and params.location isnt ''
          @nextSequence accountnumber, @chargedb, (transnum)=>
            amount = @formatMoney params.amount
            date = params.date || do new Date
            values = "("+ accountnumber + "," + transnum + ",'" + date + "','" + amount + "'," + params.location + ")"
            @db.query "insert into " + @chargedb + " (account_num, charge_num, charge_date, charge_amount, location) VALUES " + values, (result)=>
              @db.query "select balance from " + @dbname + " where account_num_a='" + accountnumber + "'", (result)=>
                oldbalance = @deformatMoney result.rows[0].balance
                winston.info Number(oldbalance) + Number(params.amount)
                newbalance = Number(oldbalance) + Number(params.amount)
                newbalance = @formatMoney newbalance
                winston.info newbalance
                @db.query "update " + @dbname + " set balance='" + newbalance + "' where account_num_a='" + accountnumber + "'", (result)=>
                  cb 'charge complete'

        else
          cb 'error need amount and location'

  postPayment:(params, cb)->


  applyInterest:(params, cb)->


  getBilling:(params, cb)->



  isMoney:(input)->
    a = @deformatMoney input
    a = Number a
    if a isnt Number.NaN
      return true
    else
      return false


  formatMoney:(a)->
    a = @deformatMoney a
    a = Number a
    return a.toFixed 2

  deformatMoney:(a)->
    a = a.replace '$', ''
    a = a.replace ',', ''
    return a
 
  nextSequence:(accnum, db, cb)=>
    if db is @chargedb
      column = 'charge_num'
    else
      column = 'payment_num'

    @db.query "select max("+column+") from " + db, (result)->
      winston.info JSON.stringify result.rows[0]
      cb Number(result.rows[0].max) + 1

module.exports = Account
