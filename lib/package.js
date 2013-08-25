'use strict';

var util = require('util');
var path = require('path');
var EventEmitter = require('youmeb-events');

module.exports = Package;

function Package(dir, packageFile) {
  var pkg;

  this.file = path.join(dir, packageFile);

  pkg = require(this.file);
  pkg.youmeb = pkg.youmeb || {};

  this.name = pkg.name || path.basename(dir);
  this.version = pkg.version || 'v0.0.0';
  this.dependencies = pkg.youmeb.dependencies || {};
  this.keywords = pkg.keywords || [];
  this.wrapper = require(path.join(dir, pkg.main || 'index.js'));
  this.injector = null;
};

util.inherits(Package, EventEmitter);

Package.prototype.inject = function (fn) {
  var inject;

  if (fn instanceof Array) {
    inject = fn;
    fn = inject.pop();
    fn.inject = inject;
  }

  this.injector.invoke(fn, this);

  return this;
};
