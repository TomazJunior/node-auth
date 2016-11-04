var expect = require('chai').expect;
var User = require('../user/user');
var constants = require('../util/constants');

describe('user model tests', function() {
  it('should be invalid if email is empty', function(done) {
    var user = new User();
    user.validate(function(err) {
      expect(err.errors.email).to.exist;
      done();
    });
  });

  it('should have validation error for incorrect role', function(done) {
    var user = new User({ role: "invalid role" });

    user.validate(function(err) {
      expect(err.errors.role).to.exist;
      done();
    });
  });

  it('should have validation error for no password', function(done) {
    var user = new User();

    user.validate(function(err) {
      expect(err.errors.password).to.exist;
      done();
    });
  });

  it('should be valid user', function(done) {
    var user = new User({ email: "tomaz.jr@gmail.com", role: constants.ROLES.admin, password:"123"});

    user.validate(function(err) {
      expect(err).to.not.exist;
      done();
    });
  });

  it('should validate valid password', function(done) {
    var originalPassword = '123';
    var user = new User({ email: "tomaz.jr@gmail.com", role: constants.ROLES.admin, password:"123"});

    user.password = user.generateHash(user.password);
    expect(user.validPassword(originalPassword)).to.be.true;
    done();
  });

  it('should do not validate valid password', function(done) {
    var originalPassword = '123';
    var user = new User({ email: "tomaz.jr@gmail.com", role: constants.ROLES.admin, password:"123"});

    user.password = user.generateHash(user.password);
    expect(user.validPassword("1235")).to.be.false;
    done();
  });

});