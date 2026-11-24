// Starts the PA#2 server. The bearer tokens are fake (see the contract), so
// never expose this process to the internet on its own.

import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 3000);
const app = createApp();

app.listen({ port, host: "127.0.0.1" }).then(
  (address) => console.log(`Listening on ${address}`),
  (error: unknown) => {
    console.error(error);
    process.exit(1);
  },
);
