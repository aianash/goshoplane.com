nconf = require 'nconf'

nconf.argv()
     .env()

env = nconf.get('NODE_ENV')
appDir = nconf.get('APP_DIR')

require "#{appDir}/app"