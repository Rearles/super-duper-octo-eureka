// The Prisma client, bound to the SQLite driver adapter (Prisma 7 architecture).
// SQLite phase: the db lives at repo-root/dev.db (resolved absolutely so the
// server works regardless of cwd). The Postgres migration plan replaces this file.
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./generated/prisma/client";

const here = path.dirname(fileURLToPath(import.meta.url));
const url = process.env["DATABASE_URL"]?.startsWith("postgres")
  ? process.env["DATABASE_URL"]
  : `file:${path.resolve(here, "../dev.db")}`;

const adapter = new PrismaBetterSqlite3({ url });
export const prisma = new PrismaClient({ adapter });
