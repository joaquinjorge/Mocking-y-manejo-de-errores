const mongoose = require("mongoose");
const cartsModelo = require("../dao/models/carts.js");
const cartsService = require("../services/carts.service.js");
const productsService = require("../services/products.service.js");

class CartsController {
  constructor() {}

  static async getCarts(req, res) {
    let carritos = [];
    products;
    try {
      carritos = await cartsService.getCart({ deleted: false });
    } catch (error) {
      console.log(error.message);
    }
    res.status(200).json({ carritos });
  }
  static async getCartsById(req, res) {
    let id = req.params.cid;

    if (!mongoose.isValidObjectId(id)) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `Indique un id válido` });
    }

    let existe;

    try {
      existe = await cartsService.getCartById({ deleted: false, _id: id });
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
  }
  static async createCart(req, res) {
    let carrito = [];

    try {
      carrito = await cartsService.createCart({ products: [] });
    } catch (error) {
      console.log("no se pudo crear un carrito", error.message);
    }
    res.setHeader("Content-Type", "application/json");
    res.status(201).json({ carrito });
  }
  static async addProductToCart(req, res) {
    let { cid, pid } = req.params;

    if (!mongoose.isValidObjectId(cid) || !mongoose.isValidObjectId(pid)) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `Indique un id válido` });
    }

    let existeCarrito;
    try {
      existeCarrito = await cartsService.getCartById({
        deleted: false,
        _id: cid,
      });
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
      existeProducto = await productsService.getProductById({
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
      return res
        .status(400)
        .json({ error: `No existe producto con id ${pid}` });
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
      resultado = await cartsService.updateCart(
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
  }
  static async deleteProductCart(req, res) {
    let { cid, pid } = req.params;
    if (!mongoose.isValidObjectId(cid) || !mongoose.isValidObjectId(pid)) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `Indique un id válido` });
    }

    let existeCarrito;
    try {
      existeCarrito = await cartsService.getCartById({
        deleted: false,
        _id: cid,
      });
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
      existeProducto = await productsService.getProductById({
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
      return res
        .status(400)
        .json({ error: `No existe producto con id ${pid}` });
    }

    let resultado;

    try {
      resultado = await cartsService.updateCart(
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
  }
  static async deleteCart(req, res) {
    const carritoId = req.params.cid;
    if (!mongoose.isValidObjectId(carritoId)) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `Indique un id válido` });
    }
    try {
      const resultado = await cartsService.updateCart(
        { _id: carritoId },
        { $set: { deleted: true } }
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
  }
}

module.exports = CartsController;
