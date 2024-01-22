const bcrypt = require("bcrypt");

const passport = require("passport");

const creaHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));
const validaPassword = (usuario, password) =>
  bcrypt.compareSync(password, usuario.password);
const passportCall = (estrategia) => {
  return function (req, res, next) {
    passport.authenticate(estrategia, function (err, user, info, status) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res
          .status(400)
          .redirect(
            `/${estrategia}?error=${
              info.message ? info.message : info.toString()
            }`
          );
      }
      req.user = user;
      return next();
    })(req, res, next);
  };
};
module.exports = passportCall;
