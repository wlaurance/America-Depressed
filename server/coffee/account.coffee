billing = require './billing'
winston = require 'winston'

class Account
  constructor:(@db, @auth)->
    @dbname = 'account_active'
    @chargedb = 'charges'
    @paymentdb = 'payments'
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
      @getAccount username, (accountnumber)=>
        if @isMoney(params.amount) and params.location isnt ''
          @nextSequence accountnumber, @chargedb, (transnum)=>
            amount = params.amount
            if Number(amount) <= 0
              cb 'negative payment'
              return
            date = @transDate params.charge_date
            values = "("+ accountnumber + "," + transnum + ",'" + date + "','$" + amount + "'," + params.location + ")"
            @db.query "insert into " + @chargedb + " (account_num, charge_num, charge_date, charge_amount, location) VALUES " + values, (result)=>
              @getCurrentBalance accountnumber, (oldbalance)=>
                newbalance = Number(oldbalance) + Number(@getNumber amount)
                @updateBalance newbalance, accountnumber, (result)=>
                  cb result
        else
          cb 'error need amount and location'

  postPayment:(params, cb)->
    @auth.getUsername params.sessionid, (username)=>
      @getAccount username, (accountnumber)=>
        if @isMoney(params.amount)
          @nextSequence accountnumber, @paymentdb, (transnum)=>
            amount = params.amount
            date = @transDate params.charge_date
            values = "(" + accountnumber + "," + transnum + ",'" + date + "','$" + amount + "')"
            @db.query "insert into " + @paymentdb + " (account_num, payment_num, payment_date, payment_amount) VALUES " + values, (resutl)=>
              @getCurrentBalance accountnumber, (oldbalance)=>
                newbalance = Number(oldbalance) - Number(@getNumber amount)
                @updateBalance newbalance, accountnumber, (result)=>
                  cb result

        else
          cb 'error need amount'


  applyInterest:(params, cb)->


  getBilling:(params, cb)->


  getCurrentBalance:(accountnumber, cb)=>
    @db.query "select balance from " + @dbname + " where account_num_a='" + accountnumber + "'", (result)=>
      oldbalance = @getNumber result.rows[0].balance
      cb oldbalance


  updateBalance:(newbalance, accountnumber, cb)=>
    @db.query "update " + @dbname + " set balance='$" + newbalance + "' where account_num_a='" + accountnumber + "'", (result)=>
      cb 'success'

  transDate:(date)->
    if date isnt undefined
      return new Date date
    else
      return new Date


  isMoney:(input)->
    a = Number input
    if a isnt Number.NaN
      return true
    else
      return false

  getNumber:(input)->
    winston.info 'input ' + input
    a = input.replace /[$,]/g, ''
    a = Number a
    a.toFixed 2

  nextSequence:(accnum, db, cb)=>
    if db is @chargedb
      column = 'charge_num'
    else
      column = 'payment_num'

    @db.query "select max("+column+") from " + db + " where account_num='" + accnum + "'", (result)->
      winston.info JSON.stringify result.rows[0]
      cb Number(result.rows[0].max) + 1

module.exports = Account
