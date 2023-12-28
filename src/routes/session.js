const Router = require("express").Router;

const crypto = require("crypto");
const usuariosModelo = require("../dao/models/usuarios.js");
const passport = require("passport");
const sessionRouter = Router();
sessionRouter.get("/errorLogin", (req, res) => {
  return res.redirect("/login?error=Error en el proceso de login... :(");
});
sessionRouter.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "/api/sessions/errorLogin",
  }),
  async (req, res) => {
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
      nombre: req.user.nombre,
      email: req.user.email,
      rol:
        email == "adminCoder@coder.com" && password == "adminCod3r123"
          ? "admin"
          : "user",
    };

    res.redirect("/products");
  }
);

sessionRouter.get('/github', passport.authenticate('github',{}), (req,res)=>{})
sessionRouter.get("/errorRegistro", (req, res) => {
  return res.redirect("/registro?error=Error en el proceso de registro");
});
sessionRouter.get('/callbackGithub', passport.authenticate('github',{failureRedirect:"/api/sessions/errorGithub"}), (req,res)=>{
    
  console.log(req.user)
  req.session.usuario=req.user
  res.setHeader('Content-Type','application/json');
  res.status(200).json({
      message:"Acceso OK...!!!", usuario: req.user
  });
});
sessionRouter.get('/errorGithub',(req,res)=>{
    
  res.setHeader('Content-Type','application/json');
  res.status(200).json({
      error: "Error al autenticar con Github"
  });
});
sessionRouter.post(
  "/registro",
  passport.authenticate("registro", {
    failureRedirect: "/api/sessions/errorRegistro",
  }),
  async (req, res) => {
    let { email } = req.body;

    res.redirect(`/login?mensaje=Usuario ${email} registrado correctamente`);
  }
);

sessionRouter.get("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      res.redirect("/login?error=fallo en el logout");
    }
  });

  res.redirect("/login");
});
module.exports = sessionRouter;
