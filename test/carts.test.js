const supertest = require("supertest");

const mocha = require("mocha");
const { describe, it } = mocha;

const mongoose = require("mongoose");
const configDotenv = require("../src/config/config");
try {
  mongoose.connect(configDotenv.MONGO_URL);
  console.log("conectado a DB");
} catch (error) {
  console.log("no se pudo conectar a la base de datos" + error);
}

let expect;

import("chai").then((chai) => {
  expect = chai.expect;
});

let objectCartId;

const requester = supertest("http://localhost:8080");

describe("ecommerce carts testing", async function () {
  this.timeout(5000);

  describe("Testing carts module", async function () {
    before(async () => {
      let user = {
        email: "adminCoder@coder.com",
        password: "adminCod3r123",
      };

      let login = await requester.post("/api/sessions/login").send(user);
    });

    after(async () => {
      let response = await mongoose.connection
        .collection("carts")
        .deleteOne({ _id: objectCartId });
    });

    it("Testing /api/carts to get carts", async () => {
      let testing = await requester.get("/api/carts");

      expect(testing.statusCode).to.be.equal(200);
      expect(testing.body).exist;
      expect(testing.body).to.be.an("object").that.is.not.empty;
    });

    it("Testing /api/carts to create cart", async function () {
      let testing = await requester.post("/api/carts");

      let cartId = testing.body.cartId;
      objectCartId = new mongoose.Types.ObjectId(cartId);
      let createdCart = await mongoose.connection
        .collection("carts")
        .findOne({ _id: objectCartId });

      expect(testing.statusCode).to.be.equal(201);
      expect(testing.body.message).to.exist.and.to.be.equal("Cart created");
      expect(createdCart).exist;
      expect(createdCart._id).to.deep.equal(objectCartId);
    });

    it("Testing /api/carts to add product to cart", async function () {
      let productToTest = await mongoose.connection
        .collection("products")
        .findOne({ title: "producto prueba 4" });
      let productId = productToTest._id;
      let testing = await requester.post(
        `/api/carts/${objectCartId}/product/${productId}`
      );

      let cart = await mongoose.connection
        .collection("carts")
        .findOne({ _id: objectCartId });

      expect(testing.statusCode).to.be.equal(200);
      expect(testing.body.payload).exist;
      expect(cart.products).exist;
      expect(cart.products[0]).exist;
    });
  });
});
