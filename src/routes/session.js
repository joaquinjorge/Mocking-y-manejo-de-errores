const Router = require("express").Router;

const crypto = require("crypto");
const usuariosModelo = require("../dao/models/usuarios.js");
const sessionRouter = Router();

sessionRouter.post("/login", async (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) {
    return res.redirect("/login?error=Complete todos los datos");
  }

  password = crypto
    .createHmac("sha256", "codercoder123")
    .update(password)
    .digest("hex");

  let usuario = await usuariosModelo.findOne({ email, password });
  let admin = false;

  if (!usuario) {
    return res.redirect(`/login?error=credenciales incorrectas`);
  }

  req.session.usuario = {
    nombre: usuario.nombre,
    email: usuario.email,
    rol:
      email == "adminCoder@coder.com" &&
      password ==
        "3f27ea771161dd1250ddefaea6c8c3fdc89e42f5d0520e75c13297ccfe414bd3"
        ? "admin"
        : "user",
  };

  res.redirect("/products");
});

sessionRouter.post("/registro", async (req, res) => {
  let { nombre, email, password } = req.body;
  if (!nombre || !email || !password) {
    return res.redirect("/registro?error=Complete todos los datos");
  }

  let regMail =
    /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/;
  console.log(regMail.test(email));
  if (!regMail.test(email)) {
    return res.redirect("/registro?error=Mail con formato incorrecto...!!!");
  }

  let existe = await usuariosModelo.findOne({ email });
  if (existe) {
    return res.redirect(
      `/registro?error=Existen usuarios con email ${email} en la BD`
    );
  }

  password = crypto
    .createHmac("sha256", "codercoder123")
    .update(password)
    .digest("hex");
  let usuario;
  try {
    usuario = await usuariosModelo.create({ nombre, email, password });
    res.redirect(`/login?mensaje=Usuario ${email} registrado correctamente`);
  } catch (error) {
    res.redirect("/registro?error=Error inesperado. Reintente en unos minutos");
  }
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
