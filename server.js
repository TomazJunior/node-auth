"use strict";

var env = process.env.NODE_ENV;

var express = require('express');
var app = express(); // app needs to be visible
var router = express.Router();
var bodyParser = require('body-parser');
var server = require('http').Server(app);
var mongoose = require('mongoose');

var cfg = require("./node-auth.conf.json")[env];
var jwt = require('jsonwebtoken');

var mongoConnStr = 'mongodb://' + cfg.db.mongo.host + '/' + cfg.db.mongo.database;

mongoose.connection.on("connected", function(ref) {
  console.log("Mongo Connected.", mongoConnStr);

// secret variable
  app.set('superSecret', process.env.NODE_AUTH_SECRET || cfg.secret);

// set mongo schemas
  app.use(function (req, res, next) {
    req.models = { User : require("./user/user") };
    next();
  });

// Assign misc. Express middleware handlers
// NEW: Configure bodyParser to allow much larger POST submissions.
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));
  app.use(express.static(__dirname + cfg.static));

  app.all('*', function (req, res, next) {
    console.log('called ' + req.method);
    // CORS headers
    res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    // Set custom headers for CORS
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
    next();
  });

  var routes = require('./routes')(router, cfg);
  routes.initialize();

  app.use("/api/", function (req, res, next) {
    var jr = {"status": "bad", "msg": "Failed to authenticate token. "};
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    // decode token
    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, cfg.secret, function(err, decoded) {
        if (err) { console.log(jr.msg); return res.json(jr); } else {
          // if everything is ok
          req.currentUser = decoded._doc;
          next();
        }
      });

    } else {
      // if there is no token
      // return an error
      jr.msg+='No token provided.';
      console.log(jr.msg);
      return res.json(jr);
    }
  });
//// If no route is matched by now, it must be a 404
//app.use(function(req, res, next) {
//  var err = new Error('Not Found');
//  err.status = 404;
//  res.status(404).send('404 - url not found').end();
//});

  app.use('/', router);

  // log errors
  app.use(function(err, req, res, next) {
    console.error(err.stack);
    next(err);
  });

  // client error handling
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({ message: err.message });
  });

  server.listen(cfg.htpport, function () {
    console.log('node-auth pid %s listening on %d in %s',
      process.pid, cfg.htpport,
      env);
  });

});


// If the connection throws an error
mongoose.connection.on("error", function(err) {
  console.error('Failed to connect on startup ', mongoConnStr, err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected.');
});

try {
  var options = {};
  // options.server.socketOptions = options.replset.socketOptions = { keepAlive: 1 };
  mongoose.connect(mongoConnStr, options);
  console.log("Trying to connect to DB ", mongoConnStr);
} catch (err) {
  console.log("Sever initialization failed " , err.message);
}