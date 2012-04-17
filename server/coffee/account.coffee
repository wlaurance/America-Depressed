billing = require './billing'
winston = require 'winston'

class Account
  constructor:(@db)->
    @dbname = 'account_active'
    @chargedb = 'charges'
    @debtor = 'debtor'

  get:(username, cb)->
    @db.query "select account_num from " + @debtor + " where ssn='" + username + "'", (query)=>
      accountnumber = query.rows[0].account_num
      if accountnumber?
        @db.query "select * from " + @dbname + " where account_num_a='" + accountnumber + "'" , (result) ->
          cb result.rows[0]
      else
        cb null

  postCharge:(params, cb)->
    if params.accountnumber
      @nextSequence params.accountnumber, @chargedb, (transnum)=>
        amount = @formatMoney params.amount
        values = "("+ params.accountnumber + "," + transnum + ",'" + do (do new Date).toUTCString + "','" + amount + "','" + params.location + "')"
        @db.query "insert into " + @chargedb + " (account_num, charge_num, charge_date, charge_amount, location) VALUES " + values, (result)=>
          @db.query "select balance from " + @dbname + " where account_num_a='" + params.accountnumber + "'", (result)=>
            oldbalance = @deformatMoney result.rows[0].balance
            winston.info Number(oldbalance) + Number(params.amount)
            newbalance = Number(oldbalance) + Number(params.amount)
            newbalance = @formatMoney newbalance
            winston.info newbalance
            @db.query "update " + @dbname + " set balance='" + newbalance + "' where account_num_a='" + params.accountnumber + "'", (result)=>
              cb 'charge complete'

    else
      cb 'Need an accountnumber'

  postPayment:(params, cb)->


  applyInterest:(params, cb)->


  getBilling:(params, cb)->


  formatMoney:(a)->
    a = Number a
    return '$' + a.toFixed 2

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
