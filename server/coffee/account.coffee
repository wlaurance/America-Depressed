billing = require './billing'
winston = require 'winston'
money = require './money'

class Account
  constructor:(@db, @auth, @rewards)->
    @dbname = 'account_active'
    @chargedb = 'charges'
    @paymentdb = 'payments'
    @debtor = 'debtor'
    @accountinactive = 'account_inactive'

  get:(username, cb)->
    @getAccount username, (accountnumber)=>
      if accountnumber?
        @db.query "select * from " + @dbname + " where account_num_a='" + accountnumber + "'" , (result) =>
          if result.rows.length is 0
            @db.query "select * from " + @accountinactive + " where account_num_i='" + accountnumber + "'", (result2)=>
              cb result2.rows[0]
          else
            cb result.rows[0]
      else
        cb null
  
  getAccount:(ssn, cb)->
    @db.query "select account_num from " + @debtor + " where ssn='" + ssn + "'", (query)=>
      cb query.rows[0].account_num

  postCharge:(params, cb)->
    @auth.getUsername params.sessionid, (username)=>
      @getAccount username, (accountnumber)=>
        if money.isMoney(params.amount) and params.location isnt ''
          @nextSequence accountnumber, @chargedb, (transnum)=>
            amount = params.amount
            if Number(amount) <= 0
              cb 'negative payment'
              return
            date = @transDate params.charge_date
            values = "("+ accountnumber + "," + transnum + ",'" + date + "','$" + amount + "'," + params.location + ")"
            @db.query "insert into " + @chargedb + " (account_num, charge_num, charge_date, charge_amount, location) VALUES " + values, (result)=>
              @getCurrentBalance accountnumber, (oldbalance)=>
                newbalance = Number(oldbalance) + Number(money.getNumber amount)
                @updateBalance newbalance, accountnumber, (result)=>
                  cb result
        else
          cb 'error need amount and location'

  postPayment:(params, cb)->
    @auth.getUsername params.sessionid, (username)=>
      @getAccount username, (accountnumber)=>
        if money.isMoney(params.amount)
          @nextSequence accountnumber, @paymentdb, (transnum)=>
            amount = params.amount
            date = @transDate params.charge_date
            values = "(" + accountnumber + "," + transnum + ",'" + date + "','$" + amount + "')"
            @db.query "insert into " + @paymentdb + " (account_num, payment_num, payment_date, payment_amount) VALUES " + values, (result)=>
              @getCurrentBalance accountnumber, (oldbalance)=>
                newbalance = Number(oldbalance) - Number(money.getNumber amount)
                @updateBalance newbalance, accountnumber, (result2)=>
                  cb result
                  params.points = Math.floor amount/100
                  @rewards.updatePoints params, (r3)=>
                

        else
          cb 'error need amount'


  applyInterest:(params, cb)->
    @db.query "select * from " + @dbname, (result)=>
      accounts = result.rows
      count = 1
      for account in accounts
        newbalance = money.getNumber(account.balance) * Number(account.interest_rate)
        winston.info newbalance - money.getNumber account.balance
        @db.query "update " + @dbname + " set balance='" + (money.make newbalance) + "' where account_num_a='" + account.account_num_a + "'", (result)=>
          count++
          if count >= accounts.length
            cb 'applied interest!'
      


  getBilling:(params, cb)->


  getCurrentBalance:(accountnumber, cb)=>
    @db.query "select balance from " + @dbname + " where account_num_a='" + accountnumber + "'", (result)=>
      oldbalance = money.getNumber result.rows[0].balance
      cb oldbalance


  updateBalance:(newbalance, accountnumber, cb)=>
    @db.query "update " + @dbname + " set balance='$" + newbalance + "' where account_num_a='" + accountnumber + "'", (result)=>
      cb 'success'

  transDate:(date)->
    if date isnt undefined
      return new Date date
    else
      return new Date

  nextSequence:(accnum, db, cb)=>
    if db is @chargedb
      column = 'charge_num'
    else
      column = 'payment_num'

    @db.query "select max("+column+") from " + db + " where account_num='" + accnum + "'", (result)->
      winston.info JSON.stringify result.rows[0]
      cb Number(result.rows[0].max) + 1

  getAccounts:(params, cb)->
    if params.type is 'a'
      db = @dbname
    else if params.type is 'i'
      db = @accountinactive
    else
      db = 'both'
    dbaccount = if params.type is 'a' then 'account_active.account_num_a' else 'account_inactive.account_num_i'
    if db isnt 'both'
      @db.query "select * from " + db + ", debtor, customer where customer.ssn = debtor.ssn and debtor.account_num = " + dbaccount , (result)=>
        cb result.rows
    else
      @db.query "select * from account_active, debtor, customer where customer.ssn = debtor.ssn and debtor.account_num = account_active.account_num_a" , (result)=>
        aaccounts = result.rows
        @db.query "select * from account_inactive, debtor, customer where customer.ssn = debtor.ssn and debtor.account_num = account_inactive.account_num_i", (result2)=>
          iaccounts = result2.rows
          for a in iaccounts
            aaccounts.push a
          winston.info 'aacounts length: ' + aaccounts.length
          cb aaccounts

  create:(params, cb, error)->
    firstname = params.fn
    lastname = params.ln
    zip = params.zip
    gender = params.gender
    ccscore = params.credit_score
    if not firstname? or firstname is '' or not lastname? or lastname is ''
      error 'Need a name!!!!'
    if not zip? or zip is ''
      error 'Need a zip'
    if not gender? or gender is ''
      error 'Need a gender'
    if not ccscore? or ccscore is ''
      error 'Need a credit score'
    
    @getValidAccountNumber (accountnum)=>
      cb accountnum


  getValidAccountNumber:(cb)=>
    @db.query "select max(account_num) from " + @debtor, (result)->
      cb (result.rows[0].max + 1)
      

module.exports = Account
