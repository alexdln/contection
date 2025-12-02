import { randomUUID } from "crypto";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";

if (!existsSync(path.resolve("build/BUILD_ID"))) mkdirSync(path.resolve("build"), { recursive: true });

const buildId = randomUUID();
writeFileSync(path.resolve("build/BUILD_ID"), buildId);
console.log(`BUILD_ID=${buildId}`);
