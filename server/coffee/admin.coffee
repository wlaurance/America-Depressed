auth = require './auth'
money = require './money'
winston = require 'winston'

class Admin
  constructor:(@db)->
    @admindb = 'admin'
    @address = 'address'
    @session = new auth @db, @admindb
    @customerinfo = 'customer'
    @accountinfo = 'account_active'
    @accountinactive = 'account_inactive'

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


  dofunction:(params, cb)->
    switch params.function
      when 'avg(balance)' then @avg 'balance', params, @accountinfo, cb
      when 'avg(credit_score)' then @avg 'credit_score', params, @customerinfo, cb
      when 'max(balance)' then @max 'balance', params, @accountinfo, cb
      when 'max(credit_score)' then @max 'credit_score', params, @customerinfo, cb
      when 'min(balance)' then @min 'balance', params, @accountinfo, cb
      when 'min(credit_score)' then @min 'credit_score', params, @customerinfo, cb
      when 'sum(balance)' then @sum 'balance', params, @accountinfo, cb
      when 'count(account_num)' then @countacc 'account_num', params, @accountinfo, cb
      else cb 'not a valid function'


  avg:(what, params, db, cb)=>
    db = @processDBClause params, db, (what is 'balance')
    @db.query "select sum(" + what + ") from " + db, (result)=>
      if typeof result.rows[0].sum is 'number'
        sum = result.rows[0].sum
      else
        sum = money.getNumber result.rows[0].sum
      @db.query "select count(" + what + ") from " + db, (result2)=>
        count = result2.rows[0].count
        avg = sum / count
        if what is 'balance'
          cb money.make avg
        else
          cb avg

  max:(what, params, db, cb)=>
    db = @processDBClause params, db, (what is 'balance')
    @db.query "select max(" + what + ") from " + db, (result)=>
      cb result.rows[0].max

  min:(what, params, db, cb)=>
    db = @processDBClause params, db, (what is 'balance')
    @db.query "select min(" + what + ") from " + db, (result)=>
      cb result.rows[0].min


  sum:(what, params, db, cb)=>
    db = @processDBClause params, db, (what is 'balance')
    @db.query "select sum(" + what + ") from " + db, (result)=>
      cb result.rows[0].sum

  countacc:(what, params, db, cb)=>
    @count 'account_num_a', params, @accountinfo, (count1)=>
      @count 'account_num_i', params, @accountinactive, (count2)=>
        cb count1 + count2

  count:(what, params, db, cb)=>
    db = @processDBClause params, db, (what is 'balance' or what is 'account_num_a' or what is 'account_num_i'), (what is 'account_num_i')
    @db.query "select count(" + what + ") from " + db, (result)=>
      cb result.rows[0].count


  processDBClause:(params, db, involvesAccounts = false, inactive = false)=>
    winston.info JSON.stringify params
    genderspecific = false
    statespecific = false
    zipspecific = false
    if params.gender isnt 'ALL'
      genderspecific = true
    if params.zip isnt 'ALL'
      zipspecific = true
    if params.state isnt 'ALL'
      statespecific = true
      zipspecific = false
    
    if inactive
      account = 'account_inactive.account_num_i'
    else
      account = 'account_active.account_num_a'

    astr = "customer, address where customer.zip = address.zip"
    bstr = "customer, debtor, address where customer.ssn = debtor.ssn and " + account + " = debtor.account_num and customer.zip = address.zip"
    cstr = "customer, debtor where customer.ssn = debtor.ssn and " + account + " = debtor.account_num"
    if not genderspecific and not statespecific and not zipspecific
      return db
    if genderspecific and statespecific and involvesAccounts
      return db + ", " + bstr + " and address.state='" + params.state + "' and customer.gender='" + params.gender + "'"
    if genderspecific and statespecific
      return astr + " and address.state='" + params.state + "' and customer.gender='" + params.gender + "'"
    if genderspecific and zipspecific and involvesAccounts
      return db + ", " + cstr + " and customer.zip ='" + params.zip + "' and customer.gender='" + params.gender + "'"
    if genderspecific and zipspecific
      return "customer where gender='" + params.gender + "' and zip='" + params.zip + "'"
    if genderspecific and involvesAccounts
      return db + ", " + cstr + " and customer.gender='" + params.gender + "'"
    if genderspecific 
      return "customer where gender='" + params.gender + "'"
    if statespecific and involvesAccounts
      return db + ", " + bstr + " and address.state='" + params.state + "'"
    if statespecific 
      return astr + " where address.state='" + params.state + "'"
    if zipspecific and involvesAccounts
      return db + ", " + bstr + " and customer.zip='" + params.zip + "'"
    if zipspecific
      return "customer where zip='" + params.zip + "'"
    else
      return db

module.exports = Admin
