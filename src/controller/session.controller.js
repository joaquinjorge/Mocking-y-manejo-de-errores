const enviarEmail = require("../mails/mails.js");
const usuariosService = require("../repository/usuarios.services.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

class SessionController {
  constructor() {}

  static async getSessionUsuario(req, res) {
    req.session.usuario = {
      nombre: req.user.first_name,
      email: req.user.email,
      edad: req.user.age,
      apellido: req.user.last_name,
      rol: req.user.role,
      cart: req.user.cart,
      id: req.user._id,
    };
    req.logger.info(JSON.stringify(req.session.usuario));
    res.redirect("/products");
  }
  static async getCurrentSession(req, res) {
    if (!req.session.usuario) {
      res.status(400).json({
        status: "Bad Request",
        error: "no hay un usuario logueado actualmente",
      });
    } else {
      let usuario = await usuariosService.getUsuariosDto(
        req.session.usuario.email
      );
      req.logger.info(JSON.stringify(usuario));
      res.status(200).json({ currentUser: usuario });
    }
  }

  static async registro(req, res) {
    let { email } = req.body;

    res.redirect(`/login?mensaje=Usuario ${email} registrado correctamente`);
  }

  static async recupero01(req, res) {
    let { email } = req.body;
    let usuario = await usuariosService.getUsuarioById({ email });
    if (!usuario) {
      return res.redirect("/recupero01?error=email invalido");
    }
    delete usuario.password;
    let token = jwt.sign({ ...usuario }, "CoderCoder123", { expiresIn: "1h" });
    let mensaje = `Hola. Ha solicitado reiniciar... 
  Haga click en el siguiente link: <a href="http://localhost:8080/api/sessions/recupero02?token=${token}">Resetear Contraseña</a>
  `;
    let respuesta = await enviarEmail(email, "Recupero Password", mensaje);

    if (respuesta.accepted.length > 0) {
      res.redirect(
        `/login?mensaje=Recibierá en breve un mail... siga los pasos...`
      );
    } else {
      res.redirect("/login?error=Error al intentar recuperar contraseña");
    }
  }
  static async recupero02(req, res) {
    let { token } = req.query;

    try {
      let datosToken = jwt.verify(token, "CoderCoder123");

      res.redirect("/recupero02?token=" + token);
    } catch (error) {
      res.redirect("/recupero01?error=Error token:" + error.message);
    }
  }

  static async recupero03(req, res) {
    let { password, password2, token } = req.body;

    if (password !== password2) {
      res.setHeader("Content-Type", "application/json");
      return res.redirect(
        "/recupero02?error=contraseñas difieren&token=" + token
      );
    }
    try {
      let datosToken = jwt.verify(token, "CoderCoder123");
      let email = datosToken.email;

      let usuario = await usuariosService.getUsuarioById({ email });
      console.log(usuario);
      if (!usuario) {
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: `Error de usuario` });
      }
      if (bcrypt.compareSync(password, usuario.password)) {
        res.setHeader("Content-Type", "application/json");
        return res.redirect(
          "/recupero02?error=clave usada en el pasado ,no esta permitido&token=" +
            token
        );
      }

      let usuarioActualizado = {
        ...usuario,
        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
      };

      console.log(usuarioActualizado);
      await usuariosService.updateUsuarios(
        { email: datosToken.email },
        usuarioActualizado
      );

      res.redirect("/login?mensaje=Contraseña reseteada...!!!");
    } catch (error) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ error: error.message });
    }
  }

  static async disconnect(req, res) {
    req.session.destroy((error) => {
      if (error) {
        res.redirect("/login?error=fallo en el logout");
      }
    });

    res.redirect("/login");
  }

  static async githubError(req, res) {
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({
      error: "Error al autenticar con Github",
    });

    res.redirect("/login");
  }
}
module.exports = SessionController;
