/**
 * @fileoverview This is a bootstrap script to run Closure on Rhino.
 * Usage:
 * rhino path/to/bootstrap/rhino.js --base path/to/base.js <closure.namespace>
 */


_FLAGS = [
  '--base'
  // TODO(nnaze): Allow specification of additional deps files.
]


function parseArgs(args) {
  var newArgs = []
  var flags = {};
  var argsCopy = copyArray(args);
  
  while (argsCopy.length) {
    var arg = argsCopy.shift();

    if (arg.substring(0, 2) == '--') {
      if (_FLAGS.indexOf(arg) == -1) {
	throw Error('Unrecognized flag: ' + arg);
      }

      flags[arg] = flags [arg] || [];
      flags[arg].push(argsCopy.shift() || '');
      
    } else {
      newArgs.push(arg);
    }
  }

  return [newArgs, flags];
}

function copyArray(arr) {
  var newArray = [];
  for (var i = 0; i < arr.length; i++) {
    newArray.push(arr[i]);
  }
  return newArray;
}

function getBaseDirectory(basePath) {
  var match = /(.*)base\.js$/.exec(basePath);
  return match[1];
}

function extractScriptFromCommand(command) {
  var re = new RegExp('java\/rhino\/js.jar (.*?\\.js)'); // (.*?\.js\b)');
  var match = re.exec(command);
  
  if (match) {
    return match[1];
  }

  throw Error('Unable to parse JS file from command: ' + command);
}

function main(args) {

  var result = parseArgs(args);
  var args = result[0];
  var flags = result[1];

  var base = flags['--base'];
  if ((!base) || (base.length != 1)) {
    throw Error('--base must be specified once');
  }

  var basePath = base[0];
  var baseDir = getBaseDirectory(basePath);

  var separator = environment['file.separator']
  var depsPath = baseDir  + 'deps.js';

  load(basePath);
  load(depsPath);

  for (var i = 0; i < args.length; args++) {
    var arg = args[i];
    goog.require(arg);
  }
}

// TODO(nnaze): this all belongs in an anonymous function scope
main(arguments)