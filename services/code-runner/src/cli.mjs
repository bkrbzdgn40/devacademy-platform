#!/usr/bin/env node
// Local operator-only demonstration, never a public API.
import { readFile } from "node:fs/promises";
import { runIsolatedJavaScript } from "./run-isolated.mjs";
const filename=process.argv[2];
if(!filename){console.error("Usage: node src/cli.mjs <trusted-local-file.js>");process.exit(2);}
try {
  const source=await readFile(filename,"utf8");
  const result=await runIsolatedJavaScript(source);
  console.log(JSON.stringify(result,null,2));
  if(result.status!=="completed")process.exitCode=1;
}catch(error){
  console.error("Runner failed:",error instanceof Error?error.message:"unknown");
  process.exitCode=1;
}
