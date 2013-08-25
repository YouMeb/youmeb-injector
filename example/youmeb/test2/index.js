'use strict';

module.exports = function ($config) {

  console.log($config.get('test2.msg'));
  
  this.on('init', function (config, done) {
    console.log('test2 init');
    done();
  });
  
  this.on('hello', function (name, done) {
    console.log('hello ' + name);
    done();
  });

};
