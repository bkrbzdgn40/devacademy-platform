// Real isolated runner timings on disposable CI hosts.
// Do not weaken network, process, read-only or per-test container boundaries.
import {performance} from "node:perf_hooks";
import {writeFileSync,appendFileSync} from "node:fs";
import {runIsolatedJavaScript} from "../src/run-isolated.mjs";
import {runIsolatedLanguage} from "../src/run-multilang.mjs";
const workloads=[
  {runtime:"nodejs-24",memoryLimitMiB:128,
    run:()=>runIsolatedJavaScript("console.log(21*2)")},
  {runtime:"python-3.12",memoryLimitMiB:256,
    run:()=>runIsolatedLanguage("print(21*2)",{runtimeId:"python-3.12",image:"python:3.12-alpine"})},
  {runtime:"java-21",memoryLimitMiB:512,
    run:()=>runIsolatedLanguage(
      'public class Main { public static void main(String[] args) { System.out.println(21*2); } }',
      {runtimeId:"java-21",image:"eclipse-temurin:21-jdk-alpine"})}
];
const results=[];
for(const workload of workloads) {
  const times=[];
  for(let i=0;i<3;i++) {
    const start=performance.now();
    const run=await workload.run();
    const elapsed=Math.round(performance.now()-start);
    if(run.status!=="completed"||run.stdout.trim()!=="42")
      throw Error("Runtime benchmark failed: "+workload.runtime+" status "+run.status);
    times.push(elapsed);
  }
  times.sort((a,b)=>a-b);
  results.push({runtime:workload.runtime,samples:3,wallMs:times,
    medianMs:times[1],configuredMemoryLimitMiB:workload.memoryLimitMiB});
}
const report={environment:"isolated GitHub CI Docker",memoryNote:"configured limit, not observed RSS",results};
writeFileSync(new URL("../perf-results.json",import.meta.url),JSON.stringify(report,null,2)+"\n");
console.log("M8.0C runner baseline:",JSON.stringify(report));
if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,
  "\n### M8.0C isolated Docker runtime timing\n\n"+
  "| Runtime | Median wall time | Container memory ceiling |\n|---|---:|---:|\n"+
  results.map(x=>"| "+x.runtime+" | "+x.medianMs+" ms | "+x.configuredMemoryLimitMiB+" MiB |").join("\n")+
  "\n\nMemory numbers are configured ceilings, not measured usage.\n");
