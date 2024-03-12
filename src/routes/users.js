const UsersController = require("../controller/users.controller.js");

const Router = require("express").Router;

const usersRouter = Router();

const auth1 = (permisos = []) =>
  function (req, res, next) {
    permisos = permisos.map((p) => p.toLowerCase());

    if (permisos.includes("PUBLIC")) {
      return next();
    }

    if (!req.session.usuario || !req.session.usuario.rol) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(401)
        .json({ error: `No hay usuarios autenticados...!!!` });
    }

    if (!permisos.includes(req.session.usuario.rol.toLowerCase())) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(403)
        .json({ error: `No tiene privilegios suficientes para este recurso` });
    }

    return next();
  };

usersRouter.get("/", UsersController.getUsers);
usersRouter.post(
  "/premium/:uid",
  auth1(["USUARIO", "PREMIUM"]),
  UsersController.changeUsersRol
);

usersRouter.get("/:uid", UsersController.getUsersById);

module.exports = usersRouter;
