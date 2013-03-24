goog.provide('goog.labs.rhino.TimeoutDemo');

goog.require('goog.labs.rhino.Timeout');

print('Creating timer');
var timeout = new goog.labs.rhino.Timeout();

print('Setting timeout.');
timeout.setTimeout(function() {
  print('Timeout fired');
});
