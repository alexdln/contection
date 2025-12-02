import { randomUUID } from "crypto";
import { writeFileSync } from "fs";
import path from "path";

const buildId = randomUUID();
writeFileSync(path.resolve("build/BUILD_ID"), buildId);
console.log(`BUILD_ID=${buildId}`);
