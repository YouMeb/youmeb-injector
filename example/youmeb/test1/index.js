'use strict';

module.exports = function ($config, $test2) {

  console.log($config.get('test1.msg'));
  
  this.on('init', function (config, done) {
    console.log(config.get('msg'));
    $test2.emit('hello', 'poying');
    done();
  });

};
