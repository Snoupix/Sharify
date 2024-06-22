import { SERVER_ADDR_DEV } from "$env/static/private";
import { ApolloClient, InMemoryCache } from "@apollo/client/core";

export default new ApolloClient({
    cache: new InMemoryCache(),
    uri: `${SERVER_ADDR_DEV}/sharify`, // TODO: Handle public addr on prod
    name: "sharify-apollo-client",
    queryDeduplication: false,
    defaultOptions: {
        watchQuery: {
            fetchPolicy: "cache-and-network",
        },
        query: {
            errorPolicy: "all",
        },
        mutate: {
            errorPolicy: "all",
        },
    },
});
