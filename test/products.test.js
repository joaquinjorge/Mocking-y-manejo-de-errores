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
describe("ecommerce products testing", async function () {
  this.timeout(5000);

  describe("Testing products module", async function () {
    before(async () => {
      let user = {
        email: "adminCoder@coder.com",
        password: "adminCod3r123",
      };

      let testing = await requester.post("/api/sessions/login").send(user);
    });

    after(async () => {
      await mongoose.connection
        .collection("products")
        .deleteOne({ code: "testCode123" });
    });

    it("Testing /api/products to get products", async () => {
      let testing = await requester.get("/api/products");

      expect(testing.statusCode).to.be.equal(200);
      expect(testing.body).exist;
      expect(testing.body.status).to.exist.and.to.be.equal("success");
      expect(testing.body.payload).exist;
      expect(testing.body.payload).to.be.an("array").that.is.not.empty;
    });

    it("Testing /api/products to create product", async function () {
      let product = {
        title: "test",
        description: "test",
        category: "test",
        price: 22,
        code: "testCode123",
        stock: 22,
      };

      let testing = await requester
        .post("/api/products")
        .send(product)
        

      let productDB = await mongoose.connection
        .collection("products")
        .findOne({ code: "testCode123" });

      expect(testing.statusCode).to.be.equal(201);
      
      expect(productDB).exist;
      expect(productDB.code).to.be.equal("testCode123");
    });

    it("Testing /api/products delete product", async function () {
      let productDB = await mongoose.connection
        .collection("products")
        .findOne({ code: "testCode123" });
      const id = productDB._id.toString();
      let testing = await requester
        .delete(`/api/products/${id}`)
        
      let updatedProduct = await mongoose.connection
        .collection("products")
        .findOne({ code: "testCode123" });

      expect(testing.statusCode).to.be.equal(200);
    
      expect(updatedProduct.deleted).to.be.true;
    });
  });
});
