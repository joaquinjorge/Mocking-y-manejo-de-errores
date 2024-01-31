const crypto = require("crypto");
const Router = require("express").Router;
const usuariosModelo = require("../dao/models/usuarios.js");
const passport = require("passport");
const passportCall = require("../utils.js");
const SessionController = require("../controller/session.controller.js");
const sessionRouter = Router();

sessionRouter.get(
  "/github",
  passport.authenticate("github", {}),
  (req, res) => {
    console.log("hola");
  }
);

sessionRouter.get(
  "/callbackGithub",
  passport.authenticate("github", {
    failureRedirect: "/api/sessions/errorGithub",
  }),
  SessionController.getSessionUsuario
);

sessionRouter.get("/errorGithub", SessionController.githubError);
sessionRouter.get("/current", SessionController.getCurrentSession),
  sessionRouter.post(
    "/login",
    passportCall("login"),
    SessionController.getSessionUsuario
  );

sessionRouter.post(
  "/registro",
  passportCall("registro"),
  SessionController.registro
);

sessionRouter.get("/logout", SessionController.disconnect);

module.exports = sessionRouter;
