'use strict';

module.exports = function ($config) {

  console.log($config.get('test4.msg'));
  
  this.on('init', function (config, done) {
    console.log('test4 init');
    done();
  });

};
