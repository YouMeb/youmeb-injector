'use strict';

module.exports = Config;

// 先把「\.」換成一個佔位符號，再進行 split
// split 完成後再替換回來
function getNames(name) {
  var names = [];

  name.replace(/\\\./g, '\uffff').split('.').forEach(function(name) {
    names.push(name.replace(/\uffff/g, '.'));
  });

  if (names[0] !== 'config') {
    names.unshift('config');
  }

  return names;
}

// 建立 data 物件，並把 namespace 切換到 config
// 這邊在 data 下又設一個 config 的目的是為了讓之後替換整個設定的時候比較方便
// 只需要把 namespace 切到 data 然後設定 config 為新物件就行
function Config() {
  this.data = {config: {}};
  this._namespace = this.data.config;
}

// namespace 被呼叫的時候會產生新 Object
// 目的是為了讓每段程式碼切換 namespace 的時候不會互相衝突、打架
Config.prototype.namespace = function (namespace) {
  var data = this._namespace;
  var child = Object.create(this);
  var names;

  namespace = namespace || '_';

  names = getNames(namespace);

  if (names[0] === '_') {
    data = this.data;
    names.shift();
  }
    
  names.forEach(function (name) {
    if (!data[name]) {
      data[name] = {};
    }
    data = data[name];
  });

  child._namespace = data;

  return child;
};

Config.prototype.get = function (name) {
  var names, data, len, i;

  data = this._namespace;
  names = getNames(name);

  if (names[0] === '_') {
    data = this.data;
    names.shift();
  }

  for (i = 0, len = names.length; i < len; i += 1) {
    if (!data[names[i]]) {
      return;
    }
    data = data[names[i]];
  }
  
  return data;
};

// 如果經過的位置不存在，會自動建立
Config.prototype.set = function (name, val) {
  var names, last;
  var data = this._namespace;

  names = getNames(name);
  last = names.pop();

  if (names[0] === '_') {
    data = this.data;
    names.shift();
  }

  names.forEach(function (name) {
    if (!data[name]) {
      data[name] = {};
    }
    data = data[name];
  });

  data[last] = val;

  return this;
};
