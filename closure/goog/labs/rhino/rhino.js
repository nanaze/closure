goog.provide('goog.labs.rhino');

/**
 * @return {boolean} Whether this is Rhino.
 */ 
goog.labs.rhino.isRhino = function() {
  var env = goog.global['environment'];
  return env && (!!env['java.version']);
}