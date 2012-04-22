auth = require './auth'

class Admin
  constructor:(@db)->
    @admindb = 'admin'
    @address = 'address'
    @session = new auth @db, @admindb

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
      when 'avg(balance)' then @avg 'balance', params, cb
      when 'avg(credit_score)' then @avg 'credit_score', params, cb
      when 'max(balance)' then @max 'balance', params, cb
      when 'max(credit_score)' then @max 'credit_score', params, cb
      when 'min(balance)' then @min 'balance', params, cb
      when 'min(credit_score)' then @min 'credit_score', params, cb
      when 'sum(balance)' then @sum 'balance', params, cb
      when 'count(account_num)' then @count 'account_num', params, cb
      else cb 'not a valid function'


module.exports = Admin
