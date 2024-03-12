const productsService = require("../services/products.service.js");
const mongoose = require("mongoose");
const cartsModelo = require("../dao/models/carts.js");
const cartsService = require("../services/carts.service.js");
const errors = require("../customError.js");
const errorHandler = require("../errorHandler.js");
class VistasController {
  constructor() {}
  static async getProducts(req, res) {
    let pagina = 1;
    if (req.query.pagina) {
      pagina = req.query.pagina;
    }
    let { error } = req.query;
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
      error,
    });
  }

  static async agregarProductos(req, res) {
    res.status(200).render("agregarProducto", {
      titulo: "agregarProducto",
      estilo: "stylesHome",
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

  static async getRecupero01(req, res) {
    let { error } = req.query;

    res.setHeader("Content-Type", "text/html");
    res.status(200).render("recupero01", {
      error,
      login: req.session.usuario ? true : false,
      estilo: "stylesHome",
    });
  }

  static async getRecupero02(req, res) {
    let { error, mensaje, token } = req.query;

    res.setHeader("Content-Type", "text/html");
    res.status(200).render("recupero02", {
      error,
      mensaje,
      token,
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

    if (existeProducto.owner) {
      if (existeProducto.owner == req.session.usuario.email) {
        return res.redirect(
          "/products?error=no puedes agregar un producto creado por ti"
        );
      }
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
        Number(existeCarrito.products[indice].quantity) + Number(cantidad);
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
  static async deleteProducts(req, res) {
    let id = req.params.pid;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.logger.error(`el id ${id}no es un id valido de mongoose `);
      const error = new Error(errors.INVALID_ID, `el id ${id} es invalido`);
      const { message, status } = errorHandler(error);
      res.setHeader("Content-Type", "application/json");
      return res
        .status(status)
        .json({ error: errors.INVALID_ID, detalle: message });
    }
    let productos = await productsService.getProductById({ _id: id });
    console.log(productos.owner);
    console.log(req.session.usuario.email);
    if (!productos) {
      req.logger.error(`El producto con id ${id} no se encontro en la DB`);
      const error = new Error(
        errors.PRODUCT_NOT_FOUND,
        `El producto con id ${id} no se encontro en la DB`
      );
      const { message, status } = errorHandler(error);
      res.setHeader("Content-Type", "application/json");
      return res
        .status(status)
        .json({ error: errors.PRODUCT_NOT_FOUND, detalle: message });
    }
    let productoEliminado;

    try {
      if (req.session.usuario.rol === "admin") {
        productoEliminado = await productsService.deleteProduct(id);
        req.logger.info("producto eliminado con exito");

        res.setHeader("Content-Type", "application/json");
        return res.status(200).json({ payload: "Eliminacion realizada" });
      }

      if (
        req.session.usuario.rol === "premium" &&
        productos.owner === req.session.usuario.email
      ) {
        productoEliminado = await productsService.deleteProduct(id);
        req.logger.info("producto eliminado con exito");

        res.setHeader("Content-Type", "application/json");
        return res.status(200).json({ payload: "Eliminacion realizada" });
      }

      res.setHeader("Content-Type", "application/json");
      return res
        .status(403)
        .json({ message: "No tienes permiso para eliminar este producto" });
    } catch (error) {
      req.logger.error(error.message);
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
        detalle: error.message,
      });
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
