auth = require './auth'
money = require './money'

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
    @db.query "select sum(" + what + ") from " + db, (result)=>
      if typeof result.rows[0].sum is 'number'
        sum = result.rows[0].sum
      else
        sum = money.getNumber result.rows[0].sum
      @db.query "select count(" + what + ") from " + db, (result2)=>
        count = result2.rows[0].count
        avg = sum / count
        cb avg

  max:(what, params, db, cb)=>
    @db.query "select max(" + what + ") from " + db, (result)=>
      cb result.rows[0].max

  min:(what, params, db, cb)=>
    @db.query "select min(" + what + ") from " + db, (result)=>
      cb result.rows[0].min


  sum:(what, params, db, cb)=>
    @db.query "select sum(" + what + ") from " + db, (result)=>
      cb result.rows[0].sum

  countacc:(what, params, db, cb)=>
    first = false
    second = false
    total = 0

    sum = (incomming)->
      total += incomming
      if first
        second = true
      else
        first = true

      if first and second
        cb total

    @count 'account_num_a', params, @accountinfo, sum
    @count 'account_num_i', params, @accountinactive, sum

  count:(what, params, db, cb)=>
    @db.query "select count(" + what + ") from " + db, (result)=>
      cb result.rows[0].count

module.exports = Admin
