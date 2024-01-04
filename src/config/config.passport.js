const bcrypt = require("bcrypt");

const creaHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));
const validaPassword = (usuario, password) =>
  bcrypt.compareSync(password, usuario.password);

const usuariosModelo = require("../dao/models/usuarios.js");
const passport = require("passport");
const local = require("passport-local");
const github = require("passport-github2");

const inicializarPassport = () => {
  passport.use(
    "github",
    new github.Strategy(
      {
        clientID: "Iv1.5fb3b9b47a45dc2d",
        clientSecret: "e9b3584ed84fb50d3cddb8957d7c586cdef0c979",
        callbackURL: "http://localhost:8080/api/sessions/callbackGithub",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // console.log(profile)
          let usuario = await usuariosModelo.findOne({
            email: profile._json.email,
          });
          if (!usuario) {
            let nuevoUsuario = {
              nombre: profile._json.name,
              email: profile._json.email,
            };

            usuario = await usuariosModelo.create(nuevoUsuario);
          }
          return done(null, usuario);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  passport.use(
    "registro",
    new local.Strategy(
      {
        passReqToCallback: true,
        usernameField: "email", //, passwordField: "clave"
      },
      async (req, username, password, done) => {
        try {
          console.log("Estrategia local registro de Passport...!!!");
          let { nombre, email } = req.body;
          if (!nombre || !email || !password) {
            // return res.redirect('/registro?error=Complete todos los datos')
            return done(null, false);
          }

          let regMail =
            /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/;
          console.log(regMail.test(email));
          if (!regMail.test(email)) {
            // return res.redirect('/registro?error=Mail con formato incorrecto...!!!')
            return done(null, false);
          }

          let existe = await usuariosModelo.findOne({ email });
          if (existe) {
            // return res.redirect(`/registro?error=Existen usuarios con email ${email} en la BD`)
            return done(null, false);
          }

          // password=crypto.createHmac("sha256", "codercoder123").update(password).digest("hex")
          password = creaHash(password);
          console.log(password);
          let usuario;
          try {
            usuario = await usuariosModelo.create({ nombre, email, password });
            // res.redirect(`/login?mensaje=Usuario ${email} registrado correctamente`)
            return done(null, usuario);
            // previo a devolver un usuario con done, passport graba en la req, una propiedad
            // user, con los datos del usuario. Luego podré hacer req.user
          } catch (error) {
            // res.redirect('/registro?error=Error inesperado. Reintente en unos minutos')
            return done(null, false);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "login",
    new local.Strategy(
      {
        usernameField: "email",
      },
      async (username, password, done) => {
        try {
          // let {email, password}=req.body
          if (!username || !password) {
            // return res.redirect('/login?error=Complete todos los datos')
            return done(null, false);
          }

          // password=crypto.createHmac("sha256", "codercoder123").update(password).digest("hex")

          let usuario = await usuariosModelo
            .findOne({ email: username })
            .lean();
          if (!usuario) {
            // return res.redirect(`/login?error=credenciales incorrectas`)
            return done(null, false);
          }
          if (!validaPassword(usuario, password)) {
            // return res.redirect(`/login?error=credenciales incorrectas`)
            return done(null, false);
          }

          console.log(Object.keys(usuario));
          delete usuario.password;
          return done(null, usuario);
          // previo a devolver un usuario con done, passport graba en la req, una propiedad
          // user, con los datos del usuario. Luego podré hacer req.user
        } catch (error) {
          done(error, null);
        }
      }
    )
  );

  // configurar serializador y deserializador
  passport.serializeUser((usuario, done) => {
    return done(null, usuario._id);
  });

  passport.deserializeUser(async (id, done) => {
    let usuario = await usuariosModelo.findById(id);
    return done(null, usuario);
  });
}; // fin inicializarPassport
module.exports = inicializarPassport;
