var util = require("util");

var levels = {
	ERROR: 0,
	WARN: 1,
	INFO: 2,
	DEBUG: 3 
};

var styles = {
	CLEAR: 0,
	BOLD: 1,
	ITALIC: 3,
	UNDERLINE: 4
};

var colors = {
	RED: 31,
	YELLOW: 33,
	WHITE: 37,
	BLACK: 30
};

var levelStyles = {
	ERROR: [styles.BOLD, colors.RED],
	WARN: [colors.YELLOW],
	INFO: [styles.BOLD, colors.WHITE],
	DEBUG: [styles.BOLD, colors.BLACK]
};

var currentLevel = levels.DEBUG;
var showSourceInfo = true;

exports.init = function(level) {
	if(level >= 0) currentLevel = level;

	showSourceInfo = (currentLevel !== 0);

	global.console.info = createLogger("INFO");

	global.console.warn = createLogger("WARN");

	global.console.debug = createLogger("DEBUG");

	global.console.error = createLogger("ERROR");

	global.console.log = global.console.debug;
};


function writeLog(level, msg) {
	var line;
	if(showSourceInfo) {
		var si = getSourceInfo();
		//if(si.methodName === 'anonymous') {
		line = util.format("<%s>\t[%s:%s] %s", level, si.file, si.lineNumber, msg);
		//} else {
		//	line = util.format("<%s>\t[%s:%s - %s()] %s", level, si.file, si.lineNumber, si.methodName, msg);
		//}
	} else {
		line = util.format("<%s>\t%s", level, msg);
	}
	
	line = addCodes(line, levelStyles[level]);
	process.stderr.write(line + "\n");
}

function getSourceInfo() {
	var exec = getStack()[3];

	var pos = exec.getFileName().lastIndexOf('\\');
	if(pos < 0) exec.getFileName().lastIndexOf('/');


	return {
		methodName: exec.getFunctionName() || 'anonymous',
		file: exec.getFileName().substring(pos + 1),
		lineNumber: exec.getLineNumber()
	};
}

function getAnsi(code) {
	return '\u001b['+code+'m';
}

function addCodes(msg, codes) {
	codes.forEach(function(c) {
		msg = getAnsi(c) + msg;
	});

	msg = msg + getAnsi(styles.CLEAR);

	return msg;
}

function createLogger(level) {
  return function () {
  	if(levels[level] <= currentLevel) {
	  	var msg = util.format.apply(this, arguments);
	  	writeLog(level, msg);
  	}
  };
}

function getStack() {
	var old = Error.stackTraceLimit;
	Error.stackTraceLimit = 4;
	var orig = Error.prepareStackTrace;
  	Error.prepareStackTrace = function(_, stack){ return stack; };
  	var err = new Error;
  	Error.captureStackTrace(err, arguments.callee);
  	var stack = err.stack;
  	Error.prepareStackTrace = orig;

	Error.stackTraceLimit = old;

  	return stack;
}