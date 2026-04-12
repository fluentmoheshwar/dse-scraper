import backend from "./backend/index.js";
import frontend from "./frontend/index.html";

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": frontend,
    "/api": {
      POST: backend,
    },
  },
});

console.log(`Server running at ${server.url}`);
