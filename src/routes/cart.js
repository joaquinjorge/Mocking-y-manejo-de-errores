const fs = require("fs");

const path = require("path");
const ProductManager = require("../dao/productManager");
const cartsModelo = require("../dao/models/carts.js");
const productosModelo = require("../dao/models/products.js");
const mongoose = require("mongoose");
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
cartRouter.post("/", auth1(["ADMIN"]), async (req, res) => {
  let carrito = [];

  try {
    carrito = await cartsModelo.create({ products: [] });
  } catch (error) {
    console.log("no se pudo crear un carrito", error.message);
  }
  res.setHeader("Content-Type", "application/json");
  res.status(201).json({ carrito });
});

cartRouter.get("/", async (req, res) => {
  let carritos = [];
  try {
    carritos = await cartsModelo
      .find({ deleted: false })
      .populate("products.product")
      .lean();
  } catch (error) {
    console.log(error.message);
  }
  res.status(200).json({ carritos });
});

cartRouter.get("/:cid", async (req, res) => {
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

  res.setHeader("Content-Type", "application/json");
  return res.status(200).json({ carrito: existe });
});

cartRouter.post("/:cid/product/:pid", auth1(["ADMIN"]), async (req, res) => {
  let { cid, pid } = req.params;

  if (!mongoose.isValidObjectId(cid) || !mongoose.isValidObjectId(pid)) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `Indique un id válido` });
  }

  let existeCarrito;
  try {
    existeCarrito = await cartsModelo.findOne({ deleted: false, _id: cid });
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(500)
      .json({ error: `Error al buscar carrito`, message: error.message });
  }

  if (!existeCarrito) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `No existe carrito con id ${cid}` });
  }

  let existeProducto;
  try {
    existeProducto = await productosModelo.findOne({
      deleted: false,
      _id: pid,
    });
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(500)
      .json({ error: `Error al buscar producto`, message: error.message });
  }

  if (!existeProducto) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `No existe producto con id ${pid}` });
  }

  let resultado;
  let cantidad = 1;
  if (req.body.quantity) {
    cantidad = req.body.quantity;
  }

  let indice = existeCarrito.products.findIndex(
    (p) => p.product._id == existeProducto._id.toString()
  );
  if (indice === -1) {
    existeCarrito.products.push({
      product: existeProducto._id,
      quantity: cantidad,
    });
  } else {
    existeCarrito.products[indice].quantity =
      existeCarrito.products[indice].quantity + cantidad;
  }

  try {
    resultado = await cartsModelo.updateOne(
      { deleted: false, _id: cid },
      existeCarrito
    );

    if (resultado.modifiedCount > 0) {
      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({ payload: "modificación realizada" });
    } else {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(200)
        .json({ message: "No se modificó ningún producto" });
    }
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(500)
      .json({ error: `Error inesperado`, message: error.message });
  }
});
cartRouter.delete("/:cid/product/:pid", auth1(["ADMIN"]), async (req, res) => {
  let { cid, pid } = req.params;
  if (!mongoose.isValidObjectId(cid) || !mongoose.isValidObjectId(pid)) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `Indique un id válido` });
  }

  let existeCarrito;
  try {
    existeCarrito = await cartsModelo.findOne({ deleted: false, _id: cid });
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(500)
      .json({ error: `Error al buscar carrito`, message: error.message });
  }

  if (!existeCarrito) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `No existe carrito con id ${cid}` });
  }

  let existeProducto;
  try {
    existeProducto = await productosModelo.findOne({
      deleted: false,
      _id: pid,
    });
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(500)
      .json({ error: `Error al buscar producto`, message: error.message });
  }

  if (!existeProducto) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `No existe producto con id ${pid}` });
  }

  let resultado;

  try {
    resultado = await cartsModelo.updateOne(
      { deleted: false, _id: cid, "products.product": pid },
      { $pull: { products: { product: pid } } }
    );

    if (resultado.modifiedCount > 0) {
      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({ payload: "modificación realizada" });
    } else {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(200)
        .json({ message: "No se modificó ningún producto" });
    }
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(500)
      .json({ error: `Error inesperado`, message: error.message });
  }
});

cartRouter.delete("/:cid", auth1(["ADMIN"]), async (req, res) => {
  const carritoId = req.params.cid;
  if (!mongoose.isValidObjectId(carritoId)) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `Indique un id válido` });
  }
  try {
    const resultado = await cartsModelo.updateOne(
      { _id: carritoId },
      { $set: { products: [] } }
    );

    if (resultado.modifiedCount > 0) {
      res.status(200).json({
        message: "Todos los productos han sido eliminados del carrito",
      });
    } else {
      res.status(400).json({ error: "No se encontró el carrito" });
    }
  } catch (error) {
    res.status(500).json({
      error:
        `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador` +
        error.message,
    });
  }
});

module.exports = cartRouter;
