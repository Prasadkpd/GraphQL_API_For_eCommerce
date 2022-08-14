const {gql, ApolloServer} = require("apollo-server");
const {RESTDataSource} = require("apollo-datasource-rest");

class ChecAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = "https://api.chec.io/v1/";
    }

    willSendRequest(request) {
        if (!request.headers) {
            request.headers = {};
        }

        request.headers = {
            "X-Authorization": "...",
        }
    }
}

class ProductAPI extends ChecAPI {
    async getProducts(params) {
        const {data} = await this.get("products", params);

        return data;
    }

    async getProduct(id) {
        return this.getProducts(`products/${id}`);
    }
}

const typeDefs = gql`
type Query{
    products(input: ProductsInput):[Product]
    product(input: ProductInput): Product
}
input ProductInput {
    id: ID!
}
input ProductInput {
    limit:Int
    page: Int
    category_slug: String
}
type Product {
    id: ID!
    name: String!
    permalink: String!
}`;

const resolvers = {
    Query: {
        products: (_, {input}, {dataSources: {ProductsAPI}}) => ProductsAPI.getProducts(input),
        product: (_, {input:{id}}, {dataSources: {ProductsAPI}}) => ProductsAPI.getProduct(id),
    },
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({ProductAPI: new ProductAPI()}),
});

server.listen(process.env.PORT || 4000).then(({url}) => {
    console.log(`Server ready at ${url}`)
})
