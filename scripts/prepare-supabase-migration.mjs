import { readFile, writeFile } from "node:fs/promises";

const [sqlPath, outputPath, projectId, migrationName] = process.argv.slice(2);

if (!sqlPath || !outputPath || !projectId || !migrationName) {
  throw new Error("Usage: node scripts/prepare-supabase-migration.mjs <sqlPath> <outputPath> <projectId> <migrationName>");
}

const query = await readFile(sqlPath, "utf8");
await writeFile(outputPath, JSON.stringify({ project_id: projectId, name: migrationName, query }));
