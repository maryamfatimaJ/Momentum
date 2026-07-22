// Vercel serverless entry point: wraps the same Express app used for local
// dev / traditional hosting (see src/server/createApiApp.ts + server.ts).
// Vercel's Node runtime treats a default-exported Express app as a request
// handler directly -- no app.listen() needed or wanted here.
import { createApiApp } from "../src/server/createApiApp.js";

const app = createApiApp();

export default app;
