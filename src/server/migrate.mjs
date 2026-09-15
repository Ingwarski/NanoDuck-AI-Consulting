import { readFile } from "node:fs/promises";
import { createConnection } from "mysql2/promise";
import { loadConfig } from "./config.mjs";
import { migrateRuntimeInstructionStorage } from "./runtime-instructions-migration.mjs";

const config = loadConfig();
if (!config.databaseUrl) throw new Error("DATABASE_URL is required to run migrations.");
const ssl = config.databaseSslCaPath
  ? { ca: await readFile(config.databaseSslCaPath, "utf8"), rejectUnauthorized: true }
  : { rejectUnauthorized: true };
const connection = await createConnection({ uri: config.databaseUrl, ssl });
try {
  const schema = await readFile(new URL("./schema.sql", import.meta.url), "utf8");
  for (const statement of schema.split(/;\s*$/mu).map(value => value.trim()).filter(Boolean)) await connection.query(statement);
  const runtimeInstructions = await migrateRuntimeInstructionStorage(connection, config.dataKey, config.runtimeInstructionsBootstrap);
  process.stdout.write(`NanoDuck schema applied. Runtime instructions ${runtimeInstructions.bootstrapped ? "bootstrapped into encrypted database storage" : "left in encrypted database storage"}.\n`);
} finally {
  await connection.end();
}
