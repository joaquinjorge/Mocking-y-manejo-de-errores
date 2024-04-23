const express = require("express");
const path = require("path");
const { engine } = require("express-handlebars");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const sessions = require("express-session");
const mongoStore = require("connect-mongo");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const productsRouter = require("./routes/products.js");
const cartRouter = require("./routes/cart.js");
const vistasRouter = require("./routes/vistas.js");
const messagesModelo = require("./dao/models/messages.js");
const sessionRouter = require("./routes/session.js");
const passport = require("passport");
const inicializarPassport = require("./config/config.passport.js");
const configDotenv = require("./config/config.js");
const middLog = require("./logger/winston.js");
const usersRouter = require("./routes/users.js");
const PORT=configDotenv.PORT||8080
const app = express();


const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: "API de Ecommerce ",
      description: " Documentación de Ecommerce "
    }
  },
  apis: ["../src/docs/*.yaml"]
}

const specs=swaggerJSDoc(swaggerOptions)
app.use("/api-docs",swaggerUi.serve, swaggerUi.setup(specs))

app.use(
  sessions({
    secret: configDotenv.sessions.SECRET,
    resave: true,
    saveUninitialized: true,
    store: mongoStore.create({
      mongoUrl: configDotenv.MONGO_URL,

      ttl: 3600,
    }),
  })
);

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "/views"));
app.use(middLog);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
inicializarPassport();
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "/public")));

try {
  mongoose.connect(configDotenv.MONGO_URL);
  console.log("conectado a DB");
} catch (error) {
  console.log("no se pudo conectar a la base de datos" + error);
}
app.use("/api/sessions", sessionRouter);

app.use(
  "/api/products",
  (req, res, next) => {
    req.io = io;

    next();
  },
  productsRouter
);
app.use("/api/carts", cartRouter);
app.use("/", vistasRouter);
app.use("/api/users", usersRouter);

const server = app.listen(PORT, () =>
  console.log("el servidor esta listo")
);
const io = new Server(server);

const entornoChat = async () => {
  io.on("connection", async (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);
    socket.on("id", async (nombre) => {
      await messagesModelo.create({ user: nombre, id: socket.id });

      socket.broadcast.emit("nuevoUsuario", nombre);
      let mensajesGuardados = await messagesModelo.find();
      socket.emit("hello", mensajesGuardados);
    });

    socket.on("mensaje", async (datos) => {
      await messagesModelo.updateOne(
        { id: socket.id },
        { $push: { message: datos.mensaje } }
      );

      io.emit("nuevoMensaje", datos);
    });

    socket.on("disconnect", async () => {
      let usuario = await messagesModelo.findOne(
        { id: socket.id },
        { _id: 0, user: 1 }
      );
      if (usuario) {
        io.emit("usuarioDesconectado", usuario.user);
      }
    });
  });
};
entornoChat();
module.exports = io;
