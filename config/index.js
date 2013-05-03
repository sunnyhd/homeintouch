// This module loads a config file in the current working directory matching the first command line argument.
// I.e. either './dev.json' or './prod.json' based on the first command line argument.
// If not set, it defaults to './deve.json'.
// Can load custom environment files as well, as long as the argument variable matches
// a file in the current directory. E.g. './staging.json'
// Usage: calling code can just require this module, e.g. "var config = require('./config')"
// assuming this file is named "index.js" and lives in a subdirectory named "config" of the app root.
var nodeEnv = (process.argv[2] ? process.argv[2] : 'dev');
var config
  , config_file = './' + nodeEnv + '.json';
 
try {
  config = require(config_file);
  console.log('Config loaded for ' + nodeEnv + ' environment.');
} catch (err) {
  if (err.code && err.code === 'MODULE_NOT_FOUND') {
    console.error('No config file matching ' + nodeEnv 
      + '. Requires "' + __dirname + '/' + nodeEnv + '.json"');
    process.exit(1);
  } else {
    throw err;
  }
}
config.configFile = './config/' + nodeEnv + '.json';
config.environment = nodeEnv;
module.exports = config;