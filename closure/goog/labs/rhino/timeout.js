

/**
 * A timer.
 */

goog.provide('goog.labs.rhino.Timeout');
goog.require('goog.asserts');

goog.labs.rhino.Timeout = function() {
  this.timer_ = new java.util.Timer();
  this.nextCallbackId_ = 0;
  this.taskMap_ = {};
};

goog.labs.rhino.Timeout.prototype.setTimeout = function(callback, opt_delay) {
  var callbackId = this.nextId_++

  var handler = goog.bind(this.handleCallback_, this, callbackId, callback);
  var task = new JavaAdapter(java.util.TimerTask, {'run': handler});
  this.taskMap_[callbackId] = task;
  this.timer_.schedule(task, opt_delay || 0);
};

goog.labs.rhino.Timeout.prototype.handleCallback_ = function(callbackId, callback) {
  delete this.taskMap_[callbackId];
  callback();
  this.maybeCleanupTimer_();
};

goog.labs.rhino.Timeout.prototype.clearTimeout = function(callbackId) {
  var task = this.taskMap_[callbackId];
  delete this.taskMap_[callbackId];
  if (task) {
    task.cancel();
  }
  this.maybeCleanupTimer_();
};

goog.labs.rhino.Timeout.prototype.maybeCleanupTimer_ = function() {
  if (!this.hasOutstandingTimeouts_()) {
    // This will cause the timer to be gc'd.
    delete this.timer_;
    gc();
  }
};

goog.labs.rhino.Timeout.prototype.hasOutstandingTimeouts_ = function() {
  for (var key in this.taskMap_) {
    return true;
  }
  return false;
};