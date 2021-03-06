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
    @customer = 'customer'

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

  specific:(params, cb, error)->
    if not params.acctnum? or params.acctnum is ''
      error 'no account num'
      return
    @db.query "select * from " + @debtor + " where account_num='" + params.acctnum + "'", (r1)=>
      if not r1.rows[0]? or r1.rows[0].ssn is ''
        error 'invalid ssn'
        return
      ssn = r1.rows[0].ssn
      @db.query "select * from " + @customer + " where ssn='" + ssn + "'", (r2)=>
        cb r2.rows[0]

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
                  amount = money.getNumber amount
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
    ssn = params.ssn
    if not firstname? or firstname is '' or not lastname? or lastname is ''
      error 'Need a name!!!!'
      return
    if not zip? or zip is ''
      error 'Need a zip'
      return
    if not gender? or gender is ''
      error 'Need a gender'
      return
    if not ccscore? or ccscore is ''
      error 'Need a credit score'
      return
    if ccscore > 850 or ccscore < 300
      error 'Credit score out of range'
      return
    if not ssn? or ssn is ''
      error 'Need a ssn?'
      return
    if ssn.length > 9
      error 'Too long of an ssn.'
      return
    if ssn.length < 9
      error 'Too short of an ssn.'
      return

    @getValidAccountNumber (accountnum)=>
      @validateSSN ssn, error, =>
        @rewards.getNextAcc (rewardsnum)=>
          @getIR ccscore, (ir)=>
            @db.query "insert into " + @debtor + " values('" + ssn + "', '" + accountnum + "')", (result1)=>
              @db.query "insert into " + @customer + " values('" + ssn + "', '" + firstname + "', '" + lastname + "', '" + gender + "','" + zip + "','" + ccscore + "')", (result2)=>
                @db.query "insert into " + @dbname + " values('" + accountnum + "', '" + '$0.00' + "', '" + do (do new Date).toISOString + "', '" + ir + "')", (result3)=>
                  @rewards.createAcc ssn, rewardsnum, (r)=>
                    @db.query "insert into online_account values('" + ssn + "', 'cbfdac6008f9cab4083784cbd1874f76618d2a97')", (result5)=>
                      cb account =
                        first_name:firstname
                        last_name:lastname
                        ssn: ssn
                        credit_score:ccscore
                        account_num: accountnum
                        reward_account: rewardsnum
                        balance : '$0.00'



  getIR:(credit, cb)->
    interest = 0
    if credit > 299 and credit < 350
      interest = 1.75
    if credit > 349 and credit < 400
      interest = 1.70
    if credit > 399 and credit < 450
      interest = 1.65
    if credit > 449 and credit < 500
      interestest = 1.60
    if credit > 499 and credit < 550
      interest = 1.55
    if credit > 549 and credit < 600
      interest = 1.50
    if credit > 599 and credit < 650
      interest = 1.45
    if credit > 649 and credit < 700
      interest = 1.40
    if credit > 699 and credit < 750
      interest = 1.35
    if credit > 749 and credit < 800
      interestestst = 1.30
    if credit > 799 and credit < 851
      interest = 1.25
    cb interest

  getValidAccountNumber:(cb)=>
    @db.query "select max(account_num) from " + @debtor, (result)->
      cb (Number(result.rows[0].max) + 1)

  validateSSN:(ssn, error, cb)=>
    @db.query "select ssn from customer where ssn='" + ssn + "'", (result)=>
      if result.rows.length > 0
        error 'Sorry ssn taken'
        return
      else
        cb 'g2g'
       

  update:(params, error, cb)=>
    if not params.acctnum or params.acctnum is ''
      error 'no account num'
      return
    @db.query "select ssn from " + @debtor + " where account_num='" + params.acctnum + "'", (result1)=>
      if result1.rows.length is 0
        error 'no matching ssn'
        return
      ssn = result1.rows[0].ssn

      value = 'set'
      ov = value
      if params.fn? and params.fn isnt ''
        if value isnt ov
          value = value + ','
        value = value + " first_name='" + params.fn + "'"
      if params.ln? and params.ln isnt ''
        if value isnt ov
          value = value + ','
        value = value + " last_name='" + params.ln + "'"
      if params.zip? and params.zip isnt ''
        if value isnt ov
          value = value + ','
        value = value + " zip=" + params.zip + ""
      if params.gender? and params.gender isnt ''
        if value isnt ov
          value = value + ','
        value = value + " gender='" + params.gender + "'"
      if params.credit_score? and params.credit_score isnt ''
        if value isnt ov
          value = value + ','
        value = value + " credit_score='" + params.credit_score + "'"

      if value isnt ov
        @db.query "update " + @customer +  " " + value + " where ssn='" + ssn + "'", (result)->
          cb 'update ' + ssn
      else
        cb 'nothing to update'




module.exports = Account
