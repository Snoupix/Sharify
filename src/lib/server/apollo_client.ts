import { LOCAL_SERVER_ADDR } from "$env/static/private";
import { ApolloClient, InMemoryCache } from "@apollo/client/core";

export default new ApolloClient({
    cache: new InMemoryCache(),
    uri: `${LOCAL_SERVER_ADDR}/sharify`, // TODO: Handle public addr on prod
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
