#!/usr/bin/env -S deno run --allow-net
import { Hono } from "jsr:@hono/hono";
import { bearerAuth } from "jsr:@hono/hono/bearer-auth";
import { z } from "npm:zod";

// --- SERVER ------------------------------------------------------------------

const app = new Hono();

// COPROCESSOR
app.post("/", async (c) => {
  const req = await c.req.json();
  const data = schema.parse(req);

  const result = await handleRequest(data);

  return c.json(result);
});

app.use("/api/*", bearerAuth({ token: "api-key" }));

// MOCK API
app.get("/api/account", (c) => {
  return c.json({ id: "123" });
});

if (import.meta.main) Deno.serve(app.fetch);

// --- HELPERS -----------------------------------------------------------------

// Execution Request schema
const schema = z.object({
  version: z.literal(1),
  stage: z.enum(["ExecutionRequest"]),
  control: z.union([z.literal("continue"), z.object({ break: z.number() })]),
  context: z.object({
    entries: z
      .object({
        "apollo_connectors::sources_in_query_plan": z
          .array(
            z.object({
              subgraph_name: z.string(),
              source_name: z.string(),
            })
          )
          .optional(),
      })
      .passthrough(),
  }),
});

// API key fetcher
export async function handleRequest(
  req: z.infer<typeof schema>
): Promise<z.infer<typeof schema>> {
  const sources =
    req.context.entries["apollo_connectors::sources_in_query_plan"] ?? [];

  await Promise.all(
    sources.map(async (source) => {
      const { subgraph_name, source_name } = source;

      console.log(
        `fetch API key for @source(name: "${source_name}") in ${subgraph_name} subgraph`
      );
      await Promise.resolve();

      req.context.entries.apiKeys = {
        [`${subgraph_name}_${source_name}`]: "api-key",
      };
    })
  );

  return req;
}

// --- TESTS -------------------------------------------------------------------

import { assertEquals } from "jsr:@std/assert/equals";

Deno.test("handleRequest", async () => {
  const result = await handleRequest({
    version: 1,
    stage: "ExecutionRequest",
    control: "continue",
    context: {
      entries: {
        "apollo_connectors::sources_in_query_plan": [
          {
            subgraph_name: "products",
            source_name: "v1",
          },
        ],
      },
    },
  });

  assertEquals(result, {
    version: 1,
    stage: "ExecutionRequest",
    control: "continue",
    context: {
      entries: {
        "apollo_connectors::sources_in_query_plan": [
          {
            subgraph_name: "products",
            source_name: "v1",
          },
        ],
        apiKeys: {
          products_v1: "api-key",
        },
      },
    },
  });
});
