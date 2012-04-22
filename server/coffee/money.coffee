winston = require 'winston'

class Money
  constructor:()->

  isMoney:(input)->
    a = Number input
    if a isnt Number.NaN
      return true
    else
      return false

  getNumber:(input)->
    winston.info 'input ' + input
    if input is null or input is undefined
      return null
    a = input.replace /[$,]/g, ''
    a = Number a
    a.toFixed 2

module.exports = do new Money
