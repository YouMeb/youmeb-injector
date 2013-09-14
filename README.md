# youmeb-injector

## Quick start

### main file

    var injector = new Injector();

    injector.initConfig({
      test: {
        msg: 'hello world !'
      }
    });

    injector.loadPackages(path.join(__dirname, 'youmeb'), function () {
      injector.init(function (err) {
        if (err) {
          console.error(err);
        }
      });
    });

### package main file

    // package name: test
    module.exports = function ($config, $dependencyPackage) {
      // $config namespace: _.config

      this.on('init', function (config) {
        // config namespace: _.config.test

        console.log(config.get('msg') === $config.get('test.msg')); // true
      });
    };

## License

(The MIT License)

Copyright (c) 2013 YouMeb and contributors.
