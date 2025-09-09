import { request as playwrightRequest } from "@playwright/test";
import { setupTestData } from "../tests/setup/testData";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3333";

(async () => {
  const ctx = await playwrightRequest.newContext({ baseURL: API_BASE_URL });
  try {
    console.log("Running setupTestData against:", API_BASE_URL);
    await setupTestData(ctx as any);
    console.log("✅ setupTestData completed");
  } catch (err) {
    console.error("❌ setupTestData failed:", err);
    process.exitCode = 1;
  } finally {
    await ctx.dispose();
  }
})();
