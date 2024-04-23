const fs = require("fs");

const path = require("path");
const ProductManager = require("../dao/productManager");
const cartsModelo = require("../dao/models/carts.js");
const productosModelo = require("../dao/models/products.js");
const mongoose = require("mongoose");
const CartsController = require("../controller/cart.controller.js");
let ruta = path.join(__dirname, "..", "archivos", "carrito.json");
let ruta2 = path.join(__dirname, "..", "archivos", "objetos.json");
const Router = require("express").Router;

const cartRouter = Router();
let pm01 = new ProductManager(ruta2);
let pm02 = new ProductManager(ruta);
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
cartRouter.post("/", auth1(["ADMIN"]), CartsController.createCart);

cartRouter.get("/", CartsController.getCarts);

cartRouter.get("/:cid", CartsController.getCartsById);

cartRouter.post(
  "/:cid/product/:pid",auth1(["ADMIN","USUARIO","PREMIUM"]),
  
  CartsController.addProductToCart
);
cartRouter.delete(
  "/:cid/product/:pid",auth1(["ADMIN","USUARIO","PREMIUM"]),

  CartsController.deleteProductCart
);

cartRouter.delete("/:cid",auth1(["ADMIN"]), CartsController.deleteCart);
cartRouter.post(
  "/:cid/purchase",
  
  CartsController.purchaseCart
);

module.exports = cartRouter;
