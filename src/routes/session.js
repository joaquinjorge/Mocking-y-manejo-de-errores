const crypto = require("crypto");
const Router = require("express").Router;
const usuariosModelo = require("../dao/models/usuarios.js");
const passport = require("passport");
const passportCall = require("../utils.js");
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
  (req, res) => {
    req.session.usuario = {
      nombre: req.user.first_name,
      email: req.user.email,
      edad: req.user.age,
      apellido: req.user.last_name,
      rol: req.user.role,
    };
    console.log(req.session.usuario);
    res.redirect("/products");
  }
);

sessionRouter.get("/errorGithub", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).json({
    error: "Error al autenticar con Github",
  });
});
sessionRouter.get("/current", async (req, res) => {
  if (!req.session.usuario) {
    res.status(400).json({
      status: "Bad Request",
      error: "no hay un usuario logueado actualmente",
    });
  } else {
    res.status(200).json({ status: "OK", usuarioActual: req.session.usuario });
  }
}),
  sessionRouter.post("/login", passportCall("login"), async (req, res) => {
    let { email, password } = req.body;
    // if (!email || !password) {
    //   return res.redirect("/login?error=Complete todos los datos");
    // }

    // password = crypto
    //   .createHmac("sha256", "codercoder123")
    //   .update(password)
    //   .digest("hex");

    // let usuario = await usuariosModelo.findOne({ email, password });
    // let admin = false;

    // if (!usuario) {
    //   return res.redirect(`/login?error=credenciales incorrectas`);
    // }

    req.session.usuario = {
      nombre: req.user.first_name,
      email: req.user.email,
      rol: req.user.role,
      apellido: req.user.last_name,
      edad: req.user.age,
    };
    console.log(req.session.usuario)
    res.redirect("/products");
  });

sessionRouter.post("/registro", passportCall("registro"), async (req, res) => {
  let { email } = req.body;

  res.redirect(`/login?mensaje=Usuario ${email} registrado correctamente`);
});

sessionRouter.get("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      res.redirect("/login?error=fallo en el logout");
    }
  });

  res.redirect("/login");
});
module.exports = sessionRouter;
