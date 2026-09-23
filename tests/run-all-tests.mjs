import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const ROOT = process.cwd();
const TEST_DIR = path.join(ROOT, "tests");
const TIMEOUT_MS = 60_000;

const tests = fs.readdirSync(TEST_DIR)
  .filter(file => file.endsWith(".test.mjs"))
  .sort();

for(const test of tests){
  const file = path.join(TEST_DIR, test);
  console.log(`=== ${test} ===`);

  const child = spawn(process.execPath, [file], {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env
  });

  const result = await new Promise(resolve => {
    let settled = false;
    const finish = value => {
      if(settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      finish({code:null,signal:"SIGTERM",timeout:true});
    }, TIMEOUT_MS);

    child.on("exit", (code, signal) => finish({code,signal,timeout:false}));
    child.on("error", error => finish({code:null,signal:null,timeout:false,error}));
  });

  if(result.timeout){
    console.error(`TEST TIMEOUT: ${test} exceeded ${TIMEOUT_MS}ms`);
    process.exit(1);
  }

  if(result.error){
    console.error(result.error);
    process.exit(1);
  }

  if(result.code !== 0){
    console.error(`TEST FAILED: ${test} (exit=${result.code}, signal=${result.signal || "none"})`);
    process.exit(result.code || 1);
  }
}

console.log(`All ${tests.length} runtime tests passed.`);
