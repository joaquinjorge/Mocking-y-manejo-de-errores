const ProductsController = require("../controller/products.controller.js");

const Router = require("express").Router;

const productsRouter = Router();

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

productsRouter.get("/", ProductsController.getProducts);
productsRouter.post("/", auth1(["ADMIN"]), ProductsController.createProducts);

productsRouter.put("/:id", auth1(["ADMIN"]), ProductsController.updateProducts);

productsRouter.delete(
  "/:pid",
  auth1(["ADMIN"]),
  ProductsController.deleteProducts
);

productsRouter.get("/:pid", ProductsController.getProductsById);
module.exports = productsRouter;
