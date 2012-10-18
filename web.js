      var express = require('express');
      var app = express();
      app.configure(function() {
        app.use(express.bodyParser());
        app.use(app.router);
        app.use(function(req, res, next) {
          if (req.headers['user-agent'] && req.headers['user-agent'].indexOf('MSIE') > -1 && /html?($|\?|#)/.test(req.url)) {
            res.setHeader('X-UA-Compatible', 'IE=Edge,chrome=1');
          }
          next();
        });
      });
      app.configure('development', function() {
        app.use(express.static(__dirname + '/public'));
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
      });
      var http_port = 4000;
      app.listen(http_port);
      console.log('Worker %d listening on HTTP port %d in %s mode', process.pid, http_port, app.settings.env);
