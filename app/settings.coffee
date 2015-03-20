nconf = require 'nconf'

nconf.argv()
  .env()

env = nconf.get("NODE_ENV")

nconf.file(file: __dirname + "/configs/config_" + env + ".json")

module.exports = nconf