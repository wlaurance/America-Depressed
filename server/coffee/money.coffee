winston = require 'winston'
accounting = require 'accounting'

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
    accounting.unformat input

  make:(input)->
    return accounting.formatMoney input

module.exports = do new Money
