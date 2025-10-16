import mongoose from "mongoose";
import { request as playwrightRequest } from "@playwright/test";
import { setupTestData } from "./testData";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3333";

async function waitForServer(url: string, maxAttempts = 60): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const ctx = await playwrightRequest.newContext({ baseURL: url });
      const res = await ctx.get("/health");
      await ctx.dispose();
      if (res.status() === 200) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Server not ready within timeout");
}

async function dropTestDatabase(): Promise<void> {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/citizen_db";
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
}

async function globalSetup() {
  // Ensure server is up (playwright webServer will be starting it)
  await waitForServer(API_BASE_URL);

  // Drop DB and seed fresh data
  await dropTestDatabase();

  const ctx = await playwrightRequest.newContext({ baseURL: API_BASE_URL });
  await setupTestData(ctx as any);
  await ctx.dispose();
}

export default globalSetup;
