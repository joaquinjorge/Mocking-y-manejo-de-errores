const mongoose = require("mongoose");
const cartsModelo = require("../dao/models/carts.js");
const cartsService = require("../services/carts.service.js");
const productsService = require("../services/products.service.js");
const usuariosModelo = require("../dao/models/usuarios.js");
const ticketModelo = require("../dao/models/ticket.js");
const { v4: uuidv4 } = require("uuid");
const ticketsService = require("../services/ticket.service.js");
const usuariosService = require("../repository/usuarios.services.js");
const errors = require("../customError.js");
const errorHandler = require("../errorHandler.js");

class CartsController {
  constructor() {}

  static async getCarts(req, res) {
    let carritos = [];

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
      const error = new Error(errors.INVALID_ID);
      const { message, status } = errorHandler(
        error,
        `el id: ${id} no es valido`
      );
      res.setHeader("Content-Type", "application/json");
      return res
        .status(status)
        .json({ error: errors.INVALID_ID, detalle: message });
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
      const error = new Error(errors.CART_NOT_FOUND);
      const { message, status } = errorHandler(error,`el carrito con id ${id} no se encontro en DB`);
      res.setHeader("Content-Type", "application/json");
      return res.status(status).json({ error:errors.CART_NOT_FOUND,detalle:message });
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
      const error = new Error(errors.INVALID_ID);
      const { message, status } = errorHandler(
        error,
        `el cid: ${cid} o el pid: ${pid} no son validos`
      );
      res.setHeader("Content-Type", "application/json");
      return res
        .status(status)
        .json({ error: errors.INVALID_ID, detalle: message });
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
      const error = new Error(errors.CART_NOT_FOUND);
      const { message, status } = errorHandler(error,`el carrito con id ${cid} no se encontro en DB`);
      res.setHeader("Content-Type", "application/json");
      return res.status(status).json({ error:errors.CART_NOT_FOUND,detalle:message });
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
      const error = new Error(errors.PRODUCT_NOT_FOUND);
      const { message, status } = errorHandler(error,`el producto con id ${pid} no se encontro en DB`);
      res.setHeader("Content-Type", "application/json");
      return res.status(status).json({ error:errors.PRODUCT_NOT_FOUND,detalle:message });
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
      const error = new Error(errors.INVALID_ID);
      const { message, status } = errorHandler(
        error,
        `el cid: ${cid} o el pid: ${pid} no son validos`
      );
      res.setHeader("Content-Type", "application/json");
      return res
        .status(status)
        .json({ error: errors.INVALID_ID, detalle: message });
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
      const error = new Error(errors.CART_NOT_FOUND);
      const { message, status } = errorHandler(error,`el producto con id ${cid} no se encontro en DB`);
      res.setHeader("Content-Type", "application/json");
      return res.status(status).json({ error:errors.CART_NOT_FOUND,detalle:message });
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
      const error = new Error(errors.PRODUCT_NOT_FOUND);
      const { message, status } = errorHandler(error,`el producto con id ${pid} no se encontro en DB`);
      res.setHeader("Content-Type", "application/json");
      return res.status(status).json({ error:errors.PRODUCT_NOT_FOUND,detalle:message });
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
      const error = new Error(errors.INVALID_ID);
      const { message, status } = errorHandler(
        error,
        `el id: ${carritoId } no es valido`
      );
      res.setHeader("Content-Type", "application/json");
      return res
        .status(status)
        .json({ error: errors.INVALID_ID, detalle: message });
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

  static async purchaseCart(req, res) {
    try {
      let { cid } = req.params;
      let usuario = await usuariosService.getUsuarioById({
        email: req.session.usuario.email,
      });

      if (!mongoose.isValidObjectId(cid)) {
        const error = new Error(errors.INVALID_ID);
      const { message, status } = errorHandler(
        error,
        `el id: ${cid } no es valido`
      );
      res.setHeader("Content-Type", "application/json");
      return res
        .status(status)
        .json({ error: errors.INVALID_ID, detalle: message });
      }

      if (cid !== usuario.cart._id.toString()) {
        return res.status(400).json({
          error: `el carrito no pertenece al usuario ${req.session.usuario.email}`,
        });
      }
      const cart = await cartsService.getCartById({ _id: cid });
      const productsToPurchase = cart.products;

      const productsNotPurchased = [];
      const productsPurchased = [];
      if (cart.products.length === 0) {
        return res.status(400).json({
          error: `el carrito no tiene productos`,
        });
      }
      for (const item of productsToPurchase) {
        const product = await productsService.getProductById({
          _id: item.product._id,
        });
        if (product.stock >= item.quantity) {
          await productsService.updateProduct(
            { _id: product._id },
            {
              $inc: { stock: -item.quantity },
            }
          );
          productsPurchased.push(item);
        } else {
          productsNotPurchased.push(item);
        }
      }

      await cartsService.updateCart(
        { _id: cid },
        { $set: { products: productsNotPurchased } }
      );

      let totalAmount = 0;

      for (const item of productsPurchased) {
        totalAmount += item.product.price * item.quantity;
      }
      const uniqueId = uuidv4().toString();

      const newTicket = {
        code: uniqueId,

        amount: totalAmount,
        purchaser: req.session.usuario.email,
      };
      ticketsService.createTicket(newTicket);
      if (productsNotPurchased.length > 0) {
        return res.status(200).json({ productsNotPurchased });
      }

      res.status(200).json({ newTicket });
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
