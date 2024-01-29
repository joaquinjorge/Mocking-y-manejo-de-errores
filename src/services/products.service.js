const ProductsMongoDAO = require("../dao/productsMongoDAO.js");

class ProductsService{
    constructor(dao){
        this.dao=new dao()
    }

    async getProducts({},options){
        return await this.dao.get({},options)
    }

    async getProductById({...props}){
        return await this.dao.getBy({...props})
    }

    async createProduct(product){
        return await this.dao.create(product)
    }

    async updateProduct(...props){
        return await this.dao.update(...props)
    }

    async deleteProduct(id){
        return await this.dao.delete(id)
    }
}

const productsService=new ProductsService(ProductsMongoDAO)

module.exports=productsService