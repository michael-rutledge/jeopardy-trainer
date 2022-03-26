const colors = require('colors');

const NONE = 0;
const CONSOLE = 1;
const ERROR = 2;
const WARN = 3;
const INFO = 4;

function getDebugLevel() {
  if (process.argv.includes('debug:console')) {
    return CONSOLE;
  } else if (process.argv.includes('debug:error')) {
    return ERROR;
  } else if (process.argv.includes('debug:warn')) {
    return WARN;
  } else if (process.argv.includes('debug:info')) {
    return INFO;
  }

  return NONE;
}

const DEBUG_LEVEL = getDebugLevel();


function logConsole(message) {
  if (DEBUG_LEVEL >= CONSOLE) {
    console.log('CONSOLE: '.green.bold + message);
  }
}

function logError(message) {
  if (DEBUG_LEVEL >= ERROR) {
    console.log('ERROR: '.red.bold + message);
  }
}

function logWarning(message) {
  if (DEBUG_LEVEL >= WARN) {
    console.log('WARN: '.yellow.bold + message);
  }
}

function logInfo(message) {
  if (DEBUG_LEVEL >= INFO) {
    console.log('INFO: '.cyan.bold + message);
  }
}

// node exports
module.exports.logError = logError;
module.exports.logWarning = logWarning;
module.exports.logInfo = logInfo;
