const supertest = require("supertest");
const bcrypt = require("bcrypt");
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

describe("ecommerce users testing", async function () {
  this.timeout(5000);

  describe("Testing users module", async function () {
    after(async () => {
      try {
        let user = await mongoose.connection
          .collection("usuarios")
          .findOne({ email: "test@example.com" });

        if (user) {
          let userCartId = user.cart._id;

          if (mongoose.Types.ObjectId.isValid(userCartId)) {
            let cartObjectId = new mongoose.Types.ObjectId(userCartId);
            await mongoose.connection
              .collection("usuarios")
              .deleteMany({ email: "test@example.com" });
            await mongoose.connection
              .collection("carts")
              .deleteOne({ _id: cartObjectId });
            console.log("usuario prueba eliminado");
          } else {
            console.log("Invalid cart ID format.");
          }
        } else {
          console.log("User not found.");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    });

    let cookie;

    it("Testing /api/sessions to create user", async () => {
      let user = {
        nombre: "Testing",
        apellido: "Testing",
        email: "test@example.com",
        edad: 22,
        password: "1234",
      };

      let testing = await requester.post("/api/sessions/registro").send(user);
      let userDB = await mongoose.connection
        .collection("usuarios")
        .findOne({ email: "test@example.com" });
      console.log(userDB);
      expect(testing.statusCode).to.be.equal(302);

      expect(userDB).exist;
      expect(userDB.email).to.be.equal("test@example.com");
      expect(userDB.cart).exist;
      expect(bcrypt.compareSync(user.password, userDB.password)).to.be.true;
    });

    it("Testing /api/sessions to login user", async () => {
      let user = {
        email: "test@example.com",
        password: "1234",
      };

      let testing = await requester.post("/api/sessions/login").send(user);

      console.log(testing.text);

      expect(testing.statusCode).to.be.equal(302);

      expect(testing.text).to.exist.and.to.be.equal(
        "Found. Redirecting to /products"
      );
    });
    
    
  });
});
