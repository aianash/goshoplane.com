winston = require 'winston'

logger = new (winston.Logger)(
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)(filename: 'goshoplane.log')
  ]
  exceptionHandlers: [
    new (winston.transports.File)(filename: 'goshoplane-fatal-error.log')
  ]
  exitOnError: false
)

module.exports = logger