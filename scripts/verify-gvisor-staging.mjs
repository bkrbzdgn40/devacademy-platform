// Opt-in staging-host canary: authored source only, zero user jobs or secrets.
// Run on a dedicated, disposable Linux host with pre-pulled pinned images.
import {assertSandboxHostReady} from "../services/code-runner/src/sandbox-profile.mjs";
import {validateWorkerConfig} from "../services/code-runner/src/worker-loop.mjs";
import {runIsolatedJavaScript} from "../services/code-runner/src/run-isolated.mjs";
import {runIsolatedLanguage} from "../services/code-runner/src/run-multilang.mjs";

if(process.env.RUNNER_SANDBOX_PROFILE!=="gvisor-staging" ||
   process.env.RUNNER_STAGING_CANARY!=="1" || process.env.NODE_ENV==="production" ||
   process.env.DATABASE_URL || process.env.APP_ORIGIN || process.env.RUNNER_WORKER_TOKEN)
  throw Error("STAGING_CANARY_REFUSES_NONISOLATED_OR_SECRET_BEARING_HOST");

const config=validateWorkerConfig({
  origin:"http://127.0.0.1:3000",token:"temporary-canary-only-token-not-sent-anywhere",
  image:process.env.RUNNER_RUNTIME_IMAGE,
  pythonImage:process.env.RUNNER_PYTHON_RUNTIME_IMAGE,
  javaImage:process.env.RUNNER_JAVA_RUNTIME_IMAGE,
  sandboxProfile:"gvisor-staging"
});
if(!config.pythonImage || !config.javaImage)throw Error("CANARY_REQUIRES_THREE_PINNED_IMAGES");
await assertSandboxHostReady(config.sandboxProfile);
const workloads=[
  ["javascript",()=>runIsolatedJavaScript("console.log(21*2)",{
    image:config.image,sandboxProfile:config.sandboxProfile})],
  ["python",()=>runIsolatedLanguage("print(21*2)",{
    runtimeId:"python-3.12",image:config.pythonImage,sandboxProfile:config.sandboxProfile})],
  ["java",()=>runIsolatedLanguage(
    'public class Main {public static void main(String[] args) {System.out.println(21*2);}}',{
      runtimeId:"java-21",image:config.javaImage,sandboxProfile:config.sandboxProfile})]
];
for(const [runtime,execute] of workloads){
  const result=await execute();
  if(result.status!=="completed"||result.stdout.trim()!=="42")
    throw Error("STAGING_CANARY_FAILED_"+runtime+"_"+result.status);
  console.log("Staging isolated runtime PASS:",runtime);
}
console.log("Staging-only runsc preflight PASS. Public execution remains OFF.");
