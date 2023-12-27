const path = require("path");
const ProductManager = require("../dao/productManager");
const productosModelo = require("../dao/models/products.js");
const cartsModelo = require("../dao/models/carts.js");
const mongoose = require("mongoose");

let ruta = path.join(__dirname, "..", "archivos", "objetos.json");

const Router = require("express").Router;

const vistasRouter = Router();
let pm01 = new ProductManager(ruta);

const auth = (req, res, next) => {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }

  next();
};

const auth2 = (req, res, next) => {
  if (req.session.usuario) {
    return res.redirect("/products");
  }

  next();
};

vistasRouter.get("/products", auth, async (req, res) => {
  let pagina = 1;
  if (req.query.pagina) {
    pagina = req.query.pagina;
  }

  let productos;
  try {
    // usuarios=await usuariosModelo.find().lean()
    productos = await productosModelo.paginate(
      { deleted: false },
      { lean: true, limit: 5, page: pagina }
    );
    console.log(productos);
  } catch (error) {
    console.log(error);
    productos = [];
  }
  let user = req.session.usuario;
  let { totalPages, hasNextPage, hasPrevPage, prevPage, nextPage } = productos;

  res.status(200).render("products", {
    productos: productos.docs,
    totalPages,
    hasNextPage,
    hasPrevPage,
    prevPage,
    nextPage,
    titulo: "Product Page",
    estilo: "stylesHome",
    user,
    login: req.session.usuario ? true : false,
  });
});

vistasRouter.get("/realtimeproducts", auth, async (req, res) => {
  let products = await productosModelo.find();
  res.status(200).render("realTimeProducts", {
    products,
    titulo: "Real Time Products",
    estilo: "stylesHome",
    login: req.session.usuario ? true : false,
  });
});
vistasRouter.get("/", auth, async (req, res) => {
  let products = await productosModelo.find();
  res.status(200).render("home", {
    products,
    titulo: "Home page",
    estilo: "stylesHome",
    login: req.session.usuario ? true : false,
  });
});

vistasRouter.get("/carts", auth, async (req, res) => {
  let carts = await cartsModelo.find().populate();

  res.status(200).render("carts", {
    carts,
    titulo: "Carts",
    estilo: "stylesHome",
    login: req.session.usuario ? true : false,
  });
});
vistasRouter.get("/cart/:cid", auth, async (req, res) => {
  let id = req.params.cid;

  if (!mongoose.isValidObjectId(id)) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `Indique un id válido` });
  }

  let existe;

  try {
    existe = await cartsModelo.findOne({ deleted: false, _id: id });
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(500)
      .json({ error: `No se encontro el carrito`, message: error.message });
  }

  if (!existe) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `No existe carrito con id ${id}` });
  }

  res.status(200).render("cart", auth, {
    existe,
    titulo: "Carts",
    estilo: "stylesHome",
    login: req.session.usuario ? true : false,
  });
});

vistasRouter.get("/chat", auth, (req, res) => {
  res.status(200).render("chat", {
    titulo: "Chat",
    estilo: "styles",
    login: req.session.usuario ? true : false,
  });
});

vistasRouter.get("/perfil", auth, (req, res) => {
  let usuario = req.session.usuario;
  console.log(req.session.usuario);

  res.setHeader("Content-Type", "text/html");
  res
    .status(200)
    .render("perfil", { usuario, login: req.session.usuario ? true : false });
});
vistasRouter.get("/login", auth2, (req, res) => {
  let { error, mensaje } = req.query;

  res.setHeader("Content-Type", "text/html");
  res
    .status(200)
    .render("login", {
      error,
      mensaje,
      login: req.session.usuario ? true : false,
    });
});

vistasRouter.get("/registro", (req, res) => {
  let { error } = req.query;

  res.setHeader("Content-Type", "text/html");
  res
    .status(200)
    .render("registro", { error, login: req.session.usuario ? true : false });
});
module.exports = vistasRouter;
