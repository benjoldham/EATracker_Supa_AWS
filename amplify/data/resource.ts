import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any unauthenticated user can "create", "read", "update", 
and "delete" any "Todo" records.
=========================================================================*/

const schema = a.schema({
  CareerSave: a
    .model({
      title: a.string().required(),
      preferredFormation: a.string(),
      createdAt: a.datetime(),
    })
        .authorization((allow) => [
      // Any signed-in user can read PlayerMaster (autocomplete)
      allow.authenticated().to(["read"]),

      // Only the owner can create/update/delete (seeding & maintenance)
      allow.owner().to(["create", "update", "delete"]),
    ]),


  Player: a
    .model({
      careerSaveId: a.id().required(), // link to CareerSave

      // Fields your UI likely sends (adjust names to match your app.js / awsClient.js)
      firstName: a.string().required(),
      surname: a.string().required(),
      seniority: a.string(), // "Senior" | "Youth"
      position: a.string(),
      foot: a.string(), // "L" | "R"
      ovrInitial: a.integer(),
      potentialMin: a.integer(),
      potentialMax: a.integer(),
      active: a.string(), // "Y" | "N"
      homegrown: a.boolean(),
      cost: a.float(),
      sale: a.float(),
      currency: a.string(), // "GBP" | "EUR" | "USD"

      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .secondaryIndexes((index) => [
      index("careerSaveId").sortKeys(["createdAt"]),
    ])
    .authorization((allow) => [allow.owner()]),

  PlayerMaster: a
    .model({
      // Raw CSV columns (keep them “dataset-native”)
      shortName: a.string().required(),          // short_name
      nameLower: a.string().required(),          // shortName lowercased for search
      surnameLower: a.string(),                  // surname-only lowercased for search (e.g. "stones")
      playerPositions: a.string().required(),    // player_positions (e.g. "CM,CDM")
      overall: a.integer(),                      // overall
      potential: a.integer(),                    // potential
      age: a.integer(),                          // age
      clubPosition: a.string(),                  // club_position
      nationalityName: a.string(),               // nationality_name
      preferredFoot: a.string(),                 // preferred_foot ("R"|"L")

      // Optional helpful metadata
      version: a.string(),                       // e.g. "FC26"
      createdAt: a.datetime(),
    })
    .secondaryIndexes((index) => [
      // For fast typeahead (filter beginsWith on nameLower)
      index("nameLower").sortKeys(["shortName"]),
    ])
    .authorization((allow) => [
  // any signed-in user can read for autocomplete
  allow.private().to(["read"]),

  // writes remain restricted
  allow.owner().to(["create", "update", "delete"]),
])
,
  
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    additionalAuthorizationModes: ["iam"],
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
