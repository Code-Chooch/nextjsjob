import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

class SafeActionError extends Error {}

export const actionClient = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
    });
  },
  // Can also be an async function.
  handleServerError(e) {
    // Log to console.
    console.error("Safe Action error:", e.message);

    // Rethrow all server errors:
    throw e;
  },
}).use(async ({ next, clientInput, metadata }) => {
  if (process.env.NODE_ENV === "development") {
    console.log("LOGGING MIDDLEWARE");

    const startTime = performance.now();

    // Here we await the action execution.
    const result = await next();

    const endTime = performance.now();

    console.log("Result ->", result);
    console.log("Client input ->", clientInput);
    console.log("Metadata ->", metadata);
    console.log("Action execution took", endTime - startTime, "ms");

    // And then return the result of the awaited action.
    return result;
  }

  return next();
});
