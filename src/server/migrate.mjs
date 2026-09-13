import { readFile } from "node:fs/promises";
import { createConnection } from "mysql2/promise";
import { loadConfig } from "./config.mjs";

const config = loadConfig();
if (!config.databaseUrl) throw new Error("DATABASE_URL is required to run migrations.");
if (!config.databaseSslCaPath) throw new Error("DATABASE_SSL_CA_PATH is required to run migrations.");
const connection = await createConnection({ uri: config.databaseUrl, ssl: { ca: await readFile(config.databaseSslCaPath, "utf8"), rejectUnauthorized: true } });
try {
  const schema = await readFile(new URL("./schema.sql", import.meta.url), "utf8");
  for (const statement of schema.split(/;\s*$/mu).map(value => value.trim()).filter(Boolean)) await connection.query(statement);
  process.stdout.write("NanoDuck schema applied.\n");
} finally {
  await connection.end();
}
