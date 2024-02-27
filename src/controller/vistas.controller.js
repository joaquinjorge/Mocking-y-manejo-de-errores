const productsService = require("../services/products.service.js");
const mongoose = require("mongoose");
const cartsModelo = require("../dao/models/carts.js");
const cartsService = require("../services/carts.service.js");
class VistasController {
  constructor() {}
  static async getProducts(req, res) {
    let pagina = 1;
    if (req.query.pagina) {
      pagina = req.query.pagina;
    }

    let productos;
    try {
      // usuarios=await usuariosModelo.find().lean()
      productos = await productsService.getProducts(
        { deleted: false },
        { lean: true, limit: 5, page: pagina }
      );
    } catch (error) {
     req.logger.error(error.message);
      productos = [];
    }
    let user = req.session.usuario;
    let { totalPages, hasNextPage, hasPrevPage, prevPage, nextPage } =
      productos;

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
  }
  static async getProductsRealTime(req, res) {
    let products = await productsService.getProduct();
    res.status(200).render("realTimeProducts", {
      products,
      titulo: "Real Time Products",
      estilo: "stylesHome",
      login: req.session.usuario ? true : false,
    });
  }
  static async homePage(req, res) {
    let products = await productsService.getProduct();
    res.status(200).render("home", {
      products,
      titulo: "Home page",
      estilo: "stylesHome",
      login: req.session.usuario ? true : false,
    });
  }

  static async getCarts(req, res) {
    let carts = await cartsModelo.find().populate();

    res.status(200).render("carts", {
      carts,
      titulo: "Carts",
      estilo: "stylesHome",
      login: req.session.usuario ? true : false,
    });
  }

  static async getCartsId(req, res) {
    let id = req.params.cid;

    if (!mongoose.isValidObjectId(id)) {
      req.logger.warning(`el id :${id} no es un id valido de mongoose`);
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

    res.status(200).render("cart", {
      existe,
      titulo: "Carts",
      estilo: "stylesHome",
      login: req.session.usuario ? true : false,
    });
  }

  static async getChat(req, res) {
    res.status(200).render("chat", {
      titulo: "Chat",
      estilo: "styles",
      login: req.session.usuario ? true : false,
    });
  }
  static async getPerfil(req, res) {
    let usuario = req.session.usuario;

    res.setHeader("Content-Type", "text/html");
    res
      .status(200)
      .render("perfil", { usuario, login: req.session.usuario ? true : false });
  }
  static async getlogin(req, res) {
    let { error, mensaje } = req.query;

    res.setHeader("Content-Type", "text/html");
    res.status(200).render("login", {
      error,
      mensaje,
      login: req.session.usuario ? true : false,
    });
  }

  static async getRegistro(req, res) {
    let { error } = req.query;

    res.setHeader("Content-Type", "text/html");
    res.status(200).render("registro", {
      error,
      login: req.session.usuario ? true : false,
      estilo: "stylesHome",
    });
  }

  static async addProductToCart(req, res) {
    let { cid, pid } = req.params;

    if (!mongoose.isValidObjectId(cid) || !mongoose.isValidObjectId(pid)) {
      req.logger.warning(`el id  no es un id valido de mongoose`);
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
        return res.redirect("/cart/" + cid);
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
      req.logger.warning(`el id  no es un id valido de mongoose`);
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
        return res.redirect("/cart/" + cid);
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
}

module.exports = VistasController;
