const productosModelo = require("./models/products.js")

class ProductsMongoDAO{
  

    async get({},options){
        return await productosModelo.paginate({},options)
    }

    async getBy({...props}){
        return await productosModelo.findOne({...props})
    }

    async create(product){
        

        return await productosModelo.create(product)

    }
    async update(...props){
        

        return await productosModelo.updateOne(...props)

    }
    async delete(id){
        

        return await productosModelo.updateOne(   { deleted: false, _id: id },
            { $set: { deleted: true } })

    }
}
module.exports = ProductsMongoDAO