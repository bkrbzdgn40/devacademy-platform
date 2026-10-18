// Operator-only, opt-in retention. No scheduler is configured here.
import { cleanupAuthState } from "../apps/web/src/server/auth-maintenance.mjs";
import { database } from "../apps/web/src/server/db.mjs";

const args=process.argv.slice(2);
const valid=args.every(x=>x==="--apply" || /^--batch-size=\d+$/.test(x))
  && args.filter(x=>x==="--apply").length<=1
  && args.filter(x=>x.startsWith("--batch-size=")).length<=1;
if(!valid) {
  console.error("Usage: node scripts/cleanup-auth-state.mjs [--apply] [--batch-size=200]");
  process.exitCode=2;
} else {
  try {
    const apply=args.includes("--apply");
    const size=args.find(x=>x.startsWith("--batch-size="));
    const batchSize=size?Number(size.slice("--batch-size=".length)):200;
    const result=await cleanupAuthState({apply,batchSize});
    console.log(JSON.stringify(result));
    if(!apply)console.log("Dry-run only; use --apply after verifying DATABASE_URL.");
  } catch(error) {
    console.error(error instanceof Error?error.message:"Cleanup failed");
    process.exitCode=1;
  } finally {
    if(process.env.DATABASE_URL)await database().end();
  }
}
