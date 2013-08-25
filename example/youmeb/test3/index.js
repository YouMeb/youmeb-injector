'use strict';

module.exports = function ($config) {

  console.log($config.get('_.config.test3.msg'));
  
  this.on('init', function (config, done) {
    console.log('test3 init');
    done();
  });

};
