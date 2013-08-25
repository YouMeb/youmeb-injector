
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var Injector = require('../lib/injector');

var app = express();
var injector = new Injector();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

injector.initConfig({
  test1: {
    msg: 'hello1'
  },
  test2: {
    msg: 'hello2'
  },
  test3: {
    msg: 'hello3'
  },
  test4: {
    msg: 'hello4'
  }
});

(function (done) {
  injector.loadPackages(path.join(__dirname, 'youmeb'), function () {
    injector.init(done);
  });
})(function (err) {

  if (err) {
    console.error(err);
    return;
  }

  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });

});
