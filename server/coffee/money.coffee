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
    a = input.replace /[$,]/g, ''
    a = Number a
    a.toFixed 2

module.exports = do new Money
