// # youmeb-injector
//
//     youmeb-injector v0.0.0
//     Copyright (c) 2013 YouMeb and contributors.
//     the MIT license

'use strict';

var path = require('path');
var fs = require('fs');
var semver = require('semver');
var Config = require('./config');
var Package = require('./package');

var PACKAGE_FILE = 'package.json';

// 取得 argument 名稱
function argnames(func) {
  return func.toString()
    .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg, '')
    .match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1]
    .split(',');
}

// 把 youmeb-mongoose 這類命名方式轉為 youmebMongoose
function camel(name, prefix) {
  prefix = prefix || '';
  var names = name.split('-');
  var str;

  if (names[0] === prefix) {
    names.shift();
  }

  str = names.shift() || '';

  names.forEach(function (name) {
    str += name[0].toUpperCase() + name.substr(1);
  });

  return str;
}

module.exports = Injector;

function Injector() {
  this.packageNamePrefix = 'youmeb';
  this.dependencies = {};
  this.packages = {};
  this.config = new Config();
}

Injector.create = function () {
  return new Injector();
};

Injector.prototype.initConfig = function (config) {
  this.config.set('_.config', config || {});
  this.config = this.config.namespace('_.config');
  this.register('config', this.config);
};

// 把目錄下所有 package 全部載入，並建立物件
Injector.prototype.loadPackages = function (dir, done) {
  var that = this;

  fs.readdir(dir, function (err, files) {
    var loading = files.length;
    var pkgs = that.packages;
    var errs = [];
    var complete;

    if (err) {
      return done(err);
    }

    // if `files` empty
    if (!loading) {
      return done();
    }

    complete = function () {
      loading -= 1;
      if (!loading) {
        done(errs.length === 1 ? errs[0] : (errs.length > 0 ? errs : null));
      }
    };

    files.forEach(function (file) {

      file = path.join(dir, file);

      fs.stat(file, function (err, stats) {
        if (err) {
          complete();
          return errs.push(err);
        }
        // 取得目錄
        if (stats.isDirectory()) {
          // 檢查 PACKAGE_FILE
          fs.stat(path.join(file, PACKAGE_FILE), function (err, stats) {
            var pkg;
            if (err) {
              complete();
              return;
            }
            if (stats.isFile()) {
              pkg = new Package(file, PACKAGE_FILE);
              pkg.injector = that;
              if (!!~pkg.keywords.indexOf('youmeb-package')) {
                pkgs[pkg.name] = pkg;
              }
            }
            complete();
          });
        }
      });

    });
  });
};

Injector.prototype.register = function (name, wrapper) {
  this.dependencies[name] = wrapper;
};

// 到 dependencies 找
Injector.prototype.get = function (name) {
  return this.dependencies[name];
};

// 可以事先設定 inject
Injector.prototype.invoke = function (fn, obj) {
  if (fn instanceof Array) {
    var res = [];
    fn.forEach(function (fn) {
      res.push(this.invoke(fn, obj));
    });
    return res;
  }

  var that = this;
  var names = fn.inject || argnames(fn);
  var args = [];
  
  names.forEach(function (name) {
    if (name[0] === '$') {
      args.push(that.get(name.substr(1)));
    } else {
      args.push(undefined);
    }
  });

  return fn.apply(obj || null, args);
};

Injector.prototype.checkVersion = function (version, rules) {
  if (arguments.length > 2) {
    rules = Array.prototype.slice.call(arguments, 1);
  }
  
  var len = rules.length;

  while (len--) {
    if (!semver.satisfies(version, rules[len])) {
      return false;
    }
  }

  return true;
};

Injector.prototype.init = function (done) {
  var that = this;
  var pkgs = {};
  var errors = [];
  var list = {};

  var hasError = function () {
    if (errors.length > 0) {
      done(errors.length === 1 ? errors[0] : errors);
      return true;
    }
    return false;
  };

  // 取得所有 package 的相依關係
  Object.keys(this.packages).forEach(function (name) {
    var pkg = that.packages[name];
    
    // 之後排序用
    list[name] = Object.keys(pkg.dependencies);

    list[name].forEach(function (key) {
      var pkg = that.packages[key];

      // 檢查 package 是否安裝
      if (!pkg) {
        errors.push(new Error('\'' + key + '\' is not installed'));
        return;
      }

      if (!pkgs[key]) {
        pkgs[key] = [];
      }

      pkgs[key].push(pkg.version);
    });

  });

  if (hasError()) {
    return;
  }

  // 檢查版本號是否衝突
  Object.keys(pkgs).forEach(function (key) {
    if (that.checkVersion(that.packages[key].version, pkgs[key])) {
      return;
    }
    errors.push(new Error('\'' + key + '\' version conflict'));
  });

  if (hasError()) {
    return;
  }

  // 依照相依關係排序
  list = (function _sort(keys) {
    var res = [];

    keys.forEach(function (key) {
      if (!list.hasOwnProperty(key)) {
        return;
      }

      res = res.concat(_sort(list[key]));
      res.push(key);

      delete list[key];
    });

    return res;
  })(Object.keys(list));

  // 依照相依順序一個一個初始化
  (function () {
    var i = 0;
    
    (function next() {
      var name = list[i++];
      var pkg;

      if (!name) {
        return done && done();
      }

      pkg = that.packages[name];
      that.dependencies[camel(pkg.name, that.packageNamePrefix)] = pkg;
      pkg.inject(pkg.wrapper);

      pkg.emit('init', that.config.namespace('_.config.' + name), function (err) {
        // wrapper 執行失敗時停止繼續執行
        if (err) {
          return done(err);
        }
        next();
      });
    })();
  })();
};
