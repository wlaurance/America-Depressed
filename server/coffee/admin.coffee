auth = require './auth'
money = require './money'

class Admin
  constructor:(@db)->
    @admindb = 'admin'
    @address = 'address'
    @session = new auth @db, @admindb
    @customerinfo = 'customer'
    @accountinfo = 'account_active'

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
      when 'max(balance)' then @max 'balance', params, cb
      when 'max(credit_score)' then @max 'credit_score', params, cb
      when 'min(balance)' then @min 'balance', params, cb
      when 'min(credit_score)' then @min 'credit_score', params, cb
      when 'sum(balance)' then @sum 'balance', params, cb
      when 'count(account_num)' then @count 'account_num', params, cb
      else cb 'not a valid function'


  avg:(what, params, db, cb)=>
    @db.query "select sum(" + what + ") from " + db, (result)=>
      if typeof result.rows[0].sum is 'number'
        sum = result.rows[0].sum
      else
        sum = money.getNumber result.rows[0].sum
      @db.query "select count(" + what + ") from " + db, (result2)=>
        count = result2.rows[0].count
        avg = sum / count
        cb avg

module.exports = Admin
