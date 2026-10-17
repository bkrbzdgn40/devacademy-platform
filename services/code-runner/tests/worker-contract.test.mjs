import test from "node:test";
import assert from "node:assert/strict";
import { processOne, validateWorkerConfig } from "../src/worker-loop.mjs";

const config={
  origin:"http://127.0.0.1:3000",
  token:"a-secret-devacademy-worker-token-long-enough",
  image:"node@sha256:"+"a".repeat(64)
};
const id="2d860ddd-f098-4f61-bcbb-2e06bd836cfa";
const ticket={id,mode:"run",exerciseId:null,exerciseRevision:null,source:"console.log(42)",runtimeId:"nodejs-24",leaseToken:"d".repeat(64)};

test("worker rejects non-local, weak-token and mutable runtime image configuration",()=>{
  assert.throws(()=>validateWorkerConfig({...config,origin:"https://prod.example"}),/LOOPBACK_ONLY/);
  assert.throws(()=>validateWorkerConfig({...config,origin:"http://127.0.0.1:3000/extra"}),/LOOPBACK_ONLY/);
  assert.throws(()=>validateWorkerConfig({...config,token:"bad"}),/TOKEN_INVALID/);
  assert.throws(()=>validateWorkerConfig({...config,image:"node:24-alpine"}),/PINNED_IMAGE_REQUIRED/);
  assert.equal(validateWorkerConfig(config).image,config.image);
});
test("worker claims one job, delegates only source and image, completes using leased capability",async()=>{
  const requests=[];
  const transport=async(url,options)=>{
    assert.equal(options.headers.Authorization,"Bearer "+config.token);
    requests.push({url,options});
    if(url.endsWith("/claim"))return Response.json(ticket);
    if(url.endsWith("/complete"))return Response.json({accepted:true});
    throw Error("Unexpected API path");
  };
  const executions=[];
  const result=await processOne({...config,transport,execute:async(source,options)=>{
    executions.push({source,options});
    return {status:"completed",stdout:"42\\n",stderr:"",exitCode:0,durationMs:85};
  }});
  assert.deepEqual(executions,[{source:ticket.source,options:{image:config.image}}]);
  assert.deepEqual(result,{status:"processed",id,executionStatus:"completed"});
  assert.equal(requests.length,2);
  const body=JSON.parse(requests[1].options.body);
  assert.equal(body.id,id);
  assert.equal(body.leaseToken,ticket.leaseToken);
  assert.equal(body.stdout,"42\\n");
  assert.equal(JSON.stringify(result).includes(config.token),false);
  assert.equal(JSON.stringify(result).includes(ticket.source),false);
});
test("worker handles an empty queue without running or posting anything",async()=>{
  const transport=async(url)=>new Response(null,{status:204});
  const result=await processOne({...config,transport,execute:()=>{throw Error("Should not execute");}});
  assert.deepEqual(result,{status:"idle"});
});
test("worker turns runtime failures into infrastructure_error without exposing error stack",async()=>{
  const payloads=[];
  const transport=async(url,options)=>{
    if(url.endsWith("/claim"))return Response.json(ticket);
    payloads.push(JSON.parse(options.body));
    return Response.json({accepted:true});
  };
  await processOne({...config,transport,execute:async()=>{throw Error("Secret: private");}});
  assert.equal(payloads.length,1);
  assert.equal(payloads[0].status,"infrastructure_error");
  assert.equal(JSON.stringify(payloads[0]).includes("Secret:"),false);
});
test("worker refuses malformed/untrusted claimed payloads",async()=>{
  const transport=async()=>Response.json({...ticket,runtimeId:"python"});
  await assert.rejects(()=>processOne({...config,transport}),/JOB_CONTRACT_INVALID/);
});

const extraImages={pythonImage:"python@sha256:"+"b".repeat(64),
  javaImage:"eclipse-temurin@sha256:"+"c".repeat(64)};
test("worker routes Python and Java assessment tickets to their own pinned images",async()=>{
  for(const [runtimeId,exerciseId,source,key] of [
    ["python-3.12","python.sum-even","def sum_even(numbers):\n return 0","pythonImage"],
    ["java-21","java.clamp","class Solution {static int clamp(int v,int a,int b){return v;}}","javaImage"]
  ]){
    const result={status:"completed",exitCode:0,stdout:"",stderr:"",durationMs:1,
      assessment:{verdict:"failed",passed:0,total:4,publicCases:[
        {label:runtimeId==="python-3.12"?"Pozitif ve negatif karışık":"Üst sınır dışı",passed:false},
        {label:runtimeId==="python-3.12"?"Hiç çift sayı yok":"Alt sınır dışı",passed:false}
      ]}};
    const ticketLang={...ticket,mode:"assess",runtimeId,exerciseId,exerciseRevision:1,source};
    let ran=0,complete=null;
    const transport=async(url,opts)=>{
      if(url.endsWith("/claim"))return Response.json(ticketLang);
      complete=JSON.parse(opts.body);
      return Response.json({accepted:true});
    };
    const processed=await processOne({...config,...extraImages,transport,
      executeLanguage:async(program,opts)=>{
        assert.equal(opts.runtimeId,runtimeId);
        assert.equal(opts.image,extraImages[key]);
        assert.ok(!program.includes("expected"));
        ran++;
        return {status:"completed",stdout:"null",stderr:"",exitCode:0,durationMs:10};
      }});
    assert.equal(processed.status,"processed");
    assert.equal(ran,4);
    assert.equal(complete.assessment.total,4);
    assert.equal(complete.assessment.verdict,"failed");
    assert.ok(!JSON.stringify(complete).includes(source));
  }
});
test("missing pinned language images fail closed and never execute",async()=>{
  const lang={...ticket,mode:"assess",runtimeId:"python-3.12",exerciseId:"python.sum-even",exerciseRevision:1,source:"def sum_even(numbers):\n return 0"};
  let output;
  const transport=async(url,opts)=>{
    if(url.endsWith("/claim"))return Response.json(lang);
    output=JSON.parse(opts.body);return Response.json({accepted:true});
  };
  await processOne({...config,transport,executeLanguage:()=>{throw Error("Never invoked");}});
  assert.equal(output.status,"infrastructure_error");
  assert.equal(output.assessment,null);
  assert.throws(()=>validateWorkerConfig({...config,pythonImage:"python:3.12-alpine"}),/PINNED_PYTHON_IMAGE/);
});
