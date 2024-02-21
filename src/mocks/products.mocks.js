const { faker } = require("@faker-js/faker");

const generaProducto = () => {
  return {
    title: faker.commerce.productName(),
    code:
      faker.string.alphanumeric(2) +
      faker.string.numeric({ length: 6, allowLeadingZeros: true }),
    description: faker.lorem.sentence(),
    price: faker.commerce.price(),
    stock: faker.number.int({ min: 10, max: 100 }),
    id: faker.database.mongodbObjectId(),
    category: faker.commerce.department(),
  };
};
module.exports = generaProducto;
