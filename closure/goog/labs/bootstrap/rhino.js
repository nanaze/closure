/**
 * @fileoverview This is a bootstrap script to run Closure on Rhino.
 * Usage:
 * rhino path/to/bootstrap/rhino.js --base path/to/base.js <closure.namespace>
 */

(function(argumentObj) {
  var _FLAGS = [
    '--base'
    // TODO(nnaze): Allow specification of additional deps files.
  ]

  /**
   * Log a message.  Message is written to stderr.
   * @param {string} msg
   */
  function log(msg) {
    java.lang.System.err.println(msg);
  }

  /**
   * Parse arguments.  Will throw an error if a unrecognizable flag is specified.
   * @param {!Array.<string>} args Arguments.
   * @return {!Array.<!Array.<string>|!Object.<string, !Array.<string>>} A 
   *     A tuple. First member is those arguments that are not part of a flag.
   *     Second member is a map from full flag name (--foo) to an array of
   *     strings (which are the specified values).
   */
  function parseArgs(args, definedFlags) {
    var newArgs = []
    var flags = {};
    var argsCopy = copyArray(args);
    
    while (argsCopy.length) {
      var arg = argsCopy.shift();

      if (arg.substring(0, 2) == '--') {
	if (definedFlags.indexOf(arg) == -1) {
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

  /**
   * Make a duplicate of the given array.
   * @param {!Array.<*>}
   * @return {!Array.<*>} A new array with the same contents as the given.
   */
  function copyArray(arr) {
    var newArray = [];
    for (var i = 0; i < arr.length; i++) {
      newArray.push(arr[i]);
    }
    return newArray;
  }
  
  /**
   * Given a filename, get the file's containing directory (by calling through
   * to UNIX's dirname).
   *
   * TODO(nnaze): Call through to an equivalent on other platforms.  At runtime,
   * one could examine environment variable to determine platform.
   *
   * @param {string} path Path to filename.
   * @return {string} Path to directory containing path.
   */
  function dirName(path) {
    var options = {output: ''};
    var status = runCommand('dirname', path, options);
    if (status != 0) {
      throw Error('Call to dirname on path failed: ' + path);
    }

    // Command's output was appended to options.output.    
    var output = options.output;

    // Remove trailing newlines
    return output.replace(/\n$/g, '');
  }

  /**
   * Load a script.
   * @param {string} fullPath Path to script.
   */
  function loadScript(fullPath) {
    log('Loading file: ' + fullPath);
    load(fullPath);
  }

  /**
   * Require a symbol.  This will call goog.require, which will, in turn, pull
   * the necessary script files.
   * @param {string} symbol Symbol to be required.
   */
  function requireSymbol(symbol) {
    log('Requiring symbol: ' + symbol);
    goog.require(symbol);
  }

  /**
   * Start bootstrap.
   * @param {!Array.<string>} args Arguments from command line, as string.
   */
  function main(args) {
    var result = parseArgs(args, _FLAGS);
    var args = result[0];
    var flags = result[1];

    var base = flags['--base'];
    if ((!base) || (base.length != 1)) {
      throw Error('--base must be specified once');
    }
    
    var basePath = base[0];
    var baseDir = dirName(basePath);
    var separator = environment['file.separator']
    var depsPath = baseDir  + separator + 'deps.js';
    
    loadScript(basePath);
    loadScript(depsPath);
    
    // Implement the loading of a file.
    goog.global.CLOSURE_IMPORT_SCRIPT = function(scriptPath) {
      var pathToScript = baseDir + separator + scriptPath;
      loadScript(pathToScript);
    }

    // The remaining arguments should be namespace symbols in need of loading.
    args.forEach(function(symbol) {
      requireSymbol(symbol);
    });
  }

  // start
  main(argumentObj);
})(arguments);