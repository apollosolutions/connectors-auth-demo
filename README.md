# Connectors authorization example

---------------
**The code in this repository is experimental and has been provided for reference purposes only. Community feedback is welcome but this project may not be supported in the same way that repositories in the official [Apollo GraphQL GitHub organization](https://github.com/apollographql) are. If you need help you can file an issue on this repository, [contact Apollo](https://www.apollographql.com/contact-sales) to talk to an expert, or create a ticket directly in Apollo Studio.**
_______________

Requirements:

- [Rover](https://www.apollographql.com/docs/rover/getting-started)
- [Deno](https://docs.deno.com/runtime/getting_started/installation/)

Make a `.env` file:

```sh
cp .env-sample .env
```

Edit the file to add your GraphOS API keys and graphref:

```sh
export APOLLO_KEY=<YOUR API KEY HERE>
export APOLLO_GRAPH_REF=<YOUR GRAPH REF HERE>
export APOLLO_ROVER_DEV_ROUTER_VERSION=2.0.0-preview.1
```

Run the coprocessor (and demo API):

```sh
./coprocessor.ts
```

Run rover dev:

```sh
source .env
rover dev --supergraph-config supergraph.yaml --router-config router.yaml
```

Visit [http://localhost:4000/](http://localhost:4000/) and run this operation:

```graphql
query Me {
  me {
    id
  }
}
```

Use the [Connector Debugger](https://go.apollo.dev/connectors/troubleshooting#return-debug-info-in-graphql-responses) to see that the API request contains a header with the authentication token.