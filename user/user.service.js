var jwt = require("jsonwebtoken");
var moment = require("moment");

var userService = function (cfg) {
  this.cfg = cfg;

  var _updateStats = function (user, success, cb) {
    if (success) {
      user.attemptsfailure = 0;
      user.lastlogin = moment.utc(new Date());
    } else {
      user.attemptsfailure++;
    }
    user.save(cb);
  };

  var register = function(req, res, next) {
    var user = new req.models.User(req.body);
    user.validate(function (error) {
      if (error) { error.status = 400; return next(error); }
      user.password = user.generateHash(user.password);
      user.save(function (error, data) {
        if (error) { return next(error); }

        res.json({"data": "user registered."});
      })
    });
  };

  var get = function(req, res, next) {
    var email = req.params.email;
    if (!email) { error.status = 400; return next(new Error("Email is required.")); }

    req.models.User.findOne({"email": email}, function (error, data) {
      if (error) { return next(error); }
      res.json({"data": data ? data : "user nor found."});
    })
  };

  var authenticate = function(req, res, next) {
    var user = new req.models.User(req.body);

    user.validate(function (error) {
      if (error) { error.status = 400; return next(error); }
      req.models.User.findOne({"email": user.email}).select('+password').exec(function (error, data) {
        if (error) { return next(error); }
        if (!data) { return next(new Error("User not found.")); }

        try{
          // check if password matches
          if (!data.validPassword(req.body.password)) {
            _updateStats(data, false, function() {
              return next(new Error("Wrong password."));
            });
          } else {
            // if user is found and password is right
            // create a token
            var token = jwt.sign(user, this.cfg.secret, {
              expiresIn: 60 * 60 * 24 // expires in 24 hours
            });

            _updateStats(data, true, function() {
              res.json({"data": {token: token}});
            });
          }
        } catch(ex) {
          return next(ex);
        }
      })
    });
  };

  return {
    get: get,
    authenticate: authenticate,
    register: register
  }
};


module.exports = userService;


