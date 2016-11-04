

module.exports = function (router, cfg) {

  function initialize() {

    var userService = require('./user/user.service')(cfg);
    router.get('/api/user/:email', userService.get);
    router.post('/user/authenticate', userService.authenticate);
    router.post('/user', userService.register);

  }

  return {
    initialize: initialize
  }
};